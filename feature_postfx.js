// ==================== FEATURE: POST FX (v2) ====================
// Screen shake, flash, character aura, color grading
// FIX:
//  - KHÔNG đổi body.style.filter (gây full repaint)
//  - KHÔNG dùng backdrop-filter
//  - Hook an toàn: kiểm tra xem đã bị wrap chưa trước khi wrap tiếp
//  - Shake bằng CSS animation trên overlay, không transform canvas
//  - Color grading = 1 div tint nhẹ, không filter

const PostFX = (function() {
  'use strict';

  let tintEl = null;
  let flashEl = null;
  let shakeEl = null; // element nhận shake (vfx-overlay)
  let rafId = null;

  const TINTS = {
    default:  'transparent',
    forest:   'rgba(0,15,0,0.07)',
    mountain: 'rgba(5,0,15,0.08)',
    dungeon:  'rgba(20,0,0,0.10)',
    combat:   'rgba(15,0,0,0.06)'
  };

  // ---- Inject CSS ----
  function injectCSS() {
    if (document.getElementById('pfx-style')) return;
    const s = document.createElement('style');
    s.id = 'pfx-style';
    s.textContent = `
      /* Screen shake — áp lên vfx-overlay, không áp canvas */
      @keyframes pfxShake {
        0%,100%{ transform:translate(0,0) }
        20%    { transform:translate(-4px,-2px) }
        40%    { transform:translate(4px,2px) }
        60%    { transform:translate(-3px,3px) }
        80%    { transform:translate(3px,-2px) }
      }
      @keyframes pfxShakeLight {
        0%,100%{ transform:translate(0,0) }
        25%    { transform:translate(-2px,-1px) }
        75%    { transform:translate(2px,1px) }
      }
      /* Flash overlay */
      @keyframes pfxFlash {
        0%  { opacity:1 }
        100%{ opacity:0 }
      }
      /* Edge damage vignette */
      @keyframes pfxEdge {
        0%,100%{ opacity:0 }
        40%    { opacity:1 }
      }
      /* Avatar breathing */
      @keyframes pfxBreathe {
        0%,100%{ transform:scaleY(1) translateY(0) }
        45%    { transform:scaleY(1.015) translateY(-1px) }
        75%    { transform:scaleY(0.988) translateY(0.8px) }
      }
      /* Avatar float */
      @keyframes pfxFloat {
        0%,100%{ transform:translateY(0) }
        50%    { transform:translateY(-2.5px) }
      }
      /* Aura idle */
      @keyframes pfxAuraIdle {
        0%,100%{ box-shadow:0 0 8px rgba(240,192,64,0.35), 0 0 16px rgba(240,192,64,0.1), inset 0 0 20px rgba(0,0,0,0.5) }
        50%    { box-shadow:0 0 14px rgba(240,192,64,0.55), 0 0 26px rgba(240,192,64,0.18), inset 0 0 20px rgba(0,0,0,0.5) }
      }
      /* Aura cultivate */
      @keyframes pfxAuraCulti {
        0%,100%{ box-shadow:0 0 10px rgba(100,220,255,0.5), 0 0 28px rgba(100,220,255,0.2) }
        50%    { box-shadow:0 0 18px rgba(100,220,255,0.8), 0 0 42px rgba(100,220,255,0.35) }
      }
      /* Aura combat */
      @keyframes pfxAuraCombat {
        0%,100%{ box-shadow:0 0 10px rgba(255,60,40,0.55), 0 0 22px rgba(255,60,40,0.22) }
        50%    { box-shadow:0 0 18px rgba(255,60,40,0.85), 0 0 36px rgba(255,60,40,0.4) }
      }
      /* Apply to avatar */
      #avatarFrame {
        animation: pfxFloat 4s ease-in-out infinite, pfxAuraIdle 4s ease-in-out infinite;
        will-change: transform, box-shadow;
      }
      #avatarCanvas {
        animation: pfxBreathe 4s ease-in-out infinite;
        transform-origin: bottom center;
      }
      #avatarFrame.cultivate {
        animation: pfxFloat 3s ease-in-out infinite, pfxAuraCulti 2.5s ease-in-out infinite !important;
      }
      #avatarFrame.combat {
        animation: pfxAuraCombat 0.75s ease-in-out infinite !important;
      }
      /* HP bar low */
      @keyframes pfxHpWarn {
        0%,100%{ opacity:1 }
        50%    { opacity:0.65 }
      }
      .hp-fill.low {
        animation: pfxHpWarn 0.9s ease-in-out infinite;
        background: linear-gradient(90deg,#7a0000,#ff1744) !important;
      }
      /* Legendary slot */
      @keyframes pfxLegend {
        0%,100%{ box-shadow:0 0 10px rgba(240,192,64,0.4); border-color:#f0c040 }
        50%    { box-shadow:0 0 20px rgba(240,192,64,0.7); border-color:#ffe082 }
      }
      .inv-slot.legendary {
        animation: pfxLegend 2.5s ease-in-out infinite !important;
      }
      /* Stat bar shimmer */
      .stat-bar-fill {
        position: relative; overflow: hidden;
      }
      .stat-bar-fill::after {
        content:'';
        position:absolute; top:0; left:-100%; width:55%; height:100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
        animation: pfxShimmer 3.5s ease-in-out infinite;
      }
      @keyframes pfxShimmer {
        0%  { left:-100% }
        45%,100%{ left:160% }
      }
      /* Stat bar transition */
      #hpBar, #mpBar, #expBar, .realm-progress-fill {
        transition: width 0.35s ease;
      }
    `;
    document.head.appendChild(s);
  }

  // ---- Create overlay elements ----
  function createElements() {
    // Flash div (toàn màn hình, z cao)
    flashEl = document.createElement('div');
    flashEl.id = 'pfx-flash';
    Object.assign(flashEl.style, {
      position: 'fixed', inset: '0',
      pointerEvents: 'none', zIndex: '8',
      opacity: '0', background: 'transparent'
    });
    document.body.appendChild(flashEl);

    // Color tint div (nhẹ, transition chậm)
    tintEl = document.createElement('div');
    tintEl.id = 'pfx-tint';
    Object.assign(tintEl.style, {
      position: 'fixed', inset: '0',
      pointerEvents: 'none', zIndex: '5',
      background: 'transparent',
      transition: 'background 2.5s ease'
      // KHÔNG dùng filter hoặc backdrop-filter
    });
    document.body.appendChild(tintEl);

    // Shake target: vfx-overlay nếu có, không thì tạo wrapper riêng
    shakeEl = document.getElementById('vfx-overlay') || null;
  }

  // ---- Effects ----
  function triggerFlash(color, dur) {
    if (!flashEl) return;
    dur = dur || 180;
    flashEl.style.background = color || 'rgba(255,255,255,0.3)';
    flashEl.style.opacity = '1';
    flashEl.style.animation = 'none';
    void flashEl.offsetWidth; // reflow
    flashEl.style.animation = `pfxFlash ${dur}ms ease-out forwards`;
  }

  function triggerShake(intensity, dur) {
    if (!shakeEl) return;
    const anim = intensity > 5 ? 'pfxShake' : 'pfxShakeLight';
    dur = dur || 280;
    shakeEl.style.animation = 'none';
    void shakeEl.offsetWidth;
    shakeEl.style.animation = `${anim} ${dur}ms ease-out`;
    setTimeout(() => { shakeEl.style.animation = ''; }, dur + 20);
  }

  function triggerEdge(color, dur) {
    const e = document.createElement('div');
    dur = dur || 450;
    Object.assign(e.style, {
      position: 'fixed', inset: '0', zIndex: '7', pointerEvents: 'none',
      background: `radial-gradient(ellipse at 50% 50%, transparent 50%, ${color || 'rgba(200,0,0,0.28)'} 100%)`,
      animation: `pfxEdge ${dur}ms ease-in-out forwards`
    });
    document.body.appendChild(e);
    setTimeout(() => e.remove(), dur + 20);
  }

  function setTint(zoneName) {
    if (!tintEl) return;
    tintEl.style.background = TINTS[zoneName] || 'transparent';
  }

  // ---- HP bar warning ----
  function checkHpWarn() {
    if (typeof Player === 'undefined') return;
    const hpPct = Player.hp / (Player.maxHp || 100);
    const bar = document.getElementById('hpBar');
    if (!bar) return;
    if (hpPct < 0.3) bar.classList.add('low');
    else bar.classList.remove('low');
  }

  // ---- Avatar state ----
  function setAvatarState(state) {
    const f = document.getElementById('avatarFrame');
    if (!f) return;
    f.classList.remove('cultivate', 'combat');
    if (state === 'cultivate') f.classList.add('cultivate');
    else if (state === 'combat') f.classList.add('combat');
  }

  // ---- Hooks ----
  function hookSystems() {
    // Hook Enemies.kill — kiểm tra không wrap 2 lần
    if (typeof Enemies !== 'undefined' && Enemies.kill && !Enemies.__pfxHooked) {
      Enemies.__pfxHooked = true;
      const _orig = Enemies.kill.bind(Enemies);
      Enemies.kill = function(enemy) {
        triggerShake(4, 200);
        triggerFlash('rgba(255,180,0,0.12)', 120);
        return _orig(enemy);
      };
      console.log('[PostFX] ✅ Enemies.kill hooked');
    }

    // Hook Player.takeDamage
    if (typeof Player !== 'undefined' && Player.takeDamage && !Player.__pfxHooked) {
      Player.__pfxHooked = true;
      const _orig = Player.takeDamage.bind(Player);
      Player.takeDamage = function(dmg, attacker) {
        triggerShake(5, 250);
        triggerEdge('rgba(180,0,0,0.25)', 400);
        return _orig(dmg, attacker);
      };
      console.log('[PostFX] ✅ Player.takeDamage hooked');
    }

    // Hook AutoSystem toggles
    if (typeof AutoSystem !== 'undefined') {
      if (AutoSystem.toggleAutoFarm && !AutoSystem.__pfxFarmHooked) {
        AutoSystem.__pfxFarmHooked = true;
        const _o = AutoSystem.toggleAutoFarm.bind(AutoSystem);
        AutoSystem.toggleAutoFarm = function() {
          const r = _o();
          setAvatarState(AutoSystem.farming ? 'combat' : 'idle');
          setTint(AutoSystem.farming ? 'combat' : 'default');
          return r;
        };
      }
      if (AutoSystem.toggleCultivate && !AutoSystem.__pfxCultiHooked) {
        AutoSystem.__pfxCultiHooked = true;
        const _o = AutoSystem.toggleCultivate.bind(AutoSystem);
        AutoSystem.toggleCultivate = function() {
          const r = _o();
          setAvatarState(AutoSystem.cultivating ? 'cultivate' : 'idle');
          return r;
        };
      }
    }
  }

  // ---- Periodic checks (zone tint, hp warn) ----
  let lastCheck = 0;
  let lastZone = '';
  function periodicCheck(ts) {
    if (ts - lastCheck < 4000) return;
    lastCheck = ts;
    checkHpWarn();
    // Zone tint (chỉ khi không combat)
    const inCombat = typeof AutoSystem !== 'undefined' && AutoSystem.farming;
    if (!inCombat && typeof GameState !== 'undefined' && typeof Maps !== 'undefined') {
      const map = Maps.maps ? Maps.maps[GameState.currentMap || 0] : null;
      const name = (map ? map.name || '' : '').toLowerCase();
      let zone = 'default';
      if (name.includes('rừng') || name.includes('thanh')) zone = 'forest';
      else if (name.includes('núi') || name.includes('sơn')) zone = 'mountain';
      else if (name.includes('động') || name.includes('âm') || name.includes('quỷ')) zone = 'dungeon';
      if (zone !== lastZone) { lastZone = zone; setTint(zone); }
    }
  }

  function loop(ts) {
    periodicCheck(ts);
    rafId = requestAnimationFrame(loop);
  }

  // ---- Public ----
  function init() {
    if (document.getElementById('pfx-style')) return;
    injectCSS();
    createElements();
    setTimeout(hookSystems, 700);
    rafId = requestAnimationFrame(loop);
    console.log('[PostFX] ✅ v2 initialized');
  }

  function destroy() {
    if (rafId) cancelAnimationFrame(rafId);
    if (flashEl) flashEl.remove();
    if (tintEl) tintEl.remove();
    const s = document.getElementById('pfx-style');
    if (s) s.remove();
  }

  return { init, triggerShake, triggerFlash, triggerEdge, setTint, setAvatarState, destroy };
})();

(function autoInit() {
  const tryInit = () => {
    if (typeof GameState !== 'undefined' && document.getElementById('gameCanvas')) {
      PostFX.init();
    } else {
      setTimeout(tryInit, 450);
    }
  };
  if (document.readyState === 'complete') tryInit();
  else window.addEventListener('load', tryInit);
})();
