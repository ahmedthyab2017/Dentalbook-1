"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import type { ToothState } from "@/types/db";
import { CHART_THEME, getStatusOverlay } from "./chartTheme";
import { getPathsByType, getPathsForTooth, getToothScale, type ToothMorphType } from "./toothPaths";

export type ToothProps = {
  type: ToothMorphType;
  status: ToothState;
  num?: number;
  jaw?: "upper" | "lower";
  selected?: boolean;
  className?: string;
  showShadow?: boolean;
};

export function Tooth({ type, status, num, jaw = "upper", selected = false, className, showShadow = true }: ToothProps) {
  const paths = num != null ? getPathsForTooth(num) : getPathsByType(type, jaw);
  const scale = num != null ? getToothScale(num) : 1;
  const overlay = getStatusOverlay(status, paths.crownHalfWidth, paths.cervicalY);
  const isPosterior = paths.crownTip === "dome";
  const uid = num ?? type;
  const enamel = status === "crown" ? ["#fff3c4", "#c99a2e", "#a3781c"] : status === "implant" ? ["#e9d5ff", "#9333ea", "#6b21a8"] : CHART_THEME.healthy.enamel;

  return (
    <motion.svg
      className={cn("tooth-svg", `tooth-morph-${paths.morphType}`, className)}
      data-tooth-type={paths.morphType}
      data-tooth-status={status}
      viewBox={`0 0 ${paths.viewBoxW} ${paths.viewBoxH}`}
      role="img"
      aria-hidden="true"
      style={{ transform: `scale(${scale})`, transformOrigin: "50% 100%" }}
      animate={selected ? { y: -2 } : { y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <defs>
        <linearGradient id={`enamel-${uid}`} x1="18%" y1="0%" x2="82%" y2="100%">
          <stop offset="0%" stopColor={enamel[0]} /><stop offset="40%" stopColor={enamel[1]} /><stop offset="100%" stopColor={enamel[2]} />
        </linearGradient>
        <linearGradient id={`root-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={CHART_THEME.healthy.root[0]} /><stop offset="100%" stopColor={CHART_THEME.healthy.root[1]} />
        </linearGradient>
        <linearGradient id={`root-shade-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(0,0,0,0.18)" /><stop offset="50%" stopColor="rgba(0,0,0,0)" /><stop offset="100%" stopColor="rgba(0,0,0,0.22)" />
        </linearGradient>
        <radialGradient id={`gloss-${uid}`} cx="32%" cy="14%" r="55%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.92)" /><stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        <radialGradient id={`occlusal-${uid}`} cx="50%" cy="42%" r="62%">
          <stop offset="0%" stopColor="rgba(90,80,65,0.45)" /><stop offset="100%" stopColor="rgba(90,80,65,0)" />
        </radialGradient>
        <filter id={`shadow-${uid}`} x="-40%" y="-15%" width="180%" height="150%">
          <feDropShadow dx="0" dy="3" stdDeviation="2.8" floodColor="rgba(8,15,30,0.5)" />
        </filter>
        <clipPath id={`crown-clip-${uid}`}><path d={paths.overlayMask} /></clipPath>
      </defs>

      <g filter={showShadow ? `url(#shadow-${uid})` : undefined} opacity={overlay.opacity ?? 1}>
        {paths.roots.map((d, i) => (
          <g key={`root-${i}`}>
            <path d={d} fill={overlay.rootTint ?? `url(#root-${uid})`} stroke={CHART_THEME.healthy.rootStroke} strokeWidth={0.75} />
            <path d={d} fill={`url(#root-shade-${uid})`} stroke="none" pointerEvents="none" />
          </g>
        ))}
        <path d={paths.crown} fill={`url(#enamel-${uid})`} stroke={CHART_THEME.healthy.stroke} strokeWidth={0.9} />
        {isPosterior && (
          <g pointerEvents="none" opacity={0.5}>
            <ellipse cx={50 - paths.crownHalfWidth * 0.4} cy={paths.cervicalY * 0.26} rx={paths.crownHalfWidth * 0.2} ry={5.5} fill="rgba(255,255,255,0.4)" />
            <ellipse cx={50 + paths.crownHalfWidth * 0.4} cy={paths.cervicalY * 0.26} rx={paths.crownHalfWidth * 0.2} ry={5.5} fill="rgba(255,255,255,0.4)" />
          </g>
        )}
        {paths.crownTip === "point" && (
          <path d={`M 50 ${paths.cervicalY * 0.08} L ${50 - paths.crownHalfWidth * 0.22} ${paths.cervicalY * 0.22} L ${50 + paths.crownHalfWidth * 0.22} ${paths.cervicalY * 0.22} Z`} fill="rgba(255,255,255,0.45)" pointerEvents="none" />
        )}
        <ellipse cx={50} cy={paths.cervicalY - 2} rx={paths.crownHalfWidth * 0.72} ry={5.5} fill="rgba(15,23,42,0.28)" pointerEvents="none" />
        <path d={paths.crown} fill={`url(#gloss-${uid})`} stroke="none" pointerEvents="none" />
        {paths.occlusalOutline && (
          <g pointerEvents="none">
            <path d={paths.occlusalOutline} fill={`url(#occlusal-${uid})`} stroke="rgba(75,90,100,0.5)" strokeWidth={0.7} />
            {paths.grooves.map((g, i) => <path key={i} d={g} stroke="rgba(70,85,95,0.45)" strokeWidth={0.65} fill="none" strokeLinecap="round" />)}
          </g>
        )}
        {paths.incisalEdge && <path d={paths.incisalEdge} stroke="rgba(255,255,255,0.7)" strokeWidth={1} fill="none" pointerEvents="none" />}
      </g>

      {(overlay.crownTint || overlay.lesion || overlay.patch) && (
        <g clipPath={`url(#crown-clip-${uid})`} pointerEvents="none">
          {overlay.crownTint && <path d={paths.crown} fill={overlay.crownTint} stroke="none" />}
          {overlay.lesion && <circle cx={overlay.lesion.cx} cy={overlay.lesion.cy} r={overlay.lesion.r} fill={CHART_THEME.decay.lesion} opacity={0.85} />}
          {overlay.patch && <ellipse cx={overlay.patch.cx} cy={overlay.patch.cy} rx={overlay.patch.rx} ry={overlay.patch.ry} fill={CHART_THEME.filling.patch} opacity={0.75} />}
        </g>
      )}
      {overlay.showX && (
        <path d={`M ${50 - paths.crownHalfWidth * 0.75} ${paths.cervicalY * 0.28} L ${50 + paths.crownHalfWidth * 0.75} ${paths.cervicalY * 0.9} M ${50 + paths.crownHalfWidth * 0.75} ${paths.cervicalY * 0.28} L ${50 - paths.crownHalfWidth * 0.75} ${paths.cervicalY * 0.9}`} stroke="#fca5a5" strokeWidth={3} strokeLinecap="round" pointerEvents="none" />
      )}
      {overlay.dashed && <path d={paths.crown} fill="none" stroke={CHART_THEME.missing.stroke} strokeWidth={1} strokeDasharray="3 2.5" pointerEvents="none" />}
    </motion.svg>
  );
}
