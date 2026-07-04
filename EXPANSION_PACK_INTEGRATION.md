/* ============================================================
   EXPANSION PACK INTEGRATION GUIDE
   How to merge all expansion modules into CodexCreatureDisplay.jsx
   ============================================================ */

// STEP 1: ADD IMPORTS AT THE TOP OF CodexCreatureDisplay.jsx
// ──────────────────────────────────────────────────────────

import {
  NEW_MYTH_CREATURES,
  NEW_BODY_OVERRIDES,
} from "./MythExpansion";

import {
  WingedTentacledFigure,
  CrocodilianFigure,
  ClawTentacleGhoulFigure,
  ENIGMATIC_BODY_OVERRIDES,
  ENIGMATIC_BOSSES,
} from "./EnigmaticBosses";

import {
  FLAME_BEAR_LINE,
  FLAME_BEAR_LINE_BODY_OVERRIDES,
} from "./FlameBearLine";

// ============================================================
// STEP 2: MERGE BODY_OVERRIDES ARRAY
// ──────────────────────────────────────────────────────────
// FIND THIS:
/*
const BODY_OVERRIDES = [
  [/j[oö]rmungor|n[ií]ðhoggr|nidhoggr|leviathan|serpent of ra|sea serpent|abyss shark/i, "serpent"],
  [/kraken|eye beast|void walker|void spider|reality eater|shadow whale|night terror|mirror demon|dream devourer|thousand-eyed|flesh cathedral|hollow choir|maw of infinity|weeping moon|hand of oblivion|nameless choir|dream eater/i, "tentacled"],
  // ... rest of existing entries ...
];
*/

// REPLACE IT WITH:
const BODY_OVERRIDES = [
  // Expansion packs (place first for priority)
  ...FLAME_BEAR_LINE_BODY_OVERRIDES,
  ...ENIGMATIC_BODY_OVERRIDES,
  ...NEW_BODY_OVERRIDES,
  
  // Existing base entries
  [/j[oö]rmungor|n[ií]ðhoggr|nidhoggr|leviathan|serpent of ra|sea serpent|abyss shark/i, "serpent"],
  [/kraken|eye beast|void walker|void spider|reality eater|shadow whale|night terror|mirror demon|dream devourer|thousand-eyed|flesh cathedral|hollow choir|maw of infinity|weeping moon|hand of oblivion|nameless choir|dream eater/i, "tentacled"],
  [/cerberus/i, "quad:cerberus"],
  [/chimera/i, "quad:chimera"],
  [/scarab/i, "quad:beetle"],
  [/kelpie/i, "quad:horse"],
  [/dragon/i, "quad:dragon"],
  [/wolf|lycan|fenrir/i, "quad:wolf"],
  [/spider/i, "quad:spider"],
  [/harpy|tengu/i, "avian"],
  [/slime|plague giant|^ooze|jelly/i, "ooze"],
  [/living armor|mutated knight|flesh golem|stone golem|lava golem|ash titan/i, "armored"],
  [/forest guardian|beast lord/i, "centaur"],
  [/treant|dryad|living vine|mushroom giant/i, "plant"],
];

// ============================================================
// STEP 3: EXTEND SIGIL() COMPONENT BODY DISPATCH
// ──────────────────────────────────────────────────────────
// FIND THIS IN Sigil() COMPONENT:
/*
  let inner;
  let offsetX = 20, offsetY = 4;
  if (body === "biped") inner = <BipedFigure name={name} race={race} />;
  else if (body === "giant") { inner = <BipedFigure name={name} race={race} giant />; offsetX = 16; offsetY = 2; }
  // ... more conditions ...
  else if (body === "centaur") { inner = <CentaurFigure name={name} race={race} />; offsetX = 0; offsetY = 10; }
*/

// ADD THESE THREE LINES BEFORE THE FINAL CLOSING:
  else if (body === "winged-tentacled") { inner = <WingedTentacledFigure name={name} race={race} rank={rank} />; offsetX = 10; offsetY = 8; }
  else if (body === "crocodilian") { inner = <CrocodilianFigure name={name} race={race} />; offsetX = 0; offsetY = 26; }
  else if (body === "claw-tentacle-ghoul") { inner = <ClawTentacleGhoulFigure name={name} race={race} />; offsetX = 0; offsetY = 4; }

// ============================================================
// STEP 4: ADD NEW CREATURES TO THE PUSH BLOCK
// ──────────────────────────────────────────────────────────
// FIND THIS SECTION:
/*
const MYTH = [
  ["Minotaur Warlord", "Charges through walls and fights inside a shifting labyrinth arena."],
  // ... existing myth entries ...
];
CREATURES.push(...MYTH.map(([n, l]) => makeCreature(n, race("mythological"), "mythic", { lore: l })));

const ELDRITCH = ["Thousand-Eyed Watcher", ...];
CREATURES.push(...ELDRITCH.map((n) => makeCreature(n, race("eldritch"), "eldritch", { lore: "..." })));
*/

// ADD THESE THREE PUSH CALLS AFTER THE EXISTING MYTH/ELDRITCH:
// Push expansion mythological creatures
CREATURES.push(...NEW_MYTH_CREATURES(race, makeCreature));

// Push expansion boss creatures
CREATURES.push(...ENIGMATIC_BOSSES(race, makeCreature));

// Push flame bear progression (replaces old FLAME_BEAR_SUBORDINATE if it exists)
CREATURES.push(...FLAME_BEAR_LINE(race, makeCreature));

// ============================================================
// COMPLETE EXAMPLE: CREATURES.push() SECTION
// ──────────────────────────────────────────────────────────
/*
CREATURES.push(
  ...["Flame Dragon","Frost Dragon",...].map((n) => makeCreature(n, race("dragons"))),
  // ... existing creatures ...
);

// Existing mythological creatures
const MYTH = [
  ["Minotaur Warlord", "Charges through walls..."],
  // ... existing MYTH entries ...
];
CREATURES.push(...MYTH.map(([n, l]) => makeCreature(n, race("mythological"), "mythic", { lore: l })));

// Existing eldritch creatures
const ELDRITCH = ["Thousand-Eyed Watcher",...];
CREATURES.push(...ELDRITCH.map((n) => makeCreature(n, race("eldritch"), "eldritch", { lore: "..." })));

// ─── EXPANSION PACKS ───
// Push expansion mythological creatures (14 new creatures)
CREATURES.push(...NEW_MYTH_CREATURES(race, makeCreature));

// Push expansion boss creatures (3 new boss-tier creatures with unique bodies)
CREATURES.push(...ENIGMATIC_BOSSES(race, makeCreature));

// Push flame bear progression (7 creatures: cub → elite → boss)
CREATURES.push(...FLAME_BEAR_LINE(race, makeCreature));
*/

// ============================================================
// WHAT YOU GET
// ──────────────────────────────────────────────────────────

/**
 * Expansion Pack I: MythExpansion.jsx
 * ├─ 14 new mythological creatures
 * ├─ Aztec, West African, Slavic, Filipino, Celtic, Hindu,
 * │  Aboriginal Australian, Polynesian traditions
 * ├─ Each routed to a unique body type (no silhouette reuse)
 * └─ All rank: "mythic"
 *
 * Expansion Pack II: EnigmaticBosses.jsx
 * ├─ 3 new boss-tier creatures with unique bodies:
 * │  • WingedTentacledFigure (Cthulhu-esque horror)
 * │  • CrocodilianFigure (reptile-god quadruped)
 * │  • ClawTentacleGhoulFigure (biomechanical hybrid)
 * ├─ Each a completely new SVG silhouette (no reuse)
 * └─ Ranks: worldboss, boss, boss
 *
 * Expansion Pack IV: FlameBearLine.jsx
 * ├─ 7 creatures in a progression line
 * ├─ Reuses FlameBearFigure from MegamorphElementals.jsx
 * ├─ Progression: common (3x) → elite (3x) → boss (1x)
 * └─ All lycans race (consistent with base system)
 *
 * TOTAL ADDITIONS:
 * • 24 new creatures
 * • 3 brand new body types
 * • 14 body-routing patterns
 * • All self-contained, no modifications to base file
 */

// ============================================================
// TROUBLESHOOTING
// ──────────────────────────────────────────────────────────

/**
 * Q: I see duplicate "Cinderclaw"?
 * A: Remove FLAME_BEAR_SUBORDINATE from MegamorphElementals.jsx
 *    and use FLAME_BEAR_LINE instead (already included).
 *
 * Q: Creatures aren't showing up?
 * A: Make sure BODY_OVERRIDES is merged BEFORE creature names
 *    can be routed to the new body types.
 *
 * Q: "body type not recognized in Sigil()"?
 * A: Add the three new else-if branches to Sigil() component
 *    (winged-tentacled, crocodilian, claw-tentacle-ghoul).
 *
 * Q: Can I use just one expansion pack?
 * A: Yes! Import and merge only what you need. They're independent.
 *
 * Q: Do these require new dependencies?
 * A: No. All use the same hash/lighten/colorFor helpers and
 *    pure React SVG rendering (zero new dependencies).
 *
 * Q: Can I customize these creatures?
 * A: Yes. Edit the factory functions before pushing to CREATURES,
 *    or modify the MYTH/BOSS arrays and regenerate.
 */

// ============================================================
// CLEAN INTEGRATION CHECKLIST
// ──────────────────────────────────────────────────────────

/*
□ Add three imports at the top of CodexCreatureDisplay.jsx
□ Merge BODY_OVERRIDES arrays (expansion first)
□ Add three else-if branches to Sigil() body dispatch
□ Add three CREATURES.push() calls for the expansion packs
□ (Optional) Remove old FLAME_BEAR_SUBORDINATE if using FlameBearLine
□ Test: creatures should appear in bestiary
□ Verify: sigils render correctly for each new creature
□ Check: weakness/stats/lore display properly
□ Ship it!
*/

// ============================================================
// QUICK COPY-PASTE SECTIONS
// ──────────────────────────────────────────────────────────

// FOR IMPORTS SECTION:
`
import {
  NEW_MYTH_CREATURES,
  NEW_BODY_OVERRIDES,
} from "./MythExpansion";

import {
  WingedTentacledFigure,
  CrocodilianFigure,
  ClawTentacleGhoulFigure,
  ENIGMATIC_BODY_OVERRIDES,
  ENIGMATIC_BOSSES,
} from "./EnigmaticBosses";

import {
  FLAME_BEAR_LINE,
  FLAME_BEAR_LINE_BODY_OVERRIDES,
} from "./FlameBearLine";
`

// FOR BODY_OVERRIDES MERGE:
`
const BODY_OVERRIDES = [
  ...FLAME_BEAR_LINE_BODY_OVERRIDES,
  ...ENIGMATIC_BODY_OVERRIDES,
  ...NEW_BODY_OVERRIDES,
  // existing entries follow...
];
`

// FOR SIGIL() DISPATCH:
`
  else if (body === "winged-tentacled") { inner = <WingedTentacledFigure name={name} race={race} rank={rank} />; offsetX = 10; offsetY = 8; }
  else if (body === "crocodilian") { inner = <CrocodilianFigure name={name} race={race} />; offsetX = 0; offsetY = 26; }
  else if (body === "claw-tentacle-ghoul") { inner = <ClawTentacleGhoulFigure name={name} race={race} />; offsetX = 0; offsetY = 4; }
`

// FOR CREATURES PUSH:
`
// Expansion packs
CREATURES.push(...NEW_MYTH_CREATURES(race, makeCreature));
CREATURES.push(...ENIGMATIC_BOSSES(race, makeCreature));
CREATURES.push(...FLAME_BEAR_LINE(race, makeCreature));
`
