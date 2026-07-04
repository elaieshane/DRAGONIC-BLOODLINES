/**
 * CraftPix Asset Management System
 * Handles loading, caching, and providing access to all CraftPix asset collections
 */

// Asset Collection Inventory
export const CRAFTPIX_ASSETS = {
  DUNGEON: {
    name: "2D Top-Down Dungeon Asset Pack",
    path: "../../../craftpix-net-169442-free-2d-top-down-pixel-dungeon-asset-pack/PNG",
    category: "environment",
    assets: {
      walls_floor: "walls_floor.png",
      decorative_cracks_floor: "decorative_cracks_floor.png",
      decorative_cracks_walls: "decorative_cracks_walls.png",
      decorative_cracks_coasts: "decorative_cracks_coasts_animation.png",
      water_animation: "Water_coasts_animation.png",
      fire_animation: "fire_animation.png",
      fire_animation2: "fire_animation2.png",
      doors_lever_chest: "doors_lever_chest_animation.png",
      trap_animation: "trap_animation.png",
      objects: "Objects.png",
    },
  },
  RUINS: {
    name: "Top-Down Ruins Pixel Art",
    path: "../../../craftpix-net-934618-free-top-down-ruins-pixel-art/PNG",
    category: "environment",
    assets: {
      base: "Assets/",
      shadow: "Assets_shadow/",
      texture: "Assets_texture_shadow/",
      texture_dark: "Assets_texture_shadow_dark/",
    },
  },
  UNDEAD_TILESET: {
    name: "Undead Tileset Top-Down Pixel Art",
    path: "../../../craftpix-net-695666-free-undead-tileset-top-down-pixel-art/PNG",
    category: "environment",
  },
  CURSED_LAND: {
    name: "Cursed Land Top-Down Pixel Art Tileset",
    path: "../../../craftpix-net-958568-free-cursed-land-top-down-pixel-art-tileset/PNG",
    category: "environment",
  },
  NPC_AVATARS: {
    name: "Medieval NPC Avatars Pixel Pack",
    path: "../../../craftpix-net-934138-free-medieval-npc-avatars-pixel-pack-for-dialogue",
    category: "ui",
    npcs: ["NPC_1", "NPC_2", "NPC_3", "NPC_4"],
    emotions: ["Aggression", "Calm", "Sadness", "Smile", "Special", "Talk"],
  },
  DARK_ELF_QUEEN: {
    name: "Dark Elf Queen Avatar Icon Pixel Pack",
    path: "../../../craftpix-net-345639-free-dark-elf-queen-avatar-icon-pixel-pack-for-dialogue",
    category: "ui",
  },
  DARK_ELF_PACK: {
    name: "Dark Elf Pixel Art Asset Pack",
    path: "../../../craftpix-net-636003-free-dark-elf-pixel-art-asset-pack/PNG",
    category: "characters",
  },
  SKELETON: {
    name: "Skeleton Pixel Art Sprite Sheets",
    path: "../../../craftpix-net-957123-free-skeleton-pixel-art-sprite-sheets/PNG",
    category: "characters",
  },
  WEREWOLF: {
    name: "Werewolf Sprite Sheets Pixel Art",
    path: "../../../craftpix-net-248468-free-werewolf-sprite-sheets-pixel-art/PNG",
    category: "characters",
  },
  GORGON: {
    name: "Gorgon Pixel Art Character Sprite Sheets",
    path: "../../../craftpix-net-280097-free-gorgon-pixel-art-character-sprite-sheets/PNG",
    category: "characters",
  },
  DEMON: {
    name: "Demon Characters Pixel Art",
    path: "../../../craftpix-net-492723-free-demon-characters-pixel-art/PNG",
    category: "characters",
  },
  HALFLING: {
    name: "Halfling Characters Pixel Art",
    path: "../../../craftpix-net-790760-free-halfling-characters-pixel-art/PNG",
    category: "characters",
  },
  MEDIEVAL: {
    name: "Medieval NPC Avatars",
    path: "../../../craftpix-net-934138-free-medieval-npc-avatars-pixel-pack-for-dialogue",
    category: "ui",
  },
} as const;

// Asset Categories for filtering
export const ASSET_CATEGORIES = {
  environment: ["DUNGEON", "RUINS", "UNDEAD_TILESET", "CURSED_LAND"],
  ui: ["NPC_AVATARS", "DARK_ELF_QUEEN", "MEDIEVAL"],
  characters: ["DARK_ELF_PACK", "SKELETON", "WEREWOLF", "GORGON", "DEMON", "HALFLING"],
} as const;

/**
 * Get all environment tilesets
 */
export function getEnvironmentAssets() {
  return ASSET_CATEGORIES.environment.map(
    (key) => CRAFTPIX_ASSETS[key as keyof typeof CRAFTPIX_ASSETS]
  );
}

/**
 * Get all UI avatar assets
 */
export function getUIAssets() {
  return ASSET_CATEGORIES.ui.map(
    (key) => CRAFTPIX_ASSETS[key as keyof typeof CRAFTPIX_ASSETS]
  );
}

/**
 * Get all character sprite sheets
 */
export function getCharacterAssets() {
  return ASSET_CATEGORIES.characters.map(
    (key) => CRAFTPIX_ASSETS[key as keyof typeof CRAFTPIX_ASSETS]
  );
}

/**
 * Asset cache for performance
 */
const assetCache = new Map<string, HTMLImageElement>();

/**
 * Load and cache image asset
 */
export function loadAsset(assetPath: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (assetCache.has(assetPath)) {
      resolve(assetCache.get(assetPath)!);
      return;
    }

    const img = new Image();
    img.onload = () => {
      assetCache.set(assetPath, img);
      resolve(img);
    };
    img.onerror = () => reject(new Error(`Failed to load asset: ${assetPath}`));
    img.src = assetPath;
  });
}

/**
 * Get base URL for asset relative to public folder
 */
export function getAssetURL(packKey: keyof typeof CRAFTPIX_ASSETS, assetName: string): string {
  const pack = CRAFTPIX_ASSETS[packKey];
  return `/craftpix-${packKey.toLowerCase()}/${assetName}`;
}

/**
 * Preload multiple assets
 */
export async function preloadAssets(assetPaths: string[]): Promise<void> {
  await Promise.all(assetPaths.map(loadAsset));
}

/**
 * Clear asset cache
 */
export function clearAssetCache(): void {
  assetCache.clear();
}
