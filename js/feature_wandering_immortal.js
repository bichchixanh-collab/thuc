// ===== FILE: feature_wandering_immortal.js =====
// ==================== DU TIÊN HỆ THỐNG ====================
// Mỗi ngày 1-2 Du Tiên xuất hiện ngẫu nhiên trên map trong 30 phút thực.
// 6 loại Du Tiên: Kiếm Tiên, Văn Tiên, Cuồng Tiên, Dược Tiên, Ma Tiên, Ẩn Tiên
// FOMO trail: để lại dấu vết sau khi rời đi
// 3 loại thử thách: Thời gian, Câu đố, Sinh tử

const WanderingImmortal = {

  // ==================== CONFIG ====================
  config: {
    MAX_PER_DAY: 2,
    DURATION_MS: 30 * 60 * 1000,
    HINT_DURATION_MS: 5 * 60 * 1000,
    TRAIL_DURATION_MS: 10 * 60 * 1000,
    INTERACT_RANGE: 90,
    SPAWN_CHECK_INTERVAL: 60000,
    HIDDEN_SEARCH_RADIUS: 120,
  },

  // ==================== STATE ====================
  state: {
    todayCount: 0,
    lastDayReset: 0,
    active: [],
    trails: [],
    history: [],
    challengeActive: null,
    spawnTimer: 0,
    lastSpawnCheck: 0,
  },

  // ==================== DU TIÊN TYPES ====================
  immortalTypes: {
    sword: {
      key: 'sword',
      name: '⚔️ Kiếm Tiên',
      title: 'Truyền Nhân Kiếm Đạo',
      color: '#87ceeb',
      glowColor: 'rgba(135,206,235,0.4)',
      hint: '⚔️ Có linh khí kiếm đạo thoang thoảng từ hướng đó...',
      dialog: 'Ngươi có duyên gặp ta — Kiếm Tiên lãng du. Ta có thể dạy ngươi một chiêu kiếm pháp bí truyền.',
      condition: null,
      service: 'teach_skill',
      rewards: [
        { type: 'passive', id: 'sword_intent', name: 'Kiếm Tâm', desc: '+8% sát thương kiếm, +5% crit rate', stats: { critRate: 0.05, atkMul: 0.08 } },
        { type: 'passive', id: 'sword_aura', name: 'Kiếm Khí Thường Tụ', desc: 'Tự động gây 3% ATK/s sát thương xung quanh', stats: { auraAtk: 0.03 } },
        { type: 'passive', id: 'void_cut', name: 'Hư Không Nhất Kiếm', desc: '+15% sát thương khi HP > 80%', stats: { fullHpBonus: 0.15 } },
      ]
    },
    scholar: {
      key: 'scholar',
      name: '📖 Văn Tiên',
      title: 'Uyên Bác Tiên Nhân',
      color: '#ffd700',
      glowColor: 'rgba(255,215,0,0.4)',
      hint: '📖 Mùi mực cổ thư bay trong gió, dường như có cao nhân tu luyện gần đây...',
      dialog: 'Đạo hữu, ta Văn Tiên chu du thiên hạ. Trong tay ta có cuộn Tu Vi cô đọng — phí luyện đan nên bán rẻ cho hữu duyên.',
      condition: null,
      service: 'sell_rare',
      shopItems: [
        { name: 'Tu Vi Tàng Thư', desc: '+500 Tu Vi ngay lập tức', price: 800, effect: { realmExp: 500 } },
        { name: 'Thiên Địa Linh Tụ', desc: '+1000 EXP cô đọng', price: 600, effect: { exp: 1000 } },
        { name: 'Đại Thành Đan', desc: '+200 max HP vĩnh viễn', price: 1200, effect: { permHp: 200 } },
        { name: 'Nguyên Thần Đan', desc: '+80 max MP vĩnh viễn', price: 900, effect: { permMp: 80 } },
      ]
    },
    mad: {
      key: 'mad',
      name: '🎲 Cuồng Tiên',
      title: 'Tiên Nhân Khó Đoán',
      color: '#ff69b4',
      glowColor: 'rgba(255,105,180,0.5)',
      hint: '🎲 Tiếng cười điên dại vang vọng từ xa... ai đó đang đánh cược với trời đất?',
      dialog: 'Haha! Đạo hữu có dám thách thức vận mệnh không?! Thắng ta — thưởng gấp 3! Thua ta — mất thứ ta chọn!',
      condition: null,
      service: 'gamble',
      gambleOptions: [
        { bet: 'gold', amount: 200, rewardMul: 3, label: '200 💰 → thắng 600 💰' },
        { bet: 'gold', amount: 500, rewardMul: 3, label: '500 💰 → thắng 1500 💰' },
        { bet: 'item', slot: 'weapon', rewardType: 'rare_weapon', label: 'Vũ khí đang trang bị → vũ khí hiếm hơn' },
      ],
      winChance: 0.45,
    },
    herbalist: {
      key: 'herbalist',
      name: '🌿 Dược Tiên',
      title: 'Luyện Đan Đại Sư',
      color: '#4caf50',
      glowColor: 'rgba(76,175,80,0.4)',
      hint: '🌿 Hương thơm của dược liệu quý hiếm lan tỏa... có cao nhân luyện đan ở gần đây!',
      dialog: 'Ta vừa luyện xong mẻ đan đặc biệt. Ngươi có muốn mua không? Chỉ bán cho người hữu duyên!',
      condition: null,
      service: 'sell_rare',
      shopItems: [
        { name: 'Hồi Thiên Đại Đan', desc: 'Hồi phục 100% HP + 50% MP', price: 400, effect: { hp: 99999, mp: 99999 } },
        { name: 'Phá Cảnh Thần Đan', desc: '+300 Tu Vi, có thể đột phá ngay', price: 1500, effect: { realmExp: 300 } },
        { name: 'Linh Căn Khai Mở Đan', desc: '+10% EXP vĩnh viễn', price: 2000, effect: { permExpBonus: 0.1 } },
        { name: 'Vạn Độc Bất Xâm Đan', desc: '+20 DEF vĩnh viễn', price: 1000, effect: { permDef: 20 } },
      ]
    },
    dark: {
      key: 'dark',
      name: '👻 Ma Tiên',
      title: 'Tà Đạo Tiên Nhân',
      color: '#9b59b6',
      glowColor: 'rgba(155,89,182,0.5)',
      hint: '👻 Âm khí nặng nề... có vị tu sĩ tà đạo ẩn náu nơi này. Tiếp cận cẩn thận.',
      dialog: 'Tss... ngươi cũng tìm đến ta sao? Ta Ma Tiên có thể dạy ngươi thuật pháp ngoài Chính Đạo. Mạnh hơn... nhưng có cái giá của nó.',
      condition: (p) => p.realm >= 2,
      conditionText: 'Yêu cầu: Kim Đan Kỳ trở lên',
      service: 'teach_skill',
      karmaWarning: true,
      rewards: [
        { type: 'passive', id: 'dark_seal', name: 'Hắc Ám Ấn Ký', desc: '+20% sát thương, nhưng +Nghiệp Chướng mỗi kill', stats: { darkAtkBonus: 0.2 } },
        { type: 'passive', id: 'soul_devour', name: 'Thực Hồn Thuật', desc: 'Hút 5% sát thương thành HP', stats: { lifesteal: 0.05 } },
        { type: 'passive', id: 'forbidden_art', name: 'Cấm Thuật Lôi Điện', desc: 'Lôi Điện Thuật: +50% dmg, gây AoE rộng gấp đôi', stats: { forbiddenLightning: true } },
      ]
    },
    hidden: {
      key: 'hidden',
      name: '🌫️ Ẩn Tiên',
      title: '???',
      color: '#ecf0f1',
      glowColor: 'rgba(255,255,255,0.3)',
      hint: '🌫️ Mặt đất nơi đây có dấu hiệu kỳ lạ... như thể có ai đó vừa đứng đây không lâu.',
      dialog: 'Ngươi... thực sự nhìn thấy ta được sao? Thú vị. Người có căn cơ như vậy mới xứng nhận điều này.',
      condition: null,
      service: 'teach_skill',
      isHidden: true,
      rewards: [
        { type: 'passive', id: 'void_walk', name: 'Hư Không Bộ', desc: '+15% tốc độ di chuyển vĩnh viễn', stats: { speedBonus: 0.15 } },
        { type: 'passive', id: 'heaven_eye', name: 'Thiên Nhãn', desc: 'Thấy HP% của tất cả kẻ địch, +5% crit', stats: { heavenEye: true, critRate: 0.05 } },
        { type: 'passive', id: 'fate_insight', name: 'Túc Mệnh Thần Thông', desc: '+25% EXP từ tất cả nguồn', stats: { expBonus: 0.25 } },
      ]
    }
  },

  // ==================== QUIZ DATA ====================
  quizData: [
    { q: 'Cảnh giới nào sau Trúc Cơ Kỳ?', opts: ['Kim Đan Kỳ', 'Nguyên Anh Kỳ', 'Hóa Thần Kỳ', 'Luyện Hư Kỳ'], ans: 0 },
    { q: 'Linh Khuyển cho bonus gì?', opts: ['+ATK', '+DEF', '+Speed', '+HP'], ans: 0 },
    { q: 'Kỹ năng nào tốn 35 MP?', opts: ['Kiếm Phong Trảm', 'Lôi Điện Thuật', 'Vạn Kiếm Quy Tông', 'Cơ Bản Kiếm Pháp'], ans: 2 },
    { q: 'Độ Kiếp Kỳ có bao nhiêu tầng?', opts: ['9 tầng', '3 tầng', '6 tầng', '1 tầng'], ans: 1 },
    { q: 'Loại quái nào drop Vảy Rồng?', opts: ['Sói Xám', 'Heo Rừng', 'Tiên Thú', 'U Linh'], ans: 2 },
    { q: 'Thiên Châu thuộc độ hiếm nào?', opts: ['Common', 'Rare', 'Epic', 'Legendary'], ans: 3 },
    { q: 'Tu luyện tự động sinh ra gì?', opts: ['EXP + Gold', 'Tu Vi + MP', 'HP + ATK', 'Items'], ans: 1 },
    { q: 'Thiên Tiên Kiếm tăng bao nhiêu ATK?', opts: ['80', '100', '120', '150'], ans: 2 },
  ],

  // ==================== PASSIVES STORAGE ====================
  unlockedPassives: [],

  // ==================== INIT ====================
  init() {
    this._loadData();
    this._injectStyles();
    this._injectUI();
    this._checkDayReset();
    console.log('🧙 WanderingImmortal init, passives:', this.unlockedPassives.length);
  },

  // ==================== DAY RESET ====================
  _checkDayReset() {
    const now = Date.now();
    const today = new Date().toDateString();
    const lastDay = this.state.lastDayReset ? new Date(this.state.lastDayReset).toDateString() : '';
    if (today !== lastDay) {
      this.state.todayCount = 0;
      this.state.lastDayReset = now;
      this._saveData();
    }
  },

  // ==================== SPAWN LOGIC ====================
  trySpawn() {
    this._checkDayReset();
    if (this.state.todayCount >= this.config.MAX_PER_DAY) return;
    if (this.state.active.length > 0) return;

    if (!Utils.chance(0.30)) return;

    const keys = Object.keys(this.immortalTypes);
    const typeKey = keys[Utils.randomInt(0, keys.length - 1)];
    const type = this.immortalTypes[typeKey];

    if (type.condition && !type.condition(Player)) return;

    const worldW = CONFIG.WORLD_WIDTH * CONFIG.TILE_SIZE;
    const worldH = CONFIG.WORLD_HEIGHT * CONFIG.TILE_SIZE;

    let x, y;
    if (type.isHidden) {
      x = 150 + Math.random() * (worldW - 300);
      y = 150 + Math.random() * (worldH - 300);
    } else {
      let tries = 0;
      do {
        x = 150 + Math.random() * (worldW - 300);
        y = 150 + Math.random() * (worldH - 300);
        tries++;
      } while (Utils.dist(x, y, Player.x, Player.y) < 400 && tries < 20);
    }

    const immortal = {
      id: Date.now(),
      typeKey,
      type,
      x, y,
      spawnTime: Date.now(),
      expireTime: Date.now() + this.config.DURATION_MS,
      hintShown: false,
      visible: !type.isHidden,
      glowTile: type.isHidden ? { x, y } : null,
      canInteract: false,
      bobOffset: Math.random() * Math.PI * 2,
    };

    this.state.active.push(immortal);
    this.state.todayCount++;

    if (!type.isHidden) {
      UI.addLog(`${type.hint}`, 'system');
      setTimeout(() => {
        if (this.state.active.find(i => i.id === immortal.id)) {
          UI.addLog(`✨ ${type.name} đã xuất hiện trên bản đồ! Còn 30 phút.`, 'realm');
        }
      }, this.config.HINT_DURATION_MS);
    } else {
      UI.addLog(type.hint, 'system');
    }

    this._saveData();
  },

  // ==================== UPDATE ====================
  update(dt) {
    const now = Date.now();

    this.state.lastSpawnCheck += dt;
    if (this.state.lastSpawnCheck >= this.config.SPAWN_CHECK_INTERVAL) {
      this.state.lastSpawnCheck = 0;
      this.trySpawn();
    }

    for (let i = this.state.active.length - 1; i >= 0; i--) {
      const immortal = this.state.active[i];

      if (now >= immortal.expireTime) {
        this._expire(immortal);
        this.state.active.splice(i, 1);
        continue;
      }

      const dist = Utils.dist(Player.x, Player.y, immortal.x, immortal.y);
      immortal.canInteract = dist <= this.config.INTERACT_RANGE && immortal.visible;

      if (immortal.type.isHidden && immortal.glowTile) {
        const tileDist = Utils.dist(Player.x, Player.y, immortal.glowTile.x, immortal.glowTile.y);
        if (tileDist < this.config.HIDDEN_SEARCH_RADIUS) {
          immortal.visible = true;
          immortal.canInteract = Utils.dist(Player.x, Player.y, immortal.x, immortal.y) <= this.config.INTERACT_RANGE;
          if (!immortal.foundLogged) {
            immortal.foundLogged = true;
            UI.addLog('🌫️ Ngươi đã phát hiện ra Ẩn Tiên!', 'realm');
          }
        }
      }

      if (this.state.challengeActive && this.state.challengeActive.immortalId === immortal.id) {
        this._updateChallenge(dt);
      }
    }

    for (let i = this.state.trails.length - 1; i >= 0; i--) {
      if (now >= this.state.trails[i].expireTime) {
        this.state.trails.splice(i, 1);
      }
    }

    this._updateHUDIndicator();
  },

  // ==================== EXPIRE ====================
  _expire(immortal) {
    this.state.trails.push({
      x: immortal.x,
      y: immortal.y,
      typeKey: immortal.typeKey,
      type: immortal.type,
      expireTime: Date.now() + this.config.TRAIL_DURATION_MS,
      spawnTime: immortal.spawnTime,
    });

    UI.addLog(`💨 ${immortal.type.name} đã rời đi... Dấu chân còn lại 10 phút.`, 'system');
    this._saveData();
  },

  // ==================== RENDER ====================
  render(ctx) {
    const now = Date.now();

    for (const trail of this.state.trails) {
      const remaining = trail.expireTime - now;
      const alpha = Math.min(0.5, remaining / this.config.TRAIL_DURATION_MS * 0.5);
      const pulse = 0.3 + Math.sin(now / 600) * 0.1;

      ctx.save();
      ctx.globalAlpha = alpha + pulse * 0.2;

      const grad = ctx.createRadialGradient(trail.x, trail.y, 0, trail.x, trail.y, 30);
      grad.addColorStop(0, trail.type.color);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(trail.x, trail.y, 30, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = alpha;
      ctx.fillStyle = trail.type.color;
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('👣 ' + trail.type.name, trail.x, trail.y - 35);
      const minLeft = Math.ceil(remaining / 60000);
      ctx.font = '9px monospace';
      ctx.fillStyle = '#aaa';
      ctx.fillText(`Còn ${minLeft} phút`, trail.x, trail.y - 22);

      ctx.restore();
    }

    for (const immortal of this.state.active) {
      if (!immortal.visible) {
        if (immortal.glowTile) {
          this._renderGlowTile(ctx, immortal.glowTile.x, immortal.glowTile.y, now);
        }
        continue;
      }

      const remaining = immortal.expireTime - now;
      const urgency = remaining < 5 * 60000;
      const bob = Math.sin(now / 400 + immortal.bobOffset) * 5;

      ctx.save();

      const glowSize = 45 + Math.sin(now / 500) * 8;
      const grad = ctx.createRadialGradient(immortal.x, immortal.y, 0, immortal.x, immortal.y, glowSize);
      grad.addColorStop(0, immortal.type.glowColor);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(immortal.x, immortal.y, glowSize, 0, Math.PI * 2);
      ctx.fill();

      this._renderImmortalSprite(ctx, immortal, bob, now);

      ctx.globalAlpha = 1;
      ctx.fillStyle = urgency ? '#ff6b6b' : immortal.type.color;
      ctx.font = `bold ${urgency ? '12' : '11'}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(immortal.type.name, immortal.x, immortal.y - 50 + bob);

      const minLeft = Math.ceil(remaining / 60000);
      ctx.font = '9px monospace';
      ctx.fillStyle = urgency ? '#ff6b6b' : '#ccc';
      ctx.fillText(`⏱ ${minLeft} phút`, immortal.x, immortal.y - 38 + bob);

      if (immortal.canInteract) {
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 14px monospace';
        ctx.fillText('💬 Nói chuyện', immortal.x, immortal.y - 65 + bob);
      }

      if (urgency && Math.floor(now / 500) % 2 === 0) {
        ctx.strokeStyle = '#ff6b6b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(immortal.x, immortal.y - 10 + bob, 30, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    }
  },

  _renderGlowTile(ctx, x, y, now) {
    const pulse = 0.4 + Math.sin(now / 400) * 0.3;
    ctx.save();
    ctx.globalAlpha = pulse;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, 25);
    grad.addColorStop(0, '#fff');
    grad.addColorStop(0.5, 'rgba(255,255,255,0.3)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = pulse * 0.8;
    ctx.fillStyle = '#fff';
    ctx.font = '16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('✦', x, y + 6);
    ctx.restore();
  },

  _renderImmortalSprite(ctx, immortal, bob, now) {
    const x = immortal.x;
    const y = immortal.y + bob;
    const c = immortal.type.color;

    ctx.fillStyle = c;
    ctx.globalAlpha = 0.9;
    ctx.fillRect(x - 10, y - 28, 20, 26);
    ctx.fillRect(x - 18, y - 24, 8, 14);
    ctx.fillRect(x + 10, y - 24, 8, 14);

    ctx.fillStyle = '#ffe4c4';
    ctx.beginPath();
    ctx.arc(x, y - 35, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = c;
    ctx.fillRect(x - 10, y - 46, 20, 10);
    ctx.fillRect(x - 2, y - 54, 4, 12);

    ctx.fillStyle = '#fff';
    ctx.fillRect(x - 6, y - 38, 4, 3);
    ctx.fillRect(x + 2, y - 38, 4, 3);
    ctx.fillStyle = c;
    ctx.fillRect(x - 5, y - 37, 2, 2);
    ctx.fillRect(x + 3, y - 37, 2, 2);

    if (Utils.chance(0.15)) {
      GameState.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y - 10,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -1.5 - Math.random(),
        life: 800,
        color: immortal.type.color,
        size: 2 + Math.random() * 3
      });
    }
  },

  // ==================== INTERACT ====================
  interact(immortal) {
    if (!immortal || !immortal.canInteract) return;
    this._openDialog(immortal);
  },

  tryInteractNearest() {
    let nearest = null;
    let nearestDist = Infinity;
    for (const immortal of this.state.active) {
      if (!immortal.visible) continue;
      const d = Utils.dist(Player.x, Player.y, immortal.x, immortal.y);
      if (d < nearestDist && d <= this.config.INTERACT_RANGE) {
        nearestDist = d;
        nearest = immortal;
      }
    }
    if (nearest) {
      this.interact(nearest);
      return true;
    }
    return false;
  },

  _openDialog(immortal) {
    const type = immortal.type;
    const condMet = !type.condition || type.condition(Player);

    const dialogEl = document.getElementById('npcDialog');
    document.getElementById('npcName').textContent = type.name;
    document.getElementById('npcTitle').textContent = type.title;

    let dialogText = type.dialog;
    if (!condMet) dialogText = `[${type.conditionText}]\n${type.dialog}`;
    document.getElementById('npcText').textContent = dialogText;

    const avatarCanvas = document.getElementById('npcAvatarCanvas');
    const ctx2 = avatarCanvas.getContext('2d');
    ctx2.clearRect(0, 0, 32, 32);
    ctx2.fillStyle = type.color;
    ctx2.fillRect(6, 2, 20, 28);
    ctx2.fillStyle = '#ffe4c4';
    ctx2.beginPath();
    ctx2.arc(16, 8, 8, 0, Math.PI * 2);
    ctx2.fill();
    ctx2.fillStyle = type.color;
    ctx2.fillRect(6, 0, 20, 6);

    const optionsEl = document.getElementById('npcOptions');
    optionsEl.innerHTML = '';

    if (!condMet) {
      const el = document.createElement('div');
      el.className = 'npc-option disabled';
      el.innerHTML = `<span>❌ ${type.conditionText}</span>`;
      optionsEl.appendChild(el);
    } else {
      switch (type.service) {
        case 'teach_skill': this._buildTeachOptions(optionsEl, immortal); break;
        case 'sell_rare':   this._buildSellOptions(optionsEl, immortal);  break;
        case 'gamble':      this._buildGambleOptions(optionsEl, immortal); break;
      }
    }

    this._addChallengeOption(optionsEl, immortal);

    if (this._hasMetBefore(immortal.typeKey)) {
      const el = document.createElement('div');
      el.style.cssText = 'color:#666;font-size:9px;text-align:center;margin:6px 0';
      el.textContent = '📖 Đã gặp trước đây';
      optionsEl.appendChild(el);
    }

    const closeEl = document.createElement('div');
    closeEl.className = 'npc-option';
    closeEl.innerHTML = '<span>👋 Tạm biệt</span>';
    closeEl.addEventListener('click', () => {
      document.getElementById('npcDialog').classList.remove('show');
      this._recordMeeting(immortal);
    });
    optionsEl.appendChild(closeEl);

    dialogEl.classList.add('show');
    UI.addLog(`🧙 Gặp ${type.name}!`, 'realm');
  },

  _buildTeachOptions(container, immortal) {
    const type = immortal.type;

    const title = document.createElement('div');
    title.style.cssText = 'color:#f0c040;font-size:11px;margin-bottom:8px;font-weight:bold';
    title.textContent = '✨ Học Kỹ Năng Bí Truyền';
    container.appendChild(title);

    if (type.karmaWarning) {
      const warn = document.createElement('div');
      warn.style.cssText = 'color:#ff6b6b;font-size:9px;margin-bottom:8px;padding:6px;border:1px solid #ff6b6b;border-radius:6px';
      warn.textContent = '⚠️ Cảnh báo: Học tà thuật sẽ tăng Nghiệp Chướng!';
      container.appendChild(warn);
    }

    for (const reward of type.rewards) {
      const alreadyHas = this.unlockedPassives.includes(reward.id);
      const el = document.createElement('div');
      el.className = 'npc-option' + (alreadyHas ? ' disabled' : '');
      el.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span>📚 ${reward.name}</span>
          <span style="color:${alreadyHas ? '#4caf50' : '#f0c040'};font-size:10px">${alreadyHas ? '✓ Đã học' : 'Miễn phí'}</span>
        </div>
        <div style="font-size:9px;color:#aaa;margin-top:3px">${reward.desc}</div>
      `;
      if (!alreadyHas) {
        const r = reward;
        const im = immortal;
        el.addEventListener('click', () => {
          this._learnPassive(r, im);
          document.getElementById('npcDialog').classList.remove('show');
        });
      }
      container.appendChild(el);
    }
  },

  _buildSellOptions(container, immortal) {
    const type = immortal.type;

    const title = document.createElement('div');
    title.style.cssText = 'color:#f0c040;font-size:11px;margin-bottom:8px;font-weight:bold';
    title.textContent = '🛒 Vật Phẩm Đặc Biệt (Hôm nay mới có!)';
    container.appendChild(title);

    for (const item of type.shopItems) {
      const canBuy = Player.gold >= item.price;
      const el = document.createElement('div');
      el.className = 'npc-option' + (canBuy ? '' : ' disabled');
      el.innerHTML = `
        <div style="display:flex;justify-content:space-between">
          <span>${item.name}</span>
          <span class="cost">${item.price} 💰</span>
        </div>
        <div style="font-size:9px;color:#aaa;margin-top:2px">${item.desc}</div>
      `;
      if (canBuy) {
        const it = item;
        const im = immortal;
        el.addEventListener('click', () => { this._buySpecialItem(it, im); });
      }
      container.appendChild(el);
    }
  },

  _buildGambleOptions(container, immortal) {
    const type = immortal.type;

    const title = document.createElement('div');
    title.style.cssText = 'color:#ff69b4;font-size:11px;margin-bottom:8px;font-weight:bold';
    title.textContent = `🎲 Tỷ lệ thắng: ${Math.round(type.winChance * 100)}%`;
    container.appendChild(title);

    for (const opt of type.gambleOptions) {
      let canGamble = true;
      if (opt.bet === 'gold') canGamble = Player.gold >= opt.amount;
      if (opt.bet === 'item') canGamble = !!Player.equipped.weapon;

      const el = document.createElement('div');
      el.className = 'npc-option' + (canGamble ? '' : ' disabled');
      el.innerHTML = `<span>🎲 ${opt.label}</span>`;
      if (canGamble) {
        const o = opt;
        const im = immortal;
        el.addEventListener('click', () => {
          this._doGamble(o, im, type);
          document.getElementById('npcDialog').classList.remove('show');
        });
      }
      container.appendChild(el);
    }
  },

  _addChallengeOption(container, immortal) {
    const sep = document.createElement('div');
    sep.style.cssText = 'border-top:1px solid #333;margin:8px 0;';
    container.appendChild(sep);

    const el = document.createElement('div');
    el.className = 'npc-option';
    el.style.borderColor = '#ff9800';
    el.innerHTML = `
      <span>⚔️ Thách Đấu / Thử Thách</span>
      <span style="color:#ff9800;font-size:10px">Thưởng lớn</span>
    `;
    el.addEventListener('click', () => {
      document.getElementById('npcDialog').classList.remove('show');
      this._openChallengeMenu(immortal);
    });
    container.appendChild(el);
  },

  // ==================== CHALLENGE SYSTEM ====================
  _openChallengeMenu(immortal) {
    const overlay = document.getElementById('wi-challenge-overlay');
    overlay.style.display = 'flex';

    const content = document.getElementById('wi-challenge-content');
    content.innerHTML = `
      <div style="color:#f0c040;font-size:16px;font-weight:bold;margin-bottom:16px;text-align:center">
        ⚔️ Thử Thách Du Tiên
      </div>
      <div style="color:#ccc;font-size:11px;margin-bottom:16px;text-align:center">Chọn loại thử thách:</div>
      <div style="display:flex;flex-direction:column;gap:10px">
        <div class="npc-option" id="wi-ch-time" style="border-color:#ff9800">
          <div style="display:flex;justify-content:space-between">
            <span>⏱️ Thử thách thời gian</span>
            <span style="color:#ff9800;font-size:10px">2 phút</span>
          </div>
          <div style="font-size:9px;color:#aaa;margin-top:3px">Giết 8 quái trong 2 phút. Thưởng: 500 vàng + EXP</div>
        </div>
        <div class="npc-option" id="wi-ch-quiz" style="border-color:#4fc3f7">
          <div style="display:flex;justify-content:space-between">
            <span>🧩 Câu đố thiên cơ</span>
            <span style="color:#4fc3f7;font-size:10px">1 câu hỏi</span>
          </div>
          <div style="font-size:9px;color:#aaa;margin-top:3px">Trả lời đúng: Nhận item hiếm. Sai: Mất 100 vàng</div>
        </div>
        <div class="npc-option" id="wi-ch-duel" style="border-color:#ff4444">
          <div style="display:flex;justify-content:space-between">
            <span>💀 Thử thách sinh tử</span>
            <span style="color:#ff4444;font-size:10px">Không potion</span>
          </div>
          <div style="font-size:9px;color:#aaa;margin-top:3px">Chiến phân thân Du Tiên. Thắng: passive đặc biệt. Thua: mất 20% HP</div>
        </div>
        <div class="npc-option" id="wi-ch-cancel"><span>❌ Quay lại</span></div>
      </div>
    `;

    document.getElementById('wi-ch-time').onclick   = () => { overlay.style.display = 'none'; this._startTimeChallenge(immortal); };
    document.getElementById('wi-ch-quiz').onclick   = () => { overlay.style.display = 'none'; this._startQuizChallenge(immortal); };
    document.getElementById('wi-ch-duel').onclick   = () => { overlay.style.display = 'none'; this._startDuelChallenge(immortal); };
    document.getElementById('wi-ch-cancel').onclick = () => { overlay.style.display = 'none'; };
  },

  _startTimeChallenge(immortal) {
    this.state.challengeActive = {
      type: 'time',
      immortalId: immortal.id,
      killTarget: 8,
      killCount: 0,
      timeLeft: 120000,
      done: false,
    };

    UI.addLog('⏱️ Thử thách bắt đầu! Giết 8 quái trong 2 phút!', 'system');
    UI.showNotification('⏱️ Thử Thách!', 'Giết 8 quái trong 2 phút');

    const bar = document.getElementById('wi-timer-bar');
    const label = document.getElementById('wi-timer-label');
    if (bar) {
      bar.parentElement.style.display = 'block';
      bar.style.width = '100%';
      bar.style.background = '#ff9800';
      label.textContent = '⏱️ 2:00 | 0/8 quái';
    }
  },

  _updateChallenge(dt) {
    const ch = this.state.challengeActive;
    if (!ch || ch.done) return;

    if (ch.type === 'time') {
      ch.timeLeft -= dt;

      const secs = Math.ceil(ch.timeLeft / 1000);
      const mins = Math.floor(secs / 60);
      const s = secs % 60;
      const bar = document.getElementById('wi-timer-bar');
      const label = document.getElementById('wi-timer-label');
      if (bar) {
        bar.style.width = (ch.timeLeft / 120000 * 100) + '%';
        bar.style.background = ch.timeLeft < 30000 ? '#f44336' : '#ff9800';
        if (label) label.textContent = `⏱️ ${mins}:${s.toString().padStart(2,'0')} | ${ch.killCount}/${ch.killTarget} quái`;
      }

      if (ch.timeLeft <= 0) {
        ch.done = true;
        this._endChallenge(false, 'time');
      }
    }
  },

  onEnemyKilled() {
    const ch = this.state.challengeActive;
    if (!ch || ch.done || ch.type !== 'time') return;
    ch.killCount++;
    if (ch.killCount >= ch.killTarget) {
      ch.done = true;
      this._endChallenge(true, 'time');
    }
  },

  _endChallenge(success, type) {
    const bar = document.getElementById('wi-timer-bar');
    if (bar) bar.parentElement.style.display = 'none';

    if (type === 'time') {
      if (success) {
        Player.gold += 500;
        Player.gainExp(800);
        UI.updateGold();
        UI.showNotification('🏆 Thành Công!', '+500 Vàng +800 EXP');
        UI.addLog('🏆 Thử thách thời gian hoàn thành! +500 vàng +800 EXP', 'realm');
      } else {
        UI.showNotification('💀 Thất Bại!', 'Không đủ thời gian');
        UI.addLog('❌ Thử thách thất bại! Chưa đủ quái.', 'system');
      }
    } else if (type === 'duel') {
      if (success) {
        const immortal = this.state.active.find(i => i.id === this.state.challengeActive?.immortalId);
        if (immortal && immortal.type.rewards) {
          const available = immortal.type.rewards.filter(r => !this.unlockedPassives.includes(r.id));
          if (available.length > 0) {
            const r = available[Utils.randomInt(0, available.length - 1)];
            this._learnPassive(r, immortal);
          }
        } else {
          Player.gold += 1000;
          UI.updateGold();
          UI.addLog('🏆 Chiến thắng! +1000 Vàng', 'realm');
        }
      } else {
        Player.hp = Math.max(1, Player.hp - Math.floor(Player.maxHp * 0.2));
        UI.addLog('💀 Thua cuộc! Mất 20% HP', 'damage');
      }
    }

    this.state.challengeActive = null;
  },

  _startQuizChallenge(immortal) {
    const quiz = this.quizData[Utils.randomInt(0, this.quizData.length - 1)];
    const overlay = document.getElementById('wi-challenge-overlay');
    overlay.style.display = 'flex';

    const content = document.getElementById('wi-challenge-content');
    content.innerHTML = `
      <div style="color:#4fc3f7;font-size:15px;font-weight:bold;margin-bottom:16px;text-align:center">🧩 Câu Đố Thiên Cơ</div>
      <div style="color:#fff;font-size:12px;margin-bottom:16px;text-align:center;line-height:1.6">${quiz.q}</div>
      <div style="display:flex;flex-direction:column;gap:8px" id="wi-quiz-opts"></div>
    `;

    const optsEl = document.getElementById('wi-quiz-opts');
    quiz.opts.forEach((opt, i) => {
      const el = document.createElement('div');
      el.className = 'npc-option';
      el.textContent = `${['A','B','C','D'][i]}. ${opt}`;
      el.addEventListener('click', () => {
        overlay.style.display = 'none';
        if (i === quiz.ans) {
          const prizes = ['realmPill','expPotion','spiritStone','demonCore'];
          const prizeId = prizes[Utils.randomInt(0, prizes.length - 1)];
          Inventory.add(prizeId, 1);
          const itemName = ITEMS[prizeId]?.name || prizeId;
          UI.showNotification('✅ Chính Xác!', `+${itemName}`);
          UI.addLog(`✅ Câu đố đúng! Nhận ${itemName}`, 'realm');
        } else {
          Player.gold = Math.max(0, Player.gold - 100);
          UI.updateGold();
          UI.showNotification('❌ Sai Rồi!', '-100 Vàng');
          UI.addLog(`❌ Câu đố sai! Đáp án: ${quiz.opts[quiz.ans]}. Mất 100 vàng.`, 'damage');
        }
      });
      optsEl.appendChild(el);
    });
  },

  _startDuelChallenge(immortal) {
    const duelEnemy = {
      id: 'wi_duel',
      type: 'duel',
      name: `⚔️ Phân Thân ${immortal.type.name}`,
      x: immortal.x + 60,
      y: immortal.y,
      spawnX: immortal.x + 60,
      spawnY: immortal.y,
      hp: Math.floor(Player.maxHp * 1.5),
      maxHp: Math.floor(Player.maxHp * 1.5),
      atk: Math.floor(Player.atk * 0.8),
      exp: 0, gold: 0,
      level: Player.level,
      size: 14,
      color: immortal.type.color,
      sprite: 'demon',
      boss: false,
      drops: [],
      alive: true,
      moveTimer: 0, moveDir: 0,
      attackTimer: 0, hitFlash: 0,
      aggroed: true,
      isDuelEnemy: true,
    };

    Enemies.list.push(duelEnemy);
    Player.target = duelEnemy;
    UI.updateTargetInfo();

    this.state.challengeActive = {
      type: 'duel',
      immortalId: immortal.id,
      duelEnemyRef: duelEnemy,
      noPotions: true,
      done: false,
    };

    this._origHeal = Player.heal.bind(Player);
    Player.heal = (hp, mp) => {
      if (this.state.challengeActive && this.state.challengeActive.type === 'duel') {
        UI.addLog('🚫 Không dùng đan dược trong thử thách sinh tử!', 'system');
        return;
      }
      this._origHeal(hp, mp);
    };

    UI.addLog(`💀 Thử thách sinh tử bắt đầu! Đánh bại phân thân ${immortal.type.name}!`, 'system');
    UI.showNotification('💀 Sinh Tử Quyết!', 'Không được dùng potion!');

    const watchDuel = setInterval(() => {
      const ch = this.state.challengeActive;
      if (!ch || ch.done) { clearInterval(watchDuel); return; }
      if (!duelEnemy.alive) {
        ch.done = true;
        clearInterval(watchDuel);
        if (this._origHeal) Player.heal = this._origHeal;
        this._endChallenge(true, 'duel');
      }
      if (!Player.alive) {
        ch.done = true;
        clearInterval(watchDuel);
        if (this._origHeal) Player.heal = this._origHeal;
        this._endChallenge(false, 'duel');
      }
    }, 500);
  },

  // ==================== REWARDS ====================
  _learnPassive(reward, immortal) {
    if (this.unlockedPassives.includes(reward.id)) return;
    this.unlockedPassives.push(reward.id);
    this._applyPassive(reward);
    this._recordMeeting(immortal);
    this._saveData();
    UI.showNotification(`✨ ${reward.name}`, reward.desc);
    UI.addLog(`✨ Học được: ${reward.name}! ${reward.desc}`, 'realm');
  },

  _applyPassive(reward) {
    const s = reward.stats;
    if (!s) return;
    if (s.critRate)   Player.critRate = (Player.critRate || 0.08) + s.critRate;
    if (s.speedBonus) Player.baseSpeed += Player.baseSpeed * s.speedBonus;
    if (s.expBonus)   WanderingImmortal._permExpBonus = (WanderingImmortal._permExpBonus || 0) + s.expBonus;
    if (s.lifesteal)  WanderingImmortal._lifesteal = (WanderingImmortal._lifesteal || 0) + s.lifesteal;
    if (s.fullHpBonus) WanderingImmortal._fullHpBonus = (WanderingImmortal._fullHpBonus || 0) + s.fullHpBonus;
    if (s.auraAtk)    WanderingImmortal._auraAtk = (WanderingImmortal._auraAtk || 0) + s.auraAtk;
    if (s.darkAtkBonus) WanderingImmortal._darkAtkBonus = (WanderingImmortal._darkAtkBonus || 0) + s.darkAtkBonus;
    if (s.heavenEye)  WanderingImmortal._heavenEye = true;
    if (s.forbiddenLightning) WanderingImmortal._forbiddenLightning = true;
    Player.recalculateStats();
  },

  _reapplyAllPassives() {
    for (const id of this.unlockedPassives) {
      for (const typeKey in this.immortalTypes) {
        const rewards = this.immortalTypes[typeKey].rewards || [];
        const r = rewards.find(rr => rr.id === id);
        if (r) { this._applyPassive(r); break; }
      }
    }
  },

  _buySpecialItem(item, immortal) {
    if (Player.gold < item.price) { UI.addLog('❌ Không đủ vàng!', 'system'); return; }
    Player.gold -= item.price;

    const e = item.effect;
    if (e.hp)          Player.heal(e.hp, 0);
    if (e.mp)          Player.heal(0, e.mp);
    if (e.exp)         Player.gainExp(e.exp);
    if (e.realmExp)    Player.gainRealmExp(e.realmExp);
    if (e.permHp)      { Player.maxHp += e.permHp; Player.hp = Math.min(Player.hp + e.permHp, Player.maxHp); }
    if (e.permMp)      { Player.maxMp += e.permMp; }
    if (e.permDef)     { Player.baseDef += e.permDef; Player.recalculateStats(); }
    if (e.permExpBonus){ WanderingImmortal._permExpBonus = (WanderingImmortal._permExpBonus || 0) + e.permExpBonus; }

    UI.updateGold();
    UI.showNotification(`🛒 ${item.name}`, item.desc);
    UI.addLog(`🛒 Mua ${item.name}! -${item.price} 💰`, 'gold');

    this._recordMeeting(immortal);
    document.getElementById('npcDialog').classList.remove('show');
  },

  _doGamble(opt, immortal, type) {
    const win = Utils.chance(type.winChance);

    if (opt.bet === 'gold') {
      if (!win) {
        Player.gold = Math.max(0, Player.gold - opt.amount);
        UI.updateGold();
        UI.showNotification('🎲 Thua!', `-${opt.amount} 💰`);
        UI.addLog(`🎲 Thua cược! Mất ${opt.amount} vàng.`, 'damage');
      } else {
        const reward = opt.amount * opt.rewardMul;
        Player.gold += reward;
        UI.updateGold();
        UI.showNotification('🎲 Thắng!', `+${reward} 💰`);
        UI.addLog(`🎲 Thắng cược! +${reward} vàng!`, 'realm');
      }
    } else if (opt.bet === 'item') {
      if (!win) {
        const lost = Player.equipped.weapon;
        if (lost) {
          Player.equipped.weapon = null;
          Player.recalculateStats();
          UI.addLog(`🎲 Thua! Mất ${ITEMS[lost]?.name || lost}`, 'damage');
        }
      } else {
        const weapons = ['steelSword','silverSword','flameSword','frostSword'];
        const prize = weapons[Utils.randomInt(0, weapons.length - 1)];
        Inventory.add(prize, 1);
        UI.addLog(`🎲 Thắng! Nhận ${ITEMS[prize]?.name || prize}!`, 'realm');
        UI.showNotification('🎲 Thắng!', ITEMS[prize]?.name || prize);
      }
    }

    this._recordMeeting(immortal);
  },

  // ==================== HISTORY ====================
  _hasMetBefore(typeKey) {
    return this.state.history.some(h => h.typeKey === typeKey);
  },

  _recordMeeting(immortal) {
    const exists = this.state.history.find(h => h.typeKey === immortal.typeKey && h.date === new Date().toDateString());
    if (!exists) {
      this.state.history.push({
        typeKey: immortal.typeKey,
        name: immortal.type.name,
        date: new Date().toDateString(),
        timestamp: Date.now(),
      });
      if (this.state.history.length > 50) this.state.history.shift();
    }
    this._saveData();
  },

  // ==================== HUD INDICATOR ====================
  _updateHUDIndicator() {
    const el = document.getElementById('wi-hud-indicator');
    if (!el) return;
    if (this.state.active.length === 0) { el.style.display = 'none'; return; }
    el.style.display = 'flex';
    const immortal = this.state.active[0];
    const remaining = immortal.expireTime - Date.now();
    const mins = Math.ceil(remaining / 60000);
    el.querySelector('#wi-hud-name').textContent = immortal.type.name;
    el.querySelector('#wi-hud-time').textContent = `${mins}p`;
    const pulse = Math.sin(Date.now() / 400) > 0;
    el.style.borderColor = pulse ? immortal.type.color : '#333';
  },

  // ==================== INJECT UI ====================
  _injectUI() {
    const div = document.createElement('div');
    div.innerHTML = `
      <div id="wi-hud-indicator" style="
        display:none;position:absolute;top:200px;left:10px;z-index:25;
        background:rgba(0,0,0,0.8);border:2px solid #f0c040;border-radius:8px;
        padding:6px 10px;font-size:10px;color:#f0c040;
        align-items:center;gap:6px;flex-direction:column;min-width:90px;">
        <div style="font-size:9px;color:#aaa">🧙 Du Tiên</div>
        <div id="wi-hud-name" style="font-weight:bold;text-align:center"></div>
        <div style="display:flex;align-items:center;gap:4px">
          <span style="color:#ff9800;font-size:9px">⏱</span>
          <span id="wi-hud-time" style="color:#ff9800;font-size:10px;font-weight:bold"></span>
        </div>
      </div>
      <div id="wi-challenge-overlay" style="
        display:none;position:absolute;top:0;left:0;width:100%;height:100%;
        background:rgba(0,0,0,0.8);z-index:150;
        align-items:center;justify-content:center;">
        <div id="wi-challenge-content" style="
          background:linear-gradient(135deg,#1a1a2e,#16213e);
          border:3px solid #f0c040;border-radius:15px;
          padding:20px;width:90%;max-width:360px;max-height:80vh;overflow-y:auto;"></div>
      </div>
      <div id="wi-timer-container" style="
        display:none;position:absolute;bottom:220px;left:50%;
        transform:translateX(-50%);z-index:30;width:260px;
        background:rgba(0,0,0,0.8);border:2px solid #ff9800;border-radius:8px;padding:6px 10px;">
        <div id="wi-timer-label" style="color:#ff9800;font-size:10px;font-weight:bold;text-align:center;margin-bottom:4px">⏱️ 2:00 | 0/8 quái</div>
        <div style="background:#111;border-radius:4px;height:8px;overflow:hidden">
          <div id="wi-timer-bar" style="height:100%;background:#ff9800;border-radius:4px;transition:width 0.3s;width:100%"></div>
        </div>
      </div>
    `;
    document.body.appendChild(div);

    const menuBar = document.getElementById('menuBar');
    if (menuBar) {
      const btn = document.createElement('div');
      btn.className = 'menu-btn';
      btn.innerHTML = '<span style="font-size:16px">🧙</span><span>Du Tiên</span>';
      btn.onclick = () => this._openPassiveList();
      menuBar.appendChild(btn);
    }
  },

  _openPassiveList() {
    const overlay = document.getElementById('wi-challenge-overlay');
    overlay.style.display = 'flex';
    const content = document.getElementById('wi-challenge-content');

    let html = `<div style="color:#f0c040;font-size:16px;font-weight:bold;margin-bottom:12px;text-align:center">🧙 Du Tiên Hệ Thống</div>`;

    if (this.state.active.length > 0) {
      html += `<div style="color:#8ef;font-size:11px;margin-bottom:8px;font-weight:bold">📍 Đang xuất hiện:</div>`;
      for (const im of this.state.active) {
        const mins = Math.ceil((im.expireTime - Date.now()) / 60000);
        html += `<div style="background:rgba(255,255,255,0.05);border:1px solid ${im.type.color};border-radius:8px;padding:8px;margin-bottom:6px;font-size:10px">
          <b style="color:${im.type.color}">${im.type.name}</b> — còn ${mins} phút
          ${im.visible ? '' : '<br><span style="color:#aaa">🌫️ Ẩn — tìm dấu hiệu trên map</span>'}
        </div>`;
      }
    }

    if (this.state.trails.length > 0) {
      html += `<div style="color:#888;font-size:11px;margin-bottom:8px;margin-top:8px">👣 Vừa rời đi:</div>`;
      for (const t of this.state.trails) {
        const mins = Math.ceil((t.expireTime - Date.now()) / 60000);
        html += `<div style="color:#666;font-size:10px;padding:4px 0">${t.type.name} — dấu chân còn ${mins} phút</div>`;
      }
    }

    html += `<div style="border-top:1px solid #333;margin-top:12px;padding-top:12px;color:#f0c040;font-size:11px;font-weight:bold;margin-bottom:8px">✨ Passive đã học (${this.unlockedPassives.length}):</div>`;
    if (this.unlockedPassives.length === 0) {
      html += `<div style="color:#666;font-size:10px">Chưa học được passive nào. Gặp Du Tiên để học!</div>`;
    } else {
      for (const id of this.unlockedPassives) {
        let found = null;
        for (const typeKey in this.immortalTypes) {
          found = (this.immortalTypes[typeKey].rewards || []).find(r => r.id === id);
          if (found) break;
        }
        if (found) {
          html += `<div style="background:rgba(240,192,64,0.1);border:1px solid #f0c04066;border-radius:6px;padding:6px 8px;margin-bottom:4px;font-size:10px">
            <b style="color:#f0c040">${found.name}</b><br><span style="color:#aaa">${found.desc}</span>
          </div>`;
        }
      }
    }

    if (this.state.history.length > 0) {
      html += `<div style="border-top:1px solid #333;margin-top:12px;padding-top:12px;color:#888;font-size:10px;margin-bottom:6px">📖 Lịch sử gặp gỡ:</div>`;
      for (const h of [...this.state.history].reverse().slice(0, 5)) {
        html += `<div style="color:#555;font-size:9px;padding:2px 0">${h.name} — ${h.date}</div>`;
      }
    }

    html += `<div class="npc-option" style="margin-top:12px" onclick="document.getElementById('wi-challenge-overlay').style.display='none'">✕ Đóng</div>`;
    content.innerHTML = html;
  },

  // ==================== STYLES ====================
  _injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      #wi-hud-indicator { cursor: pointer; }
      #wi-hud-indicator:active { transform: scale(0.95); }
      #wi-challenge-content::-webkit-scrollbar { width: 4px; }
      #wi-challenge-content::-webkit-scrollbar-track { background: #1a1a2e; }
      #wi-challenge-content::-webkit-scrollbar-thumb { background: #f0c040; border-radius: 2px; }
    `;
    document.head.appendChild(style);
  },

  // ==================== SAVE / LOAD ====================
  _saveData() {
    try {
      localStorage.setItem('wi_data', JSON.stringify({
        todayCount: this.state.todayCount,
        lastDayReset: this.state.lastDayReset,
        history: this.state.history,
        unlockedPassives: this.unlockedPassives,
      }));
    } catch(e) {}
  },

  _loadData() {
    try {
      const raw = localStorage.getItem('wi_data');
      if (!raw) return;
      const d = JSON.parse(raw);
      this.state.todayCount    = d.todayCount    || 0;
      this.state.lastDayReset  = d.lastDayReset  || 0;
      this.state.history       = d.history       || [];
      this.unlockedPassives    = d.unlockedPassives || [];
      setTimeout(() => this._reapplyAllPassives(), 500);
    } catch(e) {}
  },
};

// ==================== HOOKS ====================
const _origGameInit_WI = Game.init.bind(Game);
Game.init = function() {
  _origGameInit_WI();
  WanderingImmortal.init();
};

const _origGameUpdate_WI = Game.update.bind(Game);
Game.update = function(dt) {
  _origGameUpdate_WI(dt);
  WanderingImmortal.update(dt);
};

const _origGameRender_WI = Game.render.bind(Game);
Game.render = function() {
  _origGameRender_WI();
  const ctx = this.ctx;
  ctx.save();
  ctx.translate(-GameState.camera.x, -GameState.camera.y);
  WanderingImmortal.render(ctx);
  ctx.restore();
};

const _origHandleTap_WI = Game.handleTap.bind(Game);
Game.handleTap = function(screenX, screenY) {
  const worldX = screenX + GameState.camera.x;
  const worldY = screenY + GameState.camera.y;

  for (const immortal of WanderingImmortal.state.active) {
    if (!immortal.visible) continue;
    const d = Utils.dist(worldX, worldY, immortal.x, immortal.y);
    if (d <= WanderingImmortal.config.INTERACT_RANGE) {
      WanderingImmortal.interact(immortal);
      return;
    }
  }

  _origHandleTap_WI(screenX, screenY);
};

const _origEnemiesDamage_WI = Enemies.damage ? Enemies.damage.bind(Enemies) : null;
if (_origEnemiesDamage_WI) {
  Enemies.damage = function(enemy, amount, isCrit, color) {
    _origEnemiesDamage_WI(enemy, amount, isCrit, color);

    if (WanderingImmortal._lifesteal && amount > 0) {
      const heal = Math.floor(amount * WanderingImmortal._lifesteal);
      if (heal > 0) Player.heal(heal, 0);
    }

    if (enemy && !enemy.alive) {
      WanderingImmortal.onEnemyKilled();
    }
  };
}

const _origGainExp_WI = Player.gainExp.bind(Player);
Player.gainExp = function(amount) {
  const bonus = WanderingImmortal._permExpBonus || 0;
  const finalAmount = bonus > 0 ? Math.floor(amount * (1 + bonus)) : amount;
  _origGainExp_WI(finalAmount);
};

const _origSave_WI = Game.save.bind(Game);
Game.save = function() {
  _origSave_WI();
  WanderingImmortal._saveData();
};

const _origLoad_WI = Game.load.bind(Game);
Game.load = function() {
  const r = _origLoad_WI();
  WanderingImmortal._loadData();
  return r;
};

console.log('🧙 feature_wandering_immortal.js loaded');
// ===== CHANGES: Xóa console.log debug trong trySpawn() (dòng log position của Du Tiên); giữ nguyên toàn bộ logic, hooks, tên object WanderingImmortal =====
