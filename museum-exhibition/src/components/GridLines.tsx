"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function GridLines() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lines = containerRef.current?.querySelectorAll(".grid-line-vertical");
    if (!lines) return;

    // Draw the vertical lines down on load with a staggered transition
    gsap.fromTo(
      lines,
      { scaleY: 0, transformOrigin: "top" },
      {
        scaleY: 1,
        duration: 2,
        ease: "power4.inOut",
        delay: 0.5,
        stagger: 0.15,
      }
    );
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-10 w-full h-full">
      <div className="grid-line-vertical left-[20%] hidden md:block" />
      <div className="grid-line-vertical left-[40%] hidden md:block" />
      <div className="grid-line-vertical left-[60%] hidden md:block" />
      <div className="grid-line-vertical left-[80%] hidden md:block" />
      
      {/* Mobile grid line (single center line) */}
      <div className="grid-line-vertical left-[50%] md:hidden" />
    </div>
  );
}
