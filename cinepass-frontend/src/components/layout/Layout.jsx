import { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Search, Menu, X, ChevronRight, ArrowUp, User, LogOut, Bookmark, Ticket } from "lucide-react";
import SearchPanel from "../ui/SearchPanel";
import MovieDetailModal from "../movie/MovieDetailModal";

export function LogoMark({ className = "w-8 h-8" }) {
  return (
    <svg viewBox="0 0 256 256" className={className} fill="white">
      <path d="M128 0C128 0 160 60 200 100C240 140 256 128 256 128C256 128 240 160 200 200C160 240 128 256 128 256C128 256 96 240 56 200C16 160 0 128 0 128C0 128 16 96 56 56C96 16 128 0 128 0Z" />
      <circle cx="128" cy="128" r="40" fill="#0a0a0f" />
      <circle cx="128" cy="128" r="16" fill="white" />
    </svg>
  );
}

export function PrimaryButton({ label = "Book Now", full = false, icon, onClick }) {
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

function Navbar({ onSearchClick }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();

  const links = [
    { name: "Home", path: "/" },
    { name: "Movies", path: "/movies" },
    { name: "Theatres", path: "/theatres" },
    { name: "Categories", path: "/categories" },
    { name: "Watchlist", path: "/watchlist" }
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    
    const checkUser = () => {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch (e) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };
    checkUser();
    window.addEventListener("auth-change", checkUser);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("auth-change", checkUser);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth-change"));
  };

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 inset-x-0 z-50 flex items-center justify-center"
        style={{
          background: scrolled ? "rgba(10,10,15,0.7)" : "transparent",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(16px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
          transition: "background 0.4s ease, backdrop-filter 0.4s ease, border 0.4s ease",
        }}
      >
        <div className="flex items-center justify-between px-6 py-5 max-w-6xl w-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <LogoMark className="w-7 h-7" />
            <span className="text-sm font-semibold tracking-tight text-white">CinePass</span>
          </Link>

          {/* Center links */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((l, i) => (
              <Link
                key={l.name}
                to={l.path}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === l.path ? "text-white" : "text-white/70 hover:text-white"
                }`}
              >
                {l.name}
              </Link>
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
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  {user.profileImage ? (
                    <img src={user.profileImage} alt={user.name} className="w-6 h-6 rounded-full" />
                  ) : (
                    <User size={16} className="text-white/70" />
                  )}
                  <span className="text-sm font-medium text-white">{user.name.split(' ')[0]}</span>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#0a0a0f] border border-white/10 rounded-xl overflow-hidden shadow-xl z-50">
                    <Link to="/profile" className="flex items-center gap-2 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setDropdownOpen(false)}>
                      <User size={14} /> Profile
                    </Link>
                    <Link to="/watchlist" className="flex items-center gap-2 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setDropdownOpen(false)}>
                      <Bookmark size={14} /> Watchlist
                    </Link>
                    <Link to="/my-bookings" className="flex items-center gap-2 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setDropdownOpen(false)}>
                      <Ticket size={14} /> My Bookings
                    </Link>
                    <button onClick={() => { handleLogout(); setDropdownOpen(false); }} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-[#e11d48] hover:bg-white/5 transition-colors border-t border-white/5">
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login">
                <PrimaryButton label="Sign In" />
              </Link>
            )}
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
            <Link
              key={l.name}
              to={l.path}
              onClick={() => setOpen(false)}
              className="text-sm text-white/70 py-2 border-b border-white/5"
            >
              {l.name}
            </Link>
          ))}
          <div className="pt-2">
            {user ? (
              <div className="flex flex-col gap-2">
                <Link to="/profile" onClick={() => setOpen(false)} className="text-sm text-white/70 py-2 border-b border-white/5 flex items-center gap-2"><User size={14} /> Profile</Link>
                <Link to="/watchlist" onClick={() => setOpen(false)} className="text-sm text-white/70 py-2 border-b border-white/5 flex items-center gap-2"><Bookmark size={14} /> Watchlist</Link>
                <Link to="/my-bookings" onClick={() => setOpen(false)} className="text-sm text-white/70 py-2 border-b border-white/5 flex items-center gap-2"><Ticket size={14} /> My Bookings</Link>
                <button onClick={() => { handleLogout(); setOpen(false); }} className="text-sm text-[#e11d48] py-2 flex items-center gap-2 text-left"><LogOut size={14} /> Logout</button>
              </div>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)}>
                <PrimaryButton label="Sign In" full />
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/[0.08] py-12 px-6 max-w-6xl mx-auto w-full text-white">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2.5 mb-4">
            <LogoMark className="w-6 h-6" />
            <span className="text-sm font-semibold">CinePass</span>
          </div>
          <p className="text-xs text-white/40 leading-[1.6]">
            India's premium movie ticket booking platform. Every seat, every screen, every city.
          </p>
        </div>
        {[
          { title: "Movies", links: ["Now Showing", "Coming Soon", "Top Rated", "Genres"] },
          { title: "Theatres", links: ["Near You", "IMAX", "Premium", "Drive-In"] },
          { title: "Company", links: ["About", "Careers", "Press", "Contact"] },
          { title: "Legal", links: ["Privacy Policy", "Terms", "Refund Policy", "Support"] },
        ].map(({ title, links }) => (
          <div key={title}>
            <div className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-3">{title}</div>
            {links.map((link) => (
              <a key={link} href="#" className="block text-xs text-white/40 hover:text-white/70 transition-colors py-1">
                {link}
              </a>
            ))}
          </div>
        ))}
      </div>
      <div className="flex flex-col md:flex-row items-center justify-between pt-6 border-t border-white/[0.06]">
        <span className="text-xs text-white/30">
          © 2026 CinePass, Inc. · All rights reserved.
        </span>
      </div>
    </footer>
  );
}

export default function Layout() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen text-white bg-[#0a0a0f] selection:bg-[#e11d48]/30 overflow-x-hidden">
      {/* SVG noise filter */}
      <svg style={{ position: "absolute", width: 0, height: 0 }}>
        <defs>
          <filter id="cine-noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.35 0" />
            <feComposite in2="SourceGraphic" operator="in" result="noise" />
            <feBlend in="SourceGraphic" in2="noise" mode="multiply" />
          </filter>
        </defs>
      </svg>
      <div className="page-bg-canvas">
        <div className="page-bg-mesh" />
        <div className="page-orb page-orb-1" />
        <div className="page-orb page-orb-2" />
        <div className="page-orb page-orb-3" />
        <div className="page-orb page-orb-4" />
        <div className="page-orb page-orb-5" />
        <div className="page-orb page-orb-6" />
        <div className="page-orb page-orb-7" />
        <div className="page-noise" />
        <div className="page-vignette" />
      </div>

      <div className="relative z-[3] flex flex-col min-h-screen">
        <Navbar onSearchClick={() => setSearchOpen(true)} />
        
        <main className="flex-1 w-full relative z-10 pt-[72px]">
          <Outlet />
        </main>
        
        <Footer />

        <SearchPanel isOpen={searchOpen} onClose={() => setSearchOpen(false)} onOpenDetail={(m) => { setSearchOpen(false); setSelectedMovie(m); }} />
        <AnimatePresence>
          {selectedMovie && (
            <MovieDetailModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} onOpenDetail={setSelectedMovie} />
          )}
        </AnimatePresence>

        {showBackToTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-8 right-8 z-50 w-12 h-12 rounded-full bg-[#e11d48] text-white flex items-center justify-center shadow-[0_4px_20px_rgba(225,29,72,0.4)] hover:bg-[#be123c] hover:scale-105 transition-all"
          >
            <ArrowUp size={20} />
          </button>
        )}
      </div>
    </div>
  );
}
