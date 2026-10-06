"use strict";
(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // src/renderer.ts
  var require_renderer = __commonJS({
    "src/renderer.ts"() {
      var DEFAULT_SECONDS = 10;
      var getSecondsFromQuery = () => {
        const params = new URLSearchParams(window.location.search);
        const raw = params.get("seconds");
        if (!raw) return DEFAULT_SECONDS;
        const n = Number(raw);
        if (!Number.isFinite(n)) return DEFAULT_SECONDS;
        return Math.max(1, Math.floor(n));
      };
      var setText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
      };
      var setTitle = (remainingSeconds) => {
        document.title = `Time Bomb \u2014 ${formatHms(remainingSeconds)}`;
      };
      var formatHms = (totalSeconds) => {
        const s = Math.max(0, Math.floor(totalSeconds));
        const hours = Math.floor(s / 3600);
        const minutes = Math.floor(s % 3600 / 60);
        const seconds = s % 60;
        const pad2 = (n) => String(n).padStart(2, "0");
        return `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
      };
      var remaining = getSecondsFromQuery();
      setText("count", formatHms(remaining));
      setTitle(remaining);
      var tick = () => {
        remaining -= 1;
        setText("count", formatHms(remaining));
        setTitle(remaining);
        if (remaining <= 0) {
          window.timebomb.quit();
        }
      };
      setInterval(tick, 1e3);
    }
  });
  require_renderer();
})();
//# sourceMappingURL=renderer.js.map
