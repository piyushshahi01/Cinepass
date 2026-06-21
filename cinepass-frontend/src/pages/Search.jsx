import { useState, useEffect, useRef } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import { Search as SearchIcon, X, Clock, TrendingUp } from "lucide-react";
import { searchMovies, getTrending } from "../api/tmdb";
import { useDebounce } from "../hooks/useDebounce";
import MovieCard from "../components/MovieCard";
import { SkeletonCard } from "../components/ui/SkeletonCard";
import { Link, useSearchParams } from "react-router-dom";

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const debouncedQuery = useDebounce(query, 500);
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    if (debouncedQuery) {
      setSearchParams({ q: debouncedQuery }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [debouncedQuery, setSearchParams]);

  useEffect(() => {
    const saved = localStorage.getItem("cinepass_recent_searches");
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  const saveSearch = (term) => {
    if (!term.trim()) return;
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("cinepass_recent_searches", JSON.stringify(updated));
  };

  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem("cinepass_recent_searches");
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: ({ pageParam = 1 }) => searchMovies(debouncedQuery, pageParam),
    enabled: !!debouncedQuery,
    getNextPageParam: (lastPage) => 
      lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
  });

  const { data: trendingData } = useQuery({
    queryKey: ["search_trending", "day"],
    queryFn: () => getTrending("day"),
    enabled: !debouncedQuery,
  });

  const movies = data?.pages.flatMap(page => page.results) || [];
  const popular = trendingData?.results?.slice(0, 5) || [];

  const observerTarget = useRef(null);
  
  useEffect(() => {
    if (!debouncedQuery) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 }
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, debouncedQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    saveSearch(query);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 min-h-screen">
      <motion.form 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        onSubmit={handleSearchSubmit}
        className="relative w-full max-w-3xl mx-auto mb-12"
      >
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <SearchIcon className="h-6 w-6 text-white/40 group-focus-within:text-[#e11d48] transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-14 pr-12 py-5 bg-white/5 border border-white/10 rounded-full text-lg text-white placeholder-white/30 focus:outline-none focus:border-[#e11d48]/50 focus:bg-white/10 transition-all shadow-2xl backdrop-blur-sm"
            placeholder="Search for movies, actors, or genres..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                type="button"
                onClick={() => setQuery("")}
                className="absolute inset-y-0 right-0 pr-5 flex items-center text-white/40 hover:text-white"
              >
                <X className="h-5 w-5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.form>

      {!debouncedQuery ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto"
        >
          {/* Recent Searches */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-white/80 flex items-center gap-2">
                <Clock size={18} /> Recent Searches
              </h2>
              {recentSearches.length > 0 && (
                <button onClick={clearRecent} className="text-xs text-white/40 hover:text-white transition-colors">
                  Clear All
                </button>
              )}
            </div>
            {recentSearches.length > 0 ? (
              <div className="space-y-2">
                {recentSearches.map(term => (
                  <button 
                    key={term}
                    onClick={() => setQuery(term)}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group text-left"
                  >
                    <span className="text-sm text-white/60 group-hover:text-white">{term}</span>
                    <SearchIcon size={14} className="text-white/20 group-hover:text-white/40" />
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/30 italic">No recent searches</p>
            )}
          </div>

          {/* Popular */}
          <div>
            <h2 className="text-lg font-medium text-white/80 flex items-center gap-2 mb-6">
              <TrendingUp size={18} /> Trending Today
            </h2>
            <div className="space-y-3">
              {popular.map((movie, i) => (
                <Link 
                  to={`/movie/${movie.id}`} 
                  key={movie.id}
                  className="flex items-center gap-4 p-2 rounded-xl hover:bg-white/5 transition-colors group"
                >
                  <span className="text-[#e11d48] font-mono text-sm w-4">{i + 1}</span>
                  <span className="text-sm text-white/60 group-hover:text-white font-medium">{movie.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-6">
          <h2 className="text-xl font-medium text-white/80 mb-6">
            Results for <span className="text-white">"{debouncedQuery}"</span>
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {isLoading ? (
              [...Array(10)].map((_, i) => <SkeletonCard key={i} />)
            ) : movies.length > 0 ? (
              movies.map((movie, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (i % 20) * 0.05 }}
                  key={`${movie.id}-${i}`}
                >
                  <MovieCard movie={movie} />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <SearchIcon size={48} className="mx-auto text-white/10 mb-4" />
                <h3 className="text-xl font-medium mb-2">No movies found</h3>
                <p className="text-white/40">Try adjusting your search query</p>
              </div>
            )}
          </div>

          <div ref={observerTarget} className="h-20 flex items-center justify-center mt-10">
            {isFetchingNextPage && (
              <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-[#e11d48] animate-spin" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
