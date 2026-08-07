const assert = require('node:assert/strict');
const { after, test } = require('node:test');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

process.env.ADMIN_KEY = 'clave-de-prueba';
process.env.ADMIN_SESSION_SECRET = 'secreto-de-prueba';
const storeDir = path.join(os.tmpdir(), `quince-tests-${process.pid}`);
process.env.LOCAL_STORE_DIR = storeDir;

const rsvp = require('../api/rsvp');
const config = require('../api/config');
const adminSession = require('../api/admin-session');

function response() {
  return {
    headers: {},
    statusCode: 200,
    body: null,
    setHeader(name, value) { this.headers[name.toLowerCase()] = value; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
    send(body) { this.body = body; return this; },
    end() { return this; }
  };
}

function request(method, options = {}) {
  return {
    method,
    body: options.body || {},
    query: options.query || {},
    headers: options.headers || {},
    socket: { remoteAddress: options.ip || '127.0.0.1' }
  };
}

test('uses the existing default audio asset', async () => {
  const res = response();
  await config(request('GET'), res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.config.musica, 'assets/music/LaPrincesadePapa.mp3');
});

test('creates an HttpOnly session and protects RSVP listing', async () => {
  const loginRes = response();
  await adminSession(request('POST', { body: { key: 'clave-de-prueba' } }), loginRes);
  assert.equal(loginRes.statusCode, 200);
  assert.match(loginRes.headers['set-cookie'], /HttpOnly/);

  const protectedRes = response();
  await rsvp(request('GET', { headers: { cookie: loginRes.headers['set-cookie'] } }), protectedRes);
  assert.equal(protectedRes.statusCode, 200);
  assert.ok(Array.isArray(protectedRes.body.rsvps));
});

test('atomically accepts only one RSVP for the same normalized phone', async () => {
  const payload = { nombre: 'Ana', telefono: '+57 300 123 4567', asistencia: 'si', mensaje: '' };
  const first = response();
  const second = response();
  await Promise.all([
    rsvp(request('POST', { body: payload, ip: '10.0.0.1' }), first),
    rsvp(request('POST', { body: payload, ip: '10.0.0.2' }), second)
  ]);
  assert.deepEqual([first.statusCode, second.statusCode].sort(), [200, 409]);
});

test('limits repeated RSVP attempts from one address', async () => {
  const results = [];
  for (let index = 0; index < 6; index += 1) {
    const res = response();
    await rsvp(request('POST', {
      ip: '10.0.0.99',
      body: { nombre: `Persona ${index}`, telefono: `30099999${String(index).padStart(2, '0')}`, asistencia: 'no' }
    }), res);
    results.push(res.statusCode);
  }
  assert.equal(results.at(-1), 429);
});

after(async () => {
  await fs.rm(storeDir, { recursive: true, force: true });
});
