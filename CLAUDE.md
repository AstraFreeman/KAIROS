# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**KAIROS — історія як правильний момент** (καιρός з грецької — «правильний момент»).

Навчальна платформа для студентів-бакалаврів історичної освіти. Формат — симуляція соцмережі зразка Facebook 2010: дописи-завдання від історичних постатей та вигаданих персонажів, профілі, лайки, коментарі, система досягнень. Мова інтерфейсу — українська.

## Stack & Running

HTML + CSS + vanilla JavaScript (ES5-style IIFEs, no modules/bundler/framework). Uses `fetch()` for JSON data, so **requires an HTTP server** — opening `index.html` via `file://` won't work.

Quick start: `python -m http.server 8000` (or any static server) from the project root, then open `http://localhost:8000`.

## Two UI layers

The project has **two coexisting UI approaches**:

1. **Static HTML pages** (`index.html` + `pages/*.html`) — topic landing pages with nav bar, header, footer. These are standalone HTML with shared `css/style.css`. No JS.
2. **SPA shell** — a hash-router JS app (loaded from `kairos.css` + `js/*.js`). Uses `#feed`, `#topic/<slug>`, `#profile/<id>`, `#my-profile`, `#achievements`, `#post/<id>` routes. The SPA entry point is an HTML file that includes `<div id="app-header">`, `<div id="app-sidebar">`, `<div id="app-content">`, etc.

The static pages and SPA are not currently integrated — they exist in parallel.

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
8. `app.js` — entry point: loads all JSON data, registers routes, renders shell (header, sidebar, rightbar), shows onboarding modal for new users

**Key cross-module calls**: `tracker.record()` → `achievements.checkAll()` → may call `ui.toast()` + `app.updateRightbar()`. Feed scoring reads `tracker` state and `config.json` weights.

## Data files

- `data/config.json` — feed algorithm weights, page size, max difficulty jump
- `data/profiles.json` — historical character profiles (id, name, role, bio, avatarUrl, friends, etc.)
- `data/achievements.json` — achievement definitions with conditions (action-count, task-type-count, topic-complete, points-threshold, etc.)
- `data/posts/<topic-slug>.json` — posts per topic, each with id, authorId, topic, taskType, difficulty, points, prerequisites, content

## CSS files

- `css/style.css` — styles for the static HTML pages (topics grid, nav, header, footer)
- `css/kairos.css` — Facebook 2010 theme for the SPA (fixed header, 3-column layout, post cards, modals, toasts, achievements)

## Conventions

- **Transliteration**: file names use transliterated Ukrainian via hyphens (e.g., `novyj-chas`, `serednovichchya`)
- **Topic slugs** used as identifiers everywhere: `starodavnij-svit`, `serednovichchya`, `novyj-chas`, `moderna`, `suchasnist`
- **Nav duplication**: static pages duplicate the `<nav>` in every HTML file; active page gets class `active`. Adding a new static page requires updating nav in all HTML files.
- **No build step**: edit files directly, refresh browser

## Adding content

**New post**: add to the appropriate `data/posts/<topic>.json`. Required fields: `id`, `authorId` (must exist in profiles.json), `topic` (slug), `taskType`, `difficulty` (1-5), `points`, `content.text`. Optional: `prerequisites` (array of post IDs), `content.attachment`, `displayDate`.

**New profile**: add to `data/profiles.json` `profiles` array. Fields: `id`, `name`, `role`, `avatarUrl`, `bio`, `historicalPeriod`, `location`, `interests`, `friends`, `coverColor`.

**New achievement**: add to `data/achievements.json`. Condition types: `action-count`, `task-type-count`, `topic-complete`, `points-threshold`, `posts-viewed`, `posts-completed`.

**Task types**: `source-analysis`, `chronology`, `cause-effect`, `historiography`, `comparison`, `debate`, `map-work` (defined in `utils.js` `TASK_TYPE_LABELS`).
