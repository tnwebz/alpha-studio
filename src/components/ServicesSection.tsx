import { useRef, useState, useEffect, useCallback } from 'react';
import { Baby, Camera, Heart, Gift, Home, Star, Sparkles, Music, ChevronLeft, ChevronRight, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, animate } from 'framer-motion';
import { SERVICE_META, type ServiceSlug } from '@/data/gallery';
import { useAdmin } from '@/hooks/useAdmin';
import { useSiteAssets } from '@/hooks/useSiteAssets';
import { AdminUploadModal } from './AdminUploadModal';

const SERVICES: Array<{
  slug: ServiceSlug;
  icon: LucideIcon;
}> = [
  { slug: 'birthday', icon: Gift },
  { slug: 'hindu_wedding', icon: Camera },
  { slug: 'christian_wedding', icon: Heart },
  { slug: 'naming_ceremony', icon: Baby },
  { slug: 'engagement', icon: Heart },
  { slug: 'housewarming', icon: Home },
  { slug: 'puberty', icon: Star },
  { slug: 'aldhi', icon: Sparkles },
  { slug: 'reception', icon: Heart },
  { slug: 'bangle_ceremony', icon: Sparkles },
  { slug: 'salangai_poojai', icon: Music },
  { slug: 'maternity', icon: Baby },
  { slug: 'model_shoot', icon: Camera },
  { slug: 'gift_items', icon: Gift },
];

const GAP = 24;

export function ServicesSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardWidth, setCardWidth] = useState(340);
  const [visibleCards, setVisibleCards] = useState(3);
  const x = useMotionValue(0);

  const { isAdmin } = useAdmin();
  const { assets, updateServiceCover, resetAsset } = useSiteAssets();
  const [editingService, setEditingService] = useState<{
    slug: ServiceSlug;
    title: string;
    currentImage: string;
  } | null>(null);

  const totalCards = SERVICES.length;
  const maxIndex = Math.max(0, totalCards - visibleCards);

  // Responsive: measure container and compute card width + visible count reliably across devices
  useEffect(() => {
    if (!containerRef.current) return;

    const calculate = (w: number) => {
      if (w <= 0) return;
      let cols: number;
      if (w >= 1024) cols = 3;
      else if (w >= 640) cols = 2;
      else cols = 1;

      const computedCard = Math.max(260, (w - GAP * (cols - 1)) / cols);
      setVisibleCards(cols);
      setCardWidth(computedCard);
    };

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        calculate(entry.contentRect.width);
      }
    });

    observer.observe(containerRef.current);
    calculate(containerRef.current.offsetWidth);

    return () => observer.disconnect();
  }, []);

  const getOffset = useCallback(
    (index: number) => -(index * (cardWidth + GAP)),
    [cardWidth],
  );

  const animateTo = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, maxIndex));
      setCurrentIndex(clamped);
      animate(x, getOffset(clamped), {
        type: 'spring',
        stiffness: 300,
        damping: 35,
      });
    },
    [maxIndex, x, getOffset],
  );

  // Re-snap when cardWidth changes (e.g. on resize)
  useEffect(() => {
    const clamped = Math.max(0, Math.min(currentIndex, maxIndex));
    if (clamped !== currentIndex) setCurrentIndex(clamped);
    x.set(getOffset(clamped));
  }, [cardWidth, maxIndex, currentIndex, getOffset, x]);

  const handlePrev = () => animateTo(currentIndex - 1);
  const handleNext = () => animateTo(currentIndex + 1);

  const handleDragEnd = (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    const step = cardWidth + GAP;
    const currentOffset = x.get();
    const projected = currentOffset + info.velocity.x * 0.3;
    const rawIndex = Math.round(-projected / step);
    animateTo(rawIndex);
  };

  const stripWidth = totalCards * cardWidth + (totalCards - 1) * GAP;
  const containerW = containerRef.current?.offsetWidth ?? 0;
  const dragLeft = -(stripWidth - containerW);

  return (
    <section id="services" className="bg-[#F3E9DC] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-14">
        {/* Header with nav arrows */}
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <h2 className="font-serif text-3xl font-bold text-[#241F20] sm:text-4xl lg:text-5xl">
              Our Services
            </h2>
            <p className="mt-4 max-w-xl text-sm sm:text-base text-[#746A67]">
              Timeless photography crafted with care for every chapter of your story.
            </p>
          </div>

          {/* Navigation arrows */}
          <div className="flex shrink-0 items-center gap-3">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#681C2B] bg-[#681C2B] text-white transition-all hover:bg-[#3D111B] hover:border-[#3D111B] disabled:pointer-events-none disabled:opacity-30 sm:h-12 sm:w-12 shadow-sm"
              aria-label="Previous services"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex >= maxIndex}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#681C2B] bg-[#681C2B] text-white transition-all hover:bg-[#3D111B] hover:border-[#3D111B] disabled:pointer-events-none disabled:opacity-30 sm:h-12 sm:w-12 shadow-sm"
              aria-label="Next services"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Carousel track — full bleed so cards sit edge-to-edge */}
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-14">
        <div ref={containerRef} className="relative mt-14 overflow-hidden">
          <motion.div
            className="flex cursor-grab active:cursor-grabbing"
            style={{ x, gap: GAP }}
            drag="x"
            dragConstraints={{ left: dragLeft, right: 0 }}
            dragElastic={0.08}
            onDragEnd={handleDragEnd}
          >
            {SERVICES.map(({ slug, icon: Icon }) => {
              const meta = SERVICE_META[slug];
              if (!meta) return null;
              const coverImage = assets.serviceCovers?.[slug] || meta.image;

              return (
                <motion.div
                  key={slug}
                  className="shrink-0"
                  style={{ width: cardWidth }}
                >
                  <Link
                    to={`/collections/${slug}`}
                    className="group relative block overflow-hidden rounded-2xl bg-[#FAF6F0] border border-[#DCC9B6] shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
                    draggable={false}
                  >
                    {/* Admin Change Cover Button */}
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setEditingService({ slug, title: meta.title, currentImage: coverImage });
                        }}
                        className="absolute top-3 left-3 z-30 flex items-center gap-1.5 rounded-full bg-[#3D111B]/90 px-3 py-1.5 text-[11px] font-semibold text-white shadow-xl backdrop-blur-md border border-[#681C2B]/40 transition-all hover:bg-[#681C2B] hover:scale-105"
                      >
                        <Camera className="h-3 w-3 text-[#DCC9B6]" />
                        <span>Change Cover</span>
                      </button>
                    )}

                    <div className="h-56 overflow-hidden rounded-t-2xl sm:h-64 lg:h-72">
                      <img
                        src={coverImage}
                        alt={meta.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        draggable={false}
                      />
                    </div>

                    <div
                      className="relative -mt-8 bg-[#FAF6F0] px-5 pb-6 pt-10 rounded-b-2xl sm:px-6 sm:pb-8"
                      style={{ clipPath: 'polygon(0 14%, 100% 0, 100% 100%, 0 100%)' }}
                    >
                      <div className="absolute -top-6 right-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#681C2B] shadow-lg sm:right-6 sm:h-12 sm:w-12">
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="pr-14 text-lg font-bold text-[#241F20] sm:text-xl">{meta.title}</h3>
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#746A67] sm:mt-3">{meta.description}</p>
                      <span className="mt-3 inline-block text-xs font-semibold uppercase tracking-wider text-[#681C2B] group-hover:text-[#3D111B] sm:mt-4 transition-colors">
                        View collection →
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Dot indicators */}
        <div className="mt-8 flex items-center justify-center gap-2">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => animateTo(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentIndex
                  ? 'w-8 bg-[#681C2B]'
                  : 'w-2 bg-[#DCC9B6] hover:bg-[#746A67]'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Admin Upload Modal for Service Box Cover */}
      {editingService && (
        <AdminUploadModal
          isOpen={Boolean(editingService)}
          onClose={() => setEditingService(null)}
          title={`Change "${editingService.title}" Box Cover`}
          subtitle="Upload a replacement cover image for this service box via Cloudinary"
          currentImageUrl={editingService.currentImage}
          onUploadSuccess={(url) => updateServiceCover(editingService.slug, url)}
          onResetToDefault={() => resetAsset('serviceCovers', editingService.slug)}
        />
      )}
    </section>
  );
}
