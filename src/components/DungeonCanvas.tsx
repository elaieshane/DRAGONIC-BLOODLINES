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
  Faction,
  Rarity,
  GameSettings
} from '../types';
import { playSound } from './SoundEffects';
import { generateRandomItem } from '../utils/procedural';
import { EnemyFactory } from '../entities/EnemyFactory';
import { AISystem } from '../systems/AISystem';
import { CombatSystem } from '../systems/CombatSystem';
import { GameManager } from '../managers/GameManager';
import { generateEnvironment, EnvironmentMap } from './CraftPixEnvironment';
import { getEnvironmentAssetURL, getEnvironmentAssetURLs, loadAsset } from '../utils/craftpix';

const mapFloorTheme = (floorTheme: LevelData['floorTheme']): 'dungeon' | 'ruins' | 'cursed' | 'undead' => {
  switch (floorTheme) {
    case 'DragonNest':
    case 'VolcanicWastes':
    case 'EternalThrone':
    case 'FrankensteinLab':
      return 'cursed';
    case 'CrimsonGraveyard':
    case 'NecromancerTower':
    case 'GhoulSwamp':
    case 'CrocodileSewers':
    case 'HauntedVillage':
    case 'RoyalVampirePalace':
      return 'undead';
    case 'ForgottenLibrary':
    case 'ForsakenCathedral':
    case 'AbandonedMines':
    case 'BlackKnightFortress':
    case 'BloodForest':
    case 'FrozenMountain':
      return 'ruins';
    default:
      return 'dungeon';
  }
};

const getCraftPixTileColor = (type: string, theme: string): string => {
  const colors: Record<string, Record<string, string>> = {
    dungeon: {
      floor: '#5a4a3a',
      wall: '#3d2817',
      water: '#1a4d7f',
      lava: '#8b0000',
      decoration: '#8b6f47',
      door: '#8b4513',
      trap: '#cc0000',
      chest: '#d4af37',
      empty: '#2a2a2a',
    },
    ruins: {
      floor: '#6b6b6b',
      wall: '#4a4a4a',
      water: '#2d5f8d',
      lava: '#cc5500',
      decoration: '#9b9b9b',
      door: '#8b6914',
      trap: '#ff4444',
      chest: '#ffd700',
      empty: '#3a3a3a',
    },
    cursed: {
      floor: '#3a3a4a',
      wall: '#2a2a3a',
      water: '#8b008b',
      lava: '#ff3300',
      decoration: '#6a6a7a',
      door: '#4a0e4e',
      trap: '#ff0000',
      chest: '#00ff00',
      empty: '#1a1a2a',
    },
    undead: {
      floor: '#5a5a6a',
      wall: '#3a3a4a',
      water: '#2a3a5a',
      lava: '#8b5a3c',
      decoration: '#7a7a8a',
      door: '#3a3a3a',
      trap: '#aa0000',
      chest: '#cccccc',
      empty: '#2a2a3a',
    },
  };

  return colors[theme]?.[type] || colors.dungeon[type] || '#000000';
};

const drawCraftPixEnvironment = (
  ctx: CanvasRenderingContext2D,
  environment: EnvironmentMap,
  tileSize: number,
  dimensions: { width: number; height: number },
  cx: number,
  cy: number,
  environmentTextureCache: Record<string, HTMLImageElement>,
  environmentPatternCache: Record<string, CanvasPattern | null>
) => {
  environment.tiles.forEach((tile) => {
    const screenX = tile.x * tileSize - cx;
    const screenY = tile.y * tileSize - cy;

    if (
      screenX + tileSize < 0 ||
      screenY + tileSize < 0 ||
      screenX > dimensions.width ||
      screenY > dimensions.height
    ) {
      return;
    }

    const textureUrl = getEnvironmentAssetURL(environment.theme, tile.type);
    const textureImage = textureUrl ? environmentTextureCache[textureUrl] : undefined;
    let usedPattern: CanvasPattern | null = null;

    if (textureImage && textureImage.complete && textureImage.naturalWidth > 0) {
      const patternKey = `${environment.theme}_${tile.type}`;
      usedPattern = environmentPatternCache[patternKey] || null;
      if (!usedPattern) {
        usedPattern = ctx.createPattern(textureImage, 'repeat');
        environmentPatternCache[patternKey] = usedPattern;
      }
    }

    if (usedPattern) {
      ctx.fillStyle = usedPattern;
      ctx.fillRect(screenX, screenY, tileSize, tileSize);
    } else {
      ctx.fillStyle = getCraftPixTileColor(tile.type, environment.theme);
      ctx.fillRect(screenX, screenY, tileSize, tileSize);
    }

    if (tile.type === 'trap') {
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(screenX + 6, screenY + 6);
      ctx.lineTo(screenX + 26, screenY + 26);
      ctx.moveTo(screenX + 26, screenY + 6);
      ctx.lineTo(screenX + 6, screenY + 26);
      ctx.stroke();
    }
  });
};

const CHARACTER_SPRITE_URLS: Record<string, string> = {
  // Dark Elf pack — has PNG/Dark_Elves/CharacterN_faceN.png
  playerVampireHunter: '/craftpix-net-636003-free-dark-elf-pixel-art-asset-pack/PNG/Dark_Elves/Character1_face1.png',
  playerRenegadeVampire: '/craftpix-net-636003-free-dark-elf-pixel-art-asset-pack/PNG/Dark_Elves/Character2_face1.png',
  playerDraconicKnight: '/craftpix-net-636003-free-dark-elf-pixel-art-asset-pack/PNG/Dark_Elves/Character3_face1.png',
  playerElvenRanger: '/craftpix-net-636003-free-dark-elf-pixel-art-asset-pack/PNG/Dark_Elves/Character4_face1.png',
  // Halfling pack — has PNG/Halflings2/CharacterN_faceN.png (no Idle.png)
  playerOrcBerserker: '/craftpix-net-790760-free-halfling-characters-pixel-art/PNG/Halflings2/Character1_face1.png',
  // Gorgon pack — has Gorgon_2/Idle_2.png (no PNG/ prefix)
  playerArcaneSorceress: '/craftpix-net-280097-free-gorgon-pixel-art-character-sprite-sheets/Gorgon_2/Idle_2.png',
  // Werewolf pack — has Black_Werewolf/Idle.png (no PNG/ prefix)
  enemyWerewolf: '/craftpix-net-248468-free-werewolf-sprite-sheets-pixel-art/Black_Werewolf/Idle.png',
  enemyWerewolfKing: '/craftpix-net-248468-free-werewolf-sprite-sheets-pixel-art/Red_Werewolf/Run.png',
  // Skeleton pack — has Skeleton_Warrior/Idle.png (no PNG/ prefix)
  enemySkeleton: '/craftpix-net-957123-free-skeleton-pixel-art-sprite-sheets/Skeleton_Warrior/Idle.png',
  // Demon pack — has PNG/Demon_warriors/CharacterN_faceN.png (no Idle.png)
  enemyDemon: '/craftpix-net-492723-free-demon-characters-pixel-art/PNG/Demon_warriors/Character1_face1.png',
  // Dark Elf pack — vampires use elf face sprites
  enemyVampireLord: '/craftpix-net-636003-free-dark-elf-pixel-art-asset-pack/PNG/Dark_Elves/Character5_face1.png',
  enemyDragonCultist: '/craftpix-net-492723-free-demon-characters-pixel-art/PNG/Demon_warriors/Character3_face1.png',
  // Gorgon pack — no PNG/ prefix
  enemyGorgon: '/craftpix-net-280097-free-gorgon-pixel-art-character-sprite-sheets/Gorgon_1/Idle.png',
};

const getEnemySpriteURL = (type: string, name: string, faction: Faction): string | null => {
  const lowerName = name.toLowerCase();

  if (/werewolf|lycan/.test(lowerName) || /werewolf/i.test(type)) {
    return CHARACTER_SPRITE_URLS.enemyWerewolf;
  }
  if (/skeleton|bone|ghoul|undead|lich|corpse/.test(lowerName) || /skeleton/i.test(type)) {
    return CHARACTER_SPRITE_URLS.enemySkeleton;
  }
  if (/gorgon/.test(lowerName) || /gorgon/i.test(type)) {
    return CHARACTER_SPRITE_URLS.enemyGorgon;
  }
  if (/vampire|dracula|count|lord|nosferatu/.test(lowerName) || /vampire/i.test(type)) {
    return CHARACTER_SPRITE_URLS.enemyVampireLord;
  }
  if (/cultist|demon|imp|succubus|abyss|hell|infernal/.test(lowerName) || faction === 'Demons') {
    return CHARACTER_SPRITE_URLS.enemyDemon;
  }
  if (/cultist/.test(lowerName)) {
    return CHARACTER_SPRITE_URLS.enemyDragonCultist;
  }
  if (/dragon|drake|wyrm/.test(lowerName)) {
    return CHARACTER_SPRITE_URLS.enemyDemon;
  }

  return null;
};

const getPlayerSpriteURL = (player: PlayerState): string | null => {
  switch (player.class) {
    case 'VampireHunter':
      return CHARACTER_SPRITE_URLS.playerVampireHunter;
    case 'RenegadeVampire':
      return CHARACTER_SPRITE_URLS.playerRenegadeVampire;
    case 'DraconicKnight':
      return CHARACTER_SPRITE_URLS.playerDraconicKnight;
    case 'ElvenRanger':
      return CHARACTER_SPRITE_URLS.playerElvenRanger;
    case 'OrcBerserker':
      return CHARACTER_SPRITE_URLS.playerOrcBerserker;
    case 'ArcaneSorceress':
      return CHARACTER_SPRITE_URLS.playerArcaneSorceress;
    default:
      return null;
  }
};

const drawSpriteOnCanvas = (
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  sx: number,
  sy: number,
  size: number
) => {
  const drawSize = Math.max(size * 2.2, 24);
  ctx.drawImage(image, sx - drawSize / 2, sy - drawSize / 2, drawSize, drawSize);
};

const ENEMY_HUES: Array<[RegExp, string]> = [
  [/flame|fire|lava|ash|ember|infernal|hell|crown|dragon|drake|wyrm/i, '#c2451f'],
  [/frost|ice|snow|winter|yuki|glacier/i, '#5fb8c9'],
  [/storm|thunder|wind|tengu|harpy|lightning/i, '#7a6fd0'],
  [/crystal|gem|prism/i, '#4fbfa8'],
  [/shadow|night|void|dark|abyss|hollow|ghost|specter/i, '#6a4d9c'],
  [/sun|gold|holy|light|celestial|seraph|sol|angel/i, '#d9a441'],
  [/moon|silver|lunar|blood moon|moon/i, '#b9c2d0'],
  [/bone|skeleton|corpse|death|lich|ghoul/i, '#cfc6a8'],
  [/sand|desert|scarab|anubis/i, '#c99a5b'],
  [/sea|water|leviathan|kraken|coral|siren|merrow/i, '#3d84b8'],
  [/forest|leaf|dryad|treant|vine|thorn|mushroom/i, '#5f9457'],
  [/blood|crimson|vampire|bat|night/i, '#8c1f28'],
  [/poison|plague|acid|toxic/i, '#7a9c3a'],
  [/eldritch|eye|dream|reality|architect|choir|watcher|maw/i, '#4a2e6e'],
];

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function pick<T>(seed: string, arr: T[], salt = '') {
  return arr[hash(seed + salt) % arr.length];
}

function colorForName(name: string, fallback: string) {
  for (const [re, hex] of ENEMY_HUES) {
    if (re.test(name)) return hex;
  }
  return fallback;
}

function lighten(hex: string, amt: number) {
  const num = parseInt(hex.slice(1), 16);
  let r = (num >> 16) + amt;
  let g = ((num >> 8) & 0xff) + amt;
  let b = (num & 0xff) + amt;
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function choose<T>(seed: string, val: T | T[], salt: string) {
  if (!Array.isArray(val)) return val;
  return pick(seed, val, 'feat' + salt);
}

function getEnemyBodyType(name: string, faction: Faction) {
  const value = name.toLowerCase();
  if (/dragon|drake|wyrm|grav?e|leviathan|serpent|crocodile/i.test(value)) return 'dragon';
  if (/vampire|blood|dracula|count|succubus|thrall|night/i.test(value)) return 'vampire';
  if (/wolf|lycan|fenrir|werewolf/i.test(value)) return 'lycan';
  if (/ghost|hollow|spirit|specter|wraith|phantom/i.test(value)) return 'spirit';
  if (/zombie|ghoul|frankenstein|monster|cursed/i.test(value)) return 'undead';
  if (/sea|merrow|siren|kraken|leviathan|crocodile/i.test(value)) return 'sea';
  if (/angel|seraph|holy|celestial/i.test(value)) return 'celestial';
  if (/gargoyle|stone|watcher/i.test(value)) return 'gargoyle';
  if (/abyss|void|reality|architect|eldritch|night terror|dream/i.test(value)) return 'abyssal';
  if (/forest|dryad|treant|mother tree|vine|thorn/i.test(value)) return 'forest';
  if (/imp|demon|hell|ash|demon|infernal/i.test(value)) return 'demon';
  if (/elf|sentinel|spellblade|matriarch/i.test(value)) return 'elf';
  if (/orc|raider|shaman|warlord/i.test(value)) return 'orc';
  return faction === 'Dragons' ? 'dragon' : faction === 'Vampires' ? 'vampire' : faction === 'Lycans' ? 'lycan' : faction === 'SeaCreatures' ? 'sea' : faction === 'Celestials' ? 'celestial' : faction === 'Necromancy' ? 'undead' : faction === 'Abyssal' ? 'abyssal' : faction === 'Elves' ? 'elf' : faction === 'Orcs' ? 'orc' : 'spirit';
}

function drawEnemySigil(ctx: CanvasRenderingContext2D, e: Enemy, sx: number, sy: number, frame: number) {
  const base = colorForName(e.name, e.color || '#8b5cf6');
  const light = lighten(base, 45);
  const dark = lighten(base, -55);
  const ringColor = e.isBoss ? '#d9a441' : lighten(base, 20);
  const auraStrength = e.isBoss ? 0.25 : 0.12;
  const pulse = Math.sin(frame * 0.08) * 2;
  const type = getEnemyBodyType(e.name, e.faction);

  ctx.save();
  ctx.translate(sx, sy);

  // Outer rune ring
  ctx.save();
  ctx.strokeStyle = ringColor;
  ctx.lineWidth = e.isBoss ? 3.5 : 2;
  ctx.setLineDash(e.isBoss ? [5, 4] : [3, 3]);
  ctx.beginPath();
  ctx.arc(0, 0, e.size * 1.3 + pulse, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Core body
  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.arc(0, 0, e.size * 0.85, 0, Math.PI * 2);
  ctx.fill();

  // Secondary center glow
  ctx.fillStyle = base;
  ctx.beginPath();
  ctx.arc(0, -e.size * 0.15, e.size * 0.35, 0, Math.PI * 2);
  ctx.fill();

  // Add body-type glyphs
  ctx.strokeStyle = light;
  ctx.fillStyle = light;
  ctx.lineWidth = 1.8;
  ctx.setLineDash([]);

  if (type === 'dragon') {
    ctx.beginPath();
    ctx.moveTo(-e.size * 0.9, -e.size * 0.3);
    ctx.lineTo(-e.size * 1.2, -e.size * 0.9);
    ctx.lineTo(-e.size * 0.6, -e.size * 0.8);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.size * 0.9, -e.size * 0.3);
    ctx.lineTo(e.size * 1.2, -e.size * 0.9);
    ctx.lineTo(e.size * 0.6, -e.size * 0.8);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -e.size * 0.95);
    ctx.lineTo(0, -e.size * 0.35);
    ctx.stroke();
  } else if (type === 'vampire') {
    ctx.beginPath();
    ctx.moveTo(-e.size * 0.8, 0);
    ctx.quadraticCurveTo(-e.size * 1.4, -e.size * 0.6, -e.size * 0.7, -e.size * 0.3);
    ctx.lineTo(-e.size * 0.4, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.size * 0.8, 0);
    ctx.quadraticCurveTo(e.size * 1.4, -e.size * 0.6, e.size * 0.7, -e.size * 0.3);
    ctx.lineTo(e.size * 0.4, 0);
    ctx.stroke();
    ctx.fillRect(-2, -e.size * 0.1, 4, e.size * 0.3);
  } else if (type === 'lycan') {
    ctx.beginPath();
    ctx.moveTo(-e.size * 0.7, -e.size * 0.9);
    ctx.lineTo(-e.size * 1.1, -e.size * 1.4);
    ctx.lineTo(-e.size * 0.2, -e.size * 0.8);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.size * 0.7, -e.size * 0.9);
    ctx.lineTo(e.size * 1.1, -e.size * 1.4);
    ctx.lineTo(e.size * 0.2, -e.size * 0.8);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-e.size * 0.3, -e.size * 0.55);
    ctx.lineTo(0, -e.size * 0.3);
    ctx.lineTo(e.size * 0.3, -e.size * 0.55);
    ctx.stroke();
  } else if (type === 'sea') {
    ctx.beginPath();
    ctx.moveTo(-e.size * 0.8, 0);
    ctx.quadraticCurveTo(-e.size * 1.1, e.size * 0.6, -e.size * 0.2, e.size * 0.4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.size * 0.8, 0);
    ctx.quadraticCurveTo(e.size * 1.1, e.size * 0.6, e.size * 0.2, e.size * 0.4);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, e.size * 0.55, e.size * 0.18, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 'abyssal') {
    ctx.beginPath();
    ctx.arc(0, 0, e.size * 0.4, 0, Math.PI * 1.2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, e.size * 0.6, Math.PI * 1.4, Math.PI * 2.6);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-e.size * 0.4, -e.size * 0.2, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(e.size * 0.4, -e.size * 0.2, 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 'spirit') {
    ctx.beginPath();
    ctx.moveTo(-e.size * 0.4, -e.size * 0.8);
    ctx.quadraticCurveTo(-e.size * 0.6, -e.size * 1.4, 0, -e.size * 1.1);
    ctx.quadraticCurveTo(e.size * 0.6, -e.size * 1.4, e.size * 0.4, -e.size * 0.8);
    ctx.stroke();
    ctx.fillRect(-1, -e.size * 0.2, 2, e.size * 0.4);
  } else if (type === 'undead') {
    ctx.beginPath();
    ctx.moveTo(-e.size * 0.6, -e.size * 0.2);
    ctx.lineTo(-e.size * 0.95, e.size * 0.4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.size * 0.6, -e.size * 0.2);
    ctx.lineTo(e.size * 0.95, e.size * 0.4);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, e.size * 0.3, 2.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 'celestial') {
    ctx.beginPath();
    ctx.moveTo(0, -e.size * 1.1);
    ctx.lineTo(0, -e.size * 0.3);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-e.size * 0.6, -e.size * 0.1);
    ctx.lineTo(e.size * 0.6, -e.size * 0.1);
    ctx.stroke();
    ctx.fillRect(-e.size * 0.15, -e.size * 0.5, e.size * 0.3, e.size * 0.2);
  }

  // Eyes / focus points
  ctx.fillStyle = light;
  ctx.beginPath();
  ctx.arc(-e.size * 0.25, -e.size * 0.2, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(e.size * 0.25, -e.size * 0.2, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Aura halo behind the body
  ctx.save();
  ctx.globalAlpha = auraStrength;
  ctx.fillStyle = base;
  ctx.beginPath();
  ctx.arc(0, 0, e.size * 1.24 + Math.abs(pulse), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

function drawProceduralEnemyBody(ctx: CanvasRenderingContext2D, e: Enemy, sx: number, sy: number, frame: number) {
  const base = colorForName(e.name, e.color || '#8b5cf6');
  const light = lighten(base, 55);
  const dark = lighten(base, -65);
  const bodyType = getEnemyBodyType(e.name, e.faction);
  const s = e.size;
  const bob = Math.sin(frame * 0.08 + hash(e.id) % 6) * 1.5;
  const breathe = Math.sin(frame * 0.06 + hash(e.name) % 8) * 1.2;

  ctx.save();
  ctx.translate(sx, sy + bob);

  if (bodyType === 'dragon') {
    ctx.fillStyle = dark;
    ctx.beginPath();
    ctx.moveTo(-s * 1.1, -s * 0.1);
    ctx.lineTo(-s * 2.0, -s * 0.95 - breathe);
    ctx.lineTo(-s * 0.35, -s * 0.55);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(s * 1.1, -s * 0.1);
    ctx.lineTo(s * 2.0, -s * 0.95 + breathe);
    ctx.lineTo(s * 0.35, -s * 0.55);
    ctx.fill();
    ctx.fillStyle = base;
    ctx.beginPath();
    ctx.ellipse(0, s * 0.1, s * 0.95, s * 0.75, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = light;
    [-0.55, 0, 0.55].forEach(offset => {
      ctx.beginPath();
      ctx.moveTo(s * offset, -s * 0.55);
      ctx.lineTo(s * (offset + 0.16), -s * 1.08);
      ctx.lineTo(s * (offset + 0.3), -s * 0.45);
      ctx.fill();
    });
    ctx.fillStyle = base;
    ctx.beginPath();
    ctx.arc(0, -s * 0.78, s * 0.52, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = light;
    ctx.beginPath();
    ctx.moveTo(-s * 0.35, -s * 1.05);
    ctx.lineTo(-s * 0.68, -s * 1.55);
    ctx.lineTo(-s * 0.1, -s * 1.18);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(s * 0.35, -s * 1.05);
    ctx.lineTo(s * 0.68, -s * 1.55);
    ctx.lineTo(s * 0.1, -s * 1.18);
    ctx.fill();
    ctx.fillStyle = '#fde68a';
    ctx.fillRect(-s * 0.25, -s * 0.85, 3, 3);
    ctx.fillRect(s * 0.13, -s * 0.85, 3, 3);
  } else if (bodyType === 'orc') {
    ctx.fillStyle = '#2f3f1f';
    ctx.fillRect(-s * 0.8, -s * 0.05, s * 1.6, s * 1.05);
    ctx.fillStyle = base;
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.35, s * 0.72, s * 0.58, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = light;
    ctx.beginPath();
    ctx.moveTo(-s * 0.45, -s * 0.25);
    ctx.lineTo(-s * 0.85, -s * 0.15);
    ctx.lineTo(-s * 0.35, -s * 0.05);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(s * 0.45, -s * 0.25);
    ctx.lineTo(s * 0.85, -s * 0.15);
    ctx.lineTo(s * 0.35, -s * 0.05);
    ctx.fill();
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-s * 0.35, -s * 0.12, 3, 6);
    ctx.fillRect(s * 0.2, -s * 0.12, 3, 6);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(s * 0.82, s * 0.55);
    ctx.lineTo(s * 1.55, -s * 0.75);
    ctx.stroke();
    ctx.fillStyle = '#71717a';
    ctx.fillRect(s * 1.35, -s * 1.0, s * 0.45, s * 0.35);
  } else if (bodyType === 'elf') {
    ctx.fillStyle = dark;
    ctx.beginPath();
    ctx.moveTo(-s * 0.55, -s * 0.05);
    ctx.lineTo(0, s * 1.05);
    ctx.lineTo(s * 0.55, -s * 0.05);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = base;
    ctx.fillRect(-s * 0.42, -s * 0.05, s * 0.84, s * 0.95);
    ctx.fillStyle = light;
    ctx.beginPath();
    ctx.arc(0, -s * 0.65, s * 0.42, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-s * 0.38, -s * 0.72);
    ctx.lineTo(-s * 0.95, -s * 0.98);
    ctx.lineTo(-s * 0.48, -s * 0.48);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(s * 0.38, -s * 0.72);
    ctx.lineTo(s * 0.95, -s * 0.98);
    ctx.lineTo(s * 0.48, -s * 0.48);
    ctx.fill();
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(s * 0.82, -s * 0.08, s * 0.58, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(s * 0.82, -s * 0.66);
    ctx.lineTo(s * 0.82, s * 0.5);
    ctx.stroke();
  } else if (bodyType === 'undead') {
    ctx.fillStyle = dark;
    ctx.fillRect(-s * 0.62, -s * 0.02, s * 1.24, s * 1.02);
    ctx.fillStyle = light;
    ctx.beginPath();
    ctx.arc(0, -s * 0.58, s * 0.48, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#111827';
    ctx.fillRect(-s * 0.25, -s * 0.68, 4, 4);
    ctx.fillRect(s * 0.08, -s * 0.68, 4, 4);
    ctx.strokeStyle = light;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-s * 0.75, s * 0.08);
    ctx.lineTo(s * 0.75, s * 0.75);
    ctx.moveTo(s * 0.75, s * 0.08);
    ctx.lineTo(-s * 0.75, s * 0.75);
    ctx.stroke();
  } else if (bodyType === 'lycan') {
    ctx.fillStyle = dark;
    ctx.beginPath();
    ctx.ellipse(0, s * 0.15, s * 0.75, s * 0.95, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = base;
    ctx.beginPath();
    ctx.arc(0, -s * 0.58, s * 0.48, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-s * 0.35, -s * 0.9);
    ctx.lineTo(-s * 0.7, -s * 1.4);
    ctx.lineTo(-s * 0.1, -s * 0.95);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(s * 0.35, -s * 0.9);
    ctx.lineTo(s * 0.7, -s * 1.4);
    ctx.lineTo(s * 0.1, -s * 0.95);
    ctx.fill();
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-2, -s * 0.32, 2, 5);
    ctx.fillRect(2, -s * 0.32, 2, 5);
  } else {
    const isCaster = bodyType === 'spirit' || bodyType === 'abyssal' || bodyType === 'celestial';
    if (isCaster) {
      ctx.save();
      ctx.globalAlpha = bodyType === 'spirit' ? 0.72 : 0.95;
    }
    ctx.fillStyle = dark;
    ctx.beginPath();
    ctx.moveTo(-s * 0.65, -s * 0.15);
    ctx.lineTo(-s * 0.9, s * 0.98);
    ctx.lineTo(s * 0.9, s * 0.98);
    ctx.lineTo(s * 0.65, -s * 0.15);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = base;
    ctx.beginPath();
    ctx.ellipse(0, s * 0.1, s * 0.58, s * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = light;
    ctx.beginPath();
    ctx.arc(0, -s * 0.65, s * 0.42, 0, Math.PI * 2);
    ctx.fill();
    if (bodyType === 'demon' || bodyType === 'gargoyle') {
      ctx.fillStyle = dark;
      ctx.beginPath();
      ctx.moveTo(-s * 0.3, -s * 0.95);
      ctx.lineTo(-s * 0.65, -s * 1.45);
      ctx.lineTo(-s * 0.05, -s * 1.05);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(s * 0.3, -s * 0.95);
      ctx.lineTo(s * 0.65, -s * 1.45);
      ctx.lineTo(s * 0.05, -s * 1.05);
      ctx.fill();
    }
    if (isCaster) ctx.restore();
  }

  ctx.fillStyle = '#fef3c7';
  ctx.fillRect(-s * 0.2, -s * 0.7, 3, 3);
  ctx.fillRect(s * 0.08, -s * 0.7, 3, 3);
  ctx.restore();
}

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
  onEnemyKilled?: (typeId: string) => void;
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
  settings,
  onEnemyKilled,
}: DungeonCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasPreRevealedRef = useRef(false);

  // Canvas scaling and dimensions
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const TILE_SIZE = 32; // Drawn tile size (multiplied by rendering scale)

  // Game lists held in refs to prevent React trigger lag in high frequency loops
  const projectilesRef = useRef<Projectile[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const damageNumbersRef = useRef<DamageNumber[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const screenShakeRef = useRef(0);
  const lootPauseRef = useRef(0);
  const keysRef = useRef<Set<string>>(new Set());
  const cameraRef = useRef({ x: player.x - 400, y: player.y - 300 });
  
  // Track game time/frames
  const gameFrame = useRef(0);
  const [environment, setEnvironment] = useState<EnvironmentMap>(() =>
    generateEnvironment({
      width: level.width,
      height: level.height,
      seed: (level.kingdomIndex || 1) * 10000 + level.floorIndex * 173,
      theme: mapFloorTheme(level.floorTheme),
    })
  );

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

  // Cinematic Overlays
  const [showFloorBanner, setShowFloorBanner] = useState(false);
  const [bossIntroActive, setBossIntroActive] = useState(false);
  const [bossIntroTextLines, setBossIntroTextLines] = useState<string[]>([]);
  const [bossIntroLineIndex, setBossIntroLineIndex] = useState(0);

  // Sync enemies on level load
  useEffect(() => {
    // Spawn concrete enemy instances from spawns using the new Factory
    const spawnedEnemies = level.enemySpawns.map((s, idx) => {
      return EnemyFactory.createEnemy(
        s.type,
        s.x,
        s.y,
        level.floorIndex,
        level.kingdomIndex || 1, // Fallback if undefined
        level.isBloodMoon || false
      );
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

    // Trigger Cinematic Floor Banner
    setShowFloorBanner(true);
    setTimeout(() => setShowFloorBanner(false), 3500);

    // Trigger Boss Intro Sequence on Floor 5
    if (level.floorIndex === 5) {
      setBossIntroActive(true);
      setBossIntroTextLines(GameManager.getBossIntroDialogue(level.kingdomIndex || 1));
      setBossIntroLineIndex(0);
    }

    // Pre-explore spawn area immediately using level spawn coordinates
    if (!hasPreRevealedRef.current) {
      hasPreRevealedRef.current = true;
      const spawnTileX = level.playerSpawn.x;
      const spawnTileY = level.playerSpawn.y;
      const preRevealRadius = 12;
      for (let dy = -preRevealRadius; dy <= preRevealRadius; dy++) {
        for (let dx = -preRevealRadius; dx <= preRevealRadius; dx++) {
          const tx = spawnTileX + dx;
          const ty = spawnTileY + dy;
          if (tx >= 0 && tx < level.width && ty >= 0 && ty < level.height) {
            level.grid[ty][tx].explored = true;
          }
        }
      }
      setLevel({ ...level });
      cameraRef.current = {
        x: spawnTileX * 32 - dimensions.width / 2,
        y: spawnTileY * 32 - dimensions.height / 2,
      };
    }

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

    const theme = mapFloorTheme(level.floorTheme);
    setEnvironment(
      generateEnvironment({
        width: level.width,
        height: level.height,
        seed: (level.kingdomIndex || 1) * 10000 + level.floorIndex * 173,
        theme,
      })
    );
  }, [level]);

  const spriteCacheRef = useRef<Record<string, HTMLImageElement>>({});
  const environmentTextureCacheRef = useRef<Record<string, HTMLImageElement>>({});
  const environmentPatternCacheRef = useRef<Record<string, CanvasPattern | null>>({});

  useEffect(() => {
    const urls = new Set<string>();
    const playerUrl = getPlayerSpriteURL(player);
    if (playerUrl) urls.add(playerUrl);

    level.enemySpawns.forEach((spawn) => {
      const url = getEnemySpriteURL(spawn.type, spawn.type, 'Uncategorized');
      if (url) urls.add(url);
    });

    urls.forEach((url) => {
      if (spriteCacheRef.current[url]) return;
      loadAsset(url)
        .then((img) => {
          spriteCacheRef.current[url] = img;
        })
        .catch(() => {
          // Asset may not exist for all enemy types; fallback to procedural drawing.
        });
    });
  }, [level, player.class]);

  useEffect(() => {
    const textureUrls = getEnvironmentAssetURLs(environment.theme);
    textureUrls.forEach((url) => {
      if (environmentTextureCacheRef.current[url]) return;
      loadAsset(url)
        .then((img) => {
          environmentTextureCacheRef.current[url] = img;
          environmentPatternCacheRef.current = {};
        })
        .catch(() => {
          // Missing environment texture; fall back to color-only rendering.
        });
    });
  }, [environment.theme]);

  // NOTE: per-frame fog reveal is handled inside checkCollisionsAndTriggers (the game loop).
  // A separate useEffect here would capture a stale `level` closure and explore the wrong grid.

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

  // Explore cells around player to clear Fog (called from the game-loop)
  const exploreAroundPlayer = (px: number, py: number) => {
    // Radius of 10 tiles gives a ~20-tile wide visible window around the player
    const radius = 10;
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

    playSound('spell');
    spawnSplashParticles(player.x, player.y, '#f97316', 10);
    spawnSplashParticles(player.x, player.y, '#facc15', 6);
    screenShakeRef.current = Math.max(screenShakeRef.current, 4);
    fireProjectile();
    if (checkDoubleCast) {
      fireProjectile(0.2);
      spawnDamageNumber(player.x, player.y - 12, 'Double Cast!', '#e9d5ff');
    }

    setPlayer(prev => ({
      ...prev,
      mana: Math.max(0, prev.mana - 15),
    }));
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

      if (!activeDialogue && !bossIntroActive) {
        if (lootPauseRef.current > 0) {
          lootPauseRef.current--;
        } else {
          updatePlayerAndPhysics();
          updateProjectiles();
          updateCompanionsAndAI();
          updateEnemiesAndAI();
          updateParticlesAndDmgNumbers();

          // Check level transitions and interaction triggers
          checkCollisionsAndTriggers();
        }
      }

      // Draw everything
      drawGame();

      animFrameId = requestAnimationFrame(gameLoop);
    };

    animFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animFrameId);
  }, [player, level, dimensions, gameActive, isSheetOpen, activeDialogue, bossIntroActive]);

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
        if (onEnemyKilled) onEnemyKilled(e.type);
        
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

      // Setup Callbacks for AISystem
      const addProjectile = (p: Projectile) => projectilesRef.current.push(p);
      const spawnEnemy = (en: Enemy) => enemiesRef.current.push(en);
      const triggerScreenShake = (intensity: number) => { screenShakeRef.current = intensity; };

      // Update AI
      AISystem.updateEnemyAI(e, player, level, addProjectile, spawnEnemy, triggerScreenShake, damagePlayer);

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
      lootPauseRef.current = 180;

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
      lootPauseRef.current = 180;
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
      lootPauseRef.current = 180;
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

    // Draw CraftPix environment tiles behind the level
    drawCraftPixEnvironment(
      ctx,
      environment,
      TILE_SIZE,
      dimensions,
      cx,
      cy,
      environmentTextureCacheRef.current,
      environmentPatternCacheRef.current
    );

    // Determine viewport coordinates
    const startX = Math.max(0, Math.floor(cx / 32));
    const endX = Math.min(level.width, Math.ceil((cx + dimensions.width) / 32));
    const startY = Math.max(0, Math.floor(cy / 32));
    const endY = Math.min(level.height, Math.ceil((cy + dimensions.height) / 32));

    // Theme color adjustments
    const isLavaTheme = ['DragonNest', 'VolcanicWastes', 'EternalThrone'].includes(level.floorTheme);

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
      } else if (p.type === 'fireball') {
        // Hero fireball with bright corona
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(sx, sy, p.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(251, 191, 36, 0.85)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(sx, sy, p.size * 1.6, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(sx, sy, p.size - 2, 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.type === 'shadow') {
        // Purple astral orb
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(sx, sy, p.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(192, 132, 252, 0.85)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(sx, sy, p.size * 1.2, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(sx - p.size * 0.8, sy);
        ctx.lineTo(sx + p.size * 0.8, sy);
        ctx.stroke();
      } else if (p.type === 'holy_spear') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(sx - p.vx * 2, sy - p.vy * 2);
        ctx.lineTo(sx + p.vx * 2, sy + p.vy * 2);
        ctx.stroke();
        ctx.fillStyle = 'rgba(254, 242, 196, 0.85)';
        ctx.beginPath();
        ctx.arc(sx, sy, p.size * 0.9, 0, Math.PI * 2);
        ctx.fill();
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

    if (lootPauseRef.current > 0) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
      ctx.fillRect(dimensions.width / 2 - 160, dimensions.height / 2 - 26, 320, 52);
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 2;
      ctx.strokeRect(dimensions.width / 2 - 160, dimensions.height / 2 - 26, 320, 52);
      ctx.fillStyle = '#f8fafc';
      ctx.font = '16px Georgia';
      ctx.textAlign = 'center';
      ctx.fillText('Collecting loot and recharging...', dimensions.width / 2, dimensions.height / 2 + 6);
    }

    // 3. Draw Regular Enemies and Bosses
    enemiesRef.current.forEach(e => {
      const sx = e.x - cx;
      const sy = e.y - cy;

      // Check if enemy is in camera frame
      if (sx < -50 || sx > dimensions.width + 50 || sy < -50 || sy > dimensions.height + 50) return;

      // Draw shadow circle base
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.arc(sx, sy + e.size - 2, e.size * 0.8, 0, Math.PI * 2);
      ctx.fill();

      const enemySpriteUrl = getEnemySpriteURL(e.type, e.name, e.faction);
      const enemySprite = enemySpriteUrl ? spriteCacheRef.current[enemySpriteUrl] : undefined;
      const enemySpriteDrawn = !!enemySprite && enemySprite.complete && enemySprite.naturalWidth > 0;

      if (enemySpriteDrawn) {
        drawSpriteOnCanvas(ctx, enemySprite!, sx, sy, e.size * 1.2);
      } else {
        drawEnemySigil(ctx, e, sx, sy, gameFrame.current);
      }

      if (!enemySpriteDrawn) {
        if (e.type === 'DragonCultist') {
        // Orange cultist with dragon mask and staff
        ctx.fillStyle = '#991b1b';
        ctx.beginPath();
        ctx.ellipse(sx, sy + 2, e.size * 0.75, e.size * 1.1, 0, 0, Math.PI * 2);
        ctx.fill();

        // Hood and mask
        ctx.fillStyle = '#18181b';
        ctx.beginPath();
        ctx.moveTo(sx - 8, sy - 8);
        ctx.quadraticCurveTo(sx, sy - 18, sx + 8, sy - 8);
        ctx.lineTo(sx + 8, sy + 2);
        ctx.lineTo(sx - 8, sy + 2);
        ctx.closePath();
        ctx.fill();

        // Dragon staff
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(sx + 10, sy + 10);
        ctx.lineTo(sx + 16, sy - 6);
        ctx.stroke();
        ctx.fillStyle = '#fb923c';
        ctx.beginPath();
        ctx.arc(sx + 16, sy - 6, 3, 0, Math.PI * 2);
        ctx.fill();

      } else if (e.type === 'Werewolf') {
        // Upright lupine warrior
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.ellipse(sx, sy + 4, e.size * 0.85, e.size * 1.2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Snarl head
        ctx.fillStyle = '#1f2937';
        ctx.beginPath();
        ctx.arc(sx, sy - 6, e.size * 0.5, 0, Math.PI * 2);
        ctx.fill();

        // Ears
        ctx.beginPath();
        ctx.moveTo(sx - 8, sy - 12);
        ctx.lineTo(sx - 14, sy - 22);
        ctx.lineTo(sx - 2, sy - 14);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(sx + 8, sy - 12);
        ctx.lineTo(sx + 14, sy - 22);
        ctx.lineTo(sx + 2, sy - 14);
        ctx.fill();

        // Eyes and fangs
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(sx - 5, sy - 7, 2.5, 2.5);
        ctx.fillRect(sx + 3, sy - 7, 2.5, 2.5);
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(sx - 2, sy - 1, 1.5, 3);
        ctx.fillRect(sx + 1, sy - 1, 1.5, 3);

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
        // Rotting green zombie with hunched shoulders
        ctx.fillStyle = '#166534'; // rotting green flesh
        ctx.beginPath();
        ctx.ellipse(sx, sy + 2, e.size * 0.9, e.size * 1.1, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head and torn jaw
        ctx.fillStyle = '#d9f99d';
        ctx.beginPath();
        ctx.arc(sx, sy - 6, e.size * 0.45, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#4d7c0f';
        ctx.fillRect(sx - 4, sy - 3, 8, 2);

        // Tattered clothes collar
        ctx.fillStyle = '#78350f'; // decayed brown rags
        ctx.fillRect(sx - 6, sy + 4, 12, 4);

        // Dull yellow eyes
        ctx.fillStyle = '#fde047';
        ctx.fillRect(sx - 3, sy - 8, 2, 2);
        ctx.fillRect(sx + 1, sy - 8, 2, 2);

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
      } else if (e.type === 'Ghoul' || e.type === 'PlagueGhoul') {
        // Hunched necrotic ghoul — twisted limbs, glowing green eyes
        ctx.fillStyle = e.type === 'PlagueGhoul' ? '#365314' : '#3f6212';
        ctx.beginPath();
        ctx.ellipse(sx, sy + 6, e.size * 0.7, e.size * 1.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1f2937';
        ctx.fillRect(sx - 4, sy - 2, 8, 10);

        // Ragged arms and claws
        ctx.strokeStyle = '#84cc16';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(sx - 8, sy + 10); ctx.lineTo(sx - 16, sy + 18); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(sx + 8, sy + 10); ctx.lineTo(sx + 16, sy + 18); ctx.stroke();

        // Glowing eyes
        ctx.fillStyle = e.type === 'PlagueGhoul' ? '#a3e635' : '#65a30d';
        ctx.beginPath(); ctx.arc(sx - 4, sy - 4, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(sx + 4, sy - 4, 2.5, 0, Math.PI * 2); ctx.fill();

      } else if (e.type === 'Werewolf' || e.type === 'WerewolfKing') {
        // Werewolf — large, upright wolf body
        const wScale = e.type === 'WerewolfKing' ? 1.4 : 1.0;
        ctx.fillStyle = e.type === 'WerewolfKing' ? '#111827' : '#374151';
        ctx.beginPath();
        ctx.ellipse(sx, sy + 2, e.size * 0.75 * wScale, e.size * wScale, 0, 0, Math.PI * 2);
        ctx.fill();
        // Wolf ears
        ctx.fillStyle = e.type === 'WerewolfKing' ? '#1f2937' : '#4b5563';
        ctx.beginPath(); ctx.moveTo(sx - 8, sy - e.size); ctx.lineTo(sx - 14, sy - e.size - 10); ctx.lineTo(sx - 2, sy - e.size + 2); ctx.fill();
        ctx.beginPath(); ctx.moveTo(sx + 8, sy - e.size); ctx.lineTo(sx + 14, sy - e.size - 10); ctx.lineTo(sx + 2, sy - e.size + 2); ctx.fill();
        // Red snarl eyes
        ctx.fillStyle = e.type === 'WerewolfKing' ? '#fbbf24' : '#ef4444';
        ctx.beginPath(); ctx.arc(sx - 5, sy - 3, 3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(sx + 5, sy - 3, 3, 0, Math.PI * 2); ctx.fill();
        if (e.type === 'WerewolfKing') {
          // Crown of bone
          ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(sx - 12, sy - e.size); ctx.lineTo(sx - 8, sy - e.size - 8); ctx.lineTo(sx, sy - e.size - 4); ctx.lineTo(sx + 8, sy - e.size - 8); ctx.lineTo(sx + 12, sy - e.size); ctx.stroke();
        }

      } else if (e.type === 'Ghost') {
        // Translucent ghost — fading wisp form
        ctx.save();
        ctx.globalAlpha = 0.65 + Math.sin(Date.now() * 0.004) * 0.15;
        ctx.fillStyle = '#bfdbfe';
        ctx.beginPath();
        ctx.arc(sx, sy - 4, e.size, 0, Math.PI);
        ctx.bezierCurveTo(sx + e.size, sy + 4, sx + e.size * 0.5, sy + e.size + 4, sx, sy + e.size);
        ctx.bezierCurveTo(sx - e.size * 0.5, sy + e.size + 4, sx - e.size, sy + 4, sx - e.size, sy - 4);
        ctx.closePath();
        ctx.fill();
        // Dark hollow eyes
        ctx.fillStyle = '#1e3a5f';
        ctx.beginPath(); ctx.arc(sx - 4, sy - 4, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(sx + 4, sy - 4, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.restore();

      } else if (e.type === 'SnakeMonster') {
        // Serpentine predator with hood and fangs
        ctx.fillStyle = '#4d7c0f';
        ctx.beginPath();
        ctx.ellipse(sx, sy + 2, e.size * 1.1, e.size * 0.75, 0, 0, Math.PI * 2);
        ctx.fill();
        // Hood pattern
        ctx.fillStyle = '#166534';
        ctx.beginPath();
        ctx.moveTo(sx - 8, sy - 2);
        ctx.quadraticCurveTo(sx, sy - 18, sx + 8, sy - 2);
        ctx.fill();
        // Scales texture
        ctx.fillStyle = '#3f6212';
        for (let si = -1; si <= 1; si++) {
          ctx.beginPath(); ctx.ellipse(sx + si * 6, sy + 4, 3, 2, 0, 0, Math.PI * 2); ctx.fill();
        }
        // Forked tongue
        ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(sx, sy + 8); ctx.lineTo(sx, sy + 14); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(sx, sy + 14); ctx.lineTo(sx - 4, sy + 18); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(sx, sy + 14); ctx.lineTo(sx + 4, sy + 18); ctx.stroke();
        // Eyes
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath(); ctx.arc(sx - 6, sy - 4, 3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(sx + 6, sy - 4, 3, 0, Math.PI * 2); ctx.fill();

      } else if (e.type === 'OxBeast') {
        // Massive ox-like beast — hulking shoulders, horns
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.ellipse(sx, sy + 4, e.size * 1.1, e.size * 0.9, 0, 0, Math.PI * 2);
        ctx.fill();
        // Giant curved horns
        ctx.strokeStyle = '#d97706'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(sx - e.size, sy - 4); ctx.quadraticCurveTo(sx - e.size - 12, sy - 18, sx - e.size + 4, sy - 24); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(sx + e.size, sy - 4); ctx.quadraticCurveTo(sx + e.size + 12, sy - 18, sx + e.size - 4, sy - 24); ctx.stroke();
        // Red eyes
        ctx.fillStyle = '#dc2626';
        ctx.beginPath(); ctx.arc(sx - 6, sy - 2, 3.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(sx + 6, sy - 2, 3.5, 0, Math.PI * 2); ctx.fill();
        // Nostrils
        ctx.fillStyle = '#451a03';
        ctx.beginPath(); ctx.arc(sx - 3, sy + 6, 2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(sx + 3, sy + 6, 2, 0, Math.PI * 2); ctx.fill();

      } else if (e.type === 'Succubus') {
        // Succubus — elegant winged figure in magenta
        ctx.fillStyle = '#be185d';
        ctx.beginPath();
        ctx.ellipse(sx, sy + 2, e.size * 0.65, e.size, 0, 0, Math.PI * 2);
        ctx.fill();
        // Bat-like wings
        ctx.fillStyle = '#9d174d';
        ctx.beginPath();
        ctx.moveTo(sx - e.size * 0.6, sy);
        ctx.bezierCurveTo(sx - e.size * 1.8, sy - 14, sx - e.size * 1.4, sy + 10, sx - e.size * 0.6, sy + 8);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(sx + e.size * 0.6, sy);
        ctx.bezierCurveTo(sx + e.size * 1.8, sy - 14, sx + e.size * 1.4, sy + 10, sx + e.size * 0.6, sy + 8);
        ctx.fill();
        // Horns
        ctx.strokeStyle = '#fda4af'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(sx - 5, sy - e.size); ctx.lineTo(sx - 8, sy - e.size - 8); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(sx + 5, sy - e.size); ctx.lineTo(sx + 8, sy - e.size - 8); ctx.stroke();
        // Glowing pink eyes
        ctx.fillStyle = '#f9a8d4';
        ctx.beginPath(); ctx.arc(sx - 4, sy - 4, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(sx + 4, sy - 4, 2.5, 0, Math.PI * 2); ctx.fill();

      } else if (e.type === 'NightCreature') {
        // Shadow creature — shifting black mass with eye
        ctx.save();
        ctx.globalAlpha = 0.85;
        const pulse = Math.sin(Date.now() * 0.006) * 2;
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(sx, sy, e.size + pulse, 0, Math.PI * 2);
        ctx.fill();
        // Single menacing eye
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(sx, sy - 2, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(sx + 1, sy - 2, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

      } else if (e.type === 'Frankenstein') {
        // Frankenstein — massive square-headed monster
        ctx.fillStyle = '#365314';
        // Body — wide rectangle
        ctx.fillRect(sx - e.size, sy - e.size * 0.6, e.size * 2, e.size * 1.4);
        // Head — square
        ctx.fillStyle = '#4d7c0f';
        ctx.fillRect(sx - e.size * 0.75, sy - e.size * 1.6, e.size * 1.5, e.size * 1.1);
        // Neck bolts
        ctx.fillStyle = '#713f12';
        ctx.fillRect(sx - e.size - 4, sy - e.size * 0.8, 6, 10);
        ctx.fillRect(sx + e.size - 2, sy - e.size * 0.8, 6, 10);
        // Stitches across forehead
        ctx.strokeStyle = '#84cc16'; ctx.lineWidth = 1.5;
        for (let si = 0; si < 4; si++) {
          const stitchX = sx - 10 + si * 7;
          ctx.beginPath(); ctx.moveTo(stitchX, sy - e.size * 1.3); ctx.lineTo(stitchX, sy - e.size * 1.0); ctx.stroke();
        }
        // Yellow glowing eyes
        ctx.fillStyle = '#fde047';
        ctx.beginPath(); ctx.arc(sx - 6, sy - e.size * 1.1, 4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(sx + 6, sy - e.size * 1.1, 4, 0, Math.PI * 2); ctx.fill();

      } else if (e.type === 'CrocodileKing') {
        // Crocodile King — wide low body, long snout
        ctx.fillStyle = '#166534';
        ctx.beginPath();
        ctx.ellipse(sx, sy + 4, e.size * 1.3, e.size * 0.65, 0, 0, Math.PI * 2);
        ctx.fill();
        // Crown
        ctx.fillStyle = '#854d0e';
        ctx.fillRect(sx - 10, sy - e.size - 8, 20, 6);
        ctx.beginPath(); ctx.moveTo(sx - 10, sy - e.size - 8); ctx.lineTo(sx - 6, sy - e.size - 16); ctx.lineTo(sx - 2, sy - e.size - 8); ctx.fill();
        ctx.beginPath(); ctx.moveTo(sx, sy - e.size - 8); ctx.lineTo(sx + 4, sy - e.size - 18); ctx.lineTo(sx + 8, sy - e.size - 8); ctx.fill();
        ctx.beginPath(); ctx.moveTo(sx + 4, sy - e.size - 8); ctx.lineTo(sx + 8, sy - e.size - 14); ctx.lineTo(sx + 12, sy - e.size - 8); ctx.fill();
        // Teeth row
        ctx.fillStyle = '#f8fafc';
        for (let ti = 0; ti < 5; ti++) {
          ctx.beginPath(); ctx.moveTo(sx - 12 + ti * 6, sy + 8); ctx.lineTo(sx - 9 + ti * 6, sy + 14); ctx.lineTo(sx - 6 + ti * 6, sy + 8); ctx.fill();
        }
        // Gold vertical slit eyes
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath(); ctx.arc(sx - 7, sy - 2, 3.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(sx + 7, sy - 2, 3.5, 0, Math.PI * 2); ctx.fill();

      } else if (e.type === 'CountDracula') {
        // Count Dracula — noble vampire in cape
        ctx.fillStyle = '#7f1d1d';
        ctx.beginPath();
        ctx.ellipse(sx, sy + 2, e.size * 0.65, e.size, 0, 0, Math.PI * 2);
        ctx.fill();
        // Black cape spread
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.moveTo(sx - e.size * 0.6, sy - e.size * 0.3);
        ctx.bezierCurveTo(sx - e.size * 2, sy + e.size * 0.5, sx - e.size * 1.5, sy + e.size * 1.5, sx - e.size * 0.3, sy + e.size);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(sx + e.size * 0.6, sy - e.size * 0.3);
        ctx.bezierCurveTo(sx + e.size * 2, sy + e.size * 0.5, sx + e.size * 1.5, sy + e.size * 1.5, sx + e.size * 0.3, sy + e.size);
        ctx.fill();
        // Widow's peak hair
        ctx.fillStyle = '#1c1917';
        ctx.beginPath(); ctx.moveTo(sx - 10, sy - e.size); ctx.lineTo(sx, sy - e.size + 8); ctx.lineTo(sx + 10, sy - e.size); ctx.fill();
        // Red glowing eyes
        ctx.fillStyle = '#ef4444';
        ctx.beginPath(); ctx.arc(sx - 4, sy - 4, 3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(sx + 4, sy - 4, 3, 0, Math.PI * 2); ctx.fill();
        // White fangs
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath(); ctx.moveTo(sx - 4, sy + 3); ctx.lineTo(sx - 2, sy + 8); ctx.lineTo(sx, sy + 3); ctx.fill();
        ctx.beginPath(); ctx.moveTo(sx, sy + 3); ctx.lineTo(sx + 2, sy + 8); ctx.lineTo(sx + 4, sy + 3); ctx.fill();

      } else if (e.type === 'CthulhuSquid') {
        // Cthulhu Squid — massive pulsing tentacled horror
        ctx.save();
        ctx.globalAlpha = 0.9;
        const cPulse = Math.sin(Date.now() * 0.003) * 2;
        // Body
        ctx.fillStyle = '#0d9488';
        ctx.beginPath();
        ctx.ellipse(sx, sy, e.size + cPulse, e.size * 1.1 + cPulse, 0, 0, Math.PI * 2);
        ctx.fill();
        // Tentacles — 6 waving arms
        ctx.strokeStyle = '#0f766e'; ctx.lineWidth = 3;
        for (let ti = 0; ti < 6; ti++) {
          const tAngle = (Math.PI * 2 / 6) * ti + Date.now() * 0.002;
          const tLen = e.size + 12;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.quadraticCurveTo(
            sx + Math.cos(tAngle) * tLen * 0.5, sy + Math.sin(tAngle) * tLen * 0.5,
            sx + Math.cos(tAngle) * tLen, sy + Math.sin(tAngle) * tLen
          );
          ctx.stroke();
        }
        // Massive glowing eye
        ctx.fillStyle = '#fde68a';
        ctx.beginPath(); ctx.arc(sx, sy - 4, 8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.beginPath(); ctx.arc(sx + 2, sy - 4, 4, 0, Math.PI * 2); ctx.fill();
        ctx.restore();

      } else if (e.type === 'VampireLord') {
        // Vampire Lord — tall elegant figure
        ctx.fillStyle = '#4c0519';
        ctx.beginPath();
        ctx.ellipse(sx, sy, e.size * 0.6, e.size, 0, 0, Math.PI * 2);
        ctx.fill();
        // Dark red aura shimmer
        ctx.strokeStyle = '#9f1239';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(sx, sy, e.size + 4 + Math.sin(Date.now() * 0.005) * 2, 0, Math.PI * 2);
        ctx.stroke();
        // Red eyes
        ctx.fillStyle = '#fca5a5';
        ctx.beginPath(); ctx.arc(sx - 4, sy - 4, 3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(sx + 4, sy - 4, 3, 0, Math.PI * 2); ctx.fill();

      } else {
        drawProceduralEnemyBody(ctx, e, sx, sy, gameFrame.current);
      }
    }

      // Enemy HP Bar
      const hpBarW = e.size * 2;
      const hpPercent = e.health / e.maxHealth;
      ctx.fillStyle = '#18181b';
      ctx.fillRect(sx - e.size, sy - e.size - 10, hpBarW, 4);
      ctx.fillStyle = e.isBoss ? '#ea580c' : '#ef4444'; // Orange for boss, red for regular
      ctx.fillRect(sx - e.size, sy - e.size - 10, hpBarW * hpPercent, 4);
    });

    // Boss UI overlay
    const bossEntity = enemiesRef.current.find(enemy => enemy.isBoss);
    if (bossEntity) {
      const barWidth = Math.min(dimensions.width - 140, 520);
      const overlayX = (dimensions.width - barWidth) / 2;
      const overlayY = 16;
      const bossHealthPct = Math.max(0, Math.min(1, bossEntity.health / bossEntity.maxHealth));

      ctx.fillStyle = 'rgba(12, 12, 12, 0.85)';
      ctx.fillRect(overlayX, overlayY, barWidth, 46);
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.85)';
      ctx.lineWidth = 2;
      ctx.strokeRect(overlayX, overlayY, barWidth, 46);

      ctx.fillStyle = '#f8fafc';
      ctx.font = '18px Georgia';
      ctx.textAlign = 'left';
      ctx.fillText(`BOSS: ${bossEntity.name}`, overlayX + 16, overlayY + 24);

      const innerWidth = barWidth - 32;
      ctx.fillStyle = '#111827';
      ctx.fillRect(overlayX + 16, overlayY + 28, innerWidth, 10);
      ctx.fillStyle = '#f97316';
      ctx.fillRect(overlayX + 16, overlayY + 28, innerWidth * bossHealthPct, 10);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1;
      ctx.strokeRect(overlayX + 16, overlayY + 28, innerWidth, 10);

      ctx.fillStyle = '#f8fafc';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.round(bossHealthPct * 100)}%`, overlayX + barWidth / 2, overlayY + 38);
      ctx.textAlign = 'start';
    }

    // 4. Draw Player
    const psx = player.x - cx;
    const psy = player.y - cy;

    // Draw shadow under player
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.arc(psx, psy + 10, 12, 0, Math.PI * 2);
    ctx.fill();

    const playerSpriteUrl = getPlayerSpriteURL(player);
    const playerSprite = playerSpriteUrl ? spriteCacheRef.current[playerSpriteUrl] : undefined;
    const playerSpriteDrawn = !!playerSprite && playerSprite.complete && playerSprite.naturalWidth > 0;

    // Invincibility flashing flicker
    const isInvincible = player.dashActiveTime > 0;
    if (!isInvincible || gameFrame.current % 4 !== 0) {
      if (playerSpriteDrawn) {
        drawSpriteOnCanvas(ctx, playerSprite!, psx, psy, player.size * 1.3);
      } else {
      // 1. Cape (drawn behind body)
      ctx.fillStyle = player.customization?.capeColor || '#991b1b';
      ctx.beginPath();
      ctx.ellipse(psx, psy + 5, player.size * 0.8, player.size * 1.15, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Body / Torso (Armor dependent color representation)
      let bodyColor = player.class === 'VampireHunter' ? '#2563eb'
        : player.class === 'RenegadeVampire' ? '#881337'
        : player.class === 'DraconicKnight' ? '#78350f'
        : player.class === 'ElvenRanger' ? '#047857'
        : player.class === 'OrcBerserker' ? '#365314'
        : '#6d28d9';
      if (player.equipped.Armor?.rarity === 'Legendary') bodyColor = '#fbbf24';
      else if (player.equipped.Armor?.rarity === 'Epic') bodyColor = '#c084fc';
      else if (player.equipped.Armor?.rarity === 'Rare') bodyColor = '#60a5fa';
      const isFemaleFrame = player.customization?.gender === 'Female' || player.class === 'ArcaneSorceress';
      const torsoW = isFemaleFrame ? player.size * 0.7 : player.size * 0.9;
      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.moveTo(psx - torsoW, psy - 3);
      ctx.lineTo(psx + torsoW, psy - 3);
      ctx.lineTo(psx + player.size * 0.58, psy + player.size);
      ctx.lineTo(psx - player.size * 0.58, psy + player.size);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = lighten(bodyColor, 45);
      ctx.fillRect(psx - 1, psy - 3, 2, player.size + 3);

      // 3. Head / Face complexion
      ctx.fillStyle = player.customization?.skinColor || '#f5f5f4';
      ctx.beginPath();
      ctx.arc(psx, psy - 4, 6, 0, Math.PI * 2);
      ctx.fill();
      if (player.class === 'ElvenRanger') {
        ctx.fillStyle = player.customization?.skinColor || '#f5f5f4';
        ctx.beginPath();
        ctx.moveTo(psx - 5, psy - 6);
        ctx.lineTo(psx - 13, psy - 10);
        ctx.lineTo(psx - 6, psy - 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(psx + 5, psy - 6);
        ctx.lineTo(psx + 13, psy - 10);
        ctx.lineTo(psx + 6, psy - 2);
        ctx.fill();
      } else if (player.class === 'OrcBerserker') {
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(psx - 4, psy + 1, 2, 5);
        ctx.fillRect(psx + 2, psy + 1, 2, 5);
      }

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
      } else if (hairStyle.includes('Antlers')) {
        ctx.beginPath();
        ctx.arc(psx, psy - 8, 6, Math.PI, 0);
        ctx.fill();
        ctx.strokeStyle = '#d6d3d1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(psx - 5, psy - 9);
        ctx.lineTo(psx - 12, psy - 18);
        ctx.moveTo(psx + 5, psy - 9);
        ctx.lineTo(psx + 12, psy - 18);
        ctx.stroke();
      } else if (hairStyle.includes('Warhawk')) {
        ctx.fillRect(psx - 2, psy - 17, 4, 10);
        ctx.fillStyle = '#111827';
        ctx.fillRect(psx - 6, psy - 10, 12, 3);
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

        const weaponName = player.equipped.Weapon.name;
        if (weaponName.includes('Bow')) {
          ctx.strokeStyle = '#d6a35d';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(wx, wy, 9, -Math.PI / 2, Math.PI / 2);
          ctx.stroke();
          ctx.strokeStyle = '#e5e7eb';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(wx, wy - 9);
          ctx.lineTo(wx, wy + 9);
          ctx.stroke();
        } else if (weaponName.includes('Axe')) {
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(wx - 3, wy - 8, 9, 7);
          ctx.fillStyle = '#3f2e1f';
          ctx.fillRect(wx - 1, wy - 2, 3, 10);
        } else if (weaponName.includes('Staff')) {
          ctx.fillStyle = player.customization?.eyeColor || '#a855f7';
          ctx.beginPath();
          ctx.arc(wx, wy, 4, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Draw dynamic weapon hilt/crossguard
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect((psx + wx) / 2 - 1.5, (psy + wy) / 2 - 1.5, 3, 3);
        }
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

      {/* Cinematic Floor Banner */}
      {showFloorBanner && !bossIntroActive && (
        <div className="absolute top-1/4 left-0 w-full flex flex-col items-center justify-center pointer-events-none z-40" style={{ animation: 'fadeInOut 3.5s ease-in-out' }}>
          <style>{`
            @keyframes fadeInOut {
              0% { opacity: 0; transform: translateY(-20px); }
              10% { opacity: 1; transform: translateY(0); }
              90% { opacity: 1; transform: translateY(0); }
              100% { opacity: 0; transform: translateY(-20px); }
            }
          `}</style>
          <div className="bg-black/70 backdrop-blur-md w-full py-8 border-y-2 border-red-900/60 text-center shadow-[0_0_50px_rgba(153,27,27,0.3)]">
            <h1 className="text-4xl md:text-6xl font-black text-red-500 uppercase tracking-[0.25em] mb-4 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]">
              {GameManager.getKingdomName(level.kingdomIndex || 1)}
            </h1>
            <div className="flex items-center justify-center gap-6">
              <div className="w-16 h-px bg-red-900/80" />
              <span className="text-xl md:text-3xl text-zinc-200 font-serif italic tracking-wide">
                Floor {level.floorIndex} — {GameManager.getFloorDescriptor(level.kingdomIndex || 1, level.floorIndex).name}
              </span>
              <div className="w-16 h-px bg-red-900/80" />
            </div>
            <p className="text-sm text-red-400 uppercase tracking-[0.3em] mt-4 font-mono font-bold">
              {GameManager.getFloorDescriptor(level.kingdomIndex || 1, level.floorIndex).subtitle}
            </p>
          </div>
        </div>
      )}

      {/* Boss Intro Sequence */}
      {bossIntroActive && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-lg">
          <div className="w-full max-w-4xl text-center px-8">
            <h2 className="text-3xl md:text-5xl text-red-600 font-serif italic mb-12 drop-shadow-[0_0_20px_rgba(220,38,38,0.8)]">
              {GameManager.getBossForKingdom(level.kingdomIndex || 1)}
            </h2>
            <div className="min-h-[100px] flex items-center justify-center">
              <p className="text-2xl md:text-4xl text-zinc-100 font-medium tracking-wide leading-relaxed" style={{ animation: 'fadeIn 0.5s ease-out' }}>
                "{bossIntroTextLines[bossIntroLineIndex]}"
              </p>
            </div>
            <div className="mt-16 flex items-center justify-center">
              <button
                onClick={() => {
                  if (bossIntroLineIndex < bossIntroTextLines.length - 1) {
                    setBossIntroLineIndex(prev => prev + 1);
                  } else {
                    setBossIntroActive(false);
                  }
                }}
                className="px-10 py-4 bg-red-950/60 border-2 border-red-900 text-red-200 text-xl hover:bg-red-800 hover:text-white rounded-lg font-mono uppercase tracking-[0.2em] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(153,27,27,0.6)]"
              >
                {bossIntroLineIndex < bossIntroTextLines.length - 1 ? 'Continue' : 'Engage in Battle'}
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* DEBUG OVERLAY */}
      <div className="absolute top-20 right-4 z-50 bg-black/80 text-green-400 p-2 font-mono text-xs pointer-events-none whitespace-pre flex flex-col gap-1 border border-green-800">
        <div>DEBUG INFO:</div>
        <div>Player: {Math.floor(player.x)}, {Math.floor(player.y)}</div>
        <div>Camera: {Math.floor(cameraRef.current.x)}, {Math.floor(cameraRef.current.y)}</div>
        <div>Dims: {dimensions.width}x{dimensions.height}</div>
        <div>Frame: {gameFrame.current}</div>
        <div>Level: {level.width}x{level.height}</div>
      </div>

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
}
