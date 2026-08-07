/* ==========================================================
   INVITATION ENGINE V2
   FILE        : bootstrap.js
   VERSION     : 2.1.0
   MODULE      : BOOTSTRAP
========================================================== */

"use strict";

/* ==========================================================
   BOOTSTRAP
========================================================== */

const Bootstrap = {

    initialized: false,

    started: false,

    dependencies: {

        aos: false,

        swiper: false,

        gsap: false,

        confetti: false,

        qrCode: false,

        jspdf: false

    }

};

/* ==========================================================
   INIT
========================================================== */

Bootstrap.init = async function () {

    if (this.initialized) {
        return;
    }

    this.log("Initializing Bootstrap...");

    try {

        /* ==============================
           Detectar librerías
        ============================== */

        this.detectLibraries();

        /* ==============================
           Inicializar librerías
        ============================== */

        this.initializeLibraries();

        /* ==============================
           Cargar configuración
        ============================== */

        await this.loadSiteConfig();

        /* ==============================
           Inicializar aplicación
        ============================== */

        this.initializeApplication();

        /* ==============================
           Finalizar
        ============================== */

        this.finish();

    } catch (error) {

        this.error(error);

    }

};

/* ==========================================================
   CONFIGURACIÓN DEL SITIO

   Se espera a leerla ANTES de inicializar los componentes: así
   el primer pintado ya sale con lo que guardó el panel y no se
   ve el contenido por defecto cambiando un segundo después.

   Si falla, se sigue igualmente: cada partial trae su contenido
   escrito en el HTML, así que el sitio se ve sin la config en
   vez de quedarse en blanco.
========================================================== */

Bootstrap.loadSiteConfig = async function () {

    const config =

        typeof ConfigService !== "undefined"

            ? await ConfigService.load()

            : null;

    /* Sin config el sitio se queda con el contenido del HTML,
       pero hay que resolver igualmente qué ilustración se
       muestra: siguen ocultas tras .artwork-pendiente hasta que
       alguien lo decida. */

    if (!config) {

        if (typeof ContentManager !== "undefined") {

            ContentManager.applyArtwork();

        }

        return;

    }

    /* AppConfig está congelado a propósito: son los valores por
       defecto del motor y no se tocan en caliente. Lo que guardó
       el panel se lee desde ConfigService, y cada componente
       decide qué prefiere —ver Countdown.loadDate(). */

    if (typeof ThemeManager !== "undefined") {

        ThemeManager.apply(config);

    }

    /* El contenido va después del tema: así el texto ya se pinta
       con la tipografía y las escalas definitivas y no se ve un
       reajuste. */

    if (typeof ContentManager !== "undefined") {

        ContentManager.apply(config);

    }

    this.emit("config:loaded", { config });

};

/* ==========================================================
   DETECT LIBRARIES
========================================================== */

Bootstrap.detectLibraries = function () {

    this.dependencies.aos =
        typeof window.AOS !== "undefined";

    this.dependencies.swiper =
        typeof window.Swiper !== "undefined";

    this.dependencies.gsap =
        typeof window.gsap !== "undefined";

    this.dependencies.confetti =
        typeof window.confetti !== "undefined";

    this.dependencies.qrCode =
        typeof window.QRCode !== "undefined";

    this.dependencies.jspdf =
        typeof window.jspdf !== "undefined";

};

/* ==========================================================
   INITIALIZE LIBRARIES
========================================================== */

Bootstrap.initializeLibraries = function () {

    if (this.dependencies.aos) {

        AOS.init({

            once: true,

            duration: AppConfig.animation.duration,

            easing: "ease-out"

        });

    }

};

/* ==========================================================
   INITIALIZE APPLICATION
========================================================== */

Bootstrap.initializeApplication = function () {

    if (

        typeof InvitationApp === "undefined"

    ) {

        this.error("InvitationApp not found.");

        return;

    }

    InvitationApp.init();

    this.started = true;

};

/* ==========================================================
   IS READY
========================================================== */

Bootstrap.isReady = function () {

    return this.started;

};

/* ==========================================================
   GET LIBRARY
========================================================== */

Bootstrap.has = function (library) {

    return !!this.dependencies[library];

};

/* ==========================================================
   WAIT COMPONENT
========================================================== */

Bootstrap.waitComponent = function (

    component,

    callback,

    timeout = 5000

) {

    const started = Date.now();

    const timer = setInterval(() => {

        const instance =

            InvitationApp.getComponent(component);

        if (instance) {

            clearInterval(timer);

            callback(instance);

            return;

        }

        if (

            Date.now() - started >

            timeout

        ) {

            clearInterval(timer);

            console.warn(

                component +

                " timeout."

            );

        }

    }, 100);

};

/* ==========================================================
   EMIT
========================================================== */

Bootstrap.emit = function (

    event,

    detail = {}

) {

    document.dispatchEvent(

        new CustomEvent(

            event,

            {

                detail

            }

        )

    );

};

/* ==========================================================
   FINISH
========================================================== */

Bootstrap.finish = function () {

    this.initialized = true;

    const detail = {

        version: AppConfig.version,

        initialized: true,

        timestamp: Date.now()

    };

    /* =====================================
       Evento para el Loader
    ====================================== */

    document.dispatchEvent(

        new CustomEvent(

            "bootstrap:ready",

            {

                detail

            }

        )

    );

    /* =====================================
       Compatibilidad con el motor
    ====================================== */

    this.emit(

        "bootstrap:ready",

        detail

    );

    this.log("Bootstrap initialized.");

};

/* ==========================================================
   LOG
========================================================== */

Bootstrap.log = function () {

    if (!AppConfig.debug) {

        return;

    }

    console.log(

        "[Bootstrap]",

        ...arguments

    );

};

/* ==========================================================
   ERROR
========================================================== */

Bootstrap.error = function () {

    console.error(

        "[Bootstrap]",

        ...arguments

    );

};

/* ==========================================================
   EXPORT
========================================================== */

window.Bootstrap = Bootstrap;

/* ==========================================================
   AUTO START
========================================================== */

/*if (

    document.readyState === "loading"

) {

    document.addEventListener(

        "DOMContentLoaded",

        () => Bootstrap.init()

    );

} else {

    Bootstrap.init();

}*/

/* ==========================================================
   END OF FILE
========================================================== */