# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**KAIROS — історія як правильний момент** (καιρός з грецької — «правильний момент»).

Навчальна платформа для студентів-бакалаврів історичної освіти. Формат — симуляція соцмережі зразка Facebook 2010: дописи-завдання від історичних постатей та вигаданих персонажів, профілі, лайки, коментарі, система досягнень. Мова інтерфейсу — українська.

### Логотип / іконка

**Візуальний опис:** класична округла «бульбашка» чату (speech bubble) з хвостиком. Всередині замість тексту — грецький меандр.

**Ідейне наповнення:**
- **Форма хмарки** — одразу говорить користувачеві: «Тут спілкуються. Це соцмережа/платформа для обговорення».
- **Грецький меандр** — універсальний символ античності та вічності. У цьому контексті означає: «Ми обговорюємо події минулого».
- **Поєднання** — замість тексту в хмаринці — історія. Ідеальна метафора для платформи KAIROS, де навчання відбувається через симуляцію діалогу з історичними постатями.

## Stack & Running

HTML + CSS + vanilla JavaScript (ES5-style IIFEs, no modules/bundler/framework). No build step, no tests, no linter. Uses `fetch()` for JSON data, so **requires an HTTP server** — `file://` won't work.

```
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Three UI layers

The project has **three coexisting UI layers**:

1. **Login page** (`index.html` + `css/login.css`) — Facebook 2010-style login screen. Inline JS only. Select dropdown uses narrative email logins (e.g., `Pharaoh_Scribe@nile.delta`). Password: `L0v3 H1sT0r` (hidden in top-right corner, same color as background). Successful login redirects to topic page or SPA feed.
2. **Group pages** (`pages/*.html` + `css/style.css`) — styled as Facebook group pages. Each page has a color-coded cover gradient via `body` class (`era-starodavnij`, `era-serednovichchya`, `era-novyj-chas`, `era-moderna`, `era-suchasnist`). Structure: header, nav (8 links), group-cover, group-info, group-tabs, group-body, group-cta ("До стрічки"). No JS.
3. **SPA shell** (`platform.html` + `css/kairos.css` + `js/*.js`) — a hash-router JS app. Routes: `#feed`, `#topic/<slug>`, `#profile/<id>`, `#my-profile`, `#achievements`, `#post/<id>`.

Layers are connected: login → topic pages or SPA; topic pages link to SPA via nav ("Платформа", "Особиста інформація") and "До стрічки" button; SPA sidebar links back to `index.html`.

## Architecture (SPA)

Global namespace: `window.KAIROS`. Each module is an IIFE that attaches to `KAIROS.<name>`.

**Script load order matters** (no module system):
1. `utils.js` — helpers: `loadJSON`, `escapeHtml`, `shuffleArray`, `timeAgo`, task type labels
2. `tracker.js` — localStorage-backed state (`kairos_state` key): tracks views, likes, comments, completions, points, achievements
3. `ui.js` — DOM component builders: `postCard`, `likeButton`, `commentBox`, `profileMini`, `achievementCard`, `toast`, `modal`
4. `achievements.js` — condition evaluator (`checkAll`) triggered after every tracker action
5. `feed.js` — scoring/ranking algorithm for posts (weighted by unseen, difficulty match, topic diversity, prerequisites)
6. `profile.js` — profile page and "my profile" renderers
7. `router.js` — hash-based router (`#route/param`)
8. `app.js` — entry point: loads all JSON data, registers routes, renders shell, shows onboarding modal for new users

**Key cross-module calls**: `tracker.record()` → `achievements.checkAll()` → may call `ui.toast()` + `app.updateRightbar()`. Feed scoring reads `tracker` state and `config.json` weights.

## Data files

- `data/config.json` — feed algorithm weights, page size, max difficulty jump
- `data/profiles.json` — historical character profiles (id, name, role, bio, avatarUrl, friends, etc.)
- `data/achievements.json` — achievement definitions with conditions
- `data/posts/<topic-slug>.json` — posts per topic, each with id, authorId, topic, taskType, difficulty, points, prerequisites, content

## Conventions

- **Transliteration**: file names use transliterated Ukrainian via hyphens (e.g., `novyj-chas`, `serednovichchya`)
- **Topic slugs** used as identifiers everywhere: `starodavnij-svit`, `serednovichchya`, `novyj-chas`, `moderna`, `suchasnist`
- **Nav duplication**: group pages duplicate the `<nav>` in every HTML file (8 links); active page gets class `active`. Adding a new page requires updating nav in **all 5** `pages/*.html` files. `index.html` has no nav (login-only).
- **Images**: `img/avatars/` for profile avatars, `img/badges/` for achievement badges. Default avatar: `img/avatars/default.svg`. `img/favicon-16.png` / `img/favicon-32.png` — favicons. `img/logo.svg` — vector logo (displayed with "digital ruin" glitch effect on login page).
- **No build step**: edit files directly, refresh browser

## Adding content

**New post**: add to `data/posts/<topic>.json`. Required fields: `id`, `authorId` (must exist in profiles.json), `topic` (slug), `taskType`, `difficulty` (1-5), `points`, `content.text`. Optional: `prerequisites` (array of post IDs), `content.attachment`, `displayDate`.

**New profile**: add to `data/profiles.json` `profiles` array. Fields: `id`, `name`, `role`, `avatarUrl`, `bio`, `historicalPeriod`, `location`, `interests`, `friends`, `coverColor`.

**New achievement**: add to `data/achievements.json`. Condition types: `action-count`, `task-type-count`, `topic-complete`, `points-threshold`, `posts-viewed`, `posts-completed`.

**Task types**: `source-analysis`, `chronology`, `cause-effect`, `historiography`, `comparison`, `debate`, `map-work` (defined in `utils.js` `TASK_TYPE_LABELS`).
