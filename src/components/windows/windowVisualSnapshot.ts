/** A short-lived, inert visual copy. React continues owning the original document/session. */
export function createWindowVisualSnapshot(node: HTMLElement, width: number, height: number) {
  const copy = node.cloneNode(true) as HTMLElement;
  const originals = [node, ...node.querySelectorAll<HTMLElement>('*')];
  const copies = [copy, ...copy.querySelectorAll<HTMLElement>('*')];
  const scroll = originals.map(element => ({ top: element.scrollTop, left: element.scrollLeft }));
  copies.forEach((element, index) => {
    element.removeAttribute('id');
    for (const name of element.getAttributeNames()) if (name.startsWith('data-window-') || name === 'data-resume-page' || name === 'data-ready') element.removeAttribute(name);
    if (element instanceof HTMLCanvasElement && originals[index] instanceof HTMLCanvasElement) {
      // cloneNode does not copy the PDF canvas bitmap.
      const original = originals[index] as HTMLCanvasElement;
      if (original.width && original.height) element.getContext('2d')?.drawImage(original, 0, 0);
    }
  });
  copy.dataset.windowVisualSnapshot = 'true';
  copy.removeAttribute('role'); copy.removeAttribute('aria-modal');
  copy.setAttribute('aria-hidden', 'true'); copy.inert = true;
  Object.assign(copy.style, { position: 'absolute', inset: '0', margin: '0', width: `${width}px`, height: `${height}px`, maxWidth: 'none', maxHeight: 'none', minWidth: '0', minHeight: '0', transform: 'none', translate: 'none', scale: 'none', opacity: '1', visibility: 'visible', pointerEvents: 'none', transition: 'none', animation: 'none', willChange: 'auto' });
  return { element: copy, restoreScroll: () => copies.forEach((element, index) => { element.scrollTop = scroll[index].top; element.scrollLeft = scroll[index].left; }) };
}
