import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, Navigation, Building2, Phone, Globe, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import { useTheatres } from "../../hooks/useTheatres";
import { SkeletonTheatreCard } from "../ui/SkeletonCard";

// Dynamically import leaflet to avoid SSR issues
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix leaflet's default icon in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function TheatreCard({ theatre, userCoords, onSelect }) {
  const dist = userCoords ? haversineKm(userCoords.lat, userCoords.lng, theatre.lat, theatre.lng).toFixed(1) : null;
  
  // Deterministic random rating between 4.0 and 4.9 based on ID
  const pseudoRating = (4.0 + (theatre.id?.charCodeAt(0) % 10) / 10).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
      whileHover={{ y: -4, borderColor: "rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.04)" }}
    >
      {/* Theatre Image */}
      <div className="w-full sm:w-48 h-32 sm:h-full relative flex-shrink-0 bg-[#0c0c16] overflow-hidden">
        <img 
          src={`https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400&q=80&sig=${theatre.id}`} 
          alt="Cinema" 
          className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, transparent, rgba(8,8,16,0.9) 100%)" }} />
      </div>

      {/* Content */}
      <div className="flex flex-col justify-between p-5 flex-1 min-w-0">
        <div>
          <div className="flex items-start justify-between gap-4 mb-1.5">
            <h3 className="text-lg font-bold text-white truncate">{theatre.name}</h3>
            <div className="flex items-center gap-1 bg-[#1a1a2e] px-2 py-0.5 rounded-md flex-shrink-0 border border-white/10">
              <span className="text-[#facc15]">⭐</span>
              <span className="text-[11px] font-bold">{pseudoRating}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-white/50 mb-3">
            {dist && (
              <span className="flex items-center gap-1 font-medium text-white/70">
                <MapPin size={10} className="text-[#e11d48]" /> {dist} km
              </span>
            )}
            {dist && <span className="w-1 h-1 rounded-full bg-white/20" />}
            <span className="truncate">{theatre.address}</span>
          </div>

          {/* Amenities */}
          <div className="flex flex-wrap gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 text-white/70 border border-white/10">
              IMAX
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 text-white/70 border border-white/10">
              Dolby Atmos
            </span>
            {theatre.openingHours && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Open Now
              </span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-4 flex justify-end">
          <button 
            className="flex items-center gap-1.5 text-xs font-bold text-[#f43f5e] group-hover:text-white transition-colors"
            onClick={(e) => { e.stopPropagation(); onSelect?.(theatre); }}
          >
            View Shows <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function NearbyTheatres() {
  const { theatres, loading, error, city, userCoords, requestLocation, fetchByCity, popularCities } = useTheatres();
  const [selectedCity, setSelectedCity] = useState(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); 
  const [mapZoom, setMapZoom] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");

  const handleCityClick = async (c) => {
    setSelectedCity(c.name);
    setSearchQuery("");
    await fetchByCity(c.name);
    setMapCenter([c.lat, c.lng]);
    setMapZoom(13);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSelectedCity(searchQuery);
    await fetchByCity(searchQuery);
  };

  const openMap = () => {
    if (theatres.length > 0) {
      setMapCenter([theatres[0].lat, theatres[0].lng]);
      setMapZoom(12);
    }
    setIsMapOpen(true);
  };

  return (
    <section className="max-w-[1440px] mx-auto px-6 py-16 md:py-24 relative z-[3]">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="flex items-center gap-2.5 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e11d48]" />
            <span className="text-xs uppercase tracking-widest text-white/60 font-medium">Theatres</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-white mb-2">
            Cinemas near you.
          </h2>
          <p className="text-sm md:text-base text-white/50">Book tickets at premium theatres in your city.</p>
        </motion.div>

        <div className="flex items-center gap-3">
          <button
            onClick={openMap}
            disabled={theatres.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ border: "1px solid rgba(255,255,255,0.15)" }}
          >
            <MapPin size={16} /> View on Map
          </button>
        </div>
      </div>

      {/* Location Controls */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <form onSubmit={handleSearch} className="relative flex-1 min-w-[280px] max-w-sm">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search City..."
              className="w-full bg-[#1a1a2e] text-white text-sm rounded-full pl-4 pr-10 py-2.5 outline-none border border-white/10 focus:border-white/30 transition-colors"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors">
              <Navigation size={14} />
            </button>
          </form>

          <button
            onClick={requestLocation}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: "#e11d48", color: "white" }}
          >
            {loading ? <Loader2 size={12} className="animate-spin" /> : <MapPin size={12} />}
            Use My Location
          </button>
        </div>

        {/* City quick-picks */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-white/40 uppercase tracking-wider font-semibold mr-1 flex items-center gap-1">
            🔥 Popular
          </span>
          <div className="flex gap-2 flex-wrap">
            {popularCities.map(c => (
              <button
                key={c.name}
                onClick={() => handleCityClick(c)}
                className="px-3 py-1.5 rounded-full transition-all font-medium"
                style={{
                  background: selectedCity === c.name ? "rgba(225,29,72,0.15)" : "transparent",
                  color: selectedCity === c.name ? "#fff" : "rgba(255,255,255,0.5)",
                }}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-orange-400 mb-6 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
          <AlertCircle size={16} />
          {error} — Please try searching for your city instead.
        </div>
      )}

      {/* Theatre Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {loading && Array.from({ length: 6 }).map((_, i) => (
           <div key={i} className="h-[140px] rounded-2xl animate-pulse bg-white/5 border border-white/10" />
        ))}

        {!loading && theatres.length === 0 && !error && (
          <div className="col-span-full flex flex-col items-center justify-center text-white/30 gap-4 py-20 border border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
            <Building2 size={48} className="text-white/20" />
            <span className="text-base font-medium">Select a city or allow location to find premium cinemas near you.</span>
          </div>
        )}

        {theatres.map(t => (
          <TheatreCard
            key={t.id}
            theatre={t}
            userCoords={userCoords}
            onSelect={() => {}}
          />
        ))}
      </div>

      {/* Map Modal */}
      <AnimatePresence>
        {isMapOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
            style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }}
            onClick={() => setIsMapOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-5xl h-[80vh] bg-[#0c0c16] rounded-3xl overflow-hidden shadow-2xl border border-white/10 relative flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#0c0c16] z-10 relative shadow-md">
                <div>
                  <h3 className="text-lg font-bold text-white">Cinemas near {selectedCity || "you"}</h3>
                  <p className="text-xs text-white/50">{theatres.length} locations found</p>
                </div>
                <button 
                  onClick={() => setIsMapOpen(false)}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/10"
                >
                  <span className="sr-only">Close</span>
                  ✕
                </button>
              </div>

              <div className="flex-1 relative z-0">
                <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: "100%", width: "100%", background: "#1a1a2e" }} key={`${mapCenter[0]}-${mapCenter[1]}-${mapZoom}`}>
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  />
                  {userCoords && (
                    <>
                      <Circle center={[userCoords.lat, userCoords.lng]} radius={1000} pathOptions={{ color: "#e11d48", fillColor: "#e11d48", fillOpacity: 0.15, weight: 1 }} />
                      <Marker position={[userCoords.lat, userCoords.lng]}>
                        <Popup className="dark-popup">📍 You are here</Popup>
                      </Marker>
                    </>
                  )}
                  {theatres.map(t => (
                    <Marker key={t.id} position={[t.lat, t.lng]}>
                      <Popup className="dark-popup">
                        <strong className="block text-sm mb-1">{t.name}</strong>
                        <span className="text-xs opacity-70">{t.address}</span>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
