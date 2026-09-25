import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface GoldenNavOrnamentProps {
  side: 'left' | 'right';
  className?: string;
}

export function GoldenNavOrnament({ side, className = '' }: GoldenNavOrnamentProps) {
  // Check accessibility preference
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const isLeft = side === 'left';
  const duration = isLeft ? 3.2 : 3.6;
  const delay = isLeft ? 0 : 0.35;
  const tasselDuration = isLeft ? 2.6 : 2.9;

  return (
    <motion.div
      aria-hidden="true"
      className={`absolute top-0 z-50 pointer-events-none select-none hidden sm:block ${
        isLeft ? 'left-2 sm:left-3 lg:left-4' : 'right-2 sm:right-3 lg:right-4'
      } ${className}`}
      style={{
        transformOrigin: 'top center',
        willChange: 'transform, opacity',
      }}
      initial={{ opacity: 0, y: -6 }}
      animate={{
        opacity: 0.9,
        y: 0,
        rotate: prefersReducedMotion ? 0 : isLeft ? [-2.5, 2.5, -2.5] : [2.5, -2.5, 2.5],
      }}
      transition={
        prefersReducedMotion
          ? { duration: 0.5 }
          : {
              opacity: { duration: 0.5, ease: 'easeOut' },
              y: { duration: 0.5, ease: 'easeOut' },
              rotate: {
                duration,
                repeat: Infinity,
                ease: 'easeInOut',
                delay,
              },
            }
      }
    >
      <svg
        className="w-[20px] h-[86px] sm:w-[22px] sm:h-[92px] lg:w-[24px] lg:h-[96px] overflow-visible"
        viewBox="0 0 32 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: 'drop-shadow(0 2px 3px rgba(61,17,27,0.35)) drop-shadow(0 0 6px rgba(214,179,106,0.12))',
        }}
      >
        <defs>
          {/* Subtle luxurious gold linear gradient */}
          <linearGradient id={`goldGrad-${side}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F3DFC0" />
            <stop offset="35%" stopColor="#E8D09A" />
            <stop offset="70%" stopColor="#D6B36A" />
            <stop offset="100%" stopColor="#C89A4B" />
          </linearGradient>

          {/* Core metallic shine gradient */}
          <linearGradient id={`goldShine-${side}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FAF6F0" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#D6B36A" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#9C7330" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* 1. Top Mounting Bead / Anchor Point */}
        <circle cx="16" cy="2.5" r="2.2" fill={`url(#goldGrad-${side})`} />
        <circle cx="16" cy="2.5" r="1" fill="#FAF6F0" opacity="0.85" />

        {/* 2. Thin Hanging Cord (1.2px) */}
        <line
          x1="16"
          y1="4.5"
          x2="16"
          y2="34"
          stroke={`url(#goldGrad-${side})`}
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        {/* 3. Small Braided Loop / Ring Detail */}
        <ellipse
          cx="16"
          cy="37"
          rx="3.5"
          ry="3"
          stroke={`url(#goldGrad-${side})`}
          strokeWidth="1.2"
          fill="none"
        />

        {/* 4. Compact Decorative Ceremonial Knot */}
        <g id="knot-body">
          {/* Outer knot curves */}
          <path
            d="M11,44 C11,40 16,40 16,44 C16,40 21,40 21,44 C21,48 16,51 16,55 C16,51 11,48 11,44 Z"
            fill={`url(#goldGrad-${side})`}
            stroke={`url(#goldShine-${side})`}
            strokeWidth="0.8"
            opacity="0.95"
          />
          {/* Subtle inner weave accent */}
          <path
            d="M13,44.5 C14.5,43 17.5,43 19,44.5 C18,48 16,51 16,53 C16,51 14,48 13,44.5 Z"
            fill="none"
            stroke="#FAF6F0"
            strokeWidth="0.7"
            opacity="0.6"
          />
          {/* Center decorative bead/core */}
          <circle cx="16" cy="45.5" r="1.5" fill="#FAF6F0" />
        </g>

        {/* 5. Tassel Cap Collar */}
        <path
          d="M12,56 Q16,57.5 20,56 L19.5,59 Q16,60.5 12.5,59 Z"
          fill={`url(#goldGrad-${side})`}
          stroke="#FAF6F0"
          strokeWidth="0.5"
        />

        {/* 6. Elegant Silk Tassel Strands with Subtle Secondary Sway */}
        <motion.g
          style={{
            transformOrigin: '16px 59px',
            willChange: 'transform',
          }}
          animate={
            prefersReducedMotion
              ? {}
              : {
                  rotate: isLeft ? [-0.9, 0.9, -0.9] : [0.9, -0.9, 0.9],
                }
          }
          transition={{
            duration: tasselDuration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: delay + 0.15,
          }}
        >
          {/* Strand 1 (Outer Left) */}
          <path
            d="M13,59.5 Q11.5,74 10.5,88"
            stroke={`url(#goldGrad-${side})`}
            strokeWidth="1.1"
            strokeLinecap="round"
            opacity="0.85"
          />
          {/* Strand 2 (Inner Left) */}
          <path
            d="M14.5,59.5 Q13.5,76 13,92"
            stroke={`url(#goldGrad-${side})`}
            strokeWidth="1.1"
            strokeLinecap="round"
            opacity="0.9"
          />
          {/* Strand 3 (Center) */}
          <path
            d="M16,60 L16,95"
            stroke={`url(#goldGrad-${side})`}
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          {/* Strand 4 (Inner Right) */}
          <path
            d="M17.5,59.5 Q18.5,76 19,92"
            stroke={`url(#goldGrad-${side})`}
            strokeWidth="1.1"
            strokeLinecap="round"
            opacity="0.9"
          />
          {/* Strand 5 (Outer Right) */}
          <path
            d="M19,59.5 Q20.5,74 21.5,88"
            stroke={`url(#goldGrad-${side})`}
            strokeWidth="1.1"
            strokeLinecap="round"
            opacity="0.85"
          />

          {/* Tiny subtle metallic accent dots at tips */}
          <circle cx="16" cy="95.5" r="0.8" fill="#FAF6F0" />
          <circle cx="13" cy="92.5" r="0.6" fill="#FAF6F0" opacity="0.8" />
          <circle cx="19" cy="92.5" r="0.6" fill="#FAF6F0" opacity="0.8" />
        </motion.g>
      </svg>
    </motion.div>
  );
}
