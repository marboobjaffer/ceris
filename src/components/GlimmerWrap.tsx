'use client';

import React, { useEffect, useRef } from 'react';

export interface GlimmerWrapProps {
  className?: string;
  count?: number;
  speed?: number;
  glintIntensity?: number;
  overlapLanding?: boolean;
  theme?: 'dark' | 'light';
  children?: React.ReactNode;
}

interface GlintParticle {
  x: number;
  y: number;
  z: number; // depth 0.15..1.0
  vx: number;
  vy: number;
  phase: number;
  flashSpeed: number;
  baseSize: number;
  hueShift: number; // 0 = pure silver/alabaster, 1 = warm champagne, 2 = faint crimson/oxblood glint
  rotation: number;
  rotationSpeed: number;
}

const clamp = (v: number, min: number, max: number) =>
  v < min ? min : v > max ? max : v;

const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0 || 1e-6), 0, 1);
  return t * t * (3 - 2 * t);
};

export const GlimmerWrap: React.FC<GlimmerWrapProps> = ({
  className = '',
  count = 420,
  speed = 1,
  glintIntensity = 1,
  overlapLanding = true,
  theme = 'dark',
  children,
}) => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const curtainRef = useRef<HTMLDivElement | null>(null);
  const edgeGlowRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Scroll-linked right-to-left wipe that covers the landing page before the Dresses section
  useEffect(() => {
    const track = trackRef.current;
    const curtain = curtainRef.current;
    const edgeGlow = edgeGlowRef.current;
    if (!track || !curtain) return;

    let rafId = 0;
    let currentProgress = 0;
    let targetProgress = 0;
    let isAnimating = false;

    const computeTarget = () => {
      const rect = track.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      if (overlapLanding) {
        // When overlapping the pinned landing page, begin sliding in from the right
        // the moment the sticky stage locks at top = 0 (rect.top <= 0)
        const scrolled = -rect.top;
        const totalTravel = vh * 1.05;
        return clamp(scrolled / totalTravel, 0, 1);
      }
      const totalTravel = vh * 1.05;
      const scrolled = vh - rect.top;
      return clamp(scrolled / totalTravel, 0, 1);
    };

    const applySlide = (p: number) => {
      const eased = smoothstep(0, 1, p);
      const translateX = (1 - eased) * 100;
      curtain.style.transform = `translate3d(${translateX.toFixed(3)}%, 0, 0)`;

      if (edgeGlow) {
        // Show luminous leading edge while sweeping across the landing page, fade once fully covered
        const edgeAlpha = Math.sin(eased * Math.PI);
        edgeGlow.style.opacity = `${(edgeAlpha * 0.95).toFixed(3)}`;
      }
    };

    const tick = () => {
      currentProgress += (targetProgress - currentProgress) * 0.14;
      if (Math.abs(targetProgress - currentProgress) < 0.0005) {
        currentProgress = targetProgress;
        isAnimating = false;
      }
      applySlide(currentProgress);
      if (isAnimating) {
        rafId = requestAnimationFrame(tick);
      } else {
        rafId = 0;
      }
    };

    const onScrollOrResize = () => {
      targetProgress = computeTarget();
      if (!isAnimating) {
        isAnimating = true;
        if (!rafId) rafId = requestAnimationFrame(tick);
      }
    };

    targetProgress = computeTarget();
    currentProgress = targetProgress;
    applySlide(currentProgress);

    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, []);

  // High-DPI field of fine glints drifting past and flashing as they catch the light
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let width = 1;
    let height = 1;
    let dpr = 1;
    let raf = 0;

    const pointer = {
      x: -9999,
      y: -9999,
      tx: -9999,
      ty: -9999,
      active: false,
    };

    const particles: GlintParticle[] = [];

    const createParticle = (w: number, h: number, randomX = true): GlintParticle => {
      const z = Math.pow(Math.random(), 1.5) * 0.88 + 0.12; // more fine background glints, select foreground stars
      const randColor = Math.random();
      const hueShift = randColor > 0.88 ? 2 : randColor > 0.62 ? 1 : 0;

      return {
        x: randomX ? Math.random() * w : w + Math.random() * 60,
        y: Math.random() * h,
        z,
        // Drift predominantly from right to left with gentle vertical current
        vx: -(0.35 + z * 1.25) * speed * (0.8 + Math.random() * 0.45),
        vy: (Math.random() - 0.52) * 0.28 * speed,
        phase: Math.random() * Math.PI * 2,
        flashSpeed: 1.4 + Math.random() * 2.8,
        baseSize: (0.55 + z * 1.65) * (0.85 + Math.random() * 0.35),
        hueShift,
        rotation: Math.random() * Math.PI,
        rotationSpeed: (Math.random() - 0.5) * 0.015,
      };
    };

    const initParticles = () => {
      particles.length = 0;
      const densityCount = clamp(
        Math.round((width * height) / 3600),
        220,
        count
      );
      for (let i = 0; i < densityCount; i++) {
        particles.push(createParticle(width, height, true));
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initParticles();
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.tx = e.clientX - rect.left;
      pointer.ty = e.clientY - rect.top;
      pointer.active =
        pointer.tx >= 0 &&
        pointer.tx <= width &&
        pointer.ty >= 0 &&
        pointer.ty <= height;
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });

    let startTime = performance.now();

    const render = (now: number) => {
      const t = (now - startTime) * 0.001;

      if (pointer.active) {
        pointer.x += (pointer.tx - pointer.x) * 0.12;
        pointer.y += (pointer.ty - pointer.y) * 0.12;
      } else {
        pointer.x = -9999;
        pointer.y = -9999;
      }

      const isLight = theme === 'light';

      // 1. Backdrop with subtle sweeping light bands
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      if (isLight) {
        bgGrad.addColorStop(0, '#F5F2EB');
        bgGrad.addColorStop(0.5, '#EFECE4');
        bgGrad.addColorStop(1, '#F6F4EF');
      } else {
        bgGrad.addColorStop(0, '#070709');
        bgGrad.addColorStop(0.5, '#0B0B0E');
        bgGrad.addColorStop(1, '#060608');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Sweeping diagonal light shafts that cause glints to flash as they pass through
      const waveCenter1 = ((1 - ((t * 0.14) % 1)) * 1.4 - 0.2) * width;
      const waveCenter2 = ((1 - ((t * 0.08 + 0.47) % 1)) * 1.4 - 0.2) * width;

      const ambientGlow = ctx.createRadialGradient(
        waveCenter1,
        height * 0.48,
        10,
        waveCenter1,
        height * 0.48,
        Math.max(width, height) * 0.55
      );
      if (isLight) {
        ambientGlow.addColorStop(0, 'rgba(140, 45, 45, 0.06)');
        ambientGlow.addColorStop(0.45, 'rgba(18, 18, 21, 0.035)');
        ambientGlow.addColorStop(1, 'rgba(246, 244, 239, 0)');
      } else {
        ambientGlow.addColorStop(0, 'rgba(244, 243, 239, 0.045)');
        ambientGlow.addColorStop(0.45, 'rgba(90, 18, 24, 0.035)');
        ambientGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      }
      ctx.fillStyle = ambientGlow;
      ctx.fillRect(0, 0, width, height);

      // 2. Render drifting glints & specular star flashes
      ctx.save();
      ctx.globalCompositeOperation = isLight ? 'source-over' : 'lighter';

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy + Math.sin(t * 0.9 + p.phase) * 0.08;
        p.rotation += p.rotationSpeed;

        // Wrap around seamlessly from right side when drifting past left edge
        if (p.x < -40) {
          p.x = width + 30 + Math.random() * 40;
          p.y = Math.random() * height;
        }
        if (p.y < -30) p.y = height + 25;
        if (p.y > height + 30) p.y = -25;

        // Calculate how strongly this glint catches the sweeping light + individual shimmer cycle
        const diagCoord = p.x + (p.y - height * 0.5) * 0.32;
        const distWave1 = Math.abs(diagCoord - waveCenter1);
        const distWave2 = Math.abs(diagCoord - waveCenter2);
        const waveCatch1 = Math.exp(-(distWave1 * distWave1) / (2 * Math.pow(width * 0.13, 2)));
        const waveCatch2 = Math.exp(-(distWave2 * distWave2) / (2 * Math.pow(width * 0.18, 2)));

        // Pointer light catch
        let pointerCatch = 0;
        if (pointer.active) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const d2 = dx * dx + dy * dy;
          pointerCatch = Math.exp(-d2 / (2 * 150 * 150)) * 0.85;
        }

        // Sharp specular flash curve (mostly fine dust, sharp glint spike when catching light)
        const rawOsc = 0.5 + 0.5 * Math.sin(t * p.flashSpeed + p.phase);
        const sharpFlash = Math.pow(rawOsc, 7.5);
        const lightCatch = clamp(
          (waveCatch1 * 0.85 + waveCatch2 * 0.55 + pointerCatch) *
            (0.35 + 0.65 * Math.pow(rawOsc, 2.5)) +
            sharpFlash * 0.78,
          0,
          1
        );

        const baseAlpha = (0.14 + p.z * 0.26 + lightCatch * 0.68) * glintIntensity;
        const radius = p.baseSize * (1 + lightCatch * 1.45);

        // Color palette adapts to dark vs light mode
        let r = isLight ? 28 : 244,
          g = isLight ? 26 : 243,
          b = isLight ? 32 : 248;
        if (p.hueShift === 1) {
          r = isLight ? 140 : 250;
          g = isLight ? 98 : 238;
          b = isLight ? 52 : 222;
        } else if (p.hueShift === 2) {
          r = isLight ? 140 : 238;
          g = isLight ? 35 : 195;
          b = isLight ? 42 : 202;
        }

        // Core fine glint dot
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${clamp(baseAlpha, 0, 1).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();

        // When a glint catches the light strongly, draw crisp 4-point star flare spikes
        if (lightCatch > 0.36 && p.z > 0.28) {
          const flareStrength = (lightCatch - 0.36) / 0.64;
          const spikeLen = (6 + p.z * 22) * flareStrength * glintIntensity;
          const spikeAlpha = clamp(flareStrength * 0.82 * p.z, 0, 0.95);
          const coreSpikeColor = isLight ? '18, 18, 22' : '255, 255, 255';

          // Soft halo around flashing glint
          const haloGrad = ctx.createRadialGradient(
            p.x,
            p.y,
            0,
            p.x,
            p.y,
            spikeLen * 0.85
          );
          haloGrad.addColorStop(0, `rgba(${coreSpikeColor}, ${(spikeAlpha * 0.45).toFixed(3)})`);
          haloGrad.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, ${(spikeAlpha * 0.18).toFixed(3)})`);
          haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = haloGrad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, spikeLen * 0.85, 0, Math.PI * 2);
          ctx.fill();

          // 4-point anamorphic & crystalline star spikes
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation * 0.15);
          ctx.strokeStyle = `rgba(${coreSpikeColor}, ${spikeAlpha.toFixed(3)})`;
          ctx.lineWidth = Math.max(0.65, 1.15 * p.z * flareStrength);
          ctx.lineCap = 'round';

          // Primary horizontal & vertical spikes
          ctx.beginPath();
          ctx.moveTo(-spikeLen * 1.15, 0);
          ctx.lineTo(spikeLen * 1.15, 0);
          ctx.moveTo(0, -spikeLen * 0.85);
          ctx.lineTo(0, spikeLen * 0.85);
          ctx.stroke();

          // Secondary subtle diagonal cross spikes for bright foreground glints
          if (flareStrength > 0.52) {
            const diagLen = spikeLen * 0.42;
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${(spikeAlpha * 0.55).toFixed(3)})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(-diagLen, -diagLen);
            ctx.lineTo(diagLen, diagLen);
            ctx.moveTo(diagLen, -diagLen);
            ctx.lineTo(-diagLen, diagLen);
            ctx.stroke();
          }

          ctx.restore();
        }
      }

      ctx.restore();

      // Subtle top and bottom vignette so it blends seamlessly with the page canvas
      const vigRgb = isLight ? '246, 244, 239' : '11, 11, 12';
      const topVig = ctx.createLinearGradient(0, 0, 0, 96);
      topVig.addColorStop(0, `rgba(${vigRgb}, 0.72)`);
      topVig.addColorStop(1, `rgba(${vigRgb}, 0)`);
      ctx.fillStyle = topVig;
      ctx.fillRect(0, 0, width, 96);

      const botVig = ctx.createLinearGradient(0, height - 96, 0, height);
      botVig.addColorStop(0, `rgba(${vigRgb}, 0)`);
      botVig.addColorStop(1, `rgba(${vigRgb}, 0.85)`);
      ctx.fillStyle = botVig;
      ctx.fillRect(0, height - 96, width, 96);

      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, [count, speed, glintIntensity, theme]);

  return (
    <div
      ref={trackRef}
      data-glimmer-track="true"
      className={`relative w-full ${
        overlapLanding ? 'h-[310vh] -mt-[210vh]' : 'h-[220vh]'
      } z-20 pointer-events-none select-none ${className}`}
    >
      <div className="sticky top-0 w-full h-screen overflow-hidden">
        <div
          ref={curtainRef}
          style={{ transform: 'translate3d(100%, 0, 0)' }}
          className={`relative w-full h-full will-change-transform transition-colors duration-300 ${
            theme === 'light'
              ? 'bg-[#F5F2EB] shadow-[-32px_0_80px_rgba(0,0,0,0.22)]'
              : 'bg-[#070709] shadow-[-32px_0_80px_rgba(0,0,0,0.92)]'
          }`}
        >
          {/* Left Leading Specular Edge that gleams as the curtain sweeps in from the right */}
          <div
            ref={edgeGlowRef}
            className="absolute inset-y-0 left-0 w-[2px] z-10 bg-gradient-to-b from-transparent via-white/70 to-transparent shadow-[0_0_24px_rgba(255,255,255,0.65)]"
          />
          <canvas
            ref={canvasRef}
            className="block w-full h-full"
          />
          {children && (
            <div className="absolute inset-0 z-20 flex items-center justify-center px-6 md:px-16 text-center">
              <div className="max-w-4xl mx-auto w-full flex items-center justify-center text-center">
                {children}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlimmerWrap;
