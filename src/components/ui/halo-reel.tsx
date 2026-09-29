"use client";

import * as React from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";

/* ── Halo Reel ───────────────────────────────────────────────────
 * Cards ride an ellipse. Card i sits at θ = i·step + rotation on an
 * ellipse of radii (rx, ry):
 *
 *   x = rx·cos θ      y = ry·sin θ      scale = min + (1−min)·(cos θ + 1)/2
 *
 * Only the front arc of cards (cos θ > visibleCutoff) is visible to maintain
 * a clean, circular, uncluttered presentation without messy background clumping.
 * ─────────────────────────────────────────────────────────────── */

export type HaloReelItem = {
  src?: string;
  alt?: string;
  bgColor?: string;
  textColor?: string;
  title?: string;
  subtitle?: string;
  slug?: string;
  description?: string;
  onClick?: () => void;
};

export interface HaloReelProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "children"> {
  items: HaloReelItem[];
  /** Card width in px at the front of the ring. @default 240 */
  cardWidth?: number;
  /** Card height in px at the front of the ring. @default 330 */
  cardHeight?: number;
  /** Scale of the card at the far side of the ring. @default 0.45 */
  minScale?: number;
  /** Horizontal radius as a fraction of the stage width. @default 0.36 */
  radiusXRatio?: number;
  /** Where the ellipse is centred across the stage. @default 0 */
  centerXRatio?: number;
  /** Vertical radius as a fraction of the stage height. @default 0.30 */
  radiusYRatio?: number;
  /** Rotate one card forward on a timer. @default true */
  autoPlay?: boolean;
  /** Time (ms) a card is held at the front before the next step. @default 1500 */
  holdDuration?: number;
  /** Duration (ms) of one step. @default 750 */
  stepDuration?: number;
  /** Hold the autoplay while a pointer rests on a card. @default true */
  pauseOnHover?: boolean;
  /** Spin the ring by dragging it. @default true */
  draggable?: boolean;
  /** Multiplier on the drag rotation. @default 1 */
  dragSensitivity?: number;
  /** Node parked in the middle of the ring, behind the cards. */
  centerLabel?: React.ReactNode;
  /** @default true */
  showCenterLabel?: boolean;
  /** Cutoff for back cards visibility (default -0.05 on desktop, 0.38 on mobile) */
  visibleCutoff?: number;
  /** External controller callback to spin programmatically */
  onSpinReady?: (spinFn: (direction: number) => void) => void;
  /** Callback notifying the parent of the currently active front card index */
  onActiveIndexChange?: (index: number) => void;
}

const TAU = Math.PI * 2;

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

export function HaloReel({
  items,
  cardWidth = 240,
  cardHeight = 330,
  minScale = 0.45,
  radiusXRatio = 0.36,
  centerXRatio = 0,
  radiusYRatio = 0.30,
  autoPlay = true,
  holdDuration = 1500,
  stepDuration = 750,
  pauseOnHover = true,
  draggable = true,
  dragSensitivity = 1,
  centerLabel,
  showCenterLabel = true,
  visibleCutoff = -0.05,
  onSpinReady,
  onActiveIndexChange,
  className,
  style,
  ...props
}: HaloReelProps) {
  const stageRef = React.useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const count = items.length;

  const rotation = useMotionValue(0);
  const draggingRef = React.useRef(false);
  const dragMovedRef = React.useRef(false);
  const hoverRef = React.useRef(false);

  const [size, setSize] = React.useState({ w: 0, h: 0 });
  React.useEffect(() => {
    const node = stageRef.current;
    if (!node) return;
    const measure = () =>
      setSize({ w: node.offsetWidth, h: node.offsetHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const radiusX = size.w * radiusXRatio;
  const radiusY = size.h * radiusYRatio;

  // Exact 1 slot per item so cards sit evenly without duplicate crowding
  const slots = count;
  const step = slots ? TAU / slots : 0;


  // Maintain intended card proportions without squishing
  const fit = size.w
    ? clamp(
        Math.min(
          size.w / (radiusX + cardWidth * 0.75),
          size.h / (2 * radiusY + cardHeight * 0.75),
        ),
        0.8,
        1,
      )
    : 1;
  const cardW = cardWidth * fit;
  const cardH = cardHeight * fit;

  // Shared animation & timer references
  const resetAutoplayTimerRef = React.useRef<(() => void) | null>(null);
  // Holds the currently running autoplay AnimationPlaybackControls so we can stop it
  const autoplayControlsRef = React.useRef<{ stop: () => void } | null>(null);

  // Active Index tracker in real time (immediate reporting via ref)
  const onActiveIndexChangeRef = React.useRef(onActiveIndexChange);
  React.useEffect(() => {
    onActiveIndexChangeRef.current = onActiveIndexChange;
  }, [onActiveIndexChange]);

  const lastReportedIdxRef = React.useRef(0);

  React.useEffect(() => {
    const unsubscribe = rotation.on("change", (latest) => {
      if (!step || !count) return;
      const raw = Math.round(-latest / step);
      const normalized = ((raw % count) + count) % count;
      if (normalized !== lastReportedIdxRef.current) {
        lastReportedIdxRef.current = normalized;
        onActiveIndexChangeRef.current?.(normalized);
      }
    });
    return () => unsubscribe();
  }, [rotation, step, count]);

  // Autoplay loop
  React.useEffect(() => {
    if (!autoPlay || reduceMotion || !count) return;

    let timer = 0;

    const scheduleNext = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (draggingRef.current || (pauseOnHover && hoverRef.current)) {
          scheduleNext();
          return;
        }
        // Snap to a clean multiple first to prevent float drift
        const snappedStart = Math.round(rotation.get() / step) * step;
        const target = snappedStart - step;
        const controls = animate(rotation, target, {
          duration: stepDuration / 1000,
          ease: [0.16, 1, 0.3, 1],
          onComplete: () => {
            autoplayControlsRef.current = null;
            scheduleNext();
          },
        });
        autoplayControlsRef.current = controls;
      }, holdDuration);
    };

    resetAutoplayTimerRef.current = scheduleNext;
    scheduleNext();

    return () => {
      window.clearTimeout(timer);
      autoplayControlsRef.current?.stop();
      autoplayControlsRef.current = null;
      resetAutoplayTimerRef.current = null;
    };
  }, [
    autoPlay,
    count,
    holdDuration,
    pauseOnHover,
    reduceMotion,
    rotation,
    step,
    stepDuration,
  ]);

  // Holds the currently running manual (button/keyboard) spin so rapid clicks cancel cleanly
  const manualControlsRef = React.useRef<{ stop: () => void } | null>(null);

  /* ── spin external controller (direct, butter-smooth, foolproof) ── */
  const spinBy = React.useCallback(
    (direction: number) => {
      if (!step || !count) return;

      // CRITICAL: Stop any in-flight autoplay / prior manual animation immediately
      // so it cannot conflict with the new spin animation.
      autoplayControlsRef.current?.stop();
      autoplayControlsRef.current = null;
      manualControlsRef.current?.stop();
      manualControlsRef.current = null;

      // Pause autoplay for 8 seconds after manual user interaction
      hoverRef.current = true;
      window.setTimeout(() => {
        hoverRef.current = false;
      }, 8000);

      // Reset the autoplay timer so it waits a fresh holdDuration before resuming
      resetAutoplayTimerRef.current?.();

      // Snap current position to the nearest clean slot to eliminate float drift
      const snapped = Math.round(rotation.get() / step) * step;
      // direction: +1 → advance forward (next), -1 → go back (previous)
      // Advancing = rotation decreases (same direction as autoplay)
      const target = snapped - direction * step;

      if (reduceMotion) {
        rotation.set(target);
        return;
      }

      const controls = animate(rotation, target, {
        duration: stepDuration / 1000,
        ease: [0.16, 1, 0.3, 1],
        onComplete: () => {
          manualControlsRef.current = null;
        },
      });
      manualControlsRef.current = controls;
    },
    [count, reduceMotion, rotation, step, stepDuration]
  );

  React.useEffect(() => {
    if (onSpinReady) {
      onSpinReady(spinBy);
    }
  }, [onSpinReady, spinBy]);

  /* ── drag ──────────────────────────────────────────────────── */
  const dragRef = React.useRef({ left: 0, top: 0, angle: 0 });

  const pointerAngle = (e: React.PointerEvent) => {
    const { left, top } = dragRef.current;
    return Math.atan2(
      (e.clientY - top - size.h / 2) / (radiusY || 1),
      (e.clientX - left - size.w * centerXRatio) / (radiusX || 1),
    );
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggable || (e.pointerType === "mouse" && e.button !== 0)) return;
    // Never steal pointer capture from nav buttons / links in the center label —
    // otherwise click never fires and prev/next appear broken.
    const target = e.target as HTMLElement | null;
    if (target?.closest("button, a, input, textarea, select, [data-no-drag]")) {
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    dragRef.current = { left: rect.left, top: rect.top, angle: 0 };
    dragRef.current.angle = pointerAngle(e);
    draggingRef.current = true;
    dragMovedRef.current = false;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const angle = pointerAngle(e);
    const delta =
      ((angle - dragRef.current.angle + Math.PI * 3) % TAU) - Math.PI;
    if (Math.abs(delta) > 0.02) {
      dragMovedRef.current = true;
      // User is dragging — cancel any in-flight button / autoplay spin
      manualControlsRef.current?.stop();
      manualControlsRef.current = null;
      autoplayControlsRef.current?.stop();
      autoplayControlsRef.current = null;
    }
    dragRef.current.angle = angle;
    rotation.set(rotation.get() + delta * dragSensitivity);
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    // Only settle after a real drag. Plain clicks (e.g. near controls) must not
    // start a competing snap animation that cancels button spins.
    if (!dragMovedRef.current) return;
    const snapped = Math.round(rotation.get() / step) * step;
    if (reduceMotion) {
      rotation.set(snapped);
      return;
    }
    animate(rotation, snapped, { duration: 0.5, ease: [0.16, 1, 0.3, 1] });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const direction = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!direction) return;
    e.preventDefault();
    spinBy(direction);
  };

  if (!count) return null;

  return (
    <div
      ref={stageRef}
      role="region"
      aria-roledescription="carousel"
      aria-label={props["aria-label"] ?? "Services 3D carousel"}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      className={cn(
        "relative h-[100dvh] w-full touch-pan-y select-none overflow-hidden outline-none",
        draggable && "cursor-grab active:cursor-grabbing",
        className,
      )}
      style={style}
      {...props}
    >
      {/* Center / Side Editorial Stage */}
      {showCenterLabel && centerLabel ? (
        <div
          onPointerEnter={() => {
            hoverRef.current = true;
          }}
          onPointerLeave={() => {
            hoverRef.current = false;
          }}
          className="pointer-events-none absolute inset-y-0 z-10 flex items-center justify-center px-4"
          style={{
            left: size.w * centerXRatio + radiusX + cardW / 2 + 10,
            right: 0,
          }}
        >
          {centerLabel}
        </div>
      ) : null}

      {/* 3D Wheel Cards */}
      {Array.from({ length: slots }, (_, i) => (
        <WheelCard
          key={i}
          item={items[i % count]}
          index={i}
          step={step}
          rotation={rotation}
          radiusX={radiusX}
          radiusY={radiusY}
          centerXRatio={centerXRatio}
          minScale={minScale}
          width={cardW}
          height={cardH}
          visibleCutoff={visibleCutoff}
          dragMovedRef={dragMovedRef}
          onHoverChange={(hovered) => {
            hoverRef.current = hovered;
          }}
        />
      ))}
    </div>
  );
}

/* ── Wheel Card ────────────────────────────────────────────── */

function WheelCard({
  item,
  index,
  step,
  rotation,
  radiusX,
  radiusY,
  centerXRatio,
  minScale,
  width,
  height,
  visibleCutoff,
  dragMovedRef,
  onHoverChange,
}: {
  item: HaloReelItem;
  index: number;
  step: number;
  rotation: MotionValue<number>;
  radiusX: number;
  radiusY: number;
  centerXRatio: number;
  minScale: number;
  width: number;
  height: number;
  visibleCutoff: number;
  dragMovedRef: React.MutableRefObject<boolean>;
  onHoverChange: (hovered: boolean) => void;
}) {
  const cos = useTransform(rotation, (r) => Math.cos(index * step + r));
  const sin = useTransform(rotation, (r) => Math.sin(index * step + r));

  const x = useTransform(cos, (c) => c * radiusX);
  const y = useTransform(sin, (s) => s * radiusY);
  const scale = useTransform(
    cos,
    (c) => minScale + (1 - minScale) * ((c + 1) / 2),
  );
  const zIndex = useTransform(scale, (s) => Math.round(s * 1000));

  // Visibility Guardrail: Smoothly fade out cards on the back of the ellipse
  // Uses visibleCutoff to show cleanly spaced cards along the round circular arc
  const opacity = useTransform(
    cos,
    [visibleCutoff, visibleCutoff + 0.22, 0.75, 1],
    [0, 0.45, 0.85, 1]
  );
  const visibility = useTransform(cos, (c) => (c < visibleCutoff ? "hidden" : "visible"));
  const pointerEvents = useTransform(
    cos,
    (c) => (c < visibleCutoff + 0.15 ? "none" : "auto")
  );

  const handleClick = (e: React.MouseEvent) => {
    if (dragMovedRef.current) return;
    if (item.onClick) {
      e.stopPropagation();
      item.onClick();
    }
  };

  return (
    <motion.div
      role="group"
      aria-roledescription="slide"
      onPointerEnter={() => onHoverChange(true)}
      onPointerLeave={() => onHoverChange(false)}
      onClick={handleClick}
      style={{
        x,
        y,
        scale,
        opacity,
        visibility,
        pointerEvents,
        zIndex,
        width,
        height,
        left: `${centerXRatio * 100}%`,
        top: "50%",
        marginLeft: -width / 2,
        marginTop: -height / 2,
        willChange: "transform, opacity",
      }}
      className={cn(
        "absolute overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-white/40 bg-[#241318] shadow-2xl select-none group transition-shadow duration-300",
        item.onClick && "cursor-pointer hover:ring-2 hover:ring-[#dbbc80] hover:shadow-2xl"
      )}
    >
      {item.src ? (
        <>
          <img
            src={item.src}
            alt={item.title ?? ""}
            draggable={false}
            className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Bottom Card Overlay with Title & View Collection CTA */}
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-[#1A0B10]/95 via-[#1A0B10]/45 to-transparent p-3.5 sm:p-5 text-left">
            <h4 className="font-serif text-sm sm:text-lg font-bold text-[#FAF6F0] line-clamp-2 drop-shadow-md leading-tight">
              {item.title}
            </h4>
            <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-[#530000] border border-[#dbbc80]/40 px-3 py-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-white shadow-md w-fit backdrop-blur-sm group-hover:bg-[#530000] transition-colors">
              <span>View Collection</span>
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </div>
          </div>
        </>
      ) : (
        <div
          className="flex h-full w-full flex-col items-center justify-center gap-2 bg-card p-4 text-center text-card-foreground"
          style={{
            backgroundColor: item.bgColor,
            color: item.textColor,
          }}
        >
          {item.title ? (
            <span className="font-serif text-lg font-bold leading-tight">
              {item.title}
            </span>
          ) : null}
          {item.subtitle ? (
            <span className="text-[10px] uppercase tracking-[0.2em] opacity-75">
              {item.subtitle}
            </span>
          ) : null}
        </div>
      )}
    </motion.div>
  );
}

export default HaloReel;
