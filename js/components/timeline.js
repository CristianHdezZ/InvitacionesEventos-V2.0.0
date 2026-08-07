/* ==========================================================
   INVITATION ENGINE V2
   FILE        : timeline.js
   VERSION     : 2.1.0
   MODULE      : TIMELINE
========================================================== */

"use strict";

/* ==========================================================
   COMPONENT
========================================================== */

const Timeline = {

    initialized: false,

    elements: {},

    items: []

};

/* ==========================================================
   INIT
========================================================== */

Timeline.init = function () {

    if (this.initialized) {

        return;

    }

    this.cache();

    if (!this.elements.timeline) {

        return;

    }

    this.load();

    this.observe();

    this.bindEvents();

    this.initialized = true;

};

/* ==========================================================
   REVEAL

   Los .timeline__item nacen en opacity:0 y desplazados a la
   izquierda; entran al recibir --visible, escalonados por su
   posición (los transition-delay están en el CSS).

   Nadie ponía esa clase: en V1 lo hacía scriptOld.js y al
   retirarlo el itinerario quedó invisible —solo se veía la
   línea dorada, que es un ::before de la lista.

   La clase se pone Y se quita, así que la entrada se repite
   cada vez que se pasa por la sección, igual que los iconos de
   vestimenta, regalos y ubicación. Antes se dejaba de observar
   al primer paso y el efecto se veía una sola vez.
========================================================== */

Timeline.observe = function () {

    const items = [

        ...this.elements.timeline.querySelectorAll(".timeline__item")

    ];

    if (!items.length) {

        return;

    }

    const reveal = (item, visible = true) =>

        item.classList.toggle(

            "timeline__item--visible",

            visible

        );

    /* Sin IntersectionObserver, o con movimiento reducido, se
       muestran de una vez: mejor visible que animado. */

    const reducido = window.matchMedia(

        "(prefers-reduced-motion: reduce)"

    ).matches;

    if (

        typeof IntersectionObserver === "undefined" ||

        reducido ||

        document.body.classList.contains("itinerario-estatico")

    ) {

        items.forEach(reveal);

        return;

    }

    if (this.observer) {

        this.observer.disconnect();

    }

    this.observer = new IntersectionObserver(

        entries => {

            entries.forEach(entry => {

                reveal(entry.target, entry.isIntersecting);

            });

        },

        {

            threshold: .25,

            rootMargin: "0px 0px -10% 0px"

        }

    );

    items.forEach(item => this.observer.observe(item));

};

/* ==========================================================
   CACHE
========================================================== */

Timeline.cache = function () {

    this.elements.timeline = document.querySelector(".timeline");

};

/* ==========================================================
   LOAD
========================================================== */

/* ==========================================================
   LOAD

   El itinerario lo edita el panel de admin. Si no hay config
   —o falla la petición— se deja el que ya viene escrito en el
   partial, que es contenido válido y no un hueco.

   Antes esto leía DataService.getTimeline(), un método que no
   existe, así que items quedaba vacío siempre.
========================================================== */

Timeline.load = function () {

    const desdeConfig =

        typeof ConfigService !== "undefined"

            ? ConfigService.get("itinerario")

            : null;

    if (Array.isArray(desdeConfig) && desdeConfig.length) {

        this.items = desdeConfig;

        this.render();

        return;

    }

    this.items = [];

};

/* ==========================================================
   RENDER
========================================================== */

/* Los textos vienen de la base de datos: aunque api/config.js
   los sanea al guardar, se escapan también al pintarlos. */

Timeline.escape = function (value) {

    const div = document.createElement("div");

    div.textContent = value === undefined || value === null

        ? ""

        : String(value);

    return div.innerHTML;

};

Timeline.render = function () {

    if (

        !this.elements.timeline ||

        !Array.isArray(this.items) ||

        !this.items.length

    ) {

        return;

    }

    /* Primero la lista sin iconos: son archivos que se piden
       aparte y no deben retrasar el texto. */

    this.elements.timeline.innerHTML = this.items

        .map(item => {

            const icono = this.escape(

                item.icono || "mdi:glass-cocktail"

            );

            return "<li class=\"timeline__item\">" +

                "<span class=\"timeline__icon\" aria-hidden=\"true\" " +

                "data-icon=\"" + icono + "\"></span>" +

                "<span class=\"timeline__text\">" +

                "<strong>" + this.escape(item.titulo) + "</strong>" +

                "<em>" + this.escape(item.hora) + "</em>" +

                "</span>" +

                "</li>";

        })

        .join("");

    this.paintIcons();

    this.observe();

    this.refreshAnimations();

};

/* ==========================================================
   ICONOS

   Se piden todos a la vez y se inyectan cuando llegan, para que
   no aparezcan de uno en uno.
========================================================== */

Timeline.paintIcons = function () {

    if (typeof IconService === "undefined") {

        return;

    }

    const huecos = [

        ...this.elements.timeline.querySelectorAll(

            ".timeline__icon[data-icon]"

        )

    ];

    IconService

        .preload(huecos.map(h => h.dataset.icon))

        .then(() => Promise.all(

            huecos.map(hueco =>

                IconService.inject(hueco, hueco.dataset.icon)

            )

        ))

        .catch(() => {

            /* Un icono que falla no debe romper el itinerario:
               el texto ya está pintado. */

        });

};

/* ==========================================================
   REFRESH ANIMATIONS
========================================================== */

Timeline.refreshAnimations = function () {

    if (typeof AOS !== "undefined") {

        AOS.refresh();

    }

};

/* ==========================================================
   EVENTS
========================================================== */

Timeline.bindEvents = function () {

    document.addEventListener(

        "timeline:refresh",

        () => {

            this.refresh();

        }

    );

};

/* ==========================================================
   REFRESH
========================================================== */

/* Tras volver a pintar hay items nuevos, así que se vuelven a
   observar. */

Timeline.refresh = function () {

    this.cache();

    this.load();

    this.observe();

};

/* ==========================================================
   DESTROY
========================================================== */

Timeline.destroy = function () {

    this.initialized = false;

    this.items = [];

    this.elements = {};

};

/* ==========================================================
   EXPORT
========================================================== */

window.Timeline = Timeline;

/* ==========================================================
   END OF FILE
========================================================== */