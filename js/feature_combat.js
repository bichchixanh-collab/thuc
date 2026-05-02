// ===== FILE: js/feature_combat.js =====
// ==================== COMBAT FEATURE SYSTEM ====================
// Passive Skills + Combo System + Elemental System

// ============================================================
// SECTION 1 — DATA & CONFIG
// ============================================================

// ---- 1A. Passive Skills Config ----
const PASSIVE_CONFIG = {
  passives: [
    {
      realm: 0,
      id: 'critica_base',
      name: 'Căn Cơ Kiên Cố',
      desc: '+5% tỷ lệ bạo kích',
      apply(player) { player._passiveCritRate = (player._passiveCritRate || 0) + 0.05; }
    },
    {
      realm: 1,
      id: 'mp_on_hit',
      name: 'Linh Khí Tuần Hoàn',
      desc: 'Hồi 3 MP mỗi lần đánh trúng'
      // Áp dụng qua hook Enemies.damage
    },
    {
      realm: 2,
      id: 'free_skill',
      name: 'Vô Tốn Thuật',
      desc: '10% chance skill không tốn MP'
      // Áp dụng qua hook Player.useSkill
    },
    {
      realm: 3,
      id: 'hp_on_kill',
      name: 'Hấp Tinh Đại Pháp',
      desc: 'Hồi 2% HP mỗi lần giết quái'
      // Áp dụng qua hook Enemies.kill
    },
    {
      realm: 4,
      id: 'speed_boost',
      name: 'Thần Tốc',
      desc: '+15% tốc độ di chuyển',
      apply(player) { player._passiveSpeedMul = (player._passiveSpeedMul || 1) * 1.15; }
    },
    {
      realm: 5,
      id: 'damage_reduction',
      name: 'Thiết Bì Đồng Cốt',
      desc: 'Giảm 15% damage nhận vào'
      // Áp dụng qua hook Player.takeDamage
    },
    {
      realm: 6,
      id: 'aoe_proc',
      name: 'Kiếm Khí Ngoại Phóng',
      desc: '20% chance AOE nhỏ khi đánh thường'
      // Áp dụng qua hook Enemies.damage + visual riêng
    },
    {
      realm: 7,
      id: 'death_immunity',
      name: 'Bất Diệt Kim Thân',
      desc: 'HP < 20%: miễn chết 1 lần (cd 5 phút)',
      cdDuration: 5 * 60 * 1000
    },
    {
      realm: 8,
      id: 'damage_amp',
      name: 'Vạn Pháp Quy Tông',
      desc: 'Tất cả damage +25%',
      apply(player) { player._passiveDmgAmp = (player._passiveDmgAmp || 1) * 1.25; }
    }
  ]
};

// ---- 1B. Combo System Config ----
const COMBO_CONFIG = {
  idleResetTime: 3000,
  tiers: [
    { count: 1,  damageMul: 1.00, color: '#ffffff', showCounter: false },
    { count: 5,  damageMul: 1.10, color: '#f0c040', showCounter: true,  visual: 'glow',  label: 'COMBO'        },
    { count: 10, damageMul: 1.25, color: '#ff9800', showCounter: true,  visual: 'shake', label: 'COMBO!'       },
    { count: 15, damageMul: 1.35, color: '#ff5722', showCounter: true,  visual: 'aura',  label: 'COMBO!!'      },
    { count: 20, damageMul: 1.50, color: '#f44336', showCounter: true,  visual: 'burst', label: 'MAX COMBO!!!', burstParticleCount: 20 },
    { count: 30, damageMul: 1.60, color: '#b71c1c', showCounter: true,  visual: 'burst', label: 'GOD COMBO!!!', burstParticleCount: 30 }
  ],
  idleVelocityThreshold: 0.1
};

// ---- 1C. Elemental System Config ----
const ELEMENT_CONFIG = {
  elements: {
    fire:    { name: 'Hỏa', icon: '🔥', color: '#ff4500' },
    ice:     { name: 'Băng', icon: '❄️', color: '#00bcd4' },
    thunder: { name: 'Lôi', icon: '⚡', color: '#ffeb3b' },
    wind:    { name: 'Phong', icon: '🌪️', color: '#69f0ae' },
    dark:    { name: 'Tối',  icon: '🌑', color: '#7b1fa2' },
    neutral: { name: 'Vô',   icon: '',   color: '#ffffff' }
  },
  counters: {
    fire:    'wind',
    ice:     'fire',
    thunder: 'ice',
    wind:    'thunder'
    // thunder cũng khắc dark — xử lý trong applyElementalModifier
  },
  resists: {
    fire:    'ice',
    ice:     'wind',
    thunder: 'fire',
    wind:    'ice',
    dark:    'wind'
  },
  damageBonusMultiplier:  1.50,
  damageResistMultiplier: 0.70,
  skillElements: {
    0: 'neutral',
    1: 'wind',
    2: 'thunder',
    3: 'neutral'
  },
  equipmentElements: {
    flameSword:     'fire',
    frostSword:     'ice',
    dragonArmor:    'fire',
    celestialSword: 'neutral',
    celestialRobe:  'neutral'
  },
  enemyElements: {
    wolf:           { element: 'wind',    weakness: 'fire',    resist: 'ice'     },
    boar:           { element: 'neutral', weakness: 'thunder', resist: null      },
    ghost:          { element: 'dark',    weakness: 'thunder', resist: 'wind'    },
    demon:          { element: 'dark',    weakness: 'thunder', resist: 'wind'    },
    rockGolem:      { element: 'fire',    weakness: 'ice',     resist: 'thunder' },
    fireSpirit:     { element: 'fire',    weakness: 'ice',     resist: 'fire'    },
    iceWolf:        { element: 'ice',     weakness: 'thunder', resist: 'fire'    },
    frostBear:      { element: 'ice',     weakness: 'thunder', resist: 'fire'    },
    darkDemon:      { element: 'dark',    weakness: 'thunder', resist: null      },
    shadowLord:     { element: 'dark',    weakness: 'thunder', resist: 'wind'    },
    celestialBeast: { element: 'neutral', weakness: null,      resist: null      },
    divineDragon:   { element: 'neutral', weakness: null,      resist: null      },
    wolfKing:       { element: 'wind',    weakness: 'fire',    resist: 'ice'     },
    demonLord:      { element: 'dark',    weakness: 'thunder', resist: 'wind'    },
    iceEmperor:     { element: 'ice',     weakness: 'thunder', resist: 'fire'    },
    celestialDragon:{ element: 'neutral', weakness: null,      resist: null      }
  }
};


// ============================================================
// SECTION 2 — LOGIC MODULES
// ============================================================

// ---- 2A. PassiveSystem ----
const PassiveSystem = {
  state: {
    deathImmunityLastUsed: 0,
    deathImmunityAvailable: true
  },

  getActivePassives() {
    return PASSIVE_CONFIG.passives.filter(p => p.realm <= Player.realm);
  },

  hasPassive(id) {
    const p = PASSIVE_CONFIG.passives.find(p => p.id === id);
    if (!p) return false;
    return Player.realm >= p.realm;
  },

  applyToStats() {
    // Reset passive fields
    Player._passiveCritRate = 0;
    Player._passiveSpeedMul = 1;
    Player._passiveDmgAmp   = 1;

    this.getActivePassives().forEach(p => {
      if (typeof p.apply === 'function') p.apply(Player);
    });

    // Apply to stats
    Player.critRate += Player._passiveCritRate;
    Player.speed    *= Player._passiveSpeedMul;
    // _passiveDmgAmp used in damage calc, not stat directly
  },

  triggerAoeProc(sourceEnemy) {
    const aoeRadius = 80;
    const aoeDamage = Math.floor(Player.atk * 0.6);
    const targets = Enemies.findInRange(
      sourceEnemy.x, sourceEnemy.y, aoeRadius,
      e => e.alive && e !== sourceEnemy
    );

    // Mark as aoe proc to avoid combo double-count
    Enemies.damage._fromAoeProc = true;
    targets.forEach(({ enemy }) => {
      Enemies.damage(enemy, aoeDamage, false, '#69f0ae');
    });
    Enemies.damage._fromAoeProc = false;

    CombatSystem._aoeProcs.push({
      x: sourceEnemy.x, y: sourceEnemy.y,
      radius: 0, maxRadius: aoeRadius,
      life: 400, maxLife: 400,
      color: '#69f0ae'
    });

    UI.addLog('⚔️ Kiếm Khí Ngoại Phóng!', 'item');
  },

  resetDeathImmunity() {
    if (PassiveSystem.state.deathImmunityAvailable) return;
    const cdDuration = PASSIVE_CONFIG.passives.find(p => p.id === 'death_immunity').cdDuration;
    if (GameState.time - PassiveSystem.state.deathImmunityLastUsed >= cdDuration) {
      PassiveSystem.state.deathImmunityAvailable = true;
      UI.addLog('🛡️ Bất Diệt Kim Thân sẵn sàng!', 'system');
    }
  },

  update(dt) {
    this.resetDeathImmunity();
  },

  // --- Hook: Player.recalculateStats ---
  _hookRecalculateStats() {
    const _orig = Player.recalculateStats.bind(Player);
    Player.recalculateStats = function() {
      _orig();
      PassiveSystem.applyToStats();
    };
  },

  // --- Hook: UI.renderCharacter (append passive list) ---
  _hookRenderCharacter() {
    const _orig = UI.renderCharacter.bind(UI);
    UI.renderCharacter = function() {
      _orig();
      const panel = document.getElementById('characterPanel');
      if (!panel) return;
      const charStats = panel.querySelector('#charStats');
      if (!charStats) return;

      // Remove old section
      const old = charStats.querySelector('.passive-section');
      if (old) old.remove();

      const activePassives = PassiveSystem.getActivePassives();
      if (activePassives.length === 0) return;

      const section = document.createElement('div');
      section.className = 'passive-section';
      section.style.cssText = 'margin-top:15px;padding-top:12px;border-top:1px solid #333';

      const title = document.createElement('div');
      title.style.cssText = 'color:#f0c040;font-size:12px;font-weight:bold;margin-bottom:8px';
      title.textContent = '✨ Kỹ Năng Thụ Động';
      section.appendChild(title);

      activePassives.forEach(p => {
        const row = document.createElement('div');
        row.style.cssText =
          'display:flex;justify-content:space-between;padding:4px 0;' +
          'border-bottom:1px solid #ffffff0a;font-size:10px';
        row.innerHTML =
          '<span style="color:#8ef">' + p.name + '</span>' +
          '<span style="color:#aaa">' + p.desc + '</span>';
        section.appendChild(row);
      });

      charStats.appendChild(section);
    };
  }
};


// ---- 2B. ComboSystem ----
const ComboSystem = {
  state: {
    count: 0,
    idleTimer: 0,
    lastTierIndex: -1,
    displayCount: 0,
    scaleAnim: 1.0,
    fadeAnim: 1.0
  },

  getCurrentTier() {
    const tiers = COMBO_CONFIG.tiers;
    let tier = tiers[0];
    for (const t of tiers) {
      if (ComboSystem.state.count >= t.count) tier = t;
    }
    return tier;
  },

  getDamageMultiplier() {
    return ComboSystem.getCurrentTier().damageMul;
  },

  onHit() {
    const state = ComboSystem.state;
    state.count++;
    state.idleTimer = 0;

    const tier = ComboSystem.getCurrentTier();
    const tierIdx = COMBO_CONFIG.tiers.indexOf(tier);

    state.scaleAnim = 1.4;
    state.fadeAnim  = 1.0;

    if (tierIdx > state.lastTierIndex) {
      state.lastTierIndex = tierIdx;

      if (tier.visual === 'burst') {
        const count = tier.burstParticleCount || 20;
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2;
          GameState.particles.push({
            x: Player.x + Math.cos(angle) * 15,
            y: Player.y + Math.sin(angle) * 15,
            vx: Math.cos(angle) * (2 + Math.random() * 3),
            vy: Math.sin(angle) * (2 + Math.random() * 3) - 1,
            life: 700, color: tier.color, size: 3 + Math.random() * 3
          });
        }
        CombatSystem._screenFlash = { life: 150, color: tier.color + '44' };
      }

      if (tier.visual === 'shake') {
        CombatSystem._screenShake = 200;
      }

      if (state.count >= 20) {
        Game.spawnDamageNumber(Player.x, Player.y - 50, 'COMBO x' + state.count + '!', tier.color);
      }

      if (tier.showCounter) {
        UI.addLog('🔥 ' + tier.label + ' x' + state.count, 'item');
      }
    }
  },

  onReset(reason) {
    const state = ComboSystem.state;
    const prevCount = state.count;

    if (prevCount >= 5) {
      state.fadeAnim = 1.0;
      CombatSystem._comboFadeOut = { count: prevCount, timer: 500 };
    }

    state.count         = 0;
    state.idleTimer     = 0;
    state.lastTierIndex = -1;
    state.scaleAnim     = 1.0;

    if (reason === 'hit' && prevCount >= 10) {
      UI.addLog('💢 Combo bị phá!', 'system');
    }
  },

  update(dt) {
    const state = ComboSystem.state;
    if (state.count > 0) {
      state.idleTimer += dt;
      if (state.idleTimer >= COMBO_CONFIG.idleResetTime) {
        ComboSystem.onReset('idle');
      }
    }
    if (state.scaleAnim > 1.0) {
      state.scaleAnim = Math.max(1.0, state.scaleAnim - dt * 0.003);
    }
  },

  render(ctx) {
    const state = ComboSystem.state;
    const tier  = ComboSystem.getCurrentTier();

    if (!tier.showCounter && state.count < 5) {
      if (CombatSystem._comboFadeOut) {
        const fo = CombatSystem._comboFadeOut;
        fo.timer -= 16;
        if (fo.timer <= 0) CombatSystem._comboFadeOut = null;
      }
      return;
    }

    const canvas = Game.canvas;
    const x = canvas.width - 30;
    const y = canvas.height - 170;

    ctx.save();
    ctx.textAlign = 'right';

    ctx.translate(x, y);
    ctx.scale(state.scaleAnim, state.scaleAnim);
    ctx.translate(-x, -y);

    // Large combo number
    ctx.font = 'bold 32px monospace';
    ctx.fillStyle = tier.color;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.strokeText(state.count.toString(), x, y);
    ctx.fillText(state.count.toString(), x, y);

    // Label below
    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = tier.color;
    ctx.globalAlpha = 0.8;
    ctx.fillText(tier.label || 'COMBO', x, y + 14);

    // Aura for high tiers
    if (tier.visual === 'aura' || tier.visual === 'burst') {
      ctx.globalAlpha = 0.15 + Math.sin(GameState.time / 150) * 0.1;
      ctx.fillStyle = tier.color;
      ctx.beginPath();
      ctx.arc(x - 20, y - 10, 30 * state.scaleAnim, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
};


// ---- 2C. ElementSystem ----
const ElementSystem = {
  _currentAttackElement: 'neutral',
  _pendingReaction: null,

  getSkillElement(skillIdx) {
    return ELEMENT_CONFIG.skillElements[skillIdx] || 'neutral';
  },

  getEquippedElement() {
    const weapon = Player.equipped.weapon;
    if (weapon && ELEMENT_CONFIG.equipmentElements[weapon]) {
      return ELEMENT_CONFIG.equipmentElements[weapon];
    }
    const armor = Player.equipped.armor;
    if (armor && ELEMENT_CONFIG.equipmentElements[armor]) {
      return ELEMENT_CONFIG.equipmentElements[armor];
    }
    return 'neutral';
  },

  getAttackElement(skillIdx) {
    const skillEl = ElementSystem.getSkillElement(skillIdx);
    if (skillEl !== 'neutral') return skillEl;
    return ElementSystem.getEquippedElement();
  },

  applyElementalModifier(damage, attackElement, enemy) {
    if (!attackElement || attackElement === 'neutral') return damage;

    const enemyData = ELEMENT_CONFIG.enemyElements[enemy.type];
    if (!enemyData) return damage;

    let mul = 1.0;
    let reaction = null;

    // Check explicit weakness
    if (enemyData.weakness === attackElement) {
      mul = ELEMENT_CONFIG.damageBonusMultiplier;
      reaction = 'counter';
    }
    // Check explicit resist
    else if (enemyData.resist === attackElement) {
      mul = ELEMENT_CONFIG.damageResistMultiplier;
      reaction = 'resist';
    }
    // Check counter table
    else {
      // Special: thunder counters dark too
      if (attackElement === 'thunder' && enemyData.element === 'dark') {
        mul = ELEMENT_CONFIG.damageBonusMultiplier;
        reaction = 'counter';
      } else {
        const countered = ELEMENT_CONFIG.counters[attackElement];
        if (countered && countered === enemyData.element) {
          mul = ELEMENT_CONFIG.damageBonusMultiplier;
          reaction = 'counter';
        }
      }
    }

    if (reaction === 'counter') {
      ElementSystem._pendingReaction = {
        type: 'counter', element: attackElement, enemy,
        color: ELEMENT_CONFIG.elements[attackElement].color
      };
    } else if (reaction === 'resist') {
      ElementSystem._pendingReaction = {
        type: 'resist', element: attackElement, enemy,
        color: '#888888'
      };
    }

    return Math.floor(damage * mul);
  },

  processPendingReaction() {
    if (!ElementSystem._pendingReaction) return;
    const r = ElementSystem._pendingReaction;
    ElementSystem._pendingReaction = null;

    const el = ELEMENT_CONFIG.elements[r.element];
    if (!el) return;

    if (r.type === 'counter') {
      for (let i = 0; i < 8; i++) {
        GameState.particles.push({
          x: r.enemy.x + (Math.random() - 0.5) * 20,
          y: r.enemy.y + (Math.random() - 0.5) * 20,
          vx: (Math.random() - 0.5) * 3,
          vy: -2 - Math.random() * 2,
          life: 500, color: el.color, size: 3 + Math.random() * 3
        });
      }
      Game.spawnDamageNumber(
        r.enemy.x, r.enemy.y - r.enemy.size - 25,
        el.icon + ' Yếu điểm!', el.color
      );
    }

    if (r.type === 'resist') {
      Game.spawnDamageNumber(
        r.enemy.x, r.enemy.y - r.enemy.size - 25,
        'Kháng ' + el.icon, '#888'
      );
    }
  },

  getEnemyElementIcon(enemy) {
    const data = ELEMENT_CONFIG.enemyElements[enemy.type];
    if (!data || !data.element || data.element === 'neutral') return '';
    return ELEMENT_CONFIG.elements[data.element]?.icon || '';
  },

  renderEnemyElementBadge(ctx, enemy) {
    const icon = ElementSystem.getEnemyElementIcon(enemy);
    if (!icon) return;
    const cx = enemy.x - GameState.camera.x;
    const cy = enemy.y - enemy.size - 24 - GameState.camera.y;
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(icon, cx - 22, cy + 9);
  },

  getItemElementText(itemId) {
    const el = ELEMENT_CONFIG.equipmentElements[itemId];
    if (!el || el === 'neutral') return '';
    const elData = ELEMENT_CONFIG.elements[el];
    return elData ? (elData.icon + ' ' + elData.name) : '';
  },

  // --- Hook: Game.renderEnemies ---
  _hookRenderEnemies() {
    const _orig = Game.renderEnemies.bind(Game);
    Game.renderEnemies = function() {
      _orig();
      const ctx = this.ctx;
      for (const enemy of Enemies.list) {
        if (!enemy.alive) continue;
        if (enemy.x < GameState.camera.x - 50 ||
            enemy.x > GameState.camera.x + this.canvas.width + 50) continue;
        ElementSystem.renderEnemyElementBadge(ctx, enemy);
      }
    };
  },

  // --- Hook: Inventory.showTooltip (add element info) ---
  _hookInventoryTooltip() {
    if (!window.Inventory || typeof Inventory.showTooltip !== 'function') return;
    const _orig = Inventory.showTooltip.bind(Inventory);
    Inventory.showTooltip = function(itemId, x, y) {
      _orig(itemId, x, y);
      const elText = ElementSystem.getItemElementText(itemId);
      if (elText) {
        const typeEl = document.getElementById('tooltipType');
        if (typeEl) typeEl.textContent += '  ' + elText;
      }
    };
  }
};


// ============================================================
// SECTION 3 — RENDER & VISUAL (CombatSystem)
// ============================================================

const CombatSystem = {
  _aoeProcs:      [],
  _screenFlash:   null,
  _screenShake:   0,
  _comboFadeOut:  null,

  update(dt) {
    PassiveSystem.update(dt);
    ComboSystem.update(dt);

    // Update AOE proc ring animations
    for (let i = CombatSystem._aoeProcs.length - 1; i >= 0; i--) {
      const p = CombatSystem._aoeProcs[i];
      p.life -= dt;
      p.radius = p.maxRadius * (1 - p.life / p.maxLife);
      if (p.life <= 0) CombatSystem._aoeProcs.splice(i, 1);
    }

    // Update screen flash
    if (CombatSystem._screenFlash) {
      CombatSystem._screenFlash.life -= dt;
      if (CombatSystem._screenFlash.life <= 0) CombatSystem._screenFlash = null;
    }

    // Update screen shake
    if (CombatSystem._screenShake > 0) {
      CombatSystem._screenShake -= dt;
      if (CombatSystem._screenShake <= 0) {
        CombatSystem._screenShake = 0;
        Game.canvas.style.transform = '';
      }
    }
  },

  // Called in world space (after camera translate)
  renderWorldSpace(ctx) {
    CombatSystem._aoeProcs.forEach(p => {
      const alpha = (p.life / p.maxLife) * 0.7;
      const cx = p.x - GameState.camera.x;
      const cy = p.y - GameState.camera.y;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, p.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });
  },

  // Called in screen space (after ctx.restore)
  renderScreenSpace(ctx) {
    // Screen shake via canvas transform
    if (CombatSystem._screenShake > 0) {
      const s = Math.min(5, CombatSystem._screenShake / 40);
      Game.canvas.style.transform =
        'translate(' + (Math.sin(GameState.time / 20) * s) + 'px, 0)';
    }

    // Screen flash overlay
    if (CombatSystem._screenFlash) {
      ctx.save();
      ctx.fillStyle = CombatSystem._screenFlash.color;
      ctx.globalAlpha = (CombatSystem._screenFlash.life / 150) * 0.5;
      ctx.fillRect(0, 0, Game.canvas.width, Game.canvas.height);
      ctx.restore();
    }

    // Combo counter (screen space)
    ComboSystem.render(ctx);
  }
};


// ============================================================
// SECTION 4 — HOOKS & INIT
// ============================================================

// ---- Unified Enemies.damage hook ----
function _hookEnemiesDamage() {
  const _origDmg = Enemies.damage.bind(Enemies);

  Enemies.damage = function(enemy, amount, isCrit, color) {
    if (!enemy || !enemy.alive) {
      _origDmg(enemy, amount, isCrit, color);
      return;
    }

    let finalAmount = amount;

    // 1. Combo damage multiplier (skip for AOE proc to avoid double-count)
    if (!Enemies.damage._fromAoeProc) {
      finalAmount = Math.floor(finalAmount * ComboSystem.getDamageMultiplier());
    }

    // 2. Elemental modifier
    finalAmount = ElementSystem.applyElementalModifier(
      finalAmount, ElementSystem._currentAttackElement, enemy
    );

    // 3. Passive damage amp (Tiên Nhân — realm 8)
    if (Player._passiveDmgAmp && Player._passiveDmgAmp > 1) {
      finalAmount = Math.floor(finalAmount * Player._passiveDmgAmp);
    }

    // 4. Call original with modified amount
    _origDmg(enemy, finalAmount, isCrit, color);

    // 5. Combo onHit (not from AOE proc)
    if (!Enemies.damage._fromAoeProc) {
      ComboSystem.onHit();
    }

    // 6. MP on hit passive (Trúc Cơ Kỳ)
    if (PassiveSystem.hasPassive('mp_on_hit')) {
      Player.mp = Math.min(Player.maxMp, Player.mp + 3);
    }

    // 7. AOE proc passive (Đại Thừa Kỳ) — only from basic attack
    if (Enemies.damage._fromBasicAttack &&
        !Enemies.damage._fromAoeProc &&
        PassiveSystem.hasPassive('aoe_proc')) {
      if (Utils.chance(0.20)) {
        PassiveSystem.triggerAoeProc(enemy);
      }
    }
  };

  // Flags initialised to false
  Enemies.damage._fromBasicAttack = false;
  Enemies.damage._fromAoeProc     = false;
}

// ---- Enemies.kill hook ----
function _hookEnemiesKill() {
  const _origKill = Enemies.kill.bind(Enemies);

  Enemies.kill = function(enemy) {
    _origKill(enemy);
    if (PassiveSystem.hasPassive('hp_on_kill')) {
      const heal = Math.floor(Player.maxHp * 0.02);
      Player.hp = Math.min(Player.maxHp, Player.hp + heal);
      Game.spawnDamageNumber(Player.x, Player.y - 30, '+' + heal + ' HP', '#44ff44');
    }
  };
}

// ---- Player.takeDamage hook ----
function _hookPlayerTakeDamage() {
  const _origTakeDmg = Player.takeDamage.bind(Player);

  Player.takeDamage = function(amount, source) {
    if (!this.alive || this.invincible) return;

    // Combo reset on getting hit
    if (ComboSystem.state.count > 0) {
      ComboSystem.onReset('hit');
    }

    // Damage reduction passive (Luyện Hư Kỳ)
    if (PassiveSystem.hasPassive('damage_reduction')) {
      amount = Math.floor(amount * 0.85);
    }

    // Death immunity passive (Độ Kiếp Kỳ)
    if (PassiveSystem.hasPassive('death_immunity')) {
      const hpAfter = this.hp - Math.max(1, amount - this.def);
      if (hpAfter <= 0 && this.hp > 0) {
        const cdDuration = PASSIVE_CONFIG.passives.find(p => p.id === 'death_immunity').cdDuration;
        const cdElapsed  = GameState.time - PassiveSystem.state.deathImmunityLastUsed;
        if (PassiveSystem.state.deathImmunityAvailable || cdElapsed >= cdDuration) {
          // Block fatal damage — set HP to 1
          this.hp = 1;
          PassiveSystem.state.deathImmunityLastUsed = GameState.time;
          PassiveSystem.state.deathImmunityAvailable = false;

          // Shield burst particles
          for (let i = 0; i < 15; i++) {
            const angle = (i / 15) * Math.PI * 2;
            GameState.particles.push({
              x: this.x + Math.cos(angle) * 20,
              y: this.y + Math.sin(angle) * 20,
              vx: Math.cos(angle) * 3,
              vy: Math.sin(angle) * 3 - 1,
              life: 600, color: '#ffd700', size: 4
            });
          }

          UI.showNotification('🛡️ Bất Diệt Kim Thân!', 'Miễn tử vong!');
          UI.addLog('🛡️ Bất Diệt Kim Thân kích hoạt!', 'realm');
          return; // Skip original — death blocked
        }
      }
    }

    _origTakeDmg(amount, source);
  };
}

// ---- Player.useSkill hook (element set + free skill) ----
function _hookPlayerUseSkill() {
  const _origUseSkill = Player.useSkill.bind(Player);

  // Shared cleanup after any skill use path
  function _resetAttackState() {
    ElementSystem.processPendingReaction();
    ElementSystem._currentAttackElement = 'neutral';
    Enemies.damage._fromBasicAttack = false;
  }

  Player.useSkill = function(idx) {
    // Set basic attack flag for AOE proc detection
    Enemies.damage._fromBasicAttack = (idx === 0);

    // Set current elemental attack BEFORE calling original
    ElementSystem._currentAttackElement = ElementSystem.getAttackElement(idx);

    // Free skill passive (Kim Đan Kỳ — realm 2)
    if (PassiveSystem.hasPassive('free_skill') && Utils.chance(0.10)) {
      const skill = this.skills && this.skills[idx];
      if (skill && skill.mp > 0) {
        const savedMp = this.mp;
        this.mp = Math.max(this.mp, skill.mp); // Ensure enough MP temporarily
        const result = _origUseSkill(idx);
        if (result) {
          this.mp = savedMp; // Refund MP
          Game.spawnDamageNumber(this.x, this.y - 40, 'FREE!', '#8ef');
        } else {
          this.mp = savedMp; // Restore if failed anyway
        }
        _resetAttackState();
        return result;
      }
    }

    const result = _origUseSkill(idx);
    _resetAttackState();
    return result;
  };
}

// ---- Game.update hook ----
function _hookGameUpdate() {
  const _origUpdate = Game.update.bind(Game);
  Game.update = function(dt) {
    _origUpdate(dt);
    if (GameState.running) {
      CombatSystem.update(dt);
    }
  };
}

// ---- Game.render hook (screen-space renders) ----
function _hookGameRender() {
  const _origRender = Game.render.bind(Game);
  Game.render = function() {
    _origRender();
    CombatSystem.renderScreenSpace(this.ctx);
  };
}

// ---- Game.renderParticles hook (world-space renders) ----
function _hookGameRenderParticles() {
  const _origRenderParticles = Game.renderParticles.bind(Game);
  Game.renderParticles = function() {
    _origRenderParticles();
    CombatSystem.renderWorldSpace(this.ctx);
  };
}

// ---- Game.init hook ----
function _hookGameInit() {
  const _origInit = Game.init.bind(Game);
  Game.init = function() {
    _origInit();
    CombatFeatureSystem.init();
  };
}

// ---- CSS injection ----
function _injectCSS() {
  if (document.getElementById('combat-feature-style')) return;
  const style = document.createElement('style');
  style.id = 'combat-feature-style';
  style.textContent = `
    .passive-section {
      margin-top: 15px;
      padding-top: 12px;
      border-top: 1px solid #333;
      font-family: 'Courier New', monospace;
    }
    .passive-section div {
      transition: background 0.1s;
    }
    .passive-section div:hover {
      background: rgba(255,255,255,0.04);
      border-radius: 3px;
    }
  `;
  document.head.appendChild(style);
}


// ============================================================
// MASTER INIT
// ============================================================

const CombatFeatureSystem = {
  init() {
    _injectCSS();

    // Register all hooks in correct order
    PassiveSystem._hookRecalculateStats();
    _hookEnemiesDamage();
    _hookEnemiesKill();
    _hookPlayerTakeDamage();
    _hookPlayerUseSkill();
    ElementSystem._hookRenderEnemies();
    PassiveSystem._hookRenderCharacter();
    ElementSystem._hookInventoryTooltip();

    // Recalculate stats immediately so passives take effect
    Player.recalculateStats();
  }
};

// Hook into Game lifecycle BEFORE DOMContentLoaded fires Game.init
_hookGameUpdate();
_hookGameRender();
_hookGameRenderParticles();
_hookGameInit();
// ===== CHANGES: Xóa 2 console.log. Xóa comment usage ở đầu file. Trích xuất 3 dòng cleanup lặp lại trong _hookPlayerUseSkill thành helper nội bộ _resetAttackState() — loại bỏ duplicate code mà không đổi tên hàm public nào. Xóa comment "optional: draw faded counter" thừa trong ComboSystem.render. =====
