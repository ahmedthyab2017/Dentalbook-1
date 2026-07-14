import type { ToothState } from "@/types/db";

export const CHART_THEME = {
  healthy: {
    enamel: ["#fafafa", "#e8edf2", "#c8d4dc"],
    root: ["#faedc7", "#d3b077"],
    stroke: "#aebfc8",
    rootStroke: "#b8935e",
  },
  decay: { overlay: "rgba(185, 28, 28, 0.42)", lesion: "#dc2626" },
  filling: { overlay: "rgba(34, 197, 94, 0.38)", patch: "#16a34a" },
  rct: { overlay: "rgba(249, 115, 22, 0.28)", root: "rgba(249, 115, 22, 0.45)" },
  crown: { overlay: "rgba(212, 175, 55, 0.35)" },
  implant: { overlay: "rgba(168, 85, 247, 0.3)", root: "rgba(147, 51, 234, 0.45)" },
  missing: { opacity: 0.38, stroke: "#64748b" },
  extraction: { overlay: "rgba(127, 29, 29, 0.55)", opacity: 0.92 },
  gum: { top: "#e8a0a8", mid: "#d4727d", bottom: "#b85c68", opacity: 0.55 },
} as const;

export type StatusOverlay = {
  crownTint?: string;
  rootTint?: string;
  lesion?: { cx: number; cy: number; r: number };
  patch?: { cx: number; cy: number; rx: number; ry: number };
  showX?: boolean;
  dashed?: boolean;
  opacity?: number;
};

export function getStatusOverlay(state: ToothState, crownHalfWidth: number, cervicalY: number): StatusOverlay {
  const accentY = cervicalY * 0.32;
  switch (state) {
    case "decay":
      return { crownTint: CHART_THEME.decay.overlay, lesion: { cx: 50, cy: accentY + 6, r: Math.max(3.5, crownHalfWidth * 0.18) } };
    case "filling":
      return { crownTint: CHART_THEME.filling.overlay, patch: { cx: 50, cy: accentY + 6, rx: Math.max(5, crownHalfWidth * 0.26), ry: Math.max(3.8, crownHalfWidth * 0.2) } };
    case "rct":
      return { crownTint: CHART_THEME.rct.overlay, rootTint: CHART_THEME.rct.root };
    case "crown":
      return { crownTint: CHART_THEME.crown.overlay };
    case "implant":
      return { crownTint: CHART_THEME.implant.overlay, rootTint: CHART_THEME.implant.root };
    case "missing":
      return { dashed: true, opacity: CHART_THEME.missing.opacity };
    case "extraction":
      return { crownTint: CHART_THEME.extraction.overlay, showX: true, opacity: CHART_THEME.extraction.opacity };
    default:
      return {};
  }
}
