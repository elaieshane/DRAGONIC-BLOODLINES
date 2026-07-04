import { PlayerState, Enemy, Projectile, Particle, DamageNumber } from '../types';
import { playSound } from '../components/SoundEffects';

export class CombatSystem {
  static resolveMeleePlayerToEnemy(
    player: PlayerState, 
    enemy: Enemy, 
    addDamageNumber: (x: number, y: number, text: string, color: string) => void,
    addParticles: (x: number, y: number, color: string, count: number) => void
  ): { enemyDead: boolean, lifestealAmount: number } {
    
    // Calculate total player damage
    const baseDamage = player.stats.strength;
    const weaponDamage = player.equipped.Weapon?.stats.damage || 0;
    const petDamage = player.activePet?.attack || 0;
    
    const isCrit = Math.random() < 0.1 + (player.stats.agility / 100);
    const multiplier = isCrit ? 2.0 : 1.0;
    
    const totalDamage = Math.floor((baseDamage + weaponDamage + petDamage) * multiplier);

    // Apply Damage
    enemy.health -= totalDamage;
    
    // VFX & SFX
    playSound('hit');
    addDamageNumber(enemy.x, enemy.y - 20, totalDamage.toString(), isCrit ? '#fef08a' : '#f87171');
    addParticles(enemy.x, enemy.y, '#ef4444', 4);

    // Lifesteal Calculation
    const lsPercent = (player.equipped.Weapon?.stats.lifesteal || 0) + (player.equipped.Crest?.stats.lifesteal || 0);
    const lsAmount = lsPercent > 0 ? Math.floor(totalDamage * lsPercent) : 0;

    return {
      enemyDead: enemy.health <= 0,
      lifestealAmount: lsAmount
    };
  }

  static resolveEnemyToPlayer(
    enemy: Enemy, 
    player: PlayerState,
    addDamageNumber: (x: number, y: number, text: string, color: string) => void,
    addParticles: (x: number, y: number, color: string, count: number) => void
  ): number { // returns damage taken

    // I-frames check
    if (player.dashActiveTime > 0) return 0;
    if (player.shieldActive) return 0;

    const baseDefense = player.stats.vitality;
    const armorDefense = player.equipped.Armor?.stats.defense || 0;
    const crestDefense = player.equipped.Crest?.stats.defense || 0;
    const totalDefense = baseDefense + armorDefense + crestDefense;
    
    // Damage mitigation curve
    const mitigation = Math.min(0.8, totalDefense / (totalDefense + 50));
    const finalDamage = Math.max(1, Math.floor(enemy.damage * (1 - mitigation)));

    playSound('player_hit');
    addDamageNumber(player.x, player.y - 20, finalDamage.toString(), '#dc2626');
    addParticles(player.x, player.y, '#dc2626', 5);

    return finalDamage;
  }
}
