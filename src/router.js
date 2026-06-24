// ── SPA Router ────────────────────────────────────────────────────────────────
// Simple client-side router using hash-based navigation

const routes = {};
let currentRoute = null;
let currentCleanup = null;

export function registerRoute(name, handler) {
  routes[name] = handler;
}

export function navigate(page, params = {}) {
  // Run cleanup for previous page (unsubscribe WS listeners, etc.)
  if (currentCleanup) {
    currentCleanup();
    currentCleanup = null;
  }

  currentRoute = { page, params };

  // Dispatch custom event so app.js can handle layout rebuild
  window.dispatchEvent(new CustomEvent('sn:navigate', { detail: { page, params } }));
}

export function getCurrentRoute() {
  return currentRoute;
}

export function setCleanup(fn) {
  currentCleanup = fn;
}
