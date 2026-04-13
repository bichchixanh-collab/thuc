
// ============================================================
//  BLOCK A — DATA & CONFIG MỚI
// ============================================================

const PET_EVOLUTION_CONFIG = {
  dog: {
    evolvedId:      'dog_evolved',
    evolvedName:    'Thần Khuyển',
    materials:      [{ id: 'dragonScale', count: 1 }, { id: 'wolfFang', count: 5 }],
    goldCost:       500,
    evolvedBonusMul: 2.0,
    sizeBonus:      5
  },
  cat: {
    evolvedId:      'cat_evolved',
    evolvedName:    'Linh Miêu Vương',
    materials:      [{ id: 'spiritStone', count: 2 }, { id: 'demonCore', count: 2 }],
    goldCost:       500,
    evolvedBonusMul: 2.0,
    sizeBonus:      4
  },
  bird: {
    evolvedId:      'bird_evolved',
    evolvedName:    'Phượng Hoàng',
    materials:      [{ id: 'celestialOrb', count: 1 }, { id: 'spiritStone', count: 3 }],
    goldCost:       800,
    evolvedBonusMul: 2.0,
    sizeBonus:      5
  }
};

const PET_COMBAT_CONFIG = {
  dog: {
    skills: [
      {
        name: 'Cắn',
        unlockLevel: 3,
        cd: 3000,
        type: 'bite',
        dmgPct: 0.20,
        range: 80,
        color: '#c4a484',
        particleCount: 5
      },
      {
        name: 'Hú Cắn',
        unlockLevel: 7,
        cd: 6000,
        type: 'aoe_bite',
        dmgPct: 0.15,
        range: 100,
        aoeRadius: 60,
        color: '#8b7355',
        particleCount: 8
      },
      {
        name: 'Tru Hú',
        unlockLevel: 10,
        requireEvolved: true,
        cd: 15000,
        type: 'stun_bite',
        dmgPct: 0.50,
        range: 90,
        stunDuration: 1200,
        color: '#f0c040',
        particleCount: 12
      }
    ]
  },
  cat: {
    skills: [
      {
        name: 'Phản Đòn Thụ Động',
        unlockLevel: 3,
        type: 'parry_passive',
        parryChance: 0.30,
        damageMul: 0.50,
        color: '#ffa500'
      },
      {
        name: 'Phản Kích',
        unlockLevel: 7,
        cd: 8000,
        type: 'counter_attack',
        dmgPct: 0.40,
        range: 60,
        color: '#ff9800',
        particleCount: 8
      },
      {
        name: 'Tàng Hình',
        unlockLevel: 10,
        requireEvolved: true,
        cd: 30000,
        type: 'player_shield',
        shieldDuration: 2000,
        color: '#e040fb',
        particleCount: 15
      }
    ]
  },
  bird: {
    skills: [
      {
        name: 'Tốc Phong',
        unlockLevel: 3,
        cd: 10000,
        type: 'speed_buff',
        speedMul: 1.20,
        duration: 3000,
        color: '#87ceeb',
        particleCount: 6
      },
      {
        name: 'Trinh Sát',
        unlockLevel: 7,
        cd: 12000,
        type: 'scout',
        scoutRadius: 300,
        duration: 5000,
        color: '#4682b4',
        particleCount: 4
      },
      {
        name: 'Lửa Phượng',
        unlockLevel: 10,
        requireEvolved: true,
        cd: 20000,
        type: 'phoenix_fire',
        dmgPct: 0.80,
        range: 200,
        aoeRadius: 150,
        color: '#ff4500',
        particleCount: 25
      }
    ]
  }
};

// ============================================================
//  BLOCK B — LOGIC THÊM VÀO PetLevelSystem
// ============================================================

// ── Patch _defaultData để bao gồm evolved & skillCooldowns ─
PetLevelSystem._defaultData = function () {
  return { level: 1, exp: 0, rareBonus: null, evolved: false, skillCooldowns: {} };
};

// ── Patch init để migrate petData hiện có ──────────────────
(function () {
  const _origInit = PetLevelSystem.init;
  PetLevelSystem.init = function () {
    _origInit.call(this);
    // Migration: thêm evolved & skillCooldowns nếu thiếu
    for (const petId in PETS) {
      if (!Player.petData[petId]) continue;
      if (Player.petData[petId].evolved === undefined)       Player.petData[petId].evolved = false;
      if (Player.petData[petId].skillCooldowns === undefined) Player.petData[petId].skillCooldowns = {};
    }
  };
})();

// ── Patch getBonusForPet để áp evolvedBonusMul ─────────────
PetLevelSystem.getBonusForPet = function (petId) {
  if (!petId || !PETS[petId]) return { atk: 0, def: 0, speed: 0 };

  const base  = PETS[petId].bonus;
  const data  = Player.petData && Player.petData[petId];
  const level = data ? data.level : 1;
  const mul   = 1 + (level - 1) * PET_LEVEL_CONFIG.bonusPerLevel;

  // Evolved multiplier (áp trước rareBonus)
  const isEvolved = data && data.evolved && PET_EVOLUTION_CONFIG[petId];
  const evolveMul = isEvolved ? PET_EVOLUTION_CONFIG[petId].evolvedBonusMul : 1.0;

  const bonus = {
    atk:   Math.round((base.atk   || 0) * mul * evolveMul),
    def:   Math.round((base.def   || 0) * mul * evolveMul),
    speed: parseFloat(((base.speed || 0) * mul * evolveMul).toFixed(3))
  };

  // Cộng rareBonus nếu có
  if (data && data.rareBonus) {
    const rb = data.rareBonus;
    if (rb.id === 'critRate') bonus.critRate = rb.value;
    if (rb.id === 'expRate')  bonus.expRate  = rb.value;
    if (rb.id === 'goldRate') bonus.goldRate = rb.value;
    if (rb.id === 'hpRegen')  bonus.hpRegen  = rb.value;
    if (rb.id === 'mpRegen')  bonus.mpRegen  = rb.value;
  }

  return bonus;
};

// ── B1. Evolution System ────────────────────────────────────

PetLevelSystem.canEvolve = function (petId) {
  const cfg = PET_EVOLUTION_CONFIG[petId];
  if (!cfg) return { canEvolve: false, missingMaterials: [], missingGold: 0 };

  const data = Player.petData && Player.petData[petId];
  if (!data) return { canEvolve: false, missingMaterials: [], missingGold: 0 };

  if (data.level < PET_LEVEL_CONFIG.maxLevel) return { canEvolve: false, missingMaterials: [], missingGold: 0 };
  if (data.evolved) return { canEvolve: false, missingMaterials: [], missingGold: 0 };

  const missingMaterials = [];
  for (const mat of cfg.materials) {
    if (!Inventory.has(mat.id, mat.count)) {
      missingMaterials.push({ id: mat.id, count: mat.count, have: Inventory.getCount(mat.id) });
    }
  }

  const missingGold = Math.max(0, cfg.goldCost - Player.gold);

  return {
    canEvolve: missingMaterials.length === 0 && missingGold === 0,
    missingMaterials: missingMaterials,
    missingGold: missingGold
  };
};

PetLevelSystem.evolvePet = function (petId) {
  const result = this.canEvolve(petId);
  if (!result.canEvolve) {
    if (result.missingMaterials.length > 0) {
      UI.addLog('❌ Thiếu nguyên liệu để tiến hóa!', 'system');
    }
    if (result.missingGold > 0) {
      UI.addLog('❌ Không đủ vàng! Cần thêm ' + result.missingGold + ' vàng.', 'system');
    }
    return false;
  }

  const cfg = PET_EVOLUTION_CONFIG[petId];

  // Trừ nguyên liệu
  for (const mat of cfg.materials) {
    Inventory.remove(mat.id, mat.count);
  }
  // Trừ vàng
  Player.gold -= cfg.goldCost;
  UI.updateGold();

  // Set evolved
  Player.petData[petId].evolved = true;
  // Init skill cooldowns cho skills mới unlock
  PetLevelSystem._initSkillCooldowns(petId);

  Player.recalculateStats();

  // Spawn 30 particles tại pet position
  const glowColor = PETS[petId] ? PETS[petId].color : '#f0c040';
  for (let i = 0; i < 30; i++) {
    const angle = (i / 30) * Math.PI * 2;
    const spd   = 1.5 + Math.random() * 2;
    GameState.particles.push({
      x:    Player.pet.x + (Math.random() - 0.5) * 20,
      y:    Player.pet.y + (Math.random() - 0.5) * 20,
      vx:   Math.cos(angle) * spd,
      vy:   Math.sin(angle) * spd - 1,
      life: 1200,
      color: glowColor,
      size:  3 + Math.random() * 4
    });
  }

  UI.showNotification('⬆ Tiến Hóa!', cfg.evolvedName + ' thức tỉnh!');
  UI.addLog('✨ ' + PETS[petId].name + ' tiến hóa thành ' + cfg.evolvedName + '!', 'realm');

  Inventory.render();
  PetEvolutionUI.refreshShopUI();

  return true;
};

// ── B3. Combat Skill System ─────────────────────────────────

PetLevelSystem._getActiveSkills = function (petId) {
  const combatCfg = PET_COMBAT_CONFIG[petId];
  if (!combatCfg) return [];

  const data = Player.petData && Player.petData[petId];
  if (!data) return [];

  return combatCfg.skills.filter(function (skill) {
    if (skill.unlockLevel > data.level) return false;
    if (skill.requireEvolved && !data.evolved)  return false;
    return true;
  });
};

PetLevelSystem._initSkillCooldowns = function (petId) {
  const data = Player.petData && Player.petData[petId];
  if (!data) return;
  if (!data.skillCooldowns) data.skillCooldowns = {};

  const skills = this._getActiveSkills(petId);
  for (const skill of skills) {
    if (data.skillCooldowns[skill.name] === undefined) {
      data.skillCooldowns[skill.name] = 0;
    }
  }
};

PetLevelSystem.updateCombatSkills = function (dt) {
  if (!Player.alive || !Player.activePet || !Player.petData) return;

  const petId = Player.activePet;
  const data  = Player.petData[petId];
  if (!data) return;
  if (!data.skillCooldowns) data.skillCooldowns = {};

  const activeSkills = this._getActiveSkills(petId);

  // Giảm tất cả cooldowns
  for (const skillName in data.skillCooldowns) {
    if (data.skillCooldowns[skillName] > 0) {
      data.skillCooldowns[skillName] = Math.max(0, data.skillCooldowns[skillName] - dt);
    }
  }

  // Kích hoạt skills
  for (const skill of activeSkills) {
    if (skill.type === 'parry_passive') continue;

    const cd = data.skillCooldowns[skill.name] || 0;
    if (cd > 0) continue;

    let shouldActivate = false;

    switch (skill.type) {
      case 'bite':
      case 'stun_bite': {
        shouldActivate = !!Enemies.findNearest(Player.x, Player.y, skill.range, function (e) { return e.alive; });
        break;
      }
      case 'aoe_bite': {
        const nearby = Enemies.findInRange(Player.x, Player.y, skill.aoeRadius);
        shouldActivate = nearby.length >= 2;
        break;
      }
      case 'counter_attack': {
        shouldActivate = !!PetLevelSystem._justParried;
        PetLevelSystem._justParried = false;
        break;
      }
      case 'player_shield': {
        shouldActivate = (Player.hp / Player.maxHp) < 0.30;
        break;
      }
      case 'speed_buff': {
        shouldActivate = !!Enemies.findNearest(Player.x, Player.y, 200, function (e) { return e.alive && e.aggroed; });
        break;
      }
      case 'scout': {
        shouldActivate = true;
        break;
      }
      case 'phoenix_fire': {
        const enemies = Enemies.findInRange(Player.x, Player.y, skill.range);
        shouldActivate = enemies.length >= 3;
        break;
      }
    }

    if (shouldActivate) {
      this._castSkill(petId, skill);
    }
  }
};

PetLevelSystem._castSkill = function (petId, skill) {
  // Set cooldown
  Player.petData[petId].skillCooldowns[skill.name] = skill.cd;

  switch (skill.type) {

    case 'bite': {
      const target = Enemies.findNearest(Player.x, Player.y, skill.range, function (e) { return e.alive; });
      if (!target) return;
      const damage = Math.floor(Player.atk * skill.dmgPct);
      Enemies.damage(target, damage, false, skill.color);
      spawnPetSkillParticles(Player.pet.x, Player.pet.y, target.x, target.y, skill);
      UI.addLog('🐶 Thần Khuyển cắn ' + target.name + '! -' + damage, 'item');
      break;
    }

    case 'aoe_bite': {
      const targets = Enemies.findInRange(Player.x, Player.y, skill.aoeRadius);
      let count = 0;
      for (const entry of targets) {
        const damage = Math.floor(Player.atk * skill.dmgPct);
        Enemies.damage(entry.enemy, damage, false, skill.color);
        count++;
      }
      spawnAoeParticles(Player.pet.x, Player.pet.y, skill.aoeRadius, skill);
      UI.addLog('🐶 Hú Cắn! x' + count + ' kẻ địch', 'item');
      break;
    }

    case 'stun_bite': {
      const target = Enemies.findNearest(Player.x, Player.y, skill.range, function (e) { return e.alive; });
      if (!target) return;
      const damage = Math.floor(Player.atk * skill.dmgPct);
      Enemies.damage(target, damage, true, skill.color);
      target._stunTimer = skill.stunDuration;
      target._stunned   = true;
      spawnPetSkillParticles(Player.pet.x, Player.pet.y, target.x, target.y, skill);
      UI.showNotification('🐾 Tru Hú!', target.name + ' bị choáng ' + (skill.stunDuration / 1000) + 's');
      break;
    }

    case 'counter_attack': {
      const target = Enemies.findNearest(Player.pet.x, Player.pet.y, skill.range, function (e) { return e.alive; });
      if (!target) return;
      const damage = Math.floor(Player.atk * skill.dmgPct);
      Enemies.damage(target, damage, false, skill.color);
      spawnPetSkillParticles(Player.pet.x, Player.pet.y, target.x, target.y, skill);
      break;
    }

    case 'player_shield': {
      PetLevelSystem._shieldActive  = true;
      PetLevelSystem._shieldEndTime = GameState.time + skill.shieldDuration;
      spawnAoeParticles(Player.x, Player.y, 40, skill);
      UI.addLog('🐱 Tàng Hình! Miễn damage ' + (skill.shieldDuration / 1000) + 's!', 'item');
      UI.showNotification('🐾 Tàng Hình!', 'Miễn sát thương ' + (skill.shieldDuration / 1000) + ' giây');
      break;
    }

    case 'speed_buff': {
      PetLevelSystem._speedBuffActive  = true;
      PetLevelSystem._speedBuffEndTime = GameState.time + skill.duration;
      PetLevelSystem._speedBuffMul     = skill.speedMul;
      Player.speed = Player.speed * skill.speedMul;
      spawnAoeParticles(Player.x, Player.y, 30, skill);
      UI.addLog('🐦 Tốc Phong! +20% tốc độ ' + (skill.duration / 1000) + 's!', 'item');
      break;
    }

    case 'scout': {
      PetLevelSystem._scoutActive  = true;
      PetLevelSystem._scoutEndTime = GameState.time + skill.duration;
      PetLevelSystem._scoutRadius  = skill.scoutRadius;
      spawnAoeParticles(Player.x, Player.y, 50, skill);
      UI.addLog('🐦 Trinh Sát! Phát hiện kẻ địch trong ' + skill.scoutRadius + 'px!', 'item');
      break;
    }

    case 'phoenix_fire': {
      const all = Enemies.findInRange(Player.x, Player.y, skill.range)
        .filter(function (entry) {
          return Utils.dist(Player.x, Player.y, entry.enemy.x, entry.enemy.y) <= skill.aoeRadius;
        });
      for (const entry of all) {
        const damage = Math.floor(Player.atk * skill.dmgPct);
        Enemies.damage(entry.enemy, damage, true, skill.color);
      }
      for (let i = 0; i < skill.particleCount; i++) {
        const angle = (i / skill.particleCount) * Math.PI * 2;
        const dist  = 50 + Math.random() * 100;
        GameState.particles.push({
          x:    Player.pet.x + Math.cos(angle) * dist * 0.3,
          y:    Player.pet.y + Math.sin(angle) * dist * 0.3,
          vx:   Math.cos(angle) * 2.5,
          vy:   Math.sin(angle) * 2.5 - 1,
          life: 800,
          color: skill.color,
          size:  4 + Math.random() * 4
        });
      }
      UI.showNotification('🔥 Lửa Phượng!', 'Thiêu đốt ' + all.length + ' kẻ địch!');
      UI.addLog('🐦 Lửa Phượng! x' + all.length + ' mục tiêu!', 'item');
      break;
    }
  }
};

// ── Helper particles (scope ngoài PetLevelSystem) ──────────

function spawnPetSkillParticles(fromX, fromY, toX, toY, skill) {
  const count = skill.particleCount || 6;
  for (let i = 0; i < count; i++) {
    const t = i / count;
    GameState.particles.push({
      x:    fromX + (toX - fromX) * t + (Math.random() - 0.5) * 10,
      y:    fromY + (toY - fromY) * t + (Math.random() - 0.5) * 10,
      vx:   (Math.random() - 0.5) * 2,
      vy:   (Math.random() - 0.5) * 2 - 0.5,
      life: 400,
      color: skill.color,
      size:  2 + Math.random() * 3
    });
  }
}

function spawnAoeParticles(cx, cy, radius, skill) {
  const count = skill.particleCount || 8;
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r     = radius * (0.5 + Math.random() * 0.5);
    GameState.particles.push({
      x:    cx + Math.cos(angle) * r,
      y:    cy + Math.sin(angle) * r,
      vx:   Math.cos(angle) * 1.5,
      vy:   Math.sin(angle) * 1.5 - 1,
      life: 500,
      color: skill.color,
      size:  3 + Math.random() * 3
    });
  }
}

// ── B4. Stun Update ─────────────────────────────────────────

PetLevelSystem.updateStuns = function (dt) {
  for (const enemy of Enemies.list) {
    if (enemy._stunned && enemy._stunTimer !== undefined) {
      enemy._stunTimer -= dt;
      if (enemy._stunTimer <= 0) {
        enemy._stunned = false;
        delete enemy._stunTimer;
      } else {
        enemy.attackTimer = 9999;
      }
    }
  }
};

// ── B5. Buff Expiry Update ──────────────────────────────────

PetLevelSystem.updateBuffs = function (dt) {
  // Shield expiry
  if (PetLevelSystem._shieldActive && GameState.time > PetLevelSystem._shieldEndTime) {
    PetLevelSystem._shieldActive = false;
  }

  // Speed buff expiry
  if (PetLevelSystem._speedBuffActive && GameState.time > PetLevelSystem._speedBuffEndTime) {
    PetLevelSystem._speedBuffActive = false;
    Player.recalculateStats();
  }

  // Scout expiry
  if (PetLevelSystem._scoutActive && GameState.time > PetLevelSystem._scoutEndTime) {
    PetLevelSystem._scoutActive = false;
  }
};

// ── B6. Parry Hook ──────────────────────────────────────────

PetLevelSystem._hookPlayerTakeDamage = function () {
  const _orig = Player.takeDamage.bind(Player);

  Player.takeDamage = function (amount, source) {
    // Shield từ Tàng Hình
    if (PetLevelSystem._shieldActive) {
      UI.addLog('🛡️ Tàng Hình hấp thụ sát thương!', 'system');
      return;
    }

    // Parry passive của Linh Miêu
    if (Player.activePet === 'cat' && Player.petData && Player.petData['cat']) {
      const activeSkills = PetLevelSystem._getActiveSkills('cat');
      const parrySkill   = activeSkills.find(function (s) { return s.type === 'parry_passive'; });

      if (parrySkill && Math.random() < parrySkill.parryChance) {
        amount = Math.floor(amount * parrySkill.damageMul);
        PetLevelSystem._justParried = true;
        UI.addLog('🐱 Linh Miêu phản đòn!', 'item');
        spawnAoeParticles(Player.x, Player.y - 20, 25, { color: parrySkill.color, particleCount: 6 });
      }
    }

    _orig(amount, source);
  };
};

// ── B7. Evolved Sprites ─────────────────────────────────────

PetLevelSystem._getEvolvedSprite = function (petId, isMoving) {
  const sprites = {
    dog: {
      idle: [
        [0,         '#ffd700', '#ffd700', 0,         0,         '#ffd700', '#ffd700', 0        ],
        ['#8b0000', '#8b0000', '#8b0000', '#8b0000', '#8b0000', '#8b0000', '#8b0000', '#8b0000'],
        ['#8b0000', '#ff0000', '#8b0000', '#8b0000', '#8b0000', '#8b0000', '#ff0000', '#8b0000'],
        ['#8b0000', '#8b0000', '#8b0000', '#8b0000', '#8b0000', '#8b0000', '#8b0000', '#8b0000'],
        ['#5c0000', '#8b0000', '#8b0000', '#8b0000', '#8b0000', '#8b0000', '#8b0000', '#5c0000'],
        ['#5c0000', '#5c0000', '#ffd700', '#5c0000', '#5c0000', '#ffd700', '#5c0000', '#5c0000'],
        [0,         '#5c0000', '#5c0000', 0,         0,         '#5c0000', '#5c0000', 0        ],
        [0,         '#ffd700', 0,         0,         0,         0,         '#ffd700', 0        ]
      ],
      move: [
        [0,         '#ffd700', '#ffd700', 0,         0,         '#ffd700', '#ffd700', 0        ],
        ['#8b0000', '#8b0000', '#8b0000', '#8b0000', '#8b0000', '#8b0000', '#8b0000', '#8b0000'],
        ['#8b0000', '#ff0000', '#8b0000', '#8b0000', '#8b0000', '#8b0000', '#ff0000', '#8b0000'],
        ['#8b0000', '#8b0000', '#8b0000', '#8b0000', '#8b0000', '#8b0000', '#8b0000', '#8b0000'],
        ['#5c0000', '#8b0000', '#8b0000', '#8b0000', '#8b0000', '#8b0000', '#8b0000', '#5c0000'],
        ['#5c0000', '#5c0000', '#ffd700', '#5c0000', '#5c0000', '#ffd700', '#5c0000', '#5c0000'],
        ['#5c0000', 0,         '#5c0000', 0,         0,         '#5c0000', 0,         '#5c0000'],
        [0,         0,         '#ffd700', 0,         0,         '#ffd700', 0,         0        ]
      ]
    },
    cat: {
      idle: [
        [0,         '#9c27b0', '#9c27b0', 0,         0,         '#9c27b0', '#9c27b0', 0        ],
        ['#9c27b0', '#ce93d8', '#9c27b0', '#9c27b0', '#9c27b0', '#9c27b0', '#ce93d8', '#9c27b0'],
        ['#9c27b0', '#ff9800', '#9c27b0', '#9c27b0', '#9c27b0', '#9c27b0', '#ff9800', '#9c27b0'],
        ['#9c27b0', '#9c27b0', '#9c27b0', '#ce93d8', '#ce93d8', '#9c27b0', '#9c27b0', '#9c27b0'],
        ['#7b1fa2', '#9c27b0', '#9c27b0', '#9c27b0', '#9c27b0', '#9c27b0', '#9c27b0', '#7b1fa2'],
        [0,         '#7b1fa2', '#ff9800', '#7b1fa2', '#7b1fa2', '#ff9800', '#7b1fa2', 0        ],
        [0,         '#7b1fa2', 0,         '#7b1fa2', '#7b1fa2', 0,         '#7b1fa2', 0        ],
        [0,         0,         0,         '#ff9800', 0,         0,         0,         0        ]
      ],
      move: [
        ['#9c27b0', 0,         0,         '#9c27b0', '#9c27b0', 0,         0,         '#9c27b0'],
        ['#9c27b0', '#ce93d8', '#9c27b0', '#9c27b0', '#9c27b0', '#9c27b0', '#ce93d8', '#9c27b0'],
        ['#9c27b0', '#ff9800', '#9c27b0', '#9c27b0', '#9c27b0', '#9c27b0', '#ff9800', '#9c27b0'],
        ['#9c27b0', '#9c27b0', '#9c27b0', '#ce93d8', '#ce93d8', '#9c27b0', '#9c27b0', '#9c27b0'],
        ['#7b1fa2', '#9c27b0', '#9c27b0', '#9c27b0', '#9c27b0', '#9c27b0', '#9c27b0', '#7b1fa2'],
        [0,         '#7b1fa2', '#ff9800', '#7b1fa2', '#7b1fa2', '#ff9800', '#7b1fa2', 0        ],
        ['#7b1fa2', 0,         '#7b1fa2', 0,         0,         '#7b1fa2', 0,         '#7b1fa2'],
        [0,         '#ff9800', 0,         0,         0,         0,         '#ff9800', 0        ]
      ]
    },
    bird: {
      idle: [
        [0,         '#ffd700', '#ff4500', '#ff4500', '#ff4500', '#ff4500', '#ffd700', 0        ],
        ['#ffd700', '#ff4500', '#ff69b4', '#ff4500', '#ff4500', '#ff69b4', '#ff4500', '#ffd700'],
        ['#ff4500', '#ff4500', '#ff4500', '#ffd700', '#ffd700', '#ff4500', '#ff4500', '#ff4500'],
        ['#cc3700', '#ff4500', '#ff4500', '#ff4500', '#ff4500', '#ff4500', '#ff4500', '#cc3700'],
        [0,         '#cc3700', '#ff4500', '#ffd700', '#ffd700', '#ff4500', '#cc3700', 0        ],
        [0,         0,         '#ffd700', '#cc3700', '#cc3700', '#ffd700', 0,         0        ],
        [0,         0,         '#cc3700', 0,         0,         '#cc3700', 0,         0        ],
        [0,         0,         '#ffd700', 0,         0,         '#ffd700', 0,         0        ]
      ],
      move: [
        ['#ffd700', 0,         '#ff4500', '#ff4500', '#ff4500', '#ff4500', 0,         '#ffd700'],
        ['#ff4500', '#ff4500', '#ff69b4', '#ff4500', '#ff4500', '#ff69b4', '#ff4500', '#ff4500'],
        ['#ffd700', '#ff4500', '#ff4500', '#ffd700', '#ffd700', '#ff4500', '#ff4500', '#ffd700'],
        [0,         '#cc3700', '#ff4500', '#ff4500', '#ff4500', '#ff4500', '#cc3700', 0        ],
        [0,         0,         '#cc3700', '#ffd700', '#ffd700', '#cc3700', 0,         0        ],
        [0,         0,         '#ffd700', '#cc3700', '#cc3700', '#ffd700', 0,         0        ],
        [0,         0,         '#cc3700', 0,         0,         '#cc3700', 0,         0        ],
        [0,         0,         0,         0,         0,         0,         0,         0        ]
      ]
    }
  };

  const petSprites = sprites[petId];
  if (!petSprites) return null;
  return isMoving ? petSprites.move : petSprites.idle;
};

PetLevelSystem._hookRenderPet = function () {
  const _origRenderPet = Game.renderPet.bind(Game);

  Game.renderPet = function () {
    if (!Player.activePet || !Player.alive) return;

    const petId   = Player.activePet;
    const data    = Player.petData && Player.petData[petId];
    const isEvolved = data && data.evolved;

    if (!isEvolved) {
      _origRenderPet();
      return;
    }

    const ctx   = this.ctx;
    const pet   = Player.pet;
    const isMoving = Utils.dist(pet.x, pet.y, pet.targetX, pet.targetY) > 3;
    const bob   = petId === 'bird'
      ? Math.sin(GameState.time / 150) * 5
      : Math.sin(GameState.time / 300) * 2;

    const evolvedConfig = PET_EVOLUTION_CONFIG[petId];
    const scale         = 2;
    const pixelSize     = scale + (evolvedConfig ? Math.floor(evolvedConfig.sizeBonus / 8) : 0);
    const spriteW       = 8 * pixelSize;
    const halfSize      = spriteW / 2;

    const screenX = pet.x - GameState.camera.x;
    const screenY = pet.y - GameState.camera.y;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(screenX, screenY + halfSize, halfSize * 0.8, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Glow aura
    const glowColor = petId === 'dog'  ? 'rgba(255,215,0,0.3)'
                    : petId === 'cat'  ? 'rgba(156,39,176,0.3)'
                    : 'rgba(255,69,0,0.3)';
    ctx.globalAlpha = 0.4 + Math.sin(GameState.time / 300) * 0.2;
    ctx.fillStyle   = glowColor;
    ctx.beginPath();
    ctx.arc(screenX, screenY + bob, halfSize + 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Draw evolved sprite
    const sprite = PetLevelSystem._getEvolvedSprite(petId, isMoving);
    if (sprite) {
      ctx.save();
      const flipX = Player.dir === 'right';
      if (flipX) {
        ctx.translate(screenX + halfSize, screenY + bob - halfSize);
        ctx.scale(-1, 1);
        ctx.translate(-halfSize, 0);
      } else {
        ctx.translate(screenX - halfSize, screenY + bob - halfSize);
      }
      for (let py = 0; py < sprite.length; py++) {
        for (let px = 0; px < sprite[py].length; px++) {
          const color = sprite[py][px];
          if (color && color !== 0) {
            ctx.fillStyle = color;
            ctx.fillRect(px * pixelSize, py * pixelSize, pixelSize, pixelSize);
          }
        }
      }
      ctx.restore();
    }

    // Particle trail
    if (Utils.chance(0.03)) {
      const trailColor = petId === 'dog'  ? '#ffd700'
                       : petId === 'cat'  ? '#ce93d8'
                       : '#ff4500';
      GameState.particles.push({
        x:    pet.x + (Math.random() - 0.5) * 12,
        y:    pet.y + bob + (Math.random() - 0.5) * 12,
        vx:   (Math.random() - 0.5) * 1,
        vy:   -1 - Math.random(),
        life: 500,
        color: trailColor,
        size:  2 + Math.random() * 3
      });
    }
  };
};

// ── B8. Hook Game.update cho combat skills ─────────────────

PetLevelSystem._hookGameUpdateCombat = function () {
  const _origGameUpdateForCombat = Game.update.bind(Game);

  Game.update = function (dt) {
    _origGameUpdateForCombat(dt);
    if (GameState.running && Player.activePet) {
      PetLevelSystem.updateCombatSkills(dt);
      PetLevelSystem.updateStuns(dt);
      PetLevelSystem.updateBuffs(dt);
    }
  };
};

// ── B9. Save/Load patch cho evolved & skillCooldowns ────────

(function () {
  const _origGetSave2 = Player.getSaveData.bind(Player);
  Player.getSaveData = function () {
    const data = _origGetSave2();
    if (data.petData) {
      for (const petId in PETS) {
        if (Player.petData && Player.petData[petId] && data.petData[petId]) {
          data.petData[petId].evolved = Player.petData[petId].evolved || false;
          // skillCooldowns không lưu — reset khi load là ổn
        }
      }
    }
    return data;
  };
})();

(function () {
  const _origLoadSave2 = Player.loadSaveData.bind(Player);
  Player.loadSaveData = function (data) {
    _origLoadSave2(data);
    if (data && data.petData) {
      for (const petId in PETS) {
        if (Player.petData[petId] && data.petData[petId]) {
          Player.petData[petId].evolved        = data.petData[petId].evolved || false;
          Player.petData[petId].skillCooldowns = {};
        }
      }
    }
  };
})();

// ============================================================
//  BLOCK C — UI EVOLUTION & ĐĂNG KÝ HOOKS MỚI
// ============================================================

const PetEvolutionUI = {

  buildEvolveButton(petId, container) {
    const cfg = PET_EVOLUTION_CONFIG[petId];
    if (!cfg) return;

    const data = Player.petData && Player.petData[petId];
    if (!data) return;
    if (data.level < PET_LEVEL_CONFIG.maxLevel) return;
    if (data.evolved) return;

    const result = PetLevelSystem.canEvolve(petId);
    const canEvolve = result.canEvolve;

    const btn = document.createElement('div');
    btn.style.cssText = [
      'margin-top:6px',
      'border:1px solid #ff9800',
      'border-radius:6px',
      'padding:6px 10px',
      'cursor:' + (canEvolve ? 'pointer' : 'default'),
      'font-family:inherit',
      'background:' + (canEvolve ? 'rgba(255,152,0,0.15)' : 'rgba(100,100,100,0.1)'),
      'color:' + (canEvolve ? '#ff9800' : '#666')
    ].join(';');

    // Tên tiến hóa
    const line1 = document.createElement('div');
    line1.style.cssText = 'font-size:10px;font-weight:bold;margin-bottom:4px;';
    line1.textContent = '⬆ Tiến Hóa → ' + cfg.evolvedName;
    btn.appendChild(line1);

    // Nguyên liệu
    for (const mat of cfg.materials) {
      const itemData = ITEMS[mat.id];
      const have     = Inventory.getCount(mat.id);
      const enough   = have >= mat.count;
      const matLine  = document.createElement('div');
      matLine.style.cssText = 'font-size:9px;color:' + (enough ? '#4caf50' : '#f44336') + ';';
      matLine.textContent   = (itemData ? itemData.name : mat.id) + ' x' + mat.count + ' (' + have + '/' + mat.count + ')';
      btn.appendChild(matLine);
    }

    // Vàng
    const goldEnough = Player.gold >= cfg.goldCost;
    const goldLine   = document.createElement('div');
    goldLine.style.cssText = 'font-size:9px;color:' + (goldEnough ? '#f0c040' : '#f44336') + ';';
    goldLine.textContent   = '💰 ' + cfg.goldCost + ' vàng (có: ' + Player.gold + ')';
    btn.appendChild(goldLine);

    // Cảnh báo thiếu
    if (!canEvolve) {
      const warn = document.createElement('div');
      warn.style.cssText = 'font-size:9px;color:#f44336;margin-top:3px;';
      const parts = [];
      for (const m of result.missingMaterials) {
        const it = ITEMS[m.id];
        parts.push((it ? it.name : m.id) + ' x' + (m.count - m.have));
      }
      if (result.missingGold > 0) parts.push(result.missingGold + ' vàng');
      warn.textContent = '⚠ Thiếu: ' + parts.join(', ');
      btn.appendChild(warn);
    }

    if (canEvolve) {
      btn.addEventListener('click', function () {
        if (PetLevelSystem.evolvePet(petId)) {
          if (NPC.currentDialog) NPC.interact(NPC.currentDialog);
        }
      });
    }

    container.appendChild(btn);
  },

  refreshShopUI() {
    if (NPC.currentDialog) {
      NPC.interact(NPC.currentDialog);
    }
  }
};

// ── Patch buildPetsShop lần 2 để thêm nút tiến hóa ─────────

(function () {
  const _origBuildPets2 = NPC.buildPetsShop.bind(NPC);

  NPC.buildPetsShop = function (container) {
    _origBuildPets2(container);

    if (!Player.petData) return;

    for (const petId in PETS) {
      if (!Player.ownedPets.includes(petId)) continue;
      if (!PET_EVOLUTION_CONFIG[petId]) continue;

      const data = Player.petData[petId];
      if (!data || data.evolved) continue;
      if (data.level < PET_LEVEL_CONFIG.maxLevel) continue;

      const petName = PETS[petId].name;
      const options = container.querySelectorAll('.npc-option');
      for (const opt of options) {
        if (opt.textContent.includes(petName)) {
          const oldBtn = opt.querySelector('.pet-evolve-btn');
          if (oldBtn) oldBtn.remove();

          const btnWrap = document.createElement('div');
          btnWrap.className = 'pet-evolve-btn';
          PetEvolutionUI.buildEvolveButton(petId, btnWrap);
          opt.appendChild(btnWrap);
          break;
        }
      }
    }
  };
})();

// ── CSS bổ sung ─────────────────────────────────────────────

(function () {
  if (document.getElementById('pls-evolution-style')) return;
  const style = document.createElement('style');
  style.id = 'pls-evolution-style';
  style.textContent = `
.pet-skill-indicator {
  position: absolute;
  font-size: 8px;
  color: #f0c040;
  pointer-events: none;
  animation: floatDmg 0.8s forwards;
}
  `;
  document.head.appendChild(style);
})();

// ── Patch _defaultData (đảm bảo luôn có evolved & skillCooldowns) ─
PetLevelSystem._defaultData = function () {
  return { level: 1, exp: 0, rareBonus: null, evolved: false, skillCooldowns: {} };
};

// ── Đăng ký hooks mới ───────────────────────────────────────
PetLevelSystem._hookPlayerTakeDamage();
PetLevelSystem._hookRenderPet();
PetLevelSystem._hookGameUpdateCombat();

// ── Init flags ──────────────────────────────────────────────
PetLevelSystem._justParried       = false;
PetLevelSystem._shieldActive      = false;
PetLevelSystem._shieldEndTime     = 0;
PetLevelSystem._speedBuffActive   = false;
PetLevelSystem._speedBuffEndTime  = 0;
PetLevelSystem._speedBuffMul      = 1;
PetLevelSystem._scoutActive       = false;
PetLevelSystem._scoutEndTime      = 0;
PetLevelSystem._scoutRadius       = 0;

console.log('🐾 Pet Evolution & Combat System loaded');
