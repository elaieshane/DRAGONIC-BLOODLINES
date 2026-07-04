import { PlayerState, SaveData, Item } from '../types';

const SAVE_KEY = 'draconic_bloodline_save_v2';

export class SaveManager {
  static saveGame(
    playerState: PlayerState, 
    currentKingdom: number, 
    currentFloor: number, 
    unlockedKingdoms: number[], 
    inventory: Item[],
    newGamePlus: number,
    bestiaryKills?: Record<string, number>,
    bloodMoon?: any // BloodMoonState
  ): void {
    const saveData: SaveData = {
      saveId: crypto.randomUUID(),
      timestamp: Date.now(),
      gameTime: 0,
      playerState,
      currentKingdom,
      currentFloor,
      unlockedKingdoms,
      inventory,
      newGamePlus,
      bestiaryKills,
      bloodMoon,
    };
    
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
      console.log('Game saved successfully.');
    } catch (e) {
      console.error('Failed to save game.', e);
    }
  }

  static loadGame(): SaveData | null {
    try {
      const data = localStorage.getItem(SAVE_KEY);
      if (data) {
        return JSON.parse(data) as SaveData;
      }
    } catch (e) {
      console.error('Failed to load game.', e);
    }
    return null;
  }

  static deleteSave(): void {
    localStorage.removeItem(SAVE_KEY);
  }

  static hasSaveFile(): boolean {
    return localStorage.getItem(SAVE_KEY) !== null;
  }
}
