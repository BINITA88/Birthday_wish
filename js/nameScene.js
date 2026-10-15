/* SCENE 0 – Her name: separate plots of seeds grow into flower letters, then gather in the centre. */
(function (App) {
  const { CONFIG: C, FX } = App;

  App.SceneManager.register('name', {
    init(sec, ctx) {
      sec.innerHTML = '<div class="name-glow"></div><div class="name-wrap"></div>';
      const glow = sec.querySelector('.name-glow');
      const fx = FX.field(sec, { motes: 14, size: 0.7 });
      ctx.add(fx.destroy);

      const bloom = FX.flowerName(sec.querySelector('.name-wrap'), C.name, {
        maxWidth: 1400,
        onConverge: function () { glow.classList.add('on'); }
      });
      ctx.add(bloom.destroy);

      // Hold on the finished name for a moment, then move on to the intro.
      bloom.done.then(function () {
        ctx.later(function () {
          App.SceneManager.go('intro', { mode: 'black', duration: 1100, hold: 250 });
        }, 2200);
      });
    }
  });
})(window.App);
