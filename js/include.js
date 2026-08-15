/* ==========================================================
   INVITATION ENGINE V2
   FILE        : include.js
   VERSION     : 2.2.0
   MODULE      : HTML INCLUDE LOADER
========================================================== */

"use strict";

/* ==========================================================
   ESTADO INICIAL
========================================================== */

document.documentElement.classList.add("artwork-pendiente");

/* ==========================================================
   PARTIAL LOADER
========================================================== */

class HtmlInclude {

    constructor() {
        this.elements = [
            ...document.querySelectorAll("[data-include]")
        ];
    }

    async load() {

        const requests = this.elements.map(async (element) => {

            const file = element.dataset.include;

            try {

                const response = await fetch(file, {
                    cache: "no-cache"
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                return {
                    element,
                    html: await response.text()
                };

            } catch (error) {

                console.error("[Include]", file, error);

                return {
                    element,
                    html: null
                };

            }

        });

        const partials = await Promise.all(requests);

        partials.forEach(({ element, html }) => {

            if (html !== null) {
                element.outerHTML = html;
            }

        });

    }

}

/* ==========================================================
   CSS
========================================================== */

const STYLES = [

    "https://unpkg.com/aos@2.3.4/dist/aos.css",

    "https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css"

];

/* ==========================================================
   LIBRERÍAS EXTERNAS
========================================================== */

/* Aquí va solo lo que hace falta para pintar la portada. Se cargan
   todas antes de arrancar el motor, así que cada KB de esta lista
   retrasa el primer pintado.

   Antes estaban las nueve —411,6 KB comprimidos— y de esas, dos
   paquetes no se usaban en ninguna parte y tres solo hacían falta si
   el invitado llegaba a confirmar. */

const LIBRARIES = [

    "https://unpkg.com/aos@2.3.4/dist/aos.js",

    "https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js",

    "https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js",

    "https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js"

];

/* ==========================================================
   LIBRERÍAS BAJO DEMANDA

   No se piden al arrancar. Cada una tiene un único sitio que la
   necesita y lo pide con cargarLibreria():

     lottie -> ContentManager.applyLottie(), y solo si el interruptor
               "mostrarLottie" del panel está encendido. Apagado, el
               reproductor ni se descarga.

     jspdf  -> CardService.generate(), al confirmar asistencia. Se
     qrcode    pide ahí y no al pulsar "Descargar tarjeta", porque
               para entonces el PDF ya tiene que estar hecho.

   tsParticles se retiró del todo: sus dos paquetes sumaban 119,7 KB
   y solo aparecían en js/scriptOld.js, que ya no se carga.
========================================================== */

const LIBRERIAS_BAJO_DEMANDA = {

    lottie:
        "https://unpkg.com/@lottiefiles/lottie-player@2.0.8/dist/lottie-player.js",

    qrcode:
        "https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js",

    jspdf:
        "https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js"

};

/* ==========================================================
   CORE + APP (ORDEN OBLIGATORIO)
========================================================== */
const LOADER_PARTIAL="html/partials/loader.html";

const CORE_SCRIPTS = [

    "js/core/config.js",

    "js/managers/component.manager.js",

    "js/managers/theme.manager.js",

    "js/managers/content.manager.js",

    "js/utils/dom.js",

    "js/utils/events.js",

    "js/utils/helpers.js",

    "js/utils/AppStorage.js",

    "js/utils/animations.js",

    "js/services/data.service.js",

    "js/services/config.service.js",

    "js/services/icons.service.js",

    "js/services/form.service.js",

    "js/services/card.service.js",

    "js/core/app.js",

    "js/components/gate.js",

    "js/components/hero.js",

    "js/components/countdown.js",

    "js/components/timeline.js",

    "js/components/gallery.js",

    "js/components/music.js",

    "js/components/modal.js",

    "js/components/rsvp.js",

    "js/components/gifts.js",

    "js/components/playlist.js",

    "js/components/scroll.js",

    "js/core/bootstrap.js"

];

/* ==========================================================
   LOAD STYLE
========================================================== */

function loadStyle(href) {

    return new Promise((resolve) => {

        if (document.querySelector(`link[href="${href}"]`)) {
            resolve();
            return;
        }

        const link = document.createElement("link");

        link.rel = "stylesheet";
        link.href = href;

        link.onload = resolve;
        link.onerror = resolve;

        document.head.appendChild(link);

    });

}

/* ==========================================================
   LOAD SCRIPT
========================================================== */

function loadScript(src) {

    return new Promise((resolve) => {

        if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
        }

        const script = document.createElement("script");

        script.src = src;

        script.onload = resolve;

        script.onerror = () => {

            console.error("[Script]", src);

            resolve();

        };

        document.body.appendChild(script);

    });

}

/* ==========================================================
   CARGA BAJO DEMANDA
========================================================== */

/* Cachea la promesa, no el resultado. loadScript() resuelve al
   momento si ya existe un <script> con esa URL, pero no comprueba si
   todavía se está descargando; si dos sitios piden la misma librería
   a la vez, el segundo seguiría adelante con la librería a medias.
   Guardando la promesa, los dos esperan a la misma descarga. */

const libreriasEnCurso = {};

function cargarLibreria(nombre) {

    const url = LIBRERIAS_BAJO_DEMANDA[nombre];

    if (!url) {

        console.warn("[Libs] no existe:", nombre);

        return Promise.resolve();

    }

    if (!libreriasEnCurso[nombre]) {

        libreriasEnCurso[nombre] = loadScript(url);

    }

    return libreriasEnCurso[nombre];

}

/* Lo consumen CardService y ContentManager, que se cargan como
   scripts sueltos y no comparten ámbito con este archivo. */

window.cargarLibreria = cargarLibreria;

/* ==========================================================
   LOADLOADER
========================================================== */

async function loadLoader() {

    const container = document.getElementById("loader-container");

    if (!container) return;

    try {

        const response = await fetch(LOADER_PARTIAL, {

            cache: "no-cache"

        });

        if (!response.ok) {

            throw new Error("Loader no encontrado.");

        }

        container.innerHTML = await response.text();

    } catch (error) {

        console.error("[Loader]", error);

    }

}

async function loadLoaderScript(){

    await loadScript("js/components/loader.js");

}

/* ==========================================================
   CONFIGURACIÓN INICIAL

   Se deja en window para que la lean tanto el loader —que arranca
   antes de que exista el motor— como ConfigService después.

   Si falla no se hace nada: cada parte tiene sus valores por
   defecto y la invitación se ve igual, solo que sin lo que hubiera
   guardado el panel.
========================================================== */

async function cargarConfigInicial(){

    try{

        const respuesta = await fetch("/api/config", { cache: "no-cache" });

        if(!respuesta.ok){

            return;

        }

        const cuerpo = await respuesta.json();

        if(cuerpo && cuerpo.ok === true && cuerpo.config){

            window.__configInicial = cuerpo.config;

        }

    }

    catch(error){

        /* Sin conexión o API caída: se sigue con los valores del HTML. */

    }

}

/* ==========================================================
   BOOTSTRAP
========================================================== */


/* ==========================================================
   BOOTSTRAP
========================================================== */

async function bootstrap() {

    /* ==========================================
       LOADER
    ========================================== */

    await loadLoader();

    await loadLoaderScript();

    /* La configuración se pide AQUÍ, antes de arrancar el loader, y no
       más tarde en ConfigService.

       El loader es lo primero que se ve y sus textos también se editan
       desde el panel, pero cuando arranca todavía no existe
       ConfigService: se carga con el resto del motor, mucho después.

       No son dos peticiones: lo que se lea aquí queda guardado y
       ConfigService lo reutiliza en vez de volver a pedirlo. */

    await cargarConfigInicial();

    if (window.Loader) {

        Loader.start();

    }

    /* ==========================================
       PARTIALS
    ========================================== */

    const include = new HtmlInclude();

    await include.load();

    /* ==========================================
       CSS
    ========================================== */

    await Promise.all(

        STYLES.map(loadStyle)

    );

    /* ==========================================
       LIBRERÍAS
    ========================================== */

    await Promise.all(

        LIBRARIES.map(loadScript)

    );

    /* ==========================================
       CORE
    ========================================== */

    for (const script of CORE_SCRIPTS) {

        await loadScript(script);

    }

    /* ==========================================
       BOOTSTRAP
    ========================================== */

    if (

        window.Bootstrap &&
        typeof Bootstrap.init === "function"

    ) {

        await Bootstrap.init();

    } else {

        console.error("[Bootstrap] Bootstrap no encontrado.");

    }

}

/* ==========================================================
   START
========================================================== */

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        bootstrap
    );

} else {

    bootstrap();

}

