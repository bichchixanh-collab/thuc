// ==================== MAIN GAME ENGINE ====================
const Game = {
  canvas: null,
  ctx: null,
  
  // Joystick
  joystick: {
    active: false,
    baseX: 0,
    baseY: 0,
    dx: 0,
    dy: 0,
    touchId: null
  },
  
  // Keyboard
  keys: {},
  
  // Touch tracking for tap-to-move
  touchStartTime: 0,
  touchStartPos: { x: 0, y: 0 },
  
  // Initialize game
  init() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    
    // Initialize systems
    Player.init();
    Inventory.init();
    Maps.generate();
    Enemies.spawnForMap(0);
    NPC.spawnForMap(0);
    UI.init();
    
    // Load save
    this.load();
    
    // Setup controls
    this.setupControls();
    
    // Start loading screen
    this.showLoading();
    
    console.log('🎮 Game initialized');
  },
  
  // Resize canvas
  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  },
  
  // Setup controls - SỬA LẠI
  setupControls() {
    const jZone = document.getElementById('joystickZone');
    const jBase = document.getElementById('joystickBase');
    const jKnob = document.getElementById('joystickKnob');
    
    // ===== JOYSTICK TOUCH =====
    const joystickStart = (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const touch = e.touches ? e.touches[0] : e;
      const rect = jBase.getBoundingClientRect();
      
      this.joystick.active = true;
      this.joystick.baseX = rect.left + rect.width / 2;
      this.joystick.baseY = rect.top + rect.height / 2;
      this.joystick.touchId = touch.identifier !== undefined ? touch.identifier : -1;
      
      // Cancel tap-to-move
      Player.tapMoveTarget = null;
      GameState.tapTarget = null;
      GameState.isTapMoving = false;
      
      console.log('🕹️ Joystick start');
    };
    
    const joystickMove = (e) => {
      if (!this.joystick.active) return;
      
      let touch;
      if (e.touches) {
        for (let i = 0; i < e.touches.length; i++) {
          if (e.touches[i].identifier === this.joystick.touchId) {
            touch = e.touches[i];
            break;
          }
        }
        if (!touch) return;
      } else {
        touch = e;
      }
      
      let dx = touch.clientX - this.joystick.baseX;
      let dy = touch.clientY - this.joystick.baseY;
      const maxDist = 45;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist > maxDist) {
        dx = dx / dist * maxDist;
        dy = dy / dist * maxDist;
      }
      
      this.joystick.dx = dx / maxDist;
      this.joystick.dy = dy / maxDist;
      
      jKnob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    };
    
    const joystickEnd = (e) => {
      if (e.changedTouches) {
        for (let i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === this.joystick.touchId) {
            this.joystick.active = false;
            break;
          }
        }
      } else {
        this.joystick.active = false;
      }
      
      if (!this.joystick.active) {
        this.joystick.dx = 0;
        this.joystick.dy = 0;
        jKnob.style.transform = 'translate(-50%, -50%)';
        console.log('🕹️ Joystick end');
      }
    };
    
    // Joystick events
    jZone.addEventListener('touchstart', joystickStart, { passive: false });
    jZone.addEventListener('mousedown', joystickStart);
    
    document.addEventListener('touchmove', joystickMove, { passive: true });
    document.addEventListener('mousemove', joystickMove);
    
    document.addEventListener('touchend', joystickEnd);
    document.addEventListener('touchcancel', joystickEnd);
    document.addEventListener('mouseup', joystickEnd);
    
    // ===== KEYBOARD =====
    document.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
      
      // Skill hotkeys
      if (e.key >= '1' && e.key <= '4') {
        Player.useSkill(parseInt(e.key) - 1);
      }
      if (e.key === ' ') {
        Player.useSkill(0);
        e.preventDefault();
      }
    });
    
    document.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });
    
    // ===== TAP TO MOVE (Canvas) =====
    this.canvas.addEventListener('touchstart', (e) => {
      // Ignore if touch is on UI elements
      if (e.target !== this.canvas) return;
      
      const touch = e.touches[0];
      this.touchStartTime = Date.now();
      this.touchStartPos = { x: touch.clientX, y: touch.clientY };
    }, { passive: true });
    
    this.canvas.addEventListener('touchend', (e) => {
      if (e.target !== this.canvas) return;
      if (this.joystick.active) return; // Joystick đang dùng
      
      const touch = e.changedTouches[0];
      const touchDuration = Date.now() - this.touchStartTime;
      const touchDistance = Utils.dist(
        this.touchStartPos.x, this.touchStartPos.y,
        touch.clientX, touch.clientY
      );
      
      // Chỉ tính là tap nếu nhanh và không di chuyển nhiều
      if (touchDuration < 400 && touchDistance < 40) {
        this.handleTap(touch.clientX, touch.clientY);
      }
    }, { passive: true });
    
    // Mouse click (PC)
    this.canvas.addEventListener('click', (e) => {
      if (e.target !== this.canvas) return;
      this.handleTap(e.clientX, e.clientY);
    });
    
    console.log('🎮 Controls setup complete');
  },
  
  // Handle tap/click
  handleTap(screenX, screenY) {
    const worldX = screenX + GameState.camera.x;
    const worldY = screenY + GameState.camera.y;
    
    console.log('👆 Tap at world:', worldX.toFixed(0), worldY.toFixed(0));
    
    // Check NPC first
    const npc = NPC.getAt(worldX, worldY, 60);
    if (npc) {
      NPC.interact(npc);
      return;
    }
    
    // Check enemy
    const enemy = Enemies.getAt(worldX, worldY);
    if (enemy) {
      Player.target = enemy;
      UI.updateTargetInfo();
      // Move towards enemy
      Player.setTapTarget(enemy.x, enemy.y);
      return;
    }
    
    // Clear target and move to location
    Player.target = null;
    UI.hideTargetInfo();
    Player.setTapTarget(worldX, worldY);
  },
  
  // Get input from joystick/keyboard
  getInput() {
    let mx = 0, my = 0;
    
    // Joystick input
    if (this.joystick.active) {
      mx = this.joystick.dx;
      my = this.joystick.dy;
    }
    
    // Keyboard input (có thể override hoặc cộng thêm)
    if (this.keys['w'] || this.keys['arrowup']) my = -1;
    if (this.keys['s'] || this.keys['arrowdown']) my = 1;
    if (this.keys['a'] || this.keys['arrowleft']) mx = -1;
    if (this.keys['d'] || this.keys['arrowright']) mx = 1;
    
    return { x: mx, y: my };
  },
  
  // Main update
  update(dt) {
    if (!GameState.running) return;
    
    // Get manual input
    let input = this.getInput();
    
    // Auto system có thể override input
    const autoInput = AutoSystem.update(dt);
    if (AutoSystem.farming || AutoSystem.cultivating) {
      input = autoInput;
    }
    
    // Update player
    Player.update(dt, input.x, input.y);
    
    // Update other systems
    Enemies.update(dt);
    NPC.update(dt);
    
    // Update particles
    this.updateParticles(dt);
    
    // Update tap indicator
    if (GameState.tapIndicator) {
      GameState.tapIndicator.life -= dt;
      if (GameState.tapIndicator.life <= 0) {
        GameState.tapIndicator = null;
      }
    }
    
    // Update camera
    GameState.camera.x = Player.x - this.canvas.width / 2;
    GameState.camera.y = Player.y - this.canvas.height / 2;
    
    // Update UI periodically
    if (Math.floor(GameState.time / 100) % 3 === 0) {
      UI.updateStats();
      UI.updateSkillUI();
    }
  },
  
  // Update particles
  updateParticles(dt) {
    for (let i = GameState.particles.length - 1; i >= 0; i--) {
      const p = GameState.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05;
      p.life -= dt;
      if (p.life <= 0) {
        GameState.particles.splice(i, 1);
      }
    }
    
    for (let i = GameState.dmgNumbers.length - 1; i >= 0; i--) {
      const d = GameState.dmgNumbers[i];
      d.y -= 1;
      d.life -= dt;
      if (d.life <= 0) {
        GameState.dmgNumbers.splice(i, 1);
      }
    }
  },
  
  // Spawn damage number
  spawnDamageNumber(x, y, text, color) {
    GameState.dmgNumbers.push({
      x: x - GameState.camera.x + (Math.random() - 0.5) * 20,
      y: y - GameState.camera.y,
      text: text.toString(),
      color: color,
      life: 1000,
      size: text.toString().length > 3 ? 16 : 14
    });
  },
  
  // Spawn skill effect
  spawnSkillEffect(fx, fy, tx, ty, color, type) {
    const count = type === 'ultimate' ? 15 : (type === 'aoe' ? 10 : 6);
    
    for (let i = 0; i < count; i++) {
      const t = i / count;
      GameState.particles.push({
        x: fx + (tx - fx) * t + (Math.random() - 0.5) * 15,
        y: fy + (ty - fy) * t + (Math.random() - 0.5) * 15,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3 - 1,
        life: 500,
        color: color,
        size: 2 + Math.random() * 4
      });
    }
  },
  
  // ==================== RENDER ====================
  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    ctx.save();
    ctx.translate(-GameState.camera.x, -GameState.camera.y);
    
    this.renderTiles();
    this.renderTapIndicator();
    this.renderObjects();
    this.renderNPCs();
    this.renderEnemies();
    this.renderPet();
    this.renderPlayer();
    this.renderParticles();
    
    ctx.restore();
    
    this.renderDamageNumbers();
    
    if (GameState.minimapVisible) {
      this.renderMinimap();
    }
  },
  
  // Render tap indicator
  renderTapIndicator() {
    if (!GameState.tapIndicator) return;
    
    const ctx = this.ctx;
    const ind = GameState.tapIndicator;
    const alpha = Math.min(1, ind.life / 300);
    const scale = 1 + (1 - alpha) * 0.3;
    
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(ind.x, ind.y);
    ctx.scale(scale, scale);
    
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  },
  
  // Render tiles
  renderTiles() {
    const ctx = this.ctx;
    const startX = Math.max(0, Math.floor(GameState.camera.x / CONFIG.TILE_SIZE));
    const startY = Math.max(0, Math.floor(GameState.camera.y / CONFIG.TILE_SIZE));
    const endX = Math.min(CONFIG.WORLD_WIDTH, Math.ceil((GameState.camera.x + this.canvas.width) / CONFIG.TILE_SIZE) + 1);
    const endY = Math.min(CONFIG.WORLD_HEIGHT, Math.ceil((GameState.camera.y + this.canvas.height) / CONFIG.TILE_SIZE) + 1);
    
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const tile = Maps.tiles[y]?.[x] || 0;
        ctx.fillStyle = Maps.getTileColor(tile, x, y);
        ctx.fillRect(x * CONFIG.TILE_SIZE, y * CONFIG.TILE_SIZE, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
      }
    }
  },
  
  // Render objects
  renderObjects() {
    const ctx = this.ctx;
    
    for (const obj of Maps.objects) {
      if (obj.x < GameState.camera.x - 50 || obj.x > GameState.camera.x + this.canvas.width + 50) continue;
      if (obj.y < GameState.camera.y - 50 || obj.y > GameState.camera.y + this.canvas.height + 50) continue;
      
      switch (obj.type) {
        case 'tree':
          ctx.fillStyle = COLORS.treeTrunk;
          ctx.fillRect(obj.x - 4, obj.y - 5, 8, 15);
          ctx.fillStyle = COLORS.tree;
          ctx.beginPath();
          ctx.arc(obj.x, obj.y - 15, 14, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = COLORS.treeLight;
          ctx.beginPath();
          ctx.arc(obj.x - 5, obj.y - 18, 8, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'rock':
          ctx.fillStyle = COLORS.stone;
          ctx.fillRect(obj.x - 8, obj.y - 5, 16, 10);
          ctx.fillStyle = COLORS.stoneDark;
          ctx.fillRect(obj.x - 6, obj.y - 3, 5, 4);
          break;
        case 'bush':
          ctx.fillStyle = COLORS.grass2;
          ctx.beginPath();
          ctx.arc(obj.x, obj.y - 3, 8, 0, Math.PI * 2);
          ctx.fill();
          break;
        default:
          ctx.fillStyle = '#666';
          ctx.fillRect(obj.x - 6, obj.y - 6, 12, 12);
      }
    }
  },
  
  // Render NPCs
  renderNPCs() {
    const ctx = this.ctx;
    
    for (const npc of NPC.list) {
      const bob = Math.sin(GameState.time / 400) * 2;
      
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(npc.x, npc.y + 15, 14, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      
      const sprite = Sprites.getNPCSprite(npc.sprite.replace('npc', '').toLowerCase());
      ctx.save();
      ctx.translate(npc.x - 16, npc.y - 28 + bob);
      Sprites.drawPixelArt(ctx, sprite, 2, 0, 0);
      ctx.restore();
      
      ctx.fillStyle = '#80deea';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(npc.name, npc.x, npc.y - 35 + bob);
      
      if (npc.canInteract) {
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 14px monospace';
        ctx.fillText('💬', npc.x, npc.y - 45 + bob);
      }
    }
  },
  
  // Render enemies
  renderEnemies() {
    const ctx = this.ctx;
    
    for (const enemy of Enemies.list) {
      if (!enemy.alive) continue;
      if (enemy.x < GameState.camera.x - 50 || enemy.x > GameState.camera.x + this.canvas.width + 50) continue;
      if (enemy.y < GameState.camera.y - 50 || enemy.y > GameState.camera.y + this.canvas.height + 50) continue;
      
      const bob = Math.sin(GameState.time / 300 + enemy.x) * 2;
      const s = enemy.size;
      
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(enemy.x, enemy.y + s, s * 0.7, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      
      const sprite = Sprites.getEnemySprite(enemy.sprite);
      if (sprite && enemy.hitFlash <= 0) {
        ctx.save();
        ctx.translate(enemy.x - s, enemy.y - s + bob);
        for (let py = 0; py < sprite.length; py++) {
          for (let px = 0; px < sprite[py].length; px++) {
            let color = sprite[py][px];
            if (color) {
              if (enemy.color && !['#fff','#000','#ffff00','#ff0000','#1a1a1a'].includes(color)) {
                color = enemy.color;
              }
              ctx.fillStyle = color;
              ctx.fillRect(px * 2, py * 2, 2, 2);
            }
          }
        }
        ctx.restore();
      } else {
        ctx.fillStyle = enemy.hitFlash > 0 ? '#ffffff' : (enemy.color || '#888');
        ctx.fillRect(enemy.x - s / 2, enemy.y - s + bob, s, s);
        ctx.fillStyle = enemy.boss ? '#ffd700' : '#ff0000';
        ctx.fillRect(enemy.x - s / 4, enemy.y - s * 0.7 + bob, 3, 3);
        ctx.fillRect(enemy.x + s / 4 - 3, enemy.y - s * 0.7 + bob, 3, 3);
      }
      
      if (enemy.boss) {
        ctx.strokeStyle = `rgba(255,215,0,${0.4 + Math.sin(GameState.time / 200) * 0.2})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y - s / 2 + bob, s + 8, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      const barY = enemy.y - s - 15 + bob;
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(enemy.x - 22, barY, 44, 8);
      ctx.fillStyle = enemy.boss ? '#ffd700' : '#ff4444';
      ctx.fillRect(enemy.x - 21, barY + 1, (enemy.hp / enemy.maxHp) * 42, 6);
      
      ctx.fillStyle = enemy.boss ? '#ffd700' : '#fff';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`Lv${enemy.level} ${enemy.name}`, enemy.x, barY - 4);
      
      if (Player.target === enemy) {
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y - s / 2 + bob, s + 12, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  },
  
  // Render pet
  renderPet() {
    if (!Player.activePet || !Player.alive) return;
    
    const ctx = this.ctx;
    const pet = Player.pet;
    const petData = PETS[Player.activePet];
    
    const isMoving = Utils.dist(pet.x, pet.y, pet.targetX, pet.targetY) > 3;
    const bob = Player.activePet === 'bird' ? Math.sin(GameState.time / 150) * 4 : Math.sin(GameState.time / 300) * 1.5;
    
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    const shadowSize = Player.activePet === 'bird' ? 6 : 8;
    ctx.beginPath();
    ctx.ellipse(pet.x, pet.y + 8, shadowSize, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    const sprite = Sprites.getPetSprite(Player.activePet, isMoving || pet.frame === 1);
    
    ctx.save();
    const flipX = Player.dir === 'right';
    if (flipX) {
      ctx.translate(pet.x + 8, pet.y - 8 + bob);
      ctx.scale(-1, 1);
    } else {
      ctx.translate(pet.x - 8, pet.y - 8 + bob);
    }
    Sprites.drawPixelArt(ctx, sprite, 2, 0, 0);
    ctx.restore();
    
    if (Utils.chance(0.01)) {
      GameState.particles.push({
        x: pet.x + (Math.random() - 0.5) * 12,
        y: pet.y + bob + (Math.random() - 0.5) * 12,
        vx: (Math.random() - 0.5) * 1,
        vy: -1 - Math.random(),
        life: 400,
        color: petData.color,
        size: 2 + Math.random() * 2
      });
    }
  },
  
  // Render player
  renderPlayer() {
    if (!Player.alive) return;
    
    const ctx = this.ctx;
    const isMoving = Math.abs(Player.vx) > 0.1 || Math.abs(Player.vy) > 0.1;
    const bob = isMoving ? Math.sin(GameState.time / 100) * 3 : 0;
    
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(Player.x, Player.y + 15, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    let sprite = Sprites.player.down;
    if (Player.frame % 2 === 1 && Sprites.player.walk1) {
      sprite = Sprites.player.walk1;
    } else if (Player.frame % 4 === 2 && Sprites.player.walk2) {
      sprite = Sprites.player.walk2;
    }
    
    ctx.save();
    if (Player.dir === 'left') {
      ctx.translate(Player.x + 16, Player.y - 28 + bob);
      ctx.scale(-1, 1);
    } else {
      ctx.translate(Player.x - 16, Player.y - 28 + bob);
    }
    Sprites.drawPixelArt(ctx, sprite, 2, 0, 0);
    ctx.restore();
    
    if (Player.invincible && Math.floor(GameState.time / 100) % 2 === 0) {
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = '#fff';
      ctx.fillRect(Player.x - 16, Player.y - 28 + bob, 32, 32);
      ctx.globalAlpha = 1;
    }
    
    if (AutoSystem.cultivating) {
      ctx.strokeStyle = `rgba(135,206,235,${0.4 + Math.sin(GameState.time / 300) * 0.3})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(Player.x, Player.y - 5 + bob, 25 + Math.sin(GameState.time / 500) * 5, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Kiếm Tiên', Player.x, Player.y - 38 + bob);
  },
  
  // Render particles
  renderParticles() {
    const ctx = this.ctx;
    
    for (const p of GameState.particles) {
      const alpha = p.life / 600;
      ctx.globalAlpha = Math.min(1, alpha);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;
  },
  
  // Render damage numbers
  renderDamageNumbers() {
    const ctx = this.ctx;
    
    for (const d of GameState.dmgNumbers) {
      const alpha = d.life / 1000;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = d.color;
      ctx.font = `bold ${d.size}px monospace`;
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      ctx.strokeText(d.text, d.x, d.y);
      ctx.fillText(d.text, d.x, d.y);
    }
    ctx.globalAlpha = 1;
  },
  
  // Render minimap
  renderMinimap() {
    const mc = document.getElementById('minimapCanvas');
    if (!mc) return;
    
    const mctx = mc.getContext('2d');
    const mw = mc.width, mh = mc.height;
    const scale = mw / (CONFIG.WORLD_WIDTH * CONFIG.TILE_SIZE);
    
    mctx.clearRect(0, 0, mw, mh);
    
    const map = Maps.getCurrent();
    mctx.fillStyle = map.bgColor;
    mctx.fillRect(0, 0, mw, mh);
    
    mctx.fillStyle = '#185';
    for (const obj of Maps.objects) {
      if (obj.type === 'tree') {
        mctx.fillRect(obj.x * scale - 1, obj.y * scale - 1, 2, 2);
      }
    }
    
    mctx.fillStyle = '#80deea';
    for (const npc of NPC.list) {
      mctx.fillRect(npc.x * scale - 2, npc.y * scale - 2, 4, 4);
    }
    
    for (const enemy of Enemies.list) {
      if (!enemy.alive) continue;
      mctx.fillStyle = enemy.boss ? '#ffd700' : '#ff4444';
      const size = enemy.boss ? 4 : 2;
      mctx.fillRect(enemy.x * scale - size / 2, enemy.y * scale - size / 2, size, size);
    }
    
    if (GameState.tapTarget) {
      mctx.fillStyle = '#ffd700';
      mctx.beginPath();
      mctx.arc(GameState.tapTarget.x * scale, GameState.tapTarget.y * scale, 3, 0, Math.PI * 2);
      mctx.fill();
    }
    
    if (Player.activePet) {
      const petData = PETS[Player.activePet];
      mctx.fillStyle = petData.color;
      mctx.fillRect(Player.pet.x * scale - 1, Player.pet.y * scale - 1, 3, 3);
    }
    
    mctx.fillStyle = '#00ff00';
    mctx.fillRect(Player.x * scale - 2, Player.y * scale - 2, 5, 5);
    
    mctx.strokeStyle = 'rgba(255,255,255,0.3)';
    mctx.strokeRect(
      GameState.camera.x * scale,
      GameState.camera.y * scale,
      this.canvas.width * scale,
      this.canvas.height * scale
    );
  },
  
  // Game loop
  loop(timestamp) {
    const dt = Math.min(50, timestamp - GameState.lastTime);
    GameState.lastTime = timestamp;
    GameState.time += dt;
    
    this.update(dt);
    this.render();
    
    requestAnimationFrame((t) => this.loop(t));
  },
  
  // Start game
  start() {
    GameState.running = true;
    GameState.lastTime = performance.now();
    
    UI.addLog('🌟 Chào mừng đến Tu Tiên thế giới!', 'system');
    UI.addLog('🎮 Dùng joystick/WASD để di chuyển', 'system');
    UI.addLog('👆 Chạm màn hình để di chuyển', 'system');
    
    if (Player.activePet) {
      const pet = PETS[Player.activePet];
      UI.addLog(`🐾 ${pet.name} đang theo bạn!`, 'system');
    }
    
    requestAnimationFrame((t) => this.loop(t));
    
    setInterval(() => this.save(), CONFIG.AUTO_SAVE_INTERVAL);
    
    console.log('🎮 Game started!');
  },
  
  // Loading screen
  showLoading() {
    let progress = 0;
    const loadingFill = document.getElementById('loadingBarFill');
    const loadingText = document.getElementById('loadingText');
    const tapStart = document.getElementById('tapToStart');
    
    const messages = ['Đang tải...', 'Khởi tạo...', 'Chuẩn bị...', 'Sắp xong...', 'Hoàn tất!'];
    
    const interval = setInterval(() => {
      progress += Utils.random(10, 20);
      if (progress > 100) progress = 100;
      
      loadingFill.style.width = progress + '%';
      loadingText.textContent = messages[Math.min(4, Math.floor(progress / 20))];
      
      if (progress >= 100) {
        clearInterval(interval);
        tapStart.style.display = 'block';
      }
    }, 150);
    
    document.getElementById('loadingScreen').onclick = () => {
      if (progress < 100) return;
      document.getElementById('loadingScreen').classList.add('hide');
      this.start();
    };
  },
  
  // Save game
  save() {
    try {
      const data = {
        player: Player.getSaveData(),
        inventory: Inventory.getSaveData(),
        quests: Quests.getSaveData(),
        maps: Maps.getSaveData(),
        auto: AutoSystem.getSaveData(),
        timestamp: Date.now()
      };
      
      localStorage.setItem('tuxien_save', JSON.stringify(data));
      console.log('💾 Game saved');
    } catch (e) {
      console.error('Save error:', e);
    }
  },
  
  // Load game
  load() {
    try {
      const raw = localStorage.getItem('tuxien_save');
      if (!raw) return false;
      
      const data = JSON.parse(raw);
      
      if (data.player) Player.loadSaveData(data.player);
      if (data.inventory) Inventory.loadSaveData(data.inventory);
      if (data.quests) Quests.loadSaveData(data.quests);
      if (data.maps) {
        Maps.loadSaveData(data.maps);
        Maps.generate();
        Enemies.spawnForMap(Maps.currentIndex);
        NPC.spawnForMap(Maps.currentIndex);
      }
      if (data.auto) AutoSystem.loadSaveData(data.auto);
      
      document.getElementById('mapName').textContent = `📍 ${Maps.getCurrent().name}`;
      UI.updateAll();
      
      console.log('📂 Game loaded');
      return true;
    } catch (e) {
      console.error('Load error:', e);
      return false;
    }
  }
};

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  Game.init();
});

console.log('🎮 Game Engine loaded');