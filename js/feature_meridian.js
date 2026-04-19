// ==================== FEATURE: KHAI MẠCH / KINH MẠCH ====================
// Load sau game.js
// 12 kinh mạch, mở bằng nguyên liệu + Tu Vi + thời gian
// "Thông mạch" = mở đủ 2 kinh mạch liền kề → nhân đôi hiệu quả

const MeridianSystem = {
  // ==================== CONFIG ====================
  meridians: [
    { id: 0, name: 'Thủ Thái Âm', icon: '🫁', pos: [50, 20],  stat: 'hp',      bonus: 80,  desc: '+80 HP tối đa',         matCost: { wolfFang: 5, spiritStone: 2 }, realmCost: 50,  unlockTime: 30 },
    { id: 1, name: 'Thủ Dương Minh',icon: '💪', pos: [80, 35], stat: 'atk',     bonus: 15,  desc: '+15 ATK',               matCost: { wolfPelt: 5, demonCore: 1 },   realmCost: 60,  unlockTime: 45 },
    { id: 2, name: 'Túc Dương Minh',icon: '🦵', pos: [75, 55], stat: 'def',     bonus: 12,  desc: '+12 DEF',               matCost: { demonCore: 2, spiritStone: 3 },realmCost: 70,  unlockTime: 60 },
    { id: 3, name: 'Túc Thái Âm',   icon: '🦶', pos: [50, 75], stat: 'speed',   bonus: 0.4, desc: '+0.4 Tốc độ',           matCost: { spiritStone: 4 },               realmCost: 80,  unlockTime: 60 },
    { id: 4, name: 'Thủ Thiếu Âm',  icon: '❤️', pos: [20, 55], stat: 'hpRegen', bonus: 5,   desc: '+5 HP hồi/2s',          matCost: { wolfFang: 8, spiritStone: 2 }, realmCost: 90,  unlockTime: 75 },
    { id: 5, name: 'Thủ Thái Dương', icon: '☀️', pos: [20, 35], stat: 'critRate',bonus: 0.05,desc: '+5% Bạo kích',          matCost: { dragonScale: 1, spiritStone: 5 },realmCost: 100, unlockTime: 90 },
    { id: 6, name: 'Túc Thái Dương', icon: '🦴', pos: [50, 10], stat: 'mpMax',   bonus: 40,  desc: '+40 MP tối đa',         matCost: { demonCore: 3 },                 realmCost: 120, unlockTime: 90 },
    { id: 7, name: 'Túc Thiếu Âm',  icon: '💧', pos: [85, 20], stat: 'mpRegen', bonus: 6,   desc: '+6 MP hồi/2s',          matCost: { spiritStone: 5, dragonScale: 1 },realmCost: 140, unlockTime: 120},
    { id: 8, name: 'Tâm Bào Lạc',   icon: '💜', pos: [85, 80], stat: 'critDmg', bonus: 0.20,desc: '+20% Sát thương bạo kích',matCost: { dragonScale: 2 },               realmCost: 160, unlockTime: 120},
    { id: 9, name: 'Tam Tiêu',      icon: '🔥', pos: [15, 80], stat: 'atkSpd',  bonus: 0.15,desc: '+15% tốc độ đánh',      matCost: { dragonScale: 2, spiritStone: 5 },realmCost: 180, unlockTime: 150},
    { id: 10,name: 'Túc Thiếu Dương',icon: '⚡',pos: [15, 20], stat: 'expBonus',bonus: 0.15,desc: '+15% EXP nhận được',    matCost: { celestialOrb: 1, dragonScale: 1 },realmCost: 200, unlockTime: 180},
    { id: 11,name: 'Túc Quyết Âm',  icon: '🌀', pos: [50, 90], stat: 'allBonus',bonus: 0.08, desc: '+8% tất cả chỉ số',    matCost: { celestialOrb: 2 },               realmCost: 250, unlockTime: 300},
  ],

  // Adjacency map (thông mạch khi mở liền kề)
  adjacent: {
    0:[1,5,6], 1:[0,2,7], 2:[1,3,8], 3:[2,4,9], 4:[3,5,10], 5:[0,4,11],
    6:[0,7,11], 7:[1,6,8], 8:[2,7,9], 9:[3,8,10], 10:[4,9,11], 11:[5,6,10]
  },

  // State per meridian
  state: {},    // { id: { unlocked, tongmach, unlockingUntil } }

  // ==================== INIT ====================
  init() {
    // Init state
    for (const m of this.meridians) {
      this.state[m.id] = { unlocked: false, tongmach: false, unlockingUntil: null };
    }
    this._injectStyle();
    this._injectHTML();
    this._loadSave();
    this._setupMenuBtn();
    console.log('🫁 MeridianSystem initialized');
  },

  // ==================== UNLOCK ====================
  canUnlock(id) {
    const m = this.meridians[id];
    const s = this.state[id];
    if (s.unlocked || s.unlockingUntil) return { ok: false, reason: 'Đã mở hoặc đang khai mạch' };
    // Check mats
    for (const [matId, qty] of Object.entries(m.matCost)) {
      const slot = Inventory.items.find(i => i.id === matId);
      if (!slot || slot.count < qty) {
        return { ok: false, reason: `Thiếu ${ITEMS[matId]?.name || matId} x${qty}` };
      }
    }
    if (Player.realmExp < m.realmCost) {
      return { ok: false, reason: `Cần ${m.realmCost} Tu Vi tích lũy` };
    }
    return { ok: true };
  },

  startUnlock(id) {
    const check = this.canUnlock(id);
    if (!check.ok) { UI.addLog(`❌ ${check.reason}`, 'system'); return false; }

    const m = this.meridians[id];
    // Consume mats + realm exp
    for (const [matId, qty] of Object.entries(m.matCost)) Inventory.remove(matId, qty);
    Player.realmExp = Math.max(0, Player.realmExp - m.realmCost);

    this.state[id].unlockingUntil = Date.now() + m.unlockTime * 1000;
    this._save();
    UI.addLog(`🫁 Bắt đầu khai mạch ${m.name}... (${m.unlockTime}s)`, 'system');
    this._renderPanel();
    return true;
  },

  checkUnlockComplete() {
    const now = Date.now();
    for (const m of this.meridians) {
      const s = this.state[m.id];
      if (!s.unlocked && s.unlockingUntil && now >= s.unlockingUntil) {
        s.unlocked = true;
        s.unlockingUntil = null;
        this._applyMeridian(m, false);
        this._checkTongmach(m.id);
        UI.addLog(`✅ Khai mạch thành công: ${m.icon} ${m.name}! ${m.desc}`, 'realm');
        UI.showNotification(`🫁 ${m.name}!`, m.desc);
        this._save();
      }
    }
  },

  _checkTongmach(id) {
    // Check all adjacent
    for (const adjId of (this.adjacent[id] || [])) {
      if (this.state[adjId].unlocked && !this.state[id].tongmach && !this.state[adjId].tongmach) {
        // Thông mạch pair
        this.state[id].tongmach = true;
        this.state[adjId].tongmach = true;
        const m = this.meridians[id];
        const adj = this.meridians[adjId];
        // Double effect
        this._applyMeridian(m, false); // +1x more
        this._applyMeridian(adj, false);
        UI.addLog(`💫 THÔNG MẠCH! ${m.icon}${m.name} ↔ ${adj.icon}${adj.name} — Hiệu quả x2!`, 'realm');
        UI.showNotification('💫 THÔNG MẠCH!', `${m.name} + ${adj.name}`);
        break;
      }
    }
    Player.recalculateStats();
  },

  _applyMeridian(m, isRemove) {
    const mul = isRemove ? -1 : 1;
    switch (m.stat) {
      case 'hp':       Player.maxHp = Math.max(100, Player.maxHp + m.bonus * mul); Player.hp = Math.min(Player.hp, Player.maxHp); break;
      case 'atk':      Player.baseAtk += m.bonus * mul; Player.recalculateStats(); break;
      case 'def':      Player.baseDef += m.bonus * mul; Player.recalculateStats(); break;
      case 'speed':    Player.baseSpeed += m.bonus * mul; Player.speed = Player.baseSpeed; break;
      case 'mpMax':    Player.maxMp = Math.max(50, Player.maxMp + m.bonus * mul); Player.mp = Math.min(Player.mp, Player.maxMp); break;
      case 'critDmg':  Player.critDmg += m.bonus * mul; break;
      case 'critRate': Player.critRate += m.bonus * mul; break;
      // hpRegen, mpRegen, expBonus, atkSpd, allBonus handled in update()
    }
  },

  // ==================== UPDATE ====================
  update(dt) {
    this.checkUnlockComplete();

    for (const m of this.meridians) {
      const s = this.state[m.id];
      if (!s.unlocked) continue;

      if (m.stat === 'hpRegen' && GameState.time % 2000 < dt) {
        const val = m.bonus * (s.tongmach ? 2 : 1);
        Player.hp = Math.min(Player.maxHp, Player.hp + val);
      }
      if (m.stat === 'mpRegen' && GameState.time % 2000 < dt) {
        const val = m.bonus * (s.tongmach ? 2 : 1);
        Player.mp = Math.min(Player.maxMp, Player.mp + val);
      }
    }
  },

  // Get bonus multipliers
  getExpBonus() {
    let bonus = 1;
    for (const m of this.meridians) {
      if (!this.state[m.id].unlocked) continue;
      if (m.stat === 'expBonus') bonus += m.bonus * (this.state[m.id].tongmach ? 2 : 1);
      if (m.stat === 'allBonus') bonus += m.bonus * (this.state[m.id].tongmach ? 2 : 1);
    }
    return bonus;
  },

  getAtkSpdBonus() {
    let bonus = 1;
    for (const m of this.meridians) {
      if (!this.state[m.id].unlocked) continue;
      if (m.stat === 'atkSpd') bonus += m.bonus * (this.state[m.id].tongmach ? 2 : 1);
    }
    return bonus;
  },

  getAllBonus() {
    let bonus = 1;
    for (const m of this.meridians) {
      if (!this.state[m.id].unlocked || m.stat !== 'allBonus') continue;
      bonus += m.bonus * (this.state[m.id].tongmach ? 2 : 1);
    }
    return bonus;
  },

  // ==================== UI PANEL ====================
  openPanel() {
    document.getElementById('meridianPanel').classList.add('show');
    this._renderPanel();
  },

  closePanel() {
    document.getElementById('meridianPanel').classList.remove('show');
  },

  _renderPanel() {
    const now = Date.now();
    // SVG diagram
    const svgEl = document.getElementById('meridianSVG');
    svgEl.innerHTML = '';

    // Draw connection lines
    const drawn = new Set();
    for (const m of this.meridians) {
      for (const adjId of (this.adjacent[m.id] || [])) {
        const key = [Math.min(m.id, adjId), Math.max(m.id, adjId)].join('-');
        if (drawn.has(key)) continue;
        drawn.add(key);
        const adj = this.meridians[adjId];
        const bothOpen = this.state[m.id].unlocked && this.state[adjId].unlocked;
        const tongmach = this.state[m.id].tongmach && this.state[adjId].tongmach;
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', m.pos[0] + '%');
        line.setAttribute('y1', m.pos[1] + '%');
        line.setAttribute('x2', adj.pos[0] + '%');
        line.setAttribute('y2', adj.pos[1] + '%');
        line.setAttribute('stroke', tongmach ? '#f0c040' : bothOpen ? '#4caf50' : '#33333388');
        line.setAttribute('stroke-width', tongmach ? '3' : '1.5');
        if (tongmach) line.setAttribute('stroke-dasharray', '5,3');
        svgEl.appendChild(line);
      }
    }

    // Draw nodes
    for (const m of this.meridians) {
      const s = this.state[m.id];
      const unlocking = s.unlockingUntil && now < s.unlockingUntil;
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('transform', `translate(${m.pos[0]}%, ${m.pos[1]}%)`);
      g.style.cursor = 'pointer';

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('r', '14');
      circle.setAttribute('fill', s.unlocked ? (s.tongmach ? '#f0c040' : '#4caf50') : unlocking ? '#2196f3' : '#222');
      circle.setAttribute('stroke', s.unlocked ? (s.tongmach ? '#ffd700' : '#4caf50') : '#555');
      circle.setAttribute('stroke-width', '2');
      g.appendChild(circle);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dy', '5');
      text.setAttribute('font-size', '12');
      text.textContent = m.icon;
      g.appendChild(text);

      // Progress arc if unlocking
      if (unlocking) {
        const pct = 1 - (s.unlockingUntil - now) / (m.unlockTime * 1000);
        const angle = pct * Math.PI * 2 - Math.PI / 2;
        const x2 = 14 * Math.cos(angle);
        const y2 = 14 * Math.sin(angle);
        const large = pct > 0.5 ? 1 : 0;
        const arc = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        arc.setAttribute('d', `M 0,-14 A 14,14 0 ${large},1 ${x2},${y2}`);
        arc.setAttribute('fill', 'none');
        arc.setAttribute('stroke', '#4fc3f7');
        arc.setAttribute('stroke-width', '3');
        g.appendChild(arc);
      }

      const mId = m.id;
      g.addEventListener('click', () => this._showMeridianDetail(mId));
      svgEl.appendChild(g);
    }

    // Stats summary
    const summary = document.getElementById('meridianSummary');
    const unlocked = this.meridians.filter(m => this.state[m.id].unlocked);
    const tongmachCount = this.meridians.filter(m => this.state[m.id].tongmach).length / 2;
    summary.innerHTML = `
      <div style="color:#4caf50;font-size:11px">✅ Đã khai: ${unlocked.length}/12</div>
      <div style="color:#f0c040;font-size:11px">💫 Thông mạch: ${tongmachCount} cặp</div>
      <div style="color:#888;font-size:10px">Chạm vào điểm kinh mạch để xem chi tiết</div>
    `;
  },

  _showMeridianDetail(id) {
    const m = this.meridians[id];
    const s = this.state[id];
    const now = Date.now();
    const unlocking = s.unlockingUntil && now < s.unlockingUntil;
    const remaining = unlocking ? Math.ceil((s.unlockingUntil - now) / 1000) : 0;

    const detail = document.getElementById('meridianDetail');
    const tongmachBonus = s.tongmach ? ' (x2 Thông Mạch!)' : '';
    const effectVal = s.tongmach ? m.bonus * 2 : m.bonus;

    let matsHtml = Object.entries(m.matCost).map(([matId, qty]) => {
      const have = Inventory.items.find(i => i.id === matId)?.count || 0;
      const ok = have >= qty || s.unlocked;
      return `<span style="color:${ok ? '#4caf50' : '#f44'};font-size:10px">${ITEMS[matId]?.name || matId}: ${have}/${qty}</span>`;
    }).join('<br>');

    detail.innerHTML = `
      <div style="border-top:1px solid #333;margin-top:12px;padding-top:12px">
        <div style="color:#f0c040;font-size:14px;font-weight:bold">${m.icon} ${m.name}</div>
        <div style="color:#8ef;font-size:11px;margin-top:4px">${m.desc}${tongmachBonus}</div>
        ${s.tongmach ? '<div style="color:#f0c040;font-size:10px">💫 Đang Thông Mạch — hiệu quả x2!</div>' : ''}
        ${s.unlocked ? `<div style="color:#4caf50;font-size:11px;margin-top:6px">✅ Đã khai mạch</div>` :
          unlocking ? `<div style="color:#2196f3;font-size:11px;margin-top:6px">⏳ Đang khai... còn ${remaining}s</div>` :
          `<div style="margin-top:8px">
            <div style="color:#aaa;font-size:10px;margin-bottom:4px">📦 Nguyên liệu:</div>
            ${matsHtml}
            <div style="color:${Player.realmExp >= m.realmCost ? '#4caf50' : '#f44'};font-size:10px;margin-top:4px">💫 Tu Vi: ${Player.realmExp}/${m.realmCost}</div>
            <div style="color:#888;font-size:10px">⏱ Thời gian: ${m.unlockTime}s</div>
            <button onclick="MeridianSystem.startUnlock(${id});MeridianSystem._renderPanel()" style="width:100%;margin-top:8px;padding:8px;background:rgba(33,150,243,0.2);border:1px solid #2196f3;border-radius:6px;color:#2196f3;font-size:11px;cursor:pointer;font-family:inherit">🫁 Bắt Đầu Khai Mạch</button>
          </div>`
        }
      </div>
    `;
  },

  // ==================== INJECT STYLE + HTML ====================
  _injectStyle() {
    if (document.getElementById('meridianStyle')) return;
    const s = document.createElement('style');
    s.id = 'meridianStyle';
    s.textContent = `
      #meridianPanel {
        position:absolute;top:0;left:0;width:100%;height:100%;
        background:rgba(0,0,0,0.8);z-index:100;
        display:none;align-items:center;justify-content:center;
        backdrop-filter:blur(2px);
      }
      #meridianPanel.show{display:flex;}
      #meridianInner {
        background:linear-gradient(135deg,#1a1a2e,#0d1117);
        border:3px solid #4caf50;border-radius:15px;
        padding:18px;width:92%;max-width:400px;max-height:88vh;overflow-y:auto;
        box-shadow:0 0 40px rgba(76,175,80,0.2);
      }
      #meridianInner::-webkit-scrollbar{width:4px}
      #meridianInner::-webkit-scrollbar-thumb{background:#4caf50;border-radius:2px}
      #meridianSVG {
        width:100%;height:260px;
        background:rgba(0,0,0,0.3);border-radius:10px;
        border:1px solid #333;display:block;
      }
    `;
    document.head.appendChild(s);
  },

  _injectHTML() {
    const panel = document.createElement('div');
    panel.id = 'meridianPanel';
    panel.innerHTML = `
      <div id="meridianInner">
        <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #4caf5044;padding-bottom:10px;margin-bottom:12px">
          <div style="color:#4caf50;font-size:18px;font-weight:bold">🫁 Khai Mạch</div>
          <div onclick="MeridianSystem.closePanel()" style="width:30px;height:30px;background:rgba(255,0,0,0.2);border:2px solid #f44;border-radius:50%;color:#f44;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center">✕</div>
        </div>
        <svg id="meridianSVG" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"></svg>
        <div id="meridianSummary" style="margin-top:10px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:6px"></div>
        <div id="meridianDetail"></div>
      </div>
    `;
    panel.addEventListener('click', e => { if (e.target.id === 'meridianPanel') this.closePanel(); });
    document.body.appendChild(panel);
  },

  _setupMenuBtn() {
    const menuBar = document.getElementById('menuBar');
    if (!menuBar) return;
    const btn = document.createElement('div');
    btn.className = 'menu-btn';
    btn.onclick = () => MeridianSystem.openPanel();
    btn.innerHTML = `<span style="font-size:18px">🫁</span><span>Kinh Mạch</span>`;
    menuBar.appendChild(btn);
  },

  // ==================== SAVE / LOAD ====================
  getSaveData() {
    const stateArr = {};
    for (const m of this.meridians) {
      stateArr[m.id] = { ...this.state[m.id] };
    }
    return { state: stateArr };
  },

  _save() {
    try { localStorage.setItem('tuxien_meridian', JSON.stringify(this.getSaveData())); } catch (e) {}
  },

  _loadSave() {
    try {
      const raw = localStorage.getItem('tuxien_meridian');
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data.state) {
        for (const m of this.meridians) {
          const saved = data.state[m.id];
          if (!saved) continue;
          this.state[m.id] = { ...saved };
          if (saved.unlocked) this._applyMeridian(m, false);
        }
      }
      Player.recalculateStats();
    } catch (e) {}
  }
};

// ==================== WRAP GAME ====================
(function () {
  const _origInit = Game.init.bind(Game);
  Game.init = function () { _origInit(); MeridianSystem.init(); };

  const _origUpdate = Game.update.bind(Game);
  Game.update = function (dt) { _origUpdate(dt); MeridianSystem.update(dt); };

  const _origSave = Game.save.bind(Game);
  Game.save = function () { _origSave(); MeridianSystem._save(); };

  // Wrap Player.gainExp to apply meridian expBonus
  const _origGainExp = Player.gainExp.bind(Player);
  Player.gainExp = function (amount) {
    const mul = MeridianSystem.getExpBonus() * MeridianSystem.getAllBonus();
    _origGainExp(Math.floor(amount * mul));
  };

  // Wrap skill CD to apply atkSpd meridian
  const _origUseSkillOuter = Player.useSkill.bind(Player);
  // Note: AtkSpd reduces cooldown at end of useSkill
  // We wrap the cooldown application
  const origUSBase = Player.useSkill;
  Player.useSkill = function (idx) {
    const result = origUSBase.call(this, idx);
    if (result && this.skills && this.skills[idx]) {
      const spdMul = MeridianSystem.getAtkSpdBonus();
      if (spdMul > 1) {
        this.skills[idx].cd = Math.floor(this.skills[idx].cd / spdMul);
      }
    }
    return result;
  };
})();

console.log('🫁 feature_meridian.js loaded');
// Thêm vào index.html: <script src="js/feature_meridian.js"></script>
