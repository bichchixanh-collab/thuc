// ==================== STAR RESONANCE FEATURE ====================
// feature_star_resonance.js
// StarChartSystem + PetResonanceSystem + UI
// Monkey-patch only — không sửa file gốc
// <script src="js/feature_star_resonance.js"></script> (sau game.js)

// ================================================================
// SECTION 1 — DATA & CONFIG
// ================================================================

const STAR_CHART_CONFIG = {
  storageKey: 'tuxien_star_chart',
  resetFreeOnce: true,
  resetItemId: 'starResetScroll',

  pointsPerLevel: function(level) { return level >= 10 ? 2 : 1; },
  pointsPerRealm: 5,
  pointsPerBossEvent: 2,

  constellations: {
    chien: {
      name: 'Chiến Tinh Cung', icon: '⚔️', color: '#ef5350',
      position: { cx: 0.25, cy: 0.25 },
      nodes: [
        { id:'c1',  name:'Kiếm Khí',          cost:1, requires:[],         passive:{ atk:0.02 },                           desc:'+2% ATK',                           x:0.15, y:0.15 },
        { id:'c2',  name:'Cường Sát',          cost:1, requires:[],         passive:{ critRate:0.01 },                      desc:'+1% Crit Rate',                      x:0.25, y:0.10 },
        { id:'c3',  name:'Chém Liệt',          cost:1, requires:[],         passive:{ critDmg:0.05 },                       desc:'+5% Crit Dmg',                       x:0.35, y:0.15 },
        { id:'c4',  name:'Kiếm Ý',             cost:2, requires:['c1','c2'],passive:{ atk:0.03, critRate:0.01 },            desc:'+3% ATK, +1% Crit',                  x:0.18, y:0.22 },
        { id:'c5',  name:'Liệt Phong',         cost:2, requires:['c2','c3'],passive:{ skillDmg:0.05 },                     desc:'+5% Skill Dmg',                      x:0.30, y:0.20 },
        { id:'c6',  name:'Bạo Liệt',           cost:2, requires:['c3'],     passive:{ critDmg:0.10 },                      desc:'+10% Crit Dmg',                      x:0.38, y:0.23 },
        { id:'c7',  name:'Thiên Sát Tướng',    cost:3, requires:['c4'],     passive:{ atk:0.05 },                          desc:'+5% ATK',                            x:0.14, y:0.30 },
        { id:'c8',  name:'Kiếm Thần Ý',        cost:3, requires:['c5'],     passive:{ skillDmg:0.08, cdReduction:0.05 },   desc:'+8% Skill Dmg, -5% CD',             x:0.26, y:0.28 },
        { id:'c9',  name:'Sát Tinh',           cost:3, requires:['c6'],     passive:{ critRate:0.03, critDmg:0.10 },       desc:'+3% Crit, +10% Crit Dmg',           x:0.37, y:0.30 },
        { id:'c10', name:'Kiếm Đạo Ý',         cost:4, requires:['c7','c8'],passive:{ atk:0.08, skillDmg:0.05 },           desc:'+8% ATK, +5% Skill Dmg',             x:0.18, y:0.37 },
        { id:'c11', name:'Liên Hoàn Kiếm',     cost:4, requires:['c8','c9'],passive:{ critRate:0.04, critDmg:0.15 },       desc:'+4% Crit, +15% Crit Dmg',           x:0.32, y:0.36 },
        { id:'c12', name:'Phá Thiên',          cost:4, requires:['c10'],    passive:{ atk:0.10 },                          desc:'+10% ATK',                           x:0.14, y:0.43 },
        { id:'c13', name:'Vạn Kiếm Ý',        cost:5, requires:['c11'],    passive:{ skillDmg:0.12 },                     desc:'+12% Skill Dmg',                     x:0.28, y:0.43 },
        { id:'c14', name:'Sát Thần',           cost:5, requires:['c12'],    passive:{ atk:0.05, critRate:0.03, critDmg:0.10 }, desc:'+5% ATK, +3% Crit, +10% Crit Dmg', x:0.14, y:0.50 },
        { id:'c15', name:'Chiến Thần',         cost:6, requires:['c13','c14'],passive:{ atk:0.15, critRate:0.05 },         desc:'+15% ATK, +5% Crit Rate',           x:0.22, y:0.50, crown:true }
      ]
    },

    thu: {
      name: 'Thủ Tinh Cung', icon: '🛡️', color: '#26a69a',
      position: { cx: 0.75, cy: 0.25 },
      nodes: [
        { id:'t1',  name:'Thiết Bì',           cost:1, requires:[],         passive:{ defPct:0.02 },                       desc:'+2% DEF',                            x:0.65, y:0.15 },
        { id:'t2',  name:'Thép Xương',         cost:1, requires:[],         passive:{ maxHpPct:0.02 },                     desc:'+2% MaxHP',                          x:0.75, y:0.10 },
        { id:'t3',  name:'Cương Thể',          cost:1, requires:[],         passive:{ hpRegen:1 },                         desc:'+1 HP Regen/s',                      x:0.85, y:0.15 },
        { id:'t4',  name:'Vạn Lý Kim',         cost:2, requires:['t1','t2'],passive:{ defPct:0.03, maxHpPct:0.02 },        desc:'+3% DEF, +2% MaxHP',                 x:0.68, y:0.22 },
        { id:'t5',  name:'Sinh Mệnh',          cost:2, requires:['t2','t3'],passive:{ maxHpPct:0.04 },                     desc:'+4% MaxHP',                          x:0.78, y:0.20 },
        { id:'t6',  name:'Hồi Sinh Khí',       cost:2, requires:['t3'],     passive:{ hpRegen:2 },                         desc:'+2 HP Regen/s',                      x:0.86, y:0.23 },
        { id:'t7',  name:'Đá Bàn Thạch',       cost:3, requires:['t4'],     passive:{ defPct:0.05 },                       desc:'+5% DEF',                            x:0.64, y:0.30 },
        { id:'t8',  name:'Bất Diệt Thể',       cost:3, requires:['t5'],     passive:{ maxHpPct:0.06 },                     desc:'+6% MaxHP',                          x:0.76, y:0.28 },
        { id:'t9',  name:'Linh Tuyền',         cost:3, requires:['t6'],     passive:{ hpRegen:3, mpRegen:2 },              desc:'+3 HP +2 MP Regen/s',                x:0.86, y:0.30 },
        { id:'t10', name:'Kim Cang',           cost:4, requires:['t7','t8'],passive:{ defPct:0.08, maxHpPct:0.05 },        desc:'+8% DEF, +5% MaxHP',                 x:0.68, y:0.37 },
        { id:'t11', name:'Trường Thọ',         cost:4, requires:['t8','t9'],passive:{ maxHpPct:0.08, hpRegen:2 },          desc:'+8% MaxHP, +2 HP Regen/s',           x:0.80, y:0.36 },
        { id:'t12', name:'Bất Phá',            cost:4, requires:['t10'],    passive:{ defPct:0.10 },                       desc:'+10% DEF',                           x:0.64, y:0.43 },
        { id:'t13', name:'Thọ Thiên',          cost:5, requires:['t11'],    passive:{ maxHpPct:0.10 },                     desc:'+10% MaxHP',                         x:0.78, y:0.43 },
        { id:'t14', name:'Hộ Giáp Thần',       cost:5, requires:['t12'],    passive:{ defPct:0.06, dmgReduce:0.05 },       desc:'+6% DEF, -5% Dmg Taken',            x:0.64, y:0.50 },
        { id:'t15', name:'Thép Thần',          cost:6, requires:['t13','t14'],passive:{ defPct:0.15, maxHpPct:0.10 },      desc:'+15% DEF, +10% MaxHP',              x:0.73, y:0.50, crown:true }
      ]
    },

    tri: {
      name: 'Trí Tinh Cung', icon: '🌙', color: '#42a5f5',
      position: { cx: 0.25, cy: 0.75 },
      nodes: [
        { id:'tr1',  name:'Linh Hải',          cost:1, requires:[],           passive:{ maxMpPct:0.03 },                       desc:'+3% MaxMP',                          x:0.15, y:0.65 },
        { id:'tr2',  name:'Thanh Tâm',         cost:1, requires:[],           passive:{ cdReduction:0.02 },                    desc:'-2% Cooldown',                       x:0.25, y:0.60 },
        { id:'tr3',  name:'Tuệ Nhãn',          cost:1, requires:[],           passive:{ realmExpBonus:0.05 },                  desc:'+5% Tu Vi',                          x:0.35, y:0.65 },
        { id:'tr4',  name:'Mênh Mông',         cost:2, requires:['tr1','tr2'],passive:{ maxMpPct:0.04, cdReduction:0.02 },     desc:'+4% MaxMP, -2% CD',                 x:0.18, y:0.72 },
        { id:'tr5',  name:'Thông Tuệ',         cost:2, requires:['tr2','tr3'],passive:{ realmExpBonus:0.08 },                  desc:'+8% Tu Vi',                          x:0.30, y:0.70 },
        { id:'tr6',  name:'Vô Giới',           cost:2, requires:['tr3'],      passive:{ mpCostReduction:0.05 },                desc:'-5% MP Cost',                        x:0.38, y:0.72 },
        { id:'tr7',  name:'Linh Lực Đại Hải',  cost:3, requires:['tr4'],      passive:{ maxMpPct:0.06 },                       desc:'+6% MaxMP',                          x:0.14, y:0.78 },
        { id:'tr8',  name:'Thiên Bình',        cost:3, requires:['tr5'],      passive:{ realmExpBonus:0.10, cdReduction:0.03 },desc:'+10% Tu Vi, -3% CD',                x:0.26, y:0.77 },
        { id:'tr9',  name:'Vô Tốn',            cost:3, requires:['tr6'],      passive:{ mpCostReduction:0.08 },                desc:'-8% MP Cost',                        x:0.37, y:0.78 },
        { id:'tr10', name:'Linh Lực Tiên',     cost:4, requires:['tr7','tr8'],passive:{ maxMpPct:0.10 },                       desc:'+10% MaxMP',                         x:0.18, y:0.84 },
        { id:'tr11', name:'Thiên Đạo Tâm',     cost:4, requires:['tr8','tr9'],passive:{ realmExpBonus:0.12, cdReduction:0.04 },desc:'+12% Tu Vi, -4% CD',                x:0.30, y:0.83 },
        { id:'tr12', name:'Không Hao',         cost:4, requires:['tr10'],     passive:{ mpCostReduction:0.12 },                desc:'-12% MP Cost',                       x:0.14, y:0.89 },
        { id:'tr13', name:'Đỉnh Ngộ',          cost:5, requires:['tr11'],     passive:{ realmExpBonus:0.15 },                  desc:'+15% Tu Vi',                         x:0.28, y:0.89 },
        { id:'tr14', name:'Linh Châu',         cost:5, requires:['tr12'],     passive:{ maxMpPct:0.08, mpCostReduction:0.05 }, desc:'+8% MaxMP, -5% MP Cost',            x:0.14, y:0.94 },
        { id:'tr15', name:'Trí Tinh Vương',    cost:6, requires:['tr13','tr14'],passive:{ realmExpBonus:0.20, maxMpPct:0.10 }, desc:'+20% Tu Vi, +10% MaxMP',            x:0.22, y:0.94, crown:true }
      ]
    },

    van: {
      name: 'Vận Tinh Cung', icon: '✨', color: '#ff9800',
      position: { cx: 0.75, cy: 0.75 },
      nodes: [
        { id:'v1',  name:'Hồng Vận',           cost:1, requires:[],         passive:{ goldBonus:0.05 },                     desc:'+5% Vàng',                           x:0.65, y:0.65 },
        { id:'v2',  name:'Cát Tinh',           cost:1, requires:[],         passive:{ expBonus:0.05 },                      desc:'+5% EXP',                            x:0.75, y:0.60 },
        { id:'v3',  name:'Phúc Tinh',          cost:1, requires:[],         passive:{ dropBonus:0.05 },                     desc:'+5% Drop',                           x:0.85, y:0.65 },
        { id:'v4',  name:'Tài Lộc',            cost:2, requires:['v1','v2'],passive:{ goldBonus:0.08, expBonus:0.04 },       desc:'+8% Vàng, +4% EXP',                 x:0.68, y:0.72 },
        { id:'v5',  name:'Vận Khí',            cost:2, requires:['v2','v3'],passive:{ expBonus:0.06, dropBonus:0.04 },       desc:'+6% EXP, +4% Drop',                 x:0.78, y:0.70 },
        { id:'v6',  name:'Linh Lộc',           cost:2, requires:['v3'],     passive:{ dropBonus:0.08 },                     desc:'+8% Drop',                           x:0.86, y:0.72 },
        { id:'v7',  name:'Kim Ngân Sơn',       cost:3, requires:['v4'],     passive:{ goldBonus:0.10 },                     desc:'+10% Vàng',                          x:0.64, y:0.78 },
        { id:'v8',  name:'Học Vấn Sao',        cost:3, requires:['v5'],     passive:{ expBonus:0.10 },                      desc:'+10% EXP',                           x:0.76, y:0.77 },
        { id:'v9',  name:'Trân Bảo',           cost:3, requires:['v6'],     passive:{ dropBonus:0.10 },                     desc:'+10% Drop',                          x:0.86, y:0.78 },
        { id:'v10', name:'Vạn Kim',            cost:4, requires:['v7','v8'],passive:{ goldBonus:0.12, expBonus:0.06 },       desc:'+12% Vàng, +6% EXP',                x:0.68, y:0.84 },
        { id:'v11', name:'Linh Nghiệm',        cost:4, requires:['v8','v9'],passive:{ expBonus:0.08, dropBonus:0.08 },       desc:'+8% EXP, +8% Drop',                 x:0.80, y:0.83 },
        { id:'v12', name:'Kho Báu',            cost:4, requires:['v10'],    passive:{ goldBonus:0.15 },                     desc:'+15% Vàng',                          x:0.64, y:0.89 },
        { id:'v13', name:'Đại Vận',            cost:5, requires:['v11'],    passive:{ expBonus:0.12, dropBonus:0.10 },       desc:'+12% EXP, +10% Drop',               x:0.78, y:0.89 },
        { id:'v14', name:'Tiên Duyên',         cost:5, requires:['v12'],    passive:{ goldBonus:0.10, petStatBonus:0.20 },  desc:'+10% Vàng, +20% Pet Stat',          x:0.64, y:0.94 },
        { id:'v15', name:'Vận Tinh Vương',     cost:6, requires:['v13','v14'],passive:{ goldBonus:0.15, expBonus:0.12, dropBonus:0.12 }, desc:'+15% Vàng, +12% EXP, +12% Drop', x:0.73, y:0.94, crown:true }
      ]
    }
  },

  centerNodes: [
    { id:'cm1', name:'Thiên Ý Kiếm',   cost:15, requires:['c15'],
      passive:{ atk:0.20, skillDmg:0.15 },
      desc:'+20% ATK, +15% Skill Dmg — Thiên Mệnh cấp 1' },
    { id:'cm2', name:'Thiên Ý Thủ',    cost:15, requires:['t15'],
      passive:{ defPct:0.20, maxHpPct:0.15 },
      desc:'+20% DEF, +15% MaxHP — Thiên Mệnh cấp 2' },
    { id:'cm3', name:'Thiên Ý Trí',    cost:15, requires:['tr15'],
      passive:{ realmExpBonus:0.25, mpCostReduction:0.20 },
      desc:'+25% Tu Vi, -20% MP cost — Thiên Mệnh cấp 3' },
    { id:'cm4', name:'Thiên Mệnh Cực Ý', cost:20, requires:['cm1','cm2','cm3','v15'],
      passive:{ allStatBonus:0.10, uniquePassive:'tierlessAttack' },
      desc:'+10% tất cả stat + Kiếm Thần Nhất Kích', ultimate:true }
  ],

  starResetScrollItem: {
    id:'starResetScroll', name:'Tinh Hải Cuốn Sách', type:'consumable', rarity:'legendary',
    desc:'Reset toàn bộ Tinh Tú. Hoàn trả 90% Tinh Điểm.',
    effect:{ resetStarChart:true }, sellPrice:1000
  }
};

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
          var enemy = item.enemy;
          Enemies.damage(enemy, Math.floor(dmg * (enemy === target ? 1 : 0.5)),
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
        var baseAngle = Math.atan2(target.y - Player.y, target.x - Player.x);
        [-0.3, 0, 0.3].forEach(function(offset) {
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

// ================================================================
// SECTION 2 — STAR CHART SYSTEM
// ================================================================

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
    return (node.requires || []).every(function(reqId) { return state.unlocked.has(reqId); });
  }

  function unlock(nodeId) {
    if (!canUnlock(nodeId)) return false;
    var node = getAllNodes().find(function(n) { return n.id === nodeId; });
    state.points -= node.cost;
    state.unlocked.add(nodeId);
    Player.recalculateStats();
    UI.addLog('✨ Tinh Tú mở khóa: ' + node.name + ' — ' + node.desc, 'realm');
    StarChartUI.animateUnlock(nodeId);
    StarChartUI.render();
    StarChartUI.updatePointsDisplay();
    return true;
  }

  function addPoints(amount) {
    state.points += amount;
    state.totalEarned += amount;
    StarChartUI.updatePointsDisplay();
  }

  function reset(isFree) {
    if (!isFree && !Inventory.has('starResetScroll', 1)) {
      UI.addLog('❌ Cần Tinh Hải Cuốn Sách!', 'system');
      return false;
    }
    if (!isFree) {
      Inventory.remove('starResetScroll', 1);
    } else {
      if (state.freeResetUsed) {
        UI.addLog('❌ Đã dùng Free Reset!', 'system');
        return false;
      }
      state.freeResetUsed = true;
    }
    var returnPoints = Math.floor(state.totalEarned * 0.90);
    state.points = returnPoints;
    state.totalEarned = returnPoints;
    state.unlocked.clear();
    state._allNodes = null;
    Player.recalculateStats();
    UI.showNotification('🌌 Reset Tinh Tú!', 'Nhận lại ' + returnPoints + ' điểm');
    StarChartUI.render();
    StarChartUI.updatePointsDisplay();
    return true;
  }

  function applyToStats(player) {
    // Clear previous star bonuses
    var keys = Object.keys(player);
    for (var i = 0; i < keys.length; i++) {
      if (keys[i].indexOf('_star') === 0) {
        delete player[keys[i]];
      }
    }

    state.unlocked.forEach(function(nodeId) {
      var node = getAllNodes().find(function(n) { return n.id === nodeId; });
      if (!node || !node.passive) return;
      var p = node.passive;

      if (p.atk)             player.atk       = Math.floor(player.atk * (1 + p.atk));
      if (p.defPct)          player.def        = Math.floor(player.def * (1 + p.defPct));
      if (p.critRate)        player.critRate  += p.critRate;
      if (p.critDmg)         player.critDmg   += p.critDmg;
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
    state.points      = data.points      || 0;
    state.totalEarned = data.totalEarned || 0;
    state.freeResetUsed = data.freeResetUsed || false;
    state.unlocked    = new Set(data.unlocked || []);
    state._allNodes   = null;
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

// ================================================================
// SECTION 3 — PET RESONANCE SYSTEM
// ================================================================

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
    if (GameState.time < state.cooldownEndTime + PET_RESONANCE_CONFIG.cooldown) return;
    var timeDiff = Math.abs(state._playerAttackTimer - state._petAttackTimer);
    if (timeDiff <= 2000 && state._playerAttackTimer > 0 && state._petAttackTimer > 0) {
      if (Player.target === target || target) {
        state.meter = Math.min(PET_RESONANCE_CONFIG.meterMax,
          state.meter + PET_RESONANCE_CONFIG.meterGainPerSharedHit);
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
    if (GameState.time < state.cooldownEndTime) return;
    var target = Player.target ||
      (Enemies ? Enemies.findNearest(Player.x, Player.y, 200, function(e) { return e.alive; }) : null);
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
      flashEl.style.opacity = Math.max(0, op);
      if (op <= 0) { clearInterval(fade); flashEl.remove(); }
    }, 50);

    // Execute pet skill
    var petSkill = PET_RESONANCE_CONFIG.resonanceSkills[Player.activePet];
    if (petSkill) {
      try { petSkill.execute(target); } catch(e) { console.error('Resonance skill error:', e); }
      UI.showNotification('💥 ' + petSkill.name + '!', 'Cộng Kích Kích Hoạt!');
      UI.addLog('💥 Cộng Kích: ' + petSkill.name, 'realm');
    }

    // Particles burst
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
    // Auto resonance tracking
    if (typeof AutoSystem !== 'undefined' && AutoSystem.active) {
      if (Player.activePet && Player.target && Player.target.alive) {
        state._playerAttackTimer = GameState.time;
        state._petAttackTimer    = GameState.time;
        checkSharedHit(Player.target);
      }
    }
    // Deactivate visual
    if (state.active && GameState.time > state._resonanceEndTime) {
      state.active = false;
    }
    // Show/hide meter based on pet
    var meterEl = document.getElementById('resonanceMeter');
    if (meterEl) {
      meterEl.style.display = Player.activePet ? 'block' : 'none';
    }
  }

  return {
    state: state,
    onPlayerAttack: onPlayerAttack,
    onPetAttack: onPetAttack,
    checkSharedHit: checkSharedHit,
    triggerResonance: triggerResonance,
    update: update
  };
})();

// ================================================================
// SECTION 4 — UI COMPONENTS
// ================================================================

// ---- Resonance Meter HUD ----
var ResonanceMeterHUD = (function() {
  function update(meter) {
    var fillEl   = document.getElementById('resonanceFill');
    var valueEl  = document.getElementById('resonanceMeterValue');
    var trigBtn  = document.getElementById('resonanceTrigger');
    if (!fillEl) return;
    var pct = Math.floor((meter / PET_RESONANCE_CONFIG.meterMax) * 100);
    fillEl.style.width = pct + '%';
    if (valueEl) valueEl.textContent = pct + '%';
    if (trigBtn) {
      trigBtn.style.display = (meter >= PET_RESONANCE_CONFIG.tapTriggerThreshold) ? 'block' : 'none';
    }
  }
  return { update: update };
})();

// ---- Star Chart UI ----
var StarChartUI = (function() {
  var canvas, ctx, bgCanvas, bgCtx;
  var hoveredNode = null;
  var unlockAnims = {}; // nodeId → end time for twinkle

  function injectHTML() {
    if (document.getElementById('starChartOverlay')) return;

    // Main overlay
    var overlay = document.createElement('div');
    overlay.id = 'starChartOverlay';
    overlay.style.cssText = [
      'display:none',
      'position:fixed',
      'inset:0',
      'background:#080818',
      'z-index:110',
      'overflow:hidden',
      'font-family:monospace'
    ].join(';');
    overlay.innerHTML = [
      '<canvas id="starBgCanvas" style="position:absolute;inset:0;pointer-events:none"></canvas>',
      '<canvas id="starChartCanvas" style="position:absolute;top:0;left:0;width:100%;height:100%"></canvas>',
      // Header
      '<div style="position:absolute;top:10px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.85);border:2px solid #f0c040;border-radius:10px;padding:6px 20px;text-align:center;z-index:5;pointer-events:none">',
        '<div style="color:#f0c040;font-size:13px;font-weight:bold">🌌 Vũ Trụ Tinh Tú Bàn</div>',
        '<div style="color:#aaa;font-size:10px">Điểm: <span id="starPoints" style="color:#f0c040">0</span> | Mở khóa: <span id="starUnlocked" style="color:#4caf50">0</span>/60</div>',
      '</div>',
      // Reset buttons
      '<div style="position:absolute;top:10px;right:46px;z-index:5;display:flex;gap:6px">',
        '<button id="starFreeReset" style="padding:4px 8px;border:1px solid #f0c040;background:rgba(240,192,64,0.15);border-radius:5px;color:#f0c040;font-size:9px;cursor:pointer;font-family:monospace">🔄 Free Reset</button>',
        '<button id="starItemReset" style="padding:4px 8px;border:1px solid #ff9800;background:rgba(255,152,0,0.15);border-radius:5px;color:#ff9800;font-size:9px;cursor:pointer;font-family:monospace">📜 Reset (Cuốn Sách)</button>',
      '</div>',
      // Close
      '<div id="starClose" style="position:absolute;top:10px;right:14px;color:#888;font-size:22px;cursor:pointer;z-index:5;line-height:1;padding:2px 6px">✕</div>',
      // Tooltip
      '<div id="starTooltip" style="display:none;position:absolute;background:rgba(0,0,0,0.92);border:2px solid #f0c040;border-radius:8px;padding:8px 12px;font-size:10px;pointer-events:none;z-index:10;max-width:180px">',
        '<div id="starTipName"  style="color:#f0c040;font-weight:bold;margin-bottom:3px"></div>',
        '<div id="starTipDesc"  style="color:#ccc;margin-bottom:3px"></div>',
        '<div id="starTipCost"  style="color:#ff9800"></div>',
        '<div id="starTipReq"   style="color:#f44336;font-size:8px;margin-top:2px"></div>',
      '</div>'
    ].join('');
    document.body.appendChild(overlay);

    // Wire events
    document.getElementById('starClose').onclick     = function() { close(); };
    document.getElementById('starFreeReset').onclick = function() { StarChartSystem.reset(true); };
    document.getElementById('starItemReset').onclick = function() { StarChartSystem.reset(false); };

    // Setup canvases
    canvas   = document.getElementById('starChartCanvas');
    bgCanvas = document.getElementById('starBgCanvas');
    ctx      = canvas.getContext('2d');
    bgCtx    = bgCanvas.getContext('2d');

    canvas.addEventListener('click',     onCanvasClick);
    canvas.addEventListener('mousemove', onCanvasMouseMove);
    canvas.addEventListener('mouseleave', function() {
      hoveredNode = null;
      document.getElementById('starTooltip').style.display = 'none';
      render();
    });

    // Touch tap
    canvas.addEventListener('touchend', function(e) {
      e.preventDefault();
      var t = e.changedTouches[0];
      var rect = canvas.getBoundingClientRect();
      handleInteract(t.clientX - rect.left, t.clientY - rect.top);
    }, { passive: false });

    _initBgStars();
    _animateBgStars();
  }

  // ------ Background twinkling stars ------
  var bgStars = [];
  function _initBgStars() {
    bgStars = [];
    var w = window.innerWidth, h = window.innerHeight;
    for (var i = 0; i < 120; i++) {
      bgStars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.5 + Math.random() * 1.5,
        speed: 0.5 + Math.random() * 2,
        phase: Math.random() * Math.PI * 2
      });
    }
    bgCanvas.width  = w;
    bgCanvas.height = h;
  }
  function _animateBgStars() {
    if (document.getElementById('starChartOverlay').style.display === 'none') {
      requestAnimationFrame(_animateBgStars);
      return;
    }
    bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    var t = Date.now() / 1000;
    bgStars.forEach(function(s) {
      var alpha = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase));
      bgCtx.globalAlpha = alpha;
      bgCtx.fillStyle = '#f0c040';
      bgCtx.beginPath();
      bgCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      bgCtx.fill();
    });
    bgCtx.globalAlpha = 1;
    requestAnimationFrame(_animateBgStars);
  }

  // ------ Node position helpers ------
  function nodeScreenPos(node) {
    var w = canvas.width, h = canvas.height;
    return { x: node.x * w, y: node.y * h };
  }

  function findNodeAt(sx, sy) {
    var all  = StarChartSystem.getAllNodes();
    var best = null, bestDist = 18;
    for (var i = 0; i < all.length; i++) {
      var n = all[i];
      var pos  = nodeScreenPos(n);
      var dist = Math.sqrt((sx - pos.x) * (sx - pos.x) + (sy - pos.y) * (sy - pos.y));
      if (dist < bestDist) { bestDist = dist; best = n; }
    }
    return best;
  }

  function handleInteract(sx, sy) {
    var node = findNodeAt(sx, sy);
    if (!node) return;
    if (StarChartSystem.state.unlocked.has(node.id)) return; // already unlocked
    if (!StarChartSystem.canUnlock(node.id)) {
      // show why
      var n = StarChartSystem.getAllNodes().find(function(x) { return x.id === node.id; });
      if (StarChartSystem.state.points < n.cost) {
        UI.addLog('❌ Không đủ Tinh Điểm! (cần ' + n.cost + ')', 'system');
      } else {
        UI.addLog('❌ Cần mở khóa các tinh tú trước!', 'system');
      }
      return;
    }
    StarChartSystem.unlock(node.id);
  }

  function onCanvasClick(e) {
    var rect = canvas.getBoundingClientRect();
    var sx = (e.clientX - rect.left) * (canvas.width / rect.width);
    var sy = (e.clientY - rect.top)  * (canvas.height / rect.height);
    handleInteract(sx, sy);
  }

  function onCanvasMouseMove(e) {
    var rect = canvas.getBoundingClientRect();
    var sx = (e.clientX - rect.left) * (canvas.width / rect.width);
    var sy = (e.clientY - rect.top)  * (canvas.height / rect.height);
    var node = findNodeAt(sx, sy);
    hoveredNode = node;
    if (node) {
      var tip = document.getElementById('starTooltip');
      document.getElementById('starTipName').textContent  = node.name;
      document.getElementById('starTipDesc').textContent  = node.desc || '';
      document.getElementById('starTipCost').textContent  = 'Chi phí: ' + node.cost + ' Tinh Điểm';
      var missingReqs = (node.requires || []).filter(function(r) {
        return !StarChartSystem.state.unlocked.has(r);
      });
      document.getElementById('starTipReq').textContent =
        missingReqs.length ? '⚠ Cần: ' + missingReqs.join(', ') : '';
      tip.style.display  = 'block';
      tip.style.left     = (e.clientX + 12) + 'px';
      tip.style.top      = (e.clientY - 10) + 'px';
      render();
    } else {
      document.getElementById('starTooltip').style.display = 'none';
      render();
    }
  }

  // ------ Render ------
  function render() {
    if (!canvas) return;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var all      = StarChartSystem.getAllNodes();
    var unlocked = StarChartSystem.state.unlocked;
    var now      = Date.now();

    // Draw constellation labels
    var consts = STAR_CHART_CONFIG.constellations;
    ['chien','thu','tri','van'].forEach(function(key) {
      var cung = consts[key];
      var lx = cung.position.cx * canvas.width;
      var ly = cung.position.cy * canvas.height - 40;
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = cung.color;
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(cung.icon + ' ' + cung.name, lx, ly);
      ctx.globalAlpha = 1;
    });

    // Draw edges
    all.forEach(function(node) {
      var pos = nodeScreenPos(node);
      (node.requires || []).forEach(function(reqId) {
        var req = all.find(function(n) { return n.id === reqId; });
        if (!req) return;
        var rpos = nodeScreenPos(req);
        var bothUnlocked = unlocked.has(node.id) && unlocked.has(reqId);
        ctx.beginPath();
        ctx.moveTo(rpos.x, rpos.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.strokeStyle = bothUnlocked ? 'rgba(240,192,64,0.6)' : 'rgba(255,255,255,0.12)';
        ctx.lineWidth   = bothUnlocked ? 1.5 : 1;
        ctx.stroke();
      });
    });

    // Draw center lines to cm nodes
    var centerX = canvas.width  * 0.5;
    var centerY = canvas.height * 0.5;
    STAR_CHART_CONFIG.centerNodes.forEach(function(cn, idx) {
      var angle = (idx / 4) * Math.PI * 2 - Math.PI / 4;
      var nx = centerX + Math.cos(angle) * canvas.width  * 0.08;
      var ny = centerY + Math.sin(angle) * canvas.height * 0.08;
      (cn.requires || []).forEach(function(reqId) {
        var req = all.find(function(n) { return n.id === reqId; });
        if (!req) return;
        var rpos = nodeScreenPos(req);
        ctx.beginPath();
        ctx.moveTo(rpos.x, rpos.y);
        ctx.lineTo(nx, ny);
        ctx.strokeStyle = unlocked.has(cn.id) ? 'rgba(240,192,64,0.7)' : 'rgba(255,255,255,0.10)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      });
    });

    // Draw normal nodes
    all.forEach(function(node) {
      // skip center nodes (drawn separately)
      if (node.id.indexOf('cm') === 0) return;
      var pos  = nodeScreenPos(node);
      var isUnlocked  = unlocked.has(node.id);
      var canDo       = StarChartSystem.canUnlock(node.id);
      var isHovered   = hoveredNode && hoveredNode.id === node.id;
      var isTwinkling = unlockAnims[node.id] && now < unlockAnims[node.id];

      // Determine cung color
      var color = '#888';
      ['chien','thu','tri','van'].forEach(function(key) {
        var cung = consts[key];
        cung.nodes.forEach(function(n) {
          if (n.id === node.id) color = cung.color;
        });
      });

      var radius = node.crown ? 10 : 7;

      // Glow for unlocked / available
      if (isUnlocked || isTwinkling) {
        ctx.shadowColor = color;
        ctx.shadowBlur  = isTwinkling ? 20 : 8;
      } else if (canDo || isHovered) {
        ctx.shadowColor = '#f0c040';
        ctx.shadowBlur  = 6;
      } else {
        ctx.shadowBlur = 0;
      }

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = isUnlocked ? color : (canDo ? 'rgba(240,192,64,0.35)' : 'rgba(50,50,80,0.6)');
      ctx.fill();
      ctx.strokeStyle = isUnlocked ? color : (canDo ? '#f0c040' : '#444');
      ctx.lineWidth   = isHovered ? 2 : 1;
      ctx.stroke();

      // Crown decoration
      if (node.crown) {
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = isUnlocked ? '#fff' : '#666';
        ctx.fillText('★', pos.x, pos.y + 3);
      }

      ctx.shadowBlur = 0;

      // Node name
      ctx.font = '7px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = isUnlocked ? '#f0c040' : (canDo ? '#ccc' : '#555');
      ctx.fillText(node.name, pos.x, pos.y + radius + 9);
    });

    // Draw center (Thiên Mệnh) nodes
    STAR_CHART_CONFIG.centerNodes.forEach(function(cn, idx) {
      var angle = (idx / 4) * Math.PI * 2 - Math.PI / 4;
      var nx = centerX + Math.cos(angle) * canvas.width  * 0.08;
      var ny = centerY + Math.sin(angle) * canvas.height * 0.08;
      var isUnlocked = unlocked.has(cn.id);
      var canDo      = StarChartSystem.canUnlock(cn.id);
      var isHovered  = hoveredNode && hoveredNode.id === cn.id;

      ctx.shadowColor = isUnlocked ? '#f0c040' : (canDo ? '#fff' : 'transparent');
      ctx.shadowBlur  = isUnlocked ? 15 : (canDo ? 8 : 0);

      var rad = cn.ultimate ? 14 : 11;
      ctx.beginPath();
      ctx.arc(nx, ny, rad, 0, Math.PI * 2);
      ctx.fillStyle = isUnlocked ? '#f0c040' : (canDo ? 'rgba(240,192,64,0.3)' : 'rgba(30,20,60,0.8)');
      ctx.fill();
      ctx.strokeStyle = isUnlocked ? '#fff' : (canDo ? '#f0c040' : '#333');
      ctx.lineWidth   = isHovered ? 2.5 : 1.5;
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.font = '7px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = isUnlocked ? '#fff' : (canDo ? '#f0c040' : '#444');
      ctx.fillText(cn.name, nx, ny + 3);
      ctx.font = '6px monospace';
      ctx.fillStyle = '#888';
      ctx.fillText(cn.desc ? cn.desc.slice(0, 18) : '', nx, ny + rad + 9);
    });

    // Center ultimate glow
    if (unlocked.has('cm4')) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, 20 + Math.sin(Date.now() / 400) * 4, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(240,192,64,0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  function animateUnlock(nodeId) {
    unlockAnims[nodeId] = Date.now() + 1200;
    var ticks = 0;
    var iv = setInterval(function() {
      ticks++;
      render();
      if (ticks > 20) clearInterval(iv);
    }, 60);
  }

  function updatePointsDisplay() {
    var el = document.getElementById('starPoints');
    if (el) el.textContent = StarChartSystem.state.points;
    var el2 = document.getElementById('starUnlocked');
    if (el2) el2.textContent = StarChartSystem.state.unlocked.size;
  }

  function open() {
    var overlay = document.getElementById('starChartOverlay');
    if (!overlay) { injectHTML(); overlay = document.getElementById('starChartOverlay'); }
    overlay.style.display = 'block';
    canvas  = document.getElementById('starChartCanvas');
    bgCanvas= document.getElementById('starBgCanvas');
    ctx     = canvas.getContext('2d');
    bgCtx   = bgCanvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    bgCanvas.width = window.innerWidth;
    bgCanvas.height= window.innerHeight;
    updatePointsDisplay();
    render();
  }

  function close() {
    var overlay = document.getElementById('starChartOverlay');
    if (overlay) overlay.style.display = 'none';
  }

  return {
    open: open,
    close: close,
    render: render,
    animateUnlock: animateUnlock,
    updatePointsDisplay: updatePointsDisplay
  };
})();

// ================================================================
// SECTION 5 — INIT & MONKEY-PATCHES
// ================================================================

var StarResonanceFeature = (function() {

  function injectResonanceMeter() {
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
      'display:none'
    ].join(';');
    el.innerHTML = [
      '<div style="display:flex;justify-content:space-between;margin-bottom:2px">',
        '<span style="color:#e040fb;font-size:9px">💥 Cộng Kích</span>',
        '<span id="resonanceMeterValue" style="color:#888;font-size:9px">0%</span>',
      '</div>',
      '<div style="height:6px;background:#222;border-radius:3px;overflow:hidden;border:1px solid #444">',
        '<div id="resonanceFill" style="height:100%;background:linear-gradient(90deg,#7c4dff,#e040fb);border-radius:3px;transition:width 0.2s;width:0%"></div>',
      '</div>',
      '<button id="resonanceTrigger" style="width:100%;margin-top:4px;padding:3px;border:1px solid #e040fb;background:rgba(224,64,251,0.15);border-radius:4px;color:#e040fb;font-size:8px;cursor:pointer;display:none;font-family:monospace">⚡ Kích Hoạt Sớm</button>'
    ].join('');
    document.body.appendChild(el);

    document.getElementById('resonanceTrigger').onclick = function() {
      PetResonanceSystem.triggerResonance();
    };
  }

  function hookAvatarFrame() {
    // Hook avatar canvas click to open star chart
    var avCanvas = document.getElementById('avatarCanvas');
    if (avCanvas) {
      avCanvas.style.cursor = 'pointer';
      avCanvas.addEventListener('click', function(e) {
        e.stopPropagation();
        StarChartUI.open();
      });
    }
    // Also hook avatarFrame div if present
    var avFrame = document.getElementById('avatarFrame');
    if (avFrame) {
      avFrame.style.cursor = 'pointer';
      avFrame.addEventListener('click', function() {
        StarChartUI.open();
      });
    }
  }

  function patchGameSaveLoad() {
    // Save
    var _origSave = Game.save.bind(Game);
    Game.save = function() {
      _origSave();
      try {
        localStorage.setItem(STAR_CHART_CONFIG.storageKey, JSON.stringify(StarChartSystem.getSaveData()));
      } catch(e) { console.error('StarChart save error:', e); }
    };
    // Load
    var _origLoad = Game.load.bind(Game);
    Game.load = function() {
      var r = _origLoad();
      try {
        var raw = localStorage.getItem(STAR_CHART_CONFIG.storageKey);
        if (raw) StarChartSystem.loadSaveData(JSON.parse(raw));
      } catch(e) { console.error('StarChart load error:', e); }
      return r;
    };
  }

  function patchGameUpdate() {
    var _origUpdate = Game.update.bind(Game);
    Game.update = function(dt) {
      _origUpdate(dt);
      PetResonanceSystem.update(dt);
      // Star regen
      if (Player._starHpRegen) {
        Player.hp = Math.min(Player.maxHp, Player.hp + Player._starHpRegen * dt / 1000);
      }
      if (Player._starMpRegen) {
        Player.mp = Math.min(Player.maxMp, Player.mp + Player._starMpRegen * dt / 1000);
      }
    };
  }

  function patchPlayerRecalculate() {
    var _origRecalc = Player.recalculateStats.bind(Player);
    Player.recalculateStats = function() {
      _origRecalc();
      // Apply star chart bonuses
      StarChartSystem.applyToStats(Player);
      // Pet stat bonus from Vận Tinh Cung v14
      if (Player._starPetBonus && Player.activePet && typeof PETS !== 'undefined' && PETS[Player.activePet]) {
        var pet = PETS[Player.activePet];
        if (pet.bonus.atk)   Player.atk   += Math.floor(pet.bonus.atk   * Player._starPetBonus);
        if (pet.bonus.def)   Player.def   += Math.floor(pet.bonus.def   * Player._starPetBonus);
        if (pet.bonus.speed) Player.speed += pet.bonus.speed * Player._starPetBonus;
      }
    };
  }

  function patchEnemiesKill() {
    var _origKill = Enemies.kill.bind(Enemies);
    Enemies.kill = function(enemy) {
      // Apply star chart kill bonuses BEFORE kill processing
      if (Player._starGoldBonus) {
        enemy.gold = Math.floor(enemy.gold * (1 + Player._starGoldBonus));
      }
      if (Player._starExpBonus) {
        enemy.exp = Math.floor(enemy.exp * (1 + Player._starExpBonus));
      }
      if (Player._starDropBonus && enemy.drops) {
        enemy.drops = enemy.drops.map(function(d) {
          return { id: d.id, chance: Math.min(1, d.chance * (1 + Player._starDropBonus)) };
        });
      }
      // Boss event points
      if (enemy.boss) {
        StarChartSystem.addPoints(STAR_CHART_CONFIG.pointsPerBossEvent);
      }
      _origKill(enemy);
      // Resonance pet attack tracking on kill
      if (Player.activePet) {
        PetResonanceSystem.onPetAttack(enemy);
      }
    };
  }

  function patchPlayerGainExp() {
    var _prevLevel = Player.level;
    var _origGainExp = Player.gainExp.bind(Player);
    Player.gainExp = function(amount) {
      _prevLevel = Player.level;
      _origGainExp(amount);
      if (Player.level > _prevLevel) {
        // Level up detected — add star points per each new level
        var gained = Player.level - _prevLevel;
        for (var i = 0; i < gained; i++) {
          StarChartSystem.addPoints(STAR_CHART_CONFIG.pointsPerLevel(Player.level - gained + i + 1));
        }
      }
    };
  }

  function patchPlayerGainRealmExp() {
    var _prevRealm = Player.realm;
    var _origGainRealmExp = Player.gainRealmExp.bind(Player);
    Player.gainRealmExp = function(amount) {
      _prevRealm = Player.realm;
      _origGainRealmExp(amount);
      if (Player.realm > _prevRealm) {
        var gained = Player.realm - _prevRealm;
        StarChartSystem.addPoints(STAR_CHART_CONFIG.pointsPerRealm * gained);
        UI.addLog('🌌 Đột phá! Nhận ' + (STAR_CHART_CONFIG.pointsPerRealm * gained) + ' Tinh Điểm!', 'realm');
      }
    };
  }

  function patchPlayerUseSkill() {
    var _origUseSkill = Player.useSkill.bind(Player);
    Player.useSkill = function(idx) {
      var result = _origUseSkill(idx);
      if (result && Player.target) {
        PetResonanceSystem.onPlayerAttack(Player.target);
      }
      return result;
    };
  }

  function patchInventoryUseItem() {
    var _origUseItem = Inventory.useItem.bind(Inventory);
    Inventory.useItem = function(itemId) {
      var itemData = ITEMS[itemId];
      if (itemData && itemData.effect && itemData.effect.resetStarChart) {
        return StarChartSystem.reset(false);
      }
      return _origUseItem(itemId);
    };
  }

  function loadSavedData() {
    try {
      var raw = localStorage.getItem(STAR_CHART_CONFIG.storageKey);
      if (raw) StarChartSystem.loadSaveData(JSON.parse(raw));
    } catch(e) { console.error('StarChart load error:', e); }
  }

  function init() {
    // Register reset scroll item
    if (typeof ITEMS !== 'undefined') {
      ITEMS[STAR_CHART_CONFIG.starResetScrollItem.id] = STAR_CHART_CONFIG.starResetScrollItem;
    }

    // Inject HTML
    StarChartUI.injectHTML ? StarChartUI.injectHTML() : (function() {
      // fallback: call open then close to inject HTML
      var tmp = document.getElementById('starChartOverlay');
      if (!tmp) {
        // Force inject via open/close
        StarChartUI.open();
        StarChartUI.close();
      }
    })();

    injectResonanceMeter();

    // Load saved star data
    loadSavedData();

    // Apply patches
    patchGameSaveLoad();
    patchGameUpdate();
    patchPlayerRecalculate();
    patchEnemiesKill();
    patchPlayerGainExp();
    patchPlayerGainRealmExp();
    patchPlayerUseSkill();
    patchInventoryUseItem();

    // Recalc stats with star bonuses
    Player.recalculateStats();

    // Show meter if player has pet
    var meterEl = document.getElementById('resonanceMeter');
    if (meterEl && Player.activePet) {
      meterEl.style.display = 'block';
    }

    // Hook avatar for star chart open — run after DOM is stable
    setTimeout(hookAvatarFrame, 500);

    console.log('🌌 Star Resonance loaded (Star Chart + Pet Resonance)');
  }

  // Wrap Game.init to call our init after
  var _origGameInit = Game.init.bind(Game);
  Game.init = function() {
    _origGameInit();
    init();
  };

  return { init: init };
})();

// Make StarChartUI.injectHTML accessible (it's inside IIFE so expose via wrapper)
(function() {
  var _open = StarChartUI.open;
  StarChartUI.open = function() {
    var overlay = document.getElementById('starChartOverlay');
    if (!overlay) {
      // Need to build HTML first — re-run injection
      // We re-call the private injectHTML by doing a full open
      _open();
      return;
    }
    _open();
  };
})();
