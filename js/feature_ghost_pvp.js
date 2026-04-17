// ==================== GHOST PVP SYSTEM ====================
// feature_ghost_pvp.js — Thi Đấu Ảo (Ghost PvP)
// Load sau: game.js
// <script src="js/feature_ghost_pvp.js"></script>

// ============================================================
// SECTION 1 — DATA & CONFIG
// ============================================================

const GHOST_PVP_CONFIG = {
  activeHours: { start: 20, end: 22 },
  storageKey: 'tuxien_ghost_pvp',

  arena: {
    mapWidth:  20,
    mapHeight: 20,
    bgColor:   '#0d0d1a',
    tileColor: '#1a1a2e',
    wallColor: '#37474f',
    centerX:   10,
    centerY:   10,
    playerSpawnX: 5,
    playerSpawnY: 10,
    ghostSpawnX:  15,
    ghostSpawnY:  10
  },

  matchDuration: 60000,
  winCondition: 'hp',

  ghosts: [
    {
      id: 'yunxiao',
      name: 'Kiếm Thánh Vân Tiêu',
      title: 'Thiên Kiếm Các',
      realm: 2,
      realmStage: 5,
      level: 20,
      color: '#42a5f5',
      glowColor: '#e3f2fd',
      stats: {
        hp: 800, maxHp: 800, mp: 300, maxMp: 300,
        atk: 65, def: 20, speed: 2.8, critRate: 0.15, critDmg: 1.8
      },
      script: [
        { atTime: 500,   action: { type: 'skill', skillIdx: 0, targetPlayer: true } },
        { atTime: 1200,  action: { type: 'move',  towardPlayer: true, duration: 800 } },
        { atTime: 2000,  action: { type: 'skill', skillIdx: 1, targetPlayer: true } },
        { atTime: 3500,  action: { type: 'move',  towardPlayer: true, duration: 600 } },
        { atTime: 4200,  action: { type: 'skill', skillIdx: 0, targetPlayer: true } },
        { atTime: 5000,  action: { type: 'skill', skillIdx: 2, targetPlayer: true } },
        { atTime: 6500,  action: { type: 'move',  towardPlayer: true, duration: 500 } },
        { atTime: 7200,  action: { type: 'skill', skillIdx: 1, targetPlayer: true } },
        { atTime: 9000,  action: { type: 'skill', skillIdx: 3, targetPlayer: true } },
        { atTime: 11000, action: { type: 'move',  towardPlayer: true, duration: 700 } },
        { atTime: 12000, action: { type: 'skill', skillIdx: 0, targetPlayer: true } },
      ],
      scriptLoopAt: 13000,
      rewardOnWin: {
        exp: 500, gold: 300,
        item: 'spiritStone', itemCount: 2,
        title: 'Vượt Sư'
      },
      unlockRequire: { realm: 2 }
    },
    {
      id: 'leihua',
      name: 'Băng Nữ Lệ Hoa',
      title: 'Hàn Băng Cung',
      realm: 3,
      realmStage: 3,
      level: 30,
      color: '#80deea',
      glowColor: '#e0f7fa',
      stats: {
        hp: 700, maxHp: 700, mp: 500, maxMp: 500,
        atk: 55, def: 18, speed: 3.2, critRate: 0.12, critDmg: 1.7
      },
      script: [
        { atTime: 300,   action: { type: 'move',  awayFromPlayer: true, duration: 600 } },
        { atTime: 1000,  action: { type: 'skill', skillIdx: 1, targetPlayer: true } },
        { atTime: 2500,  action: { type: 'skill', skillIdx: 1, targetPlayer: true } },
        { atTime: 3500,  action: { type: 'move',  awayFromPlayer: true, duration: 500 } },
        { atTime: 4200,  action: { type: 'skill', skillIdx: 2, targetPlayer: true } },
        { atTime: 6000,  action: { type: 'skill', skillIdx: 1, targetPlayer: true } },
        { atTime: 8000,  action: { type: 'skill', skillIdx: 3, targetPlayer: true } },
        { atTime: 9500,  action: { type: 'move',  awayFromPlayer: true, duration: 600 } },
        { atTime: 10500, action: { type: 'skill', skillIdx: 1, targetPlayer: true } },
      ],
      scriptLoopAt: 11500,
      rewardOnWin: {
        exp: 700, gold: 450,
        item: 'demonCore', itemCount: 2,
        title: 'Băng Tâm'
      },
      unlockRequire: { realm: 3 }
    },
    {
      id: 'xuejian',
      name: 'Ma Đạo Huyết Kiếm',
      title: 'Ma Đạo Tông',
      realm: 4,
      realmStage: 1,
      level: 40,
      color: '#ef5350',
      glowColor: '#ffcdd2',
      stats: {
        hp: 1200, maxHp: 1200, mp: 200, maxMp: 200,
        atk: 110, def: 15, speed: 3.5, critRate: 0.20, critDmg: 2.2
      },
      script: [
        { atTime: 200,  action: { type: 'move',  towardPlayer: true, duration: 1000 } },
        { atTime: 1200, action: { type: 'skill', skillIdx: 0, targetPlayer: true } },
        { atTime: 1800, action: { type: 'skill', skillIdx: 0, targetPlayer: true } },
        { atTime: 2600, action: { type: 'skill', skillIdx: 1, targetPlayer: true } },
        { atTime: 3800, action: { type: 'move',  towardPlayer: true, duration: 800 } },
        { atTime: 4700, action: { type: 'skill', skillIdx: 2, targetPlayer: true } },
        { atTime: 6000, action: { type: 'skill', skillIdx: 0, targetPlayer: true } },
        { atTime: 7000, action: { type: 'skill', skillIdx: 3, targetPlayer: true } },
        { atTime: 8500, action: { type: 'move',  towardPlayer: true, duration: 600 } },
      ],
      scriptLoopAt: 9500,
      rewardOnWin: {
        exp: 1000, gold: 600,
        item: 'dragonScale', itemCount: 1,
        title: 'Ma Đạo'
      },
      unlockRequire: { realm: 4 }
    },
    {
      id: 'wuming',
      name: 'Thần Kiếm Vô Danh',
      title: '???',
      realm: 5,
      realmStage: 5,
      level: 55,
      color: '#e0e0e0',
      glowColor: '#ffffff',
      stats: {
        hp: 1500, maxHp: 1500, mp: 600, maxMp: 600,
        atk: 140, def: 40, speed: 3.0, critRate: 0.18, critDmg: 2.0
      },
      script: [
        { atTime: 500,   action: { type: 'skill', skillIdx: 1, targetPlayer: true } },
        { atTime: 1500,  action: { type: 'move',  towardPlayer: true, duration: 700 } },
        { atTime: 2300,  action: { type: 'skill', skillIdx: 2, targetPlayer: true } },
        { atTime: 4000,  action: { type: 'skill', skillIdx: 1, targetPlayer: true } },
        { atTime: 5000,  action: { type: 'move',  towardPlayer: true, duration: 800 } },
        { atTime: 6000,  action: { type: 'skill', skillIdx: 3, targetPlayer: true } },
        { atTime: 8000,  action: { type: 'skill', skillIdx: 0, targetPlayer: true } },
        { atTime: 9000,  action: { type: 'skill', skillIdx: 1, targetPlayer: true } },
        { atTime: 10500, action: { type: 'skill', skillIdx: 2, targetPlayer: true } },
      ],
      scriptLoopAt: 12000,
      rewardOnWin: {
        exp: 1500, gold: 900,
        item: 'celestialOrb', itemCount: 1,
        title: 'Vô Danh Anh Hùng'
      },
      unlockRequire: { realm: 5 }
    },
    {
      id: 'tianzu',
      name: 'Thiên Tôn Lão Tổ',
      title: 'Tiên Giới Thứ Nhất',
      realm: 8,
      realmStage: 1,
      level: 80,
      color: '#ffd700',
      glowColor: '#fff9c4',
      stats: {
        hp: 3000, maxHp: 3000, mp: 1000, maxMp: 1000,
        atk: 250, def: 80, speed: 2.5, critRate: 0.22, critDmg: 2.5
      },
      script: [
        { atTime: 300,  action: { type: 'skill', skillIdx: 3, targetPlayer: true } },
        { atTime: 1500, action: { type: 'move',  towardPlayer: true, duration: 600 } },
        { atTime: 2200, action: { type: 'skill', skillIdx: 1, targetPlayer: true } },
        { atTime: 3000, action: { type: 'skill', skillIdx: 2, targetPlayer: true } },
        { atTime: 4500, action: { type: 'skill', skillIdx: 3, targetPlayer: true } },
        { atTime: 6000, action: { type: 'move',  towardPlayer: true, duration: 500 } },
        { atTime: 6600, action: { type: 'skill', skillIdx: 0, targetPlayer: true } },
        { atTime: 7200, action: { type: 'skill', skillIdx: 1, targetPlayer: true } },
        { atTime: 8500, action: { type: 'skill', skillIdx: 3, targetPlayer: true } },
      ],
      scriptLoopAt: 10000,
      rewardOnWin: {
        exp: 5000, gold: 2000,
        item: 'celestialOrb', itemCount: 3,
        title: 'Thiên Hạ Đệ Nhất'
      },
      unlockRequire: { realm: 8 }
    }
  ],

  ghostSkillConfig: [
    { dmgMul: 1.0, range: 65,  type: 'melee',      color: '#fff',    mp: 0 },
    { dmgMul: 2.2, range: 130, type: 'projectile',  color: '#87ceeb', mp: 0 },
    { dmgMul: 3.0, range: 160, type: 'aoe',          color: '#ffff00', mp: 0 },
    { dmgMul: 5.5, range: 120, type: 'ultimate',     color: '#ff00ff', mp: 0 }
  ]
};

// Thêm item PvP title vào ITEMS
ITEMS.pvpTitle = {
  name: 'Danh Hiệu Thi Đấu', type: 'consumable', rarity: 'rare',
  desc: 'Trang bị danh hiệu PvP vào tên nhân vật.',
  effect: { equipTitle: true }, sellPrice: 0, icon: 'medal'
};

// ============================================================
// SECTION 2 — LOGIC MODULE
// ============================================================

const GhostPvPSystem = {

  // ---- 2A. State ----
  state: {
    inArena: false,
    currentGhostId: null,
    matchTime: 0,
    matchResult: null,

    ghost: null,
    ghostScriptIndex: 0,
    ghostScriptTime: 0,

    savedState: null,

    defeatedToday: [],
    lastResetDate: null,

    earnedTitles: [],
    activeTitle: null,
    storageKey: GHOST_PVP_CONFIG.storageKey
  },

  // Flag cho arena tile color
  _arenaBg: false,

  // ---- 2B. Time Window ----
  isActiveTime() {
    const now = new Date(Date.now());
    const hour = now.getHours();
    return hour >= GHOST_PVP_CONFIG.activeHours.start &&
           hour < GHOST_PVP_CONFIG.activeHours.end;
  },

  getTimeUntilActive() {
    const now = new Date(Date.now());
    const hour = now.getHours();
    const min  = now.getMinutes();
    if (hour >= GHOST_PVP_CONFIG.activeHours.end) {
      return (24 - hour + GHOST_PVP_CONFIG.activeHours.start) * 60 - min;
    }
    return (GHOST_PVP_CONFIG.activeHours.start - hour) * 60 - min;
  },

  getDateString() {
    const d = new Date(Date.now());
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  },

  checkDailyReset() {
    const today = this.getDateString();
    if (this.state.lastResetDate !== today) {
      this.state.defeatedToday = [];
      this.state.lastResetDate = today;
      this.saveData();
    }
  },

  // ---- 2C. Arena Setup & Teardown ----
  enterArena(ghostId) {
    const ghostConfig = GHOST_PVP_CONFIG.ghosts.find(g => g.id === ghostId);
    if (!ghostConfig) return false;

    // Check realm requirement
    if (Player.realm < ghostConfig.unlockRequire.realm) {
      UI.addLog('❌ Cần ' + REALMS[ghostConfig.unlockRequire.realm].name + ' để thách đấu!', 'system');
      return false;
    }

    // Check already defeated today
    if (this.state.defeatedToday.includes(ghostId)) {
      UI.addLog('✅ Đã thắng đối thủ này hôm nay rồi!', 'system');
      return false;
    }

    // Save current state
    this.state.savedState = {
      mapIndex: Maps.currentIndex,
      tiles: JSON.parse(JSON.stringify(Maps.tiles)),
      objects: [...Maps.objects],
      enemies: [...Enemies.list],
      npcList: [...NPC.list],
      playerX: Player.x,
      playerY: Player.y,
      playerHp: Player.hp,
      playerMp: Player.mp
    };

    // Generate arena
    this.generateArenaMap();

    // Spawn ghost
    this.state.ghost = this.createGhostEntity(ghostConfig);
    this.state.currentGhostId = ghostId;
    this.state.inArena = true;
    this.state.matchTime = 0;
    this.state.matchResult = null;
    this.state.ghostScriptIndex = 0;
    this.state.ghostScriptTime = 0;

    // Reset player position & restore HP/MP
    Player.x = GHOST_PVP_CONFIG.arena.playerSpawnX * CONFIG.TILE_SIZE + 16;
    Player.y = GHOST_PVP_CONFIG.arena.playerSpawnY * CONFIG.TILE_SIZE + 16;
    Player.hp = Player.maxHp;
    Player.mp = Player.maxMp;
    Player.target = null;
    Player.tapMoveTarget = null;

    // Clear enemies & NPCs
    Enemies.list = [];
    NPC.list = [];

    document.getElementById('mapName').textContent = '⚔️ ' + ghostConfig.name;
    UI.showNotification('⚔️ Thi Đấu!', ghostConfig.name + ' vs Ngươi!');
    UI.addLog('⚔️ Bắt đầu thi đấu với ' + ghostConfig.name + '!', 'realm');

    GhostArenaHUD.show(ghostConfig);
    return true;
  },

  generateArenaMap() {
    const a = GHOST_PVP_CONFIG.arena;
    Maps.tiles = [];
    for (let y = 0; y < a.mapHeight; y++) {
      Maps.tiles[y] = [];
      for (let x = 0; x < a.mapWidth; x++) {
        const isWall = (x === 0 || y === 0 || x === a.mapWidth - 1 || y === a.mapHeight - 1);
        Maps.tiles[y][x] = isWall ? 1 : 0;
      }
    }
    Maps.objects = [];
    this._arenaBg = true;
  },

  createGhostEntity(config) {
    return {
      config,
      x: GHOST_PVP_CONFIG.arena.ghostSpawnX * CONFIG.TILE_SIZE + 16,
      y: GHOST_PVP_CONFIG.arena.ghostSpawnY * CONFIG.TILE_SIZE + 16,
      hp: config.stats.hp,
      maxHp: config.stats.hp,
      mp: config.stats.mp,
      maxMp: config.stats.mp,
      atk: config.stats.atk,
      def: config.stats.def,
      speed: config.stats.speed,
      critRate: config.stats.critRate,
      critDmg: config.stats.critDmg,
      skillCooldowns: [0, 0, 0, 0],
      dir: 'left',
      frame: 0,
      frameTimer: 0,
      alive: true,
      moveTarget: null,
      moveDuration: 0
    };
  },

  exitArena(result) {
    const s = this.state;
    s.inArena = false;
    s.matchResult = result;

    if (result === 'win') {
      this.onWin();
    } else if (result === 'lose') {
      this.onLose();
    } else {
      UI.addLog('⏰ Hết thời gian!', 'system');
    }

    // Restore map state
    if (s.savedState) {
      Maps.currentIndex = s.savedState.mapIndex;
      Maps.tiles = s.savedState.tiles;
      Maps.objects = s.savedState.objects;
      Enemies.list = s.savedState.enemies;
      NPC.list = s.savedState.npcList;
      Player.x = s.savedState.playerX;
      Player.y = s.savedState.playerY;
      Player.hp = Math.max(1, s.savedState.playerHp);
      Player.mp = s.savedState.playerMp;
    }

    this._arenaBg = false;

    const currentMapName = Maps.data[Maps.currentIndex]
      ? Maps.data[Maps.currentIndex].name
      : '???';
    document.getElementById('mapName').textContent = '📍 ' + currentMapName;

    GhostArenaHUD.hide();

    const ghostId = s.currentGhostId;
    s.ghost = null;

    setTimeout(() => GhostResultScreen.show(result, ghostId), 300);
  },

  onWin() {
    const config = GHOST_PVP_CONFIG.ghosts.find(g => g.id === this.state.currentGhostId);
    if (!config) return;

    this.state.defeatedToday.push(this.state.currentGhostId);

    Player.gainExp(config.rewardOnWin.exp);
    Player.gold += config.rewardOnWin.gold;
    if (config.rewardOnWin.item) {
      Inventory.add(config.rewardOnWin.item, config.rewardOnWin.itemCount);
    }

    // Earn title
    if (!this.state.earnedTitles.includes(config.rewardOnWin.title)) {
      this.state.earnedTitles.push(config.rewardOnWin.title);
      UI.showNotification('🏆 Danh Hiệu Mới!', config.rewardOnWin.title);
    }

    UI.addLog('🏆 Chiến thắng! +' + config.rewardOnWin.exp + ' EXP, +' + config.rewardOnWin.gold + ' 💰', 'exp');
    this.saveData();
  },

  onLose() {
    UI.addLog('💀 Thất bại! Hãy luyện tập thêm!', 'system');
  },

  // ---- 2D. Match Update ----
  update(dt) {
    const s = this.state;
    if (!s.inArena || !s.ghost) return;

    // Check player dead
    if (!Player.alive) {
      this.exitArena('lose');
      return;
    }

    s.matchTime += dt;

    // Check timeout
    if (s.matchTime >= GHOST_PVP_CONFIG.matchDuration) {
      this.exitArena('timeout');
      return;
    }

    // Check ghost dead
    if (!s.ghost.alive) {
      this.exitArena('win');
      return;
    }

    // Update ghost script
    this.updateGhostScript(dt);

    // Update ghost cooldowns
    s.ghost.skillCooldowns = s.ghost.skillCooldowns.map(cd => Math.max(0, cd - dt));

    // Update ghost movement
    this.updateGhostMovement(dt);

    // Walk animation
    s.ghost.frameTimer += dt;
    if (s.ghost.frameTimer > 150) {
      s.ghost.frame = (s.ghost.frame + 1) % 4;
      s.ghost.frameTimer = 0;
    }

    // Update HUD
    GhostArenaHUD.update();
  },

  updateGhostScript(dt) {
    const s = this.state;
    const ghost = s.ghost;
    const config = ghost.config;

    s.ghostScriptTime += dt;

    // Loop script
    if (s.ghostScriptTime >= config.scriptLoopAt) {
      s.ghostScriptTime = s.ghostScriptTime % config.scriptLoopAt;
      s.ghostScriptIndex = 0;
    }

    const script = config.script;
    while (s.ghostScriptIndex < script.length) {
      const entry = script[s.ghostScriptIndex];
      const triggerTime = entry.atTime % config.scriptLoopAt;
      if (triggerTime > s.ghostScriptTime) break;
      this.executeGhostAction(ghost, entry.action);
      s.ghostScriptIndex++;
    }
  },

  executeGhostAction(ghost, action) {
    switch (action.type) {
      case 'skill':
        this.ghostUseSkill(ghost, action.skillIdx);
        break;

      case 'move':
        if (action.towardPlayer) {
          ghost.moveTarget = { x: Player.x, y: Player.y };
        } else if (action.awayFromPlayer) {
          const angle = Math.atan2(ghost.y - Player.y, ghost.x - Player.x);
          ghost.moveTarget = {
            x: ghost.x + Math.cos(angle) * 100,
            y: ghost.y + Math.sin(angle) * 100
          };
          const a = GHOST_PVP_CONFIG.arena;
          ghost.moveTarget.x = Utils.clamp(ghost.moveTarget.x,
            CONFIG.TILE_SIZE + 8, (a.mapWidth - 1) * CONFIG.TILE_SIZE - 8);
          ghost.moveTarget.y = Utils.clamp(ghost.moveTarget.y,
            CONFIG.TILE_SIZE + 8, (a.mapHeight - 1) * CONFIG.TILE_SIZE - 8);
        }
        ghost.moveDuration = action.duration || 500;
        break;

      case 'wait':
        ghost.moveTarget = null;
        break;
    }
  },

  updateGhostMovement(dt) {
    const ghost = this.state.ghost;
    if (!ghost.moveTarget) return;

    ghost.moveDuration -= dt;
    if (ghost.moveDuration <= 0) {
      ghost.moveTarget = null;
      return;
    }

    const dist = Utils.dist(ghost.x, ghost.y, ghost.moveTarget.x, ghost.moveTarget.y);
    if (dist < 5) {
      ghost.moveTarget = null;
      return;
    }

    const dx = ghost.moveTarget.x - ghost.x;
    const dy = ghost.moveTarget.y - ghost.y;
    ghost.x += (dx / dist) * ghost.speed;
    ghost.y += (dy / dist) * ghost.speed;

    ghost.dir = dx > 0 ? 'right' : 'left';

    // Clamp to arena
    const a = GHOST_PVP_CONFIG.arena;
    ghost.x = Utils.clamp(ghost.x,
      CONFIG.TILE_SIZE + 8, (a.mapWidth - 1) * CONFIG.TILE_SIZE - 8);
    ghost.y = Utils.clamp(ghost.y,
      CONFIG.TILE_SIZE + 8, (a.mapHeight - 1) * CONFIG.TILE_SIZE - 8);
  },

  ghostUseSkill(ghost, skillIdx) {
    if (ghost.skillCooldowns[skillIdx] > 0) return;
    const skillCfg = GHOST_PVP_CONFIG.ghostSkillConfig[skillIdx];
    if (!skillCfg) return;

    const dist = Utils.dist(ghost.x, ghost.y, Player.x, Player.y);
    if (dist > skillCfg.range * 1.5) return;

    // Set cooldown (use SKILLS maxCd if available)
    ghost.skillCooldowns[skillIdx] = (SKILLS[skillIdx] && SKILLS[skillIdx].maxCd) ? SKILLS[skillIdx].maxCd : 3000;

    // Calculate damage
    let dmg = Math.floor(ghost.atk * skillCfg.dmgMul);
    const isCrit = Utils.chance(ghost.critRate);
    if (isCrit) dmg = Math.floor(dmg * ghost.critDmg);

    // Apply damage to player if in range
    if (dist <= skillCfg.range * 1.2) {
      const actualDmg = Math.max(1, dmg - Player.def);
      Player.takeDamage(actualDmg, ghost.config.name);
    }

    // Visual effect
    Game.spawnSkillEffect(ghost.x, ghost.y, Player.x, Player.y, skillCfg.color, skillCfg.type);
    Game.spawnDamageNumber(
      ghost.x, ghost.y - 30,
      isCrit ? ('💥' + dmg) : dmg.toString(),
      isCrit ? '#ffff00' : skillCfg.color
    );
  },

  damageGhost(amount, isCrit, color) {
    const ghost = this.state.ghost;
    if (!ghost || !ghost.alive) return;

    const actualDmg = Math.max(1, amount - ghost.def);
    ghost.hp -= actualDmg;

    Game.spawnDamageNumber(
      ghost.x, ghost.y - 30,
      isCrit ? ('💥' + actualDmg) : actualDmg.toString(),
      isCrit ? '#ffff00' : (color || '#fff')
    );

    // Hit particles
    for (let i = 0; i < 5; i++) {
      GameState.particles.push({
        x: ghost.x + (Math.random() - 0.5) * 15,
        y: ghost.y - 10 + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 3,
        vy: -2 - Math.random(),
        life: 300,
        color: ghost.config.color,
        size: 2 + Math.random() * 2
      });
    }

    if (ghost.hp <= 0) {
      ghost.hp = 0;
      ghost.alive = false;
      // Death burst
      for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        GameState.particles.push({
          x: ghost.x,
          y: ghost.y,
          vx: Math.cos(angle) * 4,
          vy: Math.sin(angle) * 4 - 2,
          life: 800,
          color: ghost.config.glowColor,
          size: 4 + Math.random() * 4
        });
      }
    }
  },

  // ---- 2E. Rendering ----
  renderGhost(ctx) {
    const s = this.state;
    if (!s.inArena || !s.ghost || !s.ghost.alive) return;

    const ghost = s.ghost;
    const cx = ghost.x - GameState.camera.x;
    const cy = ghost.y - GameState.camera.y;

    // Glow aura
    const pulse = 0.3 + Math.sin(GameState.time / 250) * 0.15;
    ctx.globalAlpha = pulse * 0.5;
    ctx.fillStyle = ghost.config.glowColor;
    ctx.beginPath();
    ctx.arc(cx, cy - 10, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Sprite with color tint
    const isMoving = ghost.moveTarget !== null;
    let baseSprite = Sprites.player.down;
    if (isMoving && ghost.frame % 2 === 1 && Sprites.player.walk1) {
      baseSprite = Sprites.player.walk1;
    } else if (isMoving && ghost.frame % 4 === 2 && Sprites.player.walk2) {
      baseSprite = Sprites.player.walk2;
    }

    const robeColors = new Set(['#4169e1', '#6495ed', '#27408b']);
    const tintedSprite = baseSprite.map(row =>
      row.map(cell => {
        if (!cell) return cell;
        if (robeColors.has(cell)) return ghost.config.color;
        return cell;
      })
    );

    ctx.save();
    if (ghost.dir === 'left') {
      ctx.translate(cx + 16, cy - 28);
      ctx.scale(-1, 1);
    } else {
      ctx.translate(cx - 16, cy - 28);
    }
    Sprites.drawPixelArt(ctx, tintedSprite, 2, 0, 0);
    ctx.restore();

    // Title above name
    ctx.fillStyle = '#888';
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('[' + ghost.config.title + ']', cx, cy - 50);

    // Name
    ctx.fillStyle = ghost.config.color;
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(ghost.config.name, cx, cy - 38);

    // HP bar
    const barW = 50, barH = 6;
    const hpPct = Math.max(0, ghost.hp / ghost.maxHp);
    ctx.fillStyle = '#333';
    ctx.fillRect(cx - barW / 2, cy - 33, barW, barH);
    ctx.fillStyle = ghost.config.color;
    ctx.fillRect(cx - barW / 2, cy - 33, barW * hpPct, barH);
  },

  // ---- Save/Load ----
  saveData() {
    try {
      const s = this.state;
      const data = {
        defeatedToday: s.defeatedToday,
        lastResetDate: s.lastResetDate,
        earnedTitles: s.earnedTitles,
        activeTitle: s.activeTitle
      };
      localStorage.setItem(GHOST_PVP_CONFIG.storageKey, JSON.stringify(data));
    } catch (e) {
      console.error('[GhostPvP] Save error:', e);
    }
  },

  loadData() {
    try {
      const raw = localStorage.getItem(GHOST_PVP_CONFIG.storageKey);
      if (!raw) return;
      const data = JSON.parse(raw);
      const s = this.state;
      s.defeatedToday  = data.defeatedToday  || [];
      s.lastResetDate  = data.lastResetDate  || null;
      s.earnedTitles   = data.earnedTitles   || [];
      s.activeTitle    = data.activeTitle    || null;
    } catch (e) {
      console.error('[GhostPvP] Load error:', e);
    }
  }
};

// ============================================================
// SECTION 3 — UI
// ============================================================

// ---- Ghost PvP Panel ----
const GhostPvPPanel = {
  open() {
    document.getElementById('ghostPvpOverlay').style.display = 'flex';
    GameState.running = false;
    this.render();
  },

  close() {
    document.getElementById('ghostPvpOverlay').style.display = 'none';
    GameState.running = true;
  },

  render() {
    const s = GhostPvPSystem.state;
    const isActive = GhostPvPSystem.isActiveTime();

    // Time info
    const timeEl = document.getElementById('ghostPvpTimeInfo');
    if (isActive) {
      timeEl.textContent = '⚔️ Thi Đấu Ảo đang mở! (20:00 ~ 22:00)';
      timeEl.style.color = '#4caf50';
    } else {
      const mins = GhostPvPSystem.getTimeUntilActive();
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      const waitStr = h > 0 ? `${h} giờ ${m} phút` : `${m} phút`;
      timeEl.textContent = `⏰ Còn ${waitStr} nữa mới mở (20:00 ~ 22:00)`;
      timeEl.style.color = '#f44336';
    }

    // Earned titles
    const titlesEl = document.getElementById('ghostPvpTitles');
    titlesEl.innerHTML = '';
    if (s.earnedTitles.length > 0) {
      const label = document.createElement('div');
      label.style.cssText = 'font-size:9px;color:#888;margin-bottom:6px';
      label.textContent = '🏆 Danh hiệu đã đạt được (click để trang bị):';
      titlesEl.appendChild(label);

      const wrap = document.createElement('div');
      wrap.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px';

      for (const title of s.earnedTitles) {
        const badge = document.createElement('div');
        const isActive2 = s.activeTitle === title;
        badge.style.cssText = `
          padding:4px 10px; border-radius:12px; font-size:10px; cursor:pointer;
          border:2px solid ${isActive2 ? '#f0c040' : '#9c27b0'};
          background:${isActive2 ? 'rgba(240,192,64,0.2)' : 'rgba(156,39,176,0.15)'};
          color:${isActive2 ? '#f0c040' : '#e040fb'};
          font-weight:${isActive2 ? 'bold' : 'normal'};
        `;
        badge.textContent = (isActive2 ? '✓ ' : '') + title;
        badge.onclick = () => {
          GhostPvPSystem.setActiveTitle(isActive2 ? null : title);
          GhostPvPSystem.saveData();
          this.render();
        };
        wrap.appendChild(badge);
      }
      titlesEl.appendChild(wrap);
    }

    // Ghost list
    const listEl = document.getElementById('ghostPvpList');
    listEl.innerHTML = '';

    for (const ghost of GHOST_PVP_CONFIG.ghosts) {
      const card = document.createElement('div');
      const realmName = REALMS[ghost.unlockRequire.realm]
        ? REALMS[ghost.unlockRequire.realm].name
        : ('Realm ' + ghost.unlockRequire.realm);
      const isLocked = Player.realm < ghost.unlockRequire.realm;
      const isDefeated = s.defeatedToday.includes(ghost.id);

      card.style.cssText = `
        border:2px solid ${isLocked ? '#333' : (isDefeated ? '#4caf50' : ghost.color)};
        border-radius:10px; padding:10px; margin-bottom:10px;
        background:rgba(0,0,0,0.4);
        opacity:${isLocked ? '0.45' : '1'};
        display:flex; justify-content:space-between; align-items:center; gap:10px;
      `;

      // Left: info
      const info = document.createElement('div');
      info.style.cssText = 'flex:1;min-width:0';
      info.innerHTML = `
        <div style="color:${ghost.color};font-weight:bold;font-size:12px">${ghost.name}</div>
        <div style="color:#888;font-size:9px;margin-top:2px">[${ghost.title}]</div>
        <div style="color:#aaa;font-size:9px;margin-top:3px">
          ${realmName} • Lv.${ghost.level}
        </div>
        <div style="color:#666;font-size:9px;margin-top:2px">
          ATK ${ghost.stats.atk} / DEF ${ghost.stats.def} / HP ${ghost.stats.hp}
        </div>
      `;

      // Right: reward + button
      const right = document.createElement('div');
      right.style.cssText = 'text-align:right;flex-shrink:0';

      if (!isLocked) {
        right.innerHTML = `
          <div style="font-size:9px;color:#888;margin-bottom:4px">Phần thưởng:</div>
          <div style="font-size:9px;color:#f0c040">+${ghost.rewardOnWin.exp} EXP</div>
          <div style="font-size:9px;color:#ffd700">+${ghost.rewardOnWin.gold} 💰</div>
          <div style="font-size:9px;color:#e040fb">【${ghost.rewardOnWin.title}】</div>
        `;
      }

      const btn = document.createElement('button');
      btn.style.cssText = `
        margin-top:8px; padding:7px 14px;
        border-radius:8px; cursor:pointer; font-family:inherit; font-size:11px;
        font-weight:bold; display:block; width:100%;
      `;

      if (isLocked) {
        btn.textContent = '🔒 Cần ' + realmName;
        btn.style.cssText += 'border:1px solid #444;background:rgba(255,255,255,0.05);color:#555;cursor:not-allowed';
        btn.disabled = true;
      } else if (isDefeated) {
        btn.textContent = '✅ Đã thắng hôm nay';
        btn.style.cssText += 'border:1px solid #4caf50;background:rgba(76,175,80,0.1);color:#4caf50;cursor:not-allowed';
        btn.disabled = true;
      } else if (!isActive) {
        btn.textContent = '🕐 Chưa đến giờ';
        btn.style.cssText += 'border:1px solid #555;background:rgba(255,255,255,0.05);color:#666;cursor:not-allowed';
        btn.disabled = true;
      } else {
        btn.textContent = '⚔️ Thách Đấu';
        btn.style.cssText += `border:2px solid ${ghost.color};background:rgba(0,0,0,0.5);color:${ghost.color}`;
        const gId = ghost.id;
        btn.onclick = () => {
          GhostPvPPanel.close();
          setTimeout(() => GhostPvPSystem.enterArena(gId), 100);
        };
      }

      right.appendChild(btn);
      card.appendChild(info);
      card.appendChild(right);
      listEl.appendChild(card);
    }
  }
};

// ---- Ghost Arena HUD ----
const GhostArenaHUD = {
  show(config) {
    document.getElementById('ghostArenaHUD').style.display = 'block';
    document.getElementById('arenaGhostName').textContent = config.name;
    document.getElementById('arenaGhostName').style.color = config.color;
    document.getElementById('arenaGhostHp').style.background = config.color;
  },

  hide() {
    document.getElementById('ghostArenaHUD').style.display = 'none';
  },

  update() {
    const ghost = GhostPvPSystem.state.ghost;
    if (!ghost) return;

    const remaining = Math.ceil(
      (GHOST_PVP_CONFIG.matchDuration - GhostPvPSystem.state.matchTime) / 1000
    );

    const timerEl = document.getElementById('arenaTimer');
    timerEl.textContent = remaining + 's';
    timerEl.style.color = remaining <= 10 ? '#f44336' : '#f0c040';

    const playerHpPct = Math.max(0, Player.hp / Player.maxHp * 100);
    document.getElementById('arenaPlayerHp').style.width = playerHpPct + '%';
    document.getElementById('arenaPlayerHpText').textContent = Player.hp + '/' + Player.maxHp;

    const ghostHpPct = Math.max(0, ghost.hp / ghost.maxHp * 100);
    document.getElementById('arenaGhostHp').style.width = ghostHpPct + '%';
    document.getElementById('arenaGhostHpText').textContent = ghost.hp + '/' + ghost.maxHp;
  }
};

// ---- Ghost Result Screen ----
const GhostResultScreen = {
  show(result, ghostId) {
    const config = GHOST_PVP_CONFIG.ghosts.find(g => g.id === ghostId);

    const iconEl    = document.getElementById('ghostResultIcon');
    const titleEl   = document.getElementById('ghostResultTitle');
    const oppEl     = document.getElementById('ghostResultOpponent');
    const rewardsEl = document.getElementById('ghostResultRewards');
    const newTitleEl = document.getElementById('ghostResultNewTitle');

    oppEl.textContent = config ? (config.name + ' [' + config.title + ']') : '';
    rewardsEl.innerHTML = '';
    newTitleEl.textContent = '';

    if (result === 'win') {
      iconEl.textContent = '🏆';
      titleEl.textContent = 'CHIẾN THẮNG!';
      titleEl.style.color = '#f0c040';

      if (config) {
        rewardsEl.innerHTML = `
          <div style="color:#ffeb3b;font-size:12px;margin-bottom:4px">+${config.rewardOnWin.exp} EXP</div>
          <div style="color:#ffd700;font-size:12px;margin-bottom:4px">+${config.rewardOnWin.gold} 💰</div>
          ${config.rewardOnWin.item
            ? `<div style="color:#4caf50;font-size:12px;margin-bottom:4px">${ITEMS[config.rewardOnWin.item]?.name || config.rewardOnWin.item} x${config.rewardOnWin.itemCount}</div>`
            : ''}
        `;

        const s = GhostPvPSystem.state;
        if (s.earnedTitles.includes(config.rewardOnWin.title)) {
          newTitleEl.textContent = '🏆 Danh Hiệu: 【' + config.rewardOnWin.title + '】';
        }
      }
    } else if (result === 'lose') {
      iconEl.textContent = '💀';
      titleEl.textContent = 'THẤT BẠI';
      titleEl.style.color = '#f44336';
      rewardsEl.innerHTML = '<div style="color:#888;font-size:11px">Hãy tu luyện thêm rồi thử lại!</div>';
    } else {
      iconEl.textContent = '⏰';
      titleEl.textContent = 'HẾT GIỜ';
      titleEl.style.color = '#ff9800';
      rewardsEl.innerHTML = '<div style="color:#888;font-size:11px">Không phân thắng bại!</div>';
    }

    document.getElementById('ghostResultOk').onclick = () => {
      document.getElementById('ghostResultScreen').style.display = 'none';
    };

    document.getElementById('ghostResultScreen').style.display = 'block';
  }
};

// ---- Active Title Display ----
GhostPvPSystem.setActiveTitle = function(title) {
  this.state.activeTitle = title;
  let titleEl = document.getElementById('pvpTitleDisplay');
  if (!titleEl) {
    titleEl = document.createElement('div');
    titleEl.id = 'pvpTitleDisplay';
    titleEl.style.cssText = 'color:#e040fb;font-size:9px;text-shadow:1px 1px 2px #000;text-align:center;margin-top:1px';
    const playerNameEl = document.getElementById('playerName');
    if (playerNameEl && playerNameEl.parentNode) {
      playerNameEl.parentNode.insertBefore(titleEl, playerNameEl.nextSibling);
    }
  }
  titleEl.textContent = title ? ('【' + title + '】') : '';
};

// ============================================================
// SECTION 4 — FEATURE INIT (Monkey-patching)
// ============================================================

const GhostPvPFeature = {

  injectHTML() {
    const html = `
    <!-- Ghost PvP Panel -->
    <div id="ghostPvpOverlay" style="
      display:none; position:fixed; inset:0;
      background:rgba(0,0,0,0.75); z-index:110;
      justify-content:center; align-items:center;
      padding:16px; box-sizing:border-box;
    ">
      <div style="
        background:linear-gradient(135deg,#0d0d1a,#1a1a2e);
        border:2px solid #f0c040; border-radius:14px;
        padding:18px; width:100%; max-width:400px;
        max-height:85vh; overflow-y:auto;
        font-family:'Courier New',monospace; color:#fff;
        box-sizing:border-box;
      ">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <div style="font-size:16px;font-weight:bold;color:#f0c040">⚔️ Thi Đấu Ảo</div>
          <div id="ghostPvpClose" style="cursor:pointer;font-size:18px;color:#888;line-height:1" title="Đóng">✕</div>
        </div>
        <div id="ghostPvpTimeInfo" style="text-align:center;font-size:10px;color:#8ef;margin-bottom:12px;padding:6px;border-radius:6px;background:rgba(255,255,255,0.05)"></div>
        <div id="ghostPvpTitles"></div>
        <div id="ghostPvpList"></div>
      </div>
    </div>

    <!-- Arena HUD -->
    <div id="ghostArenaHUD" style="
      display:none; position:absolute;
      top:50px; left:50%; transform:translateX(-50%);
      background:rgba(0,0,0,0.85); border:2px solid #f0c040;
      border-radius:10px; padding:8px 20px; z-index:25;
      text-align:center; pointer-events:none; min-width:280px;
      font-family:'Courier New',monospace;
    ">
      <div style="display:flex;align-items:center;gap:10px;justify-content:center">
        <div style="text-align:right;min-width:90px">
          <div id="arenaPlayerName" style="color:#4caf50;font-size:10px">Kiếm Tiên</div>
          <div style="height:8px;background:#222;border-radius:4px;overflow:hidden;margin-top:2px">
            <div id="arenaPlayerHp" style="height:100%;background:#4caf50;width:100%;transition:width 0.2s"></div>
          </div>
          <div id="arenaPlayerHpText" style="color:#aaa;font-size:8px"></div>
        </div>
        <div id="arenaTimer" style="color:#f0c040;font-size:16px;font-weight:bold;min-width:50px;text-align:center">60s</div>
        <div style="text-align:left;min-width:90px">
          <div id="arenaGhostName" style="color:#f44336;font-size:10px"></div>
          <div style="height:8px;background:#222;border-radius:4px;overflow:hidden;margin-top:2px">
            <div id="arenaGhostHp" style="height:100%;background:#f44336;width:100%;transition:width 0.2s"></div>
          </div>
          <div id="arenaGhostHpText" style="color:#aaa;font-size:8px"></div>
        </div>
      </div>
    </div>

    <!-- Result Screen -->
    <div id="ghostResultScreen" style="
      display:none; position:fixed;
      top:50%; left:50%; transform:translate(-50%,-50%);
      background:linear-gradient(135deg,#1a1a2e,#16213e);
      border:3px solid #f0c040; border-radius:15px;
      padding:25px; min-width:280px; text-align:center;
      z-index:200; font-family:'Courier New',monospace; color:#fff;
    ">
      <div id="ghostResultIcon" style="font-size:48px;margin-bottom:8px"></div>
      <div id="ghostResultTitle" style="font-size:20px;font-weight:bold;color:#f0c040;margin-bottom:6px"></div>
      <div id="ghostResultOpponent" style="font-size:12px;color:#888;margin-bottom:15px"></div>
      <div id="ghostResultRewards" style="margin-bottom:12px"></div>
      <div id="ghostResultNewTitle" style="color:#e040fb;font-size:12px;margin-bottom:15px"></div>
      <button id="ghostResultOk" style="
        padding:10px 30px;
        border:2px solid #f0c040; background:rgba(240,192,64,0.2);
        border-radius:8px; color:#f0c040; font-size:13px;
        cursor:pointer; font-family:inherit;
      ">OK</button>
    </div>
    `;

    const div = document.createElement('div');
    div.innerHTML = html;
    while (div.firstChild) {
      document.body.appendChild(div.firstChild);
    }
  },

  bindEvents() {
    document.getElementById('ghostPvpClose').addEventListener('click', () => {
      GhostPvPPanel.close();
    });
  },

  patchMaps() {
    const _origGetTileColor = Maps.getTileColor.bind(Maps);
    Maps.getTileColor = function(tile, x, y) {
      if (GhostPvPSystem._arenaBg && GhostPvPSystem.state.inArena) {
        const a = GHOST_PVP_CONFIG.arena;
        if (tile === 0) return ((x + y) % 2 === 0) ? a.tileColor : '#16213e';
        if (tile === 1) return a.wallColor;
        return a.bgColor;
      }
      return _origGetTileColor(tile, x, y);
    };
  },

  patchNPC() {
    // Wrap spawnForMap
    const _origSpawnForMap = NPC.spawnForMap.bind(NPC);
    NPC.spawnForMap = function(mapIndex) {
      _origSpawnForMap(mapIndex);

      if (GhostPvPSystem.isActiveTime()) {
        const positions = [
          [550, 350], [400, 300], [480, 420],
          [370, 380], [440, 300], [500, 400]
        ];
        const pos = positions[mapIndex] || [500, 400];

        NPC.types.ghostChallenger = {
          name: '⚔️ Đài Thi Đấu',
          title: 'Thách đấu với cao thủ',
          sprite: 'npcTeleporter',
          dialog: 'Thời khắc thi đấu đã đến! Ngươi có dám thách đấu không?',
          service: 'ghostPvp'
        };
        NPC.spawn('ghostChallenger', pos[0], pos[1]);
      }
    };

    // Wrap interact
    const _origInteract = NPC.interact.bind(NPC);
    NPC.interact = function(npc) {
      if (npc && npc.service === 'ghostPvp') {
        GhostPvPPanel.open();
        NPC.closeDialog();
        return;
      }
      _origInteract(npc);
    };
  },

  patchPlayer() {
    const _origUseSkill = Player.useSkill.bind(Player);
    Player.useSkill = function(idx) {
      const result = _origUseSkill(idx);

      // If in arena, also damage ghost
      if (result && GhostPvPSystem.state.inArena && GhostPvPSystem.state.ghost?.alive) {
        const ghost = GhostPvPSystem.state.ghost;
        const skill = Player.skills[idx];
        if (skill) {
          const dist = Utils.dist(Player.x, Player.y, ghost.x, ghost.y);
          if (dist <= skill.range * 1.3) {
            let dmg = Math.floor(Player.atk * skill.dmgMul);
            const isCrit = Utils.chance(Player.critRate);
            if (isCrit) dmg = Math.floor(dmg * Player.critDmg);
            GhostPvPSystem.damageGhost(dmg, isCrit, skill.color);
          }
        }
      }

      return result;
    };
  },

  patchGame() {
    // Wrap Game.init
    const _origInit = Game.init.bind(Game);
    Game.init = function() {
      _origInit();
      GhostPvPFeature.initAfterGame();
    };

    // Wrap Game.update
    const _origUpdate = Game.update.bind(Game);
    Game.update = function(dt) {
      _origUpdate(dt);
      GhostPvPSystem.update(dt);
      GhostPvPSystem.checkDailyReset();
    };

    // Wrap Game.renderPlayer
    const _origRenderPlayer = Game.renderPlayer.bind(Game);
    Game.renderPlayer = function() {
      _origRenderPlayer();
      GhostPvPSystem.renderGhost(Game.ctx);
    };
  },

  initAfterGame() {
    GhostPvPSystem.loadData();
    GhostPvPSystem.checkDailyReset();
    if (GhostPvPSystem.state.activeTitle) {
      GhostPvPSystem.setActiveTitle(GhostPvPSystem.state.activeTitle);
    }
    console.log('⚔️ Ghost PvP System ready');
  },

  init() {
    this.injectHTML();
    this.bindEvents();
    this.patchMaps();
    this.patchNPC();
    this.patchPlayer();
    this.patchGame();
    console.log('⚔️ Ghost PvP System loaded');
  }
};

// Khởi động khi DOM sẵn sàng
// (Game.init sẽ được patch, nhưng nếu DOMContentLoaded đã chạy rồi thì init ngay)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => GhostPvPFeature.init());
} else {
  GhostPvPFeature.init();
}
