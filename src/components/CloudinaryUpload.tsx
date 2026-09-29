import { useState, useRef } from 'react';
import { Loader2, CheckCircle2, AlertCircle, Smartphone, Monitor } from 'lucide-react';
import { validateUploadFile, compressImageForUpload, getImageDimensions } from '@/lib/imageOptimizer';
import { getOptimizedCloudinaryUrl } from '@/lib/cloudinary';

export type AspectRatioConstraint = 'portrait-only' | 'landscape-only' | 'any';

export type CloudinaryUploadProps = {
  onUploadSuccess: (urls: string[]) => void;
  maxFiles?: number;
  title?: string;
  buttonText?: string;
  compact?: boolean;
  aspectRatioConstraint?: AspectRatioConstraint;
  customErrorMessage?: string;
};

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'ddu0tdvh';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'alpha-studio';
const API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY || '514419284843772';

export function CloudinaryUpload({
  onUploadSuccess,
  maxFiles = 5,
  title,
  buttonText,
  compact = false,
  aspectRatioConstraint = 'any',
  customErrorMessage,
}: CloudinaryUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate orientation for a file
  const checkOrientation = async (file: File): Promise<{ valid: boolean; error?: string }> => {
    if (aspectRatioConstraint === 'any' || !file.type.startsWith('image/')) {
      return { valid: true };
    }

    try {
      const { width, height } = await getImageDimensions(file);
      if (aspectRatioConstraint === 'portrait-only' && width > height) {
        return {
          valid: false,
          error:
            customErrorMessage ||
            `⚠️ Portrait photo required (Height must be greater than Width). The selected photo "${file.name}" is Landscape (${width}×${height}px). Please select a vertical portrait photo to fit this card perfectly.`,
        };
      }
      if (aspectRatioConstraint === 'landscape-only' && height > width) {
        return {
          valid: false,
          error:
            customErrorMessage ||
            `⚠️ Landscape photo required (Width must be greater than Height). The selected photo "${file.name}" is Portrait (${width}×${height}px). Please select a wide horizontal photo.`,
        };
      }
      return { valid: true };
    } catch {
      return { valid: false, error: 'Could not read image dimensions. Please select a valid photo.' };
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (aspectRatioConstraint !== 'any') {
      for (const file of files) {
        const check = await checkOrientation(file);
        if (!check.valid) {
          setErrorMessage(check.error || 'Invalid photo aspect ratio.');
          if (fileInputRef.current) fileInputRef.current.value = '';
          return;
        }
      }
    }
  };

  const handleUpload = async () => {
    setErrorMessage(null);
    const files = Array.from(fileInputRef.current?.files || []);
    if (files.length === 0) {
      setErrorMessage('Please select an image file to upload.');
      return;
    }

    if (files.length > maxFiles) {
      setErrorMessage(`You can only upload a maximum of ${maxFiles} file(s) at a time.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploading(true);

    try {
      // Step 1: Pre-upload validation (Format, Size & Aspect Ratio check)
      setStatusMessage('Validating files & orientation...');
      for (const file of files) {
        const validation = await validateUploadFile(file);
        if (!validation.valid) {
          throw new Error(validation.error || 'Validation failed for one or more files.');
        }

        const orientationCheck = await checkOrientation(file);
        if (!orientationCheck.valid) {
          throw new Error(orientationCheck.error || 'Orientation requirement not met.');
        }
      }

      // Step 2: Adaptive Iterative Compression & Upload
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileIndexText = files.length > 1 ? ` (${i + 1}/${files.length})` : '';

        // Compress if it's an image
        let fileToUpload: File = file;
        if (file.type.startsWith('image/')) {
          setStatusMessage(`Optimizing photo${fileIndexText}...`);
          fileToUpload = await compressImageForUpload(file, (stage) => {
            setStatusMessage(`${stage}${fileIndexText}`);
          });
        }

        // Upload to Cloudinary using direct unsigned preset
        setStatusMessage(`Uploading${fileIndexText}...`);
        const formData = new FormData();
        formData.append('file', fileToUpload);
        formData.append('upload_preset', UPLOAD_PRESET);
        if (API_KEY) {
          formData.append('api_key', API_KEY);
        }

        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        if (data.secure_url) {
          uploadedUrls.push(data.secure_url as string);
        } else {
          throw new Error(data.error?.message || 'Failed to upload image to Cloudinary.');
        }
      }

      setStatusMessage('Upload complete!');
      setPreviews(uploadedUrls);
      onUploadSuccess(uploadedUrls);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (error: any) {
      console.error('[CloudinaryUpload] Error:', error);
      setErrorMessage(error.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const displayTitle = title || (maxFiles === 1 ? 'Upload New Image' : `Upload New Photos (Max ${maxFiles})`);
  const displayButtonText = buttonText || (uploading ? (statusMessage || 'Processing...') : maxFiles === 1 ? 'Upload Image' : 'Upload Photos');

  return (
    <div className={`flex flex-col items-center gap-3 rounded-xl border border-[#DCC9B6] bg-[#FAF6F0] ${compact ? 'p-3' : 'p-6'} shadow-sm w-full`}>
      <h3 className="font-serif text-sm sm:text-base font-semibold text-[#241F20] text-center">
        {displayTitle}
      </h3>

      {/* Orientation Requirement Guidance Badge */}
      {aspectRatioConstraint === 'portrait-only' && (
        <div className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] font-semibold text-amber-800">
          <Smartphone className="h-3.5 w-3.5 text-amber-600" />
          <span>Portrait Photo Required (Vertical: Height &gt; Width)</span>
        </div>
      )}

      {aspectRatioConstraint === 'landscape-only' && (
        <div className="flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-[11px] font-semibold text-blue-800">
          <Monitor className="h-3.5 w-3.5 text-blue-600" />
          <span>Landscape Photo Required (Horizontal: Width &gt; Height)</span>
        </div>
      )}

      <div className="w-full max-w-sm space-y-1.5">
        <input
          type="file"
          accept="image/*,video/*"
          multiple={maxFiles > 1}
          ref={fileInputRef}
          onChange={handleFileChange}
          disabled={uploading}
          className="w-full rounded border border-[#DCC9B6] bg-white px-3 py-1.5 text-xs sm:text-sm text-[#241F20] focus:border-[#770000] focus:outline-none file:mr-2 file:rounded-md file:border-0 file:bg-[#770000]/10 file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-[#770000] hover:file:bg-[#770000]/20 cursor-pointer disabled:opacity-50"
        />

        {/* Informative compression badge */}
        <p className="text-[10px] text-zinc-500 text-center">
          Photos automatically optimized before upload for crisp display & instant loading.
        </p>
      </div>

      {/* Error Notice */}
      {errorMessage && (
        <div className="flex items-start gap-2 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg p-2.5 max-w-sm w-full animate-fade-in leading-relaxed">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Progress Status Message */}
      {uploading && statusMessage && (
        <div className="flex items-center gap-2 text-xs font-semibold text-[#770000] animate-pulse">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Success Badge */}
      {!uploading && statusMessage === 'Upload complete!' && (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <span>Upload successful!</span>
        </div>
      )}

      <button
        type="button"
        onClick={handleUpload}
        disabled={uploading}
        className="flex items-center justify-center gap-2 rounded-lg bg-[#770000] px-5 py-2 text-xs sm:text-sm font-semibold text-white transition-all hover:bg-[#880000] disabled:opacity-50 shadow-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
      >
        {uploading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        <span>{displayButtonText}</span>
      </button>

      {/* Uploaded Previews */}
      {previews.length > 0 && (
        <div className="mt-2 flex flex-col items-center w-full">
          <p className="mb-1.5 text-[11px] font-medium text-zinc-500">Uploaded:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {previews.map((preview, i) => (
              /\.(mp4|webm|ogg|mov|m4v)$/i.test(preview) ? (
                <video key={i} src={preview} className="h-14 w-14 sm:h-16 sm:w-16 rounded-lg object-cover shadow border border-white/40" />
              ) : (
                <img
                  key={i}
                  src={getOptimizedCloudinaryUrl(preview, 'THUMBNAIL')}
                  alt="Uploaded preview"
                  className="h-14 w-14 sm:h-16 sm:w-16 rounded-lg object-cover shadow border border-white/40"
                  loading="lazy"
                />
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
