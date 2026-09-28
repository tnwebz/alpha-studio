"use client";

import React, { useState, useRef } from "react";
import {
  X,
  RotateCcw,
  GripVertical,
  Plus,
  Trash2,
  ImageIcon,
} from "lucide-react";
import { CloudinaryUpload } from "./CloudinaryUpload";
import { getOptimizedCloudinaryUrl } from "@/lib/cloudinary";
import type { CustomService } from "@/hooks/useSiteAssets";

export interface ServiceSlide {
  index: number;
  slug: string;
  label: string;
  imageUrl: string;
}

export interface AdminUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  currentImageUrl?: string;
  currentTitle?: string;
  currentDescription?: string;
  onUploadSuccess: (url: string) => Promise<void> | void;
  onResetToDefault?: () => Promise<void> | void;
  // Slide / cover selection
  slides?: ServiceSlide[];
  currentSlideIndex?: number;
  onSelectSlide?: (index: number) => void;
  // Drag-and-drop reorder
  onReorderSlides?: (newOrder: string[]) => Promise<void> | void;
  // Create new catalog
  onCreateCatalog?: (service: CustomService) => Promise<void> | void;
  // Delete a custom catalog
  onDeleteCatalog?: (slug: string) => Promise<void> | void;
  customSlugs?: string[];
  // Edit title + description for any catalog
  onUpdateDescription?: (title: string, description: string) => Promise<void> | void;
  // Delete the currently selected catalog (regardless of built-in/custom)
  onDeleteCurrentCatalog?: () => Promise<void> | void;
  isCurrentCustom?: boolean;
}

/* ── Drag-and-drop reorder panel ──────────────────────────── */
function ReorderPanel({
  slides,
  onReorder,
}: {
  slides: ServiceSlide[];
  onReorder: (newOrder: string[]) => Promise<void> | void;
}) {
  const [order, setOrder] = useState<ServiceSlide[]>([...slides]);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const dragOver = useRef<number | null>(null);

  const handleDragStart = (idx: number) => setDraggingIdx(idx);

  const handleDragEnter = (idx: number) => {
    if (draggingIdx === null || draggingIdx === idx) return;
    dragOver.current = idx;
    const next = [...order];
    const [moved] = next.splice(draggingIdx, 1);
    next.splice(idx, 0, moved);
    setOrder(next);
    setDraggingIdx(idx);
  };

  const handleDragEnd = () => {
    setDraggingIdx(null);
    dragOver.current = null;
  };

  const handleSave = async () => {
    setSaving(true);
    await onReorder(order.map((s) => s.slug));
    setSaving(false);
  };

  return (
    <div className="mt-4 rounded-xl border border-white/10 bg-black/25 p-3">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#DCC9B6]">
          Drag to Reorder Services
        </span>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-full bg-[#770000] px-3 py-1 text-[11px] font-bold text-white transition-all hover:bg-[#770000] disabled:opacity-60 cursor-pointer"
        >
          {saving ? "Saving…" : "Save Order"}
        </button>
      </div>

      <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto pr-1">
        {order.map((slide, idx) => (
          <div
            key={slide.slug}
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragEnter={() => handleDragEnter(idx)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => e.preventDefault()}
            className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 cursor-grab active:cursor-grabbing transition-all select-none ${
              draggingIdx === idx
                ? "border-[#DCC9B6] bg-[#770000]/60 scale-[1.02] shadow-lg"
                : "border-white/10 bg-black/40 hover:border-white/20"
            }`}
          >
            <GripVertical className="h-4 w-4 shrink-0 text-zinc-500" />
            <div className="h-8 w-10 shrink-0 overflow-hidden rounded-lg bg-black/50 border border-white/10">
              {slide.imageUrl ? (
                <img
                  src={slide.imageUrl}
                  alt={slide.label}
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <ImageIcon className="h-3 w-3 text-zinc-600" />
                </div>
              )}
            </div>
            <span className="text-xs font-semibold text-[#FAF6F0] truncate flex-1">
              {slide.label}
            </span>
            <span className="text-[10px] text-zinc-500 shrink-0">#{idx + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Create New Catalog Panel ─────────────────────────────── */
function CreateCatalogPanel({
  onCreate,
}: {
  onCreate: (service: CustomService) => Promise<void> | void;
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    slug: "",
    image: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imageUploaded, setImageUploaded] = useState(false);

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setForm((f) => ({ ...f, title, slug: slugify(title) }));
  };

  const handleImageUpload = (urls: string[]) => {
    if (urls[0]) {
      setForm((f) => ({ ...f, image: urls[0] }));
      setImageUploaded(true);
    }
  };

  const handleCreate = async () => {
    if (!form.title.trim()) return setError("Title is required.");
    if (!form.description.trim()) return setError("Description is required.");
    if (!form.image) return setError("Please upload a cover image.");
    setError("");
    setSaving(true);
    await onCreate({
      slug: form.slug || slugify(form.title),
      title: form.title.trim(),
      description: form.description.trim(),
      image: form.image,
    });
    setForm({ title: "", description: "", slug: "", image: "" });
    setImageUploaded(false);
    setSaving(false);
  };

  return (
    <div className="mt-4 rounded-xl border border-white/10 bg-black/25 p-3">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#DCC9B6]">
        Create New Catalog Box
      </span>

      <div className="mt-3 flex flex-col gap-2.5">
        {/* Title */}
        <div>
          <label className="text-[10px] uppercase tracking-wider text-zinc-400">
            Category Title *
          </label>
          <input
            type="text"
            value={form.title}
            onChange={handleTitleChange}
            placeholder="e.g. Pre-Wedding Shoot"
            className="mt-1 w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-[#DCC9B6]/40 focus:outline-none"
          />
        </div>

        {/* Auto slug */}
        <div>
          <label className="text-[10px] uppercase tracking-wider text-zinc-400">
            URL Slug (auto)
          </label>
          <input
            type="text"
            value={form.slug}
            onChange={(e) =>
              setForm((f) => ({ ...f, slug: slugify(e.target.value) }))
            }
            className="mt-1 w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-xs text-zinc-400 font-mono focus:border-[#DCC9B6]/40 focus:outline-none"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-[10px] uppercase tracking-wider text-zinc-400">
            Description *
          </label>
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            rows={2}
            placeholder="Short description of this service…"
            className="mt-1 w-full resize-none rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-[#DCC9B6]/40 focus:outline-none"
          />
        </div>

        {/* Cover Image Upload */}
        <div>
          <label className="text-[10px] uppercase tracking-wider text-zinc-400">
            Cover Image *
          </label>
          {imageUploaded ? (
            <div className="mt-1 flex items-center gap-2 rounded-lg border border-[#DCC9B6]/30 bg-black/30 px-3 py-2">
              <img
                src={getOptimizedCloudinaryUrl(form.image, 'THUMBNAIL')}
                alt="cover"
                loading="lazy"
                className="h-9 w-12 rounded object-cover border border-white/10"
              />
              <span className="text-xs text-green-400 font-medium">
                Image uploaded ✓
              </span>
              <button
                type="button"
                onClick={() => {
                  setForm((f) => ({ ...f, image: "" }));
                  setImageUploaded(false);
                }}
                className="ml-auto text-zinc-500 hover:text-red-400 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="mt-1">
              <CloudinaryUpload
                maxFiles={1}
                title=""
                buttonText="Upload Cover Image"
                onUploadSuccess={handleImageUpload}
                compact
              />
            </div>
          )}
        </div>

        {error && (
          <p className="text-xs text-red-400 font-medium">{error}</p>
        )}

        <button
          type="button"
          onClick={handleCreate}
          disabled={saving}
          className="mt-1 flex items-center justify-center gap-2 rounded-full bg-[#770000] px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#770000] disabled:opacity-60 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          {saving ? "Creating…" : "Create Catalog"}
        </button>
      </div>
    </div>
  );
}

/* ── Main Modal ───────────────────────────────────────────── */
export function AdminUploadModal({
  isOpen,
  onClose,
  title,
  subtitle,
  currentImageUrl,
  currentTitle = "",
  currentDescription = "",
  onUploadSuccess,
  onResetToDefault,
  slides,
  currentSlideIndex,
  onSelectSlide,
  onReorderSlides,
  onCreateCatalog,
  onDeleteCatalog,
  customSlugs = [],
  onUpdateDescription,
  onDeleteCurrentCatalog,
  isCurrentCustom = false,
}: AdminUploadModalProps) {
  const [tab, setTab] = useState<"cover" | "reorder" | "create">("cover");
  const [editTitle, setEditTitle] = useState(currentTitle);
  const [editDesc, setEditDesc] = useState(currentDescription);
  const [savingDesc, setSavingDesc] = useState(false);

  // Sync edit fields when selected slide changes
  React.useEffect(() => {
    setEditTitle(currentTitle);
    setEditDesc(currentDescription);
  }, [currentTitle, currentDescription]);

  if (!isOpen) return null;

  const handleUpload = async (urls: string[]) => {
    if (urls.length > 0) {
      await onUploadSuccess(urls[0]);
      onClose();
    }
  };

  const handleReset = async () => {
    if (onResetToDefault) {
      if (window.confirm("Reset this image back to the default original?")) {
        await onResetToDefault();
        onClose();
      }
    }
  };

  const handleSaveDescription = async () => {
    if (!onUpdateDescription) return;
    setSavingDesc(true);
    await onUpdateDescription(editTitle.trim(), editDesc.trim());
    setSavingDesc(false);
  };

  const handleDeleteCurrent = async () => {
    if (!onDeleteCurrentCatalog) return;
    if (!window.confirm(`Delete this catalog permanently? This cannot be undone.`)) return;
    await onDeleteCurrentCatalog();
    onClose();
  };

  return (
    /* Full-screen backdrop */
    <div
      className="fixed inset-0 z-[10000] flex items-start justify-center bg-black/80 backdrop-blur-md overflow-y-auto py-4 px-4"
      onClick={onClose}
    >
      {/* Modal card — stops click-through */}
      <div
        className="relative w-full max-w-md rounded-2xl border border-[#770000]/50 bg-[#770000] text-[#FAF6F0] shadow-2xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── STICKY HEADER (close button always visible) ── */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 rounded-t-2xl border-b border-[#770000]/30 bg-[#770000] px-5 pt-5 pb-4">
          <div className="min-w-0 flex-1">
            <span className="rounded-full bg-[#770000]/50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#DCC9B6]">
              Admin Manager
            </span>
            <h3 className="mt-1.5 font-serif text-lg font-bold text-[#FAF6F0] leading-tight">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-[#DCC9B6]/80 mt-0.5">{subtitle}</p>
            )}
          </div>

          {/* CLOSE — always visible in sticky header */}
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full bg-white/10 p-2.5 text-zinc-300 hover:bg-red-600/80 hover:text-white transition-all cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── TAB BAR ── */}
        <div className="flex border-b border-[#770000]/20 bg-black/20 px-5">
          {(
            [
              { key: "cover", label: "Change Cover" },
              ...(onReorderSlides ? [{ key: "reorder", label: "Reorder" }] : []),
              ...(onCreateCatalog ? [{ key: "create", label: "+ New Catalog" }] : []),
            ] as { key: "cover" | "reorder" | "create"; label: string }[]
          ).map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                tab === key
                  ? "border-[#DCC9B6] text-[#DCC9B6]"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── SCROLLABLE BODY ── */}
        <div className="max-h-[70vh] overflow-y-auto px-5 pb-6">

          {/* ═══ TAB: CHANGE COVER ═══ */}
          {tab === "cover" && (
            <>
              {/* Slide selector grid */}
              {slides && slides.length > 0 && onSelectSlide && (
                <div className="mt-4 rounded-xl border border-white/10 bg-black/25 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#DCC9B6]">
                      Select Slide Number:
                    </span>
                    <span className="text-[11px] font-medium text-white/70">
                      Active: Slide {(currentSlideIndex ?? 0) + 1}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {slides.map((s) => {
                      const isSelected = s.index === currentSlideIndex;
                      const isCustom = customSlugs.includes(s.slug);
                      return (
                        <div key={s.index} className="relative group">
                          <button
                            type="button"
                            onClick={() => onSelectSlide(s.index)}
                            className={`w-full flex flex-col items-center gap-1 rounded-xl p-1.5 border transition-all ${
                              isSelected
                                ? "border-[#DCC9B6] bg-[#770000] text-white shadow-lg ring-2 ring-[#DCC9B6]/60 scale-[1.03]"
                                : "border-white/10 bg-black/40 text-zinc-300 hover:border-white/30 hover:bg-black/60"
                            }`}
                          >
                            <div className="h-12 w-full overflow-hidden rounded-lg bg-black/50 border border-white/10">
                              {s.imageUrl ? (
                                <img
                                  src={getOptimizedCloudinaryUrl(s.imageUrl, 'THUMBNAIL')}
                                  alt={s.label}
                                  loading="lazy"
                                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                  <ImageIcon className="h-4 w-4 text-zinc-600" />
                                </div>
                              )}
                            </div>
                            <span className="text-[11px] font-bold tracking-tight text-center leading-tight">
                              {s.label}
                            </span>
                          </button>

                          {/* Delete button for custom catalogs */}
                          {isCustom && onDeleteCatalog && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (
                                  window.confirm(
                                    `Delete "${s.label}" catalog? This cannot be undone.`
                                  )
                                )
                                  onDeleteCatalog(s.slug);
                              }}
                              className="absolute -top-1.5 -right-1.5 hidden group-hover:flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white shadow-md cursor-pointer z-10"
                              title="Delete catalog"
                            >
                              <Trash2 className="h-2.5 w-2.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Current image preview */}
              {currentImageUrl && (
                <div className="mt-4 flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 p-3">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black/40">
                    <img
                      src={getOptimizedCloudinaryUrl(currentImageUrl, 'THUMBNAIL')}
                      alt="Current Preview"
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold text-[#DCC9B6] uppercase tracking-wider">
                      Current Image
                    </p>
                    <p className="truncate text-xs text-[#FAF6F0]/80 font-mono mt-0.5">
                      {currentImageUrl}
                    </p>
                  </div>
                </div>
              )}

              {/* ── Edit Details: Title + Description ── */}
              {onUpdateDescription && (
                <div className="mt-4 rounded-xl border border-white/10 bg-black/25 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#DCC9B6]">
                      Edit Catalog Details
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    {/* Title field */}
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-zinc-400">Title</label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="mt-1 w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-[#DCC9B6]/40 focus:outline-none"
                      />
                    </div>

                    {/* Description field */}
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-zinc-400">Description</label>
                      <textarea
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        rows={3}
                        className="mt-1 w-full resize-none rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-[#DCC9B6]/40 focus:outline-none"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveDescription}
                      disabled={savingDesc}
                      className="self-end rounded-full bg-[#770000] px-4 py-1.5 text-[11px] font-bold text-white transition-all hover:bg-[#770000] disabled:opacity-60 cursor-pointer"
                    >
                      {savingDesc ? "Saving…" : "Save Details"}
                    </button>
                  </div>
                </div>
              )}

              {/* ── Delete current catalog ── */}
              {onDeleteCurrentCatalog && (
                <div className="mt-4 rounded-xl border border-red-900/40 bg-red-950/20 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-red-400 uppercase tracking-wider">Danger Zone</p>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {isCurrentCustom
                          ? "Permanently delete this custom catalog."
                          : "Delete this catalog from the services list."}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleDeleteCurrent}
                      className="shrink-0 flex items-center gap-1.5 rounded-full border border-red-600/60 bg-red-600/20 px-3 py-1.5 text-xs font-bold text-red-400 hover:bg-red-600 hover:text-white transition-all cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete Catalog
                    </button>
                  </div>
                </div>
              )}


              <div className="mt-5">
                <CloudinaryUpload
                  maxFiles={1}
                  title="Upload Replacement via Cloudinary"
                  buttonText="Upload & Update Image"
                  onUploadSuccess={handleUpload}
                  compact
                />
              </div>

              {/* Reset / Cancel */}
              {onResetToDefault && (
                <div className="mt-4 flex justify-between items-center pt-3 border-t border-[#770000]/30">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex items-center gap-1.5 text-xs text-[#DCC9B6] hover:text-white transition-colors cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Reset to default</span>
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </>
          )}

          {/* ═══ TAB: REORDER ═══ */}
          {tab === "reorder" && onReorderSlides && slides && (
            <ReorderPanel slides={slides} onReorder={onReorderSlides} />
          )}

          {/* ═══ TAB: CREATE CATALOG ═══ */}
          {tab === "create" && onCreateCatalog && (
            <CreateCatalogPanel onCreate={onCreateCatalog} />
          )}
        </div>
      </div>
    </div>
  );
}
