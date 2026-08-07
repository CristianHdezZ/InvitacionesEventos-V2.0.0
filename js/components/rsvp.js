/* ==========================================================
   INVITATION ENGINE V2
   FILE        : rsvp.js
   VERSION     : 2.0.0
   MODULE      : RSVP

   Envía la confirmación de asistencia a /api/rsvp.

   Sin este componente el <form> hacía su envío nativo: el
   navegador recargaba la página con los datos en la barra de
   direcciones —?nombre=...&telefono=...— y nunca llegaban al
   servidor.

   Contrato de api/rsvp.js:
     200 { ok:true, id }
     400 { ok:false, errors:[...] }   validación
     409 { ok:false, error }          teléfono ya registrado
     429 { ok:false, error }          demasiados intentos
     500 { ok:false, error }
========================================================== */

"use strict";

/* ==========================================================
   COMPONENT
========================================================== */

const Rsvp = {

    initialized: false,

    sending: false,

    elements: {}

};

/* ==========================================================
   INIT
========================================================== */

Rsvp.init = function () {

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

Rsvp.cache = function () {

    this.elements.form = document.getElementById("rsvpForm");

    this.elements.submit = document.getElementById("rsvpSubmit");

    this.elements.status = document.getElementById("rsvpStatus");

    this.elements.modal = document.getElementById("rsvpModal");

    this.elements.modalMessage =

        document.getElementById("rsvpModalMensaje");

    this.elements.modalButton =

        document.getElementById("rsvpModalBtn");

    this.elements.cardActions =

        document.getElementById("rsvpTarjetaAcciones");

    this.elements.cardStatus =

        document.getElementById("rsvpTarjetaStatus");

    this.elements.download =

        document.getElementById("rsvpDescargarBtn");

    this.elements.whatsapp =

        document.getElementById("rsvpWhatsappBtn");

    this.elements.whatsappHint =

        document.getElementById("rsvpWhatsappHint");

};

/* ==========================================================
   EVENTS
========================================================== */

Rsvp.bindEvents = function () {

    this.elements.form.addEventListener(

        "submit",

        event => {

            event.preventDefault();

            this.send();

        }

    );

    if (this.elements.modalButton) {

        this.elements.modalButton.addEventListener(

            "click",

            () => this.closeModal()

        );

    }

    if (this.elements.modal) {

        this.elements.modal

            .querySelectorAll("[data-modal-close]")

            .forEach(el =>

                el.addEventListener(

                    "click",

                    () => this.closeModal()

                )

            );

    }

    document.addEventListener("keydown", event => {

        if (event.key === "Escape") {

            this.closeModal();

        }

    });

};

/* ==========================================================
   SEND
========================================================== */

/* El envío, el bloqueo del botón y la traducción de errores
   son iguales que en la sugerencia musical, así que viven en
   services/form.service.js. */

Rsvp.send = function () {

    if (typeof FormService === "undefined") {

        return;

    }

    FormService.submit({

        form: this.elements.form,

        submit: this.elements.submit,

        status: this.elements.status,

        etiqueta: "Enviar confirmación",

        enviando: "Enviando…",

        onSuccess: (body, datos) => this.onSuccess(datos)

    });

};

/* ==========================================================
   ÉXITO
========================================================== */

Rsvp.onSuccess = function (datos) {

    FormService.setStatus(this.elements.status, "", "");

    this.elements.form.reset();

    const asiste = datos.asistencia === "si";

    const nombre = (datos.nombre || "").trim().split(" ")[0];

    const mensaje = asiste

        ? "¡Gracias" + (nombre ? ", " + nombre : "") +

          "! Tu lugar está confirmado. Nos vemos en la fiesta 💕"

        : "Gracias por avisarnos" + (nombre ? ", " + nombre : "") +

          ". Te vamos a extrañar.";

    this.openModal(mensaje);

    if (asiste) {

        this.celebrate();

        this.prepareCard(datos);

    }

};

/* ==========================================================
   TARJETA DE INVITACIÓN

   Solo para quien confirma que sí asiste. Se arma después de
   abrir el modal —tarda un momento en generarse— y mientras
   tanto se avisa con un texto.
========================================================== */

Rsvp.prepareCard = async function (datos) {

    const acciones = this.elements.cardActions;

    if (!acciones || typeof CardService === "undefined") {

        return;

    }

    acciones.hidden = false;

    this.toggle(this.elements.cardStatus, true);

    this.toggle(this.elements.download, false);

    this.toggle(this.elements.whatsapp, false);

    this.toggle(this.elements.whatsappHint, false);

    if (this.elements.cardStatus) {

        this.elements.cardStatus.textContent =

            "Preparando tu tarjeta de invitación…";

    }

    const config = typeof ConfigService !== "undefined"

        ? (ConfigService.data || {})

        : {};

    let blob = null;

    try {

        blob = await CardService.generate(datos.nombre, config);

    }

    catch (error) {

        console.error("[Rsvp] tarjeta", error);

    }

    if (!blob) {

        if (this.elements.cardStatus) {

            this.elements.cardStatus.textContent =

                "No se pudo preparar la tarjeta esta vez, pero tu " +

                "confirmación ya quedó registrada.";

        }

        return;

    }

    this.toggle(this.elements.cardStatus, false);

    this.wireCardButtons(blob, datos, config);

};

/* ==========================================================
   BOTONES DE LA TARJETA
========================================================== */

Rsvp.wireCardButtons = function (blob, datos, config) {

    const nombreArchivo =

        "Invitacion-XV-" +

        String(datos.nombre || "invitado")

            .trim()

            .replace(/\s+/g, "-") +

        ".pdf";

    const url = URL.createObjectURL(blob);

    const descargar = () => {

        const a = document.createElement("a");

        a.href = url;

        a.download = nombreArchivo;

        document.body.appendChild(a);

        a.click();

        a.remove();

    };

    if (this.elements.download) {

        this.toggle(this.elements.download, true);

        this.elements.download.onclick = descargar;

    }

    if (!this.elements.whatsapp) {

        return;

    }

    const quinceanera = [config.nombre, config.apellido]

        .filter(Boolean)

        .join(" ");

    const mensaje =

        "¡Hola! Confirmé mi asistencia a los XV años de " +

        quinceanera +

        " 💕 Te comparto mi tarjeta de invitación.";

    const enlace = CardService.whatsappLink(datos.telefono, mensaje);

    /* Mejor camino: el propio móvil adjunta el PDF de verdad y
       la persona elige WhatsApp en el selector del sistema. */

    let archivo = null;

    try {

        archivo = new File([blob], nombreArchivo, {

            type: "application/pdf"

        });

    }

    catch (error) {

        /* File no soportado en este navegador. */

    }

    const puedeCompartir =

        archivo &&

        typeof navigator.canShare === "function" &&

        navigator.canShare({ files: [archivo] });

    if (puedeCompartir) {

        this.toggle(this.elements.whatsapp, true);

        this.elements.whatsapp.onclick = async () => {

            try {

                await navigator.share({

                    files: [archivo],

                    title: "Mi invitación",

                    text: mensaje

                });

            }

            catch (error) {

                /* Si cancela o falla, se cae al enlace directo. */

                this.fallbackWhatsapp(descargar, enlace);

            }

        };

        return;

    }

    /* Respaldo: el navegador no puede adjuntar el archivo solo,
       así que se descarga aparte y se abre el chat para que la
       persona lo adjunte ahí. */

    if (enlace) {

        this.toggle(this.elements.whatsapp, true);

        this.elements.whatsapp.onclick = () =>

            this.fallbackWhatsapp(descargar, enlace);

    }

};

Rsvp.fallbackWhatsapp = function (descargar, enlace) {

    if (!enlace) {

        return;

    }

    descargar();

    window.open(enlace, "_blank", "noopener");

    this.toggle(this.elements.whatsappHint, true);

};

Rsvp.toggle = function (elemento, visible) {

    if (elemento) {

        elemento.hidden = !visible;

    }

};

/* ==========================================================
   CONFETI
========================================================== */

Rsvp.celebrate = function () {

    if (typeof confetti !== "function") {

        return;

    }

    const reducido = window.matchMedia(

        "(prefers-reduced-motion: reduce)"

    ).matches;

    if (reducido) {

        return;

    }

    confetti({

        particleCount: 120,

        spread: 70,

        origin: { y: .6 },

        colors: [

            "#E9AABB",

            "#C97D95",

            "#B8935C",

            "#F6D8DF",

            "#FFFFFF"

        ],

        scalar: .9

    });

};

/* ==========================================================
   MODAL
========================================================== */

Rsvp.openModal = function (mensaje) {

    const modal = this.elements.modal;

    if (!modal) {

        return;

    }

    if (this.elements.modalMessage) {

        this.elements.modalMessage.textContent = mensaje;

    }

    modal.classList.add("is-open");

    modal.setAttribute("aria-hidden", "false");

    document.body.classList.add("overflow-hidden");

    if (this.elements.modalButton) {

        this.elements.modalButton.focus();

    }

};

Rsvp.closeModal = function () {

    const modal = this.elements.modal;

    if (!modal || !modal.classList.contains("is-open")) {

        return;

    }

    /* Las acciones de la tarjeta se recogen al cerrar: si la
       persona confirma otra vez, se preparan de cero. */

    this.toggle(this.elements.cardActions, false);

    modal.classList.remove("is-open");

    modal.setAttribute("aria-hidden", "true");

    document.body.classList.remove("overflow-hidden");

};

/* ==========================================================
   REFRESH / DESTROY
========================================================== */

Rsvp.refresh = function () {

    this.cache();

};

Rsvp.destroy = function () {

    this.initialized = false;

    this.sending = false;

    this.elements = {};

};

/* ==========================================================
   EXPORT
========================================================== */

window.Rsvp = Rsvp;

/* ==========================================================
   END OF FILE
========================================================== */
