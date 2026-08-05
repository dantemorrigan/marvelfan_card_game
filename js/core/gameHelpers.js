/*
core/gameHelpers.js

Мелкие утилиты общего назначения: взвешенный выбор карты при доборе
(weightedDrawIndex) и запись события в журнал боя (logEvent).
*/
// Колода тасуется полностью случайно (shuffleArr) при сборке — порядок карт
// в ней ничего не значит. "Прогрессия" по стоимости делается на самом доборе:
// чем выше текущий потолок маны, тем выше шанс вытянуть дорогую карту, но
// дешёвые остаются вероятны всегда, а дорогие могут выпасть и рано (редко).
function weightedDrawIndex(deck, manaCap) {
  if (!deck.length) return -1;
  const weights = deck.map((c) => {
    const cost = c.cost || 1;
    return cost <= manaCap ? 1 : Math.max(0.08, 1 - (cost - manaCap) * 0.12);
  });
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < deck.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return deck.length - 1;
}
function logEvent(game, text) {
  game.log = text;
  // 300, а не 10: обычный режим показывает только последнюю запись (log), но Sandbox
  // читает весь logHistory для журнала событий (Event Log) — триггеры, боевые кличи,
  // пассивки, урон/лечение. Само по себе увеличение хранимой истории ничего в игре не меняет.
  game.logHistory = (game.logHistory || []).concat([text]).slice(-300);
}
