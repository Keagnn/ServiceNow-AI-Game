let audioCtx;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

export function playCorrectSound(laneIndex = 0) {
  try {
    initAudio();
    
    // Minor pentatonic scale frequencies starting at C4: C4, Eb4, F4, G4
    const baseFrequencies = [261.63, 311.13, 349.23, 392.00]; 
    const freq = baseFrequencies[laneIndex % 4];

    // Oscillator 1 (Main Note)
    const osc1 = audioCtx.createOscillator();
    const gainNode1 = audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, audioCtx.currentTime);
    
    gainNode1.gain.setValueAtTime(0.6, audioCtx.currentTime);
    gainNode1.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    
    osc1.connect(gainNode1);
    gainNode1.connect(audioCtx.destination);
    
    // Oscillator 2 (Harmonic / Bell tone)
    const osc2 = audioCtx.createOscillator();
    const gainNode2 = audioCtx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 1.5, audioCtx.currentTime); // Perfect fifth harmonic
    
    gainNode2.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
    
    osc2.connect(gainNode2);
    gainNode2.connect(audioCtx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(audioCtx.currentTime + 0.35);
    osc2.stop(audioCtx.currentTime + 0.25);
  } catch (e) {
    console.error("Audio playback failed", e);
  }
}

export function playIncorrectSound() {
  try {
    initAudio();
    
    // Dissonant minor second chord
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(110, audioCtx.currentTime); // A2
    osc1.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.2);

    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(116.54, audioCtx.currentTime); // Bb2 (dissonant)
    osc2.frequency.exponentialRampToValueAtTime(85, audioCtx.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.4, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
    
    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc1.start();
    osc2.start();
    osc1.stop(audioCtx.currentTime + 0.25);
    osc2.stop(audioCtx.currentTime + 0.25);
  } catch (e) {
    console.error("Audio playback failed", e);
  }
}

let bgmCtx;
let isPlayingBgm = false;
let bgmOscillators = [];

export function startBackgroundMusic() {
  if (isPlayingBgm) return;
  
  try {
    bgmCtx = new (window.AudioContext || window.webkitAudioContext)();
    isPlayingBgm = true;

    // 1. A deep, pulsing bass drone
    const bassOsc = bgmCtx.createOscillator();
    bassOsc.type = 'sawtooth';
    bassOsc.frequency.setValueAtTime(55, bgmCtx.currentTime); // Low A

    const bassFilter = bgmCtx.createBiquadFilter();
    bassFilter.type = 'lowpass';
    bassFilter.frequency.setValueAtTime(150, bgmCtx.currentTime);

    // LFO for the filter to give it a pulsing "wub" effect
    const lfo = bgmCtx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(2, bgmCtx.currentTime); // 2 pulses per second

    const lfoGain = bgmCtx.createGain();
    lfoGain.gain.setValueAtTime(100, bgmCtx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(bassFilter.frequency);

    const bassGain = bgmCtx.createGain();
    bassGain.gain.setValueAtTime(0.04, bgmCtx.currentTime); // Keep it very quiet and subtle

    bassOsc.connect(bassFilter);
    bassFilter.connect(bassGain);
    bassGain.connect(bgmCtx.destination);

    bassOsc.start();
    lfo.start();
    
    // 2. High ambient drone
    const padOsc = bgmCtx.createOscillator();
    padOsc.type = 'sine';
    padOsc.frequency.setValueAtTime(220, bgmCtx.currentTime); // A3
    
    const padGain = bgmCtx.createGain();
    padGain.gain.setValueAtTime(0.01, bgmCtx.currentTime); // Extremely quiet
    
    padOsc.connect(padGain);
    padGain.connect(bgmCtx.destination);
    
    padOsc.start();

    bgmOscillators = [bassOsc, lfo, padOsc];
  } catch (e) {
    console.error("BGM failed", e);
  }
}

export function stopBackgroundMusic() {
  if (!isPlayingBgm) return;
  isPlayingBgm = false;
  
  bgmOscillators.forEach(osc => {
    try {
      osc.stop();
      osc.disconnect();
    } catch(e) {}
  });
  bgmOscillators = [];
  
  if (bgmCtx) {
    bgmCtx.close();
    bgmCtx = null;
  }
}
