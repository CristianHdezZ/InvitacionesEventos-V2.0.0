/* ==========================================================
   INVITATION ENGINE V2
   FILE        : gallery.js
   VERSION     : 2.0.2
   MODULE      : GALLERY
========================================================== */

"use strict";

/* ==========================================================
   COMPONENT
========================================================== */

const Gallery={

    initialized:false,

    swiper:null,

    current:0,

    elements:{},

    config:AppConfig.gallery

};


/* ==========================================================
   INIT
========================================================== */

Gallery.init=function(){

    if(this.initialized){

        return;

    }

    this.cache();

    if(!this.elements.container){

        return;

    }

    /* Las fotos del panel se pintan ANTES de crear Swiper: si
       se cambian después hay que destruirlo y rehacerlo, porque
       guarda las medidas de cada diapositiva al arrancar. */

    if(this.render()){

        this.cache();

    }

    this.createSwiper();

    this.bindEvents();

    this.lazyLoad();

    this.initialized=true;

};


/* ==========================================================
   CACHE
========================================================== */

/* Los selectores apuntan al marcado real de la invitación
   (.galeria__*, .swiper-*, #lightbox). La hoja del motor que
   propone .gallery__* es otro diseño y está sin activar, igual
   que su CSS: ver css/layout/gallery.css.

   Mientras esto buscaba .gallery__swiper no encontraba nada y
   Swiper no llegaba a arrancar. */

Gallery.cache=function(){

    this.elements.container=

        document.getElementById("galeria");

    this.elements.swiper=

        document.getElementById("galeriaSwiper");

    this.elements.wrapper=

        document.getElementById("galeriaWrapper");

    this.elements.slides=

        document.querySelectorAll("#galeriaWrapper .swiper-slide");

    this.elements.next=

        document.querySelector(".galeria__swiper .swiper-button-next");

    this.elements.prev=

        document.querySelector(".galeria__swiper .swiper-button-prev");

    this.elements.pagination=

        document.querySelector(".galeria__swiper .swiper-pagination");

    this.elements.lightbox=

        document.getElementById("lightbox");

    this.elements.image=

        document.getElementById("lightboxImg");

    this.elements.close=

        document.getElementById("lightboxClose");

};


/* ==========================================================
   RENDER

   Pinta las fotos que guarda el panel de admin. Si no hay
   config se deja el carrusel escrito en el partial.

   Devuelve true si reemplazó las diapositivas, para que init()
   sepa que debe volver a cachearlas antes de enlazar los clics.
========================================================== */

Gallery.render=function(){

    const fotos=

        typeof ConfigService!=="undefined"

            ? ConfigService.get("galeria")

            : null;

    if(

        !this.elements.wrapper ||

        !Array.isArray(fotos) ||

        !fotos.length

    ){

        return false;

    }

    this.elements.wrapper.innerHTML=fotos

        .map((url,i)=>{

            const src=this.escape(url);

            return "<div class=\"swiper-slide\">"+

                "<button class=\"galeria__item\" type=\"button\" "+

                "data-full=\""+src+"\">"+

                "<img src=\""+src+"\" "+

                "alt=\"Foto "+(i+1)+"\" loading=\"lazy\">"+

                "</button>"+

                "</div>";

        })

        .join("");

    return true;

};


/* Las URLs vienen de la base de datos; api/config.js las sanea
   al guardar y aquí se escapan al pintarlas. */

Gallery.escape=function(value){

    const div=document.createElement("div");

    div.textContent=value===undefined||value===null

        ? ""

        : String(value);

    return div.innerHTML;

};


/* ==========================================================
   CREATE SWIPER
========================================================== */

Gallery.createSwiper=function(){

    if(

        typeof Swiper==="undefined"

    ){

        return;

    }

    /* Swiper necesita más diapositivas que las visibles para
       poder duplicarlas y dar la vuelta. Con dos o tres fotos
       el bucle se queda a medias y deja huecos, así que se
       apaga —junto con el avance solo. */

    const pocas=this.elements.slides.length<4;

    this.swiper=new Swiper(

        this.elements.swiper,

        {

            loop:this.config.loop && !pocas,

            speed:this.config.speed,

            spaceBetween:this.config.spaceBetween,

            slidesPerView:this.config.slidesPerView,

            autoplay:this.config.autoplay && !pocas

                ?{

                    delay:this.config.delay,

                    disableOnInteraction:false

                }

                :false,

            navigation:{

                nextEl:this.elements.next,

                prevEl:this.elements.prev

            },

            pagination:{

                el:this.elements.pagination,

                clickable:true

            }

        }

    );

};

/* ==========================================================
   EVENTS
========================================================== */

Gallery.bindEvents=function(){

    if(this.elements.next){

        this.elements.next

            .addEventListener(

                "click",

                ()=>{

                    this.next();

                }

            );

    }

    if(this.elements.prev){

        this.elements.prev

            .addEventListener(

                "click",

                ()=>{

                    this.previous();

                }

            );

    }

    this.elements.slides.forEach(

        (slide,index)=>{

            slide.addEventListener(

                "click",

                ()=>{

                    this.open(index);

                }

            );

        }

    );

    if(this.elements.close){

        this.elements.close

            .addEventListener(

                "click",

                ()=>{

                    this.close();

                }

            );

    }

    if(this.elements.lightbox){

        this.elements.lightbox

            .addEventListener(

                "click",

                (event)=>{

                    if(

                        event.target===

                        this.elements.lightbox

                    ){

                        this.close();

                    }

                }

            );

    }

    document.addEventListener(

        "keydown",

        (event)=>{

            if(event.key==="Escape"){

                this.close();

            }

        }

    );

};


/* ==========================================================
   NEXT
========================================================== */

Gallery.next=function(){

    if(this.swiper){

        this.swiper.slideNext();

    }

};


/* ==========================================================
   PREVIOUS
========================================================== */

Gallery.previous=function(){

    if(this.swiper){

        this.swiper.slidePrev();

    }

};


/* ==========================================================
   OPEN LIGHTBOX
========================================================== */

Gallery.open=function(index){

    this.current=index;

    const image=

        this.elements.slides[index]

            ?.querySelector("img");

    if(

        !image ||

        !this.elements.image

    ){

        return;

    }

    this.elements.image.src=image.src;

    this.elements.image.alt=image.alt;

    this.elements.lightbox.classList.add(

        "is-open"

    );

    document.body.classList.add(

        "overflow-hidden"

    );

};


/* ==========================================================
   CLOSE LIGHTBOX
========================================================== */

Gallery.close=function(){

    if(!this.elements.lightbox){

        return;

    }

    this.elements.lightbox.classList.remove(

        "is-open"

    );

    document.body.classList.remove(

        "overflow-hidden"

    );

};

/* ==========================================================
   LAZY LOAD
========================================================== */

Gallery.lazyLoad=function(){

    if(

        !("IntersectionObserver" in window)

    ){

        return;

    }

    const observer=

        new IntersectionObserver(

            entries=>{

                entries.forEach(entry=>{

                    if(!entry.isIntersecting){

                        return;

                    }

                    const image=

                        entry.target.querySelector("img");

                    if(

                        image &&

                        image.dataset.src

                    ){

                        image.src=

                            image.dataset.src;

                        image.removeAttribute(

                            "data-src"

                        );

                    }

                    observer.unobserve(

                        entry.target

                    );

                });

            },

            {

                rootMargin:"100px"

            }

        );

    this.elements.slides.forEach(slide=>{

        observer.observe(slide);

    });

};


/* ==========================================================
   LOAD JSON
========================================================== */

Gallery.load=function(images=[]){

    if(

        !this.elements.wrapper ||

        !Array.isArray(images)

    ){

        return;

    }

    this.elements.wrapper.innerHTML="";

    images.forEach(item=>{

        this.add(item);

    });

};


/* ==========================================================
   ADD IMAGE
========================================================== */

Gallery.add=function(item){

    const slide=

        document.createElement("div");

    slide.className=

        "gallery__slide";

    slide.innerHTML=`

        <div class="gallery__item">

            <img
                class="gallery__image"
                src="${item.src}"
                alt="${item.alt || ""}">

        </div>

    `;

    this.elements.wrapper.appendChild(

        slide

    );

};


/* ==========================================================
   REMOVE IMAGE
========================================================== */

Gallery.remove=function(index){

    const slide=

        this.elements.wrapper.children[index];

    if(slide){

        slide.remove();

    }

};


/* ==========================================================
   CLEAR
========================================================== */

Gallery.clear=function(){

    if(this.elements.wrapper){

        this.elements.wrapper.innerHTML="";

    }

};


/* ==========================================================
   REFRESH
========================================================== */

Gallery.refresh=function(){

    this.cache();

    if(

        this.swiper &&

        typeof this.swiper.update==="function"

    ){

        this.swiper.update();

    }

};


/* ==========================================================
   RESIZE
========================================================== */

Gallery.onResize=function(){

    if(

        this.swiper &&

        typeof this.swiper.update==="function"

    ){

        this.swiper.update();

    }

};


/* ==========================================================
   SCROLL
========================================================== */

Gallery.onScroll=function(){

};


/* ==========================================================
   PAUSE
========================================================== */

Gallery.pause=function(){

    if(

        this.swiper &&

        this.swiper.autoplay

    ){

        this.swiper.autoplay.stop();

    }

};


/* ==========================================================
   RESUME
========================================================== */

Gallery.resume=function(){

    if(

        this.swiper &&

        this.swiper.autoplay

    ){

        this.swiper.autoplay.start();

    }

};


/* ==========================================================
   GET STATE
========================================================== */

Gallery.getState=function(){

    return{

        initialized:this.initialized,

        current:this.current,

        total:this.elements.wrapper

            ? this.elements.wrapper.children.length

            :0

    };

};


/* ==========================================================
   SET STATE
========================================================== */

Gallery.setState=function(state={}){

    Object.assign(

        this,

        state

    );

};


/* ==========================================================
   DESTROY
========================================================== */

Gallery.destroy=function(){

    if(

        this.swiper &&

        typeof this.swiper.destroy==="function"

    ){

        this.swiper.destroy(

            true,

            true

        );

    }

    this.swiper=null;

    this.initialized=false;

    this.current=0;

    this.elements={};

};


/* ==========================================================
   EXPORT
========================================================== */

window.Gallery=Gallery;


/* ==========================================================
   END OF FILE
========================================================== */