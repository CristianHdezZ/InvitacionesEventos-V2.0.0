const crypto = require('crypto');
const { requireAdmin } = require('../lib/admin-auth');
const { saveOAuthState } = require('../lib/store');
const spotify = require('../lib/spotify');

module.exports = async (req, res) => {
  if (!requireAdmin(req, res)) return;

  if (!spotify.configured) {
    return res.status(500).json({ ok: false, error: 'Spotify no esta configurado (faltan variables de entorno).' });
  }

  const state = crypto.randomBytes(16).toString('hex');
  await saveOAuthState(state);

  res.writeHead(302, { Location: spotify.getAuthorizeUrl(state) });
  res.end();
};
