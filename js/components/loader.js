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

        /* 45 ms es lo que estaba escrito a mano dentro de typeLine e
           ignoraba este valor. Se sube de 42 a 45 para que la
           velocidad real no cambie ahora que sí se lee de aquí. */

        typingSpeed:45,

        /* Pausa para leer el último mensaje, ya con la máquina de
           escribir terminada. Ahora es el único sitio donde se define
           esa espera.

           Valía 5800 de cuando corría en paralelo con el tecleo y se
           le comía casi todo: al encadenarla detrás se sumaba entera
           y el loader llegaba a ~14,6 s. Con 1500 ronda los 10 s. */

        finishDelay:1500,

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

    /* Promesa de la máquina de escribir. finishIfReady() la espera
       antes de ocultar: si no, el loader se iba en cuanto estaban
       los recursos y el bootstrap, y cortaba los mensajes a medias. */

    let animationPromise = null;

    /* finishIfReady() lo llaman los recursos y el bootstrap, y ahora
       además espera. Sin este candado las dos llamadas podrían
       encadenar dos ocultamientos. */

    let finishing = false;

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

        animationPromise = runAnimation();

        preloadResources();

    }

    /* ==========================================================
       TYPEWRITER
    ========================================================== */

    /*
   async function runAnimation(){

        typing.innerHTML="";

        for(const message of CONFIG.messages){

            await typeLine(message);

            await wait(680);

            typing.innerHTML+="<br>";

        }

    }*/

    async function runAnimation() {

        typing.innerHTML = "";

        for (let i = 0; i < CONFIG.messages.length; i++) {

            await typeLine(CONFIG.messages[i]);

            // Espacio entre mensajes
            if (i < CONFIG.messages.length - 1) {

                typing.innerHTML += "<br><br>";

                await wait(1000);

            }

        }

        /* La pausa para leer el último mensaje no va aquí: la aplica
           finishIfReady() con CONFIG.finishDelay, ya con la animación
           terminada. Tenerla en los dos sitios sumaba el doble. */

    }

    /*function typeLine(text) {

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

    }*/

    function typeLine(text) {

        return new Promise(resolve => {

            let index = 0;

            const timer = setInterval(() => {

                typing.innerHTML += text.charAt(index);

                index++;

                if (index >= text.length) {

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

   async function finishIfReady() {

        if (finishing) return;

        if (!resourcesReady) return;

        if (!bootstrapReady) return;

        finishing = true;

        /*
        * Espera a que termine la máquina
        * de escribir y deja el mensaje
        * visible unos segundos.
        *
        * El await es lo que hace que se cumpla lo que dice ese
        * comentario: antes se ocultaba en cuanto había recursos y
        * bootstrap —normalmente antes de que terminara de escribir—
        * y el texto se cortaba a media frase.
        */

        if (animationPromise) {

            await animationPromise;

        }

        await wait(CONFIG.finishDelay);

        updateProgress(100);

        hide();

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