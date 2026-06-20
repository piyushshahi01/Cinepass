import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Film, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen pt-24 px-6 flex flex-col items-center justify-center text-white relative overflow-hidden">
      
      {/* Background glitch effect */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
        <h1 className="text-[30vw] font-black leading-none text-white tracking-tighter mix-blend-overlay">404</h1>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="liquid-glass rounded-3xl p-12 text-center max-w-lg relative z-10"
      >
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
          <Film size={40} className="text-[#e11d48]" />
        </div>
        <h2 className="text-3xl font-bold mb-4">Plot Twist!</h2>
        <p className="text-white/60 mb-8 leading-relaxed">
          The page you're looking for seems to have been edited out of the final cut. Let's get you back to the main feature.
        </p>
        
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#e11d48] hover:bg-[#be123c] text-white font-bold transition-colors shadow-[0_4px_20px_rgba(225,29,72,0.4)]"
        >
          <Home size={18} /> Back to Home
        </Link>
      </motion.div>
      
    </div>
  );
}
