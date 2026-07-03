import { LevelData, Tile, TileType, EnemyType, FloorTheme } from '../types';

interface Room {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function generateLevel(floorIndex: number): LevelData {
  // Only the final level (Floor 5) is a special single-room boss arena
  const isBossFloor = floorIndex === 5;

  // Scale map width and height based on the floor
  const width = isBossFloor ? 32 : (floorIndex === 1 ? 44 : 52);
  const height = isBossFloor ? 32 : (floorIndex === 1 ? 44 : 52);

  // 1. Determine theme
  let floorTheme: FloorTheme = 'VampireCrypt';
  if (floorIndex === 2) {
    floorTheme = 'GothicCathedral';
  } else if (floorIndex === 3) {
    floorTheme = 'DragunMaw';
  } else if (floorIndex === 4) {
    floorTheme = 'InnerSanctum';
  } else if (floorIndex >= 5) {
    floorTheme = 'InnerSanctum';
  }

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
          if (floorTheme === 'InnerSanctum') {
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
    let bossType: EnemyType = 'GraveDragun';
    enemySpawns.push({ x: bossSpawn.x, y: bossSpawn.y, type: bossType });

    // Stairs Spawn behind boss (initially hidden or locked, we place it in the top corner)
    stairsSpawn = { x: startX + Math.floor(arenaW / 2), y: startY + 2 };
    // We also put a chest left and right of the boss arena
    chestSpawns.push({ x: startX + 3, y: startY + 3 });
    chestSpawns.push({ x: startX + arenaW - 4, y: startY + 3 });

  } else {
    // REGULAR EXPLORABLE PROCEDURAL DUNGEON (Floor 1 and Floor 3)
    const rooms: Room[] = [];
    const minRoomSize = 5;
    const maxRoomSize = 9;
    const targetRoomCount = floorIndex === 1 ? 12 : 16;

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
              if (floorTheme === 'DragunMaw') {
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

    // Spawn Explorable Floor Bosses next to the Stairs
    if (floorIndex === 1) {
      enemySpawns.push({ x: stairsSpawn.x, y: stairsSpawn.y - 1, type: 'WerewolfKing' });
    } else if (floorIndex === 2) {
      enemySpawns.push({ x: stairsSpawn.x, y: stairsSpawn.y - 1, type: 'VampireNoble' });
    } else if (floorIndex === 3) {
      enemySpawns.push({ x: stairsSpawn.x, y: stairsSpawn.y - 1, type: 'CountDracula' });
    } else if (floorIndex === 4) {
      enemySpawns.push({ x: stairsSpawn.x, y: stairsSpawn.y - 1, type: 'CthulhuSquid' });
    }

    // Place Cyril the Arch-Mage NPC in Room 1 center
    if (rooms.length > 1) {
      const room1 = rooms[1];
      const npcX = Math.floor(room1.x + room1.w / 2);
      const npcY = Math.floor(room1.y + room1.h / 2);
      grid[npcY][npcX].type = 'NPC';
    }

    // Populate regular rooms with enemies and chests
    rooms.forEach((r, idx) => {
      // Room 0 gets no enemies, just a starting chest
      if (idx === 0) {
        chestSpawns.push({
          x: r.x + 1,
          y: r.y + 1,
        });
        return;
      }

      // Place Chests (35% chance per room)
      if (Math.random() < 0.45) {
        chestSpawns.push({
          x: r.x + Math.floor(Math.random() * (r.w - 2)) + 1,
          y: r.y + Math.floor(Math.random() * (r.h - 2)) + 1,
        });
      }

      // Place medicinal Herbs (45% chance per room)
      if (Math.random() < 0.45) {
        const hx = r.x + Math.floor(Math.random() * (r.w - 2)) + 1;
        const hy = r.y + Math.floor(Math.random() * (r.h - 2)) + 1;
        if (grid[hy][hx].type === 'Floor') {
          grid[hy][hx].type = 'Herb';
        }
      }

      // Place magical Potions (35% chance per room)
      if (Math.random() < 0.35) {
        const px = r.x + Math.floor(Math.random() * (r.w - 2)) + 1;
        const py = r.y + Math.floor(Math.random() * (r.h - 2)) + 1;
        if (grid[py][px].type === 'Floor') {
          grid[py][px].type = 'Potion';
        }
      }

      // Spawn Enemies based on room area
      const roomArea = r.w * r.h;
      const enemyCount = Math.floor(roomArea / 12) + 1; // 1 to 4 enemies

      for (let e = 0; e < enemyCount; e++) {
        const ex = r.x + Math.floor(Math.random() * r.w);
        const ey = r.y + Math.floor(Math.random() * r.h);

        // Don't spawn on top of chests, stairs, doors or pickups
        if (grid[ey][ex].type === 'Floor') {
          // Select Enemy Type based on Theme
          let type: EnemyType = 'Bat';
          const rand = Math.random();

          if (floorTheme === 'VampireCrypt') {
            if (rand < 0.30) type = 'Zombie';
            else if (rand < 0.55) type = 'Bat';
            else if (rand < 0.75) type = 'Skeleton';
            else if (rand < 0.90) type = 'Hollow';
            else type = 'Thrall';
          } else if (floorTheme === 'GothicCathedral') {
            if (rand < 0.30) type = 'Ghost';
            else if (rand < 0.55) type = 'Hollow';
            else if (rand < 0.75) type = 'Mage';
            else if (rand < 0.90) type = 'Zombie';
            else type = 'Thrall';
          } else if (floorTheme === 'DragunMaw') {
            if (rand < 0.25) type = 'Werewolf';
            else if (rand < 0.50) type = 'Zombie';
            else if (rand < 0.70) type = 'Gargoyle';
            else if (rand < 0.85) type = 'Mage';
            else type = 'BloodFiend';
          } else if (floorTheme === 'InnerSanctum') {
            if (rand < 0.30) type = 'Hollow';
            else if (rand < 0.55) type = 'Ghost';
            else if (rand < 0.80) type = 'DragonCultist';
            else type = 'BloodFiend';
          }

          enemySpawns.push({ x: ex, y: ey, type });
        }
      }
    });
  }

  // Double check player spawn tile is Floor
  grid[playerSpawn.y][playerSpawn.x].type = 'Floor';

  // Apply some decoration accents to random walls
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      if (grid[y][x].type === 'Wall' && grid[y + 1][x].type === 'Floor') {
        const decRand = Math.random();
        if (decRand < 0.1) {
          if (floorTheme === 'VampireCrypt') {
            grid[y][x].decoration = Math.random() < 0.5 ? 'chains' : 'cobweb';
          } else if (floorTheme === 'GothicCathedral') {
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
    floorIndex,
    floorTheme,
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
  ],
  Armor: [
    { name: 'Vampire Hunter Garb', desc: 'Leather vestments stitched with secret protective silver weaves.', stats: { defense: 4, agility: 2, vitality: 15 }, icon: 'hunter_garb' },
    { name: 'Gothic Obsidian Plate', desc: 'Heavy high-gothic dark steel armor reflecting no light.', stats: { defense: 8, strength: 3, vitality: 30 }, icon: 'plate' },
    { name: 'Batwing Cloak', desc: 'A silk tattered cape that wraps you in a cloud of shadow step speed.', stats: { defense: 2, agility: 6, vitality: 10 }, icon: 'cloak' },
    { name: 'Dragonscale Mail', desc: 'Sturdy plated mail that completely deflects heat waves.', stats: { defense: 6, strength: 2, arcane: 2, vitality: 20 }, icon: 'mail' },
  ],
  Ring: [
    { name: 'Ruby Skull Ring', desc: 'Slightly warm to the touch. Increases your physical power.', stats: { strength: 4 }, icon: 'ruby_ring' },
    { name: 'Vampiric Seal', desc: 'Draws tiny bits of life essence out of thin air.', stats: { lifesteal: 0.04, agility: 2 }, icon: 'blood_ring' },
    { name: 'Dragon Eye Ring', desc: 'Imbued with the inner spark of a dragun hatchling.', stats: { arcane: 4 }, icon: 'dragon_ring' },
    { name: 'Grave Ring of Vitality', desc: 'A dusty bone band that pumps warm blood into your veins.', stats: { vitality: 25 }, icon: 'bone_ring' },
  ],
  Relic: [
    { name: 'Blood Chalice', desc: 'A sacred cup filled with crimson liquid. Enhances mana flows.', stats: { manaRegen: 2.0, arcane: 3 }, icon: 'chalice' },
    { name: 'Ancient Drake Tooth', desc: 'Radiates intense heat. Increases all physical swings.', stats: { strength: 5 }, icon: 'tooth' },
    { name: 'Gargoyle Core', desc: 'Made of petrified gargoyle stone. Drastically increases block.', stats: { defense: 5, vitality: 15 }, icon: 'core' },
    { name: 'Vampire Lord Crest', desc: 'A noble vampire medallion that reduces all cooldowns.', stats: { agility: 4, manaRegen: 1.0 }, icon: 'crest' },
  ],
};

// Generate randomized items
export function generateRandomItem(type: 'Weapon' | 'Armor' | 'Ring' | 'Relic', floor: number): any {
  const pool = ITEMS_POOL[type];
  const template = pool[Math.floor(Math.random() * pool.length)];

  // Rarity determination
  const rand = Math.random();
  let rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' = 'Common';
  let multiplier = 1.0;

  if (rand < 0.05 + floor * 0.02) {
    rarity = 'Legendary';
    multiplier = 2.2;
  } else if (rand < 0.15 + floor * 0.04) {
    rarity = 'Epic';
    multiplier = 1.6;
  } else if (rand < 0.40 + floor * 0.06) {
    rarity = 'Rare';
    multiplier = 1.3;
  }

  // Scale template stats with multiplier and floor
  const finalStats: any = {};
  for (const [key, val] of Object.entries(template.stats)) {
    const statVal = val as number;
    if (key === 'vitality') {
      finalStats[key] = Math.round(statVal * multiplier + floor * 4);
    } else if (key === 'damage') {
      finalStats[key] = Math.round(statVal * multiplier + floor * 3);
    } else if (key === 'lifesteal' || key === 'manaRegen') {
      finalStats[key] = parseFloat((statVal * multiplier).toFixed(3));
    } else {
      finalStats[key] = Math.round(statVal * multiplier + Math.floor(floor / 2));
    }
  }

  return {
    id: `${type}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    name: rarity !== 'Common' ? `${rarity} ${template.name}` : template.name,
    type,
    rarity,
    description: template.desc,
    stats: finalStats,
    icon: template.icon,
  };
}
