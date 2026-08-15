/* ==========================================================
   INVITATION ENGINE V2
   FILE        : theme.manager.js
   VERSION     : 2.0.0
   MODULE      : THEME MANAGER

   Traduce la configuración del panel de admin a variables CSS
   sobre :root. Es el puente que faltaba: los módulos ya piden
   los colores como var(--oro, var(--color-gold)) —el nombre V1
   primero—, así que basta con escribir esos nombres aquí para
   que todos los controles del panel vuelvan a mandar.

   Lo que NO hace: pintar textos, fechas ni listas. De eso se
   encarga cada componente. Aquí solo va la capa visual.
========================================================== */

"use strict";

/* ==========================================================
   MANAGER
========================================================== */

const ThemeManager = {

    applied: false,

    root: null

};

/* ==========================================================
   TABLAS

   Los nombres de escala del panel ('normal', 'grande'…) y su
   valor numérico. Debe coincidir con ESCALAS_VALIDAS y
   ESCALAS_ICONOS_VALIDAS de api/config.js.
========================================================== */

ThemeManager.SCALES = {

    xs: .75,

    compacta: .9,

    normal: 1,

    grande: 1.15,

    xl: 1.35,

    xxl: 1.6,

    pequeno: .8,

    mediano: 1,

    grande2: 1.25

};

/* Pesos que se piden a Google Fonts por familia. Debe coincidir
   con las listas cerradas de api/config.js. */

ThemeManager.FONT_WEIGHTS = {

    "Cormorant Garamond": "ital,wght@0,400;0,500;0,600;1,400",

    "Playfair Display": "ital,wght@0,500;0,600;1,500",

    "EB Garamond": "ital,wght@0,400;0,500;0,600;1,400",

    "Marcellus": "400",

    "Alex Brush": "400",

    "Great Vibes": "400",

    "Parisienne": "400",

    "Dancing Script": "500;700",

    "Playball": "400",

    "Jost": "300;400;500;600",

    "Poppins": "300;400;500;600",

    "Montserrat": "300;400;500;600",

    "Lato": "300;400;700"

};

/* Color del panel → variable CSS que consumen los módulos. */

ThemeManager.COLOR_MAP = {

    blush: "--blush",

    blush2: "--blush-2",

    rosa: "--rosa",

    rosaDeep: "--rosa-deep",

    vino: "--vino",

    oro: "--oro",

    vestido: "--vestido",

    icono: "--icono",

    iconoVestimenta: "--icono-vestimenta"

};

/* colores.nombre y colores.apellido ya no se escriben: su color
   se controla desde "Datos principales" del panel, que es el
   mismo ajuste y además manda sobre este.

   Sin la variable, .hero__name y .gate__name caen al color del
   tema activo, que da exactamente el mismo tono que había
   guardado. El campo sigue en el esquema para no romper
   configuraciones anteriores; simplemente no se usa. */

/* ==========================================================
   APPLY
========================================================== */

ThemeManager.apply = function (config) {

    if (!config) {

        return false;

    }

    this.root = document.documentElement.style;

    this.applyColors(config.colores);

    this.applyTypography(config.tipografia, config.estilos);

    this.applyElementStyles(config.estilos);

    this.applyIllustrations(config);

    this.applyFloral(

        config.decoracionFloral,

        config.colores

    );

    this.applyFlags(config);

    this.applied = true;

    return true;

};

/* ==========================================================
   COLORES
========================================================== */

ThemeManager.applyColors = function (colores) {

    if (!colores) {

        return;

    }

    Object.keys(this.COLOR_MAP).forEach(key => {

        const value = colores[key];

        if (value) {

            this.root.setProperty(

                this.COLOR_MAP[key],

                value

            );

        }

    });

};

/* ==========================================================
   TIPOGRAFÍA
========================================================== */

ThemeManager.applyTypography = function (tipografia, estilos) {

    if (!tipografia) {

        return;

    }

    this.loadFonts(tipografia, estilos);

    if (tipografia.display) {

        this.root.setProperty(

            "--f-display",

            "'" + tipografia.display + "', serif"

        );

    }

    if (tipografia.script) {

        this.root.setProperty(

            "--f-script",

            "'" + tipografia.script + "', cursive"

        );

    }

    if (tipografia.body) {

        this.root.setProperty(

            "--f-body",

            "'" + tipografia.body + "', sans-serif"

        );

    }

    this.setScale("--scale-nombre", tipografia.escalaNombre);

    this.setScale("--scale-apellido", tipografia.escalaApellido);

    this.setScale("--scale-titulos", tipografia.escalaTitulos);

    this.setScale("--scale-mensajes", tipografia.escalaMensajes);

    this.setScale("--scale-iconos", tipografia.escalaIconos);

    if (typeof tipografia.espacioCorona === "number") {

        this.root.setProperty(

            "--espacio-corona",

            tipografia.espacioCorona + "px"

        );

    }

    if (typeof tipografia.espacioApellido === "number") {

        this.root.setProperty(

            "--espacio-apellido",

            tipografia.espacioApellido + "px"

        );

    }

    /* Fuente propia de nombre y apellido. Vacía significa
       "hereda la cursiva general", así que se retira la
       variable en vez de escribirla en blanco: el var() del CSS
       cae entonces a su respaldo. */

    this.setFontOrClear("--f-nombre", tipografia.fuenteNombre);

    this.setFontOrClear("--f-apellido", tipografia.fuenteApellido);

};

ThemeManager.setScale = function (variable, nombre) {

    const value = this.SCALES[nombre];

    if (value) {

        this.root.setProperty(variable, value);

    }

};

ThemeManager.setFontOrClear = function (variable, familia) {

    if (familia) {

        this.root.setProperty(

            variable,

            "'" + familia + "', cursive"

        );

    } else {

        this.root.removeProperty(variable);

    }

};

/* ==========================================================
   ESTILOS POR ELEMENTO

   El panel deja afinar color, fuente y tamaño de cada texto por
   separado, además de los ajustes generales. Los tres campos
   son opcionales: vacío significa "hereda lo global".

   Se escribe en una hoja propia en vez de tocar cada elemento:
   así el CSS de los módulos sigue mandando cuando el panel no
   dice nada, y basta con reemplazar el contenido de esa hoja
   para volver a aplicar todo de golpe.

   El color y la fuente van en esa hoja. El TAMAÑO no: se aplica
   aparte, midiendo primero el tamaño real del elemento y
   multiplicándolo.

   Por qué no vale una regla CSS: 'font-size:0.9em' es relativo
   al PADRE, no al propio elemento. Como el nombre se dimensiona
   con clamp() y el padre hereda los 16px del body, poner "0.9"
   lo dejaba en 14px en vez de reducirlo un 10%. Se veía como si
   el texto se hubiera roto.

   Al depender de una medida, hay que rehacerlo al cambiar el
   tamaño de la ventana: el clamp() da otro valor base.
========================================================== */

ThemeManager.ELEMENT_SELECTORS = {

    nombre: ".hero__name, .gate__name",

    apellido: ".hero__lastname",

    fraseInvitacion: ".hero__eyebrow",

    fraseFecha: ".hero__subtitle",

    fraseGate: ".gate__quote",

    carta: ".letter__text",

    hashtag: ".footer__hashtag, #albumHashtagText",

    footerMensaje: ".footer__mensaje",

    vestimentaNota: "#vestimentaNota",

    regalosTitulo: "#regalosTitulo",

    regalosMensaje: "#regalosMensaje",

    regalosDetalle: "#regalosDetalle",

    itinerarioTitulo: ".timeline__text strong",

    itinerarioHora: ".timeline__text em",

    ubicacionLugar: ".detalle-card h3",

    ubicacionDireccion: ".ubicacion__direccion",

    ubicacionHora: ".detalle-card__hora"

};

ThemeManager.applyElementStyles = function (estilos) {

    if (!estilos) {

        return;

    }

    const reglas = [];

    Object.keys(this.ELEMENT_SELECTORS).forEach(clave => {

        const estilo = estilos[clave];

        const selector = this.ELEMENT_SELECTORS[clave];

        if (!estilo || !selector) {

            return;

        }

        const declaraciones = [];

        if (estilo.color) {

            declaraciones.push("color:" + estilo.color + " !important");

        }

        if (estilo.fuente) {

            declaraciones.push(

                "font-family:'" + estilo.fuente + "' !important"

            );

        }

        if (declaraciones.length) {

            reglas.push(

                selector + "{" + declaraciones.join(";") + ";}"

            );

        }

    });

    let hoja = document.getElementById("estilosPorElemento");

    if (!hoja) {

        hoja = document.createElement("style");

        hoja.id = "estilosPorElemento";

        document.head.appendChild(hoja);

    }

    hoja.textContent = reglas.join("\n");

    this.applyElementSizes(estilos);

};

/* ==========================================================
   TAMAÑO POR ELEMENTO

   Se mide el tamaño que el CSS le da al elemento y se
   multiplica por el factor del panel. Hay que limpiar el valor
   anterior antes de medir, o se mediría el resultado de la
   pasada previa y el texto encogería en cada aplicación.
========================================================== */

ThemeManager.applyElementSizes = function (estilos) {

    this.sizeFactors = {};

    Object.keys(this.ELEMENT_SELECTORS).forEach(clave => {

        const estilo = estilos[clave];

        const factor = estilo && this.SCALES[estilo.escala];

        if (factor && factor !== 1) {

            this.sizeFactors[clave] = factor;

        }

    });

    this.resizeElements();

    /* El tamaño base sale de clamp() y vw, así que cambia con la
       ventana: hay que volver a medir. */

    if (!this.sizeListener) {

        this.sizeListener = () => {

            clearTimeout(this.sizeTimer);

            this.sizeTimer = setTimeout(

                () => this.resizeElements(),

                150

            );

        };

        window.addEventListener(

            "resize",

            this.sizeListener,

            { passive: true }

        );

    }

};

ThemeManager.resizeElements = function () {

    Object.keys(this.ELEMENT_SELECTORS).forEach(clave => {

        const factor = this.sizeFactors[clave];

        document

            .querySelectorAll(this.ELEMENT_SELECTORS[clave])

            .forEach(el => {

                /* Sin factor se retira el ajuste y manda el CSS. */

                el.style.fontSize = "";

                if (!factor) {

                    return;

                }

                const base = parseFloat(

                    getComputedStyle(el).fontSize

                );

                if (base) {

                    el.style.fontSize =

                        (base * factor).toFixed(2) + "px";

                }

            });

    });

};

/* ==========================================================
   GOOGLE FONTS

   Un único <link> con todas las familias en uso. Se reescribe
   solo si cambió, para no forzar una recarga en cada pasada.
========================================================== */

ThemeManager.loadFonts = function (tipografia, estilos) {

    const deElementos = estilos

        ? Object.values(estilos)

            .map(e => e && e.fuente)

            .filter(Boolean)

        : [];

    const familias = [...new Set([

        tipografia.display,

        tipografia.script,

        tipografia.body,

        tipografia.fuenteNombre,

        tipografia.fuenteApellido,

        ...deElementos

    ].filter(Boolean))];

    if (!familias.length) {

        return;

    }

    const params = familias

        .map(f =>

            "family=" +

            encodeURIComponent(f) +

            (this.FONT_WEIGHTS[f]

                ? ":" + this.FONT_WEIGHTS[f]

                : "")

        )

        .join("&");

    const href =

        "https://fonts.googleapis.com/css2?" +

        params +

        "&display=swap";

    let link = document.getElementById("dynamicFontLink");

    if (!link) {

        link = document.createElement("link");

        link.id = "dynamicFontLink";

        link.rel = "stylesheet";

        document.head.appendChild(link);

    }

    if (link.href !== href) {

        link.href = href;

    }

};

/* ==========================================================
   ILUSTRACIONES

   El panel guarda el tamaño en porcentaje; el CSS lo espera
   como factor.
========================================================== */

ThemeManager.applyIllustrations = function (config) {

    this.setPercent(

        "--ilustracion-escala",

        config.ilustracionQuinceanera &&

        config.ilustracionQuinceanera.escala

    );

    /* La de la carta tiene su propia variable: --ilustracion-escala
       se quedó para la portada. letter.css usa esta y cae en la otra
       si falta, así que una configuración anterior a la separación
       se sigue viendo igual. */

    this.setPercent(

        "--ilustracion-carta-escala",

        config.ilustracionCarta && config.ilustracionCarta.escala

    );

    this.setPercent(

        "--corona-escala",

        config.corona && config.corona.escala

    );

    /* La del inicio tiene su propia variable: --corona-escala se quedó
       para la portada. hero.css usa esta y cae en la otra si falta,
       de modo que una configuración anterior a la separación sigue
       viéndose igual. */

    this.setPercent(

        "--corona-hero-escala",

        config.coronaHero && config.coronaHero.escala

    );

};

ThemeManager.setPercent = function (variable, valor) {

    const n = Number(valor);

    this.root.setProperty(

        variable,

        Number.isFinite(n) && n > 0

            ? n / 100

            : 1

    );

};

/* ==========================================================
   DECORACIÓN FLORAL
========================================================== */

ThemeManager.applyFloral = function (cfg, colores) {

    this.setPercent("--floral-escala", cfg && cfg.escala);

    this.setPercent("--floral-opacidad", cfg && cfg.opacidad);

    this.root.setProperty(

        "--floral-filtro",

        this.buildFloralFilter(cfg, colores)

    );

    /* Capa: detrás por defecto. El 5 la deja por encima del
       icono de sección y de la ilustración. */

    this.root.setProperty(

        "--floral-z-arriba",

        cfg && cfg.alFrenteArriba === true ? "5" : "0"

    );

    this.root.setProperty(

        "--floral-z-abajo",

        cfg && cfg.alFrenteAbajo === true ? "5" : "0"

    );

};

/* El filtro se arma solo con los efectos realmente activos. Un
   filtro neutro no se ve, pero fuerza composición por GPU y en
   Safari/iOS puede pintar la imagen como un recuadro vacío. */

ThemeManager.buildFloralFilter = function (cfg, colores) {

    const filtros = [];

    const desenfoque = Number(cfg && cfg.desenfoque);

    if (Number.isFinite(desenfoque) && desenfoque > 0) {

        filtros.push("blur(" + desenfoque + "px)");

    }

    /* Tinte: sepia() deja la imagen en un tono cálido fijo
       (~35°), así que se gira ese matiz hasta el rosa de la
       propia paleta. */

    const tinte = Number(cfg && cfg.tinte);

    const tinteFrac =

        Number.isFinite(tinte) && tinte > 0

            ? Math.min(1, tinte / 100)

            : 0;

    if (tinteFrac > 0) {

        const objetivo = this.hexToHue(

            (colores && (colores.rosaDeep || colores.rosa)) || null

        );

        const HUE_SEPIA = 35;

        const giro = objetivo === null

            ? 0

            : (objetivo - HUE_SEPIA) * tinteFrac;

        filtros.push(

            "sepia(" + tinteFrac + ") " +

            "hue-rotate(" + giro.toFixed(1) + "deg)"

        );

    }

    const saturacion = Number(cfg && cfg.saturacion);

    const saturacionFrac =

        Number.isFinite(saturacion) && saturacion >= 0

            ? saturacion / 100

            : 1;

    if (saturacionFrac !== 1) {

        filtros.push("saturate(" + saturacionFrac + ")");

    }

    return filtros.length

        ? filtros.join(" ")

        : "none";

};

/* ==========================================================
   HEX → HUE

   Solo el matiz, que es lo único que necesita hue-rotate.
========================================================== */

ThemeManager.hexToHue = function (hex) {

    if (typeof hex !== "string") {

        return null;

    }

    let value = hex.trim().replace("#", "");

    if (value.length === 3) {

        value = value

            .split("")

            .map(c => c + c)

            .join("");

    }

    if (!/^[0-9a-fA-F]{6}$/.test(value)) {

        return null;

    }

    const r = parseInt(value.slice(0, 2), 16) / 255;

    const g = parseInt(value.slice(2, 4), 16) / 255;

    const b = parseInt(value.slice(4, 6), 16) / 255;

    const max = Math.max(r, g, b);

    const min = Math.min(r, g, b);

    const delta = max - min;

    if (delta === 0) {

        return 0;

    }

    let h;

    if (max === r) {

        h = 60 * (((g - b) / delta) % 6);

    } else if (max === g) {

        h = 60 * (((b - r) / delta) + 2);

    } else {

        h = 60 * (((r - g) / delta) + 4);

    }

    return h < 0 ? h + 360 : h;

};

/* ==========================================================
   INTERRUPTORES

   Clases sobre <body> que encienden variantes de diseño.
========================================================== */

ThemeManager.applyFlags = function (config) {

    document.body.classList.toggle(

        "tarjetas-activas",

        config.disenoTarjetas === true

    );

    document.body.classList.toggle(

        "itinerario-estatico",

        config.itinerarioAnimado === false

    );

};

/* ==========================================================
   EXPORT
========================================================== */

window.ThemeManager = ThemeManager;

/* ==========================================================
   END OF FILE
========================================================== */
