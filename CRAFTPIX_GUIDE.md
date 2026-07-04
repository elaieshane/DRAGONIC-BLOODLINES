# CraftPix Integration Guide

## Overview

You now have full CraftPix asset integration with:
- **12+ asset packs** from CraftPix (dungeons, NPCs, characters, tilesets)
- **UI Component Library** with pixel-art theming
- **Procedural Environment Builder** for dynamic dungeon generation
- **NPC Avatar System** with emotional states
- **Live Showcase** accessible via the Palette icon in-game

## 🎨 Available Assets

### Environment Tilesets
| Asset Pack | Theme | Use Case |
|-----------|-------|----------|
| **2D Top-Down Dungeon** | Classic stone dungeon | Walls, floors, decorative elements |
| **Top-Down Ruins** | Ancient ruins | Weathered structures, shadows |
| **Undead Tileset** | Necromantic | Gravestones, bones, cursed ground |
| **Cursed Land** | Dark magic | Corrupted terrain, lava flows |

### UI & Characters
| Asset Pack | Category | Features |
|-----------|----------|----------|
| **Medieval NPC Avatars** | UI | 4 NPCs × 6 emotions = 24 avatar variations |
| **Dark Elf Queen** | UI | Character portrait with emotional states |
| **Skeleton Sprites** | Characters | Animated undead warrior |
| **Werewolf** | Characters | Beast form transformations |
| **Gorgon** | Characters | Serpentine enemy type |
| **Demon** | Characters | Fire-based antagonists |
| **Halfling** | Characters | Small-folk allies/enemies |
| **Dark Elf Pack** | Characters | Full sprite sheet set |

## 🚀 Quick Start

### 1. Access the CraftPix Showcase In-Game
- Launch the game in-browser
- During gameplay, click the **Palette icon** (🎨) in the top toolbar
- Explore UI components, environments, and NPC avatars

### 2. Import Components in Your Code

```tsx
// UI Components
import {
  CraftPixButton,
  CraftPixPanel,
  CraftPixTabs,
  CraftPixDialog,
  CraftPixBadge,
  CraftPixGrid,
  CraftPixCard,
  PIXEL_THEME,
} from './components/CraftPixUI';

// Environment System
import {
  EnvironmentBuilder,
  EnvironmentCanvas,
  generateEnvironment,
  TileType,
} from './components/CraftPixEnvironment';

// NPC System
import {
  NPCAvatar,
  NPCDialogue,
  NPCRoster,
  PREDEFINED_NPCS,
  type NPC,
  type NPCEmotion,
} from './components/CraftPixNPC';

// Asset Management
import {
  CRAFTPIX_ASSETS,
  getEnvironmentAssets,
  getUIAssets,
  getCharacterAssets,
  loadAsset,
  preloadAssets,
} from './utils/craftpix';
```

## 📦 Component Examples

### UI Buttons
```tsx
<CraftPixButton variant="primary" size="medium">
  Attack
</CraftPixButton>

<CraftPixButton variant="danger" disabled>
  Spell Locked
</CraftPixButton>
```

**Variants:** `primary` | `secondary` | `danger` | `success`  
**Sizes:** `small` | `medium` | `large`

### Panels & Containers
```tsx
<CraftPixPanel title="Inventory" variant="dark">
  <p>Your items appear here</p>
</CraftPixPanel>
```

**Variants:** `dark` | `light`

### Tabs Navigation
```tsx
<CraftPixTabs
  tabs={[
    { label: "Stats", content: <StatsView /> },
    { label: "Skills", content: <SkillsView /> },
    { label: "Spells", content: <SpellsView /> },
  ]}
  defaultTab={0}
  onTabChange={(index) => console.log("Tab changed to", index)}
/>
```

### Dialogs
```tsx
<CraftPixDialog
  title="Cursed Tomb"
  isOpen={showDialog}
  onClose={() => setShowDialog(false)}
  actions={[
    { label: "Cancel", onClick: handleCancel },
    { label: "Enter", onClick: handleEnter, variant: "success" },
  ]}
>
  <p>You sense great treasure... but also great danger.</p>
</CraftPixDialog>
```

### Badges
```tsx
<CraftPixBadge variant="gold">RARE</CraftPixBadge>
<CraftPixBadge variant="red">CURSED</CraftPixBadge>
<CraftPixBadge variant="green">BLESSED</CraftPixBadge>
```

**Variants:** `gold` | `red` | `green` | `blue`

### Cards with Grid
```tsx
<CraftPixGrid columns={3} gap={12}>
  {creatures.map(creature => (
    <CraftPixCard
      key={creature.id}
      title={creature.name}
      subtitle={creature.type}
      onClick={() => selectCreature(creature)}
    >
      {creature.description}
    </CraftPixCard>
  ))}
</CraftPixGrid>
```

## 🏛️ Environment System

### Generate Procedural Dungeons
```tsx
import { generateEnvironment, EnvironmentCanvas } from './components/CraftPixEnvironment';

const env = generateEnvironment({
  width: 16,
  height: 12,
  theme: 'dungeon',     // 'dungeon' | 'ruins' | 'cursed' | 'undead'
  waterLevel: 0.3,      // 0-1: how much water (0 = none)
  decorationDensity: 0.1, // 0-1: how many decorations
  seed: 42,             // optional: for reproducible generation
});

<EnvironmentCanvas 
  environment={env}
  tileSize={32}
  showGrid={false}
  zoom={1.5}
/>
```

### Theme Colors
- **Dungeon**: Brown stone, blue water, red traps
- **Ruins**: Gray weathered stone, blue water, tan decorations
- **Cursed**: Dark purple walls, magenta water, green chests
- **Undead**: Pale stone, dark water, brown bones

### Tile Types
```tsx
enum TileType {
  FLOOR = "floor",
  WALL = "wall",
  WATER = "water",
  LAVA = "lava",
  DECORATION = "decoration",
  DOOR = "door",
  TRAP = "trap",
  CHEST = "chest",
  EMPTY = "empty",
}
```

### Interactive Environment Builder
```tsx
<EnvironmentBuilder 
  onEnvironmentChange={(env) => {
    console.log("New environment generated:", env);
    saveEnvironment(env);
  }}
/>
```

Users can adjust:
- Map dimensions (8×6 to 32×24)
- Water level (0-100%)
- Theme selection
- Real-time visualization

## 👥 NPC Avatar System

### Display Individual NPC
```tsx
import { NPCAvatar } from './components/CraftPixNPC';

const npc = {
  id: "NPC_1",
  name: "Lord Castellan",
  title: "Castle Guard Commander",
  emotion: "Aggression" as NPCEmotion,
};

<NPCAvatar 
  npc={npc}
  size="large"  // 'small' | 'medium' | 'large'
  showName={true}
  onClick={() => selectNPC(npc)}
/>
```

### NPC Dialogue Box
```tsx
<NPCDialogue
  npc={npc}
  text="A worthy challenger approaches! Let's test your might."
/>
```

### NPC Roster (Gallery View)
```tsx
import { NPCRoster, PREDEFINED_NPCS } from './components/CraftPixNPC';

<NPCRoster
  npcs={PREDEFINED_NPCS}
  onNPCSelect={(npc) => {
    console.log("Selected:", npc.name);
  }}
/>
```

### Available Emotions
```tsx
type NPCEmotion = 
  | "Aggression"
  | "Calm"
  | "Sadness"
  | "Smile"
  | "Special"
  | "Talk";
```

### Predefined NPCs
1. **Lord Castellan** - Castle Guard Commander
2. **Alira the Sage** - Village Mystic
3. **Krendel the Merchant** - Traveling Trader
4. **Silas the Dark** - Cursed Sorcerer

## 🎯 Integration Patterns

### Integrate into Game Menu
```tsx
import { CraftPixPanel, CraftPixButton } from './components/CraftPixUI';

export function MainMenu() {
  return (
    <CraftPixPanel title="MAIN MENU">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <CraftPixButton variant="primary">New Game</CraftPixButton>
        <CraftPixButton variant="secondary">Load Game</CraftPixButton>
        <CraftPixButton variant="danger">Exit</CraftPixButton>
      </div>
    </CraftPixPanel>
  );
}
```

### Quest Display
```tsx
import { CraftPixCard, CraftPixBadge, CraftPixGrid } from './components/CraftPixUI';

export function QuestLog() {
  return (
    <CraftPixGrid columns={2}>
      {quests.map(quest => (
        <CraftPixCard
          key={quest.id}
          title={quest.name}
          onClick={() => selectQuest(quest)}
        >
          <div style={{ marginBottom: '8px' }}>
            {quest.active && <CraftPixBadge variant="green">ACTIVE</CraftPixBadge>}
            {quest.completed && <CraftPixBadge variant="gold">COMPLETE</CraftPixBadge>}
          </div>
          <p style={{ fontSize: '12px', margin: 0 }}>{quest.progress}%</p>
        </CraftPixCard>
      ))}
    </CraftPixGrid>
  );
}
```

### NPC Dialogue Event
```tsx
import { NPCDialogue } from './components/CraftPixNPC';

export function DialogueEvent({ npc, onClose }) {
  const [dialogIndex, setDialogIndex] = useState(0);
  
  return (
    <div>
      <NPCDialogue
        npc={npc}
        text={npc.dialogue[dialogIndex]}
      />
      <button onClick={() => {
        if (dialogIndex < npc.dialogue.length - 1) {
          setDialogIndex(d => d + 1);
        } else {
          onClose();
        }
      }}>
        Next →
      </button>
    </div>
  );
}
```

## 🎨 Theme & Color System

### PIXEL_THEME Colors
```tsx
export const PIXEL_THEME = {
  dark: "#1a1a1a",           // Background
  darkBrown: "#3d2817",       // Dark panel
  brown: "#5a3a1a",           // Mid-brown
  tan: "#8b6f47",             // Light brown
  light: "#d4af37",           // Light gold text
  gold: "#ffd700",            // Bright gold
  darkRed: "#8b0000",         // Dark red
  red: "#cc0000",             // Bright red
  darkGreen: "#004400",       // Dark green
  green: "#00cc00",           // Bright green
  darkBlue: "#000066",        // Dark blue
  blue: "#0066ff",            // Bright blue
  shadow: "rgba(0, 0, 0, 0.5)", // Shadow overlay
};
```

### Custom Styling
```tsx
import { PIXEL_THEME } from './components/CraftPixUI';

const customStyle = {
  backgroundColor: PIXEL_THEME.darkBrown,
  color: PIXEL_THEME.gold,
  border: `2px solid ${PIXEL_THEME.gold}`,
  padding: '12px',
};
```

## 📂 File Structure

```
src/
├── components/
│   ├── CraftPixUI.tsx              # Button, Panel, Dialog, Badge, Grid, Card
│   ├── CraftPixEnvironment.tsx      # Environment generator & canvas
│   ├── CraftPixNPC.tsx              # NPC avatar system
│   └── CraftPixShowcase.tsx         # Demo/showcase component
├── utils/
│   └── craftpix.ts                 # Asset inventory & loader
└── App.tsx                         # Main app with CraftPix overlay
```

## 🔗 Asset Paths

All CraftPix assets are referenced from the workspace root:

```
/
├── craftpix-net-169442.../        # Dungeon tilesets
├── craftpix-net-934138.../        # Medieval NPC avatars
├── craftpix-net-934618.../        # Ruins tilesets
├── ... (other CraftPix packs)
└── DRAGONIC-BLOODLINES/           # Your game
```

### Loading Assets
```tsx
import { loadAsset, preloadAssets, getAssetURL } from './utils/craftpix';

// Load single asset
const img = await loadAsset('/craftpix-net-169442.../PNG/walls_floor.png');

// Preload multiple
await preloadAssets([
  '/craftpix-net-169442.../PNG/walls_floor.png',
  '/craftpix-net-934138.../NPC_1/Smile.png',
]);

// Get asset URL
const url = getAssetURL('DUNGEON', 'walls_floor.png');
```

## 🚦 Next Steps

### 1. **Enhance Main Menu**
   - Replace current menu with CraftPix UI components
   - Use CraftPixPanel for menu backgrounds
   - Add pixelated buttons and badges

### 2. **Upgrade HUD**
   - Use CraftPixPanel for player stats
   - Add CraftPixBadge for status effects
   - Display inventory with CraftPixGrid + CraftPixCard

### 3. **Interactive Dungeons**
   - Integrate EnvironmentCanvas into DungeonCanvas
   - Use procedural environments for each level
   - Add environmental hazards (lava, water, traps)

### 4. **NPC Interactions**
   - Display NPCAvatar during dialogue
   - Use NPCEmotion for reaction feedback
   - Create branching conversation trees with CraftPixDialog

### 5. **Character/Quest UI**
   - Show quests as CraftPixCard in CraftPixGrid
   - Display character portraits using NPCAvatar
   - Use CraftPixTabs for inventory organization

## 📝 Notes

- All components automatically support **dark/light modes** via `variant` prop
- **GPU-accelerated animations** using CSS transforms
- **Pixel-perfect rendering** with `image-rendering: pixelated`
- **Responsive grid layouts** that adapt to screen size
- **Asset caching** built-in for performance

## 🐛 Troubleshooting

**Assets not loading?**
- Check that CraftPix folders exist in workspace root
- Verify paths in `CRAFTPIX_ASSETS` match actual folder names

**UI components not styled correctly?**
- Ensure Tailwind CSS is imported in your layout
- Use `PIXEL_THEME` colors for consistent theming

**Environment not rendering?**
- Check canvas width/height calculation
- Verify tile size is set correctly (default 32px)

---

**Showcase:** Click the 🎨 Palette icon in-game to explore all features interactively!
