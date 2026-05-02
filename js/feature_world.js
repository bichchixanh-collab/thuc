// ===== FILE: js/feature_world.js =====
// ==================== WORLD SYSTEM ====================
// feature_world.js — Random Events + Weather/Day-Night + Secret Map
// Load sau game.js trong index.html

// ============================================================
// SECTION 1 — DATA & CONFIG
// ============================================================

const WORLD_EVENT_CONFIG = {
  triggerDistance: 800,
  cooldown: 90000,

  eventTypes: {
    treasure: { weight: 40, name: 'Rương Kho Báu' },
    merchant: { weight: 25, name: 'Thương Nhân Lạ' },
    challenge: { weight: 25, name: 'Thử Thách Nhỏ' },
    npcHelp:   { weight: 10, name: 'NPC Cần Giúp'  }
  },

  chestGrades: {
    wood: {
      color: '#8b4513', glowColor: '#a0522d',
      loot: [
        { id: 'hpPotion',  chance: 0.6 },
        { id: 'mpPotion',  chance: 0.4 },
        { id: 'wolfFang',  chance: 0.5 },
        { id: 'wolfPelt',  chance: 0.3 }
      ],
      gold: { min: 20, max: 60 },
      trapChance: 0.08
    },
    silver: {
      color: '#c0c0c0', glowColor: '#e0e0e0',
      loot: [
        { id: 'hpPotionMedium', chance: 0.5 },
        { id: 'mpPotionMedium', chance: 0.4 },
        { id: 'demonCore',      chance: 0.3 },
        { id: 'spiritStone',    chance: 0.3 },
        { id: 'expPotion',      chance: 0.2 }
      ],
      gold: { min: 80, max: 200 },
      trapChance: 0.10
    },
    gold: {
      color: '#ffd700', glowColor: '#fff176',
      loot: [
        { id: 'realmPill',   chance: 0.4 },
        { id: 'dragonScale', chance: 0.3 },
        { id: 'expPotion',   chance: 0.5 },
        { id: 'flameSword',  chance: 0.05 },
        { id: 'dragonArmor', chance: 0.04 }
      ],
      gold: { min: 300, max: 800 },
      trapChance: 0.12
    }
  },
  chestGradeByMap: ['wood', 'wood', 'silver', 'silver', 'gold', 'gold'],
  chestLifetime: 120000,
  chestOpenRange: 60,

  merchantLifetime: 60000,
  merchantItems: [
    { id: 'realmPill',      price: 300 },
    { id: 'expPotion',      price: 150 },
    { id: 'dragonScale',    price: 400 },
    { id: 'celestialOrb',   price: 800 },
    { id: 'flameSword',     price: 600 },
    { id: 'frostSword',     price: 600 },
    { id: 'dragonArmor',    price: 700 },
    { id: 'dragonAmulet',   price: 500 },
    { id: 'celestialSword', price: 1800 },
    { id: 'celestialRobe',  price: 2000 },
    { id: 'celestialJade',  price: 1500 }
  ],
  merchantItemCount: { min: 3, max: 4 },

  challengeEnemyCount: { min: 3, max: 5 },
  challengeLevelBonus: 3,
  challengeTimer: 60000,
  challengeSpawnRadius: 200,
  challengeExpBonus: 2.0,
  challengeItemReward: [
    { id: 'expPotion',      chance: 0.4 },
    { id: 'hpPotionMedium', chance: 0.5 },
    { id: 'realmPill',      chance: 0.2 },
    { id: 'spiritStone',    chance: 0.4 }
  ],

  npcHelpScenarios: [
    {
      id: 'kill_escort',
      text: 'Có quái đang đuổi ta! Giúp ta với!',
      task: 'kill',
      enemyType: 'wolf',
      enemyCount: 1,
      reward: { exp: 150, gold: 80, item: 'expPotion', itemChance: 0.5 }
    },
    {
      id: 'give_item',
      text: 'Ta đang đói lả. Ngươi có thể cho ta Hồi Khí Đan không?',
      task: 'give',
      requiredItem: 'hpPotion',
      requiredCount: 1,
      reward: { exp: 200, gold: 100, item: 'realmPill', itemChance: 0.3 }
    },
    {
      id: 'guide_path',
      text: 'Ta lạc đường rồi. Dẫn ta đến điểm an toàn nhé!',
      task: 'reach',
      targetRadius: 150,
      timeLimit: 30000,
      reward: { exp: 180, gold: 120, item: 'spiritStone', itemChance: 0.6, secretHint: true }
    }
  ]
};

// ──────────────────────────────────────────────────────────────

const WEATHER_CONFIG = {
  dayNightCycleDuration: 10 * 60 * 1000,
  dayThreshold:  0.60,
  duskThreshold: 0.80,

  nightEnemies: [
    {
      typeKey: 'nightWolf',
      definition: {
        name: 'Nguyệt Lang', hp: 120, atk: 22, exp: 40, gold: 20,
        sprite: 'wolf', size: 14, color: '#6a0dad',
        drops: [
          { id: 'spiritStone', chance: 0.2 },
          { id: 'mpPotion',    chance: 0.3 }
        ]
      }
    },
    {
      typeKey: 'nightGhost',
      definition: {
        name: 'Dạ Sát', hp: 150, atk: 30, exp: 55, gold: 28,
        sprite: 'ghost', size: 12, color: '#1a237e',
        drops: [
          { id: 'demonCore', chance: 0.2 },
          { id: 'realmPill', chance: 0.05 }
        ]
      }
    }
  ],
  nightEnemySpawnInterval: 30000,
  nightEnemyMaxExtra: 5,
  nightExpBonus: 0.30,
  nightEnemyStatBonus: 0.20,

  weatherChangeDuration: 5 * 60 * 1000,
  weatherTypes: {
    clear:     { name: 'Trời Quang',  weight: 40, color: null,      mpRegenBonus: 0,    speedMul: 1.00, aggroMul: 1.0, aoeBonus: 0,    fogAlpha: 0    },
    lightRain: { name: 'Mưa Nhẹ',    weight: 25, color: '#4fc3f7', mpRegenBonus: 0.50, speedMul: 1.00, aggroMul: 1.0, aoeBonus: 0,    fogAlpha: 0    },
    heavyRain: { name: 'Mưa To',     weight: 15, color: '#1565c0', mpRegenBonus: 1.00, speedMul: 0.90, aggroMul: 1.0, aoeBonus: 0,    fogAlpha: 0.10 },
    blizzard:  { name: 'Bão Tuyết',  weight: 10, color: '#e3f2fd', mpRegenBonus: 0,    speedMul: 0.75, aggroMul: 1.0, aoeBonus: 0,    fogAlpha: 0.20 },
    fog:       { name: 'Sương Mù',   weight: 7,  color: '#b0bec5', mpRegenBonus: 0,    speedMul: 1.00, aggroMul: 0.5, aoeBonus: 0,    fogAlpha: 0.25 },
    storm:     { name: 'Dông Tố',    weight: 3,  color: '#37474f', mpRegenBonus: 0,    speedMul: 1.00, aggroMul: 1.0, aoeBonus: 0.30, fogAlpha: 0.15 }
  },
  rainParticleCount: 80,
  snowParticleCount: 60,
  storageKey: 'tuxien_world_state'
};

// ──────────────────────────────────────────────────────────────

const SECRET_MAP_CONFIG = {
  types: {
    relic: {
      id: 'relic',
      name: 'Phế Tích Tiên Môn',
      icon: '🏛️',
      mapSize: { w: 30, h: 30 },
      bgColor: '#2d1b69',
      tileColor: '#3d2b79',
      enemyTypes: ['ghost', 'demon'],
      enemyCount: 8,
      enemyLevelBonus: 5,
      npcType: 'mysteriousElder',
      lifetime: 0,
      lootBonus: 1.5,
      guaranteedDrop: { id: 'spiritStone', count: 3 }
    },
    treasure: {
      id: 'treasure',
      name: 'Tàng Bảo Động',
      icon: '💎',
      mapSize: { w: 25, h: 25 },
      bgColor: '#1a2f1a',
      tileColor: '#2a3f2a',
      enemyTypes: [],
      enemyCount: 0,
      npcType: null,
      lifetime: 180000,
      chestCount: { min: 5, max: 8 },
      chestGrade: 'gold'
    },
    arena: {
      id: 'arena',
      name: 'Võ Đài Hư Không',
      icon: '⚔️',
      mapSize: { w: 20, h: 20 },
      bgColor: '#1a0000',
      tileColor: '#2a1010',
      enemyTypes: ['demon', 'shadowLord'],
      waveCount: 3,
      enemiesPerWave: { min: 4, max: 6 },
      enemyLevelBonus: 8,
      npcType: null,
      lifetime: 0,
      legendaryChance: 0.15,
      guaranteedDrop: { id: 'dragonScale', count: 2 }
    }
  },

  portalPositions: [
    [{ tx: 3,  ty: 3  }, { tx: 55, ty: 55 }, { tx: 3,  ty: 55 }],
    [{ tx: 4,  ty: 4  }, { tx: 54, ty: 6  }, { tx: 6,  ty: 54 }],
    [{ tx: 3,  ty: 56 }, { tx: 56, ty: 3  }, { tx: 55, ty: 54 }],
    [{ tx: 4,  ty: 3  }, { tx: 55, ty: 4  }, { tx: 4,  ty: 55 }],
    [{ tx: 3,  ty: 3  }, { tx: 56, ty: 56 }, { tx: 3,  ty: 56 }],
    [{ tx: 4,  ty: 4  }, { tx: 55, ty: 5  }, { tx: 5,  ty: 55 }]
  ],

  cornerActivateTime: 5000,
  portalDetectRadius: 80,
  portalActivateRadius: 60,

  mysteriousElderItems: [
    { id: 'celestialOrb',   price: 600  },
    { id: 'realmPill',      price: 250  },
    { id: 'celestialSword', price: 1500 },
    { id: 'celestialRobe',  price: 1800 },
    { id: 'celestialJade',  price: 1200 }
  ],

  lorePhrases: [
    'Nghe nói có một vùng băng hà ẩn giấu kho báu ngàn năm...',
    'Thiên Long đang chờ đợi kẻ dũng cảm ở Tiên Giới...',
    'Tại Thiên Ma Động, có một bí mật mà Ma Vương không muốn ai biết...',
    'Người đủ mạnh có thể tìm thấy Thiên Tiên Kiếm trong Võ Đài Hư Không.',
    'Phế Tích Tiên Môn ẩn chứa công pháp cổ xưa chưa ai giải mã được...'
  ],

  activatorItemId: 'secretMap',
  activatorItemDef: {
    name: 'Bản Đồ Bí Ẩn',
    type: 'consumable',
    rarity: 'epic',
    desc: 'Dẫn đường đến cổng bí mật gần nhất',
    effect: { secretMap: true },
    sellPrice: 300,
    icon: 'map_secret'
  }
};

// ============================================================
// SECTION 2 — RANDOM EVENTS SYSTEM
// ============================================================

const RandomEventSystem = {
  state: {
    distanceTraveled: 0,
    lastEventTime: 0,
    activeEvent: null,
    lastPlayerPos: { x: 0, y: 0 }
  },

  // ─── Helpers ───────────────────────────────────────────────

  _randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  _shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },

  _rollByWeight(table) {
    const total = Object.values(table).reduce((s, v) => s + v.weight, 0);
    let r = Math.random() * total;
    for (const key in table) {
      r -= table[key].weight;
      if (r <= 0) return key;
    }
    return Object.keys(table)[0];
  },

  _validSpawnPos() {
    for (let attempt = 0; attempt < 10; attempt++) {
      const angle = Math.random() * Math.PI * 2;
      const dist  = 150 + Math.random() * 150;
      const x = Player.x + Math.cos(angle) * dist;
      const y = Player.y + Math.sin(angle) * dist;
      const tx = Math.floor(x / CONFIG.TILE_SIZE);
      const ty = Math.floor(y / CONFIG.TILE_SIZE);
      if (!Maps.isWater(tx, ty) && tx > 1 && ty > 1 &&
          tx < CONFIG.WORLD_WIDTH - 2 && ty < CONFIG.WORLD_HEIGHT - 2) {
        return { x, y };
      }
    }
    return null;
  },

  _spawnEventParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      GameState.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4 - 1,
        life: 600,
        color,
        size: 2 + Math.random() * 3
      });
    }
  },

  // ─── Update ────────────────────────────────────────────────

  update(dt) {
    if (!GameState.running || !Player.alive) return;

    // Dungeon check
    if (typeof DungeonSystem !== 'undefined' && DungeonSystem.sessionState && DungeonSystem.sessionState.active) return;

    const s = this.state;
    const moved = Utils.dist(Player.x, Player.y, s.lastPlayerPos.x, s.lastPlayerPos.y);
    if (moved < 50) s.distanceTraveled += moved;
    s.lastPlayerPos = { x: Player.x, y: Player.y };

    // Try trigger
    if (!s.activeEvent &&
        s.distanceTraveled >= WORLD_EVENT_CONFIG.triggerDistance &&
        Date.now() - s.lastEventTime >= WORLD_EVENT_CONFIG.cooldown &&
        Maps.currentIndex >= 0) {
      // No aggroed enemies nearby
      const aggro = Enemies.list.some(e => e.alive && e.aggroed &&
        Utils.dist(Player.x, Player.y, e.x, e.y) < 150);
      if (!aggro) this.tryTrigger();
    }

    // Update active event
    if (s.activeEvent) {
      switch (s.activeEvent.type) {
        case 'treasure':  this._checkChestExpiry(dt); this._checkAutoOpenChest(); break;
        case 'merchant':  this._updateMerchant(dt);   break;
        case 'challenge': this._updateChallenge(dt);  break;
        case 'npcHelp':   this._updateNpcHelp(dt);    break;
      }
    }
  },

  tryTrigger() {
    const pos = this._validSpawnPos();
    if (!pos) return;
    const type = this._rollByWeight(WORLD_EVENT_CONFIG.eventTypes);
    this.spawnEvent(type, pos.x, pos.y);
    this.state.distanceTraveled = 0;
    this.state.lastEventTime = Date.now();
  },

  spawnEvent(type, x, y) {
    switch (type) {
      case 'treasure': {
        const cfg = WORLD_EVENT_CONFIG;
        const grade = cfg.chestGradeByMap[Maps.currentIndex] || 'wood';
        const gradeConf = cfg.chestGrades[grade];
        const isTrap = Utils.chance(gradeConf.trapChance);
        this.state.activeEvent = {
          type, x, y, grade, isOpen: false, isTrap,
          spawnTime: Date.now(), lifetime: cfg.chestLifetime
        };
        UI.addLog('📦 Rương kho báu xuất hiện gần đây!', 'item');
        this._spawnEventParticles(x, y, gradeConf.glowColor, 15);
        break;
      }
      case 'merchant': {
        const cfg = WORLD_EVENT_CONFIG;
        const count = this._randomInt(cfg.merchantItemCount.min, cfg.merchantItemCount.max);
        const items = this._shuffle(cfg.merchantItems).slice(0, count);
        const npcObj = {
          type: 'wanderingMerchant', name: 'Thương Nhân Lạ',
          title: 'Hàng độc quyền — giới hạn thời gian!',
          x, y, sprite: 'npcShop',
          dialog: 'Hehe, ta có hàng hiếm đây! Mua nhanh kẻo hết!',
          service: 'wanderShop',
          interactRange: 80, canInteract: false,
          items, spawnTime: Date.now(), lifetime: cfg.merchantLifetime
        };
        NPC.list.push(npcObj);
        this.state.activeEvent = {
          type, x, y, npcObj, spawnTime: Date.now(),
          lifetime: cfg.merchantLifetime, countdownRemaining: cfg.merchantLifetime
        };
        UI.addLog('🧙 Thương Nhân Lạ xuất hiện! Hàng độc quyền trong 60 giây!', 'system');
        UI.showNotification('🧙 Thương Nhân Lạ!', 'Hàng hiếm — giới hạn 60 giây');
        break;
      }
      case 'challenge': {
        const cfg = WORLD_EVENT_CONFIG;
        const count = this._randomInt(cfg.challengeEnemyCount.min, cfg.challengeEnemyCount.max);
        const mapData = Maps.data[Maps.currentIndex];
        const enemyTypes = mapData ? mapData.enemies : ['wolf'];
        const spawnedEnemies = [];
        for (let i = 0; i < count; i++) {
          const typeKey = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
          if (!typeKey) continue;
          const e = Enemies.spawn(typeKey, 1.5, Player.level + cfg.challengeLevelBonus);
          if (!e) continue;
          e.x = x + Math.cos(i / count * Math.PI * 2) * cfg.challengeSpawnRadius;
          e.y = y + Math.sin(i / count * Math.PI * 2) * cfg.challengeSpawnRadius;
          e._challengeEnemy = true;
          spawnedEnemies.push(e);
        }
        this.state.activeEvent = {
          type, x, y, enemies: spawnedEnemies,
          timer: cfg.challengeTimer, success: false, spawnTime: Date.now()
        };
        UI.addLog('⚔️ Thử Thách Nhỏ! Tiêu diệt tất cả trong 60 giây!', 'system');
        UI.showNotification('⚔️ Thử Thách!', 'Tiêu diệt tất cả kẻ địch trong 60s');
        ChallengeHUD.show();
        break;
      }
      case 'npcHelp': {
        const scenarios = WORLD_EVENT_CONFIG.npcHelpScenarios;
        const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
        const npcObj = {
          type: 'helpNpc', name: 'Hành Khách', title: 'Cần được giúp đỡ',
          x, y, sprite: 'npcTeleporter',
          dialog: scenario.text, service: 'npcHelp',
          interactRange: 80, canInteract: false,
          scenario, taskComplete: false, taskEnemy: null
        };
        NPC.list.push(npcObj);
        if (scenario.task === 'kill') {
          const mapData = Maps.data[Maps.currentIndex];
          const typeKey = scenario.enemyType || (mapData && mapData.enemies[0]) || 'wolf';
          const e = Enemies.spawn(typeKey, 1.0, Player.level);
          if (e) {
            e.x = x + 100; e.y = y;
            e._helpTaskEnemy = true;
            npcObj.taskEnemy = e;
          }
        }
        this.state.activeEvent = {
          type, x, y, npcObj, scenario: JSON.parse(JSON.stringify(scenario)),
          spawnTime: Date.now(), taskComplete: false
        };
        UI.addLog('💬 Có người cần giúp đỡ gần đây!', 'npc');
        break;
      }
    }
  },

  // ─── Chest ─────────────────────────────────────────────────

  _checkChestExpiry() {
    const ev = this.state.activeEvent;
    if (!ev) return;
    if (Date.now() - ev.spawnTime >= ev.lifetime) {
      UI.addLog('📦 Rương kho báu đã biến mất...', 'item');
      this.clearEvent();
    }
  },

  openChest() {
    const ev = this.state.activeEvent;
    if (!ev || ev.type !== 'treasure' || ev.isOpen) return;

    if (ev.isTrap) {
      UI.showNotification('🪤 Bẫy!', 'Quái từ rương nhảy ra!');
      UI.addLog('🪤 Bẫy! Quái xuất hiện từ rương!', 'system');
      const count = this._randomInt(2, 3);
      for (let i = 0; i < count; i++) {
        const mapData = Maps.data[Maps.currentIndex];
        const types = mapData ? mapData.enemies : ['wolf'];
        const typeKey = types[Math.floor(Math.random() * types.length)];
        const e = Enemies.spawn(typeKey, 1.2, Player.level);
        if (e) { e.x = ev.x + (Math.random() - 0.5) * 60; e.y = ev.y + (Math.random() - 0.5) * 60; }
      }
      this.clearEvent();
      return;
    }

    ev.isOpen = true;
    const gradeConf = WORLD_EVENT_CONFIG.chestGrades[ev.grade];
    let itemCount = 0;
    for (const entry of gradeConf.loot) {
      if (Utils.chance(entry.chance)) {
        Inventory.add(entry.id, 1);
        itemCount++;
      }
    }
    const gold = this._randomInt(gradeConf.gold.min, gradeConf.gold.max);
    Player.gold += gold;
    UI.updateGold();
    this._spawnEventParticles(ev.x, ev.y, '#ffd700', 20);
    UI.showNotification('📦 Mở Rương!', `+${itemCount} vật phẩm & ${gold} vàng`);
    UI.addLog(`📦 Mở rương! +${gold} vàng & ${itemCount} vật phẩm`, 'item');
    this.clearEvent();
  },

  // Gọi mỗi frame khi có rương — tự mở khi player đến đủ gần
  _checkAutoOpenChest() {
    const ev = this.state.activeEvent;
    if (!ev || ev.type !== 'treasure' || ev.isOpen) return;
    if (ev._movingToChest && Utils.dist(Player.x, Player.y, ev.x, ev.y) <= WORLD_EVENT_CONFIG.chestOpenRange) {
      this.openChest();
    }
  },

  handleTap(wx, wy) {
    const ev = this.state.activeEvent;
    if (ev && ev.type === 'treasure' && !ev.isOpen) {
      const distToChest = Utils.dist(wx, wy, ev.x, ev.y);
      if (distToChest < WORLD_EVENT_CONFIG.chestOpenRange * 2) {
        const playerDist = Utils.dist(Player.x, Player.y, ev.x, ev.y);
        if (playerDist <= WORLD_EVENT_CONFIG.chestOpenRange) {
          // Player đã đủ gần — mở luôn
          this.openChest();
        } else {
          // Player chưa đến — move đến rương và đánh dấu để tự mở
          ev._movingToChest = true;
          Player.setTapTarget(ev.x, ev.y);
          UI.addLog('📦 Đang đến rương...', 'item');
        }
        return true; // chặn tap gốc trong cả 2 trường hợp
      }
    }
    return false;
  },

  // ─── Merchant ──────────────────────────────────────────────

  _updateMerchant() {
    const ev = this.state.activeEvent;
    const elapsed = Date.now() - ev.spawnTime;
    const remaining = ev.lifetime - elapsed;
    if (remaining <= 0) {
      const idx = NPC.list.indexOf(ev.npcObj);
      if (idx !== -1) NPC.list.splice(idx, 1);
      UI.addLog('🧙 Thương Nhân Lạ đã rời đi...', 'system');
      this.clearEvent();
      return;
    }
    ev.countdownRemaining = remaining;
  },

  // ─── Challenge ─────────────────────────────────────────────

  _updateChallenge(dt) {
    const ev = this.state.activeEvent;
    ev.timer -= dt;
    const aliveCount = ev.enemies.filter(e => e.alive).length;
    ChallengeHUD.update(aliveCount, ev.timer, WORLD_EVENT_CONFIG.challengeTimer);
    if (aliveCount === 0 && !ev.success) {
      ev.success = true;
      ChallengeHUD.hide();
      this._grantChallengeReward();
      this.clearEvent();
      return;
    }
    if (ev.timer <= 0 && !ev.success) {
      ev.enemies.forEach(e => {
        if (e.alive) {
          const idx = Enemies.list.indexOf(e);
          if (idx !== -1) Enemies.list.splice(idx, 1);
        }
      });
      ChallengeHUD.hide();
      UI.addLog('⏰ Thử Thách Thất Bại!', 'system');
      this.clearEvent();
    }
  },

  _grantChallengeReward() {
    const ev = this.state.activeEvent;
    const expGain = ev.enemies.reduce((s, e) => s + (e.exp || 0), 0) *
                    WORLD_EVENT_CONFIG.challengeExpBonus;
    Player.gainExp(Math.floor(expGain));
    WORLD_EVENT_CONFIG.challengeItemReward.forEach(r => {
      if (Utils.chance(r.chance)) Inventory.add(r.id, 1);
    });
    UI.showNotification('🏆 Thử Thách Hoàn Thành!', `+${Math.floor(expGain)} EXP`);
    UI.addLog(`🏆 Thử thách hoàn thành! +${Math.floor(expGain)} EXP bonus!`, 'exp');
  },

  // ─── NPC Help ──────────────────────────────────────────────

  _updateNpcHelp(dt) {
    const ev = this.state.activeEvent;
    if (!ev || ev.taskComplete) return;
    const scenario = ev.scenario;

    if (scenario.task === 'kill') {
      const enemy = ev.npcObj.taskEnemy;
      if (enemy && !enemy.alive) {
        ev.taskComplete = true;
        this._grantNpcHelpReward(scenario.reward);
        setTimeout(() => {
          const idx = NPC.list.indexOf(ev.npcObj);
          if (idx !== -1) NPC.list.splice(idx, 1);
          this.clearEvent();
        }, 3000);
      }
    } else if (scenario.task === 'reach') {
      ev.scenario.timeLimit -= dt;
      if (Utils.dist(Player.x, Player.y, ev.npcObj.x, ev.npcObj.y) < 100) {
        ev.taskComplete = true;
        this._grantNpcHelpReward(scenario.reward);
        setTimeout(() => {
          const idx = NPC.list.indexOf(ev.npcObj);
          if (idx !== -1) NPC.list.splice(idx, 1);
          this.clearEvent();
        }, 3000);
      } else if (ev.scenario.timeLimit <= 0) {
        const idx = NPC.list.indexOf(ev.npcObj);
        if (idx !== -1) NPC.list.splice(idx, 1);
        UI.addLog('💬 Hành Khách đã rời đi...', 'npc');
        this.clearEvent();
      }
    }
    // 'give' task handled via NPC interaction
  },

  _grantNpcHelpReward(reward) {
    Player.gainExp(reward.exp);
    Player.gold += reward.gold;
    UI.updateGold();
    if (Utils.chance(reward.itemChance)) Inventory.add(reward.item, 1);
    if (reward.secretHint) {
      SecretMapSystem.revealNearestPortal();
      UI.addLog('💬 "Có điều kỳ bí ở góc bản đồ này..."', 'npc');
    }
    UI.showNotification('💬 Cảm Ơn!', `+${reward.exp} EXP & ${reward.gold} vàng`);
    UI.addLog(`💬 Phần thưởng! +${reward.exp} EXP +${reward.gold} vàng`, 'exp');
  },

  clearEvent() {
    this.state.activeEvent = null;
  },

  // ─── Render (world-space) ───────────────────────────────────

  render(ctx) {
    const ev = this.state.activeEvent;
    if (!ev) return;
    const cx = GameState.camera.x;
    const cy = GameState.camera.y;

    switch (ev.type) {
      case 'treasure': {
        const gradeConf = WORLD_EVENT_CONFIG.chestGrades[ev.grade];
        const sx = ev.x - cx;
        const sy = ev.y - cy;
        const alpha = 0.7 + Math.sin(GameState.time / 300) * 0.3;

        // Glow
        ctx.globalAlpha = alpha * 0.4;
        ctx.fillStyle = gradeConf.glowColor;
        ctx.beginPath();
        ctx.arc(sx, sy, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        // Body
        ctx.fillStyle = gradeConf.color;
        ctx.fillRect(sx - 12, sy - 8, 24, 16);
        // Lid
        ctx.fillStyle = '#5a2d0c';
        ctx.fillRect(sx - 12, sy - 14, 24, 8);
        // Lock
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(sx - 3, sy - 7, 6, 6);

        // Grade label
        const gradeName = ev.grade === 'wood' ? 'Gỗ' : ev.grade === 'silver' ? 'Bạc' : 'Vàng';
        ctx.fillStyle = gradeConf.glowColor;
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('📦 Rương ' + gradeName, sx, sy - 22);

        // "Nhấn để mở" khi player đứng gần
        const playerDist = Utils.dist(Player.x, Player.y, ev.x, ev.y);
        if (playerDist <= WORLD_EVENT_CONFIG.chestOpenRange) {
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px monospace';
          ctx.fillText('👆 Nhấn để mở!', sx, sy + 26);
        } else {
          ctx.fillStyle = '#aaaaaa';
          ctx.font = '9px monospace';
          ctx.fillText('👆 Nhấn vào rương', sx, sy + 26);
        }
        break;
      }
      case 'merchant': {
        const remaining = ev.countdownRemaining || 0;
        const sec = Math.ceil(remaining / 1000);
        const sx = ev.npcObj.x - cx;
        const sy = ev.npcObj.y - cy - 50;
        ctx.fillStyle = sec < 15 ? '#f44336' : '#f0c040';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('⏱ ' + sec + 's', sx, sy);
        break;
      }
      case 'npcHelp': {
        const npc = ev.npcObj;
        const sx = npc.x - cx;
        const sy = npc.y - cy - 45;
        const a = 0.6 + Math.sin(GameState.time / 200) * 0.4;
        ctx.globalAlpha = a;
        ctx.fillStyle = '#ffeb3b';
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('❓', sx, sy);
        ctx.globalAlpha = 1;
        break;
      }
    }
  },

};

// ──────────────────────────────────────────────────────────────

const ChallengeHUD = {
  el: null, countEl: null, barEl: null, textEl: null,

  _init() {
    this.el      = document.getElementById('challengeHUD');
    this.countEl = document.getElementById('challengeEnemyCount');
    this.barEl   = document.getElementById('challengeTimerBar');
    this.textEl  = document.getElementById('challengeTimerText');
  },

  show() {
    if (!this.el) this._init();
    if (this.el) this.el.style.display = 'block';
  },

  hide() {
    if (!this.el) this._init();
    if (this.el) this.el.style.display = 'none';
  },

  update(aliveCount, timer, maxTimer) {
    if (!this.el) this._init();
    if (!this.el || this.el.style.display === 'none') return;
    if (this.countEl) this.countEl.textContent = aliveCount;
    const pct = Math.max(0, timer / maxTimer * 100);
    const sec = Math.ceil(timer / 1000);
    if (this.barEl) {
      this.barEl.style.width = pct + '%';
      this.barEl.style.background = pct < 30
        ? 'linear-gradient(90deg,#f44336,#ef9a9a)'
        : 'linear-gradient(90deg,#ff9800,#f0c040)';
    }
    if (this.textEl) this.textEl.textContent = sec + 's còn lại';
  }
};

// ============================================================
// SECTION 3 — WEATHER & DAY/NIGHT SYSTEM
// ============================================================

const WeatherSystem = {
  state: {
    cycleStartTime: 0,
    weatherChangeTime: 0,
    currentWeather: 'clear',
    weatherParticles: [],
    nightEnemyCount: 0,
    lastNightSpawnTime: 0,
    nightEnemiesSpawned: false,
    _originalSpeed: null,
    _speedDebuffActive: false,
    lightningTimer: 0,
    lightningFlash: 0
  },

  // ─── Computed ──────────────────────────────────────────────

  getCycleProgress() {
    const elapsed = (Date.now() - this.state.cycleStartTime) %
                    WEATHER_CONFIG.dayNightCycleDuration;
    return elapsed / WEATHER_CONFIG.dayNightCycleDuration;
  },

  isNight() {
    return this.getCycleProgress() >= WEATHER_CONFIG.duskThreshold;
  },

  isDusk() {
    const p = this.getCycleProgress();
    return p >= WEATHER_CONFIG.dayThreshold && p < WEATHER_CONFIG.duskThreshold;
  },

  getTimeOfDay() {
    const p = this.getCycleProgress();
    if (p < WEATHER_CONFIG.dayThreshold) return 'day';
    if (p < WEATHER_CONFIG.duskThreshold) return 'dusk';
    return 'night';
  },

  getOverlayAlpha() {
    const p = this.getCycleProgress();
    if (p < WEATHER_CONFIG.dayThreshold) return 0;
    if (p < WEATHER_CONFIG.duskThreshold) {
      return (p - WEATHER_CONFIG.dayThreshold) /
             (WEATHER_CONFIG.duskThreshold - WEATHER_CONFIG.dayThreshold) * 0.3;
    }
    const nightPct = (p - WEATHER_CONFIG.duskThreshold) / (1.0 - WEATHER_CONFIG.duskThreshold);
    return 0.3 + nightPct * 0.2;
  },

  getNightExpBonus() {
    return this.isNight() ? WEATHER_CONFIG.nightExpBonus : 0;
  },

  getAoeDamageBonus() {
    return WEATHER_CONFIG.weatherTypes[this.state.currentWeather].aoeBonus || 0;
  },

  // ─── Update ────────────────────────────────────────────────

  update(dt) {
    const s = this.state;

    // Weather change
    if (Date.now() - s.weatherChangeTime >= WEATHER_CONFIG.weatherChangeDuration) {
      this.rollNewWeather();
    }

    // Night enemies
    if (this.isNight()) {
      if (!s.nightEnemiesSpawned) this.onNightStart();
      if (Date.now() - s.lastNightSpawnTime >= WEATHER_CONFIG.nightEnemySpawnInterval) {
        this.trySpawnNightEnemy();
      }
    } else if (s.nightEnemiesSpawned) {
      this.onDayStart();
    }

    // Speed debuff
    const w = WEATHER_CONFIG.weatherTypes[s.currentWeather];
    if (w.speedMul !== 1.0 && !s._speedDebuffActive) {
      s._originalSpeed = Player.baseSpeed;
      Player.baseSpeed = Player.baseSpeed * w.speedMul;
      Player.recalculateStats();
      s._speedDebuffActive = true;
    } else if (w.speedMul === 1.0 && s._speedDebuffActive) {
      Player.baseSpeed = s._originalSpeed || Player.baseSpeed;
      Player.recalculateStats();
      s._speedDebuffActive = false;
    }

    // MP regen bonus
    Player._weatherMpRegen = Math.floor(Player.maxMp * 0.02 * w.mpRegenBonus);

    // Weather particles
    this._updateWeatherParticles(dt);

    // Storm lightning
    if (s.currentWeather === 'storm') {
      s.lightningTimer -= dt;
      if (s.lightningTimer <= 0) {
        s.lightningFlash = 150;
        s.lightningTimer = 3000 + Math.random() * 4000;
      }
      if (s.lightningFlash > 0) s.lightningFlash -= dt;
    }
  },

  rollNewWeather() {
    const s = this.state;
    const types = WEATHER_CONFIG.weatherTypes;
    const total = Object.values(types).reduce((sum, v) => sum + v.weight, 0);
    let r = Math.random() * total;
    for (const key in types) {
      r -= types[key].weight;
      if (r <= 0) { s.currentWeather = key; break; }
    }
    s.weatherChangeTime = Date.now();

    // Reset speed debuff when weather changes
    if (s._speedDebuffActive) {
      Player.baseSpeed = s._originalSpeed || Player.baseSpeed;
      Player.recalculateStats();
      s._speedDebuffActive = false;
    }
    s._originalSpeed = null;

    UI.addLog('🌤 Thời tiết thay đổi: ' + types[s.currentWeather].name, 'system');
  },

  onNightStart() {
    const s = this.state;
    s.nightEnemiesSpawned = true;
    s.lastNightSpawnTime = Date.now();
    Enemies.list.forEach(e => {
      if (!e.alive || e._nightBoosted) return;
      e.atk   = Math.floor(e.atk   * (1 + WEATHER_CONFIG.nightEnemyStatBonus));
      e.maxHp = Math.floor(e.maxHp * (1 + WEATHER_CONFIG.nightEnemyStatBonus));
      e._nightBoosted = true;
    });
    UI.addLog('🌙 Màn đêm buông xuống. Yêu ma hoành hành!', 'system');
    UI.showNotification('🌙 Ban Đêm', 'Quái +20% sức mạnh, EXP +30%');
  },

  onDayStart() {
    const s = this.state;
    s.nightEnemiesSpawned = false;
    Enemies.list.forEach(e => {
      if (!e._nightBoosted) return;
      e.atk   = Math.floor(e.atk   / (1 + WEATHER_CONFIG.nightEnemyStatBonus));
      e.maxHp = Math.floor(e.maxHp / (1 + WEATHER_CONFIG.nightEnemyStatBonus));
      e.hp    = Math.min(e.hp, e.maxHp);
      delete e._nightBoosted;
    });
    Enemies.list = Enemies.list.filter(e => !e._isNightEnemy);
    s.nightEnemyCount = 0;
    UI.addLog('☀️ Bình minh ló dạng. Yêu ma rút lui.', 'system');
  },

  trySpawnNightEnemy() {
    const s = this.state;
    if (s.nightEnemyCount >= WEATHER_CONFIG.nightEnemyMaxExtra) return;
    const defs = WEATHER_CONFIG.nightEnemies;
    const def  = defs[Math.floor(Math.random() * defs.length)];
    // Register type
    if (!Enemies.types[def.typeKey]) {
      Enemies.types[def.typeKey] = def.definition;
    }
    const e = Enemies.spawn(def.typeKey, 1.0, Player.level + 2);
    if (e) {
      e._isNightEnemy = true;
      s.nightEnemyCount++;
    }
    s.lastNightSpawnTime = Date.now();
  },

  onEnemyKilled(enemy) {
    if (!enemy) return;
    if (this.isNight() && enemy.exp) {
      const bonus = Math.floor(enemy.exp * this.getNightExpBonus());
      if (bonus > 0) Player.gainExp(bonus);
    }
  },

  // ─── Weather Particles ─────────────────────────────────────

  _updateWeatherParticles(dt) {
    const canvas = Game.canvas;
    if (!canvas) return;
    const s = this.state;
    const w = s.currentWeather;
    const particles = s.weatherParticles;

    // Update existing
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= dt;
      if (p.y > canvas.height || p.life <= 0) {
        // Respawn at top
        p.x = Math.random() * canvas.width;
        p.y = -5;
        p.life = 9999;
      }
    }

    // Spawn to target count
    let target = 0;
    let particleFactory = null;
    if (w === 'lightRain') {
      target = WEATHER_CONFIG.rainParticleCount;
      particleFactory = () => ({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        vx: -0.5 + Math.random() * 0.2, vy: 8 + Math.random() * 4,
        size: 1, color: '#4fc3f7aa', isRain: true, life: 9999
      });
    } else if (w === 'heavyRain') {
      target = WEATHER_CONFIG.rainParticleCount;
      particleFactory = () => ({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        vx: -1 + Math.random() * 0.4, vy: 12 + Math.random() * 4,
        size: 1, color: '#1565c0cc', isRain: true, life: 9999
      });
    } else if (w === 'blizzard') {
      target = WEATHER_CONFIG.snowParticleCount;
      particleFactory = () => ({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        vx: -3 + Math.random() * (-2), vy: 1 + Math.random() * 2,
        size: 2 + Math.random() * 2, color: '#e3f2fdcc', isRain: false, life: 9999
      });
    }

    if (particleFactory) {
      while (particles.length < target) particles.push(particleFactory());
    } else {
      // Clear particles for non-rain weather
      if (particles.length > 0) s.weatherParticles = [];
    }
  },

  // ─── Render (screen-space) ─────────────────────────────────

  render(ctx) {
    const canvas = Game.canvas;
    if (!canvas) return;
    const s = this.state;

    // Night overlay
    const alpha = this.getOverlayAlpha();
    if (alpha > 0) {
      ctx.fillStyle = '#000033';
      ctx.globalAlpha = alpha;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1;
    }

    // Fog/weather overlay
    const w = WEATHER_CONFIG.weatherTypes[s.currentWeather];
    if (w.fogAlpha > 0 && w.color) {
      ctx.fillStyle = w.color;
      ctx.globalAlpha = w.fogAlpha;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1;
    }

    // Rain / snow particles
    if (s.weatherParticles.length > 0) {
      const isRainType = s.currentWeather === 'lightRain' || s.currentWeather === 'heavyRain';
      ctx.globalAlpha = 0.6;
      for (const p of s.weatherParticles) {
        ctx.fillStyle = p.color;
        if (isRainType) {
          ctx.fillRect(p.x, p.y, p.size, p.size * 4);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    }

    // Lightning flash
    if (s.lightningFlash > 0) {
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = (s.lightningFlash / 150) * 0.4;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1;
    }

    // Weather HUD badge
    const wName = w.name;
    const timeLabel = this.isNight() ? '🌙 ' : this.isDusk() ? '🌅 ' : '☀️ ';
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(canvas.width / 2 - 60, 6, 120, 18);
    ctx.fillStyle = '#ccc';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(timeLabel + wName, canvas.width / 2, 19);
  },

  // ─── Save / Load ───────────────────────────────────────────

  saveState() {
    try {
      const s = this.state;
      localStorage.setItem(WEATHER_CONFIG.storageKey, JSON.stringify({
        cycleStartTime:   s.cycleStartTime,
        weatherChangeTime: s.weatherChangeTime,
        currentWeather:   s.currentWeather
      }));
    } catch (e) { console.warn('WeatherSystem save error', e); }
  },

  loadSavedState() {
    try {
      const raw = localStorage.getItem(WEATHER_CONFIG.storageKey);
      if (!raw) return;
      const data = JSON.parse(raw);
      const s = this.state;
      // Adjust cycle so relative time is preserved
      const now = Date.now();
      if (data.cycleStartTime) {
        // Keep same phase
        s.cycleStartTime = data.cycleStartTime;
        // If too old (> 1 cycle), reset
        if (now - s.cycleStartTime > WEATHER_CONFIG.dayNightCycleDuration * 10) {
          s.cycleStartTime = now;
        }
      }
      if (data.weatherChangeTime) s.weatherChangeTime = data.weatherChangeTime;
      if (data.currentWeather) s.currentWeather = data.currentWeather;
    } catch (e) { console.warn('WeatherSystem load error', e); }
  }
};

// ============================================================
// SECTION 4 — SECRET MAP SYSTEM
// ============================================================

const SecretMapSystem = {
  state: {
    discoveredPortals: {},
    revealedPortals:   {},
    activePortal:      null,
    inSecretZone:      false,
    secretZoneType:    null,
    savedState:        null,
    arenaWave:         0,
    arenaEnemies:      [],
    arenaComplete:     false,
    treasureChests:    [],
    treasureTimer:     0
  },

  _secretBgColor:   null,
  _secretTileColor: null,

  // ─── Update ────────────────────────────────────────────────

  update(dt) {
    if (this.state.inSecretZone) {
      this._updateSecretZone(dt);
    } else {
      this._checkPortalProximity(dt);
    }
  },

  _checkPortalProximity(dt) {
    const s = this.state;
    const mapPortals = SECRET_MAP_CONFIG.portalPositions[Maps.currentIndex] || [];
    const cfg = SECRET_MAP_CONFIG;

    let nearAny = false;
    for (let i = 0; i < mapPortals.length; i++) {
      const p = mapPortals[i];
      const worldX = p.tx * CONFIG.TILE_SIZE + 16;
      const worldY = p.ty * CONFIG.TILE_SIZE + 16;
      const dist = Utils.dist(Player.x, Player.y, worldX, worldY);

      if (dist < cfg.portalDetectRadius) {
        if (dist < cfg.portalActivateRadius) {
          nearAny = true;
          if (!s.activePortal || s.activePortal.portalIndex !== i) {
            s.activePortal = {
              mapIndex: Maps.currentIndex, portalIndex: i,
              worldX, worldY, activateTimer: 0
            };
          }
          s.activePortal.activateTimer += dt;
          SecretPortalHUD.show(s.activePortal.activateTimer, cfg.cornerActivateTime);

          if (s.activePortal.activateTimer >= cfg.cornerActivateTime) {
            this._discoverPortal(Maps.currentIndex, i);
            this.openSecretZone(Maps.currentIndex, i);
            return;
          }
        } else {
          if (s.activePortal && s.activePortal.portalIndex === i) {
            s.activePortal = null;
            SecretPortalHUD.hide();
          }
        }
      }
    }

    if (!nearAny && s.activePortal) {
      s.activePortal = null;
      SecretPortalHUD.hide();
    }
  },

  _discoverPortal(mapIndex, portalIndex) {
    const s = this.state;
    const key = '' + mapIndex;
    if (!s.discoveredPortals[key]) s.discoveredPortals[key] = [];
    if (!s.discoveredPortals[key].includes(portalIndex)) {
      s.discoveredPortals[key].push(portalIndex);
      UI.addLog('✦ Phát hiện cổng bí mật!', 'system');
    }
  },

  revealNearestPortal() {
    const s = this.state;
    const mapPortals = SECRET_MAP_CONFIG.portalPositions[Maps.currentIndex] || [];
    const key = '' + Maps.currentIndex;
    const discovered = s.discoveredPortals[key] || [];
    const revealed   = s.revealedPortals[key]   || [];

    let nearestIdx = -1, nearestDist = Infinity;
    for (let i = 0; i < mapPortals.length; i++) {
      if (discovered.includes(i) || revealed.includes(i)) continue;
      const p = mapPortals[i];
      const wx = p.tx * CONFIG.TILE_SIZE + 16;
      const wy = p.ty * CONFIG.TILE_SIZE + 16;
      const d = Utils.dist(Player.x, Player.y, wx, wy);
      if (d < nearestDist) { nearestDist = d; nearestIdx = i; }
    }
    if (nearestIdx === -1) return;
    if (!s.revealedPortals[key]) s.revealedPortals[key] = [];
    s.revealedPortals[key].push(nearestIdx);
    UI.addLog('🗺 "Có điều kỳ bí ở góc bản đồ..."', 'npc');
    UI.showNotification('🗺 Gợi Ý!', 'Cổng bí mật đã được đánh dấu trên minimap');
  },


  openSecretZone(mapIndex, portalIndex) {
    const s = this.state;
    const typeKeys = Object.keys(SECRET_MAP_CONFIG.types);
    const type = typeKeys[Math.floor(Math.random() * typeKeys.length)];
    const config = SECRET_MAP_CONFIG.types[type];

    // Save state
    s.savedState = {
      mapIndex: Maps.currentIndex,
      playerX: Player.x, playerY: Player.y,
      tiles: JSON.parse(JSON.stringify(Maps.tiles)),
      objects: [...Maps.objects],
      enemies: [...Enemies.list],
      npcList: [...NPC.list]
    };

    this._generateSecretMap(config);
    s.inSecretZone   = true;
    s.secretZoneType = type;
    s.activePortal   = null;
    SecretPortalHUD.hide();

    Player.x = Math.floor(config.mapSize.w / 2) * CONFIG.TILE_SIZE;
    Player.y = Math.floor(config.mapSize.h / 2) * CONFIG.TILE_SIZE;

    const mapNameEl = document.getElementById('mapName');
    if (mapNameEl) mapNameEl.textContent = '✦ ' + config.name;

    UI.showNotification('✦ ' + config.name, '⚠️ Không thể quay lại nếu thoát!');
    UI.addLog('✦ Bước vào ' + config.name + '!', 'realm');

    if (type === 'relic')    this._setupRelicZone(config);
    if (type === 'treasure') this._setupTreasureZone(config);
    if (type === 'arena')    this._setupArenaZone(config);

    SecretZoneHUD.show(type, config);
  },

  _generateSecretMap(config) {
    Maps.tiles = [];
    for (let y = 0; y < config.mapSize.h; y++) {
      Maps.tiles[y] = [];
      for (let x = 0; x < config.mapSize.w; x++) {
        const isEdge = x === 0 || y === 0 ||
                       x === config.mapSize.w - 1 || y === config.mapSize.h - 1;
        Maps.tiles[y][x] = isEdge ? 1 : 0;
      }
    }
    Maps.objects = [];
    this._secretBgColor   = config.bgColor;
    this._secretTileColor = config.tileColor;
  },

  _setupRelicZone(config) {
    Enemies.list = [];
    for (let i = 0; i < config.enemyCount; i++) {
      const typeKey = config.enemyTypes[Math.floor(Math.random() * config.enemyTypes.length)];
      if (!typeKey) continue;
      const e = Enemies.spawn(typeKey, 1.5, Player.level + config.enemyLevelBonus);
      if (e) {
        e.x = (2 + Math.random() * (config.mapSize.w - 4)) * CONFIG.TILE_SIZE;
        e.y = (2 + Math.random() * (config.mapSize.h - 4)) * CONFIG.TILE_SIZE;
      }
    }
    NPC.list = [];
    const elx = Math.floor(config.mapSize.w / 2) * CONFIG.TILE_SIZE + 80;
    const ely = Math.floor(config.mapSize.h / 2) * CONFIG.TILE_SIZE;
    NPC.types.mysteriousElder = {
      name: 'Thần Bí Lão Nhân', title: '???',
      sprite: 'npcTeleporter',
      dialog: SECRET_MAP_CONFIG.lorePhrases[Math.floor(Math.random() * SECRET_MAP_CONFIG.lorePhrases.length)],
      service: 'mysteriousShop'
    };
    NPC.spawn('mysteriousElder', elx, ely);
  },

  _setupTreasureZone(config) {
    Enemies.list = [];
    NPC.list = [];
    const count = Math.floor(Math.random() * (config.chestCount.max - config.chestCount.min + 1))
                  + config.chestCount.min;
    this.state.treasureChests = [];
    for (let i = 0; i < count; i++) {
      this.state.treasureChests.push({
        x: (2 + Math.random() * (config.mapSize.w - 4)) * CONFIG.TILE_SIZE,
        y: (2 + Math.random() * (config.mapSize.h - 4)) * CONFIG.TILE_SIZE,
        opened: false
      });
    }
    this.state.treasureTimer = config.lifetime;
  },

  _setupArenaZone() {
    NPC.list = [];
    this.state.arenaWave     = 0;
    this.state.arenaComplete = false;
    this._spawnArenaWave();
  },

  _spawnArenaWave() {
    const s = this.state;
    const config = SECRET_MAP_CONFIG.types.arena;
    s.arenaWave++;
    const count = Math.floor(Math.random() *
      (config.enemiesPerWave.max - config.enemiesPerWave.min + 1)) + config.enemiesPerWave.min;
    Enemies.list = [];
    s.arenaEnemies = [];
    for (let i = 0; i < count; i++) {
      const typeKey = config.enemyTypes[Math.floor(Math.random() * config.enemyTypes.length)];
      if (!typeKey) continue;
      const e = Enemies.spawn(typeKey, 2.0, Player.level + config.enemyLevelBonus);
      if (e) {
        e.x = (2 + Math.random() * (config.mapSize.w - 4)) * CONFIG.TILE_SIZE;
        e.y = (2 + Math.random() * (config.mapSize.h - 4)) * CONFIG.TILE_SIZE;
        s.arenaEnemies.push(e);
      }
    }
    UI.showNotification(`⚔️ Wave ${s.arenaWave}/${config.waveCount}`, count + ' kẻ địch!');
    SecretZoneHUD.updateArena(s.arenaWave, count);
  },

  _updateSecretZone(dt) {
    const s = this.state;

    if (s.secretZoneType === 'treasure') {
      s.treasureTimer -= dt;
      SecretZoneHUD.updateTimer(s.treasureTimer);
      if (s.treasureTimer <= 0) {
        this.exitSecretZone(false);
        return;
      }
    }

    if (s.secretZoneType === 'arena') {
      const alive = s.arenaEnemies.filter(e => e.alive).length;
      SecretZoneHUD.updateArena(s.arenaWave, alive);
      if (alive === 0 && !s.arenaComplete) {
        const config = SECRET_MAP_CONFIG.types.arena;
        if (s.arenaWave < config.waveCount) {
          setTimeout(() => this._spawnArenaWave(), 2000);
        } else {
          s.arenaComplete = true;
          this._grantArenaReward();
          setTimeout(() => this.exitSecretZone(true), 3000);
        }
      }
    }

    if (s.secretZoneType === 'relic') {
      const alive = Enemies.list.filter(e => e.alive).length;
      if (alive === 0 && Enemies.list.length > 0) {
        this._grantRelicReward();
        setTimeout(() => this.exitSecretZone(true), 2000);
        Enemies.list = []; // prevent re-trigger
      }
    }
  },

  handleTap(wx, wy) {
    const s = this.state;
    if (s.inSecretZone && s.secretZoneType === 'treasure') {
      for (const chest of s.treasureChests) {
        if (!chest.opened && Utils.dist(wx, wy, chest.x, chest.y) < 60) {
          chest.opened = true;
          const gold = Math.floor(Math.random() * 201) + 100;
          Player.gold += gold;
          UI.updateGold();
          const goldGrade = WORLD_EVENT_CONFIG.chestGrades.gold;
          let items = 0;
          for (const entry of goldGrade.loot) {
            if (Utils.chance(entry.chance)) { Inventory.add(entry.id, 1); items++; }
          }
          // Particles via GameState
          for (let i = 0; i < 20; i++) {
            GameState.particles.push({
              x: chest.x, y: chest.y,
              vx: (Math.random() - 0.5) * 5,
              vy: (Math.random() - 0.5) * 5 - 2,
              life: 600, color: '#ffd700', size: 3 + Math.random() * 3
            });
          }
          UI.addLog(`💎 Mở rương! +${gold} vàng & ${items} vật phẩm`, 'gold');
          return true;
        }
      }
    }
    return false;
  },

  // ─── Rewards ───────────────────────────────────────────────

  _grantRelicReward() {
    const config = SECRET_MAP_CONFIG.types.relic;
    Inventory.add(config.guaranteedDrop.id, config.guaranteedDrop.count);
    ['spiritStone', 'demonCore', 'realmPill'].forEach(id => {
      if (Utils.chance(0.4)) Inventory.add(id, 1);
    });
    UI.showNotification('🏛️ Phần Thưởng!', 'Nhận nguyên liệu quý!');
    UI.addLog('🏛️ Phế Tích cho bạn nguyên liệu quý!', 'item');
  },

  _grantArenaReward() {
    const config = SECRET_MAP_CONFIG.types.arena;
    Player.gainExp(Math.floor(Player.maxExp * 0.5));
    Inventory.add(config.guaranteedDrop.id, config.guaranteedDrop.count);
    if (Utils.chance(config.legendaryChance)) {
      const legendaryItems = ['celestialSword', 'celestialRobe', 'celestialJade'];
      const picked = legendaryItems[Math.floor(Math.random() * legendaryItems.length)];
      Inventory.add(picked, 1);
      UI.showNotification('✨ HUYỀN THOẠI!', 'Nhận được trang bị huyền thoại!');
      UI.addLog('✨ Trang bị huyền thoại từ Võ Đài!', 'item');
    }
    UI.showNotification('⚔️ Võ Đài Hoàn Thành!', 'Phần thưởng đã trao!');
    UI.addLog('⚔️ Võ Đài Hư Không hoàn thành!', 'exp');
  },

  exitSecretZone(success) {
    const s = this.state;
    if (!s.savedState) return;
    s.inSecretZone    = false;
    s.secretZoneType  = null;

    Maps.tiles   = s.savedState.tiles;
    Maps.objects = s.savedState.objects;
    Enemies.list = s.savedState.enemies;
    NPC.list     = s.savedState.npcList;
    Maps.currentIndex = s.savedState.mapIndex;

    Player.x = s.savedState.playerX;
    Player.y = s.savedState.playerY;

    this._secretBgColor   = null;
    this._secretTileColor = null;

    const mapNameEl = document.getElementById('mapName');
    if (mapNameEl) mapNameEl.textContent = '📍 ' + Maps.getCurrent().name;

    SecretZoneHUD.hide();
    s.savedState    = null;
    s.treasureChests = [];
    s.arenaEnemies  = [];
    s.arenaWave     = 0;
    s.arenaComplete = false;

    UI.addLog('✦ Rời khỏi vùng bí ẩn.', 'system');
    if (success) UI.addLog('✦ Thành công!', 'exp');
  },

  // ─── Render (world-space) ───────────────────────────────────

  render(ctx) {
    const s = this.state;
    const cx = GameState.camera.x;
    const cy = GameState.camera.y;
    const cfg = SECRET_MAP_CONFIG;
    const currentIndex = Maps.currentIndex;

    if (!s.inSecretZone) {
      // Render portal glows
      const mapPortals = cfg.portalPositions[currentIndex] || [];
      const keyStr = '' + currentIndex;
      const discovered = s.discoveredPortals[keyStr] || [];
      const revealed   = s.revealedPortals[keyStr]   || [];

      for (let i = 0; i < mapPortals.length; i++) {
        const p = mapPortals[i];
        const wx = p.tx * CONFIG.TILE_SIZE + 16;
        const wy = p.ty * CONFIG.TILE_SIZE + 16;
        const isDiscovered = discovered.includes(i);
        const isRevealed   = revealed.includes(i);

        if (isDiscovered || isRevealed) {
          const pulse = 0.5 + Math.sin(GameState.time / 400) * 0.3;
          ctx.globalAlpha = pulse * 0.6;
          ctx.fillStyle = isDiscovered ? '#e040fb' : '#888888';
          ctx.beginPath();
          ctx.arc(wx - cx, wy - cy, 15, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;

          ctx.fillStyle = isDiscovered ? '#e040fb' : '#aaaaaa';
          ctx.font = '12px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(isDiscovered ? '✦' : '?', wx - cx, wy - cy + 4);
        }

        // Proximity prompt
        if (Utils.dist(Player.x, Player.y, wx, wy) < cfg.portalDetectRadius) {
          ctx.fillStyle = '#e040fb';
          ctx.font = '10px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('✦ Cổng Bí Mật', wx - cx, wy - cy - 25);
        }
      }
    }

    // Treasure zone chests
    if (s.inSecretZone && s.secretZoneType === 'treasure') {
      for (const chest of s.treasureChests) {
        if (chest.opened) continue;
        const sx = chest.x - cx;
        const sy = chest.y - cy;
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(sx - 12, sy - 8, 24, 16);
        ctx.font = '18px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('📦', sx, sy + 6);
      }
    }
  },

  // ─── Minimap additions ─────────────────────────────────────

  renderMinimap(mctx, scale) {
    const s = this.state;
    if (s.inSecretZone) return;
    const currentIndex = Maps.currentIndex;
    const keyStr = '' + currentIndex;
    const discovered = s.discoveredPortals[keyStr] || [];
    const revealed   = s.revealedPortals[keyStr]   || [];
    const mapPortals = SECRET_MAP_CONFIG.portalPositions[currentIndex] || [];

    for (let i = 0; i < mapPortals.length; i++) {
      const p = mapPortals[i];
      const wx = p.tx * CONFIG.TILE_SIZE + 16;
      const wy = p.ty * CONFIG.TILE_SIZE + 16;
      if (discovered.includes(i)) {
        mctx.fillStyle = '#e040fb';
        mctx.fillRect(wx * scale - 2, wy * scale - 2, 4, 4);
      } else if (revealed.includes(i)) {
        mctx.fillStyle = '#888';
        mctx.fillRect(wx * scale - 2, wy * scale - 2, 4, 4);
      }
    }
  },

  // ─── Save / Load ───────────────────────────────────────────

  saveState() {
    try {
      const s = this.state;
      localStorage.setItem('tuxien_secret_map', JSON.stringify({
        discoveredPortals: s.discoveredPortals,
        revealedPortals:   s.revealedPortals
      }));
    } catch (e) { console.warn('SecretMapSystem save error', e); }
  },

  loadSavedState() {
    try {
      const raw = localStorage.getItem('tuxien_secret_map');
      if (!raw) return;
      const data = JSON.parse(raw);
      const s = this.state;
      if (data.discoveredPortals) s.discoveredPortals = data.discoveredPortals;
      if (data.revealedPortals)   s.revealedPortals   = data.revealedPortals;
    } catch (e) { console.warn('SecretMapSystem load error', e); }
  }
};

// ──────────────────────────────────────────────────────────────

const SecretPortalHUD = {
  el: null, progressEl: null,

  _init() {
    this.el         = document.getElementById('secretPortalHUD');
    this.progressEl = document.getElementById('secretPortalProgress');
  },

  show(timer, maxTimer) {
    if (!this.el) this._init();
    if (this.el) this.el.style.display = 'block';
    if (this.progressEl) {
      const pct = Math.min(100, timer / maxTimer * 100);
      this.progressEl.style.width = pct + '%';
    }
  },

  hide() {
    if (!this.el) this._init();
    if (this.el) this.el.style.display = 'none';
  }
};

const SecretZoneHUD = {
  el: null, nameEl: null, infoEl: null, timerEl: null,

  _init() {
    this.el      = document.getElementById('secretZoneHUD');
    this.nameEl  = document.getElementById('secretZoneName');
    this.infoEl  = document.getElementById('secretZoneInfo');
    this.timerEl = document.getElementById('secretZoneTimer');
  },

  show(type, config) {
    if (!this.el) this._init();
    if (this.el) this.el.style.display = 'block';
    if (this.nameEl) this.nameEl.textContent = config.icon + ' ' + config.name;
    if (this.infoEl) {
      if (type === 'arena') this.infoEl.textContent = 'Wave 0/' + config.waveCount;
      else if (type === 'treasure') this.infoEl.textContent = 'Mở tất cả rương!';
      else this.infoEl.textContent = 'Khám phá vùng đất bí ẩn';
    }
    if (this.timerEl) this.timerEl.textContent = '';
  },

  hide() {
    if (!this.el) this._init();
    if (this.el) this.el.style.display = 'none';
  },

  updateTimer(ms) {
    if (!this.timerEl) this._init();
    if (this.timerEl) {
      const sec = Math.ceil(ms / 1000);
      this.timerEl.textContent = '⏱ ' + sec + 's còn lại';
      this.timerEl.style.color = sec < 30 ? '#f44336' : '#8ef';
    }
  },

  updateArena(wave, alive) {
    if (!this.el) this._init();
    const config = SECRET_MAP_CONFIG.types.arena;
    if (this.infoEl) this.infoEl.textContent = `Wave ${wave}/${config.waveCount}`;
    if (this.timerEl) this.timerEl.textContent = `${alive} kẻ địch còn lại`;
  },

  updateInfo() {
    // Called each frame from Game.update hook — no-op for now
  }
};

// ============================================================
// SECTION 5 — KHỞI ĐỘNG & HOOKS
// ============================================================

const WorldSystem = {
  _hooksRegistered: false,

  init() {
    if (this._hooksRegistered) return;
    this._hooksRegistered = true;

    // 1. Inject HTML
    this._injectHTML();

    // 2. Inject CSS
    this._injectCSS();

    // 3. Init Random Events
    RandomEventSystem.state.lastPlayerPos = { x: Player.x, y: Player.y };
    RandomEventSystem.state.lastEventTime = Date.now() - 60000;

    // 4. Init Weather
    WeatherSystem.state.cycleStartTime   = Date.now();
    WeatherSystem.state.weatherChangeTime = Date.now();
    WeatherSystem.loadSavedState();
    WeatherSystem.rollNewWeather();

    // 5. Init Secret Map
    SecretMapSystem.loadSavedState();
    if (!ITEMS[SECRET_MAP_CONFIG.activatorItemId]) {
      ITEMS[SECRET_MAP_CONFIG.activatorItemId] = SECRET_MAP_CONFIG.activatorItemDef;
    }

    // 6. Register hooks
    this._hookGameUpdate();
    this._hookGameRender();
    this._hookRenderObjects();
    this._hookHandleTap();
    this._hookEnemiesKill();
    this._hookSaveLoad();
    this._hookNPCInteract();
    this._hookMapsGetTileColor();
    this._hookRenderMinimap();
    this._hookPlayerUpdate();

  },

  // ─── HTML Injection ────────────────────────────────────────

  _injectHTML() {
    const container = document.createElement('div');
    container.innerHTML = `
      <!-- Challenge HUD -->
      <div id="challengeHUD" style="display:none; position:absolute;
        bottom:170px; left:50%; transform:translateX(-50%);
        background:rgba(0,0,0,0.8); border:2px solid #ff9800;
        border-radius:8px; padding:6px 20px; z-index:20; pointer-events:none">
        <div style="color:#ff9800;font-size:12px;font-weight:bold;text-align:center">
          ⚔️ Thử Thách: <span id="challengeEnemyCount">0</span> kẻ địch còn lại
        </div>
        <div style="height:6px;background:#111;border-radius:3px;margin-top:4px;
          overflow:hidden;width:200px">
          <div id="challengeTimerBar" style="height:100%;
            background:linear-gradient(90deg,#ff9800,#f0c040);width:100%"></div>
        </div>
        <div id="challengeTimerText" style="color:#888;font-size:9px;
          text-align:center;margin-top:2px"></div>
      </div>

      <!-- Secret Portal HUD -->
      <div id="secretPortalHUD" style="display:none; position:absolute;
        bottom:180px; left:50%; transform:translateX(-50%);
        background:rgba(0,0,0,0.8); border:2px solid #e040fb;
        border-radius:8px; padding:6px 20px; z-index:20;
        text-align:center; pointer-events:none">
        <div style="color:#e040fb;font-size:11px;font-weight:bold">✦ Cổng Bí Mật</div>
        <div style="height:4px;background:#111;border-radius:2px;
          margin-top:4px;width:150px;overflow:hidden">
          <div id="secretPortalProgress" style="height:100%;background:#e040fb;
            border-radius:2px;width:0%;transition:width 0.1s"></div>
        </div>
        <div style="color:#888;font-size:9px;margin-top:2px">Đứng yên để kích hoạt...</div>
      </div>

      <!-- Secret Zone HUD -->
      <div id="secretZoneHUD" style="display:none; position:absolute;
        top:50px; left:50%; transform:translateX(-50%);
        background:rgba(0,0,0,0.8); border:2px solid #e040fb;
        border-radius:8px; padding:6px 20px; z-index:20;
        text-align:center; pointer-events:none; min-width:200px">
        <div id="secretZoneName" style="color:#e040fb;font-size:12px;font-weight:bold"></div>
        <div id="secretZoneInfo" style="color:#aaa;font-size:10px;margin-top:3px"></div>
        <div id="secretZoneTimer" style="color:#8ef;font-size:10px"></div>
      </div>
    `;
    document.body.appendChild(container);
  },

  // ─── CSS Injection ─────────────────────────────────────────

  _injectCSS() {
    if (document.getElementById('world-system-style')) return;
    const style = document.createElement('style');
    style.id = 'world-system-style';
    style.textContent = `
      @keyframes portalPulse {
        0%, 100% { opacity: 0.5; }
        50%       { opacity: 1.0; }
      }
    `;
    document.head.appendChild(style);
  },

  // ─── Hook: Game.update ─────────────────────────────────────

  _hookGameUpdate() {
    const _origUpdate = Game.update.bind(Game);
    Game.update = function(dt) {
      _origUpdate(dt);
      if (GameState.running) {
        RandomEventSystem.update(dt);
        WeatherSystem.update(dt);
        SecretMapSystem.update(dt);
      }
    };
  },

  // ─── Hook: Game.render ─────────────────────────────────────

  _hookGameRender() {
    const _origRender = Game.render.bind(Game);
    Game.render = function() {
      _origRender();
      WeatherSystem.render(this.ctx);
    };
  },

  // ─── Hook: Game.renderObjects ──────────────────────────────

  _hookRenderObjects() {
    const _origRenderObjects = Game.renderObjects.bind(Game);
    Game.renderObjects = function() {
      _origRenderObjects();
      const ctx = this.ctx;
      RandomEventSystem.render(ctx);
      SecretMapSystem.render(ctx);
    };
  },

  // ─── Hook: Game.handleTap ──────────────────────────────────

  _hookHandleTap() {
    const _origHandleTap = Game.handleTap.bind(Game);
    Game.handleTap = function(sx, sy) {
      const wx = sx + GameState.camera.x;
      const wy = sy + GameState.camera.y;
      if (RandomEventSystem.handleTap(wx, wy)) return;
      if (SecretMapSystem.handleTap(wx, wy)) return;
      _origHandleTap(sx, sy);
    };
  },

  // ─── Hook: Enemies.kill ────────────────────────────────────

  _hookEnemiesKill() {
    const _origKill = Enemies.kill.bind(Enemies);
    Enemies.kill = function(enemy) {
      _origKill(enemy);
      WeatherSystem.onEnemyKilled(enemy);
    };
  },

  // ─── Hook: Game.save / Game.load ───────────────────────────

  _hookSaveLoad() {
    const _origSave = Game.save.bind(Game);
    Game.save = function() {
      _origSave();
      WeatherSystem.saveState();
      SecretMapSystem.saveState();
    };

    const _origLoad = Game.load.bind(Game);
    Game.load = function() {
      const result = _origLoad();
      WeatherSystem.loadSavedState();
      SecretMapSystem.loadSavedState();
      return result;
    };
  },

  // ─── Hook: NPC.interact ────────────────────────────────────

  _hookNPCInteract() {
    const _origInteract = NPC.interact.bind(NPC);
    NPC.interact = function(npc) {
      if (!npc) return;

      if (npc.service === 'wanderShop') {
        // Wandering merchant
        NPC.currentDialog = npc;
        const dialogEl = document.getElementById('npcDialog');
        const avatarCanvas = document.getElementById('npcAvatarCanvas');
        if (avatarCanvas) {
          const ctx = avatarCanvas.getContext('2d');
          ctx.clearRect(0, 0, 32, 32);
          const sd = Sprites.getNPCSprite('shop');
          Sprites.drawPixelArt(ctx, sd, 2, 0, 0);
        }
        document.getElementById('npcName').textContent  = npc.name;
        document.getElementById('npcTitle').textContent = npc.title;
        document.getElementById('npcText').textContent  = npc.dialog;

        const optionsEl = document.getElementById('npcOptions');
        optionsEl.innerHTML = '';

        const titleEl = document.createElement('div');
        titleEl.style.cssText = 'color:#f0c040;font-size:11px;margin-bottom:10px;font-weight:bold';
        titleEl.textContent = '🛒 Hàng Độc Quyền';
        optionsEl.appendChild(titleEl);

        for (const shopItem of (npc.items || [])) {
          const itemData = ITEMS[shopItem.id];
          if (!itemData) continue;
          const canBuy = Player.gold >= shopItem.price;
          const option = document.createElement('div');
          option.className = 'npc-option';
          if (!canBuy) option.classList.add('disabled');
          option.innerHTML = `<span>${itemData.name}</span><span class="cost">${shopItem.price} 💰</span>`;
          if (canBuy) {
            const id = shopItem.id, price = shopItem.price;
            option.addEventListener('click', () => NPC.buyItem(id, price));
          }
          optionsEl.appendChild(option);
        }
        NPC.addCloseOption(optionsEl);
        if (dialogEl) dialogEl.classList.add('show');
        return;
      }

      if (npc.service === 'mysteriousShop') {
        NPC.currentDialog = npc;
        const dialogEl = document.getElementById('npcDialog');
        const avatarCanvas = document.getElementById('npcAvatarCanvas');
        if (avatarCanvas) {
          const ctx = avatarCanvas.getContext('2d');
          ctx.clearRect(0, 0, 32, 32);
          const sd = Sprites.getNPCSprite('teleporter');
          Sprites.drawPixelArt(ctx, sd, 2, 0, 0);
        }
        document.getElementById('npcName').textContent  = npc.name;
        document.getElementById('npcTitle').textContent = npc.title || '???';
        document.getElementById('npcText').textContent  = npc.dialog;

        const optionsEl = document.getElementById('npcOptions');
        optionsEl.innerHTML = '';

        // Lore button
        const loreBtn = document.createElement('div');
        loreBtn.className = 'npc-option';
        loreBtn.innerHTML = '<span>📖 Nghe kể chuyện</span>';
        loreBtn.addEventListener('click', () => {
          const lore = SECRET_MAP_CONFIG.lorePhrases;
          document.getElementById('npcText').textContent =
            lore[Math.floor(Math.random() * lore.length)];
        });
        optionsEl.appendChild(loreBtn);

        for (const shopItem of SECRET_MAP_CONFIG.mysteriousElderItems) {
          const itemData = ITEMS[shopItem.id];
          if (!itemData) continue;
          const canBuy = Player.gold >= shopItem.price;
          const option = document.createElement('div');
          option.className = 'npc-option';
          if (!canBuy) option.classList.add('disabled');
          option.innerHTML = `<span>${itemData.name}</span><span class="cost">${shopItem.price} 💰</span>`;
          if (canBuy) {
            const id = shopItem.id, price = shopItem.price;
            option.addEventListener('click', () => NPC.buyItem(id, price));
          }
          optionsEl.appendChild(option);
        }
        NPC.addCloseOption(optionsEl);
        if (dialogEl) dialogEl.classList.add('show');
        return;
      }

      if (npc.service === 'npcHelp') {
        NPC.currentDialog = npc;
        const dialogEl = document.getElementById('npcDialog');
        const avatarCanvas = document.getElementById('npcAvatarCanvas');
        if (avatarCanvas) {
          const ctx = avatarCanvas.getContext('2d');
          ctx.clearRect(0, 0, 32, 32);
          const sd = Sprites.getNPCSprite('teleporter');
          Sprites.drawPixelArt(ctx, sd, 2, 0, 0);
        }
        document.getElementById('npcName').textContent  = npc.name;
        document.getElementById('npcTitle').textContent = npc.title || 'Cần Giúp Đỡ';
        document.getElementById('npcText').textContent  = npc.dialog;

        const optionsEl = document.getElementById('npcOptions');
        optionsEl.innerHTML = '';

        const scenario = npc.scenario;
        if (scenario && scenario.task === 'give') {
          const reqItem = scenario.requiredItem;
          const reqCount = scenario.requiredCount || 1;
          const itemData = ITEMS[reqItem];
          const hasItem = Inventory.has(reqItem, reqCount);

          const giveBtn = document.createElement('div');
          giveBtn.className = 'npc-option';
          if (!hasItem) giveBtn.classList.add('disabled');
          giveBtn.innerHTML = `<span>🎁 Cho ${itemData ? itemData.name : reqItem} x${reqCount}</span>`;

          if (hasItem) {
            giveBtn.addEventListener('click', () => {
              if (Inventory.remove(reqItem, reqCount)) {
                const ev = RandomEventSystem.state.activeEvent;
                if (ev && ev.type === 'npcHelp' && ev.npcObj === npc && !ev.taskComplete) {
                  ev.taskComplete = true;
                  RandomEventSystem._grantNpcHelpReward(scenario.reward);
                  setTimeout(() => {
                    const idx = NPC.list.indexOf(npc);
                    if (idx !== -1) NPC.list.splice(idx, 1);
                    RandomEventSystem.clearEvent();
                  }, 2000);
                }
                NPC.closeDialog();
              }
            });
          }
          optionsEl.appendChild(giveBtn);
        }

        NPC.addCloseOption(optionsEl);
        if (dialogEl) dialogEl.classList.add('show');
        return;
      }

      // Default
      _origInteract(npc);
    };
  },

  // ─── Hook: Maps.getTileColor ───────────────────────────────

  _hookMapsGetTileColor() {
    const _origGetTileColor = Maps.getTileColor.bind(Maps);
    Maps.getTileColor = function(tile, x, y) {
      if (SecretMapSystem.state.inSecretZone) {
        if (tile === 0) return SecretMapSystem._secretTileColor || '#2a3a2a';
        if (tile === 1) return '#555555';
        return '#333333';
      }
      return _origGetTileColor(tile, x, y);
    };
  },

  // ─── Hook: Game.renderMinimap ──────────────────────────────

  _hookRenderMinimap() {
    const _origRenderMinimap = Game.renderMinimap.bind(Game);
    Game.renderMinimap = function() {
      _origRenderMinimap();
      // Overlay portal markers on minimap
      const mc = document.getElementById('minimapCanvas');
      if (!mc) return;
      const mctx = mc.getContext('2d');
      const scale = mc.width / (CONFIG.WORLD_WIDTH * CONFIG.TILE_SIZE);
      SecretMapSystem.renderMinimap(mctx, scale);
    };
  },

  // ─── Hook: Player.update (MP regen) ────────────────────────

  _hookPlayerUpdate() {
    const _origPlayerUpdate = Player.update.bind(Player);
    Player.update = function(dt, inputX, inputY) {
      _origPlayerUpdate(dt, inputX, inputY);
      // Weather MP regen
      if (GameState.time % 2000 < dt && Player._weatherMpRegen && Player._weatherMpRegen > 0) {
        Player.mp = Math.min(Player.maxMp, Player.mp + Player._weatherMpRegen);
      }
    };
  }
};

// ─── Auto-init after DOM ready ─────────────────────────────────

(function() {
  function tryInit() {
    if (typeof Game !== 'undefined' && Game.canvas &&
        typeof Player !== 'undefined' && typeof Enemies !== 'undefined' &&
        typeof Maps !== 'undefined' && typeof NPC !== 'undefined' &&
        typeof Inventory !== 'undefined' && typeof UI !== 'undefined' &&
        typeof GameState !== 'undefined' && typeof CONFIG !== 'undefined') {
      WorldSystem.init();
    } else {
      setTimeout(tryInit, 200);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(tryInit, 300));
  } else {
    setTimeout(tryInit, 300);
  }
})();

// Add to index.html after <script src="js/game.js"></script>:
// <script src="js/feature_world.js"></script>
// ===== CHANGES: Xóa SecretZoneHUD.updateInfo() (no-op) khỏi Game.update hook. Xóa RandomEventSystem.renderScreenSpace() (empty method) khỏi Game.render hook. Xóa SecretMapSystem._checkActivatorItem() (placeholder rỗng) — call lẫn method. Xóa RandomEventSystem.renderScreenSpace() method. Xóa console.log debug. =====
