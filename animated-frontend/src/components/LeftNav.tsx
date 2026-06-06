"use client";

export default function LeftNav() {
  return (
    <div className="fixed left-0 top-0 bottom-0 w-[20%] hidden md:flex flex-col justify-between items-center py-28 z-20 border-r border-white/5 select-none pointer-events-none">
      {/* Department label rotated vertically */}
      <div className="text-[8px] tracking-[0.4em] text-white/30 uppercase rotate-180 [writing-mode:vertical-lr] font-sans font-light">
        DÉPARTEMENT DES ANTIQUITÉS
      </div>

      {/* Center Room Marker */}
      <div className="flex flex-col items-center gap-3">
        <span className="font-serif text-[11px] text-gold tracking-[0.2em] font-medium">SALLE II</span>
        <div className="h-16 w-[1px] bg-gradient-to-b from-gold/40 to-transparent" />
      </div>

      {/* Exhibition dates rotated vertically */}
      <div className="text-[8px] tracking-[0.4em] text-white/30 uppercase [writing-mode:vertical-lr] font-sans font-light">
        EXPOSITION ANNUELLE • PARIS MMXXVI
      </div>
    </div>
  );
}
