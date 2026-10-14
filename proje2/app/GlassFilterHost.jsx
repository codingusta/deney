"use client";

import { useEffect, useState } from "react";
import { generateDisplacementMapDataUrl } from "./liquid-glass";

// Shared registry of card dimensions to generate filters for
const registeredSizes = new Map();
let listeners = [];

export function registerFilterSize(width, height) {
  const roundedW = Math.round(width);
  const roundedH = Math.round(height);
  const key = `${roundedW}x${roundedH}`;

  if (roundedW > 0 && roundedH > 0 && !registeredSizes.has(key)) {
    const dataUrl = generateDisplacementMapDataUrl(roundedW, roundedH);
    registeredSizes.set(key, { key, width: roundedW, height: roundedH, href: dataUrl });
    listeners.forEach((fn) => fn(Array.from(registeredSizes.values())));
  }
  return key;
}

export default function GlassFilterHost() {
  const [filters, setFilters] = useState([]);

  useEffect(() => {
    listeners.push(setFilters);
    setFilters(Array.from(registeredSizes.values()));
    return () => {
      listeners = listeners.filter((fn) => fn !== setFilters);
    };
  }, []);

  return (
    <svg
      id="liquid-glass-svg-host"
      aria-hidden="true"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden", pointerEvents: "none" }}
    >
      <defs>
        {filters.map(({ key, href }) => (
          <filter key={key} id={`glass-disp-${key}`} x="-5%" y="-5%" width="110%" height="110%">
            <feImage href={href} result="dispMap" />
            <feDisplacementMap
              className="glass-disp-red"
              in="SourceGraphic"
              in2="dispMap"
              scale="15.6"
              xChannelSelector="R"
              yChannelSelector="G"
              result="dispRed"
            />
            <feDisplacementMap
              className="glass-disp-green"
              in="SourceGraphic"
              in2="dispMap"
              scale="14.6"
              xChannelSelector="R"
              yChannelSelector="G"
              result="dispGreen"
            />
            <feDisplacementMap
              className="glass-disp-blue"
              in="SourceGraphic"
              in2="dispMap"
              scale="13.7"
              xChannelSelector="R"
              yChannelSelector="G"
              result="dispBlue"
            />
            <feColorMatrix
              in="dispRed"
              type="matrix"
              values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
              result="r"
            />
            <feColorMatrix
              in="dispGreen"
              type="matrix"
              values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
              result="g"
            />
            <feColorMatrix
              in="dispBlue"
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
              result="b"
            />
            <feComposite in="r" in2="g" operator="lighter" result="rg" />
            <feComposite in="rg" in2="b" operator="lighter" />
          </filter>
        ))}
      </defs>
    </svg>
  );
}
