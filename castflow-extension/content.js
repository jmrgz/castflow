/**
 * CastFlow Extension — Content Script
 * Minimal state tracker. Listens for tour-ended events from the page world
 * and relays them to the background service worker for badge updates.
 * All injection is handled by background.js via chrome.scripting API.
 */

(() => {
  'use strict';

  // CastFlow's onComplete dispatches this event in the MAIN world.
  // Content scripts share the same DOM event target, so we can listen for it here.
  window.addEventListener('__castflow_ended', () => {
    chrome.runtime.sendMessage({ type: 'tourState', playing: false });
  });

  // Relay picked selector from MAIN world (via postMessage) to background
  window.addEventListener('message', (e) => {
    if (e.source !== window || !e.data?.__castflow_picked) return;
    chrome.runtime.sendMessage({ type: 'selectorPicked', selector: e.data.selector || '' });
  });
})();

