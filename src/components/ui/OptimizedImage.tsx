import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { getOptimizedCloudinaryUrl, getCloudinarySrcSet, isCloudinaryUrl } from '@/lib/cloudinary';
import type { ImageDeliveryPreset } from '@/config/imageConfig';

export interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  preset?: ImageDeliveryPreset | number;
  priority?: boolean;
  aspectRatio?: number | string;
  fallbackSrc?: string;
  useResponsiveSrcSet?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  preset = 'CARD',
  priority = false,
  aspectRatio,
  fallbackSrc = '/hero.png',
  useResponsiveSrcSet = false,
  className,
  style,
  onLoad,
  onError,
  ...props
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const displaySrc = error ? fallbackSrc : getOptimizedCloudinaryUrl(src, preset);
  const srcSet = useResponsiveSrcSet && !error && isCloudinaryUrl(src)
    ? getCloudinarySrcSet(src)
    : undefined;

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setLoaded(true);
    onLoad?.(e);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setError(true);
    onError?.(e);
  };

  const imgElement = (
    <img
      src={displaySrc}
      alt={alt}
      srcSet={srcSet}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      onLoad={handleLoad}
      onError={handleError}
      className={cn(
        'transition-opacity duration-500 ease-in-out',
        !loaded && 'opacity-0',
        loaded && 'opacity-100',
        className
      )}
      style={style}
      {...props}
    />
  );

  if (aspectRatio) {
    return (
      <div
        className="relative overflow-hidden bg-zinc-100/10"
        style={{ aspectRatio: typeof aspectRatio === 'number' ? `${aspectRatio}` : aspectRatio }}
      >
        {!loaded && (
          <div className="absolute inset-0 animate-pulse bg-zinc-200/20" aria-hidden="true" />
        )}
        {imgElement}
      </div>
    );
  }

  return imgElement;
}
