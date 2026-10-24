/* A name written in seeds, one separate group of seeds per letter. With no one to water them the letters wake up by
   themselves, one after another: the seeds sprout, grow into little plants and bloom until every letter is filled
   with flowers. Then the letters glide to the centre together and the name is shown. */
(function (App) {
  const u = App.u;
  const FX = App.FX;

  const PETALS = ['#f06aa8', '#f7a8d0', '#f6a77a', '#e0303a', '#f7c948', '#8f74d6', '#fff6ec', '#d63384', '#ff7f6b', '#b79ae6'];
  const CENTERS = ['#f7c948', '#ffb02e', '#fff2a8'];
  const LEAF = ['#3f7a45', '#2f6a3a', '#56934f', '#4d9a52'];
  const STEM = ['#3f8f4a', '#4d9a52', '#397d43'];
  const LEAF_AT = [0.3, 0.55, 0.8];          // how far up the stem each leaf sits (as the stem grows)

  /* ---------- timeline (ms, before the reduced-motion scale) ---------- */
  const GROW_START = 1100; // the first letter begins to sprout
  const GROW_STEP = 780;   // each following letter starts this much later
  const GROW_SPAN = 650;   // sprouting sweeps across one letter, left to right, in this time
  const GERM = 200;        // pause before a seed cracks open
  const STEM_MS = 850;     // a shoot grows to its full height
  const CONVERGE = 1800;   // the finished letters glide to the centre

  const easeOutBack = function (t) { const c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
  const easeOutCubic = function (t) { return 1 - Math.pow(1 - t, 3); };
  const easeInOutCubic = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  const clamp01 = function (t) { return t < 0 ? 0 : t > 1 ? 1 : t; };
  const range = function (a, b) { const r = []; for (let i = a; i < b; i++) r.push(i); return r; };
  const GLYPH_WEIGHT = 600;   // how bold the letter outline is: lighter = slimmer letters, easier to read
  const font = function (px) { return GLYPH_WEIGHT + ' ' + px + 'px Jost, "Segoe UI", Arial, sans-serif'; };

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
   * 1) every letter is scattered with seeds in its own shape, spread well apart,
   * 2) the letters wake up one after another: seeds sprout, grow into plants and bloom,
   * 3) once every letter is in flower they glide together at the centre and the name is shown.
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
    const twinkles = [];
    let W = 0, H = 0, PH = 0, tc = 0, tA = 0, doneAt = 0;

    function build() {
      if (!alive) return;
      W = Math.max(220, Math.min(o.maxWidth, (parent.clientWidth || window.innerWidth) - 8));
      const chars = Array.from(text), n = chars.length;
      const m = document.createElement('canvas').getContext('2d');
      m.font = font(100);
      const capRatio = (m.measureText('H').actualBoundingBoxAscent || 72) / 100;
      const gapRatio = 0.1;
      const widths = chars.map(function (ch) { return m.measureText(ch).width; });

      // The finished name is centred, but each flower-letter starts as a separate
      // surprise somewhere across the full screen.
      const narrow = W < 700 && n > 3;
      const Wn = narrow ? W * 0.91 : Math.min(835, W * 0.59);          // width of the finished name
      const fs = 100 * Wn / (widths.reduce(function (a, b) { return a + b; }, 0) + gapRatio * 100 * (n - 1));
      const capH = fs * capRatio, gapF = gapRatio * fs;
      const lw = widths.map(function (w) { return w * fs / 100; });

      const d = Math.max(6.5, capH / 9.5);                                 // flower spacing
      const textH = Math.round(capH * 1.55);
      PH = textH + 12;                                                   // height of one row of letters
      H = Math.max(PH * 2.5, Math.min(window.innerHeight * 0.84, 760));
      const padS = Math.max(7, capH * 0.17);                             // breathing room around a lone letter

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);

      /* ----- letters: where each one starts out, and where it ends up ----- */
      chars.forEach(function (ch, j) { letters.push({ idx: j, ch: ch, lw: lw[j], flowers: [], g: null }); });

      const scatter = [
        [0.14, 0.10], [0.51, 0.06], [0.84, 0.18], [0.19, 0.51],
        [0.50, 0.39], [0.81, 0.61], [0.44, 0.75]
      ].sort(function () { return Math.random() - 0.5; });
      letters.forEach(function (Lt, j) {
        const p = scatter[j % scatter.length];
        const minX = Lt.lw / 2 + padS, maxX = W - minX;
        Lt.homeCx = Math.max(minX, Math.min(maxX, p[0] * W + u.rand(-W * 0.035, W * 0.035)));
        Lt.homeTop = Math.max(0, Math.min(H - PH, p[1] * (H - PH) + u.rand(-H * 0.025, H * 0.025)));
      });
      const gap = gapRatio * fs;
      const finTop = (H - PH) / 2;
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
                r: d * u.rand(0.56, 0.72), n: u.pick([5, 5, 6, 8]), rot: u.rand(0, 6.28),
                col: u.pick(PETALS), mid: u.pick(CENTERS),
                sh: d * u.rand(1.0, 1.4), bend: d * u.rand(-0.4, 0.4), stemCol: u.pick(STEM),
                leafCol: [u.pick(LEAF), u.pick(LEAF), u.pick(LEAF)], side: Math.random() < 0.5 ? 1 : -1,
                la: u.rand(0, 6.28), seedRot: u.rand(0, 3.14),
                seedAt: T(j * 90 + u.rand(0, 500))
              });
            }
          }
        }
        Lt.flowers.sort(function (a, b) { return a.ly - b.ly; });         // back rows first
      });

      /* ----- letters bloom in a random order across the screen ----- */
      let last = 0;
      letters.slice().sort(function () { return Math.random() - 0.5; }).forEach(function (Lt) {
        const t0 = T(GROW_START + u.rand(0, 950));
        Lt.flowers.forEach(function (f) {
          const s = clamp01((f.lx + Lt.lw / 2) / Lt.lw);                        // 0 at the letter's left edge, 1 at its right
          f.tg = t0 + s * T(GROW_SPAN) + u.rand(0, T(160));                     // the seed cracks, a shoot rises
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

    /** A letter glides from where it grew to its place in the name. */
    function place(Lt, e) {
      Lt.g = { cx: Lt.homeCx + (Lt.finCx - Lt.homeCx) * e, top: Lt.homeTop + (Lt.finTop - Lt.homeTop) * e };
    }

    /* ---------- seeds, plants, blooms ---------- */
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
      const G = Lt.g, fl = Lt.flowers;
      g.save();
      g.translate(G.cx, G.top);
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

    /* ---------- the loop ---------- */
    function run(dpr) {
      const g = canvas.getContext('2d');
      const start = performance.now();
      let nextTw = 0, gathering = false, burst = false, finished = false;

      function twinkle(at) {
        const Lt = u.pick(letters);
        if (!Lt.flowers.length || !Lt.g) return;
        const f = u.pick(Lt.flowers);
        twinkles.push({ x: Lt.g.cx + f.lx, y: Lt.g.top + f.ly, s: f.r * u.rand(0.9, 1.6), t0: at, life: u.rand(700, 1100) });
      }

      (function frame(now) {
        if (!alive) return;
        const t = now - start;
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        g.clearRect(0, 0, W, H);

        // the letters (they glide to the centre once all are in flower), and what grows in them
        const e = easeInOutCubic(clamp01((t - tc) / T(CONVERGE)));
        if (t >= tc && !gathering) { gathering = true; if (o.onConverge) o.onConverge(); }
        for (let i = 0; i < letters.length; i++) place(letters[i], e);
        for (let i = 0; i < letters.length; i++) drawContent(g, letters[i], t);

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

  const plantGrowingFlowerName = FX.flowerName;

  /* A photographic replacement for the procedural flower sprites above. */
  FX.flowerName = function (parent, text, opts) {
    const o = Object.assign({ onConverge: null }, opts || {});
    const chars = Array.from(String(text).toUpperCase());
    const scatter = [[13, 13], [49, 8], [84, 18], [17, 50], [51, 40], [82, 62], [45, 77]]
      .sort(function () { return Math.random() - 0.5; });
    const layer = document.createElement('div');
    layer.className = 'real-flower-name';
    parent.appendChild(layer);
    let alive = true, finish;
    const timers = [];
    const later = function (fn, ms) { const id = setTimeout(function () { if (alive) fn(); }, ms); timers.push(id); return id; };
    const done = new Promise(function (resolve) { finish = resolve; });
    const letters = chars.map(function (ch, i) {
      const el = document.createElement('span'), p = scatter[i % scatter.length];
      el.className = 'rf-letter';
      el.textContent = ch;
      el.style.left = (p[0] + u.rand(-3, 3)).toFixed(2) + '%';
      el.style.top = (p[1] + u.rand(-3, 3)).toFixed(2) + '%';
      el.style.setProperty('--photo-x', (i * 17 + u.rand(-7, 7)).toFixed(1) + '%');
      layer.appendChild(el);
      return el;
    });
    requestAnimationFrame(function () {
      letters.forEach(function (el, i) { later(function () { el.classList.add('in'); }, 280 + u.rand(0, 900) + i * 40); });
      later(function () {
        const width = layer.clientWidth || window.innerWidth;
        const total = letters.reduce(function (sum, el) { return sum + el.getBoundingClientRect().width; }, 0);
        let x = Math.max(0, (width - total) / 2);
        letters.forEach(function (el) { const w = el.getBoundingClientRect().width; el.style.left = (x + w / 2) + 'px'; el.style.top = '50%'; x += w; });
        layer.classList.add('gather');
        if (o.onConverge) o.onConverge();
      }, 3900);
      later(function () { finish(); }, 6300);
    });
    return { done: done, destroy: function () { alive = false; timers.forEach(clearTimeout); layer.remove(); } };
  };

  /* Individual photographic blooms grow into each letter, then the letter groups gather. */
  FX.flowerName = function (parent, text, opts) {
    const o = Object.assign({ onConverge: null }, opts || {});
    const chars = Array.from(String(text).toUpperCase());
    const layer = document.createElement('div');
    layer.className = 'garden-letter-field';
    parent.appendChild(layer);
    let alive = true, finish;
    const timers = [];
    const later = function (fn, ms) { const id = setTimeout(function () { if (alive) fn(); }, ms); timers.push(id); return id; };
    const done = new Promise(function (resolve) { finish = resolve; });

    function build() {
      if (!alive) return;
      const W = layer.clientWidth || window.innerWidth;
      const H = layer.clientHeight || window.innerHeight;
      const measure = document.createElement('canvas').getContext('2d');
      measure.font = font(100);
      const widths = chars.map(function (ch) { return measure.measureText(ch).width; });
      const targetW = W < 700 ? W * .86 : Math.min(790, W * .58);
      const gap = Math.max(3, targetW * .012);
      const fs = 100 * (targetW - gap * (chars.length - 1)) / widths.reduce(function (sum, w) { return sum + w; }, 0);
      const capH = fs * ((measure.measureText('H').actualBoundingBoxAscent || 72) / 100);
      const letterW = widths.map(function (w) { return w * fs / 100; });
      const letterH = capH + 10;
      const scatter = [[.10,.13],[.49,.08],[.83,.18],[.16,.53],[.52,.43],[.84,.64],[.43,.77]]
        .sort(function () { return Math.random() - .5; });
      let finalX = (W - (letterW.reduce(function (sum, w) { return sum + w; }, 0) + gap * (chars.length - 1))) / 2;
      const groups = [];

      chars.forEach(function (ch, index) {
        const group = document.createElement('div');
        const p = scatter[index];
        group.className = 'rf-bloom-letter';
        group.style.width = letterW[index] + 'px';
        group.style.height = letterH + 'px';
        group.style.left = Math.max(2, Math.min(W - letterW[index] - 2, p[0] * W - letterW[index] / 2 + u.rand(-W * .025, W * .025))) + 'px';
        group.style.top = Math.max(2, Math.min(H - letterH - 2, p[1] * H - letterH / 2 + u.rand(-H * .025, H * .025))) + 'px';
        group.dataset.finalLeft = finalX + 'px';
        finalX += letterW[index] + gap;

        const glyph = document.createElement('canvas');
        glyph.width = Math.ceil(letterW[index] + 4); glyph.height = Math.ceil(letterH + 4);
        const g = glyph.getContext('2d', { willReadFrequently: true });
        g.font = font(fs); g.fillStyle = '#000'; g.textBaseline = 'alphabetic'; g.fillText(ch, 0, capH);
        const pixels = g.getImageData(0, 0, glyph.width, glyph.height).data;
        const step = Math.max(11, capH / 7.5);
        let bloomIndex = 0;
        for (let y = step * .5; y < capH; y += step) {
          for (let x = step * .5 + ((Math.round(y / step) % 2) * step * .45); x < letterW[index]; x += step) {
            const px = pixels[(Math.min(glyph.height - 1, Math.round(y)) * glyph.width + Math.min(glyph.width - 1, Math.round(x))) * 4 + 3];
            if (px < 120) continue;
            const bloom = document.createElement('span');
            const image = document.createElement('img');
            bloom.className = 'rf-bloom';
            bloom.style.left = (x - step * .85) + 'px'; bloom.style.top = (y - step * .85) + 'px';
            bloom.style.setProperty('--size', (step * u.rand(1.45, 1.95)).toFixed(1) + 'px');
            bloom.style.setProperty('--rot', u.rand(-18, 18).toFixed(1) + 'deg');
            bloom.style.setProperty('--delay', (u.rand(0, 1200) + bloomIndex++ * 12).toFixed(0) + 'ms');
            image.src = u.pick(['assets/images/rose.png', 'assets/images/sunflower-clean.png', 'assets/images/sunflower-gold.png']);
            image.alt = ''; image.draggable = false;
            bloom.appendChild(image); group.appendChild(bloom);
          }
        }
        layer.appendChild(group); groups.push(group);
      });

      later(function () { groups.forEach(function (group) { group.classList.add('grown'); }); }, 180);
      later(function () {
        groups.forEach(function (group) { group.style.left = group.dataset.finalLeft; group.style.top = ((H - letterH) / 2) + 'px'; group.classList.add('gather'); });
        layer.classList.add('gather');
        if (o.onConverge) o.onConverge();
      }, 4300);
      later(function () { finish(); }, 6750);
    }
    const fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    Promise.race([fonts, new Promise(function (resolve) { setTimeout(resolve, 900); })]).then(build, build);
    return { done: done, destroy: function () { alive = false; timers.forEach(clearTimeout); layer.remove(); } };
  };

  // Use the original plant-growing animation requested for this scene.
  FX.flowerName = plantGrowingFlowerName;
})(window.App = window.App || {});
