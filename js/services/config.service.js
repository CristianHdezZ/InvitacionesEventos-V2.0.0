/* ==========================================================
   INVITATION ENGINE V2
   FILE        : config.service.js
   VERSION     : 2.0.0
   MODULE      : CONFIG SERVICE

   Trae la configuración que guarda el panel de admin y la deja
   disponible para el resto del motor.

   GET /api/config es público a propósito (ver api/config.js):
   el propio sitio la necesita para pintarse. La escritura sí
   está protegida con la clave de administrador.

   Si la petición falla, el sitio NO se queda en blanco: cada
   partial ya trae su contenido escrito en el HTML, así que sin
   config simplemente se ve lo que hay. Por eso aquí nunca se
   lanza el error hacia arriba.
========================================================== */

"use strict";

/* ==========================================================
   SERVICE
========================================================== */

const ConfigService = {

    data: null,

    loaded: false,

    failed: false

};

/* ==========================================================
   URL
========================================================== */

ConfigService.url = function () {

    const api = AppConfig.api || {};

    return (api.endpoint || "/api") +

        (api.configPath || "/config");

};

/* ==========================================================
   LOAD

   Se llama una sola vez, desde Bootstrap, antes de inicializar
   los componentes: así el primer pintado ya sale con los
   valores del panel y no se ve el contenido por defecto
   cambiando a los dos segundos.
========================================================== */

ConfigService.load = async function () {

    if (this.loaded) {

        return this.data;

    }

    if (!AppConfig.api || !AppConfig.api.enabled) {

        this.loaded = true;

        return null;

    }

    const controller =

        typeof AbortController !== "undefined"

            ? new AbortController()

            : null;

    const timer = controller

        ? setTimeout(

            () => controller.abort(),

            AppConfig.api.timeout || 10000

        )

        : null;

    try {

        const response = await fetch(

            this.url(),

            {

                cache: "no-cache",

                signal: controller ? controller.signal : undefined

            }

        );

        if (!response.ok) {

            throw new Error("HTTP " + response.status);

        }

        const body = await response.json();

        if (!body || body.ok !== true || !body.config) {

            throw new Error("Respuesta sin config");

        }

        this.data = body.config;

        this.loaded = true;

        if (typeof DataService !== "undefined") {

            DataService.load(this.data);

        }

        return this.data;

    }

    catch (error) {

        this.failed = true;

        this.loaded = true;

        console.warn(

            "[ConfigService] No se pudo leer la configuración; " +

            "el sitio se queda con el contenido del HTML.",

            error && error.message

        );

        return null;

    }

    finally {

        if (timer) {

            clearTimeout(timer);

        }

    }

};

/* ==========================================================
   GET

   Acceso por ruta con punto: ConfigService.get("colores.oro").
   Devuelve el respaldo si falta cualquier tramo del camino.
========================================================== */

ConfigService.get = function (path, fallback = null) {

    if (!this.data || !path) {

        return fallback;

    }

    const value = String(path)

        .split(".")

        .reduce(

            (acc, key) =>

                acc !== null &&

                acc !== undefined &&

                Object.prototype.hasOwnProperty.call(acc, key)

                    ? acc[key]

                    : undefined,

            this.data

        );

    return value === undefined || value === null || value === ""

        ? fallback

        : value;

};

/* ==========================================================
   HAS
========================================================== */

ConfigService.has = function (path) {

    return this.get(path, undefined) !== undefined;

};

/* ==========================================================
   EXPORT
========================================================== */

window.ConfigService = ConfigService;

/* ==========================================================
   END OF FILE
========================================================== */
