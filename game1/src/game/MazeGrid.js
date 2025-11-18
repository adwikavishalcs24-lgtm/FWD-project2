
// MazeGrid.js
// Handles maze generation, marking glitch walls, and rendering
import React from 'react';

/**
 * Cell types:
 * 'empty' - walkable path
 * 'wall' - solid wall
 * 'glitch' - unstable wall
 * 'start' - player start
 * 'exit' - exit door
 */

export const CELL_TYPES = {
  EMPTY: 'empty',
  WALL: 'wall',
  GLITCH: 'glitch',
  START: 'start',
  EXIT: 'exit',
};

// Generate a 2D maze array with glitch walls
export function generateMaze(rows = 10, cols = 10, glitchRatio = 0.1) {
  // Simple maze: outer walls, random inner walls, random glitch walls
  const maze = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      if (r === 0 || c === 0 || r === rows - 1 || c === cols - 1) {
        row.push(CELL_TYPES.WALL);
      } else {
        row.push(Math.random() < 0.2 ? CELL_TYPES.WALL : CELL_TYPES.EMPTY);
      }
    }
    maze.push(row);
  }
  // Place start and exit
  maze[1][1] = CELL_TYPES.START;
  maze[rows - 2][cols - 2] = CELL_TYPES.EXIT;
  // Mark many walls as glitch walls (increase ratio for more chaos)
  for (let r = 1; r < rows - 1; r++) {
    for (let c = 1; c < cols - 1; c++) {
      if (maze[r][c] === CELL_TYPES.WALL && Math.random() < glitchRatio * 1.7) {
        maze[r][c] = CELL_TYPES.GLITCH;
      }
    }
  }
  return maze;
}

// Render maze as a grid of divs (for React)
export function renderMaze(maze, glitchStates, playerPos) {
  return (
    <div className="maze-grid">
      {maze.map((row, rIdx) => (
        <div className="maze-row" key={rIdx}>
          {row.map((cell, cIdx) => {
            let cellType = cell;
            if (cell === CELL_TYPES.GLITCH) {
              cellType = glitchStates[`${rIdx},${cIdx}`] ? CELL_TYPES.WALL : CELL_TYPES.EMPTY;
            }
            const isPlayer = playerPos[0] === rIdx && playerPos[1] === cIdx;
            return (
              <div
                key={cIdx}
                className={`maze-cell ${cellType} ${isPlayer ? 'player' : ''}`}
              >
                {isPlayer ? (
                  <span style={{fontSize:'1.3em',fontWeight:'bold',color:'#0ff',filter:'drop-shadow(0 0 8px #0ff)'}}>⦿</span>
                ) : cell === CELL_TYPES.EXIT ? (
                  <span style={{display:'block',width:'1.2em',height:'1.2em'}}>
                    <svg width="100%" height="100%" viewBox="0 0 32 32" style={{display:'block'}}>
                      <circle cx="16" cy="16" r="10" fill="#fff" opacity="0.7">
                        <animate attributeName="r" values="10;13;10" dur="1.2s" repeatCount="indefinite"/>
                        <animate attributeName="opacity" values="0.7;1;0.7" dur="1.2s" repeatCount="indefinite"/>
                      </circle>
                      <circle cx="16" cy="16" r="6" fill="#0ff" opacity="0.9">
                        <animate attributeName="r" values="6;8;6" dur="1.2s" repeatCount="indefinite"/>
                        <animate attributeName="opacity" values="0.9;1;0.9" dur="1.2s" repeatCount="indefinite"/>
                      </circle>
                    </svg>
                  </span>
                ) : cell === CELL_TYPES.START ? (
                  <span style={{fontSize:'1.1em',color:'#0ff'}}>⦾</span>
                ) : ''}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
