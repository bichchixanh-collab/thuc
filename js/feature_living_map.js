// ==================== FEATURE: LIVING MAP ====================
// feature_living_map.js — Bản đồ mòn và xây dựng
//
// HOOKS VÀO:
//   - Player.update()         (player.js) — mỗi frame track tile player đứng
//   - Game.renderTiles()      (game.js)   — vẽ wear overlay lên tile
//   - Game.renderMinimap()    (game.js)   — không hook (optional)
//   - Maps.travelTo()         (maps.js)   — save/load wear khi đổi map
//   - Maps.generate()         (maps.js)   — khởi tạo wear cho map mới
//   - Game.save() / load()    (game.js)   — persist wear data
//   - Game.handleTap()        (game.js)   — mở build menu khi tap tile
//
// ĐỌC/GHI localStorage:
//   - map_wear_{mapId}  : { "x_y": wearValue, structures: { "x_y": structureObj } }
//
// DEPEND:
//   - maps.js (Maps, CONFIG), player.js (Player), game.js (Game, GameState)
//   - config.js (TILE_SIZE, WORLD_WIDTH, WORLD_HEIGHT), ui.js (UI)
//
// KHÔNG: tạo tile system mới — extend vào Maps.tiles array có sẵn
// =============================================================

const LivingMapSystem = {

  // ─── Wear data per map ─────────────────────────────────────
  wearData: {},      // { "mapId": { "x_y": number } }
  structures: {},    // { "mapId": { "x_y": structureObj } }

  WEAR_THRESHOLDS: { reduce_spawn: 30, no_respawn: 60, barren: 90 },
  WEAR_PER_STEP:  1,
  WEAR_DECAY_MS:  10 * 60 * 1000, // 10 phút real time
  STEP_INTERVAL:  400,  // ms — ghi wear mỗi 400ms để tránh spam

  STRUCTURE_TYPES: {
    rest_stop: {
      name: 'Trạm Dừng',
      icon: '🏕',
      desc: 'Hồi 10% HP khi đứng trên đó',
      color: '#4caf50',
      buildMinWear: 60,
      onStand(player) {
        if (player.hp < player.maxHp) {
          const heal = Math.floor(player.maxHp * 0.10);
          const actual = Math.min(heal, player.maxHp - player.hp);
          if (actual > 0) {
            player.hp += actual;
            Game.spawnDamageNumber(player.x, player.y-30, '+'+actual, '#4caf50');
          }
        }
      }
    },
    trap: {
      name: 'Bẫy',
      icon: '⚙️',
      desc: 'Quái đi qua mất 20% HP. Kích hoạt 3 lần',
      color: '#f44336',
      buildMinWear: 60,
      charges: 3,
      onEnemyStep(enemy, structObj) {
        if (structObj._charges <= 0) return false;
        const dmg = Math.floor(enemy.maxHp * 0.20);
        Enemies.damage(enemy, dmg, false, '#f44336');
        Game.spawnDamageNumber(enemy.x, enemy.y-30, '🪤 '+dmg, '#f44336');
        structObj._charges--;
        if (structObj._charges <= 0) {
          UI.addLog('⚙️ Bẫy đã hỏng!', 'system');
          return true; // signal to remove
        }
        return false;
      }
    },
    sign: {
      name: 'Biển Chỉ Đường',
      icon: '🪧',
      desc: 'Hiển thị text cho người chơi khác',
      color: '#ff9800',
      buildMinWear: 60
    }
  },

  // ─── Tracking state ────────────────────────────────────────
  _stepTimer:      0,
  _decayTimer:     0,
  _buildMenuOpen:  false,
  _buildTargetTile: null, // { tx, ty }

  // ─── Lấy wear key cho tile ──────────────────────────────────
  _key(tx, ty) { return tx + '_' + ty; },

  // ─── Lấy wear value cho tile ─────────────────────────────────
  getWear(mapId, tx, ty) {
    const d = this.wearData[mapId];
    return d ? (d[this._key(tx, ty)] || 0) : 0;
  },

  // ─── Thêm wear cho tile ────────────────────────────────────
  addWear(mapId, tx, ty, amount) {
    if (!this.wearData[mapId]) this.wearData[mapId] = {};
    const k = this._key(tx, ty);
    const cur = this.wearData[mapId][k] || 0;
    this.wearData[mapId][k] = Math.min(100, cur + amount);
  },

  // ─── Decay wear tự nhiên ────────────────────────────────────
  decayAllMaps(currentMapId) {
    for (const mapId in this.wearData) {
      if (mapId === currentMapId) continue; // Chỉ decay map player KHÔNG ở
      const d = this.wearData[mapId];
      for (const key in d) {
        d[key] = Math.max(0, d[key] - 1);
        if (d[key] === 0) delete d[key];
      }
    }
  },

  // ─── Lấy structure trên tile ────────────────────────────────
  getStructure(mapId, tx, ty) {
    const m = this.structures[mapId];
    return m ? m[this._key(tx, ty)] : null;
  },

  // ─── Đặt structure ────────────────────────────────────────
  placeStructure(mapId, tx, ty, typeKey, text) {
    if (!this.structures[mapId]) this.structures[mapId] = {};
    const k = this._key(tx, ty);
    const typeDef = this.STRUCTURE_TYPES[typeKey];
    const obj = {
      type: typeKey,
      name: typeDef.name,
      icon: typeDef.icon,
      color: typeDef.color,
      _charges: typeDef.charges || Infinity,
      text: text || '',
      tx, ty
    };
    this.structures[mapId][k] = obj;
    this._saveMap(mapId);
    UI.addLog('🏗 Đặt ' + typeDef.name + ' tại (' + tx + ',' + ty + ')', 'item');
  },

  // ─── Xóa structure ─────────────────────────────────────────
  removeStructure(mapId, tx, ty) {
    const m = this.structures[mapId];
    if (m) delete m[this._key(tx, ty)];
  },

  // ─── Update mỗi frame ───────────────────────────────────────
  update(dt) {
    const mapId = Maps.getCurrent().id;

    // Track player step
    this._stepTimer -= dt;
    if (this._stepTimer <= 0) {
      this._stepTimer = this.STEP_INTERVAL;
      const tx = Math.floor(Player.x / CONFIG.TILE_SIZE);
      const ty = Math.floor(Player.y / CONFIG.TILE_SIZE);
      this.addWear(mapId, tx, ty, this.WEAR_PER_STEP);

      // Check structure dưới player
      const struct = this.getStructure(mapId, tx, ty);
      if (struct && struct.type === 'rest_stop') {
        this.STRUCTURE_TYPES.rest_stop.onStand(Player);
      }
    }

    // Decay khi offline (approximate: thực hiện mỗi 60 giây real time)
    this._decayTimer -= dt;
    if (this._decayTimer <= 0) {
      this._decayTimer = 60000;
      this.decayAllMaps(mapId);
    }

    // Check trap cho enemy
    this._checkTrapCollisions(mapId);
  },

  // ─── Check enemy đi qua trap ───────────────────────────────
  _checkTrapCollisions(mapId) {
    const m = this.structures[mapId];
    if (!m) return;
    for (const key in m) {
      const struct = m[key];
      if (struct.type !== 'trap' || struct._charges <= 0) continue;
      const wx = struct.tx * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE/2;
      const wy = struct.ty * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE/2;
      for (const enemy of Enemies.list) {
        if (!enemy.alive) continue;
        if (Utils.dist(enemy.x, enemy.y, wx, wy) < CONFIG.TILE_SIZE * 0.8) {
          const shouldRemove = this.STRUCTURE_TYPES.trap.onEnemyStep(enemy, struct);
          if (shouldRemove) {
            delete m[key];
            this._saveMap(mapId);
          }
          break; // một lần mỗi trap per frame
        }
      }
    }
  },

  // ─── Render wear overlay (gọi từ hook renderTiles) ──────────
  renderWearOverlay(ctx) {
    const mapId = Maps.getCurrent().id;
    const wearMap = this.wearData[mapId];
    if (!wearMap) return;

    const cam = GameState.camera;
    const startX = Math.max(0, Math.floor(cam.x / CONFIG.TILE_SIZE));
    const startY = Math.max(0, Math.floor(cam.y / CONFIG.TILE_SIZE));
    const endX   = Math.min(CONFIG.WORLD_WIDTH,  Math.ceil((cam.x + Game.canvas.width)  / CONFIG.TILE_SIZE) + 1);
    const endY   = Math.min(CONFIG.WORLD_HEIGHT, Math.ceil((cam.y + Game.canvas.height) / CONFIG.TILE_SIZE) + 1);

    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const wear = wearMap[this._key(x, y)] || 0;
        if (wear < this.WEAR_THRESHOLDS.reduce_spawn) continue;

        const sx = x * CONFIG.TILE_SIZE - cam.x;
        const sy = y * CONFIG.TILE_SIZE - cam.y;

        let alpha = 0;
        let color = '#6d4c41';
        if (wear >= this.WEAR_THRESHOLDS.barren) {
          alpha = 0.45; color = '#795548';
        } else if (wear >= this.WEAR_THRESHOLDS.no_respawn) {
          alpha = 0.25; color = '#8d6e63';
        } else {
          alpha = 0.12; color = '#a1887f';
        }

        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        ctx.fillRect(sx, sy, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
        ctx.globalAlpha = 1;
      }
    }
  },

  // ─── Render structures ──────────────────────────────────────
  renderStructures(ctx) {
    const mapId = Maps.getCurrent().id;
    const m = this.structures[mapId];
    if (!m) return;

    const cam = GameState.camera;
    for (const key in m) {
      const struct = m[key];
      const sx = struct.tx * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE/2 - cam.x;
      const sy = struct.ty * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE/2 - cam.y;

      // Out of view check
      if (sx < -32 || sx > Game.canvas.width + 32) continue;
      if (sy < -32 || sy > Game.canvas.height + 32) continue;

      // Icon
      ctx.font = '18px serif';
      ctx.textAlign = 'center';
      ctx.fillText(struct.icon, sx, sy + 6);

      // Name tag
      ctx.font = '9px monospace';
      ctx.fillStyle = struct.color;
      ctx.fillText(struct.name, sx, sy - 12);

      // Sign text
      if (struct.type === 'sign' && struct.text) {
        ctx.font = '8px monospace';
        ctx.fillStyle = '#ffe';
        ctx.fillText('"' + struct.text.substring(0, 20) + '"', sx, sy + 22);
      }

      // Trap charges
      if (struct.type === 'trap' && struct._charges < Infinity) {
        ctx.font = '8px monospace';
        ctx.fillStyle = '#f88';
        ctx.fillText('x' + struct._charges, sx + 10, sy - 10);
      }
    }
  },

  // ─── Mở build menu khi tap tile đủ wear ─────────────────────
  openBuildMenu(tx, ty) {
    const mapId = Maps.getCurrent().id;
    const wear = this.getWear(mapId, tx, ty);

    if (wear < this.WEAR_THRESHOLDS.no_respawn) {
      UI.addLog('⛏ Mòn chưa đủ để xây (' + wear + '/60)', 'system');
      return;
    }

    const existing = this.getStructure(mapId, tx, ty);
    if (existing) {
      UI.addLog('🏗 Đã có công trình: ' + existing.name + '. Gỡ bỏ trước.', 'system');
      return;
    }

    this._buildTargetTile = { tx, ty };
    this._showBuildPanel(tx, ty, wear);
  },

  // ─── Hiển thị build panel (DOM) ─────────────────────────────
  _showBuildPanel(tx, ty, wear) {
    let panel = document.getElementById('livingMapBuildPanel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'livingMapBuildPanel';
      panel.style.cssText = [
        'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);',
        'background:linear-gradient(135deg,#1a1a2e,#16213e);',
        'border:2px solid #f0c040;border-radius:12px;',
        'padding:16px;min-width:260px;z-index:120;',
        'font-family:"Courier New",monospace;color:#fff;',
        'text-align:center;'
      ].join('');
      document.body.appendChild(panel);
    }

    const self = this;
    panel.innerHTML = `
      <div style="color:#f0c040;font-weight:bold;font-size:14px;margin-bottom:8px">
        🏗 Xây Dựng — Tile (${tx},${ty})
      </div>
      <div style="color:#888;font-size:10px;margin-bottom:12px">Mòn: ${wear}/100</div>
    `;

    for (const typeKey in this.STRUCTURE_TYPES) {
      const typeDef = this.STRUCTURE_TYPES[typeKey];
      const btn = document.createElement('div');
      btn.style.cssText = [
        'background:rgba(255,255,255,0.07);border:1px solid #444;',
        'border-radius:8px;padding:8px 12px;margin-bottom:8px;cursor:pointer;',
        'text-align:left;'
      ].join('');

      let extra = '';
      if (typeKey === 'sign') {
        extra = `<br><input id="signTextInput" placeholder="Nhập text..." style="margin-top:6px;width:100%;background:#111;color:#fff;border:1px solid #555;border-radius:4px;padding:4px;font-size:11px;font-family:inherit;">`;
      }

      btn.innerHTML = `
        <span style="font-size:16px">${typeDef.icon}</span>
        <span style="color:#f0c040;font-weight:bold;margin-left:6px">${typeDef.name}</span>
        <div style="color:#888;font-size:9px;margin-top:2px">${typeDef.desc}</div>
        ${extra}
      `;

      btn.addEventListener('click', () => {
        let text = '';
        if (typeKey === 'sign') {
          const inp = document.getElementById('signTextInput');
          text = inp ? inp.value.trim() : '';
          if (!text) { UI.addLog('⚠️ Nhập text cho biển!', 'system'); return; }
        }
        self.placeStructure(Maps.getCurrent().id, tx, ty, typeKey, text);
        panel.style.display = 'none';
        // Lưu ghost text vào shared localStorage cho feature_ghost_pvp awareness
        if (typeKey === 'sign') {
          try {
            const signs = JSON.parse(localStorage.getItem('tuxien_map_signs') || '[]');
            signs.push({ mapId: Maps.getCurrent().id, tx, ty, text, ts: Date.now() });
            if (signs.length > 50) signs.shift();
            localStorage.setItem('tuxien_map_signs', JSON.stringify(signs));
          } catch (_) {}
        }
      });

      panel.appendChild(btn);
    }

    const closeBtn = document.createElement('div');
    closeBtn.style.cssText = 'cursor:pointer;color:#888;font-size:11px;margin-top:6px';
    closeBtn.textContent = '✕ Đóng';
    closeBtn.addEventListener('click', () => { panel.style.display = 'none'; });
    panel.appendChild(closeBtn);

    panel.style.display = 'block';
  },

  // ─── Save/Load ──────────────────────────────────────────────
  _saveMap(mapId) {
    try {
      const payload = {
        wear:       this.wearData[mapId]   || {},
        structures: this.structures[mapId] || {}
      };
      localStorage.setItem('map_wear_' + mapId, JSON.stringify(payload));
    } catch (_) {}
  },

  _loadMap(mapId) {
    try {
      const raw = localStorage.getItem('map_wear_' + mapId);
      if (!raw) return;
      const data = JSON.parse(raw);
      this.wearData[mapId]   = data.wear       || {};
      this.structures[mapId] = data.structures || {};
    } catch (_) {}
  },

  saveAll() {
    for (const mapId in this.wearData) this._saveMap(mapId);
  },

  loadAll() {
    if (typeof Maps === 'undefined') return;
    for (const mapDef of Maps.data) {
      this._loadMap(mapDef.id);
    }
  },

  // ─── Init ───────────────────────────────────────────────────
  init() {
    if (typeof Game === 'undefined' || typeof Maps === 'undefined' || typeof Player === 'undefined') {
      setTimeout(() => this.init(), 300);
      return;
    }

    this.loadAll();
    this._hookGameUpdate();
    this._hookGameRender();
    this._hookHandleTap();
    this._hookSaveLoad();
    this._hookTravelTo();

    console.log('🗺 LivingMapSystem initialized');
  },

  _hookGameUpdate() {
    const _orig = Game.update.bind(Game);
    const self  = this;
    Game.update = function(dt) { _orig(dt); if (GameState.running) self.update(dt); };
  },

  _hookGameRender() {
    const _origTiles = Game.renderTiles.bind(Game);
    const _origObjs  = Game.renderObjects.bind(Game);
    const self = this;

    Game.renderTiles = function() {
      _origTiles();
      self.renderWearOverlay(this.ctx);
    };

    Game.renderObjects = function() {
      _origObjs();
      self.renderStructures(this.ctx);
    };
  },

  _hookHandleTap() {
    const _orig = Game.handleTap.bind(Game);
    const self  = this;

    Game.handleTap = function(sx, sy) {
      const wx = sx + GameState.camera.x;
      const wy = sy + GameState.camera.y;
      const tx = Math.floor(wx / CONFIG.TILE_SIZE);
      const ty = Math.floor(wy / CONFIG.TILE_SIZE);
      const mapId = Maps.getCurrent().id;
      const wear = self.getWear(mapId, tx, ty);

      // Nếu player tap trực tiếp lên tile đủ wear (không có enemy/NPC)
      // Và player đứng gần tile đó
      const playerTx = Math.floor(Player.x / CONFIG.TILE_SIZE);
      const playerTy = Math.floor(Player.y / CONFIG.TILE_SIZE);
      const isTileNearPlayer = Math.abs(tx - playerTx) <= 1 && Math.abs(ty - playerTy) <= 1;

      if (wear >= self.WEAR_THRESHOLDS.no_respawn && isTileNearPlayer) {
        // Kiểm tra không có NPC/enemy tại đó
        const nearEnemy = Enemies.getAt(wx, wy, 20);
        const nearNPC   = NPC.getAt(wx, wy, 20);
        if (!nearEnemy && !nearNPC) {
          self.openBuildMenu(tx, ty);
          return; // Chặn tap gốc
        }
      }
      _orig(sx, sy);
    };
  },

  _hookSaveLoad() {
    const _origSave = Game.save.bind(Game);
    const _origLoad = Game.load.bind(Game);
    const self = this;

    Game.save = function() { _origSave(); self.saveAll(); };
    Game.load = function() { const r = _origLoad(); self.loadAll(); return r; };
  },

  _hookTravelTo() {
    const _origTravel = Maps.travelTo.bind(Maps);
    const self = this;

    Maps.travelTo = function(idx) {
      const prevMapId = Maps.getCurrent().id;
      self._saveMap(prevMapId); // save trước khi rời
      const result = _origTravel(idx);
      if (result) {
        const newMapId = Maps.getCurrent().id;
        self._loadMap(newMapId);
      }
      return result;
    };
  }
};

(function() {
  function tryInit() {
    if (typeof Game !== 'undefined' && typeof Maps !== 'undefined' &&
        typeof Player !== 'undefined' && typeof CONFIG !== 'undefined') {
      LivingMapSystem.init();
    } else {
      setTimeout(tryInit, 300);
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(tryInit, 400));
  } else {
    setTimeout(tryInit, 400);
  }
})();

console.log('🗺 feature_living_map.js loaded');
