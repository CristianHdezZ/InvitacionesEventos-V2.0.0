/* ==========================================================
   INVITATION ENGINE V2
   FILE        : content.manager.js
   VERSION     : 2.0.0
   MODULE      : CONTENT MANAGER

   Pinta en el DOM los textos e imágenes que edita el panel de
   admin. Es la otra mitad del puente: ThemeManager lleva la
   capa visual (colores, tipografías, escalas) y esto lleva el
   contenido.

   Las listas —itinerario y galería— NO se pintan aquí: las
   maneja su propio componente, que sabe cuándo volver a
   observarlas o a reiniciar el carrusel.

   REGLA DE ORO: si la config no trae un valor, no se toca el
   DOM. Cada partial ya viene con contenido escrito, así que un
   campo vacío debe dejar lo que hay, nunca borrarlo.
========================================================== */

"use strict";

/* ==========================================================
   MANAGER
========================================================== */

const ContentManager = {

    applied: false

};

/* ==========================================================
   TABLA DE TEXTOS

   ruta en la config → selector donde va.
========================================================== */

ContentManager.TEXTS = [

    { path: "nombre", target: ".hero__name" },

    { path: "nombre", target: ".gate__name" },

    { path: "apellido", target: ".hero__lastname" },

    { path: "fraseInvitacion", target: ".hero__eyebrow" },

    { path: "fraseFecha", target: ".hero__subtitle" },

    { path: "fraseGate", target: ".gate__quote" },

    { path: "mensajeCarta", target: ".letter__text" },

    { path: "footerMensaje", target: ".footer__mensaje" },

    { path: "regalos.titulo", target: "#regalosTitulo" },

    { path: "regalos.mensaje", target: "#regalosMensaje" },

    { path: "regalos.detalle", target: "#regalosDetalle" },

    { path: "vestimenta.nota", target: "#vestimentaNota" },

    { path: "ubicacion.nombreLugar", target: ".detalle-card h3" },

    { path: "ubicacion.direccion", target: ".ubicacion__direccion" },

    /* El "Hora: " lo pone el ::before de la regla CSS. */

    { path: "ubicacion.hora", target: ".detalle-card__hora" }

];

/* ==========================================================
   APPLY
========================================================== */

ContentManager.apply = function (config) {

    if (!config) {

        return false;

    }

    this.applyTexts(config);

    this.applyPhoto(config);

    this.applyMusic(config);

    this.applyLottie(config);

    this.applyHashtag(config);

    this.applyDate(config);

    this.applyGifts(config);

    this.applyLocation(config);

    this.applyDressCode(config);

    this.applyArtwork(config);

    this.applied = true;

    return true;

};

/* ==========================================================
   TEXTOS
========================================================== */

ContentManager.applyTexts = function (config) {

    this.TEXTS.forEach(({ path, target }) => {

        const value = ConfigService.get(path);

        if (value === null) {

            return;

        }

        document

            .querySelectorAll(target)

            .forEach(el => {

                el.textContent = value;

            });

    });

};

/* ==========================================================
   FOTO PRINCIPAL
========================================================== */

ContentManager.applyPhoto = function () {

    const src = ConfigService.get("fotoPrincipal");

    const img = document.getElementById("fotoPrincipal");

    if (!src || !img) {

        return;

    }

    img.src = src;

    const nombre = ConfigService.get("nombre", "");

    const apellido = ConfigService.get("apellido", "");

    const completo = (nombre + " " + apellido).trim();

    if (completo) {

        img.alt = "Retrato de " + completo;

    }

};

/* ==========================================================
   MÚSICA

   Se cambia el <source> y se recarga: sin el load() el
   navegador sigue con la pista anterior ya bufferizada.
========================================================== */

ContentManager.applyMusic = function () {

    const src = ConfigService.get("musica");

    const audio = document.getElementById("bgMusic");

    if (!src || !audio) {

        return;

    }

    const source = audio.querySelector("source");

    if (!source || source.getAttribute("src") === src) {

        return;

    }

    source.setAttribute("src", src);

    audio.load();

};

/* ==========================================================
   LOTTIE DE LA PORTADA
========================================================== */

ContentManager.applyLottie = function () {

    const player = document.getElementById("gateLottie");

    if (!player) {

        return;

    }

    /* Interruptor propio: vaciar la URL solo devuelve la
       animación por defecto, no la quita. */

    if (ConfigService.get("mostrarLottie", true) === false) {

        player.style.display = "none";

        /* Sin src el reproductor no descarga el .json: la
           animación apagada tampoco debe pesar. */

        player.removeAttribute("src");

        return;

    }

    player.style.display = "";

    const src = ConfigService.get("lottieGate");

    if (src && player.getAttribute("src") !== src) {

        player.setAttribute("src", src);

    }

    /* El reproductor (94,2 KB) se pide aquí y no al arrancar: con el
       interruptor de arriba apagado no se descarga siquiera, que era
       la contradicción de tener la opción en el panel y bajarlo igual.

       Se lanza sin esperar: <lottie-player> es un custom element, y
       al definirse lee los atributos que ya tenga puestos. Por eso el
       src se asigna antes. */

    if (typeof window.cargarLibreria === "function") {

        window.cargarLibreria("lottie");

    }

};

/* ==========================================================
   HASHTAG

   Aparece en el pie y en el álbum compartido. El enlace lleva
   a la etiqueta en Instagram, sin la almohadilla.
========================================================== */

ContentManager.applyHashtag = function () {

    const hashtag = ConfigService.get("hashtag");

    if (!hashtag) {

        return;

    }

    const limpio = hashtag.replace(/^#/, "");

    const conAlmohadilla = "#" + limpio;

    document

        .querySelectorAll(".footer__hashtag, #albumHashtagText")

        .forEach(el => {

            el.textContent = conAlmohadilla;

        });

    const enlace = document.getElementById("albumHashtagLink");

    if (enlace && limpio) {

        enlace.href =

            "https://www.instagram.com/explore/tags/" +

            encodeURIComponent(limpio.toLowerCase()) +

            "/";

    }

};

/* ==========================================================
   FECHA

   El badge de la portada muestra día de la semana, número y
   mes; el año va aparte. La cuenta regresiva lee la fecha por
   su cuenta (ver Countdown.loadDate).
========================================================== */

ContentManager.applyDate = function () {

    const raw = ConfigService.get("fechaEvento");

    if (!raw) {

        return;

    }

    const fecha = new Date(raw);

    if (isNaN(fecha.getTime())) {

        return;

    }

    const badge = document.querySelector(".hero__badge");

    if (badge) {

        const numero = badge.querySelector("strong");

        const etiquetas = badge.querySelectorAll(

            ".hero__badge-label span"

        );

        if (numero) {

            numero.textContent = fecha.getDate();

        }

        if (etiquetas.length >= 2) {

            etiquetas[0].textContent = this.capitalize(

                fecha.toLocaleDateString("es-ES", { weekday: "long" })

            );

            etiquetas[1].textContent = this.capitalize(

                fecha.toLocaleDateString("es-ES", { month: "long" })

            );

        }

    }

    const anio = document.querySelector(".hero__year");

    if (anio) {

        anio.textContent = fecha.getFullYear();

    }

};

/* Escapa una URL para meterla en un atributo HTML. */

ContentManager.escapeAttr = function (value) {

    return String(value === undefined || value === null ? "" : value)

        .replace(/&/g, "&amp;")

        .replace(/"/g, "&quot;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;");

};

ContentManager.capitalize = function (texto) {

    return typeof texto === "string" && texto.length

        ? texto.charAt(0).toUpperCase() + texto.slice(1)

        : texto;

};

/* ==========================================================
   REGALOS

   El panel permite apagar la sección entera.
========================================================== */

ContentManager.applyGifts = function () {

    const seccion = document.getElementById("regalos");

    if (!seccion) {

        return;

    }

    const activo = ConfigService.get("regalos.activo", true);

    seccion.hidden = activo === false;

    /* Icono del sobre. El panel lo llama "ícono de la sección" y
       es el que va dentro del círculo, encima del mensaje. */

    const icono = ConfigService.get("regalos.icono");

    const hueco = seccion.querySelector(".regalos__sobre");

    if (icono && hueco && typeof IconService !== "undefined") {

        IconService.inject(hueco, icono);

    }

};

/* ==========================================================
   UBICACIÓN

   Mapa y street view se pueden ocultar por separado desde el
   panel.
========================================================== */

ContentManager.applyLocation = function () {

    this.setMap(

        "#mapaEstaticoFrame",

        "#ubicacionMapaBlock",

        ConfigService.get("ubicacion.mapaEmbedUrl"),

        ConfigService.get("ubicacion.mostrarMapa", true)

    );

    this.setMap(

        "#mapaStreetViewFrame",

        "#ubicacionStreetViewBlock",

        ConfigService.get("ubicacion.streetViewUrl"),

        ConfigService.get("ubicacion.mostrarStreetView", true)

    );

    /* El mismo destino sirve para el botón de abajo y para el
       icono de la ficha. */

    const enlace = ConfigService.get("ubicacion.mapaLink");

    if (enlace) {

        document

            .querySelectorAll(

                ".ubicacion__cta, #ubicacionIconoLink"

            )

            .forEach(a => {

                a.href = enlace;

            });

    }

};

/* El bloque que se oculta es el que envuelve al título y al
   marco: si se ocultara solo el iframe quedaría la etiqueta
   "Mapa" suelta encima de un hueco. */

ContentManager.setMap = function (

    frameSelector,

    blockSelector,

    url,

    visible

) {

    const bloque = document.querySelector(blockSelector);

    if (bloque) {

        bloque.hidden = visible === false;

    }

    if (visible === false) {

        return;

    }

    const marco = document.querySelector(frameSelector);

    if (marco && url && marco.getAttribute("src") !== url) {

        marco.setAttribute("src", url);

    }

};

/* ==========================================================
   VESTIMENTA

   Dos iconos grandes —lo que llevan ellos y ellas— más la
   muestra del color a evitar, que es otro icono teñido con el
   color elegido.
========================================================== */

ContentManager.applyDressCode = function () {

    const swatch = document.getElementById("colorEvitarSwatch");

    const color = ConfigService.get("vestimenta.colorEvitar");

    if (swatch && color) {

        swatch.style.color = color;

    }

    if (typeof IconService === "undefined") {

        return;

    }

    const iconos = [

        ...document.querySelectorAll(

            "#vestimentaIcons .vestimenta__icon"

        )

    ];

    /* El panel deja subir un .png propio en lugar del icono. Si
       hay imagen, manda ella; si no, el identificador. */

    const elegidos = [

        {
            id: ConfigService.get("vestimenta.iconoIzquierdo"),
            imagen: ConfigService.get("vestimenta.iconoIzquierdoImagen")
        },

        {
            id: ConfigService.get("vestimenta.iconoDerecho"),
            imagen: ConfigService.get("vestimenta.iconoDerechoImagen")
        }

    ];

    elegidos.forEach(({ id, imagen }, i) => {

        const hueco = iconos[i];

        if (!hueco) {

            return;

        }

        if (imagen) {

            const alt = i === 0

                ? "Ejemplo de vestimenta"

                : "Ejemplo de vestimenta";

            hueco.innerHTML =

                "<img src=\"" + this.escapeAttr(imagen) + "\" " +

                "alt=\"" + alt + "\">";

            return;

        }

        if (id) {

            IconService.inject(hueco, id);

        }

    });

    const iconoColor = ConfigService.get(

        "vestimenta.iconoColorEvitar"

    );

    if (swatch && iconoColor) {

        IconService.inject(swatch, iconoColor);

    }

};

/* ==========================================================
   ILUSTRACIONES: DIBUJO O IMAGEN

   Corona, quinceañera y guirnaldas existen dos veces en el
   marcado: un <svg> dibujado a mano y un <img> vacío al lado.
   El panel decide cuál manda con 'tipo': 'svg' muestra el
   dibujo, 'imagen' muestra el .png que se haya subido.

   El <img> se oculta con el atributo [hidden], que reset.css
   respeta con display:none !important. El <svg> se oculta con
   la misma propiedad para no depender de una clase extra.

   Si el tipo es 'imagen' pero no hay URL, se deja el dibujo:
   más vale la ilustración de siempre que un hueco.
========================================================== */

ContentManager.ARTWORK = [

    {
        path: "corona",
        pares: [
            ["gateCoronaSvg", "gateCoronaImg"],
            ["heroCoronaSvg", "heroCoronaImg"]
        ]
    },

    {
        path: "ilustracionQuinceanera",
        pares: [
            ["gateDressSvg", "gateDressImg"],
            ["cartaDressSvg", "cartaDressImg"]
        ]
    },

    {
        path: "decoracionFloral",
        pares: [
            ["gateFloralTopSvg", "gateFloralTopImg"],
            ["gateFloralBottomSvg", "gateFloralBottomImg"],
            ["cartaFloralTopSvg", "cartaFloralTopImg"],
            ["cartaFloralBottomSvg", "cartaFloralBottomImg"]
        ]
    }

];

ContentManager.applyArtwork = function () {

    /* Pase lo que pase con la config, al salir de aquí se
       retira la marca: si algo falla se ve el dibujo SVG, que
       es el estado por defecto del marcado, pero nunca se queda
       la portada sin ilustraciones. */

    try {

        this.resolveArtwork();

    }

    finally {

        document.documentElement.classList.remove(

            "artwork-pendiente"

        );

    }

};

ContentManager.resolveArtwork = function () {

    this.ARTWORK.forEach(({ path, pares }) => {

        const tipo = ConfigService.get(path + ".tipo", "svg");

        const url = ConfigService.get(path + ".imagenUrl");

        const usarImagen = tipo === "imagen" && Boolean(url);

        /* Las guirnaldas se pueden apagar por completo desde el
           panel: afecta a las cuatro posiciones a la vez. */

        const oculto =

            path === "decoracionFloral" &&

            ConfigService.get("decoracionFloral.mostrar", true) === false;

        pares.forEach(([idSvg, idImg]) => {

            this.swapArtwork(idSvg, idImg, usarImagen, url, oculto);

        });

    });

    this.applyButterflies();

    this.adjustCrownSpacing();

};

/* ==========================================================
   AIRE DE LA CORONA

   Los PNG de corona traen mucho margen transparente alrededor
   del dibujo (sombras, decoración, el lienzo de origen). Ese
   aire cuenta como alto del elemento, así que el control de
   "espacio entre la corona y el nombre" del panel acababa
   sumando aire + espacio, y la corona parecía flotar lejos.

   Aquí se mide el margen inferior transparente y se descuenta,
   para que el número del panel sea el espacio que de verdad se
   ve. Es la lógica que hacía scriptOld.js y que se perdió.

   Si la imagen viene de otro dominio sin CORS el canvas queda
   bloqueado y la medición falla en silencio: se deja el margen
   tal cual y el resto sigue funcionando.
========================================================== */

ContentManager.CROWNS = ["gateCoronaImg", "heroCoronaImg"];

ContentManager.adjustCrownSpacing = function () {

    this.CROWNS.forEach(id => {

        const img = document.getElementById(id);

        if (!img) {

            return;

        }

        /* Se limpia siempre: si se vuelve al dibujo SVG no debe
           quedar el ajuste del PNG anterior. */

        img.style.marginBottom = "";

        const src = img.getAttribute("src");

        if (!src || img.hasAttribute("hidden")) {

            return;

        }

        this.measureAlphaTrim(src).then(recorte => {

            if (!recorte || img.getAttribute("src") !== src) {

                return;

            }

            requestAnimationFrame(() => {

                const alto = img.getBoundingClientRect().height;

                const aire = recorte.abajo * alto;

                img.style.marginBottom =

                    "calc(var(--espacio-corona, 14px) - " +

                    aire.toFixed(1) +

                    "px)";

            });

        });

    });

};

/* Mide qué fracción del alto ocupa el margen transparente,
   arriba y abajo. Se analiza sobre una copia pequeña: para
   hallar dónde empieza el dibujo no hace falta más detalle. */

ContentManager.measureAlphaTrim = function (src) {

    return new Promise(resolve => {

        const img = new Image();

        /* crossOrigin solo para imágenes de otro dominio: en las
           propias crea una entrada de caché distinta y provoca una
           segunda petición de la misma imagen. */

        if (/^https?:\/\//i.test(src)) {

            const mismoOrigen = src.indexOf(location.origin) === 0;

            if (!mismoOrigen) {

                img.crossOrigin = "anonymous";

            }

        }

        img.onload = () => {

            try {

                const lado = 200;

                const canvas = document.createElement("canvas");

                canvas.width = lado;

                canvas.height = lado;

                const ctx = canvas.getContext("2d");

                ctx.drawImage(img, 0, 0, lado, lado);

                const datos = ctx.getImageData(0, 0, lado, lado).data;

                let arriba = lado;

                let abajo = 0;

                for (let y = 0; y < lado; y++) {

                    for (let x = 0; x < lado; x++) {

                        /* Umbral 10: ignora el halo casi
                           transparente de algunos exportadores. */

                        if (datos[(y * lado + x) * 4 + 3] > 10) {

                            if (y < arriba) { arriba = y; }

                            if (y > abajo) { abajo = y; }

                        }

                    }

                }

                if (abajo < arriba) {

                    resolve(null);

                    return;

                }

                resolve({

                    arriba: arriba / lado,

                    abajo: (lado - 1 - abajo) / lado

                });

            }

            catch (error) {

                resolve(null);

            }

        };

        img.onerror = () => resolve(null);

        img.src = src;

    });

};

/* ==========================================================
   MARIPOSAS

   Decoración de la portada, con su propio interruptor.
========================================================== */

ContentManager.applyButterflies = function () {

    const mostrar = ConfigService.get("mostrarMariposas", true) !== false;

    document

        .querySelectorAll(".gate__butterfly")

        .forEach(el => {

            el.style.display = mostrar ? "" : "none";

        });

};

ContentManager.swapArtwork = function (

    idSvg,

    idImg,

    usarImagen,

    url,

    oculto

) {

    const svg = document.getElementById(idSvg);

    const img = document.getElementById(idImg);

    /* Apagado desde el panel: se ocultan las dos variantes y no
       se toca nada más. */

    if (oculto) {

        if (svg) {

            svg.style.display = "none";

        }

        if (img) {

            img.setAttribute("hidden", "");

        }

        return;

    }

    if (svg) {

        svg.style.display = usarImagen ? "none" : "";

    }

    if (!img) {

        return;

    }

    if (usarImagen) {

        if (img.getAttribute("src") !== url) {

            img.src = url;

        }

        img.removeAttribute("hidden");

    } else {

        img.setAttribute("hidden", "");

    }

};

/* ==========================================================
   EXPORT
========================================================== */

window.ContentManager = ContentManager;

/* ==========================================================
   END OF FILE
========================================================== */
