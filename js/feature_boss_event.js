// ===== FILE: js/feature_boss_event.js =====
// ==================== BOSS EVENT SYSTEM ====================
// File: js/feature_boss_event.js

//
// NGUYÊN TẮC:
// - Mỗi event chọn RANDOM 1 boss (→ 1 map duy nhất)
// - Boss chỉ tồn tại trong Enemies.list của map đó
// - AI/AOE/damage chỉ chạy khi Maps.currentIndex === bossState.spawnedMapIndex
// - Khi player đổi map (Enemies.spawnForMap clear list), boss object mất
//   → system tự phát hiện (boss === null) và xử lý đúng cách
// - Không sửa file gốc — chỉ monkey-patch / wrap

// ==============================================================
// PHẦN 1 — DATA & CONFIG
// ==============================================================

const BOSS_EVENT_CONFIG = {
  minInterval:   30 * 60 * 1000,
  maxInterval:   60 * 60 * 1000,
  warningTime:    5 * 60 * 1000,
  bossLifetime:  10 * 60 * 1000,
  storageKey: 'tuxien_boss_event',
  warningDuration: 1200,

  bosses: {
    boss_colong: {
      id: 'boss_colong', name: '🐉 Cổ Long Giác', mapIndex: 0,
      hpMul: 15, atkMul: 4, size: 32,
      color: '#228b22', glowColor: '#90ee90', sprite: 'boar',
      exp: 2000, gold: 600,
      drops: [
        { id: 'dragonScale',    chance: 0.8 },
        { id: 'celestialOrb',   chance: 0.2 },
        { id: 'celestialSword', chance: 0.05 }
      ],
      phases: [
        { threshold: 1.0, name: 'Bình Thường', speedMul: 1.0, atkMul: 1.0, color: '#228b22' },
        { threshold: 0.6, name: 'Cuồng Nộ',   speedMul: 1.3, atkMul: 1.5, color: '#d4a017' },
        { threshold: 0.3, name: 'Bạo Phát',   speedMul: 1.6, atkMul: 2.2, color: '#ff4500' }
      ],
      skills: [
        { name: 'Rồng Tức',      cd: 6000,  type: 'aoe_circle', radius: 150, dmgMul: 3,   phase: 0 },
        { name: 'Đuôi Quét',     cd: 8000,  type: 'charge',     speed: 8,   dmgMul: 2,   duration: 800, phase: 0 },
        { name: 'Hơi Thở Rồng', cd: 10000, type: 'aoe_circle', radius: 200, dmgMul: 4,   phase: 1 }
      ]
    },
    boss_minhvuong: {
      id: 'boss_minhvuong', name: '👻 Minh Vương', mapIndex: 1,
      hpMul: 18, atkMul: 5, size: 30,
      color: '#4b0082', glowColor: '#e040fb', sprite: 'ghost',
      exp: 3500, gold: 900,
      drops: [
        { id: 'demonCore',   chance: 0.9 },
        { id: 'spiritStone', chance: 0.6 },
        { id: 'flameSword',  chance: 0.08 }
      ],
      phases: [
        { threshold: 1.0, name: 'Bình Thường', speedMul: 1.0, atkMul: 1.0, color: '#4b0082' },
        { threshold: 0.6, name: 'Cuồng Nộ',   speedMul: 1.3, atkMul: 1.5, color: '#8b00ff' },
        { threshold: 0.3, name: 'Bạo Phát',   speedMul: 1.6, atkMul: 2.2, color: '#ff00ff' }
      ],
      skills: [
        { name: 'Triệu Hồn',    cd: 12000, type: 'summon',      enemyType: 'ghost', count: 4, phase: 0 },
        { name: 'Bóng Tối',     cd: 7000,  type: 'aoe_circle',  radius: 180, dmgMul: 3.5,    phase: 0 },
        { name: 'Hắc Ám Bùa',  cd: 15000, type: 'shield',      duration: 4000,               phase: 1 },
        { name: 'Địa Ngục Mở', cd: 18000, type: 'berserk_aoe', radius: 250, dmgMul: 5,       phase: 2 }
      ]
    },
    boss_viamdе: {
      id: 'boss_viamdе', name: '🔥 Viêm Đế', mapIndex: 2,
      hpMul: 22, atkMul: 6, size: 34,
      color: '#ff4500', glowColor: '#ff6600', sprite: 'demon',
      exp: 5000, gold: 1200,
      drops: [
        { id: 'flameSword',  chance: 0.25 },
        { id: 'dragonScale', chance: 0.5 },
        { id: 'realmPill',   chance: 0.4 }
      ],
      phases: [
        { threshold: 1.0, name: 'Bình Thường', speedMul: 1.0, atkMul: 1.0, color: '#ff4500' },
        { threshold: 0.6, name: 'Cuồng Nộ',   speedMul: 1.3, atkMul: 1.5, color: '#ff6600' },
        { threshold: 0.3, name: 'Bạo Phát',   speedMul: 1.6, atkMul: 2.2, color: '#ffffff' }
      ],
      skills: [
        { name: 'Thiêu Đốt', cd: 6000,  type: 'aoe_circle', radius: 160, dmgMul: 3,   phase: 0 },
        { name: 'Lao Thẳng', cd: 8000,  type: 'charge',     speed: 10,  dmgMul: 2.5, duration: 600, phase: 0 },
        { name: 'Bão Lửa',   cd: 10000, type: 'aoe_circle', radius: 220, dmgMul: 4.5, phase: 1 },
        { name: 'Núi Lửa',   cd: 14000, type: 'summon',     enemyType: 'fireSpirit', count: 5, phase: 2 }
      ]
    },
    boss_banghoang: {
      id: 'boss_banghoang', name: '❄️ Băng Hoàng', mapIndex: 3,
      hpMul: 28, atkMul: 7, size: 36,
      color: '#00bcd4', glowColor: '#80deea', sprite: 'boar',
      exp: 7000, gold: 1600,
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
        { name: 'Bão Tuyết',     cd: 7000,  type: 'aoe_circle',  radius: 200, dmgMul: 3.5, slowEffect: true, phase: 0 },
        { name: 'Lao Băng',      cd: 9000,  type: 'charge',       speed: 9,   dmgMul: 3,   duration: 700, phase: 0 },
        { name: 'Tường Băng',    cd: 15000, type: 'shield',       duration: 5000, phase: 1 },
        { name: 'Địa Ngục Băng', cd: 18000, type: 'berserk_aoe',  radius: 300, dmgMul: 6,  phase: 2 }
      ]
    },
    boss_thaicoma: {
      id: 'boss_thaicoma', name: '😈 Thái Cổ Ma', mapIndex: 4,
      hpMul: 35, atkMul: 9, size: 38,
      color: '#8b0000', glowColor: '#ff1744', sprite: 'demon',
      exp: 10000, gold: 2200,
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
        { name: 'Ma Khí Bùng Phát', cd: 7000,  type: 'aoe_circle',  radius: 220, dmgMul: 4, phase: 0 },
        { name: 'Triệu Tà',         cd: 12000, type: 'summon',      enemyType: 'darkDemon', count: 3, phase: 0 },
        { name: 'Bạo Tán',          cd: 15000, type: 'berserk_aoe', radius: 280, dmgMul: 7,
          extraSummon: { type: 'shadowLord', count: 2 }, phase: 2 }
      ]
    },
    boss_tienlong: {
      id: 'boss_tienlong', name: '✨ Tiên Long', mapIndex: 5,
      hpMul: 50, atkMul: 12, size: 40,
      color: '#ffd700', glowColor: '#ffffff', sprite: 'demon',
      exp: 15000, gold: 3000,
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
        { name: 'Tiên Quang',  cd: 8000,  type: 'aoe_circle',      radius: 250, dmgMul: 5, phase: 0 },
        { name: 'Dịch Chuyển', cd: 6000,  type: 'teleport_charge', dmgMul: 4,              phase: 0 },
        { name: 'Thiên Lôi',   cd: 10000, type: 'triple_aoe',      radius: 300, dmgMul: 6, phase: 1 },
        { name: 'Hủy Diệt',   cd: 18000, type: 'berserk_aoe',     radius: 350, dmgMul: 8,
          screenShakeMs: 1000, phase: 2 }
      ]
    }
  }
};

// ==============================================================
// PHẦN 2 — LOGIC MODULE
// ==============================================================

const BossEventSystem = {

  timerState: { nextEventTime: 0, lastSaveTime: 0 },

  bossState: {
    active: false,
    boss: null,             // enemy object trong Enemies.list (chỉ valid khi player ở đúng map)
    bossId: null,
    config: null,
    spawnedMapIndex: -1,    // ← map duy nhất boss thuộc về
    spawnTime: 0,
    currentPhase: 0,
    damageDealt: 0,
    baseAtk: 0,
    baseSpeed: 1.2,
    skills: [],
    aoeWarnings: [],
    chargeState: null,
    shieldActive: false,
    shieldTimer: 0,
    _preShieldColor: null,
    slowEffect: null,
    screenShake: 0,
    _attackTimer: 1500
  },

  // ── Guard: player có đang ở map boss không? ─────────────────
  _onBossMap() {
    return this.bossState.active &&
           Maps.currentIndex === this.bossState.spawnedMapIndex;
  },

  // ===========================================================
  // Init
  // ===========================================================
  init() {
    this._injectStyles();
    this._injectHUD();
    this._injectResultScreen();
    this._resetState();
    this.initTimer();
    this._hookSpawnForMap();
    this._hookEnemiesDamageKill();
    this._hookGameRender();
    this._hookGameUpdate();
    this._hookGameSave();
    this._hookGameLoad();
  },

  _resetState() {
    Object.assign(this.bossState, {
      active: false, boss: null, bossId: null, config: null,
      spawnedMapIndex: -1, spawnTime: 0, currentPhase: 0,
      damageDealt: 0, baseAtk: 0, baseSpeed: 1.2,
      skills: [], aoeWarnings: [], chargeState: null,
      shieldActive: false, shieldTimer: 0, _preShieldColor: null,
      slowEffect: null, screenShake: 0, _attackTimer: 1500
    });
  },

  // ===========================================================
  // Timer
  // ===========================================================
  initTimer() {
    try {
      const raw = localStorage.getItem(BOSS_EVENT_CONFIG.storageKey);
      if (raw) { const s = JSON.parse(raw); this.timerState.nextEventTime = s.nextEventTime || 0; }
    } catch (_) {}
    const now = Date.now();
    if (!this.timerState.nextEventTime || this.timerState.nextEventTime <= now) {
      this._scheduleNext(now);
    }
    this.saveTimer();
  },

  _scheduleNext(now) {
    this.timerState.nextEventTime = (now || Date.now()) +
      Utils.random(BOSS_EVENT_CONFIG.minInterval, BOSS_EVENT_CONFIG.maxInterval);
  },

  saveTimer() {
    this.timerState.lastSaveTime = Date.now();
    localStorage.setItem(BOSS_EVENT_CONFIG.storageKey, JSON.stringify(this.timerState));
  },

  loadTimer() {
    try {
      const raw = localStorage.getItem(BOSS_EVENT_CONFIG.storageKey);
      if (raw) { const s = JSON.parse(raw); this.timerState.nextEventTime = s.nextEventTime || 0; }
    } catch (_) {}
    const now = Date.now();
    if (!this.timerState.nextEventTime || this.timerState.nextEventTime <= now) this._scheduleNext(now);
    this.saveTimer();
  },

  _lastWarnLog: 0,

  checkTimer() {
    if (this.bossState.active) return;
    const now  = Date.now();
    const left = this.timerState.nextEventTime - now;

    if (left <= 0) {
      this.spawnBoss();
      this._scheduleNext(now);
      this.saveTimer();
      return;
    }

    if (left <= BOSS_EVENT_CONFIG.warningTime) {
      BossHUD.updateCountdown(left);
      if (now - this._lastWarnLog > 60000) {
        this._lastWarnLog = now;
        const m = Math.floor(left / 60000), s = Math.floor((left % 60000) / 1000);
        UI.addLog('⚠️ Boss Event xuất hiện sau ' + m + 'm' + s + 's!', 'system');
      }
    }
  },

  // ===========================================================
  // Spawn boss — chọn RANDOM 1 boss bất kỳ
  // ===========================================================
  spawnBoss() {
    const ids    = Object.keys(BOSS_EVENT_CONFIG.bosses);
    const bossId = ids[Math.floor(Math.random() * ids.length)];
    const config = BOSS_EVENT_CONFIG.bosses[bossId];
    const targetMapIndex = config.mapIndex;
    const targetMap      = Maps.data[targetMapIndex];
    if (!targetMap) return;

    // Tạo enemy object và add vào Enemies.list
    const e = Enemies.spawn(config.sprite, 1, Player.level + 5);
    if (!e) return;

    e.name        = config.name;
    e.hp          = Math.floor(Player.maxHp * 20 * config.hpMul);
    e.maxHp       = e.hp;
    e.atk         = Math.floor(Player.atk * 5 * config.atkMul);
    e.size        = config.size;
    e.color       = config.color;
    e.boss        = true;
    e.isBossEvent = true;   // flag phân biệt
    e.exp         = config.exp;
    e.gold        = config.gold;
    e.drops       = config.drops;
    e.x = e.spawnX = CONFIG.WORLD_WIDTH  * CONFIG.TILE_SIZE / 2;
    e.y = e.spawnY = CONFIG.WORLD_HEIGHT * CONFIG.TILE_SIZE / 2;
    e.aggroed     = true;

    Object.assign(this.bossState, {
      active: true, boss: e, bossId, config,
      spawnedMapIndex: targetMapIndex,
      spawnTime: Date.now(),
      currentPhase: 0, damageDealt: 0,
      baseAtk: e.atk, baseSpeed: 1.2,
      skills: config.skills.map(s => ({ ...s, currentCd: s.cd * 0.3 })),
      aoeWarnings: [], chargeState: null,
      shieldActive: false, shieldTimer: 0, _preShieldColor: null,
      slowEffect: null, screenShake: 500, _attackTimer: 1500
    });

    const onBossMap = (Maps.currentIndex === targetMapIndex);
    const mapName   = targetMap.name;

    if (onBossMap) {
      UI.showNotification('⚔️ ' + config.name, 'Boss Event xuất hiện!');
      UI.addLog('🔥 Boss Event: ' + config.name + ' xuất hiện!', 'system');
      BossHUD.show(config.name);
      this._particlesBurst(e.x, e.y, config.glowColor, 50);
    } else {
      // Player ở map khác — thông báo nhẹ, hiện remote HUD
      // Boss vẫn nằm trong Enemies.list (của map hiện tại, sẽ bị clear khi travelTo)
      // Nhưng AI chỉ chạy khi _onBossMap() === true nên không gây hại
      UI.addLog('📡 Boss Event: ' + config.name + ' xuất hiện tại [' + mapName + ']!', 'system');
      UI.showNotification('📡 Boss Event', config.name + ' tại ' + mapName);
      BossHUD.showRemote(config.name, mapName);
    }

  },

  _particlesBurst(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      GameState.particles.push({
        x: x + (Math.random() - 0.5) * 80,
        y: y + (Math.random() - 0.5) * 80,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6 - 2,
        life: 800, color: color, size: 4 + Math.random() * 5
      });
    }
  },

  // ===========================================================
  // Hook Enemies.spawnForMap — phát hiện player đổi map
  // ===========================================================
  _hookSpawnForMap() {
    const _orig = Enemies.spawnForMap.bind(Enemies);
    const self  = this;

    Enemies.spawnForMap = function(mapIndex) {
      const bs = self.bossState;

      // Cleanup boss state trước khi clear Enemies.list, bất kể player đi map nào
      if (bs.active && bs.boss) {
        self._cleanupSlowEffect();
        self._clearAoeTimeouts();
        bs.boss = null; // _orig sẽ clear list; ta respawn nếu cần sau _orig
      }

      _orig.call(Enemies, mapIndex);

      // Nếu event đang active và player vừa vào đúng map boss → spawn lại boss
      if (bs.active && bs.boss === null && mapIndex === bs.spawnedMapIndex) {
        self._respawnBossOnMap();
      }

      // Nếu event active nhưng player vừa rời map boss → switch HUD sang remote
      if (bs.active && bs.boss === null && mapIndex !== bs.spawnedMapIndex) {
        const remaining = BOSS_EVENT_CONFIG.bossLifetime - (Date.now() - bs.spawnTime);
        if (remaining <= 0) {
          // Hết giờ — kết thúc event
          bs.active = false;
          BossHUD.hide();
          self._scheduleNext(Date.now());
          self.saveTimer();
          UI.addLog('💨 Boss Event đã kết thúc.', 'system');
        } else {
          const mapName = Maps.data[bs.spawnedMapIndex] ? Maps.data[bs.spawnedMapIndex].name : '???';
          BossHUD.showRemote(bs.config.name, mapName);
        }
      }
    };
  },

  // Spawn lại boss khi player quay về đúng map và còn thời gian
  _respawnBossOnMap() {
    const bs        = this.bossState;
    const remaining = BOSS_EVENT_CONFIG.bossLifetime - (Date.now() - bs.spawnTime);
    if (remaining <= 0 || !bs.config) {
      bs.active = false;
      BossHUD.hide();
      this._scheduleNext(Date.now());
      this.saveTimer();
      return;
    }

    const config = bs.config;
    const e      = Enemies.spawn(config.sprite, 1, Player.level + 5);
    if (!e) return;

    e.name        = config.name;
    e.maxHp       = Math.floor(Player.maxHp * 20 * config.hpMul);
    e.hp          = Math.floor(e.maxHp * 0.8); // giả định đã bị đánh một phần
    e.atk         = Math.floor(Player.atk * 5 * config.atkMul);
    e.size        = config.size;
    e.color       = config.phases[bs.currentPhase].color;
    e.boss        = true;
    e.isBossEvent = true;
    e.exp         = config.exp;
    e.gold        = config.gold;
    e.drops       = config.drops;
    e.x = e.spawnX = CONFIG.WORLD_WIDTH  * CONFIG.TILE_SIZE / 2;
    e.y = e.spawnY = CONFIG.WORLD_HEIGHT * CONFIG.TILE_SIZE / 2;
    e.aggroed     = true;

    bs.boss        = e;
    bs.chargeState = null;
    bs.aoeWarnings = [];
    bs.shieldActive = false;
    bs.screenShake  = 300;
    bs._attackTimer = 1500;

    UI.addLog('⚔️ ' + config.name + ' vẫn đang chờ tại đây!', 'system');
    BossHUD.show(config.name);
    this._particlesBurst(e.x, e.y, config.glowColor, 25);
  },

  // ===========================================================
  // Hook Enemies.damage & kill
  // ===========================================================
  _hookEnemiesDamageKill() {
    const _origDmg  = Enemies.damage.bind(Enemies);
    const _origKill = Enemies.kill.bind(Enemies);
    const self      = this;

    Enemies.damage = function(enemy, amount, isCrit, color) {
      if (enemy && enemy.isBossEvent) {
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
        self._onBossKilled();
      } else {
        _origKill(enemy);
      }
    };
  },

  _onBossKilled() {
    const bs = this.bossState;
    if (!bs.active || !bs.config) return;
    bs.active = false;

    const maxHp       = bs.boss ? bs.boss.maxHp : 1;
    const contrib     = Math.min(1, bs.damageDealt / maxHp);
    const rewardMul   = contrib >= 0.05 ? Math.min(2.0, 1.0 + contrib) : 0.3;
    const gainedExp   = Math.floor(bs.config.exp  * rewardMul);
    const gainedGold  = Math.floor(bs.config.gold * rewardMul);

    Player.gainExp(gainedExp);
    Player.gold += gainedGold;
    UI.updateGold();

    const gotItems = [];
    for (const drop of bs.config.drops) {
      if (ITEMS[drop.id] && Utils.chance(Math.min(1, drop.chance * rewardMul))) {
        if (Inventory.add(drop.id, 1)) {
          gotItems.push(ITEMS[drop.id].name);
          UI.addLog('📦 Nhận ' + ITEMS[drop.id].name + '!', 'item');
        }
      }
    }

    UI.showNotification('🏆 Boss Đã Bị Hạ!', bs.config.name);
    UI.addLog('🏆 ' + bs.config.name + ' đã bị hạ gục!', 'system');
    BossResultScreen.show(contrib, { exp: gainedExp, gold: gainedGold, rewardMul, items: gotItems }, false, bs.config.name);
    BossHUD.hide();
    bs.screenShake = 1500;
    this._cleanupSlowEffect();
    this._clearAoeTimeouts();

    if (bs.boss) {
      const ec = ['#ffd700','#ff4500','#ff1744','#ff9800','#ffffff','#e040fb'];
      this._particlesBurst(bs.boss.x, bs.boss.y, ec[Math.floor(Math.random() * ec.length)], 80);
      // Screen flash
      const f = document.createElement('div');
      f.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:#fff;' +
        'opacity:0.8;z-index:9999;pointer-events:none;transition:opacity 0.5s';
      document.body.appendChild(f);
      requestAnimationFrame(() => {
        f.style.opacity = '0';
        setTimeout(() => f.parentNode && f.parentNode.removeChild(f), 600);
      });
    }
  },

  despawnBoss() {
    const bs   = this.bossState;
    const name = bs.config ? bs.config.name : 'Boss';
    this._cleanupSlowEffect();
    this._clearAoeTimeouts();
    if (bs.boss) {
      const i = Enemies.list.indexOf(bs.boss);
      if (i !== -1) Enemies.list.splice(i, 1);
    }
    bs.active = false;
    bs.boss   = null;
    BossHUD.hide();
    UI.addLog('💨 ' + name + ' rút lui!', 'system');
    BossResultScreen.show(0, { exp: 0, gold: 0, rewardMul: 0, items: [] }, true, name);
    this._scheduleNext(Date.now());
    this.saveTimer();
  },

  _cleanupSlowEffect() {
    if (this.bossState.slowEffect) {
      Player.speed = this.bossState.slowEffect.originalSpeed;
      this.bossState.slowEffect = null;
    }
  },

  _clearAoeTimeouts() {
    for (const w of this.bossState.aoeWarnings) {
      if (w._tid) clearTimeout(w._tid);
    }
    this.bossState.aoeWarnings = [];
  },

  // ===========================================================
  // Phase
  // ===========================================================
  checkPhase() {
    const bs = this.bossState;
    if (!bs.boss || !bs.boss.alive) return;
    const hp = bs.boss.hp / bs.boss.maxHp;
    const np = hp < 0.3 ? 2 : hp < 0.6 ? 1 : 0;
    if (np > bs.currentPhase) {
      bs.currentPhase = np;
      const pc = bs.config.phases[np];
      bs.boss.color = pc.color;
      this._particlesBurst(bs.boss.x, bs.boss.y, pc.color, 30);
      UI.addLog('⚡ ' + bs.config.name + ' — ' + pc.name + '!', 'system');
      UI.showNotification('⚡ Phase Mới!', bs.config.name + ' ' + pc.name);
      bs.screenShake = 800;
    }
  },

  getBossAtk()  { const bs = this.bossState; return Math.floor(bs.baseAtk * bs.config.phases[bs.currentPhase].atkMul); },
  getBossSpeed() { const bs = this.bossState; return bs.baseSpeed * bs.config.phases[bs.currentPhase].speedMul; },

  // ===========================================================
  // Skills
  // ===========================================================
  updateSkills(dt) {
    const bs = this.bossState;
    for (const sk of bs.skills) {
      if (sk.currentCd > 0) sk.currentCd -= dt;
      if (sk.currentCd <= 0 && bs.currentPhase >= (sk.phase || 0)) {
        sk.currentCd = sk.cd;
        this.castSkill(sk);
        break;
      }
    }
  },

  castSkill(sk) {
    const bs = this.bossState;
    if (!bs.boss || !bs.boss.alive) return;
    UI.addLog('⚡ ' + bs.config.name + ' dùng ' + sk.name + '!', 'system');
    switch (sk.type) {
      case 'aoe_circle':      this._castAoe(sk);           break;
      case 'berserk_aoe':     this._castBerserkAoe(sk);    break;
      case 'charge':          this._castCharge(sk);        break;
      case 'summon':          this._castSummon(sk);        break;
      case 'shield':          this._castShield(sk);        break;
      case 'teleport_charge': this._castTeleportCharge(sk);break;
      case 'triple_aoe':      this._castTripleAoe(sk);     break;
    }
  },

  _dmg(mul) { return Math.floor(Player.atk * (mul || 1)); },

  _addWarning(x, y, radius, damage, color, slowEffect) {
    const wd = BOSS_EVENT_CONFIG.warningDuration;
    const w  = { x, y, radius, life: wd, maxLife: wd, damage, color: color || '#ff5252', slowEffect: !!slowEffect, _tid: null };
    this.bossState.aoeWarnings.push(w);
    w._tid = setTimeout(() => { if (this.bossState.active) this._resolveAoe(w); }, wd);
  },

  _castAoe(sk) {
    const bs = this.bossState;
    this._addWarning(bs.boss.x, bs.boss.y, sk.radius, this._dmg(sk.dmgMul), '#ff5252', sk.slowEffect);
  },

  _castBerserkAoe(sk) {
    const bs  = this.bossState;
    const dmg = this._dmg(sk.dmgMul);
    this._addWarning(bs.boss.x, bs.boss.y, sk.radius, dmg, '#ff1744', false);
    for (let i = 0; i < 3; i++) {
      const a = Math.random() * Math.PI * 2, r = 150 + Math.random() * 100;
      this._addWarning(bs.boss.x + Math.cos(a) * r, bs.boss.y + Math.sin(a) * r,
        sk.radius * 0.4, Math.floor(dmg * 0.6), '#ff5252', false);
    }
    if (sk.extraSummon) {
      for (let i = 0; i < sk.extraSummon.count; i++) {
        const s = Enemies.spawn(sk.extraSummon.type, 1, Player.level + 2);
        if (s) { s.x = bs.boss.x + (Math.random()-0.5)*150; s.y = bs.boss.y + (Math.random()-0.5)*150; s.aggroed = true; }
      }
    }
    if (sk.screenShakeMs) bs.screenShake = Math.max(bs.screenShake, sk.screenShakeMs);
  },

  _castCharge(sk) {
    const bs = this.bossState;
    bs.chargeState = {
      targetX: Player.x, targetY: Player.y,
      speed: (sk.speed || 8) * CONFIG.TILE_SIZE * 0.1,
      damage: this._dmg(sk.dmgMul),
      timer: sk.duration || 800, active: true
    };
  },

  _castSummon(sk) {
    const bs = this.bossState;
    for (let i = 0; i < sk.count; i++) {
      const a = Math.PI * 2 / sk.count * i, r = 100 + Math.random() * 100;
      const s = Enemies.spawn(sk.enemyType, 1, Player.level);
      if (s) { s.x = bs.boss.x + Math.cos(a)*r; s.y = bs.boss.y + Math.sin(a)*r; s.aggroed = true; }
    }
    UI.addLog('💀 ' + bs.config.name + ' triệu hồi tay sai!', 'system');
  },

  _castShield(sk) {
    const bs = this.bossState;
    bs.shieldActive = true; bs.shieldTimer = sk.duration;
    bs._preShieldColor = bs.boss.color; bs.boss.color = '#ffffff';
    UI.addLog('🛡️ ' + bs.config.name + ' kích hoạt khiên!', 'system');
  },

  _castTeleportCharge(sk) {
    const bs = this.bossState;
    const a  = Math.random() * Math.PI * 2, r = 150 + Math.random() * 50;
    bs.boss.x = Utils.clamp(Player.x + Math.cos(a)*r, 50, CONFIG.WORLD_WIDTH  * CONFIG.TILE_SIZE - 50);
    bs.boss.y = Utils.clamp(Player.y + Math.sin(a)*r, 50, CONFIG.WORLD_HEIGHT * CONFIG.TILE_SIZE - 50);
    this._castCharge(sk);
  },

  _castTripleAoe(sk) {
    const bs = this.bossState, dmg = this._dmg(sk.dmgMul);
    this._addWarning(bs.boss.x, bs.boss.y, sk.radius, dmg, '#ff5252', false);
    for (let i = 0; i < 3; i++) {
      const a = Math.random()*Math.PI*2, r = 150 + Math.random()*100;
      this._addWarning(bs.boss.x + Math.cos(a)*r, bs.boss.y + Math.sin(a)*r,
        100 + Math.random()*60, Math.floor(dmg*0.5), '#ff9800', false);
    }
  },

  // ── Resolve AOE — GUARD: chỉ damage khi player ở đúng map ──
  _resolveAoe(w) {
    const bs  = this.bossState;
    const idx = bs.aoeWarnings.indexOf(w);

    // Nếu player không ở map boss → bỏ qua damage hoàn toàn
    if (!this._onBossMap()) {
      if (idx !== -1) bs.aoeWarnings.splice(idx, 1);
      return;
    }

    if (Utils.dist(Player.x, Player.y, w.x, w.y) <= w.radius) {
      Player.takeDamage(w.damage, bs.config ? bs.config.name : 'Boss');
      if (w.slowEffect && !bs.slowEffect) {
        bs.slowEffect = { originalSpeed: Player.speed, endTime: Date.now() + 2000 };
        Player.speed *= 0.5;
        this._particlesBurst(Player.x, Player.y, '#4fc3f7', 10);
      }
    }

    if (typeof PartySystem !== 'undefined' && PartySystem && PartySystem.members) {
      for (const m of PartySystem.members) {
        if (Utils.dist(m.x, m.y, w.x, w.y) <= w.radius) PartySystem.damageMember(m, Math.floor(w.damage * 0.7));
      }
    }

    // Hit particles
    for (let i = 0; i < 6; i++) {
      GameState.particles.push({
        x: w.x + (Math.random()-0.5)*w.radius*0.8, y: w.y + (Math.random()-0.5)*w.radius*0.8,
        vx: (Math.random()-0.5)*4, vy: (Math.random()-0.5)*4-1,
        life: 400, color: '#ff5252', size: 3 + Math.random()*4
      });
    }

    if (idx !== -1) bs.aoeWarnings.splice(idx, 1);
  },

  updateCharge(dt) {
    const bs = this.bossState;
    if (!bs.chargeState || !bs.chargeState.active || !bs.boss || !bs.boss.alive) {
      if (bs.chargeState && !bs.boss) bs.chargeState = null;
      return;
    }
    const cs = bs.chargeState;
    const dx = cs.targetX - bs.boss.x, dy = cs.targetY - bs.boss.y;
    const d  = Math.sqrt(dx*dx + dy*dy);
    if (d > 5) { bs.boss.x += dx/d*cs.speed; bs.boss.y += dy/d*cs.speed; }
    cs.timer -= dt;
    if (d < 30 || cs.timer <= 0) {
      // GUARD: damage chỉ khi player ở đúng map
      if (this._onBossMap()) {
        if (Utils.dist(bs.boss.x, bs.boss.y, Player.x, Player.y) < bs.boss.size + 20)
          Player.takeDamage(cs.damage, bs.config.name);
        if (typeof PartySystem !== 'undefined' && PartySystem && PartySystem.members) {
          for (const m of PartySystem.members)
            if (Utils.dist(bs.boss.x, bs.boss.y, m.x, m.y) < bs.boss.size + 20)
              PartySystem.damageMember(m, Math.floor(cs.damage*0.7));
        }
      }
      cs.active = false;
    }
  },

  // ===========================================================
  // Boss AI — chỉ chạy khi player ở đúng map
  // ===========================================================
  updateBossAI(dt) {
    const bs = this.bossState;
    if (!bs.active) return;

    // Hết giờ tổng
    if (Date.now() - bs.spawnTime > BOSS_EVENT_CONFIG.bossLifetime) {
      this.despawnBoss();
      return;
    }

    // Boss object không tồn tại (player ở map khác hoặc đã kill) → skip AI
    if (!bs.boss || !bs.boss.alive) return;

    // Player không ở map boss → không chạy AI, không gây damage
    if (!this._onBossMap()) return;

    this.checkPhase();

    if (bs.shieldActive) {
      bs.shieldTimer -= dt;
      if (bs.shieldTimer <= 0) { bs.shieldActive = false; if (bs._preShieldColor) bs.boss.color = bs._preShieldColor; }
    }

    if (bs.slowEffect && Date.now() > bs.slowEffect.endTime) this._cleanupSlowEffect();
    if (bs.screenShake > 0) bs.screenShake -= dt;

    this.updateSkills(dt);
    this.updateCharge(dt);

    for (const w of bs.aoeWarnings) w.life -= dt;

    // Movement
    if (!bs.chargeState || !bs.chargeState.active) {
      let tx = Player.x, ty = Player.y;
      if (typeof PartySystem !== 'undefined' && PartySystem && PartySystem.members)
        for (const m of PartySystem.members) if (m.taunt) { tx = m.x; ty = m.y; break; }

      const dx = tx - bs.boss.x, dy = ty - bs.boss.y;
      const d  = Math.sqrt(dx*dx + dy*dy);
      if (d > bs.boss.size + 30) {
        bs.boss.x += dx/d * this.getBossSpeed();
        bs.boss.y += dy/d * this.getBossSpeed();
      } else {
        bs._attackTimer -= dt;
        if (bs._attackTimer <= 0) {
          bs._attackTimer = 1500;
          const atk = this.getBossAtk();
          let hitParty = false;
          if (typeof PartySystem !== 'undefined' && PartySystem && PartySystem.members)
            for (const m of PartySystem.members)
              if (Utils.dist(bs.boss.x, bs.boss.y, m.x, m.y) < bs.boss.size + 30) { PartySystem.damageMember(m, atk); hitParty = true; }
          if (!hitParty) Player.takeDamage(atk, bs.config.name);
        }
      }
    }

    bs.boss.x = Utils.clamp(bs.boss.x, 50, CONFIG.WORLD_WIDTH  * CONFIG.TILE_SIZE - 50);
    bs.boss.y = Utils.clamp(bs.boss.y, 50, CONFIG.WORLD_HEIGHT * CONFIG.TILE_SIZE - 50);
    bs.boss.aggroed = true;
  },

  // ===========================================================
  // Render — chỉ render effects khi player ở đúng map
  // ===========================================================
  renderAoeWarnings() {
    if (!this._onBossMap()) return;
    const bs = this.bossState, ctx = Game.ctx, cam = GameState.camera;
    for (const w of bs.aoeWarnings) {
      if (w.life <= 0) continue;
      const alpha = w.life / w.maxLife;
      const pulse = 0.5 + Math.sin(GameState.time / 100) * 0.3;
      ctx.save();
      ctx.translate(w.x - cam.x, w.y - cam.y);
      ctx.globalAlpha = alpha * 0.25; ctx.fillStyle = '#ff5252';
      ctx.beginPath(); ctx.arc(0, 0, w.radius, 0, Math.PI*2); ctx.fill();
      ctx.globalAlpha = alpha * (0.6 + pulse*0.4); ctx.strokeStyle = '#ff1744'; ctx.lineWidth = 3;
      ctx.setLineDash([8,4]); ctx.beginPath(); ctx.arc(0,0,w.radius,0,Math.PI*2); ctx.stroke(); ctx.setLineDash([]);
      ctx.globalAlpha = alpha; ctx.fillStyle = '#ff1744'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';
      ctx.fillText('⚠️', 0, 4);
      ctx.restore();
    }
  },

  renderBossGlow() {
    if (!this._onBossMap()) return;
    const bs = this.bossState;
    if (!bs.boss || !bs.boss.alive) return;
    const ctx = Game.ctx, cam = GameState.camera;
    const bx = bs.boss.x - cam.x, by = bs.boss.y - cam.y;
    const pulse = 0.4 + Math.sin(GameState.time/200)*0.3;
    ctx.globalAlpha = pulse * 0.4; ctx.strokeStyle = bs.config.glowColor; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(bx, by, bs.boss.size + 15 + Math.sin(GameState.time/150)*5, 0, Math.PI*2); ctx.stroke();
    const pc = ['rgba(255,255,255,0.27)','rgba(255,152,0,0.53)','rgba(255,0,0,0.53)'];
    ctx.globalAlpha = 0.6; ctx.strokeStyle = pc[bs.currentPhase] || pc[0]; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(bx, by, bs.boss.size+5, 0, Math.PI*2); ctx.stroke();
    ctx.globalAlpha = 1;
  },

  renderScreenEffects() {
    if (!this._onBossMap()) return;
    const bs = this.bossState;
    if (bs.slowEffect) {
      const ctx = Game.ctx, w = Game.canvas.width, h = Game.canvas.height;
      const g = ctx.createRadialGradient(w/2,h/2,h*0.3,w/2,h/2,h*0.8);
      g.addColorStop(0,'rgba(79,195,247,0)'); g.addColorStop(1,'rgba(79,195,247,0.15)');
      ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(0,0,w,h);
    }
  },

  // ===========================================================
  // Main update
  // ===========================================================
  update(dt) {
    this.updateBossAI(dt);
    BossHUD.update();
  },

  // ===========================================================
  // Game hooks
  // ===========================================================
  _hookGameRender() {
    const _orig = Game.render.bind(Game);
    const self  = this;
    Game.render = function() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.save();

      let sx = 0, sy = 0;
      if (self._onBossMap() && self.bossState.screenShake > 0) {
        sx = Math.sin(GameState.time/30) * Math.min(8, self.bossState.screenShake/100);
        sy = sx * 0.5;
      }
      ctx.translate(-GameState.camera.x + sx, -GameState.camera.y + sy);

      this.renderTiles();
      this.renderTapIndicator();
      this.renderObjects();
      this.renderNPCs();
      self.renderAoeWarnings();
      this.renderEnemies();
      this.renderPet();
      this.renderPlayer();
      this.renderParticles();
      self.renderBossGlow();

      ctx.restore();
      this.renderDamageNumbers();
      if (GameState.minimapVisible) this.renderMinimap();
      self.renderScreenEffects();
    };
  },

  _hookGameUpdate() {
    const _orig = Game.update.bind(Game);
    const self  = this;
    Game.update = function(dt) { _orig.call(this, dt); self.update(dt); self.checkTimer(); };
  },

  _hookGameSave() {
    const _orig = Game.save.bind(Game);
    const self  = this;
    Game.save = function() { _orig.call(this); self.saveTimer(); };
  },

  _hookGameLoad() {
    const _orig = Game.load.bind(Game);
    const self  = this;
    Game.load = function() { const r = _orig.call(this); self.loadTimer(); return r; };
  },

  // ===========================================================
  // DOM inject
  // ===========================================================
  _injectStyles() {
    if (document.getElementById('bossEventStyles')) return;
    const s = document.createElement('style');
    s.id = 'bossEventStyles';
    s.textContent = `
      @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.4} }
      @keyframes bossResultIn {
        from{opacity:0;transform:translate(-50%,-50%) scale(0.85)}
        to  {opacity:1;transform:translate(-50%,-50%) scale(1)}
      }
    `;
    document.head.appendChild(s);
  },

  _injectHUD() {
    if (document.getElementById('bossEventHUD')) return;
    const hud = document.createElement('div');
    hud.id = 'bossEventHUD';
    hud.style.cssText = "display:none;position:absolute;top:12px;left:50%;transform:translateX(-50%);" +
      "z-index:20;min-width:300px;max-width:420px;pointer-events:none;" +
      "background:rgba(0,0,0,0.72);border:1px solid #f0c04060;border-radius:8px;" +
      "padding:8px 12px;font-family:'Courier New',monospace";
    hud.innerHTML = `
      <div style="text-align:center;margin-bottom:4px">
        <span id="bossEventName"  style="color:#f0c040;font-size:13px;font-weight:bold;
          text-shadow:0 0 10px rgba(240,192,64,0.6)"></span>
        <span id="bossEventPhase" style="color:#ff9800;font-size:10px;margin-left:8px"></span>
      </div>
      <div id="bossEventHpBar" style="height:16px;background:#111;border:2px solid #f0c040;
        border-radius:6px;overflow:hidden;position:relative">
        <div id="bossEventHpFill" style="height:100%;
          background:linear-gradient(90deg,#c62828,#ef5350);transition:width 0.2s;width:100%"></div>
        <div id="bossEventHpText" style="position:absolute;top:50%;left:50%;
          transform:translate(-50%,-50%);color:#fff;font-size:9px;font-weight:bold;
          text-shadow:1px 1px 2px #000"></div>
      </div>
      <div style="display:flex;justify-content:space-between;margin-top:3px">
        <span id="bossEventTimer"   style="color:#8ef;font-size:9px"></span>
        <span id="bossEventContrib" style="color:#4caf50;font-size:9px"></span>
      </div>
      <div id="bossEventMapTag" style="text-align:center;color:#8ef;font-size:9px;
        margin-top:2px;display:none"></div>
      <div id="bossWarningBanner" style="display:none;text-align:center;
        color:#ff9800;font-size:11px;font-weight:bold;margin-top:4px;
        animation:blink 1s infinite"></div>
    `;
    document.body.appendChild(hud);
  },

  _injectResultScreen() {
    if (document.getElementById('bossResultOverlay')) return;
    const el = document.createElement('div');
    el.id = 'bossResultOverlay';
    el.style.cssText = "display:none;position:fixed;top:50%;left:50%;" +
      "transform:translate(-50%,-50%);z-index:200;" +
      "background:linear-gradient(135deg,#1a1a2e,#16213e);" +
      "border:2px solid #f0c040;border-radius:12px;padding:20px 28px;" +
      "min-width:280px;max-width:360px;font-family:'Courier New',monospace;" +
      "color:#fff;text-align:center;animation:bossResultIn 0.3s ease";
    el.innerHTML = `
      <div id="bossResultTitle"   style="font-size:18px;font-weight:bold;color:#f0c040;margin-bottom:6px"></div>
      <div id="bossResultSub"     style="font-size:11px;color:#8ef;margin-bottom:10px"></div>
      <div id="bossResultContrib" style="font-size:12px;margin-bottom:10px"></div>
      <div id="bossResultRewards" style="font-size:11px;text-align:left;
        background:rgba(255,255,255,0.05);border-radius:6px;
        padding:8px;margin-bottom:12px"></div>
      <button id="bossResultOkBtn" style="background:linear-gradient(90deg,#f0c040,#ff9800);
        color:#1a1a2e;border:none;border-radius:6px;padding:8px 24px;font-size:12px;
        font-weight:bold;cursor:pointer;font-family:'Courier New',monospace">OK</button>
    `;
    document.body.appendChild(el);
    document.getElementById('bossResultOkBtn').addEventListener('click', () => { el.style.display = 'none'; });
  }
};

// ==============================================================
// BossHUD
// ==============================================================
const BossHUD = {
  show(name) {
    const hud = document.getElementById('bossEventHUD');
    if (!hud) return;
    hud.style.display = 'block';
    const bar = document.getElementById('bossEventHpBar');
    const tim = document.getElementById('bossEventTimer');
    const con = document.getElementById('bossEventContrib');
    const tag = document.getElementById('bossEventMapTag');
    if (bar) bar.style.display = 'block';
    if (tim) tim.style.display = '';
    if (con) con.style.display = '';
    if (tag) tag.style.display = 'none';
    const n = document.getElementById('bossEventName');
    if (n) n.textContent = name || '';
    this._hideWarning();
  },

  showRemote(name, mapName) {
    const hud = document.getElementById('bossEventHUD');
    if (!hud) return;
    hud.style.display = 'block';
    const bar = document.getElementById('bossEventHpBar');
    const tim = document.getElementById('bossEventTimer');
    const con = document.getElementById('bossEventContrib');
    const tag = document.getElementById('bossEventMapTag');
    const ph  = document.getElementById('bossEventPhase');
    if (bar) bar.style.display = 'none';
    if (tim) tim.style.display = 'none';
    if (con) con.style.display = 'none';
    if (ph)  ph.textContent = '';
    if (tag) { tag.style.display = 'block'; tag.textContent = '📍 ' + mapName; }
    const n = document.getElementById('bossEventName');
    if (n) n.textContent = name || '';
    this._hideWarning();
  },

  hide() {
    const hud = document.getElementById('bossEventHUD');
    if (hud) hud.style.display = 'none';
    this._hideWarning();
  },

  _hideWarning() {
    const b = document.getElementById('bossWarningBanner');
    if (b) { b.style.display = 'none'; b.textContent = ''; }
  },

  update() {
    const bs = BossEventSystem.bossState;
    if (!bs.active) return;

    // Timer luôn hiện (kể cả khi player ở map khác)
    const sec = Math.floor(Math.max(0, BOSS_EVENT_CONFIG.bossLifetime - (Date.now() - bs.spawnTime)) / 1000);
    const tim = document.getElementById('bossEventTimer');
    if (tim) tim.textContent = '⏱ ' + Math.floor(sec/60) + ':' + String(sec%60).padStart(2,'0');

    // HP, phase, contribution — chỉ khi player ở đúng map và boss còn sống
    if (!BossEventSystem._onBossMap() || !bs.boss || !bs.boss.alive) return;

    const pct  = Math.max(0, bs.boss.hp / bs.boss.maxHp * 100);
    const fill = document.getElementById('bossEventHpFill');
    const text = document.getElementById('bossEventHpText');
    if (fill) fill.style.width = pct.toFixed(1) + '%';
    if (text) text.textContent = Utils.formatNumber(Math.max(0,bs.boss.hp)) + ' / ' + Utils.formatNumber(bs.boss.maxHp);

    const ph = document.getElementById('bossEventPhase');
    if (ph && bs.config) { const p = bs.config.phases[bs.currentPhase]; ph.textContent = p ? '['+p.name+']' : ''; }

    const co = document.getElementById('bossEventContrib');
    if (co && bs.boss.maxHp) co.textContent = '💥 ' + (bs.damageDealt / bs.boss.maxHp * 100).toFixed(1) + '%';
  },

  updateCountdown(left) {
    const hud = document.getElementById('bossEventHUD');
    if (!hud) return;
    hud.style.display = 'block';
    const bar = document.getElementById('bossEventHpBar');
    const tag = document.getElementById('bossEventMapTag');
    const n   = document.getElementById('bossEventName');
    if (bar) bar.style.display = 'none';
    if (tag) tag.style.display = 'none';
    if (n)   n.textContent = '⚠️ Boss Event';
    const s = Math.floor(left/1000);
    const b = document.getElementById('bossWarningBanner');
    if (b) { b.style.display = 'block'; b.textContent = 'Boss xuất hiện sau ' + Math.floor(s/60) + ':' + String(s%60).padStart(2,'0'); }
  }
};

// ==============================================================
// BossResultScreen
// ==============================================================
const BossResultScreen = {
  _tid: null,
  show(contrib, rewards, escaped, bossName) {
    const el = document.getElementById('bossResultOverlay');
    if (!el) return;
    const bs      = BossEventSystem.bossState;
    const mapName = bs.spawnedMapIndex >= 0 && Maps.data[bs.spawnedMapIndex] ? Maps.data[bs.spawnedMapIndex].name : '';

    const titleEl = document.getElementById('bossResultTitle');
    if (titleEl) { titleEl.textContent = escaped ? '💨 Boss Rút Lui' : '🏆 Boss Đã Bị Hạ!'; titleEl.style.color = escaped ? '#ff9800' : '#f0c040'; }

    const subEl = document.getElementById('bossResultSub');
    if (subEl) subEl.textContent = (bossName||'') + (mapName ? ' — '+mapName : '');

    const cEl = document.getElementById('bossResultContrib');
    if (cEl) {
      const pct = (contrib*100).toFixed(1), col = contrib >= 0.05 ? '#4caf50' : '#f44336';
      cEl.innerHTML = '<span style="color:'+col+'">Đóng góp: '+pct+'%'+(contrib>=0.05?' 🌟':'')+'</span>';
    }

    const rEl = document.getElementById('bossResultRewards');
    if (rEl) {
      if (escaped || rewards.exp === 0) {
        rEl.innerHTML = '<span style="color:#888">Không có phần thưởng</span>';
      } else {
        let h = '<b style="color:#f0c040">Phần thưởng:</b><br>';
        h += '<span style="color:#ffeb3b">+'+Utils.formatNumber(rewards.exp)+' EXP <span style="color:#8ef">(x'+rewards.rewardMul.toFixed(2)+')</span></span><br>';
        h += '<span style="color:#ffd700">+'+Utils.formatNumber(rewards.gold)+' 💰 <span style="color:#8ef">(x'+rewards.rewardMul.toFixed(2)+')</span></span><br>';
        for (const it of (rewards.items||[])) h += '<span style="color:#e040fb">📦 '+it+'</span><br>';
        rEl.innerHTML = h;
      }
    }

    el.style.display = 'block';
    if (this._tid) clearTimeout(this._tid);
    this._tid = setTimeout(() => { el.style.display = 'none'; }, 6000);
  }
};

// ==============================================================
// PHẦN 3 — KHỞI ĐỘNG
// ==============================================================
(function() {
  const _origInit = Game.init.bind(Game);
  Game.init = function() {
    _origInit.call(this);
    setTimeout(() => BossEventSystem.init(), 0);
  };
})();
// ===== CHANGES: Xóa 4 console.log debug (init, initTimer, spawnBoss, cuối file). Xóa comment usage cuối file. Hợp nhất 2 nhánh if/else trùng nhau trong _hookSpawnForMap (cả hai nhánh đều gọi cùng 3 dòng cleanup trước _orig.call) thành 1 block duy nhất — behavior hoàn toàn giữ nguyên. =====
