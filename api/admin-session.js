const crypto = require('crypto');
const { createSession, sessionCookie } = require('../lib/admin-auth');

function sameSecret(input, expected) {
  if (!input || !expected) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const key = req.body?.key;
    if (!sameSecret(key, process.env.ADMIN_KEY || '')) {
      return res.status(401).json({ ok: false, error: 'Clave incorrecta.' });
    }
    const token = createSession();
    res.setHeader('Set-Cookie', sessionCookie(token));
    return res.status(200).json({ ok: true });
  }

  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', sessionCookie('', 0));
    return res.status(204).end();
  }

  return res.status(405).json({ ok: false, error: 'Metodo no permitido' });
};
