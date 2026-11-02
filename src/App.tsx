import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ShoppingBag, Search, Check, Sparkles, ArrowDown, SlidersHorizontal, Eye, Sun, Moon, Home, Ruler, Layers, ChevronDown } from 'lucide-react';
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
import { TiltCascadeCarousel, TiltCascadeItem } from './components/TiltCascadeCarousel';
import { AnimatedThemeToggle } from './components/ui/animated-theme-toggle';
import FaqSection, { FaqSectionData } from './components/ui/habit-faq-scroller';
import { CanvasText } from './components/ui/canvas-text';

const CATEGORIES: DressCategory[] = [
  'All',
  'Corset Gowns',
  'Chantilly Lace',
  'Silk & Bias',
  'Avant-Garde',
];

const SIZES: DressSize[] = ['XS', 'S', 'M', 'L', 'XL'];

const GOTHIC_FASHION_FAQ_DATA: FaqSectionData = {
  mainTitle: 'FAQS',
  rows: [
    {
      id: 'row1',
      speed: '60s',
      direction: 'left',
      faqItems: [
        {
          id: 'q1',
          question: 'Are the corset dresses comfortable to wear?',
          answer:
            'Yes. We use flexible steel boning that shapes your waist while letting you move and breathe comfortably.',
        },
        {
          id: 'q2',
          question: 'What fabrics do you use for your goth dresses?',
          answer:
            'All gowns are crafted from genuine French lace, soft crushed velvet, and heavyweight Italian silk.',
        },
        {
          id: 'q3',
          question: 'How do I choose the right dress size?',
          answer:
            'Pick your size based on your waist measurement. The back lacing lets you adjust the fit by up to 2 inches.',
        },
      ],
    },
    {
      id: 'row2',
      speed: '48s',
      direction: 'right',
      faqItems: [
        {
          id: 'q5',
          question: 'How should I wash and care for my gown?',
          answer:
            'Dry clean only. To remove wrinkles, gently steam the dress from the inside—never iron velvet flat.',
        },
        {
          id: 'q6',
          question: 'Can I remove the silver chains before cleaning?',
          answer:
            'Yes, all silver shoulder chains unclip easily with small clasps so you can clean and store the dress safely.',
        },
        {
          id: 'q7',
          question: 'Can I exchange my dress if it doesn’t fit?',
          answer:
            'Yes, we offer free size exchanges and returns within 14 days on all unworn dresses.',
        },
      ],
    },
  ],
};

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
    }, 3200);
    return () => clearTimeout(timer);
  }, [isLoading]);

  const [heroStayActive, setHeroStayActive] = useState(true);
  const [heroScrollProgress, setHeroScrollProgress] = useState(0);

  // 5-second Hero Landing Page stay limit timer -> Locks scrolling so hero section stays presented for 5s, matching the hanging dresses section duration
  useEffect(() => {
    if (isLoading) return;

    setHeroStayActive(true);
    if (lenisRef.current) {
      lenisRef.current.stop();
    }

    const timer = setTimeout(() => {
      setHeroStayActive(false);
      if (lenisRef.current) {
        lenisRef.current.start();
        lenisRef.current.scrollTo(window.innerHeight * 0.95, { duration: 5.0 });
      } else {
        window.scrollTo({ top: window.innerHeight * 0.95, behavior: 'smooth' });
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [isLoading]);

  // Prevent scroll past top while hero stay is active
  useEffect(() => {
    if (!heroStayActive) return;

    const preventScrollAtTop = (e: Event) => {
      if (window.scrollY <= 15) {
        e.preventDefault();
      }
    };

    window.addEventListener('wheel', preventScrollAtTop, { passive: false });
    window.addEventListener('touchmove', preventScrollAtTop, { passive: false });

    return () => {
      window.removeEventListener('wheel', preventScrollAtTop);
      window.removeEventListener('touchmove', preventScrollAtTop);
    };
  }, [heroStayActive]);

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
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
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

  // Size dropdown menu open tracker per card
  const [openSizeDropdownId, setOpenSizeDropdownId] = useState<string | null>(null);

  useEffect(() => {
    if (!openSizeDropdownId) return;
    const handleClickOutside = () => setOpenSizeDropdownId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [openSizeDropdownId]);

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

  const tiltCascadeItems: TiltCascadeItem[] = useMemo(() => {
    return DRESS_CATALOG.map((dress) => ({
      title: dress.name,
      caption: `${dress.subtitle} · $${dress.price.toLocaleString()}`,
      src: dress.image,
      alt: dress.name,
    }));
  }, []);

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
    setHeroStayActive(false);
    if (lenisRef.current) {
      lenisRef.current.start();
    }
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
    const sectionIds = ['collection', 'gothic-faq'];

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
        setActiveNavSection('gothic-faq');
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
      {/* Full-Screen Black Loading Animation with Wensity CanvasText ("RUST & RAVEN") */}
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
            <CanvasText
              text="RUST & RAVEN"
              color="#FFFFFF"
              fontSize={68}
              fontWeight={700}
              particleSize={1.8}
              density={2}
              scatter={52}
              loadDuration={1.0}
              morphDuration={1.35}
              drift={0.35}
              magnetic={0.4}
              className="h-56 w-full max-w-4xl"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Bar Contract — slides up and disappears once scrolled past the landing page */}
      <header
        className={`fixed top-0 inset-x-0 z-40 flex items-center justify-between gap-8 px-6 md:px-12 py-4 bg-[#0B0B0C]/70 backdrop-blur-md border-b border-white/[0.08] transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${
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
            id: 'gothic-faq',
            label: 'FAQ',
            active: activeNavSection === 'gothic-faq',
            onClick: () => scrollToSection('gothic-faq'),
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
            title=""
            scrollHint="Hero page stays 5s · Autumn / Winter 2026"
            startWidth={100}
            startHeight={100}
            startRadius={0}
            endRadius={0}
            mediaZoom={1.05}
            mediaXOffset={0}
            scrollDistance={1.35}
            holdDistance={3.5}
            smoothing={0.28}
            overlayScrim={0.35}
            useWindowScroll={true}
            onProgressChange={setHeroScrollProgress}
            sidePanel={
              <TiltCascadeCarousel
                items={tiltCascadeItems}
                scrollProgress={Math.max(0, Math.min(1, (heroScrollProgress - 0.12) / 0.88))}
                scrollDriven={true}
                height="100%"
                slideSize="clamp(220px, 35vw, 340px)"
                background="#0B0B0C"
                color="#F4F3EF"
                autoplay={0}
                loop={true}
                onSelect={(item) => {
                  const dress = DRESS_CATALOG.find((d) => d.name === item.title);
                  if (dress) setActiveDressModal(dress);
                }}
              />
            }
          >
            {/* Minimal & Clean Hero Content revealed on the left side while the gothic dress model is showcased on the right */}
            <div className="w-full max-w-xl md:max-w-[46%] lg:max-w-xl mr-auto px-4 sm:px-6 flex flex-col items-start text-left">
              <h1
                className="font-display text-3xl sm:text-4xl md:text-[2.75rem] font-bold text-[#F4F3EF] tracking-tight leading-[1.1] max-w-md"
                style={{ textWrap: 'balance' }}
              >
                Architectural Goth Dresses in Obsidian Silk
              </h1>

              <div className="mt-7 flex flex-nowrap items-center justify-start gap-3.5 pointer-events-auto">
                <button
                  type="button"
                  onClick={() => scrollToSection('collection')}
                  className="h-10 px-6 rounded-full bg-[#F4F3EF] text-[#0B0B0C] text-xs font-bold tracking-wide hover:bg-white transition-colors cursor-pointer whitespace-nowrap shrink-0 inline-flex items-center justify-center"
                >
                  Shop Dresses
                </button>
                <SpecularButton
                  size="sm"
                  radius={999}
                  blur={0}
                  autoAnimate={true}
                  speed={0.85}
                  intensity={0.75}
                  thickness={1.6}
                  glow={0}
                  tint="#18181B"
                  tintOpacity={1}
                  lineColor="#A1A1AA"
                  baseColor="#27272A"
                  textColor="#F4F3EF"
                  onClick={() => scrollToSection('collection')}
                  style={{
                    height: '40px',
                    padding: '0 22px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    boxShadow: 'none',
                  }}
                  className="text-xs font-bold tracking-wide whitespace-nowrap shrink-0"
                >
                  Find Your Atelier Size
                </SpecularButton>
              </div>
            </div>
          </ScrollExpand>
        </section>

        {/* Section 2: Featured Goth Dress Collection Grid */}
        <section
          id="collection"
          className="scroll-mt-20 max-w-[1280px] mx-auto px-6 md:px-12 py-20 md:py-24"
        >
          {/* Interactive Category Dropdown & Parallel Filter Bar */}
          <div className="mb-6 relative flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsCategoryDropdownOpen((prev) => !prev)}
              aria-expanded={isCategoryDropdownOpen}
              className="py-2.5 px-5 rounded-full bg-[#18181B] border border-white/20 text-xs font-semibold text-[#F4F3EF] hover:bg-[#222226] hover:border-white/40 transition-all flex items-center gap-2.5 cursor-pointer shadow-lg z-10 shrink-0 active:scale-95"
            >
              <span>
                {selectedCategory === 'All' ? 'All Dresses' : selectedCategory}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-zinc-300 transition-transform duration-300 ${
                  isCategoryDropdownOpen ? 'rotate-180' : 'rotate-0'
                }`}
              />
            </button>

            {/* Parallel Categories Bar revealed on click parallel to All Dresses button */}
            <AnimatePresence>
              {isCategoryDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -16, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -16, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  className="flex items-center gap-2 overflow-x-auto py-1"
                >
                  <JellyRadio
                    ariaLabel="Dress Categories"
                    size="md"
                    items={CATEGORIES.map((category) => ({
                      value: category,
                      label: category === 'All' ? 'All Dresses' : category,
                    }))}
                    value={selectedCategory}
                    onChange={(val) => {
                      setSelectedCategory(val as DressCategory);
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-10 border-b border-white/10">
            <div className="shrink-0">
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-normal text-[#F4F3EF] leading-tight whitespace-nowrap">
                <ShinyText
                  color={theme === 'dark' ? '#b5b5b5' : '#52525b'}
                  shineColor={theme === 'dark' ? '#ffffff' : '#121215'}
                  speed={2}
                  className="whitespace-nowrap"
                >
                  Goth Dresses &amp; Evening Gowns
                </ShinyText>
              </h2>
            </div>

            {/* Search & Sort Controls */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
              <div className="relative shrink-0">
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

              <div className="flex items-center gap-2 bg-[#141417] border border-white/10 rounded-lg px-3 py-2 shrink-0">
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
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8">
              {filteredDresses.map((dress) => {
                const selectedSize = cardSizes[dress.id] || 'S';
                const isJustAdded = addedCardId === dress.id;
                const isImgBroken = brokenImages[dress.id];

                return (
                  <article
                    key={dress.id}
                    className="group bg-[#121215] border border-white/[0.08] rounded-xl relative flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5 hover:border-white/20"
                  >
                    <div>
                      {/* 3:4 Product Image Container */}
                      <div
                        onClick={() => setActiveDressModal(dress)}
                        className="relative aspect-[3/4] w-full bg-[#18181B] overflow-hidden rounded-t-xl cursor-pointer"
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
                        {/* Unboxed Metadata (Zero Pills) */}
                        <div className="flex items-center justify-end gap-2 text-xs text-zinc-400 uppercase tracking-wider">
                          <span className="text-[#C87D7D] shrink-0">
                            {dress.availability}
                          </span>
                        </div>

                        {/* Title & Tabular Price */}
                        <div className="mt-2.5 flex items-baseline justify-between gap-4">
                          <h3
                            onClick={() => setActiveDressModal(dress)}
                            className="text-lg sm:text-xl font-bold tracking-tight text-[#F4F3EF] group-hover:text-white cursor-pointer leading-snug"
                          >
                            {dress.name}
                          </h3>
                          <span className="font-mono text-[15px] font-medium text-[#F4F3EF] tabular-nums shrink-0">
                            ${dress.price.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Add to Bag Footer with small square size button and size dropdown menu */}
                    <div className="px-6 pb-6 pt-3 border-t border-white/[0.06] relative">
                      <div className="flex items-center gap-2 w-full">
                        {/* Main Add to Bag Button */}
                        <button
                          type="button"
                          onClick={() => handleQuickAddFromCard(dress)}
                          className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                            isJustAdded
                              ? 'bg-emerald-900/90 text-emerald-100 border border-emerald-500/50'
                              : 'bg-[#8C2D2D] hover:bg-[#A13535] text-white'
                          }`}
                        >
                          {isJustAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Added ({selectedSize})</span>
                            </>
                          ) : (
                            <span>Add to Atelier Bag</span>
                          )}
                        </button>

                        {/* Small Square Size Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenSizeDropdownId((prev) => (prev === dress.id ? null : dress.id));
                          }}
                          aria-label={`Select size for ${dress.name}. Current: ${selectedSize}`}
                          aria-expanded={openSizeDropdownId === dress.id}
                          className={`w-9 h-9 shrink-0 rounded-lg border text-xs font-sans font-bold flex items-center justify-center gap-0.5 cursor-pointer transition-all ${
                            openSizeDropdownId === dress.id
                              ? 'bg-white text-black border-white shadow-xl scale-105'
                              : 'bg-[#1A1A1E] hover:bg-[#25252B] text-white border-white/20 hover:border-white/40'
                          }`}
                        >
                          <span className="font-sans">{selectedSize}</span>
                          <ChevronDown
                            className={`w-3 h-3 transition-transform duration-200 ${
                              openSizeDropdownId === dress.id ? 'rotate-180 text-black' : 'text-zinc-400'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Floating Size Dropdown Menu Popover */}
                      <AnimatePresence>
                        {openSizeDropdownId === dress.id && (
                          <motion.div
                            initial={{ opacity: 0, y: 6, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 6, scale: 0.95 }}
                            transition={{ duration: 0.16, ease: 'easeOut' }}
                            onClick={(e) => e.stopPropagation()}
                            className="absolute bottom-full right-6 mb-2 w-60 z-50 bg-[#18181C] border border-white/25 rounded-xl p-2 shadow-2xl backdrop-blur-2xl text-left"
                          >
                            <div className="flex flex-col gap-1">
                              {SIZES.map((size) => (
                                <button
                                  key={size}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCardSizes((prev) => ({ ...prev, [dress.id]: size }));
                                    setOpenSizeDropdownId(null);
                                  }}
                                  className={`w-full px-3 py-2 text-xs font-sans rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                                    selectedSize === size
                                      ? 'bg-[#8C2D2D] text-white font-bold shadow-md'
                                      : 'text-zinc-200 hover:bg-white/15 hover:text-white'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5">
                                    <span
                                      className={`w-6 h-6 rounded flex items-center justify-center font-bold text-[11px] border font-sans ${
                                        selectedSize === size
                                          ? 'bg-black/30 border-white/20 text-white'
                                          : 'bg-black/50 border-white/10 text-zinc-300'
                                      }`}
                                    >
                                      {size}
                                    </span>
                                    <span className="font-sans">
                                      {size === 'XS'
                                        ? 'Extra Small (XS)'
                                        : size === 'S'
                                        ? 'Small (S)'
                                        : size === 'M'
                                        ? 'Medium (M)'
                                        : size === 'L'
                                        ? 'Large (L)'
                                        : 'Extra Large (XL)'}
                                    </span>
                                  </div>
                                  {selectedSize === size && (
                                    <Check className="w-3.5 h-3.5 text-white shrink-0" />
                                  )}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Gothic Fashion FAQ Horizontal Scroller Section before Footer */}
        <section
          id="gothic-faq"
          aria-label="Gothic Fashion Frequently Asked Questions"
          className="border-t border-white/[0.08] py-8 overflow-hidden"
        >
          <FaqSection data={GOTHIC_FASHION_FAQ_DATA} />
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
        <AnimatedThemeToggle theme={theme} onToggle={toggleTheme} />
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
