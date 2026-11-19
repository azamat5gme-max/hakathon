/* ================= НАГРАДЫ: очки, уровни, значки, задание дня, серия, рейтинг, сертификат =================
   Очки приходят событием 'bb:action' ({type: 'report'|'confirm'|'comment'|'approved', id, photo}).
   Личный прогресс хранится в браузере; рейтинг «Топ жителей» считается из общих данных (Firebase / сервер). */
(function () {
  var BB = window.BB, t = BBI.t, esc = BB.esc;
  var $ = function (id) { return document.getElementById(id); };
  var KEY = 'bb-activity-v1';
  var POINTS = { report: 10, photo: 5, approved: 25, confirm: 5, comment: 3 };
  var MISSION_XP = 15, CERT_LEVEL = 2;
  var LEVELS = [
    { xp: 0, icon: 'map-pin' }, { xp: 30, icon: 'eye' }, { xp: 100, icon: 'heart-handshake' },
    { xp: 250, icon: 'award' }, { xp: 500, icon: 'medal' }, { xp: 1000, icon: 'crown' }
  ];
  var BADGES = [
    { id: 'first', icon: 'map-pin-plus', ok: function (s) { return s.report >= 1; } },
    { id: 'rep5', icon: 'route', ok: function (s) { return s.report >= 5; } },
    { id: 'rep20', icon: 'map-2', ok: function (s) { return s.report >= 20; } },
    { id: 'photo3', icon: 'camera-check', ok: function (s) { return s.photo >= 3; } },
    { id: 'conf5', icon: 'checks', ok: function (s) { return s.confirm >= 5; } },
    { id: 'approved', icon: 'shield-check', ok: function (s) { return s.approved >= 1; } },
    { id: 'voice10', icon: 'message-circle', ok: function (s) { return s.comment >= 10; } },
    { id: 'streak3', icon: 'flame', ok: function (s) { return s.bestStreak >= 3; } },
    { id: 'streak7', icon: 'calendar-check', ok: function (s) { return s.bestStreak >= 7; } }
  ];
  var MISSIONS = [
    { id: 'confirm1', type: 'confirm', n: 1 }, { id: 'photo1', type: 'photo', n: 1 }, { id: 'comment1', type: 'comment', n: 1 },
    { id: 'report1', type: 'report', n: 1 }, { id: 'confirm2', type: 'confirm', n: 2 }
  ];

  /* ---------- Журнал действий ---------- */
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function today() { var d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function dayNum(s) { var p = s.split('-'); return Math.round(Date.UTC(+p[0], p[1] - 1, +p[2]) / 864e5); }
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || '[]') || []; } catch (e) { return []; } }
  function save(log) { try { localStorage.setItem(KEY, JSON.stringify(log.slice(-800))); } catch (e) { /* ок */ } }
  function getName() { try { return localStorage.getItem('bb-name') || ''; } catch (e) { return ''; } }
  function setName(v) { try { localStorage.setItem('bb-name', v.trim()); } catch (e) { /* ок */ } }

  function summarize(log) {
    var s = { xp: 0, report: 0, photo: 0, approved: 0, confirm: 0, comment: 0, streak: 0, bestStreak: 0 }, days = {};
    log.forEach(function (e) {
      s.xp += e.xp || 0;
      if (POINTS[e.type]) s[e.type]++;
      if (POINTS[e.type]) days[e.day] = true;
    });
    var list = Object.keys(days).map(dayNum).sort(function (a, b) { return a - b; }), run = 0, prev = null;
    list.forEach(function (d) { run = prev !== null && d === prev + 1 ? run + 1 : 1; s.bestStreak = Math.max(s.bestStreak, run); prev = d; });
    var tn = dayNum(today());
    s.streak = list.length && list[list.length - 1] >= tn - 1 ? run : 0;
    return s;
  }
  function levelOf(xp) { var i = 0; LEVELS.forEach(function (l, k) { if (xp >= l.xp) i = k; }); return i; }
  function mission() { return MISSIONS[dayNum(today()) % MISSIONS.length]; }
  function missionProgress(log, m) { var d = today(); return log.filter(function (e) { return e.day === d && e.type === m.type; }).length; }
  function missionDone(log) { var d = today(); return log.some(function (e) { return e.type === 'mission' && e.day === d; }); }

  /* Очередь уведомлений — чтобы они не перебивали друг друга */
  var queue = [], busy = false;
  function notify(msg, delay) { setTimeout(function () { queue.push(msg); pump(); }, delay || 0); }
  function pump() {
    if (busy || !queue.length) return;
    busy = true; BB.toast(queue.shift());
    setTimeout(function () { busy = false; pump(); }, 2500);
  }

  /* ---------- Начисление очков ---------- */
  function record(d) {
    var type = d.type, id = d.id || '';
    if (!POINTS[type]) return;
    var log = load();
    if (id && type !== 'comment' && log.some(function (e) { return e.type === type && e.id === id; })) return;   // без двойного счёта
    var before = summarize(log), day = today(), gained = 0;
    var firstToday = !log.some(function (e) { return e.day === day && POINTS[e.type]; });
    log.push({ type: type, id: id, day: day, xp: POINTS[type] }); gained += POINTS[type];
    if (type === 'report' && d.photo) { log.push({ type: 'photo', id: id, day: day, xp: POINTS.photo }); gained += POINTS.photo; }
    if (firstToday) {                                                    // серия: каждый день подряд — бонус
      var st = summarize(log).streak;
      if (st >= 2) { var bonus = Math.min(25, 5 * (st - 1)); log.push({ type: 'streak', day: day, xp: bonus }); gained += bonus; }
    }
    var m = mission();
    if (!missionDone(log) && missionProgress(log, m) >= m.n) {
      log.push({ type: 'mission', id: m.id, day: day, xp: MISSION_XP }); gained += MISSION_XP;
      notify(t('missionToast', { n: MISSION_XP }), 2400);
    }
    save(log);
    var after = summarize(log), l0 = levelOf(before.xp), l1 = levelOf(after.xp);
    floatXp(gained);
    updateButton(true);
    if (l1 > l0) { notify(t('levelToast', { lvl: t('lvl' + l1) }), 2400); if (BB.celebrate) setTimeout(BB.celebrate, 2400); }
    BADGES.forEach(function (b) { if (!b.ok(before) && b.ok(after)) notify(t('badgeToast', { name: t('b_' + b.id) }), 2400); });
    if (box && box.classList.contains('is-open')) render();
  }
  document.addEventListener('bb:action', function (e) { record(e.detail || {}); });

  function floatXp(n) {
    var b = $('rewardsBtn'); if (!b || !n) return;
    var r = b.getBoundingClientRect(), el = document.createElement('div');
    el.className = 'xp-float'; el.textContent = '+' + n + ' XP';
    el.style.left = (r.left + r.width / 2) + 'px'; el.style.top = (r.bottom + 6) + 'px';
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 1600);
  }
  function updateButton(bump) {
    var s = summarize(load()), st = $('streakLabel'), b = $('rewardsBtn');
    $('xpLabel').textContent = s.xp + ' XP';
    if (s.streak >= 2) { st.hidden = false; st.innerHTML = icon('flame') + s.streak; } else st.hidden = true;
    b.title = t('lvl' + levelOf(s.xp));
    if (bump) { b.classList.remove('is-bump'); void b.offsetWidth; b.classList.add('is-bump'); }
  }

  /* ---------- Окно «Мой вклад» ---------- */
  var box = null, topHtml = '';
  function render() {
    var log = load(), s = summarize(log), li = levelOf(s.xp), cur = LEVELS[li], next = LEVELS[li + 1];
    var pct = next ? Math.round((s.xp - cur.xp) / (next.xp - cur.xp) * 100) : 100;
    var m = mission(), done = missionDone(log), prog = Math.min(m.n, missionProgress(log, m));
    var nOn = 0, certOk = li >= CERT_LEVEL;
    var badges = BADGES.map(function (b, i) {
      var on = b.ok(s); if (on) nOn++;
      return '<div class="rw-badge' + (on ? ' is-on' : '') + '" style="--i:' + i + '"><span class="rw-badge__icon">' + icon(on ? b.icon : 'lock') + '</span>' +
        '<b>' + esc(t('b_' + b.id)) + '</b><small>' + esc(t('b_' + b.id + '_d')) + '</small></div>';
    }).join('');
    var rules = [['map-pin-plus', 'r_report', 10], ['camera', 'r_photo', 5], ['shield-check', 'r_approved', 25], ['checks', 'r_confirm', 5],
      ['message', 'r_comment', 3], ['target', 'r_mission', MISSION_XP], ['flame', 'r_streak', 5]]
      .map(function (r) { return '<li>' + icon(r[0]) + '<span>' + esc(t(r[1])) + '</span><b>+' + r[2] + '</b></li>'; }).join('');
    box.querySelector('.spanel__box').innerHTML =
      '<button class="spanel__close" type="button" aria-label="Close">' + icon('x') + '</button>' +
      '<h2>' + icon('trophy') + esc(t('rwTitle')) + '</h2>' +
      '<div class="rw-level"><span class="rw-level__icon">' + icon(cur.icon) + '</span><div class="rw-level__text"><b>' + esc(t('lvl' + li)) + '</b>' +
        '<small>' + s.xp + ' XP · ' + esc(next ? t('xpToNext', { lvl: t('lvl' + (li + 1)), n: next.xp - s.xp }) : t('maxLevel')) + '</small></div>' +
        (s.streak >= 1 ? '<span class="rw-streak">' + icon('flame') + esc(t('streakN', { n: s.streak })) + '</span>' : '') + '</div>' +
      '<div class="rw-bar"><i style="--w:' + pct + '%"></i></div>' +
      '<label class="rw-name"><span>' + esc(t('nameLabel')) + '</span><input id="rwName" maxlength="40" placeholder="' + esc(t('namePh2')) + '" value="' + esc(getName()) + '"></label>' +
      '<div class="ptitle">' + esc(t('missionTitle')) + '</div>' +
      '<div class="rw-mission' + (done ? ' is-done' : '') + '"><span class="rw-mission__icon">' + icon(done ? 'circle-check' : 'target') + '</span>' +
        '<div><b>' + esc(t('m_' + m.id)) + '</b><small>' + (done ? esc(t('missionDone')) : prog + ' / ' + m.n) + ' · +' + MISSION_XP + ' XP</small></div></div>' +
      '<div class="ptitle">' + esc(t('badgesTitle')) + ' · ' + nOn + '/' + BADGES.length + '</div><div class="rw-badges">' + badges + '</div>' +
      '<div class="ptitle">' + esc(t('topTitle')) + '</div><div class="rw-top" id="rwTop">' + (topHtml || '<div class="rw-muted">…</div>') + '</div>' +
      '<div class="ptitle">' + esc(t('rulesTitle')) + '</div><ul class="rw-rules">' + rules + '</ul>' +
      '<div class="ptitle">' + esc(t('certTitle')) + '</div><div class="rw-cert"><span class="rw-cert__icon">' + icon(certOk ? 'certificate' : 'lock') + '</span>' +
        '<small>' + esc(certOk ? t('certReady') : t('certLocked', { lvl: t('lvl' + CERT_LEVEL), xp: LEVELS[CERT_LEVEL].xp })) + '</small>' +
        '<button type="button" class="btn-primary" id="certBtn"' + (certOk ? '' : ' disabled') + '>' + icon('download') + esc(t('certBtn')) + '</button></div>';
  }
  function open() {
    if (!box) {
      box = document.createElement('div');
      box.className = 'spanel rpanel';
      box.innerHTML = '<div class="spanel__backdrop"></div><section class="spanel__box" role="dialog" aria-modal="true"></section>';
      $('app').appendChild(box);
      box.addEventListener('click', function (e) {
        if (e.target.closest('.spanel__close') || e.target.classList.contains('spanel__backdrop')) close();
        else if (e.target.closest('#certBtn')) downloadCert();
      });
      box.addEventListener('change', function (e) { if (e.target.id === 'rwName') { setName(e.target.value); loadTop(); } });
    }
    render();
    box.classList.remove('is-open'); void box.offsetWidth; box.classList.add('is-open');
    loadTop();
  }
  function close() { if (box) box.classList.remove('is-open'); }

  /* ---------- Топ жителей (из общих данных — их нельзя «накрутить» в браузере) ---------- */
  function loadTop() {
    var get;
    if (BB.cloud) {
      var db = BB.cloud.db;
      get = Promise.all([db.collection('reports').get(), db.collection('comments').get()]).then(function (r) {
        return { reports: r[0].docs.map(function (d) { return d.data(); }), comments: r[1].docs.map(function (d) { return d.data(); }) };
      });
    } else if (location.protocol.indexOf('http') === 0) {
      get = fetch('/api/reports').then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (d) { return { reports: d.reports || [], comments: [] }; });
    } else get = Promise.reject(new Error('offline'));
    get.then(function (data) { topHtml = topList(data); paintTop(); })
      .catch(function () { topHtml = '<div class="rw-muted">' + esc(t('topOffline')) + '</div>'; paintTop(); });
  }
  function paintTop() { var el = $('rwTop'); if (el) el.innerHTML = topHtml; }
  function topList(data) {
    var users = {}, me = getName();
    function u(id) { return users[id] = users[id] || { id: id, xp: 0, name: '' }; }
    data.reports.forEach(function (r) {
      if (r.uid) {
        var a = u(r.uid);
        a.xp += POINTS.report + (r.photo ? POINTS.photo : 0) + (r.review === 'approved' ? POINTS.approved : 0);
        if (r.author) a.name = r.author;
      }
      (r.confirms || []).forEach(function (c) { u(c).xp += POINTS.confirm; });
    });
    data.comments.forEach(function (c) { if (c.uid) { var a = u(c.uid); a.xp += POINTS.comment; if (c.name && !a.name) a.name = c.name; } });
    var list = Object.keys(users).map(function (k) { return users[k]; }).sort(function (a, b) { return b.xp - a.xp; }).slice(0, 10);
    if (!list.length) return '<div class="rw-muted">' + esc(t('topEmpty')) + '</div>';
    return '<ol>' + list.map(function (x, i) {
      var mine = x.id === BB.uid, nm = (mine && me) || x.name || t('resident') + ' #' + x.id.slice(0, 4).toUpperCase();
      return '<li' + (mine ? ' class="is-me"' : '') + '><span class="rw-rank">' + (i + 1) + '</span>' +
        '<span class="rw-who">' + esc(nm) + (mine ? ' <em>' + esc(t('you')) + '</em>' : '') + '</span>' +
        '<span class="rw-lvl" title="' + esc(t('lvl' + levelOf(x.xp))) + '">' + icon(LEVELS[levelOf(x.xp)].icon) + '</span><b>' + x.xp + ' XP</b></li>';
    }).join('') + '</ol>';
  }

  /* ---------- Сертификат волонтёра (картинка PNG) ---------- */
  function wrap(g, text, x, y, maxW, lineH) {
    var words = text.split(' '), line = '';
    words.forEach(function (w) {
      var test = line ? line + ' ' + w : w;
      if (g.measureText(test).width > maxW && line) { g.fillText(line, x, y); y += lineH; line = w; } else line = test;
    });
    if (line) g.fillText(line, x, y);
  }
  function downloadCert() {
    var name = getName().trim();
    if (!name) { BB.toast(t('certNeedName')); var inp = $('rwName'); if (inp) inp.focus(); return; }
    var s = summarize(load()), li = levelOf(s.xp), W = 1600, H = 1130;
    var c = document.createElement('canvas'), g = c.getContext('2d'), F = '"Inter", system-ui, sans-serif';
    c.width = W; c.height = H;
    var logo = new Image();
    logo.onload = function () {
      g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, H);
      g.strokeStyle = '#1d4ed8'; g.lineWidth = 6; g.strokeRect(40, 40, W - 80, H - 80);
      g.strokeStyle = '#c7d6fe'; g.lineWidth = 2; g.strokeRect(58, 58, W - 116, H - 116);
      g.fillStyle = '#1d4ed8'; g.beginPath(); if (g.roundRect) g.roundRect(120, 120, 64, 64, 14); else g.rect(120, 120, 64, 64); g.fill();
      g.drawImage(logo, 132, 132, 40, 40);
      g.fillStyle = '#0f172a'; g.font = '700 34px ' + F; g.textBaseline = 'middle'; g.fillText('Infranalysis', 204, 152);
      g.textAlign = 'center'; g.textBaseline = 'alphabetic';
      g.fillStyle = '#1d4ed8'; g.font = '700 32px ' + F; if ('letterSpacing' in g) g.letterSpacing = '6px';
      g.fillText(t('certHead'), W / 2, 330); if ('letterSpacing' in g) g.letterSpacing = '0px';
      g.fillStyle = '#64748b'; g.font = '400 30px ' + F; g.fillText(t('certLine1'), W / 2, 420);
      g.fillStyle = '#0f172a'; g.font = '700 76px ' + F; g.fillText(name, W / 2, 520);
      g.strokeStyle = '#e5e7eb'; g.lineWidth = 2; g.beginPath(); g.moveTo(W / 2 - 380, 556); g.lineTo(W / 2 + 380, 556); g.stroke();
      g.fillStyle = '#334155'; g.font = '400 30px ' + F; wrap(g, t('certLine2'), W / 2, 628, 1120, 44);
      g.fillStyle = '#0f172a'; g.font = '600 26px ' + F;
      g.fillText(t('certStats', { r: s.report, c: s.confirm, m: s.comment, lvl: t('lvl' + li), xp: s.xp }), W / 2, 830);
      g.fillStyle = '#64748b'; g.font = '400 24px ' + F;
      g.fillText(t('certDate', { d: new Date().toLocaleDateString(t('dateLocale')) }), W / 2, 960);
      if (location.protocol.indexOf('http') === 0) g.fillText(location.host + location.pathname.replace(/index\.html$/, ''), W / 2, 1000);
      var a = document.createElement('a');
      a.download = 'infranalysis-certificate.png'; a.href = c.toDataURL('image/png');
      document.body.appendChild(a); a.click(); a.remove();
    };
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round">' + window.ICONS['map-2'] + '</svg>';
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function () {
      logo.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    });
  }

  /* ---------- Запуск ---------- */
  $('rewardsBtn').addEventListener('click', open);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  document.addEventListener('bb:introstart', close);
  document.addEventListener('bb:lang', function () { updateButton(false); if (box && box.classList.contains('is-open')) { render(); loadTop(); } });
  document.addEventListener('bb:introdone', function () {                // напоминание о задании дня — раз в день
    var log = load(), d = today(), seen = '';
    try { seen = localStorage.getItem('bb-mission-shown') || ''; } catch (e) { /* ок */ }
    if (!missionDone(log) && seen !== d) {
      notify(t('missionTitle') + ': ' + t('m_' + mission().id), 3000);
      try { localStorage.setItem('bb-mission-shown', d); } catch (e) { /* ок */ }
    }
  });
  updateButton(false);
})();
