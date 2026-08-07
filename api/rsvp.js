const { createUniqueRsvp, listRsvps, allowRsvpAttempt, hasRedis } = require('../lib/store');
const { requireAdmin } = require('../lib/admin-auth');

function sanitize(value, maxLen) {
  return typeof value === 'string' ? value.trim().slice(0, maxLen) : '';
}

function normalizePhone(value) {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  const plus = trimmed.startsWith('+') ? '+' : '';
  return plus + trimmed.replace(/\D/g, '');
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
    if (!(await allowRsvpAttempt(clientIp(req)))) {
      return res.status(429).json({ ok: false, error: 'Demasiados intentos. Espera un minuto e intentalo de nuevo.' });
    }

    const body = req.body || {};
    if (body._gotcha) return res.status(200).json({ ok: true });

    const nombre = sanitize(body.nombre, 120);
    const telefono = normalizePhone(body.telefono);
    const asistencia = body.asistencia === 'si' || body.asistencia === 'no' ? body.asistencia : null;
    const mensaje = sanitize(body.mensaje, 500);
    const errors = [];
    if (!nombre) errors.push('El nombre es obligatorio.');
    if (telefono.replace('+', '').length < 10) errors.push('Ingresa un telefono valido.');
    if (!asistencia) errors.push('Debes indicar si asistiras.');
    if (errors.length) return res.status(400).json({ ok: false, errors });

    const entry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      nombre,
      telefono,
      asistencia,
      acompanantes: 0,
      mensaje,
      creado: new Date().toISOString()
    };

    try {
      const created = await createUniqueRsvp(telefono, entry);
      if (!created) {
        return res.status(409).json({ ok: false, error: 'Ya existe una confirmacion registrada con este numero de telefono.' });
      }
      return res.status(200).json({ ok: true, id: entry.id });
    } catch (err) {
      console.error('Error guardando RSVP:', err);
      return res.status(500).json({ ok: false, error: 'No se pudo guardar la confirmacion.' });
    }
  }

  if (req.method === 'GET') {
    if (!requireAdmin(req, res)) return;
    const list = await listRsvps();
    const resumen = {
      total: list.length,
      confirman: list.filter((r) => r.asistencia === 'si').length,
      declinan: list.filter((r) => r.asistencia === 'no').length,
      invitados_totales: list.filter((r) => r.asistencia === 'si').length
    };

    return res.status(200).json({
      ok: true,
      resumen,
      rsvps: list.slice().reverse(),
      storage: hasRedis ? 'upstash' : 'local-tmp (no persiste en produccion, configura Upstash)'
    });
  }

  return res.status(405).json({ ok: false, error: 'Metodo no permitido' });
};
