// ==================== FEATURE: PROGRESSION DEPTH ====================
// Sections: LimitBreak | SealedWeapons | ExteriorCultivation | UI & Init
// Load sau: game.js
// <script src="js/feature_progression_depth.js"></script>

// ==================== SECTION 1: DATA & CONFIG ====================

const LIMIT_BREAK_CONFIG = {
  skills: [
    {
      skillIdx: 0,
      name: 'Vạn Kiếm Như Nhất',
      targetUses: 500,
      color: '#ffffff',
      effect: {
        type: 'instant_kill_chance',
        chance: 0.05,
        desc: '5% chance instant kill quái thường'
      }
    },
    {
      skillIdx: 1,
      name: 'Thiên Xuyên Kiếm Khí',
      targetUses: 200,
      color: '#87ceeb',
      effect: {
        type: 'pierce',
        desc: 'Projectile xuyên qua tất cả quái trong đường thẳng'
      }
    },
    {
      skillIdx: 2,
      name: 'Thiên Lôi Liên Hoàn',
      targetUses: 100,
      color: '#ffeb3b',
      effect: {
        type: 'chain_lightning',
        chainCount: 2,
        chainDmgMul: 0.6,
        desc: 'Chain lightning sang 2 quái kế tiếp (60% dmg)'
      }
    },
    {
      skillIdx: 3,
      name: 'Vũ Trụ Quy Nguyên',
      targetUses: 50,
      color: '#ff00ff',
      effect: {
        type: 'pull_then_damage',
        pullRadius: 150,
        pullDuration: 500,
        desc: 'Hút tất cả quái vào tâm trước khi damage'
      }
    }
  ]
};

const SEALED_WEAPON_CONFIG = {
  maxEquipped: 2,
  weapons: [
    {
      id: 'voidBlade',
      name: 'Hư Vô Kiếm',
      icon: '⚔️',
      color: '#7c4dff',
      desc: 'Kiếm từ Cõi Hư Không. Phong ấn chờ giải phóng.',
      fragmentId: 'voidBladeFragment',
      totalFragments: 5,
      loreByFragments: [
        '0/5: Một thanh kiếm cổ xưa, phong ấn hoàn toàn...',
        '1/5: Ánh sáng tím le lói... có gì đó đang thức tỉnh.',
        '2/5: Kiếm khí bắt đầu rò rỉ. Bàn tay ngươi run nhẹ.',
        '3/5: Sức mạnh gần như được giải phóng... 60% công năng.',
        '4/5: Gần rồi... chỉ còn 1 mảnh cuối cùng.',
        '5/5: ✨ Thần Khí hoàn chỉnh! Kiếm Tâm thức tỉnh!'
      ],
      stats60pct: { atk: 80, critRate: 0.05 },
      stats100pct: { atk: 130, critRate: 0.10, critDmg: 0.30 },
      passive: {
        id: 'swordHeart',
        name: 'Kiếm Tâm',
        desc: 'Đứng yên 2s → đòn tiếp theo guaranteed crit + xuyên phòng thủ',
        idleTime: 2000,
        pierceDefense: true
      },
      dropSources: ['allMaps', 'ruins']
    },
    {
      id: 'windSpear',
      name: 'Thiên Phong Thương',
      icon: '🌪️',
      color: '#69f0ae',
      desc: 'Thương của Phong Thần. Di chuyển liên tục để tích sức mạnh.',
      fragmentId: 'windSpearFragment',
      totalFragments: 5,
      loreByFragments: [
        '0/5: Cây thương rỉ sét, gió không còn đáp lời...',
        '1/5: Cơn gió nhẹ bắt đầu quẩn quanh...',
        '2/5: Thương rung khi tốc độ đủ cao.',
        '3/5: Phong Thần cảm nhận lời kêu gọi...',
        '4/5: Gió gào thét chờ đợi lần cuối.',
        '5/5: 🌪️ Thiên Phong Thương hồi sinh! Phong Vũ thức tỉnh!'
      ],
      stats60pct: { atk: 70, speed: 0.5 },
      stats100pct: { atk: 110, speed: 0.8, critRate: 0.06 },
      passive: {
        id: 'windVeil',
        name: 'Phong Vũ',
        desc: 'Di chuyển liên tục → speed stack +2%/s (max +40%, reset khi dừng)',
        stackRate: 0.02,
        maxStacks: 20,
        resetOnIdle: true
      },
      dropSources: ['windEnemies', 'map1', 'map2']
    },
    {
      id: 'hellBlade',
      name: 'Địa Ngục Đao',
      icon: '💀',
      color: '#8b0000',
      desc: 'Đao từ địa ngục. Uống máu kẻ thù để tích lũy sức mạnh.',
      fragmentId: 'hellBladeFragment',
      totalFragments: 5,
      loreByFragments: [
        '0/5: Đao ngập máu khô... ai đã dùng nó?',
        '1/5: Mùi máu vẫn còn... đao nhớ vị của nó.',
        '2/5: Mỗi mạng sống thu hoạch thêm năng lượng.',
        '3/5: Địa ngục đang gọi... đao hưởng ứng.',
        '4/5: Tiếng la hét từ địa ngục vang vọng...',
        '5/5: 💀 Địa Ngục Đao thức tỉnh! Huyết Khát trỗi dậy!'
      ],
      stats60pct: { atk: 90, def: 10 },
      stats100pct: { atk: 140, def: 20, maxHp: 100 },
      passive: {
        id: 'bloodThirst',
        name: 'Huyết Khát',
        desc: 'Mỗi kill → +2% damage (max +50%, reset khi đổi map)',
        stackPerKill: 0.02,
        maxBonus: 0.50,
        resetOnMapChange: true
      },
      dropSources: ['darkEnemies', 'map4']
    },
    {
      id: 'lifeSpear',
      name: 'Tiên Vũ Kiếm',
      icon: '🌿',
      color: '#66bb6a',
      desc: 'Kiếm được phong ấn bởi linh khí sinh mệnh.',
      fragmentId: 'lifeSpearFragment',
      totalFragments: 5,
      loreByFragments: [
        '0/5: Kiếm phát ra hơi ấm kỳ lạ...',
        '1/5: Linh khí sinh mệnh bắt đầu lưu chuyển.',
        '2/5: Vết thương lành nhanh hơn khi cầm kiếm này.',
        '3/5: Sức sống phục hồi ngay cả trong chiến đấu.',
        '4/5: Sinh mệnh và kiếm hòa làm một...',
        '5/5: 🌿 Tiên Vũ Kiếm thức tỉnh! Linh Thể trỗi dậy!'
      ],
      stats60pct: { atk: 60, maxHp: 150 },
      stats100pct: { atk: 100, maxHp: 300, def: 15 },
      passive: {
        id: 'lifeForce',
        name: 'Linh Thể',
        desc: 'Hồi 2% HP/s khi không trong combat (không bị aggro 3s)',
        regenPct: 0.02,
        combatCooldown: 3000
      },
      dropSources: ['ruins', 'map5']
    },
    {
      id: 'chaosSword',
      name: 'Hỗn Độn Kiếm',
      icon: '🎲',
      color: '#ff6f00',
      desc: 'Kiếm từ Cõi Hư Không Tuyệt Đối.',
      fragmentId: 'chaosSwordFragment',
      totalFragments: 5,
      loreByFragments: [
        '0/5: Không có hình dạng cố định... nó là gì?',
        '1/5: Màu sắc thay đổi liên tục như hỗn độn.',
        '2/5: Nguyên tố ngẫu nhiên phát ra từ lưỡi kiếm.',
        '3/5: Hỗn độn... nhưng có quy luật riêng của nó.',
        '4/5: Tất cả nguyên tố hợp nhất trong một nhát chém.',
        '5/5: 🎲 Hỗn Độn Kiếm thức tỉnh! Hỗn Độn Chi Đạo trỗi dậy!'
      ],
      stats60pct: { atk: 100, critDmg: 0.20 },
      stats100pct: { atk: 160, critDmg: 0.40, critRate: 0.08 },
      passive: {
        id: 'chaosDao',
        name: 'Hỗn Độn Chi Đạo',
        desc: 'Mỗi đòn đánh random 1 trong 4 nguyên tố. Crit rate x2 với nguyên tố khắc chế.',
        randomElement: true
      },
      dropSources: ['voidRift', 'legendary']
    }
  ],
  fragmentDropRates: {
    normalEnemy: 0.001,
    bossEnemy: 0.05,
    ruins: 0.30,
    voidRift: 0.20
  }
};

const EXTERIOR_CULTIVATION_CONFIG = {
  parts: {
    hand: {
      id: 'hand', name: 'Thủ', icon: '✋', desc: 'Tu luyện đôi tay',
      effectPerLevel: { atkPct: 0.04 },
      bonusAt5: { critDmgPct: 0.10 },
      bonusAt10: { atkPct: 0.40, critDmgPct: 0.10 },
      materials: [
        { id: 'wolfFang', count: 3 },
        { id: 'demonCore', count: 1 }
      ],
      goldCost: 100
    },
    foot: {
      id: 'foot', name: 'Túc', icon: '🦶', desc: 'Tu luyện tốc độ',
      effectPerLevel: { speedPct: 0.025 },
      bonusAt5: { dashAbility: false },
      bonusAt10: { speedPct: 0.25 },
      materials: [
        { id: 'wolfPelt', count: 3 },
        { id: 'spiritStone', count: 1 }
      ],
      goldCost: 100
    },
    eye: {
      id: 'eye', name: 'Nhãn', icon: '👁️', desc: 'Tu luyện tầm nhìn',
      effectPerLevel: { critRatePct: 0.015 },
      bonusAt5: { seeEnemyHp: true },
      bonusAt10: { critRatePct: 0.15 },
      materials: [
        { id: 'spiritStone', count: 2 },
        { id: 'demonCore', count: 2 }
      ],
      goldCost: 200
    },
    ear: {
      id: 'ear', name: 'Nhĩ', icon: '👂', desc: 'Tu luyện cảm giác',
      effectPerLevel: { aggroDetect: 0.10 },
      bonusAt5: { trapDetect: true },
      bonusAt10: { aggroDetect: 1.0 },
      materials: [
        { id: 'demonCore', count: 2 },
        { id: 'dragonScale', count: 1 }
      ],
      goldCost: 250
    },
    heart: {
      id: 'heart', name: 'Tâm', icon: '❤️', desc: 'Tu luyện sức sống',
      effectPerLevel: { maxHpPct: 0.03, hpRegenBonus: 0.5 },
      bonusAt5: { deathImmunityBonus: true },
      bonusAt10: { maxHpPct: 0.30, hpRegenBonus: 5 },
      materials: [
        { id: 'dragonScale', count: 2 },
        { id: 'celestialOrb', count: 1 }
      ],
      goldCost: 400
    },
    brain: {
      id: 'brain', name: 'Não', icon: '🧠', desc: 'Tu luyện trí tuệ',
      effectPerLevel: { skillDmgPct: 0.02, mpCostRedPct: 0.03 },
      bonusAt5: { cdReductionPct: 0.10 },
      bonusAt10: { skillDmgPct: 0.20, mpCostRedPct: 0.30, cdReductionPct: 0.15 },
      materials: [
        { id: 'celestialOrb', count: 2 },
        { id: 'dragonScale', count: 2 }
      ],
      goldCost: 600
    }
  },
  maxLevel: 10
};

// ==================== SECTION 2: LIMIT BREAK SYSTEM ====================

const LimitBreakSystem = {
  state: {
    useCounts: [0, 0, 0, 0],
    unlocked: [false, false, false, false],
    pullActive: false,
    pullEndTime: 0,
    swordHeartIdleTimer: 0,
    swordHeartReady: false
  },

  onSkillUsed(skillIdx) {
    const state = this.state;
    const cfg = LIMIT_BREAK_CONFIG.skills.find(s => s.skillIdx === skillIdx);
    if (!cfg) return;
    if (state.unlocked[skillIdx]) return;

    state.useCounts[skillIdx]++;
    if (state.useCounts[skillIdx] >= cfg.targetUses) {
      state.unlocked[skillIdx] = true;
      UI.showNotification('⚡ Limit Break Unlock!', cfg.name);
      UI.addLog('⚡ Skill ' + skillIdx + ' Limit Break: ' + cfg.name + '!', 'realm');
      const btn = document.getElementById('skill' + skillIdx);
      if (btn) {
        btn.style.boxShadow = '0 0 20px ' + cfg.color + ', inset 0 0 20px rgba(0,0,0,0.5)';
      }
    }
  },

  applyEffect(skillIdx, hitEnemies) {
    const state = this.state;
    if (!state.unlocked[skillIdx]) return;
    const cfg = LIMIT_BREAK_CONFIG.skills.find(s => s.skillIdx === skillIdx);
    if (!cfg) return;
    const effect = cfg.effect;

    switch (effect.type) {
      case 'instant_kill_chance':
        hitEnemies.forEach(function(enemy) {
          if (!enemy.alive || enemy.boss) return;
          if (Utils.chance(effect.chance)) {
            enemy.hp = 0;
            Enemies.kill(enemy);
            Game.spawnDamageNumber(enemy.x, enemy.y - 30, '⚡INSTANT!', '#ffffff');
          }
        });
        break;

      case 'pierce': {
        const angle = Player.dir === 'right' ? 0
          : Player.dir === 'left' ? Math.PI
          : Player.dir === 'up' ? -Math.PI / 2
          : Math.PI / 2;
        const pierceRange = 200;
        for (const enemy of Enemies.list) {
          if (!enemy.alive) continue;
          const dx = enemy.x - Player.x;
          const dy = enemy.y - Player.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > pierceRange) continue;
          const enemyAngle = Math.atan2(dy, dx);
          let angleDiff = Math.abs(enemyAngle - angle);
          if (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;
          if (angleDiff < 0.4) {
            Enemies.damage(enemy, Math.floor(Player.atk * 2.2 * 0.7), false, '#87ceeb');
          }
        }
        for (let i = 0; i < 10; i++) {
          GameState.particles.push({
            x: Player.x + Math.cos(angle) * i * 20,
            y: Player.y + Math.sin(angle) * i * 20,
            vx: Math.cos(angle) * 3,
            vy: Math.sin(angle) * 3,
            life: 300,
            color: '#87ceeb',
            size: 3
          });
        }
        break;
      }

      case 'chain_lightning':
        hitEnemies.forEach(function(primary) {
          let chainSource = primary;
          const alreadyHit = hitEnemies.slice();
          for (let c = 0; c < effect.chainCount; c++) {
            const next = Enemies.findNearest(
              chainSource.x, chainSource.y, 120,
              function(e) { return e.alive && e !== chainSource && !alreadyHit.includes(e); }
            );
            if (!next) break;
            alreadyHit.push(next);
            const chainDmg = Math.floor(Player.atk * SKILLS[2].dmgMul * effect.chainDmgMul);
            Enemies.damage(next, chainDmg, false, '#ffeb3b');
            for (let i = 0; i < 5; i++) {
              const t = i / 5;
              GameState.particles.push({
                x: chainSource.x + (next.x - chainSource.x) * t + (Math.random() - 0.5) * 10,
                y: chainSource.y + (next.y - chainSource.y) * t + (Math.random() - 0.5) * 10,
                vx: 0,
                vy: -0.5,
                life: 200,
                color: '#ffeb3b',
                size: 2 + Math.random()
              });
            }
            chainSource = next;
          }
        });
        break;

      case 'pull_then_damage':
        state.pullActive = true;
        state.pullEndTime = GameState.time + effect.pullDuration;
        for (const enemy of Enemies.list) {
          if (!enemy.alive) continue;
          const dist = Utils.dist(enemy.x, enemy.y, Player.x, Player.y);
          if (dist <= effect.pullRadius) {
            enemy._pullTarget = { x: Player.x, y: Player.y };
            enemy._pullEndTime = state.pullEndTime;
          }
        }
        break;
    }
  },

  update(dt) {
    const state = this.state;

    // Pull effect update
    if (state.pullActive) {
      for (const enemy of Enemies.list) {
        if (!enemy.alive || !enemy._pullTarget) continue;
        if (GameState.time > enemy._pullEndTime) {
          delete enemy._pullTarget;
          delete enemy._pullEndTime;
          continue;
        }
        const dx = enemy._pullTarget.x - enemy.x;
        const dy = enemy._pullTarget.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 10) {
          enemy.x += (dx / dist) * 6;
          enemy.y += (dy / dist) * 6;
        }
      }

      if (GameState.time > state.pullEndTime) {
        state.pullActive = false;
        const pulled = Enemies.list.filter(function(e) {
          return e.alive && Utils.dist(e.x, e.y, Player.x, Player.y) < 50;
        });
        pulled.forEach(function(e) {
          Enemies.damage(e, Math.floor(Player.atk * 5.5), false, '#ff00ff');
        });
        for (let i = 0; i < 20; i++) {
          const a = Math.random() * Math.PI * 2;
          GameState.particles.push({
            x: Player.x + Math.cos(a) * 5,
            y: Player.y + Math.sin(a) * 5,
            vx: Math.cos(a) * 5,
            vy: Math.sin(a) * 5 - 2,
            life: 700,
            color: '#ff00ff',
            size: 4 + Math.random() * 4
          });
        }
      }
    }

    // Sword Heart idle timer
    if (SealedWeaponSystem.isEquipped('voidBlade') && SealedWeaponSystem.isUnlocked('voidBlade')) {
      const isMoving = Math.abs(Player.vx || 0) > 0.1 || Math.abs(Player.vy || 0) > 0.1;
      if (!isMoving) {
        state.swordHeartIdleTimer += dt;
        if (state.swordHeartIdleTimer >= 2000) {
          state.swordHeartReady = true;
        }
      } else {
        state.swordHeartIdleTimer = 0;
        state.swordHeartReady = false;
      }
    }
  },

  getSaveData() {
    return {
      useCounts: this.state.useCounts.slice(),
      unlocked: this.state.unlocked.slice()
    };
  },

  loadSaveData(data) {
    if (!data) return;
    if (data.useCounts) this.state.useCounts = data.useCounts;
    if (data.unlocked) this.state.unlocked = data.unlocked;
  }
};

// ==================== SECTION 3: SEALED WEAPON SYSTEM ====================

const SealedWeaponSystem = {
  state: {
    fragments: {},
    equippedWeapons: [],
    windStacks: 0,
    bloodThirstBonus: 0,
    lifeForceNoAggro: 0,
    _windAccum: 0
  },

  getFragmentCount(weaponId) {
    const weapon = SEALED_WEAPON_CONFIG.weapons.find(function(w) { return w.id === weaponId; });
    if (!weapon) return 0;
    return this.state.fragments[weapon.fragmentId] || 0;
  },

  isUnlocked(weaponId) {
    const weapon = SEALED_WEAPON_CONFIG.weapons.find(function(w) { return w.id === weaponId; });
    if (!weapon) return false;
    return this.getFragmentCount(weaponId) >= weapon.totalFragments;
  },

  isEquipped(weaponId) {
    return this.state.equippedWeapons.includes(weaponId);
  },

  getWeaponName(weaponId) {
    const weapon = SEALED_WEAPON_CONFIG.weapons.find(function(w) { return w.id === weaponId; });
    return weapon ? weapon.name : weaponId;
  },

  equipWeapon(weaponId) {
    const state = this.state;
    if (this.isEquipped(weaponId)) {
      state.equippedWeapons = state.equippedWeapons.filter(function(id) { return id !== weaponId; });
      Player.recalculateStats();
      UI.addLog('📦 Tháo ' + this.getWeaponName(weaponId), 'system');
      ProgressionDepthUI.renderCharacterSections();
      return;
    }
    if (state.equippedWeapons.length >= SEALED_WEAPON_CONFIG.maxEquipped) {
      UI.addLog('❌ Đã equip đủ 2 Thần Khí!', 'system');
      return;
    }
    const frags = this.getFragmentCount(weaponId);
    if (frags === 0) {
      UI.addLog('❌ Chưa có mảnh vỡ của Thần Khí này!', 'system');
      return;
    }
    state.equippedWeapons.push(weaponId);
    Player.recalculateStats();
    UI.addLog('⚔️ Trang bị ' + this.getWeaponName(weaponId), 'item');
    ProgressionDepthUI.renderCharacterSections();
  },

  getWeaponStats(weaponId) {
    const weapon = SEALED_WEAPON_CONFIG.weapons.find(function(w) { return w.id === weaponId; });
    if (!weapon) return {};
    const frags = this.getFragmentCount(weaponId);
    const pct = frags / weapon.totalFragments;
    if (pct >= 1.0) return Object.assign({}, weapon.stats100pct);
    if (pct >= 0.6) return Object.assign({}, weapon.stats60pct);
    return {};
  },

  applyToStats(player) {
    const self = this;
    for (const weaponId of self.state.equippedWeapons) {
      const stats = self.getWeaponStats(weaponId);
      if (stats.atk)      player.atk      += stats.atk;
      if (stats.def)      player.def      += stats.def;
      if (stats.maxHp)    player.maxHp    += stats.maxHp;
      if (stats.speed)    player.speed    += stats.speed;
      if (stats.critRate) player.critRate += stats.critRate;
      if (stats.critDmg)  player.critDmg  += stats.critDmg;
    }
    self._applyPassives(player);
  },

  _applyPassives(player) {
    // Wind stacks (Phong Vũ)
    if (this.isEquipped('windSpear') && this.isUnlocked('windSpear')) {
      player.speed += player.speed * (this.state.windStacks * 0.02);
    }
    // Blood thirst
    if (this.isEquipped('hellBlade') && this.isUnlocked('hellBlade')) {
      player._bloodThirstBonus = this.state.bloodThirstBonus;
    }
    // Chaos sword
    if (this.isEquipped('chaosSword') && this.isUnlocked('chaosSword')) {
      player._chaosSwordActive = true;
    }
  },

  update(dt) {
    const state = this.state;

    // Wind stacks (Phong Vũ)
    if (this.isEquipped('windSpear') && this.isUnlocked('windSpear')) {
      const isMoving = Math.abs(Player.vx || 0) > 0.1 || Math.abs(Player.vy || 0) > 0.1;
      if (isMoving) {
        state._windAccum = (state._windAccum || 0) + dt;
        if (state._windAccum >= 1000) {
          state._windAccum -= 1000;
          const windWeapon = SEALED_WEAPON_CONFIG.weapons.find(function(w) { return w.id === 'windSpear'; });
          state.windStacks = Math.min(windWeapon.passive.maxStacks, state.windStacks + 1);
          Player.recalculateStats();
        }
      } else {
        if (state.windStacks > 0) {
          state.windStacks = 0;
          state._windAccum = 0;
          Player.recalculateStats();
        }
      }
    }

    // Life Force regen (Tiên Vũ Kiếm)
    if (this.isEquipped('lifeSpear') && this.isUnlocked('lifeSpear')) {
      const hasAggro = Enemies.list.some(function(e) {
        return e.alive && e.aggroed && Utils.dist(e.x, e.y, Player.x, Player.y) < 200;
      });
      if (!hasAggro) {
        state.lifeForceNoAggro += dt;
        if (state.lifeForceNoAggro >= 3000) {
          const regen = Math.floor(Player.maxHp * 0.02 * dt / 1000);
          if (regen > 0) {
            Player.hp = Math.min(Player.maxHp, Player.hp + regen);
          }
        }
      } else {
        state.lifeForceNoAggro = 0;
      }
    }
  },

  onKill(enemy) {
    // Blood Thirst stack
    if (this.isEquipped('hellBlade') && this.isUnlocked('hellBlade')) {
      const hellWeapon = SEALED_WEAPON_CONFIG.weapons.find(function(w) { return w.id === 'hellBlade'; });
      this.state.bloodThirstBonus = Math.min(
        hellWeapon.passive.maxBonus,
        this.state.bloodThirstBonus + hellWeapon.passive.stackPerKill
      );
      Player.recalculateStats();
    }

    // Fragment drops
    const dropRates = SEALED_WEAPON_CONFIG.fragmentDropRates;
    const rate = enemy.boss ? dropRates.bossEnemy : dropRates.normalEnemy;
    for (const weapon of SEALED_WEAPON_CONFIG.weapons) {
      if (Utils.chance(rate)) {
        this.state.fragments[weapon.fragmentId] = (this.state.fragments[weapon.fragmentId] || 0) + 1;
        UI.addLog('🔮 Nhặt được mảnh ' + weapon.name + '!', 'item');
        break; // chỉ drop 1 fragment per kill
      }
    }
  },

  onMapChange() {
    if (this.state.bloodThirstBonus > 0) {
      this.state.bloodThirstBonus = 0;
      Player.recalculateStats();
      UI.addLog('🔴 Huyết Khát reset khi đổi map.', 'system');
    }
    this.state.lifeForceNoAggro = 0;
    this.state.windStacks = 0;
    this.state._windAccum = 0;
  },

  getSaveData() {
    return {
      fragments: Object.assign({}, this.state.fragments),
      equippedWeapons: this.state.equippedWeapons.slice(),
      bloodThirstBonus: this.state.bloodThirstBonus,
      windStacks: this.state.windStacks
    };
  },

  loadSaveData(data) {
    if (!data) return;
    if (data.fragments) this.state.fragments = data.fragments;
    if (data.equippedWeapons) this.state.equippedWeapons = data.equippedWeapons;
    if (data.bloodThirstBonus) this.state.bloodThirstBonus = data.bloodThirstBonus;
    if (data.windStacks) this.state.windStacks = data.windStacks;
  }
};

// ==================== SECTION 4: EXTERIOR CULTIVATION SYSTEM ====================

const ExteriorCultivation = {
  state: {
    levels: {
      hand: 0, foot: 0, eye: 0, ear: 0, heart: 0, brain: 0
    }
  },

  getLevel(partId) {
    return this.state.levels[partId] || 0;
  },

  canUpgrade(partId) {
    const level = this.getLevel(partId);
    if (level >= EXTERIOR_CULTIVATION_CONFIG.maxLevel) {
      return { can: false, missing: ['Đã đạt cấp tối đa!'] };
    }
    const part = EXTERIOR_CULTIVATION_CONFIG.parts[partId];
    const missing = [];
    part.materials.forEach(function(m) {
      if (!Inventory.has(m.id, m.count)) {
        const itemName = (ITEMS[m.id] && ITEMS[m.id].name) ? ITEMS[m.id].name : m.id;
        missing.push(itemName + ' x' + m.count);
      }
    });
    if (Player.gold < part.goldCost) {
      missing.push('💰 ' + part.goldCost + ' vàng');
    }
    return { can: missing.length === 0, missing: missing };
  },

  upgrade(partId) {
    const check = this.canUpgrade(partId);
    if (!check.can) {
      UI.addLog('❌ Thiếu: ' + check.missing.join(', '), 'system');
      return false;
    }
    const part = EXTERIOR_CULTIVATION_CONFIG.parts[partId];
    // Consume
    part.materials.forEach(function(m) { Inventory.remove(m.id, m.count); });
    Player.gold -= part.goldCost;

    this.state.levels[partId]++;
    const newLevel = this.state.levels[partId];
    Player.recalculateStats();

    UI.addLog('✨ ' + part.name + ' tu luyện lên Lv.' + newLevel + '!', 'realm');
    UI.showNotification('✨ ' + part.icon + ' ' + part.name + ' Lv.' + newLevel,
      this.getEffectDesc(partId, newLevel));

    if (newLevel === 5 || newLevel === 10) {
      UI.showNotification('🌟 Cột Mốc!', part.name + ' Lv.' + newLevel + ' bonus mở khóa!');
    }

    UI.updateGold();
    Inventory.render();
    ProgressionDepthUI.renderCharacterSections();
    return true;
  },

  getEffectDesc(partId, level) {
    const part = EXTERIOR_CULTIVATION_CONFIG.parts[partId];
    const e = part.effectPerLevel;
    const desc = [];
    if (e.atkPct)       desc.push('ATK +' + Math.round(e.atkPct * level * 100) + '%');
    if (e.speedPct)     desc.push('Speed +' + Math.round(e.speedPct * level * 100) + '%');
    if (e.critRatePct)  desc.push('Crit +' + Math.round(e.critRatePct * level * 100) + '%');
    if (e.maxHpPct)     desc.push('HP +' + Math.round(e.maxHpPct * level * 100) + '%');
    if (e.skillDmgPct)  desc.push('Skill +' + Math.round(e.skillDmgPct * level * 100) + '%');
    if (e.aggroDetect)  desc.push('Aggro Rng +' + Math.round(e.aggroDetect * level * 100) + '%');
    if (e.hpRegenBonus) desc.push('HP Regen +' + (e.hpRegenBonus * level).toFixed(1));
    return desc.join(', ') || 'Tu luyện thành công!';
  },

  applyToStats(player) {
    for (const partId in this.state.levels) {
      const level = this.state.levels[partId];
      if (level === 0) continue;
      const part = EXTERIOR_CULTIVATION_CONFIG.parts[partId];
      const e = part.effectPerLevel;

      if (e.atkPct)       player.atk      = Math.floor(player.atk * (1 + e.atkPct * level));
      if (e.speedPct)     player.speed    *= (1 + e.speedPct * level);
      if (e.critRatePct)  player.critRate += e.critRatePct * level;
      if (e.maxHpPct)     player.maxHp    = Math.floor(player.maxHp * (1 + e.maxHpPct * level));
      if (e.skillDmgPct)  player._extSkillDmg  = (player._extSkillDmg  || 0) + e.skillDmgPct  * level;
      if (e.mpCostRedPct) player._extMpCostRed = (player._extMpCostRed || 0) + e.mpCostRedPct * level;
      if (e.cdReductionPct && level >= 5) {
        player._extCdReduction = part.bonusAt5.cdReductionPct;
      }

      // Special bonuses
      if (level >= 5 && part.bonusAt5 && part.bonusAt5.seeEnemyHp)  player._seeEnemyHp = true;
      if (level >= 5 && part.bonusAt5 && part.bonusAt5.trapDetect)  player._trapDetect  = true;
    }
  },

  getSaveData() {
    return { levels: Object.assign({}, this.state.levels) };
  },

  loadSaveData(data) {
    if (!data) return;
    if (data.levels) this.state.levels = Object.assign({ hand:0,foot:0,eye:0,ear:0,heart:0,brain:0 }, data.levels);
  }
};

// ==================== SECTION 5: UI ====================

const ProgressionDepthUI = {

  renderCharacterSections() {
    const stats = document.getElementById('charStats');
    if (!stats) return;

    // Remove old sections if exist
    const oldSections = stats.querySelectorAll('.pd-section');
    oldSections.forEach(function(s) { s.remove(); });

    stats.appendChild(this._buildLimitBreakSection());
    stats.appendChild(this._buildSealedWeaponSection());
    stats.appendChild(this._buildExteriorSection());
  },

  _buildLimitBreakSection() {
    const section = document.createElement('div');
    section.className = 'pd-section';
    section.style.cssText = 'margin-top:16px;padding-top:14px;border-top:1px solid #333';

    let html = '<div style="color:#f0c040;font-size:12px;margin-bottom:10px;font-weight:bold">⚡ Limit Break</div>';

    LIMIT_BREAK_CONFIG.skills.forEach(function(cfg) {
      const idx = cfg.skillIdx;
      const uses = LimitBreakSystem.state.useCounts[idx];
      const unlocked = LimitBreakSystem.state.unlocked[idx];
      const pct = unlocked ? 100 : Math.min(100, Math.floor(uses / cfg.targetUses * 100));
      const skillNames = ['Cơ Bản Kiếm Pháp', 'Kiếm Phong Trảm', 'Lôi Điện Thuật', 'Vạn Kiếm Quy Tông'];

      html += '<div style="margin-bottom:8px">';
      html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px">';
      html += '<span style="font-size:10px;color:#ccc">' + skillNames[idx] + '</span>';
      if (unlocked) {
        html += '<span style="font-size:9px;color:' + cfg.color + ';font-weight:bold">✨ ' + cfg.name + '</span>';
      } else {
        html += '<span style="font-size:9px;color:#888">' + uses + '/' + cfg.targetUses + '</span>';
      }
      html += '</div>';
      html += '<div style="background:#111;border-radius:3px;height:5px;overflow:hidden">';
      html += '<div style="height:100%;background:' + (unlocked ? cfg.color : '#555') + ';width:' + pct + '%;transition:width 0.3s;' + (unlocked ? 'box-shadow:0 0 6px ' + cfg.color : '') + '"></div>';
      html += '</div>';
      if (unlocked) {
        html += '<div style="font-size:9px;color:#999;margin-top:2px">' + cfg.effect.desc + '</div>';
      }
      html += '</div>';
    });

    section.innerHTML = html;
    return section;
  },

  _buildSealedWeaponSection() {
    const section = document.createElement('div');
    section.className = 'pd-section';
    section.style.cssText = 'margin-top:16px;padding-top:14px;border-top:1px solid #333';

    let html = '<div style="color:#f0c040;font-size:12px;margin-bottom:10px;font-weight:bold">⚔️ Thần Khí (' + SealedWeaponSystem.state.equippedWeapons.length + '/' + SEALED_WEAPON_CONFIG.maxEquipped + ' đang dùng)</div>';
    html += '<div style="display:grid;gap:8px">';

    SEALED_WEAPON_CONFIG.weapons.forEach(function(weapon) {
      const frags = SealedWeaponSystem.getFragmentCount(weapon.id);
      const total = weapon.totalFragments;
      const unlocked = SealedWeaponSystem.isUnlocked(weapon.id);
      const equipped = SealedWeaponSystem.isEquipped(weapon.id);
      const pct = frags / total;
      const loreIdx = Math.min(frags, total);
      const loreText = weapon.loreByFragments[loreIdx];

      const stats = SealedWeaponSystem.getWeaponStats(weapon.id);
      const statParts = [];
      if (stats.atk)      statParts.push('ATK +' + stats.atk);
      if (stats.def)      statParts.push('DEF +' + stats.def);
      if (stats.maxHp)    statParts.push('HP +' + stats.maxHp);
      if (stats.speed)    statParts.push('SPD +' + stats.speed);
      if (stats.critRate) statParts.push('CR +' + (stats.critRate * 100).toFixed(0) + '%');
      if (stats.critDmg)  statParts.push('CD +' + (stats.critDmg * 100).toFixed(0) + '%');

      const borderColor = equipped ? weapon.color : (frags > 0 ? '#555' : '#2a2a2a');
      const bgColor = equipped ? 'rgba(255,255,255,0.05)' : 'transparent';

      html += '<div style="border:1px solid ' + borderColor + ';border-radius:6px;padding:8px;background:' + bgColor + '">';
      html += '<div style="display:flex;justify-content:space-between;align-items:center">';
      html += '<div style="display:flex;align-items:center;gap:6px">';
      html += '<span style="font-size:16px">' + weapon.icon + '</span>';
      html += '<div>';
      html += '<div style="color:' + weapon.color + ';font-size:11px;font-weight:bold">' + weapon.name + '</div>';
      html += '<div style="color:#888;font-size:9px">' + frags + '/' + total + ' mảnh</div>';
      html += '</div>';
      html += '</div>';

      // Progress bar
      html += '<div style="text-align:right">';
      html += '<div style="background:#111;border-radius:3px;height:4px;width:60px;overflow:hidden;margin-bottom:3px">';
      html += '<div style="height:100%;background:' + weapon.color + ';width:' + Math.floor(pct * 100) + '%"></div>';
      html += '</div>';

      if (frags > 0) {
        const btnLabel = equipped ? 'Tháo Ra' : 'Trang Bị';
        const btnColor = equipped ? '#f44336' : weapon.color;
        html += '<button onclick="SealedWeaponSystem.equipWeapon(\'' + weapon.id + '\')" '
          + 'style="font-size:9px;padding:2px 6px;border:1px solid ' + btnColor + ';background:transparent;'
          + 'color:' + btnColor + ';border-radius:3px;cursor:pointer;font-family:inherit">' + btnLabel + '</button>';
      } else {
        html += '<span style="font-size:9px;color:#444">Chưa có</span>';
      }
      html += '</div></div>'; // end flex + top row

      // Lore
      html += '<div style="font-size:9px;color:#777;margin-top:4px;font-style:italic">' + loreText + '</div>';

      // Stats
      if (statParts.length > 0) {
        html += '<div style="font-size:9px;color:#4caf50;margin-top:3px">' + statParts.join(' · ') + '</div>';
      }

      // Passive
      if (unlocked) {
        html += '<div style="font-size:9px;color:#ffeb3b;margin-top:3px">✨ ' + weapon.passive.name + ': ' + weapon.passive.desc + '</div>';
      }

      html += '</div>'; // end weapon card
    });

    html += '</div>';
    section.innerHTML = html;
    return section;
  },

  _buildExteriorSection() {
    const section = document.createElement('div');
    section.className = 'pd-section';
    section.style.cssText = 'margin-top:16px;padding-top:14px;border-top:1px solid #333;padding-bottom:16px';

    let html = '<div style="color:#f0c040;font-size:12px;margin-bottom:10px;font-weight:bold">✨ Ngoại Tu (Tu Luyện Thân Thể)</div>';
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">';

    const parts = EXTERIOR_CULTIVATION_CONFIG.parts;
    const maxLevel = EXTERIOR_CULTIVATION_CONFIG.maxLevel;

    for (const partId in parts) {
      const part = parts[partId];
      const level = ExteriorCultivation.getLevel(partId);
      const check = ExteriorCultivation.canUpgrade(partId);
      const isMax = level >= maxLevel;
      const effectDesc = level > 0 ? ExteriorCultivation.getEffectDesc(partId, level) : part.desc;

      const matList = part.materials.map(function(m) {
        const have = Inventory.has(m.id, m.count);
        const name = (ITEMS[m.id] && ITEMS[m.id].name) ? ITEMS[m.id].name : m.id;
        return '<span style="color:' + (have ? '#4caf50' : '#f44336') + '">' + name + 'x' + m.count + '</span>';
      }).join(' ');

      const goldOk = Player.gold >= part.goldCost;

      html += '<div style="border:1px solid #333;border-radius:6px;padding:8px;background:rgba(255,255,255,0.02)">';
      html += '<div style="display:flex;align-items:center;gap:5px;margin-bottom:5px">';
      html += '<span style="font-size:18px">' + part.icon + '</span>';
      html += '<div>';
      html += '<div style="color:#ce93d8;font-size:11px;font-weight:bold">' + part.name;
      if (level > 0) html += ' <span style="color:#ffeb3b">Lv.' + level + '</span>';
      html += '</div>';
      html += '<div style="color:#888;font-size:9px">' + effectDesc + '</div>';
      html += '</div></div>';

      // Progress bar
      const barPct = Math.floor(level / maxLevel * 100);
      html += '<div style="background:#111;border-radius:3px;height:4px;overflow:hidden;margin-bottom:6px">';
      html += '<div style="height:100%;background:#ce93d8;width:' + barPct + '%"></div>';
      html += '</div>';

      if (!isMax) {
        // Materials required
        html += '<div style="font-size:8px;margin-bottom:5px">' + matList + ' <span style="color:' + (goldOk ? '#4caf50' : '#f44336') + '">💰' + part.goldCost + '</span></div>';

        const btnStyle = check.can
          ? 'background:rgba(206,147,216,0.2);border:1px solid #ce93d8;color:#ce93d8;cursor:pointer;'
          : 'background:rgba(255,255,255,0.03);border:1px solid #444;color:#555;cursor:not-allowed;';
        html += '<button onclick="ExteriorCultivation.upgrade(\'' + partId + '\')" '
          + 'style="width:100%;padding:4px;border-radius:4px;font-size:9px;font-family:inherit;' + btnStyle + '">';
        html += isMax ? 'Tối đa' : (check.can ? '⬆ Tu Luyện' : '❌ Thiếu vật liệu');
        html += '</button>';
      } else {
        html += '<div style="text-align:center;font-size:9px;color:#ffeb3b">✨ Tối đa Lv.10!</div>';
      }

      html += '</div>'; // end part card
    }

    html += '</div>';
    section.innerHTML = html;
    return section;
  }
};

// ==================== SECTION 6: HOOKS & INIT ====================

const ProgressionDepthFeature = {

  _injectStyles() {
    if (document.getElementById('pd-styles')) return;
    const style = document.createElement('style');
    style.id = 'pd-styles';
    style.textContent = `
      .pd-section button:hover { opacity: 0.85; }
      #skill0.lb-glow, #skill1.lb-glow, #skill2.lb-glow, #skill3.lb-glow { transition: box-shadow 0.3s; }
    `;
    document.head.appendChild(style);
  },

  _wrapRecalculateStats() {
    const _origRecalc = Player.recalculateStats.bind(Player);
    Player.recalculateStats = function() {
      _origRecalc();
      // Clear temporary flags before applying systems
      delete this._extSkillDmg;
      delete this._extMpCostRed;
      delete this._extCdReduction;
      delete this._seeEnemyHp;
      delete this._trapDetect;
      delete this._bloodThirstBonus;
      delete this._chaosSwordActive;
      SealedWeaponSystem.applyToStats(this);
      ExteriorCultivation.applyToStats(this);
    };
  },

  _wrapUseSkill() {
    const _origUS = Player.useSkill.bind(Player);
    Player.useSkill = function(idx) {
      // Sword Heart pre-hook
      const swordHeartReady = LimitBreakSystem.state.swordHeartReady;
      if (swordHeartReady) {
        LimitBreakSystem.state.swordHeartReady = false;
        Player._forceCrit = true;
        Player._pierceDefense = true;
      }

      const result = _origUS(idx);

      // Clean up sword heart flags
      delete Player._forceCrit;
      delete Player._pierceDefense;

      if (result) {
        LimitBreakSystem.onSkillUsed(idx);
        const hitEnemies = Enemies.findInRange(
          this.x, this.y,
          ((SKILLS[idx] && SKILLS[idx].range) || 65) * 1.3
        ).map(function(h) { return h.enemy; }).filter(function(e) { return e.alive; });
        LimitBreakSystem.applyEffect(idx, hitEnemies);
      }

      return result;
    };
  },

  _wrapEnemiesKill() {
    const _origKill = Enemies.kill.bind(Enemies);
    Enemies.kill = function(enemy) {
      _origKill(enemy);
      SealedWeaponSystem.onKill(enemy);
    };
  },

  _wrapMapsTravelTo() {
    const _origTravel = Maps.travelTo.bind(Maps);
    Maps.travelTo = function(mapIndex) {
      const result = _origTravel(mapIndex);
      if (result) {
        SealedWeaponSystem.onMapChange();
      }
      return result;
    };
  },

  _wrapGameUpdate() {
    const _origUpdate = Game.update.bind(Game);
    Game.update = function(dt) {
      _origUpdate(dt);
      LimitBreakSystem.update(dt);
      SealedWeaponSystem.update(dt);
    };
  },

  _wrapRenderCharacter() {
    const _origRender = UI.renderCharacter.bind(UI);
    UI.renderCharacter = function() {
      _origRender();
      ProgressionDepthUI.renderCharacterSections();
    };
  },

  _wrapGameSaveLoad() {
    const _origSave = Game.save ? Game.save.bind(Game) : null;
    if (_origSave) {
      Game.save = function() {
        _origSave();
        try {
          const pdData = {
            limitBreak: LimitBreakSystem.getSaveData(),
            sealedWeapons: SealedWeaponSystem.getSaveData(),
            exteriorCultivation: ExteriorCultivation.getSaveData()
          };
          localStorage.setItem('tuxien_progression', JSON.stringify(pdData));
        } catch(e) {
          console.warn('PD save error:', e);
        }
      };
    }

    const _origLoad = Game.load ? Game.load.bind(Game) : null;
    if (_origLoad) {
      Game.load = function() {
        _origLoad();
        ProgressionDepthFeature._loadSaveData();
      };
    }
  },

  _loadSaveData() {
    try {
      const raw = localStorage.getItem('tuxien_progression');
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data.limitBreak) LimitBreakSystem.loadSaveData(data.limitBreak);
      if (data.sealedWeapons) SealedWeaponSystem.loadSaveData(data.sealedWeapons);
      if (data.exteriorCultivation) ExteriorCultivation.loadSaveData(data.exteriorCultivation);
    } catch(e) {
      console.warn('PD load error:', e);
    }
  },

  _applyLBGlows() {
    LimitBreakSystem.state.unlocked.forEach(function(unlocked, i) {
      if (unlocked) {
        const cfg = LIMIT_BREAK_CONFIG.skills[i];
        const btn = document.getElementById('skill' + i);
        if (btn) {
          btn.style.boxShadow = '0 0 20px ' + cfg.color + ', inset 0 0 20px rgba(0,0,0,0.5)';
        }
      }
    });
  },

  init() {
    this._injectStyles();
    this._loadSaveData();

    // Apply all wraps
    this._wrapRecalculateStats();
    this._wrapUseSkill();
    this._wrapEnemiesKill();
    this._wrapMapsTravelTo();
    this._wrapGameUpdate();
    this._wrapRenderCharacter();
    this._wrapGameSaveLoad();

    // Recalculate with loaded data
    Player.recalculateStats();

    // Restore LB glow after a short delay (UI ready)
    setTimeout(function() {
      ProgressionDepthFeature._applyLBGlows();
    }, 500);

    console.log('⚡ Progression Depth loaded (LB + Sealed + Exterior)');
  }
};

// Auto-init: wrap Game.init nếu chưa chạy, hoặc init trực tiếp
(function() {
  if (typeof Game !== 'undefined' && Game.init) {
    const _origGameInit = Game.init.bind(Game);
    Game.init = function() {
      _origGameInit();
      ProgressionDepthFeature.init();
    };
  } else {
    // Fallback: đợi DOM ready
    window.addEventListener('load', function() {
      ProgressionDepthFeature.init();
    });
  }
})();
