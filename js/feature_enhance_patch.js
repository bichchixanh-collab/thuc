// ==================== ENHANCE SYSTEM PATCH ====================
// File: js/feature_enhance_patch.js
// Mục đích: Bổ sung method buildInlineUI(itemId, container) vào EnhanceSystem
//           để UI.renderCharacter() tab "Pháp Bảo" hiển thị nâng cấp inline.
// Load SAU feature_enhance.js:
//   <script src="js/feature_enhance.js"></script>
//   <script src="js/feature_enhance_patch.js"></script>
// =============================================================

(function patchEnhanceSystem() {
  if (typeof EnhanceSystem === 'undefined') {
    console.warn('[EnhancePatch] EnhanceSystem chưa được load!');
    return;
  }

  // ── buildInlineUI(itemId, container) ─────────────────────────
  // Render UI nâng cấp compact vào container cho sẵn (không dùng tooltip)
  if (typeof EnhanceSystem.buildInlineUI !== 'function') {
    EnhanceSystem.buildInlineUI = function(itemId, container) {
      if (!itemId || !ITEMS[itemId]) return;
      const itemData = ITEMS[itemId];
      const level    = EnhanceSystem.getLevel(itemId);
      const req      = EnhanceSystem.getRequirements(level);
      const check    = EnhanceSystem.checkRequirements(itemId);
      const successRate = ENHANCE_CONFIG.successRate[level] !== undefined
        ? ENHANCE_CONFIG.successRate[level] : null;

      // Tên với cấp nâng + màu
      const nameColor = EnhanceSystem.getNameColor ? EnhanceSystem.getNameColor(level) : '#f0c040';
      const displayName = EnhanceSystem.getDisplayName ? EnhanceSystem.getDisplayName(itemId) : itemData.name;

      // Header dòng tên + level bar
      const headerRow = document.createElement('div');
      headerRow.style.cssText = 'display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;';
      headerRow.innerHTML = `
        <span style="font-size:11px; font-weight:bold; color:${nameColor};
          ${level === 10 ? 'text-shadow:0 0 6px #f0c040;' : ''}">${displayName}</span>
        <span style="font-size:10px; color:#888;">+${level} / ${ENHANCE_CONFIG.maxLevel}</span>
      `;
      container.appendChild(headerRow);

      // Level bar
      const bar = document.createElement('div');
      bar.style.cssText = 'width:100%;height:4px;background:#111;border-radius:2px;border:1px solid #222;overflow:hidden;margin-bottom:6px;';
      const fill = document.createElement('div');
      fill.style.cssText = `height:100%;width:${level / ENHANCE_CONFIG.maxLevel * 100}%;
        background:linear-gradient(90deg,#ff9800,#f0c040);border-radius:2px;`;
      bar.appendChild(fill);
      container.appendChild(bar);

      if (!req || level >= ENHANCE_CONFIG.maxLevel) {
        const maxTag = document.createElement('div');
        maxTag.style.cssText = 'font-size:10px; color:#f0c040; text-align:center; padding:2px;';
        maxTag.textContent = level >= ENHANCE_CONFIG.maxLevel ? '✨ Tối đa +10' : '';
        container.appendChild(maxTag);
        return;
      }

      // Vật liệu cần
      const matRow = document.createElement('div');
      matRow.style.cssText = 'display:flex; flex-wrap:wrap; gap:4px; margin-bottom:4px;';

      req.items.forEach(mat => {
        const matData = ITEMS[mat.id];
        const have = Inventory.getCount(mat.id);
        const enough = have >= mat.count;
        const tag = document.createElement('span');
        tag.style.cssText = `
          font-size:9px; padding:2px 5px; border-radius:3px;
          border:1px solid ${enough ? '#4caf50' : '#ef5350'};
          color:${enough ? '#4caf50' : '#ef5350'};
          background:${enough ? '#0a1a0a' : '#1a0a0a'};
        `;
        tag.textContent = `${matData ? matData.name : mat.id} ${have}/${mat.count}`;
        matRow.appendChild(tag);
      });

      // Vàng
      const enoughGold = Player.gold >= req.gold;
      const goldTag = document.createElement('span');
      goldTag.style.cssText = `
        font-size:9px; padding:2px 5px; border-radius:3px;
        border:1px solid ${enoughGold ? '#4caf50' : '#ef5350'};
        color:${enoughGold ? '#4caf50' : '#ef5350'};
        background:${enoughGold ? '#0a1a0a' : '#1a0a0a'};
      `;
      goldTag.textContent = `💰${req.gold}g (có:${Player.gold})`;
      matRow.appendChild(goldTag);
      container.appendChild(matRow);

      // Tỷ lệ + cảnh báo tụt level
      if (successRate !== null) {
        const rateRow = document.createElement('div');
        rateRow.style.cssText = 'font-size:9px; color:#aaa; margin-bottom:4px; display:flex; gap:8px;';
        rateRow.innerHTML = `<span>🎲 Tỷ lệ: <b style="color:${successRate < 0.5 ? '#ef5350' : '#4caf50'};">${Math.round(successRate * 100)}%</b></span>`;
        if (level >= 7 && ENHANCE_CONFIG.failRisk && ENHANCE_CONFIG.failRisk[level]) {
          rateRow.innerHTML += `<span style="color:#ff9800;">⚠️ Tụt về +${ENHANCE_CONFIG.failRisk[level].dropTo}</span>`;
        }
        container.appendChild(rateRow);
      }

      // Nút Nâng Cấp
      const btn = document.createElement('button');
      btn.style.cssText = `
        width:100%; padding:5px 0; border-radius:4px;
        font-size:10px; font-weight:bold; font-family:'Courier New',monospace;
        cursor:${check.canDo ? 'pointer' : 'not-allowed'};
        border:1px solid ${check.canDo ? '#ff9800' : '#444'};
        background:${check.canDo ? '#1a0e00' : '#111'};
        color:${check.canDo ? '#ff9800' : '#555'};
        transition:background 0.15s;
      `;
      btn.textContent = check.canDo ? '⚒️ Nâng Cấp' : '❌ Thiếu Nguyên Liệu';
      btn.disabled = !check.canDo;
      if (check.canDo) {
        btn.onmouseover = () => { btn.style.background = '#2a1800'; };
        btn.onmouseout  = () => { btn.style.background = '#1a0e00'; };
        btn.onclick = () => {
          EnhanceSystem.enhance(itemId);
          // Re-render character panel để cập nhật
          if (UI.activePanel === 'character') UI.renderCharacter();
        };
      }
      container.appendChild(btn);
    };

    console.log('[EnhancePatch] buildInlineUI() đã được thêm vào EnhanceSystem.');
  }

  console.log('[EnhancePatch] Patch hoàn tất.');
})();
