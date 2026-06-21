import { useEffect } from "react";
import { motion } from "motion/react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, MapPin, Coffee, Car, Accessibility, MonitorPlay, Star } from "lucide-react";
import { getNowPlaying, poster } from "../api/tmdb";
import { generateShowtimes } from "../utils/mockData";
import { useBooking } from "../context/BookingContext";

export default function TheatreDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useBooking();

  // The theatre info is passed via React Router state from the Theatres page
  const theatre = location.state?.theatre;

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  // Fetch "Now Playing" movies
  const { data: moviesData, isLoading } = useQuery({
    queryKey: ["now_playing"],
    queryFn: () => getNowPlaying(1),
  });

  const movies = moviesData?.results?.slice(0, 5) || [];

  const handleShowClick = async (movie, format, show) => {
    try {
      // Create date format YYYY-MM-DD
      const dateObj = new Date();
      // Assume today for now, or add selectedDate state if needed later
      const dateStr = dateObj.toISOString().split('T')[0];
      
      let [time, modifier] = show.time.split(' ');
      let [hours, minutes] = time.split(':');
      if (hours === '12') hours = '00';
      if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
      const showTimeStr = `${hours.toString().padStart(2, '0')}:${minutes}:00`;

      const syncRequest = {
        movieId: movie.id,
        movieTitle: movie.title,
        theatreName: theatre.name,
        city: theatre.city || "Mumbai",
        address: theatre.address || "Address not provided",
        latitude: theatre.lat || 0.0,
        longitude: theatre.lon || 0.0,
        format: format.name,
        showTime: showTimeStr,
        date: dateStr
      };
      
      const { syncShow } = await import('../api/backend');
      const response = await syncShow(syncRequest);
      
      navigate(`/booking/${response.showId}`);
    } catch (err) {
      console.error("Failed to sync show", err);
      import('react-hot-toast').then(({ toast }) => toast.error("Failed to load show. Please try again."));
    }
  };

  if (!theatre) {
    return (
      <div className="min-h-screen pt-32 px-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Theatre not found</h2>
        <button onClick={() => navigate("/theatres")} className="px-6 py-3 rounded-full bg-[#e11d48] text-white">Back to Theatres</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-6 md:px-12 xl:px-20 text-white max-w-5xl mx-auto pb-20">
      
      {/* Header Info */}
      <div className="mb-12 flex items-start gap-4 border-b border-white/10 pb-8">
        <button onClick={() => navigate(-1)} className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors shrink-0">
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{theatre.name}</h1>
          <div className="flex flex-col gap-2 text-sm text-white/60">
            <span className="flex items-center gap-2"><MapPin size={16} className="text-[#e11d48]" /> {theatre.address || "Address not available"}, {theatre.city}</span>
            <span className="flex items-center gap-2"><Star size={16} className="text-yellow-400 fill-yellow-400" /> 4.{Math.floor(Math.random() * 5) + 5} / 5.0 (User Reviews)</span>
          </div>
          
          <div className="flex items-center gap-3 mt-4">
            {(theatre.amenities || ["food", "parking", "wheelchair"]).map((a, i) => (
              <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/70 capitalize">
                {a === "food" && <Coffee size={14} />}
                {a === "parking" && <Car size={14} />}
                {a === "wheelchair" && <Accessibility size={14} />}
                {a}
              </span>
            ))}
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-8">Now Playing Here</h2>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-[#e11d48] animate-spin" />
        </div>
      ) : (
        <div className="space-y-8">
          {movies.map((movie, idx) => {
            const formats = generateShowtimes(theatre.id, movie.id);
            
            return (
              <motion.div 
                key={movie.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="liquid-glass rounded-3xl p-6 flex flex-col md:flex-row gap-6 md:gap-8"
              >
                {/* Movie Poster & Basic Info */}
                <div className="w-full md:w-48 shrink-0 flex flex-row md:flex-col gap-4 cursor-pointer" onClick={() => navigate(`/movie/${movie.id}`)}>
                  <img src={poster(movie.poster_path, "w342")} alt={movie.title} className="w-24 md:w-full rounded-xl object-cover shadow-lg" />
                  <div>
                    <h3 className="text-lg font-bold leading-tight mb-1 hover:text-[#e11d48] transition-colors">{movie.title}</h3>
                    <div className="text-xs text-white/50 space-y-1">
                      <p>UA • {movie.original_language?.toUpperCase()}</p>
                      <p className="flex items-center gap-1 text-green-400"><Star size={10} className="fill-green-400" /> {Math.round(movie.vote_average * 10)}% Score</p>
                    </div>
                  </div>
                </div>

                {/* Formats & Shows */}
                <div className="flex-1 space-y-6 md:border-l md:border-white/5 md:pl-8">
                  {formats.map((format, i) => (
                    <div key={i} className="flex flex-col gap-4 border-t border-white/5 pt-6 first:border-0 first:pt-0">
                      
                      <div className="flex items-center gap-2 text-sm font-semibold text-white/70">
                        <MonitorPlay size={16} className="text-[#e11d48]" />
                        {format.name}
                      </div>

                      <div className="flex flex-wrap gap-3">
                        {format.shows.map((show, j) => {
                          let colorClass = "border-green-400/50 text-green-400";
                          if (show.status === "fast-filling") colorClass = "border-yellow-400/50 text-yellow-400";
                          if (show.status === "almost-full") colorClass = "border-[#e11d48]/50 text-[#e11d48]";
                          
                          return (
                            <button
                              key={j}
                              onClick={() => handleShowClick(movie, format, show)}
                              className={`px-4 py-2 rounded-xl border ${colorClass} bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium flex flex-col items-center`}
                            >
                              {show.time}
                              <span className="text-[9px] uppercase tracking-wider opacity-60 mt-0.5">{format.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
