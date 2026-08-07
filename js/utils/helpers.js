/* ==========================================================
   INVITATION ENGINE V2
   FILE        : helpers.js
   VERSION     : 2.0.2
   MODULE      : HELPERS
========================================================== */

"use strict";

/* ==========================================================
   HELPERS
========================================================== */

const Helpers={};


/* ==========================================================
   UUID
========================================================== */

Helpers.uuid=function(){

    return crypto.randomUUID();

};


/* ==========================================================
   RANDOM
========================================================== */

Helpers.random=function(

    min,

    max

){

    return Math.floor(

        Math.random()*

        (max-min+1)

    )+min;

};


/* ==========================================================
   CLAMP
========================================================== */

Helpers.clamp=function(

    value,

    min,

    max

){

    return Math.min(

        Math.max(value,min),

        max

    );

};


/* ==========================================================
   ROUND
========================================================== */

Helpers.round=function(

    value,

    decimals=2

){

    return Number(

        value.toFixed(

            decimals

        )

    );

};


/* ==========================================================
   FORMAT NUMBER
========================================================== */

Helpers.number=function(value){

    return new Intl.NumberFormat(

        AppConfig.language

    ).format(value);

};


/* ==========================================================
   PAD
========================================================== */

Helpers.pad=function(

    value,

    size=2

){

    return String(value)

        .padStart(

            size,

            "0"

        );

};


/* ==========================================================
   PERCENT
========================================================== */

Helpers.percent=function(

    value,

    total

){

    if(total===0){

        return 0;

    }

    return(

        value*100/

        total

    );

};


/* ==========================================================
   CAPITALIZE
========================================================== */

Helpers.capitalize=function(text){

    if(!text){

        return "";

    }

    return text.charAt(0)

        .toUpperCase()

        +

        text.slice(1);

};

/* ==========================================================
   LOWERCASE
========================================================== */

Helpers.lower=function(text){

    return String(text)

        .toLowerCase();

};


/* ==========================================================
   UPPERCASE
========================================================== */

Helpers.upper=function(text){

    return String(text)

        .toUpperCase();

};


/* ==========================================================
   TRIM
========================================================== */

Helpers.trim=function(text){

    return String(text)

        .trim();

};


/* ==========================================================
   SLUG
========================================================== */

Helpers.slug=function(text){

    return String(text)

        .normalize("NFD")

        .replace(

            /[\u0300-\u036f]/g,

            ""

        )

        .toLowerCase()

        .replace(

            /[^a-z0-9]+/g,

            "-"

        )

        .replace(

            /^-|-$/

            ,""

        );

};


/* ==========================================================
   TRUNCATE
========================================================== */

Helpers.truncate=function(

    text,

    length=100

){

    if(

        text.length<=length

    ){

        return text;

    }

    return text.substring(

        0,

        length

    )+"...";

};


/* ==========================================================
   ESCAPE HTML
========================================================== */

Helpers.escape=function(text){

    const div=

        document.createElement(

            "div"

        );

    div.textContent=text;

    return div.innerHTML;

};


/* ==========================================================
   COPY
========================================================== */

Helpers.copy=function(text){

    return navigator.clipboard.writeText(

        text

    );

};


/* ==========================================================
   IS EMPTY
========================================================== */

Helpers.empty=function(value){

    return(

        value===null ||

        value===undefined ||

        value==="" ||

        (Array.isArray(value)

            &&

            value.length===0)

    );

};


/* ==========================================================
   IS OBJECT
========================================================== */

Helpers.object=function(value){

    return(

        typeof value==="object" &&

        value!==null &&

        !Array.isArray(value)

    );

};

/* ==========================================================
   DEEP CLONE
========================================================== */

Helpers.clone=function(value){

    return structuredClone(

        value

    );

};


/* ==========================================================
   MERGE
========================================================== */

Helpers.merge=function(

    target={},

    source={}

){

    return{

        ...target,

        ...source

    };

};


/* ==========================================================
   WAIT
========================================================== */

Helpers.wait=function(ms){

    return new Promise(resolve=>{

        setTimeout(

            resolve,

            ms

        );

    });

};


/* ==========================================================
   DATE FORMAT
========================================================== */

Helpers.date=function(

    value,

    locale=AppConfig.language

){

    return new Date(value)

        .toLocaleDateString(

            locale

        );

};


/* ==========================================================
   TIME FORMAT
========================================================== */

Helpers.time=function(

    value,

    locale=AppConfig.language

){

    return new Date(value)

        .toLocaleTimeString(

            locale

        );

};


/* ==========================================================
   DATE TIME
========================================================== */

Helpers.dateTime=function(

    value,

    locale=AppConfig.language

){

    return new Date(value)

        .toLocaleString(

            locale

        );

};


/* ==========================================================
   NOW
========================================================== */

Helpers.now=function(){

    return Date.now();

};


/* ==========================================================
   TODAY
========================================================== */

Helpers.today=function(){

    return new Date();

};


/* ==========================================================
   IS MOBILE
========================================================== */

Helpers.mobile=function(){

    return window.innerWidth<=

        AppConfig.responsive.mobile;

};


/* ==========================================================
   IS TABLET
========================================================== */

Helpers.tablet=function(){

    return(

        window.innerWidth>

        AppConfig.responsive.mobile &&

        window.innerWidth<=

        AppConfig.responsive.tablet

    );

};

/* ==========================================================
   IS DESKTOP
========================================================== */

Helpers.desktop=function(){

    return(

        window.innerWidth>

        AppConfig.responsive.tablet

    );

};


/* ==========================================================
   VIEWPORT
========================================================== */

Helpers.viewport=function(){

    return{

        width:window.innerWidth,

        height:window.innerHeight

    };

};


/* ==========================================================
   SCROLL POSITION
========================================================== */

Helpers.scroll=function(){

    return{

        x:window.scrollX,

        y:window.scrollY

    };

};


/* ==========================================================
   UNIQUE ARRAY
========================================================== */

Helpers.unique=function(array){

    return[

        ...new Set(array)

    ];

};


/* ==========================================================
   GROUP BY
========================================================== */

Helpers.groupBy=function(

    array,

    key

){

    return array.reduce(

        (result,item)=>{

            (result[item[key]]??=[])

                .push(item);

            return result;

        },

        {}

    );

};


/* ==========================================================
   SORT BY
========================================================== */

Helpers.sortBy=function(

    array,

    key

){

    return[...array]

        .sort(

            (a,b)=>

                a[key]>b[key]

                    ?1

                    :-1

        );

};


/* ==========================================================
   DEBOUNCE
========================================================== */

Helpers.debounce=function(

    callback,

    delay=250

){

    let timeout;

    return(...args)=>{

        clearTimeout(timeout);

        timeout=setTimeout(

            ()=>callback(...args),

            delay

        );

    };

};


/* ==========================================================
   THROTTLE
========================================================== */

Helpers.throttle=function(

    callback,

    delay=100

){

    let waiting=false;

    return(...args)=>{

        if(waiting){

            return;

        }

        callback(...args);

        waiting=true;

        setTimeout(

            ()=>{

                waiting=false;

            },

            delay

        );

    };

};


/* ==========================================================
   DOWNLOAD JSON
========================================================== */

Helpers.download=function(

    filename,

    data

){

    const blob=

        new Blob(

            [

                JSON.stringify(

                    data,

                    null,

                    4

                )

            ],

            {

                type:

                "application/json"

            }

        );

    const url=

        URL.createObjectURL(blob);

    const link=

        document.createElement("a");

    link.href=url;

    link.download=filename;

    link.click();

    URL.revokeObjectURL(url);

};

/* ==========================================================
   FILE TO BASE64
========================================================== */

Helpers.fileToBase64=function(file){

    return new Promise(

        (resolve,reject)=>{

            const reader=

                new FileReader();

            reader.onload=()=>

                resolve(

                    reader.result

                );

            reader.onerror=

                reject;

            reader.readAsDataURL(

                file

            );

        }

    );

};


/* ==========================================================
   BASE64 TO BLOB
========================================================== */

Helpers.base64ToBlob=function(

    base64,

    type="application/octet-stream"

){

    const bytes=

        atob(

            base64.split(",").pop()

        );

    const array=

        new Uint8Array(

            bytes.length

        );

    for(

        let i=0;

        i<bytes.length;

        i++

    ){

        array[i]=

            bytes.charCodeAt(i);

    }

    return new Blob(

        [array],

        {type}

    );

};


/* ==========================================================
   GENERATE ID
========================================================== */

Helpers.id=function(

    prefix="id"

){

    return `${prefix}-${

        Date.now()

    }-${

        Math.random()

            .toString(36)

            .substring(2,8)

    }`;

};


/* ==========================================================
   PARSE JSON
========================================================== */

Helpers.parse=function(

    text,

    fallback={}

){

    try{

        return JSON.parse(text);

    }

    catch{

        return fallback;

    }

};


/* ==========================================================
   STRINGIFY JSON
========================================================== */

Helpers.stringify=function(

    value,

    spaces=4

){

    return JSON.stringify(

        value,

        null,

        spaces

    );

};


/* ==========================================================
   IS JSON
========================================================== */

Helpers.isJSON=function(text){

    try{

        JSON.parse(text);

        return true;

    }

    catch{

        return false;

    }

};


/* ==========================================================
   RANDOM COLOR
========================================================== */

Helpers.randomColor=function(){

    return "#"+

        Math.floor(

            Math.random()*

            16777215

        )

        .toString(16)

        .padStart(

            6,

            "0"

        );

};


/* ==========================================================
   RANDOM ITEM
========================================================== */

Helpers.randomItem=function(array){

    return array[

        Helpers.random(

            0,

            array.length-1

        )

    ];

};


/* ==========================================================
   RANGE
========================================================== */

Helpers.range=function(

    start,

    end

){

    return Array.from(

        {

            length:

                end-start+1

        },

        (_,index)=>

            start+index

    );

};

/* ==========================================================
   EXPORT
========================================================== */

window.Helpers=Helpers;


/* ==========================================================
   END OF FILE
========================================================== */