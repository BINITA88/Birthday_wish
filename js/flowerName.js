/* A name written in seeds, one separate soil plot per letter. A gardener walks along and waters the plots one
   after another: the seeds sprout, grow into little plants and bloom until every letter is filled with flowers.
   Then the plots glide to the centre, join up, and the name is shown. */
(function (App) {
  const u = App.u;
  const FX = App.FX;

  const PETALS = ['#f06aa8', '#f7a8d0', '#f6a77a', '#e0303a', '#f7c948', '#8f74d6', '#fff6ec', '#d63384', '#ff7f6b', '#b79ae6'];
  const CENTERS = ['#f7c948', '#ffb02e', '#fff2a8'];
  const LEAF = ['#3f7a45', '#2f6a3a', '#56934f', '#4d9a52'];
  const STEM = ['#3f8f4a', '#4d9a52', '#397d43'];
  const LEAF_AT = [0.3, 0.55, 0.8];          // how far up the stem each leaf sits (as the stem grows)

  /* ---------- timeline (ms, before the reduced-motion scale) ---------- */
  const ENTER = 800;       // the gardener walks in
  const FALL = 350;        // water takes this long to fall from the can onto the soil
  const GERM = 200;        // pause before a watered seed cracks open
  const STEM_MS = 850;     // a shoot grows to its full height
  const CONVERGE = 1800;   // the finished letters glide to the centre
  const LEAD = 11;         // water drifts forward a little while it falls
  const GM = 18;           // room above a plot for its grass

  const easeOutBack = function (t) { const c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
  const easeOutCubic = function (t) { return 1 - Math.pow(1 - t, 3); };
  const easeInOutCubic = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  const clamp01 = function (t) { return t < 0 ? 0 : t > 1 ? 1 : t; };
  const range = function (a, b) { const r = []; for (let i = a; i < b; i++) r.push(i); return r; };
  const font = function (px) { return '800 ' + px + 'px Jost, "Segoe UI", Arial, sans-serif'; };

  /* ---------- colour helpers ---------- */
  function rgb(hex) { const n = parseInt(hex.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
  function mix(hex, to, a) {
    const c = rgb(hex), t = to === 'w' ? [255, 255, 255] : to === 'k' ? [20, 8, 12] : rgb(to);
    return 'rgb(' + Math.round(c[0] + (t[0] - c[0]) * a) + ',' + Math.round(c[1] + (t[1] - c[1]) * a) + ',' + Math.round(c[2] + (t[2] - c[2]) * a) + ')';
  }

  /* ---------- pre-rendered sprites (shaded petals, buds, leaves, seeds) ---------- */
  const S = 160, R = S * 0.46;
  const sprites = {};

  function petalPath(g, L, w) {
    g.beginPath();
    g.moveTo(0, 0);
    g.bezierCurveTo(L * 0.22, -w * 1.05, L * 0.86, -w * 0.95, L, -w * 0.12);
    g.quadraticCurveTo(L * 1.02, 0, L, w * 0.12);
    g.bezierCurveTo(L * 0.86, w * 0.95, L * 0.22, w * 1.05, 0, 0);
    g.closePath();
  }

  function layer(g, col, n, L, w, rot, shadow) {
    for (let i = 0; i < n; i++) {
      g.save();
      g.rotate(rot + (i / n) * 6.2832);
      const gr = g.createLinearGradient(0, 0, L, 0);
      gr.addColorStop(0, mix(col, 'k', 0.38));
      gr.addColorStop(0.35, mix(col, 'k', 0.08));
      gr.addColorStop(0.8, col);
      gr.addColorStop(1, mix(col, 'w', 0.4));
      if (shadow) { g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = S * 0.03; g.shadowOffsetY = S * 0.012; }
      g.fillStyle = gr;
      petalPath(g, L, w);
      g.fill();
      g.shadowColor = 'transparent';
      g.strokeStyle = 'rgba(255,255,255,.22)'; g.lineWidth = S * 0.006;
      g.beginPath(); g.moveTo(L * 0.12, 0); g.lineTo(L * 0.82, 0); g.stroke();
      g.restore();
    }
  }

  function openSprite(col, mid, n) {
    const key = 'o' + col + mid + n;
    if (sprites[key]) return sprites[key];
    const c = document.createElement('canvas'); c.width = c.height = S;
    const g = c.getContext('2d');
    g.translate(S / 2, S / 2);
    const wide = n > 6 ? 0.27 : 0.42;
    layer(g, col, n, R, R * wide, 0.2, true);
    layer(g, mix(col, 'w', 0.18), n, R * 0.66, R * wide * 0.8, 0.2 + 3.1416 / n, false);
    const cg = g.createRadialGradient(-R * 0.05, -R * 0.05, 0, 0, 0, R * 0.26);
    cg.addColorStop(0, mix(mid, 'w', 0.5)); cg.addColorStop(0.6, mid); cg.addColorStop(1, mix(mid, 'k', 0.45));
    g.fillStyle = cg;
    g.beginPath(); g.arc(0, 0, R * 0.24, 0, 6.2832); g.fill();
    g.fillStyle = mix(mid, 'k', 0.55);
    for (let i = 0; i < 9; i++) {
      const a = i * 0.7 + 0.3, rr = R * (0.08 + (i % 3) * 0.045);
      g.beginPath(); g.arc(Math.cos(a) * rr, Math.sin(a) * rr, R * 0.018, 0, 6.2832); g.fill();
    }
    return (sprites[key] = c);
  }

  function budSprite(col) {
    const key = 'b' + col;
    if (sprites[key]) return sprites[key];
    const c = document.createElement('canvas'); c.width = c.height = S;
    const g = c.getContext('2d');
    g.translate(S / 2, S / 2);
    layer(g, col, 6, R * 0.55, R * 0.16, 0, true);
    g.fillStyle = '#4c8f52';
    for (let i = 0; i < 5; i++) {
      g.save(); g.rotate(i * 1.2566 + 0.3);
      g.beginPath(); g.ellipse(R * 0.2, 0, R * 0.22, R * 0.07, 0, 0, 6.2832); g.fill();
      g.restore();
    }
    return (sprites[key] = c);
  }

  /** A single leaf pointing along +x, base at the left edge. */
  function leafSprite(col) {
    const key = 'l' + col;
    if (sprites[key]) return sprites[key];
    const c = document.createElement('canvas'); c.width = 64; c.height = 32;
    const g = c.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 64, 0);
    gr.addColorStop(0, mix(col, 'k', 0.25)); gr.addColorStop(1, mix(col, 'w', 0.35));
    g.fillStyle = gr;
    g.beginPath();
    g.moveTo(1, 16); g.bezierCurveTo(14, 1, 44, 2, 63, 16); g.bezierCurveTo(44, 30, 14, 31, 1, 16);
    g.closePath(); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.28)'; g.lineWidth = 1.2;
    g.beginPath(); g.moveTo(3, 16); g.lineTo(58, 16); g.stroke();
    return (sprites[key] = c);
  }

  /** A seed with its little shadow, about 27px long at 1x. */
  function seedSprite() {
    if (sprites.seed) return sprites.seed;
    const c = document.createElement('canvas'); c.width = 48; c.height = 34;
    const g = c.getContext('2d');
    g.translate(24, 16);
    const s = 9;
    g.fillStyle = 'rgba(0,0,0,.35)';
    g.beginPath(); g.ellipse(s * 0.2, s * 0.8, s * 2, s * 0.7, 0, 0, 6.283); g.fill();
    g.rotate(-0.25);
    const gr = g.createLinearGradient(-s * 1.4, -s, s * 1.4, s);
    gr.addColorStop(0, '#f1d9a0'); gr.addColorStop(0.55, '#b98a4a'); gr.addColorStop(1, '#6b4624');
    g.fillStyle = gr;
    g.beginPath();
    g.moveTo(-s * 1.5, 0); g.bezierCurveTo(-s * 0.6, -s * 1.2, s * 0.8, -s * 1.1, s * 1.5, 0);
    g.bezierCurveTo(s * 0.8, s * 1.1, -s * 0.6, s * 1.2, -s * 1.5, 0); g.fill();
    g.strokeStyle = 'rgba(70,40,15,.45)'; g.lineWidth = Math.max(.6, s * 0.12);
    g.beginPath(); g.moveTo(-s * 1.1, 0); g.lineTo(s * 1.2, 0); g.stroke();
    return (sprites.seed = c);
  }

  /** Dark, damp soil where water has landed. */
  function wetSprite() {
    if (sprites.wet) return sprites.wet;
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d');
    const rg = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    rg.addColorStop(0, 'rgba(0,0,0,.5)'); rg.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = rg; g.fillRect(0, 0, 64, 64);
    return (sprites.wet = c);
  }

  /* ---------- a soil plot with variable corner radii, so neighbouring plots can fuse into one bed ---------- */
  function patchPath(g, x0, y0, x1, y1, rl, rr) {
    g.beginPath();
    g.moveTo(x0 + rl, y0); g.lineTo(x1 - rr, y0);
    g.quadraticCurveTo(x1, y0, x1, y0 + rr);
    g.lineTo(x1, y1 - rr); g.quadraticCurveTo(x1, y1, x1 - rr, y1);
    g.lineTo(x0 + rl, y1); g.quadraticCurveTo(x0, y1, x0, y1 - rl);
    g.lineTo(x0, y0 + rl); g.quadraticCurveTo(x0, y0, x0 + rl, y0);
    g.closePath();
  }

  /** Soft rim light. The side edges fade out once a plot has another plot touching it. */
  function patchRim(g, x0, y0, x1, y1, rl, rr, aL, aR) {
    g.lineWidth = 1.2;
    g.strokeStyle = 'rgba(255,214,160,.16)';
    g.beginPath(); g.moveTo(x0 + rl, y0); g.lineTo(x1 - rr, y0); g.moveTo(x0 + rl, y1); g.lineTo(x1 - rr, y1); g.stroke();
    if (aL > 0.02) {
      g.strokeStyle = 'rgba(255,214,160,' + (0.16 * aL) + ')';
      g.beginPath(); g.moveTo(x0 + rl, y0); g.quadraticCurveTo(x0, y0, x0, y0 + rl); g.lineTo(x0, y1 - rl); g.quadraticCurveTo(x0, y1, x0 + rl, y1); g.stroke();
    }
    if (aR > 0.02) {
      g.strokeStyle = 'rgba(255,214,160,' + (0.16 * aR) + ')';
      g.beginPath(); g.moveTo(x1 - rr, y0); g.quadraticCurveTo(x1, y0, x1, y0 + rr); g.lineTo(x1, y1 - rr); g.quadraticCurveTo(x1, y1, x1 - rr, y1); g.stroke();
    }
  }

  /** Where the spout of the watering can ends up, relative to the gardener's feet, for a given tilt (0..1). */
  function canTip(h, tilt) {
    const th = 0.2 + tilt * 0.45, c = Math.cos(th), s = Math.sin(th);
    return { x: h * (0.32 + 0.285 * c - 0.125 * s), y: h * (-0.64 + 0.285 * s + 0.125 * c) };
  }

  function star(g, x, y, s) {
    g.beginPath();
    g.moveTo(x, y - s);
    g.quadraticCurveTo(x + s * 0.12, y - s * 0.12, x + s, y);
    g.quadraticCurveTo(x + s * 0.12, y + s * 0.12, x, y + s);
    g.quadraticCurveTo(x - s * 0.12, y + s * 0.12, x - s, y);
    g.quadraticCurveTo(x - s * 0.12, y - s * 0.12, x, y - s);
    g.fill();
  }

  /**
   * FX.flowerName(parent, text, opts) -> { done: Promise, destroy() }
   * 1) every letter gets its own plot, scattered with seeds in the shape of that letter,
   * 2) a gardener waters the plots one by one; the seeds sprout, grow into plants and bloom,
   * 3) once every letter is in flower the plots glide together at the centre and the name is shown.
   * `done` resolves shortly after the letters have settled. opts.onConverge fires as they start to move.
   */
  FX.flowerName = function (parent, text, opts) {
    const o = Object.assign({ maxWidth: 1400, bloomMs: 1100, onConverge: null }, opts || {});
    text = String(text).toUpperCase();
    const ts = App.reduced ? 0.4 : 1;                 // timeline scale
    const T = function (ms) { return ms * ts; };

    const canvas = document.createElement('canvas');
    canvas.className = 'flower-name';
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', text);
    parent.appendChild(canvas);

    let alive = true, raf = 0, finish;
    const done = new Promise(function (r) { finish = r; });
    const letters = [];
    const plan = [];                                  // the gardener's route: walking and pouring segments
    const drops = [], ripples = [], twinkles = [];
    let W = 0, H = 0, PH = 0, gh = 0, rr0 = 0, tc = 0, tA = 0, doneAt = 0;

    function build() {
      if (!alive) return;
      W = Math.max(220, Math.min(o.maxWidth, (parent.clientWidth || window.innerWidth) - 8));
      const chars = Array.from(text), n = chars.length;
      const m = document.createElement('canvas').getContext('2d');
      m.font = font(100);
      const capRatio = (m.measureText('H').actualBoundingBoxAscent || 72) / 100;
      const gapRatio = 0.1;
      const widths = chars.map(function (ch) { return m.measureText(ch).width; });

      // Wide screens: one row of plots. Narrow screens: two rows, so each letter can still stand well apart.
      const narrow = W < 700 && n > 3;
      const split = Math.ceil(n / 2);
      const rows = (narrow ? [range(0, split), range(split, n)] : [range(0, n)]).filter(function (r) { return r.length; });
      const Wn = narrow ? W * 0.88 : Math.min(780, W * 0.56);          // width of the finished name
      const fs = 100 * Wn / (widths.reduce(function (a, b) { return a + b; }, 0) + gapRatio * 100 * (n - 1));
      const capH = fs * capRatio, gapF = gapRatio * fs;
      const lw = widths.map(function (w) { return w * fs / 100; });

      const head = Math.round(capH * 1.15);                              // room for the gardener above a plot
      gh = head * 0.9;
      const d = Math.max(7, capH / 8.5);                                 // flower spacing
      const textH = Math.round(capH * 1.55);
      PH = textH + 12;
      const rowH = head + PH;
      H = rowH * rows.length;
      rr0 = Math.min(22, capH * 0.25);
      const padS = Math.max(7, capH * 0.17);                             // soil around a lone letter
      const outerPad = Wn * 0.043;                                       // soil around the finished name
      padStart = padS;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);

      /* ----- plots: where each letter starts out, and where it ends up ----- */
      chars.forEach(function (ch, j) {
        const Lt = { idx: j, ch: ch, lw: lw[j], first: j === 0, last: j === n - 1, flowers: [], g: null, pa: 0 };
        Lt.padEL = Lt.first ? outerPad : gapF / 2;
        Lt.padER = Lt.last ? outerPad : gapF / 2;
        Lt.tileW = Math.ceil(lw[j] + 2 * Math.max(padS, outerPad) + 16);
        Lt.tile = makeTile(Lt.tileW, dpr);
        letters.push(Lt);
      });

      let gap = Infinity;
      rows.forEach(function (row) {
        if (row.length < 2) return;
        const tot = row.reduce(function (a, j) { return a + lw[j] + 2 * padS; }, 0);
        gap = Math.min(gap, (W - 12 - tot) / (row.length - 1));
      });
      gap = Math.max(capH * 0.3, Math.min(gap, capH * 1.4));
      rows.forEach(function (row, ri) {
        const tot = row.reduce(function (a, j) { return a + lw[j] + 2 * padS; }, 0) + gap * (row.length - 1);
        let x = (W - tot) / 2;
        row.forEach(function (j) {
          letters[j].homeCx = x + padS + lw[j] / 2;
          letters[j].homeTop = ri * rowH + head;
          letters[j].row = ri;
          x += lw[j] + 2 * padS + gap;
        });
      });
      const finTop = rows.length === 1 ? head : (H - PH) / 2;
      let fx = (W - Wn) / 2;
      letters.forEach(function (Lt, j) { Lt.finCx = fx + lw[j] / 2; Lt.finTop = finTop; fx += lw[j] + gapF; });

      /* ----- the seeds: sample each letter's shape on a staggered grid ----- */
      const rMax = d * 0.82, shMax = d * 1.4;
      const topExt = rMax * 1.15, botExt = shMax + rMax * 0.3;
      const gt = (textH - capH - topExt - botExt) / 2 + topExt;           // top of the letter inside its plot
      letters.forEach(function (Lt, j) {
        const cl = document.createElement('canvas');
        cl.width = Math.ceil(lw[j]) + 4; cl.height = textH;
        const cg = cl.getContext('2d', { willReadFrequently: true });
        cg.font = font(fs); cg.textBaseline = 'alphabetic'; cg.fillStyle = '#000';
        cg.fillText(Lt.ch, 0, gt + capH);
        const px = cg.getImageData(0, 0, cl.width, cl.height).data;
        let row = 0;
        for (let y = d * 0.5; y < textH; y += d * 0.86, row++) {
          for (let gx = d * 0.5 + (row % 2 ? d * 0.5 : 0); gx < cl.width; gx += d) {
            const ix = Math.round(gx), iy = Math.min(cl.height - 1, Math.round(y));
            if (px[(iy * cl.width + ix) * 4 + 3] > 140) {
              Lt.flowers.push({
                lx: gx - lw[j] / 2 + u.rand(-d * 0.1, d * 0.1), ly: 6 + y + u.rand(-d * 0.1, d * 0.1),
                r: d * u.rand(0.64, 0.82), n: u.pick([5, 5, 6, 8]), rot: u.rand(0, 6.28),
                col: u.pick(PETALS), mid: u.pick(CENTERS),
                sh: d * u.rand(1.0, 1.4), bend: d * u.rand(-0.4, 0.4), stemCol: u.pick(STEM),
                leafCol: [u.pick(LEAF), u.pick(LEAF), u.pick(LEAF)], side: Math.random() < 0.5 ? 1 : -1,
                la: u.rand(0, 6.28), seedRot: u.rand(0, 3.14),
                seedAt: T(j * 130 + u.rand(0, 600))
              });
            }
          }
        }
        Lt.flowers.sort(function (a, b) { return a.ly - b.ly; });         // back rows first
      });

      /* ----- the gardener's route: walk to a plot, pour across it slowly, move on ----- */
      const tip = canTip(gh, 1);
      const walkSpeed = gh * 2.7 / 1000, pourSpeed = gh * 1.25 / 1000;    // px per ms
      const pw = gh * 0.5;
      let px0 = -pw * 1.4, py0 = head - 2, pt = T(ENTER), pd = 0;
      function addSeg(x1, dur, pour, top) {
        plan.push({ t0: pt, t1: pt + dur, x0: px0, x1: x1, y: py0, pour: pour, top: top, d0: pd });
        pd += Math.abs(x1 - px0); px0 = x1; pt += dur;
      }
      rows.forEach(function (row, ri) {
        const top = ri * rowH + head;
        if (ri > 0) {                                                      // leave stage right, re-enter on the next row
          addSeg(W + pw * 1.4, Math.max(T(280), Math.abs(W + pw * 1.4 - px0) / walkSpeed * ts), false, top - rowH);
          pt += T(150); px0 = -pw * 1.4;
        }
        py0 = top - 2;
        row.forEach(function (j) {
          const Lt = letters[j];
          const gx0 = Lt.homeCx - lw[j] / 2 - tip.x - LEAD, gx1 = Lt.homeCx + lw[j] / 2 - tip.x - LEAD;
          addSeg(gx0, Math.max(T(280), Math.abs(gx0 - px0) / walkSpeed * ts), false, top);
          const t0 = pt;
          addSeg(gx1, Math.max(T(800), (gx1 - gx0) / pourSpeed * ts), true, top);
          Lt.pour = { t0: t0, t1: pt, gx0: gx0, gx1: gx1 };
        });
      });
      addSeg(W + pw * 1.4, Math.max(T(280), (W + pw * 1.4 - px0) / walkSpeed * ts), false, rows.length * rowH - PH);

      /* ----- when the water reaches each seed, and what follows ----- */
      let last = 0;
      letters.forEach(function (Lt) {
        const P = Lt.pour;
        Lt.flowers.forEach(function (f) {
          const gx = Lt.homeCx + f.lx - tip.x - LEAD;
          const s = clamp01((gx - P.gx0) / (P.gx1 - P.gx0));
          f.tw = P.t0 + s * (P.t1 - P.t0) + T(FALL) + u.rand(-T(70), T(70));   // the water lands
          f.tg = f.tw + T(GERM) + u.rand(0, T(150));                            // the seed cracks, a shoot rises
          f.stemMs = T(STEM_MS) * u.rand(0.9, 1.15);
          f.tb = f.tg + f.stemMs * 0.8;                                         // a bud forms, then opens
          f.bm = T(o.bloomMs);
          last = Math.max(last, f.tb + f.bm);
        });
      });
      tc = last + T(350);                                                       // every letter is in flower: gather
      tA = tc + T(CONVERGE);
      doneAt = tA + T(800);
      run(dpr);
    }

    /* ---------- soil tile: rendered once per plot, then moved around ---------- */
    function makeTile(w, dpr) {
      const c = document.createElement('canvas');
      c.width = Math.round(w * dpr); c.height = Math.round((PH + GM) * dpr);
      const g = c.getContext('2d');
      g.scale(dpr, dpr);
      const top = GM;
      const gr = g.createLinearGradient(0, top, 0, top + PH);
      gr.addColorStop(0, '#1d140e'); gr.addColorStop(0.18, '#34241a'); gr.addColorStop(1, '#2a1c13');
      g.fillStyle = gr; g.fillRect(0, top, w, PH);
      // grain: clumps of lighter and darker soil
      const N = w * PH / 40;
      for (let i = 0; i < N; i++) {
        const px = Math.random() * w, py = top + Math.random() * PH, sz = u.rand(0.6, 2.6);
        g.fillStyle = Math.random() > 0.62 ? 'rgba(120,88,62,' + u.rand(0.2, 0.55).toFixed(2) + ')' : 'rgba(8,4,2,' + u.rand(0.25, 0.6).toFixed(2) + ')';
        g.beginPath(); g.ellipse(px, py, sz, sz * 0.7, u.rand(0, 3), 0, 6.283); g.fill();
      }
      // depth: shadowed back edge, soft light pooling toward the middle
      const sh = g.createLinearGradient(0, top, 0, top + PH * 0.3);
      sh.addColorStop(0, 'rgba(0,0,0,.55)'); sh.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = sh; g.fillRect(0, top, w, PH);
      const gl = g.createRadialGradient(w / 2, top + PH * 0.7, 0, w / 2, top + PH * 0.7, w * 0.9);
      gl.addColorStop(0, 'rgba(255,190,120,.10)'); gl.addColorStop(1, 'rgba(255,190,120,0)');
      g.fillStyle = gl; g.fillRect(0, top, w, PH);
      // blades of grass along the back edge
      g.lineCap = 'round';
      for (let i = 0; i < w / 5; i++) {
        const bx = u.rand(4, w - 4), bh = u.rand(5, 13), lean = u.rand(-4, 4);
        g.strokeStyle = u.pick(['#2f6a3a', '#3f7a45', '#56934f', '#244f2e']);
        g.lineWidth = u.rand(0.9, 1.7);
        g.beginPath(); g.moveTo(bx, top + 2); g.quadraticCurveTo(bx + lean * 0.4, top - bh * 0.5, bx + lean, top - bh); g.stroke();
      }
      return c;
    }

    function geom(Lt, e) {
      const cx = Lt.homeCx + (Lt.finCx - Lt.homeCx) * e;
      const top = Lt.homeTop + (Lt.finTop - Lt.homeTop) * e;
      return { cx: cx, top: top, x0: cx - Lt.lw / 2 - (padOf(Lt, 'L', e)), x1: cx + Lt.lw / 2 + (padOf(Lt, 'R', e)) };
    }
    // Plots start with a little soil all round and end up just touching their neighbours.
    let padStart = 0;
    function padOf(Lt, side, e) {
      const end = side === 'L' ? Lt.padEL : Lt.padER;
      return padStart + (end - padStart) * e;
    }

    function drawSoil(g, Lt, t, e, rf) {
      const pa = easeOutCubic(clamp01((t - T(Lt.idx * 110)) / T(650)));      // the plot fades in, one after another
      Lt.pa = pa;
      Lt.g = geom(Lt, e);
      if (pa <= 0) return;
      const G = Lt.g, y0 = G.top + (1 - pa) * 10, y1 = y0 + PH;
      if (!Lt.last) G.x1 += 0.7 * (1 - rf);                   // neighbours overlap a hair so no seam shows
      const rl = Lt.first ? rr0 : rr0 * rf, rr = Lt.last ? rr0 : rr0 * rf;
      g.save();
      g.globalAlpha = pa;
      g.save();
      patchPath(g, G.x0, y0, G.x1, y1, rl, rr); g.clip();
      g.drawImage(Lt.tile, G.cx - Lt.tileW / 2, y0 - GM, Lt.tileW, PH + GM);
      g.restore();
      // grass pokes out above the soil; neighbours share the blades along their seam
      const mL = Lt.first ? 3 : 3 * rf, mR = Lt.last ? 3 : 3 * rf;
      g.save();
      g.beginPath(); g.rect(G.x0 + mL, y0 - GM, (G.x1 - mR) - (G.x0 + mL), GM + 3); g.clip();
      g.drawImage(Lt.tile, G.cx - Lt.tileW / 2, y0 - GM, Lt.tileW, PH + GM);
      g.restore();
      patchRim(g, G.x0, y0, G.x1, y1, rl, rr, Lt.first ? 1 : rf, Lt.last ? 1 : rf);
      g.restore();
    }

    /* ---------- seeds, wet soil, plants, blooms ---------- */
    function drawWet(g, f, t) {
      const a = easeOutCubic(clamp01((t - f.tw) / T(700)));
      if (a <= 0) return;
      const sz = f.r * 2.1;
      g.globalAlpha = a;
      g.drawImage(wetSprite(), f.lx - sz / 2, f.ly + f.sh - sz / 2, sz, sz);
      g.globalAlpha = 1;
    }

    function drawSeed(g, f, t) {
      const a = clamp01((t - f.seedAt) / 450);
      if (a <= 0) return;
      const gone = clamp01((t - f.tg) / T(350));          // the seed splits and fades as the shoot rises
      if (gone >= 1) return;
      const k = f.r * 0.28 / 9 * (0.5 + 0.5 * easeOutBack(a));
      g.save();
      g.translate(f.lx, f.ly + f.sh);
      g.globalAlpha = a * (1 - gone);
      g.rotate(f.seedRot);
      g.drawImage(sprites.seed || seedSprite(), -24 * k, -16 * k, 48 * k, 34 * k);
      g.restore();
    }

    /** The shoot: a stem that rises from the seed, putting out leaves. Returns where the tip is. */
    function drawPlant(g, f, t) {
      const q = easeOutCubic(clamp01((t - f.tg) / f.stemMs));
      if (q <= 0) return null;
      const sway = App.reduced ? 0 : Math.sin(t / 650 + f.la) * f.sh * 0.07 * q;
      const bx = f.lx, by = f.ly + f.sh;
      const tx = f.lx + sway, ty = f.ly + f.sh * (1 - q);
      const cx = bx + f.bend * q + sway * 0.5, cy = (by + ty) / 2;
      g.strokeStyle = f.stemCol; g.lineWidth = Math.max(1.3, f.r * 0.15); g.lineCap = 'round';
      g.beginPath(); g.moveTo(bx, by); g.quadraticCurveTo(cx, cy, tx, ty); g.stroke();
      for (let k = 0; k < 3; k++) {
        const lq = easeOutBack(clamp01((q - LEAF_AT[k]) / 0.4));
        if (lq <= 0) continue;
        const s = LEAF_AT[k] / q, a = 1 - s;
        const lx = a * a * bx + 2 * a * s * cx + s * s * tx, ly = a * a * by + 2 * a * s * cy + s * s * ty;
        const len = f.r * (0.95 - k * 0.1) * lq;
        g.save();
        g.translate(lx, ly);
        g.scale((k % 2 ? 1 : -1) * f.side, 1);
        g.rotate(-0.55 - k * 0.12 + sway * 0.05);
        g.drawImage(leafSprite(f.leafCol[k]), 0, -len * 0.25, len, len * 0.5);
        g.restore();
      }
      return { x: tx, y: ty };
    }

    function drawFlower(g, f, p, hx, hy, t) {
      const open = easeOutBack(clamp01((p - 0.15) / 0.85));
      const bud = easeOutCubic(clamp01(p * 3));
      const sway = App.reduced ? 0 : Math.sin(t / 900 + f.la) * 0.05 * clamp01(p);
      g.save();
      g.translate(hx, hy);
      g.rotate(f.rot + sway + (1 - clamp01(p)) * 0.9);
      const budA = (1 - clamp01((p - 0.2) / 0.35));
      if (budA > 0.01) {
        const bs = bud * f.r * 1.9;
        g.globalAlpha = budA;
        g.drawImage(budSprite(f.col), -bs / 2, -bs / 2, bs, bs);
      }
      const os = open * f.r * 2.18;
      if (os > 0.5) {
        g.globalAlpha = clamp01((p - 0.12) * 4);
        const spr = openSprite(f.col, f.mid, f.n);
        g.drawImage(spr, -os / 2, -os / 2, os, os);
      }
      g.restore();
    }

    function drawContent(g, Lt, t) {
      if (Lt.pa <= 0) return;
      const G = Lt.g, fl = Lt.flowers;
      g.save();
      g.translate(G.cx, G.top + (1 - Lt.pa) * 10);
      for (let i = 0; i < fl.length; i++) drawWet(g, fl[i], t);
      for (let i = 0; i < fl.length; i++) drawSeed(g, fl[i], t);
      for (let i = 0; i < fl.length; i++) {
        const f = fl[i];
        const tipPt = drawPlant(g, f, t);
        if (!tipPt) continue;
        const p = clamp01((t - f.tb) / f.bm);
        if (p > 0) drawFlower(g, f, p, tipPt.x, tipPt.y, t);
      }
      g.restore();
    }

    /* ---------- the gardener ---------- */
    function gardenerAt(t) {
      for (let i = 0; i < plan.length; i++) {
        const s = plan[i];
        if (t >= s.t0 && t < s.t1) {
          const p = (t - s.t0) / (s.t1 - s.t0);
          return { x: s.x0 + (s.x1 - s.x0) * p, y: s.y, pour: s.pour, top: s.top, dist: s.d0 + Math.abs(s.x1 - s.x0) * p };
        }
      }
      return null;
    }

    function drawGardener(g, gx, gy, ph, tilt) {
      const h = gh;
      const sw = Math.sin(ph);
      g.save();
      g.translate(gx, gy);
      g.lineCap = 'round'; g.lineJoin = 'round';

      // contact shadow
      g.fillStyle = 'rgba(0,0,0,.4)';
      g.beginPath(); g.ellipse(0, 1, h * 0.26, h * 0.04, 0, 0, 6.283); g.fill();

      g.translate(0, -Math.abs(Math.cos(ph)) * h * 0.012);

      // legs
      [0, Math.PI].forEach(function (o2) {
        const s = Math.sin(ph + o2), lift = Math.max(0, Math.cos(ph + o2));
        const fx = s * h * 0.12, fy = -lift * h * 0.035;
        g.strokeStyle = '#c98f6a'; g.lineWidth = h * 0.042;
        g.beginPath(); g.moveTo(-h * 0.005, -h * 0.37); g.lineTo(fx, fy - h * 0.03); g.stroke();
        g.fillStyle = '#4a2f22';
        g.beginPath(); g.ellipse(fx + h * 0.03, fy - h * 0.01, h * 0.055, h * 0.027, 0, 0, 6.283); g.fill();
      });

      // skirt (sways with the stride)
      const sk = g.createLinearGradient(-h * 0.2, -h * 0.7, h * 0.2, -h * 0.34);
      sk.addColorStop(0, '#f48fbf'); sk.addColorStop(1, '#c94c86');
      g.fillStyle = sk;
      g.beginPath();
      g.moveTo(-h * 0.09, -h * 0.72); g.lineTo(h * 0.09, -h * 0.72);
      g.bezierCurveTo(h * 0.12, -h * 0.55, h * (0.2 + sw * 0.015), -h * 0.45, h * (0.22 + sw * 0.02), -h * 0.34);
      g.quadraticCurveTo(0, -h * 0.31, -h * (0.22 - sw * 0.02), -h * 0.34);
      g.bezierCurveTo(-h * 0.2, -h * 0.45, -h * 0.12, -h * 0.55, -h * 0.09, -h * 0.72);
      g.closePath(); g.fill();
      g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = h * 0.012;
      g.beginPath(); g.moveTo(-h * 0.2, -h * 0.4); g.quadraticCurveTo(0, -h * 0.37, h * 0.2, -h * 0.4); g.stroke();

      // bodice
      const bd = g.createLinearGradient(-h * 0.1, 0, h * 0.1, 0);
      bd.addColorStop(0, '#fff3ea'); bd.addColorStop(1, '#f2d9cd');
      g.fillStyle = bd;
      g.beginPath(); g.moveTo(-h * 0.09, -h * 0.72); g.quadraticCurveTo(-h * 0.1, -h * 0.8, -h * 0.07, -h * 0.82);
      g.lineTo(h * 0.07, -h * 0.82); g.quadraticCurveTo(h * 0.1, -h * 0.8, h * 0.09, -h * 0.72); g.closePath(); g.fill();

      // back arm
      g.strokeStyle = '#d9a480'; g.lineWidth = h * 0.04;
      g.beginPath(); g.moveTo(-h * 0.06, -h * 0.79); g.quadraticCurveTo(-h * 0.13, -h * 0.66, -h * 0.1 - sw * h * 0.03, -h * 0.55); g.stroke();

      // hair (long, flowing back)
      g.fillStyle = '#2d1a12';
      g.beginPath();
      g.moveTo(-h * 0.02, -h * 0.95);
      g.bezierCurveTo(-h * 0.17, -h * 0.93, -h * (0.2 + sw * 0.01), -h * 0.75, -h * (0.16 + sw * 0.02), -h * 0.64);
      g.quadraticCurveTo(-h * 0.1, -h * 0.72, -h * 0.05, -h * 0.82);
      g.closePath(); g.fill();

      // neck + head
      g.fillStyle = '#e8b896';
      g.fillRect(-h * 0.015, -h * 0.84, h * 0.04, h * 0.04);
      const hg = g.createRadialGradient(h * 0.03, -h * 0.88, 0, h * 0.01, -h * 0.87, h * 0.1);
      hg.addColorStop(0, '#fbd9bd'); hg.addColorStop(1, '#e2ac86');
      g.fillStyle = hg;
      g.beginPath(); g.ellipse(h * 0.01, -h * 0.875, h * 0.085, h * 0.095, 0, 0, 6.283); g.fill();
      g.fillStyle = '#2d1a12';
      g.beginPath(); g.ellipse(h * 0.01, -h * 0.9, h * 0.092, h * 0.07, 0, Math.PI * 0.92, Math.PI * 1.95); g.fill();
      g.beginPath(); g.arc(h * 0.062, -h * 0.872, h * 0.007, 0, 6.283); g.fill();
      g.strokeStyle = '#c4756a'; g.lineWidth = h * 0.008;
      g.beginPath(); g.arc(h * 0.062, -h * 0.84, h * 0.018, 0.2, 2.2); g.stroke();

      // straw hat
      const ht = g.createLinearGradient(0, -h * 1.0, 0, -h * 0.92);
      ht.addColorStop(0, '#f3dc9a'); ht.addColorStop(1, '#c79b4a');
      g.fillStyle = ht;
      g.beginPath(); g.ellipse(h * 0.01, -h * 0.935, h * 0.2, h * 0.04, -0.04, 0, 6.283); g.fill();
      g.beginPath(); g.ellipse(h * 0.01, -h * 0.955, h * 0.1, h * 0.065, 0, Math.PI, 6.283); g.fill();
      g.fillStyle = '#d6577f';
      g.fillRect(-h * 0.09, -h * 0.958, h * 0.2, h * 0.018);
      g.strokeStyle = 'rgba(120,80,20,.35)'; g.lineWidth = h * 0.005;
      for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(h * 0.01 + i * h * 0.05, -h * 0.935); g.lineTo(h * 0.01 + i * h * 0.05, -h * 0.925); g.stroke(); }

      // front arm holding the can
      g.strokeStyle = '#e8b896'; g.lineWidth = h * 0.042;
      g.beginPath(); g.moveTo(h * 0.06, -h * 0.79); g.quadraticCurveTo(h * 0.2, -h * 0.74, h * 0.3, -h * 0.64); g.stroke();
      g.fillStyle = '#fff3ea';
      g.beginPath(); g.arc(h * 0.075, -h * 0.79, h * 0.03, 0, 6.283); g.fill();

      // watering can: carried level, tipped forward while pouring
      g.save();
      g.translate(h * 0.32, -h * 0.64);
      g.rotate(0.2 + tilt * 0.45);
      const cg = g.createLinearGradient(-h * 0.09, 0, h * 0.11, 0);
      cg.addColorStop(0, '#9cc7de'); cg.addColorStop(0.5, '#6aa5c6'); cg.addColorStop(1, '#3f7b9f');
      g.fillStyle = cg;
      g.beginPath(); g.moveTo(-h * 0.085, -h * 0.07); g.lineTo(h * 0.1, -h * 0.07); g.lineTo(h * 0.115, h * 0.09); g.lineTo(-h * 0.1, h * 0.09); g.closePath(); g.fill();
      g.fillStyle = '#d6eaf4'; g.fillRect(-h * 0.09, -h * 0.08, h * 0.19, h * 0.018);
      g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(-h * 0.06, -h * 0.04, h * 0.025, h * 0.115);
      g.strokeStyle = '#3f7b9f'; g.lineWidth = h * 0.022;
      g.beginPath(); g.arc(-h * 0.085, 0, h * 0.07, Math.PI * 0.5, Math.PI * 1.5); g.stroke();
      g.beginPath(); g.moveTo(h * 0.1, h * 0.075); g.quadraticCurveTo(h * 0.2, h * 0.075, h * 0.27, h * 0.115); g.stroke();
      g.fillStyle = '#3f7b9f';
      g.beginPath(); g.ellipse(h * 0.285, h * 0.125, h * 0.02, h * 0.04, 0.9, 0, 6.283); g.fill();
      g.restore();
      g.restore();
    }

    /* ---------- the loop ---------- */
    function run(dpr) {
      const g = canvas.getContext('2d');
      const start = performance.now();
      let prev = start, acc = 0, tilt = 0, nextTw = 0, gathering = false, burst = false, finished = false;

      function twinkle(at) {
        const Lt = u.pick(letters);
        if (!Lt.flowers.length || !Lt.g) return;
        const f = u.pick(Lt.flowers);
        twinkles.push({ x: Lt.g.cx + f.lx, y: Lt.g.top + f.ly, s: f.r * u.rand(0.9, 1.6), t0: at, life: u.rand(700, 1100) });
      }

      (function frame(now) {
        if (!alive) return;
        const t = now - start;
        const dt = Math.min(0.05, (now - prev) / 1000);
        prev = now;
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        g.clearRect(0, 0, W, H);

        // the plots, then what grows in them
        const e = easeInOutCubic(clamp01((t - tc) / T(CONVERGE)));
        const rf = 1 - clamp01((e - 0.55) / 0.4);               // corners square off just before the plots touch
        if (t >= tc && !gathering) { gathering = true; if (o.onConverge) o.onConverge(); }
        for (let i = 0; i < letters.length; i++) drawSoil(g, letters[i], t, e, rf);
        for (let i = 0; i < letters.length; i++) drawContent(g, letters[i], t);

        // ripples where water lands
        for (let i = ripples.length - 1; i >= 0; i--) {
          const r = ripples[i];
          r.a -= dt * 2.2;
          if (r.a <= 0) { ripples.splice(i, 1); continue; }
          g.strokeStyle = 'rgba(190,225,255,' + (r.a * 0.5) + ')'; g.lineWidth = 1;
          g.beginPath(); g.ellipse(r.x, r.y, (1 - r.a) * 9 + 1, (1 - r.a) * 3.5 + 0.5, 0, 0, 6.283); g.stroke();
        }

        // gardener + water
        const gd = gardenerAt(t);
        if (gd) {
          tilt += ((gd.pour ? 1 : 0) - tilt) * Math.min(1, dt * 9);
          drawGardener(g, gd.x, gd.y, gd.dist * 3.6 / gh, tilt);
          if (tilt > 0.55) {
            const tp = canTip(gh, tilt);
            acc += dt * 150 * tilt;
            while (acc >= 1) {
              acc--;
              drops.push({ x: gd.x + tp.x + u.rand(-3, 3), y: gd.y + tp.y + u.rand(0, 3), vx: u.rand(14, 46), vy: u.rand(20, 80), land: gd.top + u.rand(0.15, 0.95) * PH, len: u.rand(3, 6) });
            }
          }
        } else {
          tilt = 0;
        }
        for (let i = drops.length - 1; i >= 0; i--) {
          const dp = drops[i];
          dp.vy += 1500 * dt; dp.x += dp.vx * dt; dp.y += dp.vy * dt;
          if (dp.y >= dp.land) { if (ripples.length < 60) ripples.push({ x: dp.x, y: dp.land, a: 1 }); drops.splice(i, 1); continue; }
          const grd = g.createLinearGradient(dp.x, dp.y - dp.len, dp.x, dp.y);
          grd.addColorStop(0, 'rgba(190,225,255,0)'); grd.addColorStop(1, 'rgba(225,242,255,.95)');
          g.strokeStyle = grd; g.lineWidth = 1.3; g.lineCap = 'round';
          g.beginPath(); g.moveTo(dp.x - dp.vx * 0.012, dp.y - dp.len); g.lineTo(dp.x, dp.y); g.stroke();
        }

        // once the name has come together it glitters
        if (t >= tA && !App.reduced) {
          if (!burst) { burst = true; for (let i = 0; i < 34; i++) twinkle(t + u.rand(0, 600)); }
          if (t >= nextTw) { nextTw = t + u.rand(60, 130); twinkle(t); }
        }
        if (twinkles.length) {
          g.fillStyle = '#fff6d8';
          for (let i = twinkles.length - 1; i >= 0; i--) {
            const w = twinkles[i], k = (t - w.t0) / w.life;
            if (k >= 1) { twinkles.splice(i, 1); continue; }
            if (k < 0) continue;
            const s = Math.sin(Math.PI * k);
            g.globalAlpha = s;
            star(g, w.x, w.y, w.s * (0.35 + 0.65 * s));
          }
          g.globalAlpha = 1;
        }

        if (!finished && t >= doneAt) { finished = true; finish(); }
        raf = requestAnimationFrame(frame);
      })(start);
    }

    // Wait briefly for the bold font so the letter shapes are right, then start.
    const fonts = document.fonts && document.fonts.load ? document.fonts.load(font(100)) : Promise.resolve();
    Promise.race([fonts, new Promise(function (r) { setTimeout(r, 1200); })]).then(build, build);

    return {
      done: done,
      destroy() { alive = false; cancelAnimationFrame(raf); canvas.remove(); }
    };
  };
})(window.App = window.App || {});
