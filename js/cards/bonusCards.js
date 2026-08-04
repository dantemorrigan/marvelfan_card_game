/*
cards/bonusCards.js

Данные бонусных карт (BONUS): имя, характеристики, арт, ключ
эффекта. Сам эффект бонусной карты — в battle/bonusCards.js.
*/
// Бонусные карты — отдельная категория, не персонажи (события, промо-арты, спецвыпуски и т.п.).
// Показываются в коллекции отдельным блоком "Бонусные карты" со своей рамкой (бирюзовое свечение).
// key — идентификатор игровой механики карты (см. BONUS_EFFECTS в игровом движке ниже).
const BONUS = [
  { name: "Перчатка Бесконечности", sub: "Артефакт", s: [5, 3, 5, 5], cost: 10, bonus: true, legendary: true, key: "gauntlet", art: "center/cover no-repeat url('./assets/bonus-infinity-gauntlet.jpg')" },
  { name: "Мьёльнир", sub: "Артефакт", s: [5, 2, 3, 5], cost: 4, bonus: true, rarity: "rare", key: "mjolnir", art: "center/cover no-repeat url('./assets/bonus-mjolnir.jpg')" },
  { name: "Пришествие Феникса", sub: "Событие", s: [4, 4, 5, 5], cost: 7, bonus: true, legendary: true, key: "phoenix", art: "center/cover no-repeat url('./assets/bonus-phoenix-powers.jpg')" },
  { name: "Мультивселенский разлом", sub: "Событие", s: [3, 3, 5, 4], cost: 6, bonus: true, rarity: "rare", key: "rift", art: "center/cover no-repeat url('./assets/bonus-multiverse-rift.jpg')" },
  { name: "Ярость Альтрона", sub: "Событие", s: [5, 4, 4, 3], cost: 5, bonus: true, rarity: "rare", key: "ultron", art: "center/cover no-repeat url('./assets/bonus-ultrons-rage.jpg')" }
];
// Быстро добавить бонусную карту: скопируй строку-образец выше и заполни поля.
// bonus — всегда true (маркер категории + бейдж «Бонус» + бирюзовая рамка)
// rarity — необязательно: "rare" даёт серебристо-голубую рамку; legendary:true — золотую
// key — свяжи с новым обработчиком в BONUS_EFFECTS, если карта должна что-то делать в игровом режиме
