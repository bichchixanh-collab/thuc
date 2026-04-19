// ==================== EQUIPMENT ENHANCE SYSTEM ====================
// File: js/feature_enhance.js
// Load sau: <script src="js/game.js"></script>
// Author: Senior JS Dev — monkey-patch only, no original files modified
// =================================================================


// =================================================================
// PHẦN 1 — DATA & CONFIG
// =================================================================

const ENHANCE_CONFIG = {
  maxLevel: 10,

  // Bảng nguyên liệu theo mức nâng cấp
  // key = mức hiện tại (trước khi nâng)
  materials: {
    0: { items: [{ id: 'wolfFang', count: 3 }, { id: 'wolfPelt', count: 1 }], gold: 50 },
    1: { items: [{ id: 'wolfFang', count: 3 }, { id: 'wolfPelt', count: 1 }], gold: 50 },
    2: { items: [{ id: 'wolfFang', count: 3 }, { id: 'wolfPelt', count: 1 }], gold: 50 },
    3: { items: [{ id: 'demonCore', count: 2 }, { id: 'spiritStone', count: 1 }], gold: 150 },
    4: { items: [{ id: 'demonCore', count: 2 }, { id: 'spiritStone', count: 1 }], gold: 150 },
    5: { items: [{ id: 'spiritStone', count: 2 }, { id: 'demonCore', count: 2 }], gold: 300 },
    6: { items: [{ id: 'spiritStone', count: 2 }, { id: 'demonCore', count: 2 }], gold: 300 },
    7: { items: [{ id: 'dragonScale', count: 1 }, { id: 'spiritStone', count: 2 }], gold: 600 },
    8: { items: [{ id: 'dragonScale', count: 1 }, { id: 'spiritStone', count: 2 }], gold: 600 },
    9: { items: [{ id: 'celestialOrb', count: 1 }, { id: 'dragonScale', count: 2 }], gold: 1500 }
  },

  // Tỷ lệ thành công (0.0 ~ 1.0) theo mức hiện tại
  successRate: {
    0: 1.0,
    1: 1.0,
    2: 1.0,
    3: 1.0,
    4: 1.0,
    5: 0.8,
    6: 0.7,
    7: 0.5,
    8: 0.35,
    9: 0.2
  },

  // Rủi ro tụt level khi thất bại (chỉ +7 trở lên)
  // { chance: xác suất tụt, dropTo: mức tụt về }
  failRisk: {
    7: { chance: 0.4, dropTo: 6 },
    8: { chance: 0.5, dropTo: 7 },
    9: { chance: 0.6, dropTo: 8 }
  },

  // Bảng stat multiplier — tổng % cộng thêm VÀO stat gốc tại mỗi level
  // Level 1~3: +8% mỗi level
  // Level 4~6: +8%*3 (base) + 15%*(level-3)
  // Level 7~10: +8%*3 + 15%*3 (base) + 25%*(level-6)
  getStatMultiplier(level) {
    if (level <= 0) return 0;
    if (level <= 3) return level * 0.08;
    if (level <= 6) return 3 * 0.08 + (level - 3) * 0.15;
    return 3 * 0.08 + 3 * 0.15 + (level - 6) * 0.25;
  },

  // Màu tên item theo mức nâng
  nameColors: {
    0: null,         // dùng màu rarity gốc
    1: '#e0e0e0',
    2: '#e0e0e0',
    3: '#e0e0e0',
    4: '#4fc3f7',
    5: '#4fc3f7',
    6: '#4fc3f7',
    7: '#ff9800',
    8: '#ff9800',
    9: '#ff9800',
    10: '#f0c040'
  }
};

// Placeholder object — sẽ được điền ở Phần 2
const EnhanceSystem = {};


// =================================================================
// PHẦN 2 — LOGIC MODULE
// =================================================================

// --- Lấy level nâng cấp hiện tại ---
EnhanceSystem.getLevel = function(itemId) {
  if (!Player.enhanceData) return 0;
  return Player.enhanceData[itemId] || 0;
};

// --- Tính stats đã scale theo level nâng ---
EnhanceSystem.getEnhancedStats = function(itemId) {
  const itemData = ITEMS[itemId];
  if (!itemData || !itemData.stats) return {};

  const level = EnhanceSystem.getLevel(itemId);
  if (level === 0) return itemData.stats;

  const multiplier = ENHANCE_CONFIG.getStatMultiplier(level);
  const enhanced = {};

  for (const stat in itemData.stats) {
    const base = itemData.stats[stat];
    if (!base) continue;
    const bonus = Math.floor(base * multiplier);
    enhanced[stat] = base + Math.max(1, bonus);
  }

  return enhanced;
};

// --- Tên hiển thị có suffix mức nâng ---
EnhanceSystem.getDisplayName = function(itemId) {
  const itemData = ITEMS[itemId];
  if (!itemData) return itemId;
  const level = EnhanceSystem.getLevel(itemId);
  if (level === 0) return itemData.name;
  return `${itemData.name} +${level}`;
};

// --- Màu tên theo level ---
EnhanceSystem.getNameColor = function(level) {
  return ENHANCE_CONFIG.nameColors[level] || null;
};

// --- Kiểm tra item có thể nâng cấp không ---
EnhanceSystem.canEnhance = function(itemId) {
  const itemData = ITEMS[itemId];
  if (!itemData) return false;
  if (!['weapon', 'armor', 'accessory'].includes(itemData.type)) return false;
  const level = EnhanceSystem.getLevel(itemId);
  return level < ENHANCE_CONFIG.maxLevel;
};

// --- Lấy nguyên liệu yêu cầu theo mức hiện tại ---
EnhanceSystem.getRequirements = function(currentLevel) {
  if (currentLevel >= ENHANCE_CONFIG.maxLevel) return null;
  return ENHANCE_CONFIG.materials[currentLevel] || null;
};

// --- Kiểm tra đủ điều kiện nâng cấp không ---
EnhanceSystem.checkRequirements = function(itemId) {
  const level = EnhanceSystem.getLevel(itemId);
  const req = EnhanceSystem.getRequirements(level);

  if (!req) return { canDo: false, missing: ['Đã đạt tối đa +10'] };

  const missing = [];

  for (const mat of req.items) {
    if (!Inventory.has(mat.id, mat.count)) {
      const matData = ITEMS[mat.id];
      const have = Inventory.getCount(mat.id);
      missing.push(`${matData ? matData.name : mat.id} (còn thiếu ${mat.count - have})`);
    }
  }

  if (Player.gold < req.gold) {
    missing.push(`Vàng (thiếu ${req.gold - Player.gold})`);
  }

  return { canDo: missing.length === 0, missing };
};

// --- Thực hiện nâng cấp ---
EnhanceSystem.enhance = function(itemId) {
  const check = EnhanceSystem.checkRequirements(itemId);
  if (!check.canDo) {
    UI.addLog(`❌ Không đủ nguyên liệu: ${check.missing.join(', ')}`, 'system');
    return { success: false, newLevel: EnhanceSystem.getLevel(itemId) };
  }

  const level = EnhanceSystem.getLevel(itemId);
  const req = EnhanceSystem.getRequirements(level);
  const displayName = EnhanceSystem.getDisplayName(itemId);

  // Trừ nguyên liệu
  for (const mat of req.items) {
    Inventory.remove(mat.id, mat.count);
  }
  Player.gold -= req.gold;
  UI.updateGold();

  // Roll xác suất thành công
  const rate = ENHANCE_CONFIG.successRate[level] !== undefined
    ? ENHANCE_CONFIG.successRate[level]
    : 1.0;
  const success = Math.random() < rate;

  let newLevel = level;

  if (success) {
    // Nâng cấp thành công
    newLevel = level + 1;
    Player.enhanceData[itemId] = newLevel;
    Player.recalculateStats();

    const newDisplayName = EnhanceSystem.getDisplayName(itemId);
    UI.addLog(`⚒️ ${newDisplayName} nâng cấp thành +${newLevel} thành công!`, 'item');
    UI.showNotification('⚒️ Nâng Cấp Thành Công!', newDisplayName);

    // Spawn particle thành công (vàng/cam)
    EnhanceSystem._spawnParticles(true, newLevel);

  } else {
    // Nâng cấp thất bại
    const risk = ENHANCE_CONFIG.failRisk[level];
    let dropped = false;

    if (risk && Math.random() < risk.chance) {
      // Tụt level
      newLevel = risk.dropTo;
      Player.enhanceData[itemId] = newLevel;
      Player.recalculateStats();
      const droppedName = EnhanceSystem.getDisplayName(itemId);
      UI.addLog(`💔 Nâng cấp thất bại! ${droppedName} tụt về +${newLevel}`, 'system');
      dropped = true;
    } else {
      // Giữ nguyên
      UI.addLog('💨 Nâng cấp thất bại, trang bị giữ nguyên.', 'system');
    }

    // Spawn particle thất bại (xám/đỏ)
    EnhanceSystem._spawnParticles(false, level);
    _ = dropped; // suppress unused warning
  }

  // Cập nhật UI
  Inventory.render();
  UI.renderCharacter && UI.renderCharacter();
  EnhanceSystem.refreshTooltipIfOpen(itemId);

  return { success, newLevel };
};

// --- Spawn particle effect tại vị trí Player ---
EnhanceSystem._spawnParticles = function(success, level) {
  const colors = success
    ? [ENHANCE_CONFIG.nameColors[level] || '#f0c040', '#ff9800', '#ffd700']
    : ['#9e9e9e', '#f44336', '#616161'];

  const count = 20;
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 / count) * i;
    const speed = 0.8 + Math.random() * 1.5;
    const color = colors[Math.floor(Math.random() * colors.length)];

    GameState.particles.push({
      x: Player.x,
      y: Player.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 600 + Math.random() * 400,
      maxLife: 1000,
      size: 2 + Math.random() * 3,
      color: color,
      alpha: 1
    });
  }
};

// --- Refresh tooltip nếu đang mở đúng item ---
EnhanceSystem.refreshTooltipIfOpen = function(itemId) {
  const tooltip = document.getElementById('itemTooltip');
  if (!tooltip) return;
  if (!tooltip.classList.contains('show')) return;
  if (Inventory.selectedItem !== itemId) return;
  EnhanceSystem.appendEnhanceUI(itemId);
};

// --- Append UI nâng cấp vào tooltip ---
EnhanceSystem.appendEnhanceUI = function(itemId) {
  const itemData = ITEMS[itemId];
  if (!itemData) return;
  if (!['weapon', 'armor', 'accessory'].includes(itemData.type)) return;

  // Chỉ hiện nếu item đang được EQUIP
  let isEquipped = false;
  for (const slot in Player.equipped) {
    if (Player.equipped[slot] === itemId) {
      isEquipped = true;
      break;
    }
  }
  if (!isEquipped) return;

  const actions = document.getElementById('tooltipActions');
  if (!actions) return;

  // Xóa enhance UI cũ (nếu đã có)
  const existingEnhanceUI = actions.querySelector('.enhance-section');
  if (existingEnhanceUI) existingEnhanceUI.remove();

  const level = EnhanceSystem.getLevel(itemId);
  const req = EnhanceSystem.getRequirements(level);
  const check = req ? EnhanceSystem.checkRequirements(itemId) : { canDo: false, missing: [] };
  const successRate = ENHANCE_CONFIG.successRate[level] !== undefined
    ? ENHANCE_CONFIG.successRate[level]
    : null;

  // Container section
  const section = document.createElement('div');
  section.className = 'enhance-section';
  section.style.cssText = 'border-top:1px solid #333; margin-top:8px; padding-top:8px;';

  // Tiêu đề
  const title = document.createElement('div');
  const nextLevel = level + 1;
  title.style.cssText = 'color:#f0c040; font-weight:bold; font-size:11px; margin-bottom:6px;';
  title.textContent = `⚒️ Nâng Cấp  [+${level} → +${nextLevel}]`;
  section.appendChild(title);

  if (level >= ENHANCE_CONFIG.maxLevel || !req) {
    // Đã đạt tối đa
    const maxDiv = document.createElement('div');
    maxDiv.style.cssText = 'color:#f0c040; font-size:11px; text-align:center; padding:4px;';
    maxDiv.textContent = '✨ Tối đa +10';
    section.appendChild(maxDiv);
  } else {
    // Danh sách nguyên liệu
    for (const mat of req.items) {
      const matData = ITEMS[mat.id];
      const have = Inventory.getCount(mat.id);
      const enough = have >= mat.count;
      const matName = matData ? matData.name : mat.id;

      const matRow = document.createElement('div');
      matRow.style.cssText = `
        font-size:10px; margin-bottom:3px; display:flex; justify-content:space-between;
        color:${enough ? '#4caf50' : '#f44336'};
      `;
      matRow.innerHTML = `<span>📦 ${matName} x${mat.count}</span><span>có: ${have}</span>`;
      section.appendChild(matRow);
    }

    // Dòng vàng
    const haveGold = Player.gold;
    const enoughGold = haveGold >= req.gold;
    const goldRow = document.createElement('div');
    goldRow.style.cssText = `
      font-size:10px; margin-bottom:3px; display:flex; justify-content:space-between;
      color:${enoughGold ? '#4caf50' : '#f44336'};
    `;
    goldRow.innerHTML = `<span>💰 ${req.gold} vàng</span><span>có: ${haveGold}</span>`;
    section.appendChild(goldRow);

    // Tỷ lệ thành công
    if (successRate !== null) {
      const rateRow = document.createElement('div');
      rateRow.style.cssText = 'font-size:10px; color:#e0e0e0; margin-bottom:3px;';
      rateRow.textContent = `🎲 Tỷ lệ: ${Math.round(successRate * 100)}%`;
      section.appendChild(rateRow);
    }

    // Cảnh báo tụt level (từ +7 trở lên)
    if (level >= 7 && ENHANCE_CONFIG.failRisk[level]) {
      const warnRow = document.createElement('div');
      warnRow.style.cssText = 'font-size:10px; color:#ff9800; margin-bottom:5px;';
      warnRow.textContent = '⚠️ Thất bại có thể tụt cấp!';
      section.appendChild(warnRow);
    }

    // Nút Nâng Cấp
    const enhBtn = document.createElement('button');
    enhBtn.textContent = '⚒️ Nâng Cấp';
    enhBtn.style.cssText = `
      width:100%; padding:8px; border-radius:5px; font-size:11px; font-weight:bold;
      cursor:${check.canDo ? 'pointer' : 'not-allowed'};
      border:1px solid #ff9800; background:#ff9800; color:#fff;
      font-family:'Courier New', monospace;
      opacity:${check.canDo ? '1' : '0.5'};
      margin-top:4px; transition:opacity 0.15s;
    `;

    if (check.canDo) {
      enhBtn.onclick = function() {
        EnhanceSystem.enhance(itemId);
      };
    } else {
      enhBtn.disabled = true;
      enhBtn.title = '❌ ' + check.missing.join(', ');
    }

    section.appendChild(enhBtn);
  }

  actions.appendChild(section);
};


// =================================================================
// HOOK: Player.recalculateStats — đọc stats từ EnhanceSystem
// =================================================================
(function() {
  const _origRecalc = Player.recalculateStats;

  Player.recalculateStats = function() {
    const realm = REALMS[this.realm];

    this.equipAtk = 0;
    this.equipDef = 0;
    this.equipHp = 0;
    this.equipMp = 0;
    this.equipCritRate = 0;
    this.equipCritDmg = 0;

    for (const slot in this.equipped) {
      const itemId = this.equipped[slot];
      if (!itemId || !ITEMS[itemId]) continue;

      // Dùng stats đã enhance thay vì stats gốc
      const stats = (typeof EnhanceSystem !== 'undefined' && EnhanceSystem.getEnhancedStats)
        ? EnhanceSystem.getEnhancedStats(itemId)
        : (ITEMS[itemId].stats || {});

      this.equipAtk      += stats.atk      || 0;
      this.equipDef      += stats.def      || 0;
      this.equipHp       += stats.hp       || 0;
      this.equipMp       += stats.mp       || 0;
      this.equipCritRate += stats.critRate || 0;
      this.equipCritDmg  += stats.critDmg  || 0;
    }

    // Pet bonuses
    let petAtk = 0, petDef = 0, petSpeed = 0;
    if (this.activePet && PETS[this.activePet]) {
      const pet = PETS[this.activePet];
      petAtk   = pet.bonus.atk   || 0;
      petDef   = pet.bonus.def   || 0;
      petSpeed = pet.bonus.speed || 0;
    }

    this.atk      = this.baseAtk + (this.level - 1) * 3 + realm.atkBonus + this.equipAtk + petAtk;
    this.def      = this.baseDef + (this.level - 1) * 1 + realm.defBonus + this.equipDef + petDef;
    this.maxHp    = 100 + (this.level - 1) * 15 + realm.hpBonus + this.equipHp;
    this.maxMp    = 50  + (this.level - 1) * 8  + this.equipMp;
    this.critRate = 0.08 + this.equipCritRate;
    this.critDmg  = 1.5  + this.equipCritDmg;
    this.speed    = this.baseSpeed + petSpeed;

    this.hp = Math.min(this.hp, this.maxHp);
    this.mp = Math.min(this.mp, this.maxMp);
  };
})();


// =================================================================
// HOOK: Inventory.showTooltip — append enhance UI sau khi render
// =================================================================
(function() {
  const _origShowTooltip = Inventory.showTooltip;

  Inventory.showTooltip = function(itemId, slotIndex, event) {
    _origShowTooltip.call(this, itemId, slotIndex, event);

    // Sau khi tooltip đã render, append phần nâng cấp nếu là equipment
    const itemData = ITEMS[itemId];
    if (itemData && ['weapon', 'armor', 'accessory'].includes(itemData.type)) {
      // Cập nhật tên tooltip với suffix enhance
      const nameEl = document.getElementById('tooltipName');
      if (nameEl && typeof EnhanceSystem.getLevel === 'function') {
        const level = EnhanceSystem.getLevel(itemId);
        if (level > 0) {
          nameEl.textContent = EnhanceSystem.getDisplayName(itemId);
          // Áp màu theo level nâng
          const color = EnhanceSystem.getNameColor(level);
          if (color) {
            nameEl.style.color = color;
            if (level === 10) {
              nameEl.style.textShadow = '0 0 8px #f0c040, 0 0 16px #f0c040';
            } else {
              nameEl.style.textShadow = '';
            }
          }

          // Cập nhật stats tooltip để hiện stats đã enhance
          const statsEl = document.getElementById('tooltipStats');
          if (statsEl) {
            const enhanced = EnhanceSystem.getEnhancedStats(itemId);
            const statNames = {
              atk: '⚔️ Công kích',
              def: '🛡️ Phòng ngự',
              hp: '❤️ Sinh mệnh',
              mp: '💎 Linh lực',
              critRate: '💥 Bạo kích',
              critDmg: '🔥 Bạo thương'
            };
            let statsHtml = '';
            for (const [stat, value] of Object.entries(enhanced)) {
              const base = itemData.stats[stat] || 0;
              const display = stat.includes('crit')
                ? `+${(value * 100).toFixed(0)}%`
                : `+${value}`;
              const baseDisplay = stat.includes('crit')
                ? `(gốc: +${(base * 100).toFixed(0)}%)`
                : value !== base ? `<span style="color:#888;font-size:9px">(gốc: +${base})</span>` : '';
              statsHtml += `${statNames[stat] || stat}: <span style="color:#4fc3f7">${display}</span> ${baseDisplay}<br>`;
            }
            statsEl.innerHTML = statsHtml;
          }
        }
      }

      EnhanceSystem.appendEnhanceUI(itemId);
    }
  };
})();


// =================================================================
// HOOK: Player.getSaveData — thêm enhanceData vào save
// =================================================================
(function() {
  const _origGetSave = Player.getSaveData;

  Player.getSaveData = function() {
    const data = _origGetSave.call(this);
    data.enhanceData = JSON.parse(JSON.stringify(this.enhanceData || {}));
    return data;
  };
})();


// =================================================================
// HOOK: Player.loadSaveData — đọc lại enhanceData từ save
// =================================================================
(function() {
  const _origLoadSave = Player.loadSaveData;

  Player.loadSaveData = function(data) {
    _origLoadSave.call(this, data);
    this.enhanceData = (data && data.enhanceData)
      ? JSON.parse(JSON.stringify(data.enhanceData))
      : {};
  };
})();


// =================================================================
// INJECT CSS một lần duy nhất khi file load
// =================================================================
(function injectEnhanceStyles() {
  if (document.getElementById('enhance-system-style')) return;
  const style = document.createElement('style');
  style.id = 'enhance-system-style';
  style.textContent = `
    .enhance-section { animation: enhanceFadeIn 0.2s ease; }
    @keyframes enhanceFadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
})();


// =================================================================
// PHẦN 3 — KHỞI ĐỘNG
// =================================================================

EnhanceSystem.init = function() {
  // Khởi tạo enhanceData nếu chưa có
  if (!Player.enhanceData) {
    Player.enhanceData = {};
  }

  // Áp stats enhance ngay từ đầu
  Player.recalculateStats();

  console.log('⚒️ Enhance System initialized');
};


// Wrap Game.init để gọi EnhanceSystem.init() sau khi game init xong
(function() {
  const _origGameInit = Game.init;

  Game.init = function() {
    _origGameInit.call(this);
    EnhanceSystem.init();
  };
})();


console.log('⚒️ Equipment Enhance System loaded');
// Thêm vào index.html sau <script src="js/game.js"></script>:
// <script src="js/feature_enhance.js"></script>
