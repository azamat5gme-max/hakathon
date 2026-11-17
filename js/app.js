/* ================= КАРТА, МЕТКИ, ФИЛЬТРЫ, СПИСОК ================= */
(function () {
  var CITY = window.CITY, C = window.CATEGORIES, G = window.GROUPS, S = window.STATUS, LOC = window.LOCATIONS;
  var BB = window.BB = window.BB || {};
  var t = BBI.t, T = BBI.T;
  var $ = function (id) { return document.getElementById(id); };
  var byId = {}; LOC.forEach(function (l) { byId[l.id] = l; });
  var markers = {}, firstList = true;
  var P = window.PROBLEMS || {};
  var state = { cats: new Set(Object.keys(C)), statuses: new Set(Object.keys(S)), group: null, problem: null, activeId: null };
  var isMobile = function () { return window.matchMedia('(max-width: 760px)').matches; };

  BB.byId = byId;
  BB.problems = function (loc) { return loc.problems || []; };
  /* Что мешает / что хорошо. У сообщений жителей — из выбранных типов проблем + их текста */
  BB.issues = function (loc) {
    if (!loc.user) return T(loc.issues) || [];
    return BB.problems(loc).map(function (p) { return P[p] ? T(P[p].label) : p; })
      .concat(loc.status !== 'good' && loc.text ? [loc.text] : []);
  };
  BB.good = function (loc) {
    if (!loc.user) return T(loc.good) || [];
    return loc.status === 'good' && loc.text ? [loc.text] : [];
  };
  BB.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  };

  /* ---------- Отзывы: примеры из data.js + новые (хранятся в браузере) ---------- */
  var KEY = 'bb-comments-v1', saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { saved = {}; }
  BB.comments = function (loc) { return (loc.comments || []).concat(saved[loc.id] || []); };
  BB.addComment = function (loc, c) {
    (saved[loc.id] = saved[loc.id] || []).push(c);
    try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (e) { /* приватный режим — просто не сохраняем */ }
    updateStats(false);
  };

  /* Статус точки с учётом выбранной группы людей:
     если барьер не мешает выбранной группе — для неё место «доступно» */
  BB.effStatus = function (loc, group) {
    var g = group === undefined ? state.group : group;
    if (!g) return loc.status;
    return loc.affects.indexOf(g) >= 0 ? loc.status : 'good';
  };

  /* ---------- Карта ---------- */
  var map = L.map('map', { zoomControl: false }).setView(CITY.center, CITY.zoom);
  L.control.zoom({ position: 'topright' }).addTo(map);
  // Бесплатные тайлы OpenStreetMap; тёмными их делает CSS-фильтр в style.css
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
  BB.map = map;

  function makeIcon(loc, delay, extra) {
    var st = BB.effStatus(loc);
    var cls = 'pin pin--' + st + (loc.user ? ' pin--user' : '') + (loc.id === state.activeId ? ' is-active' : '') + (extra ? ' ' + extra : '');
    var html = '<div class="' + cls + '" style="--c:' + S[st].color + ';--d:' + (delay || 0) + 's">' +
      '<span class="pin__pulse"></span><span class="pin__body"><span class="pin__icon">' + C[loc.category].icon + '</span></span>' +
      (loc.user ? '<span class="pin__user">👤</span>' : '') + '</div>';
    return L.divIcon({ className: 'pin-wrap', html: html, iconSize: [44, 54], iconAnchor: [22, 48], tooltipAnchor: [0, -46] });
  }
  function isVisible(loc) {
    return state.cats.has(loc.category) && state.statuses.has(BB.effStatus(loc)) &&
      (!state.problem || BB.problems(loc).indexOf(state.problem) >= 0);
  }

  function createMarker(loc, delay) {
    var m = markers[loc.id] = L.marker(BB_latlng(loc), { icon: makeIcon(loc, delay), riseOnHover: true });
    m.bindTooltip(BB.esc(T(loc.title)), { direction: 'top', className: 'pin-tip' });
    m.on('click', function () { BB.openPlace(loc.id); });
    return m;
  }

  /* Новая точка (сообщение жителя): на карту с анимацией, в список и счётчики */
  BB.addPlace = function (loc) {
    if (byId[loc.id]) return;
    byId[loc.id] = loc;
    if (LOC.indexOf(loc) < 0) LOC.push(loc);
    document.dispatchEvent(new CustomEvent('bb:places'));
    if (!document.body.classList.contains('app-ready') || markers[loc.id]) return; // иначе появится вместе со всеми
    var m = createMarker(loc, 0.1);
    m._bbHidden = !isVisible(loc);
    if (!m._bbHidden) m.addTo(map);
    renderList(); updateStats(false);
  };

  /* Фильтр «показать только места с этой проблемой» (из статистики и бота) */
  BB.setProblem = function (p) {
    state.problem = P[p] ? p : null;
    if (state.problem) { state.cats = new Set(Object.keys(C)); state.statuses = new Set(Object.keys(S)); }
    renderChips(); applyFilters();
    if (!state.problem) return;
    BB.toast(P[p].icon + ' ' + t('showing', { label: T(P[p].label) }));
    var pts = LOC.filter(isVisible).map(BB_latlng);
    if (pts.length) {
      var mob = isMobile();
      map.flyToBounds(pts, { paddingTopLeft: mob ? [30, 150] : [360, 110], paddingBottomRight: mob ? [30, 120] : [70, 70], maxZoom: 17, duration: 1 });
    }
  };

  function dropMarkers() {
    var i = 0;
    LOC.forEach(function (loc) {
      var delay = 0.45 + (i++) * 0.11, m = markers[loc.id];
      if (!m) {
        m = createMarker(loc, delay);
      } else {
        m.setIcon(makeIcon(loc, delay));
      }
      m._bbHidden = !isVisible(loc);
      if (m._bbHidden) map.removeLayer(m); else m.addTo(map);
    });
  }

  function applyFilters(repaint) {
    LOC.forEach(function (loc, i) {
      var m = markers[loc.id]; if (!m) return;
      var vis = isVisible(loc);
      if (vis && (m._bbHidden || repaint)) {
        m._bbHidden = false;
        m.setIcon(makeIcon(loc, i * 0.04, 'is-back'));
        m.addTo(map);
      } else if (!vis && !m._bbHidden) {
        m._bbHidden = true;
        var pin = m.getElement() && m.getElement().querySelector('.pin');
        if (pin) pin.classList.add('is-hidden');
        setTimeout(function () { if (m._bbHidden) map.removeLayer(m); }, 360);
      }
    });
    renderList();
  }

  /* ---------- Фильтры ---------- */
  function chip(label, pressed, onClick) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'chip'; b.innerHTML = label;
    b.setAttribute('aria-pressed', pressed ? 'true' : 'false');
    b.addEventListener('click', onClick);
    return b;
  }
  function renderChips() {
    var cat = $('catChips'), grp = $('groupChips'), leg = $('legend');
    cat.innerHTML = ''; grp.innerHTML = ''; leg.innerHTML = '';
    if (state.problem) {                                                   // активный фильтр по проблеме — с крестиком
      var pc = chip(P[state.problem].icon + ' ' + BB.esc(t('showing', { label: T(P[state.problem].label) })) + ' ✕', true,
        function () { BB.setProblem(null); });
      pc.classList.add('chip--problem');
      cat.appendChild(pc);
    }
    Object.keys(C).forEach(function (k) {
      cat.appendChild(chip(C[k].icon + ' ' + BB.esc(T(C[k].label)), state.cats.has(k), function () {
        state.cats.has(k) ? state.cats.delete(k) : state.cats.add(k);
        renderChips(); applyFilters();
      }));
    });
    grp.appendChild(chip('👥 ' + t('all'), !state.group, function () { setGroup(null); }));
    Object.keys(G).forEach(function (k) {
      grp.appendChild(chip(G[k].icon + ' ' + BB.esc(T(G[k].label)), state.group === k, function () { setGroup(state.group === k ? null : k); }));
    });
    Object.keys(S).forEach(function (k) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'legend__row';
      b.setAttribute('aria-pressed', state.statuses.has(k) ? 'true' : 'false');
      b.innerHTML = '<span class="dot" style="--c:' + S[k].color + '"></span>' + BB.esc(T(S[k].label));
      b.addEventListener('click', function () {
        state.statuses.has(k) ? state.statuses.delete(k) : state.statuses.add(k);
        renderChips(); applyFilters();
      });
      leg.appendChild(b);
    });
  }
  function setGroup(g) {
    state.group = g;
    renderChips(); applyFilters(true);
    if (g) BB.toast(G[g].icon + ' ' + t('groupToast', { g: T(G[g].label) }));
  }
  BB.setGroup = setGroup;

  /* ---------- Список точек ---------- */
  var ORDER = { bad: 0, mid: 1, good: 2 };
  function renderList() {
    var ul = $('placeList'), list = LOC.filter(isVisible).sort(function (a, b) {
      return ORDER[BB.effStatus(a)] - ORDER[BB.effStatus(b)];
    });
    $('listCount').textContent = list.length;
    ul.innerHTML = list.length ? '' : '<li class="plist__empty">' + t('empty') + '</li>';
    list.forEach(function (loc, i) {
      var st = BB.effStatus(loc), li = document.createElement('li'), n = BB.issues(loc).length;
      li.style.animationDelay = (firstList ? 500 + i * 45 : i * 30) + 'ms';
      if (loc.id === state.activeId) li.className = 'is-active';
      li.dataset.id = loc.id;
      li.innerHTML = '<span class="plist__icon">' + C[loc.category].icon + '</span>' +
        '<span class="plist__text"><div class="plist__title">' + BB.esc(T(loc.title)) + '</div>' +
        '<div class="plist__meta"><span class="dot" style="--c:' + S[st].color + ';display:inline-block;width:8px;height:8px;margin-right:5px"></span>' +
        BB.esc(T(S[st].label)) + (n ? ' · ' + t('problemsN', { n: n }) : '') + '</div></span>';
      li.addEventListener('click', function () { BB.openPlace(loc.id); });
      ul.appendChild(li);
    });
    firstList = false;
  }

  /* ---------- Открыть / закрыть место ---------- */
  function setActive(id) {
    var prev = state.activeId && markers[state.activeId];
    if (prev && prev.getElement()) { prev.getElement().querySelector('.pin').classList.remove('is-active'); prev.setZIndexOffset(0); }
    state.activeId = id;
    var m = id && markers[id];
    if (m && m.getElement()) { m.getElement().querySelector('.pin').classList.add('is-active'); m.setZIndexOffset(1000); }
    document.querySelectorAll('#placeList li').forEach(function (li) { li.classList.toggle('is-active', li.dataset.id === id); });
  }
  function flyToPlace(loc) {
    var z = Math.max(map.getZoom(), 17), size = map.getSize(), dx = 0, dy = 0;
    if (isMobile()) dy = size.y / 2 - Math.max(150, size.y * 0.2);
    else dx = 50;
    var p = map.project(BB_latlng(loc), z).add([dx, dy]);
    map.flyTo(map.unproject(p, z), z, { duration: 1.1 });
  }
  BB.openPlace = function (id) {
    var loc = byId[id]; if (!loc) return;
    if (!isVisible(loc)) {
      state.cats.add(loc.category); state.statuses.add(BB.effStatus(loc));
      renderChips(); applyFilters();
    }
    setActive(id);
    flyToPlace(loc);
    $('side').classList.remove('is-open');
    if (BB.renderPanel) BB.renderPanel(loc);
    document.body.classList.add('panel-open');
  };
  BB.closePlace = function () {
    setActive(null);
    document.body.classList.remove('panel-open');
    if (BB.hidePanel) BB.hidePanel();
  };

  /* ---------- Счётчики ---------- */
  function countUp(el, to, animate) {
    if (!animate) { el.textContent = to; return; }
    var t0 = performance.now(), dur = 1400;
    (function step(now) {
      var k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(to * e);
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  }
  function updateStats(animate) {
    var issues = 0, comments = 0;
    LOC.forEach(function (l) { issues += BB.issues(l).length; comments += BB.comments(l).length; });
    countUp($('statPoints'), LOC.length, animate);
    countUp($('statIssues'), issues, animate);
    countUp($('statComments'), comments, animate);
  }

  /* ---------- Тост ---------- */
  var toastTimer;
  BB.toast = function (msg) {
    var el = $('toast'); el.textContent = msg; el.classList.add('is-on');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { el.classList.remove('is-on'); }, 2600);
  };

  /* ---------- Язык ---------- */
  function applyLang() {
    $('districtName').textContent = T(CITY.district) + ' · ' + T(CITY.name);
    var L = LANGS.filter(function (x) { return x.code === BBI.lang(); })[0];
    $('langBtn').textContent = '🌐 ' + (L ? L.short : 'RU');
    LOC.forEach(function (loc) { if (markers[loc.id]) markers[loc.id].setTooltipContent(BB.esc(T(loc.title))); });
    renderChips(); renderList();
    if (state.activeId && BB.renderPanel) BB.renderPanel(byId[state.activeId]);
  }
  document.addEventListener('bb:lang', applyLang);

  /* ---------- Запуск ---------- */
  $('sideToggle').addEventListener('click', function () { $('side').classList.toggle('is-open'); });
  $('replayIntro').addEventListener('click', function () { if (window.BBIntro) window.BBIntro.play(); });
  $('langBtn').addEventListener('click', function () { if (window.BBIntro) window.BBIntro.chooseLang(); });
  document.addEventListener('bb:introstart', function () { BB.closePlace(); });
  document.addEventListener('bb:introdone', function () {
    map.invalidateSize();
    firstList = true;
    renderChips(); renderList(); dropMarkers();
    setTimeout(function () { updateStats(true); }, 500);
  });
  applyLang();
})();
