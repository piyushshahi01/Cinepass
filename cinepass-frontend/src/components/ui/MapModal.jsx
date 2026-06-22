import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet's default icon issue in React
import L from "leaflet";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

export default function MapModal({ isOpen, onClose, theatres, userCoords, city }) {
  if (!isOpen) return null;

  // Default to India if no data
  const defaultCenter = [20.5937, 78.9629];
  const defaultZoom = 5;

  const mapCenter = userCoords 
    ? [userCoords.lat, userCoords.lng] 
    : theatres.length > 0 
      ? [theatres[0].lat, theatres[0].lon] 
      : defaultCenter;

  const mapZoom = userCoords || theatres.length > 0 ? 12 : defaultZoom;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 md:p-10"
        >
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-50 shadow-2xl"
          >
            <X size={24} />
          </button>
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full h-full max-w-6xl max-h-[80vh] bg-[#0a0a0f] rounded-3xl overflow-hidden border border-white/20 shadow-[0_0_50px_rgba(225,29,72,0.15)] flex flex-col relative"
          >
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/50 backdrop-blur-xl absolute top-0 inset-x-0 z-[400]">
              <h2 className="text-lg font-semibold">Theatres {city ? `in ${city}` : 'Nearby'}</h2>
              <div className="text-xs text-white/50">{theatres.length} locations found</div>
            </div>

            <div className="flex-1 w-full relative z-[1]">
              <MapContainer 
                center={mapCenter} 
                zoom={mapZoom} 
                style={{ height: "100%", width: "100%", background: "#1a1a24" }}
                zoomControl={false}
              >
                <ChangeView center={mapCenter} zoom={mapZoom} />
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                
                {userCoords && (
                  <Marker position={[userCoords.lat, userCoords.lng]}>
                    <Popup className="onecinema-popup">
                      <div className="font-semibold">You are here</div>
                    </Popup>
                  </Marker>
                )}

                {theatres.map((t, i) => (
                  <Marker key={t.id || i} position={[t.lat, t.lon]}>
                    <Popup className="onecinema-popup">
                      <div className="text-[#0a0a0f]">
                        <div className="font-bold text-sm mb-1">{t.name}</div>
                        {t.distance && <div className="text-[10px] text-gray-500">{t.distance} km away</div>}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
            
            <style>{`
              .leaflet-container { font-family: inherit; }
              .leaflet-popup-content-wrapper { border-radius: 12px; }
              .leaflet-popup-content { margin: 12px; }
            `}</style>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
