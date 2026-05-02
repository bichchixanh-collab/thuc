// ===== FILE: feature_trade_caravan.js =====
// ==================== FEATURE: THƯƠNG ĐOÀN / LỮ HÀNH ====================
// Load sau game.js
// Xuất hiện theo giờ thực: 8h, 12h, 18h, 22h
// Vị trí cố định mỗi map, items rotation + giá dao động

const CaravanSystem = {
  // ==================== CONFIG ====================
  scheduleHours: [8, 12, 18, 22],
  durationMinutes: 60,

  itemPools: {
    common:    ['hpPotion', 'mpPotion', 'wolfFang', 'wolfPelt'],
    rare:      ['hpPotionMedium', 'mpPotionMedium', 'expPotion', 'realmPill', 'spiritStone', 'demonCore', 'steelSword', 'ironArmor', 'spiritRobe', 'silverRing'],
    epic:      ['flameSword', 'frostSword', 'dragonArmor', 'dragonAmulet', 'dragonScale', 'celestialOrb'],
    legendary: ['celestialSword', 'celestialRobe', 'celestialJade']
  },

  // Caravan positions per map (fixed spots)
  positions: [
    { x: 700, y: 350 },
    { x: 600, y: 700 },
    { x: 800, y: 500 },
    { x: 500, y: 800 },
    { x: 750, y: 600 },
    { x: 650, y: 400 },
  ],

  priceVariance: 0.20,

  // State
  active: false,
  sessionId: null,
  currentItems: [],
  nextSessionTime: null,
  sessionEndTime: null,
  npcRef: null,

  // ==================== INIT ====================
  init() {
    this._injectStyle();
    this._injectHTML();
    this._loadSave();
    this._scheduleNext();
    this._checkCurrentSession();
    console.log('🛒 CaravanSystem initialized');
  },

  // ==================== SCHEDULING ====================
  _scheduleNext() {
    const now  = new Date();
    const nowH = now.getHours();
    const nowM = now.getMinutes();

    let next = null;
    for (const h of this.scheduleHours) {
      if (h > nowH || (h === nowH && nowM < 1)) {
        next = new Date(now);
        next.setHours(h, 0, 0, 0);
        break;
      }
    }
    if (!next) {
      // Next is tomorrow's first slot
      next = new Date(now);
      next.setDate(now.getDate() + 1);
      next.setHours(this.scheduleHours[0], 0, 0, 0);
    }
    this.nextSessionTime = next.getTime();
  },

  _checkCurrentSession() {
    const now     = Date.now();
    const nowDate = new Date();

    for (const sh of this.scheduleHours) {
      const start = new Date(nowDate); start.setHours(sh, 0,                    0, 0);
      const end   = new Date(nowDate); end.setHours(sh,   this.durationMinutes, 0, 0);
      if (now >= start.getTime() && now < end.getTime()) {
        const sid = `${nowDate.toDateString()}_${sh}`;
        if (this.sessionId !== sid) this._startSession(sid, end.getTime());
        return;
      }
    }
  },

  _startSession(sid, endTime) {
    this.sessionId      = sid;
    this.sessionEndTime = endTime;
    this.active         = true;
    this.currentItems   = this._generateItems();
    this._spawnNPC();
    UI.addLog?.('🛒 Thương Đoàn đã đến! Ghé thăm để mua vật phẩm hiếm!', 'system');
    UI.showNotification?.('🛒 THƯƠNG ĐOÀN ĐẾN!', 'Vị trí đã đánh dấu trên minimap');
    this._updateBadge();
    this._save();
  },

  _endSession() {
    this.active = false;
    this._despawnNPC();
    this._scheduleNext();
    UI.addLog?.('🛒 Thương Đoàn đã rời đi!', 'system');
    this._updateBadge();
    this._save();
  },

  _generateItems() {
    const mapLvl = Maps.data[Maps.currentIndex].lvl || 1;

    const picks = [
      ...this._pickFromPool('common',    3),
      ...this._pickFromPool('rare',      mapLvl >= 10 ? 4 : 2),
      ...this._pickFromPool('epic',      mapLvl >= 25 ? 2 : (mapLvl >= 10 ? 1 : 0)),
      ...this._pickFromPool('legendary', mapLvl >= 60 ? 1 : 0),
    ];

    const items = [];
    for (const id of picks) {
      const itemData = ITEMS[id];
      if (!itemData) continue;
      const base     = (itemData.sellPrice || 50) * 3;
      const variance = 1 + (Math.random() - 0.5) * 2 * this.priceVariance;
      items.push({
        id,
        basePrice: base,
        price: Math.floor(base * variance),
        stock: 1 + Math.floor(Math.random() * 3)
      });
    }
    return items;
  },

  _pickFromPool(tier, count) {
    if (count <= 0) return [];
    return [...(this.itemPools[tier] || [])].sort(() => Math.random() - 0.5).slice(0, count);
  },

  // ==================== NPC SPAWN ====================
  _spawnNPC() {
    const pos = this.positions[Maps.currentIndex] || { x: 600, y: 400 };
    const npc = {
      type: 'caravan',
      name: '🛒 Thương Đoàn',
      title: 'Lữ Hành Thương Nhân',
      x: pos.x, y: pos.y,
      sprite: 'npcShop',
      dialog: 'Hoan nghênh! Ta có hàng hiếm chỉ bán hôm nay thôi!',
      service: 'caravan',
      interactRange: 90,
      canInteract: false,
      isCaravan: true
    };
    NPC.list.push(npc);
    this.npcRef = npc;
  },

  _despawnNPC() {
    if (this.npcRef) {
      NPC.list = NPC.list.filter(n => n !== this.npcRef);
      this.npcRef = null;
    }
  },

  // ==================== BUY ====================
  buyItem(idx) {
    const slot = this.currentItems[idx];
    if (!slot || slot.stock <= 0) { UI.addLog('❌ Hết hàng!', 'system'); return false; }
    if (Player.gold < slot.price)  { UI.addLog(`❌ Không đủ vàng! Cần ${slot.price} 💰`, 'system'); return false; }
    if (!Inventory.add(slot.id, 1)){ UI.addLog('❌ Túi đồ đầy!', 'system'); return false; }

    Player.gold -= slot.price;
    slot.stock--;
    UI.updateGold();
    UI.addLog(`🛒 Mua ${ITEMS[slot.id]?.name}! -${slot.price} 💰`, 'gold');
    this._renderShopUI();
    this._save();
    return true;
  },

  // ==================== UPDATE ====================
  update(dt) {
    const now = Date.now();

    if (this.active && now >= this.sessionEndTime) {
      this._endSession();
      return;
    }

    if (!this.active && this.nextSessionTime && now >= this.nextSessionTime) {
      this._checkCurrentSession();
    }

    if (this.npcRef) {
      this.npcRef.canInteract = Utils.dist(Player.x, Player.y, this.npcRef.x, this.npcRef.y) <= this.npcRef.interactRange;
    }
  },

  // ==================== UI ====================
  openShop() {
    if (!this.active) { UI.addLog('❌ Thương Đoàn chưa xuất hiện!', 'system'); return; }
    document.getElementById('caravanPanel').classList.add('show');
    this._renderShopUI();
  },

  closeShop() {
    document.getElementById('caravanPanel').classList.remove('show');
  },

  _renderShopUI() {
    const now       = Date.now();
    const remaining = Math.max(0, Math.ceil((this.sessionEndTime - now) / 60000));

    document.getElementById('caravanTimer').textContent = `⏰ Còn ${remaining} phút`;

    const list = document.getElementById('caravanItems');
    list.innerHTML = '';

    if (!this.active || this.currentItems.length === 0) {
      list.innerHTML = '<div style="text-align:center;color:#666;padding:20px">Thương Đoàn chưa xuất hiện</div>';
      return;
    }

    const rarityColors = { common: '#ccc', rare: '#a855f7', epic: '#f97316', legendary: '#f0c040' };

    for (let i = 0; i < this.currentItems.length; i++) {
      const slot     = this.currentItems[i];
      const itemData = ITEMS[slot.id];
      if (!itemData) continue;

      const color  = rarityColors[itemData.rarity] || '#ccc';
      const canBuy = Player.gold >= slot.price && slot.stock > 0;

      const statText = itemData.stats ? Object.entries(itemData.stats).map(([k, v]) =>
        `+${typeof v === 'number' && v < 1 ? (v * 100).toFixed(0) + '%' : v} ${k.toUpperCase()}`
      ).join(' ') : '';

      const div = document.createElement('div');
      div.style.cssText = `
        background:rgba(255,255,255,0.03);border:1px solid ${color}44;
        border-radius:8px;padding:10px;margin-bottom:8px;
        display:flex;justify-content:space-between;align-items:center;
        ${slot.stock === 0 ? 'opacity:0.4' : ''}
      `;
      div.innerHTML = `
        <div style="flex:1">
          <div style="color:${color};font-size:12px;font-weight:bold">${itemData.name}</div>
          <div style="color:#888;font-size:9px">${itemData.desc}</div>
          ${statText ? `<div style="color:#8f8;font-size:9px">${statText}</div>` : ''}
          <div style="color:#888;font-size:9px">Còn lại: ${slot.stock}</div>
        </div>
        <div style="text-align:right;min-width:80px">
          <div style="color:#f0c040;font-size:12px;font-weight:bold">${Utils.formatNumber(slot.price)} 💰</div>
          <button onclick="CaravanSystem.buyItem(${i})" style="margin-top:4px;padding:5px 10px;background:rgba(240,192,64,${canBuy ? '0.2' : '0.05'});border:1px solid ${canBuy ? '#f0c040' : '#555'};border-radius:5px;color:${canBuy ? '#f0c040' : '#555'};font-size:9px;cursor:${canBuy ? 'pointer' : 'not-allowed'};font-family:inherit" ${!canBuy ? 'disabled' : ''}>
            ${slot.stock === 0 ? 'Hết hàng' : 'Mua'}
          </button>
        </div>
      `;
      list.appendChild(div);
    }
  },

  _updateBadge() {
    const badge = document.getElementById('caravanBadge');
    if (!badge) return;
    if (this.active) {
      const remaining = Math.max(0, Math.ceil((this.sessionEndTime - Date.now()) / 60000));
      badge.textContent   = `🛒 ${remaining}p`;
      badge.style.display = 'block';
    } else {
      badge.style.display = 'none';
    }
  },

  renderMinimapMarker(mctx, scale) {
    if (!this.active || !this.npcRef) return;
    const pulse = (Math.sin(Date.now() / 500) + 1) / 2;
    mctx.fillStyle = `rgba(255,215,0,${0.7 + pulse * 0.3})`;
    mctx.beginPath();
    mctx.arc(this.npcRef.x * scale, this.npcRef.y * scale, 5, 0, Math.PI * 2);
    mctx.fill();
    mctx.fillStyle  = '#fff';
    mctx.font       = '8px monospace';
    mctx.textAlign  = 'center';
    mctx.fillText('🛒', this.npcRef.x * scale, this.npcRef.y * scale + 3);
  },

  // ==================== INJECT STYLE + HTML ====================
  _injectStyle() {
    if (document.getElementById('caravanStyle')) return;
    const s = document.createElement('style');
    s.id = 'caravanStyle';
    s.textContent = `
      #caravanBadge {
        position:absolute;top:80px;right:10px;z-index:25;
        background:rgba(255,215,0,0.9);color:#1a1a2e;
        font-size:10px;font-weight:bold;padding:4px 10px;
        border-radius:12px;cursor:pointer;display:none;
        border:1px solid #ffd700;animation:caravanGlow 2s infinite;
      }
      @keyframes caravanGlow {
        0%,100%{box-shadow:0 0 6px rgba(255,215,0,0.5)}
        50%{box-shadow:0 0 16px rgba(255,215,0,0.9)}
      }
      #caravanPanel {
        position:absolute;top:0;left:0;width:100%;height:100%;
        background:rgba(0,0,0,0.8);z-index:100;
        display:none;align-items:center;justify-content:center;
        backdrop-filter:blur(2px);
      }
      #caravanPanel.show{display:flex;}
      #caravanInner {
        background:linear-gradient(135deg,#1a1a2e,#1a1400);
        border:3px solid #ffd700;border-radius:15px;
        padding:18px;width:92%;max-width:400px;max-height:85vh;overflow-y:auto;
        box-shadow:0 0 40px rgba(255,215,0,0.2);
      }
      #caravanInner::-webkit-scrollbar{width:4px}
      #caravanInner::-webkit-scrollbar-thumb{background:#ffd700;border-radius:2px}
    `;
    document.head.appendChild(s);
  },

  _injectHTML() {
    const badge = document.createElement('div');
    badge.id      = 'caravanBadge';
    badge.onclick = () => this.openShop();
    document.body.appendChild(badge);

    const panel = document.createElement('div');
    panel.id = 'caravanPanel';
    panel.innerHTML = `
      <div id="caravanInner">
        <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #ffd70044;padding-bottom:10px;margin-bottom:12px">
          <div>
            <div style="color:#ffd700;font-size:18px;font-weight:bold">🛒 Thương Đoàn</div>
            <div id="caravanTimer" style="color:#888;font-size:10px"></div>
          </div>
          <div onclick="CaravanSystem.closeShop()" style="width:30px;height:30px;background:rgba(255,0,0,0.2);border:2px solid #f44;border-radius:50%;color:#f44;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center">✕</div>
        </div>
        <div style="color:#888;font-size:9px;margin-bottom:10px;text-align:center">
          📅 Xuất hiện: 8h · 12h · 18h · 22h hàng ngày · Mỗi lần 60 phút
        </div>
        <div id="caravanItems"></div>
      </div>
    `;
    panel.addEventListener('click', e => { if (e.target.id === 'caravanPanel') this.closeShop(); });
    document.body.appendChild(panel);
  },

  // ==================== SAVE / LOAD ====================
  getSaveData() {
    return {
      sessionId:       this.sessionId,
      active:          this.active,
      sessionEndTime:  this.sessionEndTime,
      currentItems:    this.currentItems,
      nextSessionTime: this.nextSessionTime
    };
  },

  _save() {
    try { localStorage.setItem('tuxien_caravan', JSON.stringify(this.getSaveData())); } catch (e) {}
  },

  _loadSave() {
    try {
      const raw = localStorage.getItem('tuxien_caravan');
      if (!raw) return;
      const data           = JSON.parse(raw);
      this.sessionId       = data.sessionId;
      this.sessionEndTime  = data.sessionEndTime;
      this.currentItems    = data.currentItems    || [];
      this.nextSessionTime = data.nextSessionTime;
    } catch (e) {}
  }
};

// ==================== WRAP GAME ====================
(function () {
  const _origInit = Game.init.bind(Game);
  Game.init = function () { _origInit(); CaravanSystem.init(); };

  const _origUpdate = Game.update.bind(Game);
  Game.update = function (dt) {
    _origUpdate(dt);
    CaravanSystem.update(dt);
    if (GameState.time % 30000 < dt) CaravanSystem._updateBadge();
  };

  const _origSave = Game.save.bind(Game);
  Game.save = function () { _origSave(); CaravanSystem._save(); };

  const _origInteract = NPC.interact.bind(NPC);
  NPC.interact = function (npc) {
    if (npc.isCaravan) { CaravanSystem.openShop(); return; }
    _origInteract(npc);
  };

  const _origMinimap = Game.renderMinimap.bind(Game);
  Game.renderMinimap = function () {
    _origMinimap();
    const mc = document.getElementById('minimapCanvas');
    if (!mc) return;
    const mctx  = mc.getContext('2d');
    const scale = mc.width / (CONFIG.WORLD_WIDTH * CONFIG.TILE_SIZE);
    CaravanSystem.renderMinimapMarker(mctx, scale);
  };

  const _origTravel = Maps.travelTo.bind(Maps);
  Maps.travelTo = function (idx) {
    const result = _origTravel(idx);
    if (result) {
      CaravanSystem._despawnNPC();
      if (CaravanSystem.active) CaravanSystem._spawnNPC();
    }
    return result;
  };
})();

console.log('🛒 feature_trade_caravan.js loaded');
// ===== CHANGES: Rút gọn _pickFromPool (guard count<=0 ở đầu); gom canInteract vào 1 dòng; gom bonus/bonusEl logic trong _renderShopUI =====
