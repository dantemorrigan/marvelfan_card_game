/* Sandbox scenario persistence. */
class MFCSandboxScenarioController {
  sbSaveScenario(name) {
    const trimmed = (name || "").trim();
    const g = this.state.game;
    if (!trimmed || !g || !g.sandbox) { this.showToast("Введите имя сценария."); return; }
    const scenarios = readSandboxScenarios();
    scenarios[trimmed] = JSON.stringify(g);
    writeSandboxScenarios(scenarios);
    this.showToast("Сценарий «" + trimmed + "» сохранён.");
    this.setState({ sbScenarioName: "", sbScenarioBump: (this.state.sbScenarioBump || 0) + 1 });
  }

  sbLoadScenario(name) {
    const scenarios = readSandboxScenarios();
    const raw = scenarios[name];
    if (!raw) return;
    try {
      const g = JSON.parse(raw);
      g.sandbox = true;
      this.clearGameTimers();
      this.setState({ game: g, sbEditTarget: "" });
      this.showToast("Сценарий «" + name + "» загружен.");
    } catch (e) {
      this.showToast("Не удалось загрузить сценарий.");
    }
  }

  sbDeleteScenario(name) {
    const scenarios = readSandboxScenarios();
    delete scenarios[name];
    writeSandboxScenarios(scenarios);
    this.setState({ sbScenarioBump: (this.state.sbScenarioBump || 0) + 1 });
  }
}
