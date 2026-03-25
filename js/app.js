/* ===========================================
   KAIROS — App Entry Point
   =========================================== */
window.KAIROS = window.KAIROS || {};

KAIROS.app = (function () {

  var profilesMap = {};   // id -> profile
  var achievementsList = [];
  var config = null;

  async function init() {
    try {
      // Load all data
      config = await KAIROS.utils.loadJSON('data/config.json');

      var profilesData = await KAIROS.utils.loadJSON('data/profiles.json');
      profilesData.profiles.forEach(function (p) {
        profilesMap[p.id] = p;
      });

      var achData = await KAIROS.utils.loadJSON('data/achievements.json');
      achievementsList = achData.achievements;
      KAIROS.achievements.init(achievementsList);

      // Load all posts
      var topicFiles = [
        'starodavnij-svit', 'serednovichchya',
        'novyj-chas', 'moderna', 'suchasnist'
      ];
      var allPosts = [];
      for (var i = 0; i < topicFiles.length; i++) {
        try {
          var data = await KAIROS.utils.loadJSON('data/posts/' + topicFiles[i] + '.json');
          allPosts = allPosts.concat(data.posts);
        } catch (e) {
          console.warn('Could not load posts for ' + topicFiles[i], e);
        }
      }

      KAIROS.feed.init(allPosts, config);

      // Load Cairo data
      try {
        var cairoData = await KAIROS.utils.loadJSON('data/cairo.json');
        KAIROS.cairo.init(cairoData);
      } catch (e) {
        console.warn('Could not load cairo data', e);
      }

      // Load Cards data
      try {
        var cardsData = await KAIROS.utils.loadJSON('data/cards.json');
        KAIROS.cards.init(cardsData);
      } catch (e) {
        console.warn('Could not load cards data', e);
      }

      // Build shell
      renderHeader();
      renderSidebar();
      updateRightbar();

      // Register routes
      KAIROS.router.register('feed', function (param, container) {
        KAIROS.feed.render(null, container);
      });
      KAIROS.router.register('topic', function (slug, container) {
        KAIROS.feed.render(slug, container);
      });
      KAIROS.router.register('profile', function (id, container) {
        KAIROS.profile.render(id, container);
      });
      KAIROS.router.register('my-profile', function (param, container) {
        KAIROS.profile.renderSelf(param, container);
      });
      KAIROS.router.register('achievements', function (param, container) {
        KAIROS.achievements.render(param, container);
      });
      KAIROS.router.register('post', function (id, container) {
        KAIROS.feed.renderSingle(id, container);
      });
      KAIROS.router.register('cairo', function (param, container) {
        KAIROS.cairo.render(param, container);
      });
      KAIROS.router.register('cards', function (param, container) {
        KAIROS.roulette.renderCollection(container);
      });

      // Check if new user
      if (KAIROS.tracker.isNewUser()) {
        showOnboarding(function () {
          KAIROS.router.init();
        });
      } else {
        KAIROS.router.init();
      }

    } catch (e) {
      console.error('KAIROS init error:', e);
      var content = document.getElementById('app-content');
      if (content) {
        content.innerHTML = '<div class="empty-state">Помилка завантаження даних. Переконайтесь, що платформа запущена через HTTP-сервер.<br><br><code>' + e.message + '</code></div>';
      }
    }
  }

  function renderHeader() {
    var header = document.getElementById('app-header');
    if (!header) return;

    header.innerHTML = '';

    var logo = document.createElement('a');
    logo.className = 'logo';
    logo.href = '#feed';
    logo.textContent = 'KAIROS';

    var searchBox = document.createElement('div');
    searchBox.className = 'search-box';
    var searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Пошук...';
    searchBox.appendChild(searchInput);

    var searchTimer = null;
    searchInput.addEventListener('keyup', function (e) {
      clearTimeout(searchTimer);
      if (e.key === 'Enter') {
        performSearch(searchInput.value);
      } else {
        searchTimer = setTimeout(function () {
          performSearch(searchInput.value);
        }, 400);
      }
    });

    var nav = document.createElement('div');
    nav.className = 'header-nav';

    var links = [
      { href: '#my-profile', text: KAIROS.tracker.getState().studentName || 'Профіль' },
      { href: '#achievements', text: 'Досягнення' }
    ];

    links.forEach(function (l) {
      var a = document.createElement('a');
      a.href = l.href;
      a.textContent = l.text;
      nav.appendChild(a);
    });

    header.appendChild(logo);
    header.appendChild(searchBox);
    header.appendChild(nav);
  }

  function renderSidebar() {
    var sidebar = document.getElementById('app-sidebar');
    if (!sidebar) return;

    sidebar.innerHTML = '';

    // Navigation section
    var navSection = document.createElement('div');
    navSection.className = 'sidebar-section';

    var navH3 = document.createElement('h3');
    navH3.textContent = 'Навігація';
    navSection.appendChild(navH3);

    var navList = document.createElement('ul');
    navList.className = 'sidebar-nav';

    var navItems = [
      { href: '#feed', text: '📰 Стрічка' },
      { href: '#my-profile', text: '👤 Мій профіль' },
      { href: '#achievements', text: '🏆 Досягнення' },
      { href: '#cards', text: '🎴 Картки' },
      { href: '#cairo', text: '🏛 Каїр' }
    ];

    navItems.forEach(function (item) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = item.href;
      a.textContent = item.text;
      li.appendChild(a);
      navList.appendChild(li);
    });

    navSection.appendChild(navList);
    sidebar.appendChild(navSection);

    // Topics section
    var topicSection = document.createElement('div');
    topicSection.className = 'sidebar-section';

    var topicH3 = document.createElement('h3');
    topicH3.textContent = 'Теми';
    topicSection.appendChild(topicH3);

    var topicList = document.createElement('ul');
    topicList.className = 'sidebar-nav';

    var topics = [
      { slug: 'starodavnij-svit', name: 'Стародавній світ' },
      { slug: 'serednovichchya', name: 'Середньовіччя' },
      { slug: 'novyj-chas', name: 'Новий час' },
      { slug: 'moderna', name: 'Модерна доба' },
      { slug: 'suchasnist', name: 'Сучасність' }
    ];

    topics.forEach(function (t) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = '#topic/' + t.slug;
      a.textContent = t.name;
      li.appendChild(a);
      topicList.appendChild(li);
    });

    topicSection.appendChild(topicList);
    sidebar.appendChild(topicSection);

    // Static pages link
    var staticSection = document.createElement('div');
    staticSection.className = 'sidebar-section';
    var staticH3 = document.createElement('h3');
    staticH3.textContent = 'Довідка';
    staticSection.appendChild(staticH3);
    var staticList = document.createElement('ul');
    staticList.className = 'sidebar-nav';
    var staticLi = document.createElement('li');
    var staticA = document.createElement('a');
    staticA.href = 'index.html';
    staticA.textContent = 'Головна сторінка';
    staticLi.appendChild(staticA);
    staticList.appendChild(staticLi);
    staticSection.appendChild(staticList);
    sidebar.appendChild(staticSection);
  }

  function updateRightbar() {
    var rightbar = document.getElementById('app-rightbar');
    if (!rightbar) return;

    rightbar.innerHTML = '';
    var stats = KAIROS.tracker.getStats();

    // Stats box
    var statsBox = document.createElement('div');
    statsBox.className = 'rightbar-box';
    var statsH3 = document.createElement('h3');
    statsH3.textContent = 'Мій прогрес';
    statsBox.appendChild(statsH3);

    var cardTokens = KAIROS.tracker.getState().cardTokens || 0;
    var statRows = [
      { label: 'Балів', value: stats.totalPoints },
      { label: 'Виконано', value: stats.postsCompleted },
      { label: 'Досягнень', value: stats.achievements },
      { label: '🎴 Жетони', value: cardTokens }
    ];

    statRows.forEach(function (s) {
      var row = document.createElement('div');
      row.className = 'stat-row';
      row.innerHTML = '<span>' + s.label + '</span><span class="stat-value">' + s.value + '</span>';
      statsBox.appendChild(row);
    });

    rightbar.appendChild(statsBox);

    // Recent badges
    var state = KAIROS.tracker.getState();
    if (state.earnedAchievements.length > 0) {
      var badgesBox = document.createElement('div');
      badgesBox.className = 'rightbar-box';
      var badgesH3 = document.createElement('h3');
      badgesH3.textContent = 'Останні бейджі';
      badgesBox.appendChild(badgesH3);

      var recentBadges = state.earnedAchievements.slice(-3).reverse();
      recentBadges.forEach(function (achId) {
        var ach = achievementsList.find(function (a) { return a.id === achId; });
        if (ach) {
          var row = document.createElement('div');
          row.style.cssText = 'font-size:12px; padding:3px 0;';
          row.textContent = '🏆 ' + ach.name;
          badgesBox.appendChild(row);
        }
      });

      rightbar.appendChild(badgesBox);
    }

    // Friends / profiles
    var profileIds = Object.keys(profilesMap).slice(0, 6);
    if (profileIds.length > 0) {
      var friendsBox = document.createElement('div');
      friendsBox.className = 'rightbar-box';
      var friendsH3 = document.createElement('h3');
      friendsH3.textContent = 'Персонажі';
      friendsBox.appendChild(friendsH3);

      var grid = document.createElement('div');
      grid.className = 'profile-friends-grid';
      profileIds.forEach(function (id) {
        grid.appendChild(KAIROS.ui.profileMini(profilesMap[id]));
      });
      friendsBox.appendChild(grid);
      rightbar.appendChild(friendsBox);
    }
  }

  function showOnboarding(callback) {
    var html = '<p>Ласкаво просимо до <strong>KAIROS</strong> — платформи для вивчення історії через соціальну мережу!</p>' +
      '<p>Тут ви знайдете дописи від історичних постатей та сучасних персонажів з методичними завданнями.</p>' +
      '<p style="margin-top:8px;"><strong>Як вас звати?</strong></p>' +
      '<input type="text" id="onboarding-name" placeholder="Ваше ім\'я">';

    KAIROS.ui.modal('Вітаємо в KAIROS!', html, function (content) {
      var nameInput = content.querySelector('#onboarding-name');
      var name = nameInput ? nameInput.value.trim() : '';
      if (!name) name = 'Студент';
      KAIROS.tracker.setStudentName(name);
      renderHeader(); // update name in header
      if (callback) callback();
    });
  }

  function performSearch(query) {
    query = (query || '').trim().toLowerCase();
    var content = document.getElementById('app-content');
    if (!content) return;
    if (!query) {
      KAIROS.router.resolve();
      return;
    }

    content.innerHTML = '';

    var header = document.createElement('h2');
    header.className = 'section-header';
    header.textContent = 'Результати пошуку: \u201c' + KAIROS.utils.escapeHtml(query) + '\u201d';
    content.appendChild(header);

    var posts = KAIROS.feed.getAllPosts();
    var profiles = profilesMap;
    var results = posts.filter(function (p) {
      var textMatch = p.content.text.toLowerCase().indexOf(query) !== -1;
      var prof = profiles[p.authorId];
      var nameMatch = prof && prof.name.toLowerCase().indexOf(query) !== -1;
      return textMatch || nameMatch;
    });

    if (results.length === 0) {
      var empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent = 'Нічого не знайдено за запитом \u201c' + query + '\u201d';
      content.appendChild(empty);
      return;
    }

    results.forEach(function (post) {
      var profile = profiles[post.authorId] || {
        id: post.authorId, name: post.authorId, role: '',
        avatarUrl: 'img/avatars/default.svg'
      };
      content.appendChild(KAIROS.ui.postCard(post, profile));
    });
  }

  function getProfiles() {
    return profilesMap;
  }

  function getAchievements() {
    return achievementsList;
  }

  // Start when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    getProfiles: getProfiles,
    getAchievements: getAchievements,
    updateRightbar: updateRightbar
  };

})();
