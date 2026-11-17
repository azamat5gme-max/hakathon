/* ================= ИИ-ПОМОЩНИК =================
   Два режима работы:
   1) «Claude» — сайт запущен через `node server.js` и задан ключ ANTHROPIC_API_KEY.
   2) «По данным карты» — ключа нет или сайт открыт просто файлом: бот отвечает сам.
   Понимает вопросы на кыргызском, русском и английском; отвечает на выбранном языке. */
(function () {
  var BB = window.BB, LOC = window.LOCATIONS, C = window.CATEGORIES, S = window.STATUS;
  var t = BBI.t, T = BBI.T;
  var $ = function (id) { return document.getElementById(id); };
  var bot = $('bot'), fab = $('botFab'), msgs = $('botMsgs'), form = $('botForm'), input = $('botInput'), statusEl = $('botStatus');
  var history = [], aiMode = false, greeted = false, busy = false, ctx = { group: null };
  var isMobile = function () { return window.matchMedia('(max-width: 760px)').matches; };
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var lc = function (s) { return s ? s.charAt(0).toLowerCase() + s.slice(1) : ''; };
  var who = function (g) { return BBI.raw('who')[g || 'all']; };

  /* ---------- Окно чата ---------- */
  function welcome() { say('bot', t('welcome')); }
  function open() {
    bot.classList.add('is-open'); bot.setAttribute('aria-hidden', 'false'); document.body.classList.add('bot-open');
    if (!greeted) { greeted = true; setTimeout(welcome, 350); }
    if (!isMobile()) setTimeout(function () { input.focus(); }, 400);
  }
  function close() { bot.classList.remove('is-open'); bot.setAttribute('aria-hidden', 'true'); document.body.classList.remove('bot-open'); }

  function fmt(text) { return BB.esc(text).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>'); }
  function say(who_, text, placeIds) {
    var el = document.createElement('div');
    el.className = 'msg msg--' + who_;
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
        b.innerHTML = '<i></i>' + C[loc.category].icon + ' ' + BB.esc(T(loc.title));
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
  function setStatus() { statusEl.textContent = aiMode ? t('botAi') : t('botLocal'); }
  function renderQuick() {
    var box = $('botQuick'); box.innerHTML = '';
    BBI.raw('quick').forEach(function (q) {
      var b = document.createElement('button');
      b.type = 'button'; b.textContent = q;
      b.addEventListener('click', function () { send(q); });
      box.appendChild(b);
    });
  }

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
        var r = await fetch('/api/chat', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: h, lang: BBI.lang() })
        });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        var data = await r.json();
        answer = { text: data.reply, places: placesIn(data.reply) };
      } catch (e) {
        aiMode = false; setStatus();
        answer = localAnswer(text);
        answer.text = t('offlineNote') + '\n\n' + answer.text;
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

  /* Какие места упомянул ИИ (на любом из языков) — чтобы показать кнопки «на карту» */
  function placesIn(text) {
    var low = String(text || '').toLowerCase(), ids = [];
    LOC.forEach(function (l) {
      var titles = typeof l.title === 'object' ? Object.keys(l.title).map(function (k) { return l.title[k]; }) : [l.title];
      var keys = [];
      titles.forEach(function (ti) { keys.push(ti, (ti.match(/[«“][^»”]+[»”]/) || [])[0], ti.split(' — ')[0]); });
      if (keys.some(function (k) { return k && k.length >= 5 && low.indexOf(k.toLowerCase()) >= 0; })) ids.push(l.id);
    });
    return ids;
  }

  /* ================= Офлайн-«мозг»: ответы по данным карты ================= */
  function norm(s) { return String(s).toLowerCase().replace(/ё/g, 'е'); }
  function detectGroup(s) {
    if (/(инвалид|колясочн|на коляске|на кресле|не хожу|майып|арабача|wheelchair|disabled|can'?t walk|♿)/.test(s)) return 'wheelchair';
    if (/(детск|ребен|малыш|младен|мама|мамы|маме|мамоч|коляск|бала араба|балдар араба|наристе|(^|\s)апа|(^|\s)эне|stroller|pram|baby|child|kids?\b|mom|mother|parent|👶)/.test(s)) return 'stroller';
    if (/(пожил|бабуш|дедуш|пенсион|старик|старушк|трость|ходунк|тяжело ходить|улгайган|карыя|(^|\s)кары|чоң эне|чоң ата|таяк|elderly|senior|old (man|woman|people|person)|grand(ma|pa|mother|father)|cane|walker|🧓)/.test(s)) return 'elderly';
    return null;
  }
  function detectCat(s) {
    if (/(остановк|автобус|маршрутк|транспорт|троллейбус|аялдама|bus|stop\b|transport)/.test(s)) return 'bus';
    if (/(парк|двор|площадк|погулять|гулять|прогул|сквер|короо|аянтча|сейил|park|yard|playground|walk)/.test(s)) return 'park';
    if (/(администрац|госуслуг|гос\.? ?здан|поликлиник|больниц|врач|документ|справк|паспорт|мамлекеттик|акимчилик|мэрия|оорукана|дарыгер|government|admin|city hall|clinic|hospital|doctor|public services)/.test(s)) return 'gov';
    if (/(магазин|тц|торгов|аптек|почт|переход|кафе|покупк|дүкөн|соода|дарыкана|өтмөк|shop|store|mall|pharmac|post office|underpass|cafe)/.test(s)) return 'public';
    return null;
  }
  var STOPWORDS = ['остановка', 'центральный', 'центр', 'вход', 'примерной', 'детская', 'дворе', 'районная', 'отделение',
    'аялдамасы', 'борбордук', 'кирүү', 'мисал', 'көчөсүнөн', 'короодогу', 'райондук', 'жанындагы', 'бөлүмү',
    'stop', 'central', 'entrance', 'example', 'courtyard', 'district'];
  function words(s) {
    return norm(s).replace(/[^a-zа-яөүң0-9 ]/g, ' ').split(/\s+/).filter(function (w) { return w.length >= 4; });
  }
  function titleWords(l) {
    var all = typeof l.title === 'object' ? Object.keys(l.title).map(function (k) { return l.title[k]; }).join(' ') : l.title;
    return words(all).filter(function (w) { return STOPWORDS.indexOf(w) < 0; });
  }
  function similar(a, b) {
    var i = 0; while (i < a.length && i < b.length && a[i] === b[i]) i++;
    return i >= 4 || (i >= 3 && a.length <= 5 && b.length <= 5);
  }
  function matchPlace(s, cat) {
    var q = words(s), scored = LOC.map(function (l) {
      var keys = titleWords(l);
      var sc = q.filter(function (w) { return keys.some(function (k) { return similar(w, k); }); }).length;
      return { l: l, s: sc + (sc && l.category === cat ? 0.5 : 0) };
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
    var st = BB.effStatus(loc, group || null), ids = [loc.id], issues = BB.issues(loc), good = BB.good(loc);
    var vars = { title: T(loc.title), status: lc(T(S[st].label)), who: who(group) };
    var lines = [t(group ? 'placeLineWho' : 'placeLine', vars)];
    if (st !== 'good' && issues.length) lines.push(t('wrongLine', { list: issues.map(lc).join('; ') }));
    if (st === 'good' && good.length) lines.push(t('goodLine', { list: good.map(lc).join(', ') }));
    if (loc.tip) lines.push('💡 ' + T(loc.tip));
    if (st !== 'good') {
      var alt = nearestGood(loc, group);
      if (alt) { lines.push(t('altLine', { title: T(alt.loc.title), d: alt.d })); ids.push(alt.loc.id); }
    }
    return { text: lines.join('\n'), places: ids };
  }

  function listGood(group, cat) {
    var pool = LOC.filter(function (l) { return !cat || l.category === cat; });
    var good = pool.filter(function (l) { return BB.effStatus(l, group || null) === 'good'; });
    var mid = pool.filter(function (l) { return BB.effStatus(l, group || null) === 'mid'; });
    var lines = [], ids = [];
    if (good.length) {
      lines.push(t('goodHead', { who: who(group) }));
      good.slice(0, 4).forEach(function (l) {
        var g = BB.good(l);
        lines.push('• **' + T(l.title) + '**' + (g[0] ? ' — ' + lc(g[0]) : '')); ids.push(l.id);
      });
    } else {
      lines.push(t('noGood', { who: who(group) }));
    }
    if (mid.length) {
      lines.push('', t('midHead'));
      mid.slice(0, 3).forEach(function (l) { lines.push('• **' + T(l.title) + '** — ' + (T(l.tip) || lc(BB.issues(l)[0]))); ids.push(l.id); });
    }
    lines.push('', group ? t('recolored', { who: who(group) }) : t('askWho'));
    return { text: lines.join('\n'), places: ids };
  }

  function listBad(group, cat) {
    var rank = function (l) { return BB.effStatus(l, group || null) === 'bad' ? 0 : 1; };
    var pool = LOC.filter(function (l) { return (!cat || l.category === cat) && BB.effStatus(l, group || null) !== 'good'; })
      .sort(function (a, b) { return rank(a) - rank(b); });
    if (!pool.length) return { text: t('noBad'), places: [] };
    var lines = [t('badHead', { who: who(group) })], ids = [];
    pool.slice(0, 4).forEach(function (l) { lines.push('• **' + T(l.title) + '** — ' + lc(BB.issues(l)[0] || '')); ids.push(l.id); });
    var alt = nearestGood(pool[0], group);
    if (alt) { lines.push('', t('instead', { a: T(pool[0].title), b: T(alt.loc.title), d: alt.d })); ids.push(alt.loc.id); }
    return { text: lines.join('\n'), places: ids };
  }

  function localAnswer(raw) {
    var s = norm(raw), cat = detectCat(s), group = detectGroup(s) || ctx.group;
    if (/^(привет|здравств|салам|саламатсыз|добр(ый|ое)|hello|hi\b|hey\b)/.test(s)) return { text: t('greet') };
    if (/(отзыв|коммент|сообщить|добавить|написать|фото|пикир|калтыр|review|comment|report|feedback|photo)/.test(s)) return { text: t('howto') };
    if (/(что (это|за сайт)|о проекте|зачем|кто вы|кто ты|бул эмне|долбоор|кимсиң|what is this|about (the )?project|who are you)/.test(s)) return { text: t('about') };
    if (/(спасибо|благодар|рахмат|ыракмат|thank)/.test(s)) return { text: t('thanks') };

    var place = matchPlace(s, cat);
    if (place) return describe(place, group);
    if (/(обойти|избега|проблем|опасн|плох|барьер|нельзя|недоступн|трудн|худш|айланып|көйгөй|кыйын|жаман|avoid|problem|bad|danger|barrier|inaccessible|difficult|worst)/.test(s)) return listBad(group, cat);
    if (group || cat || /(куда|где|можно|доступн|удобн|посовет|сходить|пойти|кайда|кайсы|ыңгайлуу|жеткиликтүү|барса|where|which|can i|accessible|comfortable|recommend|go\b|visit)/.test(s)) return listGood(group, cat);
    return { text: t('fallback') };
  }

  /* ---------- Запуск ---------- */
  fab.addEventListener('click', open);
  $('botClose').addEventListener('click', close);
  form.addEventListener('submit', function (e) { e.preventDefault(); send(input.value); });
  document.addEventListener('bb:introstart', close);
  document.addEventListener('bb:lang', function () {
    setStatus(); renderQuick();
    if (greeted && !history.length) { msgs.innerHTML = ''; welcome(); }   // приветствие — на новом языке
  });

  renderQuick();
  setStatus();
  if (location.protocol.indexOf('http') === 0) {
    fetch('/api/health').then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { aiMode = !!(d && d.ai); setStatus(); })
      .catch(function () { aiMode = false; setStatus(); });
  }
})();
