// ============================================================
// WAVE SYSTEM
// ============================================================
function generateWave(round) {
  const queue = [];
  const baseCount = 5 + Math.floor(round * 1.5);
  const hpMult = Math.pow(1.08, round - 1);
  const spdMult = Math.min(1.5, Math.pow(1.01, round - 1));
  let rwdMult = Math.pow(1.03, round - 1);

  let extraHpMult = 1;
  if (Game.isFreePlay && round > 50) {
    extraHpMult = Math.pow(1.02, round - 50);
  }

  for (let i = 0; i < baseCount; i++) {
    let type;
    const roll = Math.random();
    if (round < 5) {
      type = 'walker';
    } else if (round < 10) {
      type = roll < 0.7 ? 'walker' : 'runner';
    } else if (round < 20) {
      type = roll < 0.4 ? 'walker' : roll < 0.7 ? 'runner' : 'tank';
    } else {
      type = roll < 0.3 ? 'walker' : roll < 0.55 ? 'runner' : roll < 0.85 ? 'tank' : 'runner';
    }
    queue.push({ type, hpMult: hpMult * extraHpMult, spdMult, rwdMult });
  }

  if (round % 10 === 0) {
    const bossHpMult = hpMult * (1 + round / 10) * extraHpMult;
    queue.push({ type: 'boss', hpMult: bossHpMult, spdMult, rwdMult });
  }

  return queue;
}

function getSpawnInterval(round) {
  return Math.max(0.3, 1.2 - round * 0.018);
}

function startWave() {
  if (Game.waveActive || Game.currentState !== 'PLAYING') return;
  Game.round++;
  Game.waveActive = true;
  Game.betweenWaves = false;
  Game.spawnQueue = generateWave(Game.round);
  Game.spawnInterval = getSpawnInterval(Game.round);
  Game.spawnTimer = 0;
  updateHUD();
  document.getElementById('start-wave-btn').style.display = 'none';
  document.getElementById('wave-status').textContent = 'Wave ' + Game.round;
}

function updateWaveSystem(dt) {
  if (!Game.waveActive) return;

  Game.spawnTimer -= dt * Game.gameSpeed;
  if (Game.spawnTimer <= 0 && Game.spawnQueue.length > 0) {
    const def = Game.spawnQueue.shift();
    Game.zombies.push(new Zombie(def.type, def.hpMult, def.spdMult, def.rwdMult));
    Game.spawnTimer = Game.spawnInterval;
  }

  if (Game.spawnQueue.length === 0 && Game.zombies.every(z => !z.alive)) {
    Game.waveActive = false;
    Game.betweenWaves = true;
    onWaveComplete();
  }
}

function onWaveComplete() {
  const bonus = 25 + Game.round * 5;
  Game.currency += bonus;

  if (!Game.isFreePlay && Game.round >= Game.maxRounds) {
    changeState('VICTORY');
    return;
  }

  document.getElementById('start-wave-btn').style.display = 'block';
  document.getElementById('wave-status').textContent = 'Ready';
  updateHUD();
}
