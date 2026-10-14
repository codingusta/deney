"use client";

import { motion, AnimatePresence } from "motion/react";
import { SlidersHorizontal, RotateCcw, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Button from "./Button";

export default function GlassSettingsPopover({ glass, onUpdate }) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);
  const triggerRef = useRef(null);

  const transparency = glass?.transparency ?? 65;
  const refraction = glass?.refraction ?? 60;

  // Sync initial and prop changes to CSS variables & SVG filter scales
  useEffect(() => {
    document.documentElement.style.setProperty("--glass-t", String(transparency));
    document.documentElement.style.setProperty("--glass-refraction", String(refraction));
    updateSvgFilterScales(refraction);
  }, [transparency, refraction]);

  function updateSvgFilterScales(refractionVal) {
    const baseScale = (refractionVal / 100) * 26;
    const redScale = (baseScale * 1.0).toFixed(2);
    const greenScale = (baseScale * 0.94).toFixed(2);
    const blueScale = (baseScale * 0.88).toFixed(2);

    document.querySelectorAll(".glass-disp-red").forEach((el) => el.setAttribute("scale", redScale));
    document.querySelectorAll(".glass-disp-green").forEach((el) => el.setAttribute("scale", greenScale));
    document.querySelectorAll(".glass-disp-blue").forEach((el) => el.setAttribute("scale", blueScale));
  }

  function handleTransparencyChange(value) {
    const num = Math.min(100, Math.max(0, Number(value)));
    document.documentElement.style.setProperty("--glass-t", String(num));
    onUpdate({ transparency: num });
  }

  function handleRefractionChange(value) {
    const num = Math.min(100, Math.max(0, Number(value)));
    document.documentElement.style.setProperty("--glass-refraction", String(num));
    updateSvgFilterScales(num);
    onUpdate({ refraction: num });
  }

  function handleReset() {
    handleTransparencyChange(65);
    handleRefractionChange(60);
  }

  // Handle click outside and Escape key
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    function handleClickOutside(event) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("pointerdown", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("pointerdown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="glass-popover-wrapper relative inline-block">
      <Button
        ref={triggerRef}
        type="button"
        className="glass-settings-button inline-flex items-center gap-2"
        aria-label="Cam görünümü ayarlarını aç"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <SlidersHorizontal size={16} aria-hidden="true" />
        <span>Cam ayarı</span>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={popoverRef}
            role="dialog"
            aria-label="Cam görünümü ayarları"
            aria-modal="true"
            className="glass-popover-panel"
            initial={{ opacity: 0, scale: 0.94, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <div className="glass-popover-header">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={15} className="text-[var(--accent)]" aria-hidden="true" />
                <h3 className="glass-popover-title">Cam Ayarları</h3>
              </div>
              <button
                type="button"
                className="glass-popover-close"
                aria-label="Ayarları kapat"
                onClick={() => setIsOpen(false)}
              >
                <X size={15} aria-hidden="true" />
              </button>
            </div>

            <p className="glass-popover-desc">
              Kartların şeffaflık ve kenar bükülme (refraksiyon) oranını gerçek zamanlı ayarla.
            </p>

            <div className="glass-popover-controls">
              <div className="glass-slider-row">
                <div className="glass-slider-meta">
                  <label htmlFor="glass-transparency-slider">Şeffaflık</label>
                  <span className="glass-slider-value">%{transparency}</span>
                </div>
                <input
                  id="glass-transparency-slider"
                  type="range"
                  min="0"
                  max="100"
                  value={transparency}
                  aria-label="Şeffaflık oranı"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={transparency}
                  className="glass-slider"
                  onChange={(e) => handleTransparencyChange(e.target.value)}
                />
              </div>

              <div className="glass-slider-row">
                <div className="glass-slider-meta">
                  <label htmlFor="glass-refraction-slider">Kırılma şiddeti</label>
                  <span className="glass-slider-value">%{refraction}</span>
                </div>
                <input
                  id="glass-refraction-slider"
                  type="range"
                  min="0"
                  max="100"
                  value={refraction}
                  aria-label="Kırılma şiddeti oranı"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={refraction}
                  className="glass-slider"
                  onChange={(e) => handleRefractionChange(e.target.value)}
                />
              </div>
            </div>

            <div className="glass-popover-footer">
              <Button
                type="button"
                className="glass-reset-button"
                aria-label="Cam ayarlarını sıfırla"
                onClick={handleReset}
              >
                <RotateCcw size={14} aria-hidden="true" />
                <span>Sıfırla</span>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
