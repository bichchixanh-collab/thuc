// ==================== NPC SYSTEM ====================
const NPC = {
  list: [],
  currentDialog: null,
  currentShopTab: 'items',
  
  // NPC type definitions
  types: {
    teleporter: {
      name: 'Truyền Tống Sư',
      title: 'Pháp sư dịch chuyển',
      sprite: 'npcTeleporter',
      dialog: 'Chào đạo hữu! Ta có thể đưa ngươi đến các vùng đất khác.',
      service: 'teleport'
    },
    shop: {
      name: 'Tiểu Nhị',
      title: 'Thương nhân & Linh Thú',
      sprite: 'npcShop',
      dialog: 'Hoan nghênh quang lâm! Có đủ loại đan dược và linh thú!',
      service: 'shop'
    },
    elder: {
      name: 'Trưởng Lão',
      title: 'Tu sĩ cao cấp',
      sprite: 'npcTeleporter',
      dialog: 'Tiểu tử, tu luyện cần kiên trì!',
      service: 'advice'
    },
    questGiver: {
      name: 'Huyền Minh',
      title: 'Nhiệm vụ sứ',
      sprite: 'npcShop',
      dialog: 'Ta có nhiệm vụ cần người thực hiện.',
      service: 'quest'
    }
  },
  
  // Shop inventory
  shopItems: [
    { id: 'hpPotion', price: 20 },
    { id: 'mpPotion', price: 30 },
    { id: 'hpPotionMedium', price: 80 },
    { id: 'mpPotionMedium', price: 100 },
    { id: 'expPotion', price: 200 },
    { id: 'realmPill', price: 500 },
    { id: 'ironSword', price: 150 },
    { id: 'leatherArmor', price: 180 },
    { id: 'copperRing', price: 100 }
  ],
  
  // Spawn NPCs for map
  spawnForMap(mapIndex) {
    this.list = [];
    
    // Always spawn teleporter near spawn
    this.spawn('teleporter', 500, 380);
    
    // Spawn shop in most maps
    if (mapIndex <= 3) {
      this.spawn('shop', 320, 500);
    }
    
    // Additional NPCs based on map
    if (mapIndex === 0) {
      this.spawn('elder', 550, 550);
    }
    
    if (mapIndex >= 1) {
      this.spawn('questGiver', 400, 600);
    }
  },
  
  // Spawn single NPC
  spawn(typeKey, x, y) {
    const type = this.types[typeKey];
    if (!type) return null;
    
    const npc = {
      type: typeKey,
      name: type.name,
      title: type.title,
      x, y,
      sprite: type.sprite,
      dialog: type.dialog,
      service: type.service,
      interactRange: 80
    };
    
    this.list.push(npc);
    return npc;
  },
  
  // Update NPCs
  update(dt) {
    for (const npc of this.list) {
      const dist = Utils.dist(Player.x, Player.y, npc.x, npc.y);
      npc.canInteract = dist <= npc.interactRange;
    }
  },
  
  // Get NPC at position
  getAt(x, y, radius = 50) {
    for (const npc of this.list) {
      const dist = Utils.dist(x, y, npc.x, npc.y);
      if (dist <= radius) {
        return npc;
      }
    }
    return null;
  },
  
  // Interact with NPC
  interact(npc) {
    if (!npc) return;
    
    this.currentDialog = npc;
    
    const dialogEl = document.getElementById('npcDialog');
    
    // Draw NPC avatar
    const avatarCanvas = document.getElementById('npcAvatarCanvas');
    const ctx = avatarCanvas.getContext('2d');
    ctx.clearRect(0, 0, 32, 32);
    const spriteKey = (npc.type === 'teleporter' || npc.type === 'elder') ? 'teleporter' : 'shop';
    const spriteData = Sprites.getNPCSprite(spriteKey);
    Sprites.drawPixelArt(ctx, spriteData, 2, 0, 0);
    
    // Set dialog content
    document.getElementById('npcName').textContent = npc.name;
    document.getElementById('npcTitle').textContent = npc.title;
    document.getElementById('npcText').textContent = npc.dialog;
    
    // Build options based on service
    const optionsEl = document.getElementById('npcOptions');
    optionsEl.innerHTML = '';
    
    switch (npc.service) {
      case 'teleport':
        this.buildTeleportOptions(optionsEl);
        break;
      case 'shop':
        this.buildShopOptions(optionsEl);
        break;
      case 'quest':
        this.buildQuestOptions(optionsEl);
        break;
      default:
        this.buildGenericOptions(optionsEl);
    }
    
    dialogEl.classList.add('show');
    UI.addLog(`🗣️ Nói chuyện với ${npc.name}`, 'npc');
  },
  
  // Build teleport options
  buildTeleportOptions(container) {
    for (let i = 0; i < Maps.data.length; i++) {
      const map = Maps.data[i];
      const canGo = Player.level >= map.lvl;
      const isCurrent = i === Maps.currentIndex;
      
      if (isCurrent) continue;
      
      const option = document.createElement('div');
      option.className = 'npc-option';
      
      if (!canGo || Player.gold < map.travelCost) {
        option.classList.add('disabled');
      }
      
      option.innerHTML = `
        <span>🗺️ ${map.name} (Lv.${map.lvl})</span>
        <span class="cost">${map.travelCost > 0 ? map.travelCost + ' 💰' : 'Miễn phí'}</span>
      `;
      
      if (canGo && Player.gold >= map.travelCost) {
        const mapIndex = i;
        option.addEventListener('click', () => {
          Maps.travelTo(mapIndex);
          this.closeDialog();
        });
      }
      
      container.appendChild(option);
    }
    
    this.addCloseOption(container);
  },
  
  // ===== BUILD SHOP OPTIONS - ĐÃ SỬA =====
  buildShopOptions(container) {
    const self = this;
    
    // Tab row
    const tabRow = document.createElement('div');
    tabRow.style.cssText = 'display:flex;gap:8px;margin-bottom:12px';
    
    // Tab: Items
    const itemsTab = document.createElement('button');
    itemsTab.textContent = '🧪 Vật phẩm';
    itemsTab.style.cssText = `
      flex:1; padding:10px; border-radius:8px; cursor:pointer;
      font-family:inherit; font-size:11px; font-weight:bold;
      border: 2px solid ${this.currentShopTab === 'items' ? '#f0c040' : '#444'};
      background: ${this.currentShopTab === 'items' ? 'rgba(240,192,64,0.2)' : 'rgba(255,255,255,0.05)'};
      color: ${this.currentShopTab === 'items' ? '#f0c040' : '#888'};
    `;
    itemsTab.addEventListener('click', () => {
      console.log('📦 Switch to Items tab');
      self.currentShopTab = 'items';
      self.interact(self.currentDialog);
    });
    
    // Tab: Pets
    const petsTab = document.createElement('button');
    petsTab.textContent = '🐾 Linh Thú';
    petsTab.style.cssText = `
      flex:1; padding:10px; border-radius:8px; cursor:pointer;
      font-family:inherit; font-size:11px; font-weight:bold;
      border: 2px solid ${this.currentShopTab === 'pets' ? '#f0c040' : '#444'};
      background: ${this.currentShopTab === 'pets' ? 'rgba(240,192,64,0.2)' : 'rgba(255,255,255,0.05)'};
      color: ${this.currentShopTab === 'pets' ? '#f0c040' : '#888'};
    `;
    petsTab.addEventListener('click', () => {
      console.log('🐾 Switch to Pets tab');
      self.currentShopTab = 'pets';
      self.interact(self.currentDialog);
    });
    
    tabRow.appendChild(itemsTab);
    tabRow.appendChild(petsTab);
    container.appendChild(tabRow);
    
    // Content based on tab
    if (this.currentShopTab === 'items') {
      this.buildItemsShop(container);
    } else {
      this.buildPetsShop(container);
    }
    
    // Sell info
    const sellInfo = document.createElement('div');
    sellInfo.style.cssText = 'color:#666;font-size:9px;margin:12px 0 8px;text-align:center';
    sellInfo.textContent = '💰 Mở túi đồ để bán vật phẩm';
    container.appendChild(sellInfo);
    
    this.addCloseOption(container);
  },
  
  // Build items shop content
  buildItemsShop(container) {
    const title = document.createElement('div');
    title.style.cssText = 'color:#f0c040;font-size:11px;margin-bottom:10px;font-weight:bold';
    title.textContent = '🛒 Mua vật phẩm';
    container.appendChild(title);
    
    for (const shopItem of this.shopItems) {
      const itemData = ITEMS[shopItem.id];
      if (!itemData) continue;
      
      const canBuy = Player.gold >= shopItem.price;
      
      const option = document.createElement('div');
      option.className = 'npc-option';
      if (!canBuy) option.classList.add('disabled');
      
      option.innerHTML = `
        <span>${itemData.name}</span>
        <span class="cost">${shopItem.price} 💰</span>
      `;
      
      if (canBuy) {
        const itemId = shopItem.id;
        const price = shopItem.price;
        option.addEventListener('click', () => {
          this.buyItem(itemId, price);
        });
      }
      
      container.appendChild(option);
    }
  },
  
  // Build pets shop content
  buildPetsShop(container) {
    const self = this;
    
    const title = document.createElement('div');
    title.style.cssText = 'color:#f0c040;font-size:11px;margin-bottom:10px;font-weight:bold';
    title.textContent = '🐾 Mua & Triệu hồi Linh Thú (+10% EXP)';
    container.appendChild(title);
    
    // Current pet display
    if (Player.activePet) {
      const currentPet = PETS[Player.activePet];
      const currentInfo = document.createElement('div');
      currentInfo.style.cssText = `
        background:rgba(76,175,80,0.15);
        border:2px solid #4caf50;
        border-radius:8px;
        padding:10px;
        margin-bottom:12px;
        font-size:11px;
        color:#4caf50;
        display:flex;
        align-items:center;
        gap:8px;
      `;
      currentInfo.innerHTML = `<span style="font-size:18px">🐾</span> Đang triệu hồi: <b>${currentPet.name}</b>`;
      container.appendChild(currentInfo);
    }
    
    // Pet list
    for (const petId in PETS) {
      const pet = PETS[petId];
      const owned = Player.ownedPets.includes(petId);
      const isActive = Player.activePet === petId;
      const canBuy = !owned && Player.gold >= pet.price;
      
      const option = document.createElement('div');
      option.className = 'npc-option';
      option.style.cssText = 'flex-direction:column;align-items:stretch;gap:6px';
      
      // Build bonus text
      let bonusText = '';
      let bonusIcon = '';
      if (pet.bonus.atk) {
        bonusText = `+${pet.bonus.atk} ATK`;
        bonusIcon = '⚔️';
      } else if (pet.bonus.def) {
        bonusText = `+${pet.bonus.def} DEF`;
        bonusIcon = '🛡️';
      } else if (pet.bonus.speed) {
        bonusText = `+10% Speed`;
        bonusIcon = '💨';
      }
      
      if (owned) {
        // Already owned
        if (isActive) {
          option.style.borderColor = '#4caf50';
          option.style.background = 'rgba(76,175,80,0.15)';
          option.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center">
              <span>🐾 ${pet.name}</span>
              <span style="color:#4caf50;font-size:10px">✓ Đang dùng</span>
            </div>
            <div style="font-size:9px;color:#8f8">${bonusIcon} ${bonusText} | +10% EXP</div>
          `;
          option.addEventListener('click', () => {
            console.log('🐾 Thu hồi pet');
            Player.setActivePet(null);
            self.interact(self.currentDialog);
          });
        } else {
          option.style.borderColor = '#2196f3';
          option.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center">
              <span>🐾 ${pet.name}</span>
              <span style="color:#2196f3;font-size:10px">📤 Triệu hồi</span>
            </div>
            <div style="font-size:9px;color:#888">${bonusIcon} ${bonusText} | +10% EXP</div>
          `;
          const pId = petId;
          option.addEventListener('click', () => {
            console.log('🐾 Triệu hồi pet:', pId);
            Player.setActivePet(pId);
            self.interact(self.currentDialog);
          });
        }
      } else {
        // Not owned - can buy
        if (!canBuy) {
          option.classList.add('disabled');
        }
        option.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span>🐾 ${pet.name}</span>
            <span class="cost">${pet.price} 💰</span>
          </div>
          <div style="font-size:9px;color:#888">${bonusIcon} ${bonusText} | +10% EXP</div>
          <div style="font-size:9px;color:#aaa;font-style:italic">${pet.desc}</div>
        `;
        
        if (canBuy) {
          const pId = petId;
          option.addEventListener('click', () => {
            console.log('🐾 Mua pet:', pId);
            if (Player.buyPet(pId)) {
              self.interact(self.currentDialog);
            }
          });
        }
      }
      
      container.appendChild(option);
    }
  },
  
  // Build quest options
  buildQuestOptions(container) {
    const activeQuests = Quests.getActive().slice(0, 3);
    
    for (const quest of activeQuests) {
      const option = document.createElement('div');
      option.className = 'npc-option';
      
      if (quest.completed && !quest.claimed) {
        option.innerHTML = `
          <span>🎁 ${quest.name}</span>
          <span style="color:#4caf50">Nhận thưởng!</span>
        `;
        const qId = quest.id;
        option.addEventListener('click', () => {
          Quests.claimReward(qId);
          this.interact(this.currentDialog);
        });
      } else {
        option.innerHTML = `
          <span>📜 ${quest.name}</span>
          <span style="color:#888">${quest.current}/${quest.needed}</span>
        `;
        const qId = quest.id;
        option.addEventListener('click', () => {
          Quests.setActive(qId);
          UI.addLog(`📌 Theo dõi: ${quest.name}`, 'system');
        });
      }
      
      container.appendChild(option);
    }
    
    this.addCloseOption(container);
  },
  
  // Build generic options
  buildGenericOptions(container) {
    const option = document.createElement('div');
    option.className = 'npc-option';
    option.innerHTML = '<span>💬 Cảm ơn lời khuyên!</span>';
    option.addEventListener('click', () => this.closeDialog());
    container.appendChild(option);
    
    this.addCloseOption(container);
  },
  
  // Add close option
  addCloseOption(container) {
    const close = document.createElement('div');
    close.className = 'npc-option';
    close.innerHTML = '<span>👋 Tạm biệt</span>';
    close.addEventListener('click', () => this.closeDialog());
    container.appendChild(close);
  },
  
  // Buy item from shop
  buyItem(itemId, price) {
    if (Player.gold < price) {
      UI.addLog('❌ Không đủ vàng!', 'system');
      return false;
    }
    
    if (!Inventory.add(itemId, 1)) {
      UI.addLog('❌ Túi đồ đã đầy!', 'system');
      return false;
    }
    
    Player.gold -= price;
    UI.updateGold();
    
    const itemData = ITEMS[itemId];
    UI.addLog(`🛒 Mua ${itemData.name}! -${price} 💰`, 'gold');
    
    return true;
  },
  
  // Show travel dialog (from map panel)
  showTravelDialog(mapIndex) {
    const map = Maps.data[mapIndex];
    
    const fakeNpc = {
      type: 'teleporter',
      name: 'Truyền Tống Trận',
      title: 'Pháp trận dịch chuyển',
      dialog: `Dịch chuyển đến ${map.name}? Chi phí: ${map.travelCost} vàng.`,
      service: 'confirm_travel',
      targetMap: mapIndex
    };
    
    this.currentDialog = fakeNpc;
    
    const dialogEl = document.getElementById('npcDialog');
    
    const avatarCanvas = document.getElementById('npcAvatarCanvas');
    const ctx = avatarCanvas.getContext('2d');
    ctx.clearRect(0, 0, 32, 32);
    ctx.fillStyle = map.color;
    ctx.beginPath();
    ctx.arc(16, 16, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(16, 16, 6, 0, Math.PI * 2);
    ctx.fill();
    
    document.getElementById('npcName').textContent = fakeNpc.name;
    document.getElementById('npcTitle').textContent = map.name;
    document.getElementById('npcText').textContent = fakeNpc.dialog;
    
    const optionsEl = document.getElementById('npcOptions');
    optionsEl.innerHTML = '';
    
    const canGo = Player.level >= map.lvl && Player.gold >= map.travelCost;
    
    const confirmOption = document.createElement('div');
    confirmOption.className = 'npc-option';
    if (!canGo) confirmOption.classList.add('disabled');
    confirmOption.innerHTML = `
      <span>✅ Dịch chuyển</span>
      <span class="cost">${map.travelCost} 💰</span>
    `;
    if (canGo) {
      confirmOption.addEventListener('click', () => {
        Maps.travelTo(mapIndex);
        this.closeDialog();
      });
    }
    optionsEl.appendChild(confirmOption);
    
    this.addCloseOption(optionsEl);
    
    dialogEl.classList.add('show');
  },
  
  // Close dialog
  closeDialog() {
    document.getElementById('npcDialog').classList.remove('show');
    this.currentDialog = null;
  }
};

console.log('🧙 NPC loaded');