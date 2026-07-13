/**
 * Shared SVG gradients/filters used by every <Tooth3D>. Mounted once
 * (globally unique ids) so individual tooth SVGs stay lightweight and
 * reference `url(#tc-...)` without redefining anything per-tooth.
 */
export function ToothDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <defs>
        {/* Glossy enamel body */}
        <linearGradient id="tc-enamel" x1="18%" y1="0%" x2="82%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="32%" stopColor="#f7fafc" />
          <stop offset="68%" stopColor="#e7eef2" />
          <stop offset="100%" stopColor="#ccd8e0" />
        </linearGradient>

        {/* Specular highlight — top-left glossy reflection */}
        <radialGradient id="tc-gloss" cx="32%" cy="14%" r="55%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
          <stop offset="45%" stopColor="rgba(255,255,255,0.35)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>

        {/* Subtle translucency along enamel edges */}
        <linearGradient id="tc-translucent" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(191,219,254,0.28)" />
          <stop offset="40%" stopColor="rgba(191,219,254,0.05)" />
          <stop offset="100%" stopColor="rgba(148,163,184,0.16)" />
        </linearGradient>

        {/* Natural ivory root */}
        <linearGradient id="tc-root" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#faedc7" />
          <stop offset="50%" stopColor="#eed8a1" />
          <stop offset="100%" stopColor="#d3b077" />
        </linearGradient>
        <linearGradient id="tc-root-shade" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(0,0,0,0.16)" />
          <stop offset="45%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.22)" />
        </linearGradient>

        {/* Ambient occlusion at the cervical (neck) line */}
        <radialGradient id="tc-ao" cx="50%" cy="0%" r="75%">
          <stop offset="0%" stopColor="rgba(15,23,42,0.38)" />
          <stop offset="60%" stopColor="rgba(15,23,42,0.1)" />
          <stop offset="100%" stopColor="rgba(15,23,42,0)" />
        </radialGradient>

        {/* Occlusal table shading (fissures look recessed) */}
        <radialGradient id="tc-occlusal-shade" cx="50%" cy="42%" r="62%">
          <stop offset="0%" stopColor="rgba(107,95,74,0.4)" />
          <stop offset="70%" stopColor="rgba(107,95,74,0.12)" />
          <stop offset="100%" stopColor="rgba(107,95,74,0)" />
        </radialGradient>

        {/* Status accents */}
        <linearGradient id="tc-gold" x1="15%" y1="0%" x2="85%" y2="100%">
          <stop offset="0%" stopColor="#fff3c4" />
          <stop offset="35%" stopColor="#e8c158" />
          <stop offset="70%" stopColor="#c99a2e" />
          <stop offset="100%" stopColor="#a3781c" />
        </linearGradient>
        <linearGradient id="tc-implant" x1="18%" y1="0%" x2="82%" y2="100%">
          <stop offset="0%" stopColor="#e9d5ff" />
          <stop offset="40%" stopColor="#c084fc" />
          <stop offset="75%" stopColor="#9333ea" />
          <stop offset="100%" stopColor="#6b21a8" />
        </linearGradient>
        <radialGradient id="tc-caries" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#7f1d1d" />
          <stop offset="55%" stopColor="#b91c1c" />
          <stop offset="100%" stopColor="#ef4444" />
        </radialGradient>
        <linearGradient id="tc-filling" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="tc-rct-root" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fed7aa" />
          <stop offset="50%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#c2410c" />
        </linearGradient>
        <linearGradient id="tc-extraction" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#991b1b" />
          <stop offset="100%" stopColor="#450a0a" />
        </linearGradient>
        <linearGradient id="tc-missing" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>

        {/* Drop shadow under the whole tooth */}
        <filter id="tc-shadow" x="-40%" y="-15%" width="180%" height="150%">
          <feDropShadow dx="0" dy="3" stdDeviation="2.4" floodColor="rgba(8,15,30,0.45)" />
        </filter>
        <filter id="tc-shadow-lg" x="-50%" y="-20%" width="200%" height="170%">
          <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="rgba(8,15,30,0.5)" />
        </filter>
        <filter id="tc-blur-sm">
          <feGaussianBlur stdDeviation="0.5" />
        </filter>
      </defs>
    </svg>
  );
}
