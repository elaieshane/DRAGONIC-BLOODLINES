import React, { useMemo } from 'react';

/* ============================================================
   ENHANCED BESTIARY — CREATURE DESIGN FORGE
   Expanded creature types with advanced visual effects,
   animations, and tactical information for every beast.
   ============================================================ */

// ---------- Color and lighting ----------
function lighten(hex: string, amt: number): string {
  const num = parseInt(hex.slice(1), 16);
  let r = (num >> 16) + amt;
  let g = ((num >> 8) & 0xff) + amt;
  let b = (num & 0xff) + amt;
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

// ---------- NEW CREATURE BODY TYPES ----------

// Humanoid hostile - two-legged warrior types
export function HumanoidFigure({ name, color }: { name: string; color: string }) {
  const light = lighten(color, 40);
  const dark = lighten(color, -40);
  const wobble = (hash(name + 'h') % 6) - 3;

  return (
    <g>
      {/* Shadow */}
      <ellipse cx="70" cy="115" rx="18" ry="4" fill="#00000033" />

      {/* Armor Plating */}
      <path d="M 32,60 L 68,60 L 72,105 L 28,105 Z" fill={color} opacity="0.8" />
      <rect x="38" y="70" width="24" height="20" rx="2" fill={light} opacity="0.4" />

      {/* Legs */}
      <rect x="38" y="105" width="6" height="18" rx="2" fill={dark} />
      <rect x="56" y="105" width="6" height="18" rx="2" fill={dark} />

      {/* Arms */}
      <g>
        <rect x="26" y="65" width="6" height="28" rx="2" fill={dark} />
        <circle cx="24" cy="95" r="4" fill={dark} opacity="0.7" /> {/* Weapon hand */}
      </g>
      <g>
        <rect x="68" y="65" width="6" height="28" rx="2" fill={dark} />
        <circle cx="76" cy="93" r="4" fill={light} opacity="0.5" /> {/* Shield */}
      </g>

      {/* Head */}
      <circle cx="50" cy="48" r="10" fill={color} />
      <path d="M 45,42 L 50,38 L 55,42" fill={light} /> {/* Crown/helmet peak */}
      <circle cx="47" cy="48" r="1.5" fill="#000000" />
      <circle cx="53" cy="48" r="1.5" fill="#000000" />
    </g>
  );
}

// Crystalline entity - geometric, refractive
export function CrystallineFigure({ name, color }: { name: string; color: string }) {
  const light = lighten(color, 60);
  const wobble = (hash(name + 'c') % 8) - 4;

  return (
    <g>
      {/* Base */}
      <ellipse cx="70" cy="115" rx="20" ry="5" fill={color} opacity="0.3" />

      {/* Crystalline body - sharp angles */}
      <polygon points="50,25 35,55 40,100 100,100 105,55 90,25 70,15" fill={color} opacity="0.7" />

      {/* Inner facets - refractive effect */}
      <polygon points="50,35 60,50 65,35" fill={light} opacity="0.5" />
      <polygon points="90,35 80,50 75,35" fill={light} opacity="0.4" />
      <polygon points="70,55 75,75 65,75" fill={light} opacity="0.6" />

      {/* Spikes */}
      {[0, 1, 2, 3].map((i) => (
        <polygon
          key={i}
          points={`${50 + i * 10},${15 + wobble} ${45 + i * 10},${5 + wobble} ${55 + i * 10},${5 + wobble}`}
          fill={light}
          opacity="0.8"
        />
      ))}

      {/* Core glow */}
      <circle cx="70" cy="65" r="4" fill={light} opacity="0.9" />
    </g>
  );
}

// Insectoid - multi-legged, chitinous
export function InsectoidFigure({ name, color }: { name: string; color: string }) {
  const dark = lighten(color, -30);

  return (
    <g>
      {/* Shadow */}
      <ellipse cx="70" cy="115" rx="25" ry="5" fill="#00000040" />

      {/* Chitin segments */}
      <ellipse cx="70" cy="50" rx="18" ry="14" fill={color} />
      <ellipse cx="70" cy="70" rx="22" ry="16" fill={color} opacity="0.9" />
      <ellipse cx="70" cy="90" rx="20" ry="14" fill={color} opacity="0.8" />

      {/* Segment divisions */}
      <path d="M 50,60 Q 70,65 90,60" stroke={dark} strokeWidth="1" opacity="0.4" fill="none" />
      <path d="M 48,80 Q 70,86 92,80" stroke={dark} strokeWidth="1" opacity="0.4" fill="none" />

      {/* Six legs */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const side = i < 3 ? -1 : 1;
        const idx = i % 3;
        const x = 70 + side * (12 + idx * 6);
        const y = 50 + idx * 20;
        return (
          <g key={i}>
            <path d={`M ${x},${y} L ${x + side * 18},${y + 12}`} stroke={dark} strokeWidth="2.5" />
            <circle cx={x + side * 18} cy={y + 12} r="2" fill={dark} />
          </g>
        );
      })}

      {/* Head with mandibles */}
      <circle cx="70" cy="38" r="6" fill={color} />
      <path d="M 65,40 L 60,45 M 75,40 L 80,45" stroke={dark} strokeWidth="2" />

      {/* Compound eyes */}
      <circle cx="67" cy="36" r="1.2" fill="#000000" opacity="0.8" />
      <circle cx="73" cy="36" r="1.2" fill="#000000" opacity="0.8" />
    </g>
  );
}

// Spectral/ghostly - translucent, ethereal
export function SpectralFigure({ name, color }: { name: string; color: string }) {
  const light = lighten(color, 50);

  return (
    <g opacity="0.75">
      {/* Base glow */}
      <ellipse cx="70" cy="75" rx="35" ry="40" fill={color} opacity="0.2" filter="blur(3px)" />

      {/* Main form - amorphous */}
      <path
        d="M 50,30 Q 30,40 35,65 Q 28,85 50,105 Q 55,110 70,112 Q 85,110 90,105 Q 92,85 85,65 Q 90,40 70,30 Q 60,25 50,30 Z"
        fill={color}
        opacity="0.6"
      />

      {/* Wispy tendrils */}
      <path d="M 45,85 Q 35,95 30,110" stroke={light} strokeWidth="2" fill="none" opacity="0.5" />
      <path d="M 95,85 Q 105,95 110,110" stroke={light} strokeWidth="2" fill="none" opacity="0.5" />
      <path d="M 70,30 Q 65,15 70,5" stroke={light} strokeWidth="1.5" fill="none" opacity="0.6" />

      {/* Eyes - hollow */}
      <circle cx="60" cy="55" r="5" fill="none" stroke={light} strokeWidth="1.5" opacity="0.8" />
      <circle cx="80" cy="55" r="5" fill="none" stroke={light} strokeWidth="1.5" opacity="0.8" />
      <circle cx="60" cy="55" r="2" fill={light} opacity="0.6" />
      <circle cx="80" cy="55" r="2" fill={light} opacity="0.6" />
    </g>
  );
}

// Biomechanical - flesh and metal hybrid
export function BiomechanicalFigure({ name, color }: { name: string; color: string }) {
  const metal = '#a0a0a0';
  const flesh = lighten(color, 30);

  return (
    <g>
      {/* Shadow */}
      <ellipse cx="70" cy="115" rx="22" ry="5" fill="#00000035" />

      {/* Left side - mechanical */}
      <rect x="35" y="50" width="28" height="55" rx="3" fill={metal} opacity="0.7" />
      <rect x="38" y="53" width="8" height="10" fill="#606060" opacity="0.8" />
      <rect x="51" y="53" width="8" height="10" fill="#606060" opacity="0.8" />
      <rect x="38" y="70" width="22" height="3" fill="#505050" />
      <rect x="38" y="85" width="22" height="3" fill="#505050" />

      {/* Right side - organic */}
      <path d="M 63,50 L 95,50 L 92,105 L 66,105 Z" fill={flesh} opacity="0.8" />
      <path d="M 70,65 Q 75,75 72,85" stroke={lighten(color, -40)} strokeWidth="1" opacity="0.4" />
      <path d="M 80,65 Q 85,75 82,85" stroke={lighten(color, -40)} strokeWidth="1" opacity="0.4" />

      {/* Head - split */}
      <circle cx="50" cy="40" r="8" fill={metal} opacity="0.7" />
      <circle cx="70" cy="40" r="8" fill={flesh} opacity="0.8" />

      {/* Central spine line */}
      <line x1="63" y1="30" x2="63" y2="105" stroke="#ff6b6b" strokeWidth="1.5" opacity="0.6" />
    </g>
  );
}

// Swarm entity - many small creatures
export function SwarmFigure({ name, color }: { name: string; color: string }) {
  const individuals = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => ({
      x: (hash(name + i + 'x') % 80) + 30,
      y: (hash(name + i + 'y') % 80) + 20,
      size: 2 + (hash(name + i + 's') % 3),
    }));
  }, [name]);

  return (
    <g>
      {/* Shadow */}
      <ellipse cx="70" cy="115" rx="28" ry="6" fill="#00000025" />

      {/* Formation pattern - concentric circles */}
      <circle cx="70" cy="65" r="35" fill="none" stroke={color} strokeWidth="0.5" opacity="0.2" />
      <circle cx="70" cy="65" r="25" fill="none" stroke={color} strokeWidth="0.5" opacity="0.2" />

      {/* Individual creatures */}
      {individuals.map((ind, i) => (
        <g key={i}>
          <circle cx={ind.x} cy={ind.y} r={ind.size} fill={color} opacity="0.8" />
          <circle cx={ind.x} cy={ind.y} r={ind.size * 0.4} fill={lighten(color, 40)} opacity="0.6" />
        </g>
      ))}

      {/* Connecting tendrils */}
      {[0, 1, 2, 3].map((i) => {
        const angle = (i / 4) * Math.PI * 2;
        const endX = 70 + Math.cos(angle) * 40;
        const endY = 65 + Math.sin(angle) * 40;
        return (
          <path
            key={i}
            d={`M 70,65 Q ${70 + Math.cos(angle) * 20},${65 + Math.sin(angle) * 20} ${endX},${endY}`}
            stroke={color}
            strokeWidth="1"
            fill="none"
            opacity="0.3"
          />
        );
      })}
    </g>
  );
}

// ---------- New Enhanced Sigil with effects ----------
export function EnhancedSigil({
  name,
  color,
  type,
  rank = 'common',
  size = 120,
  animated = true,
}: {
  name: string;
  color: string;
  type: string;
  rank?: string;
  size?: number;
  animated?: boolean;
}) {
  const uid = 'enh' + hash(name);
  let figure;

  if (type === 'humanoid') {
    figure = <HumanoidFigure name={name} color={color} />;
  } else if (type === 'crystalline') {
    figure = <CrystallineFigure name={name} color={color} />;
  } else if (type === 'insectoid') {
    figure = <InsectoidFigure name={name} color={color} />;
  } else if (type === 'spectral') {
    figure = <SpectralFigure name={name} color={color} />;
  } else if (type === 'biomechanical') {
    figure = <BiomechanicalFigure name={name} color={color} />;
  } else if (type === 'swarm') {
    figure = <SwarmFigure name={name} color={color} />;
  }

  const rankColors = {
    elite: '#8c1f28',
    boss: '#c9a15a',
    worldboss: '#c9a15a',
    mythic: '#7a6fd0',
    eldritch: '#8b5fd6',
  };

  return (
    <svg
      viewBox="0 0 140 140"
      width={size}
      height={size}
      style={{
        overflow: 'visible',
        filter: animated && rank !== 'common' ? 'drop-shadow(0 0 8px rgba(255,255,255,0.3))' : 'none',
      }}
    >
      <defs>
        <radialGradient id={uid} cx="50%" cy="46%" r="60%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0" />
          <stop offset="78%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.35" />
        </radialGradient>
      </defs>

      {/* Background circle */}
      <circle cx="70" cy="70" r="65" fill="#0a0a0a" opacity="0.8" />

      {/* Creature */}
      <g className={animated ? 'enhanced-sigil-glow' : ''}>{figure}</g>

      {/* Vignette */}
      <circle cx="70" cy="70" r="68" fill={`url(#${uid})`} />

      {/* Rank glow border */}
      {rank !== 'common' && (
        <circle
          cx="70"
          cy="70"
          r="65"
          fill="none"
          stroke={rankColors[rank as keyof typeof rankColors] || color}
          strokeWidth="1"
          opacity="0.6"
        />
      )}

      <style>{`
        @keyframes enhanced-glow {
          0%, 100% { filter: drop-shadow(0 0 4px rgba(255,255,255,0.2)); }
          50% { filter: drop-shadow(0 0 12px rgba(255,255,255,0.5)); }
        }
        .enhanced-sigil-glow {
          animation: enhanced-glow 3s ease-in-out infinite;
        }
      `}</style>
    </svg>
  );
}
