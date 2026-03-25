/* ===========================================
   KAIROS — Card Collection System
   =========================================== */
window.KAIROS = window.KAIROS || {};

KAIROS.cards = (function () {

  var utils = KAIROS.utils;
  var tracker = KAIROS.tracker;

  var cardsData = null; // loaded from data/cards.json
  var pullCost = 3;

  function init(data) {
    cardsData = data;
    pullCost = data.pullCost || 3;
  }

  function getAllCards() {
    return cardsData ? cardsData.cards : [];
  }

  function getCardById(id) {
    if (!cardsData) return null;
    for (var i = 0; i < cardsData.cards.length; i++) {
      if (cardsData.cards[i].id === id) return cardsData.cards[i];
    }
    return null;
  }

  function getCardsByEra(era) {
    return getAllCards().filter(function (c) { return c.era === era; });
  }

  function getInventory() {
    var state = tracker.getState();
    var inv = state.inventory || [];
    return inv.map(function (item) {
      var card = getCardById(item.cardId);
      return card ? { card: card, earnedAt: item.earnedAt } : null;
    }).filter(Boolean);
  }

  function getTokens() {
    return tracker.getState().cardTokens || 0;
  }

  function canPull() {
    return getTokens() >= pullCost;
  }

  /**
   * Gacha pull — обирає випадкову картку за вагами рідкості.
   * Не дає дублікатів, поки є невідкриті картки.
   */
  function pull() {
    if (!canPull()) return null;

    var weights = cardsData.rarityWeights;
    var allCards = getAllCards();
    var state = tracker.getState();
    var ownedIds = (state.inventory || []).map(function (i) { return i.cardId; });

    // спочатку фільтруємо невідкриті
    var available = allCards.filter(function (c) {
      return ownedIds.indexOf(c.id) === -1;
    });

    // якщо всі зібрані — дозволяємо дублікати
    if (available.length === 0) {
      available = allCards;
    }

    // вибираємо рідкість
    var rarity = pickRarity(weights);

    // фільтруємо за рідкістю
    var pool = available.filter(function (c) { return c.rarity === rarity; });

    // якщо в цій рідкості немає доступних — беремо будь-яку доступну
    if (pool.length === 0) {
      pool = available;
    }

    // випадкова картка
    var card = pool[Math.floor(Math.random() * pool.length)];

    // списуємо жетони та записуємо
    tracker.spendTokens(pullCost);
    tracker.record({
      type: 'card-pull',
      cardId: card.id,
      rarity: card.rarity
    });

    return card;
  }

  function pickRarity(weights) {
    var total = weights.common + weights.rare + weights.epic + weights.legendary;
    var r = Math.random() * total;

    if (r < weights.common) return 'common';
    r -= weights.common;
    if (r < weights.rare) return 'rare';
    r -= weights.rare;
    if (r < weights.epic) return 'epic';
    return 'legendary';
  }

  var RARITY_LABELS = {
    'common': 'Звичайна',
    'rare': 'Рідкісна',
    'epic': 'Епічна',
    'legendary': 'Легендарна'
  };

  var RARITY_COLORS = {
    'common': '#6c757d',
    'rare': '#007bff',
    'epic': '#6f42c1',
    'legendary': '#ff8c00'
  };

  var TYPE_LABELS = {
    'figure': 'Постать',
    'artifact': 'Артефакт',
    'event': 'Подія'
  };

  var ERA_LABELS = {
    'starodavnij-svit': 'Стародавній світ',
    'serednovichchya': 'Середньовіччя',
    'novyj-chas': 'Новий час',
    'moderna': 'Модерна доба',
    'suchasnist': 'Сучасність'
  };

  function rarityLabel(rarity) { return RARITY_LABELS[rarity] || rarity; }
  function rarityColor(rarity) { return RARITY_COLORS[rarity] || '#6c757d'; }
  function typeLabel(type) { return TYPE_LABELS[type] || type; }
  function eraLabel(era) { return ERA_LABELS[era] || era; }

  function getPullCost() { return pullCost; }

  function getCollectionStats() {
    var all = getAllCards();
    var owned = getInventory();
    var ownedIds = owned.map(function (i) { return i.card.id; });
    var uniqueOwned = [];
    ownedIds.forEach(function (id) {
      if (uniqueOwned.indexOf(id) === -1) uniqueOwned.push(id);
    });

    var byEra = {};
    all.forEach(function (c) {
      if (!byEra[c.era]) byEra[c.era] = { total: 0, owned: 0 };
      byEra[c.era].total++;
      if (uniqueOwned.indexOf(c.id) !== -1) byEra[c.era].owned++;
    });

    return {
      total: all.length,
      owned: uniqueOwned.length,
      byEra: byEra
    };
  }

  return {
    init: init,
    getAllCards: getAllCards,
    getCardById: getCardById,
    getCardsByEra: getCardsByEra,
    getInventory: getInventory,
    getTokens: getTokens,
    canPull: canPull,
    pull: pull,
    getPullCost: getPullCost,
    getCollectionStats: getCollectionStats,
    rarityLabel: rarityLabel,
    rarityColor: rarityColor,
    typeLabel: typeLabel,
    eraLabel: eraLabel
  };

})();
