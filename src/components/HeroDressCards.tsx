import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Eye } from 'lucide-react';
import { DressProduct, HERO_EDITORIAL_IMAGE } from '../data/dresses';

export interface HeroDressCardsProps {
  dresses: DressProduct[];
  theme?: 'dark' | 'light';
  onSelectDress?: (dress: DressProduct) => void;
  onShopDresses?: () => void;
  onFindSize?: () => void;
}

interface CardSlot {
  id: string;
  title: string;
  subtitle: string;
  price?: number;
  image: string;
  dress?: DressProduct;
  baseAngleDeg: number;
  baseTiltDeg: number;
  depthScale: number;
}

export const HeroDressCards: React.FC<HeroDressCardsProps> = ({
  dresses,
  theme = 'dark',
  onSelectDress,
  onShopDresses,
  onFindSize,
}) => {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const hoveredIndexRef = useRef<number | null>(null);
  hoveredIndexRef.current = hoveredIndex;

  // Build 8 Gothic Dress cards framing the center brand name
  const cards: CardSlot[] = React.useMemo(() => {
    const items: CardSlot[] = dresses.map((d, idx) => ({
      id: d.id,
      title: d.name.replace(/^(\w+)\s+/, '$1 '),
      subtitle: d.category,
      price: d.price,
      image: d.image,
      dress: d,
      baseAngleDeg: idx * 45,
      baseTiltDeg: (idx % 2 === 0 ? 1 : -1) * (4 + (idx % 3) * 2),
      depthScale: idx % 2 === 0 ? 1 : 0.94,
    }));

    // Add 2 additional signature gothic dress editorial cards for a balanced 8-card ring
    items.push(
      {
        id: 'rr-editorial-07',
        title: 'Obsidian Cathedral Gown',
        subtitle: 'Couture Archive',
        price: 790,
        image: '/src/assets/images/hero_goth_atelier_1793254543263.jpg',
        dress: dresses[0],
        baseAngleDeg: 6 * 45,
        baseTiltDeg: 5,
        depthScale: 0.96,
      },
      {
        id: 'rr-editorial-08',
        title: 'Nocturne Velvet Silhouette',
        subtitle: 'Atelier Edition',
        price: 710,
        image: HERO_EDITORIAL_IMAGE,
        dress: dresses[1] || dresses[0],
        baseAngleDeg: 7 * 45,
        baseTiltDeg: -5,
        depthScale: 0.94,
      }
    );

    return items.map((item, index) => ({
      ...item,
      baseAngleDeg: (index * 360) / items.length,
    }));
  }, [dresses]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const reduceMotion =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    let rafId = 0;
    let startTime = performance.now();
    let orbitAngle = 0;
    let lastTime = startTime;

    const pointer = {
      x: 0,
      y: 0,
      tx: 0,
      ty: 0,
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = stage.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      pointer.tx = Math.max(-1, Math.min(1, nx));
      pointer.ty = Math.max(-1, Math.min(1, ny));
    };

    const onPointerLeave = () => {
      pointer.tx = 0;
      pointer.ty = 0;
    };

    stage.addEventListener('pointermove', onPointerMove, { passive: true });
    stage.addEventListener('pointerleave', onPointerLeave, { passive: true });

    const tick = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;
      const elapsed = (now - startTime) / 1000;

      // Smooth pointer interpolation
      pointer.x += (pointer.tx - pointer.x) * 0.08;
      pointer.y += (pointer.ty - pointer.y) * 0.08;

      // Slow down orbital drift when user hovers a gothic dress card
      const speedFactor = hoveredIndexRef.current !== null ? 0.12 : 1;
      if (!reduceMotion) {
        orbitAngle += dt * 7.5 * speedFactor; // degrees per second
      }

      const vw = stage.clientWidth || window.innerWidth;
      const vh = stage.clientHeight || window.innerHeight;

      // Responsive elliptical radii so the cards frame the center "Rust & Raven" bold title cleanly
      const radiusX = Math.min(vw * 0.37, 470);
      const radiusY = Math.min(vh * 0.32, 265);

      // Subtle scroll factor for gentle expansion
      const scrollY = window.scrollY || 0;
      const scrollSpread = 1 + Math.min(0.18, (scrollY / Math.max(1, vh)) * 0.12);

      // Intro entrance ease (0 -> 1 over first 1.25s)
      const introT = Math.min(1, elapsed / 1.25);
      const introEase = 1 - Math.pow(1 - introT, 3);

      for (let i = 0; i < cards.length; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;

        const card = cards[i];
        const isHovered = hoveredIndexRef.current === i;

        const deg = card.baseAngleDeg + orbitAngle;
        const rad = (deg * Math.PI) / 180;

        // Elliptical orbit coordinates around the center
        const rawX = Math.cos(rad) * radiusX * scrollSpread * introEase;
        const rawY = Math.sin(rad) * radiusY * scrollSpread * introEase;

        // Individual gentle vertical bobbing
        const floatY = reduceMotion
          ? 0
          : Math.sin(elapsed * 1.4 + i * 0.85) * 6;

        // Parallax offset from pointer
        const parallaxX = pointer.x * (14 * card.depthScale);
        const parallaxY = pointer.y * (10 * card.depthScale);

        const x = rawX + parallaxX;
        const y = rawY + floatY + parallaxY;

        // Tangential / radial card tilt so cards feel like an editorial fashion halo
        const bankRotation =
          Math.cos(rad) * 8 +
          card.baseTiltDeg * 0.4 +
          pointer.x * 4;

        const scale = isHovered
          ? 1.16
          : card.depthScale * (0.94 + 0.06 * Math.sin(rad));

        const rotateX = isHovered ? -pointer.y * 8 : -pointer.y * 4;
        const rotateY = isHovered ? pointer.x * 10 : pointer.x * 5;
        const rotateZ = isHovered ? 0 : bankRotation;

        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(
          1
        )}px, 0) perspective(900px) rotateX(${rotateX.toFixed(
          2
        )}deg) rotateY(${rotateY.toFixed(2)}deg) rotateZ(${rotateZ.toFixed(
          2
        )}deg) scale(${scale.toFixed(3)})`;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      stage.removeEventListener('pointermove', onPointerMove);
      stage.removeEventListener('pointerleave', onPointerLeave);
    };
  }, [cards]);

  const isLight = theme === 'light';

  return (
    <div className="relative w-full h-[350vh]">
      <div
        ref={stageRef}
        className={`sticky top-0 w-full h-screen overflow-hidden flex items-center justify-center select-none transition-colors duration-300 ${
          isLight ? 'bg-[#F6F4EF]' : 'bg-[#0B0B0C]'
        }`}
      >
        {/* Subtle Architectural Background Aura & Vignette */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background: isLight
              ? 'radial-gradient(circle at 50% 50%, rgba(140, 45, 45, 0.08) 0%, rgba(246, 244, 239, 0.95) 68%)'
              : 'radial-gradient(circle at 50% 50%, rgba(158, 42, 43, 0.16) 0%, rgba(11, 11, 12, 0.94) 68%)',
          }}
        />

        {/* Subtle Orbital Hairline Rings behind the Gothic Dress Cards */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute w-[68vw] max-w-[920px] aspect-[16/10] rounded-full border transition-colors duration-300 ${
            isLight ? 'border-black/[0.06]' : 'border-white/[0.06]'
          }`}
        />
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute w-[52vw] max-w-[680px] aspect-[16/10] rounded-full border border-dashed transition-colors duration-300 ${
            isLight ? 'border-black/[0.05]' : 'border-white/[0.05]'
          }`}
        />

        {/* Animated Ring of Gothic Dress Cards */}
        <div
          className="relative w-full h-full flex items-center justify-center"
          aria-label="Gothic Dress Collection Cards"
        >
          {cards.map((card, index) => {
            const isHovered = hoveredIndex === index;
            return (
              <div
                key={card.id}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => {
                  if (card.dress && onSelectDress) {
                    onSelectDress(card.dress);
                  } else if (onShopDresses) {
                    onShopDresses();
                  }
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (card.dress && onSelectDress) {
                      onSelectDress(card.dress);
                    } else if (onShopDresses) {
                      onShopDresses();
                    }
                  }
                }}
                aria-label={`Inspect ${card.title}`}
                style={{
                  zIndex: isHovered ? 35 : 12 + (index % 3),
                }}
                className="group absolute w-[126px] sm:w-[156px] md:w-[186px] lg:w-[204px] aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer will-change-transform transition-shadow duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.75)] hover:shadow-[0_28px_64px_rgba(158,42,43,0.42)] border border-white/15 hover:border-[#9E2A2B]/80 bg-[#121215]"
              >
                {/* Gothic Dress Editorial Image */}
                <img
                  src={card.image}
                  alt={card.title}
                  draggable={false}
                  className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-110"
                />

                {/* Top Specular Gloss & Subtle Dark Scrim */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-85 group-hover:opacity-95 transition-opacity duration-300" />

                {/* Top Index Pill */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-widest bg-black/65 text-zinc-200 backdrop-blur-md border border-white/10">
                    0{index + 1}
                  </span>
                  {card.price && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-black/65 text-[#F4F3EF] backdrop-blur-md border border-white/10">
                      ${card.price}
                    </span>
                  )}
                </div>

                {/* Bottom Dress Info inside Card */}
                <div className="absolute inset-x-0 bottom-0 p-3 flex flex-col justify-end text-left pointer-events-none">
                  <span className="text-[9px] font-mono uppercase tracking-[0.16em] text-[#C5A059] truncate">
                    {card.subtitle}
                  </span>
                  <p className="font-display text-xs sm:text-sm font-semibold text-[#F4F3EF] leading-tight line-clamp-1 mt-0.5">
                    {card.title}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1 text-[10px] text-zinc-300 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
                    <Eye className="w-3 h-3 text-[#9E2A2B]" />
                    <span>Inspect Gown</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Centerpiece Content inside the Ring of Gothic Dress Cards */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-25 flex flex-col items-center justify-center text-center px-6 py-8 max-w-xl mx-auto pointer-events-none"
          >
            {/* Soft Radial Backdrop Shield so the Bold Brand Name stands out crisply in the center */}
            <div
              aria-hidden="true"
              className={`absolute -inset-10 sm:-inset-14 rounded-full blur-2xl -z-10 ${
                isLight ? 'bg-[#F6F4EF]/85' : 'bg-[#0B0B0C]/85'
              }`}
            />

            <span
              className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] sm:text-xs font-mono uppercase tracking-[0.22em] mb-4 border backdrop-blur-md ${
                isLight
                  ? 'bg-black/[0.04] border-black/10 text-zinc-700'
                  : 'bg-white/[0.05] border-white/15 text-zinc-300'
              }`}
            >
              <Sparkles className="w-3 h-3 text-[#9E2A2B]" />
              Dark Luxury Gothic Dress Atelier
            </span>

            {/* Center Brand Name: Rust & Raven in BOLD */}
            <h1
              className={`font-display text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight leading-none ${
                isLight ? 'text-[#121215]' : 'text-[#F4F3EF]'
              }`}
              style={{
                textShadow: isLight
                  ? '0 4px 24px rgba(246, 244, 239, 0.9)'
                  : '0 8px 36px rgba(0, 0, 0, 0.92)',
              }}
            >
              Rust &amp; Raven
            </h1>

            <p
              className={`mt-4 text-xs sm:text-sm md:text-base font-medium max-w-md leading-relaxed ${
                isLight ? 'text-zinc-700' : 'text-zinc-300'
              }`}
            >
              Architectural Goth Dresses in Obsidian Silk, Crushed Velvet &amp; French Chantilly Lace
            </p>

            {/* Primary Hero CTA Buttons */}
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3.5 pointer-events-auto">
              <button
                type="button"
                onClick={onShopDresses}
                className={`py-3 px-7 rounded-full text-xs font-bold tracking-wide transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 shadow-lg hover:scale-[1.03] active:scale-[0.98] ${
                  isLight
                    ? 'bg-[#121215] text-[#F4F3EF] hover:bg-black'
                    : 'bg-[#F4F3EF] text-[#0B0B0C] hover:bg-white'
                }`}
              >
                Shop Dresses
              </button>
              <button
                type="button"
                onClick={onFindSize}
                className={`py-3 px-6 rounded-full backdrop-blur-xl border text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 hover:scale-[1.03] active:scale-[0.98] ${
                  isLight
                    ? 'bg-black/[0.06] border-black/20 text-[#121215] hover:bg-black/[0.12]'
                    : 'bg-white/[0.08] border-white/25 shadow-[inset_0_1px_1px_rgba(255,255,255,0.38),inset_0_-2px_6px_rgba(255,255,255,0.1),0_8px_24px_rgba(0,0,0,0.35)] text-[#F4F3EF] hover:bg-white/[0.15] hover:border-white/40'
                }`}
              >
                Find Your Atelier Size
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HeroDressCards;
