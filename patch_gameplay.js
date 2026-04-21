// ==================== PATCH GAMEPLAY ====================
// Thực hiện:
//   [3]  Nâng drop rate gold/exp của oan hồn (ghost type) lên 0.2
//   [6b] Spawn player tại safezone khi chuyển map / hồi sinh
//   [6c] Block enemy không được vào safezone
// Load SAU: maps.js, enemies.js, player.js, game.js, patch_maps.js

(function patchGameplay() {

  // ================================================================
  // [3] NÂNG DROP RATE GHOST/U LINH LÊN 0.2
  // Trong enemies.js, type 'ghost' (U Linh) có:
  //   drops: [
  //     { id: 'spiritStone', chance: 0.1 },
  //     { id: 'mpPotion',    chance: 0.15 }
  //   ]
  // exp: 35, gold: 18 — đây là quái thường, không phải Ghost PvP
  // "tỉ lệ drop gold/exp = 0" không phải trong drops[]
  // mà có thể do kill() luôn drop 100% exp/gold.
  // Theo yêu cầu: "nâng tỉ lệ drop gold/exp của oan hồn = 0.2"
  // → Ta patch Enemies.kill() để ghost chỉ drop gold/exp với xác suất 20%
  //   (thay vì 100% như hiện tại), và đồng thời nâng drop chance của items lên 0.2
  // ================================================================
  function patchGhostDropRate() {
    if (typeof Enemies === 'undefined') {
      console.error('[patch_gameplay] Enemies chưa load!');
      return;
    }

    // Tăng drop chance items của ghost type
    if (Enemies.types && Enemies.types.ghost) {
      Enemies.types.ghost.drops = [
        { id: 'spiritStone', chance: 0.2 },
        { id: 'mpPotion',    chance: 0.2 }
      ];
      console.log('[patch_gameplay] ✅ Ghost drop rate items → 0.2');
    }

    // Patch Enemies.kill() để ghost có xác suất 0.2 nhận gold/exp
    const _origKill = Enemies.kill.bind(Enemies);
    Enemies.kill = function(enemy) {
      if (enemy && enemy.type === 'ghost') {
        // Ghost: chỉ có 20% cơ hội nhận exp/gold
        const willDrop = Math.random() < 0.2;
        if (!willDrop) {
          // Không drop exp/gold — chỉ xử lý cái chết + drops items
          enemy.alive = false;
          enemy.respawnTimer = 10000;

          // Death particles
          for (let i = 0; i < 10; i++) {
            if (typeof GameState !== 'undefined') {
              GameState.particles.push({
                x: enemy.x,
                y: enemy.y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4 - 2,
                life: 600,
                color: '#add8e6', // ghost color
                size: 3 + Math.random() * 3
              });
            }
          }

          // Item drops (với chance đã tăng)
          for (const drop of enemy.drops) {
            if (Math.random() < drop.chance) {
              if (typeof Inventory !== 'undefined' && typeof ITEMS !== 'undefined' && ITEMS[drop.id]) {
                if (Inventory.add(drop.id, 1)) {
                  if (typeof UI !== 'undefined') {
                    UI.addLog(`📦 Nhận ${ITEMS[drop.id].name}!`, 'item');
                  }
                }
              }
            }
          }

          // Quest progress
          if (typeof Quests !== 'undefined') {
            Quests.updateProgress(enemy.type, 1);
          }

          // Clear target
          if (typeof Player !== 'undefined' && Player.target === enemy) {
            Player.target = null;
            if (typeof UI !== 'undefined') UI.hideTargetInfo();
          }

          if (typeof UI !== 'undefined') {
            UI.addLog(`👻 U Linh tan biến... (không rớt vàng)`, 'system');
          }
          return;
        }
        // Nếu willDrop = true → chạy kill() bình thường
      }

      _origKill(enemy);
    };

    console.log('[patch_gameplay] ✅ Patch Enemies.kill() cho ghost drop rate 0.2');
  }

  // ================================================================
  // [6b] SPAWN TẠI SAFEZONE KHI CHUYỂN MAP / HỒI SINH
  // ================================================================
  function patchSpawnAtSafezone() {

    // --- Patch Maps.travelTo(): set player về safezone.spawnX/Y ---
    if (typeof Maps !== 'undefined' && typeof Maps.travelTo === 'function') {
      const _origTravelTo = Maps.travelTo.bind(Maps);
      Maps.travelTo = function(mapIndex) {
        const result = _origTravelTo(mapIndex);
        if (result && typeof Maps.getSpawnPoint === 'function') {
          const spawn = Maps.getSpawnPoint(mapIndex);
          if (typeof Player !== 'undefined') {
            Player.x = spawn.x;
            Player.y = spawn.y;
            if (Player.pet) {
              Player.pet.x = spawn.x + (Player.pet.offsetX || 25);
              Player.pet.y = spawn.y + (Player.pet.offsetY || 12);
            }
          }
          console.log('[patch_gameplay] Spawn at safezone:', spawn.x, spawn.y);
        }
        return result;
      };
      console.log('[patch_gameplay] ✅ Maps.travelTo() → spawn tại safezone');
    } else {
      console.warn('[patch_gameplay] TODO: verify — Maps.travelTo không tìm thấy');
    }

    // --- Patch Player.respawn(): hồi sinh tại safezone ---
    if (typeof Player !== 'undefined' && typeof Player.respawn === 'function') {
      const _origRespawn = Player.respawn.bind(Player);
      Player.respawn = function() {
        _origRespawn();
        // Override vị trí về safezone
        if (typeof Maps !== 'undefined' && typeof Maps.getSpawnPoint === 'function') {
          const spawn = Maps.getSpawnPoint();
          this.x = spawn.x;
          this.y = spawn.y;
          if (this.pet) {
            this.pet.x = spawn.x + (this.pet.offsetX || 25);
            this.pet.y = spawn.y + (this.pet.offsetY || 12);
          }
          console.log('[patch_gameplay] Respawn tại safezone:', spawn.x, spawn.y);
        }
      };
      console.log('[patch_gameplay] ✅ Player.respawn() → hồi sinh tại safezone');
    } else {
      console.warn('[patch_gameplay] TODO: verify — Player.respawn không tìm thấy');
    }

    // --- Patch Game.init() load save: reset vị trí về safezone ---
    // Player.loadSaveData() dùng x/y từ save → override về safezone sau khi load
    if (typeof Game !== 'undefined' && typeof Game.load === 'function') {
      const _origLoad = Game.load.bind(Game);
      Game.load = function() {
        const result = _origLoad();
        if (result && typeof Maps !== 'undefined' && typeof Maps.getSpawnPoint === 'function') {
          const spawn = Maps.getSpawnPoint();
          if (typeof Player !== 'undefined') {
            Player.x = spawn.x;
            Player.y = spawn.y;
          }
        }
        return result;
      };
    }
  }

  // ================================================================
  // [6c] BLOCK ENEMY VÀO SAFEZONE
  // Patch Enemies.update() để enemy không chase/attack player trong safezone
  // ================================================================
  function patchEnemySafezone() {
    if (typeof Enemies === 'undefined') {
      console.error('[patch_gameplay] Enemies chưa load (safezone block)!');
      return;
    }

    const _origUpdate = Enemies.update.bind(Enemies);
    Enemies.update = function(dt) {
      // Chạy update gốc trước
      _origUpdate(dt);

      // Sau khi update: nếu player trong safezone,
      // reset aggroed + đẩy enemy ra ngoài safezone nếu đã vào quá gần
      if (typeof Maps === 'undefined' || typeof Maps.isInSafezone !== 'function') return;

      const playerInSafe = Maps.isInSafezone(Player.x, Player.y);
      if (!playerInSafe) return;

      const sz = Maps.data[Maps.currentIndex]?.safezone;
      if (!sz) return;

      for (const enemy of this.list) {
        if (!enemy.alive) continue;

        // Tắt aggro với player trong safezone
        enemy.aggroed = false;

        // Nếu enemy đã vào trong safezone → đẩy ra ngoài
        if (Maps.isInSafezone(enemy.x, enemy.y)) {
          // Tính điểm gần nhất trên biên safezone và đẩy ra
          const centerX = sz.x + sz.width / 2;
          const centerY = sz.y + sz.height / 2;

          const dx = enemy.x - centerX;
          const dy = enemy.y - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;

          // Đẩy enemy ra theo hướng tâm safezone → biên
          const pushSpeed = 3;
          enemy.x += (dx / dist) * pushSpeed;
          enemy.y += (dy / dist) * pushSpeed;

          // Clamp world bounds
          if (typeof CONFIG !== 'undefined') {
            enemy.x = Math.max(30, Math.min(CONFIG.WORLD_WIDTH * CONFIG.TILE_SIZE - 30, enemy.x));
            enemy.y = Math.max(30, Math.min(CONFIG.WORLD_HEIGHT * CONFIG.TILE_SIZE - 30, enemy.y));
          }
        }
      }
    };

    console.log('[patch_gameplay] ✅ Enemies.update() → block safezone');
  }

  // ================================================================
  // [6d] RENDER SAFEZONE DOM OVERLAY TRÊN CANVAS
  // Tạo 1 div#safezoneOverlay định vị theo camera, cập nhật mỗi frame
  // ================================================================
  function initSafezoneOverlay() {
    // Tạo container overlay
    const overlay = document.createElement('div');
    overlay.id = 'safezoneOverlay';

    const label = document.createElement('div');
    label.id = 'safezoneLabel';
    label.textContent = '🛡️ VÙNG AN TOÀN';
    overlay.appendChild(label);

    document.body.appendChild(overlay);

    // Cập nhật vị trí overlay theo camera mỗi frame
    // Patch Game.render() để sync overlay với camera
    if (typeof Game !== 'undefined' && typeof Game.render === 'function') {
      const _origRender = Game.render.bind(Game);
      Game.render = function() {
        _origRender();
        updateSafezoneOverlay();
      };
    } else {
      // Fallback: RAF loop độc lập
      function rafLoop() {
        updateSafezoneOverlay();
        requestAnimationFrame(rafLoop);
      }
      requestAnimationFrame(rafLoop);
    }

    function updateSafezoneOverlay() {
      if (typeof Maps === 'undefined' || typeof GameState === 'undefined') return;

      const sz = Maps.data[Maps.currentIndex]?.safezone;
      if (!sz) {
        overlay.style.display = 'none';
        return;
      }

      const cam = GameState.camera;

      // Chuyển tọa độ world → screen
      const screenX = sz.x - cam.x;
      const screenY = sz.y - cam.y;

      overlay.style.display = 'block';
      overlay.style.left = screenX + 'px';
      overlay.style.top = screenY + 'px';
      overlay.style.width = sz.width + 'px';
      overlay.style.height = sz.height + 'px';

      // Class khi player đang trong safezone
      if (typeof Player !== 'undefined' &&
          typeof Maps.isInSafezone === 'function' &&
          Maps.isInSafezone(Player.x, Player.y)) {
        overlay.classList.add('player-inside');
      } else {
        overlay.classList.remove('player-inside');
      }
    }

    console.log('[patch_gameplay] ✅ Safezone overlay DOM đã khởi tạo');
  }

  // ================================================================
  // KHỞI CHẠY
  // ================================================================
  function applyAll() {
    patchGhostDropRate(); // [3]
    patchSpawnAtSafezone(); // [6b]
    patchEnemySafezone(); // [6c]
    initSafezoneOverlay(); // [6d]
    console.log('[patch_gameplay] ✅ Tất cả patch gameplay đã áp dụng');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyAll);
  } else {
    // DOMContentLoaded đã xong, nhưng các module JS có thể chưa init
    // Dùng setTimeout nhỏ để đảm bảo game.js đã chạy xong
    setTimeout(applyAll, 100);
  }

})();
