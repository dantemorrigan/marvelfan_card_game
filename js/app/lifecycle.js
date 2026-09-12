/*
app/lifecycle.js

Жизненный цикл UI, короткие FX-таймеры, haptics и звук.
Не содержит правил карточной игры.
*/
class MFCLifecycleController {
  componentDidMount() {
    this._gameTimers = new Set();
    this.onKey = (e) => {
      if (e.key === "Escape") this.setState({ sel: null, fieldSel: null, discardView: null, peekCard: null });
    };
    window.addEventListener("keydown", this.onKey);

    this.onViewport = () => {
      if (this._viewportRaf) return;
      this._viewportRaf = requestAnimationFrame(() => {
        this._viewportRaf = null;
        const next = computeViewport();
        this.setState((s) => {
          for (const k in next) if (s[k] !== next[k]) return next;
          return null;
        });
      });
    };
    this.onOrientation = () => {
      clearTimeout(this._orientTimer);
      this._orientTimer = setTimeout(this.onViewport, 120);
    };
    window.addEventListener("resize", this.onViewport, { passive: true });
    window.addEventListener("orientationchange", this.onOrientation, { passive: true });
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.onKey);
    window.removeEventListener("resize", this.onViewport);
    window.removeEventListener("orientationchange", this.onOrientation);
    clearTimeout(this._orientTimer);
    clearTimeout(this._toastTimer);
    clearTimeout(this._handPressTimer);
    this.clearGameTimers();
    if (this._viewportRaf) cancelAnimationFrame(this._viewportRaf);
    if (this._bgmFade) cancelAnimationFrame(this._bgmFade);
    if (this.ac && this.ac.close) {
      try { this.ac.close(); } catch (e) {}
    }
  }

  setGameTimer(fn, ms) {
    if (!this._gameTimers) this._gameTimers = new Set();
    const id = setTimeout(() => {
      this._gameTimers.delete(id);
      fn();
    }, ms);
    this._gameTimers.add(id);
    return id;
  }

  clearGameTimers() {
    if (!this._gameTimers) return;
    this._gameTimers.forEach((id) => clearTimeout(id));
    this._gameTimers.clear();
  }

  buzz(ms) {
    if (this.props.haptics === false) return;
    if (navigator.vibrate) {
      try { navigator.vibrate(ms); } catch (e) {}
    }
  }

  showToast(text) {
    this.setState({ toast: text });
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      this.setState((s) => (s.toast === text ? { toast: null } : null));
    }, 1800);
  }

  clearFxLater(ms) {
    this.setGameTimer(() => {
      const g = this.state.game;
      if (g && (g.fx || g.castFx || g.burnFx || g.deckFx)) {
        this.setState({ game: Object.assign({}, g, { fx: null, castFx: null, burnFx: null, deckFx: null }) });
      }
    }, ms);
  }

  blip(freq, dur, type, gain) {
    if (this.props.sound === false) return;
    try {
      if (!this.ac) this.ac = new (window.AudioContext || window.webkitAudioContext)();
      const ac = this.ac;
      if (ac.state === "suspended") ac.resume();
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = type || "triangle";
      o.frequency.setValueAtTime(freq, ac.currentTime);
      o.frequency.exponentialRampToValueAtTime(Math.max(60, freq * 0.55), ac.currentTime + dur);
      g.gain.setValueAtTime(0, ac.currentTime);
      g.gain.linearRampToValueAtTime(gain == null ? 0.06 : gain, ac.currentTime + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + dur);
      o.connect(g);
      g.connect(ac.destination);
      o.start();
      o.stop(ac.currentTime + dur + 0.02);
    } catch (e) {}
  }

  bgmRef(el) {
    this.bgm = el;
  }

  fadeBgm(to, ms) {
    if (!this.bgm) return;
    if (this._bgmFade) cancelAnimationFrame(this._bgmFade);
    const from = this.bgm.volume;
    const duration = Math.max(1, ms || 1);
    const started = performance.now();
    const step = (now) => {
      if (!this.bgm) return;
      const t = Math.min(1, (now - started) / duration);
      this.bgm.volume = Math.min(1, Math.max(0, from + (to - from) * t));
      if (t < 1) {
        this._bgmFade = requestAnimationFrame(step);
      } else {
        this._bgmFade = null;
        if (to === 0) this.bgm.pause();
      }
    };
    this._bgmFade = requestAnimationFrame(step);
  }

  startBgm(ms) {
    if (!this.bgm) return;
    this.bgm.volume = 0;
    const p = this.bgm.play();
    if (p && p.catch) p.catch(() => {});
    this.fadeBgm(0.55, ms || 1400);
  }

  stopBgm(ms) {
    this.fadeBgm(0, ms || 1600);
  }
}
