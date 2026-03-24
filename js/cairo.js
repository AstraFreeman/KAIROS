/* ===========================================
   KAIROS — Cairo: Простір рефлексії
   =========================================== */
window.KAIROS = window.KAIROS || {};

KAIROS.cairo = (function () {

  var items = [];
  var currentIndex = -1;

  function init(data) {
    items = data.items || [];
    KAIROS.utils.shuffleArray(items);
    currentIndex = 0;
  }

  function getNext() {
    if (items.length === 0) return null;
    var item = items[currentIndex];
    currentIndex = (currentIndex + 1) % items.length;
    return item;
  }

  function render(param, container) {
    container.innerHTML = '';
    container.className = 'cairo-zone';

    // Greeting
    var greeting = document.createElement('div');
    greeting.className = 'cairo-greeting';
    greeting.innerHTML =
      '<h2>Форум Каїр</h2>' +
      '<p class="cairo-subtitle">Простір рефлексії</p>' +
      '<p class="cairo-welcome">Залиште списи та сувої біля входу. Тут час зупиняється для роздумів.</p>';
    container.appendChild(greeting);

    // Card area
    var card = document.createElement('div');
    card.className = 'cairo-card';
    container.appendChild(card);

    function showItem() {
      var item = getNext();
      if (!item) {
        card.innerHTML = '<p class="cairo-empty">Поки що тут порожньо...</p>';
        return;
      }

      card.classList.remove('cairo-card-enter');
      // force reflow for re-triggering animation
      void card.offsetWidth;
      card.classList.add('cairo-card-enter');

      var typeLabel = { quote: 'Цитата', fact: 'Цікавий факт', anecdote: 'Анекдот' };
      var typeIcon = { quote: '\u201C', fact: '\u2139', anecdote: '\u263A' };

      var html =
        '<div class="cairo-card-type">' +
          '<span class="cairo-type-icon">' + (typeIcon[item.type] || '') + '</span> ' +
          (typeLabel[item.type] || item.type) +
        '</div>' +
        '<div class="cairo-card-text">' + KAIROS.utils.escapeHtml(item.text) + '</div>';

      if (item.author) {
        html += '<div class="cairo-card-author">\u2014 ' + KAIROS.utils.escapeHtml(item.author) + '</div>';
      }

      card.innerHTML = html;
    }

    showItem();

    // "Next" button
    var btnWrap = document.createElement('div');
    btnWrap.className = 'cairo-actions';
    var btn = document.createElement('button');
    btn.className = 'cairo-next-btn';
    btn.textContent = 'Ще одна';
    btn.addEventListener('click', showItem);
    btnWrap.appendChild(btn);
    container.appendChild(btnWrap);
  }

  return {
    init: init,
    render: render
  };

})();
