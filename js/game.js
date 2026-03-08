// ============================================================
// GAME LOOP
// ============================================================
function updatePlaying(dt) {
  // Reset buffs
  for (const c of Game.chickens) {
    c.buffed = false;
    c.buffAmount = 1;
  }

  // Update chickens (support first for buffs)
  for (const c of Game.chickens) {
    if (c.isSupport) c.update(dt);
  }
  for (const c of Game.chickens) {
    if (!c.isSupport) c.update(dt);
  }

  // Update zombies
  for (const z of Game.zombies) z.update(dt);

  // Check for zombies reaching end
  for (const z of Game.zombies) {
    if (z.reachedEnd) {
      Game.lives--;
      z.reachedEnd = false;
      if (Game.lives <= 0) {
        Game.lives = 0;
        changeState('GAME_OVER');
        return;
      }
    }
  }

  // Update projectiles
  for (const p of Game.projectiles) p.update(dt);

  // Update particles
  for (const p of Game.particles) p.update(dt);

  // Clean up dead entities
  Game.zombies = Game.zombies.filter(z => z.alive || z.reachedEnd);
  Game.projectiles = Game.projectiles.filter(p => p.alive);
  Game.particles = Game.particles.filter(p => p.alive);

  // Wave system
  updateWaveSystem(dt);

  // Update HUD periodically
  updateHUD();
}

function gameLoop(timestamp) {
  requestAnimationFrame(gameLoop);

  const dt = Math.min((timestamp - Game.lastTimestamp) / 1000, 0.1);
  Game.lastTimestamp = timestamp;

  if (Game.currentState === 'PLAYING') {
    updatePlaying(dt);
  }

  // Always render game background if in playing state
  if (Game.currentState === 'PLAYING' || Game.currentState === 'VICTORY' || Game.currentState === 'GAME_OVER') {
    renderGame();
  } else if (Game.currentState === 'MENU') {
    // Draw a dark background for menu
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  }
}
