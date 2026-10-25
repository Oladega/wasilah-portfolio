'use client';

import type {ReactNode} from 'react';
import {useSessionProjectOrder} from './useSessionProjectOrder';
import styles from './SessionProjectList.module.css';

export function SessionProjectList({items}: {items: {slug: string; content: ReactNode}[]}) {
  const order = useSessionProjectOrder();
  const bySlug = new Map(items.map(item => [item.slug, item.content]));
  return <div className={styles.list} data-project-list>{order.map(slug => bySlug.get(slug))}</div>;
}
