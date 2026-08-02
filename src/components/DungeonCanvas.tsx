import React, { useEffect, useRef, useState } from 'react';
import { 
  PlayerState, 
  LevelData, 
  Enemy, 
  Projectile, 
  Particle, 
  DamageNumber, 
  Tile, 
  Item, 
  EnemyType,
  Rarity,
  GameSettings
} from '../types';
import { playSound } from './SoundEffects';
import { generateRandomItem } from '../utils/procedural';

interface DungeonCanvasProps {
  player: PlayerState;
  level: LevelData;
  setPlayer: React.Dispatch<React.SetStateAction<PlayerState>>;
  setLevel: React.Dispatch<React.SetStateAction<LevelData>>;
  onNextFloor: () => void;
  onGameOver: () => void;
  onVictory: () => void;
  isSheetOpen: boolean;
  gameActive: boolean;
  settings: GameSettings;
}

export default function DungeonCanvas({
  player,
  level,
  setPlayer,
  setLevel,
  onNextFloor,
  onGameOver,
  onVictory,
  isSheetOpen,
  gameActive,
  settings
}: DungeonCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Canvas scaling and dimensions
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const TILE_SIZE = 32; // Drawn tile size (multiplied by rendering scale)

  // Game lists held in refs to prevent React trigger lag in high frequency loops
  const projectilesRef = useRef<Projectile[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const damageNumbersRef = useRef<DamageNumber[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const screenShakeRef = useRef(0);
  const keysRef = useRef<Set<string>>(new Set());
  const cameraRef = useRef({ x: 0, y: 0 });
  
  // Track game time/frames
  const gameFrame = useRef(0);

  // Companion system representation
  interface CompanionEntity {
    id: string;
    type: 'SwordLady' | 'Sorceress';
    name: string;
    x: number;
    y: number;
    size: number;
    speed: number;
    damage: number;
    lastAttackTime: number;
    attackCooldown: number;
  }
  const companionsRef = useRef<CompanionEntity[]>([]);

  // Dialogue/Quest State for branching choices
  const [activeDialogue, setActiveDialogue] = useState<{
    title: string;
    text: string;
    options: {
      text: string;
      action: () => void;
    }[];
  } | null>(null);

  // Sync enemies on level load
  useEffect(() => {
    // Spawn concrete enemy instances from spawns
    const spawnedEnemies = level.enemySpawns.map((s, idx) => {
      let maxHp = 30;
      let dmg = 8;
      let spd = 1.0;
      let name: string = s.type;

      switch (s.type) {
        case 'Bat':
          maxHp = 15 + level.floorIndex * 4;
          dmg = 5 + level.floorIndex * 2;
          spd = 1.6;
          name = 'Crypt Bat';
          break;
        case 'Thrall':
          maxHp = 30 + level.floorIndex * 6;
          dmg = 8 + level.floorIndex * 3;
          spd = 1.0;
          name = 'Vampiric Thrall';
          break;
        case 'Skeleton':
          maxHp = 25 + level.floorIndex * 5;
          dmg = 7 + level.floorIndex * 2;
          spd = 0.8;
          name = 'Skeletal Guard';
          break;
        case 'Gargoyle':
          maxHp = 45 + level.floorIndex * 8;
          dmg = 12 + level.floorIndex * 4;
          spd = 0.6; // Very slow until awaken
          name = 'Cathedral Gargoyle';
          break;
        case 'Mage':
          maxHp = 35 + level.floorIndex * 6;
          dmg = 10 + level.floorIndex * 3;
          spd = 0.9;
          name = 'Shadow Necromancer';
          break;
        case 'Hatchling':
          maxHp = 40 + level.floorIndex * 7;
          dmg = 11 + level.floorIndex * 3;
          spd = 1.2;
          name = 'Dragun Hatchling';
          break;
        case 'BloodFiend':
          maxHp = 55 + level.floorIndex * 9;
          dmg = 14 + level.floorIndex * 4;
          spd = 0.8;
          name = 'Beastblood Fiend';
          break;
        case 'DragonCultist':
          maxHp = 35 + level.floorIndex * 6;
          dmg = 10 + level.floorIndex * 3;
          spd = 1.1;
          name = 'Draconic Cultist';
          break;
        case 'Werewolf':
          maxHp = 42 + level.floorIndex * 8;
          dmg = 12 + level.floorIndex * 4;
          spd = 1.35;
          name = 'Shadow Werewolf';
          break;
        case 'Zombie':
          maxHp = 36 + level.floorIndex * 5;
          dmg = 8 + level.floorIndex * 2;
          spd = 0.65;
          name = 'Eerie Zombie';
          break;
        case 'Ghost':
          maxHp = 22 + level.floorIndex * 4;
          dmg = 8 + level.floorIndex * 3;
          spd = 1.15;
          name = 'Spectral Ghost';
          break;
        case 'Hollow':
          maxHp = 28 + level.floorIndex * 5;
          dmg = 9 + level.floorIndex * 3;
          spd = 1.0;
          name = 'Hollow Shade';
          break;
        case 'SkeletonKing':
          maxHp = 220;
          dmg = 15;
          spd = 0.9;
          name = 'Baron von Bone (Necromancer Lord)';
          break;
        case 'VampireLord':
          maxHp = 450;
          dmg = 20;
          spd = 1.4;
          name = 'Vlad the Vampire Lord';
          break;
        case 'ChimeraBeast':
          maxHp = 650;
          dmg = 24;
          spd = 1.6;
          name = 'Ash-Wing Chimera';
          break;
        case 'SmelterGiant':
          maxHp = 850;
          dmg = 30;
          spd = 0.8;
          name = 'Ignis the Smelter Giant';
          break;
        case 'WerewolfKing':
          maxHp = 280;
          dmg = 18;
          spd = 1.4;
          name = 'Fenrir the Werewolf King';
          break;
        case 'VampireNoble':
          maxHp = 440;
          dmg = 22;
          spd = 1.3;
          name = 'Lord Sanguinius (Humanoid Vampire)';
          break;
        case 'CountDracula':
          maxHp = 680;
          dmg = 28;
          spd = 1.25;
          name = 'Count Dracula';
          break;
        case 'CthulhuSquid':
          maxHp = 950;
          dmg = 34;
          spd = 1.0;
          name = 'Cthulhu Abyssal Squid';
          break;
        case 'GraveDragun':
          maxHp = 1500;
          dmg = 42;
          spd = 0.6;
          name = 'Grave-Born Skeleton Dragun';
          break;
      }

      const isBoss = s.type === 'SkeletonKing' || s.type === 'VampireLord' || s.type === 'ChimeraBeast' || s.type === 'SmelterGiant' || s.type === 'GraveDragun' || s.type === 'WerewolfKing' || s.type === 'VampireNoble' || s.type === 'CountDracula' || s.type === 'CthulhuSquid';
      const size = s.type === 'GraveDragun' ? 56 : s.type === 'CthulhuSquid' ? 48 : s.type === 'CountDracula' ? 38 : s.type === 'VampireNoble' ? 32 : s.type === 'WerewolfKing' ? 36 : s.type === 'SmelterGiant' ? 44 : s.type === 'ChimeraBeast' ? 36 : s.type === 'VampireLord' ? 30 : s.type === 'SkeletonKing' ? 28 : s.type === 'BloodFiend' ? 22 : s.type === 'Zombie' ? 17 : 16;
      const xpReward = s.type === 'GraveDragun' ? 600 : s.type === 'CthulhuSquid' ? 500 : s.type === 'CountDracula' ? 400 : s.type === 'VampireNoble' ? 300 : s.type === 'WerewolfKing' ? 200 : s.type === 'SmelterGiant' ? 350 : s.type === 'ChimeraBeast' ? 250 : s.type === 'VampireLord' ? 180 : s.type === 'SkeletonKing' ? 120 : s.type === 'BloodFiend' ? 32 + level.floorIndex * 4 : 15 + level.floorIndex * 3;
      const attackCooldown = s.type === 'GraveDragun' ? 100 : s.type === 'CthulhuSquid' ? 90 : s.type === 'CountDracula' ? 85 : s.type === 'VampireNoble' ? 80 : s.type === 'WerewolfKing' ? 75 : s.type === 'SmelterGiant' ? 110 : s.type === 'ChimeraBeast' ? 80 : s.type === 'VampireLord' ? 90 : s.type === 'SkeletonKing' ? 95 : 70;
      const color = s.type === 'GraveDragun' ? '#dc2626' : s.type === 'CthulhuSquid' ? '#0d9488' : s.type === 'CountDracula' ? '#b91c1c' : s.type === 'VampireNoble' ? '#ec4899' : s.type === 'WerewolfKing' ? '#1e293b' : s.type === 'SmelterGiant' ? '#ea580c' : s.type === 'ChimeraBeast' ? '#16a34a' : s.type === 'VampireLord' ? '#991b1b' : s.type === 'SkeletonKing' ? '#cbd5e1' : s.type === 'BloodFiend' ? '#7f1d1d' : s.type === 'DragonCultist' ? '#f97316' : s.type === 'Werewolf' ? '#4b5563' : s.type === 'Zombie' ? '#15803d' : s.type === 'Ghost' ? '#93c5fd' : s.type === 'Hollow' ? '#a21caf' : '#a1a1aa';

      return {
        id: `enemy_${Date.now()}_${idx}`,
        type: s.type,
        name,
        x: s.x * 32 + 16,
        y: s.y * 32 + 16,
        size,
        health: maxHp,
        maxHealth: maxHp,
        damage: dmg,
        speed: spd,
        xpReward,
        isBoss,
        state: 'idle' as const,
        stateTimer: 0,
        lastAttackTime: 0,
        attackCooldown,
        currentPhase: 1,
        color,
      };
    });

    enemiesRef.current = spawnedEnemies;
    projectilesRef.current = [];
    particlesRef.current = [];
    damageNumbersRef.current = [];

    // Trigger music change if boss is present
    const hasBoss = spawnedEnemies.some(e => e.isBoss);
    if (hasBoss) {
      playSound('boss_roar');
    }

    // Explored spawn room
    exploreAroundPlayer(Math.floor(player.x / 32), Math.floor(player.y / 32));

    // Spawn companions if unlocked
    const companions: CompanionEntity[] = [];
    if (player.activeBoons?.includes('Companion_SwordLady')) {
      companions.push({
        id: `companion_valerie_${Date.now()}`,
        type: 'SwordLady',
        name: 'Valerie, Crimson Blade Maiden',
        x: player.x - 32,
        y: player.y - 32,
        size: 16,
        speed: 2.2,
        damage: 18 + level.floorIndex * 4,
        lastAttackTime: 0,
        attackCooldown: 40,
      });
    }
    if (player.activeBoons?.includes('Companion_Sorceress')) {
      companions.push({
        id: `companion_elysia_${Date.now()}`,
        type: 'Sorceress',
        name: 'Elysia, Astral Sorceress',
        x: player.x + 32,
        y: player.y - 32,
        size: 15,
        speed: 1.8,
        damage: 15 + level.floorIndex * 5,
        lastAttackTime: 0,
        attackCooldown: 50,
      });
    }
    companionsRef.current = companions;
  }, [level.floorIndex]);

  // Handle Resize of canvas
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({
          width: Math.floor(width),
          height: Math.max(350, Math.min(600, Math.floor(height))),
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Sync camera smoothly
  const updateCamera = (px: number, py: number) => {
    const targetX = px - dimensions.width / 2;
    const targetY = py - dimensions.height / 2;
    cameraRef.current.x += (targetX - cameraRef.current.x) * 0.1;
    cameraRef.current.y += (targetY - cameraRef.current.y) * 0.1;
  };

  // Helper: check if a coordinate blocks movement
  const isWallOrSolid = (tx: number, ty: number): boolean => {
    if (tx < 0 || tx >= level.width || ty < 0 || ty >= level.height) return true;
    const tile = level.grid[ty][tx];
    return tile.type === 'Wall';
  };

  // Helper: check circle-circle collision
  const circlesCollide = (x1: number, y1: number, r1: number, x2: number, y2: number, r2: number) => {
    const dx = x1 - x2;
    const dy = y1 - y2;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist < r1 + r2;
  };

  // Explore cells around player to clear Fog
  const exploreAroundPlayer = (px: number, py: number) => {
    const radius = 6;
    let gridChanged = false;
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const tx = px + dx;
        const ty = py + dy;
        if (tx >= 0 && tx < level.width && ty >= 0 && ty < level.height) {
          if (!level.grid[ty][tx].explored) {
            level.grid[ty][tx].explored = true;
            gridChanged = true;
          }
        }
      }
    }
    if (gridChanged) {
      setLevel({ ...level });
    }
  };

  // Damage Number Generator
  const spawnDamageNumber = (x: number, y: number, text: string, color: string) => {
    damageNumbersRef.current.push({
      id: `dmg_${Date.now()}_${Math.random()}`,
      x,
      y: y - 10,
      text,
      color,
      duration: 0,
      maxDuration: 40,
    });
  };

  // Particle Generator
  const spawnSplashParticles = (x: number, y: number, color: string, count: number) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2 + 1;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: Math.random() * 3 + 1,
        duration: 0,
        maxDuration: Math.random() * 20 + 15,
        alpha: 1.0,
      });
    }
  };

  // Keyboard and Mouse Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysRef.current.add(key);

      // Trigger dash (Shift or 'L')
      if (e.key === 'Shift') {
        triggerDash();
      }
      
      // Trigger Spell ('q')
      if (key === 'q') {
        triggerSpell();
      }

      // Trigger E Spell ('e')
      if (key === 'e') {
        triggerESpell();
      }

      // Open sheet ('i' or 'c')
      if (key === 'i' || key === 'c') {
        // We handle this via state in Parent (App.tsx)
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysRef.current.delete(key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [player, level]);

  const triggerDash = () => {
    if (player.dashCooldown > 0 || player.dashActiveTime > 0) return;

    // Get movement direction
    let dx = 0;
    let dy = 0;
    if (keysRef.current.has('w') || keysRef.current.has('arrowup')) dy = -1;
    if (keysRef.current.has('s') || keysRef.current.has('arrowdown')) dy = 1;
    if (keysRef.current.has('a') || keysRef.current.has('arrowleft')) dx = -1;
    if (keysRef.current.has('d') || keysRef.current.has('arrowright')) dx = 1;

    // If standing still, dash in facing direction
    if (dx === 0 && dy === 0) {
      if (player.facing === 'left') dx = -1;
      if (player.facing === 'right') dx = 1;
      if (player.facing === 'up') dy = -1;
      if (player.facing === 'down') dy = 1;
    }

    // Normalize
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len > 0) {
      dx /= len;
      dy /= len;
    }

    // Set player dash
    const baseDashCooldown = Math.max(20, 60 - player.stats.agility * 1); // frames
    setPlayer(prev => ({
      ...prev,
      dashActiveTime: 10, // 10 frames of speed and invincibility
      dashDir: { x: dx, y: dy },
      dashCooldown: baseDashCooldown,
    }));

    playSound('swing');
    spawnSplashParticles(player.x, player.y, '#e4e4e7', 10);
  };

  // Touch button handlers
  const simulateKeyStart = (key: string) => {
    keysRef.current.add(key);
    if (key === 'shift') triggerDash();
    if (key === 'q') triggerSpell();
    if (key === 'e') triggerESpell();
  };

  const simulateKeyEnd = (key: string) => {
    keysRef.current.delete(key);
  };

  const triggerESpell = () => {
    if (player.mana < 30) {
      spawnDamageNumber(player.x, player.y - 12, 'No Mana (30 Required)!', '#c084fc');
      return;
    }

    // Spend mana
    setPlayer(prev => ({
      ...prev,
      mana: Math.max(0, prev.mana - 30),
    }));

    playSound('spell');
    spawnDamageNumber(player.x, player.y - 12, 'Magma Fissure! 🔥', '#f97316');
    screenShakeRef.current = 12;

    // Determine path direction
    let dx = 0;
    let dy = 0;
    if (player.facing === 'left') dx = -32;
    else if (player.facing === 'right') dx = 32;
    else if (player.facing === 'up') dy = -32;
    else if (player.facing === 'down') dy = 32;

    // Spawn 5 sequential fire erupts
    for (let i = 1; i <= 5; i++) {
      setTimeout(() => {
        if (!gameActive || isSheetOpen) return;
        const fx = player.x + dx * i;
        const fy = player.y + dy * i;

        // Check if wall
        const tx = Math.floor(fx / 32);
        const ty = Math.floor(fy / 32);
        if (isWallOrSolid(tx, ty)) return;

        // Visual flash / eruption
        playSound('spell');
        spawnSplashParticles(fx, fy, '#ea580c', 12);
        spawnSplashParticles(fx, fy, '#ef4444', 8);

        // Add a temporary projectile for rendering & hit detection
        projectilesRef.current.push({
          id: `fissure_${Date.now()}_${i}`,
          x: fx,
          y: fy,
          vx: 0,
          vy: 0,
          size: 24,
          damage: 0, // Handled immediately for robustness
          isPlayer: true,
          color: '#f97316',
          duration: 15,
          type: 'fissure_eruption'
        });

        // Damage enemies in explosion range instantly!
        enemiesRef.current.forEach(e => {
          const dist = Math.sqrt((e.x - fx) ** 2 + (e.y - fy) ** 2);
          if (dist < 28 + e.size) {
            const finalDmg = Math.round((22 + player.stats.arcane * 2.2) * (0.9 + Math.random() * 0.2));
            e.health -= finalDmg;
            spawnDamageNumber(e.x, e.y, `${finalDmg} 🌋`, '#f97316');
            spawnSplashParticles(e.x, e.y, '#f97316', 6);
            playSound('hit');
          }
        });
      }, i * 120);
    }
  };

  const triggerSpell = () => {
    if (player.mana < 15) {
      spawnDamageNumber(player.x, player.y - 12, 'No Mana!', '#c084fc');
      return;
    }

    // Spawn Projectile
    let vx = 0;
    let vy = 0;
    if (player.facing === 'left') vx = -4.5;
    else if (player.facing === 'right') vx = 4.5;
    else if (player.facing === 'up') vy = -4.5;
    else if (player.facing === 'down') vy = 4.5;

    // Magic scaling & difficulty modifier
    let baseDmg = 15 + player.stats.arcane * 1.8;
    if (settings.difficulty === 'Casual') baseDmg *= 1.3;
    else if (settings.difficulty === 'Nightmare') baseDmg *= 0.8;
    const dmg = Math.round(baseDmg);

    const checkDoubleCast = player.activeBoons.includes('Double Cast') && Math.random() < 0.25;

    const fireProjectile = (offsetAngle = 0) => {
      let finalVx = vx;
      let finalVy = vy;

      if (offsetAngle !== 0) {
        const cos = Math.cos(offsetAngle);
        const sin = Math.sin(offsetAngle);
        finalVx = vx * cos - vy * sin;
        finalVy = vx * sin + vy * cos;
      }

      projectilesRef.current.push({
        id: `proj_${Date.now()}_${Math.random()}`,
        x: player.x,
        y: player.y,
        vx: finalVx,
        vy: finalVy,
        size: 8,
        damage: dmg,
        isPlayer: true,
        color: '#f97316', // Orange fireball
        duration: 120,
        type: 'fireball',
      });
    };

    fireProjectile();
    if (checkDoubleCast) {
      // Cast another 0.15s later or split angle
      fireProjectile(0.2);
      spawnDamageNumber(player.x, player.y - 12, 'Double Cast!', '#e9d5ff');
    }

    setPlayer(prev => ({
      ...prev,
      mana: Math.max(0, prev.mana - 15),
    }));

    playSound('spell');
  };

  const handleMeleeAttack = () => {
    const now = Date.now();
    const weaponCooldown = Math.max(250, 600 - player.stats.agility * 8); // in ms
    if (now - player.lastAttackTime < weaponCooldown) return;

    playSound('swing');

    // Swing arc box in front
    let hitX = player.x;
    let hitY = player.y;
    const hitRange = player.equipped.Weapon?.icon === 'whip' ? 64 : 36;
    const hitSize = 28;

    if (player.facing === 'left') hitX -= hitRange / 2;
    else if (player.facing === 'right') hitX += hitRange / 2;
    else if (player.facing === 'up') hitY -= hitRange / 2;
    else if (player.facing === 'down') hitY += hitRange / 2;

    // Visual melee swipe projectile that lasts 5 frames
    projectilesRef.current.push({
      id: `swipe_${Date.now()}`,
      x: hitX,
      y: hitY,
      vx: 0,
      vy: 0,
      size: hitSize,
      damage: 0, // Visual only
      isPlayer: true,
      color: player.equipped.Weapon?.icon === 'whip' ? '#e2e8f0' : '#f43f5e',
      duration: 6,
      type: player.equipped.Weapon?.icon === 'whip' ? 'whip_strike' : 'melee_swipe',
    });

    // Check hit on all enemies in range & difficulty modifier
    let rawMeleeDmg = 10 + player.stats.strength * 1.5 + (player.equipped.Weapon?.stats.damage || 0);
    if (settings.difficulty === 'Casual') rawMeleeDmg *= 1.3;
    else if (settings.difficulty === 'Nightmare') rawMeleeDmg *= 0.8;
    const baseMeleeDmg = Math.round(rawMeleeDmg);
    const isIgnite = player.activeBoons.includes("Dragon's Breath");

    let hitAtLeastOne = false;

    enemiesRef.current.forEach(e => {
      const dist = Math.sqrt((e.x - hitX) ** 2 + (e.y - hitY) ** 2);
      if (dist < hitSize + e.size) {
        // Hit enemy!
        let isCrit = false;
        let finalDmg = baseMeleeDmg;
        
        if (player.activeBoons.includes('Vanguard_Blessing')) {
          if (Math.random() < 0.20) { // 20% crit chance
            isCrit = true;
            finalDmg = Math.round(finalDmg * 1.6); // 1.6x damage
          }
        }

        // Random swing variance
        finalDmg = Math.round(finalDmg * (0.9 + Math.random() * 0.2));
        e.health -= finalDmg;

        playSound('hit');
        hitAtLeastOne = true;

        if (isCrit) {
          spawnDamageNumber(e.x, e.y, `${finalDmg} 💥 CRIT!`, '#fbbf24');
          spawnSplashParticles(e.x, e.y, '#fbbf24', 16); // Gold sparkles for crit
        } else {
          spawnDamageNumber(e.x, e.y, `${finalDmg}`, '#ef4444');
          spawnSplashParticles(e.x, e.y, '#dc2626', 12); // Blood splash
        }

        // Ignite dot
        if (isIgnite) {
          setTimeout(() => {
            if (e.health > 0) {
              const burn = Math.round(baseMeleeDmg * 0.15);
              e.health -= burn;
              spawnDamageNumber(e.x, e.y, `${burn} 🔥`, '#f97316');
              spawnSplashParticles(e.x, e.y, '#f97316', 4);
            }
          }, 600);
        }

        // Lifesteal from Renegade Vampire or weapons
        let totalLifesteal = (player.equipped.Weapon?.stats.lifesteal || 0) + (player.equipped.Ring?.stats.lifesteal || 0);
        if (player.activeBoons.includes('Vampiric Touch')) {
          // If killed, we heal 5% max HP later, but add general siphoning
          totalLifesteal += 0.02;
        }

        if (totalLifesteal > 0) {
          const healAmount = Math.round(finalDmg * totalLifesteal);
          if (healAmount > 0) {
            setPlayer(prev => ({
              ...prev,
              health: Math.min(prev.maxHealth, prev.health + healAmount),
            }));
            spawnDamageNumber(player.x, player.y - 12, `+${healAmount} HP 🩸`, '#22c55e');
          }
        }
      }
    });

    setPlayer(prev => ({
      ...prev,
      lastAttackTime: now,
    }));
  };

  // Primary Game Update Loop
  useEffect(() => {
    if (!gameActive || isSheetOpen) return;

    let animFrameId: number;

    const gameLoop = () => {
      gameFrame.current++;

      if (!activeDialogue) {
        updatePlayerAndPhysics();
        updateProjectiles();
        updateCompanionsAndAI();
        updateEnemiesAndAI();
        updateParticlesAndDmgNumbers();

        // Check level transitions and interaction triggers
        checkCollisionsAndTriggers();
      }

      // Draw everything
      drawGame();

      animFrameId = requestAnimationFrame(gameLoop);
    };

    animFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animFrameId);
  }, [player, level, dimensions, gameActive, isSheetOpen, activeDialogue]);

  const updatePlayerAndPhysics = () => {
    // 1. Move Player
    let dx = 0;
    let dy = 0;

    if (player.dashActiveTime > 0) {
      // Dashing - move quickly in dash dir
      dx = player.dashDir.x * 6.5;
      dy = player.dashDir.y * 6.5;
    } else {
      // Regular move inputs
      if (keysRef.current.has('w') || keysRef.current.has('arrowup')) dy = -1;
      if (keysRef.current.has('s') || keysRef.current.has('arrowdown')) dy = 1;
      if (keysRef.current.has('a') || keysRef.current.has('arrowleft')) dx = -1;
      if (keysRef.current.has('d') || keysRef.current.has('arrowright')) dx = 1;

      // Normal speed calculations
      const baseSpeed = 2.0 + player.stats.agility * 0.04;
      const length = Math.sqrt(dx * dx + dy * dy);
      if (length > 0) {
        dx = (dx / length) * baseSpeed;
        dy = (dy / length) * baseSpeed;
      }
    }

    // Determine facing
    let nextFacing = player.facing;
    if (dx < 0) nextFacing = 'left';
    else if (dx > 0) nextFacing = 'right';
    else if (dy < 0) nextFacing = 'up';
    else if (dy > 1) nextFacing = 'down';

    // 2. Continuous Collision Detection with walls
    let px = player.x + dx;
    let py = player.y + dy;

    // Check X boundaries
    const playerRadius = 10;
    const checkXCells = [
      { x: Math.floor((px - playerRadius) / 32), y: Math.floor((player.y - playerRadius) / 32) },
      { x: Math.floor((px + playerRadius) / 32), y: Math.floor((player.y - playerRadius) / 32) },
      { x: Math.floor((px - playerRadius) / 32), y: Math.floor((player.y + playerRadius) / 32) },
      { x: Math.floor((px + playerRadius) / 32), y: Math.floor((player.y + playerRadius) / 32) },
    ];

    let collisionX = false;
    for (const cell of checkXCells) {
      if (isWallOrSolid(cell.x, cell.y)) {
        collisionX = true;
        break;
      }
    }
    if (!collisionX) {
      player.x = px;
    }

    // Check Y boundaries
    const checkYCells = [
      { x: Math.floor((player.x - playerRadius) / 32), y: Math.floor((py - playerRadius) / 32) },
      { x: Math.floor((player.x + playerRadius) / 32), y: Math.floor((py - playerRadius) / 32) },
      { x: Math.floor((player.x - playerRadius) / 32), y: Math.floor((py + playerRadius) / 32) },
      { x: Math.floor((player.x + playerRadius) / 32), y: Math.floor((py + playerRadius) / 32) },
    ];

    let collisionY = false;
    for (const cell of checkYCells) {
      if (isWallOrSolid(cell.x, cell.y)) {
        collisionY = true;
        break;
      }
    }
    if (!collisionY) {
      player.y = py;
    }

    // Draw shadow particles if Shadow Step boon is active during dash
    if (player.dashActiveTime > 0 && player.activeBoons.includes('Shadow Step') && gameFrame.current % 2 === 0) {
      particlesRef.current.push({
        x: player.x,
        y: player.y,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        color: '#4b5563', // Shadow dark particle
        size: Math.random() * 4 + 2,
        duration: 0,
        maxDuration: 25,
        alpha: 0.8,
      });

      // Damage enemies overlapping this spot
      enemiesRef.current.forEach(e => {
        const d = Math.sqrt((e.x - player.x) ** 2 + (e.y - player.y) ** 2);
        if (d < e.size + 15) {
          e.health -= 2;
          spawnDamageNumber(e.x, e.y, '2 🦇', '#4b5563');
        }
      });
    }

    // 3. Regen Mana (Arcane scaling) and manage cooldowns
    let manaRegenRate = (1.0 + player.stats.arcane * 0.1) / 60; // 60 updates/sec
    let nextMana = Math.min(player.maxMana, player.mana + manaRegenRate);

    // Active block shields
    let shieldCool = player.shieldCooldown;
    let shieldActive = player.shieldActive;
    if (!shieldActive && player.activeBoons.includes('Blood Shield')) {
      if (shieldCool > 0) {
        shieldCool--;
      } else {
        shieldActive = true;
        spawnDamageNumber(player.x, player.y - 12, 'Blood Shield up!', '#f43f5e');
      }
    }

    // Decrease active dash times or cooldowns
    setPlayer(prev => ({
      ...prev,
      x: player.x,
      y: player.y,
      facing: nextFacing,
      mana: nextMana,
      dashActiveTime: Math.max(0, prev.dashActiveTime - 1),
      dashCooldown: Math.max(0, prev.dashCooldown - 1),
      shieldCooldown: shieldCool,
      shieldActive,
    }));

    // Auto trigger attack if Space is held
    if (keysRef.current.has(' ') && !isSheetOpen) {
      handleMeleeAttack();
    }

    // Smoothly focus camera
    updateCamera(player.x, player.y);
  };

  const updateProjectiles = () => {
    // Filter out expired projectiles
    projectilesRef.current = projectilesRef.current.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.duration--;

      // Wall crash check
      const tx = Math.floor(p.x / 32);
      const ty = Math.floor(p.y / 32);
      if (isWallOrSolid(tx, ty)) {
        // Destroy and splash sparks
        spawnSplashParticles(p.x, p.y, p.color, 6);
        return false;
      }

      // Check combat collisions
      if (p.isPlayer && p.damage > 0) {
        // Projectile hits enemy?
        for (const e of enemiesRef.current) {
          if (circlesCollide(p.x, p.y, p.size, e.x, e.y, e.size)) {
            // Hit!
            e.health -= p.damage;
            playSound('hit');
            spawnSplashParticles(p.x, p.y, p.color, 8);
            spawnDamageNumber(e.x, e.y, `${p.damage} 🔥`, '#f97316');
            return false;
          }
        }
      } else if (!p.isPlayer) {
        // Enemy projectile hits player?
        if (circlesCollide(p.x, p.y, p.size, player.x, player.y, 10)) {
          if (player.dashActiveTime > 0) {
            // Invincible during dash
            return false;
          }

          damagePlayer(p.damage);
          spawnSplashParticles(p.x, p.y, '#dc2626', 8);
          return false;
        }
      }

      return p.duration > 0;
    });
  };

  const updateCompanionsAndAI = () => {
    companionsRef.current.forEach(comp => {
      // 1. Follow player if too far
      const distToPlayer = Math.sqrt((player.x - comp.x) ** 2 + (player.y - comp.y) ** 2);
      
      // Look for the closest enemy
      let closestEnemy: Enemy | null = null;
      let closestDist = Infinity;
      enemiesRef.current.forEach(e => {
        const d = Math.sqrt((comp.x - e.x) ** 2 + (comp.y - e.y) ** 2);
        if (d < closestDist) {
          closestDist = d;
          closestEnemy = e;
        }
      });

      const hasTarget = closestEnemy !== null && closestDist < 250;
      
      let damageMultiplier = 1.0;
      if (player.activeBoons?.includes('Companions_Fortified')) {
        damageMultiplier = 1.5;
      }
      const compDmg = Math.round(comp.damage * damageMultiplier);

      if (distToPlayer > 120) {
        // Force follow player if way too far
        const angle = Math.atan2(player.y - comp.y, player.x - comp.x);
        comp.x += Math.cos(angle) * comp.speed * 1.5;
        comp.y += Math.sin(angle) * comp.speed * 1.5;
      } else if (hasTarget && closestEnemy) {
        const target = closestEnemy as Enemy;
        const distToEnemy = closestDist;

        if (comp.type === 'SwordLady') {
          // Melee AI: Charge enemy and slash
          if (distToEnemy > 24) {
            const angle = Math.atan2(target.y - comp.y, target.x - comp.x);
            comp.x += Math.cos(angle) * comp.speed;
            comp.y += Math.sin(angle) * comp.speed;
          }

          const now = Date.now();
          if (distToEnemy <= 32 && now - comp.lastAttackTime > comp.attackCooldown * 16.6) {
            // Slash!
            comp.lastAttackTime = now;
            target.health -= compDmg;
            playSound('hit');
            spawnSplashParticles(target.x, target.y, '#f43f5e', 8); // Red/Crimson slash splash
            spawnDamageNumber(target.x, target.y - 10, `${compDmg} ⚔️`, '#ef4444');
            
            // Add a visual slash projectile/swipe effect at target location
            projectilesRef.current.push({
              id: `valerie_swipe_${Date.now()}`,
              x: target.x,
              y: target.y,
              vx: 0,
              vy: 0,
              size: 16,
              damage: 0,
              isPlayer: true,
              color: '#ffe4e6',
              duration: 10,
              type: 'melee_swipe',
            });
          }
        } else if (comp.type === 'Sorceress') {
          // Ranged AI: Stay at range, cast magic orbs
          if (distToEnemy > 110) {
            const angle = Math.atan2(target.y - comp.y, target.x - comp.x);
            comp.x += Math.cos(angle) * comp.speed;
            comp.y += Math.sin(angle) * comp.speed;
          } else if (distToEnemy < 60) {
            // Retreat slightly
            const angle = Math.atan2(target.y - comp.y, target.x - comp.x);
            comp.x -= Math.cos(angle) * comp.speed * 0.8;
            comp.y -= Math.sin(angle) * comp.speed * 0.8;
          }

          const now = Date.now();
          if (now - comp.lastAttackTime > comp.attackCooldown * 16.6) {
            comp.lastAttackTime = now;
            playSound('spell');
            // Cast astral magic bolt towards enemy!
            const angle = Math.atan2(target.y - comp.y, target.x - comp.x);
            projectilesRef.current.push({
              id: `elysia_bolt_${Date.now()}`,
              x: comp.x,
              y: comp.y,
              vx: Math.cos(angle) * 3.5,
              vy: Math.sin(angle) * 3.5,
              size: 6,
              damage: compDmg,
              isPlayer: true,
              color: '#c084fc', // purple astral bolt
              duration: 80,
              type: 'shadow',
            });

            // Float a spell casting spark
            spawnSplashParticles(comp.x, comp.y, '#c084fc', 4);
          }
        }
      } else {
        // Idle follow player closely
        if (distToPlayer > 50) {
          const angle = Math.atan2(player.y - comp.y, player.x - comp.x);
          comp.x += Math.cos(angle) * comp.speed * 0.9;
          comp.y += Math.sin(angle) * comp.speed * 0.9;
        }
      }

      // Collide with walls gently to stay inside map
      const tx = Math.floor(comp.x / 32);
      const ty = Math.floor(comp.y / 32);
      if (isWallOrSolid(tx, ty)) {
        // Push companion towards player
        const angle = Math.atan2(player.y - comp.y, player.x - comp.x);
        comp.x += Math.cos(angle) * 4;
        comp.y += Math.sin(angle) * 4;
      }
    });
  };

  const damagePlayer = (amount: number) => {
    // Apply shield absorb
    if (player.shieldActive) {
      setPlayer(prev => ({
        ...prev,
        shieldActive: false,
        shieldCooldown: 1200, // 20 seconds
      }));
      spawnDamageNumber(player.x, player.y - 12, 'Blocked!', '#38bdf8');
      playSound('spell');
      return;
    }

    // Def/vitality block
    const bonusDef = [
      player.equipped.Weapon,
      player.equipped.Armor,
      player.equipped.Ring,
      player.equipped.Relic,
    ].reduce((sum, item) => sum + (item?.stats.defense || 0), 0);

    const defenseVal = Math.round(player.stats.vitality * 0.2 + bonusDef);
    
    // Difficulty modifier for damage taken
    let adjustedAmount = amount;
    if (settings.difficulty === 'Casual') adjustedAmount *= 0.7;
    else if (settings.difficulty === 'Nightmare') adjustedAmount *= 1.4;

    const finalDmg = Math.max(2, Math.round(adjustedAmount - defenseVal));

    setPlayer(prev => ({
      ...prev,
      health: Math.max(0, prev.health - finalDmg),
    }));

    playSound('player_hit');
    
    // Screen Shake modifier
    let shakeAmt = 10;
    if (settings.screenShake === 'None') shakeAmt = 0;
    else if (settings.screenShake === 'Low') shakeAmt = 4;
    screenShakeRef.current = shakeAmt;
    spawnDamageNumber(player.x, player.y, `-${finalDmg}`, '#f43f5e');
    spawnSplashParticles(player.x, player.y, '#dc2626', 15);

    if (player.health - finalDmg <= 0) {
      onGameOver();
    }
  };

  const updateEnemiesAndAI = () => {
    // Update enemies list, filter dead ones to spawn gold/xp
    enemiesRef.current = enemiesRef.current.filter(e => {
      if (e.health <= 0) {
        // Spawn loot & progression rewards!
        playSound('chest');
        spawnSplashParticles(e.x, e.y, '#f59e0b', 15); // gold sparks
        
        // Distribute Gold & XP
        const goldVal = Math.round((Math.random() * 5 + 4) * (e.isBoss ? 15 : 1));
        
        let xpGained = e.xpReward;
        let nextXp = player.xp + xpGained;
        let nextLevel = player.level;
        let nextXpNeeded = player.xpNeeded;
        let nextStatPoints = player.statPoints;
        let selectionBoons: string[] = [];

        // Check level up
        if (nextXp >= nextXpNeeded) {
          nextLevel++;
          nextXp = nextXp - nextXpNeeded;
          nextXpNeeded = Math.round(nextXpNeeded * 1.5);
          nextStatPoints += 5; // Give 5 stat points to distribute
          playSound('levelup');
          spawnDamageNumber(player.x, player.y - 20, 'LEVEL UP!', '#eab308');

          // Choose random new boon options to select
          const allBoons = ['Vampiric Touch', "Dragon's Breath", 'Blood Shield', 'Double Cast', 'Shadow Step'];
          // Pick 3 random boons player doesn't already have, or just pick 3 random
          selectionBoons = allBoons.filter(b => !player.activeBoons.includes(b)).slice(0, 3);
          if (selectionBoons.length === 0) {
            selectionBoons = ['Vitality Surge', 'Strength Surge', 'Arcane Focus'].slice(0, 3);
          }
        }

        setPlayer(prev => ({
          ...prev,
          gold: prev.gold + goldVal,
          xp: nextXp,
          level: nextLevel,
          xpNeeded: nextXpNeeded,
          statPoints: nextStatPoints,
          levelUpBoonsToSelect: selectionBoons,
        }));

        spawnDamageNumber(e.x, e.y - 12, `+${xpGained} XP`, '#a78bfa');
        spawnDamageNumber(e.x, e.y, `+${goldVal} Gold 🪙`, '#fbbf24');

        if (e.isBoss) {
          // Epic drop!
          const bossItem = generateRandomItem(
            Math.random() < 0.5 ? 'Weapon' : 'Armor', 
            level.floorIndex
          );
          setPlayer(prev => ({
            ...prev,
            inventory: [...prev.inventory.slice(0, 14), bossItem]
          }));
          spawnDamageNumber(e.x, e.y + 12, `BOSS LOOT: ${bossItem.name}`, '#f59e0b');

          if (e.type === 'GraveDragun') {
            // Defeated final boss!
            setTimeout(() => onVictory(), 1500);
          }
        }

        return false;
      }

      // Enemy AI behaviors
      e.stateTimer--;

      const dist = Math.sqrt((player.x - e.x) ** 2 + (player.y - e.y) ** 2);
      const chaseRadius = e.isBoss ? 400 : 180;

      // Dynamic AI states
      if (e.isBoss) {
        // --- BOSS AI ALGORITHMS ---
        if (e.type === 'SkeletonKing') {
          // Skeleton King (Baron von Bone) AI
          if (e.stateTimer <= 0) {
            const r = Math.random();
            if (r < 0.35) {
              // Summon a skeletal guard minion
              e.state = 'boss_rage';
              e.stateTimer = 50;
              spawnDamageNumber(e.x, e.y - 12, "Rise, skeletal legions!", "#cbd5e1");
              if (enemiesRef.current.length < 12) {
                enemiesRef.current.push({
                  id: `skeleton_spawn_${Date.now()}_${Math.random()}`,
                  type: 'Skeleton',
                  name: 'Skeletal Minion',
                  x: e.x + (Math.random() - 0.5) * 64,
                  y: e.y + (Math.random() - 0.5) * 64,
                  size: 16,
                  health: 35,
                  maxHealth: 35,
                  damage: 8,
                  speed: 0.9,
                  xpReward: 10,
                  isBoss: false,
                  state: 'chase' as const,
                  stateTimer: 100,
                  lastAttackTime: 0,
                  attackCooldown: 70,
                  currentPhase: 1,
                  color: '#cbd5e1',
                });
              }
              playSound('stairs');
            } else if (r < 0.75) {
              // Throws multiple rotating bone projectiles
              e.state = 'attack';
              e.stateTimer = 40;
              for (let i = 0; i < 6; i++) {
                const angle = (i * Math.PI) / 3;
                projectilesRef.current.push({
                  id: `bone_proj_${Date.now()}_${i}`,
                  x: e.x,
                  y: e.y,
                  vx: Math.cos(angle) * 2.2,
                  vy: Math.sin(angle) * 2.2,
                  size: 7,
                  damage: 14,
                  isPlayer: false,
                  color: '#e2e8f0',
                  duration: 120,
                  type: 'bone',
                });
              }
              playSound('spell');
            } else {
              e.state = 'chase';
              e.stateTimer = 45;
            }
          }

          if (e.state === 'chase' && dist > 15) {
            const angle = Math.atan2(player.y - e.y, player.x - e.x);
            e.x += Math.cos(angle) * e.speed;
            e.y += Math.sin(angle) * e.speed;
            if (dist < 32 && gameFrame.current % 35 === 0) {
              damagePlayer(e.damage);
            }
          }
        } else if (e.type === 'VampireLord') {
          // Vampire Lord Boss AI
          if (e.stateTimer <= 0) {
            // Decide boss move
            const r = Math.random();
            if (r < 0.35) {
              // Teleport near player
              e.state = 'boss_teleport';
              e.stateTimer = 45;
              playSound('teleport');
              spawnSplashParticles(e.x, e.y, '#7f1d1d', 12);
              
              const angle = Math.random() * Math.PI * 2;
              const distToPl = Math.random() * 80 + 40;
              e.x = player.x + Math.cos(angle) * distToPl;
              e.y = player.y + Math.sin(angle) * distToPl;
              spawnSplashParticles(e.x, e.y, '#ef4444', 12);
            } else if (r < 0.70) {
              // Cast blood circular bat ring
              e.state = 'attack';
              e.stateTimer = 50;

              for (let i = 0; i < 8; i++) {
                const angle = (i * Math.PI) / 4;
                projectilesRef.current.push({
                  id: `lord_proj_${Date.now()}_${i}`,
                  x: e.x,
                  y: e.y,
                  vx: Math.cos(angle) * 2.2,
                  vy: Math.sin(angle) * 2.2,
                  size: 6,
                  damage: 15,
                  isPlayer: false,
                  color: '#ef4444', // Crimson Blood Orbs
                  duration: 150,
                  type: 'blood_orb',
                });
              }
              playSound('spell');
            } else {
              // Regular rapid dash and sword swipe
              e.state = 'chase';
              e.stateTimer = 60;
            }
          }

          if (e.state === 'chase' && dist > 20) {
            // Chase rapidly
            const angle = Math.atan2(player.y - e.y, player.x - e.x);
            e.x += Math.cos(angle) * e.speed * 1.5;
            e.y += Math.sin(angle) * e.speed * 1.5;

            // Attack swipe close by
            if (dist < 32 && gameFrame.current % 30 === 0) {
              damagePlayer(e.damage);
            }
          }
        } else if (e.type === 'ChimeraBeast') {
          // Chimera Beast AI
          if (e.stateTimer <= 0) {
            const r = Math.random();
            if (r < 0.45) {
              // Charging dash
              e.state = 'boss_fly';
              e.stateTimer = 40;
              spawnDamageNumber(e.x, e.y - 12, "WILDFIRE CHARGE!", "#ef4444");
              playSound('boss_roar');
            } else if (r < 0.80) {
              // Flame Breath Sweep
              e.state = 'attack';
              e.stateTimer = 55;
              const angleToPlayer = Math.atan2(player.y - e.y, player.x - e.x);
              for (let offset = -0.3; offset <= 0.3; offset += 0.3) {
                projectilesRef.current.push({
                  id: `chimera_fire_${Date.now()}_${offset}`,
                  x: e.x,
                  y: e.y,
                  vx: Math.cos(angleToPlayer + offset) * 3.6,
                  vy: Math.sin(angleToPlayer + offset) * 3.6,
                  size: 8,
                  damage: 18,
                  isPlayer: false,
                  color: '#fb923c',
                  duration: 120,
                  type: 'fireball',
                });
              }
              playSound('spell');
            } else {
              e.state = 'chase';
              e.stateTimer = 45;
            }
          }

          if (e.state === 'boss_fly') {
            // Charging extremely fast towards player
            const angle = Math.atan2(player.y - e.y, player.x - e.x);
            e.x += Math.cos(angle) * e.speed * 2.4;
            e.y += Math.sin(angle) * e.speed * 2.4;
            if (dist < 30 && gameFrame.current % 15 === 0) {
              damagePlayer(e.damage + 4);
              spawnDamageNumber(player.x, player.y - 10, "Knockback Slam!", "#ef4444");
            }
          } else if (e.state === 'chase' && dist > 15) {
            const angle = Math.atan2(player.y - e.y, player.x - e.x);
            e.x += Math.cos(angle) * e.speed;
            e.y += Math.sin(angle) * e.speed;
            if (dist < 32 && gameFrame.current % 30 === 0) {
              damagePlayer(e.damage);
            }
          }
        } else if (e.type === 'SmelterGiant') {
          // Smelter Giant AI
          if (e.stateTimer <= 0) {
            const r = Math.random();
            if (r < 0.45) {
              // Ground rupture fissure eruptions
              e.state = 'boss_rage';
              e.stateTimer = 65;
              spawnDamageNumber(e.x, e.y - 12, "MAGMA FISSURE!", "#ea580c");
              playSound('boss_roar');
            } else if (r < 0.80) {
              // Summon fire minions
              e.state = 'attack';
              e.stateTimer = 50;
              spawnDamageNumber(e.x, e.y - 12, "Stoke the Forge!", "#fbbf24");
              if (enemiesRef.current.length < 12) {
                enemiesRef.current.push({
                  id: `cultist_spawn_${Date.now()}_${Math.random()}`,
                  type: 'DragonCultist',
                  name: 'Forge Acolyte',
                  x: e.x + (Math.random() - 0.5) * 64,
                  y: e.y + (Math.random() - 0.5) * 64,
                  size: 16,
                  health: 50,
                  maxHealth: 50,
                  damage: 12,
                  speed: 1.1,
                  xpReward: 15,
                  isBoss: false,
                  state: 'chase' as const,
                  stateTimer: 100,
                  lastAttackTime: 0,
                  attackCooldown: 80,
                  currentPhase: 1,
                  color: '#ea580c',
                });
              }
              playSound('spell');
            } else {
              e.state = 'chase';
              e.stateTimer = 50;
            }
          }

          if (e.state === 'boss_rage' && gameFrame.current % 20 === 0) {
            // Lava cracks erupting directly beneath player!
            const fX = player.x;
            const fY = player.y;
            particlesRef.current.push({
              x: fX,
              y: fY,
              vx: 0, vy: 0,
              color: '#f97316',
              size: 24,
              duration: 0,
              maxDuration: 35,
              alpha: 0.6,
            });
            setTimeout(() => {
              if (gameActive && !isSheetOpen) {
                spawnSplashParticles(fX, fY, '#dc2626', 16);
                if (Math.sqrt((player.x - fX) ** 2 + (player.y - fY) ** 2) < 28) {
                  damagePlayer(25);
                }
              }
            }, 550);
          } else if (e.state === 'chase' && dist > 15) {
            const angle = Math.atan2(player.y - e.y, player.x - e.x);
            e.x += Math.cos(angle) * e.speed;
            e.y += Math.sin(angle) * e.speed;
            if (dist < 34 && gameFrame.current % 35 === 0) {
              damagePlayer(e.damage);
              spawnDamageNumber(player.x, player.y - 10, "Hammer Crush!", "#f97316");
            }
          }
        } else if (e.type === 'GraveDragun') {
          // Grave Dragon Boss AI
          if (e.stateTimer <= 0) {
            const r = Math.random();
            if (r < 0.40) {
              // Breath Sweep Fireballs
              e.state = 'attack';
              e.stateTimer = 90;
              playSound('boss_roar');
            } else if (r < 0.80) {
              // Meteor Rain strike indicators
              e.state = 'boss_rage';
              e.stateTimer = 60;
              spawnDamageNumber(e.x, e.y - 12, 'METEOR SHOWER!', '#ea580c');
            } else {
              // Idle/Fly patterns
              e.state = 'boss_fly';
              e.stateTimer = 50;
            }
          }

          // Sweep fire breath behavior
          if (e.state === 'attack' && gameFrame.current % 12 === 0) {
            const angleToPlayer = Math.atan2(player.y - e.y, player.x - e.x);
            // Sweep range of 3 fireballs
            for (let offset = -0.3; offset <= 0.3; offset += 0.3) {
              projectilesRef.current.push({
                id: `dragun_fire_${Date.now()}_${offset}`,
                x: e.x,
                y: e.y + 20,
                vx: Math.cos(angleToPlayer + offset) * 3.5,
                vy: Math.sin(angleToPlayer + offset) * 3.5,
                size: 9,
                damage: 22,
                isPlayer: false,
                color: '#f97316',
                duration: 150,
                type: 'fireball',
              });
            }
            playSound('spell');
          }

          // Meteor spawn indicators
          if (e.state === 'boss_rage' && gameFrame.current % 15 === 0) {
            // Pick a spot near player
            const metX = player.x + (Math.random() - 0.5) * 120;
            const metY = player.y + (Math.random() - 0.5) * 120;

            // Indicator particle
            particlesRef.current.push({
              x: metX,
              y: metY,
              vx: 0, vy: 0,
              color: '#ea580c',
              size: 20,
              duration: 0,
              maxDuration: 40,
              alpha: 0.4,
            });

            // Delayed explosion meteor drop
            setTimeout(() => {
              if (gameActive && !isSheetOpen) {
                // Lava splash explosion on target
                spawnSplashParticles(metX, metY, '#f97316', 12);
                if (Math.sqrt((player.x - metX) ** 2 + (player.y - metY) ** 2) < 24) {
                  damagePlayer(25);
                }
              }
            }, 650);
          }
        } else if (e.type === 'WerewolfKing') {
          // Werewolf King Boss AI
          if (e.stateTimer <= 0) {
            const r = Math.random();
            if (r < 0.35) {
              // Summon shadow werewolf minions
              e.state = 'boss_rage';
              e.stateTimer = 45;
              spawnDamageNumber(e.x, e.y - 12, "Lupine pack, hunt!", "#4b5563");
              if (enemiesRef.current.length < 12) {
                enemiesRef.current.push({
                  id: `werewolf_spawn_${Date.now()}`,
                  type: 'Werewolf',
                  name: 'Dire Werewolf',
                  x: e.x + (Math.random() - 0.5) * 64,
                  y: e.y + (Math.random() - 0.5) * 64,
                  size: 16,
                  health: 75,
                  maxHealth: 75,
                  damage: 15,
                  speed: 1.4,
                  xpReward: 25,
                  isBoss: false,
                  state: 'chase' as const,
                  stateTimer: 100,
                  lastAttackTime: 0,
                  attackCooldown: 60,
                  currentPhase: 1,
                  color: '#4b5563',
                });
              }
              playSound('boss_roar');
            } else if (r < 0.75) {
              // Leap Slash attack
              e.state = 'attack';
              e.stateTimer = 30;
              spawnDamageNumber(e.x, e.y - 12, "FEROCIOUS LUNGE!", "#ef4444");
              playSound('swing');
            } else {
              e.state = 'chase';
              e.stateTimer = 50;
            }
          }

          if (e.state === 'attack') {
            // Move fast and hit
            const angle = Math.atan2(player.y - e.y, player.x - e.x);
            e.x += Math.cos(angle) * e.speed * 2.2;
            e.y += Math.sin(angle) * e.speed * 2.2;
            if (dist < 32 && gameFrame.current % 10 === 0) {
              damagePlayer(e.damage);
              spawnSplashParticles(player.x, player.y, '#fca5a5', 10);
            }
          } else if (e.state === 'chase' && dist > 15) {
            const angle = Math.atan2(player.y - e.y, player.x - e.x);
            e.x += Math.cos(angle) * e.speed;
            e.y += Math.sin(angle) * e.speed;
            if (dist < 32 && gameFrame.current % 30 === 0) {
              damagePlayer(e.damage - 4);
            }
          }
        } else if (e.type === 'VampireNoble') {
          // Vampire Noble Boss AI
          if (e.stateTimer <= 0) {
            const r = Math.random();
            if (r < 0.40) {
              // Elegant Teleport
              e.state = 'boss_teleport';
              e.stateTimer = 25;
              playSound('teleport');
              spawnSplashParticles(e.x, e.y, '#db2777', 15);
              const angle = Math.random() * Math.PI * 2;
              e.x = player.x + Math.cos(angle) * 75;
              e.y = player.y + Math.sin(angle) * 75;
              spawnSplashParticles(e.x, e.y, '#db2777', 15);
            } else if (r < 0.80) {
              // Scepter magical bolts
              e.state = 'attack';
              e.stateTimer = 40;
              playSound('spell');
              const angle = Math.atan2(player.y - e.y, player.x - e.x);
              for (let offset = -0.2; offset <= 0.2; offset += 0.2) {
                projectilesRef.current.push({
                  id: `noble_proj_${Date.now()}_${offset}`,
                  x: e.x,
                  y: e.y,
                  vx: Math.cos(angle + offset) * 3.2,
                  vy: Math.sin(angle + offset) * 3.2,
                  size: 6,
                  damage: 18,
                  isPlayer: false,
                  color: '#ec4899', // pink magic bolts
                  duration: 120,
                  type: 'blood_orb',
                });
              }
            } else {
              e.state = 'chase';
              e.stateTimer = 40;
            }
          }

          if (e.state === 'chase' && dist > 15) {
            const angle = Math.atan2(player.y - e.y, player.x - e.x);
            e.x += Math.cos(angle) * e.speed;
            e.y += Math.sin(angle) * e.speed;
            if (dist < 28 && gameFrame.current % 30 === 0) {
              damagePlayer(e.damage);
            }
          }
        } else if (e.type === 'CountDracula') {
          // Count Dracula Boss AI
          if (e.stateTimer <= 0) {
            const r = Math.random();
            if (r < 0.35) {
              // Blood Siphon lifesteal
              e.state = 'boss_rage';
              e.stateTimer = 40;
              spawnDamageNumber(e.x, e.y - 12, "Sanguine Siphon!", "#ef4444");
              playSound('spell');
              if (dist < 150) {
                damagePlayer(20);
                const leechAmt = 40;
                e.health = Math.min(e.maxHealth, e.health + leechAmt);
                spawnDamageNumber(e.x, e.y, `+${leechAmt} HP Leeched`, '#22c55e');
                spawnSplashParticles(player.x, player.y, '#ef4444', 15);
              }
            } else if (r < 0.75) {
              // Dark bat ring
              e.state = 'attack';
              e.stateTimer = 50;
              playSound('boss_roar');
              for (let i = 0; i < 10; i++) {
                const angle = (i * Math.PI) / 5;
                projectilesRef.current.push({
                  id: `drac_bat_${Date.now()}_${i}`,
                  x: e.x,
                  y: e.y,
                  vx: Math.cos(angle) * 2.8,
                  vy: Math.sin(angle) * 2.8,
                  size: 6,
                  damage: 20,
                  isPlayer: false,
                  color: '#b91c1c',
                  duration: 120,
                  type: 'blood_orb',
                });
              }
            } else {
              e.state = 'chase';
              e.stateTimer = 45;
            }
          }

          if (e.state === 'chase' && dist > 15) {
            const angle = Math.atan2(player.y - e.y, player.x - e.x);
            e.x += Math.cos(angle) * e.speed;
            e.y += Math.sin(angle) * e.speed;
            if (dist < 32 && gameFrame.current % 28 === 0) {
              damagePlayer(e.damage);
            }
          }
        } else if (e.type === 'CthulhuSquid') {
          // Cthulhu Abyssal Squid AI
          if (e.stateTimer <= 0) {
            const r = Math.random();
            if (r < 0.35) {
              // Abyssal Wave Screen Shake and damage
              e.state = 'boss_rage';
              e.stateTimer = 50;
              spawnDamageNumber(e.x, e.y - 12, "ABYSSAL TYPHOON!", "#0d9488");
              playSound('boss_roar');
              screenShakeRef.current = 15;
              if (dist < 180) {
                damagePlayer(25);
                spawnSplashParticles(player.x, player.y, '#0d9488', 15);
              }
            } else if (r < 0.75) {
              // Teal ink spray
              e.state = 'attack';
              e.stateTimer = 55;
              playSound('spell');
              const angle = Math.atan2(player.y - e.y, player.x - e.x);
              for (let offset = -0.4; offset <= 0.4; offset += 0.2) {
                projectilesRef.current.push({
                  id: `squid_ink_${Date.now()}_${offset}`,
                  x: e.x,
                  y: e.y,
                  vx: Math.cos(angle + offset) * 2.4,
                  vy: Math.sin(angle + offset) * 2.4,
                  size: 8,
                  damage: 22,
                  isPlayer: false,
                  color: '#2dd4bf',
                  duration: 150,
                  type: 'blood_orb',
                });
              }
            } else {
              e.state = 'chase';
              e.stateTimer = 50;
            }
          }

          if (e.state === 'chase' && dist > 15) {
            const angle = Math.atan2(player.y - e.y, player.x - e.x);
            e.x += Math.cos(angle) * e.speed;
            e.y += Math.sin(angle) * e.speed;
            if (dist < 34 && gameFrame.current % 32 === 0) {
              damagePlayer(e.damage);
            }
          }
        }
      } else {
        // --- REGULAR ENEMY AI ---
        // Wake up gargoyle on approach
        if (e.type === 'Gargoyle') {
          if (dist < 100) {
            e.state = 'chase';
            e.speed = 1.2; // Awakes!
          } else {
            e.state = 'idle';
          }
        } else {
          // Regular chase/idle
          if (dist < chaseRadius) {
            e.state = 'chase';
          } else {
            e.state = 'idle';
          }
        }

        if (e.state === 'chase' || (e.type === 'Werewolf' && e.state === 'attack')) {
          // Guide path to player
          const angle = Math.atan2(player.y - e.y, player.x - e.x);
          
          // Bats, Ghosts, and Hollows can fly through walls
          const canFly = e.type === 'Bat' || e.type === 'Ghost' || e.type === 'Hollow';
          let moveSpd = e.speed;
          if (e.type === 'Werewolf' && e.state === 'attack') {
            moveSpd = e.speed * 2.8; // Leap speed!
          }
          let exNext = e.x + Math.cos(angle) * moveSpd;
          let eyNext = e.y + Math.sin(angle) * moveSpd;

          if (canFly) {
            e.x = exNext;
            e.y = eyNext;
          } else {
            // Basic tile check before sliding
            const tx = Math.floor(exNext / 32);
            const ty = Math.floor(eyNext / 32);
            if (!isWallOrSolid(tx, ty)) {
              e.x = exNext;
              e.y = eyNext;
            }
          }

          // Werewolf leap attack trigger
          if (e.type === 'Werewolf' && e.state !== 'attack' && dist > 40 && dist < 120 && gameFrame.current % 100 === 0) {
            e.state = 'attack';
            e.stateTimer = 20; // leap lasts 20 frames
            playSound('swing');
            spawnSplashParticles(e.x, e.y, '#4b5563', 6);
          }

          // Enemy attack actions
          if (dist < 22 && gameFrame.current % 45 === 0) {
            if (player.dashActiveTime <= 0) {
              if (e.type === 'BloodFiend') {
                damagePlayer(e.damage);
                screenShakeRef.current = 15; // heavy crush screen shake
                spawnSplashParticles(player.x, player.y, '#7f1d1d', 16);
                spawnDamageNumber(player.x, player.y - 12, 'CRUSH!', '#ef4444');
                playSound('hit');
              } else {
                damagePlayer(e.damage);
                if (e.type === 'Werewolf') {
                  spawnSplashParticles(player.x, player.y, '#fee2e2', 6);
                }
              }
            }
          }

          // Range attacks for Skeleton archer, Shadow Mage, and Dragon Cultist
          if (e.type === 'Skeleton' && dist > 70 && dist < 180 && gameFrame.current % 95 === 0) {
            // Shoot bone arrow projectile
            projectilesRef.current.push({
              id: `bone_${Date.now()}`,
              x: e.x,
              y: e.y,
              vx: Math.cos(angle) * 3.0,
              vy: Math.sin(angle) * 3.0,
              size: 5,
              damage: 10,
              isPlayer: false,
              color: '#e4e4e7',
              duration: 100,
              type: 'bone',
            });
            playSound('swing');
          }

          if (e.type === 'Mage' && dist > 60 && dist < 170 && gameFrame.current % 110 === 0) {
            // Shoot tracking shadow orb
            projectilesRef.current.push({
              id: `shadow_${Date.now()}`,
              x: e.x,
              y: e.y,
              vx: Math.cos(angle) * 2.0,
              vy: Math.sin(angle) * 2.0,
              size: 7,
              damage: 14,
              isPlayer: false,
              color: '#c084fc',
              duration: 120,
              type: 'shadow',
            });
            playSound('spell');
          }

          if (e.type === 'DragonCultist' && dist > 50 && dist < 160 && gameFrame.current % 85 === 0) {
            // Shoot draconic fireball projectile
            projectilesRef.current.push({
              id: `cult_fire_${Date.now()}`,
              x: e.x,
              y: e.y,
              vx: Math.cos(angle) * 3.2,
              vy: Math.sin(angle) * 3.2,
              size: 6,
              damage: 12,
              isPlayer: false,
              color: '#ea580c',
              duration: 100,
              type: 'fireball',
            });
            playSound('spell');
          }
        }
      }

      return true;
    });
  };

  const updateParticlesAndDmgNumbers = () => {
    // 1. Particles
    particlesRef.current = particlesRef.current.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.duration++;
      p.alpha = Math.max(0, 1.0 - p.duration / p.maxDuration);
      return p.duration < p.maxDuration;
    });

    // 2. Damage numbers
    damageNumbersRef.current = damageNumbersRef.current.filter(dn => {
      dn.y -= 0.4; // float up
      dn.duration++;
      return dn.duration < dn.maxDuration;
    });

    // Reduce camera shake
    if (screenShakeRef.current > 0) {
      screenShakeRef.current *= 0.9;
      if (screenShakeRef.current < 0.5) screenShakeRef.current = 0;
    }
  };

  const checkCollisionsAndTriggers = () => {
    const px = Math.floor(player.x / 32);
    const py = Math.floor(player.y / 32);

    if (px < 0 || px >= level.width || py < 0 || py >= level.height) return;

    // 1. Explore cell clear
    exploreAroundPlayer(px, py);

    // 2. Chest interaction check
    const currentTile = level.grid[py][px];
    if (currentTile.type === 'Chest') {
      currentTile.type = 'Floor'; // Opened!
      setLevel({ ...level });

      playSound('chest');
      spawnSplashParticles(player.x, player.y, '#f59e0b', 30); // Big golden burst

      // Generate random high-tier loot item!
      const itemTypes = ['Weapon', 'Armor', 'Ring', 'Relic'] as const;
      const rIdx = Math.floor(Math.random() * itemTypes.length);
      const chosenType = itemTypes[rIdx];
      const lootedItem = generateRandomItem(chosenType, level.floorIndex);

      // Add to player inventory
      setPlayer(prev => {
        const inv = [...prev.inventory];
        let alertMsg = `Looted: ${lootedItem.name}!`;
        if (inv.length < 15) {
          inv.push(lootedItem);
        } else {
          alertMsg = 'Inventory Full! Item lost.';
        }
        spawnDamageNumber(player.x, player.y - 15, alertMsg, '#eab308');
        return {
          ...prev,
          inventory: inv,
        };
      });
    }

    // 2.2 Herb stepped-on check
    if (currentTile.type === 'Herb') {
      currentTile.type = 'Floor'; // Consumed!
      setLevel({ ...level });
      playSound('levelup'); // Use healing sound cue
      spawnSplashParticles(player.x, player.y, '#22c55e', 18); // Green burst
      const healAmt = Math.round(player.maxHealth * 0.20);
      setPlayer(prev => ({
        ...prev,
        health: Math.min(prev.maxHealth, prev.health + healAmt),
      }));
      spawnDamageNumber(player.x, player.y - 12, `+${healAmt} HP (Medicinal Sage Herb) 🌿`, '#22c55e');
    }

    // 2.3 Potion stepped-on check
    if (currentTile.type === 'Potion') {
      currentTile.type = 'Floor'; // Consumed!
      setLevel({ ...level });
      playSound('spell'); // Magic potion sound cue
      spawnSplashParticles(player.x, player.y, '#3b82f6', 18); // Blue/purple burst
      const healAmt = Math.round(player.maxHealth * 0.35);
      const manaAmt = Math.round(player.maxMana * 0.50);
      setPlayer(prev => ({
        ...prev,
        health: Math.min(prev.maxHealth, prev.health + healAmt),
        mana: Math.min(prev.maxMana, prev.mana + manaAmt),
      }));
      spawnDamageNumber(player.x, player.y - 12, `Restored Vitality & Mana (Elixir Potion) 🧪`, '#3b82f6');
    }

    // 2.5 NPC interaction check
    if (currentTile.type === 'NPC') {
      // Open interactive quest branching dialogue
      playSound('spell');
      currentTile.type = 'Floor'; // Convert to floor so they don't trigger it again instantly
      setLevel({ ...level });

      if (level.floorIndex === 1) {
        setActiveDialogue({
          title: "Cyril, Arch-Mage of Embers",
          text: "Halt, traveler. My soul has been bound to these Crypts for centuries... The Draconic Bloodline is the only power capable of severing my shackles. Help me, and I shall bestow upon you ancient secrets of the Ash. But beware: magic of this tier always demands a heavy toll. Choose your path wisely.",
          options: [
            {
              text: "Purifying Sacrifice (Sacrifice 25% Current HP to receive Legendary Molten Hearthstone Relic)",
              action: () => {
                playSound('spell');
                const relicItem: Item = {
                  id: `cyril_relic_${Date.now()}`,
                  name: "Molten Hearthstone",
                  type: "Relic",
                  rarity: "Legendary",
                  description: "Forged from Cyril's ancient ashes. Boosts draconic stats.",
                  stats: {
                    arcane: 8,
                    vitality: 4,
                  },
                  icon: "crystal"
                };

                setPlayer(prev => {
                  const updatedInv = [...prev.inventory];
                  if (updatedInv.length < 15) updatedInv.push(relicItem);
                  const deduction = Math.round(prev.health * 0.25);
                  return {
                    ...prev,
                    health: Math.max(1, prev.health - deduction),
                    inventory: updatedInv,
                  };
                });

                spawnDamageNumber(player.x, player.y - 15, "Looted Molten Hearthstone!", "#fbbf24");
                setActiveDialogue(null);
              }
            },
            {
              text: "Blood Pact (Gain permanent +10 Strength, but Lose 20 Max Mana)",
              action: () => {
                playSound('spell');
                setPlayer(prev => ({
                  ...prev,
                  stats: {
                    ...prev.stats,
                    strength: prev.stats.strength + 10,
                  },
                  maxMana: Math.max(10, prev.maxMana - 20),
                  mana: Math.min(prev.mana, Math.max(10, prev.maxMana - 20)),
                }));
                spawnDamageNumber(player.x, player.y - 15, "+10 STR / -20 Max Mana 🩸", "#f43f5e");
                setActiveDialogue(null);
              }
            },
            {
              text: "Free Cyril (Heal completely to Full Health & grant active Blood Shield)",
              action: () => {
                playSound('levelup');
                setPlayer(prev => ({
                  ...prev,
                  health: prev.maxHealth,
                  shieldActive: true,
                  shieldCooldown: 0,
                }));
                spawnDamageNumber(player.x, player.y - 15, "Full Heal + Ward Shield Activated!", "#22c55e");
                setActiveDialogue(null);
              }
            }
          ]
        });
      } else if (level.floorIndex === 2) {
        setActiveDialogue({
          title: "Valerie, Crimson Blade Maiden",
          text: "Halt, slayer! I am Valerie of the Vanguard. I have tracked the high vampire nobility to this very cathedral. My sword arm is ready, but my blade requires a catalyst. If you can help me prepare, we can break through the undead ranks together. Choose how I shall aid your descent:",
          options: [
            {
              text: "Sisters in Arms (Valerie joins your quest as an active melee Sword Companion!)",
              action: () => {
                playSound('levelup');
                setPlayer(prev => ({
                  ...prev,
                  activeBoons: [...prev.activeBoons, 'Companion_SwordLady'],
                }));
                // Spawn her immediately
                if (!companionsRef.current.some(c => c.type === 'SwordLady')) {
                  companionsRef.current.push({
                    id: `companion_valerie_${Date.now()}`,
                    type: 'SwordLady',
                    name: 'Valerie, Crimson Blade Maiden',
                    x: player.x - 32,
                    y: player.y - 32,
                    size: 16,
                    speed: 2.2,
                    damage: 18 + level.floorIndex * 4,
                    lastAttackTime: 0,
                    attackCooldown: 40,
                  });
                }
                spawnDamageNumber(player.x, player.y - 15, "Valerie joined your party! ⚔️", "#ec4899");
                setActiveDialogue(null);
              }
            },
            {
              text: "Valerie's Crimson Saber (Obtain Valerie's Legendary Vanguard Greatsword)",
              action: () => {
                playSound('spell');
                const saberItem: Item = {
                  id: `valerie_saber_${Date.now()}`,
                  name: "Valerie's Crimson Saber",
                  type: "Weapon",
                  rarity: "Legendary",
                  description: "A gorgeous, heavy steel blade infused with Valerie's tactical vanguard aura.",
                  stats: {
                    damage: 28,
                    strength: 10,
                    agility: 5,
                  },
                  icon: "greatsword"
                };
                setPlayer(prev => {
                  const updatedInv = [...prev.inventory];
                  if (updatedInv.length < 15) updatedInv.push(saberItem);
                  return {
                    ...prev,
                    inventory: updatedInv,
                  };
                });
                spawnDamageNumber(player.x, player.y - 15, "Looted Valerie's Crimson Saber!", "#fbbf24");
                setActiveDialogue(null);
              }
            },
            {
              text: "War Maiden's Blessing (Gain permanent Critical Hit Senses and +12 Max HP)",
              action: () => {
                playSound('levelup');
                setPlayer(prev => ({
                  ...prev,
                  maxHealth: prev.maxHealth + 12,
                  health: prev.health + 12,
                  activeBoons: [...prev.activeBoons, 'Vanguard_Blessing'],
                }));
                spawnDamageNumber(player.x, player.y - 15, "+12 Max HP & Combat Senses! 🛡️", "#ef4444");
                setActiveDialogue(null);
              }
            }
          ]
        });
      } else if (level.floorIndex === 3) {
        setActiveDialogue({
          title: "Elysia, the Astral Sorceress",
          text: "A traveler... here in the magma depths? I am Elysia, an Astral Sorceress seeking the dormant starlight hidden within these caverns. Dracula's servants have trapped the cosmic ether. If you assist my focus, I can channel the universe's energy into your soul. What blessing do you seek?",
          options: [
            {
              text: "Cosmic Union (Elysia joins your quest as an active ranged Spell Companion!)",
              action: () => {
                playSound('levelup');
                setPlayer(prev => ({
                  ...prev,
                  activeBoons: [...prev.activeBoons, 'Companion_Sorceress'],
                }));
                // Spawn her immediately
                if (!companionsRef.current.some(c => c.type === 'Sorceress')) {
                  companionsRef.current.push({
                    id: `companion_elysia_${Date.now()}`,
                    type: 'Sorceress',
                    name: 'Elysia, Astral Sorceress',
                    x: player.x + 32,
                    y: player.y - 32,
                    size: 15,
                    speed: 1.8,
                    damage: 15 + level.floorIndex * 5,
                    lastAttackTime: 0,
                    attackCooldown: 50,
                  });
                }
                spawnDamageNumber(player.x, player.y - 15, "Elysia joined your party! 🔮", "#a855f7");
                setActiveDialogue(null);
              }
            },
            {
              text: "Astral Void Staff (Obtain Elysia's Legendary Void Weaver Staff)",
              action: () => {
                playSound('spell');
                const wandItem: Item = {
                  id: `elysia_wand_${Date.now()}`,
                  name: "Elysia's Astral Wand",
                  type: "Weapon",
                  rarity: "Legendary",
                  description: "A pulsing celestial wand forged from stardust. Channels stellar arcane cosmic currents.",
                  stats: {
                    damage: 18,
                    arcane: 12,
                    manaRegen: 3.5,
                  },
                  icon: "wand"
                };
                setPlayer(prev => {
                  const updatedInv = [...prev.inventory];
                  if (updatedInv.length < 15) updatedInv.push(wandItem);
                  return {
                    ...prev,
                    inventory: updatedInv,
                  };
                });
                spawnDamageNumber(player.x, player.y - 15, "Looted Elysia's Astral Wand!", "#fbbf24");
                setActiveDialogue(null);
              }
            },
            {
              text: "Starlight Communion (Restore 100% Mana, permanent +15 Max Mana & +10 Arcane)",
              action: () => {
                playSound('spell');
                setPlayer(prev => ({
                  ...prev,
                  maxMana: prev.maxMana + 15,
                  mana: prev.maxMana + 15,
                  stats: {
                    ...prev.stats,
                    arcane: prev.stats.arcane + 10,
                  }
                }));
                spawnDamageNumber(player.x, player.y - 15, "+15 Max Mana & +10 Arcane! ✨", "#60a5fa");
                setActiveDialogue(null);
              }
            }
          ]
        });
      } else {
        setActiveDialogue({
          title: "Lyra, Celestial Valkyrie",
          text: "Greetings, champions. The Abyssal Dragun lies ahead in the core of the volcanic Maw. If you have brought my companions Valerie or Elysia, their powers shall be fortified. For your final descent, choose the ultimate blessing of the Solar Vanguard:",
          options: [
            {
              text: "Solar Shielding (Heal to Full Health, and obtain +50 temporary Shield Ward)",
              action: () => {
                playSound('levelup');
                setPlayer(prev => ({
                  ...prev,
                  health: prev.maxHealth,
                  shieldActive: true,
                  shieldCooldown: 0,
                }));
                spawnDamageNumber(player.x, player.y - 15, "Full Heal + Solar Ward Activated!", "#f59e0b");
                setActiveDialogue(null);
              }
            },
            {
              text: "Celestial Armaments (Obtain a Legendary Valkyrie Mail Armor or Dragon Crest Relic)",
              action: () => {
                playSound('spell');
                const gearType = Math.random() < 0.5 ? 'Armor' : 'Relic';
                const gearItem: Item = gearType === 'Armor' ? {
                  id: `lyra_armor_${Date.now()}`,
                  name: "Lyra's Valkyrie Mail",
                  type: "Armor",
                  rarity: "Legendary",
                  description: "A shining set of gold-plated valkyrie battle armor.",
                  stats: {
                    defense: 12,
                    vitality: 45,
                    strength: 5,
                  },
                  icon: "mail"
                } : {
                  id: `lyra_relic_${Date.now()}`,
                  name: "Valkyrie Dragon Crest",
                  type: "Relic",
                  rarity: "Legendary",
                  description: "A sacred crest radiating golden embers. Deflects incoming curses.",
                  stats: {
                    defense: 8,
                    agility: 6,
                    vitality: 25,
                  },
                  icon: "crest"
                };

                setPlayer(prev => {
                  const updatedInv = [...prev.inventory];
                  if (updatedInv.length < 15) updatedInv.push(gearItem);
                  return {
                    ...prev,
                    inventory: updatedInv,
                  };
                });
                spawnDamageNumber(player.x, player.y - 15, `Looted: ${gearItem.name}! 🌟`, "#fbbf24");
                setActiveDialogue(null);
              }
            },
            {
              text: "Sisters in Arms (Fortify Companions: If Valerie or Elysia are with you, they gain +50% Damage!)",
              action: () => {
                playSound('levelup');
                setPlayer(prev => ({
                  ...prev,
                  activeBoons: [...prev.activeBoons, 'Companions_Fortified'],
                }));
                spawnSplashParticles(player.x, player.y, '#f59e0b', 25);
                spawnDamageNumber(player.x, player.y - 15, "Allies Fortified: +50% Companion Damage! ✊", "#fbbf24");
                setActiveDialogue(null);
              }
            }
          ]
        });
      }
    }

    // 3. Stairs trigger check
    // Stairs are unlocked when the boss of this level dies
    const isBossDeadOrMissing = enemiesRef.current.filter(e => e.isBoss).length === 0;
    if (currentTile.type === 'Stairs') {
      if (isBossDeadOrMissing) {
        onNextFloor();
      } else {
        // Inform player that stairs are guarded
        spawnDamageNumber(player.x, player.y - 12, 'Boss guards the portal stairs!', '#f43f5e');
        // bounce back player slightly
        player.x -= player.facing === 'left' ? -15 : player.facing === 'right' ? 15 : 0;
        player.y -= player.facing === 'up' ? -15 : player.facing === 'down' ? 15 : 0;
      }
    }
  };

  // --- DRAW ENGINE (HTML5 2D Canvas Renderer) ---
  const drawGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Apply scaling
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    // Camera values with screenshake
    let cx = cameraRef.current.x;
    let cy = cameraRef.current.y;
    if (screenShakeRef.current > 0) {
      cx += (Math.random() - 0.5) * screenShakeRef.current;
      cy += (Math.random() - 0.5) * screenShakeRef.current;
    }

    // Determine viewport coordinates
    const startX = Math.max(0, Math.floor(cx / 32));
    const endX = Math.min(level.width, Math.ceil((cx + dimensions.width) / 32));
    const startY = Math.max(0, Math.floor(cy / 32));
    const endY = Math.min(level.height, Math.ceil((cy + dimensions.height) / 32));

    // Theme color adjustments
    const isLavaTheme = level.floorTheme === 'DragunMaw' || level.floorTheme === 'InnerSanctum';

    // 1. Draw Grid Tiles
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const tile = level.grid[y][x];
        const screenX = x * 32 - cx;
        const screenY = y * 32 - cy;

        if (!tile.explored) {
          // Draw Pitch Black fog of war
          ctx.fillStyle = '#09090b';
          ctx.fillRect(screenX, screenY, 32, 32);
          continue;
        }

        // Draw Floors
        if (tile.type === 'Floor' || tile.type === 'Chest' || tile.type === 'Stairs' || tile.type === 'Door') {
          ctx.fillStyle = isLavaTheme ? '#1e1b18' : '#1c1917'; // Magma stone vs cool slate grey
          ctx.fillRect(screenX, screenY, 32, 32);

          // Render subtle retro brick borders
          ctx.strokeStyle = isLavaTheme ? '#2d231b' : '#292524';
          ctx.lineWidth = 1;
          ctx.strokeRect(screenX, screenY, 32, 32);
        }

        // Draw Walls
        if (tile.type === 'Wall') {
          // Double layered brick shadows
          ctx.fillStyle = isLavaTheme ? '#311b11' : '#1c1d21'; // Deep reddish brown vs Dark granite
          ctx.fillRect(screenX, screenY, 32, 32);

          // Crack detail or lighting highlight
          ctx.fillStyle = isLavaTheme ? '#5a2512' : '#272a31';
          ctx.fillRect(screenX, screenY, 32, 6);

          ctx.strokeStyle = isLavaTheme ? '#1c100a' : '#0e1013';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(screenX, screenY, 32, 32);

          // Wall Decor details
          if (tile.decoration === 'chains') {
            ctx.fillStyle = '#71717a';
            ctx.fillRect(screenX + 14, screenY + 6, 4, 18);
          } else if (tile.decoration === 'cobweb') {
            ctx.strokeStyle = '#52525b';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(screenX, screenY + 6);
            ctx.lineTo(screenX + 16, screenY + 22);
            ctx.lineTo(screenX + 32, screenY + 6);
            ctx.stroke();
          } else if (tile.decoration === 'candelabra') {
            ctx.fillStyle = '#fbbf24'; // glowing yellow flame
            ctx.beginPath();
            ctx.arc(screenX + 16, screenY + 12, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#78350f'; // brass stand
            ctx.fillRect(screenX + 14, screenY + 15, 4, 12);
          } else if (tile.decoration === 'stained_glass') {
            // Purple light
            ctx.fillStyle = '#7c3aed';
            ctx.fillRect(screenX + 8, screenY + 6, 16, 20);
          } else if (tile.decoration === 'skull') {
            ctx.fillStyle = '#e4e4e7';
            ctx.fillRect(screenX + 11, screenY + 14, 10, 8);
          }
        }

        // Draw Hazards
        if (tile.type === 'Lava') {
          // Animated scrolling magma pattern
          const pulse = Math.sin(gameFrame.current * 0.05) * 2;
          ctx.fillStyle = '#ea580c';
          ctx.fillRect(screenX, screenY, 32, 32);
          ctx.fillStyle = '#f97316';
          ctx.fillRect(screenX + 4, screenY + 4, 24 - pulse, 24 - pulse);
        } else if (tile.type === 'BloodPool') {
          const pulse = Math.sin(gameFrame.current * 0.06) * 1.5;
          ctx.fillStyle = '#7f1d1d';
          ctx.fillRect(screenX, screenY, 32, 32);
          ctx.fillStyle = '#991b1b';
          ctx.fillRect(screenX + 5, screenY + 5, 22 - pulse, 22 - pulse);
        }

        // Draw Chest
        if (tile.type === 'Chest') {
          // Closed brown trunk
          ctx.fillStyle = '#78350f';
          ctx.fillRect(screenX + 6, screenY + 10, 20, 16);
          // Golden metal lock plate
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(screenX + 14, screenY + 16, 4, 6);
          // Dark corner straps
          ctx.fillStyle = '#1c1917';
          ctx.fillRect(screenX + 8, screenY + 10, 2, 16);
          ctx.fillRect(screenX + 22, screenY + 10, 2, 16);
        }

        // Draw Stairs Nexus
        if (tile.type === 'Stairs') {
          // Dark swirling portal
          const pAngle = gameFrame.current * 0.1;
          ctx.fillStyle = '#4c1d95'; // Purple steps
          ctx.beginPath();
          ctx.arc(screenX + 16, screenY + 16, 12, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#c084fc';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(screenX + 16, screenY + 16, 12, pAngle, pAngle + Math.PI);
          ctx.stroke();
        }

        // Draw Cyril NPC (Arch-Mage)
        if (tile.type === 'NPC') {
          // Mage body
          ctx.fillStyle = '#1e1b4b'; // Deep dark violet robes
          ctx.beginPath();
          ctx.arc(screenX + 16, screenY + 20, 10, 0, Math.PI * 2);
          ctx.fill();

          // Glowing blue halo aura
          const auraPulse = Math.sin(gameFrame.current * 0.1) * 3;
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(screenX + 16, screenY + 16, 12 + auraPulse, 0, Math.PI * 2);
          ctx.stroke();

          // Robe hat
          ctx.fillStyle = '#312e81'; // Indigio hat
          ctx.beginPath();
          ctx.moveTo(screenX + 8, screenY + 14);
          ctx.lineTo(screenX + 16, screenY + 4);
          ctx.lineTo(screenX + 24, screenY + 14);
          ctx.closePath();
          ctx.fill();

          // Golden star on robe
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(screenX + 15, screenY + 18, 2, 2);

          // White long beard
          ctx.fillStyle = '#f4f4f5';
          ctx.beginPath();
          ctx.moveTo(screenX + 12, screenY + 18);
          ctx.lineTo(screenX + 16, screenY + 28);
          ctx.lineTo(screenX + 20, screenY + 18);
          ctx.fill();
        }

        // Draw Door
        if (tile.type === 'Door') {
          ctx.fillStyle = '#451a03'; // Wooden heavy door
          ctx.fillRect(screenX + 2, screenY + 2, 28, 28);
          ctx.fillStyle = '#fbbf24'; // Brass lock handle
          ctx.beginPath();
          ctx.arc(screenX + 24, screenY + 16, 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw medicinal Herbs
        if (tile.type === 'Herb') {
          // Pulse green glow
          const hPulse = Math.sin(gameFrame.current * 0.08) * 3 + 6;
          ctx.fillStyle = 'rgba(34, 197, 94, 0.15)';
          ctx.beginPath();
          ctx.arc(screenX + 16, screenY + 18, hPulse, 0, Math.PI * 2);
          ctx.fill();

          // Green stems
          ctx.fillStyle = '#16a34a';
          ctx.fillRect(screenX + 14, screenY + 12, 4, 12);
          
          // Emerald leaves
          ctx.fillStyle = '#22c55e';
          ctx.beginPath();
          ctx.ellipse(screenX + 11, screenY + 14, 4, 2, -Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.beginPath();
          ctx.ellipse(screenX + 21, screenY + 14, 4, 2, Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#86efac';
          ctx.beginPath();
          ctx.ellipse(screenX + 16, screenY + 10, 3, 2, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw magical Potions
        if (tile.type === 'Potion') {
          // Pulse blue potion glow
          const pPulse = Math.sin(gameFrame.current * 0.08) * 3 + 6;
          ctx.fillStyle = 'rgba(59, 130, 246, 0.18)';
          ctx.beginPath();
          ctx.arc(screenX + 16, screenY + 18, pPulse, 0, Math.PI * 2);
          ctx.fill();

          // Flask glass outline
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 1.5;
          ctx.fillStyle = '#1e3a8a'; // Blue potion liquid fill
          
          ctx.beginPath();
          ctx.moveTo(screenX + 12, screenY + 24);
          ctx.lineTo(screenX + 20, screenY + 24);
          ctx.lineTo(screenX + 22, screenY + 16);
          ctx.lineTo(screenX + 18, screenY + 14);
          ctx.lineTo(screenX + 18, screenY + 8);
          ctx.lineTo(screenX + 14, screenY + 8);
          ctx.lineTo(screenX + 14, screenY + 14);
          ctx.lineTo(screenX + 10, screenY + 16);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Cork stopper
          ctx.fillStyle = '#b45309';
          ctx.fillRect(screenX + 14, screenY + 6, 4, 3);

          // Potion highlight bubble
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(screenX + 13, screenY + 17, 2, 2);
        }
      }
    }

    // 2. Draw Projectiles
    projectilesRef.current.forEach(p => {
      const sx = p.x - cx;
      const sy = p.y - cy;

      // Draw swipe animations with arc slash trails
      if (p.type === 'melee_swipe' || p.type === 'whip_strike') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        // Draw an elegant swipe curve
        ctx.arc(sx, sy, p.size, 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.type === 'fissure_eruption') {
        // Draw an expanding molten fire ring
        ctx.fillStyle = 'rgba(239, 68, 68, 0.45)';
        ctx.beginPath();
        ctx.arc(sx, sy, p.size * 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(sx, sy, p.size, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(sx, sy, p.size * 0.5, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        // Spell fireball glowing rings
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(sx, sy, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Magic spark glow tail
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(sx, sy, p.size - 2, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    // 3. Draw Regular Enemies and Bosses
    enemiesRef.current.forEach(e => {
      const sx = e.x - cx;
      const sy = e.y - cy;

      // Check if enemy is in camera frame
      if (sx < -50 || sx > dimensions.width + 50 || sy < -50 || sy > dimensions.height + 50) return;

      // Draw shadow circle base
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.arc(sx, sy + e.size - 2, e.size * 0.8, 0, Math.PI * 2);
      ctx.fill();

      // Enemy styling
      if (e.type === 'Bat') {
        // Red glowing eyes + flapping wings
        ctx.fillStyle = '#1e1b4b'; // dark blue bat body
        ctx.beginPath();
        ctx.arc(sx, sy, e.size, 0, Math.PI * 2);
        ctx.fill();

        // Flapping Wing triangles
        const flap = Math.sin(gameFrame.current * 0.4) > 0 ? 10 : 2;
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.moveTo(sx - e.size, sy);
        ctx.lineTo(sx - e.size - 8, sy - flap);
        ctx.lineTo(sx, sy);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(sx + e.size, sy);
        ctx.lineTo(sx + e.size + 8, sy - flap);
        ctx.lineTo(sx, sy);
        ctx.fill();

        // Red glowing eyes
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(sx - 3, sy - 2, 2, 2);
        ctx.fillRect(sx + 1, sy - 2, 2, 2);

      } else if (e.type === 'Skeleton') {
        // White bones with metal helmet
        ctx.fillStyle = '#f4f4f5';
        ctx.beginPath();
        ctx.arc(sx, sy, e.size, 0, Math.PI * 2);
        ctx.fill();

        // Red shield/hood accents
        ctx.fillStyle = '#71717a';
        ctx.fillRect(sx - 5, sy - 8, 10, 4); // Iron crown/helm

        // Red glowing eyes
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(sx - 2, sy - 2, 1, 1.5);
        ctx.fillRect(sx + 1, sy - 2, 1, 1.5);

      } else if (e.type === 'Thrall') {
        // Pale vampire thrall with red tattered sash
        ctx.fillStyle = '#e4e4e7';
        ctx.beginPath();
        ctx.arc(sx, sy, e.size, 0, Math.PI * 2);
        ctx.fill();

        // Cloak
        ctx.fillStyle = '#450a0a';
        ctx.fillRect(sx - 4, sy + 2, 8, 8);

      } else if (e.type === 'Mage') {
        // Purple hooded shadow necromancer
        ctx.fillStyle = '#6b21a8';
        ctx.beginPath();
        ctx.arc(sx, sy, e.size, 0, Math.PI * 2);
        ctx.fill();

        // Wizard pointy hat
        ctx.fillStyle = '#4c1d95';
        ctx.beginPath();
        ctx.moveTo(sx - 6, sy - 4);
        ctx.lineTo(sx, sy - 14);
        ctx.lineTo(sx + 6, sy - 4);
        ctx.fill();

      } else if (e.type === 'BloodFiend') {
        // Heavy dark crimson blood beast
        ctx.fillStyle = '#7f1d1d';
        ctx.beginPath();
        ctx.arc(sx, sy, e.size, 0, Math.PI * 2);
        ctx.fill();

        // Draw horns
        ctx.fillStyle = '#1c1917';
        ctx.beginPath();
        ctx.moveTo(sx - 8, sy - 4);
        ctx.lineTo(sx - 14, sy - 14);
        ctx.lineTo(sx - 2, sy - 4);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(sx + 8, sy - 4);
        ctx.lineTo(sx + 14, sy - 14);
        ctx.lineTo(sx + 2, sy - 4);
        ctx.fill();

        // Beastly red glowing eyes
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(sx - 5, sy - 2, 2, 2);
        ctx.fillRect(sx + 3, sy - 2, 2, 2);

      } else if (e.type === 'DragonCultist') {
        // Orange and charcoal hooded dragon worshipper
        ctx.fillStyle = '#c2410c'; // magma orange
        ctx.beginPath();
        ctx.arc(sx, sy, e.size, 0, Math.PI * 2);
        ctx.fill();

        // Draw dark hood cowl
        ctx.fillStyle = '#1c1917';
        ctx.beginPath();
        ctx.arc(sx, sy, e.size - 4, 0, Math.PI, true);
        ctx.fill();

        // Tiny glowing magma staff in hand
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(sx + 8, sy + 8);
        ctx.lineTo(sx + 14, sy - 6);
        ctx.stroke();

        // Glowing fire orb on top of staff
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.arc(sx + 14, sy - 6, 4, 0, Math.PI * 2);
        ctx.fill();

      } else if (e.type === 'Werewolf') {
        // Charcoal wolf body
        ctx.fillStyle = '#374151';
        ctx.beginPath();
        ctx.arc(sx, sy, e.size, 0, Math.PI * 2);
        ctx.fill();

        // Wolf ears
        ctx.fillStyle = '#1f2937';
        ctx.beginPath();
        ctx.moveTo(sx - 6, sy - 6);
        ctx.lineTo(sx - 10, sy - 16);
        ctx.lineTo(sx - 2, sy - 8);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(sx + 6, sy - 6);
        ctx.lineTo(sx + 10, sy - 16);
        ctx.lineTo(sx + 2, sy - 8);
        ctx.fill();

        // Wolf Snout / nose
        ctx.fillStyle = '#111827';
        ctx.fillRect(sx - 3, sy + 1, 6, 5);

        // Glowing yellow feral eyes
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(sx - 4, sy - 2, 1.5, 1.5);
        ctx.fillRect(sx + 2.5, sy - 2, 1.5, 1.5);

      } else if (e.type === 'SkeletonKing') {
        // Baron von Bone - Skeletal Lord model
        // Large dark iron cape
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(sx - 14, sy - 2, 28, 20);

        // Giant skull head
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(sx, sy, e.size, 0, Math.PI * 2);
        ctx.fill();

        // Crown of Bones
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.moveTo(sx - 12, sy - 8);
        ctx.lineTo(sx - 8, sy - 18);
        ctx.lineTo(sx - 3, sy - 10);
        ctx.lineTo(sx, sy - 20);
        ctx.lineTo(sx + 3, sy - 10);
        ctx.lineTo(sx + 8, sy - 18);
        ctx.lineTo(sx + 12, sy - 8);
        ctx.fill();

        // Deep blue void eyes with red pinprick pupils
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(sx - 5, sy - 3, 3, 3);
        ctx.fillRect(sx + 2, sy - 3, 3, 3);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(sx - 4, sy - 2, 1, 1);
        ctx.fillRect(sx + 3, sy - 2, 1, 1);

      } else if (e.type === 'VampireLord') {
        // Vlad Vampire Boss
        ctx.fillStyle = '#450a0a'; // blood velvet cape
        ctx.fillRect(sx - 16, sy - 4, 32, 24);

        // Noble collar/face
        ctx.fillStyle = '#f4f4f5';
        ctx.beginPath();
        ctx.arc(sx, sy, e.size, 0, Math.PI * 2);
        ctx.fill();

        // Gothic Crown
        ctx.fillStyle = '#1c1917';
        ctx.beginPath();
        ctx.moveTo(sx - 10, sy - 8);
        ctx.lineTo(sx - 6, sy - 16);
        ctx.lineTo(sx, sy - 10);
        ctx.lineTo(sx + 6, sy - 16);
        ctx.lineTo(sx + 10, sy - 8);
        ctx.fill();

        // Glowing crimson eyes
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(sx - 4, sy - 2, 2, 2);
        ctx.fillRect(sx + 2, sy - 2, 2, 2);

      } else if (e.type === 'ChimeraBeast') {
        // Ash-Wing Chimera model
        // Draw lion-mane flame aura
        const flare = Math.sin(gameFrame.current * 0.15) * 4;
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.arc(sx, sy, e.size + flare, 0, Math.PI * 2);
        ctx.fill();

        // Chimera body
        ctx.fillStyle = '#1e1b18';
        ctx.beginPath();
        ctx.arc(sx, sy, e.size - 2, 0, Math.PI * 2);
        ctx.fill();

        // Flaming wings
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.moveTo(sx - 16, sy);
        ctx.lineTo(sx - 36, sy - 10);
        ctx.lineTo(sx, sy + 6);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(sx + 16, sy);
        ctx.lineTo(sx + 36, sy - 10);
        ctx.lineTo(sx, sy + 6);
        ctx.fill();

        // Horns
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.moveTo(sx - 6, sy - 10);
        ctx.lineTo(sx - 12, sy - 22);
        ctx.lineTo(sx, sy - 10);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(sx + 6, sy - 10);
        ctx.lineTo(sx + 12, sy - 22);
        ctx.lineTo(sx, sy - 10);
        ctx.fill();

        // Slit green beast eyes
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(sx - 6, sy - 3, 2, 3);
        ctx.fillRect(sx + 4, sy - 3, 2, 3);

      } else if (e.type === 'SmelterGiant') {
        // Ignis Smelter Giant model
        // Large molten dark steel shoulders
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(sx - 24, sy - 4, 48, 16);

        // Core furnace head
        ctx.fillStyle = '#374151';
        ctx.beginPath();
        ctx.arc(sx, sy, e.size, 0, Math.PI * 2);
        ctx.fill();

        // Glowing center furnace core
        const corePulse = Math.abs(Math.sin(gameFrame.current * 0.08)) * 8;
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.arc(sx, sy + 2, 6 + corePulse / 2, 0, Math.PI * 2);
        ctx.fill();

        // Molten cracks
        ctx.fillStyle = '#f97316';
        ctx.fillRect(sx - 12, sy - 12, 4, 4);
        ctx.fillRect(sx + 8, sy - 12, 4, 4);

        // Heavy Stone Hammer in hand
        ctx.strokeStyle = '#4b5563';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(sx + 16, sy + 12);
        ctx.lineTo(sx + 28, sy - 16);
        ctx.stroke();

        ctx.fillStyle = '#1f2937'; // hammer head
        ctx.fillRect(sx + 22, sy - 24, 12, 12);

      } else if (e.type === 'Zombie') {
        // Rotting green zombie
        ctx.fillStyle = '#166534'; // rotting green flesh
        ctx.beginPath();
        ctx.arc(sx, sy, e.size, 0, Math.PI * 2);
        ctx.fill();

        // Tattered clothes collar
        ctx.fillStyle = '#78350f'; // decayed brown rags
        ctx.fillRect(sx - 6, sy + 3, 12, 4);

        // Glowing dull-yellow eyes
        ctx.fillStyle = '#fde047';
        ctx.fillRect(sx - 3, sy - 2, 1.5, 1.5);
        ctx.fillRect(sx + 1.5, sy - 2, 1.5, 1.5);

      } else if (e.type === 'Ghost') {
        // Translucent floating phantom
        const originalAlpha = ctx.globalAlpha;
        const hoverOffset = Math.sin(gameFrame.current * 0.1) * 3;
        ctx.globalAlpha = originalAlpha * (0.5 + Math.sin(gameFrame.current * 0.1) * 0.15);

        // Spectral blue body
        ctx.fillStyle = '#93c5fd';
        ctx.beginPath();
        ctx.arc(sx, sy + hoverOffset, e.size, Math.PI, 0); // Rounded head
        ctx.lineTo(sx + e.size, sy + hoverOffset + 12); // Right side
        // Wavy ghost tail
        const wave = Math.sin(gameFrame.current * 0.15) * 4;
        ctx.lineTo(sx + e.size / 2 + wave, sy + hoverOffset + 6);
        ctx.lineTo(sx + wave, sy + hoverOffset + 14);
        ctx.lineTo(sx - e.size / 2 + wave, sy + hoverOffset + 6);
        ctx.lineTo(sx - e.size, sy + hoverOffset + 12); // Left side
        ctx.closePath();
        ctx.fill();

        // Cold blue glowing eyes
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(sx - 3, sy + hoverOffset - 1, 1.5, 1.5);
        ctx.fillRect(sx + 1.5, sy + hoverOffset - 1, 1.5, 1.5);

        ctx.globalAlpha = originalAlpha;

      } else if (e.type === 'Hollow') {
        // Translucent purple void shadow
        const originalAlpha = ctx.globalAlpha;
        const hoverOffset = Math.sin(gameFrame.current * 0.08) * 2;
        ctx.globalAlpha = originalAlpha * (0.45 + Math.sin(gameFrame.current * 0.12) * 0.1);

        // Dark amethyst shadow form
        ctx.fillStyle = '#701a75';
        ctx.beginPath();
        ctx.arc(sx, sy + hoverOffset, e.size, 0, Math.PI * 2);
        ctx.fill();

        // Whisping shadow tendrils
        ctx.fillStyle = '#4a044e';
        ctx.beginPath();
        ctx.arc(sx - 4, sy + hoverOffset + 8, 4, 0, Math.PI * 2);
        ctx.arc(sx + 4, sy + hoverOffset + 8, 4, 0, Math.PI * 2);
        ctx.arc(sx, sy + hoverOffset + 12, 3, 0, Math.PI * 2);
        ctx.fill();

        // Crimson void glowing eyes
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(sx - 4, sy + hoverOffset - 2, 2, 2);
        ctx.fillRect(sx + 2, sy + hoverOffset - 2, 2, 2);

        ctx.globalAlpha = originalAlpha;

      } else if (e.type === 'WerewolfKing') {
        // Epic Alpha Werewolf Boss
        // Big dark werewolf shoulders/mane
        const breathing = Math.sin(gameFrame.current * 0.1) * 1.5;
        ctx.fillStyle = '#0f172a'; // midnight navy
        ctx.fillRect(sx - 20, sy, 40, 16);

        // Wolf head
        ctx.fillStyle = '#1e293b'; // slate fur
        ctx.beginPath();
        ctx.arc(sx, sy, e.size + breathing, 0, Math.PI * 2);
        ctx.fill();

        // Alpha horns/ears
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.moveTo(sx - 10, sy - 10);
        ctx.lineTo(sx - 18, sy - 28);
        ctx.lineTo(sx - 3, sy - 14);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(sx + 10, sy - 10);
        ctx.lineTo(sx + 18, sy - 28);
        ctx.lineTo(sx + 3, sy - 14);
        ctx.fill();

        // Long beastly snout
        ctx.fillStyle = '#020617';
        ctx.fillRect(sx - 5, sy + 2, 10, 8);

        // Giant glowing yellow eyes
        ctx.fillStyle = '#facc15';
        ctx.fillRect(sx - 7, sy - 4, 3, 3);
        ctx.fillRect(sx + 4, sy - 4, 3, 3);

        // White protruding fangs
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(sx - 4, sy + 8, 1.5, 3);
        ctx.fillRect(sx + 2.5, sy + 8, 1.5, 3);

      } else if (e.type === 'VampireNoble') {
        // Humanoid vampire noble
        // Elegant pink/magenta royalty cape
        ctx.fillStyle = '#be185d';
        ctx.fillRect(sx - 15, sy - 2, 30, 24);

        // Pale face
        ctx.fillStyle = '#fff1f2';
        ctx.beginPath();
        ctx.arc(sx, sy, e.size, 0, Math.PI * 2);
        ctx.fill();

        // Long elegant dark hair
        ctx.fillStyle = '#1c1917';
        ctx.beginPath();
        ctx.moveTo(sx - 10, sy - 8);
        ctx.lineTo(sx, sy - 16);
        ctx.lineTo(sx + 10, sy - 8);
        ctx.lineTo(sx + 10, sy + 6);
        ctx.lineTo(sx - 10, sy + 6);
        ctx.closePath();
        ctx.fill();

        // Pale skin showing on face
        ctx.fillStyle = '#ffe4e6';
        ctx.beginPath();
        ctx.arc(sx, sy + 1, e.size - 6, 0, Math.PI * 2);
        ctx.fill();

        // Elegant crimson eyes
        ctx.fillStyle = '#e11d48';
        ctx.fillRect(sx - 4, sy - 1, 2, 2);
        ctx.fillRect(sx + 2, sy - 1, 2, 2);

        // Holding a glowing blood-scepter
        ctx.strokeStyle = '#d97706'; // gold staff
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(sx - 12, sy + 14);
        ctx.lineTo(sx - 20, sy - 4);
        ctx.stroke();

        ctx.fillStyle = '#f43f5e'; // ruby crystal
        ctx.beginPath();
        ctx.arc(sx - 20, sy - 4, 4, 0, Math.PI * 2);
        ctx.fill();

      } else if (e.type === 'CountDracula') {
        // Giant Count Dracula Boss
        // Blood velvet cape with high Dracula collar
        ctx.fillStyle = '#450a0a'; // Red lining
        ctx.fillRect(sx - 18, sy - 6, 36, 26);
        
        ctx.fillStyle = '#030712'; // Black outer cape
        ctx.fillRect(sx - 20, sy, 40, 24);

        // Dracula high collars flanking ears
        ctx.fillStyle = '#b91c1c';
        ctx.beginPath();
        ctx.moveTo(sx - 14, sy);
        ctx.lineTo(sx - 22, sy - 20);
        ctx.lineTo(sx - 8, sy - 6);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(sx + 14, sy);
        ctx.lineTo(sx + 22, sy - 20);
        ctx.lineTo(sx + 8, sy - 6);
        ctx.fill();

        // Elegant white face
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(sx, sy, e.size, 0, Math.PI * 2);
        ctx.fill();

        // Dracula widow's peak hair
        ctx.fillStyle = '#030712';
        ctx.beginPath();
        ctx.moveTo(sx - 12, sy - 10);
        ctx.quadraticCurveTo(sx, sy - 14, sx, sy - 6);
        ctx.quadraticCurveTo(sx, sy - 14, sx + 12, sy - 10);
        ctx.lineTo(sx + 12, sy - 18);
        ctx.lineTo(sx - 12, sy - 18);
        ctx.closePath();
        ctx.fill();

        // Glowing crimson vampire slit eyes
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(sx - 5, sy - 2, 2.5, 2.5);
        ctx.fillRect(sx + 2.5, sy - 2, 2.5, 2.5);

      } else if (e.type === 'CthulhuSquid') {
        // Cthulhu Abyssal Tentacled Squid Boss
        // Bulbous abyssal green alien head
        const headBreathing = Math.sin(gameFrame.current * 0.08) * 3;
        ctx.fillStyle = '#0d9488'; // deep teal
        ctx.beginPath();
        ctx.arc(sx, sy - 4, e.size + headBreathing, 0, Math.PI * 2);
        ctx.fill();

        // Eerie yellow squid slit eyes
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(sx - 8, sy - 6, 4, 2);
        ctx.fillRect(sx + 4, sy - 6, 4, 2);
        ctx.fillStyle = '#0f172a'; // black slit pupil
        ctx.fillRect(sx - 7, sy - 6, 2, 2);
        ctx.fillRect(sx + 5, sy - 6, 2, 2);

        // Procedural moving squid tentacles!
        ctx.strokeStyle = '#0f766e';
        ctx.lineWidth = 4.5;
        const tentacleCount = 6;
        for (let i = 0; i < tentacleCount; i++) {
          const indexOffset = (i / (tentacleCount - 1)) * Math.PI - Math.PI / 2;
          const targetAngle = Math.PI / 2 + indexOffset * 0.8;
          const length = 28;
          const waveAmp = 5;
          const waveFreq = 0.15;
          const currentWave = Math.sin(gameFrame.current * 0.12 + i * 2) * waveAmp;

          ctx.beginPath();
          ctx.moveTo(sx + Math.sin(indexOffset) * 10, sy + 4);
          
          // Bezier control point for squiggly tentacle paths
          const ctrlX = sx + Math.cos(targetAngle) * (length / 2) + currentWave;
          const ctrlY = sy + Math.sin(targetAngle) * (length / 2) + 4;
          const endX = sx + Math.cos(targetAngle) * length + currentWave * 1.5;
          const endY = sy + Math.sin(targetAngle) * length;

          ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
          ctx.stroke();

          // Suction cup details
          ctx.fillStyle = '#2dd4bf';
          ctx.beginPath();
          ctx.arc(endX, endY, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

      } else if (e.type === 'GraveDragun') {
        // Epic Giant Scaled Dragon
        ctx.fillStyle = '#1e1b18'; // Charcoal Dragon Wings
        const wingFlap = Math.sin(gameFrame.current * 0.1) * 20;
        
        ctx.beginPath();
        ctx.moveTo(sx - 24, sy);
        ctx.lineTo(sx - 64, sy - wingFlap);
        ctx.lineTo(sx, sy + 10);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(sx + 24, sy);
        ctx.lineTo(sx + 64, sy - wingFlap);
        ctx.lineTo(sx, sy + 10);
        ctx.fill();

        // Core Dragon Head
        ctx.fillStyle = '#dc2626'; // Molten scales
        ctx.beginPath();
        ctx.arc(sx, sy, e.size, 0, Math.PI * 2);
        ctx.fill();

        // Scaled horn indicators
        ctx.fillStyle = '#1e1b18';
        ctx.beginPath();
        ctx.moveTo(sx - 12, sy - 15);
        ctx.lineTo(sx - 24, sy - 34);
        ctx.lineTo(sx, sy - 15);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(sx + 12, sy - 15);
        ctx.lineTo(sx + 24, sy - 34);
        ctx.lineTo(sx, sy - 15);
        ctx.fill();

        // Glowing yellow reptilian slit eyes
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(sx - 8, sy - 4, 3, 4);
        ctx.fillRect(sx + 5, sy - 4, 3, 4);
      } else {
        // General default circle fallback
        ctx.fillStyle = e.color;
        ctx.beginPath();
        ctx.arc(sx, sy, e.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Enemy HP Bar
      const hpBarW = e.size * 2;
      const hpPercent = e.health / e.maxHealth;
      ctx.fillStyle = '#18181b';
      ctx.fillRect(sx - e.size, sy - e.size - 10, hpBarW, 4);
      ctx.fillStyle = e.isBoss ? '#ea580c' : '#ef4444'; // Orange for boss, red for regular
      ctx.fillRect(sx - e.size, sy - e.size - 10, hpBarW * hpPercent, 4);
    });

    // 4. Draw Player
    const psx = player.x - cx;
    const psy = player.y - cy;

    // Draw shadow under player
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.arc(psx, psy + 10, 12, 0, Math.PI * 2);
    ctx.fill();

    // Invincibility flashing flicker
    const isInvincible = player.dashActiveTime > 0;
    if (!isInvincible || gameFrame.current % 4 !== 0) {
      
      // 1. Cape (drawn behind body)
      ctx.fillStyle = player.customization?.capeColor || '#991b1b';
      ctx.beginPath();
      ctx.arc(psx, psy + 4, player.size * 0.9, 0, Math.PI * 2);
      ctx.fill();

      // 2. Body / Torso (Armor dependent color representation)
      let bodyColor = '#3b82f6';
      if (player.equipped.Armor) {
        if (player.equipped.Armor.rarity === 'Legendary') bodyColor = '#fbbf24';
        else if (player.equipped.Armor.rarity === 'Epic') bodyColor = '#c084fc';
        else if (player.equipped.Armor.rarity === 'Rare') bodyColor = '#60a5fa';
        else bodyColor = '#a1a1aa';
      } else {
        if (player.class === 'VampireHunter') bodyColor = '#2563eb';
        else if (player.class === 'RenegadeVampire') bodyColor = '#881337';
        else bodyColor = '#3f3f46';
      }
      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.arc(psx, psy, player.size * 0.85, 0, Math.PI * 2);
      ctx.fill();

      // 3. Head / Face complexion
      ctx.fillStyle = player.customization?.skinColor || '#f5f5f4';
      ctx.beginPath();
      ctx.arc(psx, psy - 4, 6, 0, Math.PI * 2);
      ctx.fill();

      // 4. Hair / Cowl / Plume selection
      ctx.fillStyle = player.customization?.hairColor || '#1c1917';
      const hairStyle = player.customization?.hairStyle || 'Slayer Hood';
      if (hairStyle.includes('Helmet')) {
        // Draw helmet shape
        ctx.beginPath();
        ctx.moveTo(psx - 6, psy - 9);
        ctx.lineTo(psx + 6, psy - 9);
        ctx.lineTo(psx, psy - 15);
        ctx.closePath();
        ctx.fill();
        // Feather plume on helmet
        ctx.fillStyle = player.customization?.hairColor || '#dc2626';
        ctx.fillRect(psx - 2, psy - 18, 4, 4);
      } else if (hairStyle.includes('Hood')) {
        // Draw hood cowl draping down
        ctx.beginPath();
        ctx.arc(psx, psy - 5, 7, Math.PI, 0);
        ctx.lineTo(psx + 7, psy);
        ctx.lineTo(psx - 7, psy);
        ctx.closePath();
        ctx.fill();
      } else {
        // Draw normal hair locks
        ctx.fillRect(psx - 5, psy - 10, 10, 4); // cap/bandana base
        // hanging locks
        ctx.fillRect(psx - 6, psy - 8, 2, 6);
        ctx.fillRect(psx + 4, psy - 8, 2, 6);
      }

      // 5. Eye Gaze Glow
      ctx.fillStyle = player.customization?.eyeColor || '#ef4444';
      ctx.fillRect(psx - 3, psy - 5, 1.5, 1.5);
      ctx.fillRect(psx + 1.5, psy - 5, 1.5, 1.5);

      // 6. Draw Weapon (color representation depending on weapon tier)
      if (player.equipped.Weapon) {
        let weaponColor = '#94a3b8';
        if (player.equipped.Weapon.rarity === 'Legendary') weaponColor = '#fbbf24';
        else if (player.equipped.Weapon.rarity === 'Epic') weaponColor = '#c084fc';
        else if (player.equipped.Weapon.rarity === 'Rare') weaponColor = '#60a5fa';

        ctx.strokeStyle = weaponColor;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        
        let wx = psx;
        let wy = psy;
        if (player.facing === 'left') { wx -= 14; wy += 2; }
        else if (player.facing === 'right') { wx += 14; wy += 2; }
        else if (player.facing === 'up') { wy -= 14; }
        else if (player.facing === 'down') { wy += 14; }

        ctx.moveTo(psx, psy);
        ctx.lineTo(wx, wy);
        ctx.stroke();

        // Draw dynamic weapon hilt/crossguard
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect((psx + wx) / 2 - 1.5, (psy + wy) / 2 - 1.5, 3, 3);
      }

      // Active Blood shield visual overlay
      if (player.shieldActive) {
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(psx, psy, player.size + 6, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // 5. Draw Particles
    particlesRef.current.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x - cx, p.y - cy, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // 6. Draw Damage & Alert Numbers
    ctx.textAlign = 'center';
    ctx.font = 'bold 11px monospace';
    damageNumbersRef.current.forEach(dn => {
      const alpha = Math.max(0, 1.0 - dn.duration / dn.maxDuration);
      ctx.fillStyle = dn.color;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillText(dn.text, dn.x - cx, dn.y - cy);
      ctx.restore();
    });
  };

  const makeTouchBtn = (key: string, label: string | React.ReactNode, className: string) => {
    return (
      <button
        onMouseDown={() => simulateKeyStart(key)}
        onMouseUp={() => simulateKeyEnd(key)}
        onMouseLeave={() => simulateKeyEnd(key)}
        onTouchStart={(e) => { e.preventDefault(); simulateKeyStart(key); }}
        onTouchEnd={(e) => { e.preventDefault(); simulateKeyEnd(key); }}
        className={`${className} select-none touch-none active:scale-90 transition-transform duration-100 font-bold border rounded-lg flex items-center justify-center`}
      >
        {label}
      </button>
    );
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full min-h-[400px] rounded-xl border border-red-950/40 bg-zinc-950 overflow-hidden shadow-2xl flex flex-col justify-between"
    >
      {/* Visual filter shaders inside canvas area */}
      {settings.crtScanlines && <div className="crt-scanlines" />}
      {settings.crtScanlines && <div className="crt-glow" />}
      {settings.pixelVignette && <div className="crt-vignette" />}

      {/* Branching Dialogue Overlay */}
      {activeDialogue && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-zinc-950 border-2 border-red-950/80 rounded-xl p-6 shadow-2xl shadow-red-950/40 relative font-sans text-zinc-100 flex flex-col gap-4">
            {/* Visual Gothic Trim */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-950 px-4 py-1 rounded-full border border-red-800 text-[10px] text-red-200 uppercase tracking-widest font-bold font-mono">
              Encounter
            </div>

            <div className="flex flex-col gap-1 border-b border-zinc-800/80 pb-3">
              <h2 className="text-xl font-bold text-red-500 tracking-tight flex items-center gap-2">
                ☩ {activeDialogue.title}
              </h2>
              <span className="text-zinc-500 font-mono text-[10px] uppercase tracking-wider">
                Gothic Story Questline
              </span>
            </div>

            <p className="text-sm text-zinc-300 leading-relaxed italic border-l-2 border-red-950/80 pl-3">
              "{activeDialogue.text}"
            </p>

            <div className="flex flex-col gap-2.5 mt-2">
              {activeDialogue.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={opt.action}
                  className="w-full text-left text-xs bg-zinc-900 hover:bg-red-950/40 border border-zinc-800 hover:border-red-800/80 text-zinc-300 hover:text-white p-3.5 rounded-lg font-medium transition-all duration-200 shadow-sm active:scale-[0.99] flex items-center justify-between group"
                >
                  <span>{opt.text}</span>
                  <span className="text-[10px] text-zinc-600 group-hover:text-red-400 font-mono">
                    Select ➔
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="relative flex-1 w-full h-full overflow-hidden">
        <canvas 
          ref={canvasRef} 
          width={dimensions.width} 
          height={dimensions.height}
          className="block cursor-crosshair w-full h-full"
        />

        {/* Floating keyboard helper - only show on larger screens when virtual buttons are off */}
        {!settings.showOnScreenButtons && (
          <div className="absolute bottom-4 left-4 z-10 bg-zinc-950/80 border border-zinc-800/80 p-3 rounded-lg flex gap-4 font-mono text-xs text-zinc-400 backdrop-blur-md">
            <div className="flex flex-col gap-1">
              <span className="text-zinc-600 text-[10px] uppercase">Controls</span>
              <span className="text-zinc-300"><b>WASD</b> / Move</span>
              <span className="text-zinc-300"><b>Space</b> / Attack</span>
            </div>
            <div className="flex flex-col gap-1 border-l border-zinc-800/80 pl-4">
              <span className="text-zinc-600 text-[10px] uppercase">Skills & Spells</span>
              <span className="text-zinc-300"><b>Shift</b> / Dash</span>
              <span className="text-zinc-300"><b>Q</b> / Fireball</span>
              <span className="text-zinc-300"><b>E</b> / Magma Fissure</span>
            </div>
          </div>
        )}

        {/* Mini Legend HUD */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 bg-zinc-950/80 border border-zinc-800/80 p-3 rounded-lg font-mono text-xs text-zinc-400 backdrop-blur-md">
          <span className="text-zinc-500 text-[10px] uppercase tracking-wider block">Target Indicators</span>
          <div className="flex items-center gap-2">
            <span className="text-sm">📦</span> <span>Open Chests for Loot</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">🌌</span> <span>Stairs/Portals progress floor</span>
          </div>
        </div>
      </div>

      {/* On-Screen Touch D-Pad and Action Buttons Overlay */}
      {settings.showOnScreenButtons && (
        <div className="z-20 bg-zinc-950/90 border-t border-zinc-900 p-4 grid grid-cols-12 gap-4 items-center font-mono select-none">
          
          {/* Movement Section (D-Pad Grid) */}
          <div className="col-span-5 sm:col-span-4 flex items-center justify-center">
            <div className="grid grid-cols-3 gap-1.5 w-36 h-28 relative">
              <div />
              {makeTouchBtn('w', '▲', 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 active:bg-red-950 active:border-red-600 h-10')}
              <div />

              {makeTouchBtn('a', '◀', 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 active:bg-red-950 active:border-red-600 h-10')}
              {makeTouchBtn('s', '▼', 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 active:bg-red-950 active:border-red-600 h-10')}
              {makeTouchBtn('d', '▶', 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 active:bg-red-950 active:border-red-600 h-10')}
            </div>
          </div>

          {/* Tips / Center label */}
          <div className="hidden sm:flex col-span-4 flex-col gap-1 text-center text-[10px] text-zinc-500 justify-center h-full border-x border-zinc-900 px-4">
            <span className="text-red-500 font-bold uppercase tracking-wider">Virtual Control Deck</span>
            <span>Use the arrows to walk. Tap Action buttons to strike, roll, and cast fireball / magma fissure spells.</span>
          </div>

          {/* Action Buttons (Strike, Dash, Spells) */}
          <div className="col-span-7 sm:col-span-4 flex items-center justify-center gap-1.5">
            {/* Fireball Projectile (Q) */}
            <div className="flex flex-col items-center gap-1">
              {makeTouchBtn('q', '🔮', 'w-10 h-10 rounded-full bg-purple-950/40 border-purple-800 text-white active:bg-purple-600 text-sm shadow-lg shadow-purple-950/30')}
              <span className="text-[7px] text-purple-400">FLAME (Q)</span>
            </div>

            {/* Magma Fissure (E) */}
            <div className="flex flex-col items-center gap-1">
              {makeTouchBtn('e', '🌋', 'w-10 h-10 rounded-full bg-amber-950/40 border-amber-800 text-white active:bg-amber-600 text-sm shadow-lg shadow-amber-950/30')}
              <span className="text-[7px] text-amber-400">FISSURE (E)</span>
            </div>

            {/* Dash / Roll (Shift) */}
            <div className="flex flex-col items-center gap-1">
              {makeTouchBtn('shift', '👣', 'w-10 h-10 rounded-full bg-blue-950/40 border-blue-800 text-white active:bg-blue-600 text-sm shadow-lg shadow-blue-950/30')}
              <span className="text-[7px] text-blue-400">DASH (SFT)</span>
            </div>

            {/* Main Attack (Spacebar) */}
            <div className="flex flex-col items-center gap-1">
              {makeTouchBtn(' ', '⚔️ ATK', 'w-16 h-10 rounded-lg bg-gradient-to-b from-red-800 to-red-600 border-red-700 text-white text-[10px] active:from-red-600 active:to-red-400 shadow-lg shadow-red-950/50 uppercase tracking-wider')}
              <span className="text-[7px] text-red-400">MELEE (SPC)</span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
