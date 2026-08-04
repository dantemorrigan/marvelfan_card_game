/*
battle/bonusCards.js

Эффекты бонусных карт (BONUS_EFFECTS: что делает каждая карта при
разыгрывании) и подбор цвета/анимации эффекта на экране боя (bonusFx).
*/
// --- Игровой движок: эффекты бонусных карт ---
// Каждый обработчик получает (game, casterSide, targetUid|null) и мутирует game.player/game.bot напрямую.
// caster — сторона, разыгравшая карту ("player" | "bot"); target — сторона, где стоит выбранный герой (если applyTo==='target').
const BONUS_EFFECTS = {
  gauntlet: {
    needsTarget: true,
    resolve(game, casterSide, targetSide, targetUid) {
      const hero = findHero(game, targetSide, targetUid);
      if (!hero) return "Перчатка Бесконечности: цель не найдена.";
      if (hero.name === "Танос") {
        hero.stats = { s: 5, a: 5, i: 5, k: 5 };
        recalcHp(hero);
        return "Перчатка Бесконечности надета Таносом — все характеристики 5.";
      }
      if (hero.stats.k >= 4) {
        hero.stats.s += 1; hero.stats.a += 1; hero.stats.i += 1; hero.stats.k += 1;
        hero.buffed = true;
        recalcHp(hero);
        hero.hp = Math.max(0, hero.hp - 3);
        if (hero.hp <= 0) killHero(game, targetSide, hero.uid, "Не выдержал силу Перчатки Бесконечности.");
        return hero.name + " использует Перчатку: характеристики +1, но получает 3 урона от силы Камней.";
      }
      killHero(game, targetSide, hero.uid, "Оказался недостоин Перчатки Бесконечности.");
      return hero.name + " не выдерживает силу Перчатки и погибает.";
    }
  },
  mjolnir: {
    needsTarget: true,
    resolve(game, casterSide, targetSide, targetUid) {
      const hero = findHero(game, targetSide, targetUid);
      if (!hero) return "Мьёльнир: цель не найдена.";
      if (hasKw(hero, "worthy")) {
        hero.stats.s = 5; hero.stats.a = 5;
        hero.buffed = true;
        recalcHp(hero);
        return hero.name + " поднимает Мьёльнир — Сила и Ловкость 5.";
      }
      return hero.name + " не достоин Мьёльнира. Молот возвращается в сброс.";
    }
  },
  phoenix: {
    needsTarget: false,
    resolve(game) {
      const all = game.player.field.concat(game.bot.field).filter((h) => h && h.alive);
      const mutants = all.filter((h) => hasKw(h, "mutant"));
      if (mutants.length) {
        mutants.forEach((h) => { h.stats.s = 5; h.buffed = true; recalcHp(h); });
        return "Пришествие Феникса усиливает мутантов на поле — Сила 5.";
      }
      all.forEach((h) => { h.hp = Math.max(0, h.hp - 3); });
      [["player", game.player], ["bot", game.bot]].forEach(([side, p]) => {
        p.field.filter((h) => h && h.hp <= 0).forEach((h) => killHero(game, side, h.uid, "Сгорел в пламени Феникса."));
      });
      return "Мутантов не найдено — Феникс обжигает всех героев на 3 урона.";
    }
  },
  rift: {
    needsTarget: false,
    resolve(game) {
      ["player", "bot"].forEach((side) => {
        const p = game[side];
        const destroyed = p.field.filter((h) => h);
        destroyed.forEach((h) => { h.discardReason = "Поле стёрто Мультивселенским Разломом."; });
        p.discard = p.discard.concat(destroyed);
        p.field = [];
        p.deck = shuffleArr(p.deck.concat(p.discard));
        p.discard = [];
      });
      return "Мультивселенский разлом стирает поле — обе колоды пересобраны заново.";
    }
  },
  ultron: {
    needsTarget: false,
    resolve(game) {
      let ironManHit = false;
      ["player", "bot"].forEach((side) => {
        const p = game[side];
        p.field.forEach((h) => {
          if (!h) return;
          if (h.name === "Железный Человек") { killHero(game, side, h.uid, "Уничтожен Яростью Альтрона."); ironManHit = true; }
        });
      });
      let tech = 0;
      ["player", "bot"].forEach((side) => {
        const p = game[side];
        p.field.forEach((h) => {
          if (!h || !h.alive) return;
          if (!hasKw(h, "technology")) return;
          h.stats.i = Math.max(1, h.stats.i - 1);
          h.debuffed = true;
          recalcHp(h);
          tech++;
        });
      });
      const techMsg = tech ? "Технологические герои теряют 1 Интеллект (" + tech + ")." : "Технологических героев на поле нет.";
      return (ironManHit ? "Ярость Альтрона уничтожает Железного Человека. " : "Ярость Альтрона проходит по полю. ") + techMsg;
    }
  }
};

function bonusFx(key, name) {
  const map = {
    gauntlet: { color: "#f2c14e", effect: "gold" },
    mjolnir: { color: "#8ecbff", effect: "electric" },
    phoenix: { color: "#ff6a3d", effect: "fire" },
    rift: { color: "#8a6fd6", effect: "rift" },
    ultron: { color: "#e0212f", effect: "glitch" }
  };
  const m = map[key] || { color: "#14a893", effect: "plain" };
  return { name: name, color: m.color, effect: m.effect };
}
