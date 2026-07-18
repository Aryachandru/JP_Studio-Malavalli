import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DialogProvider } from "./shared/DialogProvider";

import PrivateRoute from "./features/auth/PrivateRoute";
import AdminLogin from "./features/auth/AdminLogin";

import Dashboard from "./features/dashboard/Dashboard";
import Bookings from "./features/bookings/Bookings";
import BookingDetails from "./features/bookings/BookingDetails";
import AddBooking from "./features/bookings/AddBooking";
import BookNow from "./features/bookings/BookNow";
import TrackBooking from "./features/bookings/TrackBooking";

import CustomersList from "./features/customers/CustomersList";
import CustomerDetails from "./features/customers/CustomerDetails";

import CalendarView from "./features/calendar/CalendarView";

import AdminPackages from "./features/packages/AdminPackages";
import PublicPackages from "./features/packages/PublicPackages";
import PackageDetail from "./features/packages/PackageDetail";

import AdminOffers from "./features/offers/AdminOffers";
import AdminTestimonials from "./features/testimonials/AdminTestimonials";

import AdminGallery from "./features/gallery/AdminGallery";
import PublicGallery from "./features/gallery/PublicGallery";

import Photographers from "./features/photographers/Photographers";
import Reports from "./features/reports/Reports";
import Settings from "./features/settings/Settings";

import Home from "./features/home/Home";
import Contact from "./features/contact/Contact";
import Developer from "./features/developer/Developer";

export default function App() {
  return (
    <DialogProvider>
      <BrowserRouter>
        <Routes>
        {/* ---------------- Public site ---------------- */}
        <Route path="/" element={<Home />} />
        <Route path="/packages" element={<PublicPackages />} />
        <Route path="/packages/:id" element={<PackageDetail />} />
        <Route path="/gallery" element={<PublicGallery />} />
        <Route path="/book" element={<BookNow />} />
        <Route path="/track" element={<TrackBooking />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/developer" element={<Developer />} />

        {/* ---------------- Admin auth ---------------- */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* ---------------- Admin panel (guarded) ---------------- */}
        <Route path="/admin" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/admin/bookings" element={<PrivateRoute><Bookings /></PrivateRoute>} />
        <Route path="/admin/bookings/new" element={<PrivateRoute><AddBooking /></PrivateRoute>} />
        <Route path="/admin/bookings/:id" element={<PrivateRoute><BookingDetails /></PrivateRoute>} />
        <Route path="/admin/clients" element={<PrivateRoute><CustomersList /></PrivateRoute>} />
        <Route path="/admin/clients/:id" element={<PrivateRoute><CustomerDetails /></PrivateRoute>} />
        <Route path="/admin/calendar" element={<PrivateRoute><CalendarView /></PrivateRoute>} />
        <Route path="/admin/packages" element={<PrivateRoute><AdminPackages /></PrivateRoute>} />
        <Route path="/admin/offers" element={<PrivateRoute><AdminOffers /></PrivateRoute>} />
        <Route path="/admin/testimonials" element={<PrivateRoute><AdminTestimonials /></PrivateRoute>} />
        <Route path="/admin/gallery" element={<PrivateRoute><AdminGallery /></PrivateRoute>} />
        <Route path="/admin/photographers" element={<PrivateRoute><Photographers /></PrivateRoute>} />
        <Route path="/admin/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
        <Route path="/admin/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />

        <Route path="*" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </DialogProvider>
  );
}