// ==================== PATCH.JS (v5) ====================
// Load sau config.js, TRƯỚC các file khác.
// Fix:
//   1) null-safe addEventListener (fix inventory.js:214 click handler)
//   2) Maps.render null-safe
//   3) Inventory null-safe
//   4) Drag #menuBar — dùng left/top thay vì right/bottom để tránh conflict CSS
//   5) Drag .modal-panel — thuần mouse/touch events, không dùng pointer capture
//      vì game có thể chặn pointer events trên document

(function () {
  'use strict';

  // ═══════════════════════════════════════════════════════════
  // 1. null-safe document.addEventListener
  //    Fix inventory.js:214: tooltip.contains() crash khi tooltip null
  // ═══════════════════════════════════════════════════════════
  var _origAdd = document.addEventListener.bind(document);
  var _origRem = document.removeEventListener.bind(document);
  var _wrapMap  = new WeakMap();

  document.addEventListener = function (type, fn, opts) {
    if (typeof fn !== 'function') return _origAdd(type, fn, opts);
    var safe = function (e) {
      try { fn.call(this, e); }
      catch (err) {
        if (err instanceof TypeError) return; // nuốt mọi null TypeError
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
  // Helper
  // ═══════════════════════════════════════════════════════════
  function injectCSS(id, css) {
    if (document.getElementById(id)) return;
    var s = document.createElement('style');
    s.id = id; s.textContent = css;
    document.head.appendChild(s);
  }

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  // ═══════════════════════════════════════════════════════════
  // 2. Sau khi load xong
  // ═══════════════════════════════════════════════════════════
  window.addEventListener('load', function () {

    // ── CSS ────────────────────────────────────────────────
    injectCSS('patch-v5', [
      // Drag handle cho menuBar — div tuyệt đối trong menuBar, z-index thấp nhất
      '#_mbDragH {',
      '  position:absolute; inset:0; z-index:0;',
      '  cursor:grab; touch-action:none;',
      '}',
      '#_mbDragH:active { cursor:grabbing; }',
      // menuBar cần position:absolute để left/top hoạt động
      '#menuBar { position:absolute !important; }',
      // Nút con nằm trên handle
      '#menuBar .menu-btn { position:relative; z-index:1; }',
      // Modal header
      '.modal-header {',
      '  cursor:grab;',
      '  touch-action:none;',
      '  user-select:none;',
      '  -webkit-user-select:none;',
      '}',
      '.modal-header:active { cursor:grabbing; }',
      '.modal-close { cursor:pointer !important; position:relative; z-index:2; }',
      // Overlay: flex-start để absolute child hoạt động
      '.modal-overlay.show {',
      '  align-items:flex-start !important;',
      '  justify-content:flex-start !important;',
      '}'
    ].join('\n'));

    // ── Fix Maps.render ────────────────────────────────────
    if (typeof Maps !== 'undefined' && typeof Maps.render === 'function') {
      var _mr = Maps.render.bind(Maps);
      Maps.render = function () {
        if (!document.getElementById('mapList')) return;
        try { _mr(); } catch (err) {
          var el = document.getElementById('mapList');
          if (el) el.innerHTML = '<div style="color:#888;padding:12px;text-align:center">Không thể tải bản đồ</div>';
        }
      };
    }

    // ── Fix Inventory ──────────────────────────────────────
    if (typeof Inventory !== 'undefined') {
      Inventory.hideTooltip = function () {
        var el = document.getElementById('itemTooltip');
        if (el) el.classList.remove('show');
        this.selectedItem = null; this.selectedSlot = null;
      };
      var _iRender = Inventory.render ? Inventory.render.bind(Inventory) : null;
      Inventory.render = function (f) {
        if (!document.getElementById('invGrid')) return;
        if (_iRender) try { _iRender(f); } catch (e) {}
      };
      Inventory.switchTab = function (btn, filter) {
        var p = document.getElementById('inventoryPanel');
        if (p) p.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
        if (btn) btn.classList.add('active');
        this.render(filter);
      };
    }

    // ── Fix UI.openPanel ───────────────────────────────────
    if (typeof UI !== 'undefined' && typeof UI.openPanel === 'function') {
      var _uiOpen = UI.openPanel.bind(UI);
      UI.openPanel = function (name) {
        var pan = document.getElementById(name + 'Panel');
        if (!pan) return;
        try { _uiOpen(name); }
        catch (e) {
          pan.classList.add('show');
          UI.activePanel = name;
        }
        // Setup drag modal mỗi lần open
        setTimeout(function () {
          var mp = pan.querySelector('.modal-panel');
          if (mp) setupModalDrag(mp);
        }, 30);
      };
    }

    // ═══════════════════════════════════════════════════════
    // 3. DRAG #menuBar
    //
    // Vấn đề cũ: dùng right/bottom → getComputedStyle trả về
    // giá trị tuyệt đối (px from edge) nhưng CSS khai báo bằng
    // constant → không nhất quán.
    //
    // Giải pháp v5:
    //   - Chuyển menuBar sang left/top (getBoundingClientRect)
    //   - Tạo #_mbDragH (div trong suốt, z-index:0) để nhận drag
    //   - Dùng mousedown/mousemove/mouseup + touchstart/move/end
    //     RIÊNG trực tiếp trên handle, KHÔNG qua document
    //     (tránh bị game.js joystick handler chặn)
    // ═══════════════════════════════════════════════════════
    var menuBar = document.getElementById('menuBar');
    if (menuBar) {
      // Chuyển từ right/bottom sang left/top
      var mbRect = menuBar.getBoundingClientRect();
      menuBar.style.right  = 'auto';
      menuBar.style.bottom = 'auto';
      menuBar.style.left   = mbRect.left + 'px';
      menuBar.style.top    = mbRect.top  + 'px';

      // Tạo drag handle
      var mbH = document.createElement('div');
      mbH.id = '_mbDragH';
      mbH.title = '⠿ Kéo để di chuyển';
      menuBar.insertBefore(mbH, menuBar.firstChild);

      var mbState = { on: false, sx: 0, sy: 0, sl: 0, st: 0 };

      function mbStart(cx, cy) {
        var r = menuBar.getBoundingClientRect();
        mbState.on = true;
        mbState.sx = cx; mbState.sy = cy;
        mbState.sl = r.left; mbState.st = r.top;
      }

      function mbMove(cx, cy) {
        if (!mbState.on) return;
        var dx = cx - mbState.sx, dy = cy - mbState.sy;
        var W = window.innerWidth,  H = window.innerHeight;
        var bW = menuBar.offsetWidth, bH = menuBar.offsetHeight;
        menuBar.style.left = clamp(mbState.sl + dx, 0, W - bW) + 'px';
        menuBar.style.top  = clamp(mbState.st + dy, 0, H - bH) + 'px';
      }

      function mbEnd() { mbState.on = false; }

      // Mouse — listener trực tiếp trên handle + document move/up
      mbH.addEventListener('mousedown', function (e) {
        if (e.button !== 0) return;
        e.stopPropagation();
        // Không preventDefault để click trên .menu-btn vẫn fire
        mbStart(e.clientX, e.clientY);
        function onMove(ev) { mbMove(ev.clientX, ev.clientY); }
        function onUp()   {
          mbEnd();
          document.removeEventListener('mousemove', onMove, true);
          document.removeEventListener('mouseup',   onUp,   true);
        }
        // capture:true để nhận event trước game handler
        document.addEventListener('mousemove', onMove, true);
        document.addEventListener('mouseup',   onUp,   true);
      });

      // Touch — listener trực tiếp trên handle
      mbH.addEventListener('touchstart', function (e) {
        e.stopPropagation();
        var t = e.touches[0];
        mbStart(t.clientX, t.clientY);
      }, { passive: true });

      mbH.addEventListener('touchmove', function (e) {
        e.stopPropagation();
        if (!mbState.on) return;
        var t = e.touches[0];
        mbMove(t.clientX, t.clientY);
        e.preventDefault();
      }, { passive: false });

      mbH.addEventListener('touchend', function (e) {
        e.stopPropagation();
        mbEnd();
      }, { passive: true });
    }

    // ═══════════════════════════════════════════════════════
    // 4. DRAG .modal-panel
    //
    // Vấn đề cũ: pointer capture không hoạt động vì game canvas
    // có thể đang giữ capture, hoặc browser mobile không hỗ trợ
    // setPointerCapture trên element thường.
    //
    // Giải pháp v5:
    //   - Thuần mouse/touch events
    //   - mousemove/mouseup gắn vào document với capture:true
    //     → nhận trước game handler
    //   - touchmove/touchend gắn vào document với capture:true
    //   - Panel chuyển sang position:absolute, tính left/top
    //     từ getBoundingClientRect (luôn đúng)
    //   - MutationObserver center panel khi overlay.show
    // ═══════════════════════════════════════════════════════
    function setupModalDrag(panel) {
      if (!panel || panel._v5drag) return;
      panel._v5drag = true;

      var header  = panel.querySelector('.modal-header');
      if (!header) return;
      var overlay = panel.closest('.modal-overlay');

      // Center panel khi overlay show
      function centerPanel() {
        panel.style.position = 'absolute';
        panel.style.margin   = '0';
        var W = window.innerWidth, H = window.innerHeight;
        var bW = panel.offsetWidth  || 400;
        var bH = panel.offsetHeight || 440;
        panel.style.left = clamp((W - bW) / 2, 4, W - bW - 4) + 'px';
        panel.style.top  = clamp((H - bH) / 4, 4, H - bH - 4) + 'px';
      }

      function resetPanel() {
        panel.style.left = panel.style.top = '';
        panel.style.position = panel.style.margin = '';
      }

      if (overlay) {
        var obs = new MutationObserver(function () {
          if (overlay.classList.contains('show')) {
            if (!panel.style.left) setTimeout(centerPanel, 30);
          } else {
            setTimeout(resetPanel, 400);
          }
        });
        obs.observe(overlay, { attributes: true, attributeFilter: ['class'] });
      }

      // Drag state
      var mpState = { on: false, sx: 0, sy: 0, sl: 0, st: 0 };

      function mpStart(cx, cy) {
        panel.style.position = 'absolute';
        panel.style.margin   = '0';
        var r = panel.getBoundingClientRect();
        mpState.on = true;
        mpState.sx = cx; mpState.sy = cy;
        mpState.sl = r.left; mpState.st = r.top;
      }

      function mpMove(cx, cy) {
        if (!mpState.on) return;
        var dx = cx - mpState.sx, dy = cy - mpState.sy;
        var W = window.innerWidth,  H = window.innerHeight;
        var bW = panel.offsetWidth, bH = panel.offsetHeight;
        panel.style.left = clamp(mpState.sl + dx, 0, W - bW) + 'px';
        panel.style.top  = clamp(mpState.st + dy, 0, H - bH) + 'px';
      }

      function mpEnd() { mpState.on = false; }

      // Mouse
      header.addEventListener('mousedown', function (e) {
        if (e.target.closest && e.target.closest('.modal-close')) return;
        if (e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();
        mpStart(e.clientX, e.clientY);

        function onMove(ev) { ev.stopPropagation(); mpMove(ev.clientX, ev.clientY); }
        function onUp(ev)   {
          ev.stopPropagation();
          mpEnd();
          document.removeEventListener('mousemove', onMove, true);
          document.removeEventListener('mouseup',   onUp,   true);
        }
        document.addEventListener('mousemove', onMove, true);
        document.addEventListener('mouseup',   onUp,   true);
      });

      // Touch
      header.addEventListener('touchstart', function (e) {
        if (e.target.closest && e.target.closest('.modal-close')) return;
        e.stopPropagation();
        mpStart(e.touches[0].clientX, e.touches[0].clientY);
      }, { passive: true });

      // touchmove/end trên document capture để không bị scroll chặn
      // Gắn khi touchstart, gỡ khi touchend
      header.addEventListener('touchstart', function attachDocTouch() {
        function onMove(ev) {
          if (!mpState.on) return;
          ev.stopPropagation();
          ev.preventDefault();
          mpMove(ev.touches[0].clientX, ev.touches[0].clientY);
        }
        function onEnd(ev) {
          ev.stopPropagation();
          mpEnd();
          document.removeEventListener('touchmove', onMove, true);
          document.removeEventListener('touchend',  onEnd,  true);
          document.removeEventListener('touchcancel', onEnd, true);
        }
        document.addEventListener('touchmove',   onMove, { capture: true, passive: false });
        document.addEventListener('touchend',    onEnd,  true);
        document.addEventListener('touchcancel', onEnd,  true);
      }, { passive: true });

      // Close + overlay click → reset
      var cb = panel.querySelector('.modal-close');
      if (cb) cb.addEventListener('click', function () { setTimeout(resetPanel, 400); });
      if (overlay) overlay.addEventListener('click', function (e) {
        if (e.target === overlay) setTimeout(resetPanel, 400);
      });
    }

    // Setup cho tất cả panel hiện có
    document.querySelectorAll('.modal-panel').forEach(setupModalDrag);

    console.log('patch.js v5 ready');
  });

})();
