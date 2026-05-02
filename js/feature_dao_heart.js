// ===== FILE: feature_dao_heart.js =====
// ==================== DAO HEART + TIEM KIEM PHO SYSTEM ====================
// Thêm vào index.html sau <script src="js/ui.js"></script>:
// <script src="js/feature_dao_heart.js"></script>
//
// NGUYÊN TẮC: Monkey-patch module — KHÔNG sửa bất kỳ file gốc nào.
// Wrap: Game.init, Game.update, Game.save, Game.load
//        Player.recalculateStats, Player.takeDamage, Player.useSkill
//        Enemies.damage, Enemies.kill
//        NPC.spawnForMap, NPC.interact

// ===========================================================================
// SECTION 1 — DATA & CONFIG
// ===========================================================================

const DAO_HEART_CONFIG = {
  min: -100,
  max: 100,
  decayRate: 0.5,
  decayInterval: 60000, // ms

  events: {
    killBossNoSkill:    +3,
    buyBlackMarket:     -5,
    tankHitNoRetaliate: +1,
    farmContinuous10m:  -2,
    killWithoutDamage:  +2,
    useHealItem:        +1,
    killEliteOrChampion:-1,
    killStreak20:       -3,
    helpNpcEvent:       +5,
    bossEventClear:     +4
  },

  branches: {
    dao: {
      name: 'Đạo Tâm', icon: '☯️', color: '#42a5f5',
      threshold: +40,
      skills: [
        { id: 'daoShield',  name: 'Đạo Tâm Hộ Thể',    desc: 'Hấp thụ 30% damage nhận trong 5s. CD:20s.',                      cd: 20000, mp: 25 },
        { id: 'daoHeal',    name: 'Thiên Địa Hồi Linh',  desc: 'Hồi 25% HP + 50% MP ngay lập tức. CD:30s.',                     cd: 30000, mp: 0  },
        { id: 'daoAura',    name: 'Linh Quang Hào Khí',  desc: '5s: tất cả skill không tốn MP + CD giảm 50%. CD:45s.',          cd: 45000, mp: 0  }
      ]
    },
    ma: {
      name: 'Ma Tâm', icon: '🔥', color: '#f44336',
      threshold: -40,
      skills: [
        { id: 'maBurst',     name: 'Ma Khí Bùng Phát',  desc: 'Tức thì: dmg tất cả enemy trong 200px bằng 300% ATK. CD:15s.',  cd: 15000, mp: 30 },
        { id: 'maLifesteal', name: 'Huyết Hút Ma Công',  desc: '10s: mỗi đòn đánh hút 15% damage thành HP. CD:25s.',            cd: 25000, mp: 20 },
        { id: 'maDomain',    name: 'Ma Vực Lĩnh Thổ',   desc: 'Triệu hồi "Ma Vực" 6s: quái trong 150px chậm lại 50%, player +30% dmg. CD:40s.', cd: 40000, mp: 40 }
      ]
    },
    honNguyen: {
      name: 'Hỗn Nguyên', icon: '💫', color: '#e040fb',
      threshold_dao: +20,
      threshold_ma: -20,
      skills: [
        { id: 'honBalance',   name: 'Âm Dương Cân Bằng',  desc: '10s: nhận damage → hồi 50% amount đó dưới dạng HP. CD:20s.',  cd: 20000, mp: 20 },
        { id: 'honChaos',     name: 'Hỗn Nguyên Thiên Địa',desc: 'Random 1 trong 6 skill (Đạo + Ma) và cast ngay. CD:12s.',    cd: 12000, mp: 15 },
        { id: 'honTransform', name: 'Hỗn Nguyên Biến',    desc: '5s: tất cả dmg +100%, speed +50%, không thể die. CD:60s.',    cd: 60000, mp: 50 }
      ]
    }
  },

  storageKey: 'tuxien_dao_heart'
};

const TIEM_KIEM_PHO_CONFIG = {
  npcName: '📜 Cổ Thư Các',
  pages: [
    { page: 1, name: 'Trang Nhất — Vô Địch',   lore: 'Tiền nhân viết: "Kẻ đứng giữa bão không bị vết thương..."',          challenge: { type: 'killNoHit',       target: 50,                desc: 'Giết 50 quái liên tiếp không bị damage',                   current: 'killNoHitStreak'   } },
    { page: 2, name: 'Trang Nhì — Kiên Nhẫn',  lore: 'Kiếm Thánh xưa thiền định 9 năm không rời đỉnh núi...',             challenge: { type: 'offlineTime',     target: 8 * 60 * 60 * 1000, desc: 'Tu luyện offline 8 tiếng thực',                             current: 'totalOfflineMs'    } },
    { page: 3, name: 'Trang Ba — Cơ Nền',      lore: 'Cơ nền vững chắc — vạn kiếm mới thành...',                          challenge: { type: 'realm',           target: 1, targetStage: 5,  desc: 'Đạt Trúc Cơ Kỳ tầng 5 trở lên',                          current: 'realm_check'       } },
    { page: 4, name: 'Trang Tư — Đồng Bạn',   lore: 'Một mình kiếm sắc, đồng hành kiếm linh...',                         challenge: { type: 'petsOwned',       target: 3,                 desc: 'Sở hữu đủ 3 loại linh thú',                                current: 'petsOwned_count'   } },
    { page: 5, name: 'Trang Năm — Thử Lửa',   lore: 'Qua lửa mới biết kiếm thật...',                                     challenge: { type: 'bossEventClear',  target: 3,                 desc: 'Hoàn thành Boss Event 3 lần',                               current: 'bossEventClears'   } },
    { page: 6, name: 'Trang Sáu — Vạn Vật',   lore: 'Vàng, bạc, đồng — vật phàm. Vạn lượng mới đắc đạo...',            challenge: { type: 'goldAccumulate',  target: 50000,             desc: 'Tích lũy 50,000 vàng (tổng đã nhận, không cần giữ)',       current: 'totalGoldEarned'   } },
    { page: 7, name: 'Trang Bảy — Linh Địa',  lore: 'Linh mạch nuôi dưỡng thân — đứng trên địa linh mới giác ngộ...',  challenge: { type: 'lingMachStand',  target: 3,                 desc: 'Đứng trên 3 Linh Mạch khác nhau (cần feature_dao_heart)',  current: 'lingMachStood'     } },
    { page: 8, name: 'Trang Tám — Vô Cực',    lore: 'Không Đạo không Ma — chỉ có Vũ Trụ...',                            challenge: { type: 'killTotal',       target: 2000,              desc: 'Tổng cộng 2000 lần kill',                                  current: 'totalKills'        } },
    { page: 9, name: 'Trang Chín — Thiên Ý',  lore: 'Thuận thiên ý hay nghịch đều dẫn đến đỉnh cao — chỉ cần đủ quyết tâm...', challenge: { type: 'daoHeartExtreme', target: 80,          desc: 'Đạt Đạo Tâm ≥+80 hoặc Ma Tâm ≤-80',                      current: 'dao_extreme_check' } },
  ],

  kiemThanHoa: {
    duration: 5 * 60 * 1000,
    cooldown: 24 * 60 * 60 * 1000,
    stats: {
      atkMul: 3.0, defMul: 2.0, speedMul: 1.5,
      critRate: 0.50, critDmg: 3.0,
      immuneDamage: false
    },
    auraColor: '#f0c040',
    desc: 'Biến thành Kiếm Thần trong 5 phút!'
  }
};

// ===========================================================================
// SECTION 2 — DAO HEART SYSTEM
// ===========================================================================

const DaoHeartSystem = {
  state: {
    score: 0,
    _decayTimer: 0,
    _skillCooldowns: {},
    activeBranch: null,
    _noRetaliateTimer: 0,
    _autoFarmTimer: 0,
    _lastHitTime: 0,
    _retaliateGiven: false,
    _killStreakCount: 0
  },

  addScore(amount) {
    this.state.score = Math.max(
      DAO_HEART_CONFIG.min,
      Math.min(DAO_HEART_CONFIG.max, this.state.score + amount)
    );
    this.updateBranch();
    DaoHeartHUD.update();
  },

  updateBranch() {
    const s   = this.state.score;
    const cfg = DAO_HEART_CONFIG.branches;
    if (s >= cfg.dao.threshold) {
      this.state.activeBranch = 'dao';
    } else if (s <= cfg.ma.threshold) {
      this.state.activeBranch = 'ma';
    } else if (s >= cfg.honNguyen.threshold_ma && s <= cfg.honNguyen.threshold_dao) {
      this.state.activeBranch = 'honNguyen';
    } else {
      this.state.activeBranch = null;
    }
    DaoSkillPanel.refresh();
  },

  getAvailableSkills() {
    if (!this.state.activeBranch) return [];
    return DAO_HEART_CONFIG.branches[this.state.activeBranch]?.skills || [];
  },

  useSpecialSkill(skillIdx) {
    const skills = this.getAvailableSkills();
    const skill  = skills[skillIdx];
    if (!skill) return false;

    const lastUsed = this.state._skillCooldowns[skill.id] || 0;
    if (GameState.time - lastUsed < skill.cd) {
      UI.addLog('⏳ ' + skill.name + ' đang hồi chiêu!', 'system');
      return false;
    }
    if (Player.mp < skill.mp) {
      UI.addLog('💧 Không đủ MP cho ' + skill.name + '!', 'system');
      return false;
    }

    Player.mp -= skill.mp;
    this.state._skillCooldowns[skill.id] = GameState.time;
    this._executeSkill(skill.id);
    UI.addLog('✨ Thi triển: ' + skill.name, 'skill');
    DaoSkillPanel.refresh();
    return true;
  },

  _executeSkill(id) {
    switch (id) {
      case 'daoShield':
        this.state._daoShieldActive = true;
        this.state._daoShieldAbsorb = 0.30;
        setTimeout(() => { this.state._daoShieldActive = false; }, 5000);
        break;
      case 'daoHeal':
        Player.hp = Math.min(Player.stats.maxHp, Player.hp + Player.stats.maxHp * 0.25);
        Player.mp = Math.min(Player.stats.maxMp, Player.mp + Player.stats.maxMp * 0.50);
        UI.updatePlayerStats();
        break;
      case 'daoAura':
        this.state._daoAuraActive = true;
        setTimeout(() => { this.state._daoAuraActive = false; }, 5000);
        break;
      case 'maBurst':
        if (typeof Enemies !== 'undefined' && Enemies.list) {
          Enemies.list.forEach(e => {
            const dx = e.x - (Player.x || 0);
            const dy = e.y - (Player.y || 0);
            if (Math.sqrt(dx * dx + dy * dy) <= 200) {
              if (typeof Enemies.damage === 'function') Enemies.damage(e, (Player.stats.atk || 10) * 3.0);
            }
          });
        }
        break;
      case 'maLifesteal':
        this.state._maLifestealActive = true;
        setTimeout(() => { this.state._maLifestealActive = false; }, 10000);
        break;
      case 'maDomain':
        this.state._maDomainActive = true;
        setTimeout(() => { this.state._maDomainActive = false; }, 6000);
        break;
      case 'honBalance':
        this.state._honBalanceActive = true;
        setTimeout(() => { this.state._honBalanceActive = false; }, 10000);
        break;
      case 'honChaos': {
        const allSkills = [
          ...DAO_HEART_CONFIG.branches.dao.skills,
          ...DAO_HEART_CONFIG.branches.ma.skills
        ];
        const rand = allSkills[Math.floor(Math.random() * allSkills.length)];
        this._executeSkill(rand.id);
        UI.addLog('🎲 Hỗn Nguyên chọn: ' + rand.name, 'skill');
        break;
      }
      case 'honTransform':
        this.state._honTransformActive = true;
        setTimeout(() => { this.state._honTransformActive = false; }, 5000);
        break;
    }
  },

  tickDecay(dt) {
    this.state._decayTimer += dt;
    if (this.state._decayTimer >= DAO_HEART_CONFIG.decayInterval) {
      this.state._decayTimer = 0;
      if (this.state.score > 0)      this.addScore(-DAO_HEART_CONFIG.decayRate);
      else if (this.state.score < 0) this.addScore(+DAO_HEART_CONFIG.decayRate);
    }
  },

  save() {
    localStorage.setItem(DAO_HEART_CONFIG.storageKey, JSON.stringify({
      score: this.state.score,
      skillCooldowns: this.state._skillCooldowns
    }));
  },

  load() {
    try {
      const raw = localStorage.getItem(DAO_HEART_CONFIG.storageKey);
      if (!raw) return;
      const data = JSON.parse(raw);
      this.state.score = data.score || 0;
      this.state._skillCooldowns = data.skillCooldowns || {};
      this.updateBranch();
      DaoHeartHUD.update();
    } catch (e) {
      console.warn('[DaoHeart] load error', e);
    }
  }
};

// ===========================================================================
// SECTION 3 — TIỆM KIẾM PHỔ SYSTEM
// ===========================================================================

const TiemKiemPhoSystem = {
  state: {
    unlockedPages: [],
    progress: {
      killNoHitStreak: 0,
      totalOfflineMs: 0,
      realm_check: 0,
      petsOwned_count: 0,
      bossEventClears: 0,
      totalGoldEarned: 0,
      lingMachStood: 0,
      totalKills: 0,
      dao_extreme_check: 0
    },
    kiemThanActive: false,
    kiemThanEnd: 0,
    kiemThanLastUsed: 0
  },

  checkChallenge(page) {
    const ch  = page.challenge;
    const val = this.state.progress[ch.current] || 0;
    switch (ch.type) {
      case 'killNoHit':       return val >= ch.target;
      case 'offlineTime':     return val >= ch.target;
      case 'realm':           return this._checkRealm(ch);
      case 'petsOwned':       return val >= ch.target;
      case 'bossEventClear':  return val >= ch.target;
      case 'goldAccumulate':  return val >= ch.target;
      case 'lingMachStand':   return val >= ch.target;
      case 'killTotal':       return val >= ch.target;
      case 'daoHeartExtreme': return Math.abs(DaoHeartSystem.state.score) >= ch.target;
      default:                return false;
    }
  },

  _checkRealm(ch) {
    if (typeof GameState === 'undefined') return false;
    return (GameState.realm || 0) >= ch.target && (GameState.realmStage || 0) >= ch.targetStage;
  },

  tryUnlockPage(pageNum) {
    if (this.state.unlockedPages.includes(pageNum)) return false;
    const page = TIEM_KIEM_PHO_CONFIG.pages.find(p => p.page === pageNum);
    if (!page || !this.checkChallenge(page)) return false;
    this.state.unlockedPages.push(pageNum);
    UI.addLog('📜 Mở khóa ' + page.name + '!', 'achievement');
    if (this.state.unlockedPages.length >= TIEM_KIEM_PHO_CONFIG.pages.length) {
      this._unlockKiemThan();
    }
    return true;
  },

  _unlockKiemThan() {
    UI.addLog('⚔️ Kiếm Thần Hóa đã mở khóa! Sử dụng tại NPC Cổ Thư Các!', 'achievement');
  },

  activateKiemThan() {
    const cfg = TIEM_KIEM_PHO_CONFIG.kiemThanHoa;
    const now = typeof GameState !== 'undefined' ? GameState.time : Date.now();
    if (now - this.state.kiemThanLastUsed < cfg.cooldown) {
      const remain = Math.ceil((cfg.cooldown - (now - this.state.kiemThanLastUsed)) / 3600000);
      UI.addLog('⏳ Kiếm Thần Hóa còn ' + remain + 'h hồi chiêu!', 'system');
      return false;
    }
    if (this.state.unlockedPages.length < TIEM_KIEM_PHO_CONFIG.pages.length) {
      UI.addLog('📜 Cần mở đủ 9 trang Tiệm Kiếm Phổ!', 'system');
      return false;
    }
    this.state.kiemThanActive = true;
    this.state.kiemThanEnd    = now + cfg.duration;
    this.state.kiemThanLastUsed = now;
    UI.addLog('⚔️✨ ' + cfg.desc, 'achievement');
    if (typeof Player !== 'undefined' && typeof Player.recalculateStats === 'function') {
      Player.recalculateStats();
    }
    setTimeout(() => {
      this.state.kiemThanActive = false;
      UI.addLog('⚔️ Kiếm Thần Hóa kết thúc.', 'system');
      if (typeof Player !== 'undefined' && typeof Player.recalculateStats === 'function') {
        Player.recalculateStats();
      }
    }, cfg.duration);
    return true;
  },

  addProgress(key, amount) {
    if (key in this.state.progress) this.state.progress[key] += amount;
    TIEM_KIEM_PHO_CONFIG.pages.forEach(p => this.tryUnlockPage(p.page));
  },

  save() {
    localStorage.setItem('tuxien_tiem_kiem_pho', JSON.stringify({
      unlockedPages: this.state.unlockedPages,
      progress: this.state.progress,
      kiemThanLastUsed: this.state.kiemThanLastUsed
    }));
  },

  load() {
    try {
      const raw = localStorage.getItem('tuxien_tiem_kiem_pho');
      if (!raw) return;
      const data = JSON.parse(raw);
      this.state.unlockedPages     = data.unlockedPages || [];
      this.state.progress          = Object.assign(this.state.progress, data.progress || {});
      this.state.kiemThanLastUsed  = data.kiemThanLastUsed || 0;
    } catch (e) {
      console.warn('[TiemKiemPho] load error', e);
    }
  }
};

// ===========================================================================
// SECTION 4 — HUD & UI
// ===========================================================================

(function injectDaoStyles() {
  if (document.getElementById('dao-heart-style')) return;
  const style = document.createElement('style');
  style.id = 'dao-heart-style';
  style.textContent = `
    #dao-root {
      position: fixed; bottom: 8px; left: 8px; z-index: 1500;
      display: flex; flex-direction: column; gap: 4px;
      pointer-events: none; font-family: 'Segoe UI', sans-serif; font-size: 12px;
    }
    #dao-hud {
      pointer-events: auto; background: rgba(10,10,20,0.88);
      border: 1px solid #555; border-radius: 8px; padding: 5px 8px;
      display: flex; flex-direction: column; gap: 3px;
      min-width: 180px; max-width: 210px; box-shadow: 0 2px 8px rgba(0,0,0,0.6);
      cursor: pointer; user-select: none;
    }
    #dao-hud-header { display: flex; align-items: center; justify-content: space-between; gap: 4px; }
    #dao-hud-title { font-size: 11px; font-weight: 700; color: #ccc; letter-spacing: 0.5px; }
    #dao-hud-score { font-size: 11px; font-weight: 700; min-width: 38px; text-align: right; }
    #dao-hud-toggle { font-size: 10px; color: #888; flex-shrink: 0; }
    #dao-hud-bar-wrap { height: 7px; border-radius: 4px; background: #333; overflow: hidden; position: relative; }
    #dao-hud-bar { height: 100%; border-radius: 4px; transition: width 0.4s, background 0.4s; }
    #dao-hud-branch { font-size: 10px; color: #aaa; text-align: center; }
    #dao-skill-panel {
      pointer-events: auto; background: rgba(10,10,20,0.88);
      border: 1px solid #555; border-radius: 8px; padding: 5px 6px;
      min-width: 180px; max-width: 210px; box-shadow: 0 2px 8px rgba(0,0,0,0.6);
      display: flex; flex-direction: column; gap: 3px;
      transition: max-height 0.25s ease, opacity 0.25s ease; overflow: hidden;
    }
    #dao-skill-panel.dao-collapsed { max-height: 0; opacity: 0; padding: 0 6px; pointer-events: none; }
    .dao-skill-btn {
      display: flex; align-items: center; gap: 5px;
      background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15);
      border-radius: 6px; padding: 4px 6px; cursor: pointer;
      color: #e0e0e0; font-size: 11px; text-align: left;
      transition: background 0.15s, border-color 0.15s; width: 100%;
    }
    .dao-skill-btn:hover:not(:disabled) { background: rgba(255,255,255,0.14); }
    .dao-skill-btn:disabled { opacity: 0.45; cursor: not-allowed; }
    .dao-skill-btn .dao-sk-icon { font-size: 14px; flex-shrink: 0; }
    .dao-skill-btn .dao-sk-info { display: flex; flex-direction: column; flex: 1; min-width: 0; }
    .dao-skill-btn .dao-sk-name { font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 11px; }
    .dao-skill-btn .dao-sk-cd { font-size: 9px; color: #f90; margin-top: 1px; }
    .dao-skill-btn .dao-sk-mp { font-size: 9px; color: #7cf; flex-shrink: 0; }
    #dao-skill-none { font-size: 10px; color: #666; text-align: center; padding: 4px 0; }
    #tkp-open-btn {
      pointer-events: auto; background: rgba(10,10,20,0.88);
      border: 1px solid #6d4c41; border-radius: 8px; padding: 5px 8px;
      cursor: pointer; color: #f0c040; font-size: 11px; font-weight: 700;
      text-align: center; min-width: 180px; max-width: 210px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.6); transition: background 0.15s;
    }
    #tkp-open-btn:hover { background: rgba(80,50,20,0.92); }
    #tkp-modal-overlay {
      position: fixed; inset: 0; z-index: 3000; background: rgba(0,0,0,0.7);
      display: flex; align-items: center; justify-content: center;
    }
    #tkp-modal {
      background: #1a1a2e; border: 1px solid #6d4c41; border-radius: 12px;
      width: min(480px, 95vw); max-height: 80vh; display: flex; flex-direction: column;
      overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.8); color: #e0d7c8;
      font-family: 'Segoe UI', sans-serif;
    }
    #tkp-modal-head {
      padding: 12px 16px; background: #16213e; border-bottom: 1px solid #333;
      display: flex; align-items: center; justify-content: space-between;
    }
    #tkp-modal-head h2 { font-size: 15px; font-weight: 700; color: #f0c040; margin: 0; }
    #tkp-modal-close { background: none; border: none; color: #aaa; font-size: 18px; cursor: pointer; line-height: 1; padding: 0 4px; }
    #tkp-modal-close:hover { color: #fff; }
    #tkp-modal-body { overflow-y: auto; padding: 10px 12px; display: flex; flex-direction: column; gap: 8px; }
    .tkp-page-card { background: rgba(255,255,255,0.04); border: 1px solid #333; border-radius: 8px; padding: 8px 10px; }
    .tkp-page-card.unlocked { border-color: #f0c040; background: rgba(240,192,64,0.08); }
    .tkp-page-head { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
    .tkp-page-num { font-size: 18px; line-height: 1; }
    .tkp-page-name { font-size: 12px; font-weight: 700; color: #e0d7c8; }
    .tkp-page-status { margin-left: auto; font-size: 14px; }
    .tkp-page-lore { font-size: 10px; color: #888; font-style: italic; margin-bottom: 4px; }
    .tkp-page-challenge { font-size: 10px; color: #aaa; display: flex; align-items: center; gap: 4px; }
    .tkp-progress-bar { height: 4px; background: #333; border-radius: 2px; overflow: hidden; margin-top: 4px; }
    .tkp-progress-fill { height: 100%; background: #f0c040; border-radius: 2px; transition: width 0.4s; }
    #tkp-kiem-than-wrap { padding: 10px 12px; border-top: 1px solid #333; display: flex; flex-direction: column; gap: 6px; }
    #tkp-kiem-than-btn {
      padding: 8px; background: linear-gradient(135deg, #b8860b, #f0c040);
      border: none; border-radius: 8px; color: #1a1a2e; font-weight: 700;
      font-size: 13px; cursor: pointer; transition: opacity 0.2s;
    }
    #tkp-kiem-than-btn:disabled { opacity: 0.45; cursor: not-allowed; }
    #tkp-kiem-than-status { font-size: 10px; color: #888; text-align: center; }
  `;
  document.head.appendChild(style);
})();

// ---------------------------------------------------------------------------
// DaoHeartHUD
// ---------------------------------------------------------------------------
const DaoHeartHUD = {
  _collapsed: false,

  init() {
    if (document.getElementById('dao-hud')) return;
    const root = this._getRoot();
    const hud  = document.createElement('div');
    hud.id = 'dao-hud';
    hud.title = 'Click để ẩn/hiện skill panel';
    hud.innerHTML = `
      <div id="dao-hud-header">
        <span id="dao-hud-title">❤️ Đạo Tâm</span>
        <span id="dao-hud-score">0</span>
        <span id="dao-hud-toggle">▲</span>
      </div>
      <div id="dao-hud-bar-wrap"><div id="dao-hud-bar"></div></div>
      <div id="dao-hud-branch">—</div>
    `;
    hud.addEventListener('click', () => this.toggleSkillPanel());
    root.insertBefore(hud, root.firstChild);
    this.update();
  },

  _getRoot() {
    let root = document.getElementById('dao-root');
    if (!root) {
      root = document.createElement('div');
      root.id = 'dao-root';
      document.body.appendChild(root);
    }
    return root;
  },

  toggleSkillPanel() {
    this._collapsed = !this._collapsed;
    const panel  = document.getElementById('dao-skill-panel');
    const toggle = document.getElementById('dao-hud-toggle');
    if (panel)  panel.classList.toggle('dao-collapsed', this._collapsed);
    if (toggle) toggle.textContent = this._collapsed ? '▼' : '▲';
  },

  update() {
    const score  = DaoHeartSystem.state.score;
    const branch = DaoHeartSystem.state.activeBranch;
    const cfg    = DAO_HEART_CONFIG.branches;

    const scoreEl  = document.getElementById('dao-hud-score');
    const barEl    = document.getElementById('dao-hud-bar');
    const branchEl = document.getElementById('dao-hud-branch');
    if (!scoreEl) return;

    scoreEl.textContent = (score > 0 ? '+' : '') + score.toFixed(1);

    const pct = Math.abs(score) / 100 * 50;
    if (score >= 0) {
      barEl.style.marginLeft = '50%';
      barEl.style.width      = pct + '%';
      barEl.style.background = branch === 'dao' ? '#42a5f5' : (branch === 'honNguyen' ? '#e040fb' : '#aaa');
    } else {
      barEl.style.marginLeft = (50 - pct) + '%';
      barEl.style.width      = pct + '%';
      barEl.style.background = branch === 'ma' ? '#f44336' : (branch === 'honNguyen' ? '#e040fb' : '#aaa');
    }

    if      (score >= 40)          scoreEl.style.color = '#42a5f5';
    else if (score <= -40)         scoreEl.style.color = '#f44336';
    else if (Math.abs(score) <= 20) scoreEl.style.color = '#e040fb';
    else                           scoreEl.style.color = '#aaa';

    if (branch) {
      const b = cfg[branch];
      branchEl.textContent = b.icon + ' ' + b.name;
      branchEl.style.color = b.color;
    } else {
      branchEl.textContent = '— Trung Lập —';
      branchEl.style.color = '#666';
    }
  }
};

// ---------------------------------------------------------------------------
// DaoSkillPanel
// ---------------------------------------------------------------------------
const DaoSkillPanel = {
  init() {
    if (document.getElementById('dao-skill-panel')) return;
    const root  = document.getElementById('dao-root') || document.body;
    const panel = document.createElement('div');
    panel.id = 'dao-skill-panel';
    root.appendChild(panel);
    this.refresh();
  },

  refresh() {
    const panel     = document.getElementById('dao-skill-panel');
    if (!panel) return;
    const skills    = DaoHeartSystem.getAvailableSkills();
    const branch    = DaoHeartSystem.state.activeBranch;
    const branchCfg = branch ? DAO_HEART_CONFIG.branches[branch] : null;

    panel.innerHTML = '';

    if (!branch || skills.length === 0) {
      const empty = document.createElement('div');
      empty.id = 'dao-skill-none';
      empty.textContent = 'Chưa đủ điều kiện kích hoạt nhánh';
      panel.appendChild(empty);
      return;
    }

    const label = document.createElement('div');
    label.style.cssText = `font-size:9px;color:${branchCfg.color};font-weight:700;text-align:center;margin-bottom:1px;`;
    label.textContent = branchCfg.icon + ' ' + branchCfg.name + ' Skills';
    panel.appendChild(label);

    const now = typeof GameState !== 'undefined' ? GameState.time : Date.now();
    const icons = { dao: ['🛡️','💚','⚡'], ma: ['💥','🩸','🌑'], honNguyen: ['☯️','🎲','🌌'] };

    skills.forEach((skill, idx) => {
      const lastUsed = DaoHeartSystem.state._skillCooldowns[skill.id] || 0;
      const elapsed  = now - lastUsed;
      const onCD     = elapsed < skill.cd;
      const cdRemain = onCD ? Math.ceil((skill.cd - elapsed) / 1000) : 0;
      const noMp     = typeof Player !== 'undefined' && Player.mp < skill.mp;
      const icon     = (icons[branch] || ['✨','✨','✨'])[idx] || '✨';

      const btn = document.createElement('button');
      btn.className = 'dao-skill-btn';
      btn.disabled  = onCD || noMp;
      btn.title     = skill.desc;
      btn.innerHTML = `
        <span class="dao-sk-icon">${icon}</span>
        <span class="dao-sk-info">
          <span class="dao-sk-name">${skill.name}</span>
          ${onCD ? `<span class="dao-sk-cd">⏳ ${cdRemain}s</span>` : ''}
        </span>
        ${skill.mp > 0 ? `<span class="dao-sk-mp">${skill.mp}MP</span>` : ''}
      `;
      btn.addEventListener('click', () => {
        DaoHeartSystem.useSpecialSkill(idx);
        DaoSkillPanel.refresh();
      });
      panel.appendChild(btn);
    });
  },

  startCDTimer() {
    setInterval(() => {
      if (DaoHeartSystem.state.activeBranch) DaoSkillPanel.refresh();
    }, 1000);
  }
};

// ---------------------------------------------------------------------------
// TiemKiemPhoUI
// ---------------------------------------------------------------------------
const TiemKiemPhoUI = {
  init() {
    this._createOpenBtn();
    this._createModal();
  },

  _createOpenBtn() {
    if (document.getElementById('tkp-open-btn')) return;
    const root = document.getElementById('dao-root') || document.body;
    const btn  = document.createElement('button');
    btn.id = 'tkp-open-btn';
    btn.textContent = '📜 Tiệm Kiếm Phổ';
    btn.addEventListener('click', () => this.openModal());
    root.appendChild(btn);
  },

  _createModal() {
    if (document.getElementById('tkp-modal-overlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'tkp-modal-overlay';
    overlay.style.display = 'none';
    overlay.addEventListener('click', (e) => { if (e.target === overlay) this.closeModal(); });

    overlay.innerHTML = `
      <div id="tkp-modal">
        <div id="tkp-modal-head">
          <h2>📜 Tiệm Kiếm Phổ — Cổ Thư Các</h2>
          <button id="tkp-modal-close" title="Đóng">✕</button>
        </div>
        <div id="tkp-modal-body"></div>
        <div id="tkp-kiem-than-wrap">
          <button id="tkp-kiem-than-btn" disabled>⚔️ Kiếm Thần Hóa</button>
          <div id="tkp-kiem-than-status">Cần mở đủ 9 trang để kích hoạt</div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('#tkp-modal-close').addEventListener('click', () => this.closeModal());
    overlay.querySelector('#tkp-kiem-than-btn').addEventListener('click', () => {
      TiemKiemPhoSystem.activateKiemThan();
      this.refreshModal();
    });
  },

  openModal() {
    this.refreshModal();
    const overlay = document.getElementById('tkp-modal-overlay');
    if (overlay) overlay.style.display = 'flex';
  },

  closeModal() {
    const overlay = document.getElementById('tkp-modal-overlay');
    if (overlay) overlay.style.display = 'none';
  },

  refreshModal() {
    const body = document.getElementById('tkp-modal-body');
    if (!body) return;
    body.innerHTML = '';

    const pageEmojis = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣'];

    TIEM_KIEM_PHO_CONFIG.pages.forEach((page, i) => {
      const unlocked = TiemKiemPhoSystem.state.unlockedPages.includes(page.page);
      const ch       = page.challenge;
      const current  = TiemKiemPhoSystem.state.progress[ch.current] || 0;
      const pct      = Math.min(100, (current / (ch.target || 1)) * 100);

      const card = document.createElement('div');
      card.className = 'tkp-page-card' + (unlocked ? ' unlocked' : '');
      card.innerHTML = `
        <div class="tkp-page-head">
          <span class="tkp-page-num">${pageEmojis[i] || (i+1)}</span>
          <span class="tkp-page-name">${page.name}</span>
          <span class="tkp-page-status">${unlocked ? '✅' : '🔒'}</span>
        </div>
        <div class="tkp-page-lore">${page.lore}</div>
        <div class="tkp-page-challenge">
          📋 ${ch.desc}${!unlocked ? ` (${current}/${ch.target})` : ''}
        </div>
        ${!unlocked ? `<div class="tkp-progress-bar"><div class="tkp-progress-fill" style="width:${pct}%"></div></div>` : ''}
      `;
      body.appendChild(card);
    });

    // Kiếm Thần Hóa button state
    const btn      = document.getElementById('tkp-kiem-than-btn');
    const statusEl = document.getElementById('tkp-kiem-than-status');
    const allUnlocked = TiemKiemPhoSystem.state.unlockedPages.length >= TIEM_KIEM_PHO_CONFIG.pages.length;
    const now      = typeof GameState !== 'undefined' ? GameState.time : Date.now();
    const cdLeft   = TIEM_KIEM_PHO_CONFIG.kiemThanHoa.cooldown - (now - TiemKiemPhoSystem.state.kiemThanLastUsed);
    const onCD     = cdLeft > 0 && TiemKiemPhoSystem.state.kiemThanLastUsed > 0;

    if (btn)      btn.disabled = !allUnlocked || onCD || TiemKiemPhoSystem.state.kiemThanActive;
    if (statusEl) {
      if (!allUnlocked) {
        statusEl.textContent = `Cần mở thêm ${TIEM_KIEM_PHO_CONFIG.pages.length - TiemKiemPhoSystem.state.unlockedPages.length} trang nữa`;
      } else if (TiemKiemPhoSystem.state.kiemThanActive) {
        statusEl.textContent = '⚔️ Đang kích hoạt...';
      } else if (onCD) {
        statusEl.textContent = `⏳ Hồi chiêu: ${Math.ceil(cdLeft / 3600000)}h`;
      } else {
        statusEl.textContent = TIEM_KIEM_PHO_CONFIG.kiemThanHoa.desc;
      }
    }
  }
};

// ===========================================================================
// SECTION 5 — MONKEY PATCH
// ===========================================================================

(function patchGame() {
  if (typeof Game === 'undefined') return;

  const _origInit   = Game.init?.bind(Game);
  const _origUpdate = Game.update?.bind(Game);
  const _origSave   = Game.save?.bind(Game);
  const _origLoad   = Game.load?.bind(Game);

  Game.init = function(...args) {
    if (_origInit) _origInit(...args);
    DaoHeartSystem.load();
    TiemKiemPhoSystem.load();
    DaoHeartHUD.init();
    DaoSkillPanel.init();
    DaoSkillPanel.startCDTimer();
    TiemKiemPhoUI.init();
  };

  Game.update = function(dt, ...args) {
    if (_origUpdate) _origUpdate(dt, ...args);
    DaoHeartSystem.tickDecay(dt);
    DaoHeartSystem.state._autoFarmTimer += dt;
    if (DaoHeartSystem.state._autoFarmTimer >= 600000) {
      DaoHeartSystem.state._autoFarmTimer = 0;
      DaoHeartSystem.addScore(DAO_HEART_CONFIG.events.farmContinuous10m);
    }
  };

  Game.save = function(...args) {
    if (_origSave) _origSave(...args);
    DaoHeartSystem.save();
    TiemKiemPhoSystem.save();
  };

  Game.load = function(...args) {
    if (_origLoad) _origLoad(...args);
    DaoHeartSystem.load();
    TiemKiemPhoSystem.load();
    DaoHeartHUD.update();
  };

  if (typeof Player !== 'undefined') {
    const _origRecalc = Player.recalculateStats?.bind(Player);
    Player.recalculateStats = function(...args) {
      if (_origRecalc) _origRecalc(...args);
      if (TiemKiemPhoSystem.state.kiemThanActive && Player.stats) {
        const cfg = TIEM_KIEM_PHO_CONFIG.kiemThanHoa.stats;
        Player.stats.atk      = (Player.stats.atk      || 0) * cfg.atkMul;
        Player.stats.def      = (Player.stats.def      || 0) * cfg.defMul;
        Player.stats.speed    = (Player.stats.speed    || 0) * cfg.speedMul;
        Player.stats.critRate = Math.min(1, (Player.stats.critRate || 0) + cfg.critRate);
        Player.stats.critDmg  = (Player.stats.critDmg  || 1) * cfg.critDmg;
      }
    };

    const _origTakeDamage = Player.takeDamage?.bind(Player);
    Player.takeDamage = function(amount, ...args) {
      let dmg = amount;
      if (DaoHeartSystem.state._honBalanceActive) {
        Player.hp = Math.min(Player.stats?.maxHp || Player.hp, Player.hp + dmg * 0.5);
      }
      if (DaoHeartSystem.state._daoShieldActive) {
        dmg *= (1 - (DaoHeartSystem.state._daoShieldAbsorb || 0));
      }
      if (TiemKiemPhoSystem.state.kiemThanActive && TIEM_KIEM_PHO_CONFIG.kiemThanHoa.stats.immuneDamage) {
        return;
      }
      if (_origTakeDamage) _origTakeDamage(dmg, ...args);

      DaoHeartSystem.state._lastHitTime     = typeof GameState !== 'undefined' ? GameState.time : Date.now();
      DaoHeartSystem.state._noRetaliateTimer = 0;
      DaoHeartSystem.state._retaliateGiven   = false;
      DaoHeartSystem.state._killStreakCount  = 0;
      TiemKiemPhoSystem.state.progress.killNoHitStreak = 0;
    };

    const _origUseSkill = Player.useSkill?.bind(Player);
    Player.useSkill = function(skillId, ...args) {
      if (DaoHeartSystem.state._daoAuraActive) {
        const tmpMp = Player.mp;
        const result = _origUseSkill ? _origUseSkill(skillId, ...args) : undefined;
        Player.mp = tmpMp;
        return result;
      }
      return _origUseSkill ? _origUseSkill(skillId, ...args) : undefined;
    };
  }

  if (typeof Enemies !== 'undefined') {
    const _origEnemyDmg = Enemies.damage?.bind(Enemies);
    Enemies.damage = function(enemy, amount, ...args) {
      let dmg = amount;
      if (DaoHeartSystem.state._maDomainActive)    dmg *= 1.30;
      if (DaoHeartSystem.state._honTransformActive) dmg *= 2.0;
      if (DaoHeartSystem.state._maLifestealActive && typeof Player !== 'undefined') {
        Player.hp = Math.min(Player.stats?.maxHp || Player.hp, Player.hp + dmg * 0.15);
      }
      return _origEnemyDmg ? _origEnemyDmg(enemy, dmg, ...args) : undefined;
    };

    const _origEnemyKill = Enemies.kill?.bind(Enemies);
    Enemies.kill = function(enemy, ...args) {
      const result = _origEnemyKill ? _origEnemyKill(enemy, ...args) : undefined;

      DaoHeartSystem.state._killStreakCount = (DaoHeartSystem.state._killStreakCount || 0) + 1;
      if (DaoHeartSystem.state._killStreakCount >= 20) {
        DaoHeartSystem.state._killStreakCount = 0;
        DaoHeartSystem.addScore(DAO_HEART_CONFIG.events.killStreak20);
      }

      TiemKiemPhoSystem.addProgress('totalKills', 1);
      TiemKiemPhoSystem.addProgress('killNoHitStreak', 1);

      if (enemy?.rank === 'elite' || enemy?.rank === 'champion') {
        DaoHeartSystem.addScore(DAO_HEART_CONFIG.events.killEliteOrChampion);
      }

      return result;
    };
  }

  if (typeof NPC !== 'undefined') {
    const _origNPCInteract = NPC.interact?.bind(NPC);
    NPC.interact = function(npc, ...args) {
      const result = _origNPCInteract ? _origNPCInteract(npc, ...args) : undefined;
      if (npc?.type === 'event_help') {
        DaoHeartSystem.addScore(DAO_HEART_CONFIG.events.helpNpcEvent);
      }
      if (npc?.name?.includes('Cổ Thư Các') || npc?.id === 'co_thu_cac') {
        TiemKiemPhoUI.openModal();
      }
      return result;
    };
  }
})();

// ===========================================================================
// SECTION 6 — AUTO INIT
// ===========================================================================

(function autoInit() {
  function tryInit() {
    DaoHeartSystem.load();
    TiemKiemPhoSystem.load();
    DaoHeartHUD.init();
    DaoSkillPanel.init();
    DaoSkillPanel.startCDTimer();
    TiemKiemPhoUI.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryInit);
  } else {
    setTimeout(tryInit, 50);
  }
})();

// ===========================================================================
// SECTION 7 — PUBLIC API
// ===========================================================================

window.DaoHeartAPI = {
  addScore:       (n) => DaoHeartSystem.addScore(n),
  triggerEvent:   (eventName) => {
    const val = DAO_HEART_CONFIG.events[eventName];
    if (val !== undefined) DaoHeartSystem.addScore(val);
    else console.warn('[DaoHeart] unknown event:', eventName);
  },
  getState: () => ({
    score: DaoHeartSystem.state.score,
    branch: DaoHeartSystem.state.activeBranch,
    unlockedPages: TiemKiemPhoSystem.state.unlockedPages,
    progress: TiemKiemPhoSystem.state.progress
  }),
  useSkill:        (idx) => DaoHeartSystem.useSpecialSkill(idx),
  addProgress:     (key, amount) => TiemKiemPhoSystem.addProgress(key, amount),
  openTKP:         () => TiemKiemPhoUI.openModal(),
  bossEventClear:  () => {
    DaoHeartSystem.addScore(DAO_HEART_CONFIG.events.bossEventClear);
    TiemKiemPhoSystem.addProgress('bossEventClears', 1);
  },
  buyBlackMarket:  () => DaoHeartSystem.addScore(DAO_HEART_CONFIG.events.buyBlackMarket),
  useHealItem:     () => DaoHeartSystem.addScore(DAO_HEART_CONFIG.events.useHealItem),
  activateKiemThan:() => TiemKiemPhoSystem.activateKiemThan()
};

console.log('[feature_dao_heart.js] Loaded ✓ — DaoHeartAPI available on window.DaoHeartAPI');

// ===== CHANGES: =====
// 1. Hợp nhất 4 wrap riêng lẻ (Game.init/update/save/load) thành 1 IIFE duy nhất —
//    bắt lấy tất cả _orig cùng lúc, guard typeof Game === 'undefined' một lần
// 2. Tương tự gộp Player wraps và Enemies wraps vào cùng IIFE patchGame()
// 3. Xóa biến dist thừa trong maBurst — inline Math.sqrt trực tiếp vào if
// 4. DaoHeartHUD.init(): xóa biến el không được dùng sau khi gán
// 5. _createModal(): chuyển nội dung modal từ innerHTML trên div overlay sang
//    innerHTML đúng chỗ — xóa querySelector thừa cho tkp-modal-close và btn
// 6. NPC.interact: xóa dòng addProgress('bossEventClears', 0) dead (amount=0, vô nghĩa)
// 7. DaoHeartSystem.save(): inline JSON trực tiếp, bỏ biến data trung gian thừa
