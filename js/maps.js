// ===== FILE: js/maps.js =====
// ==================== MAP SYSTEM ====================
const Maps = {
  currentIndex: 0,
  
  // Map data
  data: [
    {
      id: 'qingyun',
      name: 'Thanh Vân Sơn',
      desc: 'Núi non xanh tươi, nơi khởi đầu tu luyện',
      lvl: 1,
      enemies: ['wolf', 'boar'],
      boss: 'wolfKing',
      color: '#228b22',
      bgColor: '#1a6b1a',
      travelCost: 0,
      features: ['Thôn làng', 'Rừng cây', 'Suối nước']
    },
    {
      id: 'youming',
      name: 'U Minh Cốc',
      desc: 'Hang động tối tăm, đầy yêu ma quỷ quái',
      lvl: 10,
      enemies: ['ghost', 'demon'],
      boss: 'demonLord',
      color: '#4b0082',
      bgColor: '#2d004d',
      travelCost: 50,
      features: ['Hang động', 'Ma khí', 'Kho báu ẩn']
    },
    {
      id: 'huoyan',
      name: 'Hỏa Diệm Sơn',
      desc: 'Núi lửa nóng bỏng, linh thú hung mãnh',
      lvl: 25,
      enemies: ['rockGolem', 'fireSpirit'],
      boss: 'iceEmperor',
      color: '#ff4500',
      bgColor: '#cc3700',
      travelCost: 150,
      features: ['Nham thạch', 'Hỏa diệm', 'Quặng quý']
    },
    {
      id: 'binghan',
      name: 'Băng Hàn Địa',
      desc: 'Vùng đất băng giá vĩnh cửu',
      lvl: 40,
      enemies: ['iceWolf', 'frostBear'],
      boss: 'iceEmperor',
      color: '#87ceeb',
      bgColor: '#5fb4d9',
      travelCost: 300,
      features: ['Băng tuyết', 'Hang băng', 'Tinh thể băng']
    },
    {
      id: 'tianmo',
      name: 'Thiên Ma Động',
      desc: 'Hang ổ của ma tộc, cực kỳ nguy hiểm',
      lvl: 60,
      enemies: ['darkDemon', 'shadowLord'],
      boss: 'celestialDragon',
      color: '#8b008b',
      bgColor: '#5c005c',
      travelCost: 500,
      features: ['Ma khí dày đặc', 'Bí cảnh', 'Bảo vật ma tộc']
    },
    {
      id: 'tianjie',
      name: 'Tiên Giới Nhập Khẩu',
      desc: 'Cổng vào tiên giới, linh khí dồi dào',
      lvl: 80,
      enemies: ['celestialBeast', 'divineDragon'],
      boss: 'celestialDragon',
      color: '#ffd700',
      bgColor: '#ccac00',
      travelCost: 1000,
      features: ['Tiên khí', 'Linh thảo', 'Tiên phủ']
    }
  ],
  
  // World tiles
  tiles: [],
  objects: [],
  
  // Generate world
  generate() {
    this.tiles = [];
    this.objects = [];
    
    const map = this.data[this.currentIndex];
    
    for (let y = 0; y < CONFIG.WORLD_HEIGHT; y++) {
      this.tiles[y] = [];
      for (let x = 0; x < CONFIG.WORLD_WIDTH; x++) {
        const n = Math.random();
        
        // Different terrain based on map
        let tile = 0; // grass
        
        if (this.currentIndex === 1) { // Cave
          tile = n < 0.15 ? 1 : 0; // More paths
        } else if (this.currentIndex === 2) { // Fire mountain
          if (n < 0.08) tile = 3; // lava
          else if (n < 0.2) tile = 1; // rock path
        } else if (this.currentIndex === 3) { // Ice land
          if (n < 0.1) tile = 2; // ice/water
          else if (n < 0.25) tile = 4; // snow
        } else {
          if (n < 0.04) tile = 2; // water
          else if (n < 0.1) tile = 1; // dirt path
        }
        
        this.tiles[y][x] = tile;
        
        // Objects
        if (tile === 0 && Math.random() < 0.05) {
          const objType = this.getRandomObject();
          this.objects.push({
            x: x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
            y: y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
            type: objType
          });
        }
      }
    }
    
    // Ensure spawn area is clear
    for (let y = 10; y < 15; y++) {
      for (let x = 10; x < 15; x++) {
        if (y < CONFIG.WORLD_HEIGHT && x < CONFIG.WORLD_WIDTH) {
          this.tiles[y][x] = 0;
        }
      }
    }
    this.objects = this.objects.filter(obj => {
      const tileX = Math.floor(obj.x / CONFIG.TILE_SIZE);
      const tileY = Math.floor(obj.y / CONFIG.TILE_SIZE);
      return !(tileX >= 10 && tileX < 15 && tileY >= 10 && tileY < 15);
    });
  },
  
  // Get random object type based on map
  getRandomObject() {
    const mapObjects = {
      0: ['tree', 'tree', 'tree', 'rock', 'bush'],
      1: ['rock', 'rock', 'stalactite', 'crystal'],
      2: ['rock', 'deadTree', 'lavaRock'],
      3: ['iceRock', 'frozenTree', 'snowPile'],
      4: ['darkTree', 'demonStatue', 'skull'],
      5: ['celestialTree', 'cloudPillar', 'jadePillar']
    };
    
    const types = mapObjects[this.currentIndex] || mapObjects[0];
    return types[Math.floor(Math.random() * types.length)];
  },
  
  // Check if tile is water/blocking
  isWater(x, y) {
    if (y < 0 || y >= CONFIG.WORLD_HEIGHT || x < 0 || x >= CONFIG.WORLD_WIDTH) {
      return true;
    }
    const tile = this.tiles[y]?.[x];
    return tile === 2 || tile === 3; // water or lava
  },
  
  // Travel to map
  travelTo(mapIndex) {
    if (mapIndex === this.currentIndex) return false;
    
    const map = this.data[mapIndex];
    
    // Check level requirement
    if (Player.level < map.lvl) {
      UI.addLog(`❌ Cần đạt Level ${map.lvl} để vào ${map.name}!`, 'system');
      UI.showNotification('❌ Cấp độ không đủ!', `Yêu cầu Level ${map.lvl}`);
      return false;
    }
    
    // Check gold
    if (Player.gold < map.travelCost) {
      UI.addLog(`❌ Không đủ vàng! Cần ${map.travelCost} 💰`, 'system');
      UI.showNotification('❌ Không đủ vàng!', `Cần ${map.travelCost} 💰`);
      return false;
    }
    
    // Deduct gold
    Player.gold -= map.travelCost;
    UI.updateGold();
    
    // Change map
    this.currentIndex = mapIndex;
    this.generate();
    
    // Spawn enemies
    Enemies.spawnForMap(mapIndex);
    
    // Spawn NPCs
    NPC.spawnForMap(mapIndex);
    
    // Reset player position
    Player.x = 400;
    Player.y = 400;
    Player.target = null;
    
    // Update UI
    document.getElementById('mapName').textContent = `📍 ${map.name}`;
    
    UI.addLog(`🗺️ Di chuyển đến ${map.name}! -${map.travelCost} 💰`, 'system');
    UI.showNotification(`🗺️ ${map.name}`, map.desc);
    
    UI.closePanel('map');
    return true;
  },
  
  // Render map panel
  render() {
    const list = document.getElementById('mapList');
    list.innerHTML = '';
    
    for (let i = 0; i < this.data.length; i++) {
      const map = this.data[i];
      const canEnter = Player.level >= map.lvl;
      const isCurrent = i === this.currentIndex;
      
      const item = document.createElement('div');
      item.className = 'map-item';
      
      if (isCurrent) item.classList.add('current');
      if (!canEnter) item.classList.add('locked');
      
      // Get enemy names
      const enemyNames = map.enemies.map(e => Enemies.types[e]?.name || e).join(', ');
      const bossName = Enemies.types[map.boss]?.name || map.boss;
      
      item.innerHTML = `
        <div class="map-item-name">${isCurrent ? '📍 ' : ''}${map.name}</div>
        <div class="map-item-info">${map.desc}</div>
        <div class="map-item-info">🐾 Quái: ${enemyNames}</div>
        <div class="map-item-info">👹 Boss: ${bossName}</div>
        <div class="map-item-level">⚔️ Yêu cầu: Level ${map.lvl}</div>
        ${map.travelCost > 0 ? `<div class="map-item-cost">💰 Chi phí: ${map.travelCost} vàng</div>` : '<div class="map-item-cost" style="color:#4caf50">🆓 Miễn phí</div>'}
        ${isCurrent ? '<span class="map-badge current-badge">Đang ở đây</span>' : ''}
        ${!canEnter ? '<span class="map-badge locked-badge">🔒 Khóa</span>' : ''}
      `;
      
      item.style.borderLeftColor = map.color;
      item.style.borderLeftWidth = '4px';
      
      if (canEnter && !isCurrent) {
        item.onclick = () => {
          // Show NPC dialog for travel
          NPC.showTravelDialog(i);
        };
      }
      
      list.appendChild(item);
    }
  },
  
  // Get current map
  getCurrent() {
    return this.data[this.currentIndex];
  },
  
  // Get tile color
  getTileColor(tile, x, y) {
    const map = this.data[this.currentIndex];
    
    switch (tile) {
      case 0: // Grass/base
        return ((x + y) % 2 === 0) ? map.color : map.bgColor;
      case 1: // Path
        return COLORS.dirt;
      case 2: // Water
        return (Math.sin(GameState.time / 400 + x + y) > 0) ? COLORS.water : COLORS.waterLight;
      case 3: // Lava
        return (Math.sin(GameState.time / 300 + x + y) > 0) ? COLORS.lava : '#ff6600';
      case 4: // Snow
        return COLORS.snow;
      default:
        return map.color;
    }
  },
  
  // Get save data
  getSaveData() {
    return {
      currentIndex: this.currentIndex
    };
  },
  
  // Load save data
  loadSaveData(data) {
    if (data?.currentIndex !== undefined) {
      this.currentIndex = data.currentIndex;
    }
  }
};

// ===== CHANGES: Xóa console.log debug cuối file. =====
