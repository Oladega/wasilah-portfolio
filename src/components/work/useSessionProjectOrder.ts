'use client';

import {useSyncExternalStore} from 'react';
import {canonicalProjectSlugs, projectOrderStorageKey} from '@/lib/project-order';
import {nextProjectOrder} from '@/lib/shuffle-projects';

declare global {
  interface Window { __portfolioProjectOrder?: string[]; }
}
const changeEvent = 'portfolio-project-order-change';
const subscribe = (listener: () => void) => {
  window.addEventListener(changeEvent, listener);
  return () => window.removeEventListener(changeEvent, listener);
};
const serverSnapshot = () => canonicalProjectSlugs;
const clientSnapshot = () => window.__portfolioProjectOrder ?? canonicalProjectSlugs;

// Called only after Work has actually become closed, never from its content mount
// or unmount (project navigation and Strict Mode must not generate new orders).
export function prepareNextProjectOrder() {
  const order = nextProjectOrder(clientSnapshot());
  window.__portfolioProjectOrder = order;
  order.forEach((slug, index) => document.documentElement.style.setProperty(`--project-order-${slug}`, String(index)));
  try {sessionStorage.setItem(projectOrderStorageKey, JSON.stringify(order));} catch { /* Keep the prepared in-memory order if storage is unavailable. */ }
  window.dispatchEvent(new Event(changeEvent));
}

// The server snapshot prevents hydration mismatches. Pre-paint CSS already uses
// the prepared client order while React catches up on a direct page visit.
export function useSessionProjectOrder() {
  return useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
}
