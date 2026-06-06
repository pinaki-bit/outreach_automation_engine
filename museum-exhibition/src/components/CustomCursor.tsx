"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function CustomCursor() {
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const ambientLightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursorDot = cursorDotRef.current;
    const cursorRing = cursorRingRef.current;
    const ambientLight = ambientLightRef.current;

    if (!cursorDot || !cursorRing || !ambientLight) return;

    // Hide standard cursor on desktop
    const isTouch = window.matchMedia("(max-width: 768px)").matches;
    if (isTouch) {
      ambientLight.style.display = "none";
      return;
    }

    document.body.style.cursor = "none";

    // Set initial off-screen
    gsap.set([cursorDot, cursorRing, ambientLight], { xPercent: 0, yPercent: 0 });

    const setDotX = gsap.quickTo(cursorDot, "x", { duration: 0.08, ease: "power3.out" });
    const setDotY = gsap.quickTo(cursorDot, "y", { duration: 0.08, ease: "power3.out" });

    const setRingX = gsap.quickTo(cursorRing, "x", { duration: 0.35, ease: "power3.out" });
    const setRingY = gsap.quickTo(cursorRing, "y", { duration: 0.35, ease: "power3.out" });

    const setLightX = gsap.quickTo(ambientLight, "x", { duration: 0.7, ease: "power2.out" });
    const setLightY = gsap.quickTo(ambientLight, "y", { duration: 0.7, ease: "power2.out" });

    const handleMouseMove = (e: MouseEvent) => {
      setDotX(e.clientX - 4);
      setDotY(e.clientY - 4);

      setRingX(e.clientX - 20);
      setRingY(e.clientY - 20);

      // Spotlight size is 600px x 600px, center it on the mouse
      setLightX(e.clientX - 300);
      setLightY(e.clientY - 300);
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Hover interactive scaling
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = 
        target.tagName === "A" || 
        target.tagName === "BUTTON" || 
        target.closest("a") || 
        target.closest("button") || 
        target.classList.contains("interactive") || 
        target.style.cursor === "pointer";

      if (isInteractive) {
        gsap.to(cursorRing, {
          scale: 1.6,
          borderColor: "#c5a880",
          backgroundColor: "rgba(197, 168, 128, 0.05)",
          duration: 0.3,
        });
        gsap.to(cursorDot, {
          scale: 1.5,
          backgroundColor: "#c5a880",
          duration: 0.3,
        });
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = 
        target.tagName === "A" || 
        target.tagName === "BUTTON" || 
        target.closest("a") || 
        target.closest("button") || 
        target.classList.contains("interactive") || 
        target.style.cursor === "pointer";

      if (isInteractive) {
        gsap.to(cursorRing, {
          scale: 1,
          borderColor: "rgba(255, 255, 255, 0.4)",
          backgroundColor: "transparent",
          duration: 0.3,
        });
        gsap.to(cursorDot, {
          scale: 1,
          backgroundColor: "#ffffff",
          duration: 0.3,
        });
      }
    };

    window.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("mouseout", handleMouseOut);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mouseout", handleMouseOut);
      document.body.style.cursor = "auto";
    };
  }, []);

  return (
    <>
      {/* Background cinematic mouse-following light aura */}
      <div
        ref={ambientLightRef}
        className="fixed top-0 left-0 w-[600px] h-[600px] rounded-full pointer-events-none z-0 opacity-40 blur-[130px] mix-blend-screen"
        style={{
          background: "radial-gradient(circle, rgba(197, 168, 128, 0.16) 0%, rgba(5, 5, 5, 0) 70%)",
          willChange: "transform",
        }}
      />

      {/* Inner dot */}
      <div
        ref={cursorDotRef}
        className="fixed top-0 left-0 w-2 h-2 bg-white rounded-full pointer-events-none z-50 hidden md:block mix-blend-difference"
        style={{ willChange: "transform" }}
      />

      {/* Outer tracking ring */}
      <div
        ref={cursorRingRef}
        className="fixed top-0 left-0 w-10 h-10 border border-white/40 rounded-full pointer-events-none z-50 hidden md:block"
        style={{ willChange: "transform" }}
      />
    </>
  );
}
