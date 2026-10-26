/* SCENE – the sunflower bouquet. A bright cyan backdrop and a title; sunflower heads pop up in a little cluster,
   rise into a bouquet while their stems grow, a pink bow ties them together, and grass springs up at the sides.
   (This replaces the old night-to-day garden for the sunflower path; garden.js is kept but no longer used here.) */
(function (App) {
  const { CONFIG: C, u, FX } = App;
  const NS = 'http://www.w3.org/2000/svg';

  // x, y = where the flower's head ends up; s = scale; d = entrance delay (s); order is back to front
  const HEADS = [
    { x: 222, y: 142, s: 0.78, d: 0.00 },
    { x: 148, y: 184, s: 0.72, d: 0.12 },
    { x: 276, y: 190, s: 0.70, d: 0.22 },
    { x: 112, y: 262, s: 0.66, d: 0.30 },
    { x: 292, y: 268, s: 0.68, d: 0.38 },
    { x: 204, y: 226, s: 0.86, d: 0.18 },
    { x: 160, y: 292, s: 0.74, d: 0.46 }
  ];
  const BASE = { x: 200, y: 440 };

  function bezier(p0, p1, p2, p3, t) {
    const m = 1 - t;
    return {
      x: m * m * m * p0.x + 3 * m * m * t * p1.x + 3 * m * t * t * p2.x + t * t * t * p3.x,
      y: m * m * m * p0.y + 3 * m * m * t * p1.y + 3 * m * t * t * p2.y + t * t * t * p3.y
    };
  }

  /** One sunflower head, 50 units in radius, reused with <use>. */
  function headDef() {
    let petals = '';
    for (let ring = 0; ring < 2; ring++) {
      const n = 16, len = ring ? 27 : 33, wid = ring ? 8.2 : 9.2, dist = ring ? 27 : 31;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * 360 + (ring ? 360 / n / 2 : 0);
        petals += '<ellipse cx="0" cy="' + (-dist) + '" rx="' + wid + '" ry="' + len / 1.55 + '" transform="rotate(' + a.toFixed(1) + ')" fill="' + (ring ? '#ffbf1f' : '#ffd23f') + '"/>';
      }
    }
    let seeds = '';
    for (let i = 1; i < 46; i++) {
      const r = Math.sqrt(i / 46) * 15.5, a = i * 137.5 * Math.PI / 180;
      seeds += '<circle cx="' + (Math.cos(a) * r).toFixed(1) + '" cy="' + (Math.sin(a) * r).toFixed(1) + '" r="1.5" fill="#b8641f" opacity=".75"/>';
    }
    return '<g id="sf-head">' + petals +
      '<circle r="19" fill="url(#sf-core)"/>' + seeds +
      '<circle r="19" fill="none" stroke="#2f1405" stroke-opacity=".55" stroke-width="1.6"/>' +
      '<path d="M-14 -9A17 17 0 0 1 4 -17" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="2" stroke-linecap="round"/></g>';
  }

  function bouquetSVG() {
    let stems = '', leaves = '', heads = '';
    HEADS.forEach(function (h, i) {
      // each stem is a cubic curve from the bow to just under its flower
      const p0 = BASE, p3 = { x: h.x, y: h.y + 14 * h.s };
      const p1 = { x: BASE.x + (h.x - BASE.x) * 0.1, y: BASE.y - 90 };
      const p2 = { x: h.x - (h.x - BASE.x) * 0.15, y: h.y + 120 };
      stems += '<path class="stem" pathLength="1" style="--d:' + (h.d * 0.8).toFixed(2) + 's" d="M' + p0.x + ' ' + p0.y + 'C' + p1.x + ' ' + p1.y + ' ' + p2.x + ' ' + p2.y + ' ' + p3.x + ' ' + p3.y + '"/>';
      [[0.42, -1], [0.62, 1]].forEach(function (lf, j) {
        const pt = bezier(p0, p1, p2, p3, lf[0]);
        const side = (h.x < BASE.x ? -1 : 1) * lf[1] * (j ? -1 : 1);
        const ang = side > 0 ? -28 : 208;
        leaves += '<g transform="translate(' + pt.x.toFixed(1) + ' ' + pt.y.toFixed(1) + ') rotate(' + ang + ')"><path class="leaf" style="--d:' + (0.2 * i + j * 0.15).toFixed(2) + 's" d="M0 0C9-9 30-10 42 0C30 10 9 9 0 0Z"/></g>';
      });
      heads += '<g class="sf" style="--tx:' + h.x + 'px;--ty:' + h.y + 'px;--s:' + h.s + ';--cx:' + (BASE.x + (i - 3) * 14) + 'px;--cy:' + (350 + (i % 3) * 16) + 'px;--d:' + h.d + 's">' +
        '<g class="sway" style="--sd:' + (i * 0.4) + 's"><use href="#sf-head"/></g></g>';
    });

    let grass = '';
    [[78, -1, 70], [100, -1, 105], [124, -1, 80], [276, 1, 80], [300, 1, 108], [324, 1, 72], [56, -1, 52], [346, 1, 56]].forEach(function (g, i) {
      const x = g[0], dir = g[1], hgt = g[2];
      grass += '<path class="blade" style="--d:' + (i * 0.1).toFixed(2) + 's" d="M' + x + ' 500Q' + (x + dir * 8) + ' ' + (500 - hgt * 0.55) + ' ' + (x + dir * 22) + ' ' + (500 - hgt) + 'Q' + (x + dir * 4) + ' ' + (500 - hgt * 0.5) + ' ' + (x + 4) + ' 500Z"/>';
    });

    const bow =
      '<g class="bow">' +
        '<path d="M200 440C150 400 118 438 148 470C168 488 190 458 200 440Z" fill="#f9cfe1"/><path d="M200 440C250 400 282 438 252 470C232 488 210 458 200 440Z" fill="#f9cfe1"/>' +
        '<path d="M196 444C168 428 140 446 156 466C170 478 186 458 196 444Z" fill="#f0a9c6"/><path d="M204 444C232 428 260 446 244 466C230 478 214 458 204 444Z" fill="#f0a9c6"/>' +
        '<path d="M194 448C180 478 166 492 150 512L172 508C186 494 196 474 204 452Z" fill="#f6bdd5"/><path d="M206 448C220 478 234 492 250 512L228 508C214 494 204 474 196 452Z" fill="#f6bdd5"/>' +
        '<ellipse cx="200" cy="444" rx="14" ry="11" fill="#f4b3cc"/><ellipse cx="197" cy="441" rx="6" ry="4" fill="#fff" opacity=".45"/>' +
      '</g>';

    return '<svg class="bq-svg" viewBox="0 0 400 520" role="img" aria-label="A bouquet of sunflowers tied with a pink bow">' +
      '<defs><radialGradient id="sf-core" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#8a4a1a"/><stop offset=".6" stop-color="#4a2209"/><stop offset="1" stop-color="#2a1005"/></radialGradient>' + headDef() + '</defs>' +
      '<g class="grass">' + grass + '</g>' +
      '<g class="stems">' + stems + '</g>' + '<g class="leaves">' + leaves + '</g>' +
      '<g class="heads">' + heads + '</g>' + bow + '</svg>';
  }

  App.SceneManager.register('bouquet', {
    init(sec, ctx) {
      sec.innerHTML = '<div class="bq-glow"></div><h1 class="bq-title fade-up"></h1><div class="bq-art">' + bouquetSVG() + '</div>';
      const title = sec.querySelector('.bq-title');
      title.textContent = C.text.bouquetTitle;

      const fx = FX.field(sec, { motes: 46, rgb: '255,222,150', size: 0.6 });
      ctx.add(fx.destroy);

      (async function () {
        await ctx.sleep(500);
        title.classList.add('in');
        await ctx.sleep(900);
        sec.classList.add('cluster');            // the flower heads pop up together in a little bunch …
        await ctx.sleep(1500);
        sec.classList.add('bloom');              // … then rise into a bouquet while the stems grow
        await ctx.sleep(2200);
        sec.classList.add('leafy');
        await ctx.sleep(900);
        sec.classList.add('tied');               // a pink bow ties them together
        await ctx.sleep(900);
        sec.classList.add('grassy');             // and grass springs up at the sides
        await ctx.sleep(App.reduced ? 2500 : 4200);
        (function next() {
          App.SceneManager.go('photo', { mode: 'black', duration: 1200, hold: 200 }).then(function (ok) {
            if (!ok) ctx.later(next, 150);
          });
        })();
      })();
    }
  });
})(window.App = window.App || {});
