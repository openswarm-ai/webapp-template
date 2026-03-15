import React from 'react';
import { createRoot } from 'react-dom/client';

/* 1️⃣  Constants ----------------------------------------------------------- */
const HOST_ID   = 'glass-menu-container';   // outer <div> that owns the shadow
const ROOT_ID   = 'glass-menu-root';        // inner <div> React will mount into
const Z_INDEX   = 2_147_483_647;            // stay on top of every site element

/* 2️⃣  Ensure the host exists *inside <body>* and has full‑viewport size ---- */
function ensureShadowHost() {
  let host = document.getElementById(HOST_ID);

  if (!host) {
    host = Object.assign(document.createElement('div'), { id: HOST_ID });
    host.style.cssText = `
      position: fixed;        /* overlay the whole viewport              */
      inset: 0;               /* shorthand for top/right/bottom/left: 0  */
      pointer-events: none;   /* let page below receive clicks           */
      z-index: ${Z_INDEX};    /* higher than any site content            */
    `;
    document.body.appendChild(host);        // <‑‑ key change from <html> ➜ <body>
  }

  return host.shadowRoot ?? host.attachShadow({ mode: 'open' });
}

/* 3️⃣  Boot after DOM is ready -------------------------------------------- */
async function boot() {
  const shadow = ensureShadowHost();
  window.__GLASS_SHADOW_ROOT = shadow;

  /* ↓ dynamic import *eagerly* inlines the code, so no extra chunk files */
  const { default: Main } = await import(
    /* webpackMode: "eager" */
    './GlassMenu/Main'
  );

  /* 4️⃣  Make an interactive root inside the shadow ----------------------- */
  const rootNode = Object.assign(document.createElement('div'), {
    id: ROOT_ID,
    style: 'pointer-events:auto;',          // menu itself should be clickable
  });
  shadow.appendChild(rootNode);

  createRoot(rootNode).render(<Main />);

  // Add message listener for UI visibility control
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'hide_extension_ui') {
      const host = document.getElementById(HOST_ID);
      if (host) host.style.visibility = 'hidden';
      sendResponse({ success: true });
    } else if (message.action === 'show_extension_ui') {
      const host = document.getElementById(HOST_ID);
      if (host) host.style.visibility = 'visible';
      sendResponse({ success: true });
    }
  });
}

/* 5️⃣  Run when the page is ready ----------------------------------------- */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
