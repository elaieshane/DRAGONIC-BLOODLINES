import React, { useMemo, useState, useRef, useEffect } from 'react';

/* ============================================================
   PLAYER AVATAR CREATOR — NETERIA'S HUNTER FORGE
   Procedurally forge your character's appearance from birth name
   and chosen path. Every hunter is forged uniquely, like the
   beasts they hunt.
   ============================================================ */

// ---------- deterministic hash / seeded helpers ----------
function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function pick<T>(seedStr: string, arr: T[], salt = ""): T {
  return arr[hash(seedStr + salt) % arr.length];
}

// ---------- player classes ----------
type PlayerClass = 'VampireHunter' | 'DraconicKnight' | 'WildSorcerer' | 'ShadowAssassin' | 'CelestialPriest';

interface PlayerAppearance {
  class: PlayerClass;
  name: string;
  skinTone: string;
  hairColor: string;
  hairStyle: 'short' | 'long' | 'shaved' | 'braided' | 'wild';
  eyeColor: string;
  faceMarkings: 'scar' | 'tattoo' | 'none' | 'ritual';
  build: 'lean' | 'athletic' | 'bulky' | 'lithe';
  capeColor: string;
  primaryWeapon: string;
  armorStyle: string;
  level: number;
  experience: number;
}

const PLAYER_CLASSES = [
  { id: 'VampireHunter', name: 'Vampire Hunter', color: '#3b82f6', accent: '#60a5fa' },
  { id: 'DraconicKnight', name: 'Draconic Knight', color: '#f59e0b', accent: '#fbbf24' },
  { id: 'WildSorcerer', name: 'Wild Sorcerer', color: '#a855f7', accent: '#d8b4fe' },
  { id: 'ShadowAssassin', name: 'Shadow Assassin', color: '#6366f1', accent: '#818cf8' },
  { id: 'CelestialPriest', name: 'Celestial Priest', color: '#ec4899', accent: '#f472b6' },
];

const HAIR_STYLES = ['short', 'long', 'shaved', 'braided', 'wild'] as const;
const FACE_MARKINGS = ['scar', 'tattoo', 'none', 'ritual'] as const;
const BUILDS = ['lean', 'athletic', 'bulky', 'lithe'] as const;

const SKIN_TONES = ['#f4a460', '#d4a574', '#c19a6b', '#8b7355', '#704214', '#2f1b3c', '#3d3d3d'];
const HAIR_COLORS = ['#1a1a1a', '#8b4513', '#dc143c', '#daa520', '#4169e1', '#2f4f4f', '#800080'];
const EYE_COLORS = ['#8b4513', '#333333', '#228b22', '#ff6347', '#4169e1', '#ffd700'];

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

// ---------- Player Figure SVG ----------
function PlayerFigure({ appearance, size = 120 }: { appearance: PlayerAppearance; size?: number }) {
  const seed = appearance.name;
  const skin = appearance.skinTone;
  const light = lighten(skin, 40);
  const dark = lighten(skin, -30);
  const hair = appearance.hairColor;

  const buildScale = {
    lean: { body: 0.85, shoulder: 0.9 },
    athletic: { body: 1.0, shoulder: 1.05 },
    bulky: { body: 1.15, shoulder: 1.2 },
    lithe: { body: 0.9, shoulder: 0.95 },
  }[appearance.build];

  const weaponEmoji = {
    'VampireHunter': '⚔️',
    'DraconicKnight': '🐉',
    'WildSorcerer': '⚡',
    'ShadowAssassin': '🗡️',
    'CelestialPriest': '✨',
  }[appearance.class];

  return (
    <svg viewBox="0 0 100 140" width={size} height={size * 1.4} style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))' }}>
      {/* Cape */}
      <path d="M 30,35 Q 20,50 25,80 L 25,120 L 75,120 L 75,80 Q 80,50 70,35 Z" fill={appearance.capeColor} opacity="0.85" />

      {/* Boots */}
      <rect x="35" y="105" width="8" height="20" rx="2" fill="#1a1a1a" />
      <rect x="57" y="105" width="8" height="20" rx="2" fill="#1a1a1a" />

      {/* Legs */}
      <rect x="35" y="85" width="8" height="20" fill={dark} opacity="0.7" />
      <rect x="57" y="85" width="8" height="20" fill={dark} opacity="0.7" />

      {/* Torso */}
      <path
        d={`M 32,40 L 68,40 L 66,85 L 34,85 Z`}
        fill="#2c2c2c"
        opacity="0.9"
      />
      {/* Chest plate detail */}
      <rect x="40" y="48" width="20" height="25" rx="3" fill={PLAYER_CLASSES.find(c => c.id === appearance.class)?.color} opacity="0.6" />

      {/* Shoulders/Pauldrons */}
      <circle cx="32" cy="42" r={4 * buildScale.shoulder} fill={lighten(PLAYER_CLASSES.find(c => c.id === appearance.class)?.color || '#666', 20)} />
      <circle cx="68" cy="42" r={4 * buildScale.shoulder} fill={lighten(PLAYER_CLASSES.find(c => c.id === appearance.class)?.color || '#666', 20)} />

      {/* Arms */}
      <rect x="28" y="45" width="5" height="30" rx="2" fill={skin} />
      <rect x="67" y="45" width="5" height="30" rx="2" fill={skin} />

      {/* Neck */}
      <rect x="46" y="34" width="8" height="6" fill={skin} />

      {/* Head */}
      <circle cx="50" cy="24" r="10" fill={skin} />

      {/* Hair */}
      {appearance.hairStyle === 'short' && (
        <>
          <path d="M 40,16 Q 38,10 50,8 Q 62,10 60,16" fill={hair} />
        </>
      )}
      {appearance.hairStyle === 'long' && (
        <>
          <path d="M 42,18 Q 38,30 40,40 M 58,18 Q 62,30 60,40" fill={hair} opacity="0.8" strokeWidth="2" stroke={hair} />
        </>
      )}
      {appearance.hairStyle === 'braided' && (
        <>
          <path d="M 40,15 Q 38,20 40,30 Q 42,35 45,38 M 60,15 Q 62,20 60,30 Q 58,35 55,38" stroke={hair} strokeWidth="2" fill="none" />
        </>
      )}
      {appearance.hairStyle === 'wild' && (
        <>
          <circle cx="40" cy="12" r="4" fill={hair} opacity="0.7" />
          <circle cx="60" cy="12" r="4" fill={hair} opacity="0.7" />
          <circle cx="50" cy="8" r="5" fill={hair} opacity="0.8" />
        </>
      )}

      {/* Eyes */}
      <circle cx="46" cy="22" r="1.5" fill={appearance.eyeColor} />
      <circle cx="54" cy="22" r="1.5" fill={appearance.eyeColor} />

      {/* Face Markings */}
      {appearance.faceMarkings === 'scar' && (
        <path d="M 50,24 L 55,28" stroke="#8b0000" strokeWidth="0.8" />
      )}
      {appearance.faceMarkings === 'tattoo' && (
        <path d="M 45,25 Q 50,26 55,25" stroke={hair} strokeWidth="0.6" fill="none" />
      )}
      {appearance.faceMarkings === 'ritual' && (
        <>
          <circle cx="46" cy="28" r="0.5" fill={PLAYER_CLASSES.find(c => c.id === appearance.class)?.color} />
          <circle cx="54" cy="28" r="0.5" fill={PLAYER_CLASSES.find(c => c.id === appearance.class)?.color} />
        </>
      )}
    </svg>
  );
}

// ---------- Main Component ----------
interface PlayerAvatarCreatorProps {
  onCreateCharacter?: (appearance: PlayerAppearance) => void;
  onClose?: () => void;
  theme?: any;
}

export default function PlayerAvatarCreator({
  onCreateCharacter,
  onClose,
  theme,
}: PlayerAvatarCreatorProps) {
  const [characterName, setCharacterName] = useState('');
  const [selectedClass, setSelectedClass] = useState<PlayerClass>('VampireHunter');
  const [customization, setCustomization] = useState<Partial<PlayerAppearance>>({});
  const [previewAppearance, setPreviewAppearance] = useState<PlayerAppearance | null>(null);

  // Generate random appearance from name
  const generateAppearance = (name: string) => {
    if (!name) return;
    const appearance: PlayerAppearance = {
      class: selectedClass,
      name,
      skinTone: pick(name, SKIN_TONES, 'skin'),
      hairColor: pick(name, HAIR_COLORS, 'hair'),
      hairStyle: pick(name, HAIR_STYLES, 'style'),
      eyeColor: pick(name, EYE_COLORS, 'eyes'),
      faceMarkings: pick(name, FACE_MARKINGS, 'mark'),
      build: pick(name, BUILDS, 'build'),
      capeColor: PLAYER_CLASSES.find(c => c.id === selectedClass)?.color || '#3b82f6',
      primaryWeapon: ['Sword', 'Dagger', 'Spear', 'Bow', 'Staff'][hash(name + 'w') % 5],
      armorStyle: PLAYER_CLASSES.find(c => c.id === selectedClass)?.name || 'Hunter Garb',
      level: 1 + (hash(name) % 20),
      experience: hash(name) % 5000,
    };
    setPreviewAppearance(appearance);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setCharacterName(name);
    if (name.length > 2) {
      generateAppearance(name);
    }
  };

  const handleClassChange = (classId: PlayerClass) => {
    setSelectedClass(classId);
    if (characterName.length > 2) {
      generateAppearance(characterName);
    }
  };

  const handleCreate = () => {
    if (previewAppearance && onCreateCharacter) {
      onCreateCharacter(previewAppearance);
    }
  };

  const currentClass = PLAYER_CLASSES.find(c => c.id === selectedClass);

  return (
    <div
      style={{
        background: theme?.panel || '#171310',
        borderRadius: 12,
        padding: 24,
        maxWidth: 600,
        color: theme?.text || '#e9e0cd',
        fontFamily: "'Cormorant Garamond', Georgia, serif",
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0, fontFamily: "'Cinzel', serif" }}>
          Forge Your Hunter
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 24,
              cursor: 'pointer',
              color: theme?.text || '#e9e0cd',
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* Character Name */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontSize: 12, letterSpacing: '0.1em', marginBottom: 8, color: theme?.muted || '#8f8779' }}>
          YOUR NAME
        </label>
        <input
          type="text"
          value={characterName}
          onChange={handleNameChange}
          placeholder="Enter your hunter's name..."
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: 6,
            border: `1px solid ${theme?.line || '#2c261e'}`,
            background: theme?.panel2 || '#120f0d',
            color: theme?.text || '#e9e0cd',
            fontFamily: 'inherit',
            fontSize: 16,
          }}
        />
      </div>

      {/* Class Selection */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontSize: 12, letterSpacing: '0.1em', marginBottom: 10, color: theme?.muted || '#8f8779' }}>
          PATH OF POWER
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 8 }}>
          {PLAYER_CLASSES.map((cls) => (
            <button
              key={cls.id}
              onClick={() => handleClassChange(cls.id as PlayerClass)}
              style={{
                padding: 12,
                borderRadius: 6,
                border: selectedClass === cls.id ? `2px solid ${cls.color}` : `1px solid ${theme?.line || '#2c261e'}`,
                background: selectedClass === cls.id ? `${cls.color}22` : theme?.panel2 || '#120f0d',
                color: selectedClass === cls.id ? cls.color : theme?.text || '#e9e0cd',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
                transition: 'all 0.2s ease',
              }}
            >
              {cls.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      {previewAppearance && (
        <div
          style={{
            background: theme?.panel2 || '#120f0d',
            border: `1px solid ${theme?.line || '#2c261e'}`,
            borderRadius: 8,
            padding: 20,
            marginBottom: 24,
            textAlign: 'center',
          }}
        >
          <PlayerFigure appearance={previewAppearance} size={100} />
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 18, fontWeight: 600, fontFamily: "'Cinzel', serif" }}>
              {characterName || 'Unnamed Hunter'}
            </div>
            <div style={{ fontSize: 12, color: currentClass?.color || '#3b82f6', marginTop: 4 }}>
              {currentClass?.name}
            </div>
            <div
              style={{
                fontSize: 11,
                color: theme?.muted || '#8f8779',
                marginTop: 8,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 8,
              }}
            >
              <div>
                <div style={{ fontFamily: 'monospace' }}>Weapon</div>
                <div style={{ color: theme?.text || '#e9e0cd' }}>{previewAppearance.primaryWeapon}</div>
              </div>
              <div>
                <div style={{ fontFamily: 'monospace' }}>Build</div>
                <div style={{ color: theme?.text || '#e9e0cd' }}>
                  {previewAppearance.build.charAt(0).toUpperCase() + previewAppearance.build.slice(1)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Button */}
      <button
        onClick={handleCreate}
        disabled={!previewAppearance}
        style={{
          width: '100%',
          padding: 12,
          borderRadius: 6,
          border: 'none',
          background: previewAppearance ? (currentClass?.color || '#3b82f6') : '#666',
          color: '#fff',
          fontWeight: 600,
          fontSize: 14,
          cursor: previewAppearance ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s ease',
          fontFamily: "'Cinzel', serif",
          letterSpacing: '0.08em',
        }}
      >
        {previewAppearance ? 'FORGE CHARACTER' : 'Enter a name to create'}
      </button>
    </div>
  );
}

export type { PlayerAppearance, PlayerClass };
