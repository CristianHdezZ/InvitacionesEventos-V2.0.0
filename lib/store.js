const fs = require('fs/promises');
const path = require('path');
const { canonicalPhone } = require('./phone');

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const LIST_KEY = 'rsvps';
const CONFIG_KEY = 'site-config';
const PHONE_KEY_PREFIX = 'rsvp-phone:';
const RATE_KEY_PREFIX = 'rsvp-rate:';
const MUSICA_LIST_KEY = 'musica-sugerencias';
const MUSICA_RATE_PREFIX = 'musica-rate:';
const SPOTIFY_TOKEN_KEY = 'spotify-refresh-token';
const SPOTIFY_STATE_PREFIX = 'spotify-state:';
const LOCAL_DIR = process.env.LOCAL_STORE_DIR || '/tmp';
const LOCAL_FILE = path.join(LOCAL_DIR, 'rsvps.json');
const LOCAL_CONFIG_FILE = path.join(LOCAL_DIR, 'site-config.json');
const LOCAL_MUSICA_FILE = path.join(LOCAL_DIR, 'musica.json');
const LOCAL_SPOTIFY_FILE = path.join(LOCAL_DIR, 'spotify-token.json');
const hasRedis = Boolean(UPSTASH_URL && UPSTASH_TOKEN);

// Interruptor para desarrollo: con LOCAL_STORE=1 los datos de los
// invitados se guardan en disco aunque las credenciales de Upstash
// esten en el entorno.
//
// Hace falta porque dev-server.js carga el .env del proyecto, y ese
// .env trae las credenciales de produccion: sin esto, cada prueba del
// formulario dejaba una confirmacion real en la lista de invitados.
//
// Afecta SOLO a lo que generan los invitados —confirmaciones y
// sugerencias musicales—, que es lo que ensucia. La configuracion del
// sitio se sigue leyendo de Upstash: si tambien fuera a disco, al
// revisar en local se veria el contenido por defecto en vez del que
// esta guardado, que es justo lo que hay que revisar.
//
// En Vercel no se define nunca, asi que produccion no se entera.
const forceLocalStore = process.env.LOCAL_STORE === '1';

const hasRedisGuestData = hasRedis && !forceLocalStore;
let localWrite = Promise.resolve();
const localRateLimits = new Map();
const localOAuthStates = new Map();

async function redisCommand(command) {
  const res = await fetch(UPSTASH_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${UPSTASH_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command)
  });
  if (!res.ok) throw new Error(`Upstash respondio con ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.result;
}

async function readLocalList(file) {
  try { return JSON.parse(await fs.readFile(file, 'utf8')); } catch { return []; }
}

async function writeLocalList(file, list) {
  await fs.mkdir(LOCAL_DIR, { recursive: true });
  await fs.writeFile(file, JSON.stringify(list), 'utf8');
}

function readLocal() { return readLocalList(LOCAL_FILE); }
function writeLocal(list) { return writeLocalList(LOCAL_FILE, list); }

async function createUniqueRsvp(phone, entry) {
  if (hasRedisGuestData) {
    // canon() replica canonicalPhone() de lib/phone.js dentro del
    // script. Hace falta aqui porque la comparacion contra los
    // registros ya guardados ocurre en Redis, y esos registros
    // conservan el formato anterior: sin canonizarlos, quien confirmo
    // como "+573001112233" no coincidiria al volver y se crearia un
    // duplicado. Asi no hay que reescribir nada de lo almacenado.
    //
    // Sigue ejecutandose entero y de forma atomica, que es lo que
    // impide la carrera entre dos envios simultaneos.
    const script = [
      "local function canon(v)",
      "  if not v then return '' end",
      "  local d = string.gsub(tostring(v), '%D', '')",
      "  if string.len(d) == 10 then d = '57' .. d end",
      "  return d",
      "end",
      "if redis.call('EXISTS', KEYS[1]) == 1 then return 0 end",
      "local objetivo = canon(ARGV[1])",
      "for _, raw in ipairs(redis.call('LRANGE', KEYS[2], 0, -1)) do",
      "  local ok, item = pcall(cjson.decode, raw)",
      "  if ok and canon(item['telefono']) == objetivo then",
      "    redis.call('SET', KEYS[1], item['id'] or 'legacy')",
      "    return 0",
      "  end",
      "end",
      "redis.call('SET', KEYS[1], ARGV[2])",
      "redis.call('RPUSH', KEYS[2], ARGV[3])",
      "return 1"
    ].join('\n');
    return Boolean(await redisCommand(['EVAL', script, '2', `${PHONE_KEY_PREFIX}${phone}`, LIST_KEY, phone, entry.id, JSON.stringify(entry)]));
  }

  const operation = localWrite.then(async () => {
    const list = await readLocal();
    // Mismo motivo que en el script de Redis: lo guardado puede venir
    // con el formato anterior, asi que se compara ya canonizado.
    const objetivo = canonicalPhone(phone);
    if (list.some((item) => canonicalPhone(item.telefono) === objetivo)) return false;
    list.push(entry);
    await writeLocal(list);
    return true;
  });
  localWrite = operation.catch(() => undefined);
  return operation;
}

async function listRsvps() {
  if (hasRedisGuestData) {
    const raw = await redisCommand(['LRANGE', LIST_KEY, '0', '-1']);
    return (raw || []).map((item) => JSON.parse(item));
  }
  return readLocal();
}

async function allowRateLimitedAttempt(key, limit, windowSeconds) {
  if (hasRedis) {
    const script = "local count=redis.call('INCR', KEYS[1]); if count == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end return count";
    return Number(await redisCommand(['EVAL', script, '1', key, String(windowSeconds)])) <= limit;
  }
  const now = Date.now();
  const state = localRateLimits.get(key);
  if (!state || state.expiresAt <= now) {
    localRateLimits.set(key, { count: 1, expiresAt: now + windowSeconds * 1000 });
    return true;
  }
  state.count += 1;
  return state.count <= limit;
}

async function allowRsvpAttempt(clientId, limit = 5, windowSeconds = 60) {
  return allowRateLimitedAttempt(`${RATE_KEY_PREFIX}${clientId}`, limit, windowSeconds);
}

async function allowMusicaAttempt(clientId, limit = 5, windowSeconds = 60) {
  return allowRateLimitedAttempt(`${MUSICA_RATE_PREFIX}${clientId}`, limit, windowSeconds);
}

async function addSugerenciaMusical(entry) {
  if (hasRedisGuestData) {
    await redisCommand(['RPUSH', MUSICA_LIST_KEY, JSON.stringify(entry)]);
    return true;
  }
  const operation = localWrite.then(async () => {
    const list = await readLocalList(LOCAL_MUSICA_FILE);
    list.push(entry);
    await writeLocalList(LOCAL_MUSICA_FILE, list);
    return true;
  });
  localWrite = operation.catch(() => undefined);
  return operation;
}

async function listSugerenciasMusicales() {
  if (hasRedisGuestData) {
    const raw = await redisCommand(['LRANGE', MUSICA_LIST_KEY, '0', '-1']);
    return (raw || []).map((item) => JSON.parse(item));
  }
  return readLocalList(LOCAL_MUSICA_FILE);
}

async function getSpotifyRefreshToken() {
  if (hasRedis) return redisCommand(['GET', SPOTIFY_TOKEN_KEY]);
  try { return JSON.parse(await fs.readFile(LOCAL_SPOTIFY_FILE, 'utf8')).refreshToken || null; } catch { return null; }
}

async function setSpotifyRefreshToken(token) {
  if (hasRedis) return redisCommand(['SET', SPOTIFY_TOKEN_KEY, token]);
  await fs.mkdir(LOCAL_DIR, { recursive: true });
  return fs.writeFile(LOCAL_SPOTIFY_FILE, JSON.stringify({ refreshToken: token }), 'utf8');
}

async function saveOAuthState(state, windowSeconds = 600) {
  const key = `${SPOTIFY_STATE_PREFIX}${state}`;
  if (hasRedis) return redisCommand(['SET', key, '1', 'EX', String(windowSeconds)]);
  localOAuthStates.set(key, Date.now() + windowSeconds * 1000);
}

async function consumeOAuthState(state) {
  const key = `${SPOTIFY_STATE_PREFIX}${state}`;
  if (hasRedis) {
    const exists = await redisCommand(['GET', key]);
    if (exists) await redisCommand(['DEL', key]);
    return Boolean(exists);
  }
  const expiresAt = localOAuthStates.get(key);
  localOAuthStates.delete(key);
  return Boolean(expiresAt && expiresAt > Date.now());
}

async function getConfig() {
  if (hasRedis) {
    const raw = await redisCommand(['GET', CONFIG_KEY]);
    return raw ? JSON.parse(raw) : null;
  }
  try { return JSON.parse(await fs.readFile(LOCAL_CONFIG_FILE, 'utf8')); } catch { return null; }
}

async function setConfig(config) {
  if (hasRedis) return redisCommand(['SET', CONFIG_KEY, JSON.stringify(config)]);
  await fs.mkdir(LOCAL_DIR, { recursive: true });
  return fs.writeFile(LOCAL_CONFIG_FILE, JSON.stringify(config), 'utf8');
}

module.exports = {
  createUniqueRsvp,
  listRsvps,
  allowRsvpAttempt,
  getConfig,
  setConfig,
  addSugerenciaMusical,
  listSugerenciasMusicales,
  allowMusicaAttempt,
  getSpotifyRefreshToken,
  setSpotifyRefreshToken,
  saveOAuthState,
  consumeOAuthState,
  hasRedis
};
