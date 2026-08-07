/* ==========================================================
   INVITATION ENGINE V2
   FILE        : include.js
   VERSION     : 2.1.0
   MODULE      : HTML INCLUDE LOADER
========================================================== */

"use strict";

/* ==========================================================
   ESTADO INICIAL

   Corona, quinceañera y guirnaldas existen dos veces en el
   marcado: el dibujo SVG y la imagen .png. Cuál se muestra lo
   decide la configuración del panel, que llega por red.

   Sin esta marca se veía el dibujo SVG un instante y luego
   saltaba al .png. La clase oculta las dos variantes hasta que
   ContentManager resuelve cuál toca; se retira siempre, tanto
   si la config llega como si falla.
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

                console.error(
                    "[Include]",
                    file,
                    error
                );

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
   JAVASCRIPT
========================================================== */

const SCRIPTS = [

    /* ======================================================
       LIBRERÍAS
    ====================================================== */

    "https://unpkg.com/aos@2.3.4/dist/aos.js",

    "https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js",

    "https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js",

    "https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js",

    "https://cdn.jsdelivr.net/npm/@tsparticles/confetti@3.5.0/tsparticles.confetti.bundle.min.js",

    "https://cdn.jsdelivr.net/npm/@tsparticles/all@3.5.0/tsparticles.all.bundle.min.js",

    "https://unpkg.com/@lottiefiles/lottie-player@2.0.8/dist/lottie-player.js",

    "https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js",

    "https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js",

    /* ======================================================
       CORE
    ====================================================== */

    "js/core/config.js",

   
    /* ======================================================
       MANAGERS
    ====================================================== */

    "js/managers/component.manager.js",

    "js/managers/theme.manager.js",

    "js/managers/content.manager.js",

    /* state.manager.js sigue siendo un archivo de 0 bytes y nada
       referencia StateManager; se queda fuera hasta que tenga
       contenido. Lo mismo con services/storage.service.js. */

     /* ======================================================
       UTILS
    ====================================================== */

    "js/utils/dom.js",

    "js/utils/events.js",

    "js/utils/helpers.js",

    "js/utils/AppStorage.js",

    "js/utils/animations.js",



     /* ======================================================
       SERVICES
    ====================================================== */

    "js/services/data.service.js",

    "js/services/config.service.js",

    "js/services/icons.service.js",

    "js/services/form.service.js",

    "js/services/card.service.js",

    /* ======================================================
        CORE
    ====================================================== */

    "js/core/app.js",


    /* ======================================================
       COMPONENTS

       Van ANTES de bootstrap.js: InvitationApp.registerComponents()
       lee window.Gate, window.Hero, etc. Si bootstrap arranca antes
       de que existan, se registran cero componentes y la app queda
       marcada como inicializada sin haber inicializado nada.
    ====================================================== */

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


    /* ======================================================
       BOOTSTRAP (siempre al final)
    ====================================================== */

    "js/core/bootstrap.js"
];

/* ==========================================================
   LOAD STYLE
========================================================== */

function loadStyle(href) {

    return new Promise((resolve) => {

        if (
            document.querySelector(
                `link[href="${href}"]`
            )
        ) {

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

        if (

            document.querySelector(

                `script[src="${src}"]`

            )

        ) {

            resolve();

            return;

        }

        const script = document.createElement("script");

        script.src = src;

        script.async = false;

        script.defer = false;

        script.onload = resolve;

        script.onerror = () => {

            console.error(

                "[Script]",

                src

            );

            resolve();

        };

        document.body.appendChild(script);

    });

}

/* ==========================================================
   BOOTSTRAP
========================================================== */

async function bootstrap() {

    const include = new HtmlInclude();

    await include.load();

    for (const css of STYLES) {

        await loadStyle(css);

    }

    for (const script of SCRIPTS) {

        await loadScript(script);

    }

    if (

        window.Bootstrap &&

        typeof Bootstrap.init === "function"

    ) {

        await Bootstrap.init();

    } else {

        console.error(

            "[Bootstrap] Bootstrap no fue encontrado."

        );

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