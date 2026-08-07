const { requireAdmin } = require('../lib/admin-auth');
const { consumeOAuthState, setSpotifyRefreshToken } = require('../lib/store');
const spotify = require('../lib/spotify');

function pagina(titulo, mensaje) {
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${titulo}</title>
<style>
  body{ font-family:'Jost',Arial,sans-serif; background:#FBEAEE; color:#6E4B54; display:flex; align-items:center; justify-content:center; min-height:100vh; margin:0; text-align:center; padding:24px; }
  .box{ max-width:420px; }
  h1{ color:#8B4F62; font-size:1.4rem; margin-bottom:12px; }
</style></head>
<body><div class="box"><h1>${titulo}</h1><p>${mensaje}</p></div></body></html>`;
}

module.exports = async (req, res) => {
  if (!requireAdmin(req, res)) return;

  const { code, state, error } = req.query;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  if (error) {
    return res.status(400).send(pagina('Autorizacion cancelada', 'No se completo la conexion con Spotify.'));
  }
  if (!code || !state || !(await consumeOAuthState(state))) {
    return res.status(400).send(pagina('Enlace invalido', 'Este enlace de autorizacion ya se uso o expiro. Vuelve a intentarlo desde el panel.'));
  }

  try {
    const tokens = await spotify.exchangeCodeForTokens(code);
    if (!tokens.refresh_token) {
      return res.status(500).send(pagina('Falta permiso', 'Spotify no devolvio un token de renovacion. Intenta autorizar de nuevo.'));
    }
    await setSpotifyRefreshToken(tokens.refresh_token);
    return res.status(200).send(pagina('¡Conectado con Spotify!', 'Ya puedes cerrar esta pestaña. Las sugerencias de canciones se agregaran automaticamente a tu playlist.'));
  } catch (err) {
    console.error('Error conectando con Spotify:', err);
    return res.status(500).send(pagina('Error', err.message || 'No se pudo completar la conexion con Spotify.'));
  }
};
