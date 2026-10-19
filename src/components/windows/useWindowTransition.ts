'use client';
import { useLayoutEffect, type RefObject } from 'react';
import { useWindowInstance } from './WindowManager';
export function useWindowTransition(ref: RefObject<HTMLElement | null>) {
  const instance = useWindowInstance();
  const id = instance?.id;
  const register = instance?.manager.registerWindow;
  const start = instance?.manager.startTransition;
  const token = instance?.state.transitionId;
  useLayoutEffect(() => {
    if (id && ref.current && register) return register(id, ref.current);
  }, [id, ref, register]);
  useLayoutEffect(() => {
    if (id && ref.current && start && token !== undefined) return start(id, ref.current, token);
  }, [id, ref, start, token]);
}
