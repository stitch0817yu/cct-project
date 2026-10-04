// 老虎機 Slot Machine mode.
window.Slot = (function () {
  let busy = false;

  function init() {
    const pullBtn = document.getElementById('slot-pull');
    const lever = document.getElementById('slot-lever');
    function triggerPull() {
      if (lever) {
        lever.classList.remove('pulled');
        void lever.offsetWidth; // restart the pull animation
        lever.classList.add('pulled');
        setTimeout(function () { lever.classList.remove('pulled'); }, 650);
      }
      pull();
    }
    pullBtn.addEventListener('click', triggerPull);
    if (lever) lever.addEventListener('click', triggerPull);
    ['reel-cuisine', 'reel-dish', 'reel-restaurant'].forEach(function (id) {
      document.getElementById(id).querySelector('.reel-strip').innerHTML = '<div class="reel-item">—</div>';
    });
  }

  function spinReel(reelEl, initialFinal, durationMs, delayMs) {
    const strip = reelEl.querySelector('.reel-strip');
    const H = reelEl.clientHeight || 88;
    const total = 22, finalIndex = 17;
    const fillers = ['🍜', '🍣', '🍕', '🥘', '🍛', '🥟', '🍲', '🍝', '🥗', '🍱', '🍔', '🌮'];
    strip.innerHTML = '';
    let finalNode = null;
    for (let i = 0; i < total; i++) {
      const d = document.createElement('div');
      d.className = 'reel-item' + (i === finalIndex ? ' is-final' : '');
      d.style.height = H + 'px';
      if (i === finalIndex) { d.textContent = initialFinal; finalNode = d; }
      else d.textContent = fillers[(i * 7 + Math.floor(Math.random() * fillers.length)) % fillers.length];
      strip.appendChild(d);
    }
    strip.style.transition = 'none';
    strip.style.transform = 'translateY(0)';
    void strip.offsetHeight; // reflow
    reelEl.classList.add('rolling');
    let resolveDone;
    const done = new Promise(function (r) { resolveDone = r; });
    setTimeout(function () {
      strip.style.transition = 'transform ' + durationMs + 'ms cubic-bezier(0.12, 0.82, 0.24, 1)';
      strip.style.transform = 'translateY(-' + (finalIndex * H) + 'px)';
    }, delayMs);
    setTimeout(function () {
      reelEl.classList.remove('rolling');
      resolveDone();
    }, delayMs + durationMs + 80);
    return { done: done, setFinal: function (text) { if (finalNode) finalNode.textContent = text; } };
  }

  async function pull() {
    if (busy) return;
    busy = true;
    const resultEl = document.getElementById('slot-result');
    resultEl.classList.add('hidden');

    const cuisine = D.randomOf(D.CUISINES);
    const dish = D.randomOf(cuisine.slotDishes);
    const loc = AppState.location;

    const fetchPromise = PlacesAPI.searchRestaurants({
      lat: loc.lat, lng: loc.lng, radius: AppState.radius,
      keyword: cuisine.keyword,
    }).then(function (list) { return PlacesAPI.rankPlaces(list); });

    const r1 = spinReel(document.getElementById('reel-cuisine'), cuisine.emoji + ' ' + cuisine.zh, 900, 0);
    const r2 = spinReel(document.getElementById('reel-dish'), dish.zh + ' ' + dish.en, 1300, 160);
    const r3 = spinReel(document.getElementById('reel-restaurant'), '🍽️', 1800, 320);

    let restaurant = null, error = null;
    try {
      const ranked = await fetchPromise;
      if (ranked && ranked.length) {
        restaurant = D.randomOf(ranked.slice(0, Math.min(ranked.length, 5)));
        r3.setFinal(restaurant.name);
      } else {
        error = '附近搵唔到相關餐廳。No nearby restaurants found.';
      }
    } catch (e) {
      error = U.apiErrorMessage(e);
    }

    await Promise.all([r1.done, r2.done, r3.done]);
    busy = false;
    renderResult(cuisine, dish, restaurant, error);
  }

  function renderResult(cuisine, dish, restaurant, error) {
    const el = document.getElementById('slot-result');
    if (error) {
      el.innerHTML = '<div class="error-box">⚠️ ' + U.esc(error) + '</div>';
      el.classList.remove('hidden');
      return;
    }
    const host = '<div class="results">' + U.restaurantCard(restaurant, { idx: 0 }) + '</div>';
    el.innerHTML =
      '<div class="slot-pick">' +
      '  <div class="pick-line">國菜 Cuisine：<strong>' + cuisine.emoji + ' ' + U.esc(cuisine.zh) + ' ' + U.esc(cuisine.en) + '</strong></div>' +
      '  <div class="pick-line">菜式 Dish：<strong>' + U.esc(dish.zh) + (dish.en ? ' ' + U.esc(dish.en) : '') + '</strong></div>' +
      '</div>' +
      '<h3 class="result-title">幫你揀咗呢間 We picked this one 👇</h3>' + host;
    el.querySelector('.results')._places = [restaurant];
    el.classList.remove('hidden');
  }

  return { init: init };
})();
