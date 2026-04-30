import { useState, useEffect, useRef, useCallback } from 'react';
import { playCorrectSound, playIncorrectSound } from '../utils/sounds';
import './GameArea.css';

const MAX_HEALTH = 100;
const BREACH_DAMAGE = 10;
const MISS_DAMAGE = 5;
const CATEGORIES = ['Network', 'Database', 'Software', 'Hardware'];
const KEYS = ['a', 's', 'd', 'f'];

const difficultyConfig = {
  easy: { travelTime: 3.0 },
  normal: { travelTime: 2.0 },
  hard: { travelTime: 1.2 }
};

export default function GameArea({ onGameOver, onScoreChange, difficulty = 'normal', song }) {
  const [health, setHealth] = useState(MAX_HEALTH);
  const [activeKeys, setActiveKeys] = useState({ 0: false, 1: false, 2: false, 3: false });
  const [feedback, setFeedback] = useState(null);
  const [audioLoaded, setAudioLoaded] = useState(false);
  
  const playAreaRef = useRef(null);
  const audioRef = useRef(null);
  const requestRef = useRef();
  
  // Store the actual un-hit notes here so we don't need to re-render the whole array constantly
  // We'll update the visual DOM elements directly for performance, or use React state carefully.
  // Using React state is fine for this scale (60-100 notes).
  const [notes, setNotes] = useState([]);
  const notesRef = useRef([]);

  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);

  // Initialize Game and Audio
  useEffect(() => {
    // Generate mock incident data for the beatmap
    const initialNotes = song.beatmap.map((note, index) => {
      const priorityLvl = Math.floor(Math.random() * 4) + 1;
      return {
        id: `INC${10000 + index}`,
        time: note.time,
        lane: note.lane,
        key: `note_${index}`,
        category: CATEGORIES[note.lane],
        priority: {
          level: priorityLvl,
          label: `P${priorityLvl}`,
          score: (5 - priorityLvl) * 50
        },
        short_description: `Rhythm anomaly detected in ${CATEGORIES[note.lane]}`,
        y: -1000 // Initial off-screen
      };
    });
    
    setNotes(initialNotes);

    const audio = new Audio(song.audioSrc);
    audioRef.current = audio;
    
    // Some browsers/formats don't reliably fire oncanplaythrough, use oncanplay
    audio.oncanplay = () => {
      setAudioLoaded(true);
      audio.play().catch(e => console.error("Audio play blocked", e));
    };

    audio.onerror = (e) => {
      console.error("Audio error: ", audio.error);
      // Fallback to allow game to start even if audio fails
      setAudioLoaded(true); 
    };

    audio.onended = () => {
      onGameOver(); // Win condition
    };

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [song, onGameOver]);

  // Main Game Loop
  const animate = () => {
    if (!audioRef.current || !audioLoaded) {
      requestRef.current = requestAnimationFrame(animate);
      return;
    }

    const currentTime = audioRef.current.currentTime;
    const travelTime = difficultyConfig[difficulty].travelTime;
    const areaHeight = playAreaRef.current?.clientHeight || 600;
    const hitZoneCenterY = areaHeight - 120; // 120px from bottom is center of receptor
    
    let healthLost = 0;
    
    const updatedNotes = notesRef.current.map(note => {
      const timeUntilHit = note.time - currentTime;
      
      // If note is far in the future, don't render it yet
      if (timeUntilHit > travelTime) {
        return { ...note, y: -1000 };
      }
      
      // Calculate Y position based on time. 
      // y = 0 when timeUntilHit == travelTime
      // y = hitZoneCenterY when timeUntilHit == 0
      const progress = 1 - (timeUntilHit / travelTime);
      const y = progress * hitZoneCenterY;

      return { ...note, y: y - 50 }; // -50 to center the 100px tall ticket on the line
    }).filter(note => {
      // Check for Miss (falling past bottom threshold)
      // If timeUntilHit is < -0.3 seconds, it's a guaranteed miss
      if ((note.time - currentTime) < -0.3) {
        healthLost += BREACH_DAMAGE;
        return false;
      }
      return true;
    });

    if (healthLost > 0) {
      setHealth(h => {
        const newHealth = h - healthLost;
        if (newHealth <= 0) {
          onGameOver();
          return 0;
        }
        return newHealth;
      });
    }

    setNotes(updatedNotes);
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [difficulty, audioLoaded]); 

  const showFeedback = (text, type) => {
    setFeedback({ text, type, id: Date.now() });
    setTimeout(() => setFeedback(null), 1000);
  };

  const handleKeyPress = useCallback((e) => {
    if (!audioRef.current || !audioLoaded) return;
    
    const key = e.key.toLowerCase();
    const laneIndex = KEYS.indexOf(key);
    
    if (laneIndex !== -1) {
      setActiveKeys(prev => ({ ...prev, [laneIndex]: true }));
      
      const currentTime = audioRef.current.currentTime;
      
      let hitNote = null;
      let minTimeDiff = Infinity;

      // Find closest note in time
      notesRef.current.forEach(note => {
        if (note.lane === laneIndex) {
           const timeDiff = Math.abs(note.time - currentTime);
           // Must be within 0.25s to even register
           if (timeDiff < 0.25 && timeDiff < minTimeDiff) {
              minTimeDiff = timeDiff;
              hitNote = note;
           }
        }
      });

      if (hitNote) {
        if (minTimeDiff < 0.08) { // 80ms window for Perfect
           if (!song.disableHitSounds) playCorrectSound(laneIndex);
           showFeedback('PERFECT!', 'perfect');
           onScoreChange(hitNote.priority.score * 2);
        } else if (minTimeDiff < 0.20) { // 200ms window for Good
           if (!song.disableHitSounds) playCorrectSound(laneIndex);
           showFeedback('GOOD', 'good');
           onScoreChange(hitNote.priority.score);
        } else {
           if (!song.disableHitSounds) playIncorrectSound();
           showFeedback('MISS', 'miss');
           setHealth(h => Math.max(0, h - MISS_DAMAGE));
        }
        setNotes(prev => prev.filter(n => n.id !== hitNote.id));
      } else {
        // Missed (pressed when no note is near)
        if (!song.disableHitSounds) playIncorrectSound();
        setHealth(h => Math.max(0, h - 2)); 
      }
    }
  }, [onScoreChange, audioLoaded]);

  const handleKeyUp = useCallback((e) => {
    const key = e.key.toLowerCase();
    const laneIndex = KEYS.indexOf(key);
    if (laneIndex !== -1) {
      setActiveKeys(prev => ({ ...prev, [laneIndex]: false }));
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyPress, handleKeyUp]);

  if (!audioLoaded) {
    return <div className="loading-screen" style={{color: 'var(--color-primary)', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', fontSize: '2rem'}}>LOADING TRACK...</div>;
  }

  return (
    <>
      <div className="hud top-hud glass-panel">
        <div className="hud-item">SLA HEALTH: 
          <div className="health-bar-container">
             <div className="health-bar" style={{ width: `${health}%`, backgroundColor: health > 30 ? 'var(--color-success)' : 'var(--color-danger)' }}></div>
          </div>
        </div>
      </div>
      
      <div className="play-area" ref={playAreaRef}>
        {feedback && (
          <div key={feedback.id} className={`hit-feedback feedback-${feedback.type}`}>
            {feedback.text}
          </div>
        )}
        <div className="lanes-container">
          {[0, 1, 2, 3].map(laneIndex => (
            <div key={laneIndex} className="lane">
               {notes.filter(n => n.lane === laneIndex && n.y > -200).map(note => (
                 <div 
                   key={note.key} 
                   className={`ticket-card p${note.priority.level}`}
                   style={{ transform: `translateY(${note.y}px)` }}
                 >
                   <div className="ticket-header">
                     <span className="ticket-id">{note.id}</span>
                     <span className="ticket-priority">{note.priority.label}</span>
                   </div>
                   <div className="ticket-body">
                     {note.short_description}
                   </div>
                   <div className="ticket-footer">
                     <span className="ticket-cat">{note.category}</span>
                   </div>
                 </div>
               ))}
            </div>
          ))}
          
          <div className="hit-zone">
            {CATEGORIES.map((cat, i) => (
              <div key={cat} className={`receptor lane-${i} ${activeKeys[i] ? 'active' : ''}`}>
                 <div className="receptor-inner">
                    {KEYS[i].toUpperCase()}
                 </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
