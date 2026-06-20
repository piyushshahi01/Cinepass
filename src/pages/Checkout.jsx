import { useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Ticket, CreditCard, Tag, AlertCircle } from "lucide-react";
import { useToast } from "../context/ToastContext";

export default function Checkout() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);

  // Mock data
  const basePrice = 840;
  const convenienceFee = 90;
  const tax = Math.round((basePrice + convenienceFee) * 0.18);
  const subtotal = basePrice + convenienceFee + tax;
  const total = subtotal - discount;

  const applyCoupon = () => {
    if (couponCode.toUpperCase() === "CINEPASS50") {
      setDiscount(50);
      addToast("Coupon applied successfully!", "success");
    } else {
      addToast("Invalid coupon code", "error");
    }
  };

  return (
    <div className="min-h-screen pt-24 px-6 md:px-12 xl:px-20 text-white max-w-5xl mx-auto pb-20">
      
      {/* Header */}
      <div className="mb-8 flex items-center gap-4 border-b border-white/10 pb-8">
        <button onClick={() => navigate(-1)} className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors shrink-0">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold">Booking Summary</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Col: Details */}
        <div className="flex-1 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="liquid-glass rounded-3xl p-6 flex flex-col md:flex-row gap-6"
          >
            <div className="w-32 h-48 rounded-xl overflow-hidden shrink-0 shadow-2xl">
              <img src="https://image.tmdb.org/t/p/w342/yDHYTfA3R0jFYba16ZAKhWjz5e8.jpg" alt="Poster" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col justify-center">
              <h2 className="text-2xl font-bold mb-2">Deadpool & Wolverine</h2>
              <div className="space-y-2 text-white/70 text-sm">
                <p>INOX Laserplex, Mumbai</p>
                <p>Thu, 20 Jun 2026 • 07:30 PM</p>
                <p>English • 2D</p>
              </div>
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Selected Seats</p>
                <div className="flex gap-2">
                  <span className="px-3 py-1 rounded bg-white/10 text-sm font-semibold">E14</span>
                  <span className="px-3 py-1 rounded bg-white/10 text-sm font-semibold">E15</span>
                  <span className="px-3 py-1 rounded bg-white/10 text-sm font-semibold">E16</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="liquid-glass rounded-3xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Tag size={20} className="text-[#e11d48]" />
              <h3 className="text-lg font-bold">Offers & Promocodes</h3>
            </div>
            <div className="flex gap-4">
              <input 
                type="text" 
                placeholder="Enter CINEPASS50" 
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 text-sm focus:outline-none focus:border-[#e11d48] uppercase transition-colors"
              />
              <button 
                onClick={applyCoupon}
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 font-semibold transition-colors"
              >
                Apply
              </button>
            </div>
          </motion.div>
        </div>

        {/* Right Col: Price Breakdown */}
        <div className="w-full lg:w-96 shrink-0">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="liquid-glass rounded-3xl p-6 sticky top-28"
          >
            <h3 className="text-xl font-bold mb-6">Price Details</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Ticket Price (3 Seats)</span>
                <span>₹{basePrice}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/70 flex items-center gap-1">Convenience Fee <AlertCircle size={12} className="text-white/40" /></span>
                <span>₹{convenienceFee}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Integrated GST (18%)</span>
                <span>₹{tax}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-400 font-medium">
                  <span>Discount Applied</span>
                  <span>-₹{discount}</span>
                </div>
              )}
            </div>

            <div className="h-px bg-white/10 my-6" />

            <div className="flex justify-between items-end mb-8">
              <span className="text-white/70">Grand Total</span>
              <span className="text-3xl font-bold text-[#e11d48]">₹{total}</span>
            </div>

            <button
              onClick={() => navigate('/payment')}
              className="w-full py-4 rounded-xl bg-[#e11d48] text-white font-bold hover:bg-[#be123c] transition-colors shadow-[0_4px_20px_rgba(225,29,72,0.4)] flex items-center justify-center gap-2"
            >
              Proceed To Payment <CreditCard size={18} />
            </button>
            
            <p className="text-xs text-center text-white/30 mt-4">By proceeding, you agree to our Terms & Conditions.</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
