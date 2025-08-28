# 💌 数字情书生成器

一个可以在线生成并分享浪漫「数字情书」的小工具。  
用户填写名字、留言、上传背景图后，就能得到一个 **短链接**，分享给 TA 打开时会看到带背景的浪漫页面。

## ✨ 功能特点
- **短链接分享**：生成的链接简洁，只包含 `?code=xxxx`。
- **云端存储**：情书内容与背景图存储在 Cloudflare KV，不依赖本地缓存，跨设备可见。
- **背景音乐**：进入页面会播放浪漫 BGM（可手动切换开关）。
- **动态特效**：
  - 飘动爱心
  - 流星划过
  - 背景视差动效
- **图片处理**：自动压缩上传的背景图，保证加载速度与体验。

## 🛠 技术栈
- **前端**：HTML + CSS + JavaScript
- **存储**：Cloudflare KV（可扩展到 R2）
- **部署**：Cloudflare Pages Functions


## 🚀 部署步骤

### 1. 准备
- 注册并登录 [Cloudflare](https://www.cloudflare.com/)
- 创建一个 **KV 命名空间**（例如叫 `情书`）

### 2. 绑定 KV
进入 **Pages → Settings → Functions → KV bindings**，新增一条：
- **Variable name**：`LOVE_LETTER`
- **KV namespace**：选择刚刚创建的 `情书`

### 3. 部署
- 将本项目代码推送到 GitHub/GitLab
- 在 Cloudflare Pages 里新建项目，选择该仓库，框架预设为 `静态站点`
- Pages 会自动识别 `/functions/api/*.ts` 并部署为 API

### 4. 访问
部署完成后访问项目地址：https://your-domain.com/  
输入名字、留言并生成链接，短链形如：https://your-domain.com/?code=abcd1234


## ⚙️ 配置项
- **有效期**：默认保存 7 天，修改 `functions/api/save.ts` 中的 `expirationTtl` 可延长或永久保存。
- **音乐**：替换 `assets/bg-music.mp3` 可自定义背景音乐。
- **样式**：修改 `style.css` 可以更换主题色或字体。

## 🔒 注意事项
- 免费版 KV 有存储和读写次数限制，但对个人小项目足够。
- 如果要分享到微信，建议使用 `.com / .net` 域名，或 `.cn` 并备案，否则可能被屏蔽。
- 背景图建议控制在 200KB 左右，加载更快。

---

💡 灵感来自浪漫与代码的结合，让每一句情话都能被更好地传递。
