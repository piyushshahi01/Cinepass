import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Info, Check, Clock, Plus, Minus, Bike } from "lucide-react";
import { useToast } from "../context/ToastContext";
import { useQuery } from "@tanstack/react-query";
import { getMovieDetails, poster, formatRuntime, getYear, getTrailerKey } from "../api/tmdb";

// ── Mock Layout Data ─────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: "platinum", name: "Platinum", price: 640, rows: ["A", "B"], color: "#8b5cf6" }, 
  { id: "premium", name: "Premium", price: 340, rows: ["C", "D"], color: "#3b82f6" }, 
  { id: "executive", name: "Executive", price: 250, rows: ["E", "F"], color: "#9ca3af" } 
];

const SEAT_MAP = {
  "F": [0,1,1,1,1,0,0,1,1,1,1,0],
  "E": [1,1,1,1,1,1,1,1,1,1,1,1],
  "D": [1,1,1,1,1,1,1,1,1,1,1,1],
  "C": [0,1,1,1,1,0,0,1,1,1,1,0],
  "B": [1,1,1,1,1,1,1,1,1,1,1,1],
  "A": [0,1,1,1,1,0,0,1,1,1,1,0],
};

const OCCUPIED_MOCK = ["C-2", "C-3", "F-4", "A-5", "B-8"];

// ── Components ───────────────────────────────────────────────────────────────

export default function SeatSelection() {
  const navigate = useNavigate();
  const { showId } = useParams();
  const movieId = showId?.split("-")[0];
  
  const { data: movie, isLoading } = useQuery({
    queryKey: ["movie", movieId],
    queryFn: () => getMovieDetails(movieId),
    enabled: !!movieId,
  });

  const { addToast } = useToast();

  const [seatQuantity, setSeatQuantity] = useState(null);
  const [showQuantityModal, setShowQuantityModal] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState([]);
  
  const [scale, setScale] = useState(1);
  const mapRef = useRef(null);

  const toggleSeat = (id, cat) => {
    if (OCCUPIED_MOCK.includes(id)) return;
    
    setSelectedSeats(prev => {
      // If clicking an already selected seat, deselect it
      if (prev.find(s => s.id === id)) {
        return prev.filter(s => s.id !== id);
      }
      
      const [rowLabel, seatNumStr] = id.split("-");
      let startNum = parseInt(seatNumStr, 10);
      
      let newSelection = [];
      let currentNum = startNum;
      
      const maxSeatsInRow = SEAT_MAP[rowLabel].filter(x => x === 1).length;
      
      while (newSelection.length < seatQuantity) {
        const idToCheck = `${rowLabel}-${currentNum}`;
        
        if (currentNum > maxSeatsInRow || OCCUPIED_MOCK.includes(idToCheck)) {
          break;
        }
        
        newSelection.push({ id: idToCheck, ...cat });
        currentNum++;
      }
      
      return newSelection;
    });
  };

  const totalAmount = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  const handleZoom = (direction) => {
    setScale(prev => {
      const newScale = direction === 'in' ? prev + 0.2 : prev - 0.2;
      return Math.min(Math.max(0.6, newScale), 1.5);
    });
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-[#080810]"><div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-[#e11d48] animate-spin" /></div>;
  if (!movie) return null;

  const posterUrl = poster(movie.poster_path, "w500");

  return (
    <div className="fixed inset-0 bg-[#080810] text-white z-50 flex items-center justify-center overflow-hidden p-4 md:p-10 font-sans">

      {/* Main Split Layout Card */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-6xl h-full max-h-[850px] bg-[#12121a] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative border border-white/5"
      >
        {/* LEFT SIDEBAR (Movie Info) */}
        <div className="w-full md:w-[35%] bg-[#0a0a0f] relative shrink-0 text-white flex flex-col border-r border-white/5">
          <div className="absolute top-4 left-4 z-20">
            <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors border border-white/10">
              <ChevronLeft size={20} />
            </button>
          </div>
          
          <div className="absolute inset-0 z-0">
            <img src={posterUrl} alt={movie.title} className="w-full h-full object-cover opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/80 to-transparent" />
          </div>
          
          <div className="flex-1 relative z-10 flex flex-col justify-center items-center">
            {movie?.videos && getTrailerKey(movie.videos) && (
              <button 
                onClick={() => window.open(`https://youtube.com/watch?v=${getTrailerKey(movie.videos)}`, '_blank')}
                className="px-6 py-3 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-bold tracking-wider hover:bg-black/80 transition-colors flex items-center gap-2 mt-20"
              >
                <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-white border-b-[5px] border-b-transparent" />
                WATCH TRAILER
              </button>
            )}
          </div>

          <div className="p-8 flex-none flex flex-col relative z-10">
            <div className="w-8 h-1 bg-[#e11d48] rounded-full mb-4" />
            <div className="text-xs font-semibold text-white/50 mb-1 tracking-wide uppercase">CinePass Exclusive</div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-3 leading-tight">{movie.title} (U/A)</h1>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {movie.genres?.slice(0, 3).map(g => (
                <span key={g.id} className="px-3 py-1 rounded-full border border-white/20 text-[10px] uppercase font-bold text-white/70">
                  {g.name}
                </span>
              ))}
            </div>

            <div className="space-y-4 text-sm font-medium text-white/70 mt-auto">
              <div className="flex items-center gap-3">
                <span className="text-[#e11d48]">♥</span> 
                {Math.round(movie.vote_average * 10)}% ({movie.vote_count} votes)
              </div>
              <div className="flex items-center gap-3">
                <Clock size={14} className="text-white/40" /> 
                {formatRuntime(movie.runtime)}
              </div>
              <div className="flex items-center gap-3">
                <Info size={14} className="text-white/40" /> 
                {getYear(movie.release_date)}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANE (Seat Map) */}
        <div className="flex-1 bg-[#12121a] flex flex-col relative">
          
          {/* Top Date/Time Headers */}
          <div className="flex items-center justify-between p-8 border-b border-white/5 bg-[#12121a] shadow-sm z-10">
            <div className="flex-1 flex flex-col items-center border-r border-white/5">
              <span className="text-xs font-bold text-white/40 uppercase tracking-wider mb-1">Date</span>
              <div className="relative mt-1">
                <select className="text-sm font-bold text-[#e11d48] bg-transparent appearance-none cursor-pointer pr-4 hover:text-white transition-colors focus:outline-none">
                  <option className="bg-[#12121a]">01 Friday, Today</option>
                  <option className="bg-[#12121a]">02 Saturday</option>
                  <option className="bg-[#12121a]">03 Sunday</option>
                  <option className="bg-[#12121a]">04 Monday</option>
                </select>
                <ChevronLeft size={14} className="-rotate-90 absolute right-0 top-1/2 -translate-y-1/2 text-[#e11d48] pointer-events-none" />
              </div>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <span className="text-xs font-bold text-white/40 uppercase tracking-wider mb-1">Time</span>
              <div className="relative mt-1">
                <select className="text-sm font-bold text-[#e11d48] bg-transparent appearance-none cursor-pointer pr-4 hover:text-white transition-colors focus:outline-none">
                  <option className="bg-[#12121a]">12:00PM, Matinee show</option>
                  <option className="bg-[#12121a]">03:30PM, Afternoon show</option>
                  <option className="bg-[#12121a]">07:00PM, Evening show</option>
                  <option className="bg-[#12121a]">10:45PM, Night show</option>
                </select>
                <ChevronLeft size={14} className="-rotate-90 absolute right-0 top-1/2 -translate-y-1/2 text-[#e11d48] pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Seat Grid Area */}
          <div className="flex-1 relative overflow-hidden flex flex-col pt-10">
            
            {/* Screen Curve */}
            <div className="w-full max-w-[600px] mx-auto relative mb-12 flex flex-col items-center px-8">
              <svg width="100%" height="40" viewBox="0 0 600 40" fill="none" preserveAspectRatio="none">
                <path d="M 0 40 Q 300 0 600 40" stroke="#ffffff" strokeOpacity="0.1" strokeWidth="8" strokeLinecap="round" />
                <path d="M 0 40 Q 300 0 600 40" stroke="#e11d48" strokeWidth="24" strokeLinecap="round" opacity="0.3" filter="blur(12px)" />
              </svg>
              <div className="uppercase tracking-[0.2em] text-[10px] font-bold text-white/30 mt-2">
                Screen this side
              </div>
            </div>

            {/* Draggable Map */}
            <div className="flex-1 relative">
              {/* Zoom Controls */}
              <div className="absolute right-6 top-0 z-20 flex flex-col gap-2">
                <button onClick={() => handleZoom('in')} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 shadow-md flex items-center justify-center hover:bg-white/10 text-white/70 transition-colors">
                  <Plus size={16} />
                </button>
                <button onClick={() => handleZoom('out')} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 shadow-md flex items-center justify-center hover:bg-white/10 text-white/70 transition-colors">
                  <Minus size={16} />
                </button>
              </div>

              <motion.div 
                ref={mapRef}
                drag
                dragConstraints={{ left: -300, right: 300, top: -200, bottom: 200 }}
                dragElastic={0.1}
                animate={{ scale }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="w-full h-full cursor-grab active:cursor-grabbing flex flex-col items-center justify-start pb-32 px-4"
              >
                <div className="flex flex-col gap-8 w-max">
                  {CATEGORIES.map(category => {
                    const categoryRows = category.rows;
                    
                    return (
                      <div key={category.id} className="flex flex-col gap-3 relative border-b border-white/5 pb-8 last:border-0">
                        {/* Category Label */}
                        <div className="absolute right-[100%] mr-6 top-0 text-right w-32 flex flex-col justify-center h-6">
                          <span className="text-[10px] font-bold text-white/40 uppercase tracking-wide">{category.name} - ₹{category.price}</span>
                        </div>

                        {categoryRows.map(rowLabel => {
                          const rowMap = SEAT_MAP[rowLabel];
                          let seatNumber = 1;
                          
                          return (
                            <div key={rowLabel} className="flex items-center gap-6 justify-center">
                              <span className="w-4 text-[10px] font-bold text-white/40 text-right">{rowLabel}</span>
                              
                              <div className="flex gap-[8px]">
                                {rowMap.map((isSeat, idx) => {
                                  if (!isSeat) return <div key={idx} className="w-7 h-7" />;
                                  
                                  const id = `${rowLabel}-${seatNumber}`;
                                  const isOccupied = OCCUPIED_MOCK.includes(id);
                                  const isSelected = selectedSeats.some(s => s.id === id);
                                  
                                  const num = seatNumber;
                                  seatNumber++;

                                  // Dark theme seat styles
                                  let bg = "bg-white/5";
                                  let border = "border-white/10";
                                  let text = "text-transparent";
                                  let hover = "hover:border-green-400";
                                  
                                  if (isOccupied) {
                                    bg = "bg-white/5";
                                    border = "border-transparent";
                                    text = "text-transparent";
                                    hover = "cursor-not-allowed";
                                  } else if (isSelected) {
                                    bg = "bg-green-500";
                                    border = "border-green-500";
                                    text = "text-white";
                                    hover = "hover:bg-green-600";
                                  }

                                  return (
                                    <div key={id} className="relative group">
                                      <motion.button
                                        whileHover={!isOccupied ? { scale: 1.15, zIndex: 10 } : {}}
                                        whileTap={!isOccupied ? { scale: 0.9 } : {}}
                                        onClick={() => toggleSeat(id, category)}
                                        className={`
                                          w-7 h-7 text-[10px] font-bold z-10
                                          rounded-t-lg rounded-b-sm 
                                          border-2 ${bg} ${border} ${hover} ${text}
                                          flex items-center justify-center transition-colors
                                          relative overflow-hidden
                                        `}
                                      >
                                        <span className="relative z-20">{num}</span>
                                        {/* Seat design for dark theme */}
                                        {isOccupied && (
                                          <div className="absolute inset-0 flex items-center justify-center opacity-30">
                                            <div className="w-[1.5px] h-[80%] bg-white/40 rotate-45 absolute" />
                                            <div className="w-[1.5px] h-[80%] bg-white/40 -rotate-45 absolute" />
                                          </div>
                                        )}
                                        {!isOccupied && !isSelected && (
                                          <>
                                            <div className="absolute left-0.5 top-1 bottom-0.5 w-[2px] bg-white/10 rounded-full" />
                                            <div className="absolute right-0.5 top-1 bottom-0.5 w-[2px] bg-white/10 rounded-full" />
                                          </>
                                        )}
                                      </motion.button>
                                    </div>
                                  );
                                })}
                              </div>
                              
                              <span className="w-4 text-[10px] font-bold text-white/40 text-left">{rowLabel}</span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>

            {/* Bottom Actions Area */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#12121a] via-[#12121a] to-transparent flex justify-center z-20">
              <button
                onClick={() => {
                  if (selectedSeats.length === 0) return addToast("Select seats first", "error");
                  navigate('/checkout');
                }}
                disabled={selectedSeats.length !== seatQuantity && seatQuantity !== null}
                className={`
                  px-12 py-4 rounded-full font-bold tracking-wide transition-all flex flex-col items-center leading-tight
                  ${selectedSeats.length === seatQuantity 
                    ? "bg-[#e11d48] text-white shadow-xl shadow-[#e11d48]/20 hover:bg-[#be123c]" 
                    : "bg-white/5 border border-white/10 text-white/30 cursor-not-allowed"}
                `}
              >
                <span>CONFIRM & PAY</span>
                {selectedSeats.length > 0 && <span className="text-[10px] font-medium opacity-70">₹{totalAmount}</span>}
              </button>
            </div>

          </div>
        </div>
      </motion.div>

      {/* ── QUANTITY SELECTION MODAL ── */}
      <AnimatePresence>
        {showQuantityModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#12121a] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-8 text-center flex-1">
                <h2 className="text-2xl font-bold text-white mb-8">How many seats?</h2>
                
                <div className="flex justify-center mb-10">
                  {/* Cute Bike Graphic Placeholder */}
                  <div className="w-40 h-32 relative flex items-center justify-center">
                    <Bike size={80} className="text-[#e11d48] relative z-10" strokeWidth={1.5} />
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-24 h-2 bg-black/50 rounded-full blur-sm" />
                  </div>
                </div>

                {/* Number Selector */}
                <div className="flex justify-center gap-2 mb-10 flex-wrap">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <button
                      key={num}
                      onClick={() => setSeatQuantity(num)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-medium transition-all ${
                        seatQuantity === num 
                          ? "bg-[#e11d48] text-white shadow-lg shadow-[#e11d48]/30 scale-110" 
                          : "text-white/60 hover:bg-white/10 border border-white/10"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>

                {/* Categories */}
                <div className="flex justify-around border-t border-white/10 pt-6">
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-bold text-white/50 uppercase tracking-wide">Platinum</span>
                    <span className="font-bold text-white mt-1">₹640</span>
                    <span className="text-[10px] font-bold text-[#e11d48] mt-2 uppercase">Almost Full</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-bold text-white/50 uppercase tracking-wide">Premium</span>
                    <span className="font-bold text-white mt-1">₹340</span>
                    <span className="text-[10px] font-bold text-yellow-500 mt-2 uppercase">Filling Fast</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-bold text-white/50 uppercase tracking-wide">Executive</span>
                    <span className="font-bold text-white mt-1">₹250</span>
                    <span className="text-[10px] font-bold text-green-500 mt-2 uppercase">Available</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowQuantityModal(false)}
                disabled={!seatQuantity}
                className="w-full py-5 bg-[#e11d48] text-white font-bold text-lg hover:bg-[#be123c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/30"
              >
                Select Seats
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
