import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import { Play, Star, Clock, Calendar, Heart, Share2, Ticket, X } from "lucide-react";
import ReactPlayer from "react-player";
import { getMovieDetails, backdrop, poster, avatar, formatRuntime, getYear, getTrailerKey } from "../api/tmdb";
import { useWatchlist } from "../hooks/useWatchlist";
import MovieCard from "../components/MovieCard";

export default function MovieDetails() {
  const { id } = useParams();
  const { data: movie, isLoading } = useQuery({
    queryKey: ["movie", id],
    queryFn: () => getMovieDetails(id),
  });
  
  const { list, add, remove, has } = useWatchlist();
  const [trailerOpen, setTrailerOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-[#e11d48] animate-spin" />
      </div>
    );
  }

  if (!movie) return null;

  const bgUrl = backdrop(movie.backdrop_path, "original");
  const posterUrl = poster(movie.poster_path, "w500");
  const trailerKey = getTrailerKey(movie.videos);
  const isSaved = has(movie.id);

  const cast = movie.credits?.cast?.slice(0, 10) || [];
  const similar = movie.similar?.results?.slice(0, 5) || [];
  const reviews = movie.reviews?.results?.slice(0, 3) || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pb-20"
    >
      {/* Cinematic Hero */}
      <div className="relative h-[70vh] w-full flex items-end">
        <div className="absolute inset-0 z-0">
          <img src={bgUrl} alt={movie.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #0a0a0f 0%, rgba(10,10,15,0.6) 50%, rgba(10,10,15,0.3) 100%)" }} />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-12 flex flex-col md:flex-row gap-8 items-end">
          <motion.img 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            src={posterUrl} 
            alt={movie.title}
            className="w-48 md:w-64 rounded-2xl shadow-2xl border border-white/10 hidden md:block"
          />
          
          <div className="flex-1">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center gap-3 text-xs font-medium text-white/60 mb-4"
            >
              <span className="px-2 py-0.5 rounded-full border border-white/20 bg-white/10 text-white">
                {getYear(movie.release_date)}
              </span>
              <span className="flex items-center gap-1"><Clock size={12} /> {formatRuntime(movie.runtime)}</span>
              <span className="flex items-center gap-1 text-[#facc15]"><Star size={12} className="fill-[#facc15]" /> {movie.vote_average?.toFixed(1)}</span>
            </motion.div>

            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-4xl md:text-6xl font-bold tracking-tight mb-2 text-white"
            >
              {movie.title}
            </motion.h1>

            {movie.tagline && (
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-lg md:text-xl text-[#e11d48] font-medium mb-4 italic"
              >
                "{movie.tagline}"
              </motion.p>
            )}

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-2 mb-8"
            >
              {movie.genres?.map(g => (
                <span key={g.id} className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70">
                  {g.name}
                </span>
              ))}
            </motion.div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex flex-wrap gap-4"
            >
              {trailerKey && (
                <button 
                  onClick={() => setTrailerOpen(true)}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#e11d48] text-white font-medium hover:bg-[#be123c] transition-colors"
                >
                  <Play size={16} className="fill-white" />
                  Watch Trailer
                </button>
              )}
              <button 
                onClick={() => isSaved ? remove(movie.id) : add(movie)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full border transition-colors ${
                  isSaved ? "bg-white/10 border-white/20 text-white" : "bg-transparent border-white/20 text-white hover:bg-white/5"
                }`}
              >
                <Heart size={16} className={isSaved ? "fill-[#e11d48] text-[#e11d48]" : ""} />
                {isSaved ? "Saved" : "Add to Watchlist"}
              </button>
              <button className="flex items-center gap-2 w-12 h-12 justify-center rounded-full border border-white/20 hover:bg-white/5 transition-colors">
                <Share2 size={16} />
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-12 grid md:grid-cols-3 gap-12">
        <div className="md:col-span-2 space-y-12">
          {/* Synopsis */}
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">Storyline</h2>
            <p className="text-white/60 leading-relaxed text-sm md:text-base">
              {movie.overview || "No overview available."}
            </p>
          </section>

          {/* Cast */}
          {cast.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-6">Top Cast</h2>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                {cast.map(person => (
                  <div key={person.id} className="flex-shrink-0 w-[100px] snap-start">
                    <div className="w-[100px] h-[100px] rounded-full overflow-hidden bg-white/5 mb-3 border border-white/10">
                      {person.profile_path ? (
                        <img src={avatar(person.profile_path)} alt={person.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20">?</div>
                      )}
                    </div>
                    <h3 className="text-xs font-semibold text-center truncate">{person.name}</h3>
                    <p className="text-[10px] text-white/40 text-center truncate">{person.character}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Reviews */}
          {reviews.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-6">Featured Reviews</h2>
              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review.id} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs">
                        {review.author.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{review.author}</div>
                        {review.author_details?.rating && (
                          <div className="flex items-center gap-1 text-[10px] text-[#facc15]">
                            <Star size={10} className="fill-[#facc15]" /> {review.author_details.rating}/10
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-white/60 line-clamp-4 leading-relaxed">
                      {review.content}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-8">
          {/* Mock Theatres */}
          <section className="p-6 rounded-3xl bg-white/[0.02] border border-white/10">
            <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
              <Ticket size={18} className="text-[#e11d48]" />
              Book Tickets
            </h2>
            <div className="space-y-4">
              {[
                { name: "PVR Luxe", time: "4:30 PM", format: "IMAX 3D" },
                { name: "Cinepolis VIP", time: "6:15 PM", format: "4DX" },
                { name: "INOX Megaplex", time: "8:00 PM", format: "2D" }
              ].map(t => (
                <div key={t.name} onClick={() => window.location.href = `/movie/${movie.id}/theatres`} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-transparent hover:border-white/10">
                  <div>
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="text-[10px] text-white/40 mt-1">{t.format}</div>
                  </div>
                  <div className="text-xs font-semibold text-[#e11d48] bg-[#e11d48]/10 px-3 py-1.5 rounded-full">
                    {t.time}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => window.location.href = `/movie/${movie.id}/theatres`} className="w-full mt-5 py-3 rounded-xl border border-white/20 text-sm font-medium hover:bg-white/5 transition-colors">
              View All Shows
            </button>
          </section>

          {/* Similar Movies */}
          {similar.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-4">Similar Movies</h2>
              <div className="flex flex-col gap-4">
                {similar.map(movie => (
                  <Link key={movie.id} to={`/movie/${movie.id}`} className="flex gap-4 group">
                    <img src={poster(movie.poster_path, "w154")} alt={movie.title} className="w-16 h-24 rounded-lg object-cover border border-white/5 group-hover:border-white/20 transition-colors" />
                    <div className="py-1">
                      <div className="text-sm font-medium group-hover:text-[#e11d48] transition-colors line-clamp-2">
                        {movie.title}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-white/40 mt-2">
                        <span>{getYear(movie.release_date)}</span>
                        <span className="flex items-center gap-1 text-[#facc15]"><Star size={10} className="fill-[#facc15]"/> {movie.vote_average?.toFixed(1)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Trailer Modal */}
      <AnimatePresence>
        {trailerOpen && trailerKey && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          >
            <button 
              onClick={() => setTrailerOpen(false)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20"
            >
              <X size={20} />
            </button>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
            >
              <ReactPlayer 
                url={`https://www.youtube.com/watch?v=${trailerKey}`}
                width="100%"
                height="100%"
                controls
                playing
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
