/*
core/viewport.js

Определение параметров экрана (мобильное устройство, портрет,
compact-высота) и безопасные обёртки над Fullscreen API.
*/
function computeViewport() {
  if (typeof window === "undefined") return { isPortraitMobile: false, isCompact: false, vh: 800, vw: 1200, isMobileDevice: false };
  const w = window.innerWidth, h = window.innerHeight;
  const short = Math.min(w, h);
  const isMobileDevice = short <= 520;
  const isPortrait = h > w;
  return { isPortraitMobile: isMobileDevice && isPortrait, isCompact: h <= 700, vh: h, vw: w, isMobileDevice: isMobileDevice };
}

function requestFullscreenSafe() {
  try {
    const el = document.documentElement;
    const req = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
    if (req && !document.fullscreenElement && !document.webkitFullscreenElement) {
      req.call(el).catch ? req.call(el).catch(() => {}) : req.call(el);
    }
  } catch (e) {}
}
function exitFullscreenSafe() {
  try {
    const isFs = document.fullscreenElement || document.webkitFullscreenElement;
    const exit = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
    if (isFs && exit) {
      exit.call(document).catch ? exit.call(document).catch(() => {}) : exit.call(document);
    }
  } catch (e) {}
}
