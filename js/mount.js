// ==================== TỌA KỴ (MOUNT) SYSTEM ====================
// File: js/mount.js
// Load sau: feature_enhance.js
// Monkey-patch only — không sửa file gốc
// ================================================================


// ================================================================
// PHẦN 1 — DATA: ĐỊNH NGHĨA CÁC LOẠI TỌA KỴ
// ================================================================

const MOUNTS = {

  // ───── NHÓM THƯỜNG (Common) ─────
  yellowHorse: {
    id: 'yellowHorse',
    name: '🐴 Hoàng Mã',
    type: 'mount', rarity: 'common',
    desc: 'Ngựa vàng dũng mãnh từ đồng bằng. Tăng tốc độ di chuyển.',
    stats: { speed: 0.5, atk: 2 },
    sellPrice: 50,
    icon: 'mount_horse_yellow'
  },
  blackHorse: {
    id: 'blackHorse',
    name: '🐴 Hắc Mã',
    type: 'mount', rarity: 'common',
    desc: 'Ngựa đen bền bỉ vùng núi cao. Tăng HP và tốc độ.',
    stats: { speed: 0.4, hp: 30 },
    sellPrice: 60,
    icon: 'mount_horse_black'
  },
  wildBoar: {
    id: 'wildBoar',
    name: '🐗 Linh Trư',
    type: 'mount', rarity: 'common',
    desc: 'Heo rừng hung hãn, tăng phòng thủ và HP.',
    stats: { def: 5, hp: 50 },
    sellPrice: 55,
    icon: 'mount_boar'
  },

  // ───── NHÓM HIẾM (Rare) ─────
  cloudDeer: {
    id: 'cloudDeer',
    name: '🦌 Vân Lộc',
    type: 'mount', rarity: 'rare',
    desc: 'Hươu vân du trên mây, cực kỳ nhanh nhẹn. Tăng tốc độ và MP.',
    stats: { speed: 0.9, mp: 30 },
    sellPrice: 200,
    icon: 'mount_deer'
  },
  stoneTiger: {
    id: 'stoneTiger',
    name: '🐯 Thạch Hổ',
    type: 'mount', rarity: 'rare',
    desc: 'Hổ đá núi hùng mạnh, tăng mạnh công kích và phòng thủ.',
    stats: { atk: 12, def: 8 },
    sellPrice: 220,
    icon: 'mount_tiger'
  },
  spiritWolf: {
    id: 'spiritWolf',
    name: '🐺 Linh Lang',
    type: 'mount', rarity: 'rare',
    desc: 'Sói linh quỷ quyệt, tăng bạo kích và tốc độ.',
    stats: { speed: 0.7, critRate: 0.03 },
    sellPrice: 250,
    icon: 'mount_wolf'
  },
  iceOx: {
    id: 'iceOx',
    name: '🐂 Băng Ngưu',
    type: 'mount', rarity: 'rare',
    desc: 'Trâu băng kiên cường, tăng mạnh HP và phòng thủ.',
    stats: { hp: 120, def: 12 },
    sellPrice: 230,
    icon: 'mount_ox'
  },
  flameFox: {
    id: 'flameFox',
    name: '🦊 Hỏa Hồ',
    type: 'mount', rarity: 'rare',
    desc: 'Cáo lửa tinh ranh, tăng bạo thương và công kích.',
    stats: { atk: 10, critDmg: 0.15 },
    sellPrice: 260,
    icon: 'mount_fox'
  },

  // ───── NHÓM SỬ THI (Epic) ─────
  thunderBear: {
    id: 'thunderBear',
    name: '🐻 Lôi Hùng',
    type: 'mount', rarity: 'epic',
    desc: 'Gấu sấm sét hùng bá. Tăng mạnh HP, công kích và phòng thủ.',
    stats: { atk: 20, def: 15, hp: 200 },
    sellPrice: 600,
    icon: 'mount_bear'
  },
  skyEagle: {
    id: 'skyEagle',
    name: '🦅 Thần Điêu',
    type: 'mount', rarity: 'epic',
    desc: 'Đại bàng trời xanh, nhanh như chớp. Tăng tốc độ, bạo kích.',
    stats: { speed: 1.2, critRate: 0.06, mp: 40 },
    sellPrice: 650,
    icon: 'mount_eagle'
  },
  voidPanther: {
    id: 'voidPanther',
    name: '🐆 Hư Không Báo',
    type: 'mount', rarity: 'epic',
    desc: 'Báo hư không ẩn thân. Tăng crit rate, crit dmg và tốc độ.',
    stats: { speed: 0.8, critRate: 0.05, critDmg: 0.25 },
    sellPrice: 700,
    icon: 'mount_panther'
  },
  lavaLion: {
    id: 'lavaLion',
    name: '🦁 Nham Thạch Sư',
    type: 'mount', rarity: 'epic',
    desc: 'Sư tử nham thạch hung mãnh. Tăng mạnh công kích và bạo thương.',
    stats: { atk: 30, critDmg: 0.3, hp: 150 },
    sellPrice: 720,
    icon: 'mount_lion'
  },
  spiritTurtle: {
    id: 'spiritTurtle',
    name: '🐢 Linh Quy',
    type: 'mount', rarity: 'epic',
    desc: 'Rùa linh trường thọ, tăng cực mạnh HP và phòng thủ.',
    stats: { hp: 400, def: 30 },
    sellPrice: 680,
    icon: 'mount_turtle'
  },

  // ───── NHÓM HUYỀN THOẠI (Legendary) ─────
  celestialCrane: {
    id: 'celestialCrane',
    name: '🦢 Tiên Hạc',
    type: 'mount', rarity: 'legendary',
    desc: 'Tiên hạc bay trên trời mây, toàn diện cực mạnh. Tăng tất cả chỉ số.',
    stats: { speed: 1.5, atk: 25, mp: 80, critRate: 0.05 },
    sellPrice: 2000,
    icon: 'mount_crane'
  },
  cloudDragon: {
    id: 'cloudDragon',
    name: '🐉 Vân Long',
    type: 'mount', rarity: 'legendary',
    desc: 'Rồng mây uy phong vô song. Tăng mạnh công kích, bạo kích và HP.',
    stats: { atk: 50, critRate: 0.08, critDmg: 0.4, hp: 300 },
    sellPrice: 2500,
    icon: 'mount_cloud_dragon'
  },
  phoenixMount: {
    id: 'phoenixMount',
    name: '🔥 Bất Tử Phượng',
    type: 'mount', rarity: 'legendary',
    desc: 'Phượng Hoàng bất tử hồi sinh từ ngọn lửa. Tăng toàn diện mọi chỉ số.',
    stats: { atk: 40, def: 25, hp: 400, mp: 100, critDmg: 0.5, speed: 1.0 },
    sellPrice: 3000,
    icon: 'mount_phoenix'
  },
  celestialQilin: {
    id: 'celestialQilin',
    name: '🦄 Thiên Lân',
    type: 'mount', rarity: 'legendary',
    desc: 'Thần thú Kỳ Lân tiên giới, thánh khiết vô song.',
    stats: { atk: 35, def: 30, hp: 350, mp: 120, critRate: 0.10, speed: 1.2 },
    sellPrice: 3500,
    icon: 'mount_qilin'
  }
};

// ================================================================
// PHẦN 2 — DROP TABLE: THÊM TỌA KỴ VÀO BẢNG DROP CỦA ENEMY
// ================================================================

const MOUNT_DROPS = {
  // Common mounts — drop từ enemy thường
  wolf:           [{ id: 'yellowHorse',  chance: 0.004 }],
  boar:           [{ id: 'wildBoar',     chance: 0.005 }, { id: 'blackHorse', chance: 0.003 }],
  ghost:          [{ id: 'blackHorse',   chance: 0.004 }],
  demon:          [{ id: 'spiritWolf',   chance: 0.006 }, { id: 'yellowHorse', chance: 0.003 }],
  rockGolem:      [{ id: 'stoneTiger',   chance: 0.007 }, { id: 'iceOx', chance: 0.004 }],
  fireSpirit:     [{ id: 'flameFox',     chance: 0.007 }, { id: 'lavaLion', chance: 0.003 }],
  iceWolf:        [{ id: 'iceOx',        chance: 0.006 }, { id: 'spiritWolf', chance: 0.005 }],
  frostBear:      [{ id: 'thunderBear',  chance: 0.008 }, { id: 'iceOx', chance: 0.005 }],
  darkDemon:      [{ id: 'voidPanther',  chance: 0.006 }, { id: 'flameFox', chance: 0.007 }],
  shadowLord:     [{ id: 'voidPanther',  chance: 0.009 }, { id: 'skyEagle', chance: 0.005 }],
  celestialBeast: [{ id: 'cloudDeer',    chance: 0.01  }, { id: 'thunderBear', chance: 0.008 }],
  divineDragon:   [{ id: 'celestialCrane', chance: 0.008 }, { id: 'cloudDragon', chance: 0.005 }],

  // Boss — tỉ lệ cao hơn nhưng vẫn hiếm
  wolfKing:       [{ id: 'spiritWolf',   chance: 0.06 }, { id: 'stoneTiger', chance: 0.04 }],
  demonLord:      [{ id: 'lavaLion',     chance: 0.05 }, { id: 'voidPanther', chance: 0.04 }],
  iceEmperor:     [{ id: 'spiritTurtle', chance: 0.06 }, { id: 'thunderBear', chance: 0.05 }],
  celestialDragon:[{ id: 'celestialCrane', chance: 0.08 }, { id: 'cloudDragon', chance: 0.06 },
                   { id: 'phoenixMount', chance: 0.04 }, { id: 'celestialQilin', chance: 0.03 }]
};

// ================================================================
// PHẦN 3 — ENHANCE CONFIG CHO TỌA KỴ
// ================================================================

const MOUNT_ENHANCE_CONFIG = {
  maxLevel: 10,

  materials: {
    0: { items: [{ id: 'wolfFang',    count: 3 }, { id: 'wolfPelt',     count: 2 }], gold: 80  },
    1: { items: [{ id: 'wolfFang',    count: 3 }, { id: 'wolfPelt',     count: 2 }], gold: 80  },
    2: { items: [{ id: 'wolfFang',    count: 4 }, { id: 'demonCore',    count: 1 }], gold: 120 },
    3: { items: [{ id: 'demonCore',   count: 2 }, { id: 'spiritStone',  count: 1 }], gold: 200 },
    4: { items: [{ id: 'demonCore',   count: 2 }, { id: 'spiritStone',  count: 2 }], gold: 250 },
    5: { items: [{ id: 'spiritStone', count: 2 }, { id: 'demonCore',    count: 3 }], gold: 400 },
    6: { items: [{ id: 'spiritStone', count: 3 }, { id: 'dragonScale',  count: 1 }], gold: 600 },
    7: { items: [{ id: 'dragonScale', count: 1 }, { id: 'spiritStone',  count: 3 }], gold: 900 },
    8: { items: [{ id: 'dragonScale', count: 2 }, { id: 'celestialOrb', count: 1 }], gold: 1200},
    9: { items: [{ id: 'celestialOrb',count: 1 }, { id: 'dragonScale',  count: 3 }], gold: 2000}
  },

  successRate: { 0:1.0, 1:1.0, 2:1.0, 3:1.0, 4:1.0, 5:0.8, 6:0.7, 7:0.5, 8:0.35, 9:0.2 },

  failRisk: {
    7: { chance: 0.4, dropTo: 6 },
    8: { chance: 0.5, dropTo: 7 },
    9: { chance: 0.6, dropTo: 8 }
  },

  // stat multiplier mỗi level
  getStatMultiplier(level) {
    if (level <= 0) return 0;
    if (level <= 3) return level * 0.08;
    if (level <= 6) return 3 * 0.08 + (level - 3) * 0.15;
    return 3 * 0.08 + 3 * 0.15 + (level - 6) * 0.25;
  },

  nameColors: {
    0: null,
    1: '#e0e0e0', 2: '#e0e0e0', 3: '#e0e0e0',
    4: '#4fc3f7', 5: '#4fc3f7', 6: '#4fc3f7',
    7: '#ff9800', 8: '#ff9800', 9: '#ff9800',
    10: '#f0c040'
  }
};


// ================================================================
// PHẦN 4 — MOUNT SYSTEM MODULE
// ================================================================

const MountSystem = {};

// --- Lấy enhance level của mount ---
MountSystem.getLevel = function(mountId) {
  if (!Player.mountEnhanceData) return 0;
  return Player.mountEnhanceData[mountId] || 0;
};

// --- Tính stats đã scale ---
MountSystem.getEnhancedStats = function(mountId) {
  const mountData = MOUNTS[mountId];
  if (!mountData || !mountData.stats) return {};
  const level = MountSystem.getLevel(mountId);
  if (level === 0) return { ...mountData.stats };

  const mul = MOUNT_ENHANCE_CONFIG.getStatMultiplier(level);
  const result = {};
  for (const stat in mountData.stats) {
    const base = mountData.stats[stat];
    if (stat === 'speed' || stat === 'critRate' || stat === 'critDmg') {
      // Float stats: thêm flat nhỏ
      result[stat] = +(base + base * mul).toFixed(4);
    } else {
      result[stat] = base + Math.max(1, Math.floor(base * mul));
    }
  }
  return result;
};

// --- Tên hiển thị ---
MountSystem.getDisplayName = function(mountId) {
  const mountData = MOUNTS[mountId];
  if (!mountData) return mountId;
  const level = MountSystem.getLevel(mountId);
  return level > 0 ? `${mountData.name} +${level}` : mountData.name;
};

// --- Kiểm tra có thể nâng cấp ---
MountSystem.canEnhance = function(mountId) {
  const level = MountSystem.getLevel(mountId);
  return level < MOUNT_ENHANCE_CONFIG.maxLevel;
};

// --- Lấy yêu cầu nâng cấp ---
MountSystem.getRequirements = function(currentLevel) {
  if (currentLevel >= MOUNT_ENHANCE_CONFIG.maxLevel) return null;
  return MOUNT_ENHANCE_CONFIG.materials[currentLevel] || null;
};

// --- Kiểm tra đủ nguyên liệu ---
MountSystem.checkRequirements = function(mountId) {
  const level = MountSystem.getLevel(mountId);
  const req = MountSystem.getRequirements(level);
  if (!req) return { canDo: false, missing: ['Đã đạt tối đa +10'] };

  const missing = [];
  for (const mat of req.items) {
    if (!Inventory.has(mat.id, mat.count)) {
      const matData = ITEMS[mat.id];
      const have = Inventory.getCount(mat.id);
      missing.push(`${matData ? matData.name : mat.id} (thiếu ${mat.count - have})`);
    }
  }
  if (Player.gold < req.gold) {
    missing.push(`Vàng (thiếu ${req.gold - Player.gold})`);
  }
  return { canDo: missing.length === 0, missing };
};

// --- Thực hiện nâng cấp ---
MountSystem.enhance = function(mountId) {
  const check = MountSystem.checkRequirements(mountId);
  if (!check.canDo) {
    UI.addLog(`❌ Thiếu nguyên liệu: ${check.missing.join(', ')}`, 'system');
    return { success: false, newLevel: MountSystem.getLevel(mountId) };
  }

  const level = MountSystem.getLevel(mountId);
  const req = MountSystem.getRequirements(level);
  const displayName = MountSystem.getDisplayName(mountId);

  for (const mat of req.items) Inventory.remove(mat.id, mat.count);
  Player.gold -= req.gold;
  UI.updateGold();

  const rate = MOUNT_ENHANCE_CONFIG.successRate[level] ?? 1.0;
  const success = Math.random() < rate;
  let newLevel = level;

  if (success) {
    newLevel = level + 1;
    Player.mountEnhanceData[mountId] = newLevel;
    Player.recalculateStats();
    const newName = MountSystem.getDisplayName(mountId);
    UI.addLog(`🐴 ${newName} nâng cấp thành +${newLevel} thành công!`, 'item');
    UI.showNotification('🐴 Tọa Kỵ Nâng Cấp!', newName);
    MountSystem._spawnParticles(true, newLevel);
  } else {
    const risk = MOUNT_ENHANCE_CONFIG.failRisk[level];
    if (risk && Math.random() < risk.chance) {
      newLevel = risk.dropTo;
      Player.mountEnhanceData[mountId] = newLevel;
      Player.recalculateStats();
      UI.addLog(`💔 Nâng cấp thất bại! ${displayName} tụt về +${newLevel}`, 'system');
    } else {
      UI.addLog('💨 Nâng cấp tọa kỵ thất bại, giữ nguyên.', 'system');
    }
    MountSystem._spawnParticles(false, level);
  }

  // Nếu mount đang cưỡi → recalc ngay
  if (Player.activeMount === mountId) Player.recalculateStats();

  Inventory.render();
  MountSystem._refreshTooltipIfOpen(mountId);
  return { success, newLevel };
};

// --- Particle effect ---
MountSystem._spawnParticles = function(success, level) {
  const colors = success
    ? [MOUNT_ENHANCE_CONFIG.nameColors[level] || '#f0c040', '#4caf50', '#ffd700']
    : ['#9e9e9e', '#f44336', '#616161'];
  for (let i = 0; i < 20; i++) {
    const angle = (Math.PI * 2 / 20) * i;
    const speed = 0.8 + Math.random() * 1.5;
    GameState.particles.push({
      x: Player.x, y: Player.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 600 + Math.random() * 400,
      maxLife: 1000,
      size: 2 + Math.random() * 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1
    });
  }
};

// --- Refresh tooltip nếu đang mở ---
MountSystem._refreshTooltipIfOpen = function(mountId) {
  const tooltip = document.getElementById('itemTooltip');
  if (!tooltip || !tooltip.classList.contains('show')) return;
  if (Inventory.selectedItem !== mountId) return;
  MountSystem._appendMountUI(mountId);
};

// --- Build UI nâng cấp trong tooltip ---
MountSystem._appendMountUI = function(mountId) {
  const actions = document.getElementById('tooltipActions');
  if (!actions) return;

  // Xóa UI cũ
  const old = actions.querySelector('.mount-enhance-section');
  if (old) old.remove();

  const isEquipped = (Player.equipped.mount === mountId);

  const level = MountSystem.getLevel(mountId);
  const req = MountSystem.getRequirements(level);
  const check = req ? MountSystem.checkRequirements(mountId) : { canDo: false, missing: [] };
  const successRate = MOUNT_ENHANCE_CONFIG.successRate[level] ?? null;

  const section = document.createElement('div');
  section.className = 'mount-enhance-section';
  section.style.cssText = 'border-top:1px solid #444; margin-top:8px; padding-top:8px;';

  // Header
  const title = document.createElement('div');
  title.style.cssText = 'color:#7ec8e3; font-weight:bold; font-size:11px; margin-bottom:6px;';
  title.textContent = `🐴 Nâng Cấp Tọa Kỵ  [+${level} → +${level + 1}]`;
  section.appendChild(title);

  if (!isEquipped) {
    const note = document.createElement('div');
    note.style.cssText = 'color:#aaa; font-size:10px; font-style:italic; margin-bottom:4px;';
    note.textContent = '⚠️ Cần trang bị tọa kỵ để nâng cấp';
    section.appendChild(note);
  } else if (level >= MOUNT_ENHANCE_CONFIG.maxLevel || !req) {
    const maxDiv = document.createElement('div');
    maxDiv.style.cssText = 'color:#f0c040; font-size:11px; text-align:center; padding:4px;';
    maxDiv.textContent = '✨ Tọa Kỵ đã đạt tối đa +10';
    section.appendChild(maxDiv);
  } else {
    for (const mat of req.items) {
      const matData = ITEMS[mat.id];
      const have = Inventory.getCount(mat.id);
      const enough = have >= mat.count;
      const row = document.createElement('div');
      row.style.cssText = `font-size:10px; margin-bottom:3px; display:flex; justify-content:space-between; color:${enough ? '#4caf50' : '#f44336'};`;
      row.innerHTML = `<span>📦 ${matData ? matData.name : mat.id} x${mat.count}</span><span>có: ${have}</span>`;
      section.appendChild(row);
    }

    const enoughGold = Player.gold >= req.gold;
    const goldRow = document.createElement('div');
    goldRow.style.cssText = `font-size:10px; margin-bottom:3px; display:flex; justify-content:space-between; color:${enoughGold ? '#4caf50' : '#f44336'};`;
    goldRow.innerHTML = `<span>💰 ${req.gold} vàng</span><span>có: ${Player.gold}</span>`;
    section.appendChild(goldRow);

    if (successRate !== null) {
      const rateRow = document.createElement('div');
      rateRow.style.cssText = 'font-size:10px; color:#e0e0e0; margin-bottom:3px;';
      rateRow.textContent = `🎲 Tỷ lệ: ${Math.round(successRate * 100)}%`;
      section.appendChild(rateRow);
    }

    if (level >= 7 && MOUNT_ENHANCE_CONFIG.failRisk[level]) {
      const warn = document.createElement('div');
      warn.style.cssText = 'font-size:10px; color:#ff9800; margin-bottom:5px;';
      warn.textContent = '⚠️ Thất bại có thể tụt cấp!';
      section.appendChild(warn);
    }

    const btn = document.createElement('button');
    btn.textContent = '🐴 Nâng Cấp Tọa Kỵ';
    btn.style.cssText = `
      width:100%; padding:8px; border-radius:5px; font-size:11px; font-weight:bold;
      cursor:${check.canDo ? 'pointer' : 'not-allowed'};
      border:1px solid #7ec8e3; background:#1a4a5e; color:#fff;
      font-family:'Courier New', monospace;
      opacity:${check.canDo ? '1' : '0.5'};
      margin-top:4px;
    `;
    if (check.canDo) {
      btn.onclick = () => MountSystem.enhance(mountId);
    } else {
      btn.disabled = true;
      btn.title = '❌ ' + check.missing.join(', ');
    }
    section.appendChild(btn);
  }

  actions.appendChild(section);
};


// ================================================================
// PHẦN 5 — VẼ ICON TỌA KỴ TRÊN CANVAS
// ================================================================

MountSystem._drawIcon = function(ctx, mountId) {
  ctx.clearRect(0, 0, 16, 16);
  const r = MOUNTS[mountId]?.rarity || 'common';

  // Màu nền theo rarity
  const bg = { common: '#1a3a1a', rare: '#1a1a3a', epic: '#2a1a2a', legendary: '#3a2a00' };
  ctx.fillStyle = bg[r] || '#222';
  ctx.fillRect(0, 0, 16, 16);

  const icons = {
    // Ngựa vàng
    yellowHorse: () => {
      ctx.fillStyle = '#d4a017';
      ctx.fillRect(5, 7, 6, 6); // thân
      ctx.fillRect(4, 5, 4, 4); // đầu
      ctx.fillStyle = '#a07010';
      ctx.fillRect(5, 12, 2, 3); // chân trước
      ctx.fillRect(9, 12, 2, 3); // chân sau
      ctx.fillStyle = '#8b6914';
      ctx.fillRect(10, 4, 2, 4); // cổ
      ctx.fillStyle = '#5a4010';
      ctx.fillRect(3, 4, 2, 2); // tai
    },
    blackHorse: () => {
      ctx.fillStyle = '#2a2a2a';
      ctx.fillRect(5, 7, 6, 6);
      ctx.fillRect(4, 5, 4, 4);
      ctx.fillStyle = '#111';
      ctx.fillRect(5, 12, 2, 3);
      ctx.fillRect(9, 12, 2, 3);
      ctx.fillStyle = '#555';
      ctx.fillRect(10, 4, 2, 4);
      ctx.fillStyle = '#fff';
      ctx.fillRect(5, 6, 1, 2); // sao trắng
    },
    wildBoar: () => {
      ctx.fillStyle = '#6b3a2a';
      ctx.fillRect(3, 7, 10, 6);
      ctx.fillRect(3, 5, 5, 4);
      ctx.fillStyle = '#4a2a1a';
      ctx.fillRect(3, 12, 2, 3);
      ctx.fillRect(9, 12, 2, 3);
      ctx.fillStyle = '#fff';
      ctx.fillRect(4, 7, 2, 2); // ngà
    },
    cloudDeer: () => {
      ctx.fillStyle = '#c8a070';
      ctx.fillRect(5, 7, 6, 6);
      ctx.fillRect(5, 5, 4, 4);
      ctx.fillStyle = '#fff';
      ctx.fillRect(8, 3, 1, 3); // gạc trái
      ctx.fillRect(11, 3, 1, 3); // gạc phải
      ctx.fillRect(6, 2, 1, 2);
      ctx.fillStyle = '#aa7050';
      ctx.fillRect(6, 12, 2, 3);
      ctx.fillRect(9, 12, 2, 3);
    },
    stoneTiger: () => {
      ctx.fillStyle = '#d4802a';
      ctx.fillRect(4, 7, 8, 6);
      ctx.fillRect(4, 5, 5, 4);
      ctx.fillStyle = '#000';
      ctx.fillRect(5, 8, 1, 4);
      ctx.fillRect(7, 8, 1, 4);
      ctx.fillRect(9, 8, 1, 4);
      ctx.fillStyle = '#ff8c00';
      ctx.fillRect(4, 12, 2, 3);
      ctx.fillRect(10, 12, 2, 3);
    },
    spiritWolf: () => {
      ctx.fillStyle = '#707070';
      ctx.fillRect(4, 7, 8, 6);
      ctx.fillRect(4, 5, 5, 4);
      ctx.fillStyle = '#ff4444';
      ctx.fillRect(5, 6, 2, 2); // mắt đỏ
      ctx.fillStyle = '#505050';
      ctx.fillRect(5, 12, 2, 3);
      ctx.fillRect(9, 12, 2, 3);
      ctx.fillStyle = '#aaaaaa';
      ctx.fillRect(3, 4, 2, 2);
      ctx.fillRect(7, 4, 2, 2);
    },
    iceOx: () => {
      ctx.fillStyle = '#7ab0d4';
      ctx.fillRect(3, 7, 10, 7);
      ctx.fillRect(3, 5, 6, 4);
      ctx.fillStyle = '#4a88b8';
      ctx.fillRect(4, 12, 2, 3);
      ctx.fillRect(9, 12, 2, 3);
      ctx.fillStyle = '#fff';
      ctx.fillRect(3, 5, 2, 2); // sừng
      ctx.fillRect(9, 5, 2, 2);
    },
    flameFox: () => {
      ctx.fillStyle = '#e85020';
      ctx.fillRect(5, 7, 6, 6);
      ctx.fillRect(4, 5, 5, 4);
      ctx.fillStyle = '#ff8c00';
      ctx.fillRect(3, 3, 2, 3); // tai nhọn
      ctx.fillRect(9, 3, 2, 3);
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(5, 12, 2, 3);
      ctx.fillRect(9, 12, 2, 3);
      // đuôi lửa
      ctx.fillStyle = '#ff4500';
      ctx.fillRect(11, 8, 3, 4);
    },
    thunderBear: () => {
      ctx.fillStyle = '#4a4a4a';
      ctx.fillRect(3, 7, 10, 7);
      ctx.fillRect(3, 4, 6, 5);
      ctx.fillStyle = '#ffff00';
      ctx.fillRect(5, 6, 2, 2); // mắt vàng
      ctx.fillStyle = '#303030';
      ctx.fillRect(4, 13, 3, 3);
      ctx.fillRect(9, 13, 3, 3);
      ctx.fillStyle = '#ffff00';
      ctx.fillRect(2, 7, 1, 3); // sấm sét bên
      ctx.fillRect(13, 7, 1, 3);
    },
    skyEagle: () => {
      ctx.fillStyle = '#8b4513';
      ctx.fillRect(5, 8, 6, 5);
      ctx.fillRect(6, 6, 4, 4);
      ctx.fillStyle = '#fff';
      ctx.fillRect(6, 6, 4, 2); // đầu trắng
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(7, 8, 2, 2); // mỏ
      // cánh
      ctx.fillStyle = '#5a2e0c';
      ctx.fillRect(1, 7, 4, 3);
      ctx.fillRect(11, 7, 4, 3);
      ctx.fillStyle = '#8b4513';
      ctx.fillRect(6, 12, 2, 2);
      ctx.fillRect(8, 12, 2, 2);
    },
    voidPanther: () => {
      ctx.fillStyle = '#1a0a2a';
      ctx.fillRect(4, 7, 8, 6);
      ctx.fillRect(4, 5, 5, 4);
      ctx.fillStyle = '#9b00ff';
      ctx.fillRect(5, 6, 2, 2); // mắt tím
      ctx.fillStyle = '#2a0a3a';
      ctx.fillRect(5, 12, 2, 3);
      ctx.fillRect(9, 12, 2, 3);
      // hoa văn hư không
      ctx.fillStyle = '#6600cc';
      ctx.fillRect(6, 8, 1, 3);
      ctx.fillRect(8, 8, 1, 3);
    },
    lavaLion: () => {
      ctx.fillStyle = '#8b2000';
      ctx.fillRect(4, 7, 8, 7);
      ctx.fillRect(3, 5, 6, 5);
      ctx.fillStyle = '#ff4500';
      ctx.fillRect(2, 4, 3, 3); // bờm lửa
      ctx.fillRect(4, 2, 5, 3);
      ctx.fillRect(9, 4, 3, 3);
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(5, 7, 2, 2); // mắt vàng
      ctx.fillStyle = '#6b1500';
      ctx.fillRect(5, 13, 2, 3);
      ctx.fillRect(9, 13, 2, 3);
    },
    spiritTurtle: () => {
      ctx.fillStyle = '#2a6a2a';
      ctx.fillRect(3, 6, 10, 8); // mai rùa
      ctx.fillStyle = '#3a8a3a';
      ctx.fillRect(4, 7, 8, 6);
      ctx.fillStyle = '#1a4a1a';
      ctx.fillRect(5, 8, 2, 2);
      ctx.fillRect(9, 8, 2, 2);
      ctx.fillRect(7, 8, 2, 2);
      ctx.fillStyle = '#5ab85a';
      ctx.fillRect(7, 4, 2, 3); // đầu
      ctx.fillRect(3, 12, 2, 3); // chân
      ctx.fillRect(11, 12, 2, 3);
    },
    celestialCrane: () => {
      ctx.fillStyle = '#fff';
      ctx.fillRect(5, 6, 6, 7);
      ctx.fillRect(6, 4, 4, 4);
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(7, 4, 2, 2); // đỉnh đỏ
      ctx.fillStyle = '#000';
      ctx.fillRect(7, 6, 2, 2); // mỏ
      // cánh trắng xòe
      ctx.fillStyle = '#e0e0e0';
      ctx.fillRect(1, 7, 4, 2);
      ctx.fillRect(11, 7, 4, 2);
      ctx.fillStyle = '#fff';
      ctx.fillRect(7, 12, 2, 4); // chân dài
    },
    cloudDragon: () => {
      ctx.fillStyle = '#4488cc';
      ctx.fillRect(4, 6, 8, 7);
      ctx.fillRect(5, 4, 5, 4);
      ctx.fillStyle = '#88ccff';
      ctx.fillRect(5, 5, 2, 2); // vảy sáng
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(6, 4, 2, 2); // sừng
      ctx.fillRect(9, 4, 2, 2);
      ctx.fillStyle = '#ffa500';
      ctx.fillRect(6, 6, 2, 2); // mắt
      // đuôi rồng
      ctx.fillStyle = '#3377bb';
      ctx.fillRect(12, 8, 3, 2);
      ctx.fillRect(14, 10, 2, 2);
    },
    phoenixMount: () => {
      ctx.fillStyle = '#cc2200';
      ctx.fillRect(5, 6, 6, 7);
      ctx.fillRect(5, 4, 5, 4);
      // lông lửa
      ctx.fillStyle = '#ff6600';
      ctx.fillRect(1, 5, 4, 3);
      ctx.fillRect(11, 5, 4, 3);
      ctx.fillRect(3, 2, 3, 4);
      ctx.fillRect(10, 2, 3, 4);
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(5, 3, 2, 3);
      ctx.fillRect(9, 3, 2, 3);
      ctx.fillStyle = '#ff4500';
      ctx.fillRect(7, 12, 2, 4); // đuôi
    },
    celestialQilin: () => {
      ctx.fillStyle = '#c8a0e8';
      ctx.fillRect(4, 7, 8, 6);
      ctx.fillRect(5, 5, 5, 4);
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(7, 3, 2, 4); // sừng vàng
      ctx.fillStyle = '#e8c0ff';
      ctx.fillRect(5, 5, 2, 2);
      // hào quang
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(2, 6, 2, 2);
      ctx.fillRect(12, 6, 2, 2);
      ctx.fillRect(7, 1, 2, 2);
      ctx.fillStyle = '#9060c0';
      ctx.fillRect(5, 12, 2, 3);
      ctx.fillRect(9, 12, 2, 3);
    }
  };

  const fn = icons[mountId];
  if (fn) fn();
  else {
    // Fallback: yên cương đơn giản
    ctx.fillStyle = '#888';
    ctx.fillRect(4, 6, 8, 7);
    ctx.fillStyle = '#aaa';
    ctx.fillRect(5, 5, 4, 3);
  }
};


// ================================================================
// PHẦN 6 — INJECT TỌA KỴ VÀO HỆ THỐNG ITEMS & PLAYER
// ================================================================

// 6.1 — Thêm tất cả mount vào ITEMS để inventory dùng được
(function injectMountsToItems() {
  for (const id in MOUNTS) {
    ITEMS[id] = MOUNTS[id];
  }
  console.log(`🐴 Injected ${Object.keys(MOUNTS).length} mounts into ITEMS`);
})();


// 6.2 — Thêm drop tọa kỵ vào enemy types
(function injectMountDrops() {
  for (const enemyType in MOUNT_DROPS) {
    const enemyDef = Enemies.types[enemyType];
    if (!enemyDef) continue;
    if (!enemyDef.drops) enemyDef.drops = [];
    for (const drop of MOUNT_DROPS[enemyType]) {
      // Tránh trùng
      if (!enemyDef.drops.find(d => d.id === drop.id)) {
        enemyDef.drops.push(drop);
      }
    }
  }
  console.log('🐴 Mount drops injected into enemy tables');
})();


// 6.3 — Thêm slot mount vào Player.equipped
(function injectMountSlotToPlayer() {
  // equipped.mount
  if (!('mount' in Player.equipped)) {
    Player.equipped.mount = null;
  }

  // mountEnhanceData
  if (!Player.mountEnhanceData) {
    Player.mountEnhanceData = {};
  }

  // activeMount alias
  Object.defineProperty(Player, 'activeMount', {
    get() { return this.equipped.mount; },
    set(v) { this.equipped.mount = v; },
    configurable: true
  });
})();


// 6.4 — Patch Player.recalculateStats để cộng mount stats
(function patchRecalcForMount() {
  const _origRecalc = Player.recalculateStats;

  Player.recalculateStats = function() {
    // Gọi recalc gốc (hoặc bản đã patch bởi feature_enhance)
    _origRecalc.call(this);

    // Cộng thêm mount stats
    const mountId = this.equipped ? this.equipped.mount : null;
    if (mountId && MOUNTS[mountId]) {
      const stats = MountSystem.getEnhancedStats(mountId);
      this.atk      += stats.atk      || 0;
      this.def      += stats.def      || 0;
      this.maxHp    += stats.hp       || 0;
      this.maxMp    += stats.mp       || 0;
      this.critRate += stats.critRate || 0;
      this.critDmg  += stats.critDmg  || 0;
      this.speed    += stats.speed    || 0;

      // Clamp HP/MP
      this.hp = Math.min(this.hp, this.maxHp);
      this.mp = Math.min(this.mp, this.maxMp);
    }
  };
})();


// 6.5 — Patch Player.equip để hỗ trợ type 'mount'
(function patchPlayerEquipForMount() {
  const _origEquip = Player.equip;

  Player.equip = function(itemId) {
    const item = ITEMS[itemId];
    if (!item) return false;

    if (item.type === 'mount') {
      // Tháo mount cũ về túi
      if (this.equipped.mount) {
        Inventory.add(this.equipped.mount, 1);
      }
      this.equipped.mount = itemId;
      Inventory.remove(itemId, 1);
      this.recalculateStats();
      UI.addLog(`🐴 Đã cưỡi ${MountSystem.getDisplayName(itemId)}!`, 'item');
      return true;
    }

    return _origEquip.call(this, itemId);
  };
})();


// 6.6 — Patch Player.unequip để hỗ trợ slot mount
(function patchPlayerUnequipForMount() {
  const _origUnequip = Player.unequip;

  Player.unequip = function(slot) {
    if (slot === 'mount') {
      const mountId = this.equipped.mount;
      if (!mountId) return false;
      if (Inventory.add(mountId, 1)) {
        this.equipped.mount = null;
        this.recalculateStats();
        UI.addLog(`📦 Đã xuống ngựa ${MOUNTS[mountId]?.name || mountId}!`, 'system');
        return true;
      }
      UI.addLog('❌ Túi đồ đầy!', 'system');
      return false;
    }
    return _origUnequip.call(this, slot);
  };
})();


// 6.7 — Patch Player.getSaveData & loadSaveData
(function patchPlayerSaveLoad() {
  const _origGet = Player.getSaveData;
  Player.getSaveData = function() {
    const data = _origGet.call(this);
    data.mountEnhanceData = JSON.parse(JSON.stringify(this.mountEnhanceData || {}));
    // equipped.mount đã nằm trong data.equipped rồi
    return data;
  };

  const _origLoad = Player.loadSaveData;
  Player.loadSaveData = function(data) {
    _origLoad.call(this, data);
    this.mountEnhanceData = data?.mountEnhanceData
      ? JSON.parse(JSON.stringify(data.mountEnhanceData))
      : {};
    // Đảm bảo slot mount tồn tại
    if (!('mount' in this.equipped)) {
      this.equipped.mount = data?.equipped?.mount || null;
    }
  };
})();


// ================================================================
// PHẦN 7 — PATCH INVENTORY ĐỂ HIỂN THỊ TỌA KỴ ĐÚNG
// ================================================================

// 7.1 — Patch drawItemIcon để vẽ icon mount
(function patchInventoryDrawIcon() {
  const _origDraw = Inventory.drawItemIcon;

  Inventory.drawItemIcon = function(ctx, itemId) {
    if (MOUNTS[itemId]) {
      MountSystem._drawIcon(ctx, itemId);
    } else {
      _origDraw.call(this, ctx, itemId);
    }
  };
})();


// 7.2 — Patch showTooltip để thêm logic mount
(function patchInventoryTooltipForMount() {
  const _origShow = Inventory.showTooltip;

  Inventory.showTooltip = function(itemId, slotIndex, event) {
    _origShow.call(this, itemId, slotIndex, event);

    const mountData = MOUNTS[itemId];
    if (!mountData) return;

    // Cập nhật type label
    const typeEl = document.getElementById('tooltipType');
    if (typeEl) typeEl.textContent = '🐴 Tọa Kỵ';

    // Cập nhật tên + level enhance
    const nameEl = document.getElementById('tooltipName');
    if (nameEl) {
      const level = MountSystem.getLevel(itemId);
      nameEl.textContent = MountSystem.getDisplayName(itemId);
      const color = MOUNT_ENHANCE_CONFIG.nameColors[level];
      if (color && level > 0) {
        nameEl.style.color = color;
        nameEl.style.textShadow = level === 10 ? '0 0 8px #f0c040' : '';
      }
    }

    // Cập nhật stats với enhanced values
    const statsEl = document.getElementById('tooltipStats');
    if (statsEl) {
      const enhanced = MountSystem.getEnhancedStats(itemId);
      const statNames = {
        speed:    '💨 Tốc độ',
        atk:      '⚔️ Công kích',
        def:      '🛡️ Phòng ngự',
        hp:       '❤️ Sinh mệnh',
        mp:       '💎 Linh lực',
        critRate: '💥 Bạo kích',
        critDmg:  '🔥 Bạo thương'
      };
      let html = '';
      for (const [stat, val] of Object.entries(enhanced)) {
        const base = mountData.stats[stat] || 0;
        let display, baseDisplay;
        if (stat === 'speed') {
          display = `+${val.toFixed(1)}`;
          baseDisplay = val !== base ? `<span style="color:#888;font-size:9px">(gốc: +${base.toFixed(1)})</span>` : '';
        } else if (stat === 'critRate' || stat === 'critDmg') {
          display = `+${(val * 100).toFixed(0)}%`;
          baseDisplay = val !== base ? `<span style="color:#888;font-size:9px">(gốc: +${(base*100).toFixed(0)}%)</span>` : '';
        } else {
          display = `+${val}`;
          baseDisplay = val !== base ? `<span style="color:#888;font-size:9px">(gốc: +${base})</span>` : '';
        }
        html += `${statNames[stat] || stat}: <span style="color:#7ec8e3">${display}</span> ${baseDisplay}<br>`;
      }
      statsEl.innerHTML = html;
    }

    // Thêm nút Cưỡi / Xuống ngựa
    const actions = document.getElementById('tooltipActions');
    if (actions) {
      // Xóa nút equip cũ (nếu có từ logic gốc)
      actions.querySelectorAll('.item-action-btn.equip').forEach(b => b.remove());

      const isEquipped = (Player.equipped.mount === itemId);
      const mountBtn = document.createElement('button');
      mountBtn.className = 'item-action-btn equip';
      mountBtn.textContent = isEquipped ? '🐴 Xuống Ngựa' : '🐴 Cưỡi Lên';
      mountBtn.onclick = () => {
        if (isEquipped) {
          Player.unequip('mount');
        } else {
          Player.equip(itemId);
        }
        Inventory.render();
        this.hideTooltip();
      };
      // Chèn vào đầu
      actions.insertBefore(mountBtn, actions.firstChild);
    }

    // Badge trang bị trong grid
    // (đã được xử lý bởi logic gốc qua Player.equipped.mount)

    // Append UI nâng cấp
    MountSystem._appendMountUI(itemId);
  };
})();


// 7.3 — Patch render() để nhận diện mount đang cưỡi như equipped badge
(function patchInventoryRenderForMount() {
  const _origRender = Inventory.render;

  Inventory.render = function(filter = 'all') {
    // Nếu filter là 'mount', lọc theo type mount
    _origRender.call(this, filter);
  };
})();


// ================================================================
// PHẦN 8 — INJECT CSS
// ================================================================
(function injectMountStyles() {
  if (document.getElementById('mount-system-style')) return;
  const style = document.createElement('style');
  style.id = 'mount-system-style';
  style.textContent = `
    .mount-enhance-section { animation: mountFadeIn 0.2s ease; }
    @keyframes mountFadeIn {
      from { opacity:0; transform:translateY(4px); }
      to   { opacity:1; transform:translateY(0); }
    }
    /* Màu rarity mount */
    .inv-slot.has-item.mount-equipped::after {
      content: '🐴';
      position:absolute;
      top:1px; left:2px;
      font-size:8px;
    }
  `;
  document.head.appendChild(style);
})();


// ================================================================
// PHẦN 9 — KHỞI ĐỘNG
// ================================================================
MountSystem.init = function() {
  if (!Player.mountEnhanceData) Player.mountEnhanceData = {};
  if (!('mount' in Player.equipped)) Player.equipped.mount = null;
  Player.recalculateStats();
  console.log('🐴 Mount System initialized');
};

// Hook Game.init
(function() {
  const _origGameInit = Game.init;
  Game.init = function() {
    _origGameInit.call(this);
    MountSystem.init();
  };
})();

console.log('🐴 Mount System loaded — 16 loại tọa kỵ sẵn sàng!');
// Thêm vào index.html sau feature_enhance.js:
// <script src="js/mount.js"></script>
