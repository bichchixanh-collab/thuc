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
    ARRIVAL_THRESHOLD: 10,  // Khoảng cách coi như đã đến
    PATH_UPDATE_RATE: 100   // ms giữa các lần update path
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
  // Character
  skin: '#ffe4c4',
  skinLight: '#fff0e0',
  hair: '#3d2314',
  hairLight: '#5a3825',
  robe: '#4169e1',
  robeLight: '#6495ed',
  robeDark: '#27408b',
  belt: '#ffd700',
  beltDark: '#daa520',
  eye: '#1a1a1a',
  eyeWhite: '#fff',
  blush: '#ffb6c1',
  mouth: '#ff6b6b',
  
  // Equipment
  sword: '#c0c0c0',
  swordShine: '#ffffff',
  swordHilt: '#8b4513',
  swordGlow: '#87ceeb',
  
  // Environment
  grass1: '#228b22',
  grass2: '#32cd32',
  grass3: '#2e8b2e',
  dirt: '#8b7355',
  dirtLight: '#a08060',
  stone: '#808080',
  stoneDark: '#606060',
  water: '#4169e1',
  waterLight: '#6495ed',
  waterDark: '#27408b',
  sand: '#f4a460',
  snow: '#fffafa',
  lava: '#ff4500',
  
  // Trees
  tree: '#228b22',
  treeLight: '#32cd32',
  treeTrunk: '#8b4513',
  treeTrunkDark: '#654321',
  
  // Enemies
  wolfFur: '#808080',
  wolfDark: '#505050',
  wolfEye: '#ff0000',
  boarBrown: '#8b4513',
  boarDark: '#654321',
  demonSkin: '#8b0000',
  demonDark: '#5c0000',
  ghostBlue: '#add8e6',
  ghostDark: '#4682b4',
  
  // NPC
  npcRobe: '#9932cc',
  npcRobeLight: '#ba55d3',
  
  // Pets
  petDog: '#c4a484',
  petDogDark: '#8b7355',
  petCat: '#ffa500',
  petCatDark: '#cc8400',
  petBird: '#87ceeb',
  petBirdDark: '#4682b4',
  
  // UI
  gold: '#ffd700',
  exp: '#ffeb3b',
  hp: '#ff4444',
  mp: '#4488ff',
  rare: '#a855f7',
  epic: '#f97316',
  legendary: '#f0c040'
};

// ==================== REALMS (Tu luyện cảnh giới) ====================
const REALMS = [
  { name: 'Luyện Khí Kỳ', stages: 9, atkBonus: 0, hpBonus: 0, defBonus: 0 },
  { name: 'Trúc Cơ Kỳ', stages: 9, atkBonus: 25, hpBonus: 150, defBonus: 5 },
  { name: 'Kim Đan Kỳ', stages: 9, atkBonus: 80, hpBonus: 400, defBonus: 15 },
  { name: 'Nguyên Anh Kỳ', stages: 9, atkBonus: 200, hpBonus: 1000, defBonus: 35 },
  { name: 'Hóa Thần Kỳ', stages: 9, atkBonus: 500, hpBonus: 2500, defBonus: 80 },
  { name: 'Luyện Hư Kỳ', stages: 9, atkBonus: 1200, hpBonus: 6000, defBonus: 180 },
  { name: 'Đại Thừa Kỳ', stages: 9, atkBonus: 3000, hpBonus: 15000, defBonus: 400 },
  { name: 'Độ Kiếp Kỳ', stages: 3, atkBonus: 8000, hpBonus: 40000, defBonus: 1000 },
  { name: 'Tiên Nhân', stages: 1, atkBonus: 20000, hpBonus: 100000, defBonus: 2500 }
];

// ==================== PETS ====================
const PETS = {
  dog: {
    id: 'dog',
    name: 'Linh Khuyển',
    desc: 'Chó linh hồn trung thành, tăng công kích',
    price: 500,
    bonus: { atk: 5 },
    expBonus: 0.1, // +10% EXP
    color: COLORS.petDog,
    colorDark: COLORS.petDogDark
  },
  cat: {
    id: 'cat',
    name: 'Linh Miêu',
    desc: 'Mèo linh hoạt, tăng phòng ngự',
    price: 500,
    bonus: { def: 5 },
    expBonus: 0.1,
    color: COLORS.petCat,
    colorDark: COLORS.petCatDark
  },
  bird: {
    id: 'bird',
    name: 'Thanh Điểu',
    desc: 'Chim xanh nhanh nhẹn, tăng tốc độ',
    price: 500,
    bonus: { speed: 0.3 }, // +10% speed (0.3 actual)
    expBonus: 0.1,
    color: COLORS.petBird,
    colorDark: COLORS.petBirdDark
  }
};

// ==================== SKILLS ====================
const SKILLS = [
  { 
    id: 0, name: 'Cơ Bản Kiếm Pháp', 
    cd: 800, maxCd: 800, 
    dmgMul: 1.0, mp: 0, 
    range: 65, type: 'melee',
    color: '#ffffff',
    desc: 'Đòn tấn công cơ bản'
  },
  { 
    id: 1, name: 'Kiếm Phong Trảm', 
    cd: 0, maxCd: 3000, 
    dmgMul: 2.2, mp: 10, 
    range: 130, type: 'projectile',
    color: '#87ceeb',
    desc: 'Phóng kiếm khí gây sát thương từ xa'
  },
  { 
    id: 2, name: 'Lôi Điện Thuật', 
    cd: 0, maxCd: 5000, 
    dmgMul: 3.0, mp: 20, 
    range: 160, type: 'aoe',
    color: '#ffff00',
    desc: 'Triệu hồi sấm sét tấn công kẻ địch'
  },
  { 
    id: 3, name: 'Vạn Kiếm Quy Tông', 
    cd: 0, maxCd: 10000, 
    dmgMul: 5.5, mp: 35, 
    range: 120, type: 'ultimate',
    color: '#ff00ff',
    desc: 'Tuyệt kỹ kiếm pháp, tấn công tất cả kẻ địch'
  }
];

// ==================== ITEMS ====================
const ITEMS = {
  // Consumables
  hpPotion: { 
    name: 'Hồi Khí Đan', type: 'consumable', rarity: 'common', 
    desc: 'Hồi phục 80 HP', effect: { hp: 80 }, 
    sellPrice: 5, icon: 'potion_red' 
  },
  hpPotionMedium: { 
    name: 'Trung Phẩm Hồi Khí Đan', type: 'consumable', rarity: 'rare', 
    desc: 'Hồi phục 250 HP', effect: { hp: 250 }, 
    sellPrice: 20, icon: 'potion_red' 
  },
  mpPotion: { 
    name: 'Linh Khí Đan', type: 'consumable', rarity: 'common', 
    desc: 'Hồi phục 40 MP', effect: { mp: 40 }, 
    sellPrice: 8, icon: 'potion_blue' 
  },
  mpPotionMedium: { 
    name: 'Trung Phẩm Linh Khí Đan', type: 'consumable', rarity: 'rare', 
    desc: 'Hồi phục 100 MP', effect: { mp: 100 }, 
    sellPrice: 25, icon: 'potion_blue' 
  },
  expPotion: { 
    name: 'Kinh Nghiệm Đan', type: 'consumable', rarity: 'rare', 
    desc: 'Nhận 200 EXP', effect: { exp: 200 }, 
    sellPrice: 50, icon: 'potion_yellow' 
  },
  realmPill: { 
    name: 'Đột Phá Đan', type: 'consumable', rarity: 'epic', 
    desc: 'Nhận 100 Tu Vi', effect: { realmExp: 100 }, 
    sellPrice: 200, icon: 'potion_purple' 
  },
  
  // Materials
  wolfFang: { 
    name: 'Nanh Sói', type: 'material', rarity: 'common', 
    desc: 'Nanh của sói xám, nguyên liệu luyện khí', 
    sellPrice: 3, icon: 'fang' 
  },
  wolfPelt: { 
    name: 'Da Sói', type: 'material', rarity: 'common', 
    desc: 'Da sói chất lượng tốt', 
    sellPrice: 5, icon: 'pelt' 
  },
  demonCore: { 
    name: 'Ma Hạch', type: 'material', rarity: 'rare', 
    desc: 'Hạch năng lượng của yêu ma', 
    sellPrice: 30, icon: 'core' 
  },
  spiritStone: { 
    name: 'Linh Thạch', type: 'material', rarity: 'rare', 
    desc: 'Đá chứa linh khí tinh thuần', 
    sellPrice: 50, icon: 'stone' 
  },
  dragonScale: { 
    name: 'Vảy Rồng', type: 'material', rarity: 'epic', 
    desc: 'Vảy của rồng cổ đại, cực kỳ quý hiếm', 
    sellPrice: 200, icon: 'scale' 
  },
  celestialOrb: { 
    name: 'Thiên Châu', type: 'material', rarity: 'legendary', 
    desc: 'Ngọc châu tiên giới, vô cùng quý giá', 
    sellPrice: 1000, icon: 'orb' 
  },
  
  // Equipment - Weapons
  woodenSword: { 
    name: 'Mộc Kiếm', type: 'weapon', rarity: 'common', 
    desc: 'Kiếm gỗ tập luyện', 
    stats: { atk: 3 }, sellPrice: 10, icon: 'sword_wood' 
  },
  ironSword: { 
    name: 'Thiết Kiếm', type: 'weapon', rarity: 'common', 
    desc: 'Kiếm sắt thường', 
    stats: { atk: 8 }, sellPrice: 30, icon: 'sword_iron' 
  },
  steelSword: { 
    name: 'Cương Kiếm', type: 'weapon', rarity: 'rare', 
    desc: 'Kiếm thép tinh luyện', 
    stats: { atk: 18, critRate: 0.03 }, sellPrice: 100, icon: 'sword_steel' 
  },
  silverSword: { 
    name: 'Bạch Ngân Kiếm', type: 'weapon', rarity: 'rare', 
    desc: 'Kiếm bạc hàng tinh luyện', 
    stats: { atk: 28, mp: 20 }, sellPrice: 200, icon: 'sword_silver' 
  },
  flameSword: { 
    name: 'Liệt Hỏa Kiếm', type: 'weapon', rarity: 'epic', 
    desc: 'Kiếm phong ấn hỏa diệm', 
    stats: { atk: 50, critDmg: 0.2 }, sellPrice: 500, icon: 'sword_fire' 
  },
  frostSword: { 
    name: 'Hàn Băng Kiếm', type: 'weapon', rarity: 'epic', 
    desc: 'Kiếm chứa hàn khí ngàn năm', 
    stats: { atk: 45, def: 10, mp: 30 }, sellPrice: 500, icon: 'sword_ice' 
  },
  celestialSword: { 
    name: 'Thiên Tiên Kiếm', type: 'weapon', rarity: 'legendary', 
    desc: 'Thần kiếm tiên giới, uy lực vô song', 
    stats: { atk: 120, critRate: 0.1, critDmg: 0.5, mp: 50 }, sellPrice: 2000, icon: 'sword_celestial' 
  },
  
  // Equipment - Armor
  clothRobe: { 
    name: 'Bố Y', type: 'armor', rarity: 'common', 
    desc: 'Áo vải thường', 
    stats: { def: 2, hp: 20 }, sellPrice: 15, icon: 'armor_cloth' 
  },
  leatherArmor: { 
    name: 'Bì Giáp', type: 'armor', rarity: 'common', 
    desc: 'Giáp da thú', 
    stats: { def: 5, hp: 40 }, sellPrice: 40, icon: 'armor_leather' 
  },
  ironArmor: { 
    name: 'Thiết Giáp', type: 'armor', rarity: 'rare', 
    desc: 'Giáp sắt kiên cố', 
    stats: { def: 12, hp: 80 }, sellPrice: 120, icon: 'armor_iron' 
  },
  spiritRobe: { 
    name: 'Linh Bào', type: 'armor', rarity: 'rare', 
    desc: 'Áo bào linh khí, tăng cường tu luyện', 
    stats: { def: 8, hp: 60, mp: 40 }, sellPrice: 180, icon: 'armor_spirit' 
  },
  dragonArmor: { 
    name: 'Long Lân Giáp', type: 'armor', rarity: 'epic', 
    desc: 'Giáp từ vảy rồng, phòng ngự cực cao', 
    stats: { def: 30, hp: 200 }, sellPrice: 600, icon: 'armor_dragon' 
  },
  celestialRobe: { 
    name: 'Tiên Nhân Pháp Bào', type: 'armor', rarity: 'legendary', 
    desc: 'Pháp bào tiên nhân, bảo hộ toàn diện', 
    stats: { def: 50, hp: 400, mp: 100, critRate: 0.05 }, sellPrice: 2500, icon: 'armor_celestial' 
  },
  
  // Equipment - Accessories
  copperRing: { 
    name: 'Đồng Chỉ', type: 'accessory', rarity: 'common', 
    desc: 'Nhẫn đồng đơn giản', 
    stats: { atk: 2 }, sellPrice: 20, icon: 'ring_copper' 
  },
  silverRing: { 
    name: 'Ngân Chỉ', type: 'accessory', rarity: 'rare', 
    desc: 'Nhẫn bạc tinh luyện', 
    stats: { atk: 5, critRate: 0.02 }, sellPrice: 80, icon: 'ring_silver' 
  },
  spiritPendant: { 
    name: 'Linh Ngọc Bội', type: 'accessory', rarity: 'rare', 
    desc: 'Bội ngọc chứa linh khí', 
    stats: { mp: 30, def: 3 }, sellPrice: 100, icon: 'pendant' 
  },
  dragonAmulet: { 
    name: 'Long Bài', type: 'accessory', rarity: 'epic', 
    desc: 'Hộ bài khắc hình rồng', 
    stats: { atk: 15, def: 10, hp: 100 }, sellPrice: 400, icon: 'amulet' 
  },
  celestialJade: { 
    name: 'Thiên Tiên Ngọc', type: 'accessory', rarity: 'legendary', 
    desc: 'Ngọc bội tiên giới', 
    stats: { atk: 30, def: 20, hp: 200, mp: 80, critRate: 0.08 }, sellPrice: 1500, icon: 'jade' 
  }
};

// ==================== GAME STATE ====================
const GameState = {
  running: false,
  time: 0,
  lastTime: 0,
  camera: { x: 0, y: 0 },
  minimapVisible: true,
  activePanel: null,
  particles: [],
  dmgNumbers: [],
  groundItems: [],
  
  // Tap to move
  tapTarget: null,        // { x, y } - điểm đích khi tap
  tapIndicator: null,     // { x, y, life } - hiệu ứng indicator
  isTapMoving: false      // đang di chuyển bằng tap
};

// ==================== UTILITY FUNCTIONS ====================
const Utils = {
  dist(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  },
  
  clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  },
  
  random(min, max) {
    return Math.random() * (max - min) + min;
  },
  
  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  
  chance(percent) {
    return Math.random() < percent;
  },
  
  formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return Math.floor(num).toString();
  },
  
  lerp(a, b, t) {
    return a + (b - a) * t;
  },
  
  angle(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
  }
};

console.log('📦 Config loaded');