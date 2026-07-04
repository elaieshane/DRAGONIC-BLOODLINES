/* ============================================================
   NETERIA — NEW MYTHOLOGICAL CREATURES (EXPANSION PACK I)
   A standalone module. Import into CodexCreatureDisplay.jsx without
   touching the original file:

     import { NEW_MYTH_CREATURES, NEW_BODY_OVERRIDES } from "./MythExpansion";

   Then, inside CodexCreatureDisplay.jsx:
     1. Merge body overrides BEFORE the existing BODY_OVERRIDES array:
          const BODY_OVERRIDES = [...NEW_BODY_OVERRIDES, ...originalArray];
     2. Push the new creatures alongside the existing MYTH block:
          CREATURES.push(...NEW_MYTH_CREATURES(race, makeCreature));

   These 14 creatures pull from traditions not yet represented in
   the base codex — Aztec, West African, Slavic, Filipino, Celtic,
   Hindu, Aboriginal Australian, and Polynesian mythology — and
   each is routed to a body silhouette distinct from existing
   entries so the procedural sigil generator never repeats a shape.
   ============================================================ */

// ---------- new body-shape routing ----------
// These regexes must be placed ahead of the base BODY_OVERRIDES array
// so they take priority when names could otherwise fall through to
// the generic "biped" default.
export const NEW_BODY_OVERRIDES = [
  [/tzitzimitl|tzitzimime/i, "tentacled"],       // star-demon, many burning eyes
  [/ahuizotl/i, "quad:spider"],                   // hand-tailed water-dog, base uses spider legs
  [/anansi/i, "quad:spider"],                     // trickster spider
  [/aziza/i, "avian"],                             // small winged forest spirits
  [/leshy|leshiy/i, "plant"],                      // forest lord, tree-bodied
  [/rusalka/i, "serpent"],                         // river spirit, flowing serpentine form
  [/zmey|zmiy|gorynych/i, "quad:dragon"],         // Slavic multi-headed dragon
  [/aswang/i, "avian"],                            // shapeshifting winged night-hunter
  [/tikbalang/i, "quad:horse"],                    // horse-headed forest guardian
  [/dullahan|pooka|puca/i, "quad:horse"],
  [/naga rani|naga king|naga queen/i, "serpent"],
  [/rakshasa/i, "biped"],
  [/bunyip/i, "quad:beetle"],                      // hulking swamp-beast, armored bulk
  [/taniwha/i, "serpent"],                         // Polynesian/Maori water guardian
];

// ---------- factory ----------
// Call as NEW_MYTH_CREATURES(race, makeCreature) from within
// CodexCreatureDisplay.jsx, passing its existing `race` lookup and
// `makeCreature` factory so flavor generation stays consistent.
export function NEW_MYTH_CREATURES(race, makeCreature) {
  const MYTH = [
    ["Tzitzimitl, Star-Demon", "Aztec sky-horror descending only during a solar eclipse event."],
    ["Ahuizotl", "A water-dog with a hand at the end of its tail — it drags stragglers under the current."],
    ["Anansi the Weaver", "Spins battle-arenas from living web that reshape mid-fight."],
    ["Aziza of the Deep Wood", "Tiny forest spirits that grant fire-magic to those who best them."],
    ["Leshy, Warden of the Grove", "A forest lord whose height changes to match the height of the trees around him."],
    ["Rusalka", "A drowned river spirit who lures with song before the water rises."],
    ["Zmey Gorynych", "A three-headed Slavic dragon whose heads breathe fire in overlapping arcs."],
    ["Aswang", "A shapeshifting night-hunter that hunts from rooftops before it strikes."],
    ["Tikbalang", "A horse-headed trickster that turns travelers in circles through its own forest."],
    ["The Pooka", "A shapeshifting Celtic spirit who offers a ride no one should accept."],
    ["Naga Rani, the Serpent Queen", "Coils around sunken temple pillars and floods the arena in stages."],
    ["Rakshasa Warlord", "A shapeshifting demon-warrior who fights with a different weapon each phase."],
    ["Bunyip of the Billabong", "A hulking swamp-beast whose roar alone breaks nearby ground."],
    ["Taniwha", "A guardian serpent of sacred waters, said to protect or drown in equal measure."],
  ];
  return MYTH.map(([n, l]) => makeCreature(n, race("mythological"), "mythic", { lore: l }));
}
