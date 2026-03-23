# План: Головна сторінка як екран логіну

## Контекст
Гібридна стрічка на головній втрачає фокус обох дизайнів. Замінити index.html на стилізований екран логіну соцмережі, де "логін" — це вибір розділу, а "пароль" — завжди `L0v3 H1sT0r`. Це створює ігрову механіку входу та одночасно навігацію по розділах.

---

## Дизайн

Класичний login-екран у стилі Facebook 2010:
- Фон: `#3b5998` (синій FB) або `#e9eaed` з центрованим білим блоком
- Зверху: **KAIROS** великим шрифтом + "Інтерактивна платформа для вивчення історії"
- Форма з двома полями:
  - **Логін** — `<select>` з 6 варіантів:
    1. Стародавній світ
    2. Середньовіччя
    3. Новий час
    4. Модерна доба
    5. Сучасність
    6. Усі теми
  - **Пароль** — `<input type="password">`, очікуване значення: `L0v3 H1sT0r`
- Кнопка **Увійти**
- При неправильному паролі — повідомлення про помилку (стилізоване)
- При правильному:
  - Теми 1-5 → перехід на `pages/<slug>.html`
  - "Усі теми" → перехід на `platform.html#feed`

## Файли

### Змінити: `index.html`
Повністю замінити вміст. Нова структура:
```
<!DOCTYPE html>
<html lang="uk">
<head>
  <title>KAIROS — Вхід</title>
  <link rel="stylesheet" href="css/login.css">
</head>
<body>
  <div class="login-page">
    <div class="login-brand">
      <h1>KAIROS</h1>
      <p>Інтерактивна платформа для вивчення історії</p>
    </div>
    <div class="login-box">
      <form id="login-form">
        <label for="login-section">Логін</label>
        <select id="login-section">
          <option value="starodavnij-svit">Стародавній світ</option>
          <option value="serednovichchya">Середньовіччя</option>
          <option value="novyj-chas">Новий час</option>
          <option value="moderna">Модерна доба</option>
          <option value="suchasnist">Сучасність</option>
          <option value="all">Усі теми</option>
        </select>
        <label for="login-password">Пароль</label>
        <input type="password" id="login-password" placeholder="Введіть пароль">
        <div id="login-error" class="login-error" hidden>
          Невірний пароль. Спробуйте ще раз.
        </div>
        <button type="submit">Увійти</button>
      </form>
    </div>
    <footer>&copy; 2026 KAIROS. Навчальна платформа.</footer>
  </div>
  <script> (inline — ~15 рядків) </script>
</body>
```

Inline JS логіка:
```js
document.getElementById('login-form').addEventListener('submit', function(e) {
  e.preventDefault();
  var password = document.getElementById('login-password').value;
  var section = document.getElementById('login-section').value;
  var error = document.getElementById('login-error');
  if (password !== 'L0v3 H1sT0r') {
    error.hidden = false;
    return;
  }
  error.hidden = true;
  if (section === 'all') {
    window.location.href = 'platform.html#feed';
  } else {
    window.location.href = 'pages/' + section + '.html';
  }
});
```

### Створити: `css/login.css`
Окремий CSS для login-сторінки. Стиль Facebook 2010 login:

- `.login-page` — мін. висота 100vh, фон `#e9eaed`, flex-центрування
- `.login-brand` — текст по центру: `h1` великий білий (або темний) шрифт, `p` підзаголовок
- `.login-box` — білий блок з тінню, border-radius: 3px, padding: 20px, max-width: 400px
- `select`, `input` — повна ширина, padding: 8px, border: 1px solid #ccc, border-radius: 3px, font-size: 14px
- `label` — font-size: 12px, font-weight: bold, color: #333, margin-bottom: 4px
- `button` — фон #4267b2, колір #fff, повна ширина, padding: 10px, bold, border-radius: 3px
- `.login-error` — колір: #d32f2f, фон: #ffeaea, padding: 8px, border-radius: 3px, font-size: 12px
- `footer` — маленький текст внизу, color: #999

### Файли що більше НЕ потрібні на index.html:
- `css/style.css` — не підключається (login має свій CSS)
- `css/landing.css` — не підключається
- `js/utils.js` + `js/landing.js` — не підключаються

**Примітка**: `css/style.css` та `css/landing.css` залишаються в проекті — вони використовуються іншими сторінками (pages/*.html та при потребі). `js/landing.js` поки що не використовується ніде, але може знадобитися пізніше.

### Не змінювати:
- `platform.html` — без змін
- `pages/*.html` — без змін (зберігають свої nav, header, footer, посилання "Платформа")
- `js/*` — без змін
- `css/style.css`, `css/landing.css`, `css/kairos.css` — без змін

---

## Перевірка
1. `python -m http.server 8000` → `localhost:8000` — екран логіну
2. Ввести пароль "wrong" → повідомлення про помилку
3. Обрати "Стародавній світ" + пароль `L0v3 H1sT0r` → перехід на `pages/starodavnij-svit.html`
4. Обрати "Усі теми" + правильний пароль → перехід на `platform.html#feed`
5. Інші сторінки (pages/*.html, platform.html) працюють як раніше
