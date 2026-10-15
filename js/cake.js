/* SCENE 6 – The grand birthday cake. */
(function (App) {
  const { CONFIG: C, u, FX } = App;
  const NS = 'http://www.w3.org/2000/svg';
  const CANDLE_X = [104, 158, 242, 296];
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

  function candleHTML(x, i) {
    const fd = (0.16 + (i % 3) * 0.035).toFixed(3);
    return '<g transform="translate(' + x + ' 0)"><g class="candle" data-i="' + i + '" tabindex="0" role="button" aria-label="Blow out candle ' + (i + 1) + '" style="--ci:' + i + ';--fd:' + fd + 's">' +
      '<rect class="hit" x="-27" y="62" width="54" height="126" fill="transparent"/>' +
      '<rect x="-4.6" y="122" width="9.2" height="52" rx="2" fill="' + STRIPES[i % 4] + '" stroke="#d9b98a" stroke-width=".6"/>' +
      '<path d="M-4.6 134l9.2-5M-4.6 146l9.2-5M-4.6 158l9.2-5" stroke="rgba(216,74,101,.55)" stroke-width="2.4"/>' +
      '<path d="M0 122v-6" stroke="#4a3220" stroke-width="1.6" stroke-linecap="round"/>' +
      '<g class="glow-wrap"><circle class="glow" cx="0" cy="104" r="34" fill="url(#glow)"/></g>' +
      '<g class="flame-in" transform="translate(0 0)"><g class="flame-box"><g class="flame">' +
        '<path d="M0 88C8 98 9 108 0 117C-9 108 -8 98 0 88Z" fill="url(#flame)"/>' +
        '<path d="M0 104C3.5 108 3.5 112 0 115C-3.5 112 -3.5 108 0 104Z" fill="#fff6c8" opacity=".9"/>' +
      '</g></g></g>' +
      '<g class="smoke"></g></g></g>';
  }

  function cakeSVG() {
    const plate = '<ellipse cx="200" cy="378" rx="190" ry="22" fill="#e7d3a6"/><ellipse cx="200" cy="374" rx="190" ry="22" fill="url(#plate)"/><ellipse cx="200" cy="374" rx="168" ry="17" fill="none" stroke="#F4C76B" stroke-width="1.2" opacity=".8"/>';
    const t1 = tier(200, 302, 160, 68, 'url(#pink)', 'url(#cream)');
    const t2 = tier(200, 236, 130, 62, 'url(#cream2)', 'url(#cream)');
    const t3 = tier(200, 172, 110, 54, 'url(#pink)', 'url(#cream)');
    let flowers = '';
    [[84, 346, 11, '#F4C76B'], [316, 346, 11, '#F4C76B'], [150, 360, 10, '#FFF3E0'], [250, 360, 10, '#FFF3E0'], [200, 365, 12, '#D84A65'],
     [92, 280, 9, '#F4B6C2'], [308, 280, 9, '#F4B6C2'], [200, 298, 10, '#D84A65'],
     [118, 218, 8, '#FFF3E0'], [282, 218, 8, '#FFF3E0'], [200, 232, 9, '#F4C76B']].forEach(function (f) { flowers += cakeFlower(f[0], f[1], f[2], f[3]); });
    let leaves = '';
    [[110, 366], [290, 366], [130, 296], [270, 296]].forEach(function (p) { leaves += '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="9" ry="3.6" fill="#4f8a58" transform="rotate(-24 ' + p[0] + ' ' + p[1] + ')"/>'; });

    const topper =
      '<g class="topper"><path d="M200 172V58" stroke="#d6a548" stroke-width="2.6" stroke-linecap="round"/>' +
      '<rect x="138" y="16" width="124" height="40" rx="12" fill="url(#gold)" stroke="#b9822a" stroke-width="1"/>' +
      '<text x="200" y="45" text-anchor="middle" font-family="\'Great Vibes\',\'Brush Script MT\',cursive" font-size="29" fill="#4a2c05">' + u.esc(C.name) + '</text></g>';

    let candles = '';
    CANDLE_X.forEach(function (x, i) { candles += candleHTML(x, i); });

    return '<svg class="cake-svg" viewBox="0 0 400 392" role="img" aria-label="A birthday cake with ' + CANDLE_X.length + ' candles">' +
      '<defs>' +
        '<linearGradient id="pink" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbd2db"/><stop offset="1" stop-color="#eba3b6"/></linearGradient>' +
        '<linearGradient id="cream" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffaf0"/><stop offset="1" stop-color="#f6e3c8"/></linearGradient>' +
        '<linearGradient id="cream2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3e0"/><stop offset="1" stop-color="#ecd2ac"/></linearGradient>' +
        '<linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbe19a"/><stop offset=".5" stop-color="#F4C76B"/><stop offset="1" stop-color="#d9a24a"/></linearGradient>' +
        '<linearGradient id="shade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".22"/><stop offset=".35" stop-color="#fff" stop-opacity=".08"/><stop offset=".7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".28"/></linearGradient>' +
        '<radialGradient id="plate" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#fffdf7"/><stop offset="1" stop-color="#e9dcc2"/></radialGradient>' +
        '<radialGradient id="flame" cx=".5" cy=".8" r=".8"><stop offset="0" stop-color="#fff6c8"/><stop offset=".4" stop-color="#ffd24a"/><stop offset=".8" stop-color="#ff8a24"/><stop offset="1" stop-color="#ff5a1f" stop-opacity=".9"/></radialGradient>' +
        '<radialGradient id="glow"><stop offset="0" stop-color="#ffd37a" stop-opacity=".7"/><stop offset=".5" stop-color="#ffb04a" stop-opacity=".25"/><stop offset="1" stop-color="#ff9a3a" stop-opacity="0"/></radialGradient>' +
      '</defs>' +
      plate + t1.html + trim(t1) + t2.html + trim(t2) + t3.html + trim(t3) + leaves + flowers + topper +
      '<g class="candles">' + candles + '</g></svg>';
  }

  /* ---------- Scene ---------- */
  App.SceneManager.register('cake', {
    init(sec, ctx) {
      const T = C.text, S = App.state;
      S.candlesTotal = CANDLE_X.length;
      S.candlesOut = 0;

      sec.innerHTML =
        '<div class="cake-bg"></div>' +
        '<div class="cake-spot"></div>' +
        '<div class="cake-text"><p class="wish fade-up">' + u.esc(T.cakeWish) + '</p><p class="tap fade-up">' + u.esc(T.cakeHint) + '</p></div>' +
        '<div class="cake-shadow"></div>' +
        '<div class="cake-drop">' + cakeSVG() + '</div>' +
        '<div class="table"><div class="table-trim"></div></div>' +
        '<div class="dimmer"></div>' +
        '<h1 class="finale-title"><span class="l1"></span><span class="l2"></span></h1>' +
        '<button class="btn primary next fade-up" type="button">' + u.esc(T.cakeNext) + '</button>';

      FX.balloons(sec, { count: 4, dim: true, prefill: true });
      const fx = FX.field(sec, { motes: 32, rgb: '255,205,120', rate: 6, max: 40 });
      ctx.add(fx.destroy);

      const drop = sec.querySelector('.cake-drop');
      const svg = sec.querySelector('.cake-svg');
      const candles = Array.from(sec.querySelectorAll('.candle'));
      const wish = sec.querySelector('.wish'), tap = sec.querySelector('.tap');
      const nextBtn = sec.querySelector('.next');
      let ready = false;

      /* --- candle interaction --- */
      function snuff(c) {
        if (!ready || c.classList.contains('out')) return;
        c.classList.add('out');
        App.audio.play('blow');
        const smoke = c.querySelector('.smoke');
        for (let i = 0; i < 3; i++) {
          const p = document.createElementNS(NS, 'circle');
          p.setAttribute('class', 'puff');
          p.setAttribute('r', 3.2 + i);
          p.setAttribute('cx', 0); p.setAttribute('cy', 112);
          p.style.setProperty('--dx', (i - 1) * 6 + 'px');
          p.style.animationDelay = (0.25 + i * 0.28) + 's';
          smoke.appendChild(p);
        }
        ctx.later(function () { smoke.textContent = ''; }, 3200);
        S.candlesOut++;
        if (S.candlesOut >= S.candlesTotal) ctx.later(finale, 900);
      }

      candles.forEach(function (c) {
        ctx.on(c, 'click', function (e) { e.preventDefault(); snuff(c); });
        ctx.on(c, 'keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); snuff(c); } });
      });

      /* --- finale: only after EVERY candle is out --- */
      let done = false;
      async function finale() {
        if (done || S.candlesOut < S.candlesTotal) return;
        done = true;
        tap.classList.remove('in'); wish.classList.remove('in');
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
        App.audio.stopAll();
        App.SceneManager.go('dinner', { mode: 'black', duration: 1600, hold: 500 });
      });

      /* --- the entrance: empty table -> cake descends -> candles appear -> flames light --- */
      (async function () {
        await ctx.sleep(1700);
        drop.classList.add('land');
        sec.classList.add('landed');
        await ctx.sleep(2300);
        sec.classList.add('candles-in');
        await ctx.sleep(1500);
        sec.classList.add('lit');
        await ctx.sleep(900);
        wish.classList.add('in');
        await ctx.sleep(1500);
        tap.classList.add('in');
        ready = true;
      })();
    }
  });
})(window.App);
