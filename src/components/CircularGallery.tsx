import React, { useState, useEffect, useRef, type HTMLAttributes } from 'react';
import { ArrowUpRight, Play, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

// Define the type for a single gallery item
export interface GalleryItem {
  key?: string;
  common: string;
  binomial: string;
  link?: string;
  photo: {
    url: string; 
    text: string;
    pos?: string;
    by?: string;
  };
  isVideo?: boolean;
  isCloudinary?: boolean;
}

// Define the props for the CircularGallery component
export interface CircularGalleryProps extends HTMLAttributes<HTMLDivElement> {
  items: GalleryItem[];
  /** Controls how far the items are from the center. */
  radius?: number;
  /** Controls the speed of auto-rotation when not scrolling. */
  autoRotateSpeed?: number;
  onItemClick?: (item: GalleryItem) => void;
  isAdmin?: boolean;
  onEditCover?: (key: string) => void;
}

const CircularGallery = React.forwardRef<HTMLDivElement, CircularGalleryProps>(
  ({ items, className, radius: customRadius, autoRotateSpeed = 0.03, onItemClick, isAdmin, onEditCover, ...props }, ref) => {
    const navigate = useNavigate();
    const [rotation, setRotation] = useState(0);
    const [isScrolling, setIsScrolling] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [responsiveRadius, setResponsiveRadius] = useState(customRadius || 520);
    const [cardSize, setCardSize] = useState({ width: 300, height: 410 });

    const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const dragStartXRef = useRef(0);
    const dragStartRotationRef = useRef(0);
    const dragDistanceRef = useRef(0);

    // Dynamic responsive radius and card dimensions
    useEffect(() => {
      const updateDimensions = () => {
        const width = window.innerWidth;
        if (customRadius) {
          setResponsiveRadius(customRadius);
        } else {
          if (width < 640) {
            setResponsiveRadius(270);
            setCardSize({ width: 220, height: 320 });
          } else if (width < 1024) {
            setResponsiveRadius(380);
            setCardSize({ width: 260, height: 370 });
          } else if (width < 1440) {
            setResponsiveRadius(470);
            setCardSize({ width: 290, height: 400 });
          } else {
            setResponsiveRadius(530);
            setCardSize({ width: 310, height: 420 });
          }
        }
      };

      updateDimensions();
      window.addEventListener('resize', updateDimensions);
      return () => window.removeEventListener('resize', updateDimensions);
    }, [customRadius]);

    // Effect to handle scroll-based rotation
    useEffect(() => {
      const handleScroll = () => {
        setIsScrolling(true);
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }

        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollProgress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
        const scrollRotation = scrollProgress * 360;
        setRotation(scrollRotation);

        scrollTimeoutRef.current = setTimeout(() => {
          setIsScrolling(false);
        }, 150);
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        window.removeEventListener('scroll', handleScroll);
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
      };
    }, []);

    // Effect for auto-rotation when not scrolling, dragging, or hovered
    useEffect(() => {
      const autoRotate = () => {
        if (!isScrolling && !isDragging && !isHovered) {
          setRotation((prev) => (prev + autoRotateSpeed) % 360);
        }
        animationFrameRef.current = requestAnimationFrame(autoRotate);
      };

      animationFrameRef.current = requestAnimationFrame(autoRotate);

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }, [isScrolling, isDragging, isHovered, autoRotateSpeed]);

    // Mouse drag interaction
    const handleMouseDown = (e: React.MouseEvent) => {
      setIsDragging(true);
      dragStartXRef.current = e.clientX;
      dragStartRotationRef.current = rotation;
      dragDistanceRef.current = 0;
    };

    const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - dragStartXRef.current;
      dragDistanceRef.current = Math.abs(deltaX);
      setRotation(dragStartRotationRef.current + deltaX * 0.35);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    // Touch drag interaction (mobile/tablet)
    const handleTouchStart = (e: React.TouchEvent) => {
      if (e.touches.length === 0) return;
      setIsDragging(true);
      dragStartXRef.current = e.touches[0].clientX;
      dragStartRotationRef.current = rotation;
      dragDistanceRef.current = 0;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
      if (!isDragging || e.touches.length === 0) return;
      const deltaX = e.touches[0].clientX - dragStartXRef.current;
      dragDistanceRef.current = Math.abs(deltaX);
      setRotation(dragStartRotationRef.current + deltaX * 0.4);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    const anglePerItem = items.length > 0 ? 360 / items.length : 60;

    const handleCardClick = (item: GalleryItem) => {
      if (dragDistanceRef.current > 8) {
        return;
      }
      if (onItemClick) {
        onItemClick(item);
      } else if (item.link) {
        navigate(item.link);
      }
    };

    const rotateNext = () => {
      setRotation((prev) => prev - anglePerItem);
    };

    const rotatePrev = () => {
      setRotation((prev) => prev + anglePerItem);
    };

    const rotateToIndex = (index: number) => {
      setRotation(-index * anglePerItem);
    };

    // Active front index calculation
    const activeIndex = items.reduce((bestIndex, _, i) => {
      const itemAngle = i * anglePerItem;
      const totalRotation = rotation % 360;
      const rel = (itemAngle + totalRotation + 360) % 360;
      const norm = Math.abs(rel > 180 ? 360 - rel : rel);

      const bestItemAngle = bestIndex * anglePerItem;
      const bestRel = (bestItemAngle + totalRotation + 360) % 360;
      const bestNorm = Math.abs(bestRel > 180 ? 360 - bestRel : bestRel);

      return norm < bestNorm ? i : bestIndex;
    }, 0);

    return (
      <div
        ref={ref}
        role="region"
        aria-label="Circular 3D Gallery"
        className={cn(
          "relative w-full flex flex-col items-center justify-center select-none overflow-hidden py-2 sm:py-6",
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsDragging(false);
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        {...props}
      >
        {/* 3D Scene Viewport */}
        <div
          className="relative w-full flex items-center justify-center cursor-grab active:cursor-grabbing"
          style={{
            height: `${cardSize.height + 120}px`,
            perspective: '2000px',
          }}
        >
          <div
            className="relative w-full h-full flex items-center justify-center"
            style={{
              transform: `rotateY(${rotation}deg)`,
              transformStyle: 'preserve-3d',
            }}
          >
            {items.map((item, i) => {
              const itemAngle = i * anglePerItem;
              const totalRotation = rotation % 360;
              const relativeAngle = (itemAngle + totalRotation + 360) % 360;
              const normalizedAngle = Math.abs(relativeAngle > 180 ? 360 - relativeAngle : relativeAngle);
              const opacity = Math.max(0.25, 1 - (normalizedAngle / 180) * 1.15);
              const isFront = normalizedAngle < 45;

              return (
                <div
                  key={item.key || item.photo.url}
                  role="group"
                  aria-label={item.common}
                  className="absolute cursor-pointer"
                  style={{
                    width: `${cardSize.width}px`,
                    height: `${cardSize.height}px`,
                    left: '50%',
                    top: '50%',
                    marginLeft: `-${cardSize.width / 2}px`,
                    marginTop: `-${cardSize.height / 2}px`,
                    transform: `rotateY(${itemAngle}deg) translateZ(${responsiveRadius}px)`,
                    opacity: opacity,
                    transition: isDragging ? 'none' : 'opacity 0.3s ease-out',
                    zIndex: Math.round((180 - normalizedAngle) * 10),
                    pointerEvents: normalizedAngle > 88 ? 'none' : 'auto',
                  }}
                  onClick={() => handleCardClick(item)}
                >
                  <div
                    className={cn(
                      "relative w-full h-full rounded-2xl overflow-hidden group shadow-2xl transition-all duration-300",
                      "border border-white/50 bg-zinc-900",
                      isFront
                        ? "ring-2 ring-[#681C2B] shadow-[0_20px_60px_rgba(61,17,27,0.35)] scale-[1.02]"
                        : "ring-1 ring-black/10 hover:ring-white/40"
                    )}
                  >
                    {/* Media Image */}
                    <img
                      src={item.photo.url}
                      alt={item.photo.text || item.common}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 pointer-events-none"
                      style={{
                        objectPosition: item.photo.pos || 'center',
                        WebkitBackfaceVisibility: 'hidden',
                        backfaceVisibility: 'hidden',
                        transform: 'translateZ(0)',
                      }}
                      draggable={false}
                    />

                    {/* Gradient Depth Overlay - clear top & center, smooth dark bottom for text contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 via-40% to-transparent pointer-events-none transition-opacity duration-300 group-hover:opacity-90" />

                    {/* Top Badges */}
                    <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none z-10">
                      <div>
                        {item.isCloudinary && (
                          <span className="flex items-center gap-1.5 rounded-full bg-emerald-600/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white shadow backdrop-blur-md">
                            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                            Live Cloudinary
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isAdmin && onEditCover && item.key && isFront && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditCover(item.key!);
                            }}
                            className="pointer-events-auto flex items-center gap-1 rounded-full bg-[#3D111B]/90 px-2.5 py-1 text-[10px] font-semibold text-white shadow-lg backdrop-blur-md border border-[#681C2B]/50 transition-all hover:bg-[#681C2B] hover:scale-105"
                          >
                            <Camera className="h-3 w-3 text-[#DCC9B6]" />
                            <span>Change Cover</span>
                          </button>
                        )}

                        {item.isVideo && (
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3D111B]/80 text-white backdrop-blur-md border border-white/20 shadow">
                            <Play className="h-3.5 w-3.5 fill-white ml-0.5" />
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Metadata & Signature View Collection Action */}
                    <div className="absolute bottom-0 left-0 w-full p-4 sm:p-5 flex flex-col justify-end z-10">
                      <em className="text-[11px] sm:text-xs not-italic text-zinc-300 mb-2 line-clamp-1 opacity-90 drop-shadow">
                        {item.binomial}
                      </em>

                      {/* Signature Action Badge */}
                      <div className="flex items-stretch rounded-xl overflow-hidden shadow-lg border border-[#DCC9B6]/40 group/btn transition-transform group-hover:translate-y-[-2px]">
                        <div className="bg-[#FAF6F0]/95 backdrop-blur-md px-3.5 py-2 sm:px-4 sm:py-2.5 flex-1 flex flex-col justify-center">
                          <p className="text-xs sm:text-sm font-bold text-[#241F20] tracking-tight leading-tight group-hover/btn:text-[#681C2B] transition-colors">
                            {item.common}
                          </p>
                          <p className="text-[9px] sm:text-[10px] text-[#746A67] font-medium tracking-tight">
                            View Collection →
                          </p>
                        </div>
                        <div className="flex w-9 sm:w-11 items-center justify-center bg-[#681C2B] transition-colors group-hover/btn:bg-[#3D111B] shrink-0">
                          <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full border border-white/80 transition-transform group-hover/btn:scale-110">
                            <ArrowUpRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white stroke-[2.5]" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive Controls & Category Indicators */}
        <div className="mt-3 flex flex-col items-center gap-4 z-20 w-full max-w-4xl px-4">
          {/* Navigation Controls */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={rotatePrev}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#DCC9B6] bg-[#FAF6F0] text-[#241F20] shadow-sm transition-all hover:bg-white hover:border-[#681C2B]/50 hover:scale-105 active:scale-95"
              aria-label="Previous Gallery Item"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-[#746A67] text-center">
              Drag to spin • Scroll • Click card to open
            </span>

            <button
              type="button"
              onClick={rotateNext}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#DCC9B6] bg-[#FAF6F0] text-[#241F20] shadow-sm transition-all hover:bg-white hover:border-[#681C2B]/50 hover:scale-105 active:scale-95"
              aria-label="Next Gallery Item"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Quick-select Topic Pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            {items.map((item, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={item.key || index}
                  type="button"
                  onClick={() => rotateToIndex(index)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
                    isActive
                      ? "bg-[#681C2B] text-white shadow-md scale-105 ring-2 ring-[#681C2B]/40"
                      : "bg-[#FAF6F0] text-[#746A67] hover:bg-white hover:text-[#241F20] border border-[#DCC9B6]"
                  )}
                >
                  {item.common}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
);

CircularGallery.displayName = 'CircularGallery';

export { CircularGallery };
