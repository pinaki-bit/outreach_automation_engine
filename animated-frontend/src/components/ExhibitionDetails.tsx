"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, Clock, MapPin, Compass } from "lucide-react";

// Register GSAP ScrollTrigger
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ExhibitionDetails() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const imgContainer1Ref = useRef<HTMLDivElement>(null);
  const img1Ref = useRef<HTMLImageElement>(null);

  const imgContainer2Ref = useRef<HTMLDivElement>(null);
  const img2Ref = useRef<HTMLImageElement>(null);

  const quoteRef = useRef<HTMLDivElement>(null);
  const gridSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Parallax Scroll on Image 1 (Roman Relief)
    if (img1Ref.current && imgContainer1Ref.current) {
      gsap.fromTo(
        img1Ref.current,
        { yPercent: -15, scale: 1.15 },
        {
          yPercent: 15,
          scale: 1.0,
          ease: "none",
          scrollTrigger: {
            trigger: imgContainer1Ref.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    }

    // 2. Parallax Scroll on Image 2 (Greek Torso)
    if (img2Ref.current && imgContainer2Ref.current) {
      gsap.fromTo(
        img2Ref.current,
        { yPercent: -15, scale: 1.15 },
        {
          yPercent: 15,
          scale: 1.0,
          ease: "none",
          scrollTrigger: {
            trigger: imgContainer2Ref.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    }

    // 3. Staggered reveal for curatorial quotes and headings
    if (quoteRef.current) {
      gsap.fromTo(
        quoteRef.current.querySelectorAll(".reveal-text"),
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.4,
          ease: "power3.out",
          stagger: 0.2,
          scrollTrigger: {
            trigger: quoteRef.current,
            start: "top 80%",
          },
        }
      );
    }

    // 4. Staggered reveal for details grid card elements
    if (gridSectionRef.current) {
      gsap.fromTo(
        gridSectionRef.current.querySelectorAll(".grid-card"),
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: "power3.out",
          stagger: 0.15,
          scrollTrigger: {
            trigger: gridSectionRef.current,
            start: "top 85%",
          },
        }
      );
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-[#050505] text-white z-10 overflow-hidden"
    >
      {/* Decorative vertical divider line overrides matching parent layout */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="grid-line-vertical left-[20%] opacity-50 hidden md:block" />
        <div className="grid-line-vertical left-[40%] opacity-50 hidden md:block" />
        <div className="grid-line-vertical left-[60%] opacity-50 hidden md:block" />
        <div className="grid-line-vertical left-[80%] opacity-50 hidden md:block" />
      </div>

      {/* ================= SECTION: COLLECTIONS ================= */}
      <section id="collections" className="w-full min-h-screen py-32 grid grid-cols-5 relative px-6 md:px-0">
        {/* Left Column Spacer */}
        <div className="col-span-1 hidden md:block" />

        {/* Center Content */}
        <div className="col-span-5 md:col-span-3 flex flex-col gap-24">
          
          {/* Header */}
          <div className="flex flex-col gap-6 select-none">
            <span className="font-sans text-[10px] tracking-[0.3em] text-gold uppercase font-light">
              ARCHIVES DE LA PIERRE
            </span>
            <h2 className="font-serif text-5xl md:text-7xl font-light tracking-tight leading-none text-white uppercase">
              The Collection
            </h2>
            <div className="h-[1px] w-24 bg-gold mt-2" />
          </div>

          {/* Exhibition Item 1 (Roman Relief) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Image Box */}
            <div
              ref={imgContainer1Ref}
              className="lg:col-span-7 relative h-[380px] sm:h-[480px] overflow-hidden rounded-[2px] bg-luxury-grey group cursor-crosshair border border-white/5"
            >
              <Image
                ref={img1Ref}
                src="/roman_relief.png"
                alt="Mythological Roman Relief"
                fill
                className="object-cover transition-transform duration-700 ease-out brightness-95 group-hover:brightness-100 transform-gpu"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {/* Overlay shading */}
              <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-transparent to-transparent opacity-40 pointer-events-none" />
            </div>

            {/* Description Info */}
            <div className="lg:col-span-5 flex flex-col justify-center gap-6 lg:pl-8">
              <div className="flex items-center gap-4">
                <span className="font-serif text-sm text-gold italic">01 /</span>
                <span className="font-sans text-[10px] tracking-[0.25em] text-white/50 uppercase">
                  RELIEF
                </span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl text-white font-light uppercase tracking-wider">
                Mythological Relievo
              </h3>
              <p className="font-sans text-[11px] leading-relaxed text-white/50 tracking-wide font-light">
                A masterpiece displaying elaborate relief carving detailing epic Roman mythologies. Features rich textural weathering and intricate details preserved for two millennia.
              </p>
              <div className="h-[1px] w-12 bg-white/20" />
              <button className="flex items-center gap-3 text-[10px] tracking-widest text-gold uppercase hover:text-white transition-colors duration-300 group select-none text-left w-fit interactive">
                Examine Artifact
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>

          </div>

          {/* Exhibition Item 2 (Greek Torso) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-12">
            
            {/* Description Info (Left side on desktop) */}
            <div className="lg:col-span-5 order-2 lg:order-1 flex flex-col justify-center gap-6 lg:pr-8">
              <div className="flex items-center gap-4">
                <span className="font-serif text-sm text-gold italic">02 /</span>
                <span className="font-sans text-[10px] tracking-[0.25em] text-white/50 uppercase">
                  TORSO
                </span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl text-white font-light uppercase tracking-wider">
                Hellenic Male Bust
              </h3>
              <p className="font-sans text-[11px] leading-relaxed text-white/50 tracking-wide font-light">
                Rendered in exquisite Pentelic marble, this torso illustrates the zenith of Greek anatomical realism. Highlighted by deep lighting contrasts that sculpt structural contours.
              </p>
              <div className="h-[1px] w-12 bg-white/20" />
              <button className="flex items-center gap-3 text-[10px] tracking-widest text-gold uppercase hover:text-white transition-colors duration-300 group select-none text-left w-fit interactive">
                Examine Artifact
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>

            {/* Image Box */}
            <div
              ref={imgContainer2Ref}
              className="lg:col-span-7 order-1 lg:order-2 relative h-[380px] sm:h-[480px] overflow-hidden rounded-[2px] bg-luxury-grey group cursor-crosshair border border-white/5"
            >
              <Image
                ref={img2Ref}
                src="/marble_torso.png"
                alt="Pentelic Greek Torso"
                fill
                className="object-cover transition-transform duration-700 ease-out brightness-95 group-hover:brightness-100 transform-gpu"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-transparent to-transparent opacity-40 pointer-events-none" />
            </div>

          </div>

        </div>

        {/* Right Column Spacer */}
        <div className="col-span-1 hidden md:block" />
      </section>

      {/* ================= SECTION: CURATORIAL STATEMENT ================= */}
      <section ref={quoteRef} className="w-full py-40 bg-luxury-dark-grey border-y border-white/5 relative px-6 md:px-0">
        <div className="w-full grid grid-cols-5">
          <div className="col-span-1 hidden md:block" />
          
          <div className="col-span-5 md:col-span-3 flex flex-col justify-center items-center text-center gap-8 py-12">
            <Compass className="text-gold w-10 h-10 mb-4 animate-spin-slow" />
            <div className="overflow-hidden">
              <p className="reveal-text font-serif text-2xl sm:text-3xl md:text-4xl font-light tracking-wide text-white/90 leading-relaxed max-w-4xl uppercase">
                &ldquo;Stone does not decay; it merely waits for light to rewrite its contours.&rdquo;
              </p>
            </div>
            <div className="overflow-hidden">
              <span className="reveal-text font-sans text-[10px] tracking-[0.3em] text-gold uppercase block mt-2">
                — ANTOINE DE SAINT-EXUPÉRY, ARCHIVES DU LOUVRE
              </span>
            </div>
          </div>
          
          <div className="col-span-1 hidden md:block" />
        </div>
      </section>

      {/* ================= SECTION: DETAILS GRID ================= */}
      <section ref={gridSectionRef} className="w-full py-32 px-6 md:px-0">
        <div className="grid grid-cols-5">
          <div className="col-span-1 hidden md:block" />
          
          <div className="col-span-5 md:col-span-3 flex flex-col gap-16">
            <h3 className="font-serif text-3xl text-white font-light uppercase tracking-wider">
              Exhibition Parameters
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {/* Card 1 */}
              <div className="grid-card p-8 bg-white/5 border border-white/10 hover:border-gold/30 rounded-[2px] flex flex-col gap-4 transition-all duration-500 hover:-translate-y-2">
                <span className="font-serif text-lg text-gold font-light">01 / DURATION</span>
                <p className="font-sans text-[10px] tracking-wider text-white/50 leading-relaxed uppercase">
                  From June 06 to September 09. Open daily except Tuesdays. Evening visit slots available.
                </p>
              </div>

              {/* Card 2 */}
              <div className="grid-card p-8 bg-white/5 border border-white/10 hover:border-gold/30 rounded-[2px] flex flex-col gap-4 transition-all duration-500 hover:-translate-y-2">
                <span className="font-serif text-lg text-gold font-light">02 / CURATORS</span>
                <p className="font-sans text-[10px] tracking-wider text-white/50 leading-relaxed uppercase">
                  Co-produced by the Department of Greek & Roman Antiquities and the Obys Agency.
                </p>
              </div>

              {/* Card 3 */}
              <div className="grid-card p-8 bg-white/5 border border-white/10 hover:border-gold/30 rounded-[2px] flex flex-col gap-4 transition-all duration-500 hover:-translate-y-2">
                <span className="font-serif text-lg text-gold font-light">03 / SOUNDSCAPE</span>
                <p className="font-sans text-[10px] tracking-wider text-white/50 leading-relaxed uppercase">
                  Features an immersive binaural ambient score composed by Paris-based avant-garde artists.
                </p>
              </div>
            </div>
          </div>
          
          <div className="col-span-1 hidden md:block" />
        </div>
      </section>

      {/* ================= SECTION: VISIT ================= */}
      <section id="visit" className="w-full py-32 bg-luxury-dark-grey border-t border-white/5 px-6 md:px-0">
        <div className="grid grid-cols-5">
          <div className="col-span-1 hidden md:block" />
          
          <div className="col-span-5 md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-16">
            
            {/* Visit text */}
            <div className="flex flex-col justify-between gap-8">
              <div className="flex flex-col gap-6">
                <span className="font-sans text-[10px] tracking-[0.3em] text-gold uppercase">
                  VISITEZ LA GALERIE
                </span>
                <h3 className="font-serif text-4xl sm:text-5xl font-light uppercase tracking-wide leading-none">
                  Experience <br />
                  in Person
                </h3>
                <p className="font-sans text-[11px] leading-relaxed text-white/50 tracking-wider font-light">
                  Tickets must be reserved online prior to entry. Access includes both the permanent classical galleries and the Aeterna temporary sculpture pavilion.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4 text-white/60">
                  <MapPin size={16} className="text-gold" />
                  <span className="font-sans text-[10px] tracking-widest uppercase">
                    Aeterna Pavilion, Wing B, Paris
                  </span>
                </div>
                <div className="flex items-center gap-4 text-white/60">
                  <Clock size={16} className="text-gold" />
                  <span className="font-sans text-[10px] tracking-widest uppercase">
                    Daily 09:00 — 18:00 (Tuesdays Closed)
                  </span>
                </div>
              </div>
            </div>

            {/* Visit card forms / buttons */}
            <div className="flex flex-col justify-center items-stretch gap-6 bg-white/5 border border-white/10 p-10 rounded-[2px]">
              <h4 className="font-serif text-xl text-white font-light tracking-wide uppercase text-center">
                Reserve Exhibition Pass
              </h4>
              <p className="font-sans text-[9px] tracking-widest text-center text-white/40 uppercase">
                GUARANTEE ENTRY BY PRE-BOOKING SESSIONS
              </p>
              
              <div className="flex flex-col gap-3 mt-4">
                <button className="w-full py-4 bg-gold hover:bg-gold-hover text-luxury-black font-sans text-[10px] font-bold tracking-[0.25em] uppercase transition-colors duration-300 interactive rounded-[2px]">
                  Book General Admission
                </button>
                <button className="w-full py-4 border border-white/20 hover:border-gold hover:text-gold bg-transparent text-white font-sans text-[10px] tracking-[0.25em] uppercase transition-all duration-300 interactive rounded-[2px]">
                  VIP Night Pass
                </button>
              </div>

              <span className="text-[8px] tracking-widest text-center text-white/30 uppercase mt-2">
                FREE FOR ART & ARCHAEOLOGY STUDENTS WITH VALID ID
              </span>
            </div>

          </div>

          <div className="col-span-1 hidden md:block" />
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-16 border-t border-white/5 px-6 md:px-0 bg-luxury-black">
        <div className="grid grid-cols-5">
          <div className="col-span-1 hidden md:block" />
          
          <div className="col-span-5 md:col-span-3 flex flex-col sm:flex-row justify-between items-center gap-8">
            <span className="font-serif text-sm tracking-[0.25em] uppercase text-white/50">
              MUSEION
            </span>
            <span className="font-sans text-[8px] tracking-[0.3em] text-white/30 uppercase">
              © 2026 MUSEION PARIS • ARCHITECTURAL BRANDING BY OBYS AGENCY
            </span>
            <div className="flex gap-6">
              <a href="#" className="font-sans text-[9px] tracking-widest text-white/40 hover:text-gold transition-colors duration-300 uppercase interactive">
                Terms
              </a>
              <a href="#" className="font-sans text-[9px] tracking-widest text-white/40 hover:text-gold transition-colors duration-300 uppercase interactive">
                Privacy
              </a>
            </div>
          </div>

          <div className="col-span-1 hidden md:block" />
        </div>
      </footer>
    </div>
  );
}
