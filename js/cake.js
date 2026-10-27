/* SCENE 6 – A three-tier sky-blue cake on a gold-rimmed stand is built in front of her: each tier lands and is dressed with
   frosting and pearls, the greeting appears, then butterflies settle on its sides one after another. A cold sparkler stands in
   the middle of the top, small candles beside it. Tapping the sparkler lights it: a fountain of sparks shoots up while its
   sound plays. When it dies away the small candles blow out one by one and the finale begins. */
(function (App) {
  const { CONFIG: C, u, FX } = App;
  const NS = 'http://www.w3.org/2000/svg';
  const STRIPES = ['#ffffff', '#d4ecfb', '#f3d27a', '#bfe3fb'];

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

  /* ---- A three-tier sky-blue cake on a gold-rimmed stand, with butterflies resting on its sides ---- */
  const TIERS = [                                              // x, width, top y, height (bottom tier first)
    { x: 90,  w: 220, top: 300, h: 62 },
    { x: 120, w: 160, top: 240, h: 60 },
    { x: 148, w: 104, top: 186, h: 54 }
  ];
  const CANDLE_BASE = 184, LEDGE_BASE = 238;

  /** The candles: four small ones on the top tier, one each on the ledge of the middle tier, the sparkler in the middle. */
  function candleList() {
    const list = [[160, CANDLE_BASE], [176, CANDLE_BASE], [224, CANDLE_BASE], [240, CANDLE_BASE], [133, LEDGE_BASE], [267, LEDGE_BASE]]
      .map(function (p) { return { x: p[0], base: p[1], w: 7, h: 30, fs: 0.62, main: false }; });
    list.forEach(function (c, i) { c.i = i; c.ci = (i * 0.2).toFixed(2); });
    list.push({ x: 200, base: CANDLE_BASE, h: 84, main: true, i: list.length, ci: (list.length * 0.2 + 0.6).toFixed(2) });
    return list;
  }

  /** Piped white scallops along the top edge of a tier; each pops in on its own as the piping bag passes. */
  function scallops(t, k) {
    const n = Math.round(t.w / 17), r = t.w / n / 2;
    let s = '';
    for (let i = 0; i < n; i++) {
      const xl = t.x + i * r * 2, xr = xl + r * 2;
      s += '<path class="pop scl scl-' + k + '" d="M' + f1(xl) + ' ' + (t.top - 3) + 'H' + f1(xr) + 'V' + t.top + 'A' + f1(r) + ' ' + f1(r * 1.15) + ' 0 0 1 ' + f1(xl) + ' ' + t.top + 'Z" fill="url(#sk-white)"/>';
    }
    return s;
  }
  function f1(n) { return (Math.round(n * 10) / 10).toString(); }

  /** A row of pearls along the foot of a tier. */
  function pearls(t) {
    const n = Math.round(t.w / 13), step = t.w / n;
    let s = '';
    for (let i = 0; i <= n; i++) {
      const x = t.x + i * step, y = t.top + t.h - 4.5;
      s += '<circle cx="' + f1(x) + '" cy="' + y + '" r="3.3" fill="#fff" stroke="#c9dceb" stroke-width=".6"/><circle cx="' + f1(x - 1) + '" cy="' + (y - 1.1) + '" r="1" fill="#fff"/>';
    }
    return s;
  }

  /** Little garlands of pearls draped across the middle tier. */
  function garlands(t) {
    const n = 4, w = t.w / n;
    let s = '';
    for (let i = 0; i < n; i++) {
      const x0 = t.x + i * w, x1 = x0 + w, y = t.top + 14, dip = 11;
      s += '<path d="M' + f1(x0 + 2) + ' ' + y + 'Q' + f1((x0 + x1) / 2) + ' ' + (y + dip * 2) + ' ' + f1(x1 - 2) + ' ' + y + '" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-dasharray="0.1 4.4"/>';
      s += '<path d="M' + f1(x0 + 2) + ' ' + y + 'Q' + f1((x0 + x1) / 2) + ' ' + (y + dip * 2) + ' ' + f1(x1 - 2) + ' ' + y + '" fill="none" stroke="#ffffff" stroke-opacity=".0"/>';
      s += '<circle cx="' + f1((x0 + x1) / 2) + '" cy="' + (y + dip + 1) + '" r="2.6" fill="#f3d27a" stroke="#b58a2a" stroke-width=".6"/>';
    }
    return s;
  }

  /** A tiny row of white blossoms and gold dots on the top tier. */
  function blossoms(t) {
    let s = '';
    for (let i = 0; i < 5; i++) {
      const x = t.x + 14 + i * (t.w - 28) / 4, y = t.top + 25;
      for (let k = 0; k < 5; k++) {
        const a = k * 72 * Math.PI / 180;
        s += '<circle cx="' + f1(x + Math.sin(a) * 3.1) + '" cy="' + f1(y - Math.cos(a) * 3.1) + '" r="2.3" fill="#fff"/>';
      }
      s += '<circle cx="' + f1(x) + '" cy="' + y + '" r="1.7" fill="#f3d27a"/>';
    }
    return s;
  }

  /** A butterfly resting on the cake (about 56 wide). Wings are sky blue, white or blush, with a gold edge. */
  function butterfly(x, y, scale, rot, tone) {
    const g = ['sk-bf-a', 'sk-bf-b', 'sk-bf-c'][tone % 3];
    const half = '<path d="M2 -3C8 -26 34 -30 36 -13C37 -3 16 4 2 0Z" fill="url(#' + g + ')" stroke="#c99a3a" stroke-width="1.1" stroke-linejoin="round"/>' +
      '<path d="M2 2C18 2 30 9 25 22C20 32 5 24 2 5Z" fill="url(#' + g + ')" stroke="#c99a3a" stroke-width="1.1" stroke-linejoin="round"/>' +
      '<path d="M3 -2C12 -12 22 -16 30 -14M3 3C14 8 20 14 21 21" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width=".9" stroke-linecap="round"/>' +
      '<circle cx="24" cy="-14" r="3.2" fill="#fff" fill-opacity=".85"/><circle cx="15" cy="-7" r="1.9" fill="#fff" fill-opacity=".8"/><circle cx="17" cy="14" r="2.4" fill="#fff" fill-opacity=".85"/>';
    return '<g transform="translate(' + x + ' ' + y + ') rotate(' + rot + ') scale(' + scale + ')"><g class="pop bfly">' +
      '<g class="bf-wings"><g>' + half + '</g><g transform="scale(-1 1)">' + half + '</g></g>' +
      '<ellipse cx="0" cy="1" rx="2.3" ry="10.5" fill="#6b4a1e"/><path d="M-.6 -9Q-4 -17 -8 -18M.6 -9Q4 -17 8 -18" fill="none" stroke="#6b4a1e" stroke-width="1" stroke-linecap="round"/>' +
      '<circle cx="-8" cy="-18" r="1.2" fill="#6b4a1e"/><circle cx="8" cy="-18" r="1.2" fill="#6b4a1e"/></g></g>';
  }

  function cakeSVG() {
    const grad = function (id, a, b, c) { return '<linearGradient id="' + id + '" gradientUnits="userSpaceOnUse" x1="90" y1="0" x2="310" y2="0"><stop offset="0" stop-color="' + a + '"/><stop offset=".55" stop-color="' + b + '"/><stop offset="1" stop-color="' + c + '"/></linearGradient>'; };

    const tiers = [];
    TIERS.forEach(function (t, i) {
      const k = i + 1, box = ' x="' + t.x + '" y="' + t.top + '" width="' + t.w + '" height="' + t.h + '" rx="3"';
      tiers.push('<g class="cp cake-l' + k + '"><rect' + box + ' fill="url(#sk-sponge)"/>' +
        '<rect class="frost frost-' + k + '"' + box + ' fill="url(#sk-sky)"/><rect class="frost frost-' + k + '"' + box + ' fill="url(#sk-shade)"/></g>');
    });

    // trims, one group per tier, so each can pop in after its tier lands
    const t1 = TIERS[0], t2 = TIERS[1], t3 = TIERS[2];
    const trim1 = scallops(t1, 1) + '<g class="pop cake-d1"><rect x="' + t1.x + '" y="' + (t1.top + t1.h - 13) + '" width="' + t1.w + '" height="2.4" fill="#e3bf62"/>' + pearls(t1) + '</g>';
    const trim2 = scallops(t2, 2) + '<g class="pop cake-d2"><rect x="' + t2.x + '" y="' + (t2.top + t2.h - 13) + '" width="' + t2.w + '" height="2.4" fill="#e3bf62"/>' + pearls(t2) + '</g>';
    const trim3 = scallops(t3, 3) + '<g class="pop cake-d3">' + pearls(t3) + '</g>';

    // the greeting, one word per layer: HAPPY on the top tier, BIRTHDAY in the middle, PRATIMA on the bottom (each pops in with its tier)
    const word = function (txt, tier, k, size, len) {
      return '<text class="pop cake-msg cake-d' + k + '" x="200" y="' + (tier.top + tier.h * 0.58).toFixed(1) + '" text-anchor="middle" font-family="Jost, Segoe UI, system-ui, sans-serif" font-weight="700" font-size="' + size + '" fill="#ffffff" stroke="#3f8cc4" stroke-width="2.6" paint-order="stroke fill" stroke-linejoin="round" textLength="' + len + '" lengthAdjust="spacing">' + u.esc(txt) + '</text>';
    };
    const text = word('HAPPY', t3, 3, 19, 70) + word('BIRTHDAY', t2, 2, 22, 124) + word('PRATIMA', t1, 1, 25, 152);

    const bf = [[93, 318, 1.05, -22, 0], [307, 326, 1.0, 20, 1], [106, 262, .92, -26, 1], [294, 258, .95, 24, 0], [134, 208, .8, -20, 2], [266, 212, .78, 18, 1]]
      .map(function (b) { return butterfly(b[0], b[1], b[2], b[3], b[4]); }).join('');

    const stand = '<g class="cp cake-board">' +
      '<path d="M178 376H222L216 392H184Z" fill="url(#sk-gold)"/><path d="M160 392H240Q246 392 246 398Q246 404 240 404H160Q154 404 154 398Q154 392 160 392Z" fill="url(#sk-gold)"/>' +
      '<rect x="70" y="361" width="260" height="14" rx="7" fill="url(#sk-plate)" stroke="#d9b25a" stroke-width="1.4"/><rect x="82" y="364" width="236" height="2" rx="1" fill="#fff" fill-opacity=".8"/></g>';

    const spatula = '<g class="spatula"><g class="spat-in">' +
      '<rect x="-4" y="0" width="4" height="70" rx="1.5" fill="#f1f1f1"/><rect x="0" y="0" width="4" height="70" rx="1.5" fill="#d3d3d3"/>' +
      '<rect x="-5.5" y="-10" width="5.5" height="11" fill="#e8e8e8"/><rect x="0" y="-10" width="5.5" height="11" fill="#cdcdcd"/>' +
      '<rect x="-5" y="-58" width="5" height="49" rx="2" fill="#b96b2c"/><rect x="0" y="-58" width="5" height="49" rx="2" fill="#984f1c"/></g></g>';
    const bag = '<g class="bag"><g class="bag-in">' +
      '<path d="M-4 -3L4 -3L6 -10L-6 -10Z" fill="#b8b8b8"/>' +
      '<path d="M0 -9L-6 -10L-30 -78Q-14 -92 0 -92Z" fill="#ffffff"/><path d="M0 -9L6 -10L30 -78Q14 -92 0 -92Z" fill="#e2e2e2"/></g></g>';

    const candles = candleList().map(candleHTML).join('');

    return '<svg class="cake-svg" viewBox="52 96 296 312" role="img" aria-label="A three-tier sky-blue birthday cake with HAPPY, BIRTHDAY and PRATIMA on its three layers, with butterflies on its sides, a sparkler and small candles on top">' +
      '<defs>' +
        grad('sk-sky', '#c4e6fb', '#9fd2f3', '#76b8e6') + grad('sk-white', '#ffffff', '#f5fafe', '#dbe9f4') +
        '<linearGradient id="sk-sponge" gradientUnits="userSpaceOnUse" x1="90" y1="0" x2="310" y2="0"><stop offset="0" stop-color="#f9f0c6"/><stop offset="1" stop-color="#e6d79b"/></linearGradient>' +
        '<linearGradient id="sk-shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#2d6fa6" stop-opacity=".18"/></linearGradient>' +
        '<linearGradient id="sk-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbe9a2"/><stop offset=".5" stop-color="#dcae45"/><stop offset="1" stop-color="#b98a22"/></linearGradient>' +
        '<linearGradient id="sk-plate" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffdf7"/><stop offset="1" stop-color="#eadfc6"/></linearGradient>' +
        '<linearGradient id="sk-bf-a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e4f4ff"/><stop offset=".55" stop-color="#8ec9f0"/><stop offset="1" stop-color="#4f9dd8"/></linearGradient>' +
        '<linearGradient id="sk-bf-b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#d4ecfb"/><stop offset="1" stop-color="#9ccdee"/></linearGradient>' +
        '<linearGradient id="sk-bf-c" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff2f6"/><stop offset=".55" stop-color="#f9c6d8"/><stop offset="1" stop-color="#ee98b8"/></linearGradient>' +
        '<linearGradient id="steel" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6f7983"/><stop offset=".25" stop-color="#dfe5ea"/><stop offset=".5" stop-color="#f8fafb"/><stop offset=".75" stop-color="#aab3bb"/><stop offset="1" stop-color="#6a747e"/></linearGradient>' +
        '<pattern id="knurl" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="5" height="5" fill="none"/><path d="M0 0H5M0 0V5" stroke="rgba(60,70,80,.28)" stroke-width=".8"/></pattern>' +
        '<radialGradient id="flame" cx=".5" cy=".8" r=".8"><stop offset="0" stop-color="#fff6c8"/><stop offset=".4" stop-color="#ffd24a"/><stop offset=".8" stop-color="#ff8a24"/><stop offset="1" stop-color="#ff5a1f" stop-opacity=".9"/></radialGradient>' +
        '<linearGradient id="fountain" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ffffff"/><stop offset=".25" stop-color="#ffe9a8"/><stop offset=".6" stop-color="#ffb347" stop-opacity=".7"/><stop offset="1" stop-color="#ff8a24" stop-opacity="0"/></linearGradient>' +
        '<radialGradient id="glow"><stop offset="0" stop-color="#ffd37a" stop-opacity=".7"/><stop offset=".5" stop-color="#ffb04a" stop-opacity=".25"/><stop offset="1" stop-color="#ff9a3a" stop-opacity="0"/></radialGradient>' +
      '</defs>' +
      stand + tiers[0] + trim1 + tiers[1] + trim2 + tiers[2] + trim3 + text + bf + '<g class="candles">' + candles + '</g>' + spatula + bag +
      '</svg>';
  }

  /* ---------- Scene ---------- */
  App.SceneManager.register('cake', {
    init(sec, ctx) {
      const T = C.text, S = App.state;
      S.candlesTotal = 1;                      // only the sparkler has to finish; the small candles go out after it
      S.candlesOut = 0;

      sec.innerHTML =
        '<div class="cake-drop">' + cakeSVG() + '</div>' +
        '<div class="dimmer"></div>' +
        '<h1 class="finale-title"><span class="l1"></span><span class="l2"></span></h1>' +
        '<button class="btn primary next fade-up" type="button">' + u.esc(T.cakeNext) + '</button>';

      const fx = FX.field(sec, { motes: 0, rgb: '255,205,120', rate: 6, max: 40 });
      ctx.add(fx.destroy);

      const svg = sec.querySelector('.cake-svg');
      const main = sec.querySelector('.candle.main');
      const smalls = Array.from(sec.querySelectorAll('.candle.small'));
      const nextBtn = sec.querySelector('.next');
      u.hint(nextBtn, 'above');
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
        App.SceneManager.go('message', { mode: 'black', duration: 1600, hold: 500 });
      });

      /* --- the entrance: stand, then each tier: sponge lands, a spatula spreads frosting, a piping bag pipes scallops, pearls go on; then the greeting, then the butterflies one by one --- */
      const on = function (sel) { const el = svg.querySelector(sel); if (el) el.classList.add('on'); };
      const popAll = async function (sel, gap) {
        const els = Array.from(svg.querySelectorAll(sel));
        for (let i = 0; i < els.length; i++) { els[i].classList.add('on'); await ctx.sleep(gap); }
      };
      (async function () {
        await ctx.sleep(250);
        sec.classList.add('landed');
        on('.cake-board');
        await ctx.sleep(600);
        const sp = svg.querySelector('.spatula'), spIn = svg.querySelector('.spat-in');
        const bag = svg.querySelector('.bag'), bagIn = svg.querySelector('.bag-in');
        const place = function (el, x, y, ms) { el.style.transition = ms ? 'transform ' + ms + 'ms linear' : 'none'; el.style.transform = 'translate(' + x + 'px,' + y + 'px)'; };
        for (let k = 1; k <= 3; k++) {
          const t = TIERS[k - 1];
          on('.cake-l' + k);                                           // 1. the sponge lands
          await ctx.sleep(520);
          place(sp, t.x - 8, t.top - 4, 0); void sp.getBoundingClientRect(); spIn.classList.add('on');
          await ctx.sleep(250);                                        // 2. a spatula sweeps sky-blue frosting over its sides
          place(sp, t.x + t.w + 8, t.top - 4, 850);
          svg.querySelectorAll('.frost-' + k).forEach(function (el) { el.classList.add('on'); });
          await ctx.sleep(900);
          spIn.classList.remove('on');
          await ctx.sleep(250);
          const sc = Array.from(svg.querySelectorAll('.scl-' + k)), step = t.w / sc.length;   // 3. a piping bag pipes white scallops along the top
          place(bag, t.x + step / 2, t.top - 70, 0); void bag.getBoundingClientRect(); bag.style.transition = 'transform .14s ease-in-out';
          bagIn.classList.add('on');
          await ctx.sleep(250);
          for (let i = 0; i < sc.length; i++) {
            bag.style.transform = 'translate(' + (t.x + step * (i + 0.5)) + 'px,' + (t.top - 5) + 'px)';
            await ctx.sleep(150);
            sc[i].classList.add('on');
            await ctx.sleep(50);
          }
          bag.style.transform = 'translate(' + (t.x + t.w + 50) + 'px,' + (t.top - 70) + 'px)';
          bagIn.classList.remove('on');
          await ctx.sleep(300);
          svg.querySelectorAll('.cake-d' + k).forEach(function (el, i) { ctx.later(function () { el.classList.add('on'); }, i * 40); });   // 4. pearls and little decorations
          await ctx.sleep(500);
        }
        await ctx.sleep(900);
        await popAll('.bfly', 520);                    // butterflies settle on the sides, one after another
        await ctx.sleep(500);
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
