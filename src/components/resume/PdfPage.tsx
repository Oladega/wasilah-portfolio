'use client';
import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import type { PDFPageProxy } from 'pdfjs-dist';
import styles from './ResumeViewer.module.css';
export type PdfLibrary = typeof import('pdfjs-dist');
export type ResumePage = { page: PDFPageProxy; width: number; height: number };

function PageSurface({ page, library, width, renderWidth }: { page: PDFPageProxy; library: PdfLibrary; width: number; renderWidth: number }) {
  const host = useRef<HTMLDivElement>(null);
  const targetWidth = useRef(width);
  useLayoutEffect(() => { targetWidth.current = width; }, [width]);
  const [backingWidth, setBackingWidth] = useState(renderWidth);
  const [error, setError] = useState(false);
  useEffect(() => {
    const node = host.current;
    if (!node) return;
    node.setAttribute("aria-busy","true");
    let cancelled = false;
    const viewport = page.getViewport({scale:renderWidth / page.getViewport({scale:1}).width});
    // Cap backing buffers on large/high-DPI displays; the PDF itself remains vector.
    const dpr = Math.min(devicePixelRatio || 1, 2, Math.sqrt(8_000_000 / (viewport.width * viewport.height)));
    const raster = document.createElement('div');
    raster.className = styles.raster;
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden','true');
    canvas.width = Math.ceil(viewport.width*dpr); canvas.height = Math.ceil(viewport.height*dpr);
    raster.appendChild(canvas);
    const text = document.createElement('div');
    text.className = styles.textLayer; text.setAttribute('aria-hidden','true');
    text.style.setProperty('--total-scale-factor', String(viewport.scale));
    raster.appendChild(text);
    const task = page.render({canvas, viewport, transform:dpr===1?undefined:[dpr,0,0,dpr,0,0]});
    const textLayer = new library.TextLayer({container:text, viewport, textContentSource:page.streamTextContent()});
    Promise.all([task.promise,textLayer.render()]).then(() => {
      if (cancelled) return;
      for (const old of node.querySelectorAll('canvas')) { old.width=0; old.height=0; }
      // Swap the backing buffer and its preview geometry atomically, before paint.
      node.style.width = `${renderWidth}px`;
      node.style.transform = `scale(${targetWidth.current/renderWidth})`;
      node.replaceChildren(raster); node.dataset.ready='true'; node.dataset.renderWidth=String(renderWidth); node.setAttribute('aria-busy','false');
      setBackingWidth(renderWidth); setError(false);
    }).catch(reason => { if (!cancelled && reason?.name !== 'RenderingCancelledException' && reason?.name !== 'AbortException') setError(true); });
    return () => { cancelled=true; task.cancel(); textLayer.cancel(); };
  }, [page,library,renderWidth]);
  useEffect(() => {
    const node = host.current;
    return () => { node?.querySelectorAll('canvas').forEach(canvas=>{canvas.width=0;canvas.height=0;}); };
  }, []);
  return <>
    <div ref={host} className={styles.surface} style={{width:backingWidth, transform:`scale(${width/backingWidth})`}} />
    {error && <p className={styles.pageError}>This page couldn’t be displayed. Please download the résumé.</p>}
  </>;
}
export function PdfPage({ entry, number, total, width, renderWidth, scrollRoot, library }: { entry: ResumePage; number: number; total: number; width: number; renderWidth: number; scrollRoot: RefObject<HTMLDivElement | null>; library: PdfLibrary }) {
  const wrapper = useRef<HTMLElement>(null);
  const [nearby,setNearby] = useState(false);
  const [text,setText] = useState('');
  useEffect(() => {
    const node=wrapper.current;
    if (!node) return;
    if (typeof IntersectionObserver !== 'function') { const frame=requestAnimationFrame(()=>setNearby(true)); return()=>cancelAnimationFrame(frame); }
    const observer=new IntersectionObserver(entries=>setNearby(entries.some(entry=>entry.isIntersecting)), {root:scrollRoot.current,rootMargin:'300px 0px'});
    observer.observe(node);return()=>observer.disconnect();
  },[scrollRoot]);
  useEffect(()=>{
    let cancelled=false;
    entry.page.getTextContent().then(content=>{
      if(!cancelled)setText(content.items.map(item=>'str' in item?item.str:'').join(' '));
    }).catch(()=>{});
    return()=>{cancelled=true;};
  },[entry]);
  return <section ref={wrapper} className={styles.page} data-resume-page={number} aria-label={`Résumé page ${number} of ${total}`} style={{width,height:width*entry.height/entry.width}}>
    <p className={styles.srOnly}>{text}</p>
    {nearby && <PageSurface page={entry.page} library={library} width={width} renderWidth={renderWidth} />}
  </section>;
}
