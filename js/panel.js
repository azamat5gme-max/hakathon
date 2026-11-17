/* ================= КАРТОЧКА МЕСТА + ОТЗЫВЫ ЖИТЕЛЕЙ ================= */
(function () {
  var C = window.CATEGORIES, G = window.GROUPS, S = window.STATUS, CT = window.COMMENT_TYPES;
  var BB = window.BB, esc = BB.esc;
  var panel = document.getElementById('panel'), content = document.getElementById('panelContent');
  var current = null, n = 0;

  function colorFor(name) {
    var h = 0; for (var i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
    return 'hsl(' + h + ' 80% 72%)';
  }
  function fmtDate(d) {
    var dt = new Date(String(d).length === 10 ? d + 'T12:00:00' : d);
    return isNaN(dt) ? String(d) : dt.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  }
  function blk(html) { return '<div class="rv" style="--i:' + (n++) + '">' + html + '</div>'; }
  function li(t) { return '<li>' + esc(t) + '</li>'; }

  function commentHTML(c, isNew) {
    var t = CT[c.type] ? c.type : 'experience';
    return '<div class="cmt' + (isNew ? ' is-new' : '') + '">' +
      '<div class="cmt__head"><span class="ava" style="--c:' + colorFor(c.name) + '">' + esc(c.name.charAt(0).toUpperCase()) + '</span>' +
      '<span class="cmt__name">' + esc(c.name) + '</span><span class="cmt__date">' + esc(fmtDate(c.date)) + '</span></div>' +
      '<span class="cmt__type cmt__type--' + t + '">' + esc(CT[t]) + '</span>' +
      '<div class="cmt__text">' + esc(c.text) + '</div></div>';
  }

  function formHTML() {
    var saved = '';
    try { saved = localStorage.getItem('bb-name') || ''; } catch (e) { /* нет доступа — не страшно */ }
    var types = Object.keys(CT).map(function (k, i) {
      var icon = { experience: '💬', change: '✅', problem: '⚠️' }[k] || '•';
      return '<label><input type="radio" name="ctype" value="' + k + '"' + (i === 0 ? ' checked' : '') + '><span>' + icon + ' ' + CT[k] + '</span></label>';
    }).join('');
    return '<form class="cform" id="cform">' +
      '<input id="cName" maxlength="40" placeholder="Ваше имя" value="' + esc(saved) + '" required>' +
      '<div class="ctypes">' + types + '</div>' +
      '<textarea id="cText" maxlength="600" placeholder="Расскажите: что удобно, что мешает, что изменилось…" required></textarea>' +
      '<button type="submit">Отправить отзыв</button>' +
      '<div class="cform__note">Демо-версия: отзывы сохраняются в этом браузере.</div>' +
      '</form>';
  }

  BB.renderPanel = function (loc) {
    current = loc; n = 0;
    var st = loc.status, color = S[st].color, ll = BB_latlng(loc), comments = BB.comments(loc);
    var lat = ll[0].toFixed(6), lng = ll[1].toFixed(6);
    var photo = loc.photo
      ? '<img src="' + esc(loc.photo) + '" alt="Фото: ' + esc(loc.title) + '">'
      : '<div class="ph__placeholder"><div><div class="ph__big">' + C[loc.category].icon + '</div><div class="ph__hint">📷 Фото появится после обхода</div></div></div>';
    var affects = loc.affects.length
      ? loc.affects.map(function (g) { return '<span>' + G[g].icon + ' ' + G[g].label + '</span>'; }).join('')
      : '<span>✅ Удобно для всех</span>';

    content.innerHTML =
      '<div class="ph" style="--c:' + color + '">' + photo +
        '<span class="ph__status" style="--c:' + color + '">' + S[st].label + '</span></div>' +
      '<div class="pbody">' +
        blk('<h2>' + esc(loc.title) + '</h2><div class="addr"><span>📍 ' + esc(loc.address) + '</span>' +
          '<a href="https://www.openstreetmap.org/?mlat=' + lat + '&mlon=' + lng + '#map=18/' + lat + '/' + lng + '" target="_blank" rel="noopener">Открыть в картах ↗</a></div>') +
        blk('<div class="tags"><span class="tag">' + C[loc.category].icon + ' ' + C[loc.category].label + '</span>' +
          '<span class="tag">🗓 Проверено: ' + esc(fmtDate(loc.checked)) + '</span></div>') +
        (loc.issues.length ? blk('<div class="ptitle">Что мешает</div><ul class="issues">' + loc.issues.map(li).join('') + '</ul>') : '') +
        (loc.good && loc.good.length ? blk('<div class="ptitle">Что хорошо</div><ul class="issues issues--ok">' + loc.good.map(li).join('') + '</ul>') : '') +
        blk('<div class="ptitle">Для кого барьер</div><div class="affects">' + affects + '</div>') +
        (loc.tip ? blk('<div class="ptitle">Совет</div><div class="tip">💡 ' + esc(loc.tip) + '</div>') : '') +
        blk('<div class="ptitle">Отзывы жителей · <span id="cmtCount">' + comments.length + '</span></div>' +
          '<div class="cmts" id="cmtList">' + (comments.length
            ? comments.map(function (c) { return commentHTML(c); }).join('')
            : '<div class="cmt-empty">Пока нет отзывов — будьте первым!</div>') + '</div>' + formHTML()) +
      '</div>';

    content.scrollTop = 0;
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
    if (!name || !text) { BB.toast('Напишите имя и текст отзыва'); return; }

    var c = { name: name, type: typeEl ? typeEl.value : 'experience', text: text, date: new Date().toISOString().slice(0, 10) };
    BB.addComment(current, c);
    try { localStorage.setItem('bb-name', name); } catch (err) { /* ок */ }

    var list = document.getElementById('cmtList'), empty = list.querySelector('.cmt-empty');
    if (empty) empty.remove();
    list.insertAdjacentHTML('beforeend', commentHTML(c, true));
    document.getElementById('cmtCount').textContent = BB.comments(current).length;
    textEl.value = '';
    list.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'center' });
    BB.toast('Спасибо! Отзыв добавлен 💚');
  });

  document.getElementById('panelClose').addEventListener('click', function () { BB.closePlace(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && current && document.body.classList.contains('app-ready')) BB.closePlace();
  });
  BB.map.on('click', function () { if (current) BB.closePlace(); });
})();
