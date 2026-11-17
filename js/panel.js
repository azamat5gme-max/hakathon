/* ================= КАРТОЧКА МЕСТА + ОТЗЫВЫ ЖИТЕЛЕЙ ================= */
(function () {
  var C = window.CATEGORIES, G = window.GROUPS, S = window.STATUS, CT = window.COMMENT_TYPES;
  var BB = window.BB, esc = BB.esc, t = BBI.t, T = BBI.T;
  var panel = document.getElementById('panel'), content = document.getElementById('panelContent');
  var current = null, n = 0;

  function colorFor(name) {
    var h = 0; for (var i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
    return 'hsl(' + h + ' 80% 72%)';
  }
  function fmtDate(d) {
    var dt = new Date(String(d).length === 10 ? d + 'T12:00:00' : d);
    if (isNaN(dt)) return String(d);
    var months = BBI.raw('months');                 // для кыргызского — свои названия месяцев: «10-ноябрь»
    if (Array.isArray(months)) return dt.getDate() + '-' + months[dt.getMonth()];
    try { return dt.toLocaleDateString(t('dateLocale'), { day: 'numeric', month: 'long' }); }
    catch (e) { return dt.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }); }
  }
  function blk(html) { return '<div class="rv" style="--i:' + (n++) + '">' + html + '</div>'; }
  function li(s) { return '<li>' + esc(s) + '</li>'; }

  function commentHTML(c, isNew) {
    var type = CT[c.type] ? c.type : 'experience';
    return '<div class="cmt' + (isNew ? ' is-new' : '') + '">' +
      '<div class="cmt__head"><span class="ava" style="--c:' + colorFor(c.name) + '">' + esc(c.name.charAt(0).toUpperCase()) + '</span>' +
      '<span class="cmt__name">' + esc(c.name) + '</span><span class="cmt__date">' + esc(fmtDate(c.date)) + '</span></div>' +
      '<span class="cmt__type cmt__type--' + type + '">' + esc(T(CT[type])) + '</span>' +
      '<div class="cmt__text">' + esc(c.text) + '</div></div>';
  }

  function formHTML() {
    var savedName = '';
    try { savedName = localStorage.getItem('bb-name') || ''; } catch (e) { /* нет доступа — не страшно */ }
    var types = Object.keys(CT).map(function (k, i) {
      var icon = { experience: '💬', change: '✅', problem: '⚠️' }[k] || '•';
      return '<label><input type="radio" name="ctype" value="' + k + '"' + (i === 0 ? ' checked' : '') + '><span>' + icon + ' ' + esc(T(CT[k])) + '</span></label>';
    }).join('');
    return '<form class="cform" id="cform">' +
      '<input id="cName" maxlength="40" placeholder="' + esc(t('yourName')) + '" value="' + esc(savedName) + '" required>' +
      '<div class="ctypes">' + types + '</div>' +
      '<textarea id="cText" maxlength="600" placeholder="' + esc(t('reviewPh')) + '" required></textarea>' +
      '<button type="submit">' + esc(t('sendReview')) + '</button>' +
      '<div class="cform__note">' + esc(t('demoNote')) + '</div>' +
      '</form>';
  }

  BB.renderPanel = function (loc) {
    var sameCard = current === loc;
    var draft = sameCard && document.getElementById('cText') ? document.getElementById('cText').value : '';
    current = loc; n = 0;
    var st = loc.status, color = S[st].color, ll = BB_latlng(loc), comments = BB.comments(loc);
    var lat = ll[0].toFixed(6), lng = ll[1].toFixed(6), title = T(loc.title), issues = BB.issues(loc), good = BB.good(loc);
    var photo = loc.photo
      ? '<img src="' + esc(loc.photo) + '" alt="' + esc(title) + '">'
      : '<div class="ph__placeholder"><div><div class="ph__big">' + C[loc.category].icon + '</div><div class="ph__hint">' + esc(t('photoSoon')) + '</div></div></div>';
    var affects = loc.affects.length
      ? loc.affects.map(function (g) { return '<span>' + G[g].icon + ' ' + esc(T(G[g].label)) + '</span>'; }).join('')
      : '<span>' + esc(t('accessibleAll')) + '</span>';

    content.innerHTML =
      '<div class="ph" style="--c:' + color + '">' + photo +
        '<span class="ph__status" style="--c:' + color + '">' + esc(T(S[st].label)) + '</span></div>' +
      '<div class="pbody">' +
        blk('<h2>' + esc(title) + '</h2><div class="addr">' + (T(loc.address) ? '<span>📍 ' + esc(T(loc.address)) + '</span>' : '') +
          '<a href="https://www.openstreetmap.org/?mlat=' + lat + '&mlon=' + lng + '#map=18/' + lat + '/' + lng + '" target="_blank" rel="noopener">' + esc(t('openMaps')) + '</a></div>') +
        blk('<div class="tags">' + (loc.user ? '<span class="tag tag--user">' + esc(t('userBadge')) + '</span>' : '') +
          '<span class="tag">' + C[loc.category].icon + ' ' + esc(T(C[loc.category].label)) + '</span>' +
          '<span class="tag">🗓 ' + esc(t('checked', { d: fmtDate(loc.checked) })) + '</span>' +
          (loc.user ? '<span class="tag">✍️ ' + esc(t('reportedBy', { name: loc.author || t('anon') })) + '</span>' : '') +
          (loc.user && loc.review === 'approved' ? '<span class="tag tag--ok">' + esc(t('approvedBy', { n: (loc.confirms || []).length })) +
            ' · ' + esc(t(loc.ai && loc.ai.by === 'ai' ? 'aiBy' : 'rulesBy')) + '</span>' : '') + '</div>') +
        (issues.length ? blk('<div class="ptitle">' + esc(t('wrong')) + '</div><ul class="issues">' + issues.map(li).join('') + '</ul>') : '') +
        (good.length ? blk('<div class="ptitle">' + esc(t('goodTitle')) + '</div><ul class="issues issues--ok">' + good.map(li).join('') + '</ul>') : '') +
        blk('<div class="ptitle">' + esc(t('barrierFor')) + '</div><div class="affects">' + affects + '</div>') +
        (loc.tip ? blk('<div class="ptitle">' + esc(t('tip')) + '</div><div class="tip">💡 ' + esc(T(loc.tip)) + '</div>') : '') +
        blk('<div class="ptitle">' + esc(t('reviews')) + ' · <span id="cmtCount">' + comments.length + '</span></div>' +
          '<div class="cmts" id="cmtList">' + (comments.length
            ? comments.map(function (c) { return commentHTML(c); }).join('')
            : '<div class="cmt-empty">' + esc(t('noReviews')) + '</div>') + '</div>' + formHTML()) +
      '</div>';

    if (draft) document.getElementById('cText').value = draft;
    if (!sameCard) content.scrollTop = 0;
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
  };

  BB.hidePanel = function () {
    current = null;
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
  };

  content.addEventListener('submit', function (e) {
    if (e.target.id !== 'cform' || !current) return;
    e.preventDefault();
    var nameEl = document.getElementById('cName'), textEl = document.getElementById('cText');
    var typeEl = e.target.querySelector('input[name="ctype"]:checked');
    var name = nameEl.value.trim(), text = textEl.value.trim();
    if (!name || !text) { BB.toast(t('fillForm')); return; }

    var c = { name: name, type: typeEl ? typeEl.value : 'experience', text: text, date: new Date().toISOString().slice(0, 10) };
    BB.addComment(current, c);
    try { localStorage.setItem('bb-name', name); } catch (err) { /* ок */ }

    var list = document.getElementById('cmtList'), empty = list.querySelector('.cmt-empty');
    if (empty) empty.remove();
    list.insertAdjacentHTML('beforeend', commentHTML(c, true));
    document.getElementById('cmtCount').textContent = BB.comments(current).length;
    textEl.value = '';
    list.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'center' });
    BB.toast(t('thanksToast'));
  });

  document.getElementById('panelClose').addEventListener('click', function () { BB.closePlace(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && current && document.body.classList.contains('app-ready')) BB.closePlace();
  });
  BB.map.on('click', function () { if (current) BB.closePlace(); });
})();
