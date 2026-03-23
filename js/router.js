/* ===========================================
   KAIROS — Hash Router
   =========================================== */
window.KAIROS = window.KAIROS || {};

KAIROS.router = (function () {

  var routes = {};
  var currentRoute = null;

  function register(pattern, handler) {
    routes[pattern] = handler;
  }

  function navigate(hash) {
    if (hash.charAt(0) !== '#') hash = '#' + hash;
    window.location.hash = hash;
  }

  function resolve() {
    var hash = window.location.hash || '#feed';
    var parts = hash.substring(1).split('/');
    var route = parts[0];
    var param = parts.slice(1).join('/');

    // update sidebar active state
    var links = document.querySelectorAll('.sidebar-nav a');
    links.forEach(function (a) {
      var href = a.getAttribute('href');
      if (href === hash || (href === '#feed' && hash === '')) {
        a.classList.add('active');
      } else {
        a.classList.remove('active');
      }
    });

    // update header active state
    var headerLinks = document.querySelectorAll('.header-nav a');
    headerLinks.forEach(function (a) {
      var href = a.getAttribute('href');
      if (href === hash) {
        a.classList.add('active');
      } else {
        a.classList.remove('active');
      }
    });

    var content = document.getElementById('app-content');
    if (!content) return;

    currentRoute = route;

    if (routes[route]) {
      content.innerHTML = '';
      routes[route](param, content);
    } else if (routes['feed']) {
      content.innerHTML = '';
      routes['feed'](null, content);
    }
  }

  function init() {
    window.addEventListener('hashchange', resolve);
    resolve();
  }

  function getCurrentRoute() {
    return currentRoute;
  }

  return {
    register: register,
    navigate: navigate,
    resolve: resolve,
    init: init,
    getCurrentRoute: getCurrentRoute
  };

})();
