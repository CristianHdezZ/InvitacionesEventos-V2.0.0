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

        items.forEach(item => {

            reveal(item);

            this.syncNoteWithView(item, true);

        });

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

/* innerHTML escapa &, < y > pero deja las comillas intactas, así que
   para meter un texto dentro de un atributo hace falta este paso de
   más: sin él, un título con comillas rompería la etiqueta. */

Timeline.escapeAttr = function (value) {

    return this.escape(value).replace(/"/g, "&quot;");

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

        .map((item, indice) => {

            const icono = this.escapeAttr(

                item.icono || "mdi:glass-cocktail"

            );

            const titulo = this.escape(item.titulo);

            const nota = String(item.nota || "").trim();

            const idNota = "itinerarioNota" + indice;

            /* El icono solo se vuelve pulsable si hay algo que
               enseñar. Sin nota se queda como estaba —un <span>
               decorativo—: dar aspecto de botón a algo que al tocarlo
               no hace nada es peor que no ofrecerlo.

               Con nota pasa a <button>, que trae de serie el foco por
               teclado y la activación con Enter y Espacio; con un
               <div> con onclick habría que añadir todo eso a mano. */

            const marcaIcono = nota

                ? "<button type=\"button\" " +

                  "class=\"timeline__icon timeline__icon--nota\" " +

                  "data-icon=\"" + icono + "\" " +

                  "data-nota=\"" + idNota + "\" " +

                  "aria-expanded=\"false\" " +

                  "aria-controls=\"" + idNota + "\" " +

                  "aria-label=\"Ver detalle de " +

                  this.escapeAttr(item.titulo) + "\"></button>"

                : "<span class=\"timeline__icon\" aria-hidden=\"true\" " +

                  "data-icon=\"" + icono + "\"></span>";

            return "<li class=\"timeline__item\">" +

                marcaIcono +

                "<span class=\"timeline__text\">" +

                "<strong>" + titulo + "</strong>" +

                "<em>" + this.escape(item.hora) + "</em>" +

                "</span>" +

                /* Dos elementos y no uno: el de fuera se encarga de
                   plegarse —y para eso necesita overflow:hidden—,
                   mientras que la burbuja de dentro lleva la cola, que
                   sobresale y ese recorte se comería. */

                (nota

                    ? "<div class=\"timeline__nota\" id=\"" + idNota +

                      "\"><span class=\"timeline__burbuja\">" +

                      this.escape(nota) + "</span></div>"

                    : "") +

                "</li>";

        })

        .join("");

    this.paintIcons();

    this.bindNotes();

    this.observe();

    this.bindNoteScroll();

    this.updateNotesByScroll();

    this.refreshAnimations();

};

/* ==========================================================
   COMENTARIOS DEL ITINERARIO

   Se abren al hacer clic o al tocar en móvil. A propósito no se usa
   :hover: en una pantalla táctil el hover no existe —o se queda
   pegado tras el toque— y esta sección se mira sobre todo desde el
   teléfono.
========================================================== */

Timeline.bindNotes = function () {

    const botones = [

        ...this.elements.timeline.querySelectorAll(

            ".timeline__icon--nota"

        )

    ];

    if (!botones.length) {

        return;

    }

    botones.forEach(boton => {

        boton.addEventListener("click", evento => {

            /* Sin esto el clic llegaría al documento y el cierre de
               abajo lo desharía en el mismo gesto. */

            evento.stopPropagation();

            const abierto =

                boton.getAttribute("aria-expanded") === "true";

            if (abierto) {

                this.closeNote(boton);

                return;

            }

            /* Uno abierto a la vez solo donde se abren a mano: varios
               desplegados dejan la sección hecha un lío.

               En móvil no, porque ahí las abre el scroll y cerrarlas
               aquí desharía lo que el propio desplazamiento acaba de
               hacer. */

            if (!this.autoNotes()) {

                this.closeNotes();

            }

            this.openNote(boton);

        });

    });

    /* Estos dos van una sola vez, no en cada repintado: render() se
       vuelve a llamar cada vez que cambia la configuración y si no
       acabaríamos con un oyente por pasada. */

    if (!this.notesBound) {

        /* Tocar fuera cierra, pero no donde las abre el scroll: allí
           el primer toque en cualquier sitio las apagaría todas y solo
           volverían al salir y entrar de la sección. */

        document.addEventListener(

            "click",

            () => {

                if (!this.autoNotes()) {

                    this.closeNotes();

                }

            }

        );

        document.addEventListener("keydown", evento => {

            if (evento.key === "Escape") {

                this.closeNotes();

            }

        });

        this.notesBound = true;

    }

};

Timeline.openNote = function (boton) {

    const nota = document.getElementById(boton.dataset.nota);

    if (!nota) {

        return;

    }

    boton.setAttribute("aria-expanded", "true");

    nota.classList.add("is-open");

};

Timeline.closeNote = function (boton) {

    if (!boton) {

        return;

    }

    boton.setAttribute("aria-expanded", "false");

    const nota = document.getElementById(boton.dataset.nota);

    if (nota) {

        nota.classList.remove("is-open");

    }

};

Timeline.closeNotes = function () {

    if (!this.elements.timeline) {

        return;

    }

    this.elements.timeline

        .querySelectorAll(

            ".timeline__icon--nota[aria-expanded=\"true\"]"

        )

        .forEach(boton => this.closeNote(boton));

};

/* ==========================================================
   APERTURA AUTOMÁTICA AL PASAR

   En el móvil las burbujas se abren solas según entran en pantalla:
   con el dedo, ir tocando ícono por ícono para leer el programa es
   incómodo, y la información se pierde.

   En escritorio se mantiene el clic. Ahí hay sitio de sobra, el
   puntero es preciso y abrir seis burbujas a la vez solo alarga la
   sección sin que nadie lo haya pedido.

   Se mira el puntero además del ancho: una tablet táctil ancha se
   maneja igual que un teléfono, y una ventana de escritorio estrecha
   no deja de tener ratón.
========================================================== */

Timeline.autoNotes = function () {

    return window.matchMedia(

        "(max-width: 760px), (pointer: coarse)"

    ).matches;

};

/* Camino de respaldo: sin IntersectionObserver o con movimiento
   reducido los puntos se muestran todos de golpe, y sus burbujas con
   ellos. Quien pide menos movimiento prefiere el contenido puesto a
   que aparezca poco a poco.

   La apertura normal, la que sigue al scroll, está más abajo en
   updateNotesByScroll(). */

Timeline.syncNoteWithView = function (item, visible) {

    if (!visible || !this.autoNotes()) {

        return;

    }

    this.openNote(item.querySelector(".timeline__icon--nota"));

};

/* ==========================================================
   APERTURA PROGRESIVA POR POSICIÓN

   Se decide con la posición de cada punto, no con
   IntersectionObserver. El observador informa solo del estado final
   cuando algo entra y sale entre dos fotogramas, así que con un
   deslizamiento rápido había puntos que se saltaban y no llegaban a
   abrirse nunca.

   La regla es simple: abierta toda burbuja cuyo punto ya pasó la
   línea, cerrada el resto. Al depender de dónde está cada cosa y no
   de un evento que pudo perderse, da igual llegar despacio o de un
   tirón, y al subir se cierran en orden inverso.

   Y no oscila: abrir una burbuja empuja hacia abajo a las
   siguientes, nunca al punto que la abrió, así que nada puede
   abrirse y cerrarse a sí mismo en bucle.
========================================================== */

Timeline.LINEA_APERTURA = .72;

Timeline.updateNotesByScroll = function () {

    if (!this.autoNotes() || !this.elements.timeline) {

        return;

    }

    const linea = window.innerHeight * this.LINEA_APERTURA;

    /* Primero se leen todas las posiciones y después se escribe:
       alternar lectura y escritura obliga al navegador a recalcular
       el diseño en cada vuelta del bucle. */

    const estados = [

        ...this.elements.timeline.querySelectorAll(".timeline__item")

    ].map(item => ({

        boton: item.querySelector(".timeline__icon--nota"),

        abrir: item.getBoundingClientRect().top < linea

    }));

    estados.forEach(({ boton, abrir }) => {

        if (!boton) {

            return;

        }

        if (abrir) {

            this.openNote(boton);

        } else {

            this.closeNote(boton);

        }

    });

};

Timeline.bindNoteScroll = function () {

    if (this.noteScrollBound) {

        return;

    }

    /* passive: aquí no se llama a preventDefault, y avisando de ello
       el navegador no tiene que esperar a este código para desplazar
       la página. */

    window.addEventListener(

        "scroll",

        () => this.updateNotesByScroll(),

        { passive: true }

    );

    /* Al girar el teléfono cambia el alto y con él la línea. */

    window.addEventListener(

        "resize",

        () => this.updateNotesByScroll(),

        { passive: true }

    );

    this.noteScrollBound = true;

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

    /* Los dos observadores siguen vivos aunque se vacíen los
       elementos: hay que soltarlos a mano. */

    if (this.observer) {

        this.observer.disconnect();

        this.observer = null;

    }

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