/* SCENE – a heart made of thousands of tiny pink particles. A cloud of sparks drifts in the dark, then the heart is drawn slowly along
   its outline, particle after particle. Her photo appears inside it, slightly blurred at first, then clear, and a soft golden glow
   follows. Small golden and pink sparkles come and go round the heart, a few pink petals drift down from above, the heart pulses,
   and last of all the caption is written out as if by hand, followed by the two buttons. */
(function (App) {
  const { CONFIG: C, u, FX } = App;
  // hot pinks, lighter pinks and a few white-pink sparks (drawn additively, so where they crowd together they glow)
  const COLORS = [[255, 74, 140], [255, 104, 160], [255, 140, 188], [255, 176, 208], [255, 215, 232], [240, 52, 118]];
  const SPARK_COLORS = [[255, 214, 120], [255, 226, 150], [255, 150, 190], [255, 196, 222], [255, 240, 200]];     // golden and pink
  const PETAL_COLORS = [[168, 14, 38], [196, 24, 48], [214, 40, 62], [150, 10, 32], [226, 62, 84], [255, 120, 150]];   // mainly red rose, with the odd pink one
  const TAU = Math.PI * 2;

  const T_DRAW = 4200;       // the outline is started by the first particle and finished by the last one over this time …
  const T_PHOTO = 5600;      // … her photo begins to appear a little before the drawing ends (blurred) …
  const BLUR_MS = 1500;      // … it fades in, blurred, over this time …
  const CLEAR_AT = 1000;     // … from this moment it starts to become clear …
  const CLEAR_MS = 1700;     // … taking this long, and the soft golden glow follows …
  const GLOW_AT = 2300, GLOW_MS = 2000;
  const T_CAPTION = 8800;    // then the caption is written out, line by line
  const T_BUTTONS = 12400;   // and last the buttons
  const MAX_PETALS = 8, MAX_SPARKS = 26;

  const clamp01 = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
  const easeIO = function (k) { return k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; };      // like power2.inOut
  const easeOut = function (k) { return 1 - Math.pow(1 - k, 3); };
  const lerp = function (a, b, k) { return a + (b - a) * k; };
  const gauss = function () { return (Math.random() + Math.random() + Math.random() - 1.5) / 1.5; };       // −1…1, bunched round 0
  const rnd = function (a, b) { return a + Math.random() * (b - a); };

  /** A point of the heart curve in "heart units" (x −16…16, y −14…14, y pointing down). */
  function heartPoint(t) {
    return {
      x: 16 * Math.pow(Math.sin(t), 3),
      y: -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) - 2.5
    };
  }

  /** Points along the outline at equal distances, so particles are spread evenly all the way round (the curve is not evenly spaced by angle). */
  const PATH = (function () {
    const pts = [], cum = [0], N = 480;
    for (let i = 0; i <= N; i++) pts.push(heartPoint(i / N * TAU));
    for (let i = 1; i <= N; i++) cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
    return { pts: pts, cum: cum, len: cum[N] };
  })();
  function pointAt(frac) {                                   // frac 0…1 round the heart, starting at the dip at the top
    const d = clamp01(frac) * PATH.len, c = PATH.cum;
    let lo = 0, hi = c.length - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (c[m] <= d) lo = m; else hi = m; }
    const k = (d - c[lo]) / ((c[hi] - c[lo]) || 1);
    return { x: PATH.pts[lo].x + (PATH.pts[hi].x - PATH.pts[lo].x) * k, y: PATH.pts[lo].y + (PATH.pts[hi].y - PATH.pts[lo].y) * k };
  }

  /** The particles: each has a place on the outline (in heart units), a place in the starting cloud, and its own moment and speed. */
  function makeParticles(n, fast) {
    const list = [];
    for (let i = 0; i < n; i++) {
      const frac = i / n, hp = pointAt(frac);
      const off = gauss() * 0.125 + 0.05;                               // spread across the width of the band: dense in the middle, soft at the edges
      const ang = Math.random() * TAU, rad = 6 + Math.pow(Math.random(), 0.7) * 24;
      list.push({
        tx: hp.x * (1 + off) + gauss() * 0.5, ty: hp.y * (1 + off) + gauss() * 0.5,       // where it ends up
        sx: Math.cos(ang) * rad * 1.1, sy: Math.sin(ang) * rad * 0.95 - 1.5,                 // where it starts (the cloud, round the heart)
        bend: (Math.random() - 0.5) * 9,                        // how far its flight curves sideways
        delay: fast ? 0 : frac * T_DRAW + Math.random() * 380,
        dur: fast ? 1 : 1500 + Math.random() * 1500,
        size: 0.9 + Math.pow(Math.random(), 2.2) * 2.1,
        ci: Math.floor(Math.random() * Math.random() * COLORS.length * 1.6) % COLORS.length,
        a: 0.55 + Math.random() * 0.45,
        tw: Math.random() * TAU, tws: 1.4 + Math.random() * 2.6
      });
    }
    return list;
  }

  /** Dust: a dense cloud of small drifting sparks, there from the first moment; they thin out and are gone as the heart is completed. */
  function makeDust(n) {
    const list = [];
    for (let i = 0; i < n; i++) {
      const ang = Math.random() * TAU, rad = Math.pow(Math.random(), 0.75) * 27;
      list.push({ x: Math.cos(ang) * rad * 1.15, y: Math.sin(ang) * rad * 0.95 - 1.5, ph: Math.random() * TAU, sp: 0.4 + Math.random() * 1.1, am: 0.35 + Math.random() * 1.1, size: 0.8 + Math.pow(Math.random(), 2.4) * 1.9, a: 0.35 + Math.random() * 0.6, ci: Math.floor(Math.random() * 4) });
    }
    return list;
  }

  App.SceneManager.register('heart', {
    init(sec, ctx) {
      const T = C.text;
      ['assets/images/vintage-letter-tabletop.jpg', 'assets/images/lastposterimage.jpg'].forEach(function (src) { new Image().src = src; });   // fetched now, so the letter and the finale never wait for them
      sec.innerHTML = '<canvas class="heart-canvas" aria-hidden="true"></canvas>' +
        '<div class="heart-caption"><p class="hb-text"></p></div>' +
        '<button class="btn primary heart-next fade-up" type="button">' + u.esc(T.heartNext) + '</button>' +
        '<button class="btn primary heart-flowers fade-up" type="button">' + u.esc(T.heartFlowers) + '</button>';
      const canvas = sec.querySelector('.heart-canvas');
      const caption = sec.querySelector('.heart-caption');
      const nextBtn = sec.querySelector('.heart-next');
      const flowerBtn = sec.querySelector('.heart-flowers');
      // the same glass-button look as the other call-to-action buttons, but without the pointing hand
      nextBtn.classList.add('cta');
      flowerBtn.classList.add('cta');
      // the caption is two lines; each is written out from left to right, the second after the first (see .hw-line in finale.css)
      sec.querySelector('.hb-text').innerHTML = String(T.birthdayLine).split('\n').map(function (line, i) {
        return '<span class="hw-line" style="--d:' + (i * 1.8).toFixed(1) + 's">' + u.esc(line) + '</span>';
      }).join('');
      const g = canvas.getContext('2d');
      const cutout = new Image();                      // her cut-out photo, shown inside the heart
      let blurred = null;                              // a soft, out-of-focus copy of it (made small, then enlarged), for the first moments
      function makeBlurred() {
        if (!cutout.naturalWidth) return;
        const w = cutout.naturalWidth, h = cutout.naturalHeight;
        const a = document.createElement('canvas'); a.width = Math.max(8, Math.round(w / 11)); a.height = Math.max(8, Math.round(h / 11));
        a.getContext('2d').drawImage(cutout, 0, 0, a.width, a.height);
        const b = document.createElement('canvas'); b.width = Math.max(8, Math.round(w / 3.5)); b.height = Math.max(8, Math.round(h / 3.5));
        const bg = b.getContext('2d'); bg.imageSmoothingEnabled = true; bg.imageSmoothingQuality = 'high'; bg.drawImage(a, 0, 0, b.width, b.height);
        blurred = b;
      }
      cutout.onload = makeBlurred;
      cutout.src = 'assets/images/pratima-selfie-cutout.png?v=2';
      if (cutout.complete) makeBlurred();
      const fast = App.reduced;                        // for people who asked for less motion the heart simply appears
      const particles = makeParticles(App.isSmall() ? 5800 : 9200, fast);
      const buckets = COLORS.map(function () { return []; });
      particles.forEach(function (p) { buckets[p.ci].push(p); });
      const dust = fast ? [] : makeDust(App.isSmall() ? 1500 : 2600);
      const sparks = [], petals = [];
      let nextPetalAt = 0, lastT = 0;

      let W = 0, H = 0, dpr = 1, hs = 10, cx = 0, cy = 0;
      function resize() {
        dpr = Math.min(2, window.devicePixelRatio || 1);
        W = sec.clientWidth; H = sec.clientHeight;
        canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        // the heart, its two-line caption and the buttons share the height; hs = pixels per heart unit (the heart is about 33 units tall)
        const capH = Math.max(70, Math.min(104, H * 0.16));
        hs = Math.min(W * 0.47 / 19.6, H * 0.4 / 17.5, (H - capH - 20 - 70) / 36.5);
        cx = W / 2; cy = (H - 70 - (33 * hs + capH)) / 2 + 16.4 * hs;
        caption.style.top = (cy + hs * 16.4 + Math.max(6, H * 0.012)) + 'px';
      }
      resize();
      ctx.on(window, 'resize', resize);

      const t0 = performance.now();
      const tPhoto = fast ? 300 : T_PHOTO;
      let raf = 0, leaving = false;

      /** A small four-pointed star. */
      function star(x, y, r) {
        g.beginPath();
        for (let i = 0; i < 8; i++) {
          const a = i * Math.PI / 4 - Math.PI / 2, rr = i % 2 ? r * 0.24 : r;
          if (i) g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); else g.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
        }
        g.closePath(); g.fill();
      }

      function frame(now) {
        raf = requestAnimationFrame(frame);
        const t = now - t0, dt = Math.min(0.1, Math.max(0, (t - lastT) / 1000)); lastT = t;
        g.globalCompositeOperation = 'source-over';
        g.globalAlpha = 1;
        g.clearRect(0, 0, W, H);

        const drawn = clamp01((t - (fast ? 0 : T_DRAW * 0.55)) / (fast ? 300 : T_DRAW * 0.6));          // 0 → 1 as the outline fills in
        const eBlur = easeOut(clamp01((t - tPhoto) / (fast ? 300 : BLUR_MS)));                          // the photo appearing, out of focus
        const eClear = easeOut(clamp01((t - tPhoto - (fast ? 100 : CLEAR_AT)) / (fast ? 300 : CLEAR_MS)));   // … becoming clear
        const eGlow = easeOut(clamp01((t - tPhoto - (fast ? 200 : GLOW_AT)) / (fast ? 300 : GLOW_MS)));      // … and then the golden glow
        // a soft pulse: a quick "lub", a gentler "dub", then rest; it only starts once her photo is clear
        const beatT = t - (tPhoto + (fast ? 400 : CLEAR_AT + CLEAR_MS));
        const ph = beatT > 0 ? (beatT % 1500) / 1500 : 0;
        const pulse = beatT > 0 ? (Math.exp(-Math.pow((ph - 0.1) / 0.07, 2)) + 0.55 * Math.exp(-Math.pow((ph - 0.3) / 0.08, 2))) * clamp01(beatT / 1500) : 0;
        const beat = 1 + 0.034 * pulse;

        // a rosy glow behind the heart, building as it is drawn and swelling with every beat
        if (drawn > 0) {
          const rad = hs * 21 * beat;
          const glow = g.createRadialGradient(cx, cy, 0, cx, cy, rad);
          glow.addColorStop(0, 'rgba(255,40,120,' + (0.12 * drawn + 0.1 * pulse * eClear).toFixed(3) + ')');
          glow.addColorStop(1, 'rgba(255,40,120,0)');
          g.fillStyle = glow; g.fillRect(cx - rad, cy - rad, rad * 2, rad * 2);
        }

        // her photo: it appears slightly blurred, then becomes clear (clipped to a slightly smaller heart so the particles frame it)
        if (eBlur > 0 && cutout.complete && cutout.naturalWidth) {
          const sc = lerp(0.92, 1, eBlur) * beat;
          g.save(); g.beginPath();
          for (let a = 0; a <= 90; a++) {
            const q = heartPoint(a / 90 * TAU), px = cx + q.x * 0.9 * hs * sc, py = cy + q.y * 0.9 * hs * sc;
            if (a) g.lineTo(px, py); else g.moveTo(px, py);
          }
          g.closePath(); g.clip();
          const bg = g.createRadialGradient(cx, cy - 3 * hs, 0, cx, cy - 3 * hs, 17 * hs);
          bg.addColorStop(0, '#3a0c22'); bg.addColorStop(1, '#14030b');
          g.globalAlpha = eBlur; g.fillStyle = bg; g.fillRect(cx - 18 * hs, cy - 18 * hs, 36 * hs, 36 * hs);
          const iw = 14 * hs * sc, ih = iw * cutout.naturalHeight / cutout.naturalWidth;   // a close-up selfie: her face sits in the middle of the heart
          if (blurred && eClear < 1) { g.globalAlpha = eBlur * (1 - eClear); g.drawImage(blurred, cx - iw / 2, cy - 7.3 * hs * sc, iw, ih); }
          if (eClear > 0 || !blurred) { g.globalAlpha = blurred ? eClear : eBlur; g.drawImage(cutout, cx - iw / 2, cy - 7.3 * hs * sc, iw, ih); }
          g.restore();
        }
        // then a soft golden glow: a warm light over the photo and a fine golden edge round it
        if (eGlow > 0) {
          g.globalCompositeOperation = 'lighter';
          const rg = hs * 17 * beat, gl = g.createRadialGradient(cx, cy - 1.5 * hs, 0, cx, cy - 1.5 * hs, rg);
          gl.addColorStop(0, 'rgba(255,196,110,' + ((0.16 + 0.07 * pulse) * eGlow).toFixed(3) + ')');
          gl.addColorStop(1, 'rgba(255,170,80,0)');
          g.globalAlpha = 1; g.fillStyle = gl; g.fillRect(cx - rg, cy - 1.5 * hs - rg, rg * 2, rg * 2);
          g.beginPath();
          for (let a = 0; a <= 90; a++) {
            const q = heartPoint(a / 90 * TAU), px = cx + q.x * 0.9 * hs * beat, py = cy + q.y * 0.9 * hs * beat;
            if (a) g.lineTo(px, py); else g.moveTo(px, py);
          }
          g.closePath();
          g.lineWidth = 1.6; g.strokeStyle = 'rgba(255,214,130,' + (0.5 * eGlow).toFixed(3) + ')';
          g.shadowColor = 'rgba(255,196,100,.9)'; g.shadowBlur = 16; g.stroke(); g.shadowBlur = 0;
          g.globalCompositeOperation = 'source-over';
        }

        // the particles (drawn additively: where they crowd together the heart shines)
        g.globalCompositeOperation = 'lighter';
        const fadeIn = clamp01(t / 900);
        // the cloud of dust before the heart forms: it thins out as the heart is drawn
        const dustLeft = 1 - clamp01((t - T_DRAW * 0.45) / (T_DRAW * 0.95));
        if (dustLeft > 0) {
          const dn = Math.ceil(dust.length * dustLeft);
          for (let ci = 0; ci < 4; ci++) {
            const col = COLORS[ci];
            g.fillStyle = 'rgb(' + col[0] + ',' + col[1] + ',' + col[2] + ')';
            for (let i = ci; i < dn; i += 4) {
              const d = dust[i], sw = t / 1000 * d.sp + d.ph;
              const x = cx + (d.x + Math.cos(sw) * d.am) * hs, y = cy + (d.y + Math.sin(sw * 1.3) * d.am) * hs;
              g.globalAlpha = d.a * (0.55 + 0.45 * Math.sin(t / 700 * d.sp + d.ph)) * fadeIn * Math.min(1, dustLeft * 2);
              g.fillRect(x - d.size / 2, y - d.size / 2, d.size, d.size);
            }
          }
        }
        for (let b = 0; b < buckets.length; b++) {
          const col = COLORS[b];
          g.fillStyle = 'rgb(' + col[0] + ',' + col[1] + ',' + col[2] + ')';
          const list = buckets[b];
          for (let i = 0; i < list.length; i++) {
            const p = list[i];
            const k = easeIO(clamp01((t - p.delay) / p.dur));
            let hx, hy, alpha;
            if (k <= 0) {                                       // still in the cloud: a slow swirl
              const sw = t / 1700 + p.tw;
              hx = p.sx + Math.cos(sw) * 0.7; hy = p.sy + Math.sin(sw * 1.2) * 0.7;
              alpha = p.a * 0.85 * fadeIn;
            } else {                                            // flying to its place on the outline, curving as it goes
              const dx = p.tx - p.sx, dy = p.ty - p.sy, len = Math.hypot(dx, dy) || 1, arc = Math.sin(k * Math.PI) * p.bend;
              hx = lerp(p.sx, p.tx, k) - dy / len * arc;
              hy = lerp(p.sy, p.ty, k) + dx / len * arc;
              alpha = lerp(p.a * 0.85, p.a, k);
              if (k >= 1) {                                     // at home: it shimmers, and the whole outline breathes with the beat
                const tw = 0.62 + 0.38 * Math.sin(t / 1000 * p.tws + p.tw);
                alpha = p.a * tw;
                hx += Math.sin(t / 2100 + p.tw) * 0.1; hy += Math.cos(t / 1900 + p.tw) * 0.1;
              }
            }
            const x = cx + hx * hs * beat, y = cy + hy * hs * beat;
            const s = p.size * (1 + 0.5 * pulse * drawn);
            g.globalAlpha = alpha > 1 ? 1 : alpha;
            g.fillRect(x - s / 2, y - s / 2, s, s);
          }
        }

        if (!fast) {
          // small golden and pink sparkles that appear round the heart and fade away again
          if (drawn > 0.3 && sparks.length < MAX_SPARKS && Math.random() < dt * 9) {
            const hp = pointAt(Math.random()), out = 1 + rnd(0.02, 0.2);
            sparks.push({ hx: hp.x * out + gauss() * 0.7, hy: hp.y * out + gauss() * 0.7, born: t, life: rnd(1100, 2300), r: rnd(2.4, 5.6), col: SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)], rise: rnd(0.2, 0.7), ph: rnd(0, TAU) });
          }
          for (let i = sparks.length - 1; i >= 0; i--) {
            const s = sparks[i], k = (t - s.born) / s.life;
            if (k >= 1) { sparks.splice(i, 1); continue; }
            const env = Math.sin(Math.PI * k), tw = 0.55 + 0.45 * Math.sin(t / 130 + s.ph);       // fades in and out, and twinkles
            g.globalAlpha = env * tw;
            g.fillStyle = 'rgb(' + s.col[0] + ',' + s.col[1] + ',' + s.col[2] + ')';
            star(cx + s.hx * hs * beat, cy + (s.hy - s.rise * k * 2.2) * hs * beat, s.r * (0.5 + 0.7 * env));
          }
        }
        g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';

        // a few pink petals drift slowly down from above (never more than a handful on the screen)
        if (!fast && t > tPhoto) {
          if (petals.length < MAX_PETALS && t >= nextPetalAt) {
            const sz = rnd(7, 12) * Math.max(0.85, Math.min(W, H) / 700);
            petals.push({ x0: rnd(0.04, 0.96) * W, born: t, dur: rnd(9000, 13000), sz: sz, sway: rnd(0.0007, 0.0013), amp: rnd(18, 46), ph: rnd(0, TAU), rot0: rnd(0, TAU), spin: rnd(-0.0011, 0.0011), flip: rnd(0.0009, 0.0018), col: PETAL_COLORS[Math.floor(Math.random() * Math.random() * 1.3 * PETAL_COLORS.length) % PETAL_COLORS.length], a: rnd(0.78, 0.95) });
            nextPetalAt = t + rnd(1100, 2300);
          }
          for (let i = petals.length - 1; i >= 0; i--) {
            const p = petals[i], age = t - p.born, k = age / p.dur;
            if (k >= 1) { petals.splice(i, 1); continue; }
            const x = p.x0 + Math.sin(age * p.sway + p.ph) * p.amp, y = -24 + k * (H + 60);
            const env = Math.min(1, age / 1200, (1 - k) * 8);
            g.save(); g.translate(x, y); g.rotate(p.rot0 + age * p.spin); g.scale(0.5 + 0.5 * Math.abs(Math.cos(age * p.flip)), 1);
            g.globalAlpha = p.a * env;
            const s = p.sz;
            g.beginPath(); g.moveTo(0, -s); g.bezierCurveTo(s * 0.95, -s * 0.55, s * 0.7, s * 0.75, 0, s); g.bezierCurveTo(-s * 0.7, s * 0.75, -s * 0.95, -s * 0.55, 0, -s);
            g.fillStyle = 'rgb(' + p.col[0] + ',' + p.col[1] + ',' + p.col[2] + ')'; g.fill();
            g.globalAlpha = p.a * env * 0.32; g.fillStyle = 'rgba(255,170,185,1)';
            g.beginPath(); g.ellipse(-s * 0.18, -s * 0.2, s * 0.22, s * 0.46, 0.25, 0, TAU); g.fill();
            g.restore();
          }
          g.globalAlpha = 1;
        }
      }
      raf = requestAnimationFrame(frame);
      ctx.add(function () { cancelAnimationFrame(raf); });

      // last of all, the caption is written out, and then the buttons appear
      const capAt = fast ? 700 : T_CAPTION, btnAt = fast ? 1200 : T_BUTTONS;
      ctx.later(function () { caption.classList.add('in'); }, capAt);
      ctx.show(nextBtn, btnAt);
      ctx.show(flowerBtn, btnAt);

      // the right-hand button goes nowhere: each tap lets a shower of flowers fall over the heart
      ctx.on(flowerBtn, 'click', function () { FX.shower(sec); });

      // on to the cake when she presses Continue (go() refuses while a transition is still running, so keep trying)
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
