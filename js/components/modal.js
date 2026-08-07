/* ==========================================================
   INVITATION ENGINE V2
   FILE        : modal.js
   VERSION     : 2.0.2
   MODULE      : MODAL
========================================================== */

"use strict";

/* ==========================================================
   COMPONENT
========================================================== */

const Modal={

    initialized:false,

    opened:false,

    current:null,

    elements:{},

    config:AppConfig.modal

};


/* ==========================================================
   INIT
========================================================== */

Modal.init=function(){

    if(this.initialized){

        return;

    }

    this.cache();

    if(!this.elements.modal){

        return;

    }

    this.bindEvents();

    this.initialized=true;

};


/* ==========================================================
   CACHE
========================================================== */

Modal.cache=function(){

    this.elements.modal=

        document.querySelector(".modal");

    this.elements.card=

        document.querySelector(".modal__card");

    this.elements.backdrop=

        document.querySelector(".modal__backdrop");

    this.elements.title=

        document.querySelector(".modal__title");

    this.elements.message=

        document.querySelector(".modal__message");

    this.elements.icon=

        document.querySelector(".modal__icon");

    this.elements.close=

        document.querySelector("[data-modal-close]");

    this.elements.confirm=

        document.querySelector("[data-modal-confirm]");

    this.elements.cancel=

        document.querySelector("[data-modal-cancel]");

};


/* ==========================================================
   EVENTS
========================================================== */

Modal.bindEvents=function(){

    if(this.elements.close){

        this.elements.close.addEventListener(

            "click",

            ()=>{

                this.close();

            }

        );

    }

    if(this.elements.backdrop){

        this.elements.backdrop.addEventListener(

            "click",

            ()=>{

                if(this.config.closeOnBackdrop){

                    this.close();

                }

            }

        );

    }

    document.addEventListener(

        "keydown",

        event=>{

            if(

                event.key==="Escape" &&

                this.opened &&

                this.config.closeOnEscape

            ){

                this.close();

            }

        }

    );

};

/* ==========================================================
   OPEN
========================================================== */

Modal.open=function(options={}){

    this.current=options;

    this.setContent(options);

    this.elements.modal.classList.add(

        "is-open"

    );

    document.body.classList.add(

        "overflow-hidden"

    );

    this.opened=true;

    InvitationApp.openModal();

};


/* ==========================================================
   CLOSE
========================================================== */

Modal.close=function(){

    if(!this.elements.modal){

        return;

    }

    this.elements.modal.classList.remove(

        "is-open"

    );

    document.body.classList.remove(

        "overflow-hidden"

    );

    this.opened=false;

    InvitationApp.closeModal();

};


/* ==========================================================
   TOGGLE
========================================================== */

Modal.toggle=function(options={}){

    if(this.opened){

        this.close();

    }else{

        this.open(options);

    }

};


/* ==========================================================
   SET CONTENT
========================================================== */

Modal.setContent=function(options={}){

    if(

        this.elements.title &&

        options.title

    ){

        this.elements.title.textContent=

            options.title;

    }

    if(

        this.elements.message &&

        options.message

    ){

        this.elements.message.textContent=

            options.message;

    }

    if(

        this.elements.icon &&

        options.icon

    ){

        this.elements.icon.innerHTML=

            options.icon;

    }

};


/* ==========================================================
   SUCCESS
========================================================== */

Modal.success=function(

    title,

    message

){

    this.open({

        title,

        message,

        type:"success"

    });

};


/* ==========================================================
   ERROR
========================================================== */

Modal.error=function(

    title,

    message

){

    this.open({

        title,

        message,

        type:"error"

    });

};


/* ==========================================================
   WARNING
========================================================== */

Modal.warning=function(

    title,

    message

){

    this.open({

        title,

        message,

        type:"warning"

    });

};


/* ==========================================================
   INFO
========================================================== */

Modal.info=function(

    title,

    message

){

    this.open({

        title,

        message,

        type:"info"

    });

};

/* ==========================================================
   SET TYPE
========================================================== */

Modal.setType=function(type="info"){

    if(

        !this.elements.card

    ){

        return;

    }

    this.elements.card.classList.remove(

        "modal--success",

        "modal--error",

        "modal--warning",

        "modal--info"

    );

    this.elements.card.classList.add(

        "modal--"+type

    );

};


/* ==========================================================
   LOADING
========================================================== */

Modal.loading=function(

    title="Cargando...",

    message="Por favor espere."

){

    this.open({

        title,

        message,

        type:"info"

    });

    this.elements.modal.classList.add(

        "is-loading"

    );

};


/* ==========================================================
   STOP LOADING
========================================================== */

Modal.stopLoading=function(){

    this.elements.modal.classList.remove(

        "is-loading"

    );

};


/* ==========================================================
   REFRESH
========================================================== */

Modal.refresh=function(){

    this.cache();

};


/* ==========================================================
   RESIZE
========================================================== */

Modal.onResize=function(){

};


/* ==========================================================
   SCROLL
========================================================== */

Modal.onScroll=function(){

};


/* ==========================================================
   PAUSE
========================================================== */

Modal.pause=function(){

    if(

        this.opened

    ){

        this.elements.modal.classList.add(

            "is-paused"

        );

    }

};


/* ==========================================================
   RESUME
========================================================== */

Modal.resume=function(){

    this.elements.modal.classList.remove(

        "is-paused"

    );

};


/* ==========================================================
   SHOW
========================================================== */

Modal.show=function(){

    this.elements.modal.style.display="flex";

};


/* ==========================================================
   HIDE
========================================================== */

Modal.hide=function(){

    this.elements.modal.style.display="none";

};

/* ==========================================================
   GET STATE
========================================================== */

Modal.getState=function(){

    return{

        initialized:this.initialized,

        opened:this.opened,

        current:this.current

    };

};


/* ==========================================================
   SET STATE
========================================================== */

Modal.setState=function(state={}){

    Object.assign(

        this,

        state

    );

};


/* ==========================================================
   DESTROY
========================================================== */

Modal.destroy=function(){

    this.close();

    this.initialized=false;

    this.opened=false;

    this.current=null;

    this.elements={};

};


/* ==========================================================
   CONFIRM
========================================================== */

Modal.confirm=function(options={}){

    this.open(options);

    return new Promise(resolve=>{

        if(this.elements.confirm){

            this.elements.confirm.onclick=()=>{

                this.close();

                resolve(true);

            };

        }

        if(this.elements.cancel){

            this.elements.cancel.onclick=()=>{

                this.close();

                resolve(false);

            };

        }

    });

};


/* ==========================================================
   ALERT
========================================================== */

Modal.alert=function(

    title,

    message

){

    this.open({

        title,

        message,

        type:"info"

    });

};


/* ==========================================================
   PROMPT
========================================================== */

Modal.prompt=function(

    title,

    message

){

    this.open({

        title,

        message,

        type:"prompt"

    });

};


/* ==========================================================
   EXPORT
========================================================== */

window.Modal=Modal;


/* ==========================================================
   END OF FILE
========================================================== */