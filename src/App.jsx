import { useState, useCallback } from 'react';
import './App.css';
import { GAME_STATES } from './api/servicenow';
import GameArea from './components/GameArea';
import { SONGS } from './utils/songs';

function App() {
  const [gameState, setGameState] = useState(GAME_STATES.MENU);
  const [score, setScore] = useState(0);
  const [difficulty, setDifficulty] = useState('normal');
  const [selectedSongId, setSelectedSongId] = useState(SONGS[0].id);

  const startGame = () => {
    setScore(0);
    setGameState(GAME_STATES.PLAYING);
  };

  const handleGameOver = useCallback(() => {
    setGameState(GAME_STATES.GAME_OVER);
  }, []);

  const handleBackToMenu = () => {
    setGameState(GAME_STATES.MENU);
  };

  const handleScoreChange = useCallback((points) => {
    setScore(prev => prev + points);
  }, []);

  const selectedSong = SONGS.find(s => s.id === selectedSongId) || SONGS[0];

  const renderMenu = () => (
    <div className="menu-container glass-panel">
      <h1 className="game-title">SLA<br/>DEFENDER</h1>
      <p className="game-subtitle">ServiceNow Rhythm Triage</p>
      
      <div className="controls-info" style={{marginBottom: '20px', textAlign: 'center', color: 'var(--color-text-muted)'}}>
        <p>Controls:</p>
        <div style={{display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '10px'}}>
          <span><strong style={{color: 'var(--color-danger)'}}>A</strong>: Network</span>
          <span><strong style={{color: 'var(--color-success)'}}>S</strong>: Database</span>
          <span><strong style={{color: 'var(--color-primary)'}}>D</strong>: Software</span>
          <span><strong style={{color: 'var(--color-accent)'}}>F</strong>: Hardware</span>
        </div>
      </div>

      <div style={{marginBottom: '15px', textAlign: 'center'}}>
        <p style={{color: 'var(--color-text-muted)', marginBottom: '5px'}}>Select Track:</p>
        <select 
          className="cyber-input" 
          style={{padding: '8px', background: 'rgba(0,0,0,0.5)', color: 'var(--color-primary)', border: '1px solid var(--color-primary)', borderRadius: '4px', outline: 'none', fontFamily: 'var(--font-body)', fontSize: '1.1rem'}}
          value={selectedSongId} 
          onChange={(e) => setSelectedSongId(e.target.value)}
        >
          {SONGS.map(song => (
            <option key={song.id} value={song.id}>{song.title}</option>
          ))}
        </select>
      </div>

      <div style={{marginBottom: '20px', textAlign: 'center'}}>
        <p style={{color: 'var(--color-text-muted)', marginBottom: '10px'}}>Note Speed:</p>
        <div style={{display: 'flex', justifyContent: 'center', gap: '10px'}}>
          <button 
            className={`cyber-btn ${difficulty === 'easy' ? '' : 'danger'}`} 
            style={{padding: '5px 15px', fontSize: '1rem', borderColor: difficulty === 'easy' ? 'var(--color-success)' : 'rgba(255,255,255,0.2)', color: difficulty === 'easy' ? 'var(--color-success)' : '#666'}}
            onClick={() => setDifficulty('easy')}
          >EASY</button>
          <button 
            className={`cyber-btn ${difficulty === 'normal' ? '' : 'danger'}`} 
            style={{padding: '5px 15px', fontSize: '1rem', borderColor: difficulty === 'normal' ? 'var(--color-primary)' : 'rgba(255,255,255,0.2)', color: difficulty === 'normal' ? 'var(--color-primary)' : '#666'}}
            onClick={() => setDifficulty('normal')}
          >NORMAL</button>
          <button 
            className={`cyber-btn ${difficulty === 'hard' ? '' : 'danger'}`} 
            style={{padding: '5px 15px', fontSize: '1rem', borderColor: difficulty === 'hard' ? 'var(--color-danger)' : 'rgba(255,255,255,0.2)', color: difficulty === 'hard' ? 'var(--color-danger)' : '#666'}}
            onClick={() => setDifficulty('hard')}
          >HARD</button>
        </div>
      </div>

      <div className="menu-actions">
        <button className="cyber-btn" onClick={startGame}>Initialize Triage</button>
      </div>
      
      <div className="sys-status">
        <span>System Status: <span style={{color: 'var(--color-success)'}}>ONLINE</span></span>
      </div>
    </div>
  );

  const renderGameOver = () => (
    <div className="menu-container glass-panel">
      <h1 className="game-title" style={{color: 'var(--color-danger)'}}>TRIAGE COMPLETE</h1>
      <p className="game-subtitle">Track Finished</p>
      <p style={{fontSize: '1.5rem', marginBottom: '20px', fontFamily: 'var(--font-display)'}}>FINAL SCORE: {score}</p>
      
      <div className="menu-actions">
        <button className="cyber-btn" onClick={startGame}>Retry</button>
        <button className="cyber-btn danger" onClick={handleBackToMenu}>Main Menu</button>
      </div>
    </div>
  );

  return (
    <div className="app">
      {gameState === GAME_STATES.MENU && renderMenu()}
      {gameState === GAME_STATES.PLAYING && (
        <div className="game-container">
          <div className="hud top-hud glass-panel" style={{zIndex: 50, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div className="hud-item">SCORE: {score}</div>
            <button 
              className="cyber-btn danger" 
              style={{padding: '5px 10px', fontSize: '0.8rem', border: '1px solid var(--color-danger)'}}
              onClick={handleBackToMenu}
            >
              Abort Triage
            </button>
          </div>
          <GameArea onGameOver={handleGameOver} onScoreChange={handleScoreChange} difficulty={difficulty} song={selectedSong} />
        </div>
      )}
      {gameState === GAME_STATES.GAME_OVER && renderGameOver()}
    </div>
  );
}

export default App;
