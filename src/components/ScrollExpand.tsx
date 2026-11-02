import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useScroll } from 'framer-motion';
import { LinePath } from './ui/svg-follow-scroll';

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);

const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp((x - edge0) / (edge1 - edge0 || 1e-6), 0, 1);
  return t * t * (3 - 2 * t);
};

export interface ScrollExpandProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  mediaType?: 'image' | 'video';
  poster?: string;
  alt?: string;
  title?: string;
  scrollHint?: string;
  startWidth?: number;
  startHeight?: number;
  startRadius?: number;
  endRadius?: number;
  mediaZoom?: number;
  mediaXOffset?: number;
  scrollDistance?: number;
  holdDistance?: number;
  smoothing?: number;
  overlayScrim?: number;
  useWindowScroll?: boolean;
  enabled?: boolean;
  showFollowRope?: boolean;
  onProgressChange?: (progress: number) => void;
  children?: React.ReactNode;
  sidePanel?: React.ReactNode;
}

const ScrollExpand: React.FC<ScrollExpandProps> = ({
  src = '',
  mediaType = 'image',
  poster = '',
  alt = 'Rust & Raven Gothic Couture',
  title = 'Rust & Raven',
  scrollHint = '',
  startWidth = 42,
  startHeight = 58,
  startRadius = 24,
  endRadius = 0,
  mediaZoom = 1.35,
  mediaXOffset = 0,
  scrollDistance = 1.2,
  holdDistance = 0.35,
  smoothing = 0.1,
  overlayScrim = 0.45,
  useWindowScroll = false,
  enabled = true,
  showFollowRope = false,
  onProgressChange,
  children,
  sidePanel,
  className = '',
  style,
  ...rest
}) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const mediaRef = useRef<HTMLImageElement | HTMLVideoElement | null>(null);
  const titleRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const sidePanelRef = useRef<HTMLDivElement | null>(null);
  const scrimRef = useRef<HTMLDivElement | null>(null);
  const hintRef = useRef<HTMLDivElement | null>(null);
  const [imgError, setImgError] = useState(false);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start start', 'end end'],
  });

  const propsRef = useRef({
    startWidth,
    startHeight,
    startRadius,
    endRadius,
    mediaZoom,
    mediaXOffset,
    scrollDistance,
    holdDistance,
    smoothing,
    overlayScrim,
    useWindowScroll,
    enabled,
    hasSidePanel: Boolean(sidePanel),
    onProgressChange,
  });

  propsRef.current = {
    startWidth,
    startHeight,
    startRadius,
    endRadius,
    mediaZoom,
    mediaXOffset,
    scrollDistance,
    holdDistance,
    smoothing,
    overlayScrim,
    useWindowScroll,
    enabled,
    hasSidePanel: Boolean(sidePanel),
    onProgressChange,
  };

  const applyProgress = useCallback((p: number) => {
    const frame = frameRef.current;
    const media = mediaRef.current;
    if (!frame || !media) return;
    const c = propsRef.current;

    c.onProgressChange?.(p);

    const expandE = smoothstep(0, 0.42, p);

    const w = c.startWidth + (100 - c.startWidth) * expandE;
    const h = c.startHeight + (100 - c.startHeight) * expandE;
    const ix = Math.max(0, (100 - w) / 2);
    const iy = Math.max(0, (100 - h) / 2);
    const r = c.startRadius + (c.endRadius - c.startRadius) * expandE;
    if (c.startWidth < 100 || c.startHeight < 100 || c.startRadius > 0) {
      frame.style.clipPath = `inset(${iy}% ${ix}% ${iy}% ${ix}% round ${r}px)`;
    } else {
      frame.style.clipPath = 'none';
    }

    const xTrans = c.mediaXOffset ? ` translate3d(${c.mediaXOffset}%, 0, 0)` : '';
    media.style.transform = `scale(${c.mediaZoom * (1 + 0.04 * expandE)})${xTrans}`;

    if (scrimRef.current) scrimRef.current.style.opacity = `${c.overlayScrim}`;

    if (titleRef.current) {
      const out = smoothstep(0.18, 0.48, p);
      titleRef.current.style.opacity = `${1 - out}`;
      titleRef.current.style.transform = `translate3d(0, ${-28 * out}px, 0) scale(${1 + 0.06 * out})`;
    }

    if (hintRef.current) {
      const gone = smoothstep(0, 0.15, p);
      hintRef.current.style.opacity = `${1 - gone}`;
      hintRef.current.style.transform = `translate3d(0, ${8 * gone}px, 0)`;
    }

    if (overlayRef.current) {
      if (c.hasSidePanel) {
        const out = smoothstep(0.1, 0.75, p);
        const op = Math.max(0, 1 - out);
        overlayRef.current.style.opacity = `${op}`;
        overlayRef.current.style.transform = `translate3d(${-40 * out}px, 0, 0)`;
        overlayRef.current.style.pointerEvents = op > 0.2 ? 'auto' : 'none';
      } else {
        overlayRef.current.style.opacity = '1';
        overlayRef.current.style.transform = 'translate3d(0, 0, 0)';
        overlayRef.current.style.pointerEvents = 'auto';
      }
    }

    if (sidePanelRef.current) {
      const slideIn = smoothstep(0.05, 0.85, p);
      sidePanelRef.current.style.transform = `translate3d(${(1 - slideIn) * 100}%, 0, 0)`;
      sidePanelRef.current.style.opacity = `${slideIn > 0.01 ? 1 : 0}`;
      sidePanelRef.current.style.pointerEvents = slideIn > 0.2 ? 'auto' : 'none';
    }
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!root || !track || !stage) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let raf = 0;
    let current = 0;
    let target = 0;
    let stageH = 0;
    let running = false;

    const measure = () => {
      const c = propsRef.current;
      stageH = c.useWindowScroll ? window.innerHeight : root.clientHeight;
      if (stageH <= 0) return;
      stage.style.height = `${stageH}px`;
      track.style.height = `${stageH * (1 + Math.max(0, c.scrollDistance) + Math.max(0, c.holdDistance))}px`;

      const w = root.clientWidth || stageH;
      stage.style.setProperty('--se-title-size', `${clamp(w * 0.075, 28, 88)}px`);
    };

    const readProgress = () => {
      const c = propsRef.current;
      if (!c.enabled) return 1;
      const span = stageH * Math.max(0.01, c.scrollDistance);
      if (c.useWindowScroll) {
        const top = track.getBoundingClientRect().top;
        return clamp(-top / span, 0, 1);
      }
      return clamp(root.scrollTop / span, 0, 1);
    };

    const tick = () => {
      const c = propsRef.current;
      const k = c.smoothing <= 0 ? 1 : 1 - Math.exp(-1 / (60 * c.smoothing));
      current += (target - current) * k;
      if (Math.abs(target - current) < 0.0004) {
        current = target;
        running = false;
      }
      applyProgress(current);
      raf = running ? requestAnimationFrame(tick) : 0;
    };

    const kick = () => {
      if (running) return;
      running = true;
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      target = readProgress();
      if (propsRef.current.smoothing <= 0 || reduceMotion) {
        current = target;
        applyProgress(current);
        return;
      }
      kick();
    };

    const onResize = () => {
      measure();
      target = readProgress();
      current = target;
      applyProgress(current);
    };

    measure();
    target = readProgress();
    current = target;
    applyProgress(current);

    const scroller = useWindowScroll ? window : root;
    scroller.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    const ro = new ResizeObserver(onResize);
    ro.observe(root);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      scroller.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      ro.disconnect();
    };
  }, [applyProgress, useWindowScroll]);

  const media =
    mediaType === 'video' ? (
      <video
        ref={mediaRef as React.RefObject<HTMLVideoElement>}
        className="scroll-expand__media"
        src={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
      />
    ) : !imgError && src ? (
      <img
        ref={mediaRef as React.RefObject<HTMLImageElement>}
        className="scroll-expand__media"
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        draggable={false}
        onError={() => setImgError(true)}
      />
    ) : (
      <img
        ref={mediaRef as React.RefObject<HTMLImageElement>}
        className="scroll-expand__media opacity-0 pointer-events-none"
        src="data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs="
        alt={alt}
      />
    );

  return (
    <div
      ref={rootRef}
      className={`scroll-expand bg-black ${useWindowScroll ? '' : 'scroll-expand--scroller'} ${className}`.trim()}
      style={style}
      {...rest}
    >
      <div ref={trackRef} className="scroll-expand__track bg-black">
        <div ref={stageRef} className="scroll-expand__stage bg-black border-b border-white/15">
          <div ref={frameRef} className="scroll-expand__frame bg-black">
            {media}
            <div ref={scrimRef} className="scroll-expand__scrim" />
            {showFollowRope && (
              <LinePath
                scrollYProgress={scrollYProgress}
                strokeColor="#FFFFFF"
                strokeWidth={20}
                className="pointer-events-none absolute inset-y-0 right-0 md:right-[2%] w-full md:w-[72%] h-full z-10"
              />
            )}
            {children ? (
              <div ref={overlayRef} className="scroll-expand__overlay z-20">
                {children}
              </div>
            ) : null}
            {sidePanel ? (
              <div
                ref={sidePanelRef}
                className="absolute inset-0 z-30 flex flex-col justify-center bg-[#0B0B0C]/95 backdrop-blur-2xl overflow-hidden transition-opacity duration-700 ease-out"
                style={{
                  transform: 'translate3d(100%, 0, 0)',
                  opacity: 0,
                  pointerEvents: 'none',
                  willChange: 'transform, opacity',
                }}
              >
                {sidePanel}
              </div>
            ) : null}
          </div>
          {title ? (
            <div ref={titleRef} className="scroll-expand__title">
              {title}
            </div>
          ) : null}
          {scrollHint ? (
            <div ref={hintRef} className="scroll-expand__hint">
              {scrollHint}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ScrollExpand;
