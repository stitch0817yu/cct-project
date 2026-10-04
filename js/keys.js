// API key management. Keys are entered by the user in the browser and kept in
// localStorage only — they never ship in the source and are never uploaded.
window.Keys = (function () {
  const LS_GOOGLE = 'wtfe.googleKey';
  const LS_DEEPSEEK = 'wtfe.deepseekKey';

  function load() {
    let g = '', d = '';
    try {
      g = localStorage.getItem(LS_GOOGLE) || '';
      d = localStorage.getItem(LS_DEEPSEEK) || '';
    } catch (e) { /* storage unavailable (e.g. private mode) — fall back to empty */ }

    // Allow keys via ?google_place_key=…&deepseek_key=… (handy for sharing a
    // one-off URL). Query string wins over localStorage, is persisted, and the
    // params are then stripped from the address bar.
    const qs = queryKeys();
    if (qs.google) g = qs.google;
    if (qs.deepseek) d = qs.deepseek;

    CONFIG.API_KEY = g;
    CONFIG.DEEPSEEK_API_KEY = d;

    if (qs.present) {
      try {
        if (qs.google) localStorage.setItem(LS_GOOGLE, qs.google);
        if (qs.deepseek) localStorage.setItem(LS_DEEPSEEK, qs.deepseek);
      } catch (e) { /* ignore */ }
      stripQueryParams();
    }
  }

  function queryKeys() {
    const params = new URLSearchParams(window.location.search);
    const hasGoogle = params.has('google_place_key');
    const hasDeepseek = params.has('deepseek_key');
    const google = (params.get('google_place_key') || '').trim();
    const deepseek = (params.get('deepseek_key') || '').trim();
    return { google: google || null, deepseek: deepseek || null, present: hasGoogle || hasDeepseek };
  }

  function stripQueryParams() {
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('google_place_key');
      url.searchParams.delete('deepseek_key');
      const search = url.searchParams.toString();
      history.replaceState(history.state, '', url.pathname + (search ? '?' + search : '') + url.hash);
    } catch (e) { /* URL cleanup is best-effort */ }
  }

  function save(google, deepseek) {
    CONFIG.API_KEY = String(google || '').trim();
    CONFIG.DEEPSEEK_API_KEY = String(deepseek || '').trim();
    try {
      localStorage.setItem(LS_GOOGLE, CONFIG.API_KEY);
      localStorage.setItem(LS_DEEPSEEK, CONFIG.DEEPSEEK_API_KEY);
    } catch (e) { /* keep in memory only if storage is unavailable */ }
    renderKeyChip();
  }

  function configured() { return !!CONFIG.API_KEY; }

  // Only surface the 🔑 button when a key is missing.
  function renderKeyChip() {
    const chip = document.getElementById('keyChip');
    if (chip) chip.classList.toggle('hidden', configured());
  }

  function openPrompt() {
    const html =
      '<h3>🔑 API 金鑰 <span>API keys</span></h3>' +
      '<p class="modal-sub">金鑰只會儲存喺你嘅瀏覽器，唔會上載。<span>Keys stay in your browser — never uploaded.</span></p>' +
      '<label>Google Places API 金鑰 <input id="key-google" type="password" autocomplete="off" placeholder="AIzaSy…" value="' + U.esc(CONFIG.API_KEY) + '">' +
      '<span class="key-help">喺 Google Cloud 啟用「Places API (New)」，並加入 HTTP referrer 限制以允許此網域。Enable the Places API (New) and add an HTTP-referrer restriction for this origin.</span></label>' +
      '<label>DeepSeek API 金鑰（可選）<input id="key-deepseek" type="password" autocomplete="off" placeholder="sk-…" value="' + U.esc(CONFIG.DEEPSEEK_API_KEY) + '">' +
      '<span class="key-help">只有彩票「影餐牌」嘅相片辨識需要。Only needed for the Lottery photo scan.</span></label>' +
      '<div class="modal-actions">' +
      '  <button id="key-save" class="btn-primary" type="button">💾 儲存 Save</button>' +
      '</div>';

    const overlay = U.openModal(html);
    overlay.querySelector('#key-save').addEventListener('click', function () {
      const google = overlay.querySelector('#key-google').value;
      const deepseek = overlay.querySelector('#key-deepseek').value;
      if (!google.trim()) { U.toast('請輸入 Google Places API 金鑰 Please enter your Google Places API key'); return; }
      save(google, deepseek);
      U.closeModal();
      U.toast('金鑰已儲存 Keys saved');
    });
    ['#key-google', '#key-deepseek'].forEach(function (sel) {
      overlay.querySelector(sel).addEventListener('keydown', function (e) {
        if (e.key === 'Enter') overlay.querySelector('#key-save').click();
      });
    });
    return overlay;
  }

  function init() {
    load();
    renderKeyChip();
    if (!configured()) openPrompt();
  }

  return { init: init, load: load, save: save, configured: configured, openPrompt: openPrompt };
})();
