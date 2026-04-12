// Web Audio API sound effects
const audioCtx = typeof window !== "undefined" ? new (window.AudioContext || (window as any).webkitAudioContext)() : null;

function ensureCtx() {
  if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
}

function playTone(freq: number, duration: number, type: OscillatorType = "sine", vol = 0.15) {
  if (!audioCtx) return;
  ensureCtx();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  gain.gain.setValueAtTime(vol, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

export function playHeartSound() {
  playTone(880, 0.15, "sine", 0.12);
  setTimeout(() => playTone(1100, 0.2, "sine", 0.1), 80);
}

export function playReactionSound() {
  playTone(600, 0.1, "triangle", 0.1);
  setTimeout(() => playTone(800, 0.12, "triangle", 0.08), 60);
}

export function playSwipeSound() {
  if (!audioCtx) return;
  ensureCtx();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(300, audioCtx.currentTime);
  osc.frequency.linearRampToValueAtTime(150, audioCtx.currentTime + 0.12);
  gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.15);
}

export function playComposeSound() {
  playTone(523, 0.08, "sine", 0.08);
  setTimeout(() => playTone(659, 0.08, "sine", 0.06), 60);
  setTimeout(() => playTone(784, 0.12, "sine", 0.05), 120);
}

export function playSubmitSound() {
  playTone(440, 0.1, "sine", 0.1);
  setTimeout(() => playTone(660, 0.1, "sine", 0.08), 80);
  setTimeout(() => playTone(880, 0.15, "sine", 0.06), 160);
}
