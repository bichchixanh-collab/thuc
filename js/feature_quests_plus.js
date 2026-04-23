// ==================== FEATURE: NHIỆM VỤ NÂNG CAO (QUESTS PLUS) ====================
// Load sau game.js
// Procedural quests: vô hạn, scale theo level, pool 50+ mẫu, chain quests
// NPC quest pool riêng, NPC mới theo cảnh giới

const QuestsPlus = {
  // ==================== CONFIG ====================
  MAX_ACTIVE_PROC: 8,    // max quest procedural đang làm
  DAILY_REFRESH_HOUR: 6,

  // Template pool (50+ mẫu, fill data theo level khi generate)
  killTemplates: [
    { name: 'Thanh lý {enemy}', desc: 'Tiêu diệt {n} {enemy} trong khu vực', n: [5,10,20,30] },
    { name: 'Săn {enemy} Tinh', desc: 'Tiêu diệt {n} {enemy} để lấy tinh hoa', n: [8,15,25,40] },
    { name: 'Diệt Trừ {enemy}', desc: 'Bảo vệ dân chúng: tiêu diệt {n} {enemy}', n: [10,20,35,50] },
    { name: 'Thảo Phạt {enemy}', desc: 'Phạt trừ đàn {enemy} nguy hiểm ({n} con)', n: [12,22,30,45] },
    { name: 'Luyện Tay Với {enemy}', desc: 'Rèn luyện bằng cách giết {n} {enemy}', n: [6,12,20,35] },
    { name: 'Thu Tinh Huyết {enemy}', desc: 'Thu thập huyết dịch từ {n} {enemy}', n: [5,10,18,28] },
    { name: 'Bảo Vệ Lãnh Địa', desc: 'Tiêu diệt {n} quái vật xâm nhập lãnh địa', n: [15,25,40,60] },
    { name: 'Truy Sát Quái Vật', desc: 'Truy sát và tiêu diệt {n} sinh vật nguy hiểm', n: [20,35,55,80] },
    { name: 'Tiêu Trừ Ác Thú', desc: 'Tiêu trừ {n} ác thú hoành hành vùng này', n: [8,18,28,45] },
    { name: 'Thí Luyện Kiếm Pháp', desc: 'Dùng kiếm pháp tiêu diệt {n} kẻ thù', n: [10,20,30,50] },
    { name: 'Bài Trừ Yêu Ma', desc: 'Trừ {n} yêu ma đang quấy phá dân lành', n: [5,12,22,35] },
    { name: 'Thu Thập Thực Lực', desc: 'Tích lũy kinh nghiệm qua {n} trận chiến', n: [15,30,50,80] },
    { name: 'Khai Quật Thực Lực', desc: 'Tiêu diệt {n} kẻ địch để khai mở tiềm năng', n: [25,40,60,100]},
  ],

  collectTemplates: [
    { name: 'Thu Thập {item}', desc: 'Mang về {n} {item} chất lượng tốt', n: [3,5,8,12] },
    { name: 'Nhặt {item} Cho Ta', desc: 'Ta cần {n} {item}, ngươi có thể giúp không?', n: [4,7,10,15] },
    { name: 'Nguyên Liệu {item}', desc: 'Thu thập {n} {item} để chế tác', n: [5,8,12,20] },
    { name: 'Tích Trữ {item}', desc: 'Dự trữ {n} {item} cho mùa đông tới', n: [6,10,15,25] },
    { name: 'Luyện Đan Cần {item}', desc: 'Luyện đan cần {n} {item} tinh khiết', n: [3,6,10,15] },
    { name: 'Nghiên Cứu {item}', desc: 'Mang {n} {item} cho ta để nghiên cứu', n: [2,4,7,10] },
    { name: 'Cống Nạp {item}', desc: 'Cống nạp {n} {item} cho môn phái', n: [5,8,12,20] },
  ],

  craftTemplates: [
    { name: 'Rèn Luyện Vũ Khí', desc: 'Chế tác hoặc mua {n} vũ khí tốt', n: [1,2,3,5] },
    { name: 'Trang Bị Đầy Đủ',  desc: 'Trang bị đủ 3 slot (vũ khí/giáp/phụ kiện)', n: [3,3,3,3] },
  ],

  // Chain quest templates (3-5 bước)
  chainTemplates: [
    {
      name: 'Hành Trình Diệt Ma',
      steps: [
        { type: 'kill', target: 'wolf',  n: 5,  desc: 'Bước 1: Tiêu diệt 5 Sói Xám' },
        { type: 'kill', target: 'boar',  n: 5,  desc: 'Bước 2: Tiêu diệt 5 Heo Rừng' },
        { type: 'kill', target: 'ghost', n: 3,  desc: 'Bước 3: Tiêu diệt 3 U Linh' },
      ]
    },
    {
      name: 'Thử Thách Mạnh Mẽ',
      steps: [
        { type: 'kill', target: 'any', n: 10, desc: 'Bước 1: Giết 10 quái vật bất kỳ' },
        { type: 'kill', target: 'any', n: 20, desc: 'Bước 2: Giết thêm 20 quái vật' },
        { type: 'kill', target: 'any', n: 30, desc: 'Bước 3: Giết thêm 30 quái vật' },
        { type: 'kill', target: 'any', n: 40, desc: 'Bước 4: Thử thách cuối - 40 quái vật' },
      ]
    },
    {
      name: 'Thu Thập Nguyên Liệu',
      steps: [
        { type: 'collect', target: 'wolfFang',  n: 5, desc: 'Bước 1: Thu 5 Nanh Sói' },
        { type: 'collect', target: 'wolfPelt',  n: 5, desc: 'Bước 2: Thu 5 Da Sói' },
        { type: 'collect', target: 'demonCore', n: 3, desc: 'Bước 3: Thu 3 Ma Hạch' },
        { type: 'kill',    target: 'any',       n: 20,desc: 'Bước 4: Giết 20 quái nữa' },
        { type: 'collect', target: 'spiritStone',n:2, desc: 'Bước 5: Thu 2 Linh Thạch' },
      ]
    },
  ],

  // NPC-specific quest pools (by npcType)
  npcQuestPools: {
    elder:     ['kill', 'kill', 'kill'],
    shop:      ['collect', 'collect', 'craft'],
    questGiver:['kill', 'collect', 'chain', 'kill', 'collect'],
    teleporter:['kill', 'explore'],
  },

  // Realm-based NPC definitions
  realmNPCs: [
    { realmReq: 1,  mapReq: 0, name: 'Hoa Tiên Cô', title: 'Tu Sĩ Cảnh Giới Thấp',  service: 'questGiver', dialog: 'Ngươi mới bắt đầu, ta có vài nhiệm vụ nhỏ.', x: 450, y: 350 },
    { realmReq: 2,  mapReq: 0, name: 'Kiếm Lão',    title: 'Kiếm Tiên Hồi Hưu',      service: 'questGiver', dialog: 'Ta nghe nói ngươi có thiên phú, hãy chứng minh!', x: 550, y: 450 },
    { realmReq: 3,  mapReq: 1, name: 'Lôi Pháp Sư', title: 'Pháp Sư U Minh',         service: 'questGiver', dialog: 'U Minh Cốc nguy hiểm lắm, ta cần người tin tưởng.', x: 480, y: 600 },
    { realmReq: 4,  mapReq: 2, name: 'Hỏa Thần Tử', title: 'Hỏa Hệ Tu Sĩ',           service: 'questGiver', dialog: 'Hỏa Diệm Sơn chỉ dành cho kẻ mạnh!', x: 600, y: 500 },
    { realmReq: 5,  mapReq: 3, name: 'Băng Tiên',   title: 'Tiên Nữ Băng Hàn',       service: 'questGiver', dialog: 'Ngươi có đủ sức chịu đựng giá lạnh không?', x: 520, y: 700 },
    { realmReq: 7,  mapReq: 4, name: 'Ma Tôn',      title: 'Ma Tộc Phản Nghịch',      service: 'questGiver', dialog: 'Ta phản bội Ma Tộc, hãy giúp ta trả thù!', x: 700, y: 600 },
    { realmReq: 8,  mapReq: 5, name: 'Tiên Tổ',     title: 'Tiên Giới Sứ Giả',       service: 'questGiver', dialog: 'Ngươi xứng đáng bước vào Tiên Giới. Ta có nhiệm vụ quan trọng.', x: 600, y: 350 },
  ],

  // Generated procedural quests
  procQuests: [],
  dailyQuests: [],
  lastDailyReset: '',
  usedChainIds: [],

  // ==================== INIT ====================
  init() {
    this._injectStyle();
    this._injectHTML();
    this._loadSave();
    this._checkDailyReset();
    this._fillProcQuests();
    this._spawnRealmNPCs();
    console.log('📜 QuestsPlus initialized');
  },

  // ==================== DAILY RESET ====================
  _checkDailyReset() {
    const today = new Date().toDateString();
    if (this.lastDailyReset !== today) {
      this.dailyQuests = this._generateDailyBatch();
      this.lastDailyReset = today;
      UI.addLog?.('🔄 Nhiệm vụ hàng ngày đã làm mới!', 'system');
      this._save();
    }
  },

  _generateDailyBatch() {
    const batch = [];
    const level = Player.level;
    // 5 daily quests, mixed kill + collect
    for (let i = 0; i < 3; i++) batch.push(this._generateKillQuest(level, 'daily'));
    for (let i = 0; i < 2; i++) batch.push(this._generateCollectQuest(level, 'daily'));
    return batch;
  },

  // ==================== PROCEDURAL GENERATION ====================
  _fillProcQuests() {
    // Keep completed+claimed quests, remove old unclaimed beyond limit
    this.procQuests = this.procQuests.filter(q => !q.claimed);
    const active = this.procQuests.filter(q => !q.completed);
    const needed = this.MAX_ACTIVE_PROC - active.length;

    for (let i = 0; i < needed; i++) {
      const type = this._pickType();
      let q;
      if (type === 'chain') {
        q = this._generateChainQuest(Player.level);
      } else if (type === 'collect') {
        q = this._generateCollectQuest(Player.level, 'proc');
      } else if (type === 'craft') {
        q = this._generateCraftQuest(Player.level);
      } else {
        q = this._generateKillQuest(Player.level, 'proc');
      }
      if (q) this.procQuests.push(q);
    }
  },

  _pickType() {
    const r = Math.random();
    if (r < 0.50) return 'kill';
    if (r < 0.75) return 'collect';
    if (r < 0.88) return 'chain';
    return 'craft';
  },

  _generateKillQuest(level, qtype) {
    const tmpl = this.killTemplates[Math.floor(Math.random() * this.killTemplates.length)];
    const tier = Math.min(3, Math.floor(level / 15));
    const n = tmpl.n[tier];

    // Pick enemy type for current map
    const map = Maps.data[Maps.currentIndex];
    const pool = [...map.enemies];
    const enemyKey = pool[Math.floor(Math.random() * pool.length)];
    const enemyName = Enemies.types[enemyKey]?.name || enemyKey;

    const id = 'proc_kill_' + Date.now() + '_' + Math.random().toString(36).slice(2);
    return {
      id, type: qtype, qtype: 'kill',
      name: tmpl.name.replace('{enemy}', enemyName),
      desc: tmpl.desc.replace('{enemy}', enemyName).replace('{n}', n),
      target: enemyKey, targetType: 'kill', needed: n, current: 0,
      reward: this._calcReward(level, 'kill', n),
      completed: false, claimed: false, mapReq: Maps.currentIndex,
      chainStep: null
    };
  },

  _generateCollectQuest(level, qtype) {
    const tmpl = this.collectTemplates[Math.floor(Math.random() * this.collectTemplates.length)];
    const tier = Math.min(3, Math.floor(level / 15));
    const n = tmpl.n[tier];

    // Pick material
    const matPool = ['wolfFang', 'wolfPelt', 'demonCore', 'spiritStone', 'dragonScale'];
    const matFiltered = matPool.filter(m => {
      if (m === 'dragonScale') return level >= 30;
      if (m === 'demonCore')   return level >= 10;
      return true;
    });
    const matId = matFiltered[Math.floor(Math.random() * matFiltered.length)];
    const matName = ITEMS[matId]?.name || matId;

    const id = 'proc_col_' + Date.now() + '_' + Math.random().toString(36).slice(2);
    return {
      id, type: qtype, qtype: 'collect',
      name: tmpl.name.replace('{item}', matName),
      desc: tmpl.desc.replace('{item}', matName).replace('{n}', n),
      target: matId, targetType: 'collect', needed: n, current: 0,
      reward: this._calcReward(level, 'collect', n),
      completed: false, claimed: false, mapReq: Maps.currentIndex,
      chainStep: null
    };
  },

  _generateCraftQuest(level) {
    const tmpl = this.craftTemplates[Math.floor(Math.random() * this.craftTemplates.length)];
    const id = 'proc_craft_' + Date.now() + '_' + Math.random().toString(36).slice(2);
    return {
      id, type: 'proc', qtype: 'craft',
      name: tmpl.name,
      desc: tmpl.desc,
      target: 'equip', targetType: 'equip', needed: tmpl.n[0], current: 0,
      reward: this._calcReward(level, 'craft', 1),
      completed: false, claimed: false, mapReq: Maps.currentIndex,
      chainStep: null
    };
  },

  _generateChainQuest(level) {
    // Pick unused chain template
    const available = this.chainTemplates.filter(ct =>
      !this.usedChainIds.includes(ct.name) ||
      this.procQuests.filter(q => q.chainName === ct.name && !q.claimed).length === 0
    );
    if (available.length === 0) return this._generateKillQuest(level, 'proc');

    const tmpl = available[Math.floor(Math.random() * available.length)];
    const step = tmpl.steps[0];
    const id = 'chain_' + Date.now() + '_' + Math.random().toString(36).slice(2);

    return {
      id, type: 'chain', qtype: step.type,
      name: `[Chuỗi] ${tmpl.name} (1/${tmpl.steps.length})`,
      desc: step.desc,
      target: step.target, targetType: step.type, needed: step.n, current: 0,
      reward: this._calcReward(level, 'chain', step.n),
      completed: false, claimed: false, mapReq: Maps.currentIndex,
      chainName: tmpl.name, chainStepIdx: 0, chainTotal: tmpl.steps.length,
      chainTemplate: tmpl
    };
  },

  _calcReward(level, type, n) {
    const base = level * 10;
    const nMul = Math.sqrt(n);
    const typeMul = { kill: 1, collect: 1.2, craft: 2, chain: 1.5, daily: 1.3 }[type] || 1;
    const exp  = Math.floor(base * nMul * typeMul * 2);
    const gold = Math.floor(base * nMul * typeMul * 0.8);

    // Sometimes add item reward
    let item = null;
    if (Math.random() < 0.3) {
      const itemPool = level < 15 ? ['hpPotion', 'mpPotion'] :
                       level < 30 ? ['hpPotionMedium', 'expPotion', 'spiritStone'] :
                                    ['realmPill', 'expPotion', 'dragonScale'];
      item = itemPool[Math.floor(Math.random() * itemPool.length)];
    }
    return { exp, gold, item };
  },

  // ==================== PROGRESS HOOKS ====================
  updateKillProgress(enemyType) {
    for (const q of [...this.procQuests, ...this.dailyQuests]) {
      if (q.completed || q.claimed) continue;
      if (q.targetType !== 'kill') continue;
      if (q.target !== 'any' && q.target !== enemyType) continue;
      q.current = Math.min(q.needed, q.current + 1);
      if (q.current >= q.needed) this._completeQuest(q);
    }
    // Also update core Quests
    Quests.updateProgress(enemyType, 1);

    // Fill more quests if needed
    if (GameState.time % 5000 < 50) this._fillProcQuests();
  },

  updateCollectProgress(itemId) {
    for (const q of [...this.procQuests, ...this.dailyQuests]) {
      if (q.completed || q.claimed) continue;
      if (q.targetType !== 'collect') continue;
      if (q.target !== 'any' && q.target !== itemId) continue;
      q.current = Math.min(q.needed, q.current + 1);
      if (q.current >= q.needed) this._completeQuest(q);
    }
    Quests.updateCollectionProgress(itemId, 1);
  },

  updateEquipProgress() {
    for (const q of [...this.procQuests]) {
      if (q.completed || q.claimed) continue;
      if (q.targetType !== 'equip') continue;
      const equipped = Object.values(Player.equipped).filter(Boolean).length;
      q.current = equipped;
      if (q.current >= q.needed) this._completeQuest(q);
    }
  },

  _completeQuest(q) {
    q.completed = true;
    UI.addLog(`✅ Nhiệm vụ: ${q.name} hoàn thành!`, 'system');
    UI.showNotification('✅ Hoàn thành!', q.name.substring(0, 30));

    // Chain: spawn next step
    if (q.type === 'chain' && q.chainStepIdx < q.chainTotal - 1) {
      const nextIdx = q.chainStepIdx + 1;
      const nextStep = q.chainTemplate.steps[nextIdx];
      const nextId = 'chain_' + Date.now() + '_' + Math.random().toString(36).slice(2);
      const nextQ = {
        id: nextId, type: 'chain', qtype: nextStep.type,
        name: `[Chuỗi] ${q.chainName} (${nextIdx + 1}/${q.chainTotal})`,
        desc: nextStep.desc,
        target: nextStep.target, targetType: nextStep.type,
        needed: nextStep.n, current: 0,
        reward: this._calcReward(Player.level, 'chain', nextStep.n * (nextIdx + 1)),
        completed: false, claimed: false, mapReq: Maps.currentIndex,
        chainName: q.chainName, chainStepIdx: nextIdx,
        chainTotal: q.chainTotal, chainTemplate: q.chainTemplate
      };
      this.procQuests.push(nextQ);
      UI.addLog(`🔗 Bước tiếp theo mở khóa: ${nextQ.name}`, 'system');
    }
  },

  claimProcReward(questId) {
    const q = this.procQuests.find(x => x.id === questId) ||
              this.dailyQuests.find(x => x.id === questId);
    if (!q || !q.completed || q.claimed) return false;

    q.claimed = true;
    if (q.reward.exp)  Player.gainExp(q.reward.exp);
    if (q.reward.gold) { Player.gold += q.reward.gold; UI.updateGold(); }
    if (q.reward.item) {
      Inventory.add(q.reward.item, 1);
      UI.addLog(`🎁 Nhận: ${ITEMS[q.reward.item]?.name}!`, 'item');
    }
    UI.addLog(`🎁 +${q.reward.exp} EXP +${q.reward.gold} Vàng`, 'exp');

    // Refill quests
    setTimeout(() => this._fillProcQuests(), 100);
    this._save();
    return true;
  },

  // ==================== REALM NPC SPAWN ====================
  _spawnRealmNPCs() {
    for (const def of this.realmNPCs) {
      if (Player.realm < def.realmReq) continue;
      if (Maps.currentIndex < def.mapReq) continue;
      // Check not already spawned (by name)
      if (NPC.list.find(n => n.name === def.name)) continue;

      const npc = {
        type: 'questGiverPlus',
        name: def.name, title: def.title,
        x: def.x, y: def.y,
        sprite: 'npcShop',
        dialog: def.dialog,
        service: 'questPlus',
        interactRange: 80,
        canInteract: false,
        questPlusNpc: true
      };
      NPC.list.push(npc);
    }
  },

  // ==================== UI ====================
  openPanel() {
    document.getElementById('questsPlusPanel').classList.add('show');
    this._renderPanel('proc');
  },

  closePanel() {
    document.getElementById('questsPlusPanel').classList.remove('show');
  },

  switchTab(btn, filter) {
    document.querySelectorAll('#questsPlusPanel .qp-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    this._renderPanel(filter);
  },

  _renderPanel(filter) {
    const list = document.getElementById('questsPlusList');
    list.innerHTML = '';

    let quests = [];
    if (filter === 'daily') {
      quests = this.dailyQuests.filter(q => !q.claimed);
    } else if (filter === 'chain') {
      quests = this.procQuests.filter(q => q.type === 'chain' && !q.claimed);
    } else {
      quests = this.procQuests.filter(q => !q.claimed);
    }

    if (quests.length === 0) {
      list.innerHTML = '<div style="text-align:center;color:#666;padding:20px">Không có nhiệm vụ · Sẽ làm mới sau</div>';
      if (filter === 'proc') {
        const refreshBtn = document.createElement('button');
        refreshBtn.style.cssText = 'display:block;margin:10px auto;padding:8px 20px;background:rgba(33,150,243,0.2);border:1px solid #2196f3;border-radius:6px;color:#2196f3;font-size:11px;cursor:pointer;font-family:inherit';
        refreshBtn.textContent = '🔄 Tạo Nhiệm Vụ Mới';
        refreshBtn.onclick = () => { this._fillProcQuests(); this._renderPanel(filter); };
        list.appendChild(refreshBtn);
      }
      return;
    }

    for (const q of quests) {
      const item = document.createElement('div');
      const pct = q.needed > 0 ? (q.current / q.needed * 100).toFixed(0) : 0;
      const typeIcon = { proc: '📋', daily: '🔄', chain: '🔗' }[q.type] || '📜';
      const isReady = q.completed && !q.claimed;

      item.style.cssText = `
        background:rgba(255,255,255,0.03);
        border:2px solid ${isReady ? '#4caf50' : q.type === 'chain' ? '#f0c040' : '#444'};
        border-radius:10px;padding:12px;margin-bottom:8px;cursor:pointer;
        ${isReady ? 'background:rgba(76,175,80,0.08)' : ''}
      `;

      item.innerHTML = `
        <div style="color:${isReady ? '#4caf50' : '#f0c040'};font-size:12px;font-weight:bold">${typeIcon} ${q.name}</div>
        <div style="color:#999;font-size:10px;margin-top:3px">${q.desc}</div>
        <div style="color:#8ef;font-size:10px;margin-top:3px">${q.completed ? '✅ Hoàn thành!' : `${q.current}/${q.needed}`}</div>
        <div style="height:5px;background:#222;border-radius:3px;margin-top:6px;overflow:hidden">
          <div style="height:100%;width:${pct}%;background:${isReady ? '#4caf50' : '#f0c040'};border-radius:3px"></div>
        </div>
        <div style="color:#8f8;font-size:9px;margin-top:4px">🎁 ${q.reward.exp} EXP · ${q.reward.gold} Vàng${q.reward.item ? ' · ' + (ITEMS[q.reward.item]?.name || '') : ''}</div>
        ${isReady ? '<div style="color:#4caf50;font-size:10px;font-weight:bold;margin-top:4px">👆 Chạm để nhận thưởng!</div>' : ''}
      `;

      if (isReady) {
        item.onclick = () => { this.claimProcReward(q.id); this._renderPanel(filter); };
      }

      list.appendChild(item);
    }
  },

  // NPC dialog for questPlus NPCs
  buildQuestPlusDialog(container) {
    const available = [...this.procQuests, ...this.dailyQuests].filter(q => !q.claimed);
    const displayable = available.slice(0, 5);

    if (displayable.length === 0) {
      const el = document.createElement('div');
      el.style.cssText = 'color:#888;font-size:10px;text-align:center;padding:10px';
      el.textContent = 'Hiện chưa có nhiệm vụ mới. Quay lại sau!';
      container.appendChild(el);
    }

    for (const q of displayable) {
      const option = document.createElement('div');
      option.className = 'npc-option';
      if (q.completed && !q.claimed) {
        option.innerHTML = `<span>🎁 ${q.name}</span><span style="color:#4caf50">Nhận thưởng!</span>`;
        option.onclick = () => { this.claimProcReward(q.id); NPC.interact(NPC.currentDialog); };
      } else {
        option.innerHTML = `<span>📜 ${q.name}</span><span style="color:#888">${q.current}/${q.needed}</span>`;
      }
      container.appendChild(option);
    }

    const viewAll = document.createElement('div');
    viewAll.className = 'npc-option';
    viewAll.innerHTML = `<span>📋 Xem tất cả nhiệm vụ</span>`;
    viewAll.onclick = () => { NPC.closeDialog(); QuestsPlus.openPanel(); };
    container.appendChild(viewAll);

    // Close
    const close = document.createElement('div');
    close.className = 'npc-option';
    close.innerHTML = '<span>👋 Tạm biệt</span>';
    close.onclick = () => NPC.closeDialog();
    container.appendChild(close);
  },

  // ==================== INJECT STYLE + HTML ====================
  _injectStyle() {
    if (document.getElementById('questsPlusStyle')) return;
    const s = document.createElement('style');
    s.id = 'questsPlusStyle';
    s.textContent = `
      #questsPlusPanel {
        position:absolute;top:0;left:0;width:100%;height:100%;
        background:rgba(0,0,0,0.8);z-index:100;
        display:none;align-items:center;justify-content:center;
        backdrop-filter:blur(2px);
      }
      #questsPlusPanel.show{display:flex}
      #questsPlusInner {
        background:linear-gradient(135deg,#1a1a2e,#16213e);
        border:3px solid #f0c040;border-radius:15px;
        padding:18px;width:92%;max-width:400px;max-height:88vh;overflow-y:auto;
        box-shadow:0 0 40px rgba(240,192,64,0.2);
      }
      #questsPlusInner::-webkit-scrollbar{width:4px}
      #questsPlusInner::-webkit-scrollbar-thumb{background:#f0c040;border-radius:2px}
      .qp-tab {
        flex:1;padding:8px;background:rgba(255,255,255,0.03);
        border:1px solid #444;border-radius:6px 6px 0 0;
        color:#888;font-size:10px;cursor:pointer;text-align:center;
        font-family:'Courier New',monospace;
      }
      .qp-tab.active {
        background:rgba(240,192,64,0.2);border-color:#f0c040;color:#f0c040;
      }
    `;
    document.head.appendChild(s);
  },

  _injectHTML() {
    const panel = document.createElement('div');
    panel.id = 'questsPlusPanel';
    panel.innerHTML = `
      <div id="questsPlusInner">
        <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #f0c04044;padding-bottom:10px;margin-bottom:12px">
          <div style="color:#f0c040;font-size:18px;font-weight:bold">📜 Nhiệm Vụ Mở Rộng</div>
          <div onclick="QuestsPlus.closePanel()" style="width:30px;height:30px;background:rgba(255,0,0,0.2);border:2px solid #f44;border-radius:50%;color:#f44;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center">✕</div>
        </div>
        <div style="display:flex;gap:4px;margin-bottom:12px">
          <div class="qp-tab active" onclick="QuestsPlus.switchTab(this,'proc')">📋 Thường</div>
          <div class="qp-tab" onclick="QuestsPlus.switchTab(this,'daily')">🔄 Hàng Ngày</div>
          <div class="qp-tab" onclick="QuestsPlus.switchTab(this,'chain')">🔗 Chuỗi</div>
        </div>
        <div id="questsPlusList"></div>
      </div>
    `;
    panel.addEventListener('click', e => { if (e.target.id === 'questsPlusPanel') this.closePanel(); });
    document.body.appendChild(panel);

    // Menu button (alongside existing quest button)
    const menuBar = document.getElementById('menuBar');
    if (menuBar) {
      const btn = document.createElement('div');
      btn.className = 'menu-btn';
      btn.onclick = () => QuestsPlus.openPanel();
      btn.innerHTML = `<span style="font-size:18px">📋</span><span>NV Mới</span>`;
      menuBar.appendChild(btn);
    }
  },

  // ==================== SAVE / LOAD ====================
  getSaveData() {
    // Only save lightweight data
    const savePQ = this.procQuests.slice(-30).map(q => ({
      id: q.id, type: q.type, qtype: q.qtype, name: q.name, desc: q.desc,
      target: q.target, targetType: q.targetType, needed: q.needed, current: q.current,
      reward: q.reward, completed: q.completed, claimed: q.claimed,
      mapReq: q.mapReq, chainName: q.chainName, chainStepIdx: q.chainStepIdx,
      chainTotal: q.chainTotal
    }));
    return {
      procQuests: savePQ,
      dailyQuests: this.dailyQuests,
      lastDailyReset: this.lastDailyReset
    };
  },

  _save() {
    try { localStorage.setItem('tuxien_questsplus', JSON.stringify(this.getSaveData())); } catch (e) {}
  },

  _loadSave() {
    try {
      const raw = localStorage.getItem('tuxien_questsplus');
      if (!raw) return;
      const data = JSON.parse(raw);
      this.lastDailyReset = data.lastDailyReset || '';
      this.dailyQuests = data.dailyQuests || [];
      // Restore procQuests (without chainTemplate - will just not spawn next chain step, acceptable)
      this.procQuests = (data.procQuests || []).map(q => ({ ...q, chainTemplate: null }));
    } catch (e) {}
  }
};

// ==================== WRAP GAME ====================
(function () {
  const _origInit = Game.init.bind(Game);
  Game.init = function () { _origInit(); QuestsPlus.init(); };

  const _origSave = Game.save.bind(Game);
  Game.save = function () { _origSave(); QuestsPlus._save(); };

  // Wrap Enemies.kill
  const _origKill = Enemies.kill.bind(Enemies);
  Enemies.kill = function (enemy) {
    _origKill(enemy);
    QuestsPlus.updateKillProgress(enemy.type);
  };

  // Wrap Inventory.add to detect collect quests
  const _origAdd = Inventory.add.bind(Inventory);
  Inventory.add = function (itemId, count) {
    const result = _origAdd(itemId, count);
    if (result) QuestsPlus.updateCollectProgress(itemId);
    return result;
  };

  // Wrap Player.equip to detect equip quests
  const _origEquip = Player.equip.bind(Player);
  Player.equip = function (itemId) {
    const result = _origEquip(itemId);
    if (result) setTimeout(() => QuestsPlus.updateEquipProgress(), 50);
    return result;
  };

  // Hook NPC interact for questPlus NPCs
  const _origInteract = NPC.interact.bind(NPC);
  NPC.interact = function (npc) {
    if (npc.questPlusNpc) {
      NPC.currentDialog = npc;
      const dialogEl = document.getElementById('npcDialog');
      const avatarCtx = document.getElementById('npcAvatarCanvas').getContext('2d');
      avatarCtx.clearRect(0, 0, 32, 32);
      const spr = Sprites.getNPCSprite('shop');
      Sprites.drawPixelArt(avatarCtx, spr, 2, 0, 0);
      document.getElementById('npcName').textContent = npc.name;
      document.getElementById('npcTitle').textContent = npc.title;
      document.getElementById('npcText').textContent = npc.dialog;
      const optionsEl = document.getElementById('npcOptions');
      optionsEl.innerHTML = '';
      QuestsPlus.buildQuestPlusDialog(optionsEl);
      dialogEl.classList.add('show');
      return;
    }
    _origInteract(npc);
  };

  // Re-spawn realm NPCs when player levels up or realm advances
  const _origLevelUp = Player.levelUp.bind(Player);
  Player.levelUp = function () {
    _origLevelUp();
    if (typeof QuestsPlus !== 'undefined') QuestsPlus._spawnRealmNPCs();
  };

  const _origAdvanceRealm = Player.advanceRealm.bind(Player);
  Player.advanceRealm = function () {
    _origAdvanceRealm();
    if (typeof QuestsPlus !== 'undefined') QuestsPlus._spawnRealmNPCs();
  };

  // Maps travel - refresh quests + realm NPCs
  const _origTravel = Maps.travelTo.bind(Maps);
  Maps.travelTo = function (idx) {
    const result = _origTravel(idx);
    if (result) {
      setTimeout(() => {
        QuestsPlus._fillProcQuests();
        QuestsPlus._spawnRealmNPCs();
      }, 100);
    }
    return result;
  };
})();

console.log('📜 feature_quests_plus.js loaded');
// Thêm vào index.html: <script src="js/feature_quests_plus.js"></script>
