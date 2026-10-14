"use client";

import { motion, useMotionValue } from "framer-motion";
import { useEffect } from "react";

export default function AmbientBackdrop() {
  const pointerX = useMotionValue(-900);
  const pointerY = useMotionValue(-900);
  useEffect(() => {
    function moveSpotlight(event) {
      pointerX.set(event.clientX);
      pointerY.set(event.clientY);
    }

    window.addEventListener("pointermove", moveSpotlight, { passive: true });
    return () => window.removeEventListener("pointermove", moveSpotlight);
  }, [pointerX, pointerY]);

  return (
    <div className="ambient-backdrop" aria-hidden="true">
      <motion.div className="ambient-spotlight" style={{ x: pointerX, y: pointerY }} />
      <span className="ambient-mesh ambient-mesh-one" />
      <span className="ambient-mesh ambient-mesh-two" />
      <span className="ambient-mesh ambient-mesh-three" />
      <span className="ambient-beam ambient-beam-one" />
      <span className="ambient-beam ambient-beam-two" />
      <span className="ambient-grid" />
    </div>
  );
}
