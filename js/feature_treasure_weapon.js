// ===== FILE: js/feature_treasure_weapon.js =====
// ==================== FEATURE: TREASURE WEAPON ====================
// WeaponMemory + TreasureRefinement System
// Load sau: game.js, ui.js, inventory.js, player.js, enemies.js, npc.js

// ==================== SECTION 1: DATA & CONFIG ====================

const WEAPON_MEMORY_CONFIG = {
  milestones: [
    { kills:    10, tier: 1, name: 'Sơ Thức',      color: '#ffffff',
      statBonus: {},                                            desc: 'Vũ khí bắt đầu thức tỉnh...' },
    { kills:   100, tier: 2, name: 'Tỉnh Thức',    color: '#42a5f5',
      statBonus: { atk: 5 },                                  desc: 'Vũ khí nhận ra chủ nhân.' },
    { kills:   500, tier: 3, name: 'Giác Ngộ',     color: '#f0c040',
      statBonus: { atk: 15 },                                 desc: 'Ký ức chiến đấu được khắc vào.' },
    { kills:  1000, tier: 4, name: 'Cổ Thần',      color: '#f44336',
      statBonus: { atk: 30, critRate: 0.05 },                 desc: 'Thần ý thức tỉnh hoàn toàn.' },
    { kills:  5000, tier: 5, name: 'Thần Khí Hóa', color: '#e040fb',
      statBonus: { atk: 60, critRate: 0.10, critDmg: 0.30 }, desc: 'Đã thành Thần Khí!' }
  ],

  passives: {
    weapon:    { id: 'weaponPassive',    critRateBonus: 0.05,     desc: '+5% crit rate khi Giác Ngộ' },
    armor:     { id: 'armorPassive',     dmgReduceAtLowHp: 0.15, desc: '-15% damage nhận khi HP<30%' },
    accessory: { id: 'accessoryPassive', expBonusPct: 0.10,      desc: '+10% EXP khi kill' }
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
      statRetainRange: [0.60, 0.75], traitSlots: 1,
      upgradeCost: { gold: 500, items: [{ id: 'demonCore', count: 3 }] }
    },
    linh: {
      id: 'linhLo', name: 'Linh Lò', tier: 2, color: '#4caf50',
      statRetainRange: [0.75, 0.88], traitSlots: 2,
      upgradeCost: { gold: 1500, items: [{ id: 'dragonScale', count: 2 }] }
    },
    tien: {
      id: 'tienLo', name: 'Tiên Lò', tier: 3, color: '#f0c040',
      statRetainRange: [0.88, 0.96], traitSlots: 3,
      upgradeCost: null
    }
  },

  grades: {
    thuong:   { id: 'thuong',   name: 'Thường',    color: '#9e9e9e', aura: false,                          traitCount: 1 },
    linh:     { id: 'linh',     name: 'Linh',       color: '#4caf50', aura: true, auraColor: '#4caf50',    traitCount: 2 },
    thien:    { id: 'thien',    name: 'Thiên',      color: '#f0c040', aura: true, auraColor: '#f0c040',    traitCount: 3 },
    voThuong: { id: 'voThuong', name: 'Vô Thượng', color: '#e040fb', aura: true, auraColor: '#e040fb',    traitCount: 3 }
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
    return roll < 0.05 ? 'linh' : 'thuong';
  },

  traits: [
    { id: 'fireRune',    name: 'Hỏa Văn',          color: '#ff4500', desc: 'Mỗi 5 hit: burst +50% ATK 1 đòn' },
    { id: 'iceRune',     name: 'Băng Văn',          color: '#00bcd4', desc: '20% hit: slow enemy 1s' },
    { id: 'thunderRune', name: 'Lôi Văn',           color: '#ffeb3b', desc: 'Crit → chain lightning 30% dmg sang target kế' },
    { id: 'lifeRune',    name: 'Sinh Văn',          color: '#4caf50', desc: 'Kill → hồi 2% HP' },
    { id: 'shadowRune',  name: 'Ám Văn',            color: '#4a148c', desc: '+10% dmg khi HP < 50%' },
    { id: 'windRune',    name: 'Phong Văn',         color: '#69f0ae', desc: '+0.3 speed' },
    { id: 'soulRune',    name: 'Hồn Văn',           color: '#e040fb', desc: '+5 MP/kill' },
    { id: 'goldRune',    name: 'Kim Văn',           color: '#f0c040', desc: '+20% gold drop' },
    { id: 'dualElement', name: 'Băng Hỏa Song Sinh', color: '#ff6f00', desc: 'Mỗi 5 hit: burst tự chọn Ice hoặc Fire element', requireBothElements: true },
    { id: 'voidRune',    name: 'Hư Vô Văn',        color: '#7c4dff', desc: '5% instant kill quái thường khi hit' }
  ],

  failReward: { id: 'tanLinh', count: 1 },

  tanLinhItem: {
    id: 'tanLinh', name: 'Tàn Linh', type: 'material', rarity: 'rare',
    desc: 'Phần tinh hoa còn lại sau khi tinh luyện thất bại. Dùng để reroll trait Pháp Bảo.',
    sellPrice: 100
  },

  phaoBaoSlot: 'phaoBao',

  evolutionCost(currentEvo) {
    return { gold: 500 * Math.pow(2, currentEvo), tanLinh: currentEvo + 1, statBonus: 0.15 };
  }
};


// ==================== SECTION 2: WEAPON MEMORY SYSTEM ====================

const WeaponMemory = (() => {
  const state = {
    killCounts: {}, customNames: {}, tierReached: {}, passiveUnlocked: {},
    _lastWeaponId: null
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

    if (tier.tier === 2 && !state.customNames[itemId]) {
      const base   = ITEMS[itemId]?.name || itemId;
      const prefix = WEAPON_MEMORY_CONFIG.namePool[Math.floor(Math.random() * WEAPON_MEMORY_CONFIG.namePool.length)];
      state.customNames[itemId] = prefix + ' ' + base;
      UI.addLog('⚔️ ' + base + ' → "' + state.customNames[itemId] + '"!', 'realm');
    }

    if (tier.tier === 3 && !state.passiveUnlocked[itemId]) {
      state.passiveUnlocked[itemId] = true;
      const passiveKey = ITEMS[itemId]?.type;
      const passive    = WEAPON_MEMORY_CONFIG.passives[passiveKey];
      if (passive) UI.addLog('✨ Passive unlock: ' + passive.desc, 'realm');
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
    if (!itemId || !state.passiveUnlocked[itemId]) return null;
    return WEAPON_MEMORY_CONFIG.passives[ITEMS[itemId]?.type] || null;
  }

  function applyToStats(player) {
    for (const slot of ['weapon', 'armor', 'accessory']) {
      const itemId = player.equipped[slot];
      if (!itemId) continue;
      const bonus = getStatBonus(itemId);
      if (bonus.atk)      player.atk      += bonus.atk;
      if (bonus.critRate) player.critRate  += bonus.critRate;
      if (bonus.critDmg)  player.critDmg   += bonus.critDmg;
      if (bonus.def)      player.def       += bonus.def;
      if (bonus.hp) {
        player.maxHp += bonus.hp;
        player.hp     = Math.min(player.hp, player.maxHp);
      }
    }

    // Pháp Bảo stats
    if (player.equipped?.phaoBao) {
      const pb = TreasureRefinement.getState().phaoBao;
      if (pb?.stats) {
        player.atk      += pb.stats.atk      || 0;
        player.def      += pb.stats.def      || 0;
        player.maxHp    += pb.stats.hp       || 0;
        player.maxMp    += pb.stats.mp       || 0;
        player.critRate += pb.stats.critRate || 0;
        player.critDmg  += pb.stats.critDmg  || 0;
        player.speed    += pb.stats.speed     || 0;
        if (pb.traits?.some(t => t.id === 'windRune')) player.speed += 0.3;
        player.hp = Math.min(player.hp, player.maxHp);
        player.mp = Math.min(player.mp, player.maxMp);
      }
    }
  }

  function renderAura(ctx) {
    const weaponId = Player.equipped?.weapon;
    if (!weaponId) return;
    const tier = getCurrentTier(state.killCounts[weaponId] || 0);
    if (!tier || tier.tier < 1) return;

    const cx    = Player.x - GameState.camera.x;
    const cy    = Player.y - 10 - GameState.camera.y;
    const pulse = 0.2 + Math.sin(GameState.time / 300) * 0.1;

    ctx.save();
    ctx.globalAlpha = pulse;
    ctx.strokeStyle = tier.color;
    ctx.lineWidth   = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, 18 + tier.tier * 2, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();

    if (tier.tier >= 4 && Math.random() < 0.05) {
      const a = Math.random() * Math.PI * 2;
      GameState.particles.push({
        x: Player.x + Math.cos(a) * 20, y: Player.y + Math.sin(a) * 20,
        vx: Math.cos(a) * 0.5, vy: -1, life: 600, color: tier.color, size: 2 + Math.random() * 2
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
      killCounts: state.killCounts, customNames: state.customNames,
      tierReached: state.tierReached, passiveUnlocked: state.passiveUnlocked
    };
  }

  function loadSaveData(data) {
    if (!data) return;
    if (data.killCounts)      Object.assign(state.killCounts,      data.killCounts);
    if (data.customNames)     Object.assign(state.customNames,     data.customNames);
    if (data.tierReached)     Object.assign(state.tierReached,     data.tierReached);
    if (data.passiveUnlocked) Object.assign(state.passiveUnlocked, data.passiveUnlocked);
  }

  return { state, getMemory, getCurrentTier, onKill, getStatBonus, getPassiveForSlot, applyToStats, renderAura, renderHUDBadge, getSaveData, loadSaveData };
})();


// ==================== SECTION 3: TREASURE REFINEMENT SYSTEM ====================

const TreasureRefinement = (() => {
  const state = {
    furnaceLevel: 1, selectedItems: [],
    phaoBao: null, previewStats: null, tanLinhCount: 0
  };

  function getState()   { return state; }

  function getFurnace() {
    return TREASURE_REFINEMENT_CONFIG.furnaces[['pham','linh','tien'][state.furnaceLevel - 1]];
  }

  function previewRefine(itemIds) {
    if (!itemIds || itemIds.length < 2) return null;
    const [rMin, rMax] = getFurnace().statRetainRange;
    const retain       = (rMin + rMax) / 2;
    const combined     = _combineStats(itemIds, retain);
    return {
      stats: Object.fromEntries(Object.entries(combined).map(([k, v]) => [k, Math.floor(v)])),
      retainPct: Math.round(retain * 100)
    };
  }

  // Shared stat-combination helper
  function _combineStats(itemIds, retain) {
    const combined = { atk: 0, def: 0, hp: 0, mp: 0, critRate: 0, critDmg: 0, speed: 0 };
    for (const id of itemIds) {
      const item = ITEMS[id];
      if (!item?.stats) continue;
      for (const k of Object.keys(combined)) {
        combined[k] += (item.stats[k] || 0) * retain;
      }
    }
    return combined;
  }

  function getAvailableTraits(itemIds) {
    const pool       = [...TREASURE_REFINEMENT_CONFIG.traits];
    const hasFireItem = itemIds.some(id => ITEMS[id]?.icon?.includes('fire') || id === 'flameSword');
    const hasIceItem  = itemIds.some(id => ITEMS[id]?.icon?.includes('ice')  || id === 'frostSword');
    return (!hasFireItem || !hasIceItem) ? pool.filter(t => !t.requireBothElements) : pool;
  }

  function refine(itemIds) {
    if (!itemIds || itemIds.length < 2 || itemIds.length > 3) return false;

    for (const id of itemIds) {
      if (!Inventory.has(id, 1)) { UI.addLog('❌ Không đủ vật phẩm!', 'system'); return false; }
    }

    if (Math.random() < 0.30) {
      Inventory.add('tanLinh', 1);
      state.tanLinhCount++;
      UI.showNotification('⚗️ Tinh Luyện Thất Bại!', 'Nhận được Tàn Linh × 1');
      UI.addLog('⚗️ Tinh luyện thất bại. Nhận Tàn Linh x1.', 'system');
      return false;
    }

    itemIds.forEach(id => Inventory.remove(id, 1));

    const [rMin, rMax] = getFurnace().statRetainRange;
    const retain       = rMin + Math.random() * (rMax - rMin);
    const combined     = _combineStats(itemIds, retain);
    const finalStats   = Object.fromEntries(
      Object.entries(combined).map(([k, v]) => [k, Math.round(v * 10) / 10])
    );

    const grade       = TREASURE_REFINEMENT_CONFIG.gradeFormula(itemIds.length, state.furnaceLevel);
    const gradeData   = TREASURE_REFINEMENT_CONFIG.grades[grade];

    const traitPool      = getAvailableTraits(itemIds);
    const selectedTraits = [];
    for (let i = 0; i < gradeData.traitCount && traitPool.length > 0; i++) {
      selectedTraits.push(traitPool.splice(Math.floor(Math.random() * traitPool.length), 1)[0]);
    }

    state.phaoBao = {
      stats: finalStats, traits: selectedTraits,
      grade, evoLevel: 0, name: gradeData.name + ' Pháp Bảo'
    };

    Player.equipped.phaoBao = 'phaoBao';
    Player.recalculateStats();
    UI.showNotification('⚗️ Pháp Bảo Tạo Thành!', '[' + gradeData.name + '] ' + state.phaoBao.name);
    UI.addLog('⚗️ Pháp Bảo [' + gradeData.name + '] với ' + selectedTraits.length + ' trait!', 'realm');
    return true;
  }

  function rerollTrait(traitIndex) {
    if (!state.phaoBao) return false;
    if (!Inventory.has('tanLinh', 1)) { UI.addLog('❌ Cần Tàn Linh!', 'system'); return false; }
    Inventory.remove('tanLinh', 1);
    const pool = TREASURE_REFINEMENT_CONFIG.traits.filter(t =>
      !state.phaoBao.traits.some(existing => existing.id === t.id)
    );
    if (!pool.length) return false;
    state.phaoBao.traits[traitIndex] = pool[Math.floor(Math.random() * pool.length)];
    UI.addLog('⚗️ Trait đã được reroll!', 'item');
    return true;
  }

  function evolve() {
    if (!state.phaoBao) return false;
    const evo     = TREASURE_REFINEMENT_CONFIG.evolutionCost(state.phaoBao.evoLevel);
    const hasTL   = Inventory.has('tanLinh', evo.tanLinh);

    if (Player.gold < evo.gold) { UI.addLog('❌ Không đủ vàng! Cần ' + evo.gold, 'system'); return false; }
    if (!hasTL)                  { UI.addLog('❌ Cần Tàn Linh × ' + evo.tanLinh, 'system'); return false; }

    Player.gold -= evo.gold;
    Inventory.remove('tanLinh', evo.tanLinh);
    state.phaoBao.evoLevel++;

    for (const k of Object.keys(state.phaoBao.stats)) {
      state.phaoBao.stats[k] = Math.round(state.phaoBao.stats[k] * (1 + evo.statBonus) * 10) / 10;
    }

    Player.recalculateStats();
    UI.updateGold();
    UI.showNotification('⚗️ Pháp Bảo Tiến Hóa!', 'Lần ' + state.phaoBao.evoLevel + ' — Tất cả stats +15%');
    return true;
  }

  function upgradeFurnace() {
    if (state.furnaceLevel >= 3) { UI.addLog('Lò đã max tier!', 'system'); return false; }
    const nextKey  = ['pham','linh','tien'][state.furnaceLevel];
    const nextTier = TREASURE_REFINEMENT_CONFIG.furnaces[nextKey];
    const cost     = nextTier.upgradeCost;

    if (Player.gold < cost.gold) { UI.addLog('❌ Không đủ vàng!', 'system'); return false; }
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
    return { furnaceLevel: state.furnaceLevel, phaoBao: state.phaoBao, tanLinhCount: state.tanLinhCount };
  }

  function loadSaveData(data) {
    if (!data) return;
    if (data.furnaceLevel != null) state.furnaceLevel = data.furnaceLevel;
    if (data.phaoBao      != null) state.phaoBao      = data.phaoBao;
    if (data.tanLinhCount != null) state.tanLinhCount  = data.tanLinhCount;
    if (state.phaoBao) Player.equipped.phaoBao = 'phaoBao';
  }

  return { getState, getFurnace, previewRefine, getAvailableTraits, refine, rerollTrait, evolve, upgradeFurnace, getSaveData, loadSaveData };
})();


// ==================== SECTION 4: UI ====================

const RefinementPanel = (() => {
  let currentTab = 'refine';

  function injectHTML() {
    if (document.getElementById('refinementOverlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'refinementOverlay';
    overlay.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:110;align-items:center;justify-content:center;';
    overlay.innerHTML = `
      <div style="background:#1a1a2e;border:2px solid #f0c040;border-radius:12px;padding:16px;max-width:400px;width:92%;max-height:85vh;overflow-y:auto;font-family:'Courier New',monospace;color:#e0e0e0;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <span style="color:#f0c040;font-size:14px;font-weight:bold">⚗️ Tinh Luyện Pháp Bảo</span>
          <span id="refClose" style="cursor:pointer;color:#aaa;font-size:18px;padding:0 4px">✕</span>
        </div>
        <div id="refFurnaceInfo" style="background:rgba(255,255,255,0.05);border-radius:8px;padding:8px 12px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;font-size:11px;"></div>
        <div style="display:flex;gap:6px;margin-bottom:12px" id="refTabRow">
          <button class="ref-tab active" data-tab="refine"  style="flex:1;padding:8px;border-radius:8px;border:2px solid #f0c040;background:rgba(240,192,64,0.15);color:#f0c040;font-family:inherit;font-size:10px;cursor:pointer">⚗️ Tinh Luyện</button>
          <button class="ref-tab"        data-tab="phaobao" style="flex:1;padding:8px;border-radius:8px;border:2px solid #444;background:transparent;color:#888;font-family:inherit;font-size:10px;cursor:pointer">💎 Pháp Bảo</button>
          <button class="ref-tab"        data-tab="evolve"  style="flex:1;padding:8px;border-radius:8px;border:2px solid #444;background:transparent;color:#888;font-family:inherit;font-size:10px;cursor:pointer">✨ Tiến Hóa</button>
        </div>
        <div id="refContent"></div>
      </div>`;
    document.body.appendChild(overlay);

    document.getElementById('refClose').addEventListener('click', close);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

    overlay.querySelectorAll('.ref-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        currentTab = btn.dataset.tab;
        overlay.querySelectorAll('.ref-tab').forEach(b => {
          const active = b.dataset.tab === currentTab;
          b.style.borderColor = active ? '#f0c040' : '#444';
          b.style.background  = active ? 'rgba(240,192,64,0.15)' : 'transparent';
          b.style.color       = active ? '#f0c040' : '#888';
        });
        renderContent();
      });
    });
  }

  function renderFurnaceInfo() {
    const el      = document.getElementById('refFurnaceInfo');
    if (!el) return;
    const furnace = TreasureRefinement.getFurnace();
    const state   = TreasureRefinement.getState();

    el.innerHTML = `
      <span style="color:${furnace.color}">🔥 ${furnace.name}</span>
      <span style="color:#888">Tier ${state.furnaceLevel}/3</span>
      ${state.furnaceLevel < 3
        ? `<button id="refUpgradeFurnaceBtn" style="padding:4px 8px;border-radius:6px;border:1px solid #f0c040;background:rgba(240,192,64,0.1);color:#f0c040;font-family:inherit;font-size:10px;cursor:pointer">⬆ Nâng Cấp</button>`
        : '<span style="color:#e040fb">★ MAX</span>'}`;

    const upBtn = document.getElementById('refUpgradeFurnaceBtn');
    if (upBtn) {
      const next = ['pham','linh','tien'][state.furnaceLevel];
      const cost = TREASURE_REFINEMENT_CONFIG.furnaces[next]?.upgradeCost;
      if (cost) {
        upBtn.title = `${cost.gold} vàng + ${cost.items?.map(i => ITEMS[i.id]?.name + '×' + i.count).join(', ')}`;
      }
      upBtn.addEventListener('click', () => { TreasureRefinement.upgradeFurnace(); renderFurnaceInfo(); });
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

    const info = document.createElement('div');
    info.style.cssText = 'color:#aaa;font-size:10px;margin-bottom:10px;background:rgba(255,165,0,0.1);border-radius:6px;padding:8px;border:1px solid rgba(255,165,0,0.3)';
    info.innerHTML = `⚡ Tỷ lệ thành công: <span style="color:#4caf50;font-weight:bold">70%</span> &nbsp;|&nbsp; Retain: <b style="color:${furnace.color}">${Math.round(furnace.statRetainRange[0]*100)}–${Math.round(furnace.statRetainRange[1]*100)}%</b> &nbsp;|&nbsp; Trait slots: <b>${furnace.traitSlots}</b>`;
    el.appendChild(info);

    const label = document.createElement('div');
    label.style.cssText = 'color:#f0c040;font-size:11px;margin-bottom:8px;font-weight:bold';
    label.textContent = '📦 Chọn 2–3 trang bị để nấu:';
    el.appendChild(label);

    const grid = document.createElement('div');
    grid.id = 'refItemGrid';
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:10px';
    el.appendChild(grid);

    const equipTypes = ['weapon', 'armor', 'accessory'];
    const equipItems = Inventory.items.filter(i => {
      const data = ITEMS[i.id];
      return data && equipTypes.includes(data.type);
    });

    if (!equipItems.length) {
      const empty = document.createElement('div');
      empty.style.cssText = 'color:#666;font-size:10px;grid-column:1/-1;padding:12px;text-align:center';
      empty.textContent = 'Không có trang bị trong túi đồ';
      grid.appendChild(empty);
    } else {
      equipItems.forEach(item => {
        const itemData   = ITEMS[item.id];
        const isSelected = state.selectedItems.includes(item.id);
        const rarityColorMap = { legendary:'#f0c040', epic:'#e040fb', rare:'#42a5f5' };
        const nameColor  = rarityColorMap[itemData.rarity] || '#ccc';
        const typeIcon   = itemData.type === 'weapon' ? '⚔️' : itemData.type === 'armor' ? '🛡️' : '💍';

        const slot = document.createElement('div');
        slot.style.cssText = `padding:6px;border-radius:6px;border:2px solid ${isSelected ? '#f0c040' : '#444'};background:${isSelected ? 'rgba(240,192,64,0.15)' : 'rgba(255,255,255,0.03)'};cursor:pointer;font-size:9px;text-align:center;transition:all 0.15s;`;
        slot.innerHTML = `<div style="color:${nameColor};font-weight:bold;margin-bottom:2px">${itemData.name}</div><div style="color:#666">${typeIcon}</div>`;
        slot.addEventListener('click', () => {
          const idx = state.selectedItems.indexOf(item.id);
          if (idx >= 0) state.selectedItems.splice(idx, 1);
          else if (state.selectedItems.length < 3) state.selectedItems.push(item.id);
          renderContent();
        });
        grid.appendChild(slot);
      });
    }

    if (state.selectedItems.length >= 2) {
      const preview = TreasureRefinement.previewRefine(state.selectedItems);
      if (preview) {
        const pvDiv = document.createElement('div');
        pvDiv.style.cssText = 'background:rgba(66,165,245,0.1);border:1px solid #42a5f5;border-radius:8px;padding:8px;margin-bottom:10px;font-size:10px';
        const statsHtml = Object.entries(preview.stats)
          .filter(([, v]) => v > 0)
          .map(([k, v]) => `<span style="color:#aaa">${k.toUpperCase()}</span>: <b style="color:#e0e0e0">+${v}</b>`)
          .join('  ');
        pvDiv.innerHTML = `<div style="color:#42a5f5;font-weight:bold;margin-bottom:4px">📊 Dự kiến (Retain ~${preview.retainPct}%)</div><div>${statsHtml || '—'}</div>`;
        el.appendChild(pvDiv);
      }
    }

    const refineBtn = document.createElement('button');
    const canRefine = state.selectedItems.length >= 2;
    refineBtn.textContent = '⚗️ Bắt Đầu Tinh Luyện';
    refineBtn.style.cssText = `width:100%;padding:10px;border-radius:8px;border:2px solid ${canRefine ? '#f0c040' : '#444'};background:${canRefine ? 'rgba(240,192,64,0.2)' : 'transparent'};color:${canRefine ? '#f0c040' : '#555'};font-family:inherit;font-size:11px;font-weight:bold;cursor:pointer;`;
    refineBtn.disabled = !canRefine;
    refineBtn.addEventListener('click', () => {
      if (state.selectedItems.length < 2) return;
      const ok = TreasureRefinement.refine([...state.selectedItems]);
      state.selectedItems = [];
      if (ok) {
        currentTab = 'phaobao';
        document.querySelectorAll('.ref-tab').forEach(b => {
          const active = b.dataset.tab === 'phaobao';
          b.style.borderColor = active ? '#f0c040' : '#444';
          b.style.background  = active ? 'rgba(240,192,64,0.15)' : 'transparent';
          b.style.color       = active ? '#f0c040' : '#888';
        });
      }
      renderContent();
      Inventory.render();
    });
    el.appendChild(refineBtn);
  }

  function renderTabPhaoBao(el) {
    const pb = TreasureRefinement.getState().phaoBao;
    if (!pb) {
      const empty = document.createElement('div');
      empty.style.cssText = 'color:#666;text-align:center;padding:20px;font-size:11px';
      empty.textContent = '💎 Chưa có Pháp Bảo. Hãy Tinh Luyện!';
      el.appendChild(empty);
      return;
    }

    const gradeData = TREASURE_REFINEMENT_CONFIG.grades[pb.grade];

    const header = document.createElement('div');
    header.style.cssText = `background:rgba(255,255,255,0.05);border:2px solid ${gradeData.color};border-radius:10px;padding:12px;margin-bottom:10px;text-align:center`;
    header.innerHTML = `
      <div style="color:${gradeData.color};font-size:16px;font-weight:bold">💎 ${pb.name}</div>
      <div style="color:#aaa;font-size:10px;margin-top:4px">[${gradeData.name}]${pb.evoLevel > 0 ? ' · Tiến Hóa Lần ' + pb.evoLevel : ''}</div>`;
    el.appendChild(header);

    const statNames = { atk:'⚔️ ATK', def:'🛡️ DEF', hp:'❤️ HP', mp:'💎 MP', critRate:'💥 Crit', critDmg:'🔥 CritDmg', speed:'💨 Speed' };
    const statsDiv  = document.createElement('div');
    statsDiv.style.cssText = 'background:rgba(255,255,255,0.04);border-radius:8px;padding:10px;margin-bottom:10px;font-size:10px';
    let statsHtml = '<div style="color:#f0c040;font-weight:bold;margin-bottom:6px">📊 Thuộc Tính</div>';
    for (const [k, v] of Object.entries(pb.stats)) {
      if (!v) continue;
      const displayVal = (k === 'critRate' || k === 'critDmg') ? `+${(v * 100).toFixed(1)}%` : `+${v.toFixed(1)}`;
      statsHtml += `<div style="display:flex;justify-content:space-between;padding:2px 0"><span style="color:#aaa">${statNames[k] || k}</span><span style="color:#e0e0e0">${displayVal}</span></div>`;
    }
    statsDiv.innerHTML = statsHtml;
    el.appendChild(statsDiv);

    if (pb.traits?.length > 0) {
      const traitsDiv = document.createElement('div');
      traitsDiv.style.cssText = 'background:rgba(255,255,255,0.04);border-radius:8px;padding:10px;margin-bottom:10px;font-size:10px';
      let traitsHtml = '<div style="color:#f0c040;font-weight:bold;margin-bottom:6px">✨ Pháp Văn</div>';
      pb.traits.forEach((trait, idx) => {
        const tlCount = Inventory.getCount('tanLinh');
        traitsHtml += `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.05)">
            <div>
              <span style="color:${trait.color};font-weight:bold">${trait.name}</span>
              <div style="color:#777;font-size:9px;margin-top:2px">${trait.desc}</div>
            </div>
            <button data-reroll="${idx}" style="padding:3px 6px;border-radius:4px;border:1px solid #888;background:rgba(255,255,255,0.05);color:#aaa;font-family:inherit;font-size:9px;cursor:pointer;white-space:nowrap;flex-shrink:0;margin-left:6px">🔄 (${tlCount} TL)</button>
          </div>`;
      });
      traitsDiv.innerHTML = traitsHtml;
      traitsDiv.querySelectorAll('[data-reroll]').forEach(btn => {
        btn.addEventListener('click', () => {
          if (TreasureRefinement.rerollTrait(parseInt(btn.dataset.reroll))) {
            renderContent(); Inventory.render();
          }
        });
      });
      el.appendChild(traitsDiv);
    }
  }

  function renderTabEvolve(el) {
    const pb = TreasureRefinement.getState().phaoBao;
    if (!pb) {
      const empty = document.createElement('div');
      empty.style.cssText = 'color:#666;text-align:center;padding:20px;font-size:11px';
      empty.textContent = '💎 Cần có Pháp Bảo trước.';
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
      <div style="display:flex;justify-content:space-between;padding:3px 0"><span style="color:#aaa">💰 Vàng cần</span><span style="color:${hasGold ? '#4caf50' : '#f44336'}">${evo.gold} / ${Player.gold}</span></div>
      <div style="display:flex;justify-content:space-between;padding:3px 0"><span style="color:#aaa">🔮 Tàn Linh cần</span><span style="color:${hasTL ? '#4caf50' : '#f44336'}">${evo.tanLinh} / ${tlCount}</span></div>
      <div style="display:flex;justify-content:space-between;padding:3px 0;margin-top:4px;border-top:1px solid rgba(255,255,255,0.1)"><span style="color:#aaa">📊 Hiệu quả</span><span style="color:#e040fb">Tất cả stats +15%</span></div>`;
    el.appendChild(costDiv);

    if (pb.evoLevel > 0) {
      const hist = document.createElement('div');
      hist.style.cssText = 'font-size:10px;color:#888;margin-bottom:10px';
      hist.innerHTML = '<div style="color:#aaa;margin-bottom:4px">📜 Lịch sử:</div>' +
        Array.from({ length: pb.evoLevel }, (_, i) => `<span style="color:#4caf50;margin-right:8px">✓ Lần ${i + 1}</span>`).join('');
      el.appendChild(hist);
    }

    const evoBtn = document.createElement('button');
    evoBtn.textContent = '✨ Tiến Hóa';
    evoBtn.style.cssText = `width:100%;padding:10px;border-radius:8px;border:2px solid ${canEvolve ? '#e040fb' : '#444'};background:${canEvolve ? 'rgba(224,64,251,0.15)' : 'transparent'};color:${canEvolve ? '#e040fb' : '#555'};font-family:inherit;font-size:12px;font-weight:bold;cursor:pointer;`;
    evoBtn.disabled = !canEvolve;
    evoBtn.addEventListener('click', () => {
      if (TreasureRefinement.evolve()) { renderContent(); UI.updateGold(); Inventory.render(); }
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


// ==================== WEAPON MEMORY HUD ====================

function _injectWeaponMemoryHUD() {
  const charPanel = document.getElementById('characterPanel');
  if (!charPanel) return;

  const old = charPanel.querySelector('#wmHUDContainer');
  if (old) old.remove();

  const container = document.createElement('div');
  container.id = 'wmHUDContainer';
  container.style.cssText = 'margin-top:8px;font-size:10px;font-family:"Courier New",monospace';

  for (const slot of ['weapon', 'armor', 'accessory']) {
    const itemId = Player.equipped[slot];
    if (!itemId) continue;
    const badge = WeaponMemory.renderHUDBadge(itemId);
    if (!badge) continue;
    const row = document.createElement('div');
    row.style.cssText = 'margin-bottom:4px;padding:4px 6px;background:rgba(255,255,255,0.04);border-radius:4px';
    row.innerHTML = badge;
    container.appendChild(row);
  }

  const pb      = TreasureRefinement.getState().phaoBao;
  const pbSlot  = document.createElement('div');
  pbSlot.style.cssText = 'margin-top:8px;padding:6px 8px;border-radius:6px;border:1px solid #444;background:rgba(255,255,255,0.03)';

  if (pb) {
    const gradeData = TREASURE_REFINEMENT_CONFIG.grades[pb.grade];
    pbSlot.innerHTML = `
      <div style="color:${gradeData.color};font-weight:bold">💎 ${pb.name}</div>
      <div style="color:#777;font-size:9px;margin-top:2px">[${gradeData.name}]${pb.evoLevel > 0 ? ' · Evo ' + pb.evoLevel : ''} · ${pb.traits?.map(t => '<span style="color:' + t.color + '">' + t.name + '</span>').join(', ')}</div>`;
  } else {
    pbSlot.innerHTML = '<div style="color:#555">💎 Pháp Bảo: Trống</div>';
  }

  container.appendChild(pbSlot);
  charPanel.appendChild(container);
}


// ==================== HOOKS & INITIALIZATION ====================

const TreasureWeaponFeature = {

  init() {
    ITEMS.tanLinh = TREASURE_REFINEMENT_CONFIG.tanLinhItem;

    NPC.types.refinementMaster = {
      name:    '⚗️ Tinh Luyện Sư', title: 'Luyện Bảo Của Tiên Giới',
      sprite:  'npcShop',
      dialog:  'Ta có thể đúc gear của ngươi thành Pháp Bảo. Mang vật phẩm đến đây.',
      service: 'refinement'
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this._injectPanel());
    } else {
      this._injectPanel();
    }

    this._loadSavedData();
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
  },

  _injectPanel() {
    document.getElementById('refinementOverlay')?.remove();
    const ov = document.createElement('div');
    ov.id = 'refinementOverlay';
    ov.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:110;align-items:center;justify-content:center';
    document.body.appendChild(ov);
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
    } catch (e) { console.warn('TreasureWeapon: load error', e); }
  },

  _saveData() {
    try {
      localStorage.setItem('tuxien_treasure_weapon', JSON.stringify({
        weaponMemory: WeaponMemory.getSaveData(),
        refinement:   TreasureRefinement.getSaveData()
      }));
    } catch (e) { console.warn('TreasureWeapon: save error', e); }
  },

  _hookEnemiesKill() {
    const _origKill = Enemies.kill.bind(Enemies);
    Enemies.kill = function(enemy) {
      const pb = TreasureRefinement.getState().phaoBao;
      if (pb?.traits?.some(t => t.id === 'goldRune')) {
        enemy.gold = Math.floor((enemy.gold || 0) * 1.20);
      }
      const accPassive = WeaponMemory.getPassiveForSlot('accessory');
      if (accPassive?.expBonusPct && enemy.exp) {
        enemy.exp = Math.floor(enemy.exp * (1 + accPassive.expBonusPct));
      }

      _origKill(enemy);
      WeaponMemory.onKill(enemy);

      if (pb?.traits?.some(t => t.id === 'lifeRune')) {
        Player.hp = Math.min(Player.maxHp, Player.hp + Math.floor(Player.maxHp * 0.02));
      }
      if (pb?.traits?.some(t => t.id === 'soulRune')) {
        Player.mp = Math.min(Player.maxMp, Player.mp + 5);
      }
    };
  },

  _hookEnemiesDamage() {
    const _origDmg = Enemies.damage.bind(Enemies);
    Enemies.damage = function(enemy, amount, isCrit, color) {
      const pb = TreasureRefinement.getState().phaoBao;

      if (pb?.traits?.some(t => t.id === 'voidRune') && !enemy.boss && Math.random() < 0.05) {
        amount = enemy.hp;
      }
      if (pb?.traits?.some(t => t.id === 'shadowRune') && Player.hp / Player.maxHp < 0.5) {
        amount = Math.floor(amount * 1.10);
      }

      _origDmg(enemy, amount, isCrit, color);

      if (pb?.traits?.some(t => t.id === 'fireRune')) {
        Player._fireRuneStack = (Player._fireRuneStack || 0) + 1;
        if (Player._fireRuneStack >= 5) {
          Player._fireRuneStack = 0;
          if (enemy.alive) {
            const burstDmg = Math.floor(Player.atk * 0.5);
            _origDmg(enemy, burstDmg, false, '#ff4500');
            Game.spawnDamageNumber?.(enemy.x, enemy.y - 30, '🔥' + burstDmg, '#ff4500');
          }
        }
      }

      if (isCrit && pb?.traits?.some(t => t.id === 'thunderRune')) {
        const chainTarget = Enemies.findNearest?.(enemy.x, enemy.y, 150, e => e !== enemy && e.alive);
        if (chainTarget) {
          const chainDmg = Math.floor(amount * 0.30);
          _origDmg(chainTarget, chainDmg, false, '#ffeb3b');
          Game.spawnDamageNumber?.(chainTarget.x, chainTarget.y - 20, '⚡' + chainDmg, '#ffeb3b');
        }
      }
    };
  },

  _hookPlayerRecalc() {
    const _origRecalc = Player.recalculateStats.bind(Player);
    Player.recalculateStats = function() {
      _origRecalc();
      WeaponMemory.applyToStats(Player);
    };
  },

  _hookNPCSpawnForMap() {
    const _origSpawn = NPC.spawnForMap.bind(NPC);
    NPC.spawnForMap = function(mapIndex) {
      _origSpawn(mapIndex);
      if (mapIndex === 2 || mapIndex === 4) NPC.spawn('refinementMaster', 450, 450);
    };
  },

  _hookNPCInteract() {
    const _origInteract = NPC.interact.bind(NPC);
    NPC.interact = function(npc) {
      if (npc?.service === 'refinement') { RefinementPanel.open(); NPC.closeDialog(); return; }
      _origInteract(npc);
    };
  },

  _hookInventoryShowTooltip() {
    const _origTooltip = Inventory.showTooltip.bind(Inventory);
    Inventory.showTooltip = function(itemId, slotIndex, event) {
      _origTooltip(itemId, slotIndex, event);
      const typeEl = document.getElementById('tooltipType');
      if (!typeEl) return;
      const badge = WeaponMemory.renderHUDBadge(itemId);
      if (badge) typeEl.innerHTML += '<br>' + badge;
    };
  },

  _hookInventorySellItem() {
    const _origSell = Inventory.sellItem.bind(Inventory);
    Inventory.sellItem = function(itemId, count = 1) {
      const mem  = WeaponMemory.getMemory(itemId);
      const tier = WeaponMemory.getCurrentTier(mem.kills);
      if (tier && tier.tier >= WEAPON_MEMORY_CONFIG.sellWarningThreshold) {
        const name = mem.customName || ITEMS[itemId]?.name || itemId;
        if (!confirm('⚠️ "' + name + '" đang ở tier ' + tier.name + '!\nBán sẽ mất toàn bộ ký ức chiến đấu.\nTiếp tục?')) {
          return false;
        }
      }
      return _origSell(itemId, count);
    };
  },

  _hookGameInit() {
    if (typeof Game === 'undefined' || !Game.init) return;
    const _origInit = Game.init.bind(Game);
    Game.init = function() { _origInit(); Player.recalculateStats(); };
  },

  _hookGameSaveLoad() {
    if (typeof Game === 'undefined') return;
    if (Game.save) {
      const _origSave = Game.save.bind(Game);
      Game.save = function() { _origSave(); TreasureWeaponFeature._saveData(); };
    }
    if (Game.load) {
      const _origLoad = Game.load.bind(Game);
      Game.load = function() { _origLoad(); TreasureWeaponFeature._loadSavedData(); Player.recalculateStats(); };
    }
  },

  _hookGameRender() {
    if (typeof Game === 'undefined' || !Game.renderPlayer) return;
    const _origRender = Game.renderPlayer.bind(Game);
    Game.renderPlayer = function() {
      _origRender();
      const ctx = Game.ctx;
      if (!ctx) return;

      WeaponMemory.renderAura(ctx);

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
          ctx.beginPath(); ctx.arc(cx, cy, 26 + (pb.evoLevel || 0) * 2, 0, Math.PI * 2); ctx.stroke();
          ctx.setLineDash([]);
          ctx.restore();
        }
      }
    };
  },

  _hookRenderCharacter() {
    if (typeof UI === 'undefined' || !UI.renderCharacter) return;
    const _origRenderChar = UI.renderCharacter.bind(UI);
    UI.renderCharacter = function() { _origRenderChar(); _injectWeaponMemoryHUD(); };
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => TreasureWeaponFeature.init());
} else {
  setTimeout(() => TreasureWeaponFeature.init(), 0);
}
// ===== CHANGES: Thêm _combineStats() helper dùng chung cho previewRefine() và refine() — loại bỏ đoạn combined/Object.keys lặp 2 lần; rút gọn gradeFormula() — hợp nhất nhánh cuối thành ternary; xóa `_ = dropped` pattern; guard early-return thay if-chain dài trong _hookGameInit/_hookGameSaveLoad/_hookGameRender; xóa comment thừa; xóa console.log =====
