/* ============================================================
   NETERIA — FLAME BEAR LINE (EXPANSION PACK IV)
   A standalone module. Reuses FlameBearFigure from
   MegamorphElementals.jsx (same renderer, same silhouette)
   but adds a proper subordinate progression instead of a
   single entry — a low-tier cub, two mid-tier stances, and
   an elite alpha, each distinguished through name/rank/flavor
   so the bestiary reads them as a real line rather than one
   reused sprite.

   USAGE (inside CodexCreatureDisplay.jsx, without modifying its body):

     import { FLAME_BEAR_LINE, FLAME_BEAR_LINE_BODY_OVERRIDES } from "./FlameBearLine";
     
     // 1. Merge body overrides (place ahead of existing overrides):
     const BODY_OVERRIDES = [
       ...FLAME_BEAR_LINE_BODY_OVERRIDES,
       ...MEGAMORPH_BODY_OVERRIDES,
       /* ...existing... */
     ];
     
     // 2. Push the line into CREATURES:
     CREATURES.push(...FLAME_BEAR_LINE(race, makeCreature));
     // (use this instead of FLAME_BEAR_SUBORDINATE from MegamorphElementals.jsx 
     //  to avoid a duplicate Cinderclaw)

   Body routing: these all still need the "flame-bear" body,
   so make sure MEGAMORPH_BODY_OVERRIDES (from
   MegamorphElementals.jsx) already covers their names, or add
   the extra regex exported below alongside it.
   ============================================================ */

// ---------- extra body routing for the new line's names ----------
// Merge this alongside MEGAMORPH_BODY_OVERRIDES — it only adds
// patterns for names not already covered by "flame.?bear|ember
// ursine|cinderclaw|pyre bear".
export const FLAME_BEAR_LINE_BODY_OVERRIDES = [
  [/emberling|stoked cub|kindling bear|ashback|hearth-broken/i, "flame-bear"],
  [/coalhide|smoulder(ing)? warden|brandclaw/i, "flame-bear"],
  [/wildfire alpha|inferno ursa|the last bonfire/i, "flame-bear"],
];

// ---------- the line ----------
// Call as FLAME_BEAR_LINE(race, makeCreature) from within
// CodexCreatureDisplay.jsx, passing its existing `race` lookup and
// `makeCreature` factory so flavor generation stays consistent.
export function FLAME_BEAR_LINE(race, makeCreature) {
  return [
    makeCreature("Emberling", race("lycans"), "common", {
      lore: "Too young to control the fire on its back — it singes its own fur more often than any hunter's blade does.",
      habitat: "Ashen Wastes",
      weakness: "Alchemical Frost",
    }),
    makeCreature("Ashback", race("lycans"), "common", {
      lore: "The flame along its spine dims to embers when it sleeps, and villagers mistake the low glow for a dying campfire.",
      habitat: "Ashen Wastes",
      weakness: "Cold Iron",
    }),
    makeCreature("Coalhide", race("lycans"), "common", {
      lore: "Its hide has cracked and blackened over so many burns that steel barely marks it anymore.",
      habitat: "Fallen Watchtowers",
      weakness: "Alchemical Frost",
    }),
    makeCreature("Smouldering Warden", race("lycans"), "elite", {
      lore: "It doesn't hunt so much as wait, letting the heat of its own back drive smaller game into the open.",
      habitat: "Ashen Wastes",
      weakness: "Blessed Water",
    }),
    makeCreature("Brandclaw", race("lycans"), "elite", {
      lore: "Every claw mark it leaves cauterizes on contact — a wound and a burn delivered in the same swipe.",
      habitat: "Cathedral Undercroft",
      weakness: "Alchemical Frost",
    }),
    makeCreature("Cinderclaw, the Pyre Bear", race("lycans"), "elite", {
      lore: "Villagers say the fire on its back never goes out, not even when it sleeps through winter.",
      habitat: "Ashen Wastes",
      weakness: "Alchemical Frost",
    }),
    makeCreature("Wildfire Alpha, the Last Bonfire", race("lycans"), "boss", {
      lore: "The pack that once followed it is long dead. It still keeps the fire burning, out of habit more than purpose.",
      habitat: "The Cracked Wyrmfields",
      weakness: "Alchemical Frost",
    }),
  ];
}
