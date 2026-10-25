/* SCENE 6 – The birthday cake is built in front of her, flat-design style: a board, sponge with pink cream, white frosting
   swept on with a spatula, scalloped cream piped on top, berries and a plaque with the greeting. A cold sparkler stands in
   the middle of the top, small candles beside it. Tapping the sparkler lights it: a fountain of sparks shoots up while its
   sound plays. When it dies away the small candles blow out one by one and the finale begins. */
(function (App) {
  const { CONFIG: C, u, FX } = App;
  const NS = 'http://www.w3.org/2000/svg';
  const STRIPES = ['#F4B6C2', '#FFF3E0', '#F4C76B', '#FAF7F2'];

  /* ---------- SVG cake ---------- */
  /**
   * One candle standing on (x, base). c: { x, base, w, h, fs (flame scale), i, ci (entrance order), main }.
   * Class names match the CSS (flame, glow, smoke …) so lighting, flicker and snuffing work for any size.
   */
  /** The cold sparkler: a silver textured tube on a red base, a little flame at its top, and a fountain column. */
  function sparklerHTML(c) {
    const th = c.h, top = -th - 3;
    return '<g transform="translate(' + c.x + ' ' + c.base + ')"><g class="candle main" data-i="' + c.i + '" data-sy="' + (top - 12) + '" tabindex="0" role="button" ' +
      'aria-label="Light the sparkler" style="--ci:' + c.ci + ';--fd:.17s">' +
      '<rect class="hit" x="-34" y="' + (top - 150) + '" width="68" height="' + (-top + 156) + '" fill="transparent"/>' +
      '<g class="glow-wrap"><circle class="glow" cx="0" cy="' + (top - 16) + '" r="46" fill="url(#glow)"/></g>' +
      '<rect x="-6.5" y="' + (-th) + '" width="13" height="' + th + '" rx="1.6" fill="url(#steel)"/>' +
      '<rect x="-6.5" y="' + (-th) + '" width="13" height="' + th + '" rx="1.6" fill="url(#knurl)"/>' +
      '<rect x="-7.2" y="' + top + '" width="14.4" height="3.4" rx="1.2" fill="#8d97a1"/>' +
      '<rect x="-7.2" y="-9.5" width="14.4" height="9.5" rx="1.6" fill="#d8432d"/><rect x="-7.2" y="-9.5" width="5" height="9.5" rx="1.6" fill="#ff7a5e" opacity=".55"/>' +
      '<g class="fountain" transform="translate(0 ' + top + ')"><path class="fountain-core" d="M0 4C-13 -18 -9 -80 0 -150C9 -80 13 -18 0 4Z" fill="url(#fountain)"/></g>' +
      '<g transform="translate(0 ' + top + ') scale(.95)"><g class="flame-in"><g class="flame-box"><g class="flame">' +
        '<path d="M0 -29C8 -19 9 -9 0 0C-9 -9 -8 -19 0 -29Z" fill="url(#flame)"/>' +
        '<path d="M0 -13C3.5 -9 3.5 -5 0 -2C-3.5 -5 -3.5 -9 0 -13Z" fill="#fff6c8" opacity=".9"/>' +
      '</g></g></g></g>' +
      '<g class="smoke"></g></g></g>';
  }

  function candleHTML(c) {
    if (c.main) return sparklerHTML(c);
    const k = c.fs, wickTop = -c.h - 6 * k, fd = (0.16 + (c.i % 3) * 0.035).toFixed(3);
    let stripes = '';
    for (let y = -c.h + 9; y < -4; y += 12) stripes += 'M' + (-c.w / 2) + ' ' + y + 'l' + c.w + ' -5';
    const hitW = c.w / 2 + (c.main ? 22 : 12);
    const hitTop = wickTop - 30 * k;
    return '<g transform="translate(' + c.x + ' ' + c.base + ')"><g class="candle ' + (c.main ? 'main' : 'small') + '" data-i="' + c.i + '" data-sy="' + (wickTop - 10 * k).toFixed(1) + '" tabindex="0" role="button" ' +
      'aria-label="' + (c.main ? 'Blow out the big candle' : 'Blow out a small candle') + '" style="--ci:' + c.ci + ';--fd:' + fd + 's">' +
      '<rect class="hit" x="' + (-hitW) + '" y="' + hitTop.toFixed(1) + '" width="' + (hitW * 2) + '" height="' + (-hitTop + 6).toFixed(1) + '" fill="transparent"/>' +
      '<rect x="' + (-c.w / 2) + '" y="' + (-c.h) + '" width="' + c.w + '" height="' + c.h + '" rx="' + (c.main ? 3 : 2) + '" fill="' + STRIPES[c.i % 4] + '" stroke="#d9b98a" stroke-width=".6"/>' +
      '<path d="' + stripes + '" stroke="rgba(216,74,101,.55)" stroke-width="' + (c.main ? 3 : 2) + '" fill="none"/>' +
      '<path d="M0 ' + (-c.h) + 'v' + (-6 * k) + '" stroke="#4a3220" stroke-width="' + (1.6 * Math.min(1.4, k)).toFixed(2) + '" stroke-linecap="round"/>' +
      '<g class="glow-wrap"><circle class="glow" cx="0" cy="' + (wickTop - 13 * k).toFixed(1) + '" r="' + (34 * k).toFixed(1) + '" fill="url(#glow)"/></g>' +
      '<g transform="translate(0 ' + wickTop.toFixed(1) + ') scale(' + k + ')"><g class="flame-in"><g class="flame-box"><g class="flame">' +
        '<path d="M0 -29C8 -19 9 -9 0 0C-9 -9 -8 -19 0 -29Z" fill="url(#flame)"/>' +
        '<path d="M0 -13C3.5 -9 3.5 -5 0 -2C-3.5 -5 -3.5 -9 0 -13Z" fill="#fff6c8" opacity=".9"/>' +
      '</g></g></g></g>' +
      '<g class="smoke"></g></g></g>';
  }

  /** The candles: a few small ones along the top edge, the big sparkler in the middle. */
  const TOP = 224, BOT = 338, X0 = 110, XM = 200, X1 = 290, SCALLOPS = 8, CANDLE_BASE = 222;
  const BERRIES = [136, 160, 186, 214, 240, 264];

  function candleList() {
    const list = [124, 148, 172, 228, 252, 276].map(function (x) { return { x: x, base: CANDLE_BASE, w: 7, h: 30, fs: 0.62, main: false }; });
    list.forEach(function (c, i) { c.i = i; c.ci = (i * 0.2).toFixed(2); });
    list.push({ x: XM, base: CANDLE_BASE, h: 84, main: true, i: list.length, ci: (list.length * 0.2 + 0.6).toFixed(2) });
    return list;
  }

  /* Flat, two-tone shapes: every piece is a light left half and a slightly darker right half, split at x = 200. */
  function sponge(y, h, cls) {
    return '<g class="cp ' + cls + '"><rect x="' + X0 + '" y="' + y + '" width="90" height="' + h + '" fill="#f6edbd"/><rect x="' + XM + '" y="' + y + '" width="90" height="' + h + '" fill="#e8dda5"/></g>';
  }
  function creamStrip(y, cls) {
    let s = '<rect x="' + X0 + '" y="' + y + '" width="90" height="6" fill="#fbf5d6"/><rect x="' + XM + '" y="' + y + '" width="90" height="6" fill="#ece3b7"/>';
    for (let k = 0; k < 8; k++) {
      const x = 114 + k * 22;
      s += '<rect x="' + x + '" y="' + y + '" width="14" height="6" rx="3" fill="' + (x < XM ? '#f8bccb' : '#e9a2b6') + '"/>';
    }
    return '<g class="cp cream ' + cls + '">' + s + '</g>';
  }
  function strawberry(x) {
    return '<g transform="translate(' + x + ' 218) scale(1.15)"><g class="pop berry">' +
      '<path d="M0 -7C9 -9 12 0 0 11C-12 0 -9 -8 0 -7Z" fill="#ea3b52"/><path d="M0 -7C9 -9 12 0 0 11Z" fill="#c42a43"/>' +
      '<path d="M-6.5 -7L0 -12L6.5 -7L0 -9Z" fill="#4f9a58"/>' +
      '<circle cx="-3.5" cy="-1" r=".9" fill="#ffe08a"/><circle cx="3" cy="0" r=".9" fill="#ffd36e"/><circle cx="-.5" cy="4.5" r=".9" fill="#ffe08a"/>' +
      '</g></g>';
  }

  function cakeSVG() {
    const w = (X1 - X0) / SCALLOPS;
    let scallops = '';
    for (let i = 0; i < SCALLOPS; i++) {
      const cx = X0 + w * (i + 0.5), h = w / 2;
      scallops += '<path class="pop scallop" d="M' + (cx - h) + ' ' + TOP + 'C' + (cx - h - 2) + ' ' + (TOP - 15) + ' ' + (cx - 4) + ' ' + (TOP - 17) + ' ' + cx + ' ' + (TOP - 24) +
        'C' + (cx + 4) + ' ' + (TOP - 17) + ' ' + (cx + h + 2) + ' ' + (TOP - 15) + ' ' + (cx + h) + ' ' + TOP + 'Z" fill="' + (cx < XM ? '#ffffff' : '#e2e2e2') + '"/>';
    }
    let berries = '';
    BERRIES.forEach(function (x) { berries += strawberry(x); });
    const sprigs = [[112, 1], [288, -1]].map(function (p) {
      return '<g transform="translate(' + p[0] + ' 220)"><g class="pop berry">' +
        '<ellipse cx="' + (p[1] * 5) + '" cy="-5" rx="9" ry="3.6" fill="#4f9a58" transform="rotate(' + (p[1] * -35) + ' ' + (p[1] * 5) + ' -5)"/>' +
        '<ellipse cx="' + (p[1] * 2) + '" cy="-9" rx="8" ry="3.2" fill="#3f8248" transform="rotate(' + (p[1] * -75) + ' ' + (p[1] * 2) + ' -9)"/></g></g>';
    }).join('');

    // the written message sits on a red plaque on the front of the cake
    const msg = C.cakeMessage, fs = Math.min(24, 140 / Math.max(6, msg.length) * 2.3);
    const plaque = '<g class="pop plaque"><path d="M200 258A80 23 0 0 0 200 304Z" fill="#c4161e"/><path d="M200 258A80 23 0 0 1 200 304Z" fill="#9e1118"/>' +
      '<text class="cake-msg" x="200" y="287" text-anchor="middle" font-family="\'Great Vibes\',\'Brush Script MT\',cursive" font-size="' + fs.toFixed(1) + '" fill="#ffffff" textLength="132" lengthAdjust="spacingAndGlyphs">' + u.esc(msg) + '</text></g>';

    const spatula = '<g class="spatula"><g class="spat-in">' +
      '<rect x="-4" y="226" width="4" height="112" rx="1.5" fill="#f1f1f1"/><rect x="0" y="226" width="4" height="112" rx="1.5" fill="#d3d3d3"/>' +
      '<rect x="-5.5" y="216" width="5.5" height="11" fill="#e8e8e8"/><rect x="0" y="216" width="5.5" height="11" fill="#cdcdcd"/>' +
      '<rect x="-5" y="168" width="5" height="49" rx="2" fill="#b96b2c"/><rect x="0" y="168" width="5" height="49" rx="2" fill="#984f1c"/></g></g>';

    const bag = '<g class="bag"><g class="bag-in">' +
      '<path d="M-4 -3L4 -3L6 -10L-6 -10Z" fill="#b8b8b8"/>' +
      '<path d="M0 -9L-6 -10L-30 -78Q-14 -92 0 -92Z" fill="#ffffff"/><path d="M0 -9L6 -10L30 -78Q14 -92 0 -92Z" fill="#e2e2e2"/></g></g>';

    const candles = candleList().map(candleHTML).join('');

    return '<svg class="cake-svg" viewBox="50 98 300 262" role="img" aria-label="A birthday cake saying ' + u.esc(msg) + ', with a sparkler and small candles on top">' +
      '<defs>' +
        '<radialGradient id="flame" cx=".5" cy=".8" r=".8"><stop offset="0" stop-color="#fff6c8"/><stop offset=".4" stop-color="#ffd24a"/><stop offset=".8" stop-color="#ff8a24"/><stop offset="1" stop-color="#ff5a1f" stop-opacity=".9"/></radialGradient>' +
        '<linearGradient id="steel" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6f7983"/><stop offset=".25" stop-color="#dfe5ea"/><stop offset=".5" stop-color="#f8fafb"/><stop offset=".75" stop-color="#aab3bb"/><stop offset="1" stop-color="#6a747e"/></linearGradient>' +
        '<pattern id="knurl" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="5" height="5" fill="none"/><path d="M0 0H5M0 0V5" stroke="rgba(60,70,80,.28)" stroke-width=".8"/></pattern>' +
        '<linearGradient id="fountain" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ffffff"/><stop offset=".25" stop-color="#ffe9a8"/><stop offset=".6" stop-color="#ffb347" stop-opacity=".7"/><stop offset="1" stop-color="#ff8a24" stop-opacity="0"/></linearGradient>' +
        '<radialGradient id="glow"><stop offset="0" stop-color="#ffd37a" stop-opacity=".7"/><stop offset=".5" stop-color="#ffb04a" stop-opacity=".25"/><stop offset="1" stop-color="#ff9a3a" stop-opacity="0"/></radialGradient>' +
      '</defs>' +
      '<g class="cp cake-board"><rect x="62" y="' + BOT + '" width="138" height="18" fill="#e0bda1"/><rect x="200" y="' + BOT + '" width="138" height="18" fill="#c9a589"/></g>' +
      sponge(304, 34, 'cake-l1') + creamStrip(298, 'cake-s1') + sponge(264, 34, 'cake-l2') + creamStrip(258, 'cake-s2') + sponge(TOP, 34, 'cake-l3') +
      '<rect class="frost-l" x="' + X0 + '" y="' + TOP + '" width="90" height="' + (BOT - TOP) + '" fill="#ffffff"/><rect class="frost-r" x="' + XM + '" y="' + TOP + '" width="90" height="' + (BOT - TOP) + '" fill="#e2e2e2"/>' +
      scallops + plaque + berries + sprigs +
      '<g class="candles">' + candles + '</g>' +
      spatula + bag + '</svg>';
  }

  /* ---------- Scene ---------- */
  App.SceneManager.register('cake', {
    init(sec, ctx) {
      const T = C.text, S = App.state;
      S.candlesTotal = 1;                      // only the sparkler has to finish; the small candles go out after it
      S.candlesOut = 0;

      sec.innerHTML =
        '<div class="cake-bg"></div>' +
        '<div class="cake-spot"></div>' +
        '<div class="cake-shadow"></div>' +
        '<div class="cake-drop">' + cakeSVG() + '</div>' +
        '<div class="table"><div class="table-trim"></div></div>' +
        App.Critters.cheer('left') + App.Critters.cheer('right') +
        '<div class="dimmer"></div>' +
        '<h1 class="finale-title"><span class="l1"></span><span class="l2"></span></h1>' +
        '<button class="btn primary next fade-up" type="button">' + u.esc(T.cakeNext) + '</button>';

      FX.balloons(sec, { count: 4, dim: true, prefill: true });
      const fx = FX.field(sec, { motes: 32, rgb: '255,205,120', rate: 6, max: 40 });
      ctx.add(fx.destroy);

      const svg = sec.querySelector('.cake-svg');
      const main = sec.querySelector('.candle.main');
      const smalls = Array.from(sec.querySelectorAll('.candle.small'));
      const nextBtn = sec.querySelector('.next');
      let ready = false, blowing = false;

      /* --- putting a candle out (flame snuffs, a little smoke curls up) --- */
      function snuff(c) {
        if (c.classList.contains('out')) return;
        c.classList.add('out');
        const smoke = c.querySelector('.smoke'), sy = c.dataset.sy;
        for (let i = 0; i < 3; i++) {
          const p = document.createElementNS(NS, 'circle');
          p.setAttribute('class', 'puff');
          p.setAttribute('r', 3.2 + i);
          p.setAttribute('cx', 0); p.setAttribute('cy', sy);
          p.style.setProperty('--dx', (i - 1) * 6 + 'px');
          p.style.animationDelay = (0.25 + i * 0.28) + 's';
          smoke.appendChild(p);
        }
        ctx.later(function () { smoke.textContent = ''; }, 3200);
      }

      /** Screen position (inside this scene) of the top of the sparkler. */
      function tipPos() {
        const f = main.querySelector('.flame').getBoundingClientRect(), s = sec.getBoundingClientRect();
        return { x: f.left + f.width / 2 - s.left, y: f.top + f.height * 0.85 - s.top };
      }

      /* --- a small candle can be blown out on its own --- */
      smalls.forEach(function (c) {
        function blow(e) { e.preventDefault(); if (!ready || blowing) return; App.audio.play('blow'); snuff(c); }
        ctx.on(c, 'click', blow);
        ctx.on(c, 'keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') blow(e); });
      });

      /* --- the sparkler: lights itself (or by a tap), burns for as long as its sound plays, then the small candles go out --- */
      async function lightSparkler() {
        if (!ready || blowing) return;
        blowing = true;
        const pos = tipPos();
        main.classList.add('fizz');
        App.audio.clip('sparkler', C.timing.sparklerBurn, 900);
        const fountain = fx.fountain(pos.x, pos.y, Math.min(1.25, sec.clientHeight / 700));
        ctx.add(fountain.stop);
        await ctx.sleep(C.timing.sparklerBurn - 700);
        fountain.stop();                                    // the fountain dies away …
        main.classList.add('dying');
        await ctx.sleep(900);
        main.classList.remove('fizz', 'dying');
        snuff(main);                                        // … the light closes …
        S.candlesOut = 1;
        smalls.forEach(function (c, i) { ctx.later(function () { App.audio.play('blow'); snuff(c); }, 120 + i * 100); });   // … and the small candles blow out
        ctx.later(finale, 120 + smalls.length * 100 + 900);
      }
      ctx.on(main, 'click', function (e) { e.preventDefault(); lightSparkler(); });
      ctx.on(main, 'keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); lightSparkler(); } });

      /* --- finale: only once the sparkler has finished --- */
      let done = false;
      async function finale() {
        if (done || S.candlesOut < S.candlesTotal) return;
        done = true;
        sec.classList.add('finale');
        App.audio.play('celebration');
        if (App.audio.has('voice')) ctx.later(function () { App.audio.play('voice'); }, 700);

        const r = svg.getBoundingClientRect(), W = sec.clientWidth;
        fx.burst(W / 2, r.top + r.height * 0.3, 70, true);
        ctx.later(function () { fx.burst(W * 0.25, r.top + r.height * 0.4, 40, true); }, 350);
        ctx.later(function () { fx.burst(W * 0.75, r.top + r.height * 0.4, 40, true); }, 650);
        fx.setConfetti(true);
        ctx.later(function () { fx.setConfetti(false); }, 4200);

        const parts = C.greeting.split(',');
        const t = sec.querySelector('.finale-title');
        u.letters(t.querySelector('.l1'), (parts[0] + (parts.length > 1 ? ',' : '')).toUpperCase(), 45);
        u.letters(t.querySelector('.l2'), parts.slice(1).join(',').trim().toUpperCase(), 80);
        await ctx.sleep(500);
        t.classList.add('reveal');
        await ctx.sleep(3600);
        nextBtn.classList.add('in');
      }

      ctx.on(nextBtn, 'click', function () {
        if (nextBtn.disabled) return;
        nextBtn.disabled = true;
        ['celebration', 'voice', 'blow', 'sparkler'].forEach(App.audio.stop);   // the calm music carries on into the letter
        App.SceneManager.go('letter', { mode: 'black', duration: 1600, hold: 500 });
      });

      /* --- the entrance: the cake is built step by step --- */
      const on = function (sel) { const el = svg.querySelector(sel); if (el) el.classList.add('on'); };
      (async function () {
        // 1. the board, then sponge and pink cream, layer by layer
        await ctx.sleep(250);
        sec.classList.add('landed');
        on('.cake-board');
        await ctx.sleep(450);
        ['.cake-l1', '.cake-s1', '.cake-l2', '.cake-s2', '.cake-l3'].forEach(function (sel, i) { ctx.later(function () { on(sel); }, i * 340); });
        await ctx.sleep(5 * 340 + 350);

        // 2. a spatula sweeps white frosting over the sides
        on('.spat-in');
        await ctx.sleep(450);
        sec.classList.add('sweep');
        await ctx.sleep(1300 + 250);
        svg.querySelector('.spat-in').classList.remove('on');
        await ctx.sleep(450);

        // 3. a piping bag pipes the scalloped cream along the top
        const bag = svg.querySelector('.bag'), bagIn = svg.querySelector('.bag-in');
        const scallops = Array.from(svg.querySelectorAll('.scallop'));
        const step = (X1 - X0) / scallops.length;
        bag.style.transform = 'translate(' + (X0 + step / 2) + 'px, 132px)';
        void bag.getBoundingClientRect();
        bagIn.classList.add('on');
        await ctx.sleep(400);
        for (let i = 0; i < scallops.length; i++) {
          bag.style.transform = 'translate(' + (X0 + step * (i + 0.5)) + 'px, 214px)';
          await ctx.sleep(230);
          scallops[i].classList.add('on');
          await ctx.sleep(110);
        }
        bag.style.transform = 'translate(' + (X1 + 40) + 'px, 140px)';
        bagIn.classList.remove('on');
        await ctx.sleep(500);

        // 4. berries and the plaque with the greeting
        svg.querySelectorAll('.berry').forEach(function (el, i) { ctx.later(function () { el.classList.add('on'); }, i * 110); });
        await ctx.sleep(8 * 110 + 200);
        on('.plaque');
        await ctx.sleep(700);

        // 5. the candles
        sec.classList.add('candles-in');
        await ctx.sleep(2200);
        sec.classList.add('lit');
        await ctx.sleep(900);
        await ctx.sleep(900);
        ready = true;
        lightSparkler();                       // no button to press: the sparkler lights itself, with its sound
      })();
    }
  });
})(window.App);
