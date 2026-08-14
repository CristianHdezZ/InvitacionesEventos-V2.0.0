/* ==========================================================
   INVITATION ENGINE V2
   FILE        : form.service.js
   VERSION     : 2.0.0
   MODULE      : FORM SERVICE

   Lo que comparten los dos formularios del sitio —la
   confirmación de asistencia y la sugerencia musical—: enviar
   por fetch en vez de recargar la página, bloquear el botón
   mientras viaja la petición y traducir la respuesta del
   servidor a un mensaje en castellano.

   Las dos APIs siguen el mismo contrato:
     200 { ok:true, ... }
     400 { ok:false, errors:[...] }   validación
     409 { ok:false, error }          duplicado
     429 { ok:false, error }          demasiados intentos
     500 { ok:false, error }
========================================================== */

"use strict";

/* ==========================================================
   SERVICE
========================================================== */

const FormService = {};

/* ==========================================================
   SUBMIT

   opciones:
     form      el <form>
     submit    el botón, para bloquearlo y cambiarle el texto
     status    el <p> donde va el mensaje
     etiqueta  texto normal del botón
     enviando  texto del botón mientras se envía
     onSuccess recibe (cuerpoDeLaRespuesta, datosDelFormulario)

     onDuplicate  opcional, solo para el 409. Recibe lo mismo que
                  onSuccess. Si se pasa, el duplicado deja de
                  pintarse como error: no lo es. Que un número ya
                  esté registrado es un hecho, y quien vuelve suele
                  venir a recuperar su tarjeta, no a equivocarse.
                  Sin este callback el 409 sigue saliendo en rojo,
                  que es lo que le conviene al formulario de música.
========================================================== */

FormService.submit = async function (opciones) {

    const {

        form,

        submit,

        status,

        etiqueta = "Enviar",

        enviando = "Enviando…",

        onSuccess,

        onDuplicate

    } = opciones;

    if (!form || form.dataset.sending === "true") {

        return;

    }

    /* Deja que el navegador muestre sus propios avisos en los
       campos obligatorios antes de molestar al servidor. */

    if (

        typeof form.reportValidity === "function" &&

        !form.reportValidity()

    ) {

        return;

    }

    const datos = Object.fromEntries(

        new FormData(form).entries()

    );

    form.dataset.sending = "true";

    this.setButton(submit, true, etiqueta, enviando);

    this.setStatus(status, "", "");

    try {

        const response = await fetch(

            form.dataset.endpoint,

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify(datos)

            }

        );

        const body = await response.json().catch(() => null);

        if (response.ok && body && body.ok) {

            if (typeof onSuccess === "function") {

                onSuccess(body, datos);

            }

            return;

        }

        if (

            response.status === 409 &&

            typeof onDuplicate === "function"

        ) {

            onDuplicate(body || {}, datos);

            return;

        }

        this.setStatus(

            status,

            this.errorMessage(response.status, body),

            "error"

        );

    }

    catch (error) {

        console.error("[FormService]", error);

        this.setStatus(

            status,

            "No pudimos conectar. Revisa tu conexión e inténtalo de nuevo.",

            "error"

        );

    }

    finally {

        delete form.dataset.sending;

        this.setButton(submit, false, etiqueta, enviando);

    }

};

/* ==========================================================
   MENSAJE DE ERROR

   El servidor manda 'errors' en plural cuando falla la
   validación y 'error' en singular para todo lo demás.
========================================================== */

FormService.errorMessage = function (status, body) {

    if (body && Array.isArray(body.errors) && body.errors.length) {

        return body.errors.join(" ");

    }

    if (body && body.error) {

        return body.error;

    }

    if (status === 429) {

        return "Demasiados intentos. Espera un minuto e inténtalo de nuevo.";

    }

    return "No se pudo enviar. Inténtalo de nuevo.";

};

/* ==========================================================
   BOTÓN
========================================================== */

FormService.setButton = function (boton, ocupado, etiqueta, enviando) {

    if (!boton) {

        return;

    }

    boton.disabled = ocupado;

    boton.textContent = ocupado ? enviando : etiqueta;

};

/* ==========================================================
   MENSAJE

   data-state lo usa components/forms.css para el color.
========================================================== */

FormService.setStatus = function (elemento, texto, estado) {

    if (!elemento) {

        return;

    }

    elemento.textContent = texto;

    if (estado) {

        elemento.dataset.state = estado;

    } else {

        delete elemento.dataset.state;

    }

};

/* ==========================================================
   EXPORT
========================================================== */

window.FormService = FormService;

/* ==========================================================
   END OF FILE
========================================================== */
