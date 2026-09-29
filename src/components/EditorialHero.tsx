import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef, useCallback } from "react";
import { Shield, Menu, X, ChevronLeft, ChevronRight, Camera, Play, Pause, Type } from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";
import { useSiteAssets, DEFAULT_HERO_SLIDES_TEXT } from "@/hooks/useSiteAssets";
import { getOptimizedCloudinaryUrl } from "@/lib/cloudinary";
import { AdminUploadModal } from "./AdminUploadModal";
import { GoldenNavOrnament } from "./GoldenNavOrnament";
import { HeroTextEditModal } from "./HeroTextEditModal";

const HERO_SLIDES = [
  { desktopSrc: "/her1.jpg", mobileSrc: "/mer1.jpg", alt: "Photography showcase 1" },
  { desktopSrc: "/her2.jpg", mobileSrc: "/mer2.jpg", alt: "Photography showcase 2" },
  { desktopSrc: "/her7.jpg", mobileSrc: "/mer7.jpg", alt: "Photography showcase 3" },
  { desktopSrc: "/her10.jpg", mobileSrc: "/mer8.jpg", alt: "Photography showcase 4" },
];

const SLIDE_DURATION = 5000; // 5 seconds per slide

const SUBTEXT =
  "There is no such thing as a perfect love story or a perfect wedding.  For exactly this reason, we love doing what we do.";

const NAV_LINKS = [
  { href: "#about", label: "About" },
  { href: "#services", label: "Services" },
  { href: "#gallery", label: "Gallery" },
  { href: "#contact", label: "Contact" },
];

function useTypewriter(text: string, speed = 24) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setDisplayed(text.slice(0, index));
      if (index >= text.length) {
        setDone(true);
        window.clearInterval(timer);
      }
    }, speed);

    return () => window.clearInterval(timer);
  }, [text, speed]);

  return { displayed, done };
}

function CaptureYourHeadline({ text, slideKey }: { text: string; slideKey: number }) {
  return (
    <motion.h1
      key={`headline-top-${slideKey}-${text}`}
      className="text-left font-serif text-[clamp(2.1rem,9.5vw,5.5rem)] font-normal leading-[0.95] tracking-tight text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.85)]"
      initial={{ opacity: 0, y: 15 }}
      animate={{
        opacity: [0, 1, 1, 0.6, 1],
        y: [15, 0, 0, 0, 0],
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        repeatDelay: 1.5,
        ease: "easeInOut",
      }}
    >
      {text}
    </motion.h1>
  );
}

function MemoriesHeadline({ text, slideKey }: { text: string; slideKey: number }) {
  return (
    <motion.span
      key={`headline-bot-${slideKey}-${text}`}
      className="text-left font-serif text-[clamp(1.85rem,8.5vw,4.75rem)] font-normal leading-[0.9] tracking-tight text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.85)] inline-block"
      initial={{ opacity: 0, y: 12 }}
      animate={{
        opacity: [0, 1, 1, 0.6, 1],
        y: [12, 0, 0, 0, 0],
      }}
      transition={{
        duration: 5,
        delay: 0.35,
        repeat: Infinity,
        repeatDelay: 1.5,
        ease: "easeInOut",
      }}
    >
      {text}
    </motion.span>
  );
}

function TypewriterBlock({
  subtext,
  headlineBottom,
  slideKey,
}: {
  subtext: string;
  headlineBottom: string;
  slideKey: number;
}) {
  const { displayed, done } = useTypewriter(subtext, 24);

  return (
    <div className="mt-3.5 flex flex-col gap-3 sm:mt-6 md:mt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start lg:gap-10 text-left">
      <p className="max-w-full text-xs leading-relaxed text-zinc-100 sm:max-w-md sm:text-[15px] drop-shadow-[0_1px_8px_rgba(0,0,0,0.9)]">
        {displayed}
        <span
          className={`ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[2px] bg-zinc-300 ${
            done ? "animate-blink" : ""
          }`}
          aria-hidden="true"
        />
      </p>
      <div className="pt-0.5 lg:pt-[0.2em] text-left">
        <MemoriesHeadline text={headlineBottom} slideKey={slideKey} />
      </div>
    </div>
  );
}

// No ScaledImageGallery needed — hero background now auto-slides

/* ── Shield Admin Gate ── */
function ShieldAdminButton({ className }: { className?: string }) {
  const { isAdmin, login, logout } = useAdmin();
  const clickCountRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [password, setPassword] = useState("");

  const handleShieldClick = useCallback(() => {
    if (isAdmin) {
      logout();
      return;
    }

    clickCountRef.current += 1;

    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }

    if (clickCountRef.current >= 3) {
      clickCountRef.current = 0;
      setShowPasswordInput(true);
    } else {
      timerRef.current = window.setTimeout(() => {
        clickCountRef.current = 0;
      }, 1500);
    }
  }, [isAdmin, logout]);

  const handlePasswordSubmit = () => {
    const success = login(password);
    if (success) {
      setShowPasswordInput(false);
      setPassword("");
    } else {
      alert("Wrong password!");
      setPassword("");
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleShieldClick}
        className={`group relative transition-all ${className ?? ""}`}
        title={isAdmin ? "Admin active — click to logout" : ""}
      >
        <Shield
          className={`h-4 w-4 transition-colors ${
            isAdmin ? "text-[#530000]" : "text-zinc-400 hover:text-white"
          }`}
        />
        {isAdmin && (
          <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[#530000]" />
        )}
      </button>

      {/* Password modal */}
      <AnimatePresence>
        {showPasswordInput && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowPasswordInput(false);
              setPassword("");
            }}
          >
            <motion.div
              className="mx-4 w-full max-w-sm rounded-xl bg-[#FAF6F0] border border-[#dbbc80] p-8 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6 flex items-center gap-3">
                <Shield className="h-5 w-5 text-[#530000]" />
                <h3 className="font-serif text-lg font-bold text-[#241F20]">Admin Access</h3>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()}
                placeholder="Enter password"
                className="w-full rounded-lg border border-[#dbbc80] bg-white px-4 py-3 text-sm text-[#241F20] placeholder:text-[#746A67] focus:border-[#530000] focus:outline-none focus:ring-1 focus:ring-[#530000]"
                autoFocus
              />
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordInput(false);
                    setPassword("");
                  }}
                  className="flex-1 rounded-lg border border-[#dbbc80] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#746A67] transition-colors hover:bg-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePasswordSubmit}
                  className="flex-1 rounded-lg bg-[#530000] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#530000]"
                >
                  Unlock
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function EditorialHero() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [editSlideIndex, setEditSlideIndex] = useState(0);
  const [slideModalOpen, setSlideModalOpen] = useState(false);
  const [textModalOpen, setTextModalOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const { isAdmin } = useAdmin();
  const { assets, updateHeroSlide, updateHeroSlideText, resetHeroSlideText, resetAsset } = useSiteAssets();

  // Auto-advance slideshow (freezes completely when modal is open or admin pauses)
  useEffect(() => {
    if (slideModalOpen || textModalOpen || isPaused) return;

    const timer = window.setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, SLIDE_DURATION);

    return () => window.clearInterval(timer);
  }, [slideModalOpen, textModalOpen, isPaused]);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const handleOpenSlideModal = (slideIndex?: number) => {
    const target = slideIndex !== undefined ? slideIndex : currentSlide;
    setEditSlideIndex(target);
    setCurrentSlide(target);
    setSlideModalOpen(true);
  };

  const handleSelectSlideInModal = (index: number) => {
    setEditSlideIndex(index);
    setCurrentSlide(index);
  };

  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const rawDesktopSrc = assets.heroSlides?.[currentSlide] || HERO_SLIDES[currentSlide]?.desktopSrc;
  const rawMobileSrc = assets.heroSlides?.[currentSlide] || HERO_SLIDES[currentSlide]?.mobileSrc;
  const activeDesktopSrc = getOptimizedCloudinaryUrl(rawDesktopSrc, 'FULLSCREEN');
  const activeMobileSrc = getOptimizedCloudinaryUrl(rawMobileSrc, { width: 768 });

  // Compute active text for current slide
  const currentSlideText =
    assets.heroSlidesText?.[currentSlide] ||
    DEFAULT_HERO_SLIDES_TEXT[currentSlide] ||
    DEFAULT_HERO_SLIDES_TEXT[0];

  const headlineTop = currentSlideText.headlineTop || "Capture your";
  const headlineBottom = currentSlideText.headlineBottom || "memories";
  const subtext = currentSlideText.subtext || SUBTEXT;

  const [isMobileScreen, setIsMobileScreen] = useState(false);

  useEffect(() => {
    const updateSize = () => {
      setIsMobileScreen(window.innerWidth < 640);
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Prepare slides list with current images for the selection modal
  const heroSlideItems = HERO_SLIDES.map((slide, idx) => ({
    index: idx,
    slug: `slide_${idx + 1}`,
    label: `Slide ${idx + 1}`,
    imageUrl: getOptimizedCloudinaryUrl(
      isMobileScreen
        ? assets.heroSlidesMobile?.[idx] || assets.heroSlides?.[idx] || slide.mobileSrc
        : assets.heroSlides?.[idx] || slide.desktopSrc,
      'THUMBNAIL'
    ),
  }));

  const editingSlideImg = isMobileScreen
    ? assets.heroSlidesMobile?.[editSlideIndex] || assets.heroSlides?.[editSlideIndex] || HERO_SLIDES[editSlideIndex]?.mobileSrc
    : assets.heroSlides?.[editSlideIndex] || HERO_SLIDES[editSlideIndex]?.desktopSrc;

  return (
    <section className="relative min-h-[100dvh] overflow-hidden">
      {/* ── Auto-sliding Background Carousel ── */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={currentSlide}
          className="absolute inset-0 z-0 h-full w-full"
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <picture className="absolute inset-0 block h-full w-full">
            <source
              media="(max-width: 639px)"
              srcSet={activeMobileSrc}
            />
            <img
              src={activeDesktopSrc}
              alt={HERO_SLIDES[currentSlide]?.alt ?? "Photography showcase"}
              className="h-full w-full object-cover object-center"
              draggable={false}
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          </picture>
        </motion.div>
      </AnimatePresence>

      {/* Admin Change Hero Slide Toolbar with Direct Slide Selector, Pause Button & Edit Text Button */}
      {isAdmin && (
        <div className="absolute top-20 right-3 sm:right-8 z-40 flex flex-wrap items-center gap-1.5 rounded-2xl border border-[#770000]/60 bg-[#770000]/95 p-1.5 sm:p-2 text-white shadow-2xl backdrop-blur-md">
          {/* Pause / Play Toggle */}
          <button
            type="button"
            onClick={() => setIsPaused((prev) => !prev)}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-[#DCC9B6] hover:bg-white/20 hover:text-white transition-colors cursor-pointer"
            title={isPaused ? "Resume auto slideshow" : "Pause slideshow to edit"}
          >
            {isPaused ? (
              <Play className="h-3.5 w-3.5 fill-current" />
            ) : (
              <Pause className="h-3.5 w-3.5 fill-current" />
            )}
          </button>

          {/* Slide Selector Buttons */}
          <div className="flex items-center gap-1">
            {HERO_SLIDES.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleOpenSlideModal(idx)}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                  currentSlide === idx
                    ? "bg-[#770000] text-white shadow-md border border-[#DCC9B6]/40 ring-1 ring-[#DCC9B6]/50"
                    : "bg-white/5 text-zinc-300 hover:bg-white/15 hover:text-white"
                }`}
                title={`Select and Change Slide ${idx + 1} Image (${isMobileScreen ? 'Portrait' : 'Landscape'})`}
              >
                <span>Slide {idx + 1}</span>
                <Camera className="h-2.5 w-2.5 text-[#DCC9B6]" />
              </button>
            ))}
          </div>

          {/* Dedicated Edit Slide Text Button */}
          <button
            type="button"
            onClick={() => {
              setIsPaused(true);
              setTextModalOpen(true);
            }}
            className="flex items-center gap-1 rounded-lg bg-[#FAF6F0] px-3 py-1 text-[11px] font-bold text-[#770000] hover:bg-white transition-all shadow-md cursor-pointer ml-1"
            title="Customize text/headline for each slide"
          >
            <Type className="h-3 w-3 text-[#770000]" />
            <span>Edit Text</span>
          </button>
        </div>
      )}

      {/* Admin Upload Modal for Hero with Slide Selection */}
      <AdminUploadModal
        isOpen={slideModalOpen}
        onClose={() => setSlideModalOpen(false)}
        title={`Change Hero Slide ${editSlideIndex + 1} (${isMobileScreen ? 'Mobile Portrait' : 'Desktop Landscape'})`}
        subtitle={
          isMobileScreen
            ? "Mobile View: Upload a vertical (portrait) photo (Height > Width)."
            : "Desktop View: Upload a horizontal (landscape) photo (Width > Height)."
        }
        currentImageUrl={editingSlideImg}
        slides={heroSlideItems}
        currentSlideIndex={editSlideIndex}
        aspectRatioConstraint={isMobileScreen ? 'portrait-only' : 'landscape-only'}
        onSelectSlide={handleSelectSlideInModal}
        onUploadSuccess={(url) => updateHeroSlide(editSlideIndex, url, isMobileScreen)}
        onResetToDefault={() => resetAsset('heroSlides', editSlideIndex)}
      />

      {/* Hero Slide Text Customization Modal */}
      <HeroTextEditModal
        isOpen={textModalOpen}
        onClose={() => setTextModalOpen(false)}
        currentSlideIndex={currentSlide}
        slidesCount={HERO_SLIDES.length}
        slidesText={assets.heroSlidesText}
        defaultSlidesText={DEFAULT_HERO_SLIDES_TEXT}
        onSelectSlide={(idx) => setCurrentSlide(idx)}
        onSave={(idx, text) => updateHeroSlideText(idx, text)}
        onReset={(idx) => resetHeroSlideText(idx)}
      />

      {/* Light subtle overlay for maximum image clarity & text contrast (with mobile bottom gradient enhancement) */}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black/85 via-black/35 to-black/10 sm:from-black/50 sm:via-black/20 sm:to-black/10" aria-hidden="true" />

      {/* Floating Side Arrow Controls for Hero Carousel */}
      <button
        type="button"
        onClick={handlePrevSlide}
        className="pointer-events-auto absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-30 flex h-8 w-8 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-all hover:bg-[#530000] hover:scale-110 active:scale-95 shadow-xl"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6" />
      </button>
      <button
        type="button"
        onClick={handleNextSlide}
        className="pointer-events-auto absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-30 flex h-8 w-8 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-all hover:bg-[#530000] hover:scale-110 active:scale-95 shadow-xl"
        aria-label="Next slide"
      >
        <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6" />
      </button>

      <div className="relative z-10 flex min-h-[100dvh] flex-col">
        {/* ── Sticky Dark Maroon (#530000) Navbar ── */}
        <header className="sticky top-0 z-50 border-b border-[#530000]/30 bg-[#530000]/95 shadow-md backdrop-blur-lg overflow-visible">
          <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-1 sm:px-8 sm:py-1.5 lg:px-14 overflow-visible">
            {/* Golden Hanging Knot Ornaments (Framing extreme left & right) */}
            <GoldenNavOrnament side="left" />
            <GoldenNavOrnament side="right" />

            <div className="flex items-center gap-3">
              {/* Shield — left corner, desktop only */}
              <div className="hidden md:block">
                <ShieldAdminButton />
              </div>
              {/* Brand: Logo & Text */}
              <a href="/" className="flex items-center gap-2.5 sm:gap-3 shrink-0 group">
                <img
                  src="/logo2.png"
                  alt="Alpha stories studio Logo"
                  className="h-9 w-9 sm:h-11 sm:w-11 lg:h-12 lg:w-12 object-contain shrink-0 transition-transform duration-300 group-hover:scale-105"
                  draggable={false}
                />
                {/* Styled warm beige text to the right of the logo */}
                <span className="font-serif text-xs sm:text-sm lg:text-base font-extrabold tracking-wider text-[#FAF6F0] drop-shadow-sm uppercase whitespace-nowrap">
                  Alpha stories studio
                </span>
              </a>
            </div>

            {/* Desktop nav links — centered */}
            <nav className="hidden items-center gap-8 text-xs font-medium uppercase tracking-[0.15em] text-[#dbbc80] md:flex">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="transition-colors hover:text-white"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Desktop: Get in touch */}
            <div className="hidden items-center gap-3 md:flex">
              <a
                href="#contact"
                className="shrink-0 rounded-full bg-[#530000] px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-white border border-[#dbbc80]/30 transition-all hover:bg-[#530000]/80 hover:shadow-lg sm:text-xs"
              >
                Get in touch
              </a>
            </div>

            {/* Mobile: Hamburger toggle */}
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-[#530000]/40 bg-[#530000] text-[#FAF6F0] md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5 text-[#FAF6F0]" />
              ) : (
                <Menu className="h-5 w-5 text-[#FAF6F0]" />
              )}
            </button>
          </div>

          {/* Mobile slide-down menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.nav
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden border-t border-[#530000]/30 bg-[#530000]/98 text-white backdrop-blur-lg md:hidden"
              >
                <div className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-4">
                  {NAV_LINKS.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      className="rounded-lg px-3 py-2.5 text-sm font-medium text-[#FAF6F0] transition-colors hover:bg-[#530000]/40 hover:text-white"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </a>
                  ))}
                  <a
                    href="#contact"
                    className="mt-2 rounded-full bg-[#530000] px-5 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-white border border-[#dbbc80]/30"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get in touch
                  </a>
                  {/* Shield icon — hidden admin trigger */}
                  <div className="mt-2 border-t border-[#530000]/30 pt-3">
                    <div className="flex items-center gap-2 px-3">
                      <ShieldAdminButton />
                    </div>
                  </div>
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </header>

        {/* ── Main Hero Text Container: Mobile Bottom-Left Aligned, Desktop Centered ── */}
        <div className="flex flex-1 flex-col justify-end pb-8 pt-16 sm:justify-center sm:py-16 sm:pb-16 lg:px-14 lg:py-24 px-4 sm:px-8">
          <div className="mx-auto w-full max-w-7xl text-left">
            <CaptureYourHeadline text={headlineTop} slideKey={currentSlide} />
            <TypewriterBlock
              subtext={subtext}
              headlineBottom={headlineBottom}
              slideKey={currentSlide}
            />
          </div>
        </div>

        <footer className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 pb-6 sm:px-8 lg:px-14">
          {/* Slide indicators with Next & Prev Arrow Controls */}
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handlePrevSlide}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white backdrop-blur-sm transition-all hover:bg-white hover:text-black hover:scale-110 active:scale-95 sm:h-8 sm:w-8"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              {HERO_SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i === currentSlide
                      ? "w-8 bg-[#FAF6F0]"
                      : "w-3 bg-white/40 hover:bg-white/60"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={handleNextSlide}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white backdrop-blur-sm transition-all hover:bg-[#530000] hover:text-white hover:scale-110 active:scale-95 sm:h-8 sm:w-8"
              aria-label="Next slide"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
            <div className="text-[10px] leading-relaxed text-zinc-300 sm:text-[11px]">
              <p>{today}</p>
              <p className="mt-1 text-white">Creative direction</p>
            </div>
            <div className="flex flex-wrap gap-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-white sm:gap-6 sm:text-[11px] sm:tracking-[0.15em]">
              <a
                href="https://www.facebook.com/velan.shan"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#dbbc80] transition-colors"
              >
                Facebook
              </a>
              <a
                href="https://www.instagram.com/stories_by_alpha?stkn=MW0zMGY5eXUweDYwYg%3D%3D&utm_source=qr"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#dbbc80] transition-colors"
              >
                Instagram
              </a>
              <a
                href="https://jsdl.in/DT-99IIIAYQA6Q"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white text-[#dbbc80] transition-colors"
              >
                Justdial
              </a>
            </div>
          </div>
        </footer>
      </div>

      <style>{`
        @keyframes blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        .animate-blink {
          animation: blink 1s step-end infinite;
        }
      `}</style>
    </section>
  );
}
