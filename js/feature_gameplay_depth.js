// ==================== FEATURE: GAMEPLAY DEPTH ====================
// Sections: SkillEvolution | DynamicEcosystem | SideCharacters | SetItems
// Load after all other feature files in index.html

// ================================================================
// SECTION 1 — SKILL EVOLUTION SYSTEM
// ================================================================

const SKILL_EVOLUTION_CONFIG = {
  rerollItemId: 'huahuaDan',

  unlockRequirements: [
    { skillIdx: 0, uses: 100, realm: 0, name: 'Cơ Bản Kiếm Pháp' },
    { skillIdx: 1, uses: 80,  realm: 1, name: 'Kiếm Phong Trảm'  },
    { skillIdx: 2, uses: 50,  realm: 2, name: 'Lôi Điện Thuật'   },
    { skillIdx: 3, uses: 30,  realm: 4, name: 'Vạn Kiếm Quy Tông'}
  ],

  evolutions: {
    0: {
      A: {
        id: 'kiemVu', name: 'Kiếm Vũ', color: '#42a5f5',
        desc: '3 đòn nhỏ nhanh liên tiếp',
        cd: 600, dmgMul: 0.40, hitCount: 3, mp: 0, range: 55, type: 'melee',
        bonusEffect: 'comboStack',
        icon: [
          [0,'#42a5f5',0,'#42a5f5',0,'#42a5f5',0,0],
          ['#42a5f5','#90caf9','#42a5f5','#90caf9','#42a5f5','#90caf9','#42a5f5',0],
          [0,'#42a5f5',0,'#42a5f5',0,'#42a5f5',0,0],
          [0,0,0,0,0,0,0,0],
          [0,'#1565c0',0,'#1565c0',0,'#1565c0',0,0],
          ['#1565c0','#42a5f5','#1565c0','#42a5f5','#1565c0','#42a5f5','#1565c0',0],
          [0,'#1565c0',0,'#1565c0',0,'#1565c0',0,0],
          [0,0,0,0,0,0,0,0]
        ]
      },
      B: {
        id: 'trongKiem', name: 'Trọng Kiếm', color: '#ff6f00',
        desc: '1 đòn nặng, knockback, damage cao',
        cd: 1200, dmgMul: 1.80, hitCount: 1, mp: 0, range: 80, type: 'melee',
        bonusEffect: 'knockback',
        icon: [
          [0,0,'#ff6f00','#ff6f00','#ff6f00',0,0,0],
          [0,'#ff6f00','#ffcc02','#ffcc02','#ffcc02','#ff6f00',0,0],
          ['#ff6f00','#ffcc02','#ffffff','#ffffff','#ffcc02','#ff6f00',0,0],
          ['#ff6f00','#ffcc02','#ffffff','#ffffff','#ffcc02','#ff6f00',0,0],
          [0,'#ff6f00','#ffcc02','#ffcc02','#ffcc02','#ff6f00',0,0],
          [0,0,'#ff6f00','#ff6f00','#ff6f00',0,0,0],
          [0,0,0,'#8b4513','#8b4513',0,0,0],
          [0,0,0,'#8b4513',0,0,0,0]
        ]
      }
    },
    1: {
      A: {
        id: 'baoKiem', name: 'Bão Kiếm', color: '#42a5f5',
        desc: '5 projectile nhỏ tỏa ra, hit nhiều enemy',
        cd: 3500, dmgMul: 0.50, hitCount: 5, mp: 10, range: 150, type: 'projectile',
        spreadAngle: 0.6,
        bonusEffect: 'multiHit',
        icon: [
          ['#42a5f5',0,'#42a5f5',0,'#42a5f5',0,'#42a5f5',0],
          [0,'#90caf9',0,'#90caf9',0,'#90caf9',0,'#42a5f5'],
          ['#42a5f5',0,'#1565c0','#1565c0','#1565c0',0,'#42a5f5',0],
          [0,'#90caf9','#1565c0','#42a5f5','#1565c0','#90caf9',0,0],
          ['#42a5f5',0,'#1565c0','#1565c0','#1565c0',0,'#42a5f5',0],
          [0,'#90caf9',0,'#90caf9',0,'#90caf9',0,'#42a5f5'],
          ['#42a5f5',0,'#42a5f5',0,'#42a5f5',0,'#42a5f5',0],
          [0,0,0,0,0,0,0,0]
        ]
      },
      B: {
        id: 'tuyenKiem', name: 'Tuyến Kiếm', color: '#ff6f00',
        desc: '1 projectile to xuyên tất cả enemy trên đường',
        cd: 4000, dmgMul: 2.20, hitCount: 1, mp: 12, range: 250, type: 'projectile',
        pierceAll: true,
        defIgnorePct: 0.20,
        bonusEffect: 'pierce',
        icon: [
          [0,0,0,'#ff6f00','#ff6f00',0,0,0],
          [0,0,'#ff6f00','#ffcc02','#ffcc02','#ff6f00',0,0],
          [0,'#ff6f00','#ffcc02','#ffffff','#ffffff','#ffcc02','#ff6f00',0],
          ['#ff6f00','#ffcc02','#ffffff','#ff6f00','#ff6f00','#ffffff','#ffcc02','#ff6f00'],
          ['#ff6f00','#ffcc02','#ffffff','#ff6f00','#ff6f00','#ffffff','#ffcc02','#ff6f00'],
          [0,'#ff6f00','#ffcc02','#ffffff','#ffffff','#ffcc02','#ff6f00',0],
          [0,0,'#ff6f00','#ffcc02','#ffcc02','#ff6f00',0,0],
          [0,0,0,'#ff6f00','#ff6f00',0,0,0]
        ]
      }
    },
    2: {
      A: {
        id: 'lienLoi', name: 'Liên Lôi', color: '#42a5f5',
        desc: '4 tia lôi liên tiếp, giảm DEF target',
        cd: 4000, dmgMul: 0.80, hitCount: 4, mp: 20, range: 160, type: 'aoe',
        hitInterval: 200,
        defReducePerHit: 0.10,
        bonusEffect: 'defDebuff',
        icon: [
          ['#ffeb3b',0,0,'#ffeb3b',0,0,'#ffeb3b',0],
          [0,'#ffeb3b',0,0,'#ffeb3b',0,0,'#ffeb3b'],
          ['#ffeb3b',0,'#fff176','#fff176',0,'#ffeb3b',0,0],
          [0,0,'#fff176','#ffeb3b','#fff176',0,0,0],
          [0,0,'#fff176','#ffeb3b','#fff176',0,0,0],
          ['#ffeb3b',0,'#fff176','#fff176',0,'#ffeb3b',0,0],
          [0,'#ffeb3b',0,0,'#ffeb3b',0,0,'#ffeb3b'],
          ['#ffeb3b',0,0,'#ffeb3b',0,0,'#ffeb3b',0]
        ]
      },
      B: {
        id: 'thienLoi', name: 'Thiên Lôi', color: '#ff6f00',
        desc: '1 tia lôi cực mạnh, stun target',
        cd: 7000, dmgMul: 4.00, hitCount: 1, mp: 30, range: 160, type: 'aoe',
        stunDuration: 1500,
        bonusEffect: 'stun',
        icon: [
          [0,0,0,'#ff6f00',0,0,0,0],
          [0,0,'#ff6f00','#ffcc02','#ff6f00',0,0,0],
          [0,'#ff6f00','#ffcc02','#ffffff','#ffcc02','#ff6f00',0,0],
          ['#ff6f00','#ffcc02','#ffffff','#ffcc02','#ffffff','#ffcc02','#ff6f00',0],
          [0,'#ff6f00','#ffcc02','#ffffff','#ffcc02','#ff6f00',0,0],
          [0,0,'#ff6f00','#ffcc02','#ff6f00',0,0,0],
          [0,0,0,'#ff6f00',0,0,0,0],
          [0,0,0,0,0,0,0,0]
        ]
      }
    },
    3: {
      A: {
        id: 'tranKiem', name: 'Trận Kiếm', color: '#42a5f5',
        desc: '8 kiếm nhỏ xoay quanh Player 5s, tự tấn công',
        cd: 12000, dmgMul: 0.60, hitCount: 8, mp: 35, range: 100, type: 'ultimate',
        orbitDuration: 5000,
        orbitRadius: 60,
        attackInterval: 600,
        bonusEffect: 'orbit',
        icon: [
          ['#42a5f5',0,'#42a5f5',0,'#42a5f5',0,'#42a5f5',0],
          [0,'#90caf9',0,'#90caf9',0,'#90caf9',0,'#90caf9'],
          ['#42a5f5',0,'#1565c0','#1565c0','#1565c0',0,'#42a5f5',0],
          [0,'#90caf9','#1565c0','#ffffff','#1565c0','#90caf9',0,0],
          ['#42a5f5',0,'#1565c0','#1565c0','#1565c0',0,'#42a5f5',0],
          [0,'#90caf9',0,'#90caf9',0,'#90caf9',0,'#90caf9'],
          ['#42a5f5',0,'#42a5f5',0,'#42a5f5',0,'#42a5f5',0],
          [0,0,0,0,0,0,0,0]
        ]
      },
      B: {
        id: 'nhatKiem', name: 'Nhất Kiếm', color: '#ff6f00',
        desc: 'Charge 1s rồi 1 đòn hủy diệt, screen flash',
        cd: 15000, dmgMul: 12.00, hitCount: 1, mp: 45, range: 120, type: 'ultimate',
        chargeTime: 1000,
        bonusEffect: 'charge',
        icon: [
          [0,0,0,0,0,0,0,0],
          [0,0,'#ff6f00',0,0,'#ff6f00',0,0],
          [0,'#ff6f00','#ffcc02','#ff6f00','#ff6f00','#ffcc02','#ff6f00',0],
          ['#ff6f00','#ffcc02','#ffffff','#ffcc02','#ffcc02','#ffffff','#ffcc02','#ff6f00'],
          ['#ff6f00','#ffcc02','#ffffff','#ffcc02','#ffcc02','#ffffff','#ffcc02','#ff6f00'],
          [0,'#ff6f00','#ffcc02','#ff6f00','#ff6f00','#ffcc02','#ff6f00',0],
          [0,0,'#ff6f00',0,0,'#ff6f00',0,0],
          [0,0,0,0,0,0,0,0]
        ]
      }
    }
  },

  huahuaDanItem: {
    id: 'huahuaDan', name: 'Hóa Hóa Đan', type: 'consumable',
    rarity: 'epic',
    desc: 'Reset evolution choice cho 1 skill. Progress (use count) không mất.',
    effect: { resetEvolution: true }, sellPrice: 500
  }
};

// ---- EvolutionChoicePanel ----
const EvolutionChoicePanel = {
  show(skillIdx) {
    GameState.running = false;
    const evos = SKILL_EVOLUTION_CONFIG.evolutions[skillIdx];
    const req = SKILL_EVOLUTION_CONFIG.unlockRequirements.find(r => r.skillIdx === skillIdx);
    document.getElementById('evoSkillName').textContent = req.name;

    ['A', 'B'].forEach(choice => {
      const evo = evos[choice];
      const canvas = document.getElementById('evoIcon' + choice);
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, 24, 24);
        if (typeof Sprites !== 'undefined') Sprites.drawPixelArt(ctx, evo.icon, 3, 0, 0);
      }
      const nameEl = document.getElementById('evoName' + choice);
      const descEl = document.getElementById('evoDesc' + choice);
      const cardEl = document.getElementById('evoCard' + choice);
      if (nameEl) nameEl.textContent = evo.name;
      if (descEl) descEl.textContent = evo.desc;
      if (cardEl) {
        cardEl.onclick = () => {
          SkillEvolutionSystem.chooseEvolution(skillIdx, choice);
          GameState.running = true;
        };
      }
    });

    const panel = document.getElementById('evolutionPanel');
    if (panel) panel.style.display = 'block';
  },
  hide() {
    const panel = document.getElementById('evolutionPanel');
    if (panel) panel.style.display = 'none';
  }
};

// ---- SkillEvolutionChoiceUI (reset picker) ----
const SkillEvolutionChoiceUI = {
  showResetPicker() {
    const container = document.createElement('div');
    container.id = 'evoResetPicker';
    container.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);' +
      'background:linear-gradient(135deg,#1a1a2e,#16213e);border:3px solid #e040fb;' +
      'border-radius:15px;padding:20px;z-index:300;text-align:center;min-width:260px;' +
      'box-shadow:0 0 30px rgba(224,64,251,0.4)';
    container.innerHTML = '<div style="color:#e040fb;font-size:14px;font-weight:bold;margin-bottom:12px">' +
      '🔄 Chọn kỹ năng muốn reset tiến hóa</div>';

    SKILL_EVOLUTION_CONFIG.unlockRequirements.forEach(req => {
      const chosen = SkillEvolutionSystem.state.chosen[req.skillIdx];
      const btn = document.createElement('div');
      btn.className = 'npc-option';
      if (!chosen) btn.classList.add('disabled');
      const evoName = chosen ? SKILL_EVOLUTION_CONFIG.evolutions[req.skillIdx][chosen].name : 'Chưa tiến hóa';
      btn.innerHTML = '<span>' + req.name + '</span>' +
        '<span style="color:' + (chosen ? '#e040fb' : '#555') + '">' + evoName + '</span>';
      if (chosen) {
        btn.addEventListener('click', () => {
          SkillEvolutionSystem.state.chosen[req.skillIdx] = null;
          document.body.removeChild(container);
          EvolutionChoicePanel.show(req.skillIdx);
          if (typeof UI !== 'undefined') UI.addLog('🔄 Đã reset tiến hóa ' + req.name, 'item');
        });
      }
      container.appendChild(btn);
    });

    const closeBtn = document.createElement('div');
    closeBtn.className = 'npc-option';
    closeBtn.innerHTML = '<span>✖ Đóng</span>';
    closeBtn.addEventListener('click', () => document.body.removeChild(container));
    container.appendChild(closeBtn);
    document.body.appendChild(container);
  }
};

// ---- SkillEvolutionSystem ----
const SkillEvolutionSystem = {
  state: {
    useCounts: [0, 0, 0, 0],
    chosen:    [null, null, null, null],
    unlocked:  [false, false, false, false],
    pendingChoice: null,
    orbitSwords: [],
    orbitActive: false,
    orbitEndTime: 0,
    chargeActive: false,
    chargeEndTime: 0,
    chargeSkillIdx: -1,
    lienLoiPending: [],
    stunnedEnemies: [],
    knockbackTargets: []
  },

  checkUnlock(skillIdx) {
    const state = this.state;
    const req = SKILL_EVOLUTION_CONFIG.unlockRequirements.find(r => r.skillIdx === skillIdx);
    if (!req) return;
    if (state.useCounts[skillIdx] >= req.uses && Player.realm >= req.realm && !state.unlocked[skillIdx]) {
      state.unlocked[skillIdx] = true;
      state.pendingChoice = skillIdx;
      EvolutionChoicePanel.show(skillIdx);
      if (typeof UI !== 'undefined') UI.addLog('⚡ ' + req.name + ' có thể tiến hóa!', 'realm');
    }
  },

  chooseEvolution(skillIdx, choice) {
    const state = this.state;
    state.chosen[skillIdx] = choice;
    EvolutionChoicePanel.hide();
    state.pendingChoice = null;
    const evo = SKILL_EVOLUTION_CONFIG.evolutions[skillIdx][choice];
    const btn = document.getElementById('skill' + skillIdx);
    if (btn) {
      btn.style.borderColor = evo.color;
      btn.style.boxShadow = '0 0 20px ' + evo.color;
    }
    this.updateSkillIcon(skillIdx, choice);
    if (typeof UI !== 'undefined') {
      UI.showNotification('⚡ ' + evo.name + '!', 'Kỹ năng đã tiến hóa!');
      UI.addLog('⚡ Tiến hóa: ' + evo.name, 'realm');
    }
  },

  updateSkillIcon(skillIdx, choice) {
    const canvas = document.getElementById('skillIcon' + skillIdx);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 24, 24);
    const evo = SKILL_EVOLUTION_CONFIG.evolutions[skillIdx][choice];
    if (typeof Sprites !== 'undefined') Sprites.drawPixelArt(ctx, evo.icon, 3, 0, 0);
  },

  getActiveEvo(skillIdx) {
    const choice = this.state.chosen[skillIdx];
    if (!choice) return null;
    return SKILL_EVOLUTION_CONFIG.evolutions[skillIdx][choice];
  },

  executeEvolvedSkill(skillIdx) {
    const evo = this.getActiveEvo(skillIdx);
    if (!evo) return false;
    const state = this.state;

    switch (evo.id) {
      case 'kiemVu': {
        let hitsLeft = 3;
        const doHit = () => {
          if (!Player.alive || hitsLeft <= 0) return;
          const target = Enemies.findNearest(Player.x, Player.y, evo.range, e => e.alive);
          if (target) {
            const dmg = Math.floor(Player.atk * evo.dmgMul);
            Enemies.damage(target, dmg, Utils.chance(Player.critRate), evo.color);
            if (typeof ComboSystem !== 'undefined') ComboSystem.onHit && ComboSystem.onHit();
          }
          hitsLeft--;
          if (hitsLeft > 0) setTimeout(doHit, 150);
        };
        doHit();
        break;
      }

      case 'trongKiem': {
        const target0 = Enemies.findNearest(Player.x, Player.y, evo.range, e => e.alive);
        if (target0) {
          const dmg = Math.floor(Player.atk * evo.dmgMul);
          const isCrit = Utils.chance(Player.critRate);
          Enemies.damage(target0, dmg, isCrit, evo.color);
          const angle0 = Utils.angle(Player.x, Player.y, target0.x, target0.y);
          state.knockbackTargets.push({ enemy: target0, vx: Math.cos(angle0) * 5, vy: Math.sin(angle0) * 5, timer: 300 });
          for (let i = 0; i < 8; i++) {
            const a = Math.random() * Math.PI * 2;
            GameState.particles.push({ x: target0.x, y: target0.y, vx: Math.cos(a)*4, vy: Math.sin(a)*4-2, life: 500, color: evo.color, size: 4+Math.random()*4 });
          }
        }
        break;
      }

      case 'baoKiem': {
        const spreadTotal = evo.spreadAngle;
        for (let i = 0; i < 5; i++) {
          const baseAngle = Player.dir === 'right' ? 0 : Player.dir === 'left' ? Math.PI : Player.dir === 'up' ? -Math.PI/2 : Math.PI/2;
          const angle1 = baseAngle + (i - 2) * (spreadTotal / 4);
          const nearby = Enemies.findInRange(Player.x, Player.y, evo.range).filter(({enemy}) => {
            const ea = Utils.angle(Player.x, Player.y, enemy.x, enemy.y);
            return Math.abs(ea - angle1) < 0.35;
          });
          if (nearby.length > 0) {
            const dmg = Math.floor(Player.atk * evo.dmgMul);
            Enemies.damage(nearby[0].enemy, dmg, false, evo.color);
          }
          for (let j = 0; j < 4; j++) {
            GameState.particles.push({ x: Player.x + Math.cos(angle1)*j*20, y: Player.y + Math.sin(angle1)*j*20, vx: Math.cos(angle1)*3, vy: Math.sin(angle1)*3, life: 300, color: evo.color, size: 2+Math.random()*2 });
          }
        }
        break;
      }

      case 'tuyenKiem': {
        const lineAngle = Player.dir === 'right' ? 0 : Player.dir === 'left' ? Math.PI : Player.dir === 'up' ? -Math.PI/2 : Math.PI/2;
        Enemies.list.forEach(e => {
          if (!e.alive) return;
          const ea = Utils.angle(Player.x, Player.y, e.x, e.y);
          const dist = Utils.dist(Player.x, Player.y, e.x, e.y);
          const angDiff = Math.abs(((ea - lineAngle) + Math.PI) % (2 * Math.PI) - Math.PI);
          if (angDiff < 0.25 && dist <= evo.range) {
            let dmg = Math.floor(Player.atk * evo.dmgMul);
            const defReduction = Math.floor((e.def || 0) * (evo.defIgnorePct || 0));
            dmg = Math.max(1, dmg - (e.def || 0) + defReduction);
            e.hp -= dmg;
            e.hitFlash = 150;
            Game.spawnDamageNumber(e.x, e.y - 20, dmg.toString(), evo.color);
            if (e.hp <= 0) Enemies.kill(e);
          }
        });
        for (let i = 0; i < 15; i++) {
          GameState.particles.push({ x: Player.x + Math.cos(lineAngle)*i*15, y: Player.y + Math.sin(lineAngle)*i*15, vx: Math.cos(lineAngle)*2, vy: Math.sin(lineAngle)*2, life: 400, color: evo.color, size: 4+Math.random()*2 });
        }
        break;
      }

      case 'lienLoi': {
        const lTarget = Enemies.findNearest(Player.x, Player.y, evo.range, e => e.alive);
        if (lTarget) {
          state.lienLoiPending.push({ enemy: lTarget, hitsRemaining: 4, nextHitTime: GameState.time, debuffCount: 0 });
        }
        break;
      }

      case 'thienLoi': {
        const tTarget = Enemies.findNearest(Player.x, Player.y, evo.range, e => e.alive);
        if (tTarget) {
          const dmg = Math.floor(Player.atk * evo.dmgMul);
          Enemies.damage(tTarget, dmg, true, evo.color);
          state.stunnedEnemies.push({ enemy: tTarget, unstunAt: GameState.time + evo.stunDuration, origAtk: tTarget.atk });
          tTarget.atk = 0;
          tTarget.aggroed = false;
          for (let i = 0; i < 20; i++) {
            GameState.particles.push({ x: tTarget.x+(Math.random()-0.5)*30, y: tTarget.y+(Math.random()-0.5)*30, vx:(Math.random()-0.5)*5, vy:-3-Math.random()*3, life:400, color:'#ffeb3b', size:2+Math.random()*3 });
          }
          if (typeof UI !== 'undefined') UI.showNotification('⚡ Thiên Lôi!', tTarget.name + ' bị choáng 1.5s');
        }
        break;
      }

      case 'tranKiem': {
        state.orbitSwords = Array.from({length: 8}, (_, i) => ({ angle: (i / 8) * Math.PI * 2, attackTimer: 0 }));
        state.orbitActive = true;
        state.orbitEndTime = GameState.time + evo.orbitDuration;
        if (typeof UI !== 'undefined') UI.addLog('⚔️ Trận Kiếm kích hoạt! 8 kiếm xoay quanh ngươi!', 'item');
        break;
      }

      case 'nhatKiem': {
        state.chargeActive = true;
        state.chargeEndTime = GameState.time + evo.chargeTime;
        state.chargeSkillIdx = skillIdx;
        if (typeof UI !== 'undefined') UI.addLog('⚔️ Nhất Kiếm đang tích tụ... (' + (evo.chargeTime/1000) + 's)', 'item');
        break;
      }
    }
    return true;
  },

  update(dt) {
    const state = this.state;

    // Lien Loi pending hits
    for (let i = state.lienLoiPending.length - 1; i >= 0; i--) {
      const ll = state.lienLoiPending[i];
      if (!ll.enemy.alive || ll.hitsRemaining <= 0) { state.lienLoiPending.splice(i, 1); continue; }
      if (GameState.time >= ll.nextHitTime) {
        const evo = this.getActiveEvo(2);
        if (evo) {
          const dmg = Math.floor(Player.atk * evo.dmgMul);
          Enemies.damage(ll.enemy, dmg, false, evo.color);
          ll.debuffCount++;
          ll.enemy._defDebuff = (ll.enemy._defDebuff || 0) + evo.defReducePerHit;
        }
        ll.hitsRemaining--;
        ll.nextHitTime = GameState.time + ((this.getActiveEvo(2) && this.getActiveEvo(2).hitInterval) || 200);
      }
    }

    // Stun expiry
    for (let i = state.stunnedEnemies.length - 1; i >= 0; i--) {
      const s = state.stunnedEnemies[i];
      if (GameState.time > s.unstunAt || !s.enemy.alive) {
        if (s.enemy.alive) { s.enemy.atk = s.origAtk; s.enemy.aggroed = true; }
        state.stunnedEnemies.splice(i, 1);
      }
    }

    // Knockback
    for (let i = state.knockbackTargets.length - 1; i >= 0; i--) {
      const k = state.knockbackTargets[i];
      if (k.enemy.alive) { k.enemy.x += k.vx; k.enemy.y += k.vy; }
      k.vx *= 0.85; k.vy *= 0.85;
      k.timer -= dt;
      if (k.timer <= 0) state.knockbackTargets.splice(i, 1);
    }

    // Orbit swords
    if (state.orbitActive) {
      if (GameState.time > state.orbitEndTime) {
        state.orbitActive = false;
        state.orbitSwords = [];
      } else {
        const evo = this.getActiveEvo(3);
        if (evo) {
          state.orbitSwords.forEach(s => {
            s.angle += 0.04;
            s.attackTimer -= dt;
            if (s.attackTimer <= 0) {
              s.attackTimer = evo.attackInterval;
              const sx = Player.x + Math.cos(s.angle) * evo.orbitRadius;
              const sy = Player.y + Math.sin(s.angle) * evo.orbitRadius;
              const t = Enemies.findNearest(sx, sy, 80, e => e.alive);
              if (t) { const dmg = Math.floor(Player.atk * evo.dmgMul); Enemies.damage(t, dmg, false, evo.color); }
            }
          });
        }
      }
    }

    // Charge completion
    if (state.chargeActive && GameState.time >= state.chargeEndTime) {
      state.chargeActive = false;
      const evo = this.getActiveEvo(3);
      if (evo) {
        const targets = Enemies.findInRange(Player.x, Player.y, evo.range);
        targets.forEach(({enemy}) => {
          const dmg = Math.floor(Player.atk * evo.dmgMul);
          Enemies.damage(enemy, dmg, true, '#ff6f00');
        });
        const flashEl = document.createElement('div');
        flashEl.style.cssText = 'position:fixed;inset:0;background:#fff;z-index:999;pointer-events:none';
        document.body.appendChild(flashEl);
        setTimeout(() => flashEl.remove(), 200);
        if (Game.canvas) {
          Game.canvas.style.transform = 'translate(5px,3px)';
          setTimeout(() => { if (Game.canvas) Game.canvas.style.transform = ''; }, 300);
        }
        if (typeof UI !== 'undefined') {
          UI.showNotification('⚔️ Nhất Kiếm!', '1 đòn hủy diệt!');
          UI.addLog('⚔️ Nhất Kiếm khai phóng! x' + targets.length + ' kẻ địch!', 'realm');
        }
      }
    }
  },

  render(ctx) {
    const state = this.state;
    // Orbit swords
    if (state.orbitActive) {
      const evo = this.getActiveEvo(3);
      const radius = (evo && evo.orbitRadius) || 60;
      state.orbitSwords.forEach(s => {
        const sx = Player.x + Math.cos(s.angle) * radius - GameState.camera.x;
        const sy = Player.y + Math.sin(s.angle) * radius - GameState.camera.y;
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(s.angle + Math.PI / 2);
        ctx.fillStyle = '#42a5f5';
        ctx.fillRect(-2, -6, 4, 12);
        ctx.fillStyle = '#90caf9';
        ctx.fillRect(-1, -7, 2, 4);
        ctx.restore();
      });
    }
    // Charge glow
    if (state.chargeActive) {
      const pct = Math.min(1, Math.max(0, (GameState.time - (state.chargeEndTime - 1000)) / 1000));
      const glow = pct * 30;
      const cx = Player.x - GameState.camera.x;
      const cy = Player.y - 10 - GameState.camera.y;
      ctx.globalAlpha = pct * 0.6;
      ctx.fillStyle = '#ff6f00';
      ctx.beginPath();
      ctx.arc(cx, cy, 20 + glow, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }
};

// ================================================================
// SECTION 2 — DYNAMIC ECOSYSTEM SYSTEM
// ================================================================

const ECOSYSTEM_CONFIG = {
  foodChains: {
    0: [['wolf', 'boar']],
    1: [['demon', 'ghost']],
    2: [['fireSpirit', 'rockGolem']],
    3: [['frostBear', 'iceWolf']],
    4: [['shadowLord', 'darkDemon']],
    5: [['divineDragon', 'celestialBeast']]
  },
  populationStart: 100,
  populationMax:   200,
  killDecrease:    2,
  regenPerTick:    1,
  regenInterval:   10000,
  overpopulate:  { threshold: 150, spawnMul: 2.0, dropMul: 1.30, expMul: 0.80 },
  normal:        { threshold: 100, spawnMul: 1.0, dropMul: 1.00, expMul: 1.00 },
  underpopulate: { threshold: 30,  spawnMul: 0.5, dropMul: 0.70, expMul: 1.50 },
  nearExtinct:   { threshold: 10,  spawnMul: 0.1, dropMul: 1.00, expMul: 2.00 }
};

const EcosystemSystem = {
  state: {
    populations: {},
    lastRegenTime: {},
    lastSurvivorActive: {},
    showHUD: false
  },

  initMap(mapIndex) {
    if (this.state.populations[mapIndex]) return;
    this.state.populations[mapIndex] = {};
    const chain = ECOSYSTEM_CONFIG.foodChains[mapIndex] || [];
    chain.forEach(([predator, prey]) => {
      this.state.populations[mapIndex][predator] = ECOSYSTEM_CONFIG.populationStart;
      this.state.populations[mapIndex][prey]     = ECOSYSTEM_CONFIG.populationStart;
    });
    this.state.lastRegenTime[mapIndex] = GameState.time;
  },

  getPopulation(mapIndex, enemyType) {
    return this.state.populations[mapIndex]?.[enemyType] ?? ECOSYSTEM_CONFIG.populationStart;
  },

  getTier(pop) {
    const c = ECOSYSTEM_CONFIG;
    if (pop >= c.overpopulate.threshold)  return c.overpopulate;
    if (pop >= c.underpopulate.threshold) return c.normal;
    if (pop >= c.nearExtinct.threshold)   return c.underpopulate;
    return c.nearExtinct;
  },

  onKill(enemyType, mapIndex) {
    const state = this.state;
    if (state.populations[mapIndex] === undefined) return;
    if (state.populations[mapIndex][enemyType] === undefined) return;

    state.populations[mapIndex][enemyType] = Math.max(0, state.populations[mapIndex][enemyType] - ECOSYSTEM_CONFIG.killDecrease);

    const chain = (ECOSYSTEM_CONFIG.foodChains[mapIndex] || []).find(c => c.includes(enemyType));
    if (chain) {
      const other = chain.find(t => t !== enemyType);
      if (other && state.populations[mapIndex][other] !== undefined) {
        state.populations[mapIndex][other] = Math.min(ECOSYSTEM_CONFIG.populationMax, state.populations[mapIndex][other] + 1);
      }
    }

    const pop = state.populations[mapIndex][enemyType];
    const lsKey = mapIndex + '_' + enemyType;
    if (pop < ECOSYSTEM_CONFIG.nearExtinct.threshold && !state.lastSurvivorActive[lsKey]) {
      this.spawnLastSurvivor(enemyType, mapIndex);
    }
  },

  spawnLastSurvivor(enemyType, mapIndex) {
    const lsKey = mapIndex + '_' + enemyType;
    this.state.lastSurvivorActive[lsKey] = true;
    const mapData = typeof Maps !== 'undefined' ? Maps.data[mapIndex] : null;
    const baseLevel = (mapData ? mapData.lvl : 1) + 5;
    const e = Enemies.spawn(enemyType, 2.0, baseLevel);
    if (!e) return;
    e.name = '【最後】' + e.name;
    e.color = '#ffd700';
    e._isLastSurvivor = true;
    e._lsKey = lsKey;
    e.drops = [{ id: 'dragonScale', chance: 1.0 }, ...(e.drops || [])];
    if (typeof UI !== 'undefined') {
      UI.addLog('⚠️ Loài gần tuyệt chủng! Last Survivor xuất hiện!', 'realm');
      UI.showNotification('🌟 Last Survivor!', e.name + ' — Drop guaranteed!');
    }
  },

  update(dt) {
    const mapIndex = Maps.currentIndex;
    const state = this.state;

    if (!state.populations[mapIndex]) { this.initMap(mapIndex); return; }

    if (!state.lastRegenTime[mapIndex]) state.lastRegenTime[mapIndex] = GameState.time;
    if (GameState.time - state.lastRegenTime[mapIndex] >= ECOSYSTEM_CONFIG.regenInterval) {
      state.lastRegenTime[mapIndex] = GameState.time;
      for (const type in state.populations[mapIndex]) {
        state.populations[mapIndex][type] = Math.min(ECOSYSTEM_CONFIG.populationMax, state.populations[mapIndex][type] + ECOSYSTEM_CONFIG.regenPerTick);
      }
    }

    for (const type in state.populations[mapIndex]) {
      const lsKey = mapIndex + '_' + type;
      const pop = state.populations[mapIndex][type];
      if (pop >= ECOSYSTEM_CONFIG.underpopulate.threshold && state.lastSurvivorActive[lsKey]) {
        state.lastSurvivorActive[lsKey] = false;
      }
    }
  },

  renderMinimapOverlay() {
    if (!this.state.showHUD) return;
    const mc = document.getElementById('minimapCanvas');
    if (!mc) return;
    const mctx = mc.getContext('2d');
    const mapIndex = Maps.currentIndex;
    if (!this.state.populations[mapIndex]) return;

    const chain = ECOSYSTEM_CONFIG.foodChains[mapIndex] || [];
    let yOffset = 5;
    chain.flat().forEach(type => {
      const pop = this.state.populations[mapIndex][type];
      const barColor = pop >= 100 ? '#4caf50' : pop >= 30 ? '#ff9800' : '#f44336';
      const pct = Math.min(1, pop / ECOSYSTEM_CONFIG.populationMax);
      mctx.fillStyle = 'rgba(0,0,0,0.5)';
      mctx.fillRect(2, yOffset, 40, 5);
      mctx.fillStyle = barColor;
      mctx.fillRect(2, yOffset, 40 * pct, 5);
      mctx.fillStyle = '#fff';
      mctx.font = '5px monospace';
      mctx.fillText(type.substr(0, 4), 44, yOffset + 5);
      yOffset += 8;
    });
  }
};

// ================================================================
// SECTION 3 — SIDE CHARACTERS SYSTEM
// ================================================================

const SIDE_CHARACTERS_CONFIG = {
  characters: {
    vanNhi: {
      id: 'vanNhi', name: 'Vân Nhi', title: 'Thiếu Nữ Tu Tiên',
      sprite: 'npcShop', color: '#f48fb1',
      mapPositions: [
        {mapIndex:0,tx:20,ty:15},{mapIndex:1,tx:25,ty:20},{mapIndex:2,tx:18,ty:30},
        {mapIndex:3,tx:22,ty:25},{mapIndex:4,tx:30,ty:20},{mapIndex:5,tx:25,ty:25}
      ],
      encounters: [
        { map:0, phase:'first', dialog:'Cứu tôi với! Có quái đang đuổi theo!',
          options:[
            {text:'[Giúp] Đừng lo, ta sẽ bảo vệ ngươi!', choice:'help',  karma:+10},
            {text:'[Bỏ] Ta không có thời gian.',          choice:'ignore', karma:-5}
          ],
          gift:{item:'hpPotion', count:2, condition:'help'} },
        { map:1, phase:'search',
          dialog(dec){ return dec.vanNhi?.map0==='help' ? 'Cảm ơn lần trước! Ta đang tìm Sư Phụ bị mất tích...' : 'Ngươi là người ta gặp hôm trước. Ta đang tìm Sư Phụ...'; },
          options:[
            {text:'[Giúp tìm] Ta sẽ giúp ngươi.', choice:'assist',  karma:+10},
            {text:'[Thụ động] Chúc may mắn.',      choice:'passive', karma:0}
          ],
          gift:{item:'mpPotion', count:2, condition:'assist'} },
        { map:2, phase:'rescue', dialog:'Sư Phụ bị Viêm Đế bắt giữ! Ngươi có thể giúp giải cứu không?',
          options:[
            {text:'[Đồng ý] Ta sẽ đánh bại Viêm Đế!', choice:'promise', karma:+15},
            {text:'[Từ chối] Việc của ngươi, tự lo đi.', choice:'refuse', karma:-10}
          ],
          gift:{item:'expPotion', count:1, condition:'promise'} },
        { map:3, phase:'together',
          dialog(dec){ return dec.vanNhi?.map2==='promise' ? 'Cảm ơn đã hứa! Ta tin tưởng ngươi. Cùng nhau đến Thiên Ma Động!' : 'Ngươi... có thể giúp ta không? Lần này ta van xin ngươi.'; },
          options:[
            {text:'[Đồng hành] Cùng ta tiến lên!', choice:'together', karma:+10},
            {text:'[Tiếp tục từ chối]',             choice:'refuse2', karma:-5}
          ],
          gift:{item:'realmPill', count:1, condition:'together'} },
        { map:4, phase:'choice', dialog:'Sư Phụ bị Ma Khí kiểm soát... Phải làm gì đây?',
          options:[
            {text:'[Giải Cứu] Dùng Siêu Độ Phù giải thoát Sư Phụ', choice:'rescue', karma:+30, requireItem:'oanHonWard'},
            {text:'[Tiêu Diệt] Không còn lựa chọn nào khác...',     choice:'kill',   karma:-30}
          ],
          gift:{item:null, condition:'rescue', specialGift:'dragonScale'} },
        { map:5, phase:'ending',
          dialog(dec){
            const rescued = dec.vanNhi?.map4==='rescue';
            const helped  = ['map0','map1','map2','map3'].filter(k => ['help','assist','promise','together'].includes(dec.vanNhi?.[k])).length;
            if (rescued && helped >= 3) return '✨ Nhờ ngươi, Sư Phụ đã được cứu! Đây là tất cả những gì ta có...';
            if (rescued) return 'Cảm ơn ngươi đã giải cứu Sư Phụ. Ta không quên ơn này.';
            return 'Dù ngươi không giúp nhiều... nhưng Sư Phụ đã tự thoát ra được.';
          },
          options:[{text:'[Cảm ơn]', choice:'thanks'}],
          gift:{
            item:'celestialOrb',
            count(dec){ return ['map0','map1','map2','map3'].filter(k => ['help','assist','promise','together'].includes(dec.vanNhi?.[k])).length + 1; },
            condition:'always'
          } }
      ]
    },

    laoThuong: {
      id:'laoThuong', name:'Lão Thương', title:'Thương Nhân Già',
      sprite:'npcShop', color:'#ff9800',
      mapPositions:[
        {mapIndex:0,tx:35,ty:25},{mapIndex:1,tx:30,ty:35},{mapIndex:2,tx:40,ty:20},
        {mapIndex:3,tx:35,ty:30},{mapIndex:4,tx:25,ty:40},{mapIndex:5,tx:40,ty:35}
      ],
      encounters:[
        { map:0, dialog:'Hàng hiếm đây! Nhưng giá thế này là rẻ lắm rồi...',
          shopDiscount:0, specialItems:['ironSword','leatherArmor'],
          options:[{text:'[Mua đồ]',choice:'buy'},{text:'[Bỏ qua]',choice:'skip'}] },
        { map:1, dialog:'Ồ, ngươi lại đây! Giảm giá 10% cho khách quen!',
          shopDiscount:0.10, specialItems:['steelSword','ironArmor','spiritStone'],
          options:[{text:'[Mua đồ]',choice:'buy'},{text:'[Chào hỏi]',choice:'greet',karma:+5}] },
        { map:2, dialog:'Giảm giá 15% hôm nay! Và ta có hàng đặc biệt...',
          shopDiscount:0.15, specialItems:['flameSword','dragonArmor','dragonScale'],
          options:[{text:'[Mua đồ]',choice:'buy'}] },
        { map:3, dialog:'Tên cướp lấy hết hàng của ta! Ngươi có thể giúp ta không?',
          options:[
            {text:'[Giúp đuổi cướp]',choice:'help',   karma:+20},
            {text:'[Bỏ qua]',         choice:'ignore', karma:-5}
          ],
          spawnEnemies:{type:'demon', count:3} },
        { map:4,
          dialog(dec){ return dec.laoThuong?.map3==='help' ? 'Cảm ơn đã giúp đỡ! Đây là vật này ta giữ bấy lâu...' : 'Giảm 20% cho ngươi.'; },
          shopDiscount:0.20,
          gift:{item:'celestialSword', count:1, condition:'help'} },
        { map:5, dialog:'Shop đặc biệt chỉ dành cho bạn thân!',
          shopDiscount:0.25,
          exclusiveItems:['celestialSword','celestialRobe','celestialJade','celestialOrb'] }
      ]
    },

    tietNguu: {
      id:'tietNguu', name:'Thiết Ngưu', title:'Chiến Binh Cô Độc',
      sprite:'npcTeleporter', color:'#9e9e9e',
      mapPositions:[
        {mapIndex:0,tx:45,ty:40},{mapIndex:1,tx:40,ty:45},{mapIndex:2,tx:50,ty:35},
        {mapIndex:3,tx:45,ty:40},{mapIndex:4,tx:35,ty:45},{mapIndex:5,tx:50,ty:40}
      ],
      encounters:[
        { map:0, dialog:'Tránh ra! Ta không cần đồng đội.',
          options:[
            {text:'[Kéo dài] Ngươi chắc không?', choice:'persist', karma:+2},
            {text:'[Bỏ đi] Tùy ngươi.',          choice:'leave',   karma:0}
          ] },
        { map:1, dialog:'...Ngươi lại đây. Ta bị thương. Nhưng ta không cần ai giúp.',
          options:[
            {text:'[Giúp đỡ] Ta cho ngươi một ít đan dược.', choice:'help',  karma:+15, requireItem:'hpPotionMedium', consumeItem:true},
            {text:'[Bỏ đi] Việc của ngươi.',                 choice:'leave', karma:0}
          ] },
        { map:2,
          dialog(dec){ return dec.tietNguu?.map1==='help' ? 'Ngươi đã giúp ta... Cùng ta chiến đấu một trận!' : 'Lại gặp ngươi.'; },
          options:[
            {text:'[Đồng ý chiến đấu cùng]', choice:'fight', condition:'helped'},
            {text:'[Chào hỏi]',              choice:'greet'}
          ],
          tempAllyDuration:5*60*1000 },
        { map:3, dialog:'Ta đang truy tìm kẻ đã giết sư phụ ta...',
          options:[
            {text:'[Lắng nghe]',     choice:'listen', karma:+5},
            {text:'[Giúp trả thù]',  choice:'avenge', karma:+20}
          ],
          gift:{item:'spiritStone', count:3, condition:'listen'} },
        { map:4,
          dialog(dec){ return SideCharacterSystem.hasHelped('tietNguu') ? 'Ngươi đã cho ta thấy... không phải chiến đấu một mình. Hãy đi tiếp đi. Ta sẽ chặn hậu.' : 'Thôi rồi... Hãy đi đi.'; },
          options:[{text:'[Tiến lên]', choice:'proceed'}],
          sacrifice:true },
        { map:5,
          dialog(dec){ return SideCharacterSystem.hasHelped('tietNguu') ? '...Ta vẫn còn đây. Ngươi không nghĩ ta chết dễ vậy chứ? Haha.' : null; },
          options:[{text:'[Cảm ơn]', choice:'thanks'}],
          gift:{item:'dragonScale', count:2, condition:'helped'},
          passiveBuff:{id:'ironWill', critWhenLowHp:0.20} }
      ]
    },

    xiaoLing: {
      id:'xiaoLing', name:'Tiểu Linh', title:'Linh Hồn Bé',
      sprite:'npcTeleporter', color:'#e040fb',
      mapPositions:[
        {mapIndex:0,tx:15,ty:45},{mapIndex:1,tx:50,ty:15},{mapIndex:2,tx:15,ty:50},
        {mapIndex:3,tx:50,ty:15},{mapIndex:4,tx:15,ty:15},{mapIndex:5,tx:50,ty:50}
      ],
      encounters:[
        { map:0, dialog:'Ồ ồ! Ngươi có thể thấy ta! Ta là... ta cũng không biết ta là gì.',
          options:[{text:'[Nói chuyện]', choice:'talk'}],
          gift:{item:'mpPotion', count:1, condition:'always'} },
        { map:1,
          dialog(){
            const karma = (typeof KarmaSystem !== 'undefined' && KarmaSystem.getScore) ? KarmaSystem.getScore() : 0;
            return karma > 50 ? 'Ngươi thật tốt bụng! Ta thích theo ngươi lắm~' : karma < -50 ? 'Sao ngươi giết nhiều thế... không sợ à?' : 'Ngươi đang làm gì ở nơi tối tăm này vậy?';
          },
          options:[{text:'[Trò chuyện]', choice:'chat', karma:+3}] },
        { map:2, dialog:'Ta đã ở nhiều nơi lắm... nhưng chưa thấy ai như ngươi.',
          options:[{text:'[Hỏi về Tiểu Linh]', choice:'ask', karma:+5}],
          gift:{item:'realmPill', count:1, condition:'ask'} },
        { map:3,
          dialog(){ return Player.realm >= 3 ? 'Ngươi mạnh lên nhiều rồi... ta cảm nhận được.' : 'Ngươi vẫn đang phát triển. Tiếp tục nhé!'; },
          options:[{text:'[Cảm ơn]', choice:'thanks'}] },
        { map:4, dialog:'Ta bắt đầu nhớ ra... Ta là ai đó rất quan trọng với ngươi...',
          options:[{text:'[Lắng nghe]', choice:'listen', karma:+10}],
          gift:{item:'dragonScale', count:1, condition:'always'} },
        { map:5, dialog:'Ta nhớ ra rồi. Ta là... người đã tạo ra ngươi. Hành trình này là thử thách ta đặt ra. Và ngươi đã vượt qua. Đây là quà cuối cùng của ta.',
          options:[{text:'[Chấp nhận]', choice:'accept'}],
          passiveBuff:{id:'celestialDawn', critRate:0.05},
          gift:{item:'celestialOrb', count:3, condition:'always'} }
      ]
    }
  }
};

const SideCharacterSystem = {
  state: {
    decisions: {},
    giftsClaimed: {},
    activePassives: {},
    spawnedThisMap: {},
    tietNguuAllyActive: false,
    tietNguuAllyEndTime: 0,
    tietNguuAllyX: 0,
    tietNguuAllyY: 0,
    tietNguuAllyAttackTimer: 0
  },

  getDecision(charId, mapIndex) {
    return this.state.decisions[charId]?.['map' + mapIndex];
  },

  setDecision(charId, mapIndex, choice) {
    if (!this.state.decisions[charId]) this.state.decisions[charId] = {};
    this.state.decisions[charId]['map' + mapIndex] = choice;
  },

  hasHelped(charId) {
    const decisions = this.state.decisions[charId] || {};
    const helpChoices = ['help','assist','promise','together','listen','talk','chat','ask','thanks','accept','fight','avenge','persist'];
    return Object.values(decisions).some(v => helpChoices.includes(v));
  },

  spawnForMap(mapIndex) {
    this.state.spawnedThisMap = {};
    for (const charId in SIDE_CHARACTERS_CONFIG.characters) {
      const charConfig = SIDE_CHARACTERS_CONFIG.characters[charId];
      const pos = charConfig.mapPositions.find(p => p.mapIndex === mapIndex);
      if (!pos) continue;

      // Thiết Ngưu: skip map5 nếu chưa build relationship
      if (charId === 'tietNguu' && mapIndex === 5 && !this.hasHelped('tietNguu')) continue;

      const typeKey = 'sc_' + charId;
      NPC.types[typeKey] = {
        name:   charConfig.name,
        title:  charConfig.title + ' [Map ' + mapIndex + ']',
        sprite: charConfig.sprite,
        dialog: '',
        service: 'sideCharacter_' + charId,
        _charId:   charId,
        _mapIndex: mapIndex
      };

      NPC.spawn(typeKey,
        pos.tx * CONFIG.TILE_SIZE + 16,
        pos.ty * CONFIG.TILE_SIZE + 16
      );
      this.state.spawnedThisMap[charId] = true;
    }
  },

  interact(charId, mapIndex) {
    const charConfig = SIDE_CHARACTERS_CONFIG.characters[charId];
    if (!charConfig) return;
    const encounter = charConfig.encounters.find(e => e.map === mapIndex);
    if (!encounter) return;

    const dialogText = typeof encounter.dialog === 'function'
      ? encounter.dialog(this.state.decisions)
      : encounter.dialog;
    if (!dialogText) { NPC.closeDialog(); return; }

    const nameEl    = document.getElementById('npcName');
    const titleEl   = document.getElementById('npcTitle');
    const textEl    = document.getElementById('npcText');
    const optionsEl = document.getElementById('npcOptions');
    if (!nameEl || !optionsEl) return;

    nameEl.textContent  = charConfig.name;
    if (titleEl) titleEl.textContent = charConfig.title;
    if (textEl)  textEl.textContent  = dialogText;
    optionsEl.innerHTML = '';

    (encounter.options || []).forEach(opt => {
      if (opt.condition === 'helped' && !this.hasHelped(charId)) return;
      if (opt.requireItem && !Inventory.has(opt.requireItem, 1)) {
        const div = document.createElement('div');
        div.className = 'npc-option disabled';
        div.innerHTML = '<span>' + opt.text + '</span><span class="cost">Cần ' + (ITEMS[opt.requireItem]?.name || opt.requireItem) + '</span>';
        optionsEl.appendChild(div);
        return;
      }
      const div = document.createElement('div');
      div.className = 'npc-option';
      div.innerHTML = '<span>' + opt.text + '</span>';
      div.addEventListener('click', () => {
        this.setDecision(charId, mapIndex, opt.choice);
        if (opt.karma && typeof KarmaSystem !== 'undefined' && KarmaSystem.addKarma) KarmaSystem.addKarma(opt.karma);
        if (opt.consumeItem && opt.requireItem) Inventory.remove(opt.requireItem, 1);
        this.grantGift(charId, mapIndex, opt.choice);
        this.handleSpecialAction(charId, mapIndex, opt.choice, encounter);
        NPC.closeDialog();
      });
      optionsEl.appendChild(div);
    });

    NPC.addCloseOption(optionsEl);
    const dialogEl = document.getElementById('npcDialog');
    if (dialogEl) dialogEl.classList.add('show');
  },

  grantGift(charId, mapIndex, choice) {
    const key = charId + '_' + mapIndex;
    if (this.state.giftsClaimed[key]) return;
    const charConfig = SIDE_CHARACTERS_CONFIG.characters[charId];
    const encounter = charConfig.encounters.find(e => e.map === mapIndex);
    if (!encounter?.gift) return;

    const gift = encounter.gift;
    const condition = gift.condition;
    if (condition !== 'always' && condition !== choice && condition !== 'helped') return;
    if (condition === 'helped' && !this.hasHelped(charId)) return;

    this.state.giftsClaimed[key] = true;
    const count = typeof gift.count === 'function' ? gift.count(this.state.decisions) : (gift.count || 1);

    if (gift.item && ITEMS[gift.item]) {
      Inventory.add(gift.item, count);
      if (typeof UI !== 'undefined') UI.addLog('🎁 ' + charConfig.name + ' tặng ' + ITEMS[gift.item].name + ' x' + count, 'item');
    }
    if (gift.specialGift && ITEMS[gift.specialGift]) {
      Inventory.add(gift.specialGift, 1);
      if (typeof UI !== 'undefined') UI.addLog('🎁 ' + charConfig.name + ' tặng ' + ITEMS[gift.specialGift].name, 'item');
    }
    if (encounter.passiveBuff) {
      this.applyPassiveBuff(encounter.passiveBuff);
    }
  },

  applyPassiveBuff(buff) {
    this.state.activePassives[buff.id] = true;
    if (buff.critRate) {
      Player._scCritRate = (Player._scCritRate || 0) + buff.critRate;
      Player.recalculateStats();
      if (typeof UI !== 'undefined') UI.addLog('✨ Passive buff: +' + (buff.critRate * 100) + '% crit rate vĩnh viễn!', 'realm');
    }
    if (buff.critWhenLowHp) {
      Player._scCritWhenLowHp = buff.critWhenLowHp;
      if (typeof UI !== 'undefined') UI.addLog('✨ Passive: +20% crit khi HP < 20% (Thiết Ngưu)', 'realm');
    }
  },

  handleSpecialAction(charId, mapIndex, choice, encounter) {
    if (charId === 'tietNguu' && mapIndex === 2 && choice === 'fight') {
      const state = this.state;
      state.tietNguuAllyActive  = true;
      state.tietNguuAllyEndTime = GameState.time + (encounter.tempAllyDuration || 300000);
      state.tietNguuAllyX       = Player.x + 40;
      state.tietNguuAllyY       = Player.y;
      if (typeof UI !== 'undefined') UI.addLog('⚔️ Thiết Ngưu sát cánh cùng ngươi!', 'realm');
    }
    if (charId === 'laoThuong' && mapIndex === 3 && choice === 'help') {
      const enemyTypes = Maps.data[Maps.currentIndex]?.enemies || ['demon'];
      for (let i = 0; i < 3; i++) {
        const e = Enemies.spawn(enemyTypes[0], 1.2, Player.level);
        if (e) {
          e.x = Player.x + (Math.random() - 0.5) * 200;
          e.y = Player.y + (Math.random() - 0.5) * 200;
        }
      }
      if (typeof UI !== 'undefined') UI.addLog('⚔️ Bọn cướp xuất hiện!', 'system');
    }
  },

  update(dt) {
    const state = this.state;
    if (!state.tietNguuAllyActive) return;

    if (GameState.time > state.tietNguuAllyEndTime) {
      state.tietNguuAllyActive = false;
      if (typeof UI !== 'undefined') UI.addLog('Thiết Ngưu: "Tới đây là đủ rồi. Hãy tự mình đi tiếp."', 'npc');
      return;
    }

    const dist = Utils.dist(state.tietNguuAllyX, state.tietNguuAllyY, Player.x, Player.y);
    if (dist > 80) {
      const dx = Player.x - state.tietNguuAllyX;
      const dy = Player.y - state.tietNguuAllyY;
      state.tietNguuAllyX += (dx / dist) * 2.5;
      state.tietNguuAllyY += (dy / dist) * 2.5;
    }

    state.tietNguuAllyAttackTimer -= dt;
    if (state.tietNguuAllyAttackTimer <= 0) {
      const target = Enemies.findNearest(state.tietNguuAllyX, state.tietNguuAllyY, 100, e => e.alive);
      if (target) {
        const dmg = Math.floor(Player.atk * 0.5);
        Enemies.damage(target, dmg, false, '#9e9e9e');
        state.tietNguuAllyAttackTimer = 1200;
      } else {
        state.tietNguuAllyAttackTimer = 500;
      }
    }
  },

  render(ctx) {
    const state = this.state;
    if (!state.tietNguuAllyActive) return;
    const cx = state.tietNguuAllyX - GameState.camera.x;
    const cy = state.tietNguuAllyY - GameState.camera.y;

    ctx.fillStyle = '#9e9e9e';
    ctx.fillRect(cx - 8, cy - 20, 16, 20);
    ctx.fillStyle = '#ffe4c4';
    ctx.fillRect(cx - 5, cy - 30, 10, 10);
    ctx.fillStyle = '#616161';
    ctx.fillRect(cx - 6, cy - 18, 4, 12);

    ctx.fillStyle = '#4caf50';
    ctx.fillRect(cx - 15, cy - 40, 30, 3);

    ctx.fillStyle = '#fff';
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Thiết Ngưu', cx, cy - 43);
  }
};

// ================================================================
// SECTION 4 — SET ITEMS SYSTEM
// ================================================================

const SET_ITEMS_CONFIG = {
  sets: {
    linhKiem: {
      id:'linhKiem', name:'Linh Kiếm Bộ', color:'#42a5f5', icon:'⚔️',
      items: {
        weapon:    {id:'linhKiemSword',  name:'Linh Kiếm',     type:'weapon',    rarity:'rare',      stats:{atk:35,critRate:0.05}, sellPrice:300,  dropSources:['ghost','spiritStone_craft']},
        armor:     {id:'kiemSiBao',      name:'Kiếm Sĩ Bào',   type:'armor',     rarity:'rare',      stats:{def:15,hp:80},          sellPrice:250,  dropSources:['ghost','spirit_enemies']},
        accessory: {id:'kiemLinhNgoc',   name:'Kiếm Linh Ngọc', type:'accessory', rarity:'rare',      stats:{atk:10,mp:20},          sellPrice:200,  dropSources:['spiritRobe_craft','ghost']}
      },
      bonus: {
        partial: {count:2, desc:'+15% Skill Damage',              apply(p){ p._setSkillDmg = (p._setSkillDmg||0) + 0.15; }},
        full:    {count:3, desc:'Kiếm Ý: 10% chance skill CD reset khi kill', passiveId:'kiemY'}
      }
    },
    longGiap: {
      id:'longGiap', name:'Long Giáp Bộ', color:'#f0c040', icon:'🐉',
      items: {
        weapon:    {id:'longNhaKiem',   name:'Long Nha Kiếm',       type:'weapon',    rarity:'epic',      stats:{atk:40,def:5},         sellPrice:450, dropSources:['celestialDragon','dragonArmor_enhance']},
        armor:     {id:'longLanGiap2',  name:'Long Lân Thánh Giáp', type:'armor',     rarity:'epic',      stats:{def:35,hp:200},         sellPrice:500, dropSources:['celestialDragon','boss_drop']},
        accessory: {id:'longBai2',      name:'Long Bài Thánh',      type:'accessory', rarity:'epic',      stats:{def:12,hp:100},         sellPrice:350, dropSources:['iceEmperor','demonLord']}
      },
      bonus: {
        partial: {count:2, desc:'+20% MaxHP',                          apply(p){ p.maxHp = Math.floor(p.maxHp*1.20); p.hp = Math.min(p.hp, p.maxHp); }},
        full:    {count:3, desc:'Long Thể: Immune fire damage',        passiveId:'longThe'}
      }
    },
    tienVu: {
      id:'tienVu', name:'Tiên Vũ Bộ', color:'#e040fb', icon:'✨',
      items: {
        weapon:    {id:'tienVuKiem',  name:'Tiên Vũ Kiếm',  type:'weapon',    rarity:'legendary', stats:{atk:45,mp:30},         sellPrice:800, dropSources:['celestialBeast','dungeon_legendary']},
        armor:     {id:'tienVuBao',   name:'Tiên Vũ Bào',   type:'armor',     rarity:'legendary', stats:{def:20,mp:60},          sellPrice:900, dropSources:['celestialBeast','dungeon_legendary']},
        accessory: {id:'tienVuNgoc',  name:'Tiên Vũ Ngọc',  type:'accessory', rarity:'legendary', stats:{mp:50,critDmg:0.20},    sellPrice:700, dropSources:['divineDragon','dungeon_legendary']}
      },
      bonus: {
        partial: {count:2, desc:'+30% EXP & Tu Vi',                    apply(p){ p._setExpMul = (p._setExpMul||1)*1.30; p._setRealmExpMul = (p._setRealmExpMul||1)*1.30; }},
        full:    {count:3, desc:'Tiên Vũ: Combo 10+ → Free cast (0 MP)', passiveId:'tienVuPassive'}
      }
    },
    hacAm: {
      id:'hacAm', name:'Hắc Ám Bộ', color:'#4a148c', icon:'🌑',
      items: {
        weapon:    {id:'hacKiem',  name:'Hắc Kiếm',  type:'weapon',    rarity:'epic', stats:{atk:60,critDmg:0.4}, sellPrice:600, dropSources:['blackMarket','darkDemon','shadowLord']},
        armor:     {id:'hacGiap',  name:'Hắc Giáp',  type:'armor',     rarity:'epic', stats:{def:10,hp:50},        sellPrice:400, dropSources:['blackMarket','darkDemon']},
        accessory: {id:'hacNgoc',  name:'Hắc Ngọc',  type:'accessory', rarity:'epic', stats:{atk:20},              sellPrice:500, dropSources:['blackMarket','shadowLord']}
      },
      bonus: {
        partial: {count:2, desc:'+25% Damage khi HP < 50%',            apply(p){ if (p.hp/p.maxHp < 0.50) p._setLowHpDmg = (p._setLowHpDmg||0) + 0.25; }},
        full:    {count:3, desc:'Hắc Ám Thức: Invisible khi HP < 30%, đứng yên', passiveId:'hacAmThuc'}
      }
    }
  }
};

const SetItemSystem = {
  state: { equipped: {} },

  getEquippedSetItems() {
    const result = {};
    for (const [setId, setConfig] of Object.entries(SET_ITEMS_CONFIG.sets)) {
      result[setId] = { count: 0, slots: [] };
      for (const [slot, itemDef] of Object.entries(setConfig.items)) {
        if (Player.equipped[slot] === itemDef.id) {
          result[setId].count++;
          result[setId].slots.push(slot);
        }
      }
    }
    return result;
  },

  getSetForItem(itemId) {
    for (const [setId, setConfig] of Object.entries(SET_ITEMS_CONFIG.sets)) {
      for (const itemDef of Object.values(setConfig.items)) {
        if (itemDef.id === itemId) return { setId, setConfig };
      }
    }
    return null;
  },

  applySetBonuses(player) {
    delete player._setSkillDmg;
    delete player._setExpMul;
    delete player._setRealmExpMul;
    delete player._setLowHpDmg;

    const equipped = this.getEquippedSetItems();
    for (const [setId, equip] of Object.entries(equipped)) {
      const setConfig = SET_ITEMS_CONFIG.sets[setId];
      if (!setConfig) continue;
      const { count } = equip;
      if (count >= setConfig.bonus.partial.count) {
        if (setConfig.bonus.partial.apply) setConfig.bonus.partial.apply(player);
      }
      if (count >= setConfig.bonus.full.count) {
        player['_setPassive_' + setConfig.bonus.full.passiveId] = true;
      }
    }
  },

  getSetCountForItem(itemId) {
    const result = this.getSetForItem(itemId);
    if (!result) return null;
    const { setId } = result;
    const equipped = this.getEquippedSetItems();
    return { setId, current: equipped[setId]?.count || 0, total: 3, name: SET_ITEMS_CONFIG.sets[setId].name };
  },

  renderSetProgressSection() {
    const charStats = document.getElementById('charStats');
    if (!charStats) return;

    const oldSection = document.getElementById('setItemsSection');
    if (oldSection) oldSection.remove();

    const section = document.createElement('div');
    section.id = 'setItemsSection';
    section.style.cssText = 'margin-top:14px;border-top:1px solid #333;padding-top:10px';
    section.innerHTML = '<div style="color:#f0c040;font-size:11px;font-weight:bold;margin-bottom:8px">⚔️ Trang Bị Bộ</div>';

    const equipped = this.getEquippedSetItems();
    for (const [setId, setConfig] of Object.entries(SET_ITEMS_CONFIG.sets)) {
      const count = equipped[setId]?.count || 0;
      const partial = setConfig.bonus.partial;
      const full    = setConfig.bonus.full;
      const row = document.createElement('div');
      row.style.cssText = 'margin-bottom:8px';
      row.innerHTML =
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px">' +
          '<span style="color:' + setConfig.color + ';font-size:10px">' + setConfig.icon + ' ' + setConfig.name + '</span>' +
          '<span style="color:' + (count > 0 ? setConfig.color : '#555') + ';font-size:10px;font-weight:bold">' + count + '/3</span>' +
        '</div>' +
        '<div class="set-progress-bar">' +
          '<div class="set-progress-fill" style="width:' + (count / 3 * 100) + '%;background:' + setConfig.color + '"></div>' +
        '</div>' +
        '<div style="font-size:9px;color:' + (count >= partial.count ? '#aaa' : '#555') + ';margin-top:2px">2件: ' + partial.desc + '</div>' +
        '<div style="font-size:9px;color:' + (count >= full.count ? '#f0c040' : '#555') + '">3件: ' + full.desc + '</div>';
      section.appendChild(row);
    }
    charStats.appendChild(section);
  }
};

// ================================================================
// SECTION 5 — HOOKS & WRAPPING (1 unified block per object)
// ================================================================

(function _installHooks() {

  // ---- Player.useSkill (SkillEvolution + SetPassive tienVu) ----
  const _origUseSkill = Player.useSkill.bind(Player);
  Player.useSkill = function(idx) {
    const evo = SkillEvolutionSystem.getActiveEvo(idx);
    if (evo) {
      const skill = this.skills[idx];
      if (!skill || skill.cd > 0) return false;
      if (this.mp < evo.mp) {
        if (typeof UI !== 'undefined') UI.addLog('⚡ Không đủ linh lực!', 'system');
        return false;
      }
      // Tiên Vũ free cast at combo 10+
      let freeCast = false;
      if (this._setPassive_tienVuPassive) {
        const comboCount = (typeof ComboSystem !== 'undefined' && ComboSystem.state) ? (ComboSystem.state.count || 0) : 0;
        if (comboCount >= 10) freeCast = true;
      }
      if (!freeCast) this.mp -= evo.mp;
      skill.cd = evo.cd;
      SkillEvolutionSystem.executeEvolvedSkill(idx);
      SkillEvolutionSystem.state.useCounts[idx]++;
      return true;
    }
    const result = _origUseSkill(idx);
    if (result) {
      SkillEvolutionSystem.state.useCounts[idx]++;
      SkillEvolutionSystem.checkUnlock(idx);
    }
    return result;
  };

  // ---- Player.recalculateStats (SC passives + Set bonuses) ----
  const _origRecalc = Player.recalculateStats.bind(Player);
  Player.recalculateStats = function() {
    _origRecalc();
    // SC passives
    if (this._scCritRate) this.critRate += this._scCritRate;
    if (this._scCritWhenLowHp && this.hp / this.maxHp < 0.20) this.critRate += this._scCritWhenLowHp;
    // Set bonuses
    SetItemSystem.applySetBonuses(this);
  };

  // ---- Player.takeDamage (longThe fire immune) ----
  const _origTakeDamage = Player.takeDamage.bind(Player);
  Player.takeDamage = function(amount, source) {
    if (this._setPassive_longThe && typeof source === 'string' && source.toLowerCase().includes('fire')) return;
    _origTakeDamage(amount, source);
  };

  // ---- Enemies.kill (unified: ecosystem + set drop + set passives) ----
  const _origKill = Enemies.kill.bind(Enemies);
  Enemies.kill = function(enemy) {
    if (!enemy || !enemy.alive) return;

    // Ecosystem modifiers (exp/drop)
    const pop  = EcosystemSystem.getPopulation(Maps.currentIndex, enemy.type);
    const tier = EcosystemSystem.getTier(pop);
    enemy.exp  = Math.floor((enemy.exp  || 0) * tier.expMul);
    enemy.gold = Math.floor((enemy.gold || 0) * tier.dropMul);
    enemy.drops = (enemy.drops || []).map(d => ({ ...d, chance: Math.min(1, d.chance * tier.dropMul) }));

    // Set item drops
    for (const [setId, setConfig] of Object.entries(SET_ITEMS_CONFIG.sets)) {
      for (const itemDef of Object.values(setConfig.items)) {
        if (itemDef.dropSources.some(src => src === enemy.type || (enemy.boss && src === 'boss_drop'))) {
          if (Utils.chance(0.03)) {
            Inventory.add(itemDef.id, 1);
            if (typeof UI !== 'undefined') UI.addLog('🎁 Drop set item: [' + setConfig.name + '] ' + itemDef.name + '!', 'item');
          }
        }
      }
    }

    // HuahuaDan drop from bosses
    if (enemy.boss) {
      const danChance = (enemy.type === 'wolfKing' || enemy.type === 'demonLord') ? 0.10 : (enemy.type === 'iceEmperor' || enemy.type === 'celestialDragon') ? 0.15 : 0;
      if (danChance > 0 && Utils.chance(danChance)) {
        Inventory.add('huahuaDan', 1);
        if (typeof UI !== 'undefined') UI.addLog('✨ Drop: Hóa Hóa Đan!', 'item');
      }
    }

    _origKill(enemy);

    // Ecosystem tracking
    EcosystemSystem.onKill(enemy.type, Maps.currentIndex);

    // Last survivor cleanup
    if (enemy._isLastSurvivor && enemy._lsKey) {
      EcosystemSystem.state.lastSurvivorActive[enemy._lsKey] = false;
    }

    // Set passive: Kiếm Ý — 10% chance reset random skill CD
    if (Player._setPassive_kiemY && Utils.chance(0.10)) {
      const rdx = Math.floor(Math.random() * 4);
      if (Player.skills[rdx]) { Player.skills[rdx].cd = 0; }
      Game.spawnDamageNumber(Player.x, Player.y - 40, '⚔️CD!', '#42a5f5');
    }
  };

  // ---- Maps.generate (init ecosystem) ----
  const _origGenerate = Maps.generate.bind(Maps);
  Maps.generate = function() {
    _origGenerate();
    EcosystemSystem.initMap(this.currentIndex);
  };

  // ---- NPC.spawnForMap (side characters) ----
  const _origSpawnForMap = NPC.spawnForMap.bind(NPC);
  NPC.spawnForMap = function(mapIndex) {
    _origSpawnForMap(mapIndex);
    SideCharacterSystem.spawnForMap(mapIndex);
  };

  // ---- NPC.interact (side character intercept) ----
  const _origInteract = NPC.interact.bind(NPC);
  NPC.interact = function(npc) {
    if (npc && npc.service && npc.service.startsWith('sideCharacter_')) {
      const charId = npc.service.replace('sideCharacter_', '');
      const mapIndex = npc._mapIndex !== undefined ? npc._mapIndex : Maps.currentIndex;
      SideCharacterSystem.interact(charId, mapIndex);
      return;
    }
    _origInteract(npc);
  };

  // ---- Inventory.showTooltip (set info) ----
  if (typeof Inventory !== 'undefined' && Inventory.showTooltip) {
    const _origTooltip = Inventory.showTooltip.bind(Inventory);
    Inventory.showTooltip = function(itemId, slotIndex, event) {
      _origTooltip(itemId, slotIndex, event);
      // Inject set info after a tick so the tooltip DOM is ready
      setTimeout(() => {
        const setInfo = SetItemSystem.getSetCountForItem(itemId);
        if (setInfo) {
          const typeEl = document.getElementById('tooltipType');
          if (typeEl) {
            typeEl.innerHTML += '<br><span style="color:#f0c040">Bộ: ' + setInfo.name + ' (' + setInfo.current + '/' + setInfo.total + ')</span>';
          }
        }
      }, 0);
    };
  }

  // ---- Inventory.useItem (HuahuaDan reset) ----
  if (typeof Inventory !== 'undefined' && Inventory.useItem) {
    const _origUseItem = Inventory.useItem.bind(Inventory);
    Inventory.useItem = function(itemId) {
      const item = ITEMS[itemId];
      if (item && item.effect && item.effect.resetEvolution) {
        Inventory.remove(itemId, 1);
        SkillEvolutionChoiceUI.showResetPicker();
        return true;
      }
      return _origUseItem(itemId);
    };
  }

  // ---- UI.renderCharacter (set progress) ----
  if (typeof UI !== 'undefined' && UI.renderCharacter) {
    const _origRenderChar = UI.renderCharacter.bind(UI);
    UI.renderCharacter = function() {
      _origRenderChar();
      SetItemSystem.renderSetProgressSection();
    };
  }

  // ---- Game.update (single wrap) ----
  const _origUpdate = Game.update.bind(Game);
  Game.update = function(dt) {
    _origUpdate(dt);
    SkillEvolutionSystem.update(dt);
    EcosystemSystem.update(dt);
    SideCharacterSystem.update(dt);
  };

  // ---- Game.renderParticles (orbit swords / charge) ----
  const _origRenderParticles = Game.renderParticles.bind(Game);
  Game.renderParticles = function() {
    _origRenderParticles();
    SkillEvolutionSystem.render(this.ctx);
  };

  // ---- Game.renderNPCs (Thiết Ngưu ally) ----
  const _origRenderNPCs = Game.renderNPCs.bind(Game);
  Game.renderNPCs = function() {
    _origRenderNPCs();
    SideCharacterSystem.render(this.ctx);
  };

  // ---- Game.renderMinimap (ecosystem overlay) ----
  const _origRenderMinimap = Game.renderMinimap.bind(Game);
  Game.renderMinimap = function() {
    _origRenderMinimap();
    EcosystemSystem.renderMinimapOverlay();
  };

  // ---- Game.init (feature init) ----
  const _origGameInit = Game.init.bind(Game);
  Game.init = function() {
    _origGameInit();
    GameplayDepthFeature.init();
  };

  // ---- Game.save / Game.load ----
  const _origSave = Game.save.bind(Game);
  Game.save = function() {
    _origSave();
    try {
      const data = {
        skillEvo:  { useCounts: SkillEvolutionSystem.state.useCounts, chosen: SkillEvolutionSystem.state.chosen, unlocked: SkillEvolutionSystem.state.unlocked },
        ecosystem: { populations: EcosystemSystem.state.populations },
        sideChars: { decisions: SideCharacterSystem.state.decisions, giftsClaimed: SideCharacterSystem.state.giftsClaimed, activePassives: SideCharacterSystem.state.activePassives }
      };
      localStorage.setItem('tuxien_gameplay_depth', JSON.stringify(data));
    } catch(e) { console.error('GameplayDepth save error:', e); }
  };

  const _origLoad = Game.load.bind(Game);
  Game.load = function() {
    const result = _origLoad();
    GameplayDepthFeature.loadSavedData();
    return result;
  };

})();

// ================================================================
// SECTION 6 — STARTUP
// ================================================================

const GameplayDepthFeature = {
  init() {
    // 1. Inject items
    ITEMS.huahuaDan = SKILL_EVOLUTION_CONFIG.huahuaDanItem;
    for (const setConfig of Object.values(SET_ITEMS_CONFIG.sets)) {
      for (const itemDef of Object.values(setConfig.items)) {
        if (!ITEMS[itemDef.id]) {
          const setRef = SetItemSystem.getSetForItem(itemDef.id);
          ITEMS[itemDef.id] = {
            name: itemDef.name,
            type: itemDef.type,
            rarity: itemDef.rarity,
            stats: itemDef.stats,
            sellPrice: itemDef.sellPrice,
            desc: (setRef ? SET_ITEMS_CONFIG.sets[setRef.setId].name + ' — ' : '') + itemDef.type,
            icon: itemDef.type === 'weapon' ? 'sword_iron' : itemDef.type === 'armor' ? 'armor_cloth' : 'pendant'
          };
        }
      }
    }

    // 2. Inject HTML
    this.injectHTML();

    // 3. Inject styles
    this.injectStyles();

    // 4. Load saved data
    this.loadSavedData();

    // 5. Recalculate stats (apply set bonuses & SC passives)
    Player.recalculateStats();

    // 6. Restore evolution icons
    for (let i = 0; i < 4; i++) {
      if (SkillEvolutionSystem.state.chosen[i]) {
        SkillEvolutionSystem.updateSkillIcon(i, SkillEvolutionSystem.state.chosen[i]);
        const evo = SkillEvolutionSystem.getActiveEvo(i);
        const btn = document.getElementById('skill' + i);
        if (btn && evo) {
          btn.style.borderColor = evo.color;
          btn.style.boxShadow   = '0 0 15px ' + evo.color;
        }
      }
    }

    // 7. Init ecosystem for current map
    EcosystemSystem.initMap(Maps.currentIndex);

    console.log('⚡ GameplayDepthFeature.init() complete');
  },

  injectHTML() {
    // Evolution choice panel
    if (!document.getElementById('evolutionPanel')) {
      const panel = document.createElement('div');
      panel.id = 'evolutionPanel';
      panel.style.cssText = 'display:none;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);' +
        'background:linear-gradient(135deg,#1a1a2e,#16213e);border:3px solid #f0c040;border-radius:15px;' +
        'padding:20px;min-width:340px;z-index:200;text-align:center;box-shadow:0 0 40px rgba(240,192,64,0.4);' +
        'font-family:\'Courier New\',monospace';
      panel.innerHTML =
        '<div style="color:#f0c040;font-size:16px;font-weight:bold;margin-bottom:6px">⚡ Kỹ Năng Tiến Hóa!</div>' +
        '<div id="evoSkillName" style="color:#aaa;font-size:11px;margin-bottom:16px"></div>' +
        '<div style="display:flex;gap:12px">' +
          '<div id="evoCardA" style="flex:1;background:rgba(66,165,245,0.1);border:2px solid #42a5f5;border-radius:10px;padding:12px;cursor:pointer">' +
            '<canvas id="evoIconA" width="24" height="24" style="image-rendering:pixelated;display:block;margin:0 auto 6px"></canvas>' +
            '<div id="evoNameA" style="color:#42a5f5;font-size:13px;font-weight:bold"></div>' +
            '<div id="evoDescA" style="color:#aaa;font-size:10px;margin-top:4px"></div>' +
          '</div>' +
          '<div id="evoCardB" style="flex:1;background:rgba(255,111,0,0.1);border:2px solid #ff6f00;border-radius:10px;padding:12px;cursor:pointer">' +
            '<canvas id="evoIconB" width="24" height="24" style="image-rendering:pixelated;display:block;margin:0 auto 6px"></canvas>' +
            '<div id="evoNameB" style="color:#ff6f00;font-size:13px;font-weight:bold"></div>' +
            '<div id="evoDescB" style="color:#aaa;font-size:10px;margin-top:4px"></div>' +
          '</div>' +
        '</div>' +
        '<div style="color:#666;font-size:9px;margin-top:12px">⚠️ Chọn rồi không thể đổi (trừ khi dùng Hóa Hóa Đan)</div>';
      document.body.appendChild(panel);
    }

    // Ecosystem toggle button (next to minimap)
    if (!document.getElementById('ecoToggle')) {
      const btn = document.createElement('button');
      btn.id = 'ecoToggle';
      btn.title = 'Hệ Sinh Thái';
      btn.textContent = '🌿';
      btn.style.cssText = 'position:absolute;top:0;right:35px;width:25px;height:25px;' +
        'background:rgba(0,0,0,0.8);border:1px solid #4caf50;border-radius:4px;' +
        'color:#4caf50;font-size:10px;cursor:pointer;z-index:3;font-family:inherit';
      btn.addEventListener('click', () => {
        EcosystemSystem.state.showHUD = !EcosystemSystem.state.showHUD;
        btn.style.background = EcosystemSystem.state.showHUD ? 'rgba(76,175,80,0.3)' : 'rgba(0,0,0,0.8)';
      });

      // Try to find the minimap container
      const minimap = document.getElementById('minimap') || document.querySelector('.minimap-container');
      if (minimap) {
        minimap.style.position = 'relative';
        minimap.appendChild(btn);
      } else {
        // Fallback: fixed position
        btn.style.cssText = 'position:fixed;bottom:80px;right:40px;width:25px;height:25px;' +
          'background:rgba(0,0,0,0.8);border:1px solid #4caf50;border-radius:4px;' +
          'color:#4caf50;font-size:10px;cursor:pointer;z-index:50;font-family:inherit';
        document.body.appendChild(btn);
      }
    }
  },

  injectStyles() {
    if (document.getElementById('gameplay-depth-style')) return;
    const style = document.createElement('style');
    style.id = 'gameplay-depth-style';
    style.textContent = `
      #evoCardA:hover { background:rgba(66,165,245,0.25) !important; }
      #evoCardB:hover { background:rgba(255,111,0,0.25) !important; }
      .set-progress-bar { height:4px;background:#333;border-radius:2px;overflow:hidden;margin:2px 0; }
      .set-progress-fill { height:100%;border-radius:2px;transition:width 0.3s; }
    `;
    document.head.appendChild(style);
  },

  loadSavedData() {
    try {
      const raw = localStorage.getItem('tuxien_gameplay_depth');
      if (!raw) return;
      const data = JSON.parse(raw);

      if (data.skillEvo) {
        const se = data.skillEvo;
        if (se.useCounts) SkillEvolutionSystem.state.useCounts = se.useCounts;
        if (se.chosen)    SkillEvolutionSystem.state.chosen    = se.chosen;
        if (se.unlocked)  SkillEvolutionSystem.state.unlocked  = se.unlocked;
      }
      if (data.ecosystem && data.ecosystem.populations) {
        EcosystemSystem.state.populations = data.ecosystem.populations;
        // Restore lastRegenTime for loaded maps
        for (const mi in data.ecosystem.populations) {
          if (!EcosystemSystem.state.lastRegenTime[mi]) EcosystemSystem.state.lastRegenTime[mi] = GameState.time;
        }
      }
      if (data.sideChars) {
        const sc = data.sideChars;
        if (sc.decisions)     SideCharacterSystem.state.decisions     = sc.decisions;
        if (sc.giftsClaimed)  SideCharacterSystem.state.giftsClaimed  = sc.giftsClaimed;
        if (sc.activePassives) {
          SideCharacterSystem.state.activePassives = sc.activePassives;
          // Re-apply any active passives to Player
          for (const passiveId in sc.activePassives) {
            for (const charId in SIDE_CHARACTERS_CONFIG.characters) {
              SIDE_CHARACTERS_CONFIG.characters[charId].encounters.forEach(enc => {
                if (enc.passiveBuff && enc.passiveBuff.id === passiveId && sc.activePassives[passiveId]) {
                  SideCharacterSystem.applyPassiveBuff(enc.passiveBuff);
                }
              });
            }
          }
        }
      }
    } catch(e) { console.error('GameplayDepth load error:', e); }
  }
};

// ================================================================
console.log('⚡ Gameplay Depth loaded (Skill Evolution + Ecosystem + Side Characters + Set Items)');
// Add to index.html after all other feature scripts:
// <script src="js/feature_gameplay_depth.js"></script>
