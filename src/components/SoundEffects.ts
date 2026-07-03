// Procedural retro sound generator using Web Audio API

let audioCtx: AudioContext | null = null;
let bgmInterval: number | null = null;
let currentBgmNodes: AudioNode[] = [];
let bgmTheme: 'explore' | 'boss' | 'none' = 'none';
let bgmVolumeNode: GainNode | null = null;
let masterVolume = 0.3; // Default master volume

export function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function setVolume(volume: number) {
  masterVolume = Math.max(0, Math.min(1, volume));
  if (bgmVolumeNode) {
    bgmVolumeNode.gain.setValueAtTime(masterVolume * 0.4, audioCtx ? audioCtx.currentTime : 0);
  }
}

export function playSound(type: 'hit' | 'player_hit' | 'spell' | 'swing' | 'levelup' | 'chest' | 'stairs' | 'teleport' | 'boss_roar') {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') return;

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(masterVolume, now);
    masterGain.connect(ctx.destination);

    switch (type) {
      case 'swing': {
        // High frequency white noise fading out quickly
        const bufferSize = ctx.sampleRate * 0.1; // 0.1 seconds
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1200, now);
        filter.frequency.exponentialRampToValueAtTime(300, now + 0.1);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);
        noise.start(now);
        break;
      }
      case 'spell': {
        // Rising square wave
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.25);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.25);
        break;
      }
      case 'hit': {
        // Short crunchy noise + pitch drop
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.setValueAtTime(60, now + 0.08);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.6, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.12);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.12);
        break;
      }
      case 'player_hit': {
        // Low crunch grunt
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.2);

        const osc2 = ctx.createOscillator();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(95, now);
        osc2.frequency.linearRampToValueAtTime(25, now + 0.25);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.8, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

        osc.connect(gain);
        osc2.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc2.start(now);
        osc.stop(now + 0.25);
        osc2.stop(now + 0.25);
        break;
      }
      case 'levelup': {
        // Triumphant 8-bit minor third to major fifth intervals
        const notes = [261.63, 311.13, 392.00, 523.25, 622.25, 783.99]; // C4, Eb4, G4, C5, Eb5, G5 (Gothic chord)
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          osc.type = 'square';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);

          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.08 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.4);

          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.4);
        });
        break;
      }
      case 'chest': {
        // Metallic creek + chiming coin sounds
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(500, now + 0.15);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.2);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.2);

        // Chimes
        const chimeFreqs = [880, 987.77, 1046.50, 1318.51];
        chimeFreqs.forEach((freq, idx) => {
          const chime = ctx.createOscillator();
          chime.type = 'sine';
          chime.frequency.setValueAtTime(freq, now + 0.1 + idx * 0.06);

          const chimeGain = ctx.createGain();
          chimeGain.gain.setValueAtTime(0.2, now + 0.1 + idx * 0.06);
          chimeGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1 + idx * 0.06 + 0.2);

          chime.connect(chimeGain);
          chimeGain.connect(masterGain);
          chime.start(now + 0.1 + idx * 0.06);
          chime.stop(now + 0.1 + idx * 0.06 + 0.2);
        });
        break;
      }
      case 'stairs': {
        // Deep resonance descending
        for (let i = 0; i < 4; i++) {
          const osc = ctx.createOscillator();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(160 - i * 30, now + i * 0.15);

          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0.4, now + i * 0.15);
          gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.35);

          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now + i * 0.15);
          osc.stop(now + i * 0.15 + 0.35);
        }
        break;
      }
      case 'teleport': {
        // Sci-fi/magic swoosh
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.35);

        const osc2 = ctx.createOscillator();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(1200, now);
        osc2.frequency.exponentialRampToValueAtTime(300, now + 0.35);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

        osc.connect(gain);
        osc2.connect(gain);
        gain.connect(masterGain);

        osc.start(now);
        osc2.start(now);
        osc.stop(now + 0.35);
        osc2.stop(now + 0.35);
        break;
      }
      case 'boss_roar': {
        // Low pitch modulation roar
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(80, now);
        osc.frequency.linearRampToValueAtTime(45, now + 0.8);

        // LFO for growl
        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(25, now); // 25Hz vibration
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(25, now);

        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.8, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

        osc.connect(gain);
        gain.connect(masterGain);

        lfo.start(now);
        osc.start(now);
        lfo.stop(now + 0.8);
        osc.stop(now + 0.8);
        break;
      }
    }
  } catch (err) {
    console.error('Sound error:', err);
  }
}

// Procedural Gothic Music Engine
export function stopBGM() {
  if (bgmInterval) {
    window.clearInterval(bgmInterval);
    bgmInterval = null;
  }
  currentBgmNodes.forEach(node => {
    try {
      (node as any).stop();
    } catch {}
  });
  currentBgmNodes = [];
  bgmTheme = 'none';
}

export function startBGM(theme: 'explore' | 'boss') {
  if (bgmTheme === theme) return; // Already playing
  stopBGM();
  bgmTheme = theme;

  try {
    const ctx = getAudioContext();
    if (!bgmVolumeNode) {
      bgmVolumeNode = ctx.createGain();
      bgmVolumeNode.connect(ctx.destination);
    }
    bgmVolumeNode.gain.setValueAtTime(masterVolume * 0.4, ctx.currentTime);

    let step = 0;
    const tempo = theme === 'boss' ? 140 : 100; // BPM
    const stepDuration = 60 / tempo / 2; // Eighth notes

    // Chords / Melodies loops
    // G minor / Eb Major / D minor gothic organ progression
    const exploreMelody = [
      196.00, 220.00, 233.08, 293.66, 311.13, 293.66, 233.08, 220.00, // G3, A3, Bb3, D4, Eb4, D4, Bb3, A3
      196.00, 233.08, 293.66, 392.00, 349.23, 293.66, 233.08, 220.00, // G3, Bb3, D4, G4, F4, D4, Bb3, A3
      155.56, 196.00, 233.08, 311.13, 293.66, 233.08, 196.00, 155.56, // Eb3, G3, Bb3, Eb4, D4, Bb3, G3, Eb3
      146.83, 174.61, 220.00, 293.66, 329.63, 293.66, 220.00, 174.61, // D3, F3, A3, D4, E4, D4, A3, F3
    ];

    const exploreBass = [
      98.00, 98.00, 98.00, 98.00, // G2
      98.00, 98.00, 98.00, 98.00, 
      77.78, 77.78, 77.78, 77.78, // Eb2
      73.42, 73.42, 73.42, 73.42, // D2
    ];

    const bossMelody = [
      233.08, 233.08, 293.66, 293.66, 311.13, 293.66, 233.08, 220.00, // Speed G-Minor arpeggio
      233.08, 293.66, 392.00, 466.16, 440.00, 392.00, 293.66, 220.00,
      155.56, 196.00, 233.08, 311.13, 392.00, 311.13, 233.08, 196.00,
      146.83, 174.61, 220.00, 293.66, 349.23, 293.66, 220.00, 174.61,
    ];

    const bossBass = [
      98.00, 146.83, 98.00, 146.83, // Fast alternating bass
      98.00, 146.83, 98.00, 146.83,
      77.78, 116.54, 77.78, 116.54,
      73.42, 110.00, 73.42, 110.00,
    ];

    const scheduler = () => {
      const now = ctx.currentTime;
      
      // Melody note (Square/Triangle lead)
      const isLeadStep = step % 2 === 0;
      if (isLeadStep) {
        const melodyArray = theme === 'boss' ? bossMelody : exploreMelody;
        const melodyIdx = (step / 2) % melodyArray.length;
        const freq = melodyArray[melodyIdx];

        if (freq) {
          const osc = ctx.createOscillator();
          osc.type = theme === 'boss' ? 'sawtooth' : 'triangle';
          osc.frequency.setValueAtTime(freq, now);

          // Subtle detune for gothic chorused feel
          const detuneOsc = ctx.createOscillator();
          detuneOsc.type = osc.type;
          detuneOsc.frequency.setValueAtTime(freq * 1.005, now);

          const gain = ctx.createGain();
          gain.gain.setValueAtTime(theme === 'boss' ? 0.08 : 0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration * 1.8);

          osc.connect(gain);
          detuneOsc.connect(gain);
          gain.connect(bgmVolumeNode!);

          osc.start(now);
          detuneOsc.start(now);
          osc.stop(now + stepDuration * 1.9);
          detuneOsc.stop(now + stepDuration * 1.9);

          // Keep track to stop on scene transition
          currentBgmNodes.push(osc, detuneOsc);
          // Cleanup old nodes
          if (currentBgmNodes.length > 30) {
            currentBgmNodes.splice(0, 10);
          }
        }
      }

      // Bass note (Deep warm triangle or pulse wave)
      const isBassStep = step % 4 === 0;
      if (isBassStep) {
        const bassArray = theme === 'boss' ? bossBass : exploreBass;
        const bassIdx = (step / 4) % bassArray.length;
        const bassFreq = bassArray[bassIdx];

        if (bassFreq) {
          const bassOsc = ctx.createOscillator();
          bassOsc.type = 'triangle';
          bassOsc.frequency.setValueAtTime(bassFreq, now);

          const bassGain = ctx.createGain();
          bassGain.gain.setValueAtTime(theme === 'boss' ? 0.18 : 0.22, now);
          bassGain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration * 3.5);

          // Bass lowpass filter
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(350, now);

          bassOsc.connect(filter);
          filter.connect(bassGain);
          bassGain.connect(bgmVolumeNode!);

          bassOsc.start(now);
          bassOsc.stop(now + stepDuration * 3.8);

          currentBgmNodes.push(bassOsc);
        }
      }

      // Boss encounter drum (procedural bass drum on step % 4 === 0, snare on step % 8 === 4)
      if (theme === 'boss') {
        if (step % 8 === 0 || step % 8 === 3 || step % 8 === 6) {
          // Retro synth kick
          const kick = ctx.createOscillator();
          kick.type = 'sine';
          kick.frequency.setValueAtTime(120, now);
          kick.frequency.exponentialRampToValueAtTime(0.01, now + 0.1);

          const kickGain = ctx.createGain();
          kickGain.gain.setValueAtTime(0.25, now);
          kickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

          kick.connect(kickGain);
          kickGain.connect(bgmVolumeNode!);
          kick.start(now);
          kick.stop(now + 0.1);
        }

        if (step % 8 === 4) {
          // Retro synth snare (noise burst)
          const bufferSize = ctx.sampleRate * 0.08;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
          }
          const noise = ctx.createBufferSource();
          noise.buffer = buffer;

          const filter = ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(1000, now);

          const snareGain = ctx.createGain();
          snareGain.gain.setValueAtTime(0.12, now);
          snareGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

          noise.connect(filter);
          filter.connect(snareGain);
          snareGain.connect(bgmVolumeNode!);

          noise.start(now);
        }
      }

      step++;
    };

    // Run scheduler every step duration
    bgmInterval = window.setInterval(scheduler, stepDuration * 1000);
    // Trigger first step instantly
    scheduler();
  } catch (err) {
    console.error('Failed to play procedural music:', err);
  }
}
