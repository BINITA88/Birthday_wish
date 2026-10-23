/* A ten-second birthday celebration, ending in a golden-ring transition. */
(function (App) {
  const { FX } = App;
  App.SceneManager.register('celebration', {
    init(sec, ctx) {
      sec.innerHTML =
        '<div class="cel-glow"></div><div class="birthday-cake" aria-hidden="true"><i></i><i></i><i></i><b>🎂</b></div>' +
        '<div class="birthday-copy"><h1>Happy Birthday,<br><em>Pratima!</em> 🎂❤️</h1><p>May your dreams grow bigger, your smile shine brighter, and your days be filled with beautiful little moments. 🌻🤍</p></div>' +
        '<div class="golden-ring" aria-hidden="true"><span>✦</span><span>✿</span><span>✦</span><strong>Happy Birthday,<br>Pratima <b>♥</b></strong></div>';
      FX.balloons(sec, { count: App.isSmall() ? 4 : 7, prefill: true });
      const fx = FX.field(sec, { motes: 44, confetti: true, rate: 10 });
      ctx.add(fx.destroy);
      (async function () {
        App.audio.fadeOut('calm', 550);
        App.audio.play('music');
        await ctx.sleep(700);
        sec.classList.add('cake-in');
        await ctx.sleep(2300);
        sec.classList.add('message-in');
        await ctx.sleep(4000);
        sec.classList.add('ring-in');
        await ctx.sleep(3000);
        App.audio.fadeOut('music', 1000);
        App.SceneManager.go('letter', { mode: 'cross', duration: 1000 });
      })();
    }
  });
})(window.App = window.App || {});
