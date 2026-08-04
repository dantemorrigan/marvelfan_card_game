/*
battle/keywords.js

Логика ключевых слов: сбор списка ключевых слов карты
(cardKeywords), проверка наличия (hasKw) и подготовка иконок/чипов
для интерфейса (kwIconsOf, kwChips).
*/
function cardKeywords(d) {
  const out = [];
  (d.keywords || []).concat(KEYWORD_TABLE[d.name] || [], d.tags || []).forEach((id) => {
    if (KEYWORDS[id] && out.indexOf(id) < 0) out.push(id);
  });
  return out;
}
function hasKw(hero, id) {
  return !!hero && !!hero.keywords && hero.keywords.indexOf(id) >= 0;
}
function kwIconsOf(list) {
  return (list || []).map((id) => KEYWORDS[id] && KEYWORDS[id].icon).filter(Boolean).join(" ");
}
function kwChips(list) {
  return (list || []).map((id) => KEYWORDS[id]).filter(Boolean).map((k) => ({ icon: k.icon, name: k.name, text: k.text }));
}
