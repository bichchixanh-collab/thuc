// ==================== FEATURE: STAR RESONANCE ====================
// Tu Tiên Kiếm Hiệp — Star Chart + Pet Resonance System
// Load sau: game.js, player.js, enemies.js, inventory.js, ui.js, config.js
// <script src="js/feature_star_resonance.js"></script>
// =================================================================

// ============================================================
// SECTION 1 — DATA & CONFIG
// ============================================================

const STAR_CHART_CONFIG = {
  storageKey: 'tuxien_star_chart',
  resetFreeOnce: true,      // 1 lần free reset
  resetItemId: 'starResetScroll',

  // Star point earning
  pointsPerLevel: function(level) { return level >= 10 ? 2 : 1; },
  pointsPerRealm: 5,
  pointsPerBossEvent: 2,

  constellations: {
    chien: {
      name: 'Chiến Tinh Cung', icon: '⚔️', color: '#ef5350',
      position: { cx: 0.25, cy: 0.25 },
      nodes: [
        { id:'c1',  name:'Kiếm Khí',        cost:1, requires:[], passive:{ atk:0.02 },
          desc:'+2% ATK', x:0.15, y:0.15 },
        { id:'c2',  name:'Cường Sát',        cost:1, requires:[], passive:{ critRate:0.01 },
          desc:'+1% Crit Rate', x:0.25, y:0.10 },
        { id:'c3',  name:'Chém Liệt',        cost:1, requires:[], passive:{ critDmg:0.05 },
          desc:'+5% Crit Dmg', x:0.35, y:0.15 },
        { id:'c4',  name:'Kiếm Ý',           cost:2, requires:['c1','c2'], passive:{ atk:0.03, critRate:0.01 },
          desc:'+3% ATK, +1% Crit', x:0.18, y:0.22 },
        { id:'c5',  name:'Liệt Phong',       cost:2, requires:['c2','c3'], passive:{ skillDmg:0.05 },
          desc:'+5% Skill Dmg', x:0.30, y:0.20 },
        { id:'c6',  name:'Bạo Liệt',         cost:2, requires:['c3'],      passive:{ critDmg:0.10 },
          desc:'+10% Crit Dmg', x:0.38, y:0.23 },
        { id:'c7',  name:'Thiên Sát Tướng',  cost:3, requires:['c4'], passive:{ atk:0.05 },
          desc:'+5% ATK', x:0.14, y:0.30 },
        { id:'c8',  name:'Kiếm Thần Ý',      cost:3, requires:['c5'], passive:{ skillDmg:0.08, cdReduction:0.05 },
          desc:'+8% Skill Dmg, -5% CD', x:0.26, y:0.28 },
        { id:'c9',  name:'Sát Tinh',          cost:3, requires:['c6'], passive:{ critRate:0.03, critDmg:0.10 },
          desc:'+3% Crit, +10% Crit Dmg', x:0.37, y:0.30 },
        { id:'c10', name:'Kiếm Đạo Ý',       cost:4, requires:['c7','c8'], passive:{ atk:0.08, skillDmg:0.05 },
          desc:'+8% ATK, +5% Skill Dmg', x:0.18, y:0.37 },
        { id:'c11', name:'Liên Hoàn Kiếm',   cost:4, requires:['c8','c9'], passive:{ critRate:0.04, critDmg:0.15 },
          desc:'+4% Crit, +15% Crit Dmg', x:0.32, y:0.36 },
        { id:'c12', name:'Phá Thiên',         cost:4, requires:['c10'], passive:{ atk:0.10 },
          desc:'+10% ATK', x:0.14, y:0.43 },
        { id:'c13', name:'Vạn Kiếm Ý',       cost:5, requires:['c11'], passive:{ skillDmg:0.12 },
          desc:'+12% Skill Dmg', x:0.28, y:0.43 },
        { id:'c14', name:'Sát Thần',          cost:5, requires:['c12'], passive:{ atk:0.05, critRate:0.03, critDmg:0.10 },
          desc:'+5% ATK, +3% Crit, +10% Crit Dmg', x:0.14, y:0.50 },
        { id:'c15', name:'Chiến Thần',        cost:6, requires:['c13','c14'], passive:{ atk:0.15, critRate:0.05 },
          desc:'+15% ATK, +5% Crit Rate', x:0.22, y:0.50, crown:true }
      ]
    },

    thu: {
      name: 'Thủ Tinh Cung', icon: '🛡️', color: '#26a69a',
      position: { cx: 0.75, cy: 0.25 },
      nodes: [
        { id:'t1',  name:'Thiết Bì',          cost:1, requires:[], passive:{ defPct:0.02 },
          desc:'+2% DEF', x:0.65, y:0.15 },
        { id:'t2',  name:'Thép Xương',         cost:1, requires:[], passive:{ maxHpPct:0.02 },
          desc:'+2% MaxHP', x:0.75, y:0.10 },
        { id:'t3',  name:'Cương Thể',          cost:1, requires:[], passive:{ hpRegen:1 },
          desc:'+1 HP/s Regen', x:0.85, y:0.15 },
        { id:'t4',  name:'Vạn Lý Kim',         cost:2, requires:['t1','t2'], passive:{ defPct:0.03, maxHpPct:0.02 },
          desc:'+3% DEF, +2% MaxHP', x:0.68, y:0.22 },
        { id:'t5',  name:'Sinh Mệnh',          cost:2, requires:['t2','t3'], passive:{ maxHpPct:0.04 },
          desc:'+4% MaxHP', x:0.78, y:0.20 },
        { id:'t6',  name:'Hồi Sinh Khí',       cost:2, requires:['t3'],      passive:{ hpRegen:2 },
          desc:'+2 HP/s Regen', x:0.86, y:0.23 },
        { id:'t7',  name:'Đá Bàn Thạch',       cost:3, requires:['t4'], passive:{ defPct:0.05 },
          desc:'+5% DEF', x:0.64, y:0.30 },
        { id:'t8',  name:'Bất Diệt Thể',       cost:3, requires:['t5'], passive:{ maxHpPct:0.06 },
          desc:'+6% MaxHP', x:0.76, y:0.28 },
        { id:'t9',  name:'Linh Tuyền',         cost:3, requires:['t6'], passive:{ hpRegen:3, mpRegen:2 },
          desc:'+3 HP/s, +2 MP/s Regen', x:0.86, y:0.30 },
        { id:'t10', name:'Kim Cang',            cost:4, requires:['t7','t8'], passive:{ defPct:0.08, maxHpPct:0.05 },
          desc:'+8% DEF, +5% MaxHP', x:0.68, y:0.37 },
        { id:'t11', name:'Trường Thọ',          cost:4, requires:['t8','t9'], passive:{ maxHpPct:0.08, hpRegen:2 },
          desc:'+8% MaxHP, +2 HP/s', x:0.80, y:0.36 },
        { id:'t12', name:'Bất Phá',             cost:4, requires:['t10'], passive:{ defPct:0.10 },
          desc:'+10% DEF', x:0.64, y:0.43 },
        { id:'t13', name:'Thọ Thiên',           cost:5, requires:['t11'], passive:{ maxHpPct:0.10 },
          desc:'+10% MaxHP', x:0.78, y:0.43 },
        { id:'t14', name:'Hộ Giáp Thần',       cost:5, requires:['t12'], passive:{ defPct:0.06, dmgReduce:0.05 },
          desc:'+6% DEF, -5% Dmg Taken', x:0.64, y:0.50 },
        { id:'t15', name:'Thép Thần',           cost:6, requires:['t13','t14'], passive:{ defPct:0.15, maxHpPct:0.10 },
          desc:'+15% DEF, +10% MaxHP', x:0.73, y:0.50, crown:true }
      ]
    },

    tri: {
      name: 'Trí Tinh Cung', icon: '🌙', color: '#42a5f5',
      position: { cx: 0.25, cy: 0.75 },
      nodes: [
        { id:'tr1',  name:'Linh Hải',           cost:1, requires:[], passive:{ maxMpPct:0.03 },
          desc:'+3% MaxMP', x:0.15, y:0.65 },
        { id:'tr2',  name:'Thanh Tâm',           cost:1, requires:[], passive:{ cdReduction:0.02 },
          desc:'-2% Cooldown', x:0.25, y:0.60 },
        { id:'tr3',  name:'Tuệ Nhãn',            cost:1, requires:[], passive:{ realmExpBonus:0.05 },
          desc:'+5% Tu Vi', x:0.35, y:0.65 },
        { id:'tr4',  name:'Mênh Mông',           cost:2, requires:['tr1','tr2'], passive:{ maxMpPct:0.04, cdReduction:0.02 },
          desc:'+4% MaxMP, -2% CD', x:0.18, y:0.72 },
        { id:'tr5',  name:'Thông Tuệ',           cost:2, requires:['tr2','tr3'], passive:{ realmExpBonus:0.08 },
          desc:'+8% Tu Vi', x:0.30, y:0.70 },
        { id:'tr6',  name:'Vô Giới',             cost:2, requires:['tr3'],       passive:{ mpCostReduction:0.05 },
          desc:'-5% MP Cost', x:0.38, y:0.72 },
        { id:'tr7',  name:'Linh Lực Đại Hải',   cost:3, requires:['tr4'], passive:{ maxMpPct:0.06 },
          desc:'+6% MaxMP', x:0.14, y:0.78 },
        { id:'tr8',  name:'Thiên Bình',          cost:3, requires:['tr5'], passive:{ realmExpBonus:0.10, cdReduction:0.03 },
          desc:'+10% Tu Vi, -3% CD', x:0.26, y:0.77 },
        { id:'tr9',  name:'Vô Tốn',              cost:3, requires:['tr6'], passive:{ mpCostReduction:0.08 },
          desc:'-8% MP Cost', x:0.37, y:0.78 },
        { id:'tr10', name:'Linh Lực Tiên',       cost:4, requires:['tr7','tr8'], passive:{ maxMpPct:0.10 },
          desc:'+10% MaxMP', x:0.18, y:0.84 },
        { id:'tr11', name:'Thiên Đạo Tâm',       cost:4, requires:['tr8','tr9'], passive:{ realmExpBonus:0.12, cdReduction:0.04 },
          desc:'+12% Tu Vi, -4% CD', x:0.30, y:0.83 },
        { id:'tr12', name:'Không Hao',            cost:4, requires:['tr10'], passive:{ mpCostReduction:0.12 },
          desc:'-12% MP Cost', x:0.14, y:0.89 },
        { id:'tr13', name:'Đỉnh Ngộ',            cost:5, requires:['tr11'], passive:{ realmExpBonus:0.15 },
          desc:'+15% Tu Vi', x:0.28, y:0.89 },
        { id:'tr14', name:'Linh Châu',           cost:5, requires:['tr12'], passive:{ maxMpPct:0.08, mpCostReduction:0.05 },
          desc:'+8% MaxMP, -5% MP Cost', x:0.14, y:0.94 },
        { id:'tr15', name:'Trí Tinh Vương',      cost:6, requires:['tr13','tr14'], passive:{ realmExpBonus:0.20, maxMpPct:0.10 },
          desc:'+20% Tu Vi, +10% MaxMP', x:0.22, y:0.94, crown:true }
      ]
    },

    van: {
      name: 'Vận Tinh Cung', icon: '✨', color: '#ff9800',
      position: { cx: 0.75, cy: 0.75 },
      nodes: [
        { id:'v1',  name:'Hồng Vận',        cost:1, requires:[], passive:{ goldBonus:0.05 },
          desc:'+5% Gold', x:0.65, y:0.65 },
        { id:'v2',  name:'Cát Tinh',         cost:1, requires:[], passive:{ expBonus:0.05 },
          desc:'+5% EXP', x:0.75, y:0.60 },
        { id:'v3',  name:'Phúc Tinh',        cost:1, requires:[], passive:{ dropBonus:0.05 },
          desc:'+5% Drop Rate', x:0.85, y:0.65 },
        { id:'v4',  name:'Tài Lộc',          cost:2, requires:['v1','v2'], passive:{ goldBonus:0.08, expBonus:0.04 },
          desc:'+8% Gold, +4% EXP', x:0.68, y:0.72 },
        { id:'v5',  name:'Vận Khí',          cost:2, requires:['v2','v3'], passive:{ expBonus:0.06, dropBonus:0.04 },
          desc:'+6% EXP, +4% Drop', x:0.78, y:0.70 },
        { id:'v6',  name:'Linh Lộc',         cost:2, requires:['v3'],      passive:{ dropBonus:0.08 },
          desc:'+8% Drop Rate', x:0.86, y:0.72 },
        { id:'v7',  name:'Kim Ngân Sơn',     cost:3, requires:['v4'], passive:{ goldBonus:0.10 },
          desc:'+10% Gold', x:0.64, y:0.78 },
        { id:'v8',  name:'Học Vấn Sao',      cost:3, requires:['v5'], passive:{ expBonus:0.10 },
          desc:'+10% EXP', x:0.76, y:0.77 },
        { id:'v9',  name:'Trân Bảo',         cost:3, requires:['v6'], passive:{ dropBonus:0.10 },
          desc:'+10% Drop Rate', x:0.86, y:0.78 },
        { id:'v10', name:'Vạn Kim',           cost:4, requires:['v7','v8'], passive:{ goldBonus:0.12, expBonus:0.06 },
          desc:'+12% Gold, +6% EXP', x:0.68, y:0.84 },
        { id:'v11', name:'Linh Nghiệm',      cost:4, requires:['v8','v9'], passive:{ expBonus:0.08, dropBonus:0.08 },
          desc:'+8% EXP, +8% Drop', x:0.80, y:0.83 },
        { id:'v12', name:'Kho Báu',           cost:4, requires:['v10'], passive:{ goldBonus:0.15 },
          desc:'+15% Gold', x:0.64, y:0.89 },
        { id:'v13', name:'Đại Vận',           cost:5, requires:['v11'], passive:{ expBonus:0.12, dropBonus:0.10 },
          desc:'+12% EXP, +10% Drop', x:0.78, y:0.89 },
        { id:'v14', name:'Tiên Duyên',        cost:5, requires:['v12'], passive:{ goldBonus:0.10, petStatBonus:0.20 },
          desc:'+10% Gold, +20% Pet Bonus', x:0.64, y:0.94 },
        { id:'v15', name:'Vận Tinh Vương',   cost:6, requires:['v13','v14'], passive:{ goldBonus:0.15, expBonus:0.12, dropBonus:0.12 },
          desc:'+15% Gold, +12% EXP, +12% Drop', x:0.73, y:0.94, crown:true }
      ]
    }
  },

  // 4 Thiên Mệnh Tinh (center nodes)
  centerNodes: [
    { id:'cm1', name:'Thiên Ý Kiếm', cost:15, requires:['c15'],
      passive:{ atk:0.20, skillDmg:0.15 },
      desc:'+20% ATK, +15% Skill Dmg — Thiên Mệnh cấp 1',
      cx: true },
    { id:'cm2', name:'Thiên Ý Thủ',  cost:15, requires:['t15'],
      passive:{ defPct:0.20, maxHpPct:0.15 },
      desc:'+20% DEF, +15% MaxHP — Thiên Mệnh cấp 2',
      cx: true },
    { id:'cm3', name:'Thiên Ý Trí',  cost:15, requires:['tr15'],
      passive:{ realmExpBonus:0.25, mpCostReduction:0.20 },
      desc:'+25% Tu Vi, -20% MP cost — Thiên Mệnh cấp 3',
      cx: true },
    { id:'cm4', name:'Thiên Mệnh Cực Ý', cost:20, requires:['cm1','cm2','cm3','v15'],
      passive:{ allStatBonus:0.10, uniquePassive:'tierlessAttack' },
      desc:'+10% tất cả stat + Passive đặc biệt "Kiếm Thần Nhất Kích"',
      cx: true, ultimate: true }
  ],

  starResetScrollItem: {
    id: 'starResetScroll', name: 'Tinh Hải Cuốn Sách', type: 'consumable', rarity: 'legendary',
    desc: 'Reset toàn bộ Tinh Tú. Hoàn trả 90% Tinh Điểm.',
    effect: { resetStarChart: true }, sellPrice: 1000
  }
};

// ---- Pet Resonance Config ----
const PET_RESONANCE_CONFIG = {
  meterMax: 100,
  meterGainPerSharedHit: 8,
  cooldown: 15000,
  tapTriggerThreshold: 70,

  resonanceSkills: {
    dog: {
      name: 'Sói Hổ Quyết', color: '#c4a484',
      execute: function(target) {
        var dmg = Math.floor(Player.atk * 3.5);
        var targets = Enemies.findInRange(target.x, target.y, 80);
        targets.forEach(function(item) {
          var enemy = item.enemy || item;
          Enemies.damage(enemy,
            Math.floor(dmg * (enemy === target ? 1 : 0.5)),
            Utils.chance(Player.critRate), '#c4a484');
        });
        Game.spawnDamageNumber(target.x, target.y - 50, '🐕💥' + dmg, '#c4a484');
      }
    },
    cat: {
      name: 'Miêu Hổ Song Sát', color: '#ffa500',
      execute: function(target) {
        for (var i = 0; i < 5; i++) {
          (function(idx) {
            setTimeout(function() {
              if (target.alive) {
                var dmg = Math.floor(Player.atk * 1.2);
                Enemies.damage(target, dmg, Utils.chance(Player.critRate + 0.10), '#ffa500');
              }
            }, idx * 120);
          })(i);
        }
        Game.spawnDamageNumber(target.x, target.y - 50, '🐱×5', '#ffa500');
      }
    },
    bird: {
      name: 'Phong Vũ Liên Xạ', color: '#87ceeb',
      execute: function(target) {
        var baseAngle = Utils.angle
          ? Utils.angle(Player.x, Player.y, target.x, target.y)
          : Math.atan2(target.y - Player.y, target.x - Player.x);
        var offsets = [-0.3, 0, 0.3];
        offsets.forEach(function(offset) {
          var angle = baseAngle + offset;
          var range = 200;
          Enemies.list.forEach(function(e) {
            if (!e.alive) return;
            var ea = Math.atan2(e.y - Player.y, e.x - Player.x);
            var dist = Utils.dist(Player.x, Player.y, e.x, e.y);
            var ad = Math.abs(((ea - angle) + Math.PI) % (2 * Math.PI) - Math.PI);
            if (ad < 0.2 && dist <= range) {
              var dmg = Math.floor(Player.atk * 2.0);
              Enemies.damage(e, dmg, Utils.chance(Player.critRate), '#87ceeb');
            }
          });
          // Particle trail
          for (var j = 0; j < 8; j++) {
            GameState.particles.push({
              x: Player.x + Math.cos(angle) * j * 20,
              y: Player.y + Math.sin(angle) * j * 20,
              vx: Math.cos(angle) * 3,
              vy: Math.sin(angle) * 3,
              life: 300, color: '#87ceeb', size: 2 + Math.random() * 2
            });
          }
        });
        Game.spawnDamageNumber(target.x, target.y - 50, '🐦×3 Xạ', '#87ceeb');
      }
    }
  }
};

// ============================================================
// SECTION 2 — STAR CHART SYSTEM
// ============================================================

var StarChartSystem = (function() {
  var state = {
    points: 0,
    totalEarned: 0,
    unlocked: new Set(),
    freeResetUsed: false,
    _allNodes: null
  };

  function getAllNodes() {
    if (state._allNodes) return state._allNodes;
    var nodes = [];
    var consts = STAR_CHART_CONFIG.constellations;
    for (var key in consts) {
      if (consts.hasOwnProperty(key)) {
        consts[key].nodes.forEach(function(n) { nodes.push(n); });
      }
    }
    STAR_CHART_CONFIG.centerNodes.forEach(function(n) { nodes.push(n); });
    state._allNodes = nodes;
    return nodes;
  }

  function canUnlock(nodeId) {
    var node = getAllNodes().find(function(n) { return n.id === nodeId; });
    if (!node) return false;
    if (state.unlocked.has(nodeId)) return false;
    if (state.points < node.cost) return false;
    return (node.requires || []).every(function(reqId) {
      return state.unlocked.has(reqId);
    });
  }

  function unlock(nodeId) {
    if (!canUnlock(nodeId)) return false;
    var node = getAllNodes().find(function(n) { return n.id === nodeId; });
    state.points -= node.cost;
    state.unlocked.add(nodeId);
    Player.recalculateStats();
    if (typeof UI !== 'undefined') {
      UI.addLog('✨ Tinh Tú mở khóa: ' + node.name + ' — ' + node.desc, 'realm');
    }
    StarChartUI.animateUnlock(nodeId);
    StarChartUI.updatePointsDisplay();
    return true;
  }

  function addPoints(amount) {
    state.points += amount;
    state.totalEarned += amount;
    StarChartUI.updatePointsDisplay();
  }

  function reset(free) {
    if (free) {
      if (state.freeResetUsed) {
        if (typeof UI !== 'undefined') UI.addLog('❌ Đã dùng Free Reset rồi!', 'system');
        return false;
      }
    } else {
      if (typeof Inventory === 'undefined' || !Inventory.has('starResetScroll', 1)) {
        if (typeof UI !== 'undefined') UI.addLog('❌ Cần Tinh Hải Cuốn Sách!', 'system');
        return false;
      }
      Inventory.remove('starResetScroll', 1);
    }
    if (free) state.freeResetUsed = true;
    var returnPoints = Math.floor(state.totalEarned * 0.90);
    state.points = returnPoints;
    state.unlocked.clear();
    state._allNodes = null;
    Player.recalculateStats();
    if (typeof UI !== 'undefined') {
      UI.showNotification('🌌 Reset Tinh Tú!', 'Nhận lại ' + returnPoints + ' điểm');
    }
    StarChartUI.updatePointsDisplay();
    StarChartUI.render();
    return true;
  }

  function applyToStats(player) {
    // Clear all previous star bonuses
    Object.keys(player).forEach(function(k) {
      if (k.startsWith('_star')) delete player[k];
    });

    state.unlocked.forEach(function(nodeId) {
      var node = getAllNodes().find(function(n) { return n.id === nodeId; });
      if (!node || !node.passive) return;
      var p = node.passive;

      if (p.atk)             player.atk        = Math.floor(player.atk * (1 + p.atk));
      if (p.defPct)          player.def        = Math.floor(player.def * (1 + p.defPct));
      if (p.critRate)        player.critRate   += p.critRate;
      if (p.critDmg)         player.critDmg    += p.critDmg;
      if (p.maxHpPct) {
        player.maxHp = Math.floor(player.maxHp * (1 + p.maxHpPct));
        player.hp    = Math.min(player.hp, player.maxHp);
      }
      if (p.maxMpPct) {
        player.maxMp = Math.floor(player.maxMp * (1 + p.maxMpPct));
        player.mp    = Math.min(player.mp, player.maxMp);
      }
      if (p.skillDmg)        player._starSkillDmg   = (player._starSkillDmg   || 0) + p.skillDmg;
      if (p.cdReduction)     player._starCdRed      = (player._starCdRed      || 0) + p.cdReduction;
      if (p.realmExpBonus)   player._starRealmExp   = (player._starRealmExp   || 0) + p.realmExpBonus;
      if (p.mpCostReduction) player._starMpCostRed  = (player._starMpCostRed  || 0) + p.mpCostReduction;
      if (p.goldBonus)       player._starGoldBonus  = (player._starGoldBonus  || 0) + p.goldBonus;
      if (p.expBonus)        player._starExpBonus   = (player._starExpBonus   || 0) + p.expBonus;
      if (p.dropBonus)       player._starDropBonus  = (player._starDropBonus  || 0) + p.dropBonus;
      if (p.hpRegen)         player._starHpRegen    = (player._starHpRegen    || 0) + p.hpRegen;
      if (p.mpRegen)         player._starMpRegen    = (player._starMpRegen    || 0) + p.mpRegen;
      if (p.dmgReduce)       player._starDmgReduce  = (player._starDmgReduce  || 0) + p.dmgReduce;
      if (p.petStatBonus)    player._starPetBonus   = (player._starPetBonus   || 0) + p.petStatBonus;
      if (p.allStatBonus) {
        player.atk   = Math.floor(player.atk   * (1 + p.allStatBonus));
        player.def   = Math.floor(player.def   * (1 + p.allStatBonus));
        player.maxHp = Math.floor(player.maxHp * (1 + p.allStatBonus));
        player.maxMp = Math.floor(player.maxMp * (1 + p.allStatBonus));
      }
      if (p.uniquePassive === 'tierlessAttack') player._starUltPassive = true;
    });
  }

  function getSaveData() {
    return {
      points: state.points,
      totalEarned: state.totalEarned,
      unlocked: Array.from(state.unlocked),
      freeResetUsed: state.freeResetUsed
    };
  }

  function loadSaveData(data) {
    if (!data) return;
    state.points       = data.points       || 0;
    state.totalEarned  = data.totalEarned  || 0;
    state.freeResetUsed= data.freeResetUsed|| false;
    state._allNodes    = null;
    state.unlocked     = new Set(data.unlocked || []);
  }

  return {
    state: state,
    getAllNodes: getAllNodes,
    canUnlock: canUnlock,
    unlock: unlock,
    addPoints: addPoints,
    reset: reset,
    applyToStats: applyToStats,
    getSaveData: getSaveData,
    loadSaveData: loadSaveData
  };
})();

// ============================================================
// SECTION 3 — PET RESONANCE SYSTEM
// ============================================================

var PetResonanceSystem = (function() {
  var state = {
    meter: 0,
    cooldownEndTime: 0,
    active: false,
    _lastTargetId: null,
    _playerAttackTimer: 0,
    _petAttackTimer: 0,
    _resonanceEndTime: 0
  };

  function checkSharedHit(target) {
    if (!Player.activePet) return;
    if (typeof GameState === 'undefined') return;
    if (GameState.time < state.cooldownEndTime) return;

    var timeDiff = Math.abs(state._playerAttackTimer - state._petAttackTimer);
    if (timeDiff <= 2000 && state._playerAttackTimer > 0 && state._petAttackTimer > 0) {
      if (Player.target === target || target === state._lastTarget) {
        state.meter = Math.min(PET_RESONANCE_CONFIG.meterMax,
          state.meter + PET_RESONANCE_CONFIG.meterGainPerSharedHit);
        state._lastTarget = target;
        ResonanceMeterHUD.update(state.meter);
        if (state.meter >= PET_RESONANCE_CONFIG.meterMax) {
          triggerResonance();
        }
      }
    }
  }

  function onPlayerAttack(target) {
    if (!Player.activePet) return;
    state._playerAttackTimer = GameState.time;
    checkSharedHit(target);
  }

  function onPetAttack(target) {
    state._petAttackTimer = GameState.time;
    checkSharedHit(target);
  }

  function triggerResonance() {
    if (typeof GameState !== 'undefined' && GameState.time < state.cooldownEndTime) return;
    var target = Player.target;
    if (!target || !target.alive) {
      target = Enemies.findNearest(Player.x, Player.y, 200, function(e) { return e.alive; });
    }
    if (!target) return;

    state.meter = 0;
    state.cooldownEndTime = GameState.time + PET_RESONANCE_CONFIG.cooldown;
    state.active = true;
    state._resonanceEndTime = GameState.time + 2000;

    // Screen flash
    var flashEl = document.createElement('div');
    flashEl.style.cssText = 'position:fixed;inset:0;background:#fff;z-index:998;pointer-events:none;opacity:0.8';
    document.body.appendChild(flashEl);
    var op = 0.8;
    var fade = setInterval(function() {
      op -= 0.08;
      flashEl.style.opacity = op;
      if (op <= 0) { clearInterval(fade); if (flashEl.parentNode) flashEl.remove(); }
    }, 50);

    // Execute pet skill
    var petId = Player.activePet;
    var petSkill = PET_RESONANCE_CONFIG.resonanceSkills[petId];
    if (petSkill) {
      try { petSkill.execute(target); } catch(e) { console.warn('Resonance skill error:', e); }
      if (typeof UI !== 'undefined') {
        UI.showNotification('💥 ' + petSkill.name + '!', 'Cộng Kích Kích Hoạt!');
        UI.addLog('💥 Cộng Kích: ' + petSkill.name, 'realm');
      }
    }

    // Burst particles
    for (var i = 0; i < 25; i++) {
      var a = Math.random() * Math.PI * 2;
      GameState.particles.push({
        x: Player.x + Math.cos(a) * 30,
        y: Player.y + Math.sin(a) * 30,
        vx: Math.cos(a) * 5,
        vy: Math.sin(a) * 5 - 2,
        life: 700, color: '#e040fb', size: 4 + Math.random() * 4
      });
    }

    ResonanceMeterHUD.update(0);
  }

  function update(dt) {
    if (typeof GameState === 'undefined') return;

    // Auto system support: simulate shared hits when auto farming
    if (typeof AutoSystem !== 'undefined' && (AutoSystem.farming || AutoSystem.cultivating)) {
      if (Player.activePet && Player.target && Player.target.alive) {
        state._playerAttackTimer = GameState.time;
        state._petAttackTimer = GameState.time;
        checkSharedHit(Player.target);
      }
    }

    // Deactivate resonance visual
    if (state.active && GameState.time > state._resonanceEndTime) {
      state.active = false;
    }

    // Show/hide resonance meter based on pet presence
    var meterEl = document.getElementById('resonanceMeter');
    if (meterEl) {
      meterEl.style.display = Player.activePet ? 'block' : 'none';
    }

    // Show/hide trigger button
    var triggerBtn = document.getElementById('resonanceTrigger');
    if (triggerBtn) {
      triggerBtn.style.display =
        (state.meter >= PET_RESONANCE_CONFIG.tapTriggerThreshold) ? 'block' : 'none';
    }
  }

  function getSaveData() {
    return { meter: state.meter, cooldownEndTime: state.cooldownEndTime };
  }

  function loadSaveData(data) {
    if (!data) return;
    state.meter = data.meter || 0;
    // Cooldown: don't persist across sessions (reset on load)
    state.cooldownEndTime = 0;
  }

  return {
    state: state,
    onPlayerAttack: onPlayerAttack,
    onPetAttack: onPetAttack,
    checkSharedHit: checkSharedHit,
    triggerResonance: triggerResonance,
    update: update,
    getSaveData: getSaveData,
    loadSaveData: loadSaveData
  };
})();

// ============================================================
// SECTION 4 — UI: RESONANCE METER HUD
// ============================================================

var ResonanceMeterHUD = (function() {
  function inject() {
    if (document.getElementById('resonanceMeter')) return;
    var el = document.createElement('div');
    el.id = 'resonanceMeter';
    el.style.cssText = [
      'position:absolute',
      'bottom:175px',
      'right:25px',
      'z-index:28',
      'width:120px',
      'pointer-events:auto',
      'display:none',
      'user-select:none'
    ].join(';');
    el.innerHTML = [
      '<div style="display:flex;justify-content:space-between;margin-bottom:2px">',
        '<span style="color:#e040fb;font-size:9px;font-family:inherit">💥 Cộng Kích</span>',
        '<span id="resonanceMeterValue" style="color:#aaa;font-size:9px;font-family:inherit">0%</span>',
      '</div>',
      '<div style="height:6px;background:#1a1a2e;border-radius:3px;overflow:hidden;border:1px solid #444">',
        '<div id="resonanceFill" style="height:100%;',
          'background:linear-gradient(90deg,#7c4dff,#e040fb);',
          'border-radius:3px;transition:width 0.2s;width:0%"></div>',
      '</div>',
      '<button id="resonanceTrigger" style="width:100%;margin-top:4px;padding:3px;',
        'border:1px solid #e040fb;background:rgba(224,64,251,0.15);border-radius:4px;',
        'color:#e040fb;font-size:8px;cursor:pointer;display:none;font-family:inherit;',
        'transition:background 0.15s" ',
        'onmouseover="this.style.background=\'rgba(224,64,251,0.35)\'" ',
        'onmouseout="this.style.background=\'rgba(224,64,251,0.15)\'">',
        '⚡ Kích Hoạt Sớm',
      '</button>'
    ].join('');
    document.body.appendChild(el);

    document.getElementById('resonanceTrigger').addEventListener('click', function() {
      if (PetResonanceSystem.state.meter >= PET_RESONANCE_CONFIG.tapTriggerThreshold) {
        PetResonanceSystem.triggerResonance();
      }
    });
  }

  function update(meter) {
    var fillEl = document.getElementById('resonanceFill');
    var valEl  = document.getElementById('resonanceMeterValue');
    var btnEl  = document.getElementById('resonanceTrigger');
    if (!fillEl) return;
    var pct = (meter / PET_RESONANCE_CONFIG.meterMax * 100).toFixed(0);
    fillEl.style.width = pct + '%';
    if (valEl) valEl.textContent = pct + '%';
    if (btnEl) btnEl.style.display =
      (meter >= PET_RESONANCE_CONFIG.tapTriggerThreshold) ? 'block' : 'none';

    // Pulsing glow when near full
    if (fillEl && meter >= PET_RESONANCE_CONFIG.tapTriggerThreshold) {
      fillEl.style.boxShadow = '0 0 6px #e040fb';
    } else if (fillEl) {
      fillEl.style.boxShadow = 'none';
    }
  }

  return { inject: inject, update: update };
})();

// ============================================================
// SECTION 5 — UI: STAR CHART PANEL
// ============================================================

var StarChartUI = (function() {
  var _canvas = null;
  var _ctx    = null;
  var _bgCanvas = null;
  var _bgCtx  = null;
  var _bgStars = [];
  var _animNodes = {};          // nodeId → { alpha, scale, timer }
  var _hoverNodeId = null;
  var _bgAnimFrame = null;

  // ---- Inject HTML ----
  function injectHTML() {
    if (document.getElementById('starChartOverlay')) return;

    var overlay = document.createElement('div');
    overlay.id = 'starChartOverlay';
    overlay.style.cssText = [
      'display:none',
      'position:fixed',
      'inset:0',
      'background:#080818',
      'z-index:110',
      'overflow:hidden',
      'font-family:inherit'
    ].join(';');

    overlay.innerHTML = [
      // Background canvas for stars
      '<canvas id="starBgCanvas" style="position:absolute;inset:0;pointer-events:none"></canvas>',
      // Chart canvas
      '<canvas id="starChartCanvas" style="position:absolute;top:0;left:0;width:100%;height:100%"></canvas>',

      // Title bar
      '<div style="position:absolute;top:10px;left:50%;transform:translateX(-50%);',
        'background:rgba(0,0,0,0.85);border:2px solid #f0c040;border-radius:10px;',
        'padding:6px 20px;text-align:center;z-index:5;pointer-events:none">',
        '<div style="color:#f0c040;font-size:13px;font-weight:bold">🌌 Vũ Trụ Tinh Tú Bàn</div>',
        '<div style="color:#aaa;font-size:10px">',
          'Điểm: <span id="starPoints" style="color:#f0c040;font-weight:bold">0</span> &nbsp;|&nbsp; ',
          'Mở khóa: <span id="starUnlocked" style="color:#4caf50">0</span>/60',
        '</div>',
      '</div>',

      // Reset buttons
      '<div style="position:absolute;top:10px;right:10px;z-index:5;display:flex;gap:6px">',
        '<button id="starFreeReset" style="',
          'padding:5px 10px;background:rgba(0,0,0,0.8);border:1px solid #f0c040;',
          'border-radius:5px;color:#f0c040;font-size:10px;cursor:pointer;font-family:inherit;',
          'transition:background 0.15s" ',
          'onmouseover="this.style.background=\'rgba(240,192,64,0.2)\'" ',
          'onmouseout="this.style.background=\'rgba(0,0,0,0.8)\'">🔄 Free Reset</button>',
        '<button id="starItemReset" style="',
          'padding:5px 10px;background:rgba(0,0,0,0.8);border:1px solid #aaa;',
          'border-radius:5px;color:#ccc;font-size:10px;cursor:pointer;font-family:inherit;',
          'transition:background 0.15s" ',
          'onmouseover="this.style.background=\'rgba(255,255,255,0.1)\'" ',
          'onmouseout="this.style.background=\'rgba(0,0,0,0.8)\'">📜 Reset (Cuốn Sách)</button>',
      '</div>',

      // Close button
      '<div id="starClose" style="position:absolute;top:10px;left:10px;',
        'color:#888;font-size:24px;cursor:pointer;z-index:5;',
        'width:32px;height:32px;display:flex;align-items:center;justify-content:center;',
        'border-radius:50%;transition:background 0.15s;font-weight:bold" ',
        'onmouseover="this.style.background=\'rgba(255,255,255,0.1)\'" ',
        'onmouseout="this.style.background=\'transparent\'">✕</div>',

      // Tooltip
      '<div id="starTooltip" style="display:none;position:absolute;',
        'background:rgba(8,8,24,0.95);border:2px solid #f0c040;border-radius:8px;',
        'padding:8px 12px;font-size:10px;pointer-events:none;z-index:10;',
        'min-width:160px;max-width:220px;box-shadow:0 0 12px rgba(240,192,64,0.3)">',
        '<div id="starTipName" style="color:#f0c040;font-weight:bold;font-size:12px;margin-bottom:4px"></div>',
        '<div id="starTipDesc" style="color:#ccc;margin-bottom:4px;line-height:1.4"></div>',
        '<div id="starTipCost" style="color:#ff9800;margin-bottom:2px"></div>',
        '<div id="starTipReq"  style="color:#f44336;font-size:9px"></div>',
        '<div id="starTipStatus" style="margin-top:4px;font-size:9px"></div>',
      '</div>',

      // Legend
      '<div style="position:absolute;bottom:10px;left:50%;transform:translateX(-50%);',
        'background:rgba(0,0,0,0.7);border:1px solid #333;border-radius:6px;',
        'padding:6px 12px;display:flex;gap:14px;z-index:5;pointer-events:none">',
        '<span style="color:#4caf50;font-size:9px">● Đã mở</span>',
        '<span style="color:#f0c040;font-size:9px">● Có thể mở</span>',
        '<span style="color:#555;font-size:9px">● Chưa đủ điều kiện</span>',
        '<span style="color:#e040fb;font-size:9px">★ Thiên Mệnh</span>',
      '</div>'
    ].join('');

    document.body.appendChild(overlay);

    // Event listeners
    document.getElementById('starClose').addEventListener('click', close);
    document.getElementById('starFreeReset').addEventListener('click', function() {
      if (StarChartSystem.state.freeResetUsed) {
        if (typeof UI !== 'undefined') UI.addLog('❌ Đã dùng Free Reset rồi!', 'system');
        return;
      }
      if (confirm('Free Reset lần đầu? Nhận lại 90% điểm, mất toàn bộ Tinh Tú đã mở!')) {
        StarChartSystem.reset(true);
      }
    });
    document.getElementById('starItemReset').addEventListener('click', function() {
      if (!Inventory.has('starResetScroll', 1)) {
        if (typeof UI !== 'undefined') UI.addLog('❌ Cần Tinh Hải Cuốn Sách!', 'system');
        return;
      }
      if (confirm('Reset bằng Tinh Hải Cuốn Sách? Nhận lại 90% điểm!')) {
        StarChartSystem.reset(false);
      }
    });

    // Canvas setup
    _canvas   = document.getElementById('starChartCanvas');
    _bgCanvas = document.getElementById('starBgCanvas');

    // Resize canvases to window
    function resizeCanvases() {
      _canvas.width   = window.innerWidth;
      _canvas.height  = window.innerHeight;
      _bgCanvas.width  = window.innerWidth;
      _bgCanvas.height = window.innerHeight;
      generateBgStars();
      render();
    }
    window.addEventListener('resize', resizeCanvases);
    resizeCanvases();

    _ctx   = _canvas.getContext('2d');
    _bgCtx = _bgCanvas.getContext('2d');

    // Click and hover on chart canvas
    _canvas.addEventListener('click', onCanvasClick);
    _canvas.addEventListener('mousemove', onCanvasHover);
    _canvas.addEventListener('mouseleave', function() {
      _hoverNodeId = null;
      document.getElementById('starTooltip').style.display = 'none';
      render();
    });

    // Touch support
    _canvas.addEventListener('touchend', function(e) {
      e.preventDefault();
      var t = e.changedTouches[0];
      onCanvasClick({ clientX: t.clientX, clientY: t.clientY });
    }, { passive: false });
  }

  // ---- Generate background star field ----
  function generateBgStars() {
    _bgStars = [];
    var count = Math.floor((_bgCanvas.width * _bgCanvas.height) / 2000);
    for (var i = 0; i < count; i++) {
      _bgStars.push({
        x: Math.random() * _bgCanvas.width,
        y: Math.random() * _bgCanvas.height,
        r: 0.5 + Math.random() * 1.5,
        alpha: 0.2 + Math.random() * 0.6,
        twinkleSpeed: 0.5 + Math.random() * 1.5,
        twinkleOffset: Math.random() * Math.PI * 2
      });
    }
  }

  // ---- Animate background star field ----
  function animateBg() {
    if (!_bgCtx || !_bgCanvas) return;
    _bgCtx.clearRect(0, 0, _bgCanvas.width, _bgCanvas.height);
    var t = Date.now() / 1000;
    _bgStars.forEach(function(s) {
      var alpha = s.alpha * (0.6 + 0.4 * Math.sin(t * s.twinkleSpeed + s.twinkleOffset));
      _bgCtx.save();
      _bgCtx.globalAlpha = alpha;
      _bgCtx.fillStyle = '#ffffff';
      _bgCtx.beginPath();
      _bgCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      _bgCtx.fill();
      _bgCtx.restore();
    });
    _bgAnimFrame = requestAnimationFrame(animateBg);
  }

  // ---- Node world coordinates ----
  function nodeToScreen(node) {
    if (!_canvas) return { x: 0, y: 0 };
    var padding = 60;
    var w = _canvas.width  - padding * 2;
    var h = _canvas.height - padding * 2;
    return {
      x: padding + node.x * w,
      y: padding + node.y * h
    };
  }

  // ---- Render the star chart ----
  function render() {
    if (!_ctx || !_canvas) return;
    var ctx = _ctx;
    ctx.clearRect(0, 0, _canvas.width, _canvas.height);

    var allNodes = StarChartSystem.getAllNodes();

    // ---- Draw connection lines ----
    allNodes.forEach(function(node) {
      if (!node.requires || node.requires.length === 0) return;
      var toPos = nodeToScreen(node);
      node.requires.forEach(function(reqId) {
        var reqNode = allNodes.find(function(n) { return n.id === reqId; });
        if (!reqNode) return;
        var fromPos = nodeToScreen(reqNode);

        var bothUnlocked = StarChartSystem.state.unlocked.has(node.id) &&
                           StarChartSystem.state.unlocked.has(reqId);
        var reqUnlocked  = StarChartSystem.state.unlocked.has(reqId);

        ctx.save();
        if (bothUnlocked) {
          ctx.strokeStyle = '#f0c040';
          ctx.globalAlpha = 0.7;
          ctx.lineWidth = 2;
          ctx.shadowColor = '#f0c040';
          ctx.shadowBlur = 4;
        } else if (reqUnlocked) {
          ctx.strokeStyle = '#888844';
          ctx.globalAlpha = 0.5;
          ctx.lineWidth = 1;
        } else {
          ctx.strokeStyle = '#333355';
          ctx.globalAlpha = 0.3;
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
        }
        ctx.beginPath();
        ctx.moveTo(fromPos.x, fromPos.y);
        ctx.lineTo(toPos.x, toPos.y);
        ctx.stroke();
        ctx.restore();
      });
    });

    // ---- Draw nodes ----
    allNodes.forEach(function(node) {
      drawNode(ctx, node);
    });

    // ---- Draw constellation labels ----
    var consts = STAR_CHART_CONFIG.constellations;
    for (var key in consts) {
      if (!consts.hasOwnProperty(key)) continue;
      var cung = consts[key];
      // Find center of this constellation nodes
      var nodes = cung.nodes;
      var avgX = 0, avgY = 0;
      nodes.forEach(function(n) { avgX += n.x; avgY += n.y; });
      avgX /= nodes.length; avgY /= nodes.length;
      var lPos = nodeToScreen({ x: avgX, y: avgY - 0.055 });

      ctx.save();
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = cung.color;
      ctx.globalAlpha = 0.85;
      ctx.shadowColor = cung.color;
      ctx.shadowBlur = 8;
      ctx.fillText(cung.icon + ' ' + cung.name, lPos.x, lPos.y);
      ctx.restore();
    }

    // ---- Draw "Thiên Mệnh" center label ----
    var centerX = _canvas.width  / 2;
    var centerY = _canvas.height / 2;
    ctx.save();
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#e040fb';
    ctx.globalAlpha = 0.7;
    ctx.shadowColor = '#e040fb';
    ctx.shadowBlur = 10;
    ctx.fillText('⭐ Thiên Mệnh Tinh ⭐', centerX, centerY - 12);
    ctx.restore();

    updatePointsDisplay();
  }

  // ---- Draw a single node ----
  function drawNode(ctx, node) {
    var pos = nodeToScreen(node);
    var unlocked  = StarChartSystem.state.unlocked.has(node.id);
    var available = StarChartSystem.canUnlock(node.id);
    var hovered   = (_hoverNodeId === node.id);
    var animData  = _animNodes[node.id];

    // Node size
    var baseR = node.crown ? 14 : (node.ultimate ? 16 : 10);
    if (node.cx && !node.crown && !node.ultimate) baseR = 12;
    var r = baseR;

    // Scale animation on unlock
    if (animData && animData.scale > 1) {
      r = baseR * animData.scale;
      animData.scale = Math.max(1, animData.scale - 0.02);
    }

    // Hover expand
    if (hovered) r = baseR * 1.3;

    // Determine color
    var color, glowColor, glowBlur;
    if (node.ultimate) {
      color = unlocked ? '#e040fb' : (available ? 'rgba(224,64,251,0.4)' : '#333');
      glowColor = '#e040fb'; glowBlur = unlocked ? 18 : 6;
    } else if (node.crown) {
      color = unlocked ? '#f0c040' : (available ? 'rgba(240,192,64,0.4)' : '#332');
      glowColor = '#f0c040'; glowBlur = unlocked ? 14 : 5;
    } else if (node.cx) {
      color = unlocked ? '#e040fb' : (available ? 'rgba(224,64,251,0.3)' : '#222');
      glowColor = '#e040fb'; glowBlur = unlocked ? 12 : 4;
    } else {
      // Cung color
      var cungColor = '#888';
      var consts = STAR_CHART_CONFIG.constellations;
      for (var k in consts) {
        if (!consts.hasOwnProperty(k)) continue;
        if (consts[k].nodes.some(function(n) { return n.id === node.id; })) {
          cungColor = consts[k].color;
          break;
        }
      }
      if (unlocked) {
        color = cungColor; glowColor = cungColor; glowBlur = 10;
      } else if (available) {
        color = cungColor + '88'; glowColor = cungColor; glowBlur = 5;
      } else {
        color = '#2a2a3a'; glowColor = '#444'; glowBlur = 0;
      }
    }

    ctx.save();

    // Glow
    if (glowBlur > 0) {
      ctx.shadowColor = glowColor;
      ctx.shadowBlur  = glowBlur;
    }

    // Outer ring for crown/ultimate
    if (node.crown || node.ultimate) {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, r + 3, 0, Math.PI * 2);
      ctx.strokeStyle = node.ultimate ? '#e040fb' : '#f0c040';
      ctx.globalAlpha = unlocked ? 0.8 : 0.3;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Main circle
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    // Inner shine
    if (unlocked) {
      ctx.beginPath();
      ctx.arc(pos.x - r * 0.25, pos.y - r * 0.25, r * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.fill();
    }

    // Hover ring
    if (hovered && !unlocked) {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, r + 2, 0, Math.PI * 2);
      ctx.strokeStyle = '#fff';
      ctx.globalAlpha = 0.4;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Node label (short)
    ctx.shadowBlur = 0;
    ctx.font = (node.crown || node.ultimate ? 'bold 8px' : '7px') + ' sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = unlocked ? '#fff' : (available ? '#ccc' : '#666');
    ctx.globalAlpha = 1;
    // Shorten name to first word
    var shortName = node.name.split(' ')[0];
    ctx.fillText(shortName, pos.x, pos.y + r + 10);

    // Cost badge
    if (!unlocked) {
      ctx.font = 'bold 8px sans-serif';
      ctx.fillStyle = available ? '#ff9800' : '#555';
      ctx.fillText('★' + node.cost, pos.x, pos.y + r + 19);
    } else {
      ctx.font = '9px sans-serif';
      ctx.fillStyle = '#4caf50';
      ctx.fillText('✓', pos.x, pos.y);
    }

    ctx.restore();
  }

  // ---- Canvas click → unlock ----
  function onCanvasClick(e) {
    if (!_canvas) return;
    var rect = _canvas.getBoundingClientRect();
    var mx = e.clientX - rect.left;
    var my = e.clientY - rect.top;

    var allNodes = StarChartSystem.getAllNodes();
    var hitNode = null;
    var hitDist = 999;

    allNodes.forEach(function(node) {
      var pos = nodeToScreen(node);
      var r = node.crown ? 14 : (node.ultimate ? 16 : 10);
      var d = Math.sqrt((mx - pos.x) * (mx - pos.x) + (my - pos.y) * (my - pos.y));
      if (d <= r + 8 && d < hitDist) {
        hitDist = d;
        hitNode = node;
      }
    });

    if (hitNode) {
      if (StarChartSystem.state.unlocked.has(hitNode.id)) {
        // Already unlocked — show info
        showTooltip(hitNode, e.clientX, e.clientY);
      } else {
        StarChartSystem.unlock(hitNode.id);
        render();
      }
    } else {
      document.getElementById('starTooltip').style.display = 'none';
    }
  }

  // ---- Canvas hover → tooltip ----
  function onCanvasHover(e) {
    if (!_canvas) return;
    var rect = _canvas.getBoundingClientRect();
    var mx = e.clientX - rect.left;
    var my = e.clientY - rect.top;

    var allNodes = StarChartSystem.getAllNodes();
    var hitNode = null;
    var hitDist = 999;

    allNodes.forEach(function(node) {
      var pos = nodeToScreen(node);
      var r = node.crown ? 14 : (node.ultimate ? 16 : 10);
      var d = Math.sqrt((mx - pos.x) * (mx - pos.x) + (my - pos.y) * (my - pos.y));
      if (d <= r + 12 && d < hitDist) {
        hitDist = d;
        hitNode = node;
      }
    });

    var prevHover = _hoverNodeId;
    _hoverNodeId = hitNode ? hitNode.id : null;
    if (prevHover !== _hoverNodeId) render();

    if (hitNode) {
      showTooltip(hitNode, e.clientX, e.clientY);
    } else {
      document.getElementById('starTooltip').style.display = 'none';
    }
  }

  // ---- Show tooltip ----
  function showTooltip(node, mx, my) {
    var tip = document.getElementById('starTooltip');
    if (!tip) return;
    document.getElementById('starTipName').textContent = node.name;
    document.getElementById('starTipDesc').textContent = node.desc || '';
    document.getElementById('starTipCost').textContent = '★ Chi phí: ' + node.cost + ' Tinh Điểm';

    var reqEl = document.getElementById('starTipReq');
    if (node.requires && node.requires.length > 0) {
      var allNodes = StarChartSystem.getAllNodes();
      var unmetReqs = node.requires.filter(function(reqId) {
        return !StarChartSystem.state.unlocked.has(reqId);
      }).map(function(reqId) {
        var req = allNodes.find(function(n) { return n.id === reqId; });
        return req ? req.name : reqId;
      });
      reqEl.textContent = unmetReqs.length > 0
        ? '⚠ Cần mở: ' + unmetReqs.join(', ')
        : '';
    } else {
      reqEl.textContent = '';
    }

    var statusEl = document.getElementById('starTipStatus');
    if (StarChartSystem.state.unlocked.has(node.id)) {
      statusEl.innerHTML = '<span style="color:#4caf50">✓ Đã mở khóa</span>';
    } else if (StarChartSystem.canUnlock(node.id)) {
      statusEl.innerHTML = '<span style="color:#f0c040">⬆ Click để mở khóa</span>';
    } else {
      var pts = StarChartSystem.state.points;
      if (pts < node.cost) {
        statusEl.innerHTML = '<span style="color:#f44336">✗ Thiếu ' + (node.cost - pts) + ' điểm</span>';
      } else {
        statusEl.innerHTML = '<span style="color:#f44336">✗ Chưa đủ điều kiện</span>';
      }
    }

    tip.style.display = 'block';

    // Position
    var tipW = 220, tipH = 120;
    var left = mx + 14;
    var top  = my - 10;
    if (left + tipW > window.innerWidth)  left = mx - tipW - 14;
    if (top  + tipH > window.innerHeight) top  = window.innerHeight - tipH - 10;
    tip.style.left = left + 'px';
    tip.style.top  = top  + 'px';
  }

  // ---- Animate unlock (twinkle) ----
  function animateUnlock(nodeId) {
    _animNodes[nodeId] = { scale: 1.6, alpha: 1 };
    // Spawn particles
    var allNodes = StarChartSystem.getAllNodes();
    var node = allNodes.find(function(n) { return n.id === nodeId; });
    if (!node || typeof GameState === 'undefined') return;
    // We don't have world coords here, just add a notification burst
    for (var i = 0; i < 10; i++) {
      var a = Math.random() * Math.PI * 2;
      GameState.particles.push({
        x: Player.x + Math.cos(a) * 20,
        y: Player.y + Math.sin(a) * 20,
        vx: Math.cos(a) * 3,
        vy: Math.sin(a) * 3 - 1,
        life: 500, color: '#f0c040', size: 2 + Math.random() * 3
      });
    }
    // Re-render after short delay
    setTimeout(function() { render(); }, 200);
  }

  // ---- Update points display ----
  function updatePointsDisplay() {
    var ptEl = document.getElementById('starPoints');
    var ulEl = document.getElementById('starUnlocked');
    if (ptEl) ptEl.textContent = StarChartSystem.state.points;
    if (ulEl) ulEl.textContent = StarChartSystem.state.unlocked.size;
  }

  // ---- Open / Close ----
  function open() {
    var overlay = document.getElementById('starChartOverlay');
    if (!overlay) return;
    overlay.style.display = 'block';
    render();
    animateBg();
  }

  function close() {
    var overlay = document.getElementById('starChartOverlay');
    if (overlay) overlay.style.display = 'none';
    if (_bgAnimFrame) {
      cancelAnimationFrame(_bgAnimFrame);
      _bgAnimFrame = null;
    }
  }

  return {
    inject: injectHTML,
    open: open,
    close: close,
    render: render,
    animateUnlock: animateUnlock,
    updatePointsDisplay: updatePointsDisplay
  };
})();

// ============================================================
// SECTION 6 — HOOKS (monkey-patch existing systems)
// ============================================================

// ---- Hook: Player.recalculateStats → apply star chart + pet bonus ----
function _starHookRecalculateStats() {
  var _orig = Player.recalculateStats.bind(Player);
  Player.recalculateStats = function() {
    _orig();

    // Apply star chart bonuses
    StarChartSystem.applyToStats(Player);

    // Pet stat bonus from Vận Tinh Cung v14 (petStatBonus)
    if (Player._starPetBonus && Player.activePet && typeof PETS !== 'undefined' && PETS[Player.activePet]) {
      var pet = PETS[Player.activePet];
      if (pet.bonus.atk)   Player.atk   += Math.floor(pet.bonus.atk   * Player._starPetBonus);
      if (pet.bonus.def)   Player.def   += Math.floor(pet.bonus.def   * Player._starPetBonus);
      if (pet.bonus.speed) Player.speed += pet.bonus.speed * Player._starPetBonus;
    }
  };
}

// ---- Hook: Player.gainExp → detect level up → add star points ----
function _starHookGainExp() {
  if (typeof Player.gainExp !== 'function') return;
  var _orig = Player.gainExp.bind(Player);
  var _prevLevel = Player.level;
  Player.gainExp = function(amount) {
    _prevLevel = Player.level;
    _orig(amount);
    if (Player.level > _prevLevel) {
      var pts = STAR_CHART_CONFIG.pointsPerLevel(Player.level);
      StarChartSystem.addPoints(pts);
      if (typeof UI !== 'undefined') {
        UI.addLog('🌟 +' + pts + ' Tinh Điểm (Thăng cấp)', 'realm');
      }
      _prevLevel = Player.level;
    }
  };
}

// ---- Hook: Player.gainRealmExp → detect realm breakthrough → add star points ----
function _starHookGainRealmExp() {
  if (typeof Player.gainRealmExp !== 'function') return;
  var _orig = Player.gainRealmExp.bind(Player);
  Player.gainRealmExp = function(amount) {
    // Apply star realm exp bonus
    var bonus = Player._starRealmExp || 0;
    var finalAmount = Math.floor(amount * (1 + bonus));
    var _prevRealm = Player.realm;
    _orig(finalAmount);
    if (Player.realm > _prevRealm) {
      var pts = STAR_CHART_CONFIG.pointsPerRealm;
      StarChartSystem.addPoints(pts);
      if (typeof UI !== 'undefined') {
        UI.addLog('🌟 +' + pts + ' Tinh Điểm (Đột phá cảnh giới!)', 'realm');
      }
    }
  };
}

// ---- Hook: Enemies.kill → star gold/exp/drop bonuses + resonance tracking ----
function _starHookEnemiesKill() {
  if (typeof Enemies.kill !== 'function') return;
  var _orig = Enemies.kill.bind(Enemies);
  Enemies.kill = function(enemy) {
    // Apply star chart bonuses before kill processing
    if (Player._starGoldBonus && enemy.gold) {
      enemy.gold = Math.floor(enemy.gold * (1 + Player._starGoldBonus));
    }
    if (Player._starExpBonus && enemy.exp) {
      enemy.exp = Math.floor(enemy.exp * (1 + Player._starExpBonus));
    }
    if (Player._starDropBonus && enemy.drops) {
      enemy.drops = enemy.drops.map(function(d) {
        return Object.assign({}, d, { chance: Math.min(1, d.chance * (1 + Player._starDropBonus)) });
      });
    }
    _orig(enemy);
    // Track for boss event star points
    if (enemy.boss) {
      StarChartSystem.addPoints(STAR_CHART_CONFIG.pointsPerBossEvent);
      if (typeof UI !== 'undefined') {
        UI.addLog('🌟 +' + STAR_CHART_CONFIG.pointsPerBossEvent + ' Tinh Điểm (Tiêu diệt Boss!)', 'realm');
      }
    }
  };
}

// ---- Hook: Inventory.useItem → handle star reset scroll ----
function _starHookInventoryUseItem() {
  if (typeof Inventory.useItem !== 'function') return;
  var _orig = Inventory.useItem.bind(Inventory);
  Inventory.useItem = function(itemId) {
    var itemData = ITEMS[itemId];
    if (itemData && itemData.effect && itemData.effect.resetStarChart) {
      Inventory.remove(itemId, 1);
      StarChartSystem.reset(false);
      if (typeof Inventory.render === 'function') Inventory.render();
      return true;
    }
    return _orig(itemId);
  };
}

// ---- Hook: Player.useSkill → resonance player attack track ----
function _starHookPlayerUseSkill() {
  if (typeof Player.useSkill !== 'function') return;
  var _origUseSkill = Player.useSkill.bind(Player);
  Player.useSkill = function(idx) {
    // Apply CD reduction from star chart
    if (Player._starCdRed && this.skills && this.skills[idx]) {
      var skill = this.skills[idx];
      var origMaxCd = skill.maxCd;
      skill.maxCd = Math.floor(origMaxCd * (1 - Math.min(0.5, Player._starCdRed)));
    }
    // Apply MP cost reduction
    if (Player._starMpCostRed && this.skills && this.skills[idx]) {
      var skill2 = this.skills[idx];
      var origMp = skill2.mp;
      skill2.mp = Math.floor(origMp * (1 - Math.min(0.5, Player._starMpCostRed)));
    }
    var result = _origUseSkill(idx);
    if (result && Player.target) {
      PetResonanceSystem.onPlayerAttack(Player.target);
    }
    return result;
  };
}

// ---- Hook: Game.update → pet resonance update + star HP/MP regen ----
function _starHookGameUpdate() {
  var _orig = Game.update.bind(Game);
  Game.update = function(dt) {
    _orig(dt);
    if (!GameState.running) return;

    // Pet Resonance update
    PetResonanceSystem.update(dt);

    // Star chart HP/MP regen (per second)
    if (Player.alive) {
      if (Player._starHpRegen) {
        Player.hp = Math.min(Player.maxHp, Player.hp + Player._starHpRegen * dt / 1000);
      }
      if (Player._starMpRegen) {
        Player.mp = Math.min(Player.maxMp, Player.mp + Player._starMpRegen * dt / 1000);
      }
      // Damage reduction from Thủ Tinh Cung
      // Applied via Player.takeDamage hook below
    }
  };
}

// ---- Hook: Player.takeDamage → apply dmgReduce from star chart ----
function _starHookPlayerTakeDamage() {
  if (typeof Player.takeDamage !== 'function') return;
  var _orig = Player.takeDamage.bind(Player);
  Player.takeDamage = function(amount, source) {
    var finalAmount = amount;
    if (Player._starDmgReduce) {
      finalAmount = Math.floor(finalAmount * (1 - Math.min(0.5, Player._starDmgReduce)));
    }
    _orig(finalAmount, source);
  };
}

// ---- Hook: Avatar frame click → open Star Chart ----
function _starHookAvatarClick() {
  // Try avatar frame / avatar canvas
  var tryBind = function() {
    var avatarEls = [
      document.getElementById('avatarFrame'),
      document.getElementById('avatarCanvas'),
      document.querySelector('.avatar-frame'),
      document.querySelector('#playerInfo')
    ];
    avatarEls.forEach(function(el) {
      if (el && !el._starChartBound) {
        el._starChartBound = true;
        el.addEventListener('click', function(e) {
          // Don't interfere if other panel is opening
          StarChartUI.open();
        });
        el.style.cursor = 'pointer';
        el.title = '🌌 Mở Tinh Tú Bàn';
      }
    });
  };
  // Try immediately and after DOM ready
  tryBind();
  setTimeout(tryBind, 1000);
  setTimeout(tryBind, 3000);
}

// ---- Hook: Game.save → persist star data ----
function _starHookGameSave() {
  if (typeof Game.save !== 'function') return;
  var _orig = Game.save.bind(Game);
  Game.save = function() {
    _orig();
    try {
      var data = {
        starChart: StarChartSystem.getSaveData(),
        petResonance: PetResonanceSystem.getSaveData()
      };
      localStorage.setItem(STAR_CHART_CONFIG.storageKey, JSON.stringify(data));
    } catch(e) {
      console.warn('Star Resonance save error:', e);
    }
  };
}

// ---- Hook: Game.load → restore star data ----
function _starHookGameLoad() {
  if (typeof Game.load !== 'function') return;
  var _orig = Game.load.bind(Game);
  Game.load = function() {
    _orig();
    _starLoadData();
  };
}

function _starLoadData() {
  try {
    var raw = localStorage.getItem(STAR_CHART_CONFIG.storageKey);
    if (!raw) return;
    var data = JSON.parse(raw);
    if (data.starChart)     StarChartSystem.loadSaveData(data.starChart);
    if (data.petResonance)  PetResonanceSystem.loadSaveData(data.petResonance);
    Player.recalculateStats();
    StarChartUI.updatePointsDisplay();
    if (Player.activePet) {
      var meterEl = document.getElementById('resonanceMeter');
      if (meterEl) meterEl.style.display = 'block';
      ResonanceMeterHUD.update(PetResonanceSystem.state.meter);
    }
  } catch(e) {
    console.warn('Star Resonance load error:', e);
  }
}

// ---- Hook: Game.init → inject UI and load data ----
function _starHookGameInit() {
  var _orig = Game.init.bind(Game);
  Game.init = function() {
    _orig();
    StarResonanceFeature.init();
  };
}

// ============================================================
// SECTION 7 — MASTER INIT
// ============================================================

var StarResonanceFeature = {
  init: function() {
    // Register star reset scroll in ITEMS
    if (typeof ITEMS !== 'undefined') {
      ITEMS.starResetScroll = STAR_CHART_CONFIG.starResetScrollItem;
    }

    // Inject HTML elements
    StarChartUI.inject();
    ResonanceMeterHUD.inject();

    // Inject CSS
    _starInjectCSS();

    // Load saved data
    _starLoadData();

    // Recalculate stats with star bonuses
    Player.recalculateStats();

    // Show resonance meter if player has a pet
    if (Player.activePet) {
      var meterEl = document.getElementById('resonanceMeter');
      if (meterEl) meterEl.style.display = 'block';
      ResonanceMeterHUD.update(PetResonanceSystem.state.meter);
    }

    // Add Star Chart button to UI (top bar or menu)
    _starInjectMenuButton();

    console.log('🌌 Star Resonance Feature initialized (StarChart + PetResonance)');
  }
};

function _starInjectCSS() {
  if (document.getElementById('star-resonance-style')) return;
  var style = document.createElement('style');
  style.id = 'star-resonance-style';
  style.textContent = [
    '/* Star Resonance Feature */',
    '#starChartOverlay * { box-sizing: border-box; }',
    '#starChartCanvas { cursor: crosshair; }',
    '@keyframes starPulse {',
    '  0%,100% { box-shadow: 0 0 6px #e040fb; }',
    '  50%      { box-shadow: 0 0 16px #e040fb, 0 0 32px #7c4dff; }',
    '}',
    '#resonanceFill.full { animation: starPulse 0.8s ease-in-out infinite; }',
    '.star-resonance-notif {',
    '  position:fixed; top:50%; left:50%; transform:translate(-50%,-50%);',
    '  color:#e040fb; font-size:28px; font-weight:bold; pointer-events:none;',
    '  z-index:999; text-shadow: 0 0 12px #e040fb;',
    '  animation: starNotifFade 2s forwards;',
    '}',
    '@keyframes starNotifFade {',
    '  0%   { opacity:1; transform:translate(-50%,-50%) scale(1); }',
    '  70%  { opacity:1; transform:translate(-50%,-80%) scale(1.1); }',
    '  100% { opacity:0; transform:translate(-50%,-100%) scale(0.9); }',
    '}',
    '#starMenuBtn {',
    '  background:rgba(0,0,0,0.8); border:1px solid #f0c040;',
    '  border-radius:6px; color:#f0c040; font-size:11px;',
    '  padding:4px 8px; cursor:pointer; font-family:inherit;',
    '  transition:background 0.15s, box-shadow 0.15s;',
    '}',
    '#starMenuBtn:hover {',
    '  background:rgba(240,192,64,0.2);',
    '  box-shadow: 0 0 8px rgba(240,192,64,0.4);',
    '}'
  ].join('\n');
  document.head.appendChild(style);
}

function _starInjectMenuButton() {
  if (document.getElementById('starMenuBtn')) return;
  // Try to find top menu bar
  var menuBar = document.querySelector('.top-bar, #topBar, .menu-bar, #menuBar, .hud-top');
  if (!menuBar) {
    // Fallback: create floating button
    var floatBtn = document.createElement('button');
    floatBtn.id = 'starMenuBtn';
    floatBtn.style.cssText = [
      'position:fixed',
      'top:10px',
      'left:50%',
      'transform:translateX(-50%) translateX(120px)',
      'z-index:30',
      'padding:4px 10px',
      'background:rgba(0,0,0,0.85)',
      'border:1px solid #f0c040',
      'border-radius:6px',
      'color:#f0c040',
      'font-size:11px',
      'cursor:pointer',
      'font-family:inherit'
    ].join(';');
    floatBtn.textContent = '🌌 Tinh Tú';
    floatBtn.addEventListener('click', function() { StarChartUI.open(); });
    document.body.appendChild(floatBtn);
  } else {
    var btn = document.createElement('button');
    btn.id = 'starMenuBtn';
    btn.textContent = '🌌 Tinh Tú';
    btn.addEventListener('click', function() { StarChartUI.open(); });
    menuBar.appendChild(btn);
  }
}

// ============================================================
// SECTION 8 — INSTALL HOOKS (before Game.init fires)
// ============================================================

(function installStarResonanceHooks() {
  // Core stat hooks
  _starHookRecalculateStats();
  _starHookGainExp();
  _starHookGainRealmExp();
  _starHookEnemiesKill();
  _starHookInventoryUseItem();
  _starHookPlayerUseSkill();
  _starHookPlayerTakeDamage();

  // Game lifecycle hooks
  _starHookGameUpdate();
  _starHookGameSave();
  _starHookGameLoad();
  _starHookGameInit();

  // Avatar click hook (deferred so DOM is ready)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _starHookAvatarClick);
  } else {
    _starHookAvatarClick();
  }
})();

console.log('🌌 Star Resonance loaded (Star Chart 60 nodes + Pet Resonance) — add <script src="js/feature_star_resonance.js"></script> to index.html');
