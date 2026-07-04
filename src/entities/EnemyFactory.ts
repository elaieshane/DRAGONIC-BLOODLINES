import { Enemy, EnemyType } from '../types';
import { getBestiaryEntry } from '../utils/bestiary_data';

export class EnemyFactory {
  static createEnemy(type: EnemyType, x: number, y: number, floorIndex: number, kingdomIndex: number, isBloodMoonVariant: boolean = false): Enemy {
    let maxHp = 30;
    let dmg = 8;
    let spd = 1.0;
    let name = type as string;
    let isBoss = false;
    let size = 12;
    let color = '#ef4444'; // default red

    // Base scaling based on kingdom and floor
    let scale = (kingdomIndex - 1) * 2 + floorIndex;
    if (floorIndex === 1) {
      scale *= 0.75; // keep first floor easier
    } else if (floorIndex === 2) {
      scale += 1; // give second floor a tougher step-up
    }

    if (isBloodMoonVariant) {
      scale += 10; // Blood Moon makes enemies significantly stronger
    }

    // Try to get base info from bestiary if not manually overridden below
    const bestiaryInfo = getBestiaryEntry(type);
    let faction = bestiaryInfo?.faction || 'Uncategorized';
    let evolutionTier = bestiaryInfo?.baseTier || 0;
    if (bestiaryInfo) {
      name = isBloodMoonVariant ? `Eldritch ${bestiaryInfo.name}` : bestiaryInfo.name;
    }

    switch (type) {
      // Basic enemies
      case 'Bat':
        maxHp = 15 + scale * 4;
        dmg = 5 + scale * 2;
        spd = 1.6;
        break;
      case 'Thrall':
        maxHp = 30 + scale * 6;
        dmg = 8 + scale * 3;
        spd = 1.0;
        break;
      case 'Skeleton':
        maxHp = 25 + scale * 5;
        dmg = 7 + scale * 2;
        spd = 0.8;
        break;
      case 'Zombie':
        maxHp = 36 + scale * 5;
        dmg = 8 + scale * 2;
        spd = 0.65;
        break;
      
      // Elite Subordinates (Mini-bosses or high tier)
      case 'CathedralTemplar':
        maxHp = 150 + scale * 10;
        dmg = 15 + scale * 3;
        spd = 0.9;
        size = 14;
        color = '#fbbf24';
        break;
      case 'PlagueGhoul':
        maxHp = 120 + scale * 10;
        dmg = 12 + scale * 4;
        spd = 1.3;
        color = '#22c55e';
        break;
      case 'Ghoul':
        maxHp = 35 + scale * 6;
        dmg = 9 + scale * 2;
        spd = 1.1;
        color = '#65a30d';
        break;
      case 'Werewolf':
        maxHp = 45 + scale * 7;
        dmg = 12 + scale * 3;
        spd = 1.4;
        color = '#4b5563';
        break;
      case 'Ghost':
        maxHp = 25 + scale * 4;
        dmg = 8 + scale * 2;
        spd = 0.9;
        color = '#93c5fd';
        break;
      case 'SnakeMonster':
        maxHp = 40 + scale * 5;
        dmg = 11 + scale * 3;
        spd = 1.5;
        name = 'Viperfiend';
        color = '#84cc16';
        break;
      case 'OxBeast':
        maxHp = 80 + scale * 8;
        dmg = 16 + scale * 4;
        spd = 0.7;
        name = 'Ironclad Ox Beast';
        color = '#78350f';
        break;
      case 'Succubus':
        maxHp = 50 + scale * 6;
        dmg = 14 + scale * 3;
        spd = 1.2;
        color = '#ec4899';
        break;
      case 'NightCreature':
        maxHp = 30 + scale * 5;
        dmg = 10 + scale * 2;
        spd = 1.4;
        name = 'Creature of the Night';
        color = '#111827';
        break;

      // Tier 2 Mini Bosses / Legacy Bosses
      case 'Frankenstein':
        maxHp = 800;
        dmg = 25;
        spd = 0.8;
        isBoss = true;
        size = 20;
        color = '#4d7c0f';
        break;
      case 'CrocodileKing':
        maxHp = 1000;
        dmg = 30;
        spd = 0.9;
        name = 'Sobek, The Crocodile King';
        isBoss = true;
        size = 22;
        color = '#047857';
        break;
      case 'CountDracula':
        maxHp = 2000;
        dmg = 40;
        spd = 1.5;
        name = 'Count Dracula';
        isBoss = true;
        size = 18;
        color = '#9f1239';
        break;
      case 'VampireLord':
        maxHp = 1200;
        dmg = 35;
        spd = 1.6;
        name = 'Vampire Lord';
        isBoss = true;
        size = 16;
        color = '#7f1d1d';
        break;
      case 'WerewolfKing':
        maxHp = 1500;
        dmg = 45;
        spd = 1.8;
        name = 'Lycan King';
        isBoss = true;
        size = 20;
        color = '#374151';
        break;
      case 'CthulhuSquid':
        maxHp = 2500;
        dmg = 50;
        spd = 0.6;
        name = 'Mind-Flayer Prime';
        isBoss = true;
        size = 28;
        color = '#0d9488';
        break;
      case 'BoneGiant':
        maxHp = 900 + scale * 80;
        dmg = 28 + scale * 4;
        spd = 0.65;
        name = 'Ossuary Bone Giant';
        isBoss = true;
        size = 26;
        color = '#e5e7eb';
        break;
      case 'DragonKnight':
        maxHp = 1200 + scale * 95;
        dmg = 34 + scale * 5;
        spd = 1.15;
        name = 'Draconic Knight-Captain';
        isBoss = true;
        size = 24;
        color = '#dc2626';
        break;

      // Kingdom Bosses (Tier 3)
      case 'HollowArchbishop':
        maxHp = 1500;
        dmg = 35;
        spd = 1.2;
        isBoss = true;
        size = 24;
        color = '#fef08a';
        break;
      case 'WitchQueen':
        maxHp = 2200;
        dmg = 45;
        spd = 1.4;
        isBoss = true;
        size = 22;
        color = '#4ade80';
        break;
      case 'BlackKnight':
        maxHp = 3500;
        dmg = 55;
        spd = 1.0;
        isBoss = true;
        size = 24;
        color = '#1f2937';
        break;
      case 'NecromancerKing':
        maxHp = 2800;
        dmg = 60;
        spd = 1.1;
        isBoss = true;
        size = 20;
        color = '#9333ea';
        break;
      case 'EmperorCaelus':
        maxHp = 8000;
        dmg = 90;
        spd = 1.8;
        isBoss = true;
        size = 26;
        color = '#b91c1c';
        break;
      default:
        // Use bestiary base tier for automatic scaling of new enemies
        maxHp = 50 + scale * 5 * (evolutionTier || 1);
        dmg = 10 + scale * 2 * (evolutionTier || 1);
        spd = 1.0;
        if (bestiaryInfo?.faction === 'Dragons') color = '#ef4444';
        else if (bestiaryInfo?.faction === 'Necromancy') color = '#9333ea';
        else if (bestiaryInfo?.faction === 'ForestSpirits') color = '#22c55e';
        else if (bestiaryInfo?.faction === 'Abyssal') color = '#111827';
        else if (bestiaryInfo?.faction === 'Eldritch') color = '#f43f5e';
        else if (bestiaryInfo?.faction === 'Elves') color = '#34d399';
        else if (bestiaryInfo?.faction === 'Orcs') color = '#65a30d';
        if (evolutionTier >= 4) {
          isBoss = true;
          size = 20 + evolutionTier;
        }
        break;
    }

    if (isBloodMoonVariant) {
      maxHp = Math.floor(maxHp * 1.5);
      dmg = Math.floor(dmg * 1.5);
      spd *= 1.2;
    }

    return {
      id: `${type}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      type,
      name,
      faction,
      evolutionTier,
      isBloodMoonVariant,
      x: x * 32 + 16, // Assuming TILE_SIZE is 32
      y: y * 32 + 16,
      size,
      health: maxHp,
      maxHealth: maxHp,
      damage: dmg,
      speed: spd,
      xpReward: isBoss ? maxHp : Math.floor(maxHp / 2),
      isBoss,
      state: 'idle',
      stateTimer: 0,
      lastAttackTime: 0,
      attackCooldown: isBoss ? 60 : 120, // Frames
      currentPhase: 1,
      color,
    };
  }
}
