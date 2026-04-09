// ==================== UI SYSTEM ====================
const UI = {
  activePanel: null,
  
  // Initialize UI
  init() {
    this.drawAllIcons();
    this.updateAll();
    this.setupEventListeners();
  },
  
  // Draw all pixel art icons
  drawAllIcons() {
    // Avatar
    const avCtx = document.getElementById('avatarCanvas').getContext('2d');
    avCtx.clearRect(0, 0, 32, 32);
    Sprites.drawPixelArt(avCtx, Sprites.player.down, 2, 0, 0);
    
    // Skill icons
    this.drawSkillIcon('skillIcon0', [
      [0, '#fff', '#fff', 0],
      ['#ccc', '#fff', '#fff', '#ccc'],
      ['#ccc', '#fff', '#fff', '#ccc'],
      [0, '#aaa', '#aaa', 0],
      ['#8b4513', '#a0522d', '#a0522d', '#8b4513']
    ], 5);
    
    this.drawSkillIcon('skillIcon1', [
      ['#87ceeb', 0, 0, '#87ceeb'],
      [0, '#87ceeb', '#87ceeb', 0],
      [0, '#87ceeb', '#87ceeb', 0],
      ['#4169e1', '#87ceeb', '#87ceeb', '#4169e1']
    ], 5);
    
    this.drawSkillIcon('skillIcon2', [
      ['#ffff00', '#ffff00', 0, 0],
      [0, '#ffff00', '#ffff00', 0],
      [0, 0, '#ffff00', '#ffff00'],
      ['#ffa500', '#ffff00', '#ffff00', '#ffa500']
    ], 5);
    
    this.drawSkillIcon('skillIcon3', [
      ['#ff00ff', 0, 0, '#ff00ff'],
      [0, '#ff69b4', '#ff69b4', 0],
      ['#ff00ff', '#ff69b4', '#ff69b4', '#ff00ff'],
      [0, '#ff00ff', '#ff00ff', 0]
    ], 5);
    
    // Menu icons
    this.drawMenuIcon('iconQuest', [
      ['#f0c040', '#f0c040', '#f0c040', '#f0c040'],
      ['#f0c040', '#1a1a2e', '#1a1a2e', '#f0c040'],
      ['#f0c040', '#1a1a2e', '#1a1a2e', '#f0c040'],
      ['#f0c040', '#f0c040', '#f0c040', '#f0c040']
    ], 4);
    
    this.drawMenuIcon('iconMap', [
      ['#228b22', '#32cd32', '#4169e1', '#228b22'],
      ['#32cd32', '#ffd700', '#4169e1', '#32cd32'],
      ['#228b22', '#32cd32', '#228b22', '#32cd32'],
      ['#8b4513', '#228b22', '#32cd32', '#8b4513']
    ], 4);
    
    this.drawMenuIcon('iconBag', [
      [0, '#8b4513', '#8b4513', 0],
      ['#8b4513', '#a0522d', '#a0522d', '#8b4513'],
      ['#8b4513', '#a0522d', '#a0522d', '#8b4513'],
      [0, '#8b4513', '#8b4513', 0]
    ], 4);
    
    this.drawMenuIcon('iconChar', [
      [0, '#ffe4c4', '#ffe4c4', 0],
      ['#ffe4c4', '#1a1a1a', '#1a1a1a', '#ffe4c4'],
      [0, '#4169e1', '#4169e1', 0],
      ['#4169e1', '#4169e1', '#4169e1', '#4169e1']
    ], 4);
    
    // Update MP costs
    document.getElementById('mpCost1').textContent = Player.skills[1].mp;
    document.getElementById('mpCost2').textContent = Player.skills[2].mp;
    document.getElementById('mpCost3').textContent = Player.skills[3].mp;
  },
  
  // Draw skill icon
  drawSkillIcon(canvasId, data, scale) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 24, 24);
    Sprites.drawPixelArt(ctx, data, scale, 0, 0);
  },
  
  // Draw menu icon
  drawMenuIcon(canvasId, data, scale) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 16, 16);
    Sprites.drawPixelArt(ctx, data, scale, 0, 0);
  },
  
  // Update all UI elements
  updateAll() {
    this.updateStats();
    this.updateGold();
    this.updateSkillUI();
    this.updateRealmTitle();
    Quests.updateUI();
  },
  
  // Update HP/MP/EXP bars
  updateStats() {
    const hpPct = (Player.hp / Player.maxHp * 100).toFixed(0);
    document.getElementById('hpBar').style.width = hpPct + '%';
    document.getElementById('hpText').textContent = `${Player.hp}/${Player.maxHp}`;
    
    const mpPct = (Player.mp / Player.maxMp * 100).toFixed(0);
    document.getElementById('mpBar').style.width = mpPct + '%';
    document.getElementById('mpText').textContent = `${Player.mp}/${Player.maxMp}`;
    
    const expPct = (Player.exp / Player.maxExp * 100).toFixed(0);
    document.getElementById('expBar').style.width = expPct + '%';
    document.getElementById('expText').textContent = `${Player.exp}/${Player.maxExp}`;
  },
  
  // Update gold display
  updateGold() {
    document.getElementById('goldAmount').textContent = Utils.formatNumber(Player.gold);
  },
  
  // Update skill UI (cooldowns)
  updateSkillUI() {
    for (let i = 0; i < 4; i++) {
      const cdEl = document.getElementById('cd' + i);
      const skill = Player.skills[i];
      if (skill.cd > 0) {
        cdEl.style.display = 'flex';
        cdEl.textContent = Math.ceil(skill.cd / 1000);
      } else {
        cdEl.style.display = 'none';
      }
    }
  },
  
  // Update realm title
  updateRealmTitle() {
    const realm = REALMS[Player.realm];
    document.getElementById('realmTitle').textContent = `▸ ${realm.name} - Tầng ${Player.realmStage}`;
    document.getElementById('levelBadge').textContent = `Lv.${Player.level}`;
  },
  
  // Update target info
  updateTargetInfo() {
    if (!Player.target || !Player.target.alive) {
      this.hideTargetInfo();
      return;
    }
    
    const target = Player.target;
    const ti = document.getElementById('targetInfo');
    ti.style.display = 'flex';
    ti.className = target.boss ? 'boss' : '';
    
    document.getElementById('targetName').textContent = target.name;
    document.getElementById('targetLevel').textContent = `Lv.${target.level}`;
    document.getElementById('targetHpFill').style.width = (target.hp / target.maxHp * 100) + '%';
  },
  
  // Hide target info
  hideTargetInfo() {
    document.getElementById('targetInfo').style.display = 'none';
  },
  
  // Add combat log message
  addLog(text, type = 'system') {
    const log = document.getElementById('combatLog');
    const msg = document.createElement('div');
    msg.className = `log-msg ${type}`;
    msg.textContent = text;
    log.appendChild(msg);
    
    // Limit log entries
    while (log.children.length > 10) {
      log.removeChild(log.firstChild);
    }
    
    // Auto remove after animation
    setTimeout(() => {
      if (msg.parentNode) msg.remove();
    }, 5000);
  },
  
  // Show notification
  showNotification(title, subtitle = '') {
    // Remove existing
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.innerHTML = `
      <div class="notif-text">${title}</div>
      ${subtitle ? `<div class="notif-sub">${subtitle}</div>` : ''}
    `;
    document.body.appendChild(notif);
    
    setTimeout(() => notif.remove(), 2500);
  },
  
  // Open panel
  openPanel(name) {
    // Close current panel if same
    if (this.activePanel === name) {
      this.closePanel(name);
      return;
    }
    
    // Close any open panel
    if (this.activePanel) {
      this.closePanel(this.activePanel);
    }
    
    const panel = document.getElementById(name + 'Panel');
    if (panel) {
      panel.classList.add('show');
      this.activePanel = name;
      
      // Render panel content
      switch (name) {
        case 'inventory':
          Inventory.render();
          break;
        case 'character':
          this.renderCharacter();
          break;
        case 'map':
          Maps.render();
          break;
        case 'quest':
          Quests.render('active');
          break;
      }
    }
  },
  
  // Close panel
  closePanel(name) {
    const panel = document.getElementById(name + 'Panel');
    if (panel) {
      panel.classList.remove('show');
    }
    if (this.activePanel === name) {
      this.activePanel = null;
    }
    Inventory.hideTooltip();
  },
  
  // Render character panel
  renderCharacter() {
    const realm = REALMS[Player.realm];
    document.getElementById('charRealm').textContent = `🌟 ${realm.name} - Tầng ${Player.realmStage}`;
    document.getElementById('realmBar').style.width = (Player.realmExp / Player.realmMaxExp * 100) + '%';
    document.getElementById('realmText').textContent = `${Player.realmExp}/${Player.realmMaxExp}`;
    
    // Calculate pet bonus display
    let petBonusText = '';
    if (Player.activePet && PETS[Player.activePet]) {
      const pet = PETS[Player.activePet];
      if (pet.bonus.atk) petBonusText = `(+${pet.bonus.atk} từ pet)`;
      else if (pet.bonus.def) petBonusText = `(+${pet.bonus.def} từ pet)`;
      else if (pet.bonus.speed) petBonusText = `(+${Math.round(pet.bonus.speed / 2.8 * 100)}% từ pet)`;
    }
    
    const stats = document.getElementById('charStats');
    stats.innerHTML = `
      <div class="char-stat-row"><span class="stat-name">⚔️ Công kích</span><span class="stat-val">${Player.atk} ${Player.activePet && PETS[Player.activePet]?.bonus.atk ? '<span style="color:#4caf50;font-size:9px">+' + PETS[Player.activePet].bonus.atk + '</span>' : ''}</span></div>
      <div class="char-stat-row"><span class="stat-name">🛡️ Phòng ngự</span><span class="stat-val">${Player.def} ${Player.activePet && PETS[Player.activePet]?.bonus.def ? '<span style="color:#4caf50;font-size:9px">+' + PETS[Player.activePet].bonus.def + '</span>' : ''}</span></div>
      <div class="char-stat-row"><span class="stat-name">❤️ Sinh mệnh</span><span class="stat-val">${Player.hp}/${Player.maxHp}</span></div>
      <div class="char-stat-row"><span class="stat-name">💎 Linh lực</span><span class="stat-val">${Player.mp}/${Player.maxMp}</span></div>
      <div class="char-stat-row"><span class="stat-name">💨 Tốc độ</span><span class="stat-val">${Player.speed.toFixed(1)} ${Player.activePet && PETS[Player.activePet]?.bonus.speed ? '<span style="color:#4caf50;font-size:9px">+10%</span>' : ''}</span></div>
      <div class="char-stat-row"><span class="stat-name">💥 Tỷ lệ bạo kích</span><span class="stat-val">${(Player.critRate * 100).toFixed(1)}%</span></div>
      <div class="char-stat-row"><span class="stat-name">🔥 Sát thương bạo kích</span><span class="stat-val">${(Player.critDmg * 100).toFixed(0)}%</span></div>
      <div class="char-stat-row"><span class="stat-name">💰 Vàng</span><span class="stat-val">${Utils.formatNumber(Player.gold)}</span></div>
      <div class="char-stat-row"><span class="stat-name">📊 Level</span><span class="stat-val">${Player.level}</span></div>
      <div class="char-stat-row"><span class="stat-name">⭐ EXP</span><span class="stat-val">${Player.exp}/${Player.maxExp}</span></div>
    `;
    
    // Pet section
    const petSection = document.createElement('div');
    petSection.style.cssText = 'margin-top:15px;padding-top:15px;border-top:1px solid #333';
    
    let petContent = '<div style="color:#f0c040;font-size:12px;margin-bottom:10px;font-weight:bold">🐾 Linh Thú (+10% EXP)</div>';
    
    if (Player.activePet) {
      const pet = PETS[Player.activePet];
      let bonusText = '';
      if (pet.bonus.atk) bonusText = `⚔️ +${pet.bonus.atk} ATK`;
      else if (pet.bonus.def) bonusText = `🛡️ +${pet.bonus.def} DEF`;
      else if (pet.bonus.speed) bonusText = `💨 +10% Speed`;
      
      petContent += `
        <div style="background:rgba(76,175,80,0.15);border:1px solid #4caf50;border-radius:8px;padding:10px;display:flex;align-items:center;gap:10px">
          <div style="width:32px;height:32px;background:#1a1a2e;border:1px solid #4caf50;border-radius:6px;display:flex;align-items:center;justify-content:center">
            <canvas id="charPetCanvas" width="16" height="16" style="image-rendering:pixelated"></canvas>
          </div>
          <div>
            <div style="color:#4caf50;font-size:12px;font-weight:bold">${pet.name}</div>
            <div style="color:#8f8;font-size:10px">${bonusText}</div>
          </div>
        </div>
        <div style="margin-top:8px;display:flex;gap:6px">
          ${Player.ownedPets.map(pId => {
            const p = PETS[pId];
            const isActive = pId === Player.activePet;
            return `<button onclick="Player.setActivePet('${pId}')" style="flex:1;padding:6px;border:1px solid ${isActive ? '#4caf50' : '#666'};background:${isActive ? 'rgba(76,175,80,0.2)' : 'rgba(255,255,255,0.05)'};border-radius:5px;color:${isActive ? '#4caf50' : '#888'};font-size:9px;cursor:pointer;font-family:inherit">${p.name}</button>`;
          }).join('')}
          <button onclick="Player.setActivePet(null)" style="padding:6px 10px;border:1px solid #f44;background:rgba(244,67,54,0.1);border-radius:5px;color:#f44;font-size:9px;cursor:pointer;font-family:inherit">Thu hồi</button>
        </div>
      `;
    } else if (Player.ownedPets.length > 0) {
      petContent += `
        <div style="color:#888;font-size:10px;margin-bottom:8px">Chọn linh thú để triệu hồi:</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          ${Player.ownedPets.map(pId => {
            const p = PETS[pId];
            return `<button onclick="Player.setActivePet('${pId}')" style="padding:8px 12px;border:1px solid #666;background:rgba(255,255,255,0.05);border-radius:6px;color:#ccc;font-size:10px;cursor:pointer;font-family:inherit">🐾 ${p.name}</button>`;
          }).join('')}
        </div>
      `;
    } else {
      petContent += `<div style="color:#666;font-size:10px;text-align:center;padding:10px">Chưa có linh thú. Mua từ NPC Shop!</div>`;
    }
    
    petSection.innerHTML = petContent;
    stats.appendChild(petSection);
    
    // Draw pet in character panel if active
    setTimeout(() => {
      const petCanvas = document.getElementById('charPetCanvas');
      if (petCanvas && Player.activePet) {
        const ctx = petCanvas.getContext('2d');
        ctx.clearRect(0, 0, 16, 16);
        const sprite = Sprites.getPetSprite(Player.activePet, false);
        Sprites.drawPixelArt(ctx, sprite, 2, 0, 0);
      }
    }, 10);
    
    // Equipped items
    const equippedEl = document.getElementById('equippedItems');
    equippedEl.innerHTML = '';
    
    const slots = [
      { key: 'weapon', icon: '⚔️', name: 'Vũ khí' },
      { key: 'armor', icon: '🛡️', name: 'Giáp' },
      { key: 'accessory', icon: '💍', name: 'Phụ kiện' }
    ];
    
    for (const slot of slots) {
      const itemId = Player.equipped[slot.key];
      const itemData = itemId ? ITEMS[itemId] : null;
      
      const row = document.createElement('div');
      row.className = 'char-stat-row';
      row.style.cursor = itemId ? 'pointer' : 'default';
      row.innerHTML = `
        <span class="stat-name">${slot.icon} ${slot.name}</span>
        <span class="stat-val" style="color:${itemData ? COLORS[itemData.rarity] || '#ccc' : '#666'}">
          ${itemData ? itemData.name : '(Trống)'}
        </span>
      `;
      
      if (itemId) {
        row.onclick = () => {
          if (confirm(`Tháo ${itemData.name}?`)) {
            Player.unequip(slot.key);
            this.renderCharacter();
          }
        };
      }
      
      equippedEl.appendChild(row);
    }
  },
  
  // Setup event listeners
  setupEventListeners() {
    // Close panels on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          const panelName = overlay.id.replace('Panel', '');
          this.closePanel(panelName);
        }
      });
    });
    
    // Minimap toggle
    document.getElementById('minimapToggle').onclick = () => {
      GameState.minimapVisible = !GameState.minimapVisible;
      document.getElementById('minimap').classList.toggle('hidden', !GameState.minimapVisible);
    };
  }
};

console.log('🎨 UI loaded');