import {
  IMAGE_DELIVERY_PRESETS,
  RESPONSIVE_BREAKPOINTS,
  type ImageDeliveryPreset,
  type DeliveryPresetConfig,
} from '@/config/imageConfig';

/**
 * Checks whether a URL is hosted on Cloudinary
 */
export function isCloudinaryUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  return url.includes('res.cloudinary.com') && url.includes('/image/upload/');
}

/**
 * Checks whether a URL points to a video
 */
export function isVideoUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  return /\.(mp4|webm|ogg|mov|m4v)$/i.test(url) || url.includes('/video/upload/');
}

/**
 * Extracts Cloudinary public_id from a Cloudinary URL
 * Example: https://res.cloudinary.com/ddu0tdvh/image/upload/v174291823/alpha-studio/img1.jpg
 * returns: "alpha-studio/img1"
 */
export function getCloudinaryPublicId(url: string): string | null {
  if (!isCloudinaryUrl(url)) return null;

  try {
    const uploadPrefix = '/image/upload/';
    const idx = url.indexOf(uploadPrefix);
    if (idx === -1) return null;

    const rest = url.substring(idx + uploadPrefix.length);
    const parts = rest.split('/');

    // Remove transformation segment if present
    if (parts.length > 1 && isTransformationSegment(parts[0])) {
      parts.shift();
    }

    // Remove version tag (v1234567) if present
    if (parts.length > 1 && /^v\d+$/.test(parts[0])) {
      parts.shift();
    }

    // Join remaining path and strip file extension
    const fullPathWithExt = parts.join('/');
    return fullPathWithExt.replace(/\.[^/.]+$/, '');
  } catch {
    return null;
  }
}

/**
 * Helper to determine if a URL path segment is a Cloudinary transformation
 */
function isTransformationSegment(segment: string): boolean {
  if (!segment) return false;
  // Common Cloudinary transformation keys
  return /^(?:[a-z]{1,2}_[^/]+,?)+$/i.test(segment) ||
    segment.includes('f_auto') ||
    segment.includes('q_auto') ||
    segment.includes('c_limit') ||
    segment.includes('c_scale') ||
    segment.includes('c_fill');
}

export type CustomTransformOptions = {
  width?: number;
  quality?: string;
  crop?: string;
  format?: string;
};

/**
 * Transforms any Cloudinary image URL into an optimized delivery URL using
 * f_auto (AVIF/WebP where supported), q_auto, and appropriate bounding dimensions.
 * 
 * If the URL is not from Cloudinary (e.g. local /hero.png), it is returned untouched.
 */
export function getOptimizedCloudinaryUrl(
  url?: string | null,
  presetOrOptions: ImageDeliveryPreset | number | CustomTransformOptions = 'CARD'
): string {
  if (!url || typeof url !== 'string') return '';
  if (!isCloudinaryUrl(url)) return url;

  // Resolve transformation config
  let config: DeliveryPresetConfig;

  if (typeof presetOrOptions === 'string' && presetOrOptions in IMAGE_DELIVERY_PRESETS) {
    config = IMAGE_DELIVERY_PRESETS[presetOrOptions as ImageDeliveryPreset];
  } else if (typeof presetOrOptions === 'number') {
    config = {
      width: presetOrOptions,
      quality: 'auto',
      crop: 'limit',
      format: 'auto',
    };
  } else if (typeof presetOrOptions === 'object' && presetOrOptions !== null) {
    config = {
      width: presetOrOptions.width || 800,
      quality: (presetOrOptions.quality as any) || 'auto',
      crop: (presetOrOptions.crop as any) || 'limit',
      format: 'auto',
    };
  } else {
    config = IMAGE_DELIVERY_PRESETS.CARD;
  }

  const transformString = `c_${config.crop},w_${config.width},f_auto,q_${config.quality}`;

  const uploadPrefix = '/image/upload/';
  const idx = url.indexOf(uploadPrefix);
  if (idx === -1) return url;

  const prefix = url.substring(0, idx + uploadPrefix.length);
  const rest = url.substring(idx + uploadPrefix.length);
  const parts = rest.split('/');

  // If first segment is an existing transformation, replace it
  if (parts.length > 1 && isTransformationSegment(parts[0])) {
    parts[0] = transformString;
    return `${prefix}${parts.join('/')}`;
  }

  // Otherwise insert transformation right after /image/upload/
  return `${prefix}${transformString}/${parts.join('/')}`;
}

/**
 * Builds a responsive srcset string with Cloudinary width transformations.
 * Returns undefined for non-Cloudinary images so the browser behaves normally.
 */
export function getCloudinarySrcSet(
  url?: string | null,
  widths: readonly number[] = RESPONSIVE_BREAKPOINTS
): string | undefined {
  if (!url || !isCloudinaryUrl(url)) return undefined;

  return widths
    .map((w) => `${getOptimizedCloudinaryUrl(url, { width: w })} ${w}w`)
    .join(', ');
}

/**
 * Delete a Cloudinary asset by calling the serverless deletion endpoint.
 * Protects against accidental deletion of shared or missing assets.
 */
export async function deleteCloudinaryAsset(urlOrPublicId: string): Promise<boolean> {
  const publicId = isCloudinaryUrl(urlOrPublicId)
    ? getCloudinaryPublicId(urlOrPublicId)
    : urlOrPublicId;

  if (!publicId) return false;

  try {
    const response = await fetch('/api/delete-cloudinary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicId }),
    });

    if (response.ok) {
      if (import.meta.env.DEV) {
        console.log(`[Cloudinary Cleanup] Deleted asset: ${publicId}`);
      }
      return true;
    } else {
      // In local dev without Vercel serverless function running, log dev note
      if (import.meta.env.DEV) {
        console.info(`[Cloudinary Cleanup] Serverless endpoint unavailable in local dev for ${publicId}. Firestore reference was cleaned up.`);
      }
      return false;
    }
  } catch {
    return false;
  }
}
