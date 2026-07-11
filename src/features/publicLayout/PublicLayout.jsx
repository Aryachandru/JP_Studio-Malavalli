import React from "react";
import Navbar from "../navbar/Navbar";
import Footer from "../footer/Footer";
import OfferBanner from "../offers/OfferBanner";
import "./PublicLayout.css";

export default function PublicLayout({ children }) {
  return (
    <div className="public-shell">
      <OfferBanner />
      <Navbar />
      <main className="public-main">{children}</main>
      <Footer />
    </div>
  );
}
