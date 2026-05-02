// ===== FILE: js/feature_world_energy.js =====
// ==================== WORLD ENERGY SYSTEM ====================
// feature_world_energy.js
// Tu Tiên Kiếm Hiệp — World Energy Feature
// Sections: LeyLines · FairyPocket · AncientTomb · Init/Hooks
// Load sau game.js, maps.js, enemies.js, player.js, inventory.js, ui.js
// =============================================================

// ============================================================
// SECTION 1 — DATA & CONFIG
// ============================================================

const LEY_LINE_CONFIG = {
  count: 3,
  moveInterval: { min: 15 * 60 * 1000, max: 60 * 60 * 1000 },
  detectRadius: 80,
  activateRadius: 50,
  revealDuration: 10 * 60 * 1000,

  types: {
    fire: {
      id: 'fire', name: 'Hỏa Mạch', icon: '🔴', color: '#ff4500',
      buff: { atkPctBonus: 0.30 },
      sideEffect: 'strongerEnemies',
      desc: '+30% ATK. Quái quanh đây mạnh hơn.'
    },
    water: {
      id: 'water', name: 'Thủy Mạch', icon: '🔵', color: '#42a5f5',
      buff: { hpRegenMul: 4.0, mpRegenMul: 4.0, realmExpMul: 2.0 },
      desc: 'Regen HP/MP x4. Tu Vi x2.'
    },
    thunder: {
      id: 'thunder', name: 'Lôi Mạch', icon: '⚡', color: '#ffeb3b',
      buff: { skillCdReduction: 0.50, expMul: 2.0 },
      sideEffect: 'lightningDmgTick',
      desc: 'Skill CD -50%. EXP x2. Lightning damage theo tick.'
    }
  },

  convergenceRadius: 40,
  convergenceDuration: 30000,
  convergenceBuff: { allBonus: 0.50, desc: 'Thiên Địa Hội Tụ: tất cả +50%!' },

  items: {
    machDo: {
      id: 'machDo', name: 'Mạch Đồ', type: 'consumable', rarity: 'epic',
      desc: 'Reveal vị trí 1 Linh Mạch trên minimap trong 10 phút.',
      effect: { revealLeyLine: true }, sellPrice: 300
    }
  }
};

// ─────────────────────────────────────────────────────────────

const FAIRY_POCKET_CONFIG = {
  portalChance: 0.05,
  portalLifetime: 60000,
  sessionDuration: 120000,
  warningTime: 10000,
  completionBonus: 0.20,

  types: {
    flower: {
      id: 'flower', name: '🌸 Hoa Thần Động',
      bgColor: '#1a0a1a', tileColor: '#2d1b2d', accentColor: '#f48fb1',
      enemyLevelMul: 0.8, enemyCountMul: 2.0,
      lootMul: 3.0,
      lootTable: [
        { id: 'hpPotion', chance: 0.8, count: 3 },
        { id: 'mpPotion', chance: 0.8, count: 3 },
        { id: 'realmPill', chance: 0.3, count: 1 },
        { id: 'cotichManhFragment', chance: 0.5, count: 1 }
      ]
    },
    hell: {
      id: 'hell', name: '🔥 Hỏa Ngục Khảo Trường',
      bgColor: '#1a0800', tileColor: '#2d1000', accentColor: '#ff4500',
      enemyLevelMul: 2.0, enemyCountMul: 1.0,
      clearBonus: true,
      clearTimeLimit: 90000,
      lootTable: [
        { id: 'flameSword', chance: 0.10, count: 1 },
        { id: 'dragonScale', chance: 0.30, count: 2 },
        { id: 'cotichManhFragment', chance: 0.6, count: 2 }
      ],
      jackpotLoot: [
        { id: 'celestialOrb', chance: 0.5, count: 3 },
        { id: 'celestialSword', chance: 0.08, count: 1 }
      ]
    },
    ice: {
      id: 'ice', name: '❄️ Băng Cung Bí Khố',
      bgColor: '#0a0a1a', tileColor: '#1a1a2e', accentColor: '#80deea',
      enemyLevelMul: 0, enemyCountMul: 0,
      chestCount: 5,
      trapChance: 0.40,
      trapDamage: 0.20,
      lootTable: [
        { id: 'frostSword', chance: 0.10, count: 1 },
        { id: 'spiritStone', chance: 0.6, count: 3 },
        { id: 'cotichManhFragment', chance: 0.4, count: 1 },
        { id: 'celestialJade', chance: 0.08, count: 1 }
      ]
    }
  },

  cotichManhItem: {
    id: 'cotichManhFragment', name: 'Cổ Tích Mảnh', type: 'material', rarity: 'epic',
    desc: 'Mảnh từ Cổ Tích Cảnh. Thu thập 10 mảnh để đổi vật phẩm đặc biệt.',
    sellPrice: 500
  },
  cotichExchange: {
    cost: 10,
    rewards: [
      { id: 'celestialSword', count: 1 },
      { id: 'celestialRobe', count: 1 },
      { id: 'celestialOrb', count: 5 }
    ]
  },

  maxRecords: 5
};

// ─────────────────────────────────────────────────────────────

const ANCIENT_TOMB_CONFIG = {
  resetInterval: 24 * 60 * 60 * 1000,

  tombs: [
    { tier: 1, name: 'Cổ Mộ',    color: '#9e9e9e',
      condition: { night: true },
      lootTier: 'common', roomCount: 3 },
    { tier: 2, name: 'Linh Mộ',  color: '#4caf50',
      condition: { night: true, weather: 'rain' },
      lootTier: 'rare', roomCount: 4 },
    { tier: 3, name: 'Thiên Mộ', color: '#e040fb',
      condition: { night: true, weather: 'rain', minRealm: 3 },
      lootTier: 'epic', roomCount: 5 }
  ],

  roomTypes: {
    combat:   { name: 'Chiến Đấu', desc: 'Giết hết quái để tiến vào.',
                enemyCount: { min: 3, max: 6 } },
    trap:     { name: 'Bẫy Thạch', desc: 'Simon Says — nhớ và tap đúng sequence.',
                sequenceLength: { min: 3, max: 5 }, timeLimit: 8000 },
    reward:   { name: 'Bảo Khố',   desc: 'Rương kho báu.',
                chestCount: { min: 1, max: 2 } },
    miniboss: { name: 'Mộ Chủ',    desc: 'Boss guardian canh giữ.',
                bossLevelBonus: 5 }
  },

  roomPattern: function(count) {
    const types = [];
    for (let i = 0; i < count - 2; i++) {
      const r = Math.random();
      types.push(r < 0.4 ? 'combat' : r < 0.6 ? 'trap' : 'reward');
    }
    types.push('reward');
    types.push('miniboss');
    return types;
  },

  deathPenalty: 0.05,

  lootTables: {
    common: [{ id: 'wolfFang', c: 0.8, n: 3 }, { id: 'demonCore', c: 0.5, n: 1 }, { id: 'spiritStone', c: 0.3, n: 1 }],
    rare:   [{ id: 'demonCore', c: 0.8, n: 2 }, { id: 'dragonScale', c: 0.3, n: 1 }, { id: 'realmPill', c: 0.4, n: 1 }],
    epic:   [{ id: 'dragonScale', c: 0.6, n: 2 }, { id: 'celestialOrb', c: 0.2, n: 1 }, { id: 'flameSword', c: 0.1, n: 1 }]
  },

  tombCompassItem: {
    id: 'tombCompass', name: 'Mộ La Bàn', type: 'consumable', rarity: 'rare',
    desc: 'Sense được Thần Mộ trong vòng 300px.',
    effect: { senseNearbyTomb: true }, sellPrice: 200
  }
};

// ============================================================
// SECTION 2 — UTILITY HELPERS (local safe wrappers)
// ============================================================

const _WE_Utils = {
  dist(x1, y1, x2, y2) {
    const dx = x2 - x1, dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  },
  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  chance(p) {
    return Math.random() < p;
  },
  angle(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
  }
};

// Prefer project Utils if available
function _u_dist(x1, y1, x2, y2)   { return (typeof Utils !== 'undefined') ? Utils.dist(x1, y1, x2, y2)         : _WE_Utils.dist(x1, y1, x2, y2); }
function _u_rand(min, max)          { return (typeof Utils !== 'undefined') ? Utils.randomInt(min, max)            : _WE_Utils.randomInt(min, max); }
function _u_chance(p)               { return (typeof Utils !== 'undefined') ? Utils.chance(p)                      : _WE_Utils.chance(p); }

// ============================================================
// SECTION 3 — LEY LINE SYSTEM
// ============================================================

const LeyLineSystem = (function() {

  const state = {
    lines: [],
    activeLineId: null,
    lastConvergenceCheck: 0,
    _thunderDmgTimer: 0,
    _regen_timer: 0
  };

  // ─── Generate lines for current map ───────────────────────
  function generateForMap() {
    state.lines = [];
    const types = Object.keys(LEY_LINE_CONFIG.types);
    const interval = LEY_LINE_CONFIG.moveInterval;

    for (let i = 0; i < LEY_LINE_CONFIG.count; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      let tx, ty, attempts = 0;
      do {
        tx = 5 + Math.floor(Math.random() * (CONFIG.WORLD_WIDTH - 10));
        ty = 5 + Math.floor(Math.random() * (CONFIG.WORLD_HEIGHT - 10));
        attempts++;
      } while (Maps.isWater(tx, ty) && attempts < 50);

      const now = (typeof GameState !== 'undefined') ? GameState.time : Date.now();
      state.lines.push({
        id: 'll_' + i,
        type: type,
        x: tx * CONFIG.TILE_SIZE + 16,
        y: ty * CONFIG.TILE_SIZE + 16,
        nextMoveTime: now + _u_rand(interval.min, interval.max),
        revealed: false,
        revealEndTime: 0
      });
    }
  }

  // ─── Remove ley line buffs ─────────────────────────────────
  function removeLeyLineBuff() {
    if (typeof Player === 'undefined') return;
    delete Player._leyLineBuff;
    state._regen_timer = 0;
    state._thunderDmgTimer = 0;
    if (typeof Enemies !== 'undefined') {
      Enemies.list.forEach(e => delete e._leyLineBoost);
    }
  }

  // ─── Apply ley line buff ────────────────────────────────────
  function applyLeyLineBuff(line, dt) {
    if (typeof Player === 'undefined') return;
    const cfg = LEY_LINE_CONFIG.types[line.type];
    Player._leyLineBuff = line.type;

    if (line.type === 'water') {
      state._regen_timer += dt;
      if (state._regen_timer >= 1000) {
        state._regen_timer -= 1000;
        const hpRegen = Math.floor(Player.maxHp * 0.01 * cfg.buff.hpRegenMul);
        const mpRegen = Math.floor(Player.maxMp * 0.01 * cfg.buff.mpRegenMul);
        Player.hp = Math.min(Player.maxHp, Player.hp + hpRegen);
        Player.mp = Math.min(Player.maxMp, Player.mp + mpRegen);
      }
    }

    if (line.type === 'thunder') {
      state._thunderDmgTimer += dt;
      if (state._thunderDmgTimer >= 5000) {
        state._thunderDmgTimer -= 5000;
        const dmg = Math.floor(Player.maxHp * 0.03);
        if (typeof Player.takeDamage === 'function') {
          Player.takeDamage(dmg, 'Lôi Mạch');
        } else {
          Player.hp = Math.max(1, Player.hp - dmg);
        }
        if (typeof Game !== 'undefined' && typeof Game.spawnDamageNumber === 'function') {
          Game.spawnDamageNumber(Player.x, Player.y - 20, '-' + dmg + ' ⚡', '#ffeb3b');
        }
      }
    }

    if (line.type === 'fire' && typeof Enemies !== 'undefined') {
      Enemies.list.forEach(e => {
        if (!e.alive) return;
        const ed = _u_dist(e.x, e.y, line.x, line.y);
        if (ed < 200) e._leyLineBoost = true;
        else delete e._leyLineBoost;
      });
    }
  }

  // ─── Check convergence ─────────────────────────────────────
  function checkConvergence() {
    if (typeof Player === 'undefined' || typeof GameState === 'undefined') return;
    const now = GameState.time;

    for (let i = 0; i < state.lines.length; i++) {
      for (let j = i + 1; j < state.lines.length; j++) {
        const d = _u_dist(state.lines[i].x, state.lines[i].y,
                          state.lines[j].x, state.lines[j].y);
        if (d < LEY_LINE_CONFIG.convergenceRadius) {
          const midX = (state.lines[i].x + state.lines[j].x) / 2;
          const midY = (state.lines[i].y + state.lines[j].y) / 2;
          const pd = _u_dist(Player.x, Player.y, midX, midY);
          if (pd < 60 && !Player._convergenceActive) {
            Player._convergenceActive = true;
            Player._convergenceEndTime = now + LEY_LINE_CONFIG.convergenceDuration;
            if (typeof UI !== 'undefined') {
              UI.showNotification('✨ Thiên Địa Hội Tụ!', LEY_LINE_CONFIG.convergenceBuff.desc);
            }
          }
        }
      }
    }

    if (Player._convergenceActive && now > Player._convergenceEndTime) {
      delete Player._convergenceActive;
      delete Player._convergenceEndTime;
      if (typeof Player.recalculateStats === 'function') Player.recalculateStats();
    }
  }

  // ─── Update ────────────────────────────────────────────────
  function update(dt) {
    if (typeof GameState === 'undefined' || typeof Player === 'undefined') return;
    if (typeof Maps === 'undefined') return;

    const now = GameState.time;
    const interval = LEY_LINE_CONFIG.moveInterval;

    // Move expired lines + reveal expiry
    state.lines.forEach(line => {
      if (now >= line.nextMoveTime) {
        line.nextMoveTime = now + _u_rand(interval.min, interval.max);
        let tx, ty, attempts = 0;
        do {
          tx = 5 + Math.floor(Math.random() * (CONFIG.WORLD_WIDTH - 10));
          ty = 5 + Math.floor(Math.random() * (CONFIG.WORLD_HEIGHT - 10));
          attempts++;
        } while (Maps.isWater(tx, ty) && attempts < 50);
        line.x = tx * CONFIG.TILE_SIZE + 16;
        line.y = ty * CONFIG.TILE_SIZE + 16;
        line.revealed = false;
        if (state.activeLineId === line.id) {
          state.activeLineId = null;
          removeLeyLineBuff();
        }
      }
      if (line.revealed && now > line.revealEndTime) {
        line.revealed = false;
      }
    });

    // Check player proximity
    state.activeLineId = null;
    let foundActive = false;

    for (const line of state.lines) {
      const dist = _u_dist(Player.x, Player.y, line.x, line.y);

      // Detect vibration (between detect and activate)
      if (dist <= LEY_LINE_CONFIG.detectRadius && dist > LEY_LINE_CONFIG.activateRadius) {
        if (Math.random() < 0.01 && typeof Game !== 'undefined' && Game.canvas) {
          const ox = (Math.random() * 2 - 1).toFixed(1);
          const oy = (Math.random() * 2 - 1).toFixed(1);
          Game.canvas.style.transform = `translate(${ox}px,${oy}px)`;
          setTimeout(() => { if (Game.canvas) Game.canvas.style.transform = ''; }, 100);
        }
        if (Math.random() < 0.02 && typeof GameState !== 'undefined') {
          const cfg = LEY_LINE_CONFIG.types[line.type];
          const angle = Math.atan2(Player.y - line.y, Player.x - line.x);
          GameState.particles.push({
            x: line.x + Math.cos(angle) * 30,
            y: line.y + Math.sin(angle) * 30,
            vx: (Math.random() - 0.5) * 0.5,
            vy: -0.5,
            life: 500, color: cfg.color, size: 2 + Math.random()
          });
        }
      }

      if (!foundActive && dist <= LEY_LINE_CONFIG.activateRadius) {
        foundActive = true;
        state.activeLineId = line.id;
        applyLeyLineBuff(line, dt);

        // Track for TiemKiemPho (Thiên Kiếm Phổ)
        if (typeof TiemKiemPho !== 'undefined' && TiemKiemPho.state &&
            TiemKiemPho.state.currentProgress) {
          const prog = TiemKiemPho.state.currentProgress;
          if (!Array.isArray(prog.lingMachStood)) prog.lingMachStood = [];
          if (!prog.lingMachStood.includes(line.id)) {
            prog.lingMachStood.push(line.id);
          }
        }

        // Update HUD
        _updateLeyLineHUD(line);
      }
    }

    if (!foundActive) {
      removeLeyLineBuff();
      _hideLeyLineHUD();
    }

    checkConvergence();
  }

  // ─── Render (world-space) ──────────────────────────────────
  function render(ctx) {
    if (typeof GameState === 'undefined' || typeof Player === 'undefined') return;

    state.lines.forEach(line => {
      const dist = _u_dist(Player.x, Player.y, line.x, line.y);
      const isDetectable = dist <= LEY_LINE_CONFIG.detectRadius;
      const isActive = state.activeLineId === line.id;
      const isRevealed = line.revealed;

      if (!isDetectable && !isRevealed) return;

      const cx = line.x - GameState.camera.x;
      const cy = line.y - GameState.camera.y;
      const cfg = LEY_LINE_CONFIG.types[line.type];
      const pulse = 0.3 + Math.sin(GameState.time / 300) * 0.2;
      const alpha = isActive ? 0.8 : isDetectable ? 0.4 : 0.6;

      const radius = isActive ? 35 + Math.sin(GameState.time / 200) * 5 : 25;

      ctx.save();

      // Ground circle glow
      ctx.globalAlpha = alpha * pulse;
      ctx.strokeStyle = cfg.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.globalAlpha = alpha * 0.2;
      ctx.fillStyle = cfg.color;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 1;

      // Icon + label when active
      if (isActive) {
        ctx.font = '16px serif';
        ctx.textAlign = 'center';
        ctx.fillText(cfg.icon, cx, cy - 30);
        ctx.fillStyle = cfg.color;
        ctx.font = '9px monospace';
        ctx.fillText(cfg.name, cx, cy - 42);
      }

      // Particles when active
      if (isActive && Math.random() < 0.05 && typeof GameState !== 'undefined') {
        const a = Math.random() * Math.PI * 2;
        GameState.particles.push({
          x: line.x + Math.cos(a) * radius,
          y: line.y + Math.sin(a) * radius,
          vx: Math.cos(a) * 1,
          vy: -1.5 - Math.random(),
          life: 500, color: cfg.color, size: 2 + Math.random() * 2
        });
      }

      ctx.restore();
    });
  }

  // ─── HUD helpers ───────────────────────────────────────────
  function _updateLeyLineHUD(line) {
    const hud = document.getElementById('leyLineHUD');
    if (!hud) return;
    const cfg = LEY_LINE_CONFIG.types[line.type];
    const iconEl = document.getElementById('leyLineIcon');
    const nameEl = document.getElementById('leyLineName');
    const effectEl = document.getElementById('leyLineEffect');
    if (iconEl) iconEl.textContent = cfg.icon + ' ';
    if (nameEl) { nameEl.textContent = cfg.name; nameEl.style.color = cfg.color; }
    if (effectEl) effectEl.textContent = cfg.desc;
    hud.style.display = 'block';
    hud.style.borderColor = cfg.color;
  }

  function _hideLeyLineHUD() {
    const hud = document.getElementById('leyLineHUD');
    if (hud) hud.style.display = 'none';
  }

  // ─── Get nearest revealed/closest line ─────────────────────
  function getNearestLine() {
    if (!state.lines.length || typeof Player === 'undefined') return null;
    return state.lines.reduce((nearest, line) => {
      const d = _u_dist(Player.x, Player.y, line.x, line.y);
      const dn = nearest ? _u_dist(Player.x, Player.y, nearest.x, nearest.y) : Infinity;
      return d < dn ? line : nearest;
    }, null);
  }

  // ─── Render minimap markers ─────────────────────────────────
  function renderMinimap(mctx, scale) {
    state.lines.forEach(line => {
      if (!line.revealed) return;
      const cfg = LEY_LINE_CONFIG.types[line.type];
      const mx = line.x * scale;
      const my = line.y * scale;
      mctx.fillStyle = cfg.color;
      mctx.beginPath();
      mctx.arc(mx, my, 3, 0, Math.PI * 2);
      mctx.fill();
    });
  }

  return {
    state,
    generateForMap,
    update,
    render,
    renderMinimap,
    removeLeyLineBuff,
    getNearestLine,
    _updateLeyLineHUD,
    _hideLeyLineHUD
  };
})();

// ============================================================
// SECTION 4 — FAIRY POCKET SYSTEM
// ============================================================

const FairyPocket = (function() {

  const state = {
    portalX: 0, portalY: 0, portalActive: false,
    portalSpawnTime: 0,
    inPocket: false,
    pocketType: null,
    sessionStart: 0,
    timeRemaining: 0,
    killCount: 0,
    hellClearTimer: 0,
    hellCleared: false,
    iceChests: [],
    savedState: null,
    records: [],
    simonSequence: [],
    cotichManhCount: 0
  };

  // ─── Try spawn portal after boss kill ─────────────────────
  function trySpawnPortal(bossX, bossY) {
    if (!_u_chance(FAIRY_POCKET_CONFIG.portalChance)) return;
    if (state.portalActive || state.inPocket) return;

    state.portalX = bossX;
    state.portalY = bossY;
    state.portalActive = true;
    state.portalSpawnTime = (typeof GameState !== 'undefined') ? GameState.time : Date.now();

    if (typeof UI !== 'undefined') {
      UI.addLog('✨ Cổng Cổ Tích xuất hiện! (60 giây)', 'realm');
      UI.showNotification('✨ Cổng Bí Ảnh!', 'Bước vào trong 60 giây!');
    }
  }

  // ─── Generate pocket map (20×20) ──────────────────────────
  function generatePocketMap(cfg) {
    const w = 20, h = 20;
    Maps.tiles = [];
    for (let y = 0; y < h; y++) {
      Maps.tiles[y] = [];
      for (let x = 0; x < w; x++) {
        Maps.tiles[y][x] = (x === 0 || y === 0 || x === w - 1 || y === h - 1) ? 1 : 0;
      }
    }
    Maps.objects = [];
    Enemies.list = [];

    if (cfg.enemyCountMul > 0) {
      const count = Math.floor(8 * cfg.enemyCountMul);
      const mapEnemies = Maps.data[Maps.currentIndex]
        ? Maps.data[Maps.currentIndex].enemies
        : ['wolf', 'ghost'];
      for (let i = 0; i < count; i++) {
        const type = mapEnemies[Math.floor(Math.random() * mapEnemies.length)];
        const e = Enemies.spawn(type, cfg.enemyLevelMul, Player.level);
        if (e) {
          e.x = (2 + Math.floor(Math.random() * 16)) * CONFIG.TILE_SIZE + 16;
          e.y = (2 + Math.floor(Math.random() * 16)) * CONFIG.TILE_SIZE + 16;
          e._pocketEnemy = true;
        }
      }
    }

    Player.x = 10 * CONFIG.TILE_SIZE + 16;
    Player.y = 10 * CONFIG.TILE_SIZE + 16;
  }

  // ─── Generate ice chests ───────────────────────────────────
  function generateIceChests(cfg) {
    state.iceChests = [];
    for (let i = 0; i < cfg.chestCount; i++) {
      state.iceChests.push({
        x: (3 + Math.floor(Math.random() * 14)) * CONFIG.TILE_SIZE + 16,
        y: (3 + Math.floor(Math.random() * 14)) * CONFIG.TILE_SIZE + 16,
        opened: false,
        trapped: _u_chance(cfg.trapChance)
      });
    }
  }

  // ─── Enter pocket ─────────────────────────────────────────
  function enter() {
    if (!state.portalActive || state.inPocket) return false;

    const typeKeys = ['flower', 'hell', 'ice'];
    state.pocketType = typeKeys[Math.floor(Math.random() * typeKeys.length)];
    const cfg = FAIRY_POCKET_CONFIG.types[state.pocketType];

    // Save state
    state.savedState = {
      mapIndex: Maps.currentIndex,
      tiles: JSON.parse(JSON.stringify(Maps.tiles)),
      objects: [...Maps.objects],
      enemies: [...Enemies.list],
      playerX: Player.x,
      playerY: Player.y
    };

    generatePocketMap(cfg);

    state.inPocket = true;
    state.portalActive = false;
    state.sessionStart = (typeof GameState !== 'undefined') ? GameState.time : Date.now();
    state.timeRemaining = FAIRY_POCKET_CONFIG.sessionDuration;
    state.killCount = 0;
    state.hellCleared = false;
    state.hellClearTimer = 0;

    if (state.pocketType === 'ice') generateIceChests(cfg);

    PocketHUD.show(cfg);

    if (typeof UI !== 'undefined') {
      UI.showNotification(cfg.name, '2 phút khám phá!');
      const msg = state.pocketType === 'ice' ? 'Tìm rương!' :
                  state.pocketType === 'hell' ? 'Giết hết trong 90s!' : 'Tiêu diệt quái!';
      UI.addLog(cfg.name + ': ' + msg, 'system');
    }
    return true;
  }

  // ─── Open ice chest ───────────────────────────────────────
  function openIceChest(i) {
    const chest = state.iceChests[i];
    if (!chest || chest.opened) return;
    chest.opened = true;

    const cfg = FAIRY_POCKET_CONFIG.types.ice;
    if (chest.trapped) {
      const dmg = Math.floor(Player.maxHp * cfg.trapDamage);
      if (typeof Player.takeDamage === 'function') {
        Player.takeDamage(dmg, 'Bẫy Rương');
      } else {
        Player.hp = Math.max(1, Player.hp - dmg);
      }
      if (typeof Game !== 'undefined' && typeof Game.spawnDamageNumber === 'function') {
        Game.spawnDamageNumber(chest.x, chest.y - 20, '-' + dmg, '#f44336');
      }
      if (typeof UI !== 'undefined') UI.addLog('💥 Rương có bẫy!', 'system');
      if (typeof LuckSystem !== 'undefined') LuckSystem.addLuck(-10);
    } else {
      cfg.lootTable.forEach(l => {
        if (_u_chance(l.chance)) Inventory.add(l.id, l.count);
      });
      if (typeof UI !== 'undefined') UI.addLog('📦 Mở rương băng! Nhận đồ.', 'item');
    }
  }

  // ─── Grant jackpot loot (hell cleared) ────────────────────
  function grantJackpotLoot() {
    const jp = FAIRY_POCKET_CONFIG.types.hell.jackpotLoot;
    jp.forEach(l => {
      if (_u_chance(l.chance)) Inventory.add(l.id, l.count);
    });
    if (typeof UI !== 'undefined') {
      UI.showNotification('🔥 Jackpot!', 'Hỏa Ngục Khảo Trường hoàn thành!');
      UI.addLog('🔥 Jackpot loot nhận được!', 'item');
    }
  }

  // ─── Exit pocket ──────────────────────────────────────────
  function exitPocket(voluntary) {
    if (!state.inPocket) return;
    state.inPocket = false;
    state.iceChests = [];

    const now = (typeof GameState !== 'undefined') ? GameState.time : Date.now();
    const elapsed = now - state.sessionStart;
    const survived = elapsed >= FAIRY_POCKET_CONFIG.sessionDuration * 0.95;

    if (survived && voluntary === false) {
      if (typeof Inventory !== 'undefined') Inventory.add('cotichManhFragment', 1);
      if (typeof UI !== 'undefined') UI.addLog('✨ Bonus sinh tồn! +1 Cổ Tích Mảnh', 'item');
    }

    // Record
    state.records.unshift({
      type: state.pocketType,
      timeMs: elapsed,
      lootCount: 0,
      date: Date.now()
    });
    if (state.records.length > FAIRY_POCKET_CONFIG.maxRecords) state.records.pop();

    // Restore
    if (state.savedState) {
      Maps.tiles    = state.savedState.tiles;
      Maps.objects  = state.savedState.objects;
      Enemies.list  = state.savedState.enemies;
      Player.x      = state.savedState.playerX;
      Player.y      = state.savedState.playerY;
    }

    PocketHUD.hide();
    if (typeof UI !== 'undefined') UI.addLog('✨ Rời Cổ Tích Cảnh.', 'system');
    state.savedState = null;
  }

  // ─── Update ───────────────────────────────────────────────
  function update(dt) {
    if (typeof GameState === 'undefined') return;

    // Portal expiry
    if (state.portalActive) {
      if (GameState.time - state.portalSpawnTime > FAIRY_POCKET_CONFIG.portalLifetime) {
        state.portalActive = false;
        if (typeof UI !== 'undefined') UI.addLog('✨ Cổng Cổ Tích đã đóng...', 'system');
      }
    }

    if (!state.inPocket) return;

    state.timeRemaining -= dt;
    PocketHUD.updateTimer(state.timeRemaining);

    // Hell: track clear
    if (state.pocketType === 'hell' && !state.hellCleared) {
      state.hellClearTimer += dt;
      const allDead = Enemies.list
        .filter(e => e._pocketEnemy)
        .every(e => !e.alive);
      if (allDead && Enemies.list.filter(e => e._pocketEnemy).length > 0 &&
          state.hellClearTimer <= FAIRY_POCKET_CONFIG.types.hell.clearTimeLimit) {
        state.hellCleared = true;
        grantJackpotLoot();
      }
    }

    // Warning before kick
    if (state.timeRemaining <= FAIRY_POCKET_CONFIG.warningTime &&
        state.timeRemaining > FAIRY_POCKET_CONFIG.warningTime - 200) {
      if (typeof UI !== 'undefined') UI.addLog('⚠️ Cổng sắp đóng trong 10 giây!', 'system');
    }

    if (state.timeRemaining <= 0) {
      exitPocket(false);
      return;
    }

    // Ice chest proximity
    if (state.pocketType === 'ice' && typeof Player !== 'undefined') {
      state.iceChests.forEach((chest, i) => {
        if (chest.opened) return;
        const d = _u_dist(Player.x, Player.y, chest.x, chest.y);
        if (d < 50) openIceChest(i);
      });
    }
  }

  // ─── Render portal (world-space) ──────────────────────────
  function renderPortal(ctx) {
    if (!state.portalActive || typeof GameState === 'undefined') return;

    const cx = state.portalX - GameState.camera.x;
    const cy = state.portalY - GameState.camera.y;
    const t = GameState.time;
    const pulse = 0.6 + Math.sin(t / 200) * 0.4;

    ctx.save();
    ctx.globalAlpha = pulse;

    // Outer glow ring
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 40);
    grad.addColorStop(0, '#f48fb1aa');
    grad.addColorStop(0.5, '#9c27b088');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, 40, 0, Math.PI * 2);
    ctx.fill();

    // Portal ring
    ctx.strokeStyle = '#f48fb1';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, 25, 0, Math.PI * 2);
    ctx.stroke();

    ctx.globalAlpha = 1;
    ctx.font = '20px serif';
    ctx.textAlign = 'center';
    ctx.fillText('✨', cx, cy + 7);

    ctx.fillStyle = '#f48fb1';
    ctx.font = '9px monospace';
    ctx.fillText('Cổng Bí Ảnh', cx, cy - 32);

    ctx.restore();
  }

  // ─── Render ice chests (world-space) ──────────────────────
  function renderIceChests(ctx) {
    if (!state.inPocket || state.pocketType !== 'ice') return;
    if (typeof GameState === 'undefined') return;

    state.iceChests.forEach(chest => {
      if (chest.opened) return;
      const cx = chest.x - GameState.camera.x;
      const cy = chest.y - GameState.camera.y;

      ctx.save();
      ctx.fillStyle = '#80deea';
      ctx.strokeStyle = '#4dd0e1';
      ctx.lineWidth = 2;
      ctx.fillRect(cx - 12, cy - 10, 24, 20);
      ctx.strokeRect(cx - 12, cy - 10, 24, 20);
      ctx.fillStyle = '#fff';
      ctx.font = '14px serif';
      ctx.textAlign = 'center';
      ctx.fillText('❄️', cx, cy + 6);
      ctx.restore();
    });
  }

  return {
    state,
    trySpawnPortal,
    enter,
    exitPocket,
    update,
    renderPortal,
    renderIceChests,
    openIceChest,
    grantJackpotLoot
  };
})();

// ─── Pocket HUD ────────────────────────────────────────────────
const PocketHUD = {
  show(cfg) {
    const hud = document.getElementById('pocketHUD');
    if (!hud) return;
    const nameEl = document.getElementById('pocketName');
    if (nameEl) { nameEl.textContent = cfg.name; nameEl.style.color = cfg.accentColor; }
    hud.style.borderColor = cfg.accentColor;
    hud.style.display = 'block';
    this.updateTimer(FAIRY_POCKET_CONFIG.sessionDuration);
  },
  hide() {
    const hud = document.getElementById('pocketHUD');
    if (hud) hud.style.display = 'none';
  },
  updateTimer(ms) {
    const el = document.getElementById('pocketTimer');
    if (!el) return;
    const s = Math.max(0, Math.ceil(ms / 1000));
    const m = Math.floor(s / 60);
    const sec = s % 60;
    el.textContent = m + ':' + String(sec).padStart(2, '0');
    el.style.color = ms <= 10000 ? '#f44336' : '#ffffff';
  }
};

// ============================================================
// SECTION 5 — ANCIENT TOMB SYSTEM
// ============================================================

const AncientTomb = (function() {

  const state = {
    tombData: {},
    inTomb: false,
    currentTomb: null,
    simonSequence: [],
    simonPlayerInput: [],
    simonActive: false,
    simonTimeLeft: 0,
    roomEnemiesCleared: false,
    _tombBossKilled: false,
    _compassPing: false
  };

  // ─── Get tomb data for map ─────────────────────────────────
  function getTombsForMap(mapIndex) {
    if (!state.tombData[mapIndex]) {
      state.tombData[mapIndex] = ANCIENT_TOMB_CONFIG.tombs.map(t => ({
        tier: t.tier, lastReset: 0, cleared: false
      }));
    }
    return state.tombData[mapIndex];
  }

  // ─── Check availability ────────────────────────────────────
  function isAvailable(tombTier) {
    const cfg = ANCIENT_TOMB_CONFIG.tombs.find(t => t.tier === tombTier);
    if (!cfg) return false;
    const now = Date.now();
    const data = getTombsForMap(Maps.currentIndex).find(d => d.tier === tombTier);
    if (!data) return false;
    if (now - data.lastReset < ANCIENT_TOMB_CONFIG.resetInterval) return false;

    const cond = cfg.condition;
    let isNight = true;
    let weather = 'clear';
    if (typeof WorldSystem !== 'undefined') {
      isNight = WorldSystem.state.isNight;
      weather = WorldSystem.state.weather;
    }

    if (cond.night && !isNight) return false;
    if (cond.weather && weather !== cond.weather) return false;
    if (cond.minRealm && typeof Player !== 'undefined' && Player.realm < cond.minRealm) return false;
    return true;
  }

  // ─── Load tomb room ────────────────────────────────────────
  function loadTombRoom(roomIdx) {
    const tomb = state.currentTomb;
    if (!tomb) return;
    const room = tomb.rooms[roomIdx];
    if (!room) { exitTomb(true); return; }

    const w = 15, h = 15;
    Maps.tiles = [];
    for (let y = 0; y < h; y++) {
      Maps.tiles[y] = [];
      for (let x = 0; x < w; x++) {
        Maps.tiles[y][x] = (x === 0 || y === 0 || x === w - 1 || y === h - 1) ? 1 : 0;
      }
    }
    Maps.objects = [];
    Enemies.list = [];

    Player.x = 7 * CONFIG.TILE_SIZE + 16;
    Player.y = 7 * CONFIG.TILE_SIZE + 16;
    state.roomEnemiesCleared = false;
    state._tombBossKilled = false;

    const savedMapIdx = tomb.savedState ? tomb.savedState.mapIndex : 0;
    const mapEnemies = (Maps.data[savedMapIdx] && Maps.data[savedMapIdx].enemies)
      ? Maps.data[savedMapIdx].enemies
      : ['wolf'];

    switch (room.type) {
      case 'combat': {
        const count = _u_rand(
          ANCIENT_TOMB_CONFIG.roomTypes.combat.enemyCount.min,
          ANCIENT_TOMB_CONFIG.roomTypes.combat.enemyCount.max
        );
        for (let i = 0; i < count; i++) {
          const typeKey = mapEnemies[Math.floor(Math.random() * mapEnemies.length)];
          const e = Enemies.spawn(typeKey, 1.5, Player.level + 3);
          if (e) {
            e.x = (3 + Math.floor(Math.random() * 9)) * CONFIG.TILE_SIZE + 16;
            e.y = (3 + Math.floor(Math.random() * 9)) * CONFIG.TILE_SIZE + 16;
            e._tombEnemy = true;
          }
        }
        TombHUD.updateRoom(room.type, 'Giết hết quái để tiến vào');
        break;
      }

      case 'trap': {
        const seqLen = _u_rand(
          ANCIENT_TOMB_CONFIG.roomTypes.trap.sequenceLength.min,
          ANCIENT_TOMB_CONFIG.roomTypes.trap.sequenceLength.max
        );
        const dirs = ['N', 'S', 'E', 'W'];
        state.simonSequence = Array.from({ length: seqLen },
          () => dirs[Math.floor(Math.random() * 4)]);
        state.simonPlayerInput = [];
        state.simonActive = true;
        state.simonTimeLeft = ANCIENT_TOMB_CONFIG.roomTypes.trap.timeLimit;
        TombSimonHUD.show(state.simonSequence);
        TombHUD.updateRoom(room.type, 'Nhớ và nhập đúng sequence!');
        break;
      }

      case 'reward': {
        const chestCount = _u_rand(
          ANCIENT_TOMB_CONFIG.roomTypes.reward.chestCount.min,
          ANCIENT_TOMB_CONFIG.roomTypes.reward.chestCount.max
        );
        for (let i = 0; i < chestCount; i++) {
          Maps.objects.push({
            type: 'chest',
            x: (5 + Math.floor(Math.random() * 5)) * CONFIG.TILE_SIZE,
            y: (5 + Math.floor(Math.random() * 5)) * CONFIG.TILE_SIZE,
            _tombChest: true
          });
        }
        state.roomEnemiesCleared = true;
        TombHUD.updateRoom(room.type, 'Thu thập rương. Đến cửa để tiến.');
        // Auto-place door for non-combat rooms
        Maps.objects.push({
          type: 'door',
          x: 7 * CONFIG.TILE_SIZE, y: 1 * CONFIG.TILE_SIZE,
          _tombDoor: true
        });
        break;
      }

      case 'miniboss': {
        const typeKey = mapEnemies[0];
        const boss = Enemies.spawn(typeKey, 3.0,
          Player.level + ANCIENT_TOMB_CONFIG.roomTypes.miniboss.bossLevelBonus);
        if (boss) {
          boss.x = 7 * CONFIG.TILE_SIZE + 16;
          boss.y = 4 * CONFIG.TILE_SIZE + 16;
          boss.boss = true;
          boss.name = '【墓主】' + boss.name;
          boss._tombBoss = true;
        }
        TombHUD.updateRoom(room.type, '【墓主】— Giết Boss để nhận loot!');
        break;
      }
    }

    TombHUD.updateProgress(roomIdx, tomb.rooms.length);
  }

  // ─── Next room ─────────────────────────────────────────────
  function nextRoom() {
    if (!state.currentTomb) return;
    state.currentTomb.currentRoom++;
    loadTombRoom(state.currentTomb.currentRoom);
  }

  // ─── Grant tomb loot ───────────────────────────────────────
  function grantTombLoot() {
    const tier = ANCIENT_TOMB_CONFIG.tombs.find(t => t.tier === state.currentTomb.tier);
    const table = ANCIENT_TOMB_CONFIG.lootTables[tier.lootTier];
    table.forEach(l => {
      if (_u_chance(l.c) && typeof Inventory !== 'undefined') Inventory.add(l.id, l.n);
    });

    const data = getTombsForMap(Maps.currentIndex).find(d => d.tier === state.currentTomb.tier);
    if (data) data.lastReset = Date.now();

    if (typeof UI !== 'undefined') {
      UI.showNotification('⚰️ Thần Mộ Chinh Phục!', tier.name + ' — Loot đã nhận!');
    }
  }

  // ─── Enter tomb ────────────────────────────────────────────
  function enter(tombTier) {
    const cfg = ANCIENT_TOMB_CONFIG.tombs.find(t => t.tier === tombTier);
    if (!isAvailable(tombTier)) {
      if (typeof UI !== 'undefined') UI.addLog('⚰️ Thần Mộ chưa sẵn sàng (điều kiện chưa đủ hoặc đang cooldown).', 'system');
      return false;
    }

    state.currentTomb = {
      tier: tombTier,
      cfg: cfg,
      rooms: ANCIENT_TOMB_CONFIG.roomPattern(cfg.roomCount).map((type, i) => ({
        index: i, type: type, cleared: false
      })),
      currentRoom: 0,
      savedState: {
        mapIndex: Maps.currentIndex,
        tiles: JSON.parse(JSON.stringify(Maps.tiles)),
        objects: [...Maps.objects],
        enemies: [...Enemies.list],
        playerX: Player.x,
        playerY: Player.y,
        gold: Player.gold
      }
    };

    state.inTomb = true;
    TombHUD.show();
    loadTombRoom(0);

    if (typeof UI !== 'undefined') {
      UI.showNotification(cfg.name + ' Tier ' + tombTier, cfg.roomCount + ' phòng');
      UI.addLog('⚰️ Bước vào ' + cfg.name + '!', 'system');
    }
    return true;
  }

  // ─── Exit tomb ─────────────────────────────────────────────
  function exitTomb(success) {
    state.inTomb = false;

    if (!success && typeof Player !== 'undefined') {
      const penalty = Math.floor(Player.gold * ANCIENT_TOMB_CONFIG.deathPenalty);
      Player.gold = Math.max(0, Player.gold - penalty);
      if (typeof UI !== 'undefined') {
        UI.addLog('💀 Chết trong mộ. Mất ' + penalty + ' vàng.', 'system');
        UI.updateGold();
      }
    }

    if (state.currentTomb && state.currentTomb.savedState) {
      const ss = state.currentTomb.savedState;
      Maps.tiles    = ss.tiles;
      Maps.objects  = ss.objects;
      Enemies.list  = ss.enemies;
      Player.x      = ss.playerX;
      Player.y      = ss.playerY;
    }

    TombHUD.hide();
    TombSimonHUD.hide();
    state.currentTomb = null;
    state.simonActive = false;

    if (typeof UI !== 'undefined') UI.addLog('⚰️ Rời Thần Mộ.', 'system');
  }

  // ─── Simon input handler ───────────────────────────────────
  function simonInput(dir) {
    if (!state.simonActive) return;
    state.simonPlayerInput.push(dir);

    const correct = state.simonSequence.slice(0, state.simonPlayerInput.length);
    if (JSON.stringify(state.simonPlayerInput) !== JSON.stringify(correct)) {
      // Wrong input
      state.simonActive = false;
      TombSimonHUD.hide();
      const dmg = Math.floor(Player.maxHp * 0.10);
      if (typeof Player.takeDamage === 'function') {
        Player.takeDamage(dmg, 'Sai Bẫy');
      } else {
        Player.hp = Math.max(1, Player.hp - dmg);
      }
      if (typeof UI !== 'undefined') UI.addLog('❌ Sai thứ tự! Bị phạt ' + dmg + ' damage.', 'system');
      if (state.currentTomb) {
        state.currentTomb.rooms[state.currentTomb.currentRoom].cleared = true;
      }
      state.simonPlayerInput = [];
      setTimeout(() => nextRoom(), 1000);
      return;
    }

    if (state.simonPlayerInput.length >= state.simonSequence.length) {
      // Correct!
      state.simonActive = false;
      TombSimonHUD.hide();
      if (typeof Inventory !== 'undefined') Inventory.add('realmPill', 1);
      if (typeof UI !== 'undefined') UI.addLog('✅ Đúng! Tiến vào phòng kế. +1 Đột Phá Đan', 'system');
      if (state.currentTomb) {
        state.currentTomb.rooms[state.currentTomb.currentRoom].cleared = true;
      }
      state.simonPlayerInput = [];
      setTimeout(() => nextRoom(), 500);
    }
    // Partial match — update display
    TombSimonHUD.updateInput(state.simonPlayerInput);
  }

  // ─── Update ────────────────────────────────────────────────
  function update(dt) {
    if (!state.inTomb || !state.currentTomb) return;

    const tomb = state.currentTomb;
    const room = tomb.rooms[tomb.currentRoom];
    if (!room) return;

    // Simon timer
    if (state.simonActive) {
      state.simonTimeLeft -= dt;
      TombSimonHUD.updateTimer(state.simonTimeLeft);
      if (state.simonTimeLeft <= 0) {
        state.simonActive = false;
        TombSimonHUD.hide();
        if (typeof Player.takeDamage === 'function') {
          Player.takeDamage(Math.floor(Player.maxHp * 0.15), 'Bẫy Thạch');
        }
        if (typeof UI !== 'undefined') UI.addLog('💥 Hết thời gian! Bị phạt damage.', 'system');
        room.cleared = true;
        setTimeout(() => nextRoom(), 1500);
        return;
      }
    }

    // Combat room: check all dead
    if (room.type === 'combat' && !state.roomEnemiesCleared) {
      const remaining = Enemies.list.filter(e => e._tombEnemy && e.alive).length;
      if (remaining === 0 && Enemies.list.filter(e => e._tombEnemy).length > 0) {
        state.roomEnemiesCleared = true;
        room.cleared = true;
        TombHUD.updateRoom(room.type, 'Phòng đã dọn sạch! Đến cửa để tiến.');
        // Reveal exit door
        Maps.objects.push({
          type: 'door',
          x: 7 * CONFIG.TILE_SIZE, y: 1 * CONFIG.TILE_SIZE,
          _tombDoor: true
        });
      }
    }

    // Boss killed
    if (room.type === 'miniboss' && state._tombBossKilled) {
      room.cleared = true;
      grantTombLoot();
      setTimeout(() => exitTomb(true), 2000);
      state._tombBossKilled = false; // prevent repeat
    }
  }

  // ─── Check world tap ──────────────────────────────────────
  function checkWorldTap(worldX, worldY) {
    if (state.inTomb) return false;

    // Entry points (world map objects tagged as tomb)
    let handled = false;
    Maps.objects.forEach(obj => {
      if (!obj._tombEntry) return;
      if (_u_dist(worldX, worldY, obj.x + 16, obj.y + 16) < 60) {
        enter(obj.tombTier || 1);
        handled = true;
      }
    });
    return handled;
  }

  return {
    state,
    getTombsForMap,
    isAvailable,
    enter,
    exitTomb,
    loadTombRoom,
    nextRoom,
    grantTombLoot,
    simonInput,
    update,
    checkWorldTap
  };
})();

// ─── Tomb HUD ──────────────────────────────────────────────────
const TombHUD = {
  show() {
    const hud = document.getElementById('tombHUD');
    if (hud) hud.style.display = 'block';
  },
  hide() {
    const hud = document.getElementById('tombHUD');
    if (hud) hud.style.display = 'none';
    TombSimonHUD.hide();
  },
  updateRoom(type, desc) {
    const el = document.getElementById('tombRoomInfo');
    if (!el) return;
    const cfg = ANCIENT_TOMB_CONFIG.roomTypes[type];
    el.innerHTML = `<span style="color:#f0c040">${cfg ? cfg.name : type}</span><br><span style="color:#aaa;font-size:8px">${desc}</span>`;
  },
  updateProgress(current, total) {
    const el = document.getElementById('tombProgress');
    if (!el) return;
    const dots = Array.from({ length: total }, (_, i) =>
      `<span style="color:${i <= current ? '#7c4dff' : '#555'}">${i < current ? '■' : i === current ? '▶' : '□'}</span>`
    ).join('');
    el.innerHTML = dots;
  }
};

// ─── Simon Says HUD ────────────────────────────────────────────
const TombSimonHUD = {
  show(sequence) {
    const hud = document.getElementById('simonHUD');
    if (!hud) return;
    const dispEl = document.getElementById('simonDisplay');
    const inputEl = document.getElementById('simonInput');
    if (dispEl) {
      const dirMap = { N: '↑', S: '↓', E: '→', W: '←' };
      dispEl.textContent = sequence.map(d => dirMap[d] || d).join(' ');
    }
    if (inputEl) inputEl.textContent = '';
    hud.style.display = 'block';
  },
  hide() {
    const hud = document.getElementById('simonHUD');
    if (hud) hud.style.display = 'none';
  },
  updateTimer(ms) {
    const el = document.getElementById('simonTimer');
    if (!el) return;
    el.textContent = '⏱ ' + Math.max(0, Math.ceil(ms / 1000)) + 's';
    el.style.color = ms < 3000 ? '#f44336' : '#ffeb3b';
  },
  updateInput(arr) {
    const el = document.getElementById('simonInput');
    if (!el) return;
    const dirMap = { N: '↑', S: '↓', E: '→', W: '←' };
    el.textContent = arr.map(d => dirMap[d] || d).join(' ');
  }
};

// ============================================================
// SECTION 6 — HOOKS & INIT
// ============================================================

const WorldEnergyFeature = {

  _saveKey: 'tuxien_world_energy',

  // ─── Inject HTML ──────────────────────────────────────────
  _injectHTML() {
    if (document.getElementById('leyLineHUD')) return; // already injected

    // ── Ley Line Active HUD ──
    const leyHUD = document.createElement('div');
    leyHUD.id = 'leyLineHUD';
    leyHUD.style.cssText = `
      position:absolute; bottom:170px; left:50%;
      transform:translateX(-50%); z-index:25;
      display:none;
      background:rgba(0,0,0,0.82); border:1px solid #555;
      border-radius:8px; padding:4px 12px;
      font-size:10px; text-align:center;
      pointer-events:none; font-family:monospace;
      min-width:180px;
    `;
    leyHUD.innerHTML = `
      <span id="leyLineIcon" style="font-size:13px"></span>
      <span id="leyLineName" style="font-weight:bold"></span>
      <span id="leyLineEffect" style="color:#999;margin-left:8px;font-size:9px"></span>
    `;

    // ── Pocket HUD ──
    const pocketHUD = document.createElement('div');
    pocketHUD.id = 'pocketHUD';
    pocketHUD.style.cssText = `
      display:none; position:absolute; top:55px; left:50%;
      transform:translateX(-50%);
      background:rgba(0,0,0,0.87); border:2px solid #f48fb1;
      border-radius:8px; padding:4px 16px;
      z-index:25; text-align:center; pointer-events:none;
      font-family:monospace;
    `;
    pocketHUD.innerHTML = `
      <div id="pocketName" style="font-size:10px;font-weight:bold;color:#f48fb1"></div>
      <div style="font-size:11px;color:#eee">⏱ <span id="pocketTimer" style="color:#fff">2:00</span></div>
    `;

    // ── Tomb HUD ──
    const tombHUD = document.createElement('div');
    tombHUD.id = 'tombHUD';
    tombHUD.style.cssText = `
      display:none; position:absolute; top:160px; right:10px;
      background:rgba(0,0,0,0.87); border:2px solid #7c4dff;
      border-radius:8px; padding:6px 10px;
      z-index:25; font-size:9px; max-width:110px;
      font-family:monospace; color:#ccc;
    `;
    tombHUD.innerHTML = `
      <div style="color:#7c4dff;margin-bottom:4px;font-size:10px">⚰️ Thần Mộ</div>
      <div id="tombRoomInfo" style="margin-bottom:4px"></div>
      <div id="tombProgress" style="letter-spacing:2px"></div>
    `;

    // ── Simon Says HUD ──
    const simonHUD = document.createElement('div');
    simonHUD.id = 'simonHUD';
    simonHUD.style.cssText = `
      display:none; position:fixed; top:50%; left:50%;
      transform:translate(-50%,-50%);
      background:rgba(0,0,0,0.94);
      border:3px solid #7c4dff;
      border-radius:15px; padding:20px;
      text-align:center; z-index:200;
      min-width:240px; font-family:monospace;
      box-shadow:0 0 30px #7c4dff88;
    `;
    const btnStyle = `
      background:#1a1a2e; color:#f0c040; border:1px solid #7c4dff;
      border-radius:6px; padding:8px 12px; font-size:13px;
      cursor:pointer; font-family:monospace;
    `;
    simonHUD.innerHTML = `
      <div style="color:#7c4dff;margin-bottom:8px;font-size:13px;font-weight:bold">🧩 Ghi Nhớ Sequence</div>
      <div id="simonDisplay" style="font-size:26px;letter-spacing:10px;margin:8px 0;color:#f0c040;min-height:36px"></div>
      <div style="color:#888;font-size:10px;margin-bottom:4px">Nhập của bạn:</div>
      <div id="simonInput" style="font-size:22px;letter-spacing:10px;margin:6px 0;color:#80deea;min-height:30px"></div>
      <div id="simonTimer" style="color:#ffeb3b;font-size:11px;margin-bottom:10px">⏱ 8s</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px">
        <button onclick="AncientTomb.simonInput('N')" style="${btnStyle}">↑ Bắc</button>
        <button onclick="AncientTomb.simonInput('S')" style="${btnStyle}">↓ Nam</button>
        <button onclick="AncientTomb.simonInput('E')" style="${btnStyle}">→ Đông</button>
        <button onclick="AncientTomb.simonInput('W')" style="${btnStyle}">← Tây</button>
      </div>
      <button onclick="AncientTomb.simonInput('skip')" style="${btnStyle};margin-top:8px;color:#f44336;border-color:#f44336;width:100%">⚠️ Bỏ qua (chịu damage)</button>
    `;

    // Append to game container or body
    const container = document.getElementById('gameContainer') || document.body;
    container.appendChild(leyHUD);
    container.appendChild(pocketHUD);
    container.appendChild(tombHUD);
    container.appendChild(simonHUD);
  },

  // ─── Inject CSS ───────────────────────────────────────────
  _injectCSS() {
    if (document.getElementById('we-feature-style')) return;
    const style = document.createElement('style');
    style.id = 'we-feature-style';
    style.textContent = `
      #leyLineHUD { transition: border-color 0.3s; }
      #simonHUD button:hover { filter: brightness(1.3); }
      #pocketHUD { animation: pulse_pocket 2s infinite; }
      @keyframes pulse_pocket {
        0%, 100% { box-shadow: 0 0 8px #f48fb188; }
        50% { box-shadow: 0 0 20px #f48fb1cc; }
      }
      .we-tomb-btn {
        background:#1a1a2e; color:#7c4dff; border:1px solid #7c4dff;
        border-radius:6px; padding:6px 14px; font-size:11px;
        cursor:pointer; font-family:monospace; margin:2px;
      }
      .we-tomb-btn:hover { background:#2a1a4e; }
    `;
    document.head.appendChild(style);
  },

  // ─── Save ─────────────────────────────────────────────────
  _save() {
    try {
      const data = {
        leyLines: LeyLineSystem.state.lines.map(l => ({
          id: l.id, type: l.type, x: l.x, y: l.y,
          nextMoveTime: l.nextMoveTime,
          revealed: l.revealed, revealEndTime: l.revealEndTime
        })),
        pocketRecords: FairyPocket.state.records,
        tombData: AncientTomb.state.tombData
      };
      localStorage.setItem(this._saveKey, JSON.stringify(data));
    } catch (e) {
      console.warn('WorldEnergy save error', e);
    }
  },

  // ─── Load ─────────────────────────────────────────────────
  _load() {
    try {
      const raw = localStorage.getItem(this._saveKey);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data.leyLines && Array.isArray(data.leyLines)) {
        LeyLineSystem.state.lines = data.leyLines;
      }
      if (data.pocketRecords) FairyPocket.state.records = data.pocketRecords;
      if (data.tombData) AncientTomb.state.tombData = data.tombData;
    } catch (e) {
      console.warn('WorldEnergy load error', e);
    }
  },

  // ─── Hook: Game.update ────────────────────────────────────
  _hookGameUpdate() {
    const _orig = Game.update.bind(Game);
    Game.update = function(dt) {
      _orig(dt);
      if (typeof GameState !== 'undefined' && GameState.running) {
        LeyLineSystem.update(dt);
        FairyPocket.update(dt);
        AncientTomb.update(dt);
      }
    };
  },

  // ─── Hook: Game.renderObjects (world-space) ───────────────
  _hookRenderObjects() {
    if (typeof Game.renderObjects !== 'function') return;
    const _orig = Game.renderObjects.bind(Game);
    Game.renderObjects = function() {
      _orig();
      const ctx = Game.ctx;
      if (!ctx) return;
      LeyLineSystem.render(ctx);
      FairyPocket.renderPortal(ctx);
      FairyPocket.renderIceChests(ctx);
    };
  },

  // ─── Hook: Player.recalculateStats ────────────────────────
  _hookRecalculateStats() {
    const _orig = Player.recalculateStats.bind(Player);
    Player.recalculateStats = function() {
      _orig();
      // Ley line stat bonuses
      if (Player._leyLineBuff) {
        const cfg = LEY_LINE_CONFIG.types[Player._leyLineBuff];
        if (cfg && cfg.buff.atkPctBonus) {
          Player.atk = Math.floor(Player.atk * (1 + cfg.buff.atkPctBonus));
        }
        if (cfg && cfg.buff.skillCdReduction) {
          Player._leyLineCdRed = cfg.buff.skillCdReduction;
        } else {
          delete Player._leyLineCdRed;
        }
      }
      // Convergence bonus
      if (Player._convergenceActive) {
        Player.atk   = Math.floor(Player.atk   * 1.5);
        Player.def   = Math.floor(Player.def   * 1.5);
        Player.maxHp = Math.floor(Player.maxHp * 1.5);
        Player.hp    = Math.min(Player.hp, Player.maxHp);
      }
    };
  },

  // ─── Hook: Enemies.kill ───────────────────────────────────
  _hookEnemiesKill() {
    const _orig = Enemies.kill.bind(Enemies);
    Enemies.kill = function(enemy) {
      if (!enemy) return _orig(enemy);

      // Ley line exp multiplier
      if (Player._leyLineBuff) {
        const cfg = LEY_LINE_CONFIG.types[Player._leyLineBuff];
        if (cfg && cfg.buff.expMul && enemy.exp) {
          enemy.exp = Math.floor(enemy.exp * cfg.buff.expMul);
        }
      }

      _orig(enemy);

      // Portal spawn from boss
      if (enemy.boss && !enemy._tombBoss) {
        FairyPocket.trySpawnPortal(enemy.x, enemy.y);
      }

      // Pocket kill count
      if (enemy._pocketEnemy) FairyPocket.state.killCount++;

      // Tomb boss
      if (enemy._tombBoss) AncientTomb.state._tombBossKilled = true;
    };
  },

  // ─── Hook: Player.takeDamage (tomb death) ─────────────────
  _hookTakeDamage() {
    if (typeof Player.takeDamage !== 'function') return;
    const _orig = Player.takeDamage.bind(Player);
    Player.takeDamage = function(dmg, source) {
      _orig(dmg, source);
      // Check death while in tomb
      if (AncientTomb.state.inTomb && Player.hp <= 0) {
        Player.hp = Math.floor(Player.maxHp * 0.30);
        Player.alive = true;
        if (typeof UI !== 'undefined') UI.addLog('💀 Ngã xuống trong Thần Mộ! Bị trục xuất.', 'system');
        AncientTomb.exitTomb(false);
      }
    };
  },

  // ─── Hook: Game.handleTap ─────────────────────────────────
  _hookHandleTap() {
    const _orig = Game.handleTap.bind(Game);
    Game.handleTap = function(screenX, screenY) {
      const worldX = screenX + GameState.camera.x;
      const worldY = screenY + GameState.camera.y;

      // Portal enter
      if (FairyPocket.state.portalActive) {
        const pd = _u_dist(worldX, worldY,
          FairyPocket.state.portalX, FairyPocket.state.portalY);
        if (pd < 70) {
          FairyPocket.enter();
          return;
        }
      }

      // Tomb door in room
      if (AncientTomb.state.inTomb) {
        let tombHandled = false;
        Maps.objects.forEach(obj => {
          if (!obj._tombDoor) return;
          if (_u_dist(worldX, worldY, obj.x + 16, obj.y + 16) < 60) {
            AncientTomb.nextRoom();
            tombHandled = true;
          }
        });
        if (tombHandled) return;
      }

      // Tomb world entry
      if (!AncientTomb.state.inTomb) {
        if (AncientTomb.checkWorldTap(worldX, worldY)) return;
      }

      _orig(screenX, screenY);
    };
  },

  // ─── Hook: Maps.generate ──────────────────────────────────
  _hookMapsGenerate() {
    const _orig = Maps.generate.bind(Maps);
    Maps.generate = function() {
      _orig();
      LeyLineSystem.generateForMap();
    };
  },

  // ─── Hook: Inventory.useItem (machDo + tombCompass) ───────
  _hookInventoryUseItem() {
    const _orig = Inventory.useItem.bind(Inventory);
    Inventory.useItem = function(itemId) {
      const itemData = ITEMS[itemId];
      if (itemData && itemData.effect) {
        // Mạch Đồ — reveal nearest ley line
        if (itemData.effect.revealLeyLine) {
          const line = LeyLineSystem.getNearestLine();
          if (line) {
            line.revealed = true;
            line.revealEndTime = (typeof GameState !== 'undefined' ? GameState.time : Date.now())
              + LEY_LINE_CONFIG.revealDuration;
            if (typeof UI !== 'undefined') {
              UI.addLog('🗺️ Mạch Đồ: Linh Mạch lộ diện 10 phút!', 'item');
            }
            // Consume item
            Inventory.remove(itemId, 1);
            Inventory.render();
            return true;
          }
          return false;
        }

        // Mộ La Bàn — sense nearby tomb
        if (itemData.effect.senseNearbyTomb) {
          let found = false;
          Maps.objects.forEach(obj => {
            if (!obj._tombEntry) return;
            if (typeof Player !== 'undefined') {
              const d = _u_dist(Player.x, Player.y, obj.x + 16, obj.y + 16);
              if (d < 300) {
                if (typeof UI !== 'undefined') {
                  UI.addLog(`⚰️ Mộ La Bàn: Thần Mộ cách ${Math.floor(d)}px!`, 'system');
                  UI.showNotification('⚰️ La Bàn cảm nhận!', 'Thần Mộ ở gần!');
                }
                found = true;
              }
            }
          });
          if (!found && typeof UI !== 'undefined') {
            UI.addLog('⚰️ Mộ La Bàn: Không cảm nhận được Thần Mộ nào.', 'system');
          }
          Inventory.remove(itemId, 1);
          Inventory.render();
          return true;
        }
      }
      return _orig(itemId);
    };
  },

  // ─── Hook: Game.save / Game.load ──────────────────────────
  _hookSaveLoad() {
    const self = this;
    const _origSave = Game.save.bind(Game);
    Game.save = function() {
      _origSave();
      self._save();
    };

    const _origLoad = Game.load.bind(Game);
    Game.load = function() {
      const r = _origLoad();
      self._load();
      return r;
    };
  },

  // ─── Hook: Maps.generate for ley lines on travelTo ────────
  _hookMapsTravel() {
    if (typeof Maps.travelTo !== 'function') return;
    const _orig = Maps.travelTo.bind(Maps);
    Maps.travelTo = function(mapIndex) {
      const result = _orig(mapIndex);
      if (result !== false) {
        LeyLineSystem.generateForMap();
      }
      return result;
    };
  },

  // ─── Hook: Game.renderMinimap ─────────────────────────────
  _hookRenderMinimap() {
    if (typeof Game.renderMinimap !== 'function') return;
    const _orig = Game.renderMinimap.bind(Game);
    Game.renderMinimap = function() {
      _orig();
      const mc = document.getElementById('minimapCanvas');
      if (!mc) return;
      const mctx = mc.getContext('2d');
      const scale = mc.width / (CONFIG.WORLD_WIDTH * CONFIG.TILE_SIZE);
      LeyLineSystem.renderMinimap(mctx, scale);
    };
  },

  // ─── Register items in ITEMS object ───────────────────────
  _registerItems() {
    if (typeof ITEMS === 'undefined') return;
    ITEMS.machDo             = LEY_LINE_CONFIG.items.machDo;
    ITEMS.tombCompass        = ANCIENT_TOMB_CONFIG.tombCompassItem;
    ITEMS.cotichManhFragment = FAIRY_POCKET_CONFIG.cotichManhItem;
  },

  // ─── Main init ────────────────────────────────────────────
  init() {
    // Register items
    this._registerItems();

    // Inject UI
    this._injectCSS();
    this._injectHTML();

    // Load saved data
    this._load();

    // Generate ley lines if not loaded
    if (LeyLineSystem.state.lines.length === 0) {
      LeyLineSystem.generateForMap();
    }

    // Apply all hooks
    this._hookGameUpdate();
    this._hookRenderObjects();
    this._hookRecalculateStats();
    this._hookEnemiesKill();
    this._hookTakeDamage();
    this._hookHandleTap();
    this._hookMapsGenerate();
    this._hookMapsTravel();
    this._hookInventoryUseItem();
    this._hookSaveLoad();
    this._hookRenderMinimap();

  }
};

// ─── Auto-init after DOM ready ──────────────────────────────────
(function() {
  function tryInit() {
    if (
      typeof Game       !== 'undefined' && Game.canvas &&
      typeof Player     !== 'undefined' &&
      typeof Enemies    !== 'undefined' &&
      typeof Maps       !== 'undefined' &&
      typeof Inventory  !== 'undefined' &&
      typeof UI         !== 'undefined' &&
      typeof GameState  !== 'undefined' &&
      typeof CONFIG     !== 'undefined' &&
      typeof ITEMS      !== 'undefined'
    ) {
      WorldEnergyFeature.init();
    } else {
      setTimeout(tryInit, 200);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(tryInit, 400));
  } else {
    setTimeout(tryInit, 400);
  }
})();

// =============================================================
// USAGE (thêm vào cuối index.html, sau tất cả các script khác):
// <script src="js/feature_world_energy.js"></script>
// =============================================================
// ===== CHANGES: Xóa console.log trong generateForMap và WorldEnergyFeature.init. Xóa comment USAGE cuối file. =====
