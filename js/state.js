// ============================================================
// GAME STATE
// ============================================================
const Game = {
  grid: [],
  currentState: 'MENU',
  round: 0,
  maxRounds: 50,
  lives: 20,
  currency: 100,
  score: 0,
  gameSpeed: 1,
  isFreePlay: false,
  chickens: [],
  zombies: [],
  projectiles: [],
  particles: [],
  pathCells: [],
  pathPixels: [],
  selectedChickenType: null,
  selectedChicken: null, // The placed chicken currently selected for upgrade/sell
  mouseX: 0, mouseY: 0,
  hoverCol: -1, hoverRow: -1,
  lastTimestamp: 0,
  waveActive: false,
  betweenWaves: true,
  spawnQueue: [],
  spawnTimer: 0,
  spawnInterval: 1,
};
