// ===== FILE: js/feature_alchemy.js =====
// ==================== PHẦN 1 — DATA & CONFIG ====================

const ALCHEMY_CONFIG = {

  furnaceLevels: [
    { level: 1, name: 'Lò Sơ Cấp',   successBonus: 0,    qualityBonus: 0,
      upgradeCost: { spiritStone: 3, gold: 200 } },
    { level: 2, name: 'Lò Trung Cấp', successBonus: 0.08, qualityBonus: 0.05,
      upgradeCost: { demonCore: 3, spiritStone: 5, gold: 500 } },
    { level: 3, name: 'Lò Cao Cấp',   successBonus: 0.15, qualityBonus: 0.10,
      upgradeCost: { dragonScale: 2, demonCore: 5, gold: 1200 } },
    { level: 4, name: 'Lò Tiên Cấp',  successBonus: 0.25, qualityBonus: 0.18,
      upgradeCost: { celestialOrb: 2, dragonScale: 3, gold: 3000 } },
    { level: 5, name: 'Lò Thần Cấp',  successBonus: 0.35, qualityBonus: 0.28,
      upgradeCost: null }
  ],

  qualityTiers: {
    normal:  { name: 'Thường Phẩm', color: '#aaa',    chance: 0.60, quantityMul: 1.0, statMul: 1.00 },
    good:    { name: 'Thượng Phẩm', color: '#4caf50', chance: 0.30, quantityMul: 1.5, statMul: 1.10 },
    perfect: { name: 'Hoàn Hảo',   color: '#f0c040', chance: 0.10, quantityMul: 2.0, statMul: 1.25 }
  },

  // Bonus thành công theo cảnh giới (index tương ứng REALMS)
  realmBonus: [0, 0.02, 0.05, 0.08, 0.12, 0.16, 0.20, 0.25, 0.30],

  recipeSuccessRates: { common: 0.90, rare: 0.70, epic: 0.50, legendary: 0.30 },
  craftingTime:       { common: 2000, rare: 3000, epic: 4000, legendary: 5000 },

  materialScore: {
    wolfFang: 1, wolfPelt: 1,
    demonCore: 3, spiritStone: 3,
    dragonScale: 8, celestialOrb: 15
  }
};

// ==================== DANH SÁCH CÔNG THỨC ====================

const ALCHEMY_RECIPES = [
  // --- PILLS ---
  {
    id: 'recipe_hpDan', name: 'Luyện Đại Hồi Khí Đan',
    rarity: 'common', category: 'pill',
    inputs: [{ id: 'wolfFang', count: 3 }, { id: 'wolfPelt', count: 2 }],
    output: { id: 'hpPotionMedium', count: 2 },
    discovered: false, desc: 'Hồi phục sinh khí mạnh mẽ'
  },
  {
    id: 'recipe_expDan', name: 'Luyện Tinh Luyện Linh Đan',
    rarity: 'rare', category: 'pill',
    inputs: [{ id: 'demonCore', count: 2 }, { id: 'spiritStone', count: 1 }],
    output: { id: 'expPotion', count: 1 },
    discovered: false, desc: 'Hấp thụ tinh hoa thiên địa'
  },
  {
    id: 'recipe_realmDan', name: 'Luyện Đột Phá Thánh Đan',
    rarity: 'epic', category: 'pill',
    inputs: [{ id: 'dragonScale', count: 1 }, { id: 'celestialOrb', count: 1 }],
    output: { id: 'realmPill', count: 3 },
    discovered: false, desc: 'Phá vỡ giới hạn tu luyện'
  },
  {
    id: 'recipe_jiuzhuan', name: 'Luyện Cửu Chuyển Kim Đan',
    rarity: 'legendary', category: 'pill',
    inputs: [{ id: 'celestialOrb', count: 3 }, { id: 'dragonScale', count: 2 }],
    output: { id: 'realmPill', count: 5 },
    extraOutput: { id: 'expPotion', count: 2 },
    discovered: false, desc: 'Đan dược truyền thuyết, ngàn năm khó gặp'
  },

  // --- WEAPONS ---
  {
    id: 'recipe_lingJian', name: 'Luyện Linh Kiếm',
    rarity: 'rare', category: 'weapon',
    inputs: [{ id: 'wolfFang', count: 5 }, { id: 'spiritStone', count: 2 }],
    output: { id: 'silverSword', count: 1 },
    discovered: false, desc: 'Kiếm chứa linh khí tinh thuần'
  },
  {
    id: 'recipe_huoLong', name: 'Luyện Hỏa Long Kiếm',
    rarity: 'epic', category: 'weapon',
    inputs: [{ id: 'demonCore', count: 3 }, { id: 'dragonScale', count: 1 }],
    output: { id: 'flameSword', count: 1 },
    discovered: false, desc: 'Kiếm phong ấn long hỏa'
  },
  {
    id: 'recipe_tiandi', name: 'Luyện Thiên Địa Kiếm',
    rarity: 'legendary', category: 'weapon',
    inputs: [{ id: 'celestialOrb', count: 2 }, { id: 'dragonScale', count: 3 }],
    output: { id: 'celestialSword', count: 1 },
    discovered: false, desc: 'Thần kiếm đứng đầu thiên hạ'
  },

  // --- ARMORS ---
  {
    id: 'recipe_longJia', name: 'Luyện Long Lân Giáp',
    rarity: 'epic', category: 'armor',
    inputs: [{ id: 'dragonScale', count: 2 }, { id: 'spiritStone', count: 3 }],
    output: { id: 'dragonArmor', count: 1 },
    discovered: false, desc: 'Giáp từ vảy rồng thiên cổ'
  },
  {
    id: 'recipe_xianBao', name: 'Luyện Tiên Nhân Pháp Bào',
    rarity: 'legendary', category: 'armor',
    inputs: [{ id: 'celestialOrb', count: 3 }, { id: 'dragonScale', count: 2 }],
    output: { id: 'celestialRobe', count: 1 },
    discovered: false, desc: 'Pháp bào của tiên nhân'
  },

  // --- ACCESSORIES ---
  {
    id: 'recipe_longPai', name: 'Luyện Long Bài',
    rarity: 'rare', category: 'accessory',
    inputs: [{ id: 'demonCore', count: 2 }, { id: 'wolfFang', count: 4 }],
    output: { id: 'dragonAmulet', count: 1 },
    discovered: false, desc: 'Hộ thân bài khắc hình rồng'
  },
  {
    id: 'recipe_tianjianYu', name: 'Luyện Thiên Tiên Ngọc',
    rarity: 'epic', category: 'accessory',
    inputs: [{ id: 'celestialOrb', count: 2 }, { id: 'spiritStone', count: 4 }],
    output: { id: 'celestialJade', count: 1 },
    discovered: false, desc: 'Ngọc bội tiên nhân'
  }
];


// ==================== PHẦN 2 — LOGIC MODULE ====================

const AlchemySystem = {

  // ── 2A. State ──
  state: {
    furnaceLevel: 1,
    discoveredRecipes: [],
    streak: 0,
    currentlyCrafting: false,
    craftingTimer: null,
    lastCraftResult: null,
    _wasRunning: false
  },

  freeCraftSlots: [null, null, null, null],

  // ── 2B. Recipe helpers ──

  // Tìm recipe theo id — dùng chung cho mọi lookup
  _findRecipe(recipeId) {
    return ALCHEMY_RECIPES.find(r => r.id === recipeId) || null;
  },

  discoverRecipe(recipeId) {
    if (this.state.discoveredRecipes.indexOf(recipeId) !== -1) return;
    const recipe = this._findRecipe(recipeId);
    if (!recipe) return;
    recipe.discovered = true;
    this.state.discoveredRecipes.push(recipeId);
    UI.addLog('📜 Khám phá công thức: ' + recipe.name + '!', 'item');
    UI.showNotification('📜 Công Thức Mới!', recipe.name);
    this.saveData();
  },

  getDiscoveredRecipes() {
    return ALCHEMY_RECIPES.filter(r => r.discovered);
  },

  getAllRecipes() {
    return ALCHEMY_RECIPES.map(r =>
      r.discovered ? r : Object.assign({}, r, { _hidden: true, name: '??? (Chưa khám phá)' })
    );
  },

  // ── 2C. Success Rate / Quality ──

  calculateSuccessRate(recipe) {
    const base         = ALCHEMY_CONFIG.recipeSuccessRates[recipe.rarity] || 0.5;
    const realmBonus   = ALCHEMY_CONFIG.realmBonus[Player.realm] || 0;
    const furnaceCfg   = ALCHEMY_CONFIG.furnaceLevels[this.state.furnaceLevel - 1];
    const furnaceBonus = furnaceCfg ? furnaceCfg.successBonus : 0;
    const streakBonus  = Math.min(0.20, this.state.streak * 0.02);
    return Math.min(0.95, base + realmBonus + furnaceBonus + streakBonus);
  },

  calculateQuality() {
    const furnaceCfg = ALCHEMY_CONFIG.furnaceLevels[this.state.furnaceLevel - 1];
    const fqb        = furnaceCfg ? furnaceCfg.qualityBonus : 0;

    const perfectChance = Math.min(ALCHEMY_CONFIG.qualityTiers.perfect.chance + fqb * 0.4, 0.40);
    const goodChance    = Math.min(ALCHEMY_CONFIG.qualityTiers.good.chance    + fqb * 0.6, 0.55);

    const roll = Math.random();
    if (roll < perfectChance)               return 'perfect';
    if (roll < perfectChance + goodChance)  return 'good';
    return 'normal';
  },

  // ── 2D. Crafting Logic ──

  canCraft(recipeId, quantity = 1) {
    const recipe = this._findRecipe(recipeId);
    if (!recipe) return { canCraft: false, missing: [] };

    const missing = [];
    for (const inp of recipe.inputs) {
      const need = inp.count * quantity;
      const have = Inventory.getCount(inp.id);
      if (have < need) {
        const itemData = ITEMS[inp.id];
        missing.push({ name: itemData ? itemData.name : inp.id, need, have });
      }
    }
    return { canCraft: missing.length === 0, missing };
  },

  startCraft(recipeId, quantity = 1) {
    if (this.state.currentlyCrafting) {
      UI.addLog('⚗️ Đang luyện đan, vui lòng chờ!', 'system');
      return false;
    }

    const recipe = this._findRecipe(recipeId);
    if (!recipe) return false;

    const check = this.canCraft(recipeId, quantity);
    if (!check.canCraft) {
      const missingText = check.missing.map(m => m.name + ' (' + m.have + '/' + m.need + ')').join(', ');
      UI.addLog('❌ Thiếu nguyên liệu: ' + missingText, 'system');
      return false;
    }

    for (const inp of recipe.inputs) {
      Inventory.remove(inp.id, inp.count * quantity);
    }
    Inventory.render();

    this.state.currentlyCrafting = true;
    this.state._wasRunning = GameState.running;
    GameState.running = false;

    const craftingTime = Math.floor(
      (ALCHEMY_CONFIG.craftingTime[recipe.rarity] || 3000) * (1 + (quantity - 1) * 0.5)
    );

    AlchemyUI.showCraftingAnimation(craftingTime, recipe);
    this.state.craftingTimer = setTimeout(() => {
      AlchemySystem.completeCraft(recipeId, quantity, false);
    }, craftingTime);

    return true;
  },

  completeCraft(recipeId, quantity = 1, skipMaterialDeduct) {
    this.state.currentlyCrafting = false;
    this.state.craftingTimer = null;
    if (this.state._wasRunning) GameState.running = true;

    const recipe = this._findRecipe(recipeId);
    if (!recipe) return;

    const successRate = this.calculateSuccessRate(recipe);
    const success     = Math.random() < successRate;

    if (success) {
      this.state.streak++;
      const quality     = this.calculateQuality();
      const qualityData = ALCHEMY_CONFIG.qualityTiers[quality];
      const finalCount  = Math.max(1, Math.floor(recipe.output.count * quantity * qualityData.quantityMul));

      Inventory.add(recipe.output.id, finalCount);

      if (recipe.extraOutput) {
        const extraCount = Math.max(1, Math.floor(recipe.extraOutput.count * qualityData.quantityMul));
        Inventory.add(recipe.extraOutput.id, extraCount);
      }

      this.discoverRecipe(recipeId);

      const outputItem = ITEMS[recipe.output.id];
      const outputName = outputItem ? outputItem.name : recipe.output.id;

      this.state.lastCraftResult = {
        success: true, quality,
        output: { id: recipe.output.id, count: finalCount, name: outputName },
        recipe
      };
      UI.addLog('⚗️ Luyện đan thành công! ' + qualityData.name + ' ' + outputName + ' x' + finalCount, 'item');
    } else {
      this.state.streak = 0;
      this.state.lastCraftResult = { success: false, recipe };
      UI.addLog('💥 Luyện đan thất bại! Nguyên liệu đã mất.', 'system');
    }

    AlchemyUI.showCraftResult(this.state.lastCraftResult);
    Inventory.render();
  },

  // ── 2E. Free Craft ──

  setFreeCraftSlot(slotIndex, itemId, count) {
    if (slotIndex < 0 || slotIndex > 3) return false;
    const itemData = ITEMS[itemId];
    if (!itemData || itemData.type !== 'material') {
      UI.addLog('❌ Chỉ có thể dùng nguyên liệu để tự luyện!', 'system');
      return false;
    }
    this.freeCraftSlots[slotIndex] = { id: itemId, count: count || 1 };
    return true;
  },

  clearFreeCraftSlot(slotIndex) {
    if (slotIndex < 0 || slotIndex > 3) return;
    this.freeCraftSlots[slotIndex] = null;
  },

  tryFreeCraft() {
    const filledSlots = this.freeCraftSlots.filter(s => s !== null);

    if (filledSlots.length < 2 || filledSlots.length > 4) {
      UI.addLog('❌ Cần 2~4 loại nguyên liệu để tự luyện!', 'system');
      return false;
    }

    const totalCount = filledSlots.reduce((sum, s) => sum + (s.count || 1), 0);
    if (totalCount < 3 || totalCount > 10) {
      UI.addLog('❌ Tổng số lượng nguyên liệu phải từ 3~10!', 'system');
      return false;
    }

    for (const slot of filledSlots) {
      if (!Inventory.has(slot.id, slot.count)) {
        const itemData = ITEMS[slot.id];
        UI.addLog('❌ Không đủ ' + (itemData ? itemData.name : slot.id) + '!', 'system');
        return false;
      }
    }

    for (const slot of filledSlots) {
      Inventory.remove(slot.id, slot.count);
    }
    Inventory.render();

    this.resolveFreeCraft(filledSlots);
    return true;
  },

  resolveFreeCraft(slots) {
    // Bước 1 — Thử match với recipe có sẵn
    const slotMap = {};
    for (const s of slots) slotMap[s.id] = s.count;

    for (const recipe of ALCHEMY_RECIPES) {
      if (recipe.inputs.length !== slots.length) continue;

      const matched = recipe.inputs.every(inp => slotMap[inp.id] && slotMap[inp.id] >= inp.count);

      if (matched) {
        this.state.currentlyCrafting = true;
        this.state._wasRunning = GameState.running;
        GameState.running = false;

        const craftingTime = ALCHEMY_CONFIG.craftingTime[recipe.rarity] || 3000;
        AlchemyUI.showCraftingAnimation(craftingTime, recipe);

        const recipeId = recipe.id;
        this.state.craftingTimer = setTimeout(() => {
          AlchemySystem.completeCraft(recipeId, 1, true);
        }, craftingTime);

        return;
      }
    }

    // Bước 2 — Không match → tính power score
    let totalScore = 0;
    for (const slot of slots) {
      totalScore += (ALCHEMY_CONFIG.materialScore[slot.id] || 1) * slot.count;
    }

    if (Math.random() < 0.40) {
      let resultId, resultCount;

      if (totalScore < 10) {
        const pool = ['hpPotion', 'mpPotion', 'expPotion'];
        resultId    = pool[Math.floor(Math.random() * pool.length)];
        resultCount = 1;
      } else if (totalScore <= 25) {
        const pool = ['spiritRobe', 'silverSword', 'spiritPendant', 'realmPill'];
        resultId    = pool[Math.floor(Math.random() * pool.length)];
        resultCount = resultId === 'realmPill' ? 2 : 1;
      } else if (totalScore <= 50) {
        const pool = ['flameSword', 'frostSword', 'dragonArmor', 'dragonAmulet'];
        resultId    = pool[Math.floor(Math.random() * pool.length)];
        resultCount = 1;
      } else {
        const pool = ['celestialSword', 'celestialRobe', 'celestialJade'];
        resultId    = pool[Math.floor(Math.random() * pool.length)];
        resultCount = 1;
      }

      Inventory.add(resultId, resultCount);
      Inventory.render();

      const itemData = ITEMS[resultId];
      const itemName = itemData ? itemData.name : resultId;
      UI.showNotification('✨ Kỳ Ngộ!', 'Tự luyện thành ' + itemName);
      UI.addLog('✨ Tự luyện thành công! Nhận được ' + itemName + ' x' + resultCount, 'item');
      AlchemyUI.showFreeCraftResult(true, { id: resultId, count: resultCount, name: itemName });
    } else {
      UI.addLog('💥 Nguyên liệu không tương thích, lò phát nổ!', 'system');
      const overlay = document.getElementById('alchemyOverlay');
      if (overlay) {
        overlay.style.animation = 'alchemyShake 300ms ease';
        setTimeout(() => { overlay.style.animation = ''; }, 350);
      }
      AlchemyUI.showFreeCraftResult(false, null);
    }

    this.freeCraftSlots = [null, null, null, null];
  },

  // ── 2F. Furnace Upgrade ──

  upgradeFurnace() {
    const lvl = this.state.furnaceLevel;
    if (lvl >= 5) {
      UI.addLog('🔥 Lò đã đạt cấp tối đa!', 'system');
      return false;
    }

    const cost = ALCHEMY_CONFIG.furnaceLevels[lvl - 1].upgradeCost;
    if (!cost) return false;

    if (cost.gold && Player.gold < cost.gold) {
      UI.addLog('❌ Không đủ vàng! Cần ' + cost.gold + ' vàng.', 'system');
      return false;
    }

    for (const matId in cost) {
      if (matId === 'gold') continue;
      if (!Inventory.has(matId, cost[matId])) {
        const itemData = ITEMS[matId];
        UI.addLog('❌ Thiếu ' + (itemData ? itemData.name : matId) + ' x' + cost[matId], 'system');
        return false;
      }
    }

    for (const matId in cost) {
      if (matId === 'gold') continue;
      Inventory.remove(matId, cost[matId]);
    }
    if (cost.gold) { Player.gold -= cost.gold; UI.updateGold(); }

    this.state.furnaceLevel++;
    Inventory.render();

    const newCfg = ALCHEMY_CONFIG.furnaceLevels[this.state.furnaceLevel - 1];
    UI.showNotification('🔥 Lò Nâng Cấp!', newCfg.name);
    UI.addLog('🔥 Lò luyện đan lên cấp ' + this.state.furnaceLevel + '!', 'system');

    AlchemyUI.renderFurnaceInfo();
    this.saveData();
    return true;
  },

  getFurnaceConfig() {
    return ALCHEMY_CONFIG.furnaceLevels[this.state.furnaceLevel - 1];
  },

  // ── 2G. Save / Load ──

  saveData() {
    try {
      localStorage.setItem('tuxien_alchemy', JSON.stringify({
        furnaceLevel:      this.state.furnaceLevel,
        discoveredRecipes: this.state.discoveredRecipes,
        streak:            this.state.streak
      }));
    } catch (e) {
      console.error('Alchemy save error:', e);
    }
  },

  loadData() {
    try {
      const raw = localStorage.getItem('tuxien_alchemy');
      if (!raw) return;
      const data = JSON.parse(raw);
      if (typeof data.furnaceLevel === 'number')     this.state.furnaceLevel = data.furnaceLevel;
      if (typeof data.streak       === 'number')     this.state.streak       = data.streak;
      if (Array.isArray(data.discoveredRecipes)) {
        this.state.discoveredRecipes = data.discoveredRecipes;
        for (const id of this.state.discoveredRecipes) {
          const r = this._findRecipe(id);
          if (r) r.discovered = true;
        }
      }
    } catch (e) {
      console.error('Alchemy load error:', e);
    }
  },

  init() {
    AlchemyUI._injectHTML();
    AlchemyUI._injectStyles();
    AlchemyUI._setupEvents();
  }
};


// ==================== PHẦN 3A — UI MODULE ====================

const AlchemyUI = {

  currentTab: 'recipes',
  currentDiscoveredFilter: 'all',
  _particleLoop: null,
  _particles: [],
  _progressStart: 0,
  _progressDuration: 0,

  _injectHTML() {
    const html = `
<div id="alchemyOverlay" class="modal-overlay" style="display:none;z-index:110;position:fixed;inset:0;background:rgba(0,0,0,0.6);align-items:center;justify-content:center;">
  <div class="modal-panel" style="background:linear-gradient(135deg,#1a1a2e,#16213e);border:3px solid #f0c040;border-radius:15px;padding:18px;max-width:420px;width:94vw;max-height:82vh;overflow-y:auto;position:relative;font-family:'Courier New',monospace;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
      <div style="color:#f0c040;font-size:16px;font-weight:bold;">⚗️ Lò Luyện Đan</div>
      <div id="alchemyClose" style="color:#888;font-size:18px;cursor:pointer;padding:4px 8px;border-radius:4px;transition:color 0.2s;" onmouseover="this.style.color='#f44336'" onmouseout="this.style.color='#888'">✕</div>
    </div>
    <div id="alchemyFurnaceBar" style="background:rgba(255,152,0,0.1);border:1px solid #ff9800;border-radius:8px;padding:8px 12px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
      <span id="alchemyFurnaceName" style="color:#ff9800;font-size:11px;font-weight:bold;"></span>
      <span id="alchemySuccessRate" style="color:#4caf50;font-size:10px;"></span>
      <button id="alchemyUpgradeBtn" style="padding:4px 10px;border:1px solid #ff9800;background:rgba(255,152,0,0.2);border-radius:5px;color:#ff9800;font-size:9px;cursor:pointer;font-family:inherit;">⬆ Nâng Cấp</button>
    </div>
    <div id="alchemyTabRow" style="display:flex;gap:6px;margin-bottom:12px;">
      <div class="alchemy-tab-btn alchemy-tab-active" data-tab="recipes"    style="flex:1;text-align:center;padding:8px 4px;border-radius:6px;cursor:pointer;font-size:11px;font-weight:bold;">📜 Công Thức</div>
      <div class="alchemy-tab-btn"                    data-tab="freecraft"  style="flex:1;text-align:center;padding:8px 4px;border-radius:6px;cursor:pointer;font-size:11px;font-weight:bold;">🔮 Tự Luyện</div>
      <div class="alchemy-tab-btn"                    data-tab="discovered" style="flex:1;text-align:center;padding:8px 4px;border-radius:6px;cursor:pointer;font-size:11px;font-weight:bold;">✨ Đã Biết</div>
    </div>
    <div id="alchemyContent" style="min-height:300px;"></div>
  </div>
</div>

<div id="alchemyCraftingOverlay" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.88);z-index:120;flex-direction:column;align-items:center;justify-content:center;">
  <div id="alchemyFireCanvas" style="width:120px;height:120px;position:relative;margin-bottom:4px;">
    <canvas id="alchemyParticleCanvas" width="120" height="120" style="position:absolute;top:0;left:0;"></canvas>
    <div id="alchemyCauldronIcon" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:40px;">⚗️</div>
  </div>
  <div id="alchemyCraftingName" style="color:#f0c040;font-size:14px;font-weight:bold;margin:12px 0 8px;text-align:center;font-family:'Courier New',monospace;"></div>
  <div style="width:200px;height:10px;background:#111;border:2px solid #f0c040;border-radius:5px;overflow:hidden;">
    <div id="alchemyProgressBar" style="height:100%;background:linear-gradient(90deg,#ff9800,#f0c040);width:0%;transition:none;"></div>
  </div>
  <div id="alchemyProgressText" style="color:#888;font-size:10px;margin-top:6px;font-family:'Courier New',monospace;"></div>
</div>

<div id="alchemyResultPopup" style="display:none;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:130;background:linear-gradient(135deg,#1a1a2e,#16213e);border:3px solid #f0c040;border-radius:15px;padding:24px;min-width:260px;text-align:center;box-shadow:0 0 40px rgba(240,192,64,0.4);font-family:'Courier New',monospace;">
  <div id="alchemyResultIcon"    style="font-size:48px;margin-bottom:8px;"></div>
  <div id="alchemyResultTitle"   style="font-size:16px;font-weight:bold;margin-bottom:6px;"></div>
  <div id="alchemyResultQuality" style="font-size:12px;margin-bottom:8px;"></div>
  <div id="alchemyResultItem"    style="font-size:13px;margin-bottom:16px;color:#ccc;"></div>
  <button id="alchemyResultOk" style="padding:10px 30px;background:rgba(240,192,64,0.2);border:2px solid #f0c040;border-radius:8px;color:#f0c040;font-size:12px;cursor:pointer;font-family:inherit;font-weight:bold;">確認 OK</button>
</div>

<div id="alchemyMaterialPicker" style="display:none;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:140;background:linear-gradient(135deg,#1a1a2e,#16213e);border:2px solid #ff9800;border-radius:12px;padding:16px;min-width:220px;max-width:90vw;max-height:70vh;overflow-y:auto;font-family:'Courier New',monospace;">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
    <span style="color:#ff9800;font-size:12px;font-weight:bold;">🔮 Chọn Nguyên Liệu</span>
    <span id="alchemyPickerClose" style="color:#888;cursor:pointer;font-size:14px;">✕</span>
  </div>
  <div id="alchemyPickerGrid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;"></div>
</div>`;
    document.body.insertAdjacentHTML('beforeend', html);
  },

  _injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
@keyframes alchemyGlow  { 0%,100%{box-shadow:0 0 20px rgba(240,192,64,0.4)} 50%{box-shadow:0 0 40px rgba(240,192,64,0.8)} }
@keyframes alchemyShake { 0%,100%{transform:translate(-50%,-50%)} 25%{transform:translate(-53%,-50%)} 75%{transform:translate(-47%,-50%)} }
.alchemy-perfect { animation: alchemyGlow 1.5s infinite; }
.alchemy-tab-btn { color:#888; background:rgba(255,255,255,0.04); border:2px solid #444; transition:all 0.2s; user-select:none; }
.alchemy-tab-active { color:#f0c040 !important; background:rgba(240,192,64,0.12) !important; border-color:#f0c040 !important; }
#alchemyContent::-webkit-scrollbar { width:5px; }
#alchemyContent::-webkit-scrollbar-thumb { background:#f0c040; border-radius:3px; }
#alchemyContent::-webkit-scrollbar-track { background:#1a1a2e; }
.alchemy-recipe-card { background:rgba(255,255,255,0.04); border:1px solid #333; border-radius:8px; padding:10px; margin-bottom:8px; transition:border-color 0.2s; }
.alchemy-recipe-card:hover { border-color:#555; }
.alchemy-slot { width:68px;height:68px;border:2px dashed #555;border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;font-size:11px;color:#666;background:rgba(255,255,255,0.03);transition:border-color 0.2s,background 0.2s;user-select:none; }
.alchemy-slot:hover { border-color:#ff9800; background:rgba(255,152,0,0.06); }
.alchemy-slot.filled { border-color:#ff9800; border-style:solid; color:#ccc; }
.alchemy-craft-btn { padding:5px 12px;border-radius:5px;border:1px solid;cursor:pointer;font-family:inherit;font-size:10px;font-weight:bold;transition:opacity 0.2s; }
.alchemy-craft-btn:disabled { opacity:0.4; cursor:not-allowed; }`;
    document.head.appendChild(style);
  },

  _setupEvents() {
    document.getElementById('alchemyClose').addEventListener('click', () => AlchemyUI.close());

    document.getElementById('alchemyOverlay').addEventListener('click', (e) => {
      if (e.target === document.getElementById('alchemyOverlay')) AlchemyUI.close();
    });

    document.getElementById('alchemyResultOk').addEventListener('click', () => {
      document.getElementById('alchemyResultPopup').style.display = 'none';
      AlchemyUI.renderTab(AlchemyUI.currentTab);
    });

    document.getElementById('alchemyUpgradeBtn').addEventListener('click', () => {
      AlchemySystem.upgradeFurnace();
    });

    document.getElementById('alchemyTabRow').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-tab]');
      if (!btn) return;
      document.querySelectorAll('.alchemy-tab-btn').forEach(b => b.classList.remove('alchemy-tab-active'));
      btn.classList.add('alchemy-tab-active');
      AlchemyUI.currentTab = btn.dataset.tab;
      AlchemyUI.renderTab(btn.dataset.tab);
    });

    document.getElementById('alchemyPickerClose').addEventListener('click', () => {
      document.getElementById('alchemyMaterialPicker').style.display = 'none';
    });
  },

  open() {
    document.getElementById('alchemyOverlay').style.display = 'flex';
    this.renderFurnaceInfo();
    this.renderTab(this.currentTab);
  },

  close() {
    document.getElementById('alchemyOverlay').style.display = 'none';
    document.getElementById('alchemyMaterialPicker').style.display = 'none';

    if (AlchemySystem.state.currentlyCrafting && AlchemySystem.state.craftingTimer) {
      clearTimeout(AlchemySystem.state.craftingTimer);
      AlchemySystem.state.craftingTimer    = null;
      AlchemySystem.state.currentlyCrafting = false;
      if (AlchemySystem.state._wasRunning) GameState.running = true;
      this.hideCraftingAnimation();
      UI.addLog('⚗️ Đã hủy luyện đan (đóng lò).', 'system');
    }
  },

  renderFurnaceInfo() {
    const cfg = AlchemySystem.getFurnaceConfig();
    document.getElementById('alchemyFurnaceName').textContent =
      '🔥 ' + cfg.name + ' (Cấp ' + AlchemySystem.state.furnaceLevel + '/5)';

    const rate   = Math.round(AlchemySystem.calculateSuccessRate(ALCHEMY_RECIPES[0]) * 100);
    const streak = AlchemySystem.state.streak;
    document.getElementById('alchemySuccessRate').textContent =
      '✨ Streak: ' + streak + ' | Tỷ lệ: ~' + rate + '%+';

    const upgradeBtn = document.getElementById('alchemyUpgradeBtn');
    if (AlchemySystem.state.furnaceLevel >= 5) {
      upgradeBtn.style.display = 'none';
      const bar = document.getElementById('alchemyFurnaceBar');
      if (!document.getElementById('alchemyMaxLabel')) {
        const span = document.createElement('span');
        span.id = 'alchemyMaxLabel';
        span.style.cssText = 'color:#f0c040;font-size:10px;';
        span.textContent = '✨ Tối Đa';
        bar.appendChild(span);
      }
    } else {
      upgradeBtn.style.display = '';
      const nextCfg = ALCHEMY_CONFIG.furnaceLevels[AlchemySystem.state.furnaceLevel];
      if (nextCfg && nextCfg.upgradeCost) {
        const costParts = [];
        for (const k in nextCfg.upgradeCost) {
          const v = nextCfg.upgradeCost[k];
          costParts.push(k === 'gold' ? v + ' 💰' : (ITEMS[k] ? ITEMS[k].name : k) + ' x' + v);
        }
        upgradeBtn.title = 'Chi phí: ' + costParts.join(', ');
      }
    }
  },

  renderTab(tabName) {
    this.currentTab = tabName;
    const content = document.getElementById('alchemyContent');
    content.innerHTML = '';
    if (tabName === 'recipes')    this._renderRecipesTab(content);
    if (tabName === 'freecraft')  this._renderFreecraftTab(content);
    if (tabName === 'discovered') this._renderDiscoveredTab(content);
  },

  _renderRecipesTab(container) {
    const categories  = [
      { key: 'pill',      label: '💊 Đan Dược' },
      { key: 'weapon',    label: '⚔️ Vũ Khí' },
      { key: 'armor',     label: '🛡️ Giáp' },
      { key: 'accessory', label: '💎 Phụ Kiện' }
    ];
    const rarityColors = { common: '#888', rare: '#a855f7', epic: '#f97316', legendary: '#f0c040' };

    for (const cat of categories) {
      const recipes = ALCHEMY_RECIPES.filter(r => r.category === cat.key);
      if (!recipes.length) continue;

      const groupTitle = document.createElement('div');
      groupTitle.style.cssText = 'color:#f0c040;font-size:11px;font-weight:bold;margin:10px 0 6px;border-bottom:1px solid #333;padding-bottom:4px;';
      groupTitle.textContent = cat.label;
      container.appendChild(groupTitle);

      for (const recipe of recipes) {
        const card = document.createElement('div');
        card.className = 'alchemy-recipe-card';

        if (!recipe.discovered) {
          card.style.opacity = '0.4';
          card.innerHTML = `<div style="color:#666;font-size:12px;font-weight:bold;">🔒 ???</div>
            <div style="color:#555;font-size:9px;margin-top:4px;">Thử tự luyện để khám phá</div>`;
          container.appendChild(card);
          continue;
        }

        const rColor      = rarityColors[recipe.rarity] || '#888';
        const successRate = Math.round(AlchemySystem.calculateSuccessRate(recipe) * 100);
        const outputName  = ITEMS[recipe.output.id] ? ITEMS[recipe.output.id].name : recipe.output.id;
        const inputsHTML  = recipe.inputs.map(inp => {
          const have   = Inventory.getCount(inp.id);
          const enough = have >= inp.count;
          const name   = ITEMS[inp.id] ? ITEMS[inp.id].name : inp.id;
          return `<span style="color:${enough ? '#4caf50' : '#f44336'};font-size:9px;">${name} x${inp.count} (${have})</span>`;
        }).join('<br>');

        const check1 = AlchemySystem.canCraft(recipe.id, 1);
        const check3 = AlchemySystem.canCraft(recipe.id, 3);

        card.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
            <div style="flex:1;">
              <div style="color:${rColor};font-size:11px;font-weight:bold;margin-bottom:3px;">${recipe.name}</div>
              <div style="color:#777;font-size:9px;margin-bottom:6px;">${recipe.desc}</div>
              <div>${inputsHTML}</div>
            </div>
            <div style="text-align:right;flex-shrink:0;">
              <div style="color:#ccc;font-size:10px;margin-bottom:4px;">→ ${outputName} x${recipe.output.count}</div>
              ${recipe.extraOutput ? '<div style="color:#8ef;font-size:9px;">+ Extra!</div>' : ''}
              <div style="color:#4caf50;font-size:9px;">${successRate}% thành công</div>
            </div>
          </div>
          <div style="display:flex;gap:6px;margin-top:8px;">
            <button class="alchemy-craft-btn" data-recipe="${recipe.id}" data-qty="1"
              style="border-color:${rColor};color:${rColor};background:rgba(0,0,0,0.3);"
              ${check1.canCraft ? '' : 'disabled'}>⚗️ Luyện x1</button>
            <button class="alchemy-craft-btn" data-recipe="${recipe.id}" data-qty="3"
              style="border-color:${rColor};color:${rColor};background:rgba(0,0,0,0.3);"
              ${check3.canCraft ? '' : 'disabled'}>⚗️ Luyện x3</button>
          </div>`;
        container.appendChild(card);
      }
    }

    container.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-recipe]');
      if (!btn || btn.disabled) return;
      AlchemySystem.startCraft(btn.dataset.recipe, parseInt(btn.dataset.qty) || 1);
    });
  },

  _renderFreecraftTab(container) {
    const slotsTitle = document.createElement('div');
    slotsTitle.style.cssText = 'color:#ff9800;font-size:11px;font-weight:bold;margin-bottom:8px;';
    slotsTitle.textContent = '🔮 Tự Ghép Nguyên Liệu (2~4 loại, tổng 3~10)';
    container.appendChild(slotsTitle);

    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:12px;';

    for (let i = 0; i < 4; i++) {
      const slot   = AlchemySystem.freeCraftSlots[i];
      const slotEl = document.createElement('div');
      slotEl.className = 'alchemy-slot' + (slot ? ' filled' : '');
      slotEl.dataset.slot = i;

      if (slot) {
        const it   = ITEMS[slot.id];
        const have = Inventory.getCount(slot.id);
        slotEl.innerHTML = `
          <div style="font-size:9px;color:#ff9800;text-align:center;margin-bottom:3px;">${it ? it.name : slot.id}</div>
          <input type="number" min="1" max="10" value="${slot.count}"
            style="width:44px;text-align:center;background:#111;border:1px solid #555;color:#fff;border-radius:4px;font-family:inherit;font-size:11px;"
            data-slot="${i}" class="alchemy-slot-count">
          <div style="font-size:8px;color:#666;margin-top:2px;">Có: ${have}</div>
          <div style="font-size:9px;color:#f44336;cursor:pointer;margin-top:3px;" data-clear="${i}">✕ Xóa</div>`;
      } else {
        slotEl.innerHTML = '<div style="font-size:22px;">+</div><div style="font-size:9px;">Thêm nguyên liệu</div>';
      }
      grid.appendChild(slotEl);
    }
    container.appendChild(grid);

    let totalScore = 0;
    for (const s of AlchemySystem.freeCraftSlots) {
      if (s) totalScore += (ALCHEMY_CONFIG.materialScore[s.id] || 1) * s.count;
    }
    let tierEstimate = totalScore < 10 ? 'Hạ Phẩm (Tiêu Hao Phẩm)'
      : totalScore <= 25 ? 'Rare (Vũ Khí / Giáp Hiếm)'
      : totalScore <= 50 ? 'Epic (Bảo Khí Epic)'
      : 'Legendary (Thần Khí!)';

    const preview = document.createElement('div');
    preview.style.cssText = 'background:rgba(255,152,0,0.07);border:1px solid #ff9800;border-radius:8px;padding:10px;margin-bottom:12px;font-size:10px;color:#aaa;';
    preview.innerHTML = `
      <div>🔥 <b style="color:#ff9800">Power Score: ${totalScore}</b></div>
      <div>📦 Kết quả có thể: <span style="color:#f0c040;">${tierEstimate}</span></div>
      <div>🎲 Tỷ lệ thành công: <span style="color:#4caf50;">40% (Free Craft)</span></div>`;
    container.appendChild(preview);

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;gap:8px;';
    btnRow.innerHTML = `
      <button id="alchemyFreeCraftBtn"   style="flex:1;padding:10px;border:2px solid #ff9800;background:rgba(255,152,0,0.15);border-radius:8px;color:#ff9800;font-family:inherit;font-size:11px;font-weight:bold;cursor:pointer;">🔮 Bắt Đầu Luyện</button>
      <button id="alchemyClearSlotsBtn"  style="padding:10px 14px;border:1px solid #555;background:rgba(255,255,255,0.04);border-radius:8px;color:#888;font-family:inherit;font-size:11px;cursor:pointer;">🗑️ Xóa Tất Cả</button>`;
    container.appendChild(btnRow);

    grid.addEventListener('click', (e) => {
      const clearBtn = e.target.closest('[data-clear]');
      if (clearBtn) {
        AlchemySystem.clearFreeCraftSlot(parseInt(clearBtn.dataset.clear));
        AlchemyUI.renderTab('freecraft');
        return;
      }
      const slotEl = e.target.closest('[data-slot]');
      if (slotEl && !e.target.closest('input')) {
        AlchemyUI.openMaterialPicker(parseInt(slotEl.dataset.slot));
      }
    });

    grid.addEventListener('change', (e) => {
      if (e.target.classList.contains('alchemy-slot-count')) {
        const idx = parseInt(e.target.dataset.slot);
        const val = Math.max(1, Math.min(10, parseInt(e.target.value) || 1));
        e.target.value = val;
        if (AlchemySystem.freeCraftSlots[idx]) {
          AlchemySystem.freeCraftSlots[idx].count = val;
          AlchemyUI.renderTab('freecraft');
        }
      }
    });

    document.getElementById('alchemyFreeCraftBtn').addEventListener('click', () => {
      AlchemySystem.tryFreeCraft();
      AlchemyUI.renderTab('freecraft');
    });
    document.getElementById('alchemyClearSlotsBtn').addEventListener('click', () => {
      AlchemySystem.freeCraftSlots = [null, null, null, null];
      AlchemyUI.renderTab('freecraft');
    });
  },

  _renderDiscoveredTab(container) {
    const filters = [
      { key: 'all',       label: 'Tất Cả' },
      { key: 'pill',      label: '💊 Đan Dược' },
      { key: 'weapon',    label: '⚔️ Vũ Khí' },
      { key: 'armor',     label: '🛡️ Giáp' },
      { key: 'accessory', label: '💎 Phụ Kiện' }
    ];

    const filterRow = document.createElement('div');
    filterRow.style.cssText = 'display:flex;flex-wrap:wrap;gap:5px;margin-bottom:10px;';
    for (const f of filters) {
      const fb      = document.createElement('button');
      fb.textContent = f.label;
      const isActive = this.currentDiscoveredFilter === f.key;
      fb.style.cssText = `padding:5px 10px;border-radius:5px;border:1px solid ${isActive ? '#f0c040' : '#444'};
        background:${isActive ? 'rgba(240,192,64,0.15)' : 'rgba(255,255,255,0.04)'};
        color:${isActive ? '#f0c040' : '#888'};font-family:inherit;font-size:10px;cursor:pointer;`;
      fb.addEventListener('click', () => {
        this.currentDiscoveredFilter = f.key;
        this._renderDiscoveredTab(container);
      });
      filterRow.appendChild(fb);
    }
    container.innerHTML = '';
    container.appendChild(filterRow);

    const discovered = AlchemySystem.getDiscoveredRecipes().filter(r =>
      this.currentDiscoveredFilter === 'all' || r.category === this.currentDiscoveredFilter
    );

    if (!discovered.length) {
      const empty = document.createElement('div');
      empty.style.cssText = 'color:#555;text-align:center;margin-top:40px;font-size:12px;';
      empty.textContent = '🔒 Chưa khám phá công thức nào trong mục này.';
      container.appendChild(empty);
      return;
    }

    const rarityColors = { common: '#888', rare: '#a855f7', epic: '#f97316', legendary: '#f0c040' };
    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid;gap:6px;';

    for (const recipe of discovered) {
      const rColor     = rarityColors[recipe.rarity] || '#888';
      const outputName = ITEMS[recipe.output.id] ? ITEMS[recipe.output.id].name : recipe.output.id;
      const check1     = AlchemySystem.canCraft(recipe.id, 1);

      const card = document.createElement('div');
      card.style.cssText = `background:rgba(255,255,255,0.04);border:1px solid ${rColor}44;border-radius:8px;padding:8px;display:flex;justify-content:space-between;align-items:center;gap:8px;`;
      card.innerHTML = `
        <div>
          <div style="color:${rColor};font-size:10px;font-weight:bold;">${recipe.name}</div>
          <div style="color:#888;font-size:9px;">→ ${outputName} x${recipe.output.count}</div>
        </div>
        <button class="alchemy-craft-btn" data-recipe="${recipe.id}" data-qty="1"
          style="border-color:${rColor};color:${rColor};background:rgba(0,0,0,0.3);white-space:nowrap;"
          ${check1.canCraft ? '' : 'disabled'}>⚗️ x1</button>`;
      grid.appendChild(card);
    }
    container.appendChild(grid);

    grid.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-recipe]');
      if (!btn || btn.disabled) return;
      AlchemySystem.startCraft(btn.dataset.recipe, parseInt(btn.dataset.qty) || 1);
    });
  },

  showCraftingAnimation(duration, recipe) {
    const overlay = document.getElementById('alchemyCraftingOverlay');
    overlay.style.display = 'flex';
    document.getElementById('alchemyCraftingName').textContent = recipe.name;
    document.getElementById('alchemyProgressBar').style.width = '0%';

    this._progressStart    = performance.now();
    this._progressDuration = duration;
    this._particles        = [];

    const canvas = document.getElementById('alchemyParticleCanvas');
    const ctx    = canvas.getContext('2d');

    const loop = (now) => {
      if (overlay.style.display === 'none') return;

      const elapsed = now - this._progressStart;
      const pct     = Math.min(1, elapsed / this._progressDuration);

      document.getElementById('alchemyProgressBar').style.width = Math.floor(pct * 100) + '%';
      document.getElementById('alchemyProgressText').textContent =
        Math.max(0, (this._progressDuration - elapsed) / 1000).toFixed(1) + ' giây...';

      ctx.clearRect(0, 0, 120, 120);
      for (let i = 0; i < 3; i++) {
        this._particles.push({
          x: 50 + (Math.random() - 0.5) * 30, y: 80 + (Math.random() - 0.5) * 10,
          vx: (Math.random() - 0.5) * 1.5, vy: -(1.5 + Math.random() * 2),
          life: 1, decay: 0.03 + Math.random() * 0.02,
          size: 2 + Math.random() * 4
        });
      }
      for (let i = this._particles.length - 1; i >= 0; i--) {
        const p = this._particles[i];
        p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.life -= p.decay;
        if (p.life <= 0) { this._particles.splice(i, 1); continue; }
        const t = 1 - p.life;
        const color = t < 0.3 ? '#ff9800' : t < 0.65 ? '#f0c040' : `rgba(255,255,255,${p.life})`;
        ctx.globalAlpha = p.life;
        ctx.fillStyle   = color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (pct < 1) this._particleLoop = requestAnimationFrame(loop);
    };

    this._particleLoop = requestAnimationFrame(loop);
  },

  hideCraftingAnimation() {
    document.getElementById('alchemyCraftingOverlay').style.display = 'none';
    if (this._particleLoop) { cancelAnimationFrame(this._particleLoop); this._particleLoop = null; }
    this._particles = [];
  },

  showCraftResult(result) {
    this.hideCraftingAnimation();
    const popup    = document.getElementById('alchemyResultPopup');
    const iconEl   = document.getElementById('alchemyResultIcon');
    const titleEl  = document.getElementById('alchemyResultTitle');
    const qualEl   = document.getElementById('alchemyResultQuality');
    const itemEl   = document.getElementById('alchemyResultItem');

    if (result.success) {
      const qualityData = ALCHEMY_CONFIG.qualityTiers[result.quality];
      iconEl.textContent  = result.quality === 'perfect' ? '✨' : result.quality === 'good' ? '🌟' : '⚗️';
      titleEl.textContent = '✅ Luyện Đan Thành Công!';
      titleEl.style.color = qualityData.color;
      qualEl.textContent  = qualityData.name;
      qualEl.style.color  = qualityData.color;
      itemEl.textContent  = result.output.name + ' x' + result.output.count;
      popup.classList.toggle('alchemy-perfect', result.quality === 'perfect');
    } else {
      iconEl.textContent  = '💥';
      titleEl.textContent = '❌ Luyện Đan Thất Bại';
      titleEl.style.color = '#f44336';
      qualEl.textContent  = '';
      itemEl.textContent  = 'Nguyên liệu đã bị thiêu hủy...';
      popup.classList.remove('alchemy-perfect');
    }
    popup.style.display = 'block';
  },

  showFreeCraftResult(success, resultItem) {
    this.hideCraftingAnimation();
    const popup = document.getElementById('alchemyResultPopup');
    document.getElementById('alchemyResultIcon').textContent    = success ? '✨' : '💥';
    document.getElementById('alchemyResultTitle').textContent   = success ? '✨ Kỳ Ngộ Thành Công!' : '❌ Tự Luyện Thất Bại';
    document.getElementById('alchemyResultTitle').style.color   = success ? '#f0c040' : '#f44336';
    document.getElementById('alchemyResultQuality').textContent = success ? 'Free Craft' : '';
    document.getElementById('alchemyResultItem').textContent    = success && resultItem
      ? resultItem.name + ' x' + resultItem.count
      : 'Nguyên liệu đã bị thiêu hủy...';
    popup.classList.remove('alchemy-perfect');
    popup.style.display = 'block';
  },

  openMaterialPicker(slotIndex) {
    const picker  = document.getElementById('alchemyMaterialPicker');
    const grid    = document.getElementById('alchemyPickerGrid');
    grid.innerHTML = '';

    const materials = Inventory.items.filter(entry => {
      const it = ITEMS[entry.id];
      return it && it.type === 'material' && entry.count > 0;
    });

    if (!materials.length) {
      grid.innerHTML = '<div style="color:#666;font-size:11px;grid-column:span 3;text-align:center;padding:12px;">Không có nguyên liệu nào!</div>';
    } else {
      for (const entry of materials) {
        const it  = ITEMS[entry.id];
        const btn = document.createElement('div');
        btn.style.cssText = 'background:rgba(255,152,0,0.08);border:1px solid #555;border-radius:6px;padding:6px;text-align:center;cursor:pointer;font-size:9px;transition:border-color 0.2s;';
        btn.innerHTML = `<div style="color:#ff9800;margin-bottom:2px;">${it.name}</div><div style="color:#888;">x${entry.count}</div>`;
        btn.addEventListener('mouseover', () => btn.style.borderColor = '#ff9800');
        btn.addEventListener('mouseout',  () => btn.style.borderColor = '#555');
        btn.addEventListener('click', () => {
          AlchemySystem.setFreeCraftSlot(slotIndex, entry.id, 1);
          picker.style.display = 'none';
          AlchemyUI.renderTab('freecraft');
        });
        grid.appendChild(btn);
      }
    }
    picker.style.display = 'block';
  }
};


// ==================== PHẦN 3B — NPC INTEGRATION ====================

NPC.types.alchemist = {
  name: 'Luyện Đan Sư', title: 'Bậc thầy luyện đan',
  sprite: 'npcTeleporter',
  dialog: 'Ngươi muốn luyện đan? Ta có thể giúp ngươi biến nguyên liệu thành bảo vật!',
  service: 'alchemy'
};

(function() {
  const _origInteract = NPC.interact.bind(NPC);
  NPC.interact = function(npc) {
    if (!npc) return;
    if (npc.service === 'alchemy') { NPC.closeDialog(); AlchemyUI.open(); return; }
    _origInteract(npc);
  };
})();

(function() {
  const _origSpawnForMap = NPC.spawnForMap.bind(NPC);
  const alchemistPositions = [
    { x: 450, y: 320 }, { x: 380, y: 450 }, { x: 420, y: 380 },
    { x: 460, y: 420 }, { x: 400, y: 350 }, { x: 440, y: 400 }
  ];
  NPC.spawnForMap = function(mapIndex) {
    _origSpawnForMap(mapIndex);
    const pos = alchemistPositions[mapIndex] || { x: 450, y: 350 };
    NPC.spawn('alchemist', pos.x, pos.y);
  };
})();


// ==================== PHẦN 3C — KHỞI ĐỘNG & HOOKS ====================

(function() {
  const _origSave = Game.save.bind(Game);
  Game.save = function() { _origSave(); AlchemySystem.saveData(); };
})();

(function() {
  const _origLoad = Game.load.bind(Game);
  Game.load = function() { const r = _origLoad(); AlchemySystem.loadData(); return r; };
})();

(function() {
  const _origInit = Game.init.bind(Game);
  Game.init = function() { _origInit(); AlchemySystem.init(); };
})();
// ===== CHANGES: Thêm _findRecipe() helper dùng chung — loại bỏ 7 lần lặp ALCHEMY_RECIPES.find(r=>r.id===recipeId) inline; resolveFreeCraft tính slotMap 1 lần thay vì tính lại trong vòng lặp; rút gọn getAllRecipes() dùng ternary; xóa console.log; bỏ comment load-order thừa cuối file =====
