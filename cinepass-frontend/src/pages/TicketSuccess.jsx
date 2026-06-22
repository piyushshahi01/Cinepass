import { useEffect, useState, useRef } from "react";
import { motion } from "motion/react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { CheckCircle2, Download, Share2, CalendarPlus, Home, MapPin, Calendar, Clock, Film, Ticket, Armchair, Copy, Check } from "lucide-react";
import { useToast } from "../context/ToastContext";
import { useQuery } from "@tanstack/react-query";
import { getBooking } from "../api/backend";
import { getMovieDetails, poster } from "../api/tmdb";

export default function TicketSuccess() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const ticketRef = useRef(null);

  // Data passed from Payment page
  const passedState = location.state || {};

  useEffect(() => {
    if (!mounted) {
      setMounted(true);
      const timer = setTimeout(() => {
        addToast("🎉 Booking confirmed successfully!", "success");
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [addToast, mounted]);

  // Auto-redirect to homepage when countdown reaches 0
  useEffect(() => {
    if (countdown === 0) {
      navigate("/");
    }
  }, [countdown, navigate]);

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Try to fetch booking from backend, but don't block if it fails
  const { data: booking } = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: () => getBooking(bookingId),
    enabled: !!bookingId && bookingId !== "demo",
    retry: 1,
  });

  // Try to get show data for tmdbMovieId
  const showId = booking?.showId || passedState.showId;

  const { data: showData } = useQuery({
    queryKey: ["show", showId],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/shows/${showId}`);
      const json = await res.json();
      return json.data;
    },
    enabled: !!showId,
    retry: 1,
  });

  const tmdbMovieId = showData?.tmdbMovieId;

  const { data: movie } = useQuery({
    queryKey: ["movie", tmdbMovieId],
    queryFn: () => getMovieDetails(tmdbMovieId),
    enabled: !!tmdbMovieId,
  });

  // Build display data from whatever sources are available
  const movieTitle = movie?.title || passedState.movieTitle || "Movie";
  const moviePosterUrl = movie ? poster(movie.poster_path, "w500") : passedState.moviePoster;
  const movieBackdropUrl = movie ? poster(movie.backdrop_path, "w1280") : null;
  const genres = movie?.genres?.slice(0, 2).map(g => g.name) || [];
  const seats = booking?.seats || passedState.selectedSeats || [];
  const totalAmount = booking?.totalAmount || passedState.amount || 0;
  const showDate = showData?.showDate || "Today";
  const showTime = showData?.startTime || "";
  const theatreName = showData?.screen?.theatre?.name || "Theatre";
  const theatreCity = showData?.screen?.theatre?.city || "";
  const screenName = showData?.screen?.name || "Screen 1";
  const format = showData?.format || "2D";
  const language = showData?.language || "English";
  const seatNumbers = seats.map(s => s.seatNumber || `Seat ${s.id}`).join(", ");

  // QR Code Data — encode real booking information
  const qrData = JSON.stringify({
    id: bookingId,
    movie: movieTitle,
    date: showDate,
    time: showTime,
    theatre: theatreName,
    seats: seatNumbers,
    amount: totalAmount,
  });

  // Use a free QR code API to generate a real QR code
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}&bgcolor=0a0a0f&color=ffffff&margin=8`;

  const handleCopyId = () => {
    navigator.clipboard.writeText(bookingId);
    setCopied(true);
    addToast("Booking ID copied!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = () => {
    // Generate a printable ticket HTML and trigger print/save as PDF
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      addToast("Please allow popups to download ticket", "error");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>OneCinema Ticket - ${bookingId}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', system-ui, sans-serif; background: #f5f5f5; padding: 40px; display: flex; justify-content: center; }
          .ticket { background: white; width: 400px; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
          .header { background: linear-gradient(135deg, #e11d48, #be123c); padding: 24px; color: white; text-align: center; }
          .header h1 { font-size: 14px; letter-spacing: 3px; text-transform: uppercase; opacity: 0.8; margin-bottom: 4px; }
          .header h2 { font-size: 24px; font-weight: 700; }
          .perf { display: flex; align-items: center; padding: 0 0; margin: -8px 0; position: relative; z-index: 1; }
          .perf .dot { width: 16px; height: 16px; background: #f5f5f5; border-radius: 50%; }
          .perf .line { flex: 1; border-top: 2px dashed #ddd; }
          .body { padding: 24px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
          .field label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #999; display: block; margin-bottom: 4px; }
          .field p { font-size: 14px; font-weight: 600; color: #1a1a1a; }
          .seats { background: #f8f8f8; border-radius: 12px; padding: 16px; text-align: center; margin-bottom: 20px; }
          .seats label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #999; display: block; margin-bottom: 8px; }
          .seats p { font-size: 18px; font-weight: 700; color: #e11d48; letter-spacing: 2px; }
          .total { display: flex; justify-content: space-between; align-items: center; background: #1a1a1a; color: white; border-radius: 12px; padding: 16px; margin-bottom: 20px; }
          .total label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #999; }
          .total p { font-size: 24px; font-weight: 700; }
          .qr { text-align: center; padding: 20px 0; }
          .qr img { width: 160px; height: 160px; border-radius: 12px; }
          .qr .id { font-family: monospace; font-size: 12px; letter-spacing: 2px; color: #999; margin-top: 8px; }
          .footer { text-align: center; padding: 16px; font-size: 10px; color: #ccc; border-top: 1px solid #eee; }
          @media print { body { padding: 0; } .ticket { box-shadow: none; } }
        </style>
      </head>
      <body>
        <div class="ticket">
          <div class="header">
            <h1>🎬 OneCinema</h1>
            <h2>${movieTitle}</h2>
          </div>
          <div class="perf"><div class="dot"></div><div class="line"></div><div class="dot"></div></div>
          <div class="body">
            <div class="grid">
              <div class="field"><label>📍 Theatre</label><p>${theatreName}</p></div>
              <div class="field"><label>🖥️ Screen</label><p>${screenName}</p></div>
              <div class="field"><label>📅 Date</label><p>${showDate}</p></div>
              <div class="field"><label>🕐 Time</label><p>${showTime}</p></div>
              <div class="field"><label>🎞️ Format</label><p>${format}</p></div>
              <div class="field"><label>🗣️ Language</label><p>${language}</p></div>
            </div>
            <div class="seats">
              <label>Seats (${seats.length})</label>
              <p>${seatNumbers}</p>
            </div>
            <div class="total">
              <div><label>Total Paid</label></div>
              <p>₹${typeof totalAmount === 'number' ? totalAmount.toFixed(2) : totalAmount}</p>
            </div>
            <div class="qr">
              <img src="${qrUrl}" alt="QR Code" onload="window.print()" onerror="window.print()" />
              <div class="id">${bookingId}</div>
            </div>
          </div>
          <div class="footer">
            OneCinema • Your screen awaits • Non-refundable after showtime
          </div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleShare = async () => {
    const shareData = {
      title: `OneCinema Ticket - ${movieTitle}`,
      text: `🎬 ${movieTitle}\n📅 ${showDate} at ${showTime}\n📍 ${theatreName}\n💺 Seats: ${seatNumbers}\n🎫 Booking: ${bookingId}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (e) {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(shareData.text);
      addToast("Ticket details copied to clipboard!", "success");
    }
  };

  const handleAddToCalendar = () => {
    // Create a Google Calendar event link
    const title = encodeURIComponent(`${movieTitle} - OneCinema`);
    const details = encodeURIComponent(`Theatre: ${theatreName}\nScreen: ${screenName}\nSeats: ${seatNumbers}\nBooking ID: ${bookingId}`);
    const location_str = encodeURIComponent(`${theatreName}, ${theatreCity}`);
    const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location_str}`;
    window.open(calUrl, "_blank");
  };

  return (
    <div className="fixed inset-0 bg-[#080810] text-white z-50 overflow-auto">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {movieBackdropUrl && (
          <img src={movieBackdropUrl} alt="" className="w-full h-full object-cover opacity-[0.03]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[#080810] via-transparent to-[#080810]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-[200px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-[#e11d48]/5 rounded-full blur-[200px]" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-6 py-10">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            className="w-20 h-20 bg-green-500/10 border-2 border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-5"
          >
            <CheckCircle2 size={40} className="text-green-400" />
          </motion.div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Booking Confirmed!</h1>
          <p className="text-white/40 text-sm">Your e-ticket is ready. Show the QR code at the theatre.</p>
        </motion.div>

        {/* ──── PREMIUM TICKET CARD ──── */}
        <motion.div
          ref={ticketRef}
          initial={{ opacity: 0, y: 40, rotateX: 15 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 100, damping: 20 }}
          className="w-full"
        >
          <div className="bg-[#12121a] border border-white/10 rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)] relative">

            {/* Movie Header */}
            <div className="relative h-44 overflow-hidden">
              {movieBackdropUrl ? (
                <img src={movieBackdropUrl} alt={movieTitle} className="w-full h-full object-cover opacity-50" />
              ) : moviePosterUrl ? (
                <img src={moviePosterUrl} alt={movieTitle} className="w-full h-full object-cover opacity-40 blur-sm scale-110" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#e11d48]/20 to-purple-500/20" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#12121a] via-[#12121a]/60 to-transparent" />

              {/* OneCinema Badge */}
              <div className="absolute top-4 left-5 flex items-center gap-2">
                <Film size={14} className="text-[#e11d48]" />
                <span className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em]">OneCinema E-Ticket</span>
              </div>

              {/* Movie Title */}
              <div className="absolute bottom-5 left-5 right-5">
                <div className="flex items-start gap-4">
                  {moviePosterUrl && (
                    <img src={moviePosterUrl} alt={movieTitle} className="w-16 h-24 rounded-lg object-cover shadow-lg border border-white/10 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold leading-tight mb-1">{movieTitle}</h2>
                    <p className="text-white/50 text-xs">
                      {genres.join(" • ")}{genres.length > 0 ? " • " : ""}{format} • {language}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Ticket Perforation */}
            <div className="relative flex items-center justify-between px-0 -my-3 z-10">
              <div className="w-6 h-6 bg-[#080810] rounded-full -ml-3 border-r border-white/10" />
              <div className="flex-1 border-b-[2px] border-dashed border-white/10 mx-2" />
              <div className="w-6 h-6 bg-[#080810] rounded-full -mr-3 border-l border-white/10" />
            </div>

            {/* Booking Details Grid */}
            <div className="p-6 pt-5">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-5">
                <div>
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <MapPin size={10} /> Theatre
                  </p>
                  <p className="font-semibold text-sm leading-tight">{theatreName}</p>
                  {theatreCity && <p className="text-white/30 text-[10px]">{theatreCity}</p>}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Film size={10} /> Screen
                  </p>
                  <p className="font-semibold text-sm">{screenName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Calendar size={10} /> Date
                  </p>
                  <p className="font-semibold text-sm">{showDate}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Clock size={10} /> Time
                  </p>
                  <p className="font-semibold text-sm">{showTime}</p>
                </div>
              </div>

              {/* Seats Section */}
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 mb-4">
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Armchair size={10} /> Seats ({seats.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {seats.map((seat, i) => (
                    <span
                      key={seat.id || i}
                      className="bg-[#e11d48]/10 border border-[#e11d48]/20 text-[#e11d48] px-3 py-1.5 rounded-lg text-xs font-bold"
                    >
                      {seat.seatNumber || `S${seat.id}`}
                    </span>
                  ))}
                </div>
              </div>

              {/* Booking ID + Total */}
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1">Booking ID</p>
                  <button
                    onClick={handleCopyId}
                    className="font-mono font-bold tracking-widest text-sm flex items-center gap-2 hover:text-[#e11d48] transition-colors"
                  >
                    {bookingId}
                    {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} className="text-white/30" />}
                  </button>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1">Total Paid</p>
                  <p className="text-xl font-extrabold bg-gradient-to-r from-[#e11d48] to-[#f43f5e] bg-clip-text text-transparent">
                    ₹{typeof totalAmount === "number" ? totalAmount.toFixed(2) : totalAmount}
                  </p>
                </div>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="px-6 pb-6 flex flex-col items-center">
              <div className="w-1 h-6 bg-white/5 rounded-full mb-4" />
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4">Scan at Theatre</p>
              <div className="bg-white rounded-2xl p-3 shadow-lg">
                <img
                  src={qrUrl}
                  alt="Booking QR Code"
                  className="w-40 h-40 rounded-lg"
                  style={{ imageRendering: "pixelated" }}
                />
              </div>
              <p className="font-mono text-[10px] text-white/20 tracking-[0.3em] mt-3">{bookingId}</p>
            </div>

            {/* Footer */}
            <div className="border-t border-white/5 px-6 py-3 flex items-center justify-center gap-2 text-[10px] text-white/20">
              <Ticket size={10} />
              <span>OneCinema • Your screen awaits • Non-refundable after showtime</span>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 grid grid-cols-3 gap-3"
        >
          <button
            onClick={handleDownloadPdf}
            className="flex flex-col items-center gap-2 px-4 py-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/10 transition-all text-sm group"
          >
            <Download size={20} className="text-white/50 group-hover:text-[#e11d48] transition-colors" />
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Download</span>
          </button>
          <button
            onClick={handleShare}
            className="flex flex-col items-center gap-2 px-4 py-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/10 transition-all text-sm group"
          >
            <Share2 size={20} className="text-white/50 group-hover:text-[#e11d48] transition-colors" />
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Share</span>
          </button>
          <button
            onClick={handleAddToCalendar}
            className="flex flex-col items-center gap-2 px-4 py-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/10 transition-all text-sm group"
          >
            <CalendarPlus size={20} className="text-white/50 group-hover:text-[#e11d48] transition-colors" />
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Calendar</span>
          </button>
        </motion.div>

        {/* Redirect Countdown */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 mb-10 flex flex-col items-center gap-3"
        >
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8">
              <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15" fill="none" stroke="#e11d48" strokeWidth="3"
                  strokeDasharray={`${(countdown / 5) * 94.2} 94.2`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dasharray 1s linear' }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white/60">{countdown}</span>
            </div>
            <p className="text-white/30 text-sm">Redirecting to home in <span className="text-white/60 font-semibold">{countdown}s</span></p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-white/30 hover:text-white transition-colors text-sm"
          >
            <Home size={14} /> Go now
          </button>
        </motion.div>
      </div>
    </div>
  );
}
