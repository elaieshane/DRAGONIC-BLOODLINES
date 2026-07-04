/**
 * CraftPix Environment System
 * Procedurally generates dungeon environments using CraftPix tilesets
 */

import React, { useMemo } from "react";
import {
  CraftPixPanel,
  CraftPixButton,
  CraftPixGrid,
  PIXEL_THEME,
} from "./CraftPixUI";

// Tile size in pixels
export const TILE_SIZE = 32;

// Environment tile types
export enum TileType {
  FLOOR = "floor",
  WALL = "wall",
  WATER = "water",
  LAVA = "lava",
  DECORATION = "decoration",
  DOOR = "door",
  TRAP = "trap",
  CHEST = "chest",
  EMPTY = "empty",
}

export interface Tile {
  type: TileType;
  x: number;
  y: number;
  rotation?: 0 | 1 | 2 | 3;
  animated?: boolean;
}

export interface EnvironmentConfig {
  width: number;
  height: number;
  seed?: number;
  waterLevel?: number;
  decorationDensity?: number;
  theme?: "dungeon" | "ruins" | "cursed" | "undead";
}

export interface EnvironmentMap {
  tiles: Tile[];
  width: number;
  height: number;
  theme: string;
}

/**
 * Hash function for consistent procedural generation
 */
function hashCoord(x: number, y: number, seed: number = 42): number {
  let h = seed;
  h = ((h << 5) - h) ^ (x * 73856093);
  h = ((h << 5) - h) ^ (y * 19349663);
  h = h ^ (h >> 13);
  h = ((h << 13) - h);
  h = h ^ (h >> 16);
  return Math.abs(h);
}

function hashString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function getDeterministicNoise(x: number, y: number, seed: number = 42, salt: string = ''): number {
  const saltSeed = hashString(salt);
  return (hashCoord(x, y, seed ^ saltSeed) % 1000) / 1000;
}

/**
 * Generate procedural dungeon using Perlin-like noise
 */
export function generateEnvironment(config: EnvironmentConfig): EnvironmentMap {
  const seed = config.seed || Math.floor(Math.random() * 10000);
  const tiles: Tile[] = [];
  const waterLevel = config.waterLevel ?? 0.4;
  const decorDensity = config.decorationDensity ?? 0.1;

  for (let y = 0; y < config.height; y++) {
    for (let x = 0; x < config.width; x++) {
      const hash = hashCoord(x, y, seed);
      const noise = (hash % 1000) / 1000;

      let tileType = TileType.FLOOR;

      // Water generation
      if (noise < waterLevel) {
        tileType = config.theme === "cursed" ? TileType.LAVA : TileType.WATER;
      }
      // Wall generation (edges and noise-based)
      else if (
        x === 0 ||
        x === config.width - 1 ||
        y === 0 ||
        y === config.height - 1 ||
        (noise < waterLevel + 0.15 && noise >= waterLevel)
      ) {
        tileType = TileType.WALL;
      }
      // Decorations
      else if (noise > 1 - decorDensity) {
        const decoRoll = getDeterministicNoise(x, y, seed, 'decor');
        tileType = decoRoll > 0.5 ? TileType.DECORATION : TileType.TRAP;
      }
      // Occasional doors
      else if (noise > 0.85 && noise < 0.88 && x % 8 === 0) {
        const doorRoll = getDeterministicNoise(x, y, seed, 'door');
        if (doorRoll < 0.5) {
          tileType = TileType.DOOR;
        }
      }

      tiles.push({
        type: tileType,
        x,
        y,
        rotation: (hash % 4) as 0 | 1 | 2 | 3,
        animated: tileType === TileType.WATER || tileType === TileType.LAVA,
      });
    }
  }

  return {
    tiles,
    width: config.width,
    height: config.height,
    theme: config.theme || "dungeon",
  };
}

/**
 * Get SVG color for tile type
 */
function getTileColor(type: TileType, theme: string): string {
  const colors: Record<string, Record<TileType, string>> = {
    dungeon: {
      [TileType.FLOOR]: "#5a4a3a",
      [TileType.WALL]: "#3d2817",
      [TileType.WATER]: "#1a4d7f",
      [TileType.LAVA]: "#8b0000",
      [TileType.DECORATION]: "#8b6f47",
      [TileType.DOOR]: "#8b4513",
      [TileType.TRAP]: "#cc0000",
      [TileType.CHEST]: "#d4af37",
      [TileType.EMPTY]: "#2a2a2a",
    },
    ruins: {
      [TileType.FLOOR]: "#6b6b6b",
      [TileType.WALL]: "#4a4a4a",
      [TileType.WATER]: "#2d5f8d",
      [TileType.LAVA]: "#cc5500",
      [TileType.DECORATION]: "#9b9b9b",
      [TileType.DOOR]: "#8b6914",
      [TileType.TRAP]: "#ff4444",
      [TileType.CHEST]: "#ffd700",
      [TileType.EMPTY]: "#3a3a3a",
    },
    cursed: {
      [TileType.FLOOR]: "#3a3a4a",
      [TileType.WALL]: "#2a2a3a",
      [TileType.WATER]: "#8b008b",
      [TileType.LAVA]: "#ff3300",
      [TileType.DECORATION]: "#6a6a7a",
      [TileType.DOOR]: "#4a0e4e",
      [TileType.TRAP]: "#ff0000",
      [TileType.CHEST]: "#00ff00",
      [TileType.EMPTY]: "#1a1a2a",
    },
    undead: {
      [TileType.FLOOR]: "#5a5a6a",
      [TileType.WALL]: "#3a3a4a",
      [TileType.WATER]: "#2a3a5a",
      [TileType.LAVA]: "#8b5a3c",
      [TileType.DECORATION]: "#7a7a8a",
      [TileType.DOOR]: "#3a3a3a",
      [TileType.TRAP]: "#aa0000",
      [TileType.CHEST]: "#cccccc",
      [TileType.EMPTY]: "#2a2a3a",
    },
  };

  return colors[theme]?.[type] || colors.dungeon[type];
}

interface EnvironmentCanvasProps {
  environment: EnvironmentMap;
  tileSize?: number;
  showGrid?: boolean;
  zoom?: number;
}

/**
 * SVG-based environment renderer
 */
export const EnvironmentCanvas: React.FC<EnvironmentCanvasProps> = ({
  environment,
  tileSize = TILE_SIZE,
  showGrid = false,
  zoom = 1,
}) => {
  const width = environment.width * tileSize;
  const height = environment.height * tileSize;

  const tiles = useMemo(() => {
    return environment.tiles.map((tile, idx) => {
      const color = getTileColor(tile.type, environment.theme);
      const opacity = tile.type === TileType.EMPTY ? 0.3 : 1;

      return (
        <g key={idx}>
          <rect
            x={tile.x * tileSize}
            y={tile.y * tileSize}
            width={tileSize}
            height={tileSize}
            fill={color}
            opacity={opacity}
            stroke={showGrid ? "#666" : "none"}
            strokeWidth={1}
          />
          {/* Decorative elements */}
          {tile.type === TileType.TRAP && (
            <circle
              cx={tile.x * tileSize + tileSize / 2}
              cy={tile.y * tileSize + tileSize / 2}
              r={tileSize / 4}
              fill="none"
              stroke="#ffff00"
              strokeWidth={2}
              opacity={0.7}
            />
          )}
          {tile.type === TileType.CHEST && (
            <rect
              x={tile.x * tileSize + 4}
              y={tile.y * tileSize + 8}
              width={tileSize - 8}
              height={tileSize - 12}
              fill="none"
              stroke="#ffff00"
              strokeWidth={2}
            />
          )}
          {tile.type === TileType.DOOR && (
            <line
              x1={tile.x * tileSize}
              y1={tile.y * tileSize + tileSize / 2}
              x2={tile.x * tileSize + tileSize}
              y2={tile.y * tileSize + tileSize / 2}
              stroke="#8b4513"
              strokeWidth={3}
            />
          )}
        </g>
      );
    });
  }, [environment, tileSize, showGrid]);

  return (
    <svg
      width={width * zoom}
      height={height * zoom}
      viewBox={`0 0 ${width} ${height}`}
      style={{
        border: `3px solid ${PIXEL_THEME.gold}`,
        backgroundColor: PIXEL_THEME.dark,
        imageRendering: "pixelated",
        boxShadow: `inset 0 0 10px ${PIXEL_THEME.shadow}, 0 4px 8px ${PIXEL_THEME.shadow}`,
      }}
    >
      <defs>
        <pattern id="grid" width={tileSize} height={tileSize} patternUnits="userSpaceOnUse">
          <path d={`M ${tileSize} 0 L 0 0 0 ${tileSize}`} fill="none" stroke="#333" strokeWidth="0.5" />
        </pattern>
      </defs>

      {showGrid && (
        <rect width={width} height={height} fill="url(#grid)" />
      )}

      {tiles}
    </svg>
  );
};

interface EnvironmentBuilderProps {
  onEnvironmentChange?: (environment: EnvironmentMap) => void;
}

/**
 * Interactive environment builder
 */
export const EnvironmentBuilder: React.FC<EnvironmentBuilderProps> = ({
  onEnvironmentChange,
}) => {
  const [config, setConfig] = React.useState<EnvironmentConfig>({
    width: 16,
    height: 12,
    theme: "dungeon",
    waterLevel: 0.3,
    decorationDensity: 0.1,
  });

  const [environment, setEnvironment] = React.useState<EnvironmentMap>(() =>
    generateEnvironment(config)
  );

  const handleRegenerate = () => {
    const newEnv = generateEnvironment({
      ...config,
      seed: Math.floor(Math.random() * 10000),
    });
    setEnvironment(newEnv);
    onEnvironmentChange?.(newEnv);
  };

  return (
    <div>
      <CraftPixPanel title="⚔️ DUNGEON ENVIRONMENT BUILDER" variant="dark">
        <CraftPixGrid columns={2} gap={16}>
          {/* Width Control */}
          <div>
            <label
              style={{
                color: PIXEL_THEME.light,
                fontSize: "12px",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                display: "block",
                marginBottom: "8px",
              }}
            >
              Width: <span style={{ color: PIXEL_THEME.gold }}>{config.width}</span>
            </label>
            <input
              type="range"
              min="8"
              max="32"
              value={config.width}
              onChange={(e) => setConfig({ ...config, width: parseInt(e.target.value) })}
              style={{
                width: "100%",
                cursor: "pointer",
                accentColor: PIXEL_THEME.gold,
              }}
            />
          </div>

          {/* Height Control */}
          <div>
            <label
              style={{
                color: PIXEL_THEME.light,
                fontSize: "12px",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                display: "block",
                marginBottom: "8px",
              }}
            >
              Height: <span style={{ color: PIXEL_THEME.gold }}>{config.height}</span>
            </label>
            <input
              type="range"
              min="6"
              max="24"
              value={config.height}
              onChange={(e) => setConfig({ ...config, height: parseInt(e.target.value) })}
              style={{
                width: "100%",
                cursor: "pointer",
                accentColor: PIXEL_THEME.gold,
              }}
            />
          </div>

          {/* Water Level Control */}
          <div>
            <label
              style={{
                color: PIXEL_THEME.light,
                fontSize: "12px",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                display: "block",
                marginBottom: "8px",
              }}
            >
              Water Level: <span style={{ color: PIXEL_THEME.blue }}>{(config.waterLevel! * 100).toFixed(0)}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={(config.waterLevel! * 100).toFixed(0)}
              onChange={(e) =>
                setConfig({ ...config, waterLevel: parseInt(e.target.value) / 100 })
              }
              style={{
                width: "100%",
                cursor: "pointer",
                accentColor: PIXEL_THEME.blue,
              }}
            />
          </div>

          {/* Theme Selection */}
          <div>
            <label
              style={{
                color: PIXEL_THEME.light,
                fontSize: "12px",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                display: "block",
                marginBottom: "8px",
              }}
            >
              Theme
            </label>
            <select
              value={config.theme}
              onChange={(e) => setConfig({ ...config, theme: e.target.value as any })}
              style={{
                width: "100%",
                padding: "8px",
                backgroundColor: PIXEL_THEME.brown,
                color: PIXEL_THEME.gold,
                border: `2px solid ${PIXEL_THEME.gold}`,
                fontWeight: "bold",
                cursor: "pointer",
                textTransform: "uppercase",
                fontSize: "12px",
              }}
            >
              <option value="dungeon">🏰 Dungeon</option>
              <option value="ruins">🏛️ Ruins</option>
              <option value="cursed">👹 Cursed</option>
              <option value="undead">💀 Undead</option>
            </select>
          </div>
        </CraftPixGrid>

        <div style={{ marginTop: "16px" }}>
          <CraftPixButton variant="primary" size="medium" onClick={handleRegenerate}>
            🔄 Regenerate Map
          </CraftPixButton>
        </div>
      </CraftPixPanel>

      <div
        style={{
          marginTop: "16px",
          padding: "16px",
          backgroundColor: PIXEL_THEME.dark,
          borderRadius: "4px",
          overflowX: "auto",
          border: `2px solid ${PIXEL_THEME.gold}`,
        }}
      >
        <EnvironmentCanvas environment={environment} zoom={1.5} showGrid={true} />
      </div>
    </div>
  );
};
