// ==================== FEATURE: TREASURE WEAPON ====================
// WeaponMemory + TreasureRefinement System
// Load sau: game.js, ui.js, inventory.js, player.js, enemies.js, npc.js

// ==================== SECTION 1: DATA & CONFIG ====================

const WEAPON_MEMORY_CONFIG = {
  milestones: [
    { kills: 10,   tier: 1, name: 'Sơ Thức',     color: '#ffffff',
      statBonus: {},                                          desc: 'Vũ khí bắt đầu thức tỉnh...' },
    { kills: 100,  tier: 2, name: 'Tỉnh Thức',   color: '#42a5f5',
      statBonus: { atk: 5 },                                desc: 'Vũ khí nhận ra chủ nhân.' },
    { kills: 500,  tier: 3, name: 'Giác Ngộ',    color: '#f0c040',
      statBonus: { atk: 15 },                               desc: 'Ký ức chiến đấu được khắc vào.' },
    { kills: 1000, tier: 4, name: 'Cổ Thần',     color: '#f44336',
      statBonus: { atk: 30, critRate: 0.05 },              desc: 'Thần ý thức tỉnh hoàn toàn.' },
    { kills: 5000, tier: 5, name: 'Thần Khí Hóa', color: '#e040fb',
      statBonus: { atk: 60, critRate: 0.10, critDmg: 0.30 }, desc: 'Đã thành Thần Khí!' }
  ],

  passives: {
    weapon:    { id: 'weaponPassive',    critRateBonus: 0.05,
                 desc: '+5% crit rate khi Giác Ngộ' },
    armor:     { id: 'armorPassive',     dmgReduceAtLowHp: 0.15,
                 desc: '-15% damage nhận khi HP<30%' },
    accessory: { id: 'accessoryPassive', expBonusPct: 0.10,
                 desc: '+10% EXP khi kill' }
  },

  namePool: [
    'Tuyết Hận','Huyết Khát','Vô Danh','Thiên Sát','Hắc Linh',
    'Băng Phách','Lôi Ẩn','Viêm Hồn','Phong Dạ','Diệt Kiếm',
    'Vong Ngã','Trường Dạ','Hư Vô','Hủy Diệt','Cuồng Sát',
    'Lãnh Nguyệt','Huyết Nguyệt','Thiên Địa','Khai Sơn','Phá Thiên',
    'Đoạn Hồn','Vô Cực','Hỗn Độn','Tịch Diệt','Nghịch Thiên',
    'Liệt Phong','Hàn Sương','Tử Thần','Quỷ Kiếm','Tiên Mộng'
  ],

  sellWarningThreshold: 2
};

const TREASURE_REFINEMENT_CONFIG = {
  furnaces: {
    pham: {
      id: 'phamLo', name: 'Phàm Lò', tier: 1, color: '#9e9e9e',
      statRetainRange: [0.60, 0.75],
      traitSlots: 1,
      upgradeCost: { gold: 500, items: [{ id: 'demonCore', count: 3 }] }
    },
    linh: {
      id: 'linhLo', name: 'Linh Lò', tier: 2, color: '#4caf50',
      statRetainRange: [0.75, 0.88],
      traitSlots: 2,
      upgradeCost: { gold: 1500, items: [{ id: 'dragonScale', count: 2 }] }
    },
    tien: {
      id: 'tienLo', name: 'Tiên Lò', tier: 3, color: '#f0c040',
      statRetainRange: [0.88, 0.96],
      traitSlots: 3,
      upgradeCost: null
    }
  },

  grades: {
    thuong:  { id: 'thuong',  name: 'Thường',     color: '#9e9e9e', aura: false,             traitCount: 1 },
    linh:    { id: 'linh',    name: 'Linh',        color: '#4caf50', aura: true,  auraColor: '#4caf50', traitCount: 2 },
    thien:   { id: 'thien',   name: 'Thiên',       color: '#f0c040', aura: true,  auraColor: '#f0c040', traitCount: 3 },
    voThuong:{ id: 'voThuong',name: 'Vô Thượng',  color: '#e040fb', aura: true,  auraColor: '#e040fb', traitCount: 3 }
  },

  gradeFormula(itemCount, furnaceTier) {
    const roll = Math.random();
    if (furnaceTier === 3 && itemCount >= 3) {
      if (roll < 0.05) return 'voThuong';
      if (roll < 0.30) return 'thien';
      if (roll < 0.70) return 'linh';
      return 'thuong';
    }
    if (furnaceTier >= 2 && itemCount >= 2) {
      if (roll < 0.15) return 'thien';
      if (roll < 0.50) return 'linh';
      return 'thuong';
    }
    if (roll < 0.05) return 'linh';
    return 'thuong';
  },

  traits: [
    { id: 'fireRune',    name: 'Hỏa Văn',          color: '#ff4500',
      desc: 'Mỗi 5 hit: burst +50% ATK 1 đòn' },
    { id: 'iceRune',     name: 'Băng Văn',          color: '#00bcd4',
      desc: '20% hit: slow enemy 1s' },
    { id: 'thunderRune', name: 'Lôi Văn',           color: '#ffeb3b',
      desc: 'Crit → chain lightning 30% dmg sang target kế' },
    { id: 'lifeRune',    name: 'Sinh Văn',          color: '#4caf50',
      desc: 'Kill → hồi 2% HP' },
    { id: 'shadowRune',  name: 'Ám Văn',            color: '#4a148c',
      desc: '+10% dmg khi HP < 50%' },
    { id: 'windRune',    name: 'Phong Văn',         color: '#69f0ae',
      desc: '+0.3 speed' },
    { id: 'soulRune',    name: 'Hồn Văn',           color: '#e040fb',
      desc: '+5 MP/kill' },
    { id: 'goldRune',    name: 'Kim Văn',           color: '#f0c040',
      desc: '+20% gold drop' },
    { id: 'dualElement', name: 'Băng Hỏa Song Sinh', color: '#ff6f00',
      desc: 'Mỗi 5 hit: burst tự chọn Ice hoặc Fire element',
      requireBothElements: true },
    { id: 'voidRune',    name: 'Hư Vô Văn',        color: '#7c4dff',
      desc: '5% instant kill quái thường khi hit' }
  ],

  failReward: { id: 'tanLinh', count: 1 },

  tanLinhItem: {
    id: 'tanLinh', name: 'Tàn Linh', type: 'material', rarity: 'rare',
    desc: 'Phần tinh hoa còn lại sau khi tinh luyện thất bại. Dùng để reroll trait Pháp Bảo.',
    sellPrice: 100
  },

  phaoBaoSlot: 'phaoBao',

  evolutionCost(currentEvo) {
    return {
      gold: 500 * Math.pow(2, currentEvo),
      tanLinh: currentEvo + 1,
      statBonus: 0.15
    };
  }
};


// ==================== SECTION 2: WEAPON MEMORY SYSTEM ====================

const WeaponMemory = (() => {
  const state = {
    killCounts:      {},
    customNames:     {},
    tierReached:     {},
    passiveUnlocked: {},
    _lastWeaponId:   null
  };

  function getMemory(itemId) {
    return {
      kills:      state.killCounts[itemId]  || 0,
      tier:       state.tierReached[itemId] || 0,
      customName: state.customNames[itemId] || null
    };
  }

  function getCurrentTier(kills) {
    const ms = WEAPON_MEMORY_CONFIG.milestones;
    for (let i = ms.length - 1; i >= 0; i--) {
      if (kills >= ms[i].kills) return ms[i];
    }
    return null;
  }

  function checkMilestone(slot, itemId) {
    const kills    = state.killCounts[itemId];
    const tier     = getCurrentTier(kills);
    if (!tier) return;

    const prevTier = state.tierReached[itemId] || 0;
    if (tier.tier <= prevTier) return;

    state.tierReached[itemId] = tier.tier;

    // Assign custom name at tier 2
    if (tier.tier === 2 && !state.customNames[itemId]) {
      const pool   = WEAPON_MEMORY_CONFIG.namePool;
      const base   = ITEMS[itemId]?.name || itemId;
      const prefix = pool[Math.floor(Math.random() * pool.length)];
      state.customNames[itemId] = prefix + ' ' + base;
      UI.addLog('⚔️ ' + base + ' → "' + state.customNames[itemId] + '"!', 'realm');
    }

    // Unlock passive at tier 3
    if (tier.tier === 3 && !state.passiveUnlocked[itemId]) {
      state.passiveUnlocked[itemId] = true;
      const itemData   = ITEMS[itemId];
      const passiveKey = itemData?.type;
      const passive    = WEAPON_MEMORY_CONFIG.passives[passiveKey];
      if (passive) {
        UI.addLog('✨ Passive unlock: ' + passive.desc, 'realm');
      }
    }

    Player.recalculateStats();
    const displayName = state.customNames[itemId] || ITEMS[itemId]?.name || itemId;
    UI.showNotification('⚔️ ' + displayName + ' — ' + tier.name + '!', tier.desc);
  }

  function onKill(enemy) {
    for (const slot of ['weapon', 'armor', 'accessory']) {
      const itemId = Player.equipped[slot];
      if (!itemId) continue;
      state.killCounts[itemId] = (state.killCounts[itemId] || 0) + 1;
      checkMilestone(slot, itemId);
    }
  }

  function getStatBonus(itemId) {
    const tier = getCurrentTier(state.killCounts[itemId] || 0);
    return tier?.statBonus || {};
  }

  function getPassiveForSlot(slot) {
    const itemId = Player.equipped[slot];
    if (!itemId) return null;
    if (!state.passiveUnlocked[itemId]) return null;
    const itemType = ITEMS[itemId]?.type;
    return WEAPON_MEMORY_CONFIG.passives[itemType] || null;
  }

  function applyToStats(player) {
    // Memory bonuses per equipped slot
    for (const slot of ['weapon', 'armor', 'accessory']) {
      const itemId = player.equipped[slot];
      if (!itemId) continue;
      const bonus = getStatBonus(itemId);
      if (bonus.atk)     player.atk      += bonus.atk;
      if (bonus.critRate) player.critRate += bonus.critRate;
      if (bonus.critDmg)  player.critDmg  += bonus.critDmg;
      if (bonus.def)      player.def      += bonus.def;
      if (bonus.hp) {
        player.maxHp += bonus.hp;
        player.hp = Math.min(player.hp, player.maxHp);
      }
    }

    // Pháp Bảo stats
    if (player.equipped && player.equipped.phaoBao) {
      const pb = TreasureRefinement.getState().phaoBao;
      if (pb && pb.stats) {
        player.atk      += pb.stats.atk      || 0;
        player.def      += pb.stats.def      || 0;
        player.maxHp    += pb.stats.hp        || 0;
        player.maxMp    += pb.stats.mp        || 0;
        player.critRate += pb.stats.critRate  || 0;
        player.critDmg  += pb.stats.critDmg  || 0;
        player.speed    += pb.stats.speed     || 0;
        // windRune passive
        if (pb.traits && pb.traits.some(t => t.id === 'windRune')) {
          player.speed += 0.3;
        }
        // shadowRune passive (atk boost when HP low applied at combat time)
        // weaponPassive critRate
        if (pb.traits && pb.traits.some(t => t.id === 'thunderRune')) {
          // handled in damage hook
        }
        player.hp = Math.min(player.hp, player.maxHp);
        player.mp = Math.min(player.mp, player.maxMp);
      }
    }
  }

  function renderAura(ctx) {
    const weaponId = Player.equipped && Player.equipped.weapon;
    if (!weaponId) return;
    const tier = getCurrentTier(state.killCounts[weaponId] || 0);
    if (!tier || tier.tier < 1) return;

    const cx = Player.x - GameState.camera.x;
    const cy = Player.y - 10 - GameState.camera.y;
    const pulse = 0.2 + Math.sin(GameState.time / 300) * 0.1;

    ctx.save();
    ctx.globalAlpha = pulse;
    ctx.strokeStyle = tier.color;
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 18 + tier.tier * 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Tier 4-5: extra glow particles
    if (tier.tier >= 4 && Math.random() < 0.05) {
      const a = Math.random() * Math.PI * 2;
      GameState.particles.push({
        x:    Player.x + Math.cos(a) * 20,
        y:    Player.y + Math.sin(a) * 20,
        vx:   Math.cos(a) * 0.5,
        vy:   -1,
        life: 600,
        color: tier.color,
        size:  2 + Math.random() * 2
      });
    }
  }

  function renderHUDBadge(itemId) {
    const mem  = getMemory(itemId);
    if (!mem.kills) return '';
    const tier = getCurrentTier(mem.kills);
    if (!tier) return '';
    return '<span style="color:' + tier.color + '">⚔️ ' + tier.name +
           ' (' + mem.kills + ' kills)</span>' +
           (mem.customName
             ? '<br><span style="color:#aaa;font-style:italic">' + mem.customName + '</span>'
             : '');
  }

  function getSaveData() {
    return {
      killCounts:      state.killCounts,
      customNames:     state.customNames,
      tierReached:     state.tierReached,
      passiveUnlocked: state.passiveUnlocked
    };
  }

  function loadSaveData(data) {
    if (!data) return;
    if (data.killCounts)      Object.assign(state.killCounts,      data.killCounts);
    if (data.customNames)     Object.assign(state.customNames,     data.customNames);
    if (data.tierReached)     Object.assign(state.tierReached,     data.tierReached);
    if (data.passiveUnlocked) Object.assign(state.passiveUnlocked, data.passiveUnlocked);
  }

  return {
    state,
    getMemory,
    getCurrentTier,
    onKill,
    getStatBonus,
    getPassiveForSlot,
    applyToStats,
    renderAura,
    renderHUDBadge,
    getSaveData,
    loadSaveData
  };
})();


// ==================== SECTION 3: TREASURE REFINEMENT SYSTEM ====================

const TreasureRefinement = (() => {
  const state = {
    furnaceLevel:  1,
    selectedItems: [],
    phaoBao:       null,
    previewStats:  null,
    tanLinhCount:  0
  };

  function getState() { return state; }

  function getFurnace() {
    const tiers = ['pham', 'linh', 'tien'];
    return TREASURE_REFINEMENT_CONFIG.furnaces[tiers[state.furnaceLevel - 1]];
  }

  function previewRefine(itemIds) {
    if (!itemIds || itemIds.length < 2) return null;
    const furnace         = getFurnace();
    const [rMin, rMax]    = furnace.statRetainRange;
    const retain          = (rMin + rMax) / 2;

    const combined = { atk: 0, def: 0, hp: 0, mp: 0, critRate: 0, critDmg: 0, speed: 0 };
    itemIds.forEach(id => {
      const item = ITEMS[id];
      if (!item?.stats) return;
      Object.keys(combined).forEach(k => {
        combined[k] += (item.stats[k] || 0) * retain;
      });
    });

    return {
      stats: Object.fromEntries(Object.entries(combined).map(([k, v]) => [k, Math.floor(v)])),
      retainPct: Math.round(retain * 100)
    };
  }

  function getAvailableTraits(itemIds) {
    const pool = [...TREASURE_REFINEMENT_CONFIG.traits];
    const hasFireItem = itemIds.some(id => ITEMS[id]?.icon?.includes('fire') || id === 'flameSword');
    const hasIceItem  = itemIds.some(id => ITEMS[id]?.icon?.includes('ice')  || id === 'frostSword');
    if (!hasFireItem || !hasIceItem) {
      return pool.filter(t => !t.requireBothElements);
    }
    return pool;
  }

  function refine(itemIds) {
    if (!itemIds || itemIds.length < 2 || itemIds.length > 3) return false;

    for (const id of itemIds) {
      if (!Inventory.has(id, 1)) {
        UI.addLog('❌ Không đủ vật phẩm!', 'system');
        return false;
      }
    }

    // 30% fail
    if (Math.random() < 0.30) {
      Inventory.add('tanLinh', 1);
      state.tanLinhCount++;
      UI.showNotification('⚗️ Tinh Luyện Thất Bại!', 'Nhận được Tàn Linh × 1');
      UI.addLog('⚗️ Tinh luyện thất bại. Nhận Tàn Linh x1.', 'system');
      return false;
    }

    // Remove items
    itemIds.forEach(id => Inventory.remove(id, 1));

    // Stats with random retain
    const furnace      = getFurnace();
    const [rMin, rMax] = furnace.statRetainRange;
    const retain       = rMin + Math.random() * (rMax - rMin);

    const combined = { atk: 0, def: 0, hp: 0, mp: 0, critRate: 0, critDmg: 0, speed: 0 };
    itemIds.forEach(id => {
      const item = ITEMS[id];
      if (!item?.stats) return;
      Object.keys(combined).forEach(k => {
        combined[k] += (item.stats[k] || 0) * retain;
      });
    });
    const finalStats = Object.fromEntries(
      Object.entries(combined).map(([k, v]) => [k, Math.round(v * 10) / 10])
    );

    // Grade
    const grade     = TREASURE_REFINEMENT_CONFIG.gradeFormula(itemIds.length, state.furnaceLevel);
    const gradeData = TREASURE_REFINEMENT_CONFIG.grades[grade];

    // Traits
    const traitPool     = getAvailableTraits(itemIds);
    const selectedTraits = [];
    for (let i = 0; i < gradeData.traitCount && traitPool.length > 0; i++) {
      const idx = Math.floor(Math.random() * traitPool.length);
      selectedTraits.push(traitPool.splice(idx, 1)[0]);
    }

    state.phaoBao = {
      stats:    finalStats,
      traits:   selectedTraits,
      grade,
      evoLevel: 0,
      name:     gradeData.name + ' Pháp Bảo'
    };

    // Mark equipped (4th slot)
    Player.equipped.phaoBao = 'phaoBao';
    Player.recalculateStats();

    UI.showNotification('⚗️ Pháp Bảo Tạo Thành!', '[' + gradeData.name + '] ' + state.phaoBao.name);
    UI.addLog('⚗️ Pháp Bảo [' + gradeData.name + '] với ' + selectedTraits.length + ' trait!', 'realm');
    return true;
  }

  function rerollTrait(traitIndex) {
    if (!state.phaoBao) return false;
    if (!Inventory.has('tanLinh', 1)) {
      UI.addLog('❌ Cần Tàn Linh!', 'system');
      return false;
    }
    Inventory.remove('tanLinh', 1);
    const pool = TREASURE_REFINEMENT_CONFIG.traits.filter(t =>
      !state.phaoBao.traits.some(existing => existing.id === t.id)
    );
    if (pool.length === 0) return false;
    state.phaoBao.traits[traitIndex] = pool[Math.floor(Math.random() * pool.length)];
    UI.addLog('⚗️ Trait đã được reroll!', 'item');
    return true;
  }

  function evolve() {
    if (!state.phaoBao) return false;
    const evo = TREASURE_REFINEMENT_CONFIG.evolutionCost(state.phaoBao.evoLevel);

    if (Player.gold < evo.gold) {
      UI.addLog('❌ Không đủ vàng! Cần ' + evo.gold, 'system');
      return false;
    }
    if (!Inventory.has('tanLinh', evo.tanLinh)) {
      UI.addLog('❌ Cần Tàn Linh × ' + evo.tanLinh, 'system');
      return false;
    }

    Player.gold -= evo.gold;
    Inventory.remove('tanLinh', evo.tanLinh);
    state.phaoBao.evoLevel++;

    Object.keys(state.phaoBao.stats).forEach(k => {
      state.phaoBao.stats[k] *= (1 + evo.statBonus);
      state.phaoBao.stats[k]  = Math.round(state.phaoBao.stats[k] * 10) / 10;
    });

    Player.recalculateStats();
    UI.updateGold();
    UI.showNotification('⚗️ Pháp Bảo Tiến Hóa!', 'Lần ' + state.phaoBao.evoLevel + ' — Tất cả stats +15%');
    return true;
  }

  function upgradeFurnace() {
    if (state.furnaceLevel >= 3) {
      UI.addLog('Lò đã max tier!', 'system');
      return false;
    }
    const tiers    = ['pham', 'linh', 'tien'];
    const nextKey  = tiers[state.furnaceLevel];
    const nextTier = TREASURE_REFINEMENT_CONFIG.furnaces[nextKey];
    const cost     = nextTier.upgradeCost;

    if (Player.gold < cost.gold) {
      UI.addLog('❌ Không đủ vàng!', 'system');
      return false;
    }
    for (const req of (cost.items || [])) {
      if (!Inventory.has(req.id, req.count)) {
        UI.addLog('❌ Thiếu ' + (ITEMS[req.id]?.name || req.id) + ' × ' + req.count, 'system');
        return false;
      }
    }

    Player.gold -= cost.gold;
    (cost.items || []).forEach(req => Inventory.remove(req.id, req.count));
    state.furnaceLevel++;
    UI.updateGold();
    UI.showNotification('⚗️ Nâng Cấp Lò!', nextTier.name + ' mở khóa!');
    return true;
  }

  function getSaveData() {
    return {
      furnaceLevel: state.furnaceLevel,
      phaoBao:      state.phaoBao,
      tanLinhCount: state.tanLinhCount
    };
  }

  function loadSaveData(data) {
    if (!data) return;
    if (data.furnaceLevel != null) state.furnaceLevel = data.furnaceLevel;
    if (data.phaoBao      != null) state.phaoBao      = data.phaoBao;
    if (data.tanLinhCount != null) state.tanLinhCount  = data.tanLinhCount;
    if (state.phaoBao) Player.equipped.phaoBao = 'phaoBao';
  }

  return {
    getState,
    getFurnace,
    previewRefine,
    getAvailableTraits,
    refine,
    rerollTrait,
    evolve,
    upgradeFurnace,
    getSaveData,
    loadSaveData
  };
})();


// ==================== SECTION 4: UI ====================

const RefinementPanel = (() => {
  let currentTab = 'refine';

  function injectHTML() {
    if (document.getElementById('refinementOverlay')) return;

    const overlay = document.createElement('div');
    overlay.id    = 'refinementOverlay';
    overlay.style.cssText = [
      'display:none',
      'position:fixed',
      'inset:0',
      'background:rgba(0,0,0,0.75)',
      'z-index:110',
      'align-items:center',
      'justify-content:center'
    ].join(';');

    overlay.innerHTML = `
      <div style="
        background:#1a1a2e;
        border:2px solid #f0c040;
        border-radius:12px;
        padding:16px;
        max-width:400px;
        width:92%;
        max-height:85vh;
        overflow-y:auto;
        font-family:'Courier New',monospace;
        color:#e0e0e0;
      ">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <span style="color:#f0c040;font-size:14px;font-weight:bold">⚗️ Tinh Luyện Pháp Bảo</span>
          <span id="refClose" style="cursor:pointer;color:#aaa;font-size:18px;padding:0 4px">✕</span>
        </div>

        <div id="refFurnaceInfo" style="
          background:rgba(255,255,255,0.05);
          border-radius:8px;
          padding:8px 12px;
          margin-bottom:12px;
          display:flex;
          justify-content:space-between;
          align-items:center;
          font-size:11px;
        "></div>

        <div style="display:flex;gap:6px;margin-bottom:12px" id="refTabRow">
          <button class="ref-tab active" data-tab="refine"  style="flex:1;padding:8px;border-radius:8px;border:2px solid #f0c040;background:rgba(240,192,64,0.15);color:#f0c040;font-family:inherit;font-size:10px;cursor:pointer">⚗️ Tinh Luyện</button>
          <button class="ref-tab"        data-tab="phaobao" style="flex:1;padding:8px;border-radius:8px;border:2px solid #444;background:transparent;color:#888;font-family:inherit;font-size:10px;cursor:pointer">💎 Pháp Bảo</button>
          <button class="ref-tab"        data-tab="evolve"  style="flex:1;padding:8px;border-radius:8px;border:2px solid #444;background:transparent;color:#888;font-family:inherit;font-size:10px;cursor:pointer">✨ Tiến Hóa</button>
        </div>

        <div id="refContent"></div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Close button
    document.getElementById('refClose').addEventListener('click', close);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

    // Tabs
    overlay.querySelectorAll('.ref-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        currentTab = btn.dataset.tab;
        overlay.querySelectorAll('.ref-tab').forEach(b => {
          const isActive = b.dataset.tab === currentTab;
          b.style.borderColor  = isActive ? '#f0c040' : '#444';
          b.style.background   = isActive ? 'rgba(240,192,64,0.15)' : 'transparent';
          b.style.color        = isActive ? '#f0c040' : '#888';
        });
        renderContent();
      });
    });
  }

  function renderFurnaceInfo() {
    const el      = document.getElementById('refFurnaceInfo');
    if (!el) return;
    const furnace = TreasureRefinement.getFurnace();
    const trc     = TREASURE_REFINEMENT_CONFIG;
    const state   = TreasureRefinement.getState();

    el.innerHTML = `
      <span style="color:${furnace.color}">🔥 ${furnace.name}</span>
      <span style="color:#888">Tier ${state.furnaceLevel}/3</span>
      ${state.furnaceLevel < 3
        ? `<button id="refUpgradeFurnaceBtn" style="
            padding:4px 8px;
            border-radius:6px;
            border:1px solid #f0c040;
            background:rgba(240,192,64,0.1);
            color:#f0c040;
            font-family:inherit;
            font-size:10px;
            cursor:pointer
          ">⬆ Nâng Cấp</button>`
        : '<span style="color:#e040fb">★ MAX</span>'
      }
    `;
    const upBtn = document.getElementById('refUpgradeFurnaceBtn');
    if (upBtn) {
      const next = ['pham','linh','tien'][state.furnaceLevel];
      const cost = trc.furnaces[next]?.upgradeCost;
      if (cost) {
        upBtn.title = `${cost.gold} vàng + ${cost.items?.map(i => ITEMS[i.id]?.name + '×' + i.count).join(', ')}`;
      }
      upBtn.addEventListener('click', () => {
        TreasureRefinement.upgradeFurnace();
        renderFurnaceInfo();
      });
    }
  }

  function renderContent() {
    const el = document.getElementById('refContent');
    if (!el) return;
    el.innerHTML = '';

    if (currentTab === 'refine')  renderTabRefine(el);
    if (currentTab === 'phaobao') renderTabPhaoBao(el);
    if (currentTab === 'evolve')  renderTabEvolve(el);
  }

  function renderTabRefine(el) {
    const state   = TreasureRefinement.getState();
    const furnace = TreasureRefinement.getFurnace();

    // Success rate info
    const info = document.createElement('div');
    info.style.cssText = 'color:#aaa;font-size:10px;margin-bottom:10px;background:rgba(255,165,0,0.1);border-radius:6px;padding:8px;border:1px solid rgba(255,165,0,0.3)';
    info.innerHTML = `⚡ Tỷ lệ thành công: <span style="color:#4caf50;font-weight:bold">70%</span> &nbsp;|&nbsp; Retain: <b style="color:${furnace.color}">${Math.round(furnace.statRetainRange[0]*100)}–${Math.round(furnace.statRetainRange[1]*100)}%</b> &nbsp;|&nbsp; Trait slots: <b>${furnace.traitSlots}</b>`;
    el.appendChild(info);

    // Item selection grid (equippable items only)
    const label = document.createElement('div');
    label.style.cssText = 'color:#f0c040;font-size:11px;margin-bottom:8px;font-weight:bold';
    label.textContent   = '📦 Chọn 2–3 trang bị để nấu:';
    el.appendChild(label);

    const grid = document.createElement('div');
    grid.id    = 'refItemGrid';
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:10px';
    el.appendChild(grid);

    const equipTypes = ['weapon', 'armor', 'accessory'];
    const equipItems = Inventory.items.filter(i => {
      const data = ITEMS[i.id];
      return data && equipTypes.includes(data.type);
    });

    if (equipItems.length === 0) {
      const empty = document.createElement('div');
      empty.style.cssText = 'color:#666;font-size:10px;grid-column:1/-1;padding:12px;text-align:center';
      empty.textContent   = 'Không có trang bị trong túi đồ';
      grid.appendChild(empty);
    } else {
      equipItems.forEach(item => {
        const itemData = ITEMS[item.id];
        const isSelected = state.selectedItems.includes(item.id);
        const slot = document.createElement('div');
        slot.style.cssText = `
          padding:6px;
          border-radius:6px;
          border:2px solid ${isSelected ? '#f0c040' : '#444'};
          background:${isSelected ? 'rgba(240,192,64,0.15)' : 'rgba(255,255,255,0.03)'};
          cursor:pointer;
          font-size:9px;
          text-align:center;
          transition:all 0.15s;
        `;
        slot.innerHTML = `<div style="color:${itemData.rarity === 'legendary' ? '#f0c040' : itemData.rarity === 'epic' ? '#e040fb' : itemData.rarity === 'rare' ? '#42a5f5' : '#ccc'};font-weight:bold;margin-bottom:2px">${itemData.name}</div><div style="color:#666">${itemData.type === 'weapon' ? '⚔️' : itemData.type === 'armor' ? '🛡️' : '💍'}</div>`;
        slot.addEventListener('click', () => {
          const idx = state.selectedItems.indexOf(item.id);
          if (idx >= 0) {
            state.selectedItems.splice(idx, 1);
          } else if (state.selectedItems.length < 3) {
            state.selectedItems.push(item.id);
          }
          renderContent();
        });
        grid.appendChild(slot);
      });
    }

    // Preview
    if (state.selectedItems.length >= 2) {
      const preview = TreasureRefinement.previewRefine(state.selectedItems);
      if (preview) {
        const pvDiv = document.createElement('div');
        pvDiv.style.cssText = 'background:rgba(66,165,245,0.1);border:1px solid #42a5f5;border-radius:8px;padding:8px;margin-bottom:10px;font-size:10px';
        let statsHtml = Object.entries(preview.stats)
          .filter(([, v]) => v > 0)
          .map(([k, v]) => `<span style="color:#aaa">${k.toUpperCase()}</span>: <b style="color:#e0e0e0">+${v}</b>`)
          .join('  ');
        pvDiv.innerHTML = `<div style="color:#42a5f5;font-weight:bold;margin-bottom:4px">📊 Dự kiến (Retain ~${preview.retainPct}%)</div><div>${statsHtml || '—'}</div>`;
        el.appendChild(pvDiv);
      }
    }

    // Buttons
    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;gap:8px';

    const refineBtn = document.createElement('button');
    refineBtn.textContent = '⚗️ Bắt Đầu Tinh Luyện';
    refineBtn.style.cssText = `
      flex:1;padding:10px;border-radius:8px;
      border:2px solid ${state.selectedItems.length >= 2 ? '#f0c040' : '#444'};
      background:${state.selectedItems.length >= 2 ? 'rgba(240,192,64,0.2)' : 'transparent'};
      color:${state.selectedItems.length >= 2 ? '#f0c040' : '#555'};
      font-family:inherit;font-size:11px;font-weight:bold;cursor:pointer;
    `;
    refineBtn.disabled = state.selectedItems.length < 2;
    refineBtn.addEventListener('click', () => {
      if (state.selectedItems.length < 2) return;
      const ok = TreasureRefinement.refine([...state.selectedItems]);
      state.selectedItems = [];
      if (ok) {
        currentTab = 'phaobao';
        document.querySelectorAll('.ref-tab').forEach(b => {
          const isActive = b.dataset.tab === 'phaobao';
          b.style.borderColor = isActive ? '#f0c040' : '#444';
          b.style.background  = isActive ? 'rgba(240,192,64,0.15)' : 'transparent';
          b.style.color       = isActive ? '#f0c040' : '#888';
        });
      }
      renderContent();
      Inventory.render();
    });
    btnRow.appendChild(refineBtn);
    el.appendChild(btnRow);
  }

  function renderTabPhaoBao(el) {
    const state   = TreasureRefinement.getState();
    const pb      = state.phaoBao;

    if (!pb) {
      const empty = document.createElement('div');
      empty.style.cssText = 'color:#666;text-align:center;padding:20px;font-size:11px';
      empty.textContent   = '💎 Chưa có Pháp Bảo. Hãy Tinh Luyện!';
      el.appendChild(empty);
      return;
    }

    const gradeData = TREASURE_REFINEMENT_CONFIG.grades[pb.grade];

    // Header
    const header = document.createElement('div');
    header.style.cssText = `background:rgba(255,255,255,0.05);border:2px solid ${gradeData.color};border-radius:10px;padding:12px;margin-bottom:10px;text-align:center`;
    header.innerHTML = `
      <div style="color:${gradeData.color};font-size:16px;font-weight:bold">💎 ${pb.name}</div>
      <div style="color:#aaa;font-size:10px;margin-top:4px">[${gradeData.name}]${pb.evoLevel > 0 ? ' · Tiến Hóa Lần ' + pb.evoLevel : ''}</div>
    `;
    el.appendChild(header);

    // Stats
    const statsDiv = document.createElement('div');
    statsDiv.style.cssText = 'background:rgba(255,255,255,0.04);border-radius:8px;padding:10px;margin-bottom:10px;font-size:10px';
    const statNames = { atk:'⚔️ ATK', def:'🛡️ DEF', hp:'❤️ HP', mp:'💎 MP', critRate:'💥 Crit', critDmg:'🔥 CritDmg', speed:'💨 Speed' };
    let statsHtml = '<div style="color:#f0c040;font-weight:bold;margin-bottom:6px">📊 Thuộc Tính</div>';
    Object.entries(pb.stats).forEach(([k, v]) => {
      if (!v) return;
      const displayVal = (k === 'critRate' || k === 'critDmg') ? `+${(v * 100).toFixed(1)}%` : `+${v.toFixed(1)}`;
      statsHtml += `<div style="display:flex;justify-content:space-between;padding:2px 0"><span style="color:#aaa">${statNames[k] || k}</span><span style="color:#e0e0e0">${displayVal}</span></div>`;
    });
    statsDiv.innerHTML = statsHtml;
    el.appendChild(statsDiv);

    // Traits
    if (pb.traits && pb.traits.length > 0) {
      const traitsDiv = document.createElement('div');
      traitsDiv.style.cssText = 'background:rgba(255,255,255,0.04);border-radius:8px;padding:10px;margin-bottom:10px;font-size:10px';
      let traitsHtml = '<div style="color:#f0c040;font-weight:bold;margin-bottom:6px">✨ Pháp Văn</div>';
      pb.traits.forEach((trait, idx) => {
        const tanLinhCount = Inventory.getCount('tanLinh');
        traitsHtml += `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.05)">
            <div>
              <span style="color:${trait.color};font-weight:bold">${trait.name}</span>
              <div style="color:#777;font-size:9px;margin-top:2px">${trait.desc}</div>
            </div>
            <button data-reroll="${idx}" style="
              padding:3px 6px;border-radius:4px;border:1px solid #888;
              background:rgba(255,255,255,0.05);color:#aaa;font-family:inherit;
              font-size:9px;cursor:pointer;white-space:nowrap;flex-shrink:0;margin-left:6px
            ">🔄 (${tanLinhCount} TL)</button>
          </div>
        `;
      });
      traitsDiv.innerHTML = traitsHtml;
      traitsDiv.querySelectorAll('[data-reroll]').forEach(btn => {
        btn.addEventListener('click', () => {
          const traitIdx = parseInt(btn.dataset.reroll);
          if (TreasureRefinement.rerollTrait(traitIdx)) {
            renderContent();
            Inventory.render();
          }
        });
      });
      el.appendChild(traitsDiv);
    }
  }

  function renderTabEvolve(el) {
    const state = TreasureRefinement.getState();
    const pb    = state.phaoBao;

    if (!pb) {
      const empty = document.createElement('div');
      empty.style.cssText = 'color:#666;text-align:center;padding:20px;font-size:11px';
      empty.textContent   = '💎 Cần có Pháp Bảo trước.';
      el.appendChild(empty);
      return;
    }

    const evo       = TREASURE_REFINEMENT_CONFIG.evolutionCost(pb.evoLevel);
    const hasGold   = Player.gold >= evo.gold;
    const hasTL     = Inventory.has('tanLinh', evo.tanLinh);
    const canEvolve = hasGold && hasTL;
    const tlCount   = Inventory.getCount('tanLinh');

    const costDiv = document.createElement('div');
    costDiv.style.cssText = 'background:rgba(255,255,255,0.05);border-radius:8px;padding:10px;margin-bottom:10px;font-size:10px';
    costDiv.innerHTML = `
      <div style="color:#f0c040;font-weight:bold;margin-bottom:8px">✨ Tiến Hóa Lần ${pb.evoLevel + 1}</div>
      <div style="display:flex;justify-content:space-between;padding:3px 0">
        <span style="color:#aaa">💰 Vàng cần</span>
        <span style="color:${hasGold ? '#4caf50' : '#f44336'}">${evo.gold} / ${Player.gold}</span>
      </div>
      <div style="display:flex;justify-content:space-between;padding:3px 0">
        <span style="color:#aaa">🔮 Tàn Linh cần</span>
        <span style="color:${hasTL ? '#4caf50' : '#f44336'}">${evo.tanLinh} / ${tlCount}</span>
      </div>
      <div style="display:flex;justify-content:space-between;padding:3px 0;margin-top:4px;border-top:1px solid rgba(255,255,255,0.1)">
        <span style="color:#aaa">📊 Hiệu quả</span>
        <span style="color:#e040fb">Tất cả stats +15%</span>
      </div>
    `;
    el.appendChild(costDiv);

    // Evo history
    if (pb.evoLevel > 0) {
      const hist = document.createElement('div');
      hist.style.cssText = 'font-size:10px;color:#888;margin-bottom:10px';
      hist.innerHTML = '<div style="color:#aaa;margin-bottom:4px">📜 Lịch sử:</div>' +
        Array.from({ length: pb.evoLevel }, (_, i) => `<span style="color:#4caf50;margin-right:8px">✓ Lần ${i + 1}</span>`).join('');
      el.appendChild(hist);
    }

    const evoBtn = document.createElement('button');
    evoBtn.textContent = '✨ Tiến Hóa';
    evoBtn.style.cssText = `
      width:100%;padding:10px;border-radius:8px;
      border:2px solid ${canEvolve ? '#e040fb' : '#444'};
      background:${canEvolve ? 'rgba(224,64,251,0.15)' : 'transparent'};
      color:${canEvolve ? '#e040fb' : '#555'};
      font-family:inherit;font-size:12px;font-weight:bold;cursor:pointer;
    `;
    evoBtn.disabled = !canEvolve;
    evoBtn.addEventListener('click', () => {
      if (TreasureRefinement.evolve()) {
        renderContent();
        UI.updateGold();
        Inventory.render();
      }
    });
    el.appendChild(evoBtn);
  }

  function open() {
    const overlay = document.getElementById('refinementOverlay');
    if (!overlay) return;
    overlay.style.display = 'flex';
    renderFurnaceInfo();
    renderContent();
  }

  function close() {
    const overlay = document.getElementById('refinementOverlay');
    if (overlay) overlay.style.display = 'none';
  }

  return { open, close, renderContent, renderFurnaceInfo };
})();


// ==================== WEAPON MEMORY HUD (Character Panel hook) ====================

function _injectWeaponMemoryHUD() {
  // Called by renderCharacter wrap — injects memory badge into char panel
  // and adds Pháp Bảo slot
  const charPanel = document.getElementById('characterPanel');
  if (!charPanel) return;

  // Remove old badge if any
  const old = charPanel.querySelector('#wmHUDContainer');
  if (old) old.remove();

  const container = document.createElement('div');
  container.id    = 'wmHUDContainer';
  container.style.cssText = 'margin-top:8px;font-size:10px;font-family:"Courier New",monospace';

  // Per-slot memory badges
  ['weapon', 'armor', 'accessory'].forEach(slot => {
    const itemId = Player.equipped[slot];
    if (!itemId) return;
    const badge = WeaponMemory.renderHUDBadge(itemId);
    if (!badge) return;
    const row = document.createElement('div');
    row.style.cssText = 'margin-bottom:4px;padding:4px 6px;background:rgba(255,255,255,0.04);border-radius:4px';
    row.innerHTML = badge;
    container.appendChild(row);
  });

  // Pháp Bảo slot
  const pb       = TreasureRefinement.getState().phaoBao;
  const pbSlot   = document.createElement('div');
  pbSlot.style.cssText = 'margin-top:8px;padding:6px 8px;border-radius:6px;border:1px solid #444;background:rgba(255,255,255,0.03)';

  if (pb) {
    const gradeData = TREASURE_REFINEMENT_CONFIG.grades[pb.grade];
    pbSlot.innerHTML = `
      <div style="color:${gradeData.color};font-weight:bold">💎 ${pb.name}</div>
      <div style="color:#777;font-size:9px;margin-top:2px">[${gradeData.name}]${pb.evoLevel > 0 ? ' · Evo ' + pb.evoLevel : ''} · ${pb.traits?.map(t => '<span style="color:' + t.color + '">' + t.name + '</span>').join(', ')}</div>
    `;
  } else {
    pbSlot.innerHTML = '<div style="color:#555">💎 Pháp Bảo: Trống</div>';
  }

  container.appendChild(pbSlot);
  charPanel.appendChild(container);
}


// ==================== HOOKS & INITIALIZATION ====================

const TreasureWeaponFeature = {

  init() {
    // Register Tàn Linh item
    ITEMS.tanLinh = TREASURE_REFINEMENT_CONFIG.tanLinhItem;

    // Register refinement master NPC type
    NPC.types.refinementMaster = {
      name:    '⚗️ Tinh Luyện Sư',
      title:   'Luyện Bảo Của Tiên Giới',
      sprite:  'npcShop',
      dialog:  'Ta có thể đúc gear của ngươi thành Pháp Bảo. Mang vật phẩm đến đây.',
      service: 'refinement'
    };

    // Inject panel HTML
    RefinementPanel; // ensure closure runs
    // Inject after DOM ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => RefinementPanel.open && this._injectPanel());
    } else {
      this._injectPanel();
    }

    // Load save data
    this._loadSavedData();

    // Hooks
    this._hookEnemiesKill();
    this._hookEnemiesDamage();
    this._hookPlayerRecalc();
    this._hookNPCSpawnForMap();
    this._hookNPCInteract();
    this._hookInventoryShowTooltip();
    this._hookInventorySellItem();
    this._hookGameSaveLoad();
    this._hookGameInit();
    this._hookGameRender();
    this._hookRenderCharacter();

    console.log('⚗️ Treasure Weapon loaded');
  },

  _injectPanel() {
    // Lazy inject by opening then closing
    const dummy = document.createElement('div');
    dummy.id    = 'refinementOverlay';
    dummy.style.display = 'none';
    // Let RefinementPanel.open() create the real DOM
    document.getElementById('refinementOverlay')?.remove();
    // Force inject
    const tmpOpen = () => {
      const overlay = document.getElementById('refinementOverlay');
      if (!overlay) {
        // Create fresh
        const ov = document.createElement('div');
        ov.id    = 'refinementOverlay';
        ov.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:110;align-items:center;justify-content:center';
        document.body.appendChild(ov);
      }
    };
    tmpOpen();
    // Full inject via open
    RefinementPanel.open();
    RefinementPanel.close();
  },

  _loadSavedData() {
    try {
      const raw = localStorage.getItem('tuxien_treasure_weapon');
      if (!raw) return;
      const data = JSON.parse(raw);
      WeaponMemory.loadSaveData(data.weaponMemory);
      TreasureRefinement.loadSaveData(data.refinement);
    } catch (e) {
      console.warn('TreasureWeapon: load error', e);
    }
  },

  _saveData() {
    try {
      const data = {
        weaponMemory: WeaponMemory.getSaveData(),
        refinement:   TreasureRefinement.getSaveData()
      };
      localStorage.setItem('tuxien_treasure_weapon', JSON.stringify(data));
    } catch (e) {
      console.warn('TreasureWeapon: save error', e);
    }
  },

  // Hook Enemies.kill
  _hookEnemiesKill() {
    const _origKill = Enemies.kill.bind(Enemies);
    Enemies.kill = function(enemy) {
      // goldRune bonus
      const pb = TreasureRefinement.getState().phaoBao;
      if (pb?.traits?.some(t => t.id === 'goldRune')) {
        enemy.gold = Math.floor((enemy.gold || 0) * 1.20);
      }
      // accessory passive EXP bonus
      const accPassive = WeaponMemory.getPassiveForSlot('accessory');
      if (accPassive?.expBonusPct && enemy.exp) {
        enemy.exp = Math.floor(enemy.exp * (1 + accPassive.expBonusPct));
      }

      _origKill(enemy);

      // WeaponMemory tracking
      WeaponMemory.onKill(enemy);

      // lifeRune: kill → heal 2% HP
      if (pb?.traits?.some(t => t.id === 'lifeRune')) {
        Player.hp = Math.min(Player.maxHp, Player.hp + Math.floor(Player.maxHp * 0.02));
      }
      // soulRune: kill → +5 MP
      if (pb?.traits?.some(t => t.id === 'soulRune')) {
        Player.mp = Math.min(Player.maxMp, Player.mp + 5);
      }
    };
  },

  // Hook Enemies.damage — fireRune burst stack
  _hookEnemiesDamage() {
    const _origDmg = Enemies.damage.bind(Enemies);
    Enemies.damage = function(enemy, amount, isCrit, color) {
      // voidRune: 5% instant kill ordinary enemies
      const pb = TreasureRefinement.getState().phaoBao;
      if (pb?.traits?.some(t => t.id === 'voidRune') && !enemy.boss && Math.random() < 0.05) {
        amount = enemy.hp; // instant kill
      }

      // shadowRune: +10% dmg when Player HP < 50%
      if (pb?.traits?.some(t => t.id === 'shadowRune') && Player.hp / Player.maxHp < 0.5) {
        amount = Math.floor(amount * 1.10);
      }

      _origDmg(enemy, amount, isCrit, color);

      // fireRune: every 5 hit → burst
      if (pb?.traits?.some(t => t.id === 'fireRune')) {
        Player._fireRuneStack = (Player._fireRuneStack || 0) + 1;
        if (Player._fireRuneStack >= 5) {
          Player._fireRuneStack = 0;
          if (enemy.alive) {
            const burstDmg = Math.floor(Player.atk * 0.5);
            _origDmg(enemy, burstDmg, false, '#ff4500');
            if (typeof Game !== 'undefined' && Game.spawnDamageNumber) {
              Game.spawnDamageNumber(enemy.x, enemy.y - 30, '🔥' + burstDmg, '#ff4500');
            }
          }
        }
      }

      // thunderRune: crit → chain lightning
      if (isCrit && pb?.traits?.some(t => t.id === 'thunderRune') && typeof Enemies !== 'undefined') {
        const chainTarget = Enemies.findNearest && Enemies.findNearest(enemy.x, enemy.y, 150, e => e !== enemy && e.alive);
        if (chainTarget) {
          const chainDmg = Math.floor(amount * 0.30);
          _origDmg(chainTarget, chainDmg, false, '#ffeb3b');
          if (typeof Game !== 'undefined' && Game.spawnDamageNumber) {
            Game.spawnDamageNumber(chainTarget.x, chainTarget.y - 20, '⚡' + chainDmg, '#ffeb3b');
          }
        }
      }
    };
  },

  // Hook Player.recalculateStats — apply memory + phaoBao bonuses
  _hookPlayerRecalc() {
    const _origRecalc = Player.recalculateStats.bind(Player);
    Player.recalculateStats = function() {
      _origRecalc();
      WeaponMemory.applyToStats(Player);
    };
  },

  // Hook NPC.spawnForMap — refinement master on maps 2 and 4
  _hookNPCSpawnForMap() {
    const _origSpawn = NPC.spawnForMap.bind(NPC);
    NPC.spawnForMap = function(mapIndex) {
      _origSpawn(mapIndex);
      if (mapIndex === 2 || mapIndex === 4) {
        NPC.spawn('refinementMaster', 450, 450);
      }
    };
  },

  // Hook NPC.interact — refinement service
  _hookNPCInteract() {
    const _origInteract = NPC.interact.bind(NPC);
    NPC.interact = function(npc) {
      if (npc?.service === 'refinement') {
        RefinementPanel.open();
        NPC.closeDialog();
        return;
      }
      _origInteract(npc);
    };
  },

  // Hook Inventory.showTooltip — weapon memory badge
  _hookInventoryShowTooltip() {
    const _origTooltip = Inventory.showTooltip.bind(Inventory);
    Inventory.showTooltip = function(itemId, slotIndex, event) {
      _origTooltip(itemId, slotIndex, event);
      // Inject memory badge into tooltip
      const typeEl = document.getElementById('tooltipType');
      if (!typeEl) return;
      const badge = WeaponMemory.renderHUDBadge(itemId);
      if (badge) {
        typeEl.innerHTML += '<br>' + badge;
      }
    };
  },

  // Hook Inventory.sellItem — sell warning for high-tier weapon memory
  _hookInventorySellItem() {
    const _origSell = Inventory.sellItem.bind(Inventory);
    Inventory.sellItem = function(itemId, count = 1) {
      const mem  = WeaponMemory.getMemory(itemId);
      const tier = WeaponMemory.getCurrentTier(mem.kills);
      if (tier && tier.tier >= WEAPON_MEMORY_CONFIG.sellWarningThreshold) {
        const name      = mem.customName || ITEMS[itemId]?.name || itemId;
        const confirmed = confirm(
          '⚠️ "' + name + '" đang ở tier ' + tier.name + '!\n' +
          'Bán sẽ mất toàn bộ ký ức chiến đấu.\nTiếp tục?'
        );
        if (!confirmed) return false;
      }
      return _origSell(itemId, count);
    };
  },

  // Hook Game.init / save / load
  _hookGameInit() {
    if (typeof Game === 'undefined') return;
    const _origInit = Game.init?.bind(Game);
    if (_origInit) {
      Game.init = function() {
        _origInit();
        // Re-apply recalculate after full init
        Player.recalculateStats();
      };
    }
  },

  _hookGameSaveLoad() {
    if (typeof Game === 'undefined') return;

    const _origSave = Game.save?.bind(Game);
    if (_origSave) {
      Game.save = function() {
        _origSave();
        TreasureWeaponFeature._saveData();
      };
    }

    const _origLoad = Game.load?.bind(Game);
    if (_origLoad) {
      Game.load = function() {
        _origLoad();
        TreasureWeaponFeature._loadSavedData();
        Player.recalculateStats();
      };
    }
  },

  // Hook Game.renderPlayer — aura + Pháp Bảo outer ring
  _hookGameRender() {
    if (typeof Game === 'undefined') return;
    const _origRender = Game.renderPlayer?.bind(Game);
    if (!_origRender) return;

    Game.renderPlayer = function() {
      _origRender();
      const ctx = Game.ctx;
      if (!ctx) return;

      // Weapon memory aura
      WeaponMemory.renderAura(ctx);

      // Pháp Bảo aura (outer ring)
      const pb = TreasureRefinement.getState().phaoBao;
      if (pb) {
        const gradeData = TREASURE_REFINEMENT_CONFIG.grades[pb.grade];
        if (gradeData?.aura) {
          const cx    = Player.x - GameState.camera.x;
          const cy    = Player.y - 10 - GameState.camera.y;
          const pulse = 0.15 + Math.sin(GameState.time / 400 + 1.5) * 0.08;
          ctx.save();
          ctx.globalAlpha = pulse;
          ctx.strokeStyle = gradeData.auraColor;
          ctx.lineWidth   = 2.5;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.arc(cx, cy, 26 + (pb.evoLevel || 0) * 2, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.restore();
        }
      }
    };
  },

  // Hook UI.renderCharacter — add memory HUD + Pháp Bảo slot
  _hookRenderCharacter() {
    if (typeof UI === 'undefined' || !UI.renderCharacter) return;
    const _origRenderChar = UI.renderCharacter.bind(UI);
    UI.renderCharacter = function() {
      _origRenderChar();
      _injectWeaponMemoryHUD();
    };
  }
};

// Auto-start after all scripts load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => TreasureWeaponFeature.init());
} else {
  // Defer one tick so game.js finishes
  setTimeout(() => TreasureWeaponFeature.init(), 0);
}
