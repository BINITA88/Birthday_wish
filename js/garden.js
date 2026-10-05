/* SCENE 4 – The magical flower garden (also exports App.Garden.build for scene 5). */
(function (App) {
  const { CONFIG: C, u, FX, Flowers } = App;

  /* Which complementary plants join the dominant flower. */
  const COMPANIONS = {
    sunflower: ['daisy', 'lavender', 'daisy'],
    rose: ['lavender', 'tulip', 'daisy']
  };
  const SCALE = { sunflower: 1, rose: 1.15, daisy: 0.55, lavender: 0.6, tulip: 0.62 };

  function grassLayer(rng, cls, n, hMin, hMax, palette) {
    let out = '<svg class="g-grass ' + cls + '" viewBox="0 0 1000 200" preserveAspectRatio="none" aria-hidden="true">';
    const groups = 4;
    for (let g = 0; g < groups; g++) {
      out += '<g class="gr" style="transition-delay:' + (g * 0.4).toFixed(2) + 's"><g class="gsw" style="--sw:' + (3 + g * 0.8).toFixed(1) + 's;--swd:-' + g + 's">';
      for (let i = 0; i < n / groups; i++) {
        const x = rng() * 1000, h = hMin + rng() * (hMax - hMin), b = (rng() - 0.5) * 36, w = 5 + rng() * 9;
        const col = palette[Math.floor(rng() * palette.length)];
        out += '<path d="M' + x.toFixed(1) + ' 200Q' + (x + b * 0.3).toFixed(1) + ' ' + (200 - h * 0.6).toFixed(1) + ' ' + (x + b).toFixed(1) + ' ' + (200 - h).toFixed(1) +
          'Q' + (x + b * 0.6 + w).toFixed(1) + ' ' + (200 - h * 0.5).toFixed(1) + ' ' + (x + w).toFixed(1) + ' 200Z" fill="' + col + '"/>';
      }
      out += '</g></g>';
    }
    return out + '</svg>';
  }

  /** Lays out one row of plants and returns its HTML. */
  function rowHTML(rng, flower, spec, small) {
    const n = Math.round(spec.n * (small ? 0.7 : 1));
    const comp = COMPANIONS[flower];
    let html = '';
    for (let i = 0; i < n; i++) {
      const x = -2 + (i + 0.15 + rng() * 0.7) / n * 104;
      const bottom = spec.y[0] + rng() * (spec.y[1] - spec.y[0]);
      const kind = rng() < spec.dom ? flower : comp[Math.floor(rng() * comp.length)];
      const k = SCALE[kind] * (spec.w[0] + rng() * (spec.w[1] - spec.w[0]));
      const d = Math.abs(x - 50) / 50 * 2.1 + rng() * 1.3 + spec.row * 0.25;
      const sway = (1.4 + rng() * 2.2).toFixed(2);
      html += '<div class="plant" style="left:' + x.toFixed(1) + '%;bottom:' + bottom.toFixed(1) + '%;--k:' + k.toFixed(2) + ';--d:' + d.toFixed(2) + 's">' +
        '<div class="sway" style="--sw:' + (3.2 + rng() * 2.6).toFixed(2) + 's;--swd:-' + (rng() * 5).toFixed(2) + 's;--sa:' + sway + 'deg">' +
        Flowers.render(kind, rng) + '</div></div>';
    }
    return html;
  }

  const ROWS = [
    { row: 0, n: 12, y: [27, 34], w: [0.55, 0.75], dom: 0.55 },
    { row: 1, n: 10, y: [13, 22], w: [0.75, 1.05], dom: 0.72 },
    { row: 2, n: 8,  y: [0, 9],   w: [0.9, 1.4], dom: 0.88 }
  ];

  const Garden = {
    /**
     * Garden.build(parent, { flower, animate, seed })
     * animate=false renders the fully bloomed garden instantly (used by the photo scene).
     */
    build(parent, o) {
      const flower = o.flower || 'sunflower';
      const rng = u.mulberry(o.seed || 1);
      const small = App.isSmall();
      const root = document.createElement('div');
      root.className = 'garden' + (o.animate ? '' : ' static s-light s-sky s-ground s-grass');

      const hills =
        '<svg class="g-hills" viewBox="0 0 1000 200" preserveAspectRatio="none" aria-hidden="true">' +
        '<path d="M0 200V120C120 70 220 100 340 90C470 80 560 40 700 80C820 112 920 70 1000 96V200Z" fill="#41627a" opacity=".55"/>' +
        '<path d="M0 200V140C150 100 260 150 400 128C540 106 660 70 800 118C900 150 960 120 1000 130V200Z" fill="#2a5039"/></svg>';

      root.innerHTML =
        '<div class="g-sky"></div><div class="g-rays"></div><div class="g-sun"></div><div class="g-beam"></div>' +
        hills + '<div class="g-ground"></div>' +
        grassLayer(rng, 'back', 56, 40, 85, ['#2b5a36', '#2f6a3e', '#245030', '#35703f']) +
        '<div class="g-rows' + (o.animate ? ' pre' : '') + '">' +
          '<div class="g-row">' + rowHTML(rng, flower, ROWS[0], small) + '</div><div class="g-fog"></div>' +
          '<div class="g-row">' + rowHTML(rng, flower, ROWS[1], small) + '</div><div class="g-fog f1"></div>' +
          '<div class="g-row">' + rowHTML(rng, flower, ROWS[2], small) + '</div>' +
        '</div>' +
        grassLayer(rng, 'front', 70, 30, 70, ['#3f8a4c', '#4a9a55', '#357a43', '#58a65e']) +
        '<div class="g-glow"></div>';

      parent.appendChild(root);

      return {
        root: root,
        stage(name) { root.classList.add('s-' + name); },
        grow() { const r = root.querySelector('.g-rows'); r.classList.remove('pre'); r.classList.add('grow'); }
      };
    }
  };
  App.Garden = Garden;

  /* ---------- The scene ---------- */
  App.SceneManager.register('garden', {
    init(sec, ctx) {
      const flower = App.state.flower || 'sunflower';
      const g = Garden.build(sec, { flower: flower, animate: true, seed: App.state.gardenSeed });

      const fx = FX.field(sec, { motes: 40, rgb: '255,226,160', size: 0.9 });
      ctx.add(fx.destroy);
      sec.querySelector('.fx-canvas').classList.add('late');   // sunlit motes fade in with the dawn

      const msg = document.createElement('p');
      msg.className = 'garden-msg fade-up';
      msg.textContent = C.text.gardenMessage;
      sec.appendChild(msg);

      (async function () {
        await ctx.sleep(1400);            // 1. complete darkness
        g.stage('light');                 // 2. the first warm beam
        await ctx.sleep(2300);
        g.stage('sky');                   //    sunrise expands
        sec.classList.add('dawn');
        await ctx.sleep(1500);
        g.stage('ground');                // 3. the garden emerges
        await ctx.sleep(1600);
        g.stage('grass');
        await ctx.sleep(1500);
        g.grow();                         // 4. flowers grow, unfold and bloom
        await ctx.sleep(App.reduced ? 5000 : 9200);
        msg.classList.add('in');
        await ctx.sleep(4200);
        App.SceneManager.go('photo', { mode: 'cross', duration: 2800 });
      })();
    }
  });
})(window.App);
