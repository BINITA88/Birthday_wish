/* SCENE 3 – Choose your favourite flower. */
(function (App) {
  const { CONFIG: C, u, FX, Flowers } = App;

  function cardHTML(kind, seed) {
    const F = C.flowers[kind];
    const art = '<img class="fimg ' + kind + '" src="' + u.esc(F.image) + '" alt="' + u.esc(F.title) + '" draggable="false">';
    return '<article class="fcard fade-up" data-kind="' + kind + '">' +
      '<div class="fcard-glow"></div>' +
      '<div class="petal-layer"></div>' +
      '<div class="fcard-art"><div class="sway" style="--sw:' + (4 + seed % 3) + 's;--swd:-' + (seed % 4) + 's;--sa:2.2deg">' + art + '</div></div>' +
      '<div class="fcard-copy"><h3>' + u.esc(F.cardTitle) + '</h3><p>' + u.esc(F.cardLine) + '</p><small>' + u.esc(F.cardSubline) + '</small></div>' +
      '<button class="btn" type="button" data-choose>' + u.esc(F.button) + '</button>' +
      '</article>';
  }

  App.SceneManager.register('flower', {
    init(sec, ctx) {
      const T = C.text;
      sec.innerHTML =
        '<div class="fs-bg"></div>' +
        '<header class="fs-head"><h2 class="fs-h1 fade-up">' + u.esc(T.flowerHeading1) + '</h2>' +
        '</header>' +
        '<div class="fs-cards">' + cardHTML('sunflower', 7) + cardHTML('rose', 12) + '</div>';

      const fx = FX.field(sec, { motes: 34 });
      ctx.add(fx.destroy);

      // While she decides, the garden's scenery is painted quietly in idle moments (this screen is nearly still).
      ctx.later(function () { App.Garden.prewarm('sunflower', App.state.gardenSeed); App.Garden.prewarm('rose', App.state.gardenSeed); }, 400);

      const cards = Array.from(sec.querySelectorAll('.fcard'));
      let chosen = null;

      ctx.show(sec.querySelector('.fs-h1'), 150);
      cards.forEach(function (c, i) { ctx.show(c, 1800 + i * 350); });

      function petals(card, n) {
        const layer = card.querySelector('.petal-layer');
        if (App.reduced) n = Math.min(n, 3);
        for (let i = 0; i < n; i++) {
          if (layer.children.length > 26) break;
          const p = document.createElement('i');
          p.className = 'pfly ' + card.dataset.kind;
          p.style.setProperty('--dx', u.rand(-110, 110).toFixed(0) + 'px');
          p.style.setProperty('--dy', u.rand(-130, 30).toFixed(0) + 'px');
          p.style.setProperty('--rot', u.rand(-260, 260).toFixed(0) + 'deg');
          p.style.animationDelay = (i * 70) + 'ms';
          p.addEventListener('animationend', function () { p.remove(); });
          layer.appendChild(p);
        }
      }

      function activate(card) {
        if (chosen) return;
        cards.forEach(function (c) { c.classList.toggle('active', c === card); });
        petals(card, 7);
      }

      cards.forEach(function (card) {
        // Hover on mouse devices …
        ctx.on(card, 'pointerenter', function (e) { if (e.pointerType === 'mouse') activate(card); });
        ctx.on(card, 'pointerleave', function (e) { if (e.pointerType === 'mouse' && !chosen) card.classList.remove('active'); });
        // … and tap / click everywhere else.
        ctx.on(card, 'click', function (e) {
          if (e.target.closest('[data-choose]')) return;
          activate(card);
        });
        ctx.on(card.querySelector('[data-choose]'), 'click', function () { choose(card); });
      });

      async function choose(card) {
        if (chosen) return;
        chosen = card.dataset.kind;
        App.state.flower = chosen;           // persists into the garden
        App.audio.fadeOut('music', 1800);    // the birthday tune ends once she has chosen …
        App.audio.fadeIn('calm', 2600);      // … and the calm music takes over for the rest of the story
        cards.forEach(function (c) {
          if (c === card) { c.classList.add('chosen', 'active'); c.classList.remove('faded'); }
          else { c.classList.add('faded'); c.classList.remove('active'); }
        });
        sec.classList.add('picked');
        petals(card, 18);
        ctx.later(function () { petals(card, 14); }, 450);
        // The petals play for a moment; meanwhile whatever is left of the garden is painted at full speed.
        const ready = App.Garden.prioritize(chosen, App.state.gardenSeed);
        await Promise.all([ctx.sleep(900), Promise.race([ready, ctx.sleep(1800)])]);
        App.SceneManager.go('garden', { mode: 'cross', duration: 900 });      // straight into the garden: no black screen
      }
    }
  });
})(window.App);
