/* ===========================================
   KAIROS — Utilities
   =========================================== */
window.KAIROS = window.KAIROS || {};

KAIROS.utils = (function () {

  function generateId() {
    return Math.random().toString(36).substr(2, 9);
  }

  function shuffleArray(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = a[i];
      a[i] = a[j];
      a[j] = temp;
    }
    return a;
  }

  function timeAgo() {
    var units = ['хв', 'год', 'дн'];
    var r = Math.random();
    if (r < 0.4) return Math.floor(Math.random() * 59 + 1) + ' ' + units[0] + ' тому';
    if (r < 0.8) return Math.floor(Math.random() * 23 + 1) + ' ' + units[1] + ' тому';
    return Math.floor(Math.random() * 6 + 1) + ' ' + units[2] + ' тому';
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function difficultyStars(level) {
    var s = '';
    for (var i = 0; i < 5; i++) {
      s += i < level ? '★' : '☆';
    }
    return s;
  }

  var TASK_TYPE_LABELS = {
    'source-analysis': 'Аналіз джерел',
    'chronology': 'Хронологія',
    'cause-effect': 'Причини і наслідки',
    'historiography': 'Історіографія',
    'comparison': 'Порівняльний аналіз',
    'debate': 'Дискусія',
    'map-work': 'Робота з картою'
  };

  function taskTypeLabel(type) {
    return TASK_TYPE_LABELS[type] || type;
  }

  async function loadJSON(url) {
    var resp = await fetch(url);
    if (!resp.ok) throw new Error('Failed to load ' + url);
    return resp.json();
  }

  return {
    generateId: generateId,
    shuffleArray: shuffleArray,
    timeAgo: timeAgo,
    escapeHtml: escapeHtml,
    difficultyStars: difficultyStars,
    taskTypeLabel: taskTypeLabel,
    loadJSON: loadJSON
  };

})();
