let audioCtx;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

export function playCorrectSound() {
  try {
    initAudio();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1000, audioCtx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.15);
  } catch (e) {
    console.error("Audio playback failed", e);
  }
}

export function playIncorrectSound() {
  try {
    initAudio();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.25);
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
