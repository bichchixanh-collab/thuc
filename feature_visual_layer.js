// ==================== FEATURE: VISUAL LAYER (v2) ====================
// DOM overlay: fog cuộn nhẹ, tia sáng CSS, vignette
// FIX: không dùng ctx.filter trong loop, fog canvas 1/4 kích thước,
//      scroll bằng CSS transform thay vì vẽ lại mỗi frame

const VisualLayer = (function() {
  'use strict';

  let container = null;
  let fogCanvas = null, fogCtx = null;
  let rafId = null;
  let time = 0, lastTs = 0;
  let lastZone = 'default';
  let lastZoneCheck = 0;

  const zoneColors = {
    forest:   { fog: '8,35,8',   a: 0.13 },
    mountain: { fog: '18,8,35',  a: 0.11 },
    dungeon:  { fog: '35,0,0',   a: 0.16 },
    default:  { fog: '8,8,28',   a: 0.10 }
  };
  let activeFog = zoneColors.default;

  // ---- Container ----
  function createContainer() {
    container = document.createElement('div');
    container.id = 'vfx-overlay';
    Object.assign(container.style, {
      position: 'absolute',
      top: '0', left: '0',
      width: '100%', height: '100%',
      pointerEvents: 'none',
      zIndex: '4',
      overflow: 'hidden'
    });
    document.body.appendChild(container);
  }

  // ---- Fog canvas: 1/4 size + CSS blur (không vẽ trong loop) ----
  function createFogCanvas() {
    fogCanvas = document.createElement('canvas');
    fogCanvas.id = 'vfx-fog';
    fogCanvas.width  = Math.ceil(window.innerWidth  / 4);
    fogCanvas.height = Math.ceil(window.innerHeight / 4);
    Object.assign(fogCanvas.style, {
      position: 'absolute',
      bottom: '0', left: '-10%',
      width: '120%',
      height: '45%',
      // CSS blur đặt 1 lần, không thay đổi trong loop
      filter: 'blur(14px)',
      opacity: '0.9',
      willChange: 'transform'
    });
    fogCtx = fogCanvas.getContext('2d');
    container.appendChild(fogCanvas);

    window.addEventListener('resize', () => {
      fogCanvas.width  = Math.ceil(window.innerWidth  / 4);
      fogCanvas.height = Math.ceil(window.innerHeight / 4);
      paintFog();
    }, { passive: true });
  }

  // ---- Vẽ fog 1 lần (khi init hoặc đổi zone) ----
  // Không gọi trong RAF, chỉ gọi khi cần thiết
  function paintFog() {
    if (!fogCtx) return;
    const w = fogCanvas.width;
    const h = fogCanvas.height;
    const { fog: c, a } = activeFog;
    fogCtx.clearRect(0, 0, w, h);

    // 3 ellipse gradient, không có ctx.filter
    const blobs = [
      { x: 0.25, y: 0.7, rx: 0.5, ry: 0.6, alpha: a },
      { x: 0.70, y: 0.85, rx: 0.45, ry: 0.5, alpha: a * 0.8 },
      { x: 0.50, y: 0.5, rx: 0.6, ry: 0.4, alpha: a * 0.5 }
    ];
    blobs.forEach(b => {
      const grd = fogCtx.createRadialGradient(
        b.x * w, b.y * h, 0,
        b.x * w, b.y * h, b.rx * w
      );
      grd.addColorStop(0,   `rgba(${c}, ${b.alpha})`);
      grd.addColorStop(0.6, `rgba(${c}, ${b.alpha * 0.4})`);
      grd.addColorStop(1,   `rgba(${c}, 0)`);
      fogCtx.fillStyle = grd;
      fogCtx.beginPath();
      fogCtx.ellipse(b.x * w, b.y * h, b.rx * w, b.ry * h, 0, 0, Math.PI * 2);
      fogCtx.fill();
    });
  }

  // ---- Light rays: chỉ CSS animation, không JS ----
  function createLightRays() {
    const style = document.createElement('style');
    style.id = 'vfx-ray-style';
    style.textContent = `
      .vfx-ray {
        position: absolute; top: -20%;
        width: 45px; height: 130%;
        border-radius: 50%;
        filter: blur(18px);
        pointer-events: none;
        background: linear-gradient(180deg, rgba(255,215,100,0.18) 0%, transparent 100%);
      }
      @keyframes vfxRayA { 0%,100%{opacity:0.5} 50%{opacity:1} }
      @keyframes vfxRayB { 0%,100%{opacity:1}   50%{opacity:0.3} }
      @keyframes vfxRayC { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
    `;
    document.head.appendChild(style);

    [
      { left: '12%', rot: '-18deg', dur: '9s',  del: '0s',  anim: 'vfxRayA' },
      { left: '40%', rot: '-4deg',  dur: '13s', del: '-4s', anim: 'vfxRayB' },
      { left: '68%', rot: '10deg',  dur: '11s', del: '-7s', anim: 'vfxRayC' },
    ].forEach(cfg => {
      const ray = document.createElement('div');
      ray.className = 'vfx-ray';
      Object.assign(ray.style, {
        left: cfg.left,
        transform: `rotate(${cfg.rot})`,
        transformOrigin: 'top center',
        animation: `${cfg.anim} ${cfg.dur} ease-in-out ${cfg.del} infinite`
      });
      container.appendChild(ray);
    });
  }

  // ---- Vignette (1 div tĩnh) ----
  function createVignette() {
    const v = document.createElement('div');
    v.id = 'vfx-vignette';
    Object.assign(v.style, {
      position: 'absolute', inset: '0',
      background: 'radial-gradient(ellipse at 50% 50%, transparent 42%, rgba(0,0,0,0.48) 100%)',
      pointerEvents: 'none'
    });
    container.appendChild(v);
  }

  // ---- Zone detect: throttle 5 giây ----
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
    if (zone !== lastZone) {
      lastZone = zone;
      activeFog = zoneColors[zone];
      paintFog(); // chỉ vẽ lại khi đổi zone
    }
  }

  // ---- RAF loop: chỉ scroll fog bằng CSS, không vẽ canvas ----
  let frameCount = 0;
  function loop(ts) {
    const dt = ts - lastTs;
    lastTs = ts;
    time += dt;

    // Zone check throttled
    detectZone(ts);

    // Scroll fog via CSS transform — KHÔNG vẽ canvas
    // Chỉ update mỗi 3 frame (20fps đủ cho fog)
    if (++frameCount % 3 === 0 && fogCanvas) {
      const scrollX = (time * 0.008) % 100; // % pixel
      fogCanvas.style.transform = `translateX(-${scrollX}px)`;
    }

    rafId = requestAnimationFrame(loop);
  }

  // ---- Public ----
  function init() {
    if (document.getElementById('vfx-overlay')) return;
    createContainer();
    createFogCanvas();
    createLightRays();
    createVignette();
    paintFog();
    rafId = requestAnimationFrame(loop);
    console.log('[VisualLayer] ✅ v2 initialized');
  }

  function destroy() {
    if (rafId) cancelAnimationFrame(rafId);
    if (container) container.remove();
    const s = document.getElementById('vfx-ray-style');
    if (s) s.remove();
  }

  return { init, destroy };
})();

(function autoInit() {
  const tryInit = () => {
    if (typeof GameState !== 'undefined' && document.getElementById('gameCanvas')) {
      VisualLayer.init();
    } else {
      setTimeout(tryInit, 300);
    }
  };
  if (document.readyState === 'complete') tryInit();
  else window.addEventListener('load', tryInit);
})();
