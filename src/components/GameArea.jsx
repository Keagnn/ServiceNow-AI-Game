import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchIncidents } from '../api/servicenow';
import { playCorrectSound, playIncorrectSound } from '../utils/sounds';
import './GameArea.css';

const MAX_HEALTH = 100;
const BREACH_DAMAGE = 10;
const MISS_DAMAGE = 5;
const SPAWN_RATE = 2000; // ms
const CATEGORIES = ['Network', 'Database', 'Software', 'Hardware'];
const KEYS = ['a', 's', 'd', 'f'];

export default function GameArea({ onGameOver, onScoreChange }) {
  const [health, setHealth] = useState(MAX_HEALTH);
  const [tickets, setTickets] = useState([]);
  const [activeKeys, setActiveKeys] = useState({ 0: false, 1: false, 2: false, 3: false });
  const [feedback, setFeedback] = useState(null);
  
  const playAreaRef = useRef(null);
  const ticketsRef = useRef([]);
  const requestRef = useRef();
  const lastTimeRef = useRef();
  const spawnTimerRef = useRef();

  useEffect(() => {
    ticketsRef.current = tickets;
  }, [tickets]);

  // Main Game Loop
  const animate = (time) => {
    if (lastTimeRef.current != undefined) {
      const deltaTime = time - lastTimeRef.current;
      let healthLost = 0;
      
      const updatedTickets = ticketsRef.current.map(ticket => {
        const dropSpeed = ticket.priority.speed * 40; 
        const yChange = (dropSpeed * deltaTime) / 1000;
        return { ...ticket, y: ticket.y + yChange };
      }).filter(ticket => {
        const areaHeight = playAreaRef.current?.clientHeight || 600;
        // Hit zone is bottom 80px to bottom 160px. Ticket falls off at areaHeight.
        if (ticket.y > areaHeight) {
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

      setTickets(updatedTickets);
    }
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  // Spawning logic
  useEffect(() => {
    const spawnTicket = async () => {
      const newIncident = await fetchIncidents(1);
      const inc = newIncident[0];
      
      // Assign lane based on category index
      const laneIndex = CATEGORIES.indexOf(inc.category) !== -1 ? CATEGORIES.indexOf(inc.category) : 0;

      const newTicket = {
        ...inc,
        lane: laneIndex,
        y: -150, 
        key: inc.id + Date.now()
      };
      
      setTickets(prev => [...prev, newTicket]);
    };

    spawnTimerRef.current = setInterval(spawnTicket, SPAWN_RATE);
    spawnTicket();

    return () => clearInterval(spawnTimerRef.current);
  }, []);

  const showFeedback = (text, type) => {
    setFeedback({ text, type, id: Date.now() });
    setTimeout(() => setFeedback(null), 1000);
  };

  const handleKeyPress = useCallback((e) => {
    const key = e.key.toLowerCase();
    const laneIndex = KEYS.indexOf(key);
    
    if (laneIndex !== -1) {
      setActiveKeys(prev => ({ ...prev, [laneIndex]: true }));
      
      // Check for hit
      const areaHeight = playAreaRef.current?.clientHeight || 600;
      const hitZoneTop = areaHeight - 160;
      const hitZoneBottom = areaHeight - 80;
      const hitZoneCenter = areaHeight - 120;
      
      let hitTicket = null;
      let minDistance = Infinity;

      ticketsRef.current.forEach(ticket => {
        if (ticket.lane === laneIndex) {
           const ticketCenter = ticket.y + 50; // Approx middle of the ticket
           if (ticketCenter > hitZoneTop - 50 && ticketCenter < hitZoneBottom + 50) {
              const distance = Math.abs(ticketCenter - hitZoneCenter);
              if (distance < minDistance) {
                 minDistance = distance;
                 hitTicket = ticket;
              }
           }
        }
      });

      if (hitTicket) {
        if (minDistance < 30) {
           playCorrectSound();
           showFeedback('PERFECT!', 'perfect');
           onScoreChange(hitTicket.priority.score * 2);
        } else if (minDistance < 80) {
           playCorrectSound();
           showFeedback('GOOD', 'good');
           onScoreChange(hitTicket.priority.score);
        } else {
           playIncorrectSound();
           showFeedback('MISS', 'miss');
           setHealth(h => Math.max(0, h - MISS_DAMAGE));
        }
        setTickets(prev => prev.filter(t => t.id !== hitTicket.id));
      } else {
        // Missed (pressed when no ticket is in zone)
        playIncorrectSound();
        setHealth(h => Math.max(0, h - 2)); 
      }
    }
  }, [onScoreChange]);

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
               {tickets.filter(t => t.lane === laneIndex).map(ticket => (
                 <div 
                   key={ticket.key} 
                   className={`ticket-card p${ticket.priority.level}`}
                   style={{ transform: `translateY(${ticket.y}px)` }}
                 >
                   <div className="ticket-header">
                     <span className="ticket-id">{ticket.id}</span>
                     <span className="ticket-priority">{ticket.priority.label}</span>
                   </div>
                   <div className="ticket-body">
                     {ticket.short_description}
                   </div>
                   <div className="ticket-footer">
                     <span className="ticket-cat">{ticket.category}</span>
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
