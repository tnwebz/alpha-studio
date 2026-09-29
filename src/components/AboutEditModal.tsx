import { useState, useEffect } from 'react';
import { X, Check, Camera, Trash2, RotateCcw, Sparkles, Plus, Edit3, Image as ImageIcon } from 'lucide-react';
import { CloudinaryUpload } from './CloudinaryUpload';
import { getOptimizedCloudinaryUrl } from '@/lib/cloudinary';
import type { AboutCardData } from '@/hooks/useSiteAssets';

export interface AboutEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: AboutCardData[];
  initialActiveIndex?: number;
  initialTab?: 'edit' | 'add';
  onSaveCard: (index: number, card: AboutCardData) => Promise<void>;
  onAddCard?: (card: AboutCardData) => Promise<void>;
  onDeleteCard?: (index: number) => Promise<void>;
  onResetCard?: (index: number) => Promise<void>;
}

export function AboutEditModal({
  isOpen,
  onClose,
  cards,
  initialActiveIndex = 0,
  initialTab = 'edit',
  onSaveCard,
  onAddCard,
  onDeleteCard,
  onResetCard,
}: AboutEditModalProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'add'>(initialTab);
  const [selectedBoxIndex, setSelectedBoxIndex] = useState(
    Math.min(initialActiveIndex, Math.max(0, cards.length - 1))
  );

  // Edit form state
  const [formData, setFormData] = useState<AboutCardData>({
    id: `card_${initialActiveIndex + 1}`,
    name: '',
    designation: '',
    quote: '',
    src: '',
  });
  const [customUrl, setCustomUrl] = useState('');

  // Add new box form state
  const [newCardData, setNewCardData] = useState<AboutCardData>({
    id: '',
    name: '',
    designation: '',
    quote: '',
    src: '',
  });
  const [newCustomUrl, setNewCustomUrl] = useState('');

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);

  // Keep selectedBoxIndex in bounds when cards change
  useEffect(() => {
    if (selectedBoxIndex >= cards.length && cards.length > 0) {
      setSelectedBoxIndex(cards.length - 1);
    }
  }, [cards.length, selectedBoxIndex]);

  // Sync formData whenever selectedBoxIndex or cards prop changes
  useEffect(() => {
    if (cards[selectedBoxIndex]) {
      setFormData({ ...cards[selectedBoxIndex] });
      setCustomUrl(cards[selectedBoxIndex].src || '');
    }
  }, [selectedBoxIndex, cards]);

  useEffect(() => {
    setSelectedBoxIndex(Math.min(initialActiveIndex, Math.max(0, cards.length - 1)));
    setActiveTab(initialTab);
  }, [initialActiveIndex, initialTab, cards.length]);

  if (!isOpen) return null;

  // Save current box edit
  const handleSave = async () => {
    setSaving(true);
    try {
      await onSaveCard(selectedBoxIndex, formData);
      setSavedSuccess(`Box ${selectedBoxIndex + 1} saved successfully!`);
      setTimeout(() => setSavedSuccess(null), 2500);
    } catch (err) {
      console.error('Failed to save card:', err);
      alert('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Delete current box
  const handleDelete = async () => {
    if (cards.length <= 1) {
      alert('At least one profile box must remain in the About section.');
      return;
    }
    const currentName = cards[selectedBoxIndex]?.name || `Box ${selectedBoxIndex + 1}`;
    if (!window.confirm(`Are you sure you want to permanently delete "${currentName}" (Box ${selectedBoxIndex + 1})?`)) {
      return;
    }
    if (!onDeleteCard) return;

    setSaving(true);
    try {
      await onDeleteCard(selectedBoxIndex);
      setSelectedBoxIndex((prev) => Math.max(0, Math.min(prev, cards.length - 2)));
      setSavedSuccess(`Box deleted successfully.`);
      setTimeout(() => setSavedSuccess(null), 2500);
    } catch (err) {
      console.error('Failed to delete card:', err);
      alert('Failed to delete box. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Add a new box
  const handleCreateNewBox = async () => {
    if (!newCardData.name.trim() && !newCardData.src.trim()) {
      alert('Please provide at least a name or upload a photo for the new box.');
      return;
    }
    if (!onAddCard) return;

    setSaving(true);
    try {
      const cardToAdd: AboutCardData = {
        id: `card_${Date.now()}`,
        name: newCardData.name.trim() || `Team Member ${cards.length + 1}`,
        designation: newCardData.designation.trim() || 'Creative Artist',
        quote: newCardData.quote.trim(),
        src: newCardData.src.trim(),
      };
      await onAddCard(cardToAdd);
      
      // Reset new card form
      setNewCardData({
        id: '',
        name: '',
        designation: '',
        quote: '',
        src: '',
      });
      setNewCustomUrl('');

      // Switch to edit tab and select the newly added card
      setSelectedBoxIndex(cards.length);
      setActiveTab('edit');
      setSavedSuccess(`New profile box added successfully!`);
      setTimeout(() => setSavedSuccess(null), 2500);
    } catch (err) {
      console.error('Failed to create box:', err);
      alert('Failed to create new box. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm(`Reset Box ${selectedBoxIndex + 1} to default settings?`)) {
      if (onResetCard) {
        await onResetCard(selectedBoxIndex);
        setSavedSuccess(`Box ${selectedBoxIndex + 1} reset to default.`);
        setTimeout(() => setSavedSuccess(null), 2000);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-md animate-fade-in">
      <div
        className="relative flex flex-col w-full max-w-2xl max-h-[92vh] overflow-hidden rounded-2xl border border-[#530000]/50 bg-[#241318] text-[#FAF6F0] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-[#530000]/40 bg-[#1D0F13] px-5 py-4 sm:px-6">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#530000]/60 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#dbbc80]">
              <Sparkles className="h-3 w-3 text-[#dbbc80]" />
              <span>Admin About Us Manager</span>
            </div>
            <h3 className="mt-1 font-serif text-lg font-bold text-[#FAF6F0] sm:text-xl">
              Team & Visionary Boxes
            </h3>
            <p className="text-xs text-[#dbbc80]/70 mt-0.5">
              Add new team profile boxes, delete boxes, or upload photos & edit stories.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/10 p-2 text-zinc-300 hover:bg-white/20 hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center border-b border-[#530000]/30 bg-[#170B0F] px-5 pt-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all cursor-pointer ${
              activeTab === 'edit'
                ? 'bg-[#241318] text-[#FAF6F0] border-t-2 border-[#dbbc80] shadow-sm'
                : 'text-[#dbbc80]/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <Edit3 className="h-3.5 w-3.5 text-[#dbbc80]" />
            <span>Edit Boxes ({cards.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('add')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all cursor-pointer ${
              activeTab === 'add'
                ? 'bg-[#241318] text-[#FAF6F0] border-t-2 border-[#dbbc80] shadow-sm'
                : 'text-[#dbbc80]/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <Plus className="h-3.5 w-3.5 text-emerald-400" />
            <span>+ Add New Box</span>
          </button>
        </div>

        {/* TAB 1: EDIT BOXES */}
        {activeTab === 'edit' && (
          <>
            {/* Box Navigation Tabs Bar */}
            <div className="border-b border-[#530000]/30 bg-[#1a0c11] px-4 py-2.5 sm:px-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#dbbc80]">
                  Select Box to Edit:
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('add')}
                  className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                >
                  <Plus className="h-3 w-3" />
                  <span>New Box</span>
                </button>
              </div>

              {/* Responsive scrollable pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {cards.map((card, idx) => {
                  const isSelected = idx === selectedBoxIndex;
                  const hasContent = Boolean(card.name || card.src);
                  return (
                    <button
                      key={card.id || idx}
                      type="button"
                      onClick={() => setSelectedBoxIndex(idx)}
                      className={`group relative flex-shrink-0 flex flex-col items-center justify-center rounded-xl px-3 py-1.5 min-w-[75px] text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'border-2 border-[#dbbc80] bg-[#530000] text-white shadow-lg ring-1 ring-[#dbbc80]/60 scale-[1.02]'
                          : 'border border-white/10 bg-black/40 text-zinc-400 hover:border-white/20 hover:bg-black/60 hover:text-white'
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Box {idx + 1}
                      </span>
                      <span className="truncate max-w-[80px] text-[11px] font-medium text-[#FAF6F0] mt-0.5">
                        {card.name ? card.name : <span className="italic opacity-60">(Empty)</span>}
                      </span>
                      {hasContent && (
                        <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-[#241318]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scrollable Form Content */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
              {/* Active Box Indicator & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#530000] text-xs font-bold text-white">
                    {selectedBoxIndex + 1}
                  </span>
                  <span className="text-sm font-semibold text-[#FAF6F0]">
                    Editing Box {selectedBoxIndex + 1}{' '}
                    {formData.name ? `— "${formData.name}"` : '(Currently Empty)'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {cards.length > 1 && onDeleteCard && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={saving}
                      className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-950/30 px-2.5 py-1 text-xs font-medium text-red-300 hover:bg-red-900/50 hover:text-white transition-colors cursor-pointer"
                      title="Permanently remove this box"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Delete Box</span>
                    </button>
                  )}

                  {onResetCard && (
                    <button
                      type="button"
                      onClick={handleReset}
                      className="flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1 text-xs text-zinc-400 transition-colors hover:border-white/20 hover:text-white cursor-pointer"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Photo Section */}
              <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#dbbc80] mb-3">
                  Portrait / Photograph
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  {/* Photo Preview */}
                  <div className="sm:col-span-4 flex flex-col items-center">
                    <div className="relative h-44 w-36 overflow-hidden rounded-2xl border-2 border-[#dbbc80]/40 bg-black/60 shadow-lg flex items-center justify-center">
                      {formData.src ? (
                        <img
                          src={getOptimizedCloudinaryUrl(formData.src, 'THUMBNAIL')}
                          alt="Portrait preview"
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-3 text-center text-zinc-400">
                          <Camera className="h-8 w-8 mb-2 stroke-[1.5] text-[#dbbc80]/60" />
                          <span className="text-[11px] font-medium">No Photo</span>
                          <span className="text-[9px] text-zinc-400 mt-0.5">Empty Box</span>
                        </div>
                      )}
                    </div>

                    {formData.src && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, src: '' }));
                          setCustomUrl('');
                        }}
                        className="mt-2.5 flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-950/30 px-3 py-1 text-[11px] text-red-300 hover:bg-red-900/50 hover:text-white transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Remove Photo</span>
                      </button>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="sm:col-span-8 space-y-3">
                    {/* Cloudinary Upload Trigger */}
                    <div>
                      <span className="block text-[11px] text-zinc-300 mb-1.5 font-medium">
                        Upload via Cloudinary (Camera / Device photo):
                      </span>
                      <CloudinaryUpload
                        onUploadSuccess={(urls) => {
                          if (urls.length > 0) {
                            setFormData((prev) => ({ ...prev, src: urls[0] }));
                            setCustomUrl(urls[0]);
                          }
                        }}
                        maxFiles={1}
                        buttonText="Upload New Portrait"
                        aspectRatioConstraint="portrait-only"
                        compact={true}
                      />
                    </div>

                    {/* Direct Image URL fallback */}
                    <div className="pt-2 border-t border-white/10">
                      <span className="block text-[11px] text-zinc-300 mb-1.5 font-medium">
                        Or paste direct Image URL:
                      </span>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={customUrl}
                          onChange={(e) => setCustomUrl(e.target.value)}
                          placeholder="https://... or /photo1.png"
                          className="flex-1 rounded-xl border border-white/15 bg-black/50 px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-[#dbbc80] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (customUrl.trim()) {
                              setFormData((prev) => ({ ...prev, src: customUrl.trim() }));
                            }
                          }}
                          className="rounded-xl bg-[#530000] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#852538] transition-colors cursor-pointer"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Name Field */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#dbbc80] mb-1.5">
                  Full Name / Title
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Mr. Alwin, John Doe, or Team Member"
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-[#FAF6F0] placeholder-zinc-500 focus:border-[#dbbc80] focus:outline-none focus:ring-1 focus:ring-[#dbbc80]"
                />
              </div>

              {/* Designation / Role Field */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#dbbc80] mb-1.5">
                  Designation / Role
                </label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, designation: e.target.value }))
                  }
                  placeholder="e.g. PROPRIETOR & LEAD STORYTELLER, Creative Director"
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-[#FAF6F0] placeholder-zinc-500 focus:border-[#dbbc80] focus:outline-none focus:ring-1 focus:ring-[#dbbc80]"
                />
              </div>

              {/* Bio / Quote Field */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#dbbc80] mb-1.5">
                  Bio, Story or Quote
                </label>
                <textarea
                  rows={4}
                  value={formData.quote}
                  onChange={(e) => setFormData((prev) => ({ ...prev, quote: e.target.value }))}
                  placeholder="Write their artistic statement, biographical background, or story here..."
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-[#FAF6F0] placeholder-zinc-500 focus:border-[#dbbc80] focus:outline-none focus:ring-1 focus:ring-[#dbbc80] leading-relaxed resize-y"
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between border-t border-[#530000]/40 bg-[#1D0F13] px-5 py-4 sm:px-6">
              <div className="flex items-center gap-2">
                {savedSuccess && (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 animate-fade-in">
                    <Check className="h-4 w-4" />
                    <span>{savedSuccess}</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                >
                  Done
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 rounded-xl bg-[#530000] px-5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition-all hover:bg-[#852538] hover:scale-105 disabled:opacity-50 cursor-pointer"
                >
                  {saving ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Save Box {selectedBoxIndex + 1}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}

        {/* TAB 2: ADD NEW BOX */}
        {activeTab === 'add' && (
          <>
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
              <div className="border-b border-white/10 pb-3">
                <h4 className="font-serif text-base font-bold text-[#FAF6F0]">
                  Create a New Team Member Box
                </h4>
                <p className="text-xs text-[#dbbc80]/70 mt-0.5">
                  Add a new portrait, name, role, and story to display in the About Us carousel.
                </p>
              </div>

              {/* Photo Upload Area */}
              <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#dbbc80] mb-3">
                  Portrait / Photograph
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  {/* Photo Preview */}
                  <div className="sm:col-span-4 flex flex-col items-center">
                    <div className="relative h-44 w-36 overflow-hidden rounded-2xl border-2 border-[#dbbc80]/40 bg-black/60 shadow-lg flex items-center justify-center">
                      {newCardData.src ? (
                        <img
                          src={getOptimizedCloudinaryUrl(newCardData.src, 'THUMBNAIL')}
                          alt="New portrait preview"
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-3 text-center text-zinc-400">
                          <ImageIcon className="h-8 w-8 mb-2 stroke-[1.5] text-[#dbbc80]/60" />
                          <span className="text-[11px] font-medium">No Photo</span>
                          <span className="text-[9px] text-zinc-400 mt-0.5">Optional</span>
                        </div>
                      )}
                    </div>

                    {newCardData.src && (
                      <button
                        type="button"
                        onClick={() => {
                          setNewCardData((prev) => ({ ...prev, src: '' }));
                          setNewCustomUrl('');
                        }}
                        className="mt-2.5 flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-950/30 px-3 py-1 text-[11px] text-red-300 hover:bg-red-900/50 hover:text-white transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Remove Photo</span>
                      </button>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="sm:col-span-8 space-y-3">
                    <div>
                      <span className="block text-[11px] text-zinc-300 mb-1.5 font-medium">
                        Upload via Cloudinary (Camera / Device photo):
                      </span>
                      <CloudinaryUpload
                        onUploadSuccess={(urls) => {
                          if (urls.length > 0) {
                            setNewCardData((prev) => ({ ...prev, src: urls[0] }));
                            setNewCustomUrl(urls[0]);
                          }
                        }}
                        maxFiles={1}
                        buttonText="Upload New Portrait"
                        aspectRatioConstraint="portrait-only"
                        compact={true}
                      />
                    </div>

                    <div className="pt-2 border-t border-white/10">
                      <span className="block text-[11px] text-zinc-300 mb-1.5 font-medium">
                        Or paste direct Image URL:
                      </span>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newCustomUrl}
                          onChange={(e) => setNewCustomUrl(e.target.value)}
                          placeholder="https://... or /photo.png"
                          className="flex-1 rounded-xl border border-white/15 bg-black/50 px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-[#dbbc80] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newCustomUrl.trim()) {
                              setNewCardData((prev) => ({ ...prev, src: newCustomUrl.trim() }));
                            }
                          }}
                          className="rounded-xl bg-[#530000] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#852538] transition-colors cursor-pointer"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Name Field */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#dbbc80] mb-1.5">
                  Full Name / Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={newCardData.name}
                  onChange={(e) => setNewCardData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Sarah Jenkins, Michael Scott"
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-[#FAF6F0] placeholder-zinc-500 focus:border-[#dbbc80] focus:outline-none focus:ring-1 focus:ring-[#dbbc80]"
                />
              </div>

              {/* Designation / Role Field */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#dbbc80] mb-1.5">
                  Designation / Role
                </label>
                <input
                  type="text"
                  value={newCardData.designation}
                  onChange={(e) =>
                    setNewCardData((prev) => ({ ...prev, designation: e.target.value }))
                  }
                  placeholder="e.g. LEAD CINEMATOGRAPHER & COLORIST"
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-[#FAF6F0] placeholder-zinc-500 focus:border-[#dbbc80] focus:outline-none focus:ring-1 focus:ring-[#dbbc80]"
                />
              </div>

              {/* Bio / Story / Quote Field */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#dbbc80] mb-1.5">
                  Bio, Story or Quote
                </label>
                <textarea
                  rows={4}
                  value={newCardData.quote}
                  onChange={(e) => setNewCardData((prev) => ({ ...prev, quote: e.target.value }))}
                  placeholder="Share their artistic philosophy, experience, or message to clients..."
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-[#FAF6F0] placeholder-zinc-500 focus:border-[#dbbc80] focus:outline-none focus:ring-1 focus:ring-[#dbbc80] leading-relaxed resize-y"
                />
              </div>
            </div>

            {/* Footer Actions for Add */}
            <div className="flex items-center justify-between border-t border-[#530000]/40 bg-[#1D0F13] px-5 py-4 sm:px-6">
              <button
                type="button"
                onClick={() => setActiveTab('edit')}
                className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleCreateNewBox}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition-all hover:bg-emerald-500 hover:scale-105 disabled:opacity-50 cursor-pointer"
              >
                {saving ? (
                  <span>Creating...</span>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>Create & Add Box</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
