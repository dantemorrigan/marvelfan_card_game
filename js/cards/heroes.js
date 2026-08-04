/*
cards/heroes.js

Данные карт-героев (DATA). Только данные: имя, характеристики,
стоимость, арт, теги. Никакой игровой логики — она в battle/*.
*/
const DATA = [
  // --- Мстители и союзники, Земля-616 ---
  { name: "Человек\u2011Паук", sub: "с Земли 616", s: [3, 5, 5, 4], cost: 7, art: "center/cover no-repeat url('./assets/spiderman.png')" },
  { name: "Капитан Америка", sub: "с Земли 616", s: [3, 4, 4, 5], cost: 6, art: "center/cover no-repeat url('./assets/captain616.jpg')" },
  { name: "Железный Человек", sub: "с Земли 616", s: [4, 3, 5, 5], cost: 7, art: "center/cover no-repeat url('./assets/ironman616.jpg')" },
  { name: "Тор", sub: "с Земли 616", s: [5, 3, 3, 4], cost: 5, art: "center/cover no-repeat url('./assets/thor616.jpg')" },
  { name: "Халк", sub: "с Земли 616", s: [5, 2, 3, 2], cost: 2, art: "center/cover no-repeat url('./assets/hulk616.jpg')" },
  { name: "Черная Вдова", sub: "с Земли 616", s: [2, 5, 4, 5], cost: 6, art: "center/cover no-repeat url('./assets/blackwidow616.jpg')" },
  { name: "Соколиный Глаз", sub: "с Земли 616", s: [2, 5, 3, 5], cost: 5, art: "center/cover no-repeat url('./assets/hawkeye616.jpg')" },
  { name: "Капитан Марвел", sub: "с Земли 616", s: [5, 4, 3, 4], cost: 6, art: "center/cover no-repeat url('./assets/captainmarvel616.jpg')" },
  { name: "Черная Пантера", sub: "с Земли 616", s: [3, 5, 5, 5], cost: 8, art: "center/cover no-repeat url('./assets/blackpanther616.jpg')" },
  { name: "Человек\u2011Муравей", sub: "с Земли 616", s: [2, 4, 4, 3], cost: 3, art: "center/cover no-repeat url('./assets/antman616.jpg')" },
  { name: "Оса", sub: "с Земли 616", s: [2, 5, 4, 4], cost: 5, art: "center/cover no-repeat url('./assets/wasp616.jpg')" },
  { name: "Сокол", sub: "с Земли 616", s: [2, 5, 3, 4], cost: 4, art: "center/cover no-repeat url('./assets/falcon616.jpg')" },
  { name: "Алая Ведьма", sub: "с Земли 616", s: [2, 3, 4, 5], cost: 4, art: "center/cover no-repeat url('./assets/scarletwitch616.jpg')" },
  { name: "Вижн", sub: "с Земли 616", s: [4, 4, 5, 4], cost: 7, art: "center/cover no-repeat url('./assets/vision616.jpg')" },
  { name: "Женщина\u2011Халк", sub: "с Земли 616", s: [5, 3, 3, 3], cost: 4, art: "center/cover no-repeat url('./assets/shehulk616.jpg')" },

  // --- Люди Икс, Земля-616 (mutant) ---
  { name: "Профессор Икс", sub: "с Земли 616", s: [1, 1, 5, 5], cost: 2, tags: ["mutant"], art: "center 20%/cover no-repeat url('./assets/professorx616.jpg')" },
  { name: "Росомаха", sub: "с Земли 616", s: [4, 4, 3, 5], cost: 6, tags: ["mutant"], art: "center/cover no-repeat url('./assets/wolverine616.jpg')" },
  { name: "Циклоп", sub: "с Земли 616", s: [3, 3, 4, 5], cost: 5, tags: ["mutant"], art: "center/cover no-repeat url('./assets/cyclops616.jpg')" },
  { name: "Джин Грей", sub: "с Земли 616", s: [3, 3, 5, 5], cost: 6, tags: ["mutant"], art: "center/cover no-repeat url('./assets/jeangrey616.jpg')" },
  { name: "Шторм", sub: "с Земли 616", s: [2, 4, 4, 5], cost: 5, tags: ["mutant"], art: "center/cover no-repeat url('./assets/storm616.jpg')" },
  { name: "Зверь", sub: "с Земли 616", s: [4, 5, 5, 3], cost: 7, tags: ["mutant"], art: "center/cover no-repeat url('./assets/beast616.jpg')" },
  { name: "Колосс", sub: "с Земли 616", s: [5, 2, 3, 3], cost: 3, tags: ["mutant"], art: "center/cover no-repeat url('./assets/colossus616.jpg')" },
  { name: "Роуг", sub: "с Земли 616", s: [4, 3, 3, 4], cost: 4, tags: ["mutant"], art: "center/cover no-repeat url('./assets/rogue616.jpg')" },
  { name: "Китти Прайд", sub: "с Земли 616", s: [2, 5, 4, 3], cost: 4, tags: ["mutant"], art: "center/cover no-repeat url('./assets/kittypryde616.jpg')" },
  { name: "Ночной Змей", sub: "с Земли 616", s: [2, 5, 3, 5], cost: 5, tags: ["mutant"], art: "center/cover no-repeat url('./assets/nightcrawler616.jpg')" },
  { name: "Гамбит", sub: "с Земли 616", s: [2, 5, 3, 5], cost: 5, tags: ["mutant"], art: "center/cover no-repeat url('./assets/gambit616.jpg')" },
  { name: "Айсмен", sub: "с Земли 616", s: [3, 3, 3, 4], cost: 3, tags: ["mutant"], art: "center/cover no-repeat url('./assets/iceman616.jpg')" },
  { name: "Магнето", sub: "с Земли 616", s: [4, 2, 5, 5], cost: 6, tags: ["mutant"], art: "center/cover no-repeat url('./assets/magneto616-v2.jpg')" },

  // --- Фантастическая четвёрка, Земля-616 ---
  { name: "Мистер Фантастик", sub: "с Земли 616", s: [2, 3, 5, 4], cost: 4, art: "center/cover no-repeat url('./assets/mrfantastic616.jpg')" },
  { name: "Невидимая Женщина", sub: "с Земли 616", s: [2, 3, 4, 5], cost: 4, art: "center/cover no-repeat url('./assets/invisiblewoman616.jpg')" },
  { name: "Человек\u2011Факел", sub: "с Земли 616", s: [2, 4, 3, 4], cost: 3, art: "center/cover no-repeat url('./assets/humantorch616.jpg')" },
  { name: "Существо", sub: "с Земли 616", s: [5, 2, 3, 3], cost: 3, art: "center/cover no-repeat url('./assets/thething616.jpg')" },

  // --- Стражи Галактики и космос, Земля-616 ---
  { name: "Звёздный Лорд", sub: "с Земли 616", s: [3, 4, 3, 4], cost: 4, art: "center/cover no-repeat url('./assets/starlord616.jpg')" },
  { name: "Гамора", sub: "с Земли 616", s: [3, 5, 3, 5], cost: 6, art: "center/cover no-repeat url('./assets/gamora616.jpg')" },
  { name: "Дракс", sub: "с Земли 616", s: [5, 3, 2, 3], cost: 3, art: "center/cover no-repeat url('./assets/drax616.jpg')" },
  { name: "Ракета", sub: "с Земли 616", s: [2, 4, 4, 5], cost: 5, art: "center/cover no-repeat url('./assets/rocketracoon616.jpg')" },
  { name: "Грут", sub: "с Земли 616", s: [5, 2, 2, 2], cost: 1, art: "center/cover no-repeat url('./assets/groot616.webp')" },
  { name: "Мантис", sub: "с Земли 616", s: [2, 3, 4, 4], cost: 3, art: "center/cover no-repeat url('./assets/mantis616.jpg')" },
  { name: "Нова", sub: "с Земли 616", s: [4, 4, 3, 4], cost: 5, art: "center/cover no-repeat url('./assets/nova616.jpg')" },
  { name: "Серебряный Сёрфер", sub: "с Земли 616", s: [4, 4, 4, 4], cost: 6, art: "center/cover no-repeat url('./assets/silversurfer616.jpg')" },

  // --- Уличный уровень и антигерои, Земля-616 ---
  { name: "Сорвиголова", sub: "с Земли 616", s: [3, 5, 4, 5], cost: 7, art: "center/cover no-repeat url('./assets/daredevil616.jpg')" },
  { name: "Каратель", sub: "с Земли 616", s: [3, 3, 3, 5], cost: 4, art: "center/cover no-repeat url('./assets/punisher616.jpg')" },
  { name: "Лунный Рыцарь", sub: "с Земли 616", s: [3, 5, 3, 5], cost: 6, art: "center/cover no-repeat url('./assets/moonknight616.jpg')" },
  { name: "Дэдпул", sub: "с Земли 616", s: [4, 5, 3, 5], cost: 7, art: "center/cover no-repeat url('./assets/deadpool616.jpg')" },
  { name: "Доктор Стрэндж", sub: "с Земли 616", s: [2, 3, 5, 5], cost: 5, art: "center/cover no-repeat url('./assets/drstrange616.jpg')" },
  { name: "Призрачный Гонщик", sub: "с Земли 616", s: [5, 3, 2, 4], cost: 4, art: "center/cover no-repeat url('./assets/ghostrider616.jpg')" },

  // --- Симбиоты и угрозы, Земля-616 ---
  { name: "Веном", sub: "с Земли 616", s: [5, 4, 3, 4], cost: 6, art: "center/cover no-repeat url('./assets/venom616.jpg')" },
  { name: "Карнаж", sub: "с Земли 616", s: [5, 4, 2, 3], cost: 4, art: "center/cover no-repeat url('./assets/carnage616.jpg')" },
  { name: "Танос", sub: "с Земли 616", s: [5, 3, 5, 4], cost: 9, art: "center/cover no-repeat url('./assets/thanos616.jpg')" },

  // --- Другие вселенные ---
  { name: "Человек\u2011Паук 1610: Майлз Моралес", sub: "с Земли 1610 · Ultimate", s: [3, 4, 4, 3], cost: 4, art: "center/cover no-repeat url('./assets/spidermiles1610.jpg')" },

  // --- Второй эшелон, дешёвые карты (1-3 энергии) — арт ждёт загрузки, плейсхолдер-градиент временно ---
  { name: "Агент Щ.И.Т.", sub: "с Земли 616", s: [2, 3, 2, 2], cost: 1, art: "center/cover no-repeat url('./assets/shieldagent616.jpg')" },
  { name: "Агент ГИДРЫ", sub: "с Земли 616", s: [2, 2, 2, 2], cost: 1, art: "center/cover no-repeat url('./assets/hydraagent.jpg')" },
  { name: "Рядовой солдат Крии", sub: "с Земли 616", s: [3, 2, 1, 2], cost: 1, art: "center/cover no-repeat url('./assets/kreesoldier616.jpg')" },
  { name: "Воин Читаури", sub: "с Земли 616", s: [3, 2, 1, 1], cost: 1, art: "center/cover no-repeat url('./assets/Chitauri616.jpg')" },
  { name: "Ниндзя Руки", sub: "с Земли 616", s: [2, 3, 1, 2], cost: 1, art: "center/cover no-repeat url('./assets/handclan616.jpg')" },
  { name: "Солдат AIM", sub: "с Земли 616", s: [1, 2, 3, 2], cost: 1, art: "center/cover no-repeat url('./assets/AIMsoldier616.jpg')" },
  { name: "Полицейский Нью-Йорка", sub: "с Земли 616", s: [1, 2, 1, 1], cost: 1, art: "center/cover no-repeat url('./assets/NYCpolice616.jpg')" },
  { name: "Мария Хилл", sub: "с Земли 616", s: [2, 3, 3, 3], cost: 2, art: "center/cover no-repeat url('./assets/maryhill616.jpg')" },
  { name: "Фил Колсон", sub: "с Земли 616", s: [2, 2, 3, 3], cost: 2, art: "center/cover no-repeat url('./assets/philcoulson616.jpg')" },
  { name: "Пересмешница", sub: "с Земли 616", s: [2, 4, 2, 3], cost: 2, art: "center/cover no-repeat url('./assets/mockinbird616-50c2ad17.jpg')" },
  { name: "Кейт Бишоп", sub: "с Земли 616", s: [2, 4, 2, 2], cost: 2, art: "center/cover no-repeat url('./assets/katebishop616.jpg')" },
  { name: "Йонду", sub: "с Земли 616", s: [3, 4, 2, 2], cost: 2, art: "center/cover no-repeat url('./assets/youndu616.jpg')" },
  { name: "Небула", sub: "с Земли 616", s: [3, 4, 2, 3], cost: 2, art: "center/cover no-repeat url('./assets/nebula616.jpg')" },
  { name: "Шури", sub: "с Земли 616", s: [1, 2, 5, 3], cost: 2, art: "center/cover no-repeat url('./assets/shuri616.jpg')" },
  { name: "Вонг", sub: "с Земли 616", s: [2, 2, 4, 3], cost: 2, art: "center/cover no-repeat url('./assets/wong616.jpg')" },
  { name: "Корг", sub: "с Земли 616", s: [4, 2, 2, 2], cost: 2, art: "center/cover no-repeat url('./assets/korg616.jpg')" },
  { name: "М\u2019Баку", sub: "с Земли 616", s: [4, 3, 2, 2], cost: 2, art: "center/cover no-repeat url('./assets/mbaku616.jpg')" },
  { name: "Локи", sub: "с Земли 616", s: [2, 3, 4, 4], cost: 3, art: "center/cover no-repeat url('./assets/loki616.jpg')" },
  { name: "Зимний солдат", sub: "с Земли 616", s: [4, 4, 2, 3], cost: 3, art: "center/cover no-repeat url('./assets/wintersoldier616.jpg')" },
  { name: "Воитель", sub: "с Земли 616", s: [3, 3, 3, 4], cost: 3, art: "center/cover no-repeat url('./assets/warmachine616.jpg')" },
  { name: "Сокол (Сэм Уилсон)", sub: "с Земли 616", s: [3, 4, 2, 3], cost: 3, art: "center/cover no-repeat url('./assets/samwilson616.jpg')" },
  { name: "БЕЛАЯ ТИГРИЦА", sub: "с Земли 616", s: [4, 4, 2, 3], cost: 3, art: "center/cover no-repeat url('./assets/whitetiger616.jpg')" },
  { name: "Электра", sub: "с Земли 616", s: [3, 5, 2, 3], cost: 3, art: "center/cover no-repeat url('./assets/electra616.jpg')" },
  { name: "Меченый", sub: "с Земли 616", s: [3, 4, 2, 4], cost: 3, art: "center/cover no-repeat url('./assets/bullseye616.jpg')" },
  { name: "Мистерио", sub: "с Земли 616", s: [1, 3, 4, 4], cost: 3, art: "center/cover no-repeat url('./assets/misterio616.jpg')" },
  { name: "Плащ", sub: "с Земли 616", s: [2, 2, 4, 4], cost: 3, art: "center/cover no-repeat url('./assets/cloak616.jpg')" },
  { name: "Кинжал", sub: "с Земли 616", s: [2, 3, 4, 3], cost: 3, art: "center/cover no-repeat url('./assets/dagger616.jpg')" },
  // Когда фото будут загружены, замени art каждой карточки выше на "center/cover no-repeat url('./assets/ИМЯ_ФАЙЛА')"

  // --- Легендарная карта (замыкает коллекцию) ---
  { name: "Стэн Ли", sub: "Excelsior!", s: [5, 5, 5, 5], cost: 10, legendary: true, collectionOnly: true, art: "center 22%/cover no-repeat url('./assets/stanlee.jpg')" }
];
// Быстро добавить карточку: скопируй строку выше и заполни поля.
// name       — имя персонажа (строка, "\u2011" вместо дефиса чтобы не переносилось)
// sub        — подпись под именем ("с Земли 616" и т.п.)
// s          — [Сила, Ловкость, Интеллект, Мастерство], каждое 1-5
// legendary  — true даёт золотую рамку и бейдж «Легендарная» (необязательно)
// collectionOnly — true исключает карту из игровой колоды (только для коллекции, например Стэн Ли)
// tags       — необязательно: ["mutant"] отмечает мутантов (влияет на карту "Пришествие Феникса" в игровом режиме)
// art        — CSS background картинки: "center/cover no-repeat url('./assets/ИМЯ_ФАЙЛА')"
//              (артворк положить в /assets через copy_files, потом сюда путь)
// Порядок в массиве = порядок в сетке коллекции. Ротация карточек берётся из ROTS по кругу — ничего менять не нужно.

