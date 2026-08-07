/**
 * Servidor local de desarrollo — SOLO para tu máquina.
 * No se usa en producción (Vercel usa /api/*.js directamente, en modo
 * serverless). Este archivo existe únicamente para poder probar el sitio
 * completo (frontend + API) en tu computador sin necesidad de crear
 * cuenta ni iniciar sesión en Vercel.
 *
 * Reutiliza EXACTAMENTE los mismos archivos que se desplegarán
 * (api/rsvp.js y api/rsvp-export.js), así que el comportamiento es el
 * mismo que tendrás en producción.
 */

require('dotenv').config();
const path = require('path');
const express = require('express');

const rsvpHandler = require('./api/rsvp');
const rsvpExportHandler = require('./api/rsvp-export');
const configHandler = require('./api/config');
const adminSessionHandler = require('./api/admin-session');
const musicaHandler = require('./api/musica');
const musicaExportHandler = require('./api/musica-export');
const spotifyAuthHandler = require('./api/spotify-auth');
const spotifyCallbackHandler = require('./api/spotify-callback');

const app = express();
app.use(express.json());

// Estáticos: mismos archivos que Vercel serviría automáticamente.
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
// Parciales de HTML que index.html arma con fetch (ver js/include.js).
app.use('/html', express.static(path.join(__dirname, 'html')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/admin.html', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));

// Mismas funciones que se desplegarán en /api en Vercel.
app.all('/api/rsvp', (req, res) => rsvpHandler(req, res));
app.all('/api/rsvp-export', (req, res) => rsvpExportHandler(req, res));
app.all('/api/config', (req, res) => configHandler(req, res));
app.all('/api/admin-session', (req, res) => adminSessionHandler(req, res));
app.all('/api/musica', (req, res) => musicaHandler(req, res));
app.all('/api/musica-export', (req, res) => musicaExportHandler(req, res));
app.all('/api/spotify-auth', (req, res) => spotifyAuthHandler(req, res));
app.all('/api/spotify-callback', (req, res) => spotifyCallbackHandler(req, res));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Sitio local en          http://localhost:${PORT}`);
  console.log(`   Panel de confirmaciones http://localhost:${PORT}/admin.html`);
  if (!process.env.UPSTASH_REDIS_REST_URL) {
    console.log('   (Upstash no configurado: las confirmaciones se guardan en /tmp, solo para pruebas)');
  }
});
