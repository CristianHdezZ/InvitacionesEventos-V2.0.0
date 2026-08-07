const crypto = require('crypto');

const COOKIE_NAME = 'admin_session';
const SESSION_SECONDS = 60 * 60 * 8;

function parseCookies(header = '') {
  return header.split(';').reduce((cookies, pair) => {
    const index = pair.indexOf('=');
    if (index > 0) cookies[pair.slice(0, index).trim()] = decodeURIComponent(pair.slice(index + 1));
    return cookies;
  }, {});
}

function base64url(value) {
  return Buffer.from(value).toString('base64url');
}

function secret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_KEY || '';
}

function sign(payload) {
  return crypto.createHmac('sha256', secret()).update(payload).digest('base64url');
}

function createSession() {
  if (!secret()) throw new Error('ADMIN_KEY o ADMIN_SESSION_SECRET no esta configurado.');
  const payload = base64url(JSON.stringify({ exp: Date.now() + SESSION_SECONDS * 1000 }));
  return `${payload}.${sign(payload)}`;
}

function validSession(token) {
  if (!token || !secret()) return false;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;
  const expected = sign(payload);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(actualBuffer, expectedBuffer)) return false;
  try { return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')).exp > Date.now(); } catch { return false; }
}

function sessionCookie(token, maxAge = SESSION_SECONDS) {
  const secure = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1' ? '; Secure' : '';
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/api; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure}`;
}

function requireAdmin(req, res) {
  const token = parseCookies(req.headers.cookie)[COOKIE_NAME];
  if (validSession(token)) return true;
  res.status(401).json({ ok: false, error: 'Sesion de administrador requerida.' });
  return false;
}

module.exports = { createSession, sessionCookie, requireAdmin, COOKIE_NAME, SESSION_SECONDS };
