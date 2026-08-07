/* ==========================================================
   INVITATION ENGINE V2
   FILE        : icons.js
   VERSION     : 2.1.0
   MODULE      : ICON LIBRARY
========================================================== */

"use strict";

/* ==========================================================
   SVG LIBRARY
========================================================== */

const ICON_SVG = {

  "mdi:church": `
    <path d="M24 5l7 6v7h4v25H13V18h4v-7l7-6zm0 5l-3 3v5h6v-5l-3-3z"
          fill="currentColor"/>
    <rect x="22" y="29"
          width="4"
          height="14"
          rx="1.5"
          fill="#fff"
          opacity=".28"/>
  `,

  "mdi:glass-cocktail": `
    <path d="M12 10h24l-9 11v10l4 5H17l4-5V21l-9-11z"
          fill="currentColor"/>
    <circle cx="31"
            cy="13"
            r="2"
            fill="#fff"
            opacity=".45"/>
  `,

  "mdi:food": `
    <path d="M16 6v14m4-14v14m4-14v14M30 6v36"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"/>
    <path d="M14 24h18"
          stroke="currentColor"
          stroke-width="3"/>
  `,

  "mdi:music": `
    <path d="M31 8v19.5A4.5 4.5 0 1 1 28 23V12l-10 2v17.5A4.5 4.5 0 1 1 15 27V11l16-3z"
          fill="currentColor"/>
  `,

  "mdi:camera": `
    <path d="M12 15h6l2-3h8l2 3h6v20H12z"
          fill="currentColor"/>
    <circle cx="24"
            cy="25"
            r="6"
            fill="#fff"
            opacity=".25"/>
  `,

  "mdi:gift": `
    <path d="M12 18h24v22H12z"
          fill="currentColor"/>
    <path d="M10 14h28v6H10z"
          fill="currentColor"/>
    <path d="M24 14v26"
          stroke="#fff"
          stroke-width="2"
          opacity=".45"/>
    <path d="M20 12c0-2 1.6-4 4-4 2.6 0 4 2 4 4m-8 0c0-2-1.6-4-4-4-2.6 0-4 2-4 4"
          stroke="currentColor"
          stroke-width="2"
          fill="none"/>
  `,

  "mdi:map-marker": `
    <path d="M24 6c6.4 0 11 4.8 11 11 0 8.6-11 23-11 23S13 25.6 13 17c0-6.2 4.6-11 11-11z"
          fill="currentColor"/>
    <circle cx="24"
            cy="17"
            r="4"
            fill="#fff"
            opacity=".45"/>
  `,

  "mdi:calendar": `
    <rect x="10"
          y="12"
          width="28"
          height="24"
          rx="3"
          fill="currentColor"/>
    <path d="M10 18h28"
          stroke="#fff"
          stroke-width="2"
          opacity=".35"/>
    <path d="M18 8v8M30 8v8"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"/>
  `,  "mdi:ring": `
    <circle cx="24"
            cy="26"
            r="8"
            stroke="currentColor"
            stroke-width="3"
            fill="none"/>
    <path d="M20 16l4-8 4 8"
          fill="currentColor"/>
  `,

  "mdi:flower": `
    <circle cx="24"
            cy="14"
            r="5"
            fill="currentColor"/>

    <circle cx="34"
            cy="24"
            r="5"
            fill="currentColor"/>

    <circle cx="24"
            cy="34"
            r="5"
            fill="currentColor"/>

    <circle cx="14"
            cy="24"
            r="5"
            fill="currentColor"/>

    <circle cx="24"
            cy="24"
            r="4"
            fill="#fff"
            opacity=".35"/>
  `,

  "mdi:butterfly": `
    <path d="M24 23
             C18 12 9 11 8 20
             C7 29 15 32 24 24"
          fill="currentColor"/>

    <path d="M24 23
             C30 12 39 11 40 20
             C41 29 33 32 24 24"
          fill="currentColor"/>

    <path d="M24 16v16"
          stroke="#fff"
          stroke-width="2"
          opacity=".35"/>
  `,

  "mdi:star-four-points": `
    <path d="M24 6
             L28 20
             L42 24
             L28 28
             L24 42
             L20 28
             L6 24
             L20 20Z"
          fill="currentColor"/>
  `,

  "mdi:diamond-stone": `
    <path d="M14 16
             L20 8
             H28
             L34 16
             L24 40Z"
          fill="currentColor"/>

    <path d="M14 16H34"
          stroke="#fff"
          stroke-width="2"
          opacity=".35"/>
  `,

  "mdi:music-note": `
    <path d="M30 8
             V28
             a4 4 0 1 1-2-3.46
             V14
             l-10 2
             v14
             a4 4 0 1 1-2-3.46
             V12
             Z"
          fill="currentColor"/>
  `,

  "mdi:cake-variant": `
    <rect x="12"
          y="20"
          width="24"
          height="16"
          rx="2"
          fill="currentColor"/>

    <rect x="14"
          y="14"
          width="20"
          height="6"
          rx="2"
          fill="currentColor"
          opacity=".9"/>

    <path d="M18 14v-4
             M24 14v-6
             M30 14v-4"
          stroke="#fff"
          stroke-width="2"
          stroke-linecap="round"
          opacity=".4"/>
  `,

  "mdi:crown": `
    <path d="M10 34
             L14 14
             L24 24
             L34 14
             L38 34Z"
          fill="currentColor"/>

    <rect x="10"
          y="34"
          width="28"
          height="4"
          rx="2"
          fill="currentColor"/>
  `,  "mdi:hat-fedora": `
    <path d="M16 10
             H32
             L34 30
             H14Z"
          fill="currentColor"/>

    <ellipse cx="24"
             cy="32"
             rx="18"
             ry="5"
             fill="currentColor"/>

    <path d="M15 28H33"
          stroke="#fff"
          stroke-width="2"
          opacity=".35"/>
  `,

  "mdi:shoe-heel": `
    <path d="M8 34
             V24
             C8 18 18 16 26 20
             L36 26
             L38 32
             V34Z"
          fill="currentColor"/>

    <path d="M36 34V40"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"/>
  `,

  "mdi:fan": `
    <path d="M24 40V20"
          stroke="currentColor"
          stroke-width="2"/>

    <path d="M24 40
             A20 20 0 0 1 6 30
             L24 22Z"
          fill="currentColor"
          opacity=".75"/>

    <path d="M24 40
             A20 20 0 0 1 24 4
             L24 22Z"
          fill="currentColor"/>

    <path d="M24 40
             A20 20 0 0 0 42 30
             L24 22Z"
          fill="currentColor"
          opacity=".60"/>
  `,

  "mdi:email-outline": `
    <rect x="7"
          y="12"
          width="34"
          height="24"
          rx="2.5"
          stroke="currentColor"
          stroke-width="2.4"
          fill="none"/>

    <path d="M8 14
             L24 27
             L40 14"
          stroke="currentColor"
          stroke-width="2.4"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"/>
  `,

  "mdi:email-heart-outline": `
    <rect x="7"
          y="12"
          width="34"
          height="24"
          rx="2.5"
          stroke="currentColor"
          stroke-width="2.4"
          fill="none"/>

    <path d="M8 14
             L24 27
             L40 14"
          stroke="currentColor"
          stroke-width="2.4"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"/>

    <path d="M24 34
             C18 29 19.5 24 23 25.5
             C24 26 24 27 24 27
             C24 27 24 26 25 25.5
             C28.5 24 30 29 24 34Z"
          fill="currentColor"/>
  `,

  "mdi:champagne": `
    <path d="M18 6
             H30
             L28 24
             C28 30 20 30 20 24Z"
          fill="currentColor"/>

    <rect x="22.5"
          y="30"
          width="3"
          height="10"
          fill="currentColor"/>

    <rect x="17"
          y="40"
          width="14"
          height="3"
          rx="1.5"
          fill="currentColor"/>

    <circle cx="24"
            cy="14"
            r="1.4"
            fill="#fff"
            opacity=".45"/>
  `,
    "traje:gala": `
    <path d="
      M16 11
      C16 9 20 8 24 8
      C28 8 32 9 32 11
      L30 16
      C29 18 29 19 30 21
      C34 27 39 38 40 43
      C34 41 14 41 8 43
      C9 38 14 27 18 21
      C19 19 19 18 18 16
      Z"
      fill="currentColor"/>

    <path d="
      M16 11
      C19 13 29 13 32 11"
      stroke="var(--blush)"
      stroke-width="1.1"
      fill="none"/>
  `,

  "traje:sirena": `
    <path d="
      M18 9
      C18 8 21 7 24 7
      C27 7 30 8 30 9
      L29 16
      C28 20 28 24 26 28
      C25 31 27 36 30 43
      C27 42 21 42 18 43
      C21 36 23 31 22 28
      C20 24 20 20 19 16
      Z"
      fill="currentColor"/>

    <path d="
      M18 9
      C21 11 27 11 30 9"
      stroke="var(--blush)"
      stroke-width="1"
      fill="none"/>
  `,

  "traje:corte-a": `
    <path d="
      M24 5
      C22.5 5 21.6 6.3 22 7.8
      L23 14
      C21.5 15 21 17 22 19
      L14 42
      C18 44 30 44 34 42
      L26 19
      C27 17 26.5 15 25 14
      L26 7.8
      C26.4 6.3 25.5 5 24 5
      Z"
      fill="currentColor"/>

    <path d="
      M17 34
      C22 36 26 36 31 34"
      stroke="var(--blush)"
      stroke-width=".8"
      opacity=".7"/>
  `,

  "traje:lazo": `
    <path d="
      M17 10
      C17 8 20 7 24 7
      C28 7 31 8 31 10
      L29 20
      L30 22
      C33 26 35 30 36 34
      C30 33 18 33 12 34
      C13 30 15 26 18 22
      L19 20
      Z"
      fill="currentColor"/>

    <path d="
      M20 22
      L24 24
      L20 26
      Z"
      fill="var(--oro)"/>

    <path d="
      M28 22
      L24 24
      L28 26
      Z"
      fill="var(--oro)"/>

    <circle
      cx="24"
      cy="24"
      r="1.4"
      fill="var(--oro)"/>
  `,

  "traje:coctel": `
    <path d="
      M24 6
      C22.5 6 21.6 7.3 22 8.8
      L22.8 14
      C20.8 15 20.5 18 22 21
      L18 34
      C21 36 27 36 30 34
      L26 21
      C27.5 18 27.2 15 25.2 14
      L26 8.8
      C26.4 7.3 25.5 6 24 6
      Z"
      fill="currentColor"/>

    <path d="
      M20 30
      C23 31 25 31 28 30"
      stroke="var(--blush)"
      stroke-width=".8"
      opacity=".7"/>
  `,
    "traje:esmoquin": `
    <path d="
      M16 8
      L22 16
      L24 14
      L26 16
      L32 8
      L36 18
      L33 42
      H15
      L12 18
      Z"
      fill="currentColor"/>

    <path d="
      M22 16
      L24 22
      L26 16"
      stroke="var(--blush)"
      stroke-width="1.2"
      fill="none"/>

    <circle
      cx="24"
      cy="26"
      r="1"
      fill="var(--oro)"/>

    <circle
      cx="24"
      cy="31"
      r="1"
      fill="var(--oro)"/>

    <circle
      cx="24"
      cy="36"
      r="1"
      fill="var(--oro)"/>
  `,

  "traje:vestido-largo": `
    <path d="
      M24 6
      C21 6 19 8 19 11
      L20 18
      C20 21 18 27 14 42
      C18 44 30 44 34 42
      C30 27 28 21 28 18
      L29 11
      C29 8 27 6 24 6
      Z"
      fill="currentColor"/>

    <path d="
      M19 24
      C22 26 26 26 29 24"
      stroke="var(--blush)"
      stroke-width="1"
      opacity=".7"
      fill="none"/>
  `,

  "traje:vestido-corto": `
    <path d="
      M24 6
      C21.5 6 20 8 20 10
      L21 16
      C21 18 19 22 17 30
      C20 32 28 32 31 30
      C29 22 27 18 27 16
      L28 10
      C28 8 26.5 6 24 6
      Z"
      fill="currentColor"/>

    <path d="
      M19 22
      C22 23.5 26 23.5 29 22"
      stroke="var(--blush)"
      stroke-width=".9"
      fill="none"/>
  `,

  "traje:zapatos": `
    <path d="
      M12 30
      C14 28 18 27 22 28
      L24 34
      H10
      Z"
      fill="currentColor"/>

    <path d="
      M26 28
      C30 27 34 28 36 30
      L38 34
      H24
      Z"
      fill="currentColor"/>

    <path d="
      M10 34H24
      M24 34H38"
      stroke="var(--oro)"
      stroke-width="1"
      opacity=".6"/>
  `,

  "traje:corbata": `
    <path d="
      M24 8
      L28 14
      L24 20
      L20 14
      Z"
      fill="currentColor"/>

    <path d="
      M24 20
      L27 38
      L24 42
      L21 38
      Z"
      fill="currentColor"/>

    <circle
      cx="24"
      cy="14"
      r="1"
      fill="var(--oro)"/>
  `,
    "traje:camisa": `
    <path d="
      M16 8
      L21 14
      L24 12
      L27 14
      L32 8
      L35 18
      L33 42
      H15
      L13 18
      Z"
      fill="currentColor"/>

    <path d="
      M21 14
      L24 20
      L27 14"
      stroke="var(--blush)"
      stroke-width="1"
      fill="none"/>

    <path d="
      M24 20
      V42"
      stroke="var(--oro)"
      stroke-width=".8"
      opacity=".55"/>
  `,

  "traje:chaleco": `
    <path d="
      M18 8
      L24 16
      L30 8
      L33 18
      L30 42
      H18
      L15 18
      Z"
      fill="currentColor"/>

    <path d="
      M24 16
      V42"
      stroke="var(--blush)"
      stroke-width="1"
      opacity=".65"/>

    <circle cx="24" cy="24" r="1" fill="var(--oro)"/>
    <circle cx="24" cy="29" r="1" fill="var(--oro)"/>
    <circle cx="24" cy="34" r="1" fill="var(--oro)"/>
  `,

  "traje:pajarita": `
    <path d="
      M16 20
      L22 16
      L24 20
      L22 24
      Z"
      fill="currentColor"/>

    <path d="
      M32 20
      L26 16
      L24 20
      L26 24
      Z"
      fill="currentColor"/>

    <circle
      cx="24"
      cy="20"
      r="1.5"
      fill="var(--oro)"/>
  `,

  "traje:anillos": `
    <circle
      cx="19"
      cy="25"
      r="6"
      stroke="currentColor"
      stroke-width="2"
      fill="none"/>

    <circle
      cx="29"
      cy="25"
      r="6"
      stroke="currentColor"
      stroke-width="2"
      fill="none"/>
  `,

  "fi:rosa": `
    <path d="
      M24 10
      C18 10 15 15 18 20
      C19 22 22 23 24 26
      C26 23 29 22 30 20
      C33 15 30 10 24 10
      Z"
      fill="currentColor"/>

    <path d="
      M24 26
      V42"
      stroke="currentColor"
      stroke-width="2"/>

    <path d="
      M24 34
      L18 30
      M24 38
      L30 34"
      stroke="currentColor"
      stroke-width="2"/>
  `,

  "fi:vestido": `
    <path d="
      M24 8
      C21 8 20 10 20 12
      L21 18
      C20 22 18 30 14 42
      C18 44 30 44 34 42
      C30 30 28 22 27 18
      L28 12
      C28 10 27 8 24 8
      Z"
      fill="currentColor"/>

    <path d="
      M20 24
      C23 25 25 25 28 24"
      stroke="var(--blush)"
      stroke-width="1"
      opacity=".7"/>
  `,
};

/* ==========================================================
   RENDER
========================================================== */

function iconoSvg(id, extraClass = "") {

    const body = ICON_SVG[id];

    if (!body) {

        return "";

    }

    const className = extraClass
        ? ` class="${extraClass}"`
        : "";

    return `
<svg${className}
     viewBox="0 0 48 48"
     fill="none"
     preserveAspectRatio="xMidYMid meet"
     aria-hidden="true"
     focusable="false">
${body}
</svg>`;

}

/* ==========================================================
   HELPERS
========================================================== */

function hasIcon(id) {

    return Object.prototype.hasOwnProperty.call(

        ICON_SVG,

        id

    );

}

function getIcon(id) {

    return ICON_SVG[id] || null;

}

function getIconList() {

    return Object.keys(

        ICON_SVG

    );

}

function registerIcon(id, svg) {

    if (

        typeof id !== "string" ||

        !id ||

        typeof svg !== "string"

    ) {

        return false;

    }

    ICON_SVG[id] = svg;

    return true;

}

function removeIcon(id) {

    if (

        !hasIcon(id)

    ) {

        return false;

    }

    delete ICON_SVG[id];

    return true;

}

/* ==========================================================
   EXPORT
========================================================== */

window.ICON_SVG = ICON_SVG;

window.iconoSvg = iconoSvg;

window.hasIcon = hasIcon;

window.getIcon = getIcon;

window.getIconList = getIconList;

window.registerIcon = registerIcon;

window.removeIcon = removeIcon;

/* ==========================================================
   END OF FILE
========================================================== */