// ===== FILE: feature_bloodline_karma.js =====
// ==================== FEATURE: BLOODLINE + KARMA + BLACK MARKET ====================
// Load sau: config.js, player.js, enemies.js, maps.js, npc.js, inventory.js, game.js, ui.js

// ============================================================
// SECTION 1 — DATA & CONFIG
// ============================================================

const BLOODLINE_CONFIG = {
  requireRealm: 3, // Nguyên Anh Kỳ

  bloodlines: {
    dragon: {
      id: 'dragon', name: 'Long Huyết', icon: '🐉', color: '#1565c0', glowColor: '#42a5f5',
      desc: 'Miễn đóng băng. Hỏa skill +50%. Mỗi 10 kill hồi 10% HP.',
      passives: {
        immuneFreeze: true,
        fireSkillBonus: 0.50,
        killHealInterval: 10,
        killHealPct: 0.10
      }
    },
    phoenix: {
      id: 'phoenix', name: 'Phượng Huyết', icon: '🔥', color: '#ff6f00', glowColor: '#ffcc02',
      desc: 'Khi chết hồi sinh với 50% HP. 1 lần/ngày.',
      passives: {
        reviveHpPct: 0.50,
        reviveCooldown: 24 * 60 * 60 * 1000
      }
    },
    beast: {
      id: 'beast', name: 'Thần Thú Huyết', icon: '🐾', color: '#2e7d32', glowColor: '#66bb6a',
      desc: 'Pet/Thần Thú stat x2. Tự triệu hồi khi combat.',
      passives: {
        petStatMul: 2.0,
        autoSummonInCombat: true
      }
    },
    shadow: {
      id: 'shadow', name: 'Hắc Ám Huyết', icon: '🌑', color: '#4a148c', glowColor: '#ce93d8',
      desc: 'HP thấp → damage tăng. Đứng yên 3s → invisible với quái.',
      passives: {
        lowHpDmgBonus: {
          thresholds: [
            { hp: 1.0, bonus: 0 },
            { hp: 0.5, bonus: 0.25 },
            { hp: 0.2, bonus: 0.50 }
          ]
        },
        invisibleIdleTime: 3000,
        invisibleVelocityThreshold: 0.1
      }
    }
  }
};

const KARMA_CONFIG = {
  min: -1000, max: 1000, start: 0,

  events: {
    killNormal: -1,
    killBoss: -5,
    killStreak10: -15,
    helpNpc: +20,
    buyMerchant: +2,
    useBlackMarket: -30,
    clearDungeon: +10,
    captureAncientBeast: +25,
    killElite: -2,
    killChampion: -8
  },

  tiers: [
    { min: 500,  max: 1000, name: 'Tiên Nhân',  color: '#f0c040', npcDiscount: 0.20,  aura: 'white', blackMarket: false },
    { min: 100,  max: 499,  name: 'Hiệp Khách', color: '#4caf50', npcDiscount: 0,     aura: null,    blackMarket: false },
    { min: -99,  max: 99,   name: 'Trung Lập',  color: '#888888', npcDiscount: 0,     aura: null,    blackMarket: false },
    { min: -499, max: -100, name: 'Sát Thủ',    color: '#ff9800', npcDiscount: -0.10, aura: 'dark',  blackMarket: false },
    { min: -1000,max: -500, name: 'Ma Đạo',     color: '#e040fb', npcDiscount: -0.10, aura: 'black', blackMarket: true  }
  ],

  oanHonThreshold: 10,
  oanHonDelay: 30000,
  oanHonHpMul: 3.0,
  oanHonFollow: true,

  endings: {
    rightPath: { karma: 800,  title: 'Tiên Nhân Chính Đạo', lore: 'Đạo hữu đã chọn con đường chính đạo...' },
    darkPath:  { karma: -800, title: 'Ma Đạo Thành Tôn',    lore: 'Ngươi đã trở thành Ma Tôn vĩ đại nhất...' }
  }
};

const BLACK_MARKET_CONFIG = {
  maxCurses: 2,
  requireKarmaTier: 'Ma Đạo',

  cursedItems: [
    { id: 'bloodSword',    name: 'Huyết Ma Kiếm',     price: 800, itemBase: 'flameSword',    buffDesc: 'ATK +25%',                curseDesc: 'Mỗi kill mất 5 HP',          buff: { atkPct: 0.25 },       curse: { type: 'onKill',          hpLoss: 5 } },
    { id: 'demonArmor',   name: 'Ma Giáp Huyết Ngục', price: 700, itemBase: 'dragonArmor',   buffDesc: 'DEF +30%',                curseDesc: 'Không thể hồi HP tự nhiên',  buff: { defPct: 0.30 },       curse: { type: 'blockRegen' } },
    { id: 'forbiddenPill', name: 'Linh Đan Cấm',      price: 400, itemBase: 'expPotion',     buffDesc: '+500 EXP ngay lập tức',   curseDesc: 'MaxHP -50 vĩnh viễn',        buff: { instantExp: 500 },    curse: { type: 'maxHpReduce', value: 50, permanent: true } },
    { id: 'darkArts',     name: 'Ám Thuật Quyển',     price: 600, itemBase: 'realmPill',     buffDesc: 'Skill damage +40%',       curseDesc: 'MP cost x2',                 buff: { skillDmgPct: 0.40 },  curse: { type: 'mpCostMul', value: 2.0 } },
    { id: 'greedRing',    name: 'Tham Lam Chi Giới',  price: 500, itemBase: 'dragonAmulet',  buffDesc: 'Gold drop x2',            curseDesc: 'Không thể dùng đan dược',    buff: { goldMul: 2.0 },       curse: { type: 'blockConsumable' } },
    { id: 'bloodCritRing', name: 'Huyết Khế',         price: 650, itemBase: 'celestialJade', buffDesc: 'Crit rate +15%',          curseDesc: 'Mỗi crit mất 3% maxHP',      buff: { critRate: 0.15 },     curse: { type: 'onCrit', hpLossPct: 0.03 } },
    { id: 'cursedVision', name: 'Hắc Thị',            price: 450, itemBase: 'spiritPendant', buffDesc: 'Phát hiện quái x2 tầm',  curseDesc: 'Camera darker 25%',          buff: { aggroDetect: 2.0 },   curse: { type: 'darkScreen', alpha: 0.25 } }
  ],

  purifyItem: {
    id: 'purifyCharm',
    name: 'Giải Chú Phù',
    price: 1500,
    desc: 'Xóa 1 lời nguyền đang active'
  }
};

// ============================================================
// SECTION 2 — BLOODLINE SYSTEM
// ============================================================

const BloodlineSystem = {
  state: {
    chosen: false,
    bloodlineId: null,
    pending: true,
    reviveLastUsed: 0,
    killCountForHeal: 0,
    idleTimer: 0,
    isInvisible: false,
    autoSummonedThisCombat: false,
    _lastCombatState: false
  },

  checkUnlock() {
    if (Player.realm >= BLOODLINE_CONFIG.requireRealm && !this.state.chosen && !BloodlinePanel.shown) {
      BloodlinePanel.show();
    }
  },

  choose(bloodlineId) {
    this.state.bloodlineId = bloodlineId;
    this.state.chosen = true;
    this.state.pending = false;
    Player.recalculateStats();

    const config = BLOODLINE_CONFIG.bloodlines[bloodlineId];
    UI.showNotification('🩸 Huyết Mạch Thức Tỉnh!', config.name);
    UI.addLog('🩸 ' + config.name + ' đã thức tỉnh!', 'realm');

    for (let i = 0; i < 25; i++) {
      const angle = (i / 25) * Math.PI * 2;
      GameState.particles.push({
        x: Player.x + Math.cos(angle) * 20,
        y: Player.y + Math.sin(angle) * 20,
        vx: Math.cos(angle) * 3,
        vy: Math.sin(angle) * 3 - 1,
        life: 800,
        color: config.glowColor,
        size: 4 + Math.random() * 4
      });
    }
  },

  getBloodline() {
    return this.state.bloodlineId ? BLOODLINE_CONFIG.bloodlines[this.state.bloodlineId] : null;
  },

  hasPassive(passiveKey) {
    const bl = this.getBloodline();
    return bl ? !!bl.passives[passiveKey] : false;
  },

  applyToStats(player) {
    if (!this.state.chosen) return;
    const passives = this.getBloodline().passives;

    if (passives.lowHpDmgBonus) {
      const hpPct = player.hp / player.maxHp;
      let bonus = 0;
      for (const t of passives.lowHpDmgBonus.thresholds) {
        if (hpPct <= t.hp) bonus = t.bonus;
      }
      player._bloodlineDmgBonus = bonus;
    }

    if (passives.petStatMul && typeof PetLevelSystem !== 'undefined') {
      player._bloodlinePetMul = passives.petStatMul;
    }
  },

  update(dt) {
    if (!this.state.chosen) {
      this.checkUnlock();
      return;
    }

    const passives = this.getBloodline().passives;

    // Shadow — invisible timer
    if (passives.invisibleIdleTime) {
      const isMoving = Math.abs(Player.vx || 0) > passives.invisibleVelocityThreshold
        || Math.abs(Player.vy || 0) > passives.invisibleVelocityThreshold;

      if (!isMoving) {
        this.state.idleTimer += dt;
        if (this.state.idleTimer >= passives.invisibleIdleTime && !this.state.isInvisible) {
          this.state.isInvisible = true;
          for (const e of Enemies.list) {
            if (e.alive && !e.aggroed) e._shadowInvisBlock = true;
          }
          UI.addLog('🌑 Tàng hình trong bóng tối...', 'system');
        }
      } else {
        this.state.idleTimer = 0;
        if (this.state.isInvisible) {
          this.state.isInvisible = false;
          for (const e of Enemies.list) delete e._shadowInvisBlock;
        }
      }

      // Shadow trail particles khi di chuyển
      if (isMoving && Math.random() < 0.08) {
        GameState.particles.push({
          x: Player.x + (Math.random() - 0.5) * 10,
          y: Player.y + 10,
          vx: (Math.random() - 0.5) * 0.5,
          vy: -0.3,
          life: 500,
          color: '#4a148c',
          size: 3 + Math.random() * 3
        });
      }
    }

    // Beast — auto summon khi combat
    if (passives.autoSummonInCombat) {
      const nearEnemy = Enemies.findNearest(Player.x, Player.y, 200, e => e.alive && e.aggroed);
      const inCombat  = !!nearEnemy;

      if (inCombat && !this.state._lastCombatState && !Player.activePet) {
        if (Player.ownedPets && Player.ownedPets.length > 0) {
          Player.activePet = Player.ownedPets[0];
          Player.recalculateStats();
          UI.addLog('🐾 Thần Thú Huyết tự triệu hồi ' +
            (PETS[Player.activePet] ? PETS[Player.activePet].name : 'Linh Thú') + '!', 'item');
        }
      }
      this.state._lastCombatState = inCombat;
    }

    this.renderBloodlineAura();
  },

  renderBloodlineAura() {
    if (!this.state.chosen || !Player.alive) return;
    const config = this.getBloodline();
    const ctx = Game.ctx;
    const cx  = Player.x - GameState.camera.x;
    const cy  = Player.y - 10 - GameState.camera.y;

    switch (this.state.bloodlineId) {
      case 'dragon': {
        const dPulse = 0.3 + Math.sin(GameState.time / 200) * 0.15;
        ctx.globalAlpha = dPulse * 0.4;
        ctx.strokeStyle = '#1565c0';
        ctx.lineWidth   = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 25 + Math.sin(GameState.time / 300) * 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
        break;
      }
      case 'phoenix': {
        const hpPct = Player.hp / Player.maxHp;
        if (hpPct < 0.5) {
          const intensity = (0.5 - hpPct) / 0.5;
          for (let i = 0; i < 2; i++) {
            const a = Math.random() * Math.PI * 2;
            GameState.particles.push({
              x: cx + GameState.camera.x + Math.cos(a) * 18,
              y: cy + GameState.camera.y + Math.sin(a) * 18,
              vx: Math.cos(a) * 1.5,
              vy: -2 - Math.random(),
              life: 300,
              color: '#ff6f00',
              size: 2 + Math.random() * 2 * intensity
            });
          }
        }
        break;
      }
      case 'beast': {
        if (Player.activePet && Math.random() < 0.05) {
          GameState.particles.push({
            x: Player.pet ? Player.pet.x : cx + GameState.camera.x,
            y: Player.pet ? Player.pet.y : cy + GameState.camera.y,
            vx: (Math.random() - 0.5) * 1,
            vy: -1,
            life: 400,
            color: '#66bb6a',
            size: 2 + Math.random() * 2
          });
        }
        break;
      }
      case 'shadow': {
        if (this.state.isInvisible) {
          ctx.globalAlpha = 0.3;
          ctx.fillStyle   = '#4a148c';
          ctx.beginPath();
          ctx.arc(cx, cy, 22, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
        break;
      }
    }
  },

  onKillEnemy(enemy) {
    if (!this.state.chosen) return;
    const passives = this.getBloodline().passives;

    if (passives.killHealInterval) {
      this.state.killCountForHeal++;
      if (this.state.killCountForHeal >= passives.killHealInterval) {
        this.state.killCountForHeal = 0;
        const heal = Math.floor(Player.maxHp * passives.killHealPct);
        Player.hp = Math.min(Player.maxHp, Player.hp + heal);
        Game.spawnDamageNumber(Player.x, Player.y - 40, '+' + heal + ' HP', '#42a5f5');
        for (let i = 0; i < 8; i++) {
          GameState.particles.push({
            x: Player.x + (Math.random() - 0.5) * 20,
            y: Player.y + (Math.random() - 0.5) * 20,
            vx: (Math.random() - 0.5) * 2,
            vy: -1.5 - Math.random(),
            life: 400,
            color: '#42a5f5',
            size: 3 + Math.random() * 2
          });
        }
      }
    }
  },

  checkRevive() {
    if (!this.state.chosen) return false;
    const passives = this.getBloodline().passives;
    if (!passives.reviveHpPct) return false;

    const elapsed = Date.now() - this.state.reviveLastUsed;
    if (elapsed < passives.reviveCooldown) return false;

    this.state.reviveLastUsed = Date.now();
    setTimeout(() => {
      Player.alive = true;
      Player.hp = Math.floor(Player.maxHp * passives.reviveHpPct);
      for (let i = 0; i < 30; i++) {
        const a = (i / 30) * Math.PI * 2;
        GameState.particles.push({
          x: Player.x + Math.cos(a) * 25,
          y: Player.y + Math.sin(a) * 25,
          vx: Math.cos(a) * 4,
          vy: Math.sin(a) * 4 - 2,
          life: 800,
          color: '#ff6f00',
          size: 4 + Math.random() * 4
        });
      }
      UI.showNotification('🔥 Phượng Hoàng Tái Sinh!', 'HP hồi 50%');
      UI.addLog('🔥 Phượng Huyết kích hoạt! Hồi sinh!', 'realm');
    }, 500);
    return true;
  },

  getFireBonus() {
    if (this.state.bloodlineId !== 'dragon') return 1.0;
    return 1 + this.getBloodline().passives.fireSkillBonus;
  },

  getDamageBonus() {
    return Player._bloodlineDmgBonus || 0;
  },

  getSaveData() {
    return {
      chosen: this.state.chosen,
      bloodlineId: this.state.bloodlineId,
      pending: this.state.pending,
      reviveLastUsed: this.state.reviveLastUsed,
      killCountForHeal: this.state.killCountForHeal
    };
  },

  loadSaveData(data) {
    if (!data) return;
    this.state.chosen           = data.chosen           || false;
    this.state.bloodlineId      = data.bloodlineId      || null;
    this.state.pending          = data.pending !== undefined ? data.pending : true;
    this.state.reviveLastUsed   = data.reviveLastUsed   || 0;
    this.state.killCountForHeal = data.killCountForHeal || 0;
  }
};

// ============================================================
// SECTION 3 — KARMA SYSTEM
// ============================================================

const KarmaSystem = {
  state: {
    score: 0,
    killCounts: {},
    oanHons: [],
    pendingOanHons: [],
    greetedNpcs: {},
    merchantVisits: 0,
    activeCurses: [],
    permanentCurses: {}
  },

  getScore() { return this.state.score; },

  getTier() {
    const s = this.state.score;
    return KARMA_CONFIG.tiers.find(t => s >= t.min && s <= t.max) || KARMA_CONFIG.tiers[2];
  },

  addKarma(amount) {
    const prevTier = this.getTier();
    this.state.score = Utils.clamp(this.state.score + amount, KARMA_CONFIG.min, KARMA_CONFIG.max);
    const newTier = this.getTier();

    if (prevTier.name !== newTier.name) {
      UI.showNotification('⚖️ Nghiệp Lực Thay Đổi!', newTier.name);
      UI.addLog('⚖️ Nghiệp lực: ' + newTier.name + ' (' + this.state.score + ')', 'system');
    }

    this.updateKarmaHUD();
  },

  onKillEnemy(enemy) {
    this.addKarma(enemy.boss ? KARMA_CONFIG.events.killBoss : KARMA_CONFIG.events.killNormal);

    this.state.killCounts[enemy.type] = (this.state.killCounts[enemy.type] || 0) + 1;

    if (this.state.killCounts[enemy.type] % KARMA_CONFIG.oanHonThreshold === 0) {
      this.addKarma(KARMA_CONFIG.events.killStreak10);
      this.spawnOanHon(enemy.type, enemy.level || 1);
    }
  },

  spawnOanHon(enemyType, level) {
    this.state.pendingOanHons.push({
      type: enemyType,
      level: (level || 1) + 3,
      spawnAt: GameState.time + KARMA_CONFIG.oanHonDelay
    });
    UI.addLog('👻 Oan Hồn đang đến tìm ngươi trả thù...', 'system');
    UI.showNotification('⚠️ Oan Hồn Xuất Hiện!', 'Chúng sẽ đến sau 30 giây');
  },

  update(dt) {
    const now = GameState.time;

    // Spawn pending Oan Hồn
    for (let i = this.state.pendingOanHons.length - 1; i >= 0; i--) {
      const p = this.state.pendingOanHons[i];
      if (now < p.spawnAt) continue;
      const e = Enemies.spawn(p.type, KARMA_CONFIG.oanHonHpMul, p.level);
      if (e) {
        e.name    = '【Oan Hồn】' + e.name;
        e.color   = '#7c4dff';
        e._isOanHon = true;
        e.drops   = [];
        e.gold    = 0;
        e.exp     = 0;
        e.aggroed = true;
        const angle = Math.random() * Math.PI * 2;
        e.x = Player.x + Math.cos(angle) * 200;
        e.y = Player.y + Math.sin(angle) * 200;
        e.spawnX  = e.x;
        e.spawnY  = e.y;
        this.state.oanHons.push(e);
      }
      this.state.pendingOanHons.splice(i, 1);
    }

    // Clean up dead Oan Hồn
    this.state.oanHons = this.state.oanHons.filter(e => e.alive);

    // Apply permanent curses
    if (this.state.permanentCurses.maxHpReduce) {
      Player.maxHp = Math.max(1, Player.maxHp - this.state.permanentCurses.maxHpReduce);
      Player.hp    = Math.min(Player.hp, Player.maxHp);
    }

    // Block natural regen if curse active
    const blockRegen = this.state.activeCurses.find(c => c.curse.type === 'blockRegen');
    if (blockRegen && Player._preRegenHp !== undefined && Player._preRegenHp < Player.hp) {
      Player.hp = Player._preRegenHp;
    }

    // Shadow invisibility: cancel NEW aggro for marked enemies
    if (BloodlineSystem.state.isInvisible) {
      for (const e of Enemies.list) {
        if (e.alive && e._shadowInvisBlock && e.aggroed) e.aggroed = false;
      }
    }

    if (Player.realm >= 8) this.checkEnding();

    this.updateKarmaHUD();
  },

  checkEnding() {
    if (this.state.score >= KARMA_CONFIG.endings.rightPath.karma) {
      UI.showNotification('✨ ' + KARMA_CONFIG.endings.rightPath.title, KARMA_CONFIG.endings.rightPath.lore);
    }
    if (this.state.score <= KARMA_CONFIG.endings.darkPath.karma) {
      UI.showNotification('🌑 ' + KARMA_CONFIG.endings.darkPath.title, KARMA_CONFIG.endings.darkPath.lore);
    }
  },

  isBlackMarketAvailable() { return this.getTier().blackMarket; },

  removeCurse() {
    if (this.state.activeCurses.length === 0) {
      UI.addLog('Không có lời nguyền nào.', 'system');
      return;
    }
    const removed = this.state.activeCurses.pop();
    Player.recalculateStats();
    UI.addLog('✨ Đã giải lời nguyền: ' + removed.name, 'system');
  },

  updateKarmaHUD() {
    const tierNameEl    = document.getElementById('karmaTierName');
    const karmaDisplayEl = document.getElementById('karmaDisplay');
    if (!tierNameEl || !karmaDisplayEl) return;
    const tier = this.getTier();
    tierNameEl.textContent  = tier.name;
    tierNameEl.style.color  = tier.color;
    karmaDisplayEl.style.borderColor = tier.color;
  },

  getSaveData() {
    return {
      score: this.state.score,
      killCounts: this.state.killCounts,
      activeCurses: this.state.activeCurses,
      permanentCurses: this.state.permanentCurses,
      merchantVisits: this.state.merchantVisits
    };
  },

  loadSaveData(data) {
    if (!data) return;
    this.state.score           = data.score           || 0;
    this.state.killCounts      = data.killCounts      || {};
    this.state.activeCurses    = data.activeCurses    || [];
    this.state.permanentCurses = data.permanentCurses || {};
    this.state.merchantVisits  = data.merchantVisits  || 0;
  }
};

// ============================================================
// SECTION 4 — BLACK MARKET SYSTEM
// ============================================================

const BlackMarketSystem = {
  state: {
    currentStock: [],
    lastStockDate: null,
    npcSpawned: false
  },

  generateStock() {
    const shuffled = [...BLACK_MARKET_CONFIG.cursedItems].sort(() => Math.random() - 0.5);
    this.state.currentStock = shuffled.slice(0, 3 + Math.floor(Math.random() * 3))
      .map(item => ({ item, price: item.price }));
    // Always add purify charm
    this.state.currentStock.push({
      item: BLACK_MARKET_CONFIG.purifyItem,
      price: BLACK_MARKET_CONFIG.purifyItem.price,
      isPurify: true
    });
    this.state.lastStockDate = new Date().toDateString();
  },

  checkDailyStock() {
    if (this.state.lastStockDate !== new Date().toDateString()) this.generateStock();
  },

  buyCursedItem(itemId) {
    const stockItem = this.state.currentStock.find(s => s.item.id === itemId);
    if (!stockItem) return false;

    if (stockItem.isPurify) {
      if (Player.gold < stockItem.price) { UI.addLog('❌ Không đủ vàng!', 'system'); return false; }
      Player.gold -= stockItem.price;
      Inventory.add('purifyCharm', 1);
      UI.addLog('✨ Mua Giải Chú Phù thành công!', 'item');
      UI.updateGold();
      return true;
    }

    if (KarmaSystem.state.activeCurses.length >= BLACK_MARKET_CONFIG.maxCurses) {
      UI.addLog('❌ Đã đạt giới hạn ' + BLACK_MARKET_CONFIG.maxCurses + ' lời nguyền!', 'system');
      return false;
    }
    if (Player.gold < stockItem.price) { UI.addLog('❌ Không đủ vàng!', 'system'); return false; }

    Player.gold -= stockItem.price;
    KarmaSystem.addKarma(KARMA_CONFIG.events.useBlackMarket);

    const item = stockItem.item;

    if (item.buff.instantExp) Player.gainExp(item.buff.instantExp);

    if (item.buff.atkPct || item.buff.defPct || item.buff.critRate || item.buff.skillDmgPct || item.buff.goldMul) {
      Player._blackMarketBuffs = Player._blackMarketBuffs || {};
      Object.assign(Player._blackMarketBuffs, item.buff);
      Player.recalculateStats();
    }

    if (item.curse.permanent && item.curse.type === 'maxHpReduce') {
      KarmaSystem.state.permanentCurses.maxHpReduce =
        (KarmaSystem.state.permanentCurses.maxHpReduce || 0) + item.curse.value;
    }

    KarmaSystem.state.activeCurses.push({
      curseId: item.id, name: item.name, curse: item.curse, buff: item.buff
    });

    UI.addLog('🌑 Mua ' + item.name + ' — ' + item.curseDesc, 'system');
    UI.showNotification('🌑 ' + item.name, item.buffDesc);
    UI.updateGold();

    if (BlackMarketPanel._el) BlackMarketPanel.render();
    return true;
  },

  removeCurse() {
    KarmaSystem.removeCurse();
    if (BlackMarketPanel._el) BlackMarketPanel.render();
  },

  applyCurseOnKill(enemy) {
    const onKillCurse = KarmaSystem.state.activeCurses.find(c => c.curse.type === 'onKill');
    if (onKillCurse) Player.hp = Math.max(1, Player.hp - onKillCurse.curse.hpLoss);

    const goldMulCurse = KarmaSystem.state.activeCurses.find(c => c.buff && c.buff.goldMul);
    if (goldMulCurse) Player.gold += Math.floor(enemy.gold * (goldMulCurse.buff.goldMul - 1));
  },

  applyCurseOnCrit() {
    const onCritCurse = KarmaSystem.state.activeCurses.find(c => c.curse.type === 'onCrit');
    if (onCritCurse) Player.hp = Math.max(1, Player.hp - Math.floor(Player.maxHp * onCritCurse.curse.hpLossPct));
  },

  getMpCostMul() {
    const mpCurse = KarmaSystem.state.activeCurses.find(c => c.curse.type === 'mpCostMul');
    return mpCurse ? mpCurse.curse.value : 1.0;
  },

  isConsumableBlocked() {
    return !!KarmaSystem.state.activeCurses.find(c => c.curse.type === 'blockConsumable');
  },

  getSaveData() {
    return { currentStock: this.state.currentStock, lastStockDate: this.state.lastStockDate };
  },

  loadSaveData(data) {
    if (!data) return;
    if (data.currentStock)  this.state.currentStock  = data.currentStock;
    if (data.lastStockDate) this.state.lastStockDate = data.lastStockDate;
  }
};

// ============================================================
// SECTION 5 — UI PANELS
// ============================================================

// ---- BLOODLINE PANEL ----
const BloodlinePanel = {
  shown: false,
  _el: null,

  _build() {
    const panel = document.createElement('div');
    panel.id = 'bloodlinePanel';
    panel.style.cssText = [
      'display:none', 'position:fixed', 'inset:0',
      'background:rgba(0,0,0,0.92)', 'z-index:200',
      'flex-direction:column', 'align-items:center', 'justify-content:center',
      'font-family:Courier New,monospace'
    ].join(';');

    panel.innerHTML = `
      <div style="color:#e040fb;font-size:20px;font-weight:bold;text-align:center;
        margin-bottom:8px;text-shadow:0 0 20px rgba(224,64,251,0.8)">
        🩸 Huyết Mạch Thức Tỉnh
      </div>
      <div style="color:#888;font-size:11px;margin-bottom:20px;text-align:center">
        Chọn 1 trong 4 Huyết Mạch cổ đại. Không thể thay đổi.
      </div>
      <div id="bloodlineCards" style="display:grid;grid-template-columns:1fr 1fr;
        gap:12px;max-width:380px;width:92%;margin-bottom:20px"></div>
    `;
    document.body.appendChild(panel);
    this._el = panel;
  },

  show() {
    if (this.shown) return;
    if (!this._el) this._build();
    this.shown = true;
    GameState.running = false;

    const container = this._el.querySelector('#bloodlineCards');
    container.innerHTML = '';

    Object.values(BLOODLINE_CONFIG.bloodlines).forEach(bl => {
      const p = bl.passives;
      const passiveLines = [];
      if (p.immuneFreeze)        passiveLines.push('✦ Miễn đóng băng');
      if (p.fireSkillBonus)      passiveLines.push('✦ Hỏa skill +' + (p.fireSkillBonus * 100) + '%');
      if (p.killHealInterval)    passiveLines.push('✦ Mỗi ' + p.killHealInterval + ' kill hồi ' + (p.killHealPct * 100) + '% HP');
      if (p.reviveHpPct)         passiveLines.push('✦ Hồi sinh 1 lần/ngày với ' + (p.reviveHpPct * 100) + '% HP');
      if (p.petStatMul)          passiveLines.push('✦ Pet stat x' + p.petStatMul);
      if (p.autoSummonInCombat)  passiveLines.push('✦ Tự triệu hồi pet khi chiến đấu');
      if (p.lowHpDmgBonus)       passiveLines.push('✦ HP thấp → sát thương tăng');
      if (p.invisibleIdleTime)   passiveLines.push('✦ Đứng yên 3s → tàng hình');

      const card = document.createElement('div');
      card.style.cssText = [
        'border:2px solid ' + bl.color,
        'background:rgba(0,0,0,0.6)',
        'border-radius:10px', 'padding:14px', 'cursor:pointer',
        'transition:box-shadow 0.2s', 'text-align:center'
      ].join(';');

      card.innerHTML = `
        <div style="font-size:28px;margin-bottom:6px">${bl.icon}</div>
        <div style="color:${bl.color};font-size:13px;font-weight:bold;margin-bottom:6px">${bl.name}</div>
        <div style="color:#aaa;font-size:10px;margin-bottom:8px">${bl.desc}</div>
        <div style="text-align:left;font-size:9px;color:#ccc">
          ${passiveLines.map(l => '<div>' + l + '</div>').join('')}
        </div>
      `;

      card.addEventListener('mouseenter', () => { card.style.boxShadow = '0 0 16px ' + bl.glowColor; });
      card.addEventListener('mouseleave', () => { card.style.boxShadow = 'none'; });
      card.addEventListener('click', () => {
        BloodlineSystem.choose(bl.id);
        BloodlinePanel.hide();
      });

      container.appendChild(card);
    });

    this._el.style.display = 'flex';
  },

  hide() {
    if (!this._el) return;
    this._el.style.display = 'none';
    this.shown = false;
    GameState.running = true;
  }
};

// ---- KARMA HUD ----
function _injectKarmaHUD() {
  const hud = document.createElement('div');
  hud.id = 'karmaDisplay';
  hud.style.cssText = [
    'position:absolute', 'top:10px', 'left:310px', 'z-index:20',
    'background:rgba(0,0,0,0.7)', 'border:1px solid #888', 'border-radius:6px',
    'padding:4px 10px', 'font-size:11px', 'display:flex',
    'align-items:center', 'gap:4px', 'font-family:Courier New,monospace'
  ].join(';');
  hud.innerHTML = '<span id="karmaTierIcon">⚖️</span>' +
    '<span id="karmaTierName" style="color:#888">Trung Lập</span>';
  document.body.appendChild(hud);
}

// ---- BLACK MARKET PANEL ----
const BlackMarketPanel = {
  _el: null,

  _build() {
    const overlay = document.createElement('div');
    overlay.id = 'blackMarketOverlay';
    overlay.style.cssText = [
      'display:none', 'position:fixed', 'inset:0', 'z-index:150',
      'background:rgba(0,0,0,0.85)',
      'align-items:center', 'justify-content:center',
      'font-family:Courier New,monospace'
    ].join(';');

    overlay.innerHTML = `
      <div style="background:#111;border:2px solid #4a148c;border-radius:12px;
        max-width:380px;width:92%;max-height:85vh;overflow-y:auto;padding:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <div style="color:#e040fb;font-size:16px;font-weight:bold">🌑 Hắc Thị</div>
          <div id="bmClose" style="cursor:pointer;color:#888;font-size:16px;padding:4px 8px">✕</div>
        </div>
        <div style="color:#888;font-size:10px;margin-bottom:10px">
          Lời nguyền active: <span id="bmCurseCount">0</span>/2
        </div>
        <div id="bmItemList"></div>
        <div style="margin-top:12px;border-top:1px solid #333;padding-top:10px">
          <div style="color:#e040fb;font-size:11px;margin-bottom:6px">⚠️ Lời Nguyền Đang Active</div>
          <div id="bmActiveCurses"></div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    this._el = overlay;

    overlay.querySelector('#bmClose').addEventListener('click', () => this.close());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) this.close(); });
  },

  open() {
    if (!this._el) this._build();
    BlackMarketSystem.checkDailyStock();
    this.render();
    this._el.style.display = 'flex';
  },

  close() { if (this._el) this._el.style.display = 'none'; },

  render() {
    if (!this._el) return;

    const bmCurseCount   = this._el.querySelector('#bmCurseCount');
    const bmItemList     = this._el.querySelector('#bmItemList');
    const bmActiveCurses = this._el.querySelector('#bmActiveCurses');

    if (bmCurseCount) bmCurseCount.textContent = KarmaSystem.state.activeCurses.length;

    if (bmItemList) {
      bmItemList.innerHTML = '';
      BlackMarketSystem.state.currentStock.forEach(s => {
        const canBuy   = KarmaSystem.state.activeCurses.length < BLACK_MARKET_CONFIG.maxCurses
          && Player.gold >= s.price;
        const isPurify = !!s.isPurify;

        const card = document.createElement('div');
        card.style.cssText = [
          'border:1px solid ' + (isPurify ? '#4caf50' : '#4a148c'),
          'border-radius:8px', 'padding:10px', 'margin-bottom:8px',
          'background:rgba(0,0,0,0.4)'
        ].join(';');

        if (isPurify) {
          card.innerHTML = `
            <div style="color:#4caf50;font-size:12px;font-weight:bold">✨ ${s.item.name}</div>
            <div style="color:#aaa;font-size:10px;margin:4px 0">${s.item.desc}</div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
              <span style="color:#f0c040;font-size:11px">💰 ${s.price}</span>
              <button onclick="BlackMarketSystem.buyCursedItem('purifyCharm')"
                style="background:${Player.gold>=s.price?'#2e7d32':'#333'};
                color:#fff;border:none;border-radius:6px;padding:4px 10px;
                cursor:pointer;font-size:10px">Mua</button>
            </div>
          `;
        } else {
          card.innerHTML = `
            <div style="color:#e040fb;font-size:12px;font-weight:bold">${s.item.name}</div>
            <div style="color:#4caf50;font-size:10px;margin-top:4px">✦ ${s.item.buffDesc}</div>
            <div style="color:#f44336;font-size:10px;margin-top:2px">☠ ${s.item.curseDesc}</div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
              <span style="color:#f0c040;font-size:11px">💰 ${s.price}</span>
              <button onclick="BlackMarketSystem.buyCursedItem('${s.item.id}')"
                style="background:${canBuy?'#4a148c':'#333'};
                color:#fff;border:none;border-radius:6px;padding:4px 10px;
                cursor:pointer;font-size:10px"
                ${canBuy?'':'disabled'}>Mua</button>
            </div>
          `;
        }
        bmItemList.appendChild(card);
      });
    }

    if (bmActiveCurses) {
      bmActiveCurses.innerHTML = KarmaSystem.state.activeCurses.length === 0
        ? '<div style="color:#555;font-size:10px">Không có lời nguyền</div>'
        : KarmaSystem.state.activeCurses.map(c =>
            '<div style="color:#f44336;font-size:10px;margin-bottom:4px">• ' + c.name + ': ' + c.curse.type + '</div>'
          ).join('');
    }
  }
};

// ============================================================
// HOOK SETUP & INIT
// ============================================================

const BloodlineKarmaFeature = {

  _injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      #bloodlinePanel { display: none; }
      #karmaDisplay { pointer-events: none; }
      #blackMarketOverlay { display: none; }
    `;
    document.head.appendChild(style);
  },

  _injectItems() {
    ITEMS.purifyCharm = {
      name: 'Giải Chú Phù', type: 'consumable', rarity: 'epic',
      desc: 'Xóa 1 lời nguyền đang active.', effect: { purify: true }, sellPrice: 0
    };
    ITEMS.oanHonWard = {
      name: 'Siêu Độ Phù', type: 'consumable', rarity: 'rare',
      desc: 'Giải oan Oan Hồn, chúng sẽ biến mất.',
      effect: { wardOanHon: true }, sellPrice: 100
    };
  },

  _addBlackMerchantNPC() {
    if (!NPC.types) return;
    NPC.types.blackMerchant = {
      name: '🌑 Hắc Thị Khách',
      title: 'Hàng hóa từ bóng tối',
      sprite: 'npcShop',
      dialog: 'Ssss... ngươi đã tìm đúng nơi. Hàng hiếm, giá đặc biệt...',
      service: 'blackMarket'
    };
  },

  _wrapPlayerRecalcStats() {
    const _orig = Player.recalculateStats.bind(Player);
    Player.recalculateStats = function() {
      _orig();
      BloodlineSystem.applyToStats(Player);
      const bm = Player._blackMarketBuffs || {};
      if (bm.atkPct)      Player.atk      = Math.floor(Player.atk * (1 + bm.atkPct));
      if (bm.defPct)      Player.def      = Math.floor(Player.def * (1 + bm.defPct));
      if (bm.critRate)    Player.critRate += bm.critRate;
      if (bm.skillDmgPct) Player._bmSkillDmg = bm.skillDmgPct;
      if (bm.goldMul)     Player._bmGoldMul  = bm.goldMul;
    };
  },

  _wrapPlayerTakeDamage() {
    const _origTD = Player.takeDamage.bind(Player);
    Player.takeDamage = function(amount, source) {
      if (!this.alive || this.invincible) return;

      const actualDamage = Math.max(1, amount - this.def);
      const hpAfter = this.hp - actualDamage;

      if (hpAfter <= 0 && BloodlineSystem.checkRevive()) {
        this.alive = false;
        return;
      }

      if (BloodlineSystem.state.isInvisible) {
        BloodlineSystem.state.isInvisible = false;
        BloodlineSystem.state.idleTimer   = 0;
        for (const e of Enemies.list) delete e._shadowInvisBlock;
      }

      _origTD(amount, source);
    };
  },

  _wrapEnemiesKill() {
    const _origKill = Enemies.kill.bind(Enemies);
    Enemies.kill = function(enemy) {
      _origKill(enemy);
      BloodlineSystem.onKillEnemy(enemy);
      KarmaSystem.onKillEnemy(enemy);
      BlackMarketSystem.applyCurseOnKill(enemy);
    };
  },

  _wrapEnemiesDamage() {
    const _origDmg = Enemies.damage.bind(Enemies);
    Enemies.damage = function(enemy, amount, isCrit, color) {
      if (!enemy || !enemy.alive) return;

      let finalAmount = amount;
      if (Player._bloodlineFireActive) finalAmount = Math.floor(finalAmount * BloodlineSystem.getFireBonus());
      const dmgBonus = BloodlineSystem.getDamageBonus();
      if (dmgBonus > 0) finalAmount += Math.floor(finalAmount * dmgBonus);
      if (Player._bmSkillDmg && Player._useSkillActive) finalAmount += Math.floor(finalAmount * Player._bmSkillDmg);
      if (isCrit) BlackMarketSystem.applyCurseOnCrit();

      _origDmg(enemy, finalAmount, isCrit, color);
    };
  },

  _wrapPlayerUseSkill() {
    const _origSkill = Player.useSkill.bind(Player);
    Player.useSkill = function(idx) {
      if (!this.alive || !this.skills) return false;
      const skill = this.skills[idx];
      if (!skill || skill.cd > 0) return false;

      const mpCost = Math.ceil((skill.mp || 0) * BlackMarketSystem.getMpCostMul());
      if (this.mp < mpCost) {
        UI.addLog('⚡ Không đủ linh lực!', 'system');
        return false;
      }

      if (BloodlineSystem.state.bloodlineId === 'dragon') {
        const element = typeof ElementSystem !== 'undefined' && ElementSystem.getAttackElement
          ? ElementSystem.getAttackElement(idx) : null;
        if (element === 'fire') Player._bloodlineFireActive = true;
      }

      Player._useSkillActive = true;
      const origMp = skill.mp;
      skill.mp = mpCost;
      const result = _origSkill(idx);
      skill.mp = origMp;

      delete Player._bloodlineFireActive;
      delete Player._useSkillActive;

      return result;
    };
  },

  _wrapMapsTravelTo() {
    const _origTravel = Maps.travelTo.bind(Maps);
    Maps.travelTo = function(mapIndex) {
      const livingOanHons = KarmaSystem.state.oanHons.filter(e => e.alive);
      _origTravel(mapIndex);

      if (livingOanHons.length > 0 && KARMA_CONFIG.oanHonFollow) {
        setTimeout(() => {
          livingOanHons.forEach(oH => {
            const newE = Object.assign({}, oH);
            newE.x = Player.x + (Math.random() - 0.5) * 300;
            newE.y = Player.y + (Math.random() - 0.5) * 300;
            newE.spawnX = newE.x;
            newE.spawnY = newE.y;
            newE.alive = true;
            newE.aggroed = true;
            Enemies.list.push(newE);
            KarmaSystem.state.oanHons.push(newE);
          });
          UI.addLog('👻 Oan Hồn vẫn đang theo đuổi ngươi!', 'system');
        }, 200);
      }
    };
  },

  _wrapNPCSpawnForMap() {
    const _origSpawn = NPC.spawnForMap.bind(NPC);
    NPC.spawnForMap = function(mapIndex) {
      _origSpawn(mapIndex);
      if (!KarmaSystem.isBlackMarketAvailable() || BlackMarketSystem.state.npcSpawned) return;
      BlackMarketSystem.checkDailyStock();
      BlackMarketSystem.state.npcSpawned = true;
      const wx = CONFIG.WORLD_WIDTH  * CONFIG.TILE_SIZE;
      const wy = CONFIG.WORLD_HEIGHT * CONFIG.TILE_SIZE;
      NPC.spawn('blackMerchant', 100 + Math.random() * (wx - 200), 100 + Math.random() * (wy - 200));
    };
  },

  _wrapNPCInteract() {
    const _origInteract = NPC.interact.bind(NPC);
    NPC.interact = function(npc) {
      if (npc && npc.service === 'blackMarket') {
        NPC.closeDialog();
        BlackMarketPanel.open();
        return;
      }
      _origInteract(npc);
    };
  },

  _wrapInventoryUseItem() {
    if (!Inventory.useItem) return;
    const _origUse = Inventory.useItem.bind(Inventory);
    Inventory.useItem = function(itemId) {
      const itemData = ITEMS[itemId];
      if (!itemData) return _origUse(itemId);
      const effect = itemData.effect || {};

      if (BlackMarketSystem.isConsumableBlocked() && itemData.type === 'consumable') {
        UI.addLog('❌ Lời nguyền chặn dùng đan dược!', 'system');
        return false;
      }
      if (effect.purify) {
        Inventory.remove(itemId, 1);
        KarmaSystem.removeCurse();
        return true;
      }
      if (effect.wardOanHon) {
        Inventory.remove(itemId, 1);
        KarmaSystem.state.oanHons.forEach(e => { e.alive = false; });
        KarmaSystem.state.oanHons         = [];
        KarmaSystem.state.pendingOanHons  = [];
        UI.addLog('✨ Siêu Độ Phù: Oan Hồn đã được giải thoát.', 'system');
        return true;
      }

      return _origUse(itemId);
    };
  },

  _wrapGameUpdate() {
    const _origUpdate = Game.update.bind(Game);
    Game.update = function(dt) {
      Player._preRegenHp = Player.hp;
      _origUpdate(dt);
      BloodlineSystem.update(dt);
      KarmaSystem.update(dt);
    };
  },

  _wrapGameRender() {
    const _origRender = Game.render ? Game.render.bind(Game) : null;
    if (!_origRender) return;
    Game.render = function() {
      _origRender();
      const ctx = Game.ctx;
      const darkCurse = KarmaSystem.state.activeCurses.find(c => c.curse.type === 'darkScreen');
      if (darkCurse) {
        ctx.save();
        ctx.fillStyle   = '#000000';
        ctx.globalAlpha = darkCurse.curse.alpha;
        ctx.fillRect(0, 0, Game.canvas.width, Game.canvas.height);
        ctx.restore();
      }
    };
  },

  _wrapGameSaveLoad() {
    if (Game.save) {
      const _origSave = Game.save.bind(Game);
      Game.save = function() {
        _origSave();
        localStorage.setItem('tuxien_bloodline_karma', JSON.stringify({
          bloodline: BloodlineSystem.getSaveData(),
          karma:     KarmaSystem.getSaveData(),
          blackMarket: BlackMarketSystem.getSaveData()
        }));
      };
    }

    if (Game.load) {
      const _origLoad = Game.load.bind(Game);
      Game.load = function() {
        _origLoad();
        BloodlineKarmaFeature._tryLoadSave();
      };
    }
  },

  _tryLoadSave() {
    try {
      const raw = localStorage.getItem('tuxien_bloodline_karma');
      if (!raw) return;
      const data = JSON.parse(raw);
      BloodlineSystem.loadSaveData(data.bloodline);
      KarmaSystem.loadSaveData(data.karma);
      BlackMarketSystem.loadSaveData(data.blackMarket);
    } catch (e) {
      console.warn('🩸 Không tải được dữ liệu Bloodline/Karma:', e);
    }
  },

  _patchEnemiesUpdate() {
    const _origEUpdate = Enemies.update.bind(Enemies);
    Enemies.update = function(dt) {
      _origEUpdate(dt);
      if (!BloodlineSystem.state.isInvisible) return;
      for (const e of Enemies.list) {
        if (e.alive && e._shadowInvisBlock && e.aggroed && !e._wasAlreadyAggroed) {
          e.aggroed = false;
        }
      }
    };
  },

  init() {
    this._injectStyles();
    this._injectItems();
    this._addBlackMerchantNPC();

    _injectKarmaHUD();
    BloodlinePanel._build();
    BlackMarketPanel._build();

    this._tryLoadSave();

    this._wrapPlayerRecalcStats();
    this._wrapPlayerTakeDamage();
    this._wrapEnemiesKill();
    this._wrapEnemiesDamage();
    this._wrapPlayerUseSkill();
    this._wrapMapsTravelTo();
    this._wrapNPCSpawnForMap();
    this._wrapNPCInteract();
    this._wrapInventoryUseItem();
    this._wrapGameUpdate();
    this._wrapGameRender();
    this._wrapGameSaveLoad();
    this._patchEnemiesUpdate();

    Player.recalculateStats();

    if (Player.realm >= BLOODLINE_CONFIG.requireRealm && !BloodlineSystem.state.chosen) {
      setTimeout(() => BloodlinePanel.show(), 1000);
    }

    KarmaSystem.updateKarmaHUD();

    console.log('🩸 Bloodline + Karma + Black Market loaded');
  }
};

(function() {
  if (typeof Game !== 'undefined' && Game.init) {
    const _origGameInit = Game.init.bind(Game);
    Game.init = function() {
      _origGameInit();
      BloodlineKarmaFeature.init();
    };
  } else {
    window.addEventListener('load', () => BloodlineKarmaFeature.init());
  }
})();

// ===== CHANGES: =====
// 1. Trích xuất _tryLoadSave() từ init() để tránh duplicate block try/catch trong _wrapGameSaveLoad
// 2. Inline JSON.stringify trong Game.save — bỏ biến bkData trung gian
// 3. KarmaSystem.update: đơn giản hoá Oan Hồn spawn — dùng continue thay if lồng nhau
// 4. BloodlineSystem.update: tách isMoving ra khỏi block shadow để dùng chung với trail
// 5. _wrapNPCSpawnForMap: early return khi không đủ điều kiện, bỏ điều kiện lồng nhau
// 6. _patchEnemiesUpdate: thêm early return khi !isInvisible — tránh loop thừa
// 7. KarmaSystem.addKarma: xóa tham số reason không được dùng (signature đơn giản hơn)
// 8. BlackMarketPanel.render: đơn giản hoá activeCurses render bằng ternary
// 9. _wrapEnemiesDamage: inline các if nhỏ trên 1 dòng để dễ đọc hơn
