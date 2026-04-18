// ==================== FEATURE: BLOODLINE + KARMA + BLACK MARKET ====================
// js/feature_bloodline_karma.js
// Load sau: config.js, player.js, enemies.js, maps.js, npc.js, inventory.js, game.js, ui.js
// <script src="js/feature_bloodline_karma.js"></script>

// ============================================================
// SECTION 1 — DATA & CONFIG
// ============================================================

const BLOODLINE_CONFIG = {
  requireRealm: 3, // Nguyên Anh Kỳ

  bloodlines: {
    dragon: {
      id: 'dragon', name: 'Long Huyết', icon: '🐉', color: '#1565c0',
      glowColor: '#42a5f5',
      desc: 'Miễn đóng băng. Hỏa skill +50%. Mỗi 10 kill hồi 10% HP.',
      passives: {
        immuneFreeze: true,
        fireSkillBonus: 0.50,
        killHealInterval: 10,
        killHealPct: 0.10
      }
    },
    phoenix: {
      id: 'phoenix', name: 'Phượng Huyết', icon: '🔥', color: '#ff6f00',
      glowColor: '#ffcc02',
      desc: 'Khi chết hồi sinh với 50% HP. 1 lần/ngày.',
      passives: {
        reviveHpPct: 0.50,
        reviveCooldown: 24 * 60 * 60 * 1000
      }
    },
    beast: {
      id: 'beast', name: 'Thần Thú Huyết', icon: '🐾', color: '#2e7d32',
      glowColor: '#66bb6a',
      desc: 'Pet/Thần Thú stat x2. Tự triệu hồi khi combat.',
      passives: {
        petStatMul: 2.0,
        autoSummonInCombat: true
      }
    },
    shadow: {
      id: 'shadow', name: 'Hắc Ám Huyết', icon: '🌑', color: '#4a148c',
      glowColor: '#ce93d8',
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
    { min: 500,  max: 1000, name: 'Tiên Nhân',  color: '#f0c040', npcDiscount: 0.20, aura: 'white', blackMarket: false },
    { min: 100,  max: 499,  name: 'Hiệp Khách', color: '#4caf50', npcDiscount: 0,    aura: null,    blackMarket: false },
    { min: -99,  max: 99,   name: 'Trung Lập',  color: '#888888', npcDiscount: 0,    aura: null,    blackMarket: false },
    { min: -499, max: -100, name: 'Sát Thủ',    color: '#ff9800', npcDiscount: -0.10, aura: 'dark', blackMarket: false },
    { min: -1000,max: -500, name: 'Ma Đạo',     color: '#e040fb', npcDiscount: -0.10, aura: 'black', blackMarket: true  }
  ],

  oanHonThreshold: 10,
  oanHonDelay: 30000,
  oanHonHpMul: 3.0,
  oanHonFollow: true,

  // [FIX] Tỉ lệ drop exp/gold của oan hồn so với quái thường (x0.2)
  oanHonExpMul: 0.2,
  oanHonGoldMul: 0.2,

  endings: {
    rightPath: { karma: 800,  title: 'Tiên Nhân Chính Đạo', lore: 'Đạo hữu đã chọn con đường chính đạo...' },
    darkPath:  { karma: -800, title: 'Ma Đạo Thành Tôn',    lore: 'Ngươi đã trở thành Ma Tôn vĩ đại nhất...' }
  }
};

const BLACK_MARKET_CONFIG = {
  maxCurses: 2,
  requireKarmaTier: 'Ma Đạo',

  cursedItems: [
    {
      id: 'bloodSword',    name: 'Huyết Ma Kiếm',     price: 800,
      itemBase: 'flameSword',
      buffDesc: 'ATK +25%', curseDesc: 'Mỗi kill mất 5 HP',
      buff: { atkPct: 0.25 }, curse: { type: 'onKill', hpLoss: 5 }
    },
    {
      id: 'demonArmor',   name: 'Ma Giáp Huyết Ngục', price: 700,
      itemBase: 'dragonArmor',
      buffDesc: 'DEF +30%', curseDesc: 'Không thể hồi HP tự nhiên',
      buff: { defPct: 0.30 }, curse: { type: 'blockRegen' }
    },
    {
      id: 'forbiddenPill', name: 'Linh Đan Cấm',       price: 400,
      itemBase: 'expPotion',
      buffDesc: '+500 EXP ngay lập tức', curseDesc: 'MaxHP -50 vĩnh viễn',
      buff: { instantExp: 500 }, curse: { type: 'maxHpReduce', value: 50, permanent: true }
    },
    {
      id: 'darkArts',     name: 'Ám Thuật Quyển',      price: 600,
      itemBase: 'realmPill',
      buffDesc: 'Skill damage +40%', curseDesc: 'MP cost x2',
      buff: { skillDmgPct: 0.40 }, curse: { type: 'mpCostMul', value: 2.0 }
    },
    {
      id: 'greedRing',    name: 'Tham Lam Chi Giới',   price: 500,
      itemBase: 'dragonAmulet',
      buffDesc: 'Gold drop x2', curseDesc: 'Không thể dùng đan dược',
      buff: { goldMul: 2.0 }, curse: { type: 'blockConsumable' }
    },
    {
      id: 'bloodCritRing', name: 'Huyết Khế',          price: 650,
      itemBase: 'celestialJade',
      buffDesc: 'Crit rate +15%', curseDesc: 'Mỗi crit mất 3% maxHP',
      buff: { critRate: 0.15 }, curse: { type: 'onCrit', hpLossPct: 0.03 }
    },
    {
      id: 'cursedVision',  name: 'Hắc Thị',            price: 450,
      itemBase: 'spiritPendant',
      buffDesc: 'Phát hiện quái x2 tầm', curseDesc: 'Camera darker 25%',
      buff: { aggroDetect: 2.0 }, curse: { type: 'darkScreen', alpha: 0.25 }
    }
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

    // Shadow — low HP damage bonus
    if (passives.lowHpDmgBonus) {
      const hpPct = player.hp / player.maxHp;
      let bonus = 0;
      for (const t of passives.lowHpDmgBonus.thresholds) {
        if (hpPct <= t.hp) bonus = t.bonus;
      }
      player._bloodlineDmgBonus = bonus;
    }

    // Beast — pet stat mul (hook via PetLevelSystem)
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
          // Only prevent NEW aggro — enemies currently chasing still continue
          for (const e of Enemies.list) {
            if (e.alive && !e.aggroed) {
              e._shadowInvisBlock = true;
            }
          }
          UI.addLog('🌑 Tàng hình trong bóng tối...', 'system');
        }
      } else {
        this.state.idleTimer = 0;
        if (this.state.isInvisible) {
          this.state.isInvisible = false;
          for (const e of Enemies.list) {
            delete e._shadowInvisBlock;
          }
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
      const inCombat = !!nearEnemy;

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
    const cx = Player.x - GameState.camera.x;
    const cy = Player.y - 10 - GameState.camera.y;

    switch (this.state.bloodlineId) {
      case 'dragon': {
        const dPulse = 0.3 + Math.sin(GameState.time / 200) * 0.15;
        ctx.globalAlpha = dPulse * 0.4;
        ctx.strokeStyle = '#1565c0';
        ctx.lineWidth = 2;
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
          ctx.fillStyle = '#4a148c';
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

    // Dragon — kill heal
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
    const bl = this.getBloodline();
    return 1 + bl.passives.fireSkillBonus; // 1.5
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
    this.state.chosen = data.chosen || false;
    this.state.bloodlineId = data.bloodlineId || null;
    this.state.pending = data.pending !== undefined ? data.pending : true;
    this.state.reviveLastUsed = data.reviveLastUsed || 0;
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

  getScore() {
    return this.state.score;
  },

  getTier() {
    const s = this.state.score;
    return KARMA_CONFIG.tiers.find(t => s >= t.min && s <= t.max) || KARMA_CONFIG.tiers[2];
  },

  addKarma(amount, reason) {
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

    // Oan Hồn trigger
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
    // [FIX] Chỉ giữ log nhỏ trong combat log, bỏ showNotification popup to
    UI.addLog('👻 Oan Hồn đang đến tìm ngươi trả thù...', 'system');
  },

  update(dt) {
    const now = GameState.time;

    // Spawn pending Oan Hồn
    for (let i = this.state.pendingOanHons.length - 1; i >= 0; i--) {
      const p = this.state.pendingOanHons[i];
      if (now >= p.spawnAt) {
        const baseType = Enemies.types[p.type];
        const levelMul = KARMA_CONFIG.oanHonHpMul;

        // [FIX] Tính exp/gold với tỉ lệ x0.2 so với quái thường
        const rawExp  = baseType ? Math.floor(baseType.exp  * (1 + Maps.currentIndex * 0.6)) : 5;
        const rawGold = baseType ? Math.floor(baseType.gold * (1 + Maps.currentIndex * 0.6)) : 2;
        const oanHonExp  = Math.max(1, Math.floor(rawExp  * KARMA_CONFIG.oanHonExpMul));
        const oanHonGold = Math.max(0, Math.floor(rawGold * KARMA_CONFIG.oanHonGoldMul));

        const e = Enemies.spawn(p.type, levelMul, p.level);
        if (e) {
          e.name = '【Oan Hồn】' + e.name;
          e.color = '#7c4dff';
          e._isOanHon = true;
          e.drops = [];
          // [FIX] Gắn exp/gold đã tính (x0.2)
          e.exp  = oanHonExp;
          e.gold = oanHonGold;
          e.aggroed = true;
          const angle = Math.random() * Math.PI * 2;
          e.x = Player.x + Math.cos(angle) * 200;
          e.y = Player.y + Math.sin(angle) * 200;
          e.spawnX = e.x;
          e.spawnY = e.y;
          this.state.oanHons.push(e);
        }
        this.state.pendingOanHons.splice(i, 1);
      }
    }

    // Clean up dead Oan Hồn
    this.state.oanHons = this.state.oanHons.filter(e => e.alive);

    // Apply permanent curses
    if (this.state.permanentCurses.maxHpReduce) {
      Player.maxHp = Math.max(1, Player.maxHp - this.state.permanentCurses.maxHpReduce);
      Player.hp = Math.min(Player.hp, Player.maxHp);
    }

    // Block natural regen if curse active
    const blockRegen = this.state.activeCurses.find(c => c.curse.type === 'blockRegen');
    if (blockRegen) {
      if (Player._preRegenHp !== undefined && Player._preRegenHp < Player.hp) {
        Player.hp = Player._preRegenHp;
      }
    }

    // Aggro detection bonus (shadow vision curse)
    if (BloodlineSystem.state.isInvisible) {
      for (const e of Enemies.list) {
        if (e.alive && e._shadowInvisBlock && e.aggroed) {
          e.aggroed = false;
        }
      }
    }

    // Check karma ending
    if (Player.realm >= 8) {
      this.checkEnding();
    }

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

  isBlackMarketAvailable() {
    return this.getTier().blackMarket;
  },

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
    const tierNameEl = document.getElementById('karmaTierName');
    const karmaDisplayEl = document.getElementById('karmaDisplay');
    if (!tierNameEl || !karmaDisplayEl) return;
    const tier = this.getTier();
    tierNameEl.textContent = tier.name;
    tierNameEl.style.color = tier.color;
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
    this.state.score = data.score || 0;
    this.state.killCounts = data.killCounts || {};
    this.state.activeCurses = data.activeCurses || [];
    this.state.permanentCurses = data.permanentCurses || {};
    this.state.merchantVisits = data.merchantVisits || 0;
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
    const today = new Date().toDateString();
    if (this.state.lastStockDate !== today) {
      this.generateStock();
    }
  },

  buyCursedItem(itemId) {
    const stockItem = this.state.currentStock.find(s => s.item.id === itemId);
    if (!stockItem) return false;

    // Handle purify charm separately
    if (stockItem.isPurify) {
      if (Player.gold < stockItem.price) {
        UI.addLog('❌ Không đủ vàng!', 'system');
        return false;
      }
      Player.gold -= stockItem.price;
      Inventory.add('purifyCharm', 1);
      UI.addLog('✨ Mua Giải Chú Phù thành công!', 'item');
      UI.updateGold();
      return true;
    }

    // Check curse limit
    const activeCurseCount = KarmaSystem.state.activeCurses.length;
    if (activeCurseCount >= BLACK_MARKET_CONFIG.maxCurses) {
      UI.addLog('❌ Đã đạt giới hạn ' + BLACK_MARKET_CONFIG.maxCurses + ' lời nguyền!', 'system');
      return false;
    }

    if (Player.gold < stockItem.price) {
      UI.addLog('❌ Không đủ vàng!', 'system');
      return false;
    }

    Player.gold -= stockItem.price;
    UI.updateGold();

    const cursedItem = stockItem.item;

    // Apply buff
    if (cursedItem.buff.atkPct) Player.baseAtk = Math.floor(Player.baseAtk * (1 + cursedItem.buff.atkPct));
    if (cursedItem.buff.defPct) Player.baseDef = Math.floor(Player.baseDef * (1 + cursedItem.buff.defPct));
    if (cursedItem.buff.instantExp) Player.gainExp(cursedItem.buff.instantExp);
    if (cursedItem.buff.critRate) Player.equipCritRate += cursedItem.buff.critRate;
    if (cursedItem.buff.permHp) { Player.equipHp += cursedItem.buff.permHp; }
    if (cursedItem.buff.permMp) { Player.equipMp += cursedItem.buff.permMp; }

    Player.recalculateStats();

    // Register curse
    KarmaSystem.state.activeCurses.push({
      id: cursedItem.id,
      name: cursedItem.name,
      curse: cursedItem.curse
    });

    // Apply permanent curses immediately
    if (cursedItem.curse.type === 'maxHpReduce' && cursedItem.curse.permanent) {
      KarmaSystem.state.permanentCurses.maxHpReduce =
        (KarmaSystem.state.permanentCurses.maxHpReduce || 0) + cursedItem.curse.value;
    }

    KarmaSystem.addKarma(KARMA_CONFIG.events.useBlackMarket);
    UI.addLog('🔮 Đã mua ' + cursedItem.name + '! [' + cursedItem.buffDesc + '] nhưng [' + cursedItem.curseDesc + ']', 'item');

    return true;
  }
};

// ============================================================
// SECTION 5 — UI PANELS (BloodlinePanel, KarmaPanel, BlackMarketPanel)
// ============================================================

const BloodlinePanel = {
  shown: false,

  show() {
    this.shown = true;
    const overlay = document.getElementById('bloodlineOverlay');
    if (overlay) overlay.style.display = 'flex';
    GameState.running = false;
  },

  close() {
    const overlay = document.getElementById('bloodlineOverlay');
    if (overlay) overlay.style.display = 'none';
    GameState.running = true;
  },

  choose(bloodlineId) {
    BloodlineSystem.choose(bloodlineId);
    this.close();
  }
};

// ============================================================
// SECTION 6 — FEATURE INIT
// ============================================================

const BloodlineKarmaFeature = {
  injectHTML() {
    const html = `
    <!-- Bloodline Selection Overlay -->
    <div id="bloodlineOverlay" style="
      display:none; position:fixed; inset:0;
      background:rgba(0,0,0,0.85); z-index:200;
      justify-content:center; align-items:center;
      padding:16px; box-sizing:border-box;
    ">
      <div style="
        background:linear-gradient(135deg,#0d0d1a,#1a1a2e);
        border:2px solid #9c27b0; border-radius:14px;
        padding:20px; width:100%; max-width:400px;
        max-height:85vh; overflow-y:auto;
        font-family:'Courier New',monospace; color:#fff;
        box-sizing:border-box;
      ">
        <div style="text-align:center;margin-bottom:16px">
          <div style="font-size:18px;font-weight:bold;color:#e040fb">🩸 Huyết Mạch Thức Tỉnh</div>
          <div style="font-size:10px;color:#888;margin-top:4px">Chọn huyết thống — không thể thay đổi sau này</div>
        </div>
        <div id="bloodlineList"></div>
      </div>
    </div>

    <!-- Karma HUD Display (small inline badge) -->
    <div id="karmaDisplay" style="
      display:none; position:absolute;
      top:4px; right:60px;
      background:rgba(0,0,0,0.7); border:1px solid #888;
      border-radius:6px; padding:2px 8px;
      font-family:'Courier New',monospace; font-size:9px;
      color:#fff; z-index:20; pointer-events:none;
    ">
      <span>⚖️ </span><span id="karmaTierName">Trung Lập</span>
    </div>
    `;

    const div = document.createElement('div');
    div.innerHTML = html;
    while (div.firstChild) document.body.appendChild(div.firstChild);

    // Render bloodline options
    this.renderBloodlineList();
  },

  renderBloodlineList() {
    const list = document.getElementById('bloodlineList');
    if (!list) return;
    list.innerHTML = '';

    for (const [id, bl] of Object.entries(BLOODLINE_CONFIG.bloodlines)) {
      const card = document.createElement('div');
      card.style.cssText = `
        border:2px solid ${bl.color}; border-radius:10px; padding:14px;
        margin-bottom:10px; background:rgba(0,0,0,0.4); cursor:pointer;
        transition:background 0.2s;
      `;
      card.innerHTML = `
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
          <span style="font-size:22px">${bl.icon}</span>
          <div>
            <div style="color:${bl.color};font-weight:bold;font-size:13px">${bl.name}</div>
          </div>
        </div>
        <div style="color:#aaa;font-size:10px;line-height:1.5">${bl.desc}</div>
        <button style="
          margin-top:10px; width:100%; padding:8px;
          border:2px solid ${bl.color}; background:rgba(0,0,0,0.5);
          border-radius:7px; color:${bl.color}; font-size:11px;
          font-weight:bold; cursor:pointer; font-family:inherit;
        " onclick="BloodlinePanel.choose('${id}')">🩸 Chọn ${bl.name}</button>
      `;
      list.appendChild(card);
    }
  },

  patchGame() {
    const _origUpdate = Game.update.bind(Game);
    Game.update = function(dt) {
      _origUpdate(dt);
      BloodlineSystem.update(dt);
      KarmaSystem.update(dt);
      BlackMarketSystem.checkDailyStock();
    };

    // Patch Enemies.kill to hook karma + bloodline
    const _origKill = Enemies.kill.bind(Enemies);
    Enemies.kill = function(enemy) {
      _origKill(enemy);
      KarmaSystem.onKillEnemy(enemy);
      BloodlineSystem.onKillEnemy(enemy);
    };

    // Show karma display after game init
    const _origInit = Game.init.bind(Game);
    Game.init = function() {
      _origInit();
      const karmaEl = document.getElementById('karmaDisplay');
      if (karmaEl) karmaEl.style.display = 'block';
      KarmaSystem.updateKarmaHUD();
    };
  },

  init() {
    this.injectHTML();
    this.patchGame();
    console.log('🩸 Bloodline + Karma + BlackMarket loaded');
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => BloodlineKarmaFeature.init());
} else {
  BloodlineKarmaFeature.init();
}
