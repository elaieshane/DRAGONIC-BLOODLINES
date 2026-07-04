import React from "react";

/* ============================================================
   NETERIA — ENIGMATIC BOSSES (EXPANSION PACK II)
   A standalone module, separate from CodexCreatureDisplay.jsx and
   MythExpansion.jsx. Adds three large, unsettling boss-tier
   creatures, each with a brand new hybrid body renderer so
   none of them reuse an existing silhouette:

     - "winged-tentacled"  → colossal Cthulhu-esque horror,
                             folded bat-wings behind a crown
                             of thrashing tentacles
     - "crocodilian"       → low, armored reptile-god quadruped
                             with a plated back and death-roll tail
     - "claw-tentacle-ghoul" → oversized biped ghoul, one arm a
                             massive claw, the other trailing
                             feeding-tentacles from a torn back

   USAGE (inside CodexCreatureDisplay.jsx, without modifying its body):

     import {
       WingedTentacledFigure,
       CrocodilianFigure,
       ClawTentacleGhoulFigure,
       ENIGMATIC_BODY_OVERRIDES,
       ENIGMATIC_BOSSES,
     } from "./EnigmaticBosses";

     // 1. Extend body routing (place ahead of existing overrides):
     const BODY_OVERRIDES = [...ENIGMATIC_BODY_OVERRIDES, ...originalArray];

     // 2. Extend the Sigil() body-dispatch switch with:
     //    else if (body === "winged-tentacled") inner = <WingedTentacledFigure name={name} race={race} rank={rank} />;
     //    else if (body === "crocodilian") inner = <CrocodilianFigure name={name} race={race} />;
     //    else if (body === "claw-tentacle-ghoul") inner = <ClawTentacleGhoulFigure name={name} race={race} />;

     // 3. Push the new bosses into CREATURES:
     CREATURES.push(...ENIGMATIC_BOSSES(race, makeCreature));
   ============================================================ */

// ---------- shared hash/color helpers (self-contained, mirrors the base file) ----------
function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function lighten(hex, amt) {
  const num = parseInt(hex.slice(1), 16);
  let r = (num >> 16) + amt;
  let g = ((num >> 8) & 0xff) + amt;
  let b = (num & 0xff) + amt;
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function colorForFallback(name, fallback) {
  // Kept intentionally simple here — the host file's colorFor() with
  // full keyword table should be used instead if importing race.color
  // isn't already themed. This fallback only kicks in standalone.
  if (/eye|watcher|maw|dream|void|abyss/i.test(name)) return "#4a2e6e";
  if (/croc|scale|swamp|bog/i.test(name)) return "#3f5233";
  if (/ghoul|claw|rot|flesh/i.test(name)) return "#5a6b3a";
  return fallback;
}

// ---------- body-shape routing for the three new bosses ----------
export const ENIGMATIC_BODY_OVERRIDES = [
  [/mind-?flayer|star-?spawn|deep one prime|dreaming god|elder horror/i, "winged-tentacled"],
  [/sobek|crocodile god|scale sovereign|bog tyrant|swamp lord/i, "crocodilian"],
  [/rend-?maw|feeding ghoul|harrow ghoul|charnel horror|flesh reaper/i, "claw-tentacle-ghoul"],
];

// ---------- WINGED-TENTACLED: colossal Cthulhu-esque horror ----------
export function WingedTentacledFigure({ name, race, rank }) {
  const seed = name;
  const base = colorForFallback(name, race?.color || "#4a2e6e");
  const light = lighten(base, 55);
  const dark = lighten(base, -60);
  const tentacles = Array.from({ length: 8 }).map((_, i) => {
    const ang = -100 + i * 26;
    const wob = (hash(seed + "wt" + i) % 18) - 9;
    const rad = (ang * Math.PI) / 180;
    return `M${70 + Math.cos(rad) * 26},${76 + Math.sin(rad) * 14} Q${70 + Math.cos(rad) * 52 + wob},${118} ${70 + Math.cos(rad) * 34},${132}`;
  });

  return (
    <g transform="translate(0 -6)">
      {/* folded wings, sitting behind the tentacle crown */}
      <path d="M30,58 C0,44 -14,8 6,-10 C16,16 30,32 46,42 Z" fill={dark} opacity="0.92" />
      <path d="M110,58 C140,44 154,8 134,-10 C124,16 110,32 94,42 Z" fill={dark} opacity="0.92" />
      {/* thrashing tentacle crown, drawn behind the head */}
      {tentacles.map((d, i) => (
        <path key={i} d={d} stroke={dark} strokeWidth="6.5" fill="none" strokeLinecap="round" opacity="0.95" />
      ))}
      {/* bulbous cranium / head-mass */}
      <path
        d="M70,26 C40,26 24,50 32,72 C38,88 54,96 70,96 C86,96 102,88 108,72 C116,50 100,26 70,26 Z"
        fill={base}
      />
      {/* facial tentacle cluster (mouth-parts) */}
      {[0, 1, 2, 3].map((i) => {
        const dx = -12 + i * 8;
        const wob = (hash(seed + "face" + i) % 8) - 4;
        return (
          <path
            key={i}
            d={`M${70 + dx},80 Q${70 + dx + wob},94 ${70 + dx},104`}
            stroke={dark}
            strokeWidth="3.4"
            fill="none"
            strokeLinecap="round"
          />
        );
      })}
      {/* many small eyes, since this is boss/eldritch-tier */}
      {[[54, 50], [86, 50], [70, 62], [46, 64], [94, 64]].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="6" fill={light} />
          <circle cx={x} cy={y} r="2.4" fill={dark} />
        </g>
      ))}
      {rank === "worldboss" && (
        <ellipse cx="70" cy="62" rx="58" ry="58" fill="none" stroke={light} strokeWidth="0.6" opacity="0.25" strokeDasharray="2 6" />
      )}
    </g>
  );
}

// ---------- CROCODILIAN: low armored reptile-god quadruped ----------
export function CrocodilianFigure({ name, race }) {
  const seed = name;
  const base = colorForFallback(name, race?.color || "#3f5233");
  const light = lighten(base, 45);
  const dark = lighten(base, -55);
  const tailWave = (hash(seed + "croc") % 12) - 6;

  return (
    <g transform="translate(0 26)">
      {/* death-roll tail, thick base tapering to a point */}
      <path
        d={`M104,40 Q136,${44 + tailWave} 150,${30 + tailWave} Q140,42 150,56 Q134,${48 - tailWave} 108,52 Z`}
        fill={base}
      />
      {[0, 1, 2].map((i) => (
        <polygon
          key={i}
          points={`${112 + i * 12},${36 - (i % 2) * 4} ${117 + i * 12},${26 - (i % 2) * 4} ${122 + i * 12},${36 - (i % 2) * 4}`}
          fill={dark}
        />
      ))}
      {/* four squat legs */}
      {[18, 40, 78, 100].map((x, i) => (
        <rect key={i} x={x} y="52" width="12" height="20" rx="4" fill={dark} />
      ))}
      {/* long low armored body */}
      <path d="M4,34 Q60,18 116,34 L112,58 Q60,70 8,58 Z" fill={base} />
      {/* back plating, a row of osteoderm ridges */}
      {[16, 34, 52, 70, 88].map((x, i) => (
        <polygon key={i} points={`${x},32 ${x + 7},20 ${x + 14},32`} fill={dark} />
      ))}
      <path d="M14,44 Q60,52 106,44" stroke={light} strokeWidth="2" fill="none" opacity="0.4" />
      {/* elongated snout head */}
      <path d="M4,34 L-30,30 L-34,42 L-28,50 L4,50 Z" fill={base} />
      <path d="M-30,30 L-34,42 L-24,42 Z" fill={dark} opacity="0.5" />
      {/* jagged teeth along the jawline */}
      {[-4, -10, -16, -22].map((x, i) => (
        <polygon key={i} points={`${x},49 ${x - 3},56 ${x + 3},49`} fill="#f4efe2" />
      ))}
      <circle cx="-6" cy="30" r="3" fill={dark} />
      <circle cx="8" cy="30" r="3" fill={dark} />
    </g>
  );
}

// ---------- CLAW-TENTACLE-GHOUL: hulking biped, claw arm + tentacle back ----------
export function ClawTentacleGhoulFigure({ name, race }) {
  const seed = name;
  const base = colorForFallback(name, race?.color || "#5a6b3a");
  const light = lighten(base, 45);
  const dark = lighten(base, -55);
  const tentacles = Array.from({ length: 4 }).map((_, i) => {
    const wob = (hash(seed + "gt" + i) % 16) - 8;
    const x0 = 46 + i * 10;
    return `M${x0},64 Q${x0 + wob},92 ${x0 - 4 + wob / 2},118`;
  });

  return (
    <g>
      {/* feeding tentacles trailing from the torn back, drawn first (behind torso) */}
      {tentacles.map((d, i) => (
        <path key={i} d={d} stroke={dark} strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.9" />
      ))}
      {/* legs, slightly bent / hunched stance */}
      <rect x="34" y="104" width="10" height="18" rx="3" fill={dark} transform="rotate(6 39 113)" />
      <rect x="58" y="104" width="10" height="18" rx="3" fill={dark} transform="rotate(-4 63 113)" />
      {/* hunched, asymmetric torso */}
      <path d="M28,58 L74,54 L82,106 L22,108 Z" fill={base} />
      <path d="M32,66 Q52,74 70,66" stroke={dark} strokeWidth="1.6" fill="none" opacity="0.5" />
      {/* torn back wound where the tentacles emerge */}
      <path d="M46,58 Q56,66 66,58 L62,72 Q54,78 48,72 Z" fill={dark} opacity="0.8" />
      {/* small normal arm */}
      <rect x="16" y="62" width="9" height="30" rx="4" fill={base} transform="rotate(10 20 77)" />
      {/* oversized claw arm, dominant visual weight */}
      <path d="M78,50 L100,46 L112,70 L96,86 L80,80 Z" fill={base} />
      <polygon points="106,64 122,58 118,72" fill={light} />
      <polygon points="104,74 120,74 112,88" fill={light} />
      <polygon points="98,80 108,92 96,94" fill={light} />
      {/* hunched neck + head, tilted */}
      <rect x="42" y="42" width="14" height="12" fill={base} transform="rotate(-6 49 48)" />
      <circle cx="46" cy="30" r="16" fill={base} />
      {/* sunken glowing eyes, no other facial detail — deliberately blank/eroded */}
      <circle cx="40" cy="30" r="2.6" fill={light} />
      <circle cx="52" cy="30" r="2.6" fill={light} />
      <path d="M38,38 Q46,42 54,38" stroke={dark} strokeWidth="1.6" fill="none" />
      {/* patchy exposed ribs along the flank for texture */}
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M${30 + i * 10},70 L${34 + i * 10},92`} stroke={dark} strokeWidth="1.4" opacity="0.5" />
      ))}
    </g>
  );
}

// ---------- boss factory ----------
// Call as ENIGMATIC_BOSSES(race, makeCreature) from within
// CodexCreatureDisplay.jsx, passing its existing `race` lookup and
// `makeCreature` factory so flavor generation stays consistent.
export function ENIGMATIC_BOSSES(race, makeCreature) {
  return [
    makeCreature("Mind-Flayer Prime, the Dreaming God", race("eldritch"), "worldboss", {
      lore: "It does not attack the body first. By the time you see its wings unfold, it has already been inside your mind for some time.",
      habitat: "The Drowned Sky-Rift",
      weakness: "Concentrated Light",
    }),
    makeCreature("Sobek, Scale Sovereign of the Flood", race("sea"), "boss", {
      lore: "The river gods drowned first. He simply outlasted them, and kept their throne at the bottom of the delta.",
      habitat: "The Sunken Delta Throne",
      weakness: "Purified Salt",
    }),
    makeCreature("Rend-Maw, the Harrow Ghoul", race("cursed"), "boss", {
      lore: "What is left of him no longer remembers hunger as a feeling — only as a shape his body keeps making.",
      habitat: "The Charnel Undercroft",
      weakness: "Holy Fire",
    }),
  ];
}
