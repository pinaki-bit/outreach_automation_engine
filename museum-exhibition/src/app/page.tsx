"use client";

import { useEffect, useState } from "react";
import Loader from "@/components/Loader";
import Navbar from "@/components/Navbar";
import LeftNav from "@/components/LeftNav";
import HeroSection from "@/components/HeroSection";
import ExhibitionDetails from "@/components/ExhibitionDetails";

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Stop Lenis scrolling during initial loader tick
    if (typeof window !== "undefined" && (window as any).lenis) {
      (window as any).lenis.stop();
    }
  }, []);

  const handleLoadingComplete = () => {
    setIsLoaded(true);
    // Restart Lenis scrolling after loading screen slides up
    if (typeof window !== "undefined" && (window as any).lenis) {
      (window as any).lenis.start();
    }
  };

  return (
    <>
      {/* Absolute high-end loader covering screen */}
      <Loader onComplete={handleLoadingComplete} />

      {/* Main page layout (pre-renders underneath loader for smooth transition) */}
      <main className="relative min-h-screen bg-luxury-black flex flex-col items-stretch">
        <Navbar />
        <LeftNav />
        <HeroSection />
        {isLoaded && <ExhibitionDetails />}
      </main>
    </>
  );
}
