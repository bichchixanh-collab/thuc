// ==================== PATCH.JS ====================
// Load sau config.js, TRƯỚC inventory.js.
// 1) Wrap document.addEventListener → guard .contains()/.classList/.textContent null
// 2) Sau load: override Inventory methods để không crash
// 3) Drag cho #radialMenuWrap
// Không sửa file gốc nào.

(function () {
  'use strict';

  // ═══════════════════════════════════════════════════════════
  // 1. Wrap document.addEventListener NGAY LẬP TỨC
  //    Mọi click/touch handler đều được bọc try-catch guard null
  // ═══════════════════════════════════════════════════════════
  const _origAdd = document.addEventListener.bind(document);
  const _origRem = document.removeEventListener.bind(document);
  const _wrapMap = new WeakMap();

  document.addEventListener = function (type, fn, opts) {
    if (typeof fn !== 'function') return _origAdd(type, fn, opts);
    const safe = function (e) {
      try { fn.call(this, e); }
      catch (err) {
        if (err instanceof TypeError &&
            (err.message.includes('contains') ||
             err.message.includes('classList') ||
             err.message.includes('textContent') ||
             err.message.includes('null'))) {
          return;
        }
        throw err;
      }
    };
    _wrapMap.set(fn, safe);
    return _origAdd(type, safe, opts);
  };

  document.removeEventListener = function (type, fn, opts) {
    return _origRem(type, _wrapMap.get(fn) || fn, opts);
  };

  // ═══════════════════════════════════════════════════════════
  // 2. Sau khi mọi script load xong: patch Inventory + drag
  // ═══════════════════════════════════════════════════════════
  window.addEventListener('load', function () {

    // ── 2a. Patch Inventory.hideTooltip ──────────────────────
    if (typeof Inventory !== 'undefined') {
      Inventory.hideTooltip = function () {
        const el = document.getElementById('itemTooltip');
        if (el) el.classList.remove('show');
        this.selectedItem = null;
        this.selectedSlot = null;
      };

      // ── 2b. Patch Inventory.showTooltip ────────────────────
      const _origShow = Inventory.showTooltip.bind(Inventory);
      Inventory.showTooltip = function (itemId, slotIndex, event) {
        const tooltip   = document.getElementById('itemTooltip');
        const nameEl    = document.getElementById('tooltipName');
        const typeEl    = document.getElementById('tooltipType');
        const statsEl   = document.getElementById('tooltipStats');
        const descEl    = document.getElementById('tooltipDesc');
        const actionsEl = document.getElementById('tooltipActions');
        if (!tooltip || !nameEl || !typeEl || !statsEl || !descEl || !actionsEl) return;
        try { _origShow(itemId, slotIndex, event); }
        catch (err) {
          const d = (typeof ITEMS !== 'undefined') && ITEMS[itemId];
          if (!d) return;
          nameEl.textContent = d.name;
          nameEl.className   = 'item-name ' + (d.rarity || 'common');
          typeEl.textContent = d.type || '';
          statsEl.innerHTML  = '';
          descEl.textContent = d.desc || '';
          actionsEl.innerHTML = '';
          tooltip.className  = 'show ' + (d.rarity || 'common');
          if (event) {
            const x = Math.min(event.clientX + 10, window.innerWidth  - 260);
            const y = Math.min(event.clientY + 10, window.innerHeight - 180);
            tooltip.style.left = x + 'px';
            tooltip.style.top  = y + 'px';
          }
        }
      };

      // ── 2c. Patch Inventory.render ─────────────────────────
      const _origRender = Inventory.render.bind(Inventory);
      Inventory.render = function (filter) {
        if (!document.getElementById('invGrid')) return;
        try { _origRender(filter); } catch (e) { /* ignore */ }
      };

      // ── 2d. Patch Inventory.switchTab ─────────────────────
      Inventory.switchTab = function (btn, filter) {
        const panel = document.getElementById('xp-inventoryPanel');
        if (panel) panel.querySelectorAll('.xtab').forEach(b => b.classList.remove('active'));
        if (btn) btn.classList.add('active');
        this.render(filter);
      };
    }

    // ── 2e. Drag cho #radialMenuWrap ─────────────────────────
    const wrap = document.getElementById('radialMenuWrap');
    if (!wrap) return;

    let dragging = false, startX, startY, origRight, origBottom;

    function getPos() {
      const r = parseFloat(wrap.style.right)  || 110;
      const b = parseFloat(wrap.style.bottom) || 170;
      return { r, b };
    }

    // Touch
    wrap.addEventListener('touchstart', function (e) {
      const t = e.touches[0];
      startX = t.clientX; startY = t.clientY;
      const p = getPos(); origRight = p.r; origBottom = p.b;
      dragging = false;
    }, { passive: true });

    wrap.addEventListener('touchmove', function (e) {
      const t = e.touches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      if (!dragging && Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      dragging = true;
      e.preventDefault();
      const W = window.innerWidth, H = window.innerHeight;
      const bW = wrap.offsetWidth || 60, bH = wrap.offsetHeight || 60;
      wrap.style.right  = Math.max(0, Math.min(W - bW, origRight  - dx)) + 'px';
      wrap.style.bottom = Math.max(0, Math.min(H - bH, origBottom + dy)) + 'px';
    }, { passive: false });

    wrap.addEventListener('touchend', function () {
      setTimeout(() => { dragging = false; }, 50);
    }, { passive: true });

    // Mouse
    const mainBtn = document.getElementById('rmMainBtn');
    if (mainBtn) {
      mainBtn.addEventListener('mousedown', function (e) {
        if (e.button !== 0) return;
        startX = e.clientX; startY = e.clientY;
        const p = getPos(); origRight = p.r; origBottom = p.b;
        dragging = false;
        function onMove(ev) {
          const dx = ev.clientX - startX, dy = ev.clientY - startY;
          if (!dragging && Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
          dragging = true;
          const W = window.innerWidth, H = window.innerHeight;
          const bW = wrap.offsetWidth || 60, bH = wrap.offsetHeight || 60;
          wrap.style.right  = Math.max(0, Math.min(W - bW, origRight  - dx)) + 'px';
          wrap.style.bottom = Math.max(0, Math.min(H - bH, origBottom + dy)) + 'px';
        }
        function onUp() {
          document.removeEventListener('mousemove', onMove);
          document.removeEventListener('mouseup', onUp);
          setTimeout(() => { dragging = false; }, 50);
        }
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
      });
      // Không fire click khi vừa drag xong
      mainBtn.addEventListener('click', function (e) {
        if (dragging) e.stopImmediatePropagation();
      }, true);
    }

    console.log('patch.js: inventory guard + drag ready');
  });

})();
