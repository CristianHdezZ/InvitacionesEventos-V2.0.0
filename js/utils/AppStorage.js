/* ==========================================================
   INVITATION ENGINE V2
   FILE        : storage.js
   VERSION     : 2.0.2
   MODULE      : STORAGE
========================================================== */

"use strict";

/* ==========================================================
   STORAGE
========================================================== */

const AppStorage ={

    prefix:AppConfig.storage.prefix

};


/* ==========================================================
   KEY
========================================================== */

AppStorage.key=function(key){

    return `${this.prefix}:${key}`;

};


/* ==========================================================
   SET
========================================================== */

AppStorage.set=function(

    key,

    value

){

    localStorage.setItem(

        this.key(key),

        JSON.stringify(value)

    );

};


/* ==========================================================
   GET
========================================================== */

AppStorage.get=function(

    key,

    defaultValue=null

){

    const value=

        localStorage.getItem(

            this.key(key)

        );

    if(value===null){

        return defaultValue;

    }

    try{

        return JSON.parse(value);

    }

    catch{

        return defaultValue;

    }

};


/* ==========================================================
   REMOVE
========================================================== */

AppStorage.remove=function(key){

    localStorage.removeItem(

        this.key(key)

    );

};


/* ==========================================================
   CLEAR
========================================================== */

AppStorage.clear=function(){

    Object.keys(localStorage)

        .forEach(key=>{

            if(

                key.startsWith(

                    this.prefix+":"

                )

            ){

                localStorage.removeItem(key);

            }

        });

};


/* ==========================================================
   EXISTS
========================================================== */

AppStorage.exists=function(key){

    return localStorage.getItem(

        this.key(key)

    )!==null;

};


/* ==========================================================
   SIZE
========================================================== */

AppStorage.size=function(){

    return Object.keys(localStorage)

        .filter(key=>

            key.startsWith(

                this.prefix+":"

            )

        ).length;

};

/* ==========================================================
   SESSION SET
========================================================== */

AppStorage.sessionSet=function(

    key,

    value

){

    sessionStorage.setItem(

        this.key(key),

        JSON.stringify(value)

    );

};


/* ==========================================================
   SESSION GET
========================================================== */

AppStorage.sessionGet=function(

    key,

    defaultValue=null

){

    const value=

        sessionStorage.getItem(

            this.key(key)

        );

    if(value===null){

        return defaultValue;

    }

    try{

        return JSON.parse(value);

    }

    catch{

        return defaultValue;

    }

};


/* ==========================================================
   SESSION REMOVE
========================================================== */

AppStorage.sessionRemove=function(key){

    sessionStorage.removeItem(

        this.key(key)

    );

};


/* ==========================================================
   SESSION CLEAR
========================================================== */

AppStorage.sessionClear=function(){

    Object.keys(sessionStorage)

        .forEach(key=>{

            if(

                key.startsWith(

                    this.prefix+":"

                )

            ){

                sessionStorage.removeItem(key);

            }

        });

};


/* ==========================================================
   SET WITH EXPIRATION
========================================================== */

AppStorage.setExpire=function(

    key,

    value,

    minutes

){

    const payload={

        value,

        expires:

            Date.now()+

            (minutes*60000)

    };

    this.set(

        key,

        payload

    );

};


/* ==========================================================
   GET WITH EXPIRATION
========================================================== */

AppStorage.getExpire=function(

    key,

    defaultValue=null

){

    const payload=

        this.get(key);

    if(!payload){

        return defaultValue;

    }

    if(

        Date.now()>

        payload.expires

    ){

        this.remove(key);

        return defaultValue;

    }

    return payload.value;

};


/* ==========================================================
   TOUCH
========================================================== */

AppStorage.touch=function(key){

    return this.exists(key);

};


/* ==========================================================
   KEYS
========================================================== */

AppStorage.keys=function(){

    return Object.keys(localStorage)

        .filter(key=>

            key.startsWith(

                this.prefix+":"

            )

        );

};

/* ==========================================================
   VALUES
========================================================== */

AppStorage.values=function(){

    return this.keys().map(key=>{

        const value=

            localStorage.getItem(key);

        try{

            return JSON.parse(value);

        }

        catch{

            return value;

        }

    });

};


/* ==========================================================
   ENTRIES
========================================================== */

AppStorage.entries=function(){

    return this.keys().map(key=>{

        const value=

            localStorage.getItem(key);

        try{

            return [

                key.replace(

                    this.prefix+":",

                    ""

                ),

                JSON.parse(value)

            ];

        }

        catch{

            return [

                key.replace(

                    this.prefix+":",

                    ""

                ),

                value

            ];

        }

    });

};


/* ==========================================================
   EXPORT JSON
========================================================== */

AppStorage.export=function(){

    const data={};

    this.entries().forEach(

        ([key,value])=>{

            data[key]=value;

        }

    );

    return JSON.stringify(

        data,

        null,

        4

    );

};


/* ==========================================================
   IMPORT JSON
========================================================== */

AppStorage.import=function(json){

    try{

        const data=

            JSON.parse(json);

        Object.keys(data)

            .forEach(key=>{

                this.set(

                    key,

                    data[key]

                );

            });

        return true;

    }

    catch{

        return false;

    }

};


/* ==========================================================
   CLONE
========================================================== */

AppStorage.clone=function(

    from,

    to

){

    const value=

        this.get(from);

    if(value!==null){

        this.set(

            to,

            value

        );

    }

};


/* ==========================================================
   RENAME
========================================================== */

AppStorage.rename=function(

    oldKey,

    newKey

){

    const value=

        this.get(oldKey);

    if(value!==null){

        this.set(

            newKey,

            value

        );

        this.remove(

            oldKey

        );

    }

};


/* ==========================================================
   MERGE
========================================================== */

AppStorage.merge=function(

    key,

    object

){

    const current=

        this.get(

            key,

            {}

        );

    this.set(

        key,

        {

            ...current,

            ...object

        }

    );

};

/* ==========================================================
   HAS
========================================================== */

AppStorage.has=function(key){

    return this.exists(key);

};


/* ==========================================================
   COUNT
========================================================== */

AppStorage.count=function(){

    return this.keys().length;

};


/* ==========================================================
   MEMORY USAGE
========================================================== */

AppStorage.memory=function(){

    let total=0;

    this.keys().forEach(key=>{

        const value=

            localStorage.getItem(key);

        total+=

            key.length+

            (value?value.length:0);

    });

    return total;

};


/* ==========================================================
   SAVE SETTINGS
========================================================== */

AppStorage.saveSettings=function(settings){

    this.set(

        AppConfig.storage.settingsKey,

        settings

    );

};


/* ==========================================================
   LOAD SETTINGS
========================================================== */

AppStorage.loadSettings=function(){

    return this.get(

        AppConfig.storage.settingsKey,

        {}

    );

};


/* ==========================================================
   SAVE THEME
========================================================== */

AppStorage.saveTheme=function(theme){

    this.set(

        AppConfig.storage.themeKey,

        theme

    );

};


/* ==========================================================
   LOAD THEME
========================================================== */

AppStorage.loadTheme=function(){

    return this.get(

        AppConfig.storage.themeKey,

        AppConfig.theme.name

    );

};


/* ==========================================================
   SAVE GALLERY
========================================================== */

AppStorage.saveGallery=function(images){

    this.set(

        AppConfig.storage.galleryKey,

        images

    );

};


/* ==========================================================
   LOAD GALLERY
========================================================== */

AppStorage.loadGallery=function(){

    return this.get(

        AppConfig.storage.galleryKey,

        []

    );

};


/* ==========================================================
   RESET
========================================================== */

AppStorage.reset=function(){

    this.clear();

    this.sessionClear();

};

/* ==========================================================
   BACKUP
========================================================== */

AppStorage.backup=function(){

    return{

        created:new Date().toISOString(),

        version:AppConfig.version,

        data:JSON.parse(

            this.export()

        )

    };

};


/* ==========================================================
   RESTORE
========================================================== */

AppStorage.restore=function(backup){

    if(

        !backup ||

        !backup.data

    ){

        return false;

    }

    this.clear();

    Object.entries(

        backup.data

    ).forEach(

        ([key,value])=>{

            this.set(

                key,

                value

            );

        }

    );

    return true;

};


/* ==========================================================
   EXPORT
========================================================== */

window.AppStorage=AppStorage;


/* ==========================================================
   END OF FILE
========================================================== */