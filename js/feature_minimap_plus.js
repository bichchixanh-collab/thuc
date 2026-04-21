// ==================== FEATURE: MINIMAP NÂNG CAO ====================
// Load sau game.js (và sau wanted/caravan nếu có)

const MinimapPlus = {
  // Zoom levels
  zoomLevels: [0.5, 1.0, 1.5, 2.0],
  currentZoom: 1,

  // Icon toggles (player configurable)
  showIcons: {
    npc:     true,
    boss:    true,
    wanted:  true,
    caravan: true,
    mapGate: true,
    player:  true,
    pet:     true
  },

  // ==================== INIT ====================
  init() {
    this._injectStyle();
    this._addZoomButtons();
    this._addIconTogglePanel();
    console.log('🗺️ MinimapPlus initialized');
  },

  // ==================== ZOOM ====================
  zoomIn() {
    const idx = this.zoomLevels.indexOf(this.currentZoom);
    if (idx < this.zoomLevels.length - 1) {
      this.currentZoom = this.zoomLevels[idx + 1];
      this._updateZoomLabel();
    }
  },

  zoomOut() {
    const idx = this.zoomLevels.indexOf(this.currentZoom);
    if (idx > 0) {
      this.currentZoom = this.zoomLevels[idx - 1];
      this._updateZoomLabel();
    }
  },

  _updateZoomLabel() {
    const lbl = document.getElementById('minimapZoomLabel');
    if (lbl) lbl.textContent = `${this.currentZoom}×`;
  },

  // ==================== RENDER ====================
  renderEnhanced() {
    const mc = document.getElementById('minimapCanvas');
    if (!mc) return;

    const mctx = mc.getContext('2d');
    const mw = mc.width, mh = mc.height;
    const zoom = this.currentZoom;

    // Base scale (without zoom)
    const baseScale = mw / (CONFIG.WORLD_WIDTH * CONFIG.TILE_SIZE);
    // Zoomed scale
    const scale = baseScale * zoom;

    mctx.clearRect(0, 0, mw, mh);

    const map = Maps.getCurrent();
    mctx.fillStyle = map.bgColor;
    mctx.fillRect(0, 0, mw, mh);

    // Camera offset for zoom (center on player)
    const camX = Player.x * scale - mw / 2;
    const camY = Player.y * scale - mh / 2;

    mctx.save();
    mctx.translate(-camX, -camY);

    // Trees / objects
    if (zoom <= 1.5) {
      mctx.fillStyle = '#185';
      for (const obj of Maps.objects) {
        if (obj.type === 'tree') {
          mctx.fillRect(obj.x * scale - 1, obj.y * scale - 1, 2, 2);
        }
      }
    }

    // Water tiles hint
    mctx.fillStyle = '#4169e180';
    for (let y = 0; y < CONFIG.WORLD_HEIGHT; y += 4) {
      for (let x = 0; x < CONFIG.WORLD_WIDTH; x += 4) {
        if (Maps.tiles[y]?.[x] === 2) {
          mctx.fillRect(x * CONFIG.TILE_SIZE * scale, y * CONFIG.TILE_SIZE * scale, CONFIG.TILE_SIZE * scale * 4, CONFIG.TILE_SIZE * scale * 4);
        }
      }
    }

    // ---- ICONS ----

    // Map gates (NPC teleporter positions)
    if (this.showIcons.mapGate) {
      for (const npc of NPC.list) {
        if (npc.type === 'teleporter') {
          this._drawMinimapIcon(mctx, npc.x * scale, npc.y * scale, '🚪', '#00ffff', 5, zoom);
        }
      }
    }

    // NPCs
    if (this.showIcons.npc) {
      for (const npc of NPC.list) {
        if (npc.type === 'teleporter') continue; // already drawn as gate
        if (npc.isCaravan && this.showIcons.caravan) continue; // drawn below
        const color = npc.isCaravan ? '#ffd700' : '#80deea';
        mctx.fillStyle = color;
        mctx.fillRect(npc.x * scale - 2, npc.y * scale - 2, 4, 4);
      }
    }

    // Caravan
    if (this.showIcons.caravan && typeof CaravanSystem !== 'undefined' && CaravanSystem.active && CaravanSystem.npcRef) {
      const n = CaravanSystem.npcRef;
      this._drawMinimapIcon(mctx, n.x * scale, n.y * scale, '🛒', '#ffd700', 6, zoom);
    }

    // Enemies (normal)
    for (const enemy of Enemies.list) {
      if (!enemy.alive) continue;
      if (enemy.isElite) continue; // drawn separately
      if (enemy.boss && !this.showIcons.boss) continue;
      mctx.fillStyle = enemy.boss ? '#ffd700' : '#ff4444';
      const sz = enemy.boss ? 4 : 2;
      mctx.fillRect(enemy.x * scale - sz / 2, enemy.y * scale - sz / 2, sz, sz);
    }

    // Wanted (Elite)
    if (this.showIcons.wanted && typeof WantedSystem !== 'undefined') {
      const pulse = (Math.sin(Date.now() / 400) + 1) / 2;
      for (const w of WantedSystem.wantedList) {
        if (!w.alive) continue;
        this._drawMinimapIcon(mctx, w.x * scale, w.y * scale, '⚠️', `rgba(255,102,0,${0.6 + pulse * 0.4})`, 5, zoom);
      }
    }

    // Boss indicator
    if (this.showIcons.boss) {
      for (const enemy of Enemies.list) {
        if (!enemy.alive || !enemy.boss) continue;
        const pulse = (Math.sin(Date.now() / 300) + 1) / 2;
        mctx.strokeStyle = `rgba(255,215,0,${0.5 + pulse * 0.5})`;
        mctx.lineWidth = 1.5;
        mctx.beginPath();
        mctx.arc(enemy.x * scale, enemy.y * scale, 7, 0, Math.PI * 2);
        mctx.stroke();
      }
    }

    // Pet
    if (this.showIcons.pet && Player.activePet) {
      const petData = PETS[Player.activePet];
      mctx.fillStyle = petData.color;
      mctx.fillRect(Player.pet.x * scale - 2, Player.pet.y * scale - 2, 4, 4);
    }

    // Tap target
    if (GameState.tapTarget) {
      mctx.fillStyle = '#ffd700';
      mctx.beginPath();
      mctx.arc(GameState.tapTarget.x * scale, GameState.tapTarget.y * scale, 4, 0, Math.PI * 2);
      mctx.fill();
    }

    // Player (on top)
    if (this.showIcons.player) {
      const px = Player.x * scale, py = Player.y * scale;
      // Direction indicator
      const dirAngles = { right: 0, left: Math.PI, down: Math.PI / 2, up: -Math.PI / 2 };
      const angle = dirAngles[Player.dir] || 0;
      mctx.fillStyle = '#00ff00';
      mctx.save();
      mctx.translate(px, py);
      mctx.rotate(angle);
      mctx.beginPath();
      mctx.moveTo(5, 0);
      mctx.lineTo(-3, -3);
      mctx.lineTo(-3, 3);
      mctx.closePath();
      mctx.fill();
      mctx.restore();
    }

    // Viewport rect
    const game = window.Game;
    if (game && game.canvas) {
      mctx.strokeStyle = 'rgba(255,255,255,0.25)';
      mctx.lineWidth = 1;
      mctx.strokeRect(
        GameState.camera.x * scale,
        GameState.camera.y * scale,
        game.canvas.width * scale,
        game.canvas.height * scale
      );
    }

    mctx.restore();

    // Compass
    this._drawCompass(mctx, mw, mh);
  },

  _drawMinimapIcon(mctx, x, y, icon, color, radius, zoom) {
    mctx.fillStyle = color;
    mctx.beginPath();
    mctx.arc(x, y, radius, 0, Math.PI * 2);
    mctx.fill();
    if (zoom >= 1.5) {
      mctx.font = `${Math.floor(8 * zoom)}px monospace`;
      mctx.textAlign = 'center';
      mctx.fillText(icon, x, y + 4);
    }
  },

  _drawCompass(mctx, mw, mh) {
    const cx = mw - 12, cy = 12;
    mctx.font = '8px monospace';
    mctx.textAlign = 'center';
    mctx.fillStyle = '#fff8';
    mctx.fillText('N', cx, cy + 3);
  },

  // ==================== ICON TOGGLE ====================
  toggleIcon(key) {
    this.showIcons[key] = !this.showIcons[key];
    this._renderTogglePanel();
    this._saveSettings();
  },

  _renderTogglePanel() {
    const panel = document.getElementById('minimapIconPanel');
    if (!panel) return;
    panel.innerHTML = '';

    const labels = {
      npc:     ['🧙 NPC',    '#80deea'],
      boss:    ['👹 Boss',   '#ffd700'],
      wanted:  ['⚠️ Truy Nã','#ff6600'],
      caravan: ['🛒 Thương Đoàn','#ffd700'],
      mapGate: ['🚪 Cổng',  '#00ffff'],
      player:  ['🟢 Nhân vật','#00ff00'],
      pet:     ['🐾 Pet',    '#4caf50'],
    };

    for (const [key, [label, color]] of Object.entries(labels)) {
      const on = this.showIcons[key];
      const btn = document.createElement('div');
      btn.style.cssText = `
        display:flex;align-items:center;gap:6px;padding:6px 8px;
        border-radius:6px;cursor:pointer;
        border:1px solid ${on ? color : '#333'};
        background:${on ? color + '22' : 'transparent'};
        color:${on ? color : '#666'};font-size:10px;
        margin-bottom:4px;
      `;
      btn.innerHTML = `<span>${on ? '✓' : '○'}</span><span>${label}</span>`;
      btn.addEventListener('click', () => this.toggleIcon(key));
      panel.appendChild(btn);
    }
  },

  // ==================== INJECT STYLE + HTML ====================
  _injectStyle() {
    if (document.getElementById('minimapPlusStyle')) return;
    const s = document.createElement('style');
    s.id = 'minimapPlusStyle';
    s.textContent = `
      #minimapZoomBar {
        position:absolute;top:152px;right:10px;
        z-index:21;display:flex;align-items:center;gap:4px;
      }
      .minimap-zoom-btn {
        width:22px;height:22px;
        background:rgba(0,0,0,0.8);border:1px solid #f0c040;
        border-radius:4px;color:#f0c040;font-size:14px;font-weight:bold;
        cursor:pointer;display:flex;align-items:center;justify-content:center;
        line-height:1;
      }
      .minimap-zoom-btn:active{transform:scale(0.9)}
      #minimapZoomLabel {
        color:#f0c040;font-size:10px;min-width:24px;text-align:center;
        background:rgba(0,0,0,0.7);border-radius:4px;padding:2px 4px;
      }
      #minimapIconToggleBtn {
        width:22px;height:22px;
        background:rgba(0,0,0,0.8);border:1px solid #888;
        border-radius:4px;color:#aaa;font-size:11px;
        cursor:pointer;display:flex;align-items:center;justify-content:center;
      }
      #minimapIconTogglePanel {
        position:absolute;top:178px;right:10px;
        z-index:50;background:rgba(0,0,0,0.92);
        border:1px solid #444;border-radius:8px;padding:8px;
        display:none;min-width:140px;
      }
      #minimapIconTogglePanel.show{display:block}
      #minimapIconPanel{}
    `;
    document.head.appendChild(s);
  },

  _addZoomButtons() {
    const bar = document.createElement('div');
    bar.id = 'minimapZoomBar';
    bar.innerHTML = `
      <div class="minimap-zoom-btn" onclick="MinimapPlus.zoomOut()">−</div>
      <div id="minimapZoomLabel">1×</div>
      <div class="minimap-zoom-btn" onclick="MinimapPlus.zoomIn()">+</div>
      <div id="minimapIconToggleBtn" onclick="MinimapPlus._toggleIconPanel()">⚙</div>
    `;
    document.body.appendChild(bar);
  },

  _addIconTogglePanel() {
    const panel = document.createElement('div');
    panel.id = 'minimapIconTogglePanel';
    panel.innerHTML = `<div style="color:#f0c040;font-size:10px;font-weight:bold;margin-bottom:6px">🗺️ Hiện thị</div><div id="minimapIconPanel"></div>`;
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!panel.contains(e.target) && e.target.id !== 'minimapIconToggleBtn') {
        panel.classList.remove('show');
      }
    });
    document.body.appendChild(panel);
    this._renderTogglePanel();
  },

  _toggleIconPanel() {
    const panel = document.getElementById('minimapIconTogglePanel');
    if (panel) panel.classList.toggle('show');
  },

  // ==================== SAVE SETTINGS ====================
  _saveSettings() {
    try { localStorage.setItem('tuxien_minimap_plus', JSON.stringify({ showIcons: this.showIcons, currentZoom: this.currentZoom })); } catch (e) {}
  },

  _loadSettings() {
    try {
      const raw = localStorage.getItem('tuxien_minimap_plus');
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data.showIcons) Object.assign(this.showIcons, data.showIcons);
      if (data.currentZoom && this.zoomLevels.includes(data.currentZoom)) {
        this.currentZoom = data.currentZoom;
        this._updateZoomLabel();
      }
    } catch (e) {}
  }
};

// ==================== WRAP GAME ====================
(function () {
  const _origInit = Game.init.bind(Game);
  Game.init = function () {
    _origInit();
    MinimapPlus.init();
    MinimapPlus._loadSettings();
  };

  // Replace renderMinimap entirely
  Game.renderMinimap = function () {
    MinimapPlus.renderEnhanced();
  };
})();

console.log('🗺️ feature_minimap_plus.js loaded');
// Thêm vào index.html: <script src="js/feature_minimap_plus.js"></script>
