import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Info, Search, MapPin, Coffee, Car, Accessibility, MonitorPlay } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getMovieDetails, formatRuntime } from "../api/tmdb";
import { useBooking } from "../context/BookingContext";

// Mock Data
const DATES = [
  { day: "Thu", date: "20", month: "Jun" },
  { day: "Fri", date: "21", month: "Jun" },
  { day: "Sat", date: "22", month: "Jun" },
  { day: "Sun", date: "23", month: "Jun" },
];

import { useTheatres } from "../hooks/useTheatres";
import { generateShowtimes } from "../utils/mockData";

export default function TheatreSelection() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useBooking();
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedCity, setSelectedCity] = useState("Delhi");
  const [searchQuery, setSearchQuery] = useState("");
  const { theatres, loading: theatresLoading, fetchByCity } = useTheatres();

  useEffect(() => {
    fetchByCity(selectedCity);
  }, [selectedCity, fetchByCity]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const { data: movie, isLoading } = useQuery({
    queryKey: ["movie", id],
    queryFn: () => getMovieDetails(id),
  });

  const filteredTheatres = theatres.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleShowClick = async (theatre, format, show) => {
    try {
      // Create date format YYYY-MM-DD
      const dateObj = new Date();
      dateObj.setDate(dateObj.getDate() + selectedDate);
      const dateStr = dateObj.toISOString().split('T')[0];
      
      // Convert time like "10:30 AM" to "10:30:00"
      let [time, modifier] = show.time.split(' ');
      let [hours, minutes] = time.split(':');
      if (hours === '12') hours = '00';
      if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
      const showTimeStr = `${hours.toString().padStart(2, '0')}:${minutes}:00`;

      const syncRequest = {
        movieId: parseInt(id),
        movieTitle: movie.title,
        theatreName: theatre.name,
        city: selectedCity,
        address: theatre.address || `${theatre.name}, ${selectedCity}`,
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-[#e11d48] animate-spin" />
      </div>
    );
  }

  if (!movie) return null;

  const genres = movie.genres?.map(g => g.name).join(", ") || "Unknown Genre";
  const languages = movie.spoken_languages?.map(l => l.english_name).join(", ") || "Unknown Language";

  return (
    <div className="min-h-screen pt-24 px-6 md:px-12 xl:px-20 text-white max-w-7xl mx-auto pb-20">
      
      {/* Header Info */}
      <div className="mb-8 flex items-center gap-4 border-b border-white/10 pb-8">
        <button onClick={() => navigate(-1)} className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors shrink-0">
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-bold mb-1">{movie.title}</h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-white/50">
            {movie.adult ? (
              <span className="px-2 py-0.5 rounded border border-[#e11d48]/50 text-[#e11d48]">A</span>
            ) : (
              <span className="px-2 py-0.5 rounded border border-white/20">UA</span>
            )}
            <span>{genres}</span>
            <span>•</span>
            <span>{languages}</span>
            <span>•</span>
            <span>{formatRuntime(movie.runtime)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Col: Filters & Dates */}
        <div className="w-full lg:w-72 shrink-0 sticky top-28 space-y-8 z-10">
          
          {/* Date Picker */}
          <div>
            <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">Dates</h3>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
              {DATES.map((d, i) => (
                <button
                  key={`${d.date}-${d.month}`}
                  onClick={() => setSelectedDate(i)}
                  className={`flex flex-col items-center justify-center w-16 h-20 rounded-2xl border transition-all shrink-0 ${
                    selectedDate === i 
                      ? "bg-[#e11d48] border-[#e11d48] text-white shadow-[0_4px_20px_rgba(225,29,72,0.4)]" 
                      : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:border-white/20"
                  }`}
                >
                  <span className="text-xs uppercase font-medium">{d.day}</span>
                  <span className="text-xl font-bold my-0.5">{d.date}</span>
                  <span className="text-[10px] uppercase font-medium">{d.month}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Location Picker */}
          <div>
            <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">Location</h3>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#e11d48]" size={16} />
              <select 
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-white/30 transition-all appearance-none cursor-pointer"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              >
                <option value="Mumbai" className="bg-[#141414]">Mumbai</option>
                <option value="Delhi" className="bg-[#141414]">Delhi</option>
                <option value="Bangalore" className="bg-[#141414]">Bangalore</option>
                <option value="Hyderabad" className="bg-[#141414]">Hyderabad</option>
                <option value="Chennai" className="bg-[#141414]">Chennai</option>
                <option value="Pune" className="bg-[#141414]">Pune</option>
                <option value="Kolkata" className="bg-[#141414]">Kolkata</option>
                <option value="Noida" className="bg-[#141414]">Noida</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40 text-xs">▼</div>
            </div>
          </div>

          {/* Search */}
          <div>
            <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">Search</h3>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={16} />
              <input 
                type="text" 
                placeholder="Find theatre..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-white/30 transition-all placeholder:text-white/30"
              />
            </div>
          </div>
          
          {/* Legend */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Show Status</h3>
            <div className="flex items-center gap-2 text-xs"><div className="w-2.5 h-2.5 rounded-full bg-green-400" /> Available</div>
            <div className="flex items-center gap-2 text-xs"><div className="w-2.5 h-2.5 rounded-full bg-yellow-400" /> Fast Filling</div>
            <div className="flex items-center gap-2 text-xs"><div className="w-2.5 h-2.5 rounded-full bg-[#e11d48]" /> Almost Full</div>
          </div>

        </div>

        {/* Right Col: Theatre List */}
        <div className="flex-1 w-full space-y-6">
          <AnimatePresence>
            {theatresLoading ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-[#e11d48] animate-spin" />
              </div>
            ) : filteredTheatres.map(theatre => {
              const formats = generateShowtimes(theatre.id, id, theatre.name);
              // Provide some mock amenities if none exist
              const amenities = theatre.amenities || ["food", "parking", "wheelchair"];
              
              return (
              <motion.div 
                key={theatre.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="liquid-glass rounded-3xl p-6"
              >
                {/* Theatre Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      {theatre.name}
                      <button className="text-white/30 hover:text-white transition-colors"><Info size={16} /></button>
                    </h2>
                    <div className="flex items-center gap-4 mt-2 text-xs text-white/50">
                      <span className="flex items-center gap-1"><MapPin size={12} /> {theatre.distance || "2.5 km"}</span>
                      <div className="flex items-center gap-2">
                        {amenities.includes("food") && <Coffee size={12} title="Food & Beverage" />}
                        {amenities.includes("parking") && <Car size={12} title="Parking" />}
                        {amenities.includes("wheelchair") && <Accessibility size={12} title="Wheelchair Access" />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Formats & Shows */}
                <div className="space-y-6">
                  {formats.map((format, i) => (
                    <div key={`format-${format.name}-${i}`} className="flex flex-col md:flex-row gap-4 border-t border-white/5 pt-6 first:border-0 first:pt-0">
                      
                      <div className="w-32 shrink-0 flex items-center gap-2 text-sm font-semibold text-white/70">
                        <MonitorPlay size={16} className="text-[#e11d48]" />
                        {format.name}
                      </div>

                      <div className="flex-1 flex flex-wrap gap-3">
                        {format.shows.map((show, j) => {
                          // Color mapping
                          let colorClass = "border-green-400/50 text-green-400";
                          if (show.status === "fast-filling") colorClass = "border-yellow-400/50 text-yellow-400";
                          if (show.status === "almost-full") colorClass = "border-[#e11d48]/50 text-[#e11d48]";
                          
                          return (
                            <button
                              key={`show-${show.time}-${j}`}
                              onClick={() => handleShowClick(theatre, format, show)}
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
            )})}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
