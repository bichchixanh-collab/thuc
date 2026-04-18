// ==================== UI SYSTEM ====================
const UI = {
  activePanel: null,
  _charSubTab: 'character', // default tab khi mở panel Nhân Vật

  // Initialize UI
  init() {
    this.drawAllIcons();
    this.updateAll();
    this.setupEventListeners();
  },

  // Draw all pixel art icons
  drawAllIcons() {
    // Avatar
    const avCtx = document.getElementById('avatarCanvas').getContext('2d');
    avCtx.clearRect(0, 0, 32, 32);
    Sprites.drawPixelArt(avCtx, Sprites.player.down, 2, 0, 0);

    // Skill icons
    this.drawSkillIcon('skillIcon0', [
      [0, '#fff', '#fff', 0],
      ['#ccc', '#fff', '#fff', '#ccc'],
      ['#ccc', '#fff', '#fff', '#ccc'],
      [0, '#aaa', '#aaa', 0],
      ['#8b4513', '#a0522d', '#a0522d', '#8b4513']
    ], 5);
    this.drawSkillIcon('skillIcon1', [
      ['#87ceeb', 0, 0, '#87ceeb'],
      [0, '#87ceeb', '#87ceeb', 0],
      [0, '#87ceeb', '#87ceeb', 0],
      ['#4169e1', '#87ceeb', '#87ceeb', '#4169e1']
    ], 5);
    this.drawSkillIcon('skillIcon2', [
      ['#ffff00', '#ffff00', 0, 0],
      [0, '#ffff00', '#ffff00', 0],
      [0, 0, '#ffff00', '#ffff00'],
      ['#ffa500', '#ffff00', '#ffff00', '#ffa500']
    ], 5);
    this.drawSkillIcon('skillIcon3', [
      ['#ff00ff', 0, 0, '#ff00ff'],
      [0, '#ff69b4', '#ff69b4', 0],
      ['#ff00ff', '#ff69b4', '#ff69b4', '#ff00ff'],
      [0, '#ff00ff', '#ff00ff', 0]
    ], 5);

    // Menu icons
    this.drawMenuIcon('iconQuest', [
      ['#f0c040', '#f0c040', '#f0c040', '#f0c040'],
      ['#f0c040', '#1a1a2e', '#1a1a2e', '#f0c040'],
      ['#f0c040', '#1a1a2e', '#1a1a2e', '#f0c040'],
      ['#f0c040', '#f0c040', '#f0c040', '#f0c040']
    ], 4);
    this.drawMenuIcon('iconMap', [
      ['#228b22', '#32cd32', '#4169e1', '#228b22'],
      ['#32cd32', '#ffd700', '#4169e1', '#32cd32'],
      ['#228b22', '#32cd32', '#228b22', '#32cd32'],
      ['#8b4513', '#228b22', '#32cd32', '#8b4513']
    ], 4);
    this.drawMenuIcon('iconBag', [
      [0, '#8b4513', '#8b4513', 0],
      ['#8b4513', '#a0522d', '#a0522d', '#8b4513'],
      ['#8b4513', '#a0522d', '#a0522d', '#8b4513'],
      [0, '#8b4513', '#8b4513', 0]
    ], 4);
    this.drawMenuIcon('iconChar', [
      [0, '#ffe4c4', '#ffe4c4', 0],
      ['#ffe4c4', '#1a1a1a', '#1a1a1a', '#ffe4c4'],
      [0, '#4169e1', '#4169e1', 0],
      ['#4169e1', '#4169e1', '#4169e1', '#4169e1']
    ], 4);

    // Update MP costs
    document.getElementById('mpCost1').textContent = Player.skills[1].mp;
    document.getElementById('mpCost2').textContent = Player.skills[2].mp;
    document.getElementById('mpCost3').textContent = Player.skills[3].mp;
  },

  // Draw skill icon
  drawSkillIcon(canvasId, data, scale) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 24, 24);
    Sprites.drawPixelArt(ctx, data, scale, 0, 0);
  },

  // Draw menu icon
  drawMenuIcon(canvasId, data, scale) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 16, 16);
    Sprites.drawPixelArt(ctx, data, scale, 0, 0);
  },

  // Update all UI elements
  updateAll() {
    this.updateStats();
    this.updateGold();
    this.updateSkillUI();
    this.updateRealmTitle();
    Quests.updateUI();
  },

  // Update HP/MP/EXP bars
  updateStats() {
    const hpPct = (Player.hp / Player.maxHp * 100).toFixed(0);
    document.getElementById('hpBar').style.width = hpPct + '%';
    document.getElementById('hpText').textContent = `${Player.hp}/${Player.maxHp}`;
    const mpPct = (Player.mp / Player.maxMp * 100).toFixed(0);
    document.getElementById('mpBar').style.width = mpPct + '%';
    document.getElementById('mpText').textContent = `${Player.mp}/${Player.maxMp}`;
    const expPct = (Player.exp / Player.maxExp * 100).toFixed(0);
    document.getElementById('expBar').style.width = expPct + '%';
    document.getElementById('expText').textContent = `${Player.exp}/${Player.maxExp}`;
  },

  // Update gold display
  updateGold() {
    document.getElementById('goldAmount').textContent = Utils.formatNumber(Player.gold);
  },

  // Update skill UI (cooldowns)
  updateSkillUI() {
    for (let i = 0; i < Player.skills.length; i++) {
      const skill = Player.skills[i];
      const cdEl = document.getElementById('skillCd' + i);
      if (!cdEl) continue;
      if (skill.cd > 0) {
        cdEl.style.display = 'flex';
        cdEl.textContent = Math.ceil(skill.cd / 1000);
      } else {
        cdEl.style.display = 'none';
      }
    }
  },

  // Update realm title
  updateRealmTitle() {
    const realm = REALMS[Player.realm];
    document.getElementById('realmTitle').textContent = `▸ ${realm.name} - Tầng ${Player.realmStage}`;
    document.getElementById('levelBadge').textContent = `Lv.${Player.level}`;
  },

  // Update target info
  updateTargetInfo() {
    if (!Player.target || !Player.target.alive) {
      this.hideTargetInfo();
      return;
    }
    const target = Player.target;
    const ti = document.getElementById('targetInfo');
    ti.style.display = 'flex';
    ti.className = target.boss ? 'boss' : '';
    document.getElementById('targetName').textContent = target.name;
    document.getElementById('targetLevel').textContent = `Lv.${target.level}`;
    document.getElementById('targetHpFill').style.width = (target.hp / target.maxHp * 100) + '%';
  },

  // Hide target info
  hideTargetInfo() {
    document.getElementById('targetInfo').style.display = 'none';
  },

  // Add combat log message
  addLog(text, type = 'system') {
    const log = document.getElementById('combatLog');
    const msg = document.createElement('div');
    msg.className = `log-msg ${type}`;
    msg.textContent = text;
    log.appendChild(msg);
    while (log.children.length > 10) {
      log.removeChild(log.firstChild);
    }
    setTimeout(() => {
      if (msg.parentNode) msg.remove();
    }, 5000);
  },

  // Show notification
  showNotification(title, subtitle = '') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.innerHTML = `<div class="notif-title">${title}</div>${subtitle ? `<div class="notif-sub">${subtitle}</div>` : ''}`;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 2500);
  },

  // Open panel
  openPanel(name) {
    if (this.activePanel === name) {
      this.closePanel(name);
      return;
    }
    if (this.activePanel) {
      this.closePanel(this.activePanel);
    }
    const panel = document.getElementById(name + 'Panel');
    if (panel) {
      panel.classList.add('show');
      this.activePanel = name;
      switch (name) {
        case 'inventory': Inventory.render(); break;
        case 'character':
          this._charSubTab = 'character'; // reset về tab mặc định
          this.renderCharacter();
          break;
        case 'map': Maps.render(); break;
        case 'quest': Quests.render('active'); break;
      }
    }
  },

  // Close panel
  closePanel(name) {
    const panel = document.getElementById(name + 'Panel');
    if (panel) {
      panel.classList.remove('show');
    }
    if (this.activePanel === name) {
      this.activePanel = null;
    }
    Inventory.hideTooltip();
  },

  // ================================================================
  //  RENDER CHARACTER PANEL — 6-tab system
  //  Tabs: Nhân Vật | Linh Thú | Tu Luyện | Huyết Mạch | Ngoại Hình | Pháp Bảo
  // ================================================================
  renderCharacter() {
    const panel = document.getElementById('characterPanel');
    if (!panel) return;

    // Lấy container nội dung (charStats + equippedItems đã có sẵn trong HTML)
    // Ta sẽ render toàn bộ nội dung vào charStats, bỏ qua equippedItems cũ
    const charStats = document.getElementById('charStats');
    const equippedEl = document.getElementById('equippedItems');
    if (!charStats) return;

    // Cập nhật header realm (vẫn hiển thị phía trên)
    const realm = REALMS[Player.realm];
    const charRealmEl = document.getElementById('charRealm');
    if (charRealmEl) charRealmEl.textContent = `🌟 ${realm.name} - Tầng ${Player.realmStage}`;
    const realmBarEl = document.getElementById('realmBar');
    if (realmBarEl) realmBarEl.style.width = (Player.realmExp / Player.realmMaxExp * 100) + '%';
    const realmTextEl = document.getElementById('realmText');
    if (realmTextEl) realmTextEl.textContent = `${Player.realmExp}/${Player.realmMaxExp}`;

    // Ẩn equippedItems gốc — tab Pháp Bảo sẽ tự render
    if (equippedEl) equippedEl.innerHTML = '';

    // ── Inject CSS tab một lần ──
    if (!document.getElementById('char-tab-style')) {
      const style = document.createElement('style');
      style.id = 'char-tab-style';
      style.textContent = `
        .char-tab-bar {
          display: flex;
          gap: 2px;
          margin-bottom: 10px;
          flex-wrap: wrap;
        }
        .char-tab-btn {
          flex: 1;
          min-width: 0;
          padding: 5px 2px;
          font-size: 10px;
          font-family: 'Courier New', monospace;
          font-weight: bold;
          color: #aaa;
          background: #0f0f1e;
          border: 1px solid #333;
          border-bottom: none;
          cursor: pointer;
          border-radius: 4px 4px 0 0;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: background 0.15s, color 0.15s;
        }
        .char-tab-btn:hover {
          background: #1a1a3a;
          color: #e0e0e0;
        }
        .char-tab-btn.active {
          background: #1a1a2e;
          color: #f0c040;
          border-color: #f0c040;
          border-bottom: 2px solid #f0c040;
        }
        .char-tab-content {
          animation: charTabFadeIn 0.18s ease;
        }
        @keyframes charTabFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .char-stat-group {
          margin-bottom: 8px;
        }
        .char-stat-group-title {
          font-size: 10px;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 4px;
          border-bottom: 1px solid #222;
          padding-bottom: 2px;
        }
        .char-stat-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 3px 0;
          font-size: 11px;
          color: #e0e0e0;
          border-bottom: 1px solid #111;
        }
        .char-stat-row:last-child { border-bottom: none; }
        .char-stat-val {
          color: #f0c040;
          font-weight: bold;
        }
        .char-stat-bonus {
          font-size: 9px;
          color: #4caf50;
          margin-left: 4px;
        }
        /* Pet section */
        .char-pet-box {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #0f0f1e;
          border: 1px solid #333;
          border-radius: 6px;
          padding: 8px;
          margin-bottom: 8px;
        }
        .char-pet-name {
          font-size: 12px;
          font-weight: bold;
          color: #f0c040;
        }
        .char-pet-bonus { font-size: 10px; color: #4caf50; }
        .char-pet-actions { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; }
        .char-pet-btn {
          padding: 3px 8px;
          font-size: 10px;
          font-family: 'Courier New', monospace;
          border-radius: 4px;
          cursor: pointer;
          border: 1px solid #555;
          background: #1a1a2e;
          color: #e0e0e0;
          transition: background 0.15s;
        }
        .char-pet-btn:hover { background: #2a2a4e; }
        .char-pet-btn.active-pet { border-color: #f0c040; color: #f0c040; }
        .char-pet-btn.dismiss-btn { border-color: #ef5350; color: #ef5350; }
        .char-pet-btn.dismiss-btn:hover { background: #1a0a0a; }
        /* Cultivation/Fate */
        .char-method-card {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          background: #0f0f1e;
          border: 1px solid #333;
          border-radius: 6px;
          padding: 8px;
          margin-bottom: 6px;
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s;
        }
        .char-method-card:hover { background: #1a1a2e; }
        .char-method-card.selected { border-color: #f0c040; background: #1a1a1e; }
        .char-method-icon { font-size: 20px; }
        .char-method-name { font-size: 12px; font-weight: bold; color: #f0c040; }
        .char-method-desc { font-size: 10px; color: #aaa; margin-top: 2px; }
        .char-method-cost { font-size: 9px; color: #ff9800; margin-top: 2px; }
        .char-fate-tag {
          display: inline-block;
          padding: 2px 7px;
          border-radius: 10px;
          font-size: 10px;
          font-weight: bold;
          margin: 2px;
        }
        .char-fate-tag.common { background: #1a2a1a; border: 1px solid #4caf50; color: #4caf50; }
        .char-fate-tag.rare   { background: #1a1a3a; border: 1px solid #7c4dff; color: #ce93d8; }
        /* Bloodline */
        .char-bloodline-card {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          border-radius: 6px;
          margin-bottom: 8px;
          border: 1px solid #333;
        }
        .char-bloodline-icon { font-size: 28px; }
        .char-bloodline-name { font-size: 13px; font-weight: bold; }
        .char-bloodline-desc { font-size: 10px; color: #aaa; margin-top: 3px; }
        /* Appearance color palette */
        .char-color-row {
          margin-bottom: 8px;
        }
        .char-color-label {
          font-size: 10px;
          color: #888;
          margin-bottom: 3px;
        }
        .char-color-swatches {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }
        .char-color-swatch {
          width: 18px;
          height: 18px;
          border-radius: 3px;
          cursor: pointer;
          border: 2px solid transparent;
          transition: border-color 0.1s, transform 0.1s;
        }
        .char-color-swatch:hover { transform: scale(1.2); }
        .char-color-swatch.selected { border-color: #f0c040; }
        .char-skin-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          margin-top: 6px;
        }
        .char-skin-btn {
          padding: 4px 8px;
          font-size: 10px;
          font-family: 'Courier New', monospace;
          border-radius: 4px;
          cursor: pointer;
          border: 1px solid #444;
          background: #1a1a2e;
          color: #e0e0e0;
          transition: background 0.15s, border-color 0.15s;
        }
        .char-skin-btn:hover { background: #2a2a4e; }
        .char-skin-btn.active { border-color: #f0c040; color: #f0c040; }
        .char-skin-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        /* Pháp Bảo / Equipment */
        .char-equip-slot {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 8px;
          background: #0f0f1e;
          border: 1px solid #333;
          border-radius: 5px;
          margin-bottom: 6px;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
        }
        .char-equip-slot:hover { background: #1a1a2e; border-color: #555; }
        .char-equip-slot-info { display: flex; flex-direction: column; }
        .char-equip-slot-name { font-size: 11px; color: #f0c040; font-weight: bold; }
        .char-equip-slot-item { font-size: 10px; color: #e0e0e0; }
        .char-equip-slot-enhance { font-size: 9px; color: #ff9800; }
        .char-equip-slot-empty { font-size: 10px; color: #555; font-style: italic; }
        .char-unequip-btn {
          font-size: 10px;
          padding: 2px 7px;
          border-radius: 4px;
          border: 1px solid #ef5350;
          color: #ef5350;
          background: transparent;
          cursor: pointer;
          font-family: 'Courier New', monospace;
          transition: background 0.15s;
        }
        .char-unequip-btn:hover { background: #1a0a0a; }
        .char-section-sep {
          border: none;
          border-top: 1px solid #222;
          margin: 10px 0;
        }
        .char-section-title {
          font-size: 10px;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 6px;
        }
      `;
      document.head.appendChild(style);
    }

    // ── Xây dựng Tab Bar ──
    charStats.innerHTML = '';

    const tabs = [
      { id: 'character',  label: '👤 Nhân Vật' },
      { id: 'pet',        label: '🐾 Linh Thú' },
      { id: 'cultivation',label: '📖 Tu Luyện' },
      { id: 'bloodline',  label: '🩸 Huyết Mạch' },
      { id: 'appearance', label: '🎨 Ngoại Hình' },
      { id: 'equipment',  label: '⚒️ Pháp Bảo' },
    ];

    const tabBar = document.createElement('div');
    tabBar.className = 'char-tab-bar';

    tabs.forEach(tab => {
      const btn = document.createElement('button');
      btn.className = 'char-tab-btn' + (this._charSubTab === tab.id ? ' active' : '');
      btn.textContent = tab.label;
      btn.onclick = () => {
        this._charSubTab = tab.id;
        this.renderCharacter();
      };
      tabBar.appendChild(btn);
    });

    charStats.appendChild(tabBar);

    // ── Content container ──
    const content = document.createElement('div');
    content.className = 'char-tab-content';
    charStats.appendChild(content);

    // ── Render từng tab ──
    switch (this._charSubTab) {
      case 'character':   this._renderTabCharacter(content);   break;
      case 'pet':         this._renderTabPet(content);         break;
      case 'cultivation': this._renderTabCultivation(content); break;
      case 'bloodline':   this._renderTabBloodline(content);   break;
      case 'appearance':  this._renderTabAppearance(content);  break;
      case 'equipment':   this._renderTabEquipment(content);   break;
    }
  },

  // ================================================================
  //  TAB 1 — NHÂN VẬT: chỉ số cơ bản
  // ================================================================
  _renderTabCharacter(container) {
    const realm = REALMS[Player.realm];

    // Helper stat row
    const row = (icon, label, val, bonus) => {
      const d = document.createElement('div');
      d.className = 'char-stat-row';
      d.innerHTML = `
        <span>${icon} ${label}</span>
        <span>
          <span class="char-stat-val">${val}</span>
          ${bonus ? `<span class="char-stat-bonus">${bonus}</span>` : ''}
        </span>
      `;
      return d;
    };

    // Nhóm: Chiến đấu
    const combatGroup = document.createElement('div');
    combatGroup.className = 'char-stat-group';
    combatGroup.innerHTML = '<div class="char-stat-group-title">⚔️ Chiến Đấu</div>';

    const petAtk = (Player.activePet && PETS[Player.activePet]?.bonus.atk) ? `+${PETS[Player.activePet].bonus.atk}` : null;
    const petDef = (Player.activePet && PETS[Player.activePet]?.bonus.def) ? `+${PETS[Player.activePet].bonus.def}` : null;
    const petSpd = (Player.activePet && PETS[Player.activePet]?.bonus.speed) ? '+10%' : null;

    combatGroup.appendChild(row('⚔️', 'Công Kích',   Player.atk,                          petAtk));
    combatGroup.appendChild(row('🛡️', 'Phòng Ngự',   Player.def,                          petDef));
    combatGroup.appendChild(row('💥', 'Bạo Kích',    `${(Player.critRate * 100).toFixed(1)}%`,  null));
    combatGroup.appendChild(row('🔥', 'Bạo Thương',  `${(Player.critDmg * 100).toFixed(0)}%`,   null));
    combatGroup.appendChild(row('💨', 'Tốc Độ',      Player.speed.toFixed(1),             petSpd));
    container.appendChild(combatGroup);

    // Nhóm: Sinh tồn
    const surviveGroup = document.createElement('div');
    surviveGroup.className = 'char-stat-group';
    surviveGroup.innerHTML = '<div class="char-stat-group-title">❤️ Sinh Tồn</div>';
    surviveGroup.appendChild(row('❤️', 'Sinh Mệnh',  `${Player.hp}/${Player.maxHp}`,  null));
    surviveGroup.appendChild(row('💎', 'Linh Lực',   `${Player.mp}/${Player.maxMp}`,  null));
    container.appendChild(surviveGroup);

    // Nhóm: Tiến triển
    const progressGroup = document.createElement('div');
    progressGroup.className = 'char-stat-group';
    progressGroup.innerHTML = '<div class="char-stat-group-title">📊 Tiến Triển</div>';
    progressGroup.appendChild(row('📊', 'Level',    Player.level,                              null));
    progressGroup.appendChild(row('⭐', 'EXP',      `${Player.exp}/${Player.maxExp}`,          null));
    progressGroup.appendChild(row('💰', 'Vàng',     Utils.formatNumber(Player.gold),           null));
    container.appendChild(progressGroup);

    // Cảnh giới info
    const realmDiv = document.createElement('div');
    realmDiv.style.cssText = 'margin-top:8px; padding:8px; background:#0f0f1e; border:1px solid #333; border-radius:6px; font-size:10px; color:#aaa; text-align:center;';
    realmDiv.innerHTML = `
      <div style="color:#f0c040; font-weight:bold; margin-bottom:4px;">🌟 ${realm.name} - Tầng ${Player.realmStage}</div>
      <div>Tu Vi: ${Player.realmExp} / ${Player.realmMaxExp}</div>
      <div style="margin-top:4px; height:5px; background:#111; border-radius:3px; border:1px solid #333; overflow:hidden;">
        <div style="height:100%; width:${(Player.realmExp/Player.realmMaxExp*100).toFixed(1)}%; background:linear-gradient(90deg,#7c4dff,#f0c040); border-radius:3px;"></div>
      </div>
    `;
    container.appendChild(realmDiv);

    // Tâm Pháp nhỏ (badge)
    if (typeof CultivationMethodSystem !== 'undefined' && CultivationMethodSystem.state.chosen) {
      const m = CULTIVATION_METHOD_CONFIG.methods[CultivationMethodSystem.state.method];
      const badge = document.createElement('div');
      badge.style.cssText = `margin-top:6px; padding:4px 8px; background:#0f0f1e; border:1px solid ${m.color}; border-radius:4px; display:flex; align-items:center; gap:6px; font-size:10px;`;
      badge.innerHTML = `<span>${m.icon}</span><span style="color:${m.color}; font-weight:bold;">${m.name}</span><span style="color:#888; font-size:9px;">— ${m.desc.substring(0, 40)}...</span>`;
      container.appendChild(badge);
    }

    // Huyết Mạch badge
    if (typeof BloodlineSystem !== 'undefined' && BloodlineSystem.state.chosen) {
      const bl = BloodlineSystem.getBloodline();
      const badge = document.createElement('div');
      badge.style.cssText = `margin-top:4px; padding:4px 8px; background:#0f0f1e; border:1px solid ${bl.color}; border-radius:4px; display:flex; align-items:center; gap:6px; font-size:10px;`;
      badge.innerHTML = `<span>${bl.icon}</span><span style="color:${bl.glowColor}; font-weight:bold;">${bl.name}</span><span style="color:#888; font-size:9px;">Huyết Mạch Thức Tỉnh</span>`;
      container.appendChild(badge);
    }
  },

  // ================================================================
  //  TAB 2 — LINH THÚ
  // ================================================================
  _renderTabPet(container) {
    // Header thông tin pet active
    if (Player.activePet && PETS[Player.activePet]) {
      const pet = PETS[Player.activePet];
      const petBox = document.createElement('div');
      petBox.className = 'char-pet-box';

      // Canvas sprite
      const canvasWrap = document.createElement('div');
      const petCanvas = document.createElement('canvas');
      petCanvas.id = 'charPetCanvas';
      petCanvas.width = 16; petCanvas.height = 16;
      petCanvas.style.cssText = 'image-rendering:pixelated; width:32px; height:32px;';
      canvasWrap.appendChild(petCanvas);
      petBox.appendChild(canvasWrap);

      // Info
      let bonusText = '';
      if (pet.bonus.atk)   bonusText = `⚔️ +${pet.bonus.atk} ATK`;
      else if (pet.bonus.def)   bonusText = `🛡️ +${pet.bonus.def} DEF`;
      else if (pet.bonus.speed) bonusText = `💨 +10% Speed`;

      const info = document.createElement('div');
      info.style.flex = '1';
      info.innerHTML = `
        <div class="char-pet-name">🐾 ${pet.name}</div>
        <div class="char-pet-bonus">${bonusText}</div>
        <div style="font-size:9px; color:#888; margin-top:2px;">+10% EXP khi mang theo</div>
      `;
      petBox.appendChild(info);
      container.appendChild(petBox);

      // Draw sprite
      setTimeout(() => {
        const c = document.getElementById('charPetCanvas');
        if (c && Player.activePet) {
          const ctx = c.getContext('2d');
          ctx.clearRect(0, 0, 16, 16);
          const sprite = Sprites.getPetSprite(Player.activePet, false);
          Sprites.drawPixelArt(ctx, sprite, 2, 0, 0);
        }
      }, 10);

      // EXP bar (PetLevelSystem sẽ inject vào đây qua hook)
      // Giữ lại element để hook tìm được
    }

    // Danh sách pet đang sở hữu
    if (Player.ownedPets && Player.ownedPets.length > 0) {
      const listTitle = document.createElement('div');
      listTitle.className = 'char-section-title';
      listTitle.textContent = Player.activePet ? '🔄 Đổi Linh Thú' : '🐾 Chọn Linh Thú';
      container.appendChild(listTitle);

      const actions = document.createElement('div');
      actions.className = 'char-pet-actions';

      Player.ownedPets.forEach(pId => {
        const p = PETS[pId];
        const isActive = pId === Player.activePet;
        const btn = document.createElement('button');
        btn.className = 'char-pet-btn' + (isActive ? ' active-pet' : '');
        btn.textContent = (isActive ? '✅ ' : '') + p.name;
        btn.onclick = () => {
          Player.activePet = pId;
          Player.recalculateStats();
          this.renderCharacter();
        };
        actions.appendChild(btn);
      });

      if (Player.activePet) {
        const dismissBtn = document.createElement('button');
        dismissBtn.className = 'char-pet-btn dismiss-btn';
        dismissBtn.textContent = '❌ Thu Hồi';
        dismissBtn.onclick = () => {
          Player.activePet = null;
          Player.recalculateStats();
          this.renderCharacter();
        };
        actions.appendChild(dismissBtn);
      }

      container.appendChild(actions);
    } else {
      const empty = document.createElement('div');
      empty.style.cssText = 'color:#555; font-size:11px; text-align:center; padding:20px 0;';
      empty.textContent = '🐾 Chưa có Linh Thú. Mua từ NPC Shop!';
      container.appendChild(empty);
    }

    // PetLevelSystem hook sẽ tự append EXP bar vào đây
    // (hook tìm #charPetCanvas rồi leo lên parentElement)
  },

  // ================================================================
  //  TAB 3 — TU LUYỆN: Tâm Pháp + Thiên Mệnh
  // ================================================================
  _renderTabCultivation(container) {
    // --- Phần Tâm Pháp ---
    const methodTitle = document.createElement('div');
    methodTitle.className = 'char-section-title';
    methodTitle.textContent = '📖 Tâm Pháp Tu Luyện';
    container.appendChild(methodTitle);

    if (typeof CultivationMethodSystem === 'undefined') {
      container.innerHTML += '<div style="color:#555;font-size:11px;text-align:center;padding:10px;">Chưa có hệ thống Tâm Pháp.</div>';
    } else {
      const methods = CULTIVATION_METHOD_CONFIG.methods;
      Object.keys(methods).forEach(mId => {
        const m = methods[mId];
        const isChosen = CultivationMethodSystem.state.method === mId;
        const card = document.createElement('div');
        card.className = 'char-method-card' + (isChosen ? ' selected' : '');
        card.style.borderColor = isChosen ? m.color : '#333';

        let costHtml = '';
        if (CultivationMethodSystem.state.chosen && !isChosen) {
          costHtml = `<div class="char-method-cost">⚗️ Cần: Tâm Pháp Hoán Đổi Đan (có: ${(typeof Inventory !== 'undefined' ? Inventory.getCount('methodPill') : 0)})</div>`;
        }

        card.innerHTML = `
          <div class="char-method-icon">${m.icon}</div>
          <div style="flex:1;">
            <div class="char-method-name" style="color:${m.color};">${m.name} ${isChosen ? '✅' : ''}</div>
            <div class="char-method-desc">${m.desc}</div>
            ${costHtml}
          </div>
        `;
        card.onclick = () => {
          if (!isChosen) CultivationMethodSystem.choose(mId);
        };
        container.appendChild(card);
      });
    }

    // --- Separator ---
    const sep = document.createElement('hr');
    sep.className = 'char-section-sep';
    container.appendChild(sep);

    // --- Phần Thiên Mệnh ---
    const fateTitle = document.createElement('div');
    fateTitle.className = 'char-section-title';
    fateTitle.textContent = '🌠 Thiên Mệnh';
    container.appendChild(fateTitle);

    if (typeof FateSystem === 'undefined') {
      const noFate = document.createElement('div');
      noFate.style.cssText = 'color:#555; font-size:11px; text-align:center; padding:10px 0;';
      noFate.textContent = 'Chưa có dữ liệu Thiên Mệnh.';
      container.appendChild(noFate);
    } else {
      const fates = FateSystem.state ? FateSystem.state.chosen : (Player._fates || []);
      if (!fates || fates.length === 0) {
        // Chưa roll
        const noRollDiv = document.createElement('div');
        noRollDiv.style.cssText = 'color:#aaa; font-size:11px; text-align:center; padding:8px 0;';
        noRollDiv.textContent = '✨ Chưa có Thiên Mệnh. Lên đủ cấp để kích hoạt!';
        container.appendChild(noRollDiv);
      } else {
        // Hiển thị các fate đã chọn
        const fateWrap = document.createElement('div');
        fateWrap.style.cssText = 'display:flex; flex-wrap:wrap; gap:4px;';
        fates.forEach(fate => {
          const fCfg = FATE_CONFIG.pool.find(f => f.id === fate);
          if (!fCfg) return;
          const tag = document.createElement('span');
          tag.className = `char-fate-tag ${fCfg.rarity}`;
          tag.title = fCfg.desc;
          tag.textContent = fCfg.name;
          fateWrap.appendChild(tag);
        });
        container.appendChild(fateWrap);

        // Mô tả chi tiết
        fates.forEach(fate => {
          const fCfg = FATE_CONFIG.pool.find(f => f.id === fate);
          if (!fCfg) return;
          const descRow = document.createElement('div');
          descRow.style.cssText = 'font-size:10px; color:#aaa; padding:3px 0 3px 6px; border-left:2px solid #333; margin-top:4px;';
          descRow.innerHTML = `<span style="color:#e0e0e0;">${fCfg.name}</span>: ${fCfg.desc}`;
          container.appendChild(descRow);
        });
      }

      // Nút reroll nếu FateSystem có UI
      if (typeof FateSystem.reroll === 'function') {
        const scrollCount = typeof Inventory !== 'undefined' ? Inventory.getCount('fateScroll') : 0;
        const rerollBtn = document.createElement('button');
        rerollBtn.style.cssText = `
          margin-top:8px; width:100%; padding:7px;
          font-family:'Courier New',monospace; font-size:11px; font-weight:bold;
          border-radius:5px; cursor:pointer;
          border:1px solid #7c4dff; background:#1a1a3a; color:#ce93d8;
          transition:background 0.15s;
        `;
        rerollBtn.textContent = `🌀 Reroll Thiên Mệnh (Vận Mệnh Thư: ${scrollCount})`;
        rerollBtn.onclick = () => FateSystem.reroll();
        container.appendChild(rerollBtn);
      }
    }
  },

  // ================================================================
  //  TAB 4 — HUYẾT MẠCH
  // ================================================================
  _renderTabBloodline(container) {
    if (typeof BloodlineSystem === 'undefined') {
      const nobl = document.createElement('div');
      nobl.style.cssText = 'color:#555; font-size:11px; text-align:center; padding:20px 0;';
      nobl.textContent = 'Hệ thống Huyết Mạch chưa được tải.';
      container.appendChild(nobl);
      return;
    }

    if (!BloodlineSystem.state.chosen) {
      // Chưa chọn huyết mạch
      const realm = REALMS[Player.realm];
      const requireRealm = BLOODLINE_CONFIG.requireRealm;
      const requireRealmName = REALMS[requireRealm] ? REALMS[requireRealm].name : `Cảnh giới ${requireRealm}`;

      const lockDiv = document.createElement('div');
      lockDiv.style.cssText = 'text-align:center; padding:20px 10px;';

      if (Player.realm < requireRealm) {
        lockDiv.innerHTML = `
          <div style="font-size:30px; margin-bottom:10px;">🔒</div>
          <div style="color:#f0c040; font-size:13px; font-weight:bold; margin-bottom:6px;">Huyết Mạch Chưa Thức Tỉnh</div>
          <div style="color:#aaa; font-size:11px; line-height:1.6;">
            Đạt <span style="color:#ce93d8;">${requireRealmName}</span> để kích hoạt Huyết Mạch.<br>
            Cảnh giới hiện tại: <span style="color:#f0c040;">${realm.name}</span>
          </div>
        `;
      } else {
        lockDiv.innerHTML = `
          <div style="font-size:30px; margin-bottom:10px;">🩸</div>
          <div style="color:#f0c040; font-size:13px; font-weight:bold; margin-bottom:6px;">Huyết Mạch Sẵn Sàng Thức Tỉnh!</div>
          <div style="color:#aaa; font-size:11px;">Cửa sổ chọn Huyết Mạch sẽ tự động xuất hiện.</div>
        `;
        // Trigger panel nếu chưa hiện
        if (typeof BloodlinePanel !== 'undefined' && !BloodlinePanel.shown) {
          BloodlinePanel.show();
        }
      }
      container.appendChild(lockDiv);
    } else {
      // Đã có huyết mạch
      const bl = BloodlineSystem.getBloodline();
      const card = document.createElement('div');
      card.className = 'char-bloodline-card';
      card.style.cssText = `
        background: linear-gradient(135deg, #0f0f1e 60%, ${bl.color}22);
        border-color: ${bl.color};
        display: flex; align-items: flex-start; gap: 12px;
        padding: 12px; border-radius: 8px; margin-bottom: 10px;
      `;
      card.innerHTML = `
        <div style="font-size:36px; filter:drop-shadow(0 0 8px ${bl.glowColor});">${bl.icon}</div>
        <div style="flex:1;">
          <div style="font-size:15px; font-weight:bold; color:${bl.glowColor}; text-shadow:0 0 6px ${bl.glowColor};">${bl.name}</div>
          <div style="font-size:10px; color:#aaa; margin-top:4px; line-height:1.6;">${bl.desc}</div>
        </div>
      `;
      container.appendChild(card);

      // Passives detail
      const passTitle = document.createElement('div');
      passTitle.className = 'char-section-title';
      passTitle.textContent = '✨ Hiệu Ứng Passive';
      container.appendChild(passTitle);

      const passives = bl.passives;
      Object.keys(passives).forEach(key => {
        const val = passives[key];
        const row = document.createElement('div');
        row.style.cssText = 'font-size:10px; color:#aaa; padding:3px 0 3px 8px; border-left:2px solid ' + bl.color + '; margin-bottom:4px;';

        // Map key → mô tả thân thiện
        const passiveLabels = {
          immuneFreeze: '❄️ Miễn nhiễm đóng băng',
          fireSkillBonus: `🔥 Hỏa Skill +${Math.round(val * 100)}% damage`,
          killHealInterval: `💊 Cứ ${val} kill hồi HP`,
          killHealPct: `💊 Hồi ${Math.round(val * 100)}% HP/lần`,
          reviveHpPct: `💀 Hồi sinh với ${Math.round(val * 100)}% HP`,
          petStatMul: `🐾 Pet/Thần Thú stat x${val}`,
          autoSummonInCombat: '🐾 Tự triệu hồi trong chiến đấu',
          lowHpDmgBonus: '🌑 HP thấp → Damage tăng',
          invisibleIdleTime: `👁️ Đứng yên ${val / 1000}s → Ẩn thân`,
        };

        if (passiveLabels[key]) {
          row.textContent = passiveLabels[key];
          container.appendChild(row);
        }
      });

      // Karma info nếu có
      if (typeof KarmaSystem !== 'undefined') {
        const sep = document.createElement('hr');
        sep.className = 'char-section-sep';
        container.appendChild(sep);

        const kTitle = document.createElement('div');
        kTitle.className = 'char-section-title';
        kTitle.textContent = '⚖️ Nghiệp Lực (Karma)';
        container.appendChild(kTitle);

        const tier = KarmaSystem.getTier ? KarmaSystem.getTier() : null;
        if (tier) {
          const kRow = document.createElement('div');
          kRow.style.cssText = `display:flex; justify-content:space-between; font-size:11px; padding:5px 0;`;
          kRow.innerHTML = `
            <span>Điểm Nghiệp Lực:</span>
            <span style="color:${tier.color}; font-weight:bold;">${KarmaSystem.state?.karma ?? 0} — ${tier.name}</span>
          `;
          container.appendChild(kRow);
        }
      }
    }
  },

  // ================================================================
  //  TAB 5 — NGOẠI HÌNH: embed AppearanceSystem UI
  // ================================================================
  _renderTabAppearance(container) {
    if (typeof AppearanceSystem === 'undefined') {
      const noApp = document.createElement('div');
      noApp.style.cssText = 'color:#555; font-size:11px; text-align:center; padding:20px 0;';
      noApp.textContent = 'Hệ thống Ngoại Hình chưa được tải.';
      container.appendChild(noApp);
      return;
    }

    // Preview avatar
    const previewWrap = document.createElement('div');
    previewWrap.style.cssText = 'display:flex; align-items:center; gap:12px; margin-bottom:10px; padding:8px; background:#0f0f1e; border:1px solid #333; border-radius:6px;';

    const previewCanvas = document.createElement('canvas');
    previewCanvas.id = 'charAppearancePreview';
    previewCanvas.width = 32; previewCanvas.height = 32;
    previewCanvas.style.cssText = 'image-rendering:pixelated; width:64px; height:64px;';
    previewWrap.appendChild(previewCanvas);

    const currentSkinName = APPEARANCE_CONFIG.presetSkins[AppearanceSystem.state.currentSkin]?.name || 'Tùy chỉnh';
    const previewInfo = document.createElement('div');
    previewInfo.innerHTML = `
      <div style="font-size:12px; color:#f0c040; font-weight:bold;">🎨 Ngoại Hình Hiện Tại</div>
      <div style="font-size:10px; color:#aaa; margin-top:3px;">Bộ: ${currentSkinName}</div>
    `;
    previewWrap.appendChild(previewInfo);
    container.appendChild(previewWrap);

    setTimeout(() => {
      const c = document.getElementById('charAppearancePreview');
      if (c) {
        const ctx = c.getContext('2d');
        ctx.clearRect(0, 0, 32, 32);
        Sprites.drawPixelArt(ctx, Sprites.player.down, 2, 0, 0);
      }
    }, 10);

    // --- Preset Skins ---
    const skinTitle = document.createElement('div');
    skinTitle.className = 'char-section-title';
    skinTitle.textContent = '👗 Preset Skin';
    container.appendChild(skinTitle);

    const skinGrid = document.createElement('div');
    skinGrid.className = 'char-skin-grid';

    Object.keys(APPEARANCE_CONFIG.presetSkins).forEach(skinId => {
      const skin = APPEARANCE_CONFIG.presetSkins[skinId];
      const isUnlocked = AppearanceSystem.state.unlockedSkins.includes(skinId);
      const isActive = AppearanceSystem.state.currentSkin === skinId;
      const btn = document.createElement('button');
      btn.className = 'char-skin-btn' + (isActive ? ' active' : '');
      btn.textContent = (isActive ? '✅ ' : '') + skin.name;
      btn.disabled = !isUnlocked;
      btn.title = !isUnlocked ? '🔒 Chưa mở khóa' : skin.name;
      btn.onclick = () => {
        AppearanceSystem.applySkin(skinId);
        this._renderTabAppearance(container.parentElement.querySelector ? container : container);
        // Re-render tab
        this._charSubTab = 'appearance';
        this.renderCharacter();
      };
      skinGrid.appendChild(btn);
    });
    container.appendChild(skinGrid);

    // --- Custom Colors ---
    const colorTitle = document.createElement('div');
    colorTitle.className = 'char-section-title';
    colorTitle.style.marginTop = '10px';
    colorTitle.textContent = '🎨 Tùy Chỉnh Màu Sắc';
    container.appendChild(colorTitle);

    const colorParts = [
      { key: 'hair',     label: 'Tóc',    palette: APPEARANCE_CONFIG.hairColors },
      { key: 'skin',     label: 'Da',      palette: APPEARANCE_CONFIG.skinColors },
      { key: 'robe',     label: 'Áo',      palette: APPEARANCE_CONFIG.robeColors },
      { key: 'robeDark', label: 'Áo Đậm', palette: APPEARANCE_CONFIG.robeDarkColors },
      { key: 'belt',     label: 'Đai',     palette: APPEARANCE_CONFIG.beltColors },
      { key: 'eye',      label: 'Mắt',     palette: APPEARANCE_CONFIG.eyeColors },
    ];

    colorParts.forEach(({ key, label, palette }) => {
      const row = document.createElement('div');
      row.className = 'char-color-row';

      const lbl = document.createElement('div');
      lbl.className = 'char-color-label';
      lbl.textContent = label + ':';
      row.appendChild(lbl);

      const swatches = document.createElement('div');
      swatches.className = 'char-color-swatches';

      palette.forEach(color => {
        const sw = document.createElement('div');
        sw.className = 'char-color-swatch' + (AppearanceSystem.state.currentColors[key] === color ? ' selected' : '');
        sw.style.backgroundColor = color;
        sw.title = color;
        sw.onclick = () => {
          AppearanceSystem.setColor(key, color);
          this.renderCharacter(); // re-render tab
        };
        swatches.appendChild(sw);
      });

      row.appendChild(swatches);
      container.appendChild(row);
    });

    // Nút Reset mặc định
    const resetBtn = document.createElement('button');
    resetBtn.style.cssText = `
      margin-top:8px; width:100%; padding:7px;
      font-family:'Courier New',monospace; font-size:11px; font-weight:bold;
      border-radius:5px; cursor:pointer;
      border:1px solid #555; background:#1a1a2e; color:#aaa;
      transition:background 0.15s;
    `;
    resetBtn.textContent = '🔄 Reset Về Mặc Định';
    resetBtn.onclick = () => {
      AppearanceSystem.applySkin('default');
      this.renderCharacter();
    };
    container.appendChild(resetBtn);
  },

  // ================================================================
  //  TAB 6 — PHÁP BẢO: Trang bị + Enhance
  // ================================================================
  _renderTabEquipment(container) {
    const slots = [
      { key: 'weapon',    icon: '⚔️', name: 'Vũ Khí' },
      { key: 'armor',     icon: '🛡️', name: 'Giáp' },
      { key: 'accessory', icon: '💍', name: 'Phụ Kiện' },
    ];

    const equTitle = document.createElement('div');
    equTitle.className = 'char-section-title';
    equTitle.textContent = '⚒️ Trang Bị Đang Dùng';
    container.appendChild(equTitle);

    slots.forEach(slot => {
      const itemId = Player.equipped[slot.key];
      const itemData = itemId ? ITEMS[itemId] : null;

      const slotDiv = document.createElement('div');
      slotDiv.className = 'char-equip-slot';

      if (itemData) {
        // Tên với enhance suffix
        let displayName = itemData.name;
        let enhLevel = 0;
        let enhHtml = '';
        if (typeof EnhanceSystem !== 'undefined') {
          enhLevel = EnhanceSystem.getLevel ? EnhanceSystem.getLevel(itemId) : 0;
          if (enhLevel > 0) {
            displayName = EnhanceSystem.getDisplayName ? EnhanceSystem.getDisplayName(itemId) : `${itemData.name} +${enhLevel}`;
            const nameColor = EnhanceSystem.getNameColor ? EnhanceSystem.getNameColor(enhLevel) : '#f0c040';
            enhHtml = `<span class="char-equip-slot-enhance" style="color:${nameColor};">+${enhLevel} ✦</span>`;
          }
        }

        // Stat summary
        const stats = itemData.stats || {};
        const statParts = [];
        if (stats.atk)      statParts.push(`⚔️+${stats.atk}`);
        if (stats.def)      statParts.push(`🛡️+${stats.def}`);
        if (stats.hp)       statParts.push(`❤️+${stats.hp}`);
        if (stats.mp)       statParts.push(`💎+${stats.mp}`);
        if (stats.critRate) statParts.push(`💥+${(stats.critRate*100).toFixed(0)}%`);
        const statSummary = statParts.join(' ');

        slotDiv.innerHTML = `
          <div style="display:flex; align-items:center; gap:8px; flex:1;">
            <span style="font-size:18px;">${slot.icon}</span>
            <div class="char-equip-slot-info">
              <div class="char-equip-slot-name">${slot.name}</div>
              <div class="char-equip-slot-item">${displayName} ${enhHtml}</div>
              <div style="font-size:9px; color:#888; margin-top:1px;">${statSummary}</div>
            </div>
          </div>
          <button class="char-unequip-btn" data-slot="${slot.key}">Tháo</button>
        `;

        slotDiv.querySelector('.char-unequip-btn').onclick = (e) => {
          e.stopPropagation();
          if (confirm(`Tháo ${itemData.name}?`)) {
            Player.unequip(slot.key);
            this.renderCharacter();
          }
        };
      } else {
        slotDiv.style.cursor = 'default';
        slotDiv.innerHTML = `
          <div style="display:flex; align-items:center; gap:8px; flex:1;">
            <span style="font-size:18px; opacity:0.3;">${slot.icon}</span>
            <div>
              <div class="char-equip-slot-name">${slot.name}</div>
              <div class="char-equip-slot-empty">(Trống)</div>
            </div>
          </div>
        `;
      }

      container.appendChild(slotDiv);

      // ── Enhance UI inline (chỉ khi có trang bị) ──
      if (itemData && typeof EnhanceSystem !== 'undefined' && typeof EnhanceSystem.buildInlineUI === 'function') {
        const enhWrap = document.createElement('div');
        enhWrap.style.cssText = 'margin-bottom:12px; padding:6px 8px; background:#0a0a18; border:1px solid #222; border-top:none; border-radius:0 0 5px 5px;';
        EnhanceSystem.buildInlineUI(itemId, enhWrap);
        container.appendChild(enhWrap);
      }
    });

    // --- Nếu EnhanceSystem chưa có buildInlineUI, fallback hiện thị enhance thông qua tooltip ---
    if (typeof EnhanceSystem !== 'undefined' && typeof EnhanceSystem.buildInlineUI !== 'function') {
      const hint = document.createElement('div');
      hint.style.cssText = 'font-size:10px; color:#888; text-align:center; margin-top:6px; padding:6px; background:#0f0f1e; border-radius:4px;';
      hint.textContent = '💡 Click vào trang bị trong Túi Đồ để xem chi tiết nâng cấp.';
      container.appendChild(hint);
    }

    // --- Stats tổng từ trang bị ---
    const sep = document.createElement('hr');
    sep.className = 'char-section-sep';
    container.appendChild(sep);

    const totTitle = document.createElement('div');
    totTitle.className = 'char-section-title';
    totTitle.textContent = '📊 Tổng Stat Từ Trang Bị';
    container.appendChild(totTitle);

    const totalStats = { atk: 0, def: 0, hp: 0, mp: 0, critRate: 0, critDmg: 0 };
    slots.forEach(slot => {
      const itemId = Player.equipped[slot.key];
      if (!itemId || !ITEMS[itemId]) return;
      let stats;
      if (typeof EnhanceSystem !== 'undefined' && EnhanceSystem.getEnhancedStats) {
        stats = EnhanceSystem.getEnhancedStats(itemId);
      } else {
        stats = ITEMS[itemId].stats || {};
      }
      Object.keys(totalStats).forEach(k => { totalStats[k] += stats[k] || 0; });
    });

    const statLabels = [
      { k: 'atk',      icon: '⚔️', label: 'Công Kích' },
      { k: 'def',      icon: '🛡️', label: 'Phòng Ngự' },
      { k: 'hp',       icon: '❤️', label: 'Sinh Mệnh' },
      { k: 'mp',       icon: '💎', label: 'Linh Lực' },
      { k: 'critRate', icon: '💥', label: 'Bạo Kích' },
      { k: 'critDmg',  icon: '🔥', label: 'Bạo Thương' },
    ];

    statLabels.forEach(({ k, icon, label }) => {
      if (totalStats[k] === 0) return;
      const val = k.includes('crit') ? `+${(totalStats[k] * 100).toFixed(0)}%` : `+${totalStats[k]}`;
      const r = document.createElement('div');
      r.className = 'char-stat-row';
      r.innerHTML = `<span>${icon} ${label}</span><span class="char-stat-val">${val}</span>`;
      container.appendChild(r);
    });

    if (Object.values(totalStats).every(v => v === 0)) {
      const emptyStats = document.createElement('div');
      emptyStats.style.cssText = 'color:#555; font-size:11px; text-align:center; padding:8px;';
      emptyStats.textContent = 'Chưa trang bị gì.';
      container.appendChild(emptyStats);
    }
  },

  // Setup event listeners
  setupEventListeners() {
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          const panelName = overlay.id.replace('Panel', '');
          this.closePanel(panelName);
        }
      });
    });

    document.getElementById('minimapToggle').onclick = () => {
      GameState.minimapVisible = !GameState.minimapVisible;
      document.getElementById('minimap').classList.toggle('hidden', !GameState.minimapVisible);
    };
  }
};

console.log('🎨 UI loaded');
