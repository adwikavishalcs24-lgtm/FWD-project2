// PlayerController.js
// Handles player movement, collision, and exit detection

import { CELL_TYPES } from './MazeGrid';

export function movePlayer(maze, glitchStates, playerPos, direction) {
  const [r, c] = playerPos;
  let [nr, nc] = [r, c];
  if (direction === 'up') nr--;
  if (direction === 'down') nr++;
  if (direction === 'left') nc--;
  if (direction === 'right') nc++;
  // Check bounds
  if (nr < 0 || nc < 0 || nr >= maze.length || nc >= maze[0].length) return playerPos;
  // Check wall
  let cell = maze[nr][nc];
  if (cell === CELL_TYPES.GLITCH) {
    cell = glitchStates[`${nr},${nc}`] ? CELL_TYPES.WALL : CELL_TYPES.EMPTY;
  }
  if (cell === CELL_TYPES.WALL) return playerPos;
  return [nr, nc];
}

export function checkWinCondition(maze, playerPos) {
  const [r, c] = playerPos;
  if (!maze[r] || !maze[r][c]) return false;
  return maze[r][c] === CELL_TYPES.EXIT;
}
