// Static/Particle overlay for futuristic effect
function StaticOverlay() {
  return <div className="static-overlay" aria-hidden="true" />;
}
// GameCanvas.jsx
// Main game canvas and loop
import React, { useState, useEffect, useRef } from 'react';
import { generateMaze, renderMaze, CELL_TYPES } from './game/MazeGrid';
import { toggleGlitchWalls, detectPlayerWallOverlap } from './game/GlitchEngine';
import { movePlayer, checkWinCondition } from './game/PlayerController';
import { updateStability, isGameOver } from './game/TimelineSystem';


// Difficulty settings
const DIFFICULTY = {
  easy:    { rows: 12, cols: 12, glitchRatio: 0.12, glitchInterval: 900, penalty: -12, drop: -2 },
  medium:  { rows: 16, cols: 16, glitchRatio: 0.18, glitchInterval: 700, penalty: -18, drop: -3 },
  hard:    { rows: 20, cols: 20, glitchRatio: 0.28, glitchInterval: 400, penalty: -32, drop: -5 },
  hardplus: { rows: 24, cols: 24, glitchRatio: 0.45, glitchInterval: 140, penalty: -60, drop: -12, shrink: true },
};

export default function GameCanvas() {
  const [difficulty, setDifficulty] = React.useState('hard');
  const [penaltyFlash, setPenaltyFlash] = useState(false);
  const settings = DIFFICULTY[difficulty];

  // Maze and state
  const [maze, setMaze] = useState(() => generateMaze(settings.rows, settings.cols, settings.glitchRatio));
  const [glitchStates, setGlitchStates] = useState({});
  const [playerPos, setPlayerPos] = useState([1, 1]);
  const [stability, setStability] = useState(100);
  const [timer, setTimer] = useState(0);
  const [gameState, setGameState] = useState('playing'); // 'playing', 'won', 'lost'

  // Difficulty change resets game
  useEffect(() => {
    setMaze(generateMaze(settings.rows, settings.cols, settings.glitchRatio));
    setPlayerPos([1, 1]);
    setStability(100);
    setTimer(0);
    setGameState('playing');
  }, [difficulty]);

  // Shrink maze over time in hard+ mode
  useEffect(() => {
    if (difficulty !== 'hardplus' || gameState !== 'playing') return;
    let shrinkTimer = setInterval(() => {
      setMaze(prevMaze => {
        if (prevMaze.length > 10 && prevMaze[0].length > 10) {
          // Remove outermost row/col
          return prevMaze.slice(1, -1).map(row => row.slice(1, -1));
        }
        return prevMaze;
      });
    }, 3500);
    return () => clearInterval(shrinkTimer);
  }, [difficulty, gameState]);

// (removed duplicate export default and state logic)

  // Initialize glitch states
  useEffect(() => {
    const initial = {};
    for (let r = 0; r < maze.length; r++) {
      for (let c = 0; c < maze[0].length; c++) {
        if (maze[r][c] === CELL_TYPES.GLITCH) {
          initial[`${r},${c}`] = Math.random() < 0.5;
        }
      }
    }
    setGlitchStates(initial);
  }, [maze]);

  // Glitch wall toggling and timeline drop
  useEffect(() => {
    if (gameState !== 'playing') return;
    const glitchInterval = setInterval(() => {
      toggleGlitchWalls(maze, glitchStates, setGlitchStates);
      // Check if player is inside a wall after glitch
      if (detectPlayerWallOverlap(maze, glitchStates, playerPos)) {
        updateStability(stability, settings.penalty, setStability);
        setPenaltyFlash(true);
        setTimeout(() => setPenaltyFlash(false), 180);
      }
    }, settings.glitchInterval);
    return () => clearInterval(glitchInterval);
  }, [maze, glitchStates, playerPos, stability, gameState, settings]);

  // Timeline stability drop and timer
  useEffect(() => {
    if (gameState !== 'playing') return;
    const timerInterval = setInterval(() => {
      setTimer(t => t + 1);
      updateStability(stability, settings.drop, setStability);
    }, 1000);
    return () => clearInterval(timerInterval);
  }, [stability, gameState, settings]);

  // Win/lose check
  useEffect(() => {
    if (isGameOver(stability)) setGameState('lost');
    if (checkWinCondition(maze, playerPos)) setGameState('won');
  }, [stability, playerPos, maze]);

  // Player movement
  useEffect(() => {
    if (gameState !== 'playing') return;
    const handleKey = e => {
      let dir = null;
      if (e.key === 'ArrowUp' || e.key === 'w') dir = 'up';
      if (e.key === 'ArrowDown' || e.key === 's') dir = 'down';
      if (e.key === 'ArrowLeft' || e.key === 'a') dir = 'left';
      if (e.key === 'ArrowRight' || e.key === 'd') dir = 'right';
      if (dir) {
        setPlayerPos(pos => movePlayer(maze, glitchStates, pos, dir));
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [maze, glitchStates, gameState]);

  // Restart
  function restart() {
    setMaze(generateMaze(settings.rows, settings.cols, settings.glitchRatio));
    setPlayerPos([1, 1]);
    setStability(100);
    setTimer(0);
    setGameState('playing');
  }

  // 3D Timeline Meter
  function Timeline3DMeter({ stability }) {
    // stability: 0-100
    const angle = (stability / 100) * 360;
    return (
      <span className="timeline-3d-meter">
        <span className="circle">
          <span
            className="fill"
            style={{
              background: `conic-gradient(#0ff 0deg, #0ff ${angle}deg, #222 ${angle}deg 360deg)`,
              filter: `blur(0.5px) brightness(1.2)`
            }}
          />
          <span
            className="needle"
            style={{
              transform: `translate(-50%, -100%) rotate(${angle}deg)`,
              background: 'linear-gradient(#fff, #0ff 60%, #ff0 100%)',
              height: '22px',
              width: '3px',
              boxShadow: '0 0 6px #ff08, 0 0 2px #0ff8'
            }}
          />
        </span>
      </span>
    );
  }

  // UI
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
      <StaticOverlay />
      <div className={`game-canvas${penaltyFlash ? ' penalty-flash' : ''}`}>
        <h2 className="main-title">🟢 Anti-Paradox Maze: Reality Glitch Escape</h2>
        <div className="ui-bar">
          <Timeline3DMeter stability={stability} />
          <span className="ui-stability">Stability: <b style={{color: stability < 20 ? 'red' : 'lime'}}>{stability}%</b></span>
          <span className="ui-timer">⏱ {timer}s</span>
          <span className="ui-difficulty">
            Difficulty:
            <select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="hardplus">Hard+</option>
            </select>
          </span>
          <button className="ui-restart" onClick={restart}>Restart</button>
          <button
            className="ui-help"
            onClick={() => setShowHelp(true)}
            title="Show help/info"
            aria-label="Show help/info"
            aria-haspopup="dialog"
            aria-expanded={showHelp}
            tabIndex={0}
            onKeyDown={e => {
              if ((e.key === 'Enter' || e.key === ' ') && !showHelp) {
                setShowHelp(true);
              }
            }}
          >
            ?
          </button>
        </div>
        {showHelp && (
          <div
            className="help-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Game Help / Info"
            tabIndex={-1}
            onKeyDown={e => {
              if (e.key === 'Escape') setShowHelp(false);
            }}
          >
            <h2 style={{marginTop:0, color:'#0ff'}}>How to Play</h2>
            <ul>
              <li><b>Move</b>: Arrow keys or WASD</li>
              <li><b>Goal</b>: Reach the glowing exit before the timeline runs out</li>
              <li><b>Glitch Walls</b>: Flicker in/out, touching them resets your timeline</li>
              <li><b>Penalty</b>: Hitting a glitch wall or running out of time resets you</li>
              <li><b>Difficulty</b>: Select at top, harder = more glitches</li>
            </ul>
            <button
              className="ui-restart"
              onClick={() => setShowHelp(false)}
              autoFocus
              aria-label="Close help/info"
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Escape') setShowHelp(false);
              }}
            >
              Close
            </button>
          </div>
        )}
        {gameState === 'won' && (
          <div className="win-screen">
            <span style={{display:'block',marginBottom:12}}>
              <svg width="60" height="60" viewBox="0 0 60 60">
                <circle cx="30" cy="30" r="24" fill="#0ff" opacity="0.18">
                  <animate attributeName="r" values="24;28;24" dur="1.2s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="0.18;0.32;0.18" dur="1.2s" repeatCount="indefinite"/>
                </circle>
                <circle cx="30" cy="30" r="16" fill="#fff" opacity="0.7">
                  <animate attributeName="r" values="16;19;16" dur="1.2s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="0.7;1;0.7" dur="1.2s" repeatCount="indefinite"/>
                </circle>
                <text x="30" y="36" textAnchor="middle" fontSize="2.2em" fill="#0ff" fontWeight="bold" style={{filter:'drop-shadow(0 0 8px #0ff)'}}>✔</text>
              </svg>
            </span>
            <div style={{fontWeight:'bold',fontSize:'1.2em',color:'#0ff',textShadow:'0 0 8px #0ff'}}>You escaped the paradox!</div>
            <button onClick={restart}>Play Again</button>
          </div>
        )}
        {gameState === 'lost' && (
          <div className="lose-screen">
            <span style={{display:'block',marginBottom:12}}>
              <svg width="60" height="60" viewBox="0 0 60 60">
                <circle cx="30" cy="30" r="24" fill="#0ff" opacity="0.18">
                  <animate attributeName="r" values="24;28;24" dur="1.2s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="0.18;0.32;0.18" dur="1.2s" repeatCount="indefinite"/>
                </circle>
                <circle cx="30" cy="30" r="16" fill="#fff" opacity="0.7">
                  <animate attributeName="r" values="16;19;16" dur="1.2s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="0.7;1;0.7" dur="1.2s" repeatCount="indefinite"/>
                </circle>
                <text x="30" y="36" textAnchor="middle" fontSize="2.2em" fill="#0ff" fontWeight="bold" style={{filter:'drop-shadow(0 0 8px #0ff)'}}>✖</text>
              </svg>
            </span>
            <div style={{fontWeight:'bold',fontSize:'1.2em',color:'#0ff',textShadow:'0 0 8px #0ff'}}>Timeline collapsed!</div>
            <button onClick={restart}>Retry</button>
          </div>
        )}
        {renderMaze(maze, glitchStates, playerPos)}
        <div className="legend">
          <span><span className="maze-cell player"></span> Player</span>
          <span><span className="maze-cell wall"></span> Wall</span>
          <span><span className="maze-cell glitch"></span> Glitch Wall</span>
          <span><span className="maze-cell exit"></span> Exit</span>
        </div>
      </div>
    </>
  );
}
