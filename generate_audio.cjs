const fs = require('fs');
const path = require('path');

function writeWave(filename, bpm, durationSec, baseFreq) {
    const sampleRate = 44100;
    const numChannels = 1;
    const bitsPerSample = 16;
    
    const numSamples = sampleRate * durationSec;
    const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
    const blockAlign = numChannels * (bitsPerSample / 8);
    const dataSize = numSamples * blockAlign;
    const chunkSize = 36 + dataSize;
    
    const buffer = Buffer.alloc(44 + dataSize);
    
    // RIFF header
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(chunkSize, 4);
    buffer.write('WAVE', 8);
    
    // fmt subchunk
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16); // Subchunk1Size
    buffer.writeUInt16LE(1, 20); // AudioFormat (PCM)
    buffer.writeUInt16LE(numChannels, 22);
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(byteRate, 28);
    buffer.writeUInt16LE(blockAlign, 32);
    buffer.writeUInt16LE(bitsPerSample, 34);
    
    // data subchunk
    buffer.write('data', 36);
    buffer.writeUInt32LE(dataSize, 40);
    
    const beatDuration = 60.0 / bpm;
    
    let offset = 44;
    for (let i = 0; i < numSamples; i++) {
        const timeSec = i / sampleRate;
        const beatPos = (timeSec % beatDuration) / beatDuration;
        const envelope = Math.max(0, 1.0 - (beatPos * 4.0));
        
        const sampleVal = Math.sin(2.0 * Math.PI * baseFreq * timeSec);
        const audioVal = sampleVal * envelope * 0.5;
        const intVal = Math.max(-32768, Math.min(32767, Math.floor(audioVal * 32767)));
        
        buffer.writeInt16LE(intVal, offset);
        offset += 2;
    }
    
    fs.mkdirSync(path.dirname(filename), { recursive: true });
    fs.writeFileSync(filename, buffer);
    console.log('Created ' + filename);
}

writeWave('public/songs/track1.wav', 120, 30, 110.0);
writeWave('public/songs/track2.wav', 150, 30, 146.83);
