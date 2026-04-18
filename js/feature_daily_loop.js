// ==================== FEATURE: DAILY LOOP SYSTEM ====================
// Gồm: DivineMissionSystem + OfflineProgressSystem + UI
// Load sau: game.js, inventory.js, enemies.js, player.js
// Thêm vào index.html: <script src="js/feature_daily_loop.js"></script>

// ============================================================
// SECTION 1 — DATA & CONFIG
// ============================================================

const DAILY_CONFIG = {
  resetHour: 0,
  storageKey: 'tuxien_daily_loop',

  streakProtectorItemId: 'streakProtector',
  gracePeriodDays: 0,

  offlineCap: 8 * 60 * 60 * 1000,
  offlineDailyLimit: 2,
  offlineMapMultiplier: [1.0, 1.5, 2.0, 2.5, 3.0, 4.0],
  offlineBaseExpPerHour: 8,
  offlineBaseGoldPerHour: 3,

  skipItemId: 'divineToken',

  missionPool: {
    easy: [
      { id:'kill_any_10',  type:'kill',   target:'any',    count:10,
        desc:'Tiêu diệt 10 yêu thú',           reward:{ exp:100, gold:80 } },
      { id:'use_potion_3', type:'use',    target:'potion', count:3,
        desc:'Sử dụng 3 đan dược',              reward:{ exp:80,  gold:60 } },
      { id:'move_5000',    type:'move',   target:null,     count:5000,
        desc:'Di chuyển 5000px',                reward:{ exp:90,  gold:70 } },
      { id:'kill_wolf_5',  type:'kill',   target:'wolf',   count:5,
        desc:'Tiêu diệt 5 Sói Xám',            reward:{ exp:100, gold:80 } },
      { id:'regen_mp',     type:'regen',  target:'mp',     count:100,
        desc:'Hồi phục 100 MP',                 reward:{ exp:80,  gold:60 } },
      { id:'kill_boar_5',  type:'kill',   target:'boar',   count:5,
        desc:'Tiêu diệt 5 Heo Rừng',           reward:{ exp:100, gold:80 } }
    ],
    normal: [
      { id:'kill_boss_1',   type:'kill',   target:'boss',  count:1,
        desc:'Tiêu diệt 1 boss bản đồ',
        reward:{ exp:300, gold:200, item:'realmPill', itemCount:1 } },
      { id:'craft_2',       type:'craft',  target:null,    count:2,
        desc:'Luyện đan thành công 2 lần',
        reward:{ exp:250, gold:180, item:'expPotion', itemCount:1 } },
      { id:'enter_dungeon', type:'dungeon',target:null,    count:1,
        desc:'Vào 1 Bí Cảnh',
        reward:{ exp:280, gold:200, item:'realmPill', itemCount:1 } },
      { id:'kill_any_30',   type:'kill',   target:'any',   count:30,
        desc:'Tiêu diệt 30 yêu thú',
        reward:{ exp:260, gold:190 } },
      { id:'kill_ghost_10', type:'kill',   target:'ghost', count:10,
        desc:'Tiêu diệt 10 U Linh',
        reward:{ exp:270, gold:185, item:'spiritStone', itemCount:2 } }
    ],
    hard: [
      { id:'boss_event_1',  type:'kill',   target:'bossEvent', count:1,
        desc:'Tham chiến Boss Event',
        reward:{ exp:800, gold:600, item:'dragonScale', itemCount:1 } },
      { id:'combo_20',      type:'combo',  target:null,        count:20,
        desc:'Đạt Combo x20 trong 1 trận',
        reward:{ exp:700, gold:500, item:'realmPill', itemCount:2 } },
      { id:'clear_epic',    type:'dungeon',target:'epic',      count:1,
        desc:'Hoàn thành Bí Cảnh Sử Thi',
        reward:{ exp:900, gold:700, item:'spiritStone', itemCount:3 } },
      { id:'kill_demon_20', type:'kill',   target:'demon',     count:20,
        desc:'Tiêu diệt 20 Yêu Ma',
        reward:{ exp:750, gold:550, item:'demonCore', itemCount:3 } },
      { id:'realm_exp_500', type:'realmExp',target:null,       count:500,
        desc:'Tích lũy 500 Tu Vi',
        reward:{ exp:800, gold:600, item:'expPotion', itemCount:2 } }
    ]
  },

  streakRewards: [
    { days:3,  reward:{ item:'realmPill',    count:3 } },
    { days:7,  reward:{ item:'expPotion',    count:3,
                        extraItem:'dragonScale',   extraCount:1 } },
    { days:14, reward:{ item:'dragonScale',  count:2,
                        extraItem:'celestialOrb',  extraCount:1 } },
    { days:30, reward:{ item:'celestialOrb', count:3,
                        extraItem:'celestialSword',extraCount:1 } }
  ]
};

// Đăng ký items mới vào ITEMS
ITEMS.divineToken = {
  name: 'Lệnh Bài Thần Linh',
  type: 'consumable',
  rarity: 'epic',
  desc: 'Bỏ qua 1 nhiệm vụ Khó trong Divine Missions.',
  effect: { skipMission: true },
  sellPrice: 500,
  icon: 'token'
};

ITEMS.streakProtector = {
  name: 'Hộ Mệnh Phù',
  type: 'consumable',
  rarity: 'rare',
  desc: 'Bảo vệ streak 1 ngày khi bỏ lỡ nhiệm vụ.',
  effect: { protectStreak: true },
  sellPrice: 200,
  icon: 'charm'
};

// ============================================================
// SECTION 2 — DIVINE MISSION SYSTEM
// ============================================================

const DivineMissionSystem = {
  state: {
    today: null,
    missions: [],
    streak: 0,
    lastCompletedDate: null,
    protectorActive: false,
    killCount: {},
    sessionMoveDistance: 0,
    sessionMpRegen: 0,
    sessionRealmExp: 0,
    comboMaxReached: 0,
    bossEventKilled: false,
    dungeonEntered: false,
    dungeonEpicCleared: false,
    craftCount: 0
  },

  _lastPos: null,

  getTodayString() {
    const d = new Date(Date.now());
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  },

  getYesterdayString() {
    const d = new Date(Date.now() - 86400000);
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  },

  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash += str.charCodeAt(i);
    }
    return hash;
  },

  checkReset() {
    const today = this.getTodayString();
    if (this.state.today === today) return;

    const s = this.state;
    if (s.lastCompletedDate) {
      const yesterday = this.getYesterdayString();
      if (s.lastCompletedDate !== yesterday) {
        // Miss 1 ngày trở lên
        if (s.protectorActive) {
          s.protectorActive = false;
          UI.addLog('🛡️ Hộ Mệnh Phù đã bảo vệ streak của bạn!', 'system');
        } else if (s.streak > 0) {
          UI.addLog('💔 Streak bị reset! Chuỗi ' + s.streak + ' ngày đã mất.', 'system');
          s.streak = 0;
        }
      }
      // Nếu lastCompletedDate === yesterday → streak giữ nguyên, tăng khi hôm nay complete
    }

    s.today = today;
    s.missions = this.generateDailyMissions();
    this.resetTracking();
    UI.addLog('🌟 Nhiệm Vụ Thần Linh mới đã xuất hiện!', 'system');
    DivineMissionHUD.updateBadge();
    DivineMissionPanel.render();
  },

  generateDailyMissions() {
    const pool = DAILY_CONFIG.missionPool;
    const h = this.hashString(this.state.today);
    const easy   = pool.easy[h % pool.easy.length];
    const normal = pool.normal[(h * 7) % pool.normal.length];
    const hard   = pool.hard[(h * 13) % pool.hard.length];
    return [
      { ...easy,   difficulty: 'easy',   progress: 0, completed: false, claimed: false },
      { ...normal, difficulty: 'normal', progress: 0, completed: false, claimed: false },
      { ...hard,   difficulty: 'hard',   progress: 0, completed: false, claimed: false }
    ];
  },

  resetTracking() {
    const s = this.state;
    s.killCount = {};
    s.sessionMoveDistance = 0;
    s.sessionMpRegen = 0;
    s.sessionRealmExp = 0;
    s.comboMaxReached = 0;
    s.bossEventKilled = false;
    s.dungeonEntered = false;
    s.dungeonEpicCleared = false;
    s.craftCount = 0;
    this._lastPos = null;
  },

  updateProgress(type, target, amount) {
    let anyCompleted = false;
    for (const m of this.state.missions) {
      if (m.completed) continue;
      if (m.type !== type) continue;
      if (m.target && m.target !== 'any' && m.target !== target) continue;
      m.progress = Math.min(m.count, m.progress + amount);
      if (m.progress >= m.count) {
        m.completed = true;
        UI.addLog('✅ Hoàn thành: ' + m.desc, 'system');
        anyCompleted = true;
      }
    }
    if (anyCompleted) {
      DivineMissionHUD.updateBadge();
      DivineMissionPanel.render();
      if (this.state.missions.every(m => m.completed)) {
        this.onAllCompleted();
      }
    }
  },

  onAllCompleted() {
    const s = this.state;
    s.streak++;
    s.lastCompletedDate = this.getTodayString();
    DivineMissionHUD.showStreakUpdate(s.streak);
    for (const sr of DAILY_CONFIG.streakRewards) {
      if (s.streak === sr.days) {
        Inventory.add(sr.reward.item, sr.reward.count);
        if (sr.reward.extraItem) Inventory.add(sr.reward.extraItem, sr.reward.extraCount);
        UI.showNotification('🔥 Streak ' + sr.days + ' ngày!',
          sr.reward.item + ' x' + sr.reward.count);
        UI.addLog('🔥 Phần thưởng streak ' + sr.days + ' ngày!', 'realm');
        break;
      }
    }
  },

  claimMission(index) {
    const m = this.state.missions[index];
    if (!m || !m.completed || m.claimed) return false;
    m.claimed = true;
    if (m.reward.exp)  Player.gainExp(m.reward.exp);
    if (m.reward.gold) { Player.gold += m.reward.gold; UI.updateGold(); }
    if (m.reward.item) Inventory.add(m.reward.item, m.reward.itemCount || 1);
    UI.addLog('🎁 Nhận thưởng: ' + m.desc, 'exp');
    DivineMissionHUD.updateBadge();
    DivineMissionPanel.render();
    return true;
  },

  skipHardMission() {
    const hard = this.state.missions.find(m => m.difficulty === 'hard' && !m.completed);
    if (!hard) return false;
    if (!Inventory.has(DAILY_CONFIG.skipItemId, 1)) {
      UI.addLog('❌ Không có Lệnh Bài Thần Linh!', 'system');
      return false;
    }
    Inventory.remove(DAILY_CONFIG.skipItemId, 1);
    hard.completed = true;
    hard.progress = hard.count;
    UI.addLog('⚡ Đã bỏ qua nhiệm vụ Khó!', 'system');
    DivineMissionHUD.updateBadge();
    DivineMissionPanel.render();
    if (this.state.missions.every(m => m.completed)) {
      this.onAllCompleted();
    }
    return true;
  },

  // Được gọi từ hook Player.update mỗi frame
  trackMovement(px, py) {
    if (!this._lastPos) {
      this._lastPos = { x: px, y: py };
      return;
    }
    const moved = Utils.dist(px, py, this._lastPos.x, this._lastPos.y);
    if (moved > 0 && moved < 50) {
      this.state.sessionMoveDistance += moved;
      this.updateProgress('move', null, moved);
    }
    this._lastPos = { x: px, y: py };
  },

  // Được gọi từ hook Player.heal (phần MP)
  trackMpRegen(amount) {
    if (amount <= 0) return;
    this.state.sessionMpRegen += amount;
    this.updateProgress('regen', 'mp', amount);
  },

  // Được gọi từ hook Player.gainRealmExp
  trackRealmExp(amount) {
    this.state.sessionRealmExp += amount;
    this.updateProgress('realmExp', null, amount);
  }
};

// ============================================================
// SECTION 3 — OFFLINE PROGRESS SYSTEM
// ============================================================

const OfflineProgressSystem = {
  state: {
    lastLoginTime: 0,
    dailyClaimCount: 0,
    lastClaimDate: null
  },

  _pendingRewards: null,

  calculate() {
    const now = Date.now();
    const elapsed = now - this.state.lastLoginTime;
    if (elapsed < 60000) return null;

    const offlineMs   = Math.min(elapsed, DAILY_CONFIG.offlineCap);
    const offlineHours = offlineMs / (60 * 60 * 1000);

    const mapIdx = (typeof Maps !== 'undefined') ? (Maps.currentIndex || 0) : 0;
    const mapMul = DAILY_CONFIG.offlineMapMultiplier[mapIdx] || 1.0;

    let sectBonus = 1.0;
    if (typeof SectSystem !== 'undefined' && SectSystem.state && SectSystem.state.founded) {
      const disciples = SectSystem.state.disciples ? SectSystem.state.disciples.length : 0;
      sectBonus = 1 + disciples * 0.05;
    }

    const lvl       = (typeof Player !== 'undefined') ? (Player.level || 1) : 1;
    const baseExp   = lvl * DAILY_CONFIG.offlineBaseExpPerHour;
    const baseGold  = lvl * DAILY_CONFIG.offlineBaseGoldPerHour;

    const totalExp  = Math.floor(baseExp  * offlineHours * mapMul * sectBonus);
    const totalGold = Math.floor(baseGold * offlineHours * mapMul * sectBonus);

    const mapName = (typeof Maps !== 'undefined' && Maps.data && Maps.data[mapIdx])
      ? Maps.data[mapIdx].name : 'Bản Đồ';

    return {
      offlineMs,
      offlineHours: offlineHours.toFixed(1),
      exp: totalExp,
      gold: totalGold,
      mapName,
      sectBonus: sectBonus > 1 ? Math.round((sectBonus - 1) * 100) + '%' : null
    };
  },

  canClaim() {
    const today = DivineMissionSystem.getTodayString();
    if (this.state.lastClaimDate !== today) {
      this.state.dailyClaimCount = 0;
      this.state.lastClaimDate = today;
    }
    return this.state.dailyClaimCount < DAILY_CONFIG.offlineDailyLimit;
  },

  claim(rewards) {
    if (!this.canClaim()) {
      UI.addLog('❌ Đã nhận đủ ' + DAILY_CONFIG.offlineDailyLimit + ' lần offline hôm nay!', 'system');
      return false;
    }
    Player.gainExp(rewards.exp);
    Player.gold += rewards.gold;
    UI.updateGold();
    this.state.dailyClaimCount++;
    this.state.lastLoginTime = Date.now();
    UI.addLog('💤 Offline ' + rewards.offlineHours + 'h: +' +
      rewards.exp + ' EXP, +' + rewards.gold + ' 💰', 'exp');
    this._pendingRewards = null;
    return true;
  },

  onGameLoad() {
    const rewards = this.calculate();
    if (!rewards || rewards.exp === 0) {
      this.state.lastLoginTime = Date.now();
      return;
    }
    if (!this.canClaim()) {
      this.state.lastLoginTime = Date.now();
      return;
    }
    this._pendingRewards = rewards;
    setTimeout(() => {
      OfflineProgressHUD.show(rewards);
    }, 1000);
  }
};

// ============================================================
// SECTION 4 — UI
// ============================================================

// -------- Divine Mission HUD --------
const DivineMissionHUD = {
  _badgeEl: null,

  init() {
    // Inject HTML
    const hudHtml = `
<!-- Divine Mission Panel -->
<div id="divineMissionPanel" style="display:none;position:fixed;right:70px;bottom:200px;z-index:22;
  background:linear-gradient(135deg,#1a1a2e,#16213e);border:2px solid #f0c040;
  border-radius:12px;padding:15px;width:290px;
  box-shadow:0 0 20px rgba(240,192,64,0.3)">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
    <div style="color:#f0c040;font-size:13px;font-weight:bold">🌟 Nhiệm Vụ Thần Linh</div>
    <div id="divinePanelClose" style="color:#f44;cursor:pointer;font-size:16px;padding:0 6px;line-height:1">✕</div>
  </div>
  <div id="divineStreakBar" style="background:rgba(255,107,53,0.1);border:1px solid #ff6b35;
    border-radius:8px;padding:6px 10px;margin-bottom:10px;display:flex;align-items:center;gap:8px">
    <span style="font-size:18px">🔥</span>
    <div>
      <div id="divineStreakCount" style="color:#ff6b35;font-size:12px;font-weight:bold"></div>
      <div id="divineStreakNext"  style="color:#888;font-size:9px"></div>
    </div>
  </div>
  <div id="divineMissionList"></div>
  <div id="divineResetTimer" style="color:#666;font-size:9px;text-align:center;margin-top:8px"></div>
</div>

<!-- Streak popup -->
<div id="divineStreakPopup" style="display:none;position:fixed;top:50%;left:50%;
  transform:translate(-50%,-50%);z-index:200;text-align:center;pointer-events:none">
  <div id="divineStreakNumber" style="font-size:48px;font-weight:bold;color:#ff6b35;
    text-shadow:0 0 20px rgba(255,107,53,0.8)"></div>
  <div style="color:#f7c59f;font-size:14px;margin-top:4px">NGÀY LIÊN TIẾP!</div>
</div>`;
    document.body.insertAdjacentHTML('beforeend', hudHtml);

    // Close button
    document.getElementById('divinePanelClose').onclick = () => {
      document.getElementById('divineMissionPanel').style.display = 'none';
    };

    // Inject badge vào menu button Nhiệm vụ (iconQuest)
    this._injectBadge();
  },

  _injectBadge() {
    // Tìm button quest trong menu
    const questBtn = document.getElementById('iconQuest') ||
      [...document.querySelectorAll('.menu-btn')].find(b => b.textContent.includes('nhiệm') || b.textContent.includes('Quest'));

    if (questBtn) {
      questBtn.style.position = 'relative';
      const badge = document.createElement('div');
      badge.id = 'divineBadge';
      badge.style.cssText = `
        display:none;position:absolute;top:-4px;right:-4px;
        background:#f44336;color:#fff;font-size:9px;font-weight:bold;
        border-radius:8px;padding:1px 5px;min-width:16px;text-align:center;
        pointer-events:none;z-index:5;`;
      questBtn.appendChild(badge);
      this._badgeEl = badge;

      // Wrap onclick — mở Divine panel thay vì/thêm vào quest panel
      const origOnclick = questBtn.onclick;
      questBtn.onclick = (e) => {
        const panel = document.getElementById('divineMissionPanel');
        if (panel.style.display === 'none' || panel.style.display === '') {
          DivineMissionPanel.render();
          panel.style.display = 'block';
        } else {
          panel.style.display = 'none';
        }
        // Gọi hành vi gốc nếu cần (comment nếu muốn thay hoàn toàn)
        // if (origOnclick) origOnclick.call(questBtn, e);
      };
    }
  },

  updateBadge() {
    const missions = DivineMissionSystem.state.missions;
    const unclaimed = missions.filter(m => m.completed && !m.claimed).length;
    if (!this._badgeEl) return;
    if (unclaimed > 0) {
      this._badgeEl.textContent = unclaimed;
      this._badgeEl.style.display = 'block';
      this._badgeEl.style.background = '#f44336';
    } else {
      const remaining = missions.filter(m => !m.completed).length;
      if (remaining > 0) {
        this._badgeEl.textContent = remaining;
        this._badgeEl.style.display = 'block';
        this._badgeEl.style.background = '#666';
      } else {
        this._badgeEl.style.display = 'none';
      }
    }
  },

  showStreakUpdate(streak) {
    const popup  = document.getElementById('divineStreakPopup');
    const number = document.getElementById('divineStreakNumber');
    if (!popup || !number) return;
    number.textContent = '🔥 ' + streak;
    popup.style.display = 'block';
    popup.style.animation = 'streakPop 2s forwards';
    setTimeout(() => { popup.style.display = 'none'; }, 2100);
  },

  _timerInterval: null,

  startCountdown() {
    if (this._timerInterval) clearInterval(this._timerInterval);
    this._timerInterval = setInterval(() => {
      const el = document.getElementById('divineResetTimer');
      if (!el) return;
      const now  = new Date(Date.now());
      const next = new Date(Date.now());
      next.setHours(24, 0, 0, 0);
      const diff = next - now;
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      el.textContent = `Làm mới sau: ${h}h ${m}m ${s}s`;
    }, 1000);
  }
};

// -------- Divine Mission Panel (nội dung bên trong) --------
const DivineMissionPanel = {
  render() {
    const s = DivineMissionSystem.state;

    // Streak bar
    const streakCount = document.getElementById('divineStreakCount');
    const streakNext  = document.getElementById('divineStreakNext');
    if (streakCount) streakCount.textContent = s.streak + ' ngày liên tiếp';
    if (streakNext) {
      const nextReward = DAILY_CONFIG.streakRewards.find(r => r.days > s.streak);
      streakNext.textContent = nextReward
        ? `Còn ${nextReward.days - s.streak} ngày để nhận thưởng streak`
        : 'Đã đạt mốc streak cao nhất!';
    }

    // Mission list
    const list = document.getElementById('divineMissionList');
    if (!list) return;
    list.innerHTML = '';

    const diffColors  = { easy: '#4caf50', normal: '#ff9800', hard: '#f44336' };
    const diffLabels  = { easy: 'DỄ', normal: 'TB', hard: 'KHÓ' };

    s.missions.forEach((m, i) => {
      const pct  = Math.min(100, Math.floor((m.progress / m.count) * 100));
      const col  = diffColors[m.difficulty] || '#888';
      const lbl  = diffLabels[m.difficulty] || m.difficulty;

      let actionHtml = '';
      if (m.claimed) {
        actionHtml = `<span style="color:#4caf50;font-size:10px">✅ Đã nhận</span>`;
      } else if (m.completed) {
        actionHtml = `<button onclick="DivineMissionSystem.claimMission(${i})"
          style="background:rgba(240,192,64,0.2);border:1px solid #f0c040;color:#f0c040;
          border-radius:6px;padding:3px 8px;font-size:10px;cursor:pointer;font-family:inherit">
          🎁 Nhận</button>`;
      } else {
        actionHtml = `<span style="color:#aaa;font-size:10px">${m.progress}/${m.count}</span>`;
      }

      let skipHtml = '';
      if (m.difficulty === 'hard' && !m.completed) {
        const hasToken = Inventory.has(DAILY_CONFIG.skipItemId, 1);
        skipHtml = `<button onclick="DivineMissionSystem.skipHardMission()"
          style="margin-top:4px;background:rgba(224,64,251,0.15);border:1px solid #e040fb;
          color:${hasToken ? '#e040fb' : '#666'};border-radius:6px;padding:3px 8px;
          font-size:9px;cursor:${hasToken ? 'pointer' : 'default'};font-family:inherit;width:100%">
          ⚡ Skip (Lệnh Bài Thần Linh)</button>`;
      }

      const card = document.createElement('div');
      card.style.cssText = `background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);
        border-radius:8px;padding:8px 10px;margin-bottom:8px;`;
      card.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
          <div style="display:flex;align-items:center;gap:6px;flex:1;min-width:0">
            <span style="background:${col};color:#fff;font-size:8px;font-weight:bold;
              border-radius:4px;padding:2px 5px;flex-shrink:0">${lbl}</span>
            <span style="color:#ccc;font-size:10px;line-height:1.3">${m.desc}</span>
          </div>
          <div style="flex-shrink:0">${actionHtml}</div>
        </div>
        <div style="margin-top:5px;background:rgba(255,255,255,0.08);border-radius:4px;height:4px;overflow:hidden">
          <div style="width:${pct}%;height:100%;background:${col};transition:width .3s"></div>
        </div>
        ${skipHtml}`;
      list.appendChild(card);
    });

    DivineMissionHUD.startCountdown();
  }
};

// -------- Offline Progress HUD --------
const OfflineProgressHUD = {
  _autoHideTimer: null,
  _currentRewards: null,

  init() {
    const hudHtml = `
<div id="offlineProgressHUD" style="display:none;position:fixed;bottom:20px;right:20px;z-index:30;
  background:linear-gradient(135deg,#1a1a2e,#16213e);border:2px solid #4caf50;
  border-radius:12px;padding:12px 16px;min-width:220px;
  box-shadow:0 0 15px rgba(76,175,80,0.3);animation:slideInRight 0.3s ease">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
    <div style="color:#4caf50;font-size:11px;font-weight:bold">💤 Phần Thưởng Offline</div>
    <div id="offlineHUDClose" style="color:#888;cursor:pointer;font-size:14px;padding:0 4px">✕</div>
  </div>
  <div id="offlineHUDTime"    style="color:#888;font-size:10px;margin-bottom:8px"></div>
  <div id="offlineHUDRewards" style="margin-bottom:10px">
    <div id="offlineHUDExp"   style="color:#ffeb3b;font-size:12px"></div>
    <div id="offlineHUDGold"  style="color:#ffd700;font-size:12px"></div>
    <div id="offlineHUDBonus" style="color:#4caf50;font-size:10px;margin-top:2px"></div>
  </div>
  <div id="offlineClaimInfo"  style="color:#666;font-size:9px;text-align:right;margin-bottom:8px"></div>
  <button id="offlineHUDClaim" style="width:100%;padding:8px;border:2px solid #4caf50;
    background:rgba(76,175,80,0.2);border-radius:8px;color:#4caf50;font-size:12px;
    font-weight:bold;cursor:pointer;font-family:inherit">✓ Thu Hoạch</button>
</div>`;
    document.body.insertAdjacentHTML('beforeend', hudHtml);

    document.getElementById('offlineHUDClaim').onclick = () => {
      if (this._currentRewards) {
        OfflineProgressSystem.claim(this._currentRewards);
      }
      this.hide();
    };

    document.getElementById('offlineHUDClose').onclick = () => {
      OfflineProgressSystem.state.lastLoginTime = Date.now();
      this.hide();
    };
  },

  show(rewards) {
    this._currentRewards = rewards;
    const hud = document.getElementById('offlineProgressHUD');
    if (!hud) return;

    document.getElementById('offlineHUDTime').textContent  = 'Vắng mặt: ' + rewards.offlineHours + ' giờ';
    document.getElementById('offlineHUDExp').textContent   = '+' + rewards.exp + ' EXP';
    document.getElementById('offlineHUDGold').textContent  = '+' + rewards.gold + ' 💰';
    const bonusEl = document.getElementById('offlineHUDBonus');
    if (rewards.sectBonus) {
      bonusEl.textContent = '🏯 Tông Môn +' + rewards.sectBonus;
    } else {
      bonusEl.textContent = '📍 ' + rewards.mapName;
    }

    const claimsLeft = DAILY_CONFIG.offlineDailyLimit - OfflineProgressSystem.state.dailyClaimCount;
    document.getElementById('offlineClaimInfo').textContent =
      'Còn ' + claimsLeft + '/' + DAILY_CONFIG.offlineDailyLimit + ' lần hôm nay';

    hud.style.display = 'block';

    if (this._autoHideTimer) clearTimeout(this._autoHideTimer);
    this._autoHideTimer = setTimeout(() => {
      if (hud.style.display !== 'none' && this._currentRewards) {
        OfflineProgressSystem.claim(this._currentRewards);
      }
      this.hide();
    }, 30000);
  },

  hide() {
    const hud = document.getElementById('offlineProgressHUD');
    if (hud) hud.style.display = 'none';
    if (this._autoHideTimer) { clearTimeout(this._autoHideTimer); this._autoHideTimer = null; }
    this._currentRewards = null;
  }
};

// ============================================================
// SECTION 5 — DAILY LOOP SYSTEM (Khởi động & Hooks)
// ============================================================

const DailyLoopSystem = {

  init() {
    // 1. Inject CSS
    if (!document.getElementById('daily-loop-style')) {
      const style = document.createElement('style');
      style.id = 'daily-loop-style';
      style.textContent = `
        @keyframes slideInRight {
          from { transform: translateX(110%); opacity:0; }
          to   { transform: translateX(0);    opacity:1; }
        }
        @keyframes streakPop {
          0%   { transform: translate(-50%,-50%) scale(0.5); opacity:0; }
          50%  { transform: translate(-50%,-50%) scale(1.2); opacity:1; }
          100% { transform: translate(-50%,-50%) scale(1);   opacity:0; }
        }`;
      document.head.appendChild(style);
    }

    // 2. Inject UI
    DivineMissionHUD.init();
    OfflineProgressHUD.init();

    // 3. Load saved data
    this.loadSavedData();

    // 4. Check reset
    DivineMissionSystem.checkReset();

    // 5. Update badge
    DivineMissionHUD.updateBadge();

    console.log('🌟 Daily Loop System loaded (Divine Missions + Offline Progress)');
  },

  loadSavedData() {
    try {
      const raw = localStorage.getItem(DAILY_CONFIG.storageKey);
      if (!raw) return;
      const saved = JSON.parse(raw);

      if (saved.divine) {
        const def = DivineMissionSystem.state;
        DivineMissionSystem.state = Object.assign({}, def, saved.divine);
        // Restore nested objects
        if (!DivineMissionSystem.state.killCount) DivineMissionSystem.state.killCount = {};
      }

      if (saved.offline) {
        OfflineProgressSystem.state = Object.assign({}, OfflineProgressSystem.state, saved.offline);
      }
    } catch (e) {
      console.error('DailyLoop load error:', e);
    }
  },

  saveData() {
    try {
      const data = {
        divine:  DivineMissionSystem.state,
        offline: OfflineProgressSystem.state
      };
      localStorage.setItem(DAILY_CONFIG.storageKey, JSON.stringify(data));
    } catch (e) {
      console.error('DailyLoop save error:', e);
    }
  },

  // Monkey-patch tất cả hooks
  _hookInstalled: false,
  installHooks() {
    if (this._hookInstalled) return;
    this._hookInstalled = true;

    // ---- Hook: Enemies.kill ----
    if (typeof Enemies !== 'undefined' && Enemies.kill) {
      const _origKill = Enemies.kill.bind(Enemies);
      Enemies.kill = function(enemy) {
        _origKill(enemy);
        if (!enemy) return;
        const type = enemy.type || 'unknown';
        DivineMissionSystem.updateProgress('kill', type, 1);
        DivineMissionSystem.updateProgress('kill', 'any', 1);
        if (enemy.isBossEvent) DivineMissionSystem.updateProgress('kill', 'bossEvent', 1);
        if (enemy.boss)        DivineMissionSystem.updateProgress('kill', 'boss', 1);
      };
    }

    // ---- Hook: Player.update (movement tracking) ----
    if (typeof Player !== 'undefined' && Player.update) {
      const _origPlayerUpdate = Player.update.bind(Player);
      Player.update = function(dt, mx, my) {
        const px = Player.x, py = Player.y;
        _origPlayerUpdate(dt, mx, my);
        DivineMissionSystem.trackMovement(Player.x, Player.y);
        // Combo tracking
        if (typeof ComboSystem !== 'undefined' && ComboSystem.state) {
          const cur = ComboSystem.state.count || 0;
          if (cur > DivineMissionSystem.state.comboMaxReached) {
            DivineMissionSystem.state.comboMaxReached = cur;
            if (cur >= 20) DivineMissionSystem.updateProgress('combo', null, 20);
          }
        }
      };
    }

    // ---- Hook: Player.heal (MP regen tracking) ----
    if (typeof Player !== 'undefined' && Player.heal) {
      const _origHeal = Player.heal.bind(Player);
      Player.heal = function(hp, mp) {
        _origHeal(hp, mp);
        if (mp && mp > 0) {
          DivineMissionSystem.trackMpRegen(mp);
        }
      };
    }

    // ---- Hook: Player.gainRealmExp (Tu Vi tracking) ----
    if (typeof Player !== 'undefined' && Player.gainRealmExp) {
      const _origGainRealmExp = Player.gainRealmExp.bind(Player);
      Player.gainRealmExp = function(amount) {
        _origGainRealmExp(amount);
        DivineMissionSystem.trackRealmExp(amount);
      };
    }

    // ---- Hook: Inventory.useItem (potion + special items) ----
    if (typeof Inventory !== 'undefined' && Inventory.useItem) {
      const _origUseItem = Inventory.useItem.bind(Inventory);
      Inventory.useItem = function(itemId) {
        const itemData = ITEMS[itemId];
        const result = _origUseItem(itemId);
        if (!result) return false;

        if (itemData) {
          // Potion tracking
          if (itemData.type === 'consumable' &&
              (itemData.effect?.hp || itemData.effect?.mp)) {
            DivineMissionSystem.updateProgress('use', 'potion', 1);
          }
          // Streak protector
          if (itemData.effect?.protectStreak) {
            DivineMissionSystem.state.protectorActive = true;
            UI.addLog('🛡️ Hộ Mệnh Phù kích hoạt! Streak được bảo vệ hôm nay.', 'system');
          }
        }
        return true;
      };
    }

    // ---- Hook: Game.save (lưu daily data) ----
    if (typeof Game !== 'undefined' && Game.save) {
      const _origSave = Game.save.bind(Game);
      Game.save = function() {
        _origSave();
        OfflineProgressSystem.state.lastLoginTime = Date.now();
        DailyLoopSystem.saveData();
      };
    }

    // ---- Hook: Game.update (checkReset mỗi frame - cheap) ----
    if (typeof Game !== 'undefined' && Game.update) {
      const _origUpdate = Game.update.bind(Game);
      let _lastResetCheck = '';
      Game.update = function(dt) {
        _origUpdate(dt);
        // Chỉ check khi chuỗi ngày thay đổi (cheap so sánh string)
        const today = DivineMissionSystem.getTodayString();
        if (today !== _lastResetCheck) {
          _lastResetCheck = today;
          DivineMissionSystem.checkReset();
        }
      };
    }
  }
};

// ============================================================
// AUTO-INIT: wrap Game.init để chạy sau khi game sẵn sàng
// ============================================================

(function() {
  const _tryInit = () => {
    if (typeof Game === 'undefined' || !Game.init) {
      setTimeout(_tryInit, 200);
      return;
    }
    const _origInit = Game.init.bind(Game);
    Game.init = function() {
      _origInit();
      DailyLoopSystem.init();
      DailyLoopSystem.installHooks();
      setTimeout(() => OfflineProgressSystem.onGameLoad(), 1500);
    };
  };

  // Nếu Game.init đã bị gọi rồi (DOM ready trước khi script load)
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    // Game có thể đã init — thử fallback
    if (typeof Game !== 'undefined' && typeof GameState !== 'undefined' && GameState.running !== undefined) {
      // Game đã init, chạy thẳng
      setTimeout(() => {
        DailyLoopSystem.init();
        DailyLoopSystem.installHooks();
        setTimeout(() => OfflineProgressSystem.onGameLoad(), 1500);
      }, 300);
    } else {
      _tryInit();
    }
  } else {
    document.addEventListener('DOMContentLoaded', _tryInit);
  }
})();

console.log('📦 feature_daily_loop.js loaded');
