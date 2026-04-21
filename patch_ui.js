// ==================== PATCH UI ====================
// Thực hiện [1][2][4][5]
// Load sau ui.js, trước game.js (hoặc cuối body)

(function patchUI() {

  // ================================================================
  // [1] XÓA DÒNG HIỂN THỊ GOLD & QUEST TRACKER Ở TRÊN CÙNG GIỮA
  // ================================================================
  function removeTopHUD() {
    // #questTracker — top:10px center (quest tracker)
    const questTracker = document.getElementById('questTracker');
    if (questTracker) {
      questTracker.style.display = 'none';
    } else {
      console.warn('[patch_ui] TODO: verify — không tìm thấy #questTracker');
    }

    // #goldDisplay — top:10px left:180px (gold display)
    const goldDisplay = document.getElementById('goldDisplay');
    if (goldDisplay) {
      goldDisplay.style.display = 'none';
    } else {
      console.warn('[patch_ui] TODO: verify — không tìm thấy #goldDisplay');
    }
  }

  // ================================================================
  // [2] XÓA POPUP "OAN HỒN XUẤT HIỆN" — chỉ xóa phần render popup
  // Giữ nguyên dòng log vào chat/combat log
  // Popup đến từ UI.showNotification() trong GhostPvPSystem.enterArena()
  // Ta wrap UI.showNotification để lọc thông báo Oan hồn/Thi Đấu
  // ================================================================
  function patchGhostNotification() {
    // Đợi UI sẵn sàng (load sau ui.js)
    if (typeof UI === 'undefined' || typeof UI.showNotification !== 'function') {
      console.warn('[patch_ui] UI.showNotification chưa sẵn sàng, thử lại sau...');
      return false;
    }

    const _origShowNotification = UI.showNotification.bind(UI);

    UI.showNotification = function(title, subtitle, duration) {
      // Lọc popup thông báo oan hồn/thi đấu xuất hiện
      // enterArena gọi: UI.showNotification('⚔️ Thi Đấu!', ghostConfig.name + ' vs Ngươi!')
      const GHOST_POPUP_PATTERNS = [
        /thi\s*đấu/i,
        /ghost/i,
        /oan\s*hồn/i,
        /vs\s*ngươi/i
      ];

      const combined = (title || '') + ' ' + (subtitle || '');
      const isGhostPopup = GHOST_POPUP_PATTERNS.some(rx => rx.test(combined));

      if (isGhostPopup) {
        // Bỏ qua popup, log vào console để debug nếu cần
        console.log('[patch_ui] Đã chặn popup Oan hồn:', title, subtitle);
        return;
      }

      _origShowNotification(title, subtitle, duration);
    };

    console.log('[patch_ui] ✅ Đã patch UI.showNotification — chặn popup Oan hồn');
    return true;
  }

  // ================================================================
  // [4] DỊCH THANH AUTO FARM & TU LUYỆN XUỐNG 50px
  // #autoPanel hiện tại: top:80px left:10px
  // HP bar (stat-bar đầu tiên) nằm trong #statsPanel bắt đầu ở ~top:10px + 60px avatar = ~80px
  // Thanh stat-bar có height:14px, gap:4px → 3 bar ≈ 54px → #statsPanel kết thúc ở ~top:124px
  // Tăng top lên 140px để không còn che thanh HP/MP
  // ================================================================
  function moveAutoPanel() {
    const autoPanel = document.getElementById('autoPanel');
    if (autoPanel) {
      autoPanel.style.top = '140px';
    } else {
      console.warn('[patch_ui] TODO: verify — không tìm thấy #autoPanel');
    }

    // autoModeDisplay cũng cần dịch xuống tương ứng (hiện tại top:160px)
    const autoModeDisplay = document.getElementById('autoModeDisplay');
    if (autoModeDisplay) {
      autoModeDisplay.style.top = '220px';
    }
  }

  // ================================================================
  // [5] THU NHỎ AVATAR + THANH HP/MP
  // #avatarFrame: 60px → 42px (~70%)
  // .stat-bar height: 14px → 12px
  // #statsPanel min-width: 150px → 120px
  // ================================================================
  function shrinkHUD() {
    // Avatar frame
    const avatarFrame = document.getElementById('avatarFrame');
    if (avatarFrame) {
      avatarFrame.style.width = '42px';
      avatarFrame.style.height = '42px';
    } else {
      console.warn('[patch_ui] TODO: verify — không tìm thấy #avatarFrame');
    }

    // Stats panel min-width
    const statsPanel = document.getElementById('statsPanel');
    if (statsPanel) {
      statsPanel.style.minWidth = '120px';
    }

    // Inject CSS để thu nhỏ stat-bar toàn bộ
    const style = document.createElement('style');
    style.id = 'patch-ui-hud-shrink';
    style.textContent = `
      /* [5] Thu nhỏ stat-bar HP/MP/EXP */
      .stat-bar {
        height: 12px !important;
      }
      .stat-bar-text {
        font-size: 8px !important;
      }
      /* Thu nhỏ level badge */
      #levelBadge {
        font-size: 9px !important;
        padding: 1px 4px !important;
      }
      /* Thu nhỏ player name/realm */
      #playerName {
        font-size: 11px !important;
      }
      #realmTitle {
        font-size: 9px !important;
      }
    `;
    document.head.appendChild(style);

    console.log('[patch_ui] ✅ HUD đã được thu nhỏ');
  }

  // ================================================================
  // KHỞI CHẠY
  // ================================================================
  function applyAll() {
    removeTopHUD();           // [1]
    moveAutoPanel();          // [4]
    shrinkHUD();              // [5]

    // [2] Cần patch sau khi UI object sẵn sàng
    // Thử ngay, nếu UI chưa load thì đợi
    if (!patchGhostNotification()) {
      // Fallback: thử lại sau 500ms (đợi ui.js + game.js xong)
      setTimeout(() => {
        patchGhostNotification();
      }, 500);
    }

    console.log('[patch_ui] ✅ Tất cả patch UI đã áp dụng');
  }

  // Chạy khi DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyAll);
  } else {
    applyAll();
  }

})();
