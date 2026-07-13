import { getToothType, isDeciduousTooth } from "@/lib/tooth";

type ToothProps = {
  small?: boolean;
};

function ToothDefs() {
  return (
    <defs>
      <linearGradient id="tc-crown" x1="15%" y1="0%" x2="85%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="45%" stopColor="#f4f6f8" />
        <stop offset="100%" stopColor="#dbe2e8" />
      </linearGradient>
      <linearGradient id="tc-crown-hi" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
      </linearGradient>
      <linearGradient id="tc-root" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#f2e2bd" />
        <stop offset="55%" stopColor="#e6cd9c" />
        <stop offset="100%" stopColor="#cfab74" />
      </linearGradient>
      <linearGradient id="tc-root-shade" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="rgba(0,0,0,0.1)" />
        <stop offset="50%" stopColor="rgba(0,0,0,0)" />
        <stop offset="100%" stopColor="rgba(0,0,0,0.14)" />
      </linearGradient>
      <radialGradient id="tc-occlusal" cx="50%" cy="38%" r="55%">
        <stop offset="0%" stopColor="rgba(150,165,180,0.3)" />
        <stop offset="100%" stopColor="rgba(150,165,180,0)" />
      </radialGradient>
      <filter id="tc-shadow" x="-25%" y="-10%" width="150%" height="135%">
        <feDropShadow dx="0" dy="2" stdDeviation="2.2" floodColor="rgba(0,0,0,0.5)" />
      </filter>
    </defs>
  );
}

function CentralIncisor({ small }: ToothProps) {
  const w = small ? 20 : 24;
  const x = small ? 14 : 12;
  return (
    <svg className="tooth-svg" viewBox="0 0 52 72" aria-hidden="true">
      <ToothDefs />
      <g filter="url(#tc-shadow)">
        <path className="root" d="M19 40 C17 50 19 60 26 62 C33 60 35 50 33 40 Z" />
        <path className="root-shade" d="M19 40 C17 50 19 60 26 62 C33 60 35 50 33 40 Z" />
        <path
          className="crown"
          d={`M${x} 8 C${x} 2 17 1 26 1 C35 1 ${52 - x} 2 ${52 - x} 8 L${x + w} 30 C${x + w} 36 ${52 - x - 2} 39 26 39 C${x + 2} 39 ${x} 36 ${x} 30 Z`}
        />
        <path className="crown-hi" d={`M${x + 3} 6 L${52 - x - 3} 6 L${x + w - 3} 24 C34 29 30 31 26 31 C22 31 18 29 ${x + 5} 24 Z`} />
        <ellipse className="occlusal" cx="26" cy="14" rx="9" ry="5" />
        <path className="incisal" d="M15 8 L37 8" />
        <path
          className="state-overlay"
          d={`M${x} 8 L${52 - x} 8 L${x + w} 30 C${x + w} 36 ${52 - x - 2} 39 26 39 C${x + 2} 39 ${x} 36 ${x} 30 Z`}
        />
        <path className="caries" d="M20 14 a3.2 3.2 0 1 0 .1 0 Z" />
        <path className="xmark" d="M13 10 L35 36 M35 10 L13 36" />
      </g>
    </svg>
  );
}

function LateralIncisor({ small }: ToothProps) {
  const w = small ? 17 : 20;
  const x = small ? 16 : 14;
  return (
    <svg className="tooth-svg" viewBox="0 0 52 72" aria-hidden="true">
      <ToothDefs />
      <g filter="url(#tc-shadow)">
        <path className="root" d="M19.5 40 C18 50 20 60 26 62 C32 60 34 50 32.5 40 Z" />
        <path className="root-shade" d="M19.5 40 C18 50 20 60 26 62 C32 60 34 50 32.5 40 Z" />
        <path
          className="crown"
          d={`M${x} 9 C${x} 3 16 1 26 1.5 C36 1 38 3 ${52 - x} 9 L${x + w} 31 C${x + w} 37 37 40 26 40 C15 40 ${x} 37 ${x} 31 Z`}
        />
        <path className="crown-hi" d={`M${x + 3} 7 C18 8 34 8 ${52 - x - 3} 7 L${x + w - 2} 26 C34 30 28 31 26 31 C24 31 18 30 ${x + 4} 26 Z`} />
        <ellipse className="occlusal" cx="26" cy="15" rx="7" ry="4.5" />
        <path className="incisal" d="M17 8 C21 10 31 10 35 8" />
        <path
          className="state-overlay"
          d={`M${x} 9 L${52 - x} 9 L${x + w} 31 C${x + w} 37 37 40 26 40 C15 40 ${x} 37 ${x} 31 Z`}
        />
        <path className="caries" d="M19 15 a2.8 2.8 0 1 0 .1 0 Z" />
        <path className="xmark" d="M14 10 L34 36 M34 10 L14 36" />
      </g>
    </svg>
  );
}

function Canine({ small }: ToothProps) {
  const tip = small ? 5 : 3;
  return (
    <svg className="tooth-svg" viewBox="0 0 52 72" aria-hidden="true">
      <ToothDefs />
      <g filter="url(#tc-shadow)">
        <path className="root" d="M18 40 C16 50 18.5 61 26 63 C33.5 61 36 50 34 40 Z" />
        <path className="root-shade" d="M18 40 C16 50 18.5 61 26 63 C33.5 61 36 50 34 40 Z" />
        <path
          className="crown"
          d={`M15 ${9 + tip} C15 3 19 1 26 ${tip} C33 1 37 3 37 ${9 + tip} L33 34 C31 39 28 41 26 41 C24 41 21 39 19 34 Z`}
        />
        <path className="crown-hi" d="M19 11 C21 6 31 6 33 11 L31 27 C29 31 26 33 26 33 C26 33 23 31 21 27 Z" />
        <path className="groove" d="M26 9 L26 32" />
        <path
          className="state-overlay"
          d={`M15 ${9 + tip} L37 ${9 + tip} L33 34 C31 39 28 41 26 41 C24 41 21 39 19 34 Z`}
        />
        <path className="caries" d="M21 16 a3 3 0 1 0 .1 0 Z" />
        <path className="xmark" d="M15 11 L35 37 M35 11 L15 37" />
      </g>
    </svg>
  );
}

function Premolar({ small }: ToothProps) {
  return (
    <svg className="tooth-svg" viewBox="0 0 52 72" aria-hidden="true">
      <ToothDefs />
      <g filter="url(#tc-shadow)" transform={small ? "translate(2 2) scale(0.92)" : undefined}>
        <path className="root" d="M17 38 C15 48 17 58 26 60 C35 58 37 48 35 38 Z" />
        <path className="root-shade" d="M17 38 C15 48 17 58 26 60 C35 58 37 48 35 38 Z" />
        <path className="crown" d="M9 10 C9 3 15 1 26 1 C37 1 43 3 43 10 L41 32 C39 38 33 40 26 40 C19 40 13 38 11 32 Z" />
        <path className="crown-hi" d="M12 8 L40 8 L38 24 C35 29 30 31 26 31 C22 31 17 29 14 24 Z" />
        <ellipse className="occlusal" cx="26" cy="16" rx="10" ry="6" />
        <path className="groove" d="M26 7 L26 32" />
        <path className="groove" d="M17 12 C20 16 23 17 26 17 C29 17 32 16 35 12" />
        <path
          className="state-overlay"
          d="M9 10 L43 10 L41 32 C39 38 33 40 26 40 C19 40 13 38 11 32 Z"
        />
        <path className="caries" d="M18 14 a3.5 3.5 0 1 0 .1 0 Z" />
        <path className="xmark" d="M12 10 L38 36 M38 10 L12 36" />
      </g>
    </svg>
  );
}

function Molar({ small }: ToothProps) {
  return (
    <svg className="tooth-svg" viewBox="0 0 52 72" aria-hidden="true">
      <ToothDefs />
      <g filter="url(#tc-shadow)" transform={small ? "translate(1 1) scale(0.9)" : undefined}>
        <path className="root" d="M11 36 C9 46 10 56 15.5 59 C18.5 58 18 48 18.5 38 Z" />
        <path className="root root-2" d="M33.5 38 C33 48 33.5 58 36.5 59 C40 56 41 46 39.5 36 Z" />
        <path className="root-shade" d="M11 36 C9 46 10 56 15.5 59 C18.5 58 18 48 18.5 38 Z" />
        <path className="root-shade root-2" d="M33.5 38 C33 48 33.5 58 36.5 59 C40 56 41 46 39.5 36 Z" />
        <path className="crown" d="M7 9 C7 2 14 1 26 1 C38 1 45 2 45 9 L45 30 C45 37 37 41 26 41 C15 41 7 37 7 30 Z" />
        <path className="crown-hi" d="M10 7 L42 7 L42 23 C39 28 33 30 26 30 C19 30 13 28 10 23 Z" />
        <ellipse className="occlusal" cx="26" cy="15" rx="13" ry="7" />
        <path className="groove" d="M26 6 L26 34" />
        <path className="groove" d="M16 11 C19 15 22 17 26 17 C30 17 33 15 36 11" />
        <path className="groove" d="M16 20 C20 23 22 24 26 24 C30 24 32 23 36 20" />
        <path
          className="state-overlay"
          d="M7 9 L45 9 L45 30 C45 37 37 41 26 41 C15 41 7 37 7 30 Z"
        />
        <path className="caries" d="M17 14 a4.5 4.5 0 1 0 .1 0 Z" />
        <path className="xmark" d="M11 9 L41 37 M41 9 L11 37" />
      </g>
    </svg>
  );
}

export function ToothSVG({ num }: { num: number; jaw?: "upper" | "lower" }) {
  const type = getToothType(num);
  const small = isDeciduousTooth(num);
  const props: ToothProps = { small };

  let body;
  switch (type) {
    case "central":
      body = <CentralIncisor {...props} />;
      break;
    case "lateral":
      body = <LateralIncisor {...props} />;
      break;
    case "canine":
      body = <Canine {...props} />;
      break;
    case "premolar":
      body = <Premolar {...props} />;
      break;
    case "molar":
      body = <Molar {...props} />;
      break;
  }

  return <div className="dc-tooth-graphic">{body}</div>;
}
