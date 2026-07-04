import React, { useState, useEffect } from 'react';
import { PlayerClass, PlayerState, PlayerCustomization, LevelData, Item, ItemType, GameSettings } from './types';
import { playSound, startBGM, stopBGM, setVolume } from './components/SoundEffects';
import { generateLevel } from './utils/procedural';
import { GameManager } from './managers/GameManager';
import { SaveManager } from './managers/SaveManager';
import MainMenu from './components/MainMenu';
import DungeonCanvas from './components/DungeonCanvas';
import CharacterSheet from './components/CharacterSheet';
import SettingsModal from './components/SettingsModal';
import TutorialScreen from './components/TutorialScreen';
import { Heart, Zap, Coins, Shield, Trophy, RefreshCw, Volume2, Sparkles, AlertTriangle, Settings, Book } from 'lucide-react';
import { BestiarySystem } from './systems/BestiarySystem';
import { CodexOverlay } from './components/CodexOverlay';

import mainBannerImg from './assets/images/gothic_main_banner_1783099342203.jpg';
import introVideo1 from '../Intro.mp4';
import introVideo2 from '../dragonic_bloodlines.mp4';

export default function App() {
  const [screen, setScreen] = useState<'intro_splash' | 'video_intro1' | 'video_intro2' | 'menu' | 'intro' | 'playing' | 'gameover' | 'victory' | 'loading'>('intro_splash');
  const [playerClass, setPlayerClass] = useState<PlayerClass>('VampireHunter');

  useEffect(() => {
    if (screen === 'intro_splash') {
      const timer = setTimeout(() => {
        setScreen('video_intro1');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [screen]);
  
  // Primary states
  const [player, setPlayer] = useState<PlayerState>({
    class: 'VampireHunter',
    health: 100,
    maxHealth: 100,
    mana: 50,
    maxMana: 50,
    xp: 0,
    xpNeeded: 100,
    level: 1,
    gold: 0,
    stats: { strength: 10, agility: 10, arcane: 10, vitality: 10 },
    statPoints: 0,
    inventory: [],
    equipped: { Weapon: null, Armor: null, Ring: null, Relic: null, Crest: null, Scroll: null, Pet: null },
    customization: {
      gender: 'Male',
      hairStyle: 'Slayer Hood',
      hairColor: '#18181b',
      skinColor: '#f5f5f4',
      eyeColor: '#fbbf24',
      capeColor: '#1e3a8a',
      startingPerk: 'Blood Pact'
    },
    activeBoons: [],
    levelUpBoonsToSelect: [],
    activePet: null,
    x: 0,
    y: 0,
    size: 10,
    dashCooldown: 0,
    dashActiveTime: 0,
    dashDir: { x: 0, y: 0 },
    lastAttackTime: 0,
    facing: 'down',
    shieldActive: false,
    shieldCooldown: 0,
  });

  const [level, setLevel] = useState<LevelData | null>(null);
  const [currentKingdom, setCurrentKingdom] = useState(1);
  const [currentFloor, setCurrentFloor] = useState(1);
  const [unlockedKingdoms, setUnlockedKingdoms] = useState([1]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasSaveFile, setHasSaveFile] = useState<boolean>(SaveManager.hasSaveFile());
  const [muteSound, setMuteSound] = useState(false);
  
  // Custom global RPG settings
  const [settings, setSettings] = useState<GameSettings>({
    masterVolume: 0.3,
    difficulty: 'Adventurer',
    crtScanlines: true,
    pixelVignette: true,
    screenShake: 'High',
    showOnScreenButtons: true,
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCodexOpen, setIsCodexOpen] = useState(false);
  const bestiaryRef = React.useRef<BestiarySystem>(new BestiarySystem());
  const [loadingLore, setLoadingLore] = useState("");

  const loadingLores = [
    "The first dragons did not breathe fire... they drank the blood of the moon.",
    "Vampires were not born from nature. Humanity forged them using sacred dragon blood in a bid for immortality.",
    "The ancient seal requires dragon blood to remain intact. Every breaking link makes the crimson moon shine brighter.",
    "Beneath the Cathedral of Ash lies the chamber of the Sleeping King. He has watched wars rise and fall for three millennia.",
    "Only the true Draconic Bloodline carries the power to cleanse the unholy infection from this ruined sanctuary.",
    "The grand cathedral once sung praises to the sky. Now, it echoes only with the silent bat flaps of Vlad's patrol.",
    "Grave-Born Dragun resides beneath molten forge furnaces, waiting for the one worthy of claiming his igneous heart."
  ];

  const pickRandomLore = () => {
    const idx = Math.floor(Math.random() * loadingLores.length);
    setLoadingLore(loadingLores[idx]);
  };

  // Initialize Player State based on selected class and customization options
  const handleStartGame = (selectedClass: PlayerClass, custom?: PlayerCustomization, selectedKingdom: number = 1) => {
    setPlayerClass(selectedClass);
    setCurrentKingdom(selectedKingdom);
    setCurrentFloor(1);
    setUnlockedKingdoms([selectedKingdom]);
    setIsPaused(false);
    
    // Class-specific base stats
    let stats = { strength: 12, agility: 16, arcane: 8, vitality: 14 }; // Hunter
    if (selectedClass === 'RenegadeVampire') {
      stats = { strength: 14, agility: 12, arcane: 15, vitality: 9 };
    } else if (selectedClass === 'DraconicKnight') {
      stats = { strength: 18, agility: 8, arcane: 10, vitality: 14 };
    } else if (selectedClass === 'ElvenRanger') {
      stats = { strength: 10, agility: 20, arcane: 11, vitality: 9 };
    } else if (selectedClass === 'OrcBerserker') {
      stats = { strength: 21, agility: 7, arcane: 5, vitality: 17 };
    } else if (selectedClass === 'ArcaneSorceress') {
      stats = { strength: 8, agility: 12, arcane: 21, vitality: 9 };
    }

    const customization: PlayerCustomization = custom || {
      gender: selectedClass === 'ElvenRanger' || selectedClass === 'ArcaneSorceress' ? 'Female' : 'Male',
      hairStyle: selectedClass === 'VampireHunter' ? 'Slayer Hood'
        : selectedClass === 'RenegadeVampire' ? 'Renegade Locks'
        : selectedClass === 'DraconicKnight' ? 'Knight Helmet'
        : selectedClass === 'ElvenRanger' ? 'Forest Antlers'
        : selectedClass === 'OrcBerserker' ? 'Iron Warhawk'
        : 'Starfall Braids',
      hairColor: selectedClass === 'VampireHunter' ? '#18181b'
        : selectedClass === 'RenegadeVampire' ? '#ef4444'
        : selectedClass === 'DraconicKnight' ? '#fbbf24'
        : selectedClass === 'ElvenRanger' ? '#e2e8f0'
        : selectedClass === 'OrcBerserker' ? '#18181b'
        : '#a855f7',
      skinColor: selectedClass === 'RenegadeVampire' ? '#e4e4e7' : selectedClass === 'OrcBerserker' ? '#86a35f' : '#f5f5f4',
      eyeColor: selectedClass === 'RenegadeVampire' ? '#ef4444' : selectedClass === 'DraconicKnight' ? '#ea580c' : selectedClass === 'ElvenRanger' ? '#38bdf8' : selectedClass === 'ArcaneSorceress' ? '#a855f7' : '#fbbf24',
      capeColor: selectedClass === 'VampireHunter' ? '#1e3a8a' : selectedClass === 'RenegadeVampire' ? '#991b1b' : selectedClass === 'DraconicKnight' ? '#78350f' : selectedClass === 'ElvenRanger' ? '#064e3b' : selectedClass === 'OrcBerserker' ? '#3f6212' : '#4c1d95',
      startingPerk: selectedClass === 'DraconicKnight' ? 'Draconic Scales' : selectedClass === 'ElvenRanger' ? 'Fleet Foot' : selectedClass === 'ArcaneSorceress' ? 'Arcane Spark' : 'Blood Pact'
    };

    let activeBoons: string[] = [];
    if (customization.startingPerk === 'Blood Pact') {
      stats.strength += 2;
      activeBoons.push('Vampiric Touch');
    } else if (customization.startingPerk === 'Draconic Scales') {
      stats.vitality += 3;
      activeBoons.push('Blood Shield');
    } else if (customization.startingPerk === 'Arcane Spark') {
      stats.arcane += 3;
      activeBoons.push('Double Cast');
    } else if (customization.startingPerk === 'Fleet Foot') {
      stats.agility += 3;
      activeBoons.push('Shadow Step');
    }

    // Class starting gears
    let weapon: Item = {
      id: 'whip_start',
      name: 'Vampire Slayer Whip',
      type: 'Weapon',
      rarity: 'Common',
      description: 'An ancient spiked chain whip that glows with holy silver light.',
      stats: { damage: 15, agility: 2 },
      icon: 'whip'
    };
    let armor: Item = {
      id: 'garb_start',
      name: 'Vampire Hunter Garb',
      type: 'Armor',
      rarity: 'Common',
      description: 'Leather vestments stitched with secret protective silver weaves.',
      stats: { defense: 4, agility: 2, vitality: 15 },
      icon: 'hunter_garb'
    };

    if (selectedClass === 'RenegadeVampire') {
      weapon = {
        id: 'scythe_start',
        name: 'Crimson Scythe',
        type: 'Weapon',
        rarity: 'Common',
        description: 'A giant blood-stained scythe that steals the vitality of your enemies.',
        stats: { damage: 18, lifesteal: 0.10, strength: 3 },
        icon: 'scythe'
      };
      armor = {
        id: 'cloak_start',
        name: 'Batwing Cloak',
        type: 'Armor',
        rarity: 'Common',
        description: 'A silk tattered cape that wraps you in a cloud of shadow step speed.',
        stats: { defense: 2, agility: 6, vitality: 10 },
        icon: 'cloak'
      };
    } else if (selectedClass === 'DraconicKnight') {
      weapon = {
        id: 'greatsword_start',
        name: 'Draconic Greatsword',
        type: 'Weapon',
        rarity: 'Common',
        description: 'A massive heavy blade forged from molten dragun scales.',
        stats: { damage: 24, strength: 6, defense: 2 },
        icon: 'greatsword'
      };
      armor = {
        id: 'mail_start',
        name: 'Dragonscale Mail',
        type: 'Armor',
        rarity: 'Common',
        description: 'Sturdy plated mail that completely deflects heat waves.',
        stats: { defense: 6, strength: 2, arcane: 2, vitality: 20 },
        icon: 'mail'
      };
    } else if (selectedClass === 'ElvenRanger') {
      weapon = {
        id: 'moonbow_start',
        name: 'Moonwood Bow',
        type: 'Weapon',
        rarity: 'Rare',
        description: 'A living bow grown around a silver string.',
        stats: { damage: 17, agility: 7, arcane: 2 },
        icon: 'bow'
      };
      armor = {
        id: 'leafweave_start',
        name: 'Leafweave Mantle',
        type: 'Armor',
        rarity: 'Rare',
        description: 'Light forest armor that keeps every step quiet.',
        stats: { defense: 3, agility: 7, vitality: 10 },
        icon: 'leaf_mantle'
      };
    } else if (selectedClass === 'OrcBerserker') {
      weapon = {
        id: 'skullsplitter_start',
        name: 'Skullsplitter Axe',
        type: 'Weapon',
        rarity: 'Rare',
        description: 'A chipped crescent axe made for brutal close-range cleaves.',
        stats: { damage: 27, strength: 8, agility: -1 },
        icon: 'axe'
      };
      armor = {
        id: 'warhide_start',
        name: 'Warhide Plate',
        type: 'Armor',
        rarity: 'Rare',
        description: 'Layered hide and iron plates built for fearless brawling.',
        stats: { defense: 7, strength: 4, vitality: 24 },
        icon: 'warhide'
      };
    } else if (selectedClass === 'ArcaneSorceress') {
      weapon = {
        id: 'astral_staff_start',
        name: 'Astral Staff',
        type: 'Weapon',
        rarity: 'Epic',
        description: 'A midnight staff capped with an unstable star shard.',
        stats: { damage: 14, arcane: 8, manaRegen: 1 },
        icon: 'staff'
      };
      armor = {
        id: 'starfall_start',
        name: 'Starfall Gown',
        type: 'Armor',
        rarity: 'Epic',
        description: 'A battle dress embroidered with protective constellations.',
        stats: { defense: 3, arcane: 7, vitality: 12 },
        icon: 'starfall_gown'
      };
    }

    // Derived Max HP / Mana
    const totalVitality = stats.vitality + (armor.stats.vitality || 0);
    const maxHP = 100 + totalVitality * 4;
    const maxMP = 50 + stats.arcane * 3;

    setPlayer({
      class: selectedClass,
      health: maxHP,
      maxHealth: maxHP,
      mana: maxMP,
      maxMana: maxMP,
      xp: 0,
      xpNeeded: 100,
      level: 1,
      gold: 0,
      stats,
      statPoints: 0,
      inventory: [],
      equipped: { Weapon: weapon, Armor: armor, Ring: null, Relic: null, Crest: null, Scroll: null, Pet: null },
      customization,
      activeBoons,
      levelUpBoonsToSelect: [],
      activePet: null,
      x: 0,
      y: 0,
      size: 10,
      dashCooldown: 0,
      dashActiveTime: 0,
      dashDir: { x: 0, y: 0 },
      lastAttackTime: 0,
      facing: 'down',
      shieldActive: false,
      shieldCooldown: 0,
    });

    // Proceed to story/introduction screen
    setScreen('intro');
  };

  const handleContinueGame = () => {
    const saved = SaveManager.loadGame();
    if (!saved) return;

    const restoredKingdom = saved.currentKingdom || 1;
    const restoredFloor = saved.currentFloor || 1;
    const nextLevel = GameManager.generateFloor(restoredKingdom, restoredFloor);

    setPlayer({
      ...saved.playerState,
      x: nextLevel.playerSpawn.x * 32 + 16,
      y: nextLevel.playerSpawn.y * 32 + 16,
    });
    setCurrentKingdom(restoredKingdom);
    setCurrentFloor(restoredFloor);
    setUnlockedKingdoms(saved.unlockedKingdoms?.length ? saved.unlockedKingdoms : [restoredKingdom]);
    setLevel(nextLevel);
    setScreen('playing');
    setIsPaused(false);
    setHasSaveFile(true);
    startBGM(restoredFloor >= 4 ? 'boss' : 'explore');
  };

  const handleDescend = () => {
    playSound('stairs');
    pickRandomLore();
    setIsPaused(false);
    setScreen('loading');

    // Save game progression initially
    SaveManager.saveGame(player, currentKingdom, currentFloor, unlockedKingdoms, player.inventory, 0);

    // Generate Level using GameManager
    setTimeout(() => {
      const firstLevel = GameManager.generateFloor(currentKingdom, currentFloor);
      setLevel(firstLevel);
      
      // Update player coords to level spawn point
      setPlayer(prev => ({
        ...prev,
        x: firstLevel.playerSpawn.x * 32 + 16,
        y: firstLevel.playerSpawn.y * 32 + 16,
      }));

      setScreen('playing');
      startBGM('explore');
    }, 2200);
  };

  // Level Progression: transition floors
  const handleNextFloor = () => {
    if (!level) return;
    playSound('stairs');
    setIsSheetOpen(false);
    setIsPaused(false);
    pickRandomLore();
    setScreen('loading');

    let nextFloorIndex = currentFloor + 1;
    let nextKingdomIndex = currentKingdom;

    if (nextFloorIndex > 5) {
      nextFloorIndex = 1;
      nextKingdomIndex++;
      
      // Unlock new kingdom
      if (!unlockedKingdoms.includes(nextKingdomIndex)) {
        setUnlockedKingdoms(prev => [...prev, nextKingdomIndex]);
      }
    }

    if (nextKingdomIndex > 5) {
      // Victory / True Ending sequence
      setScreen('victory');
      startBGM('victory');
      return;
    }

    setCurrentFloor(nextFloorIndex);
    setCurrentKingdom(nextKingdomIndex);
    
    // Auto-save progression
    SaveManager.saveGame(player, nextKingdomIndex, nextFloorIndex, unlockedKingdoms, player.inventory, 0);

    setTimeout(() => {
      const nextLevel = GameManager.generateFloor(nextKingdomIndex, nextFloorIndex);
      setLevel(nextLevel);

      // Adjust player coordinates
      setPlayer(prev => ({
        ...prev,
        x: nextLevel.playerSpawn.x * 32 + 16,
        y: nextLevel.playerSpawn.y * 32 + 16,
      }));

      setScreen('playing');

      // Change background theme music for boss levels
      if (nextFloorIndex === 4 || nextFloorIndex === 5) {
        startBGM('boss');
      } else {
        startBGM('explore');
      }
    }, 2200);
  };

  // Progression Equip handling
  const handleEquip = (item: Item) => {
    setPlayer(prev => {
      // Find item slot type
      const slot = item.type;
      const currentEquipped = prev.equipped[slot];
      
      // Filter item from inventory
      let nextInv = prev.inventory.filter(i => i.id !== item.id);
      
      // Put previous equipped back to inventory if exists
      if (currentEquipped) {
        nextInv.push(currentEquipped);
      }

      // Build updated equipped slots
      const nextEquipped = {
        ...prev.equipped,
        [slot]: item,
      };

      // Recalculate Max HP and Max Mana dynamically
      const armorVitality = nextEquipped.Armor?.stats.vitality || 0;
      const ringVitality = nextEquipped.Ring?.stats.vitality || 0;
      const relicVitality = nextEquipped.Relic?.stats.vitality || 0;
      const totalVitality = prev.stats.vitality + armorVitality + ringVitality + relicVitality;
      
      const nextMaxHealth = 100 + totalVitality * 4;
      const nextMaxMana = 50 + prev.stats.arcane * 3;

      return {
        ...prev,
        equipped: nextEquipped,
        inventory: nextInv,
        maxHealth: nextMaxHealth,
        maxMana: nextMaxMana,
        // Make sure current health / mana doesn't exceed new maximum
        health: Math.min(nextMaxHealth, prev.health),
        mana: Math.min(nextMaxMana, prev.mana),
      };
    });
  };

  const handleUnequip = (type: ItemType) => {
    setPlayer(prev => {
      const item = prev.equipped[type];
      if (!item) return prev;
      if (prev.inventory.length >= 15) return prev; // Inventory full

      const nextEquipped = {
        ...prev.equipped,
        [type]: null,
      };

      const nextInv = [...prev.inventory, item];

      // Recalculate
      const armorVitality = nextEquipped.Armor?.stats.vitality || 0;
      const ringVitality = nextEquipped.Ring?.stats.vitality || 0;
      const relicVitality = nextEquipped.Relic?.stats.vitality || 0;
      const totalVitality = prev.stats.vitality + armorVitality + ringVitality + relicVitality;
      
      const nextMaxHealth = 100 + totalVitality * 4;

      return {
        ...prev,
        equipped: nextEquipped,
        inventory: nextInv,
        maxHealth: nextMaxHealth,
        health: Math.min(nextMaxHealth, prev.health),
      };
    });
  };

  const handleDiscard = (itemId: string) => {
    setPlayer(prev => ({
      ...prev,
      inventory: prev.inventory.filter(i => i.id !== itemId),
    }));
  };

  // Stat point allocation when leveling up
  const handleAllocateStat = (statName: 'strength' | 'agility' | 'arcane' | 'vitality') => {
    if (player.statPoints <= 0) return;

    playSound('levelup');

    setPlayer(prev => {
      const nextStats = {
        ...prev.stats,
        [statName]: prev.stats[statName] + 1,
      };

      // Recalculate maximum limits
      const armorVitality = prev.equipped.Armor?.stats.vitality || 0;
      const ringVitality = prev.equipped.Ring?.stats.vitality || 0;
      const relicVitality = prev.equipped.Relic?.stats.vitality || 0;
      const totalVitality = nextStats.vitality + armorVitality + ringVitality + relicVitality;

      const nextMaxHP = 100 + totalVitality * 4;
      const nextMaxMP = 50 + nextStats.arcane * 3;

      return {
        ...prev,
        stats: nextStats,
        statPoints: prev.statPoints - 1,
        maxHealth: nextMaxHP,
        maxMana: nextMaxMP,
        // Give actual HP boost when upgrading Vitality
        health: statName === 'vitality' ? prev.health + 4 : prev.health,
        mana: statName === 'arcane' ? prev.mana + 3 : prev.mana,
      };
    });
  };

  // Unlocked boon perk choice
  const handleSelectBoon = (boon: string) => {
    playSound('levelup');
    setPlayer(prev => {
      const active = [...prev.activeBoons];
      if (!active.includes(boon)) {
        active.push(boon);
      }
      return {
        ...prev,
        activeBoons: active,
        levelUpBoonsToSelect: [], // Clear queue
      };
    });
  };

  const handleRetry = () => {
    stopBGM();
    setScreen('menu');
  };

  const toggleSoundMute = () => {
    const nextMute = !muteSound;
    setMuteSound(nextMute);
    setVolume(nextMute ? 0 : 0.3);
  };

  const handlePauseToggle = () => {
    setIsPaused(prev => !prev);
    playSound('hit');
  };

  const handleQuickSave = () => {
    SaveManager.saveGame(player, currentKingdom, currentFloor, unlockedKingdoms, player.inventory, 0);
    setHasSaveFile(true);
    playSound('levelup');
  };

  // Helper formatting names
  const getFloorTitle = (theme: LevelData['floorTheme']) => {
    switch (theme) {
      case 'ForsakenCathedral': return 'Gothic Cathedral (Boss: Vampire Lord)';
      case 'DragonNest': return "Dragun's Maw Caverns";
      case 'EternalThrone': return 'Inner Sanctum (Boss: Grave Dragun)';
      default: return 'Ancient Vampire Crypts';
    }
  };

  return (
    <div className="w-full h-screen bg-black overflow-hidden flex flex-col justify-between font-sans select-none">
      
      {/* 0. 3s Intro Logo Splash */}
      {screen === 'intro_splash' && (
        <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-50 relative">
          <style>{`
            @keyframes fadeInOut {
              0% { opacity: 0; transform: scale(0.95); }
              20% { opacity: 1; transform: scale(1); }
              80% { opacity: 1; transform: scale(1); }
              100% { opacity: 0; transform: scale(1.05); }
            }
            .animate-fade-in-out {
              animation: fadeInOut 3s ease-in-out forwards;
            }
          `}</style>
          
          <div className="animate-fade-in-out flex flex-col items-center justify-center">
            {/* The Logo Container */}
            <div className="flex flex-row items-center justify-center border-4 border-black p-2 bg-zinc-50">
              
              {/* Left Box (THE A) */}
              <div className="relative flex items-center justify-center border-r-4 border-black p-4 pr-6 bg-black text-white h-48 w-40 overflow-hidden">
                <div className="absolute top-2 left-2 text-xl font-serif tracking-widest leading-none z-10" style={{ fontFamily: "'Cinzel Decorative', serif" }}>
                  THE
                </div>
                {/* Ornamental background swirls */}
                <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'100\\' height=\\'100\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cpath d=\\'M20,50 Q40,20 60,50 T100,50\\' stroke=\\'white\\' fill=\\'none\\' stroke-width=\\'2\\'/%3E%3C/svg%3E')", backgroundSize: "cover" }} />
                <span className="text-[140px] leading-none text-white z-0 mt-4" style={{ fontFamily: "'UnifrakturMaguntia', cursive" }}>
                  A
                </span>
              </div>

              {/* Right text (ge of the Succubus.) */}
              <div className="flex flex-col justify-center items-start pl-6 pr-4 h-48">
                <div className="text-[64px] leading-[0.8] text-black" style={{ fontFamily: "'UnifrakturMaguntia', cursive" }}>
                  ge of the
                </div>
                <div className="text-[80px] leading-[0.9] text-black" style={{ fontFamily: "'UnifrakturMaguntia', cursive" }}>
                  Succubus.
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 1. Main Title Menu screen */}
      {screen === 'video_intro1' && (
        <div className="w-full h-full bg-black flex items-center justify-center relative overflow-hidden">
          <video
            src={introVideo1}
            autoPlay
            muted
            playsInline
            onEnded={() => setScreen('video_intro2')}
            className="w-full h-full object-cover"
          />
          <button
            onClick={() => setScreen('menu')}
            className="absolute top-4 right-4 px-4 py-2 rounded-md bg-black/60 text-white border border-white/20 hover:bg-black"
          >
            Skip Intro
          </button>
        </div>
      )}
      {screen === 'video_intro2' && (
        <div className="w-full h-full bg-black flex items-center justify-center relative overflow-hidden">
          <video
            src={introVideo2}
            autoPlay
            muted
            playsInline
            onEnded={() => setScreen('menu')}
            className="w-full h-full object-cover"
          />
          <button
            onClick={() => setScreen('menu')}
            className="absolute top-4 right-4 px-4 py-2 rounded-md bg-black/60 text-white border border-white/20 hover:bg-black"
          >
            Skip Intro
          </button>
        </div>
      )}
      {screen === 'menu' && (
        <MainMenu 
          onStartGame={handleStartGame} 
          onOpenSettings={() => setIsSettingsOpen(true)}
          onContinueGame={handleContinueGame}
          hasSave={hasSaveFile}
        />
      )}

      {/* 2. Lore Intro Card (Interactive RPG Tutorial Screen) */}
      {screen === 'intro' && (
        <TutorialScreen 
          playerClass={playerClass}
          onDescend={handleDescend}
        />
      )}

      {/* 3. Loading Splashes with Deep Gothic Lore Quotes */}
      {screen === 'loading' && (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-zinc-300 relative overflow-hidden select-none">
          {/* Style block for self-contained progress animation */}
          <style>{`
            @keyframes loadProgress {
              0% { width: 0%; }
              100% { width: 100%; }
            }
            .animate-load-progress {
              animation: loadProgress 2.2s linear forwards;
            }
          `}</style>

          {/* Majestic Cathedral Background */}
          <img 
            src={mainBannerImg} 
            alt="Cursed Cathedral Under Blood Moon" 
            className="absolute inset-0 w-full h-full object-cover opacity-20 filter brightness-[0.3] blur-sm scale-105 pointer-events-none"
            referrerPolicy="no-referrer"
          />

          {/* Blood-red dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-[#050507]/90 to-black mix-blend-overlay pointer-events-none" />

          {/* Central Lore Card Container */}
          <div className="max-w-xl w-full bg-zinc-950/85 border border-red-950/50 p-8 rounded-2xl shadow-2xl flex flex-col items-center text-center gap-6 z-10 backdrop-blur-md gothic-corner-tl gothic-corner-tr gothic-corner-bl gothic-corner-br">
            {/* Spinning Sigil */}
            <div className="w-12 h-12 rounded-full border-2 border-red-800 flex items-center justify-center text-2xl bg-zinc-950 text-red-600 animate-pulse relative">
              <div className="absolute inset-0 border-t-2 border-red-500 rounded-full animate-spin pointer-events-none" />
              🐉
            </div>

            {/* Lore Title */}
            <div className="flex flex-col gap-1">
              <span className="text-[9px] uppercase tracking-[0.35em] text-red-500 font-mono font-bold animate-pulse">
                Accessing Bloodline Archives
              </span>
              <h2 className="text-sm font-bold tracking-wider text-zinc-400 font-mono uppercase">
                {level ? `DESCENT TO FLOOR ${level.floorIndex + 1}` : "ENTERING CRADLE OF THE NIGHT"}
              </h2>
            </div>

            {/* Immersive Lore Text Quote */}
            <div className="py-4 px-3 border-y border-zinc-900/80 w-full relative">
              <span className="absolute -top-3.5 left-4 text-3xl font-serif text-red-900 leading-none">“</span>
              <p className="text-xs text-zinc-300 font-serif leading-relaxed italic px-4">
                {loadingLore || "The first dragons did not breathe fire... they drank the blood of the moon."}
              </p>
              <span className="absolute -bottom-7 right-4 text-3xl font-serif text-red-900 leading-none">”</span>
            </div>

            {/* Progress Bar Loader */}
            <div className="w-full flex flex-col gap-1.5 mt-2">
              <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500">
                <span>SEAL INTEGRITY: DECAYING</span>
                <span className="text-red-500 font-bold">CARVING GRID...</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-900 rounded-full border border-zinc-800 overflow-hidden shadow-inner">
                <div className="h-full bg-gradient-to-r from-red-800 to-red-500 shadow-[0_0_8px_#ef4444] animate-load-progress" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Core Active Game screen */}
      {screen === 'playing' && level && (
        <div className="w-full h-full flex flex-col justify-between p-4 gap-4">
          
          {/* TOP HUD ROW */}
          <div className="flex flex-col md:flex-row items-stretch justify-between gap-4">
            
            {/* Player Main HP/Mana/XP display */}
            <div className="flex-1 flex flex-col md:flex-row items-stretch gap-4 bg-zinc-950/90 border border-zinc-900/80 rounded-xl p-4 shadow-xl backdrop-blur-md">
              {/* Level indicator badge */}
              <div className="flex items-center gap-3 rounded-2xl border border-zinc-900/80 bg-zinc-900/50 px-3 py-2">
                <div className="w-12 h-12 rounded-full border border-red-500/30 bg-red-950/20 flex flex-col items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.05)]">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono leading-none">LVL</span>
                  <span className="text-xl font-black text-red-500 leading-none mt-1">{player.level}</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-200">
                    {player.class.replace(/([A-Z])/g, ' $1').trim()}
                  </h4>
                  <span className="text-[10px] uppercase font-mono text-zinc-500 tracking-wider">Champion of bloodline</span>
                </div>
              </div>

              {/* Progress Gauges */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Health gauge */}
                <div className="flex flex-col justify-between rounded-xl border border-red-950/40 bg-red-950/10 p-2.5">
                  <div className="flex justify-between text-[10px] font-mono mb-1 text-red-400">
                    <span className="flex items-center gap-1 font-bold">
                      <Heart className="w-3 h-3 text-red-500 fill-red-500" /> HP:
                    </span>
                    <span>{Math.round(player.health)} / {player.maxHealth}</span>
                  </div>
                  <div className="h-3.5 w-full bg-zinc-900 rounded border border-zinc-800 overflow-hidden relative shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]">
                    <div 
                      className="h-full bg-gradient-to-r from-red-700 to-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)] transition-all duration-200"
                      style={{ width: `${Math.max(0, (player.health / player.maxHealth) * 100)}%` }}
                    />
                    {player.shieldActive && (
                      <div className="absolute inset-0 border border-sky-400 bg-sky-400/20 animate-pulse pointer-events-none" />
                    )}
                  </div>
                </div>

                {/* Mana gauge */}
                <div className="flex flex-col justify-between rounded-xl border border-purple-950/40 bg-purple-950/10 p-2.5">
                  <div className="flex justify-between text-[10px] font-mono mb-1 text-purple-400">
                    <span className="flex items-center gap-1 font-bold">
                      <Zap className="w-3 h-3 text-purple-500 fill-purple-500" /> MP:
                    </span>
                    <span>{Math.round(player.mana)} / {player.maxMana}</span>
                  </div>
                  <div className="h-3.5 w-full bg-zinc-900 rounded border border-zinc-800 overflow-hidden shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-700 to-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.4)] transition-all duration-200"
                      style={{ width: `${(player.mana / player.maxMana) * 100}%` }}
                    />
                  </div>
                </div>

                {/* XP progression */}
                <div className="flex flex-col justify-between rounded-xl border border-amber-950/40 bg-amber-950/10 p-2.5">
                  <div className="flex justify-between text-[10px] font-mono mb-1 text-amber-500">
                    <span className="flex items-center gap-1 font-bold">
                      <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" /> XP:
                    </span>
                    <span>{player.xp} / {player.xpNeeded}</span>
                  </div>
                  <div className="h-3.5 w-full bg-zinc-900 rounded border border-zinc-800 overflow-hidden shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-600 to-amber-500 transition-all duration-200"
                      style={{ width: `${(player.xp / player.xpNeeded) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Level metadata, audio controllers and big Inventory button */}
            <div className="flex items-center gap-3 bg-zinc-950/90 border border-zinc-900/80 rounded-xl p-4 shadow-xl backdrop-blur-md">
              <div className="text-right hidden sm:block font-mono">
                <span className="text-[10px] uppercase tracking-widest text-zinc-500 block">Current Depth</span>
                <span className="text-xs font-bold text-red-500 block">Floor {level.floorIndex}</span>
                <span className="text-[10px] text-zinc-300 italic block">{getFloorTitle(level.floorTheme)}</span>
              </div>

              <button
                onClick={handleQuickSave}
                className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-mono transition"
                title="Save game state"
              >
                SAVE
              </button>
              <button
                onClick={handlePauseToggle}
                className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-mono transition"
                title={isPaused ? 'Resume game' : 'Pause game'}
              >
                {isPaused ? 'RESUME' : 'PAUSE'}
              </button>

              {/* Character Sheet Button */}
              <button
                onClick={() => { playSound('hit'); setIsSheetOpen(!isSheetOpen); }}
                className={`px-5 py-3 rounded-lg font-mono font-bold text-xs tracking-wider transition-all duration-300 relative ${
                  player.statPoints > 0 
                    ? 'bg-red-800 hover:bg-red-700 text-white animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.3)]' 
                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800'
                }`}
              >
                CHARACTER (C) 🎒
                {player.statPoints > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-yellow-500 text-black text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-bold border border-zinc-950 animate-bounce">
                    +{player.statPoints}
                  </span>
                )}
              </button>

              <button
                onClick={toggleSoundMute}
                className="p-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800 transition-colors"
                title="Mute/Unmute BGM"
              >
                {muteSound ? <Volume2 className="w-4 h-4 text-zinc-600" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>

              <button
                onClick={() => { playSound('hit'); setIsSettingsOpen(true); }}
                className="p-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800 transition-colors"
                title="Open Configurations & Shaders"
              >
                <Settings className="w-4 h-4" />
              </button>

              <button
                onClick={() => { playSound('hit'); setIsCodexOpen(true); }}
                className="p-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-red-400 border border-red-900/30 transition-colors"
                title="Open Bestiary Codex"
              >
                <Book className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* MAIN INTERACTIVE CANVAS BODY */}
          <div className="flex-1 flex items-stretch relative">
            <DungeonCanvas 
              player={player}
              level={level}
              setPlayer={setPlayer}
              setLevel={setLevel}
              onNextFloor={handleNextFloor}
              onGameOver={() => setScreen('gameover')}
              onVictory={() => setScreen('victory')}
              isSheetOpen={isSheetOpen}
              gameActive={screen === 'playing' && !isPaused}
              settings={settings}
              onEnemyKilled={(id) => bestiaryRef.current.registerKill(id)}
            />

            {isCodexOpen && (
              <CodexOverlay 
                bestiary={bestiaryRef.current}
                onClose={() => setIsCodexOpen(false)}
                playSound={playSound}
              />
            )}
          </div>

          {/* Bottom simple status bar */}
          <div className="flex justify-between items-center text-[10px] font-mono text-zinc-600 border-t border-zinc-900/60 pt-2 px-2">
            <span>Retro 2D pixel-styled engine running smoothly</span>
            <span className="text-amber-500 flex items-center gap-1 font-bold">
              Gold: {player.gold} <Coins className="w-3 h-3 text-amber-500" />
            </span>
          </div>

          {/* CHARACTER INVENTORY OVERLAY */}
          {isPaused && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
              <div className="w-full max-w-md rounded-3xl border border-red-900/60 bg-zinc-950/95 p-6 text-center shadow-2xl">
                <h2 className="text-2xl font-bold text-red-400 uppercase tracking-[0.3em] mb-4">PAUSED</h2>
                <p className="text-sm text-zinc-300 mb-6">The night stills. Use Resume to continue your descent into the cursed kingdoms.</p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handlePauseToggle}
                    className="w-full rounded-xl bg-red-600 hover:bg-red-500 text-white py-3 text-sm font-bold transition"
                  >
                    Resume Adventure
                  </button>
                  <button
                    onClick={handleQuickSave}
                    className="w-full rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 py-3 text-sm font-bold transition"
                  >
                    Save Progress
                  </button>
                  <button
                    onClick={() => setScreen('menu')}
                    className="w-full rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 py-3 text-sm font-bold transition"
                  >
                    Return to Menu
                  </button>
                </div>
              </div>
            </div>
          )}
          {isSheetOpen && (
            <CharacterSheet 
              player={player}
              onEquip={handleEquip}
              onUnequip={handleUnequip}
              onDiscard={handleDiscard}
              onAllocateStat={handleAllocateStat}
              onClose={() => setIsSheetOpen(false)}
            />
          )}

          {/* LEVEL UP BOONS CHOSEN SELECTION MODAL */}
          {player.levelUpBoonsToSelect.length > 0 && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 font-sans text-zinc-200">
              <div className="max-w-xl w-full rounded-xl border border-yellow-800/40 bg-zinc-950 p-6 shadow-2xl text-center">
                <span className="text-xs font-mono font-bold text-yellow-500 uppercase tracking-widest animate-pulse">
                  Level up reward!
                </span>
                <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500 mt-1 mb-4 drop-shadow">
                  CHOOSE A GOTHIC BOON
                </h2>
                
                <p className="text-xs text-zinc-400 leading-normal mb-5 font-serif">
                  Your draconic bloodline awakens. Select one divine passive perk to integrate into your character sheet permanently:
                </p>

                <div className="flex flex-col gap-3">
                  {player.levelUpBoonsToSelect.map(boon => {
                    let desc = '';
                    let details = '';

                    if (boon === 'Vampiric Touch') {
                      desc = '🩸 Vampiric Touch';
                      details = 'Defeating an enemy heals you for 5% of your max HP. Excellent for survival.';
                    } else if (boon === "Dragon's Breath") {
                      desc = '🔥 Dragon\'s Breath';
                      details = 'Your attacks ignite targets, dealing 5% of your base damage per second.';
                    } else if (boon === 'Blood Shield') {
                      desc = '🛡️ Blood Shield';
                      details = 'Gains a celestial blood shield that blocks the next hit you take (20 sec cooldown).';
                    } else if (boon === 'Double Cast') {
                      desc = '🔮 Double Cast';
                      details = 'Your fireball spell casts twice with a single cost with 25% probability.';
                    } else if (boon === 'Shadow Step') {
                      desc = '👣 Shadow Step';
                      details = 'Your dashes leave a trace of shadow particles that damages overlapping enemies.';
                    } else {
                      desc = `✨ ${boon}`;
                      details = 'Enhances your base vitality and physical attributes by +10%.';
                    }

                    return (
                      <button
                        key={boon}
                        onClick={() => handleSelectBoon(boon)}
                        className="w-full text-left p-4 rounded-lg border border-zinc-800 bg-zinc-900/40 hover:border-yellow-600/80 hover:bg-yellow-950/10 transition-all duration-300"
                      >
                        <span className="text-sm font-bold text-yellow-500 block mb-1">
                          {desc}
                        </span>
                        <span className="text-xs text-zinc-400 leading-normal block font-serif">
                          {details}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. GAME OVER SCREEN */}
      {screen === 'gameover' && (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-zinc-100 relative">
          {/* Blood splattered red ambient mask */}
          <div className="absolute inset-0 pointer-events-none bg-radial-gradient from-red-950/50 to-neutral-950 opacity-90" />
          
          <div className="max-w-md w-full bg-zinc-900/40 p-8 rounded-2xl border border-red-900/30 text-center flex flex-col items-center gap-5 z-10 animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-red-950/80 border border-red-800 text-3xl flex items-center justify-center text-red-500 animate-pulse">
              💀
            </div>

            <h1 className="text-3xl font-black tracking-widest text-red-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-serif">
              YOU DIED
            </h1>

            <p className="text-xs text-zinc-400 italic font-serif leading-relaxed">
              "Your ashes scatter in the ancient stone cathedral. The dark lords continue their reign undisturbed."
            </p>

            {/* Run Stats summary */}
            <div className="w-full py-3 px-4 rounded bg-zinc-950/60 border border-zinc-900 font-mono text-xs flex flex-col gap-2 text-zinc-300">
              <span className="text-zinc-500 text-[10px] uppercase block border-b border-zinc-900 pb-1.5 mb-1">Dungeon Run Summary</span>
              <div className="flex justify-between">
                <span>Class Reached:</span>
                <span className="text-red-400">{player.class.replace(/([A-Z])/g, ' $1').trim()}</span>
              </div>
              <div className="flex justify-between">
                <span>Level Achieved:</span>
                <span className="text-amber-500">Level {player.level}</span>
              </div>
              <div className="flex justify-between">
                <span>Gold Plundered:</span>
                <span className="text-amber-400">{player.gold} <Coins className="inline-block w-3 h-3 ml-1" /></span>
              </div>
              <div className="flex justify-between">
                <span>Deepest Floor:</span>
                <span className="text-red-500">Floor {level?.floorIndex || 1}</span>
              </div>
            </div>

            <button
              onClick={handleRetry}
              className="mt-2 w-full py-3 bg-gradient-to-r from-red-800 to-red-600 hover:from-red-700 hover:to-red-500 text-white font-mono font-bold text-xs tracking-widest rounded-lg transition-all hover:scale-102 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" /> RE-ENTER DUNGEON CRYPT
            </button>
          </div>
        </div>
      )}

      {/* 6. TRIUMPHANT VICTORY SCREEN */}
      {screen === 'victory' && (
        <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 text-zinc-100 relative">
          <div className="absolute inset-0 pointer-events-none bg-radial-gradient from-amber-950/30 to-zinc-950 opacity-90" />
          
          <div className="max-w-lg w-full bg-zinc-900/60 p-8 rounded-2xl border border-amber-900/30 text-center flex flex-col items-center gap-5 z-10 animate-scale-in shadow-2xl shadow-amber-950/20">
            <div className="w-16 h-16 rounded-full bg-amber-950/80 border border-amber-800 text-3xl flex items-center justify-center text-amber-500 animate-bounce">
              🏆
            </div>

            <h1 className="text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 drop-shadow font-serif">
              DUNGEON CLEANSED!
            </h1>

            <p className="text-xs text-zinc-300 italic font-serif leading-relaxed">
              "The Grave-Born Dragun crumbles into molten ash. The Vampiric hold is broken, and sunlight once again kisses the ancient stone cathedral."
            </p>

            <div className="w-full py-3 px-4 rounded bg-zinc-950/60 border border-zinc-900 font-mono text-xs flex flex-col gap-2 text-zinc-300">
              <span className="text-zinc-500 text-[10px] uppercase block border-b border-zinc-900 pb-1.5 mb-1 font-bold">Heroic Feats Summary</span>
              <div className="flex justify-between">
                <span>Champion Class:</span>
                <span className="text-amber-400 font-bold">{player.class.replace(/([A-Z])/g, ' $1').trim()}</span>
              </div>
              <div className="flex justify-between">
                <span>Final Level:</span>
                <span className="text-amber-500">Level {player.level}</span>
              </div>
              <div className="flex justify-between">
                <span>Gold Siphoned:</span>
                <span className="text-amber-400">{player.gold} <Coins className="inline-block w-3 h-3 ml-1" /></span>
              </div>
              <div className="flex justify-between">
                <span>Boons Earned:</span>
                <span className="text-red-400 font-bold">{player.activeBoons.join(', ') || 'None'}</span>
              </div>
            </div>

            <button
              onClick={handleRetry}
              className="mt-2 w-full py-3 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-black font-mono font-bold text-xs tracking-widest rounded-lg transition-all hover:scale-102 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" /> QUEST AGAIN (REPLAY)
            </button>
          </div>
        </div>
      )}

      {/* Global Settings & Configurations Overlay Modal */}
      {isSettingsOpen && (
        <SettingsModal 
          settings={settings}
          onUpdateSettings={setSettings}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

    </div>
  );
}
