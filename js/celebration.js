/* A ten-second birthday celebration, ending in a golden-ring transition. */
(function (App) {
  App.SceneManager.register('celebration', {
    init(sec, ctx) {
      // The former birthday-card screen is intentionally skipped: go straight
      // to the real cake scene so its formation animation is the celebration.
      sec.setAttribute('aria-hidden', 'true');
      // go() refuses (returns false) while the transition into this scene is
      // still running, so keep trying until the manager is free.
      (function toCake() {
        App.SceneManager.go('cake', { mode: 'cross', duration: 600 }).then(function (ok) {
          if (!ok) ctx.later(toCake, 100);
        });
      })();
    }
  });
})(window.App = window.App || {});
