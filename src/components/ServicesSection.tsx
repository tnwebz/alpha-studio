"use client";

import { useRef, useState, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Camera,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { SERVICE_META, type ServiceSlug } from "@/data/gallery";
import { useAdmin } from "@/hooks/useAdmin";
import { useSiteAssets, type CustomService } from "@/hooks/useSiteAssets";
import { AdminUploadModal } from "./AdminUploadModal";
import { HaloReel, type HaloReelItem } from "@/components/ui/halo-reel";
import { cn } from "@/lib/utils";
import { getOptimizedCloudinaryUrl } from "@/lib/cloudinary";

// Base (built-in) service slugs — always available
const BASE_SERVICES: ServiceSlug[] = [
  "birthday",
  "hindu_wedding",
  "christian_wedding",
  "naming_ceremony",
  "engagement",
  "housewarming",
  "puberty",
  "aldhi",
  "reception",
  "bangle_ceremony",
  "salangai_poojai",
  "maternity",
  "model_shoot",
  "gift_items",
];

export function ServicesSection() {
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();
  const {
    assets,
    updateServiceCover,
    resetAsset,
    updateServiceOrder,
    addCustomService,
    removeCustomService,
    updateServiceDescription,
    removeServiceFromOrder,
  } = useSiteAssets();

  // Desktop active index & spin controller (100% untouched)
  const [desktopActiveIndex, setDesktopActiveIndex] = useState(0);
  const spinRef = useRef<((direction: number) => void) | null>(null);
  // Stable callback so HaloReel's onSpinReady effect does not thrash every render
  const handleSpinReady = useCallback((fn: (direction: number) => void) => {
    spinRef.current = fn;
  }, []);

  // Mobile dedicated active index (completely separate from desktop)
  const [mobileIndex, setMobileIndex] = useState(0);

  // Admin editing state
  const [editingServiceIndex, setEditingServiceIndex] = useState<number | null>(
    null,
  );

  // ── Build effective service list (order + custom services from Firestore) ──
  const customServices = assets.customServices || [];
  const customSlugs = customServices.map((s) => s.slug);

  // Merge custom services + Firestore description overrides into a single lookup
  const allServiceMeta = useMemo(() => {
    const merged: Record<string, { title: string; description: string; image: string }> = {
      ...SERVICE_META,
    };
    // Apply custom catalog entries
    for (const cs of customServices) {
      merged[cs.slug] = { title: cs.title, description: cs.description, image: cs.image };
    }
    // Apply admin-saved title/description overrides (wins over defaults)
    const overrides = assets.serviceDescriptions || {};
    for (const [slug, ov] of Object.entries(overrides)) {
      if (merged[slug]) {
        merged[slug] = { ...merged[slug], title: ov.title || merged[slug].title, description: ov.description || merged[slug].description };
      }
    }
    return merged;
  }, [customServices, assets.serviceDescriptions]);

  // All slugs combined (base + custom)
  const allSlugs = useMemo(() => {
    const base = [...BASE_SERVICES] as string[];
    for (const cs of customServices) {
      if (!base.includes(cs.slug)) base.push(cs.slug);
    }
    return base;
  }, [customServices]);

  // Apply saved order (from Firestore) — unknown slugs fall to the end
  const SERVICES: string[] = useMemo(() => {
    const savedOrder = assets.serviceOrder || [];
    if (!savedOrder.length) return allSlugs;
    const known = new Set(allSlugs);
    const ordered: string[] = savedOrder.filter((s) => known.has(s));
    // Append any new slugs not yet in the saved order
    for (const s of allSlugs) {
      if (!ordered.includes(s)) ordered.push(s);
    }
    return ordered;
  }, [allSlugs, assets.serviceOrder]);

  // Generate slides metadata for AdminUploadModal
  const serviceSlides = useMemo(() => {
    return SERVICES.map((slug, index) => {
      const meta = allServiceMeta[slug];
      const rawImage = assets.serviceCovers?.[slug] || meta?.image || "";
      return {
        index,
        slug,
        label: meta?.title || slug,
        imageUrl: getOptimizedCloudinaryUrl(rawImage, 'THUMBNAIL'),
      };
    });
  }, [SERVICES, allServiceMeta, assets.serviceCovers]);

  // Desktop items for HaloReel (100% preserved)
  const desktopCurrentSlug = SERVICES[desktopActiveIndex] || SERVICES[0];
  const desktopCurrentMeta = allServiceMeta[desktopCurrentSlug] || {
    title: desktopCurrentSlug,
    description: "",
    image: "",
  };

  const reelItems: HaloReelItem[] = useMemo(() => {
    return SERVICES.map((slug) => {
      const meta = allServiceMeta[slug];
      const rawImage = assets.serviceCovers?.[slug] || meta?.image || "";

      return {
        slug,
        title: meta?.title || slug,
        subtitle: "View Collection",
        description: meta?.description || "",
        src: getOptimizedCloudinaryUrl(rawImage, 'CARD'),
        alt: meta?.title || slug,
        onClick: () => {
          navigate(`/collections/${slug}`);
        },
      };
    });
  }, [SERVICES, allServiceMeta, assets.serviceCovers, navigate]);

  // Helper to compute shortest circular distance on the wheel
  const getSlotDiff = (
    index: number,
    activeIndex: number,
    total: number,
  ): number => {
    let diff = (index - activeIndex) % total;
    if (diff < -total / 2) diff += total;
    if (diff > total / 2) diff -= total;
    return diff;
  };

  // Circular coordinate mapping for mobile cards (forms a continuous smooth circle)
  const getCardStyle = (diff: number) => {
    switch (diff) {
      case 0:
        // Active Hero: Center-Right (apex of the wheel)
        return {
          x: 58,
          y: -10,
          scale: 1,
          rotate: 0,
          opacity: 1,
          zIndex: 30,
          pointerEvents: "auto" as const,
        };
      case -1:
        // Previous: Top-Left
        return {
          x: -72,
          y: -115,
          scale: 0.76,
          rotate: -3,
          opacity: 0.82,
          zIndex: 10,
          pointerEvents: "auto" as const,
        };
      case 1:
        // Next: Bottom-Left
        return {
          x: -72,
          y: 110,
          scale: 0.76,
          rotate: 3,
          opacity: 0.82,
          zIndex: 10,
          pointerEvents: "auto" as const,
        };
      case -2:
        // Exiting behind top-left
        return {
          x: -140,
          y: -40,
          scale: 0.55,
          rotate: -8,
          opacity: 0,
          zIndex: 1,
          pointerEvents: "none" as const,
        };
      case 2:
        // Entering behind bottom-left
        return {
          x: -140,
          y: 40,
          scale: 0.55,
          rotate: 8,
          opacity: 0,
          zIndex: 1,
          pointerEvents: "none" as const,
        };
      default:
        // Hidden on the opposite side of the wheel
        return {
          x: -150,
          y: 0,
          scale: 0.5,
          rotate: 0,
          opacity: 0,
          zIndex: 0,
          pointerEvents: "none" as const,
        };
    }
  };

  const handleCardClick = (diff: number, slug: string) => {
    if (diff === 0) {
      navigate(`/collections/${slug}`);
    } else if (diff === -1) {
      handleMobilePrev();
    } else if (diff === 1) {
      handleMobileNext();
    }
  };

  // Mobile 3-Box Carousel logic (Top-Left, Center-Right, Bottom-Left)
  const handleMobileNext = () => {
    setMobileIndex((prev) => (prev + 1) % SERVICES.length);
  };

  const handleMobilePrev = () => {
    setMobileIndex((prev) => (prev - 1 + SERVICES.length) % SERVICES.length);
  };

  // Touch swipe support for mobile (horizontal swipes only to avoid interfering with scrolling)
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || touchStartY === null) return;
    const diffX = touchStartX - e.changedTouches[0].clientX;
    const diffY = touchStartY - e.changedTouches[0].clientY;
    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY) * 1.3) {
      if (diffX > 0) handleMobileNext();
      else handleMobilePrev();
    }
    setTouchStartX(null);
    setTouchStartY(null);
  };

  const activeServiceForAdmin =
    editingServiceIndex !== null ? serviceSlides[editingServiceIndex] : null;

  return (
    <section
      id="services"
      className="relative z-20 overflow-hidden bg-[#F3E9DC] py-14 sm:py-20 lg:py-24 border-t border-[#DCC9B6]/40"
    >
      {/* Background ambient lighting */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 65% 30%, rgba(104,28,43,0.04) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-8 lg:px-14">
        {/* Section Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="min-w-0 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#770000]/20 bg-[#770000]/5 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-[#770000]">
              <span>Our Services</span>
            </div>
            <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight text-[#241F20] sm:text-4xl lg:text-5xl">
              Crafted For Every Chapter
            </h2>
            <p className="mt-3 max-w-xl text-sm sm:text-base text-[#746A67] leading-relaxed">
              Timeless photography crafted with care. Explore our 14 signature
              services and tap any card to view its photo collection.
            </p>
          </div>

          {/* Header Controls: Admin Button */}
          <div className="flex flex-wrap items-center gap-3">
            {isAdmin && (
              <button
                type="button"
                onClick={() =>
                  setEditingServiceIndex(
                    typeof window !== "undefined" && window.innerWidth < 1024
                      ? mobileIndex
                      : desktopActiveIndex,
                  )
                }
                className="flex items-center gap-1.5 rounded-full border border-[#770000]/40 bg-[#770000] px-4 py-2 text-xs font-semibold text-white shadow-md transition-all hover:bg-[#770000] hover:scale-105 cursor-pointer"
              >
                <Camera className="h-3.5 w-3.5 text-[#DCC9B6]" />
                <span>Admin: Change Covers</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* ── 1. DESKTOP VIEW (100% UNCHANGED & SEPARATE) ───────── */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="hidden lg:block relative mt-12 w-full overflow-hidden">
        <HaloReel
          items={reelItems}
          cardWidth={285}
          cardHeight={390}
          minScale={0.42}
          radiusXRatio={0.34}
          centerXRatio={0.08}
          radiusYRatio={0.30}
          visibleCutoff={-0.05}
          autoPlay={true}
          holdDuration={3500}
          stepDuration={800}
          pauseOnHover={true}
          draggable={true}
          showCenterLabel={true}
          onActiveIndexChange={(idx) => setDesktopActiveIndex(idx)}
          onSpinReady={handleSpinReady}
          centerLabel={
            /* Desktop Active Service Showcase */
            <div className="pointer-events-auto flex flex-col items-start justify-center max-w-md text-left px-4 sm:px-8 py-6">
              {/* Category Title & Description with smooth instantaneous sync */}
              <div className="mt-3 min-h-[130px] flex flex-col justify-start">
                <motion.div
                  key={desktopCurrentSlug}
                  initial={{ opacity: 0.25, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="flex flex-col items-start"
                >
                  <h3 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#241F20]">
                    {desktopCurrentMeta.title}
                  </h3>

                  <p className="mt-3.5 text-sm sm:text-base leading-relaxed text-[#746A67]">
                    {desktopCurrentMeta.description}
                  </p>
                </motion.div>
              </div>

              {/* PERMANENT Action Controls (NEVER Unmounts on Category Change) */}
              <div className="mt-6 flex flex-wrap items-center gap-3.5">
                <Link
                  to={`/collections/${desktopCurrentSlug}`}
                  className="group inline-flex items-center gap-2.5 rounded-full bg-[#770000] px-6 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-lg transition-all duration-300 hover:bg-[#770000] hover:scale-105 hover:shadow-xl cursor-pointer"
                >
                  <span>View Collection</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>

                {/* Desktop Navigation Arrows (Moved from top header) */}
                <div
                  className="flex items-center gap-2"
                  data-no-drag
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      spinRef.current?.(-1);
                    }}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-[#770000] bg-[#770000] text-white transition-all hover:bg-[#770000] hover:border-[#770000] shadow-sm cursor-pointer active:scale-95"
                    aria-label="Previous service"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      spinRef.current?.(1);
                    }}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-[#770000] bg-[#770000] text-white transition-all hover:bg-[#770000] hover:border-[#770000] shadow-sm cursor-pointer active:scale-95"
                    aria-label="Next service"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setEditingServiceIndex(desktopActiveIndex)}
                    className="inline-flex items-center gap-2 rounded-full border border-[#770000]/40 bg-white/95 px-4 py-3 text-xs font-semibold text-[#770000] shadow-md transition-all hover:bg-[#770000] hover:text-white cursor-pointer"
                  >
                    <Camera className="h-3.5 w-3.5" />
                    <span>Change Cover</span>
                  </button>
                )}
              </div>
            </div>
          }
          className="h-[620px] lg:h-[720px]"
        />
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* ────────────────────────────────────────────────────────── */}
      {/* ── 2. MOBILE VIEW (SMOOTH CIRCULAR ORBITAL 3-BOX REEL) ─ */}
      {/* ────────────────────────────────────────────────────────── */}
      <div
        className="block lg:hidden relative mt-8 w-full select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative h-[530px] sm:h-[560px] w-full max-w-sm sm:max-w-md mx-auto overflow-hidden">
          {/* Persistent Circular Cards - All cards smoothly orbit without remounting or lag */}
          {SERVICES.map((slug, index) => {
            const diff = getSlotDiff(index, mobileIndex, SERVICES.length);
            const isActive = diff === 0;
            const meta = allServiceMeta[slug];
            const coverImage =
              assets.serviceCovers?.[slug] || meta?.image || "";

            const animStyle = getCardStyle(diff);

            return (
              <motion.div
                key={`mobile-card-${slug}`}
                initial={false}
                animate={animStyle}
                transition={{
                  duration: 0.5,
                  ease: [0.16, 1, 0.3, 1],
                }}
                onClick={() => handleCardClick(diff, slug)}
                className={cn(
                  "absolute top-1/2 left-1/2 w-[215px] sm:w-[230px] h-[285px] sm:h-[305px] -ml-[107.5px] sm:-ml-[115px] -mt-[142.5px] sm:-mt-[152.5px] overflow-hidden rounded-3xl cursor-pointer select-none transition-shadow",
                  isActive
                    ? "border-2 border-white/70 shadow-[0_20px_45px_rgba(0,0,0,0.45)] group active:scale-[0.98]"
                    : "border border-white/50 shadow-lg active:scale-95",
                )}
              >
                <img
                  src={getOptimizedCloudinaryUrl(coverImage, 'CARD')}
                  alt={meta?.title || slug}
                  loading="eager"
                  decoding="async"
                  className="pointer-events-none h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  draggable={false}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1A0B10]/95 via-[#1A0B10]/40 to-transparent p-4 sm:p-5 flex flex-col justify-end text-left">
                  {/* Signature Service badge for active card */}
                  <motion.span
                    animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 4 }}
                    transition={{ duration: 0.25 }}
                    className="text-[9px] uppercase tracking-[0.2em] font-semibold text-[#DCC9B6] mb-1"
                  >
                    Signature Service
                  </motion.span>

                  {/* Title */}
                  <h4
                    className={cn(
                      "font-serif font-bold text-[#FAF6F0] leading-tight drop-shadow-md transition-all duration-300",
                      isActive
                        ? "text-base sm:text-lg line-clamp-2"
                        : "text-xs line-clamp-1",
                    )}
                  >
                    {meta?.title || slug}
                  </h4>

                  {/* View Collection button on active card */}
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.08 }}
                      className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-[#770000] border border-[#DCC9B6]/40 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-lg w-fit backdrop-blur-sm group-hover:bg-[#770000] transition-colors"
                    >
                      <span>View Collection</span>
                      <span>→</span>
                    </motion.div>
                  )}

                  {/* Tap to select hint for inactive cards */}
                  {!isActive && (
                    <span className="text-[9px] uppercase tracking-wider text-[#DCC9B6] opacity-80 mt-1">
                      Tap to select
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}

          {/* Bottom-Right Corner Navigation Controls */}
          <div className="absolute bottom-3 right-3 sm:bottom-5 sm:right-6 z-40 flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-full bg-[#FAF6F0]/95 px-2.5 py-1.5 shadow-md border border-[#DCC9B6]/60 backdrop-blur-sm">
              <span className="text-[11px] font-bold text-[#770000]">
                {mobileIndex + 1}
              </span>
              <span className="text-[10px] text-[#746A67]">/</span>
              <span className="text-[11px] font-semibold text-[#746A67]">
                {SERVICES.length}
              </span>
            </div>

            <button
              type="button"
              onClick={handleMobilePrev}
              className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-[#770000] text-white shadow-lg border border-[#DCC9B6]/30 active:scale-90 transition-transform cursor-pointer"
              aria-label="Previous service"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={handleMobileNext}
              className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-[#770000] text-white shadow-lg border border-[#DCC9B6]/30 active:scale-90 transition-transform cursor-pointer"
              aria-label="Next service"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Admin Upload Modal for Service Covers */}
      {activeServiceForAdmin && (
        <AdminUploadModal
          isOpen={editingServiceIndex !== null}
          onClose={() => setEditingServiceIndex(null)}
          title={`Change "${activeServiceForAdmin.label}" Cover`}
          subtitle="Upload a replacement cover image for this service category via Cloudinary"
          currentImageUrl={activeServiceForAdmin.imageUrl}
          currentTitle={allServiceMeta[activeServiceForAdmin.slug]?.title || activeServiceForAdmin.label}
          currentDescription={allServiceMeta[activeServiceForAdmin.slug]?.description || ""}
          slides={serviceSlides}
          currentSlideIndex={editingServiceIndex ?? 0}
          onSelectSlide={(idx) => setEditingServiceIndex(idx)}
          onUploadSuccess={(url) =>
            updateServiceCover(activeServiceForAdmin.slug, url)
          }
          onResetToDefault={() =>
            resetAsset("serviceCovers", activeServiceForAdmin.slug)
          }
          onReorderSlides={updateServiceOrder}
          onCreateCatalog={async (service: CustomService) => {
            await addCustomService(service);
          }}
          onDeleteCatalog={async (slug: string) => {
            await removeCustomService(slug);
          }}
          customSlugs={customSlugs}
          onUpdateDescription={async (t, d) => {
            await updateServiceDescription(activeServiceForAdmin.slug, t, d);
          }}
          onDeleteCurrentCatalog={async () => {
            if (customSlugs.includes(activeServiceForAdmin.slug)) {
              await removeCustomService(activeServiceForAdmin.slug);
            } else {
              await removeServiceFromOrder(activeServiceForAdmin.slug);
            }
            setEditingServiceIndex(null);
          }}
          isCurrentCustom={customSlugs.includes(activeServiceForAdmin.slug)}
        />

      )}
    </section>
  );
}
