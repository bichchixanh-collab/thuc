// ===== FILE: js/feature_world_depth.js =====
// ==================== FEATURE: WORLD DEPTH ====================
// js/feature_world_depth.js
// Requires: config.js, maps.js, player.js, enemies.js, game.js, ui.js, inventory.js
// Add AFTER game.js: <script src="js/feature_world_depth.js"></script>

// ==================== SECTION 1: DATA & CONFIG ====================

const TERRAIN_CONFIG = {
  // Tile IDs mới (tiếp theo sau 4)
  BREAKABLE_WALL: 5,  // Tường đá phá được
  BUSH_TILE: 6,       // Bush đốt bằng Hỏa
  FROZEN_LAKE: 7,     // Hồ đóng băng khi dùng Băng
  STONE_PILLAR: 8,    // Trụ đá sét đánh → rơi xuống

  interactions: {
    5: {
      element: null,
      minAtk: 50,
      action: 'break',
      reward: null,
      resultTile: 1
    },
    6: {
      element: 'fire',
      action: 'burn',
      rewardChance: 0.6,
      rewardPool: ['wolfFang', 'wolfPelt', 'hpPotion', 'mpPotion', 'spiritStone'],
      resultTile: 1
    },
    7: {
      element: 'ice',
      action: 'freeze',
      frozenDuration: 30000,
      resultTile: 7,
      unfrozenTile: 2
    },
    8: {
      element: 'thunder',
      action: 'collapse',
      blockRadius: 40,
      blockDuration: 20000,
      resultTile: 1
    }
  },

  mapTerrain: {
    0: { bushDensity: 0.04, wallDensity: 0.02, pillarDensity: 0.01 },
    1: { wallDensity: 0.05, pillarDensity: 0.02 },
    2: { pillarDensity: 0.03 },
    3: { frozenLakeDensity: 0.06 },
    4: { wallDensity: 0.04, pillarDensity: 0.02 },
    5: { bushDensity: 0.02 }
  }
};

const HAZARD_CONFIG = {
  hazards: {
    1: {
      type: 'rockfall',
      interval: { min: 8000, max: 15000 },
      warningTime: 1200,
      damage: 0.15,
      radius: 30,
      color: '#808080',
      canReduce: true,
      reduceFactor: 0.50
    },
    2: {
      type: 'lavaflow',
      spawnInterval: 20000,
      speed: 0.3,
      damagePerSecond: 0.08,
      width: 2,
      color: '#ff4500',
      canReduce: true,
      reduceFactor: 0.60
    },
    3: {
      type: 'blizzard',
      cycleDuration: 30000,
      activeRatio: 0.4,
      fogAlpha: 0.35,
      visionReduction: 0.6,
      damage: 0,
      canReduce: false
    },
    4: {
      type: 'poisonSpike',
      wallProximity: 2,
      damage: 0.10,
      triggerInterval: 3000,
      color: '#4a148c',
      canReduce: true,
      reduceFactor: 0.70
    },
    5: {
      type: 'divineThunder',
      interval: { min: 12000, max: 20000 },
      warningTime: 800,
      damage: 0.20,
      radius: 40,
      color: '#ffeb3b',
      canReduce: true,
      reduceFactor: 0.40
    }
  }
};

const VARIANT_CONFIG = {
  variants: {
    normal:    { chance: 0.800, nameSuffix: '',         hpMul: 1.0, atkMul: 1.0, expMul: 1.0, goldMul: 1.0, dropBonus: 0,   aura: null },
    elite:     { chance: 0.170, nameSuffix: ' [精英]',  hpMul: 1.5, atkMul: 1.2, expMul: 1.5, goldMul: 1.3, dropBonus: 0.1, aura: '#c0c0c0' },
    champion:  { chance: 0.028, nameSuffix: ' [勇士]',  hpMul: 3.0, atkMul: 1.6, expMul: 2.5, goldMul: 2.0, dropBonus: 0.2, aura: '#ff9800', hasSkill: true },
    legendary: { chance: 0.002, nameSuffix: ' [傳說]',  hpMul: 5.0, atkMul: 2.0, expMul: 5.0, goldMul: 4.0, dropBonus: 0,   aura: '#f0c040', guaranteedLegendary: true }
  },

  titlePrefixes: [
    'Cổ Thụ', 'Sát Thần', 'Bạo Liệt', 'Cuồng Nộ', 'Hắc Ám',
    'Băng Hàn', 'Viêm Đế', 'Lôi Thần', 'Huyết Nguyệt', 'Thiết Giáp'
  ],

  championSkills: [
    {
      id: 'explodeOnDeath',
      name: 'Bùng Nổ',
      trigger: 'onDeath',
      effect: 'aoe',
      radius: 80,
      damage: 0.15
    },
    {
      id: 'revive',
      name: 'Tái Sinh',
      trigger: 'hpThreshold',
      threshold: 0.20,
      effect: 'heal',
      healPct: 0.30,
      oncePerFight: true
    },
    {
      id: 'summonMinion',
      name: 'Kêu Gọi',
      trigger: 'hpThreshold',
      threshold: 0.50,
      effect: 'summon',
      count: 2,
      oncePerFight: true
    },
    {
      id: 'reflect',
      name: 'Phản Đòn',
      trigger: 'onHit',
      chance: 0.20,
      effect: 'reflect',
      reflectPct: 0.25
    }
  ],

  legendaryDropPool: [
    'celestialSword', 'celestialRobe', 'celestialJade',
    'flameSword', 'frostSword', 'dragonArmor', 'dragonAmulet'
  ]
};

// ==================== SECTION 2: INTERACTIVE TERRAIN ====================

const InteractiveTerrain = {
  state: {
    modifiedTiles: {},
    collapsedPillars: [],
    hiddenItems: []
  },

  getTile(tileX, tileY) {
    const key = tileX + ',' + tileY;
    const mod = this.state.modifiedTiles[key];
    if (mod) return mod.currentTile;
    return (Maps.tiles[tileY] !== undefined ? Maps.tiles[tileY][tileX] : undefined) ?? 0;
  },

  isPassable(tileX, tileY) {
    const tile = this.getTile(tileX, tileY);
    if ([2, 3, 5, 8].includes(tile)) return false;
    if (tile === TERRAIN_CONFIG.FROZEN_LAKE) {
      const key = tileX + ',' + tileY;
      const mod = this.state.modifiedTiles[key];
      return !!(mod && mod.frozenUntil && GameState.time < mod.frozenUntil);
    }
    return true;
  },

  tryInteract(worldX, worldY, element, playerAtk) {
    const tileX = Math.floor(worldX / CONFIG.TILE_SIZE);
    const tileY = Math.floor(worldY / CONFIG.TILE_SIZE);
    const tile = this.getTile(tileX, tileY);
    const cfg = TERRAIN_CONFIG.interactions[tile];
    if (!cfg) return false;

    if (cfg.minAtk && playerAtk < cfg.minAtk) return false;
    if (cfg.element && element !== cfg.element) return false;

    switch (cfg.action) {
      case 'break':
        this.setTile(tileX, tileY, cfg.resultTile);
        this._spawnBreakParticles(tileX, tileY, '#808080');
        UI.addLog('💥 Phá tường đá!', 'system');
        break;

      case 'burn':
        this.setTile(tileX, tileY, cfg.resultTile);
        this._spawnFireParticles(tileX, tileY);
        if (Utils.chance(cfg.rewardChance)) {
          const item = cfg.rewardPool[Math.floor(Math.random() * cfg.rewardPool.length)];
          this.state.hiddenItems.push({
            x: tileX * CONFIG.TILE_SIZE + 16,
            y: tileY * CONFIG.TILE_SIZE + 16,
            itemId: item,
            life: 10000
          });
          UI.addLog('🔥 Bush cháy, lộ ra vật phẩm ẩn!', 'item');
        }
        break;

      case 'freeze': {
        const key = tileX + ',' + tileY;
        if (!this.state.modifiedTiles[key]) this.state.modifiedTiles[key] = {};
        this.state.modifiedTiles[key].frozenUntil = GameState.time + cfg.frozenDuration;
        this.state.modifiedTiles[key].currentTile = cfg.resultTile;
        this._spawnIceParticles(tileX, tileY);
        UI.addLog('❄️ Hồ đóng băng! Đi qua được 30 giây.', 'system');
        break;
      }

      case 'collapse':
        this.setTile(tileX, tileY, cfg.resultTile);
        this.state.collapsedPillars.push({
          worldX: tileX * CONFIG.TILE_SIZE + 16,
          worldY: tileY * CONFIG.TILE_SIZE + 16,
          radius: cfg.blockRadius,
          blockUntil: GameState.time + cfg.blockDuration
        });
        this._spawnThunderParticles(tileX, tileY);
        UI.addLog('⚡ Trụ đá sụp đổ! Chặn đường quái.', 'system');
        break;
    }
    return true;
  },

  setTile(tileX, tileY, newTile) {
    const key = tileX + ',' + tileY;
    if (!this.state.modifiedTiles[key]) this.state.modifiedTiles[key] = {};
    this.state.modifiedTiles[key].originalTile = Maps.tiles[tileY] ? Maps.tiles[tileY][tileX] : 0;
    this.state.modifiedTiles[key].currentTile = newTile;
    if (Maps.tiles[tileY]) Maps.tiles[tileY][tileX] = newTile;
  },

  update(dt) {
    const now = GameState.time;

    // Update frozen lakes
    for (const [key, mod] of Object.entries(this.state.modifiedTiles)) {
      if (mod.frozenUntil && now > mod.frozenUntil) {
        const [x, y] = key.split(',').map(Number);
        if (Maps.tiles[y]) Maps.tiles[y][x] = 2; // restore to water
        delete mod.frozenUntil;
      }
    }

    // Update collapsed pillars
    this.state.collapsedPillars = this.state.collapsedPillars.filter(p => now < p.blockUntil);

    // Update hidden items lifetime
    for (let i = this.state.hiddenItems.length - 1; i >= 0; i--) {
      this.state.hiddenItems[i].life -= dt;
      if (this.state.hiddenItems[i].life <= 0) {
        this.state.hiddenItems.splice(i, 1);
      }
    }

    // Check Player pickup hidden items
    for (let i = this.state.hiddenItems.length - 1; i >= 0; i--) {
      const item = this.state.hiddenItems[i];
      if (Utils.dist(Player.x, Player.y, item.x, item.y) < 40) {
        Inventory.add(item.itemId, 1);
        const itemData = ITEMS[item.itemId];
        UI.addLog('📦 Nhặt được ' + (itemData ? itemData.name : item.itemId) + '!', 'item');
        this.state.hiddenItems.splice(i, 1);
      }
    }

    // Push enemies away from collapsed pillars
    for (const enemy of Enemies.list) {
      if (!enemy.alive) continue;
      for (const pillar of this.state.collapsedPillars) {
        const d = Utils.dist(enemy.x, enemy.y, pillar.worldX, pillar.worldY);
        if (d < pillar.radius) {
          const angle = Math.atan2(enemy.y - pillar.worldY, enemy.x - pillar.worldX);
          enemy.x = pillar.worldX + Math.cos(angle) * (pillar.radius + enemy.size);
          enemy.y = pillar.worldY + Math.sin(angle) * (pillar.radius + enemy.size);
        }
      }
    }
  },

  reset() {
    this.state.modifiedTiles = {};
    this.state.collapsedPillars = [];
    this.state.hiddenItems = [];
  },

  renderHiddenItems(ctx) {
    this.state.hiddenItems.forEach(item => {
      const cx = item.x - GameState.camera.x;
      const cy = item.y - GameState.camera.y;
      const pulse = 0.5 + Math.sin(GameState.time / 300) * 0.3;
      ctx.globalAlpha = pulse;
      ctx.fillStyle = '#ffd700';
      ctx.font = '14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('📦', cx, cy);
      ctx.globalAlpha = 1;
    });
  },

  // --- Particle helpers ---
  _spawnBreakParticles(tileX, tileY, color) {
    const wx = tileX * CONFIG.TILE_SIZE + 16;
    const wy = tileY * CONFIG.TILE_SIZE + 16;
    for (let i = 0; i < 10; i++) {
      const a = Math.random() * Math.PI * 2;
      GameState.particles.push({
        x: wx, y: wy,
        vx: Math.cos(a) * 3, vy: Math.sin(a) * 3 - 2,
        life: 500, color, size: 3 + Math.random() * 4
      });
    }
  },

  _spawnFireParticles(tileX, tileY) {
    const wx = tileX * CONFIG.TILE_SIZE + 16;
    const wy = tileY * CONFIG.TILE_SIZE + 16;
    for (let i = 0; i < 12; i++) {
      GameState.particles.push({
        x: wx + (Math.random() - 0.5) * 20,
        y: wy + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 2,
        vy: -2 - Math.random() * 2,
        life: 600, color: '#ff4500', size: 3 + Math.random() * 4
      });
    }
  },

  _spawnIceParticles(tileX, tileY) {
    const wx = tileX * CONFIG.TILE_SIZE + 16;
    const wy = tileY * CONFIG.TILE_SIZE + 16;
    for (let i = 0; i < 10; i++) {
      const a = Math.random() * Math.PI * 2;
      GameState.particles.push({
        x: wx, y: wy,
        vx: Math.cos(a) * 2, vy: Math.sin(a) * 2,
        life: 500, color: '#80deea', size: 2 + Math.random() * 3
      });
    }
  },

  _spawnThunderParticles(tileX, tileY) {
    const wx = tileX * CONFIG.TILE_SIZE + 16;
    const wy = tileY * CONFIG.TILE_SIZE + 16;
    for (let i = 0; i < 14; i++) {
      const a = Math.random() * Math.PI * 2;
      GameState.particles.push({
        x: wx, y: wy,
        vx: Math.cos(a) * 4, vy: Math.sin(a) * 4 - 2,
        life: 400, color: '#ffeb3b', size: 3 + Math.random() * 5
      });
    }
  }
};

// ==================== SECTION 3: ENVIRONMENTAL HAZARDS ====================

const HazardSystem = {
  state: {
    activeHazards: [],
    _timers: {},
    blizzardActive: false,
    blizzardAlpha: 0,
    poisonDmgTimer: 0
  },

  getMapHazard() {
    return HAZARD_CONFIG.hazards[Maps.currentIndex] || null;
  },

  update(dt) {
    const hazard = this.getMapHazard();
    if (!hazard || !Player.alive) return;

    switch (hazard.type) {
      case 'rockfall':
      case 'divineThunder':
        this._updateTimedStrike(dt, hazard);
        break;
      case 'lavaflow':
        this._updateLavaFlow(dt, hazard);
        break;
      case 'blizzard':
        this._updateBlizzard(dt, hazard);
        break;
      case 'poisonSpike':
        this._updatePoisonSpike(dt, hazard);
        break;
    }

    this._updateActiveHazards(dt);
  },

  _updateTimedStrike(dt, hazard) {
    if (!this.state._timers.strike) {
      this.state._timers.strike = Utils.randomInt(hazard.interval.min, hazard.interval.max);
    }
    this.state._timers.strike -= dt;
    if (this.state._timers.strike <= 0) {
      this.state._timers.strike = null;
      this._triggerStrike(hazard);
    }
  },

  _triggerStrike(hazard) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 50 + Math.random() * 200;
    const wx = Player.x + Math.cos(angle) * dist;
    const wy = Player.y + Math.sin(angle) * dist;

    this.state.activeHazards.push({
      type: hazard.type,
      x: wx, y: wy,
      radius: hazard.radius,
      damage: hazard.damage,
      warningTime: hazard.warningTime,
      elapsed: 0,
      phase: 'warning',
      reduceFactor: hazard.reduceFactor,
      color: hazard.color
    });
  },

  _updateActiveHazards(dt) {
    for (let i = this.state.activeHazards.length - 1; i >= 0; i--) {
      const h = this.state.activeHazards[i];
      if (h.type === 'lavaflow') continue; // handled separately
      h.elapsed += dt;

      if (h.phase === 'warning' && h.elapsed >= h.warningTime) {
        h.phase = 'strike';
        h.elapsed = 0;

        const d = Utils.dist(Player.x, Player.y, h.x, h.y);
        if (d <= h.radius) {
          let dmg = Math.floor(Player.maxHp * h.damage);
          if (h.reduceFactor) {
            dmg = Math.floor(dmg * (1 - Player.def / (Player.def + 50)));
          }
          dmg = Math.max(1, dmg);
          Player.takeDamage(dmg, 'Hiểm Địa');
        }

        // Strike particles
        for (let j = 0; j < 12; j++) {
          const a = Math.random() * Math.PI * 2;
          GameState.particles.push({
            x: h.x + (Math.random() - 0.5) * h.radius,
            y: h.y + (Math.random() - 0.5) * h.radius,
            vx: Math.cos(a) * 3, vy: Math.sin(a) * 3 - 2,
            life: 500, color: h.color, size: 3 + Math.random() * 4
          });
        }
      }

      if (h.phase === 'strike' && h.elapsed >= 300) {
        this.state.activeHazards.splice(i, 1);
      }
    }
  },

  _updateLavaFlow(dt, hazard) {
    // Spawn new flows
    if (!this.state._timers.lava) this.state._timers.lava = hazard.spawnInterval;
    this.state._timers.lava -= dt;
    if (this.state._timers.lava <= 0) {
      this.state._timers.lava = hazard.spawnInterval;
      const edge = Math.floor(Math.random() * 4);
      const worldW = CONFIG.WORLD_WIDTH * CONFIG.TILE_SIZE;
      const worldH = CONFIG.WORLD_HEIGHT * CONFIG.TILE_SIZE;
      this.state.activeHazards.push({
        type: 'lavaflow',
        x: edge === 1 ? worldW : edge === 3 ? 0 : Math.random() * worldW,
        y: edge === 2 ? worldH : edge === 0 ? 0 : Math.random() * worldH,
        vx: edge === 1 ? -hazard.speed : edge === 3 ? hazard.speed : 0,
        vy: edge === 2 ? -hazard.speed : edge === 0 ? hazard.speed : 0,
        width: hazard.width * CONFIG.TILE_SIZE,
        life: 20000,
        dpsTimer: 0,
        dps: hazard.damagePerSecond,
        color: hazard.color
      });
    }

    // Update existing flows
    for (let i = this.state.activeHazards.length - 1; i >= 0; i--) {
      const h = this.state.activeHazards[i];
      if (h.type !== 'lavaflow') continue;
      h.x += h.vx;
      h.y += h.vy;
      h.life -= dt;
      h.dpsTimer += dt;
      if (h.dpsTimer >= 1000) {
        h.dpsTimer = 0;
        const d = Utils.dist(Player.x, Player.y, h.x, h.y);
        if (d < h.width) {
          const dmg = Math.max(1, Math.floor(Player.maxHp * h.dps));
          Player.takeDamage(dmg, 'Dung Nham');
        }
      }
      if (h.life <= 0) {
        this.state.activeHazards.splice(i, 1);
      }
    }
  },

  _updateBlizzard(dt, hazard) {
    const cycle = (GameState.time % hazard.cycleDuration) / hazard.cycleDuration;
    const active = cycle < hazard.activeRatio;
    this.state.blizzardActive = active;
    if (active) {
      this.state.blizzardAlpha = Math.min(hazard.fogAlpha, this.state.blizzardAlpha + dt * 0.001);
    } else {
      this.state.blizzardAlpha = Math.max(0, this.state.blizzardAlpha - dt * 0.001);
    }
  },

  _updatePoisonSpike(dt, hazard) {
    this.state.poisonDmgTimer += dt;
    if (this.state.poisonDmgTimer < hazard.triggerInterval) return;
    this.state.poisonDmgTimer = 0;

    const px = Math.floor(Player.x / CONFIG.TILE_SIZE);
    const py = Math.floor(Player.y / CONFIG.TILE_SIZE);
    let nearWall = false;

    outer:
    for (let dy = -hazard.wallProximity; dy <= hazard.wallProximity; dy++) {
      for (let dx = -hazard.wallProximity; dx <= hazard.wallProximity; dx++) {
        const t = Maps.tiles[py + dy] ? Maps.tiles[py + dy][px + dx] : undefined;
        if (t === 1 || t === 5) { nearWall = true; break outer; }
      }
    }

    if (nearWall) {
      const dmg = Math.max(1, Math.floor(Player.maxHp * hazard.damage));
      Player.takeDamage(dmg, 'Gai Độc');
      for (let i = 0; i < 5; i++) {
        GameState.particles.push({
          x: Player.x + (Math.random() - 0.5) * 20,
          y: Player.y + (Math.random() - 0.5) * 20,
          vx: (Math.random() - 0.5) * 2,
          vy: -1 - Math.random(),
          life: 400, color: hazard.color, size: 2 + Math.random() * 2
        });
      }
    }
  },

  render(ctx) {
    // Warning shadows (world-space)
    this.state.activeHazards.filter(h => h.phase === 'warning').forEach(h => {
      const progress = h.elapsed / h.warningTime;
      const alpha = 0.2 + progress * 0.4;
      const pulse = Math.sin(progress * Math.PI * 4) * 0.1;
      ctx.globalAlpha = alpha + pulse;
      ctx.fillStyle = h.color;
      ctx.beginPath();
      ctx.arc(
        h.x - GameState.camera.x,
        h.y - GameState.camera.y,
        h.radius * (0.5 + progress * 0.5),
        0, Math.PI * 2
      );
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    // Lava flows (world-space)
    this.state.activeHazards.filter(h => h.type === 'lavaflow').forEach(h => {
      ctx.fillStyle = h.color;
      ctx.globalAlpha = 0.7;
      ctx.fillRect(
        h.x - GameState.camera.x - h.width / 2,
        h.y - GameState.camera.y - h.width / 2,
        h.width, h.width
      );
      ctx.globalAlpha = 1;
    });
  },

  renderScreenSpace(ctx) {
    // Blizzard fog overlay (screen-space)
    if (this.state.blizzardAlpha > 0) {
      ctx.fillStyle = '#e3f2fd';
      ctx.globalAlpha = this.state.blizzardAlpha;
      ctx.fillRect(0, 0, Game.canvas.width, Game.canvas.height);
      ctx.globalAlpha = 1;

      // Snow particles
      if (this.state.blizzardActive && Math.random() < 0.4) {
        GameState.particles.push({
          x: Player.x + (Math.random() - 0.5) * Game.canvas.width,
          y: Player.y - Game.canvas.height / 2 + Math.random() * 20,
          vx: (Math.random() - 0.5) * 1.5,
          vy: 1 + Math.random() * 1.5,
          life: 1500, color: '#ffffff', size: 2 + Math.random() * 2
        });
      }
    }
  }
};

// ==================== SECTION 4: ENEMY VARIANTS ====================

const EnemyVariantSystem = {
  state: {
    championSkillsActive: {},
    _enemyIdCounter: 0
  },

  rollVariant() {
    const roll = Math.random();
    let cumulative = 0;
    for (const [key, v] of Object.entries(VARIANT_CONFIG.variants)) {
      cumulative += v.chance;
      if (roll < cumulative) return key;
    }
    return 'normal';
  },

  applyVariant(enemy) {
    const variantKey = this.rollVariant();
    const variant = VARIANT_CONFIG.variants[variantKey];

    enemy._variant = variantKey;
    enemy.hp      = Math.floor(enemy.hp      * variant.hpMul);
    enemy.maxHp   = Math.floor(enemy.maxHp   * variant.hpMul);
    enemy.atk     = Math.floor(enemy.atk     * variant.atkMul);
    enemy.exp     = Math.floor(enemy.exp     * variant.expMul);
    enemy.gold    = Math.floor(enemy.gold    * variant.goldMul);

    if (variant.dropBonus > 0) {
      enemy.drops = (enemy.drops || []).map(d => ({
        ...d, chance: Math.min(1, d.chance + variant.dropBonus)
      }));
    }

    if (variantKey === 'champion') {
      const prefix = VARIANT_CONFIG.titlePrefixes[
        Math.floor(Math.random() * VARIANT_CONFIG.titlePrefixes.length)
      ];
      enemy.name = prefix + ' ' + enemy.name + variant.nameSuffix;
      enemy.color = variant.aura;
      enemy._variantAura = variant.aura;

      const skillTemplate = VARIANT_CONFIG.championSkills[
        Math.floor(Math.random() * VARIANT_CONFIG.championSkills.length)
      ];
      const id = 'e_' + (this.state._enemyIdCounter++);
      enemy._id = id;
      enemy._championSkill = { ...skillTemplate, triggered: false };
      this.state.championSkillsActive[id] = enemy._championSkill;
    }

    if (variantKey === 'elite') {
      enemy.name = enemy.name + variant.nameSuffix;
      enemy._variantAura = variant.aura;
    }

    if (variantKey === 'legendary') {
      enemy.name = '【傳說】' + enemy.name;
      enemy.color = variant.aura;
      enemy._variantAura = variant.aura;
      enemy.boss = true;
      const drop = VARIANT_CONFIG.legendaryDropPool[
        Math.floor(Math.random() * VARIANT_CONFIG.legendaryDropPool.length)
      ];
      enemy.drops = [...(enemy.drops || []), { id: drop, chance: 1.0 }];
    }

    return variantKey;
  },

  updateChampionSkills(dt) {
    for (const enemy of Enemies.list) {
      if (!enemy.alive || !enemy._championSkill) continue;
      const skill = enemy._championSkill;
      if (skill.triggered && skill.oncePerFight) continue;

      switch (skill.trigger) {
        case 'hpThreshold':
          if ((enemy.hp / enemy.maxHp) <= skill.threshold && !skill.triggered) {
            skill.triggered = true;
            this.executeChampionSkill(enemy, skill);
          }
          break;
        // 'onDeath' handled in Enemies.kill hook
        // 'onHit' handled in Enemies.damage hook
      }
    }
  },

  executeChampionSkill(enemy, skill) {
    switch (skill.effect) {
      case 'aoe': {
        const d = Utils.dist(Player.x, Player.y, enemy.x, enemy.y);
        if (d <= skill.radius) {
          Player.takeDamage(Math.max(1, Math.floor(Player.maxHp * skill.damage)), enemy.name);
        }
        for (let i = 0; i < 15; i++) {
          const a = Math.random() * Math.PI * 2;
          GameState.particles.push({
            x: enemy.x, y: enemy.y,
            vx: Math.cos(a) * 4, vy: Math.sin(a) * 4 - 2,
            life: 600, color: enemy.color || '#ff9800', size: 4 + Math.random() * 4
          });
        }
        UI.addLog('💥 ' + enemy.name + ' Bùng Nổ!', 'system');
        break;
      }

      case 'heal': {
        const healAmt = Math.floor(enemy.maxHp * skill.healPct);
        enemy.hp = Math.min(enemy.maxHp, enemy.hp + healAmt);
        Game.spawnDamageNumber(enemy.x, enemy.y - 30, '+' + healAmt, '#4caf50');
        UI.addLog('💚 ' + enemy.name + ' Tái Sinh!', 'system');
        break;
      }

      case 'summon': {
        const mapData = Maps.data[Maps.currentIndex];
        const mapEnemies = mapData ? mapData.enemies : ['wolf'];
        for (let i = 0; i < skill.count; i++) {
          const type = mapEnemies[Math.floor(Math.random() * mapEnemies.length)];
          const minion = _origEnemiesSpawn.call(Enemies, type, 1.0, Math.max(1, enemy.level - 1));
          if (minion) {
            minion.x = enemy.x + (Math.random() - 0.5) * 60;
            minion.y = enemy.y + (Math.random() - 0.5) * 60;
          }
        }
        UI.addLog('👥 ' + enemy.name + ' Kêu Gọi viện binh!', 'system');
        break;
      }
    }
  },

  renderVariantAura(ctx, enemy) {
    if (!enemy._variantAura || !enemy.alive) return;
    const cx = enemy.x - GameState.camera.x;
    const cy = enemy.y - GameState.camera.y - enemy.size / 2;
    const pulse = 0.3 + Math.sin(GameState.time / 200) * 0.15;

    ctx.globalAlpha = pulse * 0.5;
    ctx.fillStyle = enemy._variantAura;
    ctx.beginPath();
    ctx.arc(cx, cy, enemy.size + 8 + Math.sin(GameState.time / 300) * 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = pulse;
    ctx.strokeStyle = enemy._variantAura;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, enemy.size + 12, 0, Math.PI * 2);
    ctx.stroke();

    ctx.globalAlpha = 1;
    ctx.lineWidth = 1;
  }
};

// ==================== SECTION 5: MONKEY-PATCH & INIT ====================

// Store original references BEFORE patching
let _origEnemiesSpawn = Enemies.spawn.bind(Enemies);
let _origEnemiesKill  = null; // assigned below after checking
let _origEnemiesDamage = null;

const WorldDepthSystem = {
  _hooked: false,

  init() {
    if (this._hooked) return;
    this._hooked = true;

    this._hookMapsGenerate();
    this._hookMapsIsWater();
    this._hookMapsGetTileColor();
    this._hookMapsTravelTo();
    this._hookGameUpdate();
    this._hookGameRenderObjects();
    this._hookGameRenderEnemies();
    this._hookGameRender();
    this._hookGameHandleTap();
    this._hookPlayerUseSkill();
    this._hookEnemiesSpawn();
    this._hookEnemiesKill();
    this._hookEnemiesDamage();

    // Inject CSS once
    if (!document.getElementById('world-depth-style')) {
      const style = document.createElement('style');
      style.id = 'world-depth-style';
      style.textContent = `
        /* World Depth System styles */
        .wd-hazard-warn { pointer-events: none; }
      `;
      document.head.appendChild(style);
    }

  },

  // --- Maps.generate: add new terrain tiles ---
  _hookMapsGenerate() {
    const _origGen = Maps.generate.bind(Maps);
    Maps.generate = function () {
      _origGen.call(this);
      InteractiveTerrain.reset();
      const cfg = TERRAIN_CONFIG.mapTerrain[this.currentIndex] || {};
      for (let y = 0; y < CONFIG.WORLD_HEIGHT; y++) {
        for (let x = 0; x < CONFIG.WORLD_WIDTH; x++) {
          if (!this.tiles[y] || this.tiles[y][x] !== 0) continue; // only replace grass
          if (cfg.bushDensity && Math.random() < cfg.bushDensity)
            this.tiles[y][x] = TERRAIN_CONFIG.BUSH_TILE;
          else if (cfg.wallDensity && Math.random() < cfg.wallDensity)
            this.tiles[y][x] = TERRAIN_CONFIG.BREAKABLE_WALL;
          else if (cfg.pillarDensity && Math.random() < cfg.pillarDensity)
            this.tiles[y][x] = TERRAIN_CONFIG.STONE_PILLAR;
          else if (cfg.frozenLakeDensity && Math.random() < cfg.frozenLakeDensity)
            this.tiles[y][x] = TERRAIN_CONFIG.FROZEN_LAKE;
        }
      }
    };
  },

  // --- Maps.isWater: treat new blocking tiles as impassable ---
  _hookMapsIsWater() {
    const _origIsWater = Maps.isWater.bind(Maps);
    Maps.isWater = function (tileX, tileY) {
      if (_origIsWater.call(this, tileX, tileY)) return true;
      const tile = InteractiveTerrain.getTile(tileX, tileY);
      if (tile === TERRAIN_CONFIG.BREAKABLE_WALL) return true;
      if (tile === TERRAIN_CONFIG.STONE_PILLAR) return true;
      if (tile === TERRAIN_CONFIG.FROZEN_LAKE)
        return !InteractiveTerrain.isPassable(tileX, tileY);
      return false;
    };
  },

  // --- Maps.getTileColor: render new tile types ---
  _hookMapsGetTileColor() {
    const _origGetColor = Maps.getTileColor.bind(Maps);
    Maps.getTileColor = function (tile, x, y) {
      switch (tile) {
        case TERRAIN_CONFIG.BREAKABLE_WALL:
          return ((x + y) % 2 === 0) ? '#757575' : '#616161';
        case TERRAIN_CONFIG.BUSH_TILE:
          return ((x + y) % 2 === 0) ? '#388e3c' : '#2e7d32';
        case TERRAIN_CONFIG.FROZEN_LAKE: {
          const key = x + ',' + y;
          const mod = InteractiveTerrain.state.modifiedTiles[key];
          const frozen = mod && mod.frozenUntil && GameState.time < mod.frozenUntil;
          return frozen ? '#80deea' : '#4fc3f7';
        }
        case TERRAIN_CONFIG.STONE_PILLAR:
          return ((x + y) % 2 === 0) ? '#9e9e9e' : '#757575';
        default:
          return _origGetColor.call(this, tile, x, y);
      }
    };
  },

  // --- Maps.travelTo: reset terrain when changing map ---
  _hookMapsTravelTo() {
    const _origTravelTo = Maps.travelTo.bind(Maps);
    Maps.travelTo = function (mapIndex) {
      const result = _origTravelTo.call(this, mapIndex);
      if (result) {
        InteractiveTerrain.reset();
        HazardSystem.state.activeHazards = [];
        HazardSystem.state._timers = {};
        HazardSystem.state.blizzardAlpha = 0;
        HazardSystem.state.poisonDmgTimer = 0;
      }
      return result;
    };
  },

  // --- Game.update: inject system updates ---
  _hookGameUpdate() {
    const _origUpdate = Game.update.bind(Game);
    Game.update = function (dt) {
      _origUpdate.call(this, dt);
      InteractiveTerrain.update(dt);
      HazardSystem.update(dt);
      EnemyVariantSystem.updateChampionSkills(dt);
    };
  },

  // --- Game.renderObjects: append hidden item rendering ---
  _hookGameRenderObjects() {
    const _origRenderObjects = Game.renderObjects.bind(Game);
    Game.renderObjects = function () {
      _origRenderObjects.call(this);
      InteractiveTerrain.renderHiddenItems(this.ctx);
    };
  },

  // --- Game.renderEnemies: append variant aura rendering ---
  _hookGameRenderEnemies() {
    const _origRenderEnemies = Game.renderEnemies.bind(Game);
    Game.renderEnemies = function () {
      _origRenderEnemies.call(this);
      for (const enemy of Enemies.list) {
        if (!enemy.alive || !enemy._variantAura) continue;
        if (enemy.x < GameState.camera.x - 80 || enemy.x > GameState.camera.x + this.canvas.width + 80) continue;
        EnemyVariantSystem.renderVariantAura(this.ctx, enemy);
      }
    };
  },

  // --- Game.render: append hazard rendering ---
  _hookGameRender() {
    const _origRender = Game.render.bind(Game);
    Game.render = function () {
      _origRender.call(this);
      // World-space hazard rendering (warnings + lava)
      this.ctx.save();
      this.ctx.translate(-GameState.camera.x, -GameState.camera.y);
      HazardSystem.render(this.ctx);
      this.ctx.restore();
      // Screen-space (blizzard overlay)
      HazardSystem.renderScreenSpace(this.ctx);
    };
  },

  // --- Game.handleTap: terrain interaction on tap ---
  _hookGameHandleTap() {
    const _origHandleTap = Game.handleTap.bind(Game);
    Game.handleTap = function (screenX, screenY) {
      const worldX = screenX + GameState.camera.x;
      const worldY = screenY + GameState.camera.y;

      // Try terrain interaction with current element
      const element = (typeof ElementSystem !== 'undefined' && ElementSystem._currentAttackElement)
        ? ElementSystem._currentAttackElement : null;
      if (element && element !== 'neutral') {
        const interacted = InteractiveTerrain.tryInteract(worldX, worldY, element, Player.atk);
        if (interacted) return; // consumed the tap
      }

      // Also try non-element terrain (e.g., breakable wall)
      const tileX = Math.floor(worldX / CONFIG.TILE_SIZE);
      const tileY = Math.floor(worldY / CONFIG.TILE_SIZE);
      const tile = InteractiveTerrain.getTile(tileX, tileY);
      if (tile === TERRAIN_CONFIG.BREAKABLE_WALL) {
        InteractiveTerrain.tryInteract(worldX, worldY, null, Player.atk);
      }

      _origHandleTap.call(this, screenX, screenY);
    };
  },

  // --- Player.useSkill: terrain interaction by element ---
  _hookPlayerUseSkill() {
    if (!Player || typeof Player.useSkill !== 'function') return;
    const _origUseSkill = Player.useSkill.bind(Player);
    Player.useSkill = function (idx) {
      const result = _origUseSkill.call(this, idx);

      // Determine element from ElementSystem or skill index
      let element = null;
      if (typeof ElementSystem !== 'undefined') {
        element = typeof ElementSystem.getAttackElement === 'function'
          ? ElementSystem.getAttackElement(idx)
          : ElementSystem._currentAttackElement;
      }

      if (element && element !== 'neutral') {
        const px = Math.floor(Player.x / CONFIG.TILE_SIZE);
        const py = Math.floor(Player.y / CONFIG.TILE_SIZE);
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            InteractiveTerrain.tryInteract(
              (px + dx) * CONFIG.TILE_SIZE + 16,
              (py + dy) * CONFIG.TILE_SIZE + 16,
              element, Player.atk
            );
          }
        }
      }

      return result;
    };
  },

  // --- Enemies.spawn: apply variant on new enemies ---
  _hookEnemiesSpawn() {
    _origEnemiesSpawn = Enemies.spawn.bind(Enemies);
    Enemies.spawn = function (typeKey, levelMul, baseLevel) {
      const enemy = _origEnemiesSpawn.call(this, typeKey, levelMul, baseLevel);
      if (enemy && !enemy.boss) {
        EnemyVariantSystem.applyVariant(enemy);
      }
      return enemy;
    };
  },

  // --- Enemies.kill: champion on-death + legendary announce ---
  _hookEnemiesKill() {
    if (typeof Enemies.kill !== 'function') {
      // Enemies.kill may not exist — patch enemy death via update instead
      return;
    }
    _origEnemiesKill = Enemies.kill.bind(Enemies);
    Enemies.kill = function (enemy) {
      // Champion explode on death
      if (enemy._championSkill && enemy._championSkill.trigger === 'onDeath') {
        EnemyVariantSystem.executeChampionSkill(enemy, enemy._championSkill);
      }
      // Legendary announce
      if (enemy._variant === 'legendary') {
        UI.showNotification('✨ Quái Huyền Thoại Đã Bị Hạ!', enemy.name);
      }
      // Clean up
      if (enemy._id) delete EnemyVariantSystem.state.championSkillsActive[enemy._id];

      _origEnemiesKill.call(this, enemy);
    };
  },

  // --- Enemies.damage: reflect champion skill ---
  _hookEnemiesDamage() {
    if (typeof Enemies.damage !== 'function') return;
    _origEnemiesDamage = Enemies.damage.bind(Enemies);
    Enemies.damage = function (enemy, amount, isCrit, color) {
      // Reflect check BEFORE applying damage (avoid recursive loop)
      if (enemy && enemy._championSkill && enemy._championSkill.effect === 'reflect') {
        if (Utils.chance(enemy._championSkill.chance)) {
          const reflectDmg = Math.max(0, Math.floor(amount * enemy._championSkill.reflectPct));
          if (reflectDmg > 0) {
            Player.takeDamage(reflectDmg, 'Phản Đòn');
            Game.spawnDamageNumber(Player.x, Player.y - 20, '↩' + reflectDmg, '#ff9800');
          }
        }
      }
      return _origEnemiesDamage.call(this, enemy, amount, isCrit, color);
    };
  }
};

// ==================== BOOT ====================
// Hook into Game.init to run WorldDepthSystem.init after game is ready
(function () {
  const _origGameInit = Game.init.bind(Game);
  Game.init = function () {
    _origGameInit.call(this);
    WorldDepthSystem.init();
  };
})();


// ===== CHANGES: Xóa 2 console.log debug. Xóa comment usage thừa cuối file. =====
