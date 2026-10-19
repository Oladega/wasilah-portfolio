import type { WindowId } from '@/data/site';
import { windowIds, windowRegistry } from './registry';
export type VisibilityState = 'closed' | 'opening' | 'open' | 'closing';
export type SizeMode = 'normal' | 'maximized';
export type WindowState = {
  visibilityState: VisibilityState; sizeMode: SizeMode;
  sizeTransition: 'maximizing' | 'unmaximizing' | null;
  position: { x: number; y: number }; transitionId: number;
};
export type ManagerState = { windows: Record<WindowId, WindowState>; order: WindowId[]; activeId: WindowId | null };
const closedWindow = (transitionId = 0): WindowState => ({ visibilityState: 'closed', sizeMode: 'normal', sizeTransition: null, position: { x: 0, y: 0 }, transitionId });
export function initialWindowState(): ManagerState {
  return { windows: Object.fromEntries(windowIds.map(id => [id, closedWindow()])) as ManagerState['windows'], order: [], activeId: null };
}
export type Command = 'open' | 'close' | 'maximize' | 'unmaximize' | 'focus';
export type Action = { type: Command; id: WindowId; token?: number; exclusive?: boolean } | { type: 'settle'; id: WindowId; token: number } | { type: 'position'; id: WindowId; position: WindowState['position'] } | { type: 'compact' };
export const isVisible = (window: WindowState) => ['opening', 'open'].includes(window.visibilityState);
export const isPresented = (window: WindowState) => window.visibilityState !== 'closed';
export function windowReducer(state: ManagerState, action: Action): ManagerState {
  if (action.type === 'compact') {
    const windows = { ...state.windows };
    for (const id of windowIds) if (id !== state.activeId) windows[id] = closedWindow(windows[id].transitionId);
    return { ...state, windows, order: state.activeId ? [state.activeId] : [] };
  }
  const { id } = action;
  const current = state.windows[id];
  if (action.type === 'settle') {
    if (action.token !== current.transitionId || current.visibilityState === 'closed') return state;
    if (current.visibilityState === 'closing') {
      const windows = { ...state.windows, [id]: closedWindow(current.transitionId) };
      const order = state.order.filter(other => other !== id);
      return { windows, order, activeId: state.activeId === id ? [...order].reverse().find(other => isVisible(windows[other])) ?? null : state.activeId };
    }
    return { ...state, windows: { ...state.windows, [id]: { ...current, visibilityState: 'open', sizeTransition: null } } };
  }
  if (action.type === 'position') return { ...state, windows: { ...state.windows, [id]: { ...current, position: action.position } } };
  if (action.type === 'focus') {
    if (!isVisible(current) || (state.activeId === id && state.order.at(-1) === id)) return state;
    return { ...state, order: [...state.order.filter(other => other !== id), id], activeId: id };
  }
  if (action.type === 'open' && isVisible(current)) return windowReducer(state, { type: 'focus', id });
  if (action.type === 'close' && ['closed', 'closing'].includes(current.visibilityState)) return state;
  if (['maximize', 'unmaximize'].includes(action.type) && (!windowRegistry[id].canMaximize || !isVisible(current))) return state;
  const next = { ...current, transitionId: action.token ?? current.transitionId + 1 };
  const windows = { ...state.windows };
  let order = [...state.order], activeId = state.activeId;
  if (action.type === 'close') { next.visibilityState = 'closing'; next.sizeTransition = null; }
  else {
    if (action.exclusive) for (const other of windowIds) if (other !== id) windows[other] = closedWindow(windows[other].transitionId);
    order = [...order.filter(other => other !== id && windows[other].visibilityState !== 'closed'), id]; activeId = id;
    if (action.type === 'open') { next.visibilityState = 'opening'; next.sizeTransition = null; }
    else {
      next.sizeMode = action.type === 'unmaximize' || current.sizeMode === 'maximized' ? 'normal' : 'maximized';
      next.sizeTransition = next.sizeMode === 'maximized' ? 'maximizing' : 'unmaximizing'; next.visibilityState = 'open';
    }
  }
  windows[id] = next;
  return { windows, order, activeId };
}
