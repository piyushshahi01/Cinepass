import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import Movies from "./pages/Movies";
import MovieDetails from "./pages/MovieDetails";
import Search from "./pages/Search";
import Categories from "./pages/Categories";
import Theatres from "./pages/Theatres";
const Watchlist = React.lazy(() => import("./pages/Watchlist"));
import AuthPages from "./pages/AuthPages";
import NotFound from "./pages/NotFound";
const Profile = React.lazy(() => import("./pages/Profile"));
const MyBookings = React.lazy(() => import("./pages/MyBookings"));
const Notifications = React.lazy(() => import("./pages/Notifications"));
const Settings = React.lazy(() => import("./pages/Settings"));
import TheatreSelection from "./pages/TheatreSelection";
import SeatSelection from "./pages/SeatSelection";
import Checkout from "./pages/Checkout";
import Payment from "./pages/Payment";
import TicketSuccess from "./pages/TicketSuccess";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import CommandPalette from "./components/ui/CommandPalette";
import OAuth2Redirect from "./pages/OAuth2Redirect";
import TheatreDetails from "./pages/TheatreDetails";

export default function App() {
  return (
    <BrowserRouter>
      <CommandPalette />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[#e11d48]"><div className="animate-spin w-8 h-8 border-4 border-current border-t-transparent rounded-full"></div></div>}>
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
            <Route path="theatre/:id" element={<TheatreDetails />} />
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
            <Route path="oauth2/redirect" element={<OAuth2Redirect />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          {/* Full screen booking workflows */}
          <Route path="/booking/:showId" element={<SeatSelection />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/ticket/:bookingId" element={<TicketSuccess />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </BrowserRouter>
  );
}