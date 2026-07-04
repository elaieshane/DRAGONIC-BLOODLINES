import React from 'react';
import { BestiaryEntry, Faction } from '../types';

interface CodexCreatureDisplayProps {
  entry: BestiaryEntry;
  animationState: 'idle' | 'walk' | 'attack';
  unlockLevel: number;
}

const FACTION_ACCENT: Record<Faction, { main: string; glow: string; bg: string }> = {
  Dragons: { main: '#f97316', glow: '#fb923c', bg: '#2a1305' },
  Vampires: { main: '#f43f5e', glow: '#fb7185', bg: '#2a090f' },
  Lycans: { main: '#22c55e', glow: '#4ade80', bg: '#081d0f' },
  Demons: { main: '#c026d3', glow: '#f472b6', bg: '#19061a' },
  Celestials: { main: '#38bdf8', glow: '#7dd3fc', bg: '#071825' },
  Titans: { main: '#a78bfa', glow: '#c4b5fd', bg: '#1e1737' },
  SeaCreatures: { main: '#0ea5e9', glow: '#38bdf8', bg: '#031f2d' },
  ForestSpirits: { main: '#22c55e', glow: '#86efac', bg: '#07180c' },
  CursedExperiments: { main: '#f97316', glow: '#fb923c', bg: '#241407' },
  Necromancy: { main: '#9333ea', glow: '#a78bfa', bg: '#140a2b' },
  Gargoyles: { main: '#94a3b8', glow: '#cbd5e1', bg: '#101820' },
  Abyssal: { main: '#0f172a', glow: '#475569', bg: '#02060f' },
  Mythological: { main: '#fbbf24', glow: '#fde68a', bg: '#2f1d04' },
  Eldritch: { main: '#db2777', glow: '#f472b6', bg: '#1d0822' },
  Uncategorized: { main: '#a1a1aa', glow: '#d4d4d8', bg: '#0f1013' },
};

function getFactionAccent(entry: BestiaryEntry) {
  return FACTION_ACCENT[entry.faction] ?? FACTION_ACCENT.Uncategorized;
}

function getFactionFeatures(entry: BestiaryEntry, accent: string) {
  switch (entry.faction) {
    case 'Dragons':
      return (
        <>
          <path d="M140 58c8-16 40-22 54-16 12 6 16 28 6 42" fill="none" stroke={accent} strokeWidth="7" strokeLinecap="round" />
          <path d="M140 58c-8-16-40-22-54-16-12 6-16 28-6 42" fill="none" stroke={accent} strokeWidth="7" strokeLinecap="round" />
          <path d="M95 132c18-10 42-12 70 0 16 8 34 20 38 40 6 28-12 60-32 76-18 14-40 26-70 12-18-8-34-34-32-58 2-24 8-44 26-54z" fill={accent} opacity="0.12" />
          <path d="M146 78c0-18 18-30 34-26 20 4 26 30 22 46l-8 28c-2 12-10 18-18 18-12 0-22-14-22-28v-38z" fill={accent} opacity="0.16" />
        </>
      );
    case 'Vampires':
      return (
        <>
          <path d="M108 80c-2-18 10-36 30-34s30 18 28 34" fill="none" stroke={accent} strokeWidth="6" strokeLinecap="round" />
          <path d="M82 116c24-30 88-30 112 0" fill="none" stroke={accent} strokeWidth="5" strokeLinecap="round" />
          <path d="M94 110c6-14 26-18 40-10 14 8 16 24 14 36-2 15-10 20-26 20-15 0-30-20-28-34z" fill={accent} opacity="0.14" />
          <path d="M110 72c10-18 35-20 50-6" fill="none" stroke={accent} strokeWidth="5" strokeLinecap="round" />
        </>
      );
    case 'Lycans':
      return (
        <>
          <path d="M90 90c-16 10-18 32-8 52 8 14 32 20 58 16" fill="none" stroke={accent} strokeWidth="9" strokeLinecap="round" />
          <path d="M190 94c16 10 18 32 8 52-8 14-32 20-58 16" fill="none" stroke={accent} strokeWidth="9" strokeLinecap="round" />
          <path d="M110 108c6-18 28-28 42-10" fill="none" stroke={accent} strokeWidth="6" strokeLinecap="round" />
          <path d="M142 84c8-12 30-16 42-4" fill="none" stroke={accent} strokeWidth="6" strokeLinecap="round" />
        </>
      );
    case 'Demons':
      return (
        <>
          <path d="M120 82c0-24 28-42 46-30 12 8 10 26 0 36" fill="none" stroke={accent} strokeWidth="6" strokeLinecap="round" />
          <path d="M160 80c-8-10-24-12-34-2" fill="none" stroke={accent} strokeWidth="5" strokeLinecap="round" />
          <path d="M100 92c-12-12-30-10-32 12" fill="none" stroke={accent} strokeWidth="6" strokeLinecap="round" />
          <path d="M102 112c16 16 30 24 48 22 18-2 28-18 26-36" fill="none" stroke={accent} strokeWidth="6" strokeLinecap="round" />
        </>
      );
    case 'Celestials':
      return (
        <>
          <circle cx="140" cy="58" r="12" fill={accent} opacity="0.8" />
          <path d="M110 80c18-14 50-14 70 0" fill="none" stroke={accent} strokeWidth="5" strokeLinecap="round" />
          <path d="M104 94c-8-12-18-28-22-34" fill="none" stroke={accent} strokeWidth="5" strokeLinecap="round" />
          <path d="M178 94c8-12 18-28 22-34" fill="none" stroke={accent} strokeWidth="5" strokeLinecap="round" />
        </>
      );
    case 'Titans':
      return (
        <>
          <path d="M122 96c-10 20 2 46 26 54 20 6 44-2 54-20" fill="none" stroke={accent} strokeWidth="10" strokeLinecap="round" opacity="0.18" />
          <path d="M138 60c-18 0-32 14-32 32v12c0 18 14 32 32 32s32-14 32-32V92c0-18-14-32-32-32z" fill={accent} opacity="0.16" />
          <path d="M128 60l-12-20m36 20l12-20" fill="none" stroke={accent} strokeWidth="6" strokeLinecap="round" />
        </>
      );
    case 'SeaCreatures':
      return (
        <>
          <path d="M84 120c18-30 72-40 96 0" fill="none" stroke={accent} strokeWidth="7" strokeLinecap="round" />
          <path d="M148 72c8-16 30-20 42-8" fill="none" stroke={accent} strokeWidth="5" strokeLinecap="round" />
          <path d="M120 96c0 18 12 32 24 32s24-14 24-32" fill="none" stroke={accent} strokeWidth="6" strokeLinecap="round" />
          <path d="M90 150c12 20 40 24 62 10" fill="none" stroke={accent} strokeWidth="5" strokeLinecap="round" />
        </>
      );
    case 'ForestSpirits':
      return (
        <>
          <path d="M116 84c-14 10-26 32-20 54" fill="none" stroke={accent} strokeWidth="7" strokeLinecap="round" />
          <path d="M164 84c14 10 26 32 20 54" fill="none" stroke={accent} strokeWidth="7" strokeLinecap="round" />
          <path d="M96 116c18-16 52-20 80 0" fill="none" stroke={accent} strokeWidth="6" strokeLinecap="round" />
          <circle cx="140" cy="68" r="12" fill={accent} opacity="0.9" />
        </>
      );
    case 'CursedExperiments':
      return (
        <>
          <path d="M100 84c10-14 44-18 66 0" fill="none" stroke={accent} strokeWidth="7" strokeLinecap="round" />
          <path d="M112 104c-6 24 10 42 28 44 20 2 40-18 36-44" fill="none" stroke={accent} strokeWidth="6" strokeLinecap="round" />
          <path d="M132 64c8-8 18-10 26-2" fill="none" stroke={accent} strokeWidth="5" strokeLinecap="round" />
        </>
      );
    case 'Necromancy':
      return (
        <>
          <path d="M132 82c-20-4-32 16-28 34" fill="none" stroke={accent} strokeWidth="6" strokeLinecap="round" />
          <path d="M168 82c20-4 32 16 28 34" fill="none" stroke={accent} strokeWidth="6" strokeLinecap="round" />
          <path d="M118 114c18-20 68-20 86 0" fill="none" stroke={accent} strokeWidth="8" strokeLinecap="round" opacity="0.16" />
        </>
      );
    case 'Gargoyles':
      return (
        <>
          <path d="M110 80c-14-8-20-30-8-42" fill="none" stroke={accent} strokeWidth="7" strokeLinecap="round" />
          <path d="M170 80c14-8 20-30 8-42" fill="none" stroke={accent} strokeWidth="7" strokeLinecap="round" />
          <path d="M120 126c18-14 40-16 54 0" fill="none" stroke={accent} strokeWidth="8" strokeLinecap="round" opacity="0.16" />
        </>
      );
    case 'Abyssal':
      return (
        <>
          <path d="M112 90c8-26 40-34 58-16" fill="none" stroke={accent} strokeWidth="7" strokeLinecap="round" />
          <path d="M148 66c-4 18 6 34 18 42" fill="none" stroke={accent} strokeWidth="6" strokeLinecap="round" />
          <path d="M96 118c10 18 44 26 80 10" fill="none" stroke={accent} strokeWidth="6" strokeLinecap="round" opacity="0.18" />
        </>
      );
    case 'Mythological':
      return (
        <>
          <path d="M94 88c20-26 72-26 92 0" fill="none" stroke={accent} strokeWidth="8" strokeLinecap="round" />
          <path d="M128 64c6-14 22-18 34-8" fill="none" stroke={accent} strokeWidth="5" strokeLinecap="round" />
          <path d="M120 120c10 20 44 22 64 4" fill="none" stroke={accent} strokeWidth="7" strokeLinecap="round" opacity="0.16" />
        </>
      );
    case 'Eldritch':
      return (
        <>
          <circle cx="140" cy="90" r="14" fill={accent} opacity="0.95" />
          <path d="M112 108c8-18 28-28 54-18" fill="none" stroke={accent} strokeWidth="6" strokeLinecap="round" />
          <path d="M130 70c-16 12-18 34-4 48" fill="none" stroke={accent} strokeWidth="6" strokeLinecap="round" />
          <path d="M156 70c16 12 18 34 4 48" fill="none" stroke={accent} strokeWidth="6" strokeLinecap="round" />
        </>
      );
    default:
      return (
        <>
          <path d="M120 78c-18 12-18 46 2 64" fill="none" stroke={accent} strokeWidth="7" strokeLinecap="round" />
          <path d="M160 78c18 12 18 46-2 64" fill="none" stroke={accent} strokeWidth="7" strokeLinecap="round" />
          <path d="M110 120c20-16 40-16 58 0" fill="none" stroke={accent} strokeWidth="8" strokeLinecap="round" opacity="0.14" />
        </>
      );
  }
}

export function CodexCreatureDisplay({ entry, animationState, unlockLevel }: CodexCreatureDisplayProps) {
  const accent = getFactionAccent(entry);
  const isLocked = unlockLevel === 0;
  const detailsLabel = isLocked ? 'Undiscovered' : animationState === 'attack' ? 'Attack Stance' : animationState === 'walk' ? 'Patrol Pose' : 'Idle Pose';

  return (
    <div className="relative w-full rounded-[28px] border border-zinc-800 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.06),_rgba(15,23,42,0.88))] p-4 shadow-[0_15px_40px_rgba(0,0,0,0.45)] overflow-hidden">
      <div className="absolute inset-0 opacity-30 blur-2xl" style={{ background: `radial-gradient(circle at top, ${accent.glow}, transparent 45%)` }} />
      <div className="relative flex flex-col items-center gap-3">
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.32em] text-zinc-200">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: accent.main }} />
          {detailsLabel}
        </div>
        <div className="relative w-full aspect-[4/5]">
          <svg viewBox="0 0 280 320" className="h-full w-full" aria-hidden="true">
            <defs>
              <radialGradient id="codexGlow" cx="50%" cy="20%" r="60%">
                <stop offset="0%" stopColor={accent.glow} stopOpacity="0.5" />
                <stop offset="70%" stopColor="transparent" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="140" cy="250" r="70" fill="url(#codexGlow)" opacity="0.55" />
            <g className={`codex-creature-root codex-${animationState}`} transform="translate(0 0)">
              <g className="codex-bob" transform="translate(0 0)">
                <ellipse cx="140" cy="245" rx="70" ry="18" fill="rgba(10,10,12,0.55)" />
                <circle cx="140" cy="128" r="44" fill="#111827" stroke={accent.main} strokeWidth="4" />
                <path d="M106 130c-4 22 0 42 22 52s40 0 44-16" fill={accent.main} opacity="0.2" />
                <path d="M96 160c-12 26 6 68 36 84 28 14 64 4 84-18 18-20 16-54 10-72" fill="#111827" />
                <path d="M116 198c18 0 14 16 26 16s10-16 28-16" fill={accent.main} opacity="0.14" />
                <path d="M80 188c12 22 34 42 68 42 32 0 54-14 72-36" fill="none" stroke={accent.glow} strokeWidth="4" strokeLinecap="round" opacity="0.18" />
                <path d="M140 96c-20-14-24-32-14-46 10-14 34-14 44 2 10 16 6 34-14 46" fill={accent.main} opacity="0.18" />
                <path d="M118 92c-14-8-24-30-10-42" fill="none" stroke={accent.main} strokeWidth="6" strokeLinecap="round" opacity="0.65" />
                <path d="M162 92c14-8 24-30 10-42" fill="none" stroke={accent.main} strokeWidth="6" strokeLinecap="round" opacity="0.65" />
                <circle cx="130" cy="128" r="6" fill={accent.main} />
                <circle cx="150" cy="128" r="6" fill={accent.main} />
                <path d="M136 156c4 6 8 6 12 0" stroke="#f8fafc" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.8" />
                <path d="M104 164c18 12 40 16 72 6 28-8 24-44 4-54" fill="none" stroke={accent.glow} strokeWidth="4" opacity="0.35" />
                {getFactionFeatures(entry, accent.main)}
              </g>
              <g className="codex-limbs">
                <rect x="88" y="174" width="18" height="58" rx="9" fill="#111827" transform="rotate(12 97 203)" className="codex-left-arm" />
                <rect x="174" y="174" width="18" height="58" rx="9" fill="#111827" transform="rotate(-12 183 203)" className="codex-right-arm" />
                <rect x="114" y="240" width="20" height="48" rx="10" fill="#111827" transform="rotate(-6 124 264)" className="codex-left-leg" />
                <rect x="146" y="240" width="20" height="48" rx="10" fill="#111827" transform="rotate(6 156 264)" className="codex-right-leg" />
              </g>
            </g>
          </svg>
        </div>
        <div className="grid w-full grid-cols-2 gap-2 text-[11px] text-zinc-300">
          <div className="rounded-xl border border-white/10 bg-white/5 p-2">
            <p className="text-[10px] uppercase tracking-[0.32em] text-zinc-400">Faction</p>
            <p className="mt-1 font-semibold text-white">{entry.faction}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-2">
            <p className="text-[10px] uppercase tracking-[0.32em] text-zinc-400">Tier</p>
            <p className="mt-1 font-semibold text-white">{entry.baseTier}</p>
          </div>
        </div>
      </div>
      {isLocked ? (
        <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-black/70 flex items-center justify-center text-xs uppercase tracking-[0.32em] text-zinc-400">
          Undiscovered Creature
        </div>
      ) : null}
    </div>
  );
}
