/* SCENE – birthday words drift through the dark in hot pink (some big, some small, all readable), then gather into two tidy rows
   round the outline of a beating heart that frames her photo, with a short caption and a button to go on. Every word has its own fixed
   place on the outline, chosen so that it fits on the screen and never overlaps another word. */
(function (App) {
  const { CONFIG: C, u } = App;
  const WORDS = ['Happy Birthday', 'Pratima', 'Celebrate', 'Joy', 'Cheers', 'Smile', 'Sparkle', 'Wishes', 'Shine', 'Bloom', 'Blessings', 'Happy', 'Birthday', '♥'];
  const COLORS = ['255,70,140', '255,105,168', '255,143,186', '255,185,212', '255,226,238'];   // bright pinks: they stay readable on black
  const FONT = 'Jost, "Segoe UI", system-ui, -apple-system, Roboto, sans-serif';
  const RINGS = [1.0, 1.14];                          // the two rows of words, as scaled copies of the heart outline

  const T_FORM = 4200;      // words drift for this long before they start to gather (the first moment is under the fade)
  const T_SPREAD = 1000;    // the words leave one after another over this time …
  const T_MOVE = 1800;      // … and each takes this long to reach its place in the heart
  const TAU = Math.PI * 2;
  const clamp01 = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
  const ease = function (k) { return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; };
  const lerp = function (a, b, k) { return a + (b - a) * k; };
  const shuffle = function (list) { const a = list.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; };

  /** A point of the heart curve in "heart units" (x −16…16, y −14…14, y pointing down). */
  function heartPoint(t) {
    return {
      x: 16 * Math.pow(Math.sin(t), 3),
      y: -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) - 2.5
    };
  }

  /** Points along the outline at equal distances, so words keep an even pace all the way round (the curve is not evenly spaced by angle). */
  const PATH = (function () {
    const pts = [], cum = [0], N = 480;
    for (let i = 0; i <= N; i++) pts.push(heartPoint(i / N * TAU));
    for (let i = 1; i <= N; i++) cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
    return { pts: pts, cum: cum, len: cum[N] };
  })();
  function pointAt(frac) {                                   // frac 0…1 round the heart, wraps
    const d = (((frac % 1) + 1) % 1) * PATH.len, c = PATH.cum;
    let lo = 0, hi = c.length - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (c[m] <= d) lo = m; else hi = m; }
    const k = (d - c[lo]) / ((c[hi] - c[lo]) || 1);
    return { x: PATH.pts[lo].x + (PATH.pts[hi].x - PATH.pts[lo].x) * k, y: PATH.pts[lo].y + (PATH.pts[hi].y - PATH.pts[lo].y) * k };
  }

  /** The drifting words: plenty of them, in a real mix of small and big, every one clearly visible. */
  function makeParticles(n) {
    const list = [];
    for (let i = 0; i < n; i++) {
      const depth = Math.random();
      const dir = Math.random() < 0.5 ? -1 : 1;
      list.push({
        word: WORDS[i % WORDS.length],
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        nx: Math.random(), ny: Math.random(),
        vx: dir * (0.012 + depth * 0.05), vy: (Math.random() - 0.5) * 0.012,
        depth: depth, alpha: 0.6 + depth * 0.4,
        size0: 12 + depth * depth * 34,                         // mostly small and medium, a few big ones
        slot: null,                                              // the place in the heart it flies to (the rest fade away as the heart forms)
        delay: Math.random() * T_SPREAD,
        tw: Math.random() * TAU,
        sx: null, sy: null
      });
    }
    return list;
  }

  App.SceneManager.register('heart', {
    init(sec, ctx) {
      const T = C.text;
      ['assets/images/vintage-letter-tabletop.jpg', 'assets/images/lastposterimage.jpg'].forEach(function (src) { new Image().src = src; });   // fetched now, so the letter and the finale never wait for them
      sec.innerHTML = '<canvas class="heart-canvas" aria-hidden="true"></canvas>' +
        '<div class="heart-foot"><div class="heart-caption"><p class="hb-text"></p></div>' +
        '<button class="btn primary heart-next fade-up" type="button">' + u.esc(T.heartNext) + '</button></div>';
      const canvas = sec.querySelector('.heart-canvas');
      const foot = sec.querySelector('.heart-foot');
      const caption = sec.querySelector('.heart-caption');
      const nextBtn = sec.querySelector('.heart-next');
      u.hint(nextBtn);
      sec.querySelector('.hb-text').textContent = T.birthdayLine;
      const g = canvas.getContext('2d');
      const cutout = new Image();                      // her cut-out photo, shown inside the heart
      cutout.src = 'assets/images/pratima-selfie-cutout.png?v=2';
      const particles = makeParticles(App.isSmall() ? 90 : 150);

      let W = 0, H = 0, dpr = 1, hs = 10, cx = 0, cy = 0;
      const OUTER = RINGS[RINGS.length - 1];

      /** Gives every word on the outline its own fixed place: two rows of words, big and small, each one on the screen and clear of every other. */
      function layoutSlots() {
        const slots = [], boxes = [];
        const SIZES = [1.1, 1.3, 1.6, 2.0, 2.4];                                            // × hs: a real mix of small and big
        const BEAT = 1.05;                                                                   // the heart swells this much when it beats
        RINGS.forEach(function (ringR, ri) {
          const lenPx = PATH.len * hs * ringR;
          const pool = shuffle(WORDS);
          let pos = 0, pick = ri * 2, n = 0;
          while (pos < lenPx && n < 400) {
            n++;
            const hp = pointAt(pos / lenPx), hx = hp.x * ringR, hy = hp.y * ringR;           // this spot, in heart units
            const px = hx * hs, py = hy * hs;                                                // … and in pixels from the centre
            let placed = false, size = Math.max(11, hs * SIZES[(pick * 3 + 1) % SIZES.length]);
            for (let attempt = 0; attempt < 8 && !placed; attempt++) {
              const word = pool[(pick + attempt) % pool.length];
              const sz = Math.max(11, size * (word === '♥' ? 1.2 : 1) * Math.pow(0.88, attempt >> 1));       // a word that does not fit is tried a little smaller
              g.font = '600 ' + sz.toFixed(1) + 'px ' + FONT;
              const w = g.measureText(word).width + 4, h = sz * 1.08;
              const ax = cx + px * BEAT, ay = cy + py * BEAT;
              if (ax - w / 2 < 6 || ax + w / 2 > W - 6 || ay - h / 2 < 4 || ay + h / 2 > H - 4) continue;   // would be cut off by the screen
              if (boxes.some(function (q) { return Math.abs(q.x - px) < (q.w + w) / 2 + 3 && Math.abs(q.y - py) < (q.h + h) / 2 + 2; })) continue;   // would touch another word
              boxes.push({ x: px, y: py, w: w, h: h });
              slots.push({ word: word, size: sz, hx: hx, hy: hy, color: COLORS[(slots.length + ri * 2) % COLORS.length] });
              placed = true; pick += attempt + 1;
              pos += Math.max(h, w * 0.5);
            }
            if (!placed) { pos += Math.max(4, hs * 0.6); pick++; }
          }
        });
        const order = shuffle(particles.map(function (_, i) { return i; }));
        particles.forEach(function (p) { p.slot = null; });
        slots.forEach(function (sl, i) {
          const p = particles[order[i % particles.length]];
          p.slot = sl; p.word = sl.word; p.color = sl.color;
        });
      }

      function resize() {
        dpr = Math.min(2, window.devicePixelRatio || 1);
        W = sec.clientWidth; H = sec.clientHeight;
        canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        // the heart (with its two rows of words), the caption and the button share the height; hs = pixels per heart unit (the heart is about 33 units tall)
        const capH = Math.max(70, Math.min(104, H * 0.16)), footH = capH + 100;
        hs = Math.min(W * 0.47 / (16 * OUTER), (H - footH - 20) / (33 * OUTER));
        cx = W / 2; cy = (H - (33 * hs * OUTER + footH)) / 2 + 16.4 * hs * OUTER;
        foot.style.top = (cy + hs * 16.6 * OUTER + Math.max(6, H * 0.012)) + 'px';
        layoutSlots();
      }
      resize();
      ctx.on(window, 'resize', resize);

      const t0 = performance.now();
      const formedAt = T_FORM + T_SPREAD + T_MOVE;
      let raf = 0, leaving = false;

      function frame(now) {
        raf = requestAnimationFrame(frame);
        const t = now - t0;
        g.clearRect(0, 0, W, H);

        const formed = clamp01((t - T_FORM - T_SPREAD) / T_MOVE);
        const tf = t - formedAt;
        // a soft pink glow gathers behind the heart; once formed it beats
        const beat = tf > 0 ? 1 + 0.045 * Math.pow(Math.max(0, Math.sin(tf / 1000 * TAU / 1.15)), 3) : 1;
        if (formed > 0) {
          const rad = hs * 22 * beat;
          const glow = g.createRadialGradient(cx, cy, 0, cx, cy, rad);
          glow.addColorStop(0, 'rgba(255,40,120,' + (0.2 * formed).toFixed(3) + ')');
          glow.addColorStop(1, 'rgba(255,40,120,0)');
          g.fillStyle = glow; g.fillRect(cx - rad, cy - rad, rad * 2, rad * 2);
        }

        // her photo fills the hollow of the heart (clipped to a slightly smaller heart so the rows of words frame it)
        if (cutout.complete && cutout.naturalWidth) {
          const pa = clamp01((t - formedAt + 400) / 1400);
          if (pa > 0) {
            g.save(); g.beginPath();
            for (let a = 0; a <= 90; a++) {
              const q = heartPoint(a / 90 * TAU), px = cx + q.x * 0.9 * hs * beat, py = cy + q.y * 0.9 * hs * beat;
              if (a) g.lineTo(px, py); else g.moveTo(px, py);
            }
            g.closePath(); g.clip(); g.globalAlpha = pa;
            const bg = g.createRadialGradient(cx, cy - 3 * hs, 0, cx, cy - 3 * hs, 17 * hs);
            bg.addColorStop(0, '#3a0c22'); bg.addColorStop(1, '#14030b');
            g.fillStyle = bg; g.fillRect(cx - 18 * hs, cy - 18 * hs, 36 * hs, 36 * hs);
            const iw = 14 * hs * beat, ih = iw * cutout.naturalHeight / cutout.naturalWidth;   // a close-up selfie: her face sits in the middle of the heart
            g.drawImage(cutout, cx - iw / 2, cy - 7.3 * hs * beat, iw, ih);
            g.restore();
          }
        }
        g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
        const sc = Math.max(0.75, Math.min(W, H) / 760);
        const fade = clamp01(t / 900);

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          const start = T_FORM + p.delay;
          let x, y, size, alpha;
          if (t < start) {
            x = (((p.nx + p.vx * t / 1000) % 1) + 1) % 1 * W;
            y = (((p.ny + p.vy * t / 1000) % 1) + 1) % 1 * H;
            size = p.size0 * sc; alpha = p.alpha * fade;
          } else {
            if (p.sx === null) {
              p.sx = (((p.nx + p.vx * start / 1000) % 1) + 1) % 1 * W;
              p.sy = (((p.ny + p.vy * start / 1000) % 1) + 1) % 1 * H;
            }
            const k = ease(clamp01((t - start) / T_MOVE));
            if (p.slot) {                                    // this word takes its place in one of the two rows
              x = lerp(p.sx, cx + p.slot.hx * hs * beat, k);
              y = lerp(p.sy, cy + p.slot.hy * hs * beat, k);
              size = lerp(p.size0 * sc, p.slot.size, k);
              alpha = lerp(p.alpha, 0.97, k);
            } else {                                         // the spare words drift on and fade away as the heart forms
              x = (((p.nx + p.vx * Math.min(t, start + T_MOVE) / 1000) % 1) + 1) % 1 * W;
              y = (((p.ny + p.vy * Math.min(t, start + T_MOVE) / 1000) % 1) + 1) % 1 * H;
              size = p.size0 * sc; alpha = p.alpha * (1 - k);
            }
          }
          if (alpha < 0.02) continue;
          size = Math.max(11, size);
          g.font = '600 ' + size.toFixed(1) + 'px ' + FONT;
          g.lineWidth = Math.max(2, size * 0.2);             // a dark edge keeps every word crisp, even over the photo or another word
          g.strokeStyle = 'rgba(18,0,10,' + (alpha * 0.8).toFixed(3) + ')';
          g.shadowBlur = 0;
          g.strokeText(p.word, x, y);
          g.shadowColor = 'rgba(255,50,130,.8)'; g.shadowBlur = 6;
          g.fillStyle = 'rgba(' + p.color + ',' + alpha.toFixed(3) + ')';
          g.fillText(p.word, x, y);
        }
        g.shadowBlur = 0;
      }
      raf = requestAnimationFrame(frame);
      ctx.add(function () { cancelAnimationFrame(raf); });

      // the caption fades in as the heart completes, then the button to go on
      ctx.later(function () { caption.classList.add('in'); }, formedAt - 200);
      ctx.show(nextBtn, formedAt + 1500);

      // on to the cake when she presses the button (go() refuses while a transition is still running, so keep trying)
      ctx.on(nextBtn, 'click', function () {
        if (leaving || nextBtn.disabled) return;
        nextBtn.disabled = true;
        (function next() {
          if (leaving) return;
          App.SceneManager.go('cake', { mode: 'black', duration: 1100, hold: 250 }).then(function (ok) {
            if (ok) leaving = true; else ctx.later(next, 150);
          });
        })();
      });
    }
  });
})(window.App = window.App || {});
