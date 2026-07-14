"use client";

/** M/D/B/L/O surface reference — matches clinical chart UI in reference design. */
export function SurfaceLegend({ lang = "ar" }: { lang?: "ar" | "en" }) {
  return (
    <div className="dc-surface-legend" aria-label={lang === "ar" ? "أسطح السن" : "Tooth surfaces"}>
      <span className="dc-surf-label dc-surf-m">M</span>
      <span className="dc-surf-label dc-surf-d">D</span>
      <span className="dc-surf-label dc-surf-b">B</span>
      <span className="dc-surf-label dc-surf-l">L</span>
      <div className="dc-surf-icon" aria-hidden>
        <i className="dc-surf-o" />
        <i className="dc-surf-seg dc-surf-seg-m" />
        <i className="dc-surf-seg dc-surf-seg-d" />
        <i className="dc-surf-seg dc-surf-seg-b" />
        <i className="dc-surf-seg dc-surf-seg-l" />
      </div>
    </div>
  );
}
