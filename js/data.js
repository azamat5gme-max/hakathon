/* =====================================================================
   ДАННЫЕ КАРТЫ — всё, что нужно поменять, находится в этом файле.

   Текст можно писать на трёх языках:  { ru: '…', ky: '…', en: '…' }
   или просто строкой на одном языке — тогда он покажется во всех языках.

   1) CITY.center — координаты центра района (сейчас площадь Ала-Тоо).
   2) LOCATIONS — точки. Пока стоят ПРИМЕРЫ. Для каждой реальной точки:
      - latlng: [широта, долгота]  (правый клик в 2GIS / Google Maps → копировать координаты)
        или offset: [метров на север, метров на восток] от центра
      - photo: 'photos/имя-файла.jpg' (положите фото в папку photos)
      - status: 'bad' | 'mid' | 'good'
      - affects: кому мешает — 'wheelchair', 'elderly', 'stroller'
   ===================================================================== */

window.CITY = {
  name: { ru: 'Бишкек', ky: 'Бишкек', en: 'Bishkek' },
  district: { ru: 'Центр города', ky: 'Шаардын борбору', en: 'City centre' },
  center: [42.8765, 74.6035], // площадь Ала-Тоо
  zoom: 15
};

window.CATEGORIES = {
  bus:    { icon: '🚌', label: { ru: 'Остановки', ky: 'Аялдамалар', en: 'Bus stops' } },
  park:   { icon: '🌳', label: { ru: 'Парки и дворы', ky: 'Парктар, короолор', en: 'Parks & yards' } },
  gov:    { icon: '🏛️', label: { ru: 'Гос. здания', ky: 'Мамл. имараттар', en: 'Gov. buildings' } },
  public: { icon: '🏬', label: { ru: 'Общ. места', ky: 'Коомдук жайлар', en: 'Public places' } }
};

window.GROUPS = {
  wheelchair: { icon: '♿', label: { ru: 'Колясочники', ky: 'Арабачадагылар', en: 'Wheelchair users' } },
  elderly:    { icon: '🧓', label: { ru: 'Пожилые', ky: 'Улгайгандар', en: 'Elderly' } },
  stroller:   { icon: '👶', label: { ru: 'Мамы с колясками', ky: 'Бала арабалуу апалар', en: 'Parents with strollers' } }
};

window.STATUS = {
  bad:  { color: '#ff4d6d', label: { ru: 'Недоступно', ky: 'Жеткиликсиз', en: 'Not accessible' } },
  mid:  { color: '#ffb020', label: { ru: 'Есть трудности', ky: 'Кыйынчылыктар бар', en: 'Some difficulties' } },
  good: { color: '#2ee6a6', label: { ru: 'Доступно', ky: 'Жеткиликтүү', en: 'Accessible' } }
};

window.COMMENT_TYPES = {
  experience: { ru: 'Мой опыт', ky: 'Менин тажрыйбам', en: 'My experience' },
  change:     { ru: 'Что-то изменилось', ky: 'Бир нерсе өзгөрдү', en: 'Something changed' },
  problem:    { ru: 'Новая проблема', ky: 'Жаңы көйгөй', en: 'New problem' }
};

window.LOCATIONS = [
  {
    id: 'stop-market', category: 'bus', status: 'bad', offset: [160, -430], photo: '',
    title: { ru: 'Остановка «Центральный рынок»', ky: '«Борбордук базар» аялдамасы', en: '“Central Market” bus stop' },
    address: { ru: 'ул. Примерная, 12 (пример)', ky: 'Мисал көч., 12 (мисал)', en: '12 Example St. (example)' },
    issues: {
      ru: ['Высокий бордюр ~25 см — нет съезда', 'Нет навеса и скамейки', 'Яма у посадочной площадки'],
      ky: ['Бийик бордюр ~25 см — түшүүчү жол жок', 'Күнкалкан жана отургуч жок', 'Отуруу аянтчасынын жанында чуңкур'],
      en: ['High curb ~25 cm — no curb ramp', 'No shelter and no bench', 'Pothole by the boarding area']
    },
    good: [],
    affects: ['wheelchair', 'stroller', 'elderly'],
    tip: {
      ru: 'Удобнее сесть на остановке «Поликлиника» — там низкий бордюр и навес.',
      ky: '«Поликлиника» аялдамасынан отуруу ыңгайлуураак — бордюр жапыз жана күнкалкан бар.',
      en: 'It’s easier to board at the “Clinic” stop — low curb and a shelter there.'
    },
    checked: '2026-11-10',
    comments: [
      { name: 'Анна', type: 'experience', date: '2026-11-11', text: 'С коляской приходится просить прохожих помочь поднять её на бордюр.' },
      { name: 'Пётр Иванович', type: 'problem', date: '2026-11-13', text: 'Сесть негде, а автобус ждать по 20 минут.' }
    ]
  },
  {
    id: 'stop-school', category: 'bus', status: 'mid', offset: [-280, 190], photo: '',
    title: { ru: 'Остановка «Школа №5»', ky: '«№5 мектеп» аялдамасы', en: '“School No. 5” bus stop' },
    address: { ru: 'пр. Победы, 40 (пример)', ky: 'Жеңиш пр., 40 (мисал)', en: '40 Victory Ave. (example)' },
    issues: {
      ru: ['Узкий тротуар у остановки (меньше 1 м)', 'Нет тактильной плитки'],
      ky: ['Аялдаманын жанындагы тротуар тар (1 мден аз)', 'Тактилдик плитка жок'],
      en: ['Narrow sidewalk at the stop (under 1 m)', 'No tactile paving']
    },
    good: { ru: ['Есть навес и скамейка'], ky: ['Күнкалкан жана отургуч бар'], en: ['Has a shelter and a bench'] },
    affects: ['wheelchair', 'stroller'],
    checked: '2026-11-10',
    comments: [
      { name: 'Марат', type: 'experience', date: '2026-11-12', text: 'Коляска еле проходит, если на остановке стоят люди.' }
    ]
  },
  {
    id: 'stop-clinic', category: 'bus', status: 'good', offset: [390, 310], photo: '',
    title: { ru: 'Остановка «Поликлиника»', ky: '«Поликлиника» аялдамасы', en: '“Clinic” bus stop' },
    address: { ru: 'ул. Садовая, 3 (пример)', ky: 'Бак көч., 3 (мисал)', en: '3 Garden St. (example)' },
    issues: [],
    good: {
      ru: ['Низкий бордюр — легко заехать', 'Навес и скамейка', 'Ровный асфальт'],
      ky: ['Бордюр жапыз — кирүү оңой', 'Күнкалкан жана отургуч', 'Тегиз асфальт'],
      en: ['Low curb — easy to roll on', 'Shelter and bench', 'Smooth asphalt']
    },
    affects: [],
    checked: '2026-11-11',
    comments: [
      { name: 'Ирина', type: 'change', date: '2026-11-14', text: 'Летом положили новый асфальт — стало очень удобно!' }
    ]
  },
  {
    id: 'park-central', category: 'park', status: 'mid', offset: [-60, -150], photo: '',
    title: { ru: 'Центральный парк — вход с ул. Примерной', ky: 'Борбордук парк — Мисал көчөсүнөн кирүү', en: 'Central Park — Example St. entrance' },
    address: { ru: 'ул. Примерная, 1 (пример)', ky: 'Мисал көч., 1 (мисал)', en: '1 Example St. (example)' },
    issues: {
      ru: ['На входе только ступеньки, пандус — у дальнего входа', 'Гравийные дорожки — колёса вязнут'],
      ky: ['Кире бериште тепкичтер гана, пандус — алыскы кире бериште', 'Шагыл жолдор — дөңгөлөктөр батып калат'],
      en: ['Only steps at this entrance; the ramp is at the far entrance', 'Gravel paths — wheels get stuck']
    },
    good: { ru: ['Много скамеек в тени'], ky: ['Көлөкөдө отургучтар көп'], en: ['Lots of benches in the shade'] },
    affects: ['wheelchair', 'stroller'],
    tip: {
      ru: 'Заходите с южного входа (ул. Садовая) — там пандус.',
      ky: 'Түштүк кире бериштен (Бак көч.) кириңиз — ал жерде пандус бар.',
      en: 'Use the south entrance (Garden St.) — it has a ramp.'
    },
    checked: '2026-11-09',
    comments: [
      { name: 'Айжан', type: 'experience', date: '2026-11-10', text: 'Бала арабасы менен борбордук аллея менен гана басабыз, калганы шагыл.' }
    ]
  },
  {
    id: 'park-yard', category: 'park', status: 'bad', offset: [520, -180], photo: '',
    title: { ru: 'Детская площадка во дворе', ky: 'Короодогу балдар аянтчасы', en: 'Playground in the courtyard' },
    address: { ru: 'ул. Лесная, 15, во дворе (пример)', ky: 'Токой көч., 15, короодо (мисал)', en: '15 Forest St., courtyard (example)' },
    issues: {
      ru: ['Нет съезда с тротуара', 'Калитка узкая (~60 см) — коляска не проходит', 'Нет скамеек для родителей'],
      ky: ['Тротуардан түшүүчү жол жок', 'Каалга тар (~60 см) — бала арабасы өтпөйт', 'Ата-энелер үчүн отургуч жок'],
      en: ['No curb ramp from the sidewalk', 'Narrow gate (~60 cm) — strollers don’t fit', 'No benches for parents']
    },
    good: [],
    affects: ['wheelchair', 'stroller', 'elderly'],
    checked: '2026-11-12',
    comments: []
  },
  {
    id: 'gov-admin', category: 'gov', status: 'bad', offset: [40, 120], photo: '',
    title: { ru: 'Районная администрация', ky: 'Райондук администрация', en: 'District administration' },
    address: { ru: 'пл. Центральная, 1 (пример)', ky: 'Борбордук аянт, 1 (мисал)', en: '1 Central Sq. (example)' },
    issues: {
      ru: ['Только лестница — 12 ступеней, пандуса нет', 'Нет кнопки вызова персонала', 'Тяжёлая входная дверь'],
      ky: ['Тепкичтер гана — 12 тепкич, пандус жок', 'Кызматкерди чакыруу баскычы жок', 'Кире бериш эшик оор'],
      en: ['Stairs only — 12 steps, no ramp', 'No call button for staff', 'Heavy entrance door']
    },
    good: [],
    affects: ['wheelchair', 'elderly', 'stroller'],
    tip: {
      ru: 'Многие услуги можно получить в Центре госуслуг — там всё доступно.',
      ky: 'Көп кызматтарды Мамлекеттик кызматтар борборунан алса болот — ал жерде баары жеткиликтүү.',
      en: 'Many services are available at the Public Services Center — it’s fully accessible.'
    },
    checked: '2026-11-10',
    comments: [
      { name: 'Сергей', type: 'experience', date: '2026-11-11', text: 'Пришлось ждать на улице, пока сотрудник спустится ко мне.' },
      { name: 'Гульнара', type: 'problem', date: '2026-11-15', text: 'Кышында тепкичтер тайгак, тутка бир гана тарапта.' }
    ]
  },
  {
    id: 'gov-services', category: 'gov', status: 'good', offset: [260, 520], photo: '',
    title: { ru: 'Центр госуслуг', ky: 'Мамлекеттик кызматтар борбору', en: 'Public Services Center' },
    address: { ru: 'ул. Садовая, 21 (пример)', ky: 'Бак көч., 21 (мисал)', en: '21 Garden St. (example)' },
    issues: [],
    good: {
      ru: ['Пандус с поручнями', 'Автоматическая дверь', 'Электронная очередь со звуковым сигналом', 'Туалет для маломобильных'],
      ky: ['Туткасы бар пандус', 'Автоматтык эшик', 'Үн сигналы бар электрондук кезек', 'Мүмкүнчүлүгү чектелгендер үчүн даараткана'],
      en: ['Ramp with handrails', 'Automatic door', 'Electronic queue with sound signal', 'Accessible toilet']
    },
    affects: [],
    checked: '2026-11-11',
    comments: [
      { name: 'Елена', type: 'experience', date: '2026-11-12', text: 'Всё удобно, сотрудники помогают. Пример для других зданий!' }
    ]
  },
  {
    id: 'gov-clinic', category: 'gov', status: 'mid', offset: [430, 360], photo: '',
    title: { ru: 'Поликлиника №3', ky: '№3 поликлиника', en: 'Clinic No. 3' },
    address: { ru: 'ул. Садовая, 5 (пример)', ky: 'Бак көч., 5 (мисал)', en: '5 Garden St. (example)' },
    issues: {
      ru: ['Пандус слишком крутой (~15°)', 'Поручень только с одной стороны'],
      ky: ['Пандус өтө тик (~15°)', 'Тутка бир гана тарапта'],
      en: ['Ramp too steep (~15°)', 'Handrail on one side only']
    },
    good: { ru: ['Есть лифт внутри'], ky: ['Ичинде лифт бар'], en: ['Elevator inside'] },
    affects: ['wheelchair', 'elderly'],
    checked: '2026-11-11',
    comments: [
      { name: 'Валентина', type: 'experience', date: '2026-11-13', text: 'Сама по пандусу не заеду — слишком круто.' }
    ]
  },
  {
    id: 'pub-underpass', category: 'public', status: 'bad', offset: [210, -330], photo: '',
    title: { ru: 'Подземный переход у рынка', ky: 'Базардын жанындагы жер алдындагы өтмөк', en: 'Underpass by the market' },
    address: { ru: 'перекрёсток ул. Примерной и пр. Победы (пример)', ky: 'Мисал көч. менен Жеңиш пр. кесилиши (мисал)', en: 'Example St. & Victory Ave. crossing (example)' },
    issues: {
      ru: ['Только лестница — нет лифта или подъёмника', 'Нет поручня посередине', 'Плохое освещение вечером'],
      ky: ['Тепкич гана — лифт же көтөргүч жок', 'Ортосунда тутка жок', 'Кечинде жарык начар'],
      en: ['Stairs only — no lift or elevator', 'No handrail in the middle', 'Poor lighting in the evening']
    },
    good: [],
    affects: ['wheelchair', 'stroller', 'elderly'],
    tip: {
      ru: 'Наземный переход со светофором есть в 150 м — у остановки «Школа №5».',
      ky: 'Светофору бар жер үстүндөгү өтмөк 150 м алыстыкта — «№5 мектеп» аялдамасынын жанында.',
      en: 'There’s a street-level crossing with traffic lights 150 m away — by the “School No. 5” stop.'
    },
    checked: '2026-11-10',
    comments: [
      { name: 'Дина', type: 'experience', date: '2026-11-11', text: 'Каждый раз несём коляску вдвоём. Очень нужен подъёмник.' }
    ]
  },
  {
    id: 'pub-mall', category: 'public', status: 'good', offset: [-380, -360], photo: '',
    title: { ru: 'Торговый центр «Сити»', ky: '«Сити» соода борбору', en: '“City” shopping mall' },
    address: { ru: 'пр. Победы, 77 (пример)', ky: 'Жеңиш пр., 77 (мисал)', en: '77 Victory Ave. (example)' },
    issues: [],
    good: {
      ru: ['Лифт и эскалаторы', 'Широкие автоматические двери', 'Комната матери и ребёнка'],
      ky: ['Лифт жана эскалаторлор', 'Кенен автоматтык эшиктер', 'Эне менен баланын бөлмөсү'],
      en: ['Elevator and escalators', 'Wide automatic doors', 'Mother and baby room']
    },
    affects: [],
    checked: '2026-11-09',
    comments: []
  },
  {
    id: 'pub-post', category: 'public', status: 'mid', offset: [-200, 430], photo: '',
    title: { ru: 'Почтовое отделение', ky: 'Почта бөлүмү', en: 'Post office' },
    address: { ru: 'ул. Лесная, 8 (пример)', ky: 'Токой көч., 8 (мисал)', en: '8 Forest St. (example)' },
    issues: {
      ru: ['Крыльцо 3 ступени, пандус есть, но часто заставлен'],
      ky: ['Кире бериште 3 тепкич, пандус бар, бирок көбүнчө тосулуп калат'],
      en: ['3 steps at the entrance; there is a ramp, but it’s often blocked']
    },
    good: { ru: ['Внутри всё на одном уровне'], ky: ['Ичинде баары бир деңгээлде'], en: ['Everything inside is on one level'] },
    affects: ['wheelchair', 'stroller'],
    checked: '2026-11-12',
    comments: [
      { name: 'Тимур', type: 'change', date: '2026-11-16', text: 'Бүгүн пандус бош болду — кызматкерлерден ал жерге куту койбоону сурандым.' }
    ]
  },
  {
    id: 'pub-pharmacy', category: 'public', status: 'mid', offset: [-430, 40], photo: '',
    title: { ru: 'Аптека «Здоровье»', ky: '«Ден соолук» дарыканасы', en: '“Health” pharmacy' },
    address: { ru: 'пр. Победы, 52 (пример)', ky: 'Жеңиш пр., 52 (мисал)', en: '52 Victory Ave. (example)' },
    issues: {
      ru: ['Высокая ступень на входе', 'Нет кнопки вызова персонала'],
      ky: ['Кире бериште бийик тепкич', 'Кызматкерди чакыруу баскычы жок'],
      en: ['High step at the entrance', 'No call button for staff']
    },
    good: [],
    affects: ['wheelchair', 'elderly'],
    checked: '2026-11-12',
    comments: []
  }
];

/* Координаты точки: latlng, если указан, иначе считаем из offset (метры от центра). */
window.BB_latlng = function (loc) {
  if (loc.latlng) return loc.latlng;
  var c = window.CITY.center, o = loc.offset || [0, 0];
  var lat = c[0] + o[0] / 111320;
  var lng = c[1] + o[1] / (111320 * Math.cos(c[0] * Math.PI / 180));
  return [lat, lng];
};
