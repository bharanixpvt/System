// ============================================================
// SYSTEM — Web Audio API Sound Engine
// ============================================================

let audioContext: AudioContext | null = null;
let masterGain: GainNode | null = null;
let enabled = true;
let volume = 0.15;

function getContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
    masterGain = audioContext.createGain();
    masterGain.gain.value = volume;
    masterGain.connect(audioContext.destination);
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
}

function getMasterGain(): GainNode {
  getContext();
  return masterGain!;
}

export function setAudioEnabled(val: boolean): void {
  enabled = val;
  if (!val && masterGain) {
    masterGain.gain.setValueAtTime(0, getContext().currentTime);
  } else if (val && masterGain) {
    masterGain.gain.setValueAtTime(volume, getContext().currentTime);
  }
}

export function setVolume(val: number): void {
  volume = Math.max(0, Math.min(1, val));
  if (masterGain && enabled) {
    masterGain.gain.setValueAtTime(volume, getContext().currentTime);
  }
}

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', when?: number): void {
  if (!enabled) return;
  const ctx = getContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);
  gain.gain.setValueAtTime(volume * 0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  
  osc.connect(gain);
  gain.connect(getMasterGain());
  
  const startTime = when ?? ctx.currentTime;
  osc.start(startTime);
  osc.stop(startTime + duration);
}

export function playQuestAccepted(): void {
  playTone(523.25, 0.3, 'sine');
}

export function playQuestCompleted(): void {
  playTone(659.25, 0.25, 'sine');
  setTimeout(() => playTone(783.99, 0.35, 'sine'), 120);
}

export function playLevelUp(): void {
  const now = getContext().currentTime;
  playTone(261.63, 0.35, 'triangle', now);
  playTone(329.63, 0.35, 'triangle', now + 0.15);
  playTone(392.00, 0.4, 'triangle', now + 0.3);
  playTone(523.25, 0.6, 'triangle', now + 0.45);
}

export function playAchievement(): void {
  const notes = [1046.50, 1318.51, 1567.98, 2093.00];
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.15, 'sine'), i * 80);
  });
}

export function playNotification(): void {
  playTone(440, 0.2, 'sine');
}

export function playRankUp(): void {
  const now = getContext().currentTime;
  playTone(130.81, 0.6, 'sine', now);
  playTone(196.00, 0.6, 'sine', now + 0.2);
  playTone(261.63, 0.8, 'sine', now + 0.4);
}

export function playPenalty(): void {
  playTone(98.00, 0.5, 'sawtooth');
}

export function playButtonPress(): void {
  playTone(880, 0.05, 'sine');
}

export function playBossAlert(): void {
  if (!enabled) return;
  const ctx = getContext();
  const osc = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(80, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.8);
  
  osc2.type = 'sawtooth';
  osc2.frequency.setValueAtTime(120, ctx.currentTime);
  osc2.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.8);

  gain.gain.setValueAtTime(volume * 0.4, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
  
  osc.connect(gain);
  osc2.connect(gain);
  gain.connect(getMasterGain());
  
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 1.2);
  osc2.start(ctx.currentTime);
  osc2.stop(ctx.currentTime + 1.2);
}

