import { AnimatePresence, motion } from 'framer-motion';
import { useState, type MouseEvent } from 'react';

type ExpandableGalleryProps = {
  images: string[];
  className?: string;
};

export function ExpandableGallery({ images, className = '' }: ExpandableGalleryProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const getFlexValue = (index: number) => {
    if (hoveredIndex === null) return 1;
    return hoveredIndex === index ? 2 : 0.5;
  };

  const closeImage = () => setSelectedIndex(null);

  const goToNext = (e: MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % images.length);
    }
  };

  const goToPrev = (e: MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + images.length) % images.length);
    }
  };

  return (
    <div className={className}>
      <div className="flex h-80 w-full gap-2 sm:h-96">
        {images.map((image, index) => (
          <motion.div
            key={image}
            className="relative cursor-pointer overflow-hidden rounded-md"
            style={{ flex: 1 }}
            animate={{ flex: getFlexValue(index) }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => setSelectedIndex(index)}
          >
            <img src={image} alt={`Gallery ${index + 1}`} className="h-full w-full object-cover" />
            <motion.div
              className="absolute inset-0 bg-black"
              initial={{ opacity: 0 }}
              animate={{ opacity: hoveredIndex === index ? 0 : 0.3 }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 p-4"
            onClick={closeImage}
          >
            <button
              type="button"
              className="absolute top-4 right-4 z-10 text-black hover:text-zinc-500"
              onClick={closeImage}
              aria-label="Close"
            >
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {images.length > 1 && (
              <button
                type="button"
                className="absolute left-4 z-10 text-black hover:text-zinc-500"
                onClick={goToPrev}
                aria-label="Previous"
              >
                <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            <motion.div className="relative max-h-[90vh] w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
              <motion.img
                key={selectedIndex}
                src={images[selectedIndex]}
                alt={`Gallery ${selectedIndex + 1}`}
                className="h-full w-full rounded-md object-contain"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>

            {images.length > 1 && (
              <button
                type="button"
                className="absolute right-4 z-10 text-black hover:text-zinc-500"
                onClick={goToNext}
                aria-label="Next"
              >
                <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-md bg-white/80 px-4 py-2 text-sm text-black">
              {selectedIndex + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
