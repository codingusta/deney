"use client";

import { useEffect, useRef, useState } from "react";
import { isChromiumBrowser } from "./liquid-glass";
import { registerFilterSize } from "./GlassFilterHost";

export default function GlassCard({
  children,
  className = "",
  style = {},
  isDragging = false,
  isDone = false,
  ...props
}) {
  const cardRef = useRef(null);
  const [filterKey, setFilterKey] = useState("");
  const [isChromium, setIsChromium] = useState(true);
  const rafRef = useRef(null);

  useEffect(() => {
    setIsChromium(isChromiumBrowser());
  }, []);

  // Track card dimensions with debounced ResizeObserver to cache SVG displacement map
  useEffect(() => {
    if (!cardRef.current) return;
    const element = cardRef.current;

    let timeoutId = null;
    const ro = new ResizeObserver((entries) => {
      if (!entries[0]) return;
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const { width, height } = entries[0].contentRect;
        if (width > 0 && height > 0) {
          const key = registerFilterSize(width, height);
          setFilterKey(key);
        }
      }, 100);
    });

    ro.observe(element);
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      ro.disconnect();
    };
  }, []);

  // Pointer-following specular reflection using CSS variables --mx, --my
  function handlePointerMove(e) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (cardRef.current) {
        cardRef.current.style.setProperty("--mx", `${x.toFixed(1)}%`);
        cardRef.current.style.setProperty("--my", `${y.toFixed(1)}%`);
      }
    });
  }

  function handlePointerLeave() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (cardRef.current) {
      cardRef.current.style.setProperty("--mx", "50%");
      cardRef.current.style.setProperty("--my", "50%");
    }
  }

  const glassFilterStyle =
    isChromium && filterKey
      ? `url(#glass-disp-${filterKey}) blur(calc(8px - (var(--glass-t, 65) / 100) * 3px)) saturate(175%) brightness(1.04)`
      : `blur(calc(8px - (var(--glass-t, 65) / 100) * 3px)) saturate(175%) brightness(1.04)`;

  return (
    <div
      ref={cardRef}
      className={`glass-card-container relative overflow-visible ${isDone ? "glass-done" : ""} ${
        isDragging ? "glass-dragging" : ""
      } ${className}`}
      style={{
        ...style,
        backdropFilter: glassFilterStyle,
        WebkitBackdropFilter: glassFilterStyle,
      }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      {...props}
    >
      {/* Specular sheen highlight layer tracking cursor position */}
      <div className="glass-specular-highlight" aria-hidden="true" />
      {/* Inner glass bezel glow */}
      <div className="glass-bezel-glow" aria-hidden="true" />
      {/* Actual task content */}
      <div className="glass-content-layer relative z-10">{children}</div>
    </div>
  );
}
