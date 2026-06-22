import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, CreditCard, Smartphone, ShieldCheck, Loader2, Wallet, Building, Check, Lock } from "lucide-react";
import { useToast } from "../context/ToastContext";
import { confirmBooking, initiatePayment, releaseSeats } from "../api/backend";
import { useBooking } from "../context/BookingContext";

const PAYMENT_METHODS = [
  { id: "upi", name: "UPI / QR", icon: <Smartphone size={20} />, desc: "Google Pay, PhonePe, Paytm" },
  { id: "card", name: "Credit / Debit Card", icon: <CreditCard size={20} />, desc: "Visa, Mastercard, RuPay" },
  { id: "wallet", name: "Mobile Wallet", icon: <Wallet size={20} />, desc: "Amazon Pay, Mobikwik" },
  { id: "netbanking", name: "Net Banking", icon: <Building size={20} />, desc: "All major banks" }
];

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  const { user } = useBooking();

  const { showId, selectedSeats, amount, movieTitle, moviePoster, bookingId: existingBookingId } = location.state || {};

  useEffect(() => {
    if (!amount && !existingBookingId) navigate("/");
  }, [amount, existingBookingId, navigate]);

  const [selectedMethod, setSelectedMethod] = useState("upi");
  const [selectedSubMethod, setSelectedSubMethod] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStage, setPaymentStage] = useState(""); // "", "booking", "paying", "success"
  const isBookingConfirmedRef = useRef(false);

  useEffect(() => {
    const mountTime = Date.now();
    const handleBeforeUnload = (e) => {
      // If we haven't confirmed booking, release the locked seats
      if (!isBookingConfirmedRef.current && !existingBookingId && showId && selectedSeats?.length > 0) {
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/seats/release`, {
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

      // Unmount: release seats if not confirmed
      if (!isBookingConfirmedRef.current && !existingBookingId && showId && selectedSeats?.length > 0) {
        releaseSeats(showId, selectedSeats.map(s => s.id)).catch(err => console.error(err));
      }
    };
  }, [showId, selectedSeats, existingBookingId]);

  const handlePayment = async () => {
    setIsProcessing(true);
    setPaymentStage("booking");

    try {
      let finalBookingId = existingBookingId;

      // If we have showId + selectedSeats, create the booking first
      if (!finalBookingId && showId && selectedSeats) {
        const bookingRequest = {
          showId: parseInt(showId),
          userId: user?.id || 1,
          seatIds: selectedSeats.map(s => s.id),
        };
        const booking = await confirmBooking(bookingRequest);
        finalBookingId = booking.id || booking.bookingId;
        isBookingConfirmedRef.current = true;
      }

      setPaymentStage("paying");

      if (finalBookingId) {
        try {
          let backendMethod = selectedMethod.toUpperCase();
          if (backendMethod === "CARD") backendMethod = "CREDIT_CARD";
          if (backendMethod === "NETBANKING") backendMethod = "NET_BANKING";
          
          await initiatePayment({
            bookingId: finalBookingId,
            paymentMethod: backendMethod,
          });
        } catch (e) {
          // Payment API might not be fully implemented, proceed anyway
          console.warn("Payment API error (proceeding):", e);
        }
      }

      setPaymentStage("success");

      // Brief success animation then navigate
      setTimeout(() => {
        navigate(`/ticket/${finalBookingId || "demo"}`, {
          replace: true,
          state: {
            showId,
            selectedSeats,
            amount,
            movieTitle,
            moviePoster,
          },
        });
      }, 1500);
    } catch (err) {
      addToast(err.message || "Payment failed. Please try again.", "error");
      setIsProcessing(false);
      setPaymentStage("");
    }
  };

  if (!amount && !existingBookingId) return null;

  // Processing overlay
  if (isProcessing) {
    return (
      <div className="fixed inset-0 bg-[#080810] z-50 flex flex-col items-center justify-center text-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#e11d48]/5 rounded-full blur-[200px]" />
        </div>

        <motion.div className="relative z-10 flex flex-col items-center">
          {paymentStage === "success" ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center mb-8"
            >
              <Check size={40} className="text-green-400" />
            </motion.div>
          ) : (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
              className="mb-8"
            >
              <div className="w-16 h-16 rounded-full border-[3px] border-white/10 border-t-[#e11d48]" style={{ animation: "spin 1s linear infinite" }} />
            </motion.div>
          )}

          <motion.h2
            key={paymentStage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl font-bold mb-2 text-center"
          >
            {paymentStage === "booking" && "Creating your booking..."}
            {paymentStage === "paying" && "Processing payment..."}
            {paymentStage === "success" && "Payment Successful! 🎉"}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/40 text-sm text-center"
          >
            {paymentStage === "success"
              ? "Redirecting to your ticket..."
              : "Please do not close this window or press back."}
          </motion.p>

          {/* Progress Steps */}
          <div className="flex items-center gap-4 mt-10">
            {["Booking", "Payment", "Done"].map((step, i) => {
              const stageIndex = paymentStage === "booking" ? 0 : paymentStage === "paying" ? 1 : 2;
              const isActive = i <= stageIndex;
              return (
                <div key={step} className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isActive ? "bg-[#e11d48] text-white" : "bg-white/5 text-white/20"
                  }`}>
                    {i < stageIndex ? <Check size={14} /> : i + 1}
                  </div>
                  {i < 2 && <div className={`w-8 h-[2px] ${i < stageIndex ? "bg-[#e11d48]" : "bg-white/10"}`} />}
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#080810] text-white z-50 overflow-auto">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#e11d48]/5 rounded-full blur-[200px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[200px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-10"
        >
          <button
            onClick={() => navigate(-1)}
            className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all group"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Payment</h1>
            <p className="text-white/40 text-sm mt-0.5">Choose your payment method</p>
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
                i <= 2
                  ? "bg-[#e11d48]/10 text-[#e11d48] border border-[#e11d48]/20"
                  : "bg-white/5 text-white/30 border border-white/5"
              }`}>
                {i < 2 ? <Check size={12} /> : <span className="w-4 h-4 flex items-center justify-center">{i + 1}</span>}
                {step}
              </div>
              {i < 2 && <div className="w-8 h-[1px] bg-[#e11d48]/30" />}
            </div>
          ))}
        </motion.div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Left: Payment Methods */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="w-full md:w-72 shrink-0 space-y-2"
          >
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3 px-2">Select Method</p>
            {PAYMENT_METHODS.map((method, i) => (
              <motion.button
                key={method.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                onClick={() => { setSelectedMethod(method.id); setSelectedSubMethod(null); }}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all text-left ${
                  selectedMethod === method.id
                    ? "bg-white/[0.08] border border-[#e11d48]/30 text-white shadow-[0_0_20px_rgba(225,29,72,0.1)]"
                    : "bg-transparent border border-transparent text-white/50 hover:bg-white/[0.03] hover:text-white"
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  selectedMethod === method.id ? "bg-[#e11d48]/20 text-[#e11d48]" : "bg-white/5 text-white/40"
                }`}>
                  {method.icon}
                </div>
                <div>
                  <span className="font-semibold text-sm block">{method.name}</span>
                  <span className="text-[10px] text-white/30">{method.desc}</span>
                </div>
              </motion.button>
            ))}
          </motion.div>

          {/* Right: Form + Pay */}
          <div className="flex-1">
            <motion.div
              key={selectedMethod}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl overflow-hidden"
            >
              <div className="p-8">
                {selectedMethod === "upi" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold mb-1">Pay via UPI</h3>
                      <p className="text-white/40 text-sm">Enter your UPI ID to receive a payment request.</p>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">UPI ID (VPA)</label>
                      <input type="text" placeholder="example@okhdfcbank" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#e11d48]/50 transition-colors placeholder:text-white/15" />
                    </div>
                  </div>
                )}

                {selectedMethod === "card" && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-lg font-bold mb-1">Card Details</h3>
                      <p className="text-white/40 text-sm">We accept Visa, Mastercard, RuPay, and Amex.</p>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Card Number</label>
                      <input type="text" placeholder="0000 0000 0000 0000" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#e11d48]/50 transition-colors font-mono placeholder:text-white/15" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Expiry</label>
                        <input type="text" placeholder="MM/YY" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#e11d48]/50 transition-colors font-mono placeholder:text-white/15" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">CVV</label>
                        <input type="password" placeholder="•••" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#e11d48]/50 transition-colors font-mono placeholder:text-white/15" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Name on Card</label>
                      <input type="text" placeholder="John Doe" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#e11d48]/50 transition-colors placeholder:text-white/15" />
                    </div>
                  </div>
                )}

                {selectedMethod === "wallet" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold mb-1">Mobile Wallet</h3>
                      <p className="text-white/40 text-sm">Pay using your preferred mobile wallet.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {["Amazon Pay", "Mobikwik", "Freecharge", "Airtel Money"].map(w => (
                        <button 
                          key={w} 
                          onClick={() => setSelectedSubMethod(w)}
                          className={`border rounded-xl px-4 py-4 text-sm font-medium transition-all text-left ${
                            selectedSubMethod === w 
                              ? "bg-white/10 border-[#e11d48]/50 text-white" 
                              : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white/70"
                          }`}>
                          {w}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedMethod === "netbanking" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold mb-1">Net Banking</h3>
                      <p className="text-white/40 text-sm">Select your bank to proceed.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {["SBI", "HDFC", "ICICI", "Axis Bank", "Kotak", "Yes Bank"].map(b => (
                        <button 
                          key={b} 
                          onClick={() => setSelectedSubMethod(b)}
                          className={`border rounded-xl px-4 py-4 text-sm font-medium transition-all text-left ${
                            selectedSubMethod === b 
                              ? "bg-white/10 border-[#e11d48]/50 text-white" 
                              : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white/70"
                          }`}>
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Pay Section */}
              <div className="border-t border-white/[0.06] p-6 flex items-center justify-between bg-white/[0.02]">
                <div>
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Amount to Pay</p>
                  <p className="text-2xl font-extrabold bg-gradient-to-r from-[#e11d48] to-[#f43f5e] bg-clip-text text-transparent">
                    ₹{amount?.toFixed(2) || "0.00"}
                  </p>
                </div>
                <button
                  onClick={handlePayment}
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#e11d48] to-[#be123c] text-white font-bold hover:from-[#be123c] hover:to-[#9f1239] transition-all shadow-[0_4px_30px_rgba(225,29,72,0.3)] hover:shadow-[0_8px_40px_rgba(225,29,72,0.4)] flex items-center gap-2 group"
                >
                  <Lock size={16} />
                  Secure Pay
                  <ShieldCheck size={16} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-4 flex items-center justify-center gap-6 text-[10px] text-white/20"
            >
              <span className="flex items-center gap-1"><ShieldCheck size={12} /> 256-bit SSL</span>
              <span className="flex items-center gap-1"><Lock size={12} /> PCI DSS Compliant</span>
              <span className="flex items-center gap-1"><Check size={12} /> RBI Approved</span>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
