"use client";
import { useEffect, type RefObject } from "react";
// Keep keyboard focus inside the open dialog and restore it on dismissal.
const dialogs: HTMLElement[] = [];
export function useDialogFocus(
  ref: RefObject<HTMLElement | null>,
  onClose: () => void,
) {
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const previous = document.activeElement as HTMLElement | null;
    dialogs.push(node);
    node.focus();
    function onKey(e: KeyboardEvent) {
      if (dialogs.at(-1) !== node) return;
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const items = Array.from(
        node!.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),[tabindex="0"]',
        ),
      ).filter((item) => item.getClientRects().length > 0);
      if (!items.length) return;
      const first = items[0],
        last = items[items.length - 1];
      if (
        e.shiftKey &&
        (document.activeElement === first || document.activeElement === node)
      ) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      const index = dialogs.indexOf(node);
      if (index >= 0) dialogs.splice(index, 1);
      (dialogs.at(-1) ?? previous)?.focus();
    };
  }, [ref, onClose]);
}
