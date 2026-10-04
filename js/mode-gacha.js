// 扭蛋 Gachapon mode.
window.Gacha = (function () {
  let selectedCuisine = null;
  let places = [];
  let busy = false;

  function init() {
    const stage = document.getElementById('gacha-cuisines');
    stage.addEventListener('click', function (e) {
      const chip = e.target.closest('[data-cuisine]');
      if (!chip) return;
      U.setChipSelected(stage, chip.dataset.cuisine);
      selectedCuisine = D.CUISINES.find(function (c) { return c.id === chip.dataset.cuisine; });
    });

    document.getElementById('gacha-twist').addEventListener('click', twist);
    document.getElementById('gacha-capsule').addEventListener('click', openCapsule);
  }

  async function twist() {
    if (busy) return;
    if (!selectedCuisine) { U.toast('請先揀一款菜式 Please pick a cuisine first'); return; }
    busy = true;

    const knob = document.getElementById('gacha-twist');
    if (knob) {
      knob.classList.remove('spinning');
      void knob.offsetWidth; // restart the twist animation
      knob.classList.add('spinning');
      setTimeout(function () { knob.classList.remove('spinning'); }, 750);
    }

    const capsule = document.getElementById('gacha-capsule');
    const reveal = document.getElementById('gacha-reveal');
    const resultsEl = document.getElementById('gacha-results');
    capsule.classList.remove('hidden', 'opened', 'ready', 'dropped');
    capsule.querySelector('.capsule-body').textContent = '?';
    reveal.classList.add('hidden');
    resultsEl.innerHTML = '';

    void capsule.offsetWidth; // restart drop animation
    capsule.classList.add('dropped');

    const loc = AppState.location;
    places = [];
    let error = null;
    try {
      const list = await PlacesAPI.searchRestaurants({
        lat: loc.lat, lng: loc.lng, radius: AppState.radius,
        includedTypes: selectedCuisine.placesTypes, keyword: selectedCuisine.keyword,
      });
      places = PlacesAPI.rankPlaces(list).slice(0, 3);
      if (!places.length) error = '附近搵唔到相關餐廳。No nearby restaurants found.';
    } catch (e) {
      error = U.apiErrorMessage(e);
    }

    setTimeout(function () {
      busy = false;
      if (error) {
        resultsEl.innerHTML = '<div class="error-box">⚠️ ' + U.esc(error) + '</div>';
        return;
      }
      capsule.classList.add('ready');
    }, 700);
  }

  function openCapsule() {
    const capsule = document.getElementById('gacha-capsule');
    if (capsule.classList.contains('hidden') || !capsule.classList.contains('ready')) return;
    capsule.classList.add('opened');
    capsule.querySelector('.capsule-body').textContent = selectedCuisine.emoji;

    const reveal = document.getElementById('gacha-reveal');
    const dish = D.randomOf(selectedCuisine.dishCategories.reduce(function (a, c) { return a.concat(c.dishes); }, []));
    reveal.innerHTML =
      '<div class="reveal-answer">🎉 ' + selectedCuisine.emoji + ' ' + U.esc(selectedCuisine.zh) + ' ' + U.esc(selectedCuisine.en) +
      '<span class="reveal-dish">建議：' + U.esc(dish.zh) + ' ' + U.esc(dish.en) + '</span></div>';
    reveal.classList.remove('hidden');
    renderResults();
  }

  function renderResults() {
    const resultsEl = document.getElementById('gacha-results');
    if (!places.length) return;
    resultsEl.innerHTML = places.map(function (p, i) {
      return U.restaurantCard(p, { rank: i + 1, idx: i });
    }).join('');
    resultsEl._places = places;
  }

  return { init: init };
})();
