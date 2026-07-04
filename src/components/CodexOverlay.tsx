import React, { useMemo, useState } from 'react';

interface CodexOverlayProps {
  onClose: () => void;
  bestiary?: unknown;
  playSound?: unknown;
}

type CodexThemeStyle = React.CSSProperties & Record<`--${string}`, string>;

type RaceId =
  | 'dragons'
  | 'vampires'
  | 'lycans'
  | 'demons'
  | 'celestials'
  | 'titans'
  | 'sea'
  | 'forest'
  | 'cursed'
  | 'necromancy'
  | 'gargoyles'
  | 'abyssal'
  | 'mythological'
  | 'eldritch';

type RankId = 'common' | 'elite' | 'boss' | 'worldboss' | 'mythic' | 'eldritch';

interface RaceDef {
  id: RaceId;
  name: string;
  color: string;
  tagline: string;
}

interface Creature {
  name: string;
  race: RaceId;
  rank: RankId;
  weakness: string;
  habitat: string;
  drop: string;
  lore: string;
  height: string;
  bloodMoonVariant: string;
}

interface WorldBoss {
  name: string;
  where: string;
  mechanic: string;
}

interface RowProps {
  label: string;
  value: string;
  accent?: boolean;
}

interface SigilProps {
  name: string;
  race: RaceDef;
  rank: RankId;
  size?: number;
}

interface FigureProps {
  name: string;
  race: RaceDef;
  rank: RankId;
  giant?: boolean;
  variant?: string;
}

interface BeastHeadProps {
  variant: string;
  cx: number;
  cy: number;
  color: string;
  light: string;
  dark: string;
  scale?: number;
  seed?: string;
}

interface HornProps {
  type: string | string[] | null;
  color: string;
}

interface EarsProps {
  type: string | string[] | null;
  color: string;
}

interface WingsProps {
  type: string | string[] | null;
  color: string;
}

interface TailProps {
  type: string | string[] | null;
  color: string;
  seed: string;
}

interface FaceMaskProps {
  type: string;
  light: string;
  dark: string;
}

const KEYWORD_HUES: Array<[RegExp, string]> = [
  [/flame|fire|lava|ash|ember|infernal|hell|crown/i, '#c2451f'],
  [/frost|ice|snow|winter|yuki/i, '#5fb8c9'],
  [/storm|thunder|wind|tengu|harpy/i, '#7a6fd0'],
  [/crystal/i, '#4fbfa8'],
  [/shadow|night|void|dark|abyss|hollow/i, '#6a4d9c'],
  [/sun|gold|holy|light|celestial|seraph|sol/i, '#d9a441'],
  [/moon|silver|lunar/i, '#b9c2d0'],
  [/bone|skeleton|corpse|death|lich/i, '#cfc6a8'],
  [/sand|desert|scarab|anubis/i, '#c99a5b'],
  [/sea|water|leviathan|kraken|coral|siren|merrow/i, '#3d84b8'],
  [/forest|leaf|dryad|treant|vine|thorn|mushroom/i, '#5f9457'],
  [/blood|crimson|vampire/i, '#8c1f28'],
  [/poison|plague|acid|toxic/i, '#7a9c3a'],
  [/eldritch|eye|dream|reality|architect|choir|watcher|maw/i, '#4a2e6e'],
];

const RACE_FEATURES: Record<RaceId, { ears: string | string[]; horn: string | string[]; wing: string | string[]; tail: string | string[]; face: string }> = {
  dragons: { ears: 'none', horn: ['curvedLong', 'straightSpike'], wing: ['bat'], tail: ['spade', 'whip'], face: 'reptile' },
  vampires: { ears: ['pointed'], horn: 'none', wing: ['bat', 'none'], tail: ['none', 'whip'], face: 'fang' },
  lycans: { ears: ['wolf'], horn: 'none', wing: 'none', tail: ['fluffy'], face: 'snout' },
  demons: { ears: ['pointed'], horn: ['curvedLong', 'straightSpike'], wing: ['bat'], tail: ['spade'], face: 'fang' },
  celestials: { ears: 'none', horn: ['halo'], wing: ['feather'], tail: 'none', face: 'visor' },
  titans: { ears: 'none', horn: 'none', wing: 'none', tail: 'none', face: 'crack' },
  sea: { ears: ['fin'], horn: 'none', wing: ['fin'], tail: ['fish'], face: 'gill' },
  forest: { ears: ['leaf'], horn: ['antler'], wing: 'none', tail: ['vine'], face: 'visor' },
  cursed: { ears: 'none', horn: ['straightSpike', 'none'], wing: 'none', tail: ['whip', 'none'], face: 'stitch' },
  necromancy: { ears: 'none', horn: 'none', wing: ['bat', 'none'], tail: 'none', face: 'skull' },
  gargoyles: { ears: ['pointed'], horn: ['curvedLong'], wing: ['stone'], tail: ['spade'], face: 'crack' },
  abyssal: { ears: 'none', horn: 'none', wing: ['fin', 'none'], tail: ['whip'], face: 'thirdEye' },
  mythological: { ears: ['wolf', 'pointed'], horn: ['antler', 'curvedLong', 'none'], wing: ['feather', 'bat', 'none'], tail: ['whip', 'fish', 'none'], face: 'visor' },
  eldritch: { ears: 'none', horn: 'none', wing: ['fin'], tail: ['whip'], face: 'manyEyes' },
};

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function pick<T>(seedStr: string, arr: T[], salt = '') {
  return arr[hash(seedStr + salt) % arr.length];
}

function colorFor(name: string, fallback: string) {
  for (const [re, hex] of KEYWORD_HUES) if (re.test(name)) return hex;
  return fallback;
}

function lighten(hex: string, amt: number) {
  const num = parseInt(hex.slice(1), 16);
  let r = (num >> 16) + amt;
  let g = ((num >> 8) & 0xff) + amt;
  let b = (num & 0xff) + amt;
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function choose(seed: string, val: string | string[], salt: string) {
  if (!Array.isArray(val)) return val;
  return pick(seed, val, 'feat' + salt);
}

function Horns({ type, color }: HornProps) {
  if (type === 'curvedLong')
    return (
      <>
        <path d="M36,20 C29,8 33,-2 43,3" stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M64,20 C71,8 67,-2 57,3" stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" />
      </>
    );
  if (type === 'straightSpike')
    return (
      <>
        <polygon points="38,18 33,1 45,14" fill={color} />
        <polygon points="62,18 67,1 55,14" fill={color} />
      </>
    );
  if (type === 'antler')
    return (
      <>
        <path d="M38,20 L31,5 M31,10 L24,3 M31,14 L22,12" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M62,20 L69,5 M69,10 L76,3 M69,14 L78,12" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </>
    );
  if (type === 'halo') return <ellipse cx="50" cy="9" rx="15" ry="5" fill="none" stroke={color} strokeWidth="3" />;
  return null;
}

function Ears({ type, color }: EarsProps) {
  if (type === 'pointed')
    return (
      <>
        <polygon points="34,23 25,5 42,18" fill={color} />
        <polygon points="66,23 75,5 58,18" fill={color} />
      </>
    );
  if (type === 'wolf')
    return (
      <>
        <polygon points="32,25 20,2 44,17" fill={color} />
        <polygon points="68,25 80,2 56,17" fill={color} />
      </>
    );
  if (type === 'fin')
    return (
      <>
        <path d="M32,27 Q18,20 25,6 Q34,13 36,25 Z" fill={color} />
        <path d="M68,27 Q82,20 75,6 Q66,13 64,25 Z" fill={color} />
      </>
    );
  if (type === 'leaf')
    return (
      <>
        <ellipse cx="27" cy="18" rx="6" ry="13" fill={color} transform="rotate(-24 27 18)" />
        <ellipse cx="73" cy="18" rx="6" ry="13" fill={color} transform="rotate(24 73 18)" />
      </>
    );
  return null;
}

function Wings({ type, color }: WingsProps) {
  if (type === 'bat')
    return (
      <>
        <path d="M28,60 C8,54 2,76 9,92 C18,81 24,81 30,91 C25,76 30,66 28,60 Z" fill={color} />
        <path d="M72,60 C92,54 98,76 91,92 C82,81 76,81 70,91 C75,76 70,66 72,60 Z" fill={color} />
      </>
    );
  if (type === 'feather')
    return (
      <>
        <ellipse cx="14" cy="76" rx="10" ry="24" fill={color} transform="rotate(-16 14 76)" />
        <ellipse cx="86" cy="76" rx="10" ry="24" fill={color} transform="rotate(16 86 76)" />
      </>
    );
  if (type === 'stone')
    return (
      <>
        <polygon points="28,58 4,67 13,90 30,86" fill={color} />
        <polygon points="72,58 96,67 87,90 70,86" fill={color} />
      </>
    );
  if (type === 'fin')
    return (
      <>
        <path d="M30,58 Q12,65 19,82 Q28,73 32,66 Z" fill={color} />
        <path d="M70,58 Q88,65 81,82 Q72,73 68,66 Z" fill={color} />
      </>
    );
  return null;
}

function Tail({ type, color, seed }: TailProps) {
  const w = (hash(seed + 't') % 16) - 8;
  if (type === 'whip') return <path d={`M70,100 Q92,${102 + w} 88,126`} stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" />;
  if (type === 'spade')
    return (
      <>
        <path d={`M70,100 Q92,${102 + w} 88,120`} stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" />
        <polygon points="82,118 96,118 89,129" fill={color} />
      </>
    );
  if (type === 'fluffy') return <path d={`M70,100 Q94,${106 + w} 86,127`} stroke={color} strokeWidth="8" fill="none" strokeLinecap="round" />;
  if (type === 'fish')
    return (
      <>
        <path d="M70,100 Q89,105 84,120" stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" />
        <polygon points="77,116 93,111 92,127" fill={color} />
      </>
    );
  if (type === 'vine') return <path d="M70,100 Q91,107 82,125" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray="1 5" />;
  return null;
}

function FaceMask({ type, light, dark }: FaceMaskProps) {
  if (type === 'skull')
    return (
      <>
        <circle cx="44" cy="30" r="3.4" fill="#0a0a0d" />
        <circle cx="56" cy="30" r="3.4" fill="#0a0a0d" />
        <polygon points="50,34 47,40 53,40" fill="#0a0a0d" />
      </>
    );
  if (type === 'manyEyes')
    return (
      <>
        {[[42, 25], [58, 25], [50, 34], [35, 34], [65, 34]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="2" fill={dark} />
        ))}
      </>
    );
  if (type === 'thirdEye')
    return (
      <>
        <circle cx="50" cy="32" r="11" fill={light} />
        <circle cx="44" cy="32" r="2.2" fill={dark} />
        <circle cx="56" cy="32" r="2.2" fill={dark} />
        <ellipse cx="50" cy="19" rx="3" ry="4" fill={dark} />
      </>
    );

  const isReptile = type === 'reptile';
  return (
    <>
      <circle cx="50" cy="32" r="11" fill={light} />
      {isReptile ? (
        <>
          <ellipse cx="45" cy="32" rx="1.5" ry="4" fill={dark} />
          <ellipse cx="55" cy="32" rx="1.5" ry="4" fill={dark} />
        </>
      ) : (
        <>
          <circle cx="45" cy="32" r="2.3" fill={dark} />
          <circle cx="55" cy="32" r="2.3" fill={dark} />
        </>
      )}
      {type === 'fang' && (
        <>
          <polygon points="45,38 43,44 47,40" fill="#fff" />
          <polygon points="55,38 57,44 53,40" fill="#fff" />
        </>
      )}
      {type === 'snout' && <ellipse cx="50" cy="37" rx="6" ry="4" fill={dark} />}
      {type === 'gill' && [0, 1, 2].map((i) => <line key={i} x1="58" y1={28 + i * 3} x2="63" y2={28 + i * 3} stroke={dark} strokeWidth="1.2" />)}
      {type === 'stitch' && <path d="M42,26 L58,38 M58,26 L42,38" stroke={dark} strokeWidth="1.5" fill="none" />}
      {type === 'crack' && <path d="M40,23 L46,32 L41,40" stroke={dark} strokeWidth="1.5" fill="none" />}
    </>
  );
}

function BipedFigure({ name, race, rank, giant = false }: FigureProps) {
  const seed = name;
  const base = colorFor(name, race.color);
  const light = lighten(base, 55);
  const dark = lighten(base, -55);
  const feat = RACE_FEATURES[race.id] || RACE_FEATURES.mythological;
  const earType = choose(seed, feat.ears, 'ears');
  const hornType = choose(seed, feat.horn, 'horn');
  const wingType = choose(seed, feat.wing, 'wing');
  const tailType = choose(seed, feat.tail, 'tail');
  const w = giant ? 1.25 : 1;

  return (
    <g>
      {wingType && wingType !== 'none' && <Wings type={wingType} color={dark} />}
      {tailType && tailType !== 'none' && <Tail type={tailType} color={dark} seed={seed} />}
      <rect x={38 - (giant ? 4 : 0)} y="103" width={8 * w} height="16" rx="3" fill={dark} />
      <rect x={54 - (giant ? 0 : 0)} y="103" width={8 * w} height="16" rx="3" fill={dark} />
      <path d={giant ? 'M24,55 L76,55 L82,105 L18,105 Z' : 'M30,57 L70,57 L76,105 L24,105 Z'} fill={base} />
      {giant && (
        <>
          <path d="M32,68 Q50,74 68,68" stroke={dark} strokeWidth="1.4" fill="none" opacity="0.6" />
          <path d="M35,80 Q50,85 65,80" stroke={dark} strokeWidth="1.4" fill="none" opacity="0.6" />
        </>
      )}
      <rect x="42" y="80" width="16" height="7" rx="2" fill={light} />
      <circle cx={giant ? 22 : 26} cy="61" r={giant ? 12 : 10} fill={light} />
      <circle cx={giant ? 78 : 74} cy="61" r={giant ? 12 : 10} fill={light} />
      <rect x="44" y="43" width="12" height="10" fill={base} />
      {hornType && hornType !== 'none' && <Horns type={hornType} color={light} />}
      <circle cx="50" cy="32" r={giant ? 19 : 17} fill={base} />
      {earType && earType !== 'none' && <Ears type={earType} color={base} />}
      <FaceMask type={feat.face} light={light} dark={dark} />
    </g>
  );
}

function BeastHead({ variant, cx, cy, color, light, dark, scale = 1 }: BeastHeadProps) {
  const s = scale;
  return (
    <g transform={`translate(${cx} ${cy}) scale(${s})`}>
      {variant === 'dragon' && (
        <>
          <path d="M0,0 L26,-4 L34,4 L26,10 L0,14 Z" fill={color} />
          <polygon points="4,-4 -2,-16 10,-6" fill={light} />
          <polygon points="14,-6 12,-18 22,-8" fill={light} />
          <polygon points="30,3 40,-1 34,7" fill={dark} />
          <circle cx="20" cy="2" r="2" fill={dark} />
        </>
      )}
      {variant === 'wolf' && (
        <>
          <path d="M0,2 L20,-2 L30,5 L20,9 L0,12 Z" fill={color} />
          <polygon points="2,-4 -4,-14 8,-6" fill={color} />
          <polygon points="10,-6 8,-16 18,-8" fill={color} />
          <polygon points="28,4 36,3 30,8" fill="#fff" />
          <circle cx="16" cy="1" r="1.8" fill={dark} />
        </>
      )}
      {variant === 'chimera' && (
        <>
          <path d="M0,2 L22,-3 L32,5 L22,10 L0,13 Z" fill={color} />
          <path d="M4,-5 C-2,-12 4,-18 10,-13" stroke={light} strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M10,-3 C10,-14 20,-16 20,-8" stroke={light} strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx="18" cy="2" r="1.8" fill={dark} />
        </>
      )}
      {variant === 'beetle' && (
        <>
          <ellipse cx="10" cy="2" rx="14" ry="9" fill={color} />
          <path d="M20,0 L28,-3 M20,3 L29,3" stroke={dark} strokeWidth="1.6" />
          <circle cx="4" cy="0" r="1.8" fill={dark} />
        </>
      )}
      {variant === 'horse' && (
        <>
          <path d="M0,-2 L26,-6 L34,3 L26,8 L0,10 Z" fill={color} />
          <path d="M2,-8 Q10,-18 18,-10" fill={dark} opacity="0.7" />
          <circle cx="20" cy="1" r="1.8" fill={dark} />
        </>
      )}
      {variant === 'spider' && (
        <>
          <circle cx="6" cy="2" r="9" fill={color} />
          {[[-2, -4], [2, -6], [-2, 6], [2, 4]].map(([dx, dy], i) => (
            <circle key={i} cx={6 + dx} cy={2 + dy} r="1.3" fill={dark} />
          ))}
        </>
      )}
    </g>
  );
}

function QuadrupedFigure({ name, race, variant = 'dragon' }: FigureProps) {
  const seed = name;
  const base = colorFor(name, race.color);
  const light = lighten(base, 55);
  const dark = lighten(base, -55);
  const isDragon = variant === 'dragon';
  const legCount = variant === 'spider' ? 6 : 4;
  const legXs = legCount === 6 ? [24, 44, 64, 84, 104, 124] : [30, 55, 85, 108];
  const wobble = (hash(seed + 'q') % 10) - 5;

  return (
    <g transform="translate(0 10)">
      {isDragon && (
        <>
          <path d="M55,30 C40,4 15,4 8,22 C24,20 34,28 42,38 Z" fill={dark} />
          <path d="M85,30 C100,4 125,4 132,22 C116,20 106,28 98,38 Z" fill={dark} />
        </>
      )}
      {variant === 'chimera' && (
        <path d={`M108,60 Q128,${58 + wobble} 132,44`} stroke={dark} strokeWidth="4" fill="none" strokeLinecap="round" />
      )}
      {(variant === 'wolf' || variant === 'dragon' || variant === 'horse') && (
        <path
          d={variant === 'wolf' ? `M108,60 Q130,${64 + wobble} 126,80` : `M110,58 Q132,${58 + wobble} 130,78`}
          stroke={dark}
          strokeWidth={variant === 'wolf' ? 8 : 5}
          fill="none"
          strokeLinecap="round"
        />
      )}
      {variant === 'cerberus' && <path d={`M108,60 Q128,${62 + wobble} 124,78`} stroke={dark} strokeWidth="5" fill="none" strokeLinecap="round" />}

      {legXs.map((x, i) => (
        <g key={i}>
          <rect x={x} y="56" width="9" height={legCount === 6 ? 26 : 34} rx="4" fill={dark} />
          <ellipse cx={x + 4.5} cy="60" rx="6" ry="5" fill={light} opacity="0.5" />
        </g>
      ))}

      <path d="M22,44 Q75,28 118,44 L114,64 Q75,76 26,64 Z" fill={base} />
      {variant === 'beetle' && <ellipse cx="70" cy="44" rx="46" ry="14" fill={dark} opacity="0.35" />}
      {isDragon && (
        <>
          <polygon points="35,30 42,20 45,32" fill={light} />
          <polygon points="55,26 62,15 65,29" fill={light} />
          <polygon points="75,25 82,14 85,28" fill={light} />
        </>
      )}
      <path d="M35,50 Q75,58 108,50" stroke={light} strokeWidth="2" fill="none" opacity="0.5" />

      {variant === 'cerberus' ? (
        <>
          <BeastHead variant="wolf" cx={4} cy={30} color={base} light={light} dark={dark} scale={0.75} />
          <BeastHead variant="wolf" cx={8} cy={44} color={base} light={light} dark={dark} scale={1} />
          <BeastHead variant="wolf" cx={4} cy={58} color={base} light={light} dark={dark} scale={0.75} />
        </>
      ) : (
        <BeastHead variant={variant} cx={6} cy={42} color={base} light={light} dark={dark} scale={1.05} />
      )}
    </g>
  );
}

function SerpentFigure({ name, race }: FigureProps) {
  const seed = name;
  const base = colorFor(name, race.color);
  const light = lighten(base, 55);
  const dark = lighten(base, -55);
  const amp = 14 + (hash(seed + 's') % 8);
  const d = `M6,${70 - amp} Q30,${70 + amp} 54,${70 - amp} T102,${70 - amp} T134,${70}`;

  return (
    <g>
      <path d={d} stroke={base} strokeWidth="20" fill="none" strokeLinecap="round" />
      <path d={d} stroke={light} strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.5" transform="translate(0 -6)" />
      {[24, 48, 72, 96].map((t, i) => (
        <polygon key={i} points={`${t},${58 - (i % 2 === 0 ? amp - 6 : -(amp - 6))} ${t + 5},${50 - (i % 2 === 0 ? amp - 6 : -(amp - 6))} ${t + 10},${58 - (i % 2 === 0 ? amp - 6 : -(amp - 6))}`} fill={dark} opacity="0.7" />
      ))}
      <ellipse cx="14" cy={70 - amp} rx="13" ry="11" fill={base} />
      <polygon points="2,68 -10,64 -8,76" fill={base} />
      <polygon points="10,60 4,50 16,56" fill={dark} />
      <circle cx="18" cy={68 - amp} r="2" fill={dark} />
      <path d="M130,68 L142,58 M130,72 L142,80" stroke={dark} strokeWidth="4" strokeLinecap="round" />
    </g>
  );
}

function TentacledFigure({ name, race, rank }: FigureProps) {
  const seed = name;
  const base = colorFor(name, race.color);
  const light = lighten(base, 55);
  const dark = lighten(base, -55);
  const manyEyed = rank === 'eldritch' || /eye|watcher|thousand/i.test(name);
  const tentacles = [0, 1, 2, 3, 4, 5].map((i) => {
    const ang = -70 + i * 28;
    const wob = (hash(seed + i) % 14) - 7;
    return `M${60 + Math.cos((ang * Math.PI) / 180) * 20},${60 + Math.sin((ang * Math.PI) / 180) * 10 + 30} Q${60 + Math.cos((ang * Math.PI) / 180) * 44 + wob},95 ${60 + Math.cos((ang * Math.PI) / 180) * 30},112`;
  });

  return (
    <g transform="translate(0 4)">
      {tentacles.map((d, i) => (
        <path key={i} d={d} stroke={dark} strokeWidth="7" fill="none" strokeLinecap="round" />
      ))}
      <path d="M60,26 C34,26 22,46 30,64 C36,76 48,82 60,82 C72,82 84,76 90,64 C98,46 86,26 60,26 Z" fill={base} />
      {manyEyed
        ? [[46, 46], [74, 46], [60, 58], [40, 62], [80, 62]].map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="5.5" fill={light} />
              <circle cx={x} cy={y} r="2" fill={dark} />
            </g>
          ))
        : (
            <>
              <circle cx="52" cy="52" r="7" fill={light} />
              <circle cx="52" cy="52" r="3" fill={dark} />
              <circle cx="70" cy="52" r="7" fill={light} />
              <circle cx="70" cy="52" r="3" fill={dark} />
            </>
          )}
    </g>
  );
}

function AvianFigure({ name, race }: FigureProps) {
  const base = colorFor(name, race.color);
  const light = lighten(base, 55);
  const dark = lighten(base, -55);

  return (
    <g transform="translate(20 2)">
      <path d="M4,44 C-18,30 -22,4 -4,-8 C4,10 14,20 26,26 Z" fill={dark} />
      <path d="M96,44 C118,30 122,4 104,-8 C96,10 86,20 74,26 Z" fill={dark} />
      <path d="M32,54 L40,100 L34,104 L26,58 Z" fill={dark} />
      <path d="M68,54 L60,100 L66,104 L74,58 Z" fill={dark} />
      <polygon points="26,102 34,100 30,110" fill={dark} />
      <polygon points="74,102 66,100 70,110" fill={dark} />
      <path d="M30,40 L70,40 L64,66 L36,66 Z" fill={base} />
      <path d="M38,48 L62,48 M40,56 L60,56" stroke={dark} strokeWidth="1.4" opacity="0.5" />
      <circle cx="50" cy="24" r="15" fill={base} />
      <polygon points="34,20 22,16 32,28" fill={dark} />
      <polygon points="66,20 78,16 68,28" fill={dark} />
      <polygon points="44,26 50,34 56,26" fill={light} />
      <circle cx="44" cy="21" r="2.1" fill={dark} />
      <circle cx="56" cy="21" r="2.1" fill={dark} />
    </g>
  );
}

function OozeFigure({ name, race }: FigureProps) {
  const base = colorFor(name, race.color);
  const light = lighten(base, 55);
  const dark = lighten(base, -55);
  const w = (i: number) => (hash(name + 'o' + i) % 8) - 4;

  return (
    <g transform="translate(20 20)">
      <path
        d={`M50,${6 + w(0)} C${20 + w(1)},${10 + w(2)} ${4 + w(3)},${40 + w(4)} ${14 + w(5)},${70 + w(6)} C20,94 40,100 50,100 C60,100 80,94 ${86 + w(1)},${70 + w(2)} C96,40 ${80 + w(5)},10 50,${6 + w(6)} Z`}
        fill={base}
        opacity="0.92"
      />
      <ellipse cx="34" cy="40" rx="8" ry="10" fill={light} opacity="0.4" />
      <ellipse cx="64" cy="55" rx="6" ry="8" fill={dark} opacity="0.35" />
      <circle cx="40" cy="52" r="4" fill={dark} />
      <circle cx="60" cy="50" r="4" fill={dark} />
      <path d="M40,68 Q50,74 60,68" stroke={dark} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M20,88 Q24,100 18,110" stroke={base} strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.8" />
      <path d="M80,86 Q78,98 84,108" stroke={base} strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.8" />
    </g>
  );
}

function ArmoredFigure({ name, race }: FigureProps) {
  const base = colorFor(name, race.color);
  const light = lighten(base, 55);
  const dark = lighten(base, -55);

  return (
    <g transform="translate(24 4)">
      <rect x="14" y="70" width="14" height="30" fill={dark} />
      <rect x="64" y="70" width="14" height="30" fill={dark} />
      <polygon points="10,40 82,40 92,72 0,72" fill={base} />
      <polygon points="20,48 72,48 76,60 16,60" fill={dark} opacity="0.5" />
      <rect x="38" y="50" width="16" height="10" fill={light} />
      <polygon points="-6,36 14,30 14,58 -6,64" fill={dark} />
      <polygon points="98,36 78,30 78,58 98,64" fill={dark} />
      <rect x="26" y="6" width="40" height="36" rx="4" fill={base} />
      <rect x="34" y="20" width="10" height="4" fill={light} />
      <rect x="48" y="20" width="10" height="4" fill={light} />
      <polygon points="26,6 46,-6 66,6" fill={dark} />
      <rect x="24" y="4" width="44" height="6" fill={dark} />
    </g>
  );
}

function PlantFigure({ name, race }: FigureProps) {
  const seed = name;
  const base = colorFor(name, race.color);
  const light = lighten(base, 55);
  const dark = lighten(base, -55);
  const w = (hash(seed + 'p') % 10) - 5;

  return (
    <g transform="translate(20 2)">
      <path d={`M40,100 Q30,${112 + w} 20,116 M40,100 Q42,114 34,124 M60,100 Q70,${112 - w} 80,116 M60,100 Q58,114 66,124`} stroke={dark} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M34,54 C24,64 26,88 40,100 L60,100 C74,88 76,64 66,54 Z" fill={base} />
      <path d="M42,66 Q50,72 58,66" stroke={dark} strokeWidth="1.6" fill="none" opacity="0.6" />
      <path d={`M32,60 Q10,${50 + w} 6,30`} stroke={dark} strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d={`M68,60 Q90,${50 - w} 94,30`} stroke={dark} strokeWidth="5" fill="none" strokeLinecap="round" />
      <circle cx="6" cy="28" r="7" fill={light} />
      <circle cx="94" cy="28" r="7" fill={light} />
      <circle cx="50" cy="34" r="16" fill={base} />
      <path d="M36,22 Q50,4 64,22 Q54,16 50,22 Q46,16 36,22 Z" fill={light} />
      <circle cx="45" cy="34" r="2" fill={dark} />
      <circle cx="55" cy="34" r="2" fill={dark} />
    </g>
  );
}

function CentaurFigure({ name, race }: FigureProps) {
  const base = colorFor(name, race.color);
  const light = lighten(base, 55);
  const dark = lighten(base, -55);

  return (
    <g transform="translate(0 14)">
      {[26, 50, 78, 102].map((x, i) => (
        <rect key={i} x={x} y="56" width="9" height="30" rx="4" fill={dark} />
      ))}
      <path d="M14,40 Q65,26 116,40 L110,62 Q65,72 20,62 Z" fill={base} />
      <path d="M108,44 Q128,48 124,64" stroke={dark} strokeWidth="6" fill="none" strokeLinecap="round" />
      <rect x="34" y="8" width="18" height="34" rx="6" fill={base} transform="rotate(-8 43 25)" />
      <circle cx="40" cy="6" r="12" fill={base} />
      <polygon points="30,0 24,-10 36,-4" fill={light} />
      <polygon points="50,0 56,-10 44,-4" fill={light} />
      <circle cx="36" cy="5" r="1.8" fill={dark} />
      <circle cx="44" cy="5" r="1.8" fill={dark} />
    </g>
  );
}

const BODY_OVERRIDES: Array<[RegExp, string]> = [
  [/j[oö]rmungor|n[ií]ðhoggr|nidhoggr|leviathan|serpent of ra|sea serpent|abyss shark/i, 'serpent'],
  [/kraken|eye beast|void walker|void spider|reality eater|shadow whale|night terror|mirror demon|dream devourer|thousand-eyed|flesh cathedral|hollow choir|maw of infinity|weeping moon|hand of oblivion|nameless choir|dream eater/i, 'tentacled'],
  [/cerberus/i, 'quad:cerberus'],
  [/chimera/i, 'quad:chimera'],
  [/scarab/i, 'quad:beetle'],
  [/kelpie/i, 'quad:horse'],
  [/dragon/i, 'quad:dragon'],
  [/wolf|lycan|fenrir/i, 'quad:wolf'],
  [/spider/i, 'quad:spider'],
  [/harpy|tengu/i, 'avian'],
  [/slime|plague giant|^ooze|jelly/i, 'ooze'],
  [/living armor|mutated knight|flesh golem|stone golem|lava golem|ash titan/i, 'armored'],
  [/forest guardian|beast lord/i, 'centaur'],
  [/treant|dryad|living vine|mushroom giant/i, 'plant'],
];

const RACE_BODY_DEFAULT: Partial<Record<RaceId, string>> = { titans: 'giant' };

function getBody(name: string, raceId: RaceId) {
  for (const [re, type] of BODY_OVERRIDES) if (re.test(name)) return type;
  return RACE_BODY_DEFAULT[raceId] || 'biped';
}

function Sigil({ name, race, rank, size = 84 }: SigilProps) {
  const body = getBody(name, race.id);
  const isBoss = rank === 'boss' || rank === 'worldboss';
  const isEldritch = rank === 'eldritch';
  const ringColor = isBoss ? '#d9a441' : isEldritch ? '#8b5fd6' : 'transparent';

  let inner: React.ReactNode = null;
  let offsetX = 20;
  let offsetY = 4;
  let innerScale = 1;
  if (body === 'biped') {
    inner = <BipedFigure name={name} race={race} rank={rank} />;
  } else if (body === 'giant') {
    inner = <BipedFigure name={name} race={race} rank={rank} giant />;
    offsetX = 16;
    offsetY = 2;
  } else if (body.startsWith('quad:')) {
    inner = <QuadrupedFigure name={name} race={race} rank={rank} variant={body.split(':')[1]} />;
    offsetX = 0;
    offsetY = 20;
  } else if (body === 'serpent') {
    inner = <SerpentFigure name={name} race={race} rank={rank} />;
    offsetX = 0;
    offsetY = 15;
  } else if (body === 'tentacled') {
    inner = <TentacledFigure name={name} race={race} rank={rank} />;
    offsetX = 10;
    offsetY = 8;
  } else if (body === 'avian') {
    inner = <AvianFigure name={name} race={race} rank={rank} />;
    offsetX = 0;
    offsetY = 4;
  } else if (body === 'ooze') {
    inner = <OozeFigure name={name} race={race} rank={rank} />;
    offsetX = 0;
    offsetY = 0;
  } else if (body === 'armored') {
    inner = <ArmoredFigure name={name} race={race} rank={rank} />;
    offsetX = 0;
    offsetY = 4;
  } else if (body === 'plant') {
    inner = <PlantFigure name={name} race={race} rank={rank} />;
    offsetX = 0;
    offsetY = 4;
  } else if (body === 'centaur') {
    inner = <CentaurFigure name={name} race={race} rank={rank} />;
    offsetX = 0;
    offsetY = 10;
  }

  return (
    <svg viewBox="0 0 140 140" width={size} height={size}>
      {ringColor !== 'transparent' && <ellipse cx="70" cy="70" rx="64" ry="64" fill="none" stroke={ringColor} strokeWidth="1" strokeDasharray="2 4" opacity="0.7" />}
      <g transform={`translate(${offsetX} ${offsetY}) scale(${innerScale})`}>{inner}</g>
    </svg>
  );
}

const FLAVOR = {
  weaknesses: ['Holy Fire', 'Silver', 'Blessed Water', 'Sunlight', 'Cold Iron', 'Dragonfire', 'Runic Wards', 'Purified Salt', 'Moonsteel', 'Void Sever', 'Concentrated Light', 'Alchemical Frost'],
  habitats: ['Frozen Peaks', 'Sunken Ruins', 'Blood Moon Wastes', 'Cathedral Undercroft', 'Ashen Wastes', 'Whispering Forest', 'Drowned Coastline', 'Obsidian Caverns', 'Fallen Watchtowers', 'The Hollow Roads', 'Crypt of Kings', 'The Weeping Marsh'],
  drops: ['Fang Shard', 'Ember Core', 'Soul Ash', 'Runed Bone', 'Ichor Vial', 'Wing Membrane', 'Cursed Sigil', 'Frost Marrow', 'Blood Crystal', 'Hollow Eye', 'Scaled Hide', 'Void Dust'],
  loreVerbs: ['once served', 'was cast out by', 'hunted alongside', 'broke free from', 'was born from the ashes of', 'still obeys the will of', 'guards a secret buried by', 'was forged in defiance of'],
};

function genLore(name: string, race: RaceDef) {
  const verb = pick(name, FLAVOR.loreVerbs, 'lore');
  return `"One of the ${race.name.toLowerCase()}, it ${verb} the old order of Neteria, and has not forgotten."`;
}

function genHeight(name: string) {
  const h = 1.6 + (hash(name + 'h') % 40) / 10;
  return `${h.toFixed(1)} meters`;
}

function makeCreature(name: string, race: RaceDef, rank: RankId = 'common', overrides: Partial<Creature> = {}) {
  return {
    name,
    race: race.id,
    rank,
    weakness: pick(name, FLAVOR.weaknesses, 'w'),
    habitat: pick(name, FLAVOR.habitats, 'h'),
    drop: pick(name, FLAVOR.drops, 'd'),
    lore: genLore(name, race),
    height: genHeight(name),
    bloodMoonVariant: `Blood Moon ${name}`,
    ...overrides,
  } as Creature;
}

const RACES: RaceDef[] = [
  { id: 'dragons', name: 'Primordial Dragons', color: '#c2451f', tagline: 'The oldest beings in the world.' },
  { id: 'vampires', name: 'Vampires', color: '#8c1f28', tagline: 'Not every vampire fights the same.' },
  { id: 'lycans', name: 'Lycans', color: '#8a8a92', tagline: 'Werewolves are only one branch.' },
  { id: 'demons', name: 'Demons', color: '#c2451f', tagline: 'Different hells. Different demons.' },
  { id: 'celestials', name: 'Celestials', color: '#d9a441', tagline: 'Not all angels are good.' },
  { id: 'titans', name: 'Ancient Titans', color: '#8a7a63', tagline: 'Massive beings sleeping beneath mountains.' },
  { id: 'sea', name: 'Sea Folk', color: '#3d84b8', tagline: 'A forgotten underwater civilization.' },
  { id: 'forest', name: 'Forest Spirits', color: '#5f9457', tagline: 'Not friendly. They protect what is sacred.' },
  { id: 'cursed', name: 'Cursed Experiments', color: '#7a9c3a', tagline: 'Created by humans. Regretted by everyone.' },
  { id: 'necromancy', name: 'Necromancy', color: '#cfc6a8', tagline: 'Not just skeletons.' },
  { id: 'gargoyles', name: 'Gargoyles', color: '#8a8a92', tagline: 'They look like statues. Until you walk past.' },
  { id: 'abyssal', name: 'Abyssal Creatures', color: '#4a2e6e', tagline: 'From beyond reality. Impossible anatomy.' },
  { id: 'mythological', name: 'Mythological', color: '#b9915c', tagline: 'Myths of the old world, reborn in Neteria.' },
  { id: 'eldritch', name: 'Eldritch Horrors', color: '#3b1f52', tagline: 'Touched by The Hunger. Late-game only.' },
];

const RACE_MAP: Record<RaceId, RaceDef> = Object.fromEntries(RACES.map((r) => [r.id, r])) as Record<RaceId, RaceDef>;

function race(id: RaceId) {
  return RACE_MAP[id];
}

const CREATURES: Creature[] = [];

CREATURES.push(
  ...['Flame Dragon', 'Frost Dragon', 'Storm Dragon', 'Crystal Dragon', 'Shadow Dragon', 'Sun Dragon', 'Moon Dragon', 'Abyss Dragon', 'Bone Dragon', 'Void Dragon', 'Emerald Forest Dragon', 'Sand Dragon', 'Lava Dragon', 'Sea Dragon', 'Celestial Dragon']
    .map((n) => makeCreature(n, race('dragons'))),
  makeCreature('Crimson Drake', race('dragons'), 'elite'),
  makeCreature('The Nameless Dragon', race('dragons'), 'worldboss', { lore: '"It has no name because no one who has seen it has lived to give it one."' })
);

CREATURES.push(
  ...['Blood Knight', 'Blood Mage', 'Noble', 'Executioner', 'Hunter', 'Bat Rider', 'Crimson Priest', 'Royal Guard', 'Blood Alchemist', 'Night Stalker']
    .map((n) => makeCreature(n, race('vampires')))
);

CREATURES.push(
  ...['Dire Wolf', 'Moon Wolf', 'Blood Wolf', 'Alpha Lycan', 'White Lycan', 'Shadow Lycan', 'Ancient Beast Lord']
    .map((n) => makeCreature(n, race('lycans'))),
  makeCreature('Fenrir', race('lycans'), 'worldboss', { lore: '"The first wolf to drink dragon blood."', habitat: 'Snow Mountains', drop: 'Moon Fang' }),
  makeCreature('The Moon King', race('lycans'), 'boss')
);

CREATURES.push(
  ...['Imp', 'Hell Knight', 'Succubus', 'Pit Lord', 'Infernal Beast', 'Flame Serpent', 'Hell Hound', 'Ash Titan', 'Lava Golem', 'Demon General']
    .map((n) => makeCreature(n, race('demons'))),
  makeCreature('Azrakh, Lord of Ash', race('demons'), 'boss')
);

CREATURES.push(
  ...['Broken Seraph', 'Holy Executioner', 'Wingless Angel', 'Sun Guardian', 'Light Warden', 'Golden Herald']
    .map((n) => makeCreature(n, race('celestials'))),
  makeCreature('The Fallen Archangel', race('celestials'), 'boss')
);

CREATURES.push(
  ...['Stone Titan', 'Ice Titan', 'Forest Titan', 'Volcano Titan', 'Crystal Titan', 'Storm Titan']
    .map((n) => makeCreature(n, race('titans'))),
  makeCreature('Atlas the World Bearer', race('titans'), 'worldboss', { habitat: 'Ancient Desert', lore: '"He carries the ruins of a world he no longer remembers."' })
);

CREATURES.push(
  ...['Merrow Warrior', 'Siren', 'Kraken Spawn', 'Sea Witch', 'Leviathan Hatchling', 'Coral Guardian', 'Abyss Shark', 'Sea Serpent']
    .map((n) => makeCreature(n, race('sea'))),
  makeCreature('Leviathan', race('sea'), 'worldboss', { habitat: 'Ocean', lore: '"The sea does not calm. It waits for him to sleep."' })
);

CREATURES.push(
  ...['Dryad', 'Treant', 'Thorn Beast', 'Mushroom Giant', 'Forest Guardian', 'Spirit Deer', 'Living Vine']
    .map((n) => makeCreature(n, race('forest'))),
  makeCreature('Mother Tree', race('forest'), 'boss')
);

CREATURES.push(
  ...['Frankenstein', 'Flesh Golem', 'Mutated Knight', 'Bone Spider', 'Blood Beast', 'Plague Giant', 'Living Armor', 'Acid Slime', 'Ghoul']
    .map((n) => makeCreature(n, race('cursed'))),
  makeCreature('Doctor Victor', race('cursed'), 'boss')
);

CREATURES.push(
  ...['Skeleton Knight', 'Skeleton Archer', 'Skeleton Mage', 'Bone Giant', 'Soul Collector', 'Lich', 'Ghost', 'Banshee', 'Death Priest', 'Corpse Walker']
    .map((n) => makeCreature(n, race('necromancy'))),
  makeCreature('Necromancer King', race('necromancy'), 'boss')
);

CREATURES.push(
  ...['Stone Gargoyle', 'Winged Gargoyle', 'Poison Gargoyle', 'Fire Gargoyle', 'Crystal Gargoyle', 'King Gargoyle']
    .map((n) => makeCreature(n, race('gargoyles'))),
  makeCreature('The Cathedral Watcher', race('gargoyles'), 'boss')
);

CREATURES.push(
  ...['Void Walker', 'Eye Beast', 'Reality Eater', 'Shadow Whale', 'Night Terror', 'Mirror Demon', 'Dream Devourer', 'Void Spider']
    .map((n) => makeCreature(n, race('abyssal'))),
  makeCreature('The Architect', race('abyssal'), 'boss')
);

const MYTH = [
  ['Minotaur Warlord', 'Charges through walls and fights inside a shifting labyrinth arena.'],
  ['Gorgon Matriarch', 'Petrifies any player who holds her gaze too long.'],
  ['Chimera Prime', 'Lion, serpent, and ram — three independent attack styles in one body.'],
  ['Harpy Queen', 'Commands the wind and rains down aerial strikes.'],
  ['Cerberus, Warden of Ash', 'Three heads breathe fire, poison, and shadow.'],
  ['Jörmungor, the World Serpent', 'A colossal serpent that coils around the entire arena.'],
  ['Frost Jotunn', 'A giant who reshapes the battlefield in solid ice.'],
  ['Níðhöggr', 'A dragon that feeds on the corrupted roots of the world.'],
  ['Valkyrie Exile', 'An elite warrior with devastating aerial spear dives.'],
  ['Anubis Sentinel', 'Tomb guardian who weighs the player\'s soul mid-fight.'],
  ['Scarab Colossus', 'A giant beetle that calls down swarms of lesser scarabs.'],
  ['Serpent of Ra', 'Solar fire attacks that grow fiercer as the fight goes on.'],
  ['Oni Warlord', 'Heavy, punishing melee combat with a devastating iron club.'],
  ['Tengu Blade Master', 'Blindingly fast swordwork carried on cutting wind.'],
  ['Yuki Revenant', 'An ice spirit that freezes sections of the arena solid.'],
  ['Kitsune Illusionist', 'Weaves clones and illusions to confuse its prey.'],
  ['Dullahan', 'A headless knight, vulnerable only once his true form is exposed.'],
  ['Banshee Queen', 'Her scream itself rewrites the attack pattern of the fight.'],
  ['Kelpie', 'Lures travelers into flooded ground before it strikes.'],
];

CREATURES.push(...MYTH.map(([n, l]) => makeCreature(n, race('mythological'), 'mythic', { lore: `"${l}"` })));

const ELDRITCH = ['Thousand-Eyed Watcher', 'Flesh Cathedral', 'The Hollow Choir', 'Maw of Infinity', 'The Weeping Moon', 'Hand of Oblivion', 'The Nameless Choir', 'The Dream Eater'];
CREATURES.push(...ELDRITCH.map((n) => makeCreature(n, race('eldritch'), 'eldritch', { lore: '"It does not belong to the natural world, and the natural world knows it."' })));

const WORLD_BOSSES: WorldBoss[] = [
  { name: 'Leviathan', where: 'Ocean', mechanic: 'Dynamic naval and shoreline battle' },
  { name: 'Fenrir', where: 'Snow Mountains', mechanic: 'Hunts the player across the map' },
  { name: 'Atlas the World Bearer', where: 'Ancient Desert', mechanic: 'Climbs cliffs, destroys ruins as it moves' },
  { name: 'Jörmungor', where: 'Frozen Sea', mechanic: 'Multi-stage battle across breaking ice sheets' },
  { name: 'Cerberus, Warden of Ash', where: 'Underworld Gate', mechanic: 'Each head has a unique elemental attack' },
  { name: 'The Weeping Moon', where: 'Blood Moon Event', mechanic: 'Alters gravity and lighting mid-fight' },
  { name: 'Níðhöggr', where: 'World Root', mechanic: 'Destroys platforms during combat' },
  { name: 'The Hollow Choir', where: 'Cathedral Ruins', mechanic: 'Its music changes every enemy\'s behavior' },
];

const GHOUL_CHAIN = ['Ghoul', 'Elite Ghoul', 'Plague Ghoul', 'Ghoul Champion', 'Ghoul Lord', 'Ghoul King'];

const RANK_LABEL: Record<RankId, string> = { common: 'Common', elite: 'Elite', boss: 'Boss', worldboss: 'World Boss', mythic: 'Mythic', eldritch: 'Eldritch' };
const RANK_ORDER: Record<RankId, number> = { worldboss: 0, boss: 1, eldritch: 2, mythic: 3, elite: 4, common: 5 };

function Row({ label, value, accent }: RowProps) {
  return (
    <div>
      <div style={{ color: 'var(--muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
      <div style={{ color: accent ? 'var(--accent2)' : 'var(--text)' }}>{value}</div>
    </div>
  );
}

export function CodexOverlay({ onClose }: CodexOverlayProps) {
  const [bloodMoon, setBloodMoon] = useState(false);
  const [query, setQuery] = useState('');
  const [activeRace, setActiveRace] = useState<RaceId | 'all'>('all');
  const [selected, setSelected] = useState<Creature | null>(null);
  const [defeats] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    CREATURES.forEach((c) => { map[c.name] = hash(c.name) % 12; });
    return map;
  });

  const theme = bloodMoon
    ? { bg: '#150608', panel: '#1e0a0d', accent: '#c0202c', accent2: '#ff5a5a', text: '#f1dfd8', muted: '#a9807e', line: '#3a1417' }
    : { bg: '#0a0a0d', panel: '#141319', accent: '#8c1f28', accent2: '#d9a441', text: '#e9e2cf', muted: '#8d8a96', line: '#2a2833' };

  const filtered = useMemo(() => {
    return CREATURES.filter((c) => {
      const matchesRace = activeRace === 'all' || c.race === activeRace;
      const matchesQuery = c.name.toLowerCase().includes(query.toLowerCase());
      return matchesRace && matchesQuery;
    }).sort((a, b) => (RANK_ORDER[a.rank] ?? 9) - (RANK_ORDER[b.rank] ?? 9));
  }, [activeRace, query]);

  const grouped = useMemo(() => {
    const byRace: Partial<Record<RaceId, Creature[]>> = {};
    filtered.forEach((c) => {
      byRace[c.race] = byRace[c.race] ?? [];
      byRace[c.race]!.push(c);
    });
    return byRace;
  }, [filtered]);

  return (
    <div
      style={{
        '--bg': theme.bg,
        '--panel': theme.panel,
        '--accent': theme.accent,
        '--accent2': theme.accent2,
        '--text': theme.text,
        '--muted': theme.muted,
        '--line': theme.line,
        background: 'var(--bg)',
        color: 'var(--text)',
        minHeight: '100%',
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        padding: '0 0 60px',
        transition: 'background 0.6s ease',
      } as CodexThemeStyle}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;900&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&display=swap');
        .cx-h { font-family: 'Cinzel', serif; letter-spacing: 0.06em; }
        .cx-card { transition: transform .25s ease, border-color .25s ease, box-shadow .25s ease; cursor: pointer; }
        .cx-card:hover { transform: translateY(-4px); border-color: var(--accent2) !important; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .cx-pill { transition: all .2s ease; cursor: pointer; }
        .cx-pill:hover { border-color: var(--accent2) !important; color: var(--text) !important; }
        .cx-scroll::-webkit-scrollbar { height: 8px; }
        .cx-scroll::-webkit-scrollbar-thumb { background: var(--line); border-radius: 4px; }
        @keyframes pulseGlow { 0%,100% { opacity: .55; } 50% { opacity: 1; } }
        .cx-moon-pulse { animation: pulseGlow 2.4s ease-in-out infinite; }
        input.cx-search::placeholder { color: var(--muted); }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 28px', borderBottom: `1px solid var(--line)`, position: 'sticky', top: 0, zIndex: 20, background: 'var(--bg)cc', backdropFilter: 'blur(6px)' }}>
        <div className="cx-h" style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent2)' }}>NETERIA <span style={{ color: 'var(--muted)', fontWeight: 500, fontSize: 13, letterSpacing: '0.2em' }}>· BESTIARY CODEX</span></div>
        <button
          onClick={() => setBloodMoon((v) => !v)}
          className={bloodMoon ? 'cx-moon-pulse' : ''}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px', borderRadius: 999,
            border: `1px solid ${bloodMoon ? 'var(--accent2)' : 'var(--line)'}`,
            background: bloodMoon ? 'rgba(192,32,44,0.15)' : 'transparent',
            color: bloodMoon ? 'var(--accent2)' : 'var(--muted)', cursor: 'pointer', fontFamily: "'Cinzel', serif", fontSize: 12, letterSpacing: '0.08em',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a10 10 0 1 0 9.8 12A8 8 0 0 1 12 2Z" /></svg>
          {bloodMoon ? 'BLOOD MOON RISEN' : 'AWAKEN THE BLOOD MOON'}
        </button>
      </div>

      <div style={{ padding: '48px 28px 30px', maxWidth: 1100, margin: '0 auto' }}>
        <div className="cx-h" style={{ fontSize: 42, fontWeight: 900, lineHeight: 1.05, color: 'var(--text)' }}>
          The World Devours Its Own Myths.
        </div>
        <p style={{ color: 'var(--muted)', fontSize: 19, maxWidth: 640, marginTop: 14 }}>
          Every race below has its own hierarchy, hunting grounds, and weaknesses. Log a kill to unlock its page in the Hunting Codex.
        </p>

        <div style={{ display: 'flex', gap: 28, marginTop: 28, flexWrap: 'wrap' }}>
          {[['Races', RACES.length], ['Creatures', CREATURES.length], ['World Bosses', WORLD_BOSSES.length]].map(([label, val]) => (
            <div key={label}>
              <div className="cx-h" style={{ fontSize: 30, color: 'var(--accent2)' }}>{val}</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', fontStyle: 'italic', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</div>
            </div>
          ))}
        </div>

        <pre className="cx-scroll" style={{ marginTop: 34, padding: 20, border: `1px solid var(--line)`, borderRadius: 8, overflowX: 'auto', color: 'var(--muted)', fontSize: 12.5, lineHeight: 1.5, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', background: 'var(--panel)' }}>
{`                 THE WORLD OF NETERIA

                         The Hunger
                             │
        ─────────────────────────────────────
        │          │         │             │
   Primordial   Celestials  Abyssals   Ancient Titans
    Dragons
        │
 ──────────────────────────────────────────────
 Humans  Vampires  Beastfolk  Spirits  Giants
        │
 ──────────────────────────────────────────────
 Ghouls Skeletons Demons Witches Lycans Sea Folk`}
        </pre>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 28px' }}>
        <input
          className="cx-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the codex…"
          style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: `1px solid var(--line)`, background: 'var(--panel)', color: 'var(--text)', fontSize: 16, fontFamily: 'inherit', outline: 'none', marginBottom: 16 }}
        />
        <div className="cx-scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8 }}>
          <button
            className="cx-pill"
            onClick={() => setActiveRace('all')}
            style={{ flexShrink: 0, padding: '7px 16px', borderRadius: 999, border: `1px solid ${activeRace === 'all' ? 'var(--accent2)' : 'var(--line)'}`, background: activeRace === 'all' ? 'rgba(217,164,65,0.12)' : 'transparent', color: activeRace === 'all' ? 'var(--text)' : 'var(--muted)', fontFamily: "'Cinzel', serif", fontSize: 11.5, letterSpacing: '0.06em' }}
          >ALL</button>
          {RACES.map((r) => (
            <button
              key={r.id}
              className="cx-pill"
              onClick={() => setActiveRace(r.id)}
              style={{ flexShrink: 0, padding: '7px 16px', borderRadius: 999, border: `1px solid ${activeRace === r.id ? 'var(--accent2)' : 'var(--line)'}`, background: activeRace === r.id ? 'rgba(217,164,65,0.12)' : 'transparent', color: activeRace === r.id ? 'var(--text)' : 'var(--muted)', fontFamily: "'Cinzel', serif", fontSize: 11.5, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}
            >{r.name.toUpperCase()}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 28px 0' }}>
        {Object.keys(grouped).length === 0 && (
          <div style={{ color: 'var(--muted)', padding: '40px 0', textAlign: 'center' }}>No creature answers to that name.</div>
        )}
        {RACES.filter((r) => grouped[r.id] && grouped[r.id]!.length > 0).map((r) => (
          <div key={r.id} style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 4 }}>
              <h2 className="cx-h" style={{ fontSize: 22, color: r.color === theme.accent ? 'var(--accent2)' : r.color }}>{r.name}</h2>
              <span style={{ color: 'var(--muted)', fontSize: 13, fontStyle: 'italic' }}>{r.tagline}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12, marginTop: 14 }}>
              {grouped[r.id]!.map((c) => (
                <div
                  key={c.name}
                  className="cx-card"
                  onClick={() => setSelected(c)}
                  style={{ border: `1px solid var(--line)`, borderRadius: 16, padding: '18px 10px 14px', background: '#0d0d10', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 10, position: 'relative' }}
                >
                  {(c.rank === 'boss' || c.rank === 'worldboss') && (
                    <span style={{ position: 'absolute', top: 10, right: 10, fontSize: 9, letterSpacing: '0.08em', color: 'var(--accent2)', fontFamily: "'Cinzel',serif" }}>{RANK_LABEL[c.rank]}</span>
                  )}
                  {c.rank === 'eldritch' && (
                    <span style={{ position: 'absolute', top: 10, right: 10, fontSize: 9, letterSpacing: '0.08em', color: '#a684e8', fontFamily: "'Cinzel',serif" }}>ELDRITCH</span>
                  )}
                  <Sigil name={c.name} race={race(c.race)} rank={c.rank} size={78} />
                  <div style={{ fontSize: 10.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                    {bloodMoon ? c.bloodMoonVariant : c.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ maxWidth: 1100, margin: '50px auto 0', padding: '0 28px' }}>
        <h2 className="cx-h" style={{ fontSize: 22, color: 'var(--accent2)', marginBottom: 4 }}>Creature Evolution</h2>
        <p style={{ color: 'var(--muted)', marginBottom: 16 }}>Even the common ones don’t stay common.</p>
        <div className="cx-scroll" style={{ display: 'flex', alignItems: 'center', gap: 10, overflowX: 'auto', padding: '10px 0' }}>
          {GHOUL_CHAIN.map((name, i) => (
            <React.Fragment key={name}>
              <div style={{ flexShrink: 0, border: `1px solid var(--line)`, borderRadius: 10, padding: '12px 16px', background: 'var(--panel)', textAlign: 'center' }}>
                <Sigil name={name} race={race('cursed')} rank={i === GHOUL_CHAIN.length - 1 ? 'elite' : 'common'} size={54} />
                <div style={{ fontSize: 13, marginTop: 6, color: i === GHOUL_CHAIN.length - 1 ? 'var(--accent2)' : 'var(--text)' }}>{name}</div>
              </div>
              {i < GHOUL_CHAIN.length - 1 && <div style={{ color: 'var(--muted)', fontSize: 20, flexShrink: 0 }}>→</div>}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '50px auto 0', padding: '0 28px' }}>
        <h2 className="cx-h" style={{ fontSize: 22, color: 'var(--accent2)', marginBottom: 4 }}>World Bosses</h2>
        <p style={{ color: 'var(--muted)', marginBottom: 16 }}>They don't wait in dungeons. They roam.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 12 }}>
          {WORLD_BOSSES.map((b) => (
            <div key={b.name} style={{ border: `1px solid var(--line)`, borderRadius: 10, padding: 16, background: 'var(--panel)' }}>
              <div className="cx-h" style={{ fontSize: 16, color: 'var(--accent2)', marginBottom: 6 }}>{b.name}</div>
              <div style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{b.where}</div>
              <div style={{ fontSize: 14 }}>{b.mechanic}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 12.5, marginTop: 60 }}>
        Sigils are procedurally forged from each creature’s name — no two ever burn the same mark twice.
      </div>

      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}
      />
    </div>
  );
}
