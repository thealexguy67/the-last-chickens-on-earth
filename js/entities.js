// ============================================================
// CLASSES: Chicken, Zombie, Projectile, ShotgunPellet, Particle
// ============================================================
class Chicken {
  constructor(type, gridX, gridY) {
    this.type = type;
    const def = CHICKEN_DEFS[type];
    this.gridX = gridX;
    this.gridY = gridY;
    this.x = gridX * CELL_SIZE + CELL_SIZE / 2;
    this.y = gridY * CELL_SIZE + CELL_SIZE / 2 + HUD_HEIGHT;
    this.baseDamage = def.damage;
    this.baseAttackSpeed = def.attackSpeed;
    this.baseRange = def.range;
    this.range = def.range;
    this.damage = def.damage;
    this.attackSpeed = def.attackSpeed;
    this.splashRadius = def.splashRadius;
    this.isSupport = def.isSupport;
    this.buffMultiplier = def.buffMultiplier;
    this.cooldownTimer = 0;
    this.target = null;
    this.emoji = def.emoji;
    this.projectileColor = def.projectileColor;
    this.projectileSpeed = def.projectileSpeed;
    this.buffed = false;
    this.buffAmount = 1;
    this.attackAnim = 0;
    // Upgrade system
    this.level = 1;
    this.maxLevel = 3;
    this.totalInvested = def.cost; // Track total seeds spent (for sell value)
  }

  getUpgradeCost() {
    if (this.level >= this.maxLevel) return Infinity;
    const baseCost = CHICKEN_DEFS[this.type].cost;
    // Each level costs more: 60%, 100% of base cost
    const multipliers = [0.6, 1.0];
    return Math.floor(baseCost * multipliers[this.level - 1]);
  }

  upgrade() {
    const cost = this.getUpgradeCost();
    if (this.level >= this.maxLevel || Game.currency < cost) return false;
    Game.currency -= cost;
    this.totalInvested += cost;
    this.level++;
    // Boost stats: +30% per level
    const mult = 1 + (this.level - 1) * 0.3;
    this.damage = Math.floor(this.baseDamage * mult);
    this.attackSpeed = this.baseAttackSpeed * mult;
    this.range = this.baseRange + (this.level - 1) * 0.3;
    if (this.isSupport) {
      this.buffMultiplier = CHICKEN_DEFS[this.type].buffMultiplier + (this.level - 1) * 0.15;
    }
    updateHUD();
    return true;
  }

  getSellValue() {
    return Math.floor(this.totalInvested * 0.6);
  }

  getEffectiveAttackSpeed() {
    return this.attackSpeed * this.buffAmount;
  }

  findTarget() {
    let best = null, bestProg = -1;
    const rangePx = this.range * CELL_SIZE;
    for (const z of Game.zombies) {
      if (!z.alive) continue;
      const d = dist(z.x, z.y, this.x, this.y);
      if (d <= rangePx) {
        const prog = z.getTotalProgress();
        if (prog > bestProg) {
          bestProg = prog;
          best = z;
        }
      }
    }
    return best;
  }

  attack() {
    if (!this.target) return;
    const def = CHICKEN_DEFS[this.type];

    if (def.isShotgun) {
      // Shotgun fires a cone of pellets toward the target
      const dx = this.target.x - this.x;
      const dy = this.target.y - this.y;
      const baseAngle = Math.atan2(dy, dx);
      const count = def.pelletCount;
      const spread = def.spreadAngle; // radians total spread

      for (let i = 0; i < count; i++) {
        // Spread pellets evenly across the cone
        const offset = spread * ((i / (count - 1)) - 0.5);
        const angle = baseAngle + offset;
        Game.projectiles.push(new ShotgunPellet(
          this.x, this.y, angle,
          this.damage, this.projectileSpeed,
          this.range * CELL_SIZE, this.projectileColor
        ));
      }
      // Muzzle flash particles
      for (let i = 0; i < 4; i++) {
        const a = baseAngle + (Math.random() - 0.5) * spread;
        const spd = 60 + Math.random() * 40;
        Game.particles.push(new Particle(
          this.x, this.y, '#FFA500',
          Math.cos(a) * spd, Math.sin(a) * spd, 0.15
        ));
      }
    } else {
      Game.projectiles.push(new Projectile(
        this.x, this.y, this.target,
        this.damage, this.projectileSpeed,
        this.splashRadius, this.projectileColor
      ));
    }
    this.attackAnim = 0.15;
  }

  applyBuffs() {
    const rangePx = this.range * CELL_SIZE;
    for (const c of Game.chickens) {
      if (c === this || c.isSupport) continue;
      if (dist(c.x, c.y, this.x, this.y) <= rangePx) {
        c.buffed = true;
        c.buffAmount = Math.max(c.buffAmount, this.buffMultiplier);
      }
    }
  }

  update(dt) {
    this.attackAnim = Math.max(0, this.attackAnim - dt);
    if (this.isSupport) {
      this.applyBuffs();
      return;
    }
    this.cooldownTimer -= dt;
    this.target = this.findTarget();
    if (this.target && this.cooldownTimer <= 0) {
      this.attack();
      this.cooldownTimer = 1 / this.getEffectiveAttackSpeed();
    }
  }

  render() {
    const scale = this.attackAnim > 0 ? 1.15 : 1;
    if (scale !== 1) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.scale(scale, scale);
      drawEmoji(this.emoji, 0, 0, 22);
      ctx.restore();
    } else {
      drawEmoji(this.emoji, this.x, this.y, 22);
    }

    // Buff glow
    if (this.isSupport) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.range * CELL_SIZE, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,215,0,0.15)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,215,0,0.04)';
      ctx.fill();
    }
    if (this.buffed) {
      ctx.beginPath();
      ctx.arc(this.x, this.y - 16, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#FFD700';
      ctx.fill();
    }

    // Level stars
    if (this.level > 1) {
      const starCount = this.level - 1;
      const startX = this.x - (starCount - 1) * 5;
      ctx.fillStyle = '#FFD700';
      ctx.font = '8px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let i = 0; i < starCount; i++) {
        ctx.fillText('\u2605', startX + i * 10, this.y + 16);
      }
    }

    // Selection highlight
    if (Game.selectedChicken === this) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, 18, 0, Math.PI * 2);
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 2;
      ctx.stroke();
      // Show range
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.range * CELL_SIZE, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,215,0,0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,215,0,0.05)';
      ctx.fill();
    }
  }
}

class Zombie {
  constructor(type, hpMult, spdMult, rwdMult) {
    const def = ZOMBIE_DEFS[type];
    this.type = type;
    this.emoji = def.emoji;
    this.maxHp = Math.floor(def.hp * (hpMult || 1));
    this.hp = this.maxHp;
    this.speed = def.speed * (spdMult || 1);
    this.reward = Math.floor(def.reward * (rwdMult || 1));
    this.color = def.color;
    this.pathIndex = 0;
    this.pathProgress = 0;
    this.x = Game.pathPixels[0]?.x || 0;
    this.y = Game.pathPixels[0]?.y || 0;
    this.alive = true;
    this.reachedEnd = false;
    this.slowFactor = 1;
    this.hitFlash = 0;
  }

  getTotalProgress() {
    return this.pathIndex + this.pathProgress;
  }

  update(dt) {
    if (!this.alive) return;
    this.hitFlash = Math.max(0, this.hitFlash - dt);

    const effectiveSpeed = this.speed * this.slowFactor * Game.gameSpeed;
    const segDist = distBetweenWaypoints(this.pathIndex);
    if (segDist > 0) {
      this.pathProgress += (effectiveSpeed * dt) / segDist;
    }

    while (this.pathProgress >= 1 && this.pathIndex < Game.pathPixels.length - 1) {
      this.pathProgress -= 1;
      this.pathIndex++;
      if (this.pathIndex >= Game.pathPixels.length - 1) {
        this.reachedEnd = true;
        this.alive = false;
        return;
      }
    }

    if (this.pathIndex < Game.pathPixels.length - 1) {
      const from = Game.pathPixels[this.pathIndex];
      const to = Game.pathPixels[this.pathIndex + 1];
      this.x = from.x + (to.x - from.x) * this.pathProgress;
      this.y = from.y + (to.y - from.y) * this.pathProgress;
    }
  }

  takeDamage(amount) {
    this.hp -= amount;
    this.hitFlash = 0.1;
    if (this.hp <= 0) {
      this.alive = false;
      Game.currency += this.reward;
      Game.score += this.reward;
      spawnDeathParticles(this.x, this.y, this.color);
    }
  }

  render() {
    if (!this.alive) return;
    drawEmoji(this.emoji, this.x, this.y, 22);

    // Health bar
    if (this.hp < this.maxHp) {
      const bw = 28, bh = 4;
      const bx = this.x - bw / 2, by = this.y - 20;
      ctx.fillStyle = '#333';
      ctx.fillRect(bx, by, bw, bh);
      const ratio = this.hp / this.maxHp;
      ctx.fillStyle = ratio > 0.6 ? '#4CAF50' : ratio > 0.3 ? '#FFC107' : '#F44336';
      ctx.fillRect(bx, by, bw * ratio, bh);
    }

    // Hit flash
    if (this.hitFlash > 0) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, 14, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${this.hitFlash * 3})`;
      ctx.fill();
    }
  }
}

class Projectile {
  constructor(sx, sy, target, damage, speed, splashRadius, color) {
    this.x = sx;
    this.y = sy;
    this.target = target;
    this.damage = damage;
    this.speed = speed;
    this.splashRadius = splashRadius;
    this.color = color || '#FFF';
    this.alive = true;
    this.size = splashRadius > 0 ? 5 : 3;
  }

  update(dt) {
    if (!this.target || !this.target.alive) {
      this.alive = false;
      return;
    }
    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const d = Math.sqrt(dx * dx + dy * dy);
    const step = this.speed * dt * Game.gameSpeed;
    if (d <= step + 4) {
      this.onHit();
    } else {
      this.x += (dx / d) * step;
      this.y += (dy / d) * step;
    }
  }

  onHit() {
    if (this.splashRadius > 0) {
      const splashPx = this.splashRadius * CELL_SIZE;
      for (const z of Game.zombies) {
        if (z.alive && dist(z.x, z.y, this.target.x, this.target.y) <= splashPx) {
          z.takeDamage(this.damage);
        }
      }
      spawnSplashParticles(this.target.x, this.target.y);
    } else {
      this.target.takeDamage(this.damage);
    }
    this.alive = false;
  }

  render() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    if (this.splashRadius > 0) {
      ctx.strokeStyle = '#FFF';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
}

class ShotgunPellet {
  constructor(sx, sy, angle, damage, speed, maxRange, color) {
    this.x = sx;
    this.y = sy;
    this.startX = sx;
    this.startY = sy;
    this.angle = angle;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.damage = damage;
    this.speed = speed;
    this.maxRange = maxRange;
    this.color = color || '#FFD700';
    this.alive = true;
    this.size = 3;
    this.hitTargets = new Set(); // Don't hit the same zombie twice
  }

  update(dt) {
    this.x += this.vx * dt * Game.gameSpeed;
    this.y += this.vy * dt * Game.gameSpeed;

    // Check if pellet traveled beyond max range
    const traveled = dist(this.x, this.y, this.startX, this.startY);
    if (traveled > this.maxRange) {
      this.alive = false;
      return;
    }

    // Check collision with any zombie it hasn't hit yet
    for (const z of Game.zombies) {
      if (!z.alive || this.hitTargets.has(z)) continue;
      if (dist(this.x, this.y, z.x, z.y) < 16) {
        z.takeDamage(this.damage);
        this.hitTargets.add(z);
        this.alive = false; // Pellet stops on hit
        return;
      }
    }
  }

  render() {
    // Draw pellet as a bright small circle with a short trail
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    // Trail
    const trailX = this.x - this.vx * 0.02;
    const trailY = this.y - this.vy * 0.02;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(trailX, trailY);
    ctx.strokeStyle = 'rgba(255,200,0,0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

class Particle {
  constructor(x, y, color, vx, vy, lifetime) {
    this.x = x; this.y = y;
    this.vx = vx; this.vy = vy;
    this.color = color;
    this.lifetime = lifetime || 0.5;
    this.maxLifetime = this.lifetime;
    this.size = 2 + Math.random() * 3;
  }

  get alive() { return this.lifetime > 0; }
  get alpha() { return Math.max(0, this.lifetime / this.maxLifetime); }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.lifetime -= dt;
  }

  render() {
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * this.alpha, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function spawnDeathParticles(x, y, color) {
  // Big burst ring
  for (let i = 0; i < 12; i++) {
    const angle = (Math.PI * 2 / 12) * i + Math.random() * 0.3;
    const speed = 50 + Math.random() * 80;
    Game.particles.push(new Particle(
      x, y, color || '#5a5',
      Math.cos(angle) * speed, Math.sin(angle) * speed, 0.5
    ));
  }
  // Inner glow particles (lighter color)
  for (let i = 0; i < 5; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 20 + Math.random() * 30;
    Game.particles.push(new Particle(
      x, y, '#afa',
      Math.cos(angle) * speed, Math.sin(angle) * speed, 0.3
    ));
  }
}

function spawnSplashParticles(x, y) {
  // Bigger splash with orange and yellow
  for (let i = 0; i < 10; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 40 + Math.random() * 60;
    const color = Math.random() < 0.5 ? '#FFC107' : '#FF9800';
    Game.particles.push(new Particle(
      x, y, color,
      Math.cos(angle) * speed, Math.sin(angle) * speed, 0.4
    ));
  }
}
