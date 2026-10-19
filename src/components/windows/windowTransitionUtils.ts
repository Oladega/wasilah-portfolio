export type Rectangle = { x: number; y: number; width: number; height: number };
export const windowAnimationConfig = { open: .4, close: .34, maximize: .27, unmaximize: .27 };
export function elementRectangle(element?: Element | null): Rectangle | null {
  if (!element?.isConnected || !element.getClientRects().length) return null;
  const r = element.getBoundingClientRect();
  if (r.width <= 0 || r.height <= 0) return null;
  return { x: r.x, y: r.y, width: r.width, height: r.height };
}
export function visibleRectangle(element?: Element | null): Rectangle | null {
  const r = elementRectangle(element);
  if (!r || r.x + r.width <= 0 || r.y + r.height <= 0 || r.x >= innerWidth || r.y >= innerHeight || r.x + r.width / 2 < 0 || r.x + r.width / 2 > innerWidth || r.y + r.height / 2 < 0 || r.y + r.height / 2 > innerHeight) return null;
  const style = getComputedStyle(element!);
  return style.visibility === 'hidden' || style.display === 'none' ? null : r;
}
export function mapRectangle(from: Rectangle, base: Rectangle) {
  return `translate(${from.x - base.x}px, ${from.y - base.y}px) scale(${from.width / base.width}, ${from.height / base.height})`;
}
