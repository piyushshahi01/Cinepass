import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Search, Film, MapPin, Grid, Ticket } from "lucide-react";

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    } else {
      setQuery("");
    }
  }, [isOpen]);

  const handleAction = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const results = [
    { type: "Movies", title: "Deadpool & Wolverine", path: "/movie/533535", icon: <Film size={16} /> },
    { type: "Movies", title: "Dune: Part Two", path: "/movie/693134", icon: <Film size={16} /> },
    { type: "Theatres", title: "INOX Laserplex, Mumbai", path: "/theatres", icon: <MapPin size={16} /> },
    { type: "Theatres", title: "PVR ICON", path: "/theatres", icon: <MapPin size={16} /> },
    { type: "Genres", title: "Action Movies", path: "/movies?genre=28", icon: <Grid size={16} /> },
    { type: "Genres", title: "Sci-Fi Movies", path: "/movies?genre=878", icon: <Grid size={16} /> },
    { type: "Navigation", title: "My Bookings", path: "/my-bookings", icon: <Ticket size={16} /> },
  ].filter(r => r.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 w-[90%] max-w-2xl bg-[#0a0a0f] border border-white/10 rounded-2xl shadow-2xl z-[10000] overflow-hidden"
          >
            <div className="flex items-center px-4 py-4 border-b border-white/10">
              <Search className="text-white/40 mr-3" size={20} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search movies, theatres, or jump to..."
                className="w-full bg-transparent border-none text-lg text-white focus:outline-none placeholder:text-white/30"
              />
              <div className="flex items-center gap-1 text-[10px] font-medium text-white/30 px-2 py-1 rounded bg-white/5 border border-white/10 ml-3">
                ESC
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {results.length === 0 ? (
                <div className="py-12 text-center text-white/40 text-sm">
                  No results found for "{query}"
                </div>
              ) : (
                <div className="space-y-1">
                  {results.map((result, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAction(result.path)}
                      className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 flex items-center gap-4 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 group-hover:bg-[#e11d48] group-hover:text-white transition-colors">
                        {result.icon}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">{result.title}</div>
                        <div className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">{result.type}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="bg-black/40 px-4 py-3 border-t border-white/5 flex items-center justify-between text-xs text-white/30">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">Use <kbd className="font-mono bg-white/10 px-1 rounded">↑</kbd> <kbd className="font-mono bg-white/10 px-1 rounded">↓</kbd> to navigate</span>
                <span className="flex items-center gap-1">Press <kbd className="font-mono bg-white/10 px-1 rounded">Enter</kbd> to select</span>
              </div>
              <div className="font-bold tracking-widest uppercase">CinePass</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
