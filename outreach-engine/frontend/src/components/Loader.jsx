import { useEffect, useState, useRef } from "react";
import gsap from "gsap";

export default function Loader({ onComplete }) {
  const [count, setCount] = useState(0);
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const bottomRef = useRef(null);

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
      duration: 2.2,
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
  const formatCount = (num) => {
    return num.toString().padStart(3, "0");
  };

  return (
    <div
      ref={containerRef}
      className="loader-container"
    >
      {/* Top Section */}
      <div className="loader-top">
        <div ref={titleRef} className="loader-title">
          EAZYREACH OUTREACH ENGINE
        </div>
        <p
          ref={subtitleRef}
          className="loader-subtitle"
        >
          AI-Powered Personalization & Lead Generation Core.
        </p>
      </div>

      {/* Mid Center Section */}
      <div className="loader-mid">
        <div className="overflow-hidden">
          <h1 className="loader-count">
            {formatCount(count)}
          </h1>
        </div>
      </div>

      {/* Bottom Footer Section */}
      <div
        ref={bottomRef}
        className="loader-bottom"
      >
        <span className="loader-bottom-left">
          INITIALIZING SECURE TELEMETRY PIPELINE
        </span>
        <span className="loader-bottom-right">
          EST. MMXXVI
        </span>
      </div>
    </div>
  );
}
