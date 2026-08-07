/* ==========================================================
   INVITATION ENGINE V2
   FILE        : animations.js
   VERSION     : 2.0.2
   MODULE      : ANIMATIONS
========================================================== */

"use strict";

/* ==========================================================
   ANIMATIONS
========================================================== */

const Animations={

    running:new Map(),

    observer:null

};


/* ==========================================================
   ADD CLASS
========================================================== */

Animations.add=function(

    element,

    animation,

    callback=null

){

    if(!element){

        return;

    }

    element.classList.add(

        animation

    );

    const end=()=>{

        element.classList.remove(

            animation

        );

        element.removeEventListener(

            "animationend",

            end

        );

        if(callback){

            callback();

        }

    };

    element.addEventListener(

        "animationend",

        end

    );

};


/* ==========================================================
   REMOVE CLASS
========================================================== */

Animations.remove=function(

    element,

    animation

){

    if(element){

        element.classList.remove(

            animation

        );

    }

};


/* ==========================================================
   TOGGLE
========================================================== */

Animations.toggle=function(

    element,

    animation

){

    if(element){

        element.classList.toggle(

            animation

        );

    }

};


/* ==========================================================
   FADE IN
========================================================== */

Animations.fadeIn=function(

    element,

    duration=400

){

    if(!element){

        return;

    }

    element.style.display="";

    element.animate(

        [

            {

                opacity:0

            },

            {

                opacity:1

            }

        ],

        {

            duration,

            fill:"forwards",

            easing:"ease"

        }

    );

};


/* ==========================================================
   FADE OUT
========================================================== */

Animations.fadeOut=function(

    element,

    duration=400

){

    if(!element){

        return;

    }

    const animation=

        element.animate(

            [

                {

                    opacity:1

                },

                {

                    opacity:0

                }

            ],

            {

                duration,

                fill:"forwards",

                easing:"ease"

            }

        );

    animation.onfinish=()=>{

        element.style.display="none";

    };

};

/* ==========================================================
   SLIDE UP
========================================================== */

Animations.slideUp=function(

    element,

    duration=400

){

    if(!element){

        return;

    }

    element.animate(

        [

            {

                transform:"translateY(40px)",

                opacity:0

            },

            {

                transform:"translateY(0)",

                opacity:1

            }

        ],

        {

            duration,

            easing:"ease-out",

            fill:"forwards"

        }

    );

};


/* ==========================================================
   SLIDE DOWN
========================================================== */

Animations.slideDown=function(

    element,

    duration=400

){

    if(!element){

        return;

    }

    element.animate(

        [

            {

                transform:"translateY(-40px)",

                opacity:0

            },

            {

                transform:"translateY(0)",

                opacity:1

            }

        ],

        {

            duration,

            easing:"ease-out",

            fill:"forwards"

        }

    );

};


/* ==========================================================
   SCALE IN
========================================================== */

Animations.scaleIn=function(

    element,

    duration=300

){

    if(!element){

        return;

    }

    element.animate(

        [

            {

                transform:"scale(.8)",

                opacity:0

            },

            {

                transform:"scale(1)",

                opacity:1

            }

        ],

        {

            duration,

            easing:"ease-out",

            fill:"forwards"

        }

    );

};


/* ==========================================================
   SCALE OUT
========================================================== */

Animations.scaleOut=function(

    element,

    duration=300

){

    if(!element){

        return;

    }

    element.animate(

        [

            {

                transform:"scale(1)",

                opacity:1

            },

            {

                transform:"scale(.8)",

                opacity:0

            }

        ],

        {

            duration,

            easing:"ease-in",

            fill:"forwards"

        }

    );

};


/* ==========================================================
   ROTATE
========================================================== */

Animations.rotate=function(

    element,

    degrees=360,

    duration=600

){

    if(!element){

        return;

    }

    element.animate(

        [

            {

                transform:"rotate(0deg)"

            },

            {

                transform:`rotate(${degrees}deg)`

            }

        ],

        {

            duration,

            easing:"linear",

            fill:"forwards"

        }

    );

};

/* ==========================================================
   BOUNCE
========================================================== */

Animations.bounce=function(

    element,

    duration=600

){

    if(!element){

        return;

    }

    element.animate(

        [

            {

                transform:"translateY(0)"

            },

            {

                transform:"translateY(-18px)"

            },

            {

                transform:"translateY(0)"

            }

        ],

        {

            duration,

            easing:"ease",

            fill:"forwards"

        }

    );

};


/* ==========================================================
   SHAKE
========================================================== */

Animations.shake=function(

    element,

    duration=500

){

    if(!element){

        return;

    }

    element.animate(

        [

            {transform:"translateX(0)"},

            {transform:"translateX(-8px)"},

            {transform:"translateX(8px)"},

            {transform:"translateX(-8px)"},

            {transform:"translateX(8px)"},

            {transform:"translateX(0)"}

        ],

        {

            duration,

            easing:"ease-in-out"

        }

    );

};


/* ==========================================================
   PULSE
========================================================== */

Animations.pulse=function(

    element,

    duration=1200

){

    if(!element){

        return;

    }

    element.animate(

        [

            {

                transform:"scale(1)"

            },

            {

                transform:"scale(1.05)"

            },

            {

                transform:"scale(1)"

            }

        ],

        {

            duration,

            iterations:Infinity,

            easing:"ease-in-out"

        }

    );

};


/* ==========================================================
   FLOAT
========================================================== */

Animations.float=function(

    element,

    duration=3500

){

    if(!element){

        return;

    }

    element.animate(

        [

            {

                transform:"translateY(0)"

            },

            {

                transform:"translateY(-12px)"

            },

            {

                transform:"translateY(0)"

            }

        ],

        {

            duration,

            iterations:Infinity,

            easing:"ease-in-out"

        }

    );

};


/* ==========================================================
   STOP
========================================================== */

Animations.stop=function(element){

    if(!element){

        return;

    }

    element.getAnimations()

        .forEach(animation=>{

            animation.cancel();

        });

};

/* ==========================================================
   OBSERVE
========================================================== */

Animations.observe=function(

    selector=".animate",

    options={

        threshold:.20

    }

){

    if(

        typeof IntersectionObserver===

        "undefined"

    ){

        return;

    }

    if(this.observer){

        this.observer.disconnect();

    }

    this.observer=

        new IntersectionObserver(

            entries=>{

                entries.forEach(entry=>{

                    if(

                        entry.isIntersecting

                    ){

                        entry.target.classList.add(

                            "is-visible"

                        );

                        this.observer.unobserve(

                            entry.target

                        );

                    }

                });

            },

            options

        );

    document

        .querySelectorAll(selector)

        .forEach(element=>{

            this.observer.observe(

                element

            );

        });

};


/* ==========================================================
   REVEAL
========================================================== */

Animations.reveal=function(

    element

){

    if(!element){

        return;

    }

    element.classList.add(

        "is-visible"

    );

};


/* ==========================================================
   HIDE
========================================================== */

Animations.hide=function(

    element

){

    if(!element){

        return;

    }

    element.classList.remove(

        "is-visible"

    );

};


/* ==========================================================
   PARALLAX
========================================================== */

Animations.parallax=function(

    element,

    speed=.15

){

    if(!element){

        return;

    }

    const offset=

        window.scrollY*speed;

    element.style.transform=

        `translate3d(0,${offset}px,0)`;

};


/* ==========================================================
   PARALLAX GROUP
========================================================== */

Animations.parallaxAll=function(

    selector="[data-parallax]"

){

    document

        .querySelectorAll(selector)

        .forEach(element=>{

            const speed=

                Number(

                    element.dataset.parallax

                ) || .15;

            this.parallax(

                element,

                speed

            );

        });

};

/* ==========================================================
   STAGGER
========================================================== */

Animations.stagger=function(

    selector,

    animation="animate-fade-up",

    delay=120

){

    document

        .querySelectorAll(selector)

        .forEach(

            (element,index)=>{

                setTimeout(()=>{

                    element.classList.add(

                        animation

                    );

                },

                index*delay);

            }

        );

};


/* ==========================================================
   RESET
========================================================== */

Animations.reset=function(selector=".animate"){

    document

        .querySelectorAll(selector)

        .forEach(element=>{

            element.classList.remove(

                "is-visible",

                "animate-fade",

                "animate-fade-up",

                "animate-fade-down",

                "animate-scale",

                "animate-slide-left",

                "animate-slide-right"

            );

        });

};


/* ==========================================================
   RUN
========================================================== */

Animations.run=function(

    element,

    animation,

    duration=600

){

    if(!element){

        return;

    }

    element.style.animationDuration=

        `${duration}ms`;

    element.classList.add(

        animation

    );

};


/* ==========================================================
   COMPLETE
========================================================== */

Animations.complete=function(

    element,

    callback

){

    if(!element){

        return;

    }

    const end=()=>{

        element.removeEventListener(

            "animationend",

            end

        );

        if(

            typeof callback===

            "function"

        ){

            callback();

        }

    };

    element.addEventListener(

        "animationend",

        end

    );

};


/* ==========================================================
   SEQUENCE
========================================================== */

Animations.sequence=function(

    elements=[],

    animation="animate-fade-up",

    interval=150

){

    elements.forEach(

        (element,index)=>{

            setTimeout(()=>{

                element.classList.add(

                    animation

                );

            },

            index*interval);

        }

    );

};


/* ==========================================================
   DELAY
========================================================== */

Animations.delay=function(

    callback,

    ms=300

){

    return setTimeout(

        callback,

        ms

    );

};


/* ==========================================================
   CANCEL DELAY
========================================================== */

Animations.cancel=function(id){

    clearTimeout(id);

};

/* ==========================================================
   DESTROY
========================================================== */

Animations.destroy=function(){

    if(this.observer){

        this.observer.disconnect();

        this.observer=null;

    }

    this.running.clear();

};


/* ==========================================================
   EXPORT
========================================================== */

window.Animations=Animations;


/* ==========================================================
   END OF FILE
========================================================== */