import React, { useState } from 'react';
import { PlayerClass, PlayerStats, Item, PlayerCustomization } from '../types';
import { playSound, startBGM } from './SoundEffects';
import CharacterVisualizer from './CharacterVisualizer';
import { 
  Shield, Sword, Heart, Zap, Flame, Sparkles, Volume2, VolumeX, Settings, 
  BookOpen, Scroll, Map as MapIcon, Backpack, Trophy, User, Check, X, 
  HelpCircle, Lock, Gem, Landmark, Hammer, Eye, Compass, Skull, Coins, Bell, Gift
} from 'lucide-react';

import mainBannerImg from '../assets/images/gothic_main_banner_1783099342203.jpg';
import mapImg from '../assets/images/map.png';

interface MainMenuProps {
  onStartGame: (selectedClass: PlayerClass, customization: PlayerCustomization, selectedKingdom?: number) => void;
  onOpenSettings: () => void;
  onContinueGame?: () => void;
  hasSave?: boolean;
}

export default function MainMenu({ onStartGame, onOpenSettings, onContinueGame, hasSave }: MainMenuProps) {
  const [activeTab, setActiveTab] = useState<'champions' | 'inventory' | 'abilities' | 'crypts' | 'bestiary' | 'quests' | 'map' | 'settings'>('champions');
  const [selectedClass, setSelectedClass] = useState<PlayerClass>('VampireHunter');
  const [selectedKingdom, setSelectedKingdom] = useState<number>(1);
  const [volume, setVolume] = useState<number>(0.3);
  const [muted, setMuted] = useState<boolean>(false);
  const [startedBgm, setStartedBgm] = useState<boolean>(false);

  // Customization States
  const [gender, setGender] = useState<'Male' | 'Female' | 'Ethereal'>('Male');
  const [hairStyle, setHairStyle] = useState<string>('Slayer Hood');
  const [hairColor, setHairColor] = useState<string>('#18181b'); // default dark
  const [skinColor, setSkinColor] = useState<string>('#f5f5f4'); // pale
  const [eyeColor, setEyeColor] = useState<string>('#fbbf24'); // amber
  const [capeColor, setCapeColor] = useState<string>('#1e3a8a'); // navy blue
  const [startingPerk, setStartingPerk] = useState<string>('Blood Pact');

  // Game entry splash loading states
  const [isEntryScreen, setIsEntryScreen] = useState<boolean>(true);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [loadingStatusText, setLoadingStatusText] = useState<string>("Initializing Bloodline Engine...");

  // Sub-tab states
  const [selectedItem, setSelectedItem] = useState<string>('weapon');
  const [selectedBestiary, setSelectedBestiary] = useState<string>('vamp_lord');
  const [selectedMapNode, setSelectedMapNode] = useState<string>('crypts');

  const classesConfig = {
    VampireHunter: {
      name: 'Vampire Hunter',
      title: 'Scourge of the Night',
      desc: 'Armed with the legendary chain whip, this hunter relies on agility and ranged tactical combat to eliminate blood-sucking fiends from safe distances.',
      stats: { strength: 12, agility: 16, arcane: 8, vitality: 14 },
      color: 'text-blue-400 border-blue-950 bg-blue-950/20',
      weapon: 'Vampire Slayer Whip (⚔️ Ranged Swipe)',
      armor: 'Vampire Hunter Garb (🛡️ Agility Vest)',
      sigil: '✝️',
      hp: 156,
      mp: 74,
      weaponItem: {
        name: 'Vampire Slayer Whip',
        rarity: 'Common' as const,
        stats: '⚔️ +15 Damage, ⚡ +2 Agility',
        lore: 'Woven with holy silver filaments that sizzle against necrotic flesh. Hand-crafted by the vampire slaying brotherhood.'
      },
      armorItem: {
        name: 'Vampire Hunter Garb',
        rarity: 'Common' as const,
        stats: '🛡️ +4 Defense, ⚡ +2 Agility, 💖 +15 HP',
        lore: 'A reinforced leather vest carrying secret sigils of protection sewn into the lining.'
      }
    },
    RenegadeVampire: {
      name: 'Renegade Vampire',
      title: 'The Crimson Reaver',
      desc: 'Banished from the elder crypts, this renegade commands ancient blood siphon magic, wielding a terrifying scythe that saps enemy vitality with every strike.',
      stats: { strength: 14, agility: 12, arcane: 15, vitality: 9 },
      color: 'text-red-400 border-red-950 bg-red-950/20',
      weapon: 'Crimson Scythe (🩸 Lifesteal Slash)',
      armor: 'Batwing Cloak (🦇 Shadow Step Speed)',
      sigil: '🩸',
      hp: 136,
      mp: 95,
      weaponItem: {
        name: 'Crimson Scythe',
        rarity: 'Rare' as const,
        stats: '⚔️ +18 Damage, 🩸 +10% Lifesteal, ⚔️ +3 Strength',
        lore: 'Forged from solidified blood pools under a cursed Blood Moon. It whispers dark promises to its wielder.'
      },
      armorItem: {
        name: 'Batwing Cloak',
        rarity: 'Rare' as const,
        stats: '🛡️ +2 Defense, ⚡ +6 Agility, 💖 +10 HP',
        lore: 'Crafted from the wings of ancient bats, this cloak allows the renegade to blend into the shadows.'
      }
    },
    DraconicKnight: {
      name: 'Draconic Knight',
      title: 'Acolyte of molten fire',
      desc: 'Forged in lava caverns, this stalwart heavy knight swings a colossal greatsword, harnessing arcane dragun fire to shrug off blows and incinerate crowds.',
      stats: { strength: 18, agility: 8, arcane: 10, vitality: 14 },
      color: 'text-amber-400 border-amber-950 bg-amber-950/20',
      weapon: 'Draconic Greatsword (🔥 Heavy Impact)',
      armor: 'Dragonscale Mail (🛡️ Flame Resilience)',
      sigil: '🔥',
      hp: 176,
      mp: 80,
      weaponItem: {
        name: 'Draconic Greatsword',
        rarity: 'Epic' as const,
        stats: '⚔️ +24 Damage, ⚔️ +6 Strength, 🛡️ +2 Defense',
        lore: 'A massive claymore molded from molten dragon teeth. Every swing makes the air itself boil.'
      },
      armorItem: {
        name: 'Dragonscale Mail',
        rarity: 'Epic' as const,
        stats: '🛡️ +6 Defense, ⚔️ +2 Strength, 🔮 +2 Arcane, 💖 +20 HP',
        lore: 'A breastplate crafted from the scales of the Grave-Born Dragun, offering ultimate flame defense.'
      }
    },
    ElvenRanger: {
      name: 'Elven Ranger',
      title: 'Moonwood pathfinder',
      desc: 'A fast forest archer with pointed ears, light armor, and a moonwood bow built for clean kiting and precise ranged pressure.',
      stats: { strength: 10, agility: 20, arcane: 11, vitality: 9 },
      color: 'text-emerald-400 border-emerald-950 bg-emerald-950/20',
      weapon: 'Moonwood Bow (Precision Arrows)',
      armor: 'Leafweave Mantle (Evasion Garb)',
      sigil: 'ELF',
      hp: 136,
      mp: 83,
      weaponItem: {
        name: 'Moonwood Bow',
        rarity: 'Rare' as const,
        stats: '+17 Damage, +7 Agility, +2 Arcane',
        lore: 'A living bow grown around a silver string. Its arrows remember the target.'
      },
      armorItem: {
        name: 'Leafweave Mantle',
        rarity: 'Rare' as const,
        stats: '+3 Defense, +7 Agility, +10 HP',
        lore: 'Flexible forest armor stitched from moonlit leaves and spider-silk.'
      }
    },
    OrcBerserker: {
      name: 'Orc Berserker',
      title: 'Iron-tusk breaker',
      desc: 'A heavy melee bruiser with tusks, war paint, and a brutal axe. Slow, loud, and excellent at ending arguments.',
      stats: { strength: 21, agility: 7, arcane: 5, vitality: 17 },
      color: 'text-lime-400 border-lime-950 bg-lime-950/20',
      weapon: 'Skullsplitter Axe (Brutal Cleave)',
      armor: 'Warhide Plate (Thick Hide)',
      sigil: 'ORC',
      hp: 188,
      mp: 65,
      weaponItem: {
        name: 'Skullsplitter Axe',
        rarity: 'Rare' as const,
        stats: '+27 Damage, +8 Strength, -1 Agility',
        lore: 'A chipped crescent axe used by three generations of pit champions.'
      },
      armorItem: {
        name: 'Warhide Plate',
        rarity: 'Rare' as const,
        stats: '+7 Defense, +4 Strength, +24 HP',
        lore: 'Layered hide, iron plates, and enough scars to count as extra armor.'
      }
    },
    ArcaneSorceress: {
      name: 'Arcane Sorceress',
      title: 'Violet star witch',
      desc: 'A female-coded spellblade caster with flowing hair, bright robes, and high mana for aggressive fireball chains.',
      stats: { strength: 8, agility: 12, arcane: 21, vitality: 9 },
      color: 'text-purple-400 border-purple-950 bg-purple-950/20',
      weapon: 'Astral Staff (Spell Focus)',
      armor: 'Starfall Gown (Arcane Ward)',
      sigil: 'ARC',
      hp: 136,
      mp: 113,
      weaponItem: {
        name: 'Astral Staff',
        rarity: 'Epic' as const,
        stats: '+14 Damage, +8 Arcane, +10 Mana',
        lore: 'A midnight staff capped with a shard of something that still thinks it is a star.'
      },
      armorItem: {
        name: 'Starfall Gown',
        rarity: 'Epic' as const,
        stats: '+3 Defense, +7 Arcane, +12 HP',
        lore: 'A battle dress embroidered with protective constellations.'
      }
    },
  };

  const handleClassSelect = (cls: PlayerClass) => {
    playSound('hit');
    setSelectedClass(cls);

    // Set default customization matching selected class
    if (cls === 'VampireHunter') {
      setHairStyle('Slayer Hood');
      setHairColor('#18181b');
      setSkinColor('#f5f5f4');
      setEyeColor('#fbbf24');
      setCapeColor('#1e3a8a');
      setStartingPerk('Blood Pact');
    } else if (cls === 'RenegadeVampire') {
      setHairStyle('Renegade Locks');
      setHairColor('#ef4444');
      setSkinColor('#cbd5e1');
      setEyeColor('#ef4444');
      setCapeColor('#991b1b');
      setStartingPerk('Blood Pact');
    } else if (cls === 'DraconicKnight') {
      setHairStyle('Knight Helmet');
      setHairColor('#fbbf24');
      setSkinColor('#cbd5e1');
      setEyeColor('#ea580c');
      setCapeColor('#78350f');
      setStartingPerk('Draconic Scales');
    } else if (cls === 'ElvenRanger') {
      setGender('Female');
      setHairStyle('Forest Antlers');
      setHairColor('#e2e8f0');
      setSkinColor('#f5f5f4');
      setEyeColor('#38bdf8');
      setCapeColor('#064e3b');
      setStartingPerk('Fleet Foot');
    } else if (cls === 'OrcBerserker') {
      setGender('Male');
      setHairStyle('Iron Warhawk');
      setHairColor('#18181b');
      setSkinColor('#86a35f');
      setEyeColor('#fbbf24');
      setCapeColor('#3f6212');
      setStartingPerk('Blood Pact');
    } else if (cls === 'ArcaneSorceress') {
      setGender('Female');
      setHairStyle('Starfall Braids');
      setHairColor('#a855f7');
      setSkinColor('#f5f5f4');
      setEyeColor('#a855f7');
      setCapeColor('#4c1d95');
      setStartingPerk('Arcane Spark');
    }

    if (!startedBgm) {
      startBGM('explore');
      setStartedBgm(true);
    }
  };

  const toggleSound = () => {
    const nextMute = !muted;
    setMuted(nextMute);
    if (nextMute) {
      playSound('hit');
    } else {
      playSound('levelup');
      if (!startedBgm) {
        startBGM('explore');
        setStartedBgm(true);
      }
    }
  };

  React.useEffect(() => {
    if (!isEntryScreen) return;
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        const next = prev + Math.floor(Math.random() * 8) + 4;
        if (next >= 100) {
          setLoadingStatusText("Draconic Bloodline Unsealed!");
          clearInterval(interval);
          return 100;
        }
        
        // Custom gothic lore & status texts
        if (next < 20) setLoadingStatusText("Unsealing Cathedral of Ash gates...");
        else if (next < 40) setLoadingStatusText("Awakening cursed skeletal legions...");
        else if (next < 60) setLoadingStatusText("Stoking deep volcanic forge caverns...");
        else if (next < 80) setLoadingStatusText("Reforging draconic obsidian armor...");
        else if (next < 95) setLoadingStatusText("Brewing pure vampire blood siphons...");
        else setLoadingStatusText("Preparing Cradle of the Night...");
        
        return next;
      });
    }, 110);
    return () => clearInterval(interval);
  }, [isEntryScreen]);

  const handleStart = () => {
    playSound('stairs');
    onStartGame(selectedClass, {
      gender,
      hairStyle,
      hairColor,
      skinColor,
      eyeColor,
      capeColor,
      startingPerk
    }, selectedKingdom);
  };

  const getClassSigil = (cls: PlayerClass) => {
    const sigils: Record<PlayerClass, string> = {
      VampireHunter: 'VH',
      RenegadeVampire: 'RV',
      DraconicKnight: 'DK',
      ElvenRanger: 'ER',
      OrcBerserker: 'OB',
      ArcaneSorceress: 'AS',
    };
    return sigils[cls];
  };

  const getWeaponShortName = (cls: PlayerClass) => {
    const weapons: Record<PlayerClass, string> = {
      VampireHunter: 'Slayer Whip',
      RenegadeVampire: 'Crimson Scythe',
      DraconicKnight: 'Greatsword',
      ElvenRanger: 'Moonwood Bow',
      OrcBerserker: 'War Axe',
      ArcaneSorceress: 'Astral Staff',
    };
    return weapons[cls];
  };

  const selectTab = (tab: typeof activeTab) => {
    playSound('hit');
    setActiveTab(tab);
    if (!startedBgm) {
      startBGM('explore');
      setStartedBgm(true);
    }
  };

  // Safe Hub NPCs
  const hubNPCs = [
    { name: 'Blacksmith Korvan', icon: '🔨', role: 'Reforges Melee Blades', desc: 'Can increase your Strength stats in exchange for heavy metal ore found in chests.' },
    { name: 'Priest Zacharias', icon: '⛪', role: 'Purifies Corruption', desc: 'Sells holy water that grants temporary defense shields during combat.' },
    { name: 'Alchemy Witch Morana', icon: '🧪', role: 'Brews Health & Mana Potions', desc: 'Transmutes monster bat wings into glowing vitalizing health extracts.' },
    { name: 'Dragon Scholar Ignis', icon: '🐉', role: 'Draconic Lore Archivist', desc: 'Traces the draconic lineage of the Seven Dragon Kings and decodes stone ruins.' },
    { name: 'Rune Master Alaric', icon: '💎', role: 'Engraves Weapons with Shards', desc: 'Fuses Blood Shards into weapons to add devastating fire and freeze spells.' }
  ];

  // Bestiary details
  const bestiaryMonsters: Record<string, { name: string; type: string; hp: number; atk: string; desc: string; weakness: string }> = {
    skeleton_king: {
      name: 'Baron von Bone (Skeleton King)',
      type: 'Boss (Floor 1)',
      hp: 300,
      atk: '18 (Bone Cleave)',
      desc: 'The unholy sovereign of the graves on Floor 1. He commands skeletal minions to surround you while tossing rotating circles of bone shards. Do not let him corner you!',
      weakness: 'Heavy claymore greatsword attacks.'
    },
    vamp_lord: {
      name: 'Vlad the Vampire Lord',
      type: 'Boss (Floor 2)',
      hp: 450,
      atk: '22 (Blood Siphon)',
      desc: 'The ancient master of the Cathedral of Ash. He teleports rapidly across the room, leaving red pools that drain health. He periodically turns into a swarm of invincible bats to avoid attacks.',
      weakness: 'Silver whips and physical strength strikes.'
    },
    chimera_beast: {
      name: 'Ash-Wing Chimera',
      type: 'Boss (Floor 3)',
      hp: 550,
      atk: '26 (Wildfire Charge)',
      desc: 'A ferocious, fire-spewing hybrid that patrols the sulfur vents of Floor 3. It runs at terrifying speeds, executing a devastating knockdown charge and spreading fans of fireballs.',
      weakness: 'Water-attuned and lightning spells.'
    },
    smelter_giant: {
      name: 'Ignis the Smelter Giant',
      type: 'Boss (Floor 4)',
      hp: 650,
      atk: '30 (Lava Fissure)',
      desc: 'A colossus forged from dark obsidian and liquid metal who stokes the deep fire of Floor 4. He strikes with a massive stone hammer, causing magma eruptions directly under your feet.',
      weakness: 'Agile shadow steps and defensive shielding.'
    },
    grave_dragun: {
      name: 'Grave-Born Dragun',
      type: 'Final Boss (Floor 5)',
      hp: 850,
      atk: '35 (Meteor Breath)',
      desc: 'The primordial ruler of the lava caverns. He stands towering in the center, breathing circles of lava projectiles. He triggers meteor falls from the sky when enraged.',
      weakness: 'Spell fires and agility dodge steps.'
    },
    crypt_bat: {
      name: 'Sanguine Crypt Bat',
      type: 'Common Fiend',
      hp: 25,
      atk: '8 (Swift Bite)',
      desc: 'Small airborne beasts that swarm the crypt hallways. They strike quickly and can be difficult to hit due to their rapid, erratic flight path.',
      weakness: 'Whip swipes and fire spells.'
    },
    skeletal_guard: {
      name: 'Cursed Skeletal Guard',
      type: 'Armored Soldier',
      hp: 60,
      atk: '14 (Rusty Sword)',
      desc: 'An undead skeleton reanimated by necromancy. They carry ancient iron shields that reduce frontal damage and strike with broad, punishing cleaves.',
      weakness: 'Heavy greatsword blows.'
    },
    blood_fiend: {
      name: 'Beastblood Fiend',
      type: 'Crimson Abomination',
      hp: 110,
      atk: '16 (Crushing Smash)',
      desc: 'A massive muscular brute formed from overflow vampire blood. Its overhead crushing slams cause massive shockwaves that shake the earth and deal double damage.',
      weakness: 'Agility-based shadow steps.'
    },
    drag_cultist: {
      name: 'Draconic Cultist',
      type: 'Spellcaster',
      hp: 65,
      atk: '12 (Flame Missile)',
      desc: 'An orange-robed human acolyte worshipping the Grave-Born Dragun. They channel volcanic magma power to launch continuous, fast fireballs from a distance.',
      weakness: 'Melee whip strikes.'
    },
    werewolf: {
      name: 'Shadow Werewolf',
      type: 'Feral Stalker',
      hp: 80,
      atk: '12 (Leap & Tear)',
      desc: 'A savage, light-footed wolf hybrid that stalks the outer chambers. They execute extremely rapid long-range leaps to ambush careless hunters.',
      weakness: 'Shield blocks and lifesteal.'
    }
  };

  if (isEntryScreen) {
    return (
      <div className="min-h-screen w-full bg-[#050507] text-zinc-100 flex flex-col items-center justify-center font-sans select-none relative overflow-hidden">
        {/* Cinematic Background */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/src/assets/images/gothic_main_banner_1783099342203.jpg" 
            alt="Ancient Gothic Cathedral Under Blood Moon" 
            className="w-full h-full object-cover opacity-20 filter brightness-[0.3] blur-[2px] scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-red-950/25 to-[#050507]" />
          <div className="absolute inset-0 bg-radial-gradient from-transparent to-[#050507]" />
        </div>

        {/* Content Container */}
        <div className="z-10 flex flex-col items-center max-w-xl px-6 text-center">
          
          {/* New Logo matching intro */}
          <div className="flex flex-row items-center justify-center border-[3px] border-zinc-200 p-1.5 bg-black/80 backdrop-blur-sm mb-8 scale-75 md:scale-90 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
            {/* Left Box (THE A) */}
            <div className="relative flex items-center justify-center border-r-[3px] border-zinc-200 p-3 pr-5 bg-zinc-200 text-black h-36 w-32 overflow-hidden">
              <div className="absolute top-1.5 left-1.5 text-sm font-serif tracking-widest leading-none z-10 font-bold" style={{ fontFamily: "'Cinzel Decorative', serif" }}>
                THE
              </div>
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'100\\' height=\\'100\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cpath d=\\'M20,50 Q40,20 60,50 T100,50\\' stroke=\\'black\\' fill=\\'none\\' stroke-width=\\'2\\'/%3E%3C/svg%3E')", backgroundSize: "cover" }} />
              <span className="text-[100px] leading-none text-black z-0 mt-3" style={{ fontFamily: "'UnifrakturMaguntia', cursive" }}>
                A
              </span>
            </div>

            {/* Right text (ge of the Succubus.) */}
            <div className="flex flex-col justify-center items-start pl-4 pr-3 h-36 bg-black">
              <div className="text-[48px] leading-[0.8] text-zinc-200" style={{ fontFamily: "'UnifrakturMaguntia', cursive" }}>
                ge of the
              </div>
              <div className="text-[58px] leading-[0.9] text-zinc-200" style={{ fontFamily: "'UnifrakturMaguntia', cursive" }}>
                Succubus.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span className="rounded-full border border-zinc-400 bg-zinc-800/40 px-3 py-1 text-[9px] font-mono uppercase tracking-[0.25em] text-zinc-300">
              Story-Driven RPG
            </span>
            <span className="rounded-full border border-zinc-800 bg-zinc-950/50 px-3 py-1 text-[9px] font-mono uppercase tracking-[0.25em] text-zinc-400">
              Polished Combat
            </span>
          </div>

          <p className="text-zinc-400 font-serif text-xs leading-relaxed max-w-md italic mb-6">
            "The ancient cathedral lies in ruins, corrupted by a forbidden pact. The Age of the Succubus has begun, and only your lineage can break the curse."
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full max-w-lg mb-8 text-left">
            {[
              ['Narrative First', 'Discover the truth behind the demonic war'],
              ['Responsive Combat', 'Fast, readable action with clear feedback'],
              ['Immersive UI', 'Elegant menus, readable HUD, and strong pacing']
            ].map(([title, desc]) => (
              <div key={title} className="rounded-xl border border-zinc-900/80 bg-zinc-950/70 p-3">
                <div className="text-[9px] font-mono uppercase tracking-[0.25em] text-zinc-300 mb-1">{title}</div>
                <div className="text-[10px] text-zinc-500 leading-relaxed">{desc}</div>
              </div>
            ))}
          </div>

          {/* Progress Bar & Buttons */}
          <div className="w-full max-w-sm flex flex-col items-center gap-4">
            {loadingProgress < 100 ? (
              <div className="w-full">
                <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-2">
                  <span>{loadingStatusText}</span>
                  <span className="text-zinc-300 font-bold">{loadingProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-950 border border-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-zinc-600 to-zinc-300 shadow-[0_0_8px_rgba(255,255,255,0.3)] transition-all duration-150"
                    style={{ width: `${loadingProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  playSound('levelup');
                  startBGM('explore');
                  setStartedBgm(true);
                  setIsEntryScreen(false);
                }}
                className="w-full py-4 px-8 bg-zinc-900 hover:bg-zinc-800 border-2 border-zinc-500 hover:border-zinc-300 text-zinc-200 text-sm font-serif uppercase tracking-[0.25em] rounded-sm shadow-[0_0_20px_rgba(255,255,255,0.1)] cursor-pointer hover:shadow-[0_0_30px_rgba(255,255,255,0.25)] transition-all hover:scale-[1.02] active:scale-95 animate-pulse"
                style={{ fontFamily: "'Cinzel Decorative', serif" }}
              >
                Enter the Night ☩
              </button>
            )}
          </div>
        </div>

        {/* Footer info decoration */}
        <div className="absolute bottom-6 z-10 font-mono text-[9px] text-zinc-600 uppercase tracking-widest">
          SYSTEM_STABLE // BUILD_V1.4.2_PROD
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#050507] text-zinc-100 flex flex-col font-sans select-none relative overflow-hidden">
      
      {/* Cinematic animated background wrapper */}
      <div className="absolute inset-0 z-0">
        <img 
          src={mainBannerImg} 
          alt="Ancient Cathedral Under Blood Moon" 
          className="w-full h-full object-cover opacity-25 filter brightness-[0.4] blur-sm scale-105"
          referrerPolicy="no-referrer"
        />
        {/* Ambient blood red wash */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-red-950/5 to-[#050507] mix-blend-overlay" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent to-[#050507]/90" />
        {/* Floating dust/embers animation simulation */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:24px_24px] animate-pulse" />
      </div>

      {/* Main Layout: Sidebar on Left, Main Window in Middle, Details on Right */}
      <div className="flex-1 w-full flex flex-col lg:flex-row z-10 p-3 lg:p-5 gap-4 relative">
        
        {/* LEFT SIDEBAR - Navigation & Profile */}
        <div className="w-full lg:w-64 flex flex-col justify-between bg-zinc-950/90 border border-red-950/40 rounded-2xl p-4 shadow-2xl backdrop-blur-md relative">
          <div className="flex flex-col gap-5">
            {/* Logo Crest */}
            <div className="flex items-center gap-2.5 border-b border-red-950/40 pb-3">
              <div className="w-10 h-10 rounded-full border border-red-700 bg-red-950/40 flex items-center justify-center text-xl text-red-500 animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.2)]">
                🐉
              </div>
              <div>
                <span className="text-sm font-black font-serif text-red-500 tracking-wider block">
                  DRACONIC
                </span>
                <span className="text-[9px] uppercase tracking-widest text-zinc-400 font-mono block">
                  BLOODLINE RPG
                </span>
              </div>
            </div>

            {/* Menu Tabs */}
            <div className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-none">
              {(['champions', 'inventory', 'abilities', 'crypts', 'bestiary', 'quests', 'map', 'settings'] as const).map(tab => {
                const isActive = activeTab === tab;
                let label = tab.toUpperCase();
                let icon = <Shield className="w-4 h-4" />;
                if (tab === 'inventory') { icon = <Backpack className="w-4 h-4" />; }
                if (tab === 'abilities') { icon = <Flame className="w-4 h-4" />; }
                if (tab === 'crypts') { icon = <Skull className="w-4 h-4" />; label = 'DUNGEONS'; }
                if (tab === 'bestiary') { icon = <BookOpen className="w-4 h-4" />; }
                if (tab === 'quests') { icon = <Scroll className="w-4 h-4" />; }
                if (tab === 'map') { icon = <MapIcon className="w-4 h-4" />; label = 'WORLD MAP'; }
                if (tab === 'settings') { icon = <Settings className="w-4 h-4" />; }

                return (
                  <button
                    key={tab}
                    onClick={() => selectTab(tab)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border text-xs font-mono tracking-wider transition-all duration-200 cursor-pointer shrink-0 ${
                      isActive 
                        ? 'bg-gradient-to-r from-red-950/60 to-red-900/10 border-red-800 text-red-400 font-bold shadow-[0_0_10px_rgba(181,18,27,0.15)]' 
                        : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
                    }`}
                  >
                    <span className={isActive ? 'text-red-500' : 'text-zinc-500'}>{icon}</span>
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick-start Descent Button */}
          <div className="space-y-3">
            <div className="rounded-2xl border border-zinc-900/80 bg-zinc-950/70 p-3 text-[10px] font-mono text-zinc-300">
              <div className="text-[9px] uppercase tracking-[0.25em] text-zinc-500 mb-2">CHOOSE A KINGDOM TO START FROM</div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 1, label: 'Cathedral', sigil: '🏰' },
                  { id: 2, label: 'Swamp', sigil: '🕯️' },
                  { id: 3, label: 'Storm', sigil: '⚡' },
                  { id: 4, label: 'Forge', sigil: '🔥' },
                  { id: 5, label: 'Volcano', sigil: '⛰️' },
                ].map(k => (
                  <button
                    key={k.id}
                    onClick={() => { playSound('hit'); setSelectedKingdom(k.id); }}
                    className={`rounded-lg border px-2 py-2 text-[10px] font-bold uppercase tracking-[0.18em] transition-colors ${
                      selectedKingdom === k.id ? 'bg-red-950/90 border-red-700 text-red-300 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'bg-zinc-900/70 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
                    }`}
                  >
                    <span className="block text-[14px] leading-none">{k.sigil}</span>
                    <span className="block mt-1">{k.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleStart}
              className="w-full py-3 bg-gradient-to-r from-red-950 via-red-600 to-red-950 hover:from-red-900 hover:to-red-500 text-white font-mono text-[10px] font-bold tracking-[0.2em] rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(220,38,38,0.25)] border border-red-700/50 hover:scale-[1.02] active:scale-[0.98] animate-pulse flex items-center justify-center gap-1.5 cursor-pointer"
            >
              ⚔️ BEGIN ADVENTURE ⚔️
            </button>

            {hasSave && onContinueGame && (
              <button
                onClick={() => { playSound('levelup'); onContinueGame(); }}
                className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl transition-all duration-200"
              >
                CONTINUE FROM LAST SAVE
              </button>
            )}
          </div>

          {/* Mini Character Card (Bottom Left of Sidebar) */}
          <div className="mt-5 border-t border-zinc-900 pt-4 flex flex-col gap-2 bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-900/60">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded bg-red-950 border border-red-900 flex items-center justify-center text-lg shadow">
                {getClassSigil(selectedClass)}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-bold text-zinc-200 block truncate">
                  {classesConfig[selectedClass].name}
                </span>
                <span className="text-[8px] text-red-500 uppercase font-mono block tracking-wider truncate">
                  {classesConfig[selectedClass].title}
                </span>
              </div>
              <div className="px-1.5 py-0.5 bg-red-950 border border-red-800 text-red-400 text-[8px] font-mono rounded font-bold uppercase animate-pulse">
                LVL 12
              </div>
            </div>

            {/* Health and Mana bars */}
            <div className="flex flex-col gap-1.5 mt-1 font-mono text-[9px]">
              <div>
                <div className="flex justify-between text-red-400 leading-none mb-1">
                  <span>HP Gauge</span>
                  <span>{classesConfig[selectedClass].hp} / {classesConfig[selectedClass].hp}</span>
                </div>
                <div className="h-2 w-full bg-zinc-900 rounded border border-zinc-800/80 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-red-700 to-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] w-full" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-blue-400 leading-none mb-1">
                  <span>MP Arcane</span>
                  <span>{classesConfig[selectedClass].mp} / {classesConfig[selectedClass].mp}</span>
                </div>
                <div className="h-2 w-full bg-zinc-900 rounded border border-zinc-800/80 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-700 to-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] w-full" />
                </div>
              </div>
            </div>

            {/* Balances */}
            <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500 pt-1.5 border-t border-zinc-900/60">
              <span className="flex items-center gap-1">🪙 12,450 Gold</span>
              <span className="flex items-center gap-1 text-red-400 font-bold">🩸 1,250 Blood</span>
            </div>
          </div>
        </div>

        {/* CENTER MAIN CONTENT DISPLAY WINDOW */}
        <div className="flex-1 flex flex-col justify-between bg-zinc-950/80 border border-zinc-900/80 rounded-2xl p-5 md:p-6 shadow-2xl backdrop-blur-md relative overflow-hidden">
          
          {/* Subtle gothic scroll corners inside main window */}
          <div className="gothic-corner-tl gothic-corner-tr gothic-corner-bl gothic-corner-br absolute inset-0 pointer-events-none" />

          {/* TAB 1: CHAMPIONS (DEFAULT OVERVIEW) */}
          {activeTab === 'champions' && (
            <div className="flex-1 flex flex-col justify-between h-full gap-5">
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-yellow-500 font-bold text-[10px] uppercase tracking-widest font-mono">
                      Forge Your Dark Destiny
                    </span>
                    <h2 className="text-xl font-bold tracking-wider font-serif text-zinc-100 flex items-center gap-2">
                      CHARACTER CREATION & CUSTOMIZATION ⚔️
                    </h2>
                  </div>
                  <div className="rounded-full border border-red-800/70 bg-red-950/30 px-3 py-1 text-[9px] font-mono uppercase tracking-[0.25em] text-red-300">
                    Story Focus: Bloodline Reveal
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-900/80 bg-gradient-to-br from-red-950/20 via-zinc-950/70 to-zinc-900/60 p-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="text-[9px] font-mono uppercase tracking-[0.25em] text-red-400">Mission Brief</div>
                      <div className="text-sm font-serif text-zinc-100">The Blood Moon is rising. Every choice you make will shape what survives.</div>
                    </div>
                    <div className="flex flex-wrap gap-2 text-[10px] font-mono text-zinc-400">
                      <span className="rounded-full border border-zinc-800 px-2.5 py-1">Truth & Memory</span>
                      <span className="rounded-full border border-zinc-800 px-2.5 py-1">Dragon Blood</span>
                      <span className="rounded-full border border-zinc-800 px-2.5 py-1">Moral Choice</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 1. Champion Class Selector (Horizontal side-by-side cards) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(Object.keys(classesConfig) as PlayerClass[]).map(cls => {
                  const cfg = classesConfig[cls];
                  const isSelected = selectedClass === cls;
                  return (
                    <button
                      key={cls}
                      onClick={() => handleClassSelect(cls)}
                      className={`text-left p-3 rounded-xl border transition-all duration-300 flex flex-col justify-between cursor-pointer relative ${
                        isSelected 
                          ? 'border-red-800 bg-red-950/20 shadow-[0_0_15px_rgba(239,68,68,0.15)] ring-1 ring-red-700/30' 
                          : 'border-zinc-900 bg-zinc-900/10 hover:border-zinc-800 hover:bg-zinc-900/30'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <span className="text-xl">{cfg.sigil}</span>
                        <div>
                          <span className={`font-bold text-xs block font-serif ${isSelected ? 'text-red-400' : 'text-zinc-300'}`}>
                            {cfg.name}
                          </span>
                          <span className="text-[8px] text-zinc-500 uppercase tracking-widest font-mono leading-none">{cfg.title}</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-zinc-400 leading-relaxed line-clamp-2">
                        {cfg.desc}
                      </p>
                      
                      {/* Active indicator dot */}
                      <div className={`absolute top-3 right-3 w-2 h-2 rounded-full ${isSelected ? 'bg-red-500 animate-pulse' : 'bg-transparent'}`} />
                    </button>
                  );
                })}
              </div>

              {/* 2. Character Customization Forge (Split split: options vs humanoid rendering) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch flex-1 min-h-0">
                {/* Left customization controls (col-span-8) */}
                <div className="md:col-span-8 bg-zinc-950/60 rounded-xl border border-zinc-900/80 p-4 overflow-y-auto max-h-[340px] md:max-h-none scrollbar-thin">
                  <div className="flex flex-col gap-4">
                    
                    {/* Gender and Starting Perk row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Gender Selector */}
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-mono font-bold">
                          1. CHOOSE AVATAR ESSENCE
                        </span>
                        <div className="grid grid-cols-3 gap-1.5">
                          {(['Male', 'Female', 'Ethereal'] as const).map(g => {
                            const isSel = gender === g;
                            return (
                              <button
                                key={g}
                                onClick={() => { playSound('hit'); setGender(g); }}
                                className={`py-1.5 text-[10px] font-mono border rounded-lg cursor-pointer ${
                                  isSel ? 'bg-red-950/40 border-red-700 text-red-400 font-bold' : 'border-zinc-800 text-zinc-400 bg-zinc-900/10 hover:border-zinc-700'
                                }`}
                              >
                                {g}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Starting Perks */}
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-mono font-bold">
                          2. ANCIENT BLOOD PERK
                        </span>
                        <select
                          value={startingPerk}
                          onChange={(e) => { playSound('hit'); setStartingPerk(e.target.value); }}
                          className="w-full bg-zinc-900/90 border border-zinc-800 text-zinc-300 rounded-lg p-1.5 text-xs font-mono tracking-wider focus:outline-none focus:border-red-700"
                        >
                          <option value="Blood Pact">🩸 Blood Pact (+2 Str, Vampiric Heal)</option>
                          <option value="Draconic Scales">🔥 Draconic Scales (+3 Vit, Flame Shield)</option>
                          <option value="Arcane Spark">🔮 Arcane Spark (+3 Arc, Double Cast)</option>
                          <option value="Fleet Foot">⚡ Fleet Foot (+3 Agi, Dash CD Cut)</option>
                        </select>
                      </div>
                    </div>

                    <div className="border-t border-zinc-900 my-1" />

                    {/* Hair Style & Color */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Hair Style */}
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-mono font-bold">
                          3. COWL & HAIR STYLE
                        </span>
                        <div className="grid grid-cols-2 gap-1.5 text-[9px] font-mono">
                          {[
                            'Slayer Hood',
                            'Knight Helmet',
                            'Gothic Braids',
                            'Draconic Mane',
                            'Renegade Locks',
                            'Forest Antlers',
                            'Iron Warhawk',
                            'Starfall Braids',
                            'Messy Rogue'
                          ].map(style => {
                            const isSel = hairStyle === style;
                            return (
                              <button
                                key={style}
                                onClick={() => { playSound('hit'); setHairStyle(style); }}
                                className={`py-1.5 px-2 text-left border rounded-lg cursor-pointer truncate ${
                                  isSel ? 'bg-red-950/40 border-red-700 text-red-400 font-bold' : 'border-zinc-800 text-zinc-400 bg-zinc-900/10 hover:border-zinc-700'
                                }`}
                              >
                                {style}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Hair Color */}
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-mono font-bold">
                          4. HAIR / CREST PLUME TINT
                        </span>
                        <div className="flex items-center gap-2">
                          {[
                            { name: 'Silver', value: '#e2e8f0' },
                            { name: 'Crimson', value: '#ef4444' },
                            { name: 'Aurum', value: '#fbbf24' },
                            { name: 'Shadow', value: '#a855f7' },
                            { name: 'Obsidian', value: '#18181b' }
                          ].map(col => {
                            const isSel = hairColor === col.value;
                            return (
                              <button
                                key={col.name}
                                onClick={() => { playSound('hit'); setHairColor(col.value); }}
                                title={col.name}
                                className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer flex items-center justify-center ${
                                  isSel ? 'border-red-500 scale-110 shadow-lg' : 'border-zinc-800 hover:scale-105'
                                }`}
                                style={{ backgroundColor: col.value }}
                              >
                                {isSel && <Check className="w-3.5 h-3.5 text-zinc-950 font-bold bg-white/70 rounded-full p-0.5" />}
                              </button>
                            );
                          })}
                        </div>
                        <span className="text-[9px] text-zinc-500 font-mono mt-1">
                          Colors affect head hair or the helmet plumes.
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-zinc-900 my-1" />

                    {/* Skin Color & Eye Gaze */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Skin color */}
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-mono font-bold">
                          5. SKIN COMPLEXION
                        </span>
                        <div className="flex items-center gap-2">
                          {[
                            { name: 'Alabaster', value: '#f5f5f4' },
                            { name: 'Ashen', value: '#cbd5e1' },
                            { name: 'Vampiric', value: '#94a3b8' },
                            { name: 'Orcish', value: '#86a35f' },
                            { name: 'Molten', value: '#fed7aa' }
                          ].map(col => {
                            const isSel = skinColor === col.value;
                            return (
                              <button
                                key={col.name}
                                onClick={() => { playSound('hit'); setSkinColor(col.value); }}
                                title={col.name}
                                className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer flex items-center justify-center ${
                                  isSel ? 'border-red-500 scale-110' : 'border-zinc-800 hover:scale-105'
                                }`}
                                style={{ backgroundColor: col.value }}
                              >
                                {isSel && <Check className="w-3.5 h-3.5 text-zinc-950 font-bold bg-white/70 rounded-full p-0.5" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Eye Color */}
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-mono font-bold">
                          6. EYE GAZE GLOW
                        </span>
                        <div className="flex items-center gap-2">
                          {[
                            { name: 'Sanguine', value: '#ef4444' },
                            { name: 'Molten Gold', value: '#fbbf24' },
                            { name: 'Frost Blue', value: '#38bdf8' },
                            { name: 'Arcane Purple', value: '#a855f7' }
                          ].map(col => {
                            const isSel = eyeColor === col.value;
                            return (
                              <button
                                key={col.name}
                                onClick={() => { playSound('hit'); setEyeColor(col.value); }}
                                title={col.name}
                                className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer flex items-center justify-center ${
                                  isSel ? 'border-red-500 scale-110' : 'border-zinc-800 hover:scale-105'
                                }`}
                                style={{ backgroundColor: col.value }}
                              >
                                {isSel && <Check className="w-3.5 h-3.5 text-zinc-950 font-bold bg-white/70 rounded-full p-0.5" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-zinc-900 my-1" />

                    {/* Cape Color Selection */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-mono font-bold">
                        7. COAT & FLOWING CAPE FABRIC
                      </span>
                      <div className="flex items-center gap-2.5">
                        {[
                          { name: 'Crimson Scarlet', value: '#991b1b' },
                          { name: 'Royal Navy', value: '#1e3a8a' },
                          { name: 'Forest Green', value: '#064e3b' },
                          { name: 'Warhide Green', value: '#3f6212' },
                          { name: 'Violet Night', value: '#4c1d95' },
                          { name: 'Gothic Charcoal', value: '#1c1917' },
                          { name: 'Molten Bronze', value: '#78350f' },
                          { name: 'Bright Red', value: '#dc2626' }
                        ].map(col => {
                          const isSel = capeColor === col.value;
                          return (
                            <button
                              key={col.name}
                              onClick={() => { playSound('hit'); setCapeColor(col.value); }}
                              title={col.name}
                              className={`px-3 py-1.5 text-[9px] font-mono rounded border flex items-center gap-1.5 transition-all cursor-pointer ${
                                isSel ? 'bg-red-950/40 border-red-500 text-white font-bold shadow' : 'border-zinc-800 text-zinc-400 bg-zinc-900/10 hover:border-zinc-700'
                              }`}
                            >
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: col.value }} />
                              <span>{col.name.split(' ')[1] || col.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Right Visualizer Portrait (col-span-4) */}
                <div className="md:col-span-4 flex flex-col justify-between bg-zinc-950 border border-red-950/20 p-4 rounded-xl relative shadow-2xl overflow-hidden min-h-[300px]">
                  
                  {/* Realtime Humanoid canvas visualizer */}
                  <div className="flex-1 flex items-center justify-center mb-3">
                    <CharacterVisualizer 
                      playerClass={selectedClass}
                      customization={{
                        gender,
                        hairStyle,
                        hairColor,
                        skinColor,
                        eyeColor,
                        capeColor,
                        startingPerk
                      }}
                      width={150}
                      height={180}
                      scale={4.0}
                      isAnimated={true}
                    />
                  </div>

                  {/* Class and custom perk stats detail */}
                  <div className="bg-zinc-900/60 border border-zinc-900 p-2.5 rounded-lg z-10 font-mono text-[9px] leading-relaxed">
                    <div className="text-yellow-500 font-bold mb-1 uppercase tracking-wider text-center border-b border-zinc-800 pb-1">
                      {classesConfig[selectedClass].name} (Level 1)
                    </div>
                    <div className="flex justify-between mb-0.5 text-zinc-400">
                      <span>Weapon:</span>
                      <span className="text-zinc-200 text-[8px]">{getWeaponShortName(selectedClass)}</span>
                    </div>
                    <div className="flex justify-between mb-1 text-zinc-400">
                      <span>Perk boon:</span>
                      <span className="text-red-400 font-bold">{startingPerk}</span>
                    </div>
                    
                    {/* Tiny stats progress bars */}
                    <div className="grid grid-cols-2 gap-x-2.5 gap-y-1 pt-1.5 border-t border-zinc-800 text-[8px]">
                      <div>
                        <div className="flex justify-between text-zinc-500 mb-0.5">
                          <span>STR</span>
                          <span className="text-zinc-300">{classesConfig[selectedClass].stats.strength + (startingPerk === 'Blood Pact' ? 2 : 0)}</span>
                        </div>
                        <div className="h-1 bg-zinc-950 rounded-full overflow-hidden">
                          <div className="h-full bg-red-600" style={{ width: `${(classesConfig[selectedClass].stats.strength + (startingPerk === 'Blood Pact' ? 2 : 0)) * 4}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-zinc-500 mb-0.5">
                          <span>AGI</span>
                          <span className="text-zinc-300">{classesConfig[selectedClass].stats.agility + (startingPerk === 'Fleet Foot' ? 3 : 0)}</span>
                        </div>
                        <div className="h-1 bg-zinc-950 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500" style={{ width: `${(classesConfig[selectedClass].stats.agility + (startingPerk === 'Fleet Foot' ? 3 : 0)) * 4}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-zinc-500 mb-0.5">
                          <span>ARC</span>
                          <span className="text-zinc-300">{classesConfig[selectedClass].stats.arcane + (startingPerk === 'Arcane Spark' ? 3 : 0)}</span>
                        </div>
                        <div className="h-1 bg-zinc-950 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500" style={{ width: `${(classesConfig[selectedClass].stats.arcane + (startingPerk === 'Arcane Spark' ? 3 : 0)) * 4}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-zinc-500 mb-0.5">
                          <span>VIT</span>
                          <span className="text-zinc-300">{classesConfig[selectedClass].stats.vitality + (startingPerk === 'Draconic Scales' ? 3 : 0)}</span>
                        </div>
                        <div className="h-1 bg-zinc-950 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${(classesConfig[selectedClass].stats.vitality + (startingPerk === 'Draconic Scales' ? 3 : 0)) * 4}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Quick-access potions panel */}
              <div className="bg-zinc-950/90 border border-zinc-900/60 p-3 rounded-xl flex flex-wrap gap-2.5 items-center justify-between">
                <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-mono">
                  Quick Access Equipment:
                </span>
                <div className="flex items-center gap-2 font-mono text-xs">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded">
                    <span>🧪</span> <span className="text-zinc-400">Heal Potion</span> <span className="text-emerald-400">x10</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded">
                    <span>🧪</span> <span className="text-zinc-400">Mana Potion</span> <span className="text-purple-400">x8</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded">
                    <span>WPN</span> <span className="text-zinc-400">{getWeaponShortName(selectedClass)}</span> <span className="text-amber-500">Equip</span>
                  </div>
                </div>
              </div>

              {/* Start Descent Button */}
              <button
                onClick={handleStart}
                className="w-full py-4 bg-gradient-to-r from-red-800 via-red-600 to-red-800 hover:from-red-700 hover:via-red-500 hover:to-red-700 text-white font-mono font-bold tracking-[0.25em] rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(220,38,38,0.25)] border border-red-700/50 hover:scale-[1.01] active:scale-[0.99]"
              >
                DESCEND INTO THE CRYPTS OF THE NIGHT 🛡️
              </button>
            </div>
          )}

          {/* TAB 2: INVENTORY */}
          {activeTab === 'inventory' && (
            <div className="flex-1 flex flex-col justify-between gap-5 animate-fade-in">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <span className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest font-mono">
                    Starting Equipment Showcase
                  </span>
                  <h2 className="text-xl font-bold tracking-wider font-serif text-zinc-100 uppercase">
                    Iron Vault Inventory 🎒
                  </h2>
                </div>
                <div className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400 rounded">
                  Capacity: <span className="text-emerald-400 font-bold">2 / 24 slots</span>
                </div>
              </div>

              {/* Main inventory split */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch flex-1">
                {/* 16-slot grid */}
                <div className="md:col-span-6 bg-zinc-950/60 rounded-xl border border-zinc-900 p-4 flex flex-col justify-between">
                  <div className="grid grid-cols-4 gap-2.5">
                    {/* Weapon slot */}
                    <button 
                      onClick={() => { playSound('hit'); setSelectedItem('weapon'); }}
                      className={`aspect-square rounded-lg border-2 flex items-center justify-center text-2xl cursor-pointer relative transition-all ${
                        selectedItem === 'weapon' 
                          ? 'border-red-600 bg-red-950/20 shadow-lg shadow-red-950/30' 
                          : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                      }`}
                    >
                      <span>⚔️</span>
                      <span className="absolute bottom-1 right-1 px-1 bg-red-950 border border-red-800 rounded text-[7px] font-mono font-bold text-red-400">EQ</span>
                    </button>

                    {/* Armor slot */}
                    <button 
                      onClick={() => { playSound('hit'); setSelectedItem('armor'); }}
                      className={`aspect-square rounded-lg border-2 flex items-center justify-center text-2xl cursor-pointer relative transition-all ${
                        selectedItem === 'armor' 
                          ? 'border-red-600 bg-red-950/20 shadow-lg shadow-red-950/30' 
                          : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                      }`}
                    >
                      <span>🛡️</span>
                      <span className="absolute bottom-1 right-1 px-1 bg-red-950 border border-red-800 rounded text-[7px] font-mono font-bold text-red-400">EQ</span>
                    </button>

                    {/* Potions */}
                    <div className="aspect-square rounded-lg border border-zinc-900 bg-zinc-900/10 flex flex-col items-center justify-center relative">
                      <span className="text-xl opacity-60">🧪</span>
                      <span className="text-[8px] font-mono text-zinc-500 mt-1">Heal (10)</span>
                    </div>
                    <div className="aspect-square rounded-lg border border-zinc-900 bg-zinc-900/10 flex flex-col items-center justify-center relative">
                      <span className="text-xl opacity-60">🧪</span>
                      <span className="text-[8px] font-mono text-zinc-500 mt-1">Mana (8)</span>
                    </div>

                    {/* Locked empty cells */}
                    {Array.from({ length: 12 }).map((_, idx) => (
                      <div 
                        key={idx} 
                        className="aspect-square rounded-lg border border-zinc-950 bg-zinc-950/40 flex items-center justify-center opacity-30 text-zinc-600 text-xs"
                      >
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                    ))}
                  </div>

                  <p className="text-[10px] font-mono text-zinc-500 mt-4 leading-normal">
                    💡 <b>Tip:</b> Defeat skeletons and search gothic treasure chests throughout the dungeons to unlock Ancient, Legendary, and Epic rings or armor artifacts.
                  </p>
                </div>

                {/* Selected Item Description Detail */}
                <div className="md:col-span-6 bg-zinc-900/30 rounded-xl border border-red-950/20 p-5 flex flex-col justify-between relative overflow-hidden">
                  {/* Subtle gothic watermark */}
                  <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#ff0000_1px,transparent_1px)] [background-size:8px_8px]" />

                  {selectedItem === 'weapon' ? (
                    <div className="flex-1 flex flex-col justify-between z-10">
                      <div>
                        <div className="flex justify-between items-start border-b border-zinc-800 pb-3 mb-3">
                          <div>
                            <span className="text-[8px] uppercase tracking-widest font-mono text-red-500 font-bold">
                              EQUIPPED WEAPON
                            </span>
                            <h3 className="text-base font-bold font-serif text-zinc-100">
                              {classesConfig[selectedClass].weaponItem.name}
                            </h3>
                          </div>
                          <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-700 rounded text-[9px] text-zinc-400 font-mono font-bold">
                            COMMON
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed font-serif italic mb-4">
                          "{classesConfig[selectedClass].weaponItem.lore}"
                        </p>
                        <div className="bg-zinc-950/80 border border-zinc-900 p-3 rounded font-mono text-xs">
                          <span className="text-[10px] text-zinc-500 block mb-1">ITEM ATTRIBUTES</span>
                          <span className="text-red-400 block font-bold">
                            {classesConfig[selectedClass].weaponItem.stats}
                          </span>
                        </div>
                      </div>
                      <div className="text-[9px] font-mono text-zinc-500">
                        *Damage scales with physical Strength and Agility attributes.
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col justify-between z-10">
                      <div>
                        <div className="flex justify-between items-start border-b border-zinc-800 pb-3 mb-3">
                          <div>
                            <span className="text-[8px] uppercase tracking-widest font-mono text-red-500 font-bold">
                              EQUIPPED ARMOR
                            </span>
                            <h3 className="text-base font-bold font-serif text-zinc-100">
                              {classesConfig[selectedClass].armorItem.name}
                            </h3>
                          </div>
                          <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-700 rounded text-[9px] text-zinc-400 font-mono font-bold">
                            COMMON
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed font-serif italic mb-4">
                          "{classesConfig[selectedClass].armorItem.lore}"
                        </p>
                        <div className="bg-zinc-950/80 border border-zinc-900 p-3 rounded font-mono text-xs">
                          <span className="text-[10px] text-zinc-500 block mb-1">ITEM ATTRIBUTES</span>
                          <span className="text-emerald-400 block font-bold">
                            {classesConfig[selectedClass].armorItem.stats}
                          </span>
                        </div>
                      </div>
                      <div className="text-[9px] font-mono text-zinc-500">
                        *Vitality bonuses directly increase your maximum HP ceiling.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ABILITIES (SKILLS TREE) */}
          {activeTab === 'abilities' && (
            <div className="flex-1 flex flex-col justify-between gap-5 animate-fade-in">
              <div className="flex flex-col gap-1">
                <span className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest font-mono">
                  Divine & Corrupted Blood Spells
                </span>
                <h2 className="text-xl font-bold tracking-wider font-serif text-zinc-100 uppercase">
                  Spellcraft & Passive Boons 🔮
                </h2>
              </div>

              {/* Skills split */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-900 flex flex-col justify-between">
                  <div>
                    <span className="text-red-500 font-bold font-mono text-[9px] tracking-widest block uppercase mb-1">MELEE SLAY (SPACEBAR)</span>
                    <h3 className="text-xs font-bold text-zinc-200 uppercase font-mono">Physical Cleave Strike</h3>
                    <p className="text-[10px] text-zinc-400 leading-normal font-serif mt-2">
                      Swing your active weapon in a sweeping frontal arc. Physical hits scale with Strength.
                    </p>
                  </div>
                  <div className="bg-zinc-900/40 p-2 border border-zinc-800 rounded font-mono text-[9px] text-zinc-500">
                    Melee Damage: <span className="text-amber-500 font-bold">10 + (STR * 1.5)</span>
                  </div>
                </div>

                <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-900 flex flex-col justify-between">
                  <div>
                    <span className="text-blue-500 font-bold font-mono text-[9px] tracking-widest block uppercase mb-1">SHADOW DASH (SHIFT)</span>
                    <h3 className="text-xs font-bold text-zinc-200 uppercase font-mono">Invincible Slide Roll</h3>
                    <p className="text-[10px] text-zinc-400 leading-normal font-serif mt-2">
                      Perform an instantaneous dodge roll in your moving direction. Grants 0.3 seconds of complete physical invincibility.
                    </p>
                  </div>
                  <div className="bg-zinc-900/40 p-2 border border-zinc-800 rounded font-mono text-[9px] text-zinc-500">
                    Cooldown: <span className="text-blue-400 font-bold">3.5 seconds</span> (Decreases with Agility)
                  </div>
                </div>

                <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-900 flex flex-col justify-between">
                  <div>
                    <span className="text-purple-500 font-bold font-mono text-[9px] tracking-widest block uppercase mb-1">MAGICAL PROJECTILE (Q KEY)</span>
                    <h3 className="text-xs font-bold text-zinc-200 uppercase font-mono">Draconic Fireball Blast</h3>
                    <p className="text-[10px] text-zinc-400 leading-normal font-serif mt-2">
                      Expend 15 MP to cast a flying ball of volatile flame that penetrates through minor monsters, exploding on impact.
                    </p>
                  </div>
                  <div className="bg-zinc-900/40 p-2 border border-zinc-800 rounded font-mono text-[9px] text-zinc-500">
                    Spell Cost: <span className="text-purple-400 font-bold">15 MP</span> | Scales with Arcane
                  </div>
                </div>
              </div>

              {/* Passive boons queue */}
              <div className="p-4 bg-zinc-900/30 rounded-xl border border-red-950/30">
                <span className="text-zinc-500 font-mono text-[10px] uppercase block mb-2">Available Level-Up Perks</span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[9px] font-mono text-zinc-400">
                  <div className="p-2 bg-zinc-950 border border-zinc-900 rounded">
                    <span className="text-red-400 font-bold block">🩸 Vampiric Touch</span>
                    <span>Defeating enemies heals you for 5% max HP.</span>
                  </div>
                  <div className="p-2 bg-zinc-950 border border-zinc-900 rounded">
                    <span className="text-amber-500 font-bold block">🔥 Dragon's Breath</span>
                    <span>Ignite enemies for damage over time.</span>
                  </div>
                  <div className="p-2 bg-zinc-950 border border-zinc-900 rounded">
                    <span className="text-sky-400 font-bold block">🛡️ Blood Shield</span>
                    <span>Gain periodic shield to deflect 1 strike.</span>
                  </div>
                  <div className="p-2 bg-zinc-950 border border-zinc-900 rounded">
                    <span className="text-purple-400 font-bold block">🔮 Double Cast</span>
                    <span>25% chance to cast Fireball twice.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CRYPTS (DUNGEON CHAPTERS) */}
          {activeTab === 'crypts' && (
            <div className="flex-1 flex flex-col justify-between gap-5 animate-fade-in">
              <div className="flex flex-col gap-1">
                <span className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest font-mono">
                  Sovereign Realms Map Progression
                </span>
                <h2 className="text-xl font-bold tracking-wider font-serif text-zinc-100 uppercase">
                  Dungeon Themes & Chapters ⛪
                </h2>
              </div>

              {/* Horizontal Theme cards */}
              <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[300px] pr-1.5">
                {[
                  { floor: 'Floor 1', name: 'Ancient Vampire Crypts', boss: 'Baron von Bone', desc: 'Cold stony graves containing coffins, bats, and skeletal guardians. Defeat the bone king to unlock the gate.', bg: 'from-zinc-950 to-zinc-900 border-zinc-900' },
                  { floor: 'Floor 2', name: 'Cathedral of Ash', boss: 'Vlad the Vampire Lord', desc: 'Huge gothic hall with towering stained glass and tall chandeliers. Drops legendary items.', bg: 'from-red-950/20 to-zinc-950 border-red-950/50' },
                  { floor: 'Floor 3', name: "Dragun's Maw Caverns", boss: 'Ash-Wing Chimera', desc: 'Magma rivers and narrow walkways. Contact with the boiling lava pool burns! Slay the beast of fire.', bg: 'from-orange-950/20 to-zinc-950 border-orange-950/50' },
                  { floor: 'Floor 4', name: 'The Smelter Forge', boss: 'Ignis Smelter Giant', desc: 'A giant forge floor flowing with liquid metal. Defeat the colossal giant before descending to the dragon.', bg: 'from-amber-950/20 to-zinc-950 border-amber-950/50' },
                  { floor: 'Floor 5', name: 'The Inner Sanctum', boss: 'Grave-Born Dragun', desc: 'The deepest layer containing the massive primordial sleeping skeleton dragon. Slay it to claim final victory.', bg: 'from-purple-950/20 to-zinc-950 border-purple-950/50' },
                ].map(th => (
                  <div key={th.floor} className={`p-4 rounded-xl border bg-gradient-to-r ${th.bg} flex justify-between items-center gap-4`}>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-zinc-900 text-[8px] font-mono text-zinc-400 border border-zinc-800 rounded">{th.floor}</span>
                        <span className="text-xs font-bold text-zinc-100 font-serif uppercase tracking-wider">{th.name}</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 font-serif leading-normal">{th.desc}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[9px] uppercase font-mono text-zinc-500 block">Guard boss</span>
                      <span className="text-[10px] font-mono text-red-500 font-bold">{th.boss}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900 text-[10px] font-mono text-zinc-500 leading-normal">
                ⚔️ <b>DESCENT RULE:</b> Locate and stand on the glowing stairs/portal on each floor to descend deeper. Portal gates are strictly locked until you defeat the boss of that level! Slay Grave-Born Dragun on Floor 5 to claim ultimate victory.
              </div>
            </div>
          )}

          {/* TAB 5: BESTIARY */}
          {activeTab === 'bestiary' && (
            <div className="flex-1 flex flex-col justify-between gap-5 animate-fade-in">
              <div className="flex flex-col gap-1">
                <span className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest font-mono">
                  Gothic Archive of Unholy Horrors
                </span>
                <h2 className="text-xl font-bold tracking-wider font-serif text-zinc-100 uppercase">
                  Cursed Bestiary & Weaknesses 📖
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch flex-1">
                {/* List */}
                <div className="md:col-span-5 flex flex-col gap-1.5 justify-center">
                  {(Object.keys(bestiaryMonsters) as typeof selectedBestiary[]).map(monsterId => (
                    <button
                      key={monsterId}
                      onClick={() => { playSound('hit'); setSelectedBestiary(monsterId); }}
                      className={`w-full text-left p-3 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
                        selectedBestiary === monsterId 
                          ? 'border-red-800 bg-red-950/20 text-red-400 font-bold' 
                          : 'border-zinc-900 bg-zinc-950/40 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {bestiaryMonsters[monsterId as keyof typeof bestiaryMonsters].name}
                    </button>
                  ))}
                </div>

                {/* Details */}
                <div className="md:col-span-7 bg-zinc-900/30 p-4 rounded-xl border border-red-950/20 flex flex-col justify-between">
                  <div>
                    <div className="border-b border-zinc-800 pb-2 mb-2 flex justify-between items-center">
                      <h3 className="text-sm font-bold font-serif text-zinc-100">
                        {bestiaryMonsters[selectedBestiary as keyof typeof bestiaryMonsters].name}
                      </h3>
                      <span className="text-[9px] font-mono text-zinc-500 uppercase">
                        {bestiaryMonsters[selectedBestiary as keyof typeof bestiaryMonsters].type}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-400 font-serif leading-relaxed mb-4">
                      {bestiaryMonsters[selectedBestiary as keyof typeof bestiaryMonsters].desc}
                    </p>

                    <div className="grid grid-cols-2 gap-3 text-[10px] font-mono">
                      <div className="p-2 bg-zinc-950 rounded border border-zinc-900">
                        <span className="text-zinc-500 block">BASE HEALTH</span>
                        <span className="text-red-400 font-bold">{bestiaryMonsters[selectedBestiary as keyof typeof bestiaryMonsters].hp} HP</span>
                      </div>
                      <div className="p-2 bg-zinc-950 rounded border border-zinc-900">
                        <span className="text-zinc-500 block">THREAT PATTERN</span>
                        <span className="text-amber-500 font-bold">{bestiaryMonsters[selectedBestiary as keyof typeof bestiaryMonsters].atk}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-2 bg-zinc-950/80 border border-zinc-900 rounded font-mono text-[9px] text-zinc-500 mt-4">
                    🛡️ <span className="text-emerald-400 font-bold">WEAKNESS:</span> {bestiaryMonsters[selectedBestiary as keyof typeof bestiaryMonsters].weakness}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: QUESTS */}
          {activeTab === 'quests' && (
            <div className="flex-1 flex flex-col justify-between gap-5 animate-fade-in">
              <div className="flex flex-col gap-1">
                <span className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest font-mono">
                  Hunter Guild Chronicle
                </span>
                <h2 className="text-xl font-bold tracking-wider font-serif text-zinc-100 uppercase">
                  Vampiric Journal & Quests 📜
                </h2>
              </div>

              {/* Journal pages */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                {/* Main Quest */}
                <div className="p-4 bg-zinc-950 border-2 border-red-950/60 rounded-xl relative flex flex-col justify-between">
                  {/* Wax Seal Effect */}
                  <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-800 border-2 border-red-900 shadow flex items-center justify-center text-xs text-red-100 font-bold">
                    🩸
                  </div>
                  
                  <div>
                    <span className="text-[8px] font-mono uppercase tracking-widest font-bold text-red-500">PRIMARY TRIAL</span>
                    <h3 className="text-sm font-bold font-serif text-zinc-100 mb-2 mt-0.5">☩ Hunt the Vampire Lord Vlad</h3>
                    <p className="text-[10px] text-zinc-400 leading-normal font-serif">
                      Locate the Grand Cathedral of Ash on Floor 2. Vlad commands elder darkness—strike his teleport circles and ignore his bat transformations to seal his crypt.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-900 font-mono text-[9px] text-zinc-500 flex justify-between">
                    <span>Reward: 3500 Gold, 4500 XP</span>
                    <span className="text-yellow-500 font-bold">ACTIVE</span>
                  </div>
                </div>

                {/* Side Quest */}
                <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl flex flex-col justify-between">
                  <div>
                    <span className="text-[8px] font-mono uppercase tracking-widest font-bold text-zinc-500">Guild Side Bounty</span>
                    <h3 className="text-sm font-bold font-serif text-zinc-100 mb-2 mt-0.5">☩ Purge the Lava Hatchlings</h3>
                    <p className="text-[10px] text-zinc-400 leading-normal font-serif">
                      Exterminate 15 dragon hatchlings thriving inside the volcanic forge on Floor 3. They are swift and attack in dense swarms.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-900 font-mono text-[9px] text-zinc-500 flex justify-between">
                    <span>Reward: 1200 Gold, 1500 XP</span>
                    <span className="text-emerald-500">CLAIMABLE</span>
                  </div>
                </div>
              </div>

              <div className="p-2.5 bg-zinc-900/30 rounded-xl border border-zinc-900/80 text-[10px] text-zinc-500 font-serif leading-normal">
                🛡️ <b>GUILD ARCHIVE:</b> Completing tasks automatically logs XP into your active level bar. On level-up, you will gain +5 stat tokens to allocate strength or defense.
              </div>
            </div>
          )}

          {/* TAB 7: WORLD MAP */}
          {activeTab === 'map' && (
            <div className="flex-1 flex flex-col justify-between gap-4 animate-fade-in">
              <div className="flex flex-col gap-1">
                <span className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest font-mono">
                  Ancient Weathered Cartographic Layout
                </span>
                <h2 className="text-xl font-bold tracking-wider font-serif text-zinc-100 uppercase">
                  Map of the Cursed Kingdoms 🗺️
                </h2>
              </div>

              {/* The Map graphic area */}
              <div className="flex-1 rounded-xl border border-amber-950/40 overflow-hidden relative bg-zinc-950 min-h-[230px]">
                <img 
                  src={mapImg} 
                  alt="Ancient Cursed World Map" 
                  className="absolute inset-0 w-full h-full object-cover opacity-80 hover:scale-105 transition-transform duration-1000 pointer-events-none"
                  referrerPolicy="no-referrer"
                />
                
                {/* Overlay glowing map links */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                  <path d="M 60 180 L 140 100 L 250 140 L 340 70 L 420 180" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="5,5" className="animate-pulse" />
                </svg>

                {/* Interactive Map Nodes */}
                {[
                  { id: 'crypts', name: 'Blood Crypts (F1)', x: '15%', y: '75%', desc: 'Cold tomb of minor skeletons. Level 1+' },
                  { id: 'forest', name: 'Crimson Forest (F2)', x: '35%', y: '40%', desc: 'Cursed red woods. Level 5+' },
                  { id: 'cathedral', name: 'Cathedral (F2 Boss)', x: '55%', y: '60%', desc: 'Throne of Vampire Lord Vlad. Level 10+' },
                  { id: 'forge', name: 'Dragon Forge (F3)', x: '72%', y: '25%', desc: 'Volcanic magma ovens. Level 15+' },
                  { id: 'sanctum', name: 'Inner Sanctum (F4 Boss)', x: '88%', y: '75%', desc: 'Sleeping tomb of Grave Dragun. Level 20+' }
                ].map(node => {
                  const isSelected = selectedMapNode === node.id;
                  return (
                    <button
                      key={node.id}
                      onClick={() => { playSound('hit'); setSelectedMapNode(node.id); }}
                      className="absolute p-1 focus:outline-none cursor-pointer group"
                      style={{ left: node.x, top: node.y }}
                    >
                      <span className={`flex h-4 w-4 relative`}>
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isSelected ? 'bg-red-500' : 'bg-amber-500'}`} />
                        <span className={`relative inline-flex rounded-full h-4 w-4 ${isSelected ? 'bg-red-600 shadow-[0_0_8px_#ef4444]' : 'bg-amber-600'}`} />
                      </span>
                      
                      {/* Hover label */}
                      <span className="absolute left-6 -top-2 scale-0 group-hover:scale-100 bg-zinc-950/90 border border-zinc-800 text-[8px] text-zinc-300 font-mono px-1.5 py-0.5 rounded shadow z-50 whitespace-nowrap">
                        {node.name}
                      </span>
                    </button>
                  );
                })}

                {/* Selected Node Details Pane */}
                <div className="absolute bottom-3 left-3 right-3 bg-zinc-950/90 border border-zinc-900 p-3 rounded-lg backdrop-blur-md flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-[9px] text-zinc-500 block uppercase font-bold">Selected territory</span>
                    <span className="text-zinc-200 font-serif font-bold text-xs">
                      {selectedMapNode === 'crypts' ? 'Ancient Sanguine Crypts' :
                       selectedMapNode === 'forest' ? 'Cursed Bleeding Woods' :
                       selectedMapNode === 'cathedral' ? 'Cathedral of Crimson Ash' :
                       selectedMapNode === 'forge' ? 'The Molten Titan Forge' : 'Sanctum of the Grave Dragun'}
                    </span>
                    <p className="text-[10px] text-zinc-400 mt-1">
                      {selectedMapNode === 'crypts' ? 'Dungeon of skulls, chains, and bats. Excellent starting loot.' :
                       selectedMapNode === 'forest' ? 'Vast overgrown pines bleeding thick crimson sap. Wolves roam here.' :
                       selectedMapNode === 'cathedral' ? 'Vlad standard. Tall candles, columns, and flying stone gargoyles.' :
                       selectedMapNode === 'forge' ? 'Narrow metal bridges over pools of burning magma.' : 'Final deep-earth arena containing the ultimate Dragon boss.'}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-[8px] text-zinc-500 block">THREAT RATING</span>
                    <span className="text-red-500 font-bold uppercase text-[10px]">
                      {selectedMapNode === 'crypts' ? '★☆☆☆☆' :
                       selectedMapNode === 'forest' ? '★★☆☆☆' :
                       selectedMapNode === 'cathedral' ? '★★★☆☆' :
                       selectedMapNode === 'forge' ? '★★★★☆' : '★★★★★'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="flex-1 flex flex-col justify-between gap-5 animate-fade-in">
              <div className="flex flex-col gap-1">
                <span className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest font-mono">
                  Adjust Game Speed & Visual Shaders
                </span>
                <h2 className="text-xl font-bold tracking-wider font-serif text-zinc-100 uppercase">
                  Sanctum Configurations & Filters ⚙️
                </h2>
              </div>

              <div className="bg-zinc-900/20 p-4 rounded-xl border border-red-950/20 flex-1 flex flex-col gap-4">
                <p className="text-xs text-zinc-400 font-serif leading-normal">
                  Adjust global game configurations below. You can also toggled on-screen mobile visual touch buttons, which makes playing inside browser sandbox containers extremely responsive and smooth!
                </p>

                <button
                  onClick={() => { playSound('levelup'); onOpenSettings(); }}
                  className="py-3 px-6 bg-red-950/40 hover:bg-red-950/80 border border-red-800 text-red-400 font-mono text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Settings className="w-4 h-4" /> LAUNCH CONFIGURATION DASHBOARD ⚔️
                </button>
              </div>

              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900 text-[10px] font-mono text-zinc-500 leading-normal flex gap-1.5">
                <HelpCircle className="w-4 h-4 text-zinc-400 shrink-0" />
                <span>Need mobile joystick? Select settings above and enable "On-Screen Controls" to get virtual touch arrow keys and slash triggers!</span>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT SIDE DETAILS AND PRE-GAME HUB INFO PANEL */}
        <div className="w-full lg:w-80 bg-zinc-950/90 border border-zinc-900/80 rounded-2xl p-4 flex flex-col justify-between gap-5 shadow-2xl backdrop-blur-md">
          
          {/* Sanctum of Ash (Hub Area) */}
          <div className="flex flex-col gap-4">
            <div className="border-b border-zinc-900 pb-2 flex flex-col gap-0.5">
              <span className="text-[8px] uppercase tracking-widest text-zinc-500 font-mono">
                Safe Town Haven
              </span>
              <h3 className="text-sm font-bold font-serif text-amber-500 flex items-center gap-1.5">
                <span>🏰 Sanctum of Ash</span>
              </h3>
            </div>
            
            {/* Quick interactive NPCs list */}
            <div className="flex flex-col gap-3 max-h-[170px] overflow-y-auto pr-1">
              {hubNPCs.map(npc => (
                <div key={npc.name} className="p-2 bg-zinc-900/30 rounded border border-zinc-900/60 text-[10px] flex gap-2 items-start hover:border-red-950/60 transition-colors">
                  <span className="text-base leading-none mt-0.5">{npc.icon}</span>
                  <div>
                    <span className="font-bold text-zinc-300 block">{npc.name}</span>
                    <span className="text-[8px] text-amber-500/80 uppercase font-mono block mb-1 font-semibold">{npc.role}</span>
                    <span className="text-zinc-500 leading-normal font-serif block">{npc.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Next Destination Card */}
          <div className="bg-zinc-900/20 p-4.5 rounded-xl border border-red-950/20 flex flex-col gap-3 relative overflow-hidden">
            {/* Subtle layout image for NEXT DESTINATION */}
            <div className="absolute inset-0 z-0">
              <img 
                src={mainBannerImg} 
                alt="Crypts background" 
                className="w-full h-full object-cover opacity-15 filter brightness-50"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="z-10 flex flex-col gap-1.5">
              <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest block font-bold leading-none">
                NEXT OBJECTIVE
              </span>
              <h4 className="text-xs font-bold font-serif text-red-500 uppercase tracking-wider leading-none">
                CRYPTS OF THE NIGHT 💀
              </h4>
              <p className="text-[10px] text-zinc-400 font-serif leading-relaxed">
                The gates have splintered. Descend deep below the stone cathedral to explore, loot armor chests, and slay skeletal forces.
              </p>
            </div>

            <div className="z-10 grid grid-cols-2 gap-2 text-[9px] font-mono pt-2 border-t border-zinc-900">
              <div>
                <span className="text-zinc-500 block leading-none mb-1">RECOMMENDED</span>
                <span className="text-zinc-300 font-bold block leading-none">Level 1 - 5</span>
              </div>
              <div className="text-right">
                <span className="text-zinc-500 block leading-none mb-1">DIFFICULTY</span>
                <span className="text-amber-500 font-bold block leading-none">★★☆☆☆</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* BOTTOM CONTROLS HELPER BAR */}
      <div className="bg-[#050507] border-t border-zinc-900/60 px-4 py-2 flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono text-zinc-500 gap-2 z-10">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-zinc-300">W,A,S,D</span>
            <span>Move Around</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-zinc-300">Spacebar</span>
            <span>Melee Strike</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-zinc-300">Shift Key</span>
            <span>Invincible Dash</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-zinc-300">Q Key</span>
            <span>Fireball Spell</span>
          </div>
        </div>
        <div className="text-zinc-600 text-[9px] text-center sm:text-right italic">
          "The draconic bloodline awakens under the eternal moon..."
        </div>
      </div>

    </div>
  );
}
