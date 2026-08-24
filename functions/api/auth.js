// functions/api/auth.js
// Inicia el inicio de sesión con GitHub para el panel /admin.
// No necesita nada de ti: usa las variables GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET
// que vas a configurar en Cloudflare Pages (Settings -> Environment variables).

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const clientId = env.GITHUB_CLIENT_ID;
  const redirectUri = `${url.origin}/api/callback`;
  const state = crypto.randomUUID();

  const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
  githubAuthUrl.searchParams.set('client_id', clientId);
  githubAuthUrl.searchParams.set('redirect_uri', redirectUri);
  githubAuthUrl.searchParams.set('scope', 'repo,user');
  githubAuthUrl.searchParams.set('state', state);

  return Response.redirect(githubAuthUrl.toString(), 302);
}
