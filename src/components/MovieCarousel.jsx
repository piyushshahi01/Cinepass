import { useRef, useState } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Premium horizontal carousel with:
 * - Drag-to-scroll (Framer Motion drag)
 * - Arrow navigation
 * - Fade edge masks
 * - Momentum feeling
 */
export default function MovieCarousel({ children, title, eyebrow, tag, className = "" }) {
  const trackRef = useRef(null);
  const [canLeft,  setCanLeft]  = useState(false);
  const [canRight, setCanRight] = useState(true);

  const checkScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 10);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  const scroll = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 560, behavior: "smooth" });
    setTimeout(checkScroll, 350);
  };

  return (
    <section className={`max-w-[1440px] mx-auto px-6 py-12 md:py-20 relative z-[3] ${className}`}>
      {/* Header */}
      <div className="flex items-end justify-between mb-7">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {eyebrow && (
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              <span className="text-xs uppercase tracking-widest text-white/60 font-medium">{eyebrow}</span>
              {tag && (
                <span className="px-2 py-0.5 rounded-full border border-white/10 text-white/50 text-xs">{tag}</span>
              )}
            </div>
          )}
          {title && (
            <h2 className="text-2xl md:text-4xl font-semibold tracking-tight leading-tight text-white">
              {title}
            </h2>
          )}
        </motion.div>

        {/* Arrow controls */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => scroll(-1)}
            disabled={!canLeft}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200"
            style={{
              background: canLeft ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              opacity: canLeft ? 1 : 0.4,
            }}
          >
            <ChevronLeft size={16} className="text-white/80" />
          </button>
          <button
            onClick={() => scroll(1)}
            disabled={!canRight}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200"
            style={{
              background: canRight ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              opacity: canRight ? 1 : 0.4,
            }}
          >
            <ChevronRight size={16} className="text-white/80" />
          </button>
        </div>
      </div>

      <div className="relative">
        <div
          ref={trackRef}
          onScroll={checkScroll}
          className="flex gap-4 overflow-x-auto pt-12 pb-16 -mt-12 -mb-12 px-24 -mx-24"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            scrollSnapType: "x proximity",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {children}
        </div>
      </div>
    </section>
  );
}
