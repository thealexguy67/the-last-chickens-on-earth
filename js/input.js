// ============================================================
// INPUT HANDLING
// ============================================================
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  Game.mouseX = e.clientX - rect.left;
  Game.mouseY = e.clientY - rect.top;
  const g = mouseToGrid(Game.mouseX, Game.mouseY);
  Game.hoverCol = g.col;
  Game.hoverRow = g.row;
});

canvas.addEventListener('click', (e) => {
  if (Game.currentState !== 'PLAYING') return;
  const { col, row } = mouseToGrid(Game.mouseX, Game.mouseY);

  // Check if clicking on a placed chicken
  const clickedChicken = Game.chickens.find(c => c.gridX === col && c.gridY === row);

  if (clickedChicken && !Game.selectedChickenType) {
    // Select this chicken for upgrade/sell
    Game.selectedChicken = clickedChicken;
    showChickenPopup(clickedChicken);
    return;
  }

  // If we have a chicken type selected, try to place it
  if (Game.selectedChickenType && canPlace(col, row)) {
    const def = CHICKEN_DEFS[Game.selectedChickenType];
    if (Game.currency >= def.cost) {
      Game.currency -= def.cost;
      const chicken = new Chicken(Game.selectedChickenType, col, row);
      Game.chickens.push(chicken);
      Game.grid[row][col] = 2;
      updateHUD();
    }
  }

  // Clicking empty space deselects chicken
  if (!clickedChicken && !Game.selectedChickenType) {
    Game.selectedChicken = null;
    hideChickenPopup();
  }
});

canvas.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  Game.selectedChickenType = null;
  Game.selectedChicken = null;
  hideChickenPopup();
  updateChickenButtons();
});

document.addEventListener('keydown', (e) => {
  if (Game.currentState !== 'PLAYING') return;
  if (e.key >= '1' && e.key <= String(CHICKEN_TYPES.length)) {
    selectChicken(CHICKEN_TYPES[parseInt(e.key) - 1]);
  }
  if (e.key === ' ' || e.key === 'Enter') {
    e.preventDefault();
    if (Game.betweenWaves) startWave();
  }
  if (e.key === 'Escape') {
    Game.selectedChickenType = null;
    Game.selectedChicken = null;
    hideChickenPopup();
    updateChickenButtons();
  }
});
