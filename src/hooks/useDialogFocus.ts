"use client";
import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";
const focusable = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]';
// Desktop applications share focus; only the active mobile dialog traps it.
export function useDialogFocus(ref: RefObject<HTMLElement | null>, onClose: () => void, enabled = true, modal = true) {
  const close = useRef(onClose);
  useLayoutEffect(() => { close.current = onClose; }, [onClose]);
  useEffect(() => {
    const node = ref.current;
    if (!node || !enabled) return;
    const previous = document.activeElement as HTMLElement | null;
    const backgrounds = modal ? [...document.querySelectorAll<HTMLElement>('[data-desktop-background]')] : [];
    const previousInert = backgrounds.map(element => element.inert);
    backgrounds.forEach(element => { element.inert = true; });
    function onFocus(event: FocusEvent) {
      if (modal && event.target instanceof Node && !node!.contains(event.target)) node!.focus({ preventScroll: true });
    }
    function onKey(event: KeyboardEvent) {
      if (event.defaultPrevented) return;
      if (event.key === 'Escape') { event.preventDefault(); close.current(); return; }
      if (event.key !== 'Tab' || !modal) return;
      const items = [...node!.querySelectorAll<HTMLElement>(focusable)].filter(item => item.getClientRects().length > 0);
      if (!items.length) { event.preventDefault(); node!.focus(); return; }
      if (event.shiftKey && (document.activeElement === items[0] || document.activeElement === node)) { event.preventDefault(); items.at(-1)!.focus(); }
      else if (!event.shiftKey && document.activeElement === items.at(-1)) { event.preventDefault(); items[0].focus(); }
    }
    document.addEventListener('keydown', onKey);
    if (modal) document.addEventListener('focusin', onFocus);
    node.focus({ preventScroll: true });
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('focusin', onFocus);
      backgrounds.forEach((element,index) => { element.inert = previousInert[index]; });
      // A normal focus switch must not steal focus back from another open app.
      if (node.isConnected && node.dataset.windowState !== 'closed') return;
      const foreground = document.querySelector<HTMLElement>('[data-window-active="true"]');
      const launcher = document.querySelector<HTMLElement>(`[data-window-launcher="${node.dataset.windowId}"]`);
      const target = foreground ?? (previous?.isConnected && previous !== document.body && !node.contains(previous) ? previous : launcher);
      target?.focus({ preventScroll: true });
    };
  }, [ref,enabled,modal]);
}
