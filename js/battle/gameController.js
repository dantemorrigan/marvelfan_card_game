/*
battle/gameController.js

Оркестрация матча: создание состояния, добор, ходы, атаки и AI.
Низкоуровневые правила карт остаются в battle/combat.js, keywords.js,
avatars.js, bonusCards.js и heroAbilities.js.
*/
class MFCGameController {
  buildGame(opts) {
    const o = opts || {};
    const customPlayerCards = o.playerCards;
    const customBotCards = o.botCards;
    let playerSrc;
    let botSrc;

    if (customPlayerCards && customBotCards) {
      playerSrc = customPlayerCards.map((d) => makeInstance(d));
      botSrc = customBotCards.map((d) => makeInstance(d));
    } else {
      const pool = shuffleArr(DATA.concat(BONUS).filter((d) => !d.collectionOnly).map((d) => makeInstance(d)));
      const half = Math.floor(pool.length / 2);
      playerSrc = pool.slice(0, half);
      botSrc = pool.slice(half, half * 2);
    }

    const game = {
      player: {
        deck: shuffleArr(playerSrc), hand: [], field: [null, null, null, null, null], discard: [],
        mana: 1, manaCap: 1, heroesPlayedThisTurn: 0,
        avatar: makeAvatar(o.playerAvatar || AVATARS[0].id)
      },
      bot: {
        deck: shuffleArr(botSrc), hand: [], field: [null, null, null, null, null], discard: [],
        mana: 0, manaCap: 0, heroesPlayedThisTurn: 0,
        avatar: makeAvatar(o.botAvatar || AVATARS[0].id)
      },
      turn: "player",
      selectedUid: null,
      pendingBonus: null,
      winner: null,
      phase: "idle",
      atkFx: null,
      castFx: null,
      avatarFx: null,
      log: "",
      logHistory: []
    };

    for (let i = 0; i < START_HAND; i++) {
      this.draw(game, "player");
      this.draw(game, "bot");
    }
    logEvent(game, "Противник выбрал аватара: " + game.bot.avatar.name + " (" + game.bot.avatar.maxHealth + " HP).");
    logEvent(game, "Матч начался. У вас 1 ⚡. Ваш ход.");
    return game;
  }

  draw(game, side) {
    const p = game[side];
    if (!p.deck.length) {
      if (!p.discard.length) return;
      p.deck = shuffleArr(p.discard);
      p.discard = [];
      logEvent(game, (side === "player" ? "Ваш сброс" : "Сброс бота") + " перемешан в новую колоду.");
    }
    if (!p.deck.length) return;

    const card = p.deck.splice(weightedDrawIndex(p.deck, p.manaCap), 1)[0];
    card.justDrawn = true;
    game.deckFx = side;

    if (p.hand.length >= 7) {
      card.discardReason = "Рука была переполнена (7 карт) — карта сгорела при доборе.";
      p.discard.push(card);
      game.burnFx = { side: side, name: card.name, key: "b" + (uidCounter++) };
      logEvent(game, "Рука переполнена. Карта потеряна.");
      return;
    }
    p.hand.push(card);
  }

  refillHand(game, side) {
    const p = game[side];
    for (let i = 0; i < 8 && p.hand.length < 5; i++) {
      if (!p.deck.length && !p.discard.length) break;
      this.draw(game, side);
    }
  }

  startTurn(game, side) {
    game.turn = side;
    game.selectedUid = null;
    game.phase = "idle";
    game.atkFx = null;
    game.castFx = null;
    const p = game[side];
    p.manaCap = Math.min(10, p.manaCap + 1);
    p.mana = p.manaCap;

    p.field.forEach((h) => {
      if (!h) return;
      h.sick = false;
      h.usedAttack = !!h.frozen;
      h.frozen = false;
    });

    p.heroesPlayedThisTurn = 0;
    game.burnFx = null;
    firePassive(game, "onTurnStart", [side]);
    applyTurnStartAbilities(game, side).forEach((m) => logEvent(game, m));
    recalcCaptainAura(game, side);

    const handBefore = p.hand.length;
    this.refillHand(game, side);
    const drew = p.hand.length - handBefore;
    logEvent(game, (side === "player" ? "Ваш ход." : "Ход бота.") + " ⚡ " + p.mana + "/" + p.manaCap + "."
      + (drew > 0 ? " Добор до 5: +" + drew + "." : " Добора нет — в руке " + p.hand.length + "."));
  }

  playHeroCard(game, side, uid) {
    const p = game[side];
    const idx = p.hand.findIndex((c) => c.uid === uid);
    if (idx < 0) return false;
    const card = p.hand[idx];
    if (p.mana < card.cost) return false;
    const slot = p.field.findIndex((h) => h === null);
    if (slot < 0) return false;

    p.hand.splice(idx, 1);
    p.mana -= card.cost;
    const charge = hasKw(card, "charge");
    card.sick = !charge;
    card.usedAttack = !charge;
    card.justIn = true;
    p.field[slot] = card;
    p.heroesPlayedThisTurn = (p.heroesPlayedThisTurn || 0) + 1;
    firePassive(game, "onHeroPlayed", [side, card]).forEach((m) => logEvent(game, m));
    recalcCaptainAura(game, side);

    if (card.ability && BATTLECRY_INSTANT[card.ability]) {
      BATTLECRY_INSTANT[card.ability](game, side, card).forEach((m) => logEvent(game, m));
      recalcCaptainAura(game, "player");
      recalcCaptainAura(game, "bot");
    } else if (card.ability && heroNeedsTarget(card.ability)) {
      const targets = BATTLECRY_TARGETED[card.ability].validTargets(game, side, card);
      if (targets.length) {
        game.pendingBonus = {
          key: card.ability, name: card.name, isHeroAbility: true,
          heroUid: card.uid, heroSide: side
        };
        return "pending";
      }
    }
    return true;
  }

  discardBonusCard(game, side, uid) {
    const p = game[side];
    const idx = p.hand.findIndex((c) => c.uid === uid);
    if (idx < 0) return null;
    const card = p.hand.splice(idx, 1)[0];
    card.discardReason = "Бонусная карта использована («" + card.name + "»).";
    p.discard.push(card);
    return card;
  }

  attack(game, attackerSide, attackerUid, defenderSide, defenderUid) {
    const attacker = findHero(game, attackerSide, attackerUid);
    const defender = findHero(game, defenderSide, defenderUid);
    if (!attacker || !defender) return "Атака невозможна.";
    if (attacker.sick || attacker.usedAttack) return attacker.name + " не может атаковать сейчас.";
    if (defender.sick) {
      game.fx = [];
      return defender.name + " защищён усталостью призыва — атака невозможна.";
    }

    const dodged = spiderDodge(defender);
    const dmgToDefender = dodged ? 0 : Math.max(0,
      attacker.stats.s + attackDamageBonus(attacker, defender) - defenseDamageReduction(attacker, defender));
    const dmgToAttacker = Math.max(0,
      defender.stats.s + attackDamageBonus(defender, attacker) - defenseDamageReduction(defender, attacker));
    attacker.usedAttack = true;

    if (dmgToDefender >= defender.hp) defender.willDie = true;
    if (dmgToAttacker >= attacker.hp) attacker.willDie = true;
    game.fx = [
      { side: defenderSide, uid: defenderUid, dmg: dmgToDefender, dead: false, key: "fx" + (uidCounter++) },
      { side: attackerSide, uid: attackerUid, dmg: dmgToAttacker, dead: false, key: "fx" + (uidCounter++) }
    ];
    game.pendingDamage = {
      defender: { side: defenderSide, uid: defenderUid, dmg: dmgToDefender, name: defender.name },
      attacker: { side: attackerSide, uid: attackerUid, dmg: dmgToAttacker, name: attacker.name }
    };

    if (dodged) {
      return attacker.name + " атакует " + defender.name + ", но промахивается (Паучье чутьё)! Получает " + dmgToAttacker + " урона в ответ.";
    }
    return attacker.name + " наносит " + defender.name + " " + dmgToDefender + " урона и получает " + dmgToAttacker + " в ответ.";
  }

  resolveAttackDamage(game) {
    const pend = game.pendingDamage;
    if (!pend) return;
    game.pendingDamage = null;
    const defHero = findHero(game, pend.defender.side, pend.defender.uid);
    const atkHero = findHero(game, pend.attacker.side, pend.attacker.uid);
    const dying = [];
    const markDead = (uid) => {
      if (!Array.isArray(game.fx)) return;
      const f = game.fx.find((x) => x.uid === uid);
      if (f) f.dead = true;
    };

    if (defHero) {
      defHero.hp = Math.max(0, defHero.hp - pend.defender.dmg);
      if (defHero.hp <= 0) {
        defHero.dying = true;
        dying.push({ side: pend.defender.side, uid: pend.defender.uid, reason: "Погиб в бою с " + pend.attacker.name + "." });
        markDead(pend.defender.uid);
      }
    }
    if (atkHero) {
      atkHero.hp = Math.max(0, atkHero.hp - pend.attacker.dmg);
      if (atkHero.hp <= 0) {
        atkHero.dying = true;
        dying.push({ side: pend.attacker.side, uid: pend.attacker.uid, reason: "Погиб в ответном ударе от " + pend.defender.name + "." });
        markDead(pend.attacker.uid);
      }
    }

    if (dying.length) {
      const bothDied = dying.length === 2;
      const killerOf = bothDied ? null : (dying[0].side === pend.attacker.side
        ? { side: pend.defender.side, uid: pend.defender.uid }
        : { side: pend.attacker.side, uid: pend.attacker.uid });

      this.setGameTimer(() => {
        const g2 = this.state.game;
        if (!g2) return;
        dying.forEach((d) => {
          const still = findHero(g2, d.side, d.uid);
          if (still && still.dying) killHero(g2, d.side, d.uid, d.reason);
        });
        if (killerOf) {
          const killer = findHero(g2, killerOf.side, killerOf.uid);
          if (killer) onCombatKill(g2, killerOf.side, killer).forEach((m) => logEvent(g2, m));
        }
        this.setState({ game: Object.assign({}, g2) });
      }, 480);
    }
  }

  attackAvatarNow(game, attackerSide, attackerUid, defenderSide) {
    const attacker = findHero(game, attackerSide, attackerUid);
    const av = game[defenderSide].avatar;
    if (!attacker || !av) return "Атака невозможна.";
    if (attacker.sick || attacker.usedAttack) return attacker.name + " не может атаковать сейчас.";
    if (attacker.isIllusion) return "Иллюзия не может атаковать аватара.";
    if (avatarProtected(game, defenderSide) && !bypassesAvatarProtection(attacker)) {
      return av.name + " защищён героями — атака невозможна.";
    }
    const dmg = attacker.stats.s;
    attacker.usedAttack = true;
    game.avatarFx = { side: defenderSide, dmg: dmg, key: "af" + (uidCounter++) };
    game.pendingAvatarDamage = { side: defenderSide, dmg: dmg };
    return attacker.name + " бьёт по аватару «" + av.name + "» на " + dmg + " урона.";
  }

  resolveAvatarDamage(game) {
    const pend = game.pendingAvatarDamage;
    if (!pend) return;
    game.pendingAvatarDamage = null;
    const av = game[pend.side].avatar;
    av.health = Math.max(0, av.health - pend.dmg);
    if (av.health <= 0 && !game.winner) {
      game.winner = pend.side === "bot" ? "player" : "bot";
      game.phase = "over";
      logEvent(game, av.name + " уничтожен. " + (game.winner === "player" ? "Вы победили!" : "Бот победил."));
      this.stopBgm(2400);
      this.clearGameTimers();
    }
  }

  botPlayCardStep(game) {
    const bot = game.bot;
    game.fx = null;
    let card = null;
    if (bot.field.some((h) => h === null)) {
      card = bot.hand.find((c) => c.type === "hero" && c.cost <= bot.mana);
    }
    if (!card) card = bot.hand.find((c) => c.type === "bonus" && c.cost <= bot.mana);
    if (!card) return false;

    if (card.type === "hero") {
      const name = card.name;
      const cost = card.cost;
      const result = this.playHeroCard(game, "bot", card.uid);
      logEvent(game, "Бот выводит на поле: " + name + " (⚡" + cost + ").");

      if (result === "pending" && game.pendingBonus && game.pendingBonus.isHeroAbility) {
        const pb = game.pendingBonus;
        const caster = findHero(game, pb.heroSide, pb.heroUid);
        const ability = BATTLECRY_TARGETED[pb.key];
        const targets = caster ? ability.validTargets(game, pb.heroSide, caster) : [];
        if (targets.length && caster) {
          const t = targets[Math.floor(Math.random() * targets.length)];
          const tSide = game.bot.field.indexOf(t) >= 0 ? "bot" : "player";
          logEvent(game, ability.resolve(game, pb.heroSide, caster, tSide, t.uid));
          recalcCaptainAura(game, "player");
          recalcCaptainAura(game, "bot");
        }
        game.pendingBonus = null;
      }
      return true;
    }

    const eff = BONUS_EFFECTS[card.key];
    if (!eff) return false;
    bot.mana -= card.cost;
    this.discardBonusCard(game, "bot", card.uid);
    game.castFx = bonusFx(card.key, card.name);

    if (eff.needsTarget) {
      const targets = game.player.field.concat(game.bot.field).filter((h) => h && !h.sick);
      if (targets.length) {
        const t = targets[Math.floor(Math.random() * targets.length)];
        const tSide = game.bot.field.indexOf(t) >= 0 ? "bot" : "player";
        logEvent(game, eff.resolve(game, "bot", tSide, t.uid));
      } else {
        logEvent(game, "Бот разыгрывает «" + card.name + "», но целей нет.");
      }
    } else {
      logEvent(game, eff.resolve(game, "bot", null, null));
    }
    return true;
  }

  runBotTurn() {
    const g = cloneGame(this.state.game);
    applyTurnEndAbilities(g, "player").forEach((m) => logEvent(g, m));
    this.startTurn(g, "bot");
    this.botTryReviveHero(g);
    g.fx = null;
    this.setState({ game: g });
    this.clearFxLater(1700);
    this.setGameTimer(() => this.queueBotPlays(), 700);
  }

  botTryReviveHero(game) {
    const p = game.bot;
    const caster = p.field.find((h) => h && h.alive && !h.dying && h.ability === "eyeOfAgamotto" && !h.usedActive);
    if (!caster || p.hand.length >= 7) return;
    const revivable = p.discard.filter((d) => d.type === "hero");
    if (!revivable.length) return;
    const pick = revivable[Math.floor(Math.random() * revivable.length)];
    const idx = p.discard.indexOf(pick);
    p.discard.splice(idx, 1);
    pick.alive = true;
    pick.dying = false;
    pick.discardReason = null;
    pick.hp = pick.maxHp;
    pick.sick = false;
    pick.usedAttack = false;
    p.hand.push(pick);
    caster.usedActive = true;
    logEvent(game, caster.name + " (Око Агамотто) возвращает " + pick.name + " в руку бота.");
  }

  queueBotPlays() {
    const g = this.state.game;
    if (!g || g.winner || g.turn !== "bot") return;
    const played = this.botPlayCardStep(g);
    this.setState({ game: Object.assign({}, g) });
    this.clearFxLater(700);
    if (played) this.setGameTimer(() => this.queueBotPlays(), 750);
    else this.setGameTimer(() => this.queueBotAttacks(0), 700);
  }

  queueBotAttacks(idx) {
    const g = this.state.game;
    if (!g || g.winner || g.turn !== "bot") return;
    const ready = g.bot.field.filter((h) => h && h.alive && !h.dying && !h.sick && !h.usedAttack);

    if (idx >= ready.length) {
      g.phase = "idle";
      this.setState({ game: Object.assign({}, g) });
      this.setGameTimer(() => {
        const g3 = this.state.game;
        if (!g3 || g3.winner || g3.turn !== "bot") return;
        applyTurnEndAbilities(g3, "bot").forEach((m) => logEvent(g3, m));
        this.startTurn(g3, "player");
        this.setState({ game: Object.assign({}, g3) });
        this.clearFxLater(1700);
      }, 500);
      return;
    }

    const h = ready[idx];
    const faceOpen = !h.isIllusion && (!avatarProtected(g, "player") || bypassesAvatarProtection(h));
    const target = g.player.field.find((x) => x && x.alive && !x.dying && !x.sick);
    if (!faceOpen && !target) {
      this.setGameTimer(() => this.queueBotAttacks(idx + 1), 80);
      return;
    }

    g.phase = "botAttacking";
    g.atkFx = { side: "bot", uid: h.uid };
    logEvent(g, h.name + " готовится атаковать " + (faceOpen ? "аватара «" + g.player.avatar.name + "»" : target.name) + "…");
    this.setState({ game: Object.assign({}, g) });

    this.setGameTimer(() => {
      const g2 = this.state.game;
      if (!g2 || g2.winner || g2.turn !== "bot") return;
      logEvent(g2, faceOpen
        ? this.attackAvatarNow(g2, "bot", h.uid, "player")
        : this.attack(g2, "bot", h.uid, "player", target.uid));
      this.blip(220, 0.16, "sawtooth", 0.06);
      this.buzz(20);
      g2.atkFx = null;
      this.setState({ game: Object.assign({}, g2) });

      this.setGameTimer(() => {
        const g2b = this.state.game;
        if (!g2b || g2b.turn !== "bot") return;
        const g2c = Object.assign({}, g2b);
        this.resolveAttackDamage(g2c);
        this.resolveAvatarDamage(g2c);
        this.setState({ game: g2c });
        if (g2c.winner) return;

        this.setGameTimer(() => {
          const g2d = this.state.game;
          if (g2d && g2d.avatarFx) {
            this.setState({ game: Object.assign({}, g2d, { avatarFx: null }) });
          }
          this.queueBotAttacks(idx + 1);
        }, 700);
      }, 520);
    }, 550);
  }
}
