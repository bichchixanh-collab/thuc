// ==================== FEATURE: PARTICLES (v2) ====================
// FIX: 
//  - 1 RAF loop duy nhất (v1 có 2 loop chạy song song)
//  - Không dùng Array.filter() để đếm mỗi frame
//  - Dùng counter riêng, không splice() trong loop chính
//  - Giảm số lượng particle mặc định
//  - Orb dùng arc đơn giản thay vì createRadialGradient mỗi frame

const ParticleSystem = (function() {
  'use strict';

  const CFG = {
    enabled: true,
    dust:   { max: 12, color: ['255,220,120', '190,160,255', '120,210,255'] },
    leaves: { max: 6,  color: ['70,150,50',  '130,190,70',  '190,150,50'] },
    orbs:   { max: 5,  color: ['100,220,255', '180,120,255', '255,190,90'] }
  };

  let canvas, ctx;
  let rafId = null;
  let lastTs = 0;
  let W = window.innerWidth;
  let H = window.innerHeight;

  // ---- Particle pool: mảng cố định, tái sử dụng ----
  const MAX = 80;
  const pool = new Array(MAX).fill(null).map(() => ({ alive: false }));
  // Đếm nhanh bằng counter, không dùng .filter()
  let countDust = 0, countLeaves = 0, countOrbs = 0;

  function getSlot() {
    for (let i = 0; i < MAX; i++) {
      if (!pool[i].alive) return pool[i];
    }
    return null; // pool đầy
  }

  // ---- Spawn helpers ----
  function spawnDust() {
    const p = getSlot(); if (!p) return;
    const c = CFG.dust.color[Math.floor(Math.random() * CFG.dust.color.length)];
    p.alive = true; p.type = 'dust';
    p.x = Math.random() * W;
    p.y = H + 5;
    p.vx = (Math.random() - 0.5) * 0.25;
    p.vy = -0.15 - Math.random() * 0.3;
    p.size = 1 + Math.random() * 1.5;
    p.alpha = 0.15 + Math.random() * 0.25;
    p.wave = Math.random() * 6.28;
    p.waveSpd = 0.4 + Math.random() * 0.4;
    p.waveAmp = 0.25 + Math.random() * 0.4;
    p.color = c;
    countDust++;
  }

  function spawnLeaf() {
    const p = getSlot(); if (!p) return;
    const c = CFG.leaves.color[Math.floor(Math.random() * CFG.leaves.color.length)];
    p.alive = true; p.type = 'leaf';
    p.x = Math.random() * W;
    p.y = -10;
    p.vx = (Math.random() - 0.5) * 0.6;
    p.vy = 0.4 + Math.random() * 0.8;
    p.size = 3 + Math.random() * 3;
    p.alpha = 0.4 + Math.random() * 0.3;
    p.rot = Math.random() * 6.28;
    p.rotSpd = (Math.random() - 0.5) * 0.04;
    p.wave = Math.random() * 6.28;
    p.waveSpd = 0.8 + Math.random() * 0.8;
    p.waveAmp = 0.8 + Math.random() * 0.8;
    p.color = c;
    countLeaves++;
  }

  function spawnOrb() {
    const p = getSlot(); if (!p) return;
    const c = CFG.orbs.color[Math.floor(Math.random() * CFG.orbs.color.length)];
    p.alive = true; p.type = 'orb';
    p.x = Math.random() * W;
    p.y = H * 0.3 + Math.random() * H * 0.6;
    p.vx = (Math.random() - 0.5) * 0.15;
    p.vy = -0.08 - Math.random() * 0.2;
    p.size = 2 + Math.random() * 2.5;
    p.alpha = 0;
    p.alphaTarget = 0.25 + Math.random() * 0.35;
    p.fadeIn = true;
    p.life = 5000 + Math.random() * 5000; // ms
    p.pulse = Math.random() * 6.28;
    p.pulseSpd = 0.8 + Math.random() * 1.5;
    p.color = c;
    countOrbs++;
  }

  function spawnBurst(sx, sy, isCrit) {
    const count = isCrit ? 10 : 5;
    const c = isCrit ? '255,70,30' : '255,190,50';
    for (let i = 0; i < count; i++) {
      const p = getSlot(); if (!p) break;
      const angle = (i / count) * 6.28 + Math.random() * 0.4;
      const spd = isCrit ? (1.5 + Math.random() * 3) : (0.8 + Math.random() * 1.5);
      p.alive = true; p.type = 'burst';
      p.x = sx; p.y = sy;
      p.vx = Math.cos(angle) * spd;
      p.vy = Math.sin(angle) * spd - 0.8;
      p.size = isCrit ? (2.5 + Math.random() * 3) : (1.5 + Math.random() * 2);
      p.alpha = 0.85;
      p.life = 400 + Math.random() * 200; // ms
      p.gravity = 0.06;
      p.color = c;
    }
  }

  // ---- Update + draw (1 pass) ----
  function tick(dtMs) {
    const dt = dtMs / 1000;
    ctx.clearRect(0, 0, W, H);

    for (let i = 0; i < MAX; i++) {
      const p = pool[i];
      if (!p.alive) continue;

      let dead = false;

      if (p.type === 'dust') {
        p.wave += p.waveSpd * dt;
        p.x += p.vx + Math.sin(p.wave) * p.waveAmp * dt;
        p.y += p.vy;
        if (p.y < -10) {
          // recycle
          p.x = Math.random() * W;
          p.y = H + 5;
        }
        if (p.x < -5) p.x = W + 5;
        if (p.x > W + 5) p.x = -5;
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = `rgb(${p.color})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, 6.28);
        ctx.fill();

      } else if (p.type === 'leaf') {
        p.wave += p.waveSpd * dt;
        p.x += p.vx + Math.sin(p.wave) * p.waveAmp * dt * 8;
        p.y += p.vy;
        p.rot += p.rotSpd;
        if (p.y > H + 10) {
          p.x = Math.random() * W;
          p.y = -10;
        }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = `rgb(${p.color})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.45, 0, 0, 6.28);
        ctx.fill();
        ctx.restore();

      } else if (p.type === 'orb') {
        p.pulse += p.pulseSpd * dt;
        p.x += p.vx + Math.sin(p.pulse * 0.6) * 0.2 * dt * 60;
        p.y += p.vy;
        p.life -= dtMs;
        if (p.fadeIn) {
          p.alpha += 0.008;
          if (p.alpha >= p.alphaTarget) { p.alpha = p.alphaTarget; p.fadeIn = false; }
        } else if (p.life < 1200) {
          p.alpha -= 0.004;
        }
        if (p.life <= 0 || p.alpha <= 0) {
          // recycle orb (không xóa, giữ slot)
          countOrbs--;
          p.alive = false;
          dead = true;
        } else {
          const s = p.size + Math.sin(p.pulse) * p.size * 0.25;
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = `rgb(${p.color})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, s, 0, 6.28);
          ctx.fill();
        }

      } else if (p.type === 'burst') {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.life -= dtMs;
        p.alpha = Math.max(0, p.life / 500);
        if (p.life <= 0) {
          p.alive = false; dead = true;
        } else {
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = `rgb(${p.color})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, 6.28);
          ctx.fill();
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  // ---- Replenish (gọi mỗi vài giây, không mỗi frame) ----
  let replenishTimer = 0;
  function replenish(dtMs) {
    replenishTimer += dtMs;
    if (replenishTimer < 800) return; // mỗi 0.8s
    replenishTimer = 0;

    if (countDust < CFG.dust.max)   spawnDust();
    if (countLeaves < CFG.leaves.max && Math.random() < 0.4) spawnLeaf();
    if (countOrbs < CFG.orbs.max && Math.random() < 0.3)    spawnOrb();
  }

  // ---- Cultivation aura ----
  let auraTimer = 0;
  function updateAura(dtMs) {
    if (typeof AutoSystem === 'undefined' || !AutoSystem.cultivating) return;
    auraTimer += dtMs;
    if (auraTimer < 3000) return;
    auraTimer = 0;
    if (typeof Player === 'undefined' || typeof GameState === 'undefined') return;
    const sx = Player.x - GameState.camera.x;
    const sy = Player.y - GameState.camera.y;
    // Spawn vài orb nhỏ quanh player
    for (let i = 0; i < 3; i++) {
      const p = getSlot(); if (!p) break;
      const angle = Math.random() * 6.28;
      const r = 20 + Math.random() * 20;
      p.alive = true; p.type = 'burst';
      p.x = sx + Math.cos(angle) * r;
      p.y = sy + Math.sin(angle) * r;
      p.vx = Math.cos(angle) * 0.2;
      p.vy = -0.5 - Math.random() * 0.5;
      p.size = 1.5 + Math.random() * 2;
      p.alpha = 0.5;
      p.life = 1200;
      p.gravity = 0;
      p.color = '100,220,255';
    }
  }

  // ---- Single RAF loop ----
  function loop(ts) {
    const dtMs = Math.min(ts - lastTs, 50); // cap 50ms tránh spike
    lastTs = ts;

    if (CFG.enabled) {
      tick(dtMs);
      replenish(dtMs);
      updateAura(dtMs);
    }

    rafId = requestAnimationFrame(loop);
  }

  // ---- Hooks ----
  function hookCombat() {
    if (typeof Enemies === 'undefined' || !Enemies.kill) return;
    const _orig = Enemies.kill.bind(Enemies);
    Enemies.kill = function(enemy) {
      if (typeof GameState !== 'undefined') {
        spawnBurst(enemy.x - GameState.camera.x, enemy.y - GameState.camera.y, false);
      }
      return _orig(enemy);
    };
    console.log('[ParticleSystem] ✅ Enemies.kill hooked');
  }

  // ---- Setup ----
  function createCanvas() {
    const cont = document.getElementById('vfx-overlay') || document.body;
    canvas = document.createElement('canvas');
    canvas.id = 'vfx-particles';
    canvas.width = W; canvas.height = H;
    Object.assign(canvas.style, {
      position: 'absolute', top: '0', left: '0',
      width: '100%', height: '100%', pointerEvents: 'none'
    });
    ctx = canvas.getContext('2d');
    cont.appendChild(canvas);
    window.addEventListener('resize', () => {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W; canvas.height = H;
    }, { passive: true });
  }

  function init() {
    if (document.getElementById('vfx-particles')) return;
    createCanvas();
    // Seed initial particles
    for (let i = 0; i < CFG.dust.max; i++) spawnDust();
    for (let i = 0; i < CFG.leaves.max; i++) spawnLeaf();
    for (let i = 0; i < CFG.orbs.max; i++) spawnOrb();
    setTimeout(hookCombat, 600);
    rafId = requestAnimationFrame(loop);
    console.log('[ParticleSystem] ✅ v2 initialized');
  }

  function setEnabled(v) { CFG.enabled = v; }
  function burst(sx, sy, isCrit) { spawnBurst(sx, sy, isCrit); }
  function destroy() {
    if (rafId) cancelAnimationFrame(rafId);
    if (canvas) canvas.remove();
  }

  return { init, setEnabled, burst, destroy };
})();

(function autoInit() {
  const tryInit = () => {
    if (typeof GameState !== 'undefined' && document.getElementById('gameCanvas')) {
      ParticleSystem.init();
    } else {
      setTimeout(tryInit, 400);
    }
  };
  if (document.readyState === 'complete') tryInit();
  else window.addEventListener('load', tryInit);
})();
