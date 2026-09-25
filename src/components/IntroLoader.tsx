import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * CONFIGURATION & CONTROLS
 * Toggle FORCE_INTRO to true during local development to force replay on every refresh.
 * You can also pass `?intro=true` in the URL or call `window.replayIntro()` in the console.
 */
const FORCE_INTRO = false;
const SESSION_STORAGE_KEY = 'alpha-stories-intro-seen-v3';

interface GlitterParticle {
  id: number;
  xStart: number;
  xLine: number;
  yLine: number;
  xScatter: number;
  yStart: number;
  yScatter: number;
  width: number;
  height: number;
  color: string;
  delay: number;
  opacityPeak: number;
  isSparkle?: boolean;
  desktopOnly?: boolean;
}

const GLITTER_PARTICLES: GlitterParticle[] = [
  { id: 0, xStart: -78, xLine: -58, yLine: 0, xScatter: -82, yStart: -3, yScatter: -4, width: 2.0, height: 2.0, color: '#D6B36A', delay: 0.02, opacityPeak: 0.85 },
  { id: 1, xStart: -68, xLine: -50, yLine: 0.4, xScatter: -72, yStart: 4, yScatter: 5, width: 1.5, height: 1.5, color: '#E8D09A', delay: 0.05, opacityPeak: 0.9 },
  { id: 2, xStart: -72, xLine: -42, yLine: -0.3, xScatter: -62, yStart: -2, yScatter: -3, width: 2.4, height: 1.2, color: '#F3DFC0', delay: 0.01, opacityPeak: 0.8 },
  { id: 3, xStart: -56, xLine: -35, yLine: 0.2, xScatter: -50, yStart: 3, yScatter: -2, width: 1.8, height: 1.8, color: '#C89A4B', delay: 0.06, opacityPeak: 0.85 },
  { id: 4, xStart: -62, xLine: -28, yLine: -0.4, xScatter: -42, yStart: -4, yScatter: 4, width: 2.2, height: 2.2, color: '#E8D09A', delay: 0.03, opacityPeak: 0.95 },
  { id: 5, xStart: -46, xLine: -22, yLine: 0.3, xScatter: -34, yStart: 2, yScatter: -5, width: 1.5, height: 1.5, color: '#D6B36A', delay: 0.07, opacityPeak: 0.8 },
  { id: 6, xStart: -52, xLine: -16, yLine: -0.2, xScatter: -28, yStart: -3, yScatter: 3, width: 2.6, height: 1.2, color: '#F3DFC0', delay: 0.04, opacityPeak: 0.9 },
  { id: 7, xStart: -36, xLine: -10, yLine: 0.4, xScatter: -20, yStart: 4, yScatter: -3, width: 2.0, height: 2.0, color: '#E8D09A', delay: 0.08, opacityPeak: 0.9, isSparkle: true },
  { id: 8, xStart: -42, xLine: -5, yLine: -0.3, xScatter: -14, yStart: -1, yScatter: 4, width: 1.5, height: 1.5, color: '#C89A4B', delay: 0.02, opacityPeak: 0.85 },
  { id: 9, xStart: -26, xLine: -2, yLine: 0.1, xScatter: -10, yStart: 3, yScatter: -4, width: 2.2, height: 2.2, color: '#FAF6F0', delay: 0.05, opacityPeak: 0.95, isSparkle: true },
  { id: 10, xStart: 26, xLine: 2, yLine: -0.2, xScatter: 10, yStart: -2, yScatter: 4, width: 2.2, height: 2.2, color: '#FAF6F0', delay: 0.04, opacityPeak: 0.95, isSparkle: true },
  { id: 11, xStart: 36, xLine: 6, yLine: 0.3, xScatter: 16, yStart: 4, yScatter: -3, width: 1.5, height: 1.5, color: '#C89A4B', delay: 0.07, opacityPeak: 0.85 },
  { id: 12, xStart: 46, xLine: 12, yLine: -0.4, xScatter: 24, yStart: -3, yScatter: 5, width: 2.5, height: 1.2, color: '#E8D09A', delay: 0.03, opacityPeak: 0.9 },
  { id: 13, xStart: 42, xLine: 18, yLine: 0.2, xScatter: 30, yStart: 2, yScatter: -4, width: 1.8, height: 1.8, color: '#D6B36A', delay: 0.06, opacityPeak: 0.85 },
  { id: 14, xStart: 56, xLine: 25, yLine: -0.3, xScatter: 38, yStart: -4, yScatter: 3, width: 2.2, height: 2.2, color: '#F3DFC0', delay: 0.02, opacityPeak: 0.95 },
  { id: 15, xStart: 52, xLine: 32, yLine: 0.4, xScatter: 46, yStart: 3, yScatter: -5, width: 1.5, height: 1.5, color: '#E8D09A', delay: 0.08, opacityPeak: 0.8 },
  { id: 16, xStart: 66, xLine: 38, yLine: -0.2, xScatter: 52, yStart: -2, yScatter: 4, width: 2.4, height: 1.2, color: '#C89A4B', delay: 0.04, opacityPeak: 0.85 },
  { id: 17, xStart: 62, xLine: 45, yLine: 0.3, xScatter: 60, yStart: 4, yScatter: -3, width: 1.8, height: 1.8, color: '#D6B36A', delay: 0.05, opacityPeak: 0.9 },
  { id: 18, xStart: 76, xLine: 52, yLine: -0.4, xScatter: 70, yStart: -3, yScatter: 5, width: 2.0, height: 2.0, color: '#E8D09A', delay: 0.01, opacityPeak: 0.85 },
  { id: 19, xStart: 72, xLine: 58, yLine: 0.2, xScatter: 78, yStart: 2, yScatter: -4, width: 1.5, height: 1.5, color: '#F3DFC0', delay: 0.06, opacityPeak: 0.8 },
  { id: 20, xStart: -32, xLine: -8, yLine: -0.3, xScatter: -16, yStart: -4, yScatter: 2, width: 1.4, height: 1.4, color: '#E8D09A', delay: 0.09, opacityPeak: 0.85 },
  { id: 21, xStart: 32, xLine: 8, yLine: 0.3, xScatter: 18, yStart: 3, yScatter: -2, width: 1.4, height: 1.4, color: '#D6B36A', delay: 0.09, opacityPeak: 0.85 },
  // Desktop-only particles to expand width up to 130px
  { id: 22, desktopOnly: true, xStart: -84, xLine: -64, yLine: 0.2, xScatter: -88, yStart: 2, yScatter: -4, width: 1.5, height: 1.5, color: '#C89A4B', delay: 0.03, opacityPeak: 0.75 },
  { id: 23, desktopOnly: true, xStart: 84, xLine: 64, yLine: -0.2, xScatter: 88, yStart: -2, yScatter: 4, width: 1.5, height: 1.5, color: '#C89A4B', delay: 0.04, opacityPeak: 0.75 },
  { id: 24, desktopOnly: true, xStart: -62, xLine: -46, yLine: -0.4, xScatter: -56, yStart: -5, yScatter: 3, width: 2.0, height: 1.0, color: '#F3DFC0', delay: 0.08, opacityPeak: 0.8 },
  { id: 25, desktopOnly: true, xStart: 62, xLine: 48, yLine: 0.4, xScatter: 58, yStart: 5, yScatter: -3, width: 2.0, height: 1.0, color: '#F3DFC0', delay: 0.07, opacityPeak: 0.8 },
  { id: 26, desktopOnly: true, xStart: -48, xLine: -30, yLine: 0.3, xScatter: -40, yStart: 4, yScatter: -5, width: 1.6, height: 1.6, color: '#E8D09A', delay: 0.05, opacityPeak: 0.85 },
  { id: 27, desktopOnly: true, xStart: 48, xLine: 30, yLine: -0.3, xScatter: 40, yStart: -4, yScatter: 5, width: 1.6, height: 1.6, color: '#E8D09A', delay: 0.06, opacityPeak: 0.85 },
  { id: 28, desktopOnly: true, xStart: -38, xLine: -19, yLine: -0.2, xScatter: -26, yStart: -2, yScatter: 3, width: 1.4, height: 1.4, color: '#D6B36A', delay: 0.02, opacityPeak: 0.8 },
  { id: 29, desktopOnly: true, xStart: 38, xLine: 20, yLine: 0.2, xScatter: 28, yStart: 2, yScatter: -3, width: 1.4, height: 1.4, color: '#D6B36A', delay: 0.04, opacityPeak: 0.8 },
  { id: 30, desktopOnly: true, xStart: -22, xLine: -4, yLine: 0.1, xScatter: -12, yStart: 3, yScatter: -2, width: 2.0, height: 2.0, color: '#FAF6F0', delay: 0.07, opacityPeak: 0.9, isSparkle: true },
  { id: 31, desktopOnly: true, xStart: 22, xLine: 4, yLine: -0.1, xScatter: 12, yStart: -3, yScatter: 2, width: 2.0, height: 2.0, color: '#FAF6F0', delay: 0.08, opacityPeak: 0.9, isSparkle: true },
];

export function IntroLoader() {
  // Synchronous initialization prevents the 0.2s glitch where homepage paints before loader renders
  const [shouldRender, setShouldRender] = useState(() => {
    if (typeof window === 'undefined') return true;
    const hasSeen = sessionStorage.getItem(SESSION_STORAGE_KEY);
    const searchParams = new URLSearchParams(window.location.search);
    const forceUrl = searchParams.get('intro') === 'true' || window.location.hash === '#intro';
    const active = !hasSeen || FORCE_INTRO || forceUrl;
    if (active) {
      document.documentElement.classList.add('intro-active');
    }
    return active;
  });

  const [animationStep, setAnimationStep] = useState<'maroon' | 'transition' | 'beige' | 'exit' | 'done'>('maroon');

  // Detect accessibility preference
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    // Expose replay function in console for developer convenience
    (window as unknown as { replayIntro?: () => void }).replayIntro = () => {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      document.documentElement.classList.add('intro-active');
      setAnimationStep('maroon');
      setShouldRender(true);
    };

    // Keep intro-active class synced
    const hasSeen = sessionStorage.getItem(SESSION_STORAGE_KEY);
    const searchParams = new URLSearchParams(window.location.search);
    const forceUrl = searchParams.get('intro') === 'true' || window.location.hash === '#intro';

    if (!hasSeen || FORCE_INTRO || forceUrl) {
      document.documentElement.classList.add('intro-active');
      setShouldRender(true);
    }
  }, []);

  // Lock scroll while intro is playing and unlock when completed
  useEffect(() => {
    if (!shouldRender || animationStep === 'done') {
      document.documentElement.classList.remove('intro-active');
      return;
    }

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    
    // Prevent layout shift from scrollbar disappearing
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      document.documentElement.classList.remove('intro-active');
    };
  }, [shouldRender, animationStep]);

  // Master Orchestration Timeline (Exact 5.5s Total, slow, smooth, calm & steady)
  useEffect(() => {
    if (!shouldRender) return;

    if (prefersReducedMotion) {
      const t1 = setTimeout(() => setAnimationStep('beige'), 800);
      const t2 = setTimeout(() => setAnimationStep('exit'), 1600);
      const t3 = setTimeout(() => {
        setAnimationStep('done');
        sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
        document.documentElement.classList.remove('intro-active');
      }, 2100);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }

    // Exact 5.50s Total Luxury Cinematic Orchestration:
    // 0.00s – 3.00s : Scene 1 (Deep Velvet Maroon Opening, silk waves, "EVERY FRAME HAS A STORY" slow, smooth reveal & steady hold)
    // 3.00s – 3.45s : Transition (Velvet maroon fabric gracefully dissolves, unveiling luxury warm beige)
    // 3.45s – 4.70s : Scene 2 (Official Logo focus reveal, ALPHA STORIES, STUDIO, with calm hold)
    // 4.70s – 5.50s : Ultra-smooth dissolve exit into the live homepage
    // 5.50s         : Complete unmount from DOM and scroll restoration

    const tTransition = setTimeout(() => {
      setAnimationStep('transition');
    }, 3000);

    const tBeige = setTimeout(() => {
      setAnimationStep('beige');
    }, 3450);

    const tExit = setTimeout(() => {
      setAnimationStep('exit');
    }, 4700);

    const tDone = setTimeout(() => {
      setAnimationStep('done');
      sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
      document.documentElement.classList.remove('intro-active');
    }, 5500);

    return () => {
      clearTimeout(tTransition);
      clearTimeout(tBeige);
      clearTimeout(tExit);
      clearTimeout(tDone);
    };
  }, [shouldRender, prefersReducedMotion]);

  if (!shouldRender || animationStep === 'done') {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        key="alpha-stories-intro-loader"
        aria-hidden="true"
        className="fixed inset-0 z-[100000] flex items-center justify-center overflow-hidden select-none pointer-events-auto"
        style={{
          width: '100vw',
          height: '100vh',
          minHeight: '100svh',
        }}
        initial={{ opacity: 1 }}
        animate={{
          opacity: animationStep === 'exit' ? 0 : 1,
          scale: animationStep === 'exit' ? 1.015 : 1,
        }}
        transition={{
          duration: 0.8,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        {/* Discreet Skip Button in top right */}
        <button
          type="button"
          onClick={() => {
            document.documentElement.classList.remove('intro-active');
            setAnimationStep('exit');
            setTimeout(() => {
              setAnimationStep('done');
              sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
            }, 500);
          }}
          className="absolute top-5 right-5 sm:top-7 sm:right-8 z-[100] rounded-full border border-white/20 bg-black/25 px-3.5 py-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-[#F3E9DC]/75 backdrop-blur-md transition-all hover:bg-black/50 hover:text-white hover:border-white/40 active:scale-95 cursor-pointer"
          aria-label="Skip intro animation"
        >
          Skip Intro →
        </button>

        {/* ========================================================= */}
        {/* SCENE 2 BASE LAYER: WARM LUXURY BEIGE ENVIRONMENT         */}
        {/* Sits underneath and is revealed as maroon curtains part   */}
        {/* ========================================================= */}
        <div
          className="absolute inset-0 w-full h-full flex flex-col items-center justify-center"
          style={{
            background: 'radial-gradient(circle at 50% 42%, #FAF6F0 0%, #F3E9DC 65%, #EADBCA 100%)',
          }}
        >
          {/* Subtle warm luxury grain overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.035] mix-blend-multiply"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Gentle ethereal champagne cloth curve at top right corner */}
          <svg
            className="absolute -top-10 -right-10 w-[320px] sm:w-[480px] h-[220px] pointer-events-none opacity-40"
            viewBox="0 0 500 300"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,0 C180,60 320,140 500,80 L500,0 Z"
              fill="url(#topBeigeSilkGrad)"
            />
            <defs>
              <linearGradient id="topBeigeSilkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#DCC9B6" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#FAF6F0" stopOpacity="0.1" />
              </linearGradient>
            </defs>
          </svg>

          {/* Flowing Maroon & Champagne silk waves at bottom */}
          <div className="absolute inset-x-0 bottom-0 w-full h-[36vh] max-h-[380px] pointer-events-none overflow-hidden">
            <motion.svg
              className="absolute bottom-0 left-0 w-full h-full"
              viewBox="0 0 1440 360"
              preserveAspectRatio="none"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              animate={prefersReducedMotion ? {} : {
                y: [0, -4, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <path
                d="M-40,240 C280,180 520,310 820,220 C1100,140 1320,260 1480,210 L1480,360 L-40,360 Z"
                fill="url(#beigeSceneSilk1)"
                opacity="0.9"
              />
              <path
                d="M-20,290 C340,230 620,330 940,250 C1220,180 1380,270 1480,240 L1480,360 L-20,360 Z"
                fill="url(#beigeSceneSilk2)"
                opacity="0.6"
              />
              <path
                d="M0,320 C380,270 700,340 1060,285 C1280,250 1400,290 1480,280 L1480,360 L0,360 Z"
                fill="url(#beigeSceneSilk3)"
                opacity="0.95"
              />
              <defs>
                <linearGradient id="beigeSceneSilk1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4A1420" />
                  <stop offset="40%" stopColor="#681C2B" />
                  <stop offset="100%" stopColor="#3D111B" />
                </linearGradient>
                <linearGradient id="beigeSceneSilk2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#DCC9B6" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#FAF6F0" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#DCC9B6" stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id="beigeSceneSilk3" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#681C2B" />
                  <stop offset="70%" stopColor="#3D111B" />
                  <stop offset="100%" stopColor="#240A10" />
                </linearGradient>
              </defs>
            </motion.svg>
          </div>

          {/* Centered Brand Presentation */}
          <div className="relative z-10 flex flex-col items-center justify-center px-4 text-center">
            {/* Official Logo Mark */}
            <motion.div
              className="relative flex items-center justify-center mb-5 sm:mb-6"
              initial={{
                opacity: 0,
                scale: 0.85,
                filter: 'blur(8px)',
                y: 10,
              }}
              animate={{
                opacity: animationStep === 'beige' || animationStep === 'exit' ? 1 : 0,
                scale: animationStep === 'beige' || animationStep === 'exit' ? 1 : 0.85,
                filter: animationStep === 'beige' || animationStep === 'exit' ? 'blur(0px)' : 'blur(8px)',
                y: animationStep === 'beige' || animationStep === 'exit' ? 0 : 10,
              }}
              transition={{
                duration: prefersReducedMotion ? 0.5 : 0.9,
                ease: [0.22, 1, 0.36, 1],
                delay: prefersReducedMotion ? 0 : 0.1,
              }}
            >
              <div
                className="absolute inset-0 -m-8 rounded-full blur-2xl pointer-events-none opacity-50"
                style={{
                  background: 'radial-gradient(circle, #FAF6F0 0%, #DCC9B6 55%, transparent 75%)',
                }}
              />

              <img
                src="/logo2.png"
                alt="Alpha Stories Studio Official Logo"
                className="relative z-10 w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 object-contain drop-shadow-[0_10px_28px_rgba(61,17,27,0.14)]"
                draggable={false}
              />
            </motion.div>

            {/* ALPHA STORIES Wordmark */}
            <motion.h1
              className="font-serif uppercase text-[#681C2B] font-semibold text-2xl sm:text-3xl md:text-4xl tracking-[0.16em] sm:tracking-[0.20em]"
              initial={{ opacity: 0, y: 8 }}
              animate={{
                opacity: animationStep === 'beige' || animationStep === 'exit' ? 1 : 0,
                y: animationStep === 'beige' || animationStep === 'exit' ? 0 : 8,
              }}
              transition={{
                duration: prefersReducedMotion ? 0.4 : 0.8,
                ease: [0.22, 1, 0.36, 1],
                delay: prefersReducedMotion ? 0.1 : 0.25,
              }}
            >
              Alpha Stories
            </motion.h1>

            {/* STUDIO with subtle flanking divider lines */}
            <motion.div
              className="flex items-center justify-center gap-3 sm:gap-4 mt-2.5 sm:mt-3"
              initial={{ opacity: 0, y: 6 }}
              animate={{
                opacity: animationStep === 'beige' || animationStep === 'exit' ? 1 : 0,
                y: animationStep === 'beige' || animationStep === 'exit' ? 0 : 6,
              }}
              transition={{
                duration: prefersReducedMotion ? 0.4 : 0.7,
                ease: [0.22, 1, 0.36, 1],
                delay: prefersReducedMotion ? 0.2 : 0.4,
              }}
            >
              <span className="w-6 sm:w-10 h-[1px] bg-[#DCC9B6]/80" />
              <span className="text-[10px] sm:text-xs text-[#746A67] tracking-[0.45em] sm:tracking-[0.55em] uppercase font-medium pl-1">
                Studio
              </span>
              <span className="w-6 sm:w-10 h-[1px] bg-[#DCC9B6]/80" />
            </motion.div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SCENE 1 TOP LAYER: DEEP MAROON OPENING ENVIRONMENT       */}
        {/* Smooth, slow, steady hold on "EVERY FRAME HAS A STORY"   */}
        {/* ========================================================= */}
        <motion.div
          className="absolute inset-0 w-full h-full flex flex-col items-center justify-center overflow-hidden"
          style={{
            background: 'radial-gradient(circle at 50% 45%, #681C2B 0%, #3D111B 65%, #240A10 100%)',
          }}
          initial={{ opacity: 1, y: '0%' }}
          animate={{
            opacity: animationStep === 'transition' || animationStep === 'beige' || animationStep === 'exit' ? 0 : 1,
            y: animationStep === 'transition' || animationStep === 'beige' || animationStep === 'exit' ? '8%' : '0%',
            filter: animationStep === 'transition' || animationStep === 'beige' || animationStep === 'exit' ? 'blur(8px)' : 'blur(0px)',
          }}
          transition={{
            duration: prefersReducedMotion ? 0.5 : 0.8,
            ease: [0.25, 1, 0.5, 1],
          }}
        >
          {/* Subtle vignette for cinematic depth */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 35%, rgba(18, 4, 8, 0.65) 100%)',
            }}
          />

          {/* Film Grain Texture overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.045] mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Flowing Maroon Waves & Silky Fabric at Bottom */}
          <div className="absolute inset-x-0 bottom-0 w-full h-[45vh] max-h-[440px] pointer-events-none overflow-hidden">
            <motion.svg
              className="absolute bottom-0 left-0 w-[110%] -left-[5%] h-full"
              viewBox="0 0 1440 400"
              preserveAspectRatio="none"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              animate={prefersReducedMotion ? {} : {
                x: [0, 10, 0],
                y: [0, -6, 0],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <path
                d="M-50,220 C240,140 540,320 860,210 C1140,110 1360,250 1520,180 L1520,400 L-50,400 Z"
                fill="url(#maroonSilkBack)"
                opacity="0.85"
              />
              <defs>
                <linearGradient id="maroonSilkBack" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4A1420" />
                  <stop offset="50%" stopColor="#681C2B" />
                  <stop offset="100%" stopColor="#2A0B12" />
                </linearGradient>
              </defs>
            </motion.svg>

            <motion.svg
              className="absolute bottom-0 left-0 w-[115%] -left-[8%] h-full"
              viewBox="0 0 1440 400"
              preserveAspectRatio="none"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              animate={prefersReducedMotion ? {} : {
                x: [0, -12, 0],
                y: [0, 8, 0],
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <path
                d="M-40,280 C260,190 580,340 920,230 C1200,140 1390,270 1520,220 L1520,400 L-40,400 Z"
                fill="url(#maroonSilkMid)"
                opacity="0.65"
              />
              <defs>
                <linearGradient id="maroonSilkMid" x1="0%" y1="0%" x2="100%" y2="50%">
                  <stop offset="0%" stopColor="#8B263E" stopOpacity="0.8" />
                  <stop offset="45%" stopColor="#681C2B" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#3D111B" stopOpacity="0.7" />
                </linearGradient>
              </defs>
            </motion.svg>

            <motion.svg
              className="absolute bottom-0 left-0 w-[105%] h-full"
              viewBox="0 0 1440 400"
              preserveAspectRatio="none"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              animate={prefersReducedMotion ? {} : {
                y: [0, -4, 0],
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <path
                d="M-20,330 C320,250 680,360 1020,290 C1260,240 1400,310 1500,280 L1500,400 L-20,400 Z"
                fill="url(#maroonSilkFore)"
                opacity="0.95"
              />
              <path
                d="M-20,330 C320,250 680,360 1020,290 C1260,240 1400,310 1500,280"
                stroke="url(#silkRimGlow)"
                strokeWidth="1.2"
                opacity="0.45"
              />
              <defs>
                <linearGradient id="maroonSilkFore" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#681C2B" />
                  <stop offset="60%" stopColor="#3D111B" />
                  <stop offset="100%" stopColor="#20060C" />
                </linearGradient>
                <linearGradient id="silkRimGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#DCC9B6" stopOpacity="0.2" />
                  <stop offset="40%" stopColor="#FAF6F0" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#DCC9B6" stopOpacity="0.1" />
                </linearGradient>
              </defs>
            </motion.svg>
          </div>

          {/* Centered Editorial Tagline & Smooth Golden Dust Trace */}
          <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center max-w-xl mx-auto">
            {/* Tagline: EVERY FRAME HAS A STORY (Slow, steady, calm) */}
            <motion.div
              initial={{
                opacity: 0,
                y: 10,
                filter: 'blur(8px)',
              }}
              animate={{
                opacity: animationStep === 'maroon' ? 1 : 0,
                y: animationStep === 'maroon' ? 0 : -6,
                filter: animationStep === 'maroon' ? 'blur(0px)' : 'blur(6px)',
              }}
              transition={{
                duration: 1.3,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.2,
              }}
            >
              <h2 className="font-serif uppercase text-[#F3E9DC] font-normal text-base sm:text-lg md:text-xl lg:text-[22px] tracking-[0.32em] sm:tracking-[0.40em] leading-[1.8] sm:leading-[1.9] drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
                Every Frame
                <br />
                Has A Story
              </h2>
            </motion.div>

            {/* Premium Golden Dust Particle Line directly below "HAS A STORY" */}
            <div
              className="relative mt-7 sm:mt-8 md:mt-9 flex items-center justify-center h-6 w-[120px] sm:w-[160px] pointer-events-none select-none"
              aria-hidden="true"
            >
              {prefersReducedMotion ? (
                <motion.div
                  className="h-[1px] w-[90px] sm:w-[130px] rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, #D6B36A 20%, #E8D09A 50%, #D6B36A 80%, transparent 100%)',
                  }}
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: animationStep === 'maroon' ? 0.9 : 0,
                  }}
                  transition={{
                    duration: 1.2,
                    delay: 0.5,
                  }}
                />
              ) : (
                <div className="relative flex items-center justify-center w-full h-full">
                  {/* Glowing golden connecting line */}
                  <motion.div
                    className="h-[1px] w-[90px] sm:w-[135px] max-w-[140px] pointer-events-none rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, transparent 0%, rgba(200, 154, 75, 0.3) 15%, #E8D09A 50%, rgba(200, 154, 75, 0.3) 85%, transparent 100%)',
                      boxShadow: '0 0 6px rgba(232, 208, 154, 0.45)',
                    }}
                    initial={{ opacity: 0, scaleX: 0.2 }}
                    animate={{
                      opacity: animationStep === 'maroon' ? 0.95 : 0,
                      scaleX: animationStep === 'maroon' ? 1 : 0.2,
                    }}
                    transition={{
                      duration: 1.4,
                      ease: [0.22, 1, 0.36, 1],
                      delay: 0.7,
                    }}
                  />

                  {/* Individual Golden Dust Particles gathering smoothly into line */}
                  {GLITTER_PARTICLES.map((p) => (
                    <motion.span
                      key={p.id}
                      className={`absolute pointer-events-none rounded-full ${p.desktopOnly ? 'hidden sm:block' : ''}`}
                      style={{
                        width: `${p.width}px`,
                        height: `${p.height}px`,
                        backgroundColor: p.color,
                        boxShadow: p.isSparkle ? `0 0 4px ${p.color}` : 'none',
                        willChange: 'transform, opacity',
                      }}
                      initial={{
                        x: p.xStart,
                        y: p.yStart,
                        opacity: 0,
                        scale: 0.4,
                      }}
                      animate={{
                        x: animationStep === 'maroon' ? p.xLine : p.xScatter,
                        y: animationStep === 'maroon' ? p.yLine : p.yScatter,
                        opacity: animationStep === 'maroon' ? p.opacityPeak : 0,
                        scale: animationStep === 'maroon' ? 1 : 0.25,
                      }}
                      transition={{
                        duration: 1.4,
                        ease: [0.25, 1, 0.5, 1],
                        delay: 0.6 + p.delay * 1.2,
                      }}
                    />
                  ))}

                  {/* Subtle photographic sparkle core in center */}
                  <motion.div
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center z-10"
                    initial={{ opacity: 0, scale: 0.3 }}
                    animate={{
                      opacity: animationStep === 'maroon' ? [0, 0.9, 0.9, 0] : 0,
                      scale: animationStep === 'maroon' ? [0.3, 1, 1, 0.3] : 0.3,
                    }}
                    transition={{
                      times: [0, 0.4, 0.85, 1],
                      duration: 2.2,
                      ease: [0.22, 1, 0.36, 1],
                      delay: 0.8,
                    }}
                  >
                    <div
                      className="w-4 h-4 rounded-full blur-[2px] pointer-events-none"
                      style={{
                        background: 'radial-gradient(circle, rgba(232, 208, 154, 0.8) 0%, rgba(214, 179, 106, 0.35) 60%, transparent 85%)',
                        boxShadow: '0 0 16px 2px rgba(232, 208, 154, 0.75)',
                      }}
                    />
                    <div
                      className="absolute w-[5px] h-[5px] rounded-full bg-[#FAF6F0]"
                      style={{
                        boxShadow: '0 0 6px 1px rgba(250, 246, 240, 0.9)',
                      }}
                    />
                  </motion.div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
