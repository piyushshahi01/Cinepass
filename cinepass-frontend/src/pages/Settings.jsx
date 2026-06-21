import { useState } from "react";
import { motion } from "motion/react";
import { Moon, Sun, Globe, Bell } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [language, setLanguage] = useState("en");

  return (
    <div className="min-h-screen pt-28 px-6 md:px-12 xl:px-20 text-white max-w-4xl mx-auto pb-20">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Settings</h1>
        <p className="text-white/50">Manage your cinematic preferences.</p>
      </div>

      <div className="space-y-6">
        
        {/* Theme Setting */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="liquid-glass rounded-3xl p-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
              {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Appearance</h3>
              <p className="text-sm text-white/50">Toggle between cinematic dark and frosted light mode.</p>
            </div>
          </div>
          <button 
            onClick={toggleTheme}
            className="w-14 h-8 rounded-full bg-white/10 relative transition-colors duration-300"
            style={{ backgroundColor: theme === 'light' ? '#e11d48' : 'rgba(255,255,255,0.1)' }}
          >
            <motion.div 
              layout
              className="w-6 h-6 rounded-full bg-white shadow-md absolute top-1"
              initial={false}
              animate={{ left: theme === 'light' ? '30px' : '4px' }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
        </motion.div>

        {/* Notifications Setting */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="liquid-glass rounded-3xl p-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
              <Bell size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Push Notifications</h3>
              <p className="text-sm text-white/50">Receive alerts for bookings and new movie releases.</p>
            </div>
          </div>
          <button 
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            className="w-14 h-8 rounded-full bg-white/10 relative transition-colors duration-300"
            style={{ backgroundColor: notificationsEnabled ? '#e11d48' : 'rgba(255,255,255,0.1)' }}
          >
            <motion.div 
              layout
              className="w-6 h-6 rounded-full bg-white shadow-md absolute top-1"
              initial={false}
              animate={{ left: notificationsEnabled ? '30px' : '4px' }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
        </motion.div>

        {/* Language Setting */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="liquid-glass rounded-3xl p-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
              <Globe size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Language</h3>
              <p className="text-sm text-white/50">Select your preferred app language.</p>
            </div>
          </div>
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-[#e11d48] text-sm font-medium"
          >
            <option value="en" className="bg-[#080810]">English</option>
            <option value="hi" className="bg-[#080810]">Hindi</option>
            <option value="es" className="bg-[#080810]">Spanish</option>
          </select>
        </motion.div>

      </div>
    </div>
  );
}
