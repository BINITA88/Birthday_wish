/* SCENE 6 – The grand birthday cake: a cold sparkler in the middle of the top, small candles on the lower tiers, the
   name piped on the bottom tier. Tapping the sparkler lights it: a fountain of sparks shoots up while its sound plays.
   When it dies away the small candles blow out one by one and the finale begins. */
(function (App) {
  const { CONFIG: C, u, FX } = App;
  const NS = 'http://www.w3.org/2000/svg';
  const STRIPES = ['#F4B6C2', '#FFF3E0', '#F4C76B', '#FAF7F2'];

  /* ---------- SVG cake ---------- */
  function tier(cx, topY, rx, h, fill, rimFill) {
    const ry = rx * 0.125;
    return { cx: cx, topY: topY, rx: rx, ry: ry, h: h,
      html:
        '<path d="M' + (cx - rx) + ' ' + topY + 'v' + h + 'a' + rx + ' ' + ry + ' 0 0 0 ' + (rx * 2) + ' 0v-' + h + 'z" fill="' + fill + '"/>' +
        '<path d="M' + (cx - rx) + ' ' + topY + 'v' + h + 'a' + rx + ' ' + ry + ' 0 0 0 ' + (rx * 2) + ' 0v-' + h + 'z" fill="url(#shade)"/>' +
        '<ellipse cx="' + cx + '" cy="' + topY + '" rx="' + rx + '" ry="' + ry + '" fill="' + rimFill + '"/>' };
  }

  /** Cream drips + piped pearls along a tier. */
  function trim(t) {
    let s = '';
    const nDrip = Math.round(t.rx / 11);
    for (let i = 0; i <= nDrip; i++) {
      const th = Math.PI * i / nDrip, x = t.cx - t.rx * Math.cos(th), y = t.topY + t.ry * Math.sin(th);
      const len = 7 + ((i * 37) % 17);
      s += '<rect x="' + (x - 4.5).toFixed(1) + '" y="' + (y - 3).toFixed(1) + '" width="9" height="' + len + '" rx="4.5" fill="#FFF8EC"/>';
    }
    const nPearl = Math.round(t.rx / 9);
    for (let i = 0; i <= nPearl; i++) {
      const th = Math.PI * i / nPearl, x = t.cx - t.rx * Math.cos(th), y = t.topY + t.h + t.ry * Math.sin(th) - 4;
      s += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="3.6" fill="#FFF8EC" stroke="#E6CFAE" stroke-width=".6"/>';
    }
    return s;
  }

  function cakeFlower(x, y, r, col) {
    let s = '';
    for (let i = 0; i < 5; i++) {
      const a = i * 72 * Math.PI / 180;
      s += '<circle cx="' + (x + Math.sin(a) * r * 0.62).toFixed(1) + '" cy="' + (y - Math.cos(a) * r * 0.62).toFixed(1) + '" r="' + (r * 0.5).toFixed(1) + '" fill="' + col + '"/>';
    }
    return s + '<circle cx="' + x + '" cy="' + y + '" r="' + (r * 0.34).toFixed(1) + '" fill="#F4C76B"/>';
  }

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

  /** The candles: small ones around the visible ring of the two lower tiers, the big one alone on top. */
  function candleList() {
    const rings = [
      { topY: 172, R: 96,  ry: 11, deg: [12, 32, 54, 126, 148, 168] },        // top tier, around the sparkler
      { topY: 236, R: 121, ry: 15, deg: [10, 28, 46, 64, 82, 98, 116, 134, 152, 170] }   // middle tier, all the way round; the bottom tier carries the writing
    ];
    const list = [];
    rings.forEach(function (r) {
      r.deg.forEach(function (d) {
        const th = d * Math.PI / 180;
        list.push({ x: 200 - r.R * Math.cos(th), base: r.topY + r.ry * Math.sin(th), w: 7, h: 30, fs: 0.62, main: false });
      });
    });
    list.sort(function (a, b) { return a.base - b.base; });                  // back to front
    list.forEach(function (c, i) { c.i = i; c.ci = (i * 0.2).toFixed(2); });
    list.push({ x: 200, base: 174, h: 84, main: true, i: list.length, ci: (list.length * 0.2 + 0.6).toFixed(2) });
    return list;
  }

  function cakeSVG() {
    const plate = '<ellipse cx="200" cy="378" rx="190" ry="22" fill="#e7d3a6"/><ellipse cx="200" cy="374" rx="190" ry="22" fill="url(#plate)"/><ellipse cx="200" cy="374" rx="168" ry="17" fill="none" stroke="#F4C76B" stroke-width="1.2" opacity=".8"/>';
    const t1 = tier(200, 302, 160, 68, 'url(#pink)', 'url(#cream)');
    const t2 = tier(200, 236, 130, 62, 'url(#cream2)', 'url(#cream)');
    const t3 = tier(200, 172, 110, 54, 'url(#pink)', 'url(#cream)');
    let flowers = '';
    [[84, 349, 11, '#F4C76B'], [316, 349, 11, '#F4C76B'], [150, 363, 10, '#FFF3E0'], [250, 363, 10, '#FFF3E0'], [200, 367, 11, '#D84A65'],
     [150, 262, 9, '#F4B6C2'], [250, 262, 9, '#F4B6C2'],
     [135, 202, 8, '#FFF3E0'], [265, 202, 8, '#FFF3E0'], [200, 210, 9, '#F4C76B']].forEach(function (f) { flowers += cakeFlower(f[0], f[1], f[2], f[3]); });
    let leaves = '';
    [[110, 366], [290, 366], [122, 268], [278, 268]].forEach(function (p) { leaves += '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="9" ry="3.6" fill="#4f8a58" transform="rotate(-24 ' + p[0] + ' ' + p[1] + ')"/>'; });

    // "Happy Birthday <name>" piped across the front of the bottom tier, bending with the cake
    const message =
      '<path id="cake-msg-path" d="M46 332Q200 358 354 332" fill="none"/>' +
      '<text class="cake-msg" font-family="\'Great Vibes\',\'Brush Script MT\',cursive" font-size="31" text-anchor="middle" fill="#ffffff" stroke="#8a1f48" stroke-width="3" paint-order="stroke fill" stroke-linejoin="round" textLength="292" lengthAdjust="spacingAndGlyphs">' +
      '<textPath href="#cake-msg-path" startOffset="50%" textLength="292" lengthAdjust="spacingAndGlyphs">' + u.esc(C.cakeMessage) + '</textPath></text>';

    const candles = candleList().map(candleHTML).join('');

    return '<svg class="cake-svg" viewBox="0 24 400 368" role="img" aria-label="A birthday cake saying ' + u.esc(C.cakeMessage) + ', with a sparkler on top and small candles on the lower tiers">' +
      '<defs>' +
        '<linearGradient id="pink" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbd2db"/><stop offset="1" stop-color="#eba3b6"/></linearGradient>' +
        '<linearGradient id="cream" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffaf0"/><stop offset="1" stop-color="#f6e3c8"/></linearGradient>' +
        '<linearGradient id="cream2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3e0"/><stop offset="1" stop-color="#ecd2ac"/></linearGradient>' +
        '<linearGradient id="shade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".22"/><stop offset=".35" stop-color="#fff" stop-opacity=".08"/><stop offset=".7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".28"/></linearGradient>' +
        '<radialGradient id="plate" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#fffdf7"/><stop offset="1" stop-color="#e9dcc2"/></radialGradient>' +
        '<radialGradient id="flame" cx=".5" cy=".8" r=".8"><stop offset="0" stop-color="#fff6c8"/><stop offset=".4" stop-color="#ffd24a"/><stop offset=".8" stop-color="#ff8a24"/><stop offset="1" stop-color="#ff5a1f" stop-opacity=".9"/></radialGradient>' +
        '<linearGradient id="steel" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6f7983"/><stop offset=".25" stop-color="#dfe5ea"/><stop offset=".5" stop-color="#f8fafb"/><stop offset=".75" stop-color="#aab3bb"/><stop offset="1" stop-color="#6a747e"/></linearGradient>' +
        '<pattern id="knurl" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="5" height="5" fill="none"/><path d="M0 0H5M0 0V5" stroke="rgba(60,70,80,.28)" stroke-width=".8"/></pattern>' +
        '<linearGradient id="fountain" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ffffff"/><stop offset=".25" stop-color="#ffe9a8"/><stop offset=".6" stop-color="#ffb347" stop-opacity=".7"/><stop offset="1" stop-color="#ff8a24" stop-opacity="0"/></linearGradient>' +
        '<radialGradient id="glow"><stop offset="0" stop-color="#ffd37a" stop-opacity=".7"/><stop offset=".5" stop-color="#ffb04a" stop-opacity=".25"/><stop offset="1" stop-color="#ff9a3a" stop-opacity="0"/></radialGradient>' +
      '</defs>' +
      plate + t1.html + trim(t1) + t2.html + trim(t2) + t3.html + trim(t3) + leaves + flowers + message +
      '<g class="candles">' + candles + '</g></svg>';
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
        ['celebration', 'voice', 'blow', 'sparkler'].forEach(App.audio.stop);   // the calm music carries on into dinner
        App.SceneManager.go('dinner', { mode: 'black', duration: 1600, hold: 500 });
      });

      /* --- the entrance: the cake is already on the table -> candles appear -> flames light --- */
      (async function () {
        sec.classList.add('landed');           // the cake is simply there from the start – it does not drop in
        await ctx.sleep(900);
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
