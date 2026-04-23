// ==================== FEATURE: FAILURE REWARDS ====================
// feature_failure_rewards.js — Thất bại mở nhánh ẩn
//
// HOOKS VÀO:
//   - Player.die()             (player.js)           — 4a: boss capture, 4b: dungeon trace
//   - DungeonSystem.exit()     (feature_dungeon.js)  — 4b: player chết trong dungeon
//   - WantedSystem.onEliteKilled() ... không — thay vào đó hook Enemies.kill khi isElite
//   - WantedSystem (feature_wanted.js)               — 4c: arrest branch
//   - GhostPvPSystem.damageGhost() dùng lại cho ghost trace combat (indirect)
//
// EMIT EVENTS (document):
//   - 'failure:bossCapture'  { detail: { bossId, mapIndex } }
//   - 'failure:dungeonTrace' { detail: { dungeonId, items[] } }
//   - 'failure:wantedArrest' { detail: {} }
//   - 'knowledge:dungeonDeath' { detail: { dungeonId } } — bridge to Feature 3
//
// ĐỌC/GHI localStorage:
//   - tuxien_failure_state   : ngục thất state
//   - tuxien_dungeon_traces  : array of active ghost traces
//
// DEPEND:
//   - player.js, enemies.js, game.js, maps.js, npc.js, ui.js
//   - feature_dungeon.js (DungeonSystem — optional, guard với typeof)
//   - feature_wanted.js  (WantedSystem  — optional)
//   - feature_ghost_pvp.js (GhostPvPSystem.damageGhost — optional)
// ==================================================================

// ─── Entry point chung ─────────────────────────────────────────
function triggerFailureState(type, context) {
  switch (type) {
    case 'boss_capture':   FailureSystem._handleBossCapture(context);   break;
    case 'dungeon_death':  FailureSystem._handleDungeonDeath(context);  break;
    case 'wanted_arrest':  FailureSystem._handleWantedArrest(context);  break;
    default:
      console.warn('[FailureRewards] Unknown type:', type);
  }
}

const FailureSystem = {

  // ─── Ngục Thất map definition ──────────────────────────────
  PRISON_MAP: {
    id: 'prison',
    name: '⛓ Ngục Thất Bóng Tối',
    bgColor: '#0d0000',
    tileColor: '#1a0000',
    wallColor: '#2a0808',
    width: 20, height: 20,
    escapeTime: 5 * 60 * 1000 // 5 phút real time
  },

  DUNGEON_TRACE_LIFETIME: 30 * 60 * 1000, // 30 phút
  BOSS_CAPTURE_CHANCE:    0.40,

  // ─── Saved state before prison ─────────────────────────────
  _savedState: null,

  // ─── Dungeon traces ─────────────────────────────────────────
  _traces: [],  // [{ id, mapIndex, x, y, items[], spawnTime, ghostAlive }]
  _activeGhostCombat: null,

  // ─── 4A: Boss capture ───────────────────────────────────────
  _handleBossCapture(ctx) {
    if (!Utils.chance(this.BOSS_CAPTURE_CHANCE)) return false;

    UI.showNotification('⛓ BỊ BẮT!', 'Boss bắt vào Ngục Thất...');
    UI.addLog('⛓ Boss bắt bạn vào Ngục Thất! Tìm chìa khóa để thoát!', 'system');

    // Save state
    this._savedState = {
      mapIndex: Maps.currentIndex,
      playerX: Player.x, playerY: Player.y,
      playerHp: Math.max(1, Player.hp),
      tiles:   JSON.parse(JSON.stringify(Maps.tiles)),
      objects: [...Maps.objects],
      enemies: [...Enemies.list],
      npcList: [...NPC.list]
    };

    this._enterPrison(ctx.bossId);
    document.dispatchEvent(new CustomEvent('failure:bossCapture', { detail: ctx }));
    return true;
  },

  _enterPrison(bossId) {
    const pm = this.PRISON_MAP;

    // Tạo map ngục thất
    Maps.tiles = [];
    for (let y = 0; y < pm.height; y++) {
      Maps.tiles[y] = [];
      for (let x = 0; x < pm.width; x++) {
        const isEdge = x === 0 || y === 0 || x === pm.width-1 || y === pm.height-1;
        // Thêm vài tường trong
        const isWall = isEdge ||
          (x === 5 && y > 2 && y < pm.height-3) ||
          (x === 14 && y > 3 && y < pm.height-2) ||
          (y === 8 && x > 3 && x < 10) ||
          (y === 13 && x > 10 && x < pm.width-3);
        Maps.tiles[y][x] = isWall ? 1 : 0;
      }
    }
    // Mở cửa tường dọc
    if (Maps.tiles[10]) Maps.tiles[10][5] = 0;
    if (Maps.tiles[6])  Maps.tiles[6][14] = 0;

    Maps.objects = [];
    Player.x = 3 * CONFIG.TILE_SIZE + 16;
    Player.y = 3 * CONFIG.TILE_SIZE + 16;
    Player.hp = Math.max(1, Math.floor(Player.maxHp * 0.2));
    Player.alive = true;

    document.getElementById('mapName').textContent = '⛓ Ngục Thất';

    // Spawn quái ngục
    Enemies.list = [];
    const prisonEnemies = ['ghost', 'demon'];
    for (let i = 0; i < 4; i++) {
      const typeKey = prisonEnemies[i % 2];
      const e = Enemies.spawn(typeKey, 1.2, Player.level + 3);
      if (e) {
        e.x = (8 + Math.random() * 8) * CONFIG.TILE_SIZE;
        e.y = (5 + Math.random() * 10) * CONFIG.TILE_SIZE;
        e._prisonEnemy = true;
      }
    }

    // Spawn NPC đặc biệt
    NPC.list = [];
    this._spawnPrisonNPCs(bossId);

    // Spawn chìa khóa (drop từ quái)
    this._prisonState = {
      active: true,
      hasKey: false,
      spawnTime: Date.now(),
      escapeTime: this.PRISON_MAP.escapeTime,
      bossId
    };

    // Mark quái ngục drop chìa khóa
    for (const e of Enemies.list) {
      if (e._prisonEnemy) {
        e.drops = [...(e.drops || []), { id: 'prisonKey', chance: 0.6 }];
      }
    }

    // Đăng ký item chìa khóa nếu chưa có
    if (!ITEMS.prisonKey) {
      ITEMS.prisonKey = {
        name: '🗝 Chìa Khóa Ngục Thất', type: 'consumable', rarity: 'rare',
        desc: 'Chìa khóa thoát ngục thất',
        effect: { escapePrison: true }, sellPrice: 0, icon: 'key'
      };
    }

    PrisonHUD.show(this.PRISON_MAP.escapeTime);
    FailureSystem._prisonBgActive = true;
  },

  _prisonState: null,
  _prisonBgActive: false,

  _spawnPrisonNPCs(bossId) {
    // NPC 1: Tù nhân thường (4a)
    NPC.types.prisonerNPC = {
      name: '👤 Tù Nhân', title: 'Người bị giam cầm',
      sprite: 'npcTeleporter',
      dialog: 'Thoát khỏi đây đi! Tìm chìa khóa trên người quái ngục rồi đến cổng kia!',
      service: 'prisoner'
    };
    NPC.spawn('prisonerNPC', 5 * CONFIG.TILE_SIZE, 15 * CONFIG.TILE_SIZE);

    // NPC 2: Tù nhân có quest chain (4c — cũng xuất hiện ở đây khi bị arrest)
    NPC.types.wantedPrisonerNPC = {
      name: '🕵 Tù Nhân Bí Ẩn', title: 'Kẻ bị truy nã lâu năm',
      sprite: 'npcShop',
      dialog: 'Ta đã ngồi đây lâu lắm rồi... Nếu ngươi giúp ta, ta có thể giúp lại.',
      service: 'wantedPrisonerQuest'
    };
    NPC.spawn('wantedPrisonerNPC', 16 * CONFIG.TILE_SIZE, 15 * CONFIG.TILE_SIZE);
  },

  _updatePrison(dt) {
    if (!this._prisonState || !this._prisonState.active) return;

    // Thời gian thoát tự động
    const elapsed = Date.now() - this._prisonState.spawnTime;
    const remaining = this.PRISON_MAP.escapeTime - elapsed;
    PrisonHUD.update(remaining);

    if (remaining <= 0) {
      this._exitPrison('timeout');
      return;
    }

    // Kiểm tra player có chìa khóa và đứng tại cổng thoát
    const hasKey = typeof Inventory !== 'undefined' && Inventory.has('prisonKey', 1);
    if (hasKey) {
      const gateX = (pm => pm.width - 2)(this.PRISON_MAP) * CONFIG.TILE_SIZE;
      const gateY = Math.floor(this.PRISON_MAP.height / 2) * CONFIG.TILE_SIZE;
      if (Utils.dist(Player.x, Player.y, gateX, gateY) < CONFIG.TILE_SIZE * 1.5) {
        Inventory.remove('prisonKey', 1);
        this._exitPrison('key');
      }
    }
  },

  _exitPrison(reason) {
    if (!this._prisonState) return;
    this._prisonState.active = false;
    FailureSystem._prisonBgActive = false;
    PrisonHUD.hide();

    if (reason === 'key') {
      UI.addLog('🗝 Thoát ngục thất thành công!', 'system');
      UI.showNotification('✅ Thoát Ngục!', 'Quay về vùng an toàn...');
    } else {
      UI.addLog('⏰ Hết giờ — tự động thoát ngục.', 'system');
    }

    // Restore map
    if (this._savedState) {
      Maps.tiles   = this._savedState.tiles;
      Maps.objects = this._savedState.objects;
      Enemies.list = this._savedState.enemies;
      NPC.list     = this._savedState.npcList;
      Maps.currentIndex = this._savedState.mapIndex;
      Player.x  = this._savedState.playerX;
      Player.y  = this._savedState.playerY;
      Player.hp = this._savedState.playerHp;
      this._savedState = null;
    }

    Player.alive = true;
    document.getElementById('mapName').textContent = '📍 ' + Maps.getCurrent().name;
    NPC.spawnForMap(Maps.currentIndex);
  },

  // ─── 4B: Dungeon death → trace ─────────────────────────────
  _handleDungeonDeath(ctx) {
    const dungeonId = 'dungeon_' + Maps.currentIndex;

    // Học shortcut (bridge sang Feature 3)
    document.dispatchEvent(new CustomEvent('knowledge:dungeonDeath', {
      detail: { dungeonId }
    }));

    // Chọn 30% item ngẫu nhiên
    const allItems = [];
    if (typeof Inventory !== 'undefined') {
      for (const slot of Inventory.slots || []) {
        if (slot && slot.id) allItems.push({ id: slot.id, count: slot.count });
      }
    }
    const traceItems = [];
    const pickCount = Math.max(1, Math.floor(allItems.length * 0.3));
    const shuffled = [...allItems].sort(() => Math.random()-0.5);
    for (let i = 0; i < pickCount && i < shuffled.length; i++) {
      traceItems.push(shuffled[i]);
    }

    const traceId = 'trace_' + Date.now();
    const trace = {
      id:        traceId,
      mapIndex:  Maps.currentIndex,
      dungeonId,
      x:         Player.x,
      y:         Player.y,
      items:     traceItems,
      spawnTime: Date.now(),
      ghostAlive: true
    };

    this._traces.push(trace);
    this._saveTraces();

    UI.addLog('👻 Vết tích của bạn để lại tại điểm chết! Hãy quay lại để lấy đồ (30 phút)', 'system');
    UI.showNotification('👻 Vết Tích Để Lại', traceItems.length + ' vật phẩm bị lưu giữ');

    document.dispatchEvent(new CustomEvent('failure:dungeonTrace', {
      detail: { dungeonId, items: traceItems }
    }));
  },

  // ─── Kích hoạt ghost combat khi player tap trace ─────────────
  _startGhostTraceCombat(trace) {
    if (!trace.ghostAlive) return;
    this._activeGhostCombat = trace;

    // Reuse GhostPvPSystem logic nếu có
    if (typeof GhostPvPSystem !== 'undefined' && GhostPvPSystem.state) {
      UI.addLog('👻 Đánh bại bóng ma của chính mình để lấy lại đồ!', 'system');
      const ghostConfig = {
        id: trace.id,
        name: '👻 Bóng Ma ' + Player.level,
        title: 'Vết Tích Của Bạn',
        color: '#9e9e9e', glowColor: '#e0e0e0',
        stats: {
          hp:      Math.floor(Player.maxHp * 0.6),
          maxHp:   Math.floor(Player.maxHp * 0.6),
          mp:      Player.maxMp,
          maxMp:   Player.maxMp,
          atk:     Math.floor(Player.atk * 0.6),
          def:     Math.floor(Player.def * 0.5),
          speed:   Player.speed * 0.8,
          critRate: Player.critRate * 0.5,
          critDmg: Player.critDmg
        },
        script: [
          { atTime: 1000, action: { type: 'skill', skillIdx: 0, targetPlayer: true } },
          { atTime: 2500, action: { type: 'move',  towardPlayer: true, duration: 800 } },
          { atTime: 3500, action: { type: 'skill', skillIdx: 1, targetPlayer: true } },
          { atTime: 5500, action: { type: 'skill', skillIdx: 2, targetPlayer: true } },
        ],
        scriptLoopAt: 7000,
        rewardOnWin: { exp: 0, gold: 0, item: null, title: 'Không Buông Bỏ' }
      };

      // Lưu ghostConfig vào GHOST_PVP_CONFIG.ghosts temporarily
      if (!GHOST_PVP_CONFIG.ghosts.find(g => g.id === trace.id)) {
        GHOST_PVP_CONFIG.ghosts.push(ghostConfig);
      }

      setTimeout(() => {
        GhostPvPSystem.enterArena(trace.id);
        // Override onWin để trả item
        const _origOnWin = GhostPvPSystem.onWin.bind(GhostPvPSystem);
        GhostPvPSystem.onWin = function() {
          // Trả lại item
          for (const item of trace.items) {
            if (Inventory.add(item.id, item.count)) {
              UI.addLog('📦 Lấy lại: ' + (ITEMS[item.id]?.name || item.id), 'item');
            }
          }
          trace.ghostAlive = false;
          FailureSystem._saveTraces();
          // Remove temp ghost
          const idx = GHOST_PVP_CONFIG.ghosts.findIndex(g => g.id === trace.id);
          if (idx !== -1) GHOST_PVP_CONFIG.ghosts.splice(idx, 1);
          GhostPvPSystem.onWin = _origOnWin;
          UI.showNotification('✅ Lấy Lại Được!', trace.items.length + ' vật phẩm hồi phục');
        };
      }, 100);
    } else {
      // Fallback: trả lại trực tiếp nếu không có ghost pvp
      for (const item of trace.items) {
        Inventory.add(item.id, item.count);
      }
      trace.ghostAlive = false;
      this._saveTraces();
      UI.addLog('👻 Hấp thụ vết tích! Nhận lại đồ.', 'item');
    }
  },

  // ─── 4C: Wanted arrest ──────────────────────────────────────
  _handleWantedArrest(ctx) {
    UI.showNotification('🚔 BỊ BẮT!', 'Vào ngục gặp tù nhân bí ẩn...');
    UI.addLog('🚔 Bị bắt vì truy nã! Vào ngục tìm tù nhân bí ẩn.', 'system');

    // Dùng lại prison mechanism
    this._savedState = {
      mapIndex: Maps.currentIndex,
      playerX: Player.x, playerY: Player.y,
      playerHp: Math.max(1, Player.hp),
      tiles:   JSON.parse(JSON.stringify(Maps.tiles)),
      objects: [...Maps.objects],
      enemies: [...Enemies.list],
      npcList: [...NPC.list]
    };

    this._enterPrison('wanted_arrest');

    // Đánh dấu để NPC wantedPrisonerNPC kích hoạt quest chain
    FailureSystem._wantedArrestActive = true;
    document.dispatchEvent(new CustomEvent('failure:wantedArrest', { detail: ctx }));
  },

  _wantedArrestActive: false,

  // ─── Quest chain cho tù nhân bí ẩn ──────────────────────────
  // Gọi khi player tương tác NPC wantedPrisonerNPC
  startWantedPrisonerQuest() {
    if (!this._wantedArrestActive) {
      UI.addLog('🕵 Tù nhân nhìn ngươi nghi ngờ...', 'npc');
      return;
    }

    if (!ITEMS.prisonerBadge) {
      ITEMS.prisonerBadge = {
        name: '🏅 Huy Hiệu Tù Nhân', type: 'material', rarity: 'epic',
        desc: 'Bằng chứng hoàn thành nhiệm vụ bí ẩn trong ngục',
        sellPrice: 0, icon: 'badge'
      };
    }

    // Kiểm tra đã hoàn thành quest chưa
    const doneKey = 'tuxien_prisoner_quest_done';
    if (localStorage.getItem(doneKey)) {
      UI.addLog('🕵 "Hãy sống tốt bên ngoài, bằng hữu."', 'npc');
      return;
    }

    // Quest: Kill 2 quái ngục đặc biệt
    UI.addLog('🕵 "Giúp ta diệt 2 tên canh ngục — ta sẽ tiết lộ bí mật..."', 'npc');
    UI.showNotification('📜 Quest Ẩn!', 'Tiêu diệt 2 Canh Ngục Nguyên Súy');

    // Spawn 2 quái đặc biệt
    Enemies.types.prisonGuard = {
      name: '⚔️ Canh Ngục Nguyên Súy', hp: 500, atk: 50, exp: 300, gold: 200,
      sprite: 'demon', size: 16, color: '#546e7a',
      drops: [{ id: 'prisonerBadge', chance: 1.0 }]
    };

    for (let i = 0; i < 2; i++) {
      const e = Enemies.spawn('prisonGuard', 2.0, Player.level + 5);
      if (e) {
        e.x = (6 + i * 8) * CONFIG.TILE_SIZE;
        e.y = 10 * CONFIG.TILE_SIZE;
        e._prisonGuard = true;
      }
    }

    // Track quest progress via event
    const self = this;
    const questCheck = () => {
      const hasBadge = Inventory.has('prisonerBadge', 2);
      if (hasBadge) {
        Inventory.remove('prisonerBadge', 2);
        // Reward
        const reward = { id: 'celestialOrb', count: 1 };
        Inventory.add(reward.id, reward.count);
        Player.gainExp(500);
        // Giảm wanted level về 0
        if (typeof WantedSystem !== 'undefined') {
          WantedSystem.wantedList.forEach(w => { w.diedAt = null; });
          UI.addLog('🕵 "Đây, phần thưởng xứng đáng. Wanted level xóa sạch!"', 'npc');
        }
        localStorage.setItem(doneKey, '1');
        UI.showNotification('🏅 Quest Hoàn Thành!', '+Celestial Orb +500 EXP');
        FailureSystem._wantedArrestActive = false;
        document.removeEventListener('knowledge:dungeonDeath', questCheck);
      }
    };

    // Check every kill
    const _origKill = Enemies.kill.bind(Enemies);
    Enemies.kill = function(enemy) {
      _origKill(enemy);
      if (enemy._prisonGuard) questCheck();
    };
  },

  // ─── Render traces in world ──────────────────────────────────
  renderTraces(ctx) {
    if (!DungeonSystem || !DungeonSystem.sessionState || !DungeonSystem.sessionState.active) return;
    const now = Date.now();
    const cam = GameState.camera;

    for (const trace of this._traces) {
      if (!trace.ghostAlive) continue;
      if (trace.mapIndex !== Maps.currentIndex) continue;
      if (now - trace.spawnTime > this.DUNGEON_TRACE_LIFETIME) {
        trace.ghostAlive = false;
        continue;
      }

      const sx = trace.x - cam.x;
      const sy = trace.y - cam.y;
      const pulse = 0.5 + Math.sin(GameState.time / 300) * 0.5;

      ctx.save();
      ctx.globalAlpha = pulse * 0.7;
      ctx.fillStyle = '#9e9e9e';
      ctx.beginPath();
      ctx.arc(sx, sy, 16, 0, Math.PI*2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.font = '14px serif';
      ctx.textAlign = 'center';
      ctx.fillText('👻', sx, sy+5);
      ctx.font = '9px monospace';
      ctx.fillStyle = '#e0e0e0';
      ctx.fillText(trace.items.length + ' items', sx, sy-22);

      // Remaining time
      const secLeft = Math.floor((this.DUNGEON_TRACE_LIFETIME - (now - trace.spawnTime)) / 1000 / 60);
      ctx.fillStyle = '#aaa';
      ctx.font = '8px monospace';
      ctx.fillText(secLeft + 'p còn lại', sx, sy+25);

      // Tap hint khi gần
      if (Utils.dist(Player.x, Player.y, trace.x, trace.y) < 50) {
        ctx.fillStyle = '#fff';
        ctx.font = '9px monospace';
        ctx.fillText('👆 Nhấn để chiến đấu', sx, sy-36);
      }

      ctx.restore();
    }
  },

  renderPrisonGate(ctx) {
    if (!this._prisonState || !this._prisonState.active) return;
    const pm = this.PRISON_MAP;
    const gateX = (pm.width - 2) * CONFIG.TILE_SIZE;
    const gateY = Math.floor(pm.height / 2) * CONFIG.TILE_SIZE;
    const sx = gateX - GameState.camera.x;
    const sy = gateY - GameState.camera.y;

    const hasKey = Inventory.has('prisonKey', 1);
    ctx.font = '20px serif';
    ctx.textAlign = 'center';
    ctx.fillText(hasKey ? '🚪' : '🔒', sx + 16, sy + 20);
    ctx.font = '9px monospace';
    ctx.fillStyle = hasKey ? '#4caf50' : '#f44336';
    ctx.fillText(hasKey ? 'THOÁT' : 'Cần chìa', sx + 16, sy + 35);
  },

  // ─── Update ──────────────────────────────────────────────────
  update(dt) {
    // Prison timer
    if (this._prisonState && this._prisonState.active) {
      this._updatePrison(dt);
    }

    // Expire old traces
    const now = Date.now();
    this._traces = this._traces.filter(t => {
      if (!t.ghostAlive) return false;
      if (now - t.spawnTime > this.DUNGEON_TRACE_LIFETIME) { t.ghostAlive = false; return false; }
      return true;
    });
  },

  // ─── Save/Load traces ────────────────────────────────────────
  _saveTraces() {
    try {
      localStorage.setItem('tuxien_dungeon_traces', JSON.stringify(
        this._traces.map(t => ({
          id: t.id, mapIndex: t.mapIndex, dungeonId: t.dungeonId,
          x: t.x, y: t.y, items: t.items,
          spawnTime: t.spawnTime, ghostAlive: t.ghostAlive
        }))
      ));
    } catch (_) {}
  },

  _loadTraces() {
    try {
      const raw = localStorage.getItem('tuxien_dungeon_traces');
      if (!raw) return;
      this._traces = JSON.parse(raw);
      // Expire on load
      const now = Date.now();
      this._traces = this._traces.filter(t =>
        t.ghostAlive && (now - t.spawnTime) < this.DUNGEON_TRACE_LIFETIME
      );
    } catch (_) {}
  },

  // ─── Init ────────────────────────────────────────────────────
  init() {
    if (typeof Game === 'undefined' || typeof Player === 'undefined' ||
        typeof Enemies === 'undefined' || typeof Maps === 'undefined') {
      setTimeout(() => this.init(), 300);
      return;
    }

    this._loadTraces();
    this._hookPlayerDie();
    this._hookGameUpdate();
    this._hookGameRender();
    this._hookHandleTap();
    this._hookSaveLoad();
    this._hookNPCInteract();
    this._hookWantedArrest();
    this._hookMapsGetTileColor();

    console.log('💀 FailureSystem initialized');
  },

  // ─── Hook: Player.die ────────────────────────────────────────
  _hookPlayerDie() {
    const _orig = Player.die.bind(Player);
    const self  = this;

    Player.die = function() {
      const inDungeon = typeof DungeonSystem !== 'undefined' &&
                        DungeonSystem.sessionState && DungeonSystem.sessionState.active;
      const inBossFight = typeof BossEventSystem !== 'undefined' &&
                          BossEventSystem.bossState && BossEventSystem.bossState.active &&
                          BossEventSystem._onBossMap();
      const inPrison = self._prisonState && self._prisonState.active;

      // Không kích hoạt failure nếu đang trong ngục
      if (inPrison) { _orig(); return; }

      if (inBossFight) {
        const handled = triggerFailureState('boss_capture', {
          bossId: BossEventSystem.bossState.bossId,
          mapIndex: Maps.currentIndex
        });
        if (handled) {
          // Không gọi die() gốc — ta xử lý respawn trong prison
          Player.hp = Math.max(1, Math.floor(Player.maxHp * 0.2));
          Player.alive = true;
          return;
        }
      }

      if (inDungeon) {
        triggerFailureState('dungeon_death', {
          dungeonId: 'dungeon_' + Maps.currentIndex
        });
        // Vẫn gọi die gốc để xử lý respawn bình thường của dungeon
      }

      _orig();
    };
  },

  // ─── Hook: WantedSystem — arrest ────────────────────────────
  _hookWantedArrest() {
    if (typeof WantedSystem === 'undefined') {
      setTimeout(() => this._hookWantedArrest(), 1000);
      return;
    }

    // Wrap onEliteKilled — nếu wanted level = max (3 alive) và player bị "bắt"
    // WantedSystem không có arrest mechanic trực tiếp — ta thêm logic vào update
    // Khi player HP xuống 0 gần Elite wanted → trigger arrest thay vì die
    const _origPlayerDie = Player.die.bind(Player);
    const self = this;

    // Không wrap lại Player.die (đã wrap trên) — thay vào đó detect context
    // trong _hookPlayerDie đã handle rồi, thêm wanted arrest detection:
    const _origHookPlayerDie = Player.die.bind(Player);
    Player.die = function() {
      const nearWanted = WantedSystem && WantedSystem.wantedList &&
        WantedSystem.wantedList.some(w =>
          w.alive && Utils.dist(Player.x, Player.y, w.x, w.y) < 120
        );
      const wantedCount = WantedSystem ? WantedSystem.wantedList.filter(w => w.alive).length : 0;

      // Arrest chỉ khi đủ wanted (2+ alive) và gần Elite
      if (nearWanted && wantedCount >= 2 && !self._prisonState?.active) {
        const handled = triggerFailureState('wanted_arrest', {});
        if (handled) {
          Player.hp = Math.max(1, Math.floor(Player.maxHp * 0.1));
          Player.alive = true;
          return;
        }
      }

      _origHookPlayerDie();
    };
  },

  // ─── Hook: NPC.interact — prison NPCs ───────────────────────
  _hookNPCInteract() {
    const _orig = NPC.interact.bind(NPC);
    const self  = this;

    NPC.interact = function(npc) {
      if (npc && npc.service === 'prisoner') {
        NPC.currentDialog = npc;
        const d = document.getElementById('npcDialog');
        document.getElementById('npcName').textContent  = npc.name;
        document.getElementById('npcTitle').textContent = npc.title;
        document.getElementById('npcText').textContent  = npc.dialog;
        const opts = document.getElementById('npcOptions');
        opts.innerHTML = '';
        NPC.addCloseOption(opts);
        if (d) d.classList.add('show');
        return;
      }

      if (npc && npc.service === 'wantedPrisonerQuest') {
        self.startWantedPrisonerQuest();
        NPC.currentDialog = npc;
        const d = document.getElementById('npcDialog');
        document.getElementById('npcName').textContent  = npc.name;
        document.getElementById('npcTitle').textContent = npc.title;
        document.getElementById('npcText').textContent  = npc.dialog;
        const opts = document.getElementById('npcOptions');
        opts.innerHTML = '';
        NPC.addCloseOption(opts);
        if (d) d.classList.add('show');
        return;
      }

      _orig(npc);
    };
  },

  // ─── Hook: Game.update ───────────────────────────────────────
  _hookGameUpdate() {
    const _orig = Game.update.bind(Game);
    const self  = this;
    Game.update = function(dt) { _orig(dt); if (GameState.running) self.update(dt); };
  },

  // ─── Hook: Game.renderObjects ────────────────────────────────
  _hookGameRender() {
    const _origObjs = Game.renderObjects.bind(Game);
    const self = this;
    Game.renderObjects = function() {
      _origObjs();
      self.renderTraces(this.ctx);
      self.renderPrisonGate(this.ctx);
    };
  },

  // ─── Hook: Game.handleTap ────────────────────────────────────
  _hookHandleTap() {
    const _orig = Game.handleTap.bind(Game);
    const self  = this;

    Game.handleTap = function(sx, sy) {
      const wx = sx + GameState.camera.x;
      const wy = sy + GameState.camera.y;

      // Tap trace ghost
      for (const trace of self._traces) {
        if (!trace.ghostAlive) continue;
        if (trace.mapIndex !== Maps.currentIndex) continue;
        if (Utils.dist(wx, wy, trace.x, trace.y) < 50) {
          self._startGhostTraceCombat(trace);
          return;
        }
      }

      _orig(sx, sy);
    };
  },

  // ─── Hook: Save/Load ─────────────────────────────────────────
  _hookSaveLoad() {
    const _origSave = Game.save.bind(Game);
    const _origLoad = Game.load.bind(Game);
    const self = this;
    Game.save = function() { _origSave(); self._saveTraces(); };
    Game.load = function() { const r = _origLoad(); self._loadTraces(); return r; };
  },

  // ─── Hook: Maps tile color (prison map) ──────────────────────
  _hookMapsGetTileColor() {
    const _orig = Maps.getTileColor.bind(Maps);
    const self  = this;
    Maps.getTileColor = function(tile, x, y) {
      if (self._prisonBgActive) {
        const pm = self.PRISON_MAP;
        if (tile === 1) return pm.wallColor;
        return ((x+y) % 2 === 0) ? pm.tileColor : '#150000';
      }
      return _orig(tile, x, y);
    };
  }
};

// ─── Prison HUD ──────────────────────────────────────────────
const PrisonHUD = {
  _el: null,

  show(maxMs) {
    if (!this._el) {
      this._el = document.createElement('div');
      this._el.id = 'prisonHUD';
      this._el.style.cssText = [
        'position:absolute;top:50px;left:50%;transform:translateX(-50%);',
        'background:rgba(0,0,0,0.85);border:2px solid #f44336;',
        'border-radius:8px;padding:6px 20px;z-index:25;',
        'text-align:center;pointer-events:none;',
        'font-family:"Courier New",monospace;'
      ].join('');
      document.body.appendChild(this._el);
    }
    this._el.style.display = 'block';
    this._el.innerHTML = `<span style="color:#f44336;font-size:12px;font-weight:bold">⛓ NGỤC THẤT</span>
      <div id="prisonTimer" style="color:#ff8a65;font-size:10px">Thoát sau: 5:00</div>
      <div style="color:#888;font-size:9px">Tìm 🗝 từ quái ngục</div>`;
  },

  update(remainingMs) {
    const t = document.getElementById('prisonTimer');
    if (!t) return;
    const s = Math.max(0, Math.ceil(remainingMs / 1000));
    const m = Math.floor(s / 60);
    const sec = s % 60;
    t.textContent = 'Thoát sau: ' + m + ':' + String(sec).padStart(2,'0');
    t.style.color = s < 60 ? '#f44336' : '#ff8a65';
  },

  hide() {
    if (this._el) this._el.style.display = 'none';
  }
};

// ─── Auto-init ───────────────────────────────────────────────
(function() {
  function tryInit() {
    if (typeof Game !== 'undefined' && typeof Player !== 'undefined' &&
        typeof Enemies !== 'undefined' && typeof Maps !== 'undefined' &&
        typeof NPC !== 'undefined') {
      FailureSystem.init();
    } else {
      setTimeout(tryInit, 300);
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(tryInit, 600));
  } else {
    setTimeout(tryInit, 600);
  }
})();

console.log('💀 feature_failure_rewards.js loaded');
