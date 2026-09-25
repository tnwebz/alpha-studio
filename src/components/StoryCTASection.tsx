import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export function StoryCTASection() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "-15%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.55, 0.9], [1, 1, 0]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-12%"]);

  return (
    <div
      ref={containerRef}
      className="relative h-[125vh] sm:h-[145vh] lg:h-[160vh]"
    >
      <div className="sticky top-0 h-[100dvh] w-full overflow-hidden">
        <motion.div
          className="absolute inset-0 h-[130%] w-full -top-[15%]"
          style={{ y: backgroundY }}
        >
          <img
            src="/n1.jpeg"
            alt=""
            className="h-full w-full object-cover object-[center_30%] sm:object-center"
            draggable={false}
          />
        </motion.div>

        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/55 via-black/30 to-black/10 sm:from-black/45 sm:via-black/25 sm:to-transparent"
          aria-hidden="true"
        />

        <motion.div
          className="relative z-10 flex h-full items-end px-5 pb-14 pt-20 sm:items-center sm:px-8 sm:pb-0 sm:pt-0 lg:px-14"
          style={{ opacity: textOpacity, y: textY }}
        >
          <div className="max-w-md text-white sm:max-w-xl">
            <h2 className="font-serif text-[clamp(2rem,8vw,3.75rem)] leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Let&apos;s shoot
              <br />
              your story.
            </h2>

            <p className="mt-4 max-w-sm font-serif text-base leading-relaxed text-white/90 sm:mt-6 sm:max-w-md sm:text-lg lg:text-xl">
              Where wedding photography meets chaos, charm, and chemistry.
            </p>

            <a
              href="#contact"
              className="mt-8 inline-block border border-white px-6 py-2.5 text-[10px] font-medium uppercase tracking-[0.18em] text-white transition-colors hover:bg-white hover:text-black sm:mt-10 sm:px-8 sm:py-3 sm:text-xs sm:tracking-[0.2em]"
            >
              Contact us
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
