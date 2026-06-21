import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "motion/react";
import {
  ChevronRight,
  Menu,
  X,
  Sparkles,
  Search,
  Play,
  ChevronLeft,
  Clock,
  Star,
  MapPin,
  Calendar,
  Bell,
  Heart,
  Film,
  Ticket,
  TrendingUp,
  ChevronDown,
  ArrowUp
} from "lucide-react";

import TrendingSection from "../components/home/TrendingSection";
import NowPlayingSection from "../components/home/NowPlayingSection";
import UpcomingSection from "../components/home/UpcomingSection";
import TopRatedSection from "../components/home/TopRatedSection";

import NearbyTheatres from "../components/home/NearbyTheatres";
import GenreGrid from "../components/home/GenreGrid";
import SearchPanel from "../components/ui/SearchPanel";
import MovieDetailModal from "../components/movie/MovieDetailModal";

// ── primitives ──────────────────────────────────────────────────────────────

function LogoMark({ className = "w-8 h-8" }) {
  return (
    <svg viewBox="0 0 256 256" className={className} fill="white">
      <path d="M128 0C128 0 160 60 200 100C240 140 256 128 256 128C256 128 240 160 200 200C160 240 128 256 128 256C128 256 96 240 56 200C16 160 0 128 0 128C0 128 16 96 56 56C96 16 128 0 128 0Z" />
      <circle cx="128" cy="128" r="40" fill="#0a0a0f" />
      <circle cx="128" cy="128" r="16" fill="white" />
    </svg>
  );
}

function SectionEyebrow({ label, tag }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-1.5 h-1.5 rounded-full bg-white" />
      <span className="text-xs uppercase tracking-widest text-white/60 font-medium">
        {label}
      </span>
      {tag && (
        <span className="px-2 py-0.5 rounded-full border border-white/10 text-white/50 text-xs">
          {tag}
        </span>
      )}
    </div>
  );
}

function PrimaryButton({ label = "Book Now", full = false, icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`group inline-flex items-center justify-center gap-2 rounded-full bg-white text-black font-medium text-sm px-5 py-3 transition-all hover:bg-white/90 active:scale-[0.98] ${full ? "w-full" : ""}`}
    >
      <span className="w-2 h-2 rounded-full bg-[#e11d48]" />
      {label}
      {icon || (
        <ChevronRight
          size={14}
          className="transition-transform group-hover:translate-x-[1px]"
        />
      )}
    </button>
  );
}

function StarRating({ rating, size = 10 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          className={
            s <= Math.floor(rating)
              ? "fill-[#facc15] text-[#facc15]"
              : s - 0.5 <= rating
                ? "fill-[#facc15]/50 text-[#facc15]"
                : "text-white/20"
          }
        />
      ))}
    </div>
  );
}

const gradientStyle = {
  backgroundImage:
    "linear-gradient(to right, #1a0511 0%, #7f1d1d 12.5%, #fca5a5 32.5%, #e11d48 50%, #7f1d1d 67.5%, #1a0511 87.5%, #1a0511 100%)",
  backgroundSize: "200% auto",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  WebkitTextFillColor: "transparent",
  filter: "url(#cine-noise)",
};

// ── Movie Data ──────────────────────────────────────────────────────────────

const trendingMovies = [
  { title: "Dune: Messiah", genre: "Sci-Fi", rating: 4.8, year: "2026", duration: "2h 48m", color: "#c4b5fd" },
  { title: "The Batman II", genre: "Action", rating: 4.6, year: "2026", duration: "2h 55m", color: "#e11d48" },
  { title: "Interstellar 2", genre: "Sci-Fi", rating: 4.9, year: "2026", duration: "3h 10m", color: "#60a5fa" },
  { title: "Deadpool 4", genre: "Comedy", rating: 4.3, year: "2026", duration: "2h 12m", color: "#f43f5e" },
  { title: "Avatar: Fire", genre: "Fantasy", rating: 4.5, year: "2026", duration: "3h 05m", color: "#34d399" },
  { title: "Oppenheimer II", genre: "Drama", rating: 4.7, year: "2026", duration: "2h 50m", color: "#fb923c" },
];

const nowShowingMovies = [
  { title: "Midnight Protocol", genre: "Thriller", rating: 4.4, time: "1:30 PM, 4:45 PM, 8:00 PM", price: "₹249", seats: 42 },
  { title: "Echoes of Mars", genre: "Sci-Fi", rating: 4.6, time: "2:00 PM, 5:30 PM, 9:15 PM", price: "₹299", seats: 18 },
  { title: "The Last Laugh", genre: "Comedy", rating: 4.1, time: "12:00 PM, 3:30 PM, 7:00 PM", price: "₹199", seats: 65 },
  { title: "Shadow Empire", genre: "Action", rating: 4.5, time: "1:00 PM, 4:00 PM, 7:30 PM, 10:45 PM", price: "₹349", seats: 8 },
  { title: "Whispers Below", genre: "Horror", rating: 4.2, time: "3:00 PM, 6:30 PM, 10:00 PM", price: "₹199", seats: 31 },
  { title: "Pixel Dreams", genre: "Animation", rating: 4.7, time: "11:00 AM, 2:15 PM, 5:00 PM", price: "₹179", seats: 54 },
];

const upcomingMovies = [
  { title: "Quantum Rift", genre: "Sci-Fi", date: "Jul 18, 2026", director: "Denis Villeneuve" },
  { title: "Crimson Horizon", genre: "Action", date: "Aug 2, 2026", director: "Christopher Nolan" },
  { title: "Laugh Factory", genre: "Comedy", date: "Aug 15, 2026", director: "Greta Gerwig" },
  { title: "Neural Link", genre: "Thriller", date: "Sep 5, 2026", director: "David Fincher" },
];

// ── Navbar ──────────────────────────────────────────────────────────────────

function Navbar({ onSearchClick }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const links = ["Movies", "Theatres", "Upcoming", "Categories", "Support"];
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleBookClick = () => {
    if (!user) {
      window.location.href = "/login";
    } else {
      window.location.href = "/movies";
    }
  };

  // Add glass effect when scrolled
  useState(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  });

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 inset-x-0 z-50 flex items-center justify-center"
        style={{
          background: scrolled
            ? "rgba(10,10,15,0.7)"
            : "transparent",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(16px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
          transition: "background 0.4s ease, backdrop-filter 0.4s ease, border 0.4s ease",
        }}
      >
        <div className="flex items-center justify-between px-6 py-5 max-w-6xl w-full">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <LogoMark className="w-7 h-7" />
            <span className="text-sm font-semibold tracking-tight">CinePass</span>
          </div>

          {/* Center links */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((l, i) => (
              <motion.a
                key={l}
                href="#"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05, duration: 0.5 }}
                className="text-white/70 text-sm font-medium hover:text-white transition-colors"
              >
                {l}
              </motion.a>
            ))}
          </div>

          {/* Right */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={onSearchClick}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Search size={16} />
            </button>
            <PrimaryButton label="Book Tickets" onClick={handleBookClick} />
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center gap-3">
            <button onClick={onSearchClick} className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/70">
              <Search size={16} />
            </button>
            <button
              onClick={() => setOpen(!open)}
              className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/70"
            >
              {open ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden fixed inset-x-0 top-[72px] z-40 bg-black/95 backdrop-blur-lg border-b border-white/10 px-6 py-4 flex flex-col gap-3">
          {links.map((l) => (
            <a
              key={l}
              href="#"
              className="text-sm text-white/70 py-2 border-b border-white/5"
            >
              {l}
            </a>
          ))}
          <div className="pt-2">
            <PrimaryButton label="Book Tickets" full onClick={handleBookClick} />
          </div>
        </div>
      )}
    </>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const trendingTags = ["Dune: Messiah", "The Batman II", "Interstellar 2", "Deadpool 4", "Avatar: Fire"];

  const handleSearch = (e) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <section className="pt-[72px] text-center flex flex-col items-center relative z-10 px-6 overflow-hidden" style={{ minHeight: "100vh" }}>
      {/* Background video — hero only */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          src="/hero-bg.mp4"
        />
        {/* Dark overlay for text legibility */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(10,10,15,0.35) 0%, rgba(10,10,15,0.55) 40%, rgba(10,10,15,0.88) 80%, #0a0a0f 100%)",
          }}
        />
      </div>

      {/* Hero content — above video */}
      <div className="relative z-10 flex flex-col items-center w-full">
      {/* Eyebrow badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="mb-6 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-xs text-white/60 font-medium tracking-wide"
      >
        🎬 Summer Blockbuster Season — Now Live
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="text-5xl md:text-8xl font-semibold tracking-tight leading-[0.9]"
      >
        <span className="block text-white">Your screen.</span>
        <span className="block animate-shiny" style={gradientStyle}>
          Awaits.
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.7 }}
        className="mt-8 text-white/60 max-w-md text-base leading-[1.6]"
      >
        Discover, explore, and book tickets to the latest movies in seconds.
        Premium seats, real-time availability, and instant confirmations.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="mt-8 w-full max-w-lg"
      >
        <form onSubmit={handleSearch} className="liquid-glass rounded-full px-5 py-3 flex items-center gap-3">
          <Search size={16} className="text-white/40 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search movies, theatres, or genres..."
            className="bg-transparent border-none outline-none text-sm text-white placeholder:text-white/30 flex-1"
          />
          <button type="submit" className="rounded-full bg-[#e11d48] text-white text-xs font-medium px-4 py-1.5 hover:bg-[#be123c] transition-colors">
            Search
          </button>
        </form>
      </motion.div>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="mt-6 flex flex-col items-center gap-3"
      >
        <div className="flex flex-wrap justify-center gap-3">
          <PrimaryButton label="Browse Movies" onClick={() => navigate("/movies")} />
          <button onClick={() => navigate("/movies")} className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/15 text-white font-medium text-sm px-5 py-3 hover:bg-white/5 transition-all">
            <Play size={14} className="text-[#e11d48]" />
            Watch Trailers
          </button>
        </div>
        <span className="text-xs text-white/40">
          Instant booking · Seat selection · E-tickets
        </span>
      </motion.div>

      {/* Trending tags */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.85, duration: 0.6 }}
        className="mt-8 flex flex-wrap justify-center gap-2"
      >
        <span className="text-xs text-white/30 flex items-center gap-1 mr-1">
          <TrendingUp size={12} /> Trending:
        </span>
        {trendingTags.map((tag) => (
          <span
            key={tag}
            onClick={() => navigate(`/search?q=${encodeURIComponent(tag)}`)}
            className="text-xs text-white/60 px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] cursor-pointer transition-colors"
          >
            {tag}
          </span>
        ))}
      </motion.div>

      {/* Stats strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.8 }}
        className="mt-16 flex flex-wrap justify-center gap-8 md:gap-16 text-center"
      >
        {[
          { val: "10M+", label: "Tickets booked" },
          { val: "5,000+", label: "Screens nationwide" },
          { val: "98%", label: "User satisfaction" },
        ].map(({ val, label }) => (
          <div key={label}>
            <div className="text-2xl md:text-3xl font-semibold text-white">
              {val}
            </div>
            <div className="text-xs text-white/40 mt-1">{label}</div>
          </div>
        ))}
      </motion.div>
      </div>
    </section>
  );
}

// ── Trending Movies Carousel ────────────────────────────────────────────────

function TrendingMovies() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16 md:py-24 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="mb-8"
      >
        <SectionEyebrow label="Trending Now" tag="Hot 🔥" />
        <h2 className="mt-5 text-3xl md:text-5xl font-semibold tracking-tight leading-[1.02]">
          Everyone's watching.
        </h2>
      </motion.div>

      <div className="flex gap-5 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory">
        {trendingMovies.map((movie, i) => (
          <motion.div
            key={movie.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex-shrink-0 w-[200px] snap-center group cursor-pointer"
          >
            <div
              className="relative rounded-2xl overflow-hidden aspect-[2/3]"
              style={{
                border: `1px solid ${movie.color}22`,
                boxShadow: `0 8px 32px rgba(0,0,0,0.55), 0 0 0 0 ${movie.color}00`,
                transition: "box-shadow 0.4s ease, border-color 0.3s ease",
              }}
            >
              {/* Rich poster gradient */}
              <div
                className="absolute inset-0 transition-transform duration-500 group-hover:scale-108"
                style={{
                  background: `
                    radial-gradient(ellipse 80% 60% at 50% 30%, ${movie.color}55, transparent 65%),
                    linear-gradient(160deg, ${movie.color}30 0%, #0d0d18 55%, ${movie.color}18 100%)
                  `,
                }}
              />
              {/* Film grain texture */}
              <div className="absolute inset-0 opacity-30 mix-blend-overlay" style={{ backgroundImage: "url(data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E)", backgroundSize: "160px" }} />
              {/* Center icon */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: `${movie.color}20`, border: `1px solid ${movie.color}35` }}>
                  <Film size={28} style={{ color: movie.color }} className="opacity-90" />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: `${movie.color}cc` }}>{movie.genre}</span>
              </div>
              {/* Bottom gradient fade */}
              <div className="absolute bottom-0 left-0 right-0 h-24"
                style={{ background: `linear-gradient(to top, #0d0d18 0%, ${movie.color}10 60%, transparent 100%)` }}
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.45)" }}
              >
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/40">
                  <Play size={20} className="text-white ml-0.5" />
                </div>
              </div>
              {/* Rating badge */}
              <div className="absolute top-3 right-3 px-2 py-1 rounded-full flex items-center gap-1"
                style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.12)" }}
              >
                <Star size={9} className="fill-[#facc15] text-[#facc15]" />
                <span className="text-[10px] text-white font-semibold">{movie.rating}</span>
              </div>
              {/* Year badge */}
              <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[9px] font-medium"
                style={{ background: `${movie.color}25`, color: movie.color, border: `1px solid ${movie.color}40` }}
              >
                {movie.year}
              </div>
            </div>

            <div className="mt-3 px-0.5">
              <div className="text-sm font-semibold text-white group-hover:text-[#e11d48] transition-colors truncate">
                {movie.title}
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-white/40">
                <span>{movie.genre}</span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span>{movie.duration}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ── Now Showing ─────────────────────────────────────────────────────────────

function NowShowing() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16 md:py-24 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="flex items-end justify-between mb-8"
      >
        <div>
          <SectionEyebrow label="Now Showing" tag="In theatres" />
          <h2 className="mt-5 text-3xl md:text-5xl font-semibold tracking-tight leading-[1.02]">
            On the big screen.
          </h2>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {nowShowingMovies.map((movie, i) => (
          <motion.div
            key={movie.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.6 }}
            className="ns-card group"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-sm font-medium text-white group-hover:text-[#e11d48] transition-colors">
                  {movie.title}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-white/50 px-2 py-0.5 rounded-full border border-white/10">
                    {movie.genre}
                  </span>
                  <StarRating rating={movie.rating} />
                </div>
              </div>
              <span className="text-sm font-semibold text-[#e11d48]">
                {movie.price}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-white/40 mb-3">
              <Clock size={11} />
              <span>{movie.time}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                movie.seats <= 10
                  ? "bg-[#e11d48]/15 text-[#e11d48] border border-[#e11d48]/30"
                  : movie.seats <= 30
                    ? "bg-[#fb923c]/15 text-[#fb923c] border border-[#fb923c]/30"
                    : "bg-[#34d399]/15 text-[#34d399] border border-[#34d399]/30"
              }`}>
                {movie.seats <= 10 ? "Almost Full" : movie.seats <= 30 ? "Filling Fast" : `${movie.seats} seats left`}
              </span>
              <button className="text-xs font-medium text-black bg-white rounded-full px-3 py-1.5 hover:bg-white/90 transition-colors flex items-center gap-1 active:scale-[0.97]">
                <Ticket size={11} />
                Book Now
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ── Upcoming Movies ─────────────────────────────────────────────────────────

function UpcomingMovies() {
  const [reminders, setReminders] = useState({});

  const toggleReminder = (title) => {
    setReminders((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <section className="max-w-6xl mx-auto px-6 py-16 md:py-24 relative z-10">
      <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-start">
        {/* Left */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <SectionEyebrow label="Coming Soon" tag="Pre-book" />
          <h2 className="mt-5 text-3xl md:text-5xl font-semibold tracking-tight leading-[1.02]">
            Don't miss <br /> what's next.
          </h2>
          <p className="mt-6 text-white/60 text-base leading-[1.6] max-w-md">
            Set reminders for upcoming releases and be the first to grab tickets
            the moment bookings open. Never miss a premiere again.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {["Pre-booking", "Release alerts", "First-day shows", "Midnight premieres"].map((c) => (
              <span
                key={c}
                className="text-xs text-white/70 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03]"
              >
                {c}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Right card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="liquid-glass rounded-2xl p-5"
        >
          <div className="text-xs text-white/40 mb-4">
            Upcoming · {upcomingMovies.length} movies
          </div>
          <div className="space-y-3">
            {upcomingMovies.map(({ title, genre, date, director }) => (
              <div key={title} className="liquid-glass rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{
                        background:
                          genre === "Sci-Fi" ? "#60a5fa"
                          : genre === "Action" ? "#e11d48"
                          : genre === "Comedy" ? "#facc15"
                          : "#c4b5fd",
                      }}
                    />
                    <span className="text-xs font-medium text-white/80">
                      {title}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleReminder(title)}
                    className={`text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 transition-all ${
                      reminders[title]
                        ? "bg-[#e11d48]/15 text-[#e11d48] border border-[#e11d48]/30"
                        : "bg-white/5 text-white/40 border border-white/10 hover:text-white/60"
                    }`}
                  >
                    <Bell size={9} />
                    {reminders[title] ? "Reminded" : "Remind me"}
                  </button>
                </div>
                <div className="space-y-0.5">
                  <div className="text-[11px] text-white/40 flex items-center gap-1">
                    <Calendar size={9} /> {date}
                  </div>
                  <div className="text-[11px] text-white/40">
                    Dir. {director} · {genre}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ── Movie Categories ────────────────────────────────────────────────────────

function MovieCategories() {
  const categories = [
    { name: "Action", emoji: "💥", count: 142, color: "#e11d48" },
    { name: "Sci-Fi", emoji: "🚀", count: 89, color: "#60a5fa" },
    { name: "Thriller", emoji: "🔪", count: 96, color: "#a78bfa" },
    { name: "Comedy", emoji: "😂", count: 124, color: "#facc15" },
    { name: "Horror", emoji: "👻", count: 67, color: "#34d399" },
    { name: "Animation", emoji: "🎨", count: 53, color: "#fb923c" },
  ];

  return (
    <section className="max-w-6xl mx-auto px-6 py-16 md:py-20 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="text-center mb-10"
      >
        <SectionEyebrow label="Browse by Genre" />
        <h2 className="mt-5 text-3xl md:text-5xl font-semibold tracking-tight leading-[1.02]">
          Find your mood.
        </h2>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map(({ name, emoji, count, color }, i) => (
          <motion.div
            key={name}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, duration: 0.5 }}
            className="cat-card group"
            style={{ "--cat-color": color }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = color + "55"; e.currentTarget.style.boxShadow = `0 16px 48px ${color}20, 0 4px 16px rgba(0,0,0,0.4)`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = ""; e.currentTarget.style.boxShadow = ""; }}
          >
            <div className="text-3xl mb-3" style={{ filter: `drop-shadow(0 0 10px ${color}88)` }}>{emoji}</div>
            <div className="text-sm font-medium text-white group-hover:text-white transition-colors">
              {name}
            </div>
            <div className="text-[10px] text-white/30 mt-1">{count} movies</div>
            <div
              className="w-full h-0.5 rounded-full mt-3 opacity-0 group-hover:opacity-100 transition-all duration-300"
              style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ── Featured Theatres ───────────────────────────────────────────────────────

function FeaturedTheatres() {
  const theatres = [
    { name: "IMAX Cityplex", location: "Connaught Place, Delhi", distance: "2.3 km", rating: 4.8, screens: 8, features: ["IMAX", "Dolby Atmos", "4DX"] },
    { name: "PVR Luxe", location: "Bandra West, Mumbai", distance: "4.1 km", rating: 4.7, screens: 12, features: ["Recliner", "Dolby", "P[XL]"] },
    { name: "Cinepolis VIP", location: "Whitefield, Bangalore", distance: "1.8 km", rating: 4.6, screens: 6, features: ["VIP Lounge", "4K Laser", "Atmos"] },
  ];

  return (
    <section className="max-w-6xl mx-auto px-6 py-16 md:py-24 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="mb-8"
      >
        <SectionEyebrow label="Featured Theatres" tag="Near you" />
        <h2 className="mt-5 text-3xl md:text-5xl font-semibold tracking-tight leading-[1.02]">
          Premium experiences.
        </h2>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        {theatres.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.6 }}
            className="theatre-card group"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-sm font-semibold text-white group-hover:text-[#e11d48] transition-colors">
                  {t.name}
                </div>
                <div className="flex items-center gap-1 text-xs text-white/40 mt-1">
                  <MapPin size={10} />
                  {t.location}
                </div>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#facc15]/10 border border-[#facc15]/20">
                <Star size={10} className="fill-[#facc15] text-[#facc15]" />
                <span className="text-[10px] text-[#facc15] font-medium">{t.rating}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-white/50 mb-4">
              <span className="flex items-center gap-1">
                <MapPin size={10} /> {t.distance}
              </span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span>{t.screens} screens</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {t.features.map((f) => (
                <span
                  key={f}
                  className="text-[10px] text-white/60 px-2 py-0.5 rounded-full border border-white/10 bg-white/[0.03]"
                >
                  {f}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ── Popular Cities ──────────────────────────────────────────────────────────

function PopularCities() {
  const cities = [
    { name: "Mumbai", theatres: 145, emoji: "🏙️" },
    { name: "Delhi", theatres: 132, emoji: "🕌" },
    { name: "Bangalore", theatres: 98, emoji: "💻" },
    { name: "Hyderabad", theatres: 87, emoji: "🏰" },
    { name: "Chennai", theatres: 76, emoji: "🛕" },
    { name: "Kolkata", theatres: 64, emoji: "🌉" },
    { name: "Pune", theatres: 58, emoji: "🏔️" },
    { name: "Ahmedabad", theatres: 52, emoji: "🕊️" },
  ];

  return (
    <section className="max-w-6xl mx-auto px-6 py-16 md:py-20 relative z-10">
      <div className="text-center">
        <p className="text-xs uppercase tracking-widest text-white/40">
          Available in 50+ cities across India
        </p>
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {cities.map((city, i) => (
            <motion.div
              key={city.name}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="liquid-glass rounded-xl p-3 text-center cursor-pointer group hover:border-white/20 transition-all"
            >
              <div className="text-lg mb-1">{city.emoji}</div>
              <div className="text-sm font-semibold tracking-tight text-white/70 group-hover:text-white transition-colors">
                {city.name}
              </div>
              <div className="text-[10px] text-white/30 mt-0.5">{city.theatres} theatres</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Personalized Recommendations ────────────────────────────────────────────

function Recommendations() {
  const continueWatching = [
    { title: "Dune: Part One", progress: 72, genre: "Sci-Fi" },
    { title: "The Dark Knight", progress: 45, genre: "Action" },
    { title: "Inception", progress: 88, genre: "Thriller" },
  ];

  const recommended = [
    { title: "Blade Runner 2099", genre: "Sci-Fi", match: "97%", rating: 4.8 },
    { title: "The Prestige", genre: "Thriller", match: "94%", rating: 4.7 },
    { title: "Mad Max: Wasteland", genre: "Action", match: "91%", rating: 4.5 },
    { title: "WALL-E 2", genre: "Animation", match: "89%", rating: 4.6 },
  ];

  return (
    <section className="max-w-6xl mx-auto px-6 py-16 md:py-24 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#0a0a0f]/90 backdrop-blur-2xl"
      >
        {/* Title bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.08] bg-black/30">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <span className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <span className="text-xs text-white/40 absolute left-1/2 -translate-x-1/2">
            CinePass — For You
          </span>
          <div className="flex items-center gap-2 text-white/40">
            <Sparkles size={12} />
            <span className="text-xs">Personalized</span>
          </div>
        </div>

        {/* Body */}
        <div className="grid grid-cols-12 min-h-[420px]">
          {/* Sidebar - Continue watching */}
          <div className="col-span-12 md:col-span-4 border-r border-white/[0.08] bg-black/30 p-4">
            <div className="text-[10px] uppercase tracking-widest text-white/30 mb-3">
              Continue where you left off
            </div>
            <div className="space-y-2">
              {continueWatching.map((m) => (
                <div
                  key={m.title}
                  className="flex items-start gap-3 px-3 py-3 rounded-lg bg-white/[0.02] border border-white/[0.06] cursor-pointer hover:bg-white/[0.04] transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#e11d48]/30 to-[#0a0a0f] flex items-center justify-center flex-shrink-0">
                    <Play size={14} className="text-white/60 ml-0.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-white truncate">{m.title}</div>
                    <div className="text-[10px] text-white/40">{m.genre}</div>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <div className="flex-1 h-0.5 rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-[#e11d48]"
                          style={{ width: `${m.progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-white/30">{m.progress}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended */}
          <div className="col-span-12 md:col-span-8 p-4">
            <div className="flex items-center gap-1.5 mb-4">
              <Sparkles size={12} style={{ color: "#e11d48" }} />
              <span className="text-xs font-medium text-[#e11d48]">
                Recommended for you
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recommended.map((m) => (
                <div
                  key={m.title}
                  className="rounded-lg bg-white/[0.03] border border-white/[0.08] p-3 hover:bg-white/[0.05] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-white group-hover:text-[#e11d48] transition-colors">
                      {m.title}
                    </span>
                    <span className="text-[10px] text-[#34d399] font-medium">{m.match} match</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-white/40 px-1.5 py-0.5 rounded border border-white/10">
                        {m.genre}
                      </span>
                      <StarRating rating={m.rating} size={9} />
                    </div>
                    <button className="text-[10px] text-white/50 hover:text-white flex items-center gap-0.5 transition-colors">
                      <Ticket size={10} /> Book
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Mini chart - Viewing History */}
            <div className="mt-6 px-1">
              <div className="text-[10px] uppercase tracking-widest text-white/30 mb-2">
                Your viewing activity
              </div>
              <div className="flex items-end gap-0.5 h-12">
                {[40, 60, 30, 90, 80, 95, 70, 85, 97, 88, 60, 75].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm"
                    style={{
                      height: `${h}%`,
                      background:
                        i === 8
                          ? "#e11d48"
                          : `rgba(225,29,72,${0.15 + h * 0.003})`,
                    }}
                  />
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-white/20 mt-1">
                <span>Jan</span>
                <span>Now</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

// ── Testimonials ─────────────────────────────────────────────────────────────

function Testimonials() {
  const reviews = [
    {
      text: "CinePass made booking so effortless. I got IMAX seats for Dune in under 30 seconds. The seat selection view is incredible — you can see exactly what your view will look like.",
      name: "Arjun Mehta",
      role: "Movie Enthusiast",
      rating: 5,
      company: "MUMBAI",
    },
    {
      text: "I book tickets every weekend and CinePass is the only app that shows real-time seat availability. No more arriving at the theatre to find out the show is sold out.",
      name: "Priya Sharma",
      role: "Film Critic",
      rating: 5,
      company: "DELHI",
    },
    {
      text: "The recommendations are spot on. CinePass suggested Midnight Protocol based on my watchlist, and it became my favorite film this year. The personalization is unreal.",
      name: "Rahul Verma",
      role: "Filmmaker",
      rating: 4,
      company: "BANGALORE",
    },
  ];

  return (
    <section className="max-w-6xl mx-auto px-6 py-20 md:py-28 border-t border-white/10 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="text-center mb-10"
      >
        <SectionEyebrow label="Community" tag="Reviews" />
        <h2 className="mt-5 text-3xl md:text-4xl font-semibold tracking-tight">
          What movie lovers say.
        </h2>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        {reviews.map(({ text, name, role, rating, company }, i) => (
          <motion.figure
            key={i}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.6 }}
            className="liquid-glass rounded-2xl p-6"
          >
            <div className="mb-3">
              <StarRating rating={rating} size={12} />
            </div>
            <blockquote className="text-sm text-white/80 leading-[1.6]">
              "{text}"
            </blockquote>
            <figcaption className="mt-6 pt-5 border-t border-white/10">
              <div className="text-sm font-semibold text-white">{name}</div>
              <div className="text-xs text-white/50 mt-0.5">{role}</div>
              <div className="text-xs text-white font-semibold tracking-wide mt-1">
                {company}
              </div>
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}

// ── FAQ Section ──────────────────────────────────────────────────────────────

function FAQ() {
  const [openFaq, setOpenFaq] = useState(null);
  const faqs = [
    {
      q: "How do I book tickets?",
      a: "Simply search for your movie, select your preferred showtime and theatre, choose your seats from our interactive seat map, and complete payment. Your e-ticket will be delivered instantly to your email and app.",
    },
    {
      q: "Can I cancel my booking?",
      a: "Yes! You can cancel up to 2 hours before the show starts for a full refund. Cancellations within 2 hours receive a 75% refund as CinePass credit. Premium screenings have a 4-hour cancellation window.",
    },
    {
      q: "How do refunds work?",
      a: "Refunds are processed within 3-5 business days to your original payment method. For wallet payments, refunds are instant. You can also opt for CinePass credits which are applied immediately and include a 10% bonus.",
    },
    {
      q: "How does seat selection work?",
      a: "Our interactive seat map shows real-time availability with color-coded pricing tiers. You can see the screen view from any seat, check legroom ratings, and even see which seats are best for couples or groups. Premium seats include recliner, lounge, and box options.",
    },
  ];

  return (
    <section className="max-w-3xl mx-auto px-6 py-16 md:py-24 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="text-center mb-10"
      >
        <SectionEyebrow label="Support" tag="FAQ" />
        <h2 className="mt-5 text-3xl md:text-4xl font-semibold tracking-tight">
          Questions? Answered.
        </h2>
      </motion.div>

      <div className="space-y-3">
        {faqs.map(({ q, a }, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
            className="liquid-glass rounded-xl overflow-hidden"
          >
            <button
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left group"
            >
              <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">
                {q}
              </span>
              <ChevronDown
                size={16}
                className={`text-white/40 transition-transform duration-300 flex-shrink-0 ml-4 ${
                  openFaq === i ? "rotate-180" : ""
                }`}
              />
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                openFaq === i ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="px-5 pb-4 text-sm text-white/50 leading-[1.7]">
                {a}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ── Final CTA ────────────────────────────────────────────────────────────────

function FinalCTA() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20 md:py-32 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="liquid-glass relative overflow-hidden rounded-3xl px-8 py-16 md:py-24 text-center"
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(600px circle at 50% 0%, rgba(225,29,72,0.15), transparent 70%)",
            opacity: 0.4,
          }}
        />
        <h2 className="relative text-4xl md:text-6xl font-semibold tracking-tight leading-[1.02]">
          Lights. Camera. <br /> Book.
        </h2>
        <p className="relative mt-6 text-white/60 max-w-md mx-auto text-sm leading-[1.6]">
          Join millions of movie lovers who've made CinePass their go-to
          booking platform. Your next cinematic experience is just a tap away.
        </p>
        <div className="relative mt-10 flex flex-wrap justify-center gap-4">
          <PrimaryButton label="Start Booking" />
          <button className="rounded-full border border-white/15 text-white text-sm font-medium px-5 py-3 hover:bg-white/5 transition-colors flex items-center gap-2">
            Explore Movies
            <ChevronRight size={14} />
          </button>
        </div>
        <div className="relative mt-6 flex justify-center gap-6 text-xs text-white/30">
          <span className="flex items-center gap-1">
            <Ticket size={12} /> Instant e-tickets
          </span>
          <span className="flex items-center gap-1">
            <Heart size={12} /> 10M+ happy users
          </span>
          <span className="flex items-center gap-1">
            <MapPin size={12} /> 50+ cities
          </span>
        </div>
      </motion.div>
    </section>
  );
}

// ── Flip Cards Section ───────────────────────────────────────────────────────
//   One cinematic image splits into 3 cards that flip on scroll (Y-axis).
//   The section is "pinned" (sticky) while scroll drives the animation,
//   exactly like the ScrollTrigger triptych effect in the reference video.

const FLIP_CARDS = [
  {
    id: 0,
    label: "ACT I",
    title: "The World",
    subtitle: "Discover",
    desc: "10M+ tickets booked across 5,000+ screens nationwide. Your next cinematic adventure starts here.",
    accent: "#e11d48",
    // front: left-third clip of the video background
    frontBg: "linear-gradient(135deg, #1a0010 0%, #4a0020 40%, #8b0030 70%, #c41040 100%)",
    backBg: "linear-gradient(160deg, #0a0a0f 0%, #1a0018 60%, #2d0028 100%)",
    icon: "🎬",
  },
  {
    id: 1,
    label: "ACT II",
    title: "The Seat",
    subtitle: "Experience",
    desc: "Real-time seat selection. IMAX, Dolby Atmos, 4DX. Pick your perfect spot before anyone else.",
    accent: "#facc15",
    frontBg: "linear-gradient(135deg, #0d0800 0%, #3d2500 40%, #7a4a00 70%, #c47a00 100%)",
    backBg: "linear-gradient(160deg, #0a0a0f 0%, #1a1200 60%, #2d2000 100%)",
    icon: "🎫",
  },
  {
    id: 2,
    label: "ACT III",
    title: "The Moment",
    subtitle: "Remember",
    desc: "Instant e-tickets. Zero queues. Walk in and take your seat. Cinema, reimagined for you.",
    accent: "#60a5fa",
    frontBg: "linear-gradient(135deg, #000d1a 0%, #001a3d 40%, #00307a 70%, #0050c4 100%)",
    backBg: "linear-gradient(160deg, #0a0a0f 0%, #00101a 60%, #00182d 100%)",
    icon: "✨",
  },
];

function FlipCard({ card, progress, index }) {
  // ── Each card owns its slice of [0,1]: card0→[0,0.33], card1→[0.33,0.66], card2→[0.66,1]
  const start = index / 3;
  const end   = (index + 1) / 3;
  const mid   = (start + end) / 2;

  // Use progress (parent scrollYProgress) directly — no per-child spring.
  // The parent passes a spring-smoothed value so we don't double-spring.
  const rotateY     = useTransform(progress, [start, end],  [0, 180]);
  const backRotateY = useTransform(progress, [start, end],  [180, 360]);
  const frontOpacity = useTransform(progress, [start, mid - 0.02, mid + 0.02, end], [1, 1, 0, 0]);
  const backOpacity  = useTransform(progress, [start, mid - 0.02, mid + 0.02, end], [0, 0, 1, 1]);
  const scale        = useTransform(progress, [start, mid, end], [1, 1.05, 1]);

  return (
    <motion.div className="flip-card-root" style={{ scale, perspective: 1200 }}>
      {/* FRONT */}
      <motion.div
        className="flip-card-face flip-card-front"
        style={{ rotateY, opacity: frontOpacity, background: card.frontBg }}
      >
        <div className="flip-card-grain" />
        <div className="flip-card-lines" />
        <div className="flip-card-front-content">
          <span className="flip-card-act" style={{ color: card.accent }}>{card.label}</span>
          <span className="flip-card-front-icon">{card.icon}</span>
        </div>
        <div className="flip-card-bottom-glow" style={{ background: `linear-gradient(to top, ${card.accent}22, transparent)` }} />
      </motion.div>

      {/* BACK — backRotateY hoisted to component top, no hook-in-JSX */}
      <motion.div
        className="flip-card-face flip-card-back"
        style={{
          rotateY: backRotateY,
          opacity: backOpacity,
          background: card.backBg,
          borderColor: card.accent + "44",
        }}
      >
        <div className="flip-card-grain" />
        <div className="flip-card-back-content">
          <div className="flip-card-back-label" style={{ color: card.accent }}>{card.label}</div>
          <div className="flip-card-back-title">{card.title}</div>
          <div className="flip-card-back-sub" style={{ color: card.accent }}>{card.subtitle}</div>
          <p className="flip-card-back-desc">{card.desc}</p>
          <div className="flip-card-back-icon">{card.icon}</div>
        </div>
        <div className="flip-card-bottom-glow" style={{ background: `linear-gradient(to top, ${card.accent}18, transparent)` }} />
      </motion.div>
    </motion.div>
  );
}

function FlipCardsSection() {
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Spring-smooth ONCE here — children use this directly, no double-spring
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 55,
    damping: 25,
    restDelta: 0.0005,
  });

  const titleOpacity = useTransform(smoothProgress, [0, 0.06, 0.88, 1], [0, 1, 1, 0.5]);
  const titleY       = useTransform(smoothProgress, [0, 0.06], [20, 0]);
  const hintOpacity  = useTransform(scrollYProgress, [0, 0.04], [1, 0]);

  return (
    <section
      ref={sectionRef}
      className="flip-section-outer relative z-10"
      style={{ height: "250vh" }}
    >
      <div className="flip-section-sticky">
        {/* Heading */}
        <motion.div
          className="flip-section-heading"
          style={{ opacity: titleOpacity, y: titleY }}
        >
          <div className="flip-section-eyebrow">
            <span className="flip-eyebrow-dot" />
            Scroll to reveal
          </div>
          <h2 className="flip-section-title">
            Cinema in<br />
            <span style={{
              backgroundImage: "linear-gradient(90deg, #e11d48, #facc15, #60a5fa)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              WebkitTextFillColor: "transparent",
            }}>three acts.</span>
          </h2>
        </motion.div>

        {/* Cards — pass smoothProgress so all 3 share one spring */}
        <div className="flip-cards-row">
          {FLIP_CARDS.map((card, i) => (
            <FlipCard
              key={card.id}
              card={card}
              progress={smoothProgress}
              index={i}
            />
          ))}
        </div>

        {/* Progress bar */}
        <motion.div className="flip-progress-bar">
          <motion.div
            className="flip-progress-fill"
            style={{ scaleX: scrollYProgress, transformOrigin: "left" }}
          />
        </motion.div>

        {/* Scroll hint — opacity computed at top level, not inside JSX */}
        <motion.p className="flip-scroll-hint" style={{ opacity: hintOpacity }}>
          ↓ Scroll to flip
        </motion.p>
      </div>
    </section>
  );
}

// ── Root ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 800);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body {
          font-family: 'Inter', system-ui, sans-serif;
          -webkit-font-smoothing: antialiased;
          background: #080810;
          color: white;
        }
        ::selection { background: rgba(225,29,72,0.35); }

        @keyframes shiny {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .animate-shiny { animation: shiny 6s linear infinite; }

        @keyframes float-blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33%  { transform: translate(40px, -30px) scale(1.05); }
          66%  { transform: translate(-20px, 20px) scale(0.97); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        /* ═══════════════════════════════════════════
           AMBIENT BLOBS — fixed, always visible
        ═══════════════════════════════════════════ */
        .page-bg-canvas {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
        }
        /* Base gradient mesh */
        .page-bg-mesh {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 130% 80% at 15% 25%, rgba(120,30,60,0.45) 0%, transparent 55%),
            radial-gradient(ellipse 100% 70% at 85% 15%, rgba(30,60,140,0.35) 0%, transparent 50%),
            radial-gradient(ellipse 90%  60% at 50% 85%, rgba(80,20,100,0.35) 0%, transparent 55%),
            radial-gradient(ellipse 120% 90% at 10% 70%, rgba(150,20,40,0.25) 0%, transparent 50%),
            linear-gradient(160deg, #070710 0%, #0d0814 30%, #080c16 60%, #0a070f 100%);
        }
        /* Animated colour orbs */
        .page-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          will-change: transform;
        }
        .page-orb-1 {
          width: 900px; height: 900px;
          top: 30vh; left: -300px;
          background: radial-gradient(circle at 40% 40%, rgba(220,30,70,0.75), rgba(120,10,30,0.4) 40%, transparent 70%);
          animation: orb-drift-1 16s ease-in-out infinite;
        }
        .page-orb-2 {
          width: 800px; height: 800px;
          top: 20vh; right: -250px;
          background: radial-gradient(circle at 60% 40%, rgba(30,80,200,0.6), rgba(10,30,100,0.35) 40%, transparent 70%);
          animation: orb-drift-2 20s ease-in-out infinite;
        }
        .page-orb-3 {
          width: 700px; height: 700px;
          top: 80vh; left: 20%;
          background: radial-gradient(circle at 50% 50%, rgba(140,50,200,0.55), rgba(60,10,120,0.3) 40%, transparent 70%);
          animation: orb-drift-3 13s ease-in-out infinite;
        }
        .page-orb-4 {
          width: 850px; height: 850px;
          top: 150vh; right: -200px;
          background: radial-gradient(circle at 55% 45%, rgba(220,30,70,0.6), rgba(100,10,30,0.3) 40%, transparent 70%);
          animation: orb-drift-1 22s ease-in-out infinite reverse;
        }
        .page-orb-5 {
          width: 700px; height: 700px;
          top: 200vh; left: -150px;
          background: radial-gradient(circle at 40% 60%, rgba(30,100,200,0.5), rgba(10,40,100,0.3) 40%, transparent 70%);
          animation: orb-drift-2 17s ease-in-out infinite 3s;
        }
        .page-orb-6 {
          width: 600px; height: 600px;
          top: 280vh; left: 30%;
          background: radial-gradient(circle at 50% 50%, rgba(200,160,20,0.4), rgba(100,70,10,0.2) 40%, transparent 70%);
          animation: orb-drift-3 19s ease-in-out infinite 2s;
        }
        .page-orb-7 {
          width: 800px; height: 800px;
          top: 350vh; right: -100px;
          background: radial-gradient(circle at 60% 40%, rgba(140,50,200,0.5), rgba(60,10,100,0.25) 40%, transparent 70%);
          animation: orb-drift-1 14s ease-in-out infinite 1s;
        }
        /* Subtle noise grain */
        .page-noise {
          position: absolute;
          inset: 0;
          opacity: 0.045;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-size: 200px 200px;
          mix-blend-mode: overlay;
        }
        /* Vignette edges */
        .page-vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 100% 100% at 50% 50%, transparent 50%, rgba(5,5,12,0.7) 100%);
        }

        @keyframes orb-drift-1 {
          0%,100% { transform: translate(0,0) scale(1); }
          25%  { transform: translate(60px,-50px) scale(1.08); }
          50%  { transform: translate(30px, 40px) scale(0.94); }
          75%  { transform: translate(-40px,-20px) scale(1.04); }
        }
        @keyframes orb-drift-2 {
          0%,100% { transform: translate(0,0) scale(1); }
          33%  { transform: translate(-50px, 60px) scale(1.1); }
          66%  { transform: translate(40px,-30px) scale(0.92); }
        }
        @keyframes orb-drift-3 {
          0%,100% { transform: translate(0,0) scale(1); }
          40%  { transform: translate(35px, 55px) scale(1.06); }
          70%  { transform: translate(-45px,-25px) scale(0.96); }
        }

        /* ═══════════════════════════════════════════
           PREMIUM LIQUID GLASS CARD
        ═══════════════════════════════════════════ */
        .liquid-glass {
          background: linear-gradient(135deg,
            rgba(255,255,255,0.055) 0%,
            rgba(255,255,255,0.018) 60%,
            rgba(255,255,255,0.03) 100%
          );
          -webkit-backdrop-filter: blur(16px) saturate(1.5) brightness(1.05);
          backdrop-filter: blur(16px) saturate(1.5) brightness(1.05);
          border: 1px solid rgba(255,255,255,0.10);
          box-shadow:
            0 1px 0 rgba(255,255,255,0.10) inset,
            0 -1px 0 rgba(0,0,0,0.25) inset,
            0 12px 40px rgba(0,0,0,0.45),
            0 2px 8px rgba(0,0,0,0.35);
          position: relative;
          overflow: hidden;
        }
        .liquid-glass::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(255,255,255,0.35) 30%,
            rgba(255,255,255,0.5) 50%,
            rgba(255,255,255,0.35) 70%,
            transparent 100%
          );
          pointer-events: none;
          z-index: 10;
        }
        .liquid-glass:hover {
          border-color: rgba(225,29,72,0.3);
          box-shadow:
            0 1px 0 rgba(255,255,255,0.12) inset,
            0 16px 50px rgba(0,0,0,0.55),
            0 0 0 1px rgba(225,29,72,0.12),
            0 4px 20px rgba(225,29,72,0.10);
          transition: border-color 0.35s ease, box-shadow 0.35s ease;
        }

        /* ── Scrollbar hide ── */
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

        input::placeholder { color: rgba(255,255,255,0.3); }

        /* ═══════════════════════════════════════════
           SECTION STYLING
        ═══════════════════════════════════════════ */

        /* Section heading underline accent */
        .section-accent-line {
          display: inline-block;
          width: 40px; height: 2px;
          background: linear-gradient(90deg, #e11d48, transparent);
          border-radius: 2px;
          margin-top: 12px;
        }

        /* Glowing section separator */
        .section-sep {
          height: 1px;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(255,255,255,0.05) 20%,
            rgba(225,29,72,0.2) 50%,
            rgba(255,255,255,0.05) 80%,
            transparent 100%
          );
          margin: 0 auto;
        }

        /* ═══════════════════════════════════════════
           MOVIE POSTER CARDS
        ═══════════════════════════════════════════ */
        .movie-poster-wrap {
          flex-shrink: 0;
          width: 220px;
          cursor: pointer;
        }
        .movie-poster-img {
          position: relative;
          border-radius: 18px;
          overflow: hidden;
          aspect-ratio: 2/3;
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
          transition: transform 0.4s cubic-bezier(0.22,1,0.36,1), box-shadow 0.4s ease, border-color 0.3s ease;
        }
        .movie-poster-wrap:hover .movie-poster-img {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 24px 64px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.14);
          border-color: rgba(255,255,255,0.18);
        }

        /* ═══════════════════════════════════════════
           NOW SHOWING CARDS
        ═══════════════════════════════════════════ */
        .ns-card {
          background: linear-gradient(145deg,
            rgba(255,255,255,0.048) 0%,
            rgba(255,255,255,0.012) 100%
          );
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.35s cubic-bezier(0.22,1,0.36,1);
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          position: relative;
          overflow: hidden;
        }
        .ns-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
        }
        .ns-card:hover {
          background: linear-gradient(145deg,
            rgba(225,29,72,0.07) 0%,
            rgba(255,255,255,0.025) 100%
          );
          border-color: rgba(225,29,72,0.35);
          box-shadow:
            0 12px 48px rgba(225,29,72,0.15),
            0 4px 20px rgba(0,0,0,0.45);
          transform: translateY(-3px);
        }

        /* ═══════════════════════════════════════════
           CATEGORY CARDS
        ═══════════════════════════════════════════ */
        .cat-card {
          background: linear-gradient(145deg,
            rgba(255,255,255,0.045) 0%,
            rgba(255,255,255,0.01) 100%
          );
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          padding: 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.35s cubic-bezier(0.22,1,0.36,1);
          box-shadow: 0 4px 16px rgba(0,0,0,0.3);
          position: relative;
          overflow: hidden;
        }
        .cat-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
        }
        .cat-card:hover {
          transform: translateY(-5px) scale(1.04);
          box-shadow: 0 16px 48px rgba(0,0,0,0.5);
        }

        /* ═══════════════════════════════════════════
           THEATRE CARDS
        ═══════════════════════════════════════════ */
        .theatre-card {
          background: linear-gradient(145deg,
            rgba(255,255,255,0.045) 0%,
            rgba(10,10,15,0.5) 100%
          );
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 24px;
          cursor: pointer;
          transition: all 0.35s cubic-bezier(0.22,1,0.36,1);
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          position: relative;
          overflow: hidden;
        }
        .theatre-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(250,204,21,0.25), transparent);
        }
        .theatre-card:hover {
          border-color: rgba(250,204,21,0.35);
          box-shadow: 0 16px 48px rgba(250,204,21,0.1), 0 4px 24px rgba(0,0,0,0.5);
          transform: translateY(-4px);
        }

        /* ─── Flip Cards Section ─── */
        .flip-section-outer { background: transparent; }
        .flip-section-sticky {
          position: sticky;
          top: 0;
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2rem;
          overflow: hidden;
          padding: 1.5rem 1.5rem 4rem;
        }
        .flip-section-heading { text-align: center; }
        .flip-section-eyebrow {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: rgba(255,255,255,0.4);
          margin-bottom: 0.75rem;
        }
        .flip-eyebrow-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #e11d48;
          display: inline-block;
        }
        .flip-section-title {
          font-size: clamp(2rem, 5vw, 3.8rem);
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1.05;
          color: white;
        }
        .flip-cards-row {
          display: flex;
          gap: clamp(10px, 2vw, 24px);
          width: 100%;
          max-width: 900px;
          justify-content: center;
        }
        .flip-card-root {
          flex: 1;
          position: relative;
          height: clamp(220px, 34vh, 380px);
          border-radius: 20px;
          transform-style: preserve-3d;
          will-change: transform;
        }
        .flip-card-face {
          position: absolute;
          inset: 0;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.08);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .flip-card-grain {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E");
          background-size: 180px 180px;
          opacity: 0.5;
          mix-blend-mode: overlay;
          z-index: 5;
        }
        .flip-card-lines {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 3px,
            rgba(255,255,255,0.012) 3px,
            rgba(255,255,255,0.012) 4px
          );
          z-index: 4;
        }
        .flip-card-front-content {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: flex-start;
          padding: 1.25rem 1.25rem 0;
          gap: 0.25rem;
        }
        .flip-card-front-icon {
          font-size: 2.2rem;
          margin-top: auto;
          position: absolute;
          bottom: 3rem;
          left: 50%;
          transform: translateX(-50%);
          opacity: 0.8;
        }
        .flip-card-bottom-glow {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 60px;
          z-index: 6;
        }

        /* back face */
        .flip-card-back {
          border-width: 1px;
          border-style: solid;
        }
        .flip-card-back-content {
          position: relative;
          z-index: 10;
          padding: 1.5rem 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          height: 100%;
        }
        .flip-card-back-label {
          font-size: 0.58rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.22em;
        }
        .flip-card-back-title {
          font-size: clamp(1.25rem, 3vw, 1.85rem);
          font-weight: 700;
          color: white;
          letter-spacing: -0.025em;
          line-height: 1.1;
        }
        .flip-card-back-sub {
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          opacity: 0.8;
        }
        .flip-card-back-desc {
          font-size: clamp(0.7rem, 1.3vw, 0.82rem);
          color: rgba(255,255,255,0.55);
          line-height: 1.65;
          margin-top: 0.5rem;
        }
        .flip-card-back-icon {
          font-size: 2rem;
          margin-top: auto;
          opacity: 0.35;
        }

        /* progress bar */
        .flip-progress-bar {
          width: min(520px, 80vw);
          height: 2px;
          background: rgba(255,255,255,0.07);
          border-radius: 999px;
          overflow: hidden;
        }
        .flip-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #e11d48, #facc15, #60a5fa);
          border-radius: 999px;
          transform-origin: left;
        }

        /* scroll hint */
        .flip-scroll-hint {
          font-size: 0.7rem;
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          position: absolute;
          bottom: 2rem;
        }
      `}</style>

      {/* SVG noise filter */}
      

      <div className="relative min-h-screen text-white" style={{ overflowX: "clip" }}>

        {/* ── PREMIUM BACKGROUND CANVAS ─────────────────── */}
        

        {/* Guide lines */}
        <div className="hidden md:block pointer-events-none fixed inset-y-0 left-1/2 -translate-x-[calc(50%+36rem)] w-px z-[2]" style={{ background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.06) 20%, rgba(255,255,255,0.06) 80%, transparent)" }} />
        <div className="hidden md:block pointer-events-none fixed inset-y-0 left-1/2 translate-x-[calc(-50%+36rem)] w-px z-[2]" style={{ background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.06) 20%, rgba(255,255,255,0.06) 80%, transparent)" }} />

        {/* Content */}
          <Hero />
          <TrendingSection onOpenDetail={setSelectedMovie} />
          <NowPlayingSection onOpenDetail={setSelectedMovie} />
          <GenreGrid />
          <TopRatedSection onOpenDetail={setSelectedMovie} />
          <UpcomingSection onOpenDetail={setSelectedMovie} />
          <NearbyTheatres />
          <Testimonials />
          <FAQ />
          <FinalCTA />
        </div>

      <AnimatePresence>
        {selectedMovie && (
          <MovieDetailModal
            movie={selectedMovie}
            onClose={() => setSelectedMovie(null)}
            onOpenDetail={setSelectedMovie}
          />
        )}
      </AnimatePresence>
    </>
  );
}