"use client";

import { CHART_THEME } from "./chartTheme";

export function GumLayer({ jaw, className = "" }: { jaw: "upper" | "lower"; className?: string }) {
  const isUpper = jaw === "upper";
  const d = isUpper
    ? "M 8 72 C 120 28, 280 18, 400 22 C 520 18, 680 28, 792 72 C 680 58, 520 48, 400 50 C 280 48, 120 58, 8 72 Z"
    : "M 8 28 C 120 72, 280 82, 400 78 C 520 82, 680 72, 792 28 C 680 42, 520 52, 400 50 C 280 52, 120 42, 8 28 Z";

  return (
    <svg className={`dc-gum-layer dc-gum-${jaw} ${className}`.trim()} viewBox="0 0 800 100" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={`gum-grad-${jaw}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={CHART_THEME.gum.top} stopOpacity={CHART_THEME.gum.opacity} />
          <stop offset="50%" stopColor={CHART_THEME.gum.mid} stopOpacity={CHART_THEME.gum.opacity * 0.9} />
          <stop offset="100%" stopColor={CHART_THEME.gum.bottom} stopOpacity={CHART_THEME.gum.opacity * 0.75} />
        </linearGradient>
      </defs>
      <path d={d} fill={`url(#gum-grad-${jaw})`} />
    </svg>
  );
}
