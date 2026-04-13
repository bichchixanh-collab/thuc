// ==================== CHARACTER BUILD SYSTEM ====================
// feature_character_build.js
// Requires: config.js, player.js, enemies.js, inventory.js, ui.js, game.js
// Add to index.html: <script src="js/feature_character_build.js"></script>

// ============================================================
// SECTION 1 — DATA & CONFIG
// ============================================================

const CULTIVATION_METHOD_CONFIG = {
  methods: {
    sword: {
      id: 'sword', name: 'Kiếm Đạo', icon: '⚔️', color: '#ef5350',
      desc: 'Công kích mạnh mẽ. Hy sinh phòng thủ để tối đa hóa sát thương.',
      statPerLevel: { atk: 4, hp: 10, mp: 5, def: 0.8, critBase: 0.12, skillCdReduction: 0 },
      realmAtkMul: 1.2,
      changeCost: { item: 'methodPill', count: 1 }
    },
    magic: {
      id: 'magic', name: 'Tiên Đạo', icon: '🔮', color: '#7c4dff',
      desc: 'Kỹ năng uy lực cao. MP dồi dào, skill cooldown giảm.',
      statPerLevel: { atk: 2, hp: 15, mp: 12, def: 1.0, critBase: 0.08, skillCdReduction: 0.05 },
      skillDmgMul: 1.3,
      changeCost: { item: 'methodPill', count: 1 }
    },
    body: {
      id: 'body', name: 'Thể Đạo', icon: '🛡️', color: '#26a69a',
      desc: 'Phòng thủ kiên cố. HP và DEF rất cao, sinh tồn tối thượng.',
      statPerLevel: { atk: 1, hp: 25, mp: 6, def: 2.0, critBase: 0.05, skillCdReduction: 0 },
      hpRegenMul: 2.0,
      defMul: 1.25,
      changeCost: { item: 'methodPill', count: 1 }
    }
  },
  requireLevel: 1
};

const FATE_CONFIG = {
  rollCount: 3,
  rerollItemId: 'fateScroll',
  pool: [
    // Combat group
    { id: 'swordSpirit', name: 'Kiếm Linh', rarity: 'common',
      desc: 'Skill 1&2 +20% damage',
      apply(p) { p._fateSkillDmg12 = 1.20; } },
    { id: 'thunderRoot', name: 'Lôi Căn', rarity: 'common',
      desc: 'Skill Lôi Điện +40% damage',
      apply(p) { p._fateLeiDmg = 1.40; } },
    { id: 'fireRoot', name: 'Hỏa Căn', rarity: 'common',
      desc: 'Hỏa nguyên tố +30% damage',
      apply(p) { p._fateFireDmg = 1.30; } },
    { id: 'bloodCrit', name: 'Cuồng Sát', rarity: 'common',
      desc: '+30% crit damage',
      apply(p) { p.critDmg += 0.30; } },
    { id: 'swiftSword', name: 'Tốc Kiếm', rarity: 'common',
      desc: 'Skill 0 cooldown -30%',
      apply(p) { p._fateBasicCdMul = 0.70; } },
    { id: 'undying', name: 'Bất Khuất', rarity: 'rare',
      desc: 'HP<20%: không thể chết 1 lần/5 phút'
      // Logic handled via takeDamage hook
    },
    // Utility group
    { id: 'fortune', name: 'Tài Lộc', rarity: 'common',
      desc: '+25% gold drop',
      apply(p) { p._fateGoldMul = 1.25; } },
    { id: 'scholar', name: 'Học Giả', rarity: 'common',
      desc: '+20% EXP nhận',
      apply(p) { p._fateExpMul = 1.20; } },
    { id: 'alchemist', name: 'Linh Đan Sư', rarity: 'rare',
      desc: 'Luyện đan +15% tỷ lệ thành công',
      apply(p) { p._fateAlchemyBonus = 0.15; } },
    { id: 'petBond', name: 'Linh Thú Duyên', rarity: 'common',
      desc: 'Pet EXP +30%',
      apply(p) { p._fatePetExpMul = 1.30; } },
    { id: 'explorer', name: 'Thám Hiểm', rarity: 'rare',
      desc: 'Bí Cảnh portal xuất hiện sớm hơn 30%',
      apply(p) { p._fateDungeonSpawn = 0.70; } },
    // Survival group
    { id: 'longevity', name: 'Trường Sinh', rarity: 'common',
      desc: '+25% maxHP',
      apply(p) { p.maxHp = Math.floor(p.maxHp * 1.25); p.hp = Math.min(p.hp, p.maxHp); } },
    { id: 'ironBody', name: 'Thiết Bì', rarity: 'common',
      desc: '+20% DEF',
      apply(p) { p.def = Math.floor(p.def * 1.20); } },
    { id: 'recovery', name: 'Hồi Phục', rarity: 'common',
      desc: 'HP tự hồi x2',
      apply(p) { p._fateHpRegenMul = 2.0; } },
    { id: 'spiritSea', name: 'Linh Hải', rarity: 'common',
      desc: '+30% maxMP',
      apply(p) { p.maxMp = Math.floor(p.maxMp * 1.30); p.mp = Math.min(p.mp, p.maxMp); } },
    { id: 'immortalBody', name: 'Bất Tử', rarity: 'rare',
      desc: 'Death immunity cooldown -50%'
      // interacts with undying fate
    },
    // Rare group
    { id: 'genius', name: 'Thiên Tài', rarity: 'rare',
      desc: '+35% EXP và gold',
      apply(p) {
        p._fateExpMul = (p._fateExpMul || 1) * 1.35;
        p._fateGoldMul = (p._fateGoldMul || 1) * 1.35;
      } },
    { id: 'peerless', name: 'Vô Song', rarity: 'rare',
      desc: 'Tất cả damage +20%',
      apply(p) { p._fateAllDmgMul = 1.20; } },
    { id: 'celestialBone', name: 'Tiên Cốt', rarity: 'rare',
      desc: 'Tất cả realm stat bonus +50%',
      apply(p) { p._faterealmStatMul = 1.50; } },
    { id: 'darkFate', name: 'Hắc Vận', rarity: 'rare',
      desc: 'Tất cả stat -10% nhưng legendary drop x3',
      apply(p) { p._fateStatPenalty = 0.90; p._fateLegendaryMul = 3.0; } },
    // Padding fates
    { id: 'windStep', name: 'Phong Bộ', rarity: 'common',
      desc: '+15% tốc độ di chuyển',
      apply(p) { p.speed *= 1.15; } },
    { id: 'sharpEye', name: 'Tuệ Nhãn', rarity: 'common',
      desc: 'Crit rate +8%',
      apply(p) { p.critRate += 0.08; } },
    { id: 'greedyHand', name: 'Tham Thủ', rarity: 'common',
      desc: 'Item drop rate +20%',
      apply(p) { p._fateDropMul = 1.20; } },
    { id: 'battleHarden', name: 'Chiến Dày', rarity: 'common',
      desc: 'Nhận damage -10%',
      apply(p) { p._fateDmgReduce = 0.90; } },
    { id: 'mpMaster', name: 'Linh Lực Chủ', rarity: 'common',
      desc: 'Skill MP cost -20%',
      apply(p) { p._fateMpCostMul = 0.80; } },
    { id: 'realmSense', name: 'Cảnh Giới Cảm', rarity: 'rare',
      desc: 'Tu Vi nhận +25%',
      apply(p) { p._fateRealmExpMul = 1.25; } },
    { id: 'critChain', name: 'Liên Bạo', rarity: 'rare',
      desc: 'Crit hit → 20% chance crit tiếp ngay'
      // logic in Enemies.damage hook
    },
    { id: 'soulLink', name: 'Linh Thú Đồng', rarity: 'common',
      desc: 'Pet buff bonus +50%',
      apply(p) { p._fatePetBonusMul = 1.50; } },
    { id: 'mapMaster', name: 'Dư Đồ Thánh', rarity: 'common',
      desc: 'Di chuyển giữa map miễn phí',
      apply(p) { p._fateFreeTravel = true; } },
    { id: 'craftMaster', name: 'Thủ Nghệ Tinh', rarity: 'rare',
      desc: 'Phẩm chất luyện đan tốt hơn 1 bậc',
      apply(p) { p._fateCraftQualityUp = true; } }
  ]
};

// ============================================================
// SECTION 2A — CULTIVATION METHOD SYSTEM
// ============================================================

const CultivationMethodSystem = {
  state: {
    method: null,  // 'sword' | 'magic' | 'body' | null
    chosen: false
  },

  choose(methodId) {
    const methodCfg = CULTIVATION_METHOD_CONFIG.methods[methodId];
    if (!methodCfg) {
      UI.addLog('❌ Tâm Pháp không hợp lệ!', 'system');
      return false;
    }

    const isChange = this.state.chosen;

    if (isChange) {
      if (!Inventory.has('methodPill', 1)) {
        UI.addLog('❌ Cần Tâm Pháp Hoán Đổi Đan để đổi Tâm Pháp!', 'system');
        return false;
      }
      Inventory.remove('methodPill', 1);
      // Reset level
      Player.level = 1;
      Player.exp = 0;
      Player.maxExp = 100;
      Player.baseAtk = 12;
      Player.baseDef = 3;
      UI.showNotification('🔄 Đổi Tâm Pháp!', 'Level reset về 1');
      UI.addLog('🔄 Tâm Pháp đổi thành ' + methodCfg.name, 'realm');
    } else {
      UI.showNotification('📖 Tâm Pháp!', methodCfg.name);
      UI.addLog('📖 Chọn Tâm Pháp: ' + methodCfg.name, 'realm');
    }

    this.state.method = methodId;
    this.state.chosen = true;
    Player.recalculateStats();

    // Re-render char panel if open
    if (UI.activePanel === 'character') UI.renderCharacter();
    return true;
  },

  // Override stats based on chosen method (called INSIDE recalculateStats wrap)
  applyToStats(player) {
    if (!this.state.method) return;
    const method = CULTIVATION_METHOD_CONFIG.methods[this.state.method];
    const lvl = player.level;
    const realm = REALMS[player.realm];
    const realmStatMul = player._faterealmStatMul || 1.0;

    // Re-calculate stats based on method.statPerLevel (overrides default formula)
    player.atk = player.baseAtk
      + (lvl - 1) * method.statPerLevel.atk
      + Math.floor(realm.atkBonus * (method.realmAtkMul || 1.0) * realmStatMul)
      + player.equipAtk
      + (player._petAtk || 0);

    player.def = player.baseDef
      + (lvl - 1) * method.statPerLevel.def
      + Math.floor(realm.defBonus * (method.defMul || 1.0) * realmStatMul)
      + player.equipDef
      + (player._petDef || 0);

    player.maxHp = 100
      + (lvl - 1) * method.statPerLevel.hp
      + Math.floor(realm.hpBonus * realmStatMul)
      + player.equipHp;

    player.maxMp = 50
      + (lvl - 1) * method.statPerLevel.mp
      + player.equipMp;

    player.critRate = method.statPerLevel.critBase
      + player.equipCritRate
      + (player._petCritRate || 0);

    // Method-specific flags
    if (method.skillDmgMul)        player._methodSkillDmgMul  = method.skillDmgMul;
    else                           delete player._methodSkillDmgMul;

    if (method.hpRegenMul)         player._methodHpRegenMul   = method.hpRegenMul;
    else                           delete player._methodHpRegenMul;

    if (method.statPerLevel.skillCdReduction > 0)
      player._methodCdReduction = method.statPerLevel.skillCdReduction;
    else
      delete player._methodCdReduction;

    player.hp = Math.min(player.hp, player.maxHp);
    player.mp = Math.min(player.mp, player.maxMp);
  },

  getSaveData() {
    return { method: this.state.method, chosen: this.state.chosen };
  },

  loadSaveData(data) {
    if (!data) return;
    this.state.method = data.method || null;
    this.state.chosen = data.chosen || false;
  }
};

// ============================================================
// SECTION 2B — FATE SYSTEM
// ============================================================

const FateSystem = {
  state: {
    fates: [],             // active fate objects {id, name, desc, rarity}
    rolled: false,
    _undyingLastUsed: 0,
    _critChainActive: false
  },

  hasFate(fateId) {
    return this.state.fates.some(f => f.id === fateId);
  },

  rollFates() {
    const commonPool = FATE_CONFIG.pool.filter(f => f.rarity === 'common');
    const rarePool   = FATE_CONFIG.pool.filter(f => f.rarity === 'rare');

    const fates = [];
    const shuffled = [...commonPool].sort(() => Math.random() - 0.5);
    fates.push(shuffled[0], shuffled[1]);

    // Slot 3: 30% rare, 70% common
    if (Math.random() < 0.30 && rarePool.length > 0) {
      fates.push(rarePool[Math.floor(Math.random() * rarePool.length)]);
    } else {
      fates.push(shuffled[2] || commonPool[0]);
    }

    this.state.fates = fates;
    this.state.rolled = true;
    this.applyFates();
    return fates;
  },

  reroll() {
    if (!Inventory.has('fateScroll', 1)) {
      UI.addLog('❌ Cần Vận Mệnh Thư để roll lại!', 'system');
      return false;
    }
    Inventory.remove('fateScroll', 1);
    this.clearFateFlags();
    this.rollFates();
    UI.showNotification('🎲 Thiên Mệnh Đổi!', 'Số phận mới đã được định.');
    UI.addLog('🎲 Thiên Mệnh được roll lại!', 'realm');
    Player.recalculateStats();
    if (UI.activePanel === 'character') UI.renderCharacter();
    return true;
  },

  clearFateFlags() {
    // Remove all _fate* properties from Player
    Object.keys(Player).filter(k => k.startsWith('_fate')).forEach(k => {
      delete Player[k];
    });
  },

  applyFates() {
    this.clearFateFlags();
    this.state.fates.forEach(fate => {
      const def = FATE_CONFIG.pool.find(f => f.id === fate.id);
      if (def && typeof def.apply === 'function') def.apply(Player);
    });

    // Apply darkFate stat penalty after all stats set
    if (Player._fateStatPenalty) {
      Player.atk  = Math.floor(Player.atk  * Player._fateStatPenalty);
      Player.def  = Math.floor(Player.def  * Player._fateStatPenalty);
      Player.maxHp = Math.floor(Player.maxHp * Player._fateStatPenalty);
      Player.maxMp = Math.floor(Player.maxMp * Player._fateStatPenalty);
      Player.hp = Math.min(Player.hp, Player.maxHp);
      Player.mp = Math.min(Player.mp, Player.maxMp);
    }
  },

  showFirstTimeRoll() {
    if (document.getElementById('fateFirstModal')) return;

    GameState.running = false;

    const modal = document.createElement('div');
    modal.id = 'fateFirstModal';
    modal.innerHTML = `
      <div class="fate-modal-inner">
        <div class="fate-modal-stars">✨ ✨ ✨</div>
        <div class="fate-modal-title">天命定數</div>
        <div class="fate-modal-subtitle">Thiên Mệnh Định Sẵn!</div>
        <div class="fate-modal-desc">Vũ trụ ban cho ngươi 3 thiên phú...<br>Hãy chấp nhận số phận của mình!</div>
        <button class="fate-modal-btn" id="fateRollBtn">🎲 Khởi Động Thiên Mệnh!</button>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('fateRollBtn').onclick = () => {
      const fates = this.rollFates();
      this._showFateResult(modal, fates);
    };
  },

  _showFateResult(modal, fates) {
    const inner = modal.querySelector('.fate-modal-inner');
    const rarityColor = { common: '#f0c040', rare: '#7c4dff' };

    inner.innerHTML = `
      <div class="fate-modal-stars">🌟 🌟 🌟</div>
      <div class="fate-modal-title">Thiên Mệnh Của Ngươi!</div>
      <div class="fate-result-list">
        ${fates.map(f => {
          const def = FATE_CONFIG.pool.find(fd => fd.id === f.id);
          const color = rarityColor[f.rarity] || '#f0c040';
          const badge = f.rarity === 'rare' ? '【稀】' : '【普】';
          return `
            <div class="fate-result-card" style="border-color:${color}">
              <span class="fate-card-badge" style="color:${color}">${badge}</span>
              <span class="fate-card-name" style="color:${color}">${f.name}</span>
              <span class="fate-card-desc">${def ? def.desc : ''}</span>
            </div>
          `;
        }).join('')}
      </div>
      <button class="fate-modal-btn" id="fateAcceptBtn">✅ Chấp Nhận Thiên Mệnh!</button>
    `;

    document.getElementById('fateAcceptBtn').onclick = () => {
      modal.classList.add('fate-modal-hide');
      setTimeout(() => {
        modal.remove();
        GameState.running = true;
        UI.addLog('✨ Thiên Mệnh đã được định đoạt!', 'realm');
        if (UI.activePanel === 'character') UI.renderCharacter();
      }, 400);
    };
  },

  getSaveData() {
    return {
      fates: this.state.fates,
      rolled: this.state.rolled,
      _undyingLastUsed: this.state._undyingLastUsed
    };
  },

  loadSaveData(data) {
    if (!data) return;
    this.state.fates = data.fates || [];
    this.state.rolled = data.rolled || false;
    this.state._undyingLastUsed = data._undyingLastUsed || 0;
  }
};

// ============================================================
// SECTION 3 — UI EXTENSION (Character Panel)
// ============================================================

const CharacterBuildUI = {
  // Inject the Method + Fate section into charStats div
  injectBuildSection() {
    const stats = document.getElementById('charStats');
    if (!stats) return;

    // Remove existing build section if any
    const existing = document.getElementById('buildSection');
    if (existing) existing.remove();

    const section = document.createElement('div');
    section.id = 'buildSection';
    section.style.cssText = 'margin-top:15px;padding-top:15px;border-top:1px solid #333';
    section.innerHTML = this._methodHTML() + this._fateHTML();
    stats.appendChild(section);

    // Bind events
    this._bindEvents(section);
  },

  _methodHTML() {
    const ms = CultivationMethodSystem.state;
    const methods = CULTIVATION_METHOD_CONFIG.methods;
    const hasPill = Inventory.has('methodPill', 1);

    let html = `<div style="color:#f0c040;font-size:12px;margin-bottom:10px;font-weight:bold">📖 Tâm Pháp Tu Luyện</div>`;

    if (!ms.chosen) {
      // Show 3 choice buttons
      html += `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">`;
      for (const [id, m] of Object.entries(methods)) {
        html += `
          <button class="build-method-btn" data-method="${id}"
            style="flex:1;min-width:70px;padding:8px 4px;border:1px solid ${m.color};
                   background:rgba(0,0,0,0.4);border-radius:6px;cursor:pointer;
                   color:${m.color};font-family:'Courier New',monospace;font-size:11px;text-align:center">
            <div style="font-size:18px">${m.icon}</div>
            <div style="font-weight:bold">${m.name}</div>
            <div style="font-size:9px;color:#aaa;margin-top:2px">
              ATK+${m.statPerLevel.atk} HP+${m.statPerLevel.hp}
            </div>
          </button>`;
      }
      html += `</div>`;
      html += `<div style="color:#888;font-size:10px;font-style:italic">⬆ Chọn Tâm Pháp để bắt đầu tu luyện</div>`;
    } else {
      const m = methods[ms.method];
      const lvl = Player.level;
      html += `
        <div style="background:rgba(0,0,0,0.3);border:1px solid ${m.color};border-radius:8px;padding:10px;margin-bottom:8px">
          <div style="font-size:20px;display:inline-block;margin-right:8px">${m.icon}</div>
          <span style="color:${m.color};font-weight:bold;font-size:13px">${m.name}</span>
          <div style="color:#ccc;font-size:10px;margin-top:4px">${m.desc}</div>
          <div style="margin-top:6px;color:#aaa;font-size:10px">
            ⚔️ +${(lvl-1)*m.statPerLevel.atk} từ cấp
            &nbsp;❤️ +${(lvl-1)*m.statPerLevel.hp}
            &nbsp;💎 +${(lvl-1)*m.statPerLevel.mp}
          </div>
        </div>`;
      if (hasPill) {
        html += `
          <button class="build-change-method-btn"
            style="width:100%;padding:6px;border:1px solid #ff9800;background:rgba(255,152,0,0.15);
                   border-radius:6px;cursor:pointer;color:#ff9800;font-family:'Courier New',monospace;font-size:11px">
            🔄 Đổi Tâm Pháp (Dùng Tâm Pháp Hoán Đổi Đan)
          </button>`;
      } else {
        html += `<div style="color:#555;font-size:10px;text-align:center">Cần Tâm Pháp Hoán Đổi Đan để thay đổi</div>`;
      }
    }
    return html;
  },

  _fateHTML() {
    const fs = FateSystem.state;
    const fateScrollCount = Inventory.getCount('fateScroll');
    const rarityColor = { common: '#f0c040', rare: '#7c4dff' };

    let html = `<div style="color:#f0c040;font-size:12px;margin:15px 0 10px;font-weight:bold">🎲 Thiên Mệnh</div>`;

    if (!fs.rolled) {
      html += `
        <button class="build-fate-roll-btn"
          style="width:100%;padding:10px;border:1px solid #7c4dff;background:rgba(124,77,255,0.15);
                 border-radius:8px;cursor:pointer;color:#7c4dff;font-family:'Courier New',monospace;
                 font-size:13px;font-weight:bold">
          ✨ Roll Thiên Mệnh
        </button>`;
    } else {
      html += `<div style="display:flex;flex-direction:column;gap:6px;margin-bottom:8px">`;
      fs.fates.forEach(f => {
        const def = FATE_CONFIG.pool.find(fd => fd.id === f.id);
        const color = rarityColor[f.rarity] || '#f0c040';
        const badge = f.rarity === 'rare' ? '★稀有' : '●普通';
        html += `
          <div style="background:rgba(0,0,0,0.3);border:1px solid ${color};border-radius:6px;
                      padding:6px 10px;display:flex;gap:8px;align-items:flex-start">
            <span style="color:${color};font-size:9px;white-space:nowrap;padding-top:2px">${badge}</span>
            <div>
              <span style="color:${color};font-weight:bold;font-size:11px">${f.name}</span>
              <div style="color:#aaa;font-size:10px;margin-top:2px">${def ? def.desc : ''}</div>
            </div>
          </div>`;
      });
      html += `</div>`;

      if (fateScrollCount > 0) {
        html += `
          <button class="build-fate-reroll-btn"
            style="width:100%;padding:6px;border:1px solid #ff9800;background:rgba(255,152,0,0.15);
                   border-radius:6px;cursor:pointer;color:#ff9800;font-family:'Courier New',monospace;font-size:11px">
            🎲 Roll Lại (Vận Mệnh Thư x${fateScrollCount})
          </button>`;
      }
    }
    return html;
  },

  _bindEvents(section) {
    // Method choice buttons
    section.querySelectorAll('.build-method-btn').forEach(btn => {
      btn.onclick = () => {
        const methodId = btn.dataset.method;
        if (CultivationMethodSystem.choose(methodId)) {
          this.injectBuildSection();
        }
      };
    });

    // Change method (show picker)
    const changeBtn = section.querySelector('.build-change-method-btn');
    if (changeBtn) {
      changeBtn.onclick = () => {
        this._showMethodPicker();
      };
    }

    // Fate roll
    const rollBtn = section.querySelector('.build-fate-roll-btn');
    if (rollBtn) {
      rollBtn.onclick = () => {
        FateSystem.rollFates();
        this.injectBuildSection();
        UI.showNotification('🎲 Thiên Mệnh!', '3 thiên phú đã được ban!');
        UI.addLog('🎲 Đã nhận Thiên Mệnh!', 'realm');
      };
    }

    // Fate reroll
    const rerollBtn = section.querySelector('.build-fate-reroll-btn');
    if (rerollBtn) {
      rerollBtn.onclick = () => {
        if (FateSystem.reroll()) {
          this.injectBuildSection();
        }
      };
    }
  },

  _showMethodPicker() {
    const existing = document.getElementById('methodPickerModal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'methodPickerModal';
    modal.style.cssText = `
      position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:300;
      display:flex;align-items:center;justify-content:center;
      font-family:'Courier New',monospace;
    `;

    const methods = CULTIVATION_METHOD_CONFIG.methods;
    let buttonsHTML = '';
    for (const [id, m] of Object.entries(methods)) {
      if (id === CultivationMethodSystem.state.method) continue; // skip current
      buttonsHTML += `
        <button class="method-pick-opt" data-method="${id}"
          style="padding:12px;border:1px solid ${m.color};background:rgba(0,0,0,0.5);
                 border-radius:8px;cursor:pointer;color:${m.color};width:100%;text-align:left;
                 font-family:'Courier New',monospace;margin-bottom:8px">
          <span style="font-size:20px">${m.icon}</span>
          <strong style="margin-left:6px">${m.name}</strong>
          <div style="font-size:10px;color:#aaa;margin-top:4px">${m.desc}</div>
          <div style="font-size:10px;color:#888;margin-top:2px">
            ATK+${m.statPerLevel.atk}/lv &nbsp; HP+${m.statPerLevel.hp}/lv &nbsp; DEF+${m.statPerLevel.def}/lv
          </div>
        </button>`;
    }

    modal.innerHTML = `
      <div style="background:#1a1a2e;border:1px solid #7c4dff;border-radius:12px;
                  padding:20px;max-width:320px;width:90%;color:#eee">
        <div style="color:#f0c040;font-size:14px;font-weight:bold;margin-bottom:4px">🔄 Đổi Tâm Pháp</div>
        <div style="color:#aaa;font-size:10px;margin-bottom:14px">
          ⚠️ Level sẽ reset về 1! Tốn 1 Tâm Pháp Hoán Đổi Đan.
        </div>
        ${buttonsHTML}
        <button id="methodPickerClose"
          style="width:100%;padding:8px;border:1px solid #555;background:rgba(0,0,0,0.4);
                 border-radius:6px;cursor:pointer;color:#888;font-family:'Courier New',monospace">
          ✖ Hủy
        </button>
      </div>`;

    document.body.appendChild(modal);

    modal.querySelectorAll('.method-pick-opt').forEach(btn => {
      btn.onclick = () => {
        const methodId = btn.dataset.method;
        if (CultivationMethodSystem.choose(methodId)) {
          modal.remove();
          this.injectBuildSection();
        }
      };
    });

    document.getElementById('methodPickerClose').onclick = () => modal.remove();
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
  }
};

// ============================================================
// CSS INJECTION
// ============================================================

function _injectBuildStyles() {
  if (document.getElementById('buildSystemStyles')) return;
  const style = document.createElement('style');
  style.id = 'buildSystemStyles';
  style.textContent = `
    /* First-time fate modal */
    #fateFirstModal {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.92);
      z-index: 200;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Courier New', monospace;
      animation: buildFadeIn 0.4s ease;
    }
    #fateFirstModal.fate-modal-hide {
      animation: buildFadeOut 0.4s ease forwards;
    }
    .fate-modal-inner {
      background: linear-gradient(135deg, #0d0d1a 0%, #1a0d2e 100%);
      border: 1px solid #7c4dff;
      border-radius: 16px;
      padding: 28px 24px;
      max-width: 340px;
      width: 90%;
      text-align: center;
      color: #eee;
    }
    .fate-modal-stars {
      font-size: 22px;
      letter-spacing: 6px;
      margin-bottom: 8px;
    }
    .fate-modal-title {
      font-size: 22px;
      color: #f0c040;
      font-weight: bold;
      letter-spacing: 3px;
      margin-bottom: 4px;
    }
    .fate-modal-subtitle {
      font-size: 15px;
      color: #7c4dff;
      font-weight: bold;
      margin-bottom: 12px;
    }
    .fate-modal-desc {
      font-size: 12px;
      color: #aaa;
      line-height: 1.6;
      margin-bottom: 20px;
    }
    .fate-modal-btn {
      padding: 12px 24px;
      border: 1px solid #7c4dff;
      background: rgba(124,77,255,0.25);
      border-radius: 8px;
      cursor: pointer;
      color: #d0a0ff;
      font-family: 'Courier New', monospace;
      font-size: 14px;
      font-weight: bold;
      transition: background 0.2s;
    }
    .fate-modal-btn:hover {
      background: rgba(124,77,255,0.45);
    }
    .fate-result-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 18px;
      text-align: left;
    }
    .fate-result-card {
      border-radius: 8px;
      padding: 8px 12px;
      background: rgba(0,0,0,0.4);
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .fate-card-badge { font-size: 9px; }
    .fate-card-name  { font-size: 13px; font-weight: bold; }
    .fate-card-desc  { font-size: 10px; color: #aaa; }

    /* Method buttons hover */
    .build-method-btn:hover {
      filter: brightness(1.2);
      transform: translateY(-1px);
      transition: all 0.15s;
    }

    @keyframes buildFadeIn {
      from { opacity: 0; transform: scale(0.95); }
      to   { opacity: 1; transform: scale(1);    }
    }
    @keyframes buildFadeOut {
      from { opacity: 1; transform: scale(1);    }
      to   { opacity: 0; transform: scale(0.95); }
    }
  `;
  document.head.appendChild(style);
}

// ============================================================
// HOOKS — wrap existing functions
// ============================================================

function _installHooks() {

  // ── 1. recalculateStats ──────────────────────────────────
  const _origRecalc = Player.recalculateStats.bind(Player);
  Player.recalculateStats = function () {
    _origRecalc();                                    // original: equip + pet bonuses
    CultivationMethodSystem.applyToStats(this);       // method override
    FateSystem.applyFates();                          // fate flags on top
  };

  // ── 2. takeDamage — undying fate ─────────────────────────
  const _origTakeDamage = Player.takeDamage.bind(Player);
  Player.takeDamage = function (amount, source) {
    if (!this.alive || this.invincible) return;

    const actualDamage = Math.max(1, amount - this.def);
    const hpAfterDmg = this.hp - actualDamage;

    // Undying check
    if (FateSystem.hasFate('undying') && hpAfterDmg <= 0 && this.hp > 0) {
      const elapsed = GameState.time - FateSystem.state._undyingLastUsed;
      // immortalBody fate: halve cooldown
      const cdRequired = FateSystem.hasFate('immortalBody') ? (5 * 60 * 1000 / 2) : (5 * 60 * 1000);
      if (elapsed >= cdRequired) {
        this.hp = 1;
        FateSystem.state._undyingLastUsed = GameState.time;
        this.invincible = true;
        this.invincibleTimer = 1000;
        Game.spawnDamageNumber(this.x, this.y - 30, '不死!', '#f0c040');
        UI.addLog('💛 Bất Khuất kích hoạt! Không thể chết!', 'realm');
        UI.showNotification('💛 Bất Khuất!', 'Thoát khỏi tử vong!');
        return;
      }
    }

    // Normal damage flow
    const dmgReduction = this.hasOwnProperty('_fateDmgReduce') ? this._fateDmgReduce : 1.0;
    const reducedDamage = Math.max(1, Math.floor(actualDamage * dmgReduction));
    this.hp -= reducedDamage;

    Game.spawnDamageNumber(this.x, this.y - 30, reducedDamage, '#ff4444');
    UI.addLog(`${source} gây ${reducedDamage} sát thương!`, 'damage');

    this.invincible = true;
    this.invincibleTimer = 300;

    if (this.hp <= 0) {
      this.hp = 0;
      this.die();
    }
  };

  // ── 3. gainExp — scholar / genius fate ──────────────────
  const _origGainExp = Player.gainExp.bind(Player);
  Player.gainExp = function (amount) {
    const mul = this._fateExpMul || 1.0;
    _origGainExp.call(this, Math.floor(amount * mul));
  };

  // ── 4. gainRealmExp — realmSense fate ───────────────────
  const _origGainRealmExp = Player.gainRealmExp.bind(Player);
  Player.gainRealmExp = function (amount) {
    const mul = this._fateRealmExpMul || 1.0;
    _origGainRealmExp.call(this, Math.floor(amount * mul));
  };

  // ── 5. useSkill — magic method cd reduction + fateBasicCdMul ─
  const _origUseSkill = Player.useSkill.bind(Player);
  Player.useSkill = function (idx) {
    // Apply MP cost reduction (mpMaster fate)
    if (this._fateMpCostMul && this.skills && this.skills[idx]) {
      const skill = this.skills[idx];
      const origMp = skill.mp;
      skill.mp = Math.floor(origMp * this._fateMpCostMul);
      const result = _origUseSkill.call(this, idx);
      skill.mp = origMp;  // restore
      if (result) {
        // cd reduction for magic method
        if (this._methodCdReduction && skill.cd > 0) {
          skill.cd = Math.floor(skill.cd * (1 - this._methodCdReduction));
        }
        // swiftSword fate for skill 0
        if (idx === 0 && this._fateBasicCdMul && skill.cd > 0) {
          skill.cd = Math.floor(skill.cd * this._fateBasicCdMul);
        }
      }
      return result;
    }

    const result = _origUseSkill.call(this, idx);
    if (result) {
      const skill = this.skills[idx];
      if (skill) {
        if (this._methodCdReduction && skill.cd > 0) {
          skill.cd = Math.floor(skill.cd * (1 - this._methodCdReduction));
        }
        if (idx === 0 && this._fateBasicCdMul && skill.cd > 0) {
          skill.cd = Math.floor(skill.cd * this._fateBasicCdMul);
        }
      }
    }
    return result;
  };

  // ── 6. Enemies.kill — fortune / genius gold + methodPill/fateScroll drops ─
  const _origKill = Enemies.kill.bind(Enemies);
  Enemies.kill = function (enemy) {
    // Gold multiplier
    if (Player._fateGoldMul) {
      enemy.gold = Math.floor(enemy.gold * Player._fateGoldMul);
    }

    // Add methodPill / fateScroll to drops
    const isBoss = enemy.boss || false;
    const pillChance  = isBoss ? 0.15 : 0.05;
    const scrollChance = isBoss ? 0.10 : 0.03;

    // legendary drop multiplier
    if (Player._fateLegendaryMul) {
      enemy.drops = enemy.drops.map(d => {
        const item = ITEMS[d.id];
        if (item && (item.rarity === 'legendary' || item.rarity === 'epic')) {
          return { ...d, chance: Math.min(1, d.chance * Player._fateLegendaryMul) };
        }
        return d;
      });
    }

    _origKill.call(this, enemy);

    // Extra drops for build items
    if (Utils.chance(pillChance) && ITEMS['methodPill']) {
      if (Inventory.add('methodPill', 1)) {
        UI.addLog('📦 Nhận Tâm Pháp Hoán Đổi Đan!', 'item');
      }
    }
    if (Utils.chance(scrollChance) && ITEMS['fateScroll']) {
      if (Inventory.add('fateScroll', 1)) {
        UI.addLog('📦 Nhận Vận Mệnh Thư!', 'item');
      }
    }
  };

  // ── 7. Enemies.damage — critChain fate ──────────────────
  const _origDamage = Enemies.damage.bind(Enemies);
  Enemies.damage = function (enemy, amount, isCrit = false, color = '#ffffff') {
    // critChain fate
    if (!isCrit && Player._forceCrit) {
      isCrit = true;
      amount = Math.floor(amount * Player.critDmg);
      delete Player._forceCrit;
    }

    _origDamage.call(this, enemy, amount, isCrit, color);

    if (isCrit && FateSystem.hasFate('critChain') && !FateSystem.state._critChainActive) {
      if (Utils.chance(0.20)) {
        FateSystem.state._critChainActive = true;
        Player._forceCrit = true;
        setTimeout(() => {
          FateSystem.state._critChainActive = false;
          delete Player._forceCrit;
        }, 100);
      }
    }
  };

  // ── 8. Inventory.useItem — handle changeMethod + rerollFate ─
  const _origUseItem = Inventory.useItem.bind(Inventory);
  Inventory.useItem = function (itemId) {
    const itemData = ITEMS[itemId];
    if (!itemData) return false;

    if (itemData.effect && itemData.effect.changeMethod) {
      // Handled directly via CharacterBuildUI button; just notify
      UI.addLog('💡 Dùng qua panel Nhân Vật → Tâm Pháp để đổi!', 'system');
      return false;
    }
    if (itemData.effect && itemData.effect.rerollFate) {
      return FateSystem.reroll();
    }
    return _origUseItem.call(this, itemId);
  };

  // ── 9. UI.renderCharacter — inject build panel ───────────
  const _origRenderChar = UI.renderCharacter.bind(UI);
  UI.renderCharacter = function () {
    _origRenderChar.call(this);
    CharacterBuildUI.injectBuildSection();
  };

  // ── 10. Game.save / Game.load ────────────────────────────
  const _origSave = Game.save.bind(Game);
  Game.save = function () {
    _origSave.call(this);
    try {
      const buildData = {
        method: CultivationMethodSystem.getSaveData(),
        fate:   FateSystem.getSaveData()
      };
      localStorage.setItem('tuxien_build', JSON.stringify(buildData));
    } catch (e) {
      console.error('Build save error:', e);
    }
  };

  const _origLoad = Game.load.bind(Game);
  Game.load = function () {
    const result = _origLoad.call(this);
    try {
      const raw = localStorage.getItem('tuxien_build');
      if (raw) {
        const d = JSON.parse(raw);
        CultivationMethodSystem.loadSaveData(d.method);
        FateSystem.loadSaveData(d.fate);
        // Re-apply fates after load
        if (FateSystem.state.rolled) FateSystem.applyFates();
      }
    } catch (e) {
      console.error('Build load error:', e);
    }
    return result;
  };

  // ── 11. Natural HP regen — hpRegenMul (body method + recovery fate) ─
  // Patch Player.update to multiply regen
  const _origUpdate = Player.update.bind(Player);
  Player.update = function (dt, inputX, inputY) {
    // We do a minimal override: call orig, then boost HP if over-regenerated
    // Since regen happens inside _origUpdate, we track HP before and after
    const hpBefore = this.hp;
    _origUpdate.call(this, dt, inputX, inputY);
    const regenDone = this.hp - hpBefore;
    if (regenDone > 0) {
      const methodMul  = this._methodHpRegenMul  || 1.0;
      const fateMul    = this._fateHpRegenMul    || 1.0;
      const totalMul   = methodMul * fateMul;
      if (totalMul > 1.0) {
        const extra = Math.floor(regenDone * (totalMul - 1));
        if (extra > 0) {
          this.hp = Math.min(this.maxHp, this.hp + extra);
        }
      }
    }
  };
}

// ============================================================
// MAIN INIT
// ============================================================

const CharacterBuildFeature = {
  init() {
    // Register items
    if (typeof ITEMS !== 'undefined') {
      ITEMS.methodPill = {
        name: 'Tâm Pháp Hoán Đổi Đan', type: 'consumable', rarity: 'epic',
        desc: 'Cho phép đổi Tâm Pháp, reset level về 1.',
        effect: { changeMethod: true }, sellPrice: 500, icon: 'pill'
      };
      ITEMS.fateScroll = {
        name: 'Vận Mệnh Thư', type: 'consumable', rarity: 'epic',
        desc: 'Roll lại toàn bộ 3 Thiên Mệnh.',
        effect: { rerollFate: true }, sellPrice: 600, icon: 'scroll'
      };
    }

    _injectBuildStyles();
    _installHooks();

    // Recalc to apply loaded data
    Player.recalculateStats();

    // First-time fate roll
    if (!FateSystem.state.rolled) {
      setTimeout(() => FateSystem.showFirstTimeRoll(), 500);
    }

    console.log('📖 Character Build System loaded (Method + Fate)');
  }
};

// Hook into Game.init
const _origGameInit = Game.init.bind(Game);
Game.init = function () {
  _origGameInit.call(this);
  CharacterBuildFeature.init();
};

console.log('📖 Character Build System loaded (Method + Fate)');
// <script src="js/feature_character_build.js"></script>
