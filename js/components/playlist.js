/* ==========================================================
   INVITATION ENGINE V2
   FILE        : playlist.js
   VERSION     : 2.0.0
   MODULE      : PLAYLIST (sugerencia musical)

   Envía la canción sugerida a /api/musica.

   Sin este componente el <form> hacía su envío nativo: la
   página se recargaba con los datos en la barra de direcciones
   —?cancion=...&artista=...— y la sugerencia no llegaba nunca.

   El servidor intenta además añadir la canción a la lista de
   Spotify y responde con 'enSpotify' para poder decir si entró
   o si solo quedó anotada.
========================================================== */

"use strict";

/* ==========================================================
   COMPONENT
========================================================== */

const Playlist = {

    initialized: false,

    elements: {}

};

/* ==========================================================
   INIT
========================================================== */

Playlist.init = function () {

    if (this.initialized) {

        return;

    }

    this.cache();

    if (!this.elements.form) {

        return;

    }

    this.bindEvents();

    this.initialized = true;

};

/* ==========================================================
   CACHE
========================================================== */

Playlist.cache = function () {

    this.elements.form = document.getElementById("musicaForm");

    this.elements.submit = document.getElementById("musicaSubmit");

    this.elements.status = document.getElementById("musicaStatus");

};

/* ==========================================================
   EVENTS
========================================================== */

Playlist.bindEvents = function () {

    this.elements.form.addEventListener(

        "submit",

        event => {

            event.preventDefault();

            this.send();

        }

    );

};

/* ==========================================================
   SEND
========================================================== */

Playlist.send = function () {

    if (typeof FormService === "undefined") {

        return;

    }

    FormService.submit({

        form: this.elements.form,

        submit: this.elements.submit,

        status: this.elements.status,

        etiqueta: "Enviar sugerencia",

        enviando: "Enviando…",

        onSuccess: (body, datos) => this.onSuccess(body, datos)

    });

};

/* ==========================================================
   ÉXITO
========================================================== */

Playlist.onSuccess = function (body, datos) {

    this.elements.form.reset();

    const cancion = (datos.cancion || "").trim();

    /* Si Spotify no está conectado o no encontró la canción, la
       sugerencia igual queda guardada: se avisa sin dar la
       sensación de que algo falló. */

    const mensaje = body.enSpotify

        ? "¡Listo! " +

          (cancion ? "«" + cancion + "» ya está" : "Ya está") +

          " en la lista de la fiesta 🎵"

        : "¡Gracias! Anotamos tu sugerencia" +

          (cancion ? ": «" + cancion + "»" : "") +

          " 🎵";

    FormService.setStatus(

        this.elements.status,

        mensaje,

        "ok"

    );

};

/* ==========================================================
   REFRESH / DESTROY
========================================================== */

Playlist.refresh = function () {

    this.cache();

};

Playlist.destroy = function () {

    this.initialized = false;

    this.elements = {};

};

/* ==========================================================
   EXPORT
========================================================== */

window.Playlist = Playlist;

/* ==========================================================
   END OF FILE
========================================================== */
