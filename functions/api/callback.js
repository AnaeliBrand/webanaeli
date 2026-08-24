// functions/api/callback.js
// GitHub redirige aquí después de que autorizas. Este archivo cambia ese
// permiso temporal por un token real, y se lo entrega al panel /admin.
// Nunca expone tu contraseña ni tu client secret al navegador.

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return new Response('Falta el código de autorización de GitHub.', { status: 400 });
  }

  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const tokenData = await tokenRes.json();

  if (tokenData.error || !tokenData.access_token) {
    return new Response(
      'Error al obtener el token de GitHub: ' + (tokenData.error_description || tokenData.error || 'desconocido'),
      { status: 400 }
    );
  }

  const payload = JSON.stringify({ token: tokenData.access_token, provider: 'github' });

  const html = `<!DOCTYPE html>
<html>
<body>
<script>
(function() {
  function receiveMessage(e) {
    window.opener.postMessage(
      'authorization:github:success:${payload.replace(/'/g, "\\'")}',
      e.origin
    );
    window.removeEventListener('message', receiveMessage, false);
  }
  window.addEventListener('message', receiveMessage, false);
  window.opener.postMessage('authorizing:github', '*');
})();
</script>
Ya puedes cerrar esta ventana.
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
