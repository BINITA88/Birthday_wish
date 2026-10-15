/* SCENE 2 – Birthday celebration: title reveal, music, balloons, confetti. */
(function (App) {
  const { CONFIG: C, u, FX } = App;

  App.SceneManager.register('celebration', {
    init(sec, ctx) {
      const parts = C.greeting.split(',');
      const line1 = (parts[0] + (parts.length > 1 ? ',' : '')).toUpperCase();
      const line2 = (parts.slice(1).join(',').trim() || '').toUpperCase();

      sec.innerHTML =
        '<div class="cel-glow"></div>' +
        '<h1 class="cel-title"><span class="l1"></span><span class="l2"></span></h1>';

      FX.balloons(sec, { count: App.isSmall() ? 4 : 7 });
      const fx = FX.field(sec, { motes: 44, confetti: false, rate: 10 });
      ctx.add(fx.destroy);

      const title = sec.querySelector('.cel-title');
      (async function () {
        await ctx.sleep(900);
        u.letters(title.querySelector('.l1'), line1, 48);
        u.letters(title.querySelector('.l2'), line2, 85);
        title.classList.add('reveal');
        await ctx.sleep(600);
        App.audio.play('music');          // begins during the reveal
        fx.setConfetti(true);

        await ctx.sleep(2300 + C.timing.celebrationHold);
        App.audio.fadeOut('music', 2800);  // carry the tune softly into the next chapter
        App.SceneManager.go('flower', { mode: 'black', duration: 1600, hold: 400 });
      })();
    }
  });
})(window.App);
