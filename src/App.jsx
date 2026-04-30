import { useState } from 'react';
import './App.css';
import { GAME_STATES } from './api/servicenow';
import GameArea from './components/GameArea';
import { startBackgroundMusic, stopBackgroundMusic } from './utils/sounds';

function App() {
  const [gameState, setGameState] = useState(GAME_STATES.MENU);
  const [score, setScore] = useState(0);

  const startGame = () => {
    setScore(0);
    setGameState(GAME_STATES.PLAYING);
    startBackgroundMusic();
  };

  const handleGameOver = () => {
    setGameState(GAME_STATES.GAME_OVER);
    stopBackgroundMusic();
  };

  const handleScoreChange = (points) => {
    setScore(prev => prev + points);
  };

  const renderMenu = () => (
    <div className="menu-container glass-panel">
      <h1 className="game-title">SLA<br/>DEFENDER</h1>
      <p className="game-subtitle">ServiceNow Incident Triage</p>
      
      <div className="controls-info" style={{marginBottom: '20px', textAlign: 'center', color: 'var(--color-text-muted)'}}>
        <p>Controls:</p>
        <div style={{display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '10px'}}>
          <span><strong style={{color: 'var(--color-danger)'}}>A</strong>: Network</span>
          <span><strong style={{color: 'var(--color-success)'}}>S</strong>: Database</span>
          <span><strong style={{color: 'var(--color-primary)'}}>D</strong>: Software</span>
          <span><strong style={{color: 'var(--color-accent)'}}>F</strong>: Hardware</span>
        </div>
      </div>

      <div className="menu-actions">
        <button className="cyber-btn" onClick={startGame}>Initialize Triage</button>
        <button className="cyber-btn danger" onClick={() => alert('Settings not implemented yet!')}>Settings</button>
      </div>
      
      <div className="sys-status">
        <span>System Status: <span style={{color: 'var(--color-success)'}}>ONLINE</span></span>
        <span>Mock Mode: <span style={{color: 'var(--color-accent)'}}>ACTIVE</span></span>
      </div>
    </div>
  );

  const renderGameOver = () => (
    <div className="menu-container glass-panel">
      <h1 className="game-title" style={{color: 'var(--color-danger)'}}>SLA BREACHED</h1>
      <p className="game-subtitle">Critical Failure</p>
      <p style={{fontSize: '1.5rem', marginBottom: '20px', fontFamily: 'var(--font-display)'}}>FINAL SCORE: {score}</p>
      
      <div className="menu-actions">
        <button className="cyber-btn" onClick={startGame}>Retry</button>
        <button className="cyber-btn danger" onClick={() => { setGameState(GAME_STATES.MENU); stopBackgroundMusic(); }}>Main Menu</button>
      </div>
    </div>
  );

  return (
    <div className="app">
      {gameState === GAME_STATES.MENU && renderMenu()}
      {gameState === GAME_STATES.PLAYING && (
        <div className="game-container">
          <div className="hud top-hud glass-panel" style={{zIndex: 50}}>
            <div className="hud-item">SCORE: {score}</div>
          </div>
          <GameArea onGameOver={handleGameOver} onScoreChange={handleScoreChange} />
        </div>
      )}
      {gameState === GAME_STATES.GAME_OVER && renderGameOver()}
    </div>
  );
}

export default App;
