"use client";

const filterCache = new Map();

/**
 * Check if running in a Chromium-based browser (Chrome, Edge, Opera, etc.)
 */
export function isChromiumBrowser() {
  if (typeof window === "undefined") return true;
  const brands = window.navigator?.userAgentData?.brands;
  if (Array.isArray(brands) && brands.length > 0) {
    return brands.some((b) =>
      ["Chromium", "Google Chrome", "Microsoft Edge", "Brave"].some((name) =>
        b.brand.toLowerCase().includes(name.toLowerCase())
      )
    );
  }
  const ua = window.navigator?.userAgent || "";
  return (
    /Chrome|Chromium|Edg/i.test(ua) &&
    !/Firefox|FxiOS|Safari/i.test(ua.replace(/Chrome|Chromium|Edg/gi, ""))
  );
}

/**
 * Generates an SVG displacement map data URL using a 2D canvas based on Snell's law
 * and a convex squircle surface profile across the card bezel.
 */
export function generateDisplacementMapDataUrl(rawWidth, rawHeight, radius = 26) {
  const width = Math.max(80, Math.round(rawWidth));
  const height = Math.max(40, Math.round(rawHeight));
  const cacheKey = `${width}x${height}`;

  if (filterCache.has(cacheKey)) {
    return filterCache.get(cacheKey);
  }

  if (typeof document === "undefined") return "";

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  const R = Math.min(radius, Math.min(width, height) / 2);
  const B = Math.min(22, Math.min(width, height) * 0.3); // bezel width
  const cx = width / 2;
  const cy = height / 2;
  const halfW = width / 2;
  const halfH = height / 2;
  const innerHalfW = halfW - R;
  const innerHalfH = halfH - R;

  const n = 1.5; // refractive index of glass

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      // Distance to rounded rectangle boundary (SDF)
      const qx = Math.abs(x - cx) - innerHalfW;
      const qy = Math.abs(y - cy) - innerHalfH;

      let distToEdge;
      let nx = 0;
      let ny = 0;

      if (qx <= 0 && qy <= 0) {
        // Inside central flat rectangular area
        distToEdge = Math.min(-qx, -qy) + R;
        nx = -qx < -qy ? (x < cx ? -1 : 1) : 0;
        ny = -qy <= -qx ? (y < cy ? -1 : 1) : 0;
      } else if (qx > 0 && qy <= 0) {
        // Left or right straight edge
        distToEdge = R - qx;
        nx = x < cx ? -1 : 1;
        ny = 0;
      } else if (qx <= 0 && qy > 0) {
        // Top or bottom straight edge
        distToEdge = R - qy;
        nx = 0;
        ny = y < cy ? -1 : 1;
      } else {
        // Rounded corner
        const cornerDist = Math.hypot(qx, qy);
        distToEdge = R - cornerDist;
        const invLen = 1 / (cornerDist || 1);
        nx = qx * invLen * (x < cx ? -1 : 1);
        ny = qy * invLen * (y < cy ? -1 : 1);
      }

      // Default neutral (R=128, G=128 => zero displacement in feDisplacementMap)
      if (distToEdge < 0 || distToEdge >= B) {
        data[idx] = 128;
        data[idx + 1] = 128;
        data[idx + 2] = 128;
        data[idx + 3] = 255;
        continue;
      }

      // Inside the bezel zone:
      // t in [0, 1]: 0 at inner clear boundary, 1 at outer edge
      const t = 1 - distToEdge / B;

      // Convex squircle profile: h(t) = (1 - (1 - t)^4)^(1/4)
      const oneMinusT = 1 - t;
      const oneMinusT4 = 1 - Math.pow(oneMinusT, 4);
      const denom = Math.pow(Math.max(1e-6, oneMinusT4), 0.75);
      const slope = Math.pow(oneMinusT, 3) / denom;

      // Snell's Law: sin(theta1) = slope / sqrt(1 + slope^2)
      const sinTheta1 = slope / Math.sqrt(1 + slope * slope);
      const sinTheta2 = Math.min(0.999, n * sinTheta1);
      const theta1 = Math.asin(sinTheta1);
      const theta2 = Math.asin(sinTheta2);
      const deltaTheta = theta2 - theta1;

      // Normalized displacement magnitude (compresses background inward like a lens)
      const magnitude = Math.sin(deltaTheta);

      // Inward displacement vectors
      const dispX = -nx * magnitude;
      const dispY = -ny * magnitude;

      // Encode into R and G (128 is neutral, 0-255 range)
      data[idx] = Math.round(128 + 127 * Math.max(-1, Math.min(1, dispX)));
      data[idx + 1] = Math.round(128 + 127 * Math.max(-1, Math.min(1, dispY)));
      data[idx + 2] = 128;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  const dataUrl = canvas.toDataURL("image/png");
  filterCache.set(cacheKey, dataUrl);
  return dataUrl;
}
