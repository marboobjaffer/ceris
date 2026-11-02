import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, useTransform, useSpring, useMotionValue } from 'motion/react';
import { DRESS_CATALOG, HERO_EDITORIAL_IMAGE } from '../data/dresses';

export type AnimationPhase = 'scatter' | 'line' | 'circle' | 'bottom-strip';

interface FlipCardProps {
  src: string;
  label: string;
  index: number;
  total: number;
  phase: AnimationPhase;
  target: {
    x: number;
    y: number;
    rotation: number;
    scale: number;
    opacity: number;
  };
}

const IMG_WIDTH = 60;
const IMG_HEIGHT = 85;

function FlipCard({ src, label, index, phase, target }: FlipCardProps) {
  return (
    <motion.div
      animate={{
        x: target.x,
        y: target.y,
        rotate: target.rotation,
        scale: target.scale,
        opacity: target.opacity,
      }}
      transition={
        phase === 'scatter' || phase === 'line'
          ? {
              type: 'spring',
              stiffness: 18,
              damping: 16,
              mass: 1.2,
            }
          : {
              type: 'spring',
              stiffness: 24,
              damping: 20,
              mass: 1.1,
            }
      }
      style={{
        position: 'absolute',
        width: IMG_WIDTH,
        height: IMG_HEIGHT,
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
      className="cursor-pointer group"
    >
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: 'preserve-3d' }}
        transition={{
          duration: 0.85,
          type: 'spring',
          stiffness: 180,
          damping: 22,
        }}
        whileHover={{ rotateY: 180 }}
      >
        {/* Front Face */}
        <div
          className="absolute inset-0 h-full w-full overflow-hidden rounded-xl shadow-[0_10px_28px_rgba(0,0,0,0.65)] bg-zinc-900 border border-white/15"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <img
            src={src}
            alt={`Gothic Dress ${index + 1}`}
            className="h-full w-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-black/15 transition-colors group-hover:bg-transparent" />
        </div>

        {/* Back Face */}
        <div
          className="absolute inset-0 h-full w-full overflow-hidden rounded-xl shadow-lg bg-[#0B0B0C] flex flex-col items-center justify-center p-2 border border-[#8C2D2D]/60"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="text-center">
            <p className="text-[7px] font-bold text-[#C85A5A] uppercase tracking-widest mb-1">
              Couture
            </p>
            <p className="text-[9px] font-bold text-[#F4F3EF] leading-tight line-clamp-2">
              {label}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

const TOTAL_IMAGES = 20;
const MAX_SCROLL = 3000;

const BASE_GOTHIC_DRESSES = [
  {
    src: '/src/assets/images/velvet_corset_dress_1793342034598.jpg',
    label: 'Velvet Corset',
  },
  {
    src: '/src/assets/images/lace_bell_dress_1793342035495.jpg',
    label: 'Chantilly Lace',
  },
  {
    src: '/src/assets/images/silk_cowl_dress_1793342036166.jpg',
    label: 'Silk Bias Slip',
  },
  {
    src: '/src/assets/images/organza_midi_dress_1793342035741.jpg',
    label: 'Smoked Organza',
  },
  {
    src: '/src/assets/images/oxblood_damask_gown_1793342036448.jpg',
    label: 'Oxblood Brocade',
  },
  {
    src: '/src/assets/images/leather_harness_dress_1793342036718.jpg',
    label: 'Draped Column',
  },
  {
    src: HERO_EDITORIAL_IMAGE,
    label: 'Obsidian Couture',
  },
];

const IMAGES = Array.from({ length: TOTAL_IMAGES }, (_, idx) => {
  return BASE_GOTHIC_DRESSES[idx % BASE_GOTHIC_DRESSES.length];
});

const lerp = (start: number, end: number, t: number) =>
  start * (1 - t) + end * t;

interface IntroAnimationProps {
  isReady?: boolean;
  children?: React.ReactNode;
}

export default function IntroAnimation({
  isReady = true,
  children,
}: IntroAnimationProps) {
  const [introPhase, setIntroPhase] = useState<AnimationPhase>('scatter');
  const [autoHeroPresent, setAutoHeroPresent] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // --- Container Size ---
  useEffect(() => {
    if (!containerRef.current) return;

    const handleResize = (entries: ResizeObserverEntry[]) => {
      for (const entry of entries) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    };

    const observer = new ResizeObserver(handleResize);
    observer.observe(containerRef.current);

    setContainerSize({
      width: containerRef.current.offsetWidth,
      height: containerRef.current.offsetHeight,
    });

    return () => observer.disconnect();
  }, []);

  // --- Scroll Logic Synced with Page Scroll ---
  const virtualScroll = useMotionValue(0);

  useEffect(() => {
    const updateScrollFromWindow = () => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const scrollableDistance = Math.max(
        1,
        trackRef.current.offsetHeight - viewportHeight
      );
      const scrolled = Math.min(Math.max(-rect.top, 0), scrollableDistance);
      const mappedScroll = (scrolled / scrollableDistance) * MAX_SCROLL;
      virtualScroll.set(mappedScroll);
    };

    window.addEventListener('scroll', updateScrollFromWindow, {
      passive: true,
    });
    window.addEventListener('resize', updateScrollFromWindow);
    updateScrollFromWindow();

    return () => {
      window.removeEventListener('scroll', updateScrollFromWindow);
      window.removeEventListener('resize', updateScrollFromWindow);
    };
  }, [virtualScroll]);

  // 1. Morph Progress: 0 (Circle around Rust & Raven) -> 1 (Bottom Arc & Hero Present)
  // Triggered either by scrolling OR automatically after the 4s intro sequence
  const morphTarget = useMotionValue(0);
  const smoothMorph = useSpring(morphTarget, {
    stiffness: 18,
    damping: 20,
    mass: 1.2,
  });

  useEffect(() => {
    const updateMorphTarget = () => {
      const scrollVal = virtualScroll.get();
      const scrollMorph = Math.min(Math.max(scrollVal / 550, 0), 1);
      morphTarget.set(autoHeroPresent ? 1 : scrollMorph);
    };

    updateMorphTarget();
    const unsub = virtualScroll.on('change', updateMorphTarget);
    return () => unsub();
  }, [virtualScroll, autoHeroPresent, morphTarget]);

  // 2. Scroll Rotation (Slow Shuffling as user scrolls through the pinned 4s Hero section)
  const scrollRotate = useTransform(virtualScroll, [0, 3000], [0, 140]);
  const smoothScrollRotate = useSpring(scrollRotate, {
    stiffness: 20,
    damping: 22,
  });

  // --- Mouse Parallax (Gentle & Slow) ---
  const mouseX = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 18, damping: 22 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const normalizedX = (relativeX / rect.width) * 2 - 1;
      mouseX.set(normalizedX * 70);
    };
    container.addEventListener('mousemove', handleMouseMove);
    return () => container.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX]);

  // --- Slow Intro Sequence (Scatter -> Line -> Circle -> Present Hero after 4s) ---
  useEffect(() => {
    if (!isReady) {
      setIntroPhase('scatter');
      setAutoHeroPresent(false);
      return;
    }
    const timer1 = setTimeout(() => setIntroPhase('line'), 700);
    const timer2 = setTimeout(() => setIntroPhase('circle'), 2400);
    const timer3 = setTimeout(() => setAutoHeroPresent(true), 6400); // 4 seconds in circle before presenting Hero automatically
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isReady]);

  // --- Continuous Slow-Speed Orbital Animation ---
  const [continuousAngle, setContinuousAngle] = useState(0);

  useEffect(() => {
    if (!isReady) return;
    let rafId: number;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      // Slow continuous motion: ~9 degrees per second (one full revolution every 40 seconds)
      setContinuousAngle((prev) => prev + dt * 9);
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isReady]);

  // --- Right-Side Stream Entry Scatter Positions ---
  const scatterPositions = useMemo(() => {
    return IMAGES.map((_, i) => ({
      x: 700 + i * 45 + Math.random() * 200,
      y: (Math.random() - 0.5) * 400,
      rotation: 15 + Math.random() * 45,
      scale: 0.65,
      opacity: 0,
    }));
  }, []);

  // --- Render Loop Values ---
  const [morphValue, setMorphValue] = useState(0);
  const [rotateValue, setRotateValue] = useState(0);
  const [parallaxValue, setParallaxValue] = useState(0);

  useEffect(() => {
    const unsubscribeMorph = smoothMorph.on('change', setMorphValue);
    const unsubscribeRotate = smoothScrollRotate.on('change', setRotateValue);
    const unsubscribeParallax = smoothMouseX.on('change', setParallaxValue);
    return () => {
      unsubscribeMorph();
      unsubscribeRotate();
      unsubscribeParallax();
    };
  }, [smoothMorph, smoothScrollRotate, smoothMouseX]);

  // --- Hero Content & Background Opacity (No Zooming Animation) ---
  const heroBgOpacity = useTransform(smoothMorph, [0.3, 0.88], [0, 1]);
  const contentOpacity = useTransform(smoothMorph, [0.65, 1], [0, 1]);
  const contentY = useTransform(smoothMorph, [0.65, 1], [24, 0]);

  return (
    // 380vh sticky track ensures the Hero section stays pinned on screen for ~4 seconds of scrolling
    <div ref={trackRef} className="relative w-full h-[380vh]">
      <div
        ref={containerRef}
        className="sticky top-0 w-full h-screen bg-[#0B0B0C] overflow-hidden"
      >
        {/* Hero Background Image (Gothic Dress Model on Right Side — Static, No Zoom Animation) */}
        <motion.div
          style={{ opacity: heroBgOpacity }}
          className="absolute inset-0 z-0 pointer-events-none"
        >
          <img
            src={HERO_EDITORIAL_IMAGE}
            alt="Rust & Raven Gothic Couture Gown in Basalt Hall"
            className="w-full h-full object-cover object-[75%_18%] select-none"
            draggable={false}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, rgba(11, 11, 12, 0.86) 0%, rgba(11, 11, 12, 0.52) 45%, rgba(11, 11, 12, 0.08) 72%, rgba(11, 11, 12, 0.18) 100%)',
            }}
          />
          <div
            className="absolute inset-x-0 bottom-0 h-44"
            style={{
              background:
                'linear-gradient(to top, rgba(11, 11, 12, 0.92) 0%, rgba(11, 11, 12, 0.45) 55%, transparent 100%)',
            }}
          />
        </motion.div>

        {/* Main Stage */}
        <div className="relative z-10 flex h-full w-full flex-col items-center justify-center perspective-1000">
          {/* Center Brand Name inside the Circle of Gothic Dress Cards (Fades out as Hero Presents) */}
          <div className="absolute z-20 flex flex-col items-center justify-center text-center pointer-events-none top-1/2 -translate-y-1/2 px-4">
            <motion.h1
              initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
              animate={
                introPhase === 'circle' && morphValue < 0.5
                  ? {
                      opacity: 1 - morphValue * 2,
                      y: 0,
                      filter: 'blur(0px)',
                    }
                  : { opacity: 0, filter: 'blur(10px)' }
              }
              transition={{ duration: 1.2 }}
              className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#F4F3EF] drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)]"
            >
              Rust &amp; Raven
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={
                introPhase === 'circle' && morphValue < 0.5
                  ? { opacity: 0.65 - morphValue }
                  : { opacity: 0 }
              }
              transition={{ duration: 1.2, delay: 0.2 }}
              className="mt-4 text-xs font-bold tracking-[0.25em] text-zinc-400 uppercase"
            >
              SCROLL TO EXPLORE
            </motion.p>
          </div>

          {/* Hero Section Content (Presents and Stays while Cards Keep Running Slowly) */}
          <motion.div
            style={{ opacity: contentOpacity, y: contentY }}
            className="absolute inset-0 z-20 flex flex-col items-start justify-center text-left pointer-events-none px-6 md:px-14"
          >
            {children}
          </motion.div>

          {/* FlipCards Container */}
          <div className="relative z-10 flex items-center justify-center w-full h-full">
            {IMAGES.slice(0, TOTAL_IMAGES).map((item, i) => {
              let target = {
                x: 0,
                y: 0,
                rotation: 0,
                scale: 1,
                opacity: 1,
              };

              if (introPhase === 'scatter') {
                target = scatterPositions[i];
              } else if (introPhase === 'line') {
                const lineSpacing = 68;
                const lineTotalWidth = TOTAL_IMAGES * lineSpacing;
                const lineX = i * lineSpacing - lineTotalWidth / 2 + 120;
                target = {
                  x: lineX,
                  y: i % 2 === 0 ? -12 : 12,
                  rotation: (i - TOTAL_IMAGES / 2) * 2.5,
                  scale: 1,
                  opacity: 1,
                };
              } else {
                const isMobile = containerSize.width < 768;
                const minDimension = Math.min(
                  containerSize.width,
                  containerSize.height
                );

                // Continuous slow angle + scroll-driven angle so the animation never stops
                const baseAngle =
                  (i / TOTAL_IMAGES) * 360 - continuousAngle - rotateValue;
                const rad = (baseAngle * Math.PI) / 180;

                // A. Circle Position around "Rust & Raven"
                const circleRadius = Math.min(minDimension * 0.35, 325);
                const circlePos = {
                  x: Math.cos(rad) * circleRadius,
                  y: Math.sin(rad) * circleRadius,
                  rotation: baseAngle + 90,
                };

                // B. Continuous Bottom Arch Wheel Position on Hero Section
                const arcRadius = Math.max(
                  minDimension * (isMobile ? 0.68 : 0.74),
                  460
                );
                const arcApexY =
                  containerSize.height * (isMobile ? 0.37 : 0.33);
                const arcCenterY = arcApexY + arcRadius;

                const arcPos = {
                  x: Math.cos(rad) * arcRadius + parallaxValue,
                  y: Math.sin(rad) * arcRadius + arcCenterY,
                  rotation: baseAngle + 90,
                  scale: isMobile ? 1.25 : 1.48,
                };

                // C. Smooth Interpolation (Morph from Circle -> Continuous Hero Bottom Arc)
                target = {
                  x: lerp(circlePos.x, arcPos.x, morphValue),
                  y: lerp(circlePos.y, arcPos.y, morphValue),
                  rotation: lerp(circlePos.rotation, arcPos.rotation, morphValue),
                  scale: lerp(1, arcPos.scale, morphValue),
                  opacity: 1,
                };
              }

              return (
                <FlipCard
                  key={i}
                  src={item.src}
                  label={item.label}
                  index={i}
                  total={TOTAL_IMAGES}
                  phase={introPhase}
                  target={target}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
