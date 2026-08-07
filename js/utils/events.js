/* ==========================================================
   INVITATION ENGINE V2
   FILE        : events.js
   VERSION     : 2.0.2
   MODULE      : EVENT UTILITIES
========================================================== */

"use strict";

/* ==========================================================
   EVENTS
========================================================== */

const Events={

    listeners:new Map()

};


/* ==========================================================
   ON
========================================================== */

Events.on=function(

    element,

    event,

    handler,

    options=false

){

    if(

        !element ||

        !event ||

        !handler

    ){

        return;

    }

    element.addEventListener(

        event,

        handler,

        options

    );

    return handler;

};


/* ==========================================================
   OFF
========================================================== */

Events.off=function(

    element,

    event,

    handler,

    options=false

){

    if(

        !element ||

        !handler

    ){

        return;

    }

    element.removeEventListener(

        event,

        handler,

        options

    );

};


/* ==========================================================
   ONCE
========================================================== */

Events.once=function(

    element,

    event,

    handler

){

    const callback=e=>{

        handler(e);

        Events.off(

            element,

            event,

            callback

        );

    };

    Events.on(

        element,

        event,

        callback

    );

};


/* ==========================================================
   READY
========================================================== */

Events.ready=function(callback){

    if(

        document.readyState==="loading"

    ){

        document.addEventListener(

            "DOMContentLoaded",

            callback

        );

    }else{

        callback();

    }

};


/* ==========================================================
   LOAD
========================================================== */

Events.load=function(callback){

    window.addEventListener(

        "load",

        callback

    );

};

/* ==========================================================
   EMIT
========================================================== */

Events.emit=function(

    element,

    event,

    detail={}

){

    if(!element){

        return;

    }

    element.dispatchEvent(

        new CustomEvent(

            event,

            {

                detail,

                bubbles:true,

                cancelable:true

            }

        )

    );

};


/* ==========================================================
   DELEGATE
========================================================== */

Events.delegate=function(

    parent,

    event,

    selector,

    handler

){

    if(

        !parent ||

        !selector

    ){

        return;

    }

    const listener=e=>{

        const target=

            e.target.closest(

                selector

            );

        if(

            target &&

            parent.contains(target)

        ){

            handler.call(

                target,

                e,

                target

            );

        }

    };

    parent.addEventListener(

        event,

        listener

    );

    return listener;

};


/* ==========================================================
   WINDOW
========================================================== */

Events.window=function(

    event,

    handler,

    options=false

){

    return Events.on(

        window,

        event,

        handler,

        options

    );

};


/* ==========================================================
   DOCUMENT
========================================================== */

Events.document=function(

    event,

    handler,

    options=false

){

    return Events.on(

        document,

        event,

        handler,

        options

    );

};


/* ==========================================================
   BODY
========================================================== */

Events.body=function(

    event,

    handler,

    options=false

){

    return Events.on(

        document.body,

        event,

        handler,

        options

    );

};


/* ==========================================================
   RESIZE
========================================================== */

Events.resize=function(handler){

    return Events.window(

        "resize",

        handler,

        {

            passive:true

        }

    );

};


/* ==========================================================
   SCROLL
========================================================== */

Events.scroll=function(handler){

    return Events.window(

        "scroll",

        handler,

        {

            passive:true

        }

    );

};

/* ==========================================================
   CLICK
========================================================== */

Events.click=function(

    element,

    handler,

    options=false

){

    return Events.on(

        element,

        "click",

        handler,

        options

    );

};


/* ==========================================================
   CHANGE
========================================================== */

Events.change=function(

    element,

    handler

){

    return Events.on(

        element,

        "change",

        handler

    );

};


/* ==========================================================
   INPUT
========================================================== */

Events.input=function(

    element,

    handler

){

    return Events.on(

        element,

        "input",

        handler

    );

};


/* ==========================================================
   SUBMIT
========================================================== */

Events.submit=function(

    form,

    handler

){

    return Events.on(

        form,

        "submit",

        handler

    );

};


/* ==========================================================
   KEYDOWN
========================================================== */

Events.keydown=function(handler){

    return Events.document(

        "keydown",

        handler

    );

};


/* ==========================================================
   KEYUP
========================================================== */

Events.keyup=function(handler){

    return Events.document(

        "keyup",

        handler

    );

};


/* ==========================================================
   VISIBILITY CHANGE
========================================================== */

Events.visibility=function(handler){

    return Events.document(

        "visibilitychange",

        handler

    );

};


/* ==========================================================
   TRANSITION END
========================================================== */

Events.transitionEnd=function(

    element,

    handler

){

    return Events.on(

        element,

        "transitionend",

        handler

    );

};


/* ==========================================================
   ANIMATION END
========================================================== */

Events.animationEnd=function(

    element,

    handler

){

    return Events.on(

        element,

        "animationend",

        handler

    );

};

/* ==========================================================
   MOUSE ENTER
========================================================== */

Events.mouseEnter=function(

    element,

    handler

){

    return Events.on(

        element,

        "mouseenter",

        handler

    );

};


/* ==========================================================
   MOUSE LEAVE
========================================================== */

Events.mouseLeave=function(

    element,

    handler

){

    return Events.on(

        element,

        "mouseleave",

        handler

    );

};


/* ==========================================================
   MOUSE MOVE
========================================================== */

Events.mouseMove=function(

    element,

    handler

){

    return Events.on(

        element,

        "mousemove",

        handler

    );

};


/* ==========================================================
   TOUCH START
========================================================== */

Events.touchStart=function(

    element,

    handler,

    options={passive:true}

){

    return Events.on(

        element,

        "touchstart",

        handler,

        options

    );

};


/* ==========================================================
   TOUCH MOVE
========================================================== */

Events.touchMove=function(

    element,

    handler,

    options={passive:true}

){

    return Events.on(

        element,

        "touchmove",

        handler,

        options

    );

};


/* ==========================================================
   TOUCH END
========================================================== */

Events.touchEnd=function(

    element,

    handler,

    options={passive:true}

){

    return Events.on(

        element,

        "touchend",

        handler,

        options

    );

};


/* ==========================================================
   POINTER DOWN
========================================================== */

Events.pointerDown=function(

    element,

    handler

){

    return Events.on(

        element,

        "pointerdown",

        handler

    );

};


/* ==========================================================
   POINTER UP
========================================================== */

Events.pointerUp=function(

    element,

    handler

){

    return Events.on(

        element,

        "pointerup",

        handler

    );

};


/* ==========================================================
   POINTER MOVE
========================================================== */

Events.pointerMove=function(

    element,

    handler

){

    return Events.on(

        element,

        "pointermove",

        handler

    );

};


/* ==========================================================
   CONTEXT MENU
========================================================== */

Events.contextMenu=function(

    element,

    handler

){

    return Events.on(

        element,

        "contextmenu",

        handler

    );

};

/* ==========================================================
   OBSERVE
========================================================== */

Events.observe=function(

    element,

    callback,

    options={}

){

    if(

        !element ||

        typeof IntersectionObserver==="undefined"

    ){

        return null;

    }

    const observer=

        new IntersectionObserver(

            callback,

            options

        );

    observer.observe(

        element

    );

    return observer;

};


/* ==========================================================
   OBSERVE ALL
========================================================== */

Events.observeAll=function(

    elements,

    callback,

    options={}

){

    if(

        typeof IntersectionObserver==="undefined"

    ){

        return null;

    }

    const observer=

        new IntersectionObserver(

            callback,

            options

        );

    elements.forEach(element=>{

        observer.observe(element);

    });

    return observer;

};


/* ==========================================================
   DISCONNECT OBSERVER
========================================================== */

Events.disconnect=function(observer){

    if(observer){

        observer.disconnect();

    }

};


/* ==========================================================
   THROTTLE
========================================================== */

Events.throttle=function(

    callback,

    delay=100

){

    let waiting=false;

    return function(...args){

        if(waiting){

            return;

        }

        callback.apply(

            this,

            args

        );

        waiting=true;

        setTimeout(()=>{

            waiting=false;

        },delay);

    };

};


/* ==========================================================
   DEBOUNCE
========================================================== */

Events.debounce=function(

    callback,

    delay=250

){

    let timeout;

    return function(...args){

        clearTimeout(timeout);

        timeout=setTimeout(()=>{

            callback.apply(

                this,

                args

            );

        },delay);

    };

};


/* ==========================================================
   RAF
========================================================== */

Events.raf=function(callback){

    return requestAnimationFrame(

        callback

    );

};


/* ==========================================================
   CAF
========================================================== */

Events.caf=function(id){

    cancelAnimationFrame(id);

};

/* ==========================================================
   REMOVE ALL
========================================================== */

Events.removeAll=function(){

    this.listeners.clear();

};


/* ==========================================================
   WAIT
========================================================== */

Events.wait=function(ms){

    return new Promise(resolve=>{

        setTimeout(

            resolve,

            ms

        );

    });

};


/* ==========================================================
   NEXT FRAME
========================================================== */

Events.nextFrame=function(callback){

    requestAnimationFrame(()=>{

        requestAnimationFrame(

            callback

        );

    });

};


/* ==========================================================
   IDLE
========================================================== */

Events.idle=function(callback){

    if(

        "requestIdleCallback" in window

    ){

        requestIdleCallback(callback);

    }else{

        setTimeout(

            callback,

            1

        );

    }

};


/* ==========================================================
   EXPORT
========================================================== */

window.Events=Events;


/* ==========================================================
   END OF FILE
========================================================== */