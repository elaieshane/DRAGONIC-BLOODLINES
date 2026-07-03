import React from 'react';
import { GameSettings } from '../types';
import { X, Volume2, VolumeX, ShieldAlert, Eye, Tv, Sliders, Check, HelpCircle } from 'lucide-react';
import { playSound, setVolume } from './SoundEffects';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (nextSettings: GameSettings) => void;
  onClose: () => void;
}

export default function SettingsModal({ settings, onUpdateSettings, onClose }: SettingsModalProps) {
  const handleChangeVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onUpdateSettings({
      ...settings,
      masterVolume: val,
    });
    setVolume(val);
  };

  const toggleMute = () => {
    const newVolume = settings.masterVolume > 0 ? 0 : 0.3;
    onUpdateSettings({
      ...settings,
      masterVolume: newVolume,
    });
    setVolume(newVolume);
    playSound('hit');
  };

  const selectDifficulty = (diff: GameSettings['difficulty']) => {
    onUpdateSettings({
      ...settings,
      difficulty: diff,
    });
    playSound('levelup');
  };

  const toggleScanlines = () => {
    onUpdateSettings({
      ...settings,
      crtScanlines: !settings.crtScanlines,
    });
    playSound('hit');
  };

  const toggleVignette = () => {
    onUpdateSettings({
      ...settings,
      pixelVignette: !settings.pixelVignette,
    });
    playSound('hit');
  };

  const toggleVirtualControls = () => {
    onUpdateSettings({
      ...settings,
      showOnScreenButtons: !settings.showOnScreenButtons,
    });
    playSound('hit');
  };

  const setShake = (shake: GameSettings['screenShake']) => {
    onUpdateSettings({
      ...settings,
      screenShake: shake,
    });
    playSound('hit');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans select-none text-zinc-100">
      <div className="max-w-md w-full rounded-2xl border border-red-900/60 bg-zinc-950/95 shadow-2xl p-6 relative overflow-hidden gothic-corner-tl gothic-corner-tr gothic-corner-bl gothic-corner-br">
        
        {/* Subtle blood dust texture */}
        <div className="absolute inset-0 pointer-events-none opacity-5 bg-[radial-gradient(#ff0000_1px,transparent_1px)] [background-size:12px_12px]" />
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-red-950/50 pb-3 mb-5 z-10 relative">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            <div>
              <h2 className="text-lg font-bold tracking-wider font-serif text-red-500">
                GOTHIC CONFIGURATIONS
              </h2>
              <span className="text-[10px] text-zinc-500 uppercase font-mono block">Game Settings & Filters</span>
            </div>
          </div>
          <button
            onClick={() => { playSound('hit'); onClose(); }}
            className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-red-500 transition-colors border border-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Configurations Body */}
        <div className="flex flex-col gap-5 z-10 relative max-h-[75vh] overflow-y-auto pr-1">
          
          {/* AUDIO BLOCK */}
          <div className="flex flex-col gap-2">
            <span className="text-zinc-500 text-[10px] uppercase font-mono tracking-widest block flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-red-500" /> Master Audio
            </span>
            <div className="flex items-center gap-3 bg-zinc-900/60 p-3 rounded-lg border border-zinc-800/60">
              <button
                onClick={toggleMute}
                className="p-1.5 rounded bg-zinc-950 hover:bg-zinc-800 border border-zinc-800/80 text-zinc-300 transition-colors"
                title="Mute"
              >
                {settings.masterVolume === 0 ? <VolumeX className="w-4 h-4 text-red-500 animate-pulse" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.masterVolume}
                onChange={handleChangeVolume}
                className="flex-1 accent-red-600 h-1.5 bg-zinc-950 rounded-lg cursor-pointer border border-zinc-800"
              />
              <span className="text-xs font-mono w-8 text-right text-zinc-400">
                {Math.round(settings.masterVolume * 100)}%
              </span>
            </div>
          </div>

          {/* GAME DIFFICULTY */}
          <div className="flex flex-col gap-2">
            <span className="text-zinc-500 text-[10px] uppercase font-mono tracking-widest block flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-red-500" /> Bloodline Difficulty
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(['Casual', 'Adventurer', 'Nightmare'] as const).map(diff => {
                const isSelected = settings.difficulty === diff;
                let desc = 'Normal';
                let color = 'hover:border-blue-800 text-blue-400';
                if (diff === 'Casual') { desc = '+30% DMG Buff'; color = 'hover:border-emerald-800 text-emerald-400'; }
                if (diff === 'Nightmare') { desc = '1.4x Enemy Atk'; color = 'hover:border-red-800 text-red-500'; }

                return (
                  <button
                    key={diff}
                    onClick={() => selectDifficulty(diff)}
                    className={`p-2 rounded-lg border text-left flex flex-col justify-between transition-all duration-200 ${
                      isSelected 
                        ? 'bg-red-950/20 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.1)]' 
                        : 'bg-zinc-900/40 border-zinc-800/60 ' + color
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-xs font-bold font-serif">{diff}</span>
                      {isSelected && <Check className="w-3 h-3 text-red-500" />}
                    </div>
                    <span className="text-[8px] text-zinc-500 uppercase font-mono block leading-none">{desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* VIDEO FILTERS */}
          <div className="flex flex-col gap-2">
            <span className="text-zinc-500 text-[10px] uppercase font-mono tracking-widest block flex items-center gap-1.5">
              <Tv className="w-3.5 h-3.5 text-red-500" /> Retro Arcade Shaders
            </span>
            <div className="grid grid-cols-2 gap-2">
              
              {/* CRT Scanline Toggle */}
              <button
                onClick={toggleScanlines}
                className={`p-3 rounded-lg border text-left flex justify-between items-center transition-all duration-200 ${
                  settings.crtScanlines 
                    ? 'bg-red-950/10 border-red-500 text-zinc-100' 
                    : 'bg-zinc-900/40 border-zinc-800/60 text-zinc-500'
                }`}
              >
                <div>
                  <span className="text-xs font-bold block font-mono">CRT Scanlines</span>
                  <span className="text-[8px] text-zinc-500 uppercase font-mono block leading-none mt-1">
                    {settings.crtScanlines ? 'Active 📺' : 'Inactive'}
                  </span>
                </div>
                <div className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-200 ${settings.crtScanlines ? 'bg-red-600' : 'bg-zinc-800'}`}>
                  <div className={`w-3 h-3 rounded-full bg-white transition-transform duration-200 ${settings.crtScanlines ? 'transform translate-x-4' : ''}`} />
                </div>
              </button>

              {/* Pixel Vignette Toggle */}
              <button
                onClick={toggleVignette}
                className={`p-3 rounded-lg border text-left flex justify-between items-center transition-all duration-200 ${
                  settings.pixelVignette 
                    ? 'bg-red-950/10 border-red-500 text-zinc-100' 
                    : 'bg-zinc-900/40 border-zinc-800/60 text-zinc-500'
                }`}
              >
                <div>
                  <span className="text-xs font-bold block font-mono">Ambient Vignette</span>
                  <span className="text-[8px] text-zinc-500 uppercase font-mono block leading-none mt-1">
                    {settings.pixelVignette ? 'Active 👁️' : 'Inactive'}
                  </span>
                </div>
                <div className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-200 ${settings.pixelVignette ? 'bg-red-600' : 'bg-zinc-800'}`}>
                  <div className={`w-3 h-3 rounded-full bg-white transition-transform duration-200 ${settings.pixelVignette ? 'transform translate-x-4' : ''}`} />
                </div>
              </button>

            </div>
          </div>

          {/* SCREEN SHAKE & ON-SCREEN TOUCH BUTTONS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Screen Shake intensity */}
            <div className="flex flex-col gap-2">
              <span className="text-zinc-500 text-[10px] uppercase font-mono tracking-widest block">
                Impact Screen Shake
              </span>
              <div className="flex bg-zinc-900/60 border border-zinc-800/60 rounded-lg p-1.5 gap-1.5">
                {(['None', 'Low', 'High'] as const).map(intensity => (
                  <button
                    key={intensity}
                    onClick={() => setShake(intensity)}
                    className={`flex-1 text-center py-1 text-xs rounded font-mono ${
                      settings.screenShake === intensity 
                        ? 'bg-red-900/40 text-white font-bold border border-red-800/50' 
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {intensity}
                  </button>
                ))}
              </div>
            </div>

            {/* Virtual Controls Toggle */}
            <div className="flex flex-col gap-2">
              <span className="text-zinc-500 text-[10px] uppercase font-mono tracking-widest block">
                On-Screen Controls
              </span>
              <button
                onClick={toggleVirtualControls}
                className={`w-full py-2.5 px-3 rounded-lg border text-left flex justify-between items-center transition-all duration-200 ${
                  settings.showOnScreenButtons 
                    ? 'bg-red-950/10 border-red-500 text-zinc-100' 
                    : 'bg-zinc-900/40 border-zinc-800/60 text-zinc-500'
                }`}
              >
                <span className="text-xs font-bold font-mono">Mobile Touch Buttons</span>
                <span className="text-[10px] font-mono font-bold text-red-500">{settings.showOnScreenButtons ? 'ON' : 'OFF'}</span>
              </button>
            </div>

          </div>

          {/* INFO BANNER */}
          <div className="bg-zinc-900/40 p-3 rounded-lg border border-red-950/30 text-[10px] font-mono text-zinc-500 leading-normal flex gap-2 items-start">
            <HelpCircle className="w-5 h-5 text-red-800 shrink-0" />
            <div>
              <span><b>MOBILE & MOUSE TIPS:</b> Enable On-Screen touch buttons above to play entirely using clicks/taps instead of a keyboard! Excellent for playing inside sandbox containers.</span>
            </div>
          </div>

        </div>

        {/* Action Footer */}
        <button
          onClick={() => { playSound('levelup'); onClose(); }}
          className="w-full mt-6 py-3 bg-gradient-to-r from-red-800 to-red-600 hover:from-red-700 hover:to-red-500 text-white font-mono font-bold tracking-widest rounded-lg transition-colors border border-red-700/40"
        >
          APPLY CONFIGURATIONS ⚔️
        </button>

      </div>
    </div>
  );
}
