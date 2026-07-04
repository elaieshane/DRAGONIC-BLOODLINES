import React, { useState, useMemo } from 'react';
import PlayerAvatarCreator, { PlayerAppearance, PlayerClass } from './PlayerAvatarCreator';
import { EnhancedSigil } from './EnhancedBestiary';

/* ============================================================
   UNIFIED BESTIARY + PLAYER FORGE
   The nexus where hunters are forged and monsters catalogued
   ============================================================ */

interface ExtendedCreature {
  name: string;
  race: string;
  rank: string;
  color: string;
  type: string; // 'humanoid', 'crystalline', 'insectoid', etc.
  stats: {
    health: number;
    attack: number;
    defense: number;
    speed: number;
  };
  weaknesses: string[];
  tactics: string;
  lore: string;
}

const ENHANCED_CREATURES: ExtendedCreature[] = [
  // Humanoid Enemies
  {
    name: 'Blood Knight',
    race: 'vampires',
    rank: 'elite',
    color: '#c2451f',
    type: 'humanoid',
    stats: { health: 85, attack: 12, defense: 8, speed: 7 },
    weaknesses: ['Holy Water', 'Sunlight', 'Iron'],
    tactics: 'Aggressive melee combatant with crowd control abilities',
    lore: 'A corrupted warrior bound by blood oath to the vampire lords.',
  },
  {
    name: 'Crimson Executioner',
    race: 'demons',
    rank: 'boss',
    color: '#8c1f28',
    type: 'humanoid',
    stats: { health: 120, attack: 15, defense: 10, speed: 6 },
    weaknesses: ['Holy Flame', 'Silver', 'Blessed Weapons'],
    tactics: 'High damage output with sweeping area attacks',
    lore: 'A demon general who feeds on the fear of condemned prisoners.',
  },

  // Crystalline Entities
  {
    name: 'Prismatic Sentinel',
    race: 'abyssal',
    rank: 'common',
    color: '#4fbfa8',
    type: 'crystalline',
    stats: { health: 45, attack: 8, defense: 12, speed: 5 },
    weaknesses: ['Sonic Damage', 'Physical Impact', 'Electricity'],
    tactics: 'Defensive posture with reflective surfaces',
    lore: 'A crystalline construct guarding interdimensional rifts.',
  },
  {
    name: 'Diamond Golem',
    race: 'titans',
    rank: 'boss',
    color: '#a0d8f7',
    type: 'crystalline',
    stats: { health: 150, attack: 10, defense: 18, speed: 3 },
    weaknesses: ['Thermal Shock', 'Vibrations'],
    tactics: 'Immovable defensive stance, slow but devastating counterattacks',
    lore: 'An ancient guardian formed from the world\'s hardest mineral.',
  },

  // Insectoid Creatures
  {
    name: 'Scarab Warrior',
    race: 'cursed',
    rank: 'common',
    color: '#c99a5b',
    type: 'insectoid',
    stats: { health: 50, attack: 9, defense: 7, speed: 9 },
    weaknesses: ['Fire', 'Crushing Damage', 'Pesticides'],
    tactics: 'Fast, erratic movement patterns with swarming behavior',
    lore: 'Corrupted scarabs that serve the buried pharaohs.',
  },
  {
    name: 'Hive Queen',
    race: 'necromancy',
    rank: 'worldboss',
    color: '#7a9c3a',
    type: 'insectoid',
    stats: { health: 180, attack: 14, defense: 9, speed: 8 },
    weaknesses: ['Fire', 'Sonic Attacks'],
    tactics: 'Spawns minions while using ranged acid attacks',
    lore: 'A chitinous monarch that commands legions of her offspring.',
  },

  // Spectral Forms
  {
    name: 'Wandering Soul',
    race: 'necromancy',
    rank: 'common',
    color: '#b9c2d0',
    type: 'spectral',
    stats: { health: 35, attack: 6, defense: 4, speed: 8 },
    weaknesses: ['Holy Magic', 'Consecration', 'Salt'],
    tactics: 'Phasing movement with unpredictable attack patterns',
    lore: 'A tormented spirit refusing to pass to the afterlife.',
  },
  {
    name: 'The Wailing Phantom',
    race: 'eldritch',
    rank: 'mythic',
    color: '#6a4d9c',
    type: 'spectral',
    stats: { health: 140, attack: 13, defense: 6, speed: 10 },
    weaknesses: ['Consecrated Ground', 'Iron Bells', 'Holy Water'],
    tactics: 'Teleportation spam with debilitating sound attacks',
    lore: 'A creature that exists in multiple realities simultaneously.',
  },

  // Biomechanical Hybrids
  {
    name: 'Corrupted Construct',
    race: 'cursed',
    rank: 'common',
    color: '#8a8a92',
    type: 'biomechanical',
    stats: { health: 60, attack: 10, defense: 9, speed: 6 },
    weaknesses: ['EMP', 'Rust', 'Overload'],
    tactics: 'Balanced offense and defense with self-repair',
    lore: 'A failed experiment merging flesh with machinery.',
  },
  {
    name: 'The Forgemaster',
    race: 'demons',
    rank: 'boss',
    color: '#f59e0b',
    type: 'biomechanical',
    stats: { health: 130, attack: 16, defense: 11, speed: 5 },
    weaknesses: ['Cold', 'Water', 'Electromagnetic Pulse'],
    tactics: 'Crafts weapons mid-combat and launches molten projectiles',
    lore: 'A demon who discovered the power to forge living metal.',
  },

  // Swarm Entities
  {
    name: 'Rat Pack',
    race: 'cursed',
    rank: 'common',
    color: '#6a4d5c',
    type: 'swarm',
    stats: { health: 40, attack: 7, defense: 3, speed: 9 },
    weaknesses: ['AOE', 'Fire', 'Cats'],
    tactics: 'Divide and overwhelm with numbers',
    lore: 'Plague-bearing vermin possessed by dark spirits.',
  },
  {
    name: 'The Devouring Swarm',
    race: 'abyssal',
    rank: 'boss',
    color: '#4a2e6e',
    type: 'swarm',
    stats: { health: 110, attack: 11, defense: 5, speed: 9 },
    weaknesses: ['Poison', 'Extreme Heat'],
    tactics: 'Infinite spawning with cumulative stacking debuffs',
    lore: 'Countless void entities linked by alien consciousness.',
  },
];

interface UnifiedCodexProps {
  onClose?: () => void;
  theme?: any;
}

export default function UnifiedBestiaryCodex({ onClose, theme }: UnifiedCodexProps) {
  const [view, setView] = useState<'bestiary' | 'forge' | 'character'>('bestiary');
  const [bloodMoon, setBloodMoon] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedCreature, setSelectedCreature] = useState<ExtendedCreature | null>(null);
  const [playerCharacter, setPlayerCharacter] = useState<PlayerAppearance | null>(null);

  const currentTheme = theme || {
    bg: '#0c0a08',
    panel: '#171310',
    panel2: '#120f0d',
    accent: '#8c1f28',
    accent2: '#c9a15a',
    text: '#e9e0cd',
    muted: '#8f8779',
    line: '#2c261e',
    vign: 'rgba(0,0,0,0.35)',
  };

  const filtered = useMemo(() => {
    return ENHANCED_CREATURES.filter((c) =>
      c.name.toLowerCase().includes(query.toLowerCase())
    ).sort((a, b) => {
      const rankOrder = { worldboss: 0, boss: 1, elite: 2, mythic: 3, common: 4 };
      return (rankOrder[a.rank as keyof typeof rankOrder] ?? 9) -
             (rankOrder[b.rank as keyof typeof rankOrder] ?? 9);
    });
  }, [query]);

  const grouped = useMemo(() => {
    const byRace: Record<string, ExtendedCreature[]> = {};
    filtered.forEach((c) => {
      byRace[c.race] = byRace[c.race] || [];
      byRace[c.race].push(c);
    });
    return byRace;
  }, [filtered]);

  return (
    <div
      style={{
        '--bg': currentTheme.bg,
        '--panel': currentTheme.panel,
        '--panel2': currentTheme.panel2,
        '--accent': currentTheme.accent,
        '--accent2': currentTheme.accent2,
        '--text': currentTheme.text,
        '--muted': currentTheme.muted,
        '--line': currentTheme.line,
        '--vign': currentTheme.vign,
        background: 'var(--bg)',
        color: 'var(--text)',
        minHeight: '100vh',
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        padding: '0 0 70px',
      } as React.CSSProperties}
    >
      <style>{`
        .codex-tab { cursor: pointer; font-weight: 600; padding: 8px 16px; border-bottom: 2px solid transparent; transition: all 0.2s ease; }
        .codex-tab.active { border-bottom-color: var(--accent2); color: var(--accent2); }
        .codex-tab:hover { color: var(--accent2); }
        .creature-card { transition: all 0.3s ease; cursor: pointer; }
        .creature-card:hover { transform: translateY(-6px); box-shadow: 0 8px 20px rgba(0,0,0,0.6); }
        .stats-bar { display: flex; gap: 8px; margin: 8px 0; }
        .stat-bar { flex: 1; height: 6px; background: var(--panel2); border-radius: 3px; overflow: hidden; }
        .stat-fill { height: 100%; background: var(--accent2); border-radius: 3px; }
      `}</style>

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '18px 28px',
          borderBottom: `1px solid var(--line)`,
          position: 'sticky',
          top: 0,
          zIndex: 20,
          background: 'var(--bg)',
        }}
      >
        <div style={{ fontSize: 19, fontWeight: 700, fontFamily: "'Cinzel', serif" }}>
          NETERIA CODEX
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 24,
              cursor: 'pointer',
              color: 'var(--text)',
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', borderBottom: `1px solid var(--line)`, padding: '0 28px' }}>
        <div
          className={`codex-tab ${view === 'bestiary' ? 'active' : ''}`}
          onClick={() => setView('bestiary')}
        >
          BESTIARY
        </div>
        <div
          className={`codex-tab ${view === 'forge' ? 'active' : ''}`}
          onClick={() => setView('forge')}
        >
          FORGE CHARACTER
        </div>
        {playerCharacter && (
          <div
            className={`codex-tab ${view === 'character' ? 'active' : ''}`}
            onClick={() => setView('character')}
            style={{ marginLeft: 'auto' }}
          >
            YOUR HUNTER
          </div>
        )}
      </div>

      {/* BESTIARY VIEW */}
      {view === 'bestiary' && (
        <div style={{ padding: '24px 28px', maxWidth: 1200, margin: '0 auto' }}>
          {/* Search */}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search creatures..."
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 6,
              border: `1px solid var(--line)`,
              background: 'var(--panel)',
              color: 'var(--text)',
              fontSize: 16,
              marginBottom: 24,
            }}
          />

          {/* Creature Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {filtered.map((creature) => (
              <div
                key={creature.name}
                className="creature-card"
                onClick={() => setSelectedCreature(creature)}
                style={{
                  border: `1px solid var(--line)`,
                  borderRadius: 8,
                  padding: 16,
                  background: 'var(--panel)',
                  textAlign: 'center',
                }}
              >
                <EnhancedSigil
                  name={creature.name}
                  color={creature.color}
                  type={creature.type}
                  rank={creature.rank}
                  size={80}
                />
                <div style={{ marginTop: 12, fontSize: 14, fontWeight: 600 }}>
                  {creature.name}
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                  {creature.race.toUpperCase()}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: 'var(--accent2)',
                    marginTop: 4,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}
                >
                  {creature.rank}
                </div>
              </div>
            ))}
          </div>

          {/* Creature Detail Modal */}
          {selectedCreature && (
            <div
              onClick={() => setSelectedCreature(null)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.75)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 50,
                backdropFilter: 'blur(3px)',
              }}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: 'var(--panel)',
                  border: `1px solid var(--line)`,
                  borderRadius: 12,
                  maxWidth: 500,
                  width: '90%',
                  padding: 24,
                  boxShadow: '0 30px 70px rgba(0,0,0,0.6)',
                }}
              >
                <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                  <EnhancedSigil
                    name={selectedCreature.name}
                    color={selectedCreature.color}
                    type={selectedCreature.type}
                    rank={selectedCreature.rank}
                    size={100}
                  />
                  <div>
                    <h2 style={{ fontSize: 20, margin: '0 0 8px 0', fontFamily: "'Cinzel', serif" }}>
                      {selectedCreature.name}
                    </h2>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                      {selectedCreature.race.toUpperCase()} · {selectedCreature.rank.toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase' }}>
                    Stats
                  </div>
                  {Object.entries(selectedCreature.stats).map(([key, value]) => (
                    <div key={key} style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                        {key.toUpperCase()}
                      </div>
                      <div className="stat-bar">
                        <div className="stat-fill" style={{ width: `${(value / 20) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tactics */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, textTransform: 'uppercase' }}>
                    Tactics
                  </div>
                  <p style={{ fontSize: 13, margin: 0, color: 'var(--text)', fontStyle: 'italic' }}>
                    {selectedCreature.tactics}
                  </p>
                </div>

                {/* Lore */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, textTransform: 'uppercase' }}>
                    Lore
                  </div>
                  <p style={{ fontSize: 13, margin: 0, color: 'var(--muted)' }}>
                    "{selectedCreature.lore}"
                  </p>
                </div>

                {/* Weaknesses */}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase' }}>
                    Weaknesses
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {selectedCreature.weaknesses.map((w) => (
                      <span
                        key={w}
                        style={{
                          fontSize: 11,
                          padding: '4px 10px',
                          background: 'var(--accent2)',
                          color: '#000',
                          borderRadius: 4,
                        }}
                      >
                        {w}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCreature(null)}
                  style={{
                    width: '100%',
                    marginTop: 20,
                    padding: 10,
                    background: 'var(--accent2)',
                    color: '#000',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FORGE VIEW */}
      {view === 'forge' && (
        <div style={{ padding: '24px 28px', maxWidth: 600, margin: '0 auto' }}>
          <PlayerAvatarCreator
            theme={currentTheme}
            onCreateCharacter={(appearance) => {
              setPlayerCharacter(appearance);
              setView('character');
            }}
            onClose={() => setView('bestiary')}
          />
        </div>
      )}

      {/* CHARACTER VIEW */}
      {view === 'character' && playerCharacter && (
        <div style={{ padding: '24px 28px', maxWidth: 600, margin: '0 auto' }}>
          <div
            style={{
              border: `1px solid var(--line)`,
              borderRadius: 12,
              padding: 24,
              background: 'var(--panel)',
              textAlign: 'center',
            }}
          >
            <h2 style={{ fontSize: 22, margin: '0 0 16px 0', fontFamily: "'Cinzel', serif" }}>
              {playerCharacter.name}
            </h2>
            <div style={{ fontSize: 14, color: 'var(--accent2)', marginBottom: 20 }}>
              {playerCharacter.armorStyle}
            </div>

            <button
              onClick={() => setView('forge')}
              style={{
                width: '100%',
                padding: 12,
                background: 'var(--accent2)',
                color: '#000',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontWeight: 600,
                marginTop: 16,
              }}
            >
              Create New Character
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
