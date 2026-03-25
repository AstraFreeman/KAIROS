/* ===========================================
   KAIROS — Roulette & Card UI
   =========================================== */
window.KAIROS = window.KAIROS || {};

KAIROS.roulette = (function () {

  var cards = KAIROS.cards;
  var ui = KAIROS.ui;
  var utils = KAIROS.utils;

  /**
   * Відкриває модальне вікно рулетки.
   */
  function showPullModal() {
    var overlay = document.createElement('div');
    overlay.className = 'modal-overlay roulette-overlay';

    var box = document.createElement('div');
    box.className = 'modal-box roulette-box';

    var title = document.createElement('h2');
    title.textContent = '🎴 Рулетка карток';
    box.appendChild(title);

    var info = document.createElement('p');
    info.className = 'roulette-info';
    info.innerHTML = 'Ваші жетони: <strong class="roulette-tokens">' + cards.getTokens() +
      '</strong> | Вартість: <strong>' + cards.getPullCost() + '</strong> 🎴';
    box.appendChild(info);

    var cardArea = document.createElement('div');
    cardArea.className = 'roulette-card-area';
    cardArea.innerHTML = '<div class="roulette-placeholder">Натисніть кнопку, щоб витягнути картку!</div>';
    box.appendChild(cardArea);

    var btnWrap = document.createElement('div');
    btnWrap.className = 'roulette-buttons';

    var pullBtn = document.createElement('button');
    pullBtn.className = 'btn-primary roulette-pull-btn';
    pullBtn.textContent = 'Витягнути картку';
    pullBtn.disabled = !cards.canPull();
    if (!cards.canPull()) {
      pullBtn.textContent = 'Недостатньо жетонів';
    }

    pullBtn.onclick = function () {
      var card = cards.pull();
      if (!card) return;

      // анімація розкриття
      cardArea.innerHTML = '';
      var reveal = document.createElement('div');
      reveal.className = 'roulette-reveal';

      // фаза 1: мерехтіння рідкості
      var rarityFlash = document.createElement('div');
      rarityFlash.className = 'roulette-rarity-flash';
      rarityFlash.style.color = cards.rarityColor(card.rarity);
      rarityFlash.textContent = cards.rarityLabel(card.rarity) + '!';
      reveal.appendChild(rarityFlash);
      cardArea.appendChild(reveal);

      // фаза 2: картка з'являється
      setTimeout(function () {
        reveal.innerHTML = '';
        var cardEl = buildCardElement(card, true);
        reveal.appendChild(cardEl);
        reveal.className = 'roulette-reveal roulette-revealed';

        // оновити жетони
        info.querySelector('.roulette-tokens').textContent = cards.getTokens();
        pullBtn.disabled = !cards.canPull();
        if (!cards.canPull()) {
          pullBtn.textContent = 'Недостатньо жетонів';
        } else {
          pullBtn.textContent = 'Витягнути ще';
        }

        ui.toast('🎴 Нова картка: ' + card.name + ' (' + cards.rarityLabel(card.rarity) + ')');
        KAIROS.app.updateRightbar();
      }, 1200);
    };

    var closeBtn = document.createElement('button');
    closeBtn.className = 'roulette-close-btn';
    closeBtn.textContent = 'Закрити';
    closeBtn.onclick = function () {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    };

    btnWrap.appendChild(pullBtn);
    btnWrap.appendChild(closeBtn);
    box.appendChild(btnWrap);

    overlay.appendChild(box);
    overlay.onclick = function (e) {
      if (e.target === overlay) {
        overlay.parentNode.removeChild(overlay);
      }
    };

    document.body.appendChild(overlay);
  }

  /**
   * Будує DOM-елемент картки.
   */
  function buildCardElement(card, isOwned) {
    var el = document.createElement('div');
    el.className = 'collection-card' + (isOwned ? '' : ' card-locked');
    el.style.borderColor = cards.rarityColor(card.rarity);

    var rarityBadge = document.createElement('div');
    rarityBadge.className = 'card-rarity-badge';
    rarityBadge.style.background = cards.rarityColor(card.rarity);
    rarityBadge.textContent = cards.rarityLabel(card.rarity);
    el.appendChild(rarityBadge);

    var typeIcon = { 'figure': '👤', 'artifact': '🏺', 'event': '⚔️' };
    var iconEl = document.createElement('div');
    iconEl.className = 'card-type-icon';
    iconEl.textContent = typeIcon[card.type] || '📜';
    el.appendChild(iconEl);

    var name = document.createElement('div');
    name.className = 'card-name';
    name.textContent = card.name;
    el.appendChild(name);

    var era = document.createElement('div');
    era.className = 'card-era';
    era.textContent = cards.eraLabel(card.era);
    el.appendChild(era);

    if (isOwned) {
      var desc = document.createElement('div');
      desc.className = 'card-description';
      desc.textContent = card.description;
      el.appendChild(desc);

      var fact = document.createElement('div');
      fact.className = 'card-fact';
      fact.innerHTML = '💡 ' + utils.escapeHtml(card.fact);
      el.appendChild(fact);
    } else {
      var locked = document.createElement('div');
      locked.className = 'card-locked-text';
      locked.textContent = '🔒 Ще не відкрито';
      el.appendChild(locked);
    }

    return el;
  }

  /**
   * Рендерить сторінку колекції (#cards).
   */
  function renderCollection(container) {
    container.innerHTML = '';

    var header = document.createElement('div');
    header.className = 'collection-header';

    var h1 = document.createElement('h2');
    h1.textContent = '🎴 Колекція карток';
    header.appendChild(h1);

    var stats = cards.getCollectionStats();
    var statsEl = document.createElement('div');
    statsEl.className = 'collection-stats';
    statsEl.innerHTML = 'Зібрано: <strong>' + stats.owned + ' / ' + stats.total + '</strong> | ' +
      'Жетони: <strong>' + cards.getTokens() + '</strong> 🎴';
    header.appendChild(statsEl);

    var pullBtnSmall = document.createElement('button');
    pullBtnSmall.className = 'btn-primary';
    pullBtnSmall.textContent = '🎰 Витягнути картку (' + cards.getPullCost() + ' 🎴)';
    pullBtnSmall.disabled = !cards.canPull();
    pullBtnSmall.onclick = function () { showPullModal(); };
    header.appendChild(pullBtnSmall);

    container.appendChild(header);

    // фільтри по ерах
    var filterBar = document.createElement('div');
    filterBar.className = 'collection-filter-bar';

    var eras = ['all', 'starodavnij-svit', 'serednovichchya', 'novyj-chas', 'moderna', 'suchasnist'];
    var eraNames = { 'all': 'Усі' };
    eras.forEach(function (era) {
      var btn = document.createElement('button');
      btn.className = 'collection-filter-btn' + (era === 'all' ? ' active' : '');
      btn.textContent = eraNames[era] || cards.eraLabel(era);
      btn.onclick = function () {
        filterBar.querySelectorAll('.collection-filter-btn').forEach(function (b) {
          b.classList.remove('active');
        });
        btn.classList.add('active');
        renderGrid(grid, era === 'all' ? null : era);
      };
      filterBar.appendChild(btn);
    });
    container.appendChild(filterBar);

    // progress bars по ерах
    var progressSection = document.createElement('div');
    progressSection.className = 'collection-progress';
    for (var era in stats.byEra) {
      var info = stats.byEra[era];
      var pct = Math.round((info.owned / info.total) * 100);
      var row = document.createElement('div');
      row.className = 'progress-row';
      row.innerHTML = '<span class="progress-label">' + cards.eraLabel(era) + '</span>' +
        '<div class="progress-bar"><div class="progress-fill" style="width:' + pct + '%"></div></div>' +
        '<span class="progress-text">' + info.owned + '/' + info.total + '</span>';
      progressSection.appendChild(row);
    }
    container.appendChild(progressSection);

    // сітка карток
    var grid = document.createElement('div');
    grid.className = 'collection-grid';
    renderGrid(grid, null);
    container.appendChild(grid);
  }

  function renderGrid(grid, filterEra) {
    grid.innerHTML = '';
    var allCards = cards.getAllCards();
    var state = KAIROS.tracker.getState();
    var ownedIds = (state.inventory || []).map(function (i) { return i.cardId; });

    if (filterEra) {
      allCards = allCards.filter(function (c) { return c.era === filterEra; });
    }

    allCards.forEach(function (card) {
      var isOwned = ownedIds.indexOf(card.id) !== -1;
      var el = buildCardElement(card, isOwned);
      grid.appendChild(el);
    });
  }

  return {
    showPullModal: showPullModal,
    renderCollection: renderCollection,
    buildCardElement: buildCardElement
  };

})();
