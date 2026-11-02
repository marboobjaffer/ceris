"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useMotionTemplate } from "motion/react";

export interface SmoothScrollHeroProps {
  scrollHeight?: number;
  desktopImage: string;
  mobileImage?: string;
  initialClipPercentage?: number;
  finalClipPercentage?: number;
  title?: string;
  subtitle?: string;
  scrollHint?: string;
  sidePanel?: React.ReactNode;
  children?: React.ReactNode;
  onProgressChange?: (progress: number) => void;
  className?: string;
}

export function SmoothScrollHero({
  scrollHeight = 1800,
  desktopImage,
  mobileImage,
  initialClipPercentage = 18,
  finalClipPercentage = 0,
  title,
  subtitle,
  scrollHint,
  sidePanel,
  children,
  onProgressChange,
  className = "",
}: SmoothScrollHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  React.useEffect(() => {
    return scrollYProgress.on("change", (latest) => {
      onProgressChange?.(latest);
    });
  }, [scrollYProgress, onProgressChange]);

  // Transform scroll progress into clip-path inset percentages
  const clipInset = useTransform(
    scrollYProgress,
    [0, 0.45],
    [`${initialClipPercentage}%`, `${finalClipPercentage}%`]
  );

  const clipRadius = useTransform(
    scrollYProgress,
    [0, 0.45],
    ["20px", "0px"]
  );

  const clipPath = useMotionTemplate`inset(${clipInset} ${clipInset} ${clipInset} ${clipInset} round ${clipRadius})`;

  // Image scale and contrast filter transformations
  const imgScale = useTransform(scrollYProgress, [0, 0.5], [1.1, 1.0]);

  // Content opacity transformations
  const textOpacity = useTransform(scrollYProgress, [0, 0.28], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.28], [0, -28]);

  // Side Panel translation for hanging dresses cascade
  const sidePanelX = useTransform(
    scrollYProgress,
    [0.08, 0.85],
    ["100%", "0%"]
  );
  const sidePanelOpacity = useTransform(
    scrollYProgress,
    [0.08, 0.22],
    [0, 1]
  );

  return (
    <div
      ref={containerRef}
      style={{ height: `${scrollHeight}px` }}
      className={`relative w-full bg-[#0B0B0C] text-white ${className}`}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        {/* Expanding Hero Frame with Solid Black Border (Replaced White Border with Black) */}
        <motion.div
          style={{ clipPath }}
          className="absolute inset-0 w-full h-full overflow-hidden border-2 border-black bg-black shadow-[0_0_60px_rgba(0,0,0,0.95)] ring-2 ring-black"
        >
          {/* Desktop & Mobile Background Images */}
          <picture className="w-full h-full block">
            {mobileImage && (
              <source media="(max-width: 768px)" srcSet={mobileImage} />
            )}
            <motion.img
              style={{ scale: imgScale }}
              src={desktopImage}
              alt="Rust & Raven Gothic Couture Hero"
              draggable={false}
              className="w-full h-full object-cover object-[center_20%] select-none filter contrast-[1.06] brightness-[1.04] saturate-[1.02]"
            />
          </picture>

          {/* Dark Black Scrim Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent pointer-events-none" />

          {/* Children Overlay / Foreground Left Content */}
          {children && (
            <motion.div
              style={{ opacity: textOpacity, y: textY }}
              className="absolute inset-0 z-20 flex flex-col justify-center p-6 md:p-12 pointer-events-auto"
            >
              {children}
            </motion.div>
          )}

          {/* Side Panel Slot (Tilt Cascade Carousel) */}
          {sidePanel && (
            <motion.div
              style={{
                x: sidePanelX,
                opacity: sidePanelOpacity,
              }}
              className="absolute inset-0 z-30 flex flex-col justify-center bg-[#0B0B0C]/95 backdrop-blur-2xl overflow-hidden border-l border-black"
            >
              {sidePanel}
            </motion.div>
          )}
        </motion.div>

        {/* Floating Scroll Hint Footer with Black Accent Border */}
        {scrollHint && (
          <motion.div
            style={{ opacity: textOpacity }}
            className="absolute bottom-6 inset-x-0 text-center z-20 pointer-events-none"
          >
            <span className="text-xs font-medium tracking-wider text-zinc-300 bg-black/90 backdrop-blur-md px-4 py-2 rounded-full border border-black shadow-2xl">
              {scrollHint}
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default SmoothScrollHero;
