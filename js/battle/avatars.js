/*
battle/avatars.js

Логика аватаров: пассивные способности (AVATAR_PASSIVES),
заготовка активных (AVATAR_ACTIVES), создание аватара из данных
(avatarDef/makeAvatar), вызов пассивок по хукам (firePassive) и
проверка защиты аватара героями на поле.
*/
const AVATAR_PASSIVES = {
  peekTop: {
    onTurnStart(game, side, avatarSide) {
      if (side === avatarSide) game[avatarSide].avatar.peekUsed = false;
      return null;
    }
  },
  healOnDeath: {
    onHeroDestroyed(game, side, deadHero, avatarSide) {
      const av = game[avatarSide].avatar;
      const before = av.health;
      av.health = Math.min(av.maxHealth, av.health + 2);
      if (av.health > before) return av.name + " восстанавливает " + (av.health - before) + " HP (" + deadHero.name + " уничтожен).";
      return null;
    }
  },
  buffFirstHero: {
    onHeroPlayed(game, side, hero, avatarSide) {
      if (side !== avatarSide) return null;
      if (game[avatarSide].heroesPlayedThisTurn > 1) return null;
      const keys = ["s", "a", "i", "k"];
      const names = { s: "Силе", a: "Ловкости", i: "Интеллекту", k: "Мастерству" };
      const k = keys[Math.floor(Math.random() * keys.length)];
      hero.stats[k] = hero.stats[k] + 1;
      hero.buffed = true;
      recalcHp(hero);
      return hero.name + " получает +1 к " + names[k] + " от Грандмастера.";
    }
  }
};
const AVATAR_ACTIVES = {}; // задел под активные и ультимативные способности
function avatarDef(id) { return AVATARS.find((a) => a.id === id) || AVATARS[0]; }
function makeAvatar(id) {
  const d = avatarDef(id);
  return {
    id: d.id, name: d.name, title: d.title, image: d.image, glyph: d.glyph,
    health: d.maxHealth, maxHealth: d.maxHealth,
    passiveAbility: d.passive, activeAbility: d.active,
    passiveName: d.passiveName, passiveText: d.passiveText,
    cls: d.cls, tags: d.tags.slice(), peekUsed: false
  };
}
function firePassive(game, hook, args) {
  const msgs = [];
  ["player", "bot"].forEach((avatarSide) => {
    const av = game[avatarSide] && game[avatarSide].avatar;
    if (!av) return;
    const p = AVATAR_PASSIVES[av.passiveAbility];
    if (!p || !p[hook]) return;
    const out = p[hook].apply(null, [game].concat(args, [avatarSide]));
    if (out) msgs.push(out);
  });
  return msgs;
}
// Роль «Защитник» живёт в tags героя: пока ни у одной карты её нет, но движок уже её учитывает.
// willDie — герой ещё жив и на поле, но входящий урон уже посчитан как смертельный
// (см. attack() в battle/combat.js): позволяет щиту аватара упасть в момент удара,
// не дожидаясь конца анимации урона; на анимацию угасания карты (h.dying) не влияет.
function hasDefender(game, side) {
  return game[side].field.some((h) => h && h.alive && !h.dying && !h.willDie && hasKw(h, "defender"));
}
function liveHeroCount(game, side) {
  return game[side].field.filter((h) => h && h.alive && !h.dying && !h.willDie).length;
}
function avatarProtected(game, side) {
  return liveHeroCount(game, side) >= 3 || hasDefender(game, side);
}
