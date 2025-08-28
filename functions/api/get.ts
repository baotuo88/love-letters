export const onRequestGet: PagesFunction<{ LOVE_LETTER: KVNamespace }> = async (ctx) => {
  try {
    const { request, env } = ctx;
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    if (!code) return new Response('Bad Request', { status: 400 });

    const raw = await env.LOVE_LETTER.get(`loveletter:${code}`);
    if (!raw) return new Response('Not Found', { status: 404 });

    return new Response(raw, { headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'get failed' }), { status: 500 });
  }
};
