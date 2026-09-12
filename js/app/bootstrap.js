/*
app/bootstrap.js

Минимальный bootstrap для DC-компонента. Здесь только начальное состояние
и установка mixin-контроллеров. Игровая логика, sandbox и view-model живут
в отдельных модулях.
*/
function createMfcInitialState() {
  return {
    sel: null, flipped: false, dark: false, screen: "collection",
    game: null, search: "", filter: "all",
    handHover: null, fieldSel: null, discardView: null, toast: null, pendingRevive: null,
    pickedAvatar: null, peekCard: null, logOpen: false,
    editingName: false, nameDraft: "", customName: readStoredName(),
    showNameOnboarding: !readNameOnboardingSeen(),
    sbOpen: true, sbSide: "player", sbCardQuery: "", sbAiOn: true,
    sbEditTarget: "", sbHpDraft: "", sbEnergyPlayerDraft: "10", sbEnergyBotDraft: "10",
    sbScenarioName: "", sbScenarioBump: 0, sbLogOpen: false,
    ...computeViewport()
  };
}

function installMfcMixin(Target, Source) {
  if (!Target || !Source) return;
  const proto = typeof Source === "function" ? Source.prototype : Source;
  Object.getOwnPropertyNames(proto).forEach((name) => {
    if (name === "constructor") return;
    Object.defineProperty(Target.prototype, name, Object.getOwnPropertyDescriptor(proto, name));
  });
}
