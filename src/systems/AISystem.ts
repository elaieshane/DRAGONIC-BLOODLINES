import { Enemy, PlayerState, Projectile, Particle, DamageNumber, LevelData } from '../types';
import { playSound } from '../components/SoundEffects';
import { generateRandomItem } from '../utils/procedural';

export class AISystem {
  static updateEnemyAI(
    enemy: Enemy, 
    player: PlayerState, 
    level: LevelData,
    addProjectile: (p: Projectile) => void,
    spawnEnemy: (e: Enemy) => void,
    triggerScreenShake: (intensity: number) => void,
    damagePlayer: (amount: number) => void
  ): void {
    
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const dist = Math.hypot(dx, dy);

    // Common AI: If taking damage or idle, track the player if close enough
    if (dist < 400 && enemy.state === 'idle') {
      enemy.state = 'chase';
    }

    if (enemy.isBoss) {
      this.updateBossAI(enemy, player, dist, dx, dy, addProjectile, spawnEnemy, triggerScreenShake, damagePlayer);
    } else {
      this.updateStandardAI(enemy, player, dist, dx, dy, addProjectile, damagePlayer);
    }
  }

  private static updateStandardAI(
    enemy: Enemy, 
    player: PlayerState, 
    dist: number, dx: number, dy: number, 
    addProjectile: (p: Projectile) => void,
    damagePlayer: (amount: number) => void
  ) {
    if (enemy.state === 'chase') {
      // Move towards player
      if (dist > 30) {
        enemy.x += (dx / dist) * enemy.speed;
        enemy.y += (dy / dist) * enemy.speed;
      }
      
      // Attempt attack if cooldown is up
      enemy.stateTimer++;

      // Melee damage check
      if (dist < 32 && enemy.stateTimer % 30 === 0) {
        damagePlayer(enemy.damage);
      }

      if (enemy.stateTimer >= enemy.attackCooldown) {
        if (dist < 80) {
          enemy.state = 'attack';
          enemy.stateTimer = 0;
        } else if (enemy.type === 'Mage' || enemy.type === 'CrossbowCaptain') {
          // Ranged attack
          addProjectile({
            id: `proj_${Date.now()}_${Math.random()}`,
            x: enemy.x, y: enemy.y,
            vx: (dx / dist) * 4, vy: (dy / dist) * 4,
            size: 6, damage: enemy.damage,
            isPlayer: false,
            color: '#a855f7',
            duration: 120,
            type: 'fireball'
          });
          enemy.stateTimer = 0;
        } else if (enemy.type === 'CathedralTemplar' && dist < 120) {
          // Templar thrust attack (shoots a fast holy spear)
          addProjectile({
            id: `templar_spear_${Date.now()}`,
            x: enemy.x, y: enemy.y,
            vx: (dx / dist) * 7, vy: (dy / dist) * 7,
            size: 8, damage: enemy.damage * 1.2,
            isPlayer: false, color: '#fef08a', duration: 100, type: 'holy_spear'
          });
          enemy.stateTimer = -30; // Extra long cooldown after thrust
        }
      }
    } else if (enemy.state === 'attack') {
      enemy.stateTimer++;
      if (enemy.stateTimer > 30) {
        enemy.state = 'chase';
        enemy.stateTimer = 0;
      }
    }
  }

  private static updateBossAI(
    boss: Enemy, 
    player: PlayerState, 
    dist: number, dx: number, dy: number, 
    addProjectile: (p: Projectile) => void,
    spawnEnemy: (e: Enemy) => void,
    triggerScreenShake: (intensity: number) => void,
    damagePlayer: (amount: number) => void
  ) {
    // Phase Checks
    const hpPercent = boss.health / boss.maxHealth;
    if (hpPercent < 0.66 && boss.currentPhase === 1) {
      boss.currentPhase = 2;
      boss.state = 'boss_rage';
      boss.stateTimer = 0;
      boss.size = Math.round(boss.size * 1.15 + 2);
      boss.damage = Math.round(boss.damage * 1.15);
      triggerScreenShake(6);
      playSound('boss_roar');
    } else if (hpPercent < 0.33 && boss.currentPhase === 2) {
      boss.currentPhase = 3;
      boss.state = 'boss_desperation';
      boss.stateTimer = 0;
      const sizeBoost = Math.max(4, Math.round(boss.size * 0.18));
      boss.size += sizeBoost;
      boss.damage = Math.round(boss.damage * 1.4);
      triggerScreenShake(12);
      playSound('boss_roar');
      
      // Phase 3 True Form transformations
      if (boss.type === 'HollowArchbishop') {
        boss.name = 'The Fallen Seraph';
        boss.color = '#fbbf24';
        boss.speed *= 1.5;
      } else if (boss.type === 'WitchQueen') {
        boss.name = 'Morvessa the Undying';
        boss.color = '#4ade80';
        boss.speed *= 1.3;
      } else if (boss.type === 'BlackKnight') {
        boss.name = 'The Obsidian Wraith';
        boss.color = '#7c3aed';
        boss.speed *= 1.4;
      } else if (boss.type === 'NecromancerKing') {
        boss.name = 'Malakar the Lich God';
        boss.color = '#6d28d9';
        boss.speed *= 1.2;
        boss.damage = Math.round(boss.damage * 1.6);
      } else if (boss.type === 'EmperorCaelus') {
        boss.name = 'The Dragon God Caelus';
        boss.color = '#f97316';
        boss.speed *= 1.6;
        boss.damage = Math.round(boss.damage * 2);
      } else if (boss.type === 'CthulhuSquid') {
        boss.name = 'The Elder One';
        boss.speed *= 1.4;
        boss.damage = Math.round(boss.damage * 1.6);
      }
    }

    if (boss.state === 'boss_rage' || boss.state === 'boss_desperation') {
      boss.stateTimer++;
      if (boss.stateTimer > 120) {
        boss.state = 'chase'; // Resume fighting
        boss.stateTimer = 0;
      }
      return; // Invulnerable or locked during transition
    }

    // Specific Boss Logic
    switch (boss.type) {
      case 'HollowArchbishop':
        this.aiHollowArchbishop(boss, dist, dx, dy, addProjectile);
        break;
      case 'CthulhuSquid':
        this.aiCthulhuSquid(boss, player, dist, dx, dy, addProjectile, triggerScreenShake, damagePlayer);
        break;
      case 'CountDracula':
        this.aiCountDracula(boss, player, dist, dx, dy, addProjectile, damagePlayer);
        break;
      case 'Frankenstein':
        this.aiFrankenstein(boss, player, dist, dx, dy, spawnEnemy, triggerScreenShake, damagePlayer);
        break;
      case 'CrocodileKing':
        this.aiCrocodileKing(boss, player, dist, dx, dy, addProjectile, triggerScreenShake, damagePlayer);
        break;
      case 'WitchQueen':
        this.aiWitchQueen(boss, player, dist, dx, dy, addProjectile, spawnEnemy, damagePlayer);
        break;
      case 'BlackKnight':
        this.aiBlackKnight(boss, player, dist, dx, dy, addProjectile, triggerScreenShake, damagePlayer);
        break;
      case 'NecromancerKing':
        this.aiNecromancerKing(boss, player, dist, dx, dy, addProjectile, spawnEnemy, damagePlayer);
        break;
      case 'EmperorCaelus':
        this.aiEmperorCaelus(boss, player, dist, dx, dy, addProjectile, triggerScreenShake, damagePlayer);
        break;
      default:
        // Generic boss fallback
        this.updateStandardAI(boss, player, dist, dx, dy, addProjectile, damagePlayer);
        break;
    }
  }

  private static aiHollowArchbishop(
    boss: Enemy, dist: number, dx: number, dy: number, 
    addProjectile: (p: Projectile) => void
  ) {
    boss.stateTimer++;
    
    // Chase movement
    if (dist > 50) {
      boss.x += (dx / dist) * boss.speed;
      boss.y += (dy / dist) * boss.speed;
    }

    // Attack Patterns
    if (boss.stateTimer >= boss.attackCooldown) {
      boss.stateTimer = 0;
      const attackChoice = Math.random();

      if (boss.currentPhase === 3) {
        // Phase 3: Laser beams & Exploding Feathers
        if (attackChoice < 0.5) {
          // 8-way feather explosion
          for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            addProjectile({
              id: `feather_${Date.now()}_${i}`,
              x: boss.x, y: boss.y,
              vx: Math.cos(angle) * 6, vy: Math.sin(angle) * 6,
              size: 8, damage: boss.damage,
              isPlayer: false, color: '#fef08a', duration: 150, type: 'holy_spear'
            });
          }
        } else {
          // Fast aimed shot
          addProjectile({
            id: `laser_${Date.now()}`,
            x: boss.x, y: boss.y,
            vx: (dx / dist) * 12, vy: (dy / dist) * 12,
            size: 12, damage: boss.damage * 1.5,
            isPlayer: false, color: '#fbbf24', duration: 200, type: 'holy_spear'
          });
        }
      } else {
        // Phase 1 & 2: Holy Spears
        addProjectile({
          id: `spear_${Date.now()}`,
          x: boss.x, y: boss.y,
          vx: (dx / dist) * 5, vy: (dy / dist) * 5,
          size: 10, damage: boss.damage,
          isPlayer: false, color: '#fef08a', duration: 150, type: 'holy_spear'
        });
      }
    }
  }

  private static aiCthulhuSquid(
    boss: Enemy, player: PlayerState, dist: number, dx: number, dy: number, 
    addProjectile: (p: Projectile) => void,
    triggerScreenShake: (intensity: number) => void,
    damagePlayer: (amount: number) => void
  ) {
    boss.stateTimer++;
    
    // Sluggish chase
    if (dist > 60) {
      boss.x += (dx / dist) * boss.speed;
      boss.y += (dy / dist) * boss.speed;
    }

    if (dist < 40 && boss.stateTimer % 40 === 0) {
      damagePlayer(boss.damage);
    }

    if (boss.stateTimer >= boss.attackCooldown) {
      boss.stateTimer = 0;
      const attackChoice = Math.random();

      if (boss.currentPhase === 3 || attackChoice < 0.4) {
        // Massive Screenshake & damage (The user requested "shaking presence")
        triggerScreenShake(20);
        if (dist < 150) {
          damagePlayer(35);
        }
      } else {
        // Ink spray
        for (let i = 0; i < 4; i++) {
          addProjectile({
            id: `ink_${Date.now()}_${i}`,
            x: boss.x, y: boss.y,
            vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6,
            size: 12, damage: boss.damage,
            isPlayer: false, color: '#0d9488', duration: 120, type: 'blood_orb'
          });
        }
      }
    }
  }

  private static aiCountDracula(
    boss: Enemy, player: PlayerState, dist: number, dx: number, dy: number, 
    addProjectile: (p: Projectile) => void,
    damagePlayer: (amount: number) => void
  ) {
    boss.stateTimer++;
    
    // Fast Chase
    if (dist > 30) {
      boss.x += (dx / dist) * boss.speed * 1.5;
      boss.y += (dy / dist) * boss.speed * 1.5;
    }

    // Vampiric bite
    if (dist < 32 && boss.stateTimer % 20 === 0) {
      damagePlayer(boss.damage);
      boss.health = Math.min(boss.maxHealth, boss.health + boss.damage);
    }

    if (boss.stateTimer >= boss.attackCooldown) {
      boss.stateTimer = 0;
      
      // Shadow Swarm
      for (let i = 0; i < 5; i++) {
        addProjectile({
          id: `shadow_${Date.now()}_${i}`,
          x: boss.x, y: boss.y,
          vx: (Math.random() - 0.5) * 8, vy: (Math.random() - 0.5) * 8,
          size: 8, damage: boss.damage,
          isPlayer: false, color: '#000000', duration: 150, type: 'shadow'
        });
      }
    }
  }

  // ─── WITCH QUEEN MORVESSA ────────────────────────────────────────────────
  private static aiWitchQueen(
    boss: Enemy, player: PlayerState, dist: number, dx: number, dy: number,
    addProjectile: (p: Projectile) => void,
    spawnEnemy: (e: Enemy) => void,
    damagePlayer: (amount: number) => void
  ) {
    boss.stateTimer++;

    // Floating movement — strafe around player
    const strafeAngle = Date.now() * 0.001;
    const orbitRadius = 120;
    if (dist > orbitRadius) {
      boss.x += (dx / dist) * boss.speed;
      boss.y += (dy / dist) * boss.speed;
    } else {
      // Strafe
      boss.x += Math.cos(strafeAngle) * boss.speed * 0.8;
      boss.y += Math.sin(strafeAngle) * boss.speed * 0.8;
    }

    if (boss.stateTimer >= boss.attackCooldown) {
      boss.stateTimer = 0;
      const r = Math.random();

      if (r < 0.3) {
        // Summon Plague Ghouls from cauldron
        for (let i = 0; i < 2; i++) {
          spawnEnemy({
            id: `ghoul_summon_${Date.now()}_${i}`,
            type: 'Ghoul', name: 'Cursed Ghoul', faction: 'Necromancy', evolutionTier: 1, isBloodMoonVariant: false,
            x: boss.x + (Math.random() - 0.5) * 80,
            y: boss.y + (Math.random() - 0.5) * 80,
            size: 14, health: 60, maxHealth: 60, damage: 12, speed: 1.2,
            xpReward: 20, isBoss: false, state: 'chase',
            stateTimer: 0, lastAttackTime: 0, attackCooldown: 50,
            currentPhase: 1, color: '#65a30d',
          });
        }
      } else if (r < 0.65) {
        // Poison Rain — 6 falling orbs in a spread
        for (let i = 0; i < 6; i++) {
          addProjectile({
            id: `poison_${Date.now()}_${i}`,
            x: boss.x + (Math.random() - 0.5) * 100,
            y: boss.y - 20,
            vx: (Math.random() - 0.5) * 2,
            vy: 3 + Math.random() * 2,
            size: 9, damage: boss.damage,
            isPlayer: false, color: '#4ade80', duration: 140, type: 'poison_rain'
          });
        }
      } else if (r < 0.85 && boss.currentPhase >= 2) {
        // Phase 2+: Hex Bolt tracking shot
        addProjectile({
          id: `hex_${Date.now()}`,
          x: boss.x, y: boss.y,
          vx: (dx / dist) * 6, vy: (dy / dist) * 6,
          size: 11, damage: boss.damage * 1.4,
          isPlayer: false, color: '#a21caf', duration: 180, type: 'shadow'
        });
      } else {
        // Close range cackle burst
        for (let i = 0; i < 8; i++) {
          const angle = (Math.PI * 2 / 8) * i;
          addProjectile({
            id: `burst_${Date.now()}_${i}`,
            x: boss.x, y: boss.y,
            vx: Math.cos(angle) * 4, vy: Math.sin(angle) * 4,
            size: 7, damage: boss.damage * 0.8,
            isPlayer: false, color: '#86efac', duration: 100, type: 'poison_rain'
          });
        }
      }
    }
  }

  // ─── BLACK KNIGHT SIR GARRUK ─────────────────────────────────────────────
  private static aiBlackKnight(
    boss: Enemy, player: PlayerState, dist: number, dx: number, dy: number,
    addProjectile: (p: Projectile) => void,
    triggerScreenShake: (intensity: number) => void,
    damagePlayer: (amount: number) => void
  ) {
    boss.stateTimer++;

    if (boss.state === 'boss_fly') {
      // Unstoppable charge
      boss.x += (dx / dist) * boss.speed * 3.5;
      boss.y += (dy / dist) * boss.speed * 3.5;
      if (dist < 36) {
        damagePlayer(boss.damage * 1.8);
        triggerScreenShake(15);
        boss.state = 'chase';
      }
      return;
    }

    // Slow heavy pursuit
    if (dist > 35) {
      boss.x += (dx / dist) * boss.speed;
      boss.y += (dy / dist) * boss.speed;
    }

    // Heavy ground slam at close range
    if (dist < 40 && boss.stateTimer % 35 === 0) {
      damagePlayer(boss.damage);
      triggerScreenShake(8);
    }

    if (boss.stateTimer >= boss.attackCooldown) {
      boss.stateTimer = 0;
      const r = Math.random();

      if (r < 0.35) {
        // Charge initiation
        boss.state = 'boss_fly';
        boss.stateTimer = 0;
      } else if (r < 0.65) {
        // Dark laser beam
        addProjectile({
          id: `dark_laser_${Date.now()}`,
          x: boss.x, y: boss.y,
          vx: (dx / dist) * 10, vy: (dy / dist) * 10,
          size: 14, damage: boss.damage * 1.6,
          isPlayer: false, color: '#1e1b4b', duration: 80, type: 'dark_laser'
        });
      } else if (r < 0.9 && boss.currentPhase >= 2) {
        // Phase 2+: Sword Vortex — 4 slashes in an X
        for (let i = 0; i < 4; i++) {
          const angle = (Math.PI / 4) + (Math.PI / 2) * i;
          addProjectile({
            id: `vortex_${Date.now()}_${i}`,
            x: boss.x, y: boss.y,
            vx: Math.cos(angle) * 7, vy: Math.sin(angle) * 7,
            size: 10, damage: boss.damage,
            isPlayer: false, color: '#6d28d9', duration: 90, type: 'dark_laser'
          });
        }
      }
    }
  }

  // ─── NECROMANCER KING MALAKAR ─────────────────────────────────────────────
  private static aiNecromancerKing(
    boss: Enemy, player: PlayerState, dist: number, dx: number, dy: number,
    addProjectile: (p: Projectile) => void,
    spawnEnemy: (e: Enemy) => void,
    damagePlayer: (amount: number) => void
  ) {
    boss.stateTimer++;

    // Hover back — keeps distance
    if (dist < 100) {
      boss.x -= (dx / dist) * boss.speed * 0.8;
      boss.y -= (dy / dist) * boss.speed * 0.8;
    } else if (dist > 220) {
      boss.x += (dx / dist) * boss.speed;
      boss.y += (dy / dist) * boss.speed;
    }

    if (boss.stateTimer >= boss.attackCooldown) {
      boss.stateTimer = 0;
      const r = Math.random();

      if (r < 0.4) {
        // Raise the Dead — summon 2-3 skeletons
        const count = boss.currentPhase === 3 ? 4 : 2;
        for (let i = 0; i < count; i++) {
          spawnEnemy({
            id: `risen_${Date.now()}_${i}`,
            type: 'Skeleton', name: 'Risen Warrior', faction: 'Necromancy', evolutionTier: 1, isBloodMoonVariant: false,
            x: boss.x + (Math.random() - 0.5) * 100,
            y: boss.y + (Math.random() - 0.5) * 100,
            size: 13, health: 45, maxHealth: 45, damage: 10, speed: 1.0,
            xpReward: 15, isBoss: false, state: 'chase',
            stateTimer: 0, lastAttackTime: 0, attackCooldown: 60,
            currentPhase: 1, color: '#cbd5e1',
          });
        }
      } else if (r < 0.7) {
        // Soul Barrage — 3 tracking bolts
        for (let i = 0; i < 3; i++) {
          const spread = (i - 1) * 0.3;
          addProjectile({
            id: `soul_${Date.now()}_${i}`,
            x: boss.x, y: boss.y,
            vx: (dx / dist) * 5 + Math.cos(spread),
            vy: (dy / dist) * 5 + Math.sin(spread),
            size: 9, damage: boss.damage,
            isPlayer: false, color: '#a855f7', duration: 200, type: 'shadow'
          });
        }
      } else if (r < 0.9) {
        // Death Nova — 360 burst on Phase 3
        if (boss.currentPhase === 3) {
          for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 / 12) * i;
            addProjectile({
              id: `nova_${Date.now()}_${i}`,
              x: boss.x, y: boss.y,
              vx: Math.cos(angle) * 4, vy: Math.sin(angle) * 4,
              size: 8, damage: boss.damage * 0.9,
              isPlayer: false, color: '#7c3aed', duration: 150, type: 'shadow'
            });
          }
        }
      } else {
        // Life Drain
        if (dist < 180) {
          damagePlayer(boss.damage * 1.2);
          boss.health = Math.min(boss.maxHealth, boss.health + boss.damage * 0.5);
        }
      }
    }
  }

  // ─── FRANKENSTEIN'S BEHEMOTH ──────────────────────────────────────────────
  private static aiFrankenstein(
    boss: Enemy, player: PlayerState, dist: number, dx: number, dy: number,
    spawnEnemy: (e: Enemy) => void,
    triggerScreenShake: (intensity: number) => void,
    damagePlayer: (amount: number) => void
  ) {
    boss.stateTimer++;

    // Lumbering charge
    if (dist > 40) {
      boss.x += (dx / dist) * boss.speed;
      boss.y += (dy / dist) * boss.speed;
    }

    // Ground slam close range
    if (dist < 45 && boss.stateTimer % 25 === 0) {
      damagePlayer(boss.damage);
      triggerScreenShake(12);
    }

    if (boss.stateTimer >= boss.attackCooldown) {
      boss.stateTimer = 0;
      const r = Math.random();

      if (r < 0.4) {
        // Lightning Bolt (electromagnetic)
        damagePlayer(boss.currentPhase === 3 ? boss.damage * 2 : boss.damage * 1.3);
        triggerScreenShake(18);
      } else if (r < 0.7 && boss.currentPhase >= 2) {
        // Reanimate — self-heals on Phase 2
        boss.health = Math.min(boss.maxHealth, boss.health + 120);
      } else {
        // Toss a NightCreature at player as living weapon
        spawnEnemy({
          id: `thrown_${Date.now()}`,
          type: 'NightCreature', name: 'Thrown Creature', faction: 'CursedExperiments', evolutionTier: 1, isBloodMoonVariant: false,
          x: boss.x + (dx / dist) * 30,
          y: boss.y + (dy / dist) * 30,
          size: 12, health: 30, maxHealth: 30, damage: 10, speed: 2.2,
          xpReward: 5, isBoss: false, state: 'chase',
          stateTimer: 0, lastAttackTime: 0, attackCooldown: 40,
          currentPhase: 1, color: '#111827',
        });
      }
    }
  }

  // ─── SOBEK THE CROCODILE KING ─────────────────────────────────────────────
  private static aiCrocodileKing(
    boss: Enemy, player: PlayerState, dist: number, dx: number, dy: number,
    addProjectile: (p: Projectile) => void,
    triggerScreenShake: (intensity: number) => void,
    damagePlayer: (amount: number) => void
  ) {
    boss.stateTimer++;

    if (boss.state === 'boss_fly') {
      // Death Roll — spiraling charge
      const rollAngle = boss.stateTimer * 0.3;
      boss.x += (dx / dist) * boss.speed * 2.5 + Math.cos(rollAngle) * 2;
      boss.y += (dy / dist) * boss.speed * 2.5 + Math.sin(rollAngle) * 2;
      if (dist < 40) {
        damagePlayer(boss.damage * 2);
        triggerScreenShake(15);
        boss.state = 'chase';
        boss.stateTimer = 0;
      }
      return;
    }

    if (dist > 40) {
      boss.x += (dx / dist) * boss.speed;
      boss.y += (dy / dist) * boss.speed;
    }

    if (dist < 42 && boss.stateTimer % 30 === 0) {
      damagePlayer(boss.damage);
      triggerScreenShake(6);
    }

    if (boss.stateTimer >= boss.attackCooldown) {
      boss.stateTimer = 0;
      const r = Math.random();

      if (r < 0.4) {
        // Initiate Death Roll
        boss.state = 'boss_fly';
        boss.stateTimer = 0;
      } else {
        // Sewer Spit — toxic projectile spray
        for (let i = 0; i < 3; i++) {
          const spread = (i - 1) * 0.25;
          addProjectile({
            id: `spit_${Date.now()}_${i}`,
            x: boss.x, y: boss.y,
            vx: (dx / dist) * 5 + Math.cos(spread) * 2,
            vy: (dy / dist) * 5 + Math.sin(spread) * 2,
            size: 10, damage: boss.damage * 1.1,
            isPlayer: false, color: '#16a34a', duration: 130, type: 'poison_rain'
          });
        }
      }
    }
  }

  // ─── EMPEROR CAELUS THE ANCIENT DRAGON ────────────────────────────────────
  private static aiEmperorCaelus(
    boss: Enemy, player: PlayerState, dist: number, dx: number, dy: number,
    addProjectile: (p: Projectile) => void,
    triggerScreenShake: (intensity: number) => void,
    damagePlayer: (amount: number) => void
  ) {
    boss.stateTimer++;

    // Slow imposing pursuit
    if (dist > 80) {
      boss.x += (dx / dist) * boss.speed;
      boss.y += (dy / dist) * boss.speed;
    }

    // Wing buffet at close range
    if (dist < 60 && boss.stateTimer % 20 === 0) {
      damagePlayer(boss.damage * 0.7);
      triggerScreenShake(5);
    }

    if (boss.stateTimer >= boss.attackCooldown) {
      boss.stateTimer = 0;
      const r = Math.random();

      if (r < 0.35) {
        // Dragon Fire Breath — massive cone, 5 projectiles
        for (let i = 0; i < 5; i++) {
          const spread = (i - 2) * 0.22;
          addProjectile({
            id: `dragonfire_${Date.now()}_${i}`,
            x: boss.x, y: boss.y,
            vx: (dx / dist) * 7 + Math.cos(spread) * 3,
            vy: (dy / dist) * 7 + Math.sin(spread) * 3,
            size: 14, damage: boss.damage,
            isPlayer: false, color: '#f97316', duration: 140, type: 'fireball'
          });
        }
        triggerScreenShake(8);
      } else if (r < 0.6) {
        // Meteor Strike — 360 ring
        for (let i = 0; i < 16; i++) {
          const angle = (Math.PI * 2 / 16) * i;
          addProjectile({
            id: `meteor_${Date.now()}_${i}`,
            x: boss.x, y: boss.y,
            vx: Math.cos(angle) * 5, vy: Math.sin(angle) * 5,
            size: 12, damage: boss.damage * 0.8,
            isPlayer: false, color: '#dc2626', duration: 180, type: 'fireball'
          });
        }
        triggerScreenShake(12);
      } else if (r < 0.8) {
        // Phase 3 Supernova
        if (boss.currentPhase === 3) {
          for (let i = 0; i < 24; i++) {
            const angle = (Math.PI * 2 / 24) * i;
            addProjectile({
              id: `supernova_${Date.now()}_${i}`,
              x: boss.x, y: boss.y,
              vx: Math.cos(angle) * 8, vy: Math.sin(angle) * 8,
              size: 16, damage: boss.damage * 1.5,
              isPlayer: false, color: '#fbbf24', duration: 200, type: 'fireball'
            });
          }
          triggerScreenShake(25);
          damagePlayer(boss.damage * 0.5);
        }
      } else {
        // Tail Swipe — close range massive hit
        if (dist < 90) {
          damagePlayer(boss.damage * 1.5);
          triggerScreenShake(20);
        }
      }
    }
  }
}

