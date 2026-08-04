/*
core/preloader.js

Стартовый прелоадер: собирает все URL картинок из данных карт/бонус-
карт/аватаров (уже загруженных к этому моменту скриптами cards/*.js),
предзагружает их через Image(), показывает прогресс на #mfc-preloader
и убирает экран, когда картинки готовы И игровой рантайм (dc-runtime)
заменил <x-dc> реальным интерфейсом. Не содержит игровой логики и не
трогает состояние игры.
*/
(function () {
  function extractUrl(css) {
    var m = /url\(['"]?([^'")]+)['"]?\)/.exec(css || "");
    return m ? m[1] : null;
  }

  var sources = []
    .concat(typeof DATA !== "undefined" ? DATA : [])
    .concat(typeof BONUS !== "undefined" ? BONUS : [])
    .concat(typeof AVATARS !== "undefined" ? AVATARS : []);

  var urls = [];
  sources.forEach(function (item) {
    var u = extractUrl(item.art || item.image);
    if (u && urls.indexOf(u) < 0) urls.push(u);
  });
  ["./assets/marvelcomics-card.jpg", "./assets/marvel-comics-logo.png"].forEach(function (u) {
    if (urls.indexOf(u) < 0) urls.push(u);
  });

  var total = urls.length;
  var loaded = 0;
  var bar = document.getElementById("mfc-preloader-bar");
  var pct = document.getElementById("mfc-preloader-pct");

  function setProgress() {
    var p = total ? Math.round((loaded / total) * 100) : 100;
    if (bar) bar.style.width = p + "%";
    if (pct) pct.textContent = p + "%";
  }
  setProgress();

  function loadOne(url) {
    return new Promise(function (resolve) {
      var img = new Image();
      img.onload = img.onerror = function () {
        loaded++;
        setProgress();
        resolve();
      };
      img.src = url;
    });
  }

  var imagesReady = total ? Promise.all(urls.map(loadOne)) : Promise.resolve();

  function appMounted() {
    return new Promise(function (resolve) {
      (function check() {
        if (!document.querySelector("x-dc")) { resolve(); return; }
        requestAnimationFrame(check);
      })();
    });
  }

  function dismiss() {
    var el = document.getElementById("mfc-preloader");
    if (!el) return;
    el.style.opacity = "0";
    setTimeout(function () { el.remove(); }, 400);
  }

  Promise.all([imagesReady, appMounted()]).then(dismiss);
  // Страховка: не держать экран загрузки вечно, если что-то пошло не так
  // (например картинка зависла) — через 20с интерфейс открывается в любом случае.
  setTimeout(dismiss, 20000);
})();
