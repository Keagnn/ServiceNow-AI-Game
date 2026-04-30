import wave
import struct
import math
import os

def generate_tone(file_path, bpm, duration_seconds, base_freq):
    # Audio settings
    sample_rate = 44100
    num_channels = 1
    sample_width = 2
    
    # Timing
    beat_duration = 60.0 / bpm
    total_samples = int(sample_rate * duration_seconds)
    
    # Create the wave file
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    with wave.open(file_path, 'w') as wav_file:
        wav_file.setnchannels(num_channels)
        wav_file.setsampwidth(sample_width)
        wav_file.setframerate(sample_rate)
        
        for i in range(total_samples):
            time_sec = float(i) / sample_rate
            
            # Create a rhythmic pulse based on BPM
            # Modulo arithmetic gives us the position within the current beat
            beat_pos = (time_sec % beat_duration) / beat_duration
            
            # Envelope: sharp decay for a "pluck" or "kick" sound
            envelope = max(0, 1.0 - (beat_pos * 4.0)) 
            
            # Base frequency wave (Sine)
            sample_val = math.sin(2.0 * math.pi * base_freq * time_sec)
            
            # Combine and convert to 16-bit integer
            # Reduce volume slightly to avoid clipping
            audio_val = sample_val * envelope * 0.5 
            int_val = int(audio_val * 32767.0)
            
            # Pack as short integer
            data = struct.pack('<h', int_val)
            wav_file.writeframesraw(data)

# Track 1: 120 BPM, Base frequency 110Hz (A2)
generate_tone('public/songs/track1.wav', 120, 30, 110.0)

# Track 2: 150 BPM, Base frequency 146.83Hz (D3)
generate_tone('public/songs/track2.wav', 150, 30, 146.83)

print("Generated track1.wav and track2.wav successfully.")
