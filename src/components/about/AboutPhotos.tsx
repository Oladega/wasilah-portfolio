'use client';

import {useCallback, useEffect, useRef, useState} from 'react';
import {ResponsiveImage as Image} from '@/components/shared/ResponsiveImage';
import {siteConfig} from '@/data/site';
import styles from './AboutPhotos.module.css';

const photos = [
  {src: siteConfig.about.candid, alt: 'Wasilah at a costume event', width: 1536, height: 2048},
  {src: siteConfig.about.studioPortrait, alt: 'Studio portrait of Wasilat Atilade wearing a navy dress', width: 2000, height: 2500},
];
// End copies let both directions loop before snapping invisibly to the real slide.
const slides = [photos[photos.length - 1], ...photos, photos[0]];

export function AboutPhotos() {
  const viewport = useRef<HTMLDivElement>(null);
  const pointer = useRef<{x: number; y: number} | null>(null);
  const locked = useRef(false);
  const [position, setPosition] = useState(1);
  const [moving, setMoving] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [paused, setPaused] = useState(false);
  const [focused, setFocused] = useState(false);
  const [touching, setTouching] = useState(false);
  const [reset, setReset] = useState(0);
  const [loaded, setLoaded] = useState<string[]>([]);
  const active = (position - 1 + photos.length) % photos.length;

  const settle = useCallback(() => {
    setPosition(value => value === 0 ? photos.length : value === photos.length + 1 ? 1 : value);
    setMoving(false);
    locked.current = false;
  }, []);

  useEffect(() => {
    const size = matchMedia('(max-width: 809.98px)');
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {setMobile(size.matches); setReduced(motion.matches); settle();};
    const visibility = () => setPageVisible(document.visibilityState === 'visible');
    update(); visibility();
    size.addEventListener('change', update);
    motion.addEventListener('change', update);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      size.removeEventListener('change', update);
      motion.removeEventListener('change', update);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [settle]);

  useEffect(() => {
    if (!viewport.current) return;
    if (typeof IntersectionObserver !== 'function') {
      // Without visibility observation, keep manual navigation and avoid hidden autoplay.
      return;
    }
    const observer = new IntersectionObserver(entries => setVisible(entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= .3)), {threshold: [0, .3]});
    observer.observe(viewport.current);
    return () => observer.disconnect();
  }, []);

  const move = useCallback((direction: number) => {
    if (locked.current) return;
    if (reduced) {
      setPosition(value => ((value - 1 + direction + photos.length) % photos.length) + 1);
      return;
    }
    locked.current = true;
    setMoving(true);
    setPosition(value => value + direction);
  }, [reduced]);

  useEffect(() => {
    if (!mobile || reduced || !visible || !pageVisible || paused || focused || touching || loaded.length < photos.length) return;
    const timer = setInterval(() => move(1), 2000);
    return () => clearInterval(timer);
  }, [mobile, reduced, visible, pageVisible, paused, focused, touching, loaded.length, reset, move]);

  useEffect(() => {
    if (!moving) return;
    // Recover if the browser suppresses transitionend (e.g. a window is closed).
    const timeout = setTimeout(settle, 550);
    return () => clearTimeout(timeout);
  }, [moving, settle]);

  const navigate = (direction: number) => {move(direction); setReset(value => value + 1);};

  return <>
    <div className={styles.photos}>
      {photos.map((photo, index) => <div key={photo.src} className={`${styles.photo} ${index === 1 ? styles.studio : ''}`}>
        <Image {...photo} alt={photo.alt} sizes="280px" loading="eager" fetchPriority={index === 0 ? 'high' : 'auto'} />
      </div>)}
    </div>
    <section className={styles.carousel} role="region" aria-roledescription="carousel" aria-label="About Me photos"
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={event => {if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);}}>
      <div className={styles.stage}>
      <div ref={viewport} className={styles.viewport}
        onPointerDown={event => {if (!event.isPrimary) return; pointer.current = {x: event.clientX, y: event.clientY}; setTouching(true); event.currentTarget.setPointerCapture(event.pointerId);}}
        onPointerUp={event => {
          const start = pointer.current; pointer.current = null; setTouching(false);
          if (!start) return;
          const dx = event.clientX - start.x, dy = event.clientY - start.y;
          if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) navigate(dx < 0 ? 1 : -1);
        }}
        onPointerCancel={() => {pointer.current = null; setTouching(false);}}>
        <div className={`${styles.track} ${moving ? styles.moving : ''}`} style={{transform: `translate3d(${-position * 100}%, 0, 0)`}}
          onTransitionEnd={event => {if (event.target === event.currentTarget && event.propertyName === 'transform') settle();}}>
          {slides.map((photo, index) => <div className={styles.slide} key={`${photo.src}-${index}`} role="group" aria-roledescription="slide" aria-label={`${(index - 1 + photos.length) % photos.length + 1} of ${photos.length}`} aria-hidden={index !== position}>
            <Image {...photo} alt={photo.alt} sizes="(max-width:809px) 80vw, 280px" loading="eager" draggable={false}
              onLoad={() => setLoaded(value => value.includes(photo.src) ? value : [...value, photo.src])} />
          </div>)}
        </div>
      </div>
        <button type="button" className={`${styles.arrow} ${styles.previous}`} aria-label="Previous photo" onClick={() => navigate(-1)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6 9 12l6 6" /></svg>
        </button>
        <button type="button" className={`${styles.arrow} ${styles.next}`} aria-label="Next photo" onClick={() => navigate(1)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
        </button>
        <button type="button" className={styles.rotationToggle} aria-pressed={paused} disabled={reduced} onClick={() => setPaused(value => !value)}>{paused || reduced ? 'Play slideshow' : 'Pause slideshow'}</button>
      </div>
      <span className={styles.visuallyHidden} aria-live={paused || reduced ? 'polite' : 'off'}>{active + 1} / {photos.length}</span>
    </section>
  </>;
}
