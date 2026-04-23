// ==================== FEATURE: KNOWLEDGE SYSTEM ====================
// feature_knowledge_system.js — Hệ thống Thông Tin / Thư Tịch
//
// HOOKS VÀO:
//   - Enemies.kill()          (enemies.js)      — theo dõi element hit boss
//   - NPC.interact()          (npc.js)          — đếm tương tác NPC, mở merchant secret
//   - Player.useSkill()       (player.js)       — theo dõi element dùng để học weakness
//   - Enemies.damage()        (enemies.js)      — bonus damage nếu biết weakness
//   - UI.renderCharacter()    (ui.js)           — thêm tab Thư Tịch (hook nếu có, hoặc inject)
//   - DungeonSystem.exit()    (feature_dungeon) — khi chết → unlock shortcut
//   - Game.renderMinimap()    (game.js)         — vẽ shortcut portal
//
// ĐỌC/GHI localStorage:
//   - player_knowledge : { boss_weaknesses, merchant_secrets, dungeon_shortcuts }
//
// DEPEND:
//   - game.js, player.js, enemies.js, npc.js, config.js
//   - feature_combat.js (ElementSystem — đọc element của skill, optional)
//   - feature_dungeon.js (DungeonSystem — optional)
//
// SỰ KIỆN EMIT (qua document):
//   - 'knowledge:learned' { detail: { category, key, value } }
// ===================================================================

const KnowledgeSystem = {

  // ─── Dữ liệu kiến thức ──────────────────────────────────────
  data: {
    boss_weaknesses:  {},   // { bossType: elementType }
    merchant_secrets: {},   // { npcType_mapId: { time, item, price } }
    dungeon_shortcuts:{}    // { dungeonId: { tx, ty } }
  },

  // ─── Tracking internal ──────────────────────────────────────
  _bossElementHits:    {},  // { bossType: Set<element> }
  _npcInteractCount:   {},  // { npcType_mapId: number }
  _currentSkillElement: 'neutral',

  WEAKNESS_BONUS:   0.25,
  NPC_INTERACT_REQ: 10,

  // ─── Học kiến thức ──────────────────────────────────────────
  learn(category, key, value) {
    if (this.data[category][key] !== undefined) return false; // Đã biết rồi
    this.data[category][key] = value;
    this._save();

    const labels = {
      boss_weaknesses:   '🔥 Học được điểm yếu: ' + key,
      merchant_secrets:  '🛒 Bí ẩn thương nhân: ' + key,
      dungeon_shortcuts: '🗺 Lối tắt bí cảnh: ' + key
    };

    UI.addLog(labels[category] || '📖 Kiến thức mới!', 'item');
    UI.showNotification('📖 Thư Tịch Mới!', value.desc || value || key);

    // Emit event để các feature khác có thể phản ứng
    document.dispatchEvent(new CustomEvent('knowledge:learned', {
      detail: { category, key, value }
    }));

    this._refreshUI();
    return true;
  },

  knows(category, key) {
    return this.data[category][key] !== undefined;
  },

  // ─── Boss weakness logic ────────────────────────────────────
  trackElementHit(bossType, element) {
    if (!bossType || element === 'neutral' || !element) return;
    if (!this._bossElementHits[bossType]) {
      this._bossElementHits[bossType] = new Set();
    }
    this._bossElementHits[bossType].add(element);

    // Học weakness sau khi dùng đủ 5 element khác nhau
    const hits = this._bossElementHits[bossType];
    if (hits.size >= 5 && !this.knows('boss_weaknesses', bossType)) {
      // Xác định element gây nhiều damage nhất (ở đây ta dùng element thứ 3 vì ko có log dmg riêng)
      // Thực tế: đọc từ ELEMENT_CONFIG nếu feature_combat.js đã load
      const weakElem = this._detectWeakness(bossType);
      if (weakElem) {
        this.learn('boss_weaknesses', bossType, { element: weakElem, desc: bossType + ' yếu ' + weakElem });
      }
    }
  },

  _detectWeakness(bossType) {
    // Ưu tiên đọc từ ELEMENT_CONFIG của feature_combat nếu có
    if (typeof ELEMENT_CONFIG !== 'undefined' && ELEMENT_CONFIG.enemyElements[bossType]) {
      return ELEMENT_CONFIG.enemyElements[bossType].weakness;
    }
    // Fallback heuristic theo bossId
    const map = {
      boss_colong:    'fire',
      boss_minhvuong: 'thunder',
      boss_viamdе:    'ice',
      boss_banghoang: 'thunder',
      boss_thaicoma:  'thunder',
      boss_tienlong:  'wind'
    };
    return map[bossType] || null;
  },

  // ─── Merchant secrets logic ─────────────────────────────────
  trackNPCInteract(npcType, mapId) {
    const key = npcType + '_' + mapId;
    this._npcInteractCount[key] = (this._npcInteractCount[key] || 0) + 1;

    if (this._npcInteractCount[key] >= this.NPC_INTERACT_REQ &&
        !this.knows('merchant_secrets', key)) {
      // Tạo secret item: item hiếm + time window
      const secretItem = this._rollMerchantSecret(mapId);
      if (secretItem) {
        this.learn('merchant_secrets', key, {
          npcType, mapId,
          item:  secretItem.id,
          price: secretItem.price,
          timeWindow: { startHour: 20, endHour: 22 },
          desc: 'Bí ẩn thương nhân: ' + secretItem.name
        });
      }
    }
  },

  _rollMerchantSecret(mapId) {
    const secretPool = [
      { id: 'celestialOrb',   price: 400, name: 'Thiên Châu bí ẩn'  },
      { id: 'realmPill',      price: 200, name: 'Đột Phá Đan ẩn'    },
      { id: 'dragonScale',    price: 300, name: 'Vảy Rồng bí ẩn'    },
      { id: 'flameSword',     price: 450, name: 'Liệt Hỏa Kiếm ẩn'  },
      { id: 'celestialJade',  price: 600, name: 'Thiên Tiên Ngọc ẩn' }
    ];
    return secretPool[mapId % secretPool.length] || secretPool[0];
  },

  // ─── Dungeon shortcuts ──────────────────────────────────────
  learnShortcut(dungeonId) {
    if (this.knows('dungeon_shortcuts', dungeonId)) return;
    // Tạo tọa độ tắt ngẫu nhiên nhưng consistent
    const hash = dungeonId.split('').reduce((h, c) => h + c.charCodeAt(0), 0);
    const tx = 5 + (hash % 15);
    const ty = 5 + ((hash * 3) % 15);
    this.learn('dungeon_shortcuts', dungeonId, {
      tx, ty, desc: 'Lối tắt bí cảnh ' + dungeonId
    });
  },

  // ─── Áp dụng bonus damage nếu biết weakness ─────────────────
  getWeaknessBonus(enemy, attackElement) {
    // Đọc bossType từ enemy
    const bossId = enemy.isBossEvent
      ? (BossEventSystem && BossEventSystem.bossState && BossEventSystem.bossState.bossId)
      : null;
    const typeKey = bossId || enemy.type;

    if (!this.knows('boss_weaknesses', typeKey)) return 1.0;
    const weakness = this.data.boss_weaknesses[typeKey];
    const weakElem = weakness ? weakness.element : null;
    if (weakElem && weakElem === attackElement) {
      return 1.0 + this.WEAKNESS_BONUS;
    }
    return 1.0;
  },

  // ─── Merchant secret: hiển thị slot ẩn ─────────────────────
  getMerchantSecretSlot(npcType, mapId) {
    const key = npcType + '_' + mapId;
    if (!this.knows('merchant_secrets', key)) return null;
    const secret = this.data.merchant_secrets[key];
    const now = new Date();
    const h = now.getHours();
    const tw = secret.timeWindow;
    if (tw && (h < tw.startHour || h >= tw.endHour)) return null;
    return { id: secret.item, price: secret.price };
  },

  // ─── Render shortcut portal trên minimap ────────────────────
  renderShortcuts(mctx, scale) {
    if (!DungeonSystem || !DungeonSystem.sessionState || !DungeonSystem.sessionState.active) return;
    const dungeonId = 'dungeon_' + Maps.currentIndex;
    if (!this.knows('dungeon_shortcuts', dungeonId)) return;

    const sc = this.data.dungeon_shortcuts[dungeonId];
    const wx = sc.tx * CONFIG.TILE_SIZE + 16;
    const wy = sc.ty * CONFIG.TILE_SIZE + 16;

    const pulse = 0.5 + Math.sin(Date.now() / 300) * 0.5;
    mctx.save();
    mctx.globalAlpha = pulse;
    mctx.fillStyle = '#e040fb';
    mctx.beginPath();
    mctx.arc(wx * scale, wy * scale, 4, 0, Math.PI * 2);
    mctx.fill();
    mctx.globalAlpha = 1;
    mctx.restore();
  },

  // ─── Render shortcut portal in world ────────────────────────
  renderShortcutPortal(ctx) {
    if (!DungeonSystem || !DungeonSystem.sessionState || !DungeonSystem.sessionState.active) return;
    const dungeonId = 'dungeon_' + Maps.currentIndex;
    if (!this.knows('dungeon_shortcuts', dungeonId)) return;

    const sc = this.data.dungeon_shortcuts[dungeonId];
    const wx = sc.tx * CONFIG.TILE_SIZE + 16;
    const wy = sc.ty * CONFIG.TILE_SIZE + 16;
    const sx = wx - GameState.camera.x;
    const sy = wy - GameState.camera.y;

    const pulse = 0.6 + Math.sin(GameState.time/200) * 0.4;
    ctx.save();
    ctx.globalAlpha = pulse * 0.6;
    ctx.fillStyle = '#e040fb';
    ctx.beginPath();
    ctx.arc(sx, sy, 18, 0, Math.PI*2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#fff';
    ctx.font = '14px serif';
    ctx.textAlign = 'center';
    ctx.fillText('✦', sx, sy+5);
    ctx.font = '9px monospace';
    ctx.fillStyle = '#e040fb';
    ctx.fillText('Lối tắt', sx, sy-24);
    ctx.restore();

    // Kiểm tra player đứng gần → exit dungeon ngay
    if (Utils.dist(Player.x, Player.y, wx, wy) < 40) {
      ctx.font = '10px monospace';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.fillText('👆 Lối thoát nhanh', sx, sy-36);
    }
  },

  // ─── Shortcut portal tap ────────────────────────────────────
  handleShortcutTap(wx, wy) {
    if (!DungeonSystem || !DungeonSystem.sessionState || !DungeonSystem.sessionState.active) return false;
    const dungeonId = 'dungeon_' + Maps.currentIndex;
    if (!this.knows('dungeon_shortcuts', dungeonId)) return false;

    const sc = this.data.dungeon_shortcuts[dungeonId];
    const portalX = sc.tx * CONFIG.TILE_SIZE + 16;
    const portalY = sc.ty * CONFIG.TILE_SIZE + 16;

    if (Utils.dist(wx, wy, portalX, portalY) < 50) {
      UI.addLog('✦ Dùng lối tắt bí cảnh!', 'item');
      DungeonSystem.exit(false); // thoát không tính thắng, nhưng cứu mạng
      return true;
    }
    return false;
  },

  // ─── UI Panel Thư Tịch ──────────────────────────────────────
  _buildUIPanel() {
    let panel = document.getElementById('knowledgePanel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'knowledgePanel';
      panel.style.cssText = [
        'position:fixed;top:0;left:0;width:100%;height:100%;',
        'background:rgba(0,0,0,0.82);z-index:130;',
        'display:none;align-items:center;justify-content:center;',
        'padding:16px;box-sizing:border-box;'
      ].join('');
      document.body.appendChild(panel);
    }
    return panel;
  },

  openPanel() {
    const panel = this._buildUIPanel();
    panel.style.display = 'flex';

    const sections = [
      {
        title: '🔥 Điểm Yếu Boss',
        category: 'boss_weaknesses',
        allKeys: this._getAllBossTypes(),
        renderValue: (key, val) => val ? `${val.element}` : '???'
      },
      {
        title: '🛒 Bí Ẩn Thương Nhân',
        category: 'merchant_secrets',
        allKeys: this._getAllMerchantKeys(),
        renderValue: (key, val) => val ? `${ITEMS[val.item]?.name || val.item} (${val.timeWindow?.startHour}-${val.timeWindow?.endHour}h)` : '???'
      },
      {
        title: '🗺 Lối Tắt Bí Cảnh',
        category: 'dungeon_shortcuts',
        allKeys: this._getAllDungeonKeys(),
        renderValue: (key, val) => val ? `Tile (${val.tx},${val.ty})` : '???'
      }
    ];

    let html = `
      <div style="background:linear-gradient(135deg,#1a1a2e,#16213e);border:2px solid #f0c040;
        border-radius:14px;padding:18px;max-width:400px;width:95%;max-height:85vh;
        overflow-y:auto;font-family:'Courier New',monospace;color:#fff;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
          <span style="color:#f0c040;font-size:16px;font-weight:bold">📖 Thư Tịch</span>
          <span onclick="KnowledgeSystem.closePanel()" style="cursor:pointer;color:#888;font-size:18px">✕</span>
        </div>
    `;

    for (const sec of sections) {
      html += `<div style="margin-bottom:14px">
        <div style="color:#f0c040;font-size:12px;font-weight:bold;margin-bottom:6px">${sec.title}</div>
      `;
      const known = Object.keys(this.data[sec.category]).length;
      const total = sec.allKeys.length;
      html += `<div style="color:#888;font-size:9px;margin-bottom:6px">${known}/${total} đã học</div>`;

      for (const key of sec.allKeys) {
        const val = this.data[sec.category][key];
        const display = val ? sec.renderValue(key, val) : '???';
        const color = val ? '#8ef' : '#444';
        const keyLabel = key.replace(/_/g, ' ');
        html += `<div style="display:flex;justify-content:space-between;padding:4px 6px;
          border-bottom:1px solid #ffffff0a;font-size:10px;">
          <span style="color:#aaa">${keyLabel}</span>
          <span style="color:${color}">${display}</span>
        </div>`;
      }
      html += `</div>`;
    }

    html += `</div>`;
    panel.innerHTML = html;
    panel.addEventListener('click', e => {
      if (e.target === panel) this.closePanel();
    });
  },

  closePanel() {
    const panel = document.getElementById('knowledgePanel');
    if (panel) panel.style.display = 'none';
  },

  _getAllBossTypes() {
    const bossTypes = ['wolfKing','demonLord','iceEmperor','celestialDragon',
      'boss_colong','boss_minhvuong','boss_viamdе','boss_banghoang','boss_thaicoma','boss_tienlong'];
    return bossTypes;
  },

  _getAllMerchantKeys() {
    const keys = [];
    for (let i = 0; i < Maps.data.length; i++) {
      keys.push('shop_' + i);
      keys.push('teleporter_' + i);
    }
    return keys;
  },

  _getAllDungeonKeys() {
    return Maps.data.map((_, i) => 'dungeon_' + i);
  },

  _refreshUI() {
    // Nếu panel đang mở thì refresh
    const panel = document.getElementById('knowledgePanel');
    if (panel && panel.style.display !== 'none') {
      this.openPanel();
    }
  },

  // ─── Save/Load ──────────────────────────────────────────────
  _save() {
    try {
      localStorage.setItem('player_knowledge', JSON.stringify(this.data));
    } catch (_) {}
  },

  _load() {
    try {
      const raw = localStorage.getItem('player_knowledge');
      if (!raw) return;
      const d = JSON.parse(raw);
      this.data.boss_weaknesses  = d.boss_weaknesses  || {};
      this.data.merchant_secrets = d.merchant_secrets || {};
      this.data.dungeon_shortcuts= d.dungeon_shortcuts|| {};
    } catch (_) {}
  },

  // ─── Init ───────────────────────────────────────────────────
  init() {
    if (typeof Game === 'undefined' || typeof Player === 'undefined' ||
        typeof Enemies === 'undefined' || typeof NPC === 'undefined') {
      setTimeout(() => this.init(), 300);
      return;
    }

    this._load();
    this._hookEnemiesDamage();
    this._hookEnemiesKill();
    this._hookNPCInteract();
    this._hookPlayerUseSkill();
    this._hookGameRender();
    this._hookHandleTap();
    this._hookSaveLoad();
    this._hookMinimap();
    this._injectMenuButton();

    // Listen for dungeon shortcuts from feature_failure_rewards
    document.addEventListener('knowledge:dungeonDeath', (e) => {
      if (e.detail && e.detail.dungeonId) {
        this.learnShortcut(e.detail.dungeonId);
      }
    });

    console.log('📖 KnowledgeSystem initialized');
  },

  _hookEnemiesDamage() {
    const _orig = Enemies.damage.bind(Enemies);
    const self  = this;

    Enemies.damage = function(enemy, amount, isCrit, color) {
      let finalAmount = amount;
      if (enemy && enemy.alive) {
        const bonusMul = self.getWeaknessBonus(enemy, self._currentSkillElement);
        if (bonusMul > 1.0) {
          finalAmount = Math.floor(amount * bonusMul);
          if (finalAmount !== amount) {
            Game.spawnDamageNumber(enemy.x, enemy.y-enemy.size-20, '📖+25%', '#8ef');
          }
        }
      }
      _orig(enemy, finalAmount, isCrit, color);
    };
  },

  _hookEnemiesKill() {
    const _orig = Enemies.kill.bind(Enemies);
    const self  = this;

    Enemies.kill = function(enemy) {
      _orig(enemy);
      // Sau khi kill boss event, check element hits
      if (enemy && enemy.isBossEvent && BossEventSystem) {
        const bossId = BossEventSystem.bossState && BossEventSystem.bossState.bossId;
        if (bossId && self._currentSkillElement !== 'neutral') {
          self.trackElementHit(bossId, self._currentSkillElement);
        }
      }
    };
  },

  _hookNPCInteract() {
    const _orig = NPC.interact.bind(NPC);
    const self  = this;

    NPC.interact = function(npc) {
      _orig(npc);
      if (npc) {
        const key = npc.type + '_' + Maps.currentIndex;
        self.trackNPCInteract(npc.type, Maps.currentIndex);

        // Nếu đã biết secret → inject secret slot vào shop
        const secret = self.getMerchantSecretSlot(npc.type, Maps.currentIndex);
        if (secret && npc.service === 'shop') {
          setTimeout(() => {
            const optionsEl = document.getElementById('npcOptions');
            if (!optionsEl) return;
            const secretDiv = document.createElement('div');
            secretDiv.style.cssText = 'border:1px solid #e040fb;border-radius:6px;padding:6px;margin-bottom:6px;background:rgba(224,64,251,0.1);';
            const itemData = ITEMS[secret.id];
            const canBuy = Player.gold >= secret.price;
            secretDiv.innerHTML = `<div style="color:#e040fb;font-size:9px;margin-bottom:4px">📖 Hàng Bí Ẩn</div>
              <div style="display:flex;justify-content:space-between;font-size:11px">
                <span>${itemData ? itemData.name : secret.id}</span>
                <span style="color:#f0c040">${secret.price} 💰</span>
              </div>`;
            if (canBuy) {
              secretDiv.style.cursor = 'pointer';
              secretDiv.addEventListener('click', () => {
                NPC.buyItem(secret.id, secret.price);
              });
            } else {
              secretDiv.style.opacity = '0.5';
            }
            optionsEl.insertBefore(secretDiv, optionsEl.firstChild);
          }, 50);
        }
      }
    };
  },

  _hookPlayerUseSkill() {
    const _orig = Player.useSkill.bind(Player);
    const self  = this;

    Player.useSkill = function(idx) {
      // Đọc element từ feature_combat nếu có
      if (typeof ElementSystem !== 'undefined') {
        self._currentSkillElement = ElementSystem.getAttackElement(idx);
      } else {
        self._currentSkillElement = 'neutral';
      }
      // Track element hit boss nếu đang có boss event
      if (BossEventSystem && BossEventSystem.bossState && BossEventSystem.bossState.active) {
        const bossId = BossEventSystem.bossState.bossId;
        if (bossId) self.trackElementHit(bossId, self._currentSkillElement);
      }
      return _orig(idx);
    };
  },

  _hookGameRender() {
    const _origRenderObjects = Game.renderObjects.bind(Game);
    const self = this;
    Game.renderObjects = function() {
      _origRenderObjects();
      self.renderShortcutPortal(this.ctx);
    };
  },

  _hookHandleTap() {
    const _orig = Game.handleTap.bind(Game);
    const self  = this;
    Game.handleTap = function(sx, sy) {
      const wx = sx + GameState.camera.x;
      const wy = sy + GameState.camera.y;
      if (self.handleShortcutTap(wx, wy)) return;
      _orig(sx, sy);
    };
  },

  _hookSaveLoad() {
    const _origSave = Game.save.bind(Game);
    const _origLoad = Game.load.bind(Game);
    const self = this;
    Game.save = function() { _origSave(); self._save(); };
    Game.load = function() { const r = _origLoad(); self._load(); return r; };
  },

  _hookMinimap() {
    const _orig = Game.renderMinimap.bind(Game);
    const self  = this;
    Game.renderMinimap = function() {
      _orig();
      const mc = document.getElementById('minimapCanvas');
      if (!mc) return;
      const mctx = mc.getContext('2d');
      const scale = mc.width / (CONFIG.WORLD_WIDTH * CONFIG.TILE_SIZE);
      self.renderShortcuts(mctx, scale);
    };
  },

  _injectMenuButton() {
    // Thêm nút Thư Tịch vào menu hoặc character panel
    setTimeout(() => {
      const menuBar = document.getElementById('menuBar');
      if (menuBar && !document.getElementById('knowledgeMenuBtn')) {
        const btn = document.createElement('div');
        btn.id = 'knowledgeMenuBtn';
        btn.className = 'menu-btn';
        btn.onclick = () => KnowledgeSystem.openPanel();
        btn.innerHTML = '<span style="font-size:18px">📖</span><span>Thư Tịch</span>';
        menuBar.appendChild(btn);
      }
    }, 1000);
  }
};

(function() {
  function tryInit() {
    if (typeof Game !== 'undefined' && typeof Player !== 'undefined' &&
        typeof Enemies !== 'undefined' && typeof NPC !== 'undefined') {
      KnowledgeSystem.init();
    } else {
      setTimeout(tryInit, 300);
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(tryInit, 500));
  } else {
    setTimeout(tryInit, 500);
  }
})();

console.log('📖 feature_knowledge_system.js loaded');
