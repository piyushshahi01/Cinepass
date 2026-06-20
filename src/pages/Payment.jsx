import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, CreditCard, Smartphone, ShieldCheck, Loader2 } from "lucide-react";
import { useToast } from "../context/ToastContext";
import { useBooking } from "../context/BookingContext";

const PAYMENT_METHODS = [
  { id: "upi", name: "UPI / QR", icon: <Smartphone size={20} /> },
  { id: "card", name: "Credit / Debit Card", icon: <CreditCard size={20} /> }
];

export default function Payment() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { addBooking } = useBooking();
  const [selectedMethod, setSelectedMethod] = useState("upi");
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = () => {
    setIsProcessing(true);
    // Simulate payment processing delay
    setTimeout(() => {
      // Add to bookings context
      const bookingId = addBooking({
        movie: { title: "Deadpool & Wolverine", poster: "https://image.tmdb.org/t/p/w342/yDHYTfA3R0jFYba16ZAKhWjz5e8.jpg" },
        theatre: "INOX Laserplex, Mumbai",
        date: "20 Jun 2026",
        time: "07:30 PM",
        seats: "E14, E15, E16",
        amount: 840
      });
      
      navigate(`/ticket/${bookingId}`);
    }, 3000);
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-[#080810] flex flex-col items-center justify-center text-white fixed inset-0 z-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="mb-8"
        >
          <Loader2 size={48} className="text-[#e11d48]" />
        </motion.div>
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold mb-2"
        >
          Processing Payment...
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-white/50"
        >
          Please do not close this window or press back.
        </motion.p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-6 md:px-12 xl:px-20 text-white max-w-4xl mx-auto pb-20">
      <div className="mb-8 flex items-center gap-4 border-b border-white/10 pb-8">
        <button onClick={() => navigate(-1)} className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors shrink-0">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold">Payment</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Left: Methods */}
        <div className="w-full md:w-64 shrink-0 space-y-2">
          {PAYMENT_METHODS.map(method => (
            <button
              key={method.id}
              onClick={() => setSelectedMethod(method.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${
                selectedMethod === method.id 
                  ? "bg-white/10 border border-white/20 text-white" 
                  : "bg-transparent border border-transparent text-white/50 hover:bg-white/5 hover:text-white"
              }`}
            >
              {method.icon}
              <span className="font-medium">{method.name}</span>
            </button>
          ))}
        </div>

        {/* Right: Forms */}
        <div className="flex-1">
          <motion.div 
            key={selectedMethod}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="liquid-glass rounded-3xl p-8"
          >
            {selectedMethod === "upi" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-2">Pay via UPI</h3>
                  <p className="text-white/50 text-sm">Enter your UPI ID to receive a payment request.</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">UPI ID (VPA)</label>
                  <input type="text" placeholder="example@okhdfcbank" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#e11d48] transition-colors" />
                </div>
              </div>
            )}

            {selectedMethod === "card" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-2">Card Details</h3>
                  <p className="text-white/50 text-sm">We accept Visa, Mastercard, RuPay, and Amex.</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Card Number</label>
                  <input type="text" placeholder="0000 0000 0000 0000" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#e11d48] transition-colors font-mono" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Expiry</label>
                    <input type="text" placeholder="MM/YY" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#e11d48] transition-colors font-mono" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">CVV</label>
                    <input type="password" placeholder="•••" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#e11d48] transition-colors font-mono" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Name on Card</label>
                  <input type="text" placeholder="John Doe" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#e11d48] transition-colors" />
                </div>
              </div>
            )}

            <div className="mt-10 border-t border-white/10 pt-8 flex items-center justify-between">
              <div>
                <p className="text-white/50 text-sm mb-1">Amount to Pay</p>
                <p className="text-3xl font-bold text-[#e11d48]">₹840</p>
              </div>
              <button
                onClick={handlePayment}
                className="px-10 py-4 rounded-xl bg-[#e11d48] text-white font-bold hover:bg-[#be123c] transition-colors shadow-[0_4px_20px_rgba(225,29,72,0.4)] flex items-center gap-2"
              >
                <ShieldCheck size={20} /> Secure Pay
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
