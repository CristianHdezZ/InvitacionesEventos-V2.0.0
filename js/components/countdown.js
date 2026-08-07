/* ==========================================================
   INVITATION ENGINE V2
   FILE        : countdown.js
   VERSION     : 2.0.2
   MODULE      : COUNTDOWN
========================================================== */

"use strict";

/* ==========================================================
   COMPONENT
========================================================== */

const Countdown={

    initialized:false,

    interval:null,

    targetDate:null,

    elements:{},

    config:AppConfig.countdown

};


/* ==========================================================
   INIT
========================================================== */

Countdown.init=function(){

    if(this.initialized){

        return;

    }

    if(!this.config.enabled){

        return;

    }

    this.cache();

    if(!this.elements.container){

        return;

    }

    this.loadDate();

    this.update();

    this.start();

    this.initialized=true;

};


/* ==========================================================
   CACHE
========================================================== */

Countdown.cache=function(){

    this.elements.container=

        document.querySelector(".countdown");

    this.elements.days=

        document.querySelector("[data-days]");

    this.elements.hours=

        document.querySelector("[data-hours]");

    this.elements.minutes=

        document.querySelector("[data-minutes]");

    this.elements.seconds=

        document.querySelector("[data-seconds]");

    this.elements.message=

        document.querySelector("[data-countdown-message]");

};


/* ==========================================================
   LOAD DATE
========================================================== */

Countdown.loadDate=function(){

    /* Orden de preferencia: lo que guardó el panel de admin,
       luego el valor por defecto del motor y, por último, el
       data-date escrito en el HTML. */

    const raw=

        (typeof ConfigService!=="undefined" &&

            ConfigService.get("fechaEvento")) ||

        AppConfig.event.date ||

        (this.elements.container &&

            this.elements.container.dataset.date) ||

        null;

    if(!raw){

        this.targetDate=null;

        return;

    }

    const parsed=new Date(raw);

    this.targetDate=

        isNaN(parsed.getTime())

            ? null

            : parsed;

};


/* ==========================================================
   START
========================================================== */

Countdown.start=function(){

    if(!this.targetDate){

        return;

    }

    this.stop();

    this.interval=setInterval(

        ()=>{

            this.update();

        },

        1000

    );

};

/* ==========================================================
   UPDATE
========================================================== */

Countdown.update=function(){

    if(!this.targetDate){

        return;

    }

    const now=new Date();

    const difference=

        this.targetDate-now;

    if(difference<=0){

        this.finish();

        return;

    }

    const days=

        Math.floor(

            difference/

            (1000*60*60*24)

        );

    const hours=

        Math.floor(

            (difference%

            (1000*60*60*24))

            /(1000*60*60)

        );

    const minutes=

        Math.floor(

            (difference%

            (1000*60*60))

            /(1000*60)

        );

    const seconds=

        Math.floor(

            (difference%

            (1000*60))

            /1000

        );

    this.render(

        days,

        hours,

        minutes,

        seconds

    );

};


/* ==========================================================
   RENDER
========================================================== */

Countdown.render=function(

    days,

    hours,

    minutes,

    seconds

){

    if(this.elements.days){

        this.elements.days.textContent=

            this.format(days);

    }

    if(this.elements.hours){

        this.elements.hours.textContent=

            this.format(hours);

    }

    if(this.elements.minutes){

        this.elements.minutes.textContent=

            this.format(minutes);

    }

    if(this.elements.seconds){

        this.elements.seconds.textContent=

            this.format(seconds);

    }

};


/* ==========================================================
   FORMAT
========================================================== */

Countdown.format=function(value){

    return String(value)

        .padStart(

            2,

            "0"

        );

};


/* ==========================================================
   FINISH
========================================================== */

Countdown.finish=function(){

    this.stop();

    this.render(

        0,

        0,

        0,

        0

    );

    if(this.elements.message){

        this.elements.message.textContent=

            this.config.expiredMessage;

    }

};


/* ==========================================================
   STOP
========================================================== */

Countdown.stop=function(){

    if(this.interval){

        clearInterval(

            this.interval

        );

        this.interval=null;

    }

};

/* ==========================================================
   SET DATE
========================================================== */

Countdown.setDate=function(date){

    this.targetDate=

        new Date(date);

    this.update();

};


/* ==========================================================
   GET REMAINING
========================================================== */

Countdown.getRemaining=function(){

    if(!this.targetDate){

        return null;

    }

    const difference=

        this.targetDate-

        new Date();

    if(difference<=0){

        return null;

    }

    return{

        days:Math.floor(

            difference/

            86400000

        ),

        hours:Math.floor(

            difference%

            86400000/

            3600000

        ),

        minutes:Math.floor(

            difference%

            3600000/

            60000

        ),

        seconds:Math.floor(

            difference%

            60000/

            1000

        )

    };

};


/* ==========================================================
   REFRESH
========================================================== */

Countdown.refresh=function(){

    this.cache();

    this.update();

};


/* ==========================================================
   RESIZE
========================================================== */

Countdown.onResize=function(){

};


/* ==========================================================
   SCROLL
========================================================== */

Countdown.onScroll=function(){

};


/* ==========================================================
   PAUSE
========================================================== */

Countdown.pause=function(){

    this.stop();

};


/* ==========================================================
   RESUME
========================================================== */

Countdown.resume=function(){

    this.start();

};


/* ==========================================================
   GET STATE
========================================================== */

Countdown.getState=function(){

    return{

        initialized:this.initialized,

        running:this.interval!==null,

        targetDate:this.targetDate

    };

};


/* ==========================================================
   SET STATE
========================================================== */

Countdown.setState=function(state={}){

    Object.assign(

        this,

        state

    );

};


/* ==========================================================
   DESTROY
========================================================== */

Countdown.destroy=function(){

    this.stop();

    this.initialized=false;

    this.interval=null;

    this.targetDate=null;

    this.elements={};

};


/* ==========================================================
   EXPORT
========================================================== */

window.Countdown=Countdown;


/* ==========================================================
   END OF FILE
========================================================== */