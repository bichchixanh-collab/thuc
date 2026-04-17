// ==================== PLAYER SYSTEM ====================
const Player = {
  // Position & Movement
  x: 400,
  y: 400,
  vx: 0,
  vy: 0,
  baseSpeed: 2.8,
  speed: 2.8,
  dir: 'down',
  frame: 0,
  frameTimer: 0,
  
  // Stats
  level: 1,
  hp: 100,
  maxHp: 100,
  mp: 50,
  maxMp: 50,
  exp: 0,
  maxExp: 100,
  gold: 100,
  
  // Combat stats
  baseAtk: 12,
  baseDef: 3,
  atk: 12,
  def: 3,
  critRate: 0.08,
  critDmg: 1.5,
  
  // Equipment bonuses
  equipAtk: 0,
  equipDef: 0,
  equipHp: 0,
  equipMp: 0,
  equipCritRate: 0,
  equipCritDmg: 0,
  
  // Cultivation
  realm: 0,
  realmStage: 1,
  realmExp: 0,
  realmMaxExp: 100,
  
  // Skills (from config)
  skills: null,
  
  // Combat
  target: null,
  attackTimer: 0,
  alive: true,
  invincible: false,
  invincibleTimer: 0,
  
  // Equipment slots
  equipped: {
    weapon: null,
    armor: null,
    accessory: null
  },
  
  // ==================== PET SYSTEM ====================
  activePet: null,
  ownedPets: [],
  
  // Pet position
  pet: {
    x: 0,
    y: 0,
    offsetX: 25,
    offsetY: 12,
    frame: 0,
    frameTimer: 0,
    targetX: 0,
    targetY: 0
  },
  
  // ==================== TAP TO MOVE ====================
  tapMoveTarget: null,
  
  // Initialize player
  init() {
    this.skills = JSON.parse(JSON.stringify(SKILLS));
    this.recalculateStats();
    this.pet.x = this.x + this.pet.offsetX;
    this.pet.y = this.y + this.pet.offsetY;
    console.log('👤 Player initialized, speed:', this.speed);
  },
  
  // Recalculate all stats (including pet bonuses)
  recalculateStats() {
    const realm = REALMS[this.realm];
    
    // Reset equipment bonuses
    this.equipAtk = 0;
    this.equipDef = 0;
    this.equipHp = 0;
    this.equipMp = 0;
    this.equipCritRate = 0;
    this.equipCritDmg = 0;
    
    // Calculate from equipment
    for (const slot in this.equipped) {
      const itemId = this.equipped[slot];
      if (itemId && ITEMS[itemId]) {
        const item = ITEMS[itemId];
        if (item.stats) {
          this.equipAtk += item.stats.atk || 0;
          this.equipDef += item.stats.def || 0;
          this.equipHp += item.stats.hp || 0;
          this.equipMp += item.stats.mp || 0;
          this.equipCritRate += item.stats.critRate || 0;
          this.equipCritDmg += item.stats.critDmg || 0;
        }
      }
    }
    
    // Pet bonuses
    let petAtk = 0, petDef = 0, petSpeed = 0;
    if (this.activePet && PETS[this.activePet]) {
      const pet = PETS[this.activePet];
      petAtk = pet.bonus.atk || 0;
      petDef = pet.bonus.def || 0;
      petSpeed = pet.bonus.speed || 0;
    }
    
    // Final stats
    this.atk = this.baseAtk + (this.level - 1) * 3 + realm.atkBonus + this.equipAtk + petAtk;
    this.def = this.baseDef + (this.level - 1) * 1 + realm.defBonus + this.equipDef + petDef;
    this.maxHp = 100 + (this.level - 1) * 15 + realm.hpBonus + this.equipHp;
    this.maxMp = 50 + (this.level - 1) * 8 + this.equipMp;
    this.critRate = 0.08 + this.equipCritRate;
    this.critDmg = 1.5 + this.equipCritDmg;
    this.speed = this.baseSpeed + petSpeed;
    
    // Ensure HP/MP don't exceed max
    this.hp = Math.min(this.hp, this.maxHp);
    this.mp = Math.min(this.mp, this.maxMp);
  },
  
  // Update player - SỬA LẠI LOGIC DI CHUYỂN
  update(dt, inputX, inputY) {
    if (!this.alive) return;
    
    // Invincibility frames
    if (this.invincible) {
      this.invincibleTimer -= dt;
      if (this.invincibleTimer <= 0) {
        this.invincible = false;
      }
    }
    
    // ===== XỬ LÝ INPUT =====
    let moveX = inputX || 0;
    let moveY = inputY || 0;
    
    // Tap-to-move: chỉ xử lý nếu không có joystick/keyboard input
    const hasManualInput = Math.abs(moveX) > 0.1 || Math.abs(moveY) > 0.1;
    
    if (hasManualInput) {
      // Có input thủ công → hủy tap-to-move
      this.tapMoveTarget = null;
      GameState.tapTarget = null;
      GameState.isTapMoving = false;
    } else if (this.tapMoveTarget) {
      // Không có input thủ công + có tap target → di chuyển đến đó
      const distToTarget = Utils.dist(this.x, this.y, this.tapMoveTarget.x, this.tapMoveTarget.y);
      
      if (distToTarget > 15) {
        // Chưa đến → tính hướng di chuyển
        moveX = (this.tapMoveTarget.x - this.x) / distToTarget;
        moveY = (this.tapMoveTarget.y - this.y) / distToTarget;
        GameState.isTapMoving = true;
      } else {
        // Đã đến → dừng
        this.tapMoveTarget = null;
        GameState.tapTarget = null;
        GameState.isTapMoving = false;
        moveX = 0;
        moveY = 0;
      }
    }
    
    // Normalize input
    const mag = Math.sqrt(moveX * moveX + moveY * moveY);
    if (mag > 1) {
      moveX /= mag;
      moveY /= mag;
    }
    
    // Tính velocity
    this.vx = moveX * this.speed;
    this.vy = moveY * this.speed;
    
    // Update direction
    if (Math.abs(moveX) > 0.1 || Math.abs(moveY) > 0.1) {
      if (Math.abs(moveX) > Math.abs(moveY)) {
        this.dir = moveX > 0 ? 'right' : 'left';
      } else {
        this.dir = moveY > 0 ? 'down' : 'up';
      }
    }
    
    // Di chuyển
    const newX = this.x + this.vx;
    const newY = this.y + this.vy;
    
    // Bounds check
    const maxX = CONFIG.WORLD_WIDTH * CONFIG.TILE_SIZE - 20;
    const maxY = CONFIG.WORLD_HEIGHT * CONFIG.TILE_SIZE - 20;
    
    let canMoveX = newX > 20 && newX < maxX;
    let canMoveY = newY > 20 && newY < maxY;
    
    // Water collision check
    if (canMoveX) {
      const tileX = Math.floor(newX / CONFIG.TILE_SIZE);
      const tileY = Math.floor(this.y / CONFIG.TILE_SIZE);
      if (Maps.isWater(tileX, tileY)) {
        canMoveX = false;
      }
    }
    
    if (canMoveY) {
      const tileX = Math.floor(this.x / CONFIG.TILE_SIZE);
      const tileY = Math.floor(newY / CONFIG.TILE_SIZE);
      if (Maps.isWater(tileX, tileY)) {
        canMoveY = false;
      }
    }
    
    // Apply movement
    if (canMoveX) this.x = newX;
    if (canMoveY) this.y = newY;
    
    // Nếu bị chặn khi tap-to-move → hủy
    if (this.tapMoveTarget && (!canMoveX && Math.abs(this.vx) > 0.1 || !canMoveY && Math.abs(this.vy) > 0.1)) {
      this.tapMoveTarget = null;
      GameState.tapTarget = null;
      GameState.isTapMoving = false;
    }
    
    // Walk animation
    if (mag > 0.1) {
      this.frameTimer += dt;
      if (this.frameTimer > 150) {
        this.frame = (this.frame + 1) % 4;
        this.frameTimer = 0;
      }
    } else {
      this.frame = 0;
    }
    
    // Update skill cooldowns
    if (this.skills) {
      for (const skill of this.skills) {
        if (skill.cd > 0) {
          skill.cd = Math.max(0, skill.cd - dt);
        }
      }
    }
    
    // Natural regen
    if (GameState.time % 2000 < dt) {
      this.hp = Math.min(this.maxHp, this.hp + 3);
      this.mp = Math.min(this.maxMp, this.mp + 2);
    }
    
    // Check if target is dead
    if (this.target && !this.target.alive) {
      this.target = null;
      UI.hideTargetInfo();
    }
    
    // Update pet
    this.updatePet(dt, mag > 0.1);
  },
  
  // Update pet position and animation
  updatePet(dt, isPlayerMoving) {
    if (!this.activePet) return;
    
    // Target position (behind and to the side of player)
    let offsetX = this.pet.offsetX;
    let offsetY = this.pet.offsetY;
    
    // Adjust offset based on player direction
    switch (this.dir) {
      case 'left':
        offsetX = Math.abs(offsetX);
        break;
      case 'right':
        offsetX = -Math.abs(offsetX);
        break;
      case 'up':
        offsetY = Math.abs(offsetY);
        break;
      case 'down':
        offsetY = -Math.abs(offsetY) + 20;
        break;
    }
    
    this.pet.targetX = this.x + offsetX;
    this.pet.targetY = this.y + offsetY;
    
    // Smooth follow
    const followSpeed = 0.08;
    this.pet.x = Utils.lerp(this.pet.x, this.pet.targetX, followSpeed);
    this.pet.y = Utils.lerp(this.pet.y, this.pet.targetY, followSpeed);
    
    // Pet animation
    const petMoving = Utils.dist(this.pet.x, this.pet.y, this.pet.targetX, this.pet.targetY) > 2;
    if (petMoving || isPlayerMoving) {
      this.pet.frameTimer += dt;
      if (this.pet.frameTimer > 200) {
        this.pet.frame = (this.pet.frame + 1) % 2;
        this.pet.frameTimer = 0;
      }
    } else {
      this.pet.frame = 0;
    }
  },
  
  // Set tap move target
  setTapTarget(worldX, worldY) {
    // Check if clicking on water
    const tileX = Math.floor(worldX / CONFIG.TILE_SIZE);
    const tileY = Math.floor(worldY / CONFIG.TILE_SIZE);
    if (Maps.isWater(tileX, tileY)) {
      return false;
    }
    
    this.tapMoveTarget = { x: worldX, y: worldY };
    GameState.tapTarget = { x: worldX, y: worldY };
    GameState.tapIndicator = { x: worldX, y: worldY, life: 500 };
    GameState.isTapMoving = true;
    
    return true;
  },
  
  // Use skill
  useSkill(idx) {
    if (!this.alive) return false;
    if (!this.skills) return false;
    
    const skill = this.skills[idx];
    if (!skill) return false;
    
    // Check cooldown
    if (skill.cd > 0) {
      return false;
    }
    
    // Check MP
    if (this.mp < skill.mp) {
      UI.addLog('⚡ Không đủ linh lực!', 'system');
      return false;
    }
    
    // Use MP and start cooldown
    this.mp -= skill.mp;
    skill.cd = skill.maxCd;
    
    // Find enemies in range
    const hitEnemies = [];
    for (const enemy of Enemies.list) {
      if (!enemy.alive) continue;
      const dist = Utils.dist(this.x, this.y, enemy.x, enemy.y);
      if (dist <= skill.range) {
        hitEnemies.push({ enemy, dist });
      }
    }
    
    // Sort by distance
    hitEnemies.sort((a, b) => a.dist - b.dist);
    
    // Determine targets based on skill type
    let targets = [];
    switch (skill.type) {
      case 'melee':
      case 'projectile':
        targets = hitEnemies.slice(0, 1).map(h => h.enemy);
        break;
      case 'aoe':
        targets = hitEnemies.slice(0, 3).map(h => h.enemy);
        break;
      case 'ultimate':
        targets = hitEnemies.map(h => h.enemy);
        break;
    }
    
    // Deal damage
    for (const enemy of targets) {
      let damage = Math.floor(this.atk * skill.dmgMul);
      let isCrit = false;
      
      // Critical hit
      if (Utils.chance(this.critRate)) {
        damage = Math.floor(damage * this.critDmg);
        isCrit = true;
      }
      
      // Apply damage
      Enemies.damage(enemy, damage, isCrit, skill.color);
      
      // Create skill effect particles
      Game.spawnSkillEffect(this.x, this.y, enemy.x, enemy.y, skill.color, skill.type);
    }
    
    // Effect even if no targets
    if (targets.length === 0) {
      const targetX = this.x + (this.dir === 'right' ? 50 : this.dir === 'left' ? -50 : 0);
      const targetY = this.y + (this.dir === 'down' ? 50 : this.dir === 'up' ? -50 : 0);
      Game.spawnSkillEffect(this.x, this.y, targetX, targetY, skill.color, skill.type);
    }
    
    UI.updateSkillUI();
    return true;
  },
  
  // Take damage
  takeDamage(amount, source) {
    if (!this.alive || this.invincible) return;
    
    const actualDamage = Math.max(1, amount - this.def);
    this.hp -= actualDamage;
    
    Game.spawnDamageNumber(this.x, this.y - 30, actualDamage, '#ff4444');
    UI.addLog(`${source} gây ${actualDamage} sát thương!`, 'damage');
    
    // Invincibility frames
    this.invincible = true;
    this.invincibleTimer = 300;
    
    if (this.hp <= 0) {
      this.hp = 0;
      this.die();
    }
  },
  
  // Die
  die() {
    this.alive = false;
    this.target = null;
    this.tapMoveTarget = null;
    GameState.tapTarget = null;
    GameState.isTapMoving = false;
    
    UI.addLog('💀 Bạn đã tử vong! Hồi sinh sau 3 giây...', 'system');
    UI.showNotification('💀 Tử Vong!', 'Hồi sinh sau 3 giây...');
    
    // Lose some gold
    const lostGold = Math.floor(this.gold * 0.1);
    this.gold -= lostGold;
    if (lostGold > 0) {
      UI.addLog(`💸 Mất ${lostGold} vàng!`, 'gold');
    }
    
    setTimeout(() => {
      this.respawn();
    }, 3000);
  },
  
  // Respawn
  respawn() {
    this.hp = this.maxHp;
    this.mp = this.maxMp;
    this.alive = true;
    this.x = 400;
    this.y = 400;
    this.pet.x = this.x + this.pet.offsetX;
    this.pet.y = this.y + this.pet.offsetY;
    UI.addLog('✨ Đã hồi sinh!', 'system');
  },
  
  // Gain EXP (with pet bonus)
  gainExp(amount) {
    // Apply pet EXP bonus
    if (this.activePet && PETS[this.activePet]) {
      const bonus = PETS[this.activePet].expBonus;
      const bonusExp = Math.floor(amount * bonus);
      if (bonusExp > 0) {
        amount += bonusExp;
      }
    }
    
    this.exp += amount;
    
    while (this.exp >= this.maxExp) {
      this.levelUp();
    }
  },
  
  // Level up
  levelUp() {
    this.exp -= this.maxExp;
    this.level++;
    this.maxExp = Math.floor(this.maxExp * 1.25);
    
    // Full heal on level up
    this.recalculateStats();
    this.hp = this.maxHp;
    this.mp = this.maxMp;
    
    UI.addLog(`🎉 Thăng cấp! Level ${this.level}!`, 'system');
    UI.showNotification(`⬆ Level ${this.level}!`, '+HP +MP +ATK');
    
    document.getElementById('levelBadge').textContent = `Lv.${this.level}`;
  },
  
  // Gain realm exp
  gainRealmExp(amount) {
    this.realmExp += amount;
    
    if (this.realmExp >= this.realmMaxExp) {
      this.advanceRealm();
    }
  },
  
  // Advance cultivation realm
  advanceRealm() {
    this.realmExp -= this.realmMaxExp;
    this.realmStage++;
    
    const currentRealm = REALMS[this.realm];
    
    if (this.realmStage > currentRealm.stages) {
      if (this.realm < REALMS.length - 1) {
        this.realm++;
        this.realmStage = 1;
        
        const newRealm = REALMS[this.realm];
        UI.showNotification(`🌟 ĐỘT PHÁ!`, newRealm.name);
        UI.addLog(`🌟 Đột phá thành công! ${newRealm.name}!`, 'realm');
      }
    } else {
      UI.addLog(`✨ Tu vi tăng! ${currentRealm.name} - Tầng ${this.realmStage}`, 'realm');
    }
    
    this.realmMaxExp = Math.floor(this.realmMaxExp * 1.15);
    this.recalculateStats();
    this.hp = this.maxHp;
    this.mp = this.maxMp;
    
    UI.updateRealmTitle();
  },
  
  // Buy pet
  buyPet(petId) {
    const pet = PETS[petId];
    if (!pet) return false;
    
    if (this.ownedPets.includes(petId)) {
      UI.addLog(`❌ Bạn đã sở hữu ${pet.name}!`, 'system');
      return false;
    }
    
    if (this.gold < pet.price) {
      UI.addLog(`❌ Không đủ vàng! Cần ${pet.price} 💰`, 'system');
      return false;
    }
    
    this.gold -= pet.price;
    this.ownedPets.push(petId);
    this.activePet = petId;
    
    this.pet.x = this.x + this.pet.offsetX;
    this.pet.y = this.y + this.pet.offsetY;
    
    this.recalculateStats();
    UI.updateGold();
    
    UI.addLog(`🎉 Mua thành công ${pet.name}!`, 'item');
    UI.showNotification(`🐾 ${pet.name}!`, pet.desc);
    
    return true;
  },
  
  // Set active pet
  setActivePet(petId) {
    if (!petId) {
      this.activePet = null;
      this.recalculateStats();
      UI.addLog('🐾 Đã thu hồi linh thú', 'system');
      return true;
    }
    
    if (!this.ownedPets.includes(petId)) {
      UI.addLog('❌ Bạn chưa sở hữu pet này!', 'system');
      return false;
    }
    
    this.activePet = petId;
    this.pet.x = this.x + this.pet.offsetX;
    this.pet.y = this.y + this.pet.offsetY;
    this.recalculateStats();
    
    const pet = PETS[petId];
    UI.addLog(`🐾 Triệu hồi ${pet.name}!`, 'system');
    
    return true;
  },
  
  // Equip item
  equip(itemId) {
    const item = ITEMS[itemId];
    if (!item) return false;
    
    let slot = null;
    if (item.type === 'weapon') slot = 'weapon';
    else if (item.type === 'armor') slot = 'armor';
    else if (item.type === 'accessory') slot = 'accessory';
    
    if (!slot) return false;
    
    if (this.equipped[slot]) {
      Inventory.add(this.equipped[slot], 1);
    }
    
    this.equipped[slot] = itemId;
    Inventory.remove(itemId, 1);
    
    this.recalculateStats();
    UI.addLog(`🗡️ Đã trang bị ${item.name}!`, 'item');
    
    return true;
  },
  
  // Unequip item
  unequip(slot) {
    if (!this.equipped[slot]) return false;
    
    const itemId = this.equipped[slot];
    const item = ITEMS[itemId];
    
    if (Inventory.add(itemId, 1)) {
      this.equipped[slot] = null;
      this.recalculateStats();
      UI.addLog(`📦 Đã tháo ${item.name}!`, 'item');
      return true;
    }
    
    UI.addLog('❌ Túi đồ đầy!', 'system');
    return false;
  },
  
  // Heal
  heal(hp = 0, mp = 0) {
    if (hp > 0) {
      const healed = Math.min(hp, this.maxHp - this.hp);
      this.hp += healed;
      if (healed > 0) {
        Game.spawnDamageNumber(this.x, this.y - 30, '+' + healed, '#44ff44');
      }
    }
    if (mp > 0) {
      this.mp = Math.min(this.maxMp, this.mp + mp);
    }
  },
  
  // Get save data
  getSaveData() {
    return {
      x: this.x,
      y: this.y,
      level: this.level,
      hp: this.hp,
      maxHp: this.maxHp,
      mp: this.mp,
      maxMp: this.maxMp,
      exp: this.exp,
      maxExp: this.maxExp,
      gold: this.gold,
      baseAtk: this.baseAtk,
      baseDef: this.baseDef,
      realm: this.realm,
      realmStage: this.realmStage,
      realmExp: this.realmExp,
      realmMaxExp: this.realmMaxExp,
      equipped: { ...this.equipped },
      activePet: this.activePet,
      ownedPets: [...this.ownedPets]
    };
  },
  
  // Load save data
  loadSaveData(data) {
    if (!data) return;
    
    this.x = data.x || 400;
    this.y = data.y || 400;
    this.level = data.level || 1;
    this.hp = data.hp || 100;
    this.maxHp = data.maxHp || 100;
    this.mp = data.mp || 50;
    this.maxMp = data.maxMp || 50;
    this.exp = data.exp || 0;
    this.maxExp = data.maxExp || 100;
    this.gold = data.gold || 100;
    this.baseAtk = data.baseAtk || 12;
    this.baseDef = data.baseDef || 3;
    this.realm = data.realm || 0;
    this.realmStage = data.realmStage || 1;
    this.realmExp = data.realmExp || 0;
    this.realmMaxExp = data.realmMaxExp || 100;
    this.equipped = data.equipped || { weapon: null, armor: null, accessory: null };
    this.activePet = data.activePet || null;
    this.ownedPets = data.ownedPets || [];
    
    this.skills = JSON.parse(JSON.stringify(SKILLS));
    this.recalculateStats();
    this.alive = true;
    this.target = null;
    this.tapMoveTarget = null;
    
    if (this.activePet) {
      this.pet.x = this.x + this.pet.offsetX;
      this.pet.y = this.y + this.pet.offsetY;
    }
  }
};

console.log('👤 Player loaded');