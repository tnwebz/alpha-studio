import { useState, useRef } from 'react';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { validateUploadFile, compressImageForUpload } from '@/lib/imageOptimizer';
import { getOptimizedCloudinaryUrl } from '@/lib/cloudinary';

export type CloudinaryUploadProps = {
  onUploadSuccess: (urls: string[]) => void;
  maxFiles?: number;
  title?: string;
  buttonText?: string;
  compact?: boolean;
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
}: CloudinaryUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      // Step 1: Pre-upload validation
      setStatusMessage('Validating files...');
      for (const file of files) {
        const validation = await validateUploadFile(file);
        if (!validation.valid) {
          throw new Error(validation.error || 'Validation failed for one or more files.');
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
    <div className={`flex flex-col items-center gap-3 rounded-xl border border-[#DCC9B6] bg-[#FAF6F0] ${compact ? 'p-3' : 'p-6'} shadow-sm`}>
      <h3 className="font-serif text-sm sm:text-base font-semibold text-[#241F20] text-center">
        {displayTitle}
      </h3>

      <div className="w-full max-w-sm space-y-1.5">
        <input
          type="file"
          accept="image/*,video/*"
          multiple={maxFiles > 1}
          ref={fileInputRef}
          disabled={uploading}
          className="w-full rounded border border-[#DCC9B6] bg-white px-3 py-1.5 text-xs sm:text-sm text-[#241F20] focus:border-[#681C2B] focus:outline-none file:mr-2 file:rounded-md file:border-0 file:bg-[#681C2B]/10 file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-[#681C2B] hover:file:bg-[#681C2B]/20 cursor-pointer disabled:opacity-50"
        />

        {/* Informative compression badge */}
        <p className="text-[10px] text-zinc-500 text-center">
          Photos automatically optimized to ~300 KB before upload to protect storage & speed.
        </p>
      </div>

      {/* Error Notice */}
      {errorMessage && (
        <div className="flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5 max-w-sm w-full animate-fade-in">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Progress Status Message */}
      {uploading && statusMessage && (
        <div className="flex items-center gap-2 text-xs font-semibold text-[#681C2B] animate-pulse">
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
        className="flex items-center justify-center gap-2 rounded-lg bg-[#681C2B] px-5 py-2 text-xs sm:text-sm font-semibold text-white transition-all hover:bg-[#3D111B] disabled:opacity-50 shadow-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
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
