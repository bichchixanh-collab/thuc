// ==================== PATCH MAPS ====================
// Thực hiện [6a]: Thêm safezone cho từng map trong Maps.data
// Load SAU maps.js, TRƯỚC game.js
//
// Safezone tọa độ (pixel) = tile * TILE_SIZE (TILE_SIZE = 32)
// Maps.generate() đã clear vùng tile (10,10)-(14,14) làm spawn area
// → Safezone tọa độ pixel: x=10*32=320, y=10*32=320, width=5*32=160, height=5*32=160
// Các map khác dùng cùng vị trí spawn (Player.x=400, Player.y=400) → tile (12,12) center
// → safezone bao phủ vùng (320,320)→(480,480)

(function patchMaps() {

  if (typeof Maps === 'undefined') {
    console.error('[patch_maps] Maps chưa được load!');
    return;
  }

  // Định nghĩa safezone pixel cho từng map theo index
  // Tọa độ spawn mặc định: x=400, y=400 (center of tile 12,12)
  // Safezone = vùng tile 10-14 đã được Maps.generate() clear sẵn
  const SAFEZONES = [
    // [0] Thanh Vân Sơn
    { x: 320, y: 320, width: 160, height: 160, spawnX: 400, spawnY: 400 },
    // [1] U Minh Cốc
    { x: 320, y: 320, width: 160, height: 160, spawnX: 400, spawnY: 400 },
    // [2] Hỏa Diệm Sơn
    { x: 320, y: 320, width: 160, height: 160, spawnX: 400, spawnY: 400 },
    // [3] Băng Hàn Địa
    { x: 320, y: 320, width: 160, height: 160, spawnX: 400, spawnY: 400 },
    // [4] Thiên Ma Động
    { x: 320, y: 320, width: 160, height: 160, spawnX: 400, spawnY: 400 },
    // [5] Tiên Giới Nhập Khẩu
    { x: 320, y: 320, width: 160, height: 160, spawnX: 400, spawnY: 400 },
  ];

  // Gán safezone vào Maps.data
  for (let i = 0; i < Maps.data.length; i++) {
    if (SAFEZONES[i]) {
      Maps.data[i].safezone = SAFEZONES[i];
    }
  }

  // Helper: Kiểm tra tọa độ pixel có nằm trong safezone của map hiện tại không
  Maps.isInSafezone = function(px, py, mapIndex) {
    const idx = (mapIndex !== undefined) ? mapIndex : this.currentIndex;
    const map = this.data[idx];
    if (!map || !map.safezone) return false;
    const sz = map.safezone;
    return px >= sz.x && px <= sz.x + sz.width &&
           py >= sz.y && py <= sz.y + sz.height;
  };

  // Helper: Lấy spawn point của map (dùng khi chuyển map / hồi sinh)
  Maps.getSpawnPoint = function(mapIndex) {
    const idx = (mapIndex !== undefined) ? mapIndex : this.currentIndex;
    const map = this.data[idx];
    if (map && map.safezone) {
      return { x: map.safezone.spawnX, y: map.safezone.spawnY };
    }
    return { x: 400, y: 400 }; // fallback
  };

  console.log('[patch_maps] ✅ Safezone đã được thêm vào', Maps.data.length, 'maps');

})();
