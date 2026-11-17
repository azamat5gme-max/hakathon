/* ================= СООБЩЕНИЯ ЖИТЕЛЕЙ: своя метка на карте + фото =================
   Сайт открыт через `npm start` → метки и фото хранятся на сервере, их видят все.
   GitHub Pages / просто файл → метки хранятся в браузере того, кто их добавил (демо). */
(function () {
  var BB = window.BB, t = BBI.t, T = BBI.T, esc = BB.esc;
  var C = window.CATEGORIES, G = window.GROUPS, P = window.PROBLEMS;
  var map = BB.map, panel = document.getElementById('panel'), content = document.getElementById('panelContent');
  var $ = function (id) { return document.getElementById(id); };
  var KEY = 'bb-reports-v1', serverMode = false, placing = false, temp = null, draft = null, banner = null;

  /* ---------- Хранилище ---------- */
  function loadLocal() { try { return JSON.parse(localStorage.getItem(KEY) || '[]') || []; } catch (e) { return []; } }
  function saveLocal(r) {
    var list = loadLocal(); list.push(r);
    try { localStorage.setItem(KEY, JSON.stringify(list)); return true; } catch (e) { return false; }
  }
  loadLocal().forEach(function (r) { BB.addPlace(r); });
  if (location.protocol.indexOf('http') === 0) {
    fetch('/api/reports').then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) { serverMode = true; (d.reports || []).forEach(function (r) { BB.addPlace(r); }); })
      .catch(function () { serverMode = false; });
  }

  /* ---------- Режим «поставить метку» ---------- */
  function startPlacing() {
    if (placing) return;
    BB.closePlace();
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
  map.on('click', function (e) { if (placing) setPin(e.latlng); });

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
        '<div class="cform__note">' + esc(t(serverMode ? 'savedServer' : 'savedLocal')) + '</div></div>' +
      '</form>';
    content.scrollTop = 0;
    panel.classList.add('is-open'); panel.setAttribute('aria-hidden', 'false');
    document.body.classList.add('panel-open');
  }

  /* Фото уменьшаем до ~1000 px — быстро грузится и помещается в браузер */
  function compress(file) {
    return new Promise(function (resolve, reject) {
      var img = new Image(), url = URL.createObjectURL(file);
      img.onload = function () {
        var k = Math.min(1, 1000 / Math.max(img.naturalWidth, img.naturalHeight));
        var c = document.createElement('canvas');
        c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        resolve(c.toDataURL('image/jpeg', 0.72));
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
      photo: draft.photo || '', author: author, checked: new Date().toISOString().slice(0, 10), comments: []
    });
  });

  function submitReport(r) {
    var btn = content.querySelector('.rform__submit');
    if (btn) btn.disabled = true;
    var fail = function () { BB.toast(t('storageFull')); if (btn) btn.disabled = false; };
    var done = function (saved) {
      draft = null; stopPlacing();
      BB.addPlace(saved);
      BB.openPlace(saved.id);
      BB.toast(t('added'));
      celebrate();
    };
    if (!serverMode) { if (saveLocal(r)) done(r); else fail(); return; }
    fetch('/api/reports', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(r) })
      .then(function (res) { if (!res.ok) throw new Error(res.status); return res.json(); })
      .then(function (d) { done(d.report); })
      .catch(function () { if (saveLocal(r)) done(r); else fail(); });
  }

  /* Конфетти, когда метка добавлена */
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
  BB.openPlace = function (id) { if (placing || draft) stopPlacing(); return openPlace(id); };
  $('reportFab').addEventListener('click', startPlacing);
  $('panelClose').addEventListener('click', function () { if (placing || draft) stopPlacing(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && (placing || draft)) stopPlacing(); });
  document.addEventListener('bb:introstart', function () { if (placing || draft) stopPlacing(); });
  document.addEventListener('bb:lang', function () { if (banner) banner.querySelector('span').textContent = t('placeHint'); });
})();
