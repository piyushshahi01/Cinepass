import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import ReactPlayer from "react-player";
import { X, Star, Clock, Calendar, Heart, Share2, Play, ChevronRight, Bookmark, Check, ExternalLink } from "lucide-react";
import { backdrop, poster, avatar, getTrailerKey, formatRuntime, getYear, getRating } from "../../api/tmdb";
import { useMovieDetails } from "../../hooks/useMovies";
import { useWatchlist } from "../../hooks/useWatchlist";
import MovieCard from "../MovieCard";
import toast from "react-hot-toast";

export default function MovieDetailModal({ movie, onClose, onOpenDetail }) {
  const { data, isLoading } = useMovieDetails(movie?.id, !!movie);
  const { toggle, has }    = useWatchlist();
  const [trailerOpen, setTrailerOpen] = useState(false);
  const inWatchlist = has(movie?.id);

  // Close on Escape
  useEffect(() => {
    const handle = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const details      = data || {};
  const trailerKey   = details.videos ? getTrailerKey(details.videos.results || []) : null;
  const bg           = backdrop(details.backdrop_path || movie.backdrop_path, "original");
  const posterUrl    = poster(details.poster_path || movie.poster_path, "w342");
  const cast         = details.credits?.cast?.slice(0, 12) || [];
  const crew         = details.credits?.crew?.filter(c => ["Director","Producer","Screenplay","Writer"].includes(c.job)).slice(0, 4) || [];
  const reviews      = details.reviews?.results?.slice(0, 3) || [];
  const similar      = details.similar?.results?.slice(0, 8) || [];
  const genres       = details.genres || [];
  const rating       = getRating(details.vote_average || movie.vote_average);
  const year         = getYear(details.release_date || movie.release_date);
  const runtime      = formatRuntime(details.runtime);
  const tagline      = details.tagline;
  const overview     = details.overview || movie.overview;
  const budget       = details.budget ? `$${(details.budget / 1e6).toFixed(0)}M` : null;
  const revenue      = details.revenue ? `$${(details.revenue / 1e6).toFixed(0)}M` : null;

  const handleWatchlist = () => {
    toggle(movie);
    toast[inWatchlist ? "error" : "success"](
      inWatchlist ? "Removed from watchlist" : "Added to watchlist 🎬",
      { duration: 2000, style: { background: "#1a1a2e", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" } }
    );
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast.success("Link copied!", { duration: 2000, style: { background: "#1a1a2e", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" } });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-end md:items-center justify-center"
        style={{ backdropFilter: "blur(12px)", background: "rgba(0,0,0,0.85)" }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ y: 80, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 60, opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-t-3xl md:rounded-3xl"
          style={{ background: "linear-gradient(160deg, #0f0f1e 0%, #0a0a16 100%)", border: "1px solid rgba(255,255,255,0.08)", scrollbarWidth: "none" }}
        >
          {/* ── Hero backdrop ── */}
          <div className="relative h-64 md:h-80 overflow-hidden rounded-t-3xl md:rounded-t-3xl">
            {bg ? (
              <img src={bg} alt={movie.title} className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #1a0a2e, #0a1a3e)" }} />
            )}
            <div className="absolute inset-0"
              style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(15,15,30,0.6) 60%, #0f0f1e 100%)" }} />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-105"
              style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)" }}
            >
              <X size={16} className="text-white" />
            </button>

            {/* Play trailer button */}
            {trailerKey && (
              <button
                onClick={() => setTrailerOpen(true)}
                className="absolute inset-0 flex items-center justify-center group"
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center transition-all group-hover:scale-110"
                  style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "2px solid rgba(255,255,255,0.3)" }}>
                  <Play size={28} className="text-white ml-1" fill="white" />
                </div>
              </button>
            )}
          </div>

          {/* ── Content ── */}
          <div className="px-5 md:px-8 pb-8 -mt-12 relative z-10">
            <div className="flex gap-5 items-start">
              {/* Poster */}
              {posterUrl && (
                <img src={posterUrl} alt={movie.title} className="hidden md:block w-28 rounded-xl flex-shrink-0"
                  style={{ border: "2px solid rgba(255,255,255,0.1)", boxShadow: "0 12px 40px rgba(0,0,0,0.6)" }} />
              )}

              <div className="flex-1 min-w-0 pt-10 md:pt-0 md:mt-2">
                {/* Genre pills */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {genres.map(g => (
                    <span key={g.id} className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                      style={{ background: "rgba(225,29,72,0.15)", color: "#f87171", border: "1px solid rgba(225,29,72,0.3)" }}>
                      {g.name}
                    </span>
                  ))}
                </div>

                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight mb-1">
                  {movie.title}
                </h2>
                {tagline && <p className="text-sm text-white/40 italic mb-3">"{tagline}"</p>}

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-white/50 mb-4">
                  <span className="flex items-center gap-1">
                    <Star size={11} className="fill-[#facc15] text-[#facc15]" />{rating}
                  </span>
                  {runtime && <span className="flex items-center gap-1"><Clock size={10} />{runtime}</span>}
                  {year && <span className="flex items-center gap-1"><Calendar size={10} />{year}</span>}
                  {details.vote_count && <span>{details.vote_count.toLocaleString()} votes</span>}
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2">
                  <button
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                    style={{ background: "#e11d48" }}
                    onClick={() => {
                      onClose();
                      window.location.href = `/movie/${movie.id}/theatres`;
                    }}
                  >
                    🎟 Book Tickets
                  </button>
                  <button
                    onClick={handleWatchlist}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium transition-all hover:scale-[1.02]"
                    style={{ background: inWatchlist ? "rgba(225,29,72,0.2)" : "rgba(255,255,255,0.06)", border: `1px solid ${inWatchlist ? "rgba(225,29,72,0.4)" : "rgba(255,255,255,0.12)"}`, color: inWatchlist ? "#f87171" : "rgba(255,255,255,0.7)" }}
                  >
                    {inWatchlist ? <Check size={13} /> : <Bookmark size={13} />}
                    {inWatchlist ? "In Watchlist" : "Watchlist"}
                  </button>
                  <button
                    onClick={handleShare}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-[1.05]"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
                  >
                    <Share2 size={14} className="text-white/60" />
                  </button>
                </div>
              </div>
            </div>

            {/* ── Overview ── */}
            {overview && (
              <div className="mt-6">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-2">Overview</h3>
                <p className="text-sm text-white/70 leading-[1.75]">{overview}</p>
              </div>
            )}

            {/* ── Stats row ── */}
            {(budget || revenue) && (
              <div className="mt-5 flex gap-6">
                {budget && (
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Budget</div>
                    <div className="text-sm font-semibold text-white">{budget}</div>
                  </div>
                )}
                {revenue && (
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Revenue</div>
                    <div className="text-sm font-semibold text-[#34d399]">{revenue}</div>
                  </div>
                )}
              </div>
            )}

            {/* ── Cast ── */}
            {cast.length > 0 && (
              <div className="mt-7">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">Cast</h3>
                <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
                  {cast.map(person => (
                    <div key={person.id} className="flex-shrink-0 text-center" style={{ width: 64 }}>
                      <div className="w-14 h-14 rounded-full overflow-hidden mx-auto mb-1.5"
                        style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)" }}>
                        {person.profile_path ? (
                          <img src={avatar(person.profile_path)} alt={person.name} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/20 text-lg font-bold">
                            {person.name[0]}
                          </div>
                        )}
                      </div>
                      <div className="text-[9px] font-medium text-white/70 leading-tight truncate">{person.name}</div>
                      <div className="text-[9px] text-white/30 truncate">{person.character?.split("/")[0]}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Crew ── */}
            {crew.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-4">
                {crew.map(p => (
                  <div key={p.id + p.job}>
                    <div className="text-[10px] uppercase tracking-wider text-white/30">{p.job}</div>
                    <div className="text-sm font-medium text-white">{p.name}</div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Reviews ── */}
            {reviews.length > 0 && (
              <div className="mt-7">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">Reviews</h3>
                <div className="space-y-3">
                  {reviews.map(r => (
                    <div key={r.id} className="p-4 rounded-xl"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                          style={{ background: "rgba(225,29,72,0.3)" }}>
                          {r.author?.[0]?.toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-white">{r.author}</span>
                        {r.author_details?.rating && (
                          <span className="ml-auto flex items-center gap-1 text-xs text-white/50">
                            <Star size={9} className="fill-[#facc15] text-[#facc15]" />{r.author_details.rating}/10
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/55 leading-relaxed line-clamp-4">{r.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Similar Movies ── */}
            {similar.length > 0 && (
              <div className="mt-7">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">More Like This</h3>
                <div className="flex gap-3 overflow-x-auto pt-32 pb-32 -mt-32 -mb-32 px-4 -mx-4" style={{ scrollbarWidth: "none" }}>
                  {similar.map(m => (
                    <MovieCard key={m.id} movie={m} onOpenDetail={onOpenDetail} />
                  ))}
                </div>
              </div>
            )}

            {isLoading && (
              <div className="mt-6 flex items-center gap-2 text-white/40 text-sm">
                <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
                Loading details...
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* ── Trailer lightbox ── */}
      <AnimatePresence>
        {trailerOpen && trailerKey && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.95)", backdropFilter: "blur(20px)" }}
            onClick={() => setTrailerOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-4xl aspect-video relative"
              onClick={e => e.stopPropagation()}
            >
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=0&controls=1`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ borderRadius: "16px", overflow: "hidden", backgroundColor: "black" }}
              ></iframe>
              <button
                onClick={() => setTrailerOpen(false)}
                className="absolute -top-10 right-0 text-white/60 hover:text-white transition-colors text-sm flex items-center gap-1"
              >
                <X size={14} /> Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
