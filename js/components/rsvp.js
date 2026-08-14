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

    this.applyRemembered();

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

    this.elements.done =

        document.getElementById("rsvpHecho");

    this.elements.doneTitle =

        document.getElementById("rsvpHechoTitulo");

    this.elements.doneText =

        document.getElementById("rsvpHechoTexto");

    this.elements.doneCard =

        document.getElementById("rsvpHechoTarjeta");

    this.elements.doneChange =

        document.getElementById("rsvpHechoCambiar");

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

            () => this.closeModal(true)

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

    if (this.elements.doneChange) {

        this.elements.doneChange.addEventListener(

            "click",

            () => {

                this.forget();

                this.showForm();

            }

        );

    }

    if (this.elements.doneCard) {

        this.elements.doneCard.addEventListener(

            "click",

            () => this.downloadRememberedCard()

        );

    }

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

        onSuccess: (body, datos) => this.onSuccess(datos),

        onDuplicate: (body, datos) => this.onDuplicate(body, datos)

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

        /* El confeti ya no sale aquí. Se queda pendiente y estalla al
           pulsar "Aceptar", cuando la página ya está situada en la
           cuenta regresiva: lanzarlo con el modal abierto lo dejaba
           por detrás del propio modal y del fondo oscuro.

           Solo para quien confirma que sí asiste; a quien no viene no
           se le celebra nada. */

        this.pendingCelebration = true;

        this.prepareCard(datos);

    }

    /* Se recuerda tanto el sí como el no: el servidor bloquea los
       dos por igual, así que en ambos casos ofrecer otra vez el
       formulario sería mandar a la persona a un 409. */

    this.remember(datos.nombre, datos.asistencia);

    this.applyRemembered();

};

/* ==========================================================
   YA ESTABA CONFIRMADO (409)

   El servidor rechaza el duplicado y eso está bien: es la única
   defensa real y es atómica. Pero para quien vuelve no es un error.
   El caso habitual es que perdió su tarjeta y regresa a por ella,
   y hasta ahora se encontraba un mensaje en rojo sin salida.

   Manda lo que hay registrado, no lo que acaba de marcar en el
   formulario: si en su día dijo que no, entregarle una tarjeta le
   haría creer que está en la lista cuando no lo está.
========================================================== */

Rsvp.onDuplicate = function (body, datos) {

    FormService.setStatus(this.elements.status, "", "");

    this.elements.form.reset();

    const nombre = (datos.nombre || "").trim().split(" ")[0];

    const registrada = body ? body.asistencia : null;

    const coincideNombre = body ? body.nombreCoincide === true : false;

    /* El teléfono identifica el registro, pero no basta para
       entregar la tarjeta: va con el nombre impreso. Si no coincide
       con el que se confirmó, o es un error al teclear o es el
       teléfono de otra persona, y en ninguno de los dos casos
       corresponde dar una tarjeta a ese nombre.

       Tampoco se recuerda en el dispositivo: así puede corregirlo y
       volver a intentarlo sin tener que usar la salida de emergencia. */

    if (registrada && !coincideNombre) {

        this.openModal(

            "Con este número ya hay una confirmación registrada a " +

            "otro nombre. Revisa que lo hayas escrito igual que la " +

            "primera vez, o escríbenos y lo revisamos.",

            "Los datos no coinciden"

        );

        return;

    }

    if (registrada === "si") {

        this.openModal(

            "Ya tenemos tu confirmación" +

            (nombre ? ", " + nombre : "") +

            ". Te dejamos tu tarjeta otra vez por si la perdiste.",

            "Ya estabas confirmado"

        );

        this.prepareCard(datos);

        /* El confeti también aquí. Al principio lo dejé solo para las
           confirmaciones nuevas, pensando que repetir no era motivo de
           celebración, pero quien vuelve a por su tarjeta recibe lo
           mismo que la primera vez y la explosión forma parte de eso.

           Solo en esta rama: quien declinó no celebra nada, y con los
           datos sin coincidir ni siquiera se llega hasta aquí. */

        this.pendingCelebration = true;

        /* También se recuerda al volver: si este dispositivo no lo
           tenía guardado —caché borrada, otro navegador—, ahora ya
           sabe que este número está registrado. */

        this.remember(datos.nombre, "si");

        this.applyRemembered();

        return;

    }

    if (registrada === "no") {

        this.openModal(

            "Con este número ya habías respondido que no podrías " +

            "acompañarnos. Si cambiaron tus planes, escríbenos y lo " +

            "ajustamos.",

            "Ya teníamos tu respuesta"

        );

        this.remember(datos.nombre, "no");

        this.applyRemembered();

        return;

    }

    /* Sin dato de lo registrado —por ejemplo si falló la lectura en
       el servidor— se avisa sin prometer nada. */

    this.openModal(

        "Ya hay una confirmación registrada con este número de " +

        "teléfono. Si crees que es un error, escríbenos.",

        "Ya estabas registrado"

    );

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
   RECUERDO EN ESTE DISPOSITIVO

   Deja constancia en localStorage de que desde aquí ya se confirmó,
   para no seguir ofreciendo un formulario que solo puede acabar en
   409.

   Esto NO es una medida de seguridad y no debe tratarse como tal:
   vive en el navegador, se borra con la caché y no existe en
   incógnito. Lo único que de verdad impide el duplicado es el
   servidor. Aquí solo se evita el paseo en balde.
========================================================== */

Rsvp.STORAGE_KEY = "rsvp-confirmado";

Rsvp.remember = function (nombre, asistencia) {

    if (typeof AppStorage === "undefined") {

        return;

    }

    /* El teléfono no se guarda: para rehacer la tarjeta basta el
       nombre, y cuanto menos dato personal quede en el navegador,
       mejor. */

    try {

        AppStorage.set(this.STORAGE_KEY, {

            nombre: (nombre || "").trim(),

            asistencia: asistencia === "si" ? "si" : "no",

            fecha: new Date().toISOString()

        });

    }

    catch (error) {

        /* Safari en privado y los modos sin cuota lanzan al escribir.
           Quedarse sin recuerdo no rompe nada. */

        console.warn("[Rsvp] no se pudo recordar", error);

    }

};

Rsvp.forget = function () {

    if (typeof AppStorage === "undefined") {

        return;

    }

    try {

        AppStorage.remove(this.STORAGE_KEY);

    }

    catch (error) {

        console.warn("[Rsvp] no se pudo olvidar", error);

    }

};

Rsvp.recall = function () {

    if (typeof AppStorage === "undefined") {

        return null;

    }

    const dato = AppStorage.get(this.STORAGE_KEY, null);

    return dato && typeof dato === "object" ? dato : null;

};

/* ==========================================================
   PANEL DE "YA CONFIRMASTE"
========================================================== */

Rsvp.applyRemembered = function () {

    const dato = this.recall();

    if (!dato) {

        return;

    }

    this.showDonePanel(dato);

};

Rsvp.showDonePanel = function (dato) {

    const nombre = (dato.nombre || "").trim().split(" ")[0];

    const asiste = dato.asistencia === "si";

    if (this.elements.doneTitle) {

        this.elements.doneTitle.textContent = asiste

            ? "Ya confirmaste tu asistencia"

            : "Ya enviaste tu respuesta";

    }

    if (this.elements.doneText) {

        this.elements.doneText.textContent = asiste

            ? "Desde este dispositivo ya confirmaste" +

              (nombre ? ", " + nombre : "") +

              ". Nos vemos en la fiesta 💕"

            : "Desde este dispositivo ya respondiste que no podrás " +

              "acompañarnos. Gracias por avisar.";

    }

    /* La tarjeta solo tiene sentido para quien viene. */

    this.toggle(this.elements.doneCard, asiste);

    this.toggle(this.elements.form, false);

    this.toggle(this.elements.done, true);

};

/* La salida de emergencia. Sin esto, un móvil que se pasan entre
   varios de la familia dejaría fuera al segundo, y quien tecleó mal
   su número no podría reintentarlo. */

Rsvp.showForm = function () {

    this.toggle(this.elements.done, false);

    this.toggle(this.elements.form, true);

    if (this.elements.form) {

        const primero =

            this.elements.form.querySelector("input, textarea");

        if (primero) {

            primero.focus();

        }

    }

};

/* ==========================================================
   REHACER LA TARJETA DESDE EL RECUERDO

   Se genera de nuevo en vez de guardarla: un PDF de 600 KB no cabe
   en localStorage, y armarlo cuesta menos que almacenarlo.
========================================================== */

Rsvp.downloadRememberedCard = async function () {

    const dato = this.recall();

    const boton = this.elements.doneCard;

    if (!dato || typeof CardService === "undefined") {

        return;

    }

    const etiqueta = boton ? boton.textContent : "";

    if (boton) {

        boton.disabled = true;

        boton.textContent = "Preparando…";

    }

    try {

        const config =

            typeof ConfigService !== "undefined"

                ? (ConfigService.data || {})

                : {};

        const blob = await CardService.generate(dato.nombre, config);

        if (!blob) {

            throw new Error("no se pudo generar");

        }

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");

        a.href = url;

        a.download =

            "Invitacion-XV-" +

            String(dato.nombre || "invitado")

                .trim()

                .replace(/\s+/g, "-") +

            ".pdf";

        document.body.appendChild(a);

        a.click();

        a.remove();

        URL.revokeObjectURL(url);

    }

    catch (error) {

        console.error("[Rsvp] tarjeta", error);

        if (this.elements.doneText) {

            this.elements.doneText.textContent =

                "No pudimos preparar la tarjeta ahora mismo. " +

                "Inténtalo de nuevo en un momento.";

        }

    }

    finally {

        if (boton) {

            boton.disabled = false;

            boton.textContent = etiqueta;

        }

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

Rsvp.openModal = function (mensaje, titulo) {

    const modal = this.elements.modal;

    if (!modal) {

        return;

    }

    if (this.elements.modalMessage) {

        this.elements.modalMessage.textContent = mensaje;

    }

    /* El título se escribe siempre, también en el caso normal: el
       modal se reutiliza, y si un duplicado lo dejó en "Ya estabas
       confirmado", la siguiente confirmación buena heredaría ese
       texto. */

    const encabezado =

        document.getElementById("rsvpModalTitulo");

    if (encabezado) {

        encabezado.textContent = titulo || "¡Gracias!";

    }

    modal.classList.add("is-open");

    modal.setAttribute("aria-hidden", "false");

    document.body.classList.add("overflow-hidden");

    if (this.elements.modalButton) {

        this.elements.modalButton.focus();

    }

};

/* irACuenta llega en true solo desde el botón "Aceptar". Cerrar por
   el fondo o con Escape deja a la persona donde estaba, que es lo que
   se espera de un cierre accidental.

   En V1 este mismo gesto llevaba al hero; ahora lleva a la cuenta
   regresiva, que es lo que interesa mirar justo después de confirmar. */

Rsvp.closeModal = function (irACuenta) {

    const modal = this.elements.modal;

    if (!modal || !modal.classList.contains("is-open")) {

        return;

    }

    /* Las acciones de la tarjeta se recogen al cerrar: si la
       persona confirma otra vez, se preparan de cero. */

    this.toggle(this.elements.cardActions, false);

    modal.classList.remove("is-open");

    modal.setAttribute("aria-hidden", "true");

    /* El desplazamiento va después de soltar el bloqueo: con
       overflow-hidden todavía puesto, el body no puede desplazarse y
       el scrollIntoView se pierde. */

    document.body.classList.remove("overflow-hidden");

    if (irACuenta) {

        this.scrollToCountdown();

    }

};

/* ==========================================================
   IR A LA CUENTA REGRESIVA
========================================================== */

Rsvp.scrollToCountdown = function () {

    const destino = document.getElementById("cuenta");

    if (!destino) {

        /* Sin sección a la que ir el confeti no debe perderse: se
           lanza igualmente donde esté la persona. */

        this.celebrateIfPending();

        return;

    }

    /* Un fotograma de margen: el modal se cierra con transición y el
       navegador necesita rehacer el layout sin overflow-hidden antes
       de calcular a dónde desplazarse. */

    requestAnimationFrame(() => {

        if (typeof DOM !== "undefined" && DOM.scrollTo) {

            DOM.scrollTo(destino, "smooth");

        } else {

            destino.scrollIntoView({

                behavior: "smooth",

                block: "start"

            });

        }

        this.whenScrollSettles(

            () => this.celebrateIfPending()

        );

    });

};

/* ==========================================================
   ESPERAR A QUE PARE EL DESPLAZAMIENTO

   No se usa el evento "scrollend" porque Safari no lo tuvo hasta
   hace poco. Mirar los fotogramas funciona en todas partes.

   El detalle está en no dar por parado un desplazamiento que aún no
   ha arrancado: el suave tarda unos fotogramas en moverse, y contar
   sin más daría "quieto" al instante. Por eso hasta que no se
   detecta movimiento solo corre el plazo de cortesía, pensado para
   cuando la sección ya estaba a la vista y no hay nada que recorrer.
========================================================== */

Rsvp.whenScrollSettles = function (callback) {

    const ARRANQUE = 400;

    const TOPE = 3000;

    const inicio = Date.now();

    let ultimo = window.scrollY;

    let seMovio = false;

    let quietos = 0;

    let hecho = false;

    const rematar = () => {

        if (hecho) {

            return;

        }

        hecho = true;

        clearTimeout(seguro);

        callback();

    };

    /* El seguro va en un temporizador y no dentro del bucle de
       fotogramas. Con la pestaña en segundo plano requestAnimationFrame
       se detiene por completo —cero fotogramas por segundo—, así que un
       tope que solo se comprobara ahí dentro tampoco llegaría a saltar y
       el confeti se perdería. setTimeout sigue corriendo, como mucho
       ralentizado. Le puede pasar a quien pulsa "Aceptar" y se va a otra
       aplicación. */

    const seguro = setTimeout(rematar, TOPE);

    const mirar = () => {

        if (hecho) {

            return;

        }

        const actual = window.scrollY;

        if (Math.abs(actual - ultimo) >= 1) {

            seMovio = true;

            quietos = 0;

            ultimo = actual;

        } else {

            quietos++;

            if (seMovio && quietos >= 3) {

                rematar();

                return;

            }

            if (!seMovio && Date.now() - inicio > ARRANQUE) {

                rematar();

                return;

            }

        }

        requestAnimationFrame(mirar);

    };

    requestAnimationFrame(mirar);

};

/* ==========================================================
   CONFETI PENDIENTE
========================================================== */

Rsvp.celebrateIfPending = function () {

    if (!this.pendingCelebration) {

        return;

    }

    this.pendingCelebration = false;

    this.celebrate();

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
