/* ===========================================
   KAIROS — Feed Engine
   =========================================== */
window.KAIROS = window.KAIROS || {};

KAIROS.feed = (function () {

  var allPosts = [];
  var config = null;

  function init(posts, cfg) {
    allPosts = posts;
    config = cfg;
  }

  function scorePosts(filterTopic) {
    var tracker = KAIROS.tracker;
    var level = tracker.estimateLevel();
    var recent = tracker.recentTopics(3);
    var scored = [];

    var candidates = filterTopic
      ? allPosts.filter(function (p) { return p.topic === filterTopic; })
      : allPosts;

    candidates.forEach(function (post) {
      // check prerequisites
      if (post.prerequisites && post.prerequisites.length > 0) {
        var allMet = post.prerequisites.every(function (reqId) {
          return tracker.hasCompleted(reqId);
        });
        if (!allMet) return; // skip
      }

      var score = 0;

      // unseen bonus
      if (!tracker.hasSeen(post.id)) {
        score += config.feedAlgorithm.unseenWeight;
      } else {
        score += 0.5; // small base for seen posts
      }

      // difficulty match
      var diffDelta = Math.abs(post.difficulty - level);
      if (diffDelta <= config.maxDifficultyJump) {
        score += config.feedAlgorithm.difficultyMatchWeight * (1 - diffDelta / 5);
      } else {
        score *= 0.3; // penalize but don't fully hide
      }

      // topic diversity
      if (recent.indexOf(post.topic) === -1) {
        score += config.feedAlgorithm.topicDiversityWeight;
      }

      // recently unlocked bonus
      if (post.prerequisites && post.prerequisites.length > 0) {
        score += config.feedAlgorithm.prerequisiteMetWeight;
      }

      // random factor
      score += Math.random() * config.feedAlgorithm.randomFactor * score;

      scored.push({ post: post, score: score });
    });

    scored.sort(function (a, b) { return b.score - a.score; });
    return scored;
  }

  function render(filterTopic, container) {
    var scored = scorePosts(filterTopic);
    var pageSize = config.feedPageSize || 5;
    var toShow = scored.slice(0, pageSize);

    var header = document.createElement('h2');
    header.className = 'section-header';

    if (filterTopic) {
      var TOPIC_NAMES = {
        'starodavnij-svit': 'Стародавній світ',
        'serednovichchya': 'Середньовіччя',
        'novyj-chas': 'Новий час',
        'moderna': 'Модерна доба',
        'suchasnist': 'Сучасність'
      };
      header.textContent = TOPIC_NAMES[filterTopic] || filterTopic;
    } else {
      header.textContent = 'Стрічка новин';
    }
    container.appendChild(header);

    if (toShow.length === 0) {
      var empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent = 'Поки що немає нових дописів. Виконайте поточні завдання, щоб відкрити нові!';
      container.appendChild(empty);
      return;
    }

    var profiles = KAIROS.app.getProfiles();

    toShow.forEach(function (item) {
      var post = item.post;
      var profile = profiles[post.authorId] || {
        id: post.authorId,
        name: post.authorId,
        role: '',
        avatarUrl: 'img/avatars/default.svg'
      };
      var card = KAIROS.ui.postCard(post, profile);
      container.appendChild(card);
    });

    // load more button if there are more
    if (scored.length > pageSize) {
      var moreBtn = document.createElement('button');
      moreBtn.className = 'post-action-btn';
      moreBtn.style.cssText = 'display:block; margin:10px auto; padding:8px 24px;';
      moreBtn.textContent = 'Показати більше';
      moreBtn.onclick = function () {
        moreBtn.remove();
        var next = scored.slice(pageSize, pageSize + 5);
        next.forEach(function (item) {
          var post = item.post;
          var profile = profiles[post.authorId] || {
            id: post.authorId, name: post.authorId, role: '',
            avatarUrl: 'img/avatars/default.svg'
          };
          container.appendChild(KAIROS.ui.postCard(post, profile));
        });
      };
      container.appendChild(moreBtn);
    }
  }

  function renderSingle(postId, container) {
    var post = allPosts.find(function (p) { return p.id === postId; });
    if (!post) {
      container.innerHTML = '<div class="empty-state">Допис не знайдено</div>';
      return;
    }
    var profiles = KAIROS.app.getProfiles();
    var profile = profiles[post.authorId] || {
      id: post.authorId, name: post.authorId, role: '',
      avatarUrl: 'img/avatars/default.svg'
    };

    var back = document.createElement('a');
    back.href = '#feed';
    back.textContent = '← Назад до стрічки';
    back.style.cssText = 'display:block; margin-bottom:10px; font-size:12px;';
    container.appendChild(back);

    container.appendChild(KAIROS.ui.postCard(post, profile));
  }

  function getAllPosts() {
    return allPosts;
  }

  return {
    init: init,
    render: render,
    renderSingle: renderSingle,
    getAllPosts: getAllPosts
  };

})();
