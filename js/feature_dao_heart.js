// ==================== DAO HEART + TIEM KIEM PHO SYSTEM ====================
// File: js/feature_dao_heart.js
// Thêm vào index.html sau <script src="js/ui.js"></script>:
// <script src="js/feature_dao_heart.js"></script>
//
// NGUYÊN TẮC: Monkey-patch module — KHÔNG sửa bất kỳ file gốc nào.
// Wrap: Game.init, Game.update, Game.save, Game.load
//        Player.recalculateStats, Player.takeDamage, Player.useSkill
//        Enemies.damage, Enemies.kill
//        NPC.spawnForMap, NPC.interact
// ===========================================================================

// ===========================================================================
// SECTION 1 — DATA & CONFIG
// ===========================================================================

const DAO_HEART_CONFIG = {
  min: -100,
  max: 100,
  decayRate: 0.5,       // điểm về 0 mỗi decayInterval
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
        {
          id: 'daoShield',
          name: 'Đạo Tâm Hộ Thể',
          desc: 'Hấp thụ 30% damage nhận trong 5s. CD:20s.',
          cd: 20000, mp: 25
        },
        {
          id: 'daoHeal',
          name: 'Thiên Địa Hồi Linh',
          desc: 'Hồi 25% HP + 50% MP ngay lập tức. CD:30s.',
          cd: 30000, mp: 0
        },
        {
          id: 'daoAura',
          name: 'Linh Quang Hào Khí',
          desc: '5s: tất cả skill không tốn MP + CD giảm 50%. CD:45s.',
          cd: 45000, mp: 0
        }
      ]
    },
    ma: {
      name: 'Ma Tâm', icon: '🔥', color: '#f44336',
      threshold: -40,
      skills: [
        {
          id: 'maBurst',
          name: 'Ma Khí Bùng Phát',
          desc: 'Tức thì: dmg tất cả enemy trong 200px bằng 300% ATK. CD:15s.',
          cd: 15000, mp: 30
        },
        {
          id: 'maLifesteal',
          name: 'Huyết Hút Ma Công',
          desc: '10s: mỗi đòn đánh hút 15% damage thành HP. CD:25s.',
          cd: 25000, mp: 20
        },
        {
          id: 'maDomain',
          name: 'Ma Vực Lĩnh Thổ',
          desc: 'Triệu hồi "Ma Vực" 6s: quái trong 150px chậm lại 50%, player +30% dmg. CD:40s.',
          cd: 40000, mp: 40
        }
      ]
    },
    honNguyen: {
      name: 'Hỗn Nguyên', icon: '💫', color: '#e040fb',
      threshold_dao: +20,
      threshold_ma: -20,
      skills: [
        {
          id: 'honBalance',
          name: 'Âm Dương Cân Bằng',
          desc: '10s: nhận damage → hồi 50% amount đó dưới dạng HP. CD:20s.',
          cd: 20000, mp: 20
        },
        {
          id: 'honChaos',
          name: 'Hỗn Nguyên Thiên Địa',
          desc: 'Random 1 trong 6 skill (Đạo + Ma) và cast ngay. CD:12s.',
          cd: 12000, mp: 15
        },
        {
          id: 'honTransform',
          name: 'Hỗn Nguyên Biến',
          desc: '5s: tất cả dmg +100%, speed +50%, không thể die. CD:60s.',
          cd: 60000, mp: 50
        }
      ]
    }
  },

  storageKey: 'tuxien_dao_heart'
};

// ---------------------------------------------------------------------------

const TIEM_KIEM_PHO_CONFIG = {
  npcName: '📜 Cổ Thư Các',
  pages: [
    {
      page: 1, name: 'Trang Nhất — Vô Địch',
      lore: 'Tiền nhân viết: "Kẻ đứng giữa bão không bị vết thương..."',
      challenge: { type: 'killNoHit', target: 50, desc: 'Giết 50 quái liên tiếp không bị damage', current: 'killNoHitStreak' }
    },
    {
      page: 2, name: 'Trang Nhì — Kiên Nhẫn',
      lore: 'Kiếm Thánh xưa thiền định 9 năm không rời đỉnh núi...',
      challenge: { type: 'offlineTime', target: 8 * 60 * 60 * 1000, desc: 'Tu luyện offline 8 tiếng thực', current: 'totalOfflineMs' }
    },
    {
      page: 3, name: 'Trang Ba — Cơ Nền',
      lore: 'Cơ nền vững chắc — vạn kiếm mới thành...',
      challenge: { type: 'realm', target: 1, targetStage: 5, desc: 'Đạt Trúc Cơ Kỳ tầng 5 trở lên', current: 'realm_check' }
    },
    {
      page: 4, name: 'Trang Tư — Đồng Bạn',
      lore: 'Một mình kiếm sắc, đồng hành kiếm linh...',
      challenge: { type: 'petsOwned', target: 3, desc: 'Sở hữu đủ 3 loại linh thú', current: 'petsOwned_count' }
    },
    {
      page: 5, name: 'Trang Năm — Thử Lửa',
      lore: 'Qua lửa mới biết kiếm thật...',
      challenge: { type: 'bossEventClear', target: 3, desc: 'Hoàn thành Boss Event 3 lần', current: 'bossEventClears' }
    },
    {
      page: 6, name: 'Trang Sáu — Vạn Vật',
      lore: 'Vàng, bạc, đồng — vật phàm. Vạn lượng mới đắc đạo...',
      challenge: { type: 'goldAccumulate', target: 50000, desc: 'Tích lũy 50,000 vàng (tổng đã nhận, không cần giữ)', current: 'totalGoldEarned' }
    },
    {
      page: 7, name: 'Trang Bảy — Linh Địa',
      lore: 'Linh mạch nuôi dưỡng thân — đứng trên địa linh mới giác ngộ...',
      challenge: { type: 'lingMachStand', target: 3, desc: 'Đứng trên 3 Linh Mạch khác nhau (cần feature_dao_heart)', current: 'lingMachStood' }
    },
    {
      page: 8, name: 'Trang Tám — Vô Cực',
      lore: 'Không Đạo không Ma — chỉ có Vũ Trụ...',
      challenge: { type: 'killTotal', target: 2000, desc: 'Tổng cộng 2000 lần kill', current: 'totalKills' }
    },
    {
      page: 9, name: 'Trang Chín — Thiên Ý',
      lore: 'Thuận thiên ý hay nghịch đều dẫn đến đỉnh cao — chỉ cần đủ quyết tâm...',
      challenge: { type: 'daoHeartExtreme', target: 80, desc: 'Đạt Đạo Tâm ≥+80 hoặc Ma Tâm ≤-80', current: 'dao_extreme_check' }
    }
  ],

  kiemThanHoa: {
    duration: 5 * 60 * 1000,       // 5 phút
    cooldown: 24 * 60 * 60 * 1000, // 24h
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

  // ── Add score (clamped) ────────────────────────────────────────────────
  addScore(amount) {
    this.state.score = Math.max(
      DAO_HEART_CONFIG.min,
      Math.min(DAO_HEART_CONFIG.max, this.state.score + amount)
    );
    this.updateBranch();
    DaoHeartHUD.update();
  },

  // ── Determine active branch ────────────────────────────────────────────
  updateBranch() {
    const s = this.state.score;
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

  // ── Available skills from current branch ──────────────────────────────
  getAvailableSkills() {
    if (!this.state.activeBranch) return [];
    return DAO_HEART_CONFIG.branches[this.state.activeBranch]?.skills || [];
  },

  // ── Use a special skill by index ──────────────────────────────────────
  useSpecialSkill(skillIdx) {
    const skills = this.getAvailableSkills();
    const skill = skills[skillIdx];
    if (!skill) return false;

    const lastUsed = this.state._skillCooldowns[skill.id] || 0;
    if (GameState.time - lastUsed < skill.cd) {
      UI.addLog('⏳ ' + skill.name + ' đang hồi chiêu!', 'system');
      return false;
    }

    if (Player.mp < skill.mp) {
      UI.addLog('❌ Không đủ linh lực!', 'system');
      return false;
    }

    Player.mp -= skill.mp;
    this.state._skillCooldowns[skill.id] = GameState.time;

    this.executeSkill(skill);
    DaoSkillPanel.refresh();
    return true;
  },

  // ── Execute individual skill ───────────────────────────────────────────
  executeSkill(skill) {
    switch (skill.id) {
      case 'daoShield':
        Player._daoShieldActive = true;
        Player._daoShieldEndTime = GameState.time + 5000;
        Player._daoShieldAbsorb = 0.30;
        UI.addLog('☯️ Đạo Tâm Hộ Thể: Giảm 30% damage 5s!', 'realm');
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * Math.PI * 2;
          GameState.particles.push({
            x: Player.x + Math.cos(a) * 25,
            y: Player.y + Math.sin(a) * 25,
            vx: Math.cos(a) * 2,
            vy: Math.sin(a) * 2 - 1,
            life: 800,
            color: '#42a5f5',
            size: 3 + Math.random() * 2
          });
        }
        break;

      case 'daoHeal': {
        const healHp = Math.floor(Player.maxHp * 0.25);
        const healMp = Math.floor(Player.maxMp * 0.50);
        Player.hp = Math.min(Player.maxHp, Player.hp + healHp);
        Player.mp = Math.min(Player.maxMp, Player.mp + healMp);
        UI.addLog('☯️ Thiên Địa Hồi Linh: +' + healHp + ' HP +' + healMp + ' MP!', 'realm');
        // Spawn damage numbers if function available
        if (typeof Game.spawnDamageNumber === 'function') {
          Game.spawnDamageNumber(Player.x, Player.y - 40, '+' + healHp + ' HP', '#4caf50');
          Game.spawnDamageNumber(Player.x, Player.y - 55, '+' + healMp + ' MP', '#42a5f5');
        }
        // Green heal particles
        for (let i = 0; i < 10; i++) {
          const a = Math.random() * Math.PI * 2;
          GameState.particles.push({
            x: Player.x + Math.cos(a) * 15,
            y: Player.y + Math.sin(a) * 15,
            vx: Math.cos(a) * 1.5,
            vy: -1.5 - Math.random(),
            life: 700,
            color: '#4caf50',
            size: 3 + Math.random() * 2
          });
        }
        break;
      }

      case 'daoAura':
        Player._daoAuraActive = true;
        Player._daoAuraEndTime = GameState.time + 5000;
        UI.addLog('☯️ Linh Quang: 5s không tốn MP + CD /2!', 'realm');
        for (let i = 0; i < 16; i++) {
          const a = (i / 16) * Math.PI * 2;
          GameState.particles.push({
            x: Player.x + Math.cos(a) * 30,
            y: Player.y + Math.sin(a) * 30,
            vx: Math.cos(a) * 1,
            vy: Math.sin(a) * 1 - 0.5,
            life: 1000,
            color: '#42a5f5',
            size: 2 + Math.random() * 2
          });
        }
        break;

      case 'maBurst': {
        const targets = Enemies.list.filter(e => {
          if (!e.alive) return false;
          const d = Math.sqrt((e.x - Player.x) ** 2 + (e.y - Player.y) ** 2);
          return d <= 200;
        });
        targets.forEach(enemy => {
          const dmg = Math.floor(Player.atk * 3.0);
          const isCrit = Math.random() < Player.critRate;
          const finalDmg = isCrit ? Math.floor(dmg * Player.critDmg) : dmg;
          enemy.hp -= finalDmg;
          enemy.hitFlash = 200;
          if (enemy.hp <= 0 && enemy.alive) {
            enemy.alive = false;
            Enemies.kill && Enemies.kill(enemy);
          }
        });
        // Red AOE visual
        for (let i = 0; i < 20; i++) {
          const a = Math.random() * Math.PI * 2;
          const r = Math.random() * 200;
          GameState.particles.push({
            x: Player.x + Math.cos(a) * r,
            y: Player.y + Math.sin(a) * r,
            vx: Math.cos(a) * 3,
            vy: Math.sin(a) * 3 - 2,
            life: 500,
            color: '#f44336',
            size: 4 + Math.random() * 4
          });
        }
        UI.addLog('🔥 Ma Khí Bùng Phát! ' + targets.length + ' kẻ địch!', 'realm');
        break;
      }

      case 'maLifesteal':
        Player._maLifestealActive = true;
        Player._maLifestealEndTime = GameState.time + 10000;
        Player._maLifestealPct = 0.15;
        UI.addLog('🔥 Huyết Hút: 10s lifesteal 15%!', 'realm');
        break;

      case 'maDomain':
        Player._maDomainActive = true;
        Player._maDomainEndTime = GameState.time + 6000;
        Player._maDomainX = Player.x;
        Player._maDomainY = Player.y;
        UI.addLog('🔥 Ma Vực: 6s quái chậm, +30% dmg!', 'realm');
        break;

      case 'honBalance':
        Player._honBalanceActive = true;
        Player._honBalanceEndTime = GameState.time + 10000;
        UI.addLog('💫 Âm Dương: 10s nhận damage → hồi HP!', 'realm');
        for (let i = 0; i < 14; i++) {
          const a = (i / 14) * Math.PI * 2;
          GameState.particles.push({
            x: Player.x + Math.cos(a) * 28,
            y: Player.y + Math.sin(a) * 28,
            vx: Math.cos(a) * 0.5,
            vy: Math.sin(a) * 0.5,
            life: 900,
            color: '#e040fb',
            size: 2 + Math.random() * 3
          });
        }
        break;

      case 'honChaos': {
        const allSkills = [
          ...DAO_HEART_CONFIG.branches.dao.skills,
          ...DAO_HEART_CONFIG.branches.ma.skills
        ];
        const picked = allSkills[Math.floor(Math.random() * allSkills.length)];
        this.executeSkill(picked);
        UI.addLog('💫 Hỗn Nguyên Thiên Địa: kích hoạt ' + picked.name + '!', 'realm');
        break;
      }

      case 'honTransform':
        Player._honTransformActive = true;
        Player._honTransformEndTime = GameState.time + 5000;
        Player._honTransformAtkMul = 2.0;
        Player.recalculateStats();
        UI.addLog('💫 Hỗn Nguyên Biến: +100% DMG +50% Speed 5s!', 'realm');
        UI.showNotification('💫 Hỗn Nguyên Biến!', '+100% DMG +50% Speed 5s');
        // Purple burst
        for (let i = 0; i < 18; i++) {
          const a = (i / 18) * Math.PI * 2;
          GameState.particles.push({
            x: Player.x + Math.cos(a) * 20,
            y: Player.y + Math.sin(a) * 20,
            vx: Math.cos(a) * 3.5,
            vy: Math.sin(a) * 3.5 - 1,
            life: 700,
            color: '#e040fb',
            size: 4 + Math.random() * 3
          });
        }
        break;

      default:
        break;
    }
  },

  // ── Main update loop ───────────────────────────────────────────────────
  update(dt) {
    const state = this.state;

    // Decay score toward 0
    state._decayTimer += dt;
    if (state._decayTimer >= DAO_HEART_CONFIG.decayInterval) {
      state._decayTimer -= DAO_HEART_CONFIG.decayInterval;
      if (state.score > 0) {
        state.score = Math.max(0, state.score - DAO_HEART_CONFIG.decayRate);
      } else if (state.score < 0) {
        state.score = Math.min(0, state.score + DAO_HEART_CONFIG.decayRate);
      }
      this.updateBranch();
      DaoHeartHUD.update();
    }

    // Auto farm timer (continuous auto = -2 every 10 min)
    if (typeof AutoSystem !== 'undefined' && AutoSystem.active) {
      state._autoFarmTimer += dt;
      if (state._autoFarmTimer >= 10 * 60 * 1000) {
        state._autoFarmTimer = 0;
        this.addScore(DAO_HEART_CONFIG.events.farmContinuous10m);
        UI.addLog('⚠️ Auto farm liên tục: -2 Đạo Tâm', 'system');
      }
    } else {
      state._autoFarmTimer = 0;
    }

    // No-retaliate check: bị hit mà không phản đòn 3s → +1
    if (state._lastHitTime > 0) {
      const sinceHit = GameState.time - state._lastHitTime;
      if (sinceHit >= 3000 && !state._retaliateGiven) {
        state._retaliateGiven = true;
        this.addScore(DAO_HEART_CONFIG.events.tankHitNoRetaliate);
        UI.addLog('☯️ Kiên nhẫn: +1 Đạo Tâm', 'system');
      }
    }

    // ── Expire active effects ─────────────────────────────────────────────

    if (Player._daoShieldActive && GameState.time > Player._daoShieldEndTime) {
      delete Player._daoShieldActive;
      delete Player._daoShieldEndTime;
      delete Player._daoShieldAbsorb;
      UI.addLog('☯️ Đạo Tâm Hộ Thể kết thúc.', 'system');
    }

    if (Player._daoAuraActive && GameState.time > Player._daoAuraEndTime) {
      delete Player._daoAuraActive;
      delete Player._daoAuraEndTime;
      UI.addLog('☯️ Linh Quang kết thúc.', 'system');
    }

    if (Player._maLifestealActive && GameState.time > Player._maLifestealEndTime) {
      delete Player._maLifestealActive;
      delete Player._maLifestealEndTime;
      delete Player._maLifestealPct;
    }

    if (Player._maDomainActive && GameState.time > Player._maDomainEndTime) {
      delete Player._maDomainActive;
      delete Player._maDomainEndTime;
      // Clear slow on enemies
      Enemies.list.forEach(e => { delete e._maDomainSlow; });
      UI.addLog('🔥 Ma Vực kết thúc.', 'system');
    }

    if (Player._honBalanceActive && GameState.time > Player._honBalanceEndTime) {
      delete Player._honBalanceActive;
      delete Player._honBalanceEndTime;
    }

    if (Player._honTransformActive && GameState.time > Player._honTransformEndTime) {
      delete Player._honTransformActive;
      delete Player._honTransformEndTime;
      delete Player._honTransformAtkMul;
      Player.recalculateStats();
      UI.addLog('💫 Hỗn Nguyên Biến kết thúc.', 'system');
    }

    // ── Ma domain: slow enemies in range ─────────────────────────────────
    if (Player._maDomainActive) {
      Enemies.list.forEach(e => {
        if (!e.alive) return;
        const dx = e.x - Player._maDomainX;
        const dy = e.y - Player._maDomainY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= 150) {
          e._maDomainSlow = true;
        } else {
          delete e._maDomainSlow;
        }
      });
    }

    // ── Kill streak 20 check ──────────────────────────────────────────────
    if (state._killStreakCount >= 20) {
      state._killStreakCount = 0;
      this.addScore(DAO_HEART_CONFIG.events.killStreak20);
      UI.addLog('🔥 Sát Sinh quá nhiều: -3 Đạo Tâm', 'system');
    }

    // ── Thiên Kiếm Phổ update ─────────────────────────────────────────────
    TiemKiemPho.updateKiemThanHoa(dt);

    // Refresh skill panel UI
    DaoSkillPanel.refresh();
  },

  // ── Render aura & domain ──────────────────────────────────────────────
  renderAura(ctx) {
    if (!this.state.activeBranch) return;
    const branch = DAO_HEART_CONFIG.branches[this.state.activeBranch];
    if (!branch) return;

    const cx = Player.x - GameState.camera.x;
    const cy = Player.y - 10 - GameState.camera.y;
    const pulse = 0.2 + Math.sin(GameState.time / 250) * 0.12;

    // Glow fill
    ctx.globalAlpha = pulse * 0.4;
    ctx.fillStyle = branch.color;
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, Math.PI * 2);
    ctx.fill();

    // Glow ring
    ctx.globalAlpha = pulse;
    ctx.strokeStyle = branch.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 26, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.lineWidth = 1;

    // Ma: dark smoke particles
    if (this.state.activeBranch === 'ma' && Math.random() < 0.05) {
      GameState.particles.push({
        x: Player.x + (Math.random() - 0.5) * 20,
        y: Player.y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -0.8,
        life: 600,
        color: '#7b1fa2',
        size: 3 + Math.random() * 3
      });
    }

    // Ma domain visual circle
    if (Player._maDomainActive) {
      const dx = Player._maDomainX - GameState.camera.x;
      const dy = Player._maDomainY - GameState.camera.y;
      const dpulse = 0.15 + Math.sin(GameState.time / 200) * 0.08;
      ctx.globalAlpha = dpulse;
      ctx.strokeStyle = '#f44336';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      ctx.arc(dx, dy, 150, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
      ctx.lineWidth = 1;
    }

    // Kiếm Thần Hóa gold aura
    if (TiemKiemPho.state.kiemThanHoaActive) {
      const kpulse = 0.3 + Math.sin(GameState.time / 150) * 0.15;
      ctx.globalAlpha = kpulse * 0.5;
      const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 40);
      grad.addColorStop(0, '#fff9c4');
      grad.addColorStop(1, '#f0c040');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, 40, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = kpulse;
      ctx.strokeStyle = '#f0c040';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, 44, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.lineWidth = 1;
    }
  },

  // ── Save/Load data ────────────────────────────────────────────────────
  getSaveData() {
    return {
      score: this.state.score,
      _skillCooldowns: this.state._skillCooldowns,
      _killStreakCount: this.state._killStreakCount
    };
  },

  loadSaveData(data) {
    if (!data) return;
    if (typeof data.score === 'number') this.state.score = data.score;
    if (data._skillCooldowns) this.state._skillCooldowns = data._skillCooldowns;
    if (typeof data._killStreakCount === 'number') this.state._killStreakCount = data._killStreakCount;
    this.updateBranch();
  }
};

// ===========================================================================
// SECTION 3 — TIEM KIEM PHO (Thiên Kiếm Phổ)
// ===========================================================================

const TiemKiemPho = {
  state: {
    completedPages: [],
    currentProgress: {
      killNoHitStreak: 0,
      totalOfflineMs: 0,
      bossEventClears: 0,
      totalGoldEarned: 0,
      lingMachStood: [],
      totalKills: 0
    },
    kiemThanHoaLastUsed: 0,
    kiemThanHoaActive: false,
    kiemThanHoaEndTime: 0
  },

  // ── Page status ────────────────────────────────────────────────────────
  getPageStatus(pageNum) {
    if (this.state.completedPages.includes(pageNum)) return 'completed';
    if (pageNum === 1) return 'available';
    if (this.state.completedPages.includes(pageNum - 1)) return 'available';
    return 'locked';
  },

  // ── Check if challenge is met ──────────────────────────────────────────
  checkPageCondition(page) {
    const prog = this.state.currentProgress;
    switch (page.challenge.type) {
      case 'killNoHit':
        return prog.killNoHitStreak >= page.challenge.target;
      case 'offlineTime':
        return prog.totalOfflineMs >= page.challenge.target;
      case 'realm':
        return (Player.realm || 0) >= page.challenge.target &&
               (Player.realmStage || 1) >= page.challenge.targetStage;
      case 'petsOwned':
        return (Player.ownedPets || []).length >= page.challenge.target;
      case 'bossEventClear':
        return prog.bossEventClears >= page.challenge.target;
      case 'goldAccumulate':
        return prog.totalGoldEarned >= page.challenge.target;
      case 'lingMachStand':
        return (prog.lingMachStood || []).length >= page.challenge.target;
      case 'killTotal':
        return prog.totalKills >= page.challenge.target;
      case 'daoHeartExtreme':
        return Math.abs(DaoHeartSystem.state.score) >= page.challenge.target;
      default:
        return false;
    }
  },

  // ── Try to complete a page ─────────────────────────────────────────────
  tryCompletePage(pageNum) {
    const page = TIEM_KIEM_PHO_CONFIG.pages.find(p => p.page === pageNum);
    if (!page) return false;
    if (this.state.completedPages.includes(pageNum)) {
      UI.addLog('📜 Trang ' + pageNum + ' đã hoàn thành rồi.', 'system');
      return false;
    }
    if (this.getPageStatus(pageNum) !== 'available') {
      UI.addLog('🔒 Trang ' + pageNum + ' chưa mở khóa!', 'system');
      return false;
    }
    if (!this.checkPageCondition(page)) {
      UI.addLog('❌ Chưa đủ điều kiện: ' + page.challenge.desc, 'system');
      return false;
    }

    this.state.completedPages.push(pageNum);
    UI.showNotification('📜 Trang ' + pageNum + ' Mở Khóa!', page.name);
    UI.addLog('📜 ' + page.name + ': ' + page.lore.substr(0, 30) + '...', 'realm');

    if (this.state.completedPages.length >= 9) {
      UI.showNotification('🌟 Thiên Kiếm Phổ Hoàn Thành!', 'Kiếm Thần Hóa đã được mở khóa!');
      UI.addLog('🌟 Đủ 9 trang! Kiếm Thần Hóa thức tỉnh!', 'realm');
    }

    KiemPhoPanel.render();
    return true;
  },

  // ── Activate Kiếm Thần Hóa ────────────────────────────────────────────
  activateKiemThanHoa() {
    if (this.state.completedPages.length < 9) {
      UI.addLog('❌ Cần đủ 9 trang Thiên Kiếm Phổ!', 'system');
      return false;
    }
    const elapsed = Date.now() - this.state.kiemThanHoaLastUsed;
    if (elapsed < TIEM_KIEM_PHO_CONFIG.kiemThanHoa.cooldown) {
      const remaining = Math.ceil((TIEM_KIEM_PHO_CONFIG.kiemThanHoa.cooldown - elapsed) / 3600000);
      UI.addLog('❌ Kiếm Thần Hóa hồi chiêu còn ' + remaining + 'h', 'system');
      return false;
    }

    this.state.kiemThanHoaActive = true;
    this.state.kiemThanHoaEndTime = GameState.time + TIEM_KIEM_PHO_CONFIG.kiemThanHoa.duration;
    this.state.kiemThanHoaLastUsed = Date.now();

    Player.recalculateStats();
    UI.showNotification('🌟 Kiếm Thần Hóa!', '5 phút boss-tier power!');
    UI.addLog('🌟 Kiếm Thần Hóa kích hoạt! 5 phút!', 'realm');

    // Screen flash gold
    const flashEl = document.createElement('div');
    flashEl.style.cssText = 'position:fixed;inset:0;background:#f0c040;z-index:999;pointer-events:none;opacity:0.7';
    document.body.appendChild(flashEl);
    let opacity = 0.7;
    const fadeFlash = setInterval(() => {
      opacity -= 0.05;
      flashEl.style.opacity = opacity;
      if (opacity <= 0) {
        clearInterval(fadeFlash);
        if (flashEl.parentNode) flashEl.remove();
      }
    }, 50);

    return true;
  },

  // ── Update Kiếm Thần Hóa each frame ──────────────────────────────────
  updateKiemThanHoa(dt) {
    if (!this.state.kiemThanHoaActive) return;
    if (GameState.time > this.state.kiemThanHoaEndTime) {
      this.state.kiemThanHoaActive = false;
      Player.recalculateStats();
      UI.addLog('🌟 Kiếm Thần Hóa kết thúc.', 'system');
      return;
    }
    // Gold aura particles
    if (Math.random() < 0.08) {
      const a = Math.random() * Math.PI * 2;
      const r = 20 + Math.random() * 15;
      GameState.particles.push({
        x: Player.x + Math.cos(a) * r,
        y: Player.y + Math.sin(a) * r,
        vx: Math.cos(a) * 2,
        vy: -2 - Math.random(),
        life: 600,
        color: '#f0c040',
        size: 3 + Math.random() * 3
      });
    }
  },

  // ── Get current progress value for display ────────────────────────────
  getProgressValue(page) {
    const prog = this.state.currentProgress;
    switch (page.challenge.type) {
      case 'killNoHit':     return { cur: prog.killNoHitStreak,  max: page.challenge.target };
      case 'offlineTime':   return { cur: Math.floor(prog.totalOfflineMs / 3600000 * 10) / 10, max: 8, unit: 'h' };
      case 'realm':         return { cur: (Player.realm >= page.challenge.target && Player.realmStage >= page.challenge.targetStage) ? 1 : 0, max: 1 };
      case 'petsOwned':     return { cur: (Player.ownedPets || []).length, max: page.challenge.target };
      case 'bossEventClear': return { cur: prog.bossEventClears, max: page.challenge.target };
      case 'goldAccumulate': return { cur: prog.totalGoldEarned, max: page.challenge.target };
      case 'lingMachStand': return { cur: (prog.lingMachStood || []).length, max: page.challenge.target };
      case 'killTotal':     return { cur: prog.totalKills, max: page.challenge.target };
      case 'daoHeartExtreme': return { cur: Math.abs(DaoHeartSystem.state.score), max: page.challenge.target };
      default:              return { cur: 0, max: 1 };
    }
  },

  // ── Save/Load ──────────────────────────────────────────────────────────
  getSaveData() {
    return {
      completedPages: this.state.completedPages,
      currentProgress: Object.assign({}, this.state.currentProgress, {
        lingMachStood: [...(this.state.currentProgress.lingMachStood || [])]
      }),
      kiemThanHoaLastUsed: this.state.kiemThanHoaLastUsed,
      kiemThanHoaActive: false // don't save active state
    };
  },

  loadSaveData(data) {
    if (!data) return;
    if (Array.isArray(data.completedPages)) this.state.completedPages = data.completedPages;
    if (data.currentProgress) {
      Object.assign(this.state.currentProgress, data.currentProgress);
      if (!Array.isArray(this.state.currentProgress.lingMachStood)) {
        this.state.currentProgress.lingMachStood = [];
      }
    }
    if (typeof data.kiemThanHoaLastUsed === 'number') this.state.kiemThanHoaLastUsed = data.kiemThanHoaLastUsed;
  }
};

// ===========================================================================
// SECTION 4 — UI COMPONENTS
// ===========================================================================

// ── Dao Heart HUD (bar cạnh avatar) ──────────────────────────────────────
const DaoHeartHUD = {
  _hideTimer: null,

  inject() {
    if (document.getElementById('daoHeartHUD')) return;
    const hud = document.createElement('div');
    hud.id = 'daoHeartHUD';
    hud.style.cssText = `
      position:absolute;top:82px;left:10px;z-index:20;
      opacity:0;transition:opacity 0.5s;pointer-events:none;
    `;
    hud.innerHTML = `
      <div style="width:120px;height:8px;background:#1a1a2e;border-radius:4px;
        overflow:hidden;border:1px solid #333;position:relative">
        <div id="daoBarLeft" style="position:absolute;right:50%;height:100%;
          background:linear-gradient(90deg,#1565c0,#42a5f5);border-radius:4px 0 0 4px;
          transition:width 0.3s;width:0%"></div>
        <div id="maBarRight" style="position:absolute;left:50%;height:100%;
          background:linear-gradient(90deg,#f44336,#b71c1c);border-radius:0 4px 4px 0;
          transition:width 0.3s;width:0%"></div>
        <div style="position:absolute;left:50%;transform:translateX(-50%);
          width:1px;height:100%;background:#555"></div>
      </div>
      <div id="daoHeartLabel" style="color:#888;font-size:8px;text-align:center;
        margin-top:2px;font-family:'Courier New',monospace;white-space:nowrap;
        overflow:hidden;text-overflow:ellipsis;max-width:120px"></div>
    `;
    document.body.appendChild(hud);
  },

  update() {
    const hud = document.getElementById('daoHeartHUD');
    if (!hud) return;

    hud.style.opacity = '1';
    clearTimeout(this._hideTimer);
    this._hideTimer = setTimeout(() => {
      const el = document.getElementById('daoHeartHUD');
      if (el) el.style.opacity = '0';
    }, 3000);

    const s = DaoHeartSystem.state.score;
    const daoBar = document.getElementById('daoBarLeft');
    const maBar = document.getElementById('maBarRight');
    const label = document.getElementById('daoHeartLabel');
    if (!daoBar || !maBar || !label) return;

    if (s >= 0) {
      daoBar.style.width = (s / 100 * 50) + '%';
      maBar.style.width = '0%';
    } else {
      daoBar.style.width = '0%';
      maBar.style.width = (Math.abs(s) / 100 * 50) + '%';
    }

    const branch = DaoHeartSystem.state.activeBranch;
    const cfg = DAO_HEART_CONFIG.branches;
    if (branch === 'dao') {
      label.style.color = cfg.dao.color;
      label.textContent = cfg.dao.icon + ' ' + cfg.dao.name + ' (' + s + ')';
    } else if (branch === 'ma') {
      label.style.color = cfg.ma.color;
      label.textContent = cfg.ma.icon + ' ' + cfg.ma.name + ' (' + s + ')';
    } else if (branch === 'honNguyen') {
      label.style.color = cfg.honNguyen.color;
      label.textContent = cfg.honNguyen.icon + ' ' + cfg.honNguyen.name + ' (' + s + ')';
    } else {
      label.style.color = '#888';
      label.textContent = '⚖️ Trung Lập (' + s + ')';
    }
  }
};

// ── Dao Special Skill Panel ───────────────────────────────────────────────
const DaoSkillPanel = {
  _panel: null,
  _lastBranch: null,
  _lastSkillCds: {},

  inject() {
    if (document.getElementById('daoSkillPanel')) return;
    const panel = document.createElement('div');
    panel.id = 'daoSkillPanel';
    panel.style.cssText = `
      position:absolute;bottom:110px;right:25px;z-index:29;
      display:none;flex-direction:column;gap:8px;align-items:flex-end;
    `;
    document.body.appendChild(panel);
    this._panel = panel;
  },

  refresh() {
    const panel = document.getElementById('daoSkillPanel');
    if (!panel) return;

    const branch = DaoHeartSystem.state.activeBranch;
    if (!branch) {
      panel.style.display = 'none';
      return;
    }

    panel.style.display = 'flex';
    const cfg = DAO_HEART_CONFIG.branches[branch];
    const skills = cfg ? cfg.skills : [];
    const cdMap = DaoHeartSystem.state._skillCooldowns;
    const now = GameState.time;

    // Rebuild if branch changed or button count mismatch
    if (this._lastBranch !== branch || panel.children.length !== skills.length) {
      this._lastBranch = branch;
      panel.innerHTML = '';
      skills.forEach((skill, i) => {
        const btn = document.createElement('div');
        btn.dataset.skillIdx = i;
        btn.style.cssText = `
          position:relative;width:48px;height:48px;cursor:pointer;
          border-radius:10px;border:2px solid ${cfg.color};
          background:rgba(0,0,0,0.75);display:flex;flex-direction:column;
          align-items:center;justify-content:center;
          font-size:9px;color:#fff;text-align:center;
          font-family:'Courier New',monospace;user-select:none;
          box-shadow:0 0 8px ${cfg.color}55;
          overflow:hidden;
        `;
        btn.innerHTML = `
          <div style="font-size:16px;line-height:1">${cfg.icon}</div>
          <div style="font-size:7px;margin-top:1px;color:${cfg.color};
            max-width:44px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis">
            ${skill.name.split('—')[0].trim()}
          </div>
          <div class="dao-cd-overlay" style="
            position:absolute;inset:0;background:rgba(0,0,0,0.6);
            display:none;align-items:center;justify-content:center;
            font-size:12px;font-weight:bold;color:#fff;border-radius:8px;
          "></div>
        `;
        btn.addEventListener('click', () => {
          DaoHeartSystem.useSpecialSkill(parseInt(btn.dataset.skillIdx));
        });
        btn.title = skill.name + '\n' + skill.desc + '\nCD: ' + (skill.cd / 1000) + 's | MP: ' + skill.mp;
        panel.appendChild(btn);
      });
    }

    // Update CD overlays
    const buttons = panel.querySelectorAll('[data-skill-idx]');
    buttons.forEach(btn => {
      const idx = parseInt(btn.dataset.skillIdx);
      const skill = skills[idx];
      if (!skill) return;
      const overlay = btn.querySelector('.dao-cd-overlay');
      if (!overlay) return;
      const lastUsed = cdMap[skill.id] || 0;
      const remaining = skill.cd - (now - lastUsed);
      if (remaining > 0) {
        overlay.style.display = 'flex';
        overlay.textContent = Math.ceil(remaining / 1000) + 's';
      } else {
        overlay.style.display = 'none';
      }
    });
  }
};

// ── Kiếm Pháp Panel (Thiên Kiếm Phổ modal) ────────────────────────────────
const KiemPhoPanel = {
  _el: null,

  inject() {
    if (document.getElementById('kiemPhoOverlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'kiemPhoOverlay';
    overlay.style.cssText = `
      display:none;position:fixed;inset:0;background:rgba(0,0,0,0.85);
      z-index:300;overflow-y:auto;align-items:flex-start;justify-content:center;
      padding:20px 10px;box-sizing:border-box;
    `;
    overlay.innerHTML = `
      <div id="kiemPhoPanel" style="
        background:linear-gradient(135deg,#0d1b2a,#1a1a2e);
        border:2px solid #f0c040;border-radius:14px;
        padding:20px;max-width:480px;width:100%;
        font-family:'Courier New',monospace;color:#fff;
        box-shadow:0 0 40px #f0c04040;position:relative;
      ">
        <div style="text-align:center;margin-bottom:16px">
          <div style="font-size:22px">📜</div>
          <div style="font-size:16px;font-weight:bold;color:#f0c040">Thiên Kiếm Phổ</div>
          <div style="font-size:10px;color:#888;margin-top:4px">9 trang bí kíp truyền đời</div>
        </div>
        <div id="kiemPhoPagesContainer"></div>
        <div id="kiemPhoKiemThanSection" style="display:none;margin-top:16px;
          border-top:1px solid #f0c04040;padding-top:14px;text-align:center">
          <div style="color:#f0c040;font-size:13px;font-weight:bold;margin-bottom:6px">
            🌟 Kiếm Thần Hóa
          </div>
          <div style="color:#aaa;font-size:10px;margin-bottom:10px">
            5 phút: ATK×3, DEF×2, Speed×1.5, Crit+50%
          </div>
          <button id="kiemThanHoaBtn" style="
            background:linear-gradient(135deg,#f0c040,#ff9800);
            border:none;border-radius:8px;padding:10px 24px;
            color:#1a1a2e;font-weight:bold;font-size:13px;
            cursor:pointer;font-family:'Courier New',monospace;
            box-shadow:0 0 16px #f0c04060;
          ">⚡ Kiếm Thần Hóa</button>
          <div id="kiemThanHoaCd" style="font-size:9px;color:#888;margin-top:6px"></div>
        </div>
        <div style="margin-top:16px;text-align:center">
          <button id="kiemPhoPanelClose" style="
            background:rgba(255,255,255,0.1);border:1px solid #444;
            border-radius:8px;padding:8px 20px;color:#aaa;
            cursor:pointer;font-family:'Courier New',monospace;font-size:11px;
          ">✕ Đóng</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    this._el = overlay;

    document.getElementById('kiemPhoPanelClose').addEventListener('click', () => this.close());
    overlay.addEventListener('click', e => { if (e.target === overlay) this.close(); });
    document.getElementById('kiemThanHoaBtn').addEventListener('click', () => {
      TiemKiemPho.activateKiemThanHoa();
      this.render();
    });
  },

  open() {
    const overlay = document.getElementById('kiemPhoOverlay');
    if (!overlay) return;
    this.render();
    overlay.style.display = 'flex';
  },

  close() {
    const overlay = document.getElementById('kiemPhoOverlay');
    if (overlay) overlay.style.display = 'none';
  },

  render() {
    const container = document.getElementById('kiemPhoPagesContainer');
    if (!container) return;
    container.innerHTML = '';

    const completedCount = TiemKiemPho.state.completedPages.length;

    TIEM_KIEM_PHO_CONFIG.pages.forEach(page => {
      const status = TiemKiemPho.getPageStatus(page.page);
      const isCompleted = status === 'completed';
      const isAvailable = status === 'available';
      const isLocked = status === 'locked';

      const progressData = TiemKiemPho.getProgressValue(page);
      const progressPct = Math.min(100, Math.floor((progressData.cur / progressData.max) * 100));

      const pageEl = document.createElement('div');
      pageEl.style.cssText = `
        border:1px solid ${isCompleted ? '#4caf50' : isAvailable ? '#f0c040' : '#333'};
        border-radius:10px;padding:12px;margin-bottom:10px;
        background:${isCompleted ? 'rgba(76,175,80,0.1)' : isAvailable ? 'rgba(240,192,64,0.06)' : 'rgba(255,255,255,0.03)'};
        opacity:${isLocked ? 0.45 : 1};transition:opacity 0.3s;
      `;

      let progressBarHtml = '';
      if (!isCompleted && !isLocked) {
        progressBarHtml = `
          <div style="margin:8px 0 4px;background:#1a1a2e;border-radius:4px;height:6px;
            border:1px solid #333;overflow:hidden">
            <div style="height:100%;width:${progressPct}%;background:linear-gradient(90deg,#f0c040,#ff9800);
              border-radius:4px;transition:width 0.4s"></div>
          </div>
          <div style="font-size:9px;color:#888;margin-bottom:6px">
            ${progressData.cur}${progressData.unit || ''} / ${progressData.max}${progressData.unit || ''} (${progressPct}%)
          </div>
        `;
      }

      let actionHtml = '';
      if (isCompleted) {
        actionHtml = `<span style="color:#4caf50;font-size:11px">✅ Hoàn thành</span>`;
      } else if (isAvailable) {
        actionHtml = `
          <button class="kp-check-btn" data-page="${page.page}" style="
            background:rgba(240,192,64,0.15);border:1px solid #f0c040;
            border-radius:6px;padding:5px 12px;color:#f0c040;
            cursor:pointer;font-family:'Courier New',monospace;font-size:10px;
          ">🔍 Kiểm Tra</button>
        `;
      } else {
        actionHtml = `<span style="color:#555;font-size:11px">🔒 Chưa mở</span>`;
      }

      pageEl.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div style="font-size:12px;font-weight:bold;
            color:${isCompleted ? '#4caf50' : isAvailable ? '#f0c040' : '#555'}">
            ${page.page}. ${page.name}
          </div>
          ${actionHtml}
        </div>
        <div style="font-size:9px;color:#888;font-style:italic;margin:5px 0 3px;
          line-height:1.5">
          "${page.lore}"
        </div>
        <div style="font-size:10px;color:#aaa">
          📋 ${page.challenge.desc}
        </div>
        ${progressBarHtml}
      `;
      container.appendChild(pageEl);

      // Check button handler
      const checkBtn = pageEl.querySelector('.kp-check-btn');
      if (checkBtn) {
        checkBtn.addEventListener('click', () => {
          TiemKiemPho.tryCompletePage(page.page);
          this.render();
        });
      }
    });

    // Progress summary
    const summaryEl = document.createElement('div');
    summaryEl.style.cssText = `
      text-align:center;color:#aaa;font-size:10px;
      padding:8px;border-top:1px solid #333;margin-top:4px;
    `;
    summaryEl.textContent = `📖 Tiến độ: ${completedCount}/9 trang`;
    container.appendChild(summaryEl);

    // Kiếm Thần Hóa section
    const ktSection = document.getElementById('kiemPhoKiemThanSection');
    if (ktSection) {
      if (completedCount >= 9) {
        ktSection.style.display = 'block';
        const cdEl = document.getElementById('kiemThanHoaCd');
        if (cdEl) {
          const elapsed = Date.now() - TiemKiemPho.state.kiemThanHoaLastUsed;
          if (elapsed < TIEM_KIEM_PHO_CONFIG.kiemThanHoa.cooldown) {
            const rem = TIEM_KIEM_PHO_CONFIG.kiemThanHoa.cooldown - elapsed;
            const h = Math.floor(rem / 3600000);
            const m = Math.floor((rem % 3600000) / 60000);
            cdEl.textContent = '⏳ Hồi chiêu: ' + h + 'h ' + m + 'm';
          } else if (TiemKiemPho.state.kiemThanHoaActive) {
            const rem = TiemKiemPho.state.kiemThanHoaEndTime - GameState.time;
            const s = Math.ceil(rem / 1000);
            cdEl.textContent = '🌟 Đang hoạt động: còn ' + s + 's';
          } else {
            cdEl.textContent = '✅ Sẵn sàng kích hoạt!';
          }
        }
      } else {
        ktSection.style.display = 'none';
      }
    }
  }
};

// ===========================================================================
// SECTION 5 — MONKEY PATCHES / HOOKS
// ===========================================================================

const DaoHeartFeature = {

  // ── Inject all CSS styles ──────────────────────────────────────────────
  _injectStyles() {
    if (document.getElementById('daoHeartStyles')) return;
    const s = document.createElement('style');
    s.id = 'daoHeartStyles';
    s.textContent = `
      .log-msg.realm { color: #ce93d8; }
      @keyframes daoGlow {
        0%,100% { box-shadow: 0 0 8px #42a5f5; }
        50% { box-shadow: 0 0 18px #42a5f5; }
      }
      @keyframes maGlow {
        0%,100% { box-shadow: 0 0 8px #f44336; }
        50% { box-shadow: 0 0 18px #f44336; }
      }
      @keyframes kiemThanPulse {
        0%,100% { opacity:1; }
        50% { opacity:0.7; }
      }
      #kiemPhoOverlay { font-family:'Courier New',monospace; }
      #daoSkillPanel [data-skill-idx]:active { transform:scale(0.92); }
    `;
    document.head.appendChild(s);
  },

  // ── Hook Player.recalculateStats ───────────────────────────────────────
  _hookRecalculateStats() {
    const _orig = Player.recalculateStats.bind(Player);
    Player.recalculateStats = function () {
      _orig.call(this);
      // Kiếm Thần Hóa stat multipliers
      if (TiemKiemPho.state.kiemThanHoaActive) {
        const cfg = TIEM_KIEM_PHO_CONFIG.kiemThanHoa.stats;
        Player.atk   = Math.floor(Player.atk * cfg.atkMul);
        Player.def   = Math.floor(Player.def * cfg.defMul);
        Player.speed *= cfg.speedMul;
        Player.critRate = Math.min(0.95, Player.critRate + cfg.critRate);
        Player.critDmg  += cfg.critDmg;
      }
      // Hỗn Nguyên Biến ATK multiplier
      if (Player._honTransformActive) {
        Player.atk = Math.floor(Player.atk * (Player._honTransformAtkMul || 2.0));
        Player.speed *= 1.5;
      }
    };
  },

  // ── Hook Player.takeDamage ─────────────────────────────────────────────
  _hookTakeDamage() {
    // Find the original takeDamage method
    if (!Player.takeDamage) return;
    const _orig = Player.takeDamage.bind(Player);

    Player.takeDamage = function (amount, source) {
      // Dao shield absorb
      if (Player._daoShieldActive) {
        amount = Math.floor(amount * (1 - (Player._daoShieldAbsorb || 0.3)));
      }

      // Hon balance: schedule HP return
      if (Player._honBalanceActive) {
        const returnHp = Math.floor(amount * 0.5);
        setTimeout(() => {
          if (Player.alive) {
            Player.hp = Math.min(Player.maxHp, Player.hp + returnHp);
          }
        }, 100);
      }

      // Track last hit time for no-retaliate event
      DaoHeartSystem.state._lastHitTime = GameState.time;
      DaoHeartSystem.state._retaliateGiven = false;

      // Reset kill-no-hit streak for Thiên Kiếm Phổ page 1
      TiemKiemPho.state.currentProgress.killNoHitStreak = 0;

      // Call original
      _orig.call(this, amount, source);

      // Ma lifesteal (heal based on damage taken)
      if (Player._maLifestealActive) {
        const heal = Math.floor(amount * (Player._maLifestealPct || 0.15));
        if (heal > 0) {
          Player.hp = Math.min(Player.maxHp, Player.hp + heal);
        }
      }
    };
  },

  // ── Hook Enemies.damage ────────────────────────────────────────────────
  _hookEnemiesDamage() {
    if (typeof Enemies === 'undefined' || !Enemies.damage) return;
    const _orig = Enemies.damage.bind(Enemies);
    Enemies.damage = function (enemy, amount, isCrit, color) {
      // Ma domain: +30% damage
      if (Player._maDomainActive) {
        amount = Math.floor(amount * 1.30);
      }
      // Hỗn Nguyên Biến: handled via recalculateStats (ATK multiplier)
      return _orig.call(this, enemy, amount, isCrit, color);
    };
  },

  // ── Hook Enemies.kill ──────────────────────────────────────────────────
  _hookEnemiesKill() {
    if (typeof Enemies === 'undefined' || !Enemies.kill) return;
    const _orig = Enemies.kill.bind(Enemies);
    Enemies.kill = function (enemy) {
      _orig.call(this, enemy);

      // Kill without being hit recently (+2)
      const sinceHit = GameState.time - DaoHeartSystem.state._lastHitTime;
      if (sinceHit > 5000) {
        DaoHeartSystem.addScore(DAO_HEART_CONFIG.events.killWithoutDamage);
      }

      // Track total kills + kill-no-hit streak for Thiên Kiếm Phổ
      TiemKiemPho.state.currentProgress.totalKills =
        (TiemKiemPho.state.currentProgress.totalKills || 0) + 1;
      TiemKiemPho.state.currentProgress.killNoHitStreak =
        (TiemKiemPho.state.currentProgress.killNoHitStreak || 0) + 1;

      // Kill streak tracking
      DaoHeartSystem.state._killStreakCount = (DaoHeartSystem.state._killStreakCount || 0) + 1;

      // Boss kill without skill in last 5s
      if (enemy.boss && GameState.time - (Player._lastSkillUseTime || 0) > 5000) {
        DaoHeartSystem.addScore(DAO_HEART_CONFIG.events.killBossNoSkill);
        UI.addLog('☯️ Hạ Boss không dùng Kỹ Năng: +3 Đạo Tâm!', 'realm');
      }

      // Elite/champion enemy (boss but not isBossEvent)
      if (enemy.boss && !enemy.isBossEvent) {
        DaoHeartSystem.addScore(DAO_HEART_CONFIG.events.killEliteOrChampion);
      }

      // Track gold for Thiên Kiếm Phổ page 6
      const goldGain = enemy.gold || 0;
      TiemKiemPho.state.currentProgress.totalGoldEarned =
        (TiemKiemPho.state.currentProgress.totalGoldEarned || 0) + goldGain;
    };
  },

  // ── Hook Player.useSkill (daoAura: no MP + CD/2) ──────────────────────
  _hookPlayerUseSkill() {
    if (!Player.useSkill) return;
    const _orig = Player.useSkill.bind(Player);
    Player.useSkill = function (idx) {
      // Track skill use time for boss-kill detection
      Player._lastSkillUseTime = GameState.time;

      // Dao Aura: no MP cost + half cooldown
      if (Player._daoAuraActive && this.skills && this.skills[idx]) {
        const skill = this.skills[idx];
        const savedMp = skill.mp;
        const savedMaxCd = skill.maxCd;
        skill.mp = 0;
        skill.maxCd = Math.max(100, Math.floor(skill.maxCd / 2));
        const result = _orig.call(this, idx);
        skill.mp = savedMp;
        skill.maxCd = savedMaxCd;
        return result;
      }
      return _orig.call(this, idx);
    };
  },

  // ── Hook NPC.spawnForMap → spawn Cổ Thư Các on map 0 ─────────────────
  _hookNpcSpawnForMap() {
    if (typeof NPC === 'undefined' || !NPC.spawnForMap) return;
    const _orig = NPC.spawnForMap.bind(NPC);
    NPC.spawnForMap = function (mapIndex) {
      _orig.call(this, mapIndex);
      if (mapIndex === 0) {
        // Register NPC type if not exists
        if (!NPC.types.coThuCac) {
          NPC.types.coThuCac = {
            name: '📜 Cổ Thư Các',
            title: 'Thiên Kiếm Phổ — Cổ Thư',
            sprite: 'npcTeleporter',
            dialog: '9 trang Thiên Kiếm Phổ rải khắp giang hồ. Thu thập đủ để đạt Kiếm Thần Hóa!',
            service: 'kiemPho'
          };
        }
        // Spawn near center of map 0
        NPC.spawn('coThuCac', 620, 500);
      }
    };
  },

  // ── Hook NPC.interact → handle kiemPho service ─────────────────────────
  _hookNpcInteract() {
    if (typeof NPC === 'undefined' || !NPC.interact) return;
    const _orig = NPC.interact.bind(NPC);
    NPC.interact = function (npc) {
      if (npc && npc.service === 'kiemPho') {
        // Show dialog with options
        NPC.currentDialog = npc;
        const dialogEl = document.getElementById('npcDialog');
        const titleEl  = document.getElementById('npcTitle');
        const textEl   = document.getElementById('npcText');
        const optsEl   = document.getElementById('npcOptions');
        if (!dialogEl || !titleEl || !textEl || !optsEl) {
          // Fallback: open panel directly
          KiemPhoPanel.open();
          return;
        }
        titleEl.textContent = npc.name;
        if (document.getElementById('npcTitleSub')) {
          document.getElementById('npcTitleSub').textContent = npc.title || '';
        }
        textEl.textContent = npc.dialog;
        optsEl.innerHTML = '';

        const viewOpt = document.createElement('div');
        viewOpt.className = 'npc-option';
        const completedCount = TiemKiemPho.state.completedPages.length;
        viewOpt.innerHTML = `📜 Xem Thiên Kiếm Phổ (${completedCount}/9)`;
        viewOpt.addEventListener('click', () => {
          NPC.closeDialog();
          KiemPhoPanel.open();
        });
        optsEl.appendChild(viewOpt);

        // Kiếm Thần Hóa button if unlocked
        if (completedCount >= 9) {
          const ktOpt = document.createElement('div');
          ktOpt.className = 'npc-option';
          ktOpt.style.color = '#f0c040';
          const elapsed = Date.now() - TiemKiemPho.state.kiemThanHoaLastUsed;
          const cdReady = elapsed >= TIEM_KIEM_PHO_CONFIG.kiemThanHoa.cooldown;
          ktOpt.innerHTML = `⚡ Kiếm Thần Hóa ${cdReady ? '(Sẵn sàng!)' : '(Hồi chiêu)'}`;
          ktOpt.addEventListener('click', () => {
            NPC.closeDialog();
            TiemKiemPho.activateKiemThanHoa();
          });
          optsEl.appendChild(ktOpt);
        }

        NPC.addCloseOption(optsEl);
        dialogEl.classList.add('show');
        return;
      }
      return _orig.call(this, npc);
    };
  },

  // ── Hook Game.update ───────────────────────────────────────────────────
  _hookGameUpdate() {
    const _orig = Game.update.bind(Game);
    Game.update = function (dt) {
      _orig.call(this, dt);
      DaoHeartSystem.update(dt);
    };
  },

  // ── Hook Game render player (inject aura) ─────────────────────────────
  _hookGameRenderPlayer() {
    // Try to wrap renderPlayer
    if (typeof Game.renderPlayer !== 'function') return;
    const _orig = Game.renderPlayer.bind(Game);
    Game.renderPlayer = function () {
      _orig.call(this);
      DaoHeartSystem.renderAura(this.ctx);
    };
  },

  // ── Hook Game.render (wrap full render for aura injection) ────────────
  _hookGameRender() {
    if (typeof Game.render !== 'function') return;
    const _orig = Game.render.bind(Game);
    const self = this;
    Game.render = function () {
      _orig.call(this);
      // renderAura is called inside renderPlayer hook OR as fallback here
      // Only call if renderPlayer hook wasn't available
      if (typeof Game.renderPlayer !== 'function') {
        const ctx = this.ctx;
        if (ctx) DaoHeartSystem.renderAura(ctx);
      }
    };
  },

  // ── Hook Game.save ─────────────────────────────────────────────────────
  _hookGameSave() {
    const _orig = Game.save.bind(Game);
    Game.save = function () {
      _orig.call(this);
      try {
        const data = {
          daoHeart: DaoHeartSystem.getSaveData(),
          tiemKiemPho: TiemKiemPho.getSaveData()
        };
        localStorage.setItem(DAO_HEART_CONFIG.storageKey, JSON.stringify(data));
      } catch (e) {
        console.warn('☯️ DaoHeart save error:', e);
      }
    };
  },

  // ── Hook Game.load ─────────────────────────────────────────────────────
  _hookGameLoad() {
    const _orig = Game.load.bind(Game);
    Game.load = function () {
      const result = _orig.call(this);
      // Load our data
      try {
        const raw = localStorage.getItem(DAO_HEART_CONFIG.storageKey);
        if (raw) {
          const data = JSON.parse(raw);
          DaoHeartSystem.loadSaveData(data.daoHeart);
          TiemKiemPho.loadSaveData(data.tiemKiemPho);
        }
      } catch (e) {
        console.warn('☯️ DaoHeart load error:', e);
      }

      // Calculate offline time and track for Trang 2
      try {
        const mainSave = localStorage.getItem('tuxien_save');
        if (mainSave) {
          const saveData = JSON.parse(mainSave);
          if (saveData.lastSave) {
            const offlineMs = Date.now() - saveData.lastSave;
            if (offlineMs > 0 && offlineMs < 7 * 24 * 3600000) {
              TiemKiemPho.state.currentProgress.totalOfflineMs =
                (TiemKiemPho.state.currentProgress.totalOfflineMs || 0) + offlineMs;
            }
          }
        }
      } catch (e) { /* ignore */ }

      return result;
    };
  },

  // ── Hook BossEventSystem (if loaded) ──────────────────────────────────
  _hookBossEventSystem() {
    // BossEventSystem might not be loaded yet; use deferred check
    const tryHook = () => {
      if (typeof BossEventSystem !== 'undefined' && BossEventSystem.killBoss && !BossEventSystem._daoHooked) {
        BossEventSystem._daoHooked = true;
        const _orig = BossEventSystem.killBoss.bind(BossEventSystem);
        BossEventSystem.killBoss = function () {
          _orig.call(this);
          TiemKiemPho.state.currentProgress.bossEventClears =
            (TiemKiemPho.state.currentProgress.bossEventClears || 0) + 1;
          DaoHeartSystem.addScore(DAO_HEART_CONFIG.events.bossEventClear);
          UI.addLog('☯️ Boss Event hoàn thành: +4 Đạo Tâm!', 'realm');
        };
      }
    };
    tryHook();
    // Also try after 2 seconds in case BossEventSystem loads after us
    setTimeout(tryHook, 2000);
  },

  // ── Hook Player.gainGold (if it exists) for gold tracking ─────────────
  _hookPlayerGainGold() {
    // Many games use Player.gold += directly, so also patch via Enemies.kill (done above)
    // If there's a gainGold method, hook it
    if (typeof Player.gainGold === 'function') {
      const _orig = Player.gainGold.bind(Player);
      Player.gainGold = function (amount) {
        _orig.call(this, amount);
        TiemKiemPho.state.currentProgress.totalGoldEarned =
          (TiemKiemPho.state.currentProgress.totalGoldEarned || 0) + amount;
      };
    }
  },

  // ── Main init ──────────────────────────────────────────────────────────
  init() {
    this._injectStyles();
    DaoHeartHUD.inject();
    DaoSkillPanel.inject();
    KiemPhoPanel.inject();

    // Register NPC type early
    if (typeof NPC !== 'undefined') {
      NPC.types.coThuCac = {
        name: '📜 Cổ Thư Các',
        title: 'Thiên Kiếm Phổ — Cổ Thư',
        sprite: 'npcTeleporter',
        dialog: '9 trang Thiên Kiếm Phổ rải khắp giang hồ. Thu thập đủ để đạt Kiếm Thần Hóa!',
        service: 'kiemPho'
      };
    }

    // Apply hooks
    this._hookRecalculateStats();
    this._hookTakeDamage();
    this._hookEnemiesDamage();
    this._hookEnemiesKill();
    this._hookPlayerUseSkill();
    this._hookNpcSpawnForMap();
    this._hookNpcInteract();
    this._hookGameUpdate();
    this._hookGameRenderPlayer();
    this._hookGameRender();
    this._hookGameSave();
    this._hookGameLoad();
    this._hookBossEventSystem();
    this._hookPlayerGainGold();

    // Initial UI update
    DaoHeartHUD.update();
    DaoSkillPanel.refresh();

    console.log('☯️ Dao Heart + Tiem Kiem Pho loaded');
  }
};

// ===========================================================================
// KHỞI ĐỘNG — Wrap Game.init
// ===========================================================================

(function () {
  if (typeof Game === 'undefined') {
    console.warn('☯️ Game not found — DaoHeartFeature will not init');
    return;
  }

  const _origGameInit = Game.init.bind(Game);
  Game.init = function () {
    _origGameInit.call(this);
    // Run after all base systems are ready
    setTimeout(() => {
      DaoHeartFeature.init();
      // Re-spawn NPCs for map 0 to include Cổ Thư Các
      if (typeof NPC !== 'undefined' && typeof Maps !== 'undefined') {
        NPC.spawnForMap(Maps.currentIndex || 0);
      }
    }, 0);
  };
})();

// ===========================================================================
// Hướng dẫn thêm vào index.html:
// Thêm NGAY SAU <script src="js/ui.js"></script> (hoặc cuối cùng trong danh sách scripts):
//   <script src="js/feature_dao_heart.js"></script>
// ===========================================================================
