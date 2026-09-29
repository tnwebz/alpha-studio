"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Camera, Edit3, Plus, Trash2 } from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";
import {
  useSiteAssets,
  type AboutCardData,
  DEFAULT_ABOUT_CARDS,
} from "@/hooks/useSiteAssets";
import { getOptimizedCloudinaryUrl } from "@/lib/cloudinary";
import { AboutEditModal } from "./AboutEditModal";

interface AnimatedTestimonialsProps {
  cards: AboutCardData[];
  autoplay?: boolean;
  isAdmin?: boolean;
  onEditBox: () => void;
  onAddBox: () => void;
  onDeleteBox: () => void;
  active: number;
  setActive: React.Dispatch<React.SetStateAction<number>>;
}

// --- Main Animated Cards / Testimonials Component ---
export const AnimatedTestimonials = ({
  cards,
  autoplay = false,
  isAdmin = false,
  onEditBox,
  onAddBox,
  onDeleteBox,
  active,
  setActive,
}: AnimatedTestimonialsProps) => {
  const handleNext = useCallback(() => {
    setActive((prev) => (prev + 1) % cards.length);
  }, [cards.length, setActive]);

  const handlePrev = useCallback(() => {
    setActive((prev) => (prev - 1 + cards.length) % cards.length);
  }, [cards.length, setActive]);

  useEffect(() => {
    if (!autoplay) return;
    const interval = setInterval(handleNext, 6000);
    return () => clearInterval(interval);
  }, [autoplay, handleNext]);

  const isActive = (index: number) => index === active;

  // Natural tilt angles for the stacked cards (stable across re-renders to prevent jitter)
  const rotations = useMemo(
    () => ["-7deg", "6deg", "-5deg", "7deg", "-4deg"],
    [],
  );
  const getRotation = (index: number) => rotations[index % rotations.length];

  const activeCard = cards[active] || cards[0] || {
    id: 'empty',
    name: 'Alpha Stories',
    designation: 'Creative Team',
    quote: '',
    src: '',
  };

  return (
    <div className="mx-auto max-w-sm px-4 py-8 font-sans antialiased md:max-w-4xl md:px-8 lg:px-12">
      <div className="relative grid grid-cols-1 gap-y-12 md:grid-cols-2 md:gap-x-16 lg:gap-x-20 items-center">
        {/* ── Left Column: Stacked 3D Animated Cards ── */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative h-80 sm:h-96 w-full max-w-xs sm:max-w-sm">
            <AnimatePresence>
              {cards.map((card, index) => (
                <motion.div
                  key={card.id || `box-card-${index}`}
                  initial={{
                    opacity: 0,
                    scale: 0.9,
                    y: 50,
                    rotate: getRotation(index),
                  }}
                  animate={{
                    opacity: isActive(index) ? 1 : 0.6,
                    scale: isActive(index) ? 1 : 0.92,
                    y: isActive(index) ? 0 : 20,
                    zIndex: isActive(index)
                      ? cards.length
                      : cards.length - Math.abs(index - active),
                    rotate: isActive(index) ? "0deg" : getRotation(index),
                  }}
                  exit={{ opacity: 0, scale: 0.9, y: -50 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="absolute inset-0 origin-bottom"
                  style={{ perspective: "1000px" }}
                >
                  {card.src ? (
                    <img
                      src={getOptimizedCloudinaryUrl(card.src, 'CARD')}
                      alt={card.name || `Box ${index + 1}`}
                      width={500}
                      height={500}
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      className="h-full w-full rounded-3xl object-cover shadow-2xl border-2 border-white/60 bg-black/10"
                      onError={(e) => {
                        e.currentTarget.src = `https://placehold.co/500x500/e2e8f0/64748b?text=${(card.name || "A").charAt(0)}`;
                        e.currentTarget.onerror = null;
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#dbbc80] bg-[#FAF6F0] p-6 shadow-2xl transition-all">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E5D7C5]/70 text-[#530000] mb-3 shadow-inner">
                        <Camera className="h-7 w-7 stroke-[1.5]" />
                      </div>
                      <span className="font-serif text-base font-bold text-[#241F20]">
                        {card.name || `Box ${index + 1}`}
                      </span>
                      <span className="mt-1 text-xs text-[#746A67] text-center font-medium">
                        {isAdmin
                          ? "Click 'Edit Box' below to add photo"
                          : "Story Coming Soon"}
                      </span>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Admin Action Toolbar below the cards */}
          {isAdmin && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={onEditBox}
                className="flex items-center gap-1.5 rounded-full border border-[#530000]/40 bg-white/95 px-3.5 py-2 text-xs font-semibold text-[#530000] shadow-sm transition-all hover:bg-[#530000] hover:text-white cursor-pointer"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Admin: Edit Box {active + 1} Content & Photo</span>
              </button>

              <button
                type="button"
                onClick={onAddBox}
                className="flex items-center gap-1.5 rounded-full border border-emerald-600/40 bg-white/95 px-3.5 py-2 text-xs font-semibold text-emerald-800 shadow-sm transition-all hover:bg-emerald-700 hover:text-white cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>+ Add New Box</span>
              </button>

              {cards.length > 1 && (
                <button
                  type="button"
                  onClick={onDeleteBox}
                  className="flex items-center gap-1.5 rounded-full border border-red-400/40 bg-white/95 px-3 py-2 text-xs font-semibold text-red-600 shadow-sm transition-all hover:bg-red-600 hover:text-white cursor-pointer"
                  title={`Delete Box ${active + 1}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete Box {active + 1}</span>
                </button>
              )}
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
                  {activeCard.name ||
                    (isAdmin ? `Box ${active + 1} (Empty)` : "Coming Soon")}
                </h3>
                <p className="mt-2 text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-[#530000]">
                  {activeCard.designation ||
                    (isAdmin ? "No Designation Set" : "Alpha Stories")}
                </p>
                <motion.p className="mt-6 text-base sm:text-lg leading-relaxed sm:leading-loose text-[#52525b] italic">
                  {activeCard.quote
                    ? `"${activeCard.quote}"`
                    : isAdmin
                      ? "This box is currently empty. Click 'Edit Box Content' below to add a photo, name, designation, and story."
                      : "New team member profile and story will be added here soon."}
                </motion.p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows, Pagination Dots & Admin Actions */}
          <div className="flex flex-wrap items-center gap-4 pt-10">
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrev}
                aria-label="Previous box"
                className="group flex h-11 w-11 items-center justify-center rounded-full border border-[#dbbc80] bg-white text-[#241F20] shadow-sm transition-all duration-300 hover:bg-[#530000] hover:border-[#530000] hover:text-white focus:outline-none cursor-pointer"
              >
                <ArrowLeft className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1" />
              </button>
              <button
                onClick={handleNext}
                aria-label="Next box"
                className="group flex h-11 w-11 items-center justify-center rounded-full border border-[#dbbc80] bg-white text-[#241F20] shadow-sm transition-all duration-300 hover:bg-[#530000] hover:border-[#530000] hover:text-white focus:outline-none cursor-pointer"
              >
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>

            {/* Slide Indicators for all cards */}
            <div className="flex items-center gap-2">
              {cards.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActive(i)}
                  className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                    i === active
                      ? "w-7 bg-[#530000]"
                      : "w-2.5 bg-[#dbbc80] hover:bg-[#530000]/50"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            {/* Admin Shortcuts for Edit, Add & Delete */}
            {isAdmin && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onEditBox}
                  className="flex items-center gap-1.5 rounded-full border border-[#530000]/30 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-[#530000] shadow-sm transition-all hover:bg-[#530000] hover:text-white cursor-pointer"
                >
                  <Edit3 className="h-3 w-3" />
                  <span>Edit Content</span>
                </button>

                <button
                  type="button"
                  onClick={onAddBox}
                  className="flex items-center gap-1.5 rounded-full border border-emerald-600/30 bg-emerald-50/80 px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm transition-all hover:bg-emerald-700 hover:text-white cursor-pointer"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add Box</span>
                </button>

                {cards.length > 1 && (
                  <button
                    type="button"
                    onClick={onDeleteBox}
                    className="flex items-center gap-1 rounded-full border border-red-300/60 bg-red-50/80 px-2.5 py-1.5 text-xs font-semibold text-red-600 shadow-sm transition-all hover:bg-red-600 hover:text-white cursor-pointer"
                    title={`Delete Box ${active + 1}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- About Section Exported Component ---
export function AboutSection() {
  const [active, setActive] = useState(0);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'edit' | 'add'>('edit');

  const { isAdmin } = useAdmin();
  const { assets, updateAboutCard, addAboutCard, deleteAboutCard, resetAsset } = useSiteAssets();

  // Combine defaults with real-time assets from Firestore / LocalStorage
  const cards: AboutCardData[] = useMemo(() => {
    const rawList =
      assets.aboutCards && assets.aboutCards.length > 0
        ? assets.aboutCards
        : DEFAULT_ABOUT_CARDS;

    return rawList.map((card, idx) => {
      const fallbackSrc =
        idx === 0
          ? assets.aboutPhotos?.alwin || "/photo1.png"
          : idx === 1
            ? assets.aboutPhotos?.x || "/photo2.png"
            : "";

      return {
        id: card.id || `card_${idx + 1}`,
        name: card.name ?? "",
        designation: card.designation ?? "",
        quote: card.quote ?? "",
        src: card.src || (idx < 2 ? fallbackSrc : ""),
      };
    });
  }, [assets.aboutCards, assets.aboutPhotos]);

  // Keep active index in bounds if cards change
  useEffect(() => {
    if (active >= cards.length && cards.length > 0) {
      setActive(Math.max(0, cards.length - 1));
    }
  }, [cards.length, active]);

  const handleDeleteActiveBox = async () => {
    if (cards.length <= 1) {
      alert("At least one profile box must remain in the About section.");
      return;
    }
    const currentName = cards[active]?.name || `Box ${active + 1}`;
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${currentName}" (Box ${active + 1})?`
    );
    if (!confirmed) return;

    try {
      await deleteAboutCard(active);
      setActive((prev) => (prev >= cards.length - 1 ? Math.max(0, cards.length - 2) : prev));
    } catch (err) {
      console.error("Failed to delete card:", err);
      alert("Failed to delete box. Please try again.");
    }
  };

  return (
    <section
      id="about"
      className="relative z-20 overflow-hidden bg-[#FAF6F0] px-4 py-16 sm:px-8 sm:py-24 lg:px-12 lg:py-28 border-t border-[#dbbc80]/40"
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
          <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight text-[#241F20] sm:text-4xl lg:text-5xl">
            The Visionaries Behind Alpha Stories
          </h2>
          <p className="mt-2.5 max-w-2xl mx-auto text-sm sm:text-base text-[#746A67]">
            Meet our proprietors and creative artists who bring artistic
            mastery, emotional depth, and unparalleled visual craftsmanship to
            every story we capture.
          </p>
        </div>

        {/* Core Animated Testimonials Card Deck */}
        <AnimatedTestimonials
          cards={cards}
          autoplay={false}
          isAdmin={isAdmin}
          onEditBox={() => {
            setModalTab('edit');
            setEditModalOpen(true);
          }}
          onAddBox={() => {
            setModalTab('add');
            setEditModalOpen(true);
          }}
          onDeleteBox={handleDeleteActiveBox}
          active={active}
          setActive={setActive}
        />
      </div>

      {/* Admin About Edit Modal */}
      {isAdmin && (
        <AboutEditModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          cards={cards}
          initialActiveIndex={active}
          initialTab={modalTab}
          onSaveCard={async (idx, updatedCard) => {
            await updateAboutCard(idx, updatedCard);
          }}
          onAddCard={async (newCard) => {
            await addAboutCard(newCard);
          }}
          onDeleteCard={async (idx) => {
            await deleteAboutCard(idx);
          }}
          onResetCard={async (idx) => {
            await resetAsset("aboutCards", idx);
          }}
        />
      )}
    </section>
  );
}
