import { BestiaryEntry, Faction } from '../types';

export const BESTIARY_DATABASE: BestiaryEntry[] = [
  // 1. DRAGONS
  { id: 'FlameDragon', name: 'Flame Dragon', faction: 'Dragons', description: 'Ancient creature born from the first fires.', habitat: 'Volcanic Wastes', weakness: 'Frost', drops: ['Dragon Scale', 'Fire Core'], baseTier: 3 },
  { id: 'FrostDragon', name: 'Frost Dragon', faction: 'Dragons', description: 'Sleeping under glaciers, their breath freezes time.', habitat: 'Frozen Peaks', weakness: 'Fire', drops: ['Ice Crystal', 'Dragon Fang'], baseTier: 3 },
  { id: 'CrimsonDrake', name: 'Crimson Drake', faction: 'Dragons', description: 'A massive winged beast guarding the lower skies.', habitat: 'Dragon Sanctuary', weakness: 'Lightning', drops: ['Crimson Scale'], baseTier: 4 },
  { id: 'DragonKnight', name: 'Draconic Knight-Captain', faction: 'Dragons', description: 'A mortal champion armored in dragonbone and bound to the Maw.', habitat: 'Dragon Maw', weakness: 'Frost', drops: ['Dragonbone Plate', 'Knight-Captain Crest'], baseTier: 4 },
  { id: 'NamelessDragon', name: 'The Nameless Dragon', faction: 'Dragons', description: 'The oldest surviving dragon. Blind, but hunts by heartbeat.', habitat: 'Dragon Sanctuary', weakness: 'Holy', drops: ['Dragon King\'s Heart'], baseTier: 5 },

  // 2. VAMPIRES
  { id: 'BloodKnight', name: 'Blood Knight', faction: 'Vampires', description: 'Elite vampire warrior wielding weapons forged from blood.', habitat: 'Crimson Palace', weakness: 'Holy', drops: ['Vampire Dust', 'Blood Iron'], baseTier: 2 },
  { id: 'BloodMage', name: 'Blood Mage', faction: 'Vampires', description: 'Uses forbidden blood sorcery.', habitat: 'Crimson Palace', weakness: 'Silver', drops: ['Vial of Blood', 'Arcane Scroll'], baseTier: 2 },
  { id: 'NightStalker', name: 'Night Stalker', faction: 'Vampires', description: 'Invisible until they strike.', habitat: 'Haunted Village', weakness: 'Light', drops: ['Shadow Cloak'], baseTier: 3 },

  // 3. LYCANS
  { id: 'DireWolf', name: 'Dire Wolf', faction: 'Lycans', description: 'Massive wolves corrupted by the moon.', habitat: 'Blood Forest', weakness: 'Silver', drops: ['Wolf Pelt', 'Sharp Fang'], baseTier: 1 },
  { id: 'AlphaLycan', name: 'Alpha Lycan', faction: 'Lycans', description: 'Leader of the pack. Walks upright.', habitat: 'Blood Forest', weakness: 'Silver', drops: ['Alpha Claw'], baseTier: 3 },
  { id: 'Fenrir', name: 'Fenrir, The Moon King', faction: 'Lycans', description: 'The first wolf to drink dragon blood.', habitat: 'Frozen Peaks', weakness: 'Holy Fire', drops: ['Moon Fang'], baseTier: 5 },

  // 4. DEMONS
  { id: 'Imp', name: 'Imp', faction: 'Demons', description: 'Small, annoying, and travels in packs.', habitat: 'Eternal Throne', weakness: 'Holy', drops: ['Demon Horn'], baseTier: 1 },
  { id: 'Succubus', name: 'Succubus', faction: 'Demons', description: 'Drains life force with a touch.', habitat: 'Eternal Throne', weakness: 'Holy', drops: ['Demon Heart'], baseTier: 2 },
  { id: 'HellHound', name: 'Hell Hound', faction: 'Demons', description: 'Dogs of the underworld made of fire.', habitat: 'Volcanic Wastes', weakness: 'Frost', drops: ['Hellfire Ember'], baseTier: 2 },
  { id: 'Azrakh', name: 'Azrakh, Lord of Ash', faction: 'Demons', description: 'A demon general made entirely of burning ash.', habitat: 'Volcanic Wastes', weakness: 'Holy', drops: ['Ash Crown'], baseTier: 5 },

  // 5. CELESTIALS
  { id: 'BrokenSeraph', name: 'Broken Seraph', faction: 'Celestials', description: 'An angel whose wings were burnt away.', habitat: 'Forsaken Cathedral', weakness: 'Shadow', drops: ['Burnt Feather'], baseTier: 2 },
  { id: 'HolyExecutioner', name: 'Holy Executioner', faction: 'Celestials', description: 'Delivers blind justice with a massive axe.', habitat: 'Forsaken Cathedral', weakness: 'Shadow', drops: ['Executioner Axe'], baseTier: 3 },
  { id: 'FallenArchangel', name: 'The Fallen Archangel', faction: 'Celestials', description: 'Once the highest of the host, now corrupted by The Hunger.', habitat: 'Forsaken Cathedral', weakness: 'Shadow', drops: ['Halo Fragment'], baseTier: 5 },

  // 6. TITANS
  { id: 'StoneTitan', name: 'Stone Titan', faction: 'Titans', description: 'A walking mountain.', habitat: 'Ancient Quarry', weakness: 'Lightning', drops: ['Titan Core'], baseTier: 3 },
  { id: 'IceTitan', name: 'Ice Titan', faction: 'Titans', description: 'A glacier given life.', habitat: 'Frozen Peaks', weakness: 'Fire', drops: ['Absolute Zero Core'], baseTier: 3 },
  { id: 'Atlas', name: 'Atlas the World Bearer', faction: 'Titans', description: 'He carries the sky on his back.', habitat: 'Ancient Quarry', weakness: 'Arcane', drops: ['World Stone'], baseTier: 5 },

  // 7. SEA CREATURES
  { id: 'MerrowWarrior', name: 'Merrow Warrior', faction: 'SeaCreatures', description: 'Amphibious humanoid warrior.', habitat: 'Crocodile Sewers', weakness: 'Lightning', drops: ['Fish Scale'], baseTier: 1 },
  { id: 'Siren', name: 'Siren', faction: 'SeaCreatures', description: 'Her song confuses and damages the mind.', habitat: 'Crocodile Sewers', weakness: 'Poison', drops: ['Siren Vocal Cord'], baseTier: 2 },
  { id: 'Leviathan', name: 'Leviathan', faction: 'SeaCreatures', description: 'The terror of the deep. A massive sea serpent.', habitat: 'Sunken Kingdom', weakness: 'Lightning', drops: ['Abyssal Pearl'], baseTier: 5 },

  // 8. FOREST SPIRITS
  { id: 'Dryad', name: 'Dryad', faction: 'ForestSpirits', description: 'Tree spirit that attacks interlopers.', habitat: 'Blood Forest', weakness: 'Fire', drops: ['Spirit Wood'], baseTier: 1 },
  { id: 'Treant', name: 'Treant', faction: 'ForestSpirits', description: 'Massive moving tree with high defense.', habitat: 'Blood Forest', weakness: 'Fire', drops: ['Ancient Bark'], baseTier: 2 },
  { id: 'MotherTree', name: 'Mother Tree', faction: 'ForestSpirits', description: 'The corrupted heart of the forest.', habitat: 'Blood Forest', weakness: 'Fire', drops: ['Seed of Life'], baseTier: 5 },

  // 8B. ELVES
  { id: 'ElvenSentinel', name: 'Elven Sentinel', faction: 'Elves', description: 'A moonlit archer guarding the old forest boundary.', habitat: 'Blood Forest', weakness: 'Shadow', drops: ['Moonwood Arrow', 'Elven Thread'], baseTier: 1 },
  { id: 'ElvenSpellblade', name: 'Elven Spellblade', faction: 'Elves', description: 'A swift duelist who binds frost runes into every slash.', habitat: 'Frozen Peaks', weakness: 'Fire', drops: ['Runed Rapier', 'Frostleaf'], baseTier: 2 },
  { id: 'MoonElfMatriarch', name: 'Moon Elf Matriarch', faction: 'Elves', description: 'An exiled high elf queen whose arrows bend around stone.', habitat: 'Blood Forest', weakness: 'Poison', drops: ['Moon Crown Fragment'], baseTier: 4 },

  // 8C. ORCS
  { id: 'OrcRaider', name: 'Orc Raider', faction: 'Orcs', description: 'A brutal warband scout wearing scavenged iron plates.', habitat: 'Abandoned Mines', weakness: 'Arcane', drops: ['Chipped Axe', 'Orc Hide'], baseTier: 1 },
  { id: 'OrcShaman', name: 'Orc Shaman', faction: 'Orcs', description: 'A tusked hex-caster who paints curses in ash and blood.', habitat: 'Black Knight Fortress', weakness: 'Holy', drops: ['Hex Totem', 'Ash Beads'], baseTier: 2 },
  { id: 'OrcWarlord', name: 'Orc Warlord', faction: 'Orcs', description: 'A massive clan-chief whose axe has broken cathedral bells.', habitat: 'Abandoned Mines', weakness: 'Lightning', drops: ['Warlord Axe Head'], baseTier: 4 },

  // 9. CURSED EXPERIMENTS
  { id: 'Frankenstein', name: 'Frankenstein', faction: 'CursedExperiments', description: 'A hulking abomination of stitched flesh.', habitat: 'Frankenstein Lab', weakness: 'Fire', drops: ['Monster Flesh'], baseTier: 2 },
  { id: 'LivingArmor', name: 'Living Armor', faction: 'CursedExperiments', description: 'Empty armor animated by a bound soul.', habitat: 'Frankenstein Lab', weakness: 'Lightning', drops: ['Rusted Plate'], baseTier: 2 },
  { id: 'DoctorVictor', name: 'Doctor Victor', faction: 'CursedExperiments', description: 'The mad scientist behind the abominations.', habitat: 'Frankenstein Lab', weakness: 'Physical', drops: ['Madman\'s Notes'], baseTier: 5 },

  // 10. NECROMANCY
  { id: 'SkeletonKnight', name: 'Skeleton Knight', faction: 'Necromancy', description: 'Undead warrior holding a rusted sword.', habitat: 'Crimson Graveyard', weakness: 'Holy', drops: ['Bone', 'Rusted Sword'], baseTier: 1 },
  { id: 'Lich', name: 'Lich', faction: 'Necromancy', description: 'An undead mage that has achieved immortality.', habitat: 'Necromancer Tower', weakness: 'Holy', drops: ['Phylactery Fragment'], baseTier: 3 },
  { id: 'BoneGiant', name: 'Ossuary Bone Giant', faction: 'Necromancy', description: 'A colossal graveyard construct made from the bones of failed invaders.', habitat: 'The Ossuary', weakness: 'Holy', drops: ['Giant Bone', 'Ossuary Shard'], baseTier: 4 },
  { id: 'NecromancerKing', name: 'Necromancer King', faction: 'Necromancy', description: 'Master of death, controller of 100,000 undead.', habitat: 'Necromancer Tower', weakness: 'Holy', drops: ['Book of Endless Souls'], baseTier: 5 },

  // 11. GARGOYLES
  { id: 'StoneGargoyle', name: 'Stone Gargoyle', faction: 'Gargoyles', description: 'Looks like a statue until it strikes.', habitat: 'Forsaken Cathedral', weakness: 'Blunt', drops: ['Gargoyle Stone'], baseTier: 1 },
  { id: 'FireGargoyle', name: 'Fire Gargoyle', faction: 'Gargoyles', description: 'Breathes flames and dives from the sky.', habitat: 'Forsaken Cathedral', weakness: 'Frost', drops: ['Heated Stone'], baseTier: 2 },
  { id: 'CathedralWatcher', name: 'The Cathedral Watcher', faction: 'Gargoyles', description: 'A gargoyle the size of a bell tower.', habitat: 'Forsaken Cathedral', weakness: 'Holy', drops: ['Watcher\'s Eye'], baseTier: 5 },

  // 12. ABYSSAL
  { id: 'VoidWalker', name: 'Void Walker', faction: 'Abyssal', description: 'A shadowy figure that ignores physical barriers.', habitat: 'The Void', weakness: 'Light', drops: ['Void Dust'], baseTier: 3 },
  { id: 'RealityEater', name: 'Reality Eater', faction: 'Abyssal', description: 'Distorts space around it.', habitat: 'The Void', weakness: 'Arcane', drops: ['Tear in Reality'], baseTier: 4 },
  { id: 'TheArchitect', name: 'The Architect', faction: 'Abyssal', description: 'The builder of the endless labyrinth.', habitat: 'The Void', weakness: 'None', drops: ['Blueprint of the Void'], baseTier: 5 },

  // 13. MYTHOLOGICAL
  { id: 'MinotaurWarlord', name: 'Minotaur Warlord', faction: 'Mythological', description: 'Charges through walls with terrifying speed.', habitat: 'Ancient Quarry', weakness: 'Poison', drops: ['Minotaur Horn'], baseTier: 3 },
  { id: 'ValkyrieExile', name: 'Valkyrie Exile', faction: 'Mythological', description: 'Fallen warrior maiden from the frozen north.', habitat: 'Frozen Peaks', weakness: 'Shadow', drops: ['Valkyrie Spear'], baseTier: 4 },
  { id: 'Cerberus', name: 'Cerberus, Warden of Ash', faction: 'Mythological', description: 'Three heads, three elements.', habitat: 'Gates of the Underworld', weakness: 'Holy', drops: ['Cerberus Collar'], baseTier: 5 },

  // 14. ELDRITCH HORRORS
  { id: 'ThousandEyedWatcher', name: 'Thousand-Eyed Watcher', faction: 'Eldritch', description: 'A floating mass of eyes that inflicts madness.', habitat: 'Blood Moon', weakness: 'None', drops: ['Eldritch Eye'], baseTier: 4 },
  { id: 'TheWeepingMoon', name: 'The Weeping Moon', faction: 'Eldritch', description: 'An entity that appears only during a lunar eclipse.', habitat: 'Blood Moon', weakness: 'None', drops: ['Moon Tear'], baseTier: 5 },

  // LEGACY/COMMON (Uncategorized or retrofitted)
  { id: 'Bat', name: 'Cave Bat', faction: 'Uncategorized', description: 'A simple bat.', habitat: 'Caves', weakness: 'Fire', drops: ['Bat Wing'], baseTier: 0 },
  { id: 'Thrall', name: 'Vampire Thrall', faction: 'Vampires', description: 'Mindless servant of a vampire.', habitat: 'Haunted Village', weakness: 'Silver', drops: ['Torn Cloth'], baseTier: 0 },
  { id: 'Skeleton', name: 'Skeleton', faction: 'Necromancy', description: 'Animated bones.', habitat: 'Crimson Graveyard', weakness: 'Blunt', drops: ['Bone'], baseTier: 0 },
  { id: 'Mage', name: 'Corrupted Mage', faction: 'CursedExperiments', description: 'A human driven mad by magic.', habitat: 'Forgotten Library', weakness: 'Physical', drops: ['Mana Potion'], baseTier: 1 },
  { id: 'Ghoul', name: 'Ghoul', faction: 'Necromancy', description: 'A flesh-eating undead.', habitat: 'Ghoul Swamp', weakness: 'Fire', drops: ['Rotten Flesh'], baseTier: 1 },
  { id: 'PlagueGhoul', name: 'Plague Ghoul', faction: 'Necromancy', description: 'Elite ghoul that leaves poison clouds.', habitat: 'Ghoul Swamp', weakness: 'Fire', drops: ['Toxic Gland'], baseTier: 2 },
  { id: 'Ghost', name: 'Vengeful Ghost', faction: 'Necromancy', description: 'An angry spirit.', habitat: 'Haunted Village', weakness: 'Arcane', drops: ['Ectoplasm'], baseTier: 1 },
  { id: 'Zombie', name: 'Zombie', faction: 'Necromancy', description: 'A slow moving corpse.', habitat: 'Crimson Graveyard', weakness: 'Fire', drops: ['Rotten Flesh'], baseTier: 0 },
  { id: 'Werewolf', name: 'Werewolf', faction: 'Lycans', description: 'A human cursed by the moon.', habitat: 'Blood Forest', weakness: 'Silver', drops: ['Wolf Pelt'], baseTier: 1 }
];

export function getBestiaryEntry(id: string): BestiaryEntry | undefined {
  return BESTIARY_DATABASE.find(e => e.id === id);
}

export function getEnemiesByFaction(faction: Faction): BestiaryEntry[] {
  return BESTIARY_DATABASE.filter(e => e.faction === faction);
}
