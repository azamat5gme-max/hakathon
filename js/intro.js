/* ================= ИНТРО: обычный сайт → глитч → HACKED → сайт =================
   Пропустить интро: кнопка «Пропустить», клавиша Esc или ссылка index.html?nointro */
(function () {
  var intro = document.getElementById('intro');
  var term = document.getElementById('hackTerm');
  var skipBtn = document.getElementById('introSkip');
  var timers = [], typer = null, finished = true;

  function issuesCount() {
    return (window.LOCATIONS || []).reduce(function (s, l) { return s + (l.issues || []).length; }, 0);
  }
  function lines() {
    return [
      { t: '> подключение к городскому порталу... OK' },
      { t: '> проверка: удобен ли город для всех людей...' },
      { t: '> найдено барьеров: ' + issuesCount() },
      { t: '> пандусы на входах: НЕ НАЙДЕНО', err: true },
      { t: '> доступ для колясок: ОТКАЗАНО', err: true },
      { t: '> вердикт: сайт ПЛОХОЙ — он забыл про людей', err: true },
      { t: '> взлом системы... ██████████ 100%' }
    ];
  }
  function at(ms, fn) { timers.push(setTimeout(fn, ms)); }
  function clearAll() { timers.forEach(clearTimeout); timers = []; clearInterval(typer); }

  // Печатает строки «как в терминале»
  function type(list, done) {
    term.innerHTML = '';
    var li = 0, ci = 0, cur = null;
    typer = setInterval(function () {
      if (li >= list.length) {
        clearInterval(typer);
        term.insertAdjacentHTML('beforeend', '<span class="cursor">&nbsp;</span>');
        done();
        return;
      }
      if (!cur) {
        cur = document.createElement('div');
        if (list[li].err) cur.className = 'err';
        term.appendChild(cur);
      }
      ci += 2;
      cur.textContent = list[li].t.slice(0, ci);
      if (ci >= list[li].t.length) { li++; ci = 0; cur = null; }
    }, 16);
  }

  function restartAnim(el) { if (!el) return; el.style.animation = 'none'; void el.offsetWidth; el.style.animation = ''; }

  function finish() {
    if (finished) return;
    finished = true;
    clearAll();
    intro.classList.add('is-out');
    document.body.classList.add('app-ready');
    document.dispatchEvent(new CustomEvent('bb:introdone'));
    at(1000, function () { intro.classList.add('is-done'); });
  }

  function play() {
    clearAll();
    finished = false;
    document.body.classList.remove('app-ready');
    document.dispatchEvent(new CustomEvent('bb:introstart'));
    intro.className = 'intro';
    term.innerHTML = '';
    restartAnim(intro.querySelector('.fake'));
    restartAnim(intro.querySelector('.fake__loader span'));

    at(4300, function () { intro.classList.add('is-alert'); });           // 1. обычный сайт… тревога
    at(5400, function () { intro.classList.add('is-glitch'); });          // 2. сайт ломается
    at(6500, function () {                                                 // 3. экран взлома
      intro.classList.remove('is-glitch');
      intro.classList.add('is-hacked');
      type(lines(), function () {
        at(300, function () {
          intro.classList.add('is-title');                                 // 4. HACKED + почему
          at(5200, finish);                                                // 5. открываем сайт
        });
      });
    });
  }

  skipBtn.addEventListener('click', finish);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !finished) finish();
  });

  window.BBIntro = { play: play, skip: finish };

  document.addEventListener('DOMContentLoaded', function () {
    if (/[?&]nointro\b/.test(location.search)) {
      finished = false;
      finish();
      intro.classList.add('is-done');
    } else {
      play();
    }
  });
})();
