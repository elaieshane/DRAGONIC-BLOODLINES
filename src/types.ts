export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic' | 'Ancient' | 'Dragonborn';

export type ItemType = 'Weapon' | 'Armor' | 'Ring' | 'Relic' | 'Crest' | 'Scroll' | 'Pet' | 'PetEquip' | 'PetEgg';

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  rarity: Rarity;
  description: string;
  stats: {
    strength?: number;
    agility?: number;
    arcane?: number;
    vitality?: number;
    defense?: number;
    damage?: number;
    lifesteal?: number;
    manaRegen?: number;
    cooldownReduction?: number;
    critChance?: number;
    fireDamage?: number;
  };
  icon: string;
  lore?: string;
  skill?: string;
  scrollEffect?: string;    // e.g. 'meteor' | 'blizzard' | 'timeslow'
  crestEffect?: string;     // e.g. 'phoenix_revive' | 'void_slow' | 'shadow_clone'
  petSpecies?: PetSpecies;  // for PetEgg items
}

// ── PET TYPES ──────────────────────────────────────────────────────────────────

export type PetSpecies = 'Ash' | 'Umbra' | 'BoneHound' | 'SeraphRaven' | 'IronBear' | 'VoidOwl';
export type PetClass = 'Dragon' | 'Shadow' | 'Undead' | 'Holy' | 'Beast' | 'Arcane';
export type PetMood = 'Happy' | 'Calm' | 'Aggressive' | 'Exhausted' | 'Bonded';
export type PetAIState = 'Idle' | 'Follow' | 'Search' | 'Attack' | 'Retreat' | 'Protect' | 'Special';

export interface PetSkill {
  name: string;
  description: string;
  cooldown: number;         // frames
  damage?: number;
  healAmount?: number;
  aoeRadius?: number;
}

export interface Pet {
  id: string;
  species: PetSpecies;
  name: string;
  rarity: Rarity;
  petClass: PetClass;
  evolutionStage: number;   // 0, 1, 2 = Stage names per species
  level: number;
  experience: number;
  xpNeeded: number;
  bond: number;             // 0–100
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  // Live combat state (not persisted between floors)
  x: number;
  y: number;
  aiState: PetAIState;
  stateTimer: number;
  lastAttackTime: number;
  attackCooldown: number;
  targetId: string | null;
  retreatTimer: number;
  mood: PetMood;
  passiveSkill: PetSkill;
  activeSkill: PetSkill;
  ultimateSkill: PetSkill;
  ultimateCooldown: number;
  // Equipment
  equipped: {
    Helmet: Item | null;
    Collar: Item | null;
    Claws: Item | null;
    Rune: Item | null;
    Accessory: Item | null;
  };
}

export type PlayerClass = 'VampireHunter' | 'RenegadeVampire' | 'DraconicKnight' | 'ElvenRanger' | 'OrcBerserker' | 'ArcaneSorceress';

export interface PlayerCustomization {
  gender: 'Male' | 'Female' | 'Ethereal';
  hairStyle: string;
  hairColor: string;
  skinColor: string;
  eyeColor: string;
  capeColor: string;
  startingPerk: string;
}

export interface PlayerStats {
  strength: number;
  agility: number;
  arcane: number;
  vitality: number;
}

export interface PlayerState {
  class: PlayerClass;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  xp: number;
  xpNeeded: number;
  level: number;
  gold: number;
  stats: PlayerStats;
  statPoints: number;
  inventory: Item[];
  equipped: {
    Weapon: Item | null;
    Armor: Item | null;
    Ring: Item | null;
    Relic: Item | null;
    Crest: Item | null;
    Scroll: Item | null;
    Pet: Item | null;
  };
  activePet: Pet | null;   // Active combat familiar (NOT in the equip slot, persists as entity)
  customization: PlayerCustomization;
  activeBoons: string[];
  levelUpBoonsToSelect: string[];
  x: number;
  y: number;
  size: number;
  dashCooldown: number;
  dashActiveTime: number;
  dashDir: { x: number; y: number };
  lastAttackTime: number;
  facing: 'left' | 'right' | 'up' | 'down';
  shieldActive: boolean;
  shieldCooldown: number;
}

export type EnemyType = string; // Relaxed to string to support the massive Great Bestiary

export type Faction = 
  | 'Dragons' | 'Vampires' | 'Lycans' | 'Demons' 
  | 'Celestials' | 'Titans' | 'SeaCreatures' | 'ForestSpirits' 
  | 'CursedExperiments' | 'Necromancy' | 'Gargoyles' 
  | 'Abyssal' | 'Mythological' | 'Eldritch' | 'Elves' | 'Orcs' | 'Uncategorized';

export interface BloodMoonState {
  isActive: boolean;
  intensity: number; // 1 to 5, scales difficulty and red tint
}

export interface BestiaryEntry {
  id: string; // EnemyType
  name: string;
  faction: Faction;
  description: string;
  habitat: string;
  weakness: string;
  drops: string[];
  baseTier: number; // 0 to 5
}

export interface Enemy {
  id: string;
  type: EnemyType;
  name: string;
  faction: Faction;
  evolutionTier: number;
  isBloodMoonVariant: boolean;
  x: number;
  y: number;
  size: number;
  health: number;
  maxHealth: number;
  damage: number;
  speed: number;
  xpReward: number;
  isBoss: boolean;
  state: 'idle' | 'chase' | 'attack' | 'cooldown' | 'boss_teleport' | 'boss_rage' | 'boss_fly' | 'boss_desperation';
  stateTimer: number;
  lastAttackTime: number;
  attackCooldown: number;
  currentPhase: number;
  color: string;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  damage: number;
  isPlayer: boolean;
  color: string;
  duration: number;
  type: 'fireball' | 'shadow' | 'bone' | 'blood_orb' | 'whip_strike' | 'melee_swipe' | 'fissure_eruption' | 'holy_spear' | 'poison_rain' | 'dark_laser' | 'pet_fire' | 'pet_shadow' | 'pet_bone' | 'pet_holy' | 'pet_void';
  rotation?: number;
  fromPet?: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  duration: number;
  maxDuration: number;
  alpha: number;
}

export interface DamageNumber {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  duration: number;
  maxDuration: number;
}

export type TileType = 
  | 'Wall' | 'Floor' | 'Door' | 'Lava' | 'BloodPool' | 'Stairs' 
  | 'NPC' | 'Chest' | 'Herb' | 'Potion' | 'PoisonSwamp' | 'Ice' | 'Abyss';

export interface Tile {
  type: TileType;
  explored: boolean;
  decoration?: string; 
}

export type FloorTheme = 
  | 'ForsakenCathedral' | 'CrimsonGraveyard' | 'GhoulSwamp' 
  | 'HauntedVillage' | 'NecromancerTower' | 'ForgottenLibrary' 
  | 'FrankensteinLab' | 'RoyalVampirePalace' | 'DragonNest' 
  | 'FrozenMountain' | 'CrocodileSewers' | 'AbandonedMines' 
  | 'BlackKnightFortress' | 'BloodForest' | 'EternalThrone' | 'VolcanicWastes';

export interface LevelData {
  grid: Tile[][];
  width: number;
  height: number;
  enemySpawns: { x: number; y: number; type: EnemyType }[];
  chestSpawns: { x: number; y: number }[];
  npcSpawns?: { x: number; y: number; name: string }[];
  playerSpawn: { x: number; y: number };
  stairsSpawn: { x: number; y: number };
  bossSpawn?: { x: number; y: number };
  kingdomIndex: number;
  floorIndex: number;
  floorTheme: FloorTheme;
  isBloodMoon?: boolean;
}

export interface SaveData {
  saveId: string;
  timestamp: number;
  gameTime: number;
  playerState: PlayerState;
  currentKingdom: number;
  currentFloor: number;
  unlockedKingdoms: number[];
  inventory: Item[];
  newGamePlus: number;
  bestiaryKills?: Record<string, number>; // Maps EnemyType to kill count
  bloodMoon?: BloodMoonState;
}

export interface GameSettings {
  masterVolume: number;
  difficulty: 'Casual' | 'Adventurer' | 'Nightmare';
  crtScanlines: boolean;
  pixelVignette: boolean;
  screenShake: 'None' | 'Low' | 'High';
  showOnScreenButtons: boolean;
}
