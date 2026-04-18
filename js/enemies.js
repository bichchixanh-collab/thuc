// ==================== ENEMY SYSTEM ====================
const Enemies = {
  list: [],

  // Enemy type definitions
  types: {
    // Forest enemies
    wolf: {
      name: 'Sói Xám', hp: 50, atk: 10, exp: 18, gold: 8,
      sprite: 'wolf', size: 12,
      drops: [
        { id: 'wolfFang', chance: 0.25 },
        { id: 'wolfPelt', chance: 0.15 },
        { id: 'hpPotion', chance: 0.1 }
      ]
    },
    boar: {
      name: 'Heo Rừng', hp: 75, atk: 12, exp: 25, gold: 12,
      sprite: 'boar', size: 14,
      drops: [
        { id: 'hpPotion', chance: 0.15 },
        { id: 'mpPotion', chance: 0.1 }
      ]
    },

    // Cave enemies
    ghost: {
      name: 'U Linh', hp: 90, atk: 18, exp: 35, gold: 18,
      sprite: 'ghost', size: 12,
      drops: [
        { id: 'spiritStone', chance: 0.1 },
        { id: 'mpPotion', chance: 0.15 }
      ]
    },
    demon: {
      name: 'Yêu Ma', hp: 140, atk: 25, exp: 55, gold: 28,
      sprite: 'demon', size: 12,
      drops: [
        { id: 'demonCore', chance: 0.2 },
        { id: 'hpPotionMedium', chance: 0.1 }
      ]
    },

    // Mountain enemies
    rockGolem: {
      name: 'Thạch Ma', hp: 220, atk: 35, exp: 85, gold: 40,
      sprite: 'wolf', size: 16, color: '#808080',
      drops: [
        { id: 'spiritStone', chance: 0.2 },
        { id: 'ironSword', chance: 0.05 }
      ]
    },
    fireSpirit: {
      name: 'Hỏa Linh', hp: 180, atk: 45, exp: 100, gold: 50,
      sprite: 'ghost', size: 12, color: '#ff4500',
      drops: [
        { id: 'realmPill', chance: 0.05 },
        { id: 'expPotion', chance: 0.1 }
      ]
    },

    // Ice land enemies
    iceWolf: {
      name: 'Băng Lang', hp: 280, atk: 50, exp: 130, gold: 60,
      sprite: 'wolf', size: 14, color: '#add8e6',
      drops: [
        { id: 'hpPotionMedium', chance: 0.15 },
        { id: 'steelSword', chance: 0.03 }
      ]
    },
    frostBear: {
      name: 'Hàn Hùng', hp: 400, atk: 60, exp: 180, gold: 80,
      sprite: 'boar', size: 18, color: '#87ceeb',
      drops: [
        { id: 'spiritRobe', chance: 0.05 },
        { id: 'realmPill', chance: 0.08 }
      ]
    },

    // Demon realm enemies
    darkDemon: {
      name: 'Hắc Ma', hp: 500, atk: 80, exp: 250, gold: 100,
      sprite: 'demon', size: 14, color: '#4b0082',
      drops: [
        { id: 'demonCore', chance: 0.3 },
        { id: 'flameSword', chance: 0.02 }
      ]
    },
    shadowLord: {
      name: 'Ám Vương', hp: 700, atk: 100, exp: 350, gold: 150,
      sprite: 'demon', size: 16, color: '#1a1a1a',
      drops: [
        { id: 'dragonScale', chance: 0.1 },
        { id: 'dragonAmulet', chance: 0.03 }
      ]
    },

    // Celestial realm enemies
    celestialBeast: {
      name: 'Tiên Thú', hp: 1200, atk: 150, exp: 600, gold: 300,
      sprite: 'boar', size: 20, color: '#ffd700',
      drops: [
        { id: 'celestialOrb', chance: 0.15 },
        { id: 'celestialSword', chance: 0.01 }
      ]
    },
    divineDragon: {
      name: 'Thần Long', hp: 2000, atk: 200, exp: 1000, gold: 500,
      sprite: 'demon', size: 24, color: '#ff69b4',
      drops: [
        { id: 'celestialJade', chance: 0.05 },
        { id: 'celestialRobe', chance: 0.02 }
      ]
    },

    // Bosses
    wolfKing: {
      name: '🔱 Sói Vương', hp: 300, atk: 35, exp: 150, gold: 80,
      sprite: 'wolf', size: 20, boss: true, color: '#silver',
      drops: [
        { id: 'steelSword', chance: 0.3 },
        { id: 'expPotion', chance: 0.5 }
      ]
    },
    demonLord: {
      name: '👹 Ma Vương', hp: 800, atk: 70, exp: 400, gold: 200,
      sprite: 'demon', size: 22, boss: true, color: '#8b0000',
      drops: [
        { id: 'flameSword', chance: 0.2 },
        { id: 'dragonArmor', chance: 0.1 }
      ]
    },
    iceEmperor: {
      name: '❄ Băng Đế', hp: 1500, atk: 120, exp: 800, gold: 400,
      sprite: 'boar', size: 24, boss: true, color: '#00ffff',
      drops: [
        { id: 'frostSword', chance: 0.25 },
        { id: 'celestialSword', chance: 0.05 }
      ]
    },
    celestialDragon: {
      name: '🐉 Thiên Long', hp: 5000, atk: 300, exp: 3000, gold: 1500,
      sprite: 'demon', size: 32, boss: true, color: '#ffd700',
      drops: [
        { id: 'celestialSword', chance: 0.2 },
        { id: 'celestialRobe', chance: 0.15 },
        { id: 'celestialJade', chance: 0.3 }
      ]
    }
  },

  // [FIX] Lấy vị trí spawn ngẫu nhiên nằm NGOÀI vùng thành trấn
  _getSpawnPos() {
    // Guard: nếu Maps chưa generate thì spawn ngẫu nhiên bình thường
    if (!Maps || !Maps.tiles || !Maps.tiles.length) {
      return {
        x: 100 + Math.random() * (CONFIG.WORLD_WIDTH  * CONFIG.TILE_SIZE - 200),
        y: 100 + Math.random() * (CONFIG.WORLD_HEIGHT * CONFIG.TILE_SIZE - 200)
      };
    }
    const town = Maps.getTownBounds();
    const townPxMinX = (town.minX - 2) * CONFIG.TILE_SIZE;
    const townPxMaxX = (town.maxX + 2) * CONFIG.TILE_SIZE;
    const townPxMinY = (town.minY - 2) * CONFIG.TILE_SIZE;
    const townPxMaxY = (town.maxY + 2) * CONFIG.TILE_SIZE;

    let x, y, attempts = 0;
    do {
      x = 100 + Math.random() * (CONFIG.WORLD_WIDTH  * CONFIG.TILE_SIZE - 200);
      y = 100 + Math.random() * (CONFIG.WORLD_HEIGHT * CONFIG.TILE_SIZE - 200);
      attempts++;
      if (attempts > 30) break;
    } while (x > townPxMinX && x < townPxMaxX && y > townPxMinY && y < townPxMaxY);

    return { x, y };
  },

  // Spawn enemies for current map
  spawnForMap(mapIndex) {
    this.list = [];
    const map = Maps.data[mapIndex];
    const levelMul = 1 + mapIndex * 0.6;

    // Regular enemies
    const enemyCount = 15 + mapIndex * 3;
    for (let i = 0; i < enemyCount; i++) {
      const typeKey = map.enemies[Math.floor(Math.random() * map.enemies.length)];
      this.spawn(typeKey, levelMul, map.lvl);
    }

    // Boss
    if (map.boss) {
      this.spawnBoss(map.boss, levelMul, map.lvl);
    }
  },

  // Spawn single enemy
  spawn(typeKey, levelMul = 1, baseLevel = 1) {
    const type = this.types[typeKey];
    if (!type) return null;

    // [FIX] Spawn ngoài vùng thành trấn
    const pos = this._getSpawnPos();

    const enemy = {
      type: typeKey,
      name: type.name,
      x: pos.x, y: pos.y,
      spawnX: pos.x, spawnY: pos.y,
      hp: Math.floor(type.hp * levelMul),
      maxHp: Math.floor(type.hp * levelMul),
      atk: Math.floor(type.atk * levelMul),
      exp: Math.floor(type.exp * levelMul),
      gold: Math.floor(type.gold * levelMul),
      level: baseLevel + Utils.randomInt(0, 3),
      size: type.size,
      color: type.color || null,
      sprite: type.sprite,
      boss: type.boss || false,
      drops: type.drops || [],
      alive: true,
      moveTimer: Math.random() * 200,
      moveDir: Math.random() * Math.PI * 2,
      attackTimer: 0,
      hitFlash: 0,
      aggroed: false
    };

    this.list.push(enemy);
    return enemy;
  },

  // Spawn boss
  spawnBoss(typeKey, levelMul = 1, baseLevel = 1) {
    const boss = this.spawn(typeKey, levelMul, baseLevel + 5);
    if (boss) {
      // Spawn boss xa trấn — góc map
      boss.x = CONFIG.WORLD_WIDTH * CONFIG.TILE_SIZE * 0.15;
      boss.y = CONFIG.WORLD_HEIGHT * CONFIG.TILE_SIZE * 0.15;
      boss.spawnX = boss.x;
      boss.spawnY = boss.y;
    }
    return boss;
  },

  // Update all enemies
  update(dt) {
    for (const enemy of this.list) {
      if (!enemy.alive) {
        // Respawn timer
        if (enemy.respawnTimer !== undefined) {
          enemy.respawnTimer -= dt;
          if (enemy.respawnTimer <= 0) {
            this.respawn(enemy);
          }
        }
        continue;
      }

      // Hit flash decay
      if (enemy.hitFlash > 0) {
        enemy.hitFlash -= dt;
      }

      // Distance to player
      const distToPlayer = Utils.dist(enemy.x, enemy.y, Player.x, Player.y);

      // [FIX] Nếu player đang trong vùng trấn — không aggro, tự thoát nếu đã vào
      const townZoneReady = Maps && Maps.tiles && Maps.tiles.length;
      if (townZoneReady && Maps.isInTownZone(Player.x, Player.y)) {
        enemy.aggroed = false;
        // Nếu bản thân enemy lạc vào vùng trấn — đẩy ra ngoài
        if (Maps.isInTownZone(enemy.x, enemy.y)) {
          const town = Maps.getTownBounds();
          const dirX = enemy.x - town.centerPx;
          const dirY = enemy.y - town.centerPy;
          const mag  = Math.sqrt(dirX * dirX + dirY * dirY) || 1;
          enemy.x += (dirX / mag) * 2.5;
          enemy.y += (dirY / mag) * 2.5;
        }
        continue;
      }

      // AI behavior bình thường (player ngoài trấn)
      if (distToPlayer < CONFIG.ENEMY_AGGRO_RANGE) {
        enemy.aggroed = true;
      } else if (distToPlayer > CONFIG.ENEMY_AGGRO_RANGE * 1.5) {
        enemy.aggroed = false;
      }

      if (enemy.aggroed && distToPlayer > CONFIG.ENEMY_ATTACK_RANGE) {
        // Chase player — nhưng KHÔNG được đi vào vùng trấn
        const dx = Player.x - enemy.x;
        const dy = Player.y - enemy.y;
        const speed = enemy.boss ? 1.2 : 0.9;
        const nextX = enemy.x + (dx / distToPlayer) * speed;
        const nextY = enemy.y + (dy / distToPlayer) * speed;

        // [FIX] Chặn enemy tiến vào town zone
        if (!townZoneReady || !Maps.isInTownZone(nextX, nextY)) {
          enemy.x = nextX;
          enemy.y = nextY;
        } else {
          // Dừng ngay viền trấn, bỏ aggro
          enemy.aggroed = false;
        }
      } else if (distToPlayer <= CONFIG.ENEMY_ATTACK_RANGE && Player.alive) {
        // Attack player
        enemy.attackTimer -= dt;
        if (enemy.attackTimer <= 0) {
          Player.takeDamage(enemy.atk, enemy.name);
          enemy.attackTimer = enemy.boss ? 1200 : 1500;
        }
      } else if (!enemy.aggroed) {
        // Wander — không lang thang vào vùng trấn
        enemy.moveTimer -= dt;
        if (enemy.moveTimer <= 0) {
          enemy.moveDir = Math.random() * Math.PI * 2;
          enemy.moveTimer = 2000 + Math.random() * 3000;
        }

        const wanderNextX = enemy.x + Math.cos(enemy.moveDir) * 0.4;
        const wanderNextY = enemy.y + Math.sin(enemy.moveDir) * 0.4;

        if (!townZoneReady || !Maps.isInTownZone(wanderNextX, wanderNextY)) {
          enemy.x = wanderNextX;
          enemy.y = wanderNextY;
        } else {
          // Quay đầu
          enemy.moveDir = enemy.moveDir + Math.PI + (Math.random() - 0.5) * 0.5;
          enemy.moveTimer = 1000;
        }
      }

      // Keep in bounds
      enemy.x = Utils.clamp(enemy.x, 30, CONFIG.WORLD_WIDTH  * CONFIG.TILE_SIZE - 30);
      enemy.y = Utils.clamp(enemy.y, 30, CONFIG.WORLD_HEIGHT * CONFIG.TILE_SIZE - 30);

      // Don't wander too far from spawn
      const distFromSpawn = Utils.dist(enemy.x, enemy.y, enemy.spawnX, enemy.spawnY);
      if (distFromSpawn > 200 && !enemy.aggroed) {
        enemy.moveDir = Math.atan2(enemy.spawnY - enemy.y, enemy.spawnX - enemy.x);
      }
    }
  },

  // Damage enemy
  damage(enemy, amount, isCrit = false, color = '#ffffff') {
    if (!enemy || !enemy.alive) return;

    enemy.hp -= amount;
    enemy.hitFlash = 150;
    enemy.aggroed = true;

    // Damage number
    const dmgText = isCrit ? `💥${amount}` : amount.toString();
    const dmgColor = isCrit ? '#ffff00' : color;
    Game.spawnDamageNumber(enemy.x, enemy.y - enemy.size - 10, dmgText, dmgColor);

    if (enemy.hp <= 0) {
      this.kill(enemy);
    } else {
      if (Player.target === enemy) {
        UI.updateTargetInfo();
      }
    }
  },

  // Kill enemy
  kill(enemy) {
    enemy.alive = false;
    enemy.respawnTimer = enemy.boss ? 45000 : 10000;

    // Rewards
    Player.gainExp(enemy.exp);
    Player.gold += enemy.gold;
    Player.gainRealmExp(Math.floor(enemy.exp / 8));

    UI.addLog(`💀 Hạ gục ${enemy.name}! +${enemy.exp} EXP +${enemy.gold} 💰`, 'exp');

    // Drops
    for (const drop of enemy.drops) {
      if (Utils.chance(drop.chance)) {
        if (Inventory.add(drop.id, 1)) {
          UI.addLog(`📦 Nhận ${ITEMS[drop.id].name}!`, 'item');
        }
      }
    }

    // Quest progress
    Quests.updateProgress(enemy.type, 1);

    // Death particles
    for (let i = 0; i < 10; i++) {
      GameState.particles.push({
        x: enemy.x,
        y: enemy.y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4 - 2,
        life: 600,
        color: enemy.color || COLORS.wolfFur,
        size: 3 + Math.random() * 3
      });
    }

    // Clear target
    if (Player.target === enemy) {
      Player.target = null;
      UI.hideTargetInfo();
    }

    UI.updateGold();
  },

  // Respawn enemy — đảm bảo spawn ngoài trấn
  respawn(enemy) {
    enemy.alive = true;
    enemy.hp = enemy.maxHp;
    // [FIX] Nếu spawnPoint trong trấn thì di chuyển ra ngoài
    if (Maps.isInTownZone(enemy.spawnX, enemy.spawnY)) {
      const pos = this._getSpawnPos();
      enemy.spawnX = pos.x;
      enemy.spawnY = pos.y;
    }
    enemy.x = enemy.spawnX + (Math.random() - 0.5) * 100;
    enemy.y = enemy.spawnY + (Math.random() - 0.5) * 100;
    // Đảm bảo sau khi jitter không vào trấn
    if (Maps.isInTownZone(enemy.x, enemy.y)) {
      enemy.x = enemy.spawnX;
      enemy.y = enemy.spawnY;
    }
    enemy.hitFlash = 0;
    enemy.aggroed = false;
    delete enemy.respawnTimer;
  },

  // Find nearest alive enemy
  findNearest(x, y, maxDist = Infinity, filter = null) {
    let nearest = null;
    let nearestDist = maxDist;

    for (const enemy of this.list) {
      if (!enemy.alive) continue;
      if (filter && !filter(enemy)) continue;

      const dist = Utils.dist(x, y, enemy.x, enemy.y);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = enemy;
      }
    }

    return nearest;
  },

  // Find enemies in range
  findInRange(x, y, range, filter = null) {
    const result = [];

    for (const enemy of this.list) {
      if (!enemy.alive) continue;
      if (filter && !filter(enemy)) continue;

      const dist = Utils.dist(x, y, enemy.x, enemy.y);
      if (dist <= range) {
        result.push({ enemy, dist });
      }
    }

    return result.sort((a, b) => a.dist - b.dist);
  },

  // Get enemy at position
  getAt(x, y, radius = 30) {
    for (const enemy of this.list) {
      if (!enemy.alive) continue;
      const dist = Utils.dist(x, y, enemy.x, enemy.y);
      if (dist <= enemy.size * 2 + radius) {
        return enemy;
      }
    }
    return null;
  }
};

console.log('👹 Enemies loaded');
