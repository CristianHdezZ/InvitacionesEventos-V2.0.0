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

const LIBRARIES = [

    "https://unpkg.com/aos@2.3.4/dist/aos.js",

    "https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js",

    "https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js",

    "https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js",

    "https://cdn.jsdelivr.net/npm/@tsparticles/confetti@3.5.0/tsparticles.confetti.bundle.min.js",

    "https://cdn.jsdelivr.net/npm/@tsparticles/all@3.5.0/tsparticles.all.bundle.min.js",

    "https://unpkg.com/@lottiefiles/lottie-player@2.0.8/dist/lottie-player.js",

    "https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js",

    "https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js"

];

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

