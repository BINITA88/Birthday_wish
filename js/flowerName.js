/* A name written in seeds on a soil bed. A gardener walks along, waters them, and flowers bloom. */
(function (App) {
  const u = App.u;
  const FX = App.FX;

  const PETALS = ['#f06aa8', '#f7a8d0', '#f6a77a', '#e0303a', '#f7c948', '#8f74d6', '#fff6ec', '#d63384', '#ff7f6b', '#b79ae6'];
  const CENTERS = ['#f7c948', '#ffb02e', '#fff2a8'];
  const LEAF = ['#3f7a45', '#2f6a3a', '#56934f'];

  const easeOutBack = function (t) { const c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
  const easeOutCubic = function (t) { return 1 - Math.pow(1 - t, 3); };
  const clamp01 = function (t) { return t < 0 ? 0 : t > 1 ? 1 : t; };

  /* ---------- colour helpers ---------- */
  function rgb(hex) { const n = parseInt(hex.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
  function mix(hex, to, a) {
    const c = rgb(hex), t = to === 'w' ? [255, 255, 255] : to === 'k' ? [20, 8, 12] : rgb(to);
    return 'rgb(' + Math.round(c[0] + (t[0] - c[0]) * a) + ',' + Math.round(c[1] + (t[1] - c[1]) * a) + ',' + Math.round(c[2] + (t[2] - c[2]) * a) + ')';
  }

  /* ---------- pre-rendered flower sprites (shaded petals, two layers, stamens) ---------- */
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

  /**
   * FX.flowerName(parent, text, opts) -> { done: Promise, destroy() }
   * 1) seeds appear in the shape of the letters, 2) a gardener waters them left to right,
   * 3) each seed sprouts and blooms where the water lands. `done` resolves when everything has bloomed.
   */
  FX.flowerName = function (parent, text, opts) {
    const o = Object.assign({ maxWidth: 780, bloomMs: 1100, seedMs: 1600, walkMs: 6400 }, opts || {});
    text = String(text).toUpperCase();
    const walkMs = App.reduced ? 2600 : o.walkMs;
    const seedMs = App.reduced ? 700 : o.seedMs;

    const canvas = document.createElement('canvas');
    canvas.className = 'flower-name';
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', text);
    parent.appendChild(canvas);

    let alive = true, raf = 0, finish;
    const done = new Promise(function (r) { finish = r; });
    const flowers = [];
    const drops = [];
    const ripples = [];
    let bedImg = null;
    let W = 0, H = 0, head = 0, gh = 0, walkStart = 0, speed = 0, tipOff = 0, tipUp = 0, endAt = 0;

    function build() {
      if (!alive) return;
      W = Math.max(220, Math.min(o.maxWidth, (parent.clientWidth || window.innerWidth) - 8));
      const family = '800 100px Jost, "Segoe UI", Arial, sans-serif';
      const m = document.createElement('canvas').getContext('2d');
      m.font = family;
      const gapRatio = 0.1;
      const widths = Array.from(text).map(function (ch) { return m.measureText(ch).width; });
      const sum = widths.reduce(function (a, b) { return a + b; }, 0) + gapRatio * 100 * (text.length - 1);
      const k = (W * 0.92) / sum;
      const fs = 100 * k, capH = fs * 0.72;
      head = Math.round(capH * 1.05);                   // room for the gardener above the letters
      gh = head * 0.84;                                 // gardener height
      const textH = Math.round(capH * 1.32);
      H = head + textH;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      bedImg = makeBed(dpr);

      const d = Math.max(7, capH / 8.5);
      const base = head + (textH + capH) / 2;
      let x = (W - sum * k) / 2;
      Array.from(text).forEach(function (ch, li) {
        const w = widths[li] * k;
        const cl = document.createElement('canvas');
        cl.width = Math.ceil(w) + 2; cl.height = H;
        const cg = cl.getContext('2d', { willReadFrequently: true });
        cg.font = '800 ' + fs + 'px Jost, "Segoe UI", Arial, sans-serif';
        cg.textBaseline = 'alphabetic'; cg.fillStyle = '#000';
        cg.fillText(ch, 0, base);
        const px = cg.getImageData(0, 0, cl.width, cl.height).data;
        let row = 0;
        for (let y = head + d * 0.5; y < H; y += d * 0.86, row++) {
          for (let gx = d * 0.5 + (row % 2 ? d * 0.5 : 0); gx < cl.width; gx += d) {
            const ix = Math.round(gx), iy = Math.round(y);
            if (px[(iy * cl.width + ix) * 4 + 3] > 140) {
              flowers.push({
                x: x + gx + u.rand(-d * 0.1, d * 0.1), y: y + u.rand(-d * 0.1, d * 0.1),
                r: d * u.rand(0.64, 0.82), n: u.pick([5, 5, 6, 8]), rot: u.rand(0, 6.28),
                col: u.pick(PETALS), mid: u.pick(CENTERS), leaf: Math.random() < 0.4 ? u.pick(LEAF) : null,
                la: u.rand(0, 6.28), seedAt: u.rand(0, seedMs), seedRot: u.rand(0, 3.14), lean: u.rand(-0.25, 0.25)
              });
            }
          }
        }
        x += w + gapRatio * 100 * k;
      });

      // Timeline: seeds appear, then the gardener walks across and waters.
      walkStart = seedMs + 800;
      const pw = gh * 0.5;
      tipOff = gh * 0.66; tipUp = gh * 0.5;
      speed = (W + pw * 2) / walkMs;                    // px per ms
      let last = 0;
      flowers.forEach(function (f) {
        f.tw = walkStart + (f.x - tipOff + pw) / speed; // moment the water reaches this seed
        f.t0 = f.tw + 1100;                             // sprout, then bloom
        last = Math.max(last, f.t0 + o.bloomMs);
      });
      endAt = Math.max(last, walkStart + walkMs) + 200;
      run(dpr);
    }

    /* ---------- the soil bed: rendered once ---------- */
    function makeBed(dpr) {
      const c = document.createElement('canvas');
      c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
      const g = c.getContext('2d');
      g.scale(dpr, dpr);
      const top = head - 6, rr = 22;
      const rect = function () {
        g.beginPath();
        g.moveTo(rr, top); g.lineTo(W - rr, top); g.quadraticCurveTo(W, top, W, top + rr);
        g.lineTo(W, H - rr); g.quadraticCurveTo(W, H, W - rr, H);
        g.lineTo(rr, H); g.quadraticCurveTo(0, H, 0, H - rr);
        g.lineTo(0, top + rr); g.quadraticCurveTo(0, top, rr, top);
        g.closePath();
      };
      rect();
      const gr = g.createLinearGradient(0, top, 0, H);
      gr.addColorStop(0, '#1d140e'); gr.addColorStop(0.18, '#34241a'); gr.addColorStop(1, '#2a1c13');
      g.fillStyle = gr; g.fill();
      g.save(); rect(); g.clip();
      // grain: clumps of lighter and darker soil
      const N = W * (H - top) / 40;
      for (let i = 0; i < N; i++) {
        const px = Math.random() * W, py = top + Math.random() * (H - top), sz = u.rand(0.6, 2.6);
        const t = Math.random();
        g.fillStyle = t > 0.62 ? 'rgba(120,88,62,' + u.rand(0.2, 0.55).toFixed(2) + ')' : 'rgba(8,4,2,' + u.rand(0.25, 0.6).toFixed(2) + ')';
        g.beginPath(); g.ellipse(px, py, sz, sz * 0.7, u.rand(0, 3), 0, 6.283); g.fill();
      }
      // depth: shadowed back edge, soft light pooling toward the middle
      const sh = g.createLinearGradient(0, top, 0, top + (H - top) * 0.3);
      sh.addColorStop(0, 'rgba(0,0,0,.55)'); sh.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = sh; g.fillRect(0, top, W, H);
      const gl = g.createRadialGradient(W / 2, H * 0.7, 0, W / 2, H * 0.7, W * 0.6);
      gl.addColorStop(0, 'rgba(255,190,120,.10)'); gl.addColorStop(1, 'rgba(255,190,120,0)');
      g.fillStyle = gl; g.fillRect(0, top, W, H);
      g.restore();
      // rim light
      g.strokeStyle = 'rgba(255,214,160,.16)'; g.lineWidth = 1.2;
      rect(); g.stroke();
      // blades of grass along the back edge
      for (let i = 0; i < W / 5; i++) {
        const bx = u.rand(4, W - 4), bh = u.rand(5, 13), lean = u.rand(-4, 4);
        g.strokeStyle = u.pick(['#2f6a3a', '#3f7a45', '#56934f', '#244f2e']);
        g.lineWidth = u.rand(0.9, 1.7); g.lineCap = 'round';
        g.beginPath(); g.moveTo(bx, top + 2); g.quadraticCurveTo(bx + lean * 0.4, top - bh * 0.5, bx + lean, top - bh); g.stroke();
      }
      return c;
    }

    /* ---------- seeds, wet soil, sprouts, blooms ---------- */
    function drawSeed(g, f, t) {
      const a = clamp01((t - f.seedAt) / 450);
      if (a <= 0) return;
      const sprout = clamp01((t - (f.t0 - 600)) / 600);
      if (sprout > 0.5) return;
      g.save();
      g.translate(f.x, f.y);
      g.globalAlpha = a * (1 - sprout / 0.5);
      const s = f.r * 0.2 * (0.5 + 0.5 * easeOutBack(a));
      // little mound + shadow
      g.fillStyle = 'rgba(0,0,0,.35)';
      g.beginPath(); g.ellipse(s * 0.2, s * 0.8, s * 2, s * 0.7, 0, 0, 6.283); g.fill();
      g.rotate(f.seedRot);
      const gr = g.createLinearGradient(-s * 1.4, -s, s * 1.4, s);
      gr.addColorStop(0, '#f1d9a0'); gr.addColorStop(0.55, '#b98a4a'); gr.addColorStop(1, '#6b4624');
      g.fillStyle = gr;
      g.beginPath();
      g.moveTo(-s * 1.5, 0); g.bezierCurveTo(-s * 0.6, -s * 1.2, s * 0.8, -s * 1.1, s * 1.5, 0);
      g.bezierCurveTo(s * 0.8, s * 1.1, -s * 0.6, s * 1.2, -s * 1.5, 0); g.fill();
      g.strokeStyle = 'rgba(70,40,15,.45)'; g.lineWidth = Math.max(.6, s * 0.12);
      g.beginPath(); g.moveTo(-s * 1.1, 0); g.lineTo(s * 1.2, 0); g.stroke();
      g.restore();
    }

    function drawWet(g, f, t) {
      const a = easeOutCubic(clamp01((t - f.tw) / 700));
      if (a <= 0) return;
      const rg = g.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * 1.05);
      rg.addColorStop(0, 'rgba(0,0,0,' + (0.5 * a) + ')');
      rg.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = rg;
      g.beginPath(); g.arc(f.x, f.y, f.r * 1.05, 0, 6.283); g.fill();
    }

    function drawSprout(g, f, t) {
      const q = easeOutCubic(clamp01((t - (f.t0 - 650)) / 650));
      if (q <= 0) return;
      const fade = 1 - clamp01((t - f.t0 - 150) / 350);
      if (fade <= 0) return;
      const hgt = f.r * 1.25 * q;
      const sway = Math.sin(t / 380 + f.la) * 0.06;
      g.save();
      g.translate(f.x, f.y);
      g.globalAlpha = fade;
      g.rotate(f.lean * 0.5 + sway);
      g.strokeStyle = '#4d9a52'; g.lineWidth = Math.max(1.3, f.r * 0.13); g.lineCap = 'round';
      g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(f.r * 0.08, -hgt * 0.5, 0, -hgt); g.stroke();
      const lf = f.r * 0.55 * q;
      [[-1, 0.62, -0.55], [1, 0.82, 0.55]].forEach(function (c) {
        const lg = g.createLinearGradient(0, 0, c[0] * lf * 1.6, 0);
        lg.addColorStop(0, '#3c8a48'); lg.addColorStop(1, '#7fcf7a');
        g.fillStyle = lg;
        g.save(); g.translate(0, -hgt * c[1]); g.rotate(c[2]);
        g.beginPath(); g.ellipse(c[0] * lf * 0.8, 0, lf, lf * 0.42, 0, 0, 6.283); g.fill();
        g.restore();
      });
      g.restore();
    }

    function drawFlower(g, f, p, t) {
      const open = easeOutBack(clamp01((p - 0.15) / 0.85));
      const bud = easeOutCubic(clamp01(p * 3));
      const sway = Math.sin(t / 900 + f.la) * 0.05 * clamp01(p);
      g.save();
      g.translate(f.x, f.y);
      if (f.leaf) {
        g.save();
        g.rotate(f.la);
        const lr = f.r * 0.95 * easeOutCubic(clamp01(p * 1.5));
        const lg = g.createLinearGradient(0, 0, lr * 1.6, 0);
        lg.addColorStop(0, f.leaf); lg.addColorStop(1, mix(f.leaf, 'w', 0.3));
        g.fillStyle = lg;
        g.beginPath(); g.ellipse(lr * 0.9, 0, lr * 0.8, lr * 0.3, 0, 0, 6.283); g.fill();
        g.restore();
      }
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

    /* ---------- the gardener ---------- */
    function drawGardener(g, gx, gy, t) {
      const h = gh;
      const ph = t / 190;
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

      // watering can, tilted forward
      g.save();
      g.translate(h * 0.32, -h * 0.64);
      g.rotate(0.2);
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

    function run(dpr) {
      const g = canvas.getContext('2d');
      const pw = gh * 0.5;
      const start = performance.now();
      let prev = start, acc = 0;
      (function frame(now) {
        if (!alive) return;
        const t = now - start;
        const dt = Math.min(0.05, (now - prev) / 1000);
        prev = now;
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        g.clearRect(0, 0, W, H);
        g.drawImage(bedImg, 0, 0, W, H);

        for (let i = 0; i < flowers.length; i++) drawWet(g, flowers[i], t);
        for (let i = 0; i < flowers.length; i++) { drawSeed(g, flowers[i], t); drawSprout(g, flowers[i], t); }
        for (let i = 0; i < flowers.length; i++) {
          const f = flowers[i], p = clamp01((t - f.t0) / o.bloomMs);
          if (p > 0) drawFlower(g, f, p, t);
        }

        // ripples where water lands
        for (let i = ripples.length - 1; i >= 0; i--) {
          const r = ripples[i];
          r.a -= dt * 2.2;
          if (r.a <= 0) { ripples.splice(i, 1); continue; }
          g.strokeStyle = 'rgba(190,225,255,' + (r.a * 0.5) + ')'; g.lineWidth = 1;
          g.beginPath(); g.ellipse(r.x, r.y, (1 - r.a) * 9 + 1, (1 - r.a) * 3.5 + 0.5, 0, 0, 6.283); g.stroke();
        }

        // gardener + water
        const gx = -pw + (t - walkStart) * speed;
        const walking = t >= walkStart && gx < W + pw * 1.5;
        if (walking) {
          drawGardener(g, gx, head - 8, t);
          const tipX = gx + tipOff, tipY = head - 8 - tipUp;
          acc += dt * 140;
          while (acc >= 1) {
            acc--;
            drops.push({ x: tipX + u.rand(-3, 3), y: tipY + u.rand(0, 3), vx: u.rand(14, 46), vy: u.rand(20, 80), land: head + u.rand(0.15, 0.95) * (H - head), len: u.rand(3, 6) });
          }
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

        if (t < endAt) raf = requestAnimationFrame(frame);
        else finish();
      })(start);
    }

    // Wait briefly for the bold font so the letter shapes are right, then start.
    const fonts = document.fonts && document.fonts.load ? document.fonts.load('800 100px Jost') : Promise.resolve();
    Promise.race([fonts, new Promise(function (r) { setTimeout(r, 1200); })]).then(build, build);

    return {
      done: done,
      destroy() { alive = false; cancelAnimationFrame(raf); canvas.remove(); }
    };
  };
})(window.App = window.App || {});
