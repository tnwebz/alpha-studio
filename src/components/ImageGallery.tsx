import React, { useState, useEffect, useRef } from 'react';
import { useInView, AnimatePresence, motion } from 'framer-motion';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { cn } from '@/lib/utils';
import { Trash2, X, ChevronLeft, ChevronRight, Loader2, Play, Camera } from 'lucide-react';
import {
  getOptimizedCloudinaryUrl,
  getCloudinarySrcSet,
  isVideoUrl,
  deleteCloudinaryAsset,
} from '@/lib/cloudinary';
import { LAZY_LOAD_CONFIG } from '@/config/imageConfig';

type ImageGalleryProps = {
  images: string[];
  loading?: boolean;
  embedded?: boolean;
  isAdmin?: boolean;
  onDelete?: (url: string) => void;
};

const BATCH_SIZE = 12;

export function ImageGallery({ images, loading = false, embedded = false, isAdmin, onDelete }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(BATCH_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const isSentinelInView = useInView(sentinelRef, { margin: LAZY_LOAD_CONFIG.rootMargin });

  useEffect(() => {
    // Reset visible count when category images change
    setVisibleCount(BATCH_SIZE);
  }, [images]);

  // Progressive batching on scroll
  useEffect(() => {
    if (isSentinelInView && visibleCount < images.length) {
      setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, images.length));
    }
  }, [isSentinelInView, visibleCount, images.length]);

  // Keyboard navigation for full screen lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === 'ArrowLeft') {
        setSelectedIndex((prev) => (prev !== null ? (prev - 1 + images.length) % images.length : 0));
      } else if (e.key === 'ArrowRight') {
        setSelectedIndex((prev) => (prev !== null ? (prev + 1) % images.length : 0));
      } else if (e.key === 'Escape') {
        setSelectedIndex(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, images.length]);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-5xl px-3 py-10 sm:px-4 sm:py-16">
        <div className="columns-2 gap-4 space-y-4 sm:gap-6 sm:space-y-6 lg:columns-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="break-inside-avoid">
              <AspectRatio ratio={i % 2 === 0 ? 9 / 16 : 16 / 9} className="rounded-lg bg-zinc-200 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="flex flex-col w-full items-center justify-center py-20 px-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E5D7C5]/60 text-[#530000] mb-3">
          <Camera className="h-6 w-6 stroke-[1.5]" />
        </div>
        <p className="font-serif text-base font-semibold text-[#241F20]">No Photos in This Collection Yet</p>
        <p className="mt-1 text-xs sm:text-sm text-[#746A67] max-w-sm">
          {isAdmin ? 'Use the upload section above to add new photographs.' : 'New photographs for this collection will be added soon.'}
        </p>
      </div>
    );
  }

  const visibleImages = images.slice(0, visibleCount);
  const hasMore = visibleCount < images.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, images.length));
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIndex((prev) => (prev !== null ? (prev - 1 + images.length) % images.length : 0));
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIndex((prev) => (prev !== null ? (prev + 1) % images.length : 0));
  };

  const currentMediaSrc = selectedIndex !== null ? images[selectedIndex] : null;

  return (
    <>
      <div
        className={cn(
          'relative flex w-full flex-col items-center justify-center px-3 sm:px-4',
          embedded ? 'bg-transparent py-2 sm:py-4' : 'min-h-0 bg-[#dbbc80] py-10 sm:min-h-screen sm:py-16',
        )}
      >
        <div className="mx-auto w-full max-w-5xl columns-2 gap-4 space-y-4 sm:gap-6 sm:space-y-6 lg:columns-3">
          {visibleImages.map((src, index) => {
            const isPortrait = index % 2 === 0;
            const ratio = isPortrait ? 9 / 16 : 16 / 9;

            return (
              <div key={`${index}-${src}`} className="relative break-inside-avoid">
                <AnimatedImage
                  alt={`Gallery item ${index + 1}`}
                  src={src}
                  ratio={ratio}
                  onClick={() => setSelectedIndex(index)}
                  priority={index < 4}
                />
                {isAdmin && onDelete && (
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to permanently delete this file?')) {
                        deleteCloudinaryAsset(src);
                        onDelete(src);
                      }
                    }}
                    className="absolute right-2 top-2 z-20 rounded-full bg-black/60 p-2 text-white hover:bg-red-500 transition-colors cursor-pointer"
                    title="Delete photo"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Sentinel for progressive infinite loading */}
        {hasMore && <div ref={sentinelRef} className="h-10 w-full" aria-hidden="true" />}

        {/* Manual load more button fallback */}
        {hasMore && (
          <div className="mt-8 flex justify-center pb-8">
            <button
              onClick={handleLoadMore}
              className="flex items-center gap-2 rounded-full border border-[#530000] bg-[#530000] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-md transition-all hover:bg-[#530000] hover:border-[#530000] cursor-pointer"
            >
              <span>Load More ({visibleCount} of {images.length})</span>
            </button>
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox Modal with Next & Prev Controls */}
      <AnimatePresence>
        {selectedIndex !== null && currentMediaSrc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 p-4 backdrop-blur-md select-none"
            onClick={() => setSelectedIndex(null)}
            onContextMenu={(e) => e.preventDefault()}
          >
            {/* Top Bar: Counter & Close button */}
            <div className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between px-2">
              <span className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-white backdrop-blur-md">
                {isVideoUrl(currentMediaSrc) ? 'Video' : 'Photo'} {selectedIndex + 1} of {images.length}
              </span>
              <button
                className="rounded-full bg-white/10 p-2.5 text-white backdrop-blur-md transition-colors hover:bg-white/20 cursor-pointer"
                onClick={() => setSelectedIndex(null)}
                aria-label="Close view"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Previous Media Arrow Button */}
            <button
              type="button"
              onClick={handlePrevPhoto}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-50 flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md transition-all hover:bg-white hover:text-black hover:scale-110 active:scale-95 shadow-2xl cursor-pointer"
              aria-label="Previous item"
            >
              <ChevronLeft className="h-6 w-6 sm:h-8 sm:w-8" />
            </button>

            {/* Main Lightbox Media Display - Loads high-res FULLSCREEN preset only when clicked */}
            <motion.div
              key={selectedIndex}
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex h-[85vh] w-[88vw] items-center justify-center select-none"
              onClick={(e) => e.stopPropagation()}
              onContextMenu={(e) => e.preventDefault()}
            >
              {isVideoUrl(currentMediaSrc) ? (
                <video
                  src={currentMediaSrc}
                  controls
                  autoPlay
                  loop
                  playsInline
                  controlsList="nodownload"
                  className="h-full w-full max-h-[85vh] max-w-[88vw] object-contain rounded-lg shadow-2xl"
                  onContextMenu={(e) => e.preventDefault()}
                />
              ) : (
                <>
                  <img
                    src={getOptimizedCloudinaryUrl(currentMediaSrc, 'FULLSCREEN')}
                    alt={`Photo ${selectedIndex + 1}`}
                    className="h-full w-full object-contain select-none pointer-events-none"
                    draggable={false}
                    loading="eager"
                    decoding="async"
                  />
                  {/* Anti-download transparent overlay for images */}
                  <div className="absolute inset-0 z-10 bg-transparent" />
                </>
              )}
            </motion.div>

            {/* Next Media Arrow Button */}
            <button
              type="button"
              onClick={handleNextPhoto}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-50 flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md transition-all hover:bg-white hover:text-black hover:scale-110 active:scale-95 shadow-2xl cursor-pointer"
              aria-label="Next item"
            >
              <ChevronRight className="h-6 w-6 sm:h-8 sm:w-8" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

type AnimatedImageProps = {
  alt: string;
  src: string;
  ratio: number;
  onClick: () => void;
  priority?: boolean;
};

function AnimatedImage({ alt, src, ratio, onClick, priority }: AnimatedImageProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: LAZY_LOAD_CONFIG.rootMargin });
  const [isLoading, setIsLoading] = React.useState(true);
  const [mediaSrc, setMediaSrc] = React.useState(src);
  const isVideo = isVideoUrl(src);

  useEffect(() => {
    setMediaSrc(src);
  }, [src]);

  // Optimize grid card thumbnail using THUMBNAIL preset (600px width limit) + responsive srcset
  const optimizedThumb = isVideo ? mediaSrc : getOptimizedCloudinaryUrl(mediaSrc, 'THUMBNAIL');
  const srcSet = isVideo ? undefined : getCloudinarySrcSet(mediaSrc, [320, 480, 640]);

  return (
    <div 
      className="cursor-pointer group relative" 
      onClick={onClick}
      onContextMenu={(e) => e.preventDefault()}
    >
      <AspectRatio ref={ref} ratio={ratio} className={cn("relative size-full rounded-lg border border-zinc-200 bg-zinc-100 overflow-hidden", isLoading && "animate-pulse")}>
        {(isInView || priority) ? (
          isVideo ? (
            <div className="relative size-full">
              <video
                src={mediaSrc}
                muted
                loop
                playsInline
                preload="metadata"
                className="size-full rounded-lg object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                onLoadedData={() => setIsLoading(false)}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/25 transition-all group-hover:bg-black/10">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-black shadow-lg backdrop-blur transition-transform group-hover:scale-110">
                  <Play className="h-5 w-5 fill-black ml-0.5" />
                </span>
              </div>
            </div>
          ) : (
            <img
              alt={alt}
              src={optimizedThumb}
              srcSet={srcSet}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 400px"
              className={cn(
                'size-full rounded-lg object-cover opacity-0 transition-all duration-700 ease-in-out group-hover:scale-105 pointer-events-none select-none',
                !isLoading && 'opacity-100',
              )}
              onLoad={() => setIsLoading(false)}
              loading={priority ? 'eager' : 'lazy'}
              fetchPriority={priority ? 'high' : 'auto'}
              decoding="async"
              onError={() => setMediaSrc('/hero.png')}
              draggable={false}
            />
          )
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-100">
            <Loader2 className="h-4 w-4 animate-spin text-zinc-300" />
          </div>
        )}
        {/* Anti-download overlay */}
        <div className="absolute inset-0 z-10 bg-transparent" />
      </AspectRatio>
    </div>
  );
}
