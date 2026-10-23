/* SCENE 1 – The mysterious beginning + cinematic 3-2-1 countdown. */
(function (App) {
  const { CONFIG: C, u, FX } = App;

  App.SceneManager.register('intro', {
    init(sec, ctx) {
      const T = C.text;
      sec.innerHTML =
        '<div class="intro-glow g1"></div><div class="intro-glow g2"></div>' +
        '<div class="intro-box">' +
          '<p class="intro-line"></p>' +
          '<button class="btn fade-up" type="button">' + u.esc(T.introButton) + '</button>' +
        '</div>' +
        '<div class="countdown" aria-live="assertive"></div>';

      const fx = FX.field(sec, { motes: 14, size: 0.7 });
      ctx.add(fx.destroy);

      const box = sec.querySelector('.intro-box');
      const line = sec.querySelector('.intro-line');
      const btn = sec.querySelector('.btn');
      const cd = sec.querySelector('.countdown');

      // The line types in letter by letter; the button appears once it has finished.
      const lineMs = u.letters(line, T.introLine, 75);
      ctx.later(function () { line.classList.add('reveal'); }, 700);
      ctx.show(btn, 700 + lineMs);

      let started = false;
      ctx.on(btn, 'click', async function () {
        if (started) return;
        started = true;
        btn.disabled = true;

        // The first click initialises audio (browsers block autoplay with sound).
        App.audio.unlock();
        App.state.started = true;
        document.body.classList.add('started');
        App.audio.fadeOut('calm', 700);      // silence for the countdown

        box.classList.add('leave');
        sec.classList.add('dark');
        await ctx.sleep(1500);

        for (const n of [3, 2, 1]) {
          cd.innerHTML = '<span class="num"><b>' + n + '</b><i></i></span>';
          App.audio.tick('countdown', n === 1 ? 0.74 : 1, 1000);   // tik … tik … tok
          await ctx.sleep(1150);
        }
        cd.innerHTML = '';
        await ctx.sleep(250);
        App.audio.stop('countdown');
        App.SceneManager.go('celebration', { mode: 'black', duration: 900, hold: 250 });
      });
    }
  });
})(window.App);
