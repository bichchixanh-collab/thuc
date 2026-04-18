// ==================== ANCIENT BEAST SYSTEM ====================
// File: js/feature_ancient_beast.js
// Monkey-patch module — KHÔNG sửa bất kỳ file gốc nào.
// Load SAU feature_pet_level.js:
// <script src="js/feature_ancient_beast.js"></script>

// ============================================================
//  PHẦN 1 — DATA & CONFIG
// ============================================================

const ANCIENT_BEAST_CONFIG = {

  thunderDragon: {
    id: 'thunderDragon',
    name: 'Thương Long',
    bossType: 'wolfKing',
    mapIndex: 0,
    captureItem: 'sealStone',
    captureItemCount: 3,
    hpMul: 3.0,
    atkMul: 1.5,
    defMul: 1.2,
    speedMul: 1.0,
    size: 22,
    color: '#1565c0',
    glowColor: '#42a5f5',
    passiveBonus: { maxHpPct: 0.15 },
    signature: {
      name: 'Rồng Hút',
      cd: 8000,
      type: 'drain',
      range: 150,
      drainPct: 0.08,
      color: '#42a5f5',
      desc: 'Hút 8% HP từ quái, hồi cho Player'
    },
    spriteStand: [
      [0,         '#1565c0','#1565c0',0,         0,         '#1565c0','#1565c0',0        ],
      ['#1565c0','#42a5f5','#1565c0','#1565c0','#1565c0','#1565c0','#42a5f5','#1565c0'],
      ['#1565c0','#ffd700','#1565c0','#1565c0','#1565c0','#1565c0','#ffd700','#1565c0'],
      ['#1565c0','#1565c0','#1565c0','#42a5f5','#42a5f5','#1565c0','#1565c0','#1565c0'],
      ['#0d47a1','#1565c0','#1565c0','#1565c0','#1565c0','#1565c0','#1565c0','#0d47a1'],
      ['#0d47a1','#ffd700','#1565c0','#0d47a1','#0d47a1','#1565c0','#ffd700','#0d47a1'],
      [0,         '#0d47a1','#0d47a1',0,         0,         '#0d47a1','#0d47a1',0        ],
      [0,         '#ffd700',0,         0,         0,         0,         '#ffd700',0        ]
    ],
    spriteMove: [
      [0,         '#ffd700','#1565c0',0,         0,         '#1565c0','#ffd700',0        ],
      ['#1565c0','#42a5f5','#1565c0','#1565c0','#1565c0','#1565c0','#42a5f5','#1565c0'],
      ['#1565c0','#ffd700','#1565c0','#1565c0','#1565c0','#1565c0','#ffd700','#1565c0'],
      ['#1565c0','#1565c0','#1565c0','#42a5f5','#42a5f5','#1565c0','#1565c0','#1565c0'],
      ['#0d47a1','#1565c0','#1565c0','#1565c0','#1565c0','#1565c0','#1565c0','#0d47a1'],
      [0,         '#ffd700','#0d47a1','#0d47a1','#0d47a1','#0d47a1','#ffd700',0        ],
      ['#0d47a1',0,         '#0d47a1',0,         0,         '#0d47a1',0,         '#0d47a1'],
      [0,         '#ffd700',0,         0,         0,         0,         '#ffd700',0        ]
    ]
  },

  shadowFox: {
    id: 'shadowFox',
    name: 'Minh Hồ',
    bossType: 'demonLord',
    mapIndex: 1,
    captureItem: 'sealStone',
    captureItemCount: 3,
    hpMul: 2.5,
    atkMul: 1.8,
    defMul: 0.9,
    speedMul: 1.2,
    size: 18,
    color: '#4a148c',
    glowColor: '#ce93d8',
    passiveBonus: { expPct: 0.20 },
    signature: {
      name: 'Bóng Phân Thân',
      cd: 12000,
      type: 'clone',
      duration: 3000,
      cloneAtkPct: 0.6,
      color: '#ce93d8',
      desc: 'Triệu hồi phân thân tấn công 3 giây'
    },
    spriteStand: [
      [0,         '#4a148c','#4a148c',0,         0,         '#4a148c','#4a148c',0        ],
      ['#4a148c','#ce93d8','#4a148c','#4a148c','#4a148c','#4a148c','#ce93d8','#4a148c'],
      ['#4a148c','#e040fb','#4a148c','#4a148c','#4a148c','#4a148c','#e040fb','#4a148c'],
      ['#4a148c','#4a148c','#ce93d8','#4a148c','#4a148c','#ce93d8','#4a148c','#4a148c'],
      ['#38006b','#4a148c','#4a148c','#4a148c','#4a148c','#4a148c','#4a148c','#38006b'],
      [0,         '#38006b','#e040fb','#38006b','#38006b','#e040fb','#38006b',0        ],
      [0,         '#38006b',0,         '#38006b','#38006b',0,         '#38006b',0        ],
      [0,         0,         '#e040fb',0,         '#e040fb',0,         0,         0        ]
    ],
    spriteMove: [
      ['#4a148c',0,         0,         '#4a148c','#4a148c',0,         0,         '#4a148c'],
      ['#4a148c','#ce93d8','#4a148c','#4a148c','#4a148c','#4a148c','#ce93d8','#4a148c'],
      ['#4a148c','#e040fb','#4a148c','#4a148c','#4a148c','#4a148c','#e040fb','#4a148c'],
      ['#4a148c','#4a148c','#ce93d8','#4a148c','#4a148c','#ce93d8','#4a148c','#4a148c'],
      ['#38006b','#4a148c','#4a148c','#4a148c','#4a148c','#4a148c','#4a148c','#38006b'],
      ['#38006b',0,         '#e040fb','#38006b','#38006b','#e040fb',0,         '#38006b'],
      [0,         '#38006b',0,         0,         0,         0,         '#38006b',0        ],
      [0,         0,         '#e040fb',0,         0,         '#e040fb',0,         0        ]
    ]
  },

  flameBird: {
    id: 'flameBird',
    name: 'Viêm Phượng',
    bossType: 'iceEmperor',
    mapIndex: 2,
    captureItem: 'sealStone',
    captureItemCount: 3,
    hpMul: 2.2,
    atkMul: 2.0,
    defMul: 0.8,
    speedMul: 1.3,
    size: 20,
    color: '#bf360c',
    glowColor: '#ff7043',
    passiveBonus: { atkPct: 0.15 },
    signature: {
      name: 'Thiêu Đốt',
      cd: 6000,
      type: 'dot',
      dotDamage: 0.15,
      dotInterval: 500,
      dotDuration: 3000,
      color: '#ff4500',
      desc: 'Đốt cháy target, gây sát thương liên tục 3 giây'
    },
    spriteStand: [
      [0,         '#ffd700','#bf360c',0,         0,         '#bf360c','#ffd700',0        ],
      ['#ffd700','#ff7043','#bf360c','#bf360c','#bf360c','#bf360c','#ff7043','#ffd700'],
      ['#ff7043','#bf360c','#ffd700','#bf360c','#bf360c','#ffd700','#bf360c','#ff7043'],
      ['#bf360c','#ff7043','#bf360c','#ffd700','#ffd700','#bf360c','#ff7043','#bf360c'],
      [0,         '#870000','#ff7043','#bf360c','#bf360c','#ff7043','#870000',0        ],
      [0,         0,         '#ffd700','#870000','#870000','#ffd700',0,         0        ],
      [0,         0,         '#870000',0,         0,         '#870000',0,         0        ],
      [0,         0,         '#ffd700',0,         0,         '#ffd700',0,         0        ]
    ],
    spriteMove: [
      ['#ffd700',0,         '#bf360c','#bf360c','#bf360c','#bf360c',0,         '#ffd700'],
      ['#ffd700','#ff7043','#bf360c','#bf360c','#bf360c','#bf360c','#ff7043','#ffd700'],
      ['#ff7043','#ffd700','#ffd700','#bf360c','#bf360c','#ffd700','#ffd700','#ff7043'],
      [0,         '#bf360c','#ff7043','#ffd700','#ffd700','#ff7043','#bf360c',0        ],
      [0,         0,         '#870000','#ff7043','#ff7043','#870000',0,         0        ],
      [0,         0,         '#ffd700','#870000','#870000','#ffd700',0,         0        ],
      [0,         0,         '#870000',0,         0,         '#870000',0,         0        ],
      [0,         0,         0,         0,         0,         0,         0,         0        ]
    ]
  },

  iceQilin: {
    id: 'iceQilin',
    name: 'Băng Kỳ Lân',
    bossType: 'celestialDragon',
    mapIndex: 3,
    captureItem: 'sealStone',
    captureItemCount: 3,
    hpMul: 3.5,
    atkMul: 1.3,
    defMul: 2.0,
    speedMul: 1.1,
    size: 24,
    color: '#006064',
    glowColor: '#80deea',
    passiveBonus: { defPct: 0.10, speedPct: 0.10 },
    signature: {
      name: 'Băng Phong',
      cd: 10000,
      type: 'freeze',
      freezeDuration: 1500,
      aoeRadius: 100,
      color: '#80deea',
      desc: 'Đóng băng tất cả kẻ địch trong vùng 1.5 giây'
    },
    spriteStand: [
      [0,         '#80deea','#006064',0,         0,         '#006064','#80deea',0        ],
      ['#80deea','#00bcd4','#006064','#006064','#006064','#006064','#00bcd4','#80deea'],
      ['#00bcd4','#80deea','#80deea','#006064','#006064','#80deea','#80deea','#00bcd4'],
      ['#006064','#00bcd4','#006064','#80deea','#80deea','#006064','#00bcd4','#006064'],
      ['#004d40','#006064','#006064','#006064','#006064','#006064','#006064','#004d40'],
      [0,         '#004d40','#80deea','#004d40','#004d40','#80deea','#004d40',0        ],
      [0,         '#004d40',0,         '#004d40','#004d40',0,         '#004d40',0        ],
      [0,         '#80deea',0,         0,         0,         0,         '#80deea',0        ]
    ],
    spriteMove: [
      ['#80deea',0,         '#006064','#006064','#006064','#006064',0,         '#80deea'],
      ['#80deea','#00bcd4','#006064','#006064','#006064','#006064','#00bcd4','#80deea'],
      ['#00bcd4','#80deea','#80deea','#006064','#006064','#80deea','#80deea','#00bcd4'],
      ['#006064','#00bcd4','#006064','#80deea','#80deea','#006064','#00bcd4','#006064'],
      ['#004d40','#006064','#006064','#006064','#006064','#006064','#006064','#004d40'],
      ['#004d40',0,         '#80deea','#004d40','#004d40','#80deea',0,         '#004d40'],
      ['#004d40',0,         0,         0,         0,         0,         0,         '#004d40'],
      [0,         '#80deea',0,         0,         0,         0,         '#80deea',0        ]
    ]
  },

  // Drop config cho boss
  bossSealDrops: {
    wolfKing:        { id: 'sealStone', chance: 0.40 },
    demonLord:       { id: 'sealStone', chance: 0.40 },
    iceEmperor:      { id: 'sealStone', chance: 0.40 },
    celestialDragon: { id: 'sealStone', chance: 0.40 }
  }
};

// Helper: lấy beastId từ bossType string
function _getBeastIdFromBossType(bossType) {
  for (const id in ANCIENT_BEAST_CONFIG) {
    if (id === 'bossSealDrops') continue;
    if (ANCIENT_BEAST_CONFIG[id].bossType === bossType) return id;
  }
  return null;
}

// ============================================================
//  PHẦN 2 — LOGIC MODULE
// ============================================================

const AncientBeastSystem = {

  // ── State ────────────────────────────────────────────────
  state: {
    activeBeast: null,
    capturedBeasts: [],
    releasedBeasts: [],
    beastData: {},

    captureAvailable: false,
    captureTarget: null,
    captureTimer: 5000,
    captureActive: false,

    cloneActive: false,
    cloneEndTime: 0,
    cloneX: 0,
    cloneY: 0,
    _cloneAttackTimer: 800,

    dotTargets: [],
    frozenEnemies: [],

    signatureCd: 0,
    _beastAttackTimer: 1200,
    _pendingCaptureBeastId: null  // dùng cho replace flow
  },

  // ── Khởi tạo ─────────────────────────────────────────────
  init() {
    // Thêm item sealStone vào ITEMS
    ITEMS.sealStone = {
      name: 'Linh Thạch Phong Ấn',
      type: 'material',
      rarity: 'epic',
      desc: 'Đá phong ấn Thần Thú cổ đại. Cần x3 để chinh phục.',
      sellPrice: 300,
      icon: 'sealStone'
    };

    // Reset state
    this.state.activeBeast = null;
    this.state.capturedBeasts = [];
    this.state.releasedBeasts = [];
    this.state.beastData = {};
    this.state.captureActive = false;
    this.state.captureTarget = null;
    this.state.captureTimer = 5000;
    this.state.cloneActive = false;
    this.state.dotTargets = [];
    this.state.frozenEnemies = [];
    this.state.signatureCd = 0;
    this.state._beastAttackTimer = 1200;
    this.state._pendingCaptureBeastId = null;

    this._injectHTML();
    this._injectStyle();
    this._setupEventListeners();
    this._hookEnemiesKill();
    this._hookRecalculateStats();
    this._hookSaveLoad();
    this._hookRenderClone();
    this._hookRenderEnemies();
    this._hookRenderCharacter();

    this._loadSavedData();

    console.log('🐉 Ancient Beast System initialized');
  },

  // ── Mount beast ───────────────────────────────────────────
  mountBeast(beastId) {
    if (!ANCIENT_BEAST_CONFIG[beastId]) return;
    const config = ANCIENT_BEAST_CONFIG[beastId];

    this.state.activeBeast = beastId;
    Player.activePet = beastId;

    // Inject PETS entry tạm thời
    PETS[beastId] = {
      id: beastId,
      name: config.name,
      bonus: this.getBeastBaseBonus(beastId),
      expBonus: config.passiveBonus.expPct || 0.05,
      color: config.color,
      colorDark: config.color
    };

    // Đảm bảo petData tồn tại
    if (!Player.petData) Player.petData = {};
    if (!Player.petData[beastId]) {
      Player.petData[beastId] = PetLevelSystem._defaultData();
    }

    // Đảm bảo beastData tồn tại
    if (!this.state.beastData[beastId]) {
      this.state.beastData[beastId] = PetLevelSystem._defaultData();
    }

    Player.recalculateStats();
    UI.addLog('✨ ' + config.name + ' đang theo bạn!', 'realm');
  },

  // ── Release beast ─────────────────────────────────────────
  releaseBeast(beastId) {
    if (!ANCIENT_BEAST_CONFIG[beastId]) return;
    const config = ANCIENT_BEAST_CONFIG[beastId];

    if (!this.state.releasedBeasts.includes(beastId)) {
      this.state.releasedBeasts.push(beastId);
    }
    this.state.capturedBeasts = this.state.capturedBeasts.filter(id => id !== beastId);
    this.state.activeBeast = null;
    Player.activePet = null;

    // Xóa PETS entry tạm
    delete PETS[beastId];

    // Unfreeze các enemy bị đóng băng (nếu iceQilin)
    if (beastId === 'iceQilin') {
      this.state.frozenEnemies.forEach(f => {
        if (f.enemy.alive) {
          f.enemy.color = f.originalColor;
          f.enemy.atk = f.originalAtk;
          f.enemy.aggroed = true;
        }
      });
      this.state.frozenEnemies = [];
    }

    // Dừng clone
    if (beastId === 'shadowFox') {
      this.state.cloneActive = false;
    }

    Player.recalculateStats();
    UI.addLog('🌟 ' + config.name + ' đã được thả tự do.', 'system');
  },

  // ── Tính base bonus của beast (convert passiveBonus → PETS.bonus format) ──
  getBeastBaseBonus(beastId) {
    if (!ANCIENT_BEAST_CONFIG[beastId]) return {};
    const pb = ANCIENT_BEAST_CONFIG[beastId].passiveBonus;
    const bonus = {};
    if (pb.maxHpPct) bonus.hp    = Math.floor(Player.maxHp * pb.maxHpPct);
    if (pb.atkPct)   bonus.atk   = Math.floor(Player.atk   * pb.atkPct);
    if (pb.defPct)   bonus.def   = Math.floor(Player.def   * pb.defPct);
    if (pb.speedPct) bonus.speed = Player.speed * pb.speedPct;
    // expPct handled qua PETS.expBonus
    return bonus;
  },

  // ── Capture System ────────────────────────────────────────
  checkCaptureCondition(enemy) {
    // Không capture boss event
    if (enemy.isBossEvent) return { canCapture: false, reason: 'boss_event' };

    // Kiểm tra có mapping sang beast không
    const beastId = _getBeastIdFromBossType(enemy.type);
    if (!beastId) return { canCapture: false, reason: 'not_ancient_beast' };

    // Phải dưới 10% HP
    if (enemy.hp / enemy.maxHp > 0.10) return { canCapture: false, reason: 'hp_too_high' };

    // Phải có đủ sealStone
    if (!Inventory.has('sealStone', 3)) return { canCapture: false, reason: 'no_seal_stone' };

    // Đã chinh phục và chưa release
    if (this.state.capturedBeasts.includes(beastId) && !this.state.releasedBeasts.includes(beastId)) {
      return { canCapture: false, reason: 'already_captured' };
    }

    return { canCapture: true, reason: 'ok', beastId };
  },

  showCapturePrompt(enemy) {
    if (this.state.captureActive) return;
    this.state.captureActive = true;
    this.state.captureTarget = enemy;
    this.state.captureTimer = 5000;
    CaptureUI.show(enemy, 5000);
  },

  confirmCapture() {
    const enemy = this.state.captureTarget;
    if (!enemy || !enemy.alive) {
      this.declineCapture();
      return;
    }

    Inventory.remove('sealStone', 3);
    const beastId = _getBeastIdFromBossType(enemy.type);
    if (!beastId) { this.declineCapture(); return; }

    if (!this.state.capturedBeasts.includes(beastId)) {
      this.state.capturedBeasts.push(beastId);
    }
    this.state.releasedBeasts = this.state.releasedBeasts.filter(id => id !== beastId);

    // Ẩn capture UI trước
    CaptureUI.hide();
    this.state.captureActive = false;

    // Xử lý replace nếu đang có beast khác active
    if (this.state.activeBeast !== null && this.state.activeBeast !== beastId) {
      // Hiện replace prompt
      this.state._pendingCaptureBeastId = beastId;
      this.state._pendingCaptureEnemy = enemy;
      ReplaceUI.show(this.state.activeBeast, beastId);
      return;
    }

    // Mount và kết thúc
    this._finishCapture(beastId, enemy);
  },

  _finishCapture(beastId, enemy) {
    const config = ANCIENT_BEAST_CONFIG[beastId];
    this.mountBeast(beastId);
    Enemies.kill(enemy);

    // Celebration particles
    for (let i = 0; i < 25; i++) {
      const angle = Math.random() * Math.PI * 2;
      GameState.particles.push({
        x: enemy.x, y: enemy.y,
        vx: Math.cos(angle) * 4,
        vy: Math.sin(angle) * 4 - 2,
        life: 800,
        color: config.glowColor,
        size: 4 + Math.random() * 4
      });
    }

    UI.showNotification('✨ Chinh Phục!', config.name + ' đã theo bạn!');
    UI.addLog('✨ Chinh phục ' + config.name + ' thành công!', 'realm');

    this.state._pendingCaptureBeastId = null;
    this.state._pendingCaptureEnemy = null;
  },

  confirmReplace() {
    const beastId = this.state._pendingCaptureBeastId;
    const enemy   = this.state._pendingCaptureEnemy;
    if (!beastId) return;

    // Release beast cũ
    if (this.state.activeBeast) this.releaseBeast(this.state.activeBeast);

    ReplaceUI.hide();
    this._finishCapture(beastId, enemy);
  },

  declineReplace() {
    ReplaceUI.hide();
    // Mount nhưng không giết enemy vì player từ chối
    const beastId = this.state._pendingCaptureBeastId;
    const enemy   = this.state._pendingCaptureEnemy;
    if (beastId && enemy) {
      Enemies.kill(enemy);
      UI.addLog('📦 ' + ANCIENT_BEAST_CONFIG[beastId].name + ' đã được lưu nhưng không triệu hồi.', 'system');
    }
    this.state._pendingCaptureBeastId = null;
    this.state._pendingCaptureEnemy   = null;
    this.state.captureTarget = null;
  },

  declineCapture() {
    CaptureUI.hide();
    this.state.captureActive = false;
    this.state.captureTarget = null;
  },

  // ── Signature Skills ──────────────────────────────────────
  updateSignature(dt) {
    if (this.state.signatureCd > 0) this.state.signatureCd -= dt;
    if (this.state.signatureCd > 0 || !this.state.activeBeast) return;

    const config = ANCIENT_BEAST_CONFIG[this.state.activeBeast];
    const sig = config.signature;
    let shouldActivate = false;

    switch (sig.type) {
      case 'drain':
        shouldActivate = !!Enemies.findNearest(Player.x, Player.y, sig.range, e => e.alive);
        break;
      case 'clone':
        shouldActivate = !this.state.cloneActive &&
          !!Enemies.findNearest(Player.x, Player.y, 200, e => e.alive);
        break;
      case 'dot':
        shouldActivate = !!Enemies.findNearest(Player.x, Player.y, 150, e => e.alive);
        break;
      case 'freeze':
        shouldActivate = Enemies.findInRange(Player.x, Player.y, 200).length >= 2;
        break;
    }

    if (shouldActivate) this.castSignature(this.state.activeBeast);
  },

  castSignature(beastId) {
    const config = ANCIENT_BEAST_CONFIG[beastId];
    const sig = config.signature;
    this.state.signatureCd = sig.cd;

    switch (sig.type) {
      case 'drain': {
        const target = Enemies.findNearest(Player.x, Player.y, sig.range, e => e.alive);
        if (!target) return;
        const drain = Math.floor(target.maxHp * sig.drainPct);
        Enemies.damage(target, drain, false, sig.color);
        Player.hp = Math.min(Player.maxHp, Player.hp + Math.floor(drain * 0.5));
        Game.spawnDamageNumber(Player.x, Player.y - 40, '+' + Math.floor(drain * 0.5), '#42a5f5');
        // Beam particles từ target → Player
        for (let i = 0; i < 10; i++) {
          const t = i / 10;
          GameState.particles.push({
            x: target.x + (Player.x - target.x) * t + (Math.random() - 0.5) * 10,
            y: target.y + (Player.y - target.y) * t + (Math.random() - 0.5) * 10,
            vx: 0, vy: -0.5, life: 400, color: sig.color, size: 2 + Math.random() * 2
          });
        }
        UI.addLog('💧 Rồng Hút!', 'heal');
        break;
      }

      case 'clone': {
        this.state.cloneActive = true;
        this.state.cloneEndTime = GameState.time + sig.duration;
        this.state.cloneX = Player.pet.x + (Math.random() - 0.5) * 40;
        this.state.cloneY = Player.pet.y + (Math.random() - 0.5) * 40;
        this.state._cloneAttackTimer = 800;
        for (let i = 0; i < 12; i++) {
          GameState.particles.push({
            x: this.state.cloneX + (Math.random() - 0.5) * 20,
            y: this.state.cloneY + (Math.random() - 0.5) * 20,
            vx: (Math.random() - 0.5) * 2, vy: -2 - Math.random(),
            life: 600, color: sig.color, size: 3 + Math.random() * 3
          });
        }
        UI.addLog('👥 Bóng Phân Thân!', 'item');
        break;
      }

      case 'dot': {
        const dotTarget = Enemies.findNearest(Player.x, Player.y, 150, e => e.alive);
        if (!dotTarget) return;
        const dmg = Math.floor(Player.atk * sig.dotDamage);
        this.state.dotTargets.push({
          enemy: dotTarget,
          damage: dmg,
          endTime: GameState.time + sig.dotDuration,
          nextTickTime: GameState.time + sig.dotInterval
        });
        for (let i = 0; i < 8; i++) {
          GameState.particles.push({
            x: dotTarget.x + (Math.random() - 0.5) * 15,
            y: dotTarget.y - dotTarget.size + (Math.random() - 0.5) * 10,
            vx: (Math.random() - 0.5) * 2, vy: -2 - Math.random(),
            life: 500, color: sig.color, size: 3 + Math.random() * 3
          });
        }
        UI.addLog('🔥 Thiêu Đốt!', 'item');
        break;
      }

      case 'freeze': {
        const targets = Enemies.findInRange(Player.x, Player.y, sig.aoeRadius);
        targets.forEach(({ enemy }) => {
          // Tránh double-freeze
          const alreadyFrozen = this.state.frozenEnemies.some(f => f.enemy === enemy);
          if (alreadyFrozen) return;
          this.state.frozenEnemies.push({
            enemy,
            endTime: GameState.time + sig.freezeDuration,
            originalColor: enemy.color,
            originalAtk: enemy.atk
          });
          enemy.color = '#80deea';
          enemy.atk = 0;
          enemy.aggroed = false;
        });
        targets.forEach(({ enemy }) => {
          for (let i = 0; i < 6; i++) {
            GameState.particles.push({
              x: enemy.x + (Math.random() - 0.5) * 20,
              y: enemy.y + (Math.random() - 0.5) * 20,
              vx: (Math.random() - 0.5) * 1.5, vy: -1 - Math.random(),
              life: 600, color: sig.color, size: 3 + Math.random() * 3
            });
          }
        });
        UI.showNotification('❄️ Băng Phong!', targets.length + ' kẻ địch bị đóng băng!');
        UI.addLog('❄️ Băng Phong! x' + targets.length + ' mục tiêu!', 'item');
        break;
      }
    }
  },

  updateDots(dt) {
    for (let i = this.state.dotTargets.length - 1; i >= 0; i--) {
      const dot = this.state.dotTargets[i];
      if (!dot.enemy.alive || GameState.time > dot.endTime) {
        this.state.dotTargets.splice(i, 1);
        continue;
      }
      if (GameState.time >= dot.nextTickTime) {
        Enemies.damage(dot.enemy, dot.damage, false, '#ff4500');
        dot.nextTickTime += 500;
        GameState.particles.push({
          x: dot.enemy.x + (Math.random() - 0.5) * 10,
          y: dot.enemy.y - dot.enemy.size,
          vx: (Math.random() - 0.5), vy: -1.5,
          life: 300, color: '#ff4500', size: 2 + Math.random() * 2
        });
      }
    }
  },

  updateFreezes(dt) {
    for (let i = this.state.frozenEnemies.length - 1; i >= 0; i--) {
      const f = this.state.frozenEnemies[i];
      if (GameState.time > f.endTime || !f.enemy.alive) {
        if (f.enemy.alive) {
          f.enemy.color = f.originalColor;
          f.enemy.atk = f.originalAtk;
          f.enemy.aggroed = true;
        }
        this.state.frozenEnemies.splice(i, 1);
      }
    }
  },

  updateClone(dt) {
    if (!this.state.cloneActive) return;
    if (GameState.time > this.state.cloneEndTime) {
      this.state.cloneActive = false;
      return;
    }
    this.state._cloneAttackTimer -= dt;
    if (this.state._cloneAttackTimer <= 0) {
      const sig = ANCIENT_BEAST_CONFIG.shadowFox.signature;
      const target = Enemies.findNearest(this.state.cloneX, this.state.cloneY, 150, e => e.alive);
      if (target) {
        const stats = this.getBeastCombatStats('shadowFox');
        const dmg = Math.floor(stats.atk * sig.cloneAtkPct);
        Enemies.damage(target, dmg, false, sig.color);
        GameState.particles.push({
          x: this.state.cloneX, y: this.state.cloneY,
          vx: (target.x - this.state.cloneX) / 50,
          vy: (target.y - this.state.cloneY) / 50,
          life: 200, color: sig.color, size: 4
        });
      }
      this.state._cloneAttackTimer = 800;
    }
  },

  getBeastCombatStats(beastId) {
    const config = ANCIENT_BEAST_CONFIG[beastId];
    return {
      hp:    Math.floor(Player.maxHp * config.hpMul),
      atk:   Math.floor(Player.atk   * config.atkMul),
      def:   Math.floor(Player.def   * config.defMul),
      speed: Player.speed * config.speedMul
    };
  },

  updateBeastCombat(dt) {
    if (!this.state._beastAttackTimer) this.state._beastAttackTimer = 1200;
    this.state._beastAttackTimer -= dt;
    if (this.state._beastAttackTimer > 0) return;
    if (!Player.pet) return;

    const beastPos = Player.pet;
    const target = Enemies.findNearest(beastPos.x, beastPos.y, 120, e => e.alive);
    if (!target) return;

    const stats = this.getBeastCombatStats(this.state.activeBeast);
    const dmg = Math.floor(stats.atk * 0.4);
    Enemies.damage(target, dmg, false, ANCIENT_BEAST_CONFIG[this.state.activeBeast].color);
    this.state._beastAttackTimer = 1200;

    GameState.particles.push({
      x: beastPos.x, y: beastPos.y,
      vx: (target.x - beastPos.x) / 20,
      vy: (target.y - beastPos.y) / 20,
      life: 200,
      color: ANCIENT_BEAST_CONFIG[this.state.activeBeast].glowColor,
      size: 3 + Math.random() * 2
    });
  },

  // ── Main update ───────────────────────────────────────────
  update(dt) {
    if (!Player.alive) return;

    // Update capture timer
    if (this.state.captureActive && this.state.captureTimer > 0) {
      this.state.captureTimer -= dt;
      if (this.state.captureTimer <= 0) this.declineCapture();
    }

    // Check capture condition (chỉ khi không đang trong capture flow)
    if (!this.state.captureActive && !this.state._pendingCaptureBeastId) {
      for (const enemy of Enemies.list) {
        if (!enemy.alive || !enemy.boss) continue;
        const check = this.checkCaptureCondition(enemy);
        if (check.canCapture) {
          this.showCapturePrompt(enemy);
          break;
        }
      }
    }

    if (!this.state.activeBeast) return;

    this.updateSignature(dt);
    this.updateDots(dt);
    this.updateFreezes(dt);
    this.updateClone(dt);
    this.updateBeastCombat(dt);
  },

  // ── Hooks ─────────────────────────────────────────────────
  _hookEnemiesKill() {
    const _origKillBeast = Enemies.kill.bind(Enemies);
    Enemies.kill = (enemy) => {
      _origKillBeast(enemy);

      // sealStone drop cho boss
      if (enemy.boss && ANCIENT_BEAST_CONFIG.bossSealDrops[enemy.type]) {
        const drop = ANCIENT_BEAST_CONFIG.bossSealDrops[enemy.type];
        if (Utils.chance(drop.chance)) {
          Inventory.add(drop.id, 1);
          UI.addLog('💎 Nhặt được Linh Thạch Phong Ấn!', 'item');
        }
      }

      // Give EXP cho beast đang active
      if (AncientBeastSystem.state.activeBeast) {
        const beastExp = Math.floor((enemy.exp || 0) * 0.3);
        if (beastExp > 0) PetLevelSystem.giveExp(beastExp);
      }
    };
  },

  _hookRecalculateStats() {
    const _origRSBeast = Player.recalculateStats.bind(Player);
    Player.recalculateStats = function () {
      _origRSBeast.call(this);
      if (!AncientBeastSystem.state.activeBeast) return;
      const config = ANCIENT_BEAST_CONFIG[AncientBeastSystem.state.activeBeast];
      const pb = config.passiveBonus;
      if (pb.maxHpPct) this.maxHp = Math.floor(this.maxHp * (1 + pb.maxHpPct));
      if (pb.atkPct)   this.atk   = Math.floor(this.atk   * (1 + pb.atkPct));
      if (pb.defPct)   this.def   = Math.floor(this.def   * (1 + pb.defPct));
      if (pb.speedPct) this.speed = this.speed * (1 + pb.speedPct);
      this.hp = Math.min(this.hp, this.maxHp);
      this.mp = Math.min(this.mp, this.maxMp);
    };
  },

  _hookSaveLoad() {
    // Hook getSaveData
    const _origGetSave = Player.getSaveData.bind(Player);
    Player.getSaveData = function () {
      const data = _origGetSave();
      data.ancientBeastData = {
        activeBeast: AncientBeastSystem.state.activeBeast,
        capturedBeasts: [...AncientBeastSystem.state.capturedBeasts],
        releasedBeasts: [...AncientBeastSystem.state.releasedBeasts],
        beastData: JSON.parse(JSON.stringify(AncientBeastSystem.state.beastData))
      };
      return data;
    };

    // Hook loadSaveData
    const _origLoadSave = Player.loadSaveData.bind(Player);
    Player.loadSaveData = function (data) {
      _origLoadSave(data);
      if (data && data.ancientBeastData) {
        const ab = data.ancientBeastData;
        AncientBeastSystem.state.capturedBeasts = ab.capturedBeasts || [];
        AncientBeastSystem.state.releasedBeasts = ab.releasedBeasts || [];
        AncientBeastSystem.state.beastData      = ab.beastData      || {};
        // activeBeast restore khi init
        AncientBeastSystem.state._savedActiveBeast = ab.activeBeast || null;
      }
    };
  },

  _hookRenderClone() {
    const _origRenderPet = Game.renderPet ? Game.renderPet.bind(Game) : null;
    if (!_origRenderPet) return;

    Game.renderPet = function () {
      _origRenderPet();

      // Render clone
      const s = AncientBeastSystem.state;
      if (!s.cloneActive) return;

      const ctx = Game.ctx;
      const cam = GameState.camera;
      const cfg = ANCIENT_BEAST_CONFIG.shadowFox;
      const px  = Math.floor(s.cloneX - cam.x);
      const py  = Math.floor(s.cloneY - cam.y);
      const scale = 2;

      ctx.save();
      ctx.globalAlpha = 0.5;
      Sprites.drawPixelArt(ctx, cfg.spriteStand, scale, px - 8, py - 8);
      ctx.restore();
    };
  },

  _hookRenderEnemies() {
    if (!Game.renderEnemies) return;
    const _origRenderEnemies = Game.renderEnemies.bind(Game);
    Game.renderEnemies = function () {
      _origRenderEnemies();
      const ctx = Game.ctx;
      const cam = GameState.camera;
      AncientBeastSystem.state.frozenEnemies.forEach(f => {
        if (!f.enemy.alive) return;
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#80deea';
        ctx.fillRect(
          f.enemy.x - cam.x - f.enemy.size,
          f.enemy.y - cam.y - f.enemy.size,
          f.enemy.size * 2, f.enemy.size * 2
        );
        ctx.globalAlpha = 1;
      });
    };
  },

  _hookRenderCharacter() {
    const _origRenderChar = UI.renderCharacter.bind(UI);
    UI.renderCharacter = function () {
      _origRenderChar();
      AncientBeastSystem._renderBeastSection();
    };
  },

  // Render beast section trong Character Panel
  _renderBeastSection() {
    const charStats = document.getElementById('charStats');
    if (!charStats) return;

    // Xóa section cũ nếu có
    const oldSection = document.getElementById('beastCharSection');
    if (oldSection) oldSection.remove();

    const section = document.createElement('div');
    section.id = 'beastCharSection';
    section.style.cssText = 'margin-top:12px;padding-top:10px;border-top:1px solid #333;';

    const title = document.createElement('div');
    title.style.cssText = 'color:#f0c040;font-weight:bold;font-size:12px;margin-bottom:8px;';
    title.textContent = '🐉 Thần Thú Đang Theo';
    section.appendChild(title);

    const ab = AncientBeastSystem.state;

    if (ab.activeBeast) {
      const cfg = ANCIENT_BEAST_CONFIG[ab.activeBeast];
      const petData = Player.petData && Player.petData[ab.activeBeast];
      const level = petData ? petData.level : 1;
      const exp   = petData ? petData.exp   : 0;
      const needed = PetLevelSystem.expForNextLevel(level);

      const content = document.createElement('div');
      content.style.cssText = 'font-size:11px;color:#ccc;';

      // Tên + passive
      const passiveText = Object.entries(cfg.passiveBonus)
        .map(([k, v]) => {
          const labels = { maxHpPct:'HP', atkPct:'ATK', defPct:'DEF', speedPct:'SPD', expPct:'EXP' };
          return `+${Math.round(v*100)}% ${labels[k] || k}`;
        }).join(', ');

      content.innerHTML = `
        <div style="color:${cfg.color};font-weight:bold;font-size:13px;margin-bottom:4px;">
          ${cfg.name} <span style="color:#aaa;font-size:10px;">Lv.${level}</span>
        </div>
        <div style="color:#8ef;font-size:10px;margin-bottom:6px;">✦ Bị động: ${passiveText}</div>
        <div style="font-size:10px;color:#aaa;margin-bottom:3px;">EXP: ${exp} / ${needed === Infinity ? 'MAX' : needed}</div>
      `;

      // EXP bar
      const expPct = needed === Infinity ? 100 : Math.floor((exp / needed) * 100);
      const expBar = document.createElement('div');
      expBar.style.cssText = 'height:4px;background:#111;border-radius:2px;margin-bottom:8px;overflow:hidden;';
      expBar.innerHTML = `<div style="height:100%;width:${expPct}%;background:linear-gradient(90deg,#f0c040,#ff9800);"></div>`;
      content.appendChild(expBar);

      // Signature skill + CD
      const sig = cfg.signature;
      const cdSec = Math.max(0, Math.ceil(ab.signatureCd / 1000));
      const sigDiv = document.createElement('div');
      sigDiv.style.cssText = 'background:#111;border-radius:6px;padding:6px;margin-bottom:8px;font-size:10px;';
      sigDiv.innerHTML = `
        <div style="color:#ff9800;font-weight:bold;">⚡ ${sig.name}</div>
        <div style="color:#aaa;margin-top:2px;">${sig.desc}</div>
        <div style="margin-top:3px;color:${cdSec > 0 ? '#f44336' : '#4caf50'};">
          ${cdSec > 0 ? `CD: ${cdSec}s` : '✓ Sẵn sàng'}
        </div>
      `;
      content.appendChild(sigDiv);

      // Nút thả ra
      const releaseBtn = document.createElement('button');
      releaseBtn.textContent = '🌟 Thả Ra';
      releaseBtn.style.cssText = `
        width:100%;padding:8px;border:1px solid #ff9800;border-radius:6px;
        background:rgba(255,152,0,0.15);color:#ff9800;font-size:11px;
        cursor:pointer;font-family:inherit;
      `;
      releaseBtn.onclick = () => {
        if (confirm('Thả ' + cfg.name + ' về tự nhiên?')) {
          AncientBeastSystem.releaseBeast(ab.activeBeast);
          UI.renderCharacter();
        }
      };
      content.appendChild(releaseBtn);
      section.appendChild(content);

    } else {
      // Chưa có beast
      const noContent = document.createElement('div');
      noContent.style.cssText = 'font-size:10px;color:#888;';
      noContent.textContent = 'Chưa chinh phục Thần Thú. Tìm Boss và chinh phục!';
      section.appendChild(noContent);

      // Danh sách 4 boss
      const listDiv = document.createElement('div');
      listDiv.style.cssText = 'margin-top:8px;';
      const beastList = ['thunderDragon', 'shadowFox', 'flameBird', 'iceQilin'];
      beastList.forEach(id => {
        const cfg = ANCIENT_BEAST_CONFIG[id];
        const ab  = AncientBeastSystem.state;
        let status = '○ Chưa chinh phục';
        let statusColor = '#666';
        if (ab.capturedBeasts.includes(id) && !ab.releasedBeasts.includes(id)) {
          status = '✓ Đã chinh phục'; statusColor = '#4caf50';
        } else if (ab.releasedBeasts.includes(id)) {
          status = '◎ Đã thả'; statusColor = '#ff9800';
        }
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;justify-content:space-between;font-size:10px;margin:3px 0;';
        row.innerHTML = `
          <span style="color:${cfg.color};">${cfg.name}</span>
          <span style="color:${statusColor};">${status}</span>
        `;
        listDiv.appendChild(row);
      });
      section.appendChild(listDiv);
    }

    charStats.appendChild(section);
  },

  _loadSavedData() {
    // Data đã được load qua hook loadSaveData
    // Restore activeBeast nếu có
    if (this.state._savedActiveBeast) {
      const id = this.state._savedActiveBeast;
      if (this.state.capturedBeasts.includes(id) && !this.state.releasedBeasts.includes(id)) {
        this.mountBeast(id);
      }
      this.state._savedActiveBeast = null;
    }
  },

  // ── HTML Injection ────────────────────────────────────────
  _injectHTML() {
    const div = document.createElement('div');
    div.innerHTML = `
      <!-- Capture Prompt -->
      <div id="capturePrompt" style="display:none;position:absolute;
        top:50%;left:50%;transform:translate(-50%,-50%);
        background:linear-gradient(135deg,#1a1a2e,#16213e);
        border:3px solid #f0c040;border-radius:15px;
        padding:20px;min-width:280px;text-align:center;z-index:150;
        box-shadow:0 0 40px rgba(240,192,64,0.4);">
        <div id="captureIcon" style="font-size:36px;margin-bottom:8px;"></div>
        <div id="captureName" style="color:#f0c040;font-size:16px;font-weight:bold;"></div>
        <div style="color:#aaa;font-size:10px;margin:6px 0;">
          Cần: Linh Thạch Phong Ấn x3
          <span id="captureSealCount" style="color:#8ef;"></span>
        </div>
        <div style="height:6px;background:#111;border-radius:3px;margin:10px 0;overflow:hidden;">
          <div id="captureTimerBar" style="height:100%;
            background:linear-gradient(90deg,#f0c040,#ff9800);width:100%;
            transition:width 0.1s;"></div>
        </div>
        <div style="display:flex;gap:10px;margin-top:12px;">
          <button id="captureConfirmBtn" style="
            flex:1;padding:10px;border:2px solid #4caf50;
            background:rgba(76,175,80,0.2);border-radius:8px;
            color:#4caf50;font-size:13px;font-weight:bold;
            cursor:pointer;font-family:inherit;">
            ⚡ CHINH PHỤC
          </button>
          <button id="captureDeclineBtn" style="
            flex:1;padding:10px;border:2px solid #f44336;
            background:rgba(244,67,54,0.2);border-radius:8px;
            color:#f44336;font-size:13px;cursor:pointer;
            font-family:inherit;">
            ✕ Bỏ qua
          </button>
        </div>
      </div>

      <!-- Replace Prompt -->
      <div id="replacePrompt" style="display:none;position:absolute;
        top:50%;left:50%;transform:translate(-50%,-50%);
        background:linear-gradient(135deg,#1a1a2e,#16213e);
        border:3px solid #ff9800;border-radius:15px;
        padding:20px;min-width:280px;text-align:center;z-index:151;">
        <div id="replaceText" style="color:#ff9800;font-size:13px;margin-bottom:15px;"></div>
        <div style="display:flex;gap:10px;">
          <button id="replaceYesBtn" style="flex:1;padding:10px;border:2px solid #4caf50;
            background:rgba(76,175,80,0.2);border-radius:8px;color:#4caf50;
            font-size:12px;cursor:pointer;font-family:inherit;">✓ Thay thế</button>
          <button id="replaceNoBtn" style="flex:1;padding:10px;border:2px solid #f44336;
            background:rgba(244,67,54,0.2);border-radius:8px;color:#f44336;
            font-size:12px;cursor:pointer;font-family:inherit;">✕ Giữ lại</button>
        </div>
      </div>
    `;
    document.body.appendChild(div);
  },

  _injectStyle() {
    if (document.getElementById('beast-style')) return;
    const style = document.createElement('style');
    style.id = 'beast-style';
    style.textContent = `
      #capturePrompt button:hover { opacity: 0.85; }
      #replacePrompt button:hover { opacity: 0.85; }
      #beastCharSection button:hover { opacity: 0.85; }
    `;
    document.head.appendChild(style);
  },

  _setupEventListeners() {
    // Capture buttons (event delegation với timeout để đảm bảo DOM đã inject)
    setTimeout(() => {
      const confirmBtn = document.getElementById('captureConfirmBtn');
      const declineBtn = document.getElementById('captureDeclineBtn');
      const replaceYes = document.getElementById('replaceYesBtn');
      const replaceNo  = document.getElementById('replaceNoBtn');

      if (confirmBtn) confirmBtn.addEventListener('click', () => AncientBeastSystem.confirmCapture());
      if (declineBtn) declineBtn.addEventListener('click', () => AncientBeastSystem.declineCapture());
      if (replaceYes) replaceYes.addEventListener('click', () => AncientBeastSystem.confirmReplace());
      if (replaceNo)  replaceNo.addEventListener('click', () => AncientBeastSystem.declineReplace());
    }, 100);
  }
};

// ── Capture UI ────────────────────────────────────────────────
const CaptureUI = {
  _animFrame: null,

  show(enemy, duration) {
    const prompt = document.getElementById('capturePrompt');
    if (!prompt) return;

    const cfg = ANCIENT_BEAST_CONFIG[_getBeastIdFromBossType(enemy.type)];
    const sealCount = Inventory.has('sealStone', 1) ? (
      typeof Inventory.count === 'function'
        ? Inventory.count('sealStone')
        : '?'
    ) : 0;

    document.getElementById('captureIcon').textContent = cfg ? cfg.glowColor ? '✨' : '🐉' : '🐉';
    document.getElementById('captureName').textContent = cfg ? cfg.name : enemy.name;
    document.getElementById('captureSealCount').textContent = ' (bạn có: ?)';

    // Cố lấy số lượng sealStone
    try {
      if (typeof Inventory.getCount === 'function') {
        const cnt = Inventory.getCount('sealStone');
        document.getElementById('captureSealCount').textContent = ` (bạn có: ${cnt})`;
      } else if (GameState.inventory) {
        // fallback: đếm trong inventory
        let cnt = 0;
        for (const slot of GameState.inventory) {
          if (slot && slot.id === 'sealStone') { cnt += (slot.count || 1); }
        }
        document.getElementById('captureSealCount').textContent = ` (bạn có: ${cnt})`;
      }
    } catch(e) {}

    const bar = document.getElementById('captureTimerBar');
    if (bar) bar.style.width = '100%';

    prompt.style.display = 'block';
    this._startTimer(duration);
  },

  _startTimer(duration) {
    const bar = document.getElementById('captureTimerBar');
    if (!bar) return;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const pct = Math.max(0, 100 - (elapsed / duration) * 100);
      bar.style.width = pct + '%';
      if (pct > 0 && AncientBeastSystem.state.captureActive) {
        this._animFrame = requestAnimationFrame(tick);
      }
    };
    this._animFrame = requestAnimationFrame(tick);
  },

  hide() {
    const prompt = document.getElementById('capturePrompt');
    if (prompt) prompt.style.display = 'none';
    if (this._animFrame) {
      cancelAnimationFrame(this._animFrame);
      this._animFrame = null;
    }
  },

  update() {
    // Timer bar update đã xử lý qua requestAnimationFrame trong show()
  }
};

// ── Replace UI ────────────────────────────────────────────────
const ReplaceUI = {
  show(oldBeastId, newBeastId) {
    const prompt = document.getElementById('replacePrompt');
    if (!prompt) return;
    const oldName = ANCIENT_BEAST_CONFIG[oldBeastId] ? ANCIENT_BEAST_CONFIG[oldBeastId].name : oldBeastId;
    const newName = ANCIENT_BEAST_CONFIG[newBeastId] ? ANCIENT_BEAST_CONFIG[newBeastId].name : newBeastId;
    const text = document.getElementById('replaceText');
    if (text) text.textContent = `Muốn thay thế ${oldName} bằng ${newName}?`;
    prompt.style.display = 'block';
  },
  hide() {
    const prompt = document.getElementById('replacePrompt');
    if (prompt) prompt.style.display = 'none';
  }
};

// ============================================================
//  PHẦN 3 — KHỞI ĐỘNG
// ============================================================

(function () {
  // Wrap Game.init
  const _origGameInit = Game.init.bind(Game);
  Game.init = function () {
    _origGameInit();
    AncientBeastSystem.init();
  };

  // Wrap Game.update
  const _origGameUpdate = Game.update.bind(Game);
  Game.update = function (dt) {
    _origGameUpdate(dt);
    AncientBeastSystem.update(dt);
    CaptureUI.update();
  };

  // Wrap Game.save
  const _origGameSave = Game.save ? Game.save.bind(Game) : null;
  if (_origGameSave) {
    Game.save = function () {
      _origGameSave();
      // ancientBeastData đã được nhúng vào Player.getSaveData() qua hook
    };
  }

  // Wrap Game.load
  const _origGameLoad = Game.load ? Game.load.bind(Game) : null;
  if (_origGameLoad) {
    Game.load = function () {
      _origGameLoad();
      // ancientBeastData đã được load qua hook loadSaveData
      // Restore active beast sau khi load
      setTimeout(() => {
        if (AncientBeastSystem.state._savedActiveBeast) {
          AncientBeastSystem._loadSavedData();
        }
      }, 50);
    };
  }

})();

console.log('🐉 Ancient Beast System loaded');
// Thêm vào index.html SAU feature_pet_level.js:
// <script src="js/feature_ancient_beast.js"></script>
