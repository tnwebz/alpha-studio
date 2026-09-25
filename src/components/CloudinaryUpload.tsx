import { useState, useRef } from 'react';
import imageCompression from 'browser-image-compression';

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
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    const files = Array.from(fileInputRef.current?.files || []);
    if (files.length === 0) return;

    if (files.length > maxFiles) {
      alert(`You can only upload a maximum of ${maxFiles} file(s) at a time!`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        let fileToUpload: File | Blob = file;
        if (file.type.startsWith('image/')) {
          const options = {
            maxSizeMB: 0.2,
            maxWidthOrHeight: 1280,
            useWebWorker: true,
          };
          try {
            fileToUpload = await imageCompression(file, options);
          } catch {
            fileToUpload = file;
          }
        }

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
          return data.secure_url as string;
        } else {
          throw new Error(data.error?.message || 'Unknown error');
        }
      });

      const urls = await Promise.all(uploadPromises);
      setPreviews(urls);
      onUploadSuccess(urls);
      alert('Upload successful!');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const displayTitle = title || (maxFiles === 1 ? 'Upload New Image' : `Upload New Photos (Max ${maxFiles})`);
  const displayButtonText = buttonText || (uploading ? 'Uploading...' : maxFiles === 1 ? 'Upload Image' : 'Upload Photos');

  return (
    <div className={`flex flex-col items-center gap-3.5 rounded-xl border border-[#DCC9B6] bg-[#FAF6F0] ${compact ? 'p-3' : 'p-6'} shadow-sm`}>
      <h3 className="font-serif text-sm sm:text-base font-semibold text-[#241F20] text-center">{displayTitle}</h3>
      <input
        type="file"
        accept="image/*,video/*"
        multiple={maxFiles > 1}
        ref={fileInputRef}
        className="w-full max-w-sm rounded border border-[#DCC9B6] bg-white px-3 py-1.5 text-xs sm:text-sm text-[#241F20] focus:border-[#681C2B] focus:outline-none"
      />
      <button
        onClick={handleUpload}
        disabled={uploading}
        className="rounded-lg bg-[#681C2B] px-5 py-2 text-xs sm:text-sm font-semibold text-white transition-colors hover:bg-[#3D111B] disabled:opacity-50 shadow-sm"
      >
        {displayButtonText}
      </button>

      {previews.length > 0 && (
        <div className="mt-2 flex flex-col items-center w-full">
          <p className="mb-1.5 text-[11px] text-zinc-500">Previews:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {previews.map((preview, i) => (
              /\.(mp4|webm|ogg|mov|m4v)$/i.test(preview) ? (
                <video key={i} src={preview} className="h-14 w-14 sm:h-16 sm:w-16 rounded object-cover shadow" />
              ) : (
                <img key={i} src={preview} alt="Uploaded preview" className="h-14 w-14 sm:h-16 sm:w-16 rounded object-cover shadow" />
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
