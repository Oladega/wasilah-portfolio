'use client';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Image from 'next/image';
import type { PDFDocumentLoadingTask } from 'pdfjs-dist';
import { siteConfig } from '@/data/site';
import { PdfPage, type ResumePage, type PdfLibrary } from './PdfPage';
import chrome from '@/components/shared/Windows.module.css';
import styles from './ResumeViewer.module.css';
const DEFAULT_ZOOM=115, MIN_ZOOM=50, MAX_ZOOM=200, STEP=5;
type Anchor={number:number;x:number;y:number};
export function ResumePdfViewer({compact=false}:{compact?:boolean}) {
  const scroller=useRef<HTMLDivElement>(null);
  const anchor=useRef<Anchor|null>(null);
  const [document,setDocument]=useState<{pages:ResumePage[];library:PdfLibrary}|null>(null);
  const [error,setError]=useState(false);
  const [attempt,setAttempt]=useState(0);
  const [zoom,setZoom]=useState(DEFAULT_ZOOM);
  const [viewportWidth,setViewportWidth]=useState(0);
  const [currentPage,setCurrentPage]=useState(1);
  const pageNumber=useRef(1);
  const baseWidth=Math.min(720,Math.max(1,viewportWidth-32)/(DEFAULT_ZOOM/100));
  const pageWidth=baseWidth*zoom/100;
  const [renderWidth,setRenderWidth]=useState<number|null>(null);
  useEffect(()=>{
    let cancelled=false;
    let task:PDFDocumentLoadingTask|undefined;
    (async()=>{
      const library=await import('pdfjs-dist');
      if(cancelled)return;
      library.GlobalWorkerOptions.workerSrc=`/pdfjs/pdf.worker.min.mjs?v=${library.version}`;
      task=library.getDocument({url:siteConfig.resume.path,cMapUrl:'/pdfjs/cmaps/',cMapPacked:true,standardFontDataUrl:'/pdfjs/standard_fonts/',wasmUrl:'/pdfjs/wasm/',iccUrl:'/pdfjs/iccs/'});
      const pdf=await task.promise;
      const pages:ResumePage[]=[];
      for(let number=1;number<=pdf.numPages;number++){
        const page=await pdf.getPage(number);const viewport=page.getViewport({scale:1});
        pages.push({page,width:viewport.width,height:viewport.height});
      }
      if(!cancelled)setDocument({pages,library});
    })().catch(()=>{if(!cancelled)setError(true);});
    return()=>{cancelled=true;void task?.destroy().catch(()=>{});};
  },[attempt]);
  const captureAnchor=useCallback(()=>{
    const root=scroller.current;if(!root)return;
    const viewport=root.getBoundingClientRect();const centerX=viewport.left+root.clientWidth/2,centerY=viewport.top+root.clientHeight/2;
    const pages=[...root.querySelectorAll<HTMLElement>('[data-resume-page]')];
    const target=pages.reduce<HTMLElement|null>((best,page)=>{
      const r=page.getBoundingClientRect(), b=best?.getBoundingClientRect();
      return !b||Math.abs(r.top+r.height/2-centerY)<Math.abs(b.top+b.height/2-centerY)?page:best;
    },null);
    if(target){const r=target.getBoundingClientRect();anchor.current={number:Number(target.dataset.resumePage),x:(centerX-r.left)/r.width,y:(centerY-r.top)/r.height};}
  },[]);
  useEffect(()=>{
    const root=scroller.current;if(!root)return;
    const measure=()=>{if(root.clientWidth>0){captureAnchor();setViewportWidth(root.clientWidth);}};
    if(typeof ResizeObserver !== 'function') {
      const frame=requestAnimationFrame(measure);window.addEventListener('resize',measure);
      return()=>{cancelAnimationFrame(frame);window.removeEventListener('resize',measure);};
    }
    const observer=new ResizeObserver(measure);observer.observe(root);return()=>observer.disconnect();
  },[captureAnchor]);
  useEffect(()=>{
    if(viewportWidth<=0)return;
    const timer=setTimeout(()=>setRenderWidth(pageWidth),140);
    return()=>clearTimeout(timer);
  },[pageWidth,viewportWidth]);
  useLayoutEffect(()=>{
    const root=scroller.current, point=anchor.current;if(!root||!point)return;
    const page=root.querySelector<HTMLElement>(`[data-resume-page="${point.number}"]`);if(!page)return;
    const viewport=root.getBoundingClientRect(), rect=page.getBoundingClientRect();
    root.scrollLeft+=rect.left+point.x*rect.width-(viewport.left+root.clientWidth/2);
    root.scrollTop+=rect.top+point.y*rect.height-(viewport.top+root.clientHeight/2);
    anchor.current=null;
  },[pageWidth,viewportWidth]);
  function updateZoom(value:number){captureAnchor();setZoom(Math.max(MIN_ZOOM,Math.min(MAX_ZOOM,Math.round(value/STEP)*STEP)));}
  function updatePage(){
    const root=scroller.current;if(!root)return;
    const center=root.getBoundingClientRect().top+root.clientHeight/2;
    const pages=[...root.querySelectorAll<HTMLElement>('[data-resume-page]')];
    const closest=pages.reduce<HTMLElement|null>((best,page)=>{const r=page.getBoundingClientRect(),b=best?.getBoundingClientRect();return !b||Math.abs(r.top+r.height/2-center)<Math.abs(b.top+b.height/2-center)?page:best;},null);
    const number=Number(closest?.dataset.resumePage||1);
    if(number!==pageNumber.current){pageNumber.current=number;setCurrentPage(number);}
  }
  function goToPage(number:number){
    const root=scroller.current,page=root?.querySelector<HTMLElement>(`[data-resume-page="${number}"]`);
    if(root&&page)root.scrollTo({top:root.scrollTop+page.getBoundingClientRect().top-root.getBoundingClientRect().top-16,behavior:'instant'});
  }
  return <>
    <div className={styles.body}>
      {!compact&&<aside className={`${chrome.pdfRail} ${styles.rail}`} aria-label="Résumé pages">{siteConfig.resume.pages.map((src,index)=><button key={src} aria-label={`Go to page ${index+1}`} aria-current={currentPage===index+1?'page':undefined} data-current={currentPage===index+1} onClick={()=>goToPage(index+1)}><Image src={src} alt="" width={90} height={128}/><span>{index+1}</span></button>)}</aside>}
      <div ref={scroller} className={styles.scroller} tabIndex={0} role="region" aria-label="Résumé document" aria-busy={!document&&!error} onScroll={updatePage}>
        {error?<div className={styles.message} role="alert"><p>The résumé couldn’t be loaded. You can still download the original PDF.</p><button onClick={()=>{setError(false);setAttempt(value=>value+1);}}>Try again</button></div>:!document?<p className={styles.message} role="status">Loading résumé…</p>:viewportWidth>0&&<div className={styles.stack} style={{width:pageWidth}}>{document.pages.map((entry,index)=><PdfPage key={index} entry={entry} number={index+1} total={document.pages.length} width={pageWidth} renderWidth={renderWidth??pageWidth} scrollRoot={scroller} library={document.library}/>)}</div>}
      </div>
    </div>
    <footer className={styles.toolbar} role="group" aria-label="Document zoom controls">
      <span className={styles.pageCount} role="status" aria-live="off" aria-label={`Page ${currentPage} of ${document?.pages.length??2}`}>{currentPage} / {document?.pages.length??2}</span>
      <div className={styles.zoomControls}>
        <button type="button" aria-label="Zoom out" title="Zoom out" disabled={!document||zoom<=MIN_ZOOM} onClick={()=>updateZoom(zoom-STEP)}>−</button>
        <input type="range" min={MIN_ZOOM} max={MAX_ZOOM} step={STEP} value={zoom} aria-label="Document zoom" aria-valuetext={`${zoom}%`} disabled={!document} onChange={event=>updateZoom(Number(event.target.value))}/>
        <button type="button" aria-label="Zoom in" title="Zoom in" disabled={!document||zoom>=MAX_ZOOM} onClick={()=>updateZoom(zoom+STEP)}>+</button>
        <output aria-label="Current zoom percentage" aria-live="off">{zoom}%</output>
      </div>
      <a className={styles.mobileDownload} href={siteConfig.resume.path} download={siteConfig.resume.filename}>Download ↓</a>
    </footer>
  </>;
}
