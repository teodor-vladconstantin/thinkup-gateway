import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import AnnouncementBanner, { BANNER_ROW_HEIGHT_PX } from "./AnnouncementBanner";

export default function PublicLayout() {
  const [bannerCount, setBannerCount] = useState(1);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ "--banner-h": `${bannerCount * BANNER_ROW_HEIGHT_PX}px` } as React.CSSProperties}
    >
      <AnnouncementBanner onVisibleCountChange={setBannerCount} />
      <Navbar />
      <div style={{ height: "var(--banner-h)" }} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
