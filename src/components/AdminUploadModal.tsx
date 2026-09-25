import { X, RotateCcw } from 'lucide-react';
import { CloudinaryUpload } from './CloudinaryUpload';

export interface AdminUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  currentImageUrl?: string;
  onUploadSuccess: (url: string) => Promise<void> | void;
  onResetToDefault?: () => Promise<void> | void;
}

export function AdminUploadModal({
  isOpen,
  onClose,
  title,
  subtitle,
  currentImageUrl,
  onUploadSuccess,
  onResetToDefault,
}: AdminUploadModalProps) {
  if (!isOpen) return null;

  const handleUpload = async (urls: string[]) => {
    if (urls.length > 0) {
      await onUploadSuccess(urls[0]);
      onClose();
    }
  };

  const handleReset = async () => {
    if (onResetToDefault) {
      if (window.confirm('Reset this image back to the default original?')) {
        await onResetToDefault();
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-md rounded-2xl border border-[#681C2B]/50 bg-[#3D111B] p-6 text-[#FAF6F0] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-[#681C2B]/30 pb-4">
          <div>
            <span className="rounded-full bg-[#681C2B]/50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#DCC9B6]">
              Admin Cloudinary Manager
            </span>
            <h3 className="mt-1.5 font-serif text-lg font-bold text-[#FAF6F0]">{title}</h3>
            {subtitle && <p className="text-xs text-[#DCC9B6]/80 mt-0.5">{subtitle}</p>}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/10 p-2 text-zinc-400 hover:bg-white/20 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Current image preview */}
        {currentImageUrl && (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 p-3">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black/40">
              <img
                src={currentImageUrl}
                alt="Current Preview"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-[#DCC9B6] uppercase tracking-wider">Current Image</p>
              <p className="truncate text-xs text-[#FAF6F0]/80 font-mono mt-0.5">{currentImageUrl}</p>
            </div>
          </div>
        )}

        {/* Cloudinary Upload component */}
        <div className="mt-5">
          <CloudinaryUpload
            maxFiles={1}
            title="Upload Replacement via Cloudinary"
            buttonText="Upload & Update Image"
            onUploadSuccess={handleUpload}
            compact
          />
        </div>

        {/* Reset / Actions */}
        {onResetToDefault && (
          <div className="mt-4 flex justify-between items-center pt-3 border-t border-[#681C2B]/30">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs text-[#DCC9B6] hover:text-white transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset to default</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
