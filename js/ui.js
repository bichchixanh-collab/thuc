// ==================== UI SYSTEM ====================
const UI = {
  activePanel: null,

  init() {
    this.drawAllIcons();
    this.updateAll();
    this.setupEventListeners();
    this.injectRadialMenu();
  },

  drawAllIcons() {
    const avCtx = document.getElementById('avatarCanvas').getContext('2d');
    avCtx.clearRect(0, 0, 32, 32);
    Sprites.drawPixelArt(avCtx, Sprites.player.down, 2, 0, 0);

    this.drawSkillIcon('skillIcon0', [[0,'#fff','#fff',0],['#ccc','#fff','#fff','#ccc'],['#ccc','#fff','#fff','#ccc'],[0,'#aaa','#aaa',0],['#8b4513','#a0522d','#a0522d','#8b4513']], 5);
    this.drawSkillIcon('skillIcon1', [['#87ceeb',0,0,'#87ceeb'],[0,'#87ceeb','#87ceeb',0],[0,'#87ceeb','#87ceeb',0],['#4169e1','#87ceeb','#87ceeb','#4169e1']], 5);
    this.drawSkillIcon('skillIcon2', [['#ffff00','#ffff00',0,0],[0,'#ffff00','#ffff00',0],[0,0,'#ffff00','#ffff00'],['#ffa500','#ffff00','#ffff00','#ffa500']], 5);
    this.drawSkillIcon('skillIcon3', [['#ff00ff',0,0,'#ff00ff'],[0,'#ff69b4','#ff69b4',0],['#ff00ff','#ff69b4','#ff69b4','#ff00ff'],[0,'#ff00ff','#ff00ff',0]], 5);

    document.getElementById('mpCost1').textContent = Player.skills[1].mp;
    document.getElementById('mpCost2').textContent = Player.skills[2].mp;
    document.getElementById('mpCost3').textContent = Player.skills[3].mp;
  },

  drawSkillIcon(canvasId, data, scale) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 24, 24);
    Sprites.drawPixelArt(ctx, data, scale, 0, 0);
  },

  updateAll() {
    this.updateStats();
    this.updateGold();
    this.updateSkillUI();
    this.updateRealmTitle();
    Quests.updateUI();
  },

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

  updateGold() {
    document.getElementById('goldAmount').textContent = Utils.formatNumber(Player.gold);
  },

  updateSkillUI() {
    for (let i = 0; i < 4; i++) {
      const cdEl = document.getElementById('cd' + i);
      const skill = Player.skills[i];
      if (skill.cd > 0) {
        cdEl.style.display = 'flex';
        cdEl.textContent = Math.ceil(skill.cd / 1000);
      } else {
        cdEl.style.display = 'none';
      }
    }
  },

  updateRealmTitle() {
    const realm = REALMS[Player.realm];
    document.getElementById('realmTitle').textContent = `▸ ${realm.name} - Tầng ${Player.realmStage}`;
    document.getElementById('levelBadge').textContent = `Lv.${Player.level}`;
  },

  updateTargetInfo() {
    if (!Player.target || !Player.target.alive) { this.hideTargetInfo(); return; }
    const target = Player.target;
    const ti = document.getElementById('targetInfo');
    ti.style.display = 'flex';
    ti.className = target.boss ? 'boss' : '';
    document.getElementById('targetName').textContent = target.name;
    document.getElementById('targetLevel').textContent = `Lv.${target.level}`;
    document.getElementById('targetHpFill').style.width = (target.hp / target.maxHp * 100) + '%';
  },

  hideTargetInfo() {
    document.getElementById('targetInfo').style.display = 'none';
  },

  addLog(text, type = 'system') {
    const log = document.getElementById('combatLog');
    const msg = document.createElement('div');
    msg.className = `log-msg ${type}`;
    msg.textContent = text;
    log.appendChild(msg);
    while (log.children.length > 10) log.removeChild(log.firstChild);
    setTimeout(() => { if (msg.parentNode) msg.remove(); }, 5000);
  },

  showNotification(title, subtitle = '') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.innerHTML = `<div class="notif-text">${title}</div>${subtitle ? `<div class="notif-sub">${subtitle}</div>` : ''}`;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 2500);
  },

  // ==================== PANEL MANAGEMENT ====================
  // Map tên panel → id HTML thực tế (tránh trùng với skillPanel, mapPanel... của game gốc)
  _panelIdMap: {
    character:   'xp-characterPanel',
    inventory:   'xp-inventoryPanel',
    skill:       'xp-skillPanel',
    quest:       'xp-questPanel',
    map:         'xp-mapPanel',
    wanted:      'xp-wantedPanel',
    wandering:   'xp-wanderingPanel',
    achievement: 'xp-achievementPanel',
    extcult:     'xp-extcultPanel',
  },

  openPanel(name) {
    if (this.activePanel === name) { this.closePanel(name); return; }
    if (this.activePanel) this.closePanel(this.activePanel);
    const panelId = this._panelIdMap[name] || (name + 'Panel');
    const panel = document.getElementById(panelId);
    if (panel) {
      panel.classList.add('show');
      this.activePanel = name;
      switch (name) {
        case 'inventory':  this.renderInventoryPanel(); break;
        case 'character':  this.renderCharacterPanel(); break;
        case 'map':        this._renderMapPanel(); break;
        case 'quest':      this.renderQuestPanel(); break;
        case 'skill':      this.renderSkillPanel(); break;
      }
    }
    document.dispatchEvent(new CustomEvent('ui:openPanel', { detail: { name } }));
  },

  closePanel(name) {
    const panelId = this._panelIdMap[name] || (name + 'Panel');
    const panel = document.getElementById(panelId);
    if (panel) panel.classList.remove('show');
    if (this.activePanel === name) this.activePanel = null;
    try {
      if (typeof Inventory !== 'undefined' && Inventory.hideTooltip) {
        Inventory.hideTooltip();
      }
    } catch (e) { /* ignore */ }
  },

  // ==================== RADIAL MENU INJECT ====================
  injectRadialMenu() {
    // Remove old menuBar if exists
    const old = document.getElementById('menuBar');
    if (old) old.remove();

    const style = document.createElement('style');
    style.textContent = `
/* ===== RADIAL MENU ===== */
#radialMenuWrap {
  position:absolute;
  bottom:170px; right:110px;
  z-index:25;
}
.rm-ring-wrap {
  position:absolute;
  width:220px; height:220px;
  top:50%; left:50%;
  transform:translate(-50%,-50%);
  pointer-events:none;
}
.rm-ring {
  position:absolute; inset:0; border-radius:50%;
  border:1px solid transparent; opacity:0;
  transform:scale(0.3);
  transition:opacity 0.5s ease, transform 0.5s ease;
}
.rm-ring-1 { border-color:rgba(255,180,50,0.25); transition-delay:0.04s; }
.rm-ring-2 { inset:14px; border-color:rgba(120,80,255,0.2); transition-delay:0.08s; }
.rm-ring-3 { inset:28px; border-color:rgba(60,160,255,0.15); transition-delay:0.12s; }
.rm-open .rm-ring { opacity:1; transform:scale(1); }
.rm-open .rm-ring-1 { animation:rmSpin 12s linear infinite; }
.rm-open .rm-ring-2 { animation:rmSpin 8s linear infinite reverse; }
.rm-open .rm-ring-3 { animation:rmSpin 15s linear infinite; }
@keyframes rmSpin { from{transform:scale(1) rotate(0)} to{transform:scale(1) rotate(360deg)} }

/* Main button */
.rm-main {
  position:relative; z-index:10;
  width:56px; height:56px; border-radius:50%; border:none; cursor:pointer;
  background:radial-gradient(circle at 40% 35%, #ffe066, #f0a000 50%, #a05000 100%);
  box-shadow:0 0 0 2px rgba(255,200,50,0.4), 0 0 18px rgba(255,160,0,0.7), 0 0 40px rgba(255,100,0,0.3), inset 0 2px 3px rgba(255,255,200,0.5);
  display:flex; align-items:center; justify-content:center;
  color:#fff8e0; font-size:22px; user-select:none; outline:none;
  transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease;
}
.rm-main::before {
  content:''; position:absolute; inset:5px; border-radius:50%;
  border:1px solid rgba(255,240,150,0.4); pointer-events:none;
}
.rm-main::after { content:'☯'; font-size:22px; transition:transform 0.4s ease; }
.rm-main:hover { transform:scale(1.07); box-shadow:0 0 0 3px rgba(255,220,80,0.6), 0 0 28px rgba(255,180,0,0.9), 0 0 60px rgba(255,100,0,0.4), inset 0 2px 3px rgba(255,255,200,0.6); }
.rm-open .rm-main { transform:rotate(135deg) scale(1.05); }

/* Pulse ring */
.rm-pulse {
  position:absolute; inset:-3px; border-radius:50%;
  border:2px solid rgba(255,180,0,0.6);
  animation:rmPulse 2.5s ease-out infinite; pointer-events:none; z-index:4;
}
@keyframes rmPulse { 0%{transform:scale(1);opacity:0.7} 100%{transform:scale(2.2);opacity:0} }

/* Child buttons */
.rm-child {
  position:absolute; top:50%; left:50%;
  width:48px; height:48px; border-radius:50%; border:none; cursor:pointer;
  display:flex; align-items:center; justify-content:center;
  flex-direction:column; gap:1px;
  font-size:17px; user-select:none; outline:none;
  pointer-events:none; opacity:0;
  transform:translate(-50%,-50%) scale(0.3);
  transition:transform 0.4s cubic-bezier(0.34,1.45,0.64,1), opacity 0.3s ease, box-shadow 0.2s ease;
  background:radial-gradient(circle at 40% 35%, #8ab4ff, #3060d0 50%, #101860 100%);
  box-shadow:0 0 0 2px rgba(100,160,255,0.4), 0 0 12px rgba(60,100,255,0.6), inset 0 1px 2px rgba(180,220,255,0.4);
  z-index:5;
}
.rm-child::before {
  content:''; position:absolute; inset:4px; border-radius:50%;
  border:1px solid rgba(150,200,255,0.3); pointer-events:none;
}
.rm-child-lbl {
  font-size:7px; color:#b0d8ff; font-family:'Courier New',monospace;
  letter-spacing:0.2px; line-height:1; pointer-events:none;
}
.rm-child:hover { box-shadow:0 0 0 3px rgba(140,200,255,0.6), 0 0 22px rgba(80,140,255,0.9), inset 0 1px 2px rgba(200,230,255,0.5); }
.rm-open .rm-child { opacity:1; pointer-events:all; }

/* 9 positions, radius ~88px, start at top, clockwise 40° steps */
.rm-open .rm-c1 { transform:translate(calc(-50% + 0px),   calc(-50% - 88px)) scale(1); transition-delay:0.00s; }
.rm-open .rm-c2 { transform:translate(calc(-50% + 57px),  calc(-50% - 68px)) scale(1); transition-delay:0.03s; }
.rm-open .rm-c3 { transform:translate(calc(-50% + 84px),  calc(-50% - 18px)) scale(1); transition-delay:0.06s; }
.rm-open .rm-c4 { transform:translate(calc(-50% + 76px),  calc(-50% + 44px)) scale(1); transition-delay:0.09s; }
.rm-open .rm-c5 { transform:translate(calc(-50% + 30px),  calc(-50% + 83px)) scale(1); transition-delay:0.12s; }
.rm-open .rm-c6 { transform:translate(calc(-50% - 30px),  calc(-50% + 83px)) scale(1); transition-delay:0.15s; }
.rm-open .rm-c7 { transform:translate(calc(-50% - 76px),  calc(-50% + 44px)) scale(1); transition-delay:0.18s; }
.rm-open .rm-c8 { transform:translate(calc(-50% - 84px),  calc(-50% - 18px)) scale(1); transition-delay:0.21s; }
.rm-open .rm-c9 { transform:translate(calc(-50% - 57px),  calc(-50% - 68px)) scale(1); transition-delay:0.24s; }

/* Collapse stagger reverse */
.rm-c1{transition-delay:0.24s} .rm-c2{transition-delay:0.21s} .rm-c3{transition-delay:0.18s}
.rm-c4{transition-delay:0.15s} .rm-c5{transition-delay:0.12s} .rm-c6{transition-delay:0.09s}
.rm-c7{transition-delay:0.06s} .rm-c8{transition-delay:0.03s} .rm-c9{transition-delay:0.00s}

/* Active glow */
.rm-child.rm-active {
  background:radial-gradient(circle at 40% 35%, #c0d8ff, #6090ff 50%, #2040b0 100%);
  box-shadow:0 0 0 3px rgba(160,200,255,0.7), 0 0 28px rgba(100,160,255,1);
  border:2px solid rgba(200,230,255,0.6);
}

/* ===== PANEL SYSTEM ===== */
.xpanel {
  position:fixed; top:0; left:0; width:100%; height:100%;
  z-index:80; display:none; align-items:flex-end; justify-content:center;
  background:rgba(0,0,0,0.65);
}
.xpanel.show { display:flex; }
.xpanel-box {
  width:100%; max-width:480px;
  max-height:88vh;
  background:linear-gradient(160deg,#0d1117,#1a1a2e);
  border:2px solid #f0c04044; border-bottom:none;
  border-radius:18px 18px 0 0;
  display:flex; flex-direction:column;
  overflow:hidden;
  box-shadow:0 -8px 40px rgba(0,0,0,0.8);
  animation:slideUp 0.3s cubic-bezier(0.34,1.3,0.64,1);
}
@keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }

.xpanel-header {
  display:flex; align-items:center; justify-content:space-between;
  padding:14px 16px 10px;
  border-bottom:1px solid #f0c04022;
  flex-shrink:0;
}
.xpanel-title { color:#f0c040; font-size:14px; font-weight:bold; letter-spacing:1px; }
.xpanel-close {
  width:28px; height:28px; border-radius:50%;
  background:rgba(255,0,0,0.15); border:1px solid #f444;
  color:#f44; font-size:16px; cursor:pointer;
  display:flex; align-items:center; justify-content:center;
}

/* Tab bar */
.xpanel-tabs {
  display:flex; gap:2px; padding:8px 10px 0;
  border-bottom:1px solid #f0c04022; flex-shrink:0;
  overflow-x:auto; scrollbar-width:none;
}
.xpanel-tabs::-webkit-scrollbar { display:none; }
.xtab {
  padding:6px 12px; border-radius:8px 8px 0 0;
  border:1px solid transparent; border-bottom:none;
  color:#888; font-size:10px; font-family:'Courier New',monospace;
  cursor:pointer; white-space:nowrap; transition:all 0.2s;
  background:transparent;
}
.xtab.active {
  background:rgba(240,192,64,0.12);
  border-color:#f0c04044;
  color:#f0c040;
}
.xtab:hover:not(.active) { color:#ccc; background:rgba(255,255,255,0.05); }

/* Content area */
.xpanel-content {
  flex:1; overflow-y:auto; padding:12px;
  scrollbar-width:thin; scrollbar-color:#333 transparent;
}
.xpanel-content::-webkit-scrollbar { width:4px; }
.xpanel-content::-webkit-scrollbar-thumb { background:#444; border-radius:2px; }

/* Tab panes */
.xtabpane { display:none; }
.xtabpane.active { display:block; }

/* Stat rows */
.xstat-row {
  display:flex; justify-content:space-between; align-items:center;
  padding:6px 0; border-bottom:1px solid #ffffff0a;
  font-size:11px;
}
.xstat-name { color:#aaa; }
.xstat-val  { color:#fff; font-weight:bold; }

/* Equip slot */
.xequip-slot {
  display:flex; align-items:center; gap:10px;
  padding:10px; border-radius:8px; margin-bottom:8px;
  background:rgba(255,255,255,0.04); border:1px solid #333;
  cursor:pointer; transition:border-color 0.2s;
}
.xequip-slot:hover { border-color:#f0c04066; }
.xequip-icon {
  width:36px; height:36px; border-radius:6px;
  background:#111; border:1px solid #444;
  display:flex; align-items:center; justify-content:center;
  font-size:18px; flex-shrink:0;
}
.xequip-info { flex:1; min-width:0; }
.xequip-name { font-size:11px; font-weight:bold; }
.xequip-sub  { font-size:9px; color:#888; margin-top:2px; }

/* Mount slot */
.xmount-card {
  padding:12px; border-radius:10px; margin-bottom:8px;
  border:1px solid #444; background:rgba(255,255,255,0.03);
  cursor:pointer; transition:all 0.2s;
}
.xmount-card:hover { border-color:#f0c04055; background:rgba(240,192,64,0.06); }
.xmount-card.equipped { border-color:#4caf50; background:rgba(76,175,80,0.1); }
.xmount-header { display:flex; align-items:center; gap:8px; margin-bottom:6px; }
.xmount-icon { font-size:24px; }
.xmount-name { font-size:12px; font-weight:bold; flex:1; }
.xmount-lvl  { font-size:10px; background:rgba(240,192,64,0.2); border:1px solid #f0c04044; border-radius:4px; padding:1px 6px; color:#f0c040; }
.xmount-stats{ font-size:10px; color:#8f8; }
.xmount-passive { font-size:9px; color:#8ef; margin-top:3px; }

/* Enhance panel */
.xenh-item {
  display:flex; align-items:center; gap:8px; padding:8px 10px;
  border-radius:8px; margin-bottom:6px;
  background:rgba(255,255,255,0.04); border:1px solid #333;
  cursor:pointer; transition:all 0.2s;
}
.xenh-item:hover { border-color:#4fc3f777; background:rgba(79,195,247,0.06); }
.xenh-item.selected { border-color:#4fc3f7; background:rgba(79,195,247,0.1); }
.xenh-preview {
  padding:12px; border-radius:10px; margin-top:8px;
  background:rgba(255,255,255,0.04); border:1px solid #4fc3f744;
}

/* Quest panel */
.xquest-item {
  padding:10px; border-radius:8px; margin-bottom:8px;
  background:rgba(255,255,255,0.04); border:1px solid #333;
}
.xquest-name  { font-size:11px; font-weight:bold; color:#f0c040; margin-bottom:4px; }
.xquest-desc  { font-size:10px; color:#aaa; margin-bottom:6px; }
.xquest-prog  { height:6px; background:#222; border-radius:3px; overflow:hidden; }
.xquest-fill  { height:100%; background:linear-gradient(90deg,#4caf50,#8bc34a); border-radius:3px; transition:width 0.3s; }
.xquest-reward{ font-size:9px; color:#8f8; margin-top:4px; }

/* Skill card */
.xskill-card {
  padding:10px; border-radius:8px; margin-bottom:8px;
  background:rgba(255,255,255,0.04); border:1px solid #333; display:flex; gap:10px;
}
.xskill-ico { width:44px; height:44px; border-radius:8px; background:#111; border:1px solid #444; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.xskill-info { flex:1; }
.xskill-name { font-size:11px; font-weight:bold; color:#f0c040; }
.xskill-desc { font-size:9px; color:#888; margin:3px 0; }
.xskill-stats { font-size:9px; color:#8ef; }

/* Meridian embedded */
.xmeridian-grid {
  display:grid; grid-template-columns:repeat(3,1fr); gap:8px; padding:4px 0;
}
.xmeridian-node {
  padding:8px 6px; border-radius:8px; text-align:center;
  background:rgba(255,255,255,0.04); border:1px solid #333;
  cursor:pointer; transition:all 0.2s;
}
.xmeridian-node.unlocked { border-color:#4caf50; background:rgba(76,175,80,0.12); }
.xmeridian-node.unlocking { border-color:#ff9800; background:rgba(255,152,0,0.1); animation:rmPulse2 1s infinite; }
@keyframes rmPulse2 { 0%,100%{opacity:1} 50%{opacity:0.7} }
.xmeridian-node .mn-icon { font-size:18px; margin-bottom:3px; }
.xmeridian-node .mn-name { font-size:9px; color:#ccc; }
.xmeridian-node .mn-bonus { font-size:8px; color:#8f8; margin-top:2px; }
.xmeridian-node .mn-status { font-size:8px; color:#f0c040; margin-top:2px; }

/* Section headers */
.xsection { color:#f0c040; font-size:10px; font-weight:bold; letter-spacing:1px; text-transform:uppercase; margin:12px 0 8px; padding-bottom:4px; border-bottom:1px solid #f0c04033; }

/* Wanted list */
.xwanted-card {
  display:flex; align-items:center; gap:10px; padding:10px;
  border-radius:8px; margin-bottom:8px;
  background:rgba(244,67,54,0.06); border:1px solid #f4433644;
}
.xwanted-badge { background:#f44336; color:#fff; font-size:9px; font-weight:bold; padding:2px 6px; border-radius:4px; }
.xwanted-name  { font-size:11px; color:#f88; font-weight:bold; }
.xwanted-bounty{ font-size:10px; color:#ffd700; }

/* Cultivation method */
.xmethod-card {
  padding:12px; border-radius:10px; margin-bottom:8px;
  border:1px solid #444; cursor:pointer; transition:all 0.2s;
}
.xmethod-card:hover { transform:translateY(-1px); }
.xmethod-card.active { box-shadow:0 0 16px rgba(240,192,64,0.25); }

/* Info boxes */
.xinfo-box {
  padding:10px 12px; border-radius:8px;
  background:rgba(240,192,64,0.07); border:1px solid #f0c04033;
  font-size:10px; color:#ccc; line-height:1.6;
}

/* Fate roll cards */
.xfate-card {
  padding:10px; border-radius:8px; margin-bottom:6px;
  background:rgba(124,77,255,0.1); border:1px solid #7c4dff44;
}
.xfate-name { font-size:11px; font-weight:bold; color:#ce93d8; }
.xfate-desc { font-size:9px; color:#888; margin-top:3px; }
.xfate-rarity { font-size:8px; margin-top:3px; }
.xfate-rarity.common { color:#aaa; }
.xfate-rarity.rare   { color:#a855f7; }

/* Rarity colors */
.rarity-common    { color:#ccc; }
.rarity-rare      { color:#a855f7; }
.rarity-epic      { color:#f97316; }
.rarity-legendary { color:#f0c040; }

/* Action buttons */
.xbtn {
  display:inline-block; padding:8px 16px; border-radius:8px;
  border:1px solid #f0c04066; background:rgba(240,192,64,0.1);
  color:#f0c040; font-size:10px; font-family:'Courier New',monospace;
  cursor:pointer; transition:all 0.2s; margin:4px 4px 0 0;
}
.xbtn:hover  { background:rgba(240,192,64,0.2); border-color:#f0c040; }
.xbtn:active { transform:scale(0.96); }
.xbtn.danger { border-color:#f4433666; background:rgba(244,67,54,0.1); color:#f44; }
.xbtn.danger:hover { background:rgba(244,67,54,0.2); }
.xbtn.green  { border-color:#4caf5066; background:rgba(76,175,80,0.1); color:#4caf50; }
.xbtn.green:hover { background:rgba(76,175,80,0.2); }
`;
    document.head.appendChild(style);

    // Build HTML
    const wrap = document.createElement('div');
    wrap.id = 'radialMenuWrap';
    wrap.innerHTML = `
<div class="rm-ring-wrap" id="rmRingWrap">
  <div class="rm-ring rm-ring-1"></div>
  <div class="rm-ring rm-ring-2"></div>
  <div class="rm-ring rm-ring-3"></div>
</div>
<div class="radial-menu" id="rmMenu">
  <button class="rm-main" id="rmMainBtn"><div class="rm-pulse"></div></button>
  <button class="rm-child rm-c1" data-panel="character"><span>👤</span><span class="rm-child-lbl">Nhân Vật</span></button>
  <button class="rm-child rm-c2" data-panel="skill">    <span>⚔️</span><span class="rm-child-lbl">Kỹ Năng</span></button>
  <button class="rm-child rm-c3" data-panel="inventory"><span>🎒</span><span class="rm-child-lbl">Túi Đồ</span></button>
  <button class="rm-child rm-c4" data-panel="quest">    <span>📜</span><span class="rm-child-lbl">Nhiệm Vụ</span></button>
  <button class="rm-child rm-c5" data-panel="wanted">   <span>🎯</span><span class="rm-child-lbl">Truy Nã</span></button>
  <button class="rm-child rm-c6" data-panel="wandering"><span>🌟</span><span class="rm-child-lbl">Du Tiên</span></button>
  <button class="rm-child rm-c7" data-panel="achievement"><span>🏆</span><span class="rm-child-lbl">Thành Tựu</span></button>
  <button class="rm-child rm-c8" data-panel="map">      <span>🗺️</span><span class="rm-child-lbl">Bản Đồ</span></button>
  <button class="rm-child rm-c9" data-panel="extcult">  <span>🌿</span><span class="rm-child-lbl">Ngoại Tu</span></button>
</div>`;
    document.body.appendChild(wrap);

    // Inject panel HTML
    this._injectPanels();

    // Events
    const mainBtn = document.getElementById('rmMainBtn');
    const rmMenu  = document.getElementById('rmMenu');
    const rmRings = document.getElementById('rmRingWrap');
    let isOpen = false;

    mainBtn.addEventListener('click', () => {
      isOpen = !isOpen;
      rmMenu.classList.toggle('rm-open', isOpen);
      rmRings.classList.toggle('rm-open', isOpen);
    });

    document.querySelectorAll('.rm-child').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const panel = btn.dataset.panel;
        document.querySelectorAll('.rm-child').forEach(b => b.classList.remove('rm-active'));
        btn.classList.add('rm-active');
        setTimeout(() => {
          isOpen = false;
          rmMenu.classList.remove('rm-open');
          rmRings.classList.remove('rm-open');
          btn.classList.remove('rm-active');
        }, 400);
        this.openPanel(panel);
      });
    });

    document.addEventListener('click', e => {
      if (isOpen && !wrap.contains(e.target)) {
        isOpen = false;
        rmMenu.classList.remove('rm-open');
        rmRings.classList.remove('rm-open');
      }
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        isOpen = false;
        rmMenu.classList.remove('rm-open');
        rmRings.classList.remove('rm-open');
        if (this.activePanel) this.closePanel(this.activePanel);
      }
    });
  },

  // ==================== INJECT ALL PANEL HTML ====================
  _injectPanels() {
    const panels = `
<!-- ===== NHÂN VẬT PANEL ===== -->
<div class="xpanel" id="xp-characterPanel">
  <div class="xpanel-box">
    <div class="xpanel-header">
      <span class="xpanel-title">👤 NHÂN VẬT</span>
      <button class="xpanel-close" onclick="UI.closePanel('character')">✕</button>
    </div>
    <div class="xpanel-tabs">
      <button class="xtab active" onclick="UI.switchXTab('character','charInfo',this)">📊 Thông Tin</button>
      <button class="xtab"        onclick="UI.switchXTab('character','charEquip',this)">🛡️ Trang Bị</button>
      <button class="xtab"        onclick="UI.switchXTab('character','charMount',this)">🐎 Tọa Kỵ</button>
      <button class="xtab"        onclick="UI.switchXTab('character','charMethod',this)">📖 Tâm Pháp</button>
      <button class="xtab"        onclick="UI.switchXTab('character','charPet',this)">🐾 Linh Thú</button>
    </div>
    <div class="xpanel-content">
      <div class="xtabpane active" id="charInfo"></div>
      <div class="xtabpane"        id="charEquip"></div>
      <div class="xtabpane"        id="charMount"></div>
      <div class="xtabpane"        id="charMethod"></div>
      <div class="xtabpane"        id="charPet"></div>
    </div>
  </div>
</div>

<!-- ===== TÚI ĐỒ PANEL ===== -->
<div class="xpanel" id="xp-inventoryPanel">
  <div class="xpanel-box">
    <div class="xpanel-header">
      <span class="xpanel-title">🎒 TÚI ĐỒ</span>
      <button class="xpanel-close" onclick="UI.closePanel('inventory')">✕</button>
    </div>
    <div class="xpanel-tabs">
      <button class="xtab active" onclick="UI.switchXTab('inventory','invBag',this)">🎒 Kho Đồ</button>
      <button class="xtab"        onclick="UI.switchXTab('inventory','invEnhance',this)">⬆️ Nâng Cấp</button>
      <button class="xtab"        onclick="UI.switchXTab('inventory','invMountUpg',this)">🐎 Nâng Kỵ</button>
      <button class="xtab"        onclick="UI.switchXTab('inventory','invSets',this)">🔗 Đồ Bộ</button>
    </div>
    <div class="xpanel-content">
      <div class="xtabpane active" id="invBag">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <div style="font-size:10px;color:#888" id="invCount">0/40</div>
          <div style="font-size:10px;color:#ffd700" id="invGold">💰 0</div>
        </div>
        <div style="display:flex;gap:4px;margin-bottom:8px;flex-wrap:wrap">
          <button class="xtab active" style="border-radius:6px" onclick="Inventory.switchTab(this,'all')">Tất Cả</button>
          <button class="xtab" style="border-radius:6px" onclick="Inventory.switchTab(this,'weapon')">Vũ Khí</button>
          <button class="xtab" style="border-radius:6px" onclick="Inventory.switchTab(this,'armor')">Giáp</button>
          <button class="xtab" style="border-radius:6px" onclick="Inventory.switchTab(this,'mount')">Tọa Kỵ</button>
          <button class="xtab" style="border-radius:6px" onclick="Inventory.switchTab(this,'consumable')">Tiêu Hao</button>
          <button class="xtab" style="border-radius:6px" onclick="Inventory.switchTab(this,'material')">Nguyên Liệu</button>
        </div>
        <div id="invGrid" style="display:grid;grid-template-columns:repeat(5,1fr);gap:5px"></div>
      </div>
      <div class="xtabpane" id="invEnhance"></div>
      <div class="xtabpane" id="invMountUpg"></div>
      <div class="xtabpane" id="invSets"></div>
    </div>
  </div>
</div>

<!-- ===== KỸ NĂNG PANEL ===== -->
<div class="xpanel" id="xp-skillPanel">
  <div class="xpanel-box">
    <div class="xpanel-header">
      <span class="xpanel-title">⚔️ KỸ NĂNG</span>
      <button class="xpanel-close" onclick="UI.closePanel('skill')">✕</button>
    </div>
    <div class="xpanel-tabs">
      <button class="xtab active" onclick="UI.switchXTab('skill','skillActive',this)">⚡ Chiêu Thức</button>
      <button class="xtab"        onclick="UI.switchXTab('skill','skillMeridian',this)">🫁 Kinh Mạch</button>
      <button class="xtab"        onclick="UI.switchXTab('skill','skillPassive',this)">🌀 Thụ Động</button>
    </div>
    <div class="xpanel-content">
      <div class="xtabpane active" id="skillActive"></div>
      <div class="xtabpane"        id="skillMeridian"></div>
      <div class="xtabpane"        id="skillPassive"></div>
    </div>
  </div>
</div>

<!-- ===== NHIỆM VỤ PANEL ===== -->
<div class="xpanel" id="xp-questPanel">
  <div class="xpanel-box">
    <div class="xpanel-header">
      <span class="xpanel-title">📜 NHIỆM VỤ</span>
      <button class="xpanel-close" onclick="UI.closePanel('quest')">✕</button>
    </div>
    <div class="xpanel-tabs">
      <button class="xtab active" onclick="UI.switchXTab('quest','questActive',this)">🔥 Đang Làm</button>
      <button class="xtab"        onclick="UI.switchXTab('quest','questNew',this)">✨ Nhiệm Vụ Mới</button>
      <button class="xtab"        onclick="UI.switchXTab('quest','questDone',this)">✅ Hoàn Thành</button>
    </div>
    <div class="xpanel-content">
      <div class="xtabpane active" id="questActive"></div>
      <div class="xtabpane"        id="questNew"></div>
      <div class="xtabpane"        id="questDone"></div>
    </div>
  </div>
</div>

<!-- ===== BẢN ĐỒ PANEL ===== -->
<div class="xpanel" id="xp-mapPanel">
  <div class="xpanel-box">
    <div class="xpanel-header">
      <span class="xpanel-title">🗺️ BẢN ĐỒ</span>
      <button class="xpanel-close" onclick="UI.closePanel('map')">✕</button>
    </div>
    <div class="xpanel-content" id="mapPanelContent">
    </div>
  </div>
</div>

<!-- ===== TRUY NÃ PANEL ===== -->
<div class="xpanel" id="xp-wantedPanel">
  <div class="xpanel-box">
    <div class="xpanel-header">
      <span class="xpanel-title">🎯 TRUY NÃ</span>
      <button class="xpanel-close" onclick="UI.closePanel('wanted')">✕</button>
    </div>
    <div class="xpanel-content" id="wantedPanelContent">
      <div class="xinfo-box">Đang tải danh sách truy nã...</div>
    </div>
  </div>
</div>

<!-- ===== DU TIÊN PANEL ===== -->
<div class="xpanel" id="xp-wanderingPanel">
  <div class="xpanel-box">
    <div class="xpanel-header">
      <span class="xpanel-title">🌟 DU TIÊN</span>
      <button class="xpanel-close" onclick="UI.closePanel('wandering')">✕</button>
    </div>
    <div class="xpanel-content" id="wanderingPanelContent">
      <div class="xinfo-box">Đang tìm kiếm du tiên...</div>
    </div>
  </div>
</div>

<!-- ===== THÀNH TỰU PANEL ===== -->
<div class="xpanel" id="xp-achievementPanel">
  <div class="xpanel-box">
    <div class="xpanel-header">
      <span class="xpanel-title">🏆 THÀNH TỰU</span>
      <button class="xpanel-close" onclick="UI.closePanel('achievement')">✕</button>
    </div>
    <div class="xpanel-content" id="achievementPanelContent">
      <div class="xinfo-box">Đang tải thành tựu...</div>
    </div>
  </div>
</div>

<!-- ===== NGOẠI TU PANEL ===== -->
<div class="xpanel" id="xp-extcultPanel">
  <div class="xpanel-box">
    <div class="xpanel-header">
      <span class="xpanel-title">🌿 NGOẠI TU</span>
      <button class="xpanel-close" onclick="UI.closePanel('extcult')">✕</button>
    </div>
    <div class="xpanel-content" id="extcultPanelContent">
      <div class="xinfo-box">Đang tải hệ thống ngoại tu...</div>
    </div>
  </div>
</div>

`;
    document.body.insertAdjacentHTML('beforeend', panels);
  },

  // ==================== TAB SWITCHER ====================
  switchXTab(panelId, tabId, btn) {
    const realId = this._panelIdMap[panelId] || (panelId + 'Panel');
    const panel = document.getElementById(realId);
    if (!panel) return;
    panel.querySelectorAll('.xtab').forEach(b => b.classList.remove('active'));
    panel.querySelectorAll('.xtabpane').forEach(p => p.classList.remove('active'));
    if (btn) btn.classList.add('active');
    const pane = document.getElementById(tabId);
    if (pane) pane.classList.add('active');
    this._renderTabContent(tabId);
  },

  _renderTabContent(tabId) {
    switch(tabId) {
      case 'charInfo':    this._renderCharInfo();    break;
      case 'charEquip':   this._renderCharEquip();   break;
      case 'charMount':   this._renderCharMount();   break;
      case 'charMethod':  this._renderCharMethod();  break;
      case 'charPet':     this._renderCharPet();     break;
      case 'invEnhance':  this._renderEnhanceTab();  break;
      case 'invMountUpg': this._renderMountUpgrade();break;
      case 'invSets':     this._renderSetItems();    break;
      case 'skillActive':  this._renderSkillActive(); break;
      case 'skillMeridian':this._renderMeridianEmbed();break;
      case 'skillPassive': this._renderSkillPassive();break;
      case 'questActive':  this._renderQuestActive(); break;
      case 'questNew':     this._renderQuestNew();    break;
      case 'questDone':    this._renderQuestDone();   break;
    }
  },

  // ==================== PANEL RENDERERS ====================

  renderCharacterPanel() {
    this._renderCharInfo();
  },

  _renderCharInfo() {
    const el = document.getElementById('charInfo');
    if (!el) return;
    const realm = REALMS[Player.realm];
    const realmPct = (Player.realmExp / Player.realmMaxExp * 100).toFixed(1);

    // Mount stats
    let mountBonuses = this._getMountBonuses();

    el.innerHTML = `
<div class="xinfo-box" style="margin-bottom:12px">
  <div style="color:#f0c040;font-weight:bold;margin-bottom:6px">🌟 ${realm.name} — Tầng ${Player.realmStage}</div>
  <div class="stat-bar" style="height:10px;margin-bottom:3px">
    <div class="stat-bar-fill exp-fill" id="realmBar" style="width:${realmPct}%"></div>
  </div>
  <div style="font-size:9px;color:#888;text-align:right">${Player.realmExp}/${Player.realmMaxExp} Tu Vi</div>
</div>
<div class="xsection">📊 Chỉ Số</div>
${this._statRow('⚔️ Công kích',   Player.atk + (mountBonuses.atk||0),  mountBonuses.atk ? `+${mountBonuses.atk} kỵ` : '')}
${this._statRow('🛡️ Phòng ngự',   Player.def + (mountBonuses.def||0),  mountBonuses.def ? `+${mountBonuses.def} kỵ` : '')}
${this._statRow('❤️ Sinh mệnh',   `${Player.hp}/${Player.maxHp}`)}
${this._statRow('💎 Linh lực',    `${Player.mp}/${Player.maxMp}`)}
${this._statRow('💨 Tốc độ',      (Player.speed + (mountBonuses.speed||0)).toFixed(1), mountBonuses.speed ? `+${mountBonuses.speed} kỵ` : '')}
${this._statRow('💥 Bạo kích',    ((Player.critRate + (mountBonuses.critRate||0))*100).toFixed(1)+'%')}
${this._statRow('🔥 Bạo thương',  (Player.critDmg*100).toFixed(0)+'%')}
${this._statRow('📊 Level',       Player.level)}
${this._statRow('⭐ EXP',         `${Player.exp}/${Player.maxExp}`)}
${this._statRow('💰 Vàng',        Utils.formatNumber(Player.gold))}
`;
  },

  _statRow(name, val, sub='') {
    return `<div class="xstat-row"><span class="xstat-name">${name}</span><span class="xstat-val">${val}${sub ? `<span style="color:#4caf50;font-size:8px;margin-left:4px">${sub}</span>` : ''}</span></div>`;
  },

  _getMountBonuses() {
    const mountId = Player.equipped && Player.equipped.mount;
    if (!mountId || !ITEMS[mountId]) return {};
    const mount = ITEMS[mountId];
    const lvl = Player.mountLevels?.[mountId] || 0;
    const mul = MOUNT_CONFIG.getStatMultiplier(lvl);
    const bonuses = {};
    for (const [k, v] of Object.entries(mount.stats || {})) {
      bonuses[k] = parseFloat((v * mul).toFixed(1));
    }
    return bonuses;
  },

  _renderCharEquip() {
    const el = document.getElementById('charEquip');
    if (!el) return;
    const slots = [
      { key:'weapon',    icon:'⚔️', name:'Vũ Khí'  },
      { key:'armor',     icon:'🛡️', name:'Giáp'    },
      { key:'accessory', icon:'💍', name:'Phụ Kiện' }
    ];
    let html = `<div class="xsection">🛡️ Trang Bị Đang Mặc</div>`;
    for (const slot of slots) {
      const itemId   = Player.equipped?.[slot.key];
      const itemData = itemId ? ITEMS[itemId] : null;
      const rarityClass = itemData ? `rarity-${itemData.rarity}` : '';
      const enhLvl = itemData && Player.enhanceLevels?.[itemId] ? `+${Player.enhanceLevels[itemId]}` : '';
      html += `
<div class="xequip-slot" onclick="${itemId ? `UI._unequipConfirm('${slot.key}')` : ''}">
  <div class="xequip-icon">${itemData ? (itemData.icon ? itemData.icon : slot.icon) : slot.icon}</div>
  <div class="xequip-info">
    <div class="xequip-name ${rarityClass}">${itemData ? itemData.name : '(Trống)'} ${enhLvl ? `<span style="color:#4fc3f7">${enhLvl}</span>` : ''}</div>
    <div class="xequip-sub">${itemData ? this._formatItemStats(itemData.stats) : slot.name}</div>
  </div>
  ${itemId ? '<span style="color:#f44;font-size:10px">✕ Tháo</span>' : ''}
</div>`;
    }

    // Sets section
    html += `<div class="xsection" style="margin-top:16px">🔗 Đồ Bộ Đang Kích Hoạt</div>`;
    html += this._getActiveSetBonusHTML();
    el.innerHTML = html;
  },

  _formatItemStats(stats) {
    if (!stats) return '';
    const names = { atk:'ATK', def:'DEF', hp:'HP', mp:'MP', critRate:'Bạo kích', critDmg:'Bạo thương', speed:'Tốc độ' };
    return Object.entries(stats).map(([k,v]) => {
      const disp = k.includes('crit') ? `+${(v*100).toFixed(0)}%` : `+${v}`;
      return `${names[k]||k} ${disp}`;
    }).join(' · ');
  },

  _unequipConfirm(slot) {
    const itemId = Player.equipped?.[slot];
    if (!itemId) return;
    if (confirm(`Tháo ${ITEMS[itemId]?.name}?`)) {
      Player.unequip(slot);
      this._renderCharEquip();
      if (typeof EnhanceSystem !== 'undefined') EnhanceSystem._applyAllEnhances?.();
    }
  },

  _getActiveSetBonusHTML() {
    // Integrate with SetItems from feature_gameplay_depth if available
    if (typeof SetItemSystem !== 'undefined' && SetItemSystem.getActiveBonuses) {
      const bonuses = SetItemSystem.getActiveBonuses();
      if (!bonuses || bonuses.length === 0) return `<div style="color:#666;font-size:10px;text-align:center;padding:8px">Chưa có bộ trang bị hoàn chỉnh</div>`;
      return bonuses.map(b => `<div class="xinfo-box" style="margin-bottom:6px"><span style="color:#f0c040">${b.name}</span> — <span style="color:#8f8">${b.desc}</span></div>`).join('');
    }
    return `<div style="color:#666;font-size:10px;text-align:center;padding:8px">Trang bị đủ bộ để nhận bonus</div>`;
  },

  _renderCharMount() {
    const el = document.getElementById('charMount');
    if (!el) return;
    const mounts = Inventory.items.filter(i => ITEMS[i.id]?.type === 'mount');
    const equippedMount = Player.equipped?.mount;

    let html = `<div class="xsection">🐎 Tọa Kỵ Đang Cưỡi</div>`;
    if (equippedMount && ITEMS[equippedMount]) {
      const m = ITEMS[equippedMount];
      const lvl = Player.mountLevels?.[equippedMount] || 0;
      const bonuses = this._getMountBonuses();
      html += `
<div class="xmount-card equipped">
  <div class="xmount-header">
    <span class="xmount-icon">${m.icon||'🐎'}</span>
    <span class="xmount-name rarity-${m.rarity}">${m.name}</span>
    <span class="xmount-lvl">+${lvl}</span>
    <button class="xbtn danger" onclick="UI._dismount()" style="padding:4px 8px;font-size:9px">Xuống Kỵ</button>
  </div>
  <div class="xmount-stats">${this._formatItemStats(m.stats)}</div>
  <div class="xmount-passive">✨ ${m.passiveDesc || ''}</div>
  ${Object.keys(bonuses).length ? `<div style="font-size:9px;color:#4caf50;margin-top:4px">Đang áp dụng: ${Object.entries(bonuses).map(([k,v])=>`${k}+${v}`).join(', ')}</div>` : ''}
</div>`;
    } else {
      html += `<div style="color:#666;font-size:10px;text-align:center;padding:12px">Chưa cưỡi tọa kỵ</div>`;
    }

    html += `<div class="xsection" style="margin-top:16px">🎒 Tọa Kỵ Trong Kho</div>`;
    if (mounts.length === 0) {
      html += `<div style="color:#666;font-size:10px;text-align:center;padding:12px">Chưa có tọa kỵ. Tiêu diệt boss để nhận!</div>`;
    } else {
      for (const inv of mounts) {
        const m = ITEMS[inv.id];
        const lvl = Player.mountLevels?.[inv.id] || 0;
        const isEq = inv.id === equippedMount;
        html += `
<div class="xmount-card ${isEq?'equipped':''}">
  <div class="xmount-header">
    <span class="xmount-icon">${m.icon||'🐎'}</span>
    <span class="xmount-name rarity-${m.rarity}">${m.name}</span>
    <span class="xmount-lvl">+${lvl}</span>
    ${!isEq ? `<button class="xbtn green" onclick="UI._equipMount('${inv.id}')" style="padding:4px 8px;font-size:9px">Cưỡi</button>` : `<span style="color:#4caf50;font-size:9px">▶ Đang Cưỡi</span>`}
  </div>
  <div class="xmount-stats">${this._formatItemStats(m.stats)}</div>
  <div style="font-size:9px;color:#888;margin-top:4px">${m.desc}</div>
  ${m.passiveDesc ? `<div class="xmount-passive">✨ ${m.passiveDesc}</div>` : ''}
</div>`;
      }
    }
    el.innerHTML = html;
  },

  _equipMount(mountId) {
    if (!Player.equipped) Player.equipped = {};
    Player.equipped.mount = mountId;
    Player.recalculateStats?.();
    UI.showNotification('🐎 Tọa Kỵ!', `Đã cưỡi ${ITEMS[mountId]?.name}`);
    this._renderCharMount();
    this._renderCharInfo();
  },

  _dismount() {
    if (!Player.equipped) return;
    Player.equipped.mount = null;
    Player.recalculateStats?.();
    UI.showNotification('🐎 Xuống Kỵ', 'Đã xuống tọa kỵ');
    this._renderCharMount();
    this._renderCharInfo();
  },

  _renderCharMethod() {
    const el = document.getElementById('charMethod');
    if (!el) return;
    // Delegate to CultivationMethodSystem if available
    if (typeof CultivationMethodSystem !== 'undefined') {
      el.innerHTML = CultivationMethodSystem._buildPanelHTML?.() || '<div class="xinfo-box">Hệ thống Tâm Pháp đang tải...</div>';
      return;
    }
    el.innerHTML = `<div class="xinfo-box">Tâm Pháp chưa được mở khóa. Cần feature_character_build.js</div>`;
  },

  _renderCharPet() {
    const el = document.getElementById('charPet');
    if (!el) return;
    let html = `<div class="xsection">🐾 Linh Thú / Thần Thú</div>`;

    const hasDivinePet = Player.divinePet && Player.ownedDivinePets?.length > 0;

    if (hasDivinePet) {
      html += `<div class="xinfo-box" style="border-color:#f0c04066;margin-bottom:10px"><span style="color:#f0c040">✨ Thần Thú</span> đã được triệu hồi!</div>`;
      // Divine pets from feature_ancient_beast or similar
      for (const pid of (Player.ownedDivinePets || [])) {
        const isActive = pid === Player.divinePet;
        html += `<div class="xmount-card ${isActive?'equipped':''}">
<div class="xmount-header"><span style="font-size:20px">🐉</span><span class="xmount-name rarity-legendary">${pid}</span>
${!isActive ? `<button class="xbtn green" onclick="Player.setDivinePet?.('${pid}')" style="padding:4px 8px;font-size:9px">Triệu Hồi</button>` : '<span style="color:#f0c040;font-size:9px">▶ Hoạt Động</span>'}
</div></div>`;
      }
    }

    html += `<div class="xsection">🐾 Linh Thú Thường (+10% EXP)</div>`;
    if (Player.activePet && PETS[Player.activePet]) {
      const pet = PETS[Player.activePet];
      const bonusKey = Object.keys(pet.bonus)[0];
      const bonusVal = pet.bonus[bonusKey];
      html += `
<div class="xmount-card equipped">
  <div class="xmount-header">
    <canvas id="charPetCanvas" width="32" height="32" style="image-rendering:pixelated;border-radius:6px;background:#111;border:1px solid #4caf50"></canvas>
    <span class="xmount-name" style="color:#4caf50">${pet.name}</span>
    <button class="xbtn danger" onclick="Player.setActivePet(null);UI._renderCharPet()" style="padding:4px 8px;font-size:9px">Thu Hồi</button>
  </div>
  <div class="xmount-stats">${bonusKey}: +${bonusVal} · EXP +10%</div>
</div>`;
    } else if (Player.ownedPets?.length > 0) {
      html += `<div style="color:#888;font-size:10px;margin-bottom:8px">Chọn linh thú để triệu hồi:</div>`;
    }
    for (const pId of (Player.ownedPets || [])) {
      if (pId === Player.activePet) continue;
      const p = PETS[pId];
      html += `<button class="xbtn" onclick="Player.setActivePet('${pId}');UI._renderCharPet()" style="margin-bottom:6px;width:100%;text-align:left">🐾 ${p.name}</button>`;
    }
    if (!Player.ownedPets?.length && !hasDivinePet) {
      html += `<div style="color:#666;font-size:10px;text-align:center;padding:12px">Chưa có linh thú. Mua từ NPC Shop!</div>`;
    }

    el.innerHTML = html;
    // Draw pet sprite
    setTimeout(() => {
      const cv = document.getElementById('charPetCanvas');
      if (cv && Player.activePet) {
        const ctx = cv.getContext('2d');
        ctx.clearRect(0, 0, 32, 32);
        const sprite = Sprites.getPetSprite(Player.activePet, false);
        Sprites.drawPixelArt(ctx, sprite, 2, 0, 0);
      }
    }, 10);
  },

  // ==================== INVENTORY TAB RENDERERS ====================

  renderInventoryPanel() {
    Inventory.render();
    this._renderEnhanceTab();
  },

  _renderEnhanceTab() {
    const el = document.getElementById('invEnhance');
    if (!el) return;
    if (typeof EnhanceSystem !== 'undefined' && EnhanceSystem._buildPanelHTML) {
      el.innerHTML = EnhanceSystem._buildPanelHTML();
      EnhanceSystem._bindPanelEvents?.();
      return;
    }
    // Fallback inline enhance
    const equippable = Inventory.items.filter(i => ['weapon','armor','accessory'].includes(ITEMS[i.id]?.type));
    if (!equippable.length) {
      el.innerHTML = `<div class="xinfo-box">Chưa có trang bị để nâng cấp</div>`;
      return;
    }
    let html = `<div class="xsection">⬆️ Nâng Cấp Trang Bị</div>`;
    for (const inv of equippable) {
      const d = ITEMS[inv.id];
      const lvl = Player.enhanceLevels?.[inv.id] || 0;
      html += `<div class="xenh-item" onclick="UI._selectEnhanceItem('${inv.id}')">
<span style="font-size:18px">${d.icon||'⚔️'}</span>
<div style="flex:1"><div class="rarity-${d.rarity}" style="font-size:11px">${d.name} <span style="color:#4fc3f7">+${lvl}</span></div><div style="font-size:9px;color:#888">${this._formatItemStats(d.stats)}</div></div>
</div>`;
    }
    el.innerHTML = html;
  },

  _selectEnhanceItem(itemId) {
    if (typeof EnhanceSystem !== 'undefined' && EnhanceSystem.enhance) {
      EnhanceSystem.enhance(itemId);
    }
  },

  _renderMountUpgrade() {
    const el = document.getElementById('invMountUpg');
    if (!el) return;
    const mounts = Inventory.items.filter(i => ITEMS[i.id]?.type === 'mount');
    if (!mounts.length) {
      el.innerHTML = `<div class="xinfo-box">Chưa có tọa kỵ để nâng cấp</div>`;
      return;
    }
    let html = `<div class="xsection">🐎 Nâng Cấp Tọa Kỵ</div><div class="xinfo-box" style="margin-bottom:10px">Nâng cấp tăng 12% tất cả chỉ số tọa kỵ mỗi cấp (tối đa +10)</div>`;
    for (const inv of mounts) {
      const m = ITEMS[inv.id];
      const lvl = Player.mountLevels?.[inv.id] || 0;
      const maxed = lvl >= 10;
      const matCfg = MOUNT_CONFIG.materials[Math.min(lvl, 9)];
      const successPct = Math.round((MOUNT_CONFIG.successRate[Math.min(lvl,9)] || 0.2) * 100);
      const matList = matCfg.items.map(i => `${ITEMS[i.id]?.name||i.id} x${i.count}`).join(', ');
      html += `
<div class="xenh-preview" style="margin-bottom:10px">
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
    <span style="font-size:22px">${m.icon||'🐎'}</span>
    <div class="rarity-${m.rarity}" style="font-size:12px;font-weight:bold">${m.name} <span style="color:#4fc3f7">+${lvl}</span></div>
  </div>
  <div style="font-size:10px;color:#888;margin-bottom:6px">${m.passiveDesc||''}</div>
  ${!maxed ? `
  <div style="font-size:10px;color:#aaa;margin-bottom:4px">📦 Cần: ${matList} + ${matCfg.gold}💰 | Tỉ lệ: ${successPct}%</div>
  <button class="xbtn green" onclick="UI._upgradeMount('${inv.id}')" style="width:100%">⬆️ Nâng Cấp +${lvl+1}</button>` 
  : `<div style="color:#f0c040;text-align:center;font-size:11px">🏆 Đã đạt cấp tối đa +10</div>`}
</div>`;
    }
    el.innerHTML = html;
  },

  _upgradeMount(mountId) {
    if (!Player.mountLevels) Player.mountLevels = {};
    const lvl = Player.mountLevels[mountId] || 0;
    if (lvl >= 10) { UI.addLog('❌ Tọa kỵ đã đạt cấp tối đa!', 'system'); return; }
    const matCfg = MOUNT_CONFIG.materials[lvl];
    // Check materials
    for (const mat of matCfg.items) {
      if (!Inventory.has(mat.id, mat.count)) {
        UI.addLog(`❌ Thiếu ${ITEMS[mat.id]?.name||mat.id} x${mat.count}`, 'system');
        return;
      }
    }
    if (Player.gold < matCfg.gold) { UI.addLog('❌ Thiếu vàng!', 'system'); return; }
    // Consume
    for (const mat of matCfg.items) Inventory.remove(mat.id, mat.count);
    Player.gold -= matCfg.gold;
    UI.updateGold();
    // Check success
    const success = Math.random() < (MOUNT_CONFIG.successRate[lvl] || 0.2);
    if (success) {
      Player.mountLevels[mountId] = lvl + 1;
      UI.showNotification('🐎 Nâng Cấp Thành Công!', `${ITEMS[mountId]?.name} → +${lvl+1}`);
      UI.addLog(`✅ Tọa kỵ ${ITEMS[mountId]?.name} nâng lên +${lvl+1}!`, 'realm');
    } else {
      UI.addLog(`❌ Nâng cấp thất bại! ${ITEMS[mountId]?.name} vẫn ở +${lvl}`, 'system');
    }
    this._renderMountUpgrade();
    if (Player.equipped?.mount === mountId) Player.recalculateStats?.();
  },

  _renderSetItems() {
    const el = document.getElementById('invSets');
    if (!el) return;
    if (typeof SET_ITEMS !== 'undefined') {
      let html = `<div class="xsection">🔗 Bộ Trang Bị</div>`;
      for (const [setId, set] of Object.entries(SET_ITEMS)) {
        const ownedCount = set.pieces.filter(p => Inventory.has(p) || Object.values(Player.equipped||{}).includes(p)).length;
        const total = set.pieces.length;
        html += `
<div class="xenh-preview" style="margin-bottom:8px">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
    <span style="font-size:12px;font-weight:bold;color:#f0c040">${set.name}</span>
    <span style="font-size:10px;color:${ownedCount===total?'#4caf50':'#888'}">${ownedCount}/${total}</span>
  </div>
  <div style="font-size:9px;color:#888;margin-bottom:6px">${set.pieces.map(p => ITEMS[p]?.name||p).join(' · ')}</div>
  ${set.bonuses?.map(b => `<div style="font-size:10px;color:${ownedCount>=b.count?'#8f8':'#666'}">(${b.count}p) ${b.desc}</div>`).join('')||''}
</div>`;
      }
      el.innerHTML = html;
    } else {
      el.innerHTML = `<div class="xinfo-box">Hệ thống đồ bộ chưa được tải (feature_gameplay_depth.js)</div>`;
    }
  },

  // ==================== SKILL PANEL ====================

  renderSkillPanel() {
    this._renderSkillActive();
  },

  _renderSkillActive() {
    const el = document.getElementById('skillActive');
    if (!el) return;
    let html = `<div class="xsection">⚡ Chiêu Thức Chủ Động</div>`;
    for (const skill of (Player.skills || [])) {
      const evo = skill._evolved ? `<span style="color:#4fc3f7;font-size:9px">▲ Tiến Hóa: ${skill.name}</span>` : '';
      const uses = Player.skillUses?.[skill.id] || 0;
      html += `
<div class="xskill-card">
  <div class="xskill-ico"><canvas id="skillPanelIcon${skill.id}" width="24" height="24" style="image-rendering:pixelated"></canvas></div>
  <div class="xskill-info">
    <div class="xskill-name">${skill.name}</div>
    <div class="xskill-desc">${skill.desc}</div>
    <div class="xskill-stats">
      DMG: ×${skill.dmgMul} · MP: ${skill.mp} · CD: ${(skill.maxCd/1000).toFixed(1)}s · Tầm: ${skill.range}
    </div>
    ${evo}
    <div style="font-size:9px;color:#666;margin-top:2px">Đã dùng: ${uses} lần</div>
  </div>
</div>`;
    }
    // Limit break section
    if (typeof LimitBreakSystem !== 'undefined') {
      html += `<div class="xsection" style="margin-top:16px">💥 Giới Hạn Đột Phá</div>`;
      html += LimitBreakSystem._buildSummaryHTML?.() || `<div class="xinfo-box">Đang tải...</div>`;
    }
    el.innerHTML = html;
    // Draw icons — copy từ canvas skill gốc trên HUD
    setTimeout(() => {
      for (const skill of (Player.skills || [])) {
        const cv = document.getElementById(`skillPanelIcon${skill.id}`);
        const src = document.getElementById(`skillIcon${skill.id}`);
        if (cv && src) {
          const ctx = cv.getContext('2d');
          ctx.clearRect(0, 0, 24, 24);
          ctx.drawImage(src, 0, 0, 24, 24);
        }
      }
    }, 10);
  },

  _renderMeridianEmbed() {
    const el = document.getElementById('skillMeridian');
    if (!el) return;
    if (typeof MeridianSystem !== 'undefined' && MeridianSystem._buildEmbedHTML) {
      el.innerHTML = MeridianSystem._buildEmbedHTML();
      MeridianSystem._bindEmbedEvents?.();
      return;
    }
    // Fallback grid
    if (typeof MeridianSystem !== 'undefined') {
      let html = `<div class="xsection">🫁 Khai Mạch</div><div class="xmeridian-grid">`;
      for (const m of MeridianSystem.meridians || []) {
        const s = MeridianSystem.state?.[m.id] || {};
        const cls = s.unlocked ? 'unlocked' : s.unlockingUntil ? 'unlocking' : '';
        const status = s.unlocked ? '✅ Thông' : s.unlockingUntil ? '⏳ Khai...' : `${m.realmCost} Tu Vi`;
        html += `
<div class="xmeridian-node ${cls}" onclick="UI._triggerMeridian(${m.id})">
  <div class="mn-icon">${m.icon}</div>
  <div class="mn-name">${m.name.split(' ').slice(-1)[0]}</div>
  <div class="mn-bonus">${m.desc.split(' ').slice(0,3).join(' ')}</div>
  <div class="mn-status">${status}</div>
</div>`;
      }
      html += `</div>`;
      el.innerHTML = html;
    } else {
      el.innerHTML = `<div class="xinfo-box">Kinh Mạch chưa tải (feature_meridian.js)</div>`;
    }
  },

  _triggerMeridian(id) {
    if (typeof MeridianSystem !== 'undefined') {
      const s = MeridianSystem.state?.[id];
      if (!s?.unlocked && !s?.unlockingUntil) {
        MeridianSystem.startUnlock(id);
        this._renderMeridianEmbed();
      }
    }
  },

  _renderSkillPassive() {
    const el = document.getElementById('skillPassive');
    if (!el) return;
    let html = `<div class="xsection">🌀 Kỹ Năng Thụ Động</div>`;
    // Fate passives
    if (typeof FateSystem !== 'undefined' && Player.fates?.length) {
      html += `<div class="xinfo-box" style="margin-bottom:8px">🎲 Vận Mệnh</div>`;
      for (const fate of Player.fates) {
        const fCfg = FATE_CONFIG?.pool?.find(f => f.id === fate);
        if (fCfg) html += `<div class="xfate-card"><div class="xfate-name">${fCfg.name}</div><div class="xfate-desc">${fCfg.desc}</div><div class="xfate-rarity ${fCfg.rarity}">${fCfg.rarity}</div></div>`;
      }
    }
    // Wandering immortal passives
    if (Player.immortalPassives?.length) {
      html += `<div class="xsection">🌟 Từ Du Tiên</div>`;
      for (const p of Player.immortalPassives) {
        html += `<div class="xskill-card"><div style="font-size:20px;width:44px;text-align:center">✨</div><div class="xskill-info"><div class="xskill-name">${p.name}</div><div class="xskill-desc">${p.desc}</div></div></div>`;
      }
    }
    // Exterior cultivation passives
    if (typeof ExteriorCultivationSystem !== 'undefined') {
      html += `<div class="xsection">🌿 Ngoại Tu</div>`;
      html += ExteriorCultivationSystem._buildPassiveSummary?.() || `<div class="xinfo-box">Ngoại Tu chưa tải</div>`;
    }
    if (html === `<div class="xsection">🌀 Kỹ Năng Thụ Động</div>`) {
      html += `<div style="color:#666;font-size:10px;text-align:center;padding:16px">Chưa có kỹ năng thụ động</div>`;
    }
    el.innerHTML = html;
  },

  // ==================== QUEST PANEL ====================

  renderQuestPanel() {
    this._renderQuestActive();
  },

  _renderQuestActive() {
    const el = document.getElementById('questActive');
    if (!el) return;
    // Existing Quests system
    let html = '';
    const active = (typeof Quests !== 'undefined') ? Quests.active : [];
    if (!active || active.length === 0) {
      html = `<div style="color:#666;font-size:10px;text-align:center;padding:16px">Không có nhiệm vụ đang làm</div>`;
    } else {
      for (const q of active) {
        const pct = Math.min(100, ((q.progress||0)/(q.goal||1)*100)).toFixed(0);
        html += `<div class="xquest-item">
<div class="xquest-name">${q.name}</div>
<div class="xquest-desc">${q.desc}</div>
<div class="xquest-prog"><div class="xquest-fill" style="width:${pct}%"></div></div>
<div style="display:flex;justify-content:space-between;margin-top:4px">
<span style="font-size:9px;color:#888">${q.progress||0}/${q.goal||1}</span>
<span class="xquest-reward">🎁 ${q.reward?.gold ? `${q.reward.gold}💰 ` : ''}${q.reward?.exp ? `${q.reward.exp}⭐` : ''}</span>
</div></div>`;
      }
    }
    // QuestsPlus active
    if (typeof QuestsPlus !== 'undefined' && QuestsPlus.activeProcedural?.length) {
      html += `<div class="xsection" style="margin-top:12px">✨ Nhiệm Vụ Đặc Biệt</div>`;
      for (const q of QuestsPlus.activeProcedural) {
        const pct = Math.min(100, ((q.progress||0)/(q.goal||1)*100)).toFixed(0);
        html += `<div class="xquest-item">
<div class="xquest-name">${q.name}</div>
<div class="xquest-desc">${q.desc}</div>
<div class="xquest-prog"><div class="xquest-fill" style="width:${pct}%"></div></div>
<div style="font-size:9px;color:#8f8;margin-top:4px">🎁 ${q.reward?.gold||0}💰 ${q.reward?.exp||0}⭐</div>
</div>`;
      }
    }
    el.innerHTML = html;
  },

  _renderQuestNew() {
    const el = document.getElementById('questNew');
    if (!el) return;
    if (typeof QuestsPlus !== 'undefined' && QuestsPlus.generateNew) {
      el.innerHTML = `<div class="xinfo-box" style="margin-bottom:10px">Nhiệm vụ mới tạo ra mỗi ngày. Hoàn thành để nhận phần thưởng!</div>
<button class="xbtn" onclick="QuestsPlus.generateNew?.();UI._renderQuestNew()" style="width:100%;margin-bottom:12px">🔄 Làm Mới Nhiệm Vụ</button>
<div id="questNewList"></div>`;
      const available = QuestsPlus.availableNew || [];
      const listEl = el.querySelector('#questNewList');
      if (listEl) {
        if (!available.length) {
          listEl.innerHTML = `<div style="color:#666;font-size:10px;text-align:center">Không có nhiệm vụ mới</div>`;
        } else {
          listEl.innerHTML = available.map(q => `
<div class="xquest-item">
  <div class="xquest-name">${q.name}</div>
  <div class="xquest-desc">${q.desc}</div>
  <div style="display:flex;justify-content:space-between;margin-top:6px">
    <span class="xquest-reward">🎁 ${q.reward?.gold||0}💰 ${q.reward?.exp||0}⭐</span>
    <button class="xbtn green" onclick="QuestsPlus.accept?.('${q.id}');UI._renderQuestNew();UI._renderQuestActive()" style="padding:3px 8px;font-size:9px">Nhận</button>
  </div>
</div>`).join('');
        }
      }
    } else {
      el.innerHTML = `<div class="xinfo-box">Hệ thống nhiệm vụ mới cần feature_quests_plus.js</div>`;
    }
  },

  _renderQuestDone() {
    const el = document.getElementById('questDone');
    if (!el) return;
    const done = (typeof Quests !== 'undefined') ? (Quests.completed||[]) : [];
    if (!done.length) {
      el.innerHTML = `<div style="color:#666;font-size:10px;text-align:center;padding:16px">Chưa hoàn thành nhiệm vụ nào</div>`;
      return;
    }
    el.innerHTML = done.slice(-20).reverse().map(q => `
<div class="xquest-item" style="opacity:0.7;border-color:#4caf5033">
  <div class="xquest-name" style="color:#4caf50">✅ ${q.name}</div>
  <div class="xquest-desc">${q.desc}</div>
</div>`).join('');
  },

  // ==================== MAP PANEL ====================
  // Map panel delegates to Maps.render() but renders into xpanel
  _renderMapPanel() {
    const el = document.getElementById('mapPanelContent');
    if (!el) return;
    if (typeof Maps !== 'undefined' && Maps.render) {
      // Copy minimap content or render full map
      Maps.render();
    }
  },

  // ==================== LEGACY COMPAT ====================
  // Keep old renderCharacter for any code that calls it
  renderCharacter() {
    this._renderCharInfo();
    this._renderCharEquip();
  },

  setupEventListeners() {
    // Close xpanel on backdrop click
    document.addEventListener('click', e => {
      if (!this.activePanel) return;
      const panelId = this._panelIdMap[this.activePanel] || (this.activePanel + 'Panel');
      const panel = document.getElementById(panelId);
      if (panel && e.target === panel) {
        this.closePanel(this.activePanel);
      }
    });

    // Minimap toggle
    const minimapToggle = document.getElementById('minimapToggle');
    if (minimapToggle) {
      minimapToggle.onclick = () => {
        GameState.minimapVisible = !GameState.minimapVisible;
        document.getElementById('minimap').classList.toggle('hidden', !GameState.minimapVisible);
      };
    }
  }
};

console.log('🎨 UI loaded (Radial Menu + Full Tab System)');
