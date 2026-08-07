/* ==========================================================
   INVITATION ENGINE
   FILE        : loader.js
   VERSION     : 1.0.0
   MODULE      : Premium Loader
========================================================== */

"use strict";

const Loader = (() => {

    /* ==========================================================
       CONFIG
    ========================================================== */

    const CONFIG = {

        typingSpeed: 42,

        finishDelay: 700,

        fadeDuration: 900,

        resources: [

            "assets/gallery/CoronaElegante03.png",

            "assets/gallery/quince03.png",

            "assets/gallery/Linda03.png"

        ],

        messages: [

            "Cada historia tiene\nun momento inolvidable...",

            "Hoy comienza el mío.",

            "Mis XV Años",

            "Es un placer invitarte."

        ]

    };

    /* ==========================================================
       ELEMENTS
    ========================================================== */

    let loader;

    let typing;

    let bar;

    let percent;

    let name;

    /* ==========================================================
       STATE
    ========================================================== */

    let progress = 0;

    let bootstrapReady = false;

    let resourcesReady = false;

    /* ==========================================================
       INIT
    ========================================================== */

    async function start() {

        loader = document.getElementById("pageLoader");

        typing = document.getElementById("loaderTyping");

        bar = document.getElementById("loaderBar");

        percent = document.getElementById("loaderPercent");

        name = document.getElementById("loaderName");

        if (!loader) return;

        listenBootstrap();

        await runAnimation();

        preloadResources();

    }

    /* ==========================================================
       TYPEWRITER
    ========================================================== */

    async function runAnimation() {

        typing.innerHTML = "";

        for (const message of CONFIG.messages) {

            await typeLine(message);

            await wait(500);

            typing.innerHTML += "<br>";

        }

    }

    function typeLine(text) {

        return new Promise(resolve => {

            let i = 0;

            const timer = setInterval(() => {

                typing.innerHTML += text.charAt(i);

                i++;

                if (i >= text.length) {

                    clearInterval(timer);

                    resolve();

                }

            }, CONFIG.typingSpeed);

        });

    }

    /* ==========================================================
       PRELOAD
    ========================================================== */

    async function preloadResources() {

        const total = CONFIG.resources.length;

        let loaded = 0;

        for (const src of CONFIG.resources) {

            await loadImage(src);

            loaded++;

            progress = Math.round((loaded / total) * 100);

            updateProgress(progress);

        }

        resourcesReady = true;

        finishIfReady();

    }

    function loadImage(src) {

        return new Promise(resolve => {

            const img = new Image();

            img.onload = resolve;

            img.onerror = resolve;

            img.src = src;

        });

    }

    /* ==========================================================
       PROGRESS
    ========================================================== */

    function updateProgress(value) {

        if (bar) {

            bar.style.width = value + "%";

        }

        if (percent) {

            percent.textContent = value + "%";

        }

    }

    /* ==========================================================
       BOOTSTRAP
    ========================================================== */

    function listenBootstrap() {

        document.addEventListener(

            "bootstrap:ready",

            () => {

                bootstrapReady = true;

                finishIfReady();

            }

        );

    }

    /* ==========================================================
       FINISH
    ========================================================== */

    function finishIfReady() {

        if (!bootstrapReady) return;

        if (!resourcesReady) return;

        updateProgress(100);

        setTimeout(hide, CONFIG.finishDelay);

    }

    function hide() {

        loader.classList.add("hidden");

        setTimeout(() => {

            loader.remove();

        }, CONFIG.fadeDuration);

    }

    /* ==========================================================
       HELPERS
    ========================================================== */

    function wait(ms) {

        return new Promise(resolve => {

            setTimeout(resolve, ms);

        });

    }

    /* ==========================================================
       PUBLIC API
    ========================================================== */

    return {

        start

    };

})();

window.Loader = Loader;