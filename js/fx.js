/* Lightweight canvas particle field (golden motes + confetti) and DOM balloons. */
(function (App) {
  const u = App.u;
  const COLORS = ['#F4C76B', '#F4B6C2', '#FFF3E0', '#D84A65', '#FAF7F2', '#e9a94a'];
  const sprites = {};

  function sprite(rgb) {
    if (sprites[rgb]) return sprites[rgb];
    const c = document.createElement('canvas');
    c.width = c.height = 48;
    const g = c.getContext('2d');
    const r = g.createRadialGradient(24, 24, 0, 24, 24, 24);
    r.addColorStop(0, 'rgba(' + rgb + ',1)');
    r.addColorStop(0.25, 'rgba(' + rgb + ',.55)');
    r.addColorStop(1, 'rgba(' + rgb + ',0)');
    g.fillStyle = r;
    g.fillRect(0, 0, 48, 48);
    return (sprites[rgb] = c);
  }

  const FX = {};

  /**
   * FX.field(parent, opts) -> { setConfetti(on), burst(x, y, n), destroy() }
   * opts: motes (count), rgb ('r,g,b'), confetti (bool), rate (per second), max
   */
  FX.field = function (parent, o) {
    const opt = Object.assign({ motes: 36, rgb: '244,199,107', confetti: false, rate: 12, max: 60, size: 1 }, o || {});
    const scale = App.reduced ? 0.4 : (App.isSmall() ? 0.65 : 1);

    const canvas = document.createElement('canvas');
    canvas.className = 'fx-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    parent.appendChild(canvas);
    const g = canvas.getContext('2d');
    const dpr = 1;                       // soft glows and confetti: full resolution would only cost speed
    let w = 0, h = 0;

    function resize() {
      w = parent.clientWidth || window.innerWidth;
      h = parent.clientHeight || window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    const glow = sprite(opt.rgb);
    const motes = [];
    const nMotes = Math.round(opt.motes * scale);
    for (let i = 0; i < nMotes; i++) {
      motes.push({
        x: Math.random() * w, y: Math.random() * h,
        r: u.rand(3, 9) * opt.size, vy: u.rand(6, 22), dr: u.rand(4, 16),
        a: u.rand(0.25, 0.85), sp: u.rand(0.6, 1.8), ph: u.rand(0, 6.28)
      });
    }

    const conf = [];
    const fountains = [];
    let emit = !!opt.confetti, acc = 0, raf = 0, last = performance.now(), alive = true;
    const cap = Math.round(opt.max * scale) + 20;

    function falling() {
      return {
        x: Math.random() * w, y: -12, vx: u.rand(-12, 12), vy: u.rand(45, 95), g: 0, drag: 1,
        w: u.rand(5, 10), h: u.rand(8, 15), rot: u.rand(0, 6.28), vr: u.rand(-3, 3),
        fl: u.rand(0, 6.28), vf: u.rand(3, 7), col: u.pick(COLORS), life: 99, sway: u.rand(10, 30), ph: u.rand(0, 6.28)
      };
    }

    function frame(now) {
      if (!alive) return;
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      g.clearRect(0, 0, w, h);

      g.globalAlpha = 1;
      for (let i = 0; i < motes.length; i++) {
        const m = motes[i];
        m.y -= m.vy * dt;
        m.x += Math.sin(now / 1000 * m.sp + m.ph) * m.dr * dt;
        if (m.y < -12) { m.y = h + 12; m.x = Math.random() * w; }
        g.globalAlpha = m.a * (0.55 + 0.45 * Math.sin(now / 700 * m.sp + m.ph));
        g.drawImage(glow, m.x - m.r, m.y - m.r, m.r * 2, m.r * 2);
      }

      if (emit) {
        acc += dt * opt.rate * scale;
        while (acc >= 1) { acc--; if (conf.length < cap) conf.push(falling()); }
      }

      for (let i = fountains.length - 1; i >= 0; i--) {                 // sparkler fountains shoot sparks upward
        const f = fountains[i];
        if (!f.on) { fountains.splice(i, 1); continue; }
        f.acc += dt * f.rate * scale;
        while (f.acc >= 1) {
          f.acc--;
          const a = -1.5708 + u.rand(-0.2, 0.2) * (Math.random() < 0.18 ? 2.6 : 1), sp = u.rand(380, 860) * f.power;
          conf.push({
            x: f.x + u.rand(-2, 2), y: f.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: 560, drag: 0.992,
            w: u.rand(8, 20), h: u.rand(1.6, 2.8), rot: a, vr: 0, fl: 0, vf: 0,
            col: u.pick(['#fff6c8', '#ffe27a', '#ffc04a', '#ffffff', '#ffd9a0']), life: u.rand(0.5, 1.3), sway: 0, ph: 0
          });
        }
      }

      for (let i = conf.length - 1; i >= 0; i--) {
        const c = conf[i];
        c.vy += c.g * dt;
        c.vx *= c.drag; c.vy *= (c.drag < 1 ? c.drag : 1);
        c.x += (c.vx + Math.sin(now / 600 + c.ph) * c.sway * (c.g ? 0.3 : 1)) * dt;
        c.y += c.vy * dt;
        c.rot += c.vr * dt; c.fl += c.vf * dt;
        c.life -= (c.life < 50 ? dt : 0);
        if (c.y > h + 20 || c.life <= 0) { conf.splice(i, 1); continue; }
        g.globalAlpha = Math.min(1, c.life);
        g.save();
        g.translate(c.x, c.y);
        g.rotate(c.rot);
        g.scale(1, Math.cos(c.fl));
        g.fillStyle = c.col;
        g.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
        g.restore();
      }
      g.globalAlpha = 1;
    }
    raf = requestAnimationFrame(frame);

    return {
      setConfetti(on) { emit = !!on; },
      burst(x, y, n, golden) {
        n = Math.round((n || 40) * (App.reduced ? 0.5 : 1));
        for (let i = 0; i < n; i++) {
          const a = u.rand(0, 6.283), sp = u.rand(120, 460);
          conf.push({
            x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 120, g: 380, drag: 0.985,
            w: u.rand(4, 9), h: u.rand(7, 13), rot: u.rand(0, 6.28), vr: u.rand(-8, 8),
            fl: u.rand(0, 6.28), vf: u.rand(5, 11),
            col: golden ? u.pick(['#F4C76B', '#FFE29A', '#e9a94a', '#FFF3E0']) : u.pick(COLORS),
            life: u.rand(1.6, 2.6), sway: 0, ph: 0
          });
        }
      },
      /** A cold-sparkler fountain at (x, y): returns a handle; handle.stop() lets it die away. */
      fountain(x, y, power) {
        const f = { x: x, y: y, power: power || 1, rate: 300, acc: 0, on: true, stop() { f.on = false; } };
        fountains.push(f);
        return f;
      },
      /** Small, bright, short-lived sparks – like a sparkler. */
      sparks(x, y, n) {
        n = Math.round((n || 6) * (App.reduced ? 0.5 : 1));
        for (let i = 0; i < n; i++) {
          const a = u.rand(0, 6.283), sp = u.rand(60, 340);
          conf.push({
            x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 60, g: 420, drag: 0.97,
            w: u.rand(1.8, 3.2), h: u.rand(1.8, 3.2), rot: 0, vr: 0, fl: 0, vf: 0,
            col: u.pick(['#fff6c8', '#ffe27a', '#ffc04a', '#ffffff']),
            life: u.rand(0.35, 0.9), sway: 0, ph: 0
          });
        }
      },
      destroy() {
        alive = false;
        cancelAnimationFrame(raf);
        window.removeEventListener('resize', resize);
        canvas.remove();
      }
    };
  };

  /* ---------- Balloons ---------- */
  /** FX.balloons(parent, {count, dim, prefill}) – heart-balloon bouquets that float up forever (CSS-driven). */
  FX.balloons = function (parent, o) {
    o = o || {};
    const wrap = document.createElement('div');
    wrap.className = 'balloons' + (o.dim ? ' dim' : '');
    wrap.setAttribute('aria-hidden', 'true');
    const n = o.count || 5;
    const src = u.esc(App.CONFIG.balloonImage);
    const fit = (o.dim ? 0.8 : 1) * (App.isSmall() ? 0.72 : 1);
    let html = '';
    for (let i = 0; i < n; i++) {
      const w = u.rand(130, 205) * fit;
      const dur = u.rand(15, 27);
      const delay = o.prefill ? -u.rand(0, dur) : u.rand(-dur * 0.5, 2);
      const x = (i + u.rand(0.1, 0.9)) / n * 100;
      html += '<div class="balloon" style="left:' + x.toFixed(1) + '%;width:' + w.toFixed(0) + 'px;bottom:-' + (w * 1.2).toFixed(0) +
        'px;--dur:' + dur.toFixed(1) + 's;--delay:' + delay.toFixed(1) + 's;--drift:' + u.rand(-6, 6).toFixed(1) + 'vw">' +
        '<div class="b-sway" style="--sw:' + u.rand(3, 6).toFixed(1) + 's;--sa:' + u.rand(2, 4).toFixed(1) + 'deg">' +
        '<img src="' + src + '" alt="" draggable="false"></div></div>';
    }
    wrap.innerHTML = html;
    parent.appendChild(wrap);
    return wrap;
  };

  App.FX = FX;
})(window.App = window.App || {});
