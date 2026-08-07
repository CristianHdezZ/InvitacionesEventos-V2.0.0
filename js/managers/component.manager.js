/* ==========================================================
   INVITATION ENGINE V2
   FILE        : component.manager.js
   VERSION     : 2.1.0
   MODULE      : COMPONENT MANAGER
========================================================== */

"use strict";

/* ==========================================================
   COMPONENT MANAGER
========================================================== */

const ComponentManager = {

    components: new Map()

};

/* ==========================================================
   REGISTER
========================================================== */

ComponentManager.register = function (component) {

    if (!component || !component.name) {

        console.warn(

            "[ComponentManager] Invalid component."

        );

        return false;

    }

    this.components.set(

        component.name,

        {

            name: component.name,

            instance: component.instance || null,

            enabled: component.enabled !== false,

            initialized: false,

            version: component.version || AppConfig.version

        }

    );

    return true;

};

/* ==========================================================
   UNREGISTER
========================================================== */

ComponentManager.unregister = function (name) {

    return this.components.delete(name);

};

/* ==========================================================
   HAS
========================================================== */

ComponentManager.has = function (name) {

    return this.components.has(name);

};

/* ==========================================================
   GET
========================================================== */

ComponentManager.get = function (name) {

    const component = this.components.get(name);

    return component

        ? component.instance

        : null;

};

/* ==========================================================
   GET INFO
========================================================== */

ComponentManager.getInfo = function (name) {

    return this.components.get(name) || null;

};

/* ==========================================================
   GET ALL
========================================================== */

ComponentManager.getAll = function () {

    return Array.from(

        this.components.values()

    );

};

/* ==========================================================
   COUNT
========================================================== */

ComponentManager.count = function () {

    return this.components.size;

};

/* ==========================================================
   ENABLE
========================================================== */

ComponentManager.enable = function (name) {

    const component = this.components.get(name);

    if (!component) {

        return false;

    }

    component.enabled = true;

    return true;

};

/* ==========================================================
   DISABLE
========================================================== */

ComponentManager.disable = function (name) {

    const component = this.components.get(name);

    if (!component) {

        return false;

    }

    component.enabled = false;

    return true;

};

/* ==========================================================
   ENABLED COMPONENTS
========================================================== */

ComponentManager.getEnabled = function () {

    return this.getAll().filter(

        component => component.enabled

    );

};

/* ==========================================================
   DISABLED COMPONENTS
========================================================== */

ComponentManager.getDisabled = function () {

    return this.getAll().filter(

        component => !component.enabled

    );

};

/* ==========================================================
   INIT
========================================================== */

ComponentManager.init = function (name) {

    const component = this.components.get(name);

    if (

        !component ||

        !component.enabled ||

        !component.instance

    ) {

        return false;

    }

    if (

        typeof component.instance.init === "function"

    ) {

        component.instance.init();

        component.initialized = true;

        return true;

    }

    return false;

};

/* ==========================================================
   INIT ALL
========================================================== */

ComponentManager.initAll = function () {

    this.getEnabled().forEach(component => {

        this.init(component.name);

    });

};

/* ==========================================================
   REFRESH
========================================================== */

ComponentManager.refresh = function (name) {

    const component = this.components.get(name);

    if (

        !component ||

        !component.instance

    ) {

        return false;

    }

    if (

        typeof component.instance.refresh === "function"

    ) {

        component.instance.refresh();

        return true;

    }

    return false;

};

/* ==========================================================
   REFRESH ALL
========================================================== */

ComponentManager.refreshAll = function () {

    this.getEnabled().forEach(component => {

        this.refresh(component.name);

    });

};

/* ==========================================================
   PAUSE
========================================================== */

ComponentManager.pause = function (name) {

    const component = this.components.get(name);

    if (

        !component ||

        !component.instance

    ) {

        return false;

    }

    if (

        typeof component.instance.pause === "function"

    ) {

        component.instance.pause();

        return true;

    }

    return false;

};

/* ==========================================================
   PAUSE ALL
========================================================== */

ComponentManager.pauseAll = function () {

    this.getEnabled().forEach(component => {

        this.pause(component.name);

    });

};

/* ==========================================================
   RESUME
========================================================== */

ComponentManager.resume = function (name) {

    const component = this.components.get(name);

    if (

        !component ||

        !component.instance

    ) {

        return false;

    }

    if (

        typeof component.instance.resume === "function"

    ) {

        component.instance.resume();

        return true;

    }

    return false;

};

/* ==========================================================
   RESUME ALL
========================================================== */

ComponentManager.resumeAll = function () {

    this.getEnabled().forEach(component => {

        this.resume(component.name);

    });

};

/* ==========================================================
   DESTROY
========================================================== */

ComponentManager.destroy = function (name) {

    const component = this.components.get(name);

    if (

        !component ||

        !component.instance

    ) {

        return false;

    }

    if (

        typeof component.instance.destroy === "function"

    ) {

        component.instance.destroy();

        component.initialized = false;

        return true;

    }

    return false;

};

/* ==========================================================
   DESTROY ALL
========================================================== */

ComponentManager.destroyAll = function () {

    this.getEnabled().forEach(component => {

        this.destroy(component.name);

    });

};

/* ==========================================================
   CLEAR
========================================================== */

ComponentManager.clear = function () {

    this.destroyAll();

    this.components.clear();

};

/* ==========================================================
   EXPORT
========================================================== */

window.ComponentManager = ComponentManager;

/* ==========================================================
   END OF FILE
========================================================== */