import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, MessageCircleQuestion } from "lucide-react";

const FAQS = [
  {
    category: "Booking & Tickets",
    items: [
      { q: "How many tickets can I book at once?", a: "You can book a maximum of 10 tickets per transaction to ensure fair availability for all our customers." },
      { q: "Can I cancel my tickets?", a: "Yes, you can cancel tickets up to 2 hours before the showtime. A cancellation fee of 10% will be deducted from your refund." },
      { q: "Do I need to print my M-ticket?", a: "No, you can simply show the M-ticket QR code on your smartphone at the cinema entrance." }
    ]
  },
  {
    category: "Payments & Refunds",
    items: [
      { q: "What payment methods are supported?", a: "We accept all major credit/debit cards, UPI, Net Banking, and popular mobile wallets." },
      { q: "When will I get my refund?", a: "Refunds for cancelled tickets are typically processed within 5-7 business days depending on your bank." }
    ]
  },
  {
    category: "Cinema Experience",
    items: [
      { q: "What is the difference between IMAX and 4DX?", a: "IMAX offers a massive screen and custom sound for an immersive audio-visual experience. 4DX adds environmental effects like motion seats, wind, and water." },
      { q: "Are outside snacks allowed?", a: "As per cinema regulations, outside food and beverages are not permitted inside the premises. You can purchase snacks from the concession stands." }
    ]
  }
];

export default function FAQ() {
  const [openItem, setOpenItem] = useState(null);

  const toggleItem = (id) => {
    setOpenItem(openItem === id ? null : id);
  };

  return (
    <div className="min-h-screen pt-28 px-6 md:px-12 xl:px-20 text-white max-w-4xl mx-auto pb-20">
      <div className="text-center mb-16">
        <div className="w-16 h-16 rounded-full bg-[#e11d48]/20 flex items-center justify-center mx-auto mb-6">
          <MessageCircleQuestion size={32} className="text-[#e11d48]" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
        <p className="text-xl text-white/50 max-w-2xl mx-auto">
          Everything you need to know about booking, payments, and the CinePass experience.
        </p>
      </div>

      <div className="space-y-12">
        {FAQS.map((section, sIdx) => (
          <motion.div 
            key={sIdx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sIdx * 0.1 }}
          >
            <h2 className="text-2xl font-bold mb-6 text-[#e11d48]">{section.category}</h2>
            <div className="space-y-4">
              {section.items.map((item, iIdx) => {
                const id = `${sIdx}-${iIdx}`;
                const isOpen = openItem === id;

                return (
                  <div key={iIdx} className="liquid-glass rounded-2xl overflow-hidden">
                    <button
                      onClick={() => toggleItem(id)}
                      className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                    >
                      <span className="font-semibold text-lg">{item.q}</span>
                      <ChevronDown 
                        size={20} 
                        className={`text-white/50 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
                      />
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="px-6 pb-5 pt-0 text-white/60 leading-relaxed border-t border-white/5 mt-2 pt-4">
                            {item.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
