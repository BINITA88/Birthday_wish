/* Opening — a moonlit note, then flower letters gather into PRATIMA. */
(function (App) {
  const { CONFIG: C, FX, u } = App;

  App.SceneManager.register('name', {
    init(sec, ctx) {
      sec.innerHTML =
        '<div class="moon-stars" aria-hidden="true"></div><div class="moon-haze" aria-hidden="true"></div>' +
        '<div class="photo-moon"><img src="assets/pratima-sunflower.png" alt="Pratima in a sunflower field"></div>' +
        '<div class="moon-note"><p></p><button class="moon-begin" type="button">' + u.esc(C.text.waitButton) + '</button></div>';
      const fx = FX.field(sec, { motes: 36, rgb: '255,233,185', size: 0.75 });
      ctx.add(fx.destroy);
      const note = sec.querySelector('.moon-note p');
      const btn = sec.querySelector('.moon-begin');
      const typing = u.letters(note, C.text.waitLine, 115);
      note.classList.add('reveal');
      ctx.show(btn, typing + 400);
      ctx.on(btn, 'click', function () {
        if (btn.disabled) return;
        btn.disabled = true;
        App.audio.unlock();
        App.state.started = true;
        document.body.classList.add('started');
        App.audio.fadeIn('calm', 1200);
        App.SceneManager.go('blossom', { mode: 'black', duration: 900, hold: 200 });
      });
    }
  });

  App.SceneManager.register('blossom', {
    init(sec, ctx) {
      sec.innerHTML = '<div class="name-glow"></div><div class="name-wrap"></div><div class="name-message"><div class="name-flower">🌺</div><p>Pratima, this little world was made just for you. ❤️🌺</p><button class="btn primary" type="button">Enter your garden ♡</button></div>';
      const glow = sec.querySelector('.name-glow');
      const fx = FX.field(sec, { motes: 24, rgb: '255,207,143', size: 0.8 });
      ctx.add(fx.destroy);
      const bloom = FX.flowerName(sec.querySelector('.name-wrap'), C.name, {
        maxWidth: 1400,
        onConverge: function () { glow.classList.add('on'); }
      });
      ctx.add(bloom.destroy);
      bloom.done.then(function () {
        if (!ctx.dead) ctx.later(function () { sec.classList.add('complete'); }, 650);
      });
      ctx.on(sec.querySelector('.btn'), 'click', function () {
        App.SceneManager.go('flower', { mode: 'black', duration: 900, hold: 150 });
      });
    }
  });
})(window.App = window.App || {});
