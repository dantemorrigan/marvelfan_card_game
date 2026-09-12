/* Developer Sandbox controls. Uses the same battle rules as the normal game. */
class MFCSandboxController {
  buildSandboxGame() {
    const mkSide = () => ({ deck: [], hand: [], field: [null, null, null, null, null], discard: [], mana: 10, manaCap: 10, heroesPlayedThisTurn: 0, avatar: makeAvatar(AVATARS[0].id) });
    const game = { player: mkSide(), bot: mkSide(), turn: "player", selectedUid: null, pendingBonus: null, winner: null, phase: "idle", atkFx: null, castFx: null, avatarFx: null, log: "", logHistory: [], sandbox: true };
    logEvent(game, "Developer Sandbox активирован. Поле и аватары пусты — заполняйте вручную.");
    return game;
  }

  sbUpdateGame(mutator) {
    const g = this.state.game;
    if (!g || !g.sandbox) return;
    mutator(g);
    this.setState({ game: Object.assign({}, g) });
  }

  sbFindHero(g, target) {
    if (!target) return null;
    const i = target.indexOf("|");
    if (i < 0) return null;
    const side = target.slice(0, i), uid = target.slice(i + 1);
    const hero = findHero(g, side, uid);
    return hero ? { side, hero } : null;
  }

  sbSpawnHero(data, side, dest) {
    this.sbUpdateGame((g) => {
      const p = g[side], inst = makeInstance(data);
      if (dest === "field") {
        const slot = p.field.findIndex((h) => h === null);
        if (slot < 0) { this.showToast("Поле заполнено — освободите слот."); return; }
        inst.sick = false; inst.usedAttack = false; p.field[slot] = inst;
        logEvent(g, "[Sandbox] " + inst.name + " добавлен на поле.");
      } else {
        p.hand.push(inst);
        logEvent(g, "[Sandbox] " + inst.name + " добавлен в руку.");
      }
    });
  }

  sbSpawnBonus(data, side) {
    this.sbUpdateGame((g) => { const inst = makeInstance(data); g[side].hand.push(inst); logEvent(g, "[Sandbox] Бонус-карта «" + inst.name + "» добавлена в руку."); });
  }

  sbSetAvatar(side, avatarId) {
    this.sbUpdateGame((g) => { g[side].avatar = makeAvatar(avatarId); logEvent(g, "[Sandbox] Аватар обновлён."); });
  }

  sbSetEnergy(side, value) {
    const v = Math.max(0, Math.min(99, parseInt(value, 10) || 0));
    this.sbUpdateGame((g) => { g[side].mana = v; g[side].manaCap = v; });
  }

  sbAdjustHeroHp(delta) { this.sbUpdateGame((g) => { const t = this.sbFindHero(g, this.state.sbEditTarget); if (t) t.hero.hp = Math.max(0, Math.min(t.hero.maxHp, t.hero.hp + delta)); }); }
  sbSetHeroHp(value) { const v = parseInt(value, 10); if (isNaN(v)) return; this.sbUpdateGame((g) => { const t = this.sbFindHero(g, this.state.sbEditTarget); if (t) t.hero.hp = Math.max(0, Math.min(t.hero.maxHp, v)); }); }
  sbHealHero() { this.sbUpdateGame((g) => { const t = this.sbFindHero(g, this.state.sbEditTarget); if (t) t.hero.hp = t.hero.maxHp; }); }

  sbDestroyHero() {
    const target = this.state.sbEditTarget;
    this.sbUpdateGame((g) => { const t = this.sbFindHero(g, target); if (!t) return; killHero(g, t.side, t.hero.uid, "Уничтожен через Sandbox."); });
    this.setState({ sbEditTarget: "" });
  }

  sbAdjustHeroStat(statKey, delta) { this.sbUpdateGame((g) => { const t = this.sbFindHero(g, this.state.sbEditTarget); if (!t || !t.hero.stats) return; t.hero.stats[statKey] = Math.max(1, t.hero.stats[statKey] + delta); recalcHp(t.hero); }); }
  sbAdjustAvatarHp(side, delta) { this.sbUpdateGame((g) => { const av = g[side].avatar; av.health = Math.max(0, Math.min(av.maxHealth, av.health + delta)); }); }
  sbHealAvatar(side) { this.sbUpdateGame((g) => { g[side].avatar.health = g[side].avatar.maxHealth; }); }
  sbStartTurn(side) { this.sbUpdateGame((g) => this.startTurn(g, side)); }
  sbSetWinner(winner) { this.sbUpdateGame((g) => { g.winner = winner; }); }

  sbCopyBoard(fromSide, toSide) {
    this.sbUpdateGame((g) => {
      g[toSide].field = g[fromSide].field.map((h) => {
        if (!h) return null;
        const copy = cloneGame(h); copy.uid = "c" + (uidCounter++); return copy;
      });
    });
    this.setState({ sbEditTarget: "" });
  }

  sbToggleKeyword(kwId) {
    this.sbUpdateGame((g) => {
      const t = this.sbFindHero(g, this.state.sbEditTarget);
      if (!t) return;
      t.hero.keywords = t.hero.keywords || [];
      const idx = t.hero.keywords.indexOf(kwId);
      if (idx >= 0) t.hero.keywords.splice(idx, 1); else t.hero.keywords.push(kwId);
    });
  }
}
