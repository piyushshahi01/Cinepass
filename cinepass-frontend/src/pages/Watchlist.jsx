import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Heart, Trash2, Film } from "lucide-react";
import { useWatchlist } from "../hooks/useWatchlist";
import MovieCard from "../components/MovieCard";

export default function Watchlist() {
  const { list, remove } = useWatchlist();

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">Your Watchlist</h1>
        <p className="text-white/50 mt-2">Movies you've saved to watch later</p>
      </motion.div>

      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Heart size={20} className="text-[#e11d48] fill-[#e11d48]" />
          Saved Movies
        </h2>
        <span className="text-xs text-white/40 bg-white/5 px-3 py-1 rounded-full">
          {list.length} {list.length === 1 ? "movie" : "movies"}
        </span>
      </div>

      {list.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {list.map((movie, i) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              key={movie.id}
              className="relative group"
            >
              <MovieCard movie={movie} />
              <button
                onClick={(e) => { e.preventDefault(); remove(movie.id); }}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/70 hover:text-[#e11d48] hover:bg-black/80 hover:border-[#e11d48]/50 transition-all opacity-0 group-hover:opacity-100 z-20"
                title="Remove from Watchlist"
              >
                <Trash2 size={14} />
              </button>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-20 text-center border border-dashed border-white/10 rounded-3xl bg-white/[0.01]"
        >
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Film size={24} className="text-white/30" />
          </div>
          <h3 className="text-xl font-medium mb-2">Your watchlist is empty</h3>
          <p className="text-white/40 mb-6 max-w-sm mx-auto">
            Explore our collection and add movies you want to watch later. They'll show up here.
          </p>
          <Link 
            to="/movies" 
            className="inline-flex items-center px-6 py-3 rounded-full bg-[#e11d48] hover:bg-[#be123c] text-white font-medium transition-colors"
          >
            Browse Movies
          </Link>
        </motion.div>
      )}
    </div>
  );
}
