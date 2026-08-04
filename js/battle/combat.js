/*
battle/combat.js

Базовые операции над состоянием боя: перемешивание колоды,
пересчёт HP от характеристик, поиск героя на поле, уничтожение
героя (с уведомлением пассивок аватаров), создание игрового
экземпляра карты из данных. Не работает с интерфейсом.
*/
function shuffleArr(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}
function recalcHp(hero) {
  const max = hero.stats.s + hero.stats.a + hero.stats.i + hero.stats.k;
  const dmgTaken = hero.maxHp - hero.hp;
  hero.maxHp = max;
  hero.hp = Math.max(0, max - dmgTaken);
}
function findHero(game, side, uid) {
  return game[side].field.find((h) => h && h.uid === uid) || null;
}
function killHero(game, side, uid, reason) {
  const p = game[side];
  const idx = p.field.findIndex((h) => h && h.uid === uid);
  if (idx < 0) return;
  const hero = p.field[idx];
  // Дэдпул "Не умирает": первая гибель за матч возвращает его в руку с 1 HP
  // вместо сброса. Пассивки onHeroDestroyed всё равно срабатывают — он погиб,
  // просто не остаётся в сбросе.
  if (hero.ability === "cantDie" && !hero.usedRevive && p.hand.length < 7) {
    hero.usedRevive = true;
    hero.alive = false;
    hero.dying = false;
    p.field[idx] = null;
    firePassive(game, "onHeroDestroyed", [side, hero]).forEach((m) => logEvent(game, m));
    fireHeroOnAnyDeath(game, side, hero);
    hero.alive = true;
    hero.hp = 1;
    hero.sick = false;
    hero.usedAttack = false;
    p.hand.push(hero);
    logEvent(game, hero.name + " не умирает — возвращается в руку с 1 HP.");
    return;
  }
  hero.alive = false;
  hero.dying = false;
  hero.discardReason = reason || "Уничтожен в бою.";
  p.discard.push(hero);
  p.field[idx] = null;
  firePassive(game, "onHeroDestroyed", [side, hero]).forEach((m) => logEvent(game, m));
  fireHeroOnAnyDeath(game, side, hero);
}
let uidCounter = 1;
function makeInstance(d) {
  const isBonus = !!d.bonus;
  const stats = isBonus ? null : { s: d.s[0], a: d.s[1], i: d.s[2], k: d.s[3] };
  const hp = isBonus ? null : (d.s[0] + d.s[1] + d.s[2] + d.s[3]);
  return {
    uid: "c" + (uidCounter++), name: d.name, sub: d.sub, art: d.art,
    legendary: !!d.legendary, type: isBonus ? "bonus" : "hero",
    tags: d.tags || [], keywords: cardKeywords(d), key: d.key || null, cost: d.cost || 1,
    stats: stats, hp: hp, maxHp: hp, alive: true,
    sick: false, usedAttack: false,
    ability: isBonus ? null : (HERO_ABILITY_TABLE[d.name] || null)
  };
}
