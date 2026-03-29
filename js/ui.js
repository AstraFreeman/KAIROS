/* ===========================================
   KAIROS — UI Components
   =========================================== */
window.KAIROS = window.KAIROS || {};

KAIROS.ui = (function () {

  var utils = KAIROS.utils;
  var tracker = KAIROS.tracker;

  function postCard(post, profile) {
    var card = document.createElement('div');
    card.className = 'post-card' + (post.type === 'ad' ? ' post-card-ad' : '');
    card.dataset.postId = post.id;

    // Header
    var header = document.createElement('div');
    header.className = 'post-header';

    var avatar = document.createElement('div');
    avatar.className = 'post-avatar';
    var avatarImg = document.createElement('img');
    avatarImg.src = profile.avatarUrl || 'img/avatars/default.svg';
    avatarImg.alt = profile.name;
    avatar.appendChild(avatarImg);
    avatar.style.cursor = 'pointer';
    avatar.onclick = function () { KAIROS.router.navigate('#profile/' + profile.id); };

    var info = document.createElement('div');
    info.className = 'post-author-info';

    var nameEl = document.createElement('span');
    nameEl.className = 'post-author-name';
    nameEl.textContent = profile.name;
    nameEl.onclick = function () { KAIROS.router.navigate('#profile/' + profile.id); };

    var roleEl = document.createElement('div');
    roleEl.className = 'post-author-role';
    roleEl.textContent = profile.role;

    info.appendChild(nameEl);
    info.appendChild(roleEl);

    var timeEl = document.createElement('span');
    timeEl.className = 'post-timestamp';
    timeEl.textContent = post.displayDate || utils.timeAgo();

    header.appendChild(avatar);
    header.appendChild(info);
    header.appendChild(timeEl);
    card.appendChild(header);

    // Body
    var body = document.createElement('div');
    body.className = 'post-body';

    // Task label
    if (post.taskType) {
      var label = document.createElement('span');
      label.className = 'post-task-label';
      label.textContent = utils.taskTypeLabel(post.taskType);
      body.appendChild(label);

      if (post.difficulty) {
        var diff = document.createElement('span');
        diff.className = 'post-difficulty';
        diff.textContent = utils.difficultyStars(post.difficulty);
        body.appendChild(diff);
      }
    }

    // Entertainment / ad type badge
    var ENT_BADGES = {
      'fun-fact':  { cls: 'post-badge-fun',       icon: '✨', label: 'Цікавинка'  },
      'story':     { cls: 'post-badge-story',      icon: '📖', label: 'Із життя'   },
      'caricature':{ cls: 'post-badge-caricature', icon: '🎨', label: 'Карикатура' },
      'poster':    { cls: 'post-badge-poster',     icon: '🖼',  label: 'Плакат'     },
      'ad':        { cls: 'post-badge-ad',         icon: '📢', label: 'Реклама'    }
    };
    var badgeDef = ENT_BADGES[post.type];
    if (badgeDef) {
      var badge = document.createElement('span');
      badge.className = 'post-ent-badge ' + badgeDef.cls;
      badge.textContent = badgeDef.icon + ' ' + badgeDef.label;
      body.appendChild(badge);
    }

    var textEl = document.createElement('p');
    textEl.textContent = post.content.text;
    body.appendChild(textEl);

    // Image (caricature / poster / ad visual)
    if (post.content.image) {
      var imgWrap = document.createElement('div');
      imgWrap.className = 'post-image-wrap';
      var imgEl = document.createElement('img');
      imgEl.src = post.content.image;
      imgEl.alt = post.content.imageCaption || post.content.text.substring(0, 60);
      imgEl.className = 'post-image';
      imgEl.onerror = function () { imgWrap.style.display = 'none'; };
      imgWrap.appendChild(imgEl);
      if (post.content.imageCaption) {
        var caption = document.createElement('div');
        caption.className = 'post-image-caption';
        caption.textContent = post.content.imageCaption;
        imgWrap.appendChild(caption);
      }
      body.appendChild(imgWrap);
    }

    // Attachment (text quote)
    if (post.content.attachment) {
      var att = document.createElement('div');
      att.className = 'post-attachment';
      att.textContent = post.content.attachment;
      body.appendChild(att);
    }

    card.appendChild(body);

    // Actions bar
    var actionsBar = document.createElement('div');
    actionsBar.className = 'post-actions-bar';

    var likeBtn = likeButton(post.id);
    actionsBar.appendChild(likeBtn);

    var commentBtn = document.createElement('button');
    commentBtn.className = 'post-action-btn';
    commentBtn.innerHTML = '<span class="icon">💬</span>Коментувати';
    commentBtn.onclick = function () {
      var commentsSection = card.querySelector('.post-comments');
      if (commentsSection) {
        commentsSection.style.display = commentsSection.style.display === 'none' ? 'block' : 'none';
      }
    };
    actionsBar.appendChild(commentBtn);

    // "Перевірити факт" button for ad posts
    if (post.type === 'ad' && post.debunk) {
      var debunkBtn = document.createElement('button');
      debunkBtn.className = 'post-action-btn post-debunk-btn';
      debunkBtn.innerHTML = '<span class="icon">🔍</span>Перевірити факт';
      var debunkShown = false;
      debunkBtn.onclick = function () {
        if (debunkShown) return;
        debunkShown = true;
        var debunkEl = document.createElement('div');
        debunkEl.className = 'post-debunk-reveal';
        debunkEl.innerHTML = '<strong>✅ Факт-чек:</strong> ' + utils.escapeHtml(post.debunk);
        card.querySelector('.post-body').appendChild(debunkEl);
        debunkBtn.disabled = true;
        debunkBtn.textContent = '✅ Перевірено';
        tracker.record({ type: 'view', postId: post.id, topic: post.topic });
        KAIROS.app.updateRightbar();
      };
      actionsBar.appendChild(debunkBtn);
    }

    // Complete task button or response form
    if (post.taskType && !tracker.hasCompleted(post.id)) {
      if (post.responseType) {
        // пост має систему відповідей — кнопка відкриває форму
        var respondBtn = document.createElement('button');
        respondBtn.className = 'post-action-btn';
        respondBtn.innerHTML = '<span class="icon">📝</span>Відповісти';
        respondBtn.onclick = function () {
          var responseSection = card.querySelector('.task-response-section');
          if (responseSection) {
            responseSection.style.display = responseSection.style.display === 'none' ? 'block' : 'none';
          }
        };
        actionsBar.appendChild(respondBtn);
      } else {
        // стара поведінка — просте зарахування
        var completeBtn = document.createElement('button');
        completeBtn.className = 'post-action-btn';
        completeBtn.innerHTML = '<span class="icon">✅</span>Виконано';
        completeBtn.onclick = function () {
          tracker.record({
            type: 'complete',
            postId: post.id,
            topic: post.topic,
            difficulty: post.difficulty,
            points: post.points || 10
          });
          completeBtn.style.display = 'none';
          toast('Завдання виконано! +' + (post.points || 10) + ' балів');
          KAIROS.app.updateRightbar();
        };
        actionsBar.appendChild(completeBtn);
      }
    }

    card.appendChild(actionsBar);

    // Task response section (якщо пост має responseType)
    if (post.responseType && !tracker.hasCompleted(post.id)) {
      var responseSection = taskResponseBox(post, profile);
      card.appendChild(responseSection);
    } else if (post.responseType && tracker.hasCompleted(post.id)) {
      // показати збережену відповідь
      var savedResponse = tracker.getTaskResponse(post.id);
      if (savedResponse) {
        var doneSection = document.createElement('div');
        doneSection.className = 'task-response-section task-response-done';
        doneSection.innerHTML = '<div class="task-response-result success">' +
          '<span class="icon">✅</span> Завдання виконано</div>';
        card.appendChild(doneSection);
      }
    }

    // Comments section
    var commentsSection = commentBox(post.id);
    card.appendChild(commentsSection);

    // Track view
    if (!tracker.hasSeen(post.id)) {
      tracker.record({ type: 'view', postId: post.id, topic: post.topic });
    }

    return card;
  }

  function likeButton(postId) {
    var btn = document.createElement('button');
    btn.className = 'post-action-btn' + (tracker.hasLiked(postId) ? ' liked' : '');

    function updateText() {
      btn.innerHTML = tracker.hasLiked(postId)
        ? '<span class="icon">👍</span>Подобається'
        : '<span class="icon">👍</span>Подобається';
      btn.className = 'post-action-btn' + (tracker.hasLiked(postId) ? ' liked' : '');
    }

    updateText();

    btn.onclick = function () {
      if (tracker.hasLiked(postId)) {
        tracker.record({ type: 'unlike', postId: postId });
      } else {
        tracker.record({ type: 'like', postId: postId });
      }
      updateText();
    };

    return btn;
  }

  function commentBox(postId) {
    var section = document.createElement('div');
    section.className = 'post-comments';
    section.style.display = 'none';

    function renderComments() {
      // clear existing comments (keep input)
      var existing = section.querySelectorAll('.comment-item');
      existing.forEach(function (el) { el.remove(); });

      var comments = tracker.getComments(postId);
      var state = tracker.getState();

      comments.forEach(function (c) {
        var item = document.createElement('div');
        item.className = 'comment-item';

        var av = document.createElement('div');
        av.className = 'comment-avatar';
        var avImg = document.createElement('img');
        avImg.src = 'img/avatars/default.svg';
        av.appendChild(avImg);

        var body = document.createElement('div');
        body.className = 'comment-body';

        var author = document.createElement('span');
        author.className = 'comment-author';
        author.textContent = state.studentName || 'Студент';

        var text = document.createTextNode(' ' + c.text);
        body.appendChild(author);
        body.appendChild(text);

        item.appendChild(av);
        item.appendChild(body);
        section.insertBefore(item, section.querySelector('.comment-input-wrap'));
      });
    }

    renderComments();

    // Input
    var inputWrap = document.createElement('div');
    inputWrap.className = 'comment-input-wrap';

    var input = document.createElement('textarea');
    input.className = 'comment-input';
    input.placeholder = 'Написати коментар...';
    input.rows = 1;

    var submitBtn = document.createElement('button');
    submitBtn.className = 'comment-submit';
    submitBtn.textContent = 'Надіслати';
    submitBtn.onclick = function () {
      var text = input.value.trim();
      if (!text) return;
      tracker.record({ type: 'comment', postId: postId, text: text });
      input.value = '';
      renderComments();
      section.style.display = 'block';
      KAIROS.app.updateRightbar();
    };

    inputWrap.appendChild(input);
    inputWrap.appendChild(submitBtn);
    section.appendChild(inputWrap);

    return section;
  }

  function taskResponseBox(post, profile) {
    var section = document.createElement('div');
    section.className = 'task-response-section';
    section.style.display = 'none';

    var title = document.createElement('div');
    title.className = 'task-response-title';
    title.textContent = 'Ваша відповідь:';
    section.appendChild(title);

    var textarea = document.createElement('textarea');
    textarea.className = 'task-response-input';
    textarea.placeholder = 'Напишіть вашу відповідь тут...';
    textarea.rows = 4;
    section.appendChild(textarea);

    var btnWrap = document.createElement('div');
    btnWrap.className = 'task-response-actions';

    var submitBtn = document.createElement('button');
    submitBtn.className = 'btn-primary';
    submitBtn.textContent = 'Надіслати відповідь';

    var feedbackEl = document.createElement('div');
    feedbackEl.className = 'task-response-feedback';
    feedbackEl.style.display = 'none';

    var charReplyEl = document.createElement('div');
    charReplyEl.className = 'task-response-character-reply';
    charReplyEl.style.display = 'none';

    submitBtn.onclick = function () {
      var answer = textarea.value.trim();
      if (!answer) return;

      var validation = KAIROS.validation;
      var result = validation.evaluate(answer, post);

      // Показати фідбек
      feedbackEl.style.display = 'block';
      feedbackEl.className = 'task-response-feedback ' + (result.passed ? 'success' : 'warning');
      feedbackEl.textContent = result.feedback;

      // Показати відповідь персонажа
      if (result.characterReply) {
        charReplyEl.style.display = 'block';
        charReplyEl.innerHTML = '<strong>' + utils.escapeHtml(profile.name) + ':</strong> ' +
          utils.escapeHtml(result.characterReply);
      }

      if (result.passed) {
        // Зарахувати завдання
        var totalPoints = (post.points || 10) + result.bonusPoints;
        tracker.record({
          type: 'task-response',
          postId: post.id,
          text: answer,
          result: result
        });
        tracker.record({
          type: 'complete',
          postId: post.id,
          topic: post.topic,
          difficulty: post.difficulty,
          points: totalPoints
        });

        var msg = 'Завдання виконано! +' + totalPoints + ' балів';
        if (result.bonusPoints > 0) {
          msg += ' (бонус +' + result.bonusPoints + ')';
        }
        var tokenMsg = (post.difficulty >= 3 ? 2 : 1);
        msg += ' | +' + tokenMsg + ' 🎴';
        toast(msg);

        // Заблокувати поле
        textarea.disabled = true;
        submitBtn.style.display = 'none';
        KAIROS.app.updateRightbar();
      }
    };

    btnWrap.appendChild(submitBtn);
    section.appendChild(btnWrap);
    section.appendChild(feedbackEl);
    section.appendChild(charReplyEl);

    return section;
  }

  function profileMini(profile) {
    var wrap = document.createElement('div');
    wrap.className = 'profile-friend-mini';
    wrap.onclick = function () { KAIROS.router.navigate('#profile/' + profile.id); };

    var img = document.createElement('img');
    img.src = profile.avatarUrl || 'img/avatars/default.svg';
    img.alt = profile.name;

    var name = document.createElement('span');
    name.textContent = profile.name.split(' ')[0];

    wrap.appendChild(img);
    wrap.appendChild(name);
    return wrap;
  }

  function achievementCard(achievement, isEarned) {
    var card = document.createElement('div');
    card.className = 'achievement-card' + (isEarned ? '' : ' locked');

    var icon = document.createElement('div');
    icon.className = 'achievement-icon';
    var img = document.createElement('img');
    img.src = achievement.icon || 'img/badges/default.svg';
    img.alt = achievement.name;
    icon.appendChild(img);

    var name = document.createElement('div');
    name.className = 'achievement-name';
    name.textContent = achievement.name;

    var desc = document.createElement('div');
    desc.className = 'achievement-desc';
    desc.textContent = achievement.description;

    var pts = document.createElement('div');
    pts.className = 'achievement-points';
    pts.textContent = achievement.points + ' балів';

    card.appendChild(icon);
    card.appendChild(name);
    card.appendChild(desc);
    card.appendChild(pts);
    return card;
  }

  function toast(message, isAchievement) {
    var container = document.getElementById('toast-container');
    if (!container) return;

    var t = document.createElement('div');
    t.className = 'toast' + (isAchievement ? ' achievement-toast' : '');
    t.textContent = message;
    container.appendChild(t);

    setTimeout(function () {
      if (t.parentNode) t.parentNode.removeChild(t);
    }, 4000);
  }

  function modal(title, bodyHtml, onSubmit) {
    var overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    var box = document.createElement('div');
    box.className = 'modal-box';

    var h2 = document.createElement('h2');
    h2.textContent = title;
    box.appendChild(h2);

    var content = document.createElement('div');
    content.innerHTML = bodyHtml;
    box.appendChild(content);

    if (onSubmit) {
      var btn = document.createElement('button');
      btn.className = 'btn-primary';
      btn.textContent = 'Почати';
      btn.onclick = function () {
        onSubmit(content);
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      };
      box.appendChild(btn);
    }

    overlay.appendChild(box);
    document.body.appendChild(overlay);
    return overlay;
  }

  return {
    postCard: postCard,
    likeButton: likeButton,
    commentBox: commentBox,
    taskResponseBox: taskResponseBox,
    profileMini: profileMini,
    achievementCard: achievementCard,
    toast: toast,
    modal: modal
  };

})();
