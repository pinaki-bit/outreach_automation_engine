"use client";

import { useEffect, useState, useRef } from "react";
import gsap from "gsap";

interface LoaderProps {
  onComplete: () => void;
}

export default function Loader({ onComplete }: LoaderProps) {
  const [count, setCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obj = { value: 0 };
    
    // Timeline to coordinate percentage count-up and the exit transition
    const tl = gsap.timeline({
      onComplete: () => {
        // Slide out loader panel
        gsap.to(containerRef.current, {
          yPercent: -100,
          duration: 1.4,
          ease: "power4.inOut",
          onComplete: onComplete,
        });
      },
    });

    // Animate percentage count
    tl.to(obj, {
      value: 100,
      duration: 3,
      ease: "power2.out",
      onUpdate: () => {
        setCount(Math.floor(obj.value));
      },
    });

    // Intro reveals for loading text
    gsap.fromTo(
      [titleRef.current, subtitleRef.current, bottomRef.current],
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: "power3.out",
        stagger: 0.15,
        delay: 0.1,
      }
    );

    return () => {
      tl.kill();
    };
  }, [onComplete]);

  // Format as 3-digit strings e.g. 001, 045, 100
  const formatCount = (num: number) => {
    return num.toString().padStart(3, "0");
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-luxury-black z-[9999] flex flex-col justify-between p-8 md:p-16 select-none"
    >
      {/* Top Section */}
      <div className="flex justify-between items-start w-full">
        <div ref={titleRef} className="font-serif text-sm tracking-[0.25em] text-gold uppercase">
          L&#39;EXPOSITION D&#39;ART CLASSIQUE
        </div>
        <p
          ref={subtitleRef}
          className="font-sans text-[10px] tracking-[0.2em] text-white/50 uppercase max-w-[220px] text-right leading-relaxed hidden sm:block"
        >
          Curated marble collections of the Roman & Greek eras.
        </p>
      </div>

      {/* Mid Center Section */}
      <div className="flex flex-col items-start justify-center flex-grow">
        <div className="overflow-hidden">
          <h1 className="font-serif text-[18vw] sm:text-[12vw] leading-none text-white font-light tracking-tighter">
            {formatCount(count)}
          </h1>
        </div>
      </div>

      {/* Bottom Footer Section */}
      <div
        ref={bottomRef}
        className="flex justify-between items-end border-t border-white/10 pt-6 w-full"
      >
        <span className="font-sans text-[10px] tracking-[0.2em] text-white/40 uppercase">
          Loading Exhibition Assets
        </span>
        <span className="font-serif text-[10px] tracking-[0.2em] text-gold uppercase italic">
          Est. MDCCXCIII
        </span>
      </div>
    </div>
  );
}
