// ============================================================
// RENDERING
// ============================================================
function renderGrid() {
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const x = c * CELL_SIZE;
      const y = r * CELL_SIZE + HUD_HEIGHT;
      const cellVal = Game.grid[r][c];

      if (cellVal === 1) {
        // Path — warm dirt with subtle variation
        ctx.fillStyle = (c + r) % 2 === 0 ? '#8B7355' : '#7A6548';
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
        ctx.strokeStyle = '#6B5538';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
      } else {
        // Grass — lush green checkerboard
        ctx.fillStyle = (c + r) % 2 === 0 ? '#4a7a3a' : '#437032';
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
      }
    }
  }

  // Draw grass decorations (flowers, tufts, patches)
  for (const d of grassDecorations) {
    if (d.type === 'flower') {
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
      ctx.fillStyle = d.color;
      ctx.fill();
      // Tiny center dot
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.size * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = '#a08020';
      ctx.fill();
    } else if (d.type === 'tuft') {
      ctx.strokeStyle = d.color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x - 2, d.y - d.height);
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x + 2, d.y - d.height * 0.8);
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x + 4, d.y - d.height * 0.6);
      ctx.stroke();
    } else if (d.type === 'patch') {
      ctx.fillStyle = d.color;
      ctx.fillRect(d.x, d.y, d.w, d.h);
    }
  }

  // Draw path decorations (stones, cracks)
  for (const d of pathDecorations) {
    if (d.type === 'stone') {
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
      ctx.fillStyle = d.color;
      ctx.fill();
      ctx.strokeStyle = '#7a6a4a';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    } else if (d.type === 'crack') {
      ctx.strokeStyle = d.color;
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x + Math.cos(d.angle) * d.len, d.y + Math.sin(d.angle) * d.len);
      ctx.stroke();
    }
  }

  // Path entry/exit indicators
  if (Game.pathPixels.length > 1) {
    // Entry — red arrow with glow
    const entry = Game.pathPixels[0];
    ctx.shadowColor = '#e74c3c';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.moveTo(entry.x - 15, entry.y - 8);
    ctx.lineTo(entry.x, entry.y);
    ctx.lineTo(entry.x - 15, entry.y + 8);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Exit — farm with fence posts
    const exit = Game.pathPixels[Game.pathPixels.length - 1];
    // Draw small fence posts around exit
    ctx.strokeStyle = '#8B6914';
    ctx.lineWidth = 2;
    for (let i = -1; i <= 1; i += 2) {
      const fx = exit.x + i * 18;
      ctx.beginPath();
      ctx.moveTo(fx, exit.y - 14);
      ctx.lineTo(fx, exit.y + 10);
      ctx.stroke();
      // Crossbar
      ctx.beginPath();
      ctx.moveTo(fx - 4, exit.y - 6);
      ctx.lineTo(fx + 4, exit.y - 6);
      ctx.stroke();
    }
    ctx.fillStyle = '#e74c3c';
    ctx.font = '22px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('\u{1F3E0}', exit.x, exit.y);
  }
}

function renderPlacementPreview() {
  if (!Game.selectedChickenType || Game.currentState !== 'PLAYING') return;
  const { col, row } = { col: Game.hoverCol, row: Game.hoverRow };
  if (col < 0 || col >= GRID_COLS || row < 0 || row >= GRID_ROWS) return;

  const x = col * CELL_SIZE;
  const y = row * CELL_SIZE + HUD_HEIGHT;
  const cx = x + CELL_SIZE / 2;
  const cy = y + CELL_SIZE / 2;
  const def = CHICKEN_DEFS[Game.selectedChickenType];
  const valid = canPlace(col, row) && Game.currency >= def.cost;

  // Highlight cell
  ctx.fillStyle = valid ? 'rgba(76,175,80,0.3)' : 'rgba(244,67,54,0.3)';
  ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
  ctx.strokeStyle = valid ? '#4CAF50' : '#F44336';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);

  // Range circle with animated pulse
  if (valid) {
    const pulse = 0.15 + Math.sin(Date.now() / 300) * 0.05;
    ctx.beginPath();
    ctx.arc(cx, cy, def.range * CELL_SIZE, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(76,175,80,${pulse + 0.15})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = `rgba(76,175,80,${pulse * 0.3})`;
    ctx.fill();
  }

  // Ghost emoji
  ctx.globalAlpha = 0.5;
  drawEmoji(def.emoji, cx, cy, 22);
  ctx.globalAlpha = 1;
}

function renderGame() {
  // Clear
  ctx.fillStyle = '#2d2d44';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Grid
  renderGrid();

  // Placement preview
  renderPlacementPreview();

  // Chickens
  for (const c of Game.chickens) c.render();

  // Zombies
  for (const z of Game.zombies) z.render();

  // Projectiles
  for (const p of Game.projectiles) p.render();

  // Particles
  for (const p of Game.particles) p.render();

  // Sidebar background (clear area)
  ctx.fillStyle = '#1e1e3a';
  ctx.fillRect(GRID_COLS * CELL_SIZE, 0, SIDEBAR_WIDTH, CANVAS_H);
}
