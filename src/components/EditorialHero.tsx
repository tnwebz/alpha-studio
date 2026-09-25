import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef, useCallback } from "react";
import { Shield, Menu, X, ChevronLeft, ChevronRight, Camera, Play, Pause } from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";
import { useSiteAssets } from "@/hooks/useSiteAssets";
import { AdminUploadModal } from "./AdminUploadModal";
import { GoldenNavOrnament } from "./GoldenNavOrnament";

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
  { href: "#services", label: "Services" },
  { href: "#gallery", label: "Gallery" },
  { href: "#contact", label: "Contact" },
];

function useTypewriter(text: string, speed = 26) {
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

function CaptureYourHeadline() {
  return (
    <motion.h1
      className="font-serif text-[clamp(2.25rem,11vw,5.5rem)] font-normal leading-[0.95] tracking-tight text-white"
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: [0, 1, 1, 0.4, 1],
        y: [20, 0, 0, 0, 0],
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        repeatDelay: 1.5,
        ease: "easeInOut",
      }}
    >
      Capture your
    </motion.h1>
  );
}

function MemoriesHeadline() {
  return (
    <motion.span
      className="font-serif text-[clamp(2rem,9vw,4.75rem)] font-normal leading-[0.9] tracking-tight text-white"
      initial={{ opacity: 0, y: 16 }}
      animate={{
        opacity: [0, 1, 1, 0.4, 1],
        y: [16, 0, 0, 0, 0],
      }}
      transition={{
        duration: 5,
        delay: 0.35,
        repeat: Infinity,
        repeatDelay: 1.5,
        ease: "easeInOut",
      }}
    >
      memories
    </motion.span>
  );
}

function TypewriterBlock() {
  const { displayed, done } = useTypewriter(SUBTEXT, 26);

  return (
    <div className="mt-5 flex flex-col gap-4 sm:mt-6 md:mt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start lg:gap-10">
      <p className="max-w-full text-sm leading-relaxed text-zinc-200 sm:max-w-md sm:text-[15px]">
        {displayed}
        <span
          className={`ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[2px] bg-zinc-400 ${
            done ? "animate-blink" : ""
          }`}
          aria-hidden="true"
        />
      </p>
      <div className="lg:pt-[0.2em]">
        <MemoriesHeadline />
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
            isAdmin ? "text-[#681C2B]" : "text-zinc-400 hover:text-white"
          }`}
        />
        {isAdmin && (
          <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[#681C2B]" />
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
              className="mx-4 w-full max-w-sm rounded-xl bg-[#FAF6F0] border border-[#DCC9B6] p-8 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6 flex items-center gap-3">
                <Shield className="h-5 w-5 text-[#681C2B]" />
                <h3 className="font-serif text-lg font-bold text-[#241F20]">Admin Access</h3>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()}
                placeholder="Enter password"
                className="w-full rounded-lg border border-[#DCC9B6] bg-white px-4 py-3 text-sm text-[#241F20] placeholder:text-[#746A67] focus:border-[#681C2B] focus:outline-none focus:ring-1 focus:ring-[#681C2B]"
                autoFocus
              />
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordInput(false);
                    setPassword("");
                  }}
                  className="flex-1 rounded-lg border border-[#DCC9B6] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#746A67] transition-colors hover:bg-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePasswordSubmit}
                  className="flex-1 rounded-lg bg-[#681C2B] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#3D111B]"
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
  const [isPaused, setIsPaused] = useState(false);
  const { isAdmin } = useAdmin();
  const { assets, updateHeroSlide, resetAsset } = useSiteAssets();

  // Auto-advance slideshow (freezes completely when modal is open or admin pauses)
  useEffect(() => {
    if (slideModalOpen || isPaused) return;

    const timer = window.setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, SLIDE_DURATION);

    return () => window.clearInterval(timer);
  }, [slideModalOpen, isPaused]);

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

  const activeDesktopSrc = assets.heroSlides?.[currentSlide] || HERO_SLIDES[currentSlide]?.desktopSrc;
  const activeMobileSrc = assets.heroSlides?.[currentSlide] || HERO_SLIDES[currentSlide]?.mobileSrc;

  // Prepare slides list with current images for the selection modal
  const heroSlideItems = HERO_SLIDES.map((slide, idx) => ({
    index: idx,
    label: `Slide ${idx + 1}`,
    imageUrl: assets.heroSlides?.[idx] || slide.desktopSrc,
  }));

  const editingSlideImg = assets.heroSlides?.[editSlideIndex] || HERO_SLIDES[editSlideIndex]?.desktopSrc;

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
            />
          </picture>
        </motion.div>
      </AnimatePresence>

      {/* Admin Change Hero Slide Toolbar with Direct Slide Selector & Pause Button */}
      {isAdmin && (
        <div className="absolute top-20 right-3 sm:right-8 z-40 flex flex-wrap items-center gap-1.5 rounded-2xl border border-[#681C2B]/60 bg-[#3D111B]/95 p-1.5 sm:p-2 text-white shadow-2xl backdrop-blur-md">
          {/* Pause / Play Toggle */}
          <button
            type="button"
            onClick={() => setIsPaused((prev) => !prev)}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-[#DCC9B6] hover:bg-white/20 hover:text-white transition-colors"
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
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                  currentSlide === idx
                    ? "bg-[#681C2B] text-white shadow-md border border-[#DCC9B6]/40 ring-1 ring-[#DCC9B6]/50"
                    : "bg-white/5 text-zinc-300 hover:bg-white/15 hover:text-white"
                }`}
                title={`Select and Change Slide ${idx + 1} Image`}
              >
                <span>Slide {idx + 1}</span>
                <Camera className="h-2.5 w-2.5 text-[#DCC9B6]" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Admin Upload Modal for Hero with Slide Selection */}
      <AdminUploadModal
        isOpen={slideModalOpen}
        onClose={() => setSlideModalOpen(false)}
        title={`Change Hero Slide ${editSlideIndex + 1} Image`}
        subtitle="Select any slide number below and upload a replacement photo via Cloudinary"
        currentImageUrl={editingSlideImg}
        slides={heroSlideItems}
        currentSlideIndex={editSlideIndex}
        onSelectSlide={handleSelectSlideInModal}
        onUploadSuccess={(url) => updateHeroSlide(editSlideIndex, url)}
        onResetToDefault={() => resetAsset('heroSlides', editSlideIndex)}
      />

      {/* Light subtle overlay for maximum image clarity & text contrast */}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black/50 via-black/20 to-black/10" aria-hidden="true" />

      {/* Floating Side Arrow Controls for Hero Carousel */}
      <button
        type="button"
        onClick={handlePrevSlide}
        className="pointer-events-auto absolute left-3 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-all hover:bg-[#681C2B] hover:scale-110 active:scale-95 shadow-xl"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        type="button"
        onClick={handleNextSlide}
        className="pointer-events-auto absolute right-3 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-all hover:bg-[#681C2B] hover:scale-110 active:scale-95 shadow-xl"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      <div className="relative z-10 flex min-h-[100dvh] flex-col">
        {/* ── Sticky Dark Maroon (#3D111B) Navbar ── */}
        <header className="sticky top-0 z-50 border-b border-[#681C2B]/30 bg-[#3D111B]/95 shadow-md backdrop-blur-lg overflow-visible">
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
            <nav className="hidden items-center gap-8 text-xs font-medium uppercase tracking-[0.15em] text-[#DCC9B6] md:flex">
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
                className="shrink-0 rounded-full bg-[#681C2B] px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-white border border-[#DCC9B6]/30 transition-all hover:bg-[#681C2B]/80 hover:shadow-lg sm:text-xs"
              >
                Get in touch
              </a>
            </div>

            {/* Mobile: Hamburger toggle */}
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-[#681C2B]/40 bg-[#3D111B] text-[#FAF6F0] md:hidden"
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
                className="overflow-hidden border-t border-[#681C2B]/30 bg-[#3D111B]/98 text-white backdrop-blur-lg md:hidden"
              >
                <div className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-4">
                  {NAV_LINKS.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      className="rounded-lg px-3 py-2.5 text-sm font-medium text-[#FAF6F0] transition-colors hover:bg-[#681C2B]/40 hover:text-white"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </a>
                  ))}
                  <a
                    href="#contact"
                    className="mt-2 rounded-full bg-[#681C2B] px-5 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-white border border-[#DCC9B6]/30"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get in touch
                  </a>
                  {/* Shield icon — hidden admin trigger */}
                  <div className="mt-2 border-t border-[#681C2B]/30 pt-3">
                    <div className="flex items-center gap-2 px-3">
                      <ShieldAdminButton />
                    </div>
                  </div>
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </header>

        <div className="flex flex-1 flex-col justify-center gap-8 px-4 py-12 sm:gap-10 sm:px-8 sm:py-16 lg:px-14 lg:py-24">
          <div className="mx-auto w-full max-w-7xl">
            <CaptureYourHeadline />
            <TypewriterBlock />
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
              className="flex h-7 w-7 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white backdrop-blur-sm transition-all hover:bg-[#681C2B] hover:text-white hover:scale-110 active:scale-95 sm:h-8 sm:w-8"
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
                className="hover:text-[#DCC9B6] transition-colors"
              >
                Facebook
              </a>
              <a
                href="https://www.instagram.com/stories_by_alpha?stkn=MW0zMGY5eXUweDYwYg%3D%3D&utm_source=qr"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#DCC9B6] transition-colors"
              >
                Instagram
              </a>
              <a
                href="https://jsdl.in/DT-99IIIAYQA6Q"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white text-[#DCC9B6] transition-colors"
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
