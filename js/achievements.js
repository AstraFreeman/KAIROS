/* ===========================================
   KAIROS — Achievement System
   =========================================== */
window.KAIROS = window.KAIROS || {};

KAIROS.achievements = (function () {

  var definitions = [];

  function init(defs) {
    definitions = defs;
  }

  function checkAll() {
    var tracker = KAIROS.tracker;
    var state = tracker.getState();

    definitions.forEach(function (ach) {
      if (tracker.hasAchievement(ach.id)) return; // already earned

      var earned = evaluateCondition(ach.condition, state);
      if (earned) {
        var isNew = tracker.earnAchievement(ach.id, ach.points);
        if (isNew) {
          KAIROS.ui.toast('🏆 Досягнення: ' + ach.name, true);
          KAIROS.app.updateRightbar();
        }
      }
    });
  }

  function evaluateCondition(cond, state) {
    switch (cond.type) {
      case 'action-count':
        var count = state.actions.filter(function (a) {
          return a.type === cond.action;
        }).length;
        return count >= cond.count;

      case 'task-type-count':
        var completed = state.completedPostIds;
        var allPosts = KAIROS.feed.getAllPosts();
        var matching = allPosts.filter(function (p) {
          return p.taskType === cond.taskType && completed.indexOf(p.id) !== -1;
        });
        return matching.length >= cond.count;

      case 'topic-complete':
        var topicPosts = KAIROS.feed.getAllPosts().filter(function (p) {
          return p.topic === cond.topic;
        });
        if (topicPosts.length === 0) return false;
        var done = topicPosts.filter(function (p) {
          return state.completedPostIds.indexOf(p.id) !== -1;
        });
        return (done.length / topicPosts.length) >= cond.threshold;

      case 'points-threshold':
        return state.totalPoints >= cond.points;

      case 'posts-viewed':
        return state.seenPostIds.length >= cond.count;

      case 'posts-completed':
        return state.completedPostIds.length >= cond.count;

      default:
        return false;
    }
  }

  function render(param, container) {
    var tracker = KAIROS.tracker;

    var header = document.createElement('h2');
    header.className = 'section-header';
    header.textContent = 'Досягнення';
    container.appendChild(header);

    var grid = document.createElement('div');
    grid.className = 'achievements-grid';

    definitions.forEach(function (ach) {
      var isEarned = tracker.hasAchievement(ach.id);
      grid.appendChild(KAIROS.ui.achievementCard(ach, isEarned));
    });

    container.appendChild(grid);
  }

  function getAll() {
    return definitions;
  }

  return {
    init: init,
    checkAll: checkAll,
    render: render,
    getAll: getAll
  };

})();
