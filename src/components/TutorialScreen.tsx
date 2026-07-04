import React, { useState } from 'react';
import { PlayerClass } from '../types';
import { playSound } from './SoundEffects';
import { 
  Shield, Flame, Zap, Heart, Key, Compass, Award, Skull, Sword, 
  ArrowRight, Move, ZapOff, Sparkles, HelpCircle 
} from 'lucide-react';

import combatImg from '../assets/images/gothic_combat_1783099557576.jpg';
import magicImg from '../assets/images/gothic_dragon_fire_1783099571712.jpg';
import bossImg from '../assets/images/gothic_boss_arena_1783099595514.jpg';
import movementImg from '../assets/images/gothic_graveyard_1783099540725.jpg';

interface TutorialScreenProps {
  playerClass: PlayerClass;
  onDescend: () => void;
}

export default function TutorialScreen({ playerClass, onDescend }: TutorialScreenProps) {
  const [activeTab, setActiveTab] = useState<'movement' | 'combat' | 'magic' | 'boss'>('movement');

  const getClassNameText = () => {
    switch(playerClass) {
      case 'RenegadeVampire': return 'Renegade Vampire 🩸';
      case 'DraconicKnight': return 'Draconic Knight 🔥';
      default: return 'Vampire Hunter 🛡️';
    }
  };

  const handleStartGame = () => {
    playSound('stairs');
    onDescend();
  };

  const selectTab = (tab: typeof activeTab) => {
    playSound('hit');
    setActiveTab(tab);
  };

  const tabProgress: Record<typeof activeTab, number> = {
    movement: 25,
    combat: 50,
    magic: 75,
    boss: 100,
  };

  // Image path resolver based on current tutorial page
  const getIllustrationSrc = () => {
    switch (activeTab) {
      case 'combat':
        return combatImg;
      case 'magic':
        return magicImg;
      case 'boss':
        return bossImg;
      case 'movement':
      default:
        return movementImg;
    }
  };

  const getIllustrationTitle = () => {
    switch (activeTab) {
      case 'combat': return 'ACT I: SEVER THE VEINS OF THE NIGHT';
      case 'magic': return 'ACT II: THE AWAKENING FIRE OF PRIMORDIAL KINGS';
      case 'boss': return 'ACT III: CONFRONT THE ARCH-FIENDS AT THE ALTAR';
      case 'movement':
      default: return 'PROLOGUE: BREAK THE BARRIER OF THE SEPULCHER';
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#050507] text-zinc-100 flex items-center justify-center p-3 md:p-6 font-sans select-none relative overflow-hidden">
      
      {/* Background Dark Ambience with Blood Red grid */}
      <div className="absolute inset-0 z-0 opacity-15 bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:20px_20px]" />
      
      {/* Main split container */}
      <div className="w-full max-w-5xl bg-zinc-950/95 border border-red-950/40 rounded-2xl shadow-2xl flex flex-col md:flex-row items-stretch z-10 relative overflow-hidden backdrop-blur-md gothic-corner-tl gothic-corner-tr gothic-corner-bl gothic-corner-br">
        
        {/* LEFT SIDE: Cinematic Full-Height Illustration */}
        <div className="w-full md:w-1/2 flex flex-col justify-between p-6 relative overflow-hidden border-b md:border-b-0 md:border-r border-zinc-900/80 min-h-[250px] md:min-h-[480px]">
          {/* Active Illustration Background */}
          <div className="absolute inset-0 z-0">
            <img 
              src={getIllustrationSrc()} 
              alt={getIllustrationTitle()} 
              className="w-full h-full object-cover opacity-60 filter brightness-75 scale-100 hover:scale-105 transition-transform duration-[1200ms] pointer-events-none"
              referrerPolicy="no-referrer"
            />
            {/* Dark gradient shadow */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
          </div>

          {/* Top category label */}
          <div className="z-10 flex items-center gap-2">
            <div className="px-2.5 py-1 bg-red-950/90 border border-red-800 rounded font-mono text-[9px] text-red-400 font-black uppercase tracking-wider">
              Gothic Chronicle
            </div>
            <span className="text-[10px] text-zinc-400 font-mono italic">Compiled by the Guild</span>
          </div>

          {/* Bottom active artwork lore text */}
          <div className="z-10 bg-zinc-950/85 border border-zinc-900/60 p-4 rounded-xl backdrop-blur-sm">
            <span className="text-yellow-500 font-mono text-[8px] font-bold uppercase tracking-widest block mb-1">
              {getIllustrationTitle()}
            </span>
            <p className="text-xs text-zinc-300 font-serif leading-relaxed italic">
              {activeTab === 'movement' && '"Every stone tomb harbors a threat. Watch your footing in the dead crypts, or join the ashes of the long-forgotten."'}
              {activeTab === 'combat' && '"Slicing through a vampire lord requires rhythmic aggression. Do not let them circle behind your iron guards."'}
              {activeTab === 'magic' && '"Let the dragun flame boil the blood pools. Your ancient bloodline channels raw power when magic rings are worn."'}
              {activeTab === 'boss' && '"Vlad the Lord waits on Floor 2. Survive his teleports and siphons, and you may find the key to the volcanic Maw."'}
            </p>
          </div>
        </div>

        {/* RIGHT SIDE: Interactive Tutorial Guide Tab Area */}
        <div className="w-full md:w-1/2 flex flex-col justify-between p-6 md:p-8">
          
          {/* Header */}
          <div className="border-b border-zinc-900 pb-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-yellow-500 font-mono text-[9px] font-bold uppercase tracking-widest">
                PRE-DESCENT DEBRIEFING
              </span>
              <div className="rounded-full border border-red-800/70 bg-red-950/30 px-2.5 py-1 text-[9px] font-mono uppercase tracking-[0.25em] text-red-300">
                {tabProgress[activeTab]}% Ready
              </div>
            </div>
            <h1 className="text-xl md:text-2xl font-black font-serif text-zinc-100 tracking-wider mt-1">
              DRACONIC BLOODLINE GUIDE
            </h1>
            <p className="text-xs text-zinc-400 mt-1 font-serif leading-relaxed">
              Equipping your <span className="text-red-400 font-bold font-mono">{getClassNameText()}</span> with the knowledge needed to survive the truth beneath the cathedral.
            </p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-zinc-900">
              <div className="h-full rounded-full bg-gradient-to-r from-red-800 to-red-500 transition-all duration-300" style={{ width: `${tabProgress[activeTab]}%` }} />
            </div>
          </div>

          {/* Tab Selection Row */}
          <div className="grid grid-cols-4 bg-zinc-950 p-1 rounded-lg border border-zinc-900/80 my-5 gap-1">
            {(['movement', 'combat', 'magic', 'boss'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => selectTab(tab)}
                className={`py-2 text-[10px] font-mono rounded cursor-pointer transition-all uppercase ${
                  activeTab === tab 
                    ? 'bg-red-950/50 text-red-400 font-bold border border-red-900/50 shadow-[0_0_10px_rgba(239,68,68,0.15)]' 
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/60'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Interactive Page Content Body */}
          <div className="flex-1 flex flex-col justify-between min-h-[180px] mb-5">
            
            {/* TAB 1: MOVEMENT */}
            {activeTab === 'movement' && (
              <div className="flex flex-col gap-3 animate-fade-in">
                <div className="flex items-center gap-2">
                  <Move className="w-4 h-4 text-red-500" />
                  <h3 className="text-xs font-bold font-mono text-zinc-200 uppercase">Movement & Exploration</h3>
                </div>
                
                <p className="text-[11px] text-zinc-400 font-serif leading-relaxed">
                  Steer your character through dark corridors, avoiding spikes, crumbling fire grates, and blood pools. Move toward golden treasure chests to plunder legendary weapons and health items.
                </p>

                <div className="bg-zinc-950/60 p-3 rounded border border-zinc-900 font-mono text-xs flex flex-col gap-2">
                  <div className="flex justify-between border-b border-zinc-900/60 pb-1.5">
                    <span className="text-zinc-500">Keyboard Walk:</span>
                    <span className="text-zinc-300 font-bold">W, A, S, D / Arrows</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Virtual Joystick:</span>
                    <span className="text-amber-500 font-bold">Touch & Drag (On Screen)</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: COMBAT */}
            {activeTab === 'combat' && (
              <div className="flex flex-col gap-3 animate-fade-in">
                <div className="flex items-center gap-2">
                  <Sword className="w-4 h-4 text-red-500" />
                  <h3 className="text-xs font-bold font-mono text-zinc-200 uppercase">Weapons & Active Evades</h3>
                </div>

                <p className="text-[11px] text-zinc-400 font-serif leading-relaxed">
                  Strike minor skeletons and vampire bats with your starting blade or whip. Tap Dodge Roll to blink away from heavy boss arrows and fireball lines. Dodging gives complete brief immunity.
                </p>

                <div className="bg-zinc-950/60 p-3 rounded border border-zinc-900 font-mono text-xs flex flex-col gap-2">
                  <div className="flex justify-between border-b border-zinc-900/60 pb-1.5">
                    <span className="text-zinc-500">Melee Strike:</span>
                    <span className="text-zinc-300 font-bold">Spacebar / Mouse Left-Click</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Invincible Dash:</span>
                    <span className="text-blue-400 font-bold">Shift Key (3.5s Cooldown)</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: MAGIC */}
            {activeTab === 'magic' && (
              <div className="flex flex-col gap-3 animate-fade-in">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-purple-500" />
                  <h3 className="text-xs font-bold font-mono text-zinc-200 uppercase">Draconic Spell projectile</h3>
                </div>

                <p className="text-[11px] text-zinc-400 font-serif leading-relaxed">
                  Your draconic lineage allows you to exhale explosive red projectile fireballs. Fireballs penetrate walls and melt minor groups instantly. Scales directly with your Arcane level.
                </p>

                <div className="bg-zinc-950/60 p-3 rounded border border-zinc-900 font-mono text-xs flex flex-col gap-2">
                  <div className="flex justify-between border-b border-zinc-900/60 pb-1.5">
                    <span className="text-zinc-500">Cast Fireball:</span>
                    <span className="text-purple-400 font-bold">Q Key (Uses 15 MP)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Passive Mana Regen:</span>
                    <span className="text-zinc-400 font-bold">Restores continuously based on Arcane</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: BOSS */}
            {activeTab === 'boss' && (
              <div className="flex flex-col gap-3 animate-fade-in">
                <div className="flex items-center gap-2">
                  <Skull className="w-4 h-4 text-red-500" />
                  <h3 className="text-xs font-bold font-mono text-zinc-200 uppercase">Dungeons & Gate Keepers</h3>
                </div>

                <p className="text-[11px] text-zinc-400 font-serif leading-relaxed">
                  The trial spans multiple procedurally generated floors. Find the stairs to descend. On Floor 2, clear the grand halls to summon <b>Vlad the Vampire Lord</b>. Surviving him triggers the lava portals!
                </p>

                <div className="bg-zinc-950/60 p-3 rounded border border-zinc-900 font-mono text-xs flex flex-col gap-2">
                  <div className="flex justify-between border-b border-zinc-900/60 pb-1.5">
                    <span className="text-zinc-500">Floor 2 Boss:</span>
                    <span className="text-red-400 font-bold">Vlad the Vampire Lord</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Floor 4 Final boss:</span>
                    <span className="text-yellow-500 font-bold">Grave-Born Dragun</span>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Action Row */}
          <div className="border-t border-zinc-900 pt-4 flex items-center justify-between gap-3">
            <div className="rounded-full border border-zinc-800 bg-zinc-950/60 px-3 py-1.5 text-[9px] font-mono uppercase tracking-[0.25em] text-zinc-500">
              "The moon guides your stride..."
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleStartGame}
                className="px-4 py-2 text-zinc-500 hover:text-zinc-300 font-mono text-xs cursor-pointer transition-colors"
              >
                Skip Debrief
              </button>
              <button
                onClick={handleStartGame}
                className="px-6 py-2.5 bg-gradient-to-r from-red-800 to-red-600 hover:from-red-700 hover:to-red-500 text-white font-mono font-bold text-xs tracking-wider rounded-lg shadow-lg shadow-red-950/40 cursor-pointer hover:scale-[1.02] transition-all flex items-center gap-1.5"
              >
                BEGIN DESCENT <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
