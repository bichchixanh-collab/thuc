// ============================================================
//  feature_dungeon.js — Hệ Thống Bí Cảnh (Dungeon System)
//  Tu Tiên Kiếm Hiệp — Pure vanilla JS, monkey-patch only
// ============================================================

// ============================================================
// PHẦN 1 — DATA & CONFIG
// ============================================================

var DUNGEON_CONFIG = {

  // --- Portal spawn timing ---
  minInterval:     5  * 60 * 1000,   // 5 phút
  maxInterval:     10 * 60 * 1000,   // 10 phút
  portalLifetime:  3  * 60 * 1000,   // portal tồn tại 3 phút
  dungeonDuration: 5  * 60 * 1000,   // thời gian trong dungeon 5 phút
  onlyFromMapIndex: 2,                // chỉ spawn từ U Minh Cốc (index 2+)

  // --- Portal grades ---
  portalGrades: {
    normal: {
      name: 'Bình Thường',
      color: '#4caf50',
      enemyLevelBonus: 0,
      expMul: 1,
      dropRarityBoost: 0,
      portalChance: 0.50
    },
    rare: {
      name: 'Hiếm',
      color: '#2196f3',
      enemyLevelBonus: 2,
      expMul: 2,
      dropRarityBoost: 0.1,
      portalChance: 0.30
    },
    epic: {
      name: 'Sử Thi',
      color: '#9c27b0',
      enemyLevelBonus: 5,
      expMul: 3,
      dropRarityBoost: 0.2,
      portalChance: 0.15
    },
    legendary: {
      name: 'Huyền Thoại',
      color: '#f0c040',
      enemyLevelBonus: 10,
      expMul: 5,
      dropRarityBoost: 0.4,
      portalChance: 0.05
    }
  },

  // --- Party classes ---
  partyClasses: {
    tank: {
      name: 'Hộ Pháp',
      role: 'tank',
      hpMul: 2.0, atkMul: 0.6, defMul: 2.0, speed: 1.8,
      size: 14, color: '#607d8b',
      skills: [
        { name: 'Khiêu Chiến', cd: 3000, effect: 'taunt', range: 120 },
        { name: 'Thiết Bích',  cd: 8000, effect: 'shield', duration: 3000 }
      ],
      aggroRadius: 200,
      respawnTime: 8000
    },
    healer: {
      name: 'Dược Sư',
      role: 'healer',
      hpMul: 0.9, atkMul: 0.4, defMul: 0.8, speed: 2.2,
      size: 10, color: '#4caf50',
      skills: [
        { name: 'Trị Thương',   cd: 3000,  effect: 'heal',    healPct: 0.25, healMpPct: 0.15, range: 150 },
        { name: 'Đại Hồi Xuân', cd: 12000, effect: 'healAll', healPct: 0.40, healMpPct: 0.25, range: 200 }
      ],
      followDistance: 80,
      respawnTime: 10000
    },
    dps: {
      name: 'Kiếm Khách',
      role: 'dps',
      hpMul: 1.0, atkMul: 1.8, defMul: 0.7, speed: 2.8,
      size: 11, color: '#f44336',
      skills: [
        { name: 'Liệt Kiếm',  cd: 4000,  effect: 'attack', dmgMul: 2.5, range: 80 },
        { name: 'Cuồng Phong', cd: 10000, effect: 'aoe',    dmgMul: 1.8, range: 120 }
      ],
      attackRange: 70,
      respawnTime: 6000
    },
    support: {
      name: 'Pháp Sư',
      role: 'support',
      hpMul: 0.8, atkMul: 0.8, defMul: 0.6, speed: 2.4,
      size: 10, color: '#9c27b0',
      skills: [
        { name: 'Tốc Công Thuật', cd: 8000,  effect: 'buffAtk',   buffMul: 1.3, duration: 5000 },
        { name: 'Phá Giáp Thuật', cd: 10000, effect: 'debuffDef', debuffMul: 0.7, range: 150 }
      ],
      followDistance: 100,
      respawnTime: 8000
    }
  },

  // --- Reward multiplier theo party size (index = total party size) ---
  rewardMultiplier: {
    1: 2.0,   // solo
    2: 1.5,
    3: 1.2,
    4: 1.0
  }
};

// ============================================================
// PHẦN 2 — LOGIC MODULE
// ============================================================

// ─── Utility nội bộ ─────────────────────────────────────────
function _dungeonDist(ax, ay, bx, by) {
  var dx = ax - bx, dy = ay - by;
  return Math.sqrt(dx * dx + dy * dy);
}

function _dungeonRandInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function _dungeonRandRange(min, max) {
  return min + Math.random() * (max - min);
}

// ─── 2A: Portal System + 2C: Dungeon Session ────────────────
var DungeonSystem = {

  // --- Portal state ---
  portalState: {
    active: false,
    x: 0, y: 0,
    grade: 'normal',
    spawnTime: 0,
    nextSpawnTime: 0
  },

  // --- Session state ---
  sessionState: {
    active: false,
    grade: null,
    timeRemaining: 0,
    enemiesTotal: 0,
    enemiesKilled: 0,
    savedMapState: null,
    savedPlayerPos: null,
    rewards: { exp: 0, gold: 0, items: [] }
  },

  // ── Init ──────────────────────────────────────────────────
  init: function () {
    this.portalState.active = false;
    this.portalState.nextSpawnTime = 0;
    this.sessionState.active = false;
    this.initPortalTimer();
  },

  // ── Portal timer ─────────────────────────────────────────
  initPortalTimer: function () {
    var gs = (typeof GameState !== 'undefined') ? GameState : null;
    var now = gs ? gs.time : 0;
    this.portalState.nextSpawnTime = now + _dungeonRandRange(
      DUNGEON_CONFIG.minInterval,
      DUNGEON_CONFIG.maxInterval
    );
  },

  // ── Roll portal grade ────────────────────────────────────
  _rollGrade: function () {
    var r = Math.random();
    var grades = DUNGEON_CONFIG.portalGrades;
    // cumulative: legendary → epic → rare → normal
    if (r < grades.legendary.portalChance)                              return 'legendary';
    if (r < grades.legendary.portalChance + grades.epic.portalChance)  return 'epic';
    if (r < grades.legendary.portalChance + grades.epic.portalChance
              + grades.rare.portalChance)                               return 'rare';
    return 'normal';
  },

  // ── Try spawn portal ─────────────────────────────────────
  trySpawnPortal: function () {
    if (typeof Maps === 'undefined' || typeof GameState === 'undefined') return;
    if (Maps.currentIndex < DUNGEON_CONFIG.onlyFromMapIndex) return;
    if (this.portalState.active) return;
    if (this.sessionState.active) return;
    if (GameState.time < this.portalState.nextSpawnTime) return;

    var gradeKey = this._rollGrade();
    var grade    = DUNGEON_CONFIG.portalGrades[gradeKey];

    // Tìm vị trí hợp lệ trên map (tránh nước, tránh gần 400,400)
    var px = 400, py = 400;
    var attempts = 0;
    var tileSize = (typeof CONFIG !== 'undefined' && CONFIG.TILE_SIZE) ? CONFIG.TILE_SIZE : 32;
    var mapW = Maps.tiles ? Maps.tiles[0].length * tileSize : 800;
    var mapH = Maps.tiles ? Maps.tiles.length    * tileSize : 800;

    while (attempts < 50) {
      var tx = _dungeonRandRange(100, mapW - 100);
      var ty = _dungeonRandRange(100, mapH - 100);
      if (_dungeonDist(tx, ty, 400, 400) < 200) { attempts++; continue; }
      // kiểm tra tile nước
      var col = Math.floor(tx / tileSize);
      var row = Math.floor(ty / tileSize);
      if (Maps.tiles && Maps.tiles[row] && Maps.tiles[row][col] === 'water') {
        attempts++; continue;
      }
      px = tx; py = ty;
      break;
    }

    this.portalState.active    = true;
    this.portalState.x         = px;
    this.portalState.y         = py;
    this.portalState.grade     = gradeKey;
    this.portalState.spawnTime = GameState.time;

    if (typeof UI !== 'undefined') {
      UI.addLog('🌀 Bí Cảnh [' + grade.name + '] xuất hiện!', 'system');
      UI.showNotification('🌀 Bí Cảnh Xuất Hiện!', grade.name + ' — Chạm để vào');
    }

    // Schedule next
    this.portalState.nextSpawnTime = GameState.time + _dungeonRandRange(
      DUNGEON_CONFIG.minInterval,
      DUNGEON_CONFIG.maxInterval
    );
  },

  // ── Check portal expiry ──────────────────────────────────
  checkPortalExpiry: function () {
    if (!this.portalState.active) return;
    if (typeof GameState === 'undefined') return;
    var age = GameState.time - this.portalState.spawnTime;
    if (age > DUNGEON_CONFIG.portalLifetime) {
      this.portalState.active = false;
      if (typeof UI !== 'undefined') {
        UI.addLog('🌀 Bí Cảnh đã biến mất...', 'system');
      }
    }
  },

  // ── Check player near portal ─────────────────────────────
  checkPlayerNearPortal: function () {
    if (!this.portalState.active) return false;
    if (typeof Player === 'undefined') return false;
    var d = _dungeonDist(Player.x, Player.y, this.portalState.x, this.portalState.y);
    return d < 60;
  },

  // ── Handle tap on portal ─────────────────────────────────
  handlePortalTap: function (worldX, worldY) {
    if (!this.portalState.active) return false;
    if (this.sessionState.active) return false;
    var d = _dungeonDist(worldX, worldY, this.portalState.x, this.portalState.y);
    if (d < 80) {
      PartySelectUI.show(this.portalState.grade);
      return true;
    }
    return false;
  },

  // ── Enter dungeon ────────────────────────────────────────
  enter: function (gradeKey) {
    if (typeof Maps === 'undefined' || typeof Player === 'undefined') return;
    if (typeof Enemies === 'undefined') return;

    var grade = DUNGEON_CONFIG.portalGrades[gradeKey];
    var ss    = this.sessionState;

    // Lưu trạng thái gốc
    ss.savedMapState  = { mapIndex: Maps.currentIndex };
    ss.savedPlayerPos = { x: Player.x, y: Player.y };

    // Khởi session
    ss.active        = true;
    ss.grade         = gradeKey;
    ss.timeRemaining = DUNGEON_CONFIG.dungeonDuration;
    ss.rewards       = { exp: 0, gold: 0, items: [] };

    // Tạo party members
    PartySystem.members = [];
    var sel = PartySystem.selectedClasses || [];
    for (var i = 0; i < sel.length; i++) {
      PartySystem.members.push(PartySystem.createMember(sel[i]));
    }

    // Tạo lại map (giữ nguyên index)
    Maps.generate();

    // Xóa enemy cũ, spawn lại với số lượng cao hơn
    Enemies.list = [];
    var enemyCount = 20 + grade.enemyLevelBonus * 2;
    var levelMul   = 1 + grade.enemyLevelBonus * 0.1;
    var mapData    = Maps.getCurrent ? Maps.getCurrent() : null;
    var enemyTypes = mapData && mapData.enemies ? mapData.enemies : [];
    if (enemyTypes.length === 0 && typeof Enemies.types !== 'undefined') {
      enemyTypes = Object.keys(Enemies.types);
    }

    for (var j = 0; j < enemyCount; j++) {
      var typeKey = enemyTypes[_dungeonRandInt(0, enemyTypes.length - 1)];
      if (typeKey && typeof Enemies.spawn === 'function') {
        Enemies.spawn(typeKey, levelMul, Player.level);
      }
    }

    // Tắt NPC
    if (typeof NPC !== 'undefined') { NPC.list = []; }

    // Reset Player vị trí
    Player.x = 400; Player.y = 400;

    // Tính base rewards
    var totalExp  = 0, totalGold = 0;
    for (var k = 0; k < Enemies.list.length; k++) {
      var e = Enemies.list[k];
      totalExp  += (e.exp  || 0);
      totalGold += (e.gold || 0);
    }
    ss.rewards.exp  = Math.floor(totalExp  * grade.expMul);
    ss.rewards.gold = Math.floor(totalGold * grade.expMul);
    ss.enemiesTotal  = Enemies.list.length;
    ss.enemiesKilled = 0;

    // Ẩn portal
    this.portalState.active = false;

    var durSec = Math.floor(DUNGEON_CONFIG.dungeonDuration / 1000);
    if (typeof UI !== 'undefined') {
      UI.addLog('⚔️ Nhập Bí Cảnh [' + grade.name + ']! ' + durSec + ' giây!', 'system');
    }
    DungeonHUD.show();
  },

  // ── Update (gọi mỗi frame) ───────────────────────────────
  update: function (dt) {
    var ss = this.sessionState;

    // Kiểm tra spawn portal
    if (!ss.active && typeof GameState !== 'undefined') {
      this.trySpawnPortal();
      this.checkPortalExpiry();
    }

    if (!ss.active) return;

    ss.timeRemaining -= dt;

    // Đếm enemy còn sống
    var alive = 0;
    if (typeof Enemies !== 'undefined' && Enemies.list) {
      for (var i = 0; i < Enemies.list.length; i++) {
        if (Enemies.list[i].alive) alive++;
      }
    }
    ss.enemiesKilled = ss.enemiesTotal - alive;

    if (ss.timeRemaining <= 0) {
      this.exit(false);
      return;
    }
    if (alive === 0 && ss.enemiesTotal > 0) {
      this.exit(true);
      return;
    }

    DungeonHUD.update();
  },

  // ── Exit dungeon ─────────────────────────────────────────
  exit: function (success) {
    var ss = this.sessionState;
    ss.active = false;

    var gradeKey = ss.grade || 'normal';
    var grade    = DUNGEON_CONFIG.portalGrades[gradeKey];

    // Tính party size multiplier
    var partySize = (PartySystem.members ? PartySystem.members.length : 0) + 1;
    var mul = DUNGEON_CONFIG.rewardMultiplier[partySize] || 2.0;

    var finalExp  = Math.floor(ss.rewards.exp  * mul);
    var finalGold = Math.floor(ss.rewards.gold * mul);
    var finalItems = [];

    if (!success) {
      finalExp  = Math.floor(finalExp  * 0.5);
      finalGold = Math.floor(finalGold * 0.5);
    }

    if (typeof Player !== 'undefined') {
      if (success) {
        // Roll item drops
        if (grade.dropRarityBoost > 0 && typeof ITEMS !== 'undefined') {
          var itemKeys = Object.keys(ITEMS);
          for (var i = 0; i < 3; i++) {
            if (Math.random() < grade.dropRarityBoost) {
              finalItems.push(ITEMS[itemKeys[_dungeonRandInt(0, itemKeys.length - 1)]]);
            }
          }
          // Thêm item vào inventory nếu có
          if (typeof Inventory !== 'undefined' && Inventory.addItem) {
            for (var j = 0; j < finalItems.length; j++) {
              Inventory.addItem(finalItems[j]);
            }
          }
        }
        Player.gainExp(finalExp);
        Player.gold = (Player.gold || 0) + finalGold;

        if (typeof UI !== 'undefined') {
          UI.showNotification('🎉 Bí Cảnh Hoàn Thành!',
            '+' + finalExp + ' EXP  +' + finalGold + '💰');
          UI.updateGold && UI.updateGold();
        }
      } else {
        Player.gainExp(finalExp);
        Player.gold = (Player.gold || 0) + finalGold;
        if (typeof UI !== 'undefined') {
          UI.showNotification('⏰ Hết Giờ!', 'Nhận 50% phần thưởng');
        }
      }
    }

    // Restore map
    if (ss.savedMapState && typeof Maps !== 'undefined') {
      Maps.currentIndex = ss.savedMapState.mapIndex;
      if (typeof Maps.generate === 'function') Maps.generate();
    }

    // Restore enemies
    if (typeof Enemies !== 'undefined' && ss.savedMapState) {
      if (typeof Enemies.spawnForMap === 'function') {
        Enemies.spawnForMap(Maps.currentIndex);
      }
    }

    // Restore NPC
    if (typeof NPC !== 'undefined' && ss.savedMapState) {
      if (typeof NPC.spawnForMap === 'function') {
        NPC.spawnForMap(Maps.currentIndex);
      }
    }

    // Restore player position
    if (ss.savedPlayerPos && typeof Player !== 'undefined') {
      Player.x = ss.savedPlayerPos.x;
      Player.y = ss.savedPlayerPos.y;
    }

    // Clear party
    PartySystem.members = [];
    PartySystem.selectedClasses = [];

    DungeonHUD.hide();
    ResultScreen.show(success, { exp: finalExp, gold: finalGold, items: finalItems }, mul, partySize);
  },

  // ── Render portal ────────────────────────────────────────
  renderPortal: function () {
    if (!this.portalState.active) return;
    if (this.sessionState.active) return;
    if (typeof Game === 'undefined' || !Game.ctx) return;
    if (typeof GameState === 'undefined') return;

    var ctx = Game.ctx;
    var cam = GameState.camera || { x: 0, y: 0 };
    var ps  = this.portalState;
    var sx  = ps.x - cam.x;
    var sy  = ps.y - cam.y;
    var grade = DUNGEON_CONFIG.portalGrades[ps.grade];
    var alpha = 0.6 + Math.sin(GameState.time / 300) * 0.4;

    ctx.save();

    // Glow circle
    ctx.globalAlpha = alpha * 0.5;
    ctx.beginPath();
    ctx.arc(sx, sy, 25, 0, Math.PI * 2);
    ctx.fillStyle = grade.color;
    ctx.fill();

    // Inner circle
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(sx, sy, 15, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Portal icon
    ctx.globalAlpha = 1;
    ctx.font = '16px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✦', sx, sy);

    // Grade name phía trên
    ctx.font = 'bold 11px "Courier New", monospace';
    ctx.fillStyle = grade.color;
    ctx.fillText(grade.name, sx, sy - 32);

    // Lifetime bar bên dưới (width 50px)
    var elapsed  = GameState.time - ps.spawnTime;
    var lifeRatio = Math.max(0, 1 - elapsed / DUNGEON_CONFIG.portalLifetime);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(sx - 25, sy + 20, 50, 5);
    ctx.fillStyle = grade.color;
    ctx.fillRect(sx - 25, sy + 20, 50 * lifeRatio, 5);

    // Minimap dot
    var mm = document.getElementById('minimapCanvas');
    if (mm) {
      var mctx = mm.getContext('2d');
      if (mctx) {
        var tileSize = (typeof CONFIG !== 'undefined' && CONFIG.TILE_SIZE) ? CONFIG.TILE_SIZE : 32;
        var mapW = Maps && Maps.tiles && Maps.tiles[0] ? Maps.tiles[0].length * tileSize : 800;
        var mapH = Maps && Maps.tiles ? Maps.tiles.length * tileSize : 800;
        var mmW  = mm.width  || 100;
        var mmH  = mm.height || 100;
        var dotX = (ps.x / mapW) * mmW;
        var dotY = (ps.y / mapH) * mmH;
        var dotAlpha = 0.5 + Math.sin(GameState.time / 200) * 0.5;
        mctx.save();
        mctx.globalAlpha = dotAlpha;
        mctx.beginPath();
        mctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
        mctx.fillStyle = grade.color;
        mctx.fill();
        mctx.restore();
      }
    }

    // Hint nếu player gần
    if (this.checkPlayerNearPortal()) {
      ctx.globalAlpha = 1;
      ctx.font = '12px "Courier New", monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('👆 Chạm để vào Bí Cảnh', sx, sy - 48);
    }

    ctx.restore();
  }
};

// ─── 2B: Party System ────────────────────────────────────────
var PartySystem = {

  members: [],
  selectedClasses: [],

  // Offset formation theo vị trí trong party
  _getOffset: function (index, role) {
    var offsets = [
      { x: 0,  y: -30 },   // 0: tank → trước mặt
      { x: 30, y: 10  },   // 1: dps  → bên phải
      { x:-30, y: 10  },   // 2: dps2 / support → bên trái
      { x: 0,  y: 30  }    // 3: healer → sau cùng
    ];
    return offsets[index % offsets.length];
  },

  // ── Create member ────────────────────────────────────────
  createMember: function (classKey) {
    var cfg = DUNGEON_CONFIG.partyClasses[classKey];
    if (!cfg) return null;
    var pl  = (typeof Player !== 'undefined') ? Player : { x: 400, y: 400, maxHp: 100, atk: 10, def: 5, level: 1 };

    var skills = cfg.skills || [];
    var cds    = {};
    for (var i = 0; i < skills.length; i++) {
      cds[skills[i].name] = 0;
    }

    return {
      classKey:    classKey,
      name:        cfg.name,
      x:           pl.x + _dungeonRandRange(-30, 30),
      y:           pl.y + _dungeonRandRange(-30, 30),
      hp:          Math.floor(pl.maxHp * cfg.hpMul),
      maxHp:       Math.floor(pl.maxHp * cfg.hpMul),
      atk:         Math.floor(pl.atk   * cfg.atkMul),
      def:         Math.floor(pl.def   * cfg.defMul),
      speed:       cfg.speed,
      size:        cfg.size,
      color:       cfg.color,
      alive:       true,
      respawnTimer: 0,
      skillCooldowns: cds,
      aiState:     'follow',
      target:      null,
      attackTimer: 0,
      frame:       0,
      frameTimer:  0,
      buffActive:  null,
      tauntActive: false,
      shieldActive: false,
      shieldEnd:   0,
      _origAtk:    Math.floor(pl.atk * cfg.atkMul)
    };
  },

  // ── Damage member ────────────────────────────────────────
  damageMember: function (member, amount) {
    if (!member || !member.alive) return;
    var actual = Math.max(1, amount - member.def);
    if (member.shieldActive) actual = Math.floor(actual * 0.5);
    member.hp -= actual;
    if (typeof Game !== 'undefined' && Game.spawnDamageNumber) {
      Game.spawnDamageNumber(member.x, member.y - 20, actual, '#ff8888');
    }
    if (member.hp <= 0) {
      member.hp    = 0;
      member.alive = false;
      var cfg      = DUNGEON_CONFIG.partyClasses[member.classKey] || {};
      member.respawnTimer = cfg.respawnTime || 8000;
      if (typeof UI !== 'undefined') {
        var sec = Math.floor((cfg.respawnTime || 8000) / 1000);
        UI.addLog('💀 ' + member.name + '倒下! Hồi sinh sau ' + sec + 's...', 'system');
      }
    }
  },

  // ── Heal member (or Player) ──────────────────────────────
  healMember: function (member, hpAmount, mpAmount) {
    mpAmount = mpAmount || 0;
    if (!member) return;
    // Heal Player?
    if (member === (typeof Player !== 'undefined' ? Player : null)) {
      if (typeof Player === 'undefined') return;
      Player.hp = Math.min(Player.maxHp, Player.hp + hpAmount);
      if (typeof Game !== 'undefined' && Game.spawnDamageNumber) {
        Game.spawnDamageNumber(Player.x, Player.y - 20, '+' + hpAmount, '#44ff44');
      }
      if (mpAmount > 0 && Player.mp !== undefined && Player.maxMp !== undefined) {
        Player.mp = Math.min(Player.maxMp, Player.mp + mpAmount);
        if (typeof Game !== 'undefined' && Game.spawnDamageNumber) {
          Game.spawnDamageNumber(Player.x, Player.y - 35, '+' + mpAmount + ' MP', '#4488ff');
        }
      }
    } else {
      member.hp = Math.min(member.maxHp, member.hp + hpAmount);
      if (typeof Game !== 'undefined' && Game.spawnDamageNumber) {
        Game.spawnDamageNumber(member.x, member.y - 20, '+' + hpAmount, '#44ff44');
      }
    }
  },

  // ── Find nearest enemy ───────────────────────────────────
  _nearestEnemy: function (x, y, maxRange) {
    if (typeof Enemies === 'undefined' || !Enemies.list) return null;
    var best = null, bestD = maxRange || Infinity;
    for (var i = 0; i < Enemies.list.length; i++) {
      var e = Enemies.list[i];
      if (!e.alive) continue;
      var d = _dungeonDist(x, y, e.x, e.y);
      if (d < bestD) { bestD = d; best = e; }
    }
    return best;
  },

  // ── Move helper (with basic water avoidance) ─────────────
  _moveToward: function (member, tx, ty, dt) {
    var dx   = tx - member.x;
    var dy   = ty - member.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 2) return;
    var spd   = member.speed * dt * 0.06;
    var nx    = member.x + (dx / dist) * spd;
    var ny    = member.y + (dy / dist) * spd;

    // Basic water check
    if (typeof Maps !== 'undefined' && Maps.tiles) {
      var tileSize = (typeof CONFIG !== 'undefined' && CONFIG.TILE_SIZE) ? CONFIG.TILE_SIZE : 32;
      var col = Math.floor(nx / tileSize);
      var row = Math.floor(ny / tileSize);
      if (Maps.tiles[row] && Maps.tiles[row][col] !== 'water') {
        member.x = nx;
        member.y = ny;
      }
    } else {
      member.x = nx;
      member.y = ny;
    }
  },

  // ── AI: Tank ─────────────────────────────────────────────
  _updateTank: function (member, dt) {
    var cfg     = DUNGEON_CONFIG.partyClasses.tank;
    var pl      = (typeof Player !== 'undefined') ? Player : null;
    var nearest = this._nearestEnemy(member.x, member.y, cfg.aggroRadius);
    var skills  = cfg.skills;
    var now     = typeof GameState !== 'undefined' ? GameState.time : 0;

    // Shield check
    if (member.shieldActive && now > member.shieldEnd) {
      member.shieldActive = false;
      member.tauntActive  = false;
    }

    if (nearest) {
      member.aiState = 'combat';
      // Di chuyển giữa player và enemy
      if (pl) {
        var midX = (pl.x + nearest.x) / 2;
        var midY = (pl.y + nearest.y) / 2;
        this._moveToward(member, midX, midY, dt);
      }

      // Skill: Khiêu Chiến
      var tauntSkill = skills[0];
      if (member.skillCooldowns[tauntSkill.name] <= 0) {
        nearest.aggroed = true;
        member.tauntActive = true;
        member.skillCooldowns[tauntSkill.name] = tauntSkill.cd;
        if (typeof UI !== 'undefined') UI.addLog('🛡️ Hộ Pháp dùng Khiêu Chiến!', 'combat');
      }

      // Skill: Thiết Bích khi HP < 40%
      var shieldSkill = skills[1];
      if (!member.shieldActive && member.hp / member.maxHp < 0.4
          && member.skillCooldowns[shieldSkill.name] <= 0) {
        member.shieldActive = true;
        member.shieldEnd    = now + shieldSkill.duration;
        member.skillCooldowns[shieldSkill.name] = shieldSkill.cd;
        if (typeof UI !== 'undefined') UI.addLog('🛡️ Hộ Pháp kích hoạt Thiết Bích!', 'combat');
      }

      // Tấn công cơ bản
      member.attackTimer -= dt;
      if (member.attackTimer <= 0 && _dungeonDist(member.x, member.y, nearest.x, nearest.y) < 50) {
        if (typeof Enemies !== 'undefined' && Enemies.damage) {
          Enemies.damage(nearest, member.atk, false, '#888888');
          if (nearest.hp <= 0 && Enemies.kill) Enemies.kill(nearest);
        }
        member.attackTimer = 1000;
      }
    } else {
      member.aiState     = 'follow';
      member.tauntActive = false;
      if (pl) {
        var off = this._getOffset(0, 'tank');
        this._moveToward(member, pl.x + off.x, pl.y + off.y, dt);
      }
    }
  },

  // ── AI: Healer ───────────────────────────────────────────
  _updateHealer: function (member, dt) {
    var cfg    = DUNGEON_CONFIG.partyClasses.healer;
    var pl     = (typeof Player !== 'undefined') ? Player : null;
    var skills = cfg.skills;
    var healSkill   = skills[0];
    var healAllSkill = skills[1];
    var healed = false;

    // Giảm cooldown
    if (member.skillCooldowns[healSkill.name] > 0)
      member.skillCooldowns[healSkill.name] -= dt;
    if (member.skillCooldowns[healAllSkill.name] > 0)
      member.skillCooldowns[healAllSkill.name] -= dt;

    // Kiểm tra heal Player
    if (pl && pl.hp / pl.maxHp < 0.5
        && member.skillCooldowns[healSkill.name] <= 0) {
      var hpAmt = Math.floor(pl.maxHp * healSkill.healPct);
      var mpAmt = Math.floor((pl.maxMp || 0) * healSkill.healMpPct);
      this.healMember(pl, hpAmt, mpAmt);
      member.skillCooldowns[healSkill.name] = healSkill.cd;
      member.aiState = 'healing';
      healed = true;
    }

    // Kiểm tra heal party members
    if (!healed) {
      for (var i = 0; i < this.members.length; i++) {
        var m = this.members[i];
        if (m === member || !m.alive) continue;
        if (m.hp / m.maxHp < 0.5 && member.skillCooldowns[healSkill.name] <= 0) {
          var amt = Math.floor(m.maxHp * healSkill.healPct);
          this.healMember(m, amt, 0);
          member.skillCooldowns[healSkill.name] = healSkill.cd;
          member.aiState = 'healing';
          healed = true;
          break;
        }
      }
    }

    // Đại Hồi Xuân — heal tất cả khi có member HP nguy kịch
    var anyLow = pl && pl.hp / pl.maxHp < 0.3;
    if (!anyLow) {
      for (var k = 0; k < this.members.length; k++) {
        if (this.members[k].alive && this.members[k].hp / this.members[k].maxHp < 0.3) {
          anyLow = true; break;
        }
      }
    }
    if (anyLow && member.skillCooldowns[healAllSkill.name] <= 0) {
      var h2 = pl ? Math.floor(pl.maxHp * healAllSkill.healPct) : 0;
      var m2 = pl ? Math.floor((pl.maxMp || 0) * healAllSkill.healMpPct) : 0;
      if (pl) this.healMember(pl, h2, m2);
      for (var j = 0; j < this.members.length; j++) {
        var tm = this.members[j];
        if (tm.alive) this.healMember(tm, Math.floor(tm.maxHp * healAllSkill.healPct), 0);
      }
      member.skillCooldowns[healAllSkill.name] = healAllSkill.cd;
      member.aiState = 'healing';
      if (typeof UI !== 'undefined') UI.addLog('💚 Dược Sư tung Đại Hồi Xuân!', 'heal');
    }

    if (!healed) {
      member.aiState = 'follow';
      if (pl) {
        var off = this._getOffset(3, 'healer');
        this._moveToward(member, pl.x + off.x, pl.y + off.y, dt);
      }
    }
  },

  // ── AI: DPS ──────────────────────────────────────────────
  _updateDPS: function (member, dt, idx) {
    var cfg    = DUNGEON_CONFIG.partyClasses.dps;
    var pl     = (typeof Player !== 'undefined') ? Player : null;
    var skills = cfg.skills;
    var swordSkill = skills[0];
    var aoeSkill   = skills[1];

    // Giảm cooldown
    if (member.skillCooldowns[swordSkill.name] > 0)
      member.skillCooldowns[swordSkill.name] -= dt;
    if (member.skillCooldowns[aoeSkill.name] > 0)
      member.skillCooldowns[aoeSkill.name] -= dt;

    // Target: cùng Player.target hoặc nearest
    var target = (pl && pl.target && pl.target.alive) ? pl.target
               : this._nearestEnemy(member.x, member.y, 300);

    if (target) {
      member.target  = target;
      member.aiState = 'combat';
      var dist = _dungeonDist(member.x, member.y, target.x, target.y);

      if (dist > cfg.attackRange) {
        this._moveToward(member, target.x, target.y, dt);
      } else {
        // Tấn công cơ bản
        member.attackTimer -= dt;
        if (member.attackTimer <= 0) {
          if (typeof Enemies !== 'undefined' && Enemies.damage) {
            Enemies.damage(target, member.atk, false, '#f44336');
            if (target.hp <= 0 && Enemies.kill) Enemies.kill(target);
          }
          member.attackTimer = 1000;
        }

        // Skill: Liệt Kiếm
        if (member.skillCooldowns[swordSkill.name] <= 0) {
          var dmg1 = Math.floor(member.atk * swordSkill.dmgMul);
          if (typeof Enemies !== 'undefined' && Enemies.damage) {
            Enemies.damage(target, dmg1, true, '#ff9800');
            if (target.hp <= 0 && Enemies.kill) Enemies.kill(target);
          }
          member.skillCooldowns[swordSkill.name] = swordSkill.cd;
        }

        // Skill: Cuồng Phong (AOE)
        if (member.skillCooldowns[aoeSkill.name] <= 0) {
          var nearList = typeof Enemies !== 'undefined' && Enemies.list ? Enemies.list : [];
          for (var i = 0; i < nearList.length; i++) {
            var en = nearList[i];
            if (!en.alive) continue;
            if (_dungeonDist(member.x, member.y, en.x, en.y) <= aoeSkill.range) {
              var dmg2 = Math.floor(member.atk * aoeSkill.dmgMul);
              if (Enemies.damage) Enemies.damage(en, dmg2, false, '#ff9800');
              if (en.hp <= 0 && Enemies.kill) Enemies.kill(en);
            }
          }
          member.skillCooldowns[aoeSkill.name] = aoeSkill.cd;
          if (typeof UI !== 'undefined') UI.addLog('⚔️ Kiếm Khách tung Cuồng Phong!', 'combat');
        }
      }
    } else {
      member.target  = null;
      member.aiState = 'follow';
      if (pl) {
        var off = this._getOffset(idx === 0 ? 1 : 2, 'dps');
        this._moveToward(member, pl.x + off.x, pl.y + off.y, dt);
      }
    }
  },

  // ── AI: Support ──────────────────────────────────────────
  _updateSupport: function (member, dt) {
    var cfg    = DUNGEON_CONFIG.partyClasses.support;
    var pl     = (typeof Player !== 'undefined') ? Player : null;
    var skills = cfg.skills;
    var atkBuffSkill  = skills[0];
    var defDebuffSkill = skills[1];
    var now = typeof GameState !== 'undefined' ? GameState.time : 0;

    if (member.skillCooldowns[atkBuffSkill.name] > 0)
      member.skillCooldowns[atkBuffSkill.name] -= dt;
    if (member.skillCooldowns[defDebuffSkill.name] > 0)
      member.skillCooldowns[defDebuffSkill.name] -= dt;

    // Tốc Công Thuật: buff Player.atk
    if (pl && member.skillCooldowns[atkBuffSkill.name] <= 0) {
      if (!member.buffActive) {
        member._origPlayerAtk = pl.atk;
        pl.atk = Math.floor(pl.atk * atkBuffSkill.buffMul);
        member.buffActive = { effect: 'buffAtk', endTime: now + atkBuffSkill.duration };
        member.skillCooldowns[atkBuffSkill.name] = atkBuffSkill.cd;
        if (typeof UI !== 'undefined') UI.addLog('✨ Pháp Sư tung Tốc Công Thuật!', 'buff');
      }
    }

    // Restore buff khi hết
    if (member.buffActive && member.buffActive.effect === 'buffAtk' && now > member.buffActive.endTime) {
      if (pl && member._origPlayerAtk !== undefined) {
        pl.atk = member._origPlayerAtk;
        member._origPlayerAtk = undefined;
      }
      member.buffActive = null;
    }

    // Phá Giáp Thuật: debuff enemy gần nhất
    if (member.skillCooldowns[defDebuffSkill.name] <= 0) {
      var nearest = this._nearestEnemy(member.x, member.y, defDebuffSkill.range);
      if (nearest) {
        if (!nearest._origAtk) nearest._origAtk = nearest.atk;
        nearest.atk = Math.floor(nearest.atk * defDebuffSkill.debuffMul);
        setTimeout(function () {
          if (nearest._origAtk !== undefined) {
            nearest.atk = nearest._origAtk;
            nearest._origAtk = undefined;
          }
        }, 5000);
        member.skillCooldowns[defDebuffSkill.name] = defDebuffSkill.cd;
        if (typeof UI !== 'undefined') UI.addLog('💫 Pháp Sư tung Phá Giáp Thuật!', 'buff');
      }
    }

    // Follow player
    member.aiState = 'follow';
    if (pl) {
      var off = this._getOffset(2, 'support');
      this._moveToward(member, pl.x + off.x, pl.y + off.y, dt);
    }
  },

  // ── Main update ──────────────────────────────────────────
  update: function (dt) {
    if (!this.members || this.members.length === 0) return;
    var now = typeof GameState !== 'undefined' ? GameState.time : 0;
    var dpsIdx = 0;

    for (var i = 0; i < this.members.length; i++) {
      var member = this.members[i];
      if (!member) continue;

      if (!member.alive) {
        member.respawnTimer -= dt;
        if (member.respawnTimer <= 0) {
          var pl = typeof Player !== 'undefined' ? Player : null;
          member.alive = true;
          member.hp    = member.maxHp;
          member.x     = (pl ? pl.x : 400) + _dungeonRandRange(-40, 40);
          member.y     = (pl ? pl.y : 400) + _dungeonRandRange(-40, 40);
          member.respawnTimer = 0;
          if (typeof UI !== 'undefined') {
            UI.addLog('✅ ' + member.name + ' hồi sinh!', 'system');
          }
        }
        continue;
      }

      // Giảm skill cooldowns chung
      var cfg = DUNGEON_CONFIG.partyClasses[member.classKey] || {};
      var skills = cfg.skills || [];
      for (var s = 0; s < skills.length; s++) {
        var sn = skills[s].name;
        if (member.skillCooldowns[sn] > 0) {
          member.skillCooldowns[sn] -= dt;
          if (member.skillCooldowns[sn] < 0) member.skillCooldowns[sn] = 0;
        }
      }

      // Xóa buff hết hạn
      if (member.buffActive && now > member.buffActive.endTime
          && member.buffActive.effect !== 'buffAtk') {
        member.buffActive = null;
      }

      // Dispatch AI theo role
      switch (member.classKey) {
        case 'tank':    this._updateTank(member, dt);        break;
        case 'healer':  this._updateHealer(member, dt);      break;
        case 'dps':     this._updateDPS(member, dt, dpsIdx); dpsIdx++; break;
        case 'support': this._updateSupport(member, dt);     break;
      }
    }
  },

  // ── Render party members ─────────────────────────────────
  render: function () {
    if (!this.members || this.members.length === 0) return;
    if (typeof Game === 'undefined' || !Game.ctx) return;
    if (typeof GameState === 'undefined') return;

    var ctx = Game.ctx;
    var cam = GameState.camera || { x: 0, y: 0 };

    for (var i = 0; i < this.members.length; i++) {
      var m = this.members[i];
      if (!m) continue;

      var sx = m.x - cam.x;
      var sy = m.y - cam.y;

      ctx.save();

      if (!m.alive) {
        // Dead — dim ghost
        ctx.globalAlpha = 0.3;
        ctx.fillStyle   = '#888888';
        ctx.fillRect(sx - m.size / 2, sy - m.size / 2, m.size, m.size);
        ctx.restore();
        continue;
      }

      // Shadow
      ctx.globalAlpha = 0.3;
      ctx.fillStyle   = '#000000';
      ctx.beginPath();
      ctx.ellipse(sx, sy + m.size / 2 + 2, m.size * 0.6, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Body
      ctx.globalAlpha = 1;
      ctx.fillStyle   = m.color;
      ctx.fillRect(sx - m.size / 2, sy - m.size / 2, m.size, m.size);

      // Border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth   = 1;
      ctx.strokeRect(sx - m.size / 2, sy - m.size / 2, m.size, m.size);

      // HP bar
      var hpPct    = m.hp / m.maxHp;
      var barW     = m.size + 4;
      var barY     = sy - m.size / 2 - 8;
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(sx - barW / 2, barY, barW, 4);
      ctx.fillStyle = hpPct > 0.5 ? '#4caf50' : hpPct > 0.25 ? '#ff9800' : '#f44336';
      ctx.fillRect(sx - barW / 2, barY, barW * hpPct, 4);

      // Name
      ctx.font      = '8px "Courier New", monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(m.name, sx, sy - m.size / 2 - 12);

      // Tank taunt ring
      if (m.tauntActive) {
        ctx.strokeStyle = '#f0c040';
        ctx.lineWidth   = 2;
        ctx.globalAlpha = 0.6 + Math.sin(GameState.time / 200) * 0.4;
        ctx.beginPath();
        ctx.arc(sx, sy, m.size, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Healer cast cross
      if (m.aiState === 'healing') {
        ctx.fillStyle   = '#4caf50';
        ctx.globalAlpha = 0.9;
        ctx.fillRect(sx - 1, sy - 6, 2, 12);
        ctx.fillRect(sx - 6, sy - 1, 12, 2);
      }

      ctx.restore();
    }
  }
};

// ─── 2D: Party Select UI ─────────────────────────────────────
var PartySelectUI = {

  _grade: 'normal',
  _selectedClasses: [],
  _overlayEl: null,

  show: function (gradeKey) {
    this._grade           = gradeKey;
    this._selectedClasses = [];
    if (typeof GameState !== 'undefined') GameState.running = false;
    if (!this._overlayEl) this._overlayEl = document.getElementById('partySelectOverlay');
    if (!this._overlayEl) return;

    this._render();
    this._overlayEl.style.display = 'flex';
  },

  hide: function () {
    if (this._overlayEl) this._overlayEl.style.display = 'none';
    if (typeof GameState !== 'undefined') GameState.running = true;
  },

  toggleClass: function (classKey) {
    var idx = this._selectedClasses.indexOf(classKey);
    if (idx >= 0) {
      this._selectedClasses.splice(idx, 1);
    } else {
      if (this._selectedClasses.length >= 3) return; // max 3
      this._selectedClasses.push(classKey);
    }
    this._updateRewardPreview();
    this._updateCards();
  },

  confirm: function () {
    PartySystem.selectedClasses = this._selectedClasses.slice();
    this.hide();
    DungeonSystem.enter(this._grade);
  },

  _getMul: function () {
    var size = this._selectedClasses.length + 1;
    return DUNGEON_CONFIG.rewardMultiplier[size] || 2.0;
  },

  _updateRewardPreview: function () {
    var el = document.getElementById('psRewardPreview');
    if (!el) return;
    var mul  = this._getMul();
    var size = this._selectedClasses.length + 1;
    el.textContent = '🎁 Thưởng x' + mul.toFixed(1) + ' (' + size + ' người)';
  },

  _updateCards: function () {
    var keys = ['tank', 'healer', 'dps', 'support'];
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var btn = document.getElementById('psBtn_' + key);
      if (!btn) continue;
      var selected = this._selectedClasses.indexOf(key) >= 0;
      btn.style.background   = selected ? '#2a4a2a' : 'rgba(255,255,255,0.05)';
      btn.style.borderColor  = selected ? '#4caf50' : '#444';
      btn.textContent        = selected ? '✓ Đã Mời' : '+ Mời vào party';
    }
  },

  _render: function () {
    var overlay = this._overlayEl;
    if (!overlay) return;
    var gradeKey = this._grade;
    var grade    = DUNGEON_CONFIG.portalGrades[gradeKey] || DUNGEON_CONFIG.portalGrades.normal;
    var pl       = typeof Player !== 'undefined' ? Player : { level: 1, maxHp: 100, atk: 10, def: 5 };

    var classKeys = ['tank', 'healer', 'dps', 'support'];
    var cardsHTML = '';
    for (var i = 0; i < classKeys.length; i++) {
      var key = classKeys[i];
      var cfg = DUNGEON_CONFIG.partyClasses[key];
      var skillDesc = cfg.skills.map(function (s) { return s.name; }).join(' / ');
      cardsHTML +=
        '<div style="border:2px solid #444; border-radius:8px; padding:10px; background:rgba(255,255,255,0.05); position:relative">' +
          '<div style="font-weight:bold; color:' + cfg.color + '; margin-bottom:4px">' + cfg.name + '</div>' +
          '<div style="font-size:11px; color:#aaa; margin-bottom:4px">' +
            'HP:' + Math.floor(pl.maxHp * cfg.hpMul) + ' ATK:' + Math.floor(pl.atk * cfg.atkMul) + ' DEF:' + Math.floor(pl.def * cfg.defMul) +
          '</div>' +
          '<div style="font-size:10px; color:#888; margin-bottom:8px">' + skillDesc + '</div>' +
          '<button id="psBtn_' + key + '" onclick="PartySelectUI.toggleClass(\'' + key + '\')" ' +
            'style="width:100%; padding:5px; background:rgba(255,255,255,0.05); color:#fff; border:1px solid #444; border-radius:5px; cursor:pointer; font-size:11px">' +
            '+ Mời vào party' +
          '</button>' +
        '</div>';
    }

    overlay.innerHTML =
      '<div id="partySelectPanel" style="' +
        'background:linear-gradient(135deg,#1a1a2e,#16213e);' +
        'border:2px solid ' + grade.color + ';' +
        'border-radius:15px; padding:20px; max-width:380px; width:90%;' +
        'color:#fff; font-family:\'Courier New\',monospace;' +
        'max-height:90vh; overflow-y:auto;' +
      '">' +
        '<div style="font-size:18px; font-weight:bold; color:' + grade.color + '; text-align:center; margin-bottom:4px">' +
          '⚔️ Chọn Đội Hình — Bí Cảnh ' + grade.name +
        '</div>' +
        '<div style="font-size:12px; color:#aaa; text-align:center; margin-bottom:16px">Ít thành viên hơn = thưởng cao hơn</div>' +
        '<div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:16px">' +
          cardsHTML +
        '</div>' +
        '<div id="psRewardPreview" style="text-align:center; font-size:14px; color:#f0c040; margin-bottom:12px">🎁 Thưởng x2.0 (1 người)</div>' +
        '<div style="display:flex; gap:8px;">' +
          '<button onclick="PartySelectUI.confirm()" style="flex:1; padding:10px; background:#4caf50; color:#fff; border:none; border-radius:8px; cursor:pointer; font-weight:bold; font-family:\'Courier New\',monospace">▶ Vào Bí Cảnh</button>' +
          '<button onclick="PartySelectUI.hide()" style="padding:10px 16px; background:#555; color:#fff; border:none; border-radius:8px; cursor:pointer; font-family:\'Courier New\',monospace">✕ Hủy</button>' +
        '</div>' +
      '</div>';
  }
};

// ─── 2E: Dungeon HUD ─────────────────────────────────────────
var DungeonHUD = {

  _el: null,
  _timerEl: null,
  _partyEl: null,

  show: function () {
    this._el      = document.getElementById('dungeonHUD');
    this._timerEl = document.getElementById('dungeonTimer');
    this._partyEl = document.getElementById('partyHUD');
    if (!this._el) return;
    this._el.style.display = 'block';
    this._renderPartySlots();
    this.update();
  },

  hide: function () {
    if (!this._el) this._el = document.getElementById('dungeonHUD');
    if (this._el) this._el.style.display = 'none';
  },

  _renderPartySlots: function () {
    if (!this._partyEl) return;
    var html = '';
    for (var i = 0; i < PartySystem.members.length; i++) {
      var m = PartySystem.members[i];
      if (!m) continue;
      html +=
        '<div id="partyCard_' + i + '" style="' +
          'width:50px; border:2px solid ' + m.color + '; border-radius:6px;' +
          'background:rgba(0,0,0,0.7); padding:4px; text-align:center;' +
        '">' +
          '<div style="font-size:8px; color:#fff; white-space:nowrap; overflow:hidden">' + m.name + '</div>' +
          '<div id="partyHp_' + i + '" style="height:6px; background:#4caf50; border-radius:3px; margin-top:3px"></div>' +
        '</div>';
    }
    this._partyEl.innerHTML = html;
  },

  update: function () {
    if (!DungeonSystem.sessionState.active) return;
    if (!this._timerEl) this._timerEl = document.getElementById('dungeonTimer');
    if (!this._partyEl) this._partyEl = document.getElementById('partyHUD');

    var ss = DungeonSystem.sessionState;
    var secLeft = Math.max(0, Math.ceil(ss.timeRemaining / 1000));
    var mm  = Math.floor(secLeft / 60);
    var ss2 = secLeft % 60;
    var timeStr = mm + ':' + (ss2 < 10 ? '0' : '') + ss2;

    var aliveCount = 0;
    if (typeof Enemies !== 'undefined' && Enemies.list) {
      for (var i = 0; i < Enemies.list.length; i++) {
        if (Enemies.list[i].alive) aliveCount++;
      }
    }

    if (this._timerEl) {
      this._timerEl.textContent = '⏱ ' + timeStr + ' | 👹 ' + aliveCount + '/' + ss.enemiesTotal;
      // Flash đỏ khi < 60s
      this._timerEl.style.borderColor = secLeft < 60 ? '#f44336' : '#f0c040';
      this._timerEl.style.color       = secLeft < 60 ? '#f44336' : '#f0c040';
    }

    // Update party HP bars
    for (var j = 0; j < PartySystem.members.length; j++) {
      var m   = PartySystem.members[j];
      var hpEl = document.getElementById('partyHp_' + j);
      var cardEl = document.getElementById('partyCard_' + j);
      if (!m || !hpEl) continue;

      var pct = m.alive ? Math.max(0, m.hp / m.maxHp) : 0;
      hpEl.style.width      = Math.floor(pct * 100) + '%';
      hpEl.style.background = pct > 0.5 ? '#4caf50' : pct > 0.25 ? '#ff9800' : '#f44336';

      if (cardEl) {
        cardEl.style.opacity = m.alive ? '1' : '0.4';
        cardEl.querySelector('div').textContent = m.alive ? m.name : '💀';
      }
    }
  }
};

// ─── 2F: Result Screen ───────────────────────────────────────
var ResultScreen = {

  _el: null,
  _timeout: null,

  show: function (success, rewards, mul, partySize) {
    if (!this._el) this._el = document.getElementById('dungeonResultScreen');
    if (!this._el) return;

    if (this._timeout) clearTimeout(this._timeout);

    var title    = success ? '🎉 Bí Cảnh Hoàn Thành!' : '⏰ Hết Thời Gian!';
    var titleClr = success ? '#4caf50' : '#f44336';
    var itemsHTML = '';
    if (rewards.items && rewards.items.length > 0) {
      itemsHTML = '<div style="font-size:12px; color:#f0c040; margin-top:8px">📦 Vật phẩm: ';
      for (var i = 0; i < rewards.items.length; i++) {
        itemsHTML += (rewards.items[i].name || '?');
        if (i < rewards.items.length - 1) itemsHTML += ', ';
      }
      itemsHTML += '</div>';
    }

    var mulStr   = 'x' + (mul || 1).toFixed(1) + ' (Party ' + (partySize || 1) + ' người)';

    this._el.innerHTML =
      '<div style="' +
        'background:linear-gradient(135deg,#1a1a2e,#16213e);' +
        'border:2px solid ' + titleClr + '; border-radius:15px;' +
        'padding:24px; max-width:320px; width:85%;' +
        'color:#fff; font-family:\'Courier New\',monospace; text-align:center;' +
      '">' +
        '<div style="font-size:20px; font-weight:bold; color:' + titleClr + '; margin-bottom:12px">' + title + '</div>' +
        '<div style="font-size:14px; color:#4caf50; margin-bottom:6px">+' + (rewards.exp || 0) + ' EXP</div>' +
        '<div style="font-size:14px; color:#f0c040; margin-bottom:6px">+' + (rewards.gold || 0) + ' 💰</div>' +
        itemsHTML +
        '<div style="font-size:12px; color:#8ef; margin-top:10px">' + mulStr + '</div>' +
        '<button onclick="ResultScreen.close()" style="' +
          'margin-top:16px; padding:8px 32px; background:#4caf50; color:#fff;' +
          'border:none; border-radius:8px; cursor:pointer; font-weight:bold;' +
          'font-family:\'Courier New\',monospace;' +
        '">OK</button>' +
      '</div>';

    this._el.style.display = 'flex';

    // Tự đóng sau 5s
    var self = this;
    this._timeout = setTimeout(function () { self.close(); }, 5000);
  },

  close: function () {
    if (this._timeout) { clearTimeout(this._timeout); this._timeout = null; }
    if (!this._el) this._el = document.getElementById('dungeonResultScreen');
    if (this._el) this._el.style.display = 'none';
  }
};

// ─── 2G: Render + Update hooks ───────────────────────────────
function _dungeonHookRender() {
  if (typeof Game === 'undefined' || !Game.render) return;
  var _origRender = Game.render.bind(Game);
  Game.render = function () {
    _origRender.call(this);
    // Sau ctx.restore(): vẽ portal và party
    DungeonSystem.renderPortal();
    PartySystem.render();
  };
}

function _dungeonHookUpdate() {
  if (typeof Game === 'undefined' || !Game.update) return;
  var _origUpdate = Game.update.bind(Game);
  Game.update = function (dt) {
    _origUpdate.call(this, dt);
    DungeonSystem.update(dt);
    PartySystem.update(dt);
    DungeonHUD.update();
  };
}

function _dungeonHookHandleTap() {
  if (typeof Game === 'undefined' || !Game.handleTap) return;
  var _origHandleTap = Game.handleTap.bind(Game);
  Game.handleTap = function (screenX, screenY) {
    // Chuyển sang world coordinates
    var cam   = (typeof GameState !== 'undefined' && GameState.camera) ? GameState.camera : { x: 0, y: 0 };
    var worldX = screenX + cam.x;
    var worldY = screenY + cam.y;
    if (DungeonSystem.handlePortalTap(worldX, worldY)) return;
    _origHandleTap.call(this, screenX, screenY);
  };
}

// ============================================================
// PHẦN 3 — KHỞI ĐỘNG
// ============================================================

function _dungeonInjectHTML() {
  // Party Select Overlay
  if (!document.getElementById('partySelectOverlay')) {
    var overlay = document.createElement('div');
    overlay.id  = 'partySelectOverlay';
    overlay.style.cssText =
      'display:none; position:absolute; inset:0; background:rgba(0,0,0,0.8);' +
      'z-index:150; align-items:center; justify-content:center;';
    document.body.appendChild(overlay);
    PartySelectUI._overlayEl = overlay;
  }

  // Dungeon HUD
  if (!document.getElementById('dungeonHUD')) {
    var hud = document.createElement('div');
    hud.id  = 'dungeonHUD';
    hud.style.cssText =
      'display:none; position:absolute; top:0; left:0; right:0; bottom:0;' +
      'pointer-events:none; z-index:25;';
    hud.innerHTML =
      '<div id="dungeonTimer" style="' +
        'position:absolute; top:50px; left:50%; transform:translateX(-50%);' +
        'background:rgba(0,0,0,0.8); border:2px solid #f0c040; border-radius:8px;' +
        'padding:6px 20px; color:#f0c040; font-size:14px; font-weight:bold;' +
        'text-align:center; font-family:\'Courier New\',monospace; white-space:nowrap;' +
      '">⏱ 5:00 | 👹 0/0</div>' +
      '<div id="partyHUD" style="' +
        'position:absolute; bottom:110px; left:50%; transform:translateX(-50%);' +
        'display:flex; gap:8px; pointer-events:none;' +
      '"></div>';
    document.body.appendChild(hud);
    DungeonHUD._el      = hud;
    DungeonHUD._timerEl = document.getElementById('dungeonTimer');
    DungeonHUD._partyEl = document.getElementById('partyHUD');
  }

  // Result Screen
  if (!document.getElementById('dungeonResultScreen')) {
    var result = document.createElement('div');
    result.id  = 'dungeonResultScreen';
    result.style.cssText =
      'display:none; position:absolute; inset:0; background:rgba(0,0,0,0.85);' +
      'z-index:160; align-items:center; justify-content:center;';
    document.body.appendChild(result);
    ResultScreen._el = result;
  }
}

function _dungeonInjectCSS() {
  if (document.getElementById('dungeonSystemCSS')) return;
  var style = document.createElement('style');
  style.id   = 'dungeonSystemCSS';
  style.textContent = [
    '#partySelectOverlay button:hover { filter: brightness(1.15); }',
    '#dungeonResultScreen button:hover { filter: brightness(1.15); }',
    '#partyHUD > div { transition: opacity 0.3s; }',
    '#dungeonTimer { transition: color 0.3s, border-color 0.3s; }'
  ].join('\n');
  document.head.appendChild(style);
}

// ── Wrap Game.init ────────────────────────────────────────────
(function () {
  function _doWrap() {
    if (typeof Game === 'undefined' || !Game.init) {
      // Game belum siap — coba lagi setelah DOM ready
      if (document.readyState !== 'complete') {
        window.addEventListener('load', _doWrap);
      }
      return;
    }
    var _origInit = Game.init.bind(Game);
    Game.init = function () {
      _origInit.call(this);

      // Inject HTML & CSS
      _dungeonInjectCSS();
      _dungeonInjectHTML();

      // Hook render / update / tap
      _dungeonHookRender();
      _dungeonHookUpdate();
      _dungeonHookHandleTap();

      // Init dungeon state & portal timer
      DungeonSystem.init();

      console.log('🌀 Dungeon System initialized');
    };
  }

  // Nếu script load sau khi Game đã define xong
  if (typeof Game !== 'undefined' && Game.init) {
    _doWrap();
  } else {
    // Chờ DOM + scripts khác load xong
    window.addEventListener('load', _doWrap);
  }
})();

console.log('🌀 Dungeon System loaded');
// Thêm vào index.html sau <script src="js/game.js"></script>:
// <script src="js/feature_dungeon.js"></script>
