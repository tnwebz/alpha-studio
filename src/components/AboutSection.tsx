"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Camera, Sparkles } from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';
import { useSiteAssets } from '@/hooks/useSiteAssets';
import { AdminUploadModal } from './AdminUploadModal';

export type Testimonial = {
  quote: string;
  name: string;
  designation: string;
  src: string;
};

interface AnimatedTestimonialsProps {
  testimonials: Testimonial[];
  autoplay?: boolean;
  isAdmin?: boolean;
  onAdminChangePhoto?: () => void;
  active: number;
  setActive: React.Dispatch<React.SetStateAction<number>>;
}

// --- Main Animated Cards / Testimonials Component ---
export const AnimatedTestimonials = ({
  testimonials,
  autoplay = true,
  isAdmin = false,
  onAdminChangePhoto,
  active,
  setActive,
}: AnimatedTestimonialsProps) => {
  const handleNext = useCallback(() => {
    setActive((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length, setActive]);

  const handlePrev = useCallback(() => {
    setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, [testimonials.length, setActive]);

  useEffect(() => {
    if (!autoplay) return;
    const interval = setInterval(handleNext, 6000);
    return () => clearInterval(interval);
  }, [autoplay, handleNext]);

  const isActive = (index: number) => index === active;

  // Stable natural tilt angles for the stacked cards (prevents jitter on re-renders)
  const rotations = useMemo(() => ["-6deg", "6deg"], []);
  const getRotation = (index: number) => rotations[index % rotations.length];

  return (
    <div className="mx-auto max-w-sm px-4 py-8 font-sans antialiased md:max-w-4xl md:px-8 lg:px-12">
      <div className="relative grid grid-cols-1 gap-y-12 md:grid-cols-2 md:gap-x-16 lg:gap-x-20 items-center">
        {/* ── Left Column: Stacked 3D Animated Cards ── */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative h-80 sm:h-96 w-full max-w-xs sm:max-w-sm">
            <AnimatePresence>
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.src}
                  initial={{ opacity: 0, scale: 0.9, y: 50, rotate: getRotation(index) }}
                  animate={{
                    opacity: isActive(index) ? 1 : 0.6,
                    scale: isActive(index) ? 1 : 0.92,
                    y: isActive(index) ? 0 : 20,
                    zIndex: isActive(index)
                      ? testimonials.length
                      : testimonials.length - Math.abs(index - active),
                    rotate: isActive(index) ? '0deg' : getRotation(index),
                  }}
                  exit={{ opacity: 0, scale: 0.9, y: -50 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="absolute inset-0 origin-bottom"
                  style={{ perspective: '1000px' }}
                >
                  <img
                    src={testimonial.src}
                    alt={testimonial.name}
                    width={500}
                    height={500}
                    draggable={false}
                    className="h-full w-full rounded-3xl object-cover shadow-2xl border-2 border-white/60"
                    onError={(e) => {
                      e.currentTarget.src = `https://placehold.co/500x500/e2e8f0/64748b?text=${testimonial.name.charAt(0)}`;
                      e.currentTarget.onerror = null;
                    }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Admin Change Photo Button */}
          {isAdmin && onAdminChangePhoto && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={onAdminChangePhoto}
                className="flex items-center gap-2 rounded-full border border-[#681C2B]/40 bg-white/95 px-4 py-2 text-xs font-semibold text-[#681C2B] shadow-md transition-all hover:bg-[#681C2B] hover:text-white cursor-pointer"
              >
                <Camera className="h-3.5 w-3.5" />
                <span>Admin: Change {testimonials[active].name} Photo</span>
              </button>
            </div>
          )}
        </div>

        {/* ── Right Column: Text & Navigation Controls ── */}
        <div className="flex flex-col justify-center py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="flex flex-col justify-between"
            >
              <div>
                <h3 className="font-serif text-3xl font-bold tracking-tight text-[#241F20] sm:text-4xl">
                  {testimonials[active].name}
                </h3>
                <p className="mt-2 text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-[#681C2B]">
                  {testimonials[active].designation}
                </p>
                <motion.p className="mt-6 text-base sm:text-lg leading-relaxed sm:leading-loose text-[#52525b] italic">
                  "{testimonials[active].quote}"
                </motion.p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows & Pagination Dots */}
          <div className="flex items-center gap-4 pt-10">
            <button
              onClick={handlePrev}
              aria-label="Previous proprietor"
              className="group flex h-11 w-11 items-center justify-center rounded-full border border-[#DCC9B6] bg-white text-[#241F20] shadow-sm transition-all duration-300 hover:bg-[#681C2B] hover:border-[#681C2B] hover:text-white focus:outline-none cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next proprietor"
              className="group flex h-11 w-11 items-center justify-center rounded-full border border-[#DCC9B6] bg-white text-[#241F20] shadow-sm transition-all duration-300 hover:bg-[#681C2B] hover:border-[#681C2B] hover:text-white focus:outline-none cursor-pointer"
            >
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>

            {/* Slide Indicators */}
            <div className="flex items-center gap-2 ml-3">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActive(i)}
                  className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                    i === active
                      ? "w-7 bg-[#681C2B]"
                      : "w-2.5 bg-[#DCC9B6] hover:bg-[#681C2B]/50"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- About Section Exported Component ---
export function AboutSection() {
  const [active, setActive] = useState(0);
  const [adminModalOpen, setAdminModalOpen] = useState(false);

  const { isAdmin } = useAdmin();
  const { assets, updateAboutPhoto, resetAsset } = useSiteAssets();

  // ONLY photo1.png and photo2.png used as requested
  const photo1 = assets.aboutPhotos?.alwin || "/photo1.png";
  const photo2 = assets.aboutPhotos?.x || "/photo2.png";

  const testimonials: Testimonial[] = [
    {
      name: "Mr. Alwin",
      designation: "Proprietor & Lead Storyteller",
      quote:
        "With an eye for emotion and a passion for storytelling, I capture authentic moments and transform them into timeless cinematic memories. Every frame is crafted with care, preserving genuine emotions, beautiful details, and fleeting moments so you can relive your most cherished memories for years to come.",
      src: photo1,
    },
    {
      name: "Mr. X",
      designation: "Proprietor & Creative Director",
      quote:
        "Behind every great photograph lies an unspoken narrative. Our dedication is to craft visual legacies that transcend time—blending editorial elegance with heartfelt candid moments to celebrate life's most meaningful chapters.",
      src: photo2,
    },
  ];

  return (
    <section
      id="about"
      className="relative z-20 overflow-hidden bg-[#FAF6F0] px-4 py-16 sm:px-8 sm:py-24 lg:px-12 lg:py-28 border-t border-[#DCC9B6]/40"
    >
      {/* Animated grid background with subtle opacity */}
      <style>
        {`
          @keyframes animate-grid {
            0% { background-position: 0% 50%; }
            100% { background-position: 100% 50%; }
          }
          .animated-grid {
            width: 200%;
            height: 200%;
            background-image: 
              linear-gradient(to right, rgba(104,28,43,0.06) 1px, transparent 1px), 
              linear-gradient(to bottom, rgba(104,28,43,0.06) 1px, transparent 1px);
            background-size: 3rem 3rem;
            animation: animate-grid 40s linear infinite alternate;
          }
        `}
      </style>
      <div className="animated-grid pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-25" />

      {/* Atmospheric ambient glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, rgba(104,28,43,0.035) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-8 sm:mb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#681C2B]/20 bg-[#681C2B]/5 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-[#681C2B]">
            <Sparkles className="h-3 w-3 text-[#681C2B]" />
            <span>About Us</span>
          </div>
          <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight text-[#241F20] sm:text-4xl lg:text-5xl">
            The Visionaries Behind Alpha Stories
          </h2>
          <p className="mt-2.5 max-w-2xl mx-auto text-sm sm:text-base text-[#746A67]">
            Meet our proprietors who bring artistic mastery, emotional depth, and
            unparalleled visual craftsmanship to every story we capture.
          </p>
        </div>

        {/* Core Animated Testimonials Card Deck */}
        <AnimatedTestimonials
          testimonials={testimonials}
          autoplay={false}
          isAdmin={isAdmin}
          onAdminChangePhoto={() => setAdminModalOpen(true)}
          active={active}
          setActive={setActive}
        />
      </div>

      {/* Cloudinary Upload Modal for Proprietor Photo */}
      {isAdmin && (
        <AdminUploadModal
          isOpen={adminModalOpen}
          onClose={() => setAdminModalOpen(false)}
          title={`Change ${testimonials[active].name} Photo`}
          subtitle={`Upload a high-resolution portrait for ${testimonials[active].name} (${testimonials[active].designation}) via Cloudinary`}
          currentImageUrl={testimonials[active].src}
          onUploadSuccess={async (url) => {
            const activeKey = active === 0 ? "alwin" : "x";
            await updateAboutPhoto(activeKey, url);
          }}
          onResetToDefault={async () => {
            const activeKey = active === 0 ? "alwin" : "x";
            await resetAsset("aboutPhotos", activeKey);
          }}
        />
      )}
    </section>
  );
}
