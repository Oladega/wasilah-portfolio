import { animate } from 'motion/react';
import { elementRectangle, mapRectangle, windowAnimationConfig, type Rectangle } from './windowTransitionUtils';
import { createWindowVisualSnapshot } from './windowVisualSnapshot';
export type TransitionPlan = { token: number; kind: keyof typeof windowAnimationConfig; from: Rectangle | null; instant?: boolean };
export type RunningTransition = { cancel: (holdVisual?: boolean) => Rectangle | null; dispose: () => void };

export function runWindowTransition(node: HTMLElement, plan: TransitionPlan, target: Rectangle | null, complete: () => void): RunningTransition {
  const exiting = plan.kind === 'close';
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  // Skip snapshot creation and layout reads when spatial motion will not run.
  if (plan.instant || motionPreference.matches || typeof node.animate !== 'function') {
    node.style.opacity = exiting ? '0' : ''; delete node.dataset.windowTransition; complete();
    return { cancel: () => null, dispose: () => {} };
  }
  const base = elementRectangle(node);
  if (!base) { node.style.opacity = exiting ? '0' : ''; delete node.dataset.windowTransition; complete(); return { cancel: () => null, dispose: () => {} }; }
  const source = plan.from ?? base;
  const destination = exiting ? target : base;
  const fallback = !destination || (!exiting && !plan.from);
  const computed = getComputedStyle(node);
  const snapshot = createWindowVisualSnapshot(node, base.width, base.height);
  const shell = document.createElement('div');
  Object.assign(shell.style, { position: 'fixed', left: `${base.x}px`, top: `${base.y}px`, width: `${base.width}px`, height: `${base.height}px`, pointerEvents: 'none', zIndex: '150', transformOrigin: '0 0', background: computed.backgroundColor, backdropFilter: computed.backdropFilter, boxShadow: computed.boxShadow, borderRadius: computed.borderRadius, willChange: 'transform, opacity' });
  shell.dataset.windowAnimationShell = plan.kind;
  shell.dataset.transitionToken = String(plan.token);
  shell.dataset.windowAnimationFor = node.dataset.windowId ?? '';
  shell.setAttribute('aria-hidden', 'true'); shell.inert = true;
  const start = fallback ? 'translate(0px, 0px) scale(1, 1)' : mapRectangle(source, base);
  const end = exiting && destination ? mapRectangle(destination, base) : 'translate(0px, 0px) scale(1, 1)';
  shell.style.transform = start; shell.style.opacity = !exiting && fallback ? '0' : '1';
  // A backdrop filter nested beneath an opacity-animation root samples a different
  // backdrop. Keep the original glass on the outer owner, not inside the copy.
  Object.assign(snapshot.element.style, { background: 'transparent', backdropFilter: 'none', boxShadow: 'none' });
  shell.appendChild(snapshot.element);
  (node.closest('[data-window-layer]') ?? document.body).appendChild(shell); snapshot.restoreScroll();
  // Ownership transfers synchronously before paint; there is never a crossfade of two windows.
  node.style.opacity = '0'; node.dataset.windowTransition = plan.kind;
  let cancelled = false;
  const duration = fallback ? .16 : windowAnimationConfig[plan.kind];
  const cleanup = () => { shell.remove(); node.style.willChange = ''; delete node.dataset.windowTransition; window.removeEventListener('resize', finish); motionPreference.removeEventListener?.('change', finish); };
  const finish = () => {
    if (cancelled) return; cancelled = true;
    // Establish the real final owner BEFORE removing the visual copy. Exits stay hidden
    // until React settles/unmounts, including during effect cleanup and interruptions.
    node.style.opacity = exiting ? '0' : '1';
    geometry.cancel(); fade.cancel(); cleanup(); complete();
  };
  const geometry = animate(shell, { transform: [start, end] }, { duration, ease: [.22, .75, .2, 1], onComplete: finish });
  const fade = animate(shell, { opacity: exiting ? [1, 1, 0] : fallback ? [0, 1] : [1, 1] }, { duration, ...(exiting ? { times: [0, .75, 1] } : {}), ease: 'linear' });
  window.addEventListener('resize', finish); motionPreference.addEventListener?.('change', finish);
  return { dispose: () => shell.remove(), cancel: (holdVisual = false) => {
    if (cancelled) return null;
    const rectangle = elementRectangle(shell);
    const current = getComputedStyle(shell);
    const transform = current.transform, opacity = current.opacity;
    cancelled = true; node.style.opacity = '0'; geometry.cancel(); fade.cancel();
    if (holdVisual) { shell.style.transform = transform; shell.style.opacity = opacity; window.removeEventListener('resize', finish); motionPreference.removeEventListener?.('change', finish); delete node.dataset.windowTransition; } else cleanup();
    return rectangle;
  } };
}
