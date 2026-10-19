'use client';
import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useReducer, useRef, useSyncExternalStore } from 'react';
import type { WindowId } from '@/data/site';
import { initialWindowState, windowReducer, type WindowState, isVisible } from './state';
import { windowRegistry } from './registry';
import { elementRectangle, visibleRectangle } from './windowTransitionUtils';
import { runWindowTransition, type TransitionPlan, type RunningTransition } from './WindowTransitionLayer';
import { desktopSnapshot, subscribeDesktop, serverDesktopSnapshot } from './desktopMode';
function useManagerValue(initialId?: WindowId) {
  const [state, dispatch] = useReducer(windowReducer, initialId, initialWindowState);
  const desktop = useSyncExternalStore(subscribeDesktop, desktopSnapshot, serverDesktopSnapshot);
  useLayoutEffect(() => { if (!desktop) dispatch({ type: 'compact' }); }, [desktop]);
  const latest = useRef(state);
  useLayoutEffect(() => { latest.current = state; }, [state]);
  const sources = useRef(new Map<WindowId, HTMLElement>());
  const origins = useRef(new Map<WindowId, HTMLElement>());
  const nodes = useRef(new Map<WindowId, HTMLElement>());
  const plans = useRef(new Map<WindowId, TransitionPlan>());
  const running = useRef(new Map<WindowId, RunningTransition>());
  const sequence = useRef(0);
  const heldVisuals = useRef(new Map<WindowId, RunningTransition>());
  const iconElement = useCallback((id: WindowId) => {
    const element = sources.current.get(id);
    return element?.querySelector('img') ?? element;
  }, []);
  const perform = useCallback((kind: TransitionPlan['kind'], id: WindowId, launcher?: HTMLElement) => {
    const current = latest.current.windows[id];
    if (['maximize', 'unmaximize'].includes(kind) && !desktopSnapshot()) return;
    if (kind === 'open' && isVisible(current)) { if (latest.current.activeId !== id) dispatch({ type: 'focus', id }); return; }
    if (kind === 'close' && ['closed', 'closing'].includes(current.visibilityState)) return;
    if (['maximize', 'unmaximize'].includes(kind) && (!windowRegistry[id].canMaximize || !isVisible(current))) return;
    const prior = running.current.get(id);
    const interrupted = prior?.cancel(true);
    if (prior) { heldVisuals.current.get(id)?.dispose(); heldVisuals.current.set(id, prior); }
    running.current.delete(id);
    const instant = matchMedia('(prefers-reduced-motion: reduce)').matches || typeof Element.prototype.animate !== 'function';
    const node = nodes.current.get(id);
    const token = ++sequence.current;
    if (kind === 'open' && launcher) origins.current.set(id, launcher);
    const entrance = kind === 'open';
    const from = instant ? null : interrupted ?? (entrance ? visibleRectangle(launcher?.querySelector('img') ?? launcher ?? iconElement(id)) : elementRectangle(node));
    const actualKind = kind === 'maximize' && current.sizeMode === 'maximized' ? 'unmaximize' : kind;
    plans.current.set(id, { token, kind: actualKind, from, instant });
    if (node && (interrupted || kind !== 'close')) node.style.opacity = '0';
    dispatch({ type: kind, id, token, exclusive: !desktopSnapshot() });
  }, [iconElement]);
  const openWindow = useCallback((id: WindowId, launcher?: HTMLElement) => perform('open', id, launcher), [perform]);
  const closeWindow = useCallback((id: WindowId) => perform('close', id), [perform]);
  const maximizeWindow = useCallback((id: WindowId) => perform('maximize', id), [perform]);
  const unmaximizeWindow = useCallback((id: WindowId) => perform('unmaximize', id), [perform]);
  const focusWindow = useCallback((id: WindowId) => {
    if (latest.current.activeId === id && latest.current.order.at(-1) === id) return;
    dispatch({ type: 'focus', id });
  }, []);
  const setPosition = useCallback((id: WindowId, position: WindowState['position']) => dispatch({ type: 'position', id, position }), []);
  const registerIcon = useCallback((id: WindowId, element: HTMLElement | null) => {
    const key = id;
    if (element) sources.current.set(key, element); else sources.current.delete(key);
  }, []);
  const registerWindow = useCallback((id: WindowId, element: HTMLElement) => {
    nodes.current.set(id, element);
    return () => { heldVisuals.current.get(id)?.dispose(); heldVisuals.current.delete(id); running.current.get(id)?.cancel(); running.current.delete(id); if (nodes.current.get(id) === element) nodes.current.delete(id); };
  }, []);
  const startTransition = useCallback((id: WindowId, node: HTMLElement, token: number) => {
    const plan = plans.current.get(id);
    if (!plan || plan.token !== token) return;
    const origin = origins.current.get(id);
    const target = plan.instant ? null : plan.kind === 'close' ? visibleRectangle(origin?.isConnected ? origin.querySelector('img') ?? origin : iconElement(id)) : null;
    let cancelled = false;
    const complete = () => {
      if (plans.current.get(id)?.token !== token) return;
      heldVisuals.current.get(id)?.dispose(); heldVisuals.current.delete(id);
      running.current.delete(id); plans.current.delete(id);
      if (plan.kind === 'close') origins.current.delete(id);
      dispatch({ type: 'settle', id, token });
    };
    const start = () => {
      if (cancelled || plans.current.get(id)?.token !== token) return;
      const transition = runWindowTransition(node, plan, target, complete);
      heldVisuals.current.get(id)?.dispose(); heldVisuals.current.delete(id);
      if (plans.current.get(id)?.token === token) running.current.set(id, transition);
    };
    node.dataset.windowTransition = plan.kind;
    if (plan.kind !== 'close') node.style.opacity = '0';
    // Layout is ready before flight; reduced motion settles before paint.
    const immediate = plan.instant || matchMedia('(prefers-reduced-motion: reduce)').matches || typeof node.animate !== 'function';
    const frame = immediate ? 0 : requestAnimationFrame(start);
    if (immediate) start();
    return () => { cancelled = true; cancelAnimationFrame(frame); running.current.get(id)?.cancel(); running.current.delete(id); delete node.dataset.windowTransition; };

  }, [iconElement]);
  return useMemo(() => ({ ...state, openWindow, closeWindow, maximizeWindow, unmaximizeWindow, focusWindow, setPosition, registerIcon, registerWindow, startTransition,
    desktop,
    getZIndex: (id: WindowId) => 1 + state.order.indexOf(id),
  }), [state, desktop, openWindow, closeWindow, maximizeWindow, unmaximizeWindow, focusWindow, setPosition, registerIcon, registerWindow, startTransition]);
}
const ManagerContext = createContext<ReturnType<typeof useManagerValue> | null>(null);
const InstanceContext = createContext<WindowId | null>(null);
export function WindowManagerProvider({ children, initialId }: { children: React.ReactNode; initialId?: WindowId }) {
  return <ManagerContext.Provider value={useManagerValue(initialId)}>{children}</ManagerContext.Provider>;
}
export const WindowInstanceProvider = InstanceContext.Provider;
export function useWindowManager() {
  const value = useContext(ManagerContext);
  if (!value) throw new Error('WindowManagerProvider is required');
  return value;
}
export function useWindowInstance() {
  const id = useContext(InstanceContext);
  const manager = useWindowManager();
  return id ? { id, manager, state: manager.windows[id] } : null;
}
