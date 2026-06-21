import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, X, ChevronRight } from "lucide-react";
import { poster, backdrop } from "../../api/tmdb";
import { useContinueWatching } from "../../hooks/useContinueWatching";
import toast from "react-hot-toast";

function ContinueCard({ movie, onRemove }) {
  const [hovered, setHovered] = useState(false);
  const pct = Math.round((movie.progress || 0) * 100);
  const bgUrl = backdrop(movie.backdrop_path, "w780");
  const posterUrl = poster(movie.poster_path, "w342");

  return (
    <motion.div
      className="flex-shrink-0 cursor-pointer relative"
      style={{ width: hovered ? 300 : 220, zIndex: hovered ? 20 : 1, scrollSnapAlign: "start" }}
      animate={{ width: hovered ? 300 : 220 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Remove button */}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(movie.id); }}
        className="absolute top-2 right-2 z-20 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
        style={{ background: "rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.15)" }}
        onMouseEnter={e => e.currentTarget.style.opacity = 1}
      >
        <X size={10} className="text-white" />
      </button>

      <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: "16/9", border: "1px solid rgba(255,255,255,0.08)", boxShadow: hovered ? "0 20px 60px rgba(0,0,0,0.7)" : "0 6px 24px rgba(0,0,0,0.5)" }}>
        {/* Background */}
        {bgUrl ? (
          <img src={bgUrl} alt={movie.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500"
            style={{ transform: hovered ? "scale(1.06)" : "scale(1)" }} />
        ) : posterUrl ? (
          <img src={posterUrl} alt={movie.title} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #1a1a3e, #0a0a1f)" }} />
        )}

        {/* Gradient */}
        <div className="absolute inset-0"
          style={{ background: hovered
            ? "linear-gradient(to top, rgba(8,8,16,0.95) 0%, rgba(8,8,16,0.4) 60%, transparent 100%)"
            : "linear-gradient(to top, rgba(8,8,16,0.85) 0%, rgba(8,8,16,0.15) 70%, transparent 100%)"
          }} />

        {/* Play button */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 flex items-center justify-center z-10"
              onClick={() => toast.success("Starting playback... ▶", { duration: 2000, style: { background: "#1a1a2e", color: "#fff" } })}
            >
              <div className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)", border: "2px solid rgba(255,255,255,0.4)" }}>
                <Play size={22} className="text-white ml-0.5" fill="white" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Genre chip */}
        {movie.genre && (
          <div className="absolute top-2.5 left-2.5 z-10 text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{ background: "rgba(0,0,0,0.7)", color: "rgba(255,255,255,0.7)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.1)" }}>
            {movie.genre}
          </div>
        )}

        {/* Progress bar at bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <AnimatePresence>
            {hovered && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-3 pb-1">
                <div className="text-xs font-semibold text-white mb-1 truncate">{movie.title}</div>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Progress track */}
          <div className="h-1 w-full" style={{ background: "rgba(255,255,255,0.15)" }}>
            <div className="h-full transition-all duration-500" style={{ width: `${pct}%`, background: "#e11d48" }} />
          </div>
        </div>
      </div>

      {/* Label below */}
      <div className="mt-2 px-0.5">
        <div className="text-sm font-medium text-white truncate">{movie.title}</div>
        <div className="text-[11px] text-white/40 mt-0.5">{pct}% watched</div>
      </div>
    </motion.div>
  );
}

export default function ContinueWatching() {
  const { list, remove } = useContinueWatching();
  if (list.length === 0) return null;

  return (
    <section className="max-w-[1440px] mx-auto px-6 py-10 relative z-[3]">
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-end justify-between mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            <span className="text-xs uppercase tracking-widest text-white/60 font-medium">Resume</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">Continue watching.</h2>
        </div>
        <a href="#" className="text-xs text-white/40 hover:text-white/70 flex items-center gap-1 transition-colors">
          See all <ChevronRight size={12} />
        </a>
      </motion.div>

      <div className="flex gap-4 overflow-x-auto pb-4" style={{ scrollbarWidth: "none", scrollSnapType: "x proximity" }}>
        {list.map((movie, i) => (
          <motion.div key={movie.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}>
            <ContinueCard movie={movie} onRemove={remove} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
