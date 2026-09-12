/* Collection card presentation and cache. */
class MFCCardViewModelController {
  cardVM(d, i) {
    const acc = this.props.accent || "#e0212f";
    const keywords = cardKeywords(d);
    const abilityKey = HERO_ABILITY_TABLE[d.name] || null;
    const ability = abilityKey ? HERO_ABILITIES[abilityKey] : null;
    let ring = "";
    if (d.legendary) ring = ", 0 0 0 3px #f7dd8a, 0 0 0 5px #fff6d9, 0 0 0 7px #b8860b";
    else if (d.rarity === "rare") ring = ", 0 0 0 3px #a9d8ff, 0 0 0 5px #eaf6ff, 0 0 0 7px #4a90c9";
    else if (d.bonus) ring = ", 0 0 0 3px #7fe9df, 0 0 0 5px #eafffb, 0 0 0 7px #14a893";
    return {
      i, name: d.name, sub: d.sub, slot: "mfc-card-" + i,
      ph: d.name, art: d.art, rot: ROTS[i % ROTS.length],
      legendary: !!d.legendary, bonus: !!d.bonus, showStats: !d.bonus,
      badgeOffset: (d.legendary || d.bonus) ? "24px" : "0px",
      badgeOffsetModal: (d.legendary || d.bonus) ? "32px" : "0px",
      shadow: "3px 3px 0 #17140f26" + ring,
      shadowHover: "4px 4px 0 #17140f40" + ring,
      shadowActive: "2px 2px 0 #17140f40" + ring,
      shadowModal: "5px 5px 0 #00000030" + ring,
      kws: kwChips(keywords), kwIcons: kwIconsOf(keywords), hasKws: keywords.length > 0,
      hasAbility: !!ability,
      abilityName: ability ? ability.name : "",
      abilityType: ability ? ability.type : "",
      abilityText: ability ? ability.text : "",
      cost: d.collectionOnly ? null : (d.cost || 1),
      costRibbonColor: d.bonus ? "#14a893" : acc,
      costTop: d.legendary ? "44px" : "10px",
      costTopModal: d.legendary ? "62px" : "18px",
      stats: LABELS.map((l, k) => ({
        label: l, val: d.s[k],
        pips: [0, 1, 2, 3, 4].map((n) => ({ bg: n < d.s[k] ? acc : "#ffffff33" }))
      }))
    };
  }

  getCollectionCardVMs() {
    const accent = this.props.accent || "#e0212f";
    const key = accent + "|" + DATA.length + "|" + BONUS.length;
    if (!this._cardVmCache || this._cardVmCache.key !== key) {
      this._cardVmCache = {
        key,
        cards: DATA.map((d, i) => this.cardVM(d, i)),
        bonusCards: BONUS.map((d, i) => this.cardVM(d, DATA.length + i))
      };
    }
    return this._cardVmCache;
  }
}
