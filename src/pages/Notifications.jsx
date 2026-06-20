import { motion, AnimatePresence } from "motion/react";
import { Bell, Check, Trash2 } from "lucide-react";
import { useBooking } from "../context/BookingContext";

export default function Notifications() {
  const { notifications, markNotificationRead, clearNotifications } = useBooking();

  return (
    <div className="min-h-screen pt-28 px-6 md:px-12 xl:px-20 text-white max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Notifications</h1>
          <p className="text-white/50">Stay updated on your bookings and offers.</p>
        </div>

        {notifications.length > 0 && (
          <button 
            onClick={clearNotifications}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-red-500/10 hover:text-red-400 transition-colors text-sm font-medium"
          >
            <Trash2 size={16} /> Clear All
          </button>
        )}
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {notifications.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="py-20 flex flex-col items-center justify-center text-center"
            >
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <Bell size={32} className="text-white/20" />
              </div>
              <h3 className="text-xl font-bold mb-2">All caught up!</h3>
              <p className="text-white/50">You don't have any new notifications.</p>
            </motion.div>
          ) : (
            notifications.map((notif, i) => (
              <motion.div
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05 }}
                key={notif.id}
                className={`liquid-glass rounded-2xl p-6 flex gap-6 items-start ${notif.read ? 'opacity-50' : ''}`}
              >
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <Bell size={20} className="text-white/70" />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{notif.title}</h3>
                  <p className="text-white/60 text-sm mb-3">{notif.message}</p>
                  <p className="text-xs text-white/40">{new Date(notif.date).toLocaleString()}</p>
                </div>

                {!notif.read && (
                  <button 
                    onClick={() => markNotificationRead(notif.id)}
                    className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors shrink-0"
                    title="Mark as read"
                  >
                    <Check size={16} />
                  </button>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
