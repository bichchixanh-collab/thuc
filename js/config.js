// ==================== GAME CONFIGURATION ====================
const CONFIG = {
  TILE_SIZE: 32,
  WORLD_WIDTH: 60,
  WORLD_HEIGHT: 60,
  INVENTORY_SIZE: 40,
  AUTO_SAVE_INTERVAL: 30000,
  
  // Combat settings
  BASE_ATTACK_RANGE: 60,
  ENEMY_AGGRO_RANGE: 180,
  ENEMY_ATTACK_RANGE: 45,
  
  // Tap to move settings
  TAP_MOVE: {
    ENABLED: true,
    ARRIVAL_THRESHOLD: 10,
    PATH_UPDATE_RATE: 100
  },
  
  // Auto farm settings
  AUTO: {
    SEARCH_RADIUS: 400,
    SKILL_USE_HP_THRESHOLD: 0.7,
    HP_POTION_THRESHOLD: 0.3,
    MP_POTION_THRESHOLD: 0.2,
    PRIORITY_LOW_HP_ENEMY: true,
    AVOID_HIGHER_LEVEL: 5,
    LOOT_PICKUP_RANGE: 100,
    CULTIVATION_MP_REGEN: 5,
    CULTIVATION_REALM_EXP: 8
  }
};

// ==================== COLOR PALETTE ====================
const COLORS = {
  skin: '#ffe4c4', skinLight: '#fff0e0', hair: '#3d2314', hairLight: '#5a3825',
  robe: '#4169e1', robeLight: '#6495ed', robeDark: '#27408b',
  belt: '#ffd700', beltDark: '#daa520', eye: '#1a1a1a', eyeWhite: '#fff',
  blush: '#ffb6c1', mouth: '#ff6b6b',
  sword: '#c0c0c0', swordShine: '#ffffff', swordHilt: '#8b4513', swordGlow: '#87ceeb',
  grass1: '#228b22', grass2: '#32cd32', grass3: '#2e8b2e',
  dirt: '#8b7355', dirtLight: '#a08060', stone: '#808080', stoneDark: '#606060',
  water: '#4169e1', waterLight: '#6495ed', waterDark: '#27408b',
  sand: '#f4a460', snow: '#fffafa', lava: '#ff4500',
  tree: '#228b22', treeLight: '#32cd32', treeTrunk: '#8b4513', treeTrunkDark: '#654321',
  wolfFur: '#808080', wolfDark: '#505050', wolfEye: '#ff0000',
  boarBrown: '#8b4513', boarDark: '#654321',
  demonSkin: '#8b0000', demonDark: '#5c0000',
  ghostBlue: '#add8e6', ghostDark: '#4682b4',
  npcRobe: '#9932cc', npcRobeLight: '#ba55d3',
  petDog: '#c4a484', petDogDark: '#8b7355',
  petCat: '#ffa500', petCatDark: '#cc8400',
  petBird: '#87ceeb', petBirdDark: '#4682b4',
  gold: '#ffd700', exp: '#ffeb3b', hp: '#ff4444', mp: '#4488ff',
  rare: '#a855f7', epic: '#f97316', legendary: '#f0c040'
};

// ==================== REALMS ====================
const REALMS = [
  { name: 'Luyện Khí Kỳ',  stages: 9, atkBonus: 0,     hpBonus: 0,      defBonus: 0    },
  { name: 'Trúc Cơ Kỳ',   stages: 9, atkBonus: 25,    hpBonus: 150,    defBonus: 5    },
  { name: 'Kim Đan Kỳ',    stages: 9, atkBonus: 80,    hpBonus: 400,    defBonus: 15   },
  { name: 'Nguyên Anh Kỳ', stages: 9, atkBonus: 200,   hpBonus: 1000,   defBonus: 35   },
  { name: 'Hóa Thần Kỳ',   stages: 9, atkBonus: 500,   hpBonus: 2500,   defBonus: 80   },
  { name: 'Luyện Hư Kỳ',   stages: 9, atkBonus: 1200,  hpBonus: 6000,   defBonus: 180  },
  { name: 'Đại Thừa Kỳ',   stages: 9, atkBonus: 3000,  hpBonus: 15000,  defBonus: 400  },
  { name: 'Độ Kiếp Kỳ',    stages: 3, atkBonus: 8000,  hpBonus: 40000,  defBonus: 1000 },
  { name: 'Tiên Nhân',     stages: 1, atkBonus: 20000, hpBonus: 100000, defBonus: 2500 }
];

// ==================== PETS ====================
const PETS = {
  dog:  { id: 'dog',  name: 'Linh Khuyển', desc: 'Chó linh hồn trung thành, tăng công kích', price: 500, bonus: { atk: 5 },       expBonus: 0.1, color: '#c4a484', colorDark: '#8b7355' },
  cat:  { id: 'cat',  name: 'Linh Miêu',   desc: 'Mèo linh hoạt, tăng phòng ngự',           price: 500, bonus: { def: 5 },       expBonus: 0.1, color: '#ffa500', colorDark: '#cc8400' },
  bird: { id: 'bird', name: 'Thanh Điểu',  desc: 'Chim xanh nhanh nhẹn, tăng tốc độ',       price: 500, bonus: { speed: 0.3 },   expBonus: 0.1, color: '#87ceeb', colorDark: '#4682b4' }
};

// ==================== SKILLS ====================
const SKILLS = [
  { id: 0, name: 'Cơ Bản Kiếm Pháp', cd: 800,  maxCd: 800,   dmgMul: 1.0, mp: 0,  range: 65,  type: 'melee',      color: '#ffffff', desc: 'Đòn tấn công cơ bản' },
  { id: 1, name: 'Kiếm Phong Trảm',  cd: 0,    maxCd: 3000,  dmgMul: 2.2, mp: 10, range: 130, type: 'projectile', color: '#87ceeb', desc: 'Phóng kiếm khí gây sát thương từ xa' },
  { id: 2, name: 'Lôi Điện Thuật',   cd: 0,    maxCd: 5000,  dmgMul: 3.0, mp: 20, range: 160, type: 'aoe',        color: '#ffff00', desc: 'Triệu hồi sấm sét tấn công kẻ địch' },
  { id: 3, name: 'Vạn Kiếm Quy Tông',cd: 0,    maxCd: 10000, dmgMul: 5.5, mp: 35, range: 120, type: 'ultimate',   color: '#ff00ff', desc: 'Tuyệt kỹ kiếm pháp, tấn công tất cả kẻ địch' }
];

// ==================== ITEMS ====================
const ITEMS = {
  // Consumables
  hpPotion:       { name: 'Hồi Khí Đan',             type: 'consumable', rarity: 'common',    desc: 'Hồi phục 80 HP',      effect: { hp: 80 },         sellPrice: 5    },
  hpPotionMedium: { name: 'Trung Phẩm Hồi Khí Đan',  type: 'consumable', rarity: 'rare',      desc: 'Hồi phục 250 HP',     effect: { hp: 250 },        sellPrice: 20   },
  mpPotion:       { name: 'Linh Khí Đan',             type: 'consumable', rarity: 'common',    desc: 'Hồi phục 40 MP',      effect: { mp: 40 },         sellPrice: 8    },
  mpPotionMedium: { name: 'Trung Phẩm Linh Khí Đan', type: 'consumable', rarity: 'rare',      desc: 'Hồi phục 100 MP',     effect: { mp: 100 },        sellPrice: 25   },
  expPotion:      { name: 'Kinh Nghiệm Đan',          type: 'consumable', rarity: 'rare',      desc: 'Nhận 200 EXP',        effect: { exp: 200 },       sellPrice: 50   },
  realmPill:      { name: 'Đột Phá Đan',              type: 'consumable', rarity: 'epic',      desc: 'Nhận 100 Tu Vi',      effect: { realmExp: 100 },  sellPrice: 200  },

  // Materials
  wolfFang:    { name: 'Nanh Sói',   type: 'material', rarity: 'common',    desc: 'Nanh của sói xám, nguyên liệu luyện khí',        sellPrice: 3    },
  wolfPelt:    { name: 'Da Sói',     type: 'material', rarity: 'common',    desc: 'Da sói chất lượng tốt',                          sellPrice: 5    },
  demonCore:   { name: 'Ma Hạch',   type: 'material', rarity: 'rare',      desc: 'Hạch năng lượng của yêu ma',                     sellPrice: 30   },
  spiritStone: { name: 'Linh Thạch',type: 'material', rarity: 'rare',      desc: 'Đá chứa linh khí tinh thuần',                    sellPrice: 50   },
  dragonScale: { name: 'Vảy Rồng',  type: 'material', rarity: 'epic',      desc: 'Vảy của rồng cổ đại, cực kỳ quý hiếm',          sellPrice: 200  },
  celestialOrb:{ name: 'Thiên Châu',type: 'material', rarity: 'legendary', desc: 'Ngọc châu tiên giới, vô cùng quý giá',           sellPrice: 1000 },

  // Equipment - Weapons
  woodenSword:    { name: 'Mộc Kiếm',          type: 'weapon', rarity: 'common',    desc: 'Kiếm gỗ tập luyện',                    stats: { atk: 3 },                                   sellPrice: 10   },
  ironSword:      { name: 'Thiết Kiếm',         type: 'weapon', rarity: 'common',    desc: 'Kiếm sắt thường',                       stats: { atk: 8 },                                   sellPrice: 30   },
  steelSword:     { name: 'Cương Kiếm',         type: 'weapon', rarity: 'rare',      desc: 'Kiếm thép tinh luyện',                  stats: { atk: 18, critRate: 0.03 },                  sellPrice: 100  },
  silverSword:    { name: 'Bạch Ngân Kiếm',     type: 'weapon', rarity: 'rare',      desc: 'Kiếm bạc hàng tinh luyện',              stats: { atk: 28, mp: 20 },                          sellPrice: 200  },
  flameSword:     { name: 'Liệt Hỏa Kiếm',      type: 'weapon', rarity: 'epic',      desc: 'Kiếm phong ấn hỏa diệm',                stats: { atk: 50, critDmg: 0.2 },                    sellPrice: 500  },
  frostSword:     { name: 'Hàn Băng Kiếm',      type: 'weapon', rarity: 'epic',      desc: 'Kiếm chứa hàn khí ngàn năm',            stats: { atk: 45, def: 10, mp: 30 },                 sellPrice: 500  },
  celestialSword: { name: 'Thiên Tiên Kiếm',    type: 'weapon', rarity: 'legendary', desc: 'Thần kiếm tiên giới, uy lực vô song',   stats: { atk: 120, critRate: 0.1, critDmg: 0.5, mp: 50 }, sellPrice: 2000 },

  // Equipment - Armor
  clothRobe:      { name: 'Bố Y',              type: 'armor',  rarity: 'common',    desc: 'Áo vải thường',                stats: { def: 2,  hp: 20  },          sellPrice: 15   },
  leatherArmor:   { name: 'Bì Giáp',           type: 'armor',  rarity: 'common',    desc: 'Giáp da thú',                  stats: { def: 5,  hp: 40  },          sellPrice: 40   },
  ironArmor:      { name: 'Thiết Giáp',         type: 'armor',  rarity: 'rare',      desc: 'Giáp sắt kiên cố',             stats: { def: 12, hp: 80  },          sellPrice: 120  },
  spiritRobe:     { name: 'Linh Bào',           type: 'armor',  rarity: 'rare',      desc: 'Áo bào linh khí',              stats: { def: 8,  hp: 60, mp: 40 },   sellPrice: 180  },
  dragonArmor:    { name: 'Long Lân Giáp',      type: 'armor',  rarity: 'epic',      desc: 'Giáp từ vảy rồng',             stats: { def: 30, hp: 200 },          sellPrice: 600  },
  celestialRobe:  { name: 'Tiên Nhân Pháp Bào', type: 'armor',  rarity: 'legendary', desc: 'Pháp bào tiên nhân',           stats: { def: 50, hp: 400, mp: 100, critRate: 0.05 }, sellPrice: 2500 },

  // Equipment - Accessories
  copperRing:    { name: 'Đồng Chỉ',      type: 'accessory', rarity: 'common',    desc: 'Nhẫn đồng đơn giản',       stats: { atk: 2 },                               sellPrice: 20   },
  silverRing:    { name: 'Ngân Chỉ',      type: 'accessory', rarity: 'rare',      desc: 'Nhẫn bạc tinh luyện',      stats: { atk: 5, critRate: 0.02 },               sellPrice: 80   },
  spiritPendant: { name: 'Linh Ngọc Bội', type: 'accessory', rarity: 'rare',      desc: 'Bội ngọc chứa linh khí',   stats: { mp: 30, def: 3 },                       sellPrice: 100  },
  dragonAmulet:  { name: 'Long Bài',      type: 'accessory', rarity: 'epic',      desc: 'Hộ bài khắc hình rồng',    stats: { atk: 15, def: 10, hp: 100 },            sellPrice: 400  },
  celestialJade: { name: 'Thiên Tiên Ngọc',type: 'accessory',rarity: 'legendary', desc: 'Ngọc bội tiên giới',       stats: { atk: 30, def: 20, hp: 200, mp: 80, critRate: 0.08 }, sellPrice: 1500 },

  // ==================== TỌA KỴ (MOUNT ITEMS) ====================
  // Drop từ quái vật - tỉ lệ thấp (0.3% - 2%)
  // Có thể trang bị vào slot 'mount', nâng cấp như weapon/armor
  // stats buff cho player khi trang bị

  mountWhiteHorse: {
    name: 'Bạch Mã Linh Câu',
    type: 'mount', rarity: 'rare',
    desc: 'Ngựa trắng linh thiêng. Tốc độ vượt gió, thích hợp di chuyển trên thảo nguyên.',
    icon: '🐎',
    stats: { speed: 0.8, def: 5 },
    passiveDesc: '+0.8 Tốc độ | +5 Phòng thủ',
    dropSources: ['wolf', 'boar'],
    dropRate: 0.012,
    sellPrice: 300,
    enhanceable: true
  },
  mountRedDragon: {
    name: 'Xích Long Tọa Kỵ',
    type: 'mount', rarity: 'epic',
    desc: 'Rồng đỏ thuần hóa. Phun lửa mỗi 10s gây AOE damage nhỏ.',
    icon: '🐉',
    stats: { speed: 1.0, atk: 20, critRate: 0.03 },
    passiveDesc: '+1.0 Tốc độ | +20 ATK | +3% Bạo kích',
    passive: { type: 'fireBreath', interval: 10000, dmgPct: 0.5, range: 80 },
    dropSources: ['demon', 'boss'],
    dropRate: 0.005,
    sellPrice: 1200,
    enhanceable: true
  },
  mountCloudCrane: {
    name: 'Vân Hạc Tiên Điểu',
    type: 'mount', rarity: 'epic',
    desc: 'Hạc trắng bay trên mây. Tăng tốc độ tu luyện và hồi MP.',
    icon: '🦢',
    stats: { speed: 0.6, mp: 60, critDmg: 0.15 },
    passiveDesc: '+0.6 Tốc độ | +60 MP | +15% Bạo thương',
    passive: { type: 'mpRegen', amount: 3, interval: 2000 },
    dropSources: ['ghost', 'boss'],
    dropRate: 0.004,
    sellPrice: 1000,
    enhanceable: true
  },
  mountBlackTiger: {
    name: 'Hắc Hổ Thần Kỵ',
    type: 'mount', rarity: 'epic',
    desc: 'Hổ đen huyền bí. Khi tấn công có 10% gây thêm 1 đòn.',
    icon: '🐅',
    stats: { speed: 0.9, atk: 15, hp: 80 },
    passiveDesc: '+0.9 Tốc độ | +15 ATK | +80 HP | 10% double-strike',
    passive: { type: 'doubleStrike', chance: 0.10 },
    dropSources: ['demon', 'wolf', 'boss'],
    dropRate: 0.006,
    sellPrice: 1100,
    enhanceable: true
  },
  mountPhoenix: {
    name: 'Phượng Hoàng Thần Điểu',
    type: 'mount', rarity: 'legendary',
    desc: 'Phượng hoàng bất tử. Khi HP về 0 hồi phục 30% HP một lần (CD 10 phút).',
    icon: '🦅',
    stats: { speed: 1.2, hp: 150, mp: 100, critRate: 0.06, critDmg: 0.25 },
    passiveDesc: '+1.2 Tốc độ | +150 HP | +100 MP | +6% Bạo kích | +25% Bạo thương',
    passive: { type: 'rebirth', rebirthHpPct: 0.30, cd: 600000 },
    dropSources: ['boss'],
    dropRate: 0.001,
    sellPrice: 5000,
    enhanceable: true
  },
  mountIceLynx: {
    name: 'Băng Linh Mãnh Thú',
    type: 'mount', rarity: 'rare',
    desc: 'Linh mãnh thú băng giá. Mỗi đòn đánh có 15% làm chậm kẻ địch 30%.',
    icon: '🐆',
    stats: { speed: 0.7, def: 10, hp: 60 },
    passiveDesc: '+0.7 Tốc độ | +10 Phòng thủ | +60 HP | 15% làm chậm',
    passive: { type: 'slow', chance: 0.15, slowPct: 0.30, duration: 2000 },
    dropSources: ['wolf', 'boar', 'ghost'],
    dropRate: 0.010,
    sellPrice: 400,
    enhanceable: true
  },
  mountGoldenKirin: {
    name: 'Kim Kỳ Lân Thần Thú',
    type: 'mount', rarity: 'legendary',
    desc: 'Kỳ lân vàng của cõi tiên. Tăng mạnh tất cả chỉ số, EXP nhận +20%.',
    icon: '🦄',
    stats: { speed: 1.0, atk: 40, def: 25, hp: 200, mp: 120, critRate: 0.08 },
    passiveDesc: '+1.0 Tốc độ | +40 ATK | +25 DEF | +200 HP | +120 MP | +8% Bạo kích | +20% EXP',
    passive: { type: 'expBonus', bonus: 0.20 },
    dropSources: ['boss'],
    dropRate: 0.0008,
    sellPrice: 8000,
    enhanceable: true
  },
  mountStormWolf: {
    name: 'Lôi Phong Linh Lang',
    type: 'mount', rarity: 'rare',
    desc: 'Sói sấm chớp. Tự động phóng lôi điện vào kẻ địch gần nhất mỗi 6s.',
    icon: '🐺',
    stats: { speed: 1.1, atk: 10, critDmg: 0.10 },
    passiveDesc: '+1.1 Tốc độ | +10 ATK | +10% Bạo thương | Phóng lôi 6s/lần',
    passive: { type: 'lightning', interval: 6000, dmgPct: 0.8, range: 120 },
    dropSources: ['wolf', 'demon'],
    dropRate: 0.008,
    sellPrice: 350,
    enhanceable: true
  }
};

// ==================== MOUNT CONFIG (Nâng cấp tọa kỵ) ====================
const MOUNT_CONFIG = {
  maxLevel: 10,
  // Nguyên liệu nâng cấp tọa kỵ theo cấp
  materials: {
    0: { items: [{ id: 'wolfFang',    count: 5  }, { id: 'wolfPelt',    count: 2 }], gold: 100  },
    1: { items: [{ id: 'wolfFang',    count: 5  }, { id: 'wolfPelt',    count: 2 }], gold: 100  },
    2: { items: [{ id: 'demonCore',   count: 2  }, { id: 'wolfPelt',    count: 3 }], gold: 200  },
    3: { items: [{ id: 'demonCore',   count: 3  }, { id: 'spiritStone', count: 1 }], gold: 350  },
    4: { items: [{ id: 'spiritStone', count: 2  }, { id: 'demonCore',   count: 2 }], gold: 500  },
    5: { items: [{ id: 'spiritStone', count: 3  }, { id: 'dragonScale', count: 1 }], gold: 800  },
    6: { items: [{ id: 'dragonScale', count: 1  }, { id: 'spiritStone', count: 3 }], gold: 1200 },
    7: { items: [{ id: 'dragonScale', count: 2  }, { id: 'spiritStone', count: 3 }], gold: 2000 },
    8: { items: [{ id: 'celestialOrb',count: 1  }, { id: 'dragonScale', count: 2 }], gold: 3500 },
    9: { items: [{ id: 'celestialOrb',count: 2  }, { id: 'dragonScale', count: 3 }], gold: 6000 }
  },
  // Tỉ lệ thành công
  successRate: { 0:1.0, 1:1.0, 2:1.0, 3:0.9, 4:0.8, 5:0.7, 6:0.6, 7:0.5, 8:0.35, 9:0.2 },
  // Mỗi cấp nâng tăng % stat
  statBonusPerLevel: 0.12, // +12% tất cả stats mount mỗi cấp
  // Màu tên theo cấp
  nameColors: { 0:null, 1:'#e0e0e0', 2:'#e0e0e0', 3:'#e0e0e0', 4:'#4fc3f7', 5:'#4fc3f7', 6:'#ff9800', 7:'#ff9800', 8:'#ff9800', 9:'#ff9800', 10:'#f0c040' },
  getStatMultiplier(level) {
    return level <= 0 ? 1.0 : 1.0 + level * this.statBonusPerLevel;
  }
};

// ==================== DROP RATES (tọa kỵ từ quái) ====================
// Tích hợp vào Enemies.drop logic — key là enemy type
const MOUNT_DROP_TABLE = {
  wolf:   ['mountWhiteHorse', 'mountIceLynx', 'mountStormWolf'],
  boar:   ['mountWhiteHorse', 'mountIceLynx'],
  demon:  ['mountBlackTiger', 'mountRedDragon', 'mountStormWolf'],
  ghost:  ['mountCloudCrane', 'mountIceLynx'],
  boss:   ['mountRedDragon', 'mountCloudCrane', 'mountBlackTiger', 'mountPhoenix', 'mountGoldenKirin']
};

// ==================== GAME STATE ====================
const GameState = {
  running: false, time: 0, lastTime: 0,
  camera: { x: 0, y: 0 },
  minimapVisible: true,
  activePanel: null,
  particles: [], dmgNumbers: [], groundItems: [],
  tapTarget: null, tapIndicator: null, isTapMoving: false
};

// ==================== UTILITY FUNCTIONS ====================
const Utils = {
  dist(x1, y1, x2, y2) { return Math.sqrt((x2-x1)**2 + (y2-y1)**2); },
  clamp(val, min, max) { return Math.max(min, Math.min(max, val)); },
  random(min, max) { return Math.random() * (max - min) + min; },
  randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; },
  chance(percent) { return Math.random() < percent; },
  formatNumber(num) {
    if (num >= 1000000) return (num/1000000).toFixed(1)+'M';
    if (num >= 1000)    return (num/1000).toFixed(1)+'K';
    return Math.floor(num).toString();
  },
  lerp(a, b, t) { return a + (b-a)*t; },
  angle(x1, y1, x2, y2) { return Math.atan2(y2-y1, x2-x1); }
};

console.log('📦 Config loaded (+ Mount system)');
