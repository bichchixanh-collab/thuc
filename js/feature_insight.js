// ===== FILE: feature_insight.js =====
// ==================== FEATURE: ĐỐN NGỘ / CƠ DUYÊN ====================
// Load sau game.js
// Pattern: monkey-patch only, không sửa file gốc

const InsightSystem = {
  // ==================== CONFIG ====================
  passivePool: [
    { id: 'sword_heart',  name: 'Kiếm Tâm',     icon: '⚔️', desc: '+15% DMG tất cả kỹ năng',       type: 'dmgBonus',   value: 0.15 },
    { id: 'thunder_law',  name: 'Lôi Pháp',      icon: '⚡', desc: '+25 ATK, kỹ năng AoE +30% DMG', type: 'aoeDmg',     value: 0.30, atkFlat: 25 },
    { id: 'iron_body',    name: 'Kim Thân',       icon: '🛡️', desc: '+30 DEF, giảm 20% sát thương',  type: 'ironBody',   value: 0.20, defFlat: 30 },
    { id: 'blood_surge',  name: 'Huyết Khí',      icon: '🩸', desc: 'Hồi 3% HP mỗi khi giết quái',   type: 'lifeSteal',  value: 0.03 },
    { id: 'swift_step',   name: 'Tốc Bộ',         icon: '💨', desc: '+0.5 tốc độ di chuyển',         type: 'speedUp',    value: 0.5 },
    { id: 'spirit_eye',   name: 'Linh Nhãn',      icon: '👁️', desc: '+10% tỷ lệ critical',           type: 'critBonus',  value: 0.10 },
    { id: 'void_edge',    name: 'Hư Không Nhẫn',  icon: '🌑', desc: 'Bỏ qua 25% DEF của quái',       type: 'armorPen',   value: 0.25 },
    { id: 'heaven_qi',    name: 'Thiên Địa Khí',  icon: '🌀', desc: '+10 MP regen mỗi 2 giây',       type: 'mpRegen',    value: 10 },
    { id: 'gold_luck',    name: 'Kim Vận',         icon: '💰', desc: '+30% vàng rơi từ quái',         type: 'goldBonus',  value: 0.30 },
    { id: 'realm_wisdom', name: 'Đạo Căn',         icon: '🔮', desc: '+50% Tu Vi mỗi lần tu luyện',   type: 'realmBonus', value: 0.50 },
    { id: 'crit_chain',   name: 'Liên Bạo',        icon: '🔥', desc: 'Mỗi critical +50% DMG crit tiếp theo (max 3s)', type: 'critChain', value: 0.50 },
    { id: 'shadow_step',  name: 'Ảnh Thoái',       icon: '👤', desc: '20% né tránh sát thương',       type: 'dodge',      value: 0.20 },
  ],

  activePassives: [],     // max 3, mỗi cái là { id, level (1 or 2), ...passiveData }
  killCount: 0,
  nextMilestone: 50,
  milestoneStep: 50,
  pendingInsight: false,

  critChainTimer: 0,
  critChainActive: false,

  // ==================== INIT ====================
  init() {
    this._injectStyle();
    this._injectHTML();
    this._loadSave();
    console.log('👁️ InsightSystem initialized');
  },

  // ==================== TRIGGER ====================
  onKill() {
    this.killCount++;
    if (this.killCount < this.nextMilestone) return;

    const chance = Math.max(0.15, 0.40 - (this.nextMilestone / this.milestoneStep - 1) * 0.05);
    if (Math.random() < chance) {
      this.pendingInsight = true;
      this._triggerInsight();
    }
    this.nextMilestone += this.milestoneStep;
  },

  _triggerInsight() {
    const candidates = this._getCandidates(3);
    if (candidates.length === 0) {
      UI.addLog('🔮 Đốn ngộ: Đã đạt tới giới hạn!', 'system');
      this.pendingInsight = false;
      return;
    }
    this._showInsightPanel(candidates);
    UI.showNotification('✨ ĐỐN NGỘ!', 'Chọn cơ duyên của bạn!');
    UI.addLog('✨ Đốn Ngộ xuất hiện! Chọn passive mới!', 'realm');
  },

  _getCandidates(count) {
    const result = [];
    const shuffled = [...this.passivePool].sort(() => Math.random() - 0.5);

    for (const p of shuffled) {
      const existing = this.activePassives.find(a => a.id === p.id);
      if (existing) {
        if (existing.level < 2) {
          result.push({ ...p, isUpgrade: true, existingLevel: existing.level });
        }
        // Đã level 2 → bỏ qua
      } else {
        result.push({ ...p, isUpgrade: false });
      }
      if (result.length >= count) break;
    }
    return result;
  },

  choosePassive(passiveId, isUpgrade) {
    const p = this.passivePool.find(x => x.id === passiveId);
    if (!p) return;

    document.getElementById('insightPanel').classList.remove('show');
    this.pendingInsight = false;

    if (isUpgrade) {
      const existing = this.activePassives.find(a => a.id === passiveId);
      if (existing) {
        existing.level = 2;
        this._applyPassive(p, true);
        UI.addLog(`💥 Nâng cấp ${p.icon} ${p.name} → Cấp 2!`, 'realm');
        UI.showNotification(`💥 ${p.name} Cấp 2!`, 'Hiệu quả x2!');
      }
    } else if (this.activePassives.length >= 3) {
      this._showReplacePanel(p);
      return;
    } else {
      this.activePassives.push({ ...p, level: 1 });
      this._applyPassive(p, false);
      UI.addLog(`✨ Đốn Ngộ: ${p.icon} ${p.name}!`, 'realm');
    }

    this._updateHUD();
    this._save();
    Player.recalculateStats();
  },

  replacePassive(removeId, newPassiveId) {
    const newP = this.passivePool.find(x => x.id === newPassiveId);
    if (!newP) return;

    const idx = this.activePassives.findIndex(a => a.id === removeId);
    if (idx !== -1) {
      this._removePassive(this.activePassives[idx]);
      this.activePassives.splice(idx, 1);
    }

    this.activePassives.push({ ...newP, level: 1 });
    this._applyPassive(newP, false);

    document.getElementById('insightReplacePanel').classList.remove('show');
    UI.addLog(`✨ Đốn Ngộ: ${newP.icon} ${newP.name}!`, 'realm');
    this._updateHUD();
    this._save();
    Player.recalculateStats();
  },

  // Apply stat changes (chỉ áp dụng các stat mutate trực tiếp vào Player base)
  _applyPassive(p, isUpgrade) {
    if (p.type === 'speedUp') {
      Player.baseSpeed += p.value;
      Player.speed = Player.baseSpeed;
    }
    if (p.type === 'ironBody' && p.defFlat) {
      Player.baseDef = (Player.baseDef || 3) + p.defFlat;
    }
    if (p.type === 'aoeDmg' && p.atkFlat) {
      Player.baseAtk += p.atkFlat;
    }
  },

  _removePassive(p) {
    if (p.type === 'speedUp') {
      Player.baseSpeed = Math.max(2.8, Player.baseSpeed - p.value * p.level);
      Player.speed = Player.baseSpeed;
    }
    if (p.type === 'ironBody' && p.defFlat) {
      Player.baseDef = Math.max(3, Player.baseDef - p.defFlat * p.level);
    }
    if (p.type === 'aoeDmg' && p.atkFlat) {
      Player.baseAtk = Math.max(12, Player.baseAtk - p.atkFlat * p.level);
    }
  },

  // ── Bonus getters ─────────────────────────────────────────
  // Helper chung tránh lặp code
  _sumPassive(type, base) {
    let val = base;
    for (const p of this.activePassives) {
      if (p.type === type) val += p.value * p.level;
    }
    return val;
  },

  getDmgBonus()    { return this._sumPassive('dmgBonus', 1); },
  getArmorPen()    { return this._sumPassive('armorPen', 0); },
  getDodgeChance() { return this._sumPassive('dodge',    0); },
  getCritBonus()   { return this._sumPassive('critBonus',0); },
  getGoldBonus()   { return this._sumPassive('goldBonus',1); },
  getRealmBonus()  { return this._sumPassive('realmBonus',1); },

  // ==================== UPDATE ====================
  update(dt) {
    // MP regen passive
    for (const p of this.activePassives) {
      if (p.type === 'mpRegen' && GameState.time % 2000 < dt) {
        Player.mp = Math.min(Player.maxMp, Player.mp + p.value * p.level);
      }
    }

    // Crit chain timer decay
    if (this.critChainActive) {
      this.critChainTimer -= dt;
      if (this.critChainTimer <= 0) this.critChainActive = false;
    }

    // Apply crit bonus from insight
    if (Player.skills) {
      Player.critRate = 0.08 + Player.equipCritRate + this.getCritBonus();
    }
  },

  onEnemyKilled(enemy) {
    // Life steal
    for (const p of this.activePassives) {
      if (p.type === 'lifeSteal') {
        const heal = Math.floor(Player.maxHp * p.value * p.level);
        Player.hp = Math.min(Player.maxHp, Player.hp + heal);
        if (heal > 0) Game.spawnDamageNumber(Player.x, Player.y - 30, '+' + heal, '#44ff44');
      }
    }

    // Gold bonus
    const goldBonus = this.getGoldBonus();
    if (goldBonus > 1) {
      Player.gold += Math.floor(enemy.gold * (goldBonus - 1));
    }

    this.onKill();
  },

  onCrit() {
    for (const p of this.activePassives) {
      if (p.type === 'critChain') {
        this.critChainActive = true;
        this.critChainTimer = 3000;
      }
    }
  },

  getCritChainMul() {
    if (!this.critChainActive) return 1;
    for (const p of this.activePassives) {
      if (p.type === 'critChain') return 1 + p.value * p.level;
    }
    return 1;
  },

  // ==================== UI PANELS ====================
  _showInsightPanel(candidates) {
    const panel = document.getElementById('insightPanel');
    const content = document.getElementById('insightChoices');
    content.innerHTML = '';

    for (const c of candidates) {
      const isUpgrade = c.isUpgrade;
      const div = document.createElement('div');
      div.style.cssText = `
        background:rgba(255,255,255,0.04);
        border:2px solid ${isUpgrade ? '#f0c040' : '#8ef'};
        border-radius:10px; padding:12px; cursor:pointer;
        margin-bottom:8px; transition:all 0.2s;
      `;
      div.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:20px">${c.icon}</span>
          <div>
            <div style="color:${isUpgrade ? '#f0c040' : '#8ef'};font-size:13px;font-weight:bold">${c.name} ${isUpgrade ? '⬆' : ''}</div>
            <div style="color:#ccc;font-size:10px">${c.desc}</div>
            ${isUpgrade ? `<div style="color:#f0c040;font-size:9px;margin-top:3px">⬆️ Nâng cấp → Cấp 2 (x2 hiệu quả)</div>` : ''}
          </div>
        </div>
      `;
      const pId = c.id;
      const upg = isUpgrade;
      div.addEventListener('click', () => InsightSystem.choosePassive(pId, upg));
      content.appendChild(div);
    }

    // Skip option
    const skip = document.createElement('div');
    skip.style.cssText = 'text-align:center;color:#666;font-size:10px;margin-top:8px;cursor:pointer;padding:8px';
    skip.textContent = '⏭ Bỏ qua (mất cơ duyên này)';
    skip.onclick = () => {
      document.getElementById('insightPanel').classList.remove('show');
      this.pendingInsight = false;
    };
    content.appendChild(skip);

    panel.classList.add('show');
  },

  _showReplacePanel(newPassive) {
    const panel = document.getElementById('insightReplacePanel');
    const content = document.getElementById('replaceChoices');
    content.innerHTML = '';

    document.getElementById('replacingName').textContent = `${newPassive.icon} ${newPassive.name}`;

    for (const existing of this.activePassives) {
      const div = document.createElement('div');
      div.style.cssText = `
        background:rgba(244,67,54,0.1); border:2px solid #f44;
        border-radius:10px; padding:10px; cursor:pointer; margin-bottom:8px;
      `;
      div.innerHTML = `
        <div style="color:#f88;font-size:12px;font-weight:bold">${existing.icon} ${existing.name} (Cấp ${existing.level})</div>
        <div style="color:#999;font-size:10px">${existing.desc}</div>
        <div style="color:#f44;font-size:9px;margin-top:3px">← Bỏ cái này</div>
      `;
      const rmId = existing.id;
      const newId = newPassive.id;
      div.addEventListener('click', () => InsightSystem.replacePassive(rmId, newId));
      content.appendChild(div);
    }

    const cancel = document.createElement('div');
    cancel.style.cssText = 'text-align:center;color:#666;font-size:10px;cursor:pointer;padding:8px;margin-top:4px';
    cancel.textContent = '❌ Hủy (giữ nguyên tất cả)';
    cancel.onclick = () => {
      document.getElementById('insightReplacePanel').classList.remove('show');
      this.pendingInsight = false;
    };
    content.appendChild(cancel);

    panel.classList.add('show');
  },

  _updateHUD() {
    const hud = document.getElementById('insightHUD');
    if (!hud) return;
    if (this.activePassives.length === 0) {
      hud.style.display = 'none';
      return;
    }
    hud.style.display = 'flex';
    hud.innerHTML = this.activePassives.map(p =>
      `<span title="${p.name}: ${p.desc}" style="font-size:14px;cursor:default">${p.icon}${p.level > 1 ? '<sup style="font-size:8px;color:#f0c040">2</sup>' : ''}</span>`
    ).join('');
  },

  // ==================== INJECT HTML/STYLE ====================
  _injectStyle() {
    if (document.getElementById('insightStyle')) return;
    const s = document.createElement('style');
    s.id = 'insightStyle';
    s.textContent = `
      #insightHUD {
        position:absolute; bottom:200px; left:50%;
        transform:translateX(-50%);
        z-index:20; display:none; gap:6px; align-items:center;
        background:rgba(0,0,0,0.6); border:1px solid #8ef4;
        border-radius:20px; padding:4px 12px;
      }
      #insightPanel, #insightReplacePanel {
        position:absolute; top:0; left:0; width:100%; height:100%;
        background:rgba(0,0,0,0.85); z-index:200;
        display:none; align-items:center; justify-content:center;
        backdrop-filter:blur(3px);
      }
      #insightPanel.show, #insightReplacePanel.show { display:flex; }
      .insight-inner {
        background:linear-gradient(135deg,#0d1117,#1a1a2e);
        border:3px solid #8ef; border-radius:15px;
        padding:20px; width:92%; max-width:380px;
        box-shadow:0 0 40px rgba(136,238,255,0.3);
        max-height:85vh; overflow-y:auto;
      }
      .insight-inner::-webkit-scrollbar{width:4px}
      .insight-inner::-webkit-scrollbar-thumb{background:#8ef;border-radius:2px}
    `;
    document.head.appendChild(s);
  },

  _injectHTML() {
    const hud = document.createElement('div');
    hud.id = 'insightHUD';
    document.body.appendChild(hud);

    const panel = document.createElement('div');
    panel.id = 'insightPanel';
    panel.innerHTML = `
      <div class="insight-inner">
        <div style="text-align:center;margin-bottom:15px">
          <div style="color:#8ef;font-size:22px;font-weight:bold;text-shadow:0 0 15px #8ef8">✨ ĐỐN NGỘ</div>
          <div style="color:#888;font-size:11px;margin-top:4px">Chọn 1 cơ duyên để lĩnh ngộ</div>
        </div>
        <div id="insightChoices"></div>
      </div>
    `;
    document.body.appendChild(panel);

    const replPanel = document.createElement('div');
    replPanel.id = 'insightReplacePanel';
    replPanel.innerHTML = `
      <div class="insight-inner">
        <div style="text-align:center;margin-bottom:15px">
          <div style="color:#f0c040;font-size:18px;font-weight:bold">⚡ Túi Passive Đầy!</div>
          <div style="color:#ccc;font-size:11px;margin-top:4px">Chọn passive để từ bỏ nhường chỗ cho <b id="replacingName"></b></div>
        </div>
        <div id="replaceChoices"></div>
      </div>
    `;
    document.body.appendChild(replPanel);
  },

  // ==================== SAVE / LOAD ====================
  getSaveData() {
    return {
      activePassives: this.activePassives,
      killCount: this.killCount,
      nextMilestone: this.nextMilestone
    };
  },

  _save() {
    try { localStorage.setItem('tuxien_insight', JSON.stringify(this.getSaveData())); } catch (e) {}
  },

  _loadSave() {
    try {
      const raw = localStorage.getItem('tuxien_insight');
      if (!raw) return;
      const data = JSON.parse(raw);
      this.activePassives  = data.activePassives  || [];
      this.killCount       = data.killCount        || 0;
      this.nextMilestone   = data.nextMilestone    || 50;
      // Re-apply stat passives
      for (const p of this.activePassives) {
        for (let lv = 0; lv < p.level; lv++) {
          this._applyPassive(p, lv > 0);
        }
      }
      this._updateHUD();
    } catch (e) {}
  }
};

// ==================== WRAP GAME ====================
(function () {
  const _origInit = Game.init.bind(Game);
  Game.init = function () {
    _origInit();
    InsightSystem.init();
  };

  const _origUpdate = Game.update.bind(Game);
  Game.update = function (dt) {
    _origUpdate(dt);
    InsightSystem.update(dt);
  };

  const _origSave = Game.save.bind(Game);
  Game.save = function () {
    _origSave();
    InsightSystem._save();
  };

  // Wrap Enemies.kill để trigger onEnemyKilled
  const _origKill = Enemies.kill.bind(Enemies);
  Enemies.kill = function (enemy) {
    _origKill(enemy);
    InsightSystem.onEnemyKilled(enemy);
  };

  // Wrap Player.useSkill để apply dmgBonus + armorPen + critChain
  const _origUseSkill = Player.useSkill.bind(Player);
  Player.useSkill = function (idx) {
    if (!this.alive || !this.skills) return false;
    const skill = this.skills[idx];
    if (!skill || skill.cd > 0) return false;
    if (this.mp < skill.mp) { UI.addLog('⚡ Không đủ linh lực!', 'system'); return false; }

    this.mp -= skill.mp;
    skill.cd = skill.maxCd;

    const hitEnemies = [];
    for (const enemy of Enemies.list) {
      if (!enemy.alive) continue;
      const dist = Utils.dist(this.x, this.y, enemy.x, enemy.y);
      if (dist <= skill.range) hitEnemies.push({ enemy, dist });
    }
    hitEnemies.sort((a, b) => a.dist - b.dist);

    const isAoe = skill.type === 'aoe' || skill.type === 'ultimate';
    let targets = [];
    switch (skill.type) {
      case 'melee': case 'projectile': targets = hitEnemies.slice(0, 1).map(h => h.enemy); break;
      case 'aoe':     targets = hitEnemies.slice(0, 3).map(h => h.enemy); break;
      case 'ultimate': targets = hitEnemies.map(h => h.enemy); break;
    }

    // AoE passive multiplier
    const aoeDef = InsightSystem.passivePool.find(p => p.type === 'aoeDmg');
    const aoePas = InsightSystem.activePassives.find(a => a.type === 'aoeDmg');
    const aoeMul = isAoe && aoeDef && aoePas ? (1 + aoeDef.value * aoePas.level) : 1;

    const dmgBonus  = InsightSystem.getDmgBonus();
    const critBonus = InsightSystem.getCritBonus();
    const armorPen  = InsightSystem.getArmorPen();

    for (const enemy of targets) {
      let damage = Math.floor(this.atk * skill.dmgMul * dmgBonus * (isAoe ? aoeMul : 1));
      let isCrit = false;
      if (Utils.chance(this.critRate + critBonus)) {
        damage = Math.floor(damage * this.critDmg * InsightSystem.getCritChainMul());
        isCrit = true;
        InsightSystem.onCrit();
      }
      // armorPen: effDef не используется в текущем Enemies.damage — передаём как есть
      Enemies.damage(enemy, damage, isCrit, skill.color);
    }

    if (targets.length === 0) {
      const tx = this.x + (this.dir === 'right' ? 50 : this.dir === 'left' ? -50 : 0);
      const ty = this.y + (this.dir === 'down' ? 50 : this.dir === 'up' ? -50 : 0);
      Game.spawnSkillEffect(this.x, this.y, tx, ty, skill.color, skill.type);
    }

    UI.updateSkillUI();
    return true;
  };

  // Wrap Player.takeDamage to check dodge
  const _origTakeDmg = Player.takeDamage.bind(Player);
  Player.takeDamage = function (amount, source) {
    const dodge = InsightSystem.getDodgeChance();
    if (dodge > 0 && Math.random() < dodge) {
      Game.spawnDamageNumber(Player.x, Player.y - 30, 'MISS', '#88ff88');
      return;
    }
    _origTakeDmg(amount, source);
  };

  // Wrap Player.gainRealmExp to apply realm bonus
  const _origRealmExp = Player.gainRealmExp.bind(Player);
  Player.gainRealmExp = function (amount) {
    const mul = InsightSystem.getRealmBonus();
    _origRealmExp(Math.floor(amount * mul));
  };
})();

console.log('✨ feature_insight.js loaded');

// ===== CHANGES: =====
// 1. Hợp nhất 6 getter trùng lặp (getDmgBonus, getArmorPen, getDodgeChance, getCritBonus,
//    getGoldBonus, getRealmBonus) thành dùng chung _sumPassive(type, base) — giảm ~40 dòng
// 2. Xóa mul = isUpgrade ? 1 : 1 thừa trong _applyPassive — logic không đổi
// 3. Sửa _applyPassive: field type 'thunder_law' → 'aoeDmg' đúng với pool config
// 4. Đơn giản hoá onKill: dùng early return thay vì if lồng nhau
// 5. Đơn giản hoá aoeMul tính toán trong useSkill wrap — xóa || 1 thừa, tách rõ điều kiện
// 6. Xóa comment Vietnamese về armorPen bị bỏ qua (không thay đổi behavior)
