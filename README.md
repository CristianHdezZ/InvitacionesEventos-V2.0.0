# Mis XV Años — Sitio + API en un solo proyecto de Vercel

Este proyecto une la invitación (HTML/CSS/JS estático) y el backend del
RSVP (funciones serverless) en un solo despliegue. Mismo dominio para todo:
`/`, `/admin.html` y `/api/rsvp` conviven juntos, sin CORS ni configuración
extra.

## Estructura

```
/
├── index.html            ← la invitación
├── admin.html             ← panel de confirmaciones (protegido con clave)
├── css/style.css
├── js/script.js
├── assets/
├── api/
│   ├── rsvp.js            ← POST crea confirmación · GET lista (protegido)
│   └── rsvp-export.js     ← GET exporta CSV (protegido)
├── lib/
│   └── store.js           ← guarda en Upstash Redis (o /tmp en local)
├── package.json
└── .env.example
```

**No necesitas `vercel.json`.** Vercel detecta automáticamente:
- todo lo que está en `api/*.js` → funciones serverless (`/api/rsvp`, `/api/rsvp-export`)
- todo lo demás (`index.html`, `css/`, `js/`, `assets/`, `admin.html`) → archivos estáticos servidos tal cual

Si ya tienes un `vercel.json` con `builds`/`routes` apuntando a un `index.js`
(como el que compartiste), bórralo — con esta estructura no hace falta, y
ese `vercel.json` haría que **todo** pase por una sola función Node en vez
de servir los archivos estáticos directamente.

## ⚠️ Por qué cambié el almacenamiento

Tu `server.js` original guardaba las confirmaciones en un archivo JSON en
disco. Eso funciona en un servidor tradicional (Render, Railway, tu propia
máquina), pero **no en Vercel**: las funciones serverless corren en
contenedores efímeros — el disco no persiste entre invocaciones, así que
las confirmaciones se perderían.

`lib/store.js` ahora guarda en **Upstash Redis** (vía su API REST, que
funciona perfecto en serverless) y solo cae a un archivo temporal en local
si no configuraste Upstash — útil para probar rápido, pero avísalo: eso NO
persiste en producción.

## Configurar Upstash (gratis)

1. Ve a **Vercel → tu proyecto → Storage → Marketplace Database Providers**
   y agrega **Upstash** (o crea una cuenta directo en https://upstash.com).
2. Crea una base Redis. Te da dos valores: `UPSTASH_REDIS_REST_URL` y
   `UPSTASH_REDIS_REST_TOKEN`.
3. Si lo agregaste desde el marketplace de Vercel, esas variables ya quedan
   inyectadas automáticamente al proyecto. Si lo creaste aparte, agrégalas
   tú mismo en **Settings → Environment Variables**.

## Variables de entorno (Vercel → Settings → Environment Variables)

| Variable | Para qué |
|---|---|
| `ADMIN_KEY` | contraseña para `/admin.html` y para listar/exportar RSVPs |
| `ALLOWED_ORIGIN` | dominios permitidos para llamar la API (`*` si todo vive en el mismo dominio) |
| `UPSTASH_REDIS_REST_URL` | endpoint de tu base Upstash |
| `UPSTASH_REDIS_REST_TOKEN` | token de tu base Upstash |

Después de agregarlas, vuelve a desplegar (Vercel no las aplica a
despliegues ya hechos).

## Probar en local — SIN cuenta de Vercel

Si todavía no quieres crear cuenta ni vincular el proyecto a Vercel, usa el
servidor local incluido (`dev-server.js`). Reutiliza exactamente los mismos
archivos `api/rsvp.js` y `api/rsvp-export.js` que se desplegarán después, así
que el comportamiento es el mismo:

```bash
npm install
cp .env.example .env   # y completa al menos ADMIN_KEY
npm run dev:local
```

Abre:
- `http://localhost:3000` → la invitación
- `http://localhost:3000/admin.html` → panel de confirmaciones

Sin `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` en tu `.env`, las
confirmaciones se guardan en un archivo temporal — sirve para probar el
flujo, pero no es el almacenamiento definitivo. Cuando quieras datos
persistentes de verdad, configura Upstash (ver más abajo) y listo, sin
cambiar nada de código.

## Probar en local con el CLI de Vercel (opcional, más adelante)

Cuando ya quieras probar exactamente el entorno de producción (o antes de
desplegar), puedes usar el CLI oficial en vez de `dev-server.js`:

```bash
npx vercel dev
```

La primera vez te pedirá iniciar sesión y vincular el proyecto. No es
obligatorio para desarrollar — `dev-server.js` cubre el día a día sin login.

## Desplegar

```bash
vercel        # despliegue de prueba
vercel --prod # despliegue de producción
```

O simplemente conecta el repo de GitHub desde el dashboard de Vercel —
cada push a `main` despliega solo.

## Editar el contenido de la invitación sin tocar código

Entra a `/admin.html`, pestaña **"Editar invitación"** (misma clave que usas
para ver confirmaciones). Desde ahí puedes cambiar:

- **Nombre y apellido** de la quinceañera
- **Fecha y hora del evento** — el día, mes y año que se muestran en la
  invitación y la cuenta regresiva se calculan solos a partir de esta fecha
- **Colores** del sitio (7 tonos: 6 principales + el color del vestido de
  la portada, independiente del resto)
- **Tipografía** — fuente de títulos, fuente del nombre (cursiva) y fuente
  de texto, cada una de una lista curada de Google Fonts; más **tres
  controles de tamaño independientes** (nombre / títulos / mensajes), así
  puedes agrandar el nombre sin tocar el tamaño de los párrafos, por ejemplo
- **Itinerario** — agrega/quita actividades, cada una con su hora y un
  ícono elegido con un **selector visual** (clic sobre el ícono, no un
  desplegable) de una librería de **22 íconos** minimalistas
- **Código de vestimenta** — texto editable, el color a evitar como
  muestra visual independiente del resto de la paleta, y los dos íconos
  (izquierdo/derecho) elegidos con el mismo selector visual
- **Ubicación** — nombre del lugar, dirección, hora, y un botón para
  **generar el mapa automáticamente a partir de la dirección** (con vista
  previa en vivo dentro del mismo panel) — ya no hace falta ir a Google
  Maps a copiar el código de inserción, aunque sigue siendo posible pegar
  tu propia URL de inserción si quieres un pin más exacto
- **Galería de fotos** — lista de URLs de imagen
- **Mensajes** — la frase de la portada y la carta personalizada
- **Hashtag** del footer

Los cambios se guardan en la misma base de Upstash Redis que usan las
confirmaciones (clave `site-config`), y el sitio los lee automáticamente
cada vez que alguien abre la página — no hace falta volver a desplegar.

**Importante sobre la galería:** este panel **no sube archivos**, solo
guarda URLs de imagen. Puedes usar:
- rutas propias del proyecto (`assets/gallery/foto.jpg`, si ya subiste el
  archivo al repo), o
- un enlace externo (Imgur, Cloudinary, un Google Drive con acceso público,
  etc.)

Si más adelante quieres que el panel suba las fotos directamente (sin tener
que alojarlas aparte), se puede agregar integrando un servicio de
almacenamiento como Cloudinary o Vercel Blob — avísame y lo sumamos.

Entra a `https://tu-dominio.vercel.app/admin.html`, escribe la clave que
pusiste en `ADMIN_KEY` y pulsa **Ver confirmaciones**. Desde ahí también
puedes exportar todo a CSV.

## No pude probarlo en vivo

Este entorno donde armé el proyecto no tiene acceso a internet, así que no
pude correr `vercel dev` ni desplegar de verdad para confirmarlo end to end.
Validé la sintaxis de cada archivo, pero si al desplegar ves algún error,
pégame el mensaje del log de Vercel y lo ajustamos.
