const { addSugerenciaMusical, listSugerenciasMusicales, allowMusicaAttempt, getSpotifyRefreshToken, hasRedis } = require('../lib/store');
const { requireAdmin } = require('../lib/admin-auth');
const spotify = require('../lib/spotify');

function sanitize(value, maxLen) {
  return typeof value === 'string' ? value.trim().slice(0, maxLen) : '';
}

async function intentarAgregarASpotify(cancion, artista) {
  if (!spotify.configured) return { agregada: false, motivo: 'Spotify no esta configurado.' };

  const refreshToken = await getSpotifyRefreshToken();
  if (!refreshToken) return { agregada: false, motivo: 'Spotify aun no ha sido autorizado desde el panel.' };

  try {
    const { access_token: accessToken } = await spotify.refreshAccessToken(refreshToken);
    const query = artista ? `${cancion} ${artista}` : cancion;
    const track = await spotify.searchTrack(query, accessToken);
    if (!track) return { agregada: false, motivo: 'No se encontro esa cancion en Spotify.' };
    await spotify.addTrackToPlaylist(track.uri, accessToken);
    return { agregada: true };
  } catch (err) {
    console.error('Error agregando cancion a Spotify:', err);
    return { agregada: false, motivo: err.message };
  }
}

function setCors(res) {
  if (process.env.ALLOWED_ORIGIN) res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  return (typeof forwarded === 'string' ? forwarded.split(',')[0] : req.socket?.remoteAddress || 'unknown').trim();
}

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method === 'POST') {
    if (!(await allowMusicaAttempt(clientIp(req)))) {
      return res.status(429).json({ ok: false, error: 'Demasiados intentos. Espera un minuto e intentalo de nuevo.' });
    }

    const body = req.body || {};
    if (body._gotcha) return res.status(200).json({ ok: true });

    const cancion = sanitize(body.cancion, 150);
    const artista = sanitize(body.artista, 100);
    if (!cancion) return res.status(400).json({ ok: false, errors: ['Escribe el nombre de la cancion.'] });

    const resultadoSpotify = await intentarAgregarASpotify(cancion, artista);

    const entry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      cancion,
      artista,
      enSpotify: resultadoSpotify.agregada,
      spotifyNota: resultadoSpotify.agregada ? '' : resultadoSpotify.motivo,
      creado: new Date().toISOString()
    };

    try {
      await addSugerenciaMusical(entry);
      return res.status(200).json({ ok: true, id: entry.id, enSpotify: entry.enSpotify });
    } catch (err) {
      console.error('Error guardando sugerencia musical:', err);
      return res.status(500).json({ ok: false, error: 'No se pudo guardar la sugerencia.' });
    }
  }

  if (req.method === 'GET') {
    if (!requireAdmin(req, res)) return;
    const list = await listSugerenciasMusicales();
    return res.status(200).json({
      ok: true,
      sugerencias: list.slice().reverse(),
      spotifyConectado: Boolean(await getSpotifyRefreshToken()),
      storage: hasRedis ? 'upstash' : 'local-tmp (no persiste en produccion, configura Upstash)'
    });
  }

  return res.status(405).json({ ok: false, error: 'Metodo no permitido' });
};
