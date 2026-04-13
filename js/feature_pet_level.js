// ==================== PET LEVEL SYSTEM ====================
// File: js/feature_pet_level.js
// Monkey-patch module — KHÔNG sửa bất kỳ file gốc nào.
// Thêm vào index.html sau <script src="js/game.js"></script>:
// <script src="js/feature_pet_level.js"></script>

// ============================================================
//  PHẦN 1 — DATA & CONFIG
// ============================================================

const PET_LEVEL_CONFIG = {
  maxLevel: 10,

  // EXP cần để lên từng level: index 0 = EXP để lên Lv2, index 8 = EXP để lên Lv10
  expTable: [
    100,   // Lv 1 → 2
    180,   // Lv 2 → 3
    300,   // Lv 3 → 4
    460,   // Lv 4 → 5
    660,   // Lv 5 → 6
    900,   // Lv 6 → 7
    1200,  // Lv 7 → 8
    1560,  // Lv 8 → 9
    2000   // Lv 9 → 10
  ],

  // Mỗi level tăng thêm 20% stat gốc của pet
  // dog Lv1: atk=5 | Lv3: atk = 5 * (1 + 2*0.20) = 7
  bonusPerLevel: 0.20,

  // Buff hiếm unlock tại Lv5 (chọn ngẫu nhiên 1 trong pool)
  rareBonusPool: [
    { id: 'critRate',  name: 'Bạo Kích',      value: 0.04  },  // +4% crit rate
    { id: 'expRate',   name: 'Thu Hoạch EXP',  value: 0.08  },  // +8% EXP
    { id: 'goldRate',  name: 'Vàng Rơi',       value: 0.08  },  // +8% gold drop
    { id: 'hpRegen',   name: 'Hồi Máu',        value: 3     },  // +3 HP regen/tick
    { id: 'mpRegen',   name: 'Hồi MP',         value: 2     }   // +2 MP regen/tick
  ]
};

// ============================================================
//  PHẦN 2 — LOGIC MODULE
// ============================================================

const PetLevelSystem = {

  // ── Khởi tạo petData mặc định cho một petId ──────────────
  _defaultData() {
    return { level: 1, exp: 0, rareBonus: null };
  },

  // ── Lấy EXP cần để lên level tiếp theo ──────────────────
  expForNextLevel(level) {
    if (level >= PET_LEVEL_CONFIG.maxLevel) return Infinity;
    return PET_LEVEL_CONFIG.expTable[level - 1] || Infinity;
  },

  // ── Trao EXP cho pet đang active ────────────────────────
  giveExp(amount) {
    if (!Player.activePet || !PETS[Player.activePet]) return;
    if (!Player.petData) return;

    const petId = Player.activePet;
    const data  = Player.petData[petId];
    if (!data) return;

    if (data.level >= PET_LEVEL_CONFIG.maxLevel) return;

    data.exp += amount;

    // Multi-level up loop
    while (data.level < PET_LEVEL_CONFIG.maxLevel) {
      const needed = this.expForNextLevel(data.level);
      if (data.exp < needed) break;

      data.exp -= needed;
      data.level++;

      // Áp stat mới
      Player.recalculateStats();

      const petName = PETS[petId].name;
      UI.addLog(`🐾 ${petName} thăng lên Lv.${data.level}!`, 'realm');
      UI.showNotification(`🐾 ${petName} Lv.${data.level}!`, 'Sức mạnh tăng lên!');

      // Unlock rare bonus tại đúng Lv5 lần đầu
      if (data.level === 5 && data.rareBonus === null) {
        this.rollRareBonus(petId);
      }
    }
  },

  // ── Roll buff hiếm ────────────────────────────────────────
  rollRareBonus(petId) {
    if (!Player.petData || !Player.petData[petId]) return;

    const pool   = PET_LEVEL_CONFIG.rareBonusPool;
    const picked = pool[Math.floor(Math.random() * pool.length)];

    Player.petData[petId].rareBonus = { ...picked };

    const petName = PETS[petId] ? PETS[petId].name : petId;
    UI.showNotification(
      `✨ ${petName} thức tỉnh!`,
      picked.name
    );
    UI.addLog(`✨ ${petName} thức tỉnh [${picked.name}]!`, 'realm');

    // Áp lại stat để rareBonus có hiệu lực ngay
    Player.recalculateStats();
  },

  // ── Tính bonus đã scale theo level ───────────────────────
  getBonusForPet(petId) {
    if (!petId || !PETS[petId]) return { atk: 0, def: 0, speed: 0 };

    const base  = PETS[petId].bonus;
    const data  = Player.petData && Player.petData[petId];
    const level = data ? data.level : 1;
    const mul   = 1 + (level - 1) * PET_LEVEL_CONFIG.bonusPerLevel;

    const bonus = {
      atk:   Math.round((base.atk   || 0) * mul),
      def:   Math.round((base.def   || 0) * mul),
      speed: parseFloat(((base.speed || 0) * mul).toFixed(3))
    };

    // Cộng rareBonus nếu có
    if (data && data.rareBonus) {
      const rb = data.rareBonus;
      if (rb.id === 'critRate')  bonus.critRate  = rb.value;
      if (rb.id === 'expRate')   bonus.expRate   = rb.value;
      if (rb.id === 'goldRate')  bonus.goldRate  = rb.value;
      if (rb.id === 'hpRegen')   bonus.hpRegen   = rb.value;
      if (rb.id === 'mpRegen')   bonus.mpRegen   = rb.value;
    }

    return bonus;
  },

  // ────────────────────────────────────────────────────────
  //  HOOKS (monkey-patch)
  // ────────────────────────────────────────────────────────

  _hookRecalculateStats() {
    const _orig = Player.recalculateStats.bind(Player);

    Player.recalculateStats = function () {
      // Gọi hàm gốc để tính tất cả stat trừ pet
      const realm = REALMS[this.realm];

      // Reset equipment bonuses
      this.equipAtk      = 0;
      this.equipDef      = 0;
      this.equipHp       = 0;
      this.equipMp       = 0;
      this.equipCritRate = 0;
      this.equipCritDmg  = 0;

      for (const slot in this.equipped) {
        const itemId = this.equipped[slot];
        if (itemId && ITEMS[itemId]) {
          const item = ITEMS[itemId];
          if (item.stats) {
            this.equipAtk      += item.stats.atk      || 0;
            this.equipDef      += item.stats.def      || 0;
            this.equipHp       += item.stats.hp       || 0;
            this.equipMp       += item.stats.mp       || 0;
            this.equipCritRate += item.stats.critRate  || 0;
            this.equipCritDmg  += item.stats.critDmg   || 0;
          }
        }
      }

      // Pet bonuses — đọc từ PetLevelSystem thay vì PETS trực tiếp
      let petAtk = 0, petDef = 0, petSpeed = 0;
      let petCritRate = 0, petExpRate = 0, petGoldRate = 0;
      let petHpRegen = 0, petMpRegen = 0;

      if (this.activePet && PETS[this.activePet]) {
        const petBonus = PetLevelSystem.getBonusForPet(this.activePet);
        petAtk      = petBonus.atk      || 0;
        petDef      = petBonus.def      || 0;
        petSpeed    = petBonus.speed    || 0;
        petCritRate = petBonus.critRate || 0;
        petExpRate  = petBonus.expRate  || 0;
        petGoldRate = petBonus.goldRate || 0;
        petHpRegen  = petBonus.hpRegen  || 0;
        petMpRegen  = petBonus.mpRegen  || 0;
      }

      // Final stats (clone logic từ hàm gốc + rare bonus)
      this.atk      = this.baseAtk + (this.level - 1) * 3 + realm.atkBonus + this.equipAtk + petAtk;
      this.def      = this.baseDef + (this.level - 1) * 1 + realm.defBonus + this.equipDef + petDef;
      this.maxHp    = 100 + (this.level - 1) * 15 + realm.hpBonus + this.equipHp;
      this.maxMp    = 50  + (this.level - 1) * 8  + this.equipMp;
      this.critRate = 0.08 + this.equipCritRate + petCritRate;
      this.critDmg  = 1.5  + this.equipCritDmg;
      this.speed    = this.baseSpeed + petSpeed;

      // Lưu rare bonus rates để dùng ở nơi khác
      this._petExpRate   = petExpRate;
      this._petGoldRate  = petGoldRate;
      this._petHpRegen   = petHpRegen;
      this._petMpRegen   = petMpRegen;

      this.hp = Math.min(this.hp, this.maxHp);
      this.mp = Math.min(this.mp, this.maxMp);
    };
  },

  _hookEnemiesKill() {
    const _orig = Enemies.kill.bind(Enemies);

    Enemies.kill = function (enemy) {
      // Lưu exp trước khi gọi hàm gốc
      const petExp = Math.floor((enemy.exp || 0) * 0.3);

      // Gold rate bonus từ pet
      if (Player._petGoldRate && Player._petGoldRate > 0) {
        enemy.gold = Math.floor((enemy.gold || 0) * (1 + Player._petGoldRate));
      }

      _orig(enemy);

      // Trao EXP cho pet
      if (petExp > 0) {
        PetLevelSystem.giveExp(petExp);
      }
    };
  },

  _hookGainExp() {
    const _orig = Player.gainExp.bind(Player);

    Player.gainExp = function (amount) {
      // Áp expRate từ rare bonus của pet
      if (this._petExpRate && this._petExpRate > 0 && this.activePet) {
        amount = Math.floor(amount * (1 + this._petExpRate));
      }
      _orig(amount);
    };
  },

  _hookPlayerUpdate() {
    // Hook vào Player.update để xử lý hpRegen / mpRegen từ rare bonus
    const _orig = Player.update.bind(Player);

    Player.update = function (dt, inputX, inputY) {
      _orig(dt, inputX, inputY);

      // Regen mỗi 2 giây (khớp với logic gốc)
      if (GameState.time % 2000 < dt) {
        if (this._petHpRegen && this._petHpRegen > 0) {
          this.hp = Math.min(this.maxHp, this.hp + this._petHpRegen);
        }
        if (this._petMpRegen && this._petMpRegen > 0) {
          this.mp = Math.min(this.maxMp, this.mp + this._petMpRegen);
        }
      }
    };
  },

  _hookSaveData() {
    const _origGet  = Player.getSaveData.bind(Player);
    const _origLoad = Player.loadSaveData.bind(Player);

    Player.getSaveData = function () {
      const data = _origGet();
      data.petData = Player.petData
        ? JSON.parse(JSON.stringify(Player.petData))
        : {};
      return data;
    };

    Player.loadSaveData = function (data) {
      _origLoad(data);

      // Merge petData an toàn
      const saved = (data && data.petData) ? data.petData : {};
      Player.petData = Player.petData || {};

      for (const petId in PETS) {
        if (saved[petId] && typeof saved[petId].level === 'number') {
          Player.petData[petId] = {
            level:     saved[petId].level     || 1,
            exp:       saved[petId].exp       || 0,
            rareBonus: saved[petId].rareBonus || null
          };
        } else {
          Player.petData[petId] = Player.petData[petId] || PetLevelSystem._defaultData();
        }
      }

      // Áp stat sau load
      Player.recalculateStats();
    };
  },

  _hookBuildPetsShop() {
    const _orig = NPC.buildPetsShop.bind(NPC);

    NPC.buildPetsShop = function (container) {
      _orig(container);

      if (!Player.petData) return;

      // Tìm tất cả npc-option div và thêm info level/EXP
      const options = container.querySelectorAll('.npc-option');

      let petIdxInOwned = 0;
      for (const petId in PETS) {
        if (!Player.ownedPets.includes(petId)) continue;

        const data = Player.petData[petId];
        if (!data) { petIdxInOwned++; continue; }

        const needed = PetLevelSystem.expForNextLevel(data.level);
        const neededTxt = needed === Infinity ? 'MAX' : `${data.exp}/${needed}`;

        // Tìm option tương ứng với pet này trong DOM
        // Các option owned nằm sau title và currentInfo (nếu có)
        // Dùng attribute tìm kiếm chắc chắn hơn: tìm div có chứa text pet.name
        const petName = PETS[petId].name;
        for (const opt of options) {
          if (opt.textContent.includes(petName)) {
            // Xoá info cũ nếu đã thêm rồi (khi refresh)
            const oldInfo = opt.querySelector('.pls-level-info');
            if (oldInfo) oldInfo.remove();

            const info = document.createElement('div');
            info.className = 'pls-level-info';
            info.style.cssText = 'font-size:9px;color:#8ef;margin-top:3px;line-height:1.5';

            let infoHtml = `Lv.${data.level} — EXP: ${neededTxt}`;

            if (data.rareBonus) {
              infoHtml += ` | <span style="color:#e040fb">✨ ${data.rareBonus.name}</span>`;
            }

            info.innerHTML = infoHtml;
            opt.appendChild(info);
            break;
          }
        }

        petIdxInOwned++;
      }
    };
  },

  _hookRenderCharacter() {
    const _orig = UI.renderCharacter.bind(UI);

    UI.renderCharacter = function () {
      _orig();

      if (!Player.activePet || !Player.petData) return;

      const petId = Player.activePet;
      const data  = Player.petData[petId];
      if (!data) return;

      const petName = PETS[petId] ? PETS[petId].name : petId;
      const needed  = PetLevelSystem.expForNextLevel(data.level);
      const pct     = needed === Infinity ? 100 : Math.floor(data.exp / needed * 100);

      // Tìm pet section trong charPanel (div có border-top:#333)
      const charPanel = document.getElementById('characterPanel');
      if (!charPanel) return;

      // Tìm div chứa canvas charPetCanvas (pet section)
      const petCanvas = charPanel.querySelector('#charPetCanvas');
      if (!petCanvas) return;

      const petSection = petCanvas.closest('[style*="border-top"]') ||
                         petCanvas.parentElement.parentElement.parentElement;
      if (!petSection) return;

      // Xoá widget EXP cũ nếu có
      const old = petSection.querySelector('.pls-exp-bar-wrap');
      if (old) old.remove();

      const wrap = document.createElement('div');
      wrap.className = 'pls-exp-bar-wrap';
      wrap.style.cssText = 'margin-top:10px;padding:0 2px';

      const label = document.createElement('div');
      label.style.cssText = 'display:flex;justify-content:space-between;font-size:10px;color:#aaa;margin-bottom:4px';

      const neededTxt = needed === Infinity
        ? `Lv.${data.level} (MAX)`
        : `Lv.${data.level} | EXP ${data.exp}/${needed}`;

      label.innerHTML = `<span>🐾 ${petName}</span><span style="color:#8ef">${neededTxt}</span>`;

      const track = document.createElement('div');
      track.style.cssText = `
        width:100%;height:8px;background:#1a1a2e;border-radius:4px;
        border:1px solid #333;overflow:hidden;
      `;

      const fill = document.createElement('div');
      fill.style.cssText = `
        height:100%;width:${pct}%;border-radius:4px;
        background:linear-gradient(90deg,#f0c040,#ffaa00);
        transition:width 0.4s ease;
      `;

      track.appendChild(fill);
      wrap.appendChild(label);
      wrap.appendChild(track);

      // Rare bonus badge
      if (data.rareBonus) {
        const badge = document.createElement('div');
        badge.style.cssText = 'margin-top:5px;font-size:10px;color:#e040fb;text-align:center';
        badge.textContent = `✨ ${data.rareBonus.name}`;
        wrap.appendChild(badge);
      }

      petSection.appendChild(wrap);
    };
  },

  // ────────────────────────────────────────────────────────
  //  CSS injection (progress bar & log color)
  // ────────────────────────────────────────────────────────
  _injectCSS() {
    if (document.getElementById('pls-style')) return;
    const style = document.createElement('style');
    style.id = 'pls-style';
    style.textContent = `
      .log-msg.realm { color: #ce93d8; }
      .pls-level-info a, .pls-level-info span { font-family: 'Courier New', monospace; }
    `;
    document.head.appendChild(style);
  }
};

// ============================================================
//  PHẦN 3 — KHỞI ĐỘNG
// ============================================================

PetLevelSystem.init = function () {
  // Khởi tạo Player.petData nếu chưa có
  if (!Player.petData) {
    Player.petData = {};
  }

  // Đảm bảo mọi petId trong PETS đều có entry
  for (const petId in PETS) {
    if (!Player.petData[petId]) {
      Player.petData[petId] = PetLevelSystem._defaultData();
    }
  }

  // Áp stat đúng ngay từ đầu
  Player.recalculateStats();

  console.log('🐾 PetLevelSystem init complete. petData:', JSON.stringify(Player.petData));
};

// Wrap Game.init để chèn PetLevelSystem.init() sau khi Game.init gốc chạy xong
(function () {
  const _origGameInit = Game.init.bind(Game);

  Game.init = function () {
    _origGameInit();
    PetLevelSystem.init();
    console.log('🐾 PetLevelSystem booted after Game.init');
  };
})();

// Đăng ký tất cả hooks (chạy ngay khi file được load,
// trước khi Game.init được gọi — các hàm được wrap, chưa chạy)
PetLevelSystem._injectCSS();
PetLevelSystem._hookRecalculateStats();
PetLevelSystem._hookEnemiesKill();
PetLevelSystem._hookGainExp();
PetLevelSystem._hookPlayerUpdate();
PetLevelSystem._hookSaveData();
PetLevelSystem._hookBuildPetsShop();
PetLevelSystem._hookRenderCharacter();

console.log('🐾 Pet Level System loaded');

// ============================================================
// Thêm vào index.html sau <script src="js/game.js"></script>:
// <script src="js/feature_pet_level.js"></script>
// ============================================================
