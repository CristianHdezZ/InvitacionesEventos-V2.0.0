/* ==========================================================
   INVITATION ENGINE V2
   FILE        : icons.service.js
   VERSION     : 2.0.0
   MODULE      : ICON SERVICE

   Los iconos que elige el panel de admin vienen como
   identificadores 'conjunto:nombre' —'fi:copa', 'mdi:flower',
   'traje:gala'— y aquí se convierten en SVG.

   POR QUÉ BAJO DEMANDA

   En V1 los 75 iconos vivían en un objeto dentro de
   js/scriptOld.js: 617 KB que se descargaban en cada visita
   para pintar cuatro o cinco. El conjunto 'fi' se lleva el 98%
   de ese peso —uno solo pesa 58 KB— porque son trazados sin
   simplificar.

   Ahora cada icono es un archivo en assets/icons/ y solo se
   pide el que hace falta. Se cachean en memoria, y las
   peticiones simultáneas del mismo icono comparten una única
   descarga.
========================================================== */

"use strict";

/* ==========================================================
   SERVICE
========================================================== */

const IconService = {

    base: "assets/icons/",

    fallback: "mdi:heart",

    cache: new Map(),

    pending: new Map()

};

/* ==========================================================
   RUTA

   El identificador solo puede traer letras, números y guiones a
   cada lado de los dos puntos. Cualquier otra cosa se descarta:
   así un valor manipulado no puede salirse de assets/icons/.
========================================================== */

IconService.pathFor = function (id) {

    if (typeof id !== "string") {

        return null;

    }

    const match = id

        .trim()

        .match(/^([a-z0-9-]+):([a-z0-9-]+)$/i);

    if (!match) {

        return null;

    }

    return this.base + match[1] + "/" + match[2] + ".svg";

};

/* ==========================================================
   LOAD

   Devuelve el marcado del icono, o el del icono de respaldo si
   no se reconoce. Nunca lanza: un icono que falta no debe
   tumbar la sección que lo pinta.
========================================================== */

IconService.load = async function (id) {

    if (this.cache.has(id)) {

        return this.cache.get(id);

    }

    if (this.pending.has(id)) {

        return this.pending.get(id);

    }

    const url = this.pathFor(id);

    if (!url) {

        return this.loadFallback(id);

    }

    const request = fetch(url)

        .then(response => {

            if (!response.ok) {

                throw new Error("HTTP " + response.status);

            }

            return response.text();

        })

        .then(markup => {

            this.cache.set(id, markup);

            this.pending.delete(id);

            return markup;

        })

        .catch(() => {

            this.pending.delete(id);

            return this.loadFallback(id);

        });

    this.pending.set(id, request);

    return request;

};

/* Evita la recursión infinita si el propio respaldo falla. */

IconService.loadFallback = async function (id) {

    if (id === this.fallback) {

        return "";

    }

    console.warn(

        "[IconService] Icono desconocido:",

        id,

        "— se usa",

        this.fallback

    );

    const markup = await this.load(this.fallback);

    this.cache.set(id, markup);

    return markup;

};

/* ==========================================================
   INJECT

   Mete el icono dentro de un elemento ya existente. Se usa así
   —en vez de devolver una cadena para concatenar— porque el
   marcado viene de un archivo y conviene insertarlo una sola
   vez, sin rearmar HTML alrededor.
========================================================== */

IconService.inject = async function (element, id, className) {

    if (!element) {

        return false;

    }

    const markup = await this.load(id);

    if (!markup) {

        return false;

    }

    element.innerHTML = markup;

    const svg = element.querySelector("svg");

    if (svg) {

        svg.setAttribute("aria-hidden", "true");

        if (className) {

            svg.setAttribute("class", className);

        }

    }

    return true;

};

/* ==========================================================
   PRELOAD

   Pide varios de golpe. Útil antes de pintar una lista, para
   que no aparezcan de uno en uno.
========================================================== */

IconService.preload = function (ids) {

    return Promise.all(

        [...new Set(

            (ids || []).filter(Boolean)

        )].map(id => this.load(id))

    );

};

/* ==========================================================
   EXPORT
========================================================== */

window.IconService = IconService;

/* ==========================================================
   END OF FILE
========================================================== */
