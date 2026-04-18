// ==================== APPEARANCE SYSTEM PATCH ====================
// File: js/feature_appearance_patch.js
// Mục đích: Bổ sung method setColor() và applySkin() vào AppearanceSystem
//           để UI.renderCharacter() tab "Ngoại Hình" gọi được trực tiếp.
// Load SAU feature_appearance.js:
//   <script src="js/feature_appearance.js"></script>
//   <script src="js/feature_appearance_patch.js"></script>
// =================================================================

(function patchAppearanceSystem() {
  if (typeof AppearanceSystem === 'undefined') {
    console.warn('[AppearancePatch] AppearanceSystem chưa được load!');
    return;
  }

  // ── setColor(partKey, color) ──────────────────────────────────
  // Đặt màu cho 1 phần, rồi rebuild sprite + refresh canvas
  if (typeof AppearanceSystem.setColor !== 'function') {
    AppearanceSystem.setColor = function(partKey, color) {
      if (!this.state.currentColors.hasOwnProperty(partKey)) return;
      this.state.currentColors[partKey] = color;
      this.state.currentSkin = 'custom'; // đánh dấu custom
      this.rebuildPlayerSprites();

      // Refresh preview canvas trong char panel (nếu đang mở)
      setTimeout(() => {
        const c = document.getElementById('charAppearancePreview');
        if (c) {
          const ctx = c.getContext('2d');
          ctx.clearRect(0, 0, 32, 32);
          Sprites.drawPixelArt(ctx, Sprites.player.down, 2, 0, 0);
        }
        // Refresh avatar HUD
        const av = document.getElementById('avatarCanvas');
        if (av) {
          const ctx = av.getContext('2d');
          ctx.clearRect(0, 0, 32, 32);
          Sprites.drawPixelArt(ctx, Sprites.player.down, 2, 0, 0);
        }
      }, 10);
    };
    console.log('[AppearancePatch] setColor() đã được thêm vào AppearanceSystem.');
  }

  // ── applySkin(skinId) ─────────────────────────────────────────
  // Áp dụng 1 preset skin theo id
  if (typeof AppearanceSystem.applySkin !== 'function') {
    AppearanceSystem.applySkin = function(skinId) {
      const skin = APPEARANCE_CONFIG.presetSkins[skinId];
      if (!skin) {
        console.warn('[AppearancePatch] applySkin: skinId không hợp lệ:', skinId);
        return;
      }
      if (!this.state.unlockedSkins.includes(skinId)) {
        UI.addLog('🔒 Skin này chưa được mở khóa!', 'system');
        return;
      }

      // Áp các màu từ preset
      const colorKeys = ['hair', 'skin', 'robe', 'robeDark', 'belt', 'eye'];
      colorKeys.forEach(k => {
        if (skin[k]) this.state.currentColors[k] = skin[k];
      });
      this.state.currentSkin = skinId;
      this.rebuildPlayerSprites();

      // Refresh canvases
      setTimeout(() => {
        const c = document.getElementById('charAppearancePreview');
        if (c) {
          const ctx = c.getContext('2d');
          ctx.clearRect(0, 0, 32, 32);
          Sprites.drawPixelArt(ctx, Sprites.player.down, 2, 0, 0);
        }
        const av = document.getElementById('avatarCanvas');
        if (av) {
          const ctx = av.getContext('2d');
          ctx.clearRect(0, 0, 32, 32);
          Sprites.drawPixelArt(ctx, Sprites.player.down, 2, 0, 0);
        }
      }, 10);

      UI.addLog(`🎨 Đã áp dụng skin: ${skin.name}`, 'system');
    };
    console.log('[AppearancePatch] applySkin() đã được thêm vào AppearanceSystem.');
  }

  console.log('[AppearancePatch] Patch hoàn tất.');
})();
