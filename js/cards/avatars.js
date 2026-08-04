/*
cards/avatars.js

Данные аватаров (AVATARS): имя, здоровье, арт, пассивная
способность (ссылкой на battle/avatars.js), тексты. Только данные.
*/
// --- Аватары ---------------------------------------------------------------
// Отдельная сущность: аватары НЕ используют класс героев (makeInstance) и не пересекаются с ними.
// Добавить аватара = добавить запись в AVATARS. Способность = ключ в AVATAR_PASSIVES
// (хуки onTurnStart / onHeroPlayed / onHeroDestroyed) или в AVATAR_ACTIVES (заготовка).
// cls — «класс» аватара: задел под усиление колод определённого типа (cosmic / unique / events).
const AVATARS = [
  {
    id: "watcher", name: "Наблюдатель", title: "The Watcher", cls: "cosmic",
    maxHealth: 34, image: "center/cover no-repeat url('./assets/watcher_avatar.jpg')", glyph: "",
    tags: ["cosmic", "observer"], passive: "peekTop", active: null,
    passiveName: "Взгляд сквозь миры",
    passiveText: "Раз в ход можно посмотреть верхнюю карту своей колоды.",
    statsText: "Очень высокий интеллект · много здоровья"
  },
  {
    id: "collector", name: "Коллекционер", title: "The Collector", cls: "unique",
    maxHealth: 28, image: "center 20%/cover no-repeat url('./assets/thecollector_avatar.jpg')", glyph: "",
    tags: ["collector"], passive: "healOnDeath", active: null,
    passiveName: "Пополнение коллекции",
    passiveText: "При уничтожении любого героя аватар восстанавливает 2 HP.",
    statsText: "Среднее здоровье · выигрывает от долгой игры"
  },
  {
    id: "grandmaster", name: "Грандмастер", title: "Grandmaster", cls: "events",
    maxHealth: 24, image: "center 15%/cover no-repeat url('./assets/grandmaster_avatar.jpg')", glyph: "",
    tags: ["grandmaster"], passive: "buffFirstHero", active: null,
    passiveName: "Правила игры",
    passiveText: "Первый герой, сыгранный за ход, получает +1 к случайной характеристике.",
    statsText: "Меньше здоровья · сильный темп"
  }
];
