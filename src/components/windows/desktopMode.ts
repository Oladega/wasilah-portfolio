export const desktopQuery = '(min-width: 810px)';
export function desktopSnapshot() { return typeof matchMedia !== 'undefined' && matchMedia(desktopQuery).matches; }
export function subscribeDesktop(callback: () => void) {
  const query = matchMedia(desktopQuery);
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
}
export function serverDesktopSnapshot() { return false; }
