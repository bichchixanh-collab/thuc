// ==================== FEATURE: TRUY NÃ / TIÊU DIỆT LỆNH ====================
// Load sau game.js

const WantedSystem = {
  // ==================== CONFIG ====================
  MAX_WANTED: 3,           // Tối đa 3 Elite wanted cùng lúc
  RESPAWN_TIME: 30 * 60 * 1000, // 30 phút
  DAILY_RESET_HOUR: 6,     // 6 giờ sáng mỗi ngày

  // Stat multiplier cho Elite
  eliteStatMul: { hp: 3.5, atk: 2.0, exp: 5.0, gold: 4.0 },

  // Special drops chỉ từ Wanted
  wantedDropPool: [
    { id: 'realmPill', weight: 30 },
    { id: 'expPotion', weight: 25 },
    { id: 'dragonScale', weight: 15 },
    { id: 'spiritStone', weight: 20 },
    { id: 'celestialOrb', weight: 5 },
    { id: 'hpPotionMedium', weight: 5 }
  ],

  // Vietnamese elite names
  eliteNames: [
    ['Bá', 'Cường', 'Hung', 'Ác', 'Thiên', 'Ma', 'Quỷ', 'Huyết', 'Hỏa', 'Băng'],
    ['Vương', 'Chúa', 'Tôn', 'Thần', 'Linh', 'Tinh', 'Phong', 'Lôi', 'Hoàng', 'Đế']
  ],

  // Active wanted list
  wantedList: [],
  lastResetDay: -1,
  stats: { totalKilled: 0 },

  // ==================== INIT ====================
  init() {
    this._injectStyle();
    this._injectHTML();
    this._loadSave();
    this._checkDailyReset();
    this._fillWantedSlots();
    console.log('🎯 WantedSystem initialized');
  },

  // ==================== DAILY RESET ====================
  _checkDailyReset() {
    const now = new Date();
    const today = now.toDateString();
    if (this.lastResetDay !== today) {
      // Clear dead wanted that have timed out
      this.wantedList = this.wantedList.filter(w => {
        if (!w.alive && w.diedAt) {
          return (Date.now() - w.diedAt) < this.RESPAWN_TIME;
        }
        return true;
      });
      this.lastResetDay = today;
      UI.addLog?.('📋 Bảng truy nã cập nhật!', 'system');
    }
  },

  // ==================== SPAWN ====================
  _fillWantedSlots() {
    const now = Date.now();
    // Remove expired dead
    this.wantedList = this.wantedList.filter(w => {
      if (!w.alive && w.diedAt) return (now - w.diedAt) < this.RESPAWN_TIME;
      return true;
    });

    const aliveCount = this.wantedList.filter(w => w.alive).length;
    const needed = this.MAX_WANTED - aliveCount;

    for (let i = 0; i < needed; i++) {
      this._spawnElite();
    }
  },

  _spawnElite() {
    // Pick random enemy type from current map
    const map = Maps.data[Maps.currentIndex];
    const pool = [...map.enemies];
    if (map.boss) pool.push(map.boss);
    const typeKey = pool[Math.floor(Math.random() * pool.length)];
    const baseType = Enemies.types[typeKey];
    if (!baseType) return;

    const levelMul = 1 + Maps.currentIndex * 0.6;
    const mul = this.eliteStatMul;

    // Random elite name
    const prefix = this.eliteNames[0][Math.floor(Math.random() * this.eliteNames[0].length)];
    const suffix = this.eliteNames[1][Math.floor(Math.random() * this.eliteNames[1].length)];
    const eliteName = `[Truy Nã] ${prefix} ${baseType.name} ${suffix}`;

    // Random bounty
    const bountyGold = Math.floor(baseType.gold * mul.gold * levelMul * (3 + Math.random() * 4));
    const bountyExp  = Math.floor(baseType.exp  * mul.exp  * levelMul);

    // Spawn at random location (not too close to player)
    let sx, sy, attempts = 0;
    do {
      sx = 100 + Math.random() * (CONFIG.WORLD_WIDTH * CONFIG.TILE_SIZE - 200);
      sy = 100 + Math.random() * (CONFIG.WORLD_HEIGHT * CONFIG.TILE_SIZE - 200);
      attempts++;
    } while (Utils.dist(sx, sy, Player.x, Player.y) < 300 && attempts < 20);

    const elite = {
      wantedId: 'wanted_' + Date.now() + '_' + Math.random().toString(36).slice(2),
      type: typeKey,
      name: eliteName,
      x: sx, y: sy,
      spawnX: sx, spawnY: sy,
      hp: Math.floor(baseType.hp * mul.hp * levelMul),
      maxHp: Math.floor(baseType.hp * mul.hp * levelMul),
      atk: Math.floor(baseType.atk * mul.atk * levelMul),
      exp: bountyExp,
      gold: bountyGold,
      level: (Maps.data[Maps.currentIndex].lvl || 1) + 5 + Math.floor(Math.random() * 5),
      size: (baseType.size || 12) + 6,
      color: '#ff6600',
      sprite: baseType.sprite,
      boss: false,
      isElite: true,
      drops: baseType.drops || [],
      alive: true,
      moveTimer: Math.random() * 200,
      moveDir: Math.random() * Math.PI * 2,
      attackTimer: 1000,
      hitFlash: 0,
      aggroed: false,
      diedAt: null,
      bountyGold,
      bountyExp
    };

    this.wantedList.push(elite);
    Enemies.list.push(elite); // inject vào enemy list
    UI.addLog(`🎯 [TRUY NÃ] ${eliteName} xuất hiện! Thưởng: ${bountyGold} 💰`, 'system');
    return elite;
  },

  // ==================== UPDATE ====================
  update(dt) {
    const now = Date.now();

    // Check respawn
    for (const w of this.wantedList) {
      if (!w.alive && w.diedAt && (now - w.diedAt) >= this.RESPAWN_TIME) {
        this._respawnElite(w);
      }
    }

    // Fill slots
    if (GameState.time % 60000 < dt) { // check every 60s
      this._fillWantedSlots();
    }

    // Update minimap marker pulse
    this._updateHUDBadge();
  },

  _respawnElite(w) {
    w.hp = w.maxHp;
    w.alive = true;
    w.diedAt = null;
    w.x = w.spawnX + (Math.random() - 0.5) * 200;
    w.y = w.spawnY + (Math.random() - 0.5) * 200;
    w.aggroed = false;
    UI.addLog(`🎯 [TRUY NÃ] ${w.name} tái xuất!`, 'system');
  },

  onEliteKilled(elite) {
    elite.diedAt = Date.now();
    this.stats.totalKilled++;

    // Big reward
    const extraGold = elite.bountyGold;
    const extraExp  = elite.bountyExp;
    Player.gold += extraGold;
    Player.gainExp(extraExp);
    UI.addLog(`🏆 Tiêu diệt Truy Nã! +${extraGold} 💰 +${extraExp} EXP!`, 'gold');
    UI.showNotification('🏆 TRUY NÃ!', `+${extraGold} Vàng Thưởng!`);

    // Special drop
    const drop = this._rollWantedDrop();
    if (drop && Inventory.add(drop, 1)) {
      UI.addLog(`💎 Chiến lợi phẩm đặc biệt: ${ITEMS[drop]?.name || drop}!`, 'item');
    }

    this._save();
  },

  _rollWantedDrop() {
    const total = this.wantedDropPool.reduce((s, d) => s + d.weight, 0);
    let r = Math.random() * total;
    for (const d of this.wantedDropPool) {
      r -= d.weight;
      if (r <= 0) return d.id;
    }
    return null;
  },

  // ==================== RENDER (minimap markers) ====================
  renderMinimapMarkers(mctx, scale) {
    const now = Date.now();
    const pulse = (Math.sin(now / 400) + 1) / 2;

    for (const w of this.wantedList) {
      if (!w.alive) continue;
      mctx.fillStyle = `rgba(255,102,0,${0.6 + pulse * 0.4})`;
      mctx.beginPath();
      mctx.arc(w.x * scale, w.y * scale, 5, 0, Math.PI * 2);
      mctx.fill();
      mctx.fillStyle = '#fff';
      mctx.font = '7px monospace';
      mctx.textAlign = 'center';
      mctx.fillText('⚠', w.x * scale, w.y * scale + 3);
    }
  },

  // ==================== HUD BADGE ====================
  _updateHUDBadge() {
    const badge = document.getElementById('wantedBadge');
    if (!badge) return;
    const alive = this.wantedList.filter(w => w.alive).length;
    badge.textContent = `🎯 ${alive} Truy Nã`;
    badge.style.display = alive > 0 ? 'block' : 'none';
  },

  // ==================== UI PANEL ====================
  openPanel() {
    document.getElementById('wantedPanel').classList.add('show');
    this._renderPanel();
  },

  closePanel() {
    document.getElementById('wantedPanel').classList.remove('show');
  },

  _renderPanel() {
    const list = document.getElementById('wantedList');
    list.innerHTML = '';

    const alive = this.wantedList.filter(w => w.alive);
    const dead  = this.wantedList.filter(w => !w.alive);

    if (alive.length === 0 && dead.length === 0) {
      list.innerHTML = '<div style="text-align:center;color:#666;padding:20px">Chưa có lệnh truy nã</div>';
      return;
    }

    for (const w of alive) {
      const div = document.createElement('div');
      div.style.cssText = `
        background:rgba(255,102,0,0.08);border:2px solid #ff6600;
        border-radius:10px;padding:12px;margin-bottom:10px;
      `;
      const distToPlayer = Utils.dist(Player.x, Player.y, w.x, w.y).toFixed(0);
      div.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div style="color:#ff6600;font-size:12px;font-weight:bold;max-width:65%">${w.name}</div>
          <span style="background:#ff6600;color:#fff;font-size:8px;padding:2px 6px;border-radius:10px">SỐNG</span>
        </div>
        <div style="display:flex;gap:12px;margin-top:6px;flex-wrap:wrap">
          <span style="color:#ff4444;font-size:10px">❤️ ${w.hp}/${w.maxHp}</span>
          <span style="color:#f0c040;font-size:10px">💰 ${Utils.formatNumber(w.bountyGold)} Vàng</span>
          <span style="color:#ffeb3b;font-size:10px">✨ ${Utils.formatNumber(w.bountyExp)} EXP</span>
          <span style="color:#888;font-size:10px">📍 ${distToPlayer}m</span>
        </div>
        <div style="color:#666;font-size:9px;margin-top:4px">Lv.${w.level} · Cảnh báo: Cực kỳ nguy hiểm!</div>
      `;
      list.appendChild(div);
    }

    for (const w of dead) {
      const remain = w.diedAt ? Math.max(0, Math.ceil((this.RESPAWN_TIME - (Date.now() - w.diedAt)) / 60000)) : 0;
      const div = document.createElement('div');
      div.style.cssText = 'background:rgba(0,0,0,0.3);border:1px solid #444;border-radius:10px;padding:10px;margin-bottom:8px;opacity:0.6';
      div.innerHTML = `
        <div style="display:flex;justify-content:space-between">
          <div style="color:#888;font-size:11px">${w.name}</div>
          <span style="background:#333;color:#666;font-size:8px;padding:2px 6px;border-radius:10px">Tái xuất ${remain}p</span>
        </div>
      `;
      list.appendChild(div);
    }

    // Stats
    const statsEl = document.getElementById('wantedStats');
    statsEl.innerHTML = `<span style="color:#888;font-size:10px">⚔️ Đã tiêu diệt: ${this.stats.totalKilled} Elite</span>`;
  },

  // ==================== INJECT STYLE + HTML ====================
  _injectStyle() {
    if (document.getElementById('wantedStyle')) return;
    const s = document.createElement('style');
    s.id = 'wantedStyle';
    s.textContent = `
      #wantedBadge {
        position:absolute;top:80px;right:160px;z-index:20;
        background:rgba(255,102,0,0.9);color:#fff;
        font-size:10px;font-weight:bold;padding:4px 10px;
        border-radius:12px;cursor:pointer;display:none;
        border:1px solid #ff8800;animation:wantedPulse 1.5s infinite;
      }
      @keyframes wantedPulse {
        0%,100%{box-shadow:0 0 6px rgba(255,102,0,0.6)}
        50%{box-shadow:0 0 16px rgba(255,102,0,0.9)}
      }
      #wantedPanel {
        position:absolute;top:0;left:0;width:100%;height:100%;
        background:rgba(0,0,0,0.8);z-index:100;
        display:none;align-items:center;justify-content:center;
        backdrop-filter:blur(2px);
      }
      #wantedPanel.show{display:flex;}
      #wantedInner {
        background:linear-gradient(135deg,#1a1a2e,#1a0000);
        border:3px solid #ff6600;border-radius:15px;
        padding:18px;width:92%;max-width:400px;max-height:85vh;overflow-y:auto;
        box-shadow:0 0 40px rgba(255,102,0,0.2);
      }
      #wantedInner::-webkit-scrollbar{width:4px}
      #wantedInner::-webkit-scrollbar-thumb{background:#ff6600;border-radius:2px}
    `;
    document.head.appendChild(s);
  },

  _injectHTML() {
    // Badge
    const badge = document.createElement('div');
    badge.id = 'wantedBadge';
    badge.onclick = () => this.openPanel();
    document.body.appendChild(badge);

    // Panel
    const panel = document.createElement('div');
    panel.id = 'wantedPanel';
    panel.innerHTML = `
      <div id="wantedInner">
        <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #ff660044;padding-bottom:10px;margin-bottom:12px">
          <div style="color:#ff6600;font-size:18px;font-weight:bold">🎯 Bảng Truy Nã</div>
          <div onclick="WantedSystem.closePanel()" style="width:30px;height:30px;background:rgba(255,0,0,0.2);border:2px solid #f44;border-radius:50%;color:#f44;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center">✕</div>
        </div>
        <div id="wantedStats" style="margin-bottom:10px"></div>
        <div id="wantedList"></div>
      </div>
    `;
    panel.addEventListener('click', e => { if (e.target.id === 'wantedPanel') this.closePanel(); });
    document.body.appendChild(panel);

    // Menu btn
    const menuBar = document.getElementById('menuBar');
    if (menuBar) {
      const btn = document.createElement('div');
      btn.className = 'menu-btn';
      btn.onclick = () => WantedSystem.openPanel();
      btn.style.borderColor = '#ff6600';
      btn.innerHTML = `<span style="font-size:18px">🎯</span><span>Truy Nã</span>`;
      menuBar.appendChild(btn);
    }
  },

  // ==================== SAVE / LOAD ====================
  getSaveData() {
    return {
      wantedList: this.wantedList.map(w => ({
        wantedId: w.wantedId, type: w.type, name: w.name,
        x: w.x, y: w.y, spawnX: w.spawnX, spawnY: w.spawnY,
        hp: w.hp, maxHp: w.maxHp, atk: w.atk, exp: w.exp, gold: w.gold,
        level: w.level, size: w.size, color: w.color, sprite: w.sprite,
        alive: w.alive, diedAt: w.diedAt, bountyGold: w.bountyGold, bountyExp: w.bountyExp
      })),
      lastResetDay: this.lastResetDay,
      stats: { ...this.stats }
    };
  },

  _save() {
    try { localStorage.setItem('tuxien_wanted', JSON.stringify(this.getSaveData())); } catch (e) {}
  },

  _loadSave() {
    try {
      const raw = localStorage.getItem('tuxien_wanted');
      if (!raw) return;
      const data = JSON.parse(raw);
      this.lastResetDay = data.lastResetDay || -1;
      this.stats = data.stats || { totalKilled: 0 };
      // Restore wanted into Enemies.list
      for (const w of (data.wantedList || [])) {
        const baseType = Enemies.types[w.type];
        if (!baseType) continue;
        const restored = {
          ...w,
          isElite: true, boss: false,
          drops: baseType.drops || [],
          hitFlash: 0, aggroed: false,
          moveTimer: Math.random() * 200,
          moveDir: Math.random() * Math.PI * 2,
          attackTimer: 1000
        };
        this.wantedList.push(restored);
        if (restored.alive) Enemies.list.push(restored);
      }
    } catch (e) {}
  }
};

// ==================== WRAP GAME ====================
(function () {
  const _origInit = Game.init.bind(Game);
  Game.init = function () { _origInit(); WantedSystem.init(); };

  const _origUpdate = Game.update.bind(Game);
  Game.update = function (dt) { _origUpdate(dt); WantedSystem.update(dt); };

  const _origSave = Game.save.bind(Game);
  Game.save = function () { _origSave(); WantedSystem._save(); };

  // Wrap Enemies.kill để detect wanted kills
  const _origKill = Enemies.kill.bind(Enemies);
  Enemies.kill = function (enemy) {
    const isWanted = enemy.isElite && enemy.wantedId;
    _origKill(enemy);
    if (isWanted) WantedSystem.onEliteKilled(enemy);
  };

  // Wrap minimap render để add wanted markers
  const _origRenderMinimap = Game.renderMinimap.bind(Game);
  Game.renderMinimap = function () {
    _origRenderMinimap();
    const mc = document.getElementById('minimapCanvas');
    if (!mc) return;
    const mctx = mc.getContext('2d');
    const scale = mc.width / (CONFIG.WORLD_WIDTH * CONFIG.TILE_SIZE);
    WantedSystem.renderMinimapMarkers(mctx, scale);
  };

  // Wrap Maps.travelTo để reset wanted khi đổi map
  const _origTravel = Maps.travelTo.bind(Maps);
  Maps.travelTo = function (idx) {
    const result = _origTravel(idx);
    if (result) {
      WantedSystem.wantedList = [];
      WantedSystem._fillWantedSlots();
    }
    return result;
  };
})();

console.log('🎯 feature_wanted.js loaded');
// Thêm vào index.html: <script src="js/feature_wanted.js"></script>
