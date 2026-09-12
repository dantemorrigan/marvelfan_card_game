/*
ui/renderVals.js

Root view-model. Keeps DOM/template concerns out of the game controllers.
Collection cards are cached; game-state cloning uses cloneGame; gameplay delays
use the lifecycle timer registry so stale callbacks cannot survive navigation.
*/
function mfcRenderVals() {
  const cachedCards = this.getCollectionCardVMs();
  const cards = cachedCards.cards;
  const bonusCards = cachedCards.bonusCards;
  const st = this.state;
  const norm = (s) => (s || "").toLowerCase().replace(/ё/g, "е");
  const q = norm(st.search).trim();
  const filteredCards = cards.filter((c) => !q || norm(c.name).indexOf(q) >= 0);
  const filteredBonus = bonusCards.filter((c) => !q || norm(c.name).indexOf(q) >= 0);
  const showHeroSection = st.filter !== "bonus";
  const showBonusSection = st.filter !== "hero";
  const bonusPlaceholders = (!q && showBonusSection) ? Array.from({ length: BONUS_PLACEHOLDERS }, (_, i) => ({ i })) : [];
  const tiltOn = this.props.tilt !== false;

  const tilt = (e) => {
    if (!tiltOn || e.pointerType === "touch") return;
    const el = e.currentTarget, r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = "perspective(760px) rotateY(" + px * 13 + "deg) rotateX(" + (-py * 13) + "deg) scale(1.03)";
    const par = el.querySelector("[data-par]");
    if (par) par.style.transform = "translate(" + (-px * 12) + "px," + (-py * 12) + "px) scale(1.09)";
    const gl = el.querySelector("[data-gloss]");
    if (gl) gl.style.background = "radial-gradient(circle at " + (px + 0.5) * 100 + "% " + (py + 0.5) * 100 + "%, #ffffff33, transparent 58%)";
  };
  const untilt = (e) => {
    const el = e.currentTarget;
    el.style.transform = "";
    const par = el.querySelector("[data-par]");
    if (par) par.style.transform = "";
    const gl = el.querySelector("[data-gloss]");
    if (gl) gl.style.background = "";
  };

  const dark = st.dark;
  const ink = dark ? "#f4efe1" : "#17140f";
  const paper = dark ? "#231f18" : "#ffffff";
  const acc = this.props.accent || "#e0212f";
  const isCollection = st.screen === "collection";
  const isPlay = st.screen === "play";
  const g = st.game;
  const compact = !!st.isCompact;
  const vh = st.vh || 800;
  const vwPx = st.vw || 1200;
  const mobileLayout = vwPx < 900;
  const mobilePortrait = mobileLayout && vh > vwPx;
  const mobileLandscape = mobileLayout && !mobilePortrait;
  const isSetup = isPlay && !g;
  const isBattle = isPlay && !!g;
  const isMobile = mobileLayout;

  const setupPad = isMobile ? (compact ? "18px max(14px, env(safe-area-inset-right)) 18px max(14px, env(safe-area-inset-left))" : "26px max(20px, env(safe-area-inset-right)) 26px max(20px, env(safe-area-inset-left))") : "40px max(24px, env(safe-area-inset-right)) 40px max(24px, env(safe-area-inset-left))";
  const setupGap = isMobile ? (compact ? "14px" : "20px") : "30px";
  const setupTitleFont = isMobile ? "clamp(20px, 4.6vw, 32px)" : "clamp(30px, 5.4vw, 56px)";
  const setupShowDesc = !isMobile || !compact;
  const setupCardW = isMobile ? "clamp(132px, 27vw, 208px)" : "226px";
  const setupAvatarSize = isMobile ? "clamp(52px, 10vw, 84px)" : "92px";
  const setupAvatarFont = isMobile ? "clamp(20px, 4vw, 34px)" : "38px";
  const setupCardPad = isMobile ? "14px 10px 14px" : "18px 16px 20px";
  const setupCardGap = isMobile ? "10px" : "16px";
  const turnFontSize = mobilePortrait ? "10px" : (compact ? "11px" : "13px");
  const turnPad = mobilePortrait ? "5px 12px" : (compact ? "6px 14px" : "8px 20px");

  let headerH, logMaxHPx, handPadPx, avSize, arenaChrome, handH, fieldH;
  if (mobilePortrait) {
    headerH = 32; logMaxHPx = 16; handPadPx = 8;
    avSize = Math.round(Math.max(36, Math.min(46, vh * 0.05)));
    arenaChrome = 14;
    const chromeP = headerH + 2 * (avSize + 10) + (logMaxHPx + 6) + handPadPx + 30;
    handH = Math.round(Math.max(96, Math.min(vh * 0.17, 180)));
    fieldH = Math.floor(Math.max(110, (vh - chromeP - handH) / 2 - arenaChrome));
  } else {
    headerH = compact ? 26 : 34; logMaxHPx = 16; handPadPx = compact ? 8 : 14;
    avSize = Math.round(Math.max(30, Math.min(46, vh * 0.058)));
    const avatarRowH = avSize + 12;
    arenaChrome = compact ? 14 : 22;
    const chrome = headerH + (avatarRowH + 6) + (avatarRowH + 10) + (logMaxHPx + 8) + handPadPx + 8;
    const avail = Math.max(200, vh - chrome - arenaChrome * 2 - 46);
    handH = Math.max(84, Math.min(avail / 3.4, 220));
    fieldH = Math.round(handH * 1.38);
  }

  const handWpx = Math.round(handH * 2 / 3);
  const deckPileW = mobilePortrait ? "26px" : (compact ? "30px" : "46px");
  const deckPileH = mobilePortrait ? "36px" : (compact ? "42px" : "64px");
  const manaPipSize = mobilePortrait ? "6px" : (compact ? "7px" : "9px");
  const fieldGapPx = mobilePortrait ? 6 : (compact ? 6 : 12);
  const fieldArenaPadPx = mobilePortrait ? 6 : (compact ? 5 : 10);
  const fieldArenaPad = fieldArenaPadPx + "px";
  const fieldGap = fieldGapPx + "px";
  const fieldArenaH = (fieldH + arenaChrome) + "px";
  const rowCardSize = (count) => {
    const wMax = Math.round(fieldH * 2 / 3);
    if (!mobilePortrait || !count) return { w: wMax, h: fieldH };
    const availW = vwPx - 20 - fieldArenaPadPx * 2 - (count - 1) * fieldGapPx - 6;
    const w = Math.max(44, Math.min(wMax, Math.floor(availW / count)));
    return { w, h: Math.min(fieldH, Math.round(w * 1.5)) };
  };
  const botRowSz = rowCardSize(g ? g.bot.field.filter(Boolean).length : 0);
  const playerRowSz = rowCardSize(g ? g.player.field.filter(Boolean).length : 0);
  const botFieldCardW = botRowSz.w + "px";
  const botFieldCardH = mobilePortrait ? (botRowSz.h + "px") : "100%";
  const playerFieldCardW = playerRowSz.w + "px";
  const playerFieldCardH = mobilePortrait ? (playerRowSz.h + "px") : "100%";
  const avatarSize = avSize + "px";
  const avatarGlyphSize = Math.round(avSize * 0.42) + "px";
  const avatarNameFont = (mobilePortrait ? 10.5 : (avSize < 50 ? 10 : 12)) + "px";
  const avatarHpFont = (mobilePortrait ? 11 : (avSize < 50 ? 10 : 12)) + "px";
  const avatarBarW = (mobilePortrait ? 56 : (avSize < 50 ? 54 : 92)) + "px";
  const logPad = compact ? "3px 10px" : "5px 16px";
  const logFont = mobilePortrait ? "10.5px" : (compact ? "10px" : "11.5px");
  const logMaxH = logMaxHPx + "px";
  const logBoxStyle = "width: 100%; max-width: 640px; overflow: hidden; text-align: center;";
  const logCursor = "default";
  const handCardW = handWpx + "px";
  let handOverlapPx;
  if (mobilePortrait) {
    const nHand = g ? g.player.hand.length : 0;
    const step = nHand > 1 ? Math.min(Math.round(handWpx * 0.58), Math.floor((vwPx - 20 - handWpx) / (nHand - 1))) : 0;
    handOverlapPx = nHand > 1 ? (step - handWpx) : 0;
  } else handOverlapPx = -Math.round(handWpx * 0.42);
  const handLiftPx = Math.round(handH * (mobilePortrait ? 0.34 : 0.3));
  const handNameFont = Math.max(10, Math.round(handH * 0.082)) + "px";
  const handTypeFont = Math.max(7.5, Math.round(handH * 0.055)) + "px";
  const handCostSize = Math.max(20, Math.round(handH * 0.16)) + "px";
  const handCostFont = Math.max(9, Math.round(handH * 0.068)) + "px";
  const handStatFont = Math.max(10, Math.round(handH * 0.075)) + "px";
  const handNameTop = Math.round(handH * 0.2) + "px";
  const handBadgeInset = Math.max(5, Math.round(handH * 0.04)) + "px";
  const handPad = (mobilePortrait ? "8px" : (compact ? "5px" : "10px")) + " 4px 2px";
  const endTurnPad = isMobile ? "0" : (compact ? "7px 12px" : "10px 16px");
  const endTurnFont = mobilePortrait ? "8.5px" : (compact ? "9px" : "10.5px");
  const endTurnMinH = compact ? "32px" : "42px";
  const endTurnSizePx = mobilePortrait ? Math.round(Math.max(48, Math.min(60, vh * 0.075))) : Math.round(Math.max(52, Math.min(74, vh * 0.11)));
  const endTurnSize = endTurnSizePx + "px";
  const endTurnPosition = mobilePortrait
    ? "position: fixed; right: max(10px, env(safe-area-inset-right)); bottom: " + (handH + handPadPx + 16) + "px; z-index: 30; width: " + endTurnSize + "; height: " + endTurnSize + "; padding: 0; white-space: normal; line-height: 1.15;"
    : mobileLandscape
      ? "position: fixed; right: max(8px, env(safe-area-inset-right)); top: 50%; margin-top: -" + Math.round(endTurnSizePx / 2) + "px; z-index: 25; width: " + endTurnSize + "; height: " + endTurnSize + "; padding: 0; white-space: normal; line-height: 1.15;"
      : "position: absolute; right: 16px; top: 50%; transform: translateY(-50%); z-index: 25; white-space: normal; line-height: 1.15; writing-mode: vertical-rl; text-orientation: mixed;";
  const boardPadRight = mobileLayout ? "0" : (compact ? "56px" : "68px");
  const handEndPad = mobileLandscape ? "0 " + (endTurnSizePx + 20) + "px 0 4px" : "0 4px";
  const handWrapOverflow = mobileLandscape ? "overflow-x: auto; overflow-y: hidden; -webkit-overflow-scrolling: touch;" : "overflow: visible;";
  const playerRowPad = mobilePortrait ? ("10px " + (endTurnSizePx + 16) + "px 4px 2px") : "12px 2px 4px";

  const selectAttacker = (uid) => {
    const cur = this.state.game;
    if (!cur || cur.winner || cur.pendingBonus || cur.turn !== "player") return;
    this.blip(420, 0.08, "sine", 0.03);
    this.setState({ game: Object.assign({}, cur, { selectedUid: uid }) });
  };
  const doAttack = (defUid) => {
    const cur = this.state.game;
    if (!cur || cur.winner || !cur.selectedUid || cur.pendingBonus || cur.turn !== "player") return;
    const atkUid = cur.selectedUid;
    this.blip(320, 0.08, "sine", 0.03);
    this.setState({ game: Object.assign({}, cur, { atkFx: { side: "player", uid: atkUid }, selectedUid: null }) });
    this.setGameTimer(() => {
      const cur2 = this.state.game;
      if (!cur2 || cur2.winner || cur2.turn !== "player") return;
      const next = cloneGame(cur2);
      logEvent(next, this.attack(next, "player", atkUid, "bot", defUid));
      next.atkFx = null;
      this.blip(220, 0.16, "sawtooth", 0.06); this.buzz(20);
      this.setState({ game: next });
      this.setGameTimer(() => {
        const g3 = this.state.game;
        if (!g3) return;
        const g4 = Object.assign({}, g3);
        this.resolveAttackDamage(g4);
        this.setState({ game: g4 });
        this.clearFxLater(650);
      }, 520);
    }, 320);
  };
  const doAttackAvatar = () => {
    const cur = this.state.game;
    if (!cur || cur.winner || !cur.selectedUid || cur.pendingBonus || cur.turn !== "player") return;
    const attackerHero = findHero(cur, "player", cur.selectedUid);
    if (avatarProtected(cur, "bot") && !bypassesAvatarProtection(attackerHero)) { this.showToast("Аватар защищён героями — сначала атакуйте героев."); return; }
    const atkUid = cur.selectedUid;
    this.blip(320, 0.08, "sine", 0.03);
    this.setState({ game: Object.assign({}, cur, { atkFx: { side: "player", uid: atkUid }, selectedUid: null }) });
    this.setGameTimer(() => {
      const cur2 = this.state.game;
      if (!cur2 || cur2.winner || cur2.turn !== "player") return;
      const next = cloneGame(cur2);
      logEvent(next, this.attackAvatarNow(next, "player", atkUid, "bot"));
      next.atkFx = null;
      this.blip(200, 0.2, "sawtooth", 0.07); this.buzz(28);
      this.setState({ game: next });
      this.setGameTimer(() => {
        const g3 = this.state.game;
        if (!g3) return;
        const g4 = Object.assign({}, g3);
        this.resolveAvatarDamage(g4);
        this.setState({ game: g4 });
        this.setGameTimer(() => {
          const g5 = this.state.game;
          if (g5 && g5.avatarFx) this.setState({ game: Object.assign({}, g5, { avatarFx: null }) });
        }, 700);
      }, 520);
    }, 320);
  };
  const peekTop = () => {
    const cur = this.state.game;
    if (!cur || cur.winner || cur.turn !== "player") return;
    const av = cur.player.avatar;
    if (av.passiveAbility !== "peekTop" || av.peekUsed) return;
    const top = cur.player.deck.length ? cur.player.deck[weightedDrawIndex(cur.player.deck, cur.player.manaCap)] : null;
    const next = cloneGame(cur);
    next.player.avatar.peekUsed = true;
    logEvent(next, top ? "Вероятная следующая карта: " + top.name + " (⚡" + top.cost + ")." : "Колода пуста.");
    this.blip(520, 0.12, "sine", 0.04);
    const card = top ? { name: top.name, art: top.art, cost: top.cost, typeLabel: top.type === "hero" ? "Герой" : "Бонус" } : null;
    this.setState({ game: next, peekCard: card });
    if (card) this.setGameTimer(() => this.setState((s) => (s.peekCard && s.peekCard.name === card.name ? { peekCard: null } : null)), 3200);
  };
  const playHand = (card) => {
    const cur = this.state.game;
    if (!cur || cur.winner || cur.turn !== "player" || cur.pendingBonus || cur.player.mana < card.cost) return;
    if (card.type === "hero") {
      if (!cur.player.field.some((h) => h === null)) return;
      const next = cloneGame(cur);
      const ok = this.playHeroCard(next, "player", card.uid);
      if (ok === "pending") { this.blip(300, 0.1, "sine", 0.04); this.setState({ game: next }); return; }
      if (ok) { logEvent(next, card.name + " выходит на поле (⚡" + card.cost + ", усталость призыва — атакует со следующего хода)."); this.blip(360, 0.1, "triangle", 0.05); this.setState({ game: next }); }
      return;
    }
    const eff = BONUS_EFFECTS[card.key];
    if (!eff) return;
    const next = cloneGame(cur);
    next.player.mana -= card.cost;
    this.discardBonusCard(next, "player", card.uid);
    if (eff.needsTarget) {
      next.pendingBonus = { key: card.key, name: card.name };
      next.log = "Выберите героя для карты «" + card.name + "».";
      this.blip(300, 0.1, "sine", 0.04);
      this.setState({ game: next });
      return;
    }
    logEvent(next, eff.resolve(next, "player", null, null));
    next.castFx = bonusFx(card.key, card.name);
    this.blip(500, 0.2, "triangle", 0.07); this.buzz(24);
    this.setState({ game: next });
    this.clearFxLater(1000);
  };
  const resolveTarget = (side, uid) => {
    const cur = this.state.game;
    if (!cur || !cur.pendingBonus) return;
    const pb = cur.pendingBonus;
    const next = cloneGame(cur);
    if (pb.isHeroAbility) {
      const ability = BATTLECRY_TARGETED[pb.key];
      const caster = findHero(next, pb.heroSide, pb.heroUid);
      logEvent(next, caster ? ability.resolve(next, pb.heroSide, caster, side, uid) : pb.name + ": заклинатель не найден.");
      recalcCaptainAura(next, "player"); recalcCaptainAura(next, "bot");
    } else {
      const eff = BONUS_EFFECTS[pb.key];
      logEvent(next, eff.resolve(next, "player", side, uid));
    }
    next.castFx = bonusFx(pb.key, pb.name);
    next.pendingBonus = null;
    this.blip(560, 0.2, "triangle", 0.07); this.buzz(24);
    this.setState({ game: next });
    this.clearFxLater(1000);
  };

  const openFieldCard = (h) => (e) => { if (e && e.stopPropagation) e.stopPropagation(); this.setState({ fieldSel: h }); };
  const closeFieldCard = () => this.setState({ fieldSel: null });
  const openDiscard = (side) => () => { this.blip(300, 0.08, "sine", 0.03); this.setState({ discardView: side }); };
  const closeDiscard = () => this.setState({ discardView: null, pendingRevive: null });
  const activateEyeOfAgamotto = (casterUid) => () => {
    const cur = this.state.game;
    if (!cur || cur.winner || cur.turn !== "player") return;
    const caster = findHero(cur, "player", casterUid);
    if (!caster || caster.ability !== "eyeOfAgamotto" || caster.usedActive) return;
    if (!cur.player.discard.some((d) => d.type === "hero")) { this.showToast("В сбросе нет героев для возвращения."); return; }
    this.blip(460, 0.14, "sine", 0.05);
    this.setState({ discardView: "player", pendingRevive: casterUid, fieldSel: null });
  };
  const resolveRevive = (uid) => {
    const cur = this.state.game;
    if (!cur || !cur.pendingRevive) return;
    const casterUid = cur.pendingRevive;
    const next = cloneGame(cur);
    const caster = findHero(next, "player", casterUid);
    const idx = next.player.discard.findIndex((d) => d.uid === uid);
    if (!caster || idx < 0 || next.player.hand.length >= 7) { this.setState({ discardView: null, pendingRevive: null }); return; }
    const revived = next.player.discard.splice(idx, 1)[0];
    revived.alive = true; revived.dying = false; revived.discardReason = null;
    revived.hp = revived.maxHp; revived.sick = false; revived.usedAttack = false;
    next.player.hand.push(revived); caster.usedActive = true;
    logEvent(next, caster.name + " (Око Агамотто) возвращает " + revived.name + " в руку.");
    this.blip(560, 0.2, "triangle", 0.07); this.buzz(24);
    this.setState({ game: next, discardView: null, pendingRevive: null });
  };

  const fieldVM = (side) => {
    if (!g) return [];
    const live = g[side].field.filter(Boolean);
    return live.map((h) => {
      const isPending = !!g.pendingBonus;
      const readyToAttack = h.alive && !h.sick && !h.usedAttack && !h.dying;
      const targetableForPlayer = side === "bot" && g.turn === "player" && !!g.selectedUid && !h.sick && !isPending && !h.dying;
      let onClick = null;
      if (!h.dying) {
        if (isPending) onClick = () => resolveTarget(side, h.uid);
        else if (side === "player" && g.turn === "player" && readyToAttack) onClick = () => selectAttacker(h.uid);
        else if (side === "bot" && g.turn === "player" && g.selectedUid && !h.sick) onClick = () => doAttack(h.uid);
      }
      if (!onClick && side === "player" && h.alive && !isPending && !h.dying) {
        if (h.sick) onClick = () => this.showToast("Эта карта восстанавливается после призыва — атакует со следующего хода.");
        else if (h.usedAttack) onClick = () => this.showToast("Эта карта уже атаковала.");
      }
      const isSel = g.selectedUid === h.uid;
      const stateLabel = h.sick ? "⏳ Усталость" : (h.usedAttack ? "Атаковал" : "");
      const fx = Array.isArray(g.fx) ? g.fx.find((f) => f.side === side && f.uid === h.uid) : null;
      const isAttacking = !!g.atkFx && g.atkFx.side === side && g.atkFx.uid === h.uid;
      const animParts = [];
      if (h.dying) animParts.push("dieFade .5s ease forwards");
      else {
        if (h.justIn) animParts.push("cardIn .5s cubic-bezier(.2,.8,.25,1) both");
        if (fx) animParts.push("shakeHit .4s ease");
        if (isAttacking) animParts.push((side === "player" ? "lungeUp" : "lungeDown") + " .5s ease, atkGlow .5s ease infinite");
        else if (side === "bot" && targetableForPlayer) animParts.push("atkGlow 1.4s ease infinite");
        else if (h.buffed) animParts.push("buffGlow 1.8s ease infinite");
        else if (h.debuffed) animParts.push("debuffGlow 1.8s ease infinite");
        else if (side === "player" && readyToAttack) animParts.push("readyGlow 2s ease infinite");
      }
      return {
        filled: true, name: h.name, hp: h.hp, str: h.stats.s, art: h.art, onClick,
        lift: isSel ? "translateY(-12px) scale(1.06)" : "none", z: isSel ? 6 : 1,
        cursor: onClick ? "pointer" : "default",
        cardFilter: side === "player" ? ((h.sick || h.usedAttack) ? "grayscale(0.55) brightness(0.62)" : "none") : (targetableForPlayer ? "none" : "grayscale(0.4) brightness(0.75)"),
        hasState: !!stateLabel, stateLabel,
        kwIcons: kwIconsOf(h.keywords), hasKws: !!(h.keywords && h.keywords.length), hasAbility: !!h.ability,
        hasFx: !!fx, fxText: fx ? (fx.dead ? "☠" : "-" + fx.dmg) : "",
        anim: animParts.length ? animParts.join(", ") : "none",
        openInfo: openFieldCard(h),
        border: isSel ? "3px solid " + acc : (isPending ? "2px dashed #14a893" : (isAttacking ? "2px solid #ffd27a" : (side === "bot" && targetableForPlayer ? "3px solid " + acc : "2px solid #17140f")))
      };
    });
  };

  const fieldSelVM = (() => {
    const h = st.fieldSel;
    if (!h) return null;
    const vals = [h.stats.s, h.stats.a, h.stats.i, h.stats.k];
    const ability = h.ability ? HERO_ABILITIES[h.ability] : null;
    const onPlayerField = !!g && g.player.field.some((x) => x && x.uid === h.uid);
    const canActivate = onPlayerField && h.ability === "eyeOfAgamotto" && !h.usedActive && !!g && g.turn === "player" && !g.pendingBonus && !g.winner && g.player.discard.some((d) => d.type === "hero");
    return {
      name: h.name, art: h.art, hp: h.hp, maxHp: h.maxHp,
      hpPct: h.maxHp ? Math.max(0, Math.min(100, Math.round((h.hp / h.maxHp) * 100))) : 0,
      stats: LABELS.map((l, k) => ({ label: l, pips: [0, 1, 2, 3, 4].map((n) => ({ bg: n < vals[k] ? acc : ink + "22" })) })),
      kws: kwChips(h.keywords), hasKws: !!(h.keywords && h.keywords.length),
      hasAbility: !!ability, abilityName: ability ? ability.name : "", abilityType: ability ? ability.type : "", abilityText: ability ? ability.text : "",
      abilityUsed: !!h.usedActive || !!h.usedRevive, canActivate, activateAbility: activateEyeOfAgamotto(h.uid),
      discardReason: !h.alive ? (h.discardReason || null) : null,
      statusLabel: !h.alive ? "Уничтожен" : (h.sick ? "Усталость призыва" : (h.usedAttack ? "Уже атаковал" : "Готов к атаке")),
      statusBg: !h.alive ? "#c21f2b" : (h.sick ? "#8a8a8a" : (h.usedAttack ? "#8a8a8a" : "#2b8a3e")),
      buffed: !!h.buffed, debuffed: !!h.debuffed
    };
  })();

  const discardVM = (() => {
    if (!g || !st.discardView) return null;
    const side = st.discardView;
    const reviving = side === "player" && !!st.pendingRevive;
    const list = g[side].discard.slice().reverse().map((h) => ({
      uid: h.uid, name: h.name, art: h.art,
      reason: (reviving && h.type === "hero") ? "Нажмите, чтобы вернуть в руку" : (h.discardReason || "Причина не зафиксирована."),
      open: (reviving && h.type === "hero") ? (() => resolveRevive(h.uid)) : (() => this.setState({ fieldSel: h }))
    }));
    return { side, label: side === "player" ? "Ваш сброс" : "Сброс бота", cards: list, empty: list.length === 0 };
  })();

  const avatarVM = (side) => {
    if (!g) return null;
    const av = g[side].avatar;
    const prot = avatarProtected(g, side);
    const fx = g.avatarFx && g.avatarFx.side === side ? g.avatarFx : null;
    const canTarget = side === "bot" && g.turn === "player" && !!g.selectedUid && !g.pendingBonus && !g.winner;
    const selectedHero = canTarget ? findHero(g, "player", g.selectedUid) : null;
    const attackable = canTarget && !(selectedHero && selectedHero.isIllusion) && (!prot || bypassesAvatarProtection(selectedHero));
    return {
      name: av.name, title: av.title, glyph: av.glyph, image: av.image, hp: av.health, maxHp: av.maxHealth,
      hpPct: Math.max(0, Math.min(100, Math.round((av.health / av.maxHealth) * 100))), passiveName: av.passiveName, passiveText: av.passiveText,
      protected: prot, open: !prot, attackable,
      ring: attackable ? "0 0 0 4px " + acc + ", 0 0 22px 6px " + acc + "88" : (prot ? "0 0 0 3px #58a6ff66" : "3px 3px 0 " + ink + "30"),
      onClick: attackable ? doAttackAvatar : (canTarget ? () => this.showToast("Аватар защищён героями — сначала атакуйте героев.") : null),
      cursor: canTarget ? "pointer" : "default", anim: fx ? "shakeHit .4s ease" : "none", hasFx: !!fx, fxText: fx ? "-" + fx.dmg : "",
      canPeek: side === "player" && av.passiveAbility === "peekTop" && !av.peekUsed && g.turn === "player" && !g.winner
    };
  };

  const avatarChoices = AVATARS.map((a) => {
    const on = st.pickedAvatar === a.id;
    return {
      id: a.id, name: a.name, title: a.title, glyph: a.glyph, image: a.image, hp: a.maxHealth,
      passiveName: a.passiveName, passiveText: a.passiveText, statsText: a.statsText,
      border: on ? "4px solid " + acc : "3px solid " + ink,
      shadow: on ? "0 0 0 5px " + acc + "44, 6px 6px 0 " + ink + "40" : "5px 5px 0 " + ink + "26",
      lift: on ? "translateY(-8px)" : "none",
      onClick: () => { this.blip(430, 0.1, "sine", 0.04); this.buzz(10); this.setState({ pickedAvatar: a.id }); }
    };
  });

  const manaPips = (p) => Array.from({ length: 10 }, (_, i) => ({ i, bg: i < p.mana ? acc : (i < p.manaCap ? acc + "55" : "#17140f22"), glow: i < p.mana ? ("0 0 6px " + acc + "aa") : "none" }));
  const handVM = () => {
    if (!g) return [];
    const canPlay = g.turn === "player" && !g.pendingBonus;
    const list = g.player.hand, n = list.length, mid = (n - 1) / 2, hoverIdx = st.handHover;
    return list.map((c, i) => {
      const affordable = g.player.mana >= c.cost;
      const playable = canPlay && affordable && (c.type !== "hero" || g.player.field.some((h) => h === null));
      const angleScale = mobilePortrait ? 4 : (compact ? 5 : 7), angleMax = mobilePortrait ? 14 : (compact ? 18 : 24), tyScale = mobilePortrait ? 3 : (compact ? 4 : 7), tyMax = mobilePortrait ? 10 : (compact ? 12 : 22);
      const off = i - mid, angle = Math.max(-angleMax, Math.min(angleMax, off * angleScale)), ty = Math.min(tyMax, Math.abs(off) * tyScale), isHover = hoverIdx === i;
      let spreadX = 0;
      if (hoverIdx != null && !isHover) {
        const dist = i - hoverIdx, ad = Math.abs(dist), push = ad === 1 ? (mobilePortrait ? 14 : (compact ? 22 : 38)) : (ad === 2 ? (mobilePortrait ? 6 : (compact ? 10 : 18)) : 0);
        spreadX = push * (dist > 0 ? 1 : -1);
      }
      const transform = isHover ? "rotate(0deg) translateY(-" + handLiftPx + "px) translateX(0px) scale(" + (mobilePortrait ? 1.12 : (compact ? 1.14 : 1.18)) + ")" : "rotate(" + angle + "deg) translateY(" + ty + "px) translateX(" + spreadX + "px)";
      const onPressStart = () => {
        this._handLongPress = false; clearTimeout(this._handPressTimer);
        this._handPressTimer = setTimeout(() => { this._handLongPress = true; this.blip(360, 0.08, "sine", 0.03); this.setState({ fieldSel: c }); }, 480);
      };
      const onPressCancel = () => clearTimeout(this._handPressTimer);
      return {
        uid: c.uid, name: c.name, art: c.art, isHero: c.type === "hero", kwIcons: kwIconsOf(c.keywords), hasKws: !!(c.keywords && c.keywords.length),
        hp: c.hp, str: c.stats ? c.stats.s : null, cost: c.cost, typeLabel: c.type === "hero" ? "Герой" : "Бонус", typeColor: c.type === "hero" ? "#a9d8ff" : "#7fe9df",
        border: c.type === "hero" ? "#17140f" : "#14a893", dim: playable ? 1 : 0.5, cursor: playable ? "pointer" : "default",
        onClick: () => { if (this._handLongPress) { this._handLongPress = false; return; } if (playable) playHand(c); },
        onPointerDown: onPressStart, onPointerUp: onPressCancel, onPointerCancel: onPressCancel,
        onEnter: () => this.setState({ handHover: i }),
        onLeave: () => { onPressCancel(); this.setState((s) => s.handHover === i ? { handHover: null } : null); },
        overlap: i === 0 ? "0px" : (handOverlapPx + "px"), z: isHover ? 100 : i, transform,
        anim: c.justDrawn ? "drawIn .5s cubic-bezier(.2,.8,.25,1) both" : "none",
        shadow: isHover ? "0 20px 34px -10px #00000070, 0 0 0 3px " + acc : "2px 2px 0 #17140f30"
      };
    });
  };

  const defaultName = this.props.playerName || "Никита";
  const currentName = st.customName || defaultName;
  const startEditName = () => { this.blip(280, 0.08, "sine", 0.03); this.setState({ editingName: true, nameDraft: currentName, showNameOnboarding: false }); writeNameOnboardingSeen(); };
  const onNameDraftChange = (e) => this.setState({ nameDraft: e.target.value.slice(0, 18) });
  const saveName = () => { const trimmed = (st.nameDraft || "").trim(), finalName = trimmed || defaultName; writeStoredName(finalName); this.setState({ customName: finalName, editingName: false }); };
  const cancelEditName = () => this.setState({ editingName: false });
  const onNameKeyDown = (e) => { if (e.key === "Enter") saveName(); else if (e.key === "Escape") cancelEditName(); };
  const dismissOnboarding = () => { writeNameOnboardingSeen(); this.setState({ showNameOnboarding: false }); };

  const sandboxActive = !!(g && g.sandbox);
  let sbVM = null;
  if (sandboxActive) {
    const cardQ = norm(st.sbCardQuery).trim();
    const cardResults = DATA.filter((d) => !d.collectionOnly && (!cardQ || norm(d.name).indexOf(cardQ) >= 0)).slice(0, 18).map((d) => ({ name: d.name, isBonus: false, canField: true, spawnField: () => this.sbSpawnHero(d, st.sbSide, "field"), spawnHand: () => this.sbSpawnHero(d, st.sbSide, "hand") }))
      .concat(BONUS.filter((d) => !cardQ || norm(d.name).indexOf(cardQ) >= 0).map((d) => ({ name: d.name, isBonus: true, canField: false, spawnField: () => {}, spawnHand: () => this.sbSpawnBonus(d, st.sbSide) })));
    const avatarOptions = AVATARS.map((a) => ({ id: a.id, name: a.name }));
    const fieldTargets = [];
    ["player", "bot"].forEach((side) => g[side].field.forEach((h) => { if (h) fieldTargets.push({ value: side + "|" + h.uid, label: (side === "player" ? "Игрок" : "Бот") + ": " + h.name + " (" + h.hp + "/" + h.maxHp + " HP)" }); }));
    const editT = this.sbFindHero(g, st.sbEditTarget), editHero = editT ? editT.hero : null;
    const editAbilityKey = editHero ? HERO_ABILITY_TABLE[editHero.name] : null, editAbility = editAbilityKey ? HERO_ABILITIES[editAbilityKey] : null;
    const editFlags = [];
    if (editHero) {
      if (editHero.sick) editFlags.push("Усталость призыва"); if (editHero.usedAttack) editFlags.push("Уже атаковал"); if (editHero.buffed) editFlags.push("Бафф"); if (editHero.debuffed) editFlags.push("Дебафф"); if (editHero.frozen) editFlags.push("Заморожен"); if (editHero.usedActive) editFlags.push("Способность использована");
    }
    const editKeywords = editHero ? Object.keys(KEYWORDS).map((id) => { const active = editHero.keywords && editHero.keywords.indexOf(id) >= 0; return { id, icon: KEYWORDS[id].icon, name: KEYWORDS[id].name, active, bg: active ? "#6c2bd9" : "transparent", toggle: () => this.sbToggleKeyword(id) }; }) : [];
    const scenarios = readSandboxScenarios();
    const scenarioNames = Object.keys(scenarios).sort().map((name) => ({ name, load: () => this.sbLoadScenario(name), del: () => this.sbDeleteScenario(name) }));
    const eventLog = (g.logHistory || []).slice().reverse().map((text, i) => ({ i, text }));
    sbVM = {
      open: st.sbOpen, toggleGlyph: st.sbOpen ? "▲" : "▼", toggleOpen: () => this.setState({ sbOpen: !st.sbOpen }),
      exit: () => { this.clearGameTimers(); exitFullscreenSafe(); this.stopBgm(1500); this.setState({ screen: "collection", game: null, sbEditTarget: "" }); },
      side: st.sbSide, sidePlayerBg: st.sbSide === "player" ? "#6c2bd9" : "transparent", sideBotBg: st.sbSide === "bot" ? "#6c2bd9" : "transparent",
      setSidePlayer: () => this.setState({ sbSide: "player" }), setSideBot: () => this.setState({ sbSide: "bot" }),
      cardQuery: st.sbCardQuery, onCardQuery: (e) => this.setState({ sbCardQuery: e.target.value }), cardResults,
      aiOn: st.sbAiOn, aiLabel: st.sbAiOn ? "ВКЛ" : "ВЫКЛ", aiBtnBg: st.sbAiOn ? "#14a893" : "#c21f2b", toggleAi: () => this.setState({ sbAiOn: !st.sbAiOn }),
      copyBotToPlayer: () => this.sbCopyBoard("bot", "player"), copyPlayerToBot: () => this.sbCopyBoard("player", "bot"), avatarOptions,
      setAvatarPlayer: (e) => this.sbSetAvatar("player", e.target.value), setAvatarBot: (e) => this.sbSetAvatar("bot", e.target.value),
      energyPlayerDraft: st.sbEnergyPlayerDraft, onEnergyPlayerDraft: (e) => this.setState({ sbEnergyPlayerDraft: e.target.value }), applyEnergyPlayer: () => this.sbSetEnergy("player", st.sbEnergyPlayerDraft),
      energyBotDraft: st.sbEnergyBotDraft, onEnergyBotDraft: (e) => this.setState({ sbEnergyBotDraft: e.target.value }), applyEnergyBot: () => this.sbSetEnergy("bot", st.sbEnergyBotDraft),
      playerMana: g.player.mana + "/" + g.player.manaCap, botMana: g.bot.mana + "/" + g.bot.manaCap,
      startPlayerTurn: () => this.sbStartTurn("player"), startBotTurn: () => this.sbStartTurn("bot"), winPlayer: () => this.sbSetWinner("player"), winBot: () => this.sbSetWinner("bot"),
      playerAvatarHp: g.player.avatar.health + "/" + g.player.avatar.maxHealth, botAvatarHp: g.bot.avatar.health + "/" + g.bot.avatar.maxHealth,
      avatarHpUpPlayer: () => this.sbAdjustAvatarHp("player", 1), avatarHpDownPlayer: () => this.sbAdjustAvatarHp("player", -1), avatarHealPlayer: () => this.sbHealAvatar("player"),
      avatarHpUpBot: () => this.sbAdjustAvatarHp("bot", 1), avatarHpDownBot: () => this.sbAdjustAvatarHp("bot", -1), avatarHealBot: () => this.sbHealAvatar("bot"),
      fieldTargets, hasFieldTargets: fieldTargets.length > 0, editTargetValue: st.sbEditTarget, onSelectEditTarget: (e) => this.setState({ sbEditTarget: e.target.value, sbHpDraft: "" }),
      hasEditHero: !!editHero, editHeroName: editHero ? editHero.name : "", editHeroHp: editHero ? editHero.hp + " / " + editHero.maxHp : "",
      editHeroStats: editHero && editHero.stats ? [
        { key: "s", label: LABELS[0], val: editHero.stats.s, up: () => this.sbAdjustHeroStat("s", 1), down: () => this.sbAdjustHeroStat("s", -1) },
        { key: "a", label: LABELS[1], val: editHero.stats.a, up: () => this.sbAdjustHeroStat("a", 1), down: () => this.sbAdjustHeroStat("a", -1) },
        { key: "i", label: LABELS[2], val: editHero.stats.i, up: () => this.sbAdjustHeroStat("i", 1), down: () => this.sbAdjustHeroStat("i", -1) },
        { key: "k", label: LABELS[3], val: editHero.stats.k, up: () => this.sbAdjustHeroStat("k", 1), down: () => this.sbAdjustHeroStat("k", -1) }
      ] : [],
      hpUp: () => this.sbAdjustHeroHp(1), hpDown: () => this.sbAdjustHeroHp(-1), heal: () => this.sbHealHero(), destroy: () => this.sbDestroyHero(),
      hpDraft: st.sbHpDraft, onHpDraft: (e) => this.setState({ sbHpDraft: e.target.value }), applyHpDraft: () => this.sbSetHeroHp(st.sbHpDraft),
      hasAbilityInfo: !!editAbility, editAbilityName: editAbility ? editAbility.name : "", editAbilityType: editAbility ? editAbility.type : "", editAbilityText: editAbility ? editAbility.text : "",
      hasFlags: editFlags.length > 0, editFlagsText: editFlags.join(" · "), editKeywords,
      scenarioName: st.sbScenarioName, onScenarioName: (e) => this.setState({ sbScenarioName: e.target.value }), saveScenario: () => this.sbSaveScenario(st.sbScenarioName), scenarioList: scenarioNames, hasScenarios: scenarioNames.length > 0,
      logOpen: st.sbLogOpen, logToggleGlyph: st.sbLogOpen ? "▲" : "▼", toggleLog: () => this.setState({ sbLogOpen: !st.sbLogOpen }), eventLog, hasEventLog: eventLog.length > 0
    };
  }

  return {
    sandboxActive, sb: sbVM, playerName: currentName, editingName: st.editingName, showNameDisplay: !st.editingName, nameDraft: st.nameDraft,
    startEditName, onNameDraftChange, onNameKeyDown, saveName, cancelEditName, showNameOnboarding: isCollection && !st.editingName && st.showNameOnboarding, dismissOnboarding,
    accent: acc, bg: dark ? "#17140f" : "#f4efe1", ink, paper, dotColor: dark ? "#f4efe114" : "#17140f14", themeLabel: dark ? "Светлая тема" : "Тёмная тема",
    screen: st.screen, isCollection, isPlay, isSetup, isBattle,
    game: g ? { history: (() => { let hst = (g.logHistory || []).slice(-1).reverse(); if (g.pendingBonus) hst = ["Выберите героя для карты «" + g.pendingBonus.name + "» (клик по герою на поле)."].concat(hst); return hst.slice(0, 1).map((t) => ({ text: t, weight: 800, color: ink })); })() } : { history: [] },
    turnLabel: g ? (g.turn === "player" ? "Ваш ход" : "Ход бота") : "", turnColor: g ? (g.turn === "player" ? acc : ink + "99") : ink,
    isPlayerTurn: !!g && g.turn === "player", isBotTurn: !!g && g.turn === "bot", isBotAttacking: !!g && g.phase === "botAttacking", isBotThinking: !!g && g.turn === "bot" && g.phase !== "botAttacking",
    hasCastFx: !!g && !!g.castFx, castName: g && g.castFx ? g.castFx.name : "", castColor: g && g.castFx ? (g.castFx.color || acc) : acc,
    castAnim: (() => { const map = { gold: "fxGold 1s ease both", electric: "fxElectric 1s steps(2) both", fire: "fxFire 1s ease both", rift: "fxRift 1s ease both", glitch: "fxGlitch 1s steps(3) both" }; return (g && g.castFx && map[g.castFx.effect]) || "castFlash 1s ease both"; })(),
    endTurnBg: g && g.turn === "player" && !g.pendingBonus ? acc : paper, endTurnColor: g && g.turn === "player" && !g.pendingBonus ? "#fff" : ink, endTurnAnim: g && g.turn === "player" && !g.pendingBonus ? "ringPulseSoft 1.8s ease infinite" : "none",
    setupPad, setupGap, setupTitleFont, setupShowDesc, setupCardW, setupAvatarSize, setupAvatarFont, setupCardPad, setupCardGap, turnFontSize, turnPad,
    deckPileW, deckPileH, botDeckAnim: g && g.deckFx === "bot" ? "deckPulse .5s ease" : "none", playerDeckAnim: g && g.deckFx === "player" ? "deckPulse .5s ease" : "none", manaPipSize,
    fieldArenaPad, fieldGap, fieldArenaH, logPad, logFont, logMaxH, handCardW, handPad, handNameFont, handTypeFont, handCostSize, handCostFont, handStatFont, handNameTop, handBadgeInset,
    endTurnPad, endTurnFont, endTurnMinH, endTurnPosition, handEndPad, boardPadRight, playerRowPad, botFieldCardW, botFieldCardH, playerFieldCardW, playerFieldCardH,
    logBoxStyle, logCursor, handWrapOverflow, toggleLog: () => { if (mobileLayout) this.setState((s) => ({ logOpen: !s.logOpen })); },
    player: g ? { field: fieldVM("player"), fieldEmpty: liveHeroCount(g, "player") === 0, hand: handVM(), handCount: g.player.hand.length, deckCount: g.player.deck.length, discardCount: g.player.discard.length, mana: g.player.mana, manaCap: g.player.manaCap, manaPips: manaPips(g.player) } : { field: [], fieldEmpty: true, hand: [], handCount: 0, deckCount: 0, discardCount: 0, mana: 0, manaCap: 0, manaPips: [] },
    bot: g ? { field: fieldVM("bot"), fieldEmpty: liveHeroCount(g, "bot") === 0, deckCount: g.bot.deck.length, discardCount: g.bot.discard.length, mana: g.bot.mana, manaCap: g.bot.manaCap, manaPips: manaPips(g.bot) } : { field: [], fieldEmpty: true, deckCount: 0, discardCount: 0, mana: 0, manaCap: 0, manaPips: [] },
    playerAvatar: avatarVM("player"), botAvatar: avatarVM("bot"), avatarChoices, avatarSize, avatarGlyphSize, avatarNameFont, avatarHpFont, avatarBarW,
    handKwBottom: (Math.max(5, Math.round(handH * 0.04)) + Math.round(handH * 0.11)) + "px", handKwFont: Math.max(9, Math.round(handH * 0.066)) + "px",
    peekCard: st.peekCard || null, peekLabel: mobilePortrait ? "◉ Колода" : "◉ Заглянуть в колоду", burnFx: g && g.burnFx && g.burnFx.side === "player" ? { name: g.burnFx.name } : null, peekTop,
    hasWinner: !!g && !!g.winner, winTitle: g && g.winner === "player" ? "Победа" : "Поражение",
    winText: g && g.winner === "player" ? "Аватар противника уничтожен. Ваши герои удержали поле." : "Ваш аватар пал. В следующий раз держите защиту из трёх героев дольше.",
    winColor: g && g.winner === "player" ? "#ffd27a" : "#ff6a6a",
    playAgain: () => { this.clearGameTimers(); this.blip(440, 0.12, "triangle", 0.05); this.startBgm(1200); this.setState({ game: null, fieldSel: null, discardView: null, peekCard: null }); },
    startBg: st.pickedAvatar ? acc : paper, startColor: st.pickedAvatar ? "#fff" : ink + "80", startCursor: st.pickedAvatar ? "pointer" : "default", startOpacity: st.pickedAvatar ? 1 : 0.65,
    startLabel: st.pickedAvatar ? "Начать матч" : "Сначала выберите аватара",
    startMatch: () => { if (!this.state.pickedAvatar) { this.showToast("Выберите аватара, чтобы начать матч."); return; } this.clearGameTimers(); const botPick = AVATARS[Math.floor(Math.random() * AVATARS.length)].id; this.blip(440, 0.12, "triangle", 0.05); this.buzz(14); this.setState({ game: this.buildGame({ playerAvatar: this.state.pickedAvatar, botAvatar: botPick }) }); },
    endTurn: () => { const cur = this.state.game; if (!cur || cur.winner || cur.turn !== "player" || cur.pendingBonus) return; this.blip(280, 0.08, "sine", 0.03); if (cur.sandbox && !this.state.sbAiOn) { this.sbStartTurn("bot"); return; } this.runBotTurn(); },
    navCollectionBg: isCollection ? "#14a893" : paper, navCollectionColor: isCollection ? "#fff" : ink, navPlayBg: isPlay ? acc : paper, navPlayColor: isPlay ? "#fff" : ink,
    goCollection: () => { this.clearGameTimers(); this.blip(280, 0.08, "sine", 0.03); exitFullscreenSafe(); this.stopBgm(1500); this.setState({ screen: "collection", game: null, fieldSel: null, discardView: null, peekCard: null }); },
    goPlay: () => { this.blip(280, 0.08, "sine", 0.03); if (mobileLayout) requestFullscreenSafe(); this.startBgm(1400); this.setState({ screen: "play" }); },
    navSandboxBg: g && g.sandbox ? "#6c2bd9" : paper, navSandboxColor: g && g.sandbox ? "#fff" : ink,
    goSandbox: () => { this.clearGameTimers(); this.blip(280, 0.08, "sine", 0.03); if (mobileLayout) requestFullscreenSafe(); this.startBgm(1400); this.setState({ screen: "play", game: this.buildSandboxGame(), sel: null, fieldSel: null, discardView: null, peekCard: null, pickedAvatar: null, sbEditTarget: "" }); },
    backToCollection: () => { this.clearGameTimers(); exitFullscreenSafe(); this.stopBgm(1500); this.setState({ screen: "collection", game: null, fieldSel: null, discardView: null, peekCard: null }); },
    bgmRef: (el) => this.bgmRef(el),
    toggleTheme: () => { this.blip(300, 0.1, "sine", 0.04); this.buzz(10); this.setState((s) => ({ dark: !s.dark })); },
    pickAvatar: () => { this.blip(360, 0.1, "sine", 0.04); this.buzz(10); const el = document.getElementById("mfc-avatar"); if (el && el.openFilePicker) el.openFilePicker(); },
    collected: cards.length, cards, bonusCards, filteredCards, filteredBonus, showHeroSection, showBonusSection,
    noHeroResults: showHeroSection && filteredCards.length === 0, noBonusResults: showBonusSection && filteredBonus.length === 0,
    search: st.search, onSearch: (e) => this.setState({ search: e.target.value }),
    filterAllBg: st.filter === "all" ? ink : paper, filterAllColor: st.filter === "all" ? paper : ink,
    filterHeroBg: st.filter === "hero" ? acc : paper, filterHeroColor: st.filter === "hero" ? "#fff" : ink,
    filterBonusBg: st.filter === "bonus" ? "#14a893" : paper, filterBonusColor: st.filter === "bonus" ? "#fff" : "#14a893",
    setFilterAll: () => { this.blip(280, 0.06, "sine", 0.03); this.setState({ filter: "all" }); }, setFilterHero: () => { this.blip(280, 0.06, "sine", 0.03); this.setState({ filter: "hero" }); }, setFilterBonus: () => { this.blip(280, 0.06, "sine", 0.03); this.setState({ filter: "bonus" }); },
    bonusPlaceholders, fieldSel: fieldSelVM, closeFieldCard, discardView: discardVM, closeDiscard, openDiscardPlayer: openDiscard("player"), openDiscardBot: openDiscard("bot"), toast: st.toast || null,
    tilt, untilt, sel: st.sel == null ? null : cards.concat(bonusCards)[st.sel], selFlip: st.flipped ? "rotateY(180deg)" : "rotateY(0deg)",
    pick: (e) => { const el = e.currentTarget, i = parseInt(el.getAttribute("data-idx"), 10); el.style.transform = ""; this.blip(520, 0.12, "triangle", 0.05); this.buzz(12); this.setState({ sel: i, flipped: false }); },
    flip: () => { this.blip(340, 0.16, "sine", 0.05); this.buzz(18); this.setState((s) => ({ flipped: !s.flipped })); }, close: () => { this.blip(240, 0.1, "sine", 0.04); this.setState({ sel: null }); }, stop: (e) => e.stopPropagation()
  };
}
