import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const cursorDotRef = useRef(null);
  const cursorRingRef = useRef(null);
  const ambientLightRef = useRef(null);

  useEffect(() => {
    const dot = cursorDotRef.current;
    const ring = cursorRingRef.current;
    const ambient = ambientLightRef.current;

    if (!dot || !ring || !ambient) return;

    // Accurate touch device detection
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch) {
      dot.style.display = "none";
      ring.style.display = "none";
      ambient.style.display = "none";
      return;
    }

    // Suppress native cursor on every element
    const styleEl = document.createElement("style");
    styleEl.id = "custom-cursor-hide-native";
    styleEl.textContent = `*, *::before, *::after { cursor: none !important; }`;
    document.head.appendChild(styleEl);

    // Lerp helper
    const lerp = (a, b, t) => a + (b - a) * t;

    // Live mouse position (updated instantly on every mousemove)
    const mouse = { x: -999, y: -999 };

    // Interpolated positions for each layer
    const dotPos = { x: -999, y: -999 };
    const ringPos = { x: -999, y: -999 };
    const ambientPos = { x: -999, y: -999 };

    let hasMovedOnce = false;
    let rafId = null;

    // Hover scale state (managed separately from transform to avoid fighting RAF loop)
    let dotScale = 1;
    let ringScale = 1;
    let dotColor = "#ffffff";
    let ringBorderColor = "rgba(255,255,255,0.4)";
    let ringBg = "transparent";

    const tick = () => {
      // Dot: near-instant (lerp factor 0.9 → feels instantaneous, no jank)
      dotPos.x = lerp(dotPos.x, mouse.x, 0.9);
      dotPos.y = lerp(dotPos.y, mouse.y, 0.9);

      // Ring: smooth trailing effect
      ringPos.x = lerp(ringPos.x, mouse.x, 0.12);
      ringPos.y = lerp(ringPos.y, mouse.y, 0.12);

      // Ambient glow: slowest, dreamlike
      ambientPos.x = lerp(ambientPos.x, mouse.x, 0.07);
      ambientPos.y = lerp(ambientPos.y, mouse.y, 0.07);

      dot.style.transform = `translate(${dotPos.x - 4}px, ${dotPos.y - 4}px) scale(${dotScale})`;
      ring.style.transform = `translate(${ringPos.x - 20}px, ${ringPos.y - 20}px) scale(${ringScale})`;
      ambient.style.transform = `translate(${ambientPos.x - 300}px, ${ambientPos.y - 300}px)`;

      rafId = requestAnimationFrame(tick);
    };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      if (!hasMovedOnce) {
        hasMovedOnce = true;

        // Snap all positions to avoid sliding in from (-999,-999)
        dotPos.x = ringPos.x = ambientPos.x = e.clientX;
        dotPos.y = ringPos.y = ambientPos.y = e.clientY;

        // Fade in
        dot.style.transition = "opacity 0.3s ease";
        ring.style.transition = "opacity 0.3s ease, border-color 0.3s, background-color 0.3s";
        ambient.style.transition = "opacity 0.6s ease";
        dot.style.opacity = "1";
        ring.style.opacity = "1";
        ambient.style.opacity = "0.4";
      }
    };

    rafId = requestAnimationFrame(tick);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // --- Hover effects via CSS transitions (separate from RAF transform) ---
    const isInteractive = (target) =>
      target.tagName === "A" ||
      target.tagName === "BUTTON" ||
      target.closest("a") ||
      target.closest("button") ||
      target.closest("input") ||
      target.closest("textarea") ||
      target.closest("select") ||
      target.classList.contains("interactive");

    const handleMouseOver = (e) => {
      if (!isInteractive(e.target)) return;
      dotScale = 1.5;
      ringScale = 1.6;
      dot.style.backgroundColor = "#c5a880";
      ring.style.borderColor = "#c5a880";
      ring.style.backgroundColor = "rgba(197, 168, 128, 0.05)";
    };

    const handleMouseOut = (e) => {
      if (!isInteractive(e.target)) return;
      dotScale = 1;
      ringScale = 1;
      dot.style.backgroundColor = "#ffffff";
      ring.style.borderColor = "rgba(255,255,255,0.4)";
      ring.style.backgroundColor = "transparent";
    };

    window.addEventListener("mouseover", handleMouseOver, { passive: true });
    window.addEventListener("mouseout", handleMouseOut, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mouseout", handleMouseOut);
      const el = document.getElementById("custom-cursor-hide-native");
      if (el) el.remove();
    };
  }, []);

  return (
    <>
      {/* Ambient glow — follows mouse lazily */}
      <div
        ref={ambientLightRef}
        className="cursor-ambient-light"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 0,
          opacity: 0,
          filter: "blur(130px)",
          mixBlendMode: "screen",
          background:
            "radial-gradient(circle, rgba(197, 168, 128, 0.16) 0%, rgba(5, 5, 5, 0) 70%)",
          willChange: "transform",
        }}
      />

      {/* Inner dot — near-instant tracking */}
      <div
        ref={cursorDotRef}
        className="cursor-dot"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "8px",
          height: "8px",
          backgroundColor: "#ffffff",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 9999,
          opacity: 0,
          transition: "background-color 0.3s, transform 0.1s",
          willChange: "transform",
        }}
      />

      {/* Outer ring — smooth trailing */}
      <div
        ref={cursorRingRef}
        className="cursor-ring"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "40px",
          height: "40px",
          border: "1px solid rgba(255,255,255,0.4)",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 9999,
          opacity: 0,
          willChange: "transform",
        }}
      />
    </>
  );
}
