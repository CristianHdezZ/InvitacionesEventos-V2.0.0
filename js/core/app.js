/* ==========================================================
   INVITATION ENGINE V2
   FILE        : app.js
   VERSION     : 2.0.2
   MODULE      : CORE
========================================================== */

"use strict";

/* ==========================================================
   APPLICATION
========================================================== */

const InvitationApp = {

    version: AppConfig.version,

    initialized:false,

    components:{},

    state:{},

    dom:{}

};


/* ==========================================================
   INITIAL STATE
========================================================== */

InvitationApp.state = {

    loading: true,

    initialized: false,

    bootstrapped: false,

    destroyed: false,

    paused: false,

    gateOpened: false,

    musicPlaying: false,

    modalOpened: false,

    theme: AppConfig.theme.name,

    language: AppConfig.language,

    startedAt: null,

    finishedAt: null,

    componentsLoaded: 0,

    totalComponents: 0

};


/* ==========================================================
   DOM CACHE
========================================================== */

InvitationApp.dom={

    body:null,

    html:null,

    gate:null,

    hero:null,

    countdown:null,

    gallery:null,

    modal:null,

    music:null

};


/* ==========================================================
   INIT
========================================================== */

InvitationApp.init=function(){

    if(this.initialized){

        return;

    }
    this.bootstrap();    

};

/* ==========================================================
   BOOTSTRAP
========================================================== */

InvitationApp.bootstrap = function () {

    this.log(

        "Bootstrapping application..."

    );

    this.cacheDOM();

    this.loadTheme();

    this.loadSettings();

    this.registerComponents();

    this.bindEvents();

    this.initializeComponents();

    this.finish();

};


/* ==========================================================
   CACHE DOM
========================================================== */

InvitationApp.cacheDOM=function(){

    this.dom.body=document.body;

    this.dom.html=document.documentElement;

    this.dom.gate=document.querySelector(".gate");

    this.dom.hero=document.querySelector(".hero");

    this.dom.countdown=document.querySelector(".countdown");

    this.dom.gallery=document.querySelector(".gallery");

    this.dom.modal=document.querySelector(".modal");

    this.dom.music=document.querySelector("audio");

};


/* ==========================================================
   LOAD THEME
========================================================== */

InvitationApp.loadTheme=function(){

    this.dom.body.classList.add(

        "theme-"+

        this.state.theme

    );

};

/* ==========================================================
   LOAD SETTINGS
========================================================== */

InvitationApp.loadSettings = function () {

    if (

        typeof AppStorage  === "undefined"

    ) {

        return;

    }

    try {

        const settings = AppStorage.get(

            AppConfig.storage.settingsKey,

            {}

        );

        if (

            settings.theme

        ) {

            this.state.theme = settings.theme;

        }

        this.log(

            "Settings loaded."

        );

    }

    catch (error) {

        this.warn(

            "Unable to load settings.",

            error

        );

    }

};

/* ==========================================================
   REGISTER COMPONENTS
========================================================== */

InvitationApp.registerComponents = function () {

    const components = [

        {
            name: "gate",
            instance: window.Gate
        },

        {
            name: "hero",
            instance: window.Hero
        },

        {
            name: "music",
            instance: window.Music
        },

        {
            name: "countdown",
            instance: window.Countdown
        },

        {
            name: "gallery",
            instance: window.Gallery
        },

        {
            name: "timeline",
            instance: window.Timeline
        },

        {
            name: "modal",
            instance: window.Modal
        },

        {
            name: "rsvp",
            instance: window.Rsvp
        },

        {
            name: "gifts",
            instance: window.Gifts
        },

        {
            name: "playlist",
            instance: window.Playlist
        },

        {
            name: "scroll",
            instance: window.Scroll
        }

    ];

    components.forEach(component => {

        if (component.instance) {

            ComponentManager.register(component);

        }

    });

};

/* ==========================================================
   HAS COMPONENT
========================================================== */

InvitationApp.hasComponent = function (name) {

    return Object.prototype.hasOwnProperty.call(

        this.components,

        name

    ) &&

    this.components[name] !== null;

};

/* ==========================================================
   INIT COMPONENT
========================================================== */

InvitationApp.initComponent = function (name) {

    if (!this.hasComponent(name)) {

        return false;

    }

    const component = this.components[name];

    if (

        typeof component.init === "function"

    ) {

        component.init();

        return true;

    }

    return false;

};

/* ==========================================================
   REFRESH COMPONENT
========================================================== */

InvitationApp.refreshComponent = function (name) {

    if (!this.hasComponent(name)) {

        return false;

    }

    const component = this.components[name];

    if (

        typeof component.refresh === "function"

    ) {

        component.refresh();

        return true;

    }

    return false;

};

/* ==========================================================
   DESTROY COMPONENT
========================================================== */

InvitationApp.destroyComponent = function (name) {

    if (!this.hasComponent(name)) {

        return false;

    }

    const component = this.components[name];

    if (

        typeof component.destroy === "function"

    ) {

        component.destroy();

        return true;

    }

    return false;

};

/* ==========================================================
   COMPONENT LIST
========================================================== */

InvitationApp.getComponents = function () {

    return Object.keys(

        this.components

    );

};

/* ==========================================================
   INITIALIZE COMPONENTS
========================================================== */

InvitationApp.initializeComponents = function () {

    ComponentManager.initAll();

};


/* ==========================================================
   EVENTS
========================================================== */

InvitationApp.bindEvents=function(){

    window.addEventListener(

        "resize",

        this.onResize.bind(this)

    );

    window.addEventListener(

        "scroll",

        this.onScroll.bind(this),

        {

            passive:true

        }

    );

    window.addEventListener(

        "load",

        this.onLoad.bind(this)

    );

    document.addEventListener(

        "visibilitychange",

        this.onVisibilityChange.bind(this)

    );

};


/* ==========================================================
   WINDOW LOAD
========================================================== */

InvitationApp.onLoad=function(){

    this.state.loading=false;

};


/* ==========================================================
   RESIZE
========================================================== */

InvitationApp.onResize = function () {

    ComponentManager.getEnabled()

        .forEach(component => {

            if (

                component.instance &&

                typeof component.instance.onResize === "function"

            ) {

                component.instance.onResize();

            }

        });

};


/* ==========================================================
   SCROLL
========================================================== */

InvitationApp.onScroll = function () {

    ComponentManager.getEnabled()

        .forEach(component => {

            if (

                component.instance &&

                typeof component.instance.onScroll === "function"

            ) {

                component.instance.onScroll();

            }

        });

};


/* ==========================================================
   VISIBILITY
========================================================== */

InvitationApp.onVisibilityChange=function(){

    if(document.hidden){

        this.pause();

    }else{

        this.resume();

    }

};

/* ==========================================================
   PAUSE
========================================================== */

InvitationApp.pause = function () {

    if (this.state.paused) {

        return;

    }

    this.state.paused = true;

    ComponentManager.pauseAll();

    this.emit("app:paused");

};


/* ==========================================================
   RESUME
========================================================== */

InvitationApp.resume = function () {

    if (!this.state.paused) {

        return;

    }

    this.state.paused = false;

    ComponentManager.resumeAll();

    this.emit("app:resumed");

};


/* ==========================================================
   OPEN GATE
========================================================== */

InvitationApp.openGate=function(){

    this.state.gateOpened=true;

};


/* ==========================================================
   PLAY MUSIC
========================================================== */

InvitationApp.playMusic=function(){

    this.state.musicPlaying=true;

};


/* ==========================================================
   STOP MUSIC
========================================================== */

InvitationApp.stopMusic=function(){

    this.state.musicPlaying=false;

};


/* ==========================================================
   OPEN MODAL
========================================================== */

InvitationApp.openModal=function(){

    this.state.modalOpened=true;

};


/* ==========================================================
   CLOSE MODAL
========================================================== */

InvitationApp.closeModal=function(){

    this.state.modalOpened=false;

};


/* ==========================================================
   CHANGE THEME
========================================================== */

InvitationApp.changeTheme=function(theme){

    this.dom.body.className=

        this.dom.body.className

        .replace(

            /theme-[^\s]+/g,

            ""

        );

    this.dom.body.classList.add(

        "theme-"+theme

    );

    this.state.theme=theme;

};


/* ==========================================================
   REFRESH
========================================================== */

InvitationApp.refresh = function () {

    ComponentManager.refreshAll();

};


/* ==========================================================
   DESTROY
========================================================== */

InvitationApp.destroy = function () {

    ComponentManager.destroyAll();

    this.state.destroyed = true;

    this.emit("app:destroyed");

};

/* ==========================================================
   LOG
========================================================== */

InvitationApp.log=function(){

    if(!AppConfig.debug){

        return;

    }

    console.log.apply(

        console,

        arguments

    );

};


/* ==========================================================
   ERROR
========================================================== */

InvitationApp.error=function(){

    console.error.apply(

        console,

        arguments

    );

};


/* ==========================================================
   WARNING
========================================================== */

InvitationApp.warn=function(){

    console.warn.apply(

        console,

        arguments

    );

};


/* ==========================================================
   SET STATE
========================================================== */

InvitationApp.setState=function(key,value){

    this.state[key]=value;

};


/* ==========================================================
   GET STATE
========================================================== */

InvitationApp.getState=function(key){

    return this.state[key];

};


/* ==========================================================
   GET COMPONENT
========================================================== */

InvitationApp.getComponent = function (name) {

    return ComponentManager.get(name);

};

InvitationApp.getComponents = function () {

    return ComponentManager.getAll();

};


/* ==========================================================
   REGISTER COMPONENT
========================================================== */

InvitationApp.register = function (

    name,

    instance

) {

    if (!name) {

        return;

    }

    this.components[name] = instance;

    this.log(

        "Component registered:",

        name

    );

};


/* ==========================================================
   FINISH INIT
========================================================== */

InvitationApp.finish = function () {

    this.initialized = true;

    this.state.initialized = true;

    this.state.bootstrapped = true;

    this.state.loading = false;

    this.state.startedAt = performance.now();

    this.emit(

        "app:initialized",

        {

            version: this.version

        }

    );

    this.log(

        "Invitation Engine",

        this.version,

        "initialized."

    );

};

/* ==========================================================
   EMIT
========================================================== */

InvitationApp.emit = function (

    event,

    detail = {}

) {

    document.dispatchEvent(

        new CustomEvent(

            event,

            {

                detail

            }

        )

    );

};

/* ==========================================================
   ON
========================================================== */

InvitationApp.on = function (

    event,

    callback

) {

    document.addEventListener(

        event,

        callback

    );

};

/* ==========================================================
   OFF
========================================================== */

InvitationApp.off = function (

    event,

    callback

) {

    document.removeEventListener(

        event,

        callback

    );

};


/* ==========================================================
   DOM READY
========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        InvitationApp.init();

    }

);



/* ==========================================================
   GLOBAL EXPORT
========================================================== */

window.InvitationApp=InvitationApp;



/* ==========================================================
   END OF FILE
========================================================== */