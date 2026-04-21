// ==================== FEATURE: APPEARANCE SYSTEM ====================
// js/feature_appearance.js
// Load sau: config.js → sprites.js → player.js → ... → ui.js → game.js
// <script src="js/feature_appearance.js"></script>

// ===========================================================
//  SECTION 1 — DATA & CONFIG
// ===========================================================

const APPEARANCE_CONFIG = {

  // 6 phần tùy chỉnh
  customizableParts: {
    hair:     { name: 'Tóc',     default: '#3d2314' },
    skin:     { name: 'Da',      default: '#ffe4c4' },
    robe:     { name: 'Áo',      default: '#4169e1' },
    robeDark: { name: 'Áo Đậm',  default: '#27408b' },
    belt:     { name: 'Đai',     default: '#ffd700' },
    eye:      { name: 'Mắt',     default: '#1a1a1a' }
  },

  // Bảng màu cho từng phần
  hairColors:     ['#3d2314','#1a1a1a','#f0c040','#e0e0e0','#8b0000','#4a148c','#006064','#1b5e20','#ff6f00'],
  skinColors:     ['#ffe4c4','#d4a76a','#8d5524','#ffd5b5','#c68642','#f1c27d','#e8beac'],
  robeColors:     ['#4169e1','#c62828','#2e7d32','#f57f17','#4a148c','#006064','#1a1a2e','#37474f','#880e4f'],
  robeDarkColors: ['#27408b','#7f0000','#1b5e20','#e65100','#38006b','#004d40','#000','#263238','#560027'],
  beltColors:     ['#ffd700','#c0c0c0','#cd7f32','#ffffff','#f44336','#4caf50','#2196f3','#9c27b0'],
  eyeColors:      ['#1a1a1a','#1565c0','#b71c1c','#1b5e20','#f57f17','#4a0e4e','#e0e0e0'],

  // Preset skins
  presetSkins: {
    default: {
      name: 'Mặc Định',
      hair: '#3d2314', skin: '#ffe4c4', robe: '#4169e1',
      robeDark: '#27408b', belt: '#ffd700', eye: '#1a1a1a'
    },
    darkSword: {
      name: 'Hắc Kiếm',
      hair: '#1a1a1a', skin: '#d4a76a', robe: '#c62828',
      robeDark: '#7f0000', belt: '#c0c0c0', eye: '#b71c1c'
    },
    jade: {
      name: 'Ngọc Tiên',
      hair: '#e0e0e0', skin: '#ffe4c4', robe: '#2e7d32',
      robeDark: '#1b5e20', belt: '#ffd700', eye: '#1b5e20'
    },
    golden: {
      name: 'Hoàng Kim',
      hair: '#f0c040', skin: '#d4a76a', robe: '#f57f17',
      robeDark: '#e65100', belt: '#ffd700', eye: '#f57f17'
    },
    celestial: {
      name: 'Thiên Tiên',
      hair: '#e0e0e0', skin: '#ffe4c4', robe: '#4a148c',
      robeDark: '#38006b', belt: '#e040fb', eye: '#4a0e4e'
    },
    tet2024: {
      name: '🧧 Trang Phục Tết',
      hair: '#f0c040', skin: '#ffe4c4', robe: '#c62828',
      robeDark: '#7f0000', belt: '#ffd700', eye: '#1a1a1a',
      seasonal: true, unlock: 'tet_event'
    },
    halloween: {
      name: '🎃 Halloween',
      hair: '#1a1a1a', skin: '#8d5524', robe: '#4a148c',
      robeDark: '#38006b', belt: '#f57f17', eye: '#f57f17',
      seasonal: true, unlock: 'halloween_event'
    },
    winterFrost: {
      name: '❄️ Đông Băng',
      hair: '#e0e0e0', skin: '#ffe4c4', robe: '#006064',
      robeDark: '#004d40', belt: '#e0e0e0', eye: '#006064',
      seasonal: true, unlock: 'winter_event'
    }
  },

  // Avatar frames theo realm tier
  avatarFrames: {
    0: { name: 'Đồng',  color: '#cd7f32', glow: false, border: 'single'    },
    1: { name: 'Bạc',   color: '#c0c0c0', glow: false, border: 'double'    },
    2: { name: 'Vàng',  color: '#ffd700', glow: true,  border: 'dragon'    },
    3: { name: 'Ngọc',  color: '#00bcd4', glow: true,  border: 'thunder'   },
    4: { name: 'Tiên',  color: '#e040fb', glow: true,  border: 'celestial' }
  },

  // realm index → frame tier
  realmToFrameTier: [0, 0, 1, 1, 2, 2, 3, 3, 4],

  // Particle themes theo realm
  particleThemes: {
    0: { name: 'Bụi Đất',  color: '#a08060', size: 2, freq: 0.02,
         vx: () => 0, vy: () => -0.5 - Math.random(), life: 300, type: 'dust' },
    1: { name: 'Lá Tre',   color: '#4caf50', size: 3, freq: 0.025,
         vx: () => (Math.random() - 0.5) * 1.5, vy: () => -1 - Math.random() * 0.5, life: 600, type: 'leaf' },
    2: { name: 'Tia Vàng', color: '#ffd700', size: 2, freq: 0.04,
         vx: () => (Math.random() - 0.5) * 2, vy: () => -1.5 - Math.random(), life: 400, type: 'spark' },
    3: { name: 'Linh Hồn', color: '#42a5f5', size: 4, freq: 0.03,
         vx: () => (Math.random() - 0.5) * 1, vy: () => -0.8 - Math.random() * 0.5, life: 800, type: 'orb' },
    4: { name: 'Ngọn Lửa', color: '#ff4500', size: 3, freq: 0.05,
         vx: () => (Math.random() - 0.5) * 1.5, vy: () => -2 - Math.random(), life: 350, type: 'flame' },
    5: { name: 'Sương Mù', color: '#b0bec5', size: 5, freq: 0.02,
         vx: () => (Math.random() - 0.5) * 0.8, vy: () => -0.5, life: 1000, type: 'mist' },
    6: { name: 'Kiếm Khí', color: '#e0e0e0', size: 2, freq: 0.04,
         vx: () => (Math.random() - 0.5) * 3, vy: () => -2 - Math.random() * 1.5, life: 300, type: 'sword' },
    7: { name: 'Sấm Sét',  color: '#ffeb3b', size: 2, freq: 0.06,
         vx: () => (Math.random() - 0.5) * 4, vy: () => -3 - Math.random(), life: 200, type: 'lightning' },
    8: { name: 'Hoa Tiên', color: '#f8bbd0', size: 4, freq: 0.03,
         vx: () => (Math.random() - 0.5) * 1.5, vy: () => -0.8 - Math.random() * 0.5, life: 1200, type: 'flower' }
  }
};

// Thêm item mới vào ITEMS
if (typeof ITEMS !== 'undefined') {
  ITEMS.appearanceScroll = {
    name: 'Phong Cách Thư', type: 'consumable', rarity: 'rare',
    desc: 'Mở khóa 1 skin ngẫu nhiên chưa có.',
    effect: { unlockSkin: true }, sellPrice: 200, icon: 'scroll'
  };
  ITEMS.rerollFate = {
    name: 'Vận Mệnh Thư', type: 'consumable', rarity: 'epic',
    desc: 'Roll lại Thiên Mệnh (nếu có hệ thống đó).',
    effect: { rerollFate: true }, sellPrice: 500, icon: 'scroll'
  };
}

// ===========================================================
//  SECTION 2 — LOGIC MODULE
// ===========================================================

// --------------- 2A. AppearanceSystem ---------------

const AppearanceSystem = {
  state: {
    currentColors: {
      hair: '#3d2314', skin: '#ffe4c4', robe: '#4169e1',
      robeDark: '#27408b', belt: '#ffd700', eye: '#1a1a1a'
    },
    unlockedSkins: ['default'],
    currentSkin: 'default',
    particleThemeOverride: null,
    _particleTimer: 0
  },

  // Sprite gốc (lưu trước khi override)
  _originalSprites: null,

  // ---- helper: lighten hex color ----
  lighten(hex, amount) {
    const h = hex.replace('#', '');
    let r = parseInt(h.substring(0, 2), 16);
    let g = parseInt(h.substring(2, 4), 16);
    let b = parseInt(h.substring(4, 6), 16);
    r = Math.min(255, Math.round(r + (255 - r) * amount));
    g = Math.min(255, Math.round(g + (255 - g) * amount));
    b = Math.min(255, Math.round(b + (255 - b) * amount));
    return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
  },

  // ---- Rebuild player sprites với màu mới ----
  rebuildPlayerSprites() {
    if (!this._originalSprites) return;
    const state = this.state;
    const colorMap = {
      '#3d2314': state.currentColors.hair,
      '#5a3825': this.lighten(state.currentColors.hair, 0.15),
      '#ffe4c4': state.currentColors.skin,
      '#fff0e0': this.lighten(state.currentColors.skin, 0.1),
      '#4169e1': state.currentColors.robe,
      '#6495ed': this.lighten(state.currentColors.robe, 0.2),
      '#27408b': state.currentColors.robeDark,
      '#ffd700': state.currentColors.belt,
      '#daa520': this.lighten(state.currentColors.belt, -0.1),
      '#1a1a1a': state.currentColors.eye
    };

    const mapSprite = (orig) => {
      if (!orig) return null;
      return orig.map(row =>
        row.map(cell => {
          if (!cell || cell === 0 || cell === null) return cell;
          return colorMap[cell] !== undefined ? colorMap[cell] : cell;
        })
      );
    };

    Sprites.player.down  = mapSprite(this._originalSprites.down);
    Sprites.player.walk1 = mapSprite(this._originalSprites.walk1);
    Sprites.player.walk2 = mapSprite(this._originalSprites.walk2);

    // Refresh avatar canvas in HUD
    try {
      const avCanvas = document.getElementById('avatarCanvas');
      if (avCanvas) {
        const ctx = avCanvas.getContext('2d');
        ctx.clearRect(0, 0, avCanvas.width, avCanvas.height);
        Sprites.drawPixelArt(ctx, Sprites.player.down, 2, 0, 0);
      }
    } catch (e) {}
  },

  // ---- Apply màu (override COLORS + rebuild sprites) ----
  applyColors(colors) {
    COLORS.hair     = colors.hair     || COLORS.hair;
    COLORS.skin     = colors.skin     || COLORS.skin;
    COLORS.robe     = colors.robe     || COLORS.robe;
    COLORS.robeDark = colors.robeDark || COLORS.robeDark;
    COLORS.belt     = colors.belt     || COLORS.belt;
    COLORS.eye      = colors.eye      || COLORS.eye;

    // Cập nhật derived colors
    COLORS.skinLight  = this.lighten(COLORS.skin, 0.15);
    COLORS.robeLight  = this.lighten(COLORS.robe, 0.2);
    COLORS.beltDark   = this.lighten(COLORS.belt, -0.1);
    COLORS.hairLight  = this.lighten(COLORS.hair, 0.15);

    this.rebuildPlayerSprites();
    AppearancePanel.refreshPreview();
  },

  // ---- Apply preset skin ----
  applySkin(skinId) {
    const skin = APPEARANCE_CONFIG.presetSkins[skinId];
    if (!skin) return false;
    if (skin.seasonal && !this.state.unlockedSkins.includes(skinId)) {
      if (typeof UI !== 'undefined') UI.addLog('❌ Skin chưa được mở khóa!', 'system');
      return false;
    }
    this.state.currentSkin = skinId;
    const cols = { hair: skin.hair, skin: skin.skin, robe: skin.robe,
                   robeDark: skin.robeDark, belt: skin.belt, eye: skin.eye };
    this.state.currentColors = { ...cols };
    this.applyColors(this.state.currentColors);
    return true;
  },

  // ---- Tùy chỉnh từng phần ----
  setPartColor(part, color) {
    if (!APPEARANCE_CONFIG.customizableParts[part]) return false;
    this.state.currentColors[part] = color;
    this.state.currentSkin = 'custom';
    this.applyColors(this.state.currentColors);
    return true;
  },

  // ---- Unlock skin ----
  unlockSkin(skinId) {
    if (this.state.unlockedSkins.includes(skinId)) return false;
    this.state.unlockedSkins.push(skinId);
    const skin = APPEARANCE_CONFIG.presetSkins[skinId];
    if (!skin) return false;
    if (typeof UI !== 'undefined') {
      UI.showNotification('👘 Skin Mới!', skin.name);
      UI.addLog('👘 Mở khóa trang phục: ' + skin.name, 'item');
    }
    return true;
  },

  // ---- Roll skin ngẫu nhiên (dùng khi dùng appearanceScroll) ----
  rollRandomSkin() {
    const locked = Object.keys(APPEARANCE_CONFIG.presetSkins)
      .filter(id => !this.state.unlockedSkins.includes(id))
      .filter(id => !APPEARANCE_CONFIG.presetSkins[id].seasonal);
    if (locked.length === 0) {
      if (typeof UI !== 'undefined') UI.addLog('✨ Đã mở khóa tất cả skin!', 'system');
      return false;
    }
    const skinId = locked[Math.floor(Math.random() * locked.length)];
    return this.unlockSkin(skinId);
  },

  // ---- Kiểm tra seasonal skins theo thời gian thực ----
  checkSeasonalUnlocks() {
    const now = new Date();
    const month = now.getMonth() + 1; // 1-12
    if (month === 1 || month === 2) {
      this.unlockSkin('tet2024');
    }
    if (month === 10) {
      this.unlockSkin('halloween');
    }
    if (month === 12) {
      this.unlockSkin('winterFrost');
    }
  },

  // ---- Save / Load ----
  getSaveData() {
    return {
      currentColors: { ...this.state.currentColors },
      unlockedSkins: [...this.state.unlockedSkins],
      currentSkin: this.state.currentSkin,
      particleThemeOverride: this.state.particleThemeOverride
    };
  },

  loadSaveData(data) {
    if (!data) return;
    if (data.currentColors) this.state.currentColors = { ...data.currentColors };
    if (data.unlockedSkins) this.state.unlockedSkins = [...data.unlockedSkins];
    if (data.currentSkin !== undefined) this.state.currentSkin = data.currentSkin;
    if (data.particleThemeOverride !== undefined)
      this.state.particleThemeOverride = data.particleThemeOverride;
    this.applyColors(this.state.currentColors);
  }
};

// --------------- 2B. ParticleThemeSystem ---------------

const ParticleThemeSystem = {
  getTheme() {
    const themeId = AppearanceSystem.state.particleThemeOverride !== null
      ? AppearanceSystem.state.particleThemeOverride
      : (typeof Player !== 'undefined' ? Player.realm : 0);
    return APPEARANCE_CONFIG.particleThemes[themeId] || APPEARANCE_CONFIG.particleThemes[0];
  },

  update(dt) {
    AppearanceSystem.state._particleTimer += dt;
    const theme = this.getTheme();
    if (!theme) return;

    // Chỉ spawn khi player đang di chuyển
    const isMoving = typeof Player !== 'undefined' &&
      (Math.abs(Player.vx || 0) > 0.1 || Math.abs(Player.vy || 0) > 0.1);
    if (!isMoving) return;

    if (Math.random() > theme.freq * (dt / 16)) return;

    const particle = {
      x: Player.x + (Math.random() - 0.5) * 16,
      y: Player.y + 10 + Math.random() * 5,
      vx: theme.vx(),
      vy: theme.vy(),
      life: theme.life,
      maxLife: theme.life,
      color: theme.color,
      size: theme.size,
      themeType: theme.type
    };

    // Special behavior per type
    switch (theme.type) {
      case 'orb':
        particle.vx = (Math.random() - 0.5) * 0.5;
        particle.vy = -0.3 - Math.random() * 0.3;
        break;
      case 'flower':
        particle.vy = 0.5 + Math.random() * 0.5;
        particle.spin = Math.random() * 0.1;
        break;
      case 'lightning':
        particle.size = 1 + Math.random();
        break;
    }

    if (typeof GameState !== 'undefined') {
      GameState.particles.push(particle);
    }
  }
};

// --------------- 2C. AvatarFrameSystem ---------------

const AvatarFrameSystem = {
  getFrameTier() {
    if (typeof Player === 'undefined') return 0;
    return APPEARANCE_CONFIG.realmToFrameTier[Player.realm] || 0;
  },

  // Render frame trên canvas (dùng cho preview trong panel)
  renderFrame(ctx, x, y, size) {
    const tier = this.getFrameTier();
    const frame = APPEARANCE_CONFIG.avatarFrames[tier];

    ctx.save();

    if (frame.glow) {
      const pulse = 0.4 + Math.sin(GameState.time / 400) * 0.2;
      ctx.shadowColor = frame.color;
      ctx.shadowBlur = 10 + pulse * 5;
    }

    ctx.strokeStyle = frame.color;
    ctx.lineWidth = 3;

    switch (frame.border) {
      case 'single':
        ctx.strokeRect(x, y, size, size);
        break;

      case 'double':
        ctx.strokeRect(x, y, size, size);
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 2, y + 2, size - 4, size - 4);
        break;

      case 'dragon':
        ctx.strokeRect(x, y, size, size);
        [[x, y], [x + size, y], [x, y + size], [x + size, y + size]].forEach(([cx, cy], i) => {
          const dx = i % 2 === 0 ? 6 : -6, dy = i < 2 ? 6 : -6;
          ctx.beginPath();
          ctx.moveTo(cx, cy + dy); ctx.lineTo(cx, cy); ctx.lineTo(cx + dx, cy);
          ctx.stroke();
        });
        break;

      case 'thunder':
        ctx.strokeRect(x, y, size, size);
        ctx.beginPath();
        for (let i = 0; i <= size; i += 8) {
          ctx.lineTo(x + i, y + (i % 16 === 0 ? 0 : 3));
        }
        ctx.stroke();
        break;

      case 'celestial':
        ctx.strokeRect(x, y, size, size);
        ctx.fillStyle = frame.color;
        [[x + 2, y + 2], [x + size - 2, y + 2], [x + 2, y + size - 2], [x + size - 2, y + size - 2]]
          .forEach(([cx, cy]) => {
            ctx.fillRect(cx - 1, cy - 1, 3, 1);
            ctx.fillRect(cx - 1, cy - 1, 1, 3);
          });
        ctx.beginPath();
        ctx.arc(x + size / 2, y, 3, 0, Math.PI * 2);
        ctx.fill();
        break;
    }

    ctx.restore();
  },

  // Render aura ring quanh nhân vật trong world (gọi từ Game.renderPlayer)
  renderAura(ctx) {
    const tier = this.getFrameTier();
    if (tier < 2) return;
    const frame = APPEARANCE_CONFIG.avatarFrames[tier];
    const pulse = 0.3 + Math.sin(GameState.time / 300) * 0.15;
    ctx.save();
    ctx.globalAlpha = pulse;
    ctx.strokeStyle = frame.color;
    ctx.lineWidth = 2;
    ctx.shadowColor = frame.color;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(
      Player.x - GameState.camera.x,
      Player.y - 10 - GameState.camera.y,
      20 + Math.sin(GameState.time / 500) * 3,
      0, Math.PI * 2
    );
    ctx.stroke();
    ctx.restore();
  },

  // Cập nhật border HUD avatar element
  updateHUDBorder() {
    const tier = this.getFrameTier();
    const frame = APPEARANCE_CONFIG.avatarFrames[tier];
    const el = document.getElementById('avatarFrame');
    if (!el) return;
    el.style.borderColor = frame.color;
    if (frame.glow) {
      const pulse = 0.6 + Math.sin(Date.now() / 400) * 0.4;
      el.style.boxShadow = `0 0 ${Math.round(8 + pulse * 6)}px ${frame.color}`;
    } else {
      el.style.boxShadow = '';
    }
  }
};

// ===========================================================
//  SECTION 3 — UI (AppearancePanel)
// ===========================================================

const AppearancePanel = {
  _tab: 'customize',
  _previewCtx: null,

  // ---- Inject HTML + CSS ----
  injectHTML() {
    const overlay = document.createElement('div');
    overlay.id = 'appearanceOverlay';
    overlay.className = 'modal-overlay';
    overlay.style.cssText = 'display:none;z-index:110;position:fixed;top:0;left:0;width:100%;height:100%;'
      + 'background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;';
    overlay.style.display = 'none';

    overlay.innerHTML = `
      <div class="modal-panel" style="max-width:420px;width:95%;background:linear-gradient(135deg,#1a1a2e,#16213e);
           border:3px solid #f0c040;border-radius:15px;padding:18px;position:relative;max-height:90vh;overflow-y:auto;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
          <div style="color:#f0c040;font-family:'Courier New',monospace;font-size:16px;font-weight:bold;">👘 Ngoại Hình</div>
          <div id="appearanceClose" style="cursor:pointer;color:#f0c040;font-size:18px;padding:4px 8px;">✕</div>
        </div>
        <div id="appTabRow" style="display:flex;gap:6px;margin-bottom:14px;">
          <div class="app-tab-btn active" data-tab="customize"
               style="flex:1;text-align:center;padding:6px 0;border-radius:8px;cursor:pointer;
                      font-family:'Courier New',monospace;font-size:11px;background:#f0c04022;
                      border:1px solid #f0c04055;color:#f0c040;">🎨 Tùy Chỉnh</div>
          <div class="app-tab-btn" data-tab="presets"
               style="flex:1;text-align:center;padding:6px 0;border-radius:8px;cursor:pointer;
                      font-family:'Courier New',monospace;font-size:11px;background:transparent;
                      border:1px solid #555;color:#aaa;">👘 Trang Phục</div>
          <div class="app-tab-btn" data-tab="particle"
               style="flex:1;text-align:center;padding:6px 0;border-radius:8px;cursor:pointer;
                      font-family:'Courier New',monospace;font-size:11px;background:transparent;
                      border:1px solid #555;color:#aaa;">✨ Hiệu Ứng</div>
        </div>
        <div id="appearanceContent"></div>
      </div>`;

    document.body.appendChild(overlay);

    // Inject style
    const style = document.createElement('style');
    style.textContent = `
      #appearanceOverlay .app-tab-btn.active {
        background: #f0c04033 !important;
        border-color: #f0c040 !important;
        color: #f0c040 !important;
      }
      .app-skin-card {
        background: #0d0d1a;
        border: 2px solid #333;
        border-radius: 8px;
        padding: 8px;
        cursor: pointer;
        text-align: center;
        transition: border-color 0.2s;
        position: relative;
      }
      .app-skin-card:hover { border-color: #f0c040; }
      .app-skin-card.active { border-color: #f0c040; background: #f0c04011; }
      .app-skin-card.locked { opacity: 0.5; cursor: not-allowed; }
      .app-color-circle {
        width: 22px; height: 22px;
        border-radius: 50%;
        border: 2px solid #444;
        cursor: pointer;
        display: inline-block;
        transition: border-color 0.15s, transform 0.15s;
      }
      .app-color-circle:hover { transform: scale(1.15); }
      .app-color-circle.selected { border-color: #fff !important; transform: scale(1.15); }
    `;
    document.head.appendChild(style);
  },

  // ---- Setup event listeners ----
  setupEvents() {
    document.getElementById('appearanceClose').addEventListener('click', () => this.close());
    document.getElementById('appearanceOverlay').addEventListener('click', (e) => {
      if (e.target.id === 'appearanceOverlay') this.close();
    });
    document.getElementById('appTabRow').addEventListener('click', (e) => {
      const btn = e.target.closest('.app-tab-btn');
      if (!btn) return;
      this._tab = btn.dataset.tab;
      document.querySelectorAll('.app-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.renderContent();
    });
  },

  // ---- Open ----
  open() {
    const ov = document.getElementById('appearanceOverlay');
    if (ov) {
      ov.style.display = 'flex';
      this.renderContent();
    }
  },

  // ---- Close ----
  close() {
    const ov = document.getElementById('appearanceOverlay');
    if (ov) ov.style.display = 'none';
  },

  // ---- Render nội dung theo tab ----
  renderContent() {
    const el = document.getElementById('appearanceContent');
    if (!el) return;
    if (this._tab === 'customize') this._renderCustomize(el);
    else if (this._tab === 'presets') this._renderPresets(el);
    else if (this._tab === 'particle') this._renderParticle(el);
  },

  // ---- Refresh preview canvas ----
  refreshPreview() {
    if (this._tab !== 'customize') return;
    const c = document.getElementById('appPreviewCanvas');
    if (!c) return;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = '#0d0d1a';
    ctx.fillRect(0, 0, c.width, c.height);
    if (Sprites.player.down) {
      Sprites.drawPixelArt(ctx, Sprites.player.down, 4, (c.width - 64) / 2, (c.height - 64) / 2);
    }
  },

  // ---- Render mini skin preview ----
  _drawSkinPreview(canvas, skinId) {
    if (!canvas) return;
    const skin = APPEARANCE_CONFIG.presetSkins[skinId];
    if (!skin || !AppearanceSystem._originalSprites || !AppearanceSystem._originalSprites.down) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0d0d1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const colorMap = {
      '#3d2314': skin.hair,
      '#5a3825': AppearanceSystem.lighten(skin.hair, 0.15),
      '#ffe4c4': skin.skin,
      '#4169e1': skin.robe,
      '#6495ed': AppearanceSystem.lighten(skin.robe, 0.2),
      '#27408b': skin.robeDark,
      '#ffd700': skin.belt,
      '#daa520': AppearanceSystem.lighten(skin.belt, -0.1),
      '#1a1a1a': skin.eye
    };
    const mapped = AppearanceSystem._originalSprites.down.map(row =>
      row.map(cell => cell ? (colorMap[cell] || cell) : cell)
    );
    Sprites.drawPixelArt(ctx, mapped, 2, (canvas.width - 32) / 2, (canvas.height - 32) / 2);
  },

  // ---- Tab: Tùy Chỉnh ----
  _renderCustomize(el) {
    const parts = APPEARANCE_CONFIG.customizableParts;
    const cur = AppearanceSystem.state.currentColors;
    const colorLists = {
      hair: APPEARANCE_CONFIG.hairColors,
      skin: APPEARANCE_CONFIG.skinColors,
      robe: APPEARANCE_CONFIG.robeColors,
      robeDark: APPEARANCE_CONFIG.robeDarkColors,
      belt: APPEARANCE_CONFIG.beltColors,
      eye: APPEARANCE_CONFIG.eyeColors
    };

    let html = `
      <div style="text-align:center;margin-bottom:12px;">
        <canvas id="appPreviewCanvas" width="80" height="80"
                style="border:2px solid #f0c04066;border-radius:8px;background:#0d0d1a;"></canvas>
      </div>`;

    for (const [partKey, partCfg] of Object.entries(parts)) {
      const colors = colorLists[partKey] || [];
      html += `
        <div style="margin-bottom:10px;">
          <div style="color:#f0c040;font-family:'Courier New',monospace;font-size:11px;margin-bottom:5px;">
            ${partCfg.name}
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:5px;">
            ${colors.map(c => `
              <div class="app-color-circle ${cur[partKey] === c ? 'selected' : ''}"
                   style="background:${c};"
                   data-part="${partKey}" data-color="${c}"
                   title="${c}"></div>
            `).join('')}
          </div>
        </div>`;
    }

    html += `
      <div style="display:flex;gap:8px;margin-top:14px;">
        <button id="appBtnSave" style="flex:1;padding:8px;border-radius:8px;border:1px solid #4caf50;
                background:#4caf5022;color:#4caf50;cursor:pointer;font-family:'Courier New',monospace;font-size:12px;">
          💾 Lưu Preset
        </button>
        <button id="appBtnReset" style="flex:1;padding:8px;border-radius:8px;border:1px solid #f44336;
                background:#f4433622;color:#f44336;cursor:pointer;font-family:'Courier New',monospace;font-size:12px;">
          🔄 Mặc Định
        </button>
      </div>`;

    el.innerHTML = html;

    // Preview
    this.refreshPreview();

    // Color circle clicks
    el.addEventListener('click', (e) => {
      const circle = e.target.closest('.app-color-circle');
      if (!circle) return;
      const { part, color } = circle.dataset;
      AppearanceSystem.setPartColor(part, color);
      // Update selected state
      el.querySelectorAll(`.app-color-circle[data-part="${part}"]`).forEach(c => {
        c.classList.toggle('selected', c.dataset.color === color);
      });
      this.refreshPreview();
    });

    document.getElementById('appBtnSave').addEventListener('click', () => {
      if (typeof UI !== 'undefined') UI.addLog('💾 Đã lưu trang phục hiện tại!', 'system');
    });
    document.getElementById('appBtnReset').addEventListener('click', () => {
      AppearanceSystem.applySkin('default');
      this.renderContent();
    });
  },

  // ---- Tab: Trang Phục ----
  _renderPresets(el) {
    const skins = APPEARANCE_CONFIG.presetSkins;
    const unlocked = AppearanceSystem.state.unlockedSkins;
    const current = AppearanceSystem.state.currentSkin;

    const scrollCount = typeof Inventory !== 'undefined'
      ? (Inventory.items ? (Inventory.items['appearanceScroll'] || 0) : 0)
      : 0;

    let html = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px;">';

    for (const [skinId, skin] of Object.entries(skins)) {
      const isUnlocked = unlocked.includes(skinId);
      const isActive = current === skinId;
      const badge = skin.seasonal ? (skinId === 'tet2024' ? '🧧' : skinId === 'halloween' ? '🎃' : '❄️') : '';

      html += `
        <div class="app-skin-card ${isActive ? 'active' : ''} ${!isUnlocked ? 'locked' : ''}"
             data-skinid="${skinId}" title="${skin.name}">
          ${badge ? `<div style="position:absolute;top:3px;right:3px;font-size:10px;">${badge}</div>` : ''}
          <canvas class="app-skin-preview" data-skinid="${skinId}" width="48" height="48"
                  style="display:block;margin:0 auto 4px;border-radius:4px;"></canvas>
          <div style="font-family:'Courier New',monospace;font-size:9px;color:${isUnlocked ? '#f0c040' : '#666'};
                      white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
            ${!isUnlocked ? '🔒 ' : ''}${skin.name}
          </div>
        </div>`;
    }

    html += '</div>';
    html += `<div style="font-family:'Courier New',monospace;font-size:11px;color:#8ef;text-align:center;">
               📜 Phong Cách Thư trong túi: <b style="color:#f0c040;">${scrollCount}</b>
             </div>`;

    el.innerHTML = html;

    // Draw previews
    el.querySelectorAll('.app-skin-preview').forEach(canvas => {
      this._drawSkinPreview(canvas, canvas.dataset.skinid);
    });

    // Click on card
    el.querySelectorAll('.app-skin-card').forEach(card => {
      card.addEventListener('click', () => {
        const sid = card.dataset.skinid;
        if (!unlocked.includes(sid)) {
          if (typeof UI !== 'undefined') UI.addLog('🔒 Skin chưa mở khóa!', 'system');
          return;
        }
        AppearanceSystem.applySkin(sid);
        this.renderContent();
      });
    });
  },

  // ---- Tab: Hiệu Ứng ----
  _renderParticle(el) {
    const themes = APPEARANCE_CONFIG.particleThemes;
    const override = AppearanceSystem.state.particleThemeOverride;
    const isAuto = override === null;
    const currentRealm = typeof Player !== 'undefined' ? Player.realm : 0;
    const activeTheme = themes[isAuto ? currentRealm : override];

    let html = `
      <div style="margin-bottom:12px;">
        <div style="color:#f0c040;font-family:'Courier New',monospace;font-size:12px;margin-bottom:8px;">
          ✨ Theme Hiệu Ứng Di Chuyển
        </div>
        <div style="color:#8ef;font-family:'Courier New',monospace;font-size:11px;margin-bottom:8px;">
          Cảnh giới hiện tại: <b>${typeof REALMS !== 'undefined' ? REALMS[currentRealm].name : currentRealm}</b>
          → Theme: <b style="color:${activeTheme ? activeTheme.color : '#fff'}">
            ${activeTheme ? activeTheme.name : '—'}
          </b>
        </div>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
          <div style="color:#ccc;font-family:'Courier New',monospace;font-size:11px;">Tự động theo cảnh giới</div>
          <div id="appAutoToggle" style="width:40px;height:20px;border-radius:10px;cursor:pointer;
               background:${isAuto ? '#4caf50' : '#555'};transition:background 0.2s;position:relative;">
            <div style="width:16px;height:16px;border-radius:50%;background:#fff;position:absolute;
                        top:2px;transition:left 0.2s;left:${isAuto ? '22px' : '2px'};"></div>
          </div>
        </div>
      </div>`;

    if (!isAuto) {
      html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;">';
      for (const [id, theme] of Object.entries(themes)) {
        const tid = parseInt(id);
        const isSelected = override === tid;
        const isAvailable = typeof Player !== 'undefined' ? tid <= Player.realm : true;
        html += `
          <div data-themeid="${id}" style="padding:8px;border-radius:8px;text-align:center;cursor:pointer;
               border:2px solid ${isSelected ? theme.color : (isAvailable ? '#444' : '#222')};
               background:${isSelected ? theme.color + '22' : '#0d0d1a'};
               opacity:${isAvailable ? 1 : 0.4};">
            <div style="width:12px;height:12px;border-radius:50%;background:${theme.color};
                        margin:0 auto 4px;box-shadow:0 0 6px ${theme.color};"></div>
            <div style="font-family:'Courier New',monospace;font-size:9px;
                        color:${isSelected ? theme.color : '#aaa'};">${theme.name}</div>
          </div>`;
      }
      html += '</div>';
    }

    el.innerHTML = html;

    // Toggle auto
    document.getElementById('appAutoToggle').addEventListener('click', () => {
      AppearanceSystem.state.particleThemeOverride = isAuto ? 0 : null;
      this.renderContent();
    });

    // Theme select
    if (!isAuto) {
      el.querySelectorAll('[data-themeid]').forEach(div => {
        div.addEventListener('click', () => {
          const tid = parseInt(div.dataset.themeid);
          const isAvail = typeof Player !== 'undefined' ? tid <= Player.realm : true;
          if (!isAvail) {
            if (typeof UI !== 'undefined') UI.addLog('❌ Cần đạt cảnh giới cao hơn!', 'system');
            return;
          }
          AppearanceSystem.state.particleThemeOverride = tid;
          this.renderContent();
        });
      });
    }
  }
};

// ===========================================================
//  KHỞI ĐỘNG — AppearanceFeature
// ===========================================================

const AppearanceFeature = {

  init() {
    // 1. Lưu sprite gốc trước mọi thứ
    if (Sprites.player.down) {
      AppearanceSystem._originalSprites = {
        down:  JSON.parse(JSON.stringify(Sprites.player.down)),
        walk1: Sprites.player.walk1 ? JSON.parse(JSON.stringify(Sprites.player.walk1)) : null,
        walk2: Sprites.player.walk2 ? JSON.parse(JSON.stringify(Sprites.player.walk2)) : null
      };
    }

    // 2. Inject HTML panel
    AppearancePanel.injectHTML();
    AppearancePanel.setupEvents();

    // 3. Kiểm tra seasonal unlock
    AppearanceSystem.checkSeasonalUnlocks();

    // 4. Restore saved data (nếu có)
    this._loadSaved();

    // 5. Thêm nút vào character panel (nếu tồn tại)
    this._injectCharPanelBtn();

    console.log('👘 Appearance System loaded');
  },

  _loadSaved() {
    try {
      const raw = localStorage.getItem('appearance_data');
      if (raw) {
        const data = JSON.parse(raw);
        AppearanceSystem.loadSaveData(data);
      } else {
        // Apply default
        AppearanceSystem.applyColors(AppearanceSystem.state.currentColors);
      }
    } catch (e) {
      AppearanceSystem.applyColors(AppearanceSystem.state.currentColors);
    }
  },

  _saveToDisk() {
    try {
      localStorage.setItem('appearance_data', JSON.stringify(AppearanceSystem.getSaveData()));
    } catch (e) {}
  },

  _injectCharPanelBtn() {
    // Hook UI.renderCharacter để nút luôn xuất hiện sau mỗi lần render character panel
    if (typeof UI !== 'undefined' && typeof UI.renderCharacter === 'function') {
      const _origRenderChar = UI.renderCharacter.bind(UI);
      UI.renderCharacter = function () {
        _origRenderChar();
        // Xóa nút cũ (nếu có) rồi thêm lại để tránh duplicate
        const old = document.getElementById('appOpenBtn');
        if (old) old.remove();
        // Tìm đúng panel theo id thực tế trong HTML
        const panel = document.getElementById('characterPanel')
                   || document.getElementById('charPanel')
                   || document.querySelector('.char-panel');
        if (!panel) return;
        const btn = document.createElement('button');
        btn.id = 'appOpenBtn';
        btn.textContent = '👘 Ngoại Hình';
        btn.style.cssText = 'margin-top:10px;width:100%;padding:10px;border-radius:8px;'
          + 'border:2px solid #e040fb;background:#e040fb22;color:#e040fb;cursor:pointer;'
          + 'font-family:\'Courier New\',monospace;font-size:13px;font-weight:bold;'
          + 'letter-spacing:1px;';
        btn.addEventListener('click', () => AppearancePanel.open());
        panel.appendChild(btn);
      };
    } else {
      // Fallback: thử inject sau 1 giây nếu UI chưa sẵn
      setTimeout(() => this._injectCharPanelBtn(), 1000);
    }
  },

  // Gọi mỗi frame update
  update(dt) {
    ParticleThemeSystem.update(dt);
    // HUD border update (không cần mỗi frame, dùng modulo)
    if (typeof GameState !== 'undefined' && Math.floor(GameState.time / 200) % 2 === 0) {
      AvatarFrameSystem.updateHUDBorder();
    }
  }
};

// ===========================================================
//  WRAP / HOOK các hàm hiện có
// ===========================================================

(function hookAll() {

  // ---- Hook Game.init ----
  if (typeof Game !== 'undefined') {
    const _origGameInit = Game.init.bind(Game);
    Game.init = function () {
      _origGameInit();
      AppearanceFeature.init();
    };

    // ---- Hook Game.update ----
    const _origGameUpdate = Game.update.bind(Game);
    Game.update = function (dt) {
      _origGameUpdate(dt);
      AppearanceFeature.update(dt);
    };

    // ---- Hook Game.renderPlayer (aura) ----
    if (typeof Game.renderPlayer === 'function') {
      const _origRender = Game.renderPlayer.bind(Game);
      Game.renderPlayer = function () {
        _origRender();
        if (Game.ctx) AvatarFrameSystem.renderAura(Game.ctx);
      };
    } else {
      // Nếu renderPlayer nằm trong render loop, patch render thay thế
      const _origRender = Game.render ? Game.render.bind(Game) : null;
      if (_origRender) {
        Game.render = function () {
          _origRender();
          if (Game.ctx) AvatarFrameSystem.renderAura(Game.ctx);
        };
      }
    }

    // ---- Hook Game.save ----
    const _origSave = Game.save ? Game.save.bind(Game) : null;
    if (_origSave) {
      Game.save = function () {
        _origSave();
        AppearanceFeature._saveToDisk();
      };
    }

    // ---- Hook Game.load ----
    const _origLoad = Game.load ? Game.load.bind(Game) : null;
    if (_origLoad) {
      Game.load = function () {
        _origLoad();
        AppearanceFeature._loadSaved();
      };
    }
  }

  // ---- Hook Inventory.useItem ----
  if (typeof Inventory !== 'undefined' && typeof Inventory.useItem === 'function') {
    const _origUse = Inventory.useItem.bind(Inventory);
    Inventory.useItem = function (itemId, ...args) {
      const item = ITEMS[itemId];
      if (item && item.effect) {
        if (item.effect.unlockSkin) {
          const ok = Inventory.has ? Inventory.has(itemId, 1) : false;
          if (ok) {
            const unlocked = AppearanceSystem.rollRandomSkin();
            if (unlocked && Inventory.remove) Inventory.remove(itemId, 1);
            return;
          }
        }
      }
      return _origUse(itemId, ...args);
    };
  }

  // ---- Hook Enemies.kill (boss drop) ----
  if (typeof Enemies !== 'undefined' && typeof Enemies.kill === 'function') {
    const _origKill = Enemies.kill.bind(Enemies);
    Enemies.kill = function (enemy, ...args) {
      const result = _origKill(enemy, ...args);
      if (enemy && enemy.isBossEvent && Math.random() < 0.15) {
        if (typeof Inventory !== 'undefined' && Inventory.add) {
          Inventory.add('appearanceScroll', 1);
          if (typeof UI !== 'undefined') UI.addLog('📜 Boss rớt Phong Cách Thư!', 'item');
        }
      }
      return result;
    };
  }

  // ---- Hook Player.getSaveData / loadSaveData ----
  if (typeof Player !== 'undefined') {
    if (typeof Player.getSaveData === 'function') {
      const _origGet = Player.getSaveData.bind(Player);
      Player.getSaveData = function () {
        const data = _origGet();
        if (data) data.appearance = AppearanceSystem.getSaveData();
        return data;
      };
    }
    if (typeof Player.loadSaveData === 'function') {
      const _origLoad = Player.loadSaveData.bind(Player);
      Player.loadSaveData = function (data) {
        _origLoad(data);
        if (data && data.appearance) {
          AppearanceSystem.loadSaveData(data.appearance);
        }
      };
    }
  }

})();

console.log('👘 Appearance System loaded');
