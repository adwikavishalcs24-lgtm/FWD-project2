// TimelineSystem.js
// Handles timeline stability, penalties, and game-over logic

export function updateStability(stability, delta, setStability) {
  let newStability = stability + delta;
  if (newStability > 100) newStability = 100;
  if (newStability < 0) newStability = 0;
  setStability(newStability);
}

export function isGameOver(stability) {
  return stability <= 0;
}
