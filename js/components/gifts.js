/* ==========================================================
   INVITATION ENGINE V2
   FILE        : gifts.js
   VERSION     : 2.0.0
   MODULE      : GIFTS

   La lluvia de sobres de la sección de regalos. El CSS ya trae
   el recorrido —@keyframes regalosSobreCae, en
   css/layout/gifts.css—; aquí solo se crean los sobres y se le
   da a cada uno su posición, tamaño, duración y retraso, para
   que no caigan todos a la vez ni por el mismo sitio.

   El contenedor #regalosLluvia existía en el marcado pero nadie
   lo llenaba: era JS que vivía en scriptOld.js.
========================================================== */

"use strict";

/* ==========================================================
   COMPONENT
========================================================== */

const Gifts = {

    initialized: false,

    total: 14,

    elements: {}

};

/* ==========================================================
   INIT
========================================================== */

Gifts.init = function () {

    if (this.initialized) {

        return;

    }

    this.cache();

    if (!this.elements.lluvia) {

        return;

    }

    this.render();

    this.initialized = true;

};

/* ==========================================================
   CACHE
========================================================== */

Gifts.cache = function () {

    this.elements.seccion = document.getElementById("regalos");

    this.elements.lluvia = document.getElementById("regalosLluvia");

};

/* ==========================================================
   RENDER

   No se dibuja nada si la sección está apagada desde el panel
   o si el sistema pide movimiento reducido: son sobres cayendo
   sin parar, justo lo que esa preferencia quiere evitar.
========================================================== */

Gifts.render = function () {

    const apagada =

        this.elements.seccion &&

        this.elements.seccion.hidden;

    const reducido = window.matchMedia(

        "(prefers-reduced-motion: reduce)"

    ).matches;

    if (apagada || reducido) {

        this.elements.lluvia.innerHTML = "";

        return;

    }

    const sobres = [];

    for (let i = 0; i < this.total; i++) {

        /* Reparto horizontal con una franja por sobre más un
           desvío aleatorio: quedan repartidos pero no en
           columnas perfectas. */

        const franja = 100 / this.total;

        const izquierda = (i * franja) + (Math.random() * franja);

        const ancho = 16 + Math.random() * 14;

        const duracion = 7 + Math.random() * 6;

        const retraso = Math.random() * 8;

        sobres.push(

            "<span class=\"regalos__sobre-anim\" style=\"" +

            "left:" + izquierda.toFixed(2) + "%;" +

            "width:" + ancho.toFixed(0) + "px;" +

            "animation-duration:" + duracion.toFixed(2) + "s;" +

            "animation-delay:-" + retraso.toFixed(2) + "s;" +

            "\">" + this.svg() + "</span>"

        );

    }

    this.elements.lluvia.innerHTML = sobres.join("");

};

/* ==========================================================
   SOBRE

   El mismo dibujo que el icono grande de la sección, en
   pequeño y sin el corazón.
========================================================== */

Gifts.svg = function () {

    return "<svg viewBox=\"0 0 48 48\" fill=\"none\" aria-hidden=\"true\">" +

        "<rect x=\"7\" y=\"12\" width=\"34\" height=\"24\" rx=\"2.5\" " +

        "stroke=\"currentColor\" stroke-width=\"2.4\" fill=\"none\"/>" +

        "<path d=\"M8 14 L24 27 L40 14\" stroke=\"currentColor\" " +

        "stroke-width=\"2.4\" fill=\"none\" stroke-linecap=\"round\" " +

        "stroke-linejoin=\"round\"/>" +

        "</svg>";

};

/* ==========================================================
   REFRESH / DESTROY
========================================================== */

Gifts.refresh = function () {

    this.cache();

    if (this.elements.lluvia) {

        this.render();

    }

};

Gifts.destroy = function () {

    if (this.elements.lluvia) {

        this.elements.lluvia.innerHTML = "";

    }

    this.initialized = false;

    this.elements = {};

};

/* ==========================================================
   EXPORT
========================================================== */

window.Gifts = Gifts;

/* ==========================================================
   END OF FILE
========================================================== */
