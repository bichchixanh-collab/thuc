// ==================== RADIAL MENU v3 ====================
// Fix: MutationObserver loop gây treo trang + global listeners trùng lặp

const RadialMenu = {
  RADIUS: 110,
  ITEM_DELAY: 30,

  items: [
    { key: 'character',  icon: '👤', label: 'Nhân vật',    fn: () => UI.openPanel('character') },
    { key: 'inventory',  icon: '🎒', label: 'Túi đồ',      fn: () => UI.openPanel('inventory') },
    { key: 'meridian',   icon: '🫁', label: 'Kinh mạch',   fn: () => typeof MeridianSystem !== 'undefined' && MeridianSystem.openPanel() },
    { key: 'wandering',  icon: '✨', label: 'Du tiên',     fn: () => RadialMenu._openWanderingPanel() },
    { key: 'caravan',    icon: '🛒', label: 'Thương đoàn', fn: () => typeof CaravanSystem !== 'undefined' && CaravanSystem.openShop() },
    { key: 'quest',      icon: '📜', label: 'Nhiệm vụ',    fn: () => UI.openPanel('quest') },
    { key: 'map',        icon: '🗺️', label: 'Bản đồ',     fn: () => UI.openPanel('map') },
    { key: 'questsplus', icon: '📋', label: 'NV phụ',      fn: () => typeof QuestsPlus !== 'undefined' && QuestsPlus.openPanel() },
    { key: 'pvp',        icon: '⚔️', label: 'Võ lâm',     fn: () => typeof GhostPvPPanel !== 'undefined' && GhostPvPPanel.open() },
  ],

  isOpen: false,
  centerEl: null,
  backdropEl: null,
  itemEls: [],

  // Drag trung tâm
  _dCenter: { on: false, moved: false, sx: 0, sy: 0, ox: 0, oy: 0 },
  _POS_KEY: 'radial_center_pos',

  // Drag panel – CHỈ 1 bộ global listener dùng chung
  _dPanel: { on: false, el: null, ox: 0, oy: 0, sx: 0, sy: 0 },

  // ===================================================
  init() {
    const mb = document.getElementById('menuBar');
    if (mb) mb.style.display = 'none';

    this._buildDOM();
    this._restorePos();
    this._bindCenterEvents();
    this._registerGlobalListeners(); // CHỈ GỌI 1 LẦN duy nhất
    this._injectWanderingPanel();
    this._setupPanelDrags();
    console.log('🌀 RadialMenu v3 ok');
  },

  // ===================================================
  _buildDOM() {
    // Backdrop
    const bd = document.createElement('div');
    bd.id = 'radialBackdrop';
    bd.addEventListener('click', () => this.close());
    document.body.appendChild(bd);
    this.backdropEl = bd;

    // Nút trung tâm
    const c = document.createElement('div');
    c.id = 'radialCenter';
    c.textContent = '☰';
    document.body.appendChild(c);
    this.centerEl = c;

    // Nút con
    this.itemEls = this.items.map(item => {
      const el = document.createElement('div');
      el.className = 'radial-item';
      el.dataset.key = item.key;
      el.innerHTML = `<span class="ri-icon">${item.icon}</span><span class="ri-label">${item.label}</span>`;

      // Click: đóng trước, gọi fn sau 1 frame
      const fire = (e) => {
        e.stopPropagation();
        e.preventDefault();
        this.close();
        requestAnimationFrame(() => {
          try { item.fn(); } catch(err) { console.error('[RadialMenu]', err); }
        });
      };
      el.addEventListener('click', fire);
      el.addEventListener('touchend', fire);

      document.body.appendChild(el);
      return el;
    });
  },

  // ===================================================
  toggle() { this.isOpen ? this.close() : this.open(); },

  open() {
    if (this.isOpen) return;
    this.isOpen = true;
    this.centerEl.classList.add('open');
    this.centerEl.textContent = '✕';
    this.backdropEl.classList.add('open');

    const r  = this.centerEl.getBoundingClientRect();
    const cx = r.left + r.width  / 2;
    const cy = r.top  + r.height / 2;
    const n  = this.itemEls.length;
    const W  = window.innerWidth, H = window.innerHeight, S = 27;

    this.itemEls.forEach((el, i) => {
      const rad = (-90 + 360 / n * i) * Math.PI / 180;
      el.style.left = Math.max(S, Math.min(W - S, cx + this.RADIUS * Math.cos(rad))) + 'px';
      el.style.top  = Math.max(S, Math.min(H - S, cy + this.RADIUS * Math.sin(rad))) + 'px';
      el.style.transitionDelay = (i * this.ITEM_DELAY) + 'ms';
      requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('open')));
    });
  },

  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.centerEl.classList.remove('open');
    this.centerEl.textContent = '☰';
    this.backdropEl.classList.remove('open');
    const n = this.itemEls.length;
    this.itemEls.forEach((el, i) => {
      el.style.transitionDelay = ((n - 1 - i) * this.ITEM_DELAY * 0.4) + 'ms';
      el.classList.remove('open');
    });
  },

  // ===================================================
  _bindCenterEvents() {
    const c = this.centerEl;
    c.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      const d = this._dCenter;
      d.moved = false;
      d.on = true;
      d.sx = e.clientX; d.sy = e.clientY;
      const r = c.getBoundingClientRect();
      d.ox = r.left; d.oy = r.top;
    });
    c.addEventListener('click', (e) => {
      if (!this._dCenter.moved) { e.stopPropagation(); this.toggle(); }
    });
    c.addEventListener('touchstart', () => { this._dCenter.moved = false; }, { passive: true });
    c.addEventListener('touchend',   (e) => { if (!this._dCenter.moved) { e.preventDefault(); this.toggle(); } });
  },

  // ===================================================
  // 1 BỘ global listener cho cả drag-center lẫn drag-panel
  _registerGlobalListeners() {
    // --- MOUSE ---
    document.addEventListener('mousemove', (e) => {
      this._handleCenterDrag(e.clientX, e.clientY);
      this._handlePanelDrag(e.clientX, e.clientY);
    });
    document.addEventListener('mouseup', () => {
      this._endCenterDrag();
      this._endPanelDrag();
    });

    // --- TOUCH ---
    document.addEventListener('touchmove', (e) => {
      const t = e.touches[0];
      this._handleCenterDrag(t.clientX, t.clientY);
      this._handlePanelDrag(t.clientX, t.clientY);
    }, { passive: true });
    document.addEventListener('touchend', () => {
      this._endCenterDrag();
      this._endPanelDrag();
    });
  },

  _handleCenterDrag(cx, cy) {
    const d = this._dCenter;
    if (!d.on) return;
    const dx = cx - d.sx, dy = cy - d.sy;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) d.moved = true;
    if (!d.moved) return;
    const W = window.innerWidth, H = window.innerHeight, S = 56;
    const nl = Math.max(0, Math.min(W - S, d.ox + dx));
    const nt = Math.max(0, Math.min(H - S, d.oy + dy));
    this.centerEl.style.left = nl + 'px';
    this.centerEl.style.top  = nt + 'px';
    if (this.isOpen) this._repositionItems(nl + S / 2, nt + S / 2);
  },

  _endCenterDrag() {
    if (!this._dCenter.on) return;
    this._dCenter.on = false;
    this._savePos();
  },

  _repositionItems(cx, cy) {
    const n = this.itemEls.length;
    const W = window.innerWidth, H = window.innerHeight, S = 27;
    this.itemEls.forEach((el, i) => {
      const rad = (-90 + 360 / n * i) * Math.PI / 180;
      el.style.left = Math.max(S, Math.min(W - S, cx + this.RADIUS * Math.cos(rad))) + 'px';
      el.style.top  = Math.max(S, Math.min(H - S, cy + this.RADIUS * Math.sin(rad))) + 'px';
    });
  },

  _handlePanelDrag(cx, cy) {
    const d = this._dPanel;
    if (!d.on || !d.el) return;
    const W = window.innerWidth, H = window.innerHeight;
    const r = d.el.getBoundingClientRect();
    const nl = Math.max(0, Math.min(W - r.width,  d.ox + (cx - d.sx)));
    const nt = Math.max(0, Math.min(H - r.height, d.oy + (cy - d.sy)));
    d.el.style.left = nl + 'px';
    d.el.style.top  = nt + 'px';
  },

  _endPanelDrag() {
    if (!this._dPanel.on) return;
    this._dPanel.on = false;
    this._dPanel.el = null;
    document.body.classList.remove('panel-dragging');
  },

  // ===================================================
  _savePos() {
    try {
      const r = this.centerEl.getBoundingClientRect();
      localStorage.setItem(this._POS_KEY, JSON.stringify({ left: r.left, top: r.top }));
    } catch(e) {}
  },

  _restorePos() {
    const el = this.centerEl;
    const W = window.innerWidth, H = window.innerHeight;
    let left = W - 70, top = H - 175;
    try {
      const s = localStorage.getItem(this._POS_KEY);
      if (s) {
        const p = JSON.parse(s);
        if (p.left >= 0 && p.left <= W - 56) left = p.left;
        if (p.top  >= 0 && p.top  <= H - 56) top  = p.top;
      }
    } catch(e) {}
    el.style.left = left + 'px';
    el.style.top  = top  + 'px';
    this.itemEls.forEach(el => {
      el.style.left = (left + 28) + 'px';
      el.style.top  = (top  + 28) + 'px';
    });
  },

  // ===================================================
  // PANEL DRAG – không dùng MutationObserver để reset style
  // (tránh infinite loop). Chỉ dùng 1 MutationObserver theo dõi
  // class 'show' / style display để reset vị trí khi đóng.
  _setupPanelDrags() {
    const ids = ['inventoryPanel','characterPanel','mapPanel','questPanel'];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) this._enablePanelDrag(el);
    });

    // Feature panels: inject sau → dùng MutationObserver trên body
    // CHÚ Ý: observer này CHỈ watch childList, không watch attributes
    // → không có vòng lặp khi ta thay đổi style của panel
    const watch = new Set([
      'meridianPanel','questsPlusPanel','caravanPanel','ghostPvpOverlay','wanderingInfoPanel'
    ]);
    new MutationObserver(muts => {
      muts.forEach(m => m.addedNodes.forEach(n => {
        if (n.nodeType === 1 && watch.has(n.id)) {
          setTimeout(() => this._enablePanelDrag(n), 200);
        }
      }));
    }).observe(document.body, { childList: true }); // chỉ childList, không subtree attributes
  },

  _enablePanelDrag(overlayEl) {
    const inner = overlayEl.querySelector('.modal-panel')
      || overlayEl.querySelector('[id$="Inner"]')
      || overlayEl.firstElementChild;
    if (!inner) return;

    const header = inner.querySelector('.modal-header') || inner.firstElementChild;
    if (!header || header.dataset.dragEnabled) return;
    header.dataset.dragEnabled = '1';
    header.classList.add('drag-handle');

    // Trạng thái "đã kéo" hay chưa – lưu trên chính inner element
    inner._rmDragged = false;

    const startDrag = (cx, cy) => {
      // Lần đầu kéo: chuyển inner sang fixed
      if (!inner._rmDragged) {
        const r = inner.getBoundingClientRect();
        inner.style.cssText = [
          'position:fixed',
          `left:${r.left}px`,
          `top:${r.top}px`,
          'margin:0',
          'transform:none',
          'max-height:82vh',
          'pointer-events:auto',
          // giữ lại các style gốc quan trọng
          `background:${getComputedStyle(inner).background}`,
          `border:${getComputedStyle(inner).border}`,
          `border-radius:${getComputedStyle(inner).borderRadius}`,
          `padding:${getComputedStyle(inner).padding}`,
          `width:${getComputedStyle(inner).width}`,
          `box-shadow:${getComputedStyle(inner).boxShadow}`,
          'overflow-y:auto',
          'z-index:101'
        ].join(';');

        // Overlay trong suốt, không block click
        // Dùng setAttribute thay vì .style để tránh trigger MutationObserver style
        overlayEl._rmOrigBg = overlayEl.style.background;
        overlayEl._rmOrigBd = overlayEl.style.backdropFilter;
        overlayEl._rmOrigPe = overlayEl.style.pointerEvents;
        overlayEl.style.setProperty('background', 'transparent', 'important');
        overlayEl.style.setProperty('backdrop-filter', 'none', 'important');
        overlayEl.style.setProperty('pointer-events', 'none', 'important');

        inner._rmDragged = true;
      }

      const r2 = inner.getBoundingClientRect();
      const d = this._dPanel;
      d.on = true;
      d.el = inner;
      d.sx = cx; d.sy = cy;
      d.ox = r2.left; d.oy = r2.top;
      document.body.classList.add('panel-dragging');
    };

    header.addEventListener('mousedown',  (e) => { if (e.button === 0) { e.preventDefault(); startDrag(e.clientX, e.clientY); }});
    header.addEventListener('touchstart', (e) => { startDrag(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });

    // Reset khi panel đóng – theo dõi class, KHÔNG theo dõi style
    // Dùng flag để tránh loop: chỉ reset 1 lần khi thật sự đóng
    let wasOpen = false;
    new MutationObserver(() => {
      const nowOpen = overlayEl.classList.contains('show')
        || overlayEl.style.display === 'flex'
        || overlayEl.style.display === 'block';

      if (wasOpen && !nowOpen) {
        // Panel vừa đóng → reset
        inner._rmDragged = false;
        inner.removeAttribute('style');
        // Khôi phục overlay style mà không trigger thêm mutation
        if (overlayEl._rmOrigBg !== undefined) {
          overlayEl.style.background      = overlayEl._rmOrigBg || '';
          overlayEl.style.backdropFilter  = overlayEl._rmOrigBd || '';
          overlayEl.style.pointerEvents   = overlayEl._rmOrigPe || '';
        }
      }
      wasOpen = nowOpen;
    }).observe(overlayEl, { attributes: true, attributeFilter: ['class'] }); // CHỈ watch class, KHÔNG watch style
  },

  // ===================================================
  // DU TIÊN INFO PANEL
  _injectWanderingPanel() {
    if (document.getElementById('wanderingInfoPanel')) return;
    const p = document.createElement('div');
    p.id = 'wanderingInfoPanel';
    p.innerHTML = `
      <div id="wanderingInfoInner">
        <div style="display:flex;justify-content:space-between;align-items:center;
             border-bottom:2px solid #8ef4;padding-bottom:10px;margin-bottom:12px">
          <div style="color:#8ef;font-size:18px;font-weight:bold">✨ Du Tiên</div>
          <div onclick="RadialMenu._closeWanderingPanel()"
               style="width:30px;height:30px;background:rgba(255,0,0,0.2);border:2px solid #f44;
                      border-radius:50%;color:#f44;font-size:16px;cursor:pointer;
                      display:flex;align-items:center;justify-content:center;">✕</div>
        </div>
        <div id="wanderingInfoContent"></div>
      </div>`;
    p.addEventListener('click', e => { if (e.target === p) this._closeWanderingPanel(); });
    document.body.appendChild(p);
  },

  _openWanderingPanel() {
    if (typeof WanderingImmortal === 'undefined') {
      UI.addLog('Du Tiên chưa tải!', 'system'); return;
    }
    const st     = WanderingImmortal.state;
    const active = st.active || [];
    const trails = st.trails || [];
    let html = '';

    html += `<div style="background:rgba(136,238,255,0.08);border:1px solid #8ef4;border-radius:8px;padding:10px;margin-bottom:12px">
      <div style="color:#8ef;font-size:12px;font-weight:bold;margin-bottom:6px">📊 Trạng thái hôm nay</div>
      <div style="color:#ccc;font-size:11px">Xuất hiện: <span style="color:#f0c040">${st.todayCount||0}/${WanderingImmortal.config.MAX_PER_DAY}</span></div>
      <div style="color:#ccc;font-size:11px;margin-top:3px">Đang hiện diện: <span style="color:#4caf50">${active.length} vị</span></div>
      <div style="color:#ccc;font-size:11px;margin-top:3px">Dấu chân: <span style="color:#aaa">${trails.length} vết</span></div>
    </div>`;

    if (active.length > 0) {
      html += `<div style="color:#f0c040;font-size:12px;font-weight:bold;margin-bottom:8px">✨ Đang xuất hiện</div>`;
      active.forEach(im => {
        const rem = Math.max(0, Math.ceil((im.expireTime - Date.now()) / 60000));
        const t = im.type;
        html += `<div style="background:rgba(255,255,255,0.04);border:2px solid ${t.color};border-radius:10px;padding:10px;margin-bottom:8px">
          <div style="color:${t.color};font-size:13px;font-weight:bold">${t.name}</div>
          <div style="color:#888;font-size:10px">${t.title}</div>
          <div style="display:flex;justify-content:space-between;margin-top:6px">
            <span style="color:${rem<=5?'#f44':'#aaa'};font-size:10px">⏱ Còn ${rem} phút</span>
            <span style="color:${im.canInteract?'#4caf50':'#888'};font-size:10px">
              ${im.visible?(im.canInteract?'🟢 Có thể nói chuyện':'🔸 Đến gần hơn'):'🌫️ Chưa tìm thấy'}
            </span>
          </div>
        </div>`;
      });
    } else {
      html += `<div style="text-align:center;color:#666;padding:20px;border:1px dashed #333;border-radius:10px">
        <div style="font-size:24px;margin-bottom:6px">🌫️</div>
        <div style="font-size:12px">Hiện không có Du Tiên nào</div>
      </div>`;
    }

    if (trails.length > 0) {
      html += `<div style="color:#888;font-size:12px;font-weight:bold;margin-top:12px;margin-bottom:6px">👣 Dấu chân</div>`;
      trails.forEach(tr => {
        const rem = Math.max(0, Math.ceil((tr.expireTime - Date.now()) / 60000));
        html += `<div style="background:rgba(255,255,255,0.02);border:1px solid #333;border-radius:8px;
                     padding:8px;margin-bottom:6px;display:flex;justify-content:space-between">
          <span style="color:${tr.type.color};font-size:11px">${tr.type.name}</span>
          <span style="color:#555;font-size:10px">Mờ sau ${rem} phút</span>
        </div>`;
      });
    }

    if (WanderingImmortal.unlockedPassives && WanderingImmortal.unlockedPassives.length > 0) {
      html += `<div style="color:#a855f7;font-size:12px;font-weight:bold;margin-top:12px;margin-bottom:6px">🌟 Passive đã học</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px">`;
      WanderingImmortal.unlockedPassives.forEach(pid => {
        html += `<div style="background:rgba(168,85,247,0.15);border:1px solid #a855f7;border-radius:6px;
                     padding:4px 10px;font-size:10px;color:#a855f7">${pid}</div>`;
      });
      html += `</div>`;
    }

    document.getElementById('wanderingInfoContent').innerHTML = html;
    document.getElementById('wanderingInfoPanel').classList.add('show');
  },

  _closeWanderingPanel() {
    const p = document.getElementById('wanderingInfoPanel');
    if (p) p.classList.remove('show');
  }
};

// ==================== AUTO-INIT ====================
(function () {
  const tryWrap = () => {
    if (typeof Game !== 'undefined' && typeof UI !== 'undefined') {
      const orig = Game.init.bind(Game);
      Game.init = function () { orig(); RadialMenu.init(); };
    } else {
      setTimeout(tryWrap, 100);
    }
  };
  tryWrap();
})();

console.log('🌀 radial_menu.js v3 loaded');
