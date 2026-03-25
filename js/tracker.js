/* ===========================================
   KAIROS — Action Tracker (localStorage)
   =========================================== */
window.KAIROS = window.KAIROS || {};

KAIROS.tracker = (function () {

  var STORAGE_KEY = 'kairos_state';

  var defaultState = {
    studentName: null,
    startedAt: null,
    actions: [],
    seenPostIds: [],
    completedPostIds: [],
    likedPostIds: [],
    comments: {},       // postId -> [{ text, timestamp }]
    taskResponses: {},  // postId -> { text, result, timestamp }
    earnedAchievements: [],
    totalPoints: 0,
    cardTokens: 0,
    inventory: [],      // [{ cardId, earnedAt }]
    pullHistory: []     // [{ cardId, rarity, timestamp }]
  };

  var state = null;

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        state = JSON.parse(raw);
        // merge with defaults for any missing fields
        for (var key in defaultState) {
          if (!(key in state)) {
            state[key] = JSON.parse(JSON.stringify(defaultState[key]));
          }
        }
      } else {
        state = JSON.parse(JSON.stringify(defaultState));
      }
    } catch (e) {
      state = JSON.parse(JSON.stringify(defaultState));
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('KAIROS: localStorage save failed', e);
    }
  }

  function isNewUser() {
    return !state.studentName;
  }

  function setStudentName(name) {
    state.studentName = name;
    state.startedAt = new Date().toISOString();
    save();
  }

  function record(action) {
    // action: { type: 'view'|'like'|'unlike'|'comment'|'complete', postId, ... }
    action.timestamp = new Date().toISOString();
    state.actions.push(action);

    if (action.type === 'view' && state.seenPostIds.indexOf(action.postId) === -1) {
      state.seenPostIds.push(action.postId);
    }

    if (action.type === 'complete' && state.completedPostIds.indexOf(action.postId) === -1) {
      state.completedPostIds.push(action.postId);
      state.totalPoints += (action.points || 0);
      // нараховуємо жетони для карток
      var difficulty = action.difficulty || 1;
      var tokens = difficulty >= 3 ? 2 : 1;
      state.cardTokens += tokens;
    }

    if (action.type === 'like' && state.likedPostIds.indexOf(action.postId) === -1) {
      state.likedPostIds.push(action.postId);
    }

    if (action.type === 'unlike') {
      var idx = state.likedPostIds.indexOf(action.postId);
      if (idx !== -1) state.likedPostIds.splice(idx, 1);
    }

    if (action.type === 'comment') {
      if (!state.comments[action.postId]) state.comments[action.postId] = [];
      state.comments[action.postId].push({
        text: action.text,
        timestamp: action.timestamp
      });
    }

    if (action.type === 'task-response') {
      state.taskResponses[action.postId] = {
        text: action.text,
        result: action.result,
        timestamp: action.timestamp
      };
    }

    if (action.type === 'card-pull') {
      state.inventory.push({ cardId: action.cardId, earnedAt: action.timestamp });
      state.pullHistory.push({ cardId: action.cardId, rarity: action.rarity, timestamp: action.timestamp });
    }

    save();

    // check achievements after each action
    if (KAIROS.achievements && KAIROS.achievements.checkAll) {
      KAIROS.achievements.checkAll();
    }
  }

  function hasSeen(postId) {
    return state.seenPostIds.indexOf(postId) !== -1;
  }

  function hasCompleted(postId) {
    return state.completedPostIds.indexOf(postId) !== -1;
  }

  function hasLiked(postId) {
    return state.likedPostIds.indexOf(postId) !== -1;
  }

  function getComments(postId) {
    return state.comments[postId] || [];
  }

  function estimateLevel() {
    var completed = state.completedPostIds.length;
    if (completed <= 2) return 1;
    if (completed <= 5) return 2;
    if (completed <= 10) return 3;
    if (completed <= 20) return 4;
    return 5;
  }

  function recentTopics(n) {
    var topics = [];
    for (var i = state.actions.length - 1; i >= 0 && topics.length < n; i--) {
      var a = state.actions[i];
      if (a.topic && topics.indexOf(a.topic) === -1) {
        topics.push(a.topic);
      }
    }
    return topics;
  }

  function earnAchievement(id, points) {
    if (state.earnedAchievements.indexOf(id) === -1) {
      state.earnedAchievements.push(id);
      state.totalPoints += (points || 0);
      save();
      return true; // newly earned
    }
    return false;
  }

  function hasAchievement(id) {
    return state.earnedAchievements.indexOf(id) !== -1;
  }

  function getState() {
    return state;
  }

  function getTaskResponse(postId) {
    return state.taskResponses[postId] || null;
  }

  function hasCard(cardId) {
    return state.inventory.some(function (c) { return c.cardId === cardId; });
  }

  function spendTokens(amount) {
    if (state.cardTokens >= amount) {
      state.cardTokens -= amount;
      save();
      return true;
    }
    return false;
  }

  function getStats() {
    return {
      name: state.studentName,
      postsViewed: state.seenPostIds.length,
      postsCompleted: state.completedPostIds.length,
      commentsWritten: Object.keys(state.comments).reduce(function (sum, k) {
        return sum + state.comments[k].length;
      }, 0),
      likesGiven: state.likedPostIds.length,
      achievements: state.earnedAchievements.length,
      totalPoints: state.totalPoints
    };
  }

  function exportData() {
    return JSON.stringify(state, null, 2);
  }

  function reset() {
    state = JSON.parse(JSON.stringify(defaultState));
    save();
  }

  // init
  load();

  return {
    isNewUser: isNewUser,
    setStudentName: setStudentName,
    record: record,
    hasSeen: hasSeen,
    hasCompleted: hasCompleted,
    hasLiked: hasLiked,
    getComments: getComments,
    getTaskResponse: getTaskResponse,
    hasCard: hasCard,
    spendTokens: spendTokens,
    estimateLevel: estimateLevel,
    recentTopics: recentTopics,
    earnAchievement: earnAchievement,
    hasAchievement: hasAchievement,
    getState: getState,
    getStats: getStats,
    exportData: exportData,
    reset: reset
  };

})();
