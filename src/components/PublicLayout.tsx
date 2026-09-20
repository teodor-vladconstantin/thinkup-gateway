import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import AnnouncementBanner from "./AnnouncementBanner";

export default function PublicLayout() {
  const [bannerVisible, setBannerVisible] = useState(true);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ "--banner-h": bannerVisible ? "2.75rem" : "0px" } as React.CSSProperties}
    >
      <AnnouncementBanner onVisibilityChange={setBannerVisible} />
      <Navbar />
      <div style={{ height: "var(--banner-h)" }} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
