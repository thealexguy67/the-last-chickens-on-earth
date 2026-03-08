// ============================================================
// CONSTANTS & CONFIGURATION
// ============================================================
const GRID_COLS = 20;
const GRID_ROWS = 14;
const CELL_SIZE = 40;
const SIDEBAR_WIDTH = 220;
const HUD_HEIGHT = 44;
const CANVAS_W = GRID_COLS * CELL_SIZE + SIDEBAR_WIDTH;
const CANVAS_H = GRID_ROWS * CELL_SIZE + HUD_HEIGHT;

const CHICKEN_DEFS = {
  pecker: {
    name: 'Pecker', emoji: '\u{1F414}', cost: 25, damage: 8,
    attackSpeed: 2.5, range: 3, splashRadius: 0, isSupport: false,
    buffMultiplier: 0, projectileColor: '#8B4513', projectileSpeed: 300,
    description: 'Fast attack, low damage', stats: 'DMG: 8 | SPD: 2.5/s'
  },
  eggBomber: {
    name: 'Egg Bomber', emoji: '\u{1F95A}', cost: 60, damage: 20,
    attackSpeed: 0.8, range: 3.5, splashRadius: 1.2, isSupport: false,
    buffMultiplier: 0, projectileColor: '#FFF8DC', projectileSpeed: 200,
    description: 'Splash damage in area', stats: 'DMG: 20 | Splash'
  },
  rooster: {
    name: 'Rooster', emoji: '\u{1F413}', cost: 100, damage: 50,
    attackSpeed: 0.5, range: 4, splashRadius: 0, isSupport: false,
    buffMultiplier: 0, projectileColor: '#FF4444', projectileSpeed: 400,
    description: 'Heavy single-target hitter', stats: 'DMG: 50 | Range: 4'
  },
  henMother: {
    name: 'Hen Mother', emoji: '\u{1F423}', cost: 75, damage: 0,
    attackSpeed: 0, range: 2.5, splashRadius: 0, isSupport: true,
    buffMultiplier: 1.4, projectileColor: '', projectileSpeed: 0,
    description: '+40% speed to nearby', stats: 'Buff radius: 2.5'
  },
  shotgunRooster: {
    name: 'Shotgun Rooster', emoji: '\u{1F414}\u{1F4A5}', cost: 80, damage: 12,
    attackSpeed: 0.9, range: 2, splashRadius: 0, isSupport: false,
    buffMultiplier: 0, projectileColor: '#FFD700', projectileSpeed: 350,
    description: 'Cone blast, deadly up close', stats: 'DMG: 12x5 | Range: 2',
    isShotgun: true, pelletCount: 5, spreadAngle: 0.6
  }
};

const ZOMBIE_DEFS = {
  walker:  { name: 'Walker',  emoji: '\u{1F9DF}',    hp: 50,   speed: 40,  reward: 5,  color: '#5a8a5a' },
  runner:  { name: 'Runner',  emoji: '\u{1F480}',    hp: 25,   speed: 80,  reward: 7,  color: '#8a5a5a' },
  tank:    { name: 'Tank',    emoji: '\u{1F9DF}\u200D\u2642\uFE0F', hp: 200,  speed: 25,  reward: 15, color: '#5a5a8a' },
  boss:    { name: 'Boss',    emoji: '\u{1F451}',    hp: 1000, speed: 20,  reward: 100, color: '#8a5a8a' }
};

const CHICKEN_TYPES = ['pecker', 'eggBomber', 'rooster', 'shotgunRooster', 'henMother'];

// Path waypoints (grid coordinates)
const PATH_WAYPOINTS = [
  {x: -1, y: 3},
  {x: 4, y: 3},
  {x: 4, y: 7},
  {x: 9, y: 7},
  {x: 9, y: 2},
  {x: 14, y: 2},
  {x: 14, y: 9},
  {x: 7, y: 9},
  {x: 7, y: 12},
  {x: 17, y: 12},
  {x: 17, y: 6},
  {x: 20, y: 6}
];
