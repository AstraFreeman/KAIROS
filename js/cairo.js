/* ===========================================
   KAIROS — Cairo: Простір рефлексії
   =========================================== */
window.KAIROS = window.KAIROS || {};

KAIROS.cairo = (function () {

  var items = [];
  var currentIndex = -1;
  var musicFiles = ['music/Sam Brown - Stop.mp3'];
  var audioEl = null;

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

  function startMusic() {
    if (audioEl) return;
    var src = musicFiles[Math.floor(Math.random() * musicFiles.length)];
    audioEl = document.createElement('audio');
    audioEl.src = src;
    audioEl.loop = true;
    audioEl.volume = 0.3;
    audioEl.play().catch(function () {});
  }

  function stopMusic() {
    if (audioEl) {
      audioEl.pause();
      audioEl = null;
    }
  }

  function showGame(card) {
    card.classList.remove('cairo-card-enter');
    void card.offsetWidth;
    card.classList.add('cairo-card-enter');

    card.innerHTML =
      '<div class="cairo-card-type">' +
        '<span class="cairo-type-icon">&#x1F9E9;</span> Гра' +
      '</div>' +
      '<div class="cairo-card-text">Історичний пазл: видатні гетьмани</div>' +
      '<div class="cairo-game-wrap">' +
        '<iframe src="games/puzzle-phenikis.html" class="cairo-game-iframe"></iframe>' +
      '</div>';
  }

  function render(param, container) {
    // Stop any previous music
    stopMusic();

    container.innerHTML = '';
    container.className = 'cairo-zone';

    // Start ambient music
    startMusic();

    // Greeting
    var greeting = document.createElement('div');
    greeting.className = 'cairo-greeting';
    greeting.innerHTML =
      '<h2>Форум Каїр</h2>' +
      '<p class="cairo-subtitle">Простір рефлексії</p>' +
      '<p class="cairo-welcome">Залиште списи та сувої біля входу. Тут час зупиняється для роздумів.</p>';
    container.appendChild(greeting);

    // Music controls
    var musicCtrl = document.createElement('div');
    musicCtrl.className = 'cairo-music-ctrl';

    var playBtn = document.createElement('button');
    playBtn.className = 'cairo-music-btn';
    playBtn.textContent = '\u23F8 Пауза';
    var playing = true;

    playBtn.addEventListener('click', function () {
      if (playing) {
        if (audioEl) audioEl.pause();
        playBtn.textContent = '\u25B6 Грати';
        playing = false;
      } else {
        if (audioEl) {
          audioEl.play().catch(function () {});
        } else {
          startMusic();
        }
        playBtn.textContent = '\u23F8 Пауза';
        playing = true;
      }
    });
    musicCtrl.appendChild(playBtn);

    var volLabel = document.createElement('span');
    volLabel.className = 'cairo-vol-label';
    volLabel.textContent = '\u266B';
    musicCtrl.appendChild(volLabel);

    var volSlider = document.createElement('input');
    volSlider.type = 'range';
    volSlider.className = 'cairo-vol-slider';
    volSlider.min = '0';
    volSlider.max = '100';
    volSlider.value = '30';
    volSlider.addEventListener('input', function () {
      var v = parseInt(volSlider.value, 10) / 100;
      if (audioEl) audioEl.volume = v;
    });
    musicCtrl.appendChild(volSlider);

    container.appendChild(musicCtrl);

    // Card area
    var card = document.createElement('div');
    card.className = 'cairo-card';
    container.appendChild(card);

    function showItem() {
      // ~20% chance to show the game instead
      if (Math.random() < 0.2) {
        showGame(card);
        return;
      }

      var item = getNext();
      if (!item) {
        card.innerHTML = '<p class="cairo-empty">Поки що тут порожньо...</p>';
        return;
      }

      card.classList.remove('cairo-card-enter');
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

    // Action buttons
    var btnWrap = document.createElement('div');
    btnWrap.className = 'cairo-actions';

    var btn = document.createElement('button');
    btn.className = 'cairo-next-btn';
    btn.textContent = 'Ще одна';
    btn.addEventListener('click', showItem);
    btnWrap.appendChild(btn);

    var gameBtn = document.createElement('button');
    gameBtn.className = 'cairo-next-btn';
    gameBtn.textContent = '\uD83E\uDDE9 Зіграти в пазл';
    gameBtn.addEventListener('click', function () {
      showGame(card);
    });
    btnWrap.appendChild(gameBtn);

    container.appendChild(btnWrap);

    // Stop music when navigating away
    window.addEventListener('hashchange', function onLeave() {
      if (window.location.hash !== '#cairo') {
        stopMusic();
        container.className = '';
        window.removeEventListener('hashchange', onLeave);
      }
    });
  }

  return {
    init: init,
    render: render
  };

})();
