const generateBeatmap = (bpm, durationSec) => {
  const map = [];
  const beatDuration = 60.0 / bpm;
  const numBeats = Math.floor(durationSec / beatDuration);

  for (let i = 1; i <= numBeats; i++) {
    // Complex pattern based on beat number
    let lane;
    if (i % 8 === 0) lane = 3;
    else if (i % 4 === 0) lane = 2;
    else if (i % 2 === 0) lane = 1;
    else lane = 0;

    // Add some random variation
    if (i > 16 && Math.random() > 0.7) {
      lane = Math.floor(Math.random() * 4);
    }

    map.push({ time: i * beatDuration, lane: lane });
  }
  return map;
};

export const SONGS = [
  {
    id: 'yt_track',
    title: 'DOOM',
    audioSrc: '/songs/yt_song.mp4',
    bpm: 174,
    beatmap: generateBeatmap(174, 219), // 3m39s duration
    disableHitSounds: true
  },
  {
    id: 'track1',
    title: 'Cyber Pulse (120 BPM)',
    audioSrc: '/songs/track1.wav',
    bpm: 120,
    beatmap: generateBeatmap(120, 28) // 28s out of 30s so the song ends nicely
  },
  {
    id: 'track2',
    title: 'Techno Beat (150 BPM)',
    audioSrc: '/songs/track2.wav',
    bpm: 150,
    beatmap: generateBeatmap(150, 28)
  }
];
