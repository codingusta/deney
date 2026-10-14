"use client";

export default function GlassSceneLayer() {
  return (
    <div
      className="glass-scene-layer absolute inset-0 overflow-hidden pointer-events-none select-none"
      aria-hidden="true"
    >
      {/* Soft gradient light blooms */}
      <div className="scene-blob scene-blob-1" />
      <div className="scene-blob scene-blob-2" />
      <div className="scene-blob scene-blob-3" />

      {/* Subtle fine geometric refraction grid */}
      <div className="scene-grid" />

      {/* Pale background typographic elements for edge lens distortion */}
      <div className="scene-typography">
        <span className="scene-word scene-word-1">TASKS</span>
        <span className="scene-word scene-word-2">FOCUS</span>
        <span className="scene-word scene-word-3">SYSTEM</span>
      </div>
    </div>
  );
}
