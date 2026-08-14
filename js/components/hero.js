/* ==========================================================
   INVITATION ENGINE V2
   FILE        : hero.js
   VERSION     : 2.1.0
   MODULE      : HERO
========================================================== */

"use strict";

/* ==========================================================
   COMPONENT
========================================================== */

const Hero = {

    initialized: false,

    animated: false,

    elements: {}

};

/* ==========================================================
   INIT
========================================================== */

Hero.init = function () {

    if (this.initialized) {

        return;

    }

    this.cache();

    if (!this.elements.hero) {

        return;

    }

    this.prepare();

    this.bindEvents();

    this.initialized = true;

};

/* ==========================================================
   CACHE
========================================================== */

Hero.cache = function () {

    this.elements.hero = document.querySelector(".hero");

    this.elements.eyebrow = document.querySelector(".hero__eyebrow");

    this.elements.crown = document.querySelector(".hero__name-wrapper");

    this.elements.frame = document.querySelector(".hero__frame");

    this.elements.name = document.querySelector(".hero__name");

    this.elements.lastname = document.querySelector(".hero__lastname");

    this.elements.badge = document.querySelector(".hero__badge");

    this.elements.subtitle = document.querySelector(".hero__subtitle");

    this.elements.year = document.querySelector(".hero__year");

};

/* ==========================================================
   PREPARE
========================================================== */

Hero.prepare = function () {

    if (document.body.classList.contains("gate-active")) {

        return;

    }

    this.animate();

};

/* ==========================================================
   EVENTS
========================================================== */

Hero.bindEvents = function () {

    document.addEventListener(

        "visibilitychange",

        () => {

            if (

                document.hidden ||

                !this.initialized ||

                this.animated

            ) {

                return;

            }

            this.animate();

        }

    );

};

/* ==========================================================
   ANIMATE

   Una sola coreografía para toda la entrada del hero. Los
   delays siguen el orden de lectura: eyebrow, foto, corona y
   nombres, subtítulo, fecha y año.

   Este componente es el único dueño de la animación del hero,
   y por eso el partial no lleva atributos data-aos. Con los dos
   sistemas activos AOS dejaba los elementos en opacity:0 y
   gsap.from(), que toma el valor actual como destino, terminaba
   animando de 0 a 0: el hero se quedaba invisible.
========================================================== */

Hero.steps = [

    { key: "eyebrow",  delay: .10, y: -14 },

    { key: "frame",    delay: .25, y: 30 },

    { key: "crown",    delay: .45, y: 18 },

    { key: "name",     delay: .55, y: 20 },

    { key: "lastname", delay: .65, y: 20 },

    { key: "subtitle", delay: .80, y: 15 },

    { key: "badge",    delay: .95, scale: .85 },

    { key: "year",     delay: 1.10, y: 15 }

];

Hero.animate = function () {

    if (this.animated) {

        return;

    }

    this.animated = true;

    if (typeof gsap === "undefined") {

        /* Sin gsap no hay entrada animada, pero el hero ya es
           visible por CSS: no queda nada que reparar. */

        this.burstBadge();

        return;

    }

    this.setupParallax();

    this.steps.forEach(step => {

        const element = this.elements[step.key];

        if (!element) {

            return;

        }

        const vars = {

            duration: step.scale ? .8 : 1,

            opacity: 0,

            ease: step.scale

                ? "back.out(1.5)"

                : "power2.out",

            delay: step.delay

        };

        if (step.y) {

            vars.y = step.y;

        }

        if (step.scale) {

            vars.scale = step.scale;

        }

        gsap.from(element, vars);

    });

    this.burstBadge();

};

/* ==========================================================
   PARALLAX DEL RETRATO

   El marco de la foto se queda algo rezagado al bajar, lo justo
   para que se despegue del texto y la portada tenga profundidad.

   Tres decisiones que conviene no deshacer:

   1. Se mueve el MARCO, no la foto de dentro. La foto es apaisada
      —1402x1122— dentro de un marco de 4/5, así que con
      object-fit:cover no sobra nada por arriba ni por abajo: para
      desplazarla habría que ampliarla todavía más y se perdería
      parte del retrato, que ya va muy recortado.

   2. Se escribe con gsap.set() y no con style.transform. GSAP es
      el único dueño de las animaciones del hero —por eso el
      partial no lleva data-aos—, y usa el mismo canal 'y' que la
      entrada. Escribiendo por fuera se pisarían: es lo que dejaba
      el hero invisible cuando convivían los dos sistemas.

   3. No arranca hasta que la coreografía de entrada termina. Antes
      de eso GSAP está animando ese mismo eje, y meter valores en
      medio cortaría la entrada a la mitad.
========================================================== */

/* Recorrido máximo. Corto a propósito: un parallax que se nota es
   un parallax mal puesto. */

Hero.PARALLAX_MAX = 12;

Hero.setupParallax = function () {

    if (

        typeof gsap === "undefined" ||

        !this.elements.frame ||

        this.parallaxMontado

    ) {

        return;

    }

    if (

        window.matchMedia("(prefers-reduced-motion: reduce)").matches

    ) {

        return;

    }

    this.parallaxMontado = true;

    /* El último paso arranca en 1.10 y dura 1s; se deja un margen. */

    const espera =

        Math.max(...this.steps.map(s => s.delay)) + 1.3;

    gsap.delayedCall(espera, () => {

        this.parallaxListo = true;

        this.updateParallax();

    });

    let pendiente = false;

    const alDesplazar = () => {

        if (pendiente) {

            return;

        }

        pendiente = true;

        requestAnimationFrame(() => {

            pendiente = false;

            this.updateParallax();

        });

    };

    window.addEventListener("scroll", alDesplazar, { passive: true });

    window.addEventListener("resize", alDesplazar, { passive: true });

};

Hero.updateParallax = function () {

    if (!this.parallaxListo || !this.elements.frame) {

        return;

    }

    const caja = this.elements.hero.getBoundingClientRect();

    if (!caja.height) {

        return;

    }

    /* 0 con la portada en su sitio, 1 cuando ya se ha ido del todo
       por arriba. Fuera de ese tramo no hay nada que calcular. */

    const avance = Math.min(

        1,

        Math.max(0, -caja.top / caja.height)

    );

    gsap.set(this.elements.frame, {

        y: avance * this.PARALLAX_MAX

    });

};

/* ==========================================================
   BADGE BURST

   Se dispara una sola vez, justo cuando el badge termina de
   entrar (delay .95s + duración .8s). La clase queda puesta;
   las animaciones no se repiten porque no son infinite.
========================================================== */

Hero.burstBadge = function () {

    const badge = this.elements.badge;

    if (!badge) {

        return;

    }

    const reduced = window.matchMedia(

        "(prefers-reduced-motion: reduce)"

    ).matches;

    if (reduced) {

        return;

    }

    const disparar = () => {

        /* Se quita la clase y se fuerza un reflow antes de
           volver a ponerla: sin eso el navegador no reinicia la
           animación y solo se vería la primera vez. */

        badge.classList.remove("is-bursting");

        void badge.offsetWidth;

        badge.classList.add("is-bursting");

    };

    if (typeof IntersectionObserver === "undefined") {

        setTimeout(disparar, 1800);

        return;

    }

    if (this.badgeObserver) {

        this.badgeObserver.disconnect();

    }

    this.badgeObserver = new IntersectionObserver(

        entries => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    disparar();

                }

            });

        },

        { threshold: .6 }

    );

    this.badgeObserver.observe(badge);

};

/* ==========================================================
   PLAY
========================================================== */

Hero.play = function () {

    this.animate();

};

/* ==========================================================
   REFRESH
========================================================== */

Hero.refresh = function () {

    this.cache();

};

/* ==========================================================
   RESET
========================================================== */

Hero.reset = function () {

    this.animated = false;

};

/* ==========================================================
   DESTROY
========================================================== */

Hero.destroy = function () {

    this.initialized = false;

    this.animated = false;

    this.elements = {};

};

/* ==========================================================
   EXPORT
========================================================== */

window.Hero = Hero;

/* ==========================================================
   END OF FILE
========================================================== */