// 彩票 Lottery mode — snap a menu photo (DeepSeek sorts it into 前菜/主食/甜品/飲料
// and flags allergens) or type dishes in manually, then scratch the silver foil to reveal.
window.Lottery = (function () {
  const REVEAL_AT = 0.45; // scratch ratio that auto-reveals a cell
  const BRUSH = 16; // scratch brush diameter (px)

  let picks = [];
  let menu = null;
  let manualMenu = { appetizer: [], main: [], dessert: [], drink: [] };

  function init() {
    document.querySelectorAll('[data-lottery-tab]').forEach(function (t) {
      t.addEventListener('click', function () { switchTab(t.dataset.lotteryTab); });
    });

    const input = document.getElementById('lottery-photo');
    input.addEventListener('change', onFile);

    renderManualForm();
    const form = document.getElementById('lottery-manual-form');
    form.addEventListener('click', onManualClick);
    form.addEventListener('keydown', onManualKey);
    document.getElementById('lottery-manual-generate').addEventListener('click', manualGenerate);

    // Keyboard fallback for the scratch cells (drag is the mouse/touch path).
    document.getElementById('lottery-ticket').addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const cell = e.target.closest('.scratch-cell');
      if (cell && !cell.classList.contains('revealed') && !cell.classList.contains('empty')) {
        e.preventDefault();
        finishReveal(cell);
      }
    });
  }

  // ---------- tabs ----------
  function switchTab(name) {
    document.querySelectorAll('[data-lottery-tab]').forEach(function (t) {
      t.classList.toggle('is-active', t.dataset.lotteryTab === name);
    });
    document.getElementById('lottery-panel-photo').classList.toggle('hidden', name !== 'photo');
    document.getElementById('lottery-panel-manual').classList.toggle('hidden', name !== 'manual');
  }

  // ---------- photo path ----------
  function onFile(e) {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function () {
      downscale(reader.result, 1280).then(function (dataUrl) {
        showPreview(dataUrl);
        recognize(dataUrl);
      });
    };
    reader.readAsDataURL(file);
  }

  // Shrink the photo so the base64 payload stays reasonable before upload.
  function downscale(dataUrl, maxDim) {
    return new Promise(function (resolve) {
      const img = new Image();
      img.onload = function () {
        const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
        const w = Math.round(img.naturalWidth * scale);
        const h = Math.round(img.naturalHeight * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = function () { resolve(dataUrl); };
      img.src = dataUrl;
    });
  }

  function showPreview(dataUrl) {
    document.getElementById('lottery-preview-img').src = dataUrl;
    document.getElementById('lottery-preview').classList.remove('hidden');
    document.getElementById('lottery-capture-label').classList.add('hidden');
    document.getElementById('lottery-ticket').classList.add('hidden');
    document.getElementById('lottery-summary').classList.add('hidden');
    setStatus('辨識中… Scanning the menu…', true);
  }

  function setStatus(text, busy) {
    const el = document.getElementById('lottery-status');
    el.textContent = text;
    el.classList.toggle('hidden', !text);
    el.classList.toggle('busy', !!busy);
  }

  async function recognize(dataUrl) {
    try {
      const result = await DeepSeek.recognizeMenu(dataUrl);
      const total = result.reduce(function (n, c) { return n + c.dishes.length; }, 0);
      if (!total) {
        setStatus('餐牌上搵唔到嘢食。Could not read any dishes — 請影清楚啲再試。', false);
        return;
      }
      menu = result;
      buildTicket();
      setStatus('');
    } catch (e) {
      setStatus('⚠️ ' + U.esc(DeepSeek.readError(e)) + ' — 請重試 Retry.', false);
    }
  }

  // ---------- manual entry path ----------
  function renderManualForm() {
    document.getElementById('lottery-manual-form').innerHTML =
      '<p class="manual-hint">喺每個分類加入菜式，再生成彩票。<span>Add dishes under each tag, then generate your ticket.</span></p>' +
      D.LOTTERY_CATEGORIES.map(function (cat) {
        return '<div class="manual-cat" data-cat="' + cat.id + '">' +
          '<div class="manual-cat-head">' + U.esc(cat.emoji) + ' ' + U.esc(cat.zh) + ' <span>' + U.esc(cat.en) + '</span></div>' +
          '<div class="manual-cat-list"></div>' +
          '<div class="manual-add">' +
          '  <input class="manual-input" type="text" maxlength="60" placeholder="菜式名稱 Dish name">' +
          '  <button class="manual-add-btn" type="button">＋ 加 Add</button>' +
          '</div>' +
          '</div>';
      }).join('') +
      '<button id="lottery-manual-generate" class="big-btn" type="button">🎟️ 生成彩票 <span>GENERATE</span></button>';
  }

  function onManualClick(e) {
    const addBtn = e.target.closest('.manual-add-btn');
    if (addBtn) { addDish(addBtn.closest('.manual-cat')); return; }
    const removeBtn = e.target.closest('.manual-remove');
    if (removeBtn) { removeDish(removeBtn); }
  }

  function onManualKey(e) {
    if (e.key !== 'Enter') return;
    const input = e.target.closest('.manual-input');
    if (input) { e.preventDefault(); addDish(input.closest('.manual-cat')); }
  }

  function addDish(catEl) {
    const id = catEl.dataset.cat;
    const input = catEl.querySelector('.manual-input');
    const name = input.value.trim();
    if (!name) { U.toast('請輸入菜式名稱 Please type a dish name'); return; }
    manualMenu[id].push(name);
    input.value = '';
    renderCatList(catEl, id);
  }

  function removeDish(btn) {
    const catEl = btn.closest('.manual-cat');
    const id = catEl.dataset.cat;
    manualMenu[id].splice(Number(btn.dataset.idx), 1);
    renderCatList(catEl, id);
  }

  function renderCatList(catEl, id) {
    catEl.querySelector('.manual-cat-list').innerHTML = manualMenu[id].map(function (name, i) {
      return '<span class="manual-chip">' + U.esc(name) +
        '<button class="manual-remove" data-idx="' + i + '" type="button" aria-label="移除 Remove">×</button></span>';
    }).join('');
  }

  function manualGenerate() {
    const total = Object.keys(manualMenu).reduce(function (n, k) { return n + manualMenu[k].length; }, 0);
    if (!total) { U.toast('請先加入菜式 Please add some dishes first'); return; }
    menu = D.LOTTERY_CATEGORIES.map(function (cat) {
      return {
        id: cat.id, zh: cat.zh, en: cat.en, emoji: cat.emoji,
        dishes: manualMenu[cat.id].map(function (name) { return { zh: name, en: '', allergens: [] }; }),
      };
    });
    buildTicket();
  }

  // ---------- ticket ----------
  function buildTicket() {
    const ticketEl = document.getElementById('lottery-ticket');
    document.getElementById('lottery-summary').classList.add('hidden');
    picks = [];
    ticketEl._menu = menu;
    ticketEl.innerHTML =
      '<div class="ticket-head">🍀 幸運彩票 <span>Lucky Ticket</span></div>' +
      '<div class="scratch-grid">' +
      menu.map(function (cat, i) {
        const empty = !cat.dishes.length;
        return '<div class="scratch-cell' + (empty ? ' empty' : '') + '" data-idx="' + i + '"' +
          (empty ? '' : ' tabindex="0" role="button" aria-label="' + U.esc(cat.zh) + ' 刮開 Scratch"') + '>' +
          '<div class="scratch-back">' +
          '  <span class="dish-zh"></span><span class="dish-en"></span>' +
          '  <span class="dish-allergens"></span>' +
          '</div>' +
          (empty
            ? '<div class="scratch-empty">' + U.esc(cat.emoji) + ' ' + U.esc(cat.zh) + ' <small>冇搵到 none found</small></div>'
            : '<canvas class="scratch-canvas" aria-hidden="true"></canvas>') +
          '</div>';
      }).join('') +
      '</div>' +
      '<p class="hint">按住並拖曳刮開銀色部分 · Press and drag to scratch</p>';
    ticketEl.classList.remove('hidden');
    ticketEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    requestAnimationFrame(initScratchCells);
  }

  function initScratchCells() {
    document.querySelectorAll('#lottery-ticket .scratch-cell:not(.empty)').forEach(function (cell) {
      if (cell._ready) return;
      const cat = menu[Number(cell.dataset.idx)];
      const dish = D.randomOf(cat.dishes);
      cell._dish = dish;
      cell._cat = cat;

      const back = cell.querySelector('.scratch-back');
      back.querySelector('.dish-zh').textContent = dish.zh || dish.en || '';
      back.querySelector('.dish-en').textContent = (dish.zh && dish.en) ? dish.en : '';
      const allergens = D.allergenByIds(dish.allergens);
      back.querySelector('.dish-allergens').innerHTML = allergens.length
        ? allergens.map(function (a) { return '<span class="ag-tag">⚠ ' + U.esc(a.zh) + '</span>'; }).join('')
        : '<span class="ag-tag ok">✓ 冇標示致敏原 No allergens flagged</span>';

      setupScratch(cell, cat);
      cell._ready = true;
    });
  }

  // ---------- scratch (drag to shave the silver foil) ----------
  function setupScratch(cell, cat) {
    const canvas = cell.querySelector('.scratch-canvas');
    drawFoil(canvas, cat);
    const ctx = canvas.getContext('2d');

    let down = false, lastX = 0, lastY = 0, lastCheck = 0;

    function pos(e) {
      const r = canvas.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top];
    }
    function erase(x0, y0, x1, y1) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = BRUSH;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
    }
    function maybeFinish() {
      const now = Date.now();
      if (now - lastCheck < 80) return;
      lastCheck = now;
      if (scratchedRatio(canvas) >= REVEAL_AT) finishReveal(cell);
    }

    canvas.addEventListener('pointerdown', function (e) {
      if (cell.classList.contains('revealed')) return;
      down = true;
      canvas.setPointerCapture(e.pointerId);
      const p = pos(e); lastX = p[0]; lastY = p[1];
      erase(lastX, lastY, lastX, lastY);
      maybeFinish();
    });
    canvas.addEventListener('pointermove', function (e) {
      if (!down) return;
      const p = pos(e);
      erase(lastX, lastY, p[0], p[1]);
      lastX = p[0]; lastY = p[1];
      maybeFinish();
    });
    function up() { down = false; maybeFinish(); }
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);
  }

  function drawFoil(canvas, cat) {
    const cell = canvas.parentElement;
    const w = cell.clientWidth;
    const h = cell.clientHeight;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#f2f4f8');
    g.addColorStop(0.5, '#c9cedb');
    g.addColorStop(1, '#aab0c0');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // diagonal sheen
    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = '#ffffff';
    for (let x = -h; x < w; x += 26) {
      ctx.beginPath();
      ctx.moveTo(x, h); ctx.lineTo(x + h, 0); ctx.lineTo(x + h + 8, 0); ctx.lineTo(x + 8, h);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#4a5060';
    ctx.font = '26px sans-serif';
    ctx.fillText(cat.emoji, w / 2, h * 0.28);
    ctx.fillStyle = '#3a4150';
    ctx.font = 'bold 17px "Noto Sans TC", sans-serif';
    ctx.fillText(cat.zh + ' ' + cat.en, w / 2, h * 0.56);
    ctx.fillStyle = '#7a8194';
    ctx.font = '12px sans-serif';
    ctx.fillText(cat.dishes.length + ' 款 dishes', w / 2, h * 0.74);
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('刮一刮 Scratch', w / 2, h * 0.9);
  }

  function scratchedRatio(canvas) {
    const ctx = canvas.getContext('2d');
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let clear = 0, total = 0;
    for (let i = 3; i < img.length; i += 4) {
      total++;
      if (img[i] < 128) clear++;
    }
    return total ? clear / total : 0;
  }

  function finishReveal(cell) {
    if (cell.classList.contains('revealed')) return;
    cell.classList.add('revealed');
    picks.push({ cat: cell._cat.zh + ' ' + cell._cat.en, dish: cell._dish.zh || cell._dish.en || '' });
    const revealable = menu.filter(function (c) { return c.dishes.length; }).length;
    if (picks.length === revealable) showSummary();
  }

  function showSummary() {
    const summaryEl = document.getElementById('lottery-summary');
    summaryEl.innerHTML =
      '<div class="summary-card">' +
      '<h3>🎉 你今日嘅餐單 <span>Your menu</span></h3>' +
      '<ul class="summary-list">' + picks.map(function (p) {
        return '<li><span class="sum-cat">' + U.esc(p.cat) + '</span>' + U.esc(p.dish) + '</li>';
      }).join('') + '</ul>' +
      '<button class="btn-primary re-draw" type="button">🎲 重新抽獎 Re-draw</button>' +
      ' <a class="btn-primary" href="' + cuisineSearchUrl('餐廳 Restaurant', AppState.location) + '" target="_blank" rel="noopener">🧭 去附近搵餐廳 Navigate</a>' +
      '</div>';
    summaryEl.querySelector('.re-draw').addEventListener('click', reDraw);
    summaryEl.classList.remove('hidden');
    summaryEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function reDraw() {
    document.getElementById('lottery-summary').classList.add('hidden');
    buildTicket();
  }

  return { init: init };
})();
