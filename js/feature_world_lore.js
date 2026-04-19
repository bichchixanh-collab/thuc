// ==================== WORLD LORE SYSTEM ====================
// feature_world_lore.js — WorldRuins + VoidRift + ParallelWorld
// Load sau: game.js
// <script src="js/feature_world_lore.js"></script>

// ============================================================
// SECTION 1 — CONFIG DATA
// ============================================================

const WORLD_LORE_CONFIG = {
  storageKey: 'tuxien_world_lore',

  // 20 di tích phân bố trên 6 maps
  ruins: [
    // Map 0 — Thanh Vân Sơn (4 ruins)
    { id: 'r0_1', mapIndex: 0, tx: 5,  ty: 5,
      name: 'Bia Khai Thiên', icon: '🗿',
      lore: 'Thuở khai thiên lập địa, Nguyên Khí đầu tiên hình thành tại đây... Những vết khắc trên bia đá vẫn còn tỏa ra linh khí huyền bí.',
      completeReward: null },
    { id: 'r0_2', mapIndex: 0, tx: 55, ty: 8,
      name: 'Giếng Cổ', icon: '💧',
      lore: 'Giếng nước này đã tồn tại từ trước khi con người đặt chân lên mảnh đất này. Nước giếng lạnh buốt nhưng mang theo linh khí thanh khiết.',
      completeReward: null },
    { id: 'r0_3', mapIndex: 0, tx: 8,  ty: 52,
      name: 'Cổ Thụ Nghìn Năm', icon: '🌳',
      lore: 'Cây cổ thụ này đã chứng kiến sự thăng trầm của bao thế hệ tu sĩ. Rễ cây ăn sâu vào mạch đất, hút linh khí từ tầng sâu nhất.',
      completeReward: null },
    { id: 'r0_4', mapIndex: 0, tx: 52, ty: 55,
      name: 'Đài Thiên Văn', icon: '⭐',
      lore: 'Người xưa dùng đài này để quan sát thiên văn và tiên đoán vận mệnh. Ánh sao đêm nay vẫn sáng như thuở ban đầu.',
      completeReward: { item: 'expPotion', count: 2 } },

    // Map 1 — U Minh Cốc (3 ruins)
    { id: 'r1_1', mapIndex: 1, tx: 6,  ty: 6,
      name: 'Ngục Hồn Bia', icon: '💀',
      lore: 'Vô số linh hồn bị giam cầm tại đây bởi Ma Vương cổ đại. Tiếng than vãn vẫn còn văng vẳng trong không khí tăm tối.',
      completeReward: null },
    { id: 'r1_2', mapIndex: 1, tx: 54, ty: 10,
      name: 'Ngai Vàng Bỏ Hoang', icon: '👑',
      lore: 'Đây từng là nơi ngự của Ma Hoàng đệ nhất thiên hạ. Quyền uy một thời giờ chỉ còn là bụi tro và ký ức.',
      completeReward: null },
    { id: 'r1_3', mapIndex: 1, tx: 10, ty: 54,
      name: 'Huyết Trì', icon: '🩸',
      lore: 'Hồ máu này hình thành từ vô số trận chiến tàn khốc. Linh khí âm u thấm vào từng giọt nước đỏ thẫm không bao giờ khô cạn.',
      completeReward: { item: 'demonCore', count: 5 } },

    // Map 2 — Hỏa Diệm Sơn (3 ruins)
    { id: 'r2_1', mapIndex: 2, tx: 4,  ty: 56,
      name: 'Lò Thiên Hỏa', icon: '🔥',
      lore: 'Viêm Đế đã rèn kiếm thần tại lò lửa này ngàn năm trước. Nhiệt độ nơi đây đủ để nung chảy cả kim cương.',
      completeReward: null },
    { id: 'r2_2', mapIndex: 2, tx: 56, ty: 4,
      name: 'Cột Hỏa Linh', icon: '🏛️',
      lore: 'Cột đá này tự bốc lửa — linh khí hỏa nguyên tố kết tinh thành hình. Không ai dám chạm tay vào vì sợ bị thiêu đốt từ bên trong.',
      completeReward: null },
    { id: 'r2_3', mapIndex: 2, tx: 30, ty: 55,
      name: 'Dung Nham Hóa Thạch', icon: '🌋',
      lore: 'Thứ dung nham này không nguội lạnh trong vạn năm. Trong đó ẩn chứa bí mật về nguồn gốc của hỏa linh tộc.',
      completeReward: { item: 'flameSword', count: 1 } },

    // Map 3 — Băng Hàn Địa (3 ruins)
    { id: 'r3_1', mapIndex: 3, tx: 5,  ty: 4,
      name: 'Tháp Băng Vĩnh Cửu', icon: '🏔️',
      lore: 'Tháp này được Băng Đế xây dựng để phong ấn một thứ gì đó cực kỳ nguy hiểm. Những vết nứt trên tường đang ngày càng rộng ra...',
      completeReward: null },
    { id: 'r3_2', mapIndex: 3, tx: 55, ty: 5,
      name: 'Gương Thiên Hàn', icon: '🪞',
      lore: 'Gương băng phản chiếu hình ảnh của người sắp chết. Đừng nhìn quá lâu — có người đã không rời khỏi được.',
      completeReward: null },
    { id: 'r3_3', mapIndex: 3, tx: 5,  ty: 54,
      name: 'Mộ Băng Hoàng', icon: '⚰️',
      lore: 'Đây là nơi an nghỉ của Băng Hoàng đệ nhất... hay đó là bẫy? Linh khí băng giá tỏa ra từ ngôi mộ chưa bao giờ tắt.',
      completeReward: { item: 'frostSword', count: 1 } },

    // Map 4 — Thiên Ma Động (4 ruins)
    { id: 'r4_1', mapIndex: 4, tx: 4,  ty: 4,
      name: 'Cổng Hắc Ám', icon: '🌑',
      lore: 'Cổng này thông đến một nơi mà ngay cả Ma Vương cũng sợ. Những gì ẩn sau cánh cổng kia không thuộc về thế giới này.',
      completeReward: null },
    { id: 'r4_2', mapIndex: 4, tx: 56, ty: 56,
      name: 'Thư Viện Ma Đạo', icon: '📚',
      lore: 'Những cuốn sách này chứa bí mật về nguồn gốc của sức mạnh thực sự. Chữ viết trong đó... dường như đang thay đổi mỗi lần ngươi nhìn.',
      completeReward: null },
    { id: 'r4_3', mapIndex: 4, tx: 4,  ty: 56,
      name: 'Bàn Thờ Hư Vô', icon: '🕯️',
      lore: 'Ai đó đã thờ phụng một thực thể không thuộc thế giới này. Ngọn nến trên bàn thờ vẫn còn cháy dù không có gió.',
      completeReward: null },
    { id: 'r4_4', mapIndex: 4, tx: 56, ty: 4,
      name: 'Ký Ức Bị Xóa', icon: '🧠',
      lore: 'Ngươi... ngươi đã từng ở đây trước. Nhưng ký ức đã bị xóa. Tại sao? Bởi ai? Câu trả lời có lẽ nằm ở nơi xa hơn.',
      completeReward: { item: 'celestialOrb', count: 2 } },

    // Map 5 — Tiên Giới (3 ruins)
    { id: 'r5_1', mapIndex: 5, tx: 5,  ty: 5,
      name: 'Cổng Thiên Đình', icon: '🌈',
      lore: 'Đây là cổng dẫn đến Thiên Đình — nhưng nó đã bị khóa từ một thời đại xa xưa. Ai đã khóa nó, và tại sao?',
      completeReward: null },
    { id: 'r5_2', mapIndex: 5, tx: 55, ty: 6,
      name: 'Bia Tiên Sử', icon: '📜',
      lore: 'Toàn bộ lịch sử Tiên Giới được khắc trên đây — từ ngày khai thiên đến ngày đại kiếp. Và tên ngươi cũng xuất hiện trong đó.',
      completeReward: null },
    { id: 'r5_3', mapIndex: 5, tx: 6,  ty: 54,
      name: 'Nơi Kết Thúc & Khởi Đầu', icon: '♾️',
      lore: 'Nơi đây... chính là nơi ngươi đã bắt đầu hành trình. Và cũng là nơi kết thúc. Vòng tròn khép lại — hay mở ra?',
      completeReward: { item: 'celestialSword', count: 1 } }
  ],

  // Reward khi hoàn thành TẤT CẢ 20 di tích
  allRuinsReward: {
    item: 'celestialOrb', count: 5,
    title: 'Sử Gia',
    passive: { expBonus: 0.10 }
  }
};

// ============================================================
const VOID_RIFT_CONFIG = {
  spawnInterval: { min: 15 * 60 * 1000, max: 25 * 60 * 1000 },
  portalLifetime: 5 * 60 * 1000,
  voidDuration:   3 * 60 * 1000,
  enemyKillToExit: 10,
  rules: { noSkillCooldown: true, allSkillsAoe: true, gravityFromTop: true },
  lootTable: [
    { id: 'voidCrystal',  chance: 0.80, count: 1 },
    { id: 'chaosScroll',  chance: 0.30, count: 1 },
    { id: 'voidFragment', chance: 0.40, count: 1 },
    { id: 'celestialOrb', chance: 0.15, count: 1 },
    { id: 'realmPill',    chance: 0.50, count: 2 }
  ],
  voidCrystalItem: {
    id: 'voidCrystal', name: 'Hư Không Tinh Thể', type: 'material',
    rarity: 'epic', desc: 'Tinh thể từ Cõi Hư Không. Dùng để enhance void attribute.',
    sellPrice: 400, effect: {}
  },
  chaosScrollItem: {
    id: 'chaosScroll', name: 'Hỗn Độn Thư', type: 'consumable',
    rarity: 'legendary', desc: 'Random lại toàn bộ stat của 1 equipment.',
    effect: { chaosReforge: true }, sellPrice: 1000
  },
  voidFragmentItem: {
    id: 'voidFragment', name: 'Mảnh Hư Không', type: 'material',
    rarity: 'rare', desc: 'Thu thập 10 mảnh để triệu hồi Void Boss.',
    sellPrice: 200, effect: {}
  }
};

// ============================================================
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
    wolf:      { name: 'Bạch Lang',  color: '#00bcd4', element: 'ice',
                 drops: [{ id: 'celestialOrb', chance: 0.10 }, { id: 'spiritStone', chance: 0.50 }] },
    ghost:     { name: 'Quang Ma',   color: '#fff9c4', element: 'light',
                 drops: [{ id: 'celestialOrb', chance: 0.15 }, { id: 'realmPill',   chance: 0.30 }] },
    demon:     { name: 'Quang Thần', color: '#e1f5fe', element: 'light',
                 drops: [{ id: 'dragonScale',  chance: 0.20 }, { id: 'celestialOrb', chance: 0.10 }] },
    fireSpirit:{ name: 'Hàn Linh',  color: '#80deea', element: 'ice',
                 drops: [{ id: 'frostSword',   chance: 0.05 }, { id: 'spiritStone', chance: 0.40 }] },
    rockGolem: { name: 'Thủy Linh',  color: '#4fc3f7', element: 'ice',
                 drops: [{ id: 'ironArmor',    chance: 0.10 }, { id: 'demonCore',   chance: 0.30 }] },
    iceWolf:   { name: 'Hỏa Lang',  color: '#ff7043', element: 'fire',
                 drops: [{ id: 'flameSword',   chance: 0.05 }, { id: 'wolfFang',    chance: 0.40 }] }
  },
  canvasFilter: 'hue-rotate(180deg) saturate(0.7)',
  exclusiveItems: {
    mirrorEssence: {
      id: 'mirrorEssence', name: 'Tinh Chất Song Thế', type: 'material',
      rarity: 'legendary', desc: 'Vật liệu từ thế giới song song. Vô cùng quý hiếm.',
      sellPrice: 2000, effect: {}
    }
  },
  parallelKeyItem: {
    id: 'parallelKey', name: 'Chìa Khóa Song Thế', type: 'consumable',
    rarity: 'epic', desc: 'Mở cổng vào Thế Giới Song Song. Đến cổng trên bản đồ để dùng.',
    effect: { openParallel: true }, sellPrice: 500
  }
};

// ============================================================
// SECTION 2 — WORLD RUINS SYSTEM
// ============================================================

const WorldRuinsSystem = {
  state: {
    discoveredRuins: {},
    mapCompleted: {},
    allCompleted: false,
    allRuinsPassive: false,
    activeInspection: null
  },

  getRuinsForMap(mapIndex) {
    return WORLD_LORE_CONFIG.ruins.filter(r => r.mapIndex === mapIndex);
  },

  isDiscovered(ruinId) {
    return !!this.state.discoveredRuins[ruinId];
  },

  inspect(ruin) {
    if (!this.state.discoveredRuins[ruin.id]) {
      this.state.discoveredRuins[ruin.id] = {
        visitCount: 0,
        firstVisitTime: Date.now()
      };
    }
    this.state.discoveredRuins[ruin.id].visitCount++;

    const isFirst = this.state.discoveredRuins[ruin.id].visitCount === 1;

    LorePanel.show(ruin);

    if (isFirst) {
      UI.addLog('🗿 Khám phá: ' + ruin.name, 'item');
      this._checkMapCompletion(ruin.mapIndex);
    }
    this._saveData();
  },

  _checkMapCompletion(mapIndex) {
    const mapRuins = this.getRuinsForMap(mapIndex);
    const allFound = mapRuins.every(r => this.isDiscovered(r.id));
    if (!allFound || this.state.mapCompleted[mapIndex]) return;

    this.state.mapCompleted[mapIndex] = true;

    const lastRuin = mapRuins[mapRuins.length - 1];
    if (lastRuin.completeReward) {
      Inventory.add(lastRuin.completeReward.item, lastRuin.completeReward.count);
      const mapName = Maps.data[mapIndex] ? Maps.data[mapIndex].name : 'Bản đồ ' + mapIndex;
      UI.showNotification('📜 Bản Đồ Hoàn Thành!', mapName + ' — ' + (ITEMS[lastRuin.completeReward.item]?.name || lastRuin.completeReward.item));
      UI.addLog('📜 Khám phá hết di tích ' + mapName + '!', 'realm');
    }
    this._checkAllCompletion();
  },

  _checkAllCompletion() {
    if (this.state.allCompleted) return;
    const allMaps = [0, 1, 2, 3, 4, 5];
    if (!allMaps.every(i => this.state.mapCompleted[i])) return;

    this.state.allCompleted = true;
    this.state.allRuinsPassive = true;
    const r = WORLD_LORE_CONFIG.allRuinsReward;
    Inventory.add(r.item, r.count);
    Player.recalculateStats();
    UI.showNotification('📖 Nhật Ký Thiên Địa Hoàn Thành!',
      'Danh hiệu: ' + r.title + ' | +10% EXP vĩnh viễn');
    UI.addLog('📖 Tất cả 20 di tích đã được khám phá! Danh hiệu: ' + r.title, 'realm');
    this._saveData();
  },

  render(ctx) {
    const ruins = this.getRuinsForMap(Maps.currentIndex);
    ruins.forEach(ruin => {
      const wx = ruin.tx * CONFIG.TILE_SIZE + 16;
      const wy = ruin.ty * CONFIG.TILE_SIZE + 16;
      const cx = wx - GameState.camera.x;
      const cy = wy - GameState.camera.y;

      // Cull
      if (cx < -50 || cx > Game.canvas.width + 50) return;
      if (cy < -50 || cy > Game.canvas.height + 50) return;

      // Sparkle
      if (Math.random() < 0.02) {
        GameState.particles.push({
          x: wx + (Math.random() - 0.5) * 20,
          y: wy + (Math.random() - 0.5) * 20,
          vx: (Math.random() - 0.5) * 0.5, vy: -0.8 - Math.random(),
          life: 600, color: '#f0c040', size: 2 + Math.random() * 2
        });
      }

      // Icon
      const discovered = this.isDiscovered(ruin.id);
      ctx.globalAlpha = discovered ? 0.9 : 0.6;
      ctx.font = '20px serif';
      ctx.textAlign = 'center';
      ctx.fillText(ruin.icon, cx, cy + 6);

      // Glow ring
      const pulse = 0.3 + Math.sin(GameState.time / 400) * 0.2;
      ctx.globalAlpha = pulse * 0.4;
      ctx.strokeStyle = discovered ? '#4caf50' : '#f0c040';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, 15, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Label khi gần
      const dist = Utils.dist(Player.x, Player.y, wx, wy);
      if (dist < 100) {
        ctx.fillStyle = '#f0c040';
        ctx.font = '9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(ruin.name, cx, cy - 22);
        if (!discovered) {
          ctx.fillStyle = '#888';
          ctx.font = '8px monospace';
          ctx.fillText('[Chạm để khám phá]', cx, cy - 12);
        }
      }
    });
  },

  _saveData() {
    try {
      localStorage.setItem(WORLD_LORE_CONFIG.storageKey + '_ruins', JSON.stringify(this.state));
    } catch(e) {}
  },

  _loadData() {
    try {
      const raw = localStorage.getItem(WORLD_LORE_CONFIG.storageKey + '_ruins');
      if (raw) {
        const saved = JSON.parse(raw);
        this.state.discoveredRuins = saved.discoveredRuins || {};
        this.state.mapCompleted    = saved.mapCompleted    || {};
        this.state.allCompleted    = saved.allCompleted    || false;
        this.state.allRuinsPassive = saved.allRuinsPassive || false;
      }
    } catch(e) {}
  }
};

// ============================================================
// SECTION 3 — VOID RIFT SYSTEM
// ============================================================

const VoidRiftSystem = {
  state: {
    portal: null,
    nextSpawnTime: 0,
    inVoid: false,
    killCount: 0,
    timeRemaining: 0,
    savedState: null,
    exitPortal: null,
    voidFragments: 0,
    _voidBossSpawned: false
  },

  trySpawnPortal() {
    if (this.state.portal || this.state.inVoid) return;

    let tx, ty, attempts = 0;
    do {
      tx = 5 + Math.floor(Math.random() * (CONFIG.WORLD_WIDTH - 10));
      ty = 5 + Math.floor(Math.random() * (CONFIG.WORLD_HEIGHT - 10));
      attempts++;
    } while (Maps.isWater(tx, ty) && attempts < 20);
    if (Maps.isWater(tx, ty)) return;

    this.state.portal = {
      x: tx * CONFIG.TILE_SIZE + 16,
      y: ty * CONFIG.TILE_SIZE + 16,
      spawnTime: GameState.time,
      lifetime: VOID_RIFT_CONFIG.portalLifetime
    };
    UI.addLog('🌀 Vết nứt không gian xuất hiện gần đây!', 'realm');
    UI.showNotification('🌀 Cõi Hư Không', 'Vết nứt không gian xuất hiện!');
  },

  enterVoid() {
    // Save world state
    this.state.savedState = {
      mapIndex: Maps.currentIndex,
      tiles: JSON.parse(JSON.stringify(Maps.tiles)),
      objects: [...Maps.objects],
      enemies: [...Enemies.list],
      playerX: Player.x,
      playerY: Player.y
    };

    // Generate simple void arena 10x10
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

    // Spawn enemies from top
    const mapData = Maps.data[this.state.savedState.mapIndex] || Maps.data[0];
    for (let i = 0; i < 8; i++) {
      const typeKey = mapData.enemies[Math.floor(Math.random() * mapData.enemies.length)];
      const e = Enemies.spawn(typeKey, 1.5, Player.level + 2);
      if (e) {
        e.x = (1 + Math.floor(Math.random() * 8)) * CONFIG.TILE_SIZE + 16;
        e.y = CONFIG.TILE_SIZE + 16;
        e._voidEnemy = true;
      }
    }

    this.state.inVoid = true;
    this.state.killCount = 0;
    this.state.timeRemaining = VOID_RIFT_CONFIG.voidDuration;
    this.state.portal = null;
    this.state.exitPortal = null;
    this.state._aoeActive = true;

    Player.x = 5 * CONFIG.TILE_SIZE + 16;
    Player.y = 5 * CONFIG.TILE_SIZE + 16;

    VoidHUD.show();
    UI.addLog('🌀 Bước vào Cõi Hư Không! Luật lệ khác thường...', 'realm');
    UI.showNotification('🌀 Cõi Hư Không', 'Không hồi chiêu · Tất cả AOE · Quái từ trên trời rơi!');
  },

  update(dt) {
    // Portal expiry
    if (this.state.portal) {
      const age = GameState.time - this.state.portal.spawnTime;
      if (age > this.state.portal.lifetime) {
        this.state.portal = null;
        UI.addLog('🌀 Vết nứt đã đóng lại...', 'system');
      }
    }

    // Next portal spawn
    if (!this.state.portal && !this.state.inVoid &&
        GameState.time > this.state.nextSpawnTime && this.state.nextSpawnTime > 0) {
      const interval = VOID_RIFT_CONFIG.spawnInterval;
      this.state.nextSpawnTime = GameState.time +
        Utils.randomInt(interval.min, interval.max);
      this.trySpawnPortal();
    }

    if (!this.state.inVoid) return;

    // Countdown
    this.state.timeRemaining -= dt;
    VoidHUD.update(this.state.timeRemaining, this.state.killCount);

    // No cooldown rule
    if (this.state._aoeActive && Player.skills) {
      for (const skill of Player.skills) {
        skill.cd = 0;
      }
    }

    // Void gravity: occasionally spawn enemy from top
    this._updateVoidEnemyGravity();

    // Exit conditions
    if (this.state.killCount >= VOID_RIFT_CONFIG.enemyKillToExit && !this.state.exitPortal) {
      this._spawnExitPortal();
    }
    if (this.state.timeRemaining <= 0) {
      this.exitVoid();
    }
  },

  _updateVoidEnemyGravity() {
    const alive = Enemies.list.filter(e => e.alive && e._voidEnemy).length;
    if (alive < 5 && Math.random() < 0.002) {
      const mapData = Maps.data[this.state.savedState?.mapIndex || 0] || Maps.data[0];
      const typeKey = mapData.enemies[Math.floor(Math.random() * mapData.enemies.length)];
      const e = Enemies.spawn(typeKey, 1.5, Player.level + 2);
      if (e) {
        e.x = (1 + Math.floor(Math.random() * 8)) * CONFIG.TILE_SIZE + 16;
        e.y = CONFIG.TILE_SIZE + 16;
        e._voidEnemy = true;
      }
    }
  },

  _spawnExitPortal() {
    this.state.exitPortal = {
      x: 5 * CONFIG.TILE_SIZE + 16,
      y: 5 * CONFIG.TILE_SIZE + 16
    };
    UI.addLog('🌀 Exit Portal xuất hiện! Đến đó để thoát.', 'realm');
    UI.showNotification('🌀 Đủ Kill!', 'Exit Portal đã xuất hiện');
  },

  exitVoid() {
    if (!this.state.inVoid) return;
    this.state.inVoid = false;
    this.state._aoeActive = false;

    // Roll loot
    const lootLog = [];
    for (const l of VOID_RIFT_CONFIG.lootTable) {
      if (Utils.chance(l.chance)) {
        Inventory.add(l.id, l.count);
        lootLog.push(ITEMS[l.id]?.name || l.id);
        if (l.id === 'voidFragment') {
          this.state.voidFragments++;
          this._checkVoidBoss();
        }
      }
    }
    if (lootLog.length) UI.addLog('🌀 Void Loot: ' + lootLog.join(', '), 'item');

    // Restore
    if (this.state.savedState) {
      Maps.tiles   = this.state.savedState.tiles;
      Maps.objects = this.state.savedState.objects;
      Enemies.list = this.state.savedState.enemies;
      Player.x     = this.state.savedState.playerX;
      Player.y     = this.state.savedState.playerY;
      this.state.savedState = null;
    }

    // Restore skill CDs to 0
    if (Player.skills) {
      for (const skill of Player.skills) skill.cd = 0;
    }

    VoidHUD.hide();
    UI.showNotification('🌀 Thoát Cõi Hư Không', 'Loot: ' + lootLog.length + ' items');
    UI.addLog('🌀 Đã thoát Cõi Hư Không.', 'system');
  },

  _checkVoidBoss() {
    if (this.state.voidFragments >= 10 && !this.state._voidBossSpawned) {
      this.state._voidBossSpawned = true;
      this.state.voidFragments -= 10;
      const boss = Enemies.spawn('celestialDragon', 2.0, Player.level + 10);
      if (boss) {
        boss.name  = '【虛空】' + boss.name;
        boss.color = '#7c4dff';
        boss._voidBoss = true;
      }
      UI.showNotification('🌀 Void Boss Triệu Hồi!', boss ? boss.name : 'Quái Hư Không');
      UI.addLog('🌀 Void Boss xuất hiện!', 'realm');
      // Reset flag after a bit so can spawn again
      setTimeout(() => { this.state._voidBossSpawned = false; }, 60000);
    }
  },

  render(ctx) {
    // Portal on world map
    if (this.state.portal && !this.state.inVoid) {
      const cx = this.state.portal.x - GameState.camera.x;
      const cy = this.state.portal.y - GameState.camera.y;
      const pulse = 0.4 + Math.sin(GameState.time / 200) * 0.3;
      const age = GameState.time - this.state.portal.spawnTime;
      const lifeRatio = Math.max(0, 1 - age / this.state.portal.lifetime);

      // Outer ring
      ctx.globalAlpha = pulse * lifeRatio;
      ctx.strokeStyle = '#7c4dff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, 20 + Math.sin(GameState.time / 150) * 4, 0, Math.PI * 2);
      ctx.stroke();

      // Inner void
      ctx.globalAlpha = 0.6 * lifeRatio;
      ctx.fillStyle = '#000033';
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.fill();

      // Swirl particles
      if (Math.random() < 0.08) {
        const a = Math.random() * Math.PI * 2;
        GameState.particles.push({
          x: this.state.portal.x + Math.cos(a) * 20,
          y: this.state.portal.y + Math.sin(a) * 20,
          vx: -Math.cos(a) * 1.5, vy: -Math.sin(a) * 1.5,
          life: 400, color: '#7c4dff', size: 2 + Math.random() * 2
        });
      }

      ctx.globalAlpha = 1;
      ctx.fillStyle = '#e040fb';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('🌀 Cõi Hư Không', cx, cy - 28);

      // Distance hint
      const dist = Utils.dist(Player.x, Player.y, this.state.portal.x, this.state.portal.y);
      if (dist < 120) {
        ctx.fillStyle = '#888';
        ctx.font = '8px monospace';
        ctx.fillText('[Chạm để vào]', cx, cy - 18);
      }
    }

    // Exit portal inside void
    if (this.state.inVoid && this.state.exitPortal) {
      const cx = this.state.exitPortal.x - GameState.camera.x;
      const cy = this.state.exitPortal.y - GameState.camera.y;
      const pulse = 0.5 + Math.sin(GameState.time / 200) * 0.3;

      ctx.globalAlpha = pulse;
      ctx.strokeStyle = '#4caf50';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, 18, 0, Math.PI * 2);
      ctx.stroke();

      ctx.globalAlpha = 1;
      ctx.font = '22px serif';
      ctx.textAlign = 'center';
      ctx.fillText('🔵', cx, cy + 7);
      ctx.fillStyle = '#4caf50';
      ctx.font = '9px monospace';
      ctx.fillText('EXIT', cx, cy - 22);
    }
  }
};

// ============================================================
// SECTION 4 — PARALLEL WORLD SYSTEM
// ============================================================

const ParallelWorldSystem = {
  state: {
    inParallel: false,
    sessionStartTime: 0,
    timeUsedToday: 0,
    lastResetDate: null,
    savedState: null,
    _filterActive: false,
    _dailyLimitReached: false
  },

  canEnter() {
    if (Player.realm < PARALLEL_WORLD_CONFIG.requireRealm) return false;
    if (this.state.inParallel) return false;
    const today = new Date(Date.now()).toDateString();
    if (this.state.lastResetDate !== today) {
      this.state.timeUsedToday = 0;
      this.state.lastResetDate = today;
      this.state._dailyLimitReached = false;
    }
    return !this.state._dailyLimitReached;
  },

  enter() {
    if (!this.canEnter()) {
      if (Player.realm < PARALLEL_WORLD_CONFIG.requireRealm) {
        UI.addLog('❌ Cần Đại Thừa Kỳ (Realm 6) để vào Song Thế!', 'system');
      } else {
        UI.addLog('❌ Đã hết thời gian Song Thế hôm nay!', 'system');
      }
      return false;
    }

    this.state.savedState = {
      mapIndex: Maps.currentIndex,
      tiles: JSON.parse(JSON.stringify(Maps.tiles)),
      objects: [...Maps.objects],
      enemies: [...Enemies.list],
      playerX: Player.x,
      playerY: Player.y
    };

    this.state.inParallel = true;
    this.state.sessionStartTime = Date.now();
    this.state._filterActive = true;

    // Mirror enemies
    Enemies.list = Enemies.list.map(enemy => {
      if (!enemy.alive) return enemy;
      const mirror = PARALLEL_WORLD_CONFIG.mirrorEnemies[enemy.type];
      if (!mirror) return enemy;
      return {
        ...enemy,
        name: mirror.name,
        color: mirror.color,
        drops: mirror.drops,
        _parallelMirror: true,
        _mirrorElement: mirror.element,
        _origType: enemy.type
      };
    });

    // Visual filter
    if (Game.canvas) Game.canvas.style.filter = PARALLEL_WORLD_CONFIG.canvasFilter;

    UI.showNotification('🌑 Thế Giới Song Song', 'Thực tại bị đảo lộn...');
    UI.addLog('🌑 Bước vào Thế Giới Song Song!', 'realm');
    ParallelHUD.show();
    return true;
  },

  update(dt) {
    if (!this.state.inParallel) return;

    const elapsed = Date.now() - this.state.sessionStartTime;
    const remaining = PARALLEL_WORLD_CONFIG.dailyDurationMs - elapsed;
    ParallelHUD.updateTimer(remaining);

    if (remaining <= 0) {
      this.exit();
    }
  },

  exit() {
    if (!this.state.inParallel) return;
    this.state.inParallel = false;
    this.state._filterActive = false;
    this.state.timeUsedToday += Date.now() - this.state.sessionStartTime;

    if (this.state.timeUsedToday >= PARALLEL_WORLD_CONFIG.dailyDurationMs) {
      this.state._dailyLimitReached = true;
    }

    // Remove filter
    if (Game.canvas) Game.canvas.style.filter = '';

    // Restore
    if (this.state.savedState) {
      Maps.tiles   = this.state.savedState.tiles;
      Maps.objects = this.state.savedState.objects;
      Enemies.list = this.state.savedState.enemies;
      Player.x     = this.state.savedState.playerX;
      Player.y     = this.state.savedState.playerY;
      this.state.savedState = null;
    }

    ParallelHUD.hide();
    UI.addLog('🌑 Trở về thế giới thực...', 'system');
  },

  getPortalPosition(mapIndex) {
    const p = PARALLEL_WORLD_CONFIG.portalPositions.find(pp => pp.mapIndex === mapIndex);
    if (!p) return null;
    return { x: p.tx * CONFIG.TILE_SIZE + 16, y: p.ty * CONFIG.TILE_SIZE + 16 };
  },

  render(ctx) {
    if (this.state.inParallel) return; // canvas filter handles it

    if (!this.canEnter()) {
      // Still show portal but grayed out if realm not met
      if (Player.realm >= PARALLEL_WORLD_CONFIG.requireRealm) return;
    }

    const pos = this.getPortalPosition(Maps.currentIndex);
    if (!pos) return;

    const cx = pos.x - GameState.camera.x;
    const cy = pos.y - GameState.camera.y;

    if (cx < -60 || cx > Game.canvas.width + 60) return;
    if (cy < -60 || cy > Game.canvas.height + 60) return;

    const pulse = 0.5 + Math.sin(GameState.time / 300) * 0.3;

    ctx.globalAlpha = pulse * 0.65;
    ctx.strokeStyle = '#9c27b0';
    ctx.lineWidth = 3;
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
    ctx.fillStyle = '#9c27b0';
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('🌑 Song Thế', cx, cy - 26);

    const dist = Utils.dist(Player.x, Player.y, pos.x, pos.y);
    if (dist < 100) {
      ctx.fillStyle = '#888';
      ctx.font = '8px monospace';
      if (Player.realm < PARALLEL_WORLD_CONFIG.requireRealm) {
        ctx.fillText('Cần: Đại Thừa Kỳ', cx, cy - 16);
      } else if (this.state._dailyLimitReached) {
        ctx.fillText('Hết thời gian hôm nay', cx, cy - 16);
      } else {
        ctx.fillText('Cần: Chìa Khóa Song Thế', cx, cy - 16);
      }
    }
  }
};

// ============================================================
// SECTION 5 — UI PANELS
// ============================================================

const LorePanel = {
  el: null,

  init() {
    const div = document.createElement('div');
    div.id = 'lorePanel';
    div.style.cssText = `
      display:none; position:fixed; bottom:0; left:50%;
      transform:translateX(-50%);
      background:linear-gradient(135deg,#1a1a2e,#16213e);
      border:2px solid #f0c040; border-radius:12px 12px 0 0;
      padding:15px 20px; width:90%; max-width:380px;
      z-index:150; box-sizing:border-box;
      font-family:'Courier New', monospace;
    `;
    div.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <div id="loreIcon" style="font-size:22px"></div>
        <div id="loreName"  style="color:#f0c040;font-size:13px;font-weight:bold;flex:1;margin:0 10px"></div>
        <div id="loreVisits" style="color:#666;font-size:9px;margin-right:8px"></div>
        <div id="loreClose"  style="color:#888;cursor:pointer;font-size:18px;line-height:1">✕</div>
      </div>
      <div id="loreText"     style="color:#ccc;font-size:11px;line-height:1.7;font-style:italic"></div>
      <div id="loreProgress" style="color:#4caf50;font-size:9px;margin-top:10px"></div>
    `;
    document.body.appendChild(div);
    this.el = div;

    document.getElementById('loreClose').addEventListener('click', () => {
      this.hide();
    });
  },

  show(ruin) {
    const data = WorldRuinsSystem.state.discoveredRuins[ruin.id];
    document.getElementById('loreIcon').textContent   = ruin.icon;
    document.getElementById('loreName').textContent   = ruin.name;
    document.getElementById('loreVisits').textContent = '×' + (data?.visitCount || 1);
    document.getElementById('loreText').textContent   = ruin.lore;

    const mapRuins = WorldRuinsSystem.getRuinsForMap(ruin.mapIndex);
    const found = mapRuins.filter(r => WorldRuinsSystem.isDiscovered(r.id)).length;
    const mapName = Maps.data[ruin.mapIndex] ? Maps.data[ruin.mapIndex].name : 'Bản đồ';
    document.getElementById('loreProgress').textContent =
      mapName + ': ' + found + '/' + mapRuins.length + ' di tích';

    this.el.style.display = 'block';

    if (this._autoTimer) clearTimeout(this._autoTimer);
    this._autoTimer = setTimeout(() => this.hide(), 9000);
  },

  hide() {
    if (this.el) this.el.style.display = 'none';
    if (this._autoTimer) clearTimeout(this._autoTimer);
  }
};

// ============================================================
const VoidHUD = {
  el: null,
  init() {
    const div = document.createElement('div');
    div.id = 'voidHUD';
    div.style.cssText = `
      display:none; position:absolute; top:50px; left:50%;
      transform:translateX(-50%);
      background:rgba(0,0,0,0.88); border:2px solid #7c4dff;
      border-radius:8px; padding:6px 20px; z-index:25;
      text-align:center; pointer-events:none;
      font-family:'Courier New',monospace;
    `;
    div.innerHTML = `
      <div style="color:#7c4dff;font-size:11px;font-weight:bold">🌀 Cõi Hư Không</div>
      <div style="display:flex;gap:15px;justify-content:center;margin-top:3px;font-size:10px;color:#ccc">
        <span>⏱ <span id="voidTimer">3:00</span></span>
        <span>💀 <span id="voidKills">0</span>/10</span>
      </div>
    `;
    document.body.appendChild(div);
    this.el = div;
  },
  show() { if (this.el) this.el.style.display = 'block'; },
  hide() { if (this.el) this.el.style.display = 'none'; },
  update(remaining, kills) {
    const sec = Math.max(0, Math.ceil(remaining / 1000));
    const mm = Math.floor(sec / 60);
    const ss = (sec % 60).toString().padStart(2, '0');
    const timerEl = document.getElementById('voidTimer');
    const killEl  = document.getElementById('voidKills');
    if (timerEl) timerEl.textContent = mm + ':' + ss;
    if (killEl)  killEl.textContent  = kills;
  }
};

// ============================================================
const ParallelHUD = {
  el: null,
  init() {
    const div = document.createElement('div');
    div.id = 'parallelHUD';
    div.style.cssText = `
      display:none; position:absolute; top:10px; left:50%;
      transform:translateX(-50%);
      background:rgba(74,20,140,0.92); border:2px solid #9c27b0;
      border-radius:8px; padding:4px 16px; z-index:25;
      text-align:center; pointer-events:none;
      font-family:'Courier New',monospace;
    `;
    div.innerHTML = `
      <div style="color:#e040fb;font-size:10px">
        🌑 Thế Giới Song Song — ⏱ <span id="parallelTimer">10:00</span>
      </div>
    `;
    document.body.appendChild(div);
    this.el = div;
  },
  show() { if (this.el) this.el.style.display = 'block'; },
  hide() { if (this.el) this.el.style.display = 'none'; },
  updateTimer(remaining) {
    const sec = Math.max(0, Math.ceil(remaining / 1000));
    const mm = Math.floor(sec / 60);
    const ss = (sec % 60).toString().padStart(2, '0');
    const el = document.getElementById('parallelTimer');
    if (el) el.textContent = mm + ':' + ss;
  }
};

// ============================================================
// SECTION 6 — KHỞI ĐỘNG & HOOKS
// ============================================================

const WorldLoreFeature = {
  _initialized: false,

  init() {
    if (this._initialized) return;
    this._initialized = true;

    // Inject new items into ITEMS
    if (typeof ITEMS !== 'undefined') {
      ITEMS.voidCrystal   = VOID_RIFT_CONFIG.voidCrystalItem;
      ITEMS.chaosScroll   = VOID_RIFT_CONFIG.chaosScrollItem;
      ITEMS.voidFragment  = VOID_RIFT_CONFIG.voidFragmentItem;
      ITEMS.mirrorEssence = PARALLEL_WORLD_CONFIG.exclusiveItems.mirrorEssence;
      ITEMS.parallelKey   = PARALLEL_WORLD_CONFIG.parallelKeyItem;
    }

    // Init UI
    LorePanel.init();
    VoidHUD.init();
    ParallelHUD.init();

    // Load saved ruin data
    WorldRuinsSystem._loadData();

    // Schedule first void portal (5 min from start)
    VoidRiftSystem.state.nextSpawnTime = (typeof GameState !== 'undefined' ? GameState.time : 0) + 5 * 60 * 1000;

    // ---- Hook Game.update ----
    const _origUpdate = Game.update.bind(Game);
    Game.update = function(dt) {
      _origUpdate(dt);
      VoidRiftSystem.update(dt);
      ParallelWorldSystem.update(dt);
    };

    // ---- Hook Game.renderObjects (world-space after ctx.save) ----
    const _origRenderObjects = Game.renderObjects.bind(Game);
    Game.renderObjects = function() {
      _origRenderObjects();
      const ctx = Game.ctx;
      WorldRuinsSystem.render(ctx);
      VoidRiftSystem.render(ctx);
      ParallelWorldSystem.render(ctx);
    };

    // ---- Hook Game.render for void overlay (screen-space) ----
    const _origRender = Game.render.bind(Game);
    Game.render = function() {
      _origRender();
      if (VoidRiftSystem.state.inVoid) {
        const ctx = Game.ctx;
        ctx.fillStyle = '#000033';
        ctx.globalAlpha = 0.15;
        ctx.fillRect(0, 0, Game.canvas.width, Game.canvas.height);
        ctx.globalAlpha = 1;
      }
    };

    // ---- Hook Game.handleTap ----
    const _origHandleTap = Game.handleTap.bind(Game);
    Game.handleTap = function(screenX, screenY) {
      const worldX = screenX + GameState.camera.x;
      const worldY = screenY + GameState.camera.y;

      // 1) Ruins inspect
      const ruins = WorldRuinsSystem.getRuinsForMap(Maps.currentIndex);
      for (const ruin of ruins) {
        const wx = ruin.tx * CONFIG.TILE_SIZE + 16;
        const wy = ruin.ty * CONFIG.TILE_SIZE + 16;
        if (Utils.dist(worldX, worldY, wx, wy) < 50) {
          WorldRuinsSystem.inspect(ruin);
          return;
        }
      }

      // 2) Void rift portal enter
      if (VoidRiftSystem.state.portal && !VoidRiftSystem.state.inVoid) {
        const p = VoidRiftSystem.state.portal;
        if (Utils.dist(worldX, worldY, p.x, p.y) < 60) {
          VoidRiftSystem.enterVoid();
          return;
        }
      }

      // 3) Void exit portal
      if (VoidRiftSystem.state.inVoid && VoidRiftSystem.state.exitPortal) {
        const ep = VoidRiftSystem.state.exitPortal;
        if (Utils.dist(worldX, worldY, ep.x, ep.y) < 60) {
          VoidRiftSystem.exitVoid();
          return;
        }
      }

      // 4) Parallel world portal
      if (!ParallelWorldSystem.state.inParallel) {
        const pos = ParallelWorldSystem.getPortalPosition(Maps.currentIndex);
        if (pos && Utils.dist(worldX, worldY, pos.x, pos.y) < 60) {
          if (Player.realm < PARALLEL_WORLD_CONFIG.requireRealm) {
            UI.addLog('❌ Cần Đại Thừa Kỳ để vào Song Thế!', 'system');
            return;
          }
          if (Inventory.has('parallelKey', 1)) {
            Inventory.remove('parallelKey', 1);
            ParallelWorldSystem.enter();
          } else {
            UI.addLog('❌ Cần Chìa Khóa Song Thế!', 'system');
            UI.showNotification('🌑 Song Thế', 'Cần: Chìa Khóa Song Thế');
          }
          return;
        }
      } else {
        // Inside parallel — tap anywhere off portal to exit? Optional: show exit button
        // (Not implementing auto-exit tap to avoid accidental exit)
      }

      // 5) Fall through to original
      _origHandleTap(screenX, screenY);
    };

    // ---- Hook Enemies.kill — void kill count + parallel mirror drop ----
    const _origEnemiesKill = Enemies.kill.bind(Enemies);
    Enemies.kill = function(enemy) {
      _origEnemiesKill(enemy);

      // Void kill count
      if (enemy._voidEnemy) {
        VoidRiftSystem.state.killCount++;
      }

      // Parallel mirror exclusive drop
      if (enemy._parallelMirror && Utils.chance(0.05)) {
        Inventory.add('mirrorEssence', 1);
        UI.addLog('✨ Nhận Tinh Chất Song Thế!', 'item');
      }
    };

    // ---- Hook Player.gainExp — ruins passive ----
    const _origGainExp = Player.gainExp.bind(Player);
    Player.gainExp = function(amount) {
      if (WorldRuinsSystem.state.allRuinsPassive) {
        amount = Math.floor(amount * (1 + WORLD_LORE_CONFIG.allRuinsReward.passive.expBonus));
      }
      _origGainExp(amount);
    };

    // ---- Hook Player.recalculateStats — ruins passive flag ----
    const _origRecalc = Player.recalculateStats.bind(Player);
    Player.recalculateStats = function() {
      _origRecalc();
      if (WorldRuinsSystem.state.allRuinsPassive) {
        Player._ruinsExpBonus = WORLD_LORE_CONFIG.allRuinsReward.passive.expBonus;
      }
    };

    // ---- Hook Inventory.useItem — chaosScroll + parallelKey ----
    const _origUseItem = Inventory.useItem.bind(Inventory);
    Inventory.useItem = function(itemId) {
      const itemData = ITEMS[itemId];
      if (itemData && itemData.effect) {
        if (itemData.effect.chaosReforge) {
          // Chaos reforge: randomize a random equipped item stat
          const slots = Object.keys(Player.equipped).filter(s => Player.equipped[s]);
          if (slots.length === 0) {
            UI.addLog('❌ Không có trang bị nào để dùng Hỗn Độn Thư!', 'system');
            return false;
          }
          if (!Inventory.has(itemId)) return false;
          const slot = slots[Math.floor(Math.random() * slots.length)];
          const eqId = Player.equipped[slot];
          const eq = ITEMS[eqId];
          if (eq && eq.stats) {
            const statKeys = Object.keys(eq.stats);
            statKeys.forEach(k => {
              const orig = eq.stats[k];
              eq.stats[k] = Math.floor(orig * (0.7 + Math.random() * 0.7));
            });
            Player.recalculateStats();
            UI.addLog('🌀 Hỗn Độn Thư: Stats của ' + eq.name + ' đã được random lại!', 'item');
            Inventory.remove(itemId, 1);
            Inventory.render();
            return true;
          }
          return false;
        }
        if (itemData.effect.openParallel) {
          UI.addLog('🌑 Đến cổng Song Thế trên bản đồ để sử dụng!', 'system');
          Inventory.remove(itemId, 0); // don't consume here
          return false;
        }
      }
      return _origUseItem(itemId);
    };

    // ---- Hook Game.save / Game.load ----
    const _origSave = Game.save.bind(Game);
    Game.save = function() {
      _origSave();
      try {
        const loreData = {
          ruinsState:    WorldRuinsSystem.state,
          voidFragments: VoidRiftSystem.state.voidFragments,
          parallelDaily: {
            timeUsedToday:    ParallelWorldSystem.state.timeUsedToday,
            lastResetDate:    ParallelWorldSystem.state.lastResetDate,
            _dailyLimitReached: ParallelWorldSystem.state._dailyLimitReached
          }
        };
        localStorage.setItem(WORLD_LORE_CONFIG.storageKey, JSON.stringify(loreData));
      } catch(e) {}
    };

    const _origLoad = Game.load.bind(Game);
    Game.load = function() {
      const result = _origLoad();
      try {
        const raw = localStorage.getItem(WORLD_LORE_CONFIG.storageKey);
        if (raw) {
          const d = JSON.parse(raw);
          if (d.ruinsState) {
            WorldRuinsSystem.state.discoveredRuins = d.ruinsState.discoveredRuins || {};
            WorldRuinsSystem.state.mapCompleted    = d.ruinsState.mapCompleted    || {};
            WorldRuinsSystem.state.allCompleted    = d.ruinsState.allCompleted    || false;
            WorldRuinsSystem.state.allRuinsPassive = d.ruinsState.allRuinsPassive || false;
          }
          if (d.voidFragments !== undefined) {
            VoidRiftSystem.state.voidFragments = d.voidFragments;
          }
          if (d.parallelDaily) {
            ParallelWorldSystem.state.timeUsedToday    = d.parallelDaily.timeUsedToday    || 0;
            ParallelWorldSystem.state.lastResetDate    = d.parallelDaily.lastResetDate    || null;
            ParallelWorldSystem.state._dailyLimitReached = d.parallelDaily._dailyLimitReached || false;
          }
        }
      } catch(e) {}
      return result;
    };

    // ---- Sync NPC: Add lore NPCs to spawnForMap ----
    // Add "Sử Quan" (Lore Keeper) NPC to each map for quest & lore context
    const _origNPCTypes = NPC.types;
    NPC.types.loreKeeper = {
      name: 'Sử Quan',
      title: 'Người Ghi Chép Lịch Sử',
      sprite: 'npcTeleporter',
      dialog: 'Chào đạo hữu! Ta ghi lại mọi di tích trên thế giới này. Hãy tìm và khám phá chúng!',
      service: 'lore'
    };
    NPC.types.voidSage = {
      name: 'Hư Không Hiền Giả',
      title: 'Tu sĩ Cõi Hư Không',
      sprite: 'npcShop',
      dialog: 'Cõi Hư Không đang rỉ ra... Nếu ngươi dũng cảm, hãy bước qua vết nứt.',
      service: 'voidInfo'
    };

    // Extend NPC.spawnForMap
    const _origNPCSpawn = NPC.spawnForMap.bind(NPC);
    NPC.spawnForMap = function(mapIndex) {
      _origNPCSpawn(mapIndex);
      // Spawn Sử Quan near ruins anchor
      NPC.spawn('loreKeeper', 450, 340);
      // Spawn Hư Không Hiền Giả on maps 2+
      if (mapIndex >= 2) {
        NPC.spawn('voidSage', 350, 460);
      }
    };

    // Extend NPC.interact to handle new service types
    const _origNPCInteract = NPC.interact.bind(NPC);
    NPC.interact = function(npc) {
      if (npc.service === 'lore') {
        _origNPCInteract(npc);
        // Override options for lore service
        const optionsEl = document.getElementById('npcOptions');
        optionsEl.innerHTML = '';

        // Show ruin progress
        const totalRuins = WORLD_LORE_CONFIG.ruins.length;
        const discovered = Object.keys(WorldRuinsSystem.state.discoveredRuins).length;
        const mapRuins = WorldRuinsSystem.getRuinsForMap(Maps.currentIndex);
        const mapFound = mapRuins.filter(r => WorldRuinsSystem.isDiscovered(r.id)).length;

        const infoEl = document.createElement('div');
        infoEl.style.cssText = 'color:#f0c040;font-size:11px;margin-bottom:10px;line-height:1.6';
        infoEl.innerHTML = `
          📜 Tiến độ Di Tích<br>
          <span style="color:#ccc">Bản đồ này: ${mapFound}/${mapRuins.length}</span><br>
          <span style="color:#ccc">Toàn bộ: ${discovered}/${totalRuins}</span><br>
          ${WorldRuinsSystem.state.allCompleted ?
            '<span style="color:#4caf50">✅ Danh hiệu: Sử Gia (+10% EXP)</span>' :
            '<span style="color:#888">Khám phá hết để nhận danh hiệu Sử Gia</span>'}
        `;
        optionsEl.appendChild(infoEl);
        NPC.addCloseOption(optionsEl);
        return;
      }
      if (npc.service === 'voidInfo') {
        _origNPCInteract(npc);
        const optionsEl = document.getElementById('npcOptions');
        optionsEl.innerHTML = '';

        const infoEl = document.createElement('div');
        infoEl.style.cssText = 'color:#e040fb;font-size:11px;margin-bottom:10px;line-height:1.6';
        const fragCount = VoidRiftSystem.state.voidFragments;
        infoEl.innerHTML = `
          🌀 Cõi Hư Không<br>
          <span style="color:#ccc">Mảnh Hư Không: ${fragCount}/10</span><br>
          <span style="color:#888">10 mảnh → Void Boss triệu hồi</span><br>
          <span style="color:#888">Khi vào void: không hồi chiêu, AOE x2</span>
        `;
        optionsEl.appendChild(infoEl);
        NPC.addCloseOption(optionsEl);
        return;
      }
      _origNPCInteract(npc);
    };

    console.log('🗿 World Lore System loaded (Ruins + Void + Parallel)');
  }
};

// ============================================================
// Auto-init after Game is ready
// ============================================================
(function() {
  // Hook Game.init to run WorldLoreFeature.init after
  const _origGameInit = Game.init.bind(Game);
  Game.init = function() {
    _origGameInit();
    WorldLoreFeature.init();
  };
})();

console.log('🗿 feature_world_lore.js parsed — waiting for Game.init()');
