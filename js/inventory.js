// ==================== INVENTORY SYSTEM ====================
const Inventory = {
  items: [],
  maxSize: CONFIG.INVENTORY_SIZE,

  selectedItem: null,
  selectedSlot: null,

  // [FIX] Drag state cho tooltip
  _drag: { active: false, startX: 0, startY: 0, offX: 0, offY: 0 },

  init() {
    this.add('hpPotion', 5);
    this.add('mpPotion', 3);
    this.add('woodenSword', 1);
    this.add('clothRobe', 1);
    // [FIX] Gắn drag handler cho itemTooltip sau khi DOM sẵn sàng
    this._initTooltipDrag();
  },

  // [FIX] Khởi tạo kéo thả cho tooltip
  _initTooltipDrag() {
    const tooltip = document.getElementById('itemTooltip');
    if (!tooltip) return;

    const drag = this._drag;

    // Thêm nút đóng vào tooltip nếu chưa có
    if (!tooltip.querySelector('.tooltip-close-btn')) {
      const closeBtn = document.createElement('div');
      closeBtn.className = 'tooltip-close-btn';
      closeBtn.textContent = '✕';
      closeBtn.style.cssText = [
        'position:absolute', 'top:6px', 'right:8px',
        'cursor:pointer', 'color:#888', 'font-size:14px',
        'line-height:1', 'padding:2px 4px', 'border-radius:3px',
        'user-select:none', 'z-index:10'
      ].join(';');
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        Inventory.hideTooltip();
      });
      closeBtn.addEventListener('mouseenter', () => { closeBtn.style.color = '#fff'; });
      closeBtn.addEventListener('mouseleave', () => { closeBtn.style.color = '#888'; });
      tooltip.appendChild(closeBtn);
    }

    // Đảm bảo tooltip có position:fixed và pointer-events
    tooltip.style.position = 'fixed';

    // Header để kéo (dùng tooltipName làm handle)
    const getHandle = () => tooltip.querySelector('#tooltipName') || tooltip;

    const onMouseDown = (e) => {
      // Chỉ kéo khi click vào phần header (name), không phải button
      if (e.target.closest('button') || e.target.classList.contains('tooltip-close-btn')) return;

      drag.active = true;
      const rect = tooltip.getBoundingClientRect();
      drag.offX = e.clientX - rect.left;
      drag.offY = e.clientY - rect.top;
      tooltip.style.cursor = 'grabbing';
      e.preventDefault();
    };

    const onTouchStart = (e) => {
      if (e.target.closest('button') || e.target.classList.contains('tooltip-close-btn')) return;
      const touch = e.touches[0];
      drag.active = true;
      const rect = tooltip.getBoundingClientRect();
      drag.offX = touch.clientX - rect.left;
      drag.offY = touch.clientY - rect.top;
      e.preventDefault();
    };

    const onMouseMove = (e) => {
      if (!drag.active) return;
      let newLeft = e.clientX - drag.offX;
      let newTop  = e.clientY - drag.offY;
      // Clamp trong viewport
      newLeft = Math.max(0, Math.min(window.innerWidth  - tooltip.offsetWidth,  newLeft));
      newTop  = Math.max(0, Math.min(window.innerHeight - tooltip.offsetHeight, newTop));
      tooltip.style.left = newLeft + 'px';
      tooltip.style.top  = newTop  + 'px';
    };

    const onTouchMove = (e) => {
      if (!drag.active) return;
      const touch = e.touches[0];
      let newLeft = touch.clientX - drag.offX;
      let newTop  = touch.clientY - drag.offY;
      newLeft = Math.max(0, Math.min(window.innerWidth  - tooltip.offsetWidth,  newLeft));
      newTop  = Math.max(0, Math.min(window.innerHeight - tooltip.offsetHeight, newTop));
      tooltip.style.left = newLeft + 'px';
      tooltip.style.top  = newTop  + 'px';
      e.preventDefault();
    };

    const onEnd = () => {
      drag.active = false;
      tooltip.style.cursor = 'default';
    };

    tooltip.addEventListener('mousedown', onMouseDown);
    tooltip.addEventListener('touchstart', onTouchStart, { passive: false });
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('touchmove',  onTouchMove, { passive: false });
    document.addEventListener('mouseup',  onEnd);
    document.addEventListener('touchend', onEnd);

    // Style cho tooltip: thêm grab cursor và relative position để chứa close btn
    tooltip.style.position = 'fixed';
    tooltip.style.cursor   = 'default';
    if (!tooltip.style.minWidth) tooltip.style.minWidth = '180px';
  },

  add(itemId, count = 1) {
    const itemData = ITEMS[itemId];
    if (!itemData) return false;

    const stackable = itemData.type === 'consumable' || itemData.type === 'material';

    if (stackable) {
      const existing = this.items.find(i => i.id === itemId);
      if (existing) {
        existing.count += count;
        return true;
      }
    }

    if (this.items.length >= this.maxSize) {
      UI.addLog('❌ Túi đồ đã đầy!', 'system');
      return false;
    }

    this.items.push({ id: itemId, count });
    return true;
  },

  remove(itemId, count = 1) {
    const idx = this.items.findIndex(i => i.id === itemId);
    if (idx === -1) return false;

    this.items[idx].count -= count;
    if (this.items[idx].count <= 0) {
      this.items.splice(idx, 1);
    }
    return true;
  },

  getCount(itemId) {
    const item = this.items.find(i => i.id === itemId);
    return item ? item.count : 0;
  },

  has(itemId, count = 1) {
    return this.getCount(itemId) >= count;
  },

  useItem(itemId) {
    const itemData = ITEMS[itemId];
    if (!itemData || itemData.type !== 'consumable') return false;
    if (!this.has(itemId)) return false;

    const effect = itemData.effect;
    if (effect.hp) {
      Player.heal(effect.hp, 0);
      UI.addLog(`❤️ Sử dụng ${itemData.name}, +${effect.hp} HP`, 'heal');
    }
    if (effect.mp) {
      Player.heal(0, effect.mp);
      UI.addLog(`💎 Sử dụng ${itemData.name}, +${effect.mp} MP`, 'heal');
    }
    if (effect.exp) {
      Player.gainExp(effect.exp);
      UI.addLog(`⭐ Sử dụng ${itemData.name}, +${effect.exp} EXP`, 'exp');
    }
    if (effect.realmExp) {
      Player.gainRealmExp(effect.realmExp);
      UI.addLog(`✨ Sử dụng ${itemData.name}, +${effect.realmExp} Tu Vi`, 'realm');
    }

    this.remove(itemId, 1);
    this.render();
    return true;
  },

  sellItem(itemId, count = 1) {
    const itemData = ITEMS[itemId];
    if (!itemData) return false;

    const actualCount = Math.min(count, this.getCount(itemId));
    if (actualCount <= 0) return false;

    const gold = itemData.sellPrice * actualCount;
    Player.gold += gold;
    this.remove(itemId, actualCount);

    UI.addLog(`💰 Bán ${actualCount}x ${itemData.name}, +${gold} vàng`, 'gold');
    UI.updateGold();
    this.render();
    return true;
  },

  dropItem(itemId, count = 1) {
    const itemData = ITEMS[itemId];
    if (!itemData) return false;

    const actualCount = Math.min(count, this.getCount(itemId));
    if (actualCount <= 0) return false;

    this.remove(itemId, actualCount);
    UI.addLog(`🗑️ Vứt bỏ ${actualCount}x ${itemData.name}`, 'system');
    this.render();
    return true;
  },

  render(filter = 'all') {
    const grid = document.getElementById('invGrid');
    grid.innerHTML = '';

    let filtered = this.items;
    if (filter !== 'all') {
      filtered = this.items.filter(item => {
        const data = ITEMS[item.id];
        return data && data.type === filter;
      });
    }

    for (let i = 0; i < this.maxSize; i++) {
      const slot = document.createElement('div');
      slot.className = 'inv-slot';

      if (i < filtered.length) {
        const item = filtered[i];
        const itemData = ITEMS[item.id];

        if (itemData) {
          slot.classList.add('has-item', itemData.rarity || 'common');

          const canvas = document.createElement('canvas');
          canvas.width = 16;
          canvas.height = 16;
          this.drawItemIcon(canvas.getContext('2d'), item.id);
          slot.appendChild(canvas);

          if (item.count > 1) {
            const countBadge = document.createElement('div');
            countBadge.className = 'item-count';
            countBadge.textContent = item.count > 99 ? '99+' : item.count;
            slot.appendChild(countBadge);
          }

          for (const eqSlot in Player.equipped) {
            if (Player.equipped[eqSlot] === item.id) {
              const badge = document.createElement('div');
              badge.className = 'equipped-badge';
              badge.textContent = 'E';
              slot.appendChild(badge);
              break;
            }
          }

          slot.onclick = (e) => this.showTooltip(item.id, i, e);
        }
      }

      grid.appendChild(slot);
    }

    document.getElementById('invCount').textContent = `${this.items.length}/${this.maxSize}`;
    document.getElementById('invGold').textContent = `💰 ${Utils.formatNumber(Player.gold)}`;
  },

  switchTab(btn, filter) {
    document.querySelectorAll('#inventoryPanel .tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    this.render(filter);
  },

  // [FIX] showTooltip với close button và drag support
  showTooltip(itemId, slotIndex, event) {
    const itemData = ITEMS[itemId];
    if (!itemData) return;

    this.selectedItem = itemId;
    this.selectedSlot = slotIndex;

    const tooltip = document.getElementById('itemTooltip');

    document.getElementById('tooltipName').textContent = itemData.name;
    document.getElementById('tooltipName').className = `item-name ${itemData.rarity || 'common'}`;

    const typeNames = {
      consumable: '🧪 Tiêu hao phẩm',
      material:   '📦 Nguyên liệu',
      weapon:     '⚔️ Vũ khí',
      armor:      '🛡️ Giáp',
      accessory:  '💍 Phụ kiện'
    };
    document.getElementById('tooltipType').textContent = typeNames[itemData.type] || itemData.type;

    let statsHtml = '';
    if (itemData.stats) {
      const statNames = {
        atk: '⚔️ Công kích', def: '🛡️ Phòng ngự',
        hp: '❤️ Sinh mệnh',  mp: '💎 Linh lực',
        critRate: '💥 Bạo kích', critDmg: '🔥 Bạo thương'
      };
      for (const [stat, value] of Object.entries(itemData.stats)) {
        const display = stat.includes('crit') ? `+${(value * 100).toFixed(0)}%` : `+${value}`;
        statsHtml += `${statNames[stat] || stat}: ${display}<br>`;
      }
    }
    document.getElementById('tooltipStats').innerHTML = statsHtml;
    document.getElementById('tooltipDesc').textContent = itemData.desc;

    const actions = document.getElementById('tooltipActions');
    actions.innerHTML = '';

    if (itemData.type === 'consumable') {
      const useBtn = document.createElement('button');
      useBtn.className = 'item-action-btn use';
      useBtn.textContent = '🧪 Sử dụng';
      useBtn.onclick = () => { this.useItem(itemId); this.hideTooltip(); };
      actions.appendChild(useBtn);
    }

    if (['weapon', 'armor', 'accessory'].includes(itemData.type)) {
      const equipBtn = document.createElement('button');
      equipBtn.className = 'item-action-btn equip';
      equipBtn.textContent = '🗡️ Trang bị';
      equipBtn.onclick = () => { Player.equip(itemId); this.render(); this.hideTooltip(); };
      actions.appendChild(equipBtn);
    }

    const sellBtn = document.createElement('button');
    sellBtn.className = 'item-action-btn sell';
    sellBtn.textContent = `💰 Bán (${itemData.sellPrice})`;
    sellBtn.onclick = () => { this.sellItem(itemId, 1); this.hideTooltip(); };
    actions.appendChild(sellBtn);

    const dropBtn = document.createElement('button');
    dropBtn.className = 'item-action-btn drop';
    dropBtn.textContent = '🗑️ Vứt';
    dropBtn.onclick = () => { this.dropItem(itemId, 1); this.hideTooltip(); };
    actions.appendChild(dropBtn);

    // Áp dụng rarity class
    tooltip.className = `${itemData.rarity || 'common'}`;
    tooltip.classList.add('show');

    // [FIX] Position: ưu tiên bên phải, fallback bên trái
    const rect = event.target.getBoundingClientRect();
    let left = rect.right + 10;
    let top  = rect.top;

    if (left + 200 > window.innerWidth)  left = rect.left - 210;
    if (top + 280 > window.innerHeight)  top  = window.innerHeight - 290;
    if (left < 0) left = 4;
    if (top  < 0) top  = 4;

    tooltip.style.left = left + 'px';
    tooltip.style.top  = top  + 'px';

    // [FIX] Đảm bảo close button luôn hiện
    let closeBtn = tooltip.querySelector('.tooltip-close-btn');
    if (!closeBtn) {
      this._initTooltipDrag(); // init lại nếu chưa có
    }
  },

  hideTooltip() {
    const tooltip = document.getElementById('itemTooltip');
    if (tooltip) tooltip.classList.remove('show');
    this.selectedItem = null;
    this.selectedSlot = null;
  },

  // Draw item icon — không đổi
  drawItemIcon(ctx, itemId) {
    ctx.clearRect(0, 0, 16, 16);

    const icons = {
      hpPotion: () => {
        ctx.fillStyle = '#c62828'; ctx.fillRect(5, 3, 6, 10);
        ctx.fillStyle = '#ef5350'; ctx.fillRect(5, 3, 6, 5);
        ctx.fillStyle = '#757575'; ctx.fillRect(6, 0, 4, 4);
        ctx.fillStyle = '#bdbdbd'; ctx.fillRect(6, 1, 4, 2);
      },
      hpPotionMedium: () => {
        ctx.fillStyle = '#b71c1c'; ctx.fillRect(4, 2, 8, 12);
        ctx.fillStyle = '#e53935'; ctx.fillRect(4, 2, 8, 6);
        ctx.fillStyle = '#ffd700'; ctx.fillRect(5, 0, 6, 3);
      },
      mpPotion: () => {
        ctx.fillStyle = '#1565c0'; ctx.fillRect(5, 3, 6, 10);
        ctx.fillStyle = '#42a5f5'; ctx.fillRect(5, 3, 6, 5);
        ctx.fillStyle = '#757575'; ctx.fillRect(6, 0, 4, 4);
      },
      mpPotionMedium: () => {
        ctx.fillStyle = '#0d47a1'; ctx.fillRect(4, 2, 8, 12);
        ctx.fillStyle = '#2196f3'; ctx.fillRect(4, 2, 8, 6);
        ctx.fillStyle = '#ffd700'; ctx.fillRect(5, 0, 6, 3);
      },
      expPotion: () => {
        ctx.fillStyle = '#f9a825'; ctx.fillRect(5, 3, 6, 10);
        ctx.fillStyle = '#ffee58'; ctx.fillRect(5, 3, 6, 5);
        ctx.fillStyle = '#757575'; ctx.fillRect(6, 0, 4, 4);
      },
      realmPill: () => {
        ctx.fillStyle = '#7b1fa2'; ctx.beginPath(); ctx.arc(8, 8, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#e040fb'; ctx.beginPath(); ctx.arc(8, 8, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(6, 6, 2, 0, Math.PI * 2); ctx.fill();
      },
      wolfFang: () => {
        ctx.fillStyle = '#fff'; ctx.beginPath();
        ctx.moveTo(8, 2); ctx.lineTo(4, 14); ctx.lineTo(12, 14); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#ddd'; ctx.fillRect(6, 12, 4, 2);
      },
      wolfPelt: () => {
        ctx.fillStyle = '#808080'; ctx.fillRect(2, 4, 12, 10);
        ctx.fillStyle = '#606060'; ctx.fillRect(3, 5, 3, 3);
        ctx.fillStyle = '#a0a0a0'; ctx.fillRect(8, 6, 4, 6);
      },
      demonCore: () => {
        ctx.fillStyle = '#8b0000'; ctx.beginPath(); ctx.arc(8, 8, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ff4444'; ctx.beginPath(); ctx.arc(8, 8, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffff00'; ctx.beginPath(); ctx.arc(8, 8, 2, 0, Math.PI * 2); ctx.fill();
      },
      spiritStone: () => {
        ctx.fillStyle = '#4169e1';
        ctx.beginPath(); ctx.moveTo(8, 1); ctx.lineTo(14, 8); ctx.lineTo(8, 15); ctx.lineTo(2, 8); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#87ceeb'; ctx.fillRect(6, 5, 4, 4);
      },
      dragonScale: () => {
        ctx.fillStyle = '#228b22'; ctx.fillRect(3, 2, 10, 12);
        ctx.fillStyle = '#32cd32'; ctx.fillRect(5, 4, 6, 8);
        ctx.fillStyle = '#90ee90'; ctx.fillRect(6, 5, 4, 4);
      },
      celestialOrb: () => {
        ctx.fillStyle = '#ffd700'; ctx.beginPath(); ctx.arc(8, 8, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff8dc'; ctx.beginPath(); ctx.arc(6, 6, 3, 0, Math.PI * 2); ctx.fill();
      },
      woodenSword: () => {
        ctx.fillStyle = '#8b4513'; ctx.fillRect(7, 1, 2, 10);
        ctx.fillStyle = '#654321'; ctx.fillRect(5, 10, 6, 2);
        ctx.fillStyle = '#a0522d'; ctx.fillRect(7, 12, 2, 3);
      },
      ironSword: () => {
        ctx.fillStyle = '#a0a0a0'; ctx.fillRect(7, 1, 2, 10);
        ctx.fillStyle = '#c0c0c0'; ctx.fillRect(7, 1, 1, 10);
        ctx.fillStyle = '#8b4513'; ctx.fillRect(5, 10, 6, 2);
        ctx.fillStyle = '#654321'; ctx.fillRect(7, 12, 2, 3);
      },
      steelSword: () => {
        ctx.fillStyle = '#b0b0b0'; ctx.fillRect(7, 0, 2, 11);
        ctx.fillStyle = '#e0e0e0'; ctx.fillRect(7, 0, 1, 11);
        ctx.fillStyle = '#1565c0'; ctx.fillRect(5, 10, 6, 2);
        ctx.fillStyle = '#0d47a1'; ctx.fillRect(7, 12, 2, 4);
      },
      silverSword: () => {
        ctx.fillStyle = '#c0c0c0'; ctx.fillRect(7, 0, 2, 11);
        ctx.fillStyle = '#ffffff'; ctx.fillRect(7, 0, 1, 11);
        ctx.fillStyle = '#9c27b0'; ctx.fillRect(5, 10, 6, 2);
        ctx.fillStyle = '#7b1fa2'; ctx.fillRect(7, 12, 2, 4);
      },
      flameSword: () => {
        ctx.fillStyle = '#ff4500'; ctx.fillRect(7, 0, 2, 11);
        ctx.fillStyle = '#ffd700'; ctx.fillRect(7, 0, 1, 8);
        ctx.fillStyle = '#8b0000'; ctx.fillRect(5, 10, 6, 2);
        ctx.fillStyle = '#654321'; ctx.fillRect(7, 12, 2, 4);
        ctx.fillStyle = '#ff6600'; ctx.fillRect(5, 2, 2, 2);
        ctx.fillStyle = '#ff6600'; ctx.fillRect(10, 4, 2, 2);
      },
      frostSword: () => {
        ctx.fillStyle = '#87ceeb'; ctx.fillRect(7, 0, 2, 11);
        ctx.fillStyle = '#ffffff'; ctx.fillRect(7, 0, 1, 11);
        ctx.fillStyle = '#4169e1'; ctx.fillRect(5, 10, 6, 2);
        ctx.fillStyle = '#1e90ff'; ctx.fillRect(7, 12, 2, 4);
        ctx.fillStyle = '#ffffff'; ctx.fillRect(5, 3, 1, 1);
        ctx.fillStyle = '#ffffff'; ctx.fillRect(10, 5, 1, 1);
      },
      celestialSword: () => {
        ctx.fillStyle = '#ffd700'; ctx.fillRect(7, 0, 2, 11);
        ctx.fillStyle = '#ffffff'; ctx.fillRect(7, 0, 1, 11);
        ctx.fillStyle = '#ff69b4'; ctx.fillRect(4, 9, 8, 3);
        ctx.fillStyle = '#da70d6'; ctx.fillRect(7, 12, 2, 4);
        ctx.fillStyle = 'rgba(255,215,0,0.5)'; ctx.fillRect(5, 2, 1, 6);
        ctx.fillStyle = 'rgba(255,215,0,0.5)'; ctx.fillRect(10, 2, 1, 6);
      },
      clothRobe: () => {
        ctx.fillStyle = '#8b7355'; ctx.fillRect(4, 2, 8, 12);
        ctx.fillStyle = '#a08060'; ctx.fillRect(5, 3, 6, 10);
        ctx.fillStyle = '#654321'; ctx.fillRect(6, 6, 4, 1);
      },
      leatherArmor: () => {
        ctx.fillStyle = '#8b4513'; ctx.fillRect(3, 2, 10, 12);
        ctx.fillStyle = '#a0522d'; ctx.fillRect(4, 3, 8, 10);
        ctx.fillStyle = '#654321'; ctx.fillRect(3, 4, 2, 6);
        ctx.fillStyle = '#654321'; ctx.fillRect(11, 4, 2, 6);
      },
      ironArmor: () => {
        ctx.fillStyle = '#808080'; ctx.fillRect(3, 1, 10, 13);
        ctx.fillStyle = '#a0a0a0'; ctx.fillRect(4, 2, 8, 11);
        ctx.fillStyle = '#606060'; ctx.fillRect(2, 3, 2, 8);
        ctx.fillStyle = '#606060'; ctx.fillRect(12, 3, 2, 8);
      },
      spiritRobe: () => {
        ctx.fillStyle = '#4169e1'; ctx.fillRect(3, 2, 10, 12);
        ctx.fillStyle = '#6495ed'; ctx.fillRect(4, 3, 8, 10);
        ctx.fillStyle = '#ffd700'; ctx.fillRect(6, 4, 4, 2);
        ctx.fillStyle = '#87ceeb'; ctx.fillRect(5, 8, 6, 4);
      },
      dragonArmor: () => {
        ctx.fillStyle = '#228b22'; ctx.fillRect(2, 1, 12, 14);
        ctx.fillStyle = '#32cd32'; ctx.fillRect(3, 2, 10, 12);
        ctx.fillStyle = '#90ee90'; ctx.fillRect(5, 4, 2, 2);
        ctx.fillStyle = '#90ee90'; ctx.fillRect(9, 4, 2, 2);
        ctx.fillStyle = '#006400'; ctx.fillRect(6, 8, 4, 4);
      },
      celestialRobe: () => {
        ctx.fillStyle = '#ff69b4'; ctx.fillRect(2, 1, 12, 14);
        ctx.fillStyle = '#ffb6c1'; ctx.fillRect(3, 2, 10, 12);
        ctx.fillStyle = '#ffd700'; ctx.fillRect(5, 3, 6, 3);
        ctx.fillStyle = '#ffffff'; ctx.fillRect(6, 7, 4, 5);
        ctx.fillStyle = '#ffd700'; ctx.fillRect(4, 5, 1, 1);
        ctx.fillStyle = '#ffd700'; ctx.fillRect(11, 8, 1, 1);
      },
      copperRing: () => {
        ctx.fillStyle = '#cd7f32'; ctx.beginPath(); ctx.arc(8, 8, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#1a1a2e'; ctx.beginPath(); ctx.arc(8, 8, 3, 0, Math.PI * 2); ctx.fill();
      },
      silverRing: () => {
        ctx.fillStyle = '#c0c0c0'; ctx.beginPath(); ctx.arc(8, 8, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#1a1a2e'; ctx.beginPath(); ctx.arc(8, 8, 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#87ceeb'; ctx.beginPath(); ctx.arc(8, 4, 2, 0, Math.PI * 2); ctx.fill();
      },
      spiritPendant: () => {
        ctx.fillStyle = '#ffd700'; ctx.fillRect(7, 1, 2, 4);
        ctx.fillStyle = '#4169e1'; ctx.beginPath(); ctx.arc(8, 10, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#87ceeb'; ctx.beginPath(); ctx.arc(8, 10, 3, 0, Math.PI * 2); ctx.fill();
      },
      dragonAmulet: () => {
        ctx.fillStyle = '#ffd700'; ctx.fillRect(6, 0, 4, 3);
        ctx.fillStyle = '#228b22'; ctx.fillRect(3, 4, 10, 10);
        ctx.fillStyle = '#32cd32'; ctx.fillRect(4, 5, 8, 8);
        ctx.fillStyle = '#ff0000'; ctx.beginPath(); ctx.arc(8, 9, 2, 0, Math.PI * 2); ctx.fill();
      },
      celestialJade: () => {
        ctx.fillStyle = '#ffd700'; ctx.fillRect(6, 0, 4, 3);
        ctx.fillStyle = '#90ee90'; ctx.beginPath(); ctx.arc(8, 10, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(6, 8, 2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffd700'; ctx.beginPath(); ctx.arc(8, 10, 2, 0, Math.PI * 2); ctx.fill();
      }
    };

    const drawFn = icons[itemId];
    if (drawFn) {
      drawFn();
    } else {
      ctx.fillStyle = '#808080';
      ctx.fillRect(4, 4, 8, 8);
    }
  },

  getSaveData() {
    return { items: JSON.parse(JSON.stringify(this.items)) };
  },

  loadSaveData(data) {
    if (data?.items) {
      this.items = data.items;
    }
  }
};

// Close tooltip when clicking outside
document.addEventListener('click', (e) => {
  const tooltip = document.getElementById('itemTooltip');
  if (!tooltip) return;
  if (!tooltip.contains(e.target) && !e.target.closest('.inv-slot')) {
    Inventory.hideTooltip();
  }
});

console.log('🎒 Inventory loaded');
