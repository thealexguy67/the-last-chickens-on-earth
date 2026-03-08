// ============================================================
// MAP & PATH
// ============================================================
function buildGrid() {
  Game.grid = [];
  for (let r = 0; r < GRID_ROWS; r++) {
    Game.grid[r] = [];
    for (let c = 0; c < GRID_COLS; c++) {
      Game.grid[r][c] = 0;
    }
  }
}

function buildPath() {
  Game.pathCells = [];
  for (let i = 0; i < PATH_WAYPOINTS.length - 1; i++) {
    const from = PATH_WAYPOINTS[i];
    const to = PATH_WAYPOINTS[i + 1];
    const dx = Math.sign(to.x - from.x);
    const dy = Math.sign(to.y - from.y);
    let cx = from.x, cy = from.y;
    while (cx !== to.x || cy !== to.y) {
      if (cx >= 0 && cx < GRID_COLS && cy >= 0 && cy < GRID_ROWS) {
        Game.grid[cy][cx] = 1;
        Game.pathCells.push({x: cx, y: cy});
      }
      if (dx !== 0) cx += dx;
      else cy += dy;
    }
  }
  const last = PATH_WAYPOINTS[PATH_WAYPOINTS.length - 1];
  if (last.x >= 0 && last.x < GRID_COLS && last.y >= 0 && last.y < GRID_ROWS) {
    Game.grid[last.y][last.x] = 1;
    Game.pathCells.push({x: last.x, y: last.y});
  }
}

function precomputePathPixels() {
  Game.pathPixels = [];
  for (let i = 0; i < PATH_WAYPOINTS.length - 1; i++) {
    const from = PATH_WAYPOINTS[i];
    const to = PATH_WAYPOINTS[i + 1];
    const dx = Math.sign(to.x - from.x);
    const dy = Math.sign(to.y - from.y);
    let cx = from.x, cy = from.y;
    while (cx !== to.x || cy !== to.y) {
      Game.pathPixels.push({
        x: cx * CELL_SIZE + CELL_SIZE / 2,
        y: cy * CELL_SIZE + CELL_SIZE / 2 + HUD_HEIGHT
      });
      if (dx !== 0) cx += dx;
      else cy += dy;
    }
  }
  const last = PATH_WAYPOINTS[PATH_WAYPOINTS.length - 1];
  Game.pathPixels.push({
    x: last.x * CELL_SIZE + CELL_SIZE / 2,
    y: last.y * CELL_SIZE + CELL_SIZE / 2 + HUD_HEIGHT
  });
}
