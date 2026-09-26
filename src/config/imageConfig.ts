/**
 * Centralized Image Configuration for Alpha Stories Photography Website
 * 
 * Defines upload compression targets, delivery presets, responsive breakpoints,
 * and lazy-loading parameters to ensure optimal visual quality while operating
 * safely within Cloudinary's free tier.
 */

export const IMAGE_UPLOAD_CONFIG = {
  // Target file size for uploaded photography images (KB)
  targetSizeKB: 300,
  // Upper threshold: if compression reaches <= 350KB, stop further degradation
  maxAcceptableKB: 350,
  // Maximum long edge dimension in pixels (preserves high-res crispness without 6000px bloat)
  maxLongEdge: 2048,
  // Absolute minimum quality factor (0.0 to 1.0) to prevent visible artifacting
  minimumQuality: 0.68,
  // Initial quality to attempt on first compression pass
  initialQuality: 0.85,
  // Maximum source file size allowed for admin upload (50 MB)
  maxSourceSizeMB: 50,
  // Supported MIME types for images
  supportedImageTypes: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif',
    'image/avif',
  ],
  // Supported video types (passed through directly without image compression)
  supportedVideoTypes: [
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/ogg',
  ],
} as const;

export type ImageDeliveryPreset = 'THUMBNAIL' | 'CARD' | 'STANDARD' | 'FULLSCREEN';

export interface DeliveryPresetConfig {
  width: number;
  quality: 'auto' | 'auto:good' | 'auto:eco';
  crop: 'limit' | 'fill' | 'scale';
  format: 'auto';
}

export const IMAGE_DELIVERY_PRESETS: Record<ImageDeliveryPreset, DeliveryPresetConfig> = {
  // Gallery grid cards, small previews, admin thumbnails (~400-500px displayed)
  THUMBNAIL: {
    width: 600,
    quality: 'auto',
    crop: 'limit',
    format: 'auto',
  },
  // 3D Circular gallery items, Halo reel cards, About portraits (~600-800px displayed)
  CARD: {
    width: 800,
    quality: 'auto',
    crop: 'limit',
    format: 'auto',
  },
  // Section background banners, medium heroes, full-width feature areas
  STANDARD: {
    width: 1400,
    quality: 'auto',
    crop: 'limit',
    format: 'auto',
  },
  // Main Hero background slides, clicked Lightbox viewing, high-DPI displays
  FULLSCREEN: {
    width: 1920,
    quality: 'auto',
    crop: 'limit',
    format: 'auto',
  },
} as const;

// Standard responsive breakpoints for srcset generation
export const RESPONSIVE_BREAKPOINTS = [320, 480, 640, 960, 1280, 1600] as const;

export const LAZY_LOAD_CONFIG = {
  // Pre-load images 300px before they enter the user's viewport
  rootMargin: '300px 0px',
  threshold: 0.01,
} as const;
