// ==================== REPUTATION & TOURNAMENT SYSTEM ====================
// feature_reputation.js — Tu Tiên Kiếm Hiệp
// Load sau: game.js, npc.js, player.js, enemies.js, inventory.js, ui.js
// <script src="js/feature_reputation.js"></script>
// ========================================================================

// ============================================================
// SECTION 1 — DATA & CONFIG
// ============================================================

const REPUTATION_CONFIG = {
  storageKey: 'tuxien_reputation',

  factions: {
    kiemTong: {
      id: 'kiemTong', name: 'Thanh Vân Kiếm Tông', icon: '⚔️', color: '#ef5350',
      desc: 'Kiếm tu chính phái. Tăng ATK và crit.',
      buffs: {
        2: { atkPct: 0.05, desc: '+5% ATK' },
        3: { atkPct: 0.10, critRateBonus: 0.03, desc: '+10% ATK, +3% crit' },
        4: { atkPct: 0.18, critRateBonus: 0.06, desc: '+18% ATK, +6% crit' },
        5: { atkPct: 0.25, critRateBonus: 0.10, critDmgBonus: 0.20, desc: '+25% ATK, +10% crit' },
        6: { atkPct: 0.35, critRateBonus: 0.15, critDmgBonus: 0.40, skillDmgPct: 0.20,
             desc: 'Tông Chủ tặng kỹ pháp: +35% ATK, +20% skill dmg' }
      },
      enemies: ['maTong'],
      repGain: { killEnemy: 2, pvpWin: 10, bossKill: 5 },
      shopItems: {
        2: ['steelSword'], 3: ['silverSword'], 4: ['flameSword'],
        5: ['celestialSword'], 6: ['kiemTongExclusive']
      }
    },
    longToc: {
      id: 'longToc', name: 'Long Tộc Liên Minh', icon: '🐉', color: '#f0c040',
      desc: 'Cổ long bảo hộ. Tăng DEF và HP.',
      buffs: {
        2: { defPct: 0.05, desc: '+5% DEF' },
        3: { defPct: 0.10, maxHpPct: 0.10, desc: '+10% DEF, +10% HP' },
        4: { defPct: 0.18, maxHpPct: 0.20, desc: '+18% DEF, +20% HP' },
        5: { defPct: 0.25, maxHpPct: 0.30, hpRegen: true, desc: 'Dragon Shield passive' },
        6: { defPct: 0.35, maxHpPct: 0.45, fireImmune: true,
             desc: 'Long Huyết cộng hưởng: immune fire' }
      },
      enemies: ['maTong'],
      repGain: { npcHelp: 10, dontLetNpcDie: 5, dungeonClear: 8 },
      shopItems: {
        2: ['ironArmor'], 3: ['spiritRobe'], 4: ['dragonArmor'],
        5: ['celestialRobe'], 6: ['longTocExclusive']
      }
    },
    thuongHoi: {
      id: 'thuongHoi', name: 'Vạn Bảo Thương Hội', icon: '💰', color: '#ff9800',
      desc: 'Thương nhân giang hồ. Giảm giá và tăng loot.',
      buffs: {
        2: { shopDiscount: 0.05, desc: 'Giảm giá 5%' },
        3: { shopDiscount: 0.10, goldDropBonus: 0.15, desc: 'Giảm 10%, Gold +15%' },
        4: { shopDiscount: 0.15, goldDropBonus: 0.25, dropRateBonus: 0.10, desc: 'Giảm 15%...' },
        5: { shopDiscount: 0.20, goldDropBonus: 0.40, dropRateBonus: 0.20, desc: 'Thương Chủ ủy thác' },
        6: { shopDiscount: 0.30, goldDropBonus: 0.50, dropRateBonus: 0.30, exclusiveShop: true,
             desc: 'Kho bí mật mở cửa' }
      },
      enemies: ['maTong'],
      repGain: { buyFromShop: 1, sellItem: 1, tradeVolume: 3 },
      shopItems: {
        2: ['hpPotionMedium', 'mpPotionMedium'], 3: ['realmPill', 'expPotion'],
        4: ['dragonScale', 'celestialOrb'], 5: ['dragonAmulet'],
        6: ['thuongHoiExclusive']
      }
    },
    daoMon: {
      id: 'daoMon', name: 'Huyền Thiên Đạo Môn', icon: '☯️', color: '#42a5f5',
      desc: 'Tu đạo thanh tịnh. Tăng realm exp và MP.',
      buffs: {
        2: { realmExpBonus: 0.10, desc: '+10% Tu Vi' },
        3: { realmExpBonus: 0.20, maxMpPct: 0.15, desc: '+20% Tu Vi, +15% MP' },
        4: { realmExpBonus: 0.30, maxMpPct: 0.25, mpCostReduction: 0.10,
             desc: '+30% Tu Vi, skill MP -10%' },
        5: { realmExpBonus: 0.45, maxMpPct: 0.40, mpCostReduction: 0.20,
             desc: 'Đạo Tâm bonus cộng hưởng' },
        6: { realmExpBonus: 0.60, maxMpPct: 0.50, mpCostReduction: 0.30, skillCdReduction: 0.10,
             desc: 'Thiên Đạo Ý Chí: kỳ tích tu luyện' }
      },
      enemies: ['maTong'],
      repGain: { cultivate: 1, realmBreakthrough: 50, offlineTime: 2 },
      shopItems: {
        2: ['mpPotion', 'realmPill'], 3: ['expPotion', 'realmPill'],
        4: ['celestialOrb'], 6: ['daoMonExclusive']
      }
    },
    maTong: {
      id: 'maTong', name: 'Ám Dạ Ma Tông', icon: '👻', color: '#9c27b0',
      desc: 'Ma đạo ẩn tông. Lifesteal và burst damage.',
      buffs: {
        2: { dmgPct: 0.08, desc: '+8% damage' },
        3: { dmgPct: 0.15, lifeStealPct: 0.05, desc: '+15% dmg, 5% lifesteal' },
        4: { dmgPct: 0.22, lifeStealPct: 0.10, poisonOnHit: true, desc: '+22% dmg, poison' },
        5: { dmgPct: 0.30, lifeStealPct: 0.15, poisonOnHit: true, shadowStep: true,
             desc: 'Ám Ảnh: blink behind target' },
        6: { dmgPct: 0.40, lifeStealPct: 0.20, poisonOnHit: true, shadowStep: true,
             maTongUltimate: true, desc: 'Ma Đạo Tôn: tuyệt kỹ sát thần' }
      },
      enemies: ['kiemTong', 'longToc', 'daoMon'],
      repGain: { killEnemy: 1, useBlackMarket: 20, nightKill: 3 },
      shopItems: {
        3: ['steelSword', 'ironArmor'], 4: ['flameSword', 'dragonAmulet'],
        6: ['maTongExclusive']
      }
    }
  },

  // 6 tiers
  tiers: [
    { tier: 1, name: 'Xa Lạ',      minRep: 0,    color: '#666' },
    { tier: 2, name: 'Quen Biết',   minRep: 100,  color: '#9e9e9e' },
    { tier: 3, name: 'Tin Tưởng',   minRep: 300,  color: '#4caf50' },
    { tier: 4, name: 'Thân Thiết',  minRep: 700,  color: '#2196f3' },
    { tier: 5, name: 'Trung Thành', minRep: 1500, color: '#f0c040' },
    { tier: 6, name: 'Truyền Kỳ',   minRep: 3000, color: '#e040fb' }
  ],

  // Conflict: tăng rep faction này → giảm rep faction thù địch
  conflictPenalty: 0.30  // 30% of gained rep subtracted from enemy factions
};

// ────────────────────────────────────────────────────────────────────────────

const TOURNAMENT_CONFIG = {
  schedules: [
    { id: 'kiemHoi',  name: 'Thần Kiếm Hội',   interval: 3,  rewardTier: 1 },
    { id: 'tongMon',  name: 'Tông Môn Chiến',   interval: 7,  rewardTier: 2 },
    { id: 'thienHa',  name: 'Thiên Hạ Đệ Nhất', interval: 30, rewardTier: 3 }
  ],

  bracketSize: 8,
  matchDuration: 60000,

  opponentNames: [
    ['Lý Phong', 'Kiếm Thánh Minh', 'Vô Danh Kiếm Khách', 'Hắc Kiếm Nguyệt'],
    ['Trần Vân', 'Băng Kiếm Pháp Sư', 'Long Vũ Kiếm Tiên', 'Huyết Kiếm Ma Tôn'],
    ['Thiên Sát', 'Địa Diệt Đại Đế', 'Vũ Trụ Kiếm Thần', 'Vô Cực Tiên Tôn']
  ],

  titles: {
    kiemHoi: { 1: 'Kiếm Thánh',          2: 'Kiếm Quái',           3: 'Kiếm Hiệp' },
    tongMon:  { 1: 'Tông Chủ',            2: 'Phó Tông',            3: 'Trưởng Lão' },
    thienHa:  { 1: 'Thiên Hạ Đệ Nhất',   2: 'Vô Song Kiếm Khách',  3: 'Kiếm Thần' }
  },

  rewards: {
    1: { gold: 500,  item: 'spiritStone', count: 5,  title: true },
    2: { gold: 1500, item: 'dragonScale', count: 3,  title: true, cosmetic: true },
    3: { gold: 5000, item: 'celestialOrb',count: 5,  title: true, cosmetic: true, exclusive: true }
  },

  noticeLeadTime: 24 * 60 * 60 * 1000,
  storageKey: 'tuxien_tournament'
};

// ============================================================
// SECTION 2 — REPUTATION SYSTEM
// ============================================================

const ReputationSystem = {

  state: {
    reps: {
      kiemTong: 0, longToc: 0, thuongHoi: 0, daoMon: 0, maTong: 0
    },
    mainFaction: null,
    activeBuffs: {},
    purchasedItems: {}
  },

  // ─── Faction Quest State ─────────────────────────────────────
  _factionQuests: {
    kiemTong: { active: false, kills: 0, needed: 10, reward: { rep: 50, gold: 200, item: 'spiritStone', count: 2 } },
    longToc:   { active: false, kills: 0, needed: 5,  reward: { rep: 60, gold: 150, item: 'dragonScale', count: 1 } },
    thuongHoi: { active: false, buys:  0, needed: 5,  reward: { rep: 40, gold: 300, item: 'expPotion',   count: 2 } },
    daoMon:    { active: false, cultivateTime: 0, needed: 60000, reward: { rep: 80, gold: 100, item: 'realmPill', count: 3 } },
    maTong:    { active: false, nightKills: 0, needed: 5, reward: { rep: 70, gold: 250, item: 'demonCore', count: 3 } }
  },

  // ─── Get Tier ────────────────────────────────────────────────
  getTier(factionId) {
    const rep = this.state.reps[factionId] || 0;
    const tiers = REPUTATION_CONFIG.tiers;
    for (let i = tiers.length - 1; i >= 0; i--) {
      if (rep >= tiers[i].minRep) return tiers[i];
    }
    return tiers[0];
  },

  // ─── Add Rep ─────────────────────────────────────────────────
  addRep(factionId, amount) {
    if (!REPUTATION_CONFIG.factions[factionId]) return;
    this.state.reps[factionId] = (this.state.reps[factionId] || 0) + amount;

    // Cap max at 5000
    this.state.reps[factionId] = Math.min(5000, this.state.reps[factionId]);

    // Conflict penalty: reduce enemy faction reps
    const faction = REPUTATION_CONFIG.factions[factionId];
    (faction.enemies || []).forEach(enemyId => {
      const penalty = Math.floor(amount * REPUTATION_CONFIG.conflictPenalty);
      this.state.reps[enemyId] = Math.max(0, (this.state.reps[enemyId] || 0) - penalty);
    });

    this._updateBuffs();
    this.saveData();

    // Notify tier change
    const tier = this.getTier(factionId);
    const f = REPUTATION_CONFIG.factions[factionId];
    if (tier.tier >= 2) {
      const key = factionId + '_notified_' + tier.tier;
      if (!this._notifiedTiers) this._notifiedTiers = {};
      if (!this._notifiedTiers[key]) {
        this._notifiedTiers[key] = true;
        if (typeof UI !== 'undefined') {
          UI.showNotification(f.icon + ' Danh Vọng Tăng!', f.name + ' — ' + tier.name);
          UI.addLog(f.icon + ' [' + f.name + '] đạt cấp ' + tier.name + '!', 'realm');
        }
      }
    }
  },

  // ─── Update Buffs ────────────────────────────────────────────
  _updateBuffs() {
    for (const factionId in this.state.reps) {
      const tier = this.getTier(factionId);
      this.state.activeBuffs[factionId] = tier.tier;
    }
    if (typeof Player !== 'undefined') {
      Player.recalculateStats();
    }
  },

  // ─── Set Main Faction ────────────────────────────────────────
  setMainFaction(factionId) {
    if (this.state.mainFaction) {
      if (typeof UI !== 'undefined') {
        UI.addLog('Đã chọn chính phái ' + REPUTATION_CONFIG.factions[this.state.mainFaction].name, 'system');
      }
      return false;
    }
    this.state.mainFaction = factionId;
    this.saveData();
    if (typeof UI !== 'undefined') {
      UI.showNotification('🏛️ Gia Nhập!', REPUTATION_CONFIG.factions[factionId].name);
      UI.addLog('🏛️ Đã gia nhập ' + REPUTATION_CONFIG.factions[factionId].name + '!', 'realm');
    }
    return true;
  },

  // ─── Apply to Stats ──────────────────────────────────────────
  applyToStats(player) {
    // Reset all rep bonuses first
    player._repRealmExpBonus = 0;
    player._repShopDiscount  = 0;
    player._repGoldBonus     = 0;
    player._repDropBonus     = 0;
    player._repMpCostRed     = 0;
    player._repSkillDmg      = 0;
    player._repDmgBonus      = 0;
    player._repLifesteal     = 0;

    for (const [factionId, buffTier] of Object.entries(this.state.activeBuffs)) {
      if (buffTier < 2) continue;
      const faction = REPUTATION_CONFIG.factions[factionId];
      const buff = faction.buffs[buffTier];
      if (!buff) continue;

      if (buff.atkPct)          player.atk      = Math.floor(player.atk * (1 + buff.atkPct));
      if (buff.critRateBonus)   player.critRate += buff.critRateBonus;
      if (buff.critDmgBonus)    player.critDmg  += buff.critDmgBonus;
      if (buff.defPct)          player.def      = Math.floor(player.def * (1 + buff.defPct));
      if (buff.maxHpPct)        player.maxHp    = Math.floor(player.maxHp * (1 + buff.maxHpPct));
      if (buff.maxMpPct)        player.maxMp    = Math.floor(player.maxMp * (1 + buff.maxMpPct));
      if (buff.realmExpBonus)   player._repRealmExpBonus = (player._repRealmExpBonus || 0) + buff.realmExpBonus;
      if (buff.shopDiscount)    player._repShopDiscount  = Math.max(player._repShopDiscount || 0, buff.shopDiscount);
      if (buff.goldDropBonus)   player._repGoldBonus     = (player._repGoldBonus || 0) + buff.goldDropBonus;
      if (buff.dropRateBonus)   player._repDropBonus     = (player._repDropBonus || 0) + buff.dropRateBonus;
      if (buff.mpCostReduction) player._repMpCostRed     = (player._repMpCostRed || 0) + buff.mpCostReduction;
      if (buff.skillDmgPct)     player._repSkillDmg      = (player._repSkillDmg || 0) + buff.skillDmgPct;
      if (buff.dmgPct)          player._repDmgBonus      = (player._repDmgBonus || 0) + buff.dmgPct;
      if (buff.lifeStealPct)    player._repLifesteal     = buff.lifeStealPct;
    }
  },

  // ─── Faction Quest: Accept ───────────────────────────────────
  acceptFactionQuest(factionId) {
    const q = this._factionQuests[factionId];
    if (!q || q.active) return false;
    q.active = true;
    // Reset progress
    q.kills = 0; q.buys = 0; q.nightKills = 0; q.cultivateTime = 0;
    if (typeof UI !== 'undefined') {
      const f = REPUTATION_CONFIG.factions[factionId];
      UI.addLog(f.icon + ' Nhận nhiệm vụ từ ' + f.name + '!', 'realm');
    }
    return true;
  },

  // ─── Faction Quest: Check Complete ───────────────────────────
  isFactionQuestComplete(factionId) {
    const q = this._factionQuests[factionId];
    if (!q || !q.active) return false;
    switch (factionId) {
      case 'kiemTong':  return q.kills       >= q.needed;
      case 'longToc':   return q.kills       >= q.needed;
      case 'thuongHoi': return q.buys        >= q.needed;
      case 'daoMon':    return q.cultivateTime >= q.needed;
      case 'maTong':    return q.nightKills  >= q.needed;
    }
    return false;
  },

  // ─── Faction Quest: Claim ────────────────────────────────────
  claimFactionQuest(factionId) {
    if (!this.isFactionQuestComplete(factionId)) return false;
    const q = this._factionQuests[factionId];
    const f = REPUTATION_CONFIG.factions[factionId];
    q.active = false;

    // Give rewards
    this.addRep(factionId, q.reward.rep);
    if (typeof Player !== 'undefined') Player.gold += q.reward.gold;
    if (typeof Inventory !== 'undefined') Inventory.add(q.reward.item, q.reward.count);
    if (typeof UI !== 'undefined') {
      UI.showNotification(f.icon + ' Nhiệm Vụ Hoàn Thành!', '+' + q.reward.rep + ' Danh Vọng');
      UI.addLog(f.icon + ' [' + f.name + '] +' + q.reward.rep + ' danh vọng, +' + q.reward.gold + ' vàng!', 'realm');
      UI.updateGold();
    }
    this.saveData();
    return true;
  },

  // ─── Faction Shop ────────────────────────────────────────────
  buildFactionShop(container, factionId) {
    const f = REPUTATION_CONFIG.factions[factionId];
    const tier = this.getTier(factionId);

    const title = document.createElement('div');
    title.style.cssText = 'color:' + f.color + ';font-size:11px;margin-bottom:10px;font-weight:bold;text-align:center';
    title.textContent = f.icon + ' Cửa Hàng ' + f.name;
    container.appendChild(title);

    if (tier.tier < 2) {
      const notice = document.createElement('div');
      notice.style.cssText = 'color:#666;font-size:10px;text-align:center;padding:15px';
      notice.textContent = '⚠️ Cần đạt cấp Quen Biết để mở cửa hàng!';
      container.appendChild(notice);
      return;
    }

    let hasItems = false;
    for (let t = 2; t <= tier.tier; t++) {
      const shopItemIds = f.shopItems[t];
      if (!shopItemIds) continue;
      shopItemIds.forEach(itemId => {
        const itemData = (typeof ITEMS !== 'undefined') ? ITEMS[itemId] : null;
        if (!itemData) return;
        hasItems = true;

        const discount = (typeof Player !== 'undefined') ? (Player._repShopDiscount || 0) : 0;
        const basePrice = itemData.sellPrice ? Math.floor(itemData.sellPrice * 2.5) : 100;
        const finalPrice = Math.floor(basePrice * (1 - discount));
        const canBuy = (typeof Player !== 'undefined') && Player.gold >= finalPrice;

        const opt = document.createElement('div');
        opt.className = 'npc-option';
        if (!canBuy) opt.classList.add('disabled');
        opt.innerHTML =
          '<span>' + itemData.name + '</span>' +
          '<span>' + finalPrice + ' 💰' + (discount > 0 ? ' <small style="color:#4caf50">(-' + Math.round(discount*100) + '%)</small>' : '') + '</span>';

        if (canBuy) {
          opt.addEventListener('click', () => {
            if (typeof NPC !== 'undefined') {
              NPC.buyItem(itemId, finalPrice);
            } else {
              Player.gold -= finalPrice;
              Inventory.add(itemId, 1);
              UI.updateGold();
            }
          });
        }
        container.appendChild(opt);
      });
    }

    if (!hasItems) {
      const notice = document.createElement('div');
      notice.style.cssText = 'color:#666;font-size:10px;text-align:center;padding:15px';
      notice.textContent = '🔒 Tăng danh vọng để mở thêm vật phẩm!';
      container.appendChild(notice);
    }
  },

  // ─── Save / Load ─────────────────────────────────────────────
  saveData() {
    try {
      localStorage.setItem(REPUTATION_CONFIG.storageKey, JSON.stringify({
        reps: this.state.reps,
        mainFaction: this.state.mainFaction,
        purchasedItems: this.state.purchasedItems,
        factionQuests: this._factionQuests
      }));
    } catch (e) {
      console.error('[ReputationSystem] Save error:', e);
    }
  },

  loadData() {
    try {
      const raw = localStorage.getItem(REPUTATION_CONFIG.storageKey);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data.reps)          this.state.reps          = Object.assign(this.state.reps, data.reps);
      if (data.mainFaction)   this.state.mainFaction   = data.mainFaction;
      if (data.purchasedItems)this.state.purchasedItems= data.purchasedItems;
      if (data.factionQuests) Object.assign(this._factionQuests, data.factionQuests);
    } catch (e) {
      console.error('[ReputationSystem] Load error:', e);
    }
  }
};

// ============================================================
// SECTION 3 — TOURNAMENT SYSTEM
// ============================================================

const TournamentSystem = {

  state: {
    registered: {},
    lastTournament: {},
    battleRecords: [],
    earnedTitles: [],
    activeTitle: null,
    inMatch: false,
    matchData: null,
    bracketProgress: 0,
    messengerSpawned: false
  },

  // ─── Is Tournament Time ──────────────────────────────────────
  isTournamentTime(tournamentId) {
    const sched = TOURNAMENT_CONFIG.schedules.find(s => s.id === tournamentId);
    if (!sched) return false;
    const last = this.state.lastTournament[tournamentId] || 0;
    const elapsed = Date.now() - last;
    // Use seconds-based check for dev (divide real interval by 86400)
    // interval * 24*60*60*1000 for production
    return elapsed >= sched.interval * 24 * 60 * 60 * 1000;
  },

  // ─── Register ────────────────────────────────────────────────
  register(tournamentId) {
    const sched = TOURNAMENT_CONFIG.schedules.find(s => s.id === tournamentId);
    if (!sched) return false;
    if (!this.isTournamentTime(tournamentId)) {
      if (typeof UI !== 'undefined') UI.addLog('Chưa đến ngày tổ chức!', 'system');
      return false;
    }
    this.state.registered[tournamentId] = true;
    if (typeof UI !== 'undefined') {
      UI.addLog('📋 Đã đăng ký ' + sched.name + '!', 'realm');
    }
    return true;
  },

  // ─── Start Match ─────────────────────────────────────────────
  startMatch(tournamentId) {
    if (!this.state.registered[tournamentId]) return false;

    const tier = Math.min(3, Math.floor((typeof Player !== 'undefined' ? Player.realm : 0) / 3) + 1);
    const namePool = TOURNAMENT_CONFIG.opponentNames[tier - 1];
    const oppName = namePool[Math.floor(Math.random() * namePool.length)];

    const oppStatMul = 0.8 + tier * 0.2 + this.state.bracketProgress * 0.05;
    const oppHp      = Math.floor(Player.maxHp * oppStatMul);
    const oppAtk     = Math.floor(Player.atk * oppStatMul * 0.9);
    const oppDef     = Math.floor(Player.def * oppStatMul);

    this.state.inMatch = true;
    this.state.matchData = {
      tournamentId, opponentName: oppName,
      oppHp, oppMaxHp: oppHp, oppAtk, oppDef,
      player_hp: Player.maxHp,
      timeRemaining: TOURNAMENT_CONFIG.matchDuration,
      _oppTimer: 0,
      _playerTimer: 0,
      scriptIdx: 0
    };

    TournamentArena.show(this.state.matchData);
    if (typeof GameState !== 'undefined') GameState.running = false;
    return true;
  },

  // ─── Update (called every frame) ─────────────────────────────
  update(dt) {
    if (!this.state.inMatch || !this.state.matchData) return;
    const match = this.state.matchData;
    match.timeRemaining -= dt;

    // Opponent attacks every 1.5s
    match._oppTimer = (match._oppTimer || 0) + dt;
    if (match._oppTimer >= 1500) {
      match._oppTimer -= 1500;
      let oppDmg = Math.max(1, match.oppAtk - (typeof Player !== 'undefined' ? Player.def : 5));
      if (typeof Utils !== 'undefined' && Utils.chance(0.15)) oppDmg = Math.floor(oppDmg * 1.8);
      match.player_hp = Math.max(0, match.player_hp - oppDmg);
      TournamentArena.update(match);
      TournamentArena.spawnDmgNumber(-oppDmg, false, true);
    }

    // Player auto attacks every 0.8s
    match._playerTimer = (match._playerTimer || 0) + dt;
    if (match._playerTimer >= 800) {
      match._playerTimer -= 800;
      let dmg = Math.max(1, (typeof Player !== 'undefined' ? Player.atk : 10) - match.oppDef);
      const isCrit = typeof Utils !== 'undefined' && Utils.chance(Player.critRate || 0.08);
      if (isCrit) dmg = Math.floor(dmg * (Player.critDmg || 1.5));
      match.oppHp = Math.max(0, match.oppHp - dmg);
      TournamentArena.update(match);
      TournamentArena.spawnDmgNumber(dmg, isCrit, false);
    }

    // Check win/lose/timeout
    if (match.oppHp <= 0) {
      this.onMatchWin(match.tournamentId);
    } else if (match.player_hp <= 0) {
      this.onMatchLose(match.tournamentId);
    } else if (match.timeRemaining <= 0) {
      const playerPct = match.player_hp / (typeof Player !== 'undefined' ? Player.maxHp : 100);
      const oppPct    = match.oppHp / match.oppMaxHp;
      if (playerPct > oppPct) this.onMatchWin(match.tournamentId);
      else this.onMatchLose(match.tournamentId);
    }
  },

  // ─── On Match Win ────────────────────────────────────────────
  onMatchWin(tournamentId) {
    this.state.bracketProgress++;
    TournamentArena.showResult('win');

    this.state.battleRecords.unshift({
      won: true,
      opp: this.state.matchData ? this.state.matchData.opponentName : '???',
      time: Date.now()
    });
    if (this.state.battleRecords.length > 5) this.state.battleRecords.pop();

    // Add PvP win rep
    ReputationSystem.addRep('kiemTong', REPUTATION_CONFIG.factions.kiemTong.repGain.pvpWin);

    if (this.state.bracketProgress >= 3) {
      this.onTournamentWin(tournamentId);
    } else {
      const self = this;
      setTimeout(() => { self.startMatch(tournamentId); }, 3000);
    }
  },

  // ─── On Tournament Win ───────────────────────────────────────
  onTournamentWin(tournamentId) {
    this.state.inMatch = false;
    this.state.registered[tournamentId] = false;
    this.state.lastTournament[tournamentId] = Date.now();
    this.state.bracketProgress = 0;
    this.state.messengerSpawned = false;

    if (typeof GameState !== 'undefined') GameState.running = true;
    TournamentArena.hide();

    const sched   = TOURNAMENT_CONFIG.schedules.find(s => s.id === tournamentId);
    const reward  = TOURNAMENT_CONFIG.rewards[sched.rewardTier];
    const title   = TOURNAMENT_CONFIG.titles[tournamentId][1];

    if (typeof Player !== 'undefined') {
      Player.gold += reward.gold;
    }
    if (typeof Inventory !== 'undefined') {
      Inventory.add(reward.item, reward.count);
    }
    if (!this.state.earnedTitles.includes(title)) {
      this.state.earnedTitles.push(title);
      this.setActiveTitle(title);
      if (typeof UI !== 'undefined') {
        UI.showNotification('🏆 ' + sched.name + ' Vô Địch!', title);
        UI.addLog('🏆 Chiến thắng! +' + reward.gold + ' vàng + title "' + title + '"', 'realm');
      }
    }
    if (typeof UI !== 'undefined') {
      UI.updateGold();
    }
    this.saveData();

    // Update tournament panel if open
    TournamentPanel.render();
  },

  // ─── On Match Lose ───────────────────────────────────────────
  onMatchLose(tournamentId) {
    this.state.inMatch = false;
    this.state.registered[tournamentId] = false;
    this.state.bracketProgress = 0;

    if (typeof GameState !== 'undefined') GameState.running = true;
    TournamentArena.hide();
    TournamentArena.showResult('lose');

    this.state.battleRecords.unshift({
      won: false,
      opp: this.state.matchData ? this.state.matchData.opponentName : '???',
      time: Date.now()
    });
    if (this.state.battleRecords.length > 5) this.state.battleRecords.pop();

    if (typeof Inventory !== 'undefined') Inventory.add('spiritStone', 2);
    if (typeof UI !== 'undefined') UI.addLog('💔 Thất bại. Cố gắng lại lần sau!', 'system');
    this.saveData();
  },

  // ─── Set Active Title ────────────────────────────────────────
  setActiveTitle(title) {
    this.state.activeTitle = title;
    let titleEl = document.getElementById('tournamentTitleDisplay');
    if (!titleEl) {
      titleEl = document.createElement('div');
      titleEl.id = 'tournamentTitleDisplay';
      titleEl.style.cssText = 'color:#f0c040;font-size:8px;text-shadow:1px 1px 2px #000;margin-top:1px;text-align:center';
      const playerNameEl = document.getElementById('playerName');
      if (playerNameEl) playerNameEl.after(titleEl);
    }
    titleEl.textContent = title ? '【' + title + '】' : '';
  },

  // ─── Check / Spawn Messenger ─────────────────────────────────
  checkSpawnMessenger() {
    if (typeof NPC === 'undefined') return;
    for (const sched of TOURNAMENT_CONFIG.schedules) {
      if (this.isTournamentTime(sched.id) && !this.state.messengerSpawned) {
        NPC.types.tournamentMessenger = {
          name: '📋 Thi Đấu Sứ Giả',
          title: 'Thông Báo Giải Đấu',
          sprite: 'npcTeleporter',
          dialog: '🏆 ' + sched.name + ' chuẩn bị bắt đầu! Đăng ký ngay để tranh đấu!',
          service: 'tournament_register',
          _schedId: sched.id
        };
        const px = (typeof Player !== 'undefined') ? Player.x + 100 : 600;
        const py = (typeof Player !== 'undefined') ? Player.y + 50 : 450;
        NPC.spawn('tournamentMessenger', px, py);
        this.state.messengerSpawned = true;
        if (typeof UI !== 'undefined') {
          UI.addLog('📋 Sứ Giả đến thông báo: ' + sched.name + ' sắp bắt đầu!', 'realm');
        }
        break;
      }
    }
  },

  // ─── Save / Load ─────────────────────────────────────────────
  saveData() {
    try {
      localStorage.setItem(TOURNAMENT_CONFIG.storageKey, JSON.stringify({
        registered: this.state.registered,
        lastTournament: this.state.lastTournament,
        battleRecords: this.state.battleRecords,
        earnedTitles: this.state.earnedTitles,
        activeTitle: this.state.activeTitle
      }));
    } catch (e) {
      console.error('[TournamentSystem] Save error:', e);
    }
  },

  loadData() {
    try {
      const raw = localStorage.getItem(TOURNAMENT_CONFIG.storageKey);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data.registered)      this.state.registered      = data.registered;
      if (data.lastTournament)   this.state.lastTournament  = data.lastTournament;
      if (data.battleRecords)    this.state.battleRecords   = data.battleRecords;
      if (data.earnedTitles)     this.state.earnedTitles    = data.earnedTitles;
      if (data.activeTitle)      this.setActiveTitle(data.activeTitle);
    } catch (e) {
      console.error('[TournamentSystem] Load error:', e);
    }
  }
};

// ============================================================
// SECTION 4 — UI: TOURNAMENT ARENA
// ============================================================

const TournamentArena = {
  _dmgNumbers: [],

  show(matchData) {
    const arena = document.getElementById('tournamentArena');
    if (!arena) return;
    arena.style.display = 'flex';

    // Set opponent name
    const oppNameEl = document.getElementById('arenaOppName');
    if (oppNameEl) oppNameEl.textContent = matchData.opponentName;

    this._dmgNumbers = [];
    this.update(matchData);
    this._startDmgLoop();
  },

  hide() {
    const arena = document.getElementById('tournamentArena');
    if (arena) arena.style.display = 'none';
    this._stopDmgLoop();
  },

  update(matchData) {
    if (!matchData) return;

    // Player HP bar
    const playerHpFill = document.getElementById('arenaPlayerHpFill');
    const playerHpText = document.getElementById('arenaPlayerHpText');
    const playerMaxHp  = (typeof Player !== 'undefined') ? Player.maxHp : 100;
    if (playerHpFill) {
      playerHpFill.style.width = Math.max(0, matchData.player_hp / playerMaxHp * 100) + '%';
    }
    if (playerHpText) {
      playerHpText.textContent = matchData.player_hp + '/' + playerMaxHp;
    }

    // Opponent HP bar
    const oppHpFill = document.getElementById('arenaOppHpFill');
    const oppHpText = document.getElementById('arenaOppHpText');
    if (oppHpFill) {
      oppHpFill.style.width = Math.max(0, matchData.oppHp / matchData.oppMaxHp * 100) + '%';
    }
    if (oppHpText) {
      oppHpText.textContent = matchData.oppHp + '/' + matchData.oppMaxHp;
    }

    // Timer
    const timerEl = document.getElementById('arenaTimer');
    if (timerEl) {
      const sec = Math.max(0, Math.ceil(matchData.timeRemaining / 1000));
      timerEl.textContent = sec + 's';
      timerEl.style.color = sec <= 10 ? '#f44336' : '#f0c040';
    }

    // Match info
    const matchInfoEl = document.getElementById('arenaMatchInfo');
    if (matchInfoEl) {
      const sched = TOURNAMENT_CONFIG.schedules.find(s => s.id === matchData.tournamentId);
      matchInfoEl.textContent = (sched ? sched.name : '') + ' — Trận ' + (TournamentSystem.state.bracketProgress + 1) + '/3';
    }

    // Bracket progress
    const bracketEl = document.getElementById('arenaBracket');
    if (bracketEl) {
      const prog = TournamentSystem.state.bracketProgress;
      bracketEl.innerHTML = '';
      for (let i = 0; i < 3; i++) {
        const dot = document.createElement('div');
        dot.style.cssText = 'width:12px;height:12px;border-radius:50%;border:2px solid #f0c040;background:' + (i < prog ? '#f0c040' : 'transparent');
        bracketEl.appendChild(dot);
      }
    }
  },

  spawnDmgNumber(dmg, isCrit, isPlayer) {
    this._dmgNumbers.push({
      text: (dmg < 0 ? '' : '+') + dmg,
      color: isPlayer ? '#f44336' : (isCrit ? '#f0c040' : '#ffffff'),
      x: isPlayer ? 25 + Math.random() * 10 : 75 + Math.random() * 10,
      y: 50,
      life: 1200,
      vy: -0.05
    });
  },

  showResult(result) {
    const resultEl = document.getElementById('arenaResult');
    if (!resultEl) return;
    resultEl.style.display = 'flex';
    const iconEl = document.getElementById('arenaResultIcon');
    const textEl = document.getElementById('arenaResultText');
    if (result === 'win') {
      if (iconEl) iconEl.textContent = '🏆';
      if (textEl) { textEl.textContent = 'CHIẾN THẮNG!'; textEl.style.color = '#f0c040'; }
    } else {
      if (iconEl) iconEl.textContent = '💀';
      if (textEl) { textEl.textContent = 'THẤT BẠI'; textEl.style.color = '#f44336'; }
    }
    // Auto-hide result
    setTimeout(() => {
      if (resultEl) resultEl.style.display = 'none';
    }, 2500);
  },

  _dmgLoopId: null,
  _startDmgLoop() {
    if (this._dmgLoopId) return;
    const canvas = document.getElementById('arenaCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const self = this;
    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Draw VS arena background
      ctx.fillStyle = 'rgba(13,13,26,0.4)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Player side silhouette
      ctx.fillStyle = '#42a5f5';
      ctx.shadowColor = '#42a5f5';
      ctx.shadowBlur = 10;
      ctx.fillRect(30, 15, 18, 30);
      ctx.fillStyle = '#87ceeb';
      ctx.beginPath();
      ctx.arc(39, 10, 8, 0, Math.PI * 2);
      ctx.fill();

      // Opponent side silhouette
      ctx.fillStyle = '#ef5350';
      ctx.shadowColor = '#ef5350';
      ctx.shadowBlur = 10;
      ctx.fillRect(152, 15, 18, 30);
      ctx.fillStyle = '#ff8a80';
      ctx.beginPath();
      ctx.arc(161, 10, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;

      // Damage numbers
      const now = Date.now();
      for (let i = self._dmgNumbers.length - 1; i >= 0; i--) {
        const dn = self._dmgNumbers[i];
        dn.life -= 16;
        dn.y += dn.vy;
        if (dn.life <= 0) { self._dmgNumbers.splice(i, 1); continue; }
        const alpha = Math.min(1, dn.life / 400);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = dn.color;
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(dn.text, (dn.x / 100) * canvas.width, dn.y);
        ctx.globalAlpha = 1;
      }

      self._dmgLoopId = requestAnimationFrame(loop);
    }
    this._dmgLoopId = requestAnimationFrame(loop);
  },

  _stopDmgLoop() {
    if (this._dmgLoopId) {
      cancelAnimationFrame(this._dmgLoopId);
      this._dmgLoopId = null;
    }
  }
};

// ============================================================
// SECTION 5 — UI: REPUTATION PANEL
// ============================================================

const ReputationPanel = {
  _currentFactionShop: null,

  open() {
    const overlay = document.getElementById('reputationOverlay');
    if (overlay) { overlay.style.display = 'flex'; }
    if (typeof GameState !== 'undefined') GameState.running = false;
    this.render();
  },

  close() {
    const overlay = document.getElementById('reputationOverlay');
    if (overlay) overlay.style.display = 'none';
    if (typeof GameState !== 'undefined') GameState.running = true;
    this._currentFactionShop = null;
  },

  render() {
    const content = document.getElementById('reputationContent');
    if (!content) return;
    content.innerHTML = '';

    // If viewing a faction shop
    if (this._currentFactionShop) {
      const backBtn = document.createElement('div');
      backBtn.className = 'npc-option';
      backBtn.innerHTML = '← Quay lại';
      backBtn.onclick = () => { this._currentFactionShop = null; this.render(); };
      content.appendChild(backBtn);

      ReputationSystem.buildFactionShop(content, this._currentFactionShop);
      return;
    }

    // Main Faction info
    const mainF = ReputationSystem.state.mainFaction;
    if (mainF) {
      const f = REPUTATION_CONFIG.factions[mainF];
      const header = document.createElement('div');
      header.style.cssText = 'background:rgba(' + _hexToRgba(f.color, 0.15) + ');border:1px solid ' + f.color + ';border-radius:8px;padding:8px 12px;margin-bottom:12px;font-size:10px;color:' + f.color;
      header.textContent = '🏛️ Chính Phái: ' + f.icon + ' ' + f.name;
      content.appendChild(header);
    }

    // Each faction row
    for (const factionId in REPUTATION_CONFIG.factions) {
      const f = REPUTATION_CONFIG.factions[factionId];
      const rep = ReputationSystem.state.reps[factionId] || 0;
      const tier = ReputationSystem.getTier(factionId);
      const nextTier = REPUTATION_CONFIG.tiers[tier.tier]; // next tier obj (index = tier.tier)
      const maxRep = nextTier ? nextTier.minRep : 5000;
      const pct = nextTier ? Math.min(100, (rep - tier.minRep) / (nextTier.minRep - tier.minRep) * 100) : 100;

      const card = document.createElement('div');
      card.style.cssText = 'background:rgba(255,255,255,0.03);border:1px solid #333;border-radius:10px;padding:12px;margin-bottom:10px';

      // Header row
      const headerRow = document.createElement('div');
      headerRow.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:8px';
      headerRow.innerHTML =
        '<span style="color:' + f.color + ';font-size:12px;font-weight:bold">' + f.icon + ' ' + f.name + '</span>' +
        '<span style="font-size:9px;padding:2px 7px;border-radius:10px;background:' + tier.color + '33;color:' + tier.color + ';border:1px solid ' + tier.color + '">' + tier.name + '</span>';
      card.appendChild(headerRow);

      // Rep bar
      const barBg = document.createElement('div');
      barBg.style.cssText = 'background:#222;border-radius:4px;height:6px;margin-bottom:4px;overflow:hidden';
      const barFill = document.createElement('div');
      barFill.style.cssText = 'height:100%;border-radius:4px;background:' + f.color + ';width:' + pct + '%;transition:width 0.4s';
      barBg.appendChild(barFill);
      card.appendChild(barBg);

      // Rep text
      const repText = document.createElement('div');
      repText.style.cssText = 'font-size:9px;color:#666;margin-bottom:8px';
      repText.textContent = rep + (nextTier ? ' / ' + nextTier.minRep : ' (MAX)');
      card.appendChild(repText);

      // Desc
      const desc = document.createElement('div');
      desc.style.cssText = 'font-size:9px;color:#888;margin-bottom:8px';
      desc.textContent = f.desc;
      card.appendChild(desc);

      // Current buff description
      if (tier.tier >= 2) {
        const buff = f.buffs[tier.tier];
        if (buff) {
          const buffEl = document.createElement('div');
          buffEl.style.cssText = 'font-size:9px;color:#4caf50;margin-bottom:8px;padding:4px 8px;background:rgba(76,175,80,0.08);border-radius:5px';
          buffEl.textContent = '✦ ' + buff.desc;
          card.appendChild(buffEl);
        }
      }

      // Action buttons row
      const btnRow = document.createElement('div');
      btnRow.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap';

      // Shop button
      if (tier.tier >= 2) {
        const shopBtn = _makeBtn('🛒 Cửa Hàng', f.color, () => {
          this._currentFactionShop = factionId;
          this.render();
        });
        btnRow.appendChild(shopBtn);
      }

      // Choose faction button
      if (!ReputationSystem.state.mainFaction && rep >= 100) {
        const chooseBtn = _makeBtn('🏛️ Gia Nhập', '#f0c040', () => {
          if (ReputationSystem.setMainFaction(factionId)) {
            this.render();
          }
        });
        btnRow.appendChild(chooseBtn);
      }

      // Faction quest button
      const q = ReputationSystem._factionQuests[factionId];
      if (q) {
        if (!q.active) {
          const questBtn = _makeBtn('📜 Nhiệm Vụ', '#88c', () => {
            ReputationSystem.acceptFactionQuest(factionId);
            this.render();
          });
          btnRow.appendChild(questBtn);
        } else {
          const isComplete = ReputationSystem.isFactionQuestComplete(factionId);
          const progress = _getFactionQuestProgress(factionId, q);
          const questStatus = document.createElement('div');
          questStatus.style.cssText = 'font-size:9px;padding:4px 8px;border-radius:5px;background:rgba(255,255,255,0.05);color:#aaa;width:100%';
          questStatus.innerHTML = '📋 ' + progress;
          if (isComplete) {
            const claimBtn = _makeBtn('✅ Nhận Thưởng', '#4caf50', () => {
              ReputationSystem.claimFactionQuest(factionId);
              this.render();
            });
            btnRow.appendChild(claimBtn);
          } else {
            btnRow.appendChild(questStatus);
          }
        }
      }

      if (btnRow.children.length > 0) card.appendChild(btnRow);
      content.appendChild(card);
    }
  }
};

// ─── Helper: faction quest progress text ──────────────────────
function _getFactionQuestProgress(factionId, q) {
  switch (factionId) {
    case 'kiemTong': return 'Tiêu diệt quái: ' + q.kills + '/' + q.needed;
    case 'longToc':  return 'Tiêu diệt quái: ' + q.kills + '/' + q.needed;
    case 'thuongHoi':return 'Mua vật phẩm: ' + q.buys + '/' + q.needed;
    case 'daoMon':   return 'Tu luyện: ' + Math.floor((q.cultivateTime||0)/1000) + '/' + Math.floor(q.needed/1000) + 's';
    case 'maTong':   return 'Giết ban đêm: ' + q.nightKills + '/' + q.needed;
    default: return '?';
  }
}

// ─── Helper: hex to rgba ──────────────────────────────────────
function _hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return r + ',' + g + ',' + b + ',' + alpha;
}

// ─── Helper: make styled button ──────────────────────────────
function _makeBtn(text, color, onClick) {
  const btn = document.createElement('div');
  btn.style.cssText = 'padding:5px 10px;border-radius:6px;font-size:9px;cursor:pointer;border:1px solid ' + color + ';color:' + color + ';background:rgba(0,0,0,0.3)';
  btn.textContent = text;
  btn.onclick = onClick;
  return btn;
}

// ============================================================
// SECTION 6 — UI: TOURNAMENT PANEL
// ============================================================

const TournamentPanel = {
  open() {
    const overlay = document.getElementById('tournamentOverlay');
    if (overlay) overlay.style.display = 'flex';
    if (typeof GameState !== 'undefined') GameState.running = false;
    this.render();
  },

  close() {
    const overlay = document.getElementById('tournamentOverlay');
    if (overlay) overlay.style.display = 'none';
    if (typeof GameState !== 'undefined') GameState.running = true;
  },

  render() {
    const content = document.getElementById('tournamentContent');
    if (!content) return;
    content.innerHTML = '';

    // Active title display
    if (TournamentSystem.state.activeTitle) {
      const titleRow = document.createElement('div');
      titleRow.style.cssText = 'text-align:center;color:#f0c040;font-size:11px;margin-bottom:12px;padding:8px;background:rgba(240,192,64,0.1);border-radius:8px;border:1px solid #f0c04044';
      titleRow.textContent = '🏆 Danh Hiệu Hiện Tại: 【' + TournamentSystem.state.activeTitle + '】';
      content.appendChild(titleRow);
    }

    // All earned titles
    if (TournamentSystem.state.earnedTitles.length > 0) {
      const titlesSection = document.createElement('div');
      titlesSection.style.cssText = 'margin-bottom:14px';
      const titlesLabel = document.createElement('div');
      titlesLabel.style.cssText = 'font-size:9px;color:#888;margin-bottom:6px';
      titlesLabel.textContent = '🏅 Danh Hiệu Đã Đạt:';
      titlesSection.appendChild(titlesLabel);
      const titlesWrap = document.createElement('div');
      titlesWrap.style.cssText = 'display:flex;flex-wrap:wrap;gap:5px';
      TournamentSystem.state.earnedTitles.forEach(t => {
        const badge = document.createElement('div');
        const isActive = t === TournamentSystem.state.activeTitle;
        badge.style.cssText = 'padding:3px 9px;border-radius:12px;font-size:9px;cursor:pointer;border:1px solid ' + (isActive ? '#f0c040' : '#555') + ';background:' + (isActive ? 'rgba(240,192,64,0.15)' : 'transparent') + ';color:' + (isActive ? '#f0c040' : '#888');
        badge.textContent = (isActive ? '✓ ' : '') + t;
        badge.onclick = () => {
          TournamentSystem.setActiveTitle(isActive ? null : t);
          TournamentSystem.saveData();
          this.render();
        };
        titlesWrap.appendChild(badge);
      });
      titlesSection.appendChild(titlesWrap);
      content.appendChild(titlesSection);
    }

    // Tournament schedules
    const schedLabel = document.createElement('div');
    schedLabel.style.cssText = 'font-size:10px;color:#888;margin-bottom:8px;font-weight:bold';
    schedLabel.textContent = '⚔️ Giải Đấu Sắp Tới:';
    content.appendChild(schedLabel);

    TOURNAMENT_CONFIG.schedules.forEach(sched => {
      const isTime = TournamentSystem.isTournamentTime(sched.id);
      const isReg  = TournamentSystem.state.registered[sched.id];
      const reward = TOURNAMENT_CONFIG.rewards[sched.rewardTier];

      const card = document.createElement('div');
      card.style.cssText = 'background:rgba(255,255,255,0.03);border:1px solid ' + (isTime ? '#f0c040' : '#333') + ';border-radius:10px;padding:12px;margin-bottom:10px';

      const headerRow = document.createElement('div');
      headerRow.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:6px';
      headerRow.innerHTML =
        '<span style="color:' + (isTime ? '#f0c040' : '#888') + ';font-size:11px;font-weight:bold">🏆 ' + sched.name + '</span>' +
        '<span style="font-size:9px;color:' + (isTime ? '#4caf50' : '#666') + '">' + (isTime ? '✅ Đang Mở' : '⏰ Chưa Đến') + '</span>';
      card.appendChild(headerRow);

      const rewardInfo = document.createElement('div');
      rewardInfo.style.cssText = 'font-size:9px;color:#888;margin-bottom:8px';
      rewardInfo.innerHTML = '🎁 Phần thưởng vô địch: <span style="color:#f0c040">+' + reward.gold + ' 💰</span> | ' + (typeof ITEMS !== 'undefined' && ITEMS[reward.item] ? ITEMS[reward.item].name : reward.item) + ' x' + reward.count;
      card.appendChild(rewardInfo);

      const interval = document.createElement('div');
      interval.style.cssText = 'font-size:9px;color:#555;margin-bottom:8px';
      interval.textContent = '📅 Tổ chức mỗi ' + sched.interval + ' ngày';
      card.appendChild(interval);

      const btnRow = document.createElement('div');
      btnRow.style.cssText = 'display:flex;gap:6px';

      if (isTime && !isReg) {
        const regBtn = _makeBtn('📋 Đăng Ký', '#f0c040', () => {
          TournamentSystem.register(sched.id);
          this.render();
        });
        btnRow.appendChild(regBtn);
      } else if (isReg) {
        const startBtn = _makeBtn('⚔️ Bắt Đầu', '#ef5350', () => {
          this.close();
          setTimeout(() => TournamentSystem.startMatch(sched.id), 200);
        });
        btnRow.appendChild(startBtn);
      } else {
        const waitEl = document.createElement('div');
        waitEl.style.cssText = 'font-size:9px;color:#555';
        waitEl.textContent = '⏰ Chưa đến ngày tổ chức';
        btnRow.appendChild(waitEl);
      }

      card.appendChild(btnRow);
      content.appendChild(card);
    });

    // Battle records
    if (TournamentSystem.state.battleRecords.length > 0) {
      const sep = document.createElement('div');
      sep.style.cssText = 'border-top:1px solid #333;margin:12px 0';
      content.appendChild(sep);

      const recLabel = document.createElement('div');
      recLabel.style.cssText = 'font-size:9px;color:#888;margin-bottom:6px';
      recLabel.textContent = '📊 Lịch Sử Gần Đây:';
      content.appendChild(recLabel);

      TournamentSystem.state.battleRecords.forEach(rec => {
        const row = document.createElement('div');
        row.style.cssText = 'font-size:9px;padding:4px 8px;border-radius:5px;margin-bottom:4px;background:rgba(255,255,255,0.03);display:flex;justify-content:space-between';
        const d = new Date(rec.time);
        const timeStr = d.getHours() + ':' + String(d.getMinutes()).padStart(2,'0');
        row.innerHTML =
          '<span>' + (rec.won ? '✅' : '❌') + ' vs ' + rec.opp + '</span>' +
          '<span style="color:#555">' + timeStr + '</span>';
        content.appendChild(row);
      });
    }
  }
};

// ============================================================
// SECTION 7 — HTML INJECTION
// ============================================================

const ReputationFeature = {

  injectHTML() {
    // ── Reputation Overlay ──────────────────────────────────────
    const repHtml = `
<div id="reputationOverlay" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:150;align-items:center;justify-content:center">
  <div style="background:#0d0d1a;border:1px solid #333;border-radius:14px;width:min(92vw,360px);max-height:85vh;display:flex;flex-direction:column;overflow:hidden;font-family:monospace">
    <div style="display:flex;justify-content:space-between;align-items:center;padding:14px 16px;border-bottom:1px solid #222">
      <div style="color:#f0c040;font-size:13px;font-weight:bold">🏛️ Danh Vọng Giang Hồ</div>
      <div id="repClose" style="color:#888;font-size:18px;cursor:pointer;padding:4px 8px">&times;</div>
    </div>
    <div id="reputationContent" style="overflow-y:auto;padding:14px;flex:1"></div>
  </div>
</div>`;

    // ── Tournament Overlay ──────────────────────────────────────
    const tournHtml = `
<div id="tournamentOverlay" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:150;align-items:center;justify-content:center">
  <div style="background:#0d0d1a;border:1px solid #f0c04055;border-radius:14px;width:min(92vw,360px);max-height:85vh;display:flex;flex-direction:column;overflow:hidden;font-family:monospace">
    <div style="display:flex;justify-content:space-between;align-items:center;padding:14px 16px;border-bottom:1px solid #222">
      <div style="color:#f0c040;font-size:13px;font-weight:bold">🏆 Giải Đấu Võ Lâm</div>
      <div id="tournClose" style="color:#888;font-size:18px;cursor:pointer;padding:4px 8px">&times;</div>
    </div>
    <div id="tournamentContent" style="overflow-y:auto;padding:14px;flex:1"></div>
  </div>
</div>`;

    // ── Tournament Arena (fullscreen) ───────────────────────────
    const arenaHtml = `
<div id="tournamentArena" style="display:none;position:fixed;inset:0;background:linear-gradient(135deg,#0d0d1a,#1a0d0d);z-index:200;flex-direction:column;align-items:center;justify-content:center;font-family:monospace">
  <!-- Match Info Bar -->
  <div id="arenaMatchInfo" style="color:#f0c040;font-size:10px;margin-bottom:8px;opacity:0.8"></div>
  <!-- Bracket dots -->
  <div id="arenaBracket" style="display:flex;gap:8px;margin-bottom:16px"></div>

  <!-- VS Section -->
  <div style="display:flex;justify-content:space-evenly;align-items:center;width:100%;max-width:360px;margin-bottom:16px">
    <!-- Player Side -->
    <div style="flex:1;text-align:center">
      <div style="font-size:9px;color:#42a5f5;margin-bottom:4px">👤 Ngươi</div>
      <div style="background:#222;border-radius:4px;height:8px;margin-bottom:3px;overflow:hidden">
        <div id="arenaPlayerHpFill" style="height:100%;background:#4caf50;width:100%;transition:width 0.15s"></div>
      </div>
      <div id="arenaPlayerHpText" style="font-size:8px;color:#888"></div>
    </div>
    <!-- Canvas -->
    <div style="flex:0 0 200px;position:relative;height:80px">
      <canvas id="arenaCanvas" width="200" height="80" style="width:200px;height:80px"></canvas>
      <div id="arenaResult" style="display:none;position:absolute;inset:0;background:rgba(0,0,0,0.75);flex-direction:column;align-items:center;justify-content:center;border-radius:8px">
        <div id="arenaResultIcon" style="font-size:24px"></div>
        <div id="arenaResultText" style="font-size:14px;font-weight:bold;margin-top:4px"></div>
      </div>
    </div>
    <!-- Opponent Side -->
    <div style="flex:1;text-align:center">
      <div id="arenaOppName" style="font-size:9px;color:#ef5350;margin-bottom:4px"></div>
      <div style="background:#222;border-radius:4px;height:8px;margin-bottom:3px;overflow:hidden">
        <div id="arenaOppHpFill" style="height:100%;background:#ef5350;width:100%;transition:width 0.15s"></div>
      </div>
      <div id="arenaOppHpText" style="font-size:8px;color:#888"></div>
    </div>
  </div>

  <!-- Timer -->
  <div id="arenaTimer" style="font-size:22px;font-weight:bold;color:#f0c040;margin-bottom:16px;text-shadow:0 0 12px #f0c040"></div>

  <!-- Skill Buttons -->
  <div id="arenaSkills" style="display:flex;justify-content:center;gap:10px;margin-bottom:12px"></div>

  <!-- Flee button -->
  <div id="arenaFlee" style="color:#666;font-size:10px;cursor:pointer;padding:6px 16px;border:1px solid #333;border-radius:20px">🚫 Bỏ Cuộc</div>

  <!-- VS text glow -->
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:28px;font-weight:bold;color:#fff;text-shadow:0 0 20px #f0c040,0 0 40px #ef5350;pointer-events:none;opacity:0.15">VS</div>
</div>`;

    // ── Faction Quest Panel ─────────────────────────────────────
    const fqHtml = `
<div id="factionQuestOverlay" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:160;align-items:center;justify-content:center">
  <div style="background:#0d0d1a;border:1px solid #444;border-radius:12px;width:min(88vw,340px);max-height:80vh;overflow:hidden;display:flex;flex-direction:column;font-family:monospace">
    <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 14px;border-bottom:1px solid #222">
      <div id="fqTitle" style="color:#f0c040;font-size:12px;font-weight:bold">📜 Nhiệm Vụ Phái</div>
      <div id="fqClose" style="color:#888;font-size:18px;cursor:pointer;padding:2px 8px">&times;</div>
    </div>
    <div id="fqContent" style="overflow-y:auto;padding:14px;flex:1"></div>
  </div>
</div>`;

    // ── Two HUD buttons (Reputation + Tournament) ───────────────
    const hudHtml = `
<div id="repTournHudBtns" style="position:fixed;bottom:160px;right:8px;display:flex;flex-direction:column;gap:6px;z-index:50">
  <div id="repHudBtn" title="Danh Vọng" style="width:36px;height:36px;border-radius:50%;background:#1a1a2e;border:2px solid #f0c040;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,0.5)">🏛️</div>
  <div id="tournHudBtn" title="Giải Đấu" style="width:36px;height:36px;border-radius:50%;background:#1a1a2e;border:2px solid #ef5350;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,0.5)">🏆</div>
</div>`;

    [repHtml, tournHtml, arenaHtml, fqHtml, hudHtml].forEach(html => {
      const div = document.createElement('div');
      div.innerHTML = html.trim();
      while (div.firstChild) document.body.appendChild(div.firstChild);
    });
  },

  _injectStyles() {
    if (document.getElementById('rep-tourn-style')) return;
    const style = document.createElement('style');
    style.id = 'rep-tourn-style';
    style.textContent = `
      #reputationOverlay, #tournamentOverlay, #factionQuestOverlay {
        animation: repFadeIn 0.2s ease;
      }
      @keyframes repFadeIn {
        from { opacity:0; transform:scale(0.96); }
        to   { opacity:1; transform:scale(1); }
      }
      #repHudBtn:hover, #tournHudBtn:hover {
        transform: scale(1.1);
        transition: transform 0.15s;
      }
      #arenaFlee:hover { color: #f44336; border-color: #f44336; }
    `;
    document.head.appendChild(style);
  },

  _bindEvents() {
    // Close overlays
    document.getElementById('repClose')?.addEventListener('click', () => ReputationPanel.close());
    document.getElementById('tournClose')?.addEventListener('click', () => TournamentPanel.close());
    document.getElementById('fqClose')?.addEventListener('click', () => {
      const ov = document.getElementById('factionQuestOverlay');
      if (ov) ov.style.display = 'none';
      if (typeof GameState !== 'undefined') GameState.running = true;
    });

    // HUD buttons
    document.getElementById('repHudBtn')?.addEventListener('click', () => ReputationPanel.open());
    document.getElementById('tournHudBtn')?.addEventListener('click', () => TournamentPanel.open());

    // Arena flee
    document.getElementById('arenaFlee')?.addEventListener('click', () => {
      if (!TournamentSystem.state.inMatch) return;
      TournamentSystem.onMatchLose(TournamentSystem.state.matchData?.tournamentId);
    });

    // Arena skill buttons
    this._buildArenaSkillButtons();
  },

  _buildArenaSkillButtons() {
    const container = document.getElementById('arenaSkills');
    if (!container) return;
    container.innerHTML = '';
    if (typeof SKILLS === 'undefined') return;
    SKILLS.forEach((skill, idx) => {
      const btn = document.createElement('div');
      btn.style.cssText = 'width:44px;height:44px;border-radius:8px;background:#1a1a2e;border:2px solid ' + skill.color + ';display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:11px;color:' + skill.color + ';position:relative';
      btn.title = skill.name + ' — ' + skill.desc;
      btn.textContent = (idx + 1);
      btn.addEventListener('click', () => {
        _arenaUseSkill(idx);
      });
      container.appendChild(btn);
    });
  },

  // ─── Hook: Game.init ─────────────────────────────────────────
  _hookGameInit() {
    const _origInit = Game.init.bind(Game);
    Game.init = function() {
      _origInit();
      // Init after original
      setTimeout(() => {
        ReputationSystem.loadData();
        TournamentSystem.loadData();
        ReputationSystem._updateBuffs();
        TournamentSystem.checkSpawnMessenger();
        TournamentPanel.render();
      }, 500);
    };
  },

  // ─── Hook: Game.update ───────────────────────────────────────
  _hookGameUpdate() {
    const _origUpdate = Game.update.bind(Game);
    Game.update = function(dt) {
      _origUpdate(dt);
      TournamentSystem.update(dt);
      // daoMon quest: cultivation time
      if (typeof AutoSystem !== 'undefined' && AutoSystem.cultivating) {
        const q = ReputationSystem._factionQuests.daoMon;
        if (q && q.active) q.cultivateTime = (q.cultivateTime || 0) + dt;
      }
    };
  },

  // ─── Hook: Player.recalculateStats ───────────────────────────
  _hookRecalcStats() {
    const _origRecalc = Player.recalculateStats.bind(Player);
    Player.recalculateStats = function() {
      _origRecalc();
      ReputationSystem.applyToStats(Player);
    };
  },

  // ─── Hook: Enemies.kill ──────────────────────────────────────
  _hookEnemiesKill() {
    const _origKill = Enemies.kill.bind(Enemies);
    Enemies.kill = function(enemy) {
      _origKill(enemy);

      // kiemTong: kill enemy rep
      ReputationSystem.addRep('kiemTong', REPUTATION_CONFIG.factions.kiemTong.repGain.killEnemy);
      // maTong: also 1 rep per kill
      ReputationSystem.addRep('maTong', REPUTATION_CONFIG.factions.maTong.repGain.killEnemy);

      // Night kill → extra maTong rep
      const isNight = typeof WorldSystem !== 'undefined' && WorldSystem.state && WorldSystem.state.isNight;
      if (isNight) {
        ReputationSystem.addRep('maTong', REPUTATION_CONFIG.factions.maTong.repGain.nightKill);
        // maTong quest
        const q = ReputationSystem._factionQuests.maTong;
        if (q && q.active) q.nightKills = (q.nightKills || 0) + 1;
      }

      // boss kill → kiemTong extra
      if (enemy && enemy.boss) {
        ReputationSystem.addRep('kiemTong', REPUTATION_CONFIG.factions.kiemTong.repGain.bossKill);
      }

      // kiemTong / longToc quest: kill enemy
      ['kiemTong', 'longToc'].forEach(fid => {
        const q = ReputationSystem._factionQuests[fid];
        if (q && q.active) q.kills = (q.kills || 0) + 1;
      });

      // Lifesteal from maTong buff
      if (Player._repLifesteal && enemy) {
        const heal = Math.floor(enemy.maxHp * Player._repLifesteal * 0.1);
        Player.hp = Math.min(Player.maxHp, Player.hp + heal);
        if (heal > 0 && typeof Game !== 'undefined') {
          Game.spawnDamageNumber(Player.x, Player.y - 20, '+' + heal, '#9c27b0');
        }
      }

      // Gold drop bonus from thuongHoi
      if (Player._repGoldBonus && enemy) {
        const bonusGold = Math.floor((enemy.gold || 0) * Player._repGoldBonus);
        if (bonusGold > 0) Player.gold += bonusGold;
      }
    };
  },

  // ─── Hook: Player.gainRealmExp ───────────────────────────────
  _hookGainRealmExp() {
    const _origGainRealmExp = Player.gainRealmExp.bind(Player);
    Player.gainRealmExp = function(amount) {
      const bonus = 1 + (Player._repRealmExpBonus || 0);
      _origGainRealmExp(Math.floor(amount * bonus));
    };
  },

  // ─── Hook: NPC.buyItem → thuongHoi rep ───────────────────────
  _hookNPCBuyItem() {
    const _origBuyItem = NPC.buyItem.bind(NPC);
    NPC.buyItem = function(itemId, price) {
      const result = _origBuyItem(itemId, price);
      if (result !== false) {
        ReputationSystem.addRep('thuongHoi', REPUTATION_CONFIG.factions.thuongHoi.repGain.buyFromShop);
        // thuongHoi quest
        const q = ReputationSystem._factionQuests.thuongHoi;
        if (q && q.active) q.buys = (q.buys || 0) + 1;
      }
      return result;
    };
  },

  // ─── Hook: NPC.spawnForMap → faction quest NPCs ──────────────
  _hookNPCSpawnForMap() {
    const _origSpawnForMap = NPC.spawnForMap.bind(NPC);
    NPC.spawnForMap = function(mapIndex) {
      _origSpawnForMap(mapIndex);

      // Register faction NPC types
      _registerFactionNPCTypes();

      // Spawn 1~2 random faction emissaries
      const factionKeys = Object.keys(REPUTATION_CONFIG.factions);
      const shuffled = factionKeys.sort(() => Math.random() - 0.5);
      const count = 1 + Math.floor(Math.random() * 2);
      const mapW = 60 * 32;
      const mapH = 60 * 32;
      for (let i = 0; i < count && i < shuffled.length; i++) {
        const fid = shuffled[i];
        const typeKey = fid + 'Emissary';
        const x = 150 + Math.random() * (mapW - 300);
        const y = 150 + Math.random() * (mapH - 300);
        NPC.spawn(typeKey, x, y);
      }

      // Check messenger
      TournamentSystem.checkSpawnMessenger();
    };
  },

  // ─── Hook: NPC.interact → faction quests / tournament ────────
  _hookNPCInteract() {
    const _origInteract = NPC.interact.bind(NPC);
    NPC.interact = function(npc) {
      if (!npc) return _origInteract(npc);

      // Faction quest NPC
      if (npc.service && npc.service.startsWith('factionQuest_')) {
        const factionId = npc.service.replace('factionQuest_', '');
        _openFactionQuestPanel(factionId, npc);
        return;
      }

      // Tournament register/start NPC
      if (npc.service === 'tournament_register') {
        const schedId = npc._schedId;
        NPC.currentDialog = npc;
        const dialogEl = document.getElementById('npcDialog');
        if (dialogEl) {
          document.getElementById('npcName').textContent = npc.name;
          document.getElementById('npcTitle').textContent = npc.title;
          document.getElementById('npcText').textContent = npc.dialog;
          const optionsEl = document.getElementById('npcOptions');
          optionsEl.innerHTML = '';
          const regBtn = document.createElement('div');
          regBtn.className = 'npc-option';
          regBtn.innerHTML = '<span>📋 Đăng Ký Tham Dự</span>';
          regBtn.addEventListener('click', () => {
            TournamentSystem.register(schedId);
            NPC.closeDialog();
            TournamentPanel.open();
          });
          optionsEl.appendChild(regBtn);
          const viewBtn = document.createElement('div');
          viewBtn.className = 'npc-option';
          viewBtn.innerHTML = '<span>🏆 Xem Giải Đấu</span>';
          viewBtn.addEventListener('click', () => {
            NPC.closeDialog();
            TournamentPanel.open();
          });
          optionsEl.appendChild(viewBtn);
          NPC.addCloseOption(optionsEl);
          dialogEl.classList.add('show');
        }
        return;
      }

      _origInteract(npc);
    };
  },

  // ─── Hook: Game.save / Game.load ─────────────────────────────
  _hookSaveLoad() {
    const _origSave = Game.save.bind(Game);
    Game.save = function() {
      _origSave();
      ReputationSystem.saveData();
      TournamentSystem.saveData();
    };

    const _origLoad = Game.load.bind(Game);
    Game.load = function() {
      const result = _origLoad();
      ReputationSystem.loadData();
      TournamentSystem.loadData();
      ReputationSystem._updateBuffs();
      return result;
    };
  },

  // ─── Main init ───────────────────────────────────────────────
  init() {
    // Inject HTML & styles
    this.injectHTML();
    this._injectStyles();
    this._bindEvents();

    // Load saved data
    ReputationSystem.loadData();
    TournamentSystem.loadData();

    // Apply buffs
    ReputationSystem._updateBuffs();
    Player.recalculateStats();

    // Spawn messenger if tournament is available
    TournamentSystem.checkSpawnMessenger();

    // Patch all systems
    this._hookGameInit();
    this._hookGameUpdate();
    this._hookRecalcStats();
    this._hookEnemiesKill();
    this._hookGainRealmExp();
    this._hookNPCBuyItem();
    this._hookNPCSpawnForMap();
    this._hookNPCInteract();
    this._hookSaveLoad();

    // Restore active tournament title display
    if (TournamentSystem.state.activeTitle) {
      TournamentSystem.setActiveTitle(TournamentSystem.state.activeTitle);
    }

    // Also restore ghost pvp title coexistence
    if (typeof GhostPvPSystem !== 'undefined' && GhostPvPSystem.state.activeTitle) {
      GhostPvPSystem.setActiveTitle(GhostPvPSystem.state.activeTitle);
    }

    console.log('🏛️ Reputation + Tournament loaded');
  }
};

// ============================================================
// HELPERS
// ============================================================

// Register faction emissary NPC types
function _registerFactionNPCTypes() {
  const defs = {
    kiemTong:  { icon: '⚔️', title: 'Thanh Vân Kiếm Tông', sprite: 'npcTeleporter', color: '#ef5350' },
    longToc:   { icon: '🐉', title: 'Long Tộc Liên Minh',  sprite: 'npcTeleporter', color: '#f0c040' },
    thuongHoi: { icon: '💰', title: 'Vạn Bảo Thương Hội',  sprite: 'npcShop',       color: '#ff9800' },
    daoMon:    { icon: '☯️', title: 'Huyền Thiên Đạo Môn', sprite: 'npcTeleporter', color: '#42a5f5' },
    maTong:    { icon: '👻', title: 'Ám Dạ Ma Tông',        sprite: 'npcTeleporter', color: '#9c27b0' }
  };
  for (const fid in defs) {
    const d = defs[fid];
    const f = REPUTATION_CONFIG.factions[fid];
    const q = ReputationSystem._factionQuests[fid];
    const questDesc = q && !q.active ? 'Ta có sứ mệnh cần ngươi thực hiện!' : (q && q.active ? 'Nhiệm vụ đang tiến hành...' : '');
    NPC.types[fid + 'Emissary'] = {
      name: d.icon + ' ' + f.name.split(' ').slice(-2).join(' ') + ' Sứ Giả',
      title: d.title,
      sprite: d.sprite,
      dialog: questDesc || f.desc,
      service: 'factionQuest_' + fid
    };
  }
}

// Open faction quest panel
function _openFactionQuestPanel(factionId, npc) {
  const f = REPUTATION_CONFIG.factions[factionId];
  const q = ReputationSystem._factionQuests[factionId];
  const tier = ReputationSystem.getTier(factionId);
  const overlay = document.getElementById('factionQuestOverlay');
  const content = document.getElementById('fqContent');
  const titleEl = document.getElementById('fqTitle');
  if (!overlay || !content) return;

  if (titleEl) titleEl.textContent = f.icon + ' ' + f.name;
  content.innerHTML = '';

  if (typeof GameState !== 'undefined') GameState.running = false;
  overlay.style.display = 'flex';

  // Faction rep info
  const repRow = document.createElement('div');
  repRow.style.cssText = 'font-size:10px;color:' + f.color + ';margin-bottom:10px;padding:6px 10px;background:rgba(255,255,255,0.04);border-radius:6px';
  repRow.textContent = '📊 Danh Vọng: ' + (ReputationSystem.state.reps[factionId] || 0) + ' — ' + tier.name;
  content.appendChild(repRow);

  // Quest section
  const questTitle = document.createElement('div');
  questTitle.style.cssText = 'font-size:10px;color:#f0c040;margin-bottom:8px;font-weight:bold';
  questTitle.textContent = '📜 Nhiệm Vụ Phái';
  content.appendChild(questTitle);

  if (q) {
    const questDesc = document.createElement('div');
    questDesc.style.cssText = 'font-size:9px;color:#aaa;margin-bottom:10px;line-height:1.5';
    switch (factionId) {
      case 'kiemTong':  questDesc.textContent = 'Tiêu diệt ' + q.needed + ' quái vật để chứng tỏ sức mạnh kiếm tu!'; break;
      case 'longToc':   questDesc.textContent = 'Tiêu diệt ' + q.needed + ' kẻ địch nguy hiểm để bảo vệ lãnh thổ Long Tộc!'; break;
      case 'thuongHoi': questDesc.textContent = 'Mua ' + q.needed + ' vật phẩm từ cửa hàng để thúc đẩy thương mại!'; break;
      case 'daoMon':    questDesc.textContent = 'Tu luyện tổng cộng ' + Math.floor(q.needed/1000) + ' giây để tịnh hóa tâm hồn!'; break;
      case 'maTong':    questDesc.textContent = 'Tiêu diệt ' + q.needed + ' kẻ địch trong ban đêm để cống hiến hắc linh!'; break;
    }
    content.appendChild(questDesc);

    // Progress
    const progress = _getFactionQuestProgress(factionId, q);
    const progEl = document.createElement('div');
    progEl.style.cssText = 'font-size:9px;color:#888;margin-bottom:8px';
    progEl.textContent = '📋 Tiến Độ: ' + progress;
    if (q.active) content.appendChild(progEl);

    // Reward preview
    const rewardEl = document.createElement('div');
    rewardEl.style.cssText = 'font-size:9px;color:#4caf50;margin-bottom:12px;padding:6px 8px;background:rgba(76,175,80,0.07);border-radius:5px';
    rewardEl.textContent = '🎁 Phần Thưởng: +' + q.reward.rep + ' Danh Vọng, +' + q.reward.gold + ' 💰, ' + q.reward.count + 'x vật phẩm';
    content.appendChild(rewardEl);

    // Buttons
    if (!q.active) {
      const acceptBtn = document.createElement('div');
      acceptBtn.className = 'npc-option';
      acceptBtn.innerHTML = '<span>✅ Nhận Nhiệm Vụ</span>';
      acceptBtn.style.borderColor = f.color;
      acceptBtn.addEventListener('click', () => {
        ReputationSystem.acceptFactionQuest(factionId);
        _openFactionQuestPanel(factionId, npc);
      });
      content.appendChild(acceptBtn);
    } else if (ReputationSystem.isFactionQuestComplete(factionId)) {
      const claimBtn = document.createElement('div');
      claimBtn.className = 'npc-option';
      claimBtn.innerHTML = '<span>🎁 Nhận Thưởng!</span>';
      claimBtn.style.borderColor = '#4caf50';
      claimBtn.addEventListener('click', () => {
        ReputationSystem.claimFactionQuest(factionId);
        _openFactionQuestPanel(factionId, npc);
      });
      content.appendChild(claimBtn);
    } else {
      const inProgressEl = document.createElement('div');
      inProgressEl.style.cssText = 'font-size:9px;color:#888;text-align:center;padding:8px';
      inProgressEl.textContent = '⏳ Đang thực hiện nhiệm vụ...';
      content.appendChild(inProgressEl);
    }
  }

  // Faction shop preview button
  if (tier.tier >= 2) {
    const shopBtn = document.createElement('div');
    shopBtn.className = 'npc-option';
    shopBtn.innerHTML = '<span>🛒 Cửa Hàng Phái</span>';
    shopBtn.addEventListener('click', () => {
      overlay.style.display = 'none';
      if (typeof GameState !== 'undefined') GameState.running = true;
      setTimeout(() => {
        ReputationPanel._currentFactionShop = factionId;
        ReputationPanel.open();
      }, 100);
    });
    content.appendChild(shopBtn);
  }

  const closeBtn = document.createElement('div');
  closeBtn.className = 'npc-option';
  closeBtn.innerHTML = '<span>👋 Tạm Biệt</span>';
  closeBtn.addEventListener('click', () => {
    overlay.style.display = 'none';
    if (typeof GameState !== 'undefined') GameState.running = true;
  });
  content.appendChild(closeBtn);
}

// Arena skill usage
function _arenaUseSkill(idx) {
  if (!TournamentSystem.state.inMatch || !TournamentSystem.state.matchData) return;
  const match = TournamentSystem.state.matchData;
  if (typeof Player === 'undefined' || typeof SKILLS === 'undefined') return;
  const skill = Player.skills && Player.skills[idx];
  if (!skill) return;
  if (skill.cd > 0) {
    if (typeof UI !== 'undefined') UI.addLog('⏳ Kỹ năng còn ' + Math.ceil(skill.cd/1000) + 's!', 'system');
    return;
  }
  if (Player.mp < (skill.mp || 0)) {
    if (typeof UI !== 'undefined') UI.addLog('💎 Không đủ MP!', 'system');
    return;
  }

  // Calculate damage
  let dmg = Math.floor(Player.atk * skill.dmgMul) - match.oppDef;
  // Apply skill dmg bonus from reputation
  dmg = Math.floor(dmg * (1 + (Player._repSkillDmg || 0)));
  // Apply overall damage bonus
  dmg = Math.floor(dmg * (1 + (Player._repDmgBonus || 0)));
  dmg = Math.max(1, dmg);

  const isCrit = typeof Utils !== 'undefined' && Utils.chance(Player.critRate || 0.08);
  if (isCrit) dmg = Math.floor(dmg * (Player.critDmg || 1.5));

  // MP cost reduction
  const mpCost = Math.floor((skill.mp || 0) * (1 - (Player._repMpCostRed || 0)));
  Player.mp = Math.max(0, Player.mp - mpCost);

  match.oppHp = Math.max(0, match.oppHp - dmg);
  skill.cd = skill.maxCd;

  TournamentArena.update(match);
  TournamentArena.spawnDmgNumber(dmg, isCrit, false);

  if (typeof UI !== 'undefined') {
    UI.addLog('⚔️ [' + skill.name + '] -' + dmg + (isCrit ? ' CRIT!' : ''), 'exp');
  }

  // Check win after skill
  if (match.oppHp <= 0) {
    TournamentSystem.onMatchWin(match.tournamentId);
  }
}

// ============================================================
// AUTO-INIT
// ============================================================
(function() {
  function tryInit() {
    if (
      typeof Game      !== 'undefined' &&
      typeof Player    !== 'undefined' &&
      typeof Enemies   !== 'undefined' &&
      typeof NPC       !== 'undefined' &&
      typeof Inventory !== 'undefined' &&
      typeof UI        !== 'undefined' &&
      typeof GameState !== 'undefined' &&
      typeof ITEMS     !== 'undefined' &&
      typeof SKILLS    !== 'undefined'
    ) {
      ReputationFeature.init();
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
