/* ===========================================
   KAIROS — Landing Page Hybrid Feed
   Depends on: js/utils.js
   =========================================== */
(function () {

  var utils = KAIROS.utils;

  var ERA_ADS = [
    {
      slug: 'starodavnij-svit',
      name: 'Стародавній світ',
      role: 'Офіційна сторінка ери',
      color: '#c9a84c',
      gradient: 'linear-gradient(135deg, #c9a84c, #8b6914)',
      emoji: '\uD83C\uDFDB\uFE0F',
      text: 'Піраміди, філософи, перші демократії... Подорожуйте до витоків цивілізації разом з Геродотом та Фукідідом!',
      desc: 'Єгипет \u2022 Месопотамія \u2022 Греція \u2022 Рим'
    },
    {
      slug: 'serednovichchya',
      name: 'Середньовіччя',
      role: 'Офіційна сторінка ери',
      color: '#8b4a6b',
      gradient: 'linear-gradient(135deg, #8b4a6b, #5a2a4b)',
      emoji: '\u2694\uFE0F',
      text: 'Лицарі, хрестові походи, літописи Нестора... Відкрийте таємниці середніх віків та Київської Русі!',
      desc: 'Феодалізм \u2022 Візантія \u2022 Київська Русь'
    },
    {
      slug: 'novyj-chas',
      name: 'Новий час',
      role: 'Офіційна сторінка ери',
      color: '#4a6fa5',
      gradient: 'linear-gradient(135deg, #4a6fa5, #2a4f85)',
      emoji: '\uD83C\uDF0D',
      text: 'Великі відкриття, революції, Просвітництво... Вольтер запрошує вас дискутувати про свободу та розум!',
      desc: 'Реформація \u2022 Просвітництво \u2022 Революції'
    },
    {
      slug: 'moderna',
      name: 'Модерна доба',
      role: 'Офіційна сторінка ери',
      color: '#3a6b4a',
      gradient: 'linear-gradient(135deg, #3a6b4a, #1a4b2a)',
      emoji: '\uD83C\uDFED',
      text: 'Нації, імперії, війни та боротьба за незалежність... Грушевський та Ранке чекають на вашу думку!',
      desc: 'Промислова революція \u2022 Світові війни'
    },
    {
      slug: 'suchasnist',
      name: 'Сучасність',
      role: 'Офіційна сторінка ери',
      color: '#4a8b7a',
      gradient: 'linear-gradient(135deg, #4a8b7a, #2a6b5a)',
      emoji: '\uD83C\uDF10',
      text: 'Холодна війна, глобалізація, незалежна Україна... Як викладати історію, яку ми самі переживаємо?',
      desc: 'Глобалізація \u2022 Незалежність \u2022 XXI століття'
    }
  ];

  function buildPostCard(post, profile) {
    var card = document.createElement('div');
    card.className = 'post-card';

    // Header
    var header = document.createElement('div');
    header.className = 'post-header';

    var avatar = document.createElement('a');
    avatar.className = 'post-avatar';
    avatar.href = 'platform.html#profile/' + profile.id;
    var avatarImg = document.createElement('img');
    avatarImg.src = profile.avatarUrl || 'img/avatars/default.svg';
    avatarImg.alt = profile.name;
    avatar.appendChild(avatarImg);

    var info = document.createElement('div');
    info.className = 'post-author-info';
    var nameEl = document.createElement('a');
    nameEl.className = 'post-author-name';
    nameEl.href = 'platform.html#profile/' + profile.id;
    nameEl.textContent = profile.name;
    var roleEl = document.createElement('div');
    roleEl.className = 'post-author-role';
    roleEl.textContent = profile.role;

    info.appendChild(nameEl);
    info.appendChild(roleEl);

    var ts = document.createElement('div');
    ts.className = 'post-timestamp';
    ts.textContent = post.displayDate || '';

    header.appendChild(avatar);
    header.appendChild(info);
    header.appendChild(ts);

    // Body
    var body = document.createElement('div');
    body.className = 'post-body';

    var taskLabel = document.createElement('span');
    taskLabel.className = 'post-task-label';
    taskLabel.textContent = utils.taskTypeLabel(post.taskType);

    var diffSpan = document.createElement('span');
    diffSpan.className = 'post-difficulty';
    diffSpan.textContent = utils.difficultyStars(post.difficulty);

    body.appendChild(taskLabel);
    body.appendChild(diffSpan);

    var textP = document.createElement('p');
    textP.style.marginTop = '6px';
    textP.textContent = post.content.text;
    body.appendChild(textP);

    if (post.content.attachment) {
      var att = document.createElement('div');
      att.className = 'post-attachment';
      att.textContent = post.content.attachment;
      body.appendChild(att);
    }

    // Footer
    var footer = document.createElement('div');
    footer.className = 'post-footer';
    var openLink = document.createElement('a');
    openLink.href = 'platform.html#post/' + post.id;
    openLink.textContent = 'Відкрити завдання \u2192';
    footer.appendChild(openLink);

    card.appendChild(header);
    card.appendChild(body);
    card.appendChild(footer);

    return card;
  }

  function buildEraAd(era) {
    var card = document.createElement('div');
    card.className = 'post-card era-ad';
    card.style.setProperty('--era-color', era.color);

    // Header
    var header = document.createElement('div');
    header.className = 'post-header';

    var avatar = document.createElement('div');
    avatar.className = 'post-avatar';
    avatar.style.cssText = 'background:' + era.color + '; display:flex; align-items:center; justify-content:center; font-size:20px;';
    avatar.textContent = era.emoji;

    var info = document.createElement('div');
    info.className = 'post-author-info';
    var nameEl = document.createElement('div');
    nameEl.className = 'post-author-name';
    nameEl.style.color = era.color;
    nameEl.textContent = era.name;
    var roleEl = document.createElement('div');
    roleEl.className = 'post-author-role';
    roleEl.textContent = era.role;
    info.appendChild(nameEl);
    info.appendChild(roleEl);

    var sponsored = document.createElement('div');
    sponsored.className = 'sponsored-label';
    sponsored.textContent = 'Спонсоровано';

    header.appendChild(avatar);
    header.appendChild(info);
    header.appendChild(sponsored);

    // Banner image
    var banner = document.createElement('div');
    banner.className = 'era-ad-banner';
    banner.style.background = era.gradient;
    banner.textContent = era.emoji;

    // Body
    var body = document.createElement('div');
    body.className = 'post-body';

    var descEl = document.createElement('div');
    descEl.className = 'era-ad-desc';
    descEl.textContent = era.desc;
    body.appendChild(descEl);

    var textP = document.createElement('p');
    textP.textContent = era.text;
    body.appendChild(textP);

    var cta = document.createElement('a');
    cta.className = 'era-ad-cta';
    cta.href = 'platform.html#topic/' + era.slug;
    cta.textContent = 'Дослідити';
    body.appendChild(cta);

    card.appendChild(header);
    card.appendChild(banner);
    card.appendChild(body);

    return card;
  }

  async function init() {
    var feedContainer = document.getElementById('landing-feed');
    if (!feedContainer) return;

    try {
      var profilesData = await utils.loadJSON('data/profiles.json');
      var profilesMap = {};
      profilesData.profiles.forEach(function (p) { profilesMap[p.id] = p; });

      var topicSlugs = ['starodavnij-svit', 'serednovichchya', 'novyj-chas', 'moderna', 'suchasnist'];
      var allPosts = [];

      for (var i = 0; i < topicSlugs.length; i++) {
        try {
          var data = await utils.loadJSON('data/posts/' + topicSlugs[i] + '.json');
          allPosts = allPosts.concat(data.posts);
        } catch (e) { /* skip */ }
      }

      // Select ~8 posts: first from each topic, then fill
      var selected = [];
      var used = {};
      topicSlugs.forEach(function (slug) {
        var topicPosts = allPosts.filter(function (p) { return p.topic === slug; });
        if (topicPosts.length > 0) {
          selected.push(topicPosts[0]);
          used[topicPosts[0].id] = true;
        }
      });
      var remaining = allPosts.filter(function (p) { return !used[p.id]; });
      remaining = utils.shuffleArray(remaining).slice(0, 3);
      selected = selected.concat(remaining);
      selected = utils.shuffleArray(selected);

      // Interleave: 2 posts, 1 era ad, repeat
      var eraIndex = 0;
      var postIndex = 0;

      // Clear loading message
      feedContainer.innerHTML = '';

      while (postIndex < selected.length || eraIndex < ERA_ADS.length) {
        for (var j = 0; j < 2 && postIndex < selected.length; j++) {
          var post = selected[postIndex];
          var profile = profilesMap[post.authorId] || {
            id: post.authorId, name: post.authorId, role: '',
            avatarUrl: 'img/avatars/default.svg'
          };
          feedContainer.appendChild(buildPostCard(post, profile));
          postIndex++;
        }
        if (eraIndex < ERA_ADS.length) {
          feedContainer.appendChild(buildEraAd(ERA_ADS[eraIndex]));
          eraIndex++;
        }
      }

    } catch (e) {
      feedContainer.innerHTML = '<p class="loading-msg">Не вдалося завантажити стрічку. Переконайтесь, що сервер запущено.</p>';
      console.error('Landing feed error:', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
