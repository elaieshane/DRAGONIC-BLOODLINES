import React from 'react';
import { PlayerState, Item, ItemType } from '../types';
import { playSound } from './SoundEffects';
import CharacterVisualizer from './CharacterVisualizer';
import { Shield, Sword, Heart, Zap, Sparkles, Coins, Flame, ArrowUp } from 'lucide-react';

interface CharacterSheetProps {
  player: PlayerState;
  onEquip: (item: Item) => void;
  onUnequip: (type: ItemType) => void;
  onDiscard: (itemId: string) => void;
  onAllocateStat: (stat: 'strength' | 'agility' | 'arcane' | 'vitality') => void;
  onClose: () => void;
}

export default function CharacterSheet({
  player,
  onEquip,
  onUnequip,
  onDiscard,
  onAllocateStat,
  onClose,
}: CharacterSheetProps) {
  const [selectedItem, setSelectedItem] = React.useState<Item | null>(null);

  const getRarityColor = (rarity: Item['rarity']) => {
    switch (rarity) {
      case 'Dragonborn': return 'text-orange-300 border-orange-400 bg-orange-950/40';
      case 'Ancient':    return 'text-amber-200 border-amber-300 bg-amber-950/50';
      case 'Mythic':     return 'text-violet-300 border-violet-400 bg-violet-950/40';
      case 'Legendary':  return 'text-amber-400 border-amber-500 bg-amber-950/30';
      case 'Epic':       return 'text-purple-400 border-purple-500 bg-purple-950/30';
      case 'Rare':       return 'text-blue-400 border-blue-500 bg-blue-950/30';
      default:           return 'text-zinc-400 border-zinc-600 bg-zinc-900/30';
    }
  };

  const getRarityBorder = (rarity: Item['rarity']) => {
    switch (rarity) {
      case 'Dragonborn': return 'border-orange-400/80 shadow-[0_0_12px_rgba(251,146,60,0.4)]';
      case 'Ancient':    return 'border-amber-200/80 shadow-[0_0_12px_rgba(253,230,138,0.4)]';
      case 'Mythic':     return 'border-violet-500/80 shadow-[0_0_12px_rgba(167,139,250,0.3)]';
      case 'Legendary':  return 'border-amber-500/80 shadow-[0_0_10px_rgba(245,158,11,0.2)]';
      case 'Epic':       return 'border-purple-500/80 shadow-[0_0_10px_rgba(168,85,247,0.2)]';
      case 'Rare':       return 'border-blue-500/80 shadow-[0_0_10px_rgba(59,130,246,0.2)]';
      default:           return 'border-zinc-700/80';
    }
  };

  const handleItemClick = (item: Item) => {
    playSound('hit');
    setSelectedItem(item);
  };

  // Calculate base stats + equipment boosts
  const getFullStats = () => {
    const base = { ...player.stats };
    const equipped = [
      player.equipped.Weapon,
      player.equipped.Armor,
      player.equipped.Ring,
      player.equipped.Relic,
      player.equipped.Crest,
      player.equipped.Scroll,
    ].filter((i): i is Item => i !== null);

    let bonusHp = 0;
    let bonusDmg = 0;
    let bonusDef = 0;
    let lifesteal = 0;
    let manaRegen = 1.0; // Base regen is 1 mana/sec

    equipped.forEach(item => {
      if (item.stats.strength) base.strength += item.stats.strength;
      if (item.stats.agility) base.agility += item.stats.agility;
      if (item.stats.arcane) base.arcane += item.stats.arcane;
      if (item.stats.vitality) base.vitality += item.stats.vitality;
      if (item.stats.defense) bonusDef += item.stats.defense;
      if (item.stats.damage) bonusDmg += item.stats.damage;
      if (item.stats.lifesteal) lifesteal += item.stats.lifesteal;
      if (item.stats.manaRegen) manaRegen += item.stats.manaRegen;
    });

    const maxHp = 100 + base.vitality * 4 + bonusHp;
    const maxMana = 50 + base.arcane * 3;
    const physicalDmg = Math.round(10 + base.strength * 1.5 + bonusDmg);
    const spellDmg = Math.round(15 + base.arcane * 2.0);
    const defense = Math.round(base.vitality * 0.2 + bonusDef);
    const attackSpeedPercent = Math.min(150, base.agility * 1.5); // Max +150%
    const dashCooldownSeconds = Math.max(0.6, 2.5 - base.agility * 0.05);

    return {
      strength: base.strength,
      agility: base.agility,
      arcane: base.arcane,
      vitality: base.vitality,
      maxHp,
      maxMana,
      physicalDmg,
      spellDmg,
      defense,
      attackSpeedPercent,
      dashCooldownSeconds,
      lifesteal,
      manaRegen,
    };
  };

  const stats = getFullStats();

  return (
    <div id="character_sheet" className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans text-zinc-200">
      <div className="relative w-full max-w-4xl rounded-xl border border-red-900/40 bg-zinc-950 p-6 shadow-2xl md:p-8 overflow-y-auto max-h-[90vh]">
        
        {/* Close Button */}
        <button 
          onClick={() => { playSound('hit'); onClose(); }}
          className="absolute top-4 right-4 text-zinc-400 hover:text-red-500 transition-colors text-2xl"
        >
          ✕
        </button>

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold tracking-wider text-red-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            GOTHIC INVENTORY & PROGRESSION
          </h2>
          <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">
            Level {player.level} {player.class.replace(/([A-Z])/g, ' $1').trim()}
          </p>
        </div>

        {/* Level & XP progression bar */}
        <div className="mb-6 rounded-lg bg-zinc-900/80 p-3 border border-red-950/60">
          <div className="flex justify-between text-xs font-mono mb-1 text-zinc-400">
            <span>XP Progress: {player.xp} / {player.xpNeeded}</span>
            <span className="text-amber-400">Gold: {player.gold} <Coins className="inline-block w-3.5 h-3.5 ml-1" /></span>
          </div>
          <div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
            <div 
              className="h-full bg-gradient-to-r from-red-600 to-amber-500 transition-all duration-300" 
              style={{ width: `${Math.min(100, (player.xp / player.xpNeeded) * 100)}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Column 1: Attributes & Core Stats (4 cols) */}
          <div className="md:col-span-4 flex flex-col gap-4">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
              <h3 className="text-lg font-semibold text-red-400 border-b border-zinc-800 pb-2 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Core Attributes
              </h3>
              
              {player.statPoints > 0 && (
                <div className="mb-3 px-3 py-1.5 rounded bg-red-950/40 border border-red-800 text-red-400 text-xs font-semibold flex items-center justify-between animate-pulse">
                  <span>Available Stat Points: {player.statPoints}</span>
                  <ArrowUp className="w-3.5 h-3.5" />
                </div>
              )}

              <div className="flex flex-col gap-3 font-mono">
                {/* Strength */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-zinc-300 flex items-center gap-1.5">
                      <Sword className="w-3.5 h-3.5 text-orange-400" /> STRENGTH
                    </span>
                    <span className="text-[10px] text-zinc-500">+{stats.strength * 1.5} Melee Damage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-orange-400">{stats.strength}</span>
                    {player.statPoints > 0 && (
                      <button 
                        onClick={() => onAllocateStat('strength')}
                        className="px-2 py-0.5 rounded bg-red-900 hover:bg-red-700 text-white font-bold text-xs"
                      >
                        +
                      </button>
                    )}
                  </div>
                </div>

                {/* Agility */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-zinc-300 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-blue-400" /> AGILITY
                    </span>
                    <span className="text-[10px] text-zinc-500">+{stats.attackSpeedPercent.toFixed(0)}% Attack Speed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-blue-400">{stats.agility}</span>
                    {player.statPoints > 0 && (
                      <button 
                        onClick={() => onAllocateStat('agility')}
                        className="px-2 py-0.5 rounded bg-red-900 hover:bg-red-700 text-white font-bold text-xs"
                      >
                        +
                      </button>
                    )}
                  </div>
                </div>

                {/* Arcane */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-zinc-300 flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-purple-400" /> ARCANE
                    </span>
                    <span className="text-[10px] text-zinc-500">Spell & Fire Focus</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-purple-400">{stats.arcane}</span>
                    {player.statPoints > 0 && (
                      <button 
                        onClick={() => onAllocateStat('arcane')}
                        className="px-2 py-0.5 rounded bg-red-900 hover:bg-red-700 text-white font-bold text-xs"
                      >
                        +
                      </button>
                    )}
                  </div>
                </div>

                {/* Vitality */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-zinc-300 flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-emerald-400" /> VITALITY
                    </span>
                    <span className="text-[10px] text-zinc-500">+{stats.vitality * 4} Max HP</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-emerald-400">{stats.vitality}</span>
                    {player.statPoints > 0 && (
                      <button 
                        onClick={() => onAllocateStat('vitality')}
                        className="px-2 py-0.5 rounded bg-red-900 hover:bg-red-700 text-white font-bold text-xs"
                      >
                        +
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Combat Stats Display */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 font-mono text-xs flex flex-col gap-2">
              <h4 className="text-zinc-400 font-bold uppercase mb-1">Derived Combat Stats</h4>
              <div className="flex justify-between">
                <span>Health Points:</span>
                <span className="text-emerald-400">{player.health} / {stats.maxHp}</span>
              </div>
              <div className="flex justify-between">
                <span>Mana Points:</span>
                <span className="text-purple-400">{player.mana} / {stats.maxMana}</span>
              </div>
              <div className="flex justify-between">
                <span>Melee Damage:</span>
                <span className="text-orange-400">{stats.physicalDmg}</span>
              </div>
              <div className="flex justify-between">
                <span>Spell Damage:</span>
                <span className="text-purple-400">{stats.spellDmg}</span>
              </div>
              <div className="flex justify-between">
                <span>Block / Defense:</span>
                <span className="text-zinc-300">{stats.defense}</span>
              </div>
              <div className="flex justify-between">
                <span>Dash Cooldown:</span>
                <span className="text-blue-400">{stats.dashCooldownSeconds.toFixed(2)}s</span>
              </div>
              <div className="flex justify-between">
                <span>Lifesteal:</span>
                <span className="text-red-500">{(stats.lifesteal * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Mana Regen:</span>
                <span className="text-blue-300">+{stats.manaRegen.toFixed(1)}/s</span>
              </div>
            </div>
          </div>

          {/* Column 2: Equipment & Inventory Grid (5 cols) */}
          <div className="md:col-span-5 flex flex-col gap-4">
            {/* Equipment slots with live humanoid visualizer */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 flex flex-col items-center">
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3 self-start">Equipped Items</h3>
              
              <div className="w-full grid grid-cols-12 gap-3 items-center">
                {/* Left side slots (Weapon, Armor) (col-span-3) */}
                <div className="col-span-3 flex flex-col gap-4">
                  {/* Weapon Slot */}
                  {(() => {
                    const type = 'Weapon';
                    const item = player.equipped[type];
                    return (
                      <div className="flex flex-col items-center">
                        <span className="text-[9px] text-zinc-500 uppercase mb-1 font-mono">{type}</span>
                        {item ? (
                          <div 
                            onClick={() => handleItemClick(item)}
                            className={`w-14 h-14 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-transform hover:scale-105 bg-zinc-950 p-1 relative group ${getRarityBorder(item.rarity)}`}
                          >
                            <div className={`text-xl ${getRarityColor(item.rarity)}`}>⚔️</div>
                            <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  playSound('chest');
                                  onUnequip(type);
                                }}
                                className="text-[9px] bg-red-950 text-red-400 border border-red-800 rounded px-1"
                              >
                                UNEQUIP
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-lg border border-dashed border-zinc-800 bg-zinc-950/20 flex items-center justify-center text-zinc-700 text-lg">
                            ∅
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Armor Slot */}
                  {(() => {
                    const type = 'Armor';
                    const item = player.equipped[type];
                    return (
                      <div className="flex flex-col items-center">
                        <span className="text-[9px] text-zinc-500 uppercase mb-1 font-mono">{type}</span>
                        {item ? (
                          <div 
                            onClick={() => handleItemClick(item)}
                            className={`w-14 h-14 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-transform hover:scale-105 bg-zinc-950 p-1 relative group ${getRarityBorder(item.rarity)}`}
                          >
                            <div className={`text-xl ${getRarityColor(item.rarity)}`}>🛡️</div>
                            <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  playSound('chest');
                                  onUnequip(type);
                                }}
                                className="text-[9px] bg-red-950 text-red-400 border border-red-800 rounded px-1"
                              >
                                UNEQUIP
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-lg border border-dashed border-zinc-800 bg-zinc-950/20 flex items-center justify-center text-zinc-700 text-lg">
                            ∅
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Center visualizer (col-span-6) */}
                <div className="col-span-6 flex flex-col items-center justify-center bg-zinc-950/90 border border-zinc-900 rounded-xl p-3 min-h-[140px] shadow-inner relative">
                  <CharacterVisualizer 
                    playerClass={player.class}
                    customization={player.customization}
                    equippedWeapon={player.equipped.Weapon || undefined}
                    equippedArmor={player.equipped.Armor || undefined}
                    width={110}
                    height={130}
                    scale={3.2}
                    isAnimated={true}
                  />
                  <div className="absolute bottom-1.5 text-[8px] uppercase tracking-wider text-zinc-500 font-mono">
                    Living Avatar
                  </div>
                </div>

                {/* Right side slots (Ring, Relic) (col-span-3) */}
                <div className="col-span-3 flex flex-col gap-4">
                  {/* Ring Slot */}
                  {(() => {
                    const type = 'Ring';
                    const item = player.equipped[type];
                    return (
                      <div className="flex flex-col items-center">
                        <span className="text-[9px] text-zinc-500 uppercase mb-1 font-mono">{type}</span>
                        {item ? (
                          <div 
                            onClick={() => handleItemClick(item)}
                            className={`w-14 h-14 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-transform hover:scale-105 bg-zinc-950 p-1 relative group ${getRarityBorder(item.rarity)}`}
                          >
                            <div className={`text-xl ${getRarityColor(item.rarity)}`}>💍</div>
                            <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={(e) => { e.stopPropagation(); playSound('chest'); onUnequip(type); }}
                                className="text-[9px] bg-red-950 text-red-400 border border-red-800 rounded px-1"
                              >
                                UNEQUIP
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-lg border border-dashed border-zinc-800 bg-zinc-950/20 flex items-center justify-center text-zinc-700 text-lg">∅</div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Relic Slot */}
                  {(() => {
                    const type = 'Relic';
                    const item = player.equipped[type];
                    return (
                      <div className="flex flex-col items-center">
                        <span className="text-[9px] text-zinc-500 uppercase mb-1 font-mono">{type}</span>
                        {item ? (
                          <div 
                            onClick={() => handleItemClick(item)}
                            className={`w-14 h-14 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-transform hover:scale-105 bg-zinc-950 p-1 relative group ${getRarityBorder(item.rarity)}`}
                          >
                            <div className={`text-xl ${getRarityColor(item.rarity)}`}>🏺</div>
                            <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={(e) => { e.stopPropagation(); playSound('chest'); onUnequip(type); }}
                                className="text-[9px] bg-red-950 text-red-400 border border-red-800 rounded px-1"
                              >
                                UNEQUIP
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-lg border border-dashed border-zinc-800 bg-zinc-950/20 flex items-center justify-center text-zinc-700 text-lg">∅</div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Crest Slot */}
                  {(() => {
                    const type = 'Crest';
                    const item = player.equipped[type];
                    return (
                      <div className="flex flex-col items-center">
                        <span className="text-[9px] text-amber-700 uppercase mb-1 font-mono">{type}</span>
                        {item ? (
                          <div 
                            onClick={() => handleItemClick(item)}
                            className={`w-14 h-14 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-transform hover:scale-105 bg-zinc-950 p-1 relative group ${getRarityBorder(item.rarity)}`}
                          >
                            <div className="text-2xl">{item.icon || '🔥'}</div>
                            <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={(e) => { e.stopPropagation(); playSound('chest'); onUnequip(type); }}
                                className="text-[9px] bg-red-950 text-red-400 border border-red-800 rounded px-1"
                              >
                                UNEQUIP
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-lg border border-dashed border-amber-900/40 bg-amber-950/10 flex flex-col items-center justify-center text-amber-900 text-xs font-mono"><span className="text-2xl opacity-30">🔥</span></div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Scroll Slot */}
                  {(() => {
                    const type = 'Scroll';
                    const item = player.equipped[type];
                    return (
                      <div className="flex flex-col items-center">
                        <span className="text-[9px] text-blue-700 uppercase mb-1 font-mono">{type}</span>
                        {item ? (
                          <div 
                            onClick={() => handleItemClick(item)}
                            className={`w-14 h-14 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-transform hover:scale-105 bg-zinc-950 p-1 relative group ${getRarityBorder(item.rarity)}`}
                          >
                            <div className="text-2xl">{item.icon || '📜'}</div>
                            <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={(e) => { e.stopPropagation(); playSound('chest'); onUnequip(type); }}
                                className="text-[9px] bg-red-950 text-red-400 border border-red-800 rounded px-1"
                              >
                                UNEQUIP
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-lg border border-dashed border-blue-900/40 bg-blue-950/10 flex flex-col items-center justify-center text-blue-900 text-xs font-mono"><span className="text-2xl opacity-30">📜</span></div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Relic Slot */}
                  {(() => {
                    const type = 'Relic';
                    const item = player.equipped[type];
                    return (
                      <div className="flex flex-col items-center">
                        <span className="text-[9px] text-zinc-500 uppercase mb-1 font-mono">{type}</span>
                        {item ? (
                          <div 
                            onClick={() => handleItemClick(item)}
                            className={`w-14 h-14 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-transform hover:scale-105 bg-zinc-950 p-1 relative group ${getRarityBorder(item.rarity)}`}
                          >
                            <div className={`text-xl ${getRarityColor(item.rarity)}`}>🏺</div>
                            <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  playSound('chest');
                                  onUnequip(type);
                                }}
                                className="text-[9px] bg-red-950 text-red-400 border border-red-800 rounded px-1"
                              >
                                UNEQUIP
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-lg border border-dashed border-zinc-800 bg-zinc-950/20 flex items-center justify-center text-zinc-700 text-lg">
                            ∅
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Inventory Grid */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 flex-1 flex flex-col">
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3 flex justify-between items-center">
                <span>Inventory ({player.inventory.length}/20)</span>
                {player.inventory.length === 0 && <span className="text-xs text-zinc-600 italic">Empty</span>}
              </h3>
              
              <div className="grid grid-cols-5 gap-2 overflow-y-auto max-h-[220px] p-0.5">
                {player.inventory.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-transform hover:scale-105 p-1 relative bg-zinc-950 ${selectedItem?.id === item.id ? 'ring-2 ring-red-500' : ''} ${getRarityBorder(item.rarity)}`}
                    title={item.name}
                  >
                    <div className="text-xl">
                      {item.type === 'Weapon'  ? '⚔️'
                      : item.type === 'Armor'   ? '🛡️'
                      : item.type === 'Ring'    ? '💍'
                      : item.type === 'Crest'   ? (item.icon || '🔥')
                      : item.type === 'Scroll'  ? (item.icon || '📜')
                      : item.type === 'PetEgg'  ? '🥚'
                      : '🏺'}
                    </div>
                  </div>
                ))}

                {/* Fill rest of grid up to 20 slots */}
                {Array.from({ length: Math.max(0, 20 - player.inventory.length) }).map((_, i) => (
                  <div 
                    key={`empty-${i}`} 
                    className="w-12 h-12 rounded-lg border border-zinc-800/40 bg-zinc-950/10"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Column 3: Selected Item Info Panel (3 cols) */}
          <div className="md:col-span-3 flex flex-col">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 flex-1 flex flex-col justify-between">
              {selectedItem ? (
                <div className="flex flex-col gap-3 h-full justify-between">
                  <div>
                    {/* Header with name and rarity */}
                    <div className="text-center pb-2 border-b border-zinc-800/80">
                      <span className={`text-[10px] uppercase font-mono font-bold tracking-widest ${getRarityColor(selectedItem.rarity)}`}>
                        {selectedItem.rarity}
                      </span>
                      <h4 className="text-base font-bold text-white leading-tight mt-1">
                        {selectedItem.name}
                      </h4>
                      <p className="text-[10px] text-zinc-500 mt-1 uppercase font-mono">{selectedItem.type}</p>
                    </div>

                    {/* Stats List */}
                    <div className="my-3 py-2 px-3 rounded bg-zinc-900/60 font-mono text-xs text-zinc-300 flex flex-col gap-1.5">
                      {Object.entries(selectedItem.stats).map(([statName, statValue]) => {
                        let displayName = statName.toUpperCase();
                        let prefix = '+';
                        let postfix = '';

                        if (statName === 'lifesteal') {
                          postfix = '%';
                          statValue = Math.round((statValue as number) * 100);
                        } else if (statName === 'manaRegen') {
                          postfix = '/s';
                        }

                        return (
                          <div key={statName} className="flex justify-between">
                            <span className="text-zinc-500">{displayName}:</span>
                            <span className="text-amber-400 font-bold">{prefix}{statValue}{postfix}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Description lore */}
                    <p className="text-xs text-zinc-400 italic leading-relaxed text-center font-serif">
                      "{selectedItem.description}"
                    </p>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex flex-col gap-2 mt-4 pt-3 border-t border-zinc-900">
                    <button 
                      onClick={() => {
                        playSound('levelup');
                        onEquip(selectedItem);
                        setSelectedItem(null);
                      }}
                      className="w-full py-2 bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-600 text-white font-mono font-bold text-xs rounded transition-colors"
                    >
                      EQUIP ITEM
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => {
                          playSound('chest');
                          onDiscard(selectedItem.id);
                          setSelectedItem(null);
                        }}
                        className="py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 font-mono text-[10px] rounded"
                      >
                        DISCARD
                      </button>
                      <button 
                        onClick={() => {
                          // Sell for gold
                          const goldReward = selectedItem.rarity === 'Legendary' ? 150 : selectedItem.rarity === 'Epic' ? 80 : selectedItem.rarity === 'Rare' ? 40 : 15;
                          player.gold += goldReward;
                          playSound('chest');
                          onDiscard(selectedItem.id);
                          setSelectedItem(null);
                        }}
                        className="py-1.5 bg-zinc-900 hover:bg-amber-950/40 border border-amber-900/40 text-amber-500 font-mono text-[10px] rounded"
                      >
                        SELL (G)
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center h-full text-zinc-600 italic py-12">
                  <div className="text-3xl mb-2">🛡️</div>
                  <p className="text-xs">Select an item from inventory to examine, equip, sell or discard.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── Active Pet Panel ─────────────────────────────────────── */}
        {player.activePet && (() => {
          const pet = player.activePet!;
          const bp = { Ash: '🔥', Umbra: '🌑', BoneHound: '🦴', SeraphRaven: '✨', IronBear: '🐻', VoidOwl: '🦉' }[pet.species] || '🐾';
          const evolutionNames: Record<string, string[]> = {
            Ash: ['Ash', 'Young Flame Drake', 'Ancient Flame Dragon'],
            Umbra: ['Umbra', 'Shadowcat', 'Eclipse Panther'],
            BoneHound: ['Bone Pup', 'Bone Hound', 'Hellhound Alpha'],
            SeraphRaven: ['Seraph Fledgling', 'Seraph Raven', 'Divine Raven'],
            IronBear: ['Iron Cub', 'Iron Bear', 'Titanborn Behemoth'],
            VoidOwl: ['Void Owlet', 'Void Owl', 'Singularity Owl'],
          };
          const evolutionName = (evolutionNames[pet.species] || [])[pet.evolutionStage] || pet.name;
          const moodColor = { Happy: 'text-green-400', Calm: 'text-blue-300', Aggressive: 'text-red-400', Exhausted: 'text-zinc-400', Bonded: 'text-amber-400' }[pet.mood] || 'text-zinc-300';
          const bondColor = pet.bond >= 75 ? 'bg-amber-500' : pet.bond >= 50 ? 'bg-emerald-500' : pet.bond >= 25 ? 'bg-blue-500' : 'bg-zinc-500';
          const rarityGlow = pet.rarity === 'Legendary' ? 'border-amber-500 shadow-[0_0_16px_rgba(245,158,11,0.25)]' : pet.rarity === 'Epic' ? 'border-purple-500' : pet.rarity === 'Mythic' ? 'border-violet-400 shadow-[0_0_20px_rgba(167,139,250,0.3)]' : 'border-zinc-700';
          return (
            <div className={`mt-6 border-t border-zinc-800/60 pt-4`}>
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span>🐾</span> Active Familiar — <span className="text-amber-400">{evolutionName}</span>
              </h3>
              <div className={`rounded-xl border-2 ${rarityGlow} bg-zinc-950/80 p-5 flex flex-col md:flex-row gap-6`}>
                {/* Pet Identity */}
                <div className="flex flex-col items-center gap-2 min-w-[100px]">
                  <div className="text-6xl">{bp}</div>
                  <span className={`text-xs font-mono font-bold uppercase tracking-widest ${moodColor}`}>{pet.mood}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">{pet.rarity}</span>
                  <span className="text-[10px] text-zinc-400 font-mono">{pet.petClass} Class</span>
                </div>
                {/* Stats */}
                <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-2 font-mono text-xs">
                  <div><span className="text-zinc-500">Name:</span> <span className="text-zinc-100 font-bold">{pet.name}</span></div>
                  <div><span className="text-zinc-500">Level:</span> <span className="text-amber-400 font-bold">{pet.level}</span></div>
                  <div><span className="text-zinc-500">Evolution:</span> <span className="text-emerald-400">{evolutionName}</span></div>
                  <div><span className="text-zinc-500">Attack:</span> <span className="text-orange-400">{pet.attack}</span></div>
                  <div><span className="text-zinc-500">Defense:</span> <span className="text-blue-400">{pet.defense}</span></div>
                  <div><span className="text-zinc-500">AI State:</span> <span className="text-purple-300">{pet.aiState}</span></div>

                  {/* HP Bar */}
                  <div className="col-span-2">
                    <div className="flex justify-between mb-1"><span className="text-zinc-500">HP:</span><span className="text-emerald-400">{pet.hp} / {pet.maxHp}</span></div>
                    <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                      <div className="h-full bg-gradient-to-r from-emerald-700 to-emerald-400 transition-all" style={{ width: `${(pet.hp / pet.maxHp) * 100}%` }} />
                    </div>
                  </div>

                  {/* Bond Bar */}
                  <div className="col-span-2">
                    <div className="flex justify-between mb-1"><span className="text-zinc-500">Bond:</span><span className="text-amber-400">{pet.bond.toFixed(0)}%</span></div>
                    <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                      <div className={`h-full ${bondColor} transition-all`} style={{ width: `${pet.bond}%` }} />
                    </div>
                  </div>

                  {/* XP Bar */}
                  <div className="col-span-2">
                    <div className="flex justify-between mb-1"><span className="text-zinc-500">Pet XP:</span><span className="text-purple-400">{pet.experience} / {pet.xpNeeded}</span></div>
                    <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                      <div className="h-full bg-gradient-to-r from-purple-700 to-purple-400 transition-all" style={{ width: `${(pet.experience / pet.xpNeeded) * 100}%` }} />
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div className="flex flex-col gap-2 min-w-[160px]">
                  <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-2.5">
                    <span className="text-[9px] text-zinc-500 uppercase font-mono">Passive</span>
                    <p className="text-xs text-amber-300 font-bold mt-0.5">{pet.passiveSkill.name}</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">{pet.passiveSkill.description}</p>
                  </div>
                  <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-2.5">
                    <span className="text-[9px] text-zinc-500 uppercase font-mono">Active</span>
                    <p className="text-xs text-blue-300 font-bold mt-0.5">{pet.activeSkill.name}</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">{pet.activeSkill.description}</p>
                  </div>
                  <div className="rounded-lg border border-purple-900/40 bg-purple-950/20 p-2.5">
                    <span className="text-[9px] text-purple-500 uppercase font-mono">Ultimate</span>
                    <p className="text-xs text-purple-300 font-bold mt-0.5">{pet.ultimateSkill.name}</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">{pet.ultimateSkill.description}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Character Boons / Perks section */}
        <div className="mt-6 border-t border-zinc-800/60 pt-4">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
            Active Gothic Boons ({player.activeBoons.length})
          </h3>
          {player.activeBoons.length === 0 ? (
            <p className="text-xs text-zinc-600 italic">No gothic boons unlocked yet. Defeat enemies to gain experience and select boons when leveling up.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {player.activeBoons.map(boon => {
                let desc = '';
                let color = 'from-red-950/40 to-black';
                let borderColor = 'border-red-900/20';

                if (boon === 'Vampiric Touch') {
                  desc = 'Defeating an enemy heals you for 5% of your max HP.';
                  color = 'from-red-950/30 to-zinc-950';
                  borderColor = 'border-red-900/30';
                } else if (boon === "Dragon's Breath") {
                  desc = 'Attacks ignite targets, dealing 5% of your damage over 3 seconds.';
                  color = 'from-amber-950/30 to-zinc-950';
                  borderColor = 'border-amber-950/30';
                } else if (boon === 'Blood Shield') {
                  desc = 'Negate damage from the next hit you take (20 sec cooldown).';
                  color = 'from-rose-950/30 to-zinc-950';
                  borderColor = 'border-rose-900/30';
                } else if (boon === 'Double Cast') {
                  desc = 'Your projectile attacks have a 25% chance to cast twice.';
                  color = 'from-purple-950/30 to-zinc-950';
                  borderColor = 'border-purple-900/30';
                } else if (boon === 'Shadow Step') {
                  desc = 'Your dash leaves behind shadow particles that damage nearby targets.';
                  color = 'from-zinc-900 to-zinc-950';
                  borderColor = 'border-zinc-800';
                }

                return (
                  <div 
                    key={boon}
                    className={`rounded-lg p-2.5 border bg-gradient-to-br ${color} ${borderColor}`}
                  >
                    <span className="text-xs font-bold text-red-400 block mb-0.5">{boon}</span>
                    <span className="text-[10px] text-zinc-400 leading-normal block">{desc}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
