/* ================= ПЕРЕВОДЫ: Кыргызча / Русский / English =================
   Чтобы поправить текст — найдите ключ и измените его в нужном языке. */
window.LANGS = [
  { code: 'ky', short: 'KG', name: 'Кыргызча', pick: 'Тилди тандаңыз' },
  { code: 'ru', short: 'RU', name: 'Русский', pick: 'Выберите язык' },
  { code: 'en', short: 'EN', name: 'English', pick: 'Choose your language' }
];

window.I18N = {
  ru: {
    pageTitle: 'Infranalysis — карта доступности', dateLocale: 'ru-RU', brand: 'Infranalysis',
    statPoints: 'точек', statIssues: 'проблем', statComments: 'отзывов', intro: 'Интро',
    sideToggle: 'Фильтры и список', show: 'Что показывать', barrierFor: 'Для кого барьер', legend: 'Легенда', places: 'Точки',
    all: 'Все', empty: 'Ничего не найдено — включите фильтры', problemsN: 'проблем: {n}', groupToast: 'Показываю карту глазами: {g}',
    photoSoon: 'Фото появится после обхода', openMaps: 'Открыть в картах', checked: 'Проверено: {d}',
    wrong: 'Что мешает', goodTitle: 'Что хорошо', accessibleAll: 'Удобно для всех', tip: 'Совет',
    reviews: 'Отзывы жителей', noReviews: 'Пока нет отзывов — будьте первым!', yourName: 'Ваше имя',
    reviewPh: 'Расскажите: что удобно, что мешает, что изменилось…', sendReview: 'Отправить отзыв',
    demoNote: 'Демо-версия: отзывы сохраняются в этом браузере.', fillForm: 'Напишите имя и текст отзыва', thanksToast: 'Спасибо! Отзыв добавлен',
    botName: 'ИИ-помощник', botFab: 'Спросить ИИ', botPh: 'Например: куда сходить с коляской?',
    botAi: 'ИИ на базе Claude · онлайн', botLocal: 'отвечает по данным карты', offlineNote: '(ИИ-сервер недоступен — отвечаю по данным карты)',
    welcome: 'Привет! Я ИИ-помощник карты «Infranalysis»\nСкажите, кто идёт (на коляске, с детской коляской, пожилой человек) и куда нужно — подскажу, где пройти удобно, а какие места лучше обойти.',
    greet: 'Здравствуйте! Расскажите, кто идёт и куда нужно — подскажу, где пройти удобно.',
    howto: 'Очень просто\n1. Нажмите на метку на карте (или на место в списке).\n2. Внизу карточки — «Отзывы жителей».\n3. Выберите тип отзыва, напишите и отправьте.\nНапример: «Пандус наконец построили!»',
    about: 'Мы — команда волонтёров. Мы обошли остановки, парки, гос. здания и общественные места и сфотографировали барьеры: высокие бордюры, ступеньки без пандусов, узкие калитки. Всё это — на карте, с адресами, фото и отзывами жителей.',
    thanks: 'Пожалуйста! Хорошей дороги Если заметите изменения — оставьте отзыв на карте.',
    fallback: 'Я лучше всего понимаю вопросы о местах на карте Например:\n• «Куда можно на коляске?»\n• «Где погулять с детской коляской?»\n• «Удобна ли поликлиника для пожилых?»\n• «Какие места лучше обойти?»',
    who: { wheelchair: 'на коляске', elderly: 'для пожилых', stroller: 'с детской коляской', all: 'для всех' },
    placeLine: '**{title}** — {status}.', placeLineWho: '**{title}** — {status} ({who}).',
    wrongLine: 'Что мешает: {list}.', goodLine: 'Что хорошо: {list}.', altLine: 'Доступная альтернатива рядом: **{title}** (~{d} м).',
    goodHead: 'Удобные места ({who})', noGood: 'Полностью удобных мест ({who}) пока нет', midHead: 'Можно, но с осторожностью:',
    askWho: 'Скажите, кто идёт (на коляске, с детской коляской, пожилой человек) — подберу точнее.',
    recolored: 'Я перекрасил карту: зелёные метки — удобно ({who}).',
    badHead: 'Эти места лучше обойти или подготовиться заранее ({who}):', noBad: 'Отличная новость — серьёзных барьеров не нашли',
    instead: 'Вместо «{a}» удобнее: **{b}** (~{d} м).',
    quick: ['Куда можно на коляске?', 'Где погулять с детской коляской?', 'Удобные места для пожилых', 'Какие места лучше обойти?', 'Какая остановка удобная?', 'Как оставить отзыв?'],
    fTop: 'Версия для слабовидящих · КЫР | РУС | ENG', fLogo: 'Городской портал',
    fNav: '<a>Главная</a><a>Новости</a><a>Услуги</a><a>Контакты</a>',
    fH1: 'Добро пожаловать на городской портал', fP: 'Информация о городской инфраструктуре, транспорте и общественных местах.',
    fC1t: 'Новости', fC1p: 'Плановые работы на остановках общественного транспорта.',
    fC2t: 'Приём граждан', fC2p: 'Только лично, 3 этаж. Лифта нет.',
    fC3t: 'Доступная среда', fC3p: 'Раздел находится в разработке… с 2015 года.',
    fAlert: 'Обнаружено вмешательство в систему…', fFooter: '© 2026 Городской портал. Все права защищены.',
    term: ['> подключение к городскому порталу... OK', '> проверка: удобен ли город для всех людей...', '> найдено барьеров: {n}',
      '!> пандусы на входах: НЕ НАЙДЕНО', '!> доступ для колясок: ОТКАЗАНО', '!> вердикт: сайт ПЛОХОЙ — он забыл про людей', '> взлом системы... ██████████ 100%'],
    hackSub: 'Этот сайт взломан, потому что он был <b class="hack__bad">плохим</b>.',
    hackWhy: 'Он не замечал тех, кому трудно ходить по городу: людей на колясках, пожилых и мам с колясками. Мы это исправили — теперь город <b>для всех</b>.',
    skip: 'Пропустить', hackBtn: 'Следующий слайд ›'
  },

  ky: {
    pageTitle: 'Infranalysis — жеткиликтүүлүк картасы', dateLocale: 'ky-KG', brand: 'Infranalysis',
    months: ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'],
    statPoints: 'жер', statIssues: 'көйгөй', statComments: 'пикир', intro: 'Интро',
    sideToggle: 'Чыпкалар жана тизме', show: 'Эмнени көрсөтүү', barrierFor: 'Тоскоолдук кимге', legend: 'Белгилер', places: 'Жерлер',
    all: 'Баары', empty: 'Эч нерсе табылган жок — чыпкаларды күйгүзүңүз', problemsN: 'көйгөй: {n}', groupToast: 'Картаны көрсөтөм: {g}',
    photoSoon: 'Сүрөт текшерүүдөн кийин кошулат', openMaps: 'Картада ачуу', checked: 'Текшерилди: {d}',
    wrong: 'Эмне тоскоол', goodTitle: 'Эмнеси жакшы', accessibleAll: 'Баарына ыңгайлуу', tip: 'Кеңеш',
    reviews: 'Тургундардын пикирлери', noReviews: 'Азырынча пикир жок — биринчи болуңуз!', yourName: 'Атыңыз',
    reviewPh: 'Айтып бериңиз: эмне ыңгайлуу, эмне тоскоол, эмне өзгөрдү…', sendReview: 'Пикир жөнөтүү',
    demoNote: 'Демо-версия: пикирлер ушул браузерде сакталат.', fillForm: 'Атыңызды жана пикириңизди жазыңыз', thanksToast: 'Рахмат! Пикир кошулду',
    botName: 'ЖИ-жардамчы', botFab: 'ЖИден сура', botPh: 'Мисалы: бала арабасы менен кайда барсам болот?',
    botAi: 'Claude негизиндеги ЖИ · онлайн', botLocal: 'карта маалыматы боюнча жооп берет', offlineNote: '(ЖИ-сервер жеткиликсиз — карта маалыматы боюнча жооп берем)',
    welcome: 'Салам! Мен «Infranalysis» картасынын ЖИ-жардамчысымын\nКим барат (майыптар арабачасында, бала арабасы менен, улгайган адам) жана кайда барыш керек — айтыңыз. Кайсы жерге ыңгайлуу барса болорун жана кайсы жерди айланып өтүү керектигин айтып берем.',
    greet: 'Саламатсызбы! Ким барат жана кайда барыш керек — айтыңыз, ыңгайлуу жолду сунуштайм.',
    howto: 'Абдан жөнөкөй\n1. Картадагы белгини (же тизмедеги жерди) басыңыз.\n2. Карточканын ылдый жагында — «Тургундардын пикирлери».\n3. Пикирдин түрүн тандап, жазып, жөнөтүңүз.\nМисалы: «Акыры пандус салынды!»',
    about: 'Биз — волонтёрлор командасыбыз. Аялдамаларды, парктарды, мамлекеттик имараттарды жана коомдук жерлерди кыдырып, тоскоолдуктарды сүрөткө тарттык: бийик бордюрлар, пандуссуз тепкичтер, тар каалгалар. Мунун баары — картада, даректери, сүрөттөрү жана тургундардын пикирлери менен.',
    thanks: 'Эч нерсе эмес! Жолуңуз ачык болсун Өзгөрүү байкасаңыз — картага пикир калтырыңыз.',
    fallback: 'Мен картадагы жерлер тууралуу суроолорду жакшы түшүнөм Мисалы:\n• «Майыптар арабачасы менен кайда барса болот?»\n• «Бала арабасы менен кайда сейилдесе болот?»\n• «Поликлиника улгайгандарга ыңгайлуубу?»\n• «Кайсы жерлерди айланып өтүү керек?»',
    who: { wheelchair: 'майыптар арабачасында', elderly: 'улгайгандар үчүн', stroller: 'бала арабасы менен', all: 'баары үчүн' },
    placeLine: '**{title}** — {status}.', placeLineWho: '**{title}** — {status} ({who}).',
    wrongLine: 'Эмне тоскоол: {list}.', goodLine: 'Эмнеси жакшы: {list}.', altLine: 'Жакын жердеги ыңгайлуу вариант: **{title}** (~{d} м).',
    goodHead: 'Ыңгайлуу жерлер ({who})', noGood: 'Толук ыңгайлуу жерлер ({who}) азырынча жок', midHead: 'Болот, бирок этият болуңуз:',
    askWho: 'Ким барат — айтыңыз (майыптар арабачасында, бала арабасы менен, улгайган адам), тагыраак сунуштайм.',
    recolored: 'Картаны кайра боёдум: жашыл белгилер — ыңгайлуу ({who}).',
    badHead: 'Бул жерлерди айланып өтүңүз же алдын ала даярданыңыз ({who}):', noBad: 'Жакшы кабар — олуттуу тоскоолдук табылган жок',
    instead: '«{a}» ордуна ыңгайлуураак: **{b}** (~{d} м).',
    quick: ['Майыптар арабачасы менен кайда барса болот?', 'Бала арабасы менен кайда сейилдейм?', 'Улгайгандарга ыңгайлуу жерлер', 'Кайсы жерлерди айланып өтүү керек?', 'Кайсы аялдама ыңгайлуу?', 'Пикирди кантип калтырам?'],
    fTop: 'Көзү начарлар үчүн версия · КЫР | РУС | ENG', fLogo: 'Шаардык портал',
    fNav: '<a>Башкы бет</a><a>Жаңылыктар</a><a>Кызматтар</a><a>Байланыш</a>',
    fH1: 'Шаардык порталга кош келиңиз', fP: 'Шаардын инфраструктурасы, транспорту жана коомдук жайлары тууралуу маалымат.',
    fC1t: 'Жаңылыктар', fC1p: 'Коомдук транспорт аялдамаларында пландуу иштер.',
    fC2t: 'Жарандарды кабыл алуу', fC2p: 'Жеке гана, 3-кабат. Лифт жок.',
    fC3t: 'Жеткиликтүү чөйрө', fC3p: 'Бөлүм иштелип жатат… 2015-жылдан бери.',
    fAlert: 'Системага кийлигишүү аныкталды…', fFooter: '© 2026 Шаардык портал. Бардык укуктар корголгон.',
    term: ['> шаардык порталга туташуу... OK', '> текшерүү: шаар бардык адамдарга ыңгайлуубу...', '> тоскоолдук табылды: {n}',
      '!> кире бериштеги пандустар: ТАБЫЛГАН ЖОК', '!> арабачалар үчүн кирүү: ЧЕТКЕ КАГЫЛДЫ', '!> өкүм: сайт ЖАМАН — ал адамдарды унуткан', '> системаны бузуу... ██████████ 100%'],
    hackSub: 'Бул сайт бузулду, анткени ал <b class="hack__bad">жаман</b> болчу.',
    hackWhy: 'Ал шаарда жүрүү кыйын болгондорду байкаган эмес: майыптар арабачасындагыларды, улгайгандарды жана бала арабасы менен жүргөн апаларды. Биз муну оңдодук — эми шаар <b>баары үчүн</b>.',
    skip: 'Өткөрүп жиберүү', hackBtn: 'Кийинки слайд ›'
  },

  en: {
    pageTitle: 'Infranalysis — accessibility map', dateLocale: 'en-GB', brand: 'Infranalysis',
    statPoints: 'places', statIssues: 'problems', statComments: 'reviews', intro: 'Intro',
    sideToggle: 'Filters & list', show: 'Show', barrierFor: 'Barrier for', legend: 'Legend', places: 'Places',
    all: 'Everyone', empty: 'Nothing found — turn on some filters', problemsN: 'problems: {n}', groupToast: 'Showing the map for: {g}',
    photoSoon: 'Photo coming after the survey', openMaps: 'Open in maps', checked: 'Checked: {d}',
    wrong: 'What’s in the way', goodTitle: 'What’s good', accessibleAll: 'Accessible for everyone', tip: 'Tip',
    reviews: 'Residents’ reviews', noReviews: 'No reviews yet — be the first!', yourName: 'Your name',
    reviewPh: 'Tell us: what works, what’s in the way, what changed…', sendReview: 'Send review',
    demoNote: 'Demo: reviews are saved in this browser.', fillForm: 'Please enter your name and review', thanksToast: 'Thank you! Review added',
    botName: 'AI assistant', botFab: 'Ask AI', botPh: 'e.g. where can I go with a stroller?',
    botAi: 'Claude AI · online', botLocal: 'answers from map data', offlineNote: '(AI server unavailable — answering from map data)',
    welcome: 'Hi! I’m the AI assistant of the Infranalysis map\nTell me who is going (wheelchair, stroller, elderly person) and where — I’ll suggest places that are easy to reach and places better avoided.',
    greet: 'Hello! Tell me who is going and where, and I’ll suggest an accessible route.',
    howto: 'Easy\n1. Tap a pin on the map (or a place in the list).\n2. At the bottom of the card — “Residents’ reviews”.\n3. Choose the review type, write it and send.\nFor example: “They finally built a ramp!”',
    about: 'We are a team of volunteers. We walked around bus stops, parks, government buildings and public places and photographed the barriers: high curbs, steps without ramps, narrow gates. It’s all on the map with addresses, photos and residents’ reviews.',
    thanks: 'You’re welcome! Have a good trip If you notice changes, leave a review on the map.',
    fallback: 'I understand questions about places on the map best For example:\n• “Where can I go in a wheelchair?”\n• “Where can I walk with a stroller?”\n• “Is the clinic OK for elderly people?”\n• “Which places should I avoid?”',
    who: { wheelchair: 'for wheelchair users', elderly: 'for elderly people', stroller: 'with a stroller', all: 'for everyone' },
    placeLine: '**{title}** — {status}.', placeLineWho: '**{title}** — {status} ({who}).',
    wrongLine: 'What’s in the way: {list}.', goodLine: 'What’s good: {list}.', altLine: 'Accessible alternative nearby: **{title}** (~{d} m).',
    goodHead: 'Accessible places ({who})', noGood: 'No fully accessible places ({who}) yet', midHead: 'Possible, but be careful:',
    askWho: 'Tell me who is going (wheelchair, stroller, elderly person) and I’ll be more precise.',
    recolored: 'I recoloured the map: green pins are accessible ({who}).',
    badHead: 'Better avoid these places or prepare in advance ({who}):', noBad: 'Good news — no serious barriers found',
    instead: 'Instead of “{a}”, try: **{b}** (~{d} m).',
    quick: ['Where can I go in a wheelchair?', 'Where can I walk with a stroller?', 'Places good for elderly people', 'Which places should I avoid?', 'Which bus stop is accessible?', 'How do I leave a review?'],
    fTop: 'Version for the visually impaired · КЫР | РУС | ENG', fLogo: 'City Portal',
    fNav: '<a>Home</a><a>News</a><a>Services</a><a>Contacts</a>',
    fH1: 'Welcome to the city portal', fP: 'Information about city infrastructure, transport and public places.',
    fC1t: 'News', fC1p: 'Scheduled works at public transport stops.',
    fC2t: 'Citizen reception', fC2p: 'In person only, 3rd floor. No elevator.',
    fC3t: 'Accessible environment', fC3p: 'Section under development… since 2015.',
    fAlert: 'System intrusion detected…', fFooter: '© 2026 City Portal. All rights reserved.',
    term: ['> connecting to the city portal... OK', '> checking: is the city comfortable for everyone...', '> barriers found: {n}',
      '!> ramps at entrances: NOT FOUND', '!> wheelchair access: DENIED', '!> verdict: the site is BAD — it forgot about people', '> hacking the system... ██████████ 100%'],
    hackSub: 'This site was hacked because it was <b class="hack__bad">bad</b>.',
    hackWhy: 'It ignored the people who find it hard to get around the city: wheelchair users, elderly people and parents with strollers. We fixed that — now the city is <b>for everyone</b>.',
    skip: 'Skip', hackBtn: 'Next slide ›'
  }
};

/* ---------- Движок переводов ---------- */
(function () {
  var lang = 'ru';
  try { lang = localStorage.getItem('bb-lang') || 'ru'; } catch (e) { /* без хранилища — русский */ }
  var m = location.search.match(/[?&]lang=(ru|ky|en)\b/);
  if (m) lang = m[1];
  if (!window.I18N[lang]) lang = 'ru';

  var BBI = window.BBI = {
    lang: function () { return lang; },
    raw: function (key) { var d = window.I18N[lang]; return d[key] !== undefined ? d[key] : window.I18N.ru[key]; },
    t: function (key, vars) {
      var s = BBI.raw(key);
      if (typeof s !== 'string') return s === undefined ? key : s;
      return vars ? s.replace(/\{(\w+)\}/g, function (_, k) { return vars[k] !== undefined ? vars[k] : ''; }) : s;
    },
    /* Текст из данных: {ru:'…', ky:'…', en:'…'} нужный язык (или русский, если перевода нет) */
    T: function (v) {
      if (v && typeof v === 'object' && !Array.isArray(v)) return v[lang] !== undefined ? v[lang] : v.ru;
      return v;
    },
    apply: function () {
      document.documentElement.lang = lang;
      document.title = BBI.t('pageTitle');
      document.querySelectorAll('[data-i18n]').forEach(function (el) { el.innerHTML = BBI.t(el.getAttribute('data-i18n')); });
      document.querySelectorAll('[data-i18n-ph]').forEach(function (el) { el.placeholder = BBI.t(el.getAttribute('data-i18n-ph')); });
    },
    set: function (l) {
      if (!window.I18N[l]) return;
      lang = l;
      try { localStorage.setItem('bb-lang', l); } catch (e) { /* ок */ }
      BBI.apply();
      document.dispatchEvent(new CustomEvent('bb:lang', { detail: l }));
    }
  };
  document.addEventListener('DOMContentLoaded', BBI.apply);
})();
