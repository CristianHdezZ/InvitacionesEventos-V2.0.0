/* ==========================================================
   INVITATION ENGINE V2
   FILE        : config.js
   VERSION     : 2.0.2
========================================================== */

"use strict";

/* ==========================================================
   APP CONFIG
========================================================== */

const AppConfig = {

    version: "2.0.2",

    debug: false,

    language: "es",

    timezone: "America/Bogota",

    animationDuration: 800,

    scrollOffset: 80,

    autoPlayMusic: false,

    preloadImages: true,

    lazyLoad: true

};


/* ==========================================================
   THEME CONFIG
========================================================== */

AppConfig.theme = {

    name: "pink-gold",

    colors:{

        primary:"#D79AB0",

        secondary:"#8B4F62",

        gold:"#C79C50"

    }

};


/* ==========================================================
   EVENT CONFIG
========================================================== */

AppConfig.event = {

    type:"xv",

    title:"Mis XV Años",

    /* Fuente de verdad de la fecha. El admin la sobrescribe al
       guardar site-config; si queda null, Countdown cae al
       data-date del contenedor en el HTML. */
    date:"2026-09-19T18:00:00",

    countdown:true,

    gallery:true,

    timeline:true,

    music:true,

    modal:true

};


/* ==========================================================
   GALLERY CONFIG
========================================================== */

AppConfig.gallery={

    autoplay:true,

    delay:3500,

    loop:true,

    speed:700,

    effect:"slide",

    /* 'auto' porque el ancho de cada diapositiva lo fija el CSS
       —.galeria__swiper .swiper-slide, en css/layout/gallery.css—
       a min(280px,70vw). Con un número, Swiper escribe el ancho
       en línea y se lo salta. */

    slidesPerView:"auto",

    spaceBetween:28

};

/* ==========================================================
   MUSIC CONFIG
========================================================== */

AppConfig.music={

    enabled:true,

    autoplay:false,

    loop:true,

    volume:.60,

    fadeIn:true,

    fadeOut:true,

    startMuted:false,

    rememberState:true

};


/* ==========================================================
   HERO CONFIG
========================================================== */

AppConfig.hero={

    showCrown:true,

    showPhoto:true,

    showBadge:true,

    showParents:true,

    showGodParents:true,

    floatingPhoto:true,

    shineEffect:true,

    particles:false

};


/* ==========================================================
   GATE CONFIG
========================================================== */

AppConfig.gate={

    enabled:true,

    openAnimation:"fade",

    closeAnimation:"zoom",

    showEnvelope:true,

    showDress:true,

    showGarlands:true,

    showButterflies:true,

    showSeal:true,

    enableParticles:true,

    autoClose:false

};


/* ==========================================================
   RSVP CONFIG
========================================================== */

AppConfig.rsvp={

    enabled:true,

    whatsapp:true,

    googleMaps:true,

    calendar:true,

    confirmButton:true,

    maxGuests:2

};


/* ==========================================================
   COUNTDOWN CONFIG
========================================================== */

AppConfig.countdown={

    enabled:true,

    showDays:true,

    showHours:true,

    showMinutes:true,

    showSeconds:true,

    expiredMessage:"Ha llegado el gran día"

};


/* ==========================================================
   TIMELINE CONFIG
========================================================== */

AppConfig.timeline={

    enabled:true,

    animated:true,

    revealOnScroll:true,

    showIcons:true,

    showLines:true

};


/* ==========================================================
   MODAL CONFIG
========================================================== */

AppConfig.modal={

    closeOnBackdrop:true,

    closeOnEscape:true,

    animation:"scale",

    lockBodyScroll:true

};


/* ==========================================================
   ANIMATION CONFIG
========================================================== */

AppConfig.animation={

    enabled:true,

    reveal:true,

    duration:700,

    easing:"ease",

    stagger:120

};


/* ==========================================================
   RESPONSIVE CONFIG
========================================================== */

AppConfig.responsive={

    mobile:576,

    tablet:768,

    laptop:992,

    desktop:1200,

    wide:1400

};

/* ==========================================================
   ADMIN CONFIG
========================================================== */

AppConfig.admin={

    enabled:true,

    livePreview:true,

    saveLocal:true,

    autoRefresh:true,

    undoLevels:30,

    allowExport:true,

    allowImport:true

};


/* ==========================================================
   STORAGE CONFIG
========================================================== */

AppConfig.storage={

    prefix:"invitation-engine",

    themeKey:"theme",

    musicKey:"music",

    settingsKey:"settings",

    galleryKey:"gallery"

};


/* ==========================================================
   API CONFIG
========================================================== */

AppConfig.api={

    enabled:true,

    /* Mismo dominio que el sitio: la invitación y las funciones
       serverless se despliegan juntas, así que no hace falta
       origen absoluto ni CORS. */

    endpoint:"/api",

    configPath:"/config",

    timeout:10000,

    retries:2

};


/* ==========================================================
   JSON ENGINE CONFIG
========================================================== */

AppConfig.engine={

    mode:"json",

    autoRender:true,

    autoLoadTheme:true,

    autoLoadGallery:true,

    autoLoadMusic:true,

    autoLoadTimeline:true

};


/* ==========================================================
   DEFAULT DATA
========================================================== */

AppConfig.defaults={

    theme:"pink-gold",

    animation:"fade",

    font:"playfair",

    music:"",

    gallery:[],

    timeline:[],

    countdown:null

};


/* ==========================================================
   FEATURES
========================================================== */

AppConfig.features={

    gate:true,

    hero:true,

    sections:true,

    countdown:true,

    gallery:true,

    modal:true,

    music:true,

    particles:true,

    butterflies:true,

    lottie:false,

    fireworks:false

};


/* ==========================================================
   FREEZE CONFIG
========================================================== */

Object.freeze(AppConfig);

Object.freeze(AppConfig.theme);

Object.freeze(AppConfig.event);

Object.freeze(AppConfig.gallery);

Object.freeze(AppConfig.music);

Object.freeze(AppConfig.hero);

Object.freeze(AppConfig.gate);

Object.freeze(AppConfig.rsvp);

Object.freeze(AppConfig.countdown);

Object.freeze(AppConfig.timeline);

Object.freeze(AppConfig.modal);

Object.freeze(AppConfig.animation);

Object.freeze(AppConfig.responsive);

Object.freeze(AppConfig.admin);

Object.freeze(AppConfig.storage);

Object.freeze(AppConfig.api);

Object.freeze(AppConfig.engine);

Object.freeze(AppConfig.defaults);

Object.freeze(AppConfig.features);


/* ==========================================================
   EXPORT
========================================================== */

window.AppConfig=AppConfig;


/* ==========================================================
   END OF FILE
========================================================== */