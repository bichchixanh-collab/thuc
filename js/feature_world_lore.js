// ==================== WORLD LORE SYSTEM ====================
// feature_world_lore.js
// Sections: WorldRuins | VoidRift | ParallelWorld | Init/Hooks
// Load sau: game.js
// <script src="js/feature_world_lore.js"></script>

// ===================================================================
// SECTION 1 — DATA & CONFIG
// ===================================================================

const WORLD_LORE_CONFIG = {
  storageKey: 'tuxien_world_lore',

  ruins: [
    // Map 0 — Thanh Vân Sơn (4 ruins)
    { id:'r0_1', mapIndex:0, tx:5,  ty:5,
      name:'Bia Khai Thiên', icon:'🗿',
      lore:'Thuở khai thiên lập địa, Nguyên Khí đầu tiên hình thành tại đây...',
      completeReward:null },
    { id:'r0_2', mapIndex:0, tx:55, ty:8,
      name:'Giếng Cổ', icon:'💧',
      lore:'Giếng nước này đã tồn tại từ trước khi con người đặt chân...',
      completeReward:null },
    { id:'r0_3', mapIndex:0, tx:8,  ty:52,
      name:'Cổ Thụ Nghìn Năm', icon:'🌳',
      lore:'Cây cổ thụ này đã chứng kiến sự thăng trầm của bao thế hệ...',
      completeReward:null },
    { id:'r0_4', mapIndex:0, tx:52, ty:55,
      name:'Đài Thiên Văn', icon:'⭐',
      lore:'Người xưa dùng đài này để quan sát thiên văn và tiên đoán...',
      completeReward:{ item:'expPotion', count:2 } },

    // Map 1 — U Minh Cốc (3 ruins)
    { id:'r1_1', mapIndex:1, tx:6,  ty:6,
      name:'Ngục Hồn Bia', icon:'💀',
      lore:'Vô số linh hồn bị giam cầm tại đây bởi Ma Vương cổ đại...',
      completeReward:null },
    { id:'r1_2', mapIndex:1, tx:54, ty:10,
      name:'Ngai Vàng Bỏ Hoang', icon:'👑',
      lore:'Đây từng là nơi ngự của Ma Hoàng đệ nhất thiên hạ...',
      completeReward:null },
    { id:'r1_3', mapIndex:1, tx:10, ty:54,
      name:'Huyết Trì', icon:'🩸',
      lore:'Hồ máu này hình thành từ vô số trận chiến tàn khốc...',
      completeReward:{ item:'demonCore', count:5 } },

    // Map 2 — Hỏa Diệm Sơn (3 ruins)
    { id:'r2_1', mapIndex:2, tx:4,  ty:56,
      name:'Lò Thiên Hỏa', icon:'🔥',
      lore:'Viêm Đế đã rèn kiếm thần tại lò lửa này ngàn năm trước...',
      completeReward:null },
    { id:'r2_2', mapIndex:2, tx:56, ty:4,
      name:'Cột Hỏa Linh', icon:'🏛️',
      lore:'Cột đá này tự bốc lửa — linh khí hỏa nguyên tố kết tinh...',
      completeReward:null },
    { id:'r2_3', mapIndex:2, tx:30, ty:55,
      name:'Dung Nham Hóa Thạch', icon:'🌋',
      lore:'Thứ dung nham này không nguội lạnh trong vạn năm...',
      completeReward:{ item:'flameSword', count:1 } },

    // Map 3 — Băng Hàn Địa (3 ruins)
    { id:'r3_1', mapIndex:3, tx:5,  ty:4,
      name:'Tháp Băng Vĩnh Cửu', icon:'🏔️',
      lore:'Tháp này được Băng Đế xây dựng để phong ấn một thứ gì đó...',
      completeReward:null },
    { id:'r3_2', mapIndex:3, tx:55, ty:5,
      name:'Gương Thiên Hàn', icon:'🪞',
      lore:'Gương băng phản chiếu hình ảnh của người sắp chết...',
      completeReward:null },
    { id:'r3_3', mapIndex:3, tx:5,  ty:54,
      name:'Mộ Băng Hoàng', icon:'⚰️',
      lore:'Đây là nơi an nghỉ của Băng Hoàng đệ nhất... hay đó là bẫy?',
      completeReward:{ item:'frostSword', count:1 } },

    // Map 4 — Thiên Ma Động (4 ruins)
    { id:'r4_1', mapIndex:4, tx:4,  ty:4,
      name:'Cổng Hắc Ám', icon:'🌑',
      lore:'Cổng này thông đến một nơi mà ngay cả Ma Vương cũng sợ...',
      completeReward:null },
    { id:'r4_2', mapIndex:4, tx:56, ty:56,
      name:'Thư Viện Ma Đạo', icon:'📚',
      lore:'Những cuốn sách này chứa bí mật về nguồn gốc của Player...',
      completeReward:null },
    { id:'r4_3', mapIndex:4, tx:4,  ty:56,
      name:'Bàn Thờ Hư Vô', icon:'🕯️',
      lore:'Ai đó đã thờ phụng một thực thể không thuộc thế giới này...',
      completeReward:null },
    { id:'r4_4', mapIndex:4, tx:56, ty:4,
      name:'Ký Ức Bị Xóa', icon:'🧠',
      lore:'Ngươi... ngươi đã từng ở đây trước. Nhưng ký ức đã bị xóa.',
      completeReward:{ item:'celestialOrb', count:2 } },

    // Map 5 — Tiên Giới (3 ruins)
    { id:'r5_1', mapIndex:5, tx:5,  ty:5,
      name:'Cổng Thiên Đình', icon:'🌈',
      lore:'Đây là cổng dẫn đến Thiên Đình — nhưng nó đã bị khóa...',
      completeReward:null },
    { id:'r5_2', mapIndex:5, tx:55, ty:6,
      name:'Bia Tiên Sử', icon:'📜',
      lore:'Toàn bộ lịch sử Tiên Giới được khắc trên đây...',
      completeReward:null },
    { id:'r5_3', mapIndex:5, tx:6,  ty:54,
      name:'Nơi Kết Thúc & Khởi Đầu', icon:'♾️',
      lore:'Nơi đây... chính là nơi ngươi đã bắt đầu hành trình. Và cũng là nơi kết thúc.',
      completeReward:{ item:'celestialSword', count:1 } }
  ],

  allRuinsReward: {
    item: 'celestialOrb', count: 5,
    title: 'Sử Gia',
    passive: { expBonus: 0.10 }
  }
};

const VOID_RIFT_CONFIG = {
  spawnInterval: { min: 15 * 60 * 1000, max: 25 * 60 * 1000 },
  portalLifetime: 5 * 60 * 1000,
  voidDuration: 3 * 60 * 1000,
  enemyKillToExit: 10,
  rules: {
    noSkillCooldown: true,
    allSkillsAoe: true,
    gravityFromTop: true
  },
  lootTable: [
    { id: 'voidCrystal',  chance: 0.8,  count: 1 },
    { id: 'chaosScroll',  chance: 0.3,  count: 1 },
    { id: 'voidFragment', chance: 0.4,  count: 1 },
    { id: 'celestialOrb', chance: 0.15, count: 1 },
    { id: 'realmPill',    chance: 0.5,  count: 2 }
  ],
  voidCrystalItem: {
    id: 'voidCrystal', name: 'Hư Không Tinh Thể', type: 'material',
    rarity: 'epic', desc: 'Tinh thể từ Cõi Hư Không. Dùng để enhance void attribute.',
    sellPrice: 400
  },
  chaosScrollItem: {
    id: 'chaosScroll', name: 'Hỗn Độn Thư', type: 'consumable',
    rarity: 'legendary', desc: 'Random lại toàn bộ stat của 1 equipment.',
    effect: { chaosReforge: true }, sellPrice: 1000
  },
  voidFragmentItem: {
    id: 'voidFragment', name: 'Mảnh Hư Không', type: 'material',
    rarity: 'rare', desc: 'Thu thập 10 mảnh để triệu hồi Void Boss.',
    sellPrice: 200
  }
};

const PARALLEL_WORLD_CONFIG = {
  requireRealm: 6,
  activatorItemId: 'parallelKey',
  dailyDurationMs: 10 * 60 * 1000,
  storageKey: 'tuxien_parallel',
  portalPositions: [
    { mapIndex: 0, tx: 30, ty: 30 },
    { mapIndex: 1, tx: 30, ty: 30 },
    { mapIndex: 2, tx: 30, ty: 30 },
    { mapIndex: 3, tx: 30, ty: 30 },
    { mapIndex: 4, tx: 30, ty: 30 },
    { mapIndex: 5, tx: 30, ty: 30 }
  ],
  mirrorEnemies: {
    wolf:       { name: 'Bạch Lang',  color: '#00bcd4', element: 'ice',
                  drops: [{ id: 'celestialOrb', chance: 0.1  }, { id: 'spiritStone', chance: 0.5 }] },
    ghost:      { name: 'Quang Ma',   color: '#fff9c4', element: 'light',
                  drops: [{ id: 'celestialOrb', chance: 0.15 }, { id: 'realmPill',   chance: 0.3 }] },
    demon:      { name: 'Quang Thần', color: '#e1f5fe', element: 'light',
                  drops: [{ id: 'dragonScale',  chance: 0.2  }, { id: 'celestialOrb',chance: 0.1 }] },
    fireSpirit: { name: 'Hàn Linh',  color: '#80deea', element: 'ice',
                  drops: [{ id: 'frostSword',   chance: 0.05 }, { id: 'spiritStone', chance: 0.4 }] },
    rockGolem:  { name: 'Thủy Linh', color: '#4fc3f7', element: 'ice',
                  drops: [{ id: 'ironArmor',    chance: 0.1  }, { id: 'demonCore',   chance: 0.3 }] },
    iceWolf:    { name: 'Hỏa Lang',  color: '#ff7043', element: 'fire',
                  drops: [{ id: 'flameSword',   chance: 0.05 }, { id: 'wolfFang',    chance: 0.4 }] }
  },
  canvasFilter: 'hue-rotate(180deg) saturate(0.7)',
  exclusiveItems: {
    mirrorEssence: {
      id: 'mirrorEssence', name: 'Tinh Chất Song Thế', type: 'material',
      rarity: 'legendary', desc: 'Vật liệu từ thế giới song song. Vô cùng quý hiếm.',
      sellPrice: 2000
    }
  },
  parallelKeyItem: {
    id: 'parallelKey', name: 'Chìa Khóa Song Thế', type: 'consumable',
    rarity: 'epic', desc: 'Mở cổng vào Thế Giới Song Song.',
    effect: { openParallel: true }, sellPrice: 500
  }
};

// ===================================================================
// SECTION 2 — WORLD RUINS SYSTEM
// ===================================================================

const WorldRuinsSystem = (() => {
  const state = {
    discoveredRuins: {},
    mapCompleted: {},
    allCompleted: false,
    allRuinsPassive: false,
    activeInspection: null,
    _particleTimer: {}
  };

  function getRuinsForMap(mapIndex) {
    return WORLD_LORE_CONFIG.ruins.filter(r => r.mapIndex === mapIndex);
  }

  function isDiscovered(ruinId) {
    return !!state.discoveredRuins[ruinId];
  }

  function checkAllCompletion() {
    if (state.allCompleted) return;
    const allMaps = [0, 1, 2, 3, 4, 5];
    if (!allMaps.every(i => state.mapCompleted[i])) return;

    state.allCompleted = true;
    state.allRuinsPassive = true;
    const r = WORLD_LORE_CONFIG.allRuinsReward;
    Inventory.add(r.item, r.count);
    Player.recalculateStats();
    UI.showNotification('📖 Nhật Ký Thiên Địa Hoàn Thành!',
      'Danh hiệu: ' + r.title + ' | +10% EXP vĩnh viễn');
    UI.addLog('📖 Tất cả 20 di tích đã được khám phá!', 'realm');
  }

  function checkMapCompletion(mapIndex) {
    const mapRuins = getRuinsForMap(mapIndex);
    const allFound = mapRuins.every(r => isDiscovered(r.id));
    if (!allFound) return;
    if (state.mapCompleted[mapIndex]) return;

    state.mapCompleted[mapIndex] = true;
    const lastRuin = mapRuins[mapRuins.length - 1];
    if (lastRuin.completeReward) {
      Inventory.add(lastRuin.completeReward.item, lastRuin.completeReward.count);
      const mapName = (Maps.data[mapIndex] && Maps.data[mapIndex].name) || ('Map ' + mapIndex);
      UI.showNotification('📜 Bản Đồ Hoàn Thành!',
        mapName + ' — ' + (lastRuin.completeReward.item));
      UI.addLog('📜 Khám phá hết di tích ' + mapName + '!', 'realm');
    }
    checkAllCompletion();
  }

  function inspect(ruin) {
    if (!state.discoveredRuins[ruin.id]) {
      state.discoveredRuins[ruin.id] = {
        visitCount: 0,
        firstVisitTime: Date.now()
      };
    }
    state.discoveredRuins[ruin.id].visitCount++;

    LorePanel.show(ruin);

    if (state.discoveredRuins[ruin.id].visitCount === 1) {
      UI.addLog('🗿 Khám phá: ' + ruin.name, 'item');
      checkMapCompletion(ruin.mapIndex);
    }
  }

  function render(ctx) {
    const ruins = getRuinsForMap(Maps.currentIndex);
    ruins.forEach(ruin => {
      const wx = ruin.tx * CONFIG.TILE_SIZE + 16;
      const wy = ruin.ty * CONFIG.TILE_SIZE + 16;
      const cx = wx - GameState.camera.x;
      const cy = wy - GameState.camera.y;

      if (cx < -50 || cx > Game.canvas.width + 50) return;
      if (cy < -50 || cy > Game.canvas.height + 50) return;

      // Sparkle particles
      if (Math.random() < 0.02) {
        GameState.particles.push({
          x:  wx + (Math.random() - 0.5) * 20,
          y:  wy + (Math.random() - 0.5) * 20,
          vx: (Math.random() - 0.5) * 0.5,
          vy: -0.8 - Math.random(),
          life: 600, color: '#f0c040', size: 2 + Math.random() * 2
        });
      }

      const discovered = isDiscovered(ruin.id);
      ctx.globalAlpha = discovered ? 0.9 : 0.6;
      ctx.font = '20px serif';
      ctx.textAlign = 'center';
      ctx.fillText(ruin.icon, cx, cy + 6);

      const pulse = 0.3 + Math.sin(GameState.time / 400) * 0.2;
      ctx.globalAlpha = pulse * 0.4;
      ctx.strokeStyle = discovered ? '#4caf50' : '#f0c040';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, 15, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;

      const dist = Utils.dist(Player.x, Player.y, wx, wy);
      if (dist < 80) {
        ctx.fillStyle = '#f0c040';
        ctx.font = '9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(ruin.name, cx, cy - 20);
      }
    });
  }

  return { state, getRuinsForMap, isDiscovered, inspect, render };
})();

// ===================================================================
// SECTION 3 — VOID RIFT SYSTEM
// ===================================================================

const VoidRiftSystem = (() => {
  const state = {
    portal: null,
    nextSpawnTime: 0,
    inVoid: false,
    killCount: 0,
    timeRemaining: 0,
    savedState: null,
    exitPortal: null,
    voidFragments: 0,
    _voidBossSpawned: false,
    _aoeActive: false
  };

  function trySpawnPortal() {
    if (state.portal || state.inVoid) return;
    let tx, ty, attempts = 0;
    do {
      tx = 5 + Math.floor(Math.random() * (CONFIG.WORLD_WIDTH - 10));
      ty = 5 + Math.floor(Math.random() * (CONFIG.WORLD_HEIGHT - 10));
      attempts++;
    } while (Maps.isWater(tx, ty) && attempts < 20);
    if (Maps.isWater(tx, ty)) return;

    state.portal = {
      x: tx * CONFIG.TILE_SIZE + 16,
      y: ty * CONFIG.TILE_SIZE + 16,
      spawnTime: GameState.time,
      lifetime: VOID_RIFT_CONFIG.portalLifetime
    };
    UI.addLog('🌀 Vết nứt không gian xuất hiện gần đây!', 'realm');
  }

  function spawnExitPortal() {
    state.exitPortal = {
      x: 5 * CONFIG.TILE_SIZE + 16,
      y: 5 * CONFIG.TILE_SIZE + 16
    };
    UI.addLog('🌀 Exit Portal xuất hiện!', 'realm');
    UI.showNotification('🌀 Thoát Cõi Hư Không!', 'Bước vào Exit Portal');
  }

  function checkVoidBoss() {
    if (state.voidFragments >= 10 && !state._voidBossSpawned) {
      state._voidBossSpawned = true;
      state.voidFragments -= 10;
      const boss = Enemies.spawn('celestialDragon', 2.0, Player.level + 10);
      if (boss) {
        boss.name = '【虛空】' + boss.name;
        boss.color = '#7c4dff';
        boss._voidBoss = true;
      }
      UI.showNotification('🌀 Void Boss Triệu Hồi!', boss ? boss.name : 'Quái Hư Không');
    }
  }

  function enterVoid() {
    // Save current state
    state.savedState = {
      mapIndex: Maps.currentIndex,
      tiles: JSON.parse(JSON.stringify(Maps.tiles)),
      objects: Maps.objects.slice(),
      enemies: Enemies.list.slice(),
      playerX: Player.x,
      playerY: Player.y
    };

    // Generate void arena (10x10)
    const vw = 10, vh = 10;
    Maps.tiles = [];
    for (let y = 0; y < vh; y++) {
      Maps.tiles[y] = [];
      for (let x = 0; x < vw; x++) {
        Maps.tiles[y][x] = (x === 0 || y === 0 || x === vw - 1 || y === vh - 1) ? 1 : 0;
      }
    }
    Maps.objects = [];
    Enemies.list = [];

    // Spawn initial void enemies from top
    const mapEnemyPool = Maps.data[Maps.currentIndex]
      ? Maps.data[Maps.currentIndex].enemies
      : ['wolf'];
    for (let i = 0; i < 8; i++) {
      const typeKey = mapEnemyPool[Math.floor(Math.random() * mapEnemyPool.length)];
      const e = Enemies.spawn(typeKey, 1.5, Player.level + 2);
      if (e) {
        e.x = (1 + Math.floor(Math.random() * 8)) * CONFIG.TILE_SIZE + 16;
        e.y = CONFIG.TILE_SIZE + 16;
        e._voidEnemy = true;
      }
    }

    state.inVoid = true;
    state.killCount = 0;
    state.timeRemaining = VOID_RIFT_CONFIG.voidDuration;
    state.portal = null;
    state.exitPortal = null;
    state._aoeActive = true;
    state._voidBossSpawned = false;

    Player.x = 5 * CONFIG.TILE_SIZE + 16;
    Player.y = 5 * CONFIG.TILE_SIZE + 16;
    GameState.camera.x = Player.x - Game.canvas.width / 2;
    GameState.camera.y = Player.y - Game.canvas.height / 2;

    VoidHUD.show();
    UI.addLog('🌀 Bước vào Cõi Hư Không! Luật lệ khác thường...', 'realm');
    UI.showNotification('🌀 Cõi Hư Không', 'Không hồi chiêu. Tất cả AOE. Trọng lực đảo!');
  }

  function exitVoid() {
    state.inVoid = false;
    state._aoeActive = false;

    // Roll loot
    const lootLog = [];
    for (const l of VOID_RIFT_CONFIG.lootTable) {
      if (Utils.chance(l.chance)) {
        Inventory.add(l.id, l.count);
        const itemName = (typeof ITEMS !== 'undefined' && ITEMS[l.id])
          ? ITEMS[l.id].name : l.id;
        lootLog.push(itemName);
        if (l.id === 'voidFragment') {
          state.voidFragments++;
          checkVoidBoss();
        }
      }
    }
    if (lootLog.length) {
      UI.addLog('🌀 Void Loot: ' + lootLog.join(', '), 'item');
    }

    // Restore
    if (state.savedState) {
      Maps.tiles   = state.savedState.tiles;
      Maps.objects = state.savedState.objects;
      Enemies.list = state.savedState.enemies;
      Player.x     = state.savedState.playerX;
      Player.y     = state.savedState.playerY;
      state.savedState = null;
    }

    // Reset skill cooldowns
    if (Player.skills) {
      for (const skill of Player.skills) skill.cd = 0;
    }

    VoidHUD.hide();
    UI.showNotification('🌀 Thoát Cõi Hư Không', 'Loot: ' + lootLog.length + ' items');
  }

  function updateVoidEnemyGravity() {
    // Drift alive void enemies slowly downward for gravity feel
    for (const e of Enemies.list) {
      if (!e.alive || !e._voidEnemy) continue;
      e.y += 0.15;
    }
    // Occasionally spawn more from top if too few
    const aliveVoid = Enemies.list.filter(e => e.alive && e._voidEnemy).length;
    if (Math.random() < 0.001 && aliveVoid < 5) {
      const mapEnemyPool = (state.savedState && Maps.data[state.savedState.mapIndex])
        ? Maps.data[state.savedState.mapIndex].enemies
        : ['wolf'];
      const typeKey = mapEnemyPool[0];
      const e = Enemies.spawn(typeKey, 1.5, Player.level + 2);
      if (e) {
        e.x = (1 + Math.floor(Math.random() * 8)) * CONFIG.TILE_SIZE + 16;
        e.y = CONFIG.TILE_SIZE + 16;
        e._voidEnemy = true;
      }
    }
  }

  function update(dt) {
    // Portal expiry
    if (state.portal) {
      const age = GameState.time - state.portal.spawnTime;
      if (age > state.portal.lifetime) {
        state.portal = null;
        UI.addLog('🌀 Vết nứt đã đóng lại...', 'system');
      }
    }

    // Schedule next portal
    if (!state.portal && !state.inVoid && GameState.time > state.nextSpawnTime) {
      const iv = VOID_RIFT_CONFIG.spawnInterval;
      state.nextSpawnTime = GameState.time + Utils.randomInt(iv.min, iv.max);
      trySpawnPortal();
    }

    if (!state.inVoid) return;

    // Countdown
    state.timeRemaining -= dt;
    VoidHUD.update(state.timeRemaining, state.killCount);

    // Gravity
    updateVoidEnemyGravity();

    // No cooldown rule — zero all skill CDs every frame
    if (state._aoeActive && Player.skills) {
      for (const skill of Player.skills) skill.cd = 0;
    }

    // Spawn exit portal after enough kills
    if (state.killCount >= VOID_RIFT_CONFIG.enemyKillToExit && !state.exitPortal) {
      spawnExitPortal();
    }

    // Time up
    if (state.timeRemaining <= 0) {
      exitVoid();
    }
  }

  function render(ctx) {
    // Draw portal on world
    if (state.portal && !state.inVoid) {
      const cx = state.portal.x - GameState.camera.x;
      const cy = state.portal.y - GameState.camera.y;
      const pulse    = 0.4 + Math.sin(GameState.time / 200) * 0.3;
      const age      = GameState.time - state.portal.spawnTime;
      const lifeRatio = Math.max(0, 1 - age / state.portal.lifetime);

      // Outer ring
      ctx.globalAlpha = pulse * lifeRatio;
      ctx.strokeStyle = '#7c4dff';
      ctx.lineWidth   = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, 20 + Math.sin(GameState.time / 150) * 4, 0, Math.PI * 2);
      ctx.stroke();

      // Inner void
      ctx.globalAlpha = 0.6 * lifeRatio;
      ctx.fillStyle   = '#000033';
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.fill();

      // Swirl particles
      if (Math.random() < 0.1) {
        const a = Math.random() * Math.PI * 2;
        GameState.particles.push({
          x:   cx + GameState.camera.x + Math.cos(a) * 20,
          y:   cy + GameState.camera.y + Math.sin(a) * 20,
          vx: -Math.cos(a) * 1.5,
          vy: -Math.sin(a) * 1.5,
          life: 400, color: '#7c4dff', size: 2 + Math.random() * 2
        });
      }

      ctx.globalAlpha = 1;
      ctx.fillStyle   = '#e040fb';
      ctx.font        = '9px monospace';
      ctx.textAlign   = 'center';
      ctx.fillText('🌀 Cõi Hư Không', cx, cy - 25);
    }

    // Exit portal inside void
    if (state.inVoid && state.exitPortal) {
      const cx = state.exitPortal.x - GameState.camera.x;
      const cy = state.exitPortal.y - GameState.camera.y;
      ctx.globalAlpha = 1;
      ctx.font        = '20px serif';
      ctx.textAlign   = 'center';
      ctx.fillText('🔵', cx, cy + 6);
      ctx.fillStyle   = '#4caf50';
      ctx.font        = '9px monospace';
      ctx.fillText('EXIT', cx, cy - 15);
    }
  }

  return { state, update, render, trySpawnPortal, enterVoid, exitVoid, spawnExitPortal };
})();

// ===================================================================
// SECTION 4 — PARALLEL WORLD SYSTEM
// ===================================================================

const ParallelWorldSystem = (() => {
  const state = {
    portalVisible: {},
    inParallel: false,
    sessionStartTime: 0,
    timeUsedToday: 0,
    lastResetDate: null,
    savedState: null,
    _filterActive: false,
    _dailyLimitReached: false
  };

  function resetDailyIfNeeded() {
    const today = new Date(Date.now()).toDateString();
    if (state.lastResetDate !== today) {
      state.timeUsedToday    = 0;
      state.lastResetDate    = today;
      state._dailyLimitReached = false;
    }
  }

  function canEnter() {
    if (Player.realm < PARALLEL_WORLD_CONFIG.requireRealm) return false;
    if (state.inParallel) return false;
    resetDailyIfNeeded();
    return !state._dailyLimitReached;
  }

  function enter() {
    if (!canEnter()) return false;

    // Save state
    state.savedState = {
      mapIndex: Maps.currentIndex,
      tiles:    JSON.parse(JSON.stringify(Maps.tiles)),
      objects:  Maps.objects.slice(),
      enemies:  Enemies.list.slice(),
      playerX:  Player.x,
      playerY:  Player.y
    };

    state.inParallel        = true;
    state.sessionStartTime  = Date.now();
    state._filterActive     = true;

    // Replace enemies with mirror versions
    Enemies.list = Enemies.list.map(enemy => {
      if (!enemy.alive) return enemy;
      const mirror = PARALLEL_WORLD_CONFIG.mirrorEnemies[enemy.type];
      if (!mirror) return enemy;
      return Object.assign({}, enemy, {
        name:            mirror.name,
        color:           mirror.color,
        drops:           mirror.drops,
        _parallelMirror: true,
        _mirrorElement:  mirror.element
      });
    });

    // Apply canvas filter
    Game.canvas.style.filter = PARALLEL_WORLD_CONFIG.canvasFilter;

    UI.showNotification('🌑 Thế Giới Song Song', 'Thực tại bị đảo lộn...');
    UI.addLog('🌑 Bước vào Thế Giới Song Song!', 'realm');
    ParallelHUD.show();
    return true;
  }

  function exit() {
    state.inParallel    = false;
    state._filterActive = false;
    state.timeUsedToday += Date.now() - state.sessionStartTime;

    if (state.timeUsedToday >= PARALLEL_WORLD_CONFIG.dailyDurationMs) {
      state._dailyLimitReached = true;
    }

    // Remove CSS filter
    Game.canvas.style.filter = '';

    // Restore
    if (state.savedState) {
      Maps.tiles   = state.savedState.tiles;
      Maps.objects = state.savedState.objects;
      Enemies.list = state.savedState.enemies;
      Player.x     = state.savedState.playerX;
      Player.y     = state.savedState.playerY;
      state.savedState = null;
    }

    ParallelHUD.hide();
    UI.addLog('🌑 Trở về thế giới thực...', 'system');
  }

  function getPortalPosition(mapIndex) {
    const p = PARALLEL_WORLD_CONFIG.portalPositions.find(pp => pp.mapIndex === mapIndex);
    if (!p) return null;
    return { x: p.tx * CONFIG.TILE_SIZE + 16, y: p.ty * CONFIG.TILE_SIZE + 16 };
  }

  function update(dt) {
    if (!state.inParallel) return;
    const elapsed   = Date.now() - state.sessionStartTime;
    const remaining = PARALLEL_WORLD_CONFIG.dailyDurationMs - elapsed;
    ParallelHUD.updateTimer(remaining);
    if (remaining <= 0) exit();
  }

  function render(ctx) {
    if (state.inParallel) return; // canvas filter handles visual
    if (!canEnter()) return;

    const pos = getPortalPosition(Maps.currentIndex);
    if (!pos) return;

    const cx    = pos.x - GameState.camera.x;
    const cy    = pos.y - GameState.camera.y;
    const pulse = 0.5 + Math.sin(GameState.time / 300) * 0.3;

    ctx.globalAlpha = pulse * 0.6;
    ctx.strokeStyle = '#9c27b0';
    ctx.lineWidth   = 3;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(GameState.time / 1000);
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    ctx.globalAlpha = 1;
    ctx.fillStyle   = '#9c27b0';
    ctx.font        = '9px monospace';
    ctx.textAlign   = 'center';
    ctx.fillText('🌑 Song Thế', cx, cy - 25);

    if (Utils.dist(Player.x, Player.y, pos.x, pos.y) < 80) {
      ctx.fillStyle = '#888';
      ctx.font      = '8px monospace';
      ctx.fillText('Cần: Chìa Khóa Song Thế', cx, cy - 36);
    }
  }

  return { state, canEnter, enter, exit, getPortalPosition, update, render };
})();

// ===================================================================
// SECTION 5 — UI PANELS
// ===================================================================

const LorePanel = (() => {
  let _el, _icon, _name, _visits, _text, _progress, _close;

  function _init() {
    _el = document.getElementById('lorePanel');
    _icon     = document.getElementById('loreIcon');
    _name     = document.getElementById('loreName');
    _visits   = document.getElementById('loreVisits');
    _text     = document.getElementById('loreText');
    _progress = document.getElementById('loreProgress');
    _close    = document.getElementById('loreClose');
    if (_close) _close.addEventListener('click', hide);
  }

  function show(ruin) {
    if (!_el) _init();
    if (!_el) return;

    const data = WorldRuinsSystem.state.discoveredRuins[ruin.id];
    _icon.textContent  = ruin.icon;
    _name.textContent  = ruin.name;
    _visits.textContent = '×' + (data ? data.visitCount : 1);
    _text.textContent  = ruin.lore;

    const mapRuins = WorldRuinsSystem.getRuinsForMap(ruin.mapIndex);
    const found    = mapRuins.filter(r => WorldRuinsSystem.isDiscovered(r.id)).length;
    const mapName  = (Maps.data[ruin.mapIndex] && Maps.data[ruin.mapIndex].name) || ('Map ' + ruin.mapIndex);
    _progress.textContent = mapName + ': ' + found + '/' + mapRuins.length + ' di tích';

    _el.style.display = 'block';

    clearTimeout(LorePanel._autoCloseTimer);
    LorePanel._autoCloseTimer = setTimeout(hide, 8000);
  }

  function hide() {
    if (!_el) _el = document.getElementById('lorePanel');
    if (_el) _el.style.display = 'none';
    clearTimeout(LorePanel._autoCloseTimer);
  }

  return { show, hide, _autoCloseTimer: null };
})();

const VoidHUD = (() => {
  let _el, _timer, _kills;

  function _init() {
    _el    = document.getElementById('voidHUD');
    _timer = document.getElementById('voidTimer');
    _kills = document.getElementById('voidKills');
  }

  function show() {
    if (!_el) _init();
    if (_el) _el.style.display = 'block';
  }

  function hide() {
    if (!_el) _init();
    if (_el) _el.style.display = 'none';
  }

  function update(remaining, kills) {
    if (!_timer) _init();
    if (!_timer) return;
    const sec = Math.max(0, Math.ceil(remaining / 1000));
    _timer.textContent = Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0');
    _kills.textContent = kills;
  }

  return { show, hide, update };
})();

const ParallelHUD = (() => {
  let _el, _timer;

  function _init() {
    _el    = document.getElementById('parallelHUD');
    _timer = document.getElementById('parallelTimer');
  }

  function show() {
    if (!_el) _init();
    if (_el) _el.style.display = 'block';
  }

  function hide() {
    if (!_el) _init();
    if (_el) _el.style.display = 'none';
  }

  function updateTimer(remaining) {
    if (!_timer) _init();
    if (!_timer) return;
    const sec = Math.max(0, Math.ceil(remaining / 1000));
    _timer.textContent = Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0');
  }

  return { show, hide, updateTimer };
})();

// ===================================================================
// SECTION 6 — KHỞI ĐỘNG & HOOKS
// ===================================================================

const WorldLoreFeature = (() => {

  // ── Inject HTML ─────────────────────────────────────────────────
  function _injectHTML() {
    const html = `
<!-- Lore Panel -->
<div id="lorePanel" style="display:none;position:fixed;bottom:0;left:50%;transform:translateX(-50%);
  background:linear-gradient(135deg,#1a1a2e,#16213e);border:2px solid #f0c040;
  border-radius:12px 12px 0 0;padding:15px 20px;width:90%;max-width:380px;z-index:150;">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
    <div id="loreIcon"   style="font-size:20px;"></div>
    <div id="loreName"   style="color:#f0c040;font-size:13px;font-weight:bold;flex:1;margin:0 8px;"></div>
    <div id="loreVisits" style="color:#666;font-size:9px;margin-right:8px;"></div>
    <div id="loreClose"  style="color:#888;cursor:pointer;font-size:16px;">✕</div>
  </div>
  <div id="loreText"     style="color:#ccc;font-size:11px;line-height:1.6;font-style:italic;"></div>
  <div id="loreProgress" style="color:#4caf50;font-size:9px;margin-top:8px;"></div>
</div>

<!-- Void HUD -->
<div id="voidHUD" style="display:none;position:absolute;top:50px;left:50%;transform:translateX(-50%);
  background:rgba(0,0,0,0.85);border:2px solid #7c4dff;border-radius:8px;
  padding:6px 20px;z-index:25;text-align:center;pointer-events:none;">
  <div style="color:#7c4dff;font-size:11px;font-weight:bold;">🌀 Cõi Hư Không</div>
  <div style="display:flex;gap:15px;justify-content:center;margin-top:3px;font-size:10px;">
    <span>⏱ <span id="voidTimer">3:00</span></span>
    <span>💀 <span id="voidKills">0</span>/10</span>
  </div>
</div>

<!-- Parallel HUD -->
<div id="parallelHUD" style="display:none;position:absolute;top:10px;left:50%;transform:translateX(-50%);
  background:rgba(74,20,140,0.9);border:2px solid #9c27b0;border-radius:8px;
  padding:4px 16px;z-index:25;text-align:center;pointer-events:none;">
  <div style="color:#e040fb;font-size:10px;">🌑 Thế Giới Song Song — ⏱ <span id="parallelTimer">10:00</span></div>
</div>`;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    while (wrapper.firstChild) document.body.appendChild(wrapper.firstChild);
  }

  // ── Inject Items into ITEMS config ──────────────────────────────
  function _registerItems() {
    if (typeof ITEMS === 'undefined') return;
    ITEMS.voidCrystal  = VOID_RIFT_CONFIG.voidCrystalItem;
    ITEMS.chaosScroll  = VOID_RIFT_CONFIG.chaosScrollItem;
    ITEMS.voidFragment = VOID_RIFT_CONFIG.voidFragmentItem;
    ITEMS.mirrorEssence = PARALLEL_WORLD_CONFIG.exclusiveItems.mirrorEssence;
    ITEMS.parallelKey  = PARALLEL_WORLD_CONFIG.parallelKeyItem;
  }

  // ── Save / Load ──────────────────────────────────────────────────
  function save() {
    try {
      const data = {
        ruins:       WorldRuinsSystem.state.discoveredRuins,
        mapCompleted:WorldRuinsSystem.state.mapCompleted,
        allCompleted:WorldRuinsSystem.state.allCompleted,
        allRuinsPassive: WorldRuinsSystem.state.allRuinsPassive,
        voidFragments: VoidRiftSystem.state.voidFragments,
        _voidBossSpawned: VoidRiftSystem.state._voidBossSpawned,
        parallelTimeUsed: ParallelWorldSystem.state.timeUsedToday,
        parallelLastReset: ParallelWorldSystem.state.lastResetDate,
        parallelLimitReached: ParallelWorldSystem.state._dailyLimitReached
      };
      localStorage.setItem(WORLD_LORE_CONFIG.storageKey, JSON.stringify(data));
    } catch (e) {
      console.error('[WorldLore] Save error:', e);
    }
  }

  function load() {
    try {
      const raw = localStorage.getItem(WORLD_LORE_CONFIG.storageKey);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data.ruins)        WorldRuinsSystem.state.discoveredRuins = data.ruins;
      if (data.mapCompleted) WorldRuinsSystem.state.mapCompleted     = data.mapCompleted;
      if (data.allCompleted !== undefined) WorldRuinsSystem.state.allCompleted    = data.allCompleted;
      if (data.allRuinsPassive !== undefined) WorldRuinsSystem.state.allRuinsPassive = data.allRuinsPassive;
      if (data.voidFragments !== undefined) VoidRiftSystem.state.voidFragments   = data.voidFragments;
      if (data._voidBossSpawned !== undefined) VoidRiftSystem.state._voidBossSpawned = data._voidBossSpawned;
      if (data.parallelTimeUsed  !== undefined) ParallelWorldSystem.state.timeUsedToday    = data.parallelTimeUsed;
      if (data.parallelLastReset !== undefined) ParallelWorldSystem.state.lastResetDate    = data.parallelLastReset;
      if (data.parallelLimitReached !== undefined) ParallelWorldSystem.state._dailyLimitReached = data.parallelLimitReached;
    } catch (e) {
      console.error('[WorldLore] Load error:', e);
    }
  }

  // ── Hook helpers ─────────────────────────────────────────────────
  function _wrapFn(obj, fnName, before, after) {
    const orig = obj[fnName].bind(obj);
    obj[fnName] = function(...args) {
      if (before) {
        const result = before.apply(this, args);
        // If before returns explicit false, short-circuit
        if (result === false) return;
        // If before returns a non-undefined, non-true value as "consumed", return it
        if (result !== undefined && result !== true) return result;
      }
      const ret = orig(...args);
      if (after) after.apply(this, [...args, ret]);
      return ret;
    };
  }

  // ── Hook: Game.init ──────────────────────────────────────────────
  function _hookGameInit() {
    const origInit = Game.init.bind(Game);
    Game.init = function() {
      origInit();
      init();
    };
  }

  // ── Hook: Game.update ────────────────────────────────────────────
  function _hookGameUpdate() {
    const origUpdate = Game.update.bind(Game);
    Game.update = function(dt) {
      origUpdate(dt);
      VoidRiftSystem.update(dt);
      ParallelWorldSystem.update(dt);
    };
  }

  // ── Hook: Game.renderObjects (world-space) ───────────────────────
  function _hookRenderObjects() {
    const origRenderObjects = Game.renderObjects.bind(Game);
    Game.renderObjects = function() {
      origRenderObjects();
      WorldRuinsSystem.render(Game.ctx);
      VoidRiftSystem.render(Game.ctx);
      ParallelWorldSystem.render(Game.ctx);
    };
  }

  // ── Hook: Game.render (screen-space overlay) ─────────────────────
  function _hookRender() {
    const origRender = Game.render.bind(Game);
    Game.render = function() {
      origRender();
      // Void tint overlay (screen-space, after ctx.restore)
      if (VoidRiftSystem.state.inVoid) {
        const ctx = Game.ctx;
        ctx.fillStyle   = '#000033';
        ctx.globalAlpha = 0.15;
        ctx.fillRect(0, 0, Game.canvas.width, Game.canvas.height);
        ctx.globalAlpha = 1;
      }
    };
  }

  // ── Hook: Game.handleTap ─────────────────────────────────────────
  function _hookHandleTap() {
    const origTap = Game.handleTap.bind(Game);
    Game.handleTap = function(screenX, screenY) {
      const worldX = screenX + GameState.camera.x;
      const worldY = screenY + GameState.camera.y;

      // 1. WorldRuins inspect
      const ruins = WorldRuinsSystem.getRuinsForMap(Maps.currentIndex);
      for (const ruin of ruins) {
        const wx = ruin.tx * CONFIG.TILE_SIZE + 16;
        const wy = ruin.ty * CONFIG.TILE_SIZE + 16;
        if (Utils.dist(worldX, worldY, wx, wy) < 50) {
          WorldRuinsSystem.inspect(ruin);
          return;
        }
      }

      // 2. VoidRift portal enter
      if (VoidRiftSystem.state.portal && !VoidRiftSystem.state.inVoid) {
        const p = VoidRiftSystem.state.portal;
        if (Utils.dist(worldX, worldY, p.x, p.y) < 60) {
          VoidRiftSystem.enterVoid();
          return;
        }
      }

      // 3. VoidRift exit portal
      if (VoidRiftSystem.state.inVoid && VoidRiftSystem.state.exitPortal) {
        const ep = VoidRiftSystem.state.exitPortal;
        if (Utils.dist(worldX, worldY, ep.x, ep.y) < 60) {
          VoidRiftSystem.exitVoid();
          return;
        }
      }

      // 4. Parallel World portal enter
      if (!ParallelWorldSystem.state.inParallel) {
        const pos = ParallelWorldSystem.getPortalPosition(Maps.currentIndex);
        if (pos && Utils.dist(worldX, worldY, pos.x, pos.y) < 60) {
          if (Inventory.has('parallelKey', 1)) {
            Inventory.remove('parallelKey', 1);
            ParallelWorldSystem.enter();
          } else {
            UI.addLog('❌ Cần Chìa Khóa Song Thế!', 'system');
          }
          return;
        }
      }

      // Fall through to original
      origTap(screenX, screenY);
    };
  }

  // ── Hook: Enemies.kill ───────────────────────────────────────────
  function _hookEnemiesKill() {
    const origKill = Enemies.kill.bind(Enemies);
    Enemies.kill = function(enemy) {
      // Void kill count
      if (enemy._voidEnemy) {
        VoidRiftSystem.state.killCount++;
      }
      // Parallel mirror exclusive drop
      if (enemy._parallelMirror && Utils.chance(0.05)) {
        Inventory.add('mirrorEssence', 1);
        UI.addLog('✨ Nhận Tinh Chất Song Thế!', 'item');
      }
      origKill(enemy);
    };
  }

  // ── Hook: Player.gainExp (ruins passive) ─────────────────────────
  function _hookPlayerGainExp() {
    const origGainExp = Player.gainExp.bind(Player);
    Player.gainExp = function(amount) {
      if (Player._ruinsExpBonus) {
        amount = Math.floor(amount * (1 + Player._ruinsExpBonus));
      }
      origGainExp(amount);
    };
  }

  // ── Hook: Player.recalculateStats (ruins passive flag) ───────────
  function _hookPlayerRecalcStats() {
    const origRecalc = Player.recalculateStats.bind(Player);
    Player.recalculateStats = function() {
      origRecalc();
      if (WorldRuinsSystem.state.allRuinsPassive) {
        Player._ruinsExpBonus = WORLD_LORE_CONFIG.allRuinsReward.passive.expBonus;
      } else {
        Player._ruinsExpBonus = 0;
      }
    };
  }

  // ── Hook: Player.useSkill (void AOE override) ────────────────────
  function _hookPlayerUseSkill() {
    const origUseSkill = Player.useSkill.bind(Player);
    Player.useSkill = function(idx) {
      if (VoidRiftSystem.state._aoeActive && Player.skills) {
        const skill = Player.skills[idx];
        if (skill) {
          // Force AOE: range x2, type aoe for this call
          const origType  = skill.type;
          const origRange = skill.range;
          skill.type  = 'aoe';
          skill.range = origRange * 2;
          skill.cd    = 0;  // ensure no cooldown
          const result = origUseSkill(idx);
          skill.type  = origType;
          skill.range = origRange;
          return result;
        }
      }
      return origUseSkill(idx);
    };
  }

  // ── Hook: Inventory.useItem (special effects) ────────────────────
  function _hookInventoryUseItem() {
    const origUseItem = Inventory.useItem.bind(Inventory);
    Inventory.useItem = function(itemId) {
      const itemData = ITEMS[itemId];
      if (itemData && itemData.effect) {
        if (itemData.effect.openParallel) {
          UI.addLog('Đến cổng Song Thế trên bản đồ để sử dụng!', 'system');
          return false;
        }
        if (itemData.effect.chaosReforge) {
          // Chaos scroll: random all stats of first equipment
          const slots = Object.keys(Player.equipped);
          const filledSlot = slots.find(s => Player.equipped[s]);
          if (filledSlot) {
            const eqId   = Player.equipped[filledSlot];
            const eqItem = ITEMS[eqId];
            if (eqItem && eqItem.stats) {
              for (const stat in eqItem.stats) {
                const base = eqItem.stats[stat];
                // ±30% random variation
                eqItem.stats[stat] = Math.max(1, Math.round(base * (0.7 + Math.random() * 0.6)));
              }
              Player.recalculateStats();
              Inventory.remove(itemId, 1);
              Inventory.render && Inventory.render();
              UI.addLog('🌀 Hỗn Độn Thư: stat ' + eqId + ' đã random lại!', 'item');
              return true;
            }
          }
          UI.addLog('❌ Không có trang bị nào để reforge!', 'system');
          return false;
        }
      }
      return origUseItem(itemId);
    };
  }

  // ── Hook: Game.save / Game.load ──────────────────────────────────
  function _hookSaveLoad() {
    const origSave = Game.save.bind(Game);
    Game.save = function() {
      origSave();
      save();
    };
    const origLoad = Game.load.bind(Game);
    Game.load = function() {
      const result = origLoad();
      load();
      return result;
    };
  }

  // ── Main init (called after Game.init) ───────────────────────────
  function init() {
    _registerItems();
    load();

    // Init void spawn timer — first portal in 5 minutes
    VoidRiftSystem.state.nextSpawnTime = GameState.time + 5 * 60 * 1000;

    console.log('🗿 World Lore System loaded (Ruins + Void + Parallel)');
  }

  // ── Bootstrap ────────────────────────────────────────────────────
  // Inject HTML immediately (DOM must be ready)
  function bootstrap() {
    _injectHTML();
    _hookGameInit();
    _hookGameUpdate();
    _hookRenderObjects();
    _hookRender();
    _hookHandleTap();
    _hookEnemiesKill();
    _hookPlayerGainExp();
    _hookPlayerRecalcStats();
    _hookPlayerUseSkill();
    _hookInventoryUseItem();
    _hookSaveLoad();
  }

  return { bootstrap, init, save, load };
})();

// ── Entry point ──────────────────────────────────────────────────────
(function() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', WorldLoreFeature.bootstrap);
  } else {
    WorldLoreFeature.bootstrap();
  }
})();
