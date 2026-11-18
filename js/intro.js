/* ================= ВЫБОР ЯЗЫКА → ИНТРО: обычный сайт → глитч → HACKED → сайт =================
   Пропустить всё: кнопка «Пропустить», клавиша Esc или ссылка index.html?nointro (язык: ?lang=ky / ru / en) */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var intro = $('intro'), term = $('hackTerm'), skipBtn = $('introSkip');
  var langScreen = $('langScreen'), langTitle = $('langTitle'), langBtns = $('langBtns');
  var timers = [], typer = null, finished = true, titleTimer = null, picking = false, waiting = false;
  var SUB = { ky: 'Сайт кыргыз тилинде', ru: 'Сайт на русском языке', en: 'Website in English' };

  function issuesCount() {
    return (window.LOCATIONS || []).reduce(function (s, l) {
      return s + (window.BB && BB.issues ? BB.issues(l) : BBI.T(l.issues) || []).length;   // и точки волонтёров, и метки жителей
    }, 0);
  }
  // Строки терминала из переводов; «!» в начале — красная строка
  function lines() {
    return BBI.raw('term').map(function (s) {
      var err = s.charAt(0) === '!';
      return { t: (err ? s.slice(1) : s).replace('{n}', issuesCount()), err: err };
    });
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
    waiting = false;
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
    waiting = true;                                                        // обычный сайт ждёт кнопку «Следующий слайд»
  }

  /* Взлом: кнопка «Следующий слайд ›» или клавиша H / Enter / пробел / → / PageDown (кликер для презентаций) */
  function hack() {
    if (!waiting || finished) return;
    waiting = false;
    intro.classList.add('is-alert');                                       // 1. тревога
    at(1100, function () { intro.classList.add('is-glitch'); });          // 2. сайт ломается
    at(2200, function () {                                                 // 3. экран взлома
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

  /* ---------- Экран выбора языка ---------- */
  function showLang(onPick) {
    picking = false;
    langBtns.innerHTML = '';
    LANGS.forEach(function (L, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'lang__btn' + (L.code === BBI.lang() ? ' is-current' : '');
      b.style.setProperty('--i', i);
      b.innerHTML = '<span class="lang__code">' + L.short + '</span><span><span class="lang__name">' + L.name +
        '</span><span class="lang__sub">' + SUB[L.code] + '</span></span>';
      b.addEventListener('click', function () { pick(L.code, b, onPick); });
      langBtns.appendChild(b);
    });
    langScreen.classList.remove('is-hidden', 'is-out');

    var k = 0;
    langTitle.textContent = LANGS[0].pick;
    clearInterval(titleTimer);
    titleTimer = setInterval(function () {                                  // заголовок по очереди на 3 языках
      k = (k + 1) % LANGS.length;
      langTitle.textContent = LANGS[k].pick;
      langTitle.classList.remove('is-swap'); void langTitle.offsetWidth; langTitle.classList.add('is-swap');
    }, 1700);
  }

  function pick(code, btn, onPick) {
    if (picking) return;
    picking = true;
    clearInterval(titleTimer);
    btn.classList.add('is-picked');
    BBI.set(code);
    at(250, function () {
      langScreen.classList.add('is-out');
      if (onPick) onPick(code);
    });
    setTimeout(function () { langScreen.classList.add('is-hidden'); }, 850);
  }

  var HACK_KEYS = ['h', 'H', 'р', 'Р', 'Enter', ' ', 'ArrowRight', 'PageDown'];
  skipBtn.addEventListener('click', finish);
  var hackBtn = document.getElementById('introHack');
  if (hackBtn) hackBtn.addEventListener('click', hack);
  document.addEventListener('keydown', function (e) {
    if (finished) return;
    if (e.key === 'Escape') { finish(); return; }
    var langOpen = !langScreen.classList.contains('is-hidden') && !langScreen.classList.contains('is-out');
    if (waiting && !langOpen && HACK_KEYS.indexOf(e.key) >= 0) { e.preventDefault(); hack(); }
  });

  window.BBIntro = { play: play, hack: hack, skip: finish, chooseLang: function () { showLang(null); } };

  document.addEventListener('DOMContentLoaded', function () {
    if (/[?&]nointro\b/.test(location.search)) {
      langScreen.classList.add('is-hidden');
      finished = false;
      finish();
      intro.classList.add('is-done');
    } else {
      showLang(function () { play(); });
    }
  });
})();
