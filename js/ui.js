// ============================================================
// STATE MACHINE
// ============================================================
function changeState(newState) {
  hideAllOverlays();
  Game.currentState = newState;

  switch (newState) {
    case 'MENU':
      document.getElementById('menu-overlay').style.display = 'flex';
      document.getElementById('hud').style.display = 'none';
      document.getElementById('chicken-panel').style.display = 'none';
      document.getElementById('start-wave-btn').style.display = 'none';
      break;
    case 'PLAYING':
      document.getElementById('hud').style.display = 'flex';
      document.getElementById('chicken-panel').style.display = 'block';
      if (Game.betweenWaves) {
        document.getElementById('start-wave-btn').style.display = 'block';
      }
      updateHUD();
      break;
    case 'VICTORY':
      document.getElementById('victory-overlay').style.display = 'flex';
      break;
    case 'GAME_OVER':
      document.getElementById('final-round').textContent = Game.round;
      document.getElementById('gameover-overlay').style.display = 'flex';
      break;
  }
}

function hideAllOverlays() {
  document.getElementById('menu-overlay').style.display = 'none';
  document.getElementById('victory-overlay').style.display = 'none';
  document.getElementById('gameover-overlay').style.display = 'none';
}

function startNewGame() {
  Game.round = 0;
  Game.lives = 20;
  Game.currency = 100;
  Game.score = 0;
  Game.gameSpeed = 1;
  Game.isFreePlay = false;
  Game.chickens = [];
  Game.zombies = [];
  Game.projectiles = [];
  Game.particles = [];
  Game.selectedChickenType = null;
  Game.selectedChicken = null;
  hideChickenPopup();
  Game.waveActive = false;
  Game.betweenWaves = true;
  Game.spawnQueue = [];

  buildGrid();
  buildPath();
  precomputePathPixels();
  generateDecorations();

  Game.autoStart = false;
  document.getElementById('round-max').textContent = '/ 50';
  document.getElementById('speed-1x').classList.add('active');
  document.getElementById('speed-2x').classList.remove('active');
  document.getElementById('auto-start-btn').classList.remove('active');

  buildChickenPanel();
  changeState('PLAYING');
}

function enterFreePlay() {
  Game.isFreePlay = true;
  Game.maxRounds = Infinity;
  document.getElementById('round-max').textContent = '(Endless)';
  changeState('PLAYING');
}

function goToMenu() {
  changeState('MENU');
}

function setSpeed(s) {
  Game.gameSpeed = s;
  document.getElementById('speed-1x').classList.toggle('active', s === 1);
  document.getElementById('speed-2x').classList.toggle('active', s === 2);
}

function toggleAutoStart() {
  Game.autoStart = !Game.autoStart;
  document.getElementById('auto-start-btn').classList.toggle('active', Game.autoStart);
}

// ============================================================
// UI FUNCTIONS
// ============================================================
function buildChickenPanel() {
  const container = document.getElementById('chicken-buttons');
  container.innerHTML = '';
  CHICKEN_TYPES.forEach((type, i) => {
    const def = CHICKEN_DEFS[type];
    const btn = document.createElement('div');
    btn.className = 'chicken-btn';
    btn.dataset.type = type;
    btn.innerHTML = `
      <div class="cb-header">
        <span class="cb-emoji">${def.emoji}</span>
        <span class="cb-name">${def.name}</span>
        <span class="hotkey-badge">${i + 1}</span>
      </div>
      <div class="cb-cost">\u{1F33E} ${def.cost} seeds</div>
      <div class="cb-desc">${def.description}</div>
      <div class="cb-stats">${def.stats}</div>
    `;
    btn.addEventListener('click', () => selectChicken(type));
    container.appendChild(btn);
  });
}

function selectChicken(type) {
  if (Game.currency < CHICKEN_DEFS[type].cost) return;
  Game.selectedChickenType = (Game.selectedChickenType === type) ? null : type;
  Game.selectedChicken = null;
  hideChickenPopup();
  updateChickenButtons();
}

function updateChickenButtons() {
  document.querySelectorAll('.chicken-btn').forEach(btn => {
    const type = btn.dataset.type;
    btn.classList.toggle('selected', type === Game.selectedChickenType);
    btn.classList.toggle('disabled', Game.currency < CHICKEN_DEFS[type].cost);
  });
}

function updateHUD() {
  document.getElementById('round-num').textContent = Game.round;
  document.getElementById('lives-num').textContent = Game.lives;
  document.getElementById('currency-num').textContent = Game.currency;
  updateChickenButtons();
  // Refresh popup if one is open
  if (Game.selectedChicken) showChickenPopup(Game.selectedChicken);
}

function showChickenPopup(chicken) {
  const popup = document.getElementById('chicken-popup');
  const def = CHICKEN_DEFS[chicken.type];

  document.getElementById('popup-emoji').textContent = def.emoji;
  document.getElementById('popup-name').textContent = def.name;
  document.getElementById('popup-level').textContent =
    chicken.level >= chicken.maxLevel ? 'MAX' : `Lv ${chicken.level}`;

  const upgradeCost = chicken.getUpgradeCost();
  const isMaxed = chicken.level >= chicken.maxLevel;
  const canAfford = Game.currency >= upgradeCost;

  let statsText = '';
  if (chicken.isSupport) {
    statsText = `Buff: +${Math.round((chicken.buffMultiplier - 1) * 100)}% speed\nRange: ${chicken.range.toFixed(1)}`;
  } else {
    statsText = `DMG: ${chicken.damage} | SPD: ${chicken.getEffectiveAttackSpeed().toFixed(1)}/s\nRange: ${chicken.range.toFixed(1)}`;
  }
  document.getElementById('popup-stats').textContent = statsText;

  const upgradeBtn = document.getElementById('popup-upgrade-btn');
  if (isMaxed) {
    upgradeBtn.textContent = 'MAXED';
    upgradeBtn.className = 'disabled';
  } else {
    upgradeBtn.textContent = `Upgrade (${upgradeCost} \u{1F33E})`;
    upgradeBtn.className = canAfford ? '' : 'disabled';
  }

  document.getElementById('popup-sell-btn').textContent =
    `Sell (+${chicken.getSellValue()} \u{1F33E})`;

  // Position popup near the chicken
  const popupX = chicken.x + 24;
  const popupY = chicken.y - 40;
  popup.style.left = Math.min(popupX, CANVAS_W - 200) + 'px';
  popup.style.top = Math.max(popupY, 50) + 'px';
  popup.style.display = 'block';
}

function hideChickenPopup() {
  document.getElementById('chicken-popup').style.display = 'none';
}

function upgradeSelectedChicken() {
  if (!Game.selectedChicken) return;
  if (Game.selectedChicken.upgrade()) {
    showChickenPopup(Game.selectedChicken);
  }
}

function sellSelectedChicken() {
  if (!Game.selectedChicken) return;
  const chicken = Game.selectedChicken;
  const sellValue = chicken.getSellValue();
  Game.currency += sellValue;
  // Remove from grid
  Game.grid[chicken.gridY][chicken.gridX] = 0;
  // Remove from chickens array
  Game.chickens = Game.chickens.filter(c => c !== chicken);
  Game.selectedChicken = null;
  hideChickenPopup();
  updateHUD();
}
