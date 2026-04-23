// ==================== FEATURE: ADAPTIVE BOSS ====================
// feature_adaptive_boss.js — Boss học từ lịch sử combat
//
// HOOKS VÀO:
//   - BossEventSystem._onBossKilled()  (feature_boss_event.js)
//   - BossEventSystem.spawnBoss()      (feature_boss_event.js)
//   - BossEventSystem.updateBossAI()   (feature_boss_event.js — cho mutation tick)
//
// ĐỌC/GHI localStorage:
//   - boss_memory_{bossId}   : { rangeDmgRatio, burstFirst3s, kiteCount, stackCount }
//
// DEPEND:
//   - feature_boss_event.js  (BossEventSystem, BOSS_EVENT_CONFIG)
//   - game.js                (GameState, Game, Utils, Player, UI)
//   - config.js              (CONFIG)
//
// KHÔNG đụng: spawn rate, HP, damage gốc của boss object
// ================================================================

const AdaptiveBossSystem = {

  // ─── State theo dõi combat hiện tại ─────────────────────────
  _combatLog: {
    rangeDmg:    0,   // tổng damage từ skill range > 80 (xa)
    meleeDmg:    0,   // tổng damage từ skill range <= 80 (cận)
    burstFirst3s: 0,  // tổng damage trong 3 giây đầu
    kiteCount:   0,   // số lần player di chuyển khi boss đang attack
    combatStart: 0,   // timestamp bắt đầu
    tracking:    false
  },

  // ─── Mutation defs ──────────────────────────────────────────
  MUTATIONS: {
    teleport_charge: {
      name: '🌀 Dịch Chuyển Tấn Công',
      desc: 'Boss teleport đến player mỗi 5 giây',
      interval: 5000,
      _timer: 0,
      apply(boss, dt) {
        this._timer -= dt;
        if (this._timer <= 0) {
          this._timer = this.interval;
          // Teleport đến gần player
          const angle = Math.random() * Math.PI * 2;
          boss.x = Utils.clamp(
            Player.x + Math.cos(angle) * 60,
            50, CONFIG.WORLD_WIDTH  * CONFIG.TILE_SIZE - 50
          );
          boss.y = Utils.clamp(
            Player.y + Math.sin(angle) * 60,
            50, CONFIG.WORLD_HEIGHT * CONFIG.TILE_SIZE - 50
          );
          // Particle burst
          for (let i = 0; i < 12; i++) {
            GameState.particles.push({
              x: boss.x + (Math.random()-0.5)*30,
              y: boss.y + (Math.random()-0.5)*30,
              vx: (Math.random()-0.5)*4, vy: (Math.random()-0.5)*4-1,
              life: 400, color: '#e040fb', size: 3+Math.random()*3
            });
          }
          Game.spawnDamageNumber(boss.x, boss.y-boss.size-10, '🌀 BLINK!', '#e040fb');
          UI.addLog('⚠️ Boss thích nghi: Dịch Chuyển!', 'system');
        }
      }
    },

    phase_shield: {
      name: '🛡 Pha Khiên',
      desc: 'Boss miễn nhiễm 3 giây đầu combat',
      shieldDuration: 3000,
      _active: false,
      _timer: 0,
      apply(boss, dt) {
        // Shield logic handled in spawnBoss hook
      },
      onSpawn(boss) {
        this._active = true;
        this._timer  = this.shieldDuration;
        boss._phaseShieldActive = true;
        boss.color = '#ffffff';
        UI.addLog('🛡 Boss thích nghi: Khiên Pha khởi động!', 'system');
      },
      tick(boss, dt) {
        if (!this._active) return;
        this._timer -= dt;
        if (this._timer <= 0) {
          this._active = false;
          boss._phaseShieldActive = false;
          // Khôi phục màu gốc từ config nếu có
          const bs = BossEventSystem.bossState;
          if (bs.config) boss.color = bs.config.phases[bs.currentPhase].color;
          UI.addLog('🛡 Khiên Pha tan vỡ!', 'system');
        }
      }
    },

    aoe_pulse: {
      name: '💫 Xung AOE',
      desc: 'Boss phát AOE xung quanh mỗi 4 giây',
      interval: 4000,
      radius: 100,
      _timer: 0,
      apply(boss, dt) {
        this._timer -= dt;
        if (this._timer <= 0) {
          this._timer = this.interval;
          const dist = Utils.dist(Player.x, Player.y, boss.x, boss.y);
          if (dist <= this.radius) {
            const dmg = Math.floor(BossEventSystem.getBossAtk() * 0.4);
            Player.takeDamage(dmg, boss.name + ' [Xung AOE]');
          }
          // Visual ring
          for (let i = 0; i < 16; i++) {
            const angle = (i/16)*Math.PI*2;
            GameState.particles.push({
              x: boss.x + Math.cos(angle)*this.radius,
              y: boss.y + Math.sin(angle)*this.radius,
              vx: Math.cos(angle)*1.5, vy: Math.sin(angle)*1.5-0.5,
              life: 500, color: '#ff9800', size: 4
            });
          }
          Game.spawnDamageNumber(boss.x, boss.y-boss.size-10, '💫 PULSE!', '#ff9800');
        }
      }
    }
  },

  // ─── Khởi động tracking khi boss spawn ───────────────────────
  startTracking() {
    this._combatLog = {
      rangeDmg: 0, meleeDmg: 0,
      burstFirst3s: 0, kiteCount: 0,
      combatStart: Date.now(), tracking: true
    };
  },

  // ─── Ghi nhận damage từ player vào boss ─────────────────────
  // Gọi từ hook Enemies.damage khi enemy.isBossEvent
  recordDamage(amount, skillIdx) {
    if (!this._combatLog.tracking) return;
    const elapsed = Date.now() - this._combatLog.combatStart;

    // Xác định loại damage
    const skill = Player.skills && Player.skills[skillIdx];
    const range  = skill ? skill.range : 65;
    if (range > 80) {
      this._combatLog.rangeDmg += amount;
    } else {
      this._combatLog.meleeDmg += amount;
    }

    // Burst đầu 3 giây
    if (elapsed <= 3000) {
      this._combatLog.burstFirst3s += amount;
    }
  },

  // ─── Ghi nhận kite (player di chuyển khi boss attack) ────────
  recordKite() {
    if (!this._combatLog.tracking) return;
    this._combatLog.kiteCount++;
  },

  // ─── Phân tích log và lưu memory ─────────────────────────────
  analyzeAndSave(bossId) {
    const log = this._combatLog;
    log.tracking = false;

    const totalDmg = log.rangeDmg + log.meleeDmg + 1;
    const rangePct = log.rangeDmg / totalDmg;

    // Đọc memory cũ
    const mem = this._loadMemory(bossId);
    mem.stackCount = (mem.stackCount || 0) + 1;

    // Cộng dồn (moving average nhẹ)
    mem.rangeDmgRatio  = (mem.rangeDmgRatio  || 0) * 0.5 + rangePct * 0.5;
    mem.burstFirst3s   = (mem.burstFirst3s   || 0) * 0.5 + log.burstFirst3s * 0.5;
    mem.kiteCount      = (mem.kiteCount      || 0) * 0.5 + log.kiteCount * 0.5;

    // Reset sau 3 stack
    if (mem.stackCount >= 3) {
      mem.stackCount    = 0;
      mem.rangeDmgRatio = 0;
      mem.burstFirst3s  = 0;
      mem.kiteCount     = 0;
      UI.addLog('🔄 Boss [' + bossId + '] reset thích nghi (3 stack đạt).', 'system');
    }

    this._saveMemory(bossId, mem);

    // Chọn mutation cao nhất
    const dominant = this._getDominantMetric(mem);
    if (dominant) {
      UI.addLog(`🧠 Boss học được: ${this.MUTATIONS[dominant].name} (stack ${mem.stackCount}/3)`, 'system');
    }
  },

  // ─── Xác định metric cao nhất → mutation ─────────────────────
  _getDominantMetric(mem) {
    if (mem.stackCount === 0) return null; // Vừa reset

    const candidates = [
      { key: 'teleport_charge', score: mem.rangeDmgRatio || 0    },
      { key: 'phase_shield',    score: (mem.burstFirst3s || 0)/500 }, // normalize
      { key: 'aoe_pulse',       score: (mem.kiteCount    || 0)/10  }
    ];

    candidates.sort((a, b) => b.score - a.score);
    return candidates[0].score > 0 ? candidates[0].key : null;
  },

  // ─── Áp mutation khi boss spawn ──────────────────────────────
  applyMutationToSpawn(boss, bossId) {
    const mem = this._loadMemory(bossId);
    if (!mem || mem.stackCount === 0) return;

    const mutKey = this._getDominantMetric(mem);
    if (!mutKey) return;

    const mut = this.MUTATIONS[mutKey];
    boss._adaptiveMutation    = mutKey;
    boss._adaptiveMutationObj = { ...mut, _timer: mut.interval || 0 };

    // Phase shield cần onSpawn ngay
    if (mutKey === 'phase_shield') {
      boss._adaptiveMutationObj._active = false; // onSpawn sẽ set
      mut.onSpawn.call(boss._adaptiveMutationObj, boss);
    }

    // Badge trên boss name
    boss.name = '[Thích Nghi] ' + boss.name;
    UI.showNotification('⚠️ Boss Thích Nghi!', mut.name + ': ' + mut.desc);
    UI.addLog('⚠️ Boss thích nghi! ' + mut.name, 'system');
  },

  // ─── Tick mutation mỗi frame ─────────────────────────────────
  tickMutation(boss, dt) {
    if (!boss || !boss._adaptiveMutationObj) return;
    const mutKey = boss._adaptiveMutation;
    const mutObj = boss._adaptiveMutationObj;

    // Phase shield tick
    if (mutKey === 'phase_shield') {
      this.MUTATIONS.phase_shield.tick.call(mutObj, boss, dt);
      return;
    }

    // Các mutation dùng apply()
    if (typeof mutObj.apply === 'function') {
      mutObj.apply.call(mutObj, boss, dt);
    }
  },

  // ─── localStorage helpers ────────────────────────────────────
  _loadMemory(bossId) {
    try {
      const raw = localStorage.getItem('boss_memory_' + bossId);
      return raw ? JSON.parse(raw) : {};
    } catch (_) { return {}; }
  },

  _saveMemory(bossId, data) {
    try {
      localStorage.setItem('boss_memory_' + bossId, JSON.stringify(data));
    } catch (_) {}
  },

  // ─── Init: hook vào BossEventSystem ─────────────────────────
  init() {
    if (typeof BossEventSystem === 'undefined') {
      console.warn('[AdaptiveBoss] BossEventSystem not found — retry in 500ms');
      setTimeout(() => this.init(), 500);
      return;
    }

    this._hookBossKilled();
    this._hookBossSpawn();
    this._hookBossAI();
    this._hookEnemiesDamage();
    this._hookPlayerMovement();

    console.log('🧠 AdaptiveBossSystem initialized');
  },

  // ─── Hook: _onBossKilled ─────────────────────────────────────
  _hookBossKilled() {
    const _orig = BossEventSystem._onBossKilled.bind(BossEventSystem);
    const self  = this;

    BossEventSystem._onBossKilled = function() {
      const bossId = BossEventSystem.bossState.bossId;
      _orig();
      if (bossId) {
        self.analyzeAndSave(bossId);
      }
    };
  },

  // ─── Hook: spawnBoss — áp mutation sau khi boss object tạo ───
  _hookBossSpawn() {
    const _orig = BossEventSystem.spawnBoss.bind(BossEventSystem);
    const self  = this;

    BossEventSystem.spawnBoss = function() {
      _orig();
      const bs = BossEventSystem.bossState;
      if (bs.boss && bs.bossId) {
        self.applyMutationToSpawn(bs.boss, bs.bossId);
        self.startTracking();
      }
    };
  },

  // ─── Hook: updateBossAI — tick mutation ──────────────────────
  _hookBossAI() {
    const _orig = BossEventSystem.updateBossAI.bind(BossEventSystem);
    const self  = this;

    BossEventSystem.updateBossAI = function(dt) {
      _orig(dt);
      const bs = BossEventSystem.bossState;
      if (bs.active && bs.boss && bs.boss.alive && BossEventSystem._onBossMap()) {
        self.tickMutation(bs.boss, dt);
      }
    };
  },

  // ─── Hook: Enemies.damage — intercept phase_shield + record ──
  _hookEnemiesDamage() {
    const _origDmg = Enemies.damage.bind(Enemies);
    const self     = this;

    // Lưu lại index của skill đang dùng (set bởi Player.useSkill hook trong feature_combat)
    // Ở đây ta cần đọc skill index — dùng flag đơn giản
    const _origUseSkill = Player.useSkill.bind(Player);
    Player.useSkill = function(idx) {
      Player._lastSkillIdx = idx;
      return _origUseSkill(idx);
    };

    Enemies.damage = function(enemy, amount, isCrit, color) {
      if (enemy && enemy.isBossEvent && enemy._phaseShieldActive) {
        Game.spawnDamageNumber(enemy.x, enemy.y-enemy.size-10, '🛡 ADAPT-SHIELD', '#ffffff');
        return; // Block damage
      }
      if (enemy && enemy.isBossEvent) {
        self.recordDamage(amount, Player._lastSkillIdx || 0);
      }
      _origDmg(enemy, amount, isCrit, color);
    };
  },

  // ─── Hook: Player.update — detect kite ──────────────────────
  _hookPlayerMovement() {
    const _origUpdate = Player.update.bind(Player);
    const self = this;
    let _kiteCheckTimer = 0;

    Player.update = function(dt, ix, iy) {
      _origUpdate(dt, ix, iy);
      if (!self._combatLog.tracking) return;

      // Chỉ check khi boss đang attack (attackTimer đang reset gần đây)
      _kiteCheckTimer -= dt;
      if (_kiteCheckTimer <= 0) {
        _kiteCheckTimer = 500;
        const bs = BossEventSystem.bossState;
        if (bs.active && bs.boss && bs.boss.alive) {
          const moving = Math.abs(Player.vx) > 0.5 || Math.abs(Player.vy) > 0.5;
          const nearBoss = Utils.dist(Player.x, Player.y, bs.boss.x, bs.boss.y) < bs.boss.size + 80;
          if (moving && nearBoss) {
            self.recordKite();
          }
        }
      }
    };
  }
};

// ─── Auto-init sau khi game + boss event đều loaded ─────────────
(function() {
  function tryInit() {
    if (typeof BossEventSystem !== 'undefined' && typeof Game !== 'undefined' &&
        typeof Player !== 'undefined' && typeof Enemies !== 'undefined') {
      AdaptiveBossSystem.init();
    } else {
      setTimeout(tryInit, 300);
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(tryInit, 400));
  } else {
    setTimeout(tryInit, 400);
  }
})();

console.log('🧠 feature_adaptive_boss.js loaded');
