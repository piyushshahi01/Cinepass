import { createContext, useContext, useState, useEffect } from "react";

const BookingContext = createContext();

export function BookingProvider({ children }) {
  // Mock User
  const [user] = useState({
    name: "Alex Carter",
    email: "alex@example.com",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d"
  });

  // Bookings
  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem("cinepass_bookings");
    return saved ? JSON.parse(saved) : [];
  });

  // Notifications
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem("cinepass_notifications");
    return saved ? JSON.parse(saved) : [
      { id: "1", title: "Welcome to CinePass!", message: "Your premium cinematic journey begins here.", read: false, date: new Date().toISOString() }
    ];
  });

  useEffect(() => {
    localStorage.setItem("cinepass_bookings", JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem("cinepass_notifications", JSON.stringify(notifications));
  }, [notifications]);

  const addBooking = (bookingDetails) => {
    const newBooking = {
      id: "CP-" + Math.random().toString(36).substring(2, 9).toUpperCase(),
      dateBooked: new Date().toISOString(),
      status: "upcoming",
      ...bookingDetails
    };
    setBookings(prev => [newBooking, ...prev]);
    
    // Add notification
    addNotification(`Booking Confirmed!`, `Your tickets for ${bookingDetails.movie.title} have been confirmed.`);
    
    return newBooking.id;
  };

  const cancelBooking = (id) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "cancelled" } : b));
    addNotification("Booking Cancelled", `Your booking ${id} has been cancelled successfully.`);
  };

  const addNotification = (title, message) => {
    const notif = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      message,
      read: false,
      date: new Date().toISOString()
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <BookingContext.Provider value={{
      user,
      bookings,
      addBooking,
      cancelBooking,
      notifications,
      markNotificationRead,
      clearNotifications,
      addNotification
    }}>
      {children}
    </BookingContext.Provider>
  );
}

export const useBooking = () => useContext(BookingContext);
