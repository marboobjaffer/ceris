import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ShoppingBag, Search, Check, Sparkles, ArrowDown, SlidersHorizontal, Eye, Sun, Moon, Home, Ruler, Layers } from 'lucide-react';
import ScrollExpand from './components/ScrollExpand';
import RotatingText from './components/RotatingText';
import JellyRadio from './components/JellyRadio';
import SpecularButton from './components/SpecularButton';
import GlimmerWrap from './components/GlimmerWrap';
import ScrollReveal from './components/ScrollReveal';
import Dock from './components/Dock';
import ShinyText from './components/ShinyText';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  DRESS_CATALOG,
  HERO_EDITORIAL_IMAGE,
  DressCategory,
  DressProduct,
  DressSize,
} from './data/dresses';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer, CartItem } from './components/CartDrawer';

const CATEGORIES: DressCategory[] = [
  'All',
  'Corset Gowns',
  'Chantilly Lace',
  'Silk & Bias',
  'Avant-Garde',
];

const SIZES: DressSize[] = ['XS', 'S', 'M', 'L', 'XL'];

export function App() {
  // Light / Dark Mode state (defaults to dark mode, toggles between dark and light)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Loading screen animation state
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoading) return;
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [isLoading]);

  // Cart state with 1 initial signature dress so the user can test checkout immediately or modify bag
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      dress: DRESS_CATALOG[0],
      size: 'S',
      hemOption: 'Standard Atelier Length',
      quantity: 1,
    },
  ]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Filter, Search & Sort states
  const [selectedCategory, setSelectedCategory] = useState<DressCategory>('All');
  const [activeNavSection, setActiveNavSection] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');

  // Per-card selected size state
  const [cardSizes, setCardSizes] = useState<Record<string, DressSize>>({
    'rr-01-velvet-sovereign': 'S',
    'rr-02-vesper-chantilly': 'S',
    'rr-03-nocturne-bias-slip': 'M',
    'rr-04-ravenna-organza-midi': 'S',
    'rr-05-carmilla-rust-brocade': 'M',
    'rr-06-monolith-draped-column': 'S',
  });

  // Quick-add feedback state per dress ID
  const [addedCardId, setAddedCardId] = useState<string | null>(null);

  // Active dress for Product Detail Modal (Contiguous Purchase Module)
  const [activeDressModal, setActiveDressModal] = useState<DressProduct | null>(null);

  // Image fallback state tracker
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  // Interactive Bespoke Size Calculator state
  const [waistCm, setWaistCm] = useState<number>(66);
  const [bustCm, setBustCm] = useState<number>(86);
  const [appliedFitBanner, setAppliedFitBanner] = useState<string | null>(null);

  const recommendedSize: DressSize = useMemo(() => {
    if (waistCm <= 62 && bustCm <= 83) return 'XS';
    if (waistCm <= 68 && bustCm <= 88) return 'S';
    if (waistCm <= 74 && bustCm <= 94) return 'M';
    if (waistCm <= 81 && bustCm <= 101) return 'L';
    return 'XL';
  }, [waistCm, bustCm]);

  const applyRecommendedSizeToAll = () => {
    const updated: Record<string, DressSize> = {};
    DRESS_CATALOG.forEach((d) => {
      updated[d.id] = recommendedSize;
    });
    setCardSizes(updated);
    setAppliedFitBanner(`Size ${recommendedSize} applied across all dresses in the catalog.`);
    setTimeout(() => setAppliedFitBanner(null), 3500);
  };

  const totalBagCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  const filteredDresses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = DRESS_CATALOG.filter((dress) => {
      const matchesCat =
        selectedCategory === 'All' || dress.category === selectedCategory;
      const matchesQuery =
        !q ||
        dress.name.toLowerCase().includes(q) ||
        dress.fabric.toLowerCase().includes(q) ||
        dress.silhouette.toLowerCase().includes(q) ||
        dress.category.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });

    if (sortBy === 'price-asc') {
      return [...list].sort((a, b) => a.price - b.price);
    }
    if (sortBy === 'price-desc') {
      return [...list].sort((a, b) => b.price - a.price);
    }
    return list;
  }, [selectedCategory, searchQuery, sortBy]);

  const handleAddToCart = (
    dress: DressProduct,
    size: DressSize,
    hemOption = 'Standard Atelier Length'
  ) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.dress.id === dress.id &&
          item.size === size &&
          item.hemOption === hemOption
      );
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + 1,
        };
        return next;
      }
      return [...prev, { dress, size, hemOption, quantity: 1 }];
    });
  };

  const handleQuickAddFromCard = (dress: DressProduct) => {
    const chosenSize = cardSizes[dress.id] || 'S';
    handleAddToCart(dress, chosenSize, 'Standard Atelier Length');
    setAddedCardId(dress.id);
    setTimeout(() => {
      setAddedCardId((prev) => (prev === dress.id ? null : prev));
    }, 1300);
  };

  const handleUpdateQuantity = (
    dressId: string,
    size: DressSize,
    hemOption: string,
    delta: number
  ) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (
            item.dress.id === dressId &&
            item.size === size &&
            item.hemOption === hemOption
          ) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (
    dressId: string,
    size: DressSize,
    hemOption: string
  ) => {
    setCartItems((prev) =>
      prev.filter(
        (item) =>
          !(
            item.dress.id === dressId &&
            item.size === size &&
            item.hemOption === hemOption
          )
      )
    );
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const [isPastLanding, setIsPastLanding] = useState(false);
  const programmaticScrollRef = useRef(false);
  const scrollTimeoutRef = useRef<number | null>(null);
  const lenisRef = useRef<Lenis | null>(null);

  // Initialize Lenis smooth scroll across the entire website and sync with GSAP ScrollTrigger
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });

    lenisRef.current = lenis;
    lenis.on('scroll', ScrollTrigger.update);

    const updateLenis = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(updateLenis);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const scrollToTop = () => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { duration: 1.2 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToSection = (id: string) => {
    setActiveNavSection(id);
    programmaticScrollRef.current = true;
    if (scrollTimeoutRef.current) {
      window.clearTimeout(scrollTimeoutRef.current);
    }
    const el = document.getElementById(id);
    if (el) {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(el, { offset: -64, duration: 1.25 });
      } else {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
    scrollTimeoutRef.current = window.setTimeout(() => {
      programmaticScrollRef.current = false;
    }, 1300);
  };

  useEffect(() => {
    const sectionIds = ['collection', 'bespoke-fit', 'atelier-craft'];

    const handleScroll = () => {
      const pastLandingThreshold = window.innerHeight * 1.15;
      const pastLanding = window.scrollY > pastLandingThreshold;
      setIsPastLanding((prev) => (prev !== pastLanding ? pastLanding : prev));

      if (programmaticScrollRef.current) return;

      const triggerLine = window.innerHeight * 0.42;
      const nearBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 80;

      if (nearBottom) {
        setActiveNavSection('atelier-craft');
        return;
      }

      let currentSection = '';
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= triggerLine) {
            currentSection = id;
          }
        }
      }
      setActiveNavSection((prev) => (prev !== currentSection ? currentSection : prev));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      data-theme={theme}
      className="theme-root min-h-screen bg-[#0B0B0C] text-[#F4F3EF] flex flex-col transition-colors duration-300"
    >
      {/* Full-Screen Black Loading Animation with White "RUST" and Dark Maroon Rectangle "& RAVEN" */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="rust-raven-loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => setIsLoading(false)}
            className="fixed inset-0 z-50 bg-black flex items-center justify-center px-6 cursor-pointer select-none"
          >
            <div className="flex items-center justify-center gap-3 sm:gap-4 text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white">
              <span className="text-white">RUST</span>
              <RotatingText
                texts={['& RAVEN']}
                highlight={true}
                highlightColor="#5A1218"
                effect="slide"
                direction="up"
                animatePresenceInitial={true}
                staggerDuration={0.035}
                staggerFrom="first"
                loop={false}
                auto={false}
                mainClassName="text-white font-bold"
                style={{ color: '#ffffff' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Bar Contract — slides up and disappears once scrolled past the landing page */}
      <header
        className={`fixed top-0 inset-x-0 z-40 flex items-center justify-between gap-8 px-6 md:px-12 py-4 bg-[#0B0B0C]/70 backdrop-blur-md border-b border-white/[0.08] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isPastLanding
            ? '-translate-y-full opacity-0 pointer-events-none'
            : 'translate-y-0 opacity-100'
        }`}
      >
        {/* Left Zone: Single Text Element Brand Logo Wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setActiveNavSection('');
            scrollToTop();
            setIsLoading(true);
          }}
          className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-[#F4F3EF] whitespace-nowrap shrink-0"
        >
          Rust &amp; Raven
        </a>

        {/* Center Zone: Concise Single-Line Navigation Links with JellyRadio effect */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center"
        >
          <JellyRadio
            ariaLabel="Primary Navigation"
            size="sm"
            chipColor="rgba(255, 255, 255, 0.06)"
            items={[
              { value: 'collection', label: 'Dresses' },
              { value: 'bespoke-fit', label: 'Bespoke Sizing' },
              { value: 'atelier-craft', label: 'Textiles' },
            ]}
            value={activeNavSection}
            allowReselect={true}
            onChange={(val) => {
              setActiveNavSection(val);
              scrollToSection(val);
            }}
          />
        </nav>

        {/* Right Zone: Feature Button with SpecularButton Effect */}
        <div className="flex items-center shrink-0">

          <SpecularButton
            size="sm"
            radius={10}
            blur={12}
            tint={theme === 'dark' ? '#ffffff' : '#121215'}
            tintOpacity={0.06}
            lineColor={theme === 'dark' ? '#ffffff' : '#8C2D2D'}
            textColor={theme === 'dark' ? '#F4F3EF' : '#121215'}
            onClick={() => setIsCartOpen(true)}
            className="px-4 py-2 text-xs font-medium text-[#F4F3EF] flex items-center gap-2.5 whitespace-nowrap shrink-0"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-zinc-200" />
            <span>Atelier Bag</span>
            <span aria-hidden="true" className="text-zinc-500">·</span>
            <span className="font-mono tabular-nums text-zinc-100">{totalBagCount}</span>
          </SpecularButton>
        </div>
      </header>

      {/* Floating Interactive Dock at Top — presents after scrolling past the landing page */}
      <Dock
        visible={isPastLanding && !isLoading}
        theme={theme}
        items={[
          {
            id: 'collection',
            label: 'Dresses',
            active: activeNavSection === 'collection',
            onClick: () => scrollToSection('collection'),
          },
          {
            id: 'bespoke-fit',
            label: 'Bespoke Sizing',
            active: activeNavSection === 'bespoke-fit',
            onClick: () => scrollToSection('bespoke-fit'),
          },
          {
            id: 'atelier-craft',
            label: 'Textiles',
            active: activeNavSection === 'atelier-craft',
            onClick: () => scrollToSection('atelier-craft'),
          },
        ]}
      />

      {/* Main Content */}
      <main id="top" className="flex-1">
        {/* Section 1: ScrollExpand Loading / Hero Section with "Rust & Raven" */}
        <section aria-label="Rust & Raven Editorial Showcase" className="relative">
          <ScrollExpand
            src={HERO_EDITORIAL_IMAGE}
            mediaType="image"
            alt="Rust & Raven Gothic Couture Gown in Basalt Hall"
            title="Rust & Raven"
            scrollHint="Scroll to expand · Autumn / Winter 2026"
            startWidth={42}
            startHeight={58}
            startRadius={24}
            endRadius={0}
            mediaZoom={1.35}
            scrollDistance={1.05}
            holdDistance={1.45}
            smoothing={0.1}
            overlayScrim={0.55}
            useWindowScroll={true}
          >
            {/* Minimal & Clean Hero Content revealed inside the expanded frame */}
            <div className="max-w-2xl mx-auto px-6 flex flex-col items-center text-center">
              <div className="flex items-center gap-2 text-xs tracking-widest uppercase text-zinc-300 mb-4">
                <span>Autumn / Winter 2026</span>
                <span aria-hidden="true">·</span>
                <span>Milan &amp; Calais Atelier</span>
              </div>

              <h1
                className="font-display text-4xl sm:text-5xl md:text-6xl font-normal text-[#F4F3EF] tracking-tight leading-[1.08]"
                style={{ textWrap: 'balance' }}
              >
                Architectural Goth Dresses in Obsidian Silk &amp; Lace
              </h1>

              <p className="mt-5 text-sm md:text-base text-zinc-300 max-w-lg leading-relaxed">
                Minimalist dark couture crafted from silk-backed crushed velvet, French Leavers lace, and spiral steel corsetry.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4 pointer-events-auto">
                <button
                  type="button"
                  onClick={() => scrollToSection('collection')}
                  className="py-3 px-7 rounded-full bg-[#F4F3EF] text-[#0B0B0C] text-xs font-semibold tracking-wide hover:bg-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  Shop Dresses
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection('bespoke-fit')}
                  className="py-3 px-6 rounded-full backdrop-blur-xl bg-white/[0.08] border border-white/25 shadow-[inset_0_1px_1px_rgba(255,255,255,0.38),inset_0_-2px_6px_rgba(255,255,255,0.1),0_8px_24px_rgba(0,0,0,0.35)] text-xs font-medium text-[#F4F3EF] hover:bg-white/[0.15] hover:border-white/40 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0"
                >
                  Find Your Atelier Size
                </button>
              </div>
            </div>
          </ScrollExpand>

          {/* GlimmerWrap Animation: sweeps in from the right side to cover the landing page with centered ScrollReveal quote before the Dresses section */}
          <GlimmerWrap theme={theme}>
            <ScrollReveal
              baseOpacity={0.12}
              enableBlur={true}
              baseRotation={3}
              blurStrength={5}
              containerClassName="my-0 text-center mx-auto max-w-4xl"
              textClassName="font-display text-[#F4F3EF] tracking-tight font-normal text-center !text-2xl sm:!text-3xl md:!text-4xl !leading-relaxed"
            >
              In the hush of midnight, we find our truest selves. Our designs are made for those who wear black like armor and beauty like rebellion. Every stitch, every shadow, every ruffle of lace is a reminder that you were never meant to blend in. Step into the dark, and let your style speak louder than the light.
            </ScrollReveal>
          </GlimmerWrap>
        </section>

        {/* Section 2: Featured Goth Dress Collection Grid */}
        <section
          id="collection"
          className="scroll-mt-20 max-w-[1280px] mx-auto px-6 md:px-12 py-20 md:py-24"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 text-xs text-zinc-400 uppercase tracking-wider">
                <span>01. Online Boutique</span>
                <span aria-hidden="true">·</span>
                <span>Ready-to-Wear &amp; Made-to-Measure</span>
              </div>
              <h2
                className="font-display text-3xl md:text-4xl font-normal text-[#F4F3EF] mt-2"
                style={{ textWrap: 'balance' }}
              >
                <ShinyText
                  color={theme === 'dark' ? '#b5b5b5' : '#52525b'}
                  shineColor={theme === 'dark' ? '#ffffff' : '#121215'}
                  speed={2}
                >
                  Goth Dresses &amp; Evening Gowns
                </ShinyText>
              </h2>
            </div>

            {/* Search & Sort Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search velvet, lace, corset..."
                  aria-label="Search goth dresses"
                  className="pl-9 pr-4 py-2 rounded-lg bg-[#141417] border border-white/10 text-xs text-[#F4F3EF] placeholder:text-zinc-500 focus:outline-none focus:border-white/30 w-56"
                />
              </div>

              <div className="flex items-center gap-2 bg-[#141417] border border-white/10 rounded-lg px-3 py-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <label htmlFor="sort-select" className="sr-only">
                  Sort dresses
                </label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as 'featured' | 'price-asc' | 'price-desc')
                  }
                  className="bg-transparent text-xs text-zinc-200 focus:outline-none cursor-pointer"
                >
                  <option value="featured" className="bg-[#141417]">
                    Sort: Atelier Featured
                  </option>
                  <option value="price-asc" className="bg-[#141417]">
                    Price: Low to High
                  </option>
                  <option value="price-desc" className="bg-[#141417]">
                    Price: High to Low
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* Interactive Category Filter Bar with JellyRadio effect */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <JellyRadio
              ariaLabel="Dress Categories"
              size="md"
              items={CATEGORIES.map((category) => ({
                value: category,
                label: category === 'All' ? 'All Dresses' : category,
              }))}
              value={selectedCategory}
              onChange={(val) => setSelectedCategory(val as DressCategory)}
            />
          </div>

          {appliedFitBanner && (
            <div className="mt-6 p-3.5 rounded-lg bg-[#8C2D2D]/20 border border-[#8C2D2D]/50 text-xs text-zinc-200 flex items-center justify-between">
              <span>{appliedFitBanner}</span>
              <button
                type="button"
                onClick={() => setAppliedFitBanner(null)}
                className="text-xs underline text-zinc-300 hover:text-white cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* 3-Column Product Grid */}
          {filteredDresses.length === 0 ? (
            <div className="py-20 text-center border border-white/[0.06] rounded-xl mt-8 bg-[#111113]">
              <p className="font-display text-2xl text-zinc-300">
                No dresses match your current filter
              </p>
              <p className="text-xs text-zinc-500 mt-2">
                Try clearing your search query or switching back to All Dresses.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
                className="mt-5 py-2 px-4 rounded-lg bg-white/10 text-xs font-medium text-white hover:bg-white/15 transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredDresses.map((dress) => {
                const selectedSize = cardSizes[dress.id] || 'S';
                const isJustAdded = addedCardId === dress.id;
                const isImgBroken = brokenImages[dress.id];

                return (
                  <article
                    key={dress.id}
                    className="group bg-[#121215] border border-white/[0.08] rounded-xl overflow-hidden flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5 hover:border-white/20"
                  >
                    <div>
                      {/* 3:4 Product Image Container */}
                      <div
                        onClick={() => setActiveDressModal(dress)}
                        className="relative aspect-[3/4] w-full bg-[#18181B] overflow-hidden cursor-pointer"
                      >
                        {!isImgBroken ? (
                          <img
                            src={dress.image}
                            alt={dress.name}
                            referrerPolicy="no-referrer"
                            onError={() =>
                              setBrokenImages((prev) => ({ ...prev, [dress.id]: true }))
                            }
                            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[#1C1B20] to-[#121215]">
                            <span className="font-display text-xl text-zinc-300">
                              {dress.name}
                            </span>
                            <span className="text-xs text-zinc-500 mt-1">
                              {dress.fabric}
                            </span>
                          </div>
                        )}

                        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-end">
                          <span className="inline-flex items-center gap-1.5 text-xs text-zinc-200 bg-black/70 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-md">
                            <Eye className="w-3.5 h-3.5" />
                            Inspect Garment
                          </span>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-6">
                        {/* Unboxed Metadata with middot separators (Zero Pills) */}
                        <div className="flex items-center gap-2 text-xs text-zinc-400 uppercase tracking-wider">
                          <span>{dress.category}</span>
                          <span aria-hidden="true">·</span>
                          <span className="truncate">{dress.fabric}</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-[#C87D7D] shrink-0">
                            {dress.availability}
                          </span>
                        </div>

                        {/* Title & Tabular Price */}
                        <div className="mt-2.5 flex items-baseline justify-between gap-4">
                          <h3
                            onClick={() => setActiveDressModal(dress)}
                            className="text-base font-semibold text-[#F4F3EF] group-hover:text-white cursor-pointer leading-snug"
                          >
                            {dress.name}
                          </h3>
                          <span className="font-mono text-[15px] font-medium text-[#F4F3EF] tabular-nums shrink-0">
                            ${dress.price.toLocaleString()}
                          </span>
                        </div>

                        <p className="mt-1.5 text-xs text-zinc-400">
                          {dress.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Interactive Size Selector & Add to Bag Footer */}
                    <div className="px-6 pb-6 pt-3 border-t border-white/[0.06] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] uppercase tracking-wider text-zinc-500">
                          Size
                        </span>
                        <div className="flex items-center gap-1">
                          {SIZES.map((sz) => (
                            <button
                              key={sz}
                              type="button"
                              onClick={() =>
                                setCardSizes((prev) => ({ ...prev, [dress.id]: sz }))
                              }
                              className={`w-7 h-7 rounded text-[11px] font-mono transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                                selectedSize === sz
                                  ? 'bg-[#F4F3EF] text-[#0B0B0C] font-semibold'
                                  : 'bg-white/[0.03] text-zinc-400 hover:text-white border border-white/10'
                              }`}
                            >
                              {sz}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-5 gap-2">
                        <button
                          type="button"
                          onClick={() => handleQuickAddFromCard(dress)}
                          className={`col-span-4 py-2.5 px-4 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                            isJustAdded
                              ? 'bg-emerald-900/80 text-emerald-100 border border-emerald-500/40'
                              : 'bg-[#8C2D2D] hover:bg-[#A13535] text-white'
                          }`}
                        >
                          {isJustAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Added ({selectedSize})</span>
                            </>
                          ) : (
                            <span>Add to Bag · {selectedSize}</span>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveDressModal(dress)}
                          aria-label={`View specifications for ${dress.name}`}
                          className="col-span-1 py-2.5 px-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-xs text-zinc-300 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Section 3: Bespoke Sizing Calculator */}
        <section
          id="bespoke-fit"
          className="scroll-mt-20 border-t border-white/[0.08] bg-[#0E0E11] py-20 md:py-24"
        >
          <div className="max-w-[1280px] mx-auto px-6 md:px-12">
            <div className="bg-[#131317] border border-white/10 rounded-xl p-8 md:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                <div className="lg:col-span-5">
                  <div className="flex items-center gap-2 text-xs text-zinc-400 uppercase tracking-wider">
                    <span>02. Precision Corsetry Fit</span>
                    <span aria-hidden="true">·</span>
                    <span>Interactive Atelier Measure</span>
                  </div>

                  <h2 className="font-display text-3xl md:text-4xl font-normal text-[#F4F3EF] mt-2">
                    Calculate Your Atelier Dress Size
                  </h2>

                  <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
                    Our spiral steel-boned bodices and bias-cut silk gowns are graded to natural anatomical measurements. Adjust your waist and bust dimensions to pre-select your fit across the boutique.
                  </p>

                  <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-xs text-zinc-400 block">
                        Recommended Rust &amp; Raven Size
                      </span>
                      <div className="flex items-baseline gap-3 mt-1">
                        <span className="font-display text-3xl font-semibold text-[#F4F3EF]">
                          Size {recommendedSize}
                        </span>
                        <span className="text-xs text-zinc-400 font-sans tabular-nums">
                          (Lacing allowance ±4 cm)
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={applyRecommendedSizeToAll}
                      className="py-3 px-5 rounded-lg bg-[#F4F3EF] text-[#0B0B0C] text-xs font-semibold hover:bg-white transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Apply Size {recommendedSize} to Catalog</span>
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-7 space-y-6 lg:pl-8 lg:border-l lg:border-white/10">
                  <div>
                    <div className="flex justify-between text-xs mb-2">
                      <label htmlFor="waist-range" className="text-zinc-300 font-medium">
                        Natural Waist Circumference
                      </label>
                      <span className="font-mono tabular-nums text-[#F4F3EF]">
                        {waistCm} cm ({(waistCm / 2.54).toFixed(1)} in)
                      </span>
                    </div>
                    <input
                      id="waist-range"
                      type="range"
                      min={56}
                      max={94}
                      value={waistCm}
                      onChange={(e) => setWaistCm(Number(e.target.value))}
                      className="w-full accent-[#8C2D2D] cursor-pointer"
                    />
                    <div className="flex justify-between text-[11px] font-sans text-zinc-500 mt-1 tabular-nums">
                      <span>56 cm</span>
                      <span>75 cm</span>
                      <span>94 cm</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-2">
                      <label htmlFor="bust-range" className="text-zinc-300 font-medium">
                        Full Bust Circumference
                      </label>
                      <span className="font-mono tabular-nums text-[#F4F3EF]">
                        {bustCm} cm ({(bustCm / 2.54).toFixed(1)} in)
                      </span>
                    </div>
                    <input
                      id="bust-range"
                      type="range"
                      min={76}
                      max={112}
                      value={bustCm}
                      onChange={(e) => setBustCm(Number(e.target.value))}
                      className="w-full accent-[#8C2D2D] cursor-pointer"
                    />
                    <div className="flex justify-between text-[11px] font-sans text-zinc-500 mt-1 tabular-nums">
                      <span>76 cm</span>
                      <span>94 cm</span>
                      <span>112 cm</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Textiles & Material Provenance */}
        <section
          id="atelier-craft"
          className="scroll-mt-20 border-y border-white/[0.08] bg-[#0B0B0C] py-20 md:py-24"
        >
          <div className="max-w-[1280px] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <SpecularButton
              as="div"
              radius={12}
              tint="#131317"
              tintOpacity={0.95}
              proximity={360}
              className="lg:col-span-7 p-8 md:p-10"
            >
              <div>
                <div className="flex items-center gap-2 text-xs text-zinc-400 uppercase tracking-wider">
                  <span>03. Material Provenance</span>
                  <span aria-hidden="true">·</span>
                  <span>Zero Synthetic Lace Policy</span>
                </div>

                <h3 className="font-display text-2xl md:text-3xl font-normal text-[#F4F3EF] mt-2">
                  Engineered for Structure, Movement, and Longevity
                </h3>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-white/10">
                <div>
                  <div className="font-mono text-xl text-[#F4F3EF] tabular-nums">
                    340 gsm
                  </div>
                  <div className="text-xs font-medium text-zinc-200 mt-1">
                    Silk-Backed Crushed Velvet
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    Woven in northern Italy with a dense mulberry silk pile that absorbs ambient light for deep chiaroscuro drape.
                  </p>
                </div>

                <div>
                  <div className="font-mono text-xl text-[#F4F3EF] tabular-nums">
                    18-Panel
                  </div>
                  <div className="text-xs font-medium text-zinc-200 mt-1">
                    Spiral Steel Corsetry
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    Flexible orthopedic-grade spiral steel boning channels that move with the ribcage without creasing or buckling.
                  </p>
                </div>
              </div>
            </SpecularButton>

            {/* Claim-to-Proof Adjacent Attributable Testimonial */}
            <SpecularButton
              as="div"
              id="client-archive"
              radius={12}
              tint="#131317"
              tintOpacity={0.95}
              proximity={360}
              className="lg:col-span-5 p-8 md:p-10"
            >
              <div>
                <div className="flex items-center gap-2 text-xs text-zinc-400 uppercase tracking-wider mb-3">
                  <span>Client Dossier</span>
                  <span aria-hidden="true">·</span>
                  <span>Verified Atelier Patron</span>
                </div>
                <blockquote className="font-display text-xl md:text-2xl italic text-zinc-200 leading-relaxed">
                  “Before discovering Rust &amp; Raven, every gothic gown I ordered online used stiff polyester lace that tore after two recitals. The Sovereign Velvet Corset Gown held its exact waist structure through a 14-city European cello tour with zero boning distortion.”
                </blockquote>
              </div>
              <div className="mt-6 pt-4 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400">
                <span className="text-zinc-200 font-medium">
                  Clara Vonnegut — Principal Cellist, Vienna Chamber Ensemble
                </span>
              </div>
            </SpecularButton>
          </div>
        </section>
      </main>

      {/* Architectural Footer with AI-Generated Logos & Navigation Links */}
      <footer className="bg-[#0B0B0C] border-t border-white/[0.08] py-16 px-6 md:px-12">
        <div className="max-w-[1280px] mx-auto space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
            {/* Brand Column + AI-Generated House Crest */}
            <div className="md:col-span-5 space-y-4">
              <a
                href="#top"
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-4 group"
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/15 bg-black shrink-0">
                  <img
                    src="/src/assets/images/logo_rust_raven_crest_1793261097583.jpg"
                    alt="Rust & Raven Couture Crest"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div>
                  <span className="font-display text-2xl md:text-3xl text-[#F4F3EF] block leading-none">
                    Rust &amp; Raven
                  </span>
                  <span className="text-xs text-zinc-500 mt-1 block">
                    Milan · Calais · Nocturne Couture House
                  </span>
                </div>
              </a>
              <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
                Architectural gothic eveningwear and spiral-boned corsetry crafted from Italian crushed silk velvet and authentic French Leavers lace.
              </p>
            </div>

            {/* Dress Silhouette Links */}
            <div className="md:col-span-3 space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Dress Silhouettes
              </h4>
              <ul className="space-y-2 text-xs text-zinc-400">
                {CATEGORIES.map((category) => (
                  <li key={category}>
                    <a
                      href="#collection"
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedCategory(category);
                        scrollToSection('collection');
                      }}
                      className="hover:text-white transition-colors inline-block"
                    >
                      {category === 'All' ? 'All Goth Dresses' : category}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Atelier Navigation Links */}
            <div className="md:col-span-4 space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Atelier &amp; Client Services
              </h4>
              <ul className="space-y-2 text-xs text-zinc-400">
                <li>
                  <a
                    href="#collection"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection('collection');
                    }}
                    className="hover:text-white transition-colors inline-block"
                  >
                    Autumn / Winter 2026 Collection
                  </a>
                </li>
                <li>
                  <a
                    href="#bespoke-fit"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection('bespoke-fit');
                    }}
                    className="hover:text-white transition-colors inline-block"
                  >
                    Bespoke Corsetry &amp; Sizing Calculator
                  </a>
                </li>
                <li>
                  <a
                    href="#atelier-craft"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection('atelier-craft');
                    }}
                    className="hover:text-white transition-colors inline-block"
                  >
                    Textiles &amp; Material Provenance
                  </a>
                </li>
                <li>
                  <a
                    href="#client-archive"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection('atelier-craft');
                    }}
                    className="hover:text-white transition-colors inline-block"
                  >
                    Verified Patron Dossier
                  </a>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setIsCartOpen(true)}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Atelier Shopping Bag ({totalBagCount})
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Certified Atelier Hallmarks & Logos Row */}
          <div className="pt-8 border-t border-white/[0.08] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-6">
              <a
                href="#atelier-craft"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('atelier-craft');
                }}
                className="flex items-center gap-3 group"
              >
                <div className="w-11 h-11 rounded-lg overflow-hidden border border-white/15 bg-black shrink-0">
                  <img
                    src="/src/assets/images/logo_calais_lace_guild_1793261097636.jpg"
                    alt="Calais French Lace Guild Seal"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="text-xs">
                  <span className="text-zinc-200 font-medium block group-hover:text-white transition-colors">
                    Calais-Caudry Lace Seal
                  </span>
                  <span className="text-zinc-500">Certified Leavers Looms</span>
                </div>
              </a>

              <a
                href="#bespoke-fit"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('bespoke-fit');
                }}
                className="flex items-center gap-3 group"
              >
                <div className="w-11 h-11 rounded-lg overflow-hidden border border-white/15 bg-black shrink-0">
                  <img
                    src="/src/assets/images/logo_milan_corsetry_seal_1793261099139.jpg"
                    alt="Milan Atelier Corsetry Seal"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="text-xs">
                  <span className="text-zinc-200 font-medium block group-hover:text-white transition-colors">
                    Milan Corsetry Guild
                  </span>
                  <span className="text-zinc-500">18-Panel Spiral Steel Standard</span>
                </div>
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500">
              <span>© {new Date().getFullYear()} Rust &amp; Raven Atelier S.r.l. All rights reserved.</span>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  setIsLoading(true);
                }}
                className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                Replay Intro
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Light & Dark Mode Button Bar Below Footer with Equal Spacing */}
      <div
        className={`w-full py-8 px-6 md:px-12 border-t flex items-center justify-center transition-colors duration-300 ${
          theme === 'dark'
            ? 'bg-[#0B0B0C] border-white/[0.08]'
            : 'bg-[#F6F4EF] border-black/10'
        }`}
      >
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className={`px-6 py-3 rounded-full backdrop-blur-xl text-xs font-medium inline-flex items-center justify-center gap-3 border hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 ${
            theme === 'dark'
              ? 'bg-white/[0.08] border-white/25 shadow-[inset_0_1px_1px_rgba(255,255,255,0.42),inset_0_-2px_6px_rgba(255,255,255,0.12),0_8px_24px_rgba(0,0,0,0.38)] text-[#F4F3EF] hover:bg-white/[0.15] hover:border-white/40'
              : 'bg-white/65 border-black/15 shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),inset_0_-2px_6px_rgba(18,18,21,0.06),0_8px_24px_rgba(18,18,21,0.12)] text-[#121215] hover:bg-white/85 hover:border-black/25'
          }`}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-200" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-zinc-800" />
              <span>Dark Mode</span>
            </>
          )}
        </button>
      </div>

      {/* Contiguous Purchase Module (Product Detail Modal) */}
      <ProductDetailModal
        dress={activeDressModal}
        initialSize={activeDressModal ? cardSizes[activeDressModal.id] || 'S' : 'S'}
        onClose={() => setActiveDressModal(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Slide-Over Shopping Bag & Checkout Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        items={cartItems}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />
    </div>
  );
}

export default App;
