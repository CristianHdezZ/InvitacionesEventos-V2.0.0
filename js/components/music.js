/* ==========================================================
   INVITATION ENGINE V2
   FILE        : music.js
   VERSION     : 2.0.2
   MODULE      : MUSIC
========================================================== */

"use strict";

/* ==========================================================
   COMPONENT
========================================================== */

const Music={

    initialized:false,

    playing:false,

    muted:false,

    audio:null,

    button:null,

    progress:null,

    config:AppConfig.music

};


/* ==========================================================
   INIT
========================================================== */

Music.init=function(){

    if(this.initialized){

        return;

    }

    if(!this.config.enabled){

        return;

    }

    this.cache();

    if(!this.audio){

        return;

    }

    this.restore();

    this.setVolume();

    this.bindEvents();

    this.initialized=true;

};


/* ==========================================================
   CACHE
========================================================== */

Music.cache=function(){

    this.audio=

        document.querySelector("[data-audio]") ||

        document.querySelector("audio");

    this.button=

        document.querySelector("[data-music]");

    this.progress=

        document.querySelector("[data-music-progress]");

};


/* ==========================================================
   EVENTS
========================================================== */

Music.bindEvents=function(){

    if(this.button){

        this.button.addEventListener(

            "click",

            ()=>{

                this.toggle();

            }

        );

    }

    this.audio.addEventListener(

        "play",

        ()=>{

            this.onPlay();

        }

    );

    this.audio.addEventListener(

        "pause",

        ()=>{

            this.onPause();

        }

    );

    this.audio.addEventListener(

        "ended",

        ()=>{

            this.onEnded();

        }

    );

    this.audio.addEventListener(

        "timeupdate",

        ()=>{

            this.updateProgress();

        }

    );

};

/* ==========================================================
   PLAY
========================================================== */

Music.play=function(){

    if(!this.audio){

        return;

    }

    this.audio.play();

};


/* ==========================================================
   PAUSE
========================================================== */

Music.pause=function(){

    if(!this.audio){

        return;

    }

    this.audio.pause();

};


/* ==========================================================
   TOGGLE
========================================================== */

Music.toggle=function(){

    if(this.playing){

        this.pause();

    }else{

        this.play();

    }

};


/* ==========================================================
   STOP
========================================================== */

Music.stop=function(){

    if(!this.audio){

        return;

    }

    this.audio.pause();

    this.audio.currentTime=0;

};


/* ==========================================================
   SET VOLUME
========================================================== */

Music.setVolume=function(volume=this.config.volume){

    if(!this.audio){

        return;

    }

    this.audio.volume=volume;

};


/* ==========================================================
   MUTE
========================================================== */

Music.mute=function(){

    if(!this.audio){

        return;

    }

    this.audio.muted=true;

    this.muted=true;

};


/* ==========================================================
   UNMUTE
========================================================== */

Music.unmute=function(){

    if(!this.audio){

        return;

    }

    this.audio.muted=false;

    this.muted=false;

};


/* ==========================================================
   TOGGLE MUTE
========================================================== */

Music.toggleMute=function(){

    if(this.muted){

        this.unmute();

    }else{

        this.mute();

    }

};

/* ==========================================================
   ON PLAY
========================================================== */

Music.onPlay=function(){

    this.playing=true;

    InvitationApp.playMusic();

    this.syncButton();

    this.save();

};


/* ==========================================================
   ON PAUSE
========================================================== */

Music.onPause=function(){

    this.playing=false;

    InvitationApp.stopMusic();

    this.syncButton();

    this.save();

};


/* ==========================================================
   SYNC BUTTON

   Un único sitio que refleja el estado del audio en el botón.
   El ecualizador de css/components/chrome.css se anima con
   [aria-pressed="true"], no con la clase, así que si solo se
   alternaba .is-playing las barras nunca se movían.

   Se dispara desde los eventos play/pause del propio <audio>,
   así que también acierta cuando la reproducción la inicia o
   la detiene otro sitio —el navegador, la portada al abrirse—
   y no solo el clic en el botón.
========================================================== */

Music.syncButton=function(){

    if(!this.button){

        return;

    }

    this.button.classList.toggle(

        "is-playing",

        this.playing

    );

    this.button.setAttribute(

        "aria-pressed",

        this.playing ? "true" : "false"

    );

    this.button.setAttribute(

        "aria-label",

        this.playing

            ? "Pausar música"

            : "Reproducir música"

    );

};


/* ==========================================================
   ON ENDED
========================================================== */

Music.onEnded=function(){

    if(this.config.loop){

        this.audio.currentTime=0;

        this.play();

    }

};


/* ==========================================================
   UPDATE PROGRESS
========================================================== */

Music.updateProgress=function(){

    if(

        !this.progress ||

        !this.audio ||

        this.audio.duration===0

    ){

        return;

    }

    const percentage=

        (this.audio.currentTime/

        this.audio.duration)*100;

    this.progress.style.width=

        percentage+"%";

};


/* ==========================================================
   SEEK
========================================================== */

Music.seek=function(seconds){

    if(!this.audio){

        return;

    }

    this.audio.currentTime=seconds;

};


/* ==========================================================
   SET SOURCE
========================================================== */

Music.setSource=function(src){

    if(!this.audio){

        return;

    }

    this.audio.src=src;

    this.audio.load();

};


/* ==========================================================
   FADE IN
========================================================== */

Music.fadeIn=function(duration=1000){

    if(!this.audio){

        return;

    }

    this.audio.volume=0;

    this.play();

    let volume=0;

    const step=this.config.volume/20;

    const timer=setInterval(()=>{

        volume+=step;

        if(volume>=this.config.volume){

            volume=this.config.volume;

            clearInterval(timer);

        }

        this.audio.volume=volume;

    },duration/20);

};


/* ==========================================================
   FADE OUT
========================================================== */

Music.fadeOut=function(duration=1000){

    if(!this.audio){

        return;

    }

    let volume=this.audio.volume;

    const step=volume/20;

    const timer=setInterval(()=>{

        volume-=step;

        if(volume<=0){

            volume=0;

            clearInterval(timer);

            this.pause();

        }

        this.audio.volume=volume;

    },duration/20);

};

/* ==========================================================
   SAVE STATE
========================================================== */

Music.save=function(){

    if(

        !this.config.rememberState

    ){

        return;

    }

    localStorage.setItem(

        AppConfig.storage.musicKey,

        JSON.stringify({

            playing:this.playing,

            muted:this.muted,

            volume:this.audio

                ? this.audio.volume

                : this.config.volume

        })

    );

};


/* ==========================================================
   RESTORE STATE
========================================================== */

Music.restore=function(){

    if(

        !this.config.rememberState

    ){

        return;

    }

    const data=

        localStorage.getItem(

            AppConfig.storage.musicKey

        );

    if(!data){

        return;

    }

    const state=

        JSON.parse(data);

    if(state.volume!==undefined){

        this.setVolume(

            state.volume

        );

    }

    if(state.muted){

        this.mute();

    }

};


/* ==========================================================
   REFRESH
========================================================== */

Music.refresh=function(){

    this.cache();

};


/* ==========================================================
   RESIZE
========================================================== */

Music.onResize=function(){

};


/* ==========================================================
   SCROLL
========================================================== */

Music.onScroll=function(){

};


/* ==========================================================
   RESUME
========================================================== */

Music.resume=function(){

    if(

        this.playing

    ){

        this.play();

    }

};


/* ==========================================================
   GET STATE
========================================================== */

Music.getState=function(){

    return{

        initialized:this.initialized,

        playing:this.playing,

        muted:this.muted,

        volume:this.audio

            ? this.audio.volume

            : 0

    };

};


/* ==========================================================
   SET STATE
========================================================== */

Music.setState=function(state={}){

    Object.assign(

        this,

        state

    );

};


/* ==========================================================
   DESTROY
========================================================== */

Music.destroy=function(){

    this.stop();

    this.initialized=false;

    this.playing=false;

    this.audio=null;

    this.button=null;

    this.progress=null;

};


/* ==========================================================
   EXPORT
========================================================== */

window.Music=Music;


/* ==========================================================
   END OF FILE
========================================================== */