/* ==========================================================
   INVITATION ENGINE V2
   FILE        : scroll.js
   VERSION     : 2.0.0
   MODULE      : SCROLL

   Los tres efectos que dependen del scroll y que se quedaron
   sin dueño al retirar js/scriptOld.js:

     1. Iconos que hacen zoom cada vez que se pasa por ellos,
        subiendo o bajando — no una sola vez como AOS.
     2. La enredadera lateral, que se dibuja según lo que
        llevas recorrido de la página.
     3. El punto del menú lateral correspondiente a la sección
        que estás mirando.

   Todo va con IntersectionObserver salvo la enredadera, que
   necesita el progreso continuo y sí escucha el scroll.
========================================================== */

"use strict";

/* ==========================================================
   COMPONENT
========================================================== */

const Scroll = {

    initialized: false,

    elements: {},

    observers: []

};

/* ==========================================================
   INIT
========================================================== */

Scroll.init = function () {

    if (this.initialized) {

        return;

    }

    this.cache();

    this.revealIcons();

    this.revealTitles();

    this.setupVine();

    this.setupNav();

    this.initialized = true;

};

/* ==========================================================
   CACHE
========================================================== */

Scroll.cache = function () {

    this.elements.vine = document.getElementById("vinePath");

    this.elements.links = [

        ...document.querySelectorAll(".dot-nav a[href^='#']")

    ];

};

/* ==========================================================
   1. ICONOS QUE APARECEN Y DESAPARECEN

   AOS revela una sola vez y se queda. Estos tres bloques se
   encogen al salir de pantalla y vuelven a crecer al entrar,
   en los dos sentidos del scroll.

   Los partials ya no llevan data-aos en estos elementos: con
   los dos sistemas encima, AOS y este observador se pisaban.
========================================================== */

Scroll.REVEAL = [

    "#vestimentaIcons",

    ".regalos__sobre",

    ".ubicacion__icono-wrap"

];

Scroll.revealIcons = function () {

    if (typeof IntersectionObserver === "undefined") {

        return;

    }

    const objetivos = this.REVEAL

        .map(sel => document.querySelector(sel))

        .filter(Boolean);

    if (!objetivos.length) {

        return;

    }

    const reducido = window.matchMedia(

        "(prefers-reduced-motion: reduce)"

    ).matches;

    if (reducido) {

        objetivos.forEach(el => {

            el.style.opacity = "1";

            el.style.transform = "none";

        });

        return;

    }

    const observer = new IntersectionObserver(

        entries => {

            entries.forEach(entry => {

                const dentro = entry.isIntersecting;

                entry.target.style.opacity = dentro ? "1" : "0";

                entry.target.style.transform = dentro

                    ? "scale(1)"

                    : "scale(0.5)";

            });

        },

        { threshold: .35 }

    );

    objetivos.forEach(el => observer.observe(el));

    this.observers.push(observer);

};

/* ==========================================================
   SUBRAYADO DE LOS TÍTULOS

   Pone y quita .is-subrayado en los ocho títulos de sección; el
   filete dorado lo dibuja el CSS de layout/sections.css.

   La clase se quita al salir a propósito, para que el trazo se
   repita en cada pasada, que es como se comportan los demás
   efectos de la invitación.

   Con movimiento reducido no se hace nada: el CSS ya deja el
   filete puesto en ese caso.
========================================================== */

Scroll.revealTitles = function () {

    if (typeof IntersectionObserver === "undefined") {

        return;

    }

    const titulos = [

        ...document.querySelectorAll(".section__title")

    ];

    if (!titulos.length) {

        return;

    }

    const reducido = window.matchMedia(

        "(prefers-reduced-motion: reduce)"

    ).matches;

    if (reducido) {

        return;

    }

    const observer = new IntersectionObserver(

        entries => {

            entries.forEach(entry => {

                entry.target.classList.toggle(

                    "is-subrayado",

                    entry.isIntersecting

                );

            });

        },

        {

            /* Que el título esté bien dentro antes de trazar: con un
               umbral bajo se dispararía asomando por el borde y el
               filete se vería crecer fuera de pantalla. */

            threshold: .6

        }

    );

    titulos.forEach(t => observer.observe(t));

    this.observers.push(observer);

};

/* ==========================================================
   2. ENREDADERA

   El trazo se dibuja bajando stroke-dashoffset desde su largo
   total hasta cero, en proporción a lo recorrido.

   El largo se mide con getTotalLength() en vez de dejarlo fijo
   en el CSS: el 3200 que había puesto no coincidía con el
   camino real, que mide 3006.
========================================================== */

Scroll.setupVine = function () {

    const vine = this.elements.vine;

    if (!vine || typeof vine.getTotalLength !== "function") {

        return;

    }

    const largo = vine.getTotalLength();

    vine.style.strokeDasharray = largo;

    vine.style.strokeDashoffset = largo;

    this.vineLength = largo;

    this.onScroll = this.onScroll.bind(this);

    window.addEventListener(

        "scroll",

        this.onScroll,

        { passive: true }

    );

    window.addEventListener(

        "resize",

        this.onScroll,

        { passive: true }

    );

    this.onScroll();

};

Scroll.onScroll = function () {

    this.updateVine();

};

Scroll.updateVine = function () {

    const vine = this.elements.vine;

    if (!vine) {

        return;

    }

    const recorrido =

        document.documentElement.scrollHeight -

        window.innerHeight;

    const avance = recorrido > 0

        ? Math.min(window.scrollY / recorrido, 1)

        : 0;

    vine.style.strokeDashoffset =

        this.vineLength - (this.vineLength * avance);

};

/* ==========================================================
   3. PUNTO ACTIVO DEL MENÚ

   El CSS ya trae el estilo de .dot-nav a.active —más grande,
   con aro dorado—, pero nadie ponía la clase.

   Se marca la sección que ocupa la franja central de la
   pantalla: con rootMargin se recorta el área visible a esa
   banda, así solo hay una activa a la vez.
========================================================== */

Scroll.setupNav = function () {

    if (

        typeof IntersectionObserver === "undefined" ||

        !this.elements.links.length

    ) {

        return;

    }

    const porSeccion = new Map();

    this.elements.links.forEach(link => {

        const id = link.getAttribute("href").slice(1);

        const seccion = document.getElementById(id);

        if (seccion) {

            porSeccion.set(seccion, link);

        }

    });

    if (!porSeccion.size) {

        return;

    }

    const observer = new IntersectionObserver(

        entries => {

            entries.forEach(entry => {

                const link = porSeccion.get(entry.target);

                if (!link) {

                    return;

                }

                if (entry.isIntersecting) {

                    this.elements.links.forEach(a =>

                        a.classList.remove("active")

                    );

                    link.classList.add("active");

                }

            });

        },

        {

            rootMargin: "-45% 0px -45% 0px",

            threshold: 0

        }

    );

    porSeccion.forEach((link, seccion) => observer.observe(seccion));

    this.observers.push(observer);

};

/* ==========================================================
   REFRESH / DESTROY
========================================================== */

Scroll.refresh = function () {

    this.updateVine();

};

Scroll.destroy = function () {

    this.observers.forEach(o => o.disconnect());

    this.observers = [];

    window.removeEventListener("scroll", this.onScroll);

    window.removeEventListener("resize", this.onScroll);

    this.initialized = false;

    this.elements = {};

};

/* ==========================================================
   EXPORT
========================================================== */

window.Scroll = Scroll;

/* ==========================================================
   END OF FILE
========================================================== */
