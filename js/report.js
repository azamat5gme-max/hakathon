/* ================= СООБЩЕНИЯ ЖИТЕЛЕЙ: своя метка + фото + проверка =================
   1) Житель ставит метку → она «на проверке» ⏳ (полупрозрачная, не в статистике).
   2) Её подтверждают 2 ДРУГИХ человека (свою подтвердить нельзя, дважды — тоже).
   3) Потом ИИ проверяет сообщение → если одобрил, метка «выпрыгивает» на карту.
   Работает через `npm start` (общий сервер). Без сервера метка видна только автору (демо). */
(function () {
  var BB = window.BB, t = BBI.t, T = BBI.T, esc = BB.esc;
  var C = window.CATEGORIES, G = window.GROUPS, P = window.PROBLEMS;
  var map = BB.map, panel = document.getElementById('panel'), content = document.getElementById('panelContent');
  var $ = function (id) { return document.getElementById(id); };
  var KEY = 'bb-reports-v1', NEED = 2;
  var mode = 'local', cloud = null;          // 'local' — только этот браузер, 'server' — npm start, 'cloud' — Firebase
  var placing = false, temp = null, draft = null, banner = null;
  var pending = {}, openId = null;                                   // метки на проверке: id → { r, m, local }
  var ready = function () { return document.body.classList.contains('app-ready'); };

  /* Анонимный номер браузера — чтобы один человек не подтверждал дважды и не подтверждал свою метку */
  BB.uid = (function () {
    var id = '';
    try { id = localStorage.getItem('bb-uid') || ''; } catch (e) { /* ок */ }
    if (!/^[a-z0-9-]{8,64}$/i.test(id)) {
      id = window.crypto && crypto.randomUUID ? crypto.randomUUID() : 'b' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
      try { localStorage.setItem('bb-uid', id); } catch (e) { /* ок */ }
    }
    return id;
  })();

  /* ---------- Хранилище ---------- */
  function loadLocal() { try { return JSON.parse(localStorage.getItem(KEY) || '[]') || []; } catch (e) { return []; } }
  function saveLocal(r) {
    var list = loadLocal(); list.push(r);
    try { localStorage.setItem(KEY, JSON.stringify(list)); return true; } catch (e) { return false; }
  }
  function isPublic(r) { return !r.review || r.review === 'approved'; }

  /* Метка пришла (с сервера или из браузера): одобренная → на карту, на проверке → «призрак» */
  function ingest(r) {
    if (r.review === 'rejected') { removeGhost(r.id); return; }
    if (isPublic(r)) {
      if (pending[r.id]) popOut(r);
      else if (!BB.byId[r.id]) BB.addPlace(r);
      return;
    }
    if (pending[r.id]) { pending[r.id].r = r; refreshGhost(r.id); } else addGhost(r);
  }
  function sync() {
    return fetch('/api/reports', { cache: 'no-store' })
      .then(function (res) { if (!res.ok) throw new Error(res.status); return res.json(); })
      .then(function (d) {
        mode = 'server'; NEED = d.need || NEED;
        var seen = {};
        (d.reports || []).forEach(function (r) { seen[r.id] = true; ingest(r); });
        Object.keys(pending).forEach(function (id) { if (!seen[id] && !pending[id].local) removeGhost(id); });
      });
  }
  loadLocal().forEach(function (r) { r.local = true; ingest(r); });
  (BB.cloudReady || Promise.resolve(null)).then(function (c) {
    if (c) { startCloud(c); return; }                                  // Firebase — общее для всех устройств
    if (location.protocol.indexOf('http') !== 0) return;               // открыт просто файлом — только этот браузер
    sync().then(function () { setInterval(function () { sync().catch(function () { /* сервер недоступен */ }); }, 8000); })
      .catch(function () { mode = 'local'; });
  });

  /* ---------- Облако Firebase: метки и фото видны на всех устройствах сразу ---------- */
  function forCloud(r) {
    var x = {};
    Object.keys(r).forEach(function (k) { if (k !== 'local' && k !== '_pop' && r[k] !== undefined) x[k] = r[k]; });
    if (x.photo && x.photo.length > 900000) x.photo = '';            // документ Firebase — до 1 МБ
    x.text = x.text || '';
    x.createdAt = cloud.stamp();
    return x;
  }
  function startCloud(c) {
    cloud = c; mode = 'cloud';
    var col = c.db.collection('reports');
    var old = loadLocal();                                             // метки, сохранённые раньше только в этом браузере
    if (old.length) {
      Promise.all(old.map(function (r) {
        var x = forCloud(r);
        x.review = 'pending'; x.confirms = []; x.uid = x.uid || BB.uid; delete x.ai;
        return col.doc(r.id).set(x);
      }))
        .then(function () { try { localStorage.removeItem(KEY); } catch (e) { /* ок */ } })
        .catch(function (err) { console.warn('Не удалось перенести старые метки в облако:', err.message); });
    }
    var shown = {};                                                    // одобренные метки из облака, уже на карте
    col.onSnapshot(function (snap) {
      var seen = {};
      snap.forEach(function (d) {
        seen[d.id] = true;
        if (d.metadata.hasPendingWrites) return;                       // сервер ещё не подтвердил — не показываем
        var r = d.data(); r.id = d.id;
        ingest(r);
        if (isPublic(r)) shown[r.id] = true;
      });
      Object.keys(pending).forEach(function (id) { if (!seen[id]) removeGhost(id); });
      Object.keys(shown).forEach(function (id) {                       // удалили в Firebase Console — убираем у всех
        if (!seen[id]) { delete shown[id]; if (BB.removePlace) BB.removePlace(id); }
      });
    }, function (err) { console.warn('Firebase: метки недоступны —', err.message); BB.toast(t('cloudError')); });
  }

  /* Автопроверка (в облаке ключ ИИ хранить нельзя — проверяем по правилам, как сервер без ключа) */
  var BAD_WORDS = /(хуй|хуе|пизд|ебан|ебат|бля|сука|мудак|долбо[её]б|fuck|shit|bitch|cunt)/i;
  function R(ru, ky, en) { return { ru: ru, ky: ky, en: en }; }
  function ruleCheck(r) {
    var text = (typeof r.title === 'string' ? r.title : '') + ' ' + (r.text || '');
    if (BAD_WORDS.test(text)) return { approve: false, reason: R('грубые слова', 'орой сөздөр', 'offensive words') };
    if (/(https?:\/\/|www\.|t\.me\/)/i.test(text)) return { approve: false, reason: R('ссылки или реклама', 'шилтемелер же жарнама', 'links or ads') };
    if (/\d[\d\s()+-]{8,}\d/.test(text)) return { approve: false, reason: R('номера телефонов', 'телефон номерлери', 'phone numbers') };
    if (!(r.problems || []).length && (r.text || '').trim().length < 10 && r.status !== 'good') {
      return { approve: false, reason: R('не указано, что мешает', 'эмне тоскоол экени жазылган эмес', 'no problem described') };
    }
    return { approve: true, reason: R('похоже на настоящий барьер', 'чыныгы тоскоолдукка окшош', 'looks like a real barrier') };
  }

  /* Подтверждение: на сервер (npm start) или в облако (транзакция — два человека не «потеряют» голоса друг друга) */
  function confirmCall(id) {
    if (mode !== 'cloud') {
      return fetch('/api/reports/' + encodeURIComponent(id) + '/confirm', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid: BB.uid })
      }).then(function (res) { return res.json().then(function (d) { return { ok: res.ok, d: d }; }); });
    }
    var ref = cloud.db.collection('reports').doc(id);
    return cloud.db.runTransaction(function (tx) {
      return tx.get(ref).then(function (snap) {
        if (!snap.exists) return { ok: false, d: { error: 'not_found' } };
        var r = snap.data(); r.id = id;
        if (r.review !== 'pending') return { ok: true, d: { report: r } };
        if (r.uid && r.uid === BB.uid) return { ok: false, d: { error: 'own_report' } };
        var confirms = (r.confirms || []).slice();
        if (confirms.indexOf(BB.uid) >= 0) return { ok: false, d: { error: 'already_confirmed' } };
        confirms.push(BB.uid);
        var upd = { confirms: confirms };
        if (confirms.length >= NEED) {                                   // хватает людей → автопроверка
          var v = ruleCheck(r);
          upd.review = v.approve ? 'approved' : 'rejected';
          upd.ai = { approve: v.approve, reason: v.reason, by: 'rules', at: new Date().toISOString() };
        }
        tx.update(ref, upd);
        Object.keys(upd).forEach(function (k) { r[k] = upd[k]; });
        return { ok: true, d: { report: r } };
      });
    });
  }

  /* ---------- Метки на проверке («призраки») ---------- */
  function ghostIcon(r) {
    var n = (r.confirms || []).length;
    return L.divIcon({ className: 'pin-wrap', iconSize: [44, 54], iconAnchor: [22, 48], tooltipAnchor: [0, -46],
      html: '<div class="pin pin--pending" style="--c:#8b93a7"><span class="pin__pulse"></span><span class="pin__body"><span class="pin__icon">' +
        C[r.category].icon + '</span></span><span class="pin__user">⏳</span><span class="pin__count">' + n + '/' + NEED + '</span></div>' });
  }
  function addGhost(r) {
    var m = L.marker(BB_latlng(r), { icon: ghostIcon(r), zIndexOffset: -100 });
    m.bindTooltip(esc(T(r.title)) + ' — ' + esc(t('pendingBadge')), { direction: 'top', className: 'pin-tip' });
    m.on('click', function () { openPending(r.id); });
    pending[r.id] = { r: r, m: m, local: !!r.local };
    if (ready()) m.addTo(map);
    document.dispatchEvent(new CustomEvent('bb:places'));
  }
  function refreshGhost(id) {
    var p = pending[id]; if (!p) return;
    p.m.setIcon(ghostIcon(p.r));
    if (openId === id) renderPending(p.r);
  }
  function removeGhost(id) {
    var p = pending[id]; if (!p) return;
    map.removeLayer(p.m); delete pending[id];
    if (openId === id) closePending();
    document.dispatchEvent(new CustomEvent('bb:places'));
  }
  function popOut(r) {                                               // одобрено → настоящая метка «выпрыгивает»
    var wasOpen = openId === r.id;
    removeGhost(r.id);
    r._pop = true;
    BB.addPlace(r);
    setTimeout(function () { delete r._pop; }, 2500);
    celebrate();
    BB.toast(t('approvedToast'));
    if (wasOpen) BB.openPlace(r.id);
  }
  BB.pendingCount = function () { return Object.keys(pending).length; };

  function openPending(id) {
    var p = pending[id]; if (!p) return;
    if (placing || draft) stopPlacing();
    BB.closePlace();
    openId = id;
    renderPending(p.r);
    panel.classList.add('is-open'); panel.setAttribute('aria-hidden', 'false');
    document.body.classList.add('panel-open');
  }
  function closePending() {
    openId = null;
    BB.hidePanel(); document.body.classList.remove('panel-open');
  }
  function renderPending(r) {
    var n = (r.confirms || []).length, mine = r.uid && r.uid === BB.uid, did = (r.confirms || []).indexOf(BB.uid) >= 0;
    var dots = '';
    for (var i = 0; i < NEED; i++) dots += '<i' + (i < n ? ' class="is-on"' : '') + '></i>';
    var action = mode === 'local' ? '<div class="review__note">' + esc(t('needServer')) + '</div>'
      : mine ? '<div class="review__note">' + esc(t('yourReport', { need: NEED })) + '</div>'
      : did ? '<div class="review__note is-ok">' + esc(t('youConfirmed', { n: Math.max(0, NEED - n) })) + '</div>'
      : '<button type="button" class="review__btn" id="confirmBtn">' + esc(t('confirmBtn')) + '</button>';
    var probs = (r.problems || []).map(function (k) { return '<li>' + (P[k] ? P[k].icon + ' ' + esc(T(P[k].label)) : esc(k)) + '</li>'; }).join('');
    content.innerHTML =
      (r.photo ? '<div class="ph"><img src="' + esc(r.photo) + '" alt=""></div>' : '') +
      '<div class="pbody">' +
        '<div class="rv" style="--i:0"><span class="tag tag--pending">' + esc(t('pendingBadge')) + '</span><h2>' + esc(T(r.title)) + '</h2></div>' +
        '<div class="review rv" style="--i:1"><div class="review__dots">' + dots + '</div>' +
          '<p>' + esc(t('pendingInfo', { n: n, need: NEED })) + '</p>' + action + '</div>' +
        (probs ? '<div class="rv" style="--i:2"><div class="ptitle">' + esc(t('wrong')) + '</div><ul class="issues">' + probs + '</ul></div>' : '') +
        (r.text ? '<div class="rv" style="--i:3"><div class="tip">' + esc(r.text) + '</div></div>' : '') +
        '<div class="rv" style="--i:4"><div class="tags"><span class="tag">' + C[r.category].icon + ' ' + esc(T(C[r.category].label)) + '</span>' +
          '<span class="tag">✍️ ' + esc(t('reportedBy', { name: r.author || t('anon') })) + '</span></div></div>' +
      '</div>';
    content.scrollTop = 0;
  }

  /* «✅ Подтверждаю» → сервер или облако; на 2-м подтверждении — проверка ИИ */
  content.addEventListener('click', function (e) {
    var btn = e.target.closest('#confirmBtn');
    if (!btn || !openId || !pending[openId]) return;
    var id = openId, willCheck = (pending[id].r.confirms || []).length + 1 >= NEED, t0 = Date.now();
    btn.disabled = true;
    btn.textContent = willCheck ? t('aiChecking') : '…';
    if (willCheck) btn.classList.add('is-checking');
    confirmCall(id)
      .then(function (x) {
        setTimeout(function () {                                         // чуть-чуть показать «ИИ проверяет…»
          if (!x.ok) {
            var err = x.d && x.d.error;
            BB.toast(t(err === 'own_report' ? 'ownReport' : err === 'already_confirmed' ? 'alreadyConfirmed' : 'confirmFail'));
            refreshGhost(id); return;
          }
          var r = x.d.report;
          if (r.review === 'rejected') { removeGhost(id); BB.toast(t('rejectedToast', { reason: T(r.ai && r.ai.reason) || '' })); return; }
          ingest(r);
        }, willCheck ? Math.max(0, 1600 - (Date.now() - t0)) : 0);
      })
      .catch(function () { BB.toast(t('confirmFail')); refreshGhost(id); });
  });

  /* ---------- Режим «поставить метку» ---------- */
  function startPlacing() {
    if (placing) return;
    BB.closePlace(); openId = null;
    placing = true;
    document.body.classList.add('placing');
    banner = document.createElement('div');
    banner.className = 'place-banner';
    banner.innerHTML = '<span>' + esc(t('placeHint')) + '</span>' +
      '<button type="button" class="place-banner__here">' + esc(t('hereBtn')) + '</button>' +
      '<button type="button" class="place-banner__x">' + esc(t('cancel')) + '</button>';
    banner.querySelector('.place-banner__here').addEventListener('click', useMyLocation);
    banner.querySelector('.place-banner__x').addEventListener('click', stopPlacing);
    $('app').appendChild(banner);
  }
  function stopPlacing() {
    var wasOpen = !!draft;
    placing = false; draft = null;
    document.body.classList.remove('placing');
    if (banner) { banner.remove(); banner = null; }
    if (temp) { map.removeLayer(temp); temp = null; }
    if (wasOpen) { BB.hidePanel(); document.body.classList.remove('panel-open'); }
  }
  function toArr(ll) { return [Number(ll.lat.toFixed(6)), Number(ll.lng.toFixed(6))]; }
  function setPin(latlng) {
    if (!temp) {
      temp = L.marker(latlng, {
        draggable: true, zIndexOffset: 2000,
        icon: L.divIcon({ className: 'pin-wrap', iconSize: [44, 54], iconAnchor: [22, 48],
          html: '<div class="pin pin--new" style="--c:#7c5cff"><span class="pin__pulse"></span><span class="pin__body"><span class="pin__icon">📍</span></span></div>' })
      }).addTo(map);
      temp.on('dragend', function () { if (draft) draft.latlng = toArr(temp.getLatLng()); });
    } else {
      temp.setLatLng(latlng);
    }
    if (!draft) openForm();
    draft.latlng = toArr(temp.getLatLng());
    var z = Math.max(map.getZoom(), 17), size = map.getSize();
    var shift = window.matchMedia('(max-width: 760px)').matches ? [0, size.y / 2 - Math.max(150, size.y * 0.2)] : [60, 0];
    map.flyTo(map.unproject(map.project(latlng, z).add(shift), z), z, { duration: 0.8 });
  }
  function useMyLocation() {
    if (!navigator.geolocation) { BB.toast(t('geoFail')); return; }
    navigator.geolocation.getCurrentPosition(
      function (pos) { setPin(L.latLng(pos.coords.latitude, pos.coords.longitude)); },
      function () { BB.toast(t('geoFail')); },
      { enableHighAccuracy: true, timeout: 10000 });
  }
  map.on('click', function (e) {
    if (placing) setPin(e.latlng);
    else if (openId) closePending();
  });

  /* ---------- Форма ---------- */
  function chips(name, dict, type, checked) {
    return Object.keys(dict).map(function (k) {
      var d = dict[k];
      return '<label class="rchip"><input type="' + type + '" name="' + name + '" value="' + k + '"' +
        (checked && checked.indexOf(k) >= 0 ? ' checked' : '') + '><span>' + (d.icon ? d.icon + ' ' : '') + esc(T(d.label)) + '</span></label>';
    }).join('');
  }
  function sec(i, key, html) { return '<div class="rsec rv" style="--i:' + i + '"><div class="ptitle">' + esc(t(key)) + '</div>' + html + '</div>'; }
  function openForm() {
    draft = { latlng: null, photo: '' };
    var sev = { bad: { icon: '🔴', label: t('sevBad') }, mid: { icon: '🟡', label: t('sevMid') }, good: { icon: '🟢', label: t('sevGood') } };
    var name = '';
    try { name = localStorage.getItem('bb-name') || ''; } catch (e) { /* ок */ }
    content.innerHTML = '<form class="rform" id="rform">' +
      '<div class="rform__head rv" style="--i:0"><h2>' + esc(t('formTitle')) + '</h2><p>' + esc(t('dragHint')) + '</p></div>' +
      sec(1, 'sevQ', '<div class="rchips">' + chips('sev', sev, 'radio', ['bad']) + '</div>') +
      sec(2, 'typeQ', '<div class="rchips">' + chips('cat', C, 'radio') + '</div>') +
      sec(3, 'problemsQ', '<div class="rchips">' + chips('prob', P, 'checkbox') + '</div>') +
      sec(4, 'whoQ', '<div class="rchips">' + chips('who', G, 'checkbox') + '</div>') +
      sec(5, 'titleQ', '<input id="rTitle" maxlength="80" placeholder="' + esc(t('titlePh')) + '">' +
        '<textarea id="rText" maxlength="600" placeholder="' + esc(t('textPh')) + '"></textarea>') +
      '<div class="rv" style="--i:6"><label class="rphoto"><input type="file" id="rPhoto" accept="image/*">' +
        '<span id="rPhotoLbl">' + esc(t('photoBtn')) + '</span></label><div class="rphoto__preview" id="rPreview"></div></div>' +
      '<div class="rv" style="--i:7"><input id="rName" maxlength="40" placeholder="' + esc(t('namePh')) + '" value="' + esc(name) + '"></div>' +
      '<div class="rv" style="--i:8"><button type="submit" class="rform__submit">' + esc(t('submitReport')) + '</button>' +
        '<div class="cform__note">' + esc(t(mode !== 'local' ? 'savedServer' : 'savedLocal')) + '</div></div>' +
      '</form>';
    content.scrollTop = 0;
    panel.classList.add('is-open'); panel.setAttribute('aria-hidden', 'false');
    document.body.classList.add('panel-open');
  }

  /* Фото уменьшаем до ~800 px (≈60–100 КБ) — быстро грузится и больше меток помещается в браузер */
  function compress(file) {
    return new Promise(function (resolve, reject) {
      var img = new Image(), url = URL.createObjectURL(file);
      img.onload = function () {
        var k = Math.min(1, 800 / Math.max(img.naturalWidth, img.naturalHeight));
        var c = document.createElement('canvas');
        c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        resolve(c.toDataURL('image/jpeg', 0.6));
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('bad image')); };
      img.src = url;
    });
  }
  content.addEventListener('change', function (e) {
    if (e.target.id !== 'rPhoto' || !draft || !e.target.files[0]) return;
    compress(e.target.files[0]).then(function (dataUrl) {
      draft.photo = dataUrl;
      $('rPreview').innerHTML = '<img src="' + dataUrl + '" alt="">';
      $('rPhotoLbl').textContent = t('photoChange');
    }).catch(function () { BB.toast(t('badPhoto')); });
  });

  function defaultTitle(cat) {
    var o = {};
    Object.keys(window.I18N).forEach(function (L) { o[L] = window.I18N[L].userTitle.replace('{cat}', C[cat].label[L] || C[cat].label.ru); });
    return o;
  }
  content.addEventListener('submit', function (e) {
    if (e.target.id !== 'rform' || !draft) return;
    e.preventDefault();
    var f = e.target;
    var one = function (n) { var x = f.querySelector('input[name="' + n + '"]:checked'); return x ? x.value : null; };
    var all = function (n) { return [].map.call(f.querySelectorAll('input[name="' + n + '"]:checked'), function (x) { return x.value; }); };
    var cat = one('cat');
    if (!cat) { BB.toast(t('needType')); return; }
    if (!draft.latlng) return;
    var status = one('sev') || 'bad', affects = all('who'), author = $('rName').value.trim();
    if (!affects.length && status !== 'good') affects = Object.keys(G);    // не выбрали — значит, мешает всем
    try { if (author) localStorage.setItem('bb-name', author); } catch (err) { /* ок */ }
    submitReport({
      id: 'u-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), user: true,
      category: cat, status: status, problems: all('prob'), affects: affects, latlng: draft.latlng,
      title: $('rTitle').value.trim() || defaultTitle(cat), address: '', text: $('rText').value.trim(),
      photo: draft.photo || '', author: author, checked: new Date().toISOString().slice(0, 10), comments: [],
      review: 'pending', confirms: [], uid: BB.uid
    });
  });
  function submitReport(r) {
    var btn = content.querySelector('.rform__submit');
    if (btn) btn.disabled = true;
    var fail = function () { BB.toast(t('storageFull')); if (btn) btn.disabled = false; };
    var saveHere = function () {                                       // в браузер; места мало → без фото
      r.local = true;
      if (saveLocal(r)) return true;
      if (r.photo) {
        r.photo = '';
        if (saveLocal(r)) { setTimeout(function () { BB.toast(t('savedNoPhoto')); }, 2800); return true; }
      }
      return false;
    };
    var done = function (saved) {
      draft = null; stopPlacing();
      ingest(saved);
      openPending(saved.id);
      BB.toast(t('sentForReview'));
    };
    if (mode === 'cloud') {                                             // в облако — сразу видно всем
      cloud.db.collection('reports').doc(r.id).set(forCloud(r))
        .then(function () { done(r); })
        .catch(function (err) { console.warn('Firebase:', err.message); if (saveHere()) done(r); else fail(); });
      return;
    }
    if (mode === 'local') { if (saveHere()) done(r); else fail(); return; }
    fetch('/api/reports', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(r) })
      .then(function (res) { if (!res.ok) throw new Error(res.status); return res.json(); })
      .then(function (d) { done(d.report); })
      .catch(function () { if (saveHere()) done(r); else fail(); });
  }

  /* Конфетти, когда метку одобрили */
  function celebrate() {
    var box = document.createElement('div'), colors = ['#7c5cff', '#00b4ff', '#2ee6a6', '#ffb020', '#ff4d6d'];
    box.className = 'confetti';
    for (var i = 0; i < 28; i++) {
      var s = document.createElement('span'), a = Math.random() * Math.PI * 2, d = 90 + Math.random() * 160;
      s.style.cssText = '--x:' + Math.round(Math.cos(a) * d) + 'px;--y:' + Math.round(Math.sin(a) * d - 60) + 'px;--r:' +
        Math.round(Math.random() * 720) + 'deg;background:' + colors[i % colors.length] + ';animation-delay:' + Math.round(Math.random() * 120) + 'ms';
      box.appendChild(s);
    }
    document.body.appendChild(box);
    setTimeout(function () { box.remove(); }, 1600);
  }

  /* ---------- Связь с остальным сайтом ---------- */
  var openPlace = BB.openPlace;                       // открыть другое место = выйти из режима метки
  BB.openPlace = function (id) { if (placing || draft) stopPlacing(); openId = null; return openPlace(id); };
  $('reportFab').addEventListener('click', startPlacing);
  $('panelClose').addEventListener('click', function () { if (placing || draft) stopPlacing(); if (openId) closePending(); });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (placing || draft) stopPlacing();
    else if (openId) closePending();
  });
  document.addEventListener('bb:introstart', function () { if (placing || draft) stopPlacing(); if (openId) closePending(); });
  document.addEventListener('bb:introdone', function () {
    Object.keys(pending).forEach(function (id) { pending[id].m.addTo(map); });
  });
  document.addEventListener('bb:lang', function () {
    if (banner) banner.querySelector('span').textContent = t('placeHint');
    Object.keys(pending).forEach(function (id) {
      pending[id].m.setTooltipContent(esc(T(pending[id].r.title)) + ' — ' + esc(t('pendingBadge')));
    });
    if (openId && pending[openId]) renderPending(pending[openId].r);
  });
})();
