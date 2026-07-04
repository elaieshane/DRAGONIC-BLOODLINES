/* ============================================================
   INTEGRATION GUIDE - Enhanced Bestiary + Player Forge
   ============================================================ */

// ✅ STEP 1: Import the unified component
import UnifiedBestiaryCodex from './components/UnifiedBestiaryCodex';

// ✅ STEP 2: Add state to your main component (App.tsx or MainMenu.tsx)
const [showCodex, setShowCodex] = useState(false);
const [playerCharacter, setPlayerCharacter] = useState(null);

// ✅ STEP 3: Add theme object (use your existing game theme)
const gameTheme = {
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

// ✅ STEP 4: Add button to open the codex
<button onClick={() => setShowCodex(true)}>
  Open Codex
</button>

// ✅ STEP 5: Render the component
{showCodex && (
  <UnifiedBestiaryCodex
    theme={gameTheme}
    onClose={() => setShowCodex(false)}
  />
)}

// ============================================================
// OPTIONAL CUSTOMIZATIONS
// ============================================================

// Add more creatures to the bestiary:
// Edit ENHANCED_CREATURES array in UnifiedBestiaryCodex.tsx

// Add more player classes:
// Edit PLAYER_CLASSES array in PlayerAvatarCreator.tsx

// Create new creature types:
// Add new functions in EnhancedBestiary.tsx following this pattern:
/*
export function MyNewCreatureFigure({ name, color }: { name: string; color: string }) {
  const light = lighten(color, 40);
  const dark = lighten(color, -40);
  
  return (
    <g>
      {/* Your SVG path/shapes here */}
    </g>
  );
}

// Then update EnhancedSigil to use it:
} else if (type === 'myNewType') {
  figure = <MyNewCreatureFigure name={name} color={color} />;
}
*/

// ============================================================
// COMPONENT EXPORTS & REUSABILITY
// ============================================================

// Use PlayerAvatarCreator standalone:
import PlayerAvatarCreator from './components/PlayerAvatarCreator';

<PlayerAvatarCreator
  theme={gameTheme}
  onCreateCharacter={(appearance) => {
    console.log('Character created:', appearance);
    // Save to game state, database, etc.
  }}
/>

// Use EnhancedSigil for individual creatures:
import { EnhancedSigil } from './components/EnhancedBestiary';

<EnhancedSigil
  name="Flame Dragon"
  color="#c2451f"
  type="quad:dragon"
  rank="elite"
  size={150}
  animated={true}
/>

// ============================================================
// THEME CUSTOMIZATION
// ============================================================

// Light theme example:
const lightTheme = {
  bg: '#f5f1ed',
  panel: '#e8e3dd',
  panel2: '#ddd7d0',
  accent: '#e74c3c',
  accent2: '#f39c12',
  text: '#2c2415',
  muted: '#6b6158',
  line: '#c9c1b6',
  vign: 'rgba(255,255,255,0.3)',
};

// ============================================================
// SAVE/LOAD CHARACTER
// ============================================================

function saveCharacter(appearance) {
  localStorage.setItem('playerCharacter', JSON.stringify(appearance));
}

function loadCharacter() {
  const saved = localStorage.getItem('playerCharacter');
  return saved ? JSON.parse(saved) : null;
}

// ============================================================
// CREATURE EVOLUTION EXAMPLE
// ============================================================

// Add evolution chains like:
const EVOLUTION_CHAINS = [
  {
    chain: ['Imp', 'Hell Knight', 'Pit Lord', 'Demon General'],
    race: 'demons',
  },
  {
    chain: ['Scarab Warrior', 'Scarab Knight', 'Hive Queen'],
    race: 'cursed',
  },
];

// ============================================================
// PROCEDURAL STAT GENERATION
// ============================================================

function generateCreatureStats(name: string, baseStats: any) {
  const seed = hash(name);
  return {
    health: baseStats.health + ((seed % 30) - 15),
    attack: baseStats.attack + ((seed % 8) - 4),
    defense: baseStats.defense + ((seed % 6) - 3),
    speed: baseStats.speed + ((seed % 4) - 2),
  };
}

// ============================================================
// COMBAT SYSTEM INTEGRATION
// ============================================================

interface CombatStats {
  health: number;
  attack: number;
  defense: number;
  speed: number;
}

function calculateDamage(
  attacker: CombatStats,
  defender: CombatStats,
  attackerWeakness: string | null
): number {
  let baseDamage = attacker.attack * (1 + Math.random() * 0.2);
  let defenseMitigation = 1 - (defender.defense / 100);
  let finalDamage = baseDamage * defenseMitigation;
  
  // Apply weakness bonus
  if (attackerWeakness) {
    finalDamage *= 1.5;
  }
  
  return Math.max(1, Math.floor(finalDamage));
}

// ============================================================
