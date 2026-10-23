/* Procedural SVG flowers. Each plant shares one structure so CSS can animate it:
   .f-stem (grows) -> .f-leaf (unfold) -> .f-head (> .f-petals / .f-core bloom).
   viewBox is always 0 0 100 200 with the flower head centred at (50,46). */
(function (App) {
  const f = n => Math.round(n * 100) / 100;
  const GREENS = [[132, 36, 30], [128, 40, 34], [140, 34, 28], [120, 38, 36]];
  const green = (rng, dl) => { const g = GREENS[Math.floor(rng() * GREENS.length)]; return 'hsl(' + g[0] + ' ' + g[1] + '% ' + (g[2] + (dl || 0)) + '%)'; };

  /* ---- shared gradients (one hidden <svg> so every rose / leaf can reference them) ---- */
  const ROSES = [[352, 74, 36], [346, 66, 56], [350, 58, 68], [356, 78, 44], [348, 64, 49]];
  function ensureDefs() {
    if (document.getElementById('flower-defs') || !document.body) return;
    const hsl = (h, sat, l) => 'hsl(' + h + ' ' + Math.max(0, Math.min(100, sat)) + '% ' + Math.max(4, Math.min(96, l)) + '%)';
    let d = '';
    ROSES.forEach(function (c, k) {
      [4, 0, -9].forEach(function (dl, j) {
        const l = c[2] + dl;
        d += '<radialGradient id="rz' + k + j + '" cx=".5" cy=".95" r="1" fx=".5" fy=".98">' +
          '<stop offset="0" stop-color="' + hsl(c[0], c[1] + 6, l - 18) + '"/>' +
          '<stop offset=".4" stop-color="' + hsl(c[0], c[1], l - 4) + '"/>' +
          '<stop offset=".8" stop-color="' + hsl(c[0], c[1] - 4, l + 5) + '"/>' +
          '<stop offset="1" stop-color="' + hsl(c[0], c[1] - 8, l + 9) + '"/></radialGradient>';
      });
      d += '<radialGradient id="rzc' + k + '" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="' + hsl(c[0], c[1], c[2] - 6) + '"/><stop offset="1" stop-color="' + hsl(c[0], c[1] + 8, c[2] - 28) + '"/></radialGradient>';
    });
    document.body.insertAdjacentHTML('afterbegin', '<svg id="flower-defs" width="0" height="0" style="position:absolute;width:0;height:0" aria-hidden="true" focusable="false"><defs>' + d + '</defs></svg>');
  }

  /** Leaf outline; serrated + pointed for roses. */
  function leafPath(serr) {
    if (!serr) return 'M0 0C12-15 32-15 46-3C32 9 12 11 0 0Z';
    const N = 14, up = [], lo = [];
    for (let i = 1; i <= N; i++) {
      const t = i / N, w = Math.sin(Math.PI * Math.pow(t, 0.8)), tooth = (i % 2 ? 0 : 1.7) * w;
      up.push((46 * t).toFixed(1) + ' ' + (-3 - 12.5 * w - tooth).toFixed(1));
      lo.push((46 * t).toFixed(1) + ' ' + (-3 + 11.5 * w + tooth).toFixed(1));
    }
    return 'M0 0L' + up.join('L') + 'L' + lo.reverse().slice(1).join('L') + 'Z';
  }

  function leaf(x, y, ang, len, flip, delay, col, vein, serr) {
    const s = len / 46;
    return '<g transform="translate(' + f(x) + ' ' + y + ') rotate(' + f(ang * flip) + ') scale(' + f(flip * s) + ' ' + f(s) + ')">' +
      '<g class="f-leaf" style="--ld:' + delay + 's">' +
      '<path d="' + leafPath(serr) + '" fill="' + col + '"/>' +
      '<path d="M0 0C12-12 30-13 45-3C30-6 12-4 0 0Z" fill="#fff" opacity=".13"/>' +
      '<path d="M0 0C12 8 30 9 45-3C30 3 12 3 0 0Z" fill="#000" opacity=".12"/>' +
      '<path d="M2 0C16-3 30-4 42-3" stroke="' + vein + '" stroke-width="1.2" fill="none" opacity=".55"/>' +
      '<path d="M12-1.4L19-8M20-2L28-9M28-2.6L35-8M12-1L18 5M20-1.8L27 5M28-2.4L34 3" stroke="' + vein + '" stroke-width=".6" fill="none" opacity=".35"/>' +
      '</g></g>';
  }

  /* ---------- heads ---------- */
  function sunHead(rng) {
    const n = 13 + Math.floor(rng() * 4), hue = 42 + rng() * 8, l = 50 + rng() * 6;
    const back = 'hsl(' + f(hue - 4) + ' 95% ' + f(l - 8) + '%)';
    const front = 'hsl(' + f(hue) + ' 98% ' + f(l + 4) + '%)';
    const edge = 'hsl(' + f(hue - 8) + ' 80% ' + f(l - 20) + '%)';
    let p = '', seeds = '';
    for (let i = 0; i < n; i++) {
      p += '<g transform="rotate(' + f(i * 360 / n) + ' 50 46)"><path d="M50 30C57 21 56 9 50 0C44 9 43 21 50 30Z" fill="' + back + '" stroke="' + edge + '" stroke-width=".6"/></g>';
    }
    for (let i = 0; i < n; i++) {
      p += '<g transform="rotate(' + f(i * 360 / n + 180 / n) + ' 50 46)"><path d="M50 29C55 22 54 13 50 6C46 13 45 22 50 29Z" fill="' + front + '"/></g>';
    }
    for (let i = 0; i < 30; i++) {
      const r = Math.sqrt((i + 0.5) / 30) * 13, a = i * 2.39996;
      seeds += '<circle cx="' + f(50 + r * Math.cos(a)) + '" cy="' + f(46 + r * Math.sin(a)) + '" r="1.25" fill="#d79b45" opacity=".7"/>';
    }
    return '<g class="f-petals">' + p + '</g><g class="f-core"><circle cx="50" cy="46" r="17" fill="#6a3f17"/><circle cx="50" cy="46" r="14.5" fill="#46280d"/>' + seeds + '</g>';
  }

  /* A rosette seen slightly from above: ruffled, scalloped petals with depth shading, a tight spiral heart. */
  function roseHead(rng) {
    const k = Math.floor(rng() * ROSES.length), c = ROSES[k];
    const edge = 'hsl(' + c[0] + ' ' + c[1] + '% ' + Math.max(10, c[2] - 26) + '%)';
    const cup = 'M50 47C27 45 20 25 32 14C38 9 44 13 50 16C56 13 62 9 68 14C80 25 73 45 50 47Z';
    const rim = 'M33 15C38 10 44 14 50 17C56 14 62 10 67 15';
    const crease = 'M50 46C47 36 45 27 43 19M50 46C53 36 55 27 57 19';
    function petal(layer, i, n, off, scale, jitter) {
      const a = i * 360 / n + off + (rng() - 0.5) * jitter, sc = scale * (0.92 + rng() * 0.16);
      return '<g transform="rotate(' + f(a) + ' 50 46)"><g transform="translate(50 46) scale(' + f(sc) + ') translate(-50 -46)">' +
        '<path d="' + cup + '" fill="url(#rz' + k + layer + ')" stroke="' + edge + '" stroke-width="' + f(0.7 / sc) + '" stroke-linejoin="round"/>' +
        '<path d="' + crease + '" fill="none" stroke="' + edge + '" stroke-width=".8" opacity=".38"/>' +
        '<path d="' + rim + '" fill="none" stroke="#fff" stroke-width="1.3" stroke-linecap="round" opacity="' + (layer === 0 ? 0.16 : 0.22) + '"/>' +
        '</g></g>';
    }
    let p = '';
    const nOut = 5 + (rng() > 0.6 ? 1 : 0);
    for (let i = 0; i < nOut; i++) p += petal(0, i, nOut, 0, 0.86, 14);
    for (let i = 0; i < 5; i++) p += petal(1, i, 5, 36, 0.64, 18);
    for (let i = 0; i < 4; i++) p += petal(2, i, 4, 20, 0.44, 20);
    const heart =
      '<circle cx="50" cy="46" r="6.2" fill="url(#rzc' + k + ')" stroke="' + edge + '" stroke-width=".6"/>' +
      '<path d="M46 46a4 4 0 1 1 4 4a2.6 2.6 0 1 1-2.6-2.6a1.4 1.4 0 1 1 1.4 1.4" fill="none" stroke="' + edge + '" stroke-width=".9" stroke-linecap="round"/>' +
      '<path d="M45 42C47 39.5 50 39 52.5 40" fill="none" stroke="#fff" stroke-width="1" stroke-linecap="round" opacity=".45"/>';
    return '<ellipse cx="50" cy="66" rx="9" ry="4.2" fill="#2f6a3e"/><path d="M42 64L50 74L58 64Z" fill="#2c5e38"/>' +
      '<g class="f-petals">' + p + '</g><g class="f-core">' + heart + '</g>';
  }

  function daisyHead() {
    let p = '';
    for (let i = 0; i < 12; i++) p += '<g transform="rotate(' + (i * 30) + ' 50 46)"><ellipse cx="50" cy="31" rx="4.4" ry="11" fill="#FAF7F2" stroke="#e4dccd" stroke-width=".5"/></g>';
    return '<g class="f-petals">' + p + '</g><g class="f-core"><circle cx="50" cy="46" r="6.5" fill="#F4C76B"/><circle cx="50" cy="46" r="3" fill="#e9a94a"/></g>';
  }

  function tulipHead(rng) {
    const hue = [338, 350, 14][Math.floor(rng() * 3)];
    const a = 'hsl(' + hue + ' 72% 62%)', b = 'hsl(' + hue + ' 70% 74%)', d = 'hsl(' + hue + ' 60% 42%)';
    return '<g class="f-petals">' +
      '<path d="M34 28C34 52 43 64 50 64C57 64 66 52 66 28C61 37 56 30 50 38C44 30 39 37 34 28Z" fill="' + a + '" stroke="' + d + '" stroke-width=".8"/>' +
      '<path d="M50 38C46 46 46 56 50 64C54 56 54 46 50 38Z" fill="' + b + '"/></g>';
  }

  function lavenderHead(rng) {
    const hue = 262 + rng() * 14;
    let p = '';
    for (let i = 0; i < 13; i++) {
      const y = 60 - i * 4.2, s = 1 - i * 0.035;
      p += '<ellipse cx="' + f(46 + (i % 2 ? 1 : 0)) + '" cy="' + f(y) + '" rx="' + f(3.6 * s) + '" ry="2.6" fill="hsl(' + f(hue) + ' 48% ' + (60 + (i % 3) * 5) + '%)"/>' +
           '<ellipse cx="' + f(54 - (i % 2 ? 1 : 0)) + '" cy="' + f(y - 2) + '" rx="' + f(3.6 * s) + '" ry="2.6" fill="hsl(' + f(hue) + ' 52% ' + (66 - (i % 3) * 4) + '%)"/>';
    }
    return '<g class="f-petals">' + p + '</g>';
  }

  const HEADS = { sunflower: sunHead, rose: roseHead, daisy: daisyHead, tulip: tulipHead, lavender: lavenderHead };
  const LEAF = { sunflower: 54, rose: 42, daisy: 34, tulip: 50, lavender: 28 };

  /** Inner SVG markup of one plant (no <svg> wrapper) – also used to build the dinner-table vase. */
  function inner(kind, rng) {
    const bend = (rng() - 0.5) * 18;
    const tilt = (rng() - 0.5) * (kind === 'lavender' ? 8 : 22);
    const sw = kind === 'sunflower' ? 5.2 + rng() * 1.4 : 3.2 + rng() * 1.4;
    const col = kind === 'lavender' ? 'hsl(110 22% 38%)' : green(rng, -4);
    const vein = 'rgba(10,40,20,.8)';
    const L = LEAF[kind] || 40;
    let thorns = '';
    if (kind === 'rose') {
      [0.18, 0.32, 0.46, 0.6, 0.74].forEach(function (t, i) {
        const m = 1 - t, bx = m*m*m*50 + 3*m*m*t*(50 + bend) + 3*m*t*t*(50 - bend) + t*t*t*50, by = m*m*m*200 + 3*m*m*t*165 + 3*m*t*t*118 + t*t*t*54;
        const sd = i % 2 ? 1 : -1;
        thorns += '<path d="M' + f(bx) + ' ' + f(by - 2) + 'l' + (sd * 5.5) + ' -3.5l' + (-sd * 0.5) + ' 5Z" fill="#6b2d34"/>';
      });
    }
    let s = '<g class="f-stem"><path d="M50 200C' + f(50 + bend) + ' 165 ' + f(50 - bend) + ' 118 50 54" fill="none" stroke="' + col + '" stroke-width="' + f(sw) + '" stroke-linecap="round"/>' + thorns + '</g>';
    const serr = kind === 'rose';
    s += leaf(50 + bend * 0.3, 152, -36, L * (0.9 + rng() * 0.2), 1, 0, green(rng), vein, serr);
    s += leaf(50 + bend * 0.15, 126, -42, L * (0.75 + rng() * 0.2), -1, 0.18, green(rng), vein, serr);
    if (kind !== 'lavender' && rng() > 0.35) s += leaf(50 + bend * 0.4, 178, -26, L * (0.7 + rng() * 0.2), rng() > 0.5 ? 1 : -1, 0.34, green(rng, -2), vein, serr);
    s += '<g transform="rotate(' + f(tilt) + ' 50 46)"><g class="f-head">' + HEADS[kind](rng) + '</g></g>';
    return s;
  }

  function render(kind, rng) {
    ensureDefs();
    return '<svg class="flower-svg" viewBox="0 0 100 200" aria-hidden="true" focusable="false">' + inner(kind, rng) + '</svg>';
  }

  ensureDefs();
  App.Flowers = { render: render, inner: inner, kinds: Object.keys(HEADS) };
})(window.App = window.App || {});
