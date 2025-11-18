// GlitchEngine.js
// Handles glitch wall toggling and player overlap detection

/**
 * glitchStates: { 'row,col': boolean }
 * true = wall ON, false = wall OFF
 */

export function toggleGlitchWalls(maze, glitchStates, setGlitchStates) {
  // Toggle most glitch walls every interval, but randomly leave some unchanged for chaos
  const newStates = { ...glitchStates };
  for (let r = 0; r < maze.length; r++) {
    for (let c = 0; c < maze[0].length; c++) {
      if (maze[r][c] === 'glitch') {
        // 80% chance to toggle, 20% to stay
        if (Math.random() < 0.8) {
          newStates[`${r},${c}`] = !glitchStates[`${r},${c}`];
        }
      }
    }
  }
  // Occasionally, randomly toggle a few more glitch walls for extra chaos
  if (Math.random() < 0.5) {
    const glitchCells = Object.keys(newStates).filter(key => maze[+key.split(',')[0]][+key.split(',')[1]] === 'glitch');
    for (let i = 0; i < Math.floor(glitchCells.length * 0.2); i++) {
      const idx = Math.floor(Math.random() * glitchCells.length);
      newStates[glitchCells[idx]] = !newStates[glitchCells[idx]];
    }
  }
  setGlitchStates(newStates);
}

// Check if player is inside a wall after glitch
export function detectPlayerWallOverlap(maze, glitchStates, playerPos) {
  const [r, c] = playerPos;
  let cell = maze[r][c];
  if (cell === 'glitch') {
    cell = glitchStates[`${r},${c}`] ? 'wall' : 'empty';
  }
  return cell === 'wall';
}
