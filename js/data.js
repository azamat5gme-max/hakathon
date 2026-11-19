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
  bus:    { icon: 'bus', label: { ru: 'Остановки', ky: 'Аялдамалар', en: 'Bus stops' } },
  park:   { icon: 'trees', label: { ru: 'Парки и дворы', ky: 'Парктар, короолор', en: 'Parks & yards' } },
  gov:    { icon: 'building-bank', label: { ru: 'Гос. здания', ky: 'Мамл. имараттар', en: 'Gov. buildings' } },
  public: { icon: 'building-store', label: { ru: 'Общ. места', ky: 'Коомдук жайлар', en: 'Public places' } }
};

window.GROUPS = {
  wheelchair: { icon: 'wheelchair', label: { ru: 'Колясочники', ky: 'Арабачадагылар', en: 'Wheelchair users' } },
  elderly:    { icon: 'old', label: { ru: 'Пожилые', ky: 'Улгайгандар', en: 'Elderly' } },
  stroller:   { icon: 'baby-carriage', label: { ru: 'Мамы с колясками', ky: 'Бала арабалуу апалар', en: 'Parents with strollers' } }
};

window.STATUS = {
  bad:  { color: '#dc2626', label: { ru: 'Недоступно', ky: 'Жеткиликсиз', en: 'Not accessible' } },
  mid:  { color: '#d97706', label: { ru: 'Есть трудности', ky: 'Кыйынчылыктар бар', en: 'Some difficulties' } },
  good: { color: '#16a34a', label: { ru: 'Доступно', ky: 'Жеткиликтүү', en: 'Accessible' } }
};

window.COMMENT_TYPES = {
  experience: { ru: 'Мой опыт', ky: 'Менин тажрыйбам', en: 'My experience' },
  change:     { ru: 'Что-то изменилось', ky: 'Бир нерсе өзгөрдү', en: 'Something changed' },
  problem:    { ru: 'Новая проблема', ky: 'Жаңы көйгөй', en: 'New problem' }
};

window.LOCATIONS = [
  /* Здесь будут ваши точки. Образец — скопируйте блок ниже (без этих комментариев), вставьте и заполните.
     Текст можно писать одним языком (title: 'Остановка …') или тремя: { ru: '…', ky: '…', en: '…' }.
     А можно ставить метки прямо на сайте — кнопкой «+ Сообщить о барьере».

  {
    id: 'stop-1', category: 'bus', status: 'bad', problems: ['noRamp', 'highCurb'],
    latlng: [42.8765, 74.6035], photo: 'photos/stop-1.jpg',
    title: { ru: 'Остановка «…»', ky: '«…» аялдамасы', en: '“…” bus stop' },
    address: { ru: 'ул. …, 1', ky: '… көч., 1', en: '1 … St.' },
    issues: { ru: ['Высокий бордюр — нет съезда'], ky: ['Бийик бордюр — түшүүчү жол жок'], en: ['High curb — no curb ramp'] },
    good: [],
    affects: ['wheelchair', 'stroller', 'elderly'],
    tip: { ru: '…', ky: '…', en: '…' },
    checked: '2026-11-18',
    comments: []
  },
  */
];

/* Координаты точки: latlng, если указан, иначе считаем из offset (метры от центра). */
window.BB_latlng = function (loc) {
  if (loc.latlng) return loc.latlng;
  var c = window.CITY.center, o = loc.offset || [0, 0];
  var lat = c[0] + o[0] / 111320;
  var lng = c[1] + o[1] / (111320 * Math.cos(c[0] * Math.PI / 180));
  return [lat, lng];
};

/* Типы проблем — по ним считается статистика сообщений и работает фильтр «показать на карте».
   В точках выше: problems: ['noRamp', 'highCurb', …] */
window.PROBLEMS = {
  noRamp:     { icon: 'wheelchair-off', label: { ru: 'Нет пандуса / съезда', ky: 'Пандус / түшүүчү жол жок', en: 'No ramp' } },
  steepRamp:  { icon: 'trending-up', label: { ru: 'Слишком крутой пандус', ky: 'Пандус өтө тик', en: 'Ramp too steep' } },
  highCurb:   { icon: 'arrow-bar-to-up', label: { ru: 'Высокий бордюр', ky: 'Бийик бордюр', en: 'High curb' } },
  stairsOnly: { icon: 'stairs', label: { ru: 'Только лестница', ky: 'Тепкич гана', en: 'Stairs only' } },
  narrow:     { icon: 'arrows-horizontal', label: { ru: 'Узкий проход / дверь', ky: 'Тар өтмөк / эшик', en: 'Narrow path / door' } },
  badSurface: { icon: 'road-off', label: { ru: 'Ямы, плохое покрытие', ky: 'Чуңкурлар, начар жол', en: 'Potholes, bad surface' } },
  noHandrail: { icon: 'hand-off', label: { ru: 'Нет поручней', ky: 'Тутка жок', en: 'No handrails' } },
  noBench:    { icon: 'armchair-off', label: { ru: 'Нет скамейки / навеса', ky: 'Отургуч / күнкалкан жок', en: 'No bench / shelter' } },
  noLight:    { icon: 'bulb-off', label: { ru: 'Плохое освещение', ky: 'Жарык начар', en: 'Poor lighting' } },
  blocked:    { icon: 'barrier-block', label: { ru: 'Проход заставлен', ky: 'Жол тосулган', en: 'Path blocked' } },
  other:      { icon: 'dots-circle-horizontal', label: { ru: 'Другое', ky: 'Башка', en: 'Other' } }
};
