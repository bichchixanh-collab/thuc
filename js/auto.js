// ==================== AUTO SYSTEM ====================
const AutoSystem = {
  // Auto farm state
  farming: false,
  cultivating: false,
  
  // Smart auto settings
  settings: {
    useSkills: true,
    useHpPotion: true,
    useMpPotion: true,
    priorityLowHp: true,
    avoidHigherLevel: true,
    autoPickup: true,
    autoSellJunk: false,
    targetBoss: false,
    stayInArea: true,
    areaRadius: 350
  },
  
  // Current auto state
  state: {
    status: 'idle',
    targetEnemy: null,
    lastActionTime: 0,
    searchCenter: { x: 0, y: 0 },
    stuckTimer: 0,
    lastPosition: { x: 0, y: 0 },
    combatTimer: 0,
    idleTimer: 0
  },
  
  // Toggle auto farm
  toggleAutoFarm() {
    this.farming = !this.farming;
    
    const btn = document.getElementById('autoFarmBtn');
    btn.classList.toggle('active', this.farming);
    
    if (this.farming) {
      this.state.searchCenter = { x: Player.x, y: Player.y };
      this.state.status = 'searching';
      UI.addLog('⚔️ Auto Farm BẬT', 'system');
      this.showAutoDisplay();
    } else {
      this.state.status = 'idle';
      this.state.targetEnemy = null;
      UI.addLog('⚔️ Auto Farm TẮT', 'system');
      this.hideAutoDisplay();
    }
    
    // Stop cultivating if farming
    if (this.farming && this.cultivating) {
      this.toggleCultivate();
    }
  },
  
  // Toggle cultivation
  toggleCultivate() {
    this.cultivating = !this.cultivating;
    
    const btn = document.getElementById('cultivateBtn');
    btn.classList.toggle('active', this.cultivating);
    
    if (this.cultivating) {
      UI.addLog('🧘 Bắt đầu tu luyện...', 'system');
      this.showAutoDisplay();
    } else {
      UI.addLog('🧘 Dừng tu luyện', 'system');
      this.hideAutoDisplay();
    }
    
    // Stop farming if cultivating
    if (this.cultivating && this.farming) {
      this.toggleAutoFarm();
    }
  },
  
  // Show auto mode display
  showAutoDisplay() {
    document.getElementById('autoModeDisplay').classList.add('show');
  },
  
  // Hide auto mode display
  hideAutoDisplay() {
    if (!this.farming && !this.cultivating) {
      document.getElementById('autoModeDisplay').classList.remove('show');
    }
  },
  
  // Update auto display
  updateDisplay() {
    const statusEl = document.getElementById('autoStatus');
    const targetEl = document.getElementById('autoTarget');
    
    if (this.cultivating) {
      statusEl.textContent = '🧘 Đang tu luyện...';
      targetEl.textContent = `Tu vi: ${Player.realmExp}/${Player.realmMaxExp}`;
    } else if (this.farming) {
      switch (this.state.status) {
        case 'searching':
          statusEl.textContent = '🔍 Đang tìm mục tiêu...';
          targetEl.textContent = '';
          break;
        case 'moving':
          statusEl.textContent = '🏃 Di chuyển đến mục tiêu';
          targetEl.textContent = this.state.targetEnemy ? 
            `🎯 ${this.state.targetEnemy.name} Lv.${this.state.targetEnemy.level}` : '';
          break;
        case 'combat':
          statusEl.textContent = '⚔️ Đang chiến đấu!';
          targetEl.textContent = this.state.targetEnemy ? 
            `🎯 ${this.state.targetEnemy.name} (${this.state.targetEnemy.hp}/${this.state.targetEnemy.maxHp})` : '';
          break;
        case 'looting':
          statusEl.textContent = '📦 Thu thập vật phẩm...';
          targetEl.textContent = '';
          break;
        case 'healing':
          statusEl.textContent = '💊 Đang hồi phục...';
          targetEl.textContent = `HP: ${Player.hp}/${Player.maxHp}`;
          break;
        case 'returning':
          statusEl.textContent = '↩️ Quay về vùng farm...';
          targetEl.textContent = '';
          break;
        default:
          statusEl.textContent = '⏳ Chờ...';
          targetEl.textContent = '';
      }
    }
  },
  
  // Main update function
  update(dt) {
    if (!Player.alive) return { x: 0, y: 0 };
    
    // Cultivation mode
    if (this.cultivating) {
      return this.updateCultivation(dt);
    }
    
    // Auto farm mode
    if (this.farming) {
      return this.updateFarming(dt);
    }
    
    return { x: 0, y: 0 };
  },
  
  // Update cultivation
  updateCultivation(dt) {
    // Stand still and cultivate
    if (GameState.time % 800 < dt) {
      // Gain realm exp
      Player.gainRealmExp(CONFIG.AUTO.CULTIVATION_REALM_EXP);
      Player.heal(2, CONFIG.AUTO.CULTIVATION_MP_REGEN);
      
      // Particles
      for (let i = 0; i < 2; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 20 + Math.random() * 15;
        GameState.particles.push({
          x: Player.x + Math.cos(angle) * dist,
          y: Player.y + Math.sin(angle) * dist,
          vx: Math.cos(angle) * -0.5,
          vy: -1 - Math.random(),
          life: 800,
          color: '#87ceeb',
          size: 2 + Math.random() * 2
        });
      }
    }
    
    this.updateDisplay();
    return { x: 0, y: 0 };
  },
  
  // Update farming
  updateFarming(dt) {
    let moveX = 0, moveY = 0;
    
    // Check HP and use potions
    if (this.settings.useHpPotion && Player.hp < Player.maxHp * CONFIG.AUTO.HP_POTION_THRESHOLD) {
      this.tryUsePotion('hp');
    }
    
    // Check MP and use potions
    if (this.settings.useMpPotion && Player.mp < Player.maxMp * CONFIG.AUTO.MP_POTION_THRESHOLD) {
      this.tryUsePotion('mp');
    }
    
    // Low HP - retreat and heal
    if (Player.hp < Player.maxHp * 0.2) {
      this.state.status = 'healing';
      this.state.targetEnemy = null;
      this.updateDisplay();
      return { x: 0, y: 0 }; // Stand still to regen
    }
    
    // Check if current target is still valid
    if (this.state.targetEnemy && (!this.state.targetEnemy.alive || 
        Utils.dist(Player.x, Player.y, this.state.targetEnemy.x, this.state.targetEnemy.y) > CONFIG.AUTO.SEARCH_RADIUS)) {
      this.state.targetEnemy = null;
    }
    
    // Find new target if needed
    if (!this.state.targetEnemy) {
      this.state.targetEnemy = this.findBestTarget();
      this.state.status = this.state.targetEnemy ? 'moving' : 'searching';
    }
    
    // Handle current target
    if (this.state.targetEnemy) {
      const target = this.state.targetEnemy;
      const dist = Utils.dist(Player.x, Player.y, target.x, target.y);
      
      if (dist <= CONFIG.BASE_ATTACK_RANGE) {
        // In combat range
        this.state.status = 'combat';
        this.state.combatTimer += dt;
        Player.target = target;
        UI.updateTargetInfo();
        
        // Use skills intelligently
        this.useSkillsIntelligently();
        
        // Slight movement towards target
        if (dist > 30) {
          const dx = target.x - Player.x;
          const dy = target.y - Player.y;
          moveX = (dx / dist) * 0.3;
          moveY = (dy / dist) * 0.3;
        }
      } else {
        // Move towards target
        this.state.status = 'moving';
        const dx = target.x - Player.x;
        const dy = target.y - Player.y;
        moveX = dx / dist;
        moveY = dy / dist;
      }
    } else {
      // No target - check if should return to search area
      const distFromCenter = Utils.dist(Player.x, Player.y, this.state.searchCenter.x, this.state.searchCenter.y);
      
      if (this.settings.stayInArea && distFromCenter > this.settings.areaRadius) {
        this.state.status = 'returning';
        const dx = this.state.searchCenter.x - Player.x;
        const dy = this.state.searchCenter.y - Player.y;
        moveX = dx / distFromCenter;
        moveY = dy / distFromCenter;
      } else {
        // Wander to find enemies
        this.state.idleTimer += dt;
        if (this.state.idleTimer > 2000) {
          // Random movement
          const angle = Math.random() * Math.PI * 2;
          moveX = Math.cos(angle) * 0.5;
          moveY = Math.sin(angle) * 0.5;
          this.state.idleTimer = 0;
        }
      }
    }
    
    // Detect stuck
    const moved = Utils.dist(Player.x, Player.y, this.state.lastPosition.x, this.state.lastPosition.y);
    if (moved < 1 && (Math.abs(moveX) > 0.1 || Math.abs(moveY) > 0.1)) {
      this.state.stuckTimer += dt;
      if (this.state.stuckTimer > 2000) {
        // Random direction to unstuck
        const angle = Math.random() * Math.PI * 2;
        moveX = Math.cos(angle);
        moveY = Math.sin(angle);
        this.state.stuckTimer = 0;
      }
    } else {
      this.state.stuckTimer = 0;
    }
    
    this.state.lastPosition = { x: Player.x, y: Player.y };
    this.updateDisplay();
    
    return { x: moveX, y: moveY };
  },
  
  // Find best target based on settings
  findBestTarget() {
    const enemies = Enemies.findInRange(Player.x, Player.y, CONFIG.AUTO.SEARCH_RADIUS, (enemy) => {
      // Filter out too high level enemies
      if (this.settings.avoidHigherLevel && enemy.level > Player.level + CONFIG.AUTO.AVOID_HIGHER_LEVEL) {
        return false;
      }
      // Filter bosses if not targeting
      if (!this.settings.targetBoss && enemy.boss) {
        return false;
      }
      return true;
    });
    
    if (enemies.length === 0) return null;
    
    // Sort by priority
    if (this.settings.priorityLowHp) {
      // Priority: low HP enemies first (easier to kill)
      enemies.sort((a, b) => {
        const aHpPercent = a.enemy.hp / a.enemy.maxHp;
        const bHpPercent = b.enemy.hp / b.enemy.maxHp;
        
        // Strong priority for very low HP
        if (aHpPercent < 0.3 && bHpPercent >= 0.3) return -1;
        if (bHpPercent < 0.3 && aHpPercent >= 0.3) return 1;
        
        // Then by distance
        return a.dist - b.dist;
      });
    }
    
    return enemies[0]?.enemy || null;
  },
  
  // Use skills intelligently
  useSkillsIntelligently() {
    if (!this.settings.useSkills) {
      // Only basic attack
      if (Player.skills[0].cd <= 0) {
        Player.useSkill(0);
      }
      return;
    }
    
    const hpPercent = Player.hp / Player.maxHp;
    const mpPercent = Player.mp / Player.maxMp;
    const target = this.state.targetEnemy;
    
    if (!target) return;
    
    // Calculate optimal skill based on situation
    const targetHpPercent = target.hp / target.maxHp;
    const nearbyEnemies = Enemies.findInRange(Player.x, Player.y, 100).length;
    
    // Ultimate skill - use when multiple enemies or boss low HP
    if (Player.skills[3].cd <= 0 && Player.mp >= Player.skills[3].mp) {
      if ((nearbyEnemies >= 3) || (target.boss && targetHpPercent < 0.4)) {
        Player.useSkill(3);
        return;
      }
    }
    
    // AOE skill - use when multiple enemies
    if (Player.skills[2].cd <= 0 && Player.mp >= Player.skills[2].mp) {
      if (nearbyEnemies >= 2 || target.boss) {
        Player.useSkill(2);
        return;
      }
    }
    
    // Projectile skill - good for single target
    if (Player.skills[1].cd <= 0 && Player.mp >= Player.skills[1].mp) {
      if (mpPercent > 0.3 || targetHpPercent < 0.5) {
        Player.useSkill(1);
        return;
      }
    }
    
    // Basic attack
    if (Player.skills[0].cd <= 0) {
      Player.useSkill(0);
    }
  },
  
  // Try to use HP or MP potion
  tryUsePotion(type) {
    const potionMap = {
      hp: ['hpPotionMedium', 'hpPotion'],
      mp: ['mpPotionMedium', 'mpPotion']
    };
    
    const potions = potionMap[type];
    for (const potionId of potions) {
      const slot = Inventory.items.find(item => item.id === potionId && item.count > 0);
      if (slot) {
        Inventory.useItem(potionId);
        UI.addLog(`💊 Auto sử dụng ${ITEMS[potionId].name}`, 'heal');
        return true;
      }
    }
    return false;
  },
  
  // Get save data
  getSaveData() {
    return {
      settings: { ...this.settings }
    };
  },
  
  // Load save data
  loadSaveData(data) {
    if (data?.settings) {
      Object.assign(this.settings, data.settings);
    }
  }
};

console.log('🤖 Auto System loaded');
