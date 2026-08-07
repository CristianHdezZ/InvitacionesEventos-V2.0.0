/* ==========================================================
   INVITATION ENGINE V2
   FILE        : gate.js
   VERSION     : 2.1.0
   MODULE      : GATE
========================================================== */

"use strict";

/* ==========================================================
   COMPONENT
========================================================== */

const Gate = {

    initialized: false,

    opened: false,

    elements: {},

    config: AppConfig.gate

};

/* ==========================================================
   INIT
========================================================== */

Gate.init = function () {

    if (this.initialized) return;

    if (!this.config.enabled) return;

    this.cache();

    if (!this.elements.gate || !this.elements.button) {

        console.warn("[Gate] Elementos no encontrados.");

        return;

    }

    this.prepare();

    this.bindEvents();

    this.initialized = true;

};

/* ==========================================================
   CACHE
========================================================== */

Gate.cache = function () {

    this.elements.gate = document.getElementById("gate");

    this.elements.button = document.getElementById("gateBtn");

    this.elements.music = document.getElementById("bgMusic");

    this.elements.musicToggle = document.getElementById("musicToggle");

};

/* ==========================================================
   PREPARE
========================================================== */

Gate.prepare = function () {

    document.body.classList.add("gate-active");

};

/* ==========================================================
   EVENTS
========================================================== */

Gate.bindEvents = function () {

    this.elements.button.addEventListener(

        "click",

        () => {

            this.open();

        }

    );

};

/* ==========================================================
   OPEN
========================================================== */

Gate.open = function () {

    if (this.opened) return;

    this.opened = true;

    this.finish();

};

/* ==========================================================
   FINISH
========================================================== */

Gate.finish = function () {

    this.elements.gate.classList.add("is-closed");

    document.body.classList.remove("gate-active");

    window.scrollTo({

        top: 0,

        behavior: "instant"

    });

    this.refreshScrollAnimations();

    this.launchConfetti();

    this.animateHero();

    this.playMusic();

    if (

        window.InvitationApp &&

        typeof InvitationApp.openGate === "function"

    ) {

        InvitationApp.openGate();

    }

};

/* ==========================================================
   CONFETTI
========================================================== */

Gate.launchConfetti = function () {

    if (typeof confetti !== "function") {

        return;

    }

    confetti({

        particleCount: 140,

        spread: 75,

        origin: {

            y: 0.6

        },

        colors: [

            "#E9AABB",

            "#C97D95",

            "#B8935C",

            "#F6D8DF",

            "#FFFFFF"

        ],

        scalar: 0.9

    });

};

/* ==========================================================
   REFRESCAR ANIMACIONES DE SCROLL

   AOS mide la posición de cada elemento en AOS.init(), que corre
   con body.gate-active puesto — y esa clase fija height:100vh y
   overflow:hidden. Con la página bloqueada, todo lo que va
   debajo del sobre queda fuera del alcance de AOS y se queda en
   opacity:0.

   Al cerrar la portada el documento recupera su alto real, pero
   AOS no vuelve a medir por su cuenta y, como el usuario todavía
   no ha hecho scroll, no hay evento que lo despierte: el hero
   entero se quedaba invisible. refreshHard() vuelve a calcular
   posiciones y dispara lo que ya está en pantalla.
========================================================== */

Gate.refreshScrollAnimations = function () {

    if (typeof AOS === "undefined") {

        return;

    }

    requestAnimationFrame(() => {

        AOS.refreshHard();

    });

};

/* ==========================================================
   HERO ANIMATION

   La animación de entrada la define el propio componente Hero;
   aquí solo se le pide que arranque. Antes este método repetía
   las llamadas a gsap sobre .hero__frame y .hero__name, así que
   había dos definiciones de la misma animación y la del
   componente nunca llegaba a correr (Hero.prepare() se rinde
   mientras la portada está abierta).
========================================================== */

Gate.animateHero = function () {

    const hero =

        window.InvitationApp &&

        typeof InvitationApp.getComponent === "function"

            ? InvitationApp.getComponent("hero")

            : window.Hero;

    if (hero && typeof hero.play === "function") {

        hero.play();

    }

};

/* ==========================================================
   PLAY MUSIC
========================================================== */

/* El estado del botón lo lleva el componente de música, que
   escucha los eventos play/pause del propio <audio>. Aquí solo
   se pide que empiece a sonar; antes esta función también
   escribía aria-pressed y aria-label por su cuenta, así que
   había dos dueños del mismo estado. */

Gate.playMusic = function () {

    const music =

        window.InvitationApp &&

        typeof InvitationApp.getComponent === "function"

            ? InvitationApp.getComponent("music")

            : window.Music;

    if (music && typeof music.play === "function") {

        music.play();

        return;

    }

    if (this.elements.music) {

        /* El navegador puede bloquear el autoplay. */

        this.elements.music.play().catch(() => {});

    }

};

/* ==========================================================
   REFRESH
========================================================== */

Gate.refresh = function () {

    this.cache();

};

/* ==========================================================
   DESTROY
========================================================== */

Gate.destroy = function () {

    this.initialized = false;

    this.opened = false;

    this.elements = {};

};

/* ==========================================================
   EXPORT
========================================================== */

window.Gate = Gate;

/* ==========================================================
   END OF FILE
========================================================== */