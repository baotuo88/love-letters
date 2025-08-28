export const onRequestPost: PagesFunction<{ LOVE_LETTER: KVNamespace }> = async (ctx) => {
  try {
    const { request, env } = ctx;
    const payload = await request.json<any>();
    const from = String(payload?.from || '').slice(0, 40);
    const to   = String(payload?.to   || '').slice(0, 40);
    const msg  = String(payload?.msg  || '').slice(0, 1000);
    let bgdata = payload?.bgdata ? String(payload.bgdata) : null;

    // 兜底限制，避免 value 过大（KV 单 value 上限 25MB，这里保守限制）
    if (bgdata && bgdata.length > 300_000) bgdata = null;

    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const gen = (n:number)=>Array.from({length:n},()=>chars[Math.floor(Math.random()*chars.length)]).join('');
    const code = gen(8);

    const data = JSON.stringify({ from, to, msg, bgdata });
    // 默认 7 天有效；如需长期保存可去掉 expirationTtl 或设置更久
    await env.LOVE_LETTER.put(`loveletter:${code}`, data, { expirationTtl: 60 * 60 * 24 * 7 });

    return new Response(JSON.stringify({ code }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'save failed' }), { status: 500 });
  }
};
