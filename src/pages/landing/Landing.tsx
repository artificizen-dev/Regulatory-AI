import React from "react";
import Navbar from "../../components/Navbar/Navbar";
import NotificationBanner from "../../components/LandingPage/NotificationBanner";
import HeroSection from "../../components/LandingPage/HeroSection";
import Footer from "../../components/Footer/Footer";

const Landing: React.FC = () => {
  return (
    <div className="">
      <Navbar />

      <main className="pt-24 px-4 md:px-6 min-h-screen">
        {/* Notification Banner */}
        <NotificationBanner />

        {/* Hero Section */}
        <HeroSection />
      </main>
      <Footer />
    </div>
  );
};

export default Landing;
