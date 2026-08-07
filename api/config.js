const { getConfig, setConfig } = require('../lib/store');
const { requireAdmin } = require('../lib/admin-auth');

// Íconos permitidos — lista cerrada de identificadores de Iconify
// (no texto libre) para no aceptar cualquier ícono público arbitrario
// desde el formulario y mantener el estilo visual coherente. Se usan
// tanto en el itinerario como en la sección de vestimenta.
// Formato: 'set:nombre' — renderizados por <iconify-icon> en el sitio.
const ICONOS_VALIDOS = [
  // Set clásico (mdi) — se mantiene por compatibilidad con configs guardadas
  'mdi:glass-cocktail', 'mdi:church', 'mdi:dance-ballroom', 'mdi:silverware-fork-knife',
  'mdi:heart', 'mdi:gift', 'mdi:clock-outline', 'fa6-solid:person-dress',
  'mdi:tie', 'mdi:ring', 'mdi:flower', 'mdi:butterfly', 'mdi:star-four-points',
  'mdi:diamond-stone', 'mdi:music-note', 'mdi:cake-variant', 'mdi:crown',
  'mdi:hat-fedora', 'mdi:shoe-heel', 'mdi:fan', 'mdi:email-outline', 'mdi:champagne',
  // Trajes y vestidos elegantes (SVG propios) — para el código de vestimenta
  'traje:gala', 'traje:sirena', 'traje:corte-a', 'traje:lazo', 'traje:coctel',
  'traje:esmoquin', 'traje:corbata', 'traje:chaleco',
  'traje:saco-corbata', 'traje:solo-corbata', 'traje:zapatilla', 'traje:tacon', 'traje:escote-v',
  'traje:bailarina',
  // Íconos de Flaticon (autor Magnific) — siluetas profesionales
  'fi:vestido', 'fi:esmoquin', 'fi:silueta', 'fi:baile', 'fi:fiesta', 'fi:arco', 'fi:salon', 'fi:cena', 'fi:copa', 'fi:champan', 'fi:champan2', 'fi:champan3', 'fi:brindis', 'fi:corona', 'fi:pastel', 'fi:pastel2', 'fi:pastel-velas', 'fi:regalo', 'fi:tarjeta-regalo', 'fi:invitacion', 'fi:dj', 'fi:dj2', 'fi:microfono', 'fi:luces', 'fi:escenario', 'fi:reloj',
  'fi:vals', 'fi:sobre', 'fi:reloj-arena', 'fi:reloj2', 'fi:botella',
  // Variantes rellenas (mismo ícono, estilo sólido)
  'fi:sobre-relleno', 'fi:reloj-arena-relleno', 'fi:vals-relleno', 'fi:reloj2-relleno', 'fi:botella-relleno',
  'fi:corona2', 'fi:pastel3'
];

// Mapa de compatibilidad — las configuraciones guardadas antes de este
// cambio usaban nombres internos ('copa', 'vals', etc.) en vez de
// identificadores de Iconify. Este mapa los traduce automáticamente la
// primera vez que se lee una config vieja, para no perder lo ya guardado.
const ICONOS_LEGADO = {
  copa: 'mdi:glass-cocktail', ceremonia: 'mdi:church', vals: 'mdi:dance-ballroom',
  cena: 'mdi:silverware-fork-knife', iglesia: 'mdi:church', corazon: 'mdi:heart',
  regalo: 'mdi:gift', reloj: 'mdi:clock-outline', vestido: 'fa6-solid:person-dress',
  esmoquin: 'mdi:tie', anillo: 'mdi:ring', flor: 'mdi:flower', mariposa: 'mdi:butterfly',
  estrella: 'mdi:star-four-points', diamante: 'mdi:diamond-stone', musica: 'mdi:music-note',
  pastel: 'mdi:cake-variant', corona: 'mdi:crown', sombrero: 'mdi:hat-fedora',
  zapato: 'mdi:shoe-heel', abanico: 'mdi:fan', sobre: 'mdi:email-outline'
};
function migrarIcono(valor) {
  return ICONOS_LEGADO[valor] || valor;
}

// Fuentes permitidas — lista cerrada (no texto libre) para no tener que
// cargar URLs de Google Fonts arbitrarias ni romper el diseño con una
// fuente que no combine.
const ILUSTRACION_TIPOS_VALIDOS = ['svg', 'svg-detallado', 'imagen'];
const SVG_O_IMAGEN_VALIDOS = ['svg', 'imagen'];
const FUENTES_DISPLAY = ['Cormorant Garamond', 'Playfair Display', 'EB Garamond', 'Marcellus'];
const FUENTES_SCRIPT = ['Alex Brush', 'Great Vibes', 'Parisienne', 'Dancing Script', 'Playball'];
const FUENTES_BODY = ['Jost', 'Poppins', 'Montserrat', 'Lato'];
const ESCALAS_VALIDAS = ['xs', 'compacta', 'normal', 'grande', 'xl', 'xxl'];
const ESCALAS_ICONOS_VALIDAS = ['pequeno', 'normal', 'grande2', 'xl'];

const HEX_COLOR = /^#[0-9a-fA-F]{3,8}$/;

// Contenido por defecto — se usa si todavía no se guardó ninguna
// configuración (primer arranque) o si algo falla al leerla.
const DEFAULT_CONFIG = {
  nombre: 'Linda',
  apellido: 'Hernández',
  fechaEvento: '2026-09-19T18:00:00',
  fraseFecha: 'Que se llevará a cabo el día',
  fraseInvitacion: 'Tenemos el honor de invitarlos a la celebración de los XV años de nuestra hija',
  fraseGate: 'Hay momentos inolvidables que se atesoran en el corazón para siempre. Me siento muy feliz de llegar a este momento de mi vida y quiero compartirlo contigo.',
  mensajeCarta: 'Hoy quiero compartir contigo uno de los días más felices de mi vida. Quince años de historias, de risas y de aprender a florecer, y quiero que estés ahí para verlo con tus propios ojos. Esta invitación es un pedacito de mi corazón, hecha con la misma ilusión con la que espero abrazarte ese día.',
  hashtag: '#LindaXV2026',
  footerMensaje: 'Gracias por ser parte de este capítulo',
  fotoPrincipal: 'assets/gallery/Linda04.png',
  lottieGate: 'assets/flor.json',
  musica: 'assets/music/LaPrincesadePapa.mp3',
  ilustracionQuinceanera: {
    tipo: 'svg',
    imagenUrl: '',
    escala: 100
  },
  corona: {
    tipo: 'svg',
    imagenUrl: '',
    escala: 100
  },
  decoracionFloral: {
    // Apaga las guirnaldas en las cuatro posiciones a la vez:
    // arriba y abajo de la portada, y arriba y abajo de la carta.
    mostrar: true,
    tipo: 'svg',
    imagenUrl: '',
    escala: 100,
    opacidad: 100,
    desenfoque: 0,
    saturacion: 100,
    tinte: 0,
    alFrenteArriba: false,
    alFrenteAbajo: false
  },
  // Mariposas decorativas de la portada.
  mostrarMariposas: true,
  // Animación Lottie de la portada. Vaciar lottieGate solo vuelve
  // a la animación por defecto; este interruptor la quita.
  mostrarLottie: true,
  colores: {
    blush: '#FBEAEE',
    blush2: '#F6D8DF',
    rosa: '#E9AABB',
    rosaDeep: '#C97D95',
    vino: '#8B4F62',
    oro: '#B8935C',
    vestido: '#E9AABB',
    icono: '#8B4F62',
    nombre: '#8B4F62',
    apellido: '#C97D95',
    iconoVestimenta: '#8B4F62'
  },
  estilos: {},   // se rellena abajo con estilosPorDefecto()
  tipografia: {
    display: 'Cormorant Garamond',
    script: 'Alex Brush',
    body: 'Jost',
    escalaNombre: 'normal',
    escalaTitulos: 'normal',
    escalaMensajes: 'normal',
    escalaIconos: 'normal',
    fuenteNombre: '',
    fuenteApellido: '',
    escalaApellido: 'normal',
    espacioCorona: 14,
    espacioApellido: 4
  },
  itinerarioAnimado: true,
  disenoTarjetas: false,
  itinerario: [
    { titulo: 'Recepción', hora: '7:00 p.m.', icono: 'fi:copa' },
    { titulo: 'Ceremonia', hora: '7:30 p.m.', icono: 'fi:arco' },
    { titulo: 'Vals', hora: '8:00 p.m.', icono: 'fi:baile' },
    { titulo: 'Cena', hora: '9:00 p.m.', icono: 'fi:cena' }
  ],
  vestimenta: {
    nota: 'Color a evitar: rosa palo — ¡es el mío! 🌹',
    colorEvitar: '#E9AABB',
    iconoColorEvitar: 'mdi:flower',
    iconoIzquierdo: 'fi:vestido',
    iconoDerecho: 'fi:esmoquin',
    iconoIzquierdoImagen: '',
    iconoDerechoImagen: ''
  },
  regalos: {
    activo: true,
    icono: 'fi:regalo',
    titulo: 'Mesa de regalos',
    mensaje: 'Tu presencia es mi mejor regalo. Si además deseas obsequiarme algo, un sobre con tu cariño será recibido con todo el corazón.',
    detalle: ''
  },
  ubicacion: {
    nombreLugar: 'Salón de Eventos Imperial Eventos Deluxe',
    direccion: 'Cr 40ªª Nº 48ª -12 Sector UCO Rionegro- Antioquia',
    hora: '7:00 p.m.',
    mapaEmbedUrl: 'https://www.google.com/maps?q=6.1887244,-75.3635988&z=17&output=embed',
    streetViewUrl: 'https://www.google.com/maps/embed?pb=!4v1784564524946!6m8!1m7!1sCOvTRbTPuU5mPLvsMMZbUw!2m2!1d6.188724376340286!2d-75.36359884954642!3f325.46288285307287!4f8.27229985678568!5f0.7820865974627469',
    mapaLink: 'https://www.google.com/maps/dir/?api=1&destination=6.1887244,-75.3635988',
    mostrarMapa: true,
    mostrarStreetView: true
  },
  galeria: [
    'assets/gallery/Linda02.png',
    'assets/gallery/Linda04.png'
  ]
};

function sanitizeText(value, maxLen, fallback) {
  if (typeof value !== 'string' || !value.trim()) return fallback;
  return value.trim().slice(0, maxLen);
}

function sanitizeColor(value, fallback) {
  return typeof value === 'string' && HEX_COLOR.test(value.trim()) ? value.trim() : fallback;
}

function sanitizeChoice(value, allowed, fallback) {
  return typeof value === 'string' && allowed.includes(value) ? value : fallback;
}

function sanitizeEntero(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

function sanitizeUrl(value, fallback) {
  if (typeof value !== 'string') return fallback;
  const v = value.trim();
  if (!v) return fallback;
  // Bloquea esquemas peligrosos (javascript:, data:, vbscript:); acepta
  // cualquier otra cosa — rutas relativas propias del sitio (con o sin
  // barra inicial), URLs http(s) completas, etc.
  if (/^(javascript|data|vbscript):/i.test(v)) return fallback;
  return v.slice(0, 2000);
}


// Elementos de texto que pueden tener color/fuente/tamaño propios desde el
// admin. Si un valor queda vacío, el elemento hereda el estilo global.
const ELEMENTOS_ESTILO = [
  'nombre', 'apellido', 'fraseInvitacion', 'fraseFecha', 'fraseGate', 'carta', 'hashtag', 'footerMensaje',
  'vestimentaNota', 'regalosTitulo', 'regalosMensaje', 'regalosDetalle',
  'itinerarioTitulo', 'itinerarioHora', 'ubicacionLugar', 'ubicacionDireccion', 'ubicacionHora'
];

function estiloVacio() {
  return { color: '', fuente: '', escala: 'normal' };
}

function estilosPorDefecto() {
  const out = {};
  ELEMENTOS_ESTILO.forEach((k) => { out[k] = estiloVacio(); });
  return out;
}

// Rellenar los estilos por defecto una vez definidas las constantes.
DEFAULT_CONFIG.estilos = estilosPorDefecto();

// Mueve fuente y tamaño de tipografia.* al estilo por elemento, solo
// si este todavía está en su valor por defecto — nunca pisa una
// elección explícita del usuario.
function migrarEstiloGlobal(estilos, tipografia, elemento, claveFuente, claveEscala) {
  const destino = estilos[elemento];
  if (!destino) return;

  if (!destino.fuente && tipografia[claveFuente]) {
    destino.fuente = tipografia[claveFuente];
  }
  tipografia[claveFuente] = '';

  if (destino.escala === 'normal' && tipografia[claveEscala] !== 'normal') {
    destino.escala = tipografia[claveEscala];
  }
  tipografia[claveEscala] = 'normal';
}

function sanitizeEstilos(entrada, defecto) {
  const out = {};
  const fuentesOk = ['', ...FUENTES_SCRIPT, ...FUENTES_DISPLAY, ...FUENTES_BODY];
  ELEMENTOS_ESTILO.forEach((k) => {
    const e = entrada?.[k] || {};
    const d = defecto?.[k] || estiloVacio();
    out[k] = {
      // color vacío = hereda el global
      color: (typeof e.color === 'string' && /^#[0-9A-Fa-f]{6}$/.test(e.color)) ? e.color : (e.color === '' ? '' : d.color),
      fuente: fuentesOk.includes(e.fuente) ? e.fuente : d.fuente,
      escala: ESCALAS_VALIDAS.includes(e.escala) ? e.escala : d.escala
    };
  });
  return out;
}

function sanitizeConfig(body) {
  const d = DEFAULT_CONFIG;
  const b = body || {};

  const colores = {
    blush: sanitizeColor(b?.colores?.blush, d.colores.blush),
    blush2: sanitizeColor(b?.colores?.blush2, d.colores.blush2),
    rosa: sanitizeColor(b?.colores?.rosa, d.colores.rosa),
    rosaDeep: sanitizeColor(b?.colores?.rosaDeep, d.colores.rosaDeep),
    vino: sanitizeColor(b?.colores?.vino, d.colores.vino),
    oro: sanitizeColor(b?.colores?.oro, d.colores.oro),
    vestido: sanitizeColor(b?.colores?.vestido, d.colores.vestido),
    icono: sanitizeColor(b?.colores?.icono, d.colores.icono),
    nombre: sanitizeColor(b?.colores?.nombre, d.colores.nombre),
    apellido: sanitizeColor(b?.colores?.apellido, d.colores.apellido),
    iconoVestimenta: sanitizeColor(b?.colores?.iconoVestimenta, d.colores.iconoVestimenta)
  };

  const tipografia = {
    display: sanitizeChoice(b?.tipografia?.display, FUENTES_DISPLAY, d.tipografia.display),
    script: sanitizeChoice(b?.tipografia?.script, FUENTES_SCRIPT, d.tipografia.script),
    body: sanitizeChoice(b?.tipografia?.body, FUENTES_BODY, d.tipografia.body),
    escalaNombre: sanitizeChoice(b?.tipografia?.escalaNombre, ESCALAS_VALIDAS, d.tipografia.escalaNombre),
    escalaTitulos: sanitizeChoice(b?.tipografia?.escalaTitulos, ESCALAS_VALIDAS, d.tipografia.escalaTitulos),
    escalaMensajes: sanitizeChoice(b?.tipografia?.escalaMensajes, ESCALAS_VALIDAS, d.tipografia.escalaMensajes),
    escalaIconos: sanitizeChoice(b?.tipografia?.escalaIconos, ESCALAS_ICONOS_VALIDAS, d.tipografia.escalaIconos),
    fuenteNombre: sanitizeChoice(b?.tipografia?.fuenteNombre, ['', ...FUENTES_SCRIPT, ...FUENTES_DISPLAY], d.tipografia.fuenteNombre),
    fuenteApellido: sanitizeChoice(b?.tipografia?.fuenteApellido, ['', ...FUENTES_SCRIPT, ...FUENTES_DISPLAY], d.tipografia.fuenteApellido),
    escalaApellido: sanitizeChoice(b?.tipografia?.escalaApellido, ESCALAS_VALIDAS, d.tipografia.escalaApellido),
    espacioCorona: sanitizeEntero(b?.tipografia?.espacioCorona, 0, 120, d.tipografia.espacioCorona),
    espacioApellido: sanitizeEntero(b?.tipografia?.espacioApellido, -30, 120, d.tipografia.espacioApellido)
  };

  const estilos = sanitizeEstilos(b.estilos, estilosPorDefecto());

  // El nombre y el apellido tenían fuente y tamaño en dos sitios del
  // panel: aquí, en "Tipografía", y en su bloque de "Datos
  // principales". Se dejó solo el segundo, así que lo que hubiera
  // guardado en el primero se traslada.
  //
  // Al vaciar el campo de origen la migración no se repite: la
  // siguiente vez ya no hay nada que mover y manda lo que el usuario
  // elija en el bloque que queda.
  migrarEstiloGlobal(estilos, tipografia, 'nombre', 'fuenteNombre', 'escalaNombre');
  migrarEstiloGlobal(estilos, tipografia, 'apellido', 'fuenteApellido', 'escalaApellido');

  const itinerarioAnimado = typeof b.itinerarioAnimado === 'boolean' ? b.itinerarioAnimado : d.itinerarioAnimado;
  const disenoTarjetas = typeof b.disenoTarjetas === 'boolean' ? b.disenoTarjetas : d.disenoTarjetas;
  const mostrarMariposas = typeof b.mostrarMariposas === 'boolean' ? b.mostrarMariposas : d.mostrarMariposas;
  const mostrarLottie = typeof b.mostrarLottie === 'boolean' ? b.mostrarLottie : d.mostrarLottie;

  const itinerario = Array.isArray(b.itinerario)
    ? b.itinerario.slice(0, 10).map((item) => {
        const iconoMigrado = migrarIcono(item?.icono);
        return {
          titulo: sanitizeText(item?.titulo, 60, 'Actividad'),
          hora: sanitizeText(item?.hora, 30, ''),
          icono: ICONOS_VALIDOS.includes(iconoMigrado) ? iconoMigrado : 'mdi:glass-cocktail'
        };
      })
    : d.itinerario;

  const vestimentaIconoIzq = migrarIcono(b?.vestimenta?.iconoIzquierdo);
  const vestimentaIconoDer = migrarIcono(b?.vestimenta?.iconoDerecho);
  const vestimenta = {
    nota: sanitizeText(b?.vestimenta?.nota, 200, d.vestimenta.nota),
    colorEvitar: sanitizeColor(b?.vestimenta?.colorEvitar, d.vestimenta.colorEvitar),
    iconoColorEvitar: ICONOS_VALIDOS.includes(b?.vestimenta?.iconoColorEvitar) ? b?.vestimenta?.iconoColorEvitar : d.vestimenta.iconoColorEvitar,
    iconoIzquierdo: ICONOS_VALIDOS.includes(vestimentaIconoIzq) ? vestimentaIconoIzq : d.vestimenta.iconoIzquierdo,
    iconoDerecho: ICONOS_VALIDOS.includes(vestimentaIconoDer) ? vestimentaIconoDer : d.vestimenta.iconoDerecho,
    iconoIzquierdoImagen: sanitizeUrl(b?.vestimenta?.iconoIzquierdoImagen, d.vestimenta.iconoIzquierdoImagen),
    iconoDerechoImagen: sanitizeUrl(b?.vestimenta?.iconoDerechoImagen, d.vestimenta.iconoDerechoImagen)
  };

  const regalos = {
    activo: typeof b?.regalos?.activo === 'boolean' ? b?.regalos?.activo : d.regalos.activo,
    icono: ICONOS_VALIDOS.includes(b?.regalos?.icono) ? b?.regalos?.icono : d.regalos.icono,
    titulo: sanitizeText(b?.regalos?.titulo, 80, d.regalos.titulo),
    mensaje: sanitizeText(b?.regalos?.mensaje, 400, d.regalos.mensaje),
    detalle: sanitizeText(b?.regalos?.detalle, 300, d.regalos.detalle || '')
  };

  const galeria = Array.isArray(b.galeria)
    ? b.galeria.slice(0, 24).map((url) => sanitizeUrl(url, null)).filter(Boolean)
    : d.galeria;

  // Migración — configuraciones guardadas antes de separar el mapa estático
  // del Street View usaban un único campo (mapaEmbedUrl) que a veces
  // contenía en realidad un embed de Street View (identificable por los
  // parámetros de orientación !3f/!4f de su URL). Si detectamos ese caso y
  // todavía no hay streetViewUrl guardado, migramos el valor al campo nuevo
  // en vez de perderlo.
  const esEmbedStreetView = (url) => typeof url === 'string' && /!3f[\d.]+.*!4f[\d.]+/.test(url);
  let mapaEmbedEntrante = b?.ubicacion?.mapaEmbedUrl;
  let streetViewEntrante = b?.ubicacion?.streetViewUrl;
  if (!streetViewEntrante && esEmbedStreetView(mapaEmbedEntrante)) {
    streetViewEntrante = mapaEmbedEntrante;
    mapaEmbedEntrante = undefined;
  }

  const ubicacion = {
    nombreLugar: sanitizeText(b?.ubicacion?.nombreLugar, 150, d.ubicacion.nombreLugar),
    direccion: sanitizeText(b?.ubicacion?.direccion, 250, d.ubicacion.direccion),
    hora: sanitizeText(b?.ubicacion?.hora, 30, d.ubicacion.hora),
    mapaEmbedUrl: sanitizeUrl(mapaEmbedEntrante, d.ubicacion.mapaEmbedUrl),
    streetViewUrl: sanitizeUrl(streetViewEntrante, d.ubicacion.streetViewUrl),
    mapaLink: sanitizeUrl(b?.ubicacion?.mapaLink, d.ubicacion.mapaLink),
    mostrarMapa: typeof b?.ubicacion?.mostrarMapa === 'boolean' ? b.ubicacion.mostrarMapa : d.ubicacion.mostrarMapa,
    mostrarStreetView: typeof b?.ubicacion?.mostrarStreetView === 'boolean' ? b.ubicacion.mostrarStreetView : d.ubicacion.mostrarStreetView
  };

  let fechaEvento = d.fechaEvento;
  if (typeof b.fechaEvento === 'string' && !isNaN(new Date(b.fechaEvento).getTime())) {
    fechaEvento = b.fechaEvento;
  }

  return {
    nombre: sanitizeText(b.nombre, 60, d.nombre),
    apellido: sanitizeText(b.apellido, 60, d.apellido),
    fechaEvento,
    fraseFecha: sanitizeText(b.fraseFecha, 200, d.fraseFecha),
    fraseInvitacion: sanitizeText(b.fraseInvitacion, 300, d.fraseInvitacion),
    fraseGate: sanitizeText(b.fraseGate, 400, d.fraseGate),
    mensajeCarta: sanitizeText(b.mensajeCarta, 800, d.mensajeCarta),
    hashtag: sanitizeText(b.hashtag, 40, d.hashtag),
    footerMensaje: sanitizeText(b.footerMensaje, 200, d.footerMensaje),
    fotoPrincipal: sanitizeUrl(b.fotoPrincipal, d.fotoPrincipal),
    lottieGate: sanitizeUrl(b.lottieGate, d.lottieGate),
    musica: sanitizeUrl(b.musica, d.musica),
    ilustracionQuinceanera: {
      tipo: sanitizeChoice(b?.ilustracionQuinceanera?.tipo, ILUSTRACION_TIPOS_VALIDOS, d.ilustracionQuinceanera.tipo),
      imagenUrl: sanitizeUrl(b?.ilustracionQuinceanera?.imagenUrl, d.ilustracionQuinceanera.imagenUrl),
      escala: sanitizeEntero(b?.ilustracionQuinceanera?.escala, 30, 250, d.ilustracionQuinceanera.escala)
    },
    corona: {
      tipo: sanitizeChoice(b?.corona?.tipo, SVG_O_IMAGEN_VALIDOS, d.corona.tipo),
      imagenUrl: sanitizeUrl(b?.corona?.imagenUrl, d.corona.imagenUrl),
      escala: sanitizeEntero(b?.corona?.escala, 30, 250, d.corona.escala)
    },
    decoracionFloral: {
      mostrar: typeof b?.decoracionFloral?.mostrar === 'boolean' ? b.decoracionFloral.mostrar : d.decoracionFloral.mostrar,
      tipo: sanitizeChoice(b?.decoracionFloral?.tipo, SVG_O_IMAGEN_VALIDOS, d.decoracionFloral.tipo),
      imagenUrl: sanitizeUrl(b?.decoracionFloral?.imagenUrl, d.decoracionFloral.imagenUrl),
      escala: sanitizeEntero(b?.decoracionFloral?.escala, 30, 250, d.decoracionFloral.escala),
      opacidad: sanitizeEntero(b?.decoracionFloral?.opacidad, 10, 100, d.decoracionFloral.opacidad),
      desenfoque: sanitizeEntero(b?.decoracionFloral?.desenfoque, 0, 10, d.decoracionFloral.desenfoque),
      saturacion: sanitizeEntero(b?.decoracionFloral?.saturacion, 0, 150, d.decoracionFloral.saturacion),
      tinte: sanitizeEntero(b?.decoracionFloral?.tinte, 0, 100, d.decoracionFloral.tinte),
      alFrenteArriba: typeof b?.decoracionFloral?.alFrenteArriba === 'boolean' ? b.decoracionFloral.alFrenteArriba : d.decoracionFloral.alFrenteArriba,
      alFrenteAbajo: typeof b?.decoracionFloral?.alFrenteAbajo === 'boolean' ? b.decoracionFloral.alFrenteAbajo : d.decoracionFloral.alFrenteAbajo
    },
    colores,
    tipografia,
    estilos,
    itinerarioAnimado,
    disenoTarjetas,
    mostrarMariposas,
    mostrarLottie,
    itinerario,
    vestimenta,
    regalos,
    ubicacion,
    galeria: galeria.length ? galeria : d.galeria
  };
}

function setCors(res) {
  if (process.env.ALLOWED_ORIGIN) res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  // Lectura pública: el propio sitio la usa para pintar el contenido.
  if (req.method === 'GET') {
    try {
      const stored = await getConfig();
      // Pasa lo almacenado por sanitizeConfig aunque sea de solo lectura:
      // así se migran identificadores de íconos viejos (copa, vals, ...) a
      // los de Iconify y se rellenan campos que falten en configs antiguas.
      const config = stored ? sanitizeConfig(stored) : DEFAULT_CONFIG;
      return res.status(200).json({ ok: true, config });
    } catch (err) {
      console.error('Error leyendo configuración:', err);
      return res.status(200).json({ ok: true, config: DEFAULT_CONFIG });
    }
  }

  // Escritura protegida: solo con la clave de administrador.
  if (req.method === 'POST') {
    if (!requireAdmin(req, res)) return;

    const config = sanitizeConfig(req.body);
    try {
      await setConfig(config);
      return res.status(200).json({ ok: true, config });
    } catch (err) {
      console.error('Error guardando configuración:', err);
      return res.status(500).json({ ok: false, error: 'No se pudo guardar la configuración.' });
    }
  }

  res.status(405).json({ ok: false, error: 'Método no permitido' });
};
