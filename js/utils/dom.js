/* ==========================================================
   INVITATION ENGINE V2
   FILE        : dom.js
   VERSION     : 2.0.2
   MODULE      : DOM UTILITIES
========================================================== */

"use strict";

/* ==========================================================
   DOM
========================================================== */

const DOM={};


/* ==========================================================
   QUERY
========================================================== */

DOM.$=function(selector,parent=document){

    return parent.querySelector(

        selector

    );

};


/* ==========================================================
   QUERY ALL
========================================================== */

DOM.$$=function(selector,parent=document){

    return [

        ...parent.querySelectorAll(

            selector

        )

    ];

};


/* ==========================================================
   CREATE
========================================================== */

DOM.create=function(

    tag,

    className=""

){

    const element=

        document.createElement(tag);

    if(className){

        element.className=

            className;

    }

    return element;

};


/* ==========================================================
   REMOVE
========================================================== */

DOM.remove=function(element){

    if(

        element &&

        element.parentNode

    ){

        element.parentNode.removeChild(

            element

        );

    }

};


/* ==========================================================
   EMPTY
========================================================== */

DOM.empty=function(element){

    if(element){

        element.innerHTML="";

    }

};


/* ==========================================================
   APPEND
========================================================== */

DOM.append=function(

    parent,

    child

){

    if(parent && child){

        parent.appendChild(child);

    }

};


/* ==========================================================
   PREPEND
========================================================== */

DOM.prepend=function(

    parent,

    child

){

    if(parent && child){

        parent.prepend(child);

    }

};

/* ==========================================================
   INSERT BEFORE
========================================================== */

DOM.before=function(

    reference,

    element

){

    if(

        reference &&

        element

    ){

        reference.parentNode.insertBefore(

            element,

            reference

        );

    }

};


/* ==========================================================
   INSERT AFTER
========================================================== */

DOM.after=function(

    reference,

    element

){

    if(

        reference &&

        element

    ){

        reference.parentNode.insertBefore(

            element,

            reference.nextSibling

        );

    }

};


/* ==========================================================
   HTML
========================================================== */

DOM.html=function(

    element,

    html

){

    if(!element){

        return;

    }

    element.innerHTML=html;

};


/* ==========================================================
   TEXT
========================================================== */

DOM.text=function(

    element,

    text

){

    if(!element){

        return;

    }

    element.textContent=text;

};


/* ==========================================================
   ATTRIBUTE
========================================================== */

DOM.attr=function(

    element,

    name,

    value

){

    if(!element){

        return;

    }

    if(value===undefined){

        return element.getAttribute(

            name

        );

    }

    element.setAttribute(

        name,

        value

    );

};


/* ==========================================================
   REMOVE ATTRIBUTE
========================================================== */

DOM.removeAttr=function(

    element,

    name

){

    if(element){

        element.removeAttribute(

            name

        );

    }

};


/* ==========================================================
   DATA ATTRIBUTE
========================================================== */

DOM.data=function(

    element,

    key,

    value

){

    if(!element){

        return;

    }

    if(value===undefined){

        return element.dataset[key];

    }

    element.dataset[key]=value;

};
/* ==========================================================
   CLASS ADD
========================================================== */

DOM.addClass=function(

    element,

    ...classes

){

    if(element){

        element.classList.add(

            ...classes

        );

    }

};


/* ==========================================================
   CLASS REMOVE
========================================================== */

DOM.removeClass=function(

    element,

    ...classes

){

    if(element){

        element.classList.remove(

            ...classes

        );

    }

};


/* ==========================================================
   CLASS TOGGLE
========================================================== */

DOM.toggleClass=function(

    element,

    className,

    force

){

    if(!element){

        return;

    }

    return element.classList.toggle(

        className,

        force

    );

};


/* ==========================================================
   CLASS CONTAINS
========================================================== */

DOM.hasClass=function(

    element,

    className

){

    if(!element){

        return false;

    }

    return element.classList.contains(

        className

    );

};


/* ==========================================================
   SHOW
========================================================== */

DOM.show=function(element){

    if(element){

        element.style.display="";

    }

};


/* ==========================================================
   HIDE
========================================================== */

DOM.hide=function(element){

    if(element){

        element.style.display="none";

    }

};


/* ==========================================================
   TOGGLE DISPLAY
========================================================== */

DOM.toggle=function(

    element,

    visible

){

    if(!element){

        return;

    }

    if(visible){

        DOM.show(element);

    }else{

        DOM.hide(element);

    }

};


/* ==========================================================
   ENABLE
========================================================== */

DOM.enable=function(element){

    if(element){

        element.disabled=false;

    }

};


/* ==========================================================
   DISABLE
========================================================== */

DOM.disable=function(element){

    if(element){

        element.disabled=true;

    }

};

/* ==========================================================
   STYLE
========================================================== */

DOM.css=function(

    element,

    property,

    value

){

    if(!element){

        return;

    }

    if(

        typeof property==="object"

    ){

        Object.assign(

            element.style,

            property

        );

        return;

    }

    if(value===undefined){

        return getComputedStyle(

            element

        ).getPropertyValue(

            property

        );

    }

    element.style[property]=value;

};


/* ==========================================================
   WIDTH
========================================================== */

DOM.width=function(element){

    return element

        ? element.offsetWidth

        :0;

};


/* ==========================================================
   HEIGHT
========================================================== */

DOM.height=function(element){

    return element

        ? element.offsetHeight

        :0;

};


/* ==========================================================
   OFFSET
========================================================== */

DOM.offset=function(element){

    if(!element){

        return null;

    }

    const rect=

        element.getBoundingClientRect();

    return{

        top:

            rect.top+

            window.scrollY,

        left:

            rect.left+

            window.scrollX,

        width:

            rect.width,

        height:

            rect.height

    };

};


/* ==========================================================
   SCROLL TO
========================================================== */

DOM.scrollTo=function(

    element,

    behavior="smooth"

){

    if(element){

        element.scrollIntoView({

            behavior,

            block:"start"

        });

    }

};


/* ==========================================================
   FOCUS
========================================================== */

DOM.focus=function(element){

    if(element){

        element.focus();

    }

};


/* ==========================================================
   BLUR
========================================================== */

DOM.blur=function(element){

    if(element){

        element.blur();

    }

};


/* ==========================================================
   EXISTS
========================================================== */

DOM.exists=function(selector){

    return document.querySelector(

        selector

    )!==null;

};


/* ==========================================================
   IS VISIBLE
========================================================== */

DOM.isVisible=function(element){

    if(!element){

        return false;

    }

    return(

        element.offsetWidth>0 ||

        element.offsetHeight>0 ||

        element.getClientRects().length>0

    );

};

/* ==========================================================
   PARENT
========================================================== */

DOM.parent=function(element){

    return element

        ? element.parentElement

        : null;

};


/* ==========================================================
   CHILDREN
========================================================== */

DOM.children=function(element){

    return element

        ? [...element.children]

        : [];

};


/* ==========================================================
   FIRST
========================================================== */

DOM.first=function(element){

    return element

        ? element.firstElementChild

        : null;

};


/* ==========================================================
   LAST
========================================================== */

DOM.last=function(element){

    return element

        ? element.lastElementChild

        : null;

};


/* ==========================================================
   NEXT
========================================================== */

DOM.next=function(element){

    return element

        ? element.nextElementSibling

        : null;

};


/* ==========================================================
   PREVIOUS
========================================================== */

DOM.previous=function(element){

    return element

        ? element.previousElementSibling

        : null;

};


/* ==========================================================
   MATCHES
========================================================== */

DOM.matches=function(

    element,

    selector

){

    if(!element){

        return false;

    }

    return element.matches(

        selector

    );

};


/* ==========================================================
   CLOSEST
========================================================== */

DOM.closest=function(

    element,

    selector

){

    if(!element){

        return null;

    }

    return element.closest(

        selector

    );

};


/* ==========================================================
   CLONE
========================================================== */

DOM.clone=function(

    element,

    deep=true

){

    return element

        ? element.cloneNode(deep)

        : null;

};


/* ==========================================================
   REPLACE
========================================================== */

DOM.replace=function(

    oldElement,

    newElement

){

    if(

        oldElement &&

        newElement

    ){

        oldElement.replaceWith(

            newElement

        );

    }

};


/* ==========================================================
   EXPORT
========================================================== */

window.DOM=DOM;


/* ==========================================================
   END OF FILE
========================================================== */