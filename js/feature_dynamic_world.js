// ==================== FEATURE: DYNAMIC WORLD ====================
// Sections: RandomModifiers | LuckSystem | AutoExpedition | UI & Init
// Load sau: feature_dungeon.js (optional guard), npc.js, game.js
// <script src="js/feature_dynamic_world.js"></script>

// ================================================================
// SECTION 1 — DATA & CONFIG
// ================================================================

const MODIFIER_CONFIG = {
  rerollItemId: 'mutationStone',

  positive: [
    { id:'divine_aid',      name:'Thiên Trợ',          icon:'✨',
      effect:{ dmgBonus:0.30 },         desc:'Damage +30%' },
    { id:'rich_spirit',     name:'Linh Khí Phong Phú',  icon:'💎',
      effect:{ mpRegenMul:3.0 },        desc:'MP regen x3' },
    { id:'divine_speed',    name:'Thần Tốc',             icon:'💨',
      effect:{ speedBonus:0.40 },       desc:'Speed +40%' },
    { id:'immortal_breath', name:'Bất Tử Khí',           icon:'💚',
      effect:{ hpRegenMul:5.0 },        desc:'HP regen x5' },
    { id:'fortune',         name:'Vận May',              icon:'🍀',
      effect:{ dropBonus:0.50 },        desc:'Drop rate +50%' },
    { id:'kill_streak',     name:'Sát Thần',             icon:'💥',
      effect:{ killStreakMul:2.0 },     desc:'Kill streak bonus x2' },
    { id:'all_lb',          name:'Phong Ấn Giải',        icon:'⚡',
      effect:{ allLBActive:true },      desc:'Tất cả LB active (nếu có)' },
    { id:'all_element',     name:'Thiên Địa Linh',       icon:'🌈',
      effect:{ allElementBonus:0.30 },  desc:'Tất cả element +30%' }
  ],

  negative: [
    { id:'sealed',       name:'Phong Ấn',    icon:'🔒',
      effect:{ onlySkill0:true },      desc:'Chỉ dùng được skill 0' },
    { id:'weakened',     name:'Suy Nhược',   icon:'💔',
      effect:{ maxHpPenalty:0.40 },    desc:'maxHP -40%' },
    { id:'blind',        name:'Mù Quáng',   icon:'🙈',
      effect:{ noMinimap:true },       desc:'Minimap tắt' },
    { id:'spirit_drain', name:'Linh Khí Cạn',icon:'⚫',
      effect:{ noMpRegen:true },       desc:'MP không hồi' },
    { id:'gravity',      name:'Trọng Lực',  icon:'⬇️',
      effect:{ speedPenalty:0.30 },    desc:'Speed -30%' },
    { id:'fragile',      name:'Hư Nhược',   icon:'🫀',
      effect:{ defPenalty:0.50 },      desc:'DEF -50%' },
    { id:'mana_hungry',  name:'Rút Cạn',    icon:'💸',
      effect:{ mpCostMul:2.0 },        desc:'Skill MP cost x2' },
    { id:'weakened_atk', name:'Yếu Đuối',   icon:'🪶',
      effect:{ dmgPenalty:0.30 },      desc:'Damage -30%' }
  ],

  neutral: [
    { id:'challenge',    name:'Thử Thách',   icon:'⚔️',
      effect:{ enemyHpMul:1.50, expMul:3.0 }, desc:'Quái HP+50%, EXP x3' },
    { id:'blood_fire',   name:'Máu Lửa',     icon:'🩸',
      effect:{ enemyAggressive:true, goldMul:2.0 }, desc:'Quái hung hăng, Gold x2' },
    { id:'random_elem',  name:'Ngẫu Nhiên',  icon:'🎲',
      effect:{ randomElementHit:true }, desc:'Mỗi đòn random element' },
    { id:'role_swap',    name:'Đổi Vai',     icon:'🔄',
      effect:{ swapAtkDef:true }, desc:'Player và quái hoán đổi ATK/DEF' },
    { id:'darkness',     name:'Bóng Tối',    icon:'🌑',
      effect:{ darkFog:true, enemyInvisible:true }, desc:'Map tối, quái invisible ngoài 100px' },
    { id:'explosion',    name:'Nổ Tung',     icon:'💣',
      effect:{ enemyDeathAoe:true }, desc:'Quái chết gây AOE 50px' }
  ]
};

const LUCK_CONFIG = {
  min: -100, max: 100, start: 0,
  decayRate: 1,
  decayInterval: 60000,

  events: {
    killElite:        +5,
    killChampion:     +15,
    killLegendary:    +30,
    helpNpc:          +10,
    openChestSafe:    +3,
    craftSuccess:     +5,
    openChestTrapped: -10,
    playerDeath:      -20,
    dungeonFail:      -15,
    killStreak10:     +8,
    blackMarket:      -25
  },

  icons: {
    high:     { min:50,   icon:'🌟', desc:'Đại Vận' },
    good:     { min:20,   icon:'⭐', desc:'Vận Tốt' },
    neutral:  { min:-20,  icon:'☁️', desc:'Bình Thường' },
    bad:      { min:-50,  icon:'⛈️', desc:'Vận Xấu' },
    terrible: { min:-100, icon:'💀', desc:'Đại Hung' }
  },

  effects: {
    dropRateMul:          function(luck) { return 1 + luck/200; },
    merchantPriceMul:     function(luck) { return 1 - luck/400; },
    legendaryChanceMul:   function(luck) { return luck > 50 ? 2.0 : 1.0; },
    modifierPositiveWeight:function(luck){ return Math.max(1, 1 + luck/50); }
  }
};

const EXPEDITION_CONFIG = {
  requireRealm: 2,
  maxExpeditions: 3,
  storageKey: 'tuxien_expedition',

  durations: [
    { hours:1, label:'1 giờ',   riskBase:0.05 },
    { hours:2, label:'2 giờ',   riskBase:0.10 },
    { hours:4, label:'4 giờ',   riskBase:0.20 },
    { hours:8, label:'8 giờ',   riskBase:0.35 }
  ],

  expPerHourPerLevel:  8,
  goldPerHourPerLevel: 3,

  mapMultipliers: [1.0, 1.5, 2.0, 2.5, 3.0, 4.0],

  strategies: [
    {
      id:'balanced',   name:'Cân Bằng',    icon:'⚖️',
      desc:'Thu hoạch đều. Rủi ro bình thường.',
      expMul:1.0, goldMul:1.0, riskMul:1.0, itemChance:0.20
    },
    {
      id:'aggressive', name:'Cường Công',  icon:'⚔️',
      desc:'EXP cao hơn, rủi ro cao hơn.',
      expMul:1.6, goldMul:0.8, riskMul:1.5, itemChance:0.25
    },
    {
      id:'cautious',   name:'Thận Trọng',  icon:'🛡️',
      desc:'Rủi ro thấp hơn, thu hoạch ít hơn.',
      expMul:0.7, goldMul:0.7, riskMul:0.5, itemChance:0.10
    },
    {
      id:'treasure',   name:'Săn Kho Báu', icon:'💎',
      desc:'Gold cao hơn, item tốt hơn. EXP thấp.',
      expMul:0.5, goldMul:2.0, riskMul:1.2, itemChance:0.40
    }
  ],

  itemPools: {
    low:  ['wolfFang','wolfPelt','hpPotion','mpPotion','spiritStone'],
    mid:  ['demonCore','spiritStone','realmPill','expPotion','hpPotionMedium'],
    high: ['dragonScale','celestialOrb','realmPill','flameSword','frostSword'],
    max:  ['celestialOrb','dragonScale','celestialJade','celestialSword','realmPill']
  }
};

// ================================================================
// SECTION 2 — MODIFIER SYSTEM
// ================================================================

var ModifierPrePanel = {
  _callback: null,

  show: function(modifiers, callback) {
    var panel = document.getElementById('modifierPrePanel');
    var cardsEl = document.getElementById('modifierCards');
    var rerollCountEl = document.getElementById('modRerollCount');
    var confirmBtn = document.getElementById('modConfirmBtn');
    if (!panel || !cardsEl) return;

    var typeLabels = ['✨ Bonus', '⚠️ Penalty', '⚖️ Neutral'];
    var typeColors = ['#4caf50', '#f44336', '#ff9800'];

    cardsEl.innerHTML = '';
    modifiers.forEach(function(mod, i) {
      var card = document.createElement('div');
      card.style.cssText = 'background:rgba(255,255,255,0.05);border:1px solid ' + typeColors[i] +
        ';border-radius:8px;padding:8px 12px;display:flex;justify-content:space-between;align-items:center;gap:8px';
      card.innerHTML =
        '<span style="font-size:11px;text-align:left">' +
          mod.icon + ' <b style="color:' + typeColors[i] + '">' + mod.name + '</b> — ' + mod.desc +
        '</span>' +
        '<button onclick="ModifierSystem.reroll(' + i + ')" style="flex-shrink:0;padding:3px 8px;' +
          'border:1px solid ' + typeColors[i] + ';background:rgba(0,0,0,0.3);border-radius:4px;' +
          'color:' + typeColors[i] + ';font-size:9px;cursor:pointer;font-family:inherit">🔄</button>';
      cardsEl.appendChild(card);
    });

    if (rerollCountEl) {
      rerollCountEl.textContent = Math.max(0, 2 - ModifierSystem.state.rerollsUsed);
    }

    ModifierPrePanel._callback = callback;
    panel.style.display = 'block';

    if (confirmBtn) {
      confirmBtn.onclick = function() {
        panel.style.display = 'none';
        if (ModifierPrePanel._callback) {
          ModifierPrePanel._callback(ModifierSystem.state.pendingModifiers);
        }
      };
    }
  },

  refresh: function(modifiers) {
    ModifierPrePanel.show(modifiers, ModifierPrePanel._callback);
  }
};

var ModifierSystem = {
  state: {
    currentModifiers: [],
    rerollsUsed: 0,
    sessionActive: false,
    pendingModifiers: null,
    _swappedStats: null
  },

  rollModifiers: function(luckScore) {
    var positiveWeight = LUCK_CONFIG.effects.modifierPositiveWeight(luckScore);

    var rollFrom = function(pool, weight) {
      // Higher weight = pick best of multiple rolls for positive pool
      if (weight > 1) {
        var rolls = Math.min(Math.ceil(weight), 3);
        var idx = 0;
        for (var r = 1; r < rolls; r++) {
          // For positive, prefer lower indices (weaker = safer re-roll heuristic)
          // Simple: just pick any random, weight is already a bias signal
          var candidate = Math.floor(Math.random() * pool.length);
          if (candidate < idx) idx = candidate; // bias toward front entries
        }
        return pool[Math.floor(Math.random() * pool.length)];
      }
      return pool[Math.floor(Math.random() * pool.length)];
    };

    var positive = rollFrom(MODIFIER_CONFIG.positive, positiveWeight);
    var negative = rollFrom(MODIFIER_CONFIG.negative, 1.0);
    var neutral  = rollFrom(MODIFIER_CONFIG.neutral,  1.0);
    return [positive, negative, neutral];
  },

  showPreDungeonPanel: function(modifiers, callback) {
    ModifierSystem.state.pendingModifiers = modifiers;
    ModifierPrePanel.show(modifiers, callback);
  },

  reroll: function(modifierIndex) {
    if (!Inventory.has(MODIFIER_CONFIG.rerollItemId, 1)) {
      UI.addLog('❌ Cần Biến Dị Thạch!', 'system');
      return false;
    }
    if (ModifierSystem.state.rerollsUsed >= 2) {
      UI.addLog('❌ Đã reroll tối đa 2 lần!', 'system');
      return false;
    }
    Inventory.remove(MODIFIER_CONFIG.rerollItemId, 1);
    ModifierSystem.state.rerollsUsed++;

    var sameType = modifierIndex === 0 ? MODIFIER_CONFIG.positive :
                   modifierIndex === 1 ? MODIFIER_CONFIG.negative :
                   MODIFIER_CONFIG.neutral;

    ModifierSystem.state.pendingModifiers[modifierIndex] =
      sameType[Math.floor(Math.random() * sameType.length)];

    ModifierPrePanel.refresh(ModifierSystem.state.pendingModifiers);
    UI.addLog('🔄 Đã reroll modifier! Còn ' + (2 - ModifierSystem.state.rerollsUsed) + ' lần.', 'system');
    return true;
  },

  applyModifiers: function(modifiers) {
    ModifierSystem.state.currentModifiers = modifiers;
    ModifierSystem.state.sessionActive = true;
    ModifierSystem.state.rerollsUsed = 0;

    modifiers.forEach(function(mod) {
      var e = mod.effect;

      if (e.maxHpPenalty !== undefined) {
        Player.maxHp = Math.floor(Player.maxHp * (1 - e.maxHpPenalty));
      }
      if (e.speedPenalty !== undefined) {
        Player.speed = Player.speed * (1 - e.speedPenalty);
      }
      if (e.speedBonus !== undefined) {
        Player.speed = Player.speed * (1 + e.speedBonus);
      }
      if (e.defPenalty !== undefined) {
        Player.def = Math.floor(Player.def * (1 - e.defPenalty));
      }
      if (e.enemyHpMul !== undefined) {
        Enemies.list.forEach(function(en) {
          en.hp    = Math.floor(en.hp    * e.enemyHpMul);
          en.maxHp = Math.floor(en.maxHp * e.enemyHpMul);
        });
      }
      if (e.swapAtkDef) {
        var total = 0, count = Enemies.list.length || 1;
        Enemies.list.forEach(function(en) { total += en.atk; });
        var avgAtk = total / count;
        ModifierSystem.state._swappedStats = {
          playerAtk: Player.atk,
          playerDef: Player.def
        };
        Player.atk = Math.floor(avgAtk * 0.8);
      }
      if (e.enemyAggressive) {
        Enemies.list.forEach(function(en) { en.aggroed = true; });
      }

      UI.addLog(mod.icon + ' Modifier: ' + mod.name + ' — ' + mod.desc, 'system');
    });

    Player.hp = Math.min(Player.hp, Player.maxHp);
    ModifierHUD.update();
  },

  clearModifiers: function() {
    ModifierSystem.state.sessionActive = false;

    if (ModifierSystem.state._swappedStats) {
      Player.atk = ModifierSystem.state._swappedStats.playerAtk;
      Player.def = ModifierSystem.state._swappedStats.playerDef;
      ModifierSystem.state._swappedStats = null;
    }

    ModifierSystem.state.currentModifiers = [];
    Player.recalculateStats();
    ModifierHUD.update();
  },

  hasEffect: function(effectKey) {
    return ModifierSystem.state.currentModifiers.some(function(m) {
      return m.effect[effectKey] !== undefined;
    });
  },

  getEffectValue: function(effectKey) {
    var mod = ModifierSystem.state.currentModifiers.find(function(m) {
      return m.effect[effectKey] !== undefined;
    });
    return mod ? mod.effect[effectKey] : null;
  }
};

// ================================================================
// SECTION 3 — LUCK SYSTEM
// ================================================================

var LuckSystem = {
  state: {
    score: 0,
    _decayTimer: 0
  },

  addLuck: function(amount) {
    LuckSystem.state.score = Utils.clamp(
      LuckSystem.state.score + amount,
      LUCK_CONFIG.min,
      LUCK_CONFIG.max
    );
    LuckSystem.updateLuckHUD();
  },

  getIcon: function() {
    var tiers = Object.values(LUCK_CONFIG.icons).sort(function(a, b) {
      return b.min - a.min;
    });
    for (var i = 0; i < tiers.length; i++) {
      if (LuckSystem.state.score >= tiers[i].min) return tiers[i];
    }
    return LUCK_CONFIG.icons.terrible;
  },

  update: function(dt) {
    LuckSystem.state._decayTimer += dt;
    while (LuckSystem.state._decayTimer >= LUCK_CONFIG.decayInterval) {
      LuckSystem.state._decayTimer -= LUCK_CONFIG.decayInterval;
      if (LuckSystem.state.score > 0) {
        LuckSystem.state.score = Math.max(0, LuckSystem.state.score - LUCK_CONFIG.decayRate);
      } else if (LuckSystem.state.score < 0) {
        LuckSystem.state.score = Math.min(0, LuckSystem.state.score + LUCK_CONFIG.decayRate);
      }
      LuckSystem.updateLuckHUD();
    }
  },

  getDropMul: function() {
    return LUCK_CONFIG.effects.dropRateMul(LuckSystem.state.score);
  },

  getMerchantPriceMul: function() {
    return LUCK_CONFIG.effects.merchantPriceMul(LuckSystem.state.score);
  },

  getLegendaryMul: function() {
    return LUCK_CONFIG.effects.legendaryChanceMul(LuckSystem.state.score);
  },

  updateLuckHUD: function() {
    var el = document.getElementById('luckIndicator');
    if (!el) return;
    var tier = LuckSystem.getIcon();
    el.textContent = tier.icon;
    el.title = tier.desc + ' (' + LuckSystem.state.score + ')';
  }
};

// ================================================================
// SECTION 4 — AUTO EXPEDITION SYSTEM
// ================================================================

var ExpeditionSystem = {
  state: {
    expeditions: [],
    completedToday: [],
    storageKey: EXPEDITION_CONFIG.storageKey
  },

  canSend: function() {
    return ExpeditionSystem.state.expeditions.length < EXPEDITION_CONFIG.maxExpeditions &&
           Player.realm >= EXPEDITION_CONFIG.requireRealm;
  },

  calculateRewards: function(mapIndex, durationHours, strategyId) {
    var strategy = EXPEDITION_CONFIG.strategies.find(function(s) { return s.id === strategyId; });
    if (!strategy) return { exp:0, gold:0, itemChance:0 };

    var mapMul = EXPEDITION_CONFIG.mapMultipliers[mapIndex] || 1.0;

    var sectBonus = 1.0;
    if (typeof SectSystem !== 'undefined' && SectSystem.state && SectSystem.state.founded) {
      var disciples = SectSystem.state.disciples ? SectSystem.state.disciples.length : 0;
      sectBonus = 1 + disciples * 0.05;
    }

    var luckMul = 1 + LuckSystem.state.score / 200;

    var baseExp  = Player.level * EXPEDITION_CONFIG.expPerHourPerLevel  * durationHours;
    var baseGold = Player.level * EXPEDITION_CONFIG.goldPerHourPerLevel * durationHours;

    return {
      exp:        Math.floor(baseExp  * mapMul * strategy.expMul  * sectBonus * luckMul),
      gold:       Math.floor(baseGold * mapMul * strategy.goldMul * sectBonus * luckMul),
      itemChance: strategy.itemChance * luckMul
    };
  },

  calculateRisk: function(mapIndex, durationHours, strategyId) {
    var strategy = EXPEDITION_CONFIG.strategies.find(function(s) { return s.id === strategyId; });
    var duration = EXPEDITION_CONFIG.durations.find(function(d) { return d.hours === durationHours; });
    if (!strategy || !duration) return 0.10;

    var risk = duration.riskBase * strategy.riskMul;

    var mapLvl = (Maps.data[mapIndex] && Maps.data[mapIndex].lvl) || 1;
    var levelDiff = mapLvl - Math.floor(Player.level / 2);
    if (levelDiff > 0) risk += levelDiff * 0.02;

    risk = risk * (1 - LuckSystem.state.score / 300);

    return Math.min(0.80, Math.max(0.01, risk));
  },

  sendExpedition: function(mapIndex, durationHours, strategyId) {
    if (!ExpeditionSystem.canSend()) {
      UI.addLog('❌ Không thể phái thêm phân thân!', 'system');
      return false;
    }

    var rewards  = ExpeditionSystem.calculateRewards(mapIndex, durationHours, strategyId);
    var risk     = ExpeditionSystem.calculateRisk(mapIndex, durationHours, strategyId);
    var strategy = EXPEDITION_CONFIG.strategies.find(function(s) { return s.id === strategyId; });
    var mapData  = Maps.data[mapIndex] || {};
    var mapName  = mapData.name || ('Bản đồ ' + mapIndex);

    var mapMul   = EXPEDITION_CONFIG.mapMultipliers[mapIndex] || 1.0;
    var itemPool = mapMul <= 1.5 ? 'low' : mapMul <= 2.5 ? 'mid' : mapMul <= 3.5 ? 'high' : 'max';

    var expedition = {
      id:           'exp_' + Date.now(),
      mapIndex:     mapIndex,
      strategyId:   strategyId,
      durationHours:durationHours,
      startTime:    Date.now(),
      endTime:      Date.now() + durationHours * 60 * 60 * 1000,
      riskPct:      risk,
      result:       null,
      expectedExp:  rewards.exp,
      expectedGold: rewards.gold,
      itemPool:     itemPool,
      itemChance:   rewards.itemChance,
      strategyName: strategy ? strategy.name : strategyId,
      mapName:      mapName
    };

    ExpeditionSystem.state.expeditions.push(expedition);
    ExpeditionSystem.saveData();

    UI.addLog('🗺️ Phân Thân lên đường đến ' + mapName +
      ' (' + durationHours + 'h, ' + expedition.strategyName + ')', 'system');

    ExpeditionHUD.updateBadge();
    return expedition;
  },

  checkCompletions: function() {
    var now = Date.now();
    for (var i = ExpeditionSystem.state.expeditions.length - 1; i >= 0; i--) {
      var exp = ExpeditionSystem.state.expeditions[i];
      if (now < exp.endTime) continue;

      var success = Math.random() > exp.riskPct;
      exp.result = success ? 'success' : 'failed';

      if (success) {
        ExpeditionSystem.state.completedToday.push(exp);
        UI.addLog('✅ Phân Thân trở về từ ' + exp.mapName + '!', 'item');
        UI.showNotification('🗺️ Phân Thân Trở Về!', exp.mapName + ' — Mở thám hiểm để nhận thưởng');
        ExpeditionHUD.updateBadge();
      } else {
        UI.addLog('💀 Phân Thân thất bại tại ' + exp.mapName + '...', 'system');
        LuckSystem.addLuck(LUCK_CONFIG.events.dungeonFail);
      }

      ExpeditionSystem.state.expeditions.splice(i, 1);
      ExpeditionSystem.saveData();
    }
  },

  claimReward: function(expeditionId) {
    var idx = ExpeditionSystem.state.completedToday.findIndex(function(e) {
      return e.id === expeditionId;
    });
    if (idx === -1) return false;

    var exp = ExpeditionSystem.state.completedToday[idx];

    Player.gainExp(exp.expectedExp);
    Player.gold += exp.expectedGold;
    UI.updateGold();

    if (Utils.chance(exp.itemChance)) {
      var pool = EXPEDITION_CONFIG.itemPools[exp.itemPool];
      var item = pool[Math.floor(Math.random() * pool.length)];
      Inventory.add(item, 1);
      var itemName = (ITEMS[item] && ITEMS[item].name) ? ITEMS[item].name : item;
      UI.addLog('📦 Phân Thân mang về: ' + itemName, 'item');
    }

    UI.addLog('💰 Nhận thưởng thám hiểm: +' + exp.expectedExp + ' EXP, +' +
      exp.expectedGold + ' 💰', 'exp');

    ExpeditionSystem.state.completedToday.splice(idx, 1);
    ExpeditionSystem.saveData();
    ExpeditionHUD.updateBadge();
    return true;
  },

  update: function(dt) {
    ExpeditionSystem.checkCompletions();
  },

  saveData: function() {
    try {
      var data = {
        expeditions:    ExpeditionSystem.state.expeditions.map(function(e) { return Object.assign({}, e); }),
        completedToday: ExpeditionSystem.state.completedToday
      };
      localStorage.setItem(EXPEDITION_CONFIG.storageKey, JSON.stringify(data));
    } catch(e) { console.error('ExpeditionSystem.saveData error:', e); }
  },

  loadData: function() {
    try {
      var raw = localStorage.getItem(EXPEDITION_CONFIG.storageKey);
      if (!raw) return;
      var data = JSON.parse(raw);
      ExpeditionSystem.state.expeditions    = data.expeditions    || [];
      ExpeditionSystem.state.completedToday = data.completedToday || [];
      // Check expeditions completed while offline
      ExpeditionSystem.checkCompletions();
    } catch(e) { console.error('ExpeditionSystem.loadData error:', e); }
  }
};

// ================================================================
// SECTION 5 — UI COMPONENTS
// ================================================================

// ---- Modifier Active HUD ----
var ModifierHUD = {
  update: function() {
    var el = document.getElementById('modifierActiveHUD');
    if (!el) return;

    if (!ModifierSystem.state.sessionActive || ModifierSystem.state.currentModifiers.length === 0) {
      el.style.display = 'none';
      return;
    }

    el.style.display = 'block';
    var icons = ModifierSystem.state.currentModifiers.map(function(m) { return m.icon; }).join(' ');
    var tooltip = ModifierSystem.state.currentModifiers.map(function(m) {
      return m.icon + ' ' + m.name + ': ' + m.desc;
    }).join('\n');

    el.textContent = icons;
    el.title = tooltip;
  }
};

// ---- Expedition HUD badge ----
var ExpeditionHUD = {
  updateBadge: function() {
    var badge = document.getElementById('expeditionBadge');
    if (!badge) return;
    var count = ExpeditionSystem.state.completedToday.length;
    if (count > 0) {
      badge.textContent = count;
      badge.style.display = 'block';
    } else {
      badge.style.display = 'none';
    }
  }
};

// ---- Expedition Panel ----
var ExpeditionPanel = {
  _selectedMap:      0,
  _selectedDuration: 1,
  _selectedStrategy: 'balanced',

  open: function() {
    var overlay = document.getElementById('expeditionOverlay');
    if (!overlay) return;
    overlay.style.display = 'flex';
    ExpeditionPanel.render();
  },

  close: function() {
    var overlay = document.getElementById('expeditionOverlay');
    if (overlay) overlay.style.display = 'none';
  },

  formatTime: function(ms) {
    if (ms <= 0) return 'Hoàn tất';
    var s = Math.floor(ms / 1000);
    var m = Math.floor(s / 60);
    var h = Math.floor(m / 60);
    m = m % 60;
    s = s % 60;
    if (h > 0) return h + 'g ' + m + 'p';
    if (m > 0) return m + 'p ' + s + 'g';
    return s + 'g';
  },

  render: function() {
    var active    = document.getElementById('activeExpeditions');
    var completed = document.getElementById('completedExpeditions');
    var form      = document.getElementById('sendExpeditionForm');
    if (!active || !completed || !form) return;

    var now = Date.now();

    // --- Active ---
    if (ExpeditionSystem.state.expeditions.length === 0) {
      active.innerHTML = '<div style="color:#666;font-size:11px;text-align:center;padding:8px">Không có phân thân đang thám hiểm</div>';
    } else {
      var html = '<div style="color:#f0c040;font-size:11px;font-weight:bold;margin-bottom:6px">🗺️ Đang thám hiểm (' + ExpeditionSystem.state.expeditions.length + '/3)</div>';
      ExpeditionSystem.state.expeditions.forEach(function(exp) {
        var elapsed   = now - exp.startTime;
        var total     = exp.endTime - exp.startTime;
        var pct       = Math.min(100, Math.floor((elapsed / total) * 100));
        var remaining = exp.endTime - now;

        html += '<div style="background:rgba(255,255,255,0.05);border:1px solid #444;border-radius:8px;padding:10px;margin-bottom:6px">' +
          '<div style="display:flex;justify-content:space-between;margin-bottom:4px">' +
            '<span style="font-size:11px;color:#fff"><b>' + exp.mapName + '</b> — ' + exp.strategyName + '</span>' +
            '<span style="font-size:10px;color:#ff9800">' + ExpeditionPanel.formatTime(remaining) + '</span>' +
          '</div>' +
          '<div style="font-size:9px;color:#888;margin-bottom:6px">' +
            '+' + exp.expectedExp + ' EXP | +' + exp.expectedGold + ' 💰 | Rủi ro: ' + Math.round(exp.riskPct * 100) + '%' +
          '</div>' +
          '<div style="background:#222;border-radius:4px;height:5px">' +
            '<div style="background:#7c4dff;height:5px;border-radius:4px;width:' + pct + '%"></div>' +
          '</div>' +
        '</div>';
      });
      active.innerHTML = html;
    }

    // --- Completed ---
    if (ExpeditionSystem.state.completedToday.length === 0) {
      completed.innerHTML = '';
    } else {
      var chtml = '<div style="color:#4caf50;font-size:11px;font-weight:bold;margin-bottom:6px">🎁 Phân Thân trở về!</div>';
      ExpeditionSystem.state.completedToday.forEach(function(exp) {
        chtml += '<div style="background:rgba(76,175,80,0.1);border:1px solid #4caf50;border-radius:8px;padding:10px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center">' +
          '<div>' +
            '<div style="font-size:11px;color:#fff"><b>' + exp.mapName + '</b></div>' +
            '<div style="font-size:9px;color:#888">+' + exp.expectedExp + ' EXP | +' + exp.expectedGold + ' 💰</div>' +
          '</div>' +
          '<button onclick="ExpeditionSystem.claimReward(\'' + exp.id + '\');ExpeditionPanel.render();" ' +
            'style="padding:6px 12px;border:1px solid #4caf50;background:rgba(76,175,80,0.2);' +
            'border-radius:6px;color:#4caf50;font-size:10px;cursor:pointer;font-family:inherit">Thu Hoạch</button>' +
        '</div>';
      });
      completed.innerHTML = chtml;
    }

    // --- Send Form ---
    if (!ExpeditionSystem.canSend()) {
      var reason = Player.realm < EXPEDITION_CONFIG.requireRealm
        ? '🔒 Yêu cầu Kim Đan Kỳ để dùng phân thân'
        : '⚠️ Đã đạt tối đa 3 phân thân';
      form.innerHTML = '<div style="color:#666;font-size:11px;text-align:center;padding:8px">' + reason + '</div>';
      return;
    }

    // Map selector
    var mapOpts = '';
    Maps.data.forEach(function(map, i) {
      var unlocked = Player.level >= map.lvl;
      if (unlocked) {
        mapOpts += '<option value="' + i + '"' + (ExpeditionPanel._selectedMap === i ? ' selected' : '') + '>' +
          map.name + ' (Lv.' + map.lvl + ', x' + EXPEDITION_CONFIG.mapMultipliers[i] + ')</option>';
      }
    });

    // Duration selector
    var durOpts = '';
    EXPEDITION_CONFIG.durations.forEach(function(d) {
      durOpts += '<option value="' + d.hours + '"' + (ExpeditionPanel._selectedDuration === d.hours ? ' selected' : '') + '>' +
        d.label + ' (rủi ro ' + Math.round(d.riskBase * 100) + '%)</option>';
    });

    // Strategy buttons
    var stratHtml = '<div style="display:flex;gap:6px;flex-wrap:wrap;margin:8px 0">';
    EXPEDITION_CONFIG.strategies.forEach(function(s) {
      var active2 = ExpeditionPanel._selectedStrategy === s.id;
      stratHtml += '<button onclick="ExpeditionPanel._selectedStrategy=\'' + s.id + '\';ExpeditionPanel.render();" ' +
        'title="' + s.desc + '" ' +
        'style="flex:1;min-width:70px;padding:6px 4px;border-radius:6px;cursor:pointer;font-family:inherit;font-size:9px;font-weight:bold;' +
        'border:2px solid ' + (active2 ? '#f0c040' : '#444') + ';' +
        'background:' + (active2 ? 'rgba(240,192,64,0.2)' : 'rgba(255,255,255,0.03)') + ';' +
        'color:' + (active2 ? '#f0c040' : '#888') + '">' +
        s.icon + ' ' + s.name + '</button>';
    });
    stratHtml += '</div>';

    // Preview
    var preview = ExpeditionSystem.calculateRewards(
      ExpeditionPanel._selectedMap,
      ExpeditionPanel._selectedDuration,
      ExpeditionPanel._selectedStrategy
    );
    var previewRisk = ExpeditionSystem.calculateRisk(
      ExpeditionPanel._selectedMap,
      ExpeditionPanel._selectedDuration,
      ExpeditionPanel._selectedStrategy
    );

    var fhtml =
      '<div style="color:#f0c040;font-size:11px;font-weight:bold;margin-bottom:8px">📤 Phái Phân Thân</div>' +
      '<div style="margin-bottom:8px">' +
        '<div style="color:#888;font-size:9px;margin-bottom:3px">Bản đồ</div>' +
        '<select id="expMapSel" onchange="ExpeditionPanel._selectedMap=parseInt(this.value);ExpeditionPanel.render();" ' +
          'style="width:100%;padding:6px;background:#1a1a2e;border:1px solid #444;border-radius:6px;color:#fff;font-family:inherit;font-size:11px">' +
          mapOpts +
        '</select>' +
      '</div>' +
      '<div style="margin-bottom:8px">' +
        '<div style="color:#888;font-size:9px;margin-bottom:3px">Thời gian</div>' +
        '<select id="expDurSel" onchange="ExpeditionPanel._selectedDuration=parseInt(this.value);ExpeditionPanel.render();" ' +
          'style="width:100%;padding:6px;background:#1a1a2e;border:1px solid #444;border-radius:6px;color:#fff;font-family:inherit;font-size:11px">' +
          durOpts +
        '</select>' +
      '</div>' +
      '<div style="color:#888;font-size:9px;margin-bottom:3px">Chiến lược</div>' +
      stratHtml +
      '<div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:10px;margin:8px 0;font-size:10px">' +
        '<div style="color:#4caf50">📊 Dự kiến: +' + preview.exp + ' EXP | +' + preview.gold + ' 💰</div>' +
        '<div style="color:#ff9800">⚠️ Rủi ro: ' + Math.round(previewRisk * 100) + '% | 🎁 Item: ' + Math.round(preview.itemChance * 100) + '%</div>' +
      '</div>' +
      '<button onclick="ExpeditionPanel.doSend();" ' +
        'style="width:100%;padding:10px;border:2px solid #7c4dff;background:rgba(124,77,255,0.2);' +
        'border-radius:8px;color:#7c4dff;font-size:12px;font-weight:bold;cursor:pointer;font-family:inherit">' +
        '📤 Phái Đi</button>';

    form.innerHTML = fhtml;
  },

  doSend: function() {
    var result = ExpeditionSystem.sendExpedition(
      ExpeditionPanel._selectedMap,
      ExpeditionPanel._selectedDuration,
      ExpeditionPanel._selectedStrategy
    );
    if (result) {
      ExpeditionPanel.render();
    }
  }
};

// ================================================================
// SECTION 6 — HTML INJECTION
// ================================================================

var DynamicWorldFeature = {
  _htmlInjected: false,

  injectHTML: function() {
    if (DynamicWorldFeature._htmlInjected) return;
    DynamicWorldFeature._htmlInjected = true;

    // ---- Luck Indicator ----
    var luckEl = document.createElement('span');
    luckEl.id = 'luckIndicator';
    luckEl.title = 'Vận Khí';
    luckEl.textContent = '☁️';
    luckEl.style.cssText =
      'position:fixed;top:10px;left:350px;z-index:20;font-size:16px;' +
      'cursor:help;text-shadow:0 0 6px rgba(0,0,0,0.8)';
    document.body.appendChild(luckEl);

    // ---- Modifier Active HUD ----
    var modHud = document.createElement('div');
    modHud.id = 'modifierActiveHUD';
    modHud.style.cssText =
      'display:none;position:fixed;bottom:80px;left:50%;transform:translateX(-50%);' +
      'z-index:25;background:rgba(0,0,0,0.7);border:1px solid #7c4dff;' +
      'border-radius:20px;padding:4px 14px;font-size:18px;cursor:pointer;' +
      'letter-spacing:4px';
    modHud.title = 'Modifiers đang active';
    document.body.appendChild(modHud);

    // ---- Expedition Badge (attach to map button area) ----
    var expBadge = document.createElement('div');
    expBadge.id = 'expeditionBadge';
    expBadge.style.cssText =
      'display:none;position:fixed;top:52px;right:8px;z-index:30;' +
      'background:#f44336;color:#fff;border-radius:50%;width:16px;height:16px;' +
      'font-size:9px;font-weight:bold;text-align:center;line-height:16px';
    document.body.appendChild(expBadge);

    // ---- Modifier Pre-Panel ----
    var modPanel = document.createElement('div');
    modPanel.id = 'modifierPrePanel';
    modPanel.style.cssText =
      'display:none;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);' +
      'background:linear-gradient(135deg,#1a1a2e,#16213e);' +
      'border:3px solid #7c4dff;border-radius:15px;padding:20px;min-width:320px;' +
      'z-index:160;text-align:center;font-family:\'Courier New\',monospace;color:#fff';
    modPanel.innerHTML =
      '<div style="color:#7c4dff;font-size:16px;font-weight:bold;margin-bottom:12px">🎲 Modifier Bí Cảnh</div>' +
      '<div id="modifierCards" style="display:flex;flex-direction:column;gap:8px;margin-bottom:15px"></div>' +
      '<div style="color:#666;font-size:9px;margin-bottom:10px">' +
        '💠 Còn <span id="modRerollCount">2</span> lần reroll (tốn Biến Dị Thạch x1)' +
      '</div>' +
      '<button id="modConfirmBtn" style="width:100%;padding:10px;border:2px solid #4caf50;' +
        'background:rgba(76,175,80,0.2);border-radius:8px;color:#4caf50;font-size:12px;' +
        'font-weight:bold;cursor:pointer;font-family:inherit">▶ Vào Bí Cảnh</button>';
    document.body.appendChild(modPanel);

    // ---- Expedition Overlay ----
    var expOverlay = document.createElement('div');
    expOverlay.id = 'expeditionOverlay';
    expOverlay.style.cssText =
      'display:none;position:fixed;inset:0;z-index:110;background:rgba(0,0,0,0.6);' +
      'align-items:center;justify-content:center;font-family:\'Courier New\',monospace';
    expOverlay.innerHTML =
      '<div style="background:linear-gradient(135deg,#1a1a2e,#16213e);border:2px solid #7c4dff;' +
        'border-radius:15px;padding:20px;max-width:420px;width:90%;max-height:85vh;' +
        'overflow-y:auto;color:#fff;position:relative">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">' +
          '<div style="color:#7c4dff;font-size:15px;font-weight:bold">🗺️ Thám Hiểm Tự Động</div>' +
          '<button id="expClose" onclick="ExpeditionPanel.close();" ' +
            'style="background:none;border:none;color:#888;font-size:18px;cursor:pointer;' +
            'font-family:inherit;padding:0 4px">✕</button>' +
        '</div>' +
        '<div id="activeExpeditions"    style="margin-bottom:10px"></div>' +
        '<div id="completedExpeditions" style="margin-bottom:10px"></div>' +
        '<div id="sendExpeditionForm"></div>' +
      '</div>';
    document.body.appendChild(expOverlay);

    // ---- Styles ----
    var style = document.createElement('style');
    style.textContent =
      '#luckIndicator:hover{transform:scale(1.3);}' +
      '#modifierActiveHUD:hover{background:rgba(0,0,0,0.9);}' +
      '#expeditionOverlay::-webkit-scrollbar{width:4px}' +
      '#expeditionOverlay::-webkit-scrollbar-thumb{background:#7c4dff;border-radius:2px}';
    document.head.appendChild(style);
  },

  // ================================================================
  // SECTION 7 — HOOKS & INIT
  // ================================================================

  _hooksApplied: false,

  applyHooks: function() {
    if (DynamicWorldFeature._hooksApplied) return;
    DynamicWorldFeature._hooksApplied = true;

    // ---- Hook: Game.update → Luck decay + Expedition check + ModifierHUD ----
    var _origGameUpdate = Game.update.bind(Game);
    Game.update = function(dt) {
      _origGameUpdate(dt);
      LuckSystem.update(dt);
      ExpeditionSystem.update(dt);
      if (ModifierSystem.state.sessionActive) {
        ModifierHUD.update();
      }
    };

    // ---- Hook: Game.save → persist luck + expedition ----
    var _origGameSave = Game.save.bind(Game);
    Game.save = function() {
      _origGameSave();
      try {
        var extra = JSON.parse(localStorage.getItem('tuxien_save') || '{}');
        extra.dynamicWorld = { luck: LuckSystem.state.score };
        localStorage.setItem('tuxien_save', JSON.stringify(extra));
      } catch(e) {}
      ExpeditionSystem.saveData();
    };

    // ---- Hook: Game.load → restore luck ----
    var _origGameLoad = Game.load.bind(Game);
    Game.load = function() {
      var result = _origGameLoad();
      try {
        var raw = localStorage.getItem('tuxien_save');
        if (raw) {
          var data = JSON.parse(raw);
          if (data.dynamicWorld) {
            LuckSystem.state.score = data.dynamicWorld.luck || 0;
            LuckSystem.updateLuckHUD();
          }
        }
      } catch(e) {}
      ExpeditionSystem.loadData();
      return result;
    };

    // ---- Hook: Enemies.kill → luck tracking + modifier effects ----
    var _origKill = Enemies.kill.bind(Enemies);
    Enemies.kill = function(enemy) {
      // Modifier: expMul
      if (ModifierSystem.hasEffect('expMul')) {
        enemy.exp = Math.floor(enemy.exp * ModifierSystem.getEffectValue('expMul'));
      }
      // Modifier: goldMul
      if (ModifierSystem.hasEffect('goldMul')) {
        enemy.gold = Math.floor(enemy.gold * ModifierSystem.getEffectValue('goldMul'));
      }
      // Luck: drop rate
      var dropMul = LuckSystem.getDropMul();
      if (dropMul !== 1.0 && enemy.drops) {
        enemy.drops = enemy.drops.map(function(d) {
          return Object.assign({}, d, { chance: Math.min(1, d.chance * dropMul) });
        });
      }

      _origKill(enemy);

      // Luck: variant tracking
      if (enemy._variant === 'elite')     LuckSystem.addLuck(LUCK_CONFIG.events.killElite);
      if (enemy._variant === 'champion')  LuckSystem.addLuck(LUCK_CONFIG.events.killChampion);
      if (enemy._variant === 'legendary') LuckSystem.addLuck(LUCK_CONFIG.events.killLegendary);

      // Modifier: enemyDeathAoe
      if (ModifierSystem.hasEffect('enemyDeathAoe')) {
        var dist = Utils.dist(Player.x, Player.y, enemy.x, enemy.y);
        if (dist <= 50) {
          var aoeDmg = Math.floor(enemy.atk * 0.3);
          // Direct damage to avoid recursive Enemies.damage call
          var actualAoe = Math.max(1, aoeDmg - Player.def);
          Player.hp -= actualAoe;
          Game.spawnDamageNumber(Player.x, Player.y - 30, actualAoe, '#ff9800');
          UI.addLog('💣 Nổ Tung gây ' + actualAoe + ' sát thương!', 'damage');
          if (Player.hp <= 0) {
            Player.hp = 0;
            Player.die();
          }
        }
      }
    };

    // ---- Hook: Enemies.damage → modifier dmgBonus / dmgPenalty ----
    var _origDamage = Enemies.damage.bind(Enemies);
    Enemies.damage = function(enemy, amount, isCrit, color) {
      var finalAmount = amount;
      if (ModifierSystem.hasEffect('dmgBonus')) {
        finalAmount = Math.floor(finalAmount * (1 + ModifierSystem.getEffectValue('dmgBonus')));
      }
      if (ModifierSystem.hasEffect('dmgPenalty')) {
        finalAmount = Math.floor(finalAmount * (1 - ModifierSystem.getEffectValue('dmgPenalty')));
      }
      _origDamage(enemy, finalAmount, isCrit, color);
    };

    // ---- Hook: Player.useSkill → onlySkill0 + mpCostMul ----
    var _origUseSkill = Player.useSkill.bind(Player);
    Player.useSkill = function(idx) {
      if (ModifierSystem.hasEffect('onlySkill0') && idx !== 0) {
        UI.addLog('🔒 Phong Ấn! Chỉ dùng được kỹ năng đầu tiên!', 'system');
        return false;
      }
      if (ModifierSystem.hasEffect('mpCostMul')) {
        var skill = Player.skills && Player.skills[idx];
        if (skill) {
          var mul = ModifierSystem.getEffectValue('mpCostMul');
          var extraMp = Math.floor(skill.mp * (mul - 1));
          if (Player.mp < skill.mp + extraMp) {
            UI.addLog('⚡ Không đủ linh lực! (Rút Cạn x' + mul + ')', 'system');
            return false;
          }
          var result = _origUseSkill(idx);
          if (result) Player.mp = Math.max(0, Player.mp - extraMp);
          return result;
        }
      }
      return _origUseSkill(idx);
    };

    // ---- Hook: Player.die → luck penalty ----
    var _origDie = Player.die.bind(Player);
    Player.die = function() {
      LuckSystem.addLuck(LUCK_CONFIG.events.playerDeath);
      _origDie();
      if (ModifierSystem.state.sessionActive) {
        ModifierSystem.clearModifiers();
      }
    };

    // ---- Hook: NPC.spawnForMap → expedition master ----
    var _origSpawnForMap = NPC.spawnForMap.bind(NPC);
    NPC.spawnForMap = function(mapIndex) {
      _origSpawnForMap(mapIndex);
      // Spawn expedition master at fixed position per map
      var xPos = 600 + (mapIndex * 20);
      var yPos = 320;
      NPC.spawn('expeditionMaster', xPos, yPos);
    };

    // ---- Hook: NPC.interact → expedition service ----
    var _origInteract = NPC.interact.bind(NPC);
    NPC.interact = function(npc) {
      if (npc && npc.service === 'expedition') {
        NPC.currentDialog = npc;
        ExpeditionPanel.open();
        UI.addLog('🗺️ Nói chuyện với ' + npc.name, 'npc');
        return;
      }
      _origInteract(npc);
    };

    // ---- Hook: DungeonSystem (guard) ----
    if (typeof DungeonSystem !== 'undefined') {
      var _origDungeonEnter = DungeonSystem.enter.bind(DungeonSystem);
      DungeonSystem.enter = function(grade) {
        var luckScore = LuckSystem.state.score;
        var modifiers = ModifierSystem.rollModifiers(luckScore);
        GameState.running = false;
        ModifierSystem.showPreDungeonPanel(modifiers, function(confirmedMods) {
          GameState.running = true;
          _origDungeonEnter(grade);
          ModifierSystem.applyModifiers(confirmedMods);
        });
      };

      var _origDungeonExit = DungeonSystem.exit.bind(DungeonSystem);
      DungeonSystem.exit = function(success) {
        if (!success) {
          LuckSystem.addLuck(LUCK_CONFIG.events.dungeonFail);
        }
        ModifierSystem.clearModifiers();
        _origDungeonExit(success);
      };
    }

    // ---- Hook: KarmaSystem black market (guard) ----
    if (typeof KarmaSystem !== 'undefined' && KarmaSystem.onBlackMarket) {
      var _origKarmaBM = KarmaSystem.onBlackMarket.bind(KarmaSystem);
      KarmaSystem.onBlackMarket = function() {
        LuckSystem.addLuck(LUCK_CONFIG.events.blackMarket);
        _origKarmaBM();
      };
    }
  },

  init: function() {
    // Register mutationStone item
    if (typeof ITEMS !== 'undefined') {
      ITEMS.mutationStone = {
        name:'Biến Dị Thạch', type:'consumable', rarity:'rare',
        desc:'Reroll 1 modifier khi vào Bí Cảnh.',
        effect:{ rerollModifier:true }, sellPrice:150
      };
    }

    // Register expedition master NPC type
    if (typeof NPC !== 'undefined') {
      NPC.types.expeditionMaster = {
        name:'🗺️ Thám Hiểm Trưởng',
        title:'Điều phối phân thân',
        sprite:'npcShop',
        dialog:'Phân Thân của ngươi sẵn sàng lên đường. Ta sẽ chỉ huy họ!',
        service:'expedition'
      };
    }

    DynamicWorldFeature.injectHTML();
    DynamicWorldFeature.applyHooks();

    // Load saved luck + expedition data
    try {
      var raw = localStorage.getItem('tuxien_save');
      if (raw) {
        var data = JSON.parse(raw);
        if (data.dynamicWorld) {
          LuckSystem.state.score = data.dynamicWorld.luck || 0;
        }
      }
    } catch(e) {}

    LuckSystem.updateLuckHUD();
    ExpeditionSystem.loadData();
    ExpeditionHUD.updateBadge();

    console.log('🎲 Dynamic World loaded (Modifiers + Luck + Expedition)');
  }
};

// ================================================================
// AUTO-INIT — wrap Game.init
// ================================================================
(function() {
  var _origGameInit = Game.init.bind(Game);
  Game.init = function() {
    _origGameInit();
    DynamicWorldFeature.init();
  };
})();
