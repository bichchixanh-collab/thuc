// ==================== FEATURE: TỌA KỴ / PHI HÀNH ====================
// Load sau game.js
// Pattern: monkey-patch only, không sửa file gốc

const MountSystem = {
  // ==================== CONFIG ====================
  mounts: {
    thanh_long: {
      id: 'thanh_long',
      name: 'Thanh Long',
      icon: '🐉',
      desc: 'Rồng xanh huyền thoại, hồi phục linh lực nhanh',
      rarity: 'rare',
      speedBonus: 1.8,        // nhân với baseSpeed
      passive: { mpRegen: 8 }, // MP regen mỗi 2 giây
      passiveDesc: '+8 MP/2s khi cưỡi',
      unlockType: 'buy',
      price: 3000,
      craftMats: null,
      color: '#00ff88',
      colorDark: '#00cc66',
      spriteType: 'dragon'
    },
    bach_ho: {
      id: 'bach_ho',
      name: 'Bạch Hổ',
      icon: '🐯',
      desc: 'Hổ trắng hung mãnh, tăng công kích khi cưỡi',
      rarity: 'rare',
      speedBonus: 1.6,
      passive: { atk: 20 },
      passiveDesc: '+20 ATK khi cưỡi',
      unlockType: 'buy',
      price: 3000,
      craftMats: null,
      color: '#ffffff',
      colorDark: '#cccccc',
      spriteType: 'tiger'
    },
    huyen_dieu: {
      id: 'huyen_dieu',
      name: 'Huyền Điểu',
      icon: '🦅',
      desc: 'Chim hắc điểu nhanh nhẹn, tốc độ tối đa',
      rarity: 'epic',
      speedBonus: 2.2,
      passive: { expBonus: 0.15 },
      passiveDesc: '+15% EXP khi cưỡi',
      unlockType: 'craft',
      price: null,
      craftMats: { dragonScale: 3, celestialOrb: 1, spiritStone: 10 },
      color: '#4b0082',
      colorDark: '#2d0052',
      spriteType: 'bird'
    }
  },

  // Player state
  activeMountId: null,
  ownedMounts: [],
  mountVisible: true,

  // Mount position (visual)
  mountPos: { x: 0, y: 0 },

  // ==================== INIT ====================
  init() {
    this._injectStyle();
    this._injectHTML();
    this._setupEvents();
    this._loadSave();
    console.log('🐉 MountSystem initialized');
  },

  // ==================== GETTERS ====================
  getActive() {
    if (!this.activeMountId) return null;
    return this.mounts[this.activeMountId] || null;
  },

  isRiding() {
    return !!this.activeMountId;
  },

  // ==================== UNLOCK / SUMMON ====================
  buyMount(mountId) {
    const m = this.mounts[mountId];
    if (!m) return false;
    if (this.ownedMounts.includes(mountId)) {
      UI.addLog(`❌ Đã sở hữu ${m.name}!`, 'system');
      return false;
    }
    if (m.unlockType !== 'buy') {
      UI.addLog(`❌ ${m.name} cần chế tác, không thể mua!`, 'system');
      return false;
    }
    if (Player.gold < m.price) {
      UI.addLog(`❌ Không đủ vàng! Cần ${m.price} 💰`, 'system');
      return false;
    }
    Player.gold -= m.price;
    UI.updateGold();
    this.ownedMounts.push(mountId);
    this.summonMount(mountId);
    UI.addLog(`🎉 Sở hữu ${m.name}!`, 'item');
    UI.showNotification(`🐉 ${m.name}!`, m.passiveDesc);
    return true;
  },

  craftMount(mountId) {
    const m = this.mounts[mountId];
    if (!m || m.unlockType !== 'craft') return false;
    if (this.ownedMounts.includes(mountId)) {
      UI.addLog(`❌ Đã sở hữu ${m.name}!`, 'system');
      return false;
    }
    // Check mats
    for (const [matId, qty] of Object.entries(m.craftMats)) {
      const slot = Inventory.items.find(i => i.id === matId);
      if (!slot || slot.count < qty) {
        const itemName = ITEMS[matId]?.name || matId;
        UI.addLog(`❌ Thiếu ${itemName} x${qty}!`, 'system');
        return false;
      }
    }
    // Consume mats
    for (const [matId, qty] of Object.entries(m.craftMats)) {
      Inventory.remove(matId, qty);
    }
    this.ownedMounts.push(mountId);
    this.summonMount(mountId);
    UI.addLog(`⚒️ Chế tác thành công ${m.name}!`, 'item');
    UI.showNotification(`🦅 ${m.name}!`, m.passiveDesc);
    return true;
  },

  summonMount(mountId) {
    if (!this.ownedMounts.includes(mountId)) return false;
    // Recall previous
    if (this.activeMountId) this.recallMount(false);

    this.activeMountId = mountId;
    const m = this.mounts[mountId];

    // Apply passive ATK
    if (m.passive.atk) {
      Player.baseAtk += m.passive.atk;
      Player.recalculateStats();
    }

    // Speed boost
    Player.speed = Player.baseSpeed * m.speedBonus + (Player.activePet && PETS[Player.activePet]?.bonus.speed || 0);

    this._updateHUD();
    UI.addLog(`🐉 Triệu hồi ${m.name}! Tốc độ x${m.speedBonus}`, 'system');
    return true;
  },

  recallMount(log = true) {
    if (!this.activeMountId) return;
    const m = this.mounts[this.activeMountId];

    // Remove passive ATK
    if (m.passive.atk) {
      Player.baseAtk = Math.max(12, Player.baseAtk - m.passive.atk);
      Player.recalculateStats();
    }

    // Reset speed
    Player.speed = Player.baseSpeed + (Player.activePet && PETS[Player.activePet]?.bonus.speed || 0);

    this.activeMountId = null;
    this._updateHUD();
    if (log) UI.addLog('🐉 Thu hồi tọa kỵ', 'system');
  },

  // ==================== UPDATE ====================
  update(dt) {
    const m = this.getActive();
    if (!m) return;

    // MP regen passive
    if (m.passive.mpRegen && GameState.time % 2000 < dt) {
      Player.mp = Math.min(Player.maxMp, Player.mp + m.passive.mpRegen);
    }

    // Ensure speed is applied (guard against other systems resetting it)
    const expectedSpeed = Player.baseSpeed * m.speedBonus + (Player.activePet && PETS[Player.activePet]?.bonus.speed || 0);
    if (Math.abs(Player.speed - expectedSpeed) > 0.01) {
      Player.speed = expectedSpeed;
    }

    // Mount position follows player
    this.mountPos.x = Player.x;
    this.mountPos.y = Player.y + 10;
  },

  // ==================== RENDER ====================
  render(ctx) {
    const m = this.getActive();
    if (!m || !Player.alive) return;

    const px = Player.x;
    const py = Player.y;

    ctx.save();
    // Draw mount sprite under player
    this._drawMountSprite(ctx, m, px, py);
    ctx.restore();
  },

  _drawMountSprite(ctx, m, px, py) {
    const bob = Math.sin(GameState.time / 250) * 2;
    const t = GameState.time;

    ctx.save();
    ctx.translate(px, py + 14 + bob);

    switch (m.spriteType) {
      case 'dragon':
        this._drawDragon(ctx, m.color, m.colorDark, t);
        break;
      case 'tiger':
        this._drawTiger(ctx, m.color, m.colorDark, t);
        break;
      case 'bird':
        this._drawBird(ctx, m.color, m.colorDark, t);
        break;
    }

    ctx.restore();

    // Particle trail
    if (Utils.chance(0.15)) {
      GameState.particles.push({
        x: px + (Math.random() - 0.5) * 20,
        y: py + 16 + bob,
        vx: (Math.random() - 0.5) * 1,
        vy: 0.5 + Math.random(),
        life: 400,
        color: m.color,
        size: 2 + Math.random() * 3
      });
    }
  },

  _drawDragon(ctx, color, dark, t) {
    // Body
    ctx.fillStyle = color;
    ctx.fillRect(-18, -6, 36, 12);
    // Head
    ctx.fillStyle = dark;
    ctx.fillRect(14, -8, 12, 10);
    // Horns
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(18, -14, 3, 7);
    ctx.fillRect(22, -14, 3, 7);
    // Eye
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(22, -4, 3, 3);
    // Wings (animated)
    const wingY = Math.sin(t / 180) * 6;
    ctx.fillStyle = color + 'aa';
    ctx.beginPath();
    ctx.moveTo(-10, -6);
    ctx.lineTo(-25, -18 + wingY);
    ctx.lineTo(-5, -6);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(5, -6);
    ctx.lineTo(20, -18 + wingY);
    ctx.lineTo(10, -6);
    ctx.fill();
    // Tail
    ctx.fillStyle = color;
    ctx.fillRect(-30, -3, 14, 6);
    ctx.fillRect(-38, 0, 10, 4);
  },

  _drawTiger(ctx, color, dark, t) {
    const run = Math.sin(t / 120) * 3;
    // Body
    ctx.fillStyle = color;
    ctx.fillRect(-20, -8, 40, 14);
    // Head
    ctx.fillStyle = dark;
    ctx.fillRect(16, -10, 14, 12);
    // Stripes
    ctx.fillStyle = '#333';
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(-16 + i * 8, -8, 3, 14);
    }
    // Eyes
    ctx.fillStyle = '#ff8800';
    ctx.fillRect(24, -5, 4, 4);
    // Ears
    ctx.fillStyle = color;
    ctx.fillRect(20, -16, 5, 7);
    ctx.fillRect(26, -16, 5, 7);
    // Legs (animated)
    ctx.fillStyle = dark;
    ctx.fillRect(-14, 6 + run, 6, 10);
    ctx.fillRect(-4, 6 - run, 6, 10);
    ctx.fillRect(6, 6 + run, 6, 10);
    ctx.fillRect(16, 6 - run, 6, 10);
    // Tail
    ctx.fillStyle = color;
    ctx.fillRect(-30, -4, 12, 5);
  },

  _drawBird(ctx, color, dark, t) {
    const flap = Math.sin(t / 100) * 10;
    // Body
    ctx.fillStyle = color;
    ctx.fillRect(-14, -5, 28, 10);
    // Head
    ctx.fillStyle = dark;
    ctx.fillRect(10, -8, 10, 9);
    // Beak
    ctx.fillStyle = '#ffcc00';
    ctx.fillRect(18, -4, 8, 3);
    // Eye
    ctx.fillStyle = '#fff';
    ctx.fillRect(15, -6, 4, 4);
    ctx.fillStyle = '#000';
    ctx.fillRect(16, -5, 2, 2);
    // Wings (big flap)
    ctx.fillStyle = dark + 'cc';
    ctx.save();
    ctx.translate(-8, -2);
    ctx.rotate((-Math.PI / 6) - (flap / 60));
    ctx.fillRect(-20, 0, 22, 6);
    ctx.restore();
    ctx.save();
    ctx.translate(8, -2);
    ctx.rotate((Math.PI / 6) + (flap / 60));
    ctx.fillRect(-2, 0, 22, 6);
    ctx.restore();
    // Tail feathers
    ctx.fillStyle = color;
    ctx.fillRect(-22, -2, 10, 4);
  },

  // ==================== HUD ====================
  _updateHUD() {
    const hud = document.getElementById('mountHUD');
    if (!hud) return;
    const m = this.getActive();
    if (m) {
      hud.style.display = 'flex';
      hud.querySelector('.mount-name').textContent = `${m.icon} ${m.name}`;
      hud.querySelector('.mount-passive').textContent = m.passiveDesc;
      hud.querySelector('.mount-speed').textContent = `🚀 x${m.speedBonus} tốc độ`;
    } else {
      hud.style.display = 'none';
    }
  },

  // ==================== UI PANEL ====================
  openPanel() {
    document.getElementById('mountPanel').classList.add('show');
    this._renderPanel();
  },

  closePanel() {
    document.getElementById('mountPanel').classList.remove('show');
  },

  _renderPanel() {
    const list = document.getElementById('mountList');
    list.innerHTML = '';

    for (const [id, m] of Object.entries(this.mounts)) {
      const owned = this.ownedMounts.includes(id);
      const isActive = this.activeMountId === id;
      const rarityColor = { rare: '#a855f7', epic: '#f97316', legendary: '#f0c040' }[m.rarity] || '#ccc';

      const card = document.createElement('div');
      card.style.cssText = `
        background:rgba(255,255,255,0.03);
        border:2px solid ${isActive ? '#4caf50' : rarityColor + '88'};
        border-radius:10px;
        padding:12px;
        margin-bottom:10px;
        ${isActive ? 'background:rgba(76,175,80,0.08);' : ''}
      `;

      let actionBtn = '';
      if (isActive) {
        actionBtn = `<button onclick="MountSystem.recallMount()" style="width:100%;margin-top:8px;padding:8px;background:rgba(244,67,54,0.2);border:1px solid #f44;border-radius:6px;color:#f44;font-size:11px;cursor:pointer;font-family:inherit">🛑 Thu Hồi</button>`;
      } else if (owned) {
        actionBtn = `<button onclick="MountSystem.summonMount('${id}')" style="width:100%;margin-top:8px;padding:8px;background:rgba(33,150,243,0.2);border:1px solid #2196f3;border-radius:6px;color:#2196f3;font-size:11px;cursor:pointer;font-family:inherit">🐉 Triệu Hồi</button>`;
      } else if (m.unlockType === 'buy') {
        const canBuy = Player.gold >= m.price;
        actionBtn = `<button onclick="MountSystem.buyMount('${id}');MountSystem._renderPanel()" style="width:100%;margin-top:8px;padding:8px;background:rgba(240,192,64,${canBuy ? '0.2' : '0.05'});border:1px solid ${canBuy ? '#f0c040' : '#555'};border-radius:6px;color:${canBuy ? '#f0c040' : '#666'};font-size:11px;cursor:${canBuy ? 'pointer' : 'not-allowed'};font-family:inherit" ${canBuy ? '' : 'disabled'}>💰 Mua ${Utils.formatNumber(m.price)} Vàng</button>`;
      } else {
        // Craft
        const matsHtml = Object.entries(m.craftMats).map(([matId, qty]) => {
          const have = Inventory.items.find(i => i.id === matId)?.count || 0;
          const ok = have >= qty;
          const name = ITEMS[matId]?.name || matId;
          return `<span style="color:${ok ? '#4caf50' : '#f44'};font-size:9px">${name} ${have}/${qty}</span>`;
        }).join(' · ');
        actionBtn = `
          <div style="margin-top:6px">${matsHtml}</div>
          <button onclick="MountSystem.craftMount('${id}');MountSystem._renderPanel()" style="width:100%;margin-top:6px;padding:8px;background:rgba(156,39,176,0.2);border:1px solid #9c27b0;border-radius:6px;color:#ce93d8;font-size:11px;cursor:pointer;font-family:inherit">⚒️ Chế Tác</button>
        `;
      }

      card.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span style="color:${rarityColor};font-size:14px;font-weight:bold">${m.icon} ${m.name}</span>
          <span style="font-size:9px;color:${rarityColor};border:1px solid ${rarityColor}44;padding:2px 6px;border-radius:4px">${m.rarity.toUpperCase()}</span>
        </div>
        <div style="color:#999;font-size:10px;margin-top:4px">${m.desc}</div>
        <div style="display:flex;gap:10px;margin-top:6px">
          <span style="color:#87ceeb;font-size:10px">🚀 x${m.speedBonus} Speed</span>
          <span style="color:#8f8;font-size:10px">✨ ${m.passiveDesc}</span>
        </div>
        ${isActive ? '<div style="color:#4caf50;font-size:10px;margin-top:4px;font-weight:bold">✓ Đang cưỡi</div>' : ''}
        ${actionBtn}
      `;
      list.appendChild(card);
    }
  },

  // ==================== SAVE / LOAD ====================
  getSaveData() {
    return {
      activeMountId: this.activeMountId,
      ownedMounts: [...this.ownedMounts]
    };
  },

  _loadSave() {
    try {
      const raw = localStorage.getItem('tuxien_mount');
      if (!raw) return;
      const data = JSON.parse(raw);
      this.ownedMounts = data.ownedMounts || [];
      if (data.activeMountId && this.ownedMounts.includes(data.activeMountId)) {
        this.summonMount(data.activeMountId);
      }
    } catch (e) {}
  },

  _save() {
    try {
      localStorage.setItem('tuxien_mount', JSON.stringify(this.getSaveData()));
    } catch (e) {}
  },

  // ==================== INJECT HTML + STYLE ====================
  _injectStyle() {
    if (document.getElementById('mountStyle')) return;
    const style = document.createElement('style');
    style.id = 'mountStyle';
    style.textContent = `
      #mountHUD {
        position:absolute;
        top:155px; left:10px;
        z-index:20;
        background:rgba(0,0,0,0.75);
        border:1px solid #00ff88;
        border-radius:6px;
        padding:4px 10px;
        display:none;
        flex-direction:column;
        gap:2px;
        max-width:180px;
      }
      #mountHUD .mount-name { color:#00ff88; font-size:11px; font-weight:bold; }
      #mountHUD .mount-passive { color:#8f8; font-size:9px; }
      #mountHUD .mount-speed { color:#87ceeb; font-size:9px; }

      #mountPanel {
        position:absolute; top:0; left:0; width:100%; height:100%;
        background:rgba(0,0,0,0.75); z-index:100;
        display:none; align-items:center; justify-content:center;
        backdrop-filter:blur(2px);
      }
      #mountPanel.show { display:flex; }
      #mountPanelInner {
        background:linear-gradient(135deg,#1a1a2e,#16213e);
        border:3px solid #00ff88;
        border-radius:15px; padding:18px;
        width:92%; max-width:400px; max-height:82vh; overflow-y:auto;
        box-shadow:0 0 40px rgba(0,255,136,0.2);
      }
      #mountPanelInner::-webkit-scrollbar{width:5px}
      #mountPanelInner::-webkit-scrollbar-thumb{background:#00ff88;border-radius:3px}
    `;
    document.head.appendChild(style);
  },

  _injectHTML() {
    // HUD indicator
    const hud = document.createElement('div');
    hud.id = 'mountHUD';
    hud.innerHTML = `
      <div class="mount-name">🐉 Thanh Long</div>
      <div class="mount-speed">🚀 x1.8 tốc độ</div>
      <div class="mount-passive">+8 MP/2s</div>
    `;
    hud.style.display = 'none';
    document.body.appendChild(hud);

    // Panel
    const panel = document.createElement('div');
    panel.id = 'mountPanel';
    panel.innerHTML = `
      <div id="mountPanelInner">
        <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #00ff8844;padding-bottom:10px;margin-bottom:15px">
          <div style="color:#00ff88;font-size:18px;font-weight:bold;text-shadow:0 0 10px #00ff8844">🐉 Tọa Kỵ</div>
          <div onclick="MountSystem.closePanel()" style="width:32px;height:32px;background:rgba(255,0,0,0.2);border:2px solid #f44;border-radius:50%;color:#f44;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center">✕</div>
        </div>
        <div id="mountList"></div>
      </div>
    `;
    document.body.appendChild(panel);

    // Menu button
    const menuBar = document.getElementById('menuBar');
    if (menuBar) {
      const btn = document.createElement('div');
      btn.className = 'menu-btn';
      btn.onclick = () => MountSystem.openPanel();
      btn.innerHTML = `<span style="font-size:18px">🐉</span><span>Tọa Kỵ</span>`;
      menuBar.appendChild(btn);
    }
  },

  _setupEvents() {
    // Panel close on overlay click
    document.getElementById('mountPanel')?.addEventListener('click', (e) => {
      if (e.target.id === 'mountPanel') this.closePanel();
    });
  }
};

// ==================== WRAP Game.init ====================
(function () {
  const _origInit = Game.init.bind(Game);
  Game.init = function () {
    _origInit();
    MountSystem.init();
  };

  // Wrap Game.update to update mount
  const _origUpdate = Game.update.bind(Game);
  Game.update = function (dt) {
    _origUpdate(dt);
    MountSystem.update(dt);
  };

  // Wrap Game.render to draw mount under player
  const _origRender = Game.render.bind(Game);
  Game.render = function () {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.save();
    ctx.translate(-GameState.camera.x, -GameState.camera.y);

    this.renderTiles();
    this.renderTapIndicator();
    this.renderObjects();
    this.renderNPCs();
    this.renderEnemies();
    // Mount drawn BEFORE pet and player (under them)
    MountSystem.render(ctx);
    this.renderPet();
    this.renderPlayer();
    this.renderParticles();
    ctx.restore();

    this.renderDamageNumbers();
    if (GameState.minimapVisible) this.renderMinimap();
  };

  // Wrap Game.save
  const _origSave = Game.save.bind(Game);
  Game.save = function () {
    _origSave();
    MountSystem._save();
  };
})();

console.log('🐉 feature_mount.js loaded');
// Thêm vào index.html: <script src="js/feature_mount.js"></script>
