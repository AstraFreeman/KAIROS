/* ===========================================
   KAIROS — Task Response Validation
   =========================================== */
window.KAIROS = window.KAIROS || {};

KAIROS.validation = (function () {

  /**
   * Перевіряє відповідь за ключовими словами.
   * @param {string} answer — текст відповіді студента
   * @param {Object} validation — { keywords: [], minKeywords: N, feedbackHit, feedbackMiss }
   * @returns {{ passed: boolean, matchedCount: number, total: number, matched: string[], missed: string[] }}
   */
  function checkKeywords(answer, validation) {
    var lowerAnswer = answer.toLowerCase();
    var matched = [];
    var missed = [];

    validation.keywords.forEach(function (kw) {
      if (lowerAnswer.indexOf(kw.toLowerCase()) !== -1) {
        matched.push(kw);
      } else {
        missed.push(kw);
      }
    });

    var min = validation.minKeywords || 1;
    return {
      passed: matched.length >= min,
      matchedCount: matched.length,
      total: validation.keywords.length,
      matched: matched,
      missed: missed
    };
  }

  /**
   * Обирає випадковий фідбек від персонажа.
   * @param {Object} characterFeedback — { positive: [], neutral: [] }
   * @param {boolean} isPositive — чи позитивний результат
   * @returns {string}
   */
  function pickCharacterFeedback(characterFeedback, isPositive) {
    if (!characterFeedback) return '';
    var pool = isPositive ? characterFeedback.positive : characterFeedback.neutral;
    if (!pool || pool.length === 0) return '';
    return pool[Math.floor(Math.random() * pool.length)];
  }

  /**
   * Генерує повний результат перевірки для поста.
   * @param {string} answer — текст студента
   * @param {Object} post — об'єкт поста з responseType, validation, characterFeedback
   * @returns {{ type: string, passed: boolean, feedback: string, characterReply: string, bonusPoints: number, details: Object|null }}
   */
  function evaluate(answer, post) {
    var result = {
      type: post.responseType || 'character-reply',
      passed: false,
      feedback: '',
      characterReply: '',
      bonusPoints: 0,
      details: null
    };

    if (!answer || answer.trim().length < 10) {
      result.feedback = 'Напишіть більш розгорнуту відповідь (мінімум 10 символів).';
      return result;
    }

    if (post.responseType === 'keyword-check' && post.validation) {
      var check = checkKeywords(answer, post.validation);
      result.details = check;
      result.passed = check.passed;

      if (check.passed) {
        result.feedback = post.validation.feedbackHit || 'Чудова відповідь!';
        result.bonusPoints = Math.floor((check.matchedCount / check.total) * (post.points || 10) * 0.5);
        result.characterReply = pickCharacterFeedback(post.characterFeedback, true);
      } else {
        result.feedback = post.validation.feedbackMiss || 'Спробуй доповнити відповідь.';
        if (check.missed.length > 0) {
          result.feedback += ' Підказка: згадай про «' + check.missed[0] + '».';
        }
        result.characterReply = pickCharacterFeedback(post.characterFeedback, false);
      }
    } else {
      // character-reply: будь-яка відповідь достатньої довжини зараховується
      result.passed = true;
      result.feedback = 'Відповідь прийнято!';
      result.characterReply = pickCharacterFeedback(post.characterFeedback, true);
    }

    return result;
  }

  return {
    checkKeywords: checkKeywords,
    pickCharacterFeedback: pickCharacterFeedback,
    evaluate: evaluate
  };

})();
