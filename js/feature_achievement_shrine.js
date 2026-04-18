// ==================== ĐIỆN THÀNH TỰU ====================
// feature_achievement_shrine.js
// Museum cá nhân: 6 gian trưng bày, danh hiệu, ô bí ẩn, visual 3D-ish canvas
// Gian: Chiến Công, Danh Hiệu, Tử Vong, Kỷ Lục, Khám Phá, Bộ Sưu Tập

const AchievementShrine = {

  // ==================== ACHIEVEMENT DEFINITIONS ====================
  definitions: [
    // === CHIẾN CÔNG ===
    { id: 'kill_100', hall: 'combat', name: 'Sát Thủ Sơ Nhập', desc: 'Tiêu diệt 100 yêu thú', icon: '⚔️', check: (s) => s.totalKills >= 100, reward: { title: 'Sát Thủ' }, secret: false },
    { id: 'kill_1000', hall: 'combat', name: 'Đồ Sát Vạn Kẻ', desc: 'Tiêu diệt 1000 yêu thú', icon: '💀', check: (s) => s.totalKills >= 1000, reward: { title: 'Đồ Thần' }, secret: false },
    { id: 'kill_10000', hall: 'combat', name: 'Diệt Vong Chi Thần', desc: 'Tiêu diệt 10000 yêu thú', icon: '☠️', check: (s) => s.totalKills >= 10000, reward: { title: 'Thần Diệt' }, secret: true },
    { id: 'boss_first', hall: 'combat', name: 'Đầu Boss', desc: 'Hạ gục boss đầu tiên', icon: '👑', check: (s) => s.bossKills >= 1, reward: { title: 'Thợ Săn Boss' }, secret: false },
    { id: 'boss_10', hall: 'combat', name: 'Boss Hunter', desc: 'Hạ gục 10 boss', icon: '🏆', check: (s) => s.bossKills >= 10, reward: { title: 'Boss Buster' }, secret: false },
    { id: 'crit_100', hall: 'combat', name: 'Chí Mạng Liên Hoàn', desc: 'Gây 100 đòn chí mạng', icon: '⚡', check: (s) => s.totalCrits >= 100, reward: { title: 'Kiếm Khách' }, secret: false },
    { id: 'dmg_million', hall: 'combat', name: 'Triệu Sát Thương', desc: 'Tổng sát thương đạt 1,000,000', icon: '💥', check: (s) => s.totalDamageDealt >= 1000000, reward: { title: 'Hủy Diệt' }, secret: true },

    // === DANH HIỆU / TIẾN TRÌNH ===
    { id: 'realm_3', hall: 'title', name: 'Kim Đan Đã Thành', desc: 'Đạt Kim Đan Kỳ', icon: '💎', check: (s) => Player.realm >= 2, reward: { title: 'Kim Đan Tu Sĩ' }, secret: false },
    { id: 'realm_5', hall: 'title', name: 'Hóa Thần Thành Đạo', desc: 'Đạt Hóa Thần Kỳ', icon: '🌟', check: (s) => Player.realm >= 4, reward: { title: 'Hóa Thần' }, secret: false },
    { id: 'realm_8', hall: 'title', name: 'Độ Kiếp Siêu Thăng', desc: 'Đạt Độ Kiếp Kỳ', icon: '⚡', check: (s) => Player.realm >= 7, reward: { title: 'Thần Tiên Kỳ' }, secret: true },
    { id: 'level_50', hall: 'title', name: 'Bán Thế Kỷ Tu Hành', desc: 'Đạt level 50', icon: '5️⃣0️⃣', check: (s) => Player.level >= 50, reward: { title: 'Lão Tiên' }, secret: false },
    { id: 'level_100', hall: 'title', name: 'Bách Năm Tu Đạo', desc: 'Đạt level 100', icon: '💯', check: (s) => Player.level >= 100, reward: { title: 'Bách Tuế Tiên' }, secret: true },
    { id: 'gold_10000', hall: 'title', name: 'Phú Gia Địch Quốc', desc: 'Tích lũy 10,000 vàng', icon: '💰', check: (s) => s.totalGoldEarned >= 10000, reward: { title: 'Phú Ông' }, secret: false },

    // === TỬ VONG (humour) ===
    { id: 'die_first', hall: 'death', name: 'Lần Đầu Tiên Chết', desc: 'Tử vong lần đầu', icon: '💀', check: (s) => s.totalDeaths >= 1, reward: { title: 'Tử Sinh Lữ' }, secret: false },
    { id: 'die_10', hall: 'death', name: 'Chết Đi Sống Lại', desc: 'Tử vong 10 lần', icon: '☠️', check: (s) => s.totalDeaths >= 10, reward: { title: 'Bất Diệt' }, secret: false },
    { id: 'die_wolf', hall: 'death', name: 'Sói Cắn Tiên', desc: 'Bị Sói Xám giết lần đầu', icon: '🐺', check: (s) => s.deathBySource['Sói Xám'] >= 1, reward: { title: 'Sói Cắn' }, secret: false },
    { id: 'die_boss', hall: 'death', name: 'Anh Hùng Lạc Lối', desc: 'Bị boss giết 3 lần', desc2: 'Dũng cảm nhưng...',  icon: '👹', check: (s) => s.totalBossDeaths >= 3, reward: { title: 'Thử Thách Viên' }, secret: false },
    { id: 'die_no_gold', hall: 'death', name: 'Sạch Túi', desc: 'Chết khi có 0 vàng', icon: '😂', check: (s) => s.diedWithNoGold >= 1, reward: { title: 'Tay Trắng' }, secret: true },

    // === KỶ LỤC ===
    { id: 'max_combo', hall: 'record', name: 'Bão Tố', desc: 'Giết 10 quái liên tiếp trong 10 giây', icon: '🌪️', check: (s) => s.maxKillStreak >= 10, reward: { title: 'Bão Tố' }, secret: false },
    { id: 'fast_boss', hall: 'record', name: 'Chớp Nhoáng', desc: 'Hạ boss trong 30 giây', icon: '⚡', check: (s) => s.fastestBossKill <= 30000, reward: { title: 'Thần Tốc' }, secret: true },
    { id: 'no_damage_boss', hall: 'record', name: 'Vô Thương Chiến Thần', desc: 'Hạ boss không nhận damage', icon: '🛡️', check: (s) => s.bossKillsNoDamage >= 1, reward: { title: 'Bất Khả Xâm' }, secret: true },
    { id: 'long_session', hall: 'record', name: 'Trường Kỳ Tu Hành', desc: 'Chơi liên tục 1 tiếng', icon: '⏰', check: (s) => s.longestSession >= 3600000, reward: { title: 'Tu Hành Không Mệt' }, secret: false },
    { id: 'max_dps', hall: 'record', name: 'Siêu Việt', desc: 'Gây 10,000+ sát thương 1 đòn', icon: '💢', check: (s) => s.maxSingleHit >= 10000, reward: { title: 'Vô Đối' }, secret: true },

    // === KHÁM PHÁ ===
    { id: 'map_3', hall: 'explore', name: 'Lữ Hành Sơ Khởi', desc: 'Khám phá 3 vùng đất', icon: '🗺️', check: (s) => s.mapsVisited.length >= 3, reward: { title: 'Lữ Hành' }, secret: false },
    { id: 'map_all', hall: 'explore', name: 'Vạn Lý Du Tiên', desc: 'Khám phá tất cả vùng đất', icon: '🌍', check: (s) => s.mapsVisited.length >= 6, reward: { title: 'Vạn Lý' }, secret: false },
    { id: 'npc_all', hall: 'explore', name: 'Giao Thiệp Rộng', desc: 'Nói chuyện với tất cả NPC', icon: '💬', check: (s) => s.npcsInteracted >= 5, reward: { title: 'Xã Giao' }, secret: false },
    { id: 'secret_tile', hall: 'explore', name: 'Thám Hiểm Bí Ẩn', desc: 'Tìm thấy vị trí ẩn bí', icon: '🔍', check: (s) => s.secretsFound >= 1, reward: { title: 'Thám Tử' }, secret: true },

    // === BỘ SƯU TẬP ===
    { id: 'legendary_first', hall: 'collection', name: 'Thần Khí Đầu Tiên', desc: 'Loot được item Legendary', icon: '🌟', check: (s) => s.legendaryLooted >= 1, reward: { title: 'Cơ Duyên' }, secret: false },
    { id: 'legendary_5', hall: 'collection', name: 'Thần Khí Sưu Tầm', desc: 'Loot được 5 item Legendary', icon: '✨', check: (s) => s.legendaryLooted >= 5, reward: { title: 'May Mắn' }, secret: false },
    { id: 'all_pets', hall: 'collection', name: 'Thú Sưu Tập Gia', desc: 'Sở hữu tất cả linh thú', icon: '🐾', check: (s) => Player.ownedPets.length >= Object.keys(PETS).length, reward: { title: 'Thú Sư' }, secret: false },
    { id: 'full_equip', hall: 'collection', name: 'Trang Bị Đầy Đủ', desc: 'Trang bị cả 3 slot', icon: '⚔️', check: (s) => !!Player.equipped.weapon && !!Player.equipped.armor && !!Player.equipped.accessory, reward: { title: 'Hoàn Bị' }, secret: false },
    { id: 'sell_100', hall: 'collection', name: 'Thương Nhân', desc: 'Bán 100 vật phẩm', icon: '🏪', check: (s) => s.totalItemsSold >= 100, reward: { title: 'Lái Buôn' }, secret: false },
  ],

  // ==================== STATE ====================
  stats: {
    totalKills: 0,
    bossKills: 0,
    totalCrits: 0,
    totalDamageDealt: 0,
    totalDeaths: 0,
    totalBossDeaths: 0,
    diedWithNoGold: 0,
    deathBySource: {},
    totalGoldEarned: 0,
    maxKillStreak: 0,
    fastestBossKill: Infinity,
    bossKillsNoDamage: 0,
    longestSession: 0,
    maxSingleHit: 0,
    mapsVisited: [],
    npcsInteracted: 0,
    secretsFound: 0,
    legendaryLooted: 0,
    totalItemsSold: 0,
    sessionStart: Date.now(),
    currentKillStreak: 0,
    lastKillTime: 0,
    // boss tracking
    bossEngageTime: 0,
    bossHpReceivedDuringFight: 0,
  },

  unlockedAchievements: [],   // ids
  equippedTitle: null,
  allTitles: [],              // unlocked titles

  currentHall: 'combat',
  shrineOpen: false,
  _animTime: 0,

  // 3D-ish perspective
  perspective: {
    vanishX: 0.5, // % of canvas width
    vanishY: 0.3, // 30% height
    depth: 8,
  },

  halls: [
    { key: 'combat',     name: '⚔️ Gian Chiến Công',    color: '#ef5350' },
    { key: 'title',      name: '🌟 Gian Danh Hiệu',     color: '#ffd700' },
    { key: 'death',      name: '💀 Gian Tử Vong',       color: '#9b59b6' },
    { key: 'record',     name: '📊 Gian Kỷ Lục',        color: '#4fc3f7' },
    { key: 'explore',    name: '🗺️ Gian Khám Phá',      color: '#4caf50' },
    { key: 'collection', name: '🎁 Gian Bộ Sưu Tập',   color: '#ff9800' },
  ],

  // ==================== INIT ====================
  init() {
    this._loadData();
    this._injectStyles();
    this._injectUI();
    this._checkAll();
    this.stats.sessionStart = Date.now();
    console.log('🏛️ AchievementShrine init, unlocked:', this.unlockedAchievements.length);
  },

  // ==================== CHECK ALL ====================
  _checkAll() {
    let newUnlocks = 0;
    for (const def of this.definitions) {
      if (this.unlockedAchievements.includes(def.id)) continue;
      try {
        if (def.check(this.stats)) {
          this._unlock(def, true); // silent for retroactive
          newUnlocks++;
        }
      } catch(e) {}
    }
    if (newUnlocks > 0) this._saveData();
  },

  _unlock(def, silent = false) {
    if (this.unlockedAchievements.includes(def.id)) return;
    this.unlockedAchievements.push(def.id);

    // Add title
    if (def.reward && def.reward.title) {
      if (!this.allTitles.includes(def.reward.title)) {
        this.allTitles.push(def.reward.title);
      }
      if (!this.equippedTitle) {
        this.equippedTitle = def.reward.title;
        this._updateTitleDisplay();
      }
    }

    if (!silent) {
      UI.showNotification(`🏛️ ${def.icon} ${def.name}`, def.desc);
      UI.addLog(`🏛️ Thành tựu: ${def.name}!`, 'realm');
      this._spawnUnlockEffect();
    }

    this._saveData();
  },

  // ==================== STAT TRACKING ====================
  onKill(enemy) {
    this.stats.totalKills++;
    if (enemy.boss) this.stats.bossKills++;

    // Kill streak
    const now = Date.now();
    if (now - this.stats.lastKillTime < 10000) {
      this.stats.currentKillStreak++;
      if (this.stats.currentKillStreak > this.stats.maxKillStreak) {
        this.stats.maxKillStreak = this.stats.currentKillStreak;
      }
    } else {
      this.stats.currentKillStreak = 1;
    }
    this.stats.lastKillTime = now;

    // Boss no-damage check
    if (enemy.boss) {
      if (this.stats.bossHpReceivedDuringFight === 0) {
        this.stats.bossKillsNoDamage++;
      }
      // Boss speed kill
      if (this.stats.bossEngageTime > 0) {
        const elapsed = now - this.stats.bossEngageTime;
        if (elapsed < this.stats.fastestBossKill) {
          this.stats.fastestBossKill = elapsed;
        }
      }
      this.stats.bossEngageTime = 0;
      this.stats.bossHpReceivedDuringFight = 0;
    }

    this._checkAll();
  },

  onDamageDealt(amount, isCrit) {
    this.stats.totalDamageDealt += amount;
    if (isCrit) this.stats.totalCrits++;
    if (amount > this.stats.maxSingleHit) this.stats.maxSingleHit = amount;
    // No checkAll here for perf, batch in onKill
  },

  onDamageTaken(source) {
    if (Player && source) {
      // Track boss fight damage
      this.stats.bossHpReceivedDuringFight++;
    }
  },

  onDeath(source) {
    this.stats.totalDeaths++;
    const src = source || 'Unknown';
    if (src.includes('boss') || src.includes('Vương') || src.includes('Lord') || src.includes('Đế')) {
      this.stats.totalBossDeaths++;
    }
    if (!this.stats.deathBySource[src]) this.stats.deathBySource[src] = 0;
    this.stats.deathBySource[src]++;
    if (Player.gold <= 0) this.stats.diedWithNoGold++;
    this._checkAll();
  },

  onGoldEarned(amount) {
    this.stats.totalGoldEarned += amount;
  },

  onMapVisit(mapName) {
    if (!this.stats.mapsVisited.includes(mapName)) {
      this.stats.mapsVisited.push(mapName);
      this._checkAll();
    }
  },

  onNPCInteract() {
    this.stats.npcsInteracted++;
    this._checkAll();
  },

  onLegendaryLoot() {
    this.stats.legendaryLooted++;
    this._checkAll();
  },

  onItemSold() {
    this.stats.totalItemsSold++;
  },

  onBossEngage(enemy) {
    if (enemy && enemy.boss) {
      this.stats.bossEngageTime = Date.now();
      this.stats.bossHpReceivedDuringFight = 0;
    }
  },

  // ==================== SHRINE NPC ====================
  // Tạo NPC Shrine trên map đầu
  spawnShrineNPC() {
    const shrineNPC = {
      type: 'shrine',
      name: '🏛️ Điện Thành Tựu',
      title: 'Ký Lục Thiên Địa',
      x: 680, y: 480,
      sprite: 'npcTeleporter',
      dialog: 'Mọi chiến công của đạo hữu đều được ghi chép tại đây.',
      service: 'shrine',
      interactRange: 90,
      canInteract: false,
    };
    NPC.list.push(shrineNPC);

    // Patch NPC.interact để handle shrine
    const _origInteract = NPC.interact.bind(NPC);
    NPC.interact = function(npc) {
      if (npc.service === 'shrine') {
        AchievementShrine.open();
        return;
      }
      _origInteract(npc);
    };
  },

  // ==================== OPEN/CLOSE ====================
  open() {
    this._checkAll();
    this.shrineOpen = true;
    const overlay = document.getElementById('shrine-overlay');
    if (overlay) {
      overlay.style.display = 'flex';
      this._renderShrineUI();
    }
    UI.addLog('🏛️ Vào Điện Thành Tựu', 'system');
  },

  close() {
    this.shrineOpen = false;
    const overlay = document.getElementById('shrine-overlay');
    if (overlay) overlay.style.display = 'none';
  },

  // ==================== UI ====================
  _renderShrineUI() {
    const body = document.getElementById('shrine-body');
    if (!body) return;

    // Hall tabs
    const tabsEl = document.getElementById('shrine-tabs');
    tabsEl.innerHTML = '';
    for (const hall of this.halls) {
      const btn = document.createElement('div');
      btn.className = 'shrine-tab-btn' + (this.currentHall === hall.key ? ' active' : '');
      btn.style.borderColor = this.currentHall === hall.key ? hall.color : '#333';
      btn.style.color = this.currentHall === hall.key ? hall.color : '#666';
      btn.textContent = hall.name;
      btn.onclick = () => {
        this.currentHall = hall.key;
        this._renderShrineUI();
      };
      tabsEl.appendChild(btn);
    }

    // Canvas 3D-ish hall
    const canvas = document.getElementById('shrine-canvas');
    this._draw3DHall(canvas);

    // Achievement grid for current hall
    const grid = document.getElementById('shrine-achievement-grid');
    grid.innerHTML = '';

    const hallDefs = this.definitions.filter(d => d.hall === this.currentHall);
    const unlocked = hallDefs.filter(d => this.unlockedAchievements.includes(d.id));
    const locked = hallDefs.filter(d => !this.unlockedAchievements.includes(d.id));

    const hallInfo = this.halls.find(h => h.key === this.currentHall);
    const progress = document.getElementById('shrine-hall-progress');
    progress.textContent = `${unlocked.length} / ${hallDefs.length} thành tựu`;
    progress.style.color = hallInfo.color;

    // Unlocked first
    for (const def of unlocked) {
      grid.appendChild(this._makeAchCard(def, true, hallInfo.color));
    }

    // Locked (show if not secret, hide if secret)
    for (const def of locked) {
      grid.appendChild(this._makeAchCard(def, false, hallInfo.color));
    }

    // Stats panel
    this._renderStats();

    // Title picker
    this._renderTitlePicker();
  },

  _makeAchCard(def, unlocked, color) {
    const card = document.createElement('div');
    card.className = 'shrine-ach-card' + (unlocked ? ' unlocked' : ' locked');
    card.style.borderColor = unlocked ? color : '#333';

    const isSecret = def.secret && !unlocked;

    card.innerHTML = `
      <div class="shrine-ach-icon" style="color:${unlocked ? color : '#444'}">${isSecret ? '❓' : def.icon}</div>
      <div class="shrine-ach-name" style="color:${unlocked ? color : '#444'}">${isSecret ? '???' : def.name}</div>
      <div class="shrine-ach-desc">${isSecret ? 'Bí ẩn — cần khám phá' : def.desc}</div>
      ${unlocked && def.reward?.title ? `<div class="shrine-ach-title" style="background:${color}22;border-color:${color}44">🏷️ ${def.reward.title}</div>` : ''}
      ${!unlocked && !isSecret ? `<div class="shrine-ach-locked-hint">🔒 Chưa đạt được</div>` : ''}
    `;

    if (unlocked) {
      card.style.background = `${color}11`;
      card.style.boxShadow = `0 0 8px ${color}33`;
    }

    return card;
  },

  _draw3DHall(canvas) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    // Background gradient
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#0a0a1a');
    bg.addColorStop(1, '#1a1a2e');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    const vx = W * 0.5;
    const vy = H * 0.25;

    // Floor tiles (perspective)
    const hallInfo = this.halls.find(h => h.key === this.currentHall);
    const col = hallInfo ? hallInfo.color : '#f0c040';

    const tileRows = 5;
    const tileCols = 6;
    for (let row = 0; row < tileRows; row++) {
      for (let col2 = 0; col2 < tileCols; col2++) {
        const t = row / tileRows;
        const t2 = (row + 1) / tileRows;
        const xFrac = col2 / tileCols;
        const xFrac2 = (col2 + 1) / tileCols;

        const p1 = this._perspPt(xFrac, t, vx, vy, W, H);
        const p2 = this._perspPt(xFrac2, t, vx, vy, W, H);
        const p3 = this._perspPt(xFrac2, t2, vx, vy, W, H);
        const p4 = this._perspPt(xFrac, t2, vx, vy, W, H);

        const alpha = 0.05 + t * 0.1;
        ctx.strokeStyle = col + Math.round(alpha * 255).toString(16).padStart(2, '0');
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.lineTo(p4.x, p4.y);
        ctx.closePath();
        ctx.stroke();
      }
    }

    // Left/right walls (perspective lines)
    ctx.strokeStyle = col + '33';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const t = i / 4;
      // Left wall lines
      ctx.beginPath();
      ctx.moveTo(vx, vy);
      const lp = this._perspPt(0, t, vx, vy, W, H);
      ctx.lineTo(lp.x, lp.y);
      ctx.stroke();
      // Right wall lines
      ctx.beginPath();
      ctx.moveTo(vx, vy);
      const rp = this._perspPt(1, t, vx, vy, W, H);
      ctx.lineTo(rp.x, rp.y);
      ctx.stroke();
    }

    // Trophy pedestals for unlocked achievements
    const hallDefs = this.definitions.filter(d => d.hall === this.currentHall);
    const unlockedDefs = hallDefs.filter(d => this.unlockedAchievements.includes(d.id));
    const t2 = this._animTime;

    const slotCount = Math.min(unlockedDefs.length, 6);
    for (let i = 0; i < slotCount; i++) {
      const def = unlockedDefs[i];
      const col3 = i / Math.max(slotCount - 1, 1);
      const row3 = 0.4 + (i % 2) * 0.25;
      const pt = this._perspPt(0.1 + col3 * 0.8, row3, vx, vy, W, H);

      const scale = 0.4 + row3 * 0.6;
      const bobY = Math.sin(t2 / 1000 + i * 1.2) * 2 * scale;

      // Pedestal
      ctx.fillStyle = '#2a2a3a';
      ctx.fillRect(pt.x - 12 * scale, pt.y, 24 * scale, 10 * scale);
      ctx.fillStyle = col + '66';
      ctx.fillRect(pt.x - 10 * scale, pt.y, 20 * scale, 2 * scale);

      // Glow
      const glowG = ctx.createRadialGradient(pt.x, pt.y - bobY, 0, pt.x, pt.y - bobY, 20 * scale);
      glowG.addColorStop(0, col + '44');
      glowG.addColorStop(1, 'transparent');
      ctx.fillStyle = glowG;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y - bobY, 20 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Icon
      ctx.font = `${Math.floor(16 * scale)}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(def.icon, pt.x, pt.y - 5 * scale - bobY);
    }

    // Title text
    ctx.fillStyle = col;
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.globalAlpha = 0.6;
    ctx.fillText(hallInfo ? hallInfo.name : '', W / 2, H - 6);
    ctx.globalAlpha = 1;
  },

  _perspPt(xFrac, depth, vx, vy, W, H) {
    const floorY = H;
    const x = vx + (xFrac - 0.5) * W * (0.2 + depth * 0.8);
    const y = vy + (floorY - vy) * depth;
    return { x, y };
  },

  _renderStats() {
    const el = document.getElementById('shrine-stats');
    if (!el) return;

    const s = this.stats;
    const session = Date.now() - s.sessionStart;
    const sessionMins = Math.floor(session / 60000);

    el.innerHTML = `
      <div class="shrine-stat-row"><span class="shrine-stat-lbl">⚔️ Tổng kills</span><span class="shrine-stat-val">${Utils.formatNumber(s.totalKills)}</span></div>
      <div class="shrine-stat-row"><span class="shrine-stat-lbl">👑 Boss đã hạ</span><span class="shrine-stat-val">${s.bossKills}</span></div>
      <div class="shrine-stat-row"><span class="shrine-stat-lbl">💥 Tổng DMG</span><span class="shrine-stat-val">${Utils.formatNumber(s.totalDamageDealt)}</span></div>
      <div class="shrine-stat-row"><span class="shrine-stat-lbl">⚡ Chí mạng</span><span class="shrine-stat-val">${Utils.formatNumber(s.totalCrits)}</span></div>
      <div class="shrine-stat-row"><span class="shrine-stat-lbl">💀 Tử vong</span><span class="shrine-stat-val">${s.totalDeaths}</span></div>
      <div class="shrine-stat-row"><span class="shrine-stat-lbl">💰 Vàng kiếm được</span><span class="shrine-stat-val">${Utils.formatNumber(s.totalGoldEarned)}</span></div>
      <div class="shrine-stat-row"><span class="shrine-stat-lbl">🌍 Vùng đất</span><span class="shrine-stat-val">${s.mapsVisited.length}</span></div>
      <div class="shrine-stat-row"><span class="shrine-stat-lbl">🌟 Legendary loot</span><span class="shrine-stat-val">${s.legendaryLooted}</span></div>
      <div class="shrine-stat-row"><span class="shrine-stat-lbl">💢 Đòn mạnh nhất</span><span class="shrine-stat-val">${Utils.formatNumber(s.maxSingleHit)}</span></div>
      <div class="shrine-stat-row"><span class="shrine-stat-lbl">🔥 Kill streak max</span><span class="shrine-stat-val">${s.maxKillStreak}</span></div>
      <div class="shrine-stat-row"><span class="shrine-stat-lbl">⏱️ Session hiện tại</span><span class="shrine-stat-val">${sessionMins} phút</span></div>
      <div class="shrine-stat-row"><span class="shrine-stat-lbl">🏆 Thành tựu</span><span class="shrine-stat-val">${this.unlockedAchievements.length}/${this.definitions.length}</span></div>
    `;
  },

  _renderTitlePicker() {
    const el = document.getElementById('shrine-title-picker');
    if (!el) return;

    if (this.allTitles.length === 0) {
      el.innerHTML = '<div style="color:#555;font-size:10px">Chưa có danh hiệu nào. Hoàn thành thành tựu để nhận!</div>';
      return;
    }

    let html = '<div style="color:#f0c040;font-size:11px;font-weight:bold;margin-bottom:8px">🏷️ Chọn Danh Hiệu:</div>';
    html += '<div style="display:flex;flex-wrap:wrap;gap:6px">';
    for (const title of this.allTitles) {
      const active = this.equippedTitle === title;
      html += `<div class="shrine-title-tag${active ? ' active' : ''}" onclick="AchievementShrine.equipTitle('${title}')">${title}</div>`;
    }
    html += '</div>';
    if (this.equippedTitle) {
      html += `<div style="color:#aaa;font-size:9px;margin-top:6px">Đang dùng: <b style="color:#f0c040">${this.equippedTitle}</b></div>`;
    }
    el.innerHTML = html;
  },

  equipTitle(title) {
    this.equippedTitle = title;
    this._updateTitleDisplay();
    this._renderTitlePicker();
    this._saveData();
    UI.addLog(`🏷️ Danh hiệu: ${title}`, 'realm');
  },

  _updateTitleDisplay() {
    // Hiển thị title dưới tên player trong HUD
    const nameEl = document.getElementById('playerName');
    if (nameEl && this.equippedTitle) {
      nameEl.title = this.equippedTitle;
    }
    const realmTitle = document.getElementById('realmTitle');
    if (realmTitle && this.equippedTitle) {
      // Hiện title dưới cảnh giới
    }
    // Inject below realm title
    let titleEl = document.getElementById('shrine-equipped-title');
    if (!titleEl) {
      titleEl = document.createElement('div');
      titleEl.id = 'shrine-equipped-title';
      titleEl.style.cssText = 'color:#ff9800;font-size:9px;text-shadow:1px 1px 2px #000;';
      const statsPanel = document.getElementById('statsPanel');
      if (statsPanel) statsPanel.insertBefore(titleEl, statsPanel.children[1]);
    }
    titleEl.textContent = this.equippedTitle ? `🏷️ ${this.equippedTitle}` : '';
  },

  // ==================== EFFECTS ====================
  _spawnUnlockEffect() {
    for (let i = 0; i < 20; i++) {
      GameState.particles.push({
        x: Player.x + (Math.random() - 0.5) * 60,
        y: Player.y - 20 + (Math.random() - 0.5) * 40,
        vx: (Math.random() - 0.5) * 4,
        vy: -3 - Math.random() * 3,
        life: 1500,
        color: '#ffd700',
        size: 3 + Math.random() * 5
      });
    }
  },

  update(dt) {
    this._animTime += dt;

    // Session tracker
    if (this._animTime % 10000 < dt) {
      const session = Date.now() - this.stats.sessionStart;
      if (session > this.stats.longestSession) {
        this.stats.longestSession = session;
      }
    }

    // Animate shrine canvas if open
    if (this.shrineOpen) {
      const canvas = document.getElementById('shrine-canvas');
      if (canvas) this._draw3DHall(canvas);
    }
  },

  // ==================== INJECT UI ====================
  _injectUI() {
    const div = document.createElement('div');
    div.innerHTML = `
      <div id="shrine-overlay" style="
        display:none;position:absolute;top:0;left:0;width:100%;height:100%;
        background:rgba(0,0,0,0.85);z-index:120;
        align-items:center;justify-content:center;
        backdrop-filter:blur(3px);
      ">
        <div style="
          background:linear-gradient(135deg,#0d1117,#1a1a2e);
          border:3px solid #f0c040;border-radius:16px;
          width:94%;max-width:420px;max-height:88vh;
          overflow-y:auto;box-shadow:0 0 40px rgba(240,192,64,0.3);
        ">
          <!-- Header -->
          <div style="display:flex;justify-content:space-between;align-items:center;padding:14px 16px;border-bottom:2px solid #f0c04033">
            <div style="color:#f0c040;font-size:17px;font-weight:bold;text-shadow:0 0 15px rgba(240,192,64,0.5)">
              🏛️ Điện Thành Tựu
            </div>
            <div onclick="AchievementShrine.close()" style="
              width:30px;height:30px;background:rgba(255,0,0,0.2);border:2px solid #f44;
              border-radius:50%;color:#f44;font-size:16px;cursor:pointer;
              display:flex;align-items:center;justify-content:center;
            ">✕</div>
          </div>

          <!-- 3D Canvas Hall -->
          <canvas id="shrine-canvas" width="390" height="100"
            style="width:100%;display:block;border-bottom:1px solid #333"></canvas>

          <!-- Hall tabs -->
          <div id="shrine-tabs" style="display:flex;flex-wrap:wrap;gap:4px;padding:10px 12px 6px"></div>

          <!-- Hall progress -->
          <div id="shrine-hall-progress" style="text-align:center;font-size:10px;margin-bottom:8px;font-weight:bold"></div>

          <!-- Achievement grid -->
          <div id="shrine-achievement-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:0 12px 12px"></div>

          <!-- Stats -->
          <div style="border-top:1px solid #333;padding:12px;margin-top:4px">
            <div style="color:#f0c040;font-size:12px;font-weight:bold;margin-bottom:8px">📊 Thống Kê</div>
            <div id="shrine-stats"></div>
          </div>

          <!-- Title picker -->
          <div style="border-top:1px solid #333;padding:12px">
            <div id="shrine-title-picker"></div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(div);

    // Add Shrine button to menu bar
    const menuBar = document.getElementById('menuBar');
    if (menuBar) {
      const btn = document.createElement('div');
      btn.className = 'menu-btn';
      btn.innerHTML = '<span style="font-size:16px">🏛️</span><span>Thành Tựu</span>';
      btn.onclick = () => this.open();
      menuBar.appendChild(btn);
    }
  },

  // ==================== STYLES ====================
  _injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .shrine-tab-btn {
        padding: 5px 8px;
        border: 1.5px solid #333;
        border-radius: 6px;
        font-size: 9px;
        cursor: pointer;
        color: #666;
        background: rgba(255,255,255,0.03);
        font-family: 'Courier New', monospace;
        transition: all 0.2s;
        white-space: nowrap;
      }
      .shrine-tab-btn.active { background: rgba(240,192,64,0.1); }
      .shrine-tab-btn:active { transform: scale(0.95); }

      .shrine-ach-card {
        border: 1.5px solid #333;
        border-radius: 10px;
        padding: 10px 8px;
        display: flex;
        flex-direction: column;
        gap: 4px;
        transition: all 0.2s;
      }
      .shrine-ach-card.unlocked { cursor: pointer; }
      .shrine-ach-card.unlocked:active { transform: scale(0.97); }
      .shrine-ach-card.locked { opacity: 0.5; }

      .shrine-ach-icon { font-size: 20px; text-align: center; }
      .shrine-ach-name { font-size: 10px; font-weight: bold; text-align: center; }
      .shrine-ach-desc { font-size: 8px; color: #666; text-align: center; line-height: 1.4; }
      .shrine-ach-title {
        font-size: 8px; text-align: center;
        border: 1px solid #f0c04044;
        border-radius: 4px; padding: 2px 4px;
        color: #f0c040; margin-top: 2px;
      }
      .shrine-ach-locked-hint { font-size: 8px; color: #444; text-align: center; }

      .shrine-stat-row {
        display: flex;
        justify-content: space-between;
        padding: 4px 0;
        border-bottom: 1px solid #ffffff08;
        font-size: 10px;
      }
      .shrine-stat-lbl { color: #888; }
      .shrine-stat-val { color: #f0c040; font-weight: bold; }

      .shrine-title-tag {
        padding: 4px 10px;
        border: 1px solid #444;
        border-radius: 20px;
        font-size: 10px;
        color: #888;
        cursor: pointer;
        font-family: 'Courier New', monospace;
        transition: all 0.2s;
      }
      .shrine-title-tag.active {
        border-color: #ff9800;
        color: #ff9800;
        background: rgba(255,152,0,0.1);
      }
      .shrine-title-tag:active { transform: scale(0.95); }

      #shrine-overlay::-webkit-scrollbar { width: 4px; }
      #shrine-overlay > div::-webkit-scrollbar { width: 4px; }
      #shrine-overlay > div::-webkit-scrollbar-track { background: #1a1a2e; }
      #shrine-overlay > div::-webkit-scrollbar-thumb { background: #f0c040; border-radius: 2px; }
    `;
    document.head.appendChild(style);
  },

  // ==================== SAVE/LOAD ====================
  _saveData() {
    try {
      localStorage.setItem('shrine_data', JSON.stringify({
        unlockedAchievements: this.unlockedAchievements,
        allTitles: this.allTitles,
        equippedTitle: this.equippedTitle,
        stats: {
          totalKills: this.stats.totalKills,
          bossKills: this.stats.bossKills,
          totalCrits: this.stats.totalCrits,
          totalDamageDealt: this.stats.totalDamageDealt,
          totalDeaths: this.stats.totalDeaths,
          totalBossDeaths: this.stats.totalBossDeaths,
          diedWithNoGold: this.stats.diedWithNoGold,
          deathBySource: this.stats.deathBySource,
          totalGoldEarned: this.stats.totalGoldEarned,
          maxKillStreak: this.stats.maxKillStreak,
          fastestBossKill: this.stats.fastestBossKill,
          bossKillsNoDamage: this.stats.bossKillsNoDamage,
          longestSession: this.stats.longestSession,
          maxSingleHit: this.stats.maxSingleHit,
          mapsVisited: this.stats.mapsVisited,
          npcsInteracted: this.stats.npcsInteracted,
          secretsFound: this.stats.secretsFound,
          legendaryLooted: this.stats.legendaryLooted,
          totalItemsSold: this.stats.totalItemsSold,
        }
      }));
    } catch(e) {}
  },

  _loadData() {
    try {
      const raw = localStorage.getItem('shrine_data');
      if (!raw) return;
      const d = JSON.parse(raw);
      this.unlockedAchievements = d.unlockedAchievements || [];
      this.allTitles = d.allTitles || [];
      this.equippedTitle = d.equippedTitle || null;
      if (d.stats) {
        Object.assign(this.stats, d.stats);
        // Fix: Infinity không serialize được
        if (!isFinite(this.stats.fastestBossKill)) this.stats.fastestBossKill = Infinity;
      }
      this.stats.sessionStart = Date.now();
      setTimeout(() => this._updateTitleDisplay(), 300);
    } catch(e) {}
  },
};

// ==================== HOOKS ====================
const _origGameInit_AS = Game.init.bind(Game);
Game.init = function() {
  _origGameInit_AS();
  AchievementShrine.init();
  setTimeout(() => AchievementShrine.spawnShrineNPC(), 500);
};

const _origGameUpdate_AS = Game.update.bind(Game);
Game.update = function(dt) {
  _origGameUpdate_AS(dt);
  AchievementShrine.update(dt);
};

// Hook Enemies.damage — track damage + kills
const _origDmg_AS = Enemies.damage ? Enemies.damage.bind(Enemies) : null;
if (_origDmg_AS) {
  Enemies.damage = function(enemy, amount, isCrit, color) {
    _origDmg_AS(enemy, amount, isCrit, color);
    AchievementShrine.onDamageDealt(amount || 0, isCrit);
    // Boss engage
    if (enemy && enemy.boss && enemy.alive) {
      if (!enemy._shrineTracked) {
        enemy._shrineTracked = true;
        AchievementShrine.onBossEngage(enemy);
      }
    }
    // Kill
    if (enemy && !enemy.alive) {
      AchievementShrine.onKill(enemy);
    }
  };
}

// Hook Player.takeDamage
const _origTakeDmg_AS = Player.takeDamage.bind(Player);
Player.takeDamage = function(amount, source) {
  _origTakeDmg_AS(amount, source);
  AchievementShrine.onDamageTaken(source);
};

// Hook Player.die
const _origDie_AS = Player.die.bind(Player);
Player.die = function() {
  _origDie_AS();
  AchievementShrine.onDeath(Player.target ? Player.target.name : 'Unknown');
};

// Hook Player.gold changes via gainExp to track gold
const _origEnemies_reward = Enemies.damage;
// Hook Maps.travelTo
const _origTravel_AS = Maps.travelTo ? Maps.travelTo.bind(Maps) : null;
if (_origTravel_AS) {
  Maps.travelTo = function(idx) {
    _origTravel_AS(idx);
    const map = Maps.data[idx];
    if (map) AchievementShrine.onMapVisit(map.name);
  };
}

// Hook NPC.interact for stat
const _origNPCInteract_AS = NPC.interact.bind(NPC);
NPC.interact = function(npc) {
  _origNPCInteract_AS(npc);
  AchievementShrine.onNPCInteract();
};

// Hook Inventory.add for legendary loot
const _origInvAdd_AS = Inventory.add ? Inventory.add.bind(Inventory) : null;
if (_origInvAdd_AS) {
  Inventory.add = function(itemId, qty) {
    const result = _origInvAdd_AS(itemId, qty);
    if (result && ITEMS[itemId] && ITEMS[itemId].rarity === 'legendary') {
      AchievementShrine.onLegendaryLoot();
    }
    return result;
  };
}

// Hook Game.save/load
const _origSave_AS = Game.save.bind(Game);
Game.save = function() {
  _origSave_AS();
  AchievementShrine._saveData();
};

const _origLoad_AS = Game.load.bind(Game);
Game.load = function() {
  const r = _origLoad_AS();
  AchievementShrine._loadData();
  return r;
};

console.log('🏛️ feature_achievement_shrine.js loaded');
// Thêm vào index.html: <script src="js/feature_achievement_shrine.js"></script>
