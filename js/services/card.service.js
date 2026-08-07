/* ==========================================================
   INVITATION ENGINE V2
   FILE        : card.service.js
   VERSION     : 2.0.0
   MODULE      : CARD SERVICE

   Genera la tarjeta de invitación en PDF que se descarga al
   confirmar asistencia: 100 x 150 mm, con el nombre de la
   quinceañera en cursiva, el del invitado, los datos del lugar
   y un QR que abre el mapa.

   Depende de jsPDF y qrcodejs, que se cargan por CDN desde
   js/include.js. Si alguna falta, devuelve null y quien llama
   sigue adelante sin tarjeta: la confirmación ya quedó
   guardada, que es lo importante.
========================================================== */

"use strict";

/* ==========================================================
   SERVICE
========================================================== */

const CardService = {

    ancho: 100,

    alto: 150,

    fuente: null,

    colores: {

        rosaClara: "#FDF3F6",

        rosaProfunda: "#F3D3DE",

        oro: "#B8935C",

        vino: "#6B3A4A",

        tintaSuave: "#8A6B75",

        papel: "#FEFAFB"

    }

};

/* ==========================================================
   FUENTE CURSIVA

   jsPDF solo trae tipografías estándar, así que la cursiva se
   descarga una vez y se guarda en caché. Si falla —sin
   conexión, CDN caído— se cae a la itálica de Times: la
   tarjeta sale igual, con otra letra.
========================================================== */

CardService.loadFont = function (doc) {

    if (!this.fuente) {

        this.fuente = fetch(

            "https://raw.githubusercontent.com/google/fonts/main/ofl/greatvibes/GreatVibes-Regular.ttf"

        )

            .then(r => {

                if (!r.ok) {

                    throw new Error("HTTP " + r.status);

                }

                return r.arrayBuffer();

            })

            .then(buffer => {

                let binario = "";

                const bytes = new Uint8Array(buffer);

                const trozo = 8192;

                for (let i = 0; i < bytes.length; i += trozo) {

                    binario += String.fromCharCode(

                        ...bytes.subarray(i, i + trozo)

                    );

                }

                return btoa(binario);

            })

            .catch(() => null);

    }

    return this.fuente.then(base64 => {

        if (!base64) {

            return false;

        }

        try {

            doc.addFileToVFS("GreatVibes.ttf", base64);

            doc.addFont("GreatVibes.ttf", "GreatVibes", "normal");

            return true;

        }

        catch (error) {

            return false;

        }

    });

};

/* ==========================================================
   AJUSTE DE TAMAÑO

   Baja el cuerpo de letra hasta que el texto quepa en el ancho
   dado, sin pasar de un mínimo legible.
========================================================== */

CardService.fitText = function (doc, texto, ancho, maximo, minimo) {

    let tamano = maximo;

    doc.setFontSize(tamano);

    while (

        doc.getTextWidth(texto) > ancho &&

        tamano > minimo

    ) {

        tamano -= .5;

        doc.setFontSize(tamano);

    }

    return tamano;

};

/* ==========================================================
   FONDO

   Degradado simulado con bandas: jsPDF no tiene gradientes.
========================================================== */

CardService.paintBackground = function (doc) {

    const bandas = 30;

    const desde = this.hexToRgb(this.colores.rosaClara);

    const hasta = this.hexToRgb(this.colores.rosaProfunda);

    for (let i = 0; i < bandas; i++) {

        const t = i / (bandas - 1);

        doc.setFillColor(

            Math.round(desde.r + (hasta.r - desde.r) * t),

            Math.round(desde.g + (hasta.g - desde.g) * t),

            Math.round(desde.b + (hasta.b - desde.b) * t)

        );

        doc.rect(

            0,

            (this.alto / bandas) * i,

            this.ancho,

            this.alto / bandas + .6,

            "F"

        );

    }

};

CardService.hexToRgb = function (hex) {

    const v = hex.replace("#", "");

    return {

        r: parseInt(v.slice(0, 2), 16),

        g: parseInt(v.slice(2, 4), 16),

        b: parseInt(v.slice(4, 6), 16)

    };

};

/* ==========================================================
   ESQUINAS

   Cuatro ángulos dorados, como el marco de una invitación
   impresa.
========================================================== */

CardService.paintCorners = function (doc) {

    const m = 6;

    const l = 10;

    doc.setDrawColor(this.colores.oro);

    doc.setLineWidth(.4);

    const esquinas = [

        [m, m, 1, 1],

        [this.ancho - m, m, -1, 1],

        [m, this.alto - m, 1, -1],

        [this.ancho - m, this.alto - m, -1, -1]

    ];

    esquinas.forEach(([x, y, dx, dy]) => {

        doc.line(x, y, x + l * dx, y);

        doc.line(x, y, x, y + l * dy);

    });

};

/* ==========================================================
   CORONA DIBUJADA

   Respaldo cuando el panel no tiene una imagen de corona.
========================================================== */

CardService.paintCrown = function (doc, cx, y) {

    doc.setDrawColor(this.colores.oro);

    doc.setFillColor(this.colores.oro);

    doc.setLineWidth(.6);

    const w = 14;

    const h = 7;

    const x = cx - w / 2;

    doc.lines(

        [

            [0, -h],

            [w / 4, h * .55],

            [w / 4, -h],

            [w / 4, h],

            [w / 4, -h * .55],

            [0, h]

        ],

        x,

        y,

        [1, 1],

        "S"

    );

    doc.line(x, y, x + w, y);

};

/* ==========================================================
   IMAGEN PARA EL PDF

   Carga un .png y le recorta el margen transparente antes de
   meterlo en la tarjeta. Muchos PNG de corona traen un marco
   vacío enorme alrededor del dibujo: sin recortar, la corona
   sale diminuta y descentrada.

   Devuelve null si la imagen no carga o si el canvas queda
   "manchado" —eso pasaría con una imagen de otro dominio sin
   CORS— para que la tarjeta siga saliendo con el dibujo
   vectorial en vez de romperse.
========================================================== */

CardService.imageForPdf = function (url, maxLado) {

    return new Promise(resolve => {

        if (!url) {

            resolve(null);

            return;

        }

        const img = new Image();

        img.crossOrigin = "anonymous";

        img.onload = () => {

            try {

                resolve(this.trim(img, maxLado));

            }

            catch (error) {

                resolve(null);

            }

        };

        img.onerror = () => resolve(null);

        img.src = url;

    });

};

CardService.trim = function (img, maxLado) {

    const w = img.naturalWidth;

    const h = img.naturalHeight;

    if (!w || !h) {

        return null;

    }

    /* Se mide sobre una copia reducida: recorrer los píxeles de
       una imagen de 3000px sería lento y no hace falta esa
       precisión para hallar los bordes. */

    const escala = Math.min(1, 400 / Math.max(w, h));

    const mw = Math.max(1, Math.round(w * escala));

    const mh = Math.max(1, Math.round(h * escala));

    const medida = document.createElement("canvas");

    medida.width = mw;

    medida.height = mh;

    const mctx = medida.getContext("2d");

    mctx.drawImage(img, 0, 0, mw, mh);

    const datos = mctx.getImageData(0, 0, mw, mh).data;

    let x0 = mw;

    let y0 = mh;

    let x1 = -1;

    let y1 = -1;

    for (let y = 0; y < mh; y++) {

        for (let x = 0; x < mw; x++) {

            /* Umbral 12: ignora el halo casi transparente que
               dejan algunos exportadores. */

            if (datos[(y * mw + x) * 4 + 3] > 12) {

                if (x < x0) { x0 = x; }

                if (y < y0) { y0 = y; }

                if (x > x1) { x1 = x; }

                if (y > y1) { y1 = y; }

            }

        }

    }

    if (x1 < 0) {

        return null;

    }

    /* De vuelta a las coordenadas de la imagen original. */

    const sx = Math.floor(x0 / escala);

    const sy = Math.floor(y0 / escala);

    const sw = Math.ceil((x1 - x0 + 1) / escala);

    const sh = Math.ceil((y1 - y0 + 1) / escala);

    const tope = maxLado || 320;

    const reduccion = Math.min(1, tope / Math.max(sw, sh));

    const salida = document.createElement("canvas");

    salida.width = Math.max(1, Math.round(sw * reduccion));

    salida.height = Math.max(1, Math.round(sh * reduccion));

    salida

        .getContext("2d")

        .drawImage(

            img,

            sx, sy, sw, sh,

            0, 0, salida.width, salida.height

        );

    return {

        dataUrl: salida.toDataURL("image/png"),

        width: salida.width,

        height: salida.height

    };

};

/* ==========================================================
   DIVISOR
========================================================== */

CardService.paintDivider = function (doc, cx, y, medio) {

    doc.setDrawColor(this.colores.oro);

    doc.setLineWidth(.3);

    doc.line(cx - medio, y, cx - 2, y);

    doc.line(cx + 2, y, cx + medio, y);

    doc.setFontSize(6);

    doc.setTextColor(this.colores.oro);

    doc.text("✦", cx, y + 1, { align: "center" });

};

/* ==========================================================
   QR

   qrcodejs pinta sobre un contenedor del DOM, así que se usa
   uno temporal fuera de pantalla y se recoge el canvas.
========================================================== */

CardService.qrDataUrl = function (texto, tamano) {

    return new Promise(resolve => {

        if (typeof QRCode === "undefined" || !texto) {

            resolve(null);

            return;

        }

        const caja = document.createElement("div");

        caja.style.position = "absolute";

        caja.style.left = "-9999px";

        document.body.appendChild(caja);

        try {

            new QRCode(caja, {

                text: texto,

                width: tamano,

                height: tamano,

                colorDark: this.colores.vino,

                colorLight: "#ffffff",

                correctLevel: QRCode.CorrectLevel.M

            });

            /* qrcodejs dibuja de forma síncrona, pero da un
               respiro por si el navegador aún no ha pintado. */

            setTimeout(() => {

                const canvas = caja.querySelector("canvas");

                const url = canvas

                    ? canvas.toDataURL("image/png")

                    : null;

                caja.remove();

                resolve(url);

            }, 60);

        }

        catch (error) {

            caja.remove();

            resolve(null);

        }

    });

};

/* ==========================================================
   GENERATE

   Devuelve un Blob del PDF, o null si no se pudo.
========================================================== */

CardService.generate = async function (nombreInvitado, config) {

    if (

        typeof window.jspdf === "undefined" ||

        !window.jspdf.jsPDF

    ) {

        return null;

    }

    const { jsPDF } = window.jspdf;

    const doc = new jsPDF({

        unit: "mm",

        format: [this.ancho, this.alto]

    });

    const cx = this.ancho / 2;

    const c = this.colores;

    this.paintBackground(doc);

    this.paintCorners(doc);

    const cursiva = await this.loadFont(doc).catch(() => false);

    /* ---- Encabezado ---- */

    doc.setFont("times", "italic");

    doc.setFontSize(9);

    doc.setTextColor(c.oro);

    doc.text(

        "Con la bendición de Dios y mi familia",

        cx,

        16,

        { align: "center" }

    );

    /* Corona: la imagen del panel si la hay, y si no el dibujo
       vectorial. La imagen ya viene recortada al dibujo real,
       así que basta con centrarla y darle el alto deseado. */

    let corona = null;

    if (

        config.corona &&

        config.corona.tipo === "imagen" &&

        config.corona.imagenUrl

    ) {

        corona = await this.imageForPdf(config.corona.imagenUrl, 320);

    }

    if (corona) {

        try {

            const alto = 12;

            const ancho = alto * (corona.width / corona.height);

            doc.addImage(

                corona.dataUrl,

                "PNG",

                cx - ancho / 2,

                19,

                ancho,

                alto

            );

        }

        catch (error) {

            this.paintCrown(doc, cx, 27);

        }

    } else {

        this.paintCrown(doc, cx, 27);

    }

    /* ---- Nombre de la quinceañera ---- */

    const nombreCompleto = [config.nombre, config.apellido]

        .filter(Boolean)

        .join(" ") || "Invitación";

    if (cursiva) {

        doc.setFont("GreatVibes", "normal");

        this.fitText(doc, nombreCompleto, 84, 38, 16);

    } else {

        doc.setFont("times", "bolditalic");

        this.fitText(doc, nombreCompleto, 82, 26, 10);

    }

    doc.setTextColor(c.vino);

    doc.text(nombreCompleto, cx, 40, { align: "center" });

    doc.setFont("helvetica", "normal");

    doc.setFontSize(10);

    doc.setTextColor(c.oro);

    doc.text("X V   A Ñ O S", cx, 47, { align: "center" });

    this.paintDivider(doc, cx, 52, 15);

    /* ---- Fecha ---- */

    const fecha = config.fechaEvento

        ? new Date(config.fechaEvento)

        : null;

    if (fecha && !isNaN(fecha.getTime())) {

        let texto = fecha.toLocaleDateString("es-ES", {

            weekday: "long",

            day: "numeric",

            month: "long",

            year: "numeric"

        });

        texto = texto.charAt(0).toUpperCase() + texto.slice(1);

        doc.setFont("times", "italic");

        doc.setFontSize(9);

        doc.setTextColor(c.vino);

        doc.text(texto, cx, 58, { align: "center" });

    }

    /* ---- Invitado ---- */

    doc.setFillColor(c.papel);

    doc.setDrawColor(c.oro);

    doc.setLineWidth(.3);

    doc.roundedRect(12, 64, 76, 16, 4, 4, "FD");

    doc.setFont("helvetica", "normal");

    doc.setFontSize(6.5);

    doc.setTextColor(c.oro);

    doc.text("I N V I T A D O", cx, 69.5, { align: "center" });

    const invitado = nombreInvitado || "Invitado especial";

    doc.setFont(

        cursiva ? "GreatVibes" : "times",

        cursiva ? "normal" : "italic"

    );

    this.fitText(doc, invitado, 70, cursiva ? 18 : 12, cursiva ? 11 : 7);

    doc.setTextColor(c.vino);

    doc.text(invitado, cx, 77, { align: "center" });

    /* ---- Lugar, dirección y hora ----
       Todo en un flujo de arriba abajo, para que nunca se pisen
       sin importar cuántas líneas ocupe la dirección. */

    const ubicacion = config.ubicacion || {};

    let y = 88;

    if (ubicacion.nombreLugar) {

        doc.setFont("helvetica", "bold");

        doc.setFontSize(9);

        doc.setTextColor(c.vino);

        doc.text(ubicacion.nombreLugar, cx, y, {

            align: "center",

            maxWidth: 82

        });

        y += 5.5;

    }

    if (ubicacion.direccion) {

        doc.setFont("helvetica", "normal");

        doc.setFontSize(7.5);

        doc.setTextColor(c.tintaSuave);

        const lineas = doc.splitTextToSize(ubicacion.direccion, 78);

        doc.text(lineas, cx, y, { align: "center" });

        y += lineas.length * 3.6 + 3;

    }

    if (ubicacion.hora) {

        doc.setFont("helvetica", "bold");

        doc.setFontSize(8.5);

        doc.setTextColor(c.oro);

        doc.text("Hora: " + ubicacion.hora, cx, y, { align: "center" });

        y += 7;

    }

    /* ---- QR del mapa ---- */

    if (ubicacion.mapaLink) {

        const qr = await this.qrDataUrl(ubicacion.mapaLink, 240);

        if (qr) {

            doc.setFont("times", "italic");

            doc.setFontSize(6.5);

            doc.setTextColor(c.oro);

            doc.text(

                "Escanea para ver cómo llegar",

                cx,

                y,

                { align: "center" }

            );

            y += 5;

            const lado = 26;

            const marco = 1.8;

            const qx = cx - lado / 2;

            doc.setDrawColor(c.oro);

            doc.setLineWidth(.3);

            doc.setFillColor("#ffffff");

            doc.roundedRect(

                qx - marco,

                y - marco,

                lado + marco * 2,

                lado + marco * 2,

                2,

                2,

                "FD"

            );

            doc.addImage(qr, "PNG", qx, y, lado, lado);

        }

    }

    return doc.output("blob");

};

/* ==========================================================
   WHATSAPP

   El formulario pide el número local de 10 dígitos, así que se
   asume Colombia (+57) cuando no trae indicativo.
========================================================== */

CardService.whatsappLink = function (telefono, mensaje) {

    if (!telefono) {

        return null;

    }

    const digitos = String(telefono).replace(/\D/g, "");

    if (!digitos) {

        return null;

    }

    const numero = digitos.length === 10

        ? "57" + digitos

        : digitos;

    let url = "https://api.whatsapp.com/send/?phone=" + numero;

    if (mensaje) {

        url += "&text=" + encodeURIComponent(mensaje);

    }

    return url;

};

/* ==========================================================
   EXPORT
========================================================== */

window.CardService = CardService;

/* ==========================================================
   END OF FILE
========================================================== */
