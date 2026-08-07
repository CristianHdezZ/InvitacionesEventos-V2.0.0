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

        typingSpeed:42,

        finishDelay:2250,

        fadeDuration:900,

        messages:[

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

    /*async function start() {

        loader = document.getElementById("pageLoader");

        typing = document.getElementById("loaderTyping");

        bar = document.getElementById("loaderBar");

        percent = document.getElementById("loaderPercent");

        name = document.getElementById("loaderName");

        if (!loader) return;

        listenBootstrap();

        await runAnimation();

        preloadResources();

    }*/
    async function start() {

        loader = document.getElementById("pageLoader");

        typing = document.getElementById("loaderTyping");

        bar = document.getElementById("loaderBar");

        percent = document.getElementById("loaderPercent");

        name = document.getElementById("loaderName");

        if (!loader) return;

        updateProgress(0);

        listenBootstrap();

        runAnimation();

        preloadResources();

    }

    /* ==========================================================
       TYPEWRITER
    ========================================================== */

    /*async function runAnimation() {

        typing.innerHTML = "";

        for (const message of CONFIG.messages) {

            await typeLine(message);

            await wait(500);

            typing.innerHTML += "<br>";

        }

    }*/
   async function runAnimation(){

        typing.innerHTML="";

        for(const message of CONFIG.messages){

            await typeLine(message);

            await wait(600);

            typing.innerHTML+="<br>";

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
    
   /* async function preloadResources() {

        const total = CONFIG.resources.length;

        let loaded = 0;

        for (const src of CONFIG.resources) {

            await loadImage(src);

            loaded++;

            /*
            * El loader utilizará el 80%
            * para la carga de recursos.
            *
            * El 20% restante se reserva
            * para Bootstrap.
            */

/*            const value = Math.round(

                (loaded / total) * 80

            );

            updateProgress(value);

        }

        resourcesReady = true;

        finishIfReady();

    }*/
   async function preloadResources(){

        const images=getCriticalImages();

        if(images.length===0){

            resourcesReady=true;

            finishIfReady();

            return;

        }

        let loaded=0;

        const total=images.length;

        for(const src of images){

            await loadImage(src);

            loaded++;

            updateProgress(

                Math.round(

                    (loaded/total)*80

                )

            );

        }

        resourcesReady=true;

        finishIfReady();

    }

    
   function loadImage(src){

        return new Promise(resolve=>{

            const img=new Image();

            img.decoding="async";

            img.fetchPriority="high";

            img.onload=resolve;

            img.onerror=resolve;

            img.src=src;

        });

    }

    function getCriticalImages(){

        const selectors=[

            "#gateCoronaImg",

            "#gateDressImg",

            ".hero img",

            ".hero picture img",

            ".hero__image",

            ".hero__portrait"

        ];

        const images=[];

        selectors.forEach(selector=>{

            document.querySelectorAll(selector)

                .forEach(img=>{

                    if(

                        img.src &&

                        !images.includes(img.src)

                    ){

                        images.push(img.src);

                    }

                });

        });

        return images;

    }

    /* ==========================================================
       PROGRESS
    ========================================================== */

    /*function updateProgress(value) {

        if (bar) {

            bar.style.width = value + "%";

        }

        if (percent) {

            percent.textContent = value + "%";

        }

    }*/
   function updateProgress(value) {

        progress = value;

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

    /*function listenBootstrap() {

        document.addEventListener(

            "bootstrap:ready",

            () => {

                bootstrapReady = true;

                finishIfReady();

            }

        );

    }*/
    function listenBootstrap() {

        document.addEventListener(

            "bootstrap:ready",

            async () => {

                bootstrapReady = true;

                animateBootstrapProgress();

            },

            {

                once: true

            }

        );

    }

    async function animateBootstrapProgress() {

        let current = progress;

        while (current < 100) {

            current++;

            updateProgress(current);

            await wait(18);

        }

        finishIfReady();

    }

    /* ==========================================================
       FINISH
    ========================================================== */

   function finishIfReady() {

        if (!resourcesReady) return;

        if (!bootstrapReady) return;

        /*
        * Espera a que termine la máquina
        * de escribir y deja el mensaje
        * visible unos segundos.
        */

        setTimeout(() => {

            updateProgress(100);

            hide();

        }, CONFIG.finishDelay);

    }

    function hide() {
    if (!loader) return;
        loader.classList.add("hidden");
        setTimeout(() => {
            loader.remove();
            document.body.classList.add(
                "loader-finished"
            );
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