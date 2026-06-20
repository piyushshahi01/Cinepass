import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import ReactPlayer from "react-player";
import { Star, Play, Plus, Check, Clock, Calendar, ChevronDown, Film, Ticket } from "lucide-react";
import { poster, backdrop, getTrailerKey, formatRuntime, getYear, getRating } from "../api/tmdb";
import { useMovieDetails } from "../hooks/useMovies";
import { useWatchlist } from "../hooks/useWatchlist";
import toast from "react-hot-toast";

const HOVER_DELAYS = [200, 300, 400, 500, 700];

function useHoverSequence() {
  const [level, setLevel] = useState(0);
  const [align, setAlign] = useState('center'); // 'left', 'center', 'right'
  const timers = useRef([]);

  const start = useCallback((e) => {
    // Determine horizontal alignment based on scroll parent position
    if (e && e.currentTarget) {
      const card = e.currentTarget;
      const track = card.closest('.overflow-x-auto');
      if (track) {
        const cardRect = card.getBoundingClientRect();
        const trackRect = track.getBoundingClientRect();
        
        if (cardRect.left - trackRect.left < 100) setAlign('left');
        else if (trackRect.right - cardRect.right < 100) setAlign('right');
        else setAlign('center');
      } else {
        const viewportWidth = window.innerWidth;
        if (cardRect.left < 100) setAlign('left');
        else if (viewportWidth - cardRect.right < 100) setAlign('right');
        else setAlign('center');
      }
    }

    timers.current.forEach(clearTimeout);
    timers.current = [];
    HOVER_DELAYS.forEach((delay, idx) => {
      const t = setTimeout(() => setLevel(idx + 1), delay);
      timers.current.push(t);
    });
  }, []);

  const stop = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setLevel(0);
  }, []);

  return { level, align, start, stop };
}

import { useNavigate } from "react-router-dom";

export default function MovieCard({ movie, onOpenDetail }) {
  const { level, align, start, stop } = useHoverSequence();
  const navigate = useNavigate();
  const year = getYear(movie.release_date || movie.first_air_date);
  const rating = getRating(movie.vote_average);
  const posterUrl = poster(movie.poster_path, "w342");

  const handleClick = (e) => {
    e?.stopPropagation();
    if (onOpenDetail) onOpenDetail(movie);
    else navigate(`/movie/${movie.id}`);
  };

  return (
    <div
      className="flex-shrink-0 cursor-pointer select-none relative"
      style={{ width: 180, zIndex: level > 0 ? 50 : 1 }}
      onMouseEnter={start}
      onMouseLeave={stop}
    >
      {/* ── Base Card (Static) ── */}
      <div
        className="relative rounded-lg overflow-hidden aspect-[2/3] bg-[#1a1a3e] transition-opacity duration-200"
        style={{ opacity: level >= 2 ? 0 : 1 }}
      >
        {posterUrl ? (
          <img src={posterUrl} alt={movie.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Film size={40} className="text-white/20" />
          </div>
        )}
      </div>

      {/* ── Floating Hover Card ── */}
      <AnimatePresence>
        {level >= 1 && (
          <HoverCard 
            movie={movie} 
            level={level}
            align={align}
            posterUrl={posterUrl} 
            baseYear={year}
            baseRating={rating}
            onOpenDetail={onOpenDetail} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Cinematic 4K seamless loop MP4 (nature/space placeholder for movie trailer)
const PLACEHOLDER_MP4 = "https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-1610-large.mp4";

function HoverCard({ movie, level, align, posterUrl, baseYear, baseRating, onOpenDetail }) {
  const { data: details } = useMovieDetails(movie.id, true);
  const { toggle, has } = useWatchlist();
  const navigate = useNavigate();
  
  const inWatchlist = has(movie.id);
  const genres = details?.genres?.slice(0, 3) || [];
  const runtime = details ? formatRuntime(details.runtime) : null;
  const bgUrl = backdrop(details?.backdrop_path || movie.backdrop_path, "w780");
  const overview = details?.overview || movie.overview;

  const handleWatchlist = (e) => {
    e.stopPropagation();
    toggle(movie);
    toast[inWatchlist ? "error" : "success"](
      inWatchlist ? "Removed from watchlist" : "Added to watchlist 🎬",
      { duration: 2000, style: { background: "#1a1a2e", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" } }
    );
  };

  const handleBook = (e) => {
    e.stopPropagation();
    navigate(`/movie/${movie.id}/theatres`);
  };

  // State 1: Raised (200ms)
  // State 2: Expanded (300ms)
  const cardVariants = {
    hidden: { scale: 1, opacity: 0, y: 0, boxShadow: "0 0px 0px rgba(0,0,0,0)" },
    raised: { 
      scale: 1.08, 
      opacity: 1, 
      y: -5,
      boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
      transition: { duration: 0.2 }
    },
    expanded: { 
      scale: 1.25, 
      y: -40,
      opacity: 1,
      boxShadow: "0 25px 60px rgba(0,0,0,0.8)",
      transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
    }
  };

  const isExpanded = level >= 2;
  const isContent = level >= 3;
  const isActions = level >= 4;
  const isVideo = level >= 5;

  let origin = 'center bottom';
  let leftStyle = '50%';
  let translateX = '-50%';

  if (align === 'left') {
    origin = 'left bottom';
    leftStyle = '0%';
    translateX = '0%';
  } else if (align === 'right') {
    origin = 'right bottom';
    leftStyle = '100%';
    translateX = '-100%';
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate={isExpanded ? "expanded" : "raised"}
      exit="hidden"
      onClick={() => {
        if (onOpenDetail) onOpenDetail(movie);
        else navigate(`/movie/${movie.id}`);
      }}
      className="absolute top-0 flex flex-col pointer-events-auto bg-[#141414] rounded-xl overflow-hidden cursor-pointer"
      style={{ 
        width: 300, 
        left: leftStyle, 
        transform: `translateX(${translateX})`, 
        transformOrigin: origin,
        border: "1px solid rgba(255,255,255,0.1)", 
        zIndex: 100 
      }}
    >
      {/* Top Media Section */}
      <div className="relative w-full bg-[#0a0a0f] overflow-hidden transition-all duration-300"
        style={{ aspectRatio: isExpanded ? "16/9" : "2/3" }}>
        
        {/* Poster (Fades out when expanded) */}
        <motion.img 
          src={posterUrl} 
          alt={movie.title}
          animate={{ opacity: isExpanded ? 0 : 1 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Backdrop (Fades in when expanded) */}
        <motion.img 
          src={bgUrl} 
          animate={{ opacity: isExpanded ? 1 : 0 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Native MP4 Video Preview (Loads at 700ms) */}
        <AnimatePresence>
          {isVideo && (
            <motion.video
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              src={PLACEHOLDER_MP4}
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover z-10"
            />
          )}
        </AnimatePresence>

        {/* Bottom vignette for text legibility */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 z-20 pointer-events-none"
          style={{ background: "linear-gradient(to top, #141414 0%, transparent 100%)" }} />
      </div>

      {/* Bottom Content Section */}
      <motion.div 
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: isExpanded ? "auto" : 0, opacity: isContent ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="px-3 pb-3 flex flex-col gap-2 overflow-hidden bg-[#141414]"
      >
        {/* Title & Rating */}
        <div className="flex items-start justify-between gap-2 pt-1">
          <div className="text-sm font-bold text-white line-clamp-1">{movie.title || movie.name}</div>
          <div className="flex items-center gap-1 bg-white/10 px-1.5 py-0.5 rounded text-[10px] font-bold text-[#facc15]">
            <Star size={9} fill="currentColor" /> {baseRating}
          </div>
        </div>

        {/* Meta Info */}
        <div className="flex items-center gap-2 text-[10px] font-semibold text-emerald-400">
          <span>98% Match</span>
          {baseYear && <span className="text-white/50 border border-white/20 px-1 rounded">{baseYear}</span>}
          {runtime && <span className="text-white/50">{runtime}</span>}
          <span className="text-white/50 border border-white/20 px-1 rounded">HD</span>
        </div>

        {/* Genres */}
        <div className="flex flex-wrap gap-1.5 mt-0.5">
          {genres.map(g => (
            <span key={g.id} className="text-[9px] text-white/70 font-medium tracking-wide flex items-center gap-1.5">
              {g.name} <span className="w-1 h-1 rounded-full bg-white/20" />
            </span>
          ))}
        </div>

        {/* Overview Snippet */}
        <p className="text-[10px] text-white/40 line-clamp-2 mt-0.5 leading-snug">
          {overview}
        </p>

        {/* Action Buttons (Slide up at 500ms) */}
        <motion.div 
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: isActions ? 0 : 15, opacity: isActions ? 1 : 0 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 25 }}
          className="flex items-center gap-2 mt-2"
        >
          <button
            onClick={(e) => { 
              e.stopPropagation(); 
              if (onOpenDetail) onOpenDetail(movie);
              else navigate(`/movie/${movie.id}`);
            }}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-1.5 rounded bg-white text-black hover:bg-white/90 transition-colors"
          >
            <Play size={12} fill="currentColor" /> Trailer
          </button>
          <button
            onClick={handleBook}
            className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center text-white hover:border-white transition-colors bg-[#242424]"
            title="Book Tickets"
          >
            <Ticket size={12} />
          </button>
          <button
            onClick={handleWatchlist}
            className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center text-white hover:border-white transition-colors bg-[#242424]"
            title="Watchlist"
          >
            {inWatchlist ? <Check size={12} /> : <Plus size={12} />}
          </button>
          <button
            onClick={(e) => { 
              e.stopPropagation(); 
              if (onOpenDetail) onOpenDetail(movie);
              else navigate(`/movie/${movie.id}`);
            }}
            className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center text-white hover:border-white transition-colors bg-[#242424] ml-auto"
            title="More Info"
          >
            <ChevronDown size={14} />
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
