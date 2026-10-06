/* SCENE 1 – Three bundles of glossy heart balloons rise in turn, then the title is revealed. */
(function (App) {
  const { CONFIG: C, u, FX } = App;
  const NS = 'http://www.w3.org/2000/svg';
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
  const easeOut = k => 1 - Math.pow(1 - k, 3);

  const HEART = 'M50 92C22 68 4 48 4 29C4 13 16 3 30 3C40 3 47 9 50 17C53 9 60 3 70 3C84 3 96 13 96 29C96 48 78 68 50 92Z';

  // three balloons per bundle: [body, light, pale]
  const BUNDLES = [
    { cols: ['#e07aa3', '#f6c3d6', '#f7f1ee'], at: 1.8, from: 'bottom', x: .15, y: 1.02, ph: 0 },
    { cols: ['#8458bd', '#bda3e6', '#f4eff8'], at: 5.4, from: 'right',  x: .87, y: 1.0,  ph: 2 },
    { cols: ['#c93a50', '#f2b293', '#ea96ae'], at: 9.0, from: 'left',   x: .40, y: 1.22, ph: 4 }
  ];
  // balloon layout inside a bundle (anchor / string gathering point is 0,0)
  const SPOTS = [
    { x: -58, y: -330, r: -9, s: 1.00, sp: 1.0, ph: 0 },
    { x:  54, y: -362, r:  8, s: .96,  sp: 1.2, ph: 1.7 },
    { x:  -2, y: -438, r: -2, s: 1.04, sp: .85, ph: 3.1 }
  ];

  function hexToRgb(h) { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
  function tint(h, to, k) {
    const a = hexToRgb(h), b = to === 'w' ? [255, 255, 255] : [0, 0, 0];
    return 'rgb(' + a.map((v, i) => Math.round(v + (b[i] - v) * k)).join(',') + ')';
  }
  function el(name, attrs, parent) {
    const e = document.createElementNS(NS, name);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  function makeBundle(cfg, idx) {
    const svg = el('svg', { viewBox: '-170 -560 340 600', class: 'bundle', 'aria-hidden': 'true' });
    const defs = el('defs', {}, svg);
    const blur = el('filter', { id: 'bl' + idx, x: '-30%', y: '-30%', width: '160%', height: '160%' }, defs);
    el('feGaussianBlur', { stdDeviation: '1.6' }, blur);

    const strings = [], balloons = [];
    cfg.cols.forEach(function (col, i) {
      const rg = el('radialGradient', { id: 'rg' + idx + i, cx: '34%', cy: '26%', r: '82%', fx: '30%', fy: '22%' }, defs);
      el('stop', { offset: '0', 'stop-color': tint(col, 'w', .38) }, rg);
      el('stop', { offset: '.38', 'stop-color': col }, rg);
      el('stop', { offset: '1', 'stop-color': tint(col, 'k', .34) }, rg);
      const lg = el('linearGradient', { id: 'lg' + idx + i, x1: '0', y1: '0', x2: '1', y2: '1' }, defs);
      el('stop', { offset: '0', 'stop-color': '#fff', 'stop-opacity': '0' }, lg);
      el('stop', { offset: '.6', 'stop-color': '#000', 'stop-opacity': '0' }, lg);
      el('stop', { offset: '1', 'stop-color': '#10060c', 'stop-opacity': '.34' }, lg);
    });

    cfg.cols.forEach(function () {
      strings.push(el('path', { fill: 'none', stroke: 'rgba(245,238,230,.62)', 'stroke-width': '1.1', 'stroke-linecap': 'round' }, svg));
    });
    el('path', { d: 'M-5 -3 Q0 -10 5 -3 Q0 2 -5 -3Z', fill: 'rgba(240,226,210,.85)' }, svg);
    el('path', { d: 'M0 -2 Q-8 14 -12 30 M0 -2 Q9 12 11 28', fill: 'none', stroke: 'rgba(240,226,210,.55)', 'stroke-width': '1.2', 'stroke-linecap': 'round' }, svg);

    cfg.cols.forEach(function (col, i) {
      const g = el('g', {}, svg);
      el('path', { d: HEART, fill: 'url(#rg' + idx + i + ')' }, g);
      el('path', { d: HEART, fill: 'url(#lg' + idx + i + ')' }, g);
      el('path', { d: HEART, fill: 'none', stroke: 'rgba(255,255,255,.22)', 'stroke-width': '1' }, g);
      el('ellipse', { cx: '27', cy: '21', rx: '9', ry: '5.4', transform: 'rotate(-32 27 21)', fill: 'rgba(255,255,255,.78)', filter: 'url(#bl' + idx + ')' }, g);
      el('ellipse', { cx: '72', cy: '24', rx: '4', ry: '2.4', transform: 'rotate(34 72 24)', fill: 'rgba(255,255,255,.34)', filter: 'url(#bl' + idx + ')' }, g);
      el('path', { d: 'M20 40 Q30 60 48 78', fill: 'none', stroke: 'rgba(255,255,255,.16)', 'stroke-width': '3', 'stroke-linecap': 'round', filter: 'url(#bl' + idx + ')' }, g);
      el('path', { d: 'M50 91 L44.5 98 Q50 96 55.5 98Z', fill: tint(col, 'k', .22) }, g);
      balloons.push(g);
    });
    return { svg: svg, strings: strings, balloons: balloons };
  }

  App.SceneManager.register('celebration', {
    init(sec, ctx) {
      const title = C.name.toUpperCase();
      sec.innerHTML =
        '<div class="cel-glow"></div>' +
        '<div class="bundles"></div>' +
        '<h1 class="cel-title"><span class="l1"></span><span class="l2"></span></h1>';

      const layer = sec.querySelector('.bundles');
      const fx = FX.field(sec, { motes: 30, confetti: false, rate: 0 });
      ctx.add(fx.destroy);

      const bundles = BUNDLES.map(function (cfg, i) {
        const b = makeBundle(cfg, i);
        layer.appendChild(b.svg);
        return Object.assign({ cfg: cfg }, b);
      });

      let W = 0, H = 0, S = 1;
      function size() {
        W = sec.clientWidth || window.innerWidth; H = sec.clientHeight || window.innerHeight;
        S = clamp(Math.min(W / 900, H / 820), .5, 1.15) * (W < 700 ? 1.05 : 1);
        bundles.forEach(function (b) { b.svg.style.width = 340 * S + 'px'; b.svg.style.height = 600 * S + 'px'; });
      }
      size();
      ctx.on(window, 'resize', size);

      const speed = App.reduced ? 1.6 : 1;
      const t0 = performance.now();
      let raf = 0, alive = true;

      function frame(now) {
        if (!alive) return;
        raf = requestAnimationFrame(frame);
        const t = (now - t0) / 1000 * speed;

        bundles.forEach(function (b) {
          const cfg = b.cfg;
          const k = seg(t, cfg.at, cfg.at + 7);
          if (k <= 0) { b.svg.style.opacity = 0; return; }
          const rise = easeOut(k), fade = clamp(k * 5, 0, 1);

          const restX = cfg.x * W, restY = cfg.y * H;
          const fromX = cfg.from === 'right' ? W * .24 : cfg.from === 'left' ? -W * .22 : 0;
          const fromY = H * (cfg.from === 'bottom' ? .95 : 1.05);
          const bob = Math.sin(t * .62 + cfg.ph) * 9 * S * easeOut(seg(k, .35, 1)) + Math.sin(t * .31 + cfg.ph * 2) * 5 * S;
          const ax = restX + fromX * (1 - rise) + Math.sin(t * .4 + cfg.ph) * 12 * S;
          const ay = restY + fromY * (1 - rise) + bob;
          const lean = Math.sin(t * .5 + cfg.ph) * 2.6 + (1 - rise) * (cfg.from === 'right' ? 5 : cfg.from === 'left' ? -5 : 0);

          b.svg.style.opacity = fade;
          b.svg.style.transformOrigin = (170 / 340 * 100) + '% ' + (560 / 600 * 100) + '%';
          b.svg.style.transform = 'translate(' + (ax - 170 * S) + 'px,' + (ay - 560 * S) + 'px) rotate(' + lean + 'deg)';

          SPOTS.forEach(function (sp, i) {
            const r = sp.r + Math.sin(t * .9 * sp.sp + sp.ph + cfg.ph) * 4.2 + Math.sin(t * 1.7 + sp.ph) * 1.1;
            const cx = sp.x + Math.sin(t * .7 * sp.sp + sp.ph) * 5, cy = sp.y + Math.sin(t * .55 + sp.ph * 1.3) * 5, s = sp.s;
            b.balloons[i].setAttribute('transform', 'translate(' + cx + ' ' + cy + ') rotate(' + r + ') scale(' + s + ') translate(-50 -48)');
            const rad = r * Math.PI / 180, kx = cx - Math.sin(rad) * 44 * s, ky = cy + Math.cos(rad) * 44 * s;
            const sway = Math.sin(t * 1.3 * sp.sp + sp.ph) * 14;
            b.strings[i].setAttribute('d', 'M' + kx.toFixed(1) + ' ' + (ky + 8 * s).toFixed(1) +
              ' Q' + (kx * .65 + sway).toFixed(1) + ' ' + (ky * .6).toFixed(1) + ' 0 -2');
          });
        });
      }
      raf = requestAnimationFrame(frame);
      ctx.add(function () { alive = false; cancelAnimationFrame(raf); });

      const t1 = sec.querySelector('.cel-title');
      (async function () {
        await ctx.sleep((BUNDLES[BUNDLES.length - 1].at + 3.8) * 1000 / speed);
        u.letters(t1.querySelector('.l1'), 'HAPPY BIRTHDAY', 70);
        u.letters(t1.querySelector('.l2'), title, 120);
        t1.classList.add('reveal');
        await ctx.sleep(900);
        App.audio.play('music');
        await ctx.sleep(3600 + C.timing.celebrationHold);
        App.audio.fadeOut('music', 2800);
        App.SceneManager.go('flower', { mode: 'black', duration: 1600, hold: 400 });
      })();
    }
  });
})(window.App);
