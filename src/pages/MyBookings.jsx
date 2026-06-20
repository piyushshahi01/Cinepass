import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, MapPin, Calendar, Clock, Download, ChevronRight } from "lucide-react";

const MOCK_BOOKINGS = [
  {
    id: "CP-A8X9K2M",
    movie: "Deadpool & Wolverine",
    poster: "https://image.tmdb.org/t/p/w342/yDHYTfA3R0jFYba16ZAKhWjz5e8.jpg",
    theatre: "INOX Laserplex, Mumbai",
    date: "20 Jun 2026",
    time: "07:30 PM",
    seats: "E14, E15, E16",
    status: "upcoming",
    amount: 840
  },
  {
    id: "CP-99JD1LM",
    movie: "Dune: Part Two",
    poster: "https://image.tmdb.org/t/p/w342/1pdfLvkbY9ohJlCjQH2JGjjc91p.jpg",
    theatre: "PVR IMAX, Lower Parel",
    date: "14 Mar 2026",
    time: "10:15 AM",
    seats: "K12, K13",
    status: "past",
    amount: 1200
  },
  {
    id: "CP-XX45PLO",
    movie: "Furiosa: A Mad Max Saga",
    poster: "https://image.tmdb.org/t/p/w342/iADOJ8Zymht2JPMoy3R7xceZprc.jpg",
    theatre: "Cinepolis, Andheri",
    date: "05 May 2026",
    time: "04:45 PM",
    seats: "A1, A2",
    status: "cancelled",
    amount: 500
  }
];

export default function MyBookings() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBookings = MOCK_BOOKINGS.filter(b => 
    b.status === activeTab && 
    b.movie.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-28 px-6 md:px-12 xl:px-20 text-white max-w-7xl mx-auto">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">My Bookings</h1>
          <p className="text-white/50">Manage your past, present, and future cinematic journeys.</p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
          <input 
            type="text" 
            placeholder="Search bookings..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-[#e11d48]/50 focus:bg-white/10 transition-all placeholder:text-white/30"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 mb-8 overflow-x-auto scrollbar-hide pb-2">
        {["upcoming", "past", "cancelled"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-full text-sm font-medium capitalize transition-all whitespace-nowrap ${
              activeTab === tab 
                ? "bg-white text-black" 
                : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            {tab} Bookings
          </button>
        ))}
      </div>

      {/* Bookings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredBookings.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="col-span-full py-20 flex flex-col items-center justify-center text-center"
            >
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <Calendar size={32} className="text-white/20" />
              </div>
              <h3 className="text-xl font-bold mb-2">No {activeTab} bookings</h3>
              <p className="text-white/50">You don't have any {activeTab} bookings matching your search.</p>
            </motion.div>
          ) : (
            filteredBookings.map((booking, i) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                key={booking.id}
                className="liquid-glass rounded-2xl p-4 flex gap-6 group hover:border-white/20 cursor-pointer"
              >
                <div className="w-24 h-36 rounded-xl overflow-hidden shrink-0">
                  <img src={booking.poster} alt={booking.movie} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                
                <div className="flex-1 py-2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-bold text-lg leading-tight line-clamp-1">{booking.movie}</h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                        booking.status === 'upcoming' ? 'bg-green-500/20 text-green-400' :
                        booking.status === 'past' ? 'bg-white/10 text-white/60' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-xs text-white/40 font-mono tracking-widest mb-4">{booking.id}</p>
                    
                    <div className="space-y-1.5">
                      <p className="text-sm text-white/70 flex items-center gap-2"><MapPin size={14} className="text-white/40" /> {booking.theatre}</p>
                      <div className="flex items-center gap-4 text-sm text-white/70">
                        <p className="flex items-center gap-2"><Calendar size={14} className="text-white/40" /> {booking.date}</p>
                        <p className="flex items-center gap-2"><Clock size={14} className="text-white/40" /> {booking.time}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/10">
                    <div className="text-sm font-medium">₹{booking.amount}</div>
                    
                    {booking.status === 'upcoming' ? (
                      <button className="flex items-center gap-2 text-sm text-[#e11d48] font-medium hover:text-[#f43f5e] transition-colors">
                        <Download size={16} /> Get Ticket
                      </button>
                    ) : (
                      <button className="flex items-center gap-1 text-sm text-white/50 hover:text-white transition-colors">
                        Details <ChevronRight size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
