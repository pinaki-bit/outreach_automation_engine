import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function GridLines() {
  const containerRef = useRef(null);

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
    <div ref={containerRef} className="grid-lines-container">
      <div className="grid-line-vertical grid-line-20" />
      <div className="grid-line-vertical grid-line-40" />
      <div className="grid-line-vertical grid-line-60" />
      <div className="grid-line-vertical grid-line-80" />
    </div>
  );
}
