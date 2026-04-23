// ==================== FEATURE: PARALLAX (v2) ====================
// Nền đa lớp parallax thuần CSS — KHÔNG RAF loop riêng
// Dùng CSS custom properties cập nhật qua 1 requestAnimationFrame
// FIX: không tạo DOM element mới mỗi frame, không nested loop

const ParallaxSystem = (function() {
  'use strict';

  let container = null;
  let layerEls = [];
  let rafId = null;
  let lastTs = 0;
  let lastZone = '';
  let lastZoneCheck = 0;

  // Layer configs: speedX/Y = tỉ lệ camera offset (0 = cố định, 1 = theo camera)
  const LAYERS = [
    { id: 'px-l0', speedX: 0.04, speedY: 0.02 },
    { id: 'px-l1', speedX: 0.10, speedY: 0.06 },
    { id: 'px-l2', speedX: 0.18, speedY: 0.10 },
  ];

  const THEMES = {
    default: [
      'linear-gradient(180deg, #08051a 0%, #14103a 45%, #0a120a 100%)',
      'radial-gradient(ellipse 110% 55% at 50% 25%, rgba(45,18,75,0.45) 0%, transparent 70%)',
      'linear-gradient(180deg, transparent 55%, rgba(5,5,20,0.5) 100%)'
    ],
    forest: [
      'linear-gradient(180deg, #040d04 0%, #081808 50%, #040d04 100%)',
      'radial-gradient(ellipse 100% 50% at 50% 20%, rgba(15,50,15,0.5) 0%, transparent 70%)',
      'linear-gradient(180deg, transparent 60%, rgba(5,20,5,0.45) 100%)'
    ],
    mountain: [
      'linear-gradient(180deg, #06040e 0%, #0e0620 50%, #060e08 100%)',
      'radial-gradient(ellipse 120% 55% at 50% 22%, rgba(35,15,70,0.5) 0%, transparent 70%)',
      'linear-gradient(180deg, transparent 58%, rgba(5,3,15,0.5) 100%)'
    ],
    dungeon: [
      'linear-gradient(180deg, #0e0000 0%, #180404 50%, #0e0000 100%)',
      'radial-gradient(ellipse 90% 50% at 50% 35%, rgba(55,4,4,0.5) 0%, transparent 70%)',
      'radial-gradient(ellipse 60% 30% at 20% 80%, rgba(35,0,0,0.4) 0%, transparent 60%)'
    ]
  };

  function createContainer() {
    container = document.createElement('div');
    container.id = 'px-container';
    Object.assign(container.style, {
      position: 'absolute',
      inset: '-5%',          // padding để parallax không show edge
      pointerEvents: 'none',
      zIndex: '1',
      overflow: 'hidden'
    });
    const gameCanvas = document.getElementById('gameCanvas');
    if (gameCanvas && gameCanvas.parentNode) {
      gameCanvas.parentNode.insertBefore(container, gameCanvas);
    } else {
      document.body.prepend(container);
    }

    LAYERS.forEach(cfg => {
      const el = document.createElement('div');
      el.id = cfg.id;
      Object.assign(el.style, {
        position: 'absolute',
        inset: '0',
        willChange: 'transform',
        transition: 'background 1.5s ease'
      });
      container.appendChild(el);
      layerEls.push(el);
    });

    applyTheme('default');
  }

  function applyTheme(name) {
    const theme = THEMES[name] || THEMES.default;
    lastZone = name;
    layerEls.forEach((el, i) => {
      el.style.background = theme[i] || 'none';
    });
  }

  function detectZone(ts) {
    if (ts - lastZoneCheck < 5000) return;
    lastZoneCheck = ts;
    if (typeof GameState === 'undefined' || typeof Maps === 'undefined') return;
    const map = Maps.maps ? Maps.maps[GameState.currentMap || 0] : null;
    const name = (map ? map.name || '' : '').toLowerCase();
    let zone = 'default';
    if (name.includes('rừng') || name.includes('thanh') || name.includes('lâm')) zone = 'forest';
    else if (name.includes('núi') || name.includes('sơn') || name.includes('băng'))  zone = 'mountain';
    else if (name.includes('động') || name.includes('âm') || name.includes('quỷ'))   zone = 'dungeon';
    if (zone !== lastZone) applyTheme(zone);
  }

  // ---- RAF loop: chỉ update CSS transform ----
  // Chia sẻ với game loop — rất nhẹ, chỉ 3 style.transform
  let frameSkip = 0;
  function loop(ts) {
    lastTs = ts;
    detectZone(ts);

    // Cập nhật parallax mỗi 2 frame
    if (++frameSkip % 2 === 0) {
      const camX = (typeof GameState !== 'undefined' && GameState.camera) ? GameState.camera.x : 0;
      const camY = (typeof GameState !== 'undefined' && GameState.camera) ? GameState.camera.y : 0;
      LAYERS.forEach((cfg, i) => {
        const tx = -(camX * cfg.speedX).toFixed(1);
        const ty = -(camY * cfg.speedY).toFixed(1);
        layerEls[i].style.transform = `translate(${tx}px, ${ty}px)`;
      });
    }

    rafId = requestAnimationFrame(loop);
  }

  // ---- Map travel transition ----
  function doTransition() {
    const el = document.createElement('div');
    Object.assign(el.style, {
      position: 'fixed', inset: '0',
      background: 'radial-gradient(ellipse at 50% 50%, rgba(240,192,64,0.25) 0%, rgba(0,0,0,0.9) 100%)',
      zIndex: '500', pointerEvents: 'none',
      animation: 'pxFade 0.7s ease-out forwards'
    });
    if (!document.getElementById('pxFadeStyle')) {
      const s = document.createElement('style');
      s.id = 'pxFadeStyle';
      s.textContent = '@keyframes pxFade{0%{opacity:1}100%{opacity:0}}';
      document.head.appendChild(s);
    }
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 750);
  }

  function hookMapTravel() {
    if (typeof Maps === 'undefined' || !Maps.travelTo) return;
    const _orig = Maps.travelTo.bind(Maps);
    Maps.travelTo = function(...args) {
      doTransition();
      const r = _orig(...args);
      setTimeout(() => detectZone(performance.now() + 5001), 400); // force re-check
      return r;
    };
    console.log('[ParallaxSystem] ✅ Maps.travelTo hooked');
  }

  function init() {
    if (document.getElementById('px-container')) return;
    createContainer();
    setTimeout(hookMapTravel, 600);
    rafId = requestAnimationFrame(loop);
    console.log('[ParallaxSystem] ✅ v2 initialized');
  }

  function destroy() {
    if (rafId) cancelAnimationFrame(rafId);
    if (container) container.remove();
  }

  return { init, destroy, doTransition };
})();

(function autoInit() {
  const tryInit = () => {
    if (typeof GameState !== 'undefined' && document.getElementById('gameCanvas')) {
      ParallaxSystem.init();
    } else {
      setTimeout(tryInit, 350);
    }
  };
  if (document.readyState === 'complete') tryInit();
  else window.addEventListener('load', tryInit);
})();
