import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, MapPin, Tag, Check, CreditCard, ShieldCheck, Clock, Calendar, Armchair, Ticket, Sparkles, Film } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getMovieDetails, poster, formatRuntime, getYear } from "../api/tmdb";
import { getShowById, releaseSeats } from "../api/backend";
import { useToast } from "../context/ToastContext";

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const { showId, selectedSeats } = location.state || {};

  useEffect(() => {
    if (!showId || !selectedSeats || selectedSeats.length === 0) {
      navigate("/");
    }
  }, [showId, selectedSeats, navigate]);

  const { data: showData, isLoading: showLoading } = useQuery({
    queryKey: ["show", showId],
    queryFn: () => getShowById(showId),
    enabled: !!showId,
  });

  const movieId = showData?.tmdbMovieId;

  const { data: movie, isLoading: movieLoading } = useQuery({
    queryKey: ["movie", movieId],
    queryFn: () => getMovieDetails(movieId),
    enabled: !!movieId,
  });

  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const isProceedingRef = useRef(false);

  useEffect(() => {
    const mountTime = Date.now();
    // Release seats if user navigates away or closes tab without proceeding to payment
    const handleBeforeUnload = (e) => {
      if (!isProceedingRef.current && showId && selectedSeats?.length > 0) {
        // Use Beacon API or sync XHR if possible, but fetch with keepalive is best
        fetch('http://localhost:8080/api/seats/release', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ showId, seatIds: selectedSeats.map(s => s.id) }),
          keepalive: true
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // Ignore React StrictMode immediate unmount (can take longer than 200ms on slower devices)
      if (Date.now() - mountTime < 2000) return;

      // If component unmounts and we're not proceeding to payment, release seats
      if (!isProceedingRef.current && showId && selectedSeats?.length > 0) {
        releaseSeats(showId, selectedSeats.map(s => s.id)).catch(err => console.error(err));
      }
    };
  }, [showId, selectedSeats]);

  if (!showId || !selectedSeats) return null;

  if (showLoading || movieLoading) {
    return (
      <div className="min-h-screen bg-[#080810] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-white/10 border-t-[#e11d48] animate-spin" />
          <p className="text-white/40 text-sm tracking-wider uppercase">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!showData || !movie) return null;

  const ticketTotal = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  const convenienceFee = selectedSeats.length * 35;
  const taxes = ticketTotal * 0.18;
  const discount = couponApplied ? 100 : 0;
  const grandTotal = ticketTotal + convenienceFee + taxes - discount;
  const posterUrl = poster(movie.poster_path, "w500");
  const backdropUrl = poster(movie.backdrop_path, "w1280");

  const handleApplyCoupon = () => {
    if (coupon.toLowerCase() === "onecinema100") {
      setCouponApplied(true);
      addToast("🎉 Coupon applied! ₹100 off", "success");
    } else {
      addToast("Invalid coupon code", "error");
    }
  };

  const handleProceedToPayment = () => {
    setIsProcessing(true);
    isProceedingRef.current = true;
    // Pass all booking data to the payment page directly
    // The payment page will handle the actual booking confirmation
    setTimeout(() => {
      navigate("/payment", {
        state: {
          showId,
          selectedSeats,
          amount: grandTotal,
          movieTitle: movie.title,
          moviePoster: posterUrl,
        },
      });
    }, 600);
  };

  return (
    <div className="fixed inset-0 bg-[#080810] text-white z-50 overflow-auto">
      {/* Background Ambient */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {backdropUrl && (
          <img src={backdropUrl} alt="" className="w-full h-full object-cover opacity-[0.04]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[#080810] via-transparent to-[#080810]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#e11d48]/5 rounded-full blur-[200px]" />
      </div>

      {/* Processing Overlay */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex flex-col items-center justify-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
              className="mb-6"
            >
              <div className="w-16 h-16 rounded-full border-3 border-white/10 border-t-[#e11d48] animate-spin" />
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg font-semibold tracking-wide"
            >
              Preparing your payment...
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-white/40 text-sm mt-2"
            >
              Please do not close this window
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-10"
        >
          <button
            onClick={() => navigate(-1)}
            className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all hover:border-white/20 group"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Review & Checkout</h1>
            <p className="text-white/40 text-sm mt-0.5">Confirm your booking details</p>
          </div>
        </motion.div>

        {/* Steps Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3 mb-10"
        >
          {["Seats", "Review", "Payment"].map((step, i) => (
            <div key={step} className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${
                i <= 1
                  ? "bg-[#e11d48]/10 text-[#e11d48] border border-[#e11d48]/20"
                  : "bg-white/5 text-white/30 border border-white/5"
              }`}>
                {i < 1 ? <Check size={12} /> : <span className="w-4 h-4 flex items-center justify-center">{i + 1}</span>}
                {step}
              </div>
              {i < 2 && <div className={`w-8 h-[1px] ${i < 1 ? "bg-[#e11d48]/30" : "bg-white/10"}`} />}
            </div>
          ))}
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* ──── LEFT COLUMN ──── */}
          <div className="flex-1 space-y-6">

            {/* Movie Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl overflow-hidden"
            >
              <div className="flex gap-0">
                {/* Poster */}
                <div className="w-36 md:w-44 shrink-0 relative">
                  <img src={posterUrl} alt={movie.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#080810]/50" />
                </div>

                {/* Details */}
                <div className="flex-1 p-6 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-2">
                    <Film size={14} className="text-[#e11d48]" />
                    <span className="text-[10px] font-bold text-[#e11d48] uppercase tracking-widest">OneCinema Booking</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold mb-1 leading-tight">{movie.title}</h2>
                  <p className="text-white/40 text-sm mb-4">
                    {movie.genres?.slice(0, 3).map(g => g.name).join(" • ")} • {formatRuntime(movie.runtime)}
                  </p>

                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs font-medium">
                      <Calendar size={13} className="text-[#e11d48]" />
                      <span className="text-white/70">{showData.showDate}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs font-medium">
                      <Clock size={13} className="text-[#e11d48]" />
                      <span className="text-white/70">{showData.startTime}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs font-medium">
                      <MapPin size={13} className="text-[#e11d48]" />
                      <span className="text-white/70 truncate max-w-[200px]">{showData.screen?.theatre?.name || "Theatre"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3 text-xs text-white/30">
                    <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] font-bold">{showData.format || "2D"}</span>
                    <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] font-bold">{showData.language || "English"}</span>
                    <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] font-bold">{showData.screen?.name || "Screen 1"}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Selected Seats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                  <Armchair size={16} className="text-green-400" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Selected Seats</h3>
                  <p className="text-white/40 text-xs">{selectedSeats.length} seat{selectedSeats.length > 1 ? "s" : ""} selected</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedSeats.map((seat, i) => (
                  <motion.div
                    key={seat.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.25 + i * 0.05 }}
                    className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2"
                  >
                    <Ticket size={14} />
                    {seat.seatNumber}
                    <span className="text-green-400/50 text-xs ml-1">₹{seat.price}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Promo Code */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg bg-[#e11d48]/10 border border-[#e11d48]/20 flex items-center justify-center">
                  <Tag size={16} className="text-[#e11d48]" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Promo Code</h3>
                  <p className="text-white/40 text-xs">Apply a coupon to get discount</p>
                </div>
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                  disabled={couponApplied}
                  placeholder="ONECINEMA100"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono tracking-wider focus:outline-none focus:border-[#e11d48]/50 transition-colors placeholder:text-white/20 disabled:opacity-50"
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={couponApplied || !coupon}
                  className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                    couponApplied
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : "bg-[#e11d48] hover:bg-[#be123c] text-white disabled:opacity-30 disabled:bg-white/10 disabled:text-white/30"
                  }`}
                >
                  {couponApplied ? <Check size={18} /> : "APPLY"}
                </button>
              </div>
              {couponApplied && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-green-400 text-xs mt-3 flex items-center gap-1"
                >
                  <Sparkles size={12} /> Coupon ONECINEMA100 applied — ₹100 off!
                </motion.p>
              )}
            </motion.div>
          </div>

          {/* ──── RIGHT COLUMN — ORDER SUMMARY ──── */}
          <div className="w-full lg:w-[380px] shrink-0">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="sticky top-8"
            >
              <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl overflow-hidden">
                {/* Summary Header */}
                <div className="p-6 pb-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-1 h-5 bg-[#e11d48] rounded-full" />
                    <h3 className="text-lg font-bold tracking-tight">Order Summary</h3>
                  </div>
                  <p className="text-white/30 text-xs ml-3 mb-5">Review before payment</p>
                </div>

                {/* Price Breakdown */}
                <div className="px-6 space-y-3 text-sm mb-4">
                  <div className="flex justify-between text-white/60">
                    <span>Tickets ({selectedSeats.length} × ₹{(ticketTotal / selectedSeats.length).toFixed(0)})</span>
                    <span className="font-medium text-white/80">₹{ticketTotal.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-white/60">
                    <span>Convenience Fee</span>
                    <span className="font-medium text-white/80">₹{convenienceFee}</span>
                  </div>
                  <div className="flex justify-between text-white/60">
                    <span>GST (18%)</span>
                    <span className="font-medium text-white/80">₹{taxes.toFixed(2)}</span>
                  </div>
                  <AnimatePresence>
                    {couponApplied && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex justify-between text-green-400 font-bold"
                      >
                        <span className="flex items-center gap-1"><Sparkles size={12} /> Promo Discount</span>
                        <span>-₹{discount}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Divider */}
                <div className="mx-6 border-t border-dashed border-white/10" />

                {/* Grand Total */}
                <div className="px-6 py-5 flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Total Amount</p>
                    <p className="text-3xl font-extrabold bg-gradient-to-r from-[#e11d48] to-[#f43f5e] bg-clip-text text-transparent">
                      ₹{grandTotal.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-white/20">{selectedSeats.length} ticket{selectedSeats.length > 1 ? "s" : ""}</p>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="p-4 pt-0">
                  <button
                    onClick={handleProceedToPayment}
                    disabled={isProcessing}
                    className="w-full py-4 bg-gradient-to-r from-[#e11d48] to-[#be123c] hover:from-[#be123c] hover:to-[#9f1239] text-white rounded-xl font-bold text-base flex items-center justify-center gap-3 transition-all shadow-[0_4px_30px_rgba(225,29,72,0.3)] hover:shadow-[0_8px_40px_rgba(225,29,72,0.4)] disabled:opacity-50 group"
                  >
                    {isProcessing ? (
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        PROCEED TO PAYMENT
                        <CreditCard size={18} className="group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </button>
                </div>

                {/* Security Badge */}
                <div className="px-6 pb-5 flex items-center justify-center gap-2 text-[10px] text-white/20">
                  <ShieldCheck size={12} />
                  <span>256-bit SSL Encrypted • Safe & Secure</span>
                </div>
              </div>

              {/* Info Card */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-4 bg-white/[0.02] border border-white/5 rounded-xl p-4 text-xs text-white/30 leading-relaxed"
              >
                <p className="flex items-start gap-2">
                  <ShieldCheck size={14} className="shrink-0 mt-0.5 text-white/20" />
                  Tickets are non-refundable once confirmed. Seats are held for 10 minutes during payment.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
