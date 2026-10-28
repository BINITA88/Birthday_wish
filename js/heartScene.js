/* SCENE – birthday words drift through the dark in hot pink, then gather, word by word, into a beating heart around her photo,
   with a short caption underneath. */
(function (App) {
  const { CONFIG: C, u } = App;
  const WORDS = ['Happy Birthday', 'Pratima', 'Celebrate', 'Joy', 'Cheers', 'Smile', 'Sparkle', 'Wishes', 'Shine', 'Bloom', 'Blessings', 'Happy', 'Birthday', '♥'];
  const COLORS = ['255,42,122', '255,92,158', '224,32,106', '255,143,186', '198,24,98'];

  const SPIN = 0.07;        // laps of the heart per second: every word flows round the outline together
  const T_FORM = 4200;      // words drift for this long before they start to gather (the first moment is under the fade)
  const T_SPREAD = 1000;    // the words leave one after another over this time …
  const T_MOVE = 1800;      // … and each takes this long to reach its place in the heart
  const T_HOLD = 8000;      // the circling, beating heart stays this long before the next scene
  const TAU = Math.PI * 2;
  const clamp01 = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
  const ease = function (k) { return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; };
  const lerp = function (a, b, k) { return a + (b - a) * k; };

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

  function makeParticles(n) {
    const list = [];
    for (let i = 0; i < n; i++) {
      const depth = Math.random();
      const dir = Math.random() < 0.5 ? -1 : 1;
      const r = 0.97 + Math.random() * 0.15;                         // every word rides a thin band along the heart outline; the inside stays empty for the photo
      list.push({
        word: WORDS[i % WORDS.length],
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        nx: Math.random(), ny: Math.random(),
        vx: dir * (0.012 + depth * 0.05), vy: (Math.random() - 0.5) * 0.012,
        depth: depth, alpha: 0.25 + depth * 0.6,
        // every word travels round the heart along its own ring (a scaled copy of the outline), so the whole heart keeps circling
        s0: Math.random(), r: r,
        jx: (Math.random() - 0.5) * 0.55, jy: (Math.random() - 0.5) * 0.55,
        tsize: 0.42 + Math.random() * 0.4, talpha: 0.6 + Math.random() * 0.4,
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
      App.audio.fadeOut('dream', 1500);      // the romantic-dream track ends as the heart arrives …
      App.audio.fadeIn('love', 2000);        // … and one love song then carries the heart, the cake and the letter
      ['assets/images/vintage-letter-tabletop.png', 'assets/images/lastposterimage.png'].forEach(function (src) { new Image().src = src; });   // fetched now, so the letter and the finale never wait for them
      sec.innerHTML = '<canvas class="heart-canvas" aria-hidden="true"></canvas>' +
        '<div class="heart-caption"><p class="hb-text"></p></div>';
      const canvas = sec.querySelector('.heart-canvas');
      const caption = sec.querySelector('.heart-caption');
      sec.querySelector('.hb-text').textContent = T.birthdayLine;
      const g = canvas.getContext('2d');
      const cutout = new Image();                      // her cut-out photo, shown inside the heart
      cutout.src = 'assets/images/pratima-selfie-cutout.png?v=2';
      const particles = makeParticles(App.isSmall() ? 220 : 340);

      let W = 0, H = 0, dpr = 1, hs = 10, cx = 0, cy = 0;
      function resize() {
        dpr = Math.min(2, window.devicePixelRatio || 1);
        W = sec.clientWidth; H = sec.clientHeight;
        canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        // the heart and its two-line caption share the height; hs = pixels per heart unit (the heart is about 33 units tall)
        const capH = Math.max(70, Math.min(104, H * 0.16));
        hs = Math.min(W * 0.42 / 16, H * 0.37 / 16, (H - capH - 20) / 33);
        cx = W / 2; cy = (H - (33 * hs + capH)) / 2 + 16.4 * hs;
        caption.style.top = (cy + hs * 16.4 + Math.max(6, H * 0.012)) + 'px';
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

        // her photo fills the hollow of the heart (clipped to a slightly smaller heart so the words frame it)
        if (cutout.complete && cutout.naturalWidth) {
          const pa = clamp01((t - formedAt + 400) / 1400);
          if (pa > 0) {
            g.save(); g.beginPath();
            for (let a = 0; a <= 90; a++) {
              const q = heartPoint(a / 90 * TAU), px = cx + q.x * 0.92 * hs * beat, py = cy + q.y * 0.92 * hs * beat;
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
        g.textAlign = 'center'; g.textBaseline = 'middle';
        const sc = Math.max(0.6, Math.min(W, H) / 760);
        const fade = clamp01(t / 900);

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          const start = T_FORM + p.delay;
          let x, y, size, alpha, streak;
          if (t < start) {
            x = (((p.nx + p.vx * t / 1000) % 1) + 1) % 1 * W;
            y = (((p.ny + p.vy * t / 1000) % 1) + 1) % 1 * H;
            size = (7 + p.depth * 14) * sc; alpha = p.alpha * fade; streak = 1;
          } else {
            if (p.sx === null) {
              p.sx = (((p.nx + p.vx * start / 1000) % 1) + 1) % 1 * W;
              p.sy = (((p.ny + p.vy * start / 1000) % 1) + 1) % 1 * H;
            }
            const k = ease(clamp01((t - start) / T_MOVE));
            const hp = pointAt(p.s0 + SPIN * Math.max(0, t - T_FORM) / 1000);      // this word's place on its ring right now
            x = lerp(p.sx, cx + (hp.x * p.r + p.jx) * hs * beat, k);
            y = lerp(p.sy, cy + (hp.y * p.r + p.jy) * hs * beat, k);
            size = lerp((7 + p.depth * 14) * sc, Math.max(6, p.tsize * hs), k);
            alpha = lerp(p.alpha, p.talpha, k) * (k > 0.98 ? 0.8 + 0.2 * Math.sin(t / 420 + p.tw) : 1);
            streak = 1 - k;
          }
          g.font = (p.depth > 0.6 || p.word === '♥' ? '600 ' : '400 ') + size.toFixed(1) + 'px Jost, "Segoe UI", system-ui, sans-serif';
          if (streak > 0.05) {                                // a faint horizontal smear while a word is still travelling
            const len = (6 + p.depth * 26) * streak * Math.sign(p.vx);
            for (let s = 3; s >= 1; s--) {
              g.fillStyle = 'rgba(' + p.color + ',' + (alpha * 0.16 * streak).toFixed(3) + ')';
              g.fillText(p.word, x - len * s * 0.55, y);
            }
          }
          g.shadowColor = 'rgba(255,40,120,.85)'; g.shadowBlur = streak > 0.05 ? 0 : 7;
          g.fillStyle = 'rgba(' + p.color + ',' + alpha.toFixed(3) + ')';
          g.fillText(p.word, x, y);
        }
        g.shadowBlur = 0;
      }
      raf = requestAnimationFrame(frame);
      ctx.add(function () { cancelAnimationFrame(raf); });

      // caption fades in as the heart completes
      ctx.later(function () { caption.classList.add('in'); }, formedAt - 200);

      // then on to the cake (go() refuses while a transition is still running, so keep trying)
      ctx.later(function () {
        (function next() {
          if (leaving) return;
          App.SceneManager.go('cake', { mode: 'black', duration: 1100, hold: 250 }).then(function (ok) {
            if (ok) leaving = true; else ctx.later(next, 150);
          });
        })();
      }, formedAt + T_HOLD);
    }
  });
})(window.App = window.App || {});
