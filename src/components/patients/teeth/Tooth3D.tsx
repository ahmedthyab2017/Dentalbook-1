import { getToothScale, getToothVisualByNumber, TOOTH_VIEWBOX_H, TOOTH_VIEWBOX_W } from "./geometry";
import { getToothCategory } from "@/lib/tooth";
import { cn } from "@/lib/cn";
import type { ToothState } from "@/types/db";

export type ToothStatusStyle = {
  crownFill: string;
  rootFill: string;
  crownStroke: string;
  rootStroke: string;
  opacity: number;
  showGloss: boolean;
  dashed: boolean;
  tint?: string;
  showX: boolean;
};

export function getToothStatusStyle(state: ToothState): ToothStatusStyle {
  switch (state) {
    case "crown":
      return {
        crownFill: "url(#tc-gold)",
        rootFill: "url(#tc-root)",
        crownStroke: "#8a6417",
        rootStroke: "#b8935e",
        opacity: 1,
        showGloss: true,
        dashed: false,
        showX: false,
      };
    case "implant":
      return {
        crownFill: "url(#tc-implant)",
        rootFill: "url(#tc-implant)",
        crownStroke: "#5b1a8b",
        rootStroke: "#5b1a8b",
        opacity: 1,
        showGloss: true,
        dashed: false,
        showX: false,
      };
    case "rct":
      return {
        crownFill: "url(#tc-enamel)",
        rootFill: "url(#tc-rct-root)",
        crownStroke: "#aebfc8",
        rootStroke: "#9a3412",
        opacity: 1,
        showGloss: true,
        dashed: false,
        showX: false,
      };
    case "decay":
      return {
        crownFill: "url(#tc-enamel)",
        rootFill: "url(#tc-root)",
        crownStroke: "#aebfc8",
        rootStroke: "#b8935e",
        opacity: 1,
        showGloss: true,
        dashed: false,
        tint: "rgba(239,68,68,0.14)",
        showX: false,
      };
    case "filling":
      return {
        crownFill: "url(#tc-enamel)",
        rootFill: "url(#tc-root)",
        crownStroke: "#aebfc8",
        rootStroke: "#b8935e",
        opacity: 1,
        showGloss: true,
        dashed: false,
        tint: "rgba(59,130,246,0.1)",
        showX: false,
      };
    case "missing":
      return {
        crownFill: "url(#tc-missing)",
        rootFill: "url(#tc-missing)",
        crownStroke: "#94a3b8",
        rootStroke: "#94a3b8",
        opacity: 0.38,
        showGloss: false,
        dashed: true,
        showX: false,
      };
    case "extraction":
      return {
        crownFill: "url(#tc-extraction)",
        rootFill: "url(#tc-extraction)",
        crownStroke: "#450a0a",
        rootStroke: "#450a0a",
        opacity: 0.92,
        showGloss: false,
        dashed: false,
        showX: true,
      };
    default:
      return {
        crownFill: "url(#tc-enamel)",
        rootFill: "url(#tc-root)",
        crownStroke: "#aebfc8",
        rootStroke: "#b8935e",
        opacity: 1,
        showGloss: true,
        dashed: false,
        showX: false,
      };
  }
}

export function Tooth3D({
  num,
  state = "healthy",
  className,
  showShadow = true,
}: {
  num: number;
  state?: ToothState;
  className?: string;
  showShadow?: boolean;
}) {
  const geo = getToothVisualByNumber(num);
  const category = getToothCategory(num);
  const scale = getToothScale(num);
  const style = getToothStatusStyle(state);
  const caries = state === "decay";
  const filled = state === "filling";
  const accentPoint = geo.cuspDots[0] || { x: 50, y: geo.cervicalY * 0.32 };
  const isPosterior = geo.crownTip === "dome";

  return (
    <svg
      className={cn(className, `tt-${category}`)}
      data-tooth-type={category}
      viewBox={`0 0 ${TOOTH_VIEWBOX_W} ${TOOTH_VIEWBOX_H}`}
      role="img"
      aria-hidden="true"
      style={{ transform: `scale(${scale})`, transformOrigin: "50% 100%" }}
    >
      <g filter={showShadow ? "url(#tc-shadow)" : undefined} opacity={style.opacity}>
        {/* roots — drawn first so the crown overlaps the cervical join */}
        {geo.roots.map((d, i) => (
          <g key={`root-${i}`}>
            <path d={d} fill={style.rootFill} stroke={style.rootStroke} strokeWidth={0.7} />
            <path d={d} fill="url(#tc-root-shade)" stroke="none" pointerEvents="none" />
          </g>
        ))}

        {/* implant screw thread texture */}
        {state === "implant" &&
          geo.roots.map((d, i) => (
            <g key={`thread-${i}`} opacity={0.55} pointerEvents="none">
              {Array.from({ length: 5 }).map((__, t) => (
                <line
                  key={t}
                  x1={40}
                  x2={60}
                  y1={geo.cervicalY + 8 + t * 10}
                  y2={geo.cervicalY + 8 + t * 10}
                  stroke="#f3e8ff"
                  strokeWidth={0.6}
                />
              ))}
            </g>
          ))}

        {/* crown */}
        <path className="tooth-crown" d={geo.crown} fill={style.crownFill} stroke={style.crownStroke} strokeWidth={0.9} />

        {/* buccal cusp hints on premolars/molars (visible from labial view) */}
        {isPosterior && (
          <g pointerEvents="none" opacity={0.55}>
            <ellipse cx={50 - geo.crownHalfWidth * 0.42} cy={geo.cervicalY * 0.26} rx={geo.crownHalfWidth * 0.2} ry={5.5} fill="rgba(255,255,255,0.45)" />
            <ellipse cx={50 + geo.crownHalfWidth * 0.42} cy={geo.cervicalY * 0.26} rx={geo.crownHalfWidth * 0.2} ry={5.5} fill="rgba(255,255,255,0.45)" />
            <path
              d={`M ${50 - geo.crownHalfWidth * 0.15} ${geo.cervicalY * 0.18} L ${50} ${geo.cervicalY * 0.14} L ${50 + geo.crownHalfWidth * 0.15} ${geo.cervicalY * 0.18}`}
              stroke="rgba(120,140,150,0.35)"
              strokeWidth={0.7}
              fill="none"
            />
          </g>
        )}

        {/* flat incisal band on anterior teeth */}
        {geo.crownTip === "flat" && geo.incisalEdge && (
          <rect
            x={50 - geo.crownHalfWidth * 0.72}
            y={geo.cervicalY * 0.12}
            width={geo.crownHalfWidth * 1.44}
            height={4}
            rx={1}
            fill="rgba(255,255,255,0.55)"
            pointerEvents="none"
          />
        )}

        {/* canine cusp highlight */}
        {geo.crownTip === "point" && (
          <path
            d={`M 50 ${geo.cervicalY * 0.08} L ${50 - geo.crownHalfWidth * 0.22} ${geo.cervicalY * 0.22} L ${50 + geo.crownHalfWidth * 0.22} ${geo.cervicalY * 0.22} Z`}
            fill="rgba(255,255,255,0.5)"
            pointerEvents="none"
          />
        )}

        {/* ambient occlusion at the cervical (neck) line */}
        <ellipse cx={50} cy={geo.cervicalY - 2} rx={geo.crownHalfWidth * 0.72} ry={5.5} fill="url(#tc-ao)" pointerEvents="none" />

        {/* subtle translucency + glossy specular highlight */}
        {style.showGloss && (
          <>
            <path d={geo.crown} fill="url(#tc-translucent)" stroke="none" pointerEvents="none" opacity={0.6} />
            <path d={geo.crown} fill="url(#tc-gloss)" stroke="none" pointerEvents="none" />
          </>
        )}

        {/* occlusal biting table (premolars/molars) */}
        {geo.occlusalOutline && (
          <g pointerEvents="none">
            <path d={geo.occlusalOutline} fill="url(#tc-occlusal-shade)" stroke="rgba(80,95,105,0.55)" strokeWidth={0.8} />
            {geo.grooves.map((g, i) => (
              <path key={i} d={g} stroke="rgba(70,85,95,0.55)" strokeWidth={0.75} fill="none" strokeLinecap="round" />
            ))}
          </g>
        )}

        {/* incisal-edge highlight line for anterior teeth */}
        {geo.incisalEdge && <path d={geo.incisalEdge} stroke="rgba(255,255,255,0.75)" strokeWidth={1.1} fill="none" pointerEvents="none" />}
        {geo.grooves.length > 0 && !geo.occlusalOutline &&
          geo.grooves.map((g, i) => <path key={i} d={g} stroke="rgba(120,140,150,0.35)" strokeWidth={0.6} fill="none" pointerEvents="none" />)}

        {/* status tint wash (caries / filling) */}
        {style.tint && <path d={geo.crown} fill={style.tint} stroke="none" pointerEvents="none" />}

        {/* caries lesion */}
        {caries && (
          <circle cx={accentPoint.x} cy={accentPoint.y + 6} r={Math.max(3.2, geo.crownHalfWidth * 0.16)} fill="url(#tc-caries)" pointerEvents="none" />
        )}

        {/* composite filling patch */}
        {filled && (
          <ellipse
            cx={accentPoint.x}
            cy={accentPoint.y + 6}
            rx={Math.max(4.5, geo.crownHalfWidth * 0.24)}
            ry={Math.max(3.5, geo.crownHalfWidth * 0.18)}
            fill="url(#tc-filling)"
            stroke="#1e40af"
            strokeWidth={0.5}
            pointerEvents="none"
          />
        )}

        {/* planned-extraction indicator */}
        {style.showX && (
          <path
            d={`M ${50 - geo.crownHalfWidth * 0.75} ${geo.cervicalY * 0.28} L ${50 + geo.crownHalfWidth * 0.75} ${geo.cervicalY * 0.9} M ${50 + geo.crownHalfWidth * 0.75} ${geo.cervicalY * 0.28} L ${50 - geo.crownHalfWidth * 0.75} ${geo.cervicalY * 0.9}`}
            stroke="#fca5a5"
            strokeWidth={3.2}
            strokeLinecap="round"
            pointerEvents="none"
          />
        )}

        {/* missing-tooth socket outline */}
        {style.dashed && (
          <path
            d={geo.crown}
            fill="none"
            stroke="#64748b"
            strokeWidth={1}
            strokeDasharray="3 2.5"
            pointerEvents="none"
          />
        )}
      </g>
    </svg>
  );
}
