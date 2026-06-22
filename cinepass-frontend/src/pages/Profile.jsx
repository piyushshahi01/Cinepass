import { useEffect } from "react";
import { motion } from "motion/react";
import { User, Edit2, Heart, Film, Settings as SettingsIcon, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBooking } from "../context/BookingContext";
import { useWatchlist } from "../hooks/useWatchlist";
import MovieCard from "../components/MovieCard";
import { useQuery } from "@tanstack/react-query";
import { getMyBookings } from "../api/backend";
export default function Profile() {
  const navigate = useNavigate();
  const { user } = useBooking();
  const { list } = useWatchlist();

  const { data: bookings = [] } = useQuery({
    queryKey: ["myBookings", user?.id],
    queryFn: () => getMyBookings(),
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  if (!user) return null;

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth-change"));
    navigate("/login");
  };

  return (
    <div className="min-h-screen pt-28 px-6 md:px-12 xl:px-20 text-white max-w-5xl mx-auto pb-20">
      
      {/* Profile Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="liquid-glass rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 mb-12 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#e11d48]/10 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="relative group cursor-pointer">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/10 relative z-10">
            <img src={user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=e11d48&color=fff`} alt={user.name} className="w-full h-full object-cover" />
          </div>
          <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-20">
            <Edit2 size={24} className="text-white" />
          </div>
        </div>

        <div className="flex-1 text-center md:text-left z-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{user.name}</h1>
          <p className="text-white/50 mb-6">{user.email}</p>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <button 
              onClick={() => navigate('/settings')}
              className="px-6 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <SettingsIcon size={16} /> Edit Profile
            </button>
            <button onClick={handleLogout} className="px-6 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors flex items-center gap-2 text-sm font-medium">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => navigate('/watchlist')}
          className="liquid-glass rounded-3xl p-6 flex items-center gap-6 cursor-pointer group"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-[#e11d48]/20 transition-colors">
            <Heart size={28} className="text-[#e11d48]" />
          </div>
          <div>
            <p className="text-white/50 text-sm font-medium mb-1">Saved Movies</p>
            <p className="text-3xl font-bold">{list.length}</p>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => navigate('/my-bookings')}
          className="liquid-glass rounded-3xl p-6 flex items-center gap-6 cursor-pointer group"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-[#e11d48]/20 transition-colors">
            <Film size={28} className="text-[#e11d48]" />
          </div>
          <div>
            <p className="text-white/50 text-sm font-medium mb-1">Total Bookings</p>
            <p className="text-3xl font-bold">{bookings.length}</p>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
