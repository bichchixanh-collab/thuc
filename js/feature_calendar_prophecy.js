// ==================== FEATURE: CALENDAR + PROPHECY SYSTEM ====================
// js/feature_calendar_prophecy.js
// Load sau: game.js
// <script src="js/feature_calendar_prophecy.js"></script>

// ============================================================
// SECTION 1 — DATA & CONFIG
// ============================================================

const CALENDAR_CONFIG = {
  cycleDays: 28,
  storageKey: 'tuxien_calendar',

  days: [
    { day:1,  name:'Thiên Khai',    icon:'✨', color:'#f0c040',
      effects:{ allStatBonus:0.10 },
      desc:'+10% tất cả stat. Ngày may mắn.' },
    { day:2,  name:'Kiếm Khí',     icon:'⚔️', color:'#ef5350',
      effects:{ skillDmgBonus:0.20 },
      desc:'Skill damage +20%.' },
    { day:3,  name:'Linh Vũ',      icon:'🌧️', color:'#42a5f5',
      effects:{ mpRegenMul:2.0 },
      desc:'MP hồi phục x2.' },
    { day:4,  name:'Địa Sát',      icon:'💀', color:'#f44336',
      effects:{ enemyAggressive:true, expMul:1.20 },
      desc:'Quái hung hăng hơn, EXP +20%.' },
    { day:5,  name:'Kim Nhật',     icon:'💰', color:'#ffd700',
      effects:{ goldMul:1.50 },
      desc:'Gold drop x1.5.' },
    { day:6,  name:'Hỏa Diệm',    icon:'🔥', color:'#ff4500',
      effects:{ elementBonus:{ fire:0.40 } },
      desc:'Fire element +40%.' },
    { day:7,  name:'Tiên Hội',     icon:'🧙', color:'#e040fb',
      effects:{ specialNpc:true },
      desc:'NPC Tiên Nhân đặc biệt xuất hiện.' },
    { day:8,  name:'Hàn Băng',    icon:'❄️', color:'#00bcd4',
      effects:{ elementBonus:{ ice:0.40 }, speedDebuff:0.10 },
      desc:'Ice +40%, speed -10%.' },
    { day:9,  name:'Lôi Bạo',     icon:'⚡', color:'#ffeb3b',
      effects:{ elementBonus:{ thunder:0.40 }, stormVisual:true },
      desc:'Thunder +40%.' },
    { day:10, name:'Phong Vũ',    icon:'🌪️', color:'#69f0ae',
      effects:{ elementBonus:{ wind:0.40 } },
      desc:'Wind +40%.' },
    { day:11, name:'Linh Thú',    icon:'🐾', color:'#4caf50',
      effects:{ petExpMul:2.0 },
      desc:'Pet EXP x2.' },
    { day:12, name:'Âm Dương',    icon:'☯️', color:'#9e9e9e',
      effects:{ dayNightSwap:true },
      desc:'Ngày/đêm effect đảo ngược.' },
    { day:13, name:'Hư Không',    icon:'🌀', color:'#7c4dff',
      effects:{ dungeonSpawnMul:3.0, voidRiftMul:3.0 },
      desc:'Bí Cảnh x3, Void Rift x3.' },
    { day:14, name:'Huyết Nguyệt', icon:'🌕', color:'#f44336',
      effects:{ bossEventGuaranteed:true, dropMul:2.0 },
      desc:'Boss Event guaranteed. Drop rate x2.' },
    { day:15, name:'Trung Thiên',  icon:'⭐', color:'#f0c040',
      effects:{ randomMegaBuff:true },
      desc:'Giữa tháng: random mega buff 30 phút.' },
    { day:16, name:'Kiếm Vũ',     icon:'🗡️', color:'#ef5350',
      effects:{ basicSkillBonus:0.30 },
      desc:'Skill 0 và 1 +30% damage.' },
    { day:17, name:'Tinh Lực',    icon:'💎', color:'#42a5f5',
      effects:{ mpCostReduction:0.30 },
      desc:'MP cost tất cả skill -30%.' },
    { day:18, name:'Cường Địa',   icon:'🛡️', color:'#26a69a',
      effects:{ defBonus:0.25, hpRegenMul:2.0 },
      desc:'DEF +25%, HP regen x2.' },
    { day:19, name:'Hỗn Độn',     icon:'🎲', color:'#ff9800',
      effects:{ randomElementEachHit:true },
      desc:'Mỗi đòn đánh random nguyên tố.' },
    { day:20, name:'Tiên Duyên',  icon:'🌸', color:'#f48fb1',
      effects:{ npcKarmaBonus:2.0 },
      desc:'Karma từ NPC x2.' },
    { day:21, name:'Huyết Chiến', icon:'⚔️', color:'#b71c1c',
      effects:{ combatExpBonus:0.40, hpNoRegen:true },
      desc:'EXP combat +40%, không hồi HP tự nhiên.' },
    { day:22, name:'Linh Khí',    icon:'✨', color:'#b2ebf2',
      effects:{ allRegenMul:3.0 },
      desc:'HP và MP regen x3.' },
    { day:23, name:'Thiên Sát',   icon:'💫', color:'#ff6f00',
      effects:{ critRateBonus:0.10, critDmgBonus:0.30 },
      desc:'Crit rate +10%, crit dmg +30%.' },
    { day:24, name:'Tịch Mịch',   icon:'🌙', color:'#37474f',
      effects:{ enemyCountReduced:0.50, qualityDropBonus:true },
      desc:'Ít quái hơn 50% nhưng quality drop tốt hơn.' },
    { day:25, name:'Phục Sinh',   icon:'💚', color:'#4caf50',
      effects:{ fullHealOnLevelUp:true, expBonus:0.20 },
      desc:'Level up hồi đầy HP/MP. EXP +20%.' },
    { day:26, name:'Hắc Ám',     icon:'🌑', color:'#4a148c',
      effects:{ darkBuff:true },
      desc:'Dark element +50%. Map tối hơn nhẹ.' },
    { day:27, name:'Tiên Linh',   icon:'🌟', color:'#e040fb',
      effects:{ realmExpMul:2.0 },
      desc:'Tu Vi nhận được x2.' },
    { day:28, name:'Tận Thế',     icon:'🌋', color:'#b71c1c',
      effects:{ enemyStatBonus:0.50, expMul:5.0 },
      desc:'Quái +50% stat. EXP x5. Sinh tử nhất thế giới.' }
  ],

  celestialNpcItems: [
    { id:'celestialOrb',   price:300 },
    { id:'realmPill',      price:150 },
    { id:'dragonScale',    price:200 },
    { id:'celestialSword', price:2000 },
    { id:'celestialRobe',  price:2000 }
  ]
};

const PROPHECY_CONFIG = {
  maxActive: 2,
  npcSpawnInterval: 7,
  storageKey: 'tuxien_prophecy',

  pool: [
    {
      id:'midnightTreasure',
      text:'"Vào lúc nửa đêm, kho báu sẽ lộ ra..."',
      duration: 24*60*60*1000,
      trigger: 'midnight',
      effect: { spawnChest:true, grade:'gold' }
    },
    {
      id:'immortalFoe',
      text:'"Ngươi sẽ chạm trán kẻ thù bất tử..."',
      duration: 24*60*60*1000,
      trigger: 'nextKill',
      effect: { nextEnemyUndying:true }
    },
    {
      id:'dragonFate',
      text:'"Huyết kiếp với Thần Long chờ đợi..."',
      duration: 7*24*60*60*1000,
      trigger: 'bossKill',
      targetBoss: 'celestialDragon',
      effect: { guaranteedLegendary:true }
    },
    {
      id:'eastTreasure',
      text:'"Linh khí tụ về phương Đông... tìm đến đó..."',
      duration: 48*60*60*1000,
      trigger: 'explore',
      effect: { hiddenItemSpawn:true, corner:'east' }
    },
    {
      id:'luckSmile',
      text:'"Vận may đang mỉm cười với ngươi..."',
      duration: 24*60*60*1000,
      trigger: 'immediate',
      effect: { luckBonus:200, duration:24*60*60*1000 }
    },
    {
      id:'thunderTrial',
      text:'"Thiên lôi sẽ thử thách ngươi trong Bí Cảnh..."',
      duration: 48*60*60*1000,
      trigger: 'dungeon',
      effect: { forceModifier:'thunderStrike' }
    },
    {
      id:'strangersGift',
      text:'"Một người lạ sẽ mang đến tin tốt lành..."',
      duration: 24*60*60*1000,
      trigger: 'nextNpcEvent',
      effect: { npcGiftBonus:true }
    },
    {
      id:'trapWarning',
      text:'"Cẩn thận bẫy rương trong 3 ngày tới..."',
      duration: 3*24*60*60*1000,
      trigger: 'passive',
      effect: { chestTrapImmune:true }
    },
    {
      id:'ancientBeastAwaken',
      text:'"Thần Thú cổ đại đang thức tỉnh gần đây..."',
      duration: 48*60*60*1000,
      trigger: 'bossCombat',
      effect: { ancientBeastSpawn:true }
    },
    {
      id:'soulGrowth',
      text:'"Linh hồn ngươi chuẩn bị bước sang cảnh giới mới..."',
      duration: 24*60*60*1000,
      trigger: 'immediate',
      effect: { realmExpBonus:0.50, duration:24*60*60*1000 }
    }
  ]
};

// ============================================================
// SECTION 2 — CALENDAR SYSTEM
// ============================================================

const CalendarSystem = {
  state: {
    epochStart: null,
    currentCalendarDay: 1,
    lastCheckedDate: null,
    activeEffects: {},
    megaBuff: null,
    megaBuffUsed: false,
    celestialNpcSpawned: false
  },

  _darkAlpha: 0,

  getTodayString() {
    const d = new Date(Date.now());
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  },

  getCurrentDayIndex() {
    const s = this.state;
    if (!s.epochStart) return 0;
    const msSinceEpoch = Date.now() - s.epochStart;
    const daysSince = Math.floor(msSinceEpoch / (24 * 60 * 60 * 1000));
    return daysSince % CALENDAR_CONFIG.cycleDays;
  },

  getCurrentDayData() {
    return CALENDAR_CONFIG.days[this.getCurrentDayIndex()];
  },

  checkDayChange() {
    const today = this.getTodayString();
    const s = this.state;
    if (s.lastCheckedDate === today) return;

    s.lastCheckedDate = today;
    const dayData = this.getCurrentDayData();
    s.currentCalendarDay = dayData.day;
    s.activeEffects = Object.assign({}, dayData.effects);
    s.megaBuffUsed = false;
    s.celestialNpcSpawned = false;

    UI.addLog('📅 ' + dayData.icon + ' ' + dayData.name + ': ' + dayData.desc, 'realm');
    UI.showNotification('📅 Ngày ' + dayData.day + ': ' + dayData.name, dayData.desc);

    this.applyDayEffects(dayData);
    this._updateBadge(dayData);
  },

  applyDayEffects(dayData) {
    const e = dayData.effects;

    // Enemy aggressive
    if (e.enemyAggressive) {
      Enemies.list.forEach(function(enemy) {
        if (enemy.alive) enemy.aggroed = true;
      });
    }

    // Random mega buff (ngày 15)
    if (e.randomMegaBuff && !this.state.megaBuffUsed) {
      const buffs = [
        { name:'Sức Mạnh', atkBonus:0.50, duration:30*60*1000 },
        { name:'Bất Tử',   defBonus:1.0,  duration:30*60*1000 },
        { name:'Học Giả',  expMul:2.0,    duration:30*60*1000 },
        { name:'Tài Lộc',  goldMul:3.0,   duration:30*60*1000 }
      ];
      const picked = buffs[Math.floor(Math.random() * buffs.length)];
      this.state.megaBuff = Object.assign({}, picked, { endTime: Date.now() + picked.duration });
      this.state.megaBuffUsed = true;
      UI.showNotification('⭐ Mega Buff: ' + picked.name + '!', '30 phút');
      UI.addLog('⭐ Mega Buff kích hoạt: ' + picked.name, 'realm');
    }

    // Boss event guaranteed (ngày 14)
    if (e.bossEventGuaranteed && typeof BossEventSystem !== 'undefined') {
      BossEventSystem.forceSpawn();
    }

    // Special NPC (ngày 7)
    if (e.specialNpc) {
      this.spawnCelestialNpc();
    }
  },

  spawnCelestialNpc() {
    if (this.state.celestialNpcSpawned) return;
    NPC.types.celestialElder = {
      name: '✨ Tiên Nhân Thương Khách',
      title: 'Chỉ xuất hiện vào Ngày Tiên Hội',
      sprite: 'npcTeleporter',
      dialog: 'Ta đến từ Tiên Giới. Hàng hóa của ta... không bình thường.',
      service: 'celestialShop'
    };
    const cx = CONFIG.WORLD_WIDTH * CONFIG.TILE_SIZE / 2 + 80;
    const cy = CONFIG.WORLD_HEIGHT * CONFIG.TILE_SIZE / 2;
    NPC.spawn('celestialElder', cx, cy);
    this.state.celestialNpcSpawned = true;
    UI.addLog('✨ Tiên Nhân Thương Khách đã xuất hiện!', 'realm');
  },

  getDayBonus(type) {
    const e = this.state.activeEffects;
    // Mega buff overrides
    const mb = this.state.megaBuff;
    if (mb && Date.now() < mb.endTime) {
      if (type === 'exp'  && mb.expMul)  return mb.expMul;
      if (type === 'gold' && mb.goldMul) return mb.goldMul;
    }
    switch (type) {
      case 'skillDmg':  return e.skillDmgBonus   || 0;
      case 'gold':      return e.goldMul          || 1.0;
      case 'exp':       return e.expMul           || 1.0;
      case 'drop':      return e.dropMul          || 1.0;
      case 'petExp':    return e.petExpMul        || 1.0;
      case 'realmExp':  return e.realmExpMul      || 1.0;
      case 'mpRegen':   return e.mpRegenMul       || 1.0;
      case 'allStat':   return e.allStatBonus     || 0;
      case 'critRate':  return e.critRateBonus    || 0;
      case 'critDmg':   return e.critDmgBonus     || 0;
      case 'mpCostRed': return e.mpCostReduction  || 0;
      default:          return 0;
    }
  },

  getElementBonus(element) {
    return (this.state.activeEffects.elementBonus && this.state.activeEffects.elementBonus[element]) || 0;
  },

  isEffectActive(effectKey) {
    return !!this.state.activeEffects[effectKey];
  },

  update(dt) {
    this.checkDayChange();

    // Mega buff expiry
    if (this.state.megaBuff && Date.now() > this.state.megaBuff.endTime) {
      this.state.megaBuff = null;
      Player.recalculateStats();
      UI.addLog('⭐ Mega buff đã hết.', 'system');
    }

    // Speed debuff ngày 8
    if (this.state.activeEffects.speedDebuff) {
      Player._calendarSpeedDebuff = this.state.activeEffects.speedDebuff;
    } else {
      delete Player._calendarSpeedDebuff;
    }

    // Random element ngày 19
    if (this.state.activeEffects.randomElementEachHit) {
      Player._calendarRandomElement = true;
    } else {
      delete Player._calendarRandomElement;
    }

    // Dark screen ngày 26
    CalendarSystem._darkAlpha = this.state.activeEffects.darkBuff ? 0.15 : 0;

    // Storm visual ngày 9
    if (this.state.activeEffects.stormVisual) {
      if (Math.random() < 0.005) {
        const x = Math.random() * Game.canvas.width;
        for (let i = 0; i < 5; i++) {
          GameState.particles.push({
            x: x + (Math.random() - 0.5) * 30,
            y: Math.random() * Game.canvas.height * 0.5,
            vx: 0, vy: 5 + Math.random() * 3,
            life: 200, color: '#ffeb3b', size: 1 + Math.random()
          });
        }
      }
    }
  },

  _updateBadge(dayData) {
    const nameEl = document.getElementById('calDayName');
    if (nameEl) nameEl.textContent = dayData.icon + ' ' + dayData.name;
    const badge = document.getElementById('calendarBadge');
    if (badge) badge.style.borderColor = dayData.color;
  },

  getSaveData() {
    return {
      epochStart: this.state.epochStart,
      lastCheckedDate: this.state.lastCheckedDate,
      megaBuffUsed: this.state.megaBuffUsed,
      celestialNpcSpawned: this.state.celestialNpcSpawned
    };
  },

  loadSaveData(data) {
    if (!data) return;
    if (data.epochStart)         this.state.epochStart         = data.epochStart;
    if (data.lastCheckedDate)    this.state.lastCheckedDate    = data.lastCheckedDate;
    if (data.megaBuffUsed)       this.state.megaBuffUsed       = data.megaBuffUsed;
    if (data.celestialNpcSpawned) this.state.celestialNpcSpawned = data.celestialNpcSpawned;
  }
};

// ============================================================
// SECTION 3 — PROPHECY SYSTEM
// ============================================================

const ProphecySystem = {
  state: {
    activeProphecies: [],
    lastProphetDate: null,
    npcSpawned: false,
    nextEnemyUndying: false,
    chestTrapImmune: false,
    realmExpBonus: 0,
    luckBonus: 0,
    _midnightFired: false
  },

  rollProphecy() {
    const s = this.state;
    if (s.activeProphecies.length >= PROPHECY_CONFIG.maxActive) {
      UI.addLog('Đã có đủ 2 lời tiên tri.', 'system');
      return null;
    }

    const available = PROPHECY_CONFIG.pool.filter(function(p) {
      return !s.activeProphecies.some(function(a) { return a.prophecyId === p.id; });
    });
    if (available.length === 0) return null;

    const picked = available[Math.floor(Math.random() * available.length)];
    const prophecy = {
      prophecyId: picked.id,
      text: picked.text,
      startTime: Date.now(),
      duration: picked.duration,
      trigger: picked.trigger,
      targetBoss: picked.targetBoss || null,
      effect: Object.assign({}, picked.effect),
      fulfilled: false
    };
    s.activeProphecies.push(prophecy);
    this.applyImmediateEffect(prophecy);

    UI.showNotification('🔮 Lời Tiên Tri!', picked.text);
    UI.addLog('🔮 ' + picked.text, 'realm');
    ProphecyPanel.render();
    return prophecy;
  },

  applyImmediateEffect(prophecy) {
    const e = prophecy.effect;
    if (e.luckBonus && typeof LuckSystem !== 'undefined') {
      LuckSystem.addLuck(e.luckBonus);
    }
    if (e.chestTrapImmune)  this.state.chestTrapImmune  = true;
    if (e.nextEnemyUndying) this.state.nextEnemyUndying = true;
    if (e.realmExpBonus)    this.state.realmExpBonus    = e.realmExpBonus;
  },

  checkExpiry() {
    const now = Date.now();
    this.state.activeProphecies = this.state.activeProphecies.filter(function(p) {
      const expired = (now - p.startTime) > p.duration;
      if (expired && !p.fulfilled) {
        UI.addLog('🔮 Lời tiên tri đã mờ đi...', 'system');
      }
      return !expired;
    });
  },

  onMidnight() {
    const midnightProp = this.state.activeProphecies.find(function(p) {
      return p.trigger === 'midnight' && !p.fulfilled;
    });
    if (!midnightProp) return;

    midnightProp.fulfilled = true;
    const cx = Player.x + 100;
    const cy = Player.y;
    if (typeof RandomEventSystem !== 'undefined') {
      RandomEventSystem.spawnEvent('treasure', cx, cy);
    } else {
      Inventory.add('celestialOrb', 1);
      UI.addLog('🌕 Kho báu tiên tri xuất hiện!', 'item');
    }
    UI.showNotification('🌕 Tiên Tri Ứng Nghiệm!', 'Kho báu nửa đêm xuất hiện!');
  },

  onEnemyKill(enemy) {
    // immortalFoe: kẻ thù bất tử vừa bị kill (đã clear undying flag trước)
    const undyingProp = this.state.activeProphecies.find(function(p) {
      return p.trigger === 'nextKill' && !p.fulfilled && p.effect.nextEnemyUndying;
    });
    if (undyingProp && !this.state.nextEnemyUndying) {
      // đã trigger rồi (flag đã false sau lần áp), mark fulfilled
      undyingProp.fulfilled = true;
    }

    // Boss kill prophecy
    const bossProp = this.state.activeProphecies.find(function(p) {
      return p.trigger === 'bossKill' && !p.fulfilled && p.targetBoss === enemy.type;
    });
    if (bossProp && enemy.boss) {
      bossProp.fulfilled = true;
      const legendaries = ['celestialSword', 'celestialRobe', 'celestialJade'];
      Inventory.add(legendaries[Math.floor(Math.random() * legendaries.length)], 1);
      UI.showNotification('🔮 Tiên Tri Ứng Nghiệm!', 'Legendary drop guaranteed!');
      UI.addLog('🔮 Huyết kiếp ứng nghiệm! Nhận legendary!', 'realm');
    }

    ProphecyPanel.render();
  },

  onEnemiesDamage(enemy) {
    // Undying enemy — không giảm HP xuống dưới 1
    if (enemy._undying && enemy.hp <= 1) {
      enemy.hp = 1;
      if (typeof Game !== 'undefined' && Game.spawnDamageNumber) {
        Game.spawnDamageNumber(enemy.x, enemy.y - 20, 'BẤT TỬ!', '#ffeb3b');
      }
    }
  },

  checkProphetSpawn() {
    if (this.state.npcSpawned) return;
    const now = Date.now();
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    if (!this.state.lastProphetDate || (now - this.state.lastProphetDate) >= weekMs) {
      this.spawnProphetNpc();
    }
  },

  spawnProphetNpc() {
    NPC.types.prophet = {
      name: '🔮 Tiên Tri Sư',
      title: 'Người nhìn thấy tương lai',
      sprite: 'npcTeleporter',
      dialog: 'Ta thấy... nhiều điều kỳ lạ trong số mệnh ngươi...',
      service: 'prophecy'
    };
    const x = CONFIG.WORLD_WIDTH * CONFIG.TILE_SIZE * 0.7;
    const y = CONFIG.WORLD_HEIGHT * CONFIG.TILE_SIZE * 0.3;
    NPC.spawn('prophet', x, y);
    this.state.npcSpawned = true;
    this.state.lastProphetDate = Date.now();
    UI.addLog('🔮 Tiên Tri Sư đã xuất hiện trên bản đồ!', 'realm');
  },

  update(dt) {
    this.checkExpiry();

    // Midnight check
    const now = new Date(Date.now());
    if (now.getHours() === 0 && now.getMinutes() === 0) {
      if (!this.state._midnightFired) {
        this.state._midnightFired = true;
        this.onMidnight();
      }
    } else {
      this.state._midnightFired = false;
    }

    // Undying enemy effect: áp lên Player.target hiện tại
    if (this.state.nextEnemyUndying) {
      if (Player.target && Player.target.alive) {
        Player.target._undying = true;
      }
    }

    this.checkProphetSpawn();
  },

  getSaveData() {
    return {
      activeProphecies: this.state.activeProphecies,
      lastProphetDate: this.state.lastProphetDate,
      nextEnemyUndying: this.state.nextEnemyUndying,
      chestTrapImmune: this.state.chestTrapImmune,
      realmExpBonus: this.state.realmExpBonus
    };
  },

  loadSaveData(data) {
    if (!data) return;
    if (data.activeProphecies) this.state.activeProphecies = data.activeProphecies;
    if (data.lastProphetDate)  this.state.lastProphetDate  = data.lastProphetDate;
    if (data.nextEnemyUndying) this.state.nextEnemyUndying = data.nextEnemyUndying;
    if (data.chestTrapImmune)  this.state.chestTrapImmune  = data.chestTrapImmune;
    if (data.realmExpBonus)    this.state.realmExpBonus     = data.realmExpBonus;
  }
};

// ============================================================
// SECTION 4 — UI PANELS
// ============================================================

const CalendarPanel = {
  open() {
    this.render();
    document.getElementById('calendarOverlay').style.display = 'flex';
  },

  close() {
    document.getElementById('calendarOverlay').style.display = 'none';
  },

  render() {
    const dayIndex    = CalendarSystem.getCurrentDayIndex();
    const dayData     = CalendarSystem.getCurrentDayData();
    const activeEffs  = CalendarSystem.state.activeEffects;

    // Current day highlight
    const currentEl = document.getElementById('calCurrentDay');
    if (currentEl) {
      currentEl.style.borderColor = dayData.color;
      currentEl.style.background  = 'rgba(0,0,0,0.3)';
      currentEl.innerHTML =
        '<div style="font-size:28px;margin-bottom:4px">' + dayData.icon + '</div>' +
        '<div style="font-size:14px;font-weight:bold;color:' + dayData.color + '">' +
          'Ngày ' + dayData.day + ' — ' + dayData.name +
        '</div>' +
        '<div style="font-size:11px;color:#ccc;margin-top:6px">' + dayData.desc + '</div>';
    }

    // 28-day grid
    const grid = document.getElementById('calGrid');
    if (grid) {
      grid.innerHTML = '';
      CALENDAR_CONFIG.days.forEach(function(d, idx) {
        const cell = document.createElement('div');
        const isCurrent = idx === dayIndex;
        cell.style.cssText =
          'text-align:center;padding:4px 2px;border-radius:5px;cursor:default;' +
          'border:1px solid ' + (isCurrent ? d.color : '#333') + ';' +
          'background:' + (isCurrent ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.2)') + ';' +
          'position:relative;';
        cell.title = 'Ngày ' + d.day + ': ' + d.name + '\n' + d.desc;
        cell.innerHTML =
          '<div style="font-size:12px;line-height:1">' + d.icon + '</div>' +
          '<div style="font-size:8px;color:' + (isCurrent ? d.color : '#666') + ';margin-top:1px">' + d.day + '</div>';
        grid.appendChild(cell);
      });
    }

    // Active effects list
    const effEl = document.getElementById('calEffects');
    if (effEl) {
      const upcoming = [];
      for (let i = 1; i <= 3; i++) {
        const idx = (dayIndex + i) % CALENDAR_CONFIG.cycleDays;
        upcoming.push(CALENDAR_CONFIG.days[idx]);
      }

      let html = '<div style="color:#888;font-size:10px;margin-bottom:8px">📆 3 ngày tới:</div>';
      upcoming.forEach(function(ud) {
        html +=
          '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;' +
          'padding:6px;border-radius:6px;background:rgba(255,255,255,0.05);border:1px solid #333">' +
          '<span style="font-size:14px">' + ud.icon + '</span>' +
          '<div>' +
            '<div style="font-size:10px;color:' + ud.color + '">' + ud.name + '</div>' +
            '<div style="font-size:9px;color:#777">' + ud.desc + '</div>' +
          '</div></div>';
      });

      // Mega buff status
      const mb = CalendarSystem.state.megaBuff;
      if (mb && Date.now() < mb.endTime) {
        const rem = Math.ceil((mb.endTime - Date.now()) / 60000);
        html +=
          '<div style="margin-top:8px;padding:6px;border-radius:6px;' +
          'background:rgba(240,192,64,0.15);border:1px solid #f0c040;' +
          'color:#f0c040;font-size:10px">⭐ Mega Buff: ' + (mb.name || '') + ' — ' + rem + ' phút còn lại</div>';
      }

      effEl.innerHTML = html;
    }
  }
};

const ProphecyPanel = {
  open() {
    this.render();
    document.getElementById('prophecyOverlay').style.display = 'flex';
  },

  close() {
    document.getElementById('prophecyOverlay').style.display = 'none';
  },

  render() {
    const listEl = document.getElementById('activeProphecies');
    if (listEl) {
      const prophecies = ProphecySystem.state.activeProphecies;
      if (prophecies.length === 0) {
        listEl.innerHTML =
          '<div style="color:#555;font-size:11px;text-align:center;padding:16px">' +
          '🔮 Chưa có lời tiên tri nào đang hoạt động.</div>';
      } else {
        listEl.innerHTML = '';
        prophecies.forEach(function(p) {
          const now     = Date.now();
          const elapsed = now - p.startTime;
          const pct     = Math.max(0, Math.min(1, 1 - elapsed / p.duration));
          const remMs   = Math.max(0, p.duration - elapsed);
          const remH    = Math.floor(remMs / 3600000);
          const remM    = Math.floor((remMs % 3600000) / 60000);
          const status  = p.fulfilled ? '✅ Ứng Nghiệm' : '🔮 Đang chờ';
          const statusColor = p.fulfilled ? '#4caf50' : '#e040fb';

          const card = document.createElement('div');
          card.style.cssText =
            'background:rgba(224,64,251,0.08);border:1px solid #e040fb44;' +
            'border-radius:8px;padding:10px;margin-bottom:10px';
          card.innerHTML =
            '<div style="font-size:11px;color:#ccc;font-style:italic;margin-bottom:6px">' + p.text + '</div>' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">' +
              '<span style="font-size:10px;color:' + statusColor + '">' + status + '</span>' +
              '<span style="font-size:9px;color:#666">' + remH + 'g ' + remM + 'p còn lại</span>' +
            '</div>' +
            '<div style="background:#222;border-radius:4px;height:4px;overflow:hidden">' +
              '<div style="height:100%;width:' + Math.floor(pct * 100) + '%;' +
              'background:' + (p.fulfilled ? '#4caf50' : '#e040fb') + ';' +
              'border-radius:4px;transition:width 0.5s"></div>' +
            '</div>';
          listEl.appendChild(card);
        });
      }
    }

    // Roll button state
    const btn = document.getElementById('propRollBtn');
    const cdEl = document.getElementById('propCooldown');
    if (btn) {
      const isFull = ProphecySystem.state.activeProphecies.length >= PROPHECY_CONFIG.maxActive;
      const npcUp  = ProphecySystem.state.npcSpawned;
      btn.disabled = isFull || !npcUp;
      btn.style.opacity = (isFull || !npcUp) ? '0.4' : '1';
      btn.style.cursor  = (isFull || !npcUp) ? 'not-allowed' : 'pointer';
    }
    if (cdEl) {
      if (!ProphecySystem.state.npcSpawned) {
        const weekMs = 7 * 24 * 60 * 60 * 1000;
        const last   = ProphecySystem.state.lastProphetDate || 0;
        const remMs  = Math.max(0, weekMs - (Date.now() - last));
        const remD   = Math.floor(remMs / 86400000);
        cdEl.textContent = remD > 0 ? 'Tiên Tri Sư xuất hiện sau ' + remD + ' ngày' : 'Đang chờ Tiên Tri Sư...';
      } else {
        cdEl.textContent = '';
      }
    }
  }
};

// ============================================================
// SECTION 5 — INJECT HTML + STYLES
// ============================================================

function _calendarInjectHTML() {
  // ---- Styles ----
  const style = document.createElement('style');
  style.textContent = [
    '.modal-overlay{',
      'display:none;position:fixed;top:0;left:0;width:100%;height:100%;',
      'background:rgba(0,0,0,0.75);z-index:110;',
      'align-items:center;justify-content:center;',
    '}',
    '.modal-panel{',
      'background:#111;border:2px solid #333;border-radius:12px;',
      'padding:16px;width:90%;max-height:80vh;overflow-y:auto;',
      'font-family:"Courier New",monospace;color:#ccc;',
    '}',
    '.modal-header{',
      'display:flex;justify-content:space-between;align-items:center;',
      'margin-bottom:14px;',
    '}',
    '.modal-title{font-size:14px;font-weight:bold;color:#f0c040;}',
    '.modal-close{',
      'cursor:pointer;color:#888;font-size:16px;padding:2px 6px;',
      'border-radius:4px;border:1px solid #444;',
    '}',
    '.modal-close:hover{color:#fff;border-color:#888;}'
  ].join('');
  document.head.appendChild(style);

  // ---- Calendar Badge ----
  const badge = document.createElement('div');
  badge.id = 'calendarBadge';
  badge.style.cssText =
    'position:fixed;bottom:200px;right:70px;z-index:25;' +
    'background:rgba(0,0,0,0.8);border:2px solid #f0c040;' +
    'border-radius:8px;padding:4px 8px;cursor:pointer;' +
    'font-size:11px;color:#f0c040;font-family:"Courier New",monospace;' +
    'user-select:none;';
  badge.innerHTML = '📅 <span id="calDayName">...</span>';
  badge.addEventListener('click', function() { CalendarPanel.open(); });
  document.body.appendChild(badge);

  // ---- Calendar Overlay ----
  const calOv = document.createElement('div');
  calOv.id = 'calendarOverlay';
  calOv.className = 'modal-overlay';
  calOv.innerHTML =
    '<div class="modal-panel" style="max-width:420px">' +
      '<div class="modal-header">' +
        '<div class="modal-title">📅 Lịch Tiên Giới</div>' +
        '<div id="calClose" class="modal-close">✕</div>' +
      '</div>' +
      '<div id="calCurrentDay" style="background:rgba(240,192,64,0.15);' +
        'border:2px solid #f0c040;border-radius:10px;' +
        'padding:12px;margin-bottom:15px;text-align:center"></div>' +
      '<div id="calGrid" style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px"></div>' +
      '<div id="calEffects" style="margin-top:12px;padding-top:10px;border-top:1px solid #333"></div>' +
    '</div>';
  document.body.appendChild(calOv);
  document.getElementById('calClose').addEventListener('click', function() { CalendarPanel.close(); });
  calOv.addEventListener('click', function(e) { if (e.target === calOv) CalendarPanel.close(); });

  // ---- Prophecy Overlay ----
  const propOv = document.createElement('div');
  propOv.id = 'prophecyOverlay';
  propOv.className = 'modal-overlay';
  propOv.innerHTML =
    '<div class="modal-panel" style="max-width:360px">' +
      '<div class="modal-header">' +
        '<div class="modal-title">🔮 Tiên Tri Sư</div>' +
        '<div id="propClose" class="modal-close">✕</div>' +
      '</div>' +
      '<div id="activeProphecies" style="margin-bottom:15px"></div>' +
      '<button id="propRollBtn" style="width:100%;padding:12px;' +
        'border:2px solid #e040fb;background:rgba(224,64,251,0.15);' +
        'border-radius:8px;color:#e040fb;font-size:13px;' +
        'font-weight:bold;cursor:pointer;font-family:inherit">' +
        '🔮 Nhận Lời Tiên Tri' +
      '</button>' +
      '<div id="propCooldown" style="color:#666;font-size:9px;' +
        'text-align:center;margin-top:6px"></div>' +
    '</div>';
  document.body.appendChild(propOv);

  document.getElementById('propClose').addEventListener('click', function() { ProphecyPanel.close(); });
  propOv.addEventListener('click', function(e) { if (e.target === propOv) ProphecyPanel.close(); });
  document.getElementById('propRollBtn').addEventListener('click', function() {
    ProphecySystem.rollProphecy();
  });
}

// ============================================================
// SECTION 6 — HOOKS & WRAPS
// ============================================================

function _calendarInstallHooks() {

  // --- Hook: Player.recalculateStats ---
  const _origRecalc = Player.recalculateStats.bind(Player);
  Player.recalculateStats = function() {
    _origRecalc();

    // All-stat bonus (ngày 1, mega buff)
    const calBonus = CalendarSystem.getDayBonus('allStat');
    if (calBonus > 0) {
      Player.atk    = Math.floor(Player.atk    * (1 + calBonus));
      Player.def    = Math.floor(Player.def    * (1 + calBonus));
      Player.maxHp  = Math.floor(Player.maxHp  * (1 + calBonus));
      Player.maxMp  = Math.floor(Player.maxMp  * (1 + calBonus));
    }

    // DEF bonus (ngày 18)
    const defB = CalendarSystem.state.activeEffects.defBonus || 0;
    if (defB > 0) {
      Player.def = Math.floor(Player.def * (1 + defB));
    }

    // Crit bonuses
    Player.critRate += CalendarSystem.getDayBonus('critRate');
    Player.critDmg  += CalendarSystem.getDayBonus('critDmg');

    // Speed debuff (ngày 8)
    const speedDebuff = Player._calendarSpeedDebuff || 0;
    if (speedDebuff > 0) Player.speed *= (1 - speedDebuff);

    // MP cost reduction cache
    Player._calendarMpCostRed = CalendarSystem.getDayBonus('mpCostRed');

    // Mega buff: atk/def multiplier
    const mb = CalendarSystem.state.megaBuff;
    if (mb && Date.now() < mb.endTime) {
      if (mb.atkBonus) Player.atk  = Math.floor(Player.atk  * (1 + mb.atkBonus));
      if (mb.defBonus) Player.def  = Math.floor(Player.def  * (1 + mb.defBonus));
    }
  };

  // --- Hook: Player.gainRealmExp ---
  if (typeof Player.gainRealmExp === 'function') {
    const _origGainRealm = Player.gainRealmExp.bind(Player);
    Player.gainRealmExp = function(amount) {
      let mul = CalendarSystem.getDayBonus('realmExp');
      if (mul <= 1) mul = 1;
      // Prophecy soulGrowth
      const propBonus = ProphecySystem.state.realmExpBonus || 0;
      mul *= (1 + propBonus);
      _origGainRealm(Math.floor(amount * mul));
    };
  }

  // --- Hook: Player.useSkill (MP cost reduction) ---
  if (typeof Player.useSkill === 'function') {
    const _origUseSkill = Player.useSkill.bind(Player);
    Player.useSkill = function(skillIndex) {
      const mpRed = Player._calendarMpCostRed || 0;
      if (mpRed > 0 && Player.skills && Player.skills[skillIndex]) {
        const sk = Player.skills[skillIndex];
        const origMp = sk.mp;
        sk.mp = Math.floor(sk.mp * (1 - mpRed));
        _origUseSkill(skillIndex);
        sk.mp = origMp; // restore
      } else {
        _origUseSkill(skillIndex);
      }
    };
  }

  // --- Hook: Enemies.kill (exp/gold multiplier + prophecy kill) ---
  const _origKill = Enemies.kill.bind(Enemies);
  Enemies.kill = function(enemy) {
    // Multiply exp/gold BEFORE _orig processes them
    const expMul  = CalendarSystem.getDayBonus('exp');
    const goldMul = CalendarSystem.getDayBonus('gold');
    // combatExpBonus (ngày 21)
    const combatB = CalendarSystem.state.activeEffects.combatExpBonus || 0;
    const totalExpMul = expMul * (1 + combatB);
    if (totalExpMul > 1 && enemy.exp)  enemy.exp  = Math.floor(enemy.exp  * totalExpMul);
    if (goldMul     > 1 && enemy.gold) enemy.gold = Math.floor(enemy.gold * goldMul);

    // Drop multiplier (ngày 14): mark on enemy for drop logic
    const dropMul = CalendarSystem.getDayBonus('drop');
    if (dropMul > 1) enemy._calendarDropMul = dropMul;

    // fullHealOnLevelUp handled by gainExp hook below
    _origKill(enemy);
    ProphecySystem.onEnemyKill(enemy);

    // Reset undying after first kill
    if (enemy._undying) {
      delete enemy._undying;
      ProphecySystem.state.nextEnemyUndying = false;
    }
  };

  // --- Hook: Player.gainExp (ngày 25 fullHealOnLevelUp) ---
  if (typeof Player.gainExp === 'function') {
    const _origGainExp = Player.gainExp.bind(Player);
    Player.gainExp = function(amount) {
      const levelBefore = Player.level;
      // EXP bonus ngày 25
      const expB = CalendarSystem.state.activeEffects.expBonus || 0;
      _origGainExp(Math.floor(amount * (1 + expB)));
      // Full heal on level up (ngày 25)
      if (Player.level > levelBefore && CalendarSystem.isEffectActive('fullHealOnLevelUp')) {
        Player.hp = Player.maxHp;
        Player.mp = Player.maxMp;
        UI.addLog('💚 Đột phá! HP và MP hồi đầy!', 'realm');
      }
    };
  }

  // --- Hook: Enemies.damage (element bonus + undying check + random element) ---
  const _origDamage = Enemies.damage.bind(Enemies);
  Enemies.damage = function(enemy, amount, isCrit, color, attackElement) {
    // Random element ngày 19
    if (Player._calendarRandomElement) {
      const elements = ['fire', 'ice', 'thunder', 'wind'];
      attackElement = elements[Math.floor(Math.random() * elements.length)];
    }

    // Calendar element bonus
    let finalAmount = amount;
    if (attackElement) {
      const calElBonus = CalendarSystem.getElementBonus(attackElement);
      if (calElBonus > 0) {
        finalAmount = Math.floor(finalAmount * (1 + calElBonus));
      }
    }

    // Dark buff (ngày 26) — treat dark as element
    if (CalendarSystem.isEffectActive('darkBuff') && (!attackElement || attackElement === 'dark')) {
      finalAmount = Math.floor(finalAmount * 1.50);
    }

    _origDamage(enemy, finalAmount, isCrit, color, attackElement);
    ProphecySystem.onEnemiesDamage(enemy);
  };

  // --- Hook: NPC.spawnForMap (reset prophet spawn flag on new map) ---
  const _origSpawnForMap = NPC.spawnForMap.bind(NPC);
  NPC.spawnForMap = function(mapIndex) {
    _origSpawnForMap(mapIndex);
    ProphecySystem.state.npcSpawned = false;
    CalendarSystem.state.celestialNpcSpawned = false;
    // Re-check: spawn prophet if overdue
    ProphecySystem.checkProphetSpawn();
    // Re-spawn celestialElder if today is day 7
    const dayData = CalendarSystem.getCurrentDayData();
    if (dayData.effects.specialNpc) {
      CalendarSystem.spawnCelestialNpc();
    }
  };

  // --- Hook: NPC.interact (prophecy + celestialShop services) ---
  const _origInteract = NPC.interact.bind(NPC);
  NPC.interact = function(npc) {
    if (npc.service === 'prophecy') {
      _origInteract(npc); // show dialog first
      // Append open panel button after dialog renders
      setTimeout(function() {
        const opts = document.getElementById('npcOptions');
        if (!opts) return;
        // Insert prophecy panel button before close
        const btn = document.createElement('div');
        btn.className = 'npc-option';
        btn.innerHTML = '<span>🔮 Xem Lời Tiên Tri</span>';
        btn.addEventListener('click', function() {
          NPC.closeDialog();
          ProphecyPanel.open();
        });
        opts.insertBefore(btn, opts.firstChild);
      }, 0);
      return;
    }

    if (npc.service === 'celestialShop') {
      _origInteract(npc);
      // Override options with celestial shop after dialog renders
      setTimeout(function() {
        const opts = document.getElementById('npcOptions');
        if (!opts) return;
        opts.innerHTML = '';

        const title = document.createElement('div');
        title.style.cssText = 'color:#e040fb;font-size:11px;margin-bottom:10px;font-weight:bold';
        title.textContent = '✨ Hàng Tiên Giới';
        opts.appendChild(title);

        CALENDAR_CONFIG.celestialNpcItems.forEach(function(shopItem) {
          const itemData = ITEMS[shopItem.id];
          if (!itemData) return;
          const canBuy = Player.gold >= shopItem.price;
          const opt = document.createElement('div');
          opt.className = 'npc-option';
          if (!canBuy) opt.classList.add('disabled');
          opt.innerHTML =
            '<span>' + itemData.name + '</span>' +
            '<span class="cost">' + shopItem.price + ' 💰</span>';
          if (canBuy) {
            const id = shopItem.id, price = shopItem.price;
            opt.addEventListener('click', function() {
              NPC.buyItem(id, price);
            });
          }
          opts.appendChild(opt);
        });

        const closeOpt = document.createElement('div');
        closeOpt.className = 'npc-option';
        closeOpt.innerHTML = '<span>👋 Tạm biệt</span>';
        closeOpt.addEventListener('click', function() { NPC.closeDialog(); });
        opts.appendChild(closeOpt);
      }, 0);
      return;
    }

    _origInteract(npc);
  };

  // --- Hook: Game.update (calendar + prophecy update) ---
  const _origGameUpdate = Game.update.bind(Game);
  Game.update = function(dt) {
    _origGameUpdate(dt);
    CalendarSystem.update(dt);
    ProphecySystem.update(dt);
  };

  // --- Hook: Game.render (dark screen overlay after main render) ---
  const _origGameRender = Game.render ? Game.render.bind(Game) : null;
  if (_origGameRender) {
    Game.render = function() {
      _origGameRender();
      if (CalendarSystem._darkAlpha > 0) {
        const ctx = Game.ctx;
        ctx.save();
        ctx.fillStyle = '#000';
        ctx.globalAlpha = CalendarSystem._darkAlpha;
        ctx.fillRect(0, 0, Game.canvas.width, Game.canvas.height);
        ctx.globalAlpha = 1;
        ctx.restore();
      }
    };
  }

  // --- Hook: Game.save ---
  if (typeof Game.save === 'function') {
    const _origSave = Game.save.bind(Game);
    Game.save = function() {
      _origSave();
      try {
        localStorage.setItem(CALENDAR_CONFIG.storageKey,
          JSON.stringify(CalendarSystem.getSaveData()));
        localStorage.setItem(PROPHECY_CONFIG.storageKey,
          JSON.stringify(ProphecySystem.getSaveData()));
      } catch(e) { console.warn('Calendar save error', e); }
    };
  }
}

// ============================================================
// SECTION 7 — INIT
// ============================================================

const CalendarProphecyFeature = {
  init() {
    // Inject UI
    _calendarInjectHTML();

    // Epoch start — set once and never change
    if (!CalendarSystem.state.epochStart) {
      CalendarSystem.state.epochStart = Date.now();
    }

    // Load saved data
    try {
      const calSaved  = localStorage.getItem(CALENDAR_CONFIG.storageKey);
      const propSaved = localStorage.getItem(PROPHECY_CONFIG.storageKey);
      if (calSaved)  CalendarSystem.loadSaveData(JSON.parse(calSaved));
      if (propSaved) ProphecySystem.loadSaveData(JSON.parse(propSaved));
    } catch(e) { console.warn('Calendar load error', e); }

    // Ensure epochStart persisted
    if (!CalendarSystem.state.epochStart) {
      CalendarSystem.state.epochStart = Date.now();
    }

    // Install all hooks
    _calendarInstallHooks();

    // First day check + stat recalc
    CalendarSystem.checkDayChange();
    Player.recalculateStats();

    console.log('📅 Calendar + Prophecy System loaded');
  }
};

// Auto-init: wrap Game.init
(function() {
  const _origGameInit = Game.init.bind(Game);
  Game.init = function() {
    _origGameInit();
    CalendarProphecyFeature.init();
  };
})();
