// Entry point and global wiring.
(function () {
  function init() {
    Keys.init();
    U.initLocation();
    U.renderCuisineChips(document.getElementById('gacha-cuisines'));

    Slot.init();
    Gacha.init();
    Lottery.init();

    document.querySelectorAll('[data-mode]').forEach(function (card) {
      card.addEventListener('click', function () { U.showMode(card.dataset.mode); });
    });
    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-back-home]')) U.goHome();
    });
    document.getElementById('locationChip').addEventListener('click', U.openLocationModal);
    document.getElementById('keyChip').addEventListener('click', Keys.openPrompt);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
