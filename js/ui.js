// Shared UI helpers, app state, location control, and reusable renderers.
window.AppState = { location: null, radius: CONFIG.DEFAULT_RADIUS, source: 'default' };

window.U = (function () {
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // ---------- toast ----------
  let toastTimer;
  function toast(msg, ms) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, ms || 2600);
  }

  // ---------- loader ----------
  function loading(show) {
    document.getElementById('loader').classList.toggle('hidden', !show);
  }

  // ---------- routing ----------
  function showMode(id) {
    document.querySelectorAll('.view').forEach(function (v) { v.classList.remove('is-active'); });
    const el = document.getElementById('view-' + id);
    if (el) el.classList.add('is-active');
    window.scrollTo({ top: 0, behavior: 'auto' });
  }
  function goHome() { showMode('home'); }

  // ---------- location ----------
  function renderLocationChip() {
    const chip = document.getElementById('locationChip');
    if (!AppState.location) { chip.textContent = '📍 定位中… Locating…'; return; }
    if (AppState.source === 'gps') chip.textContent = '📍 已定位 · Located';
    else if (AppState.source === 'manual') chip.textContent = '📍 已設定 · Custom';
    else chip.textContent = '📍 ' + CONFIG.DEFAULT_LOCATION.label;
  }

  function useDefault() {
    AppState.location = { lat: CONFIG.DEFAULT_LOCATION.lat, lng: CONFIG.DEFAULT_LOCATION.lng };
    AppState.source = 'default';
    renderLocationChip();
  }

  function initLocation() {
    renderLocationChip();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        function (pos) {
          AppState.location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          AppState.source = 'gps';
          renderLocationChip();
        },
        function () { useDefault(); },
        { timeout: 8000, maximumAge: 300000 }
      );
    } else useDefault();
  }

  function openLocationModal() {
    const loc = AppState.location || CONFIG.DEFAULT_LOCATION;
    const html =
      '<h3>📍 設定位置 <span>Set location</span></h3>' +
      '<p class="modal-sub">輸入經緯度，或用瀏覽器定位。Enter coordinates or use GPS.</p>' +
      '<label>緯度 Latitude <input id="loc-lat" type="number" step="any" value="' + loc.lat + '"></label>' +
      '<label>經度 Longitude <input id="loc-lng" type="number" step="any" value="' + loc.lng + '"></label>' +
      '<label>搜尋半徑 Radius (米 m) <input id="loc-radius" type="number" value="' + AppState.radius + '"></label>' +
      '<div class="modal-actions">' +
      '  <button id="loc-gps" class="btn-ghost" type="button">📍 重新定位 Relocate</button>' +
      '  <button id="loc-default" class="btn-ghost" type="button">🗺️ 預設香港 HK</button>' +
      '  <button id="loc-save" class="btn-primary" type="button">儲存 Save</button>' +
      '</div>';
    const overlay = openModal(html);
    overlay.querySelector('#loc-gps').addEventListener('click', function () {
      if (!navigator.geolocation) { toast('不支援定位 Geolocation unsupported'); return; }
      navigator.geolocation.getCurrentPosition(function (pos) {
        overlay.querySelector('#loc-lat').value = pos.coords.latitude.toFixed(6);
        overlay.querySelector('#loc-lng').value = pos.coords.longitude.toFixed(6);
      }, function () { toast('定位失敗 Location failed'); });
    });
    overlay.querySelector('#loc-default').addEventListener('click', function () {
      overlay.querySelector('#loc-lat').value = CONFIG.DEFAULT_LOCATION.lat;
      overlay.querySelector('#loc-lng').value = CONFIG.DEFAULT_LOCATION.lng;
    });
    overlay.querySelector('#loc-save').addEventListener('click', function () {
      const lat = parseFloat(overlay.querySelector('#loc-lat').value);
      const lng = parseFloat(overlay.querySelector('#loc-lng').value);
      const radius = parseFloat(overlay.querySelector('#loc-radius').value) || CONFIG.DEFAULT_RADIUS;
      if (isNaN(lat) || isNaN(lng)) { toast('請輸入有效座標 Please enter valid coordinates'); return; }
      AppState.location = { lat: lat, lng: lng };
      AppState.radius = radius;
      AppState.source = 'manual';
      renderLocationChip();
      closeModal();
      toast('位置已更新 Location updated');
    });
  }

  // ---------- modal ----------
  function openModal(html) {
    const root = document.getElementById('modal-root');
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = '<div class="modal-card">' + html + '<button class="modal-close" type="button" aria-label="Close">✕</button></div>';
    root.appendChild(overlay);
    const close = function () { overlay.remove(); };
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    overlay.querySelector('.modal-close').addEventListener('click', close);
    overlay._close = close;
    return overlay;
  }
  function closeModal() {
    document.querySelectorAll('.modal-overlay').forEach(function (o) { o.remove(); });
  }

  // ---------- cuisine chips ----------
  function renderCuisineChips(container) {
    container.innerHTML = D.CUISINES.map(function (c) {
      return '<button class="chip" data-cuisine="' + c.id + '" type="button">' + c.emoji +
        ' <span class="chip-zh">' + esc(c.zh) + '</span> <span class="chip-en">' + esc(c.en) + '</span></button>';
    }).join('');
  }
  function setChipSelected(container, id) {
    container.querySelectorAll('.chip').forEach(function (c) {
      c.classList.toggle('selected', c.dataset.cuisine === id);
    });
  }

  // ---------- restaurant presentation ----------
  function deg2rad(d) { return d * Math.PI / 180; }
  function distanceText(place) {
    if (!AppState.location || place.lat == null || place.lng == null) return '';
    const R = 6371;
    const dLat = deg2rad(place.lat - AppState.location.lat);
    const dLng = deg2rad(place.lng - AppState.location.lng);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(AppState.location.lat)) * Math.cos(deg2rad(place.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const km = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    if (km < 1) return Math.round(km * 1000) + ' m';
    return km.toFixed(1) + ' km';
  }
  function starsHtml(r) {
    if (r == null) return '☆☆☆☆☆';
    let s = '';
    const full = Math.round(r);
    for (let i = 0; i < 5; i++) s += (i < full ? '★' : '☆');
    return s;
  }
  function priceSymbols(level) {
    if (level == null) return '';
    const n = parseInt(level, 10);
    if (isNaN(n)) return '';
    return ['$', '$', '$$', '$$$', '$$$$'][Math.min(Math.max(n, 0), 4)];
  }
  function restaurantCard(place, opts) {
    opts = opts || {};
    const photo = place.photoUrl ? 'style="background-image:url(\'' + esc(place.photoUrl) + '\')"' : '';
    const rank = opts.rank ? '<span class="rc-rank">#' + opts.rank + '</span>' : '<span class="rc-rank rc-rank-photo">🍽️</span>';
    let open = '';
    if (place.openNow === true) open = '<span class="rc-open is-open">營業中 Open</span>';
    else if (place.openNow === false) open = '<span class="rc-open is-closed">休息中 Closed</span>';
    const menu = (opts.menu && opts.menu.length)
      ? '<div class="rc-menu">' + opts.menu.slice(0, 5).map(function (m) { return '<span class="menu-chip">' + esc(m.zh) + '</span>'; }).join('') + '</div>'
      : '';
    return '<article class="restaurant-card">' +
      '<div class="rc-photo' + (place.photoUrl ? '' : ' no-photo') + '" ' + photo + '>' + rank + '</div>' +
      '<div class="rc-body">' +
      '  <div class="rc-name">' + esc(place.name) + '</div>' +
      '  <div class="rc-meta">' +
      '    <span class="rc-rating">⭐ ' + (place.rating ? place.rating.toFixed(1) : '—') + ' ' + starsHtml(place.rating) + '</span>' +
      (place.userRatingCount ? '<span class="rc-count">(' + place.userRatingCount + ' 評價)</span>' : '') +
      (priceSymbols(place.priceLevel) ? '<span class="rc-price">' + esc(priceSymbols(place.priceLevel)) + '</span>' : '') +
      (distanceText(place) ? '<span class="rc-distance">📏 ' + esc(distanceText(place)) + '</span>' : '') +
      open +
      '  </div>' +
      (place.address ? '<div class="rc-address">' + esc(place.address) + '</div>' : '') +
      menu +
      '  <div class="rc-actions">' +
      '    <a class="btn-primary" href="' + navUrl(place) + '" target="_blank" rel="noopener">🧭 導航 Navigate</a>' +
      '  </div>' +
      '</div>' +
      '</article>';
  }

  // ---------- notify modal ----------
  function openNotifyModal(place) {
    const selected = [];
    const html =
      '<h3>📣 通知餐廳 <span>Notify restaurant</span></h3>' +
      '<p class="modal-sub">' + esc(place.name) + '</p>' +
      '<div class="notify-group"><span class="group-label">食物過敏 Allergies</span>' +
      '<div class="chip-row allergen-chips">' +
      D.ALLERGENS.map(function (a) { return '<button class="chip small" data-ag="' + a.id + '" type="button">' + esc(a.zh) + ' ' + esc(a.en) + '</button>'; }).join('') +
      '</div></div>' +
      '<label>餐桌位置 Table location <input id="nf-location" placeholder="窗邊 / 卡座 / 高枱 window / booth / high table"></label>' +
      '<label>特別活動 Special event <input id="nf-event" placeholder="生日 / 紀念日 birthday / anniversary"></label>' +
      '<div class="msg-preview" id="nf-msg"></div>' +
      '<div class="modal-actions">' +
      '  <button id="nf-copy" class="btn-ghost" type="button">📋 複製訊息 Copy</button>' +
      (place.phone ? '<a class="btn-primary" href="tel:' + esc(place.phone) + '">📞 致電 Call</a>' : '') +
      '</div>';
    const overlay = openModal(html);
    const refresh = function () {
      const parts = ['您好，我想提前通知餐廳'];
      if (selected.length) parts.push('食物過敏：' + selected.map(function (id) { return D.ALLERGENS.find(function (a) { return a.id === id; }).zh; }).join('、'));
      const loc = overlay.querySelector('#nf-location').value.trim();
      if (loc) parts.push('餐桌位置：' + loc);
      const ev = overlay.querySelector('#nf-event').value.trim();
      if (ev) parts.push('特別活動：' + ev);
      parts.push('餐廳：' + place.name);
      overlay.querySelector('#nf-msg').textContent = parts.join('；') + '。';
    };
    overlay.querySelector('.allergen-chips').addEventListener('click', function (e) {
      const b = e.target.closest('[data-ag]');
      if (!b) return;
      b.classList.toggle('selected');
      const i = selected.indexOf(b.dataset.ag);
      if (i >= 0) selected.splice(i, 1); else selected.push(b.dataset.ag);
      refresh();
    });
    overlay.querySelector('#nf-location').addEventListener('input', refresh);
    overlay.querySelector('#nf-event').addEventListener('input', refresh);
    overlay.querySelector('#nf-copy').addEventListener('click', function () {
      const text = overlay.querySelector('#nf-msg').textContent;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { toast('已複製 Copied'); }, function () { toast('複製失敗 Copy failed'); });
      } else toast('複製失敗 Copy failed');
    });
    refresh();
  }

  function apiErrorMessage(e) {
    const m = (e && e.message) ? e.message : '未知錯誤 Unknown error';
    if (m.indexOf('未設定') >= 0) return m; // missing-key message is already user-facing
    return '未能連接 Google Places 餐廳服務。請確認 API 金鑰已啟用「Places API (New)」並允許此網域（' + m + '）。';
  }

  return {
    esc: esc,
    toast: toast,
    loading: loading,
    showMode: showMode,
    goHome: goHome,
    initLocation: initLocation,
    renderLocationChip: renderLocationChip,
    renderCuisineChips: renderCuisineChips,
    setChipSelected: setChipSelected,
    restaurantCard: restaurantCard,
    openNotifyModal: openNotifyModal,
    openLocationModal: openLocationModal,
    openModal: openModal,
    closeModal: closeModal,
    distanceText: distanceText,
    apiErrorMessage: apiErrorMessage,
  };
})();
