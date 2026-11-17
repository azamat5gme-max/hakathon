/* ================= ИИ-ПОМОЩНИК =================
   Два режима работы:
   1) «Claude» — сайт запущен через `node server.js` и задан ключ ANTHROPIC_API_KEY.
   2) «По данным карты» — ключа нет или сайт открыт просто файлом: бот отвечает сам. */
(function () {
  var BB = window.BB, LOC = window.LOCATIONS, C = window.CATEGORIES, S = window.STATUS;
  var $ = function (id) { return document.getElementById(id); };
  var bot = $('bot'), fab = $('botFab'), msgs = $('botMsgs'), form = $('botForm'), input = $('botInput'), statusEl = $('botStatus');
  var history = [], aiMode = false, greeted = false, busy = false, ctx = { group: null };
  var isMobile = function () { return window.matchMedia('(max-width: 760px)').matches; };
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var lc = function (s) { return s ? s.charAt(0).toLowerCase() + s.slice(1) : ''; };
  var WHO = { wheelchair: 'на коляске', elderly: 'пожилому человеку', stroller: 'с детской коляской' };

  var QUICK = [
    '♿ Куда можно на коляске?',
    '👶 Где погулять с детской коляской?',
    '🧓 Удобные места для пожилых',
    '⚠️ Какие места лучше обойти?',
    '🚌 Какая остановка удобная?',
    '✍️ Как оставить отзыв?'
  ];

  /* ---------- Окно чата ---------- */
  function open() {
    bot.classList.add('is-open'); bot.setAttribute('aria-hidden', 'false'); document.body.classList.add('bot-open');
    if (!greeted) {
      greeted = true;
      setTimeout(function () {
        say('bot', 'Привет! Я ИИ-помощник карты «Без барьеров» 👋\nСкажите, кто идёт (на коляске, с детской коляской, пожилой человек) и куда нужно — подскажу, где пройти удобно, а какие места лучше обойти.');
      }, 350);
    }
    if (!isMobile()) setTimeout(function () { input.focus(); }, 400);
  }
  function close() { bot.classList.remove('is-open'); bot.setAttribute('aria-hidden', 'true'); document.body.classList.remove('bot-open'); }

  function fmt(text) { return BB.esc(text).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>'); }
  function say(who, text, placeIds) {
    var el = document.createElement('div');
    el.className = 'msg msg--' + who;
    el.innerHTML = fmt(text);
    if (placeIds && placeIds.length) {
      var wrap = document.createElement('div');
      wrap.className = 'msg__places';
      placeIds.slice(0, 6).forEach(function (id, i) {
        var loc = BB.byId[id]; if (!loc) return;
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'msg__place';
        b.style.setProperty('--c', S[BB.effStatus(loc, ctx.group)].color);
        b.style.setProperty('--i', i);
        b.innerHTML = '<i></i>' + C[loc.category].icon + ' ' + BB.esc(loc.title);
        b.addEventListener('click', function () { if (isMobile()) close(); BB.openPlace(id); });
        wrap.appendChild(b);
      });
      el.appendChild(wrap);
    }
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
  }
  function typing() {
    var el = document.createElement('div');
    el.className = 'msg msg--bot typing';
    el.innerHTML = '<span></span><span></span><span></span>';
    msgs.appendChild(el); msgs.scrollTop = msgs.scrollHeight;
    return el;
  }
  function setStatus() { statusEl.textContent = aiMode ? 'ИИ на базе Claude · онлайн' : 'отвечает по данным карты'; }

  /* ---------- Отправка ---------- */
  async function send(text) {
    text = (text || '').trim();
    if (!text || busy) return;
    busy = true; form.querySelector('button').disabled = true;
    say('user', text); input.value = '';
    history.push({ role: 'user', content: text });

    var g = detectGroup(norm(text));
    if (g && g !== ctx.group && BB.setGroup) BB.setGroup(g);   // бот перекрашивает карту под человека
    if (g) ctx.group = g;

    var dots = typing(), t0 = Date.now(), answer;
    if (aiMode) {
      try {
        var h = history.slice(-11);
        while (h.length && h[0].role !== 'user') h.shift();
        var r = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: h }) });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        var data = await r.json();
        answer = { text: data.reply, places: placesIn(data.reply) };
      } catch (e) {
        aiMode = false; setStatus();
        answer = localAnswer(text);
        answer.text = '(ИИ-сервер недоступен — отвечаю по данным карты)\n\n' + answer.text;
      }
    } else {
      answer = localAnswer(text);
      await wait(Math.max(0, 750 - (Date.now() - t0)));
    }
    dots.remove();
    say('bot', answer.text, answer.places);
    history.push({ role: 'assistant', content: answer.text });
    busy = false; form.querySelector('button').disabled = false;
  }

  /* Какие места упомянул ИИ — чтобы показать кнопки «на карту» */
  function placesIn(text) {
    var low = String(text || '').toLowerCase(), ids = [];
    LOC.forEach(function (l) {
      var keys = [l.title, (l.title.match(/«[^»]+»/) || [])[0], l.title.split(' — ')[0]];
      if (keys.some(function (k) { return k && k.length >= 5 && low.indexOf(k.toLowerCase()) >= 0; })) ids.push(l.id);
    });
    return ids;
  }

  /* ================= Офлайн-«мозг»: ответы по данным карты ================= */
  function norm(s) { return String(s).toLowerCase().replace(/ё/g, 'е'); }
  function detectGroup(t) {
    if (/(инвалид|колясочн|на коляске|на кресле|не хожу|wheelchair|♿)/.test(t)) return 'wheelchair';
    if (/(детск|ребен|малыш|младен|мам|коляск|stroller|👶)/.test(t)) return 'stroller';
    if (/(пожил|бабуш|дедуш|пенсион|старик|старушк|трость|ходунк|тяжело ходить|elderly|🧓)/.test(t)) return 'elderly';
    return null;
  }
  function detectCat(t) {
    if (/(остановк|автобус|маршрутк|транспорт|троллейбус)/.test(t)) return 'bus';
    if (/(парк|двор|площадк|погулять|гулять|прогул|сквер)/.test(t)) return 'park';
    if (/(администрац|госуслуг|гос\.? ?здан|поликлиник|больниц|врач|документ|справк|паспорт)/.test(t)) return 'gov';
    if (/(магазин|тц|торгов|аптек|почт|переход|кафе|покупк)/.test(t)) return 'public';
    return null;
  }
  var STOPWORDS = ['остановка', 'центральный', 'центр', 'вход', 'примерной', 'детская', 'дворе', 'районная', 'отделение'];
  function words(s) {
    return norm(s).replace(/[^a-zа-я0-9 ]/g, ' ').split(/\s+/).filter(function (w) { return w.length >= 4; });
  }
  function similar(a, b) {
    var i = 0; while (i < a.length && i < b.length && a[i] === b[i]) i++;
    return i >= 4 || (i >= 3 && a.length <= 5 && b.length <= 5);
  }
  function matchPlace(t, cat) {
    var q = words(t), scored = LOC.map(function (l) {
      var keys = words(l.title).filter(function (w) { return STOPWORDS.indexOf(w) < 0; });
      var s = q.filter(function (w) { return keys.some(function (k) { return similar(w, k); }); }).length;
      return { l: l, s: s + (s && l.category === cat ? 0.5 : 0) };
    }).sort(function (a, b) { return b.s - a.s; });
    if (!scored[0].s || (scored[1] && scored[1].s === scored[0].s)) return null;
    return scored[0].l;
  }
  function dist(a, b) {
    var p = BB_latlng(a), q = BB_latlng(b), k = Math.cos(p[0] * Math.PI / 180);
    var dy = (p[0] - q[0]) * 111320, dx = (p[1] - q[1]) * 111320 * k;
    return Math.sqrt(dx * dx + dy * dy);
  }
  function nearestGood(loc, group) {
    var best = null;
    LOC.forEach(function (l) {
      if (l === loc || BB.effStatus(l, group || null) !== 'good') return;
      var d = dist(loc, l), score = d * (l.category === loc.category ? 1 : 1.6);
      if (!best || score < best.score) best = { loc: l, d: Math.round(d / 10) * 10, score: score };
    });
    return best;
  }

  function describe(loc, group) {
    var st = BB.effStatus(loc, group || null), ids = [loc.id];
    var lines = ['**' + loc.title + '** — ' + lc(S[st].label) + (group ? ' (' + WHO[group] + ')' : '') + '.'];
    if (st !== 'good' && loc.issues.length) lines.push('Что мешает: ' + loc.issues.map(lc).join('; ') + '.');
    if (st === 'good' && loc.good && loc.good.length) lines.push('Что хорошо: ' + loc.good.map(lc).join(', ') + '.');
    if (loc.tip) lines.push('💡 ' + loc.tip);
    if (st !== 'good') {
      var alt = nearestGood(loc, group);
      if (alt) { lines.push('Доступная альтернатива рядом: **' + alt.loc.title + '** (~' + alt.d + ' м).'); ids.push(alt.loc.id); }
    }
    return { text: lines.join('\n'), places: ids };
  }

  function listGood(group, cat) {
    var pool = LOC.filter(function (l) { return !cat || l.category === cat; });
    var good = pool.filter(function (l) { return BB.effStatus(l, group || null) === 'good'; });
    var mid = pool.filter(function (l) { return BB.effStatus(l, group || null) === 'mid'; });
    var who = group ? WHO[group] : 'всем', lines = [], ids = [];
    if (good.length) {
      lines.push((cat ? C[cat].label : 'Места') + ', где удобно ' + who + ' ✅');
      good.slice(0, 4).forEach(function (l) {
        lines.push('• **' + l.title + '**' + (l.good && l.good[0] ? ' — ' + lc(l.good[0]) : '')); ids.push(l.id);
      });
    } else {
      lines.push('Полностью удобных мест' + (cat ? ' в разделе «' + C[cat].label + '»' : '') + ' ' + (group ? 'для тех, кто ' + WHO[group].replace('пожилому человеку', 'в возрасте') : '') + ' пока нет 😔');
    }
    if (mid.length) {
      lines.push('', 'Можно, но с осторожностью:');
      mid.slice(0, 3).forEach(function (l) { lines.push('• **' + l.title + '** — ' + (l.tip || lc(l.issues[0]))); ids.push(l.id); });
    }
    if (!group) lines.push('', 'Скажите, кто идёт (на коляске, с детской коляской, пожилой человек) — подберу точнее.');
    else lines.push('', 'Я перекрасил карту: зелёные метки — удобно ' + who + '.');
    return { text: lines.join('\n'), places: ids };
  }

  function listBad(group, cat) {
    var pool = LOC.filter(function (l) { return (!cat || l.category === cat) && BB.effStatus(l, group || null) !== 'good'; })
      .sort(function (a, b) { return (BB.effStatus(a, group || null) === 'bad' ? 0 : 1) - (BB.effStatus(b, group || null) === 'bad' ? 0 : 1); });
    if (!pool.length) return { text: 'Отличная новость — здесь серьёзных барьеров не нашли 🎉', places: [] };
    var lines = ['Эти места лучше обойти или подготовиться заранее ⚠️' + (group ? ' (' + WHO[group] + ')' : '')], ids = [];
    pool.slice(0, 4).forEach(function (l) { lines.push('• **' + l.title + '** — ' + lc(l.issues[0] || '')); ids.push(l.id); });
    var alt = nearestGood(pool[0], group);
    if (alt) { lines.push('', 'Вместо «' + pool[0].title + '» удобнее: **' + alt.loc.title + '** (~' + alt.d + ' м).'); ids.push(alt.loc.id); }
    return { text: lines.join('\n'), places: ids };
  }

  function localAnswer(raw) {
    var t = norm(raw), cat = detectCat(t), group = detectGroup(t) || ctx.group;
    if (/^(привет|здравств|салам|добр(ый|ое)|hello|hi\b)/.test(t))
      return { text: 'Здравствуйте! 😊 Расскажите, кто идёт и куда нужно — подскажу, где пройти удобно.' };
    if (/(отзыв|коммент|сообщить|добавить|написать|фото)/.test(t))
      return { text: 'Очень просто ✍️\n1. Нажмите на метку на карте (или на место в списке слева).\n2. Внизу карточки — «Отзывы жителей».\n3. Выберите: «Мой опыт», «Что-то изменилось» или «Новая проблема», напишите и отправьте.\nНапример: «Пандус наконец построили!» 🙌' };
    if (/(что (это|за сайт)|о проекте|зачем|кто вы|кто ты)/.test(t))
      return { text: 'Мы — команда волонтёров. Мы обошли остановки, парки, гос. здания и общественные места района и сфотографировали барьеры: высокие бордюры, ступеньки без пандусов, узкие калитки. Всё это — на карте, с адресами, фото и отзывами жителей.' };
    if (/(спасибо|благодар)/.test(t))
      return { text: 'Пожалуйста! Хорошей дороги 💚 Если заметите изменения — оставьте отзыв на карте.' };

    var place = matchPlace(t, cat);
    if (place) return describe(place, group);
    if (/(обойти|избега|проблем|опасн|плох|барьер|нельзя|недоступн|трудн|худш)/.test(t)) return listBad(group, cat);
    if (group || cat || /(куда|где|можно|доступн|удобн|посовет|сходить|пойти)/.test(t)) return listGood(group, cat);
    return { text: 'Я лучше всего понимаю вопросы о местах на карте 🙂 Например:\n• «Куда можно на коляске?»\n• «Где погулять с детской коляской?»\n• «Удобна ли поликлиника для пожилых?»\n• «Какие места лучше обойти?»' };
  }

  /* ---------- Запуск ---------- */
  QUICK.forEach(function (q) {
    var b = document.createElement('button');
    b.type = 'button'; b.textContent = q;
    b.addEventListener('click', function () { send(q); });
    $('botQuick').appendChild(b);
  });
  fab.addEventListener('click', open);
  $('botClose').addEventListener('click', close);
  form.addEventListener('submit', function (e) { e.preventDefault(); send(input.value); });
  document.addEventListener('bb:introstart', close);

  setStatus();
  if (location.protocol.indexOf('http') === 0) {
    fetch('/api/health').then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { aiMode = !!(d && d.ai); setStatus(); })
      .catch(function () { aiMode = false; setStatus(); });
  }
})();
