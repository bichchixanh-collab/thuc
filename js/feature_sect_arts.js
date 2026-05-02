// ===== FILE: js/feature_sect_arts.js =====
// ==================== SECT & ARTS SYSTEM ====================
// feature_sect_arts.js — monkey-patch only, không sửa file gốc
// Load sau: game.js

// ==================== SECTION 1: DATA & CONFIG ====================

const SECT_CONFIG = {
  requireRealm: 2, // Kim Đan Kỳ

  directions: {
    sword: {
      id: 'sword', name: 'Thiên Kiếm Các', icon: '⚔️',
      color: '#ef5350',
      desc: 'Tông phái kiếm thuật. Công kích mạnh mẽ.',
      bonusPerLevel: [
        null,
        { atk: 0.10, critRate: 0.05 },
        { atk: 0.15, critRate: 0.08 },
        { atk: 0.20, critRate: 0.10, skillDmg: 0.15 },
        { atk: 0.25, critRate: 0.12, skillDmg: 0.20 }
      ],
      changeCost: { dragonScale: 3, gold: 2000 }
    },
    magic: {
      id: 'magic', name: 'Linh Pháp Đường', icon: '🔮',
      color: '#7c4dff',
      desc: 'Tông phái pháp thuật. Kỹ năng uy lực cao.',
      bonusPerLevel: [
        null,
        { skillDmg: 0.15, maxMp: 0.20 },
        { skillDmg: 0.22, maxMp: 0.30 },
        { skillDmg: 0.30, maxMp: 0.40, mpRegen: 3 },
        { skillDmg: 0.40, maxMp: 0.50, mpRegen: 5 }
      ],
      changeCost: { dragonScale: 3, gold: 2000 }
    },
    body: {
      id: 'body', name: 'Bất Hoại Điện', icon: '🛡️',
      color: '#26a69a',
      desc: 'Tông phái thể tu. Phòng thủ kiên cố.',
      bonusPerLevel: [
        null,
        { maxHp: 0.20, def: 0.10 },
        { maxHp: 0.30, def: 0.15 },
        { maxHp: 0.40, def: 0.20, hpRegen: 3 },
        { maxHp: 0.50, def: 0.25, hpRegen: 5 }
      ],
      changeCost: { dragonScale: 3, gold: 2000 }
    }
  },

  sectLevels: [
    { level: 1, name: 'Sơ Lập',      disciple: 0, upgradeCost: null },
    { level: 2, name: 'Phát Triển',  disciple: 0, upgradeCost: { spiritStone: 5, gold: 500 } },
    { level: 3, name: 'Hưng Thịnh',  disciple: 1, upgradeCost: { dragonScale: 2, gold: 1500 } },
    { level: 4, name: 'Cường Thịnh', disciple: 2, upgradeCost: { celestialOrb: 2, gold: 3000 } },
    { level: 5, name: 'Thịnh Thế',   disciple: 3, upgradeCost: { celestialOrb: 5, gold: 8000 } }
  ],

  discipleNames: [
    'Tiểu Hoa', 'Vân Tùng', 'Lệ Nhi', 'Kiếm Nhi', 'Thiên Lôi',
    'Bạch Long', 'Hắc Phong', 'Ngọc Liên', 'Phong Vũ', 'Lam Tinh'
  ]
};

const ARTS_CONFIG = {
  maxArtsSlots: 3,
  skipItemId: 'divineToken',

  secretArts: [
    {
      id: 'swordRain', name: 'Vạn Kiếm Trận', icon: '⚔️', rarity: 'rare',
      desc: 'Mỗi đòn đánh spawn thêm 1 kiếm khí nhỏ (20% ATK)',
      dropSource: 'wolfKing boss', type: 'passive_on_hit', value: 0.20, conflictWith: []
    },
    {
      id: 'bloodSlaughter', name: 'Huyết Sát Quyết', icon: '🩸', rarity: 'epic',
      desc: 'Kill quái → +2% ATK stack (max 20 stack, reset khi chết)',
      dropSource: 'demonLord boss', type: 'kill_stack', stackValue: 0.02, maxStacks: 20,
      conflictWith: ['diamondBody']
    },
    {
      id: 'thunderCrit', name: 'Lôi Đình Quyết', icon: '⚡', rarity: 'epic',
      desc: 'Crit strike gây thêm thunder damage bằng 30% ATK',
      dropSource: 'dungeon epic', type: 'crit_proc', value: 0.30, conflictWith: []
    },
    {
      id: 'diamondBody', name: 'Kim Cương Bất Hoại', icon: '💎', rarity: 'rare',
      desc: 'HP > 80%: giảm 20% damage nhận vào',
      dropSource: 'iceEmperor boss', type: 'passive_defense',
      threshold: 0.80, value: 0.20, conflictWith: ['deathCounter', 'bloodSlaughter']
    },
    {
      id: 'springReturn', name: 'Hồi Xuân Công', icon: '🌿', rarity: 'rare',
      desc: 'Hồi 1% HP mỗi 3 giây',
      dropSource: 'mysterious elder NPC', type: 'passive_regen',
      regenPct: 0.01, interval: 3000, conflictWith: ['deathCounter']
    },
    {
      id: 'deathCounter', name: 'Tử Địa Phản Kích', icon: '💀', rarity: 'epic',
      desc: 'HP < 30%: damage +40%',
      dropSource: 'boss event', type: 'passive_low_hp',
      threshold: 0.30, value: 0.40, conflictWith: ['diamondBody', 'springReturn']
    },
    {
      id: 'devourHeaven', name: 'Thôn Thiên Đại Pháp', icon: '🌀', rarity: 'legendary',
      desc: '+30% EXP và gold từ mọi nguồn',
      dropSource: 'celestialDragon boss', type: 'passive_loot', value: 0.30,
      conflictWith: ['splitMind']
    },
    {
      id: 'splitMind', name: 'Phân Thần Thuật', icon: '🔄', rarity: 'epic',
      desc: 'Tất cả skill cooldown giảm 20%',
      dropSource: 'dungeon legendary', type: 'passive_cd', value: 0.20,
      conflictWith: ['devourHeaven']
    },
    {
      id: 'spiritSense', name: 'Tiên Linh Cảm Ứng', icon: '✨', rarity: 'epic',
      desc: 'Tự động pickup item rơi trong radius 150px',
      dropSource: 'secret map relic', type: 'passive_pickup', radius: 150,
      conflictWith: []
    },
    {
      id: 'infiniteSea', name: 'Vô Cực Linh Hải', icon: '🌊', rarity: 'legendary',
      desc: 'MP không giảm xuống dưới 20%',
      dropSource: 'alchemy perfect craft', type: 'passive_mp_floor', floorPct: 0.20,
      conflictWith: []
    }
  ]
};

// Helper: darken hex color
function _darkenColor(hex) {
  const r = Math.max(0, Math.floor(parseInt(hex.slice(1, 3), 16) * 0.65));
  const g = Math.max(0, Math.floor(parseInt(hex.slice(3, 5), 16) * 0.65));
  const b = Math.max(0, Math.floor(parseInt(hex.slice(5, 7), 16) * 0.65));
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

// Helper: get art name by id
function _getArtName(artId) {
  const art = ARTS_CONFIG.secretArts.find(a => a.id === artId);
  return art ? art.name : artId;
}

// Helper: rarity color
function _rarityColor(rarity) {
  if (rarity === 'legendary') return '#f0c040';
  if (rarity === 'epic')      return '#a855f7';
  if (rarity === 'rare')      return '#2196f3';
  return '#aaa';
}

// Helper: hex to rgb for CSS
function _hexToRgb(hex) {
  return `${parseInt(hex.slice(1,3),16)},${parseInt(hex.slice(3,5),16)},${parseInt(hex.slice(5,7),16)}`;
}


// ==================== SECTION 2: SECT SYSTEM ====================

const SectSystem = {
  state: {
    founded: false,
    sectName: '',
    direction: null,
    level: 1,
    disciples: [],
    _regenTimer: 0
  },

  canFound() {
    return Player.realm >= SECT_CONFIG.requireRealm;
  },

  found(name, direction) {
    if (!this.canFound()) {
      UI.addLog('❌ Cần đạt Kim Đan Kỳ để lập Tông Môn!', 'system');
      return false;
    }
    if (!name || !name.trim()) {
      UI.addLog('❌ Hãy nhập tên Tông Môn!', 'system');
      return false;
    }
    if (!SECT_CONFIG.directions[direction]) {
      UI.addLog('❌ Hãy chọn hướng tu luyện!', 'system');
      return false;
    }
    this.state.founded   = true;
    this.state.sectName  = name.trim();
    this.state.direction = direction;
    this.state.level     = 1;
    this.state.disciples = [];
    Player.recalculateStats();
    UI.showNotification('🏯 ' + this.state.sectName, 'Tông Môn đã được lập!');
    UI.addLog('🏯 Tông Môn ' + this.state.sectName + ' chính thức thành lập!', 'realm');
    return true;
  },

  getBonus() {
    if (!this.state.founded || !this.state.direction) return {};
    return SECT_CONFIG.directions[this.state.direction].bonusPerLevel[this.state.level - 1] || {};
  },

  canUpgrade() {
    if (this.state.level >= 5) return { can: false, reason: 'Đã đạt cấp tối đa' };
    const cost    = SECT_CONFIG.sectLevels[this.state.level].upgradeCost;
    if (!cost) return { can: true, missing: [] };

    const missing = [];
    if (cost.spiritStone  && !Inventory.has('spiritStone',  cost.spiritStone))  missing.push(`Linh Thạch x${cost.spiritStone}`);
    if (cost.dragonScale  && !Inventory.has('dragonScale',  cost.dragonScale))  missing.push(`Vảy Rồng x${cost.dragonScale}`);
    if (cost.celestialOrb && !Inventory.has('celestialOrb', cost.celestialOrb)) missing.push(`Thiên Châu x${cost.celestialOrb}`);
    if (cost.gold         && Player.gold < cost.gold)                           missing.push(`${cost.gold} vàng`);
    return { can: missing.length === 0, missing };
  },

  upgrade() {
    const check = this.canUpgrade();
    if (!check.can) {
      UI.addLog('❌ Không đủ điều kiện: ' + (check.reason || check.missing.join(', ')), 'system');
      return false;
    }
    const cost = SECT_CONFIG.sectLevels[this.state.level].upgradeCost;
    if (cost) {
      if (cost.spiritStone)  Inventory.remove('spiritStone',  cost.spiritStone);
      if (cost.dragonScale)  Inventory.remove('dragonScale',  cost.dragonScale);
      if (cost.celestialOrb) Inventory.remove('celestialOrb', cost.celestialOrb);
      if (cost.gold)         Player.gold -= cost.gold;
    }
    this.state.level++;
    this._updateDisciples();
    Player.recalculateStats();
    const levelInfo = SECT_CONFIG.sectLevels[this.state.level - 1];
    UI.showNotification('🏯 Tông Môn Thăng Cấp!', levelInfo.name);
    UI.addLog('🏯 Tông Môn lên cấp ' + this.state.level + ' — ' + levelInfo.name + '!', 'realm');
    return true;
  },

  changeDirection(newDirection) {
    if (!this.state.founded || !SECT_CONFIG.directions[newDirection]) return false;
    const cost = SECT_CONFIG.directions[this.state.direction].changeCost;
    if (!Inventory.has('dragonScale', cost.dragonScale) || Player.gold < cost.gold) {
      UI.addLog(`❌ Không đủ điều kiện đổi hướng! Cần ${cost.dragonScale} Vảy Rồng + ${cost.gold} vàng`, 'system');
      return false;
    }
    Inventory.remove('dragonScale', cost.dragonScale);
    Player.gold -= cost.gold;
    this.state.direction = newDirection;
    Player.recalculateStats();
    UI.showNotification('🏯 Đổi Hướng Tu Luyện', SECT_CONFIG.directions[newDirection].name);
    UI.addLog('🏯 Đã đổi hướng tu luyện sang ' + SECT_CONFIG.directions[newDirection].name, 'realm');
    return true;
  },

  _updateDisciples() {
    const max = SECT_CONFIG.sectLevels[this.state.level - 1].disciple;
    while (this.state.disciples.length < max) this._createDisciple();
    while (this.state.disciples.length > max) this.state.disciples.pop();
  },

  _createDisciple() {
    const names = SECT_CONFIG.discipleNames;
    const name  = names[Math.floor(Math.random() * names.length)];
    const level = Math.max(1, Math.floor(Player.level * 0.5));
    this.state.disciples.push({
      name,
      level,
      x: Player.x + (Math.random() - 0.5) * 60,
      y: Player.y + (Math.random() - 0.5) * 60,
      targetX: Player.x, targetY: Player.y,
      hp: 50 + level * 10, maxHp: 50 + level * 10,
      atk: Math.max(1, Math.floor(Player.atk * 0.3)),
      attackTimer: 0,
      alive: true,
      frame: 0, frameTimer: 0
    });
  },

  update(dt) {
    if (!this.state.founded) return;
    this.state._regenTimer += dt;

    for (const d of this.state.disciples) {
      if (!d.alive) continue;

      // Follow player
      const dist = Utils.dist(d.x, d.y, Player.x, Player.y);
      if (dist > 100) {
        const dx   = Player.x - d.x;
        const dy   = Player.y - d.y;
        const newX = d.x + (dx / dist) * 2.0;
        const newY = d.y + (dy / dist) * 2.0;
        const tileX = Math.floor(newX / CONFIG.TILE_SIZE);
        const tileY = Math.floor(newY / CONFIG.TILE_SIZE);
        if (!Maps.isWater(tileX, tileY)) { d.x = newX; d.y = newY; }
      }

      // Attack nearest enemy
      d.attackTimer -= dt;
      if (d.attackTimer <= 0) {
        const target = Enemies.findNearest(d.x, d.y, 120, e => e.alive);
        if (target) {
          Enemies.damage(target, d.atk, false, '#aaa');
          d.attackTimer = 1500;
          GameState.particles.push({
            x: d.x, y: d.y,
            vx: (target.x - d.x) / 20, vy: (target.y - d.y) / 20,
            life: 200, color: '#ddd', size: 2
          });
        } else {
          d.attackTimer = 500;
        }
      }

      // Walk animation
      d.frameTimer += dt;
      if (d.frameTimer > 200) { d.frame = (d.frame + 1) % 2; d.frameTimer = 0; }
    }

    // HP/MP regen from direction bonus
    if (this.state._regenTimer >= 3000) {
      this.state._regenTimer = 0;
      const bonus = this.getBonus();
      if (bonus.hpRegen) Player.hp = Math.min(Player.maxHp, Player.hp + bonus.hpRegen);
      if (bonus.mpRegen) Player.mp = Math.min(Player.maxMp, Player.mp + bonus.mpRegen);
    }
  },

  render(ctx) {
    if (!this.state.founded) return;
    for (const d of this.state.disciples) {
      if (!d.alive) continue;
      const cx = d.x - GameState.camera.x;
      const cy = d.y - GameState.camera.y;

      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 12, 8, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      const dirColor = this.state.direction
        ? SECT_CONFIG.directions[this.state.direction].color : '#888';
      ctx.fillStyle = dirColor;
      ctx.fillRect(cx - 5, cy - 10, 10, 14);
      ctx.fillStyle = '#ffe4c4';
      ctx.fillRect(cx - 3, cy - 18,  6,  8);
      ctx.fillStyle = _darkenColor(dirColor);
      ctx.fillRect(cx - 5, cy -  4, 10,  4);

      if (d.hp < d.maxHp) {
        ctx.fillStyle = '#333';
        ctx.fillRect(cx - 10, cy - 24, 20, 3);
        ctx.fillStyle = '#4caf50';
        ctx.fillRect(cx - 10, cy - 24, 20 * (d.hp / d.maxHp), 3);
      }

      ctx.fillStyle = '#ddd';
      ctx.font = '8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(d.name, cx, cy - 26);
    }
  }
};


// ==================== SECTION 3: ARTS SYSTEM ====================

const ArtsSystem = {
  state: {
    learnedArts: [],
    bloodStacks: 0,
    _regenTimer: 0,
    _pickupTimer: 0
  },

  hasArt(artId) {
    return this.state.learnedArts.includes(artId);
  },

  getConflicts(artId) {
    const art = ARTS_CONFIG.secretArts.find(a => a.id === artId);
    return (art?.conflictWith || []).filter(id => this.hasArt(id));
  },

  canLearn(artId) {
    const art = ARTS_CONFIG.secretArts.find(a => a.id === artId);
    if (!art)                   return { can: false, reason: 'Công Pháp không tồn tại' };
    if (this.hasArt(artId))     return { can: false, reason: 'Đã học rồi' };
    const conflicts  = this.getConflicts(artId);
    const needsSlot  = this.state.learnedArts.length >= ARTS_CONFIG.maxArtsSlots && conflicts.length === 0;
    return { can: true, conflicts, needsSlot };
  },

  learnArt(artId) {
    const check = this.canLearn(artId);
    if (!check.can) { UI.addLog('❌ ' + check.reason, 'system'); return false; }
    if (check.conflicts.length > 0) { ArtsUI.showConflictDialog(artId, check.conflicts); return false; }
    if (check.needsSlot)             { ArtsUI.showSlotDialog(artId); return false; }
    this._doLearnArt(artId);
    return true;
  },

  _doLearnArt(artId, replaceId) {
    if (replaceId) this.forgetArt(replaceId);
    this.state.learnedArts.push(artId);
    const art = ARTS_CONFIG.secretArts.find(a => a.id === artId);
    Player.recalculateStats();
    UI.showNotification('📖 ' + art.name + '!', art.desc);
    UI.addLog('📖 Học được Công Pháp: ' + art.name + '!', 'realm');
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      GameState.particles.push({
        x: Player.x + Math.cos(angle) * 20,
        y: Player.y + Math.sin(angle) * 20,
        vx: Math.cos(angle) * 2.5, vy: Math.sin(angle) * 2.5 - 1,
        life: 700, color: '#ffd700', size: 3 + Math.random() * 3
      });
    }
  },

  forgetArt(artId) {
    this.state.learnedArts = this.state.learnedArts.filter(id => id !== artId);
    if (artId === 'bloodSlaughter') this.state.bloodStacks = 0;
    Player.recalculateStats();
    UI.addLog('📖 Đã quên Công Pháp: ' + _getArtName(artId), 'system');
  },

  recalculateArtsBonus() {
    if (this.hasArt('bloodSlaughter')) {
      Player.atk = Math.floor(Player.atk * (1 + this.state.bloodStacks * 0.02));
    }
    Player._artsDeathCounterActive = this.hasArt('deathCounter')
      && Player.maxHp > 0
      && Player.hp / Player.maxHp < 0.30;
    Player._artsMpFloor = this.hasArt('infiniteSea')
      ? Math.floor(Player.maxMp * 0.20)
      : 0;
  },

  update(dt) {
    // springReturn regen
    if (this.hasArt('springReturn')) {
      this.state._regenTimer += dt;
      if (this.state._regenTimer >= 3000) {
        this.state._regenTimer = 0;
        Player.hp = Math.min(Player.maxHp, Player.hp + Math.floor(Player.maxHp * 0.01));
      }
    } else {
      this.state._regenTimer = 0;
    }

    // spiritSense auto-pickup
    if (this.hasArt('spiritSense')) {
      this.state._pickupTimer += dt;
      if (this.state._pickupTimer >= 500) {
        this.state._pickupTimer = 0;
        if (GameState.groundItems?.length > 0) {
          for (let i = GameState.groundItems.length - 1; i >= 0; i--) {
            const gi = GameState.groundItems[i];
            if (Utils.dist(Player.x, Player.y, gi.x, gi.y) <= 150 && Inventory.add(gi.id, gi.count || 1)) {
              GameState.groundItems.splice(i, 1);
              UI.addLog('✨ Tiên Linh thu ' + (ITEMS[gi.id]?.name || gi.id), 'item');
            }
          }
        }
      }
    }

    // infiniteSea MP floor
    if (this.hasArt('infiniteSea') && Player._artsMpFloor > 0 && Player.mp < Player._artsMpFloor) {
      Player.mp = Player._artsMpFloor;
    }
  }
};


// ==================== SECTION 4: UI ====================

const SectUI = {
  selectedDirection: null,

  renderSectTab(container) {
    container.innerHTML = '';
    const state = SectSystem.state;

    if (!state.founded) {
      if (!SectSystem.canFound()) {
        container.innerHTML = `
          <div style="text-align:center;padding:20px;color:#ff9800">
            ⚠️ Cần đạt <b>Kim Đan Kỳ</b> để lập Tông Môn!<br>
            <small style="color:#666">Cảnh giới hiện tại: ${REALMS[Player.realm].name}</small>
          </div>`;
        return;
      }

      const form = document.createElement('div');
      form.style.cssText = 'padding:10px';
      form.innerHTML = `
        <div style="color:#f0c040;font-size:12px;font-weight:bold;margin-bottom:10px">🏯 Lập Tông Môn Mới</div>
        <input id="sectNameInput" type="text" maxlength="16"
          placeholder="Nhập tên Tông Môn..."
          style="width:100%;padding:8px;background:rgba(255,255,255,0.08);border:2px solid #444;border-radius:8px;color:#fff;font-family:inherit;font-size:12px;box-sizing:border-box;margin-bottom:12px">
        <div style="color:#aaa;font-size:11px;margin-bottom:8px">Chọn hướng tu luyện:</div>
        <div id="dirCards" style="display:flex;flex-direction:column;gap:8px;margin-bottom:14px"></div>
        <button id="foundSectBtn"
          style="width:100%;padding:10px;background:rgba(240,192,64,0.15);border:2px solid #f0c040;border-radius:10px;color:#f0c040;font-family:inherit;font-size:13px;font-weight:bold;cursor:pointer">
          ⚡ Lập Tông Môn
        </button>`;
      container.appendChild(form);

      const dirCards = form.querySelector('#dirCards');
      for (const key of ['sword', 'magic', 'body']) {
        const dir  = SECT_CONFIG.directions[key];
        const card = document.createElement('div');
        card.style.cssText = `
          padding:10px;border-radius:10px;cursor:pointer;
          border:2px solid ${this.selectedDirection === key ? dir.color : '#333'};
          background:${this.selectedDirection === key ? `rgba(${_hexToRgb(dir.color)},0.18)` : 'rgba(255,255,255,0.04)'};
          display:flex;align-items:center;gap:10px;transition:border .15s`;
        card.innerHTML = `
          <span style="font-size:20px">${dir.icon}</span>
          <div>
            <div style="color:${dir.color};font-size:12px;font-weight:bold">${dir.name}</div>
            <div style="color:#999;font-size:10px">${dir.desc}</div>
          </div>`;
        card.addEventListener('click', () => { this.selectedDirection = key; this.renderSectTab(container); });
        dirCards.appendChild(card);
      }

      form.querySelector('#foundSectBtn').addEventListener('click', () => {
        const name = form.querySelector('#sectNameInput').value;
        if (SectSystem.found(name, this.selectedDirection)) SectArtsPanel.renderCurrentTab();
      });
      return;
    }

    // ── Sect info ──
    const dir       = SECT_CONFIG.directions[state.direction];
    const levelInfo = SECT_CONFIG.sectLevels[state.level - 1];
    const bonus     = SectSystem.getBonus();

    const info = document.createElement('div');
    info.style.cssText = 'padding:10px';

    const header = document.createElement('div');
    header.style.cssText = `
      background:linear-gradient(135deg,rgba(${_hexToRgb(dir.color)},0.2),rgba(0,0,0,0.3));
      border:2px solid ${dir.color};border-radius:12px;padding:12px;margin-bottom:12px;text-align:center`;
    header.innerHTML = `
      <div style="font-size:22px">${dir.icon}</div>
      <div style="color:${dir.color};font-size:14px;font-weight:bold">${state.sectName}</div>
      <div style="color:#aaa;font-size:11px">${dir.name} · Cấp ${state.level} · ${levelInfo.name}</div>`;
    info.appendChild(header);

    if (Object.keys(bonus).length > 0) {
      const bonusDiv = document.createElement('div');
      bonusDiv.style.cssText = 'background:rgba(255,255,255,0.04);border-radius:8px;padding:8px;margin-bottom:10px;font-size:11px';
      bonusDiv.innerHTML = '<div style="color:#f0c040;margin-bottom:6px">✦ Bonus Tông Môn:</div>';
      const bonusMap = {
        atk:      ['ATK',       '+{v}%'],
        def:      ['DEF',       '+{v}%'],
        maxHp:    ['Max HP',    '+{v}%'],
        maxMp:    ['Max MP',    '+{v}%'],
        critRate: ['Bạo Kích',  '+{v}%'],
        skillDmg: ['Skill DMG', '+{v}%'],
        hpRegen:  ['HP Regen',  '+{v}/3s'],
        mpRegen:  ['MP Regen',  '+{v}/3s']
      };
      for (const [k, v] of Object.entries(bonus)) {
        if (!bonusMap[k]) continue;
        const [label, fmt] = bonusMap[k];
        const val = (k === 'hpRegen' || k === 'mpRegen') ? v : Math.round(v * 100);
        bonusDiv.innerHTML += `<div style="color:#ccc;display:flex;justify-content:space-between">
          <span>${label}</span><span style="color:#4caf50">${fmt.replace('{v}', val)}</span></div>`;
      }
      info.appendChild(bonusDiv);
    }

    if (state.disciples.length > 0) {
      const discDiv = document.createElement('div');
      discDiv.style.cssText = 'margin-bottom:10px';
      discDiv.innerHTML = `<div style="color:#aaa;font-size:11px;margin-bottom:6px">👥 Đệ Tử (${state.disciples.length}):</div>`;
      for (const d of state.disciples) {
        discDiv.innerHTML += `
          <div style="background:rgba(255,255,255,0.04);border-radius:6px;padding:6px 8px;
                      display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;font-size:11px">
            <span style="color:${dir.color}">${dir.icon} ${d.name}</span>
            <span style="color:#888">Lv.${d.level} · ATK ${d.atk}</span>
          </div>`;
      }
      info.appendChild(discDiv);
    }

    if (state.level < 5) {
      const nextLevel     = SECT_CONFIG.sectLevels[state.level];
      const upgradeCheck  = SectSystem.canUpgrade();
      let costHtml = '';
      if (nextLevel.upgradeCost) {
        for (const [k, v] of Object.entries(nextLevel.upgradeCost)) {
          const iname = k === 'gold' ? `${v} 💰` : `${ITEMS[k]?.name || k} x${v}`;
          const has   = k === 'gold' ? Player.gold >= v : Inventory.has(k, v);
          costHtml += `<span style="color:${has ? '#4caf50' : '#f44336'}">${iname}</span> `;
        }
      }
      const upDiv = document.createElement('div');
      upDiv.style.cssText = 'margin-bottom:8px';
      upDiv.innerHTML = `
        <div style="color:#aaa;font-size:10px;margin-bottom:6px">Thăng cấp → ${nextLevel.name}: ${costHtml}</div>
        <button id="upgradeSectBtn" ${upgradeCheck.can ? '' : 'disabled'}
          style="width:100%;padding:8px;border:2px solid ${upgradeCheck.can ? '#f0c040' : '#444'};
                 background:rgba(240,192,64,${upgradeCheck.can ? '0.15' : '0.05'});
                 border-radius:8px;color:${upgradeCheck.can ? '#f0c040' : '#555'};
                 font-family:inherit;font-size:12px;cursor:${upgradeCheck.can ? 'pointer' : 'default'}">
          ⬆ Nâng Cấp Tông Môn
        </button>`;
      info.appendChild(upDiv);
      if (upgradeCheck.can) {
        upDiv.querySelector('#upgradeSectBtn').addEventListener('click', () => {
          SectSystem.upgrade();
          SectArtsPanel.renderCurrentTab();
        });
      }
    } else {
      info.innerHTML += `<div style="text-align:center;color:#f0c040;font-size:12px;padding:8px">🏆 Tông Môn đã đạt đỉnh cao!</div>`;
    }

    const changeCost = dir.changeCost;
    const canChange  = Inventory.has('dragonScale', changeCost.dragonScale) && Player.gold >= changeCost.gold;
    const changeDiv  = document.createElement('div');
    changeDiv.innerHTML = `
      <div style="color:#aaa;font-size:10px;margin-bottom:4px">
        Đổi hướng: Vảy Rồng x${changeCost.dragonScale} + ${changeCost.gold} 💰
      </div>
      <div style="display:flex;gap:6px">
        ${Object.keys(SECT_CONFIG.directions).filter(k => k !== state.direction).map(k => {
          const d2 = SECT_CONFIG.directions[k];
          return `<button class="changeDir" data-dir="${k}"
            style="flex:1;padding:7px;border:2px solid ${canChange ? d2.color : '#333'};
                   background:rgba(255,255,255,0.04);border-radius:8px;
                   color:${canChange ? d2.color : '#555'};font-family:inherit;
                   font-size:11px;cursor:${canChange ? 'pointer' : 'default'}">
            ${d2.icon} ${d2.name.split('')[0]}...
          </button>`;
        }).join('')}
      </div>`;
    info.appendChild(changeDiv);
    if (canChange) {
      changeDiv.querySelectorAll('.changeDir').forEach(btn => {
        btn.addEventListener('click', () => {
          SectSystem.changeDirection(btn.dataset.dir);
          SectArtsPanel.renderCurrentTab();
        });
      });
    }
    container.appendChild(info);
  },

  renderArtsTab(container) {
    container.innerHTML = '';
    const state = ArtsSystem.state;
    const wrap  = document.createElement('div');
    wrap.style.cssText = 'padding:10px';

    wrap.innerHTML += '<div style="color:#f0c040;font-size:12px;font-weight:bold;margin-bottom:8px">📖 Công Pháp đang dùng (tối đa 3):</div>';
    const slotsDiv = document.createElement('div');
    slotsDiv.style.cssText = 'display:flex;flex-direction:column;gap:6px;margin-bottom:14px';

    for (let i = 0; i < ARTS_CONFIG.maxArtsSlots; i++) {
      const artId = state.learnedArts[i];
      const slot  = document.createElement('div');
      slot.style.cssText = 'background:rgba(255,255,255,0.05);border-radius:8px;padding:8px;display:flex;align-items:center;gap:8px;min-height:40px';
      if (artId) {
        const art    = ARTS_CONFIG.secretArts.find(a => a.id === artId);
        const stacks = artId === 'bloodSlaughter' ? ` (${state.bloodStacks} stacks)` : '';
        slot.innerHTML = `
          <span style="font-size:18px">${art.icon}</span>
          <div style="flex:1">
            <div style="color:${_rarityColor(art.rarity)};font-size:11px;font-weight:bold">${art.name}${stacks}</div>
            <div style="color:#888;font-size:9px">${art.desc}</div>
          </div>
          <button data-forget="${artId}"
            style="padding:4px 8px;border:1px solid #f44336;background:rgba(244,67,54,0.15);
                   border-radius:6px;color:#f44336;font-family:inherit;font-size:10px;cursor:pointer">🗑</button>`;
      } else {
        slot.innerHTML = '<span style="color:#444;font-size:11px;width:100%;text-align:center">— Trống —</span>';
      }
      slotsDiv.appendChild(slot);
    }
    wrap.appendChild(slotsDiv);

    wrap.querySelectorAll('[data-forget]').forEach(btn => {
      btn.addEventListener('click', () => {
        ArtsSystem.forgetArt(btn.dataset.forget);
        SectArtsPanel.renderCurrentTab();
      });
    });

    wrap.innerHTML += '<div style="border-top:1px solid #333;margin:10px 0"></div>';
    wrap.innerHTML += '<div style="color:#aaa;font-size:11px;margin-bottom:8px">📜 Bí Kíp Quyển trong túi:</div>';

    const scrollArts = ARTS_CONFIG.secretArts.filter(art => Inventory.has('scroll_' + art.id));
    if (!scrollArts.length) {
      wrap.innerHTML += '<div style="color:#555;font-size:11px;text-align:center;padding:12px">Chưa có Bí Kíp Quyển.<br><small>Thu thập từ boss và dungeon!</small></div>';
    } else {
      const scrollList = document.createElement('div');
      scrollList.style.cssText = 'display:flex;flex-direction:column;gap:6px';

      for (const art of scrollArts) {
        const check        = ArtsSystem.canLearn(art.id);
        const hasConflict  = check.can && check.conflicts.length > 0;
        const needsSlot    = check.can && check.needsSlot;
        const cantLearn    = !check.can;

        let btnStyle, btnText;
        if (cantLearn) {
          btnStyle = 'border:1px solid #555;background:rgba(255,255,255,0.03);color:#555;cursor:default';
          btnText  = check.reason === 'Đã học rồi' ? '✓ Đã học' : '✕';
        } else if (hasConflict) {
          btnStyle = 'border:1px solid #ff9800;background:rgba(255,152,0,0.15);color:#ff9800;cursor:pointer';
          btnText  = '⚠️ Học';
        } else {
          btnStyle = 'border:1px solid #4caf50;background:rgba(76,175,80,0.15);color:#4caf50;cursor:pointer';
          btnText  = needsSlot ? '🔄 Học' : '📖 Học';
        }

        const row = document.createElement('div');
        row.style.cssText = 'background:rgba(255,255,255,0.04);border-radius:8px;padding:8px;display:flex;align-items:center;gap:8px';
        row.innerHTML = `
          <span style="font-size:16px">${art.icon}</span>
          <div style="flex:1">
            <div style="color:${_rarityColor(art.rarity)};font-size:11px;font-weight:bold">${art.name}</div>
            <div style="color:#777;font-size:9px">${art.desc}</div>
          </div>
          <button data-learn="${art.id}"
            style="padding:4px 8px;border-radius:6px;font-family:inherit;font-size:10px;${btnStyle}">
            ${btnText}
          </button>`;
        scrollList.appendChild(row);
      }
      wrap.appendChild(scrollList);

      wrap.querySelectorAll('[data-learn]').forEach(btn => {
        btn.addEventListener('click', () => {
          const check = ArtsSystem.canLearn(btn.dataset.learn);
          if (!check.can) return;
          ArtsSystem.learnArt(btn.dataset.learn);
          SectArtsPanel.renderCurrentTab();
        });
      });
    }

    container.appendChild(wrap);
  }
};

const ArtsUI = {
  showConflictDialog(artId, conflictIds) {
    const dialog       = document.getElementById('artsConflictDialog');
    const conflictText = document.getElementById('conflictText');
    conflictText.innerHTML = `Học <b style="color:#f0c040">${_getArtName(artId)}</b> sẽ quên <b style="color:#ff9800">${conflictIds.map(_getArtName).join(', ')}</b>.<br>Bạn có đồng ý không?`;

    document.getElementById('conflictYes').onclick = () => {
      conflictIds.forEach(id => ArtsSystem.forgetArt(id));
      ArtsSystem._doLearnArt(artId);
      dialog.style.display = 'none';
      SectArtsPanel.renderCurrentTab();
    };
    document.getElementById('conflictNo').onclick = () => { dialog.style.display = 'none'; };
    dialog.style.display = 'block';
  },

  showSlotDialog(artId) {
    const learnedArts = ArtsSystem.state.learnedArts;
    if (!learnedArts.length) { ArtsSystem._doLearnArt(artId); return; }

    const dialog       = document.getElementById('artsConflictDialog');
    const conflictText = document.getElementById('conflictText');

    const optHtml = learnedArts.map(id =>
      `<button class="slotReplaceBtn" data-replace="${id}"
        style="width:100%;margin-bottom:6px;padding:8px;border:2px solid #7c4dff;
               background:rgba(124,77,255,0.15);border-radius:8px;color:#ce93d8;
               font-family:inherit;font-size:11px;cursor:pointer">
        Quên: ${_getArtName(id)}
      </button>`
    ).join('');

    conflictText.innerHTML = `Slot Công Pháp đầy. Chọn Công Pháp muốn quên để học <b style="color:#f0c040">${_getArtName(artId)}</b>:<br><br>${optHtml}`;

    const yesBtn = document.getElementById('conflictYes');
    const noBtn  = document.getElementById('conflictNo');
    yesBtn.style.display = 'none';
    noBtn.textContent    = '✕ Hủy';
    noBtn.onclick = () => {
      dialog.style.display = 'none';
      yesBtn.style.display = '';
      noBtn.textContent    = '✕ Hủy';
    };
    dialog.style.display = 'block';

    dialog.querySelectorAll('.slotReplaceBtn').forEach(btn => {
      btn.addEventListener('click', () => {
        ArtsSystem._doLearnArt(artId, btn.dataset.replace);
        dialog.style.display = 'none';
        yesBtn.style.display = '';
        SectArtsPanel.renderCurrentTab();
      });
    });
  }
};

const SectArtsPanel = {
  _currentTab: 'sect',

  open() {
    document.getElementById('sectArtsOverlay').style.display = 'flex';
    this._currentTab = 'sect';
    this._updateTabs();
    this.renderCurrentTab();
  },

  close() {
    document.getElementById('sectArtsOverlay').style.display = 'none';
  },

  _updateTabs() {
    document.querySelectorAll('#sectArtsTabRow .tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === this._currentTab);
    });
  },

  renderCurrentTab() {
    const content = document.getElementById('sectArtsContent');
    if (this._currentTab === 'sect') SectUI.renderSectTab(content);
    else                             SectUI.renderArtsTab(content);
  }
};


// ==================== SECTION 5: INIT & MONKEY-PATCHES ====================

const SectArtsFeature = {
  init() {
    this._injectHTML();
    this._injectStyles();
    this._addScrollItems();
    this._setupEventListeners();
    this._addNPCType();
    this._hookNPCSpawnForMap();
    this._hookNPCInteract();
    this._hookRecalculateStats();
    this._hookGameUpdate();
    this._hookGameRender();
    this._hookSaveLoad();
    this._hookInventoryUseItem();
    this._hookEnemiesDamage();
    this._hookEnemiesKill();
    this._hookPlayerGainExp();
    this._hookPlayerTakeDamage();
    this._hookPlayerDie();
    this._hookPlayerUseSkill();
    this._loadSavedData();
    Player.recalculateStats();
  },

  _injectHTML() {
    const html = `
    <div id="sectArtsOverlay" class="modal-overlay" style="display:none;z-index:110;
      position:fixed;inset:0;background:rgba(0,0,0,0.7);align-items:center;justify-content:center">
      <div class="modal-panel" style="max-width:420px;width:92vw;
        background:linear-gradient(135deg,#1a1a2e,#16213e);
        border:2px solid #f0c040;border-radius:16px;overflow:hidden;
        max-height:85vh;display:flex;flex-direction:column">
        <div class="modal-header" style="padding:14px 16px;background:rgba(240,192,64,0.08);
          border-bottom:1px solid #333;display:flex;align-items:center;justify-content:space-between">
          <div style="color:#f0c040;font-size:14px;font-weight:bold">🏯 Tông Môn & Công Pháp</div>
          <div id="sectArtsClose" style="color:#888;font-size:18px;cursor:pointer;padding:0 4px">✕</div>
        </div>
        <div id="sectArtsTabRow" style="display:flex;border-bottom:1px solid #333">
          <div class="tab-btn active" data-tab="sect"
            style="flex:1;padding:10px;text-align:center;cursor:pointer;font-size:12px;color:#f0c040;border-bottom:2px solid #f0c040">🏯 Tông Môn</div>
          <div class="tab-btn" data-tab="arts"
            style="flex:1;padding:10px;text-align:center;cursor:pointer;font-size:12px;color:#888">📖 Công Pháp</div>
        </div>
        <div id="sectArtsContent" style="min-height:300px;overflow-y:auto;flex:1"></div>
      </div>
    </div>

    <div id="artsConflictDialog" style="display:none;position:fixed;
      top:50%;left:50%;transform:translate(-50%,-50%);
      background:linear-gradient(135deg,#1a1a2e,#16213e);
      border:3px solid #ff9800;border-radius:15px;
      padding:20px;min-width:280px;max-width:340px;
      text-align:center;z-index:160;word-break:break-word">
      <div id="conflictText" style="color:#ff9800;font-size:12px;margin-bottom:15px;line-height:1.5"></div>
      <div style="display:flex;gap:10px">
        <button id="conflictYes"
          style="flex:1;padding:10px;border:2px solid #4caf50;background:rgba(76,175,80,0.2);border-radius:8px;color:#4caf50;font-size:11px;cursor:pointer;font-family:inherit">✓ Đồng ý quên</button>
        <button id="conflictNo"
          style="flex:1;padding:10px;border:2px solid #f44336;background:rgba(244,67,54,0.2);border-radius:8px;color:#f44336;font-size:11px;cursor:pointer;font-family:inherit">✕ Hủy</button>
      </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
  },

  _injectStyles() {
    if (document.getElementById('sect-arts-style')) return;
    const style = document.createElement('style');
    style.id = 'sect-arts-style';
    style.textContent = `
      #sectArtsTabRow .tab-btn { transition:color .2s, border-color .2s; }
      #sectArtsTabRow .tab-btn.active { color:#f0c040; border-bottom:2px solid #f0c040; }
      #sectArtsTabRow .tab-btn:not(.active) { color:#888; border-bottom:2px solid transparent; }
      #sectArtsContent::-webkit-scrollbar { width:4px; }
      #sectArtsContent::-webkit-scrollbar-thumb { background:#444; border-radius:2px; }`;
    document.head.appendChild(style);
  },

  _addScrollItems() {
    for (const art of ARTS_CONFIG.secretArts) {
      const key = 'scroll_' + art.id;
      if (!ITEMS[key]) {
        ITEMS[key] = {
          name:      'Bí Kíp: ' + art.name,
          type:      'consumable',
          rarity:    art.rarity,
          desc:      art.desc + '\nDùng để học Công Pháp.',
          effect:    { learnArt: art.id },
          sellPrice: art.rarity === 'legendary' ? 1000 : art.rarity === 'epic' ? 400 : 150,
          icon:      'scroll'
        };
      }
    }
  },

  _setupEventListeners() {
    document.addEventListener('click', e => {
      if (e.target.id === 'sectArtsClose') SectArtsPanel.close();
    });
    document.addEventListener('click', e => {
      const btn = e.target.closest('#sectArtsTabRow .tab-btn');
      if (!btn) return;
      SectArtsPanel._currentTab = btn.dataset.tab;
      SectArtsPanel._updateTabs();
      SectArtsPanel.renderCurrentTab();
    });
    document.addEventListener('click', e => {
      if (e.target.id === 'sectArtsOverlay') SectArtsPanel.close();
    });
  },

  _addNPCType() {
    NPC.types.sectElder = {
      name:    'Tông Môn Trưởng Lão',
      title:   'Người dẫn đường tu luyện',
      sprite:  'npcTeleporter',
      dialog:  'Đạo hữu muốn lập Tông Môn hay học Công Pháp?',
      service: 'sect'
    };
  },

  _hookNPCSpawnForMap() {
    const _origSpawnForMap = NPC.spawnForMap.bind(NPC);
    NPC.spawnForMap = function(mapIndex) {
      _origSpawnForMap(mapIndex);
      const elderPositions = [[600,300],[350,500],[500,350],[420,400],[380,320],[460,350]];
      const pos = elderPositions[mapIndex] || [500, 400];
      NPC.spawn('sectElder', pos[0], pos[1]);
    };
  },

  _hookNPCInteract() {
    const _origInteract = NPC.interact.bind(NPC);
    NPC.interact = function(npc) {
      if (npc?.service === 'sect') { SectArtsPanel.open(); return; }
      _origInteract(npc);
    };
  },

  _hookRecalculateStats() {
    const _origRS = Player.recalculateStats.bind(Player);
    Player.recalculateStats = function() {
      _origRS();
      if (SectSystem.state.founded) {
        const bonus = SectSystem.getBonus();
        if (bonus.atk)      this.atk      = Math.floor(this.atk      * (1 + bonus.atk));
        if (bonus.def)      this.def      = Math.floor(this.def      * (1 + bonus.def));
        if (bonus.maxHp)    this.maxHp    = Math.floor(this.maxHp    * (1 + bonus.maxHp));
        if (bonus.maxMp)    this.maxMp    = Math.floor(this.maxMp    * (1 + bonus.maxMp));
        if (bonus.critRate) this.critRate += bonus.critRate;
        Player._sectSkillDmg = bonus.skillDmg || 0;
      } else {
        Player._sectSkillDmg = 0;
      }
      this.hp = Math.min(this.hp, this.maxHp);
      this.mp = Math.min(this.mp, this.maxMp);
      ArtsSystem.recalculateArtsBonus();
    };
  },

  _hookGameUpdate() {
    const _origUpdate = Game.update.bind(Game);
    Game.update = function(dt) {
      _origUpdate(dt);
      SectSystem.update(dt);
      ArtsSystem.update(dt);
    };
  },

  _hookGameRender() {
    // Prefer Game.renderWorld (world-space context); fallback to wrapping Game.render
    const _origRenderWorld = Game.renderWorld ? Game.renderWorld.bind(Game) : null;
    if (_origRenderWorld) {
      Game.renderWorld = function(ctx) { _origRenderWorld(ctx); SectSystem.render(ctx); };
    } else {
      const _origRender = Game.render.bind(Game);
      Game.render = function() {
        _origRender();
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(-GameState.camera.x, -GameState.camera.y);
        SectSystem.render(ctx);
        ctx.restore();
      };
    }
  },

  _hookSaveLoad() {
    const SAVE_KEY = 'tuxien_sect_arts';

    if (Game.save) {
      const _origSave = Game.save.bind(Game);
      Game.save = function() {
        _origSave();
        try {
          localStorage.setItem(SAVE_KEY, JSON.stringify({
            sect: SectSystem.state,
            arts: { learnedArts: ArtsSystem.state.learnedArts, bloodStacks: ArtsSystem.state.bloodStacks }
          }));
        } catch (e) { console.warn('SectArts save error', e); }
      };
    }

    if (Game.load) {
      const _origLoad = Game.load.bind(Game);
      Game.load = function() { _origLoad(); SectArtsFeature._loadSavedData(); };
    }
  },

  _loadSavedData() {
    try {
      const raw = localStorage.getItem('tuxien_sect_arts');
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data.sect) {
        Object.assign(SectSystem.state, data.sect);
        SectSystem.state.disciples = data.sect.disciples || [];
      }
      if (data.arts) {
        ArtsSystem.state.learnedArts = data.arts.learnedArts || [];
        ArtsSystem.state.bloodStacks = data.arts.bloodStacks || 0;
      }
    } catch (e) { console.warn('SectArts load error', e); }
  },

  _hookInventoryUseItem() {
    const _origUseItem = Inventory.useItem.bind(Inventory);
    Inventory.useItem = function(itemId) {
      const itemData = ITEMS[itemId];
      if (itemData?.effect?.learnArt) {
        if (!Inventory.has(itemId)) return false;
        const learned = ArtsSystem.learnArt(itemData.effect.learnArt);
        if (learned) { Inventory.remove(itemId, 1); Inventory.render(); }
        return true;
      }
      return _origUseItem(itemId);
    };

    // Remove scroll after _doLearnArt (covers conflict/slot paths)
    const _origDoLearnArt = ArtsSystem._doLearnArt.bind(ArtsSystem);
    ArtsSystem._doLearnArt = function(artId, replaceId) {
      _origDoLearnArt(artId, replaceId);
      const scrollKey = 'scroll_' + artId;
      if (Inventory.has(scrollKey)) { Inventory.remove(scrollKey, 1); Inventory.render(); }
    };
  },

  _hookEnemiesDamage() {
    const _origDamage = Enemies.damage.bind(Enemies);
    Enemies.damage = function(enemy, amount, isCrit, color) {
      let finalAmount = Player._artsDeathCounterActive ? Math.floor(amount * 1.40) : amount;

      _origDamage(enemy, finalAmount, isCrit, color);

      // swordRain: extra sword qi on basic attack
      if (ArtsSystem.hasArt('swordRain') && Player._isBasicAttack) {
        const extraDmg = Math.floor(Player.atk * 0.20);
        if (enemy.alive && enemy.hp > 0) {
          enemy.hp -= extraDmg;
          Game.spawnDamageNumber(enemy.x + 10, enemy.y - 15, extraDmg.toString(), '#ef5350');
          for (let i = 0; i < 3; i++) {
            GameState.particles.push({
              x: Player.x, y: Player.y,
              vx: (enemy.x - Player.x) / 15 + (Math.random() - 0.5),
              vy: (enemy.y - Player.y) / 15 + (Math.random() - 0.5),
              life: 250, color: '#ef5350', size: 2
            });
          }
          if (enemy.hp <= 0) Enemies.kill(enemy);
        }
      }

      // thunderCrit: proc on crit
      if (ArtsSystem.hasArt('thunderCrit') && isCrit && enemy.alive && enemy.hp > 0) {
        const thunderDmg = Math.floor(Player.atk * 0.30);
        enemy.hp -= thunderDmg;
        Game.spawnDamageNumber(enemy.x - 10, enemy.y - 20, '⚡' + thunderDmg, '#ffff00');
        GameState.particles.push({
          x: enemy.x, y: enemy.y,
          vx: (Math.random() - 0.5) * 3, vy: -2 - Math.random() * 2,
          life: 400, color: '#ffff00', size: 4
        });
        if (enemy.hp <= 0) Enemies.kill(enemy);
      }
    };
  },

  _hookEnemiesKill() {
    if (typeof Enemies.kill !== 'function') return;
    const _origKill = Enemies.kill.bind(Enemies);
    Enemies.kill = function(enemy) {
      if (ArtsSystem.hasArt('bloodSlaughter')) {
        ArtsSystem.state.bloodStacks = Math.min(20, ArtsSystem.state.bloodStacks + 1);
        Player.recalculateStats();
      }
      if (ArtsSystem.hasArt('devourHeaven') && enemy.gold) {
        enemy.gold = Math.floor(enemy.gold * 1.30);
      }
      _origKill(enemy);
    };
  },

  _hookPlayerGainExp() {
    const _origGainExp = Player.gainExp.bind(Player);
    Player.gainExp = function(amount) {
      _origGainExp(ArtsSystem.hasArt('devourHeaven') ? Math.floor(amount * 1.30) : amount);
    };
  },

  _hookPlayerTakeDamage() {
    const _origTakeDamage = Player.takeDamage.bind(Player);
    Player.takeDamage = function(amount, source) {
      const final = (ArtsSystem.hasArt('diamondBody') && Player.maxHp > 0 && Player.hp / Player.maxHp > 0.80)
        ? Math.floor(amount * 0.80) : amount;
      _origTakeDamage(final, source);
    };
  },

  _hookPlayerDie() {
    const _origDie = Player.die.bind(Player);
    Player.die = function() {
      if (ArtsSystem.hasArt('bloodSlaughter')) {
        ArtsSystem.state.bloodStacks = 0;
        Player.recalculateStats();
      }
      Player._artsDeathCounterActive = false;
      _origDie();
    };
  },

  _hookPlayerUseSkill() {
    const _origUseSkill = Player.useSkill.bind(Player);
    Player.useSkill = function(idx) {
      Player._isBasicAttack = (idx === 0);
      const result = _origUseSkill(idx);
      if (result && ArtsSystem.hasArt('splitMind') && this.skills?.[idx]?.cd > 0) {
        this.skills[idx].cd = Math.floor(this.skills[idx].cd * 0.80);
      }
      Player._isBasicAttack = false;
      return result;
    };
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => SectArtsFeature.init());
} else {
  setTimeout(() => SectArtsFeature.init(), 100);
}
// ===== CHANGES: Xóa console.log; _hookGameRender xóa dead block (if(_origRender){...}) vì chỉ gọi lại chính nó; rút gọn recalculateArtsBonus thành assignment trực tiếp; rút gọn _hookPlayerGainExp/TakeDamage/Die dùng ternary; early-return guard canFound trong renderSectTab; xóa else-branch rỗng trong _hookInventoryUseItem; xóa comment thừa =====
