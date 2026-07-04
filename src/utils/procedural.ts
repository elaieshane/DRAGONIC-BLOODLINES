import { LevelData, Tile, TileType, EnemyType, FloorTheme } from '../types';
import { BESTIARY_DATABASE } from './bestiary_data';

// Initialize cache for fast lookups
if (!(globalThis as any).BESTIARY_CACHE) {
  const cache: Record<string, any[]> = {};
  BESTIARY_DATABASE.forEach(e => {
    if (!cache[e.faction]) cache[e.faction] = [];
    cache[e.faction].push(e);
  });
  (globalThis as any).BESTIARY_CACHE = cache;
}

interface Room {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function generateLevel(kingdomIndex: number, floorIndex: number, theme: FloorTheme): LevelData {
  // Floor 5 of any kingdom is the major boss floor
  const isBossFloor = floorIndex === 5;
  const isMiniBossFloor = floorIndex === 4;

  // Scale map width and height based on the floor
  const width = isBossFloor ? 40 : 54;
  const height = isBossFloor ? 40 : 54;

  let floorTheme: FloorTheme = theme;
  
  // 5% chance for a Blood Moon Event on normal floors
  const isBloodMoon = !isBossFloor && Math.random() < 0.05;

  // Initialize empty grid with Walls
  const grid: Tile[][] = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => ({
      type: 'Wall',
      explored: false,
    }))
  );

  const enemySpawns: { x: number; y: number; type: EnemyType }[] = [];
  const chestSpawns: { x: number; y: number }[] = [];
  let playerSpawn = { x: Math.floor(width / 2), y: Math.floor(height / 2) };
  let stairsSpawn = { x: Math.floor(width / 2), y: Math.floor(height / 2) };
  let bossSpawn: { x: number; y: number } | undefined = undefined;

  // SPECIAL CASE: Inner Sanctum / Boss Arena (Floor 4 or Floor 2)
  if (isBossFloor) {
    // Large centered arena
    const arenaW = 18;
    const arenaH = 18;
    const startX = Math.floor((width - arenaW) / 2);
    const startY = Math.floor((height - arenaH) / 2);

    // Carve out Arena
    for (let y = startY; y < startY + arenaH; y++) {
      for (let x = startX; x < startX + arenaW; x++) {
        // Leave outer walls
        if (y === startY || y === startY + arenaH - 1 || x === startX || x === startX + arenaW - 1) {
          grid[y][x].type = 'Wall';
        } else {
          grid[y][x].type = 'Floor';

          // Decorative layouts
          if (floorTheme === 'EternalThrone') {
            // Molten Dragun aesthetics: add some inner lava corners
            if (
              (y === startY + 2 && (x === startX + 2 || x === startX + 3 || x === startX + arenaW - 3 || x === startX + arenaW - 4)) ||
              (y === startY + 3 && (x === startX + 2 || x === startX + arenaW - 3))
            ) {
              grid[y][x].type = 'Lava';
            }
          } else {
            // Gothic Cathedral aesthetics: blood pools
            if (
              (y === startY + 2 && (x === startX + 2 || x === startX + 3 || x === startX + arenaW - 3 || x === startX + arenaW - 4)) ||
              (y === startY + 3 && (x === startX + 2 || x === startX + arenaW - 3))
            ) {
              grid[y][x].type = 'BloodPool';
            }
          }
        }
      }
    }

    // Place decorative pillars
    const pillars = [
      { x: startX + 5, y: startY + 5 },
      { x: startX + arenaW - 6, y: startY + 5 },
      { x: startX + 5, y: startY + arenaH - 6 },
      { x: startX + arenaW - 6, y: startY + arenaH - 6 },
    ];
    pillars.forEach(p => {
      grid[p.y][p.x].type = 'Wall';
      grid[p.y][p.x].decoration = 'pillar';
    });

    // Player spawn near bottom center
    playerSpawn = { x: startX + Math.floor(arenaW / 2), y: startY + arenaH - 3 };

    // Boss spawn right in center
    bossSpawn = { x: startX + Math.floor(arenaW / 2), y: startY + 6 };
    let bossType: EnemyType = 'HollowArchbishop';
    
    if (kingdomIndex === 1) bossType = 'HollowArchbishop';
    else if (kingdomIndex === 2) bossType = 'WitchQueen';
    else if (kingdomIndex === 3) bossType = 'BlackKnight';
    else if (kingdomIndex === 4) bossType = 'NecromancerKing';
    else if (kingdomIndex === 5) bossType = 'EmperorCaelus';

    enemySpawns.push({ x: bossSpawn.x, y: bossSpawn.y, type: bossType });

    // Stairs Spawn behind boss (initially hidden or locked, we place it in the top corner)
    stairsSpawn = { x: startX + Math.floor(arenaW / 2), y: startY + 2 };
    // We also put a chest left and right of the boss arena
    chestSpawns.push({ x: startX + 3, y: startY + 3 });
    chestSpawns.push({ x: startX + arenaW - 4, y: startY + 3 });

  } else {
    // REGULAR EXPLORABLE PROCEDURAL DUNGEON
    const isSafeFloor = floorIndex === 3;
    const rooms: Room[] = [];
    const minRoomSize = 5;
    const maxRoomSize = isSafeFloor ? 11 : 9;
    const targetRoomCount = floorIndex === 1 ? 10 : isSafeFloor ? 8 : 14;

    // Generate non-overlapping rooms
    let attempts = 0;
    while (rooms.length < targetRoomCount && attempts < 150) {
      attempts++;
      const rw = Math.floor(Math.random() * (maxRoomSize - minRoomSize + 1)) + minRoomSize;
      const rh = Math.floor(Math.random() * (maxRoomSize - minRoomSize + 1)) + minRoomSize;
      const rx = Math.floor(Math.random() * (width - rw - 4)) + 2;
      const ry = Math.floor(Math.random() * (height - rh - 4)) + 2;

      // Check overlap
      let overlap = false;
      for (const r of rooms) {
        if (
          rx < r.x + r.w + 2 &&
          rx + rw + 2 > r.x &&
          ry < r.y + r.h + 2 &&
          ry + rh + 2 > r.y
        ) {
          overlap = true;
          break;
        }
      }

      if (!overlap) {
        rooms.push({ x: rx, y: ry, w: rw, h: rh });
      }
    }

    // Carve rooms
    rooms.forEach((r, idx) => {
      for (let y = r.y; y < r.y + r.h; y++) {
        for (let x = r.x; x < r.x + r.w; x++) {
          grid[y][x].type = 'Floor';

          // Add random environmental hazards based on theme
          if (idx !== 0) {
            const hazardChance = Math.random();
            if (hazardChance < 0.04) {
              if (['DragonNest', 'VolcanicWastes', 'EternalThrone'].includes(floorTheme)) {
                grid[y][x].type = 'Lava';
              } else {
                grid[y][x].type = 'BloodPool';
              }
            }
          }
        }
      }
    });

    // Connect rooms sequentially to guarantee a path
    for (let i = 0; i < rooms.length - 1; i++) {
      const r1 = rooms[i];
      const r2 = rooms[i + 1];

      // Draw horizontal corridor then vertical
      const x1 = Math.floor(r1.x + r1.w / 2);
      const y1 = Math.floor(r1.y + r1.h / 2);
      const x2 = Math.floor(r2.x + r2.w / 2);
      const y2 = Math.floor(r2.y + r2.h / 2);

      // Carve corridor X
      const minX = Math.min(x1, x2);
      const maxX = Math.max(x1, x2);
      for (let cx = minX; cx <= maxX; cx++) {
        grid[y1][cx].type = 'Floor';
      }

      // Carve corridor Y
      const minY = Math.min(y1, y2);
      const maxY = Math.max(y1, y2);
      for (let cy = minY; cy <= maxY; cy++) {
        grid[cy][x2].type = 'Floor';
      }
    }

    // Place Doors where corridors enter rooms
    // We can detect a doorway as a Floor tile that has Walls on left/right and Floors on top/bottom (or vice versa)
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        if (grid[y][x].type === 'Floor') {
          const left = grid[y][x - 1].type === 'Wall';
          const right = grid[y][x + 1].type === 'Wall';
          const top = grid[y - 1][x].type === 'Wall';
          const bottom = grid[y + 1][x].type === 'Wall';

          if ((left && right && !top && !bottom) || (!left && !right && top && bottom)) {
            // Only place doors with 25% chance to avoid too many doors
            if (Math.random() < 0.35) {
              grid[y][x].type = 'Door';
            }
          }
        }
      }
    }

    // Assign Player Spawn: Center of Room 0
    playerSpawn = {
      x: Math.floor(rooms[0].x + rooms[0].w / 2),
      y: Math.floor(rooms[0].y + rooms[0].h / 2),
    };

    // Assign Stairs Spawn: Center of Last Room
    const lastRoom = rooms[rooms.length - 1];
    stairsSpawn = {
      x: Math.floor(lastRoom.x + lastRoom.w / 2),
      y: Math.floor(lastRoom.y + lastRoom.h / 2),
    };
    grid[stairsSpawn.y][stairsSpawn.x].type = 'Stairs';

    // Spawn Explorable Floor Bosses next to the Stairs (Mini-bosses on floor 4)
    if (floorIndex === 4) {
      // Pull mini boss from GameManager logic
      let miniBoss: EnemyType = 'CathedralTemplar';
      if (kingdomIndex === 1) miniBoss = 'CathedralTemplar';
      else if (kingdomIndex === 2) miniBoss = 'CrocodileKing';
      else if (kingdomIndex === 3) miniBoss = 'Frankenstein';
      else if (kingdomIndex === 4) miniBoss = 'BoneGiant';
      else if (kingdomIndex === 5) miniBoss = 'DragonKnight';
      enemySpawns.push({ x: stairsSpawn.x, y: stairsSpawn.y - 1, type: miniBoss });
      // Add 4 elite subordinates around mini boss
      const eliteType: EnemyType = kingdomIndex === 1 ? 'FallenChoirSister'
        : kingdomIndex === 2 ? 'PlagueGhoul'
        : kingdomIndex === 3 ? 'LivingArmor'
        : kingdomIndex === 4 ? 'DeathPriest'
        : 'FireDrake';
      for (let i = 0; i < 4; i++) {
        enemySpawns.push({
          x: stairsSpawn.x + (i % 2 === 0 ? -3 : 3),
          y: stairsSpawn.y + (i < 2 ? -3 : 3),
          type: eliteType
        });
      }
    }

    // Place Cyril the Arch-Mage NPC in Room 1 center
    if (rooms.length > 1) {
      const room1 = rooms[1];
      const npcX = Math.floor(room1.x + room1.w / 2);
      const npcY = Math.floor(room1.y + room1.h / 2);
      grid[npcY][npcX].type = 'NPC';
    }

    // Populate regular rooms
    rooms.forEach((r, idx) => {
      // Room 0: player start — chest only, no enemies
      if (idx === 0) {
        chestSpawns.push({ x: r.x + 1, y: r.y + 1 });
        return;
      }

      // Safe Floor (Floor 3): no enemies, generous loot
      if (isSafeFloor) {
        // Multiple chests and pickups for recovery
        if (Math.random() < 0.8) chestSpawns.push({ x: r.x + Math.floor(r.w / 2), y: r.y + Math.floor(r.h / 2) });
        const hx = r.x + Math.floor(Math.random() * (r.w - 2)) + 1;
        const hy = r.y + Math.floor(Math.random() * (r.h - 2)) + 1;
        if (grid[hy][hx].type === 'Floor') grid[hy][hx].type = 'Herb';
        const px = r.x + Math.floor(Math.random() * (r.w - 2)) + 1;
        const py = r.y + Math.floor(Math.random() * (r.h - 2)) + 1;
        if (grid[py][px].type === 'Floor') grid[py][px].type = 'Potion';
        return;
      }

      // Place Chests
      if (Math.random() < 0.45) {
        chestSpawns.push({
          x: r.x + Math.floor(Math.random() * (r.w - 2)) + 1,
          y: r.y + Math.floor(Math.random() * (r.h - 2)) + 1,
        });
      }

      // Place Herbs
      if (Math.random() < 0.45) {
        const hx = r.x + Math.floor(Math.random() * (r.w - 2)) + 1;
        const hy = r.y + Math.floor(Math.random() * (r.h - 2)) + 1;
        if (grid[hy][hx].type === 'Floor') grid[hy][hx].type = 'Herb';
      }

      // Place Potions
      if (Math.random() < 0.35) {
        const px = r.x + Math.floor(Math.random() * (r.w - 2)) + 1;
        const py = r.y + Math.floor(Math.random() * (r.h - 2)) + 1;
        if (grid[py][px].type === 'Floor') grid[py][px].type = 'Potion';
      }

      // Spawn Enemies based on room area
      const roomArea = r.w * r.h;
      let enemyCount = Math.floor(roomArea / 14) + 1; // slightly fewer on early floors
      if (floorIndex === 2) {
        enemyCount = Math.floor(roomArea / 12) + 1; // more enemies on level 2
      }

      for (let e = 0; e < enemyCount; e++) {
        const ex = r.x + Math.floor(Math.random() * r.w);
        const ey = r.y + Math.floor(Math.random() * r.h);

        // Don't spawn on top of chests, stairs, doors or pickups
        if (grid[ey][ex].type === 'Floor') {
          // Determine possible factions for this theme
          let factions: string[] = ['Uncategorized'];
          
          switch (floorTheme) {
            case 'ForsakenCathedral':
            case 'EternalThrone':
              factions = ['Celestials', 'Gargoyles', 'Demons'];
              break;
            case 'CrimsonGraveyard':
            case 'NecromancerTower':
              factions = ['Necromancy', 'Vampires'];
              break;
            case 'GhoulSwamp':
            case 'CrocodileSewers':
              factions = ['SeaCreatures', 'Necromancy'];
              break;
            case 'BlackKnightFortress':
            case 'AbandonedMines':
              factions = ['Titans', 'Mythological', 'Orcs'];
              break;
            case 'FrankensteinLab':
            case 'ForgottenLibrary':
              factions = ['CursedExperiments', 'Abyssal'];
              break;
            case 'RoyalVampirePalace':
            case 'HauntedVillage':
              factions = ['Vampires', 'Necromancy'];
              break;
            case 'BloodForest':
            case 'FrozenMountain':
              factions = ['Lycans', 'ForestSpirits', 'Elves'];
              break;
            case 'DragonNest':
            case 'VolcanicWastes':
              factions = ['Dragons', 'Demons'];
              break;
            default:
              factions = ['Necromancy', 'Uncategorized'];
              break;
          }

          // If Blood Moon, skew heavily to Eldritch, Abyssal, and Mythological
          if (isBloodMoon) {
            if (Math.random() < 0.6) {
              factions = ['Eldritch', 'Abyssal', 'Mythological'];
            }
          }

          // Pick a random faction from the allowed pool
          const selectedFaction = factions[Math.floor(Math.random() * factions.length)];
          const possibleEnemies = (window as any).BESTIARY_CACHE ? (window as any).BESTIARY_CACHE[selectedFaction] : null;

          let type: EnemyType = 'Bat';
          if (possibleEnemies && possibleEnemies.length > 0) {
            // Pick a random enemy from this faction
            const randEnemy = possibleEnemies[Math.floor(Math.random() * possibleEnemies.length)];

            if (floorIndex === 1) {
              const lowest = possibleEnemies.find((e: any) => e.baseTier <= 1);
              type = lowest ? lowest.id : 'Bat';
            } else if (floorIndex === 2) {
              if (randEnemy.baseTier <= 2 || (isBloodMoon && Math.random() < 0.4)) {
                type = randEnemy.id;
              } else {
                const fallback = possibleEnemies.filter((e: any) => e.baseTier <= 2);
                type = fallback.length ? fallback[Math.floor(Math.random() * fallback.length)].id : 'Bat';
              }
            } else {
              // Lower chance to spawn high-tier enemies unless deep in the dungeon or Blood Moon
              if (randEnemy.baseTier < 4 || (isBloodMoon && Math.random() < 0.3) || floorIndex >= 4) {
                type = randEnemy.id;
              } else {
                // Fallback to lowest tier if rolled a boss on floor 1/2
                const lowest = possibleEnemies.find((e: any) => e.baseTier <= 1);
                type = lowest ? lowest.id : 'Bat';
              }
            }
          } else {
            // Fallback for edge cases or before cache initializes
            type = 'Bat';
          }

          enemySpawns.push({ x: ex, y: ey, type });
        }
      }
    });
  }

  // Double check player spawn tile is Floor
  grid[playerSpawn.y][playerSpawn.x].type = 'Floor';
  grid[playerSpawn.y][playerSpawn.x].explored = true;

  // Reveal some of the starting area around the player to avoid a black initial viewport
  for (let dy = -7; dy <= 7; dy++) {
    for (let dx = -7; dx <= 7; dx++) {
      const rx = playerSpawn.x + dx;
      const ry = playerSpawn.y + dy;
      if (rx >= 0 && rx < width && ry >= 0 && ry < height) {
        grid[ry][rx].explored = true;
      }
    }
  }

  // Apply some decoration accents to random walls
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      if (grid[y][x].type === 'Wall' && grid[y + 1][x].type === 'Floor') {
        const decRand = Math.random();
        if (decRand < 0.1) {
          if (floorTheme === 'HauntedVillage' || floorTheme === 'RoyalVampirePalace') {
            grid[y][x].decoration = Math.random() < 0.5 ? 'chains' : 'cobweb';
          } else if (floorTheme === 'ForsakenCathedral' || floorTheme === 'CrimsonGraveyard') {
            grid[y][x].decoration = Math.random() < 0.5 ? 'candelabra' : 'stained_glass';
          } else {
            grid[y][x].decoration = Math.random() < 0.5 ? 'skull' : 'magma_torch';
          }
        }
      }
    }
  }

  return {
    grid,
    width,
    height,
    enemySpawns,
    chestSpawns,
    playerSpawn,
    stairsSpawn,
    bossSpawn,
    kingdomIndex,
    floorIndex,
    floorTheme,
    isBloodMoon,
  };
}

// Generate an epic retro-loot list
export const ITEMS_POOL = {
  Weapon: [
    { name: 'Vampire Slayer Whip', desc: 'An ancient spiked chain whip that glows with holy silver light.', stats: { damage: 15, agility: 2 }, icon: 'whip' },
    { name: 'Renegade Rapier', desc: 'A swift thin steel blade that deals quick, accurate strikes.', stats: { damage: 10, agility: 5 }, icon: 'rapier' },
    { name: 'Crimson Scythe', desc: 'A giant blood-stained scythe that steals the vitality of your enemies.', stats: { damage: 18, lifesteal: 0.10, strength: 3 }, icon: 'scythe' },
    { name: 'Draconic Greatsword', desc: 'A massive heavy blade forged from molten dragun scales.', stats: { damage: 24, strength: 6, defense: 2 }, icon: 'greatsword' },
    { name: 'Hellfire Scepter', desc: 'A glowing wand of ruby that unleashes continuous flame bursts.', stats: { damage: 8, arcane: 6, manaRegen: 1.5 }, icon: 'wand' },
    { name: 'Bloodseeker Dagger', desc: 'A serrated dagger that thrives on the wounds of your targets.', stats: { damage: 12, agility: 4, lifesteal: 0.05 }, icon: 'dagger' },
    { name: 'Obsidian Halberd', desc: 'A long black polearm inscribed with ancient blood runes.', stats: { damage: 22, strength: 8, vitality: 10 }, icon: 'halberd' },
    { name: 'Wraithbane Crossbow', desc: 'Silver-tipped bolts that pierce through ethereal enemies.', stats: { damage: 16, agility: 6, arcane: 2 }, icon: 'crossbow' },
  ],
  Armor: [
    { name: 'Vampire Hunter Garb', desc: 'Leather vestments stitched with secret protective silver weaves.', stats: { defense: 4, agility: 2, vitality: 15 }, icon: 'hunter_garb' },
    { name: 'Gothic Obsidian Plate', desc: 'Heavy high-gothic dark steel armor reflecting no light.', stats: { defense: 8, strength: 3, vitality: 30 }, icon: 'plate' },
    { name: 'Batwing Cloak', desc: 'A silk tattered cape that wraps you in a cloud of shadow step speed.', stats: { defense: 2, agility: 6, vitality: 10 }, icon: 'cloak' },
    { name: 'Dragonscale Mail', desc: 'Sturdy plated mail that completely deflects heat waves.', stats: { defense: 6, strength: 2, arcane: 2, vitality: 20 }, icon: 'mail' },
    { name: 'Necromancer Robes', desc: 'Tattered ancient robes that channel arcane death energies.', stats: { defense: 3, arcane: 8, manaRegen: 1.5, vitality: 5 }, icon: 'robes' },
    { name: 'Knight of the Abyss Plate', desc: 'Cursed heavy armor once worn by a condemned guardian.', stats: { defense: 12, strength: 5, vitality: 40 }, icon: 'abyss_plate' },
  ],
  Ring: [
    { name: 'Ruby Skull Ring', desc: 'Slightly warm to the touch. Increases your physical power.', stats: { strength: 4 }, icon: 'ruby_ring' },
    { name: 'Vampiric Seal', desc: 'Draws tiny bits of life essence out of thin air.', stats: { lifesteal: 0.04, agility: 2 }, icon: 'blood_ring' },
    { name: 'Dragon Eye Ring', desc: 'Imbued with the inner spark of a dragun hatchling.', stats: { arcane: 4 }, icon: 'dragon_ring' },
    { name: 'Grave Ring of Vitality', desc: 'A dusty bone band that pumps warm blood into your veins.', stats: { vitality: 25 }, icon: 'bone_ring' },
    { name: 'Shadowstep Band', desc: 'Lets you bend the shadows when you move.', stats: { agility: 6, critChance: 0.05 }, icon: 'shadow_ring' },
  ],
  Relic: [
    { name: 'Blood Chalice', desc: 'A sacred cup filled with crimson liquid. Enhances mana flows.', stats: { manaRegen: 2.0, arcane: 3 }, icon: 'chalice' },
    { name: 'Ancient Drake Tooth', desc: 'Radiates intense heat. Increases all physical swings.', stats: { strength: 5 }, icon: 'tooth' },
    { name: 'Gargoyle Core', desc: 'Made of petrified gargoyle stone. Drastically increases block.', stats: { defense: 5, vitality: 15 }, icon: 'core' },
    { name: 'Vampire Lord Crest', desc: 'A noble vampire medallion that reduces all cooldowns.', stats: { agility: 4, manaRegen: 1.0 }, icon: 'crest' },
  ],
  Crest: [
    { name: 'Dragon Crest',  desc: 'Fire attacks explode on impact, dealing 30% splash damage.',   stats: { fireDamage: 8, strength: 4 },   icon: '🔥', crestEffect: 'fireDamage' },
    { name: 'Vampire Crest', desc: '+10% Lifesteal on all attacks.',                               stats: { lifesteal: 0.10, agility: 3 },  icon: '🩸', crestEffect: 'lifesteal' },
    { name: 'Holy Crest',    desc: 'Holy attacks deal +40% damage to undead.',                     stats: { arcane: 6, manaRegen: 1.0 },    icon: '✨', crestEffect: 'holyBonus' },
    { name: 'Shadow Crest',  desc: 'Perfect dodge creates shadow illusion clones.',                stats: { agility: 8, critChance: 0.08 }, icon: '🌑', crestEffect: 'shadowClone' },
    { name: 'Phoenix Crest', desc: 'Revive once per boss fight with 50% HP.',                      stats: { vitality: 20, defense: 4 },     icon: '🦅', crestEffect: 'phoenixRevive' },
    { name: 'Titan Crest',   desc: 'Immune to knockback and stagger effects.',                     stats: { defense: 10, vitality: 30 },    icon: '⚖️', crestEffect: 'knockbackImmune' },
    { name: 'Void Crest',    desc: 'Time slows when HP falls below 15%.',                          stats: { arcane: 5, manaRegen: 2.0 },    icon: '🌀', crestEffect: 'voidSlow' },
  ],
  Scroll: [
    { name: 'Meteor Scroll',     desc: 'Calls down 6 meteors across the room.',          stats: { damage: 5 },           icon: '☄️', scrollEffect: 'meteor' },
    { name: 'Blizzard Scroll',   desc: 'Freezes all visible enemies for 5 seconds.',    stats: { arcane: 3 },           icon: '❄️', scrollEffect: 'blizzard' },
    { name: 'Time Scroll',       desc: 'Stops time entirely for 3 seconds.',             stats: { agility: 4 },          icon: '⏳', scrollEffect: 'timeslow' },
    { name: 'Dragon Scroll',     desc: 'Summons an ancient dragon spirit.',              stats: { fireDamage: 12 },      icon: '🐉', scrollEffect: 'dragonspirit' },
    { name: 'Blood Scroll',      desc: 'Doubles damage but drains 5 HP per second.',    stats: { damage: 10, lifesteal: 0.15 }, icon: '💉', scrollEffect: 'bloodpact' },
    { name: 'Earthquake Scroll', desc: 'Shatters walls and stuns all enemies.',          stats: { strength: 5 },         icon: '⚡', scrollEffect: 'earthquake' },
    { name: 'Eclipse Scroll',    desc: 'Night mode: buffs undead player, debuffs holy.', stats: { damage: 8, arcane: 4 }, icon: '🌘', scrollEffect: 'eclipse' },
  ],
  PetEgg: [
    { species: 'Ash',         name: 'Flame Dragon Egg',    desc: 'A warm orange egg that trembles when you hold it. Smells of ash and ember.', stats: {} },
    { species: 'Umbra',       name: 'Shadow Egg',          desc: 'A pitch-black egg that seems to absorb all nearby light.', stats: {} },
    { species: 'BoneHound',   name: 'Bone Hound Egg',      desc: 'A cracked ivory egg assembled from bone shards. Something scratches inside.', stats: {} },
    { species: 'SeraphRaven', name: 'Seraph Egg',          desc: 'A golden egg wrapped in soft downy feathers that glow faintly.', stats: {} },
    { species: 'IronBear',    name: 'Iron Bear Egg',       desc: 'An impossibly heavy bronze egg engraved with bear paw runes.', stats: {} },
    { species: 'VoidOwl',     name: 'Void Owl Egg',        desc: 'A translucent crystalline egg with a faint galaxy swirling inside.', stats: {} },
  ],
};

// Generate randomized items with expanded type support
export function generateRandomItem(
  type: 'Weapon' | 'Armor' | 'Ring' | 'Relic' | 'Crest' | 'Scroll' | 'PetEgg',
  floor: number
): any {
  const pool = (ITEMS_POOL as any)[type] as any[];
  const template = pool[Math.floor(Math.random() * pool.length)];

  // Rarity determination — higher floors, higher rarity chance
  const rand = Math.random();
  let rarity: string = 'Common';
  let multiplier = 1.0;

  if (rand < 0.01 + floor * 0.004) {
    rarity = 'Mythic';      multiplier = 3.0;
  } else if (rand < 0.03 + floor * 0.008) {
    rarity = 'Ancient';     multiplier = 2.5;
  } else if (rand < 0.08 + floor * 0.02) {
    rarity = 'Legendary';   multiplier = 2.2;
  } else if (rand < 0.18 + floor * 0.04) {
    rarity = 'Epic';        multiplier = 1.6;
  } else if (rand < 0.42 + floor * 0.06) {
    rarity = 'Rare';        multiplier = 1.3;
  }

  // PetEgg is special — no stat scaling, just rarity wrapper
  if (type === 'PetEgg') {
    return {
      id: `PetEgg_${template.species}_${Date.now()}`,
      name: `${rarity !== 'Common' ? rarity + ' ' : ''}${template.name}`,
      type: 'PetEgg',
      rarity,
      description: template.desc,
      stats: {},
      icon: '🥚',
      petSpecies: template.species,
    };
  }

  // Scale template stats with multiplier and floor depth
  const finalStats: any = {};
  for (const [key, val] of Object.entries(template.stats)) {
    const statVal = val as number;
    if (key === 'vitality') {
      finalStats[key] = Math.round(statVal * multiplier + floor * 4);
    } else if (key === 'damage' || key === 'fireDamage') {
      finalStats[key] = Math.round(statVal * multiplier + floor * 3);
    } else if (key === 'lifesteal' || key === 'manaRegen' || key === 'critChance') {
      finalStats[key] = parseFloat((statVal * multiplier).toFixed(3));
    } else {
      finalStats[key] = Math.round(statVal * multiplier + Math.floor(floor / 2));
    }
  }

  const rarityPrefix = rarity !== 'Common' ? `${rarity} ` : '';
  return {
    id: `${type}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    name: `${rarityPrefix}${template.name}`,
    type,
    rarity,
    description: template.desc,
    stats: finalStats,
    icon: template.icon,
    crestEffect: template.crestEffect,
    scrollEffect: template.scrollEffect,
  };
}

// Boss drops — always meaningful loot
export function generateBossDrop(kingdomIndex: number, floorIndex: number): any[] {
  const items: any[] = [];
  const floor = (kingdomIndex - 1) * 5 + floorIndex;

  // Guaranteed Legendary Weapon
  const weapon = generateRandomItem('Weapon', floor);
  weapon.rarity = 'Legendary';
  items.push(weapon);

  // Guaranteed Crest for this kingdom
  const crests = ITEMS_POOL.Crest;
  const crestTemplate = crests[(kingdomIndex - 1) % crests.length];
  items.push({
    id: `Crest_boss_${Date.now()}`,
    name: crestTemplate.name,
    type: 'Crest',
    rarity: 'Legendary',
    description: crestTemplate.desc,
    stats: crestTemplate.stats,
    icon: crestTemplate.icon,
    crestEffect: (crestTemplate as any).crestEffect,
  });

  // 40% chance for PetEgg
  if (Math.random() < 0.4) {
    items.push(generateRandomItem('PetEgg', floor));
  }

  // 60% chance for a Scroll
  if (Math.random() < 0.6) {
    items.push(generateRandomItem('Scroll', floor));
  }

  return items;
}
