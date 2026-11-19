/* ================= ТЕМА: Авто (как на телефоне) → Светлая → Тёмная =================
   Выбор хранится в браузере. Сама тема ставится ещё в <head> (без белой вспышки). */
(function () {
  var BB = window.BB = window.BB || {};
  var ORDER = ['auto', 'light', 'dark'];
  var ICON = { auto: 'device-mobile', light: 'sun', dark: 'moon' };
  Object.assign(window.I18N.ru, { themeTitle: 'Тема оформления', th_auto: 'Авто', th_light: 'Светлая', th_dark: 'Тёмная',
    thToast_auto: 'Тема: как на телефоне', thToast_light: 'Тема: светлая', thToast_dark: 'Тема: тёмная' });
  Object.assign(window.I18N.ky, { themeTitle: 'Түс темасы', th_auto: 'Авто', th_light: 'Жарык', th_dark: 'Караңгы',
    thToast_auto: 'Тема: телефондогудай', thToast_light: 'Тема: жарык', thToast_dark: 'Тема: караңгы' });
  Object.assign(window.I18N.en, { themeTitle: 'Color theme', th_auto: 'Auto', th_light: 'Light', th_dark: 'Dark',
    thToast_auto: 'Theme: same as your device', thToast_light: 'Theme: light', thToast_dark: 'Theme: dark' });

  function current() { var t = document.documentElement.getAttribute('data-theme'); return ORDER.indexOf(t) >= 0 ? t : 'auto'; }
  function isDark() {
    var th = current();
    return th === 'dark' || (th === 'auto' && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
  }
  function paint() {
    var th = current(), btn = document.getElementById('themeBtn');
    if (btn) {
      btn.querySelector('[data-theme-icon]').innerHTML = icon(ICON[th]);
      btn.querySelector('[data-theme-label]').textContent = BBI.t('th_' + th);
      btn.title = BBI.t('themeTitle') + ': ' + BBI.t('th_' + th);
    }
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', isDark() ? '#0f1115' : '#ffffff');
  }
  BB.setTheme = function (th) {
    if (ORDER.indexOf(th) < 0) th = 'auto';
    var root = document.documentElement;
    root.classList.add('theme-anim');
    root.setAttribute('data-theme', th);
    try { localStorage.setItem('bb-theme', th); } catch (e) { /* ок */ }
    paint();
    setTimeout(function () { root.classList.remove('theme-anim'); }, 350);
  };

  document.getElementById('themeBtn').addEventListener('click', function () {
    var next = ORDER[(ORDER.indexOf(current()) + 1) % ORDER.length];
    BB.setTheme(next);
    if (BB.toast) BB.toast(BBI.t('thToast_' + next));
  });
  if (window.matchMedia) {                                              // «Авто»: телефон сменил тему — подстраиваемся
    var mq = matchMedia('(prefers-color-scheme: dark)');
    (mq.addEventListener ? mq.addEventListener.bind(mq, 'change') : mq.addListener.bind(mq))(paint);
  }
  document.addEventListener('bb:lang', paint);
  document.addEventListener('DOMContentLoaded', paint);
  paint();
})();
