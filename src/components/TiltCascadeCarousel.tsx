"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

export type TiltCascadeItem = {
  /** Shown above the card in front. */
  title: string
  /** Optional small line under the card in front. */
  caption?: string
  /** Image URL. Without one the card is a soft gradient. */
  src?: string
  alt?: string
}

export type TiltCascadeCarouselProps = {
  items: TiltCascadeItem[]
  /** Root height. **Must be a definite length.** */
  height?: string
  /** Width (and height) of the card in front, any CSS length. */
  slideSize?: string
  /** Degrees each step away from the front turns a card. */
  angle?: number
  /** How far each step drops a card, as a fraction of the card size. */
  drop?: number
  /** Scale of every card that isn't in front. */
  inactiveScale?: number
  /** Card corner radius in px. */
  radius?: number
  /** Spring bounce, 0 (none) to about 0.5. */
  bounce?: number
  /** Roughly how long a move takes, in seconds. */
  duration?: number
  /** Wrap past the ends. */
  loop?: boolean
  /** Milliseconds between automatic moves. 0 (default) is off. */
  autoplay?: number
  titles?: boolean
  captions?: boolean
  /** The prev / dots / next pill. */
  controls?: boolean
  /** Root background, any CSS colour or gradient. */
  background?: string
  /** Text, dots and buttons. Defaults to white/theme color. */
  color?: string
  fontFamily?: string
  /** A stylesheet to load for `fontFamily`. */
  fontHref?: string | null
  /** Controlled index. Omit for uncontrolled. */
  index?: number
  defaultIndex?: number
  onIndexChange?: (index: number) => void
  /** Clicking (or Enter on) the card that's already in front. */
  onSelect?: (item: TiltCascadeItem, index: number) => void
  ariaLabel?: string
  className?: string
  /** Scroll progress value between 0 and 1 driving continuous cascade position */
  scrollProgress?: number
  /** Automatically respond to window scroll position when in viewport */
  scrollDriven?: boolean
}

// #region motion
export function wrapIndex(i: number, n: number): number {
  if (n <= 0) return 0
  return ((i % n) + n) % n
}

/** The slide showing at a position. Without looping, a drag past an end still means the end slide. */
export function indexAt(pos: number, n: number, loop: boolean): number {
  if (n <= 0) return 0
  const i = Math.round(pos)
  return loop ? wrapIndex(i, n) : Math.min(Math.max(i, 0), n - 1)
}

/** Signed distance from the position to slide i, in slides. Looping takes the short way round. */
export function offsetOf(i: number, pos: number, n: number, loop: boolean): number {
  const d = i - pos
  return loop && n > 0 ? d - n * Math.round(d / n) : d
}

/** Scale for a card `d` slides from the front: 1 in front, `min` from one step out. */
export function scaleAt(d: number, min: number): number {
  return 1 - (1 - min) * Math.min(Math.abs(d), 1)
}

/** Past either end the line still follows a drag, at a third of the speed. */
export function rubber(pos: number, n: number): number {
  if (pos < 0) return pos / 3
  if (pos > n - 1) return n - 1 + (pos - (n - 1)) / 3
  return pos
}

/** Damping ratios and natural frequency from a framer-style bounce and duration. */
export function springOf(bounce: number, duration: number): { omega: number; slide: number; tilt: number } {
  const b = Math.min(Math.max(bounce, 0), 0.9)
  return { omega: (2 * Math.PI) / Math.max(duration, 0.1), slide: 1 - b / 2, tilt: 1 - b }
}

/** One semi-implicit Euler step, sub-stepped so a long frame can't blow it up. */
export function springStep(x: number, v: number, target: number, omega: number, zeta: number, dt: number): number[] {
  const steps = Math.max(1, Math.ceil(dt / (1 / 240)))
  const h = dt / steps
  for (let k = 0; k < steps; k++) {
    v += (-omega * omega * (x - target) - 2 * zeta * omega * v) * h
    x += v * h
  }
  return [x, v]
}

/**
 * Where a released drag comes to rest. `velocity` is in slides per second.
 */
export function releaseTarget(pos: number, velocity: number, n: number, loop: boolean): number {
  const flick = clamp(velocity * 0.22, -2.5, 2.5)
  const raw = Math.round(pos + flick)
  if (loop) return raw
  return Math.max(0, Math.min(n - 1, raw))
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

export function TiltCascadeCarousel({
  items,
  height = "540px",
  slideSize = "320px",
  angle = 18,
  drop = 0.32,
  inactiveScale = 0.78,
  radius = 20,
  bounce = 0.04,
  duration = 1.8,
  loop = true,
  autoplay = 0,
  titles = true,
  captions = true,
  controls = true,
  background = "#0B0B0C",
  color = "#F4F3EF",
  fontFamily,
  fontHref,
  index: controlledIndex,
  defaultIndex = 0,
  onIndexChange,
  onSelect,
  ariaLabel = "Goth Dress Tilt Cascade Showcase",
  className = "",
  scrollProgress,
  scrollDriven = true,
}: TiltCascadeCarouselProps) {
  const n = items.length
  const isControlled = controlledIndex !== undefined
  const [internalIndex, setInternalIndex] = React.useState(defaultIndex)
  const currentIndex = isControlled ? controlledIndex : internalIndex

  const [activeItem, setActiveItem] = React.useState<TiltCascadeItem | null>(
    items[wrapIndex(currentIndex, n)] || null
  )

  // Motion states
  const targetPosRef = React.useRef<number>(currentIndex)
  const posRef = React.useRef<number>(currentIndex)
  const vPosRef = React.useRef<number>(0)
  const tiltPosRef = React.useRef<number>(currentIndex)
  const vTiltPosRef = React.useRef<number>(0)

  const cardRefs = React.useRef<(HTMLDivElement | null)[]>([])
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const animFrameRef = React.useRef<number | null>(null)
  const lastTimeRef = React.useRef<number>(0)

  // Drag tracking
  const draggingRef = React.useRef(false)
  const dragStartXRef = React.useRef(0)
  const dragStartPosRef = React.useRef(0)
  const lastDragXRef = React.useRef(0)
  const lastDragTimeRef = React.useRef(0)
  const dragVelocityRef = React.useRef(0)

  const setIndex = React.useCallback(
    (nextIdx: number) => {
      const wrapped = loop ? wrapIndex(nextIdx, n) : clamp(nextIdx, 0, n - 1)
      if (!isControlled) {
        setInternalIndex(wrapped)
      }
      onIndexChange?.(wrapped)
    },
    [isControlled, loop, n, onIndexChange]
  )

  // Sync target position when index changes
  React.useEffect(() => {
    if (scrollProgress === undefined) {
      targetPosRef.current = currentIndex
      setActiveItem(items[wrapIndex(currentIndex, n)] || null)
      startAnimation()
    }
  }, [currentIndex, n, items, scrollProgress])

  // Sync target position when explicit scrollProgress (0 to 1) is passed
  React.useEffect(() => {
    if (scrollProgress !== undefined && !draggingRef.current && n > 0) {
      // Move ultra-slowly and smoothly as user scrolls
      const cycles = 0.35
      const multiplier = n * cycles
      const rawTarget = scrollProgress * multiplier
      targetPosRef.current = rawTarget
      const nearestIdx = wrapIndex(Math.round(rawTarget), n)
      if (!isControlled && nearestIdx !== internalIndex) {
        setInternalIndex(nearestIdx)
      }
      startAnimation()
    }
  }, [scrollProgress, n, loop, isControlled, internalIndex])

  // Sync target position with window scroll when scrollDriven is true and scrollProgress is omitted
  React.useEffect(() => {
    if (!scrollDriven || scrollProgress !== undefined || n <= 0) return

    const handleWindowScroll = () => {
      if (draggingRef.current) return
      const container = containerRef.current
      if (!container) return

      const rect = container.getBoundingClientRect()
      const windowH = window.innerHeight
      const scrolled = windowH - rect.top
      const totalDist = windowH * 1.6

      const rawProgress = Math.max(0, scrolled / totalDist)
      const cycles = 0.35
      const multiplier = n * cycles
      const rawTarget = rawProgress * multiplier
      targetPosRef.current = rawTarget
      startAnimation()
    }

    window.addEventListener("scroll", handleWindowScroll, { passive: true })
    handleWindowScroll()
    return () => window.removeEventListener("scroll", handleWindowScroll)
  }, [scrollDriven, scrollProgress, n, loop])

  // Optional font loading
  React.useEffect(() => {
    if (!fontHref) return
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = fontHref
    document.head.appendChild(link)
    return () => {
      document.head.removeChild(link)
    }
  }, [fontHref])

  // Animation Loop
  const startAnimation = React.useCallback(() => {
    if (animFrameRef.current !== null) return

    const { omega, slide: zetaSlide, tilt: zetaTilt } = springOf(bounce, duration)

    const tick = (now: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = now
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05)
      lastTimeRef.current = now

      // 1. Step continuous position spring
      if (!draggingRef.current) {
        const [nextPos, nextVPos] = springStep(
          posRef.current,
          vPosRef.current,
          targetPosRef.current,
          omega,
          zetaSlide,
          dt
        )
        posRef.current = nextPos
        vPosRef.current = nextVPos
      }

      // 2. Step tilt trailing spring towards continuous pos
      const [nextTilt, nextVTilt] = springStep(
        tiltPosRef.current,
        vTiltPosRef.current,
        posRef.current,
        omega * 0.85,
        zetaTilt,
        dt
      )
      tiltPosRef.current = nextTilt
      vTiltPosRef.current = nextVTilt

      // 3. Render frame to cards DOM
      const cardWidth = containerRef.current
        ? Math.min(containerRef.current.clientWidth * 0.45, 340)
        : 280

      for (let i = 0; i < n; i++) {
        const el = cardRefs.current[i]
        if (!el) continue

        const d = offsetOf(i, tiltPosRef.current, n, loop)
        const absD = Math.abs(d)
        const scale = scaleAt(d, inactiveScale)

        // Drop & tilt translation calculation
        const rot = clamp(d * angle, -45, 45)
        const xShift = d * (cardWidth * 0.65)
        const yShift = absD * (cardWidth * drop)
        const zIndex = 1000 - Math.round(absD * 50)
        const opacity = clamp(1 - (absD - 2.5) * 0.5, 0, 1)

        el.style.transform = `translate3d(${xShift.toFixed(2)}px, ${yShift.toFixed(
          2
        )}px, 0px) rotate(${rot.toFixed(2)}deg) scale(${scale.toFixed(3)})`
        el.style.zIndex = `${zIndex}`
        el.style.opacity = `${opacity.toFixed(3)}`
      }

      // Sync active index when nearest slide updates
      const currentActive = indexAt(posRef.current, n, loop)
      if (items[currentActive] && items[currentActive] !== activeItem) {
        setActiveItem(items[currentActive])
      }

      // Check settling
      const posSettled =
        Math.abs(posRef.current - targetPosRef.current) < 0.001 &&
        Math.abs(vPosRef.current) < 0.001
      const tiltSettled =
        Math.abs(tiltPosRef.current - posRef.current) < 0.001 &&
        Math.abs(vTiltPosRef.current) < 0.001

      if (!posSettled || !tiltSettled || draggingRef.current) {
        animFrameRef.current = requestAnimationFrame(tick)
      } else {
        animFrameRef.current = null
        lastTimeRef.current = 0
      }
    }

    animFrameRef.current = requestAnimationFrame(tick)
  }, [bounce, duration, angle, drop, inactiveScale, n, loop, items, activeItem])

  // Autoplay
  React.useEffect(() => {
    if (!autoplay || autoplay <= 0 || draggingRef.current) return
    const timer = setInterval(() => {
      const nextIdx = indexAt(targetPosRef.current + 1, n, loop)
      setIndex(nextIdx)
    }, autoplay)
    return () => clearInterval(timer)
  }, [autoplay, n, loop, setIndex])

  // Drag handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    draggingRef.current = true
    dragStartXRef.current = e.clientX
    dragStartPosRef.current = posRef.current
    lastDragXRef.current = e.clientX
    lastDragTimeRef.current = performance.now()
    dragVelocityRef.current = 0
    startAnimation()
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return
    const now = performance.now()
    const dx = e.clientX - dragStartXRef.current
    const containerW = containerRef.current?.clientWidth || 600
    const slideDelta = -dx / (containerW * 0.35)

    const rawPos = dragStartPosRef.current + slideDelta
    posRef.current = loop ? rawPos : rubber(rawPos, n)

    const dt = (now - lastDragTimeRef.current) / 1000
    if (dt > 0.005) {
      const instV = -(e.clientX - lastDragXRef.current) / (containerW * 0.35) / dt
      dragVelocityRef.current = dragVelocityRef.current * 0.6 + instV * 0.4
      lastDragXRef.current = e.clientX
      lastDragTimeRef.current = now
    }
  }

  const handlePointerUp = () => {
    if (!draggingRef.current) return
    draggingRef.current = false
    const target = releaseTarget(posRef.current, dragVelocityRef.current, n, loop)
    setIndex(target)
  }

  const navigatePrev = () => {
    setIndex(indexAt(targetPosRef.current - 1, n, loop))
  }

  const navigateNext = () => {
    setIndex(indexAt(targetPosRef.current + 1, n, loop))
  }

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") navigatePrev()
        if (e.key === "ArrowRight") navigateNext()
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        height,
        background,
        color,
        fontFamily: fontFamily || "inherit",
      }}
      className={`relative w-full overflow-hidden select-none flex flex-col justify-between items-center py-8 ${className}`}
    >
      {/* Slanted Card Cascade Track */}
      <div className="relative w-full flex-1 flex items-center justify-center my-4">
        {items.map((item, idx) => {
          const isFront = indexAt(posRef.current, n, loop) === idx
          return (
            <div
              key={idx}
              ref={(el) => { cardRefs.current[idx] = el }}
              onClick={(e) => {
                e.stopPropagation()
                if (isFront) {
                  onSelect?.(item, idx)
                } else {
                  setIndex(idx)
                }
              }}
              style={{
                width: slideSize,
                height: slideSize,
                borderRadius: `${radius}px`,
              }}
              className="absolute cursor-pointer overflow-hidden border border-white/20 shadow-2xl transition-shadow duration-300 bg-neutral-900 group"
            >
              {item.src ? (
                <img
                  src={item.src}
                  alt={item.alt || item.title}
                  draggable={false}
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-950 flex items-center justify-center p-6 text-center">
                  <span className="font-display text-lg font-semibold">
                    {item.title}
                  </span>
                </div>
              )}
              {/* Soft overlay gradient for depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
            </div>
          )
        })}
      </div>

      {/* White Geometric Brand Logo Below Cards */}
      <div className="z-20 my-4 flex items-center justify-center pointer-events-none">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 256 256"
          fill="none"
          aria-label="Brand Emblem"
          className="w-10 h-10 drop-shadow-[0_4px_16px_rgba(255,255,255,0.2)]"
        >
          <path
            d="M 128 192 L 128 256 L 64.5 256 L 32 223 L 0 192 L 0 128 L 64 128 Z M 256 192 L 256 256 L 192.5 256 L 160 223 L 128 192 L 128 128 L 192 128 Z M 128 64 L 128 128 L 64.5 128 L 32 95 L 0 64 L 0 0 L 64 0 Z M 256 64 L 256 128 L 192.5 128 L 160 95 L 128 64 L 128 0 L 192 0 Z"
            fill="#FFFFFF"
          />
        </svg>
      </div>

      {/* Prev / Dots / Next Controls Pill */}
      {controls && (
        <div className="z-20 flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/15 shadow-xl">
          <button
            type="button"
            onClick={navigatePrev}
            aria-label="Previous dress"
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors cursor-pointer active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 px-2">
            {items.map((_, dotIdx) => {
              const active = indexAt(currentIndex, n, loop) === dotIdx
              return (
                <button
                  key={dotIdx}
                  type="button"
                  onClick={() => setIndex(dotIdx)}
                  aria-label={`Go to dress ${dotIdx + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    active ? "w-6 bg-white" : "w-2 bg-white/30 hover:bg-white/60"
                  }`}
                />
              )
            })}
          </div>

          <button
            type="button"
            onClick={navigateNext}
            aria-label="Next dress"
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors cursor-pointer active:scale-95"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
