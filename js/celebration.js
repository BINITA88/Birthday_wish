/* A ten-second birthday celebration, ending in a golden-ring transition. */
(function (App) {
  App.SceneManager.register('celebration', {
    init(sec, ctx) {
      // The former birthday-card screen is intentionally skipped: go straight to the heart
      // of love words, which then leads into the cake build.
      sec.setAttribute('aria-hidden', 'true');
      // go() refuses (returns false) while the transition into this scene is
      // still running, so keep trying until the manager is free.
      (function toHeart() {
        App.SceneManager.go('heart', { mode: 'black', duration: 900, hold: 200 }).then(function (ok) {
          if (!ok) ctx.later(toHeart, 100);
        });
      })();
    }
  });
})(window.App = window.App || {});
