let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = "sine",
  volume: number = 0.15,
  detune: number = 0
) {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    oscillator.detune.setValueAtTime(detune, ctx.currentTime);

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch {
    // Audio not available
  }
}

export function playClick() {
  playTone(800, 0.08, "sine", 0.12);
  setTimeout(() => playTone(1200, 0.05, "sine", 0.08), 30);
}

export function playHover() {
  playTone(600, 0.06, "sine", 0.06);
}

export function playOpen() {
  playTone(400, 0.1, "sine", 0.1);
  setTimeout(() => playTone(600, 0.1, "sine", 0.1), 60);
  setTimeout(() => playTone(800, 0.12, "sine", 0.08), 120);
}

export function playClose() {
  playTone(800, 0.1, "sine", 0.1);
  setTimeout(() => playTone(500, 0.12, "sine", 0.08), 60);
}

export function playSuccess() {
  playTone(523, 0.12, "sine", 0.12);
  setTimeout(() => playTone(659, 0.12, "sine", 0.12), 100);
  setTimeout(() => playTone(784, 0.15, "sine", 0.1), 200);
}

export function playError() {
  playTone(300, 0.15, "square", 0.08);
  setTimeout(() => playTone(250, 0.2, "square", 0.06), 100);
}

export function playStart() {
  const notes = [523, 659, 784, 1047];
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.12, "sine", 0.1), i * 80);
  });
}

export function playStop() {
  const notes = [784, 659, 523, 392];
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.1, "sine", 0.08), i * 60);
  });
}

export function playNavigate() {
  playTone(700, 0.06, "sine", 0.08);
}

export function playToggle() {
  playTone(500, 0.05, "sine", 0.1);
  setTimeout(() => playTone(700, 0.07, "sine", 0.1), 40);
}
