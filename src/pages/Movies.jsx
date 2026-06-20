import { useState, useEffect, useRef, useCallback } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Filter, ChevronDown, X } from "lucide-react";
import { discoverMovies, getGenres } from "../api/tmdb";
import MovieCard from "../components/MovieCard";
import { SkeletonCard } from "../components/ui/SkeletonCard";

import { useSearchParams } from "react-router-dom";

export default function Movies() {
  const [searchParams] = useSearchParams();
  const initialGenre = searchParams.get("genre") || "";

  const [filters, setFilters] = useState({
    with_genres: initialGenre,
    with_original_language: "",
    primary_release_year: "",
    sort_by: "popularity.desc"
  });
  
  const [showFilters, setShowFilters] = useState(false);

  const { data: genresData } = useQuery({
    queryKey: ["genres"],
    queryFn: getGenres
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteQuery({
    queryKey: ["discover", filters],
    queryFn: ({ pageParam = 1 }) => discoverMovies({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage) => 
      lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
  });

  const movies = data?.pages.flatMap((page) => page.results) || [];

  // Intersection Observer for Infinite Scroll
  const observerTarget = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 }
    );
    
    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }
    
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);
  const languages = [
    { code: "en", name: "English" },
    { code: "hi", name: "Hindi" },
    { code: "te", name: "Telugu" },
    { code: "ta", name: "Tamil" },
    { code: "ko", name: "Korean" },
    { code: "ja", name: "Japanese" }
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">Explore Movies</h1>
          <p className="text-white/50 mt-2">Discover thousands of movies</p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors self-start md:self-auto text-sm"
        >
          <Filter size={16} />
          {showFilters ? "Hide Filters" : "Show Filters"}
        </motion.button>
      </div>

      <AnimateHeight show={showFilters}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-10 p-5 rounded-2xl bg-white/[0.02] border border-white/5">
          {/* Genre Filter */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-white/50 font-medium">Genre</label>
            <select 
              className="bg-black/40 border border-white/10 rounded-lg p-2.5 text-sm text-white outline-none focus:border-[#e11d48]/50"
              value={filters.with_genres}
              onChange={(e) => handleFilterChange("with_genres", e.target.value)}
            >
              <option value="">All Genres</option>
              {genresData?.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          {/* Language Filter */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-white/50 font-medium">Language</label>
            <select 
              className="bg-black/40 border border-white/10 rounded-lg p-2.5 text-sm text-white outline-none focus:border-[#e11d48]/50"
              value={filters.with_original_language}
              onChange={(e) => handleFilterChange("with_original_language", e.target.value)}
            >
              <option value="">All Languages</option>
              {languages.map(l => (
                <option key={l.code} value={l.code}>{l.name}</option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-white/50 font-medium">Release Year</label>
            <select 
              className="bg-black/40 border border-white/10 rounded-lg p-2.5 text-sm text-white outline-none focus:border-[#e11d48]/50"
              value={filters.primary_release_year}
              onChange={(e) => handleFilterChange("primary_release_year", e.target.value)}
            >
              <option value="">Any Year</option>
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-white/50 font-medium">Sort By</label>
            <select 
              className="bg-black/40 border border-white/10 rounded-lg p-2.5 text-sm text-white outline-none focus:border-[#e11d48]/50"
              value={filters.sort_by}
              onChange={(e) => handleFilterChange("sort_by", e.target.value)}
            >
              <option value="popularity.desc">Most Popular</option>
              <option value="vote_average.desc">Top Rated</option>
              <option value="primary_release_date.desc">Newest Releases</option>
              <option value="revenue.desc">Highest Grossing</option>
            </select>
          </div>
        </div>
      </AnimateHeight>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {isLoading ? (
          [...Array(10)].map((_, i) => <SkeletonCard key={i} />)
        ) : (
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
        )}
      </div>

      <div ref={observerTarget} className="h-20 flex items-center justify-center mt-10">
        {isFetchingNextPage && (
          <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-[#e11d48] animate-spin" />
        )}
      </div>
    </div>
  );
}

function AnimateHeight({ show, children }) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: show ? "auto" : 0, opacity: show ? 1 : 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden"
    >
      {children}
    </motion.div>
  );
}
