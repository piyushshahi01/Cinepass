import { motion } from "motion/react";
import { Ticket, Film, Smartphone, Globe, Code, Heart } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen pt-28 px-6 md:px-12 xl:px-20 text-white max-w-5xl mx-auto pb-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4">About CinePass</h1>
        <p className="text-xl text-white/50 max-w-2xl mx-auto">
          Reimagining the cinematic experience. Built for movie lovers, by movie lovers.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-12 mb-20">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold text-[#e11d48]">Our Story</h2>
          <p className="text-white/70 leading-relaxed">
            CinePass began with a simple idea: booking a movie ticket should be as magical as the movie itself. We were tired of clunky interfaces, hidden fees, and stressful seat selection processes.
          </p>
          <p className="text-white/70 leading-relaxed">
            Today, we serve millions of users across the country, providing real-time seating layouts, instant confirmations, and a premium cinematic UI that puts the movie first.
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-4"
        >
          <div className="liquid-glass rounded-2xl p-6 flex flex-col items-center justify-center text-center">
            <Ticket size={32} className="text-[#e11d48] mb-2" />
            <span className="font-bold text-2xl">10M+</span>
            <span className="text-xs text-white/50 uppercase tracking-wider">Tickets Booked</span>
          </div>
          <div className="liquid-glass rounded-2xl p-6 flex flex-col items-center justify-center text-center">
            <Film size={32} className="text-[#e11d48] mb-2" />
            <span className="font-bold text-2xl">5,000+</span>
            <span className="text-xs text-white/50 uppercase tracking-wider">Screens</span>
          </div>
          <div className="liquid-glass rounded-2xl p-6 flex flex-col items-center justify-center text-center">
            <Globe size={32} className="text-[#e11d48] mb-2" />
            <span className="font-bold text-2xl">120+</span>
            <span className="text-xs text-white/50 uppercase tracking-wider">Cities</span>
          </div>
          <div className="liquid-glass rounded-2xl p-6 flex flex-col items-center justify-center text-center">
            <Smartphone size={32} className="text-[#e11d48] mb-2" />
            <span className="font-bold text-2xl">4.9/5</span>
            <span className="text-xs text-white/50 uppercase tracking-wider">App Rating</span>
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="liquid-glass rounded-3xl p-10 text-center"
      >
        <Code size={40} className="text-white/20 mx-auto mb-6" />
        <h2 className="text-2xl font-bold mb-4">The Tech Behind The Magic</h2>
        <p className="text-white/60 max-w-2xl mx-auto mb-8">
          CinePass is built using the bleeding edge of web technology. A fully responsive React architecture powered by Framer Motion, TailwindCSS, and React Query, seamlessly integrating with the TMDB API.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {["React 18", "Vite", "TailwindCSS", "Framer Motion", "React Query", "Lucide Icons", "Leaflet Maps"].map(tech => (
            <span key={tech} className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm font-medium">
              {tech}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
