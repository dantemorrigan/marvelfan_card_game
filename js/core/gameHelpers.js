/*
core/gameHelpers.js

Мелкие утилиты общего назначения: порядок карт при добавлении в
колоду (progressionOrder) и запись события в журнал боя (logEvent).
*/
function progressionOrder(cards) {
  return cards
    .map((c) => ({ c, key: c.cost + Math.random() * 3.2 }))
    .sort((a, b) => a.key - b.key)
    .map((x) => x.c);
}
function logEvent(game, text) {
  game.log = text;
  game.logHistory = (game.logHistory || []).concat([text]).slice(-10);
}
