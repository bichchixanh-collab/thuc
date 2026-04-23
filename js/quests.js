// ==================== QUEST SYSTEM ====================
const Quests = {
  // Quest data
  list: [
    // Main quests
    {
      id: 'main_1',
      name: 'Khởi Đầu Tu Luyện',
      desc: 'Tiêu diệt 5 Sói Xám để chứng minh thực lực',
      type: 'main',
      target: 'wolf',
      targetType: 'kill',
      needed: 5,
      current: 0,
      reward: { exp: 80, gold: 50 },
      completed: false,
      claimed: false,
      mapReq: 0
    },
    {
      id: 'main_2',
      name: 'Dẹp Loạn Heo Rừng',
      desc: 'Heo rừng hoành hành quanh núi, tiêu diệt chúng',
      type: 'main',
      target: 'boar',
      targetType: 'kill',
      needed: 8,
      current: 0,
      reward: { exp: 150, gold: 80, item: 'ironSword' },
      completed: false,
      claimed: false,
      mapReq: 0
    },
    {
      id: 'main_3',
      name: 'Sói Vương Xuất Thế',
      desc: 'Đánh bại Sói Vương để bảo vệ làng',
      type: 'main',
      target: 'wolfKing',
      targetType: 'kill',
      needed: 1,
      current: 0,
      reward: { exp: 300, gold: 150, item: 'steelSword' },
      completed: false,
      claimed: false,
      mapReq: 0
    },
    {
      id: 'main_4',
      name: 'Tiến Vào U Minh Cốc',
      desc: 'Khám phá U Minh Cốc, tiêu diệt 10 U Linh',
      type: 'main',
      target: 'ghost',
      targetType: 'kill',
      needed: 10,
      current: 0,
      reward: { exp: 400, gold: 200, item: 'spiritRobe' },
      completed: false,
      claimed: false,
      mapReq: 1
    },
    {
      id: 'main_5',
      name: 'Đối Đầu Ma Vương',
      desc: 'Tiêu diệt Ma Vương trong U Minh Cốc',
      type: 'main',
      target: 'demonLord',
      targetType: 'kill',
      needed: 1,
      current: 0,
      reward: { exp: 800, gold: 400, item: 'flameSword' },
      completed: false,
      claimed: false,
      mapReq: 1
    },
    
    // Collection quests
    {
      id: 'collect_1',
      name: 'Thu Thập Nanh Sói',
      desc: 'Thu thập Nanh Sói để luyện khí',
      type: 'side',
      target: 'wolfFang',
      targetType: 'collect',
      needed: 10,
      current: 0,
      reward: { exp: 100, gold: 60 },
      completed: false,
      claimed: false,
      mapReq: 0
    },
    {
      id: 'collect_2',
      name: 'Ma Hạch Quý Hiếm',
      desc: 'Thu thập Ma Hạch từ yêu ma',
      type: 'side',
      target: 'demonCore',
      targetType: 'collect',
      needed: 5,
      current: 0,
      reward: { exp: 250, gold: 120, item: 'realmPill' },
      completed: false,
      claimed: false,
      mapReq: 1
    },
    
    // Daily quests
    {
      id: 'daily_1',
      name: 'Tu Luyện Hàng Ngày',
      desc: 'Tiêu diệt 20 quái vật bất kỳ',
      type: 'daily',
      target: 'any',
      targetType: 'kill',
      needed: 20,
      current: 0,
      reward: { exp: 200, gold: 100 },
      completed: false,
      claimed: false,
      mapReq: 0
    },
    {
      id: 'daily_2',
      name: 'Tích Lũy Tài Nguyên',
      desc: 'Thu thập 5 vật phẩm bất kỳ',
      type: 'daily',
      target: 'any',
      targetType: 'collect',
      needed: 5,
      current: 0,
      reward: { exp: 150, gold: 80, item: 'hpPotionMedium' },
      completed: false,
      claimed: false,
      mapReq: 0
    }
  ],
  
  // Currently tracked quest
  activeQuestId: 'main_1',
  
  // Get active quests
  getActive() {
    return this.list.filter(q => !q.completed && q.mapReq <= Maps.currentIndex);
  },
  
  // Get completed quests
  getCompleted() {
    return this.list.filter(q => q.completed);
  },
  
  // Get daily quests
  getDaily() {
    return this.list.filter(q => q.type === 'daily');
  },
  
  // Update quest progress
  updateProgress(target, amount = 1) {
    for (const quest of this.list) {
      if (quest.completed || quest.claimed) continue;
      
      let shouldUpdate = false;
      
      if (quest.targetType === 'kill') {
        if (quest.target === 'any' || quest.target === target) {
          shouldUpdate = true;
        }
      }
      
      if (shouldUpdate) {
        quest.current = Math.min(quest.needed, quest.current + amount);
        
        if (quest.current >= quest.needed) {
          this.completeQuest(quest);
        }
      }
    }
    
    this.updateUI();
  },
  
  // Update collection quest
  updateCollectionProgress(itemId, amount = 1) {
    for (const quest of this.list) {
      if (quest.completed || quest.claimed) continue;
      if (quest.targetType !== 'collect') continue;
      
      if (quest.target === 'any' || quest.target === itemId) {
        quest.current = Math.min(quest.needed, quest.current + amount);
        
        if (quest.current >= quest.needed) {
          this.completeQuest(quest);
        }
      }
    }
    
    this.updateUI();
  },
  
  // Complete quest
  completeQuest(quest) {
    quest.completed = true;
    
    UI.addLog(`✅ Nhiệm vụ hoàn thành: ${quest.name}!`, 'system');
    UI.showNotification('✅ Hoàn thành!', quest.name);
  },
  
  // Claim reward
  claimReward(questId) {
    const quest = this.list.find(q => q.id === questId);
    if (!quest || !quest.completed || quest.claimed) return false;
    
    // Give rewards
    if (quest.reward.exp) {
      Player.gainExp(quest.reward.exp);
    }
    if (quest.reward.gold) {
      Player.gold += quest.reward.gold;
      UI.updateGold();
    }
    if (quest.reward.item) {
      Inventory.add(quest.reward.item, 1);
      const itemData = ITEMS[quest.reward.item];
      UI.addLog(`🎁 Nhận được ${itemData.name}!`, 'item');
    }
    
    quest.claimed = true;
    
    UI.addLog(`🎁 Nhận thưởng: +${quest.reward.exp || 0} EXP, +${quest.reward.gold || 0} Vàng`, 'exp');
    
    this.render();
    return true;
  },
  
  // Set active quest for tracking
  setActive(questId) {
    this.activeQuestId = questId;
    this.updateUI();
  },
  
  // Update quest tracker UI
  updateUI() {
    const quest = this.list.find(q => q.id === this.activeQuestId);
    
    if (quest) {
      document.getElementById('questTitle').textContent = `📜 ${quest.name}`;
      
      if (quest.claimed) {
        document.getElementById('questProgress').textContent = '✅ Đã hoàn thành!';
      } else if (quest.completed) {
        document.getElementById('questProgress').textContent = '🎁 Nhận thưởng!';
      } else {
        document.getElementById('questProgress').textContent = `Tiến độ: ${quest.current}/${quest.needed}`;
      }
      
      document.getElementById('questReward').textContent = 
        `🎁 ${quest.reward.exp || 0} EXP, ${quest.reward.gold || 0} Vàng` +
        (quest.reward.item ? `, ${ITEMS[quest.reward.item].name}` : '');
    }
  },
  
  // Render quest panel
  render(filter = 'active') {
    const list = document.getElementById('questList');
    list.innerHTML = '';
    
    let quests = [];
    switch (filter) {
      case 'active':
        quests = this.list.filter(q => !q.claimed);
        break;
      case 'completed':
        quests = this.list.filter(q => q.claimed);
        break;
      case 'daily':
        quests = this.list.filter(q => q.type === 'daily');
        break;
    }
    
    if (quests.length === 0) {
      list.innerHTML = '<div style="text-align:center;color:#666;padding:20px;">Không có nhiệm vụ</div>';
      return;
    }
    
    for (const quest of quests) {
      const item = document.createElement('div');
      item.className = 'quest-item';
      
      if (quest.id === this.activeQuestId) item.classList.add('active');
      if (quest.completed) item.classList.add('completed');
      
      const typeIcons = { main: '⭐', side: '📋', daily: '🔄' };
      const typeIcon = typeIcons[quest.type] || '📜';
      
      const progressPercent = quest.needed > 0 ? (quest.current / quest.needed * 100) : 0;
      
      item.innerHTML = `
        <div class="quest-name">${typeIcon} ${quest.name}</div>
        <div class="quest-desc">${quest.desc}</div>
        <div class="quest-progress-text">${quest.completed ? (quest.claimed ? '✅ Đã nhận thưởng' : '🎁 Có thể nhận thưởng') : `${quest.current}/${quest.needed}`}</div>
        <div class="quest-progress-bar">
          <div class="quest-progress-fill" style="width:${progressPercent}%"></div>
        </div>
        <div class="quest-reward">🎁 ${quest.reward.exp || 0} EXP, ${quest.reward.gold || 0} Vàng${quest.reward.item ? ', ' + ITEMS[quest.reward.item].name : ''}</div>
      `;
      
      // Click to track or claim
      item.onclick = () => {
        if (quest.completed && !quest.claimed) {
          this.claimReward(quest.id);
        } else {
          this.setActive(quest.id);
          this.render(filter);
        }
      };
      
      list.appendChild(item);
    }
  },
  
  // Switch quest tab
  switchTab(btn, filter) {
    document.querySelectorAll('#questPanel .tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    this.render(filter);
  },
  
  // Reset daily quests
  resetDaily() {
    for (const quest of this.list) {
      if (quest.type === 'daily') {
        quest.current = 0;
        quest.completed = false;
        quest.claimed = false;
      }
    }
    UI.addLog('🔄 Nhiệm vụ hàng ngày đã reset!', 'system');
  },
  
  // Get save data
  getSaveData() {
    return {
      list: this.list.map(q => ({
        id: q.id,
        current: q.current,
        completed: q.completed,
        claimed: q.claimed
      })),
      activeQuestId: this.activeQuestId
    };
  },
  
  // Load save data
  loadSaveData(data) {
    if (data?.list) {
      for (const saved of data.list) {
        const quest = this.list.find(q => q.id === saved.id);
        if (quest) {
          quest.current = saved.current;
          quest.completed = saved.completed;
          quest.claimed = saved.claimed;
        }
      }
    }
    if (data?.activeQuestId) {
      this.activeQuestId = data.activeQuestId;
    }
  }
};

console.log('📜 Quests loaded');