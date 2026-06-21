import { motion } from "motion/react";
import { useGenres } from "../../hooks/useMovies";

export default function GenreGrid() {
  const { data, isLoading } = useGenres();
  const genres = data?.genres || [];

  if (isLoading) {
    return (
      <div className="px-6 md:px-12 xl:px-20 py-8 mb-6">
        <div className="h-6 w-48 bg-white/5 rounded-full mb-6 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-16 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!genres.length) return null;

  return (
    <section className="px-6 md:px-12 xl:px-20 py-8 mb-6">
      <div className="mb-6">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e11d48] mb-1.5">
          BROWSE BY CATEGORY
        </h3>
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
          Explore Genres
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
        {genres.slice(0, 12).map((genre, idx) => (
          <motion.button
            key={genre.id}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ scale: 1.05, background: "rgba(225,29,72,0.15)", borderColor: "rgba(225,29,72,0.4)" }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center py-4 px-4 rounded-2xl transition-all relative overflow-hidden group"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#e11d48]/0 to-[#e11d48]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors relative z-10">
              {genre.name}
            </span>
          </motion.button>
        ))}
      </div>
    </section>
  );
}
