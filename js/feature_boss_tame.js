// ===== FILE: js/feature_boss_tame.js =====
// ==================== FEATURE: BOSS TAME ====================
// feature_boss_tame.js — Thu phục Boss làm Thần Thú
//
// ĐỘC LẬP: Không cần feature_pet_level.js
// Load sau: game.js, feature_boss_event.js (nếu có)
// <script src="js/feature_boss_tame.js"></script>
//
// CÁCH HOẠT ĐỘNG:
//   - Boss (thường + boss event) khi HP ≤ 15%: xuất hiện nút "Thu Phục"
//   - Tốn 1 item TameBead (Phong Ấn Châu) — drop từ chính boss đó
//   - Có thể giữ tối đa 1 thần thú cùng lúc (có thể hoán đổi)
//   - Thần thú theo sau player, tấn công enemy gần, có 1 skill passive
//   - Lưu vào tuxien_save qua hook Player.getSaveData/loadSaveData
//
// HOOKS:
//   - Enemies.kill()              — drop TameBead từ boss
//   - Enemies.damage()            — check HP threshold → show capture prompt
//   - Game.update(dt)             — tick thần thú AI + skill
//   - Game.renderPet()            — render thần thú pixel art
//   - Player.recalculateStats()   — áp passive bonus
//   - Player.getSaveData()        — lưu tame data
//   - Player.loadSaveData()       — load tame data
//   - UI.renderCharacter()        — thêm section Thần Thú vào char panel
//
// localStorage: nhúng vào tuxien_save (không dùng key riêng)
// ============================================================

// ============================================================
// PHẦN 1 — ITEM & CONFIG
// ============================================================

const BOSS_TAME_CONFIG = {
  hpThreshold:     0.15,   // boss HP ≤ 15% thì xuất hiện prompt
  captureWindow:   6000,   // ms — cửa sổ thu phục trước khi boss bị kill
  tameBeadDropChance: 0.5, // 50% boss drop TameBead khi chết mà không thu phục

  // Map: enemy.type → tên thần thú, màu, skill
  bossToTame: {
    // === Boss thường (enemies.js) ===
    wolfKing: {
      petId:    'tame_wolfKing',
      name:     '🐺 Sói Vương',
      color:    '#90a4ae',
      glowColor:'#cfd8dc',
      passiveBonus: { speed: 0.4 },            // +tốc độ
      passiveDesc:  '+0.4 Tốc độ',
      skill: {
        name: 'Cắn Xé', cd: 5000,
        type: 'melee', range: 80, dmgMul: 1.8,
        color: '#90a4ae', desc: 'Cắn xé mục tiêu gần nhất, 1.8x ATK'
      }
    },
    demonLord: {
      petId:    'tame_demonLord',
      name:     '👹 Ma Vương',
      color:    '#8b0000',
      glowColor:'#ff5252',
      passiveBonus: { atk: 8 },
      passiveDesc:  '+8 ATK',
      skill: {
        name: 'Hắc Diệm', cd: 7000,
        type: 'aoe', range: 120, dmgMul: 2.0,
        color: '#8b0000', desc: 'AOE bóng tối, 2.0x ATK'
      }
    },
    iceEmperor: {
      petId:    'tame_iceEmperor',
      name:     '❄ Băng Đế',
      color:    '#00bcd4',
      glowColor:'#80deea',
      passiveBonus: { def: 6 },
      passiveDesc:  '+6 DEF',
      skill: {
        name: 'Băng Phong', cd: 8000,
        type: 'freeze', range: 140, dmgMul: 0, freezeDuration: 2000,
        color: '#00bcd4', desc: 'Đóng băng enemy gần 2 giây'
      }
    },
    celestialDragon: {
      petId:    'tame_celestialDragon',
      name:     '🐉 Thiên Long',
      color:    '#ffd700',
      glowColor:'#fff9c4',
      passiveBonus: { hp: 200 },
      passiveDesc:  '+200 Max HP',
      skill: {
        name: 'Hơi Thở Rồng', cd: 9000,
        type: 'breath', range: 180, dmgMul: 2.5,
        color: '#ffd700', desc: 'Hơi thở đốt cháy, 2.5x ATK'
      }
    },

    // === Boss event (feature_boss_event.js) ===
    boss_colong: {
      petId:    'tame_colong',
      name:     '🐉 Cổ Long',
      color:    '#228b22',
      glowColor:'#a5d6a7',
      passiveBonus: { hp: 150, def: 4 },
      passiveDesc:  '+150 HP +4 DEF',
      skill: {
        name: 'Rồng Tức', cd: 7000,
        type: 'aoe', range: 130, dmgMul: 2.2,
        color: '#228b22', desc: 'AOE xung quanh, 2.2x ATK'
      }
    },
    boss_minhvuong: {
      petId:    'tame_minhvuong',
      name:     '👻 Minh Vương',
      color:    '#4b0082',
      glowColor:'#e040fb',
      passiveBonus: { atk: 10 },
      passiveDesc:  '+10 ATK',
      skill: {
        name: 'Triệu Hồn', cd: 10000,
        type: 'drain', range: 150, dmgMul: 1.5, drainPct: 0.06,
        color: '#e040fb', desc: 'Hút 6% HP quái, hồi cho player'
      }
    },
    boss_viamdе: {
      petId:    'tame_viamdе',
      name:     '🔥 Viêm Đế',
      color:    '#ff4500',
      glowColor:'#ff8a65',
      passiveBonus: { atk: 12 },
      passiveDesc:  '+12 ATK',
      skill: {
        name: 'Thiêu Đốt', cd: 6000,
        type: 'dot', range: 120, dmgMul: 0.15, dotInterval: 500, dotDuration: 3000,
        color: '#ff4500', desc: 'Đốt liên tục 3s, 15% ATK/tick'
      }
    },
    boss_banghoang: {
      petId:    'tame_banghoang',
      name:     '❄️ Băng Hoàng',
      color:    '#00bcd4',
      glowColor:'#80deea',
      passiveBonus: { def: 8, speed: 0.2 },
      passiveDesc:  '+8 DEF +0.2 Speed',
      skill: {
        name: 'Bão Tuyết', cd: 9000,
        type: 'aoe', range: 150, dmgMul: 1.8,
        color: '#4dd0e1', desc: 'Bão tuyết AOE, 1.8x ATK'
      }
    },
    boss_thaicoma: {
      petId:    'tame_thaicoma',
      name:     '😈 Thái Cổ Ma',
      color:    '#8b0000',
      glowColor:'#ff1744',
      passiveBonus: { atk: 15, critRate: 0.05 },
      passiveDesc:  '+15 ATK +5% Crit',
      skill: {
        name: 'Ma Khí Bùng Phát', cd: 8000,
        type: 'aoe', range: 160, dmgMul: 2.5,
        color: '#ff1744', desc: 'Bùng phát ma khí, 2.5x ATK'
      }
    },
    boss_tienlong: {
      petId:    'tame_tienlong',
      name:     '✨ Tiên Long',
      color:    '#ffd700',
      glowColor:'#fff9c4',
      passiveBonus: { atk: 20, hp: 300 },
      passiveDesc:  '+20 ATK +300 HP',
      skill: {
        name: 'Tiên Quang', cd: 10000,
        type: 'aoe', range: 200, dmgMul: 3.0,
        color: '#ffd700', desc: 'Tiên quang tỏa rộng, 3.0x ATK'
      }
    }
  }
};

// ============================================================
// PHẦN 2 — LOGIC MODULE
// ============================================================

const BossTameSystem = {

  // ─── State ──────────────────────────────────────────────────
  state: {
    // Thần thú đang theo
    activeTame: null,     // petId string | null
    activeCfg:  null,     // config object

    // Prompt state
    promptActive:  false,
    promptEnemy:   null,
    promptTimer:   0,

    // AI / combat
    petX: 0, petY: 0,
    petFrame: 0, petFrameTimer: 0,
    skillCd: 0,
    attackTimer: 0,

    // DoT tracking
    dotTargets: [],
    // Freeze tracking
    frozenEnemies: [],

    // Thần thú đang đứng yên (chờ move)
    isMoving: false
  },

  // ─── Tất cả tame đã biết (inventory kiểu) ───────────────────
  // Lưu array petId đã thu phục (để biết từng beast đã có chưa)
  knownTames: [],

  // ─── Item TameBead ──────────────────────────────────────────
  _ensureItem() {
    if (!ITEMS.tameBead) {
      ITEMS.tameBead = {
        name:    '💠 Phong Ấn Châu',
        type:    'material',
        rarity:  'epic',
        desc:    'Viên châu chứa linh khí thuần khiết. Dùng để thu phục Boss làm Thần Thú.',
        effect:  { tameBead: true },
        sellPrice: 500,
        icon:    'tameBead'
      };
    }
  },

  // ─── Kiểm tra boss có thể thu phục ──────────────────────────
  canTame(enemy) {
    if (!enemy || !enemy.alive || !enemy.boss) return false;
    const cfg = BOSS_TAME_CONFIG.bossToTame[enemy.type];
    if (!cfg) return false;
    // HP threshold
    if (enemy.hp / enemy.maxHp > BOSS_TAME_CONFIG.hpThreshold) return false;
    // Phải có TameBead
    if (!Inventory.has('tameBead', 1)) return false;
    return true;
  },

  // ─── Hiện prompt thu phục ───────────────────────────────────
  showPrompt(enemy) {
    if (this.state.promptActive) return;
    const cfg = BOSS_TAME_CONFIG.bossToTame[enemy.type];
    if (!cfg) return;

    this.state.promptActive = true;
    this.state.promptEnemy  = enemy;
    this.state.promptTimer  = BOSS_TAME_CONFIG.captureWindow;

    // Đếm TameBead
    let beadCount = 0;
    try {
      if (Inventory.slots) {
        for (const s of Inventory.slots) {
          if (s && s.id === 'tameBead') beadCount += (s.count || 1);
        }
      }
    } catch(_) {}

    TamePromptUI.show(cfg, beadCount);
  },

  // ─── Xác nhận thu phục ──────────────────────────────────────
  confirmTame() {
    const enemy = this.state.promptEnemy;
    if (!enemy || !enemy.alive) { this.cancelPrompt(); return; }

    const cfg = BOSS_TAME_CONFIG.bossToTame[enemy.type];
    if (!cfg || !Inventory.has('tameBead', 1)) {
      UI.addLog('❌ Không đủ Phong Ấn Châu!', 'system');
      this.cancelPrompt();
      return;
    }

    // Trừ bead
    Inventory.remove('tameBead', 1);

    // Nếu đang có tame khác → replace
    if (this.state.activeTame && this.state.activeTame !== cfg.petId) {
      const oldName = this.state.activeCfg ? this.state.activeCfg.name : '?';
      this._dismount();
      UI.addLog('🔄 Thay thế ' + oldName + ' bằng ' + cfg.name, 'system');
    }

    // Mount
    this._mount(cfg, enemy);

    // Kill enemy
    Enemies.kill(enemy);

    this.cancelPrompt();
  },

  // ─── Hủy prompt ─────────────────────────────────────────────
  cancelPrompt() {
    TamePromptUI.hide();
    this.state.promptActive = false;
    this.state.promptEnemy  = null;
    this.state.promptTimer  = 0;
  },

  // ─── Mount thần thú ─────────────────────────────────────────
  _mount(cfg, enemy) {
    this.state.activeTame = cfg.petId;
    this.state.activeCfg  = cfg;
    this.state.petX   = enemy ? enemy.x : Player.x + 30;
    this.state.petY   = enemy ? enemy.y : Player.y;
    this.state.skillCd   = 0;
    this.state.attackTimer = 0;
    this.state.dotTargets   = [];
    this.state.frozenEnemies = [];

    // Inject vào PETS để Player.recalculateStats nhận bonus
    PETS[cfg.petId] = {
      id:       cfg.petId,
      name:     cfg.name,
      desc:     cfg.passiveDesc,
      price:    0,
      bonus:    { ...cfg.passiveBonus },
      expBonus: 0.05,
      color:    cfg.color,
      colorDark:cfg.color
    };

    // Ghi vào Player để hệ thống gốc nhận diện
    if (!Player.ownedPets.includes(cfg.petId)) Player.ownedPets.push(cfg.petId);
    Player.activePet = cfg.petId;
    Player.pet.x = this.state.petX;
    Player.pet.y = this.state.petY;

    if (!this.knownTames.includes(cfg.petId)) this.knownTames.push(cfg.petId);

    Player.recalculateStats();

    // Celebration
    for (let i = 0; i < 30; i++) {
      const a = Math.random() * Math.PI * 2;
      GameState.particles.push({
        x: this.state.petX, y: this.state.petY,
        vx: Math.cos(a) * 4, vy: Math.sin(a) * 4 - 2,
        life: 800, color: cfg.glowColor, size: 4 + Math.random() * 4
      });
    }

    UI.showNotification('✨ Thu Phục Thành Công!', cfg.name + ' đang theo bạn!');
    UI.addLog('✨ ' + cfg.name + ' đã trở thành Thần Thú của bạn!', 'realm');
  },

  // ─── Dismount thần thú ──────────────────────────────────────
  _dismount() {
    if (!this.state.activeTame) return;
    const cfg = this.state.activeCfg;

    // Unfreeze
    this.state.frozenEnemies.forEach(f => {
      if (f.enemy.alive) {
        f.enemy.color  = f.origColor;
        f.enemy.atk    = f.origAtk;
        f.enemy.aggroed = true;
      }
    });
    this.state.frozenEnemies = [];
    this.state.dotTargets    = [];

    // Xóa khỏi PETS tạm
    if (cfg) delete PETS[cfg.petId];

    // Reset Player pet
    Player.activePet = null;
    Player.recalculateStats();

    this.state.activeTame = null;
    this.state.activeCfg  = null;
    if (cfg) UI.addLog('🌟 ' + cfg.name + ' đã được thả tự do.', 'system');
  },

  // ─── Thả thần thú ───────────────────────────────────────────
  releaseTame() {
    if (!this.state.activeTame) return;
    this._dismount();
    UI.showNotification('🌟 Thả Thần Thú', 'Thần thú đã rời đi.');
  },

  // ─── Update mỗi frame ───────────────────────────────────────
  update(dt) {
    // Prompt timer
    if (this.state.promptActive) {
      this.state.promptTimer -= dt;
      if (this.state.promptTimer <= 0) this.cancelPrompt();

      // Nếu enemy đã chết trong khi đang prompt
      if (this.state.promptEnemy && !this.state.promptEnemy.alive) {
        this.cancelPrompt();
      }
    }

    // Kiểm tra boss có thể thu phục (auto detect)
    if (!this.state.promptActive) {
      for (const e of Enemies.list) {
        if (!e.alive || !e.boss) continue;
        if (this.canTame(e)) {
          this.showPrompt(e);
          break;
        }
      }
    }

    if (!this.state.activeTame || !Player.alive) return;

    // Di chuyển pet theo player
    this._updatePetMovement(dt);

    // Tấn công cơ bản
    this._updateAttack(dt);

    // Skill
    this._updateSkill(dt);

    // DoT
    this._updateDots(dt);

    // Freeze
    this._updateFreezes(dt);
  },

  // ─── Pet follow player ──────────────────────────────────────
  _updatePetMovement(dt) {
    const targetX = Player.x - 28;
    const targetY = Player.y + 10;
    const dx = targetX - this.state.petX;
    const dy = targetY - this.state.petY;
    const dist = Math.sqrt(dx*dx + dy*dy);

    if (dist > 8) {
      const spd = Math.min(dist, 3.5);
      this.state.petX += (dx/dist) * spd;
      this.state.petY += (dy/dist) * spd;
      this.state.isMoving = true;
    } else {
      this.state.isMoving = false;
    }

    // Sync với Player.pet để hệ thống gốc render đúng vị trí
    Player.pet.x = this.state.petX;
    Player.pet.y = this.state.petY;

    // Frame animation
    this.state.petFrameTimer += dt;
    if (this.state.petFrameTimer > 200) {
      this.state.petFrame = (this.state.petFrame + 1) % 2;
      this.state.petFrameTimer = 0;
    }
  },

  // ─── Basic attack ───────────────────────────────────────────
  _updateAttack(dt) {
    this.state.attackTimer -= dt;
    if (this.state.attackTimer > 0) return;

    const nearest = Enemies.findNearest(
      this.state.petX, this.state.petY, 100, e => e.alive
    );
    if (!nearest) return;

    const dmg = Math.floor(Player.atk * 0.35);
    Enemies.damage(nearest, dmg, false, this.state.activeCfg.color);
    this.state.attackTimer = 1500;

    GameState.particles.push({
      x: this.state.petX, y: this.state.petY,
      vx: (nearest.x - this.state.petX) / 15,
      vy: (nearest.y - this.state.petY) / 15,
      life: 200, color: this.state.activeCfg.glowColor, size: 3
    });
  },

  // ─── Skill ──────────────────────────────────────────────────
  _updateSkill(dt) {
    if (this.state.skillCd > 0) {
      this.state.skillCd -= dt;
      return;
    }

    const cfg  = this.state.activeCfg;
    const sk   = cfg.skill;
    const nearest = Enemies.findNearest(
      this.state.petX, this.state.petY, sk.range, e => e.alive
    );
    if (!nearest) return;

    this.state.skillCd = sk.cd;

    switch (sk.type) {

      case 'melee': {
        const dmg = Math.floor(Player.atk * sk.dmgMul);
        Enemies.damage(nearest, dmg, Utils.chance(Player.critRate), sk.color);
        this._burst(this.state.petX, this.state.petY, sk.color, 8);
        UI.addLog('⚡ ' + cfg.name + ' dùng ' + sk.name + '!', 'combat');
        break;
      }

      case 'aoe': {
        const targets = Enemies.findInRange(this.state.petX, this.state.petY, sk.range);
        const dmg = Math.floor(Player.atk * sk.dmgMul);
        targets.forEach(({ enemy }) => {
          Enemies.damage(enemy, dmg, false, sk.color);
          this._burst(enemy.x, enemy.y, sk.color, 5);
        });
        Game.spawnDamageNumber(this.state.petX, this.state.petY - 30,
          sk.name + '!', sk.color);
        UI.addLog('💥 ' + cfg.name + ' dùng ' + sk.name + ' (x' + targets.length + ')!', 'combat');
        break;
      }

      case 'breath': {
        // Nhắm thẳng theo hướng từ pet → nearest
        const targets = Enemies.findInRange(this.state.petX, this.state.petY, sk.range);
        const dmg = Math.floor(Player.atk * sk.dmgMul);
        targets.forEach(({ enemy }) => Enemies.damage(enemy, dmg, false, sk.color));
        // Breath particles
        const angle = Math.atan2(nearest.y - this.state.petY, nearest.x - this.state.petX);
        for (let i = 0; i < 14; i++) {
          const t = i / 14;
          GameState.particles.push({
            x: this.state.petX + Math.cos(angle) * t * sk.range,
            y: this.state.petY + Math.sin(angle) * t * sk.range,
            vx: (Math.random()-0.5)*1.5, vy: (Math.random()-0.5)*1.5-0.5,
            life: 400, color: sk.color, size: 4 + Math.random()*3
          });
        }
        UI.addLog('🔥 ' + cfg.name + ' dùng ' + sk.name + '!', 'combat');
        break;
      }

      case 'drain': {
        const dmg  = Math.floor(nearest.maxHp * (sk.drainPct || 0.06));
        Enemies.damage(nearest, dmg, false, sk.color);
        const heal = Math.floor(dmg * 0.5);
        Player.hp  = Math.min(Player.maxHp, Player.hp + heal);
        Game.spawnDamageNumber(Player.x, Player.y - 40, '+' + heal, '#42a5f5');
        // Beam
        for (let i = 0; i < 10; i++) {
          const t = i/10;
          GameState.particles.push({
            x: nearest.x + (Player.x - nearest.x)*t,
            y: nearest.y + (Player.y - nearest.y)*t,
            vx:0, vy:-0.5, life:400, color:sk.color, size:2+Math.random()*2
          });
        }
        UI.addLog('💧 ' + cfg.name + ': ' + sk.name + '!', 'heal');
        break;
      }

      case 'freeze': {
        const targets = Enemies.findInRange(this.state.petX, this.state.petY, sk.range);
        targets.forEach(({ enemy }) => {
          if (this.state.frozenEnemies.some(f => f.enemy === enemy)) return;
          this.state.frozenEnemies.push({
            enemy,
            endTime:   GameState.time + (sk.freezeDuration || 2000),
            origColor: enemy.color,
            origAtk:   enemy.atk
          });
          enemy.color   = '#80deea';
          enemy.atk     = 0;
          enemy.aggroed = false;
          this._burst(enemy.x, enemy.y, '#80deea', 6);
        });
        UI.addLog('❄ ' + cfg.name + ': ' + sk.name + '! x' + targets.length, 'combat');
        UI.showNotification('❄ ' + sk.name, targets.length + ' kẻ địch bị đóng băng!');
        break;
      }

      case 'dot': {
        const dmgPerTick = Math.floor(Player.atk * sk.dmgMul);
        this.state.dotTargets.push({
          enemy:       nearest,
          damage:      dmgPerTick,
          endTime:     GameState.time + (sk.dotDuration || 3000),
          nextTickTime:GameState.time + (sk.dotInterval  || 500)
        });
        this._burst(nearest.x, nearest.y, sk.color, 8);
        UI.addLog('🔥 ' + cfg.name + ': ' + sk.name + '!', 'combat');
        break;
      }
    }
  },

  // ─── DoT tick ───────────────────────────────────────────────
  _updateDots(dt) {
    for (let i = this.state.dotTargets.length - 1; i >= 0; i--) {
      const d = this.state.dotTargets[i];
      if (!d.enemy.alive || GameState.time > d.endTime) {
        this.state.dotTargets.splice(i, 1); continue;
      }
      if (GameState.time >= d.nextTickTime) {
        Enemies.damage(d.enemy, d.damage, false, '#ff4500');
        d.nextTickTime += 500;
        GameState.particles.push({
          x: d.enemy.x + (Math.random()-0.5)*10,
          y: d.enemy.y - d.enemy.size,
          vx: (Math.random()-0.5), vy: -1.5,
          life:300, color:'#ff4500', size:2+Math.random()*2
        });
      }
    }
  },

  // ─── Freeze tick ────────────────────────────────────────────
  _updateFreezes(dt) {
    for (let i = this.state.frozenEnemies.length - 1; i >= 0; i--) {
      const f = this.state.frozenEnemies[i];
      if (GameState.time > f.endTime || !f.enemy.alive) {
        if (f.enemy.alive) {
          f.enemy.color  = f.origColor;
          f.enemy.atk    = f.origAtk;
          f.enemy.aggroed = true;
        }
        this.state.frozenEnemies.splice(i, 1);
      }
    }
  },

  // ─── Particle helper ────────────────────────────────────────
  _burst(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      GameState.particles.push({
        x, y,
        vx: Math.cos(a) * (2 + Math.random()*2),
        vy: Math.sin(a) * (2 + Math.random()*2) - 1,
        life: 400, color, size: 2 + Math.random()*3
      });
    }
  },

  // ─── Render thần thú ────────────────────────────────────────
  renderTame(ctx) {
    if (!this.state.activeTame || !Player.alive) return;
    const cfg = this.state.activeCfg;
    if (!cfg) return;

    const cx = this.state.petX - GameState.camera.x;
    const cy = this.state.petY - GameState.camera.y;

    // Glow aura
    const pulse = 0.3 + Math.sin(GameState.time/250) * 0.2;
    ctx.save();
    ctx.globalAlpha = pulse * 0.5;
    ctx.fillStyle   = cfg.glowColor;
    ctx.beginPath();
    ctx.arc(cx, cy - 8, 18, 0, Math.PI*2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Body — simple pixel block với màu thần thú
    const s = 12;
    ctx.fillStyle = cfg.color;
    ctx.fillRect(cx - s/2, cy - s, s, s);

    // Mắt
    ctx.fillStyle = '#fff';
    ctx.fillRect(cx - s/2 + 2, cy - s + 3, 3, 3);
    ctx.fillRect(cx - s/2 + 7, cy - s + 3, 3, 3);
    ctx.fillStyle = '#000';
    ctx.fillRect(cx - s/2 + 3, cy - s + 4, 2, 2);
    ctx.fillRect(cx - s/2 + 8, cy - s + 4, 2, 2);

    // Chân (animation)
    ctx.fillStyle = cfg.color;
    const legOff = this.state.isMoving ? (this.state.petFrame === 0 ? 2 : -2) : 0;
    ctx.fillRect(cx - 6,     cy,     3, 4 + legOff);
    ctx.fillRect(cx + 3,     cy,     3, 4 - legOff);

    // Tên
    ctx.globalAlpha = 1;
    ctx.font        = 'bold 9px monospace';
    ctx.fillStyle   = cfg.color;
    ctx.textAlign   = 'center';
    ctx.fillText(cfg.name, cx, cy - s - 6);

    // Skill CD badge
    const cdSec = Math.max(0, Math.ceil(this.state.skillCd / 1000));
    if (cdSec > 0) {
      ctx.font      = '8px monospace';
      ctx.fillStyle = '#f44336';
      ctx.fillText('⏳' + cdSec + 's', cx, cy - s - 16);
    } else {
      ctx.font      = '8px monospace';
      ctx.fillStyle = '#4caf50';
      ctx.fillText('⚡Ready', cx, cy - s - 16);
    }

    ctx.restore();

    // Render frozen enemies overlay
    this.state.frozenEnemies.forEach(f => {
      if (!f.enemy.alive) return;
      const ex = f.enemy.x - GameState.camera.x;
      const ey = f.enemy.y - GameState.camera.y;
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.fillStyle   = '#80deea';
      ctx.fillRect(ex - f.enemy.size, ey - f.enemy.size, f.enemy.size*2, f.enemy.size*2);
      ctx.globalAlpha = 1;
      ctx.restore();
    });
  },

  // ─── Thêm section Thần Thú vào Character panel ──────────────
  renderCharSection() {
    const charStats = document.getElementById('charStats');
    if (!charStats) return;

    const old = document.getElementById('bossTameCharSection');
    if (old) old.remove();

    const sec = document.createElement('div');
    sec.id    = 'bossTameCharSection';
    sec.style.cssText = 'margin-top:12px;padding-top:10px;border-top:1px solid #333;';

    const title = document.createElement('div');
    title.style.cssText = 'color:#f0c040;font-weight:bold;font-size:12px;margin-bottom:8px;';
    title.textContent   = '🐉 Thần Thú Đang Theo';
    sec.appendChild(title);

    if (this.state.activeTame) {
      const cfg   = this.state.activeCfg;
      const cdSec = Math.max(0, Math.ceil(this.state.skillCd / 1000));

      const info = document.createElement('div');
      info.style.cssText = 'font-size:11px;color:#ccc;';
      info.innerHTML = `
        <div style="color:${cfg.color};font-weight:bold;font-size:13px;margin-bottom:4px;">${cfg.name}</div>
        <div style="color:#8ef;font-size:10px;margin-bottom:6px;">✦ Bị động: ${cfg.passiveDesc}</div>
        <div style="background:#111;border-radius:6px;padding:6px;margin-bottom:8px;font-size:10px;">
          <div style="color:#ff9800;font-weight:bold;">⚡ ${cfg.skill.name}</div>
          <div style="color:#aaa;margin-top:2px;">${cfg.skill.desc}</div>
          <div style="margin-top:3px;color:${cdSec>0?'#f44336':'#4caf50'};">
            ${cdSec>0 ? 'CD: '+cdSec+'s' : '✓ Sẵn sàng'}
          </div>
        </div>
      `;

      const releaseBtn       = document.createElement('button');
      releaseBtn.textContent = '🌟 Thả Ra';
      releaseBtn.style.cssText = [
        'width:100%;padding:8px;border:1px solid #ff9800;border-radius:6px;',
        'background:rgba(255,152,0,0.15);color:#ff9800;font-size:11px;',
        'cursor:pointer;font-family:inherit;'
      ].join('');
      releaseBtn.onclick = () => {
        if (confirm('Thả ' + cfg.name + ' về tự nhiên?')) {
          BossTameSystem.releaseTame();
          UI.renderCharacter();
        }
      };

      info.appendChild(releaseBtn);
      sec.appendChild(info);

    } else {
      const empty = document.createElement('div');
      empty.style.cssText = 'font-size:10px;color:#888;';
      empty.innerHTML = [
        'Chưa có Thần Thú.<br>',
        'Đánh Boss xuống &lt;15% HP + có <b style="color:#f0c040">💠 Phong Ấn Châu</b>',
        ' để thu phục.<br>',
        '<span style="color:#666;font-size:9px;">Boss drop Phong Ấn Châu khi bị hạ.</span>'
      ].join('');
      sec.appendChild(empty);

      // Danh sách thần thú đã biết
      if (this.knownTames.length > 0) {
        const label = document.createElement('div');
        label.style.cssText = 'color:#888;font-size:9px;margin-top:8px;margin-bottom:4px;';
        label.textContent   = 'Đã từng thu phục:';
        sec.appendChild(label);

        this.knownTames.forEach(pid => {
          const c = this._cfgByPetId(pid);
          if (!c) return;
          const row = document.createElement('div');
          row.style.cssText = 'font-size:10px;margin:2px 0;';
          row.innerHTML     = `<span style="color:${c.color};">${c.name}</span>`;

          // Nút triệu hồi lại nếu không đang active
          const reBtn       = document.createElement('button');
          reBtn.textContent = '↩ Triệu hồi lại';
          reBtn.style.cssText = [
            'margin-left:8px;padding:2px 6px;border:1px solid '+c.color+';',
            'background:transparent;color:'+c.color+';font-size:9px;',
            'border-radius:4px;cursor:pointer;font-family:inherit;'
          ].join('');
          reBtn.onclick = () => {
            // Mount lại không cần enemy, không tốn bead
            BossTameSystem._mount(c, null);
            UI.renderCharacter();
          };

          row.appendChild(reBtn);
          sec.appendChild(row);
        });
      }
    }

    charStats.appendChild(sec);
  },

  // ─── Tìm config theo petId ───────────────────────────────────
  _cfgByPetId(petId) {
    for (const key in BOSS_TAME_CONFIG.bossToTame) {
      if (BOSS_TAME_CONFIG.bossToTame[key].petId === petId) {
        return BOSS_TAME_CONFIG.bossToTame[key];
      }
    }
    return null;
  },

  // ─── Save/Load ───────────────────────────────────────────────
  getSaveData() {
    return {
      activeTame:  this.state.activeTame,
      knownTames:  [...this.knownTames]
    };
  },

  loadSaveData(data) {
    if (!data) return;
    this.knownTames = data.knownTames || [];
    if (data.activeTame) {
      const cfg = this._cfgByPetId(data.activeTame);
      if (cfg) this._mount(cfg, null);
    }
  },

  // ─── Init ────────────────────────────────────────────────────
  init() {
    this._ensureItem();
    this._hookEnemiesKill();
    this._hookEnemiesDamage();
    this._hookGameUpdate();
    this._hookGameRender();
    this._hookPlayerStats();
    this._hookSaveLoad();
    this._hookCharPanel();
    TamePromptUI.inject();
  },

  // ─── Hook: Enemies.kill — drop TameBead ─────────────────────
  _hookEnemiesKill() {
    const _orig = Enemies.kill.bind(Enemies);
    const self  = this;
    Enemies.kill = function(enemy) {
      _orig(enemy);
      if (!enemy || !enemy.boss) return;
      const cfg = BOSS_TAME_CONFIG.bossToTame[enemy.type];
      if (!cfg) return;
      // Drop TameBead nếu không được thu phục
      if (Utils.chance(BOSS_TAME_CONFIG.tameBeadDropChance)) {
        Inventory.add('tameBead', 1);
        UI.addLog('💠 Nhận Phong Ấn Châu từ ' + enemy.name + '!', 'item');
      }
    };
  },

  // ─── Hook: Enemies.damage — kiểm tra HP threshold ───────────
  _hookEnemiesDamage() {
    const _orig = Enemies.damage.bind(Enemies);
    const self  = this;
    Enemies.damage = function(enemy, amount, isCrit, color) {
      _orig(enemy, amount, isCrit, color);
      if (!enemy || !enemy.alive || !enemy.boss) return;
      if (self.state.promptActive) return;
      if (self.canTame(enemy)) self.showPrompt(enemy);
    };
  },

  // ─── Hook: Game.update ───────────────────────────────────────
  _hookGameUpdate() {
    const _orig = Game.update.bind(Game);
    const self  = this;
    Game.update = function(dt) {
      _orig(dt);
      if (GameState.running) self.update(dt);
    };
  },

  // ─── Hook: Game.renderPet — thay render bằng thần thú ────────
  _hookGameRender() {
    const self = this;

    // Hook vào renderPlayer để render tame sau player
    const _origRenderPlayer = Game.renderPlayer.bind(Game);
    Game.renderPlayer = function() {
      _origRenderPlayer();
      // Render tame trong world space (camera đang active)
      self.renderTame(this.ctx);
    };
  },

  // ─── Hook: Player.recalculateStats ───────────────────────────
  _hookPlayerStats() {
    const _orig = Player.recalculateStats.bind(Player);
    const self  = this;
    Player.recalculateStats = function() {
      _orig();
      if (!self.state.activeCfg) return;
      const pb = self.state.activeCfg.passiveBonus;
      // Apply trực tiếp lên stats (cộng thêm, không nhân)
      if (pb.hp)       { this.maxHp += pb.hp; this.hp = Math.min(this.hp, this.maxHp); }
      if (pb.atk)      { this.atk   += pb.atk; }
      if (pb.def)      { this.def   += pb.def; }
      if (pb.speed)    { this.speed += pb.speed; }
      if (pb.critRate) { this.critRate += pb.critRate; }
    };
  },

  // ─── Hook: Player.getSaveData / loadSaveData ─────────────────
  _hookSaveLoad() {
    const _origGet  = Player.getSaveData.bind(Player);
    const _origLoad = Player.loadSaveData.bind(Player);
    const self      = this;

    Player.getSaveData = function() {
      const d = _origGet();
      d.bossTameData = self.getSaveData();
      return d;
    };

    Player.loadSaveData = function(d) {
      _origLoad(d);
      if (d && d.bossTameData) {
        setTimeout(() => self.loadSaveData(d.bossTameData), 50);
      }
    };
  },

  // ─── Hook: UI.renderCharacter ────────────────────────────────
  _hookCharPanel() {
    if (typeof UI === 'undefined' || typeof UI.renderCharacter !== 'function') return;
    const _orig = UI.renderCharacter.bind(UI);
    const self  = this;
    UI.renderCharacter = function() {
      _orig();
      self.renderCharSection();
    };
  }
};

// ============================================================
// PHẦN 3 — CAPTURE PROMPT UI
// ============================================================

const TamePromptUI = {
  _anim: null,

  inject() {
    if (document.getElementById('bossTamePrompt')) return;
    const div = document.createElement('div');
    div.innerHTML = `
      <div id="bossTamePrompt" style="
        display:none;position:fixed;top:50%;left:50%;
        transform:translate(-50%,-60%);
        background:linear-gradient(135deg,#1a1a2e,#16213e);
        border:3px solid #f0c040;border-radius:16px;
        padding:22px 24px;min-width:290px;text-align:center;
        z-index:160;font-family:'Courier New',monospace;color:#fff;
        box-shadow:0 0 50px rgba(240,192,64,0.35);">

        <div id="tamePromptEmoji" style="font-size:38px;margin-bottom:6px;">🐉</div>
        <div id="tamePromptName"
          style="font-size:16px;font-weight:bold;color:#f0c040;margin-bottom:4px;"></div>
        <div style="color:#888;font-size:10px;margin-bottom:4px;">
          HP thấp — có thể Thu Phục!
        </div>
        <div style="color:#8ef;font-size:10px;margin-bottom:10px;">
          Tốn: <b style="color:#f0c040">💠 Phong Ấn Châu x1</b>
          &nbsp;(<span id="tameBeadCount">?</span> trong túi)
        </div>

        <!-- Timer bar -->
        <div style="height:5px;background:#111;border-radius:3px;margin-bottom:14px;overflow:hidden;">
          <div id="tameTimerBar"
            style="height:100%;width:100%;
            background:linear-gradient(90deg,#f0c040,#ff9800);
            transition:width 0.08s linear;"></div>
        </div>

        <div style="display:flex;gap:10px;">
          <button id="tameConfirmBtn" style="
            flex:1;padding:11px;border:2px solid #4caf50;
            background:rgba(76,175,80,0.2);border-radius:9px;
            color:#4caf50;font-size:13px;font-weight:bold;
            cursor:pointer;font-family:inherit;">
            ✨ THU PHỤC
          </button>
          <button id="tameCancelBtn" style="
            flex:1;padding:11px;border:2px solid #f44336;
            background:rgba(244,67,54,0.15);border-radius:9px;
            color:#f44336;font-size:12px;
            cursor:pointer;font-family:inherit;">
            ✕ Bỏ qua
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(div);

    document.getElementById('tameConfirmBtn')
      .addEventListener('click', () => BossTameSystem.confirmTame());
    document.getElementById('tameCancelBtn')
      .addEventListener('click', () => BossTameSystem.cancelPrompt());
  },

  show(cfg, beadCount) {
    const el = document.getElementById('bossTamePrompt');
    if (!el) return;

    document.getElementById('tamePromptEmoji').textContent = cfg.name.charAt(0) === '🐺'
      ? '🐺' : cfg.name.charAt(0) === '👹' ? '👹'
      : cfg.name.charAt(0) === '❄' ? '❄️'
      : cfg.name.charAt(0) === '🐉' ? '🐉'
      : cfg.name.charAt(0) === '✨' ? '✨'
      : '🐉';
    document.getElementById('tamePromptName').textContent  = cfg.name;
    document.getElementById('tameBeadCount').textContent   = beadCount;
    document.getElementById('tameTimerBar').style.width    = '100%';

    el.style.display = 'block';
    this._runTimer(BOSS_TAME_CONFIG.captureWindow);
  },

  _runTimer(duration) {
    if (this._anim) cancelAnimationFrame(this._anim);
    const start = Date.now();
    const bar   = document.getElementById('tameTimerBar');
    const tick  = () => {
      const pct = Math.max(0, 100 - ((Date.now() - start) / duration) * 100);
      if (bar) bar.style.width = pct + '%';
      if (pct > 0 && BossTameSystem.state.promptActive) {
        this._anim = requestAnimationFrame(tick);
      }
    };
    this._anim = requestAnimationFrame(tick);
  },

  hide() {
    const el = document.getElementById('bossTamePrompt');
    if (el) el.style.display = 'none';
    if (this._anim) { cancelAnimationFrame(this._anim); this._anim = null; }
  }
};

// ============================================================
// PHẦN 4 — KHỞI ĐỘNG
// ============================================================

(function () {
  function tryInit() {
    if (typeof Game       === 'undefined') { setTimeout(tryInit, 200); return; }
    if (typeof Player     === 'undefined') { setTimeout(tryInit, 200); return; }
    if (typeof Enemies    === 'undefined') { setTimeout(tryInit, 200); return; }
    if (typeof Inventory  === 'undefined') { setTimeout(tryInit, 200); return; }
    if (typeof UI         === 'undefined') { setTimeout(tryInit, 200); return; }
    if (typeof ITEMS      === 'undefined') { setTimeout(tryInit, 200); return; }

    // Wrap Game.init để init sau khi game sẵn sàng
    const _origInit = Game.init.bind(Game);
    Game.init = function () {
      _origInit();
      BossTameSystem.init();
    };

    // Nếu game đã init rồi (load script muộn) thì init ngay
    if (typeof GameState !== 'undefined' && GameState.running !== undefined) {
      BossTameSystem.init();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(tryInit, 100));
  } else {
    setTimeout(tryInit, 100);
  }
})();
// ===== CHANGES: Xóa 2 console.log debug. Xóa comment usage cuối file. Xóa biến dead _origRender trong _hookGameRender() — biến này được Game.render.bind() nhưng không bao giờ được gọi, chỉ có _origRenderPlayer mới được dùng. =====
