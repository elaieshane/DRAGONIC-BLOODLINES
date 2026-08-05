import React, { useEffect, useState } from 'react';
import { ShieldCheck, Sparkles, Skull, Scroll, ArrowRight, X } from 'lucide-react';

interface DungeonGraveyardProps {
  onExit: () => void;
}

const encounterOptions = [
  {
    id: 'gargoyle',
    title: 'Stone Gargoyle Sentinel',
    description: 'A weathered guardian carved from black granite. Its eyes glow with violet wards.',
    blessing: 'The Gargoyle awakes and grants you the Shell of Stone, boosting your defense and warding off critical strikes.',
    reward: 'Gargoyle Shell'
  },
  {
    id: 'hero',
    title: 'Forsaken Hero Statue',
    description: 'A fallen champion draped in tattered banners. When touched, it whispers of buried valor.',
    blessing: 'The Hero’s spirit empowers your weapon, granting a burst of spectral slashes on your next attack.',
    reward: 'Blade of Remembrance'
  },
  {
    id: 'goddess',
    title: 'Eternal Goddess Effigy',
    description: 'A serene altar statue with flowing stone robes. A soft light hums from its crown.',
    blessing: 'The Goddess blesses you with a Sacred Ward that heals you each time you survive a near-fatal blow.',
    reward: 'Ward of Awakening'
  }
];

export default function DungeonGraveyard({ onExit }: DungeonGraveyardProps) {
  const [phase, setPhase] = useState<'intro' | 'investigate' | 'awakening' | 'reward'>('intro');
  const [choice, setChoice] = useState<string>('');
  const [chosenEncounter, setChosenEncounter] = useState<typeof encounterOptions[number] | null>(null);
  const [message, setMessage] = useState<string>('Approach a forgotten memorial and listen to the stone whisper.');

  useEffect(() => {
    if (phase !== 'awakening' || !chosenEncounter) return;

    setMessage('The air trembles. Runic light begins to pulse from the statue...');
    const awakenTimer = window.setTimeout(() => {
      setPhase('reward');
      setMessage(chosenEncounter.blessing);
    }, 1400);

    return () => window.clearTimeout(awakenTimer);
  }, [phase, chosenEncounter]);

  const handleBegin = () => {
    setPhase('investigate');
    setMessage('Three statues stand before you. Choose one to make contact with the graveyard spirit.');
  };

  const handleChoose = (optionId: string) => {
    const encounter = encounterOptions.find(opt => opt.id === optionId);
    if (!encounter) return;
    setChosenEncounter(encounter);
    setChoice(encounter.title);
    setPhase('awakening');
    setMessage(`You place your hand on the ${encounter.title}. Its stone skin vibrates with ancient power.`);
  };

  const handleLeave = () => {
    onExit();
  };

  return (
    <div className="min-h-screen w-full bg-[#060607] text-zinc-100 py-8 px-4 sm:px-6 lg:px-10">
      <div className="max-w-6xl mx-auto grid gap-6 lg:grid-cols-[1.45fr_0.95fr]">
        <div className="rounded-[2rem] border border-red-950/40 bg-zinc-950/90 p-8 shadow-[0_0_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.45em] text-red-400 font-mono mb-2">Graveyard Encounter</p>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-zinc-100 tracking-tight">The Statue Awakening</h1>
              <p className="mt-3 text-sm text-zinc-400 max-w-2xl leading-7">
                An abandoned memorial lies deep in the crypts. Ancient statues stir when you draw near—choose your offering wisely to reap the forgotten boon.
              </p>
            </div>
            <button
              onClick={handleLeave}
              className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-300 hover:border-red-600 hover:text-red-300 transition"
            >
              <X className="w-4 h-4" />
              RETURN
            </button>
          </div>

          <div className="rounded-3xl border border-zinc-900/80 bg-gradient-to-br from-zinc-950/90 to-black/80 p-6 shadow-inner shadow-black/40">
            <div className="flex flex-col gap-4">
              <div className="rounded-3xl border border-red-950/30 bg-zinc-900/90 p-5 text-sm leading-7 text-zinc-300">
                <p className="text-zinc-100 font-bold mb-3">Encounter Status</p>
                <p>{message}</p>
              </div>

              {phase === 'intro' && (
                <div className="space-y-4">
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    The cemetery is both sanctuary and trap. Stone eyes follow your every move, and the restless dead whisper secrets in the dark. Activate the ritual to awaken a guardian statue.
                  </p>
                  <button
                    onClick={handleBegin}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-700 via-red-500 to-red-700 px-6 py-4 text-sm font-bold uppercase tracking-[0.2em] text-white shadow-[0_0_20px_rgba(239,68,68,0.25)] transition hover:brightness-110"
                  >
                    <Sparkles className="w-4 h-4" />
                    Invoke the Graveyard Ritual
                  </button>
                </div>
              )}

              {phase === 'investigate' && (
                <div className="grid gap-4 sm:grid-cols-3">
                  {encounterOptions.map(option => (
                    <button
                      key={option.id}
                      onClick={() => handleChoose(option.id)}
                      className="group rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5 text-left transition hover:border-red-600 hover:bg-zinc-800"
                    >
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div>
                          <h2 className="text-sm font-semibold text-zinc-100">{option.title}</h2>
                          <p className="text-[10px] uppercase tracking-[0.3em] text-red-500 font-mono mt-1">ANCIENT STATUE</p>
                        </div>
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-red-950 text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.08)]">🪨</span>
                      </div>
                      <p className="text-[13px] text-zinc-400 leading-relaxed">{option.description}</p>
                    </button>
                  ))}
                </div>
              )}

              {phase === 'awakening' && chosenEncounter && (
                <div className="rounded-3xl border border-red-950/20 bg-zinc-900/90 p-5 text-sm text-zinc-300">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-red-950 text-red-200 text-xl">⚡</span>
                    <div>
                      <p className="text-sm font-semibold text-zinc-100">Awakening {chosenEncounter.title}</p>
                      <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-500">{choice}</p>
                    </div>
                  </div>
                  <p className="leading-7">{message}</p>
                </div>
              )}

              {phase === 'reward' && chosenEncounter && (
                <div className="rounded-3xl border border-emerald-500/20 bg-emerald-950/5 p-6 text-zinc-200">
                  <div className="flex items-center justify-between gap-4 mb-5">
                    <div>
                      <p className="text-xs uppercase tracking-[0.35em] text-emerald-300 font-mono">Blessing Unleashed</p>
                      <h2 className="mt-2 text-2xl font-bold text-emerald-200">{chosenEncounter.reward}</h2>
                    </div>
                    <ShieldCheck className="w-10 h-10 text-emerald-300" />
                  </div>
                  <p className="text-sm leading-7 text-zinc-100 mb-5">{chosenEncounter.blessing}</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-3xl border border-emerald-500/20 bg-black/30 p-4">
                      <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-500">Ritual Outcome</p>
                      <p className="mt-3 text-sm text-zinc-300 leading-relaxed">The statue’s essence now pulses inside your gear, empowering your next descent with graveborn might.</p>
                    </div>
                    <div className="rounded-3xl border border-zinc-800 bg-zinc-900/90 p-4">
                      <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-500">Reward</p>
                      <p className="mt-3 text-sm text-zinc-300 leading-relaxed"><strong>{chosenEncounter.reward}</strong> added to your repertoire of relics.</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLeave}
                    className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-emerald-500/10 border border-emerald-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-200 hover:bg-emerald-500/15 transition"
                  >
                    <ArrowRight className="w-4 h-4" />
                    Return to the Crypts
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <aside className="rounded-[2rem] border border-zinc-900/70 bg-zinc-950/80 p-6 shadow-[0_0_60px_rgba(0,0,0,0.35)]">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-500 font-mono">Relic Insight</p>
              <h2 className="text-xl font-semibold text-zinc-100">Graveyard Secrets</h2>
            </div>
            <Skull className="w-6 h-6 text-red-500" />
          </div>

          <div className="space-y-4 text-sm leading-7 text-zinc-400">
            <div className="rounded-3xl border border-zinc-900/70 bg-zinc-900/70 p-4">
              <p className="font-semibold text-zinc-100">Silent Statues</p>
              <p>Each statue hides a fragment of a story. Only one answer will unlock the blessing instead of the curse.</p>
            </div>
            <div className="rounded-3xl border border-zinc-900/70 bg-zinc-900/70 p-4">
              <p className="font-semibold text-zinc-100">Recommended Path</p>
              <p>Choose a statue that matches your playstyle. The Hero path favors offense, Goddess favors sustain, Gargoyle favors defense.</p>
            </div>
            <div className="rounded-3xl border border-zinc-900/70 bg-zinc-900/70 p-4">
              <p className="font-semibold text-zinc-100">Legend</p>
              <p>If you awaken the right effigy, the graveyard will grant you a permanent boon for the next dungeon run.</p>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-red-950/30 bg-zinc-900/90 p-5 text-sm text-zinc-400">
            <div className="flex items-center gap-2 mb-3 text-emerald-300 font-semibold">
              <Sparkles className="w-4 h-4" /> Ritual Tips
            </div>
            <ul className="space-y-2 list-disc pl-4 text-zinc-500">
              <li>Look for the statue whose aura resonates with your current champion.</li>
              <li>Once awakened, the chosen idol cannot be changed.</li>
              <li>Return quickly and descend to the crypts before the ritual fades.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
