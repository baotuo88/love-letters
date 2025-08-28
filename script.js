// ===== 数字情书生成器（Cloudflare 版：短链接 + KV 存储） =====

// 随机短码（保留，虽然当前由后端生成，备用）
function generateShortCode() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let s = '';
  for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

// 浮动爱心
function createHearts() {
  const heartsContainer = document.getElementById('floating-hearts');
  const heartCount = 24;
  for (let i = 0; i < heartCount; i++) {
    const heart = document.createElement('div');
    heart.classList.add('heart');
    heart.innerHTML = '❤';
    heart.style.left = `${Math.random() * 100}vw`;
    heart.style.animationDelay = `${Math.random() * 6}s`;
    heartsContainer && heartsContainer.appendChild(heart);
  }
}

// 背景音乐控制
function initBgm(autoplay){
  const audio = document.getElementById('bgm');
  const btn = document.getElementById('music-toggle');
  if(!audio || !btn) return;

  const updateBtn = () => {
    btn.textContent = audio.paused ? '🔈' : '🔊';
    btn.classList.toggle('playing', !audio.paused);
  };
  const resume = () => {
    audio.play().then(updateBtn).catch(()=>{});
    document.removeEventListener('click', resume);
    document.removeEventListener('touchstart', resume);
  };

  btn.onclick = () => {
    (audio.paused ? audio.play() : audio.pause()).finally(updateBtn);
  };

  if(autoplay){
    audio.muted = true;
    audio.play()
      .then(() => { btn.classList.remove('hidden'); audio.muted = false; updateBtn(); })
      .catch(() => {
        btn.classList.remove('hidden'); updateBtn();
        document.addEventListener('click', resume, {once:true});
        document.addEventListener('touchstart', resume, {once:true});
      });

    const unmute = () => {
      audio.muted = false;
      document.removeEventListener('click', unmute);
      document.removeEventListener('touchstart', unmute);
    };
    document.addEventListener('click', unmute, {once:true});
    document.addEventListener('touchstart', unmute, {once:true});
  } else {
    btn.classList.remove('hidden'); updateBtn();
  }
}

// 压缩图片 -> dataURL
function resizeImageFile(file, maxW = 1280, maxH = 1280, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = e => { img.src = e.target.result; };
    reader.onerror = reject;
    img.onload = () => {
      let { width, height } = img;
      const scale = Math.min(maxW / width, maxH / height, 1);
      const w = Math.round(width * scale);
      const h = Math.round(height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      try {
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      } catch (err) { reject(err); }
    };
    img.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// 预览文案
function updatePreview() {
  const fromName = document.getElementById('from-name')?.value || '某人';
  const toName = document.getElementById('to-name')?.value || '某某';
  const message = document.getElementById('message')?.value || '这是一封神秘的情书~';
  const pf = document.getElementById('preview-from'); if (pf) pf.textContent = fromName;
  const pt = document.getElementById('preview-to'); if (pt) pt.textContent = toName;
  const pm = document.getElementById('preview-message'); if (pm) pm.textContent = message;
  const ps = document.getElementById('preview-signature'); if (ps) ps.textContent = fromName;
}

/* ✨ 流星特效（轻量）：每隔几秒划过一条 */
function createMeteor() {
  const meteor = document.createElement('div');
  meteor.className = 'meteor';
  document.body.appendChild(meteor);
  meteor.style.left = Math.random() * window.innerWidth + 'px';
  setTimeout(() => meteor.remove(), 3200);
}

/* ✨ 轻微视差：鼠标/手指移动时，信纸轻轻跟随（仅预览页） */
function initParallax() {
  const panel = document.querySelector('.letter-panel');
  if (!panel) return;
  const handler = (x, y) => {
    const dx = (x / window.innerWidth - 0.5) * 6;  // 位移不超过几像素
    const dy = (y / window.innerHeight - 0.5) * 6;
    panel.style.transform = `translateY(20px) translate(${dx}px, ${dy}px)`; // 叠加进入时的 20px
  };
  window.addEventListener('mousemove', (e) => handler(e.clientX, e.clientY));
  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) handler(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });
}

// toast
function toast(msg) {
  const t = document.getElementById('toast');
  if (!t) return alert(msg);
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

// =========== Cloudflare API 工具 ===========
async function apiSave(payload) {
  const res = await fetch('/api/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('save failed');
  return await res.json(); // { code }
}

async function apiGet(code) {
  const res = await fetch(`/api/get?code=${encodeURIComponent(code)}`);
  if (!res.ok) throw new Error('get failed');
  return await res.json(); // { from,to,msg,bgdata }
}

document.addEventListener('DOMContentLoaded', function() {
  createHearts();

  // 字数统计 & 预览联动（编辑态）
  const textarea = document.getElementById('message');
  const charCount = document.querySelector('.char-count');
  if (textarea && charCount) {
    textarea.addEventListener('input', function() {
      const count = this.value.length;
      charCount.textContent = `${count}/500`;
      charCount.style.color = count > 500 ? '#ffd1d1' : 'rgba(255,255,255,.85)';
      updatePreview();
    });
  }
  ['from-name','to-name','message'].forEach(id => {
    const el = document.getElementById(id);
    el && el.addEventListener('input', updatePreview);
  });
  updatePreview();

  // ===== 图片上传预览（编辑态） =====
  const fileInput = document.getElementById('bg-image');
  const fileNameDisplay = document.getElementById('file-name');
  const previewCard = document.getElementById('preview-card');
  let rawImageFile = null;
  let previewDataUrl = null;

  fileInput && fileInput.addEventListener('change', async function(e) {
    const file = e.target.files[0];
    rawImageFile = null; previewDataUrl = null;
    if (file) {
      if (fileNameDisplay) fileNameDisplay.textContent = file.name;
      rawImageFile = file;
      const reader = new FileReader();
      reader.onload = ev => {
        previewDataUrl = ev.target.result;
        if (previewCard) {
          previewCard.style.backgroundImage = `url(${previewDataUrl})`;
          previewCard.classList.add('has-bg');
        }
      };
      reader.readAsDataURL(file);
    } else {
      if (fileNameDisplay) fileNameDisplay.textContent = '未选择文件';
      if (previewCard) {
        previewCard.style.backgroundImage = '';
        previewCard.classList.remove('has-bg');
      }
    }
  });

  // ===== 生成短链接（编辑态） =====
  const submitBtn = document.getElementById('submit-btn');
  const shareContainer = document.getElementById('share-container');
  const bgHint = document.getElementById('bg-hint');

  submitBtn && submitBtn.addEventListener('click', async function() {
    const fromName = (document.getElementById('from-name').value || '').trim();
    const toName = (document.getElementById('to-name').value || '').trim();
    const message = document.getElementById('message').value || '';
    if (!fromName || !toName || !message) { toast('请填写完整信息！'); return; }
    if (message.length > 500) { toast('消息内容不能超过500字！'); return; }

    submitBtn.innerHTML = '⏳ 生成中...';
    submitBtn.disabled = true;

    try {
      let bgdata = null;
      if (rawImageFile) {
        try {
          bgdata = await resizeImageFile(rawImageFile, 1280, 1280, 0.75);
          // 兜底大小限制，避免 KV 过大
          if (bgdata.length > 300000) {
            bgdata = null;
            toast('背景图已自动省略（过大）。可尝试更小的图片~');
          }
        } catch (e) {
          console.warn('image resize failed', e);
        }
      }

      const { code } = await apiSave({ from: fromName, to: toName, msg: message, bgdata });
      const baseUrl = window.location.href.split('?')[0];
      const shortLink = `${baseUrl}?code=${encodeURIComponent(code)}`;

      const linkInput = document.getElementById('generated-link');
      if (linkInput) linkInput.value = shortLink;
      if (shareContainer) shareContainer.style.display = 'block';

      if (bgHint) {
        if (bgdata) { bgHint.style.display = 'block'; bgHint.textContent = '背景图已上传云端，对方可直接看到。'; }
        else { bgHint.style.display = 'none'; }
      }
    } catch (e) {
      console.error(e);
      toast('生成链接失败，请稍后重试');
    } finally {
      submitBtn.innerHTML = '生成情书链接';
      submitBtn.disabled = false;
    }
  });

  // ===== 分享按钮 =====
  const copyBtn = document.getElementById('copy-btn');
  copyBtn && copyBtn.addEventListener('click', function() {
    const linkInput = document.getElementById('generated-link');
    if (!linkInput || !linkInput.value) return;
    linkInput.select(); linkInput.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(linkInput.value).then(() => toast('已复制到剪贴板'));
  });

  const shareQQ = document.getElementById('share-qq');
  shareQQ && shareQQ.addEventListener('click', function(){
    const link = document.getElementById('generated-link').value;
    const qqUrl = `mqqapi://share/to_fri?file_type=news&src_type=web&version=1&file_data=${encodeURIComponent(JSON.stringify({title:'我为你创建了一封数字情书',desc:'点击查看我为你准备的特别心意',url:link}))}`;
    window.location.href = qqUrl;
  });

  const shareWX = document.getElementById('share-wechat');
  shareWX && shareWX.addEventListener('click', function(){
    const link = document.getElementById('generated-link').value;
    const title = '我为你创建了一封数字情书';
    const desc = '点击查看我为你准备的特别心意';
    const wechatUrl = `weixin://dl/share?url=${encodeURIComponent(link)}&title=${encodeURIComponent(title)}&desc=${encodeURIComponent(desc)}`;
    window.location.href = wechatUrl;
  });

  const shareXHS = document.getElementById('share-xiaohongshu');
  shareXHS && shareXHS.addEventListener('click', function(){
    const link = document.getElementById('generated-link').value;
    const xhsUrl = `xhsdiscover://${encodeURIComponent(link)}?title=${encodeURIComponent('我为你创建了一封数字情书')}`;
    window.location.href = xhsUrl;
    setTimeout(function(){ if(!document.hidden){ window.location.href = `https://www.xiaohongshu.com/explore?note=${encodeURIComponent(link)}`;} }, 3000);
  });

  // ===== 查看模式（仅短码） =====
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');

  if (code) {
    document.body.innerHTML = `
      <div id="bg-fullscreen"></div>
      <div class="floating-hearts" id="floating-hearts"></div>
      <audio id="bgm" src="assets/bg-music.mp3" preload="auto" loop></audio>
      <button id="music-toggle" class="music-btn hidden" aria-label="切换音乐">🔊</button>

      <div class="container">
        <div class="header view-header">
          <h1>💌 你的数字情书</h1>
          <p id="vh-subtitle"></p>
        </div>

        <div class="preview-card" id="view-card">
          <div class="letter-panel">
            <div class="preview-content">
              <div class="preview-header">
                <h2>亲爱的 <span id="vh-to"></span>，</h2>
              </div>
              <div class="preview-text">
                <p><span id="vh-from"></span> 想对你说：</p>
                <p id="vh-msg" style="margin: 14px 0; font-style: italic;"></p>
              </div>
              <div class="preview-signature">
                <p>With Love,</p>
                <p id="vh-sign" style="font-weight:700; margin-top:8px;"></p>
              </div>
            </div>
          </div>
        </div>
      </div>`;

    document.body.classList.add('view-mode');

    (async () => {
      try {
        const data = await apiGet(code);
        const { from = '某人', to = '某某', msg = '这是一封神秘的情书~', bgdata } = data || {};

        const bgLayer = document.getElementById('bg-fullscreen');
        if (bgdata) bgLayer.style.backgroundImage = `url(${bgdata})`;

        document.getElementById('vh-subtitle').textContent = `来自 ${from} 的特别心意`;
        document.getElementById('vh-to').textContent   = to;
        document.getElementById('vh-from').textContent = from;
        const m = document.getElementById('vh-msg');
        m.textContent = msg;
        m.style.whiteSpace = 'pre-line';
        document.getElementById('vh-sign').textContent = from;

        createHearts();
        initBgm(true);
        setInterval(createMeteor, 8000); // 每 8 秒一颗流星
        initParallax();
      } catch (e) {
        console.error(e);
        toast('链接无效或已过期');
      }
    })();
  }
});
