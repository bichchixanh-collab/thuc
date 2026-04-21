// character_tabs.js
// Thêm vào index.html SAU tất cả <script> khác:
//   <script src="js/character_tabs.js"></script>

(function () {
  'use strict';

  // ── CSS ──────────────────────────────────────────────────
  const s = document.createElement('style');
  s.textContent = `
    #charTabBar { display:flex; gap:4px; margin-bottom:12px; }
    .ctab-btn {
      flex:1; padding:7px 2px; text-align:center; cursor:pointer;
      font-family:'Courier New',monospace; font-size:9px; white-space:nowrap;
      background:rgba(255,255,255,0.03); border:1px solid #444;
      border-radius:8px; color:#888;
    }
    .ctab-btn.active { background:rgba(240,192,64,0.18); border-color:#f0c040; color:#f0c040; }
    .ctab-pane { display:none; }
    .ctab-pane.active { display:block; }
  `;
  document.head.appendChild(s);

  const TABS = [
    { id:'stat',  label:'📊 Chỉ Số'    },
    { id:'equip', label:'⚔️ Trang Bị'  },
    { id:'build', label:'📖 Tu Luyện'  },
    { id:'look',  label:'👘 Ngoại Hình' },
  ];

  let activeTab = 'stat';

  function buildShell() {
    const modal = document.querySelector('#characterPanel .modal-panel');
    if (!modal || modal.querySelector('#charTabBar')) return;

    const bar = document.createElement('div');
    bar.id = 'charTabBar';
    TABS.forEach((t, i) => {
      const btn = document.createElement('div');
      btn.className = 'ctab-btn' + (i === 0 ? ' active' : '');
      btn.dataset.tab = t.id;
      btn.textContent = t.label;
      btn.onclick = () => switchTab(t.id);
      bar.appendChild(btn);
    });
    modal.querySelector('.modal-header').insertAdjacentElement('afterend', bar);

    TABS.forEach((t, i) => {
      const pane = document.createElement('div');
      pane.id = 'ctab-' + t.id;
      pane.className = 'ctab-pane' + (i === 0 ? ' active' : '');
      modal.appendChild(pane);
    });
  }

  function switchTab(id) {
    activeTab = id;
    document.querySelectorAll('.ctab-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.tab === id));
    document.querySelectorAll('.ctab-pane').forEach(p =>
      p.classList.toggle('active', p.id === 'ctab-' + id));
  }

  function distribute() {
    const modal = document.querySelector('#characterPanel .modal-panel');
    if (!modal) return;

    buildShell();

    const pStat  = document.getElementById('ctab-stat');
    const pEquip = document.getElementById('ctab-equip');
    const pBuild = document.getElementById('ctab-build');
    const pLook  = document.getElementById('ctab-look');
    if (!pStat) return;

    [pStat, pEquip, pBuild, pLook].forEach(p => { p.innerHTML = ''; });

    // Tab Chỉ Số: realm-bar + charStats
    const realmBar = modal.querySelector('.realm-bar');
    if (realmBar) pStat.appendChild(realmBar);
    const charStats = document.getElementById('charStats');
    if (charStats) pStat.appendChild(charStats);

    // Tab Trang Bị: wrapper chứa equippedItems + pet section
    const equippedEl = document.getElementById('equippedItems');
    if (equippedEl) {
      let wrapper = equippedEl;
      while (wrapper.parentElement && wrapper.parentElement !== modal) {
        wrapper = wrapper.parentElement;
      }
      pEquip.appendChild(wrapper);
    }
    if (charStats) {
      const pet = Array.from(charStats.children)
        .find(c => !c.classList.contains('char-stat-row'));
      if (pet) pEquip.appendChild(pet);
    }

    // Tab Tu Luyện: buildSection (inject bởi CharacterBuildUI sau orig render)
    const buildSection = document.getElementById('buildSection');
    if (buildSection) pBuild.appendChild(buildSection);
    else pBuild.innerHTML = '<div style="color:#666;font-size:11px;text-align:center;padding:20px">Chưa có dữ liệu</div>';

    // Tab Ngoại Hình: nút mở AppearancePanel
    let appBtn = document.getElementById('ctabAppBtn');
    if (!appBtn) {
      appBtn = document.createElement('button');
      appBtn.id = 'ctabAppBtn';
      appBtn.textContent = '👘 Mở Tùy Chỉnh Ngoại Hình';
      appBtn.style.cssText =
        'width:100%;padding:14px;margin-top:8px;border:2px solid #f0c040;'
        + 'border-radius:10px;background:rgba(240,192,64,0.12);color:#f0c040;'
        + 'font-size:13px;font-weight:bold;cursor:pointer;font-family:"Courier New",monospace;';
      appBtn.onclick = () => {
        if (typeof AppearancePanel !== 'undefined') AppearancePanel.open();
        else UI.addLog('Ngoại Hình chưa tải', 'system');
      };
    }
    pLook.appendChild(appBtn);

    // Ẩn phần tử gốc thừa trong modal
    Array.from(modal.children).forEach(c => {
      const keep = c.classList.contains('modal-header')
        || c.id === 'charTabBar'
        || c.classList.contains('ctab-pane');
      c.style.display = keep ? '' : 'none';
    });

    switchTab(activeTab);
  }

  // ── Patch UI.renderCharacter ──────────────────────────────
  // Dùng window.load để chắc chắn chạy SAU tất cả inline script và feature files.
  // Lúc này mọi wrap của feature_character_build.js đã xong.
  window.addEventListener('load', function () {
    if (typeof UI === 'undefined') {
      console.warn('character_tabs.js: UI chưa sẵn sàng');
      return;
    }

    const orig = UI.renderCharacter.bind(UI);
    UI.renderCharacter = function () {
      orig();
      // timeout 0: đợi CharacterBuildUI.injectBuildSection() chạy đồng bộ xong
      setTimeout(distribute, 0);
    };

    console.log('🗂️ character_tabs.js: ready');
  });

})();
