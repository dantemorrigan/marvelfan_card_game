# Marvel Fan Cards — architecture

The runtime is intentionally split by responsibility. `index.html` and `Marvel Fan Cards.dc.html` are presentation entrypoints only: keep game rules out of them.

## Runtime layers

- `js/core/` — shared low-level helpers, storage, viewport state, preloader and constants.
- `js/cards/` — card/avatar/keyword/ability data. No battle orchestration here.
- `js/battle/combat.js` — low-level battle state operations.
- `js/battle/keywords.js`, `avatars.js`, `bonusCards.js`, `heroAbilities.js` — battle rule implementations.
- `js/battle/gameController.js` — match orchestration, turn flow, attacks and bot AI.
- `js/app/bootstrap.js` — initial component state and mixin installation helper.
- `js/app/lifecycle.js` — lifecycle, tracked timers, viewport updates, haptics and audio.
- `js/sandbox/` — Developer Sandbox controls and scenario persistence.
- `js/ui/cardViewModel.js` — cached collection-card presentation data.
- `js/ui/renderVals.js` — root UI view-model consumed by the DC template.
- `css/` — visual styling and animations.

## Rules for future changes

1. Card data goes to `js/cards/`; battle behavior goes to `js/battle/`.
2. Do not put game logic back into the HTML entrypoints.
3. Use `cloneGame()` instead of JSON stringify/parse for normal game-state cloning.
4. Use `setGameTimer()` for gameplay/AI delays so callbacks are cancelled when a match is left or restarted.
5. Keep collection view-models cacheable. Do not rebuild every static card on every animation/state update.
6. Keep resize/orientation work frame-throttled.
7. `support.js` is DC runtime infrastructure; do not mix game code into it.

## Entry-point composition

The DC component is intentionally thin. It owns only initial state and composes the controllers/view-model through `installMfcMixin()`. This makes search, profiling and future feature work local to the subsystem being changed.
