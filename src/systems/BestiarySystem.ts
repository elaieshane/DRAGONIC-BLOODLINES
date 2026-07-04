import { BestiaryEntry } from '../types';
import { BESTIARY_DATABASE, getBestiaryEntry, getEnemiesByFaction } from '../utils/bestiary_data';

export class BestiarySystem {
  private kills: Record<string, number> = {};

  constructor(savedKills?: Record<string, number>) {
    if (savedKills) {
      this.kills = { ...savedKills };
    }
  }

  public getKills(): Record<string, number> {
    return this.kills;
  }

  public registerKill(enemyId: string) {
    if (!this.kills[enemyId]) {
      this.kills[enemyId] = 0;
    }
    this.kills[enemyId]++;
  }

  public getKillCount(enemyId: string): number {
    return this.kills[enemyId] || 0;
  }

  /**
   * Lore is unlocked in tiers based on kill count.
   * 0 kills = Unknown
   * 1 kill = Name & Faction
   * 5 kills = Weakness & Habitat
   * 10 kills = Full Lore & Drops
   */
  public getUnlockLevel(enemyId: string): number {
    const k = this.getKillCount(enemyId);
    if (k >= 10) return 3;
    if (k >= 5) return 2;
    if (k >= 1) return 1;
    return 0; // Undiscovered
  }

  public getFactions() {
    const factions = new Set<string>();
    BESTIARY_DATABASE.forEach(e => factions.add(e.faction));
    return Array.from(factions);
  }

  public getEntriesByFaction(faction: string) {
    // We cast to any because Faction type is tight but getEnemiesByFaction accepts it.
    return getEnemiesByFaction(faction as any);
  }
}
