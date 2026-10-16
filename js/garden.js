/* SCENE 4 – The garden (also exports App.Garden.build for scene 5).
   A summer field under a blue sky with the sun high up. Hills of flowers roll back to the horizon (painted once on a
   canvas), the field in front is built from the real flower photographs, shrinking row by row with distance. */
(function (App) {
  const { CONFIG: C, u, FX } = App;

  const HORIZON = 50;                 // % of the scene height where the flat field meets the hills
  const NEAR_ROWS = 3;                // only the closest rows sway plant by plant; the far ones sway as a whole
  const S_MAX = 1.3;                  // size of the closest row (1 = the base unit)
  const S_DOM = 0.1;                  // rows smaller than this are painted on the canvas, larger ones are real <img>s

  /* Colours of the tiny flowers on the far hills. */
  const PALETTE = {
    sunflower: { petals: ['#f5b800', '#f9c80e', '#eaa400', '#ffd43b', '#f0a30a', '#fbbf1a'], rare: '#b3261e', rareP: 0.07, center: '#4a2a0c' },
    rose: { petals: ['#c2223a', '#d63b52', '#a81c33', '#e45a73', '#b01f3b'], rare: '#f2a1b4', rareP: 0.12, center: '#6b1020' }
  };
  const HAZE = '140,128,168';         // the dusky violet of far-away air

  /* Time slicing: while the scenery is painted in the background, the painters are generators that call over() and
     yield, so the page can draw a frame in between and never stalls. With no budget set (sliceEnd = Infinity) they run through at once. */
  let sliceEnd = Infinity;
  const over = function () { return performance.now() > sliceEnd; };
  function runSync(it, input) {                                     // paint everything now (the garden was opened before it was ready)
    for (;;) {
      const r = it.next(input);
      input = undefined;
      if (r.done) return;
      if (r.value && r.value.then) { r.value.then(function (v) { runSync(it, v); }); return; }
    }
  }
  const rest = function () { return new Promise(function (r) { setTimeout(r, 8); }); };
  async function runSliced(it) {                                    // paint ~8 ms at a time, with a rest in between
    let input;
    for (;;) {
      sliceEnd = performance.now() + 8;
      let r;
      try { r = it.next(input); } finally { sliceEnd = Infinity; }
      input = undefined;
      if (r.done) return;
      if (r.value && r.value.then) input = await r.value; else await rest();
    }
  }

  const imgCache = {};
  function loadImg(src) {
    return imgCache[src] || (imgCache[src] = new Promise(function (resolve) {
      const i = new Image();
      i.onload = function () { resolve(i); };
      i.onerror = function () { resolve(null); };
      i.src = src;
    }));
  }

  function look(flower) { return C.gardenFlowers[flower] || C.gardenFlowers.sunflower; }
  function unitSize() { return Math.min(window.innerWidth * 0.23, window.innerHeight * 0.19, 140); }

  /** Picks an index according to the weights. */
  function pickWeighted(rng, weights) {
    const r = rng();
    let acc = 0;
    for (let i = 0; i < weights.length; i++) { acc += weights[i]; if (r < acc) return i; }
    return weights.length - 1;
  }

  /* ---------- the DOM field: real photographs, far rows first ---------- */
  function fieldHTML(rng, flower, small) {
    const L = look(flower);
    const vw = window.innerWidth;
    const unit = unitSize();
    const N = small ? 9 : 10;
    const k = (HORIZON + 2) / S_MAX;                // screen distance below the horizon grows with size
    let html = '';
    for (let i = 0; i < N; i++) {
      const s = S_DOM * Math.pow(S_MAX / S_DOM, i / (N - 1));
      const bottom = HORIZON - k * s;               // % from the bottom of the scene
      const w = unit * s * L.wk;                    // flower width in px
      const near = i >= N - NEAR_ROWS;
      const gap = k * s * 0.36;                     // depth jitter so a row isn't ruler-straight
      const n = Math.min(small ? 90 : 140, Math.round(vw * 1.06 / (w * 0.95)));
      const plants = [];
      for (let j = 0; j < n; j++) {
        plants.push({
          x: -3 + (j + 0.15 + rng() * 0.7) / n * 106,
          dy: (rng() - 0.35) * gap,
          pw: w * (0.85 + rng() * 0.3),
          d: i / N * 2.2 + rng() * 1.3,
          flip: rng() < 0.5 ? -1 : 1,
          tilt: (rng() - 0.5) * 7,
          v: pickWeighted(rng, L.weights),
          sw: 3.2 + rng() * 2.6, swd: -rng() * 5, sa: 1 + rng() * 1.4
        });
      }
      plants.sort(function (p, q) { return q.dy - p.dy; });            // higher (further) ones first
      html += '<div class="g-row' + (near ? ' near' : '') + '" style="bottom:' + bottom.toFixed(2) + '%;height:' + (w * L.ar * 1.2).toFixed(0) +
        'px;--rs:' + (4 + rng() * 3).toFixed(1) + 's;--rd:-' + (rng() * 6).toFixed(1) + 's">';
      plants.forEach(function (p) {
        html += '<div class="plant" style="left:' + p.x.toFixed(1) + '%;bottom:' + p.dy.toFixed(2) + 'vh;width:' + p.pw.toFixed(1) + 'px;--d:' + p.d.toFixed(2) + 's;--fx:' + p.flip + ';--tilt:' + p.tilt.toFixed(1) + 'deg">' +
          '<div class="pl"' + (near ? ' style="--sw:' + p.sw.toFixed(2) + 's;--swd:' + p.swd.toFixed(2) + 's;--sa:' + p.sa.toFixed(2) + 'deg"' : '') + '>' +
          '<img src="' + u.esc(L.images[p.v]) + '" alt="" draggable="false" decoding="async"></div></div>';
      });
      html += '</div>';
      if (!near && i < N - NEAR_ROWS - 1) {         // blue haze between the distant rows
        html += '<div class="g-fog" style="bottom:' + bottom.toFixed(2) + '%;height:' + (HORIZON - bottom).toFixed(2) + '%"></div>';
      }
    }
    return html;
  }

  /* ---------- canvas painting ---------- */
  function ridge(x, W, base, amp, seed) {
    const t = x / W * 6.2832;
    return base + amp * (Math.sin(t * 1.3 + seed) * 0.55 + Math.sin(t * 2.7 + seed * 1.7) * 0.3 + Math.sin(t * 5.1 + seed * 2.3) * 0.15);
  }

  function dot(g, x, y, r, pal, rng) {
    g.fillStyle = rng() < pal.rareP ? pal.rare : pal.petals[(rng() * pal.petals.length) | 0];
    g.beginPath(); g.arc(x, y, r, 0, 6.2832); g.fill();
    if (r > 1.1) { g.fillStyle = pal.center; g.beginPath(); g.arc(x, y + r * 0.05, r * 0.46, 0, 6.2832); g.fill(); }
  }

  /** One rolling hill, back to front: meadow colour, patches of tiny flowers, trees, then a veil of haze. */
  function* hill(g, W, H, horizonY, spec, pal, rng) {
    const step = 4, ys = [];
    for (let x = 0; x <= W + step; x += step) ys.push(ridge(x, W, H * spec.base, H * spec.amp, spec.seed));
    const ridgeAt = function (x) { return ys[Math.max(0, Math.min(ys.length - 1, Math.round(x / step)))]; };
    const yBottom = horizonY + 4;
    const yTop = Math.min.apply(null, ys);
    const body = function () {
      g.beginPath(); g.moveTo(0, yBottom);
      for (let i = 0; i < ys.length; i++) g.lineTo(i * step, ys[i]);
      g.lineTo(W + step, yBottom); g.closePath();
    };
    body();
    const gr = g.createLinearGradient(0, yTop, 0, yBottom);
    gr.addColorStop(0, spec.top); gr.addColorStop(1, spec.bottom);
    g.fillStyle = gr; g.fill();

    if (spec.density > 0) {
      g.save(); body(); g.clip();
      for (let y = yTop; y < yBottom; ) {
        if (over()) yield;
        const sz = spec.size[0] + (spec.size[1] - spec.size[0]) * (y - yTop) / (yBottom - yTop);
        for (let x = rng() * sz * 2; x < W; x += sz * 2.1) {
          if (y < ridgeAt(x) + sz) continue;
          const n = Math.sin(x * 0.007 + spec.seed * 3 + y * 0.02) * Math.cos(x * 0.0031 - spec.seed + y * 0.045);
          if (rng() > Math.max(0, Math.min(1, spec.density + n * 0.5))) continue;   // patches of meadow between fields
          dot(g, x + (rng() - 0.5) * sz, y + (rng() - 0.5) * sz * 0.6, sz, pal, rng);
        }
        y += sz * 1.5;
      }
      g.restore();
    }

    for (let i = 0; i < (spec.trees || 0); i++) {          // little clumps of trees along the ridge
      const tx = rng() * W, ty = ridgeAt(tx) + 1, sz = 2 + rng() * 3;
      for (let j = 0; j < 3; j++) {
        const cx = tx + j * sz * 0.9, cy = ty - sz * (0.5 + (j % 2) * 0.25);
        g.fillStyle = '#41603a';
        g.beginPath(); g.ellipse(cx, cy, sz * 0.55, sz * 0.95, 0, 0, 6.2832); g.fill();
        g.fillStyle = 'rgba(120,160,95,.55)';
        g.beginPath(); g.ellipse(cx + sz * 0.12, cy - sz * 0.2, sz * 0.3, sz * 0.6, 0, 0, 6.2832); g.fill();
      }
    }

    if (spec.haze > 0) {
      body();
      const hz = g.createLinearGradient(0, yTop, 0, yBottom);
      hz.addColorStop(0, 'rgba(' + HAZE + ',' + spec.haze + ')'); hz.addColorStop(1, 'rgba(' + HAZE + ',' + (spec.haze * 0.35) + ')');
      g.fillStyle = hz; g.fill();
    }
  }

  const HILLS = [
    { base: 0.30, amp: 0.035, seed: 0.7, top: '#1f2d62', bottom: '#4b4c86', density: 0, haze: 0 },                                    // far mountains
    { base: 0.345, amp: 0.03, seed: 2.1, top: '#566f76', bottom: '#86966f', density: 0.55, size: [0.9, 1.3], haze: 0.42, trees: 22 },
    { base: 0.395, amp: 0.035, seed: 3.4, top: '#617f69', bottom: '#8ea65f', density: 0.78, size: [1.3, 1.9], haze: 0.28, trees: 12 },
    { base: 0.44, amp: 0.03, seed: 5.2, top: '#7fa05f', bottom: '#9db355', density: 0.92, size: [1.9, 2.7], haze: 0.16 },
    { base: 0.478, amp: 0.015, seed: 6.5, top: '#789a50', bottom: '#95a94c', density: 0.97, size: [2.6, 3.6], haze: 0.08 }
  ];

  /**
   * The scenery: hills, the floor, grass blades, then the far rows of real flowers. A generator, so it can be painted a
   * few milliseconds at a time. It yields a promise while the flower photos load.
   */
  function* scenery(cv, W, H, dpr, rng, flower) {
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    const g = cv.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const pal = PALETTE[flower] || PALETTE.sunflower;
    const horizonY = H * (1 - HORIZON / 100), fh = H - horizonY;

    for (let i = 0; i < HILLS.length; i++) yield* hill(g, W, H, horizonY, HILLS[i], pal, rng);

    // the floor: hazy and golden far away, deep green close up
    const gr = g.createLinearGradient(0, horizonY, 0, H);
    gr.addColorStop(0, '#b9c77a'); gr.addColorStop(0.07, '#9db55a'); gr.addColorStop(0.25, '#7a9a3e'); gr.addColorStop(0.6, '#4f7229'); gr.addColorStop(1, '#2c4a1b');
    g.fillStyle = gr; g.fillRect(0, horizonY, W, fh);
    for (let i = 0; i < 160; i++) {                                // soft light and shade on the ground
      const t = Math.pow(rng(), 1.4), y = horizonY + t * fh, rx = (40 + rng() * 90) * (0.2 + t * 1.6);
      g.fillStyle = rng() < 0.5 ? 'rgba(25,50,12,.06)' : 'rgba(215,205,115,.06)';
      g.beginPath(); g.ellipse(rng() * W, y, rx, rx * 0.2, 0, 0, 6.2832); g.fill();
    }
    yield;

    g.lineCap = 'round';
    const greens = ['rgba(58,98,32,.55)', 'rgba(88,128,44,.5)', 'rgba(36,72,22,.55)', 'rgba(130,150,60,.45)'];
    for (let i = 0; i < 9000; i++) {                               // blades, bigger the closer they are
      if ((i & 127) === 0 && over()) yield;
      const t = Math.pow(rng(), 1.8), x = rng() * W, y = horizonY + t * fh, len = 2 + t * 22, lean = (rng() - 0.5) * len * 0.8;
      g.strokeStyle = greens[(rng() * greens.length) | 0]; g.lineWidth = 0.6 + t * 1.4;
      g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + lean * 0.3, y - len * 0.6, x + lean, y - len); g.stroke();
    }

    // far rows of real flowers (tiny), then a veil of haze over them
    const L = look(flower), unit = unitSize();
    const imgs = yield Promise.all(L.images.map(loadImg));
    const k = (HORIZON + 2) / S_MAX, rows = 12;
    g.imageSmoothingQuality = 'high';
    for (let i = 0; i < rows; i++) {
      const sc = 0.012 * Math.pow(0.092 / 0.012, i / (rows - 1));
      const yBase = H * (1 - (HORIZON - k * sc) / 100);
      const w = unit * sc * L.wk, h = w * L.ar, n = Math.ceil(W * 1.1 / (w * 0.9)), gap = H * k * sc * 0.36 / 100;
      const spots = [];
      for (let j = 0; j < n; j++) spots.push({ x: -0.05 * W + (j + rng()) / n * 1.1 * W, y: yBase + (0.35 - rng()) * gap, v: pickWeighted(rng, L.weights) });
      spots.sort(function (a, b) { return a.y - b.y; });
      for (let q = 0; q < spots.length; q++) {
        if ((q & 63) === 0 && over()) yield;
        const p = spots[q], img = imgs[p.v];
        if (w < 4 || !img) { dot(g, p.x, p.y - h * 0.8, Math.max(0.8, w * 0.4), pal, rng); continue; }
        g.fillStyle = 'rgba(20,35,8,.26)';
        g.beginPath(); g.ellipse(p.x - w * 0.12, p.y, w * 0.34, w * 0.07, 0, 0, 6.2832); g.fill();
        g.drawImage(img, p.x - w / 2, p.y - h, w, h);
      }
    }
    const y0 = horizonY - 2, y1 = H * (1 - (HORIZON - k * S_DOM) / 100);
    const hz = g.createLinearGradient(0, y0, 0, y1);
    hz.addColorStop(0, 'rgba(' + HAZE + ',0)'); hz.addColorStop(0.2, 'rgba(' + HAZE + ',.22)'); hz.addColorStop(1, 'rgba(' + HAZE + ',0)');
    g.fillStyle = hz; g.fillRect(0, y0, W, y1 - y0);
  }

  /** Blades of grass in the foreground, standing in front of the nearest flowers. */
  function paintFront(cv, W, H, dpr, rng) {
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    const g = cv.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.lineCap = 'round';
    const greens = ['#3f7a2a', '#4f8f33', '#2f6320', '#63a042', '#35702a'];
    for (let i = 0; i < Math.round(W * 0.9); i++) {
      const x = rng() * W, len = 26 + Math.pow(rng(), 2.2) * (H - 30), lean = (rng() - 0.5) * len * 0.5;
      g.strokeStyle = greens[(rng() * greens.length) | 0]; g.lineWidth = 1.8 + rng() * 2.4; g.globalAlpha = 0.85;
      g.beginPath(); g.moveTo(x, H + 4); g.quadraticCurveTo(x + lean * 0.2, H - len * 0.55, x + lean, H - len); g.stroke();
    }
    g.globalAlpha = 1;
    const sh = g.createLinearGradient(0, H * 0.4, 0, H);
    sh.addColorStop(0, 'rgba(10,25,5,0)'); sh.addColorStop(1, 'rgba(10,25,5,.5)');
    g.fillStyle = sh; g.fillRect(0, 0, W, H);
  }

  /** A scatter of stars in the upper sky, brighter and rarer the lower they sit. */
  function paintStars(cv, W, H, dpr, rng) {
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    const g = cv.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    for (let i = 0; i < 260; i++) {
      const x = rng() * W, y = Math.pow(rng(), 1.5) * H;
      if (Math.hypot(x - W * 0.82, y - H * 0.27) < Math.min(W, H) * 0.3) { rng(); rng(); continue; }   // keep the sun's halo clear
      const big = rng() < 0.07, r = big ? 1.1 + rng() * 0.8 : 0.35 + rng() * 0.7;
      g.fillStyle = 'rgba(255,' + (240 + ((rng() * 15) | 0)) + ',' + (215 + ((rng() * 40) | 0)) + ',' + (0.35 + rng() * 0.6) * (1 - y / H * 0.7) + ')';
      g.beginPath(); g.arc(x, y, r, 0, 6.2832); g.fill();
      if (big) {
        const gl = g.createRadialGradient(x, y, 0, x, y, r * 5);
        gl.addColorStop(0, 'rgba(255,240,210,.35)'); gl.addColorStop(1, 'rgba(255,240,210,0)');
        g.fillStyle = gl; g.beginPath(); g.arc(x, y, r * 5, 0, 6.2832); g.fill();
      }
    }
  }

  /** A few soft cumulus clouds on a wide strip that drifts slowly across the sky. */
  function paintClouds(cv, W, H, dpr, rng) {
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    const g = cv.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    for (let c = 0; c < 5; c++) {
      const cx = rng() * W, cy = H * (0.2 + rng() * 0.55), size = 90 + rng() * 150;
      for (let i = 0; i < 18; i++) {
        const px = cx + (rng() - 0.5) * size * 1.7, py = cy + (rng() - 0.5) * size * 0.3 - (1 - Math.abs(px - cx) / (size * 0.85)) * size * 0.12;
        const r = size * (0.22 + rng() * 0.26) * (1 - Math.min(0.5, Math.abs(px - cx) / (size * 1.6)));
        const rg = g.createRadialGradient(px, py - r * 0.2, 0, px, py, r);
        rg.addColorStop(0, 'rgba(175,160,200,.8)'); rg.addColorStop(0.6, 'rgba(120,115,170,.42)'); rg.addColorStop(1, 'rgba(90,95,150,0)');
        g.fillStyle = rg; g.beginPath(); g.arc(px, py, r, 0, 6.2832); g.fill();
      }
      for (let i = 0; i < 5; i++) {                                // soft shaded underside
        const ux = cx + (rng() - 0.5) * size, uy = cy + size * 0.14, ur = size * (0.3 + rng() * 0.3);
        g.save(); g.translate(ux, uy); g.scale(1, 0.3);
        const ug = g.createRadialGradient(0, 0, 0, 0, 0, ur);
        ug.addColorStop(0, 'rgba(20,30,80,.22)'); ug.addColorStop(1, 'rgba(20,30,80,0)');
        g.fillStyle = ug; g.beginPath(); g.arc(0, 0, ur, 0, 6.2832); g.fill();
        g.restore();
      }
    }
  }

  /* ---------- painting ahead of time ----------
     The scenery (hills, grass, clouds, stars) is the slow part of the garden. While the flower choice is on screen it is
     painted in the background, one small step per timer tick, so that choosing a flower needs almost no waiting. */
  const painted = {};                     // key -> { seed, back, stars, clouds, front }: finished canvases, ready to be copied
  const pending = {};
  function sizes() { return { W: window.innerWidth, H: window.innerHeight, dpr: Math.min(window.devicePixelRatio || 1, 1.5) }; }
  function keyOf(flower, seed, z) { return [flower, seed, z.W, z.H, z.dpr].join('|'); }
  function paintRngs(seed) { return { back: u.mulberry(seed + 7), stars: u.mulberry(seed + 8), clouds: u.mulberry(seed + 9), front: u.mulberry(seed + 10) }; }
  function copyCanvas(dst, src) { dst.width = src.width; dst.height = src.height; dst.getContext('2d').drawImage(src, 0, 0); }

  let chain = Promise.resolve();          // gardens are painted one after another, never two at once
  function prewarm(flower, seed) {
    seed = seed || 1;
    if (!C.gardenFlowers[flower]) return;
    const z = sizes(), key = keyOf(flower, seed, z);
    if (painted[key] || pending[key]) return;
    pending[key] = true;
    chain = chain.then(async function () {
      const r = paintRngs(seed), c = { seed: seed, back: document.createElement('canvas'), stars: document.createElement('canvas'), clouds: document.createElement('canvas'), front: document.createElement('canvas') };
      await rest();
      await runSliced(scenery(c.back, z.W, z.H, z.dpr, r.back, flower));
      paintStars(c.stars, z.W, Math.round(z.H * 0.52), z.dpr, r.stars); await rest();
      paintClouds(c.clouds, Math.round(z.W * 1.3), Math.round(z.H * 0.46), z.dpr, r.clouds); await rest();
      paintFront(c.front, z.W, Math.round(z.H * 0.18), z.dpr, r.front);
      Object.keys(painted).forEach(function (k) { if (painted[k].seed !== seed) delete painted[k]; });   // forget an earlier run's scenery
      painted[key] = c;
    }).catch(function (e) { console.warn(e); }).then(function () { delete pending[key]; });
  }

  const Garden = {
    prewarm: prewarm,
    /**
     * Garden.build(parent, { flower, animate, seed })
     * animate=true starts with the near flowers not yet grown; call grow() to let them rise.
     * animate=false shows the full field at once (used by the photo scene).
     */
    build(parent, o) {
      const flower = C.gardenFlowers[o.flower] ? o.flower : 'sunflower';
      const seed = o.seed || 1;
      const rng = u.mulberry(seed);
      const small = App.isSmall();
      const root = document.createElement('div');
      root.className = 'garden';

      root.innerHTML =
        '<div class="g-sky"></div><canvas class="g-stars"></canvas><canvas class="g-clouds"></canvas>' +
        '<div class="g-sun"></div><div class="g-rays"></div><div class="g-sun-disc"></div>' +
        '<canvas class="g-back"></canvas>' +
        '<div class="g-rows' + (o.animate ? ' pre' : '') + '">' + fieldHTML(rng, flower, small) + '</div>' +
        '<div class="g-dusk"></div><canvas class="g-front"></canvas><div class="g-glow"></div>';
      parent.appendChild(root);

      const z = sizes(), done = painted[keyOf(flower, seed, z)];
      const cv = { back: root.querySelector('.g-back'), stars: root.querySelector('.g-stars'), clouds: root.querySelector('.g-clouds'), front: root.querySelector('.g-front') };
      if (done) {                                                    // painted ahead of time: just copy it in
        Object.keys(cv).forEach(function (k) { copyCanvas(cv[k], done[k]); });
      } else {                                                       // not ready (e.g. opened directly): paint now
        const r = paintRngs(seed);
        runSync(scenery(cv.back, z.W, z.H, z.dpr, r.back, flower));
        paintStars(cv.stars, z.W, Math.round(z.H * 0.52), z.dpr, r.stars);
        paintClouds(cv.clouds, Math.round(z.W * 1.3), Math.round(z.H * 0.46), z.dpr, r.clouds);
        paintFront(cv.front, z.W, Math.round(z.H * 0.18), z.dpr, r.front);
      }

      return {
        root: root,
        grow() { const r = root.querySelector('.g-rows'); r.classList.remove('pre'); r.classList.add('grow'); }
      };
    }
  };
  App.Garden = Garden;

  /* ---------- The scene ---------- */
  App.SceneManager.register('garden', {
    init(sec, ctx) {
      const flower = App.state.flower || 'sunflower';
      const g = Garden.build(sec, { flower: flower, animate: true, seed: App.state.gardenSeed });
      sec.classList.add('dawn');

      const fx = FX.field(sec, { motes: 40, rgb: '255,236,170', size: 0.9 });
      ctx.add(fx.destroy);
      sec.querySelector('.fx-canvas').classList.add('late');

      const msg = document.createElement('p');
      msg.className = 'garden-msg fade-up';
      msg.textContent = C.text.gardenMessage;
      sec.appendChild(msg);

      (async function () {
        g.grow();                         // the daylit field is already there; the flowers in front rise into it straight away
        await ctx.sleep(App.reduced ? 4000 : 6000);
        msg.classList.add('in');
        await ctx.sleep(4200);
        App.SceneManager.go('photo', { mode: 'cross', duration: 2800 });
      })();
    }
  });
})(window.App);
