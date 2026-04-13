// ==================== BOSS EVENT SYSTEM ====================
// File: js/feature_boss_event.js
// Load sau game.js trong index.html:
// <script src="js/feature_boss_event.js"></script>
// Không sửa file gốc — chỉ monkey-patch / wrap

// ==============================================================
// PHẦN 1 — DATA & CONFIG
// ==============================================================

const BOSS_EVENT_CONFIG = {
  // Timer (ms, dùng Date.now())
  minInterval:   30 * 60 * 1000,   // 30 phút
  maxInterval:   60 * 60 * 1000,   // 60 phút
  warningTime:    5 * 60 * 1000,   // cảnh báo 5 phút trước
  bossLifetime:  10 * 60 * 1000,   // boss tồn tại 10 phút
  storageKey: 'tuxien_boss_event',

  // AOE warning
  warningDuration: 1200,  // ms hiển thị vùng đỏ trước khi damage

  // 6 boss definitions
  bosses: {
    boss_colong: {
      id: 'boss_colong',
      name: '🐉 Cổ Long Giác',
      mapIndex: 0,
      hpMul: 15,
      atkMul: 4,
      size: 32,
      color: '#228b22',
      glowColor: '#90ee90',
      sprite: 'boar',
      exp: 2000,
      gold: 600,
      drops: [
        { id: 'dragonScale',   chance: 0.8 },
        { id: 'celestialOrb',  chance: 0.2 },
        { id: 'celestialSword',chance: 0.05 }
      ],
      phases: [
        { threshold: 1.0, name: 'Bình Thường', speedMul: 1.0, atkMul: 1.0, color: '#228b22' },
        { threshold: 0.6, name: 'Cuồng Nộ',   speedMul: 1.3, atkMul: 1.5, color: '#d4a017' },
        { threshold: 0.3, name: 'Bạo Phát',   speedMul: 1.6, atkMul: 2.2, color: '#ff4500' }
      ],
      skills: [
        { name: 'Rồng Tức',        cd: 6000,  type: 'aoe_circle', radius: 150, damageKey: 'atk3',  phase: 0 },
        { name: 'Đuôi Quét',       cd: 8000,  type: 'charge',      speed: 8,   damageKey: 'atk2',  duration: 800, phase: 0 },
        { name: 'Hơi Thở Rồng',   cd: 10000, type: 'aoe_circle', radius: 200, damageKey: 'atk4',  phase: 1 }
      ]
    },

    boss_minhvuong: {
      id: 'boss_minhvuong',
      name: '👻 Minh Vương',
      mapIndex: 1,
      hpMul: 18,
      atkMul: 5,
      size: 30,
      color: '#4b0082',
      glowColor: '#e040fb',
      sprite: 'ghost',
      exp: 3500,
      gold: 900,
      drops: [
        { id: 'demonCore',    chance: 0.9 },
        { id: 'spiritStone',  chance: 0.6 },
        { id: 'flameSword',   chance: 0.08 }
      ],
      phases: [
        { threshold: 1.0, name: 'Bình Thường', speedMul: 1.0, atkMul: 1.0, color: '#4b0082' },
        { threshold: 0.6, name: 'Cuồng Nộ',   speedMul: 1.3, atkMul: 1.5, color: '#8b00ff' },
        { threshold: 0.3, name: 'Bạo Phát',   speedMul: 1.6, atkMul: 2.2, color: '#ff00ff' }
      ],
      skills: [
        { name: 'Triệu Hồn',     cd: 12000, type: 'summon',     enemyType: 'ghost', count: 4, phase: 0 },
        { name: 'Bóng Tối',      cd: 7000,  type: 'aoe_circle', radius: 180, damageKey: 'atk3_5', phase: 0 },
        { name: 'Hắc Ám Bùa',   cd: 15000, type: 'shield',     duration: 4000, phase: 1 },
        { name: 'Địa Ngục Mở',  cd: 18000, type: 'berserk_aoe',radius: 250, damageKey: 'atk5', phase: 2 }
      ]
    },

    boss_viamdё: {
      id: 'boss_viamdё',
      name: '🔥 Viêm Đế',
      mapIndex: 2,
      hpMul: 22,
      atkMul: 6,
      size: 34,
      color: '#ff4500',
      glowColor: '#ff6600',
      sprite: 'demon',
      exp: 5000,
      gold: 1200,
      drops: [
        { id: 'flameSword',   chance: 0.25 },
        { id: 'dragonScale',  chance: 0.5 },
        { id: 'realmPill',    chance: 0.4 }
      ],
      phases: [
        { threshold: 1.0, name: 'Bình Thường', speedMul: 1.0, atkMul: 1.0, color: '#ff4500' },
        { threshold: 0.6, name: 'Cuồng Nộ',   speedMul: 1.3, atkMul: 1.5, color: '#ff6600' },
        { threshold: 0.3, name: 'Bạo Phát',   speedMul: 1.6, atkMul: 2.2, color: '#ffffff' }
      ],
      skills: [
        { name: 'Thiêu Đốt',  cd: 6000,  type: 'aoe_circle', radius: 160, damageKey: 'atk3',   phase: 0 },
        { name: 'Lao Thẳng',  cd: 8000,  type: 'charge',      speed: 10,  damageKey: 'atk2_5', duration: 600, phase: 0 },
        { name: 'Bão Lửa',    cd: 10000, type: 'aoe_circle', radius: 220, damageKey: 'atk4_5', phase: 1 },
        { name: 'Núi Lửa',    cd: 14000, type: 'summon',     enemyType: 'fireSpirit', count: 5, phase: 2 }
      ]
    },

    boss_banghoang: {
      id: 'boss_banghoang',
      name: '❄️ Băng Hoàng',
      mapIndex: 3,
      hpMul: 28,
      atkMul: 7,
      size: 36,
      color: '#00bcd4',
      glowColor: '#80deea',
      sprite: 'boar',
      exp: 7000,
      gold: 1600,
      drops: [
        { id: 'frostSword',   chance: 0.25 },
        { id: 'celestialOrb', chance: 0.3 },
        { id: 'dragonArmor',  chance: 0.1 }
      ],
      phases: [
        { threshold: 1.0, name: 'Bình Thường', speedMul: 1.0, atkMul: 1.0, color: '#00bcd4' },
        { threshold: 0.6, name: 'Cuồng Nộ',   speedMul: 1.3, atkMul: 1.5, color: '#4dd0e1' },
        { threshold: 0.3, name: 'Bạo Phát',   speedMul: 1.6, atkMul: 2.2, color: '#ffffff' }
      ],
      skills: [
        { name: 'Bão Tuyết',      cd: 7000,  type: 'aoe_circle', radius: 200, damageKey: 'atk3_5', slowEffect: true, phase: 0 },
        { name: 'Lao Băng',       cd: 9000,  type: 'charge',      speed: 9,   damageKey: 'atk3',   duration: 700, phase: 0 },
        { name: 'Tường Băng',     cd: 15000, type: 'shield',     duration: 5000, phase: 1 },
        { name: 'Địa Ngục Băng',  cd: 18000, type: 'berserk_aoe',radius: 300, damageKey: 'atk6', phase: 2 }
      ]
    },

    boss_thaicoma: {
      id: 'boss_thaicoma',
      name: '😈 Thái Cổ Ma',
      mapIndex: 4,
      hpMul: 35,
      atkMul: 9,
      size: 38,
      color: '#8b0000',
      glowColor: '#ff1744',
      sprite: 'demon',
      exp: 10000,
      gold: 2200,
      drops: [
        { id: 'celestialSword', chance: 0.15 },
        { id: 'celestialRobe',  chance: 0.1 },
        { id: 'celestialJade',  chance: 0.08 }
      ],
      phases: [
        { threshold: 1.0, name: 'Bình Thường', speedMul: 1.0, atkMul: 1.0, color: '#8b0000' },
        { threshold: 0.6, name: 'Cuồng Nộ',   speedMul: 1.3, atkMul: 1.5, color: '#cc0000' },
        { threshold: 0.3, name: 'Bạo Phát',   speedMul: 1.6, atkMul: 2.2, color: '#ff1744' }
      ],
      skills: [
        { name: 'Ma Khí Bùng Phát', cd: 7000,  type: 'aoe_circle', radius: 220, damageKey: 'atk4', phase: 0 },
        { name: 'Triệu Tà',         cd: 12000, type: 'summon',     enemyType: 'darkDemon', count: 3, phase: 0 },
        { name: 'Bạo Tán',          cd: 15000, type: 'berserk_aoe',radius: 280, damageKey: 'atk7', extraSummon: { type: 'shadowLord', count: 2 }, phase: 2 }
      ]
    },

    boss_tienlong: {
      id: 'boss_tienlong',
      name: '✨ Tiên Long',
      mapIndex: 5,
      hpMul: 50,
      atkMul: 12,
      size: 40,
      color: '#ffd700',
      glowColor: '#ffffff',
      sprite: 'demon',
      exp: 15000,
      gold: 3000,
      drops: [
        { id: 'celestialJade',  chance: 0.4 },
        { id: 'celestialSword', chance: 0.2 },
        { id: 'celestialRobe',  chance: 0.2 },
        { id: 'celestialOrb',   chance: 0.5 }
      ],
      phases: [
        { threshold: 1.0, name: 'Bình Thường', speedMul: 1.0, atkMul: 1.0, color: '#ffd700' },
        { threshold: 0.6, name: 'Cuồng Nộ',   speedMul: 1.3, atkMul: 1.5, color: '#ffe066' },
        { threshold: 0.3, name: 'Bạo Phát',   speedMul: 1.6, atkMul: 2.2, color: '#ffffff' }
      ],
      skills: [
        { name: 'Tiên Quang',   cd: 8000,  type: 'aoe_circle',  radius: 250, damageKey: 'atk5', phase: 0 },
        { name: 'Dịch Chuyển',  cd: 6000,  type: 'teleport_charge', damageKey: 'atk4', phase: 0 },
        { name: 'Thiên Lôi',    cd: 10000, type: 'triple_aoe',  radius: 300, damageKey: 'atk6', phase: 1 },
        { name: 'Hủy Diệt',     cd: 18000, type: 'berserk_aoe', radius: 350, damageKey: 'atk8', screenShake: 1000, phase: 2 }
      ]
    }
  },

  // Map damageKey → multiplier
  damageMultiplier: {
    'atk2':   2,
    'atk2_5': 2.5,
    'atk3':   3,
    'atk3_5': 3.5,
    'atk4':   4,
    'atk4_5': 4.5,
    'atk5':   5,
    'atk6':   6,
    'atk7':   7,
    'atk8':   8
  }
};

// ==============================================================
// PHẦN 2 — LOGIC MODULE
// ==============================================================

const BossEventSystem = {

  // ── 2A. Timer State ──────────────────────────────────────────
  timerState: {
    nextEventTime: 0,
    lastSaveTime: 0
  },

  // ── 2B. Boss State ───────────────────────────────────────────
  bossState: {
    active: false,
    boss: null,
    bossId: null,
    config: null,
    spawnTime: 0,
    currentPhase: 0,
    damageDealt: 0,
    totalDamage: 0,
    baseAtk: 0,
    baseSpeed: 1.0,
    skills: [],
    aoeWarnings: [],
    chargeState: null,
    shieldActive: false,
    shieldTimer: 0,
    slowEffect: null,
    screenShake: 0
  },

  // ── Init ─────────────────────────────────────────────────────
  init() {
    this._injectStyles();
    this._injectHUD();
    this._injectResultScreen();

    // Reset state
    Object.assign(this.bossState, {
      active: false, boss: null, bossId: null, config: null,
      spawnTime: 0, currentPhase: 0, damageDealt: 0, totalDamage: 0,
      baseAtk: 0, baseSpeed: 1.0, skills: [], aoeWarnings: [],
      chargeState: null, shieldActive: false, shieldTimer: 0,
      slowEffect: null, screenShake: 0
    });

    this.initTimer();
    this._hookEnemies();
    this._hookGameRender();
    this._hookGameUpdate();
    this._hookGameSave();
    this._hookGameLoad();

    console.log('👹 BossEventSystem initialized');
  },

  // ── 2A. Timer System ─────────────────────────────────────────
  initTimer() {
    const raw = localStorage.getItem(BOSS_EVENT_CONFIG.storageKey);
    if (raw) {
      try {
        const saved = JSON.parse(raw);
        this.timerState.nextEventTime = saved.nextEventTime || 0;
        this.timerState.lastSaveTime  = saved.lastSaveTime  || 0;
      } catch (e) { /* ignore */ }
    }

    const now = Date.now();
    if (!this.timerState.nextEventTime || this.timerState.nextEventTime <= now) {
      this.timerState.nextEventTime = now + Utils.random(
        BOSS_EVENT_CONFIG.minInterval, BOSS_EVENT_CONFIG.maxInterval
      );
    }
    this.saveTimer();

    const secsLeft = Math.floor((this.timerState.nextEventTime - now) / 1000);
    console.log(`👹 Next Boss Event in ${Math.floor(secsLeft/60)}m${secsLeft%60}s`);
  },

  saveTimer() {
    this.timerState.lastSaveTime = Date.now();
    localStorage.setItem(
      BOSS_EVENT_CONFIG.storageKey,
      JSON.stringify(this.timerState)
    );
  },

  loadTimer() {
    const raw = localStorage.getItem(BOSS_EVENT_CONFIG.storageKey);
    if (raw) {
      try {
        const saved = JSON.parse(raw);
        this.timerState.nextEventTime = saved.nextEventTime || 0;
        this.timerState.lastSaveTime  = saved.lastSaveTime  || 0;
      } catch (e) { /* ignore */ }
    }
    const now = Date.now();
    if (!this.timerState.nextEventTime || this.timerState.nextEventTime <= now) {
      this.timerState.nextEventTime = now + Utils.random(
        BOSS_EVENT_CONFIG.minInterval, BOSS_EVENT_CONFIG.maxInterval
      );
    }
    this.saveTimer();
  },

  _lastWarningLog: 0,

  checkTimer() {
    const now = Date.now();
    const timeUntil = this.timerState.nextEventTime - now;

    if (timeUntil <= 0 && !this.bossState.active) {
      this.spawnBoss();
      this.timerState.nextEventTime = now + Utils.random(
        BOSS_EVENT_CONFIG.minInterval, BOSS_EVENT_CONFIG.maxInterval
      );
      this.saveTimer();
      return;
    }

    if (timeUntil > 0 && timeUntil <= BOSS_EVENT_CONFIG.warningTime) {
      BossHUD.updateCountdown(timeUntil);

      // Log chỉ 1 lần mỗi phút
      if (now - this._lastWarningLog > 60000) {
        this._lastWarningLog = now;
        const mins = Math.floor(timeUntil / 60000);
        const secs = Math.floor((timeUntil % 60000) / 1000);
        UI.addLog(`⚠️ Boss Event xuất hiện sau ${mins}m${secs}s!`, 'system');
      }
    }
  },

  // ── 2C. Boss Spawn & Kill ────────────────────────────────────
  spawnBoss() {
    const mapIndex = Maps.currentIndex;

    // Tìm boss cho map hiện tại
    let bossId = null, config = null;
    for (const [id, bc] of Object.entries(BOSS_EVENT_CONFIG.bosses)) {
      if (bc.mapIndex === mapIndex) { bossId = id; config = bc; break; }
    }
    if (!config) {
      console.log('👹 No boss for this map, skip');
      return;
    }

    // Spawn enemy object
    const bossEnemy = Enemies.spawn(config.sprite, 1, Player.level + 5);
    if (!bossEnemy) return;

    // Override fields
    bossEnemy.name         = config.name;
    bossEnemy.hp           = Math.floor(Player.maxHp * 20 * config.hpMul);
    bossEnemy.maxHp        = bossEnemy.hp;
    bossEnemy.atk          = Math.floor(Player.atk * 5 * config.atkMul);
    bossEnemy.size         = config.size;
    bossEnemy.color        = config.color;
    bossEnemy.boss         = true;
    bossEnemy.isBossEvent  = true;
    bossEnemy.exp          = config.exp;
    bossEnemy.gold         = config.gold;
    bossEnemy.drops        = config.drops;
    bossEnemy.x            = CONFIG.WORLD_WIDTH  * CONFIG.TILE_SIZE / 2;
    bossEnemy.y            = CONFIG.WORLD_HEIGHT * CONFIG.TILE_SIZE / 2;
    bossEnemy.spawnX       = bossEnemy.x;
    bossEnemy.spawnY       = bossEnemy.y;
    bossEnemy.aggroed      = true;

    // Boss state
    Object.assign(this.bossState, {
      active: true,
      boss: bossEnemy,
      bossId,
      config,
      spawnTime: Date.now(),
      currentPhase: 0,
      damageDealt: 0,
      totalDamage: bossEnemy.maxHp,
      baseAtk: bossEnemy.atk,
      baseSpeed: 1.2,
      skills: config.skills.map(s => ({ ...s, currentCd: 0 })),
      aoeWarnings: [],
      chargeState: null,
      shieldActive: false,
      shieldTimer: 0,
      slowEffect: null,
      screenShake: 500
    });

    UI.showNotification('⚔️ ' + config.name, 'Boss Event xuất hiện!');
    UI.addLog('🔥 Boss Event: ' + config.name + ' xuất hiện!', 'system');
    BossHUD.show(config.name);

    // Spawn particles
    for (let i = 0; i < 50; i++) {
      GameState.particles.push({
        x: bossEnemy.x + (Math.random() - 0.5) * 80,
        y: bossEnemy.y + (Math.random() - 0.5) * 80,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6 - 2,
        life: 800,
        color: config.glowColor,
        size: 4 + Math.random() * 5
      });
    }

    console.log('👹 Boss spawned:', config.name);
  },

  onBossKilled() {
    const bs = this.bossState;
    if (!bs.active || !bs.config) return;

    bs.active = false;
    const config = bs.config;
    const maxHp  = bs.boss ? bs.boss.maxHp : 1;

    // Tính contribution
    const contribution = Math.min(1, bs.damageDealt / maxHp);
    let rewardMul = (contribution >= 0.05)
      ? Math.min(2.0, 1.0 + contribution)
      : 0.3;

    const gainedExp  = Math.floor(config.exp  * rewardMul);
    const gainedGold = Math.floor(config.gold * rewardMul);

    Player.gainExp(gainedExp);
    Player.gold += gainedGold;

    // Roll drops
    const gotItems = [];
    for (const drop of config.drops) {
      const adjustedChance = Math.min(1, drop.chance * rewardMul);
      if (Utils.chance(adjustedChance) && ITEMS[drop.id]) {
        if (Inventory.add(drop.id, 1)) {
          gotItems.push(ITEMS[drop.id].name);
          UI.addLog(`📦 Nhận ${ITEMS[drop.id].name}!`, 'item');
        }
      }
    }

    UI.showNotification('🏆 Boss Đã Bị Hạ!', config.name);
    UI.updateGold();

    BossResultScreen.show(contribution, {
      exp: gainedExp, gold: gainedGold, rewardMul, items: gotItems
    }, false);

    BossHUD.hide();
    bs.screenShake = 1500;

    // Explosion particles
    const bx = bs.boss ? bs.boss.x : CONFIG.WORLD_WIDTH  * CONFIG.TILE_SIZE / 2;
    const by = bs.boss ? bs.boss.y : CONFIG.WORLD_HEIGHT * CONFIG.TILE_SIZE / 2;
    const explosionColors = ['#ffd700','#ff4500','#ff1744','#ff9800','#ffffff','#e040fb'];
    for (let i = 0; i < 80; i++) {
      GameState.particles.push({
        x: bx + (Math.random() - 0.5) * 100,
        y: by + (Math.random() - 0.5) * 100,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10 - 3,
        life: 1200,
        color: explosionColors[Math.floor(Math.random() * explosionColors.length)],
        size: 5 + Math.random() * 8
      });
    }

    // Screen flash
    const flash = document.createElement('div');
    flash.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;' +
      'background:#fff;opacity:0.8;z-index:9999;pointer-events:none;' +
      'transition:opacity 0.5s ease;';
    document.body.appendChild(flash);
    requestAnimationFrame(() => {
      flash.style.opacity = '0';
      setTimeout(() => { if (flash.parentNode) flash.parentNode.removeChild(flash); }, 600);
    });
  },

  despawnBoss() {
    const bs = this.bossState;
    if (!bs.boss) return;

    UI.addLog('💨 ' + bs.config.name + ' rút lui...', 'system');

    // Remove from enemy list
    const idx = Enemies.list.indexOf(bs.boss);
    if (idx !== -1) Enemies.list.splice(idx, 1);

    // Restore player slow if active
    if (bs.slowEffect) {
      Player.speed = bs.slowEffect.originalSpeed;
      bs.slowEffect = null;
    }

    // Clear pending aoe timeouts
    for (const w of bs.aoeWarnings) {
      if (w._timeoutId) clearTimeout(w._timeoutId);
    }

    bs.active = false;
    bs.boss   = null;
    BossHUD.hide();

    // Schedule next event
    this.timerState.nextEventTime = Date.now() + Utils.random(
      BOSS_EVENT_CONFIG.minInterval, BOSS_EVENT_CONFIG.maxInterval
    );
    this.saveTimer();

    BossResultScreen.show(0, { exp: 0, gold: 0, rewardMul: 0, items: [] }, true);
  },

  // ── Hook Enemies.damage & kill ───────────────────────────────
  _hookEnemies() {
    const _origDmg  = Enemies.damage.bind(Enemies);
    const _origKill = Enemies.kill.bind(Enemies);
    const self = this;

    Enemies.damage = function(enemy, amount, isCrit, color) {
      if (enemy && enemy.isBossEvent) {
        // Shield blocks damage
        if (self.bossState.shieldActive) {
          Game.spawnDamageNumber(enemy.x, enemy.y - enemy.size - 10, '🛡️ IMMUNE', '#80deea');
          return;
        }
        self.bossState.damageDealt += amount;
      }
      _origDmg(enemy, amount, isCrit, color);
    };

    Enemies.kill = function(enemy) {
      if (enemy && enemy.isBossEvent) {
        _origKill(enemy);
        self.onBossKilled();
      } else {
        _origKill(enemy);
      }
    };
  },

  // ── 2D. Phase System ─────────────────────────────────────────
  checkPhase() {
    const bs = this.bossState;
    if (!bs.boss || !bs.boss.alive) return;

    const hpPercent = bs.boss.hp / bs.boss.maxHp;
    let newPhase = 0;
    if (hpPercent < 0.3) newPhase = 2;
    else if (hpPercent < 0.6) newPhase = 1;

    if (newPhase > bs.currentPhase) {
      bs.currentPhase = newPhase;
      const phaseConfig = bs.config.phases[newPhase];
      bs.boss.color = phaseConfig.color;

      // Burst particles
      for (let i = 0; i < 30; i++) {
        GameState.particles.push({
          x: bs.boss.x + (Math.random() - 0.5) * 60,
          y: bs.boss.y + (Math.random() - 0.5) * 60,
          vx: (Math.random() - 0.5) * 5,
          vy: (Math.random() - 0.5) * 5 - 2,
          life: 700,
          color: phaseConfig.color,
          size: 4 + Math.random() * 4
        });
      }

      UI.addLog('⚡ ' + bs.config.name + ' — ' + phaseConfig.name + '!', 'system');
      UI.showNotification('⚡ Phase Mới!', bs.config.name + ' ' + phaseConfig.name);
      bs.screenShake = 800;
    }
  },

  getBossAtk() {
    const bs = this.bossState;
    return Math.floor(bs.baseAtk * bs.config.phases[bs.currentPhase].atkMul);
  },

  getBossSpeed() {
    const bs = this.bossState;
    return bs.baseSpeed * bs.config.phases[bs.currentPhase].speedMul;
  },

  // Resolve damageKey → actual damage value
  _resolveDamage(damageKey) {
    const mul = BOSS_EVENT_CONFIG.damageMultiplier[damageKey] || 1;
    return Math.floor(Player.atk * mul);
  },

  // ── 2E. Skill System ─────────────────────────────────────────
  updateSkills(dt) {
    const bs = this.bossState;
    for (const skill of bs.skills) {
      if (skill.currentCd > 0) skill.currentCd -= dt;

      // Check phase eligibility
      const minPhase = (skill.phase !== undefined) ? skill.phase : 0;
      if (skill.currentCd <= 0 && bs.currentPhase >= minPhase) {
        skill.currentCd = skill.cd;
        this.castSkill(skill);
        break; // Chỉ cast 1 skill mỗi frame
      }
    }
  },

  castSkill(skill) {
    const bs = this.bossState;
    if (!bs.boss || !bs.boss.alive) return;

    switch (skill.type) {
      case 'aoe_circle':
        this._castAoeCircle(skill);
        break;

      case 'charge':
        this._castCharge(skill);
        break;

      case 'summon':
        this._castSummon(skill);
        break;

      case 'shield':
        this._castShield(skill);
        break;

      case 'berserk_aoe':
        this._castBerserkAoe(skill);
        break;

      case 'teleport_charge':
        this._castTeleportCharge(skill);
        break;

      case 'triple_aoe':
        this._castTripleAoe(skill);
        break;
    }

    UI.addLog('⚡ ' + bs.config.name + ' dùng ' + skill.name + '!', 'system');
  },

  _castAoeCircle(skill) {
    const bs = this.bossState;
    const damage = this._resolveDamage(skill.damageKey);
    const wd = BOSS_EVENT_CONFIG.warningDuration;

    const warning = {
      x: bs.boss.x, y: bs.boss.y,
      radius: skill.radius,
      life: wd, maxLife: wd,
      damage,
      color: '#ff5252',
      _timeoutId: null,
      slowEffect: skill.slowEffect || false
    };
    bs.aoeWarnings.push(warning);

    warning._timeoutId = setTimeout(() => {
      if (bs.active) this.resolveAoe(warning, skill.slowEffect);
    }, wd);
  },

  _castCharge(skill) {
    const bs = this.bossState;
    this.bossState.chargeState = {
      targetX: Player.x,
      targetY: Player.y,
      speed: skill.speed * CONFIG.TILE_SIZE * 0.1,
      damage: this._resolveDamage(skill.damageKey),
      timer: skill.duration || 800,
      active: true
    };
    UI.addLog('⚡ ' + bs.config.name + ' lao thẳng!', 'system');
  },

  _castSummon(skill) {
    const bs = this.bossState;
    for (let i = 0; i < skill.count; i++) {
      const angle  = (Math.PI * 2 / skill.count) * i;
      const radius = 100 + Math.random() * 100;
      const sx = bs.boss.x + Math.cos(angle) * radius;
      const sy = bs.boss.y + Math.sin(angle) * radius;
      const summon = Enemies.spawn(skill.enemyType, 1, Player.level);
      if (summon) { summon.x = sx; summon.y = sy; summon.aggroed = true; }
    }
    UI.addLog('💀 ' + bs.config.name + ' triệu hồi tay sai!', 'system');
  },

  _castShield(skill) {
    const bs = this.bossState;
    bs.shieldActive = true;
    bs.shieldTimer  = skill.duration;
    bs._preShieldColor = bs.boss.color;
    bs.boss.color   = '#ffffff';
    UI.addLog('🛡️ ' + bs.config.name + ' kích hoạt khiên!', 'system');
  },

  _castBerserkAoe(skill) {
    const bs = this.bossState;
    const damage = this._resolveDamage(skill.damageKey);
    const wd = BOSS_EVENT_CONFIG.warningDuration;

    // Main big aoe
    const warning = {
      x: bs.boss.x, y: bs.boss.y,
      radius: skill.radius,
      life: wd, maxLife: wd,
      damage, color: '#ff1744',
      _timeoutId: null
    };
    bs.aoeWarnings.push(warning);
    warning._timeoutId = setTimeout(() => {
      if (bs.active) this.resolveAoe(warning);
    }, wd);

    // 3 small aoe random around
    for (let i = 0; i < 3; i++) {
      const angle  = Math.random() * Math.PI * 2;
      const radius = 150 + Math.random() * 100;
      const sw = {
        x: bs.boss.x + Math.cos(angle) * radius,
        y: bs.boss.y + Math.sin(angle) * radius,
        radius: skill.radius * 0.4,
        life: wd, maxLife: wd,
        damage: Math.floor(damage * 0.6),
        color: '#ff5252',
        _timeoutId: null
      };
      bs.aoeWarnings.push(sw);
      sw._timeoutId = setTimeout(() => {
        if (bs.active) this.resolveAoe(sw);
      }, wd);
    }

    // Extra summon (Thái Cổ Ma phase3)
    if (skill.extraSummon) {
      for (let i = 0; i < skill.extraSummon.count; i++) {
        const summon = Enemies.spawn(skill.extraSummon.type, 1, Player.level + 2);
        if (summon) {
          summon.x = bs.boss.x + (Math.random() - 0.5) * 150;
          summon.y = bs.boss.y + (Math.random() - 0.5) * 150;
          summon.aggroed = true;
        }
      }
    }

    // Screen shake (Tiên Long Hủy Diệt)
    if (skill.screenShake) {
      bs.screenShake = Math.max(bs.screenShake, skill.screenShake);
    }
  },

  _castTeleportCharge(skill) {
    const bs = this.bossState;
    // Teleport boss gần Player
    const angle  = Math.random() * Math.PI * 2;
    const radius = 150 + Math.random() * 50;
    bs.boss.x = Player.x + Math.cos(angle) * radius;
    bs.boss.y = Player.y + Math.sin(angle) * radius;
    bs.boss.x = Utils.clamp(bs.boss.x, 50, CONFIG.WORLD_WIDTH  * CONFIG.TILE_SIZE - 50);
    bs.boss.y = Utils.clamp(bs.boss.y, 50, CONFIG.WORLD_HEIGHT * CONFIG.TILE_SIZE - 50);

    // Rồi charge ngay
    this._castCharge({ ...skill, type: 'charge' });
  },

  _castTripleAoe(skill) {
    const bs = this.bossState;
    const damage = this._resolveDamage(skill.damageKey);
    const wd = BOSS_EVENT_CONFIG.warningDuration;

    // Main aoe
    const main = {
      x: bs.boss.x, y: bs.boss.y,
      radius: skill.radius, life: wd, maxLife: wd,
      damage, color: '#ff5252', _timeoutId: null
    };
    bs.aoeWarnings.push(main);
    main._timeoutId = setTimeout(() => { if (bs.active) this.resolveAoe(main); }, wd);

    // 3 small aoe random
    for (let i = 0; i < 3; i++) {
      const angle  = Math.random() * Math.PI * 2;
      const r      = 150 + Math.random() * 100;
      const sm = {
        x: bs.boss.x + Math.cos(angle) * r,
        y: bs.boss.y + Math.sin(angle) * r,
        radius: 100 + Math.random() * 60,
        life: wd, maxLife: wd,
        damage: Math.floor(damage * 0.5),
        color: '#ff9800', _timeoutId: null
      };
      bs.aoeWarnings.push(sm);
      sm._timeoutId = setTimeout(() => { if (bs.active) this.resolveAoe(sm); }, wd);
    }
  },

  resolveAoe(warning, applySlowEffect) {
    const bs = this.bossState;
    const dist = Utils.dist(Player.x, Player.y, warning.x, warning.y);

    if (dist <= warning.radius) {
      Player.takeDamage(warning.damage, bs.config ? bs.config.name : 'Boss');

      // Slow effect (Băng Hoàng)
      if (applySlowEffect && !bs.slowEffect) {
        bs.slowEffect = { originalSpeed: Player.speed, endTime: Date.now() + 2000 };
        Player.speed *= 0.5;

        // Hiệu ứng xanh lam
        for (let i = 0; i < 10; i++) {
          GameState.particles.push({
            x: Player.x + (Math.random() - 0.5) * 30,
            y: Player.y + (Math.random() - 0.5) * 30,
            vx: (Math.random() - 0.5) * 2,
            vy: -1 - Math.random(),
            life: 600, color: '#4fc3f7', size: 3 + Math.random() * 3
          });
        }
      }
    }

    // Party members
    if (typeof PartySystem !== 'undefined' && PartySystem && PartySystem.members) {
      for (const member of PartySystem.members) {
        const md = Utils.dist(member.x, member.y, warning.x, warning.y);
        if (md <= warning.radius) {
          PartySystem.damageMember(member, Math.floor(warning.damage * 0.7));
        }
      }
    }

    // Hit particles
    for (let i = 0; i < 8; i++) {
      GameState.particles.push({
        x: warning.x + (Math.random() - 0.5) * warning.radius,
        y: warning.y + (Math.random() - 0.5) * warning.radius,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4 - 1,
        life: 400, color: '#ff5252', size: 3 + Math.random() * 4
      });
    }

    // Xóa warning
    const idx = bs.aoeWarnings.indexOf(warning);
    if (idx !== -1) bs.aoeWarnings.splice(idx, 1);
  },

  updateCharge(dt) {
    const bs = this.bossState;
    if (!bs.chargeState || !bs.chargeState.active) return;
    if (!bs.boss || !bs.boss.alive) { bs.chargeState = null; return; }

    const cs  = bs.chargeState;
    const dx  = cs.targetX - bs.boss.x;
    const dy  = cs.targetY - bs.boss.y;
    const d   = Math.sqrt(dx * dx + dy * dy);

    if (d > 5) {
      bs.boss.x += (dx / d) * cs.speed;
      bs.boss.y += (dy / d) * cs.speed;
    }

    cs.timer -= dt;

    if (d < 30 || cs.timer <= 0) {
      // Check hit Player
      if (Utils.dist(bs.boss.x, bs.boss.y, Player.x, Player.y) < bs.boss.size + 20) {
        Player.takeDamage(cs.damage, bs.config.name);
      }
      // Check Party
      if (typeof PartySystem !== 'undefined' && PartySystem && PartySystem.members) {
        for (const m of PartySystem.members) {
          if (Utils.dist(bs.boss.x, bs.boss.y, m.x, m.y) < bs.boss.size + 20) {
            PartySystem.damageMember(m, Math.floor(cs.damage * 0.7));
          }
        }
      }
      cs.active = false;
    }
  },

  // ── 2F. Boss AI Update ───────────────────────────────────────
  updateBossAI(dt) {
    const bs = this.bossState;
    if (!bs.active || !bs.boss || !bs.boss.alive) return;

    // 1. Kiểm tra lifetime
    if (Date.now() - bs.spawnTime > BOSS_EVENT_CONFIG.bossLifetime) {
      this.despawnBoss();
      return;
    }

    // 2. Phase
    this.checkPhase();

    // 3. Shield timer
    if (bs.shieldActive) {
      bs.shieldTimer -= dt;
      if (bs.shieldTimer <= 0) {
        bs.shieldActive = false;
        if (bs._preShieldColor) bs.boss.color = bs._preShieldColor;
      }
    }

    // 4. Slow effect
    if (bs.slowEffect && Date.now() > bs.slowEffect.endTime) {
      Player.speed = bs.slowEffect.originalSpeed;
      bs.slowEffect = null;
    }

    // 5. Screen shake countdown
    if (bs.screenShake > 0) bs.screenShake -= dt;

    // 6. Skills
    this.updateSkills(dt);

    // 7. Charge
    this.updateCharge(dt);

    // 8. AOE warnings life
    for (let i = bs.aoeWarnings.length - 1; i >= 0; i--) {
      bs.aoeWarnings[i].life -= dt;
      // Không xóa ở đây vì resolveAoe mới xóa; life chỉ dùng cho render alpha
    }

    // 9. Boss movement AI
    if (!bs.chargeState || !bs.chargeState.active) {
      let targetX = Player.x, targetY = Player.y;

      // Party taunt (nếu có)
      if (typeof PartySystem !== 'undefined' && PartySystem && PartySystem.members) {
        for (const m of PartySystem.members) {
          if (m.taunt) { targetX = m.x; targetY = m.y; break; }
        }
      }

      const dx = targetX - bs.boss.x;
      const dy = targetY - bs.boss.y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      const sp = this.getBossSpeed();

      if (d > bs.boss.size + 30) {
        bs.boss.x += (dx / d) * sp;
        bs.boss.y += (dy / d) * sp;
      } else {
        // Basic attack
        if (!bs._attackTimer) bs._attackTimer = 1500;
        bs._attackTimer -= dt;
        if (bs._attackTimer <= 0) {
          bs._attackTimer = 1500;
          const atk = this.getBossAtk();

          // Check Party target vs Player
          let hitParty = false;
          if (typeof PartySystem !== 'undefined' && PartySystem && PartySystem.members) {
            for (const m of PartySystem.members) {
              if (Utils.dist(bs.boss.x, bs.boss.y, m.x, m.y) < bs.boss.size + 30) {
                PartySystem.damageMember(m, atk);
                hitParty = true;
              }
            }
          }
          if (!hitParty && Utils.dist(bs.boss.x, bs.boss.y, Player.x, Player.y) < bs.boss.size + 30) {
            Player.takeDamage(atk, bs.config.name);
          }
        }
      }
    }

    // 10. Keep in bounds
    bs.boss.x = Utils.clamp(bs.boss.x, 50, CONFIG.WORLD_WIDTH  * CONFIG.TILE_SIZE - 50);
    bs.boss.y = Utils.clamp(bs.boss.y, 50, CONFIG.WORLD_HEIGHT * CONFIG.TILE_SIZE - 50);
    bs.boss.aggroed = true;
  },

  // ── 2G. Render ───────────────────────────────────────────────
  renderAoeWarnings() {
    const bs  = this.bossState;
    const ctx = Game.ctx;
    const cam = GameState.camera;

    for (const warning of bs.aoeWarnings) {
      if (warning.life <= 0) continue;
      const alpha = warning.life / warning.maxLife;
      const pulse = 0.5 + Math.sin(GameState.time / 100) * 0.3;

      ctx.save();
      ctx.translate(warning.x - cam.x, warning.y - cam.y);

      // Fill
      ctx.globalAlpha = alpha * 0.25;
      ctx.fillStyle = '#ff5252';
      ctx.beginPath();
      ctx.arc(0, 0, warning.radius, 0, Math.PI * 2);
      ctx.fill();

      // Dashed border (pulsing)
      ctx.globalAlpha = alpha * (0.6 + pulse * 0.4);
      ctx.strokeStyle = '#ff1744';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, warning.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Center warning icon
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#ff1744';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('⚠️', 0, 4);

      ctx.restore();
    }
  },

  renderBossGlow() {
    const bs  = this.bossState;
    const ctx = Game.ctx;
    const cam = GameState.camera;
    if (!bs.active || !bs.boss || !bs.boss.alive) return;

    const pulse = 0.4 + Math.sin(GameState.time / 200) * 0.3;
    const bx = bs.boss.x - cam.x;
    const by = bs.boss.y - cam.y;

    // Outer glow ring
    ctx.globalAlpha = pulse * 0.4;
    ctx.strokeStyle = bs.config.glowColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(bx, by, bs.boss.size + 15 + Math.sin(GameState.time / 150) * 5, 0, Math.PI * 2);
    ctx.stroke();

    // Phase indicator ring
    const phaseColors = ['rgba(255,255,255,0.27)', 'rgba(255,152,0,0.53)', 'rgba(255,0,0,0.53)'];
    ctx.globalAlpha = 0.6;
    ctx.strokeStyle = phaseColors[bs.currentPhase] || phaseColors[0];
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(bx, by, bs.boss.size + 5, 0, Math.PI * 2);
    ctx.stroke();

    ctx.globalAlpha = 1;
  },

  renderScreenEffects() {
    const bs  = this.bossState;
    const ctx = Game.ctx;

    // Screen shake (via canvas translate injected before renderTiles via wrap)
    // Slow vignette
    if (bs.slowEffect) {
      const w = Game.canvas.width;
      const h = Game.canvas.height;
      const grad = ctx.createRadialGradient(w/2, h/2, h*0.3, w/2, h/2, h*0.8);
      grad.addColorStop(0, 'rgba(79,195,247,0)');
      grad.addColorStop(1, 'rgba(79,195,247,0.15)');
      ctx.globalAlpha = 1;
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }
  },

  // ── Main update (gọi từ Game.update wrapper) ─────────────────
  update(dt) {
    this.updateBossAI(dt);
    BossHUD.update();
  },

  // ── Hook Game.render ─────────────────────────────────────────
  _hookGameRender() {
    const _origRender = Game.render.bind(Game);
    const self = this;

    Game.render = function() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      ctx.save();

      // Screen shake translate
      let shakeX = 0, shakeY = 0;
      if (self.bossState.screenShake > 0) {
        shakeX = Math.sin(GameState.time / 30) * Math.min(8, self.bossState.screenShake / 100);
        shakeY = shakeX * 0.5;
      }
      ctx.translate(-GameState.camera.x + shakeX, -GameState.camera.y + shakeY);

      this.renderTiles();
      this.renderTapIndicator();
      this.renderObjects();
      this.renderNPCs();

      // AOE warnings before player
      self.renderAoeWarnings();

      this.renderEnemies();
      this.renderPet();
      this.renderPlayer();
      this.renderParticles();

      // Boss glow after particles
      self.renderBossGlow();

      ctx.restore();

      this.renderDamageNumbers();

      if (GameState.minimapVisible) {
        this.renderMinimap();
      }

      // Screen overlay effects
      self.renderScreenEffects();
    };
  },

  // ── Hook Game.update ─────────────────────────────────────────
  _hookGameUpdate() {
    const _origUpdate = Game.update.bind(Game);
    const self = this;

    Game.update = function(dt) {
      _origUpdate.call(this, dt);
      self.update(dt);
      self.checkTimer();
    };
  },

  // ── Hook Game.save ───────────────────────────────────────────
  _hookGameSave() {
    const _origSave = Game.save.bind(Game);
    const self = this;

    Game.save = function() {
      _origSave.call(this);
      self.saveTimer();
    };
  },

  // ── Hook Game.load ───────────────────────────────────────────
  _hookGameLoad() {
    const _origLoad = Game.load.bind(Game);
    const self = this;

    Game.load = function() {
      const result = _origLoad.call(this);
      self.loadTimer();
      return result;
    };
  },

  // ── 2H. CSS & HTML Inject ────────────────────────────────────
  _injectStyles() {
    if (document.getElementById('bossEventStyles')) return;
    const style = document.createElement('style');
    style.id = 'bossEventStyles';
    style.textContent = `
      @keyframes blink {
        0%,100%{ opacity:1 }
        50%{ opacity:0.4 }
      }
      @keyframes bossShake {
        0%,100%{ transform:translate(0,0) }
        25%{ transform:translate(-3px,2px) }
        75%{ transform:translate(3px,-2px) }
      }
      @keyframes bossResultFadeIn {
        from{ opacity:0; transform:translate(-50%,-50%) scale(0.85) }
        to  { opacity:1; transform:translate(-50%,-50%) scale(1) }
      }
    `;
    document.head.appendChild(style);
  },

  _injectHUD() {
    if (document.getElementById('bossEventHUD')) return;
    const hud = document.createElement('div');
    hud.id = 'bossEventHUD';
    hud.style.cssText = `
      display:none; position:absolute; top:12px; left:50%;
      transform:translateX(-50%); z-index:20;
      min-width:300px; max-width:420px; pointer-events:none;
      background:rgba(0,0,0,0.65); border:1px solid #f0c04060;
      border-radius:8px; padding:8px 12px;
      font-family:'Courier New',monospace;
    `;
    hud.innerHTML = `
      <div style="text-align:center;margin-bottom:4px">
        <span id="bossEventName"  style="color:#f0c040;font-size:13px;font-weight:bold;
          text-shadow:0 0 10px rgba(240,192,64,0.6)"></span>
        <span id="bossEventPhase" style="color:#ff9800;font-size:10px;margin-left:8px"></span>
      </div>
      <div style="height:16px;background:#111;border:2px solid #f0c040;
        border-radius:6px;overflow:hidden;position:relative">
        <div id="bossEventHpFill" style="height:100%;
          background:linear-gradient(90deg,#c62828,#ef5350);
          transition:width 0.2s;width:100%"></div>
        <div id="bossEventHpText" style="position:absolute;top:50%;left:50%;
          transform:translate(-50%,-50%);color:#fff;font-size:9px;
          font-weight:bold;text-shadow:1px 1px 2px #000"></div>
      </div>
      <div style="display:flex;justify-content:space-between;margin-top:3px">
        <span id="bossEventTimer"  style="color:#8ef;font-size:9px"></span>
        <span id="bossEventContrib" style="color:#4caf50;font-size:9px"></span>
      </div>
      <div id="bossWarningBanner" style="display:none;text-align:center;
        color:#ff9800;font-size:11px;font-weight:bold;margin-top:4px;
        animation:blink 1s infinite"></div>
    `;
    document.body.appendChild(hud);
  },

  _injectResultScreen() {
    if (document.getElementById('bossResultOverlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'bossResultOverlay';
    overlay.style.cssText = `
      display:none; position:fixed; top:50%; left:50%;
      transform:translate(-50%,-50%); z-index:200;
      background:linear-gradient(135deg,#1a1a2e,#16213e);
      border:2px solid #f0c040; border-radius:12px;
      padding:20px 28px; min-width:280px; max-width:360px;
      font-family:'Courier New',monospace; color:#fff;
      text-align:center; animation:bossResultFadeIn 0.3s ease;
    `;
    overlay.innerHTML = `
      <div id="bossResultTitle"  style="font-size:18px;font-weight:bold;color:#f0c040;margin-bottom:8px"></div>
      <div id="bossResultSub"    style="font-size:11px;color:#8ef;margin-bottom:12px"></div>
      <div id="bossResultContrib" style="font-size:12px;margin-bottom:10px"></div>
      <div id="bossResultRewards" style="font-size:11px;text-align:left;
        background:rgba(255,255,255,0.05);border-radius:6px;padding:8px;margin-bottom:12px"></div>
      <button id="bossResultOkBtn" style="
        background:linear-gradient(90deg,#f0c040,#ff9800);
        color:#1a1a2e;border:none;border-radius:6px;
        padding:8px 24px;font-size:12px;font-weight:bold;
        cursor:pointer;font-family:'Courier New',monospace">
        OK
      </button>
    `;
    document.body.appendChild(overlay);

    document.getElementById('bossResultOkBtn').addEventListener('click', () => {
      overlay.style.display = 'none';
    });
  }
};

// ==============================================================
// BossHUD — HP bar top center
// ==============================================================

const BossHUD = {
  show(bossName) {
    const hud = document.getElementById('bossEventHUD');
    if (hud) hud.style.display = 'block';
    const nameEl = document.getElementById('bossEventName');
    if (nameEl && bossName) nameEl.textContent = bossName;
    this.hideWarning();
  },

  hide() {
    const hud = document.getElementById('bossEventHUD');
    if (hud) hud.style.display = 'none';
    this.hideWarning();
  },

  hideWarning() {
    const banner = document.getElementById('bossWarningBanner');
    if (banner) { banner.style.display = 'none'; banner.textContent = ''; }
  },

  update() {
    const bs = BossEventSystem.bossState;
    if (!bs.active || !bs.boss) return;

    // HP bar
    const pct = Math.max(0, bs.boss.hp / bs.boss.maxHp * 100);
    const fill = document.getElementById('bossEventHpFill');
    const text = document.getElementById('bossEventHpText');
    if (fill) fill.style.width = pct.toFixed(1) + '%';
    if (text) text.textContent = Utils.formatNumber(Math.max(0, bs.boss.hp)) + ' / ' + Utils.formatNumber(bs.boss.maxHp);

    // Phase
    const phaseEl = document.getElementById('bossEventPhase');
    if (phaseEl && bs.config) {
      const p = bs.config.phases[bs.currentPhase];
      phaseEl.textContent = p ? '[' + p.name + ']' : '';
    }

    // Timer
    const elapsed = Date.now() - bs.spawnTime;
    const remaining = Math.max(0, BOSS_EVENT_CONFIG.bossLifetime - elapsed);
    const timerEl = document.getElementById('bossEventTimer');
    if (timerEl) {
      const s = Math.floor(remaining / 1000);
      timerEl.textContent = '⏱ ' + Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
    }

    // Contribution
    const contrib = bs.boss.maxHp > 0 ? (bs.damageDealt / bs.boss.maxHp * 100) : 0;
    const cEl = document.getElementById('bossEventContrib');
    if (cEl) cEl.textContent = '💥 ' + contrib.toFixed(1) + '%';
  },

  updateCountdown(timeUntil) {
    const banner = document.getElementById('bossWarningBanner');
    if (!banner) return;

    const hud = document.getElementById('bossEventHUD');
    if (hud && hud.style.display === 'none') hud.style.display = 'block';

    const s = Math.floor(timeUntil / 1000);
    const mm = Math.floor(s / 60);
    const ss = String(s % 60).padStart(2, '0');
    banner.style.display = 'block';
    banner.textContent = `⚠️ Boss Event sau ${mm}:${ss}!`;
  }
};

// ==============================================================
// BossResultScreen
// ==============================================================

const BossResultScreen = {
  _timeout: null,

  show(contribution, rewards, escaped) {
    const overlay = document.getElementById('bossResultOverlay');
    if (!overlay) return;

    const bs = BossEventSystem.bossState;
    const bossName = bs.config ? bs.config.name : 'Boss';
    const mapName  = (Maps && Maps.getCurrent) ? Maps.getCurrent().name : '';

    // Title
    const titleEl = document.getElementById('bossResultTitle');
    if (titleEl) {
      titleEl.textContent = escaped ? '💨 Boss Rút Lui' : '🏆 Boss Đã Bị Hạ!';
      titleEl.style.color = escaped ? '#ff9800' : '#f0c040';
    }

    // Sub
    const subEl = document.getElementById('bossResultSub');
    if (subEl) subEl.textContent = bossName + (mapName ? ' — ' + mapName : '');

    // Contribution
    const cEl = document.getElementById('bossResultContrib');
    if (cEl) {
      const pct = (contribution * 100).toFixed(1);
      const col = contribution >= 0.05 ? '#4caf50' : '#f44336';
      const star = (contribution >= 0.05) ? ' 🌟 Top Contributor!' : '';
      cEl.innerHTML = `<span style="color:${col}">Đóng góp sát thương: ${pct}%${star}</span>`;
    }

    // Rewards
    const rEl = document.getElementById('bossResultRewards');
    if (rEl) {
      if (escaped) {
        rEl.innerHTML = '<span style="color:#888">Không có phần thưởng</span>';
      } else {
        let html = '<b style="color:#f0c040">Phần thưởng:</b><br>';
        html += `<span style="color:#ffeb3b">+${Utils.formatNumber(rewards.exp)} EXP`;
        if (rewards.rewardMul > 0) html += ` <span style="color:#8ef">(x${rewards.rewardMul.toFixed(2)})</span>`;
        html += '</span><br>';
        html += `<span style="color:#ffd700">+${Utils.formatNumber(rewards.gold)} 💰`;
        if (rewards.rewardMul > 0) html += ` <span style="color:#8ef">(x${rewards.rewardMul.toFixed(2)})</span>`;
        html += '</span><br>';
        for (const itemName of (rewards.items || [])) {
          html += `<span style="color:#e040fb">📦 ${itemName}</span><br>`;
        }
        rEl.innerHTML = html;
      }
    }

    overlay.style.display = 'block';

    // Auto close after 6s
    if (this._timeout) clearTimeout(this._timeout);
    this._timeout = setTimeout(() => {
      if (overlay) overlay.style.display = 'none';
    }, 6000);
  }
};

// ==============================================================
// PHẦN 3 — KHỞI ĐỘNG
// ==============================================================

// Wrap Game.init để chạy BossEventSystem.init() sau khi game init xong
(function() {
  const _origInit = Game.init.bind(Game);

  Game.init = function() {
    _origInit.call(this);
    // Chạy sau một tick để đảm bảo DOM sẵn sàng
    setTimeout(() => {
      BossEventSystem.init();
    }, 0);
  };
})();

console.log('👹 Boss Event System loaded');
// Thêm vào index.html sau <script src="js/game.js"></script>:
// <script src="js/feature_boss_event.js"></script>
