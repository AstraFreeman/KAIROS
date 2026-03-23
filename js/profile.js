/* ===========================================
   KAIROS — Profile Renderer
   =========================================== */
window.KAIROS = window.KAIROS || {};

KAIROS.profile = (function () {

  function render(profileId, container) {
    var profiles = KAIROS.app.getProfiles();
    var profile = profiles[profileId];

    if (!profile) {
      container.innerHTML = '<div class="empty-state">Профіль не знайдено</div>';
      return;
    }

    // Profile header with cover
    var headerEl = document.createElement('div');
    headerEl.className = 'profile-header';

    var cover = document.createElement('div');
    cover.className = 'profile-cover';
    cover.style.background = profile.coverColor || '#4a6fa5';
    headerEl.appendChild(cover);

    var info = document.createElement('div');
    info.className = 'profile-info';

    var avatarEl = document.createElement('div');
    avatarEl.className = 'profile-avatar-large';
    var avatarImg = document.createElement('img');
    avatarImg.src = profile.avatarUrl || 'img/avatars/default.svg';
    avatarImg.alt = profile.name;
    avatarEl.appendChild(avatarImg);

    var textInfo = document.createElement('div');
    var nameEl = document.createElement('div');
    nameEl.className = 'profile-name';
    nameEl.textContent = profile.name;

    var roleEl = document.createElement('div');
    roleEl.className = 'profile-role-text';
    roleEl.textContent = profile.role;

    textInfo.appendChild(nameEl);
    textInfo.appendChild(roleEl);

    info.appendChild(avatarEl);
    info.appendChild(textInfo);
    headerEl.appendChild(info);
    container.appendChild(headerEl);

    // Two columns: details + wall
    var layout = document.createElement('div');
    layout.style.cssText = 'display:flex; gap:10px;';

    // Left: details
    var left = document.createElement('div');
    left.style.cssText = 'flex: 0 0 200px;';

    // Bio
    if (profile.bio) {
      var bioBox = document.createElement('div');
      bioBox.className = 'profile-details';
      var bioH3 = document.createElement('h3');
      bioH3.textContent = 'Про себе';
      var bioP = document.createElement('p');
      bioP.style.fontSize = '12px';
      bioP.textContent = profile.bio;
      bioBox.appendChild(bioH3);
      bioBox.appendChild(bioP);
      left.appendChild(bioBox);
    }

    // Info
    var infoBox = document.createElement('div');
    infoBox.className = 'profile-details';
    var infoH3 = document.createElement('h3');
    infoH3.textContent = 'Інформація';
    infoBox.appendChild(infoH3);

    var fields = [
      { label: 'Епоха', value: profile.historicalPeriod },
      { label: 'Місце', value: profile.location },
      { label: 'Інтереси', value: profile.interests ? profile.interests.join(', ') : null }
    ];

    fields.forEach(function (f) {
      if (!f.value) return;
      var row = document.createElement('div');
      row.className = 'profile-detail-row';
      row.innerHTML = '<strong>' + f.label + ':</strong> ' + KAIROS.utils.escapeHtml(f.value);
      infoBox.appendChild(row);
    });

    left.appendChild(infoBox);

    // Friends
    if (profile.friends && profile.friends.length > 0) {
      var friendsBox = document.createElement('div');
      friendsBox.className = 'profile-details';
      var friendsH3 = document.createElement('h3');
      friendsH3.textContent = 'Друзі';
      friendsBox.appendChild(friendsH3);

      var grid = document.createElement('div');
      grid.className = 'profile-friends-grid';

      profile.friends.forEach(function (fId) {
        var friendProfile = profiles[fId];
        if (friendProfile) {
          grid.appendChild(KAIROS.ui.profileMini(friendProfile));
        }
      });

      friendsBox.appendChild(grid);
      left.appendChild(friendsBox);
    }

    // Right: wall (posts by this profile)
    var right = document.createElement('div');
    right.style.cssText = 'flex: 1;';

    var wallH2 = document.createElement('h2');
    wallH2.className = 'section-header';
    wallH2.textContent = 'Стіна';
    right.appendChild(wallH2);

    var posts = KAIROS.feed.getAllPosts().filter(function (p) {
      return p.authorId === profileId;
    });

    if (posts.length === 0) {
      var emptyEl = document.createElement('div');
      emptyEl.className = 'empty-state';
      emptyEl.textContent = 'Поки що немає дописів';
      right.appendChild(emptyEl);
    } else {
      posts.forEach(function (post) {
        right.appendChild(KAIROS.ui.postCard(post, profile));
      });
    }

    layout.appendChild(left);
    layout.appendChild(right);
    container.appendChild(layout);
  }

  function renderSelf(param, container) {
    var tracker = KAIROS.tracker;
    var stats = tracker.getStats();

    var header = document.createElement('h2');
    header.className = 'section-header';
    header.textContent = 'Мій профіль — ' + (stats.name || 'Студент');
    container.appendChild(header);

    // Stats grid
    var statsGrid = document.createElement('div');
    statsGrid.className = 'my-stats';

    var statItems = [
      { value: stats.postsViewed, label: 'Переглянуто' },
      { value: stats.postsCompleted, label: 'Виконано' },
      { value: stats.commentsWritten, label: 'Коментарів' },
      { value: stats.likesGiven, label: 'Вподобань' },
      { value: stats.achievements, label: 'Досягнень' },
      { value: stats.totalPoints, label: 'Балів' }
    ];

    statItems.forEach(function (s) {
      var card = document.createElement('div');
      card.className = 'my-stat-card';
      var val = document.createElement('div');
      val.className = 'my-stat-value';
      val.textContent = s.value;
      var lbl = document.createElement('div');
      lbl.className = 'my-stat-label';
      lbl.textContent = s.label;
      card.appendChild(val);
      card.appendChild(lbl);
      statsGrid.appendChild(card);
    });

    container.appendChild(statsGrid);

    // Earned achievements
    var achHeader = document.createElement('h2');
    achHeader.className = 'section-header';
    achHeader.textContent = 'Мої досягнення';
    container.appendChild(achHeader);

    var achievements = KAIROS.app.getAchievements();
    var earned = achievements.filter(function (a) {
      return tracker.hasAchievement(a.id);
    });

    if (earned.length === 0) {
      var emptyEl = document.createElement('div');
      emptyEl.className = 'empty-state';
      emptyEl.textContent = 'Виконуйте завдання, щоб отримати перші досягнення!';
      container.appendChild(emptyEl);
    } else {
      var grid = document.createElement('div');
      grid.className = 'achievements-grid';
      earned.forEach(function (a) {
        grid.appendChild(KAIROS.ui.achievementCard(a, true));
      });
      container.appendChild(grid);
    }

    // Export button
    var exportWrap = document.createElement('div');
    exportWrap.style.cssText = 'margin-top:16px; text-align:center;';
    var exportBtn = document.createElement('button');
    exportBtn.className = 'btn-export';
    exportBtn.textContent = '📥 Експортувати прогрес (JSON)';
    exportBtn.onclick = function () {
      var data = tracker.exportData();
      var blob = new Blob([data], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'kairos-progress-' + (stats.name || 'student') + '.json';
      a.click();
      URL.revokeObjectURL(url);
    };
    exportWrap.appendChild(exportBtn);
    container.appendChild(exportWrap);
  }

  return {
    render: render,
    renderSelf: renderSelf
  };

})();
