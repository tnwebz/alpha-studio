"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Type, RotateCcw, Check, Sparkles } from "lucide-react";
import type { HeroSlideText } from "@/hooks/useSiteAssets";

interface HeroTextEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSlideIndex: number;
  slidesCount: number;
  slidesText?: Record<number, HeroSlideText>;
  defaultSlidesText: Record<number, HeroSlideText>;
  onSave: (index: number, text: HeroSlideText) => Promise<void> | void;
  onReset: (index: number) => Promise<void> | void;
  onSelectSlide: (index: number) => void;
}

export function HeroTextEditModal({
  isOpen,
  onClose,
  currentSlideIndex,
  slidesCount,
  slidesText,
  defaultSlidesText,
  onSave,
  onReset,
  onSelectSlide,
}: HeroTextEditModalProps) {
  const [activeSlide, setActiveSlide] = useState(currentSlideIndex);
  const [headlineTop, setHeadlineTop] = useState("");
  const [headlineBottom, setHeadlineBottom] = useState("");
  const [subtext, setSubtext] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync state whenever active slide or props change
  useEffect(() => {
    setActiveSlide(currentSlideIndex);
  }, [currentSlideIndex]);

  useEffect(() => {
    const current =
      slidesText?.[activeSlide] ||
      defaultSlidesText[activeSlide] ||
      defaultSlidesText[0];

    setHeadlineTop(current.headlineTop || "");
    setHeadlineBottom(current.headlineBottom || "");
    setSubtext(current.subtext || "");
    setSavedSuccess(false);
  }, [activeSlide, slidesText, defaultSlidesText]);

  if (!isOpen) return null;

  const handleSlideChange = (index: number) => {
    setActiveSlide(index);
    onSelectSlide(index);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(activeSlide, {
        headlineTop: headlineTop.trim() || defaultSlidesText[activeSlide]?.headlineTop || "Capture your",
        headlineBottom: headlineBottom.trim() || defaultSlidesText[activeSlide]?.headlineBottom || "memories",
        subtext: subtext.trim() || defaultSlidesText[activeSlide]?.subtext || "",
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      console.error("Failed to save slide text:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm(`Reset text for Slide ${activeSlide + 1} back to default original?`)) {
      await onReset(activeSlide);
      const def = defaultSlidesText[activeSlide] || defaultSlidesText[0];
      setHeadlineTop(def.headlineTop);
      setHeadlineBottom(def.headlineBottom);
      setSubtext(def.subtext);
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          className="relative w-full max-w-xl rounded-2xl border border-[#530000]/50 bg-[#1D0A0F] text-[#FAF6F0] shadow-2xl overflow-hidden my-auto"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-[#530000]/40 bg-[#15070B] px-5 pt-5 pb-4 sm:px-6">
            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#530000]/60 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#dbbc80]">
                <Type className="h-3 w-3 text-[#dbbc80]" />
                <span>Hero Typography Editor</span>
              </div>
              <h3 className="mt-1.5 font-serif text-lg font-bold text-[#FAF6F0]">
                Customize Slide {activeSlide + 1} Text
              </h3>
              <p className="text-xs text-[#dbbc80]/80 mt-0.5">
                Edit headlines and story subtext shown on Slide {activeSlide + 1}.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-full bg-white/10 p-2 text-zinc-300 hover:bg-red-600 hover:text-white transition-all cursor-pointer"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Slide Switcher Tabs */}
          <div className="flex items-center gap-2 border-b border-[#530000]/30 bg-[#120509] px-5 py-2.5 sm:px-6 overflow-x-auto">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#dbbc80] shrink-0 mr-1">
              Select Slide:
            </span>
            {Array.from({ length: slidesCount }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSlideChange(idx)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  activeSlide === idx
                    ? "bg-[#530000] text-white shadow-md border border-[#dbbc80]/40 ring-1 ring-[#dbbc80]/60"
                    : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span>Slide {idx + 1}</span>
                {slidesText?.[idx] && (
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" title="Has custom text" />
                )}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-4 max-h-[68vh] overflow-y-auto">
            {/* Top Headline */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#dbbc80]">
                  Top Main Headline
                </label>
                <span className="text-[10px] text-zinc-400">e.g. Capture your</span>
              </div>
              <input
                type="text"
                value={headlineTop}
                onChange={(e) => setHeadlineTop(e.target.value)}
                placeholder="Capture your"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-[#dbbc80]/60 focus:outline-none focus:ring-1 focus:ring-[#dbbc80]/60 transition-all font-serif"
              />
            </div>

            {/* Bottom Highlight Headline */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#dbbc80]">
                  Bottom Highlight Keyword / Headline
                </label>
                <span className="text-[10px] text-zinc-400">e.g. memories</span>
              </div>
              <input
                type="text"
                value={headlineBottom}
                onChange={(e) => setHeadlineBottom(e.target.value)}
                placeholder="memories"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-[#dbbc80]/60 focus:outline-none focus:ring-1 focus:ring-[#dbbc80]/60 transition-all font-serif italic"
              />
            </div>

            {/* Story Subtext */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#dbbc80]">
                  Story / Description Subtext
                </label>
                <span className="text-[10px] text-zinc-400">{subtext.length} chars</span>
              </div>
              <textarea
                value={subtext}
                onChange={(e) => setSubtext(e.target.value)}
                rows={3}
                placeholder="There is no such thing as a perfect love story or a perfect wedding. For exactly this reason, we love doing what we do."
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-[#dbbc80]/60 focus:outline-none focus:ring-1 focus:ring-[#dbbc80]/60 transition-all resize-none leading-relaxed"
              />
            </div>

            {/* Live Visual Preview */}
            <div className="rounded-xl border border-white/10 bg-black/50 p-4 relative overflow-hidden">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#dbbc80] mb-2">
                <Sparkles className="h-3 w-3 text-[#dbbc80]" />
                <span>Live Typography Preview (Slide {activeSlide + 1})</span>
              </div>
              <div className="space-y-2 border-l-2 border-[#530000] pl-3 py-1">
                <h4 className="font-serif text-xl sm:text-2xl text-white font-normal leading-tight">
                  {headlineTop || "Capture your"}
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed max-w-md">
                  {subtext || "There is no such thing as a perfect love story..."}
                </p>
                <div className="font-serif text-lg sm:text-xl text-[#FAF6F0] font-normal leading-none pt-1">
                  {headlineBottom || "memories"}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-[#530000]/30 gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1.5 text-xs text-[#dbbc80] hover:text-white transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset to default</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-1.5 rounded-xl bg-[#530000] px-5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition-all hover:bg-[#880000] hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {savedSuccess ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-green-300" />
                      <span>Saved!</span>
                    </>
                  ) : isSaving ? (
                    <span>Saving...</span>
                  ) : (
                    <span>Save Slide {activeSlide + 1}</span>
                  )}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
