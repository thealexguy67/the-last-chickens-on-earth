// ============================================================
// UTILITY FUNCTIONS
// ============================================================
function dist(x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

function distBetweenWaypoints(idx) {
  if (idx >= Game.pathPixels.length - 1) return 1;
  return dist(Game.pathPixels[idx].x, Game.pathPixels[idx].y,
              Game.pathPixels[idx+1].x, Game.pathPixels[idx+1].y);
}

function mouseToGrid(mx, my) {
  return {
    col: Math.floor(mx / CELL_SIZE),
    row: Math.floor((my - HUD_HEIGHT) / CELL_SIZE)
  };
}

function canPlace(col, row) {
  if (col < 0 || col >= GRID_COLS || row < 0 || row >= GRID_ROWS) return false;
  return Game.grid[row][col] === 0;
}
