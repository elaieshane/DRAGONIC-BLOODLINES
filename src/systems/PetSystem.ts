import { Pet, PetSpecies, PetAIState, PetSkill, Rarity, Projectile, Particle } from '../types';

// ── PET CATALOGUE ─────────────────────────────────────────────────────────────

export interface PetBlueprint {
  species: PetSpecies;
  name: string;
  petClass: Pet['petClass'];
  evolutionNames: string[]; // [stage0, stage1, stage2]
  color: string;            // canvas draw color
  passiveSkill: PetSkill;
  activeSkill: PetSkill;
  ultimateSkill: PetSkill;
  baseHp: number;
  baseAttack: number;
  baseDefense: number;
  attackCooldown: number;   // frames between attacks
  projectileType: Projectile['type'];
  projectileColor: string;
  auraColor: string;
  personality: string;      // lore flavour text
  idleBehaviours: string[];
}

export const PET_BLUEPRINTS: Record<PetSpecies, PetBlueprint> = {
  Ash: {
    species: 'Ash',
    name: 'Ash',
    petClass: 'Dragon',
    evolutionNames: ['Ash', 'Young Flame Drake', 'Ancient Flame Dragon'],
    color: '#f97316',
    passiveSkill: {
      name: 'Ember Aura',
      description: '+5% Fire Damage to all your attacks',
      cooldown: 0,
      damage: 0,
    },
    activeSkill: {
      name: 'Fireball',
      description: 'Launches a homing fireball at the nearest enemy',
      cooldown: 90,
      damage: 35,
      aoeRadius: 24,
    },
    ultimateSkill: {
      name: 'Dragon Roar',
      description: 'Releases a cone of dragonfire, burning all nearby enemies',
      cooldown: 600,
      damage: 120,
      aoeRadius: 80,
    },
    baseHp: 120,
    baseAttack: 22,
    baseDefense: 8,
    attackCooldown: 80,
    projectileType: 'pet_fire',
    projectileColor: '#f97316',
    auraColor: 'rgba(249,115,22,0.25)',
    personality: 'Loyal and fierce. Sleeps near campfires. Growls before boss encounters.',
    idleBehaviours: ['Chases embers', 'Sneezes small fireballs', 'Nuzzles the player'],
  },
  Umbra: {
    species: 'Umbra',
    name: 'Umbra',
    petClass: 'Shadow',
    evolutionNames: ['Umbra', 'Shadowcat', 'Eclipse Panther'],
    color: '#6d28d9',
    passiveSkill: {
      name: 'Shadow Senses',
      description: '+12% Critical Hit Chance on all attacks',
      cooldown: 0,
    },
    activeSkill: {
      name: 'Shadow Dash',
      description: 'Teleports to an enemy and delivers a critical slash',
      cooldown: 120,
      damage: 55,
    },
    ultimateSkill: {
      name: 'Shadow Clones',
      description: 'Creates 3 shadow clones that attack simultaneously for 8 seconds',
      cooldown: 720,
      damage: 45,
    },
    baseHp: 90,
    baseAttack: 34,
    baseDefense: 5,
    attackCooldown: 60,
    projectileType: 'pet_shadow',
    projectileColor: '#7c3aed',
    auraColor: 'rgba(109,40,217,0.2)',
    personality: 'Silent and deadly. Vanishes when frightened. Reappears behind the player.',
    idleBehaviours: ['Vanishes briefly', 'Watches from the shadows', 'Swipes at particle effects'],
  },
  BoneHound: {
    species: 'BoneHound',
    name: 'Retch',
    petClass: 'Undead',
    evolutionNames: ['Bone Pup', 'Bone Hound', 'Hellhound Alpha'],
    color: '#d4d4d4',
    passiveSkill: {
      name: 'Death Bite',
      description: '+8% Lifesteal on all melee attacks',
      cooldown: 0,
    },
    activeSkill: {
      name: 'Bone Bite',
      description: 'Lunges and bites an enemy, stunning them briefly',
      cooldown: 100,
      damage: 42,
    },
    ultimateSkill: {
      name: 'Summon Skeleton Wolves',
      description: 'Howls to summon 2 skeleton wolves that fight for 12 seconds',
      cooldown: 800,
      damage: 30,
    },
    baseHp: 150,
    baseAttack: 28,
    baseDefense: 12,
    attackCooldown: 70,
    projectileType: 'pet_bone',
    projectileColor: '#e5e7eb',
    auraColor: 'rgba(212,212,212,0.15)',
    personality: 'Savage outside combat, gentle to the player. Digs up buried loot. Howls at blood moons.',
    idleBehaviours: ['Sniffs for secrets', 'Digs at certain floor tiles', 'Chews on bones'],
  },
  SeraphRaven: {
    species: 'SeraphRaven',
    name: 'Lyra',
    petClass: 'Holy',
    evolutionNames: ['Seraph Fledgling', 'Seraph Raven', 'Divine Raven'],
    color: '#fcd34d',
    passiveSkill: {
      name: 'Astral Attunement',
      description: '+2 Mana Regeneration per second',
      cooldown: 0,
    },
    activeSkill: {
      name: 'Holy Feather',
      description: 'Launches a holy feather that deals bonus damage to undead',
      cooldown: 85,
      damage: 30,
    },
    ultimateSkill: {
      name: 'Healing Circle',
      description: 'Creates a radiant circle under the player, restoring 40 HP over 6 seconds',
      cooldown: 660,
      healAmount: 40,
    },
    baseHp: 80,
    baseAttack: 20,
    baseDefense: 6,
    attackCooldown: 75,
    projectileType: 'pet_holy',
    projectileColor: '#fde68a',
    auraColor: 'rgba(252,211,77,0.2)',
    personality: 'Serene and watchful. Circles above the player in flight. Glows brighter near hidden bosses.',
    idleBehaviours: ['Soars in slow circles', 'Drops glowing feathers', 'Coos near safe rooms'],
  },
  IronBear: {
    species: 'IronBear',
    name: 'Grum',
    petClass: 'Beast',
    evolutionNames: ['Iron Cub', 'Iron Bear', 'Titanborn Behemoth'],
    color: '#92400e',
    passiveSkill: {
      name: 'Iron Hide',
      description: '+15 Defense (reduces all incoming damage)',
      cooldown: 0,
    },
    activeSkill: {
      name: 'Ground Slam',
      description: 'Slams the ground, dealing AoE damage and knocking back enemies',
      cooldown: 110,
      damage: 60,
      aoeRadius: 40,
    },
    ultimateSkill: {
      name: 'War Cry',
      description: 'Lets out a roar that taunts all nearby enemies, drawing fire from the player',
      cooldown: 700,
      damage: 0,
      aoeRadius: 100,
    },
    baseHp: 200,
    baseAttack: 32,
    baseDefense: 20,
    attackCooldown: 100,
    projectileType: 'pet_bone',
    projectileColor: '#b45309',
    auraColor: 'rgba(146,64,14,0.2)',
    personality: 'Protective and stubborn. Blocks doorways playfully. Always positions between player and enemies.',
    idleBehaviours: ['Sits down with a thud', 'Scratches post-battle', 'Nudges the player forward'],
  },
  VoidOwl: {
    species: 'VoidOwl',
    name: 'Kael',
    petClass: 'Arcane',
    evolutionNames: ['Void Owlet', 'Void Owl', 'Singularity Owl'],
    color: '#0ea5e9',
    passiveSkill: {
      name: 'Time Sense',
      description: '-15% cooldown on all player abilities',
      cooldown: 0,
    },
    activeSkill: {
      name: 'Void Beam',
      description: 'Fires a beam of void energy through multiple enemies in a line',
      cooldown: 95,
      damage: 48,
    },
    ultimateSkill: {
      name: 'Time Slow',
      description: 'Dilates time — all enemies move at 30% speed for 5 seconds',
      cooldown: 750,
      damage: 0,
    },
    baseHp: 85,
    baseAttack: 38,
    baseDefense: 4,
    attackCooldown: 90,
    projectileType: 'pet_void',
    projectileColor: '#38bdf8',
    auraColor: 'rgba(14,165,233,0.2)',
    personality: 'Ancient, cryptic. Warns of invisible enemies. Reveals hidden runes and passages.',
    idleBehaviours: ['Hovers perfectly still', 'Tilts head at walls', 'Eyes glow at secrets'],
  },
};

// ── PET FACTORY ────────────────────────────────────────────────────────────────

export class PetFactory {
  static createPet(species: PetSpecies, rarity: Rarity = 'Common', playerX = 100, playerY = 100): Pet {
    const bp = PET_BLUEPRINTS[species];
    const rarityMult = PetFactory.getRarityMultiplier(rarity);

    return {
      id: `pet_${species}_${Date.now()}`,
      species,
      name: bp.name,
      rarity,
      petClass: bp.petClass,
      evolutionStage: 0,
      level: 1,
      experience: 0,
      xpNeeded: 100,
      bond: 0,
      hp: Math.round(bp.baseHp * rarityMult),
      maxHp: Math.round(bp.baseHp * rarityMult),
      attack: Math.round(bp.baseAttack * rarityMult),
      defense: Math.round(bp.baseDefense * rarityMult),
      x: playerX - 32,
      y: playerY - 32,
      aiState: 'Follow',
      stateTimer: 0,
      lastAttackTime: 0,
      attackCooldown: bp.attackCooldown,
      targetId: null,
      retreatTimer: 0,
      mood: 'Happy',
      passiveSkill: { ...bp.passiveSkill },
      activeSkill: { ...bp.activeSkill },
      ultimateSkill: { ...bp.ultimateSkill },
      ultimateCooldown: 0,
      equipped: { Helmet: null, Collar: null, Claws: null, Rune: null, Accessory: null },
    };
  }

  static getRarityMultiplier(rarity: Rarity): number {
    switch (rarity) {
      case 'Common':    return 1.0;
      case 'Rare':      return 1.3;
      case 'Epic':      return 1.6;
      case 'Legendary': return 2.2;
      case 'Mythic':    return 3.0;
      case 'Ancient':   return 4.0;
      case 'Dragonborn':return 6.0;
      default:          return 1.0;
    }
  }
}

// ── PET SYSTEM (AI + Leveling + Bond) ─────────────────────────────────────────

interface PetSystemContext {
  enemies: Array<{ id: string; x: number; y: number; health: number; size: number; damage: number }>;
  playerX: number;
  playerY: number;
  playerHpRatio: number;   // player.health / player.maxHealth
  isWall: (tx: number, ty: number) => boolean;
  spawnProjectile: (proj: Omit<Projectile, 'id'>) => void;
  spawnParticle: (p: Omit<Particle, 'id'>) => void;
  spawnDamageNumber: (x: number, y: number, text: string, color: string) => void;
  healPlayer: (amount: number) => void;
  frame: number;
}

export class PetSystem {

  // Called every game frame — returns updated pet (immutability-style)
  static update(pet: Pet, ctx: PetSystemContext): Pet {
    const p = { ...pet };

    p.stateTimer++;
    if (p.ultimateCooldown > 0) p.ultimateCooldown--;

    // ── Find nearest enemy ──────────────────────────────────
    const DETECT_RANGE = 180;
    const ATTACK_RANGE = 48;
    const FOLLOW_DIST  = 36;
    const RETREAT_DIST = 20;

    const nearest = PetSystem.findNearest(p, ctx.enemies, DETECT_RANGE);

    // ── AI State Machine ────────────────────────────────────
    switch (p.aiState) {

      case 'Follow': {
        PetSystem.moveToward(p, ctx.playerX, ctx.playerY, 2.0, ctx.isWall);
        if (nearest) p.aiState = 'Search';
        // Idle personality emotes every ~5s
        if (p.stateTimer % 300 === 0) p.aiState = 'Idle';
        break;
      }

      case 'Idle': {
        if (p.stateTimer % 300 > 30) p.aiState = 'Follow'; // idle for 0.5s then resume
        if (nearest) p.aiState = 'Search';
        break;
      }

      case 'Search': {
        if (!nearest) { p.aiState = 'Follow'; break; }
        PetSystem.moveToward(p, nearest.x, nearest.y, 2.4, ctx.isWall);
        const dist = Math.hypot(p.x - nearest.x, p.y - nearest.y);
        if (dist < ATTACK_RANGE) { p.aiState = 'Attack'; p.stateTimer = 0; }
        break;
      }

      case 'Attack': {
        if (!nearest) { p.aiState = 'Follow'; break; }
        const dist = Math.hypot(p.x - nearest.x, p.y - nearest.y);
        if (dist > ATTACK_RANGE + 20) { p.aiState = 'Search'; break; }

        // Fire projectile if off cooldown
        if (ctx.frame - p.lastAttackTime > p.attackCooldown) {
          PetSystem.fireProjectile(p, nearest, ctx);
          p.lastAttackTime = ctx.frame;
          p.bond = Math.min(100, p.bond + 0.1);
        }

        // Low HP → retreat
        if (p.hp / p.maxHp < 0.25) { p.aiState = 'Retreat'; p.retreatTimer = 120; }

        // Protect player if they're in danger
        if (ctx.playerHpRatio < 0.3 && dist < ATTACK_RANGE) { p.aiState = 'Protect'; }
        break;
      }

      case 'Retreat': {
        // Run away from enemy toward player
        PetSystem.moveToward(p, ctx.playerX, ctx.playerY, 3.0, ctx.isWall);
        p.retreatTimer--;
        if (p.retreatTimer <= 0) {
          // Regenerate some HP
          p.hp = Math.min(p.maxHp, p.hp + Math.round(p.maxHp * 0.15));
          p.aiState = 'Follow';
        }
        break;
      }

      case 'Protect': {
        if (!nearest) { p.aiState = 'Follow'; break; }
        // Stand between player and enemy — stay close to player
        const mx = (ctx.playerX + nearest.x) / 2;
        const my = (ctx.playerY + nearest.y) / 2;
        PetSystem.moveToward(p, mx, my, 3.5, ctx.isWall);
        if (ctx.frame - p.lastAttackTime > Math.round(p.attackCooldown * 0.6)) {
          PetSystem.fireProjectile(p, nearest, ctx);
          p.lastAttackTime = ctx.frame;
          p.bond = Math.min(100, p.bond + 0.3);
        }
        if (ctx.playerHpRatio > 0.5) p.aiState = 'Attack';
        break;
      }

      case 'Special': {
        // Ultimate being executed — freeze pet in place for 60 frames
        if (p.stateTimer > 60) p.aiState = 'Follow';
        break;
      }
    }

    // ── Ultimate Skill Check ─────────────────────────────────────────────────
    if (p.ultimateCooldown === 0 && ctx.enemies.length > 2) {
      PetSystem.fireUltimate(p, ctx);
      p.ultimateCooldown = p.ultimateSkill.cooldown;
      p.aiState = 'Special';
      p.stateTimer = 0;
      p.bond = Math.min(100, p.bond + 1);
    }

    // ── Mood Logic ───────────────────────────────────────────────────────────
    if      (p.bond >= 90 && p.hp / p.maxHp > 0.8) p.mood = 'Bonded';
    else if (p.hp / p.maxHp < 0.3)                  p.mood = 'Exhausted';
    else if (ctx.enemies.length > 3)                 p.mood = 'Aggressive';
    else if (p.bond > 50)                            p.mood = 'Happy';
    else                                             p.mood = 'Calm';

    return p;
  }

  // ── LEVEL UP ──────────────────────────────────────────────────────────────
  static grantXP(pet: Pet, xp: number): { pet: Pet; leveledUp: boolean; evolved: boolean } {
    const p = { ...pet, experience: pet.experience + xp };
    let leveledUp = false;
    let evolved = false;

    while (p.experience >= p.xpNeeded) {
      p.experience -= p.xpNeeded;
      p.level++;
      p.xpNeeded = Math.round(p.xpNeeded * 1.18);

      // Scale stats on level up
      const bp = PET_BLUEPRINTS[p.species];
      p.maxHp   = Math.round(bp.baseHp * PetFactory.getRarityMultiplier(p.rarity) + p.level * 8);
      p.hp      = p.maxHp;
      p.attack  = Math.round(bp.baseAttack * PetFactory.getRarityMultiplier(p.rarity) + p.level * 3);
      p.defense = Math.round(bp.baseDefense * PetFactory.getRarityMultiplier(p.rarity) + p.level * 1.5);
      leveledUp = true;

      // Evolution thresholds: 10 → Stage 1, 25 → Stage 2
      if (p.level === 10 && p.evolutionStage < 1) { p.evolutionStage = 1; evolved = true; }
      if (p.level === 25 && p.evolutionStage < 2) { p.evolutionStage = 2; evolved = true; }
    }

    // Bond also increases slightly from battle XP
    p.bond = Math.min(100, p.bond + xp * 0.01);

    return { pet: p, leveledUp, evolved };
  }

  // ── PRIVATE HELPERS ───────────────────────────────────────────────────────

  private static moveToward(
    pet: Pet,
    tx: number,
    ty: number,
    speed: number,
    isWall: (x: number, y: number) => boolean
  ) {
    const dx = tx - pet.x;
    const dy = ty - pet.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 8) return;
    const nx = (dx / dist) * speed;
    const ny = (dy / dist) * speed;
    const newX = pet.x + nx;
    const newY = pet.y + ny;
    if (!isWall(Math.floor(newX / 32), Math.floor(newY / 32))) {
      pet.x = newX;
      pet.y = newY;
    }
  }

  private static findNearest(
    pet: Pet,
    enemies: PetSystemContext['enemies'],
    range: number
  ) {
    let best: PetSystemContext['enemies'][0] | null = null;
    let bestDist = range;
    for (const e of enemies) {
      if (e.health <= 0) continue;
      const d = Math.hypot(pet.x - e.x, pet.y - e.y);
      if (d < bestDist) { bestDist = d; best = e; }
    }
    return best;
  }

  private static fireProjectile(
    pet: Pet,
    target: PetSystemContext['enemies'][0],
    ctx: PetSystemContext
  ) {
    const bp = PET_BLUEPRINTS[pet.species];
    const dx = target.x - pet.x;
    const dy = target.y - pet.y;
    const dist = Math.hypot(dx, dy) || 1;
    const speed = 4.5;

    ctx.spawnProjectile({
      x: pet.x,
      y: pet.y,
      vx: (dx / dist) * speed,
      vy: (dy / dist) * speed,
      size: 8,
      damage: Math.round(pet.attack * 0.9),
      isPlayer: true,
      fromPet: true,
      color: bp.projectileColor,
      duration: 55,
      type: bp.projectileType,
    });

    // Aura particle burst
    for (let i = 0; i < 3; i++) {
      ctx.spawnParticle({
        x: pet.x + (Math.random() - 0.5) * 16,
        y: pet.y + (Math.random() - 0.5) * 16,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        color: bp.projectileColor,
        size: 3,
        duration: 25,
        maxDuration: 25,
        alpha: 0.7,
      });
    }
  }

  private static fireUltimate(pet: Pet, ctx: PetSystemContext) {
    const bp = PET_BLUEPRINTS[pet.species];
    ctx.spawnDamageNumber(pet.x, pet.y - 20, `✨ ${pet.ultimateSkill.name}!`, bp.projectileColor);

    // Species-specific ultimate effects
    switch (pet.species) {
      case 'Ash': {
        // 12-way fireball burst (Dragon Roar)
        for (let i = 0; i < 12; i++) {
          const angle = (i / 12) * Math.PI * 2;
          ctx.spawnProjectile({
            x: pet.x, y: pet.y,
            vx: Math.cos(angle) * 4, vy: Math.sin(angle) * 4,
            size: 12, damage: pet.ultimateSkill.damage || 80,
            isPlayer: true, fromPet: true,
            color: '#f97316', duration: 50, type: 'pet_fire',
          });
        }
        break;
      }
      case 'SeraphRaven': {
        // Healing circle for the player
        if (pet.ultimateSkill.healAmount) {
          ctx.healPlayer(pet.ultimateSkill.healAmount);
        }
        for (let i = 0; i < 16; i++) {
          const angle = (i / 16) * Math.PI * 2;
          ctx.spawnParticle({
            x: ctx.playerX + Math.cos(angle) * 30,
            y: ctx.playerY + Math.sin(angle) * 30,
            vx: Math.cos(angle) * 0.5, vy: Math.sin(angle) * 0.5,
            color: '#fcd34d', size: 5, duration: 60, maxDuration: 60, alpha: 0.9,
          });
        }
        break;
      }
      case 'VoidOwl': {
        // Void beam through all visible enemies
        for (const e of ctx.enemies) {
          if (Math.hypot(pet.x - e.x, pet.y - e.y) < 220) {
            const dx = e.x - pet.x;
            const dy = e.y - pet.y;
            const dist = Math.hypot(dx, dy) || 1;
            ctx.spawnProjectile({
              x: pet.x, y: pet.y,
              vx: (dx / dist) * 7, vy: (dy / dist) * 7,
              size: 14, damage: pet.ultimateSkill.damage || 60,
              isPlayer: true, fromPet: true,
              color: '#38bdf8', duration: 35, type: 'pet_void',
            });
          }
        }
        break;
      }
      default: {
        // Generic 6-way burst
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2;
          ctx.spawnProjectile({
            x: pet.x, y: pet.y,
            vx: Math.cos(angle) * 5, vy: Math.sin(angle) * 5,
            size: 10, damage: pet.ultimateSkill.damage || 50,
            isPlayer: true, fromPet: true,
            color: bp.projectileColor, duration: 45, type: bp.projectileType,
          });
        }
      }
    }
  }
}

// ── CREST CATALOGUE ───────────────────────────────────────────────────────────

export interface CrestEntry {
  name: string;
  effect: string;
  description: string;
  icon: string;
  passiveTrigger: 'fireDamage' | 'lifesteal' | 'holyBonus' | 'shadowClone' | 'phoenixRevive' | 'knockbackImmune' | 'voidSlow';
}

export const CRESTS: CrestEntry[] = [
  { name: 'Dragon Crest',  effect: 'fireDamage',      description: 'Fire attacks explode on impact, dealing 30% splash damage.', icon: '🔥', passiveTrigger: 'fireDamage' },
  { name: 'Vampire Crest', effect: 'lifesteal',       description: '+10% Lifesteal on all attacks.', icon: '🩸', passiveTrigger: 'lifesteal' },
  { name: 'Holy Crest',    effect: 'holyBonus',       description: 'Holy and light attacks deal +40% damage to undead enemies.', icon: '✨', passiveTrigger: 'holyBonus' },
  { name: 'Shadow Crest',  effect: 'shadowClone',     description: 'Perfect dodge creates a shadow illusion clone that confuses nearby enemies.', icon: '🌑', passiveTrigger: 'shadowClone' },
  { name: 'Phoenix Crest', effect: 'phoenixRevive',   description: 'Once per boss fight, revive with 50% HP on fatal damage.', icon: '🦅', passiveTrigger: 'phoenixRevive' },
  { name: 'Titan Crest',   effect: 'knockbackImmune', description: 'You are completely immune to knockback and stagger effects.', icon: '⚖️', passiveTrigger: 'knockbackImmune' },
  { name: 'Void Crest',    effect: 'voidSlow',        description: 'When HP drops below 15%, time slows for all enemies for 4 seconds.', icon: '🌀', passiveTrigger: 'voidSlow' },
];

// ── SCROLL CATALOGUE ──────────────────────────────────────────────────────────

export interface ScrollEntry {
  name: string;
  effect: string;
  description: string;
  icon: string;
  activeEffect: 'meteor' | 'blizzard' | 'timeslow' | 'dragonspirit' | 'bloodpact' | 'earthquake' | 'eclipse';
}

export const SCROLLS: ScrollEntry[] = [
  { name: 'Meteor Scroll',    effect: 'meteor',      description: 'Calls down 6 meteors across the room. Screen-shaking apocalyptic devastation.', icon: '☄️', activeEffect: 'meteor' },
  { name: 'Blizzard Scroll',  effect: 'blizzard',    description: 'Encases all visible enemies in ice for 5 seconds, leaving them vulnerable.', icon: '❄️', activeEffect: 'blizzard' },
  { name: 'Time Scroll',      effect: 'timeslow',    description: 'Stops time entirely for 3 seconds. Enemies freeze mid-action.', icon: '⏳', activeEffect: 'timeslow' },
  { name: 'Dragon Scroll',    effect: 'dragonspirit',description: 'Summons an ancient dragon spirit that sweeps through the room.', icon: '🐉', activeEffect: 'dragonspirit' },
  { name: 'Blood Scroll',     effect: 'bloodpact',   description: 'Doubles all damage for 10 seconds, but drains 5 HP per second.', icon: '💉', activeEffect: 'bloodpact' },
  { name: 'Earthquake Scroll',effect: 'earthquake',  description: 'Shatters walls, breaks obstacles, and stuns all enemies.', icon: '⚡', activeEffect: 'earthquake' },
  { name: 'Eclipse Scroll',   effect: 'eclipse',     description: 'Turns day into night. Vampire and undead enemies are weakened. Player gains +20% damage.', icon: '🌘', activeEffect: 'eclipse' },
];
