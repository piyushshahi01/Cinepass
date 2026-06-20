import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle2, Download, Share2, CalendarPlus, Home, MapPin, Calendar, Clock, ArrowRight } from "lucide-react";
import { useToast } from "../context/ToastContext";

export default function TicketSuccess() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    addToast("Booking confirmed successfully!", "success");
  }, [addToast]);

  const handleDownload = () => {
    addToast("Downloading PDF ticket...", "info");
  };

  const handleShare = () => {
    addToast("Link copied to clipboard!", "success");
  };

  return (
    <div className="min-h-screen pt-24 px-6 md:px-12 xl:px-20 text-white flex flex-col items-center pb-20 relative overflow-hidden">
      
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#e11d48]/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Success Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10 z-10"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
          className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle2 size={40} className="text-green-500" />
        </motion.div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Booking Confirmed!</h1>
        <p className="text-white/50">Your ticket has been sent to your email and SMS.</p>
      </motion.div>

      {/* Premium Ticket Card */}
      <motion.div
        initial={{ opacity: 0, y: 40, rotateX: 20 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 100, damping: 20 }}
        style={{ perspective: 1000 }}
        className="w-full max-w-md z-10"
      >
        <div className="bg-[#12121a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
          
          {/* Top Half: Movie Details */}
          <div className="relative h-48 bg-gray-900">
            <img 
              src="https://image.tmdb.org/t/p/w780/yDHYTfA3R0jFYba16ZAKhWjz5e8.jpg" 
              alt="Movie Backdrop" 
              className="w-full h-full object-cover opacity-50"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#12121a] to-transparent" />
            
            <div className="absolute bottom-6 left-6 right-6">
              <span className="px-2 py-1 rounded bg-[#e11d48] text-[10px] font-bold uppercase tracking-wider mb-2 inline-block">Action / Comedy</span>
              <h2 className="text-2xl font-bold leading-tight">Deadpool & Wolverine</h2>
              <p className="text-sm text-white/70 mt-1">English • 2D</p>
            </div>
          </div>

          {/* Ticket Perforation */}
          <div className="relative flex items-center justify-between px-0 -my-3 z-10">
            <div className="w-6 h-6 bg-[#080810] rounded-full -ml-3 border-r border-white/10" />
            <div className="flex-1 border-b-[2px] border-dashed border-white/20 mx-2" />
            <div className="w-6 h-6 bg-[#080810] rounded-full -mr-3 border-l border-white/10" />
          </div>

          {/* Middle Half: Booking Info */}
          <div className="p-6">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-white/40 text-xs mb-1 flex items-center gap-1"><MapPin size={12} /> Theatre</p>
                <p className="font-semibold text-sm">INOX Laserplex, Mumbai</p>
              </div>
              <div>
                <p className="text-white/40 text-xs mb-1 flex items-center gap-1"><Calendar size={12} /> Date</p>
                <p className="font-semibold text-sm">Thu, 20 Jun 2026</p>
              </div>
              <div>
                <p className="text-white/40 text-xs mb-1 flex items-center gap-1"><Clock size={12} /> Time</p>
                <p className="font-semibold text-sm">07:30 PM</p>
              </div>
              <div>
                <p className="text-white/40 text-xs mb-1">Seats (3)</p>
                <p className="font-semibold text-[#e11d48]">E14, E15, E16</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-white/40 text-xs mb-1">Booking ID</p>
                <p className="font-mono font-bold tracking-widest">{bookingId || 'CP-A8X9K2M'}</p>
              </div>
              <div className="text-right">
                <p className="text-white/40 text-xs mb-1">Total Paid</p>
                <p className="font-bold">₹840</p>
              </div>
            </div>
          </div>

          {/* Bottom Half: QR & Barcode */}
          <div className="p-6 pt-0 flex flex-col items-center">
            {/* Mock QR Code using CSS grid patterns */}
            <div className="w-32 h-32 bg-white rounded-xl p-2 mb-4 flex flex-wrap gap-[2px]">
               {/* Very basic mock QR pattern */}
               {[...Array(64)].map((_, i) => (
                 <div key={i} className={`w-[13px] h-[13px] ${Math.random() > 0.5 ? 'bg-black' : 'bg-transparent'} rounded-sm`} />
               ))}
               <div className="absolute top-2 left-2 w-8 h-8 border-4 border-black rounded" />
               <div className="absolute top-2 right-2 w-8 h-8 border-4 border-black rounded" />
               <div className="absolute bottom-2 left-2 w-8 h-8 border-4 border-black rounded" />
            </div>

            {/* Mock Barcode */}
            <div className="w-full h-12 flex gap-[2px] justify-center opacity-80 mb-2">
              {[...Array(50)].map((_, i) => (
                 <div key={i} className="bg-white h-full" style={{ width: `${Math.random() * 4 + 1}px` }} />
              ))}
            </div>
            <p className="font-mono text-xs text-white/30 tracking-[0.3em]">{bookingId || 'CP-A8X9K2M'}</p>
          </div>

        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-10 flex flex-wrap justify-center gap-4 z-10"
      >
        <button onClick={handleDownload} className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors font-medium text-sm">
          <Download size={16} /> Download PDF
        </button>
        <button onClick={handleShare} className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors font-medium text-sm">
          <Share2 size={16} /> Share Ticket
        </button>
        <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors font-medium text-sm">
          <CalendarPlus size={16} /> Add to Calendar
        </button>
      </motion.div>

      <motion.button 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        onClick={() => navigate('/')}
        className="mt-12 flex items-center gap-2 text-white/50 hover:text-white transition-colors z-10 pb-10"
      >
        <Home size={16} /> Back to Home
      </motion.button>
      
    </div>
  );
}
