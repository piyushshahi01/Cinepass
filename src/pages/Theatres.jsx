import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Search, MapPin, Navigation, Map as MapIcon, Star } from "lucide-react";
import { useTheatres } from "../hooks/useTheatres";
import MapModal from "../components/ui/MapModal";

export default function Theatres() {
  const { theatres, loading, error, city, userCoords, fetchByCity, requestLocation, popularCities } = useTheatres();
  const [searchInput, setSearchInput] = useState("");
  const [mapOpen, setMapOpen] = useState(false);

  useEffect(() => {
    // Fetch default city on mount if nothing is loaded
    if (!city && theatres.length === 0) {
      fetchByCity("Mumbai");
    }
  }, [city, theatres.length, fetchByCity]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      fetchByCity(searchInput.trim());
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-2xl mx-auto mb-12"
      >
        <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">Theatres near you</h1>
        <p className="text-white/50 mt-4 text-sm md:text-base">
          Find premium cinemas, IMAX screens, and standard multiplexes across your city.
        </p>
      </motion.div>

      {/* Search Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-2xl mx-auto mb-10"
      >
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-white/40" />
            </div>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by city (e.g., Bangalore, Delhi)"
              className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#e11d48]/50 transition-colors"
            />
          </div>
          <button 
            type="button" 
            onClick={requestLocation}
            className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-[#e11d48] hover:bg-[#be123c] text-white text-sm font-medium transition-colors sm:w-auto w-full whitespace-nowrap"
          >
            <Navigation size={16} /> Locate Me
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          <span className="text-xs text-white/40 mr-2">Popular:</span>
          {popularCities.map((c) => (
            <button
              key={c.name}
              onClick={() => fetchByCity(c.name)}
              className="text-xs px-3 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-colors flex items-center gap-1.5"
            >
              <span>{c.emoji}</span> {c.name}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            {city ? `Cinemas in ${city}` : "Nearby Cinemas"}
            {loading && <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-[#e11d48] animate-spin ml-2" />}
          </h2>
          <p className="text-xs text-white/40 mt-1">{theatres.length} locations found</p>
        </div>
        <button 
          onClick={() => setMapOpen(true)}
          disabled={theatres.length === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <MapIcon size={16} /> View Map
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-8 text-center">
          {error}. Try searching manually.
        </div>
      )}

      {/* Theatre Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && theatres.length === 0 ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="h-40 rounded-2xl bg-white/5 animate-pulse border border-white/10" />
          ))
        ) : theatres.length > 0 ? (
          theatres.map((t, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (i % 10) * 0.05 }}
              key={t.id || i}
              className="group p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/20 hover:bg-white/[0.04] transition-all relative overflow-hidden flex flex-col"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <MapPin size={48} />
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold group-hover:text-[#e11d48] transition-colors mb-2 pr-10 line-clamp-2">
                  {t.name}
                </h3>
                
                <div className="flex items-center gap-3 text-xs text-white/40 mb-4">
                  {t.distance && (
                    <span className="flex items-center gap-1 font-medium text-white/70">
                      <Navigation size={12} /> {t.distance} km away
                    </span>
                  )}
                  {t.distance && <span className="w-1 h-1 rounded-full bg-white/20" />}
                  <span className="flex items-center gap-1">
                    <Star size={12} className="fill-[#facc15] text-[#facc15]" /> 4.{Math.floor(Math.random() * 5) + 5}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-5">
                  {(t.amenities || ["Dolby Atmos", "4K Projection", "Recliner Seats"]).slice(0, 3).map((a) => (
                    <span key={a} className="text-[10px] px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/60">
                      {a}
                    </span>
                  ))}
                </div>
              </div>

              <button className="w-full py-2.5 rounded-xl border border-white/10 text-xs font-medium hover:bg-white/10 transition-colors mt-auto">
                View Showtimes
              </button>
            </motion.div>
          ))
        ) : !loading && (
          <div className="col-span-full py-20 text-center">
            <MapIcon size={48} className="mx-auto text-white/10 mb-4" />
            <h3 className="text-xl font-medium mb-2">No theatres found</h3>
            <p className="text-white/40">Try searching for a different city</p>
          </div>
        )}
      </div>

      <MapModal 
        isOpen={mapOpen} 
        onClose={() => setMapOpen(false)} 
        theatres={theatres}
        userCoords={userCoords}
        city={city}
      />
    </div>
  );
}
