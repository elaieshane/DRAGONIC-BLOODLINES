export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';

export type ItemType = 'Weapon' | 'Armor' | 'Ring' | 'Relic';

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
  };
  icon: string;
}

export type PlayerClass = 'VampireHunter' | 'RenegadeVampire' | 'DraconicKnight';

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
  strength: number;  // Increases melee/physical damage
  agility: number;   // Increases attack speed, movement speed, decreases dash cooldown
  arcane: number;    // Increases spell/fire damage, max mana, and mana regen
  vitality: number;  // Increases max health and defensive block
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
  };
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

export type EnemyType = 
  | 'Bat' 
  | 'Thrall' 
  | 'Gargoyle' 
  | 'Skeleton' 
  | 'Mage' 
  | 'Hatchling' 
  | 'BloodFiend'
  | 'DragonCultist'
  | 'Werewolf'
  | 'SkeletonKing'
  | 'VampireLord' 
  | 'ChimeraBeast'
  | 'SmelterGiant'
  | 'GraveDragun'
  | 'WerewolfKing'
  | 'VampireNoble'
  | 'CountDracula'
  | 'CthulhuSquid'
  | 'Hollow'
  | 'Ghost'
  | 'Zombie';

export interface Enemy {
  id: string;
  type: EnemyType;
  name: string;
  x: number;
  y: number;
  size: number;
  health: number;
  maxHealth: number;
  damage: number;
  speed: number;
  xpReward: number;
  isBoss: boolean;
  state: 'idle' | 'chase' | 'attack' | 'cooldown' | 'boss_teleport' | 'boss_rage' | 'boss_fly';
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
  duration: number; // in updates
  type: 'fireball' | 'shadow' | 'bone' | 'blood_orb' | 'whip_strike' | 'melee_swipe' | 'fissure_eruption';
  rotation?: number;
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
  | 'Wall' 
  | 'Floor' 
  | 'Door' 
  | 'Lava' 
  | 'BloodPool' 
  | 'Stairs' 
  | 'NPC' 
  | 'Chest'
  | 'Herb'
  | 'Potion';

export interface Tile {
  type: TileType;
  explored: boolean;
  decoration?: string; // e.g. 'candelabra', 'skull', 'cobweb', 'chains'
}

export type FloorTheme = 'VampireCrypt' | 'GothicCathedral' | 'DragunMaw' | 'InnerSanctum';

export interface LevelData {
  grid: Tile[][];
  width: number;
  height: number;
  enemySpawns: { x: number; y: number; type: EnemyType }[];
  chestSpawns: { x: number; y: number }[];
  playerSpawn: { x: number; y: number };
  stairsSpawn: { x: number; y: number };
  bossSpawn?: { x: number; y: number };
  floorIndex: number;
  floorTheme: FloorTheme;
}

export interface GameSettings {
  masterVolume: number;
  difficulty: 'Casual' | 'Adventurer' | 'Nightmare';
  crtScanlines: boolean;
  pixelVignette: boolean;
  screenShake: 'None' | 'Low' | 'High';
  showOnScreenButtons: boolean;
}
