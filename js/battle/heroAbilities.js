/*
battle/heroAbilities.js

Механика уникальных способностей героев (Ability System v2.0).
Каждая функция получает game/hero и мутирует состояние напрямую —
как BONUS_EFFECTS и AVATAR_PASSIVES. Не работает с интерфейсом.

Соколиный Глаз (perfectShot) намеренно не имеет отдельного хука:
в этом движке атака уже не зависит от позиции героя на поле —
любой готовый герой может выбрать любую цель, так что способность
всегда выполняется сама собой. Текст всё равно показывается в
интерфейсе через HERO_ABILITIES.
*/

function hasAbility(hero, id) {
  return !!hero && hero.ability === id;
}
const otherSide = (side) => (side === "player" ? "bot" : "player");

// --- Урон: модификаторы силы атаки и снижение получаемого урона -----------
// Порядок: сначала бонус атакующего к урону, затем снижение защитника
// (если у атакующего нет Silver Surfer "Power Cosmic" — он игнорирует любое снижение).
function attackDamageBonus(attacker, defender) {
  let bonus = 0;
  if (hasAbility(attacker, "masterOfMagnetism") && hasKw(defender, "technology")) bonus += 2;
  if (hasAbility(attacker, "heavyWeapons") && hasKw(defender, "technology")) bonus += 1;
  return bonus;
}
function defenseDamageReduction(attacker, defender) {
  if (hasAbility(attacker, "powerCosmic")) return 0;
  let reduction = 0;
  if (hasAbility(defender, "vibraniumArmor")) reduction += 1;
  if (hasAbility(defender, "tinyTarget")) reduction += 1;
  return reduction;
}
// Паучье чутьё: первая атака по Человеку-Пауку в ход противника промахивается
// (флаг сбрасывается в начале хода самого Человека-Паука — см. applyTurnStartAbilities).
function spiderDodge(defender) {
  if (hasAbility(defender, "spiderSense") && !defender.dodgeUsed) {
    defender.dodgeUsed = true;
    return true;
  }
  return false;
}

// --- Может ли атакующий игнорировать защиту аватара героями ---------------
function bypassesAvatarProtection(hero) {
  return hasAbility(hero, "unstoppableRage");
}

// --- Аура Капитана Америки: соседние союзники +1 Мастерство ---------------
// Полный пересчёт при каждом изменении состава поля — снимает старый бонус
// и накладывает заново, поэтому корректно работает при гибели/выходе героев.
function recalcCaptainAura(game, side) {
  const p = game[side];
  p.field.forEach((h) => {
    if (h && h.auraK) { h.stats.k -= h.auraK; h.auraK = 0; recalcHp(h); }
  });
  p.field.forEach((h, idx) => {
    if (!h || !h.alive || h.dying || !hasAbility(h, "assemble")) return;
    [idx - 1, idx + 1].forEach((j) => {
      const n = p.field[j];
      if (n && n.alive && !n.dying) { n.stats.k += 1; n.auraK = (n.auraK || 0) + 1; recalcHp(n); }
    });
  });
}

// --- Начало хода: Арк-реактор, сброс Паучьего чутья и Силы Новы -----------
function applyTurnStartAbilities(game, side) {
  const p = game[side];
  const msgs = [];
  p.field.forEach((h) => {
    if (!h || !h.alive || h.dying) return;
    if (hasAbility(h, "arcReactor") && h.hp < h.maxHp) {
      const before = h.hp;
      h.hp = Math.min(h.maxHp, h.hp + 2);
      if (h.hp > before) msgs.push(h.name + " (Арк-реактор) восстанавливает " + (h.hp - before) + " HP.");
    }
    if (hasAbility(h, "spiderSense")) h.dodgeUsed = false;
    if (hasAbility(h, "novaForce")) h.novaUsedThisTurn = false;
  });
  return msgs;
}
// --- Конец хода: Регенерация Росомахи --------------------------------------
function applyTurnEndAbilities(game, side) {
  const p = game[side];
  const msgs = [];
  p.field.forEach((h) => {
    if (!h || !h.alive || h.dying || !hasAbility(h, "regeneration")) return;
    if (h.hp < h.maxHp) {
      const before = h.hp;
      h.hp = Math.min(h.maxHp, h.hp + 2);
      if (h.hp > before) msgs.push(h.name + " (Регенерация) восстанавливает " + (h.hp - before) + " HP.");
    }
  });
  return msgs;
}

// --- Реакция на убийство в бою: Веном, Человек-Факел, Нова -----------------
// Вызывается из resolveAttackDamage, когда известно, кто именно нанёс
// смертельный удар (killHero сам по себе этого не знает).
function onCombatKill(game, killerSide, killer, deadHero) {
  const msgs = [];
  if (hasAbility(killer, "symbioteFeast") && killer.alive && !killer.dying) {
    const before = killer.hp;
    killer.hp = Math.min(killer.maxHp, killer.hp + 4);
    if (killer.hp > before) msgs.push(killer.name + " (Пир симбиота) восстанавливает " + (killer.hp - before) + " HP.");
  }
  if (hasAbility(killer, "flameOn") && killer.alive && !killer.dying) {
    killer.flameOnStacks = killer.flameOnStacks || 0;
    if (killer.flameOnStacks < 3) {
      killer.flameOnStacks++;
      killer.stats.s += 1;
      killer.buffed = true;
      recalcHp(killer);
      msgs.push(killer.name + " (Пламя) получает +1 к Силе.");
    }
  }
  if (hasAbility(killer, "novaForce") && killer.alive && !killer.dying && !killer.novaUsedThisTurn) {
    killer.novaUsedThisTurn = true;
    killer.usedAttack = false;
    msgs.push(killer.name + " (Сила Новы) снова готов атаковать.");
  }
  return msgs;
}
// --- Реакция на ЛЮБУЮ гибель героя: Карнаж ---------------------------------
// В отличие от onCombatKill, не требует, чтобы Карнаж был убийцей.
function fireHeroOnAnyDeath(game, deadSide, deadHero) {
  const msgs = [];
  ["player", "bot"].forEach((side) => {
    game[side].field.forEach((h) => {
      if (!h || !h.alive || h.dying || !hasAbility(h, "bloodlust")) return;
      h.bloodlustStacks = h.bloodlustStacks || 0;
      if (h.bloodlustStacks < 5) {
        h.bloodlustStacks++;
        h.stats.s += 1;
        h.buffed = true;
        recalcHp(h);
        msgs.push(h.name + " (Жажда крови) получает +1 к Силе.");
      }
    });
  });
  if (msgs.length) msgs.forEach((m) => logEvent(game, m));
}

// --- Иллюзии Мистерио: погибают от любого урона, не атакуют аватара -------
function makeIllusion() {
  return {
    uid: "illusion" + (uidCounter++), name: "Иллюзия", sub: "Копия Мистерио", art: "center/cover no-repeat url('./assets/misterio616.jpg')",
    legendary: false, type: "hero", tags: [], keywords: [], key: null, cost: 1,
    stats: { s: 1, a: 1, i: 1, k: 1 }, hp: 1, maxHp: 1, alive: true,
    sick: true, usedAttack: true, ability: null, isIllusion: true
  };
}

// --- Боевые кличи без выбора цели: срабатывают сразу при выходе на поле ---
const BATTLECRY_INSTANT = {
  godOfThunder(game, side, hero) {
    const enemy = otherSide(side);
    const msgs = [];
    game[enemy].field.filter((h) => h && h.alive && !h.dying).forEach((h) => {
      h.hp = Math.max(0, h.hp - 2);
      if (h.hp <= 0) killHero(game, enemy, h.uid, "Поражён молнией Тора.");
    });
    msgs.push(hero.name + " (Бог грома) бьёт молнией по полю противника на 2 урона.");
    return msgs;
  },
  chaosMagic(game, side, hero) {
    const keys = ["s", "a", "i", "k"];
    const all = game.player.field.concat(game.bot.field).filter((h) => h && h.alive && !h.dying);
    all.forEach((h) => {
      const k = keys[Math.floor(Math.random() * keys.length)];
      const delta = Math.random() < 0.5 ? 1 : -1;
      h.stats[k] = Math.max(1, h.stats[k] + delta);
      if (delta > 0) h.buffed = true; else h.debuffed = true;
      recalcHp(h);
    });
    return [hero.name + " (Магия хаоса) случайно меняет характеристики всех героев в бою."];
  },
  penanceStare(game, side, hero) {
    const enemy = otherSide(side);
    let destroyed = 0;
    game[enemy].field.filter((h) => h && h.alive && !h.dying && h.stats.k <= 3 && !hasKw(h, "cosmic")).forEach((h) => {
      killHero(game, enemy, h.uid, "Уничтожен Взглядом покаяния.");
      destroyed++;
    });
    return [hero.name + " (Взгляд покаяния) уничтожает героев противника с Мастерством ≤3" + (destroyed ? " (" + destroyed + ")." : " — целей нет.")];
  },
  hallOfMirrors(game, side, hero) {
    const p = game[side];
    let summoned = 0;
    for (let i = 0; i < p.field.length && summoned < 2; i++) {
      if (p.field[i] === null) { p.field[i] = makeIllusion(); summoned++; }
    }
    return [hero.name + " (Зал зеркал) призывает " + summoned + " иллюзи" + (summoned === 1 ? "ю" : "и") + "."];
  }
};
// --- Боевые кличи с выбором цели: id -> { validTargets(game, side, hero), resolve } ---
const BATTLECRY_TARGETED = {
  illusion: {
    validTargets(game, side, hero) {
      return game.player.field.concat(game.bot.field).filter((h) => h && h.alive && !h.dying && h.uid !== hero.uid);
    },
    resolve(game, side, hero, targetSide, targetUid) {
      const target = findHero(game, targetSide, targetUid);
      if (!target) return hero.name + ": цель не найдена.";
      const keepHp = hero.hp;
      hero.name = target.name; hero.art = target.art; hero.sub = target.sub;
      hero.stats = Object.assign({}, target.stats);
      hero.keywords = target.keywords.slice();
      hero.tags = target.tags.slice();
      hero.legendary = target.legendary;
      hero.maxHp = target.stats.s + target.stats.a + target.stats.i + target.stats.k;
      hero.hp = Math.min(hero.maxHp, keepHp);
      hero.copiedFrom = target.name;
      return hero.name + " (Иллюзия) копирует " + target.name + ", сохраняя текущее HP.";
    }
  },
  wakandanUpgrade: {
    validTargets(game, side) {
      return game[side].field.filter((h) => h && h.alive && !h.dying);
    },
    resolve(game, side, hero, targetSide, targetUid) {
      if (targetSide !== side) return hero.name + ": Ваканданский апгрейд действует только на союзника.";
      const target = findHero(game, targetSide, targetUid);
      if (!target) return hero.name + ": цель не найдена.";
      target.stats.s += 1; target.stats.i += 1;
      target.buffed = true;
      recalcHp(target);
      return hero.name + " (Ваканданский апгрейд) даёт " + target.name + " +1 Силу и +1 Интеллект.";
    }
  },
  chargedCards: {
    validTargets(game) {
      return game.player.field.concat(game.bot.field).filter((h) => h && h.alive && !h.dying);
    },
    resolve(game, side, hero, targetSide, targetUid) {
      const target = findHero(game, targetSide, targetUid);
      if (!target) return hero.name + ": цель не найдена.";
      target.hp = Math.max(0, target.hp - 3);
      const msg = hero.name + " (Заряженные карты) наносит " + target.name + " 3 урона.";
      if (target.hp <= 0) killHero(game, targetSide, target.uid, "Уничтожен Заряженными картами.");
      return msg;
    }
  },
  frozenGround: {
    validTargets(game) {
      return game.player.field.concat(game.bot.field).filter((h) => h && h.alive && !h.dying);
    },
    resolve(game, side, hero, targetSide, targetUid) {
      const target = findHero(game, targetSide, targetUid);
      if (!target) return hero.name + ": цель не найдена.";
      target.frozen = true;
      return hero.name + " (Мёрзлая земля) замораживает " + target.name + " — не сможет атаковать в следующий ход.";
    }
  }
};
function heroNeedsTarget(id) { return !!BATTLECRY_TARGETED[id]; }
