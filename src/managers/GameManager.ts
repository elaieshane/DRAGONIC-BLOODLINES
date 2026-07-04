import { LevelData, PlayerState, FloorTheme, EnemyType } from '../types';
import { generateLevel } from '../utils/procedural';

export interface FloorDescriptor {
  name: string;
  subtitle: string;
  role: 'explore' | 'mini_dungeon' | 'safe_zone' | 'mini_boss' | 'boss';
  ambiance: string;     // Color tint hint for UI
  npcName: string | null;
  npcTitle: string | null;
  theme: FloorTheme;
}

export class GameManager {

  // ── KINGDOM FLOOR DESCRIPTORS ──────────────────────────────────────────────
  static getFloorDescriptor(kingdomIndex: number, floorIndex: number): FloorDescriptor {
    const kingdoms: Record<number, FloorDescriptor[]> = {
      1: [
        { name: 'The Outer Nave', subtitle: 'Where the faithful fell', role: 'explore', ambiance: '#1e1b4b', theme: 'ForsakenCathedral', npcName: 'Cyril', npcTitle: 'Arch-Mage of Embers' },
        { name: 'The Bleeding Crypts', subtitle: 'Bones scream in the walls', role: 'mini_dungeon', ambiance: '#3b0764', theme: 'CrimsonGraveyard', npcName: 'Valerie', npcTitle: 'Crimson Blade Maiden' },
        { name: 'The Sanctuary of Ash', subtitle: 'An ember of hope remains', role: 'safe_zone', ambiance: '#1c1917', theme: 'HauntedVillage', npcName: 'Elysia', npcTitle: 'Astral Sorceress' },
        { name: 'The Bell Tower', subtitle: 'The Templar rings the death toll', role: 'mini_boss', ambiance: '#422006', theme: 'ForsakenCathedral', npcName: null, npcTitle: null },
        { name: 'The Inner Sanctum', subtitle: 'He who was once holy now destroys', role: 'boss', ambiance: '#fef08a', theme: 'ForsakenCathedral', npcName: null, npcTitle: null },
      ],
      2: [
        { name: 'The Festering Mire', subtitle: 'Rot and hunger fill the air', role: 'explore', ambiance: '#14532d', theme: 'GhoulSwamp', npcName: 'Rael', npcTitle: 'The Last Druid' },
        { name: 'The Sunken Villages', subtitle: 'A civilization swallowed whole', role: 'mini_dungeon', ambiance: '#166534', theme: 'CrocodileSewers', npcName: 'Ivor', npcTitle: 'Poacher of Beasts' },
        { name: "The Druid's Hollow", subtitle: 'Ancient roots hold old secrets', role: 'safe_zone', ambiance: '#1a2e05', theme: 'HauntedVillage', npcName: 'Sable', npcTitle: 'Witch of the Thorns' },
        { name: 'The Venom Nest', subtitle: 'Sobek watches from the deep', role: 'mini_boss', ambiance: '#064e3b', theme: 'GhoulSwamp', npcName: null, npcTitle: null },
        { name: "Morvessa's Black Cauldron", subtitle: 'Poison runs as thick as blood', role: 'boss', ambiance: '#4ade80', theme: 'GhoulSwamp', npcName: null, npcTitle: null },
      ],
      3: [
        { name: 'The Iron Ramparts', subtitle: 'No sun has touched these walls in centuries', role: 'explore', ambiance: '#1c1917', theme: 'BlackKnightFortress', npcName: 'Gregor', npcTitle: 'Deserter of the Iron Guard' },
        { name: 'The Mine Shaft', subtitle: 'Slaves forge weapons for the dead', role: 'mini_dungeon', ambiance: '#292524', theme: 'AbandonedMines', npcName: 'Tura', npcTitle: 'Freed Thrall' },
        { name: 'The Forge Chamber', subtitle: 'Fire still burns, but no smith remains', role: 'safe_zone', ambiance: '#431407', theme: 'AbandonedMines', npcName: 'Aldric', npcTitle: 'Runesmith' },
        { name: 'The Black Throne Approach', subtitle: "Garruk's shadow falls on everything", role: 'mini_boss', ambiance: '#0f172a', theme: 'BlackKnightFortress', npcName: null, npcTitle: null },
        { name: "Sir Garruk's Black Citadel", subtitle: 'The knight who never fell', role: 'boss', ambiance: '#7c3aed', theme: 'BlackKnightFortress', npcName: null, npcTitle: null },
      ],
      4: [
        { name: 'The Necropolis Gates', subtitle: 'The living are not welcome here', role: 'explore', ambiance: '#2e1065', theme: 'NecromancerTower', npcName: 'Lysara', npcTitle: 'Ghost of a Scholar' },
        { name: 'The Forbidden Library', subtitle: 'Every book screams when opened', role: 'mini_dungeon', ambiance: '#1e1b4b', theme: 'ForgottenLibrary', npcName: 'Tome', npcTitle: 'Living Grimoire' },
        { name: 'The Crypt of Remembrance', subtitle: 'A memorial for those Malakar murdered', role: 'safe_zone', ambiance: '#0f172a', theme: 'CrimsonGraveyard', npcName: 'Mira', npcTitle: 'The Last Cleric' },
        { name: 'The Ossuary', subtitle: 'Ten thousand bones await your blood', role: 'mini_boss', ambiance: '#4c1d95', theme: 'NecromancerTower', npcName: null, npcTitle: null },
        { name: "Malakar's Spire", subtitle: 'Death is only the beginning', role: 'boss', ambiance: '#6d28d9', theme: 'NecromancerTower', npcName: null, npcTitle: null },
      ],
      5: [
        { name: 'The Dragon Nest Outskirts', subtitle: 'The very ground breathes fire', role: 'explore', ambiance: '#431407', theme: 'DragonNest', npcName: 'Kael', npcTitle: 'Dragonborn Scholar' },
        { name: 'The Volcanic Wastes', subtitle: 'Magma swallows the unwary', role: 'mini_dungeon', ambiance: '#7c2d12', theme: 'VolcanicWastes', npcName: 'Solas', npcTitle: 'Exiled Pyromaniac' },
        { name: 'The Ancient Wyrmholt', subtitle: 'A sleeping giant stirs', role: 'safe_zone', ambiance: '#292524', theme: 'DragonNest', npcName: 'Ignis', npcTitle: 'Dragonkin Elder' },
        { name: 'The Eternal Throne Approach', subtitle: 'Ancient sigils seal the path forward', role: 'mini_boss', ambiance: '#78350f', theme: 'EternalThrone', npcName: null, npcTitle: null },
        { name: 'The Eternal Throne of Caelus', subtitle: 'The final dragon stirs from his millennium slumber', role: 'boss', ambiance: '#f97316', theme: 'EternalThrone', npcName: null, npcTitle: null },
      ],
    };

    const floors = kingdoms[kingdomIndex] || kingdoms[1];
    return floors[floorIndex - 1] || floors[0];
  }

  // ── THEME LOOKUP ──────────────────────────────────────────────────────────
  static getKingdomTheme(kingdomIndex: number): FloorTheme[] {
    const kingdom = [1, 2, 3, 4, 5].includes(kingdomIndex) ? kingdomIndex : 1;
    return [1, 2, 3, 4, 5].map(f =>
      this.getFloorDescriptor(kingdom, f).theme
    );
  }

  // ── GENERATE FLOOR ────────────────────────────────────────────────────────
  static generateFloor(kingdomIndex: number, floorIndex: number): LevelData {
    const descriptor = this.getFloorDescriptor(kingdomIndex, floorIndex);
    const level = generateLevel(kingdomIndex, floorIndex, descriptor.theme);
    return level;
  }

  // ── KINGDOM NAMES ─────────────────────────────────────────────────────────
  static getKingdomName(kingdomIndex: number): string {
    const names: Record<number, string> = {
      1: 'The Forsaken Cathedral',
      2: 'The Black Swamp',
      3: 'The Iron Fortress',
      4: 'The Necropolis',
      5: 'Dragon Maw',
    };
    return names[kingdomIndex] || 'Unknown Kingdom';
  }

  static getKingdomLore(kingdomIndex: number): string {
    const lore: Record<number, string> = {
      1: 'A cathedral that God abandoned. Its priests now serve something far older and darker than faith.',
      2: 'A swamp kingdom where life itself has been infected. The Witch Queen Morvessa reigns from her cauldron throne.',
      3: 'An iron fortress whose Black Knight guards a secret more terrible than death itself.',
      4: 'A necropolis built atop a mass grave. King Malakar rules every soul within — living or dead.',
      5: 'A volcanic kingdom at the edge of the world, where Emperor Caelus dreams of ending all mortal life.',
    };
    return lore[kingdomIndex] || '';
  }

  // ── BOSS NAMES ────────────────────────────────────────────────────────────
  static getBossForKingdom(kingdomIndex: number): string {
    const bosses: Record<number, string> = {
      1: 'The Hollow Archbishop',
      2: 'Witch Queen Morvessa',
      3: 'Sir Garruk, The Black Knight',
      4: 'Necromancer King Malakar',
      5: 'Emperor Caelus, The Ancient Dragon',
    };
    return bosses[kingdomIndex] || 'Unknown Boss';
  }

  // ── BOSS INTRO DIALOGUE ───────────────────────────────────────────────────
  static getBossIntroDialogue(kingdomIndex: number): string[] {
    const intros: Record<number, string[]> = {
      1: [
        "So… the bloodline survives.",
        "I had hoped Dracula's servants would end you before you reached my sanctum.",
        "No matter. I have rewritten history to condemn your kind.",
        "The false gospel ends with YOUR death.",
        "KNEEL BEFORE THE ARCHBISHOP!"
      ],
      2: [
        "Another fool stumbles into my cauldron...",
        "The swamp has whispered your name to me for days.",
        "You smell of dragon blood. How... delicious.",
        "I will cook your soul and serve it to my ghouls!",
        "SUFFER, MORTAL — MORVESSA HUNGERS!"
      ],
      3: [
        "...",
        "Turn back.",
        "I have slain 10,000 warriors who stood where you stand.",
        "My blade has never known defeat. It never will.",
        "THEN DIE WITH HONOUR, FOOL!"
      ],
      4: [
        "You... dare enter my domain?",
        "Every soul here belongs to me.",
        "Your companions, your allies — all will rise again under my command.",
        "Death is not your enemy. I am.",
        "WELCOME TO ETERNITY, WORM!"
      ],
      5: [
        "...(A tremor shakes the throne room)",
        "So a mortal dares wake me...",
        "Ten thousand years of slumber... and this is what I wake to?",
        "Your bloodline is an INSULT to dragonkind.",
        "I WILL BURN YOUR WORLD TO ASH!"
      ],
    };
    return intros[kingdomIndex] || intros[1];
  }

  // ── FLOOR ROLE HELPERS ────────────────────────────────────────────────────
  static isSafeFloor(floorIndex: number): boolean {
    return floorIndex === 3;
  }

  static isBossFloor(floorIndex: number): boolean {
    return floorIndex === 5;
  }

  static isMiniBossFloor(floorIndex: number): boolean {
    return floorIndex === 4;
  }

  // ── MINI BOSS FOR KINGDOM/FLOOR ───────────────────────────────────────────
  static getMiniBoss(kingdomIndex: number): EnemyType {
    const miniBosses: Record<number, EnemyType> = {
      1: 'CathedralTemplar',
      2: 'CrocodileKing',
      3: 'Frankenstein',
      4: 'BoneGiant',
      5: 'DragonKnight',
    };
    return miniBosses[kingdomIndex] || 'CathedralTemplar';
  }
}
