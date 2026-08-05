/*
core/storage.js

Чтение/запись имени игрока и статуса онбординга в localStorage.
Все обращения к localStorage обёрнуты в try/catch.
*/
function readStoredName() {
  try {
    const v = localStorage.getItem("mfc_playerName");
    return v && v.trim() ? v : null;
  } catch (e) { return null; }
}
function writeStoredName(name) {
  try { localStorage.setItem("mfc_playerName", name); } catch (e) {}
}
function readNameOnboardingSeen() {
  try { return localStorage.getItem("mfc_nameOnboardingSeen") === "1"; } catch (e) { return false; }
}
function writeNameOnboardingSeen() {
  try { localStorage.setItem("mfc_nameOnboardingSeen", "1"); } catch (e) {}
}
// Sandbox: именованные снимки game state (JSON), чтобы воспроизвести сложную ситуацию одним кликом.
function readSandboxScenarios() {
  try {
    const v = JSON.parse(localStorage.getItem("mfc_sandboxScenarios") || "{}");
    return v && typeof v === "object" ? v : {};
  } catch (e) { return {}; }
}
function writeSandboxScenarios(obj) {
  try { localStorage.setItem("mfc_sandboxScenarios", JSON.stringify(obj)); } catch (e) {}
}
