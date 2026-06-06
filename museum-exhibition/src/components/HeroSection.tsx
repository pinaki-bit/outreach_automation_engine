"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ArrowDown } from "lucide-react";
import Scene3D from "./Scene3D";

export default function HeroSection() {
  const titleRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Letter reveal animation using GSAP
    const chars = titleRef.current?.querySelectorAll(".char");
    if (chars) {
      gsap.fromTo(
        chars,
        { y: 150, rotateX: -40, opacity: 0 },
        {
          y: 0,
          rotateX: 0,
          opacity: 1,
          duration: 1.6,
          ease: "power4.out",
          stagger: 0.08,
          delay: 1.4, // Triggers after the loader slides up
        }
      );
    }

    // Fade in right descriptions and action elements
    if (descRef.current && footerRef.current) {
      gsap.fromTo(
        [descRef.current.children, footerRef.current.children],
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "power3.out",
          stagger: 0.1,
          delay: 2.0,
        }
      );
    }
  }, []);

  const titleText = "AETERNA";

  return (
    <section className="relative w-full h-screen overflow-hidden bg-luxury-black select-none flex items-center">
      {/* 3D Scene containing the statue & halo ring */}
      <Scene3D />

      {/* Grid Layout conforming to vertical dividing lines */}
      <div className="relative w-full h-full grid grid-cols-5 z-10 px-6 md:px-0">
        
        {/* Left Column (0% to 20%) - LeftNav occupies this space */}
        <div className="col-span-1 hidden md:block" />

        {/* Center Columns (20% to 80%) - Hero Heading & 3D Centerpiece */}
        <div className="col-span-5 md:col-span-3 flex flex-col justify-center items-center relative">
          
          {/* Overlapping massive editorial title */}
          <div className="overflow-hidden py-4 text-center">
            <h1
              ref={titleRef}
              className="font-serif text-[16vw] md:text-[11vw] font-light leading-none tracking-[0.05em] text-white flex justify-center items-center pointer-events-none select-none perspective-[1000px]"
            >
              {titleText.split("").map((char, index) => (
                <span
                  key={index}
                  className="char inline-block origin-bottom transform-gpu will-change-transform"
                >
                  {char}
                </span>
              ))}
            </h1>
          </div>

          {/* Subtitle / Department Info under Title (Center-aligned) */}
          <div className="absolute bottom-[28%] text-center pointer-events-none">
            <span className="font-serif text-[10px] sm:text-xs tracking-[0.4em] text-gold uppercase opacity-80">
              ANTIQUES DE L&#39;EMPIRE ROMAIN
            </span>
          </div>
        </div>

        {/* Right Column (80% to 100%) - Small descriptive metadata */}
        <div className="col-span-5 md:col-span-1 hidden md:flex flex-col justify-between py-28 pr-12 pl-6 border-l border-white/5">
          <div /> {/* Spacer */}
          
          <div ref={descRef} className="flex flex-col gap-6 text-left">
            <span className="font-serif text-xs text-gold tracking-widest uppercase">
              EXHIBIT NO. II
            </span>
            <p className="font-sans text-[10px] leading-relaxed text-white/50 tracking-wider uppercase font-light">
              An immersive exploration of classical Roman craftsmanship. The centerpiece marble sculpture represents the eternal flow of mortal beauty preserved in stone.
            </p>
            <div className="h-[1px] w-12 bg-white/20" />
            <span className="font-sans text-[9px] tracking-widest text-white/40 uppercase">
              HEIGHT: 184 CM <br />
              ORIGIN: ROME, II CENTURY
            </span>
          </div>

          <div /> {/* Spacer */}
        </div>
      </div>

      {/* Bottom controls & indicator */}
      <div
        ref={footerRef}
        className="absolute bottom-12 left-6 md:left-[25%] right-6 md:right-12 z-20 flex justify-between items-center select-none"
      >
        {/* Scroll hint button */}
        <button
          onClick={() => {
            const nextSec = document.querySelector("#collections");
            nextSec?.scrollIntoView({ behavior: "smooth" });
          }}
          className="flex items-center gap-3 group text-white/50 hover:text-gold transition-colors duration-300 interactive"
        >
          <span className="font-sans text-[9px] tracking-[0.25em] uppercase font-light group-hover:translate-y-1 transition-transform duration-300">
            Scroll to Enter
          </span>
          <ArrowDown size={14} className="group-hover:translate-y-1 transition-transform duration-300 text-gold" />
        </button>

        {/* Current status */}
        <div className="hidden sm:flex items-center gap-4 text-white/40">
          <span className="text-[9px] tracking-[0.2em] uppercase font-light">ROOM 02</span>
          <span className="w-1.5 h-1.5 rounded-full bg-gold animate-ping" />
        </div>
      </div>
    </section>
  );
}
