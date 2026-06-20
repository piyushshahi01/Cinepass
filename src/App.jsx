import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import Movies from "./pages/Movies";
import MovieDetails from "./pages/MovieDetails";
import Search from "./pages/Search";
import Categories from "./pages/Categories";
import Theatres from "./pages/Theatres";
import Watchlist from "./pages/Watchlist";
import AuthPages from "./pages/AuthPages";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import MyBookings from "./pages/MyBookings";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import TheatreSelection from "./pages/TheatreSelection";
import SeatSelection from "./pages/SeatSelection";
import Checkout from "./pages/Checkout";
import Payment from "./pages/Payment";
import TicketSuccess from "./pages/TicketSuccess";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import CommandPalette from "./components/ui/CommandPalette";

export default function App() {
  return (
    <BrowserRouter>
      <CommandPalette />
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="movies" element={<Movies />} />
            <Route path="movie/:id" element={<MovieDetails />} />
            <Route path="movie/:id/theatres" element={<TheatreSelection />} />
            <Route path="search" element={<Search />} />
            <Route path="categories" element={<Categories />} />
            <Route path="theatres" element={<Theatres />} />
            <Route path="watchlist" element={<Watchlist />} />
            <Route path="login" element={<AuthPages />} />
            <Route path="register" element={<AuthPages />} />
            <Route path="profile" element={<Profile />} />
            <Route path="my-bookings" element={<MyBookings />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="settings" element={<Settings />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="faq" element={<FAQ />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          {/* Full screen booking workflows */}
          <Route path="/booking/:showId" element={<SeatSelection />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/ticket/:bookingId" element={<TicketSuccess />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
}