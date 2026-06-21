import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getGenres } from "../api/tmdb";

export default function Categories() {
  const { data: genres } = useQuery({
    queryKey: ["genres"],
    queryFn: getGenres
  });

  // Map icons/colors to genres
  const genreStyles = {
    28: { emoji: "💥", color: "#e11d48" }, // Action
    12: { emoji: "🗺️", color: "#f59e0b" }, // Adventure
    16: { emoji: "🎨", color: "#ec4899" }, // Animation
    35: { emoji: "😂", color: "#facc15" }, // Comedy
    80: { emoji: "🕵️", color: "#64748b" }, // Crime
    99: { emoji: "🎥", color: "#14b8a6" }, // Documentary
    18: { emoji: "🎭", color: "#8b5cf6" }, // Drama
    10751: { emoji: "👨‍👩‍👧‍👦", color: "#3b82f6" }, // Family
    14: { emoji: "🧙", color: "#d946ef" }, // Fantasy
    36: { emoji: "⏳", color: "#a8a29e" }, // History
    27: { emoji: "👻", color: "#10b981" }, // Horror
    10402: { emoji: "🎵", color: "#06b6d4" }, // Music
    9648: { emoji: "🔍", color: "#6366f1" }, // Mystery
    10749: { emoji: "❤️", color: "#f43f5e" }, // Romance
    878: { emoji: "🚀", color: "#0ea5e9" }, // Sci-Fi
    10770: { emoji: "📺", color: "#84cc16" }, // TV Movie
    53: { emoji: "🔪", color: "#ef4444" }, // Thriller
    10752: { emoji: "⚔️", color: "#78716c" }, // War
    37: { emoji: "🤠", color: "#c026d3" }, // Western
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 min-h-[80vh]">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">Categories</h1>
        <p className="text-white/50 mt-2">Find movies that match your mood</p>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {genres?.map((genre, i) => {
          const style = genreStyles[genre.id] || { emoji: "🎬", color: "#6b7280" };
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={genre.id}
            >
              <Link 
                to={`/movies?genre=${genre.id}`}
                className="block group relative overflow-hidden rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/30 transition-all p-6 aspect-square flex flex-col items-center justify-center text-center shadow-lg hover:shadow-2xl hover:-translate-y-1"
                style={{ "--cat-color": style.color }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = style.color + "55"; e.currentTarget.style.boxShadow = `0 16px 48px ${style.color}20, 0 4px 16px rgba(0,0,0,0.4)`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = ""; e.currentTarget.style.boxShadow = ""; }}
              >
                {/* Background glow */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
                  style={{ background: `radial-gradient(circle at center, ${style.color}, transparent 70%)` }}
                />
                
                <div className="text-5xl mb-4 transition-transform duration-500 group-hover:scale-110" style={{ filter: `drop-shadow(0 0 10px ${style.color}88)` }}>
                  {style.emoji}
                </div>
                
                <div className="text-lg font-semibold text-white group-hover:text-white transition-colors relative z-10">
                  {genre.name}
                </div>
                
                <div
                  className="absolute bottom-0 left-0 w-full h-1 opacity-0 group-hover:opacity-100 transition-all duration-500"
                  style={{ background: `linear-gradient(90deg, transparent, ${style.color}, transparent)` }}
                />
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
