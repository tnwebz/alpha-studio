import imageCompression from 'browser-image-compression';
import { IMAGE_UPLOAD_CONFIG } from '@/config/imageConfig';

export interface OptimizationStats {
  originalName: string;
  originalSizeKB: number;
  compressedSizeKB: number;
  reductionPercentage: number;
  originalDimensions: { width: number; height: number };
  compressedDimensions: { width: number; height: number };
}

/**
 * Validates a file before any processing occurs.
 * Rejects corrupt, oversized, or unsupported files.
 */
export async function validateUploadFile(file: File): Promise<{ valid: boolean; error?: string; isImage: boolean }> {
  if (!file) {
    return { valid: false, error: 'No file selected.', isImage: false };
  }

  // Check file size limit
  const maxBytes = IMAGE_UPLOAD_CONFIG.maxSourceSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is ${IMAGE_UPLOAD_CONFIG.maxSourceSizeMB} MB.`,
      isImage: false,
    };
  }

  const isImage = IMAGE_UPLOAD_CONFIG.supportedImageTypes.some(
    (type) => file.type.toLowerCase() === type || file.type.toLowerCase().startsWith('image/')
  );
  const isVideo = IMAGE_UPLOAD_CONFIG.supportedVideoTypes.some(
    (type) => file.type.toLowerCase() === type || file.type.toLowerCase().startsWith('video/')
  );

  if (!isImage && !isVideo) {
    return {
      valid: false,
      error: `Unsupported file format (${file.type || 'unknown'}). Please upload a standard photo (JPG, PNG, WebP) or video.`,
      isImage: false,
    };
  }

  // If it's an image, verify it can be parsed without error
  if (isImage) {
    try {
      await getImageDimensions(file);
    } catch {
      return {
        valid: false,
        error: 'The selected image appears to be corrupted or cannot be read.',
        isImage: true,
      };
    }
  }

  return { valid: true, isImage };
}

/**
 * Extracts natural image dimensions from a File
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for dimension inspection.'));
    };
    img.src = url;
  });
}

/**
 * Adaptive iterative compression pipeline.
 * Reduces 5MB-30MB DSLR/mobile uploads to ~250KB - 350KB while preserving
 * professional photography sharpness and dynamic range.
 */
export async function compressImageForUpload(
  file: File,
  onProgress?: (stage: string) => void
): Promise<File> {
  // Pass videos through uncompressed
  if (file.type.startsWith('video/')) {
    return file;
  }

  const originalSizeKB = Math.round(file.size / 1024);
  let originalDims = { width: 0, height: 0 };

  try {
    originalDims = await getImageDimensions(file);
  } catch (e) {
    console.warn('Could not read image dimensions before compression:', e);
  }

  // If the file is already under our acceptable target size and within dimensions, skip heavy compression
  if (
    originalSizeKB <= IMAGE_UPLOAD_CONFIG.maxAcceptableKB &&
    originalDims.width <= IMAGE_UPLOAD_CONFIG.maxLongEdge &&
    originalDims.height <= IMAGE_UPLOAD_CONFIG.maxLongEdge
  ) {
    if (import.meta.env.DEV) {
      console.log(
        `%c[Alpha Optimizer]%c Image "${file.name}" is already optimized (${originalSizeKB} KB). Uploading as-is.`,
        'color: #059669; font-weight: bold;',
        'color: inherit;'
      );
    }
    return file;
  }

  onProgress?.('Preparing image...');

  // Iterative adaptive compression configuration
  const targetMB = IMAGE_UPLOAD_CONFIG.targetSizeKB / 1024; // ~0.29 MB

  let currentQuality = IMAGE_UPLOAD_CONFIG.initialQuality;
  let compressedBlob: File | Blob = file;

  // Pass 1: Primary adaptive compression with orientation correction & dimension resizing
  onProgress?.('Optimizing resolution & compression...');
  try {
    compressedBlob = await imageCompression(file, {
      maxSizeMB: targetMB,
      maxWidthOrHeight: IMAGE_UPLOAD_CONFIG.maxLongEdge,
      useWebWorker: true,
      initialQuality: currentQuality,
      fileType: file.type === 'image/png' && originalSizeKB < 800 ? 'image/png' : 'image/jpeg',
      alwaysKeepResolution: false,
    });
  } catch (err) {
    console.warn('Primary compression failed, falling back to gentle pass:', err);
    compressedBlob = file;
  }

  // Pass 2: Progressive fine-tuning if result is still above acceptable limit
  let attempts = 0;
  while (
    compressedBlob.size / 1024 > IMAGE_UPLOAD_CONFIG.maxAcceptableKB &&
    currentQuality > IMAGE_UPLOAD_CONFIG.minimumQuality &&
    attempts < 2
  ) {
    attempts++;
    currentQuality -= 0.07;
    onProgress?.(`Fine-tuning image quality (pass ${attempts + 1})...`);

    try {
      const nextPass = await imageCompression(compressedBlob instanceof File ? compressedBlob : new File([compressedBlob], file.name, { type: file.type }), {
        maxSizeMB: targetMB,
        maxWidthOrHeight: IMAGE_UPLOAD_CONFIG.maxLongEdge,
        useWebWorker: true,
        initialQuality: Math.max(currentQuality, IMAGE_UPLOAD_CONFIG.minimumQuality),
        fileType: 'image/jpeg',
      });
      if (nextPass.size < compressedBlob.size) {
        compressedBlob = nextPass;
      }
    } catch (e) {
      console.warn('Iterative compression pass failed:', e);
      break;
    }
  }

  // Build final File object with clean name
  const finalExt = compressedBlob.type === 'image/png' ? 'png' : 'jpg';
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  const finalFile = new File([compressedBlob], `${baseName}.${finalExt}`, {
    type: compressedBlob.type || 'image/jpeg',
    lastModified: Date.now(),
  });

  const finalSizeKB = Math.round(finalFile.size / 1024);
  const reduction = Math.max(0, Math.round(((file.size - finalFile.size) / file.size) * 100));

  // Dev monitoring & debugging output
  if (import.meta.env.DEV) {
    let finalDims = { width: 0, height: 0 };
    try {
      finalDims = await getImageDimensions(finalFile);
    } catch {
      // ignore
    }

    const stats: OptimizationStats = {
      originalName: file.name,
      originalSizeKB,
      compressedSizeKB: finalSizeKB,
      reductionPercentage: reduction,
      originalDimensions: originalDims,
      compressedDimensions: finalDims,
    };

    console.groupCollapsed(`%c[Alpha Optimizer]%c ${file.name} (${reduction}% smaller)`, 'color: #059669; font-weight: bold;', 'color: inherit;');
    console.log(`Original:   ${(originalSizeKB / 1024).toFixed(2)} MB (${originalDims.width}×${originalDims.height})`);
    console.log(`Optimized:  ${finalSizeKB} KB (${finalDims.width}×${finalDims.height})`);
    console.log(`Reduction:  ${reduction}%`);
    console.table(stats);
    console.groupEnd();
  }

  return finalFile;
}
