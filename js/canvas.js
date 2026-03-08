// ============================================================
// CANVAS & EMOJI CACHE
// ============================================================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const emojiCache = {};

// Visual decoration data (generated once per game)
let grassDecorations = [];
let pathDecorations = [];

function generateDecorations() {
  grassDecorations = [];
  pathDecorations = [];

  // Scatter flowers, tufts, and dark patches across grass cells
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      if (Game.grid[r] && Game.grid[r][c] !== 0) continue;
      const x = c * CELL_SIZE;
      const y = r * CELL_SIZE + HUD_HEIGHT;

      // ~30% chance of a decoration per grass tile
      if (Math.random() < 0.30) {
        const roll = Math.random();
        if (roll < 0.35) {
          // Small flower
          const colors = ['#e8e85c', '#e87070', '#e8a0d0', '#70b8e8', '#ffffff'];
          grassDecorations.push({
            type: 'flower',
            x: x + 8 + Math.random() * 24,
            y: y + 8 + Math.random() * 24,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: 2 + Math.random() * 2
          });
        } else if (roll < 0.65) {
          // Grass tuft (darker lines)
          grassDecorations.push({
            type: 'tuft',
            x: x + 6 + Math.random() * 28,
            y: y + 10 + Math.random() * 20,
            height: 4 + Math.random() * 6,
            color: '#3a6228'
          });
        } else {
          // Dark patch
          grassDecorations.push({
            type: 'patch',
            x: x + Math.random() * 20,
            y: y + Math.random() * 20,
            w: 8 + Math.random() * 12,
            h: 6 + Math.random() * 10,
            color: 'rgba(0,0,0,0.08)'
          });
        }
      }
    }
  }

  // Scatter stones and cracks along path cells
  for (const cell of Game.pathCells) {
    const x = cell.x * CELL_SIZE;
    const y = cell.y * CELL_SIZE + HUD_HEIGHT;
    if (Math.random() < 0.35) {
      const roll = Math.random();
      if (roll < 0.5) {
        // Small stone
        pathDecorations.push({
          type: 'stone',
          x: x + 6 + Math.random() * 28,
          y: y + 6 + Math.random() * 28,
          size: 2 + Math.random() * 3,
          color: '#9a8a6a'
        });
      } else {
        // Crack line
        pathDecorations.push({
          type: 'crack',
          x: x + 5 + Math.random() * 30,
          y: y + 5 + Math.random() * 30,
          len: 6 + Math.random() * 10,
          angle: Math.random() * Math.PI,
          color: '#5a4a30'
        });
      }
    }
  }
}

function setupCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = CANVAS_W * dpr;
  canvas.height = CANVAS_H * dpr;
  canvas.style.width = CANVAS_W + 'px';
  canvas.style.height = CANVAS_H + 'px';
  ctx.scale(dpr, dpr);
}

function cacheEmoji(emoji, size) {
  const key = emoji + '_' + size;
  if (emojiCache[key]) return;
  const off = document.createElement('canvas');
  off.width = size * 2;
  off.height = size * 2;
  const oc = off.getContext('2d');
  oc.font = `${size}px serif`;
  oc.textAlign = 'center';
  oc.textBaseline = 'middle';
  oc.fillText(emoji, size, size);
  emojiCache[key] = off;
}

function drawEmoji(emoji, x, y, size) {
  const key = emoji + '_' + size;
  let cached = emojiCache[key];
  if (!cached) {
    cacheEmoji(emoji, size);
    cached = emojiCache[key];
  }
  ctx.drawImage(cached, Math.floor(x - size), Math.floor(y - size));
}

function preRenderAssets() {
  const emojis = [];
  for (const k in CHICKEN_DEFS) emojis.push(CHICKEN_DEFS[k].emoji);
  for (const k in ZOMBIE_DEFS) emojis.push(ZOMBIE_DEFS[k].emoji);
  for (const e of emojis) {
    cacheEmoji(e, 28);
    cacheEmoji(e, 22);
  }
}
