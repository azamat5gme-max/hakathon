/* ================= СТАТИСТИКА СООБЩЕНИЙ по типам проблем =================
   Считает и точки волонтёров, и метки жителей. Нажатие на строку — показать эти места на карте. */
(function () {
  var BB = window.BB, t = BBI.t, T = BBI.T, esc = BB.esc;
  var P = window.PROBLEMS, G = window.GROUPS, LOC = window.LOCATIONS;
  var box = null;

  BB.stats = function () {
    var rows = {}, groups = {}, users = 0, barriers = 0;
    Object.keys(P).forEach(function (k) { rows[k] = { key: k, n: 0, v: 0, u: 0, ids: [] }; });
    Object.keys(G).forEach(function (g) { groups[g] = 0; });
    LOC.forEach(function (l) {
      var probs = BB.problems(l);
      if (l.user) users++;
      if (probs.length || l.status !== 'good') barriers++;
      probs.forEach(function (p) {
        var r = rows[p]; if (!r) return;
        r.n++; r.ids.push(l.id);
        if (l.user) r.u++; else r.v++;
      });
      if (l.status !== 'good') (l.affects || []).forEach(function (g) { if (groups[g] !== undefined) groups[g]++; });
    });
    var list = Object.keys(rows).map(function (k) { return rows[k]; }).sort(function (a, b) { return b.n - a.n; });
    return { total: LOC.length, users: users, vol: LOC.length - users, barriers: barriers, rows: list, groups: groups };
  };

  function countUp(el, to, delay) {
    setTimeout(function () {
      var t0 = performance.now();
      (function step(now) {
        var k = Math.min(1, (now - t0) / 900);
        el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(step);
      })(t0);
    }, delay);
  }

  function render() {
    var s = BB.stats(), max = Math.max(1, s.rows[0] ? s.rows[0].n : 1);
    var maxG = Math.max(1, Math.max.apply(null, Object.keys(s.groups).map(function (g) { return s.groups[g]; })));
    box.querySelector('.spanel__box').innerHTML =
      '<button class="spanel__close" type="button" aria-label="Close">' + icon('x') + '</button>' +
      '<h2>' + icon('chart-bar') + esc(t('statsTitle')) + '</h2>' +
      '<div class="spanel__nums">' +
        '<div><b data-to="' + s.total + '">0</b><span>' + esc(t('statTotal')) + '</span></div>' +
        '<div class="is-user"><b data-to="' + s.users + '">0</b><span>' + esc(t('statUsers')) + '</span></div>' +
        '<div><b data-to="' + s.vol + '">0</b><span>' + esc(t('statVol')) + '</span></div>' +
      '</div>' +
      (BB.pendingCount && BB.pendingCount() ? '<p class="spanel__pending">' + icon('hourglass') + esc(t('statPending')) + ': ' + BB.pendingCount() + '</p>' : '') +
      '<div class="ptitle">' + esc(t('byProblem')) + '</div><p class="spanel__hint">' + esc(t('statsHint')) + '</p>' +
      '<div class="spanel__rows">' + s.rows.map(function (r, i) {
        return '<button type="button" class="srow' + (r.n ? '' : ' is-zero') + '" data-p="' + r.key + '" style="--i:' + i + ';--w:' + Math.round(r.n / max * 100) + '%">' +
          '<span class="srow__label">' + icon(P[r.key].icon) + esc(T(P[r.key].label)) + '</span>' +
          '<span class="srow__bar"><i></i>' + (r.u ? '<em style="--u:' + Math.round(r.u / max * 100) + '%"></em>' : '') + '</span>' +
          '<b>' + r.n + '</b></button>';
      }).join('') + '</div>' +
      '<div class="ptitle">' + esc(t('byGroup')) + '</div>' +
      '<div class="spanel__groups">' + Object.keys(G).map(function (g, i) {
        return '<div class="sgroup" style="--i:' + i + ';--w:' + Math.round(s.groups[g] / maxG * 100) + '%">' +
          '<span class="srow__label">' + icon(G[g].icon) + esc(T(G[g].label)) + '</span><span class="srow__bar"><i></i></span><b>' + s.groups[g] + '</b></div>';
      }).join('') + '</div>';
    box.querySelectorAll('.spanel__nums b').forEach(function (b, i) { countUp(b, +b.getAttribute('data-to'), 250 + i * 120); });
  }

  function open() {
    if (!box) {
      box = document.createElement('div');
      box.className = 'spanel';
      box.innerHTML = '<div class="spanel__backdrop"></div><section class="spanel__box" role="dialog" aria-modal="true"></section>';
      document.getElementById('app').appendChild(box);
      box.addEventListener('click', function (e) {
        if (e.target.closest('.spanel__close') || e.target.classList.contains('spanel__backdrop')) { close(); return; }
        var row = e.target.closest('.srow');
        if (row && !row.classList.contains('is-zero')) { close(); BB.closePlace(); BB.setProblem(row.getAttribute('data-p')); }
      });
    }
    render();
    box.classList.remove('is-open'); void box.offsetWidth; box.classList.add('is-open');
  }
  function close() { if (box) box.classList.remove('is-open'); }
  BB.openStats = open;

  document.getElementById('statsBtn').addEventListener('click', open);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  document.addEventListener('bb:introstart', close);
  document.addEventListener('bb:lang', function () { if (box && box.classList.contains('is-open')) render(); });
  document.addEventListener('bb:places', function () { if (box && box.classList.contains('is-open')) render(); });
})();
