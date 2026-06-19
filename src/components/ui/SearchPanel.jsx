import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, X, Clock, TrendingUp, Film } from "lucide-react";
import { useSearch } from "../../hooks/useMovies";
import { poster } from "../../api/tmdb";
import { useDebounce } from "../../hooks/useDebounce";

const RECENT_KEY = "cinepass_recent_searches";

function loadRecent() {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch { return []; }
}
function saveRecent(terms) {
  localStorage.setItem(RECENT_KEY, JSON.stringify(terms.slice(0, 8)));
}

export default function SearchPanel({ isOpen, onOpenDetail, onClose }) {
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState(loadRecent);
  const debouncedQ = useDebounce(query, 320);
  const { data, isFetching } = useSearch(debouncedQ);
  const inputRef = useRef(null);
  const results = data?.results?.slice(0, 8) || [];

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const handleSelect = (movie) => {
    const newRecent = [movie.title, ...recent.filter(r => r !== movie.title)].slice(0, 8);
    setRecent(newRecent);
    saveRecent(newRecent);
    onOpenDetail?.(movie);
    onClose?.();
  };

  const clearRecent = () => { setRecent([]); saveRecent([]); };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-start justify-center pt-20 px-4"
          style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(16px)" }}
          onClick={(e) => e.target === e.currentTarget && onClose?.()}
        >
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-2xl"
          >
            {/* Input */}
            <div className="flex items-center gap-3 rounded-2xl px-5 py-4 mb-3"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(12px)" }}>
              <Search size={18} className="text-white/50 flex-shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search movies, genres, directors..."
                className="flex-1 bg-transparent text-white text-base outline-none placeholder:text-white/30"
              />
              {isFetching && <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white/60 animate-spin flex-shrink-0" />}
              {query && (
                <button onClick={() => setQuery("")}><X size={16} className="text-white/40 hover:text-white/70" /></button>
              )}
              <button onClick={onClose} className="text-xs text-white/40 hover:text-white/60 ml-1">Esc</button>
            </div>

            {/* Results panel */}
            <div className="rounded-2xl overflow-hidden"
              style={{ background: "rgba(12,12,24,0.97)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(20px)" }}>
              {/* Search Results */}
              <AnimatePresence mode="wait">
                {results.length > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="px-4 py-3 border-b border-white/[0.06]">
                      <span className="text-[10px] uppercase tracking-widest text-white/30 font-medium flex items-center gap-1.5">
                        <Film size={10} /> Results for "{debouncedQ}"
                      </span>
                    </div>
                    {results.map((movie, i) => (
                      <motion.button
                        key={movie.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => handleSelect(movie)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.04] transition-colors text-left"
                      >
                        <div className="w-9 h-12 rounded-lg overflow-hidden flex-shrink-0"
                          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                          {movie.poster_path && (
                            <img src={poster(movie.poster_path, "w92")} alt={movie.title} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white truncate">{movie.title}</div>
                          <div className="text-xs text-white/40">{movie.release_date?.split("-")[0]} · ⭐ {Number(movie.vote_average).toFixed(1)}</div>
                        </div>
                        <div className="text-[10px] text-white/30 text-right flex-shrink-0 hidden sm:block">
                          {movie.genre_ids?.slice(0,1).map(id => id).join(", ")}
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                )}

                {/* Recent Searches */}
                {!query && recent.length > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-widest text-white/30 font-medium flex items-center gap-1.5">
                        <Clock size={10} /> Recent searches
                      </span>
                      <button onClick={clearRecent} className="text-[10px] text-white/30 hover:text-white/60">Clear</button>
                    </div>
                    {recent.map((term, i) => (
                      <button
                        key={i}
                        onClick={() => setQuery(term)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.04] transition-colors text-left"
                      >
                        <Clock size={12} className="text-white/25 flex-shrink-0" />
                        <span className="text-sm text-white/60">{term}</span>
                      </button>
                    ))}
                  </motion.div>
                )}

                {/* Popular suggestions when empty */}
                {!query && recent.length === 0 && (
                  <div className="px-4 py-4">
                    <div className="text-[10px] uppercase tracking-widest text-white/30 mb-3 flex items-center gap-1.5">
                      <TrendingUp size={10} /> Trending searches
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {["Avengers", "Inception", "Interstellar", "Batman", "Oppenheimer", "Dune", "Spider-Man"].map(t => (
                        <button key={t} onClick={() => setQuery(t)}
                          className="text-xs px-3 py-1.5 rounded-full text-white/60 transition-all hover:text-white"
                          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* No results */}
                {query && results.length === 0 && !isFetching && (
                  <div className="px-4 py-8 text-center text-white/30 text-sm">
                    No results for "{query}"
                  </div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
