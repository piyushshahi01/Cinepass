import { useState } from "react";
import { motion } from "motion/react";
import { Mail, Phone, MapPin, Send, MessageSquare } from "lucide-react";
import { useToast } from "../context/ToastContext";

export default function Contact() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      addToast("Message sent successfully! We'll get back to you soon.", "success");
      e.target.reset();
    }, 1500);
  };

  return (
    <div className="min-h-screen pt-28 px-6 md:px-12 xl:px-20 text-white max-w-6xl mx-auto pb-20">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
        <p className="text-xl text-white/50 max-w-2xl mx-auto">
          Have a question or facing an issue? We're here to help you out.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Contact Info */}
        <div className="w-full lg:w-1/3 space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="liquid-glass rounded-3xl p-8"
          >
            <div className="w-12 h-12 rounded-full bg-[#e11d48]/20 flex items-center justify-center mb-6">
              <Phone size={24} className="text-[#e11d48]" />
            </div>
            <h3 className="text-lg font-bold mb-2">Phone Support</h3>
            <p className="text-white/50 mb-2">Mon-Fri from 8am to 5pm.</p>
            <a href="tel:+1234567890" className="text-lg font-medium hover:text-[#e11d48] transition-colors">+1 (234) 567-890</a>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="liquid-glass rounded-3xl p-8"
          >
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-6">
              <Mail size={24} className="text-blue-400" />
            </div>
            <h3 className="text-lg font-bold mb-2">Email Support</h3>
            <p className="text-white/50 mb-2">Our team will respond within 24 hours.</p>
            <a href="mailto:support@cinepass.com" className="text-lg font-medium hover:text-blue-400 transition-colors">support@cinepass.com</a>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="liquid-glass rounded-3xl p-8"
          >
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
              <MapPin size={24} className="text-green-400" />
            </div>
            <h3 className="text-lg font-bold mb-2">Headquarters</h3>
            <p className="text-white/50">
              123 Cinematic Blvd,<br />
              Innovation District,<br />
              Tech City, TC 40001
            </p>
          </motion.div>
        </div>

        {/* Contact Form */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 liquid-glass rounded-3xl p-8 md:p-10"
        >
          <div className="flex items-center gap-3 mb-8">
            <MessageSquare size={24} className="text-[#e11d48]" />
            <h2 className="text-2xl font-bold">Send us a message</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">First Name</label>
                <input required type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#e11d48] transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Last Name</label>
                <input required type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#e11d48] transition-colors" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Email Address</label>
              <input required type="email" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#e11d48] transition-colors" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Subject</label>
              <select className="w-full bg-[#12121a] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#e11d48] transition-colors text-white">
                <option>Booking Issue</option>
                <option>Refund Request</option>
                <option>Technical Support</option>
                <option>Business Inquiry</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Message</label>
              <textarea required rows={5} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#e11d48] transition-colors resize-none" />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-[#e11d48] text-white font-bold hover:bg-[#be123c] transition-colors shadow-[0_4px_20px_rgba(225,29,72,0.4)] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send Message"} <Send size={18} />
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
