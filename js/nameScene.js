/* SCENE 0 – The beginning: a whole garden field, her name planted in seeds, watered, grown into bloom.
   One canvas, one timeline. Ends on "Something is waiting for you..." / "Click to Begin". */
(function (App) {
  const { CONFIG: C, u } = App;
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
  const easeOut = k => 1 - Math.pow(1 - k, 3);
  const easeInOut = k => (k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
  const smooth = k => k * k * (3 - 2 * k);

  /* ---- Timeline (seconds) ---- */
  const T = {
    seedStart: 3.6, seedSpread: 4.6, seedFly: 2.0,
    walkIn: 11.5, waterStart: 15.2, waterEnd: 23.4, walkOut: 24.2, gone: 28.2,
    growStart: 25.0, growEnd: 40.0,
    camStart: 39.5, camEnd: 45.0,
    line: 44.2, button: 47.6
  };

  const PALETTES = [
    { b: '#eb8fae', l: '#f8c9da', d: '#c4608a', c: '#f6d36b' },   // pink
    { b: '#eb8fae', l: '#f8c9da', d: '#c4608a', c: '#f6d36b' },
    { b: '#9a76cc', l: '#cdb6ee', d: '#6c4aa2', c: '#f1d27a' },   // purple
    { b: '#9a76cc', l: '#cdb6ee', d: '#6c4aa2', c: '#f1d27a' },
    { b: '#f4eee6', l: '#ffffff', d: '#d5c8b8', c: '#e9bf4e' },   // white
    { b: '#f4eee6', l: '#ffffff', d: '#d5c8b8', c: '#e9bf4e' },
    { b: '#f0c94f', l: '#fbe69b', d: '#cc9a22', c: '#7b5a2a' },   // yellow
    { b: '#d4566b', l: '#ec909e', d: '#a2334a', c: '#f2cf72' },   // soft red
    { b: '#f2a98a', l: '#fcd4bf', d: '#d27c5b', c: '#f5d27a' }    // peach
  ];
  const SEED_COLS = ['#d6b57a', '#c19a5b', '#e6cfa0', '#9c7840', '#b88b4e'];
  const GREENS = ['#3f7a3c', '#4f8c46', '#356b35', '#5f9a4e'];

  App.SceneManager.register('name', {
    init(sec, ctx) {
      const TXT = C.text;
      sec.innerHTML =
        '<canvas class="sw-canvas" aria-hidden="true"></canvas>' +
        '<div class="sw-light" aria-hidden="true"></div>' +
        '<div class="sw-text">' +
          '<p class="sw-line">' + u.esc(TXT.waitLine) + '</p>' +
          '<button class="sw-btn" type="button">' + u.esc(TXT.waitButton) + '</button>' +
        '</div>' +
        '<button class="sw-skip" type="button" aria-label="Skip intro">Skip</button>';

      const canvas = sec.querySelector('.sw-canvas');
      const g = canvas.getContext('2d');
      const light = sec.querySelector('.sw-light');
      const textBox = sec.querySelector('.sw-text');
      const btn = sec.querySelector('.sw-btn');
      const skipBtn = sec.querySelector('.sw-skip');

      let W = 0, H = 0, dpr = 1, sc = 1;
      let t = 0, raf = 0, last = 0, alive = true;
      const speed = App.reduced ? 2.5 : 1;
      let skipping = false, begun = false, lineOn = false, btnOn = false;

      let L = null;
      let seeds = [], flowers = [], parts = [], motes = [];
      let groundCv, bedCv, disturbCv, wetCv, dg, wg;
      const glowSprite = (function () {
        const c = document.createElement('canvas'); c.width = c.height = 64;
        const k = c.getContext('2d');
        const r = k.createRadialGradient(32, 32, 0, 32, 32, 32);
        r.addColorStop(0, 'rgba(255,240,205,1)'); r.addColorStop(.3, 'rgba(255,226,170,.5)'); r.addColorStop(1, 'rgba(255,220,160,0)');
        k.fillStyle = r; k.fillRect(0, 0, 64, 64);
        return c;
      })();

      /* ---------------- build ---------------- */
      function build() {
        W = sec.clientWidth || window.innerWidth;
        H = sec.clientHeight || window.innerHeight;
        dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
        sc = clamp(Math.min(W / 1100, H / 760), 0.5, 1.4);
        const rnd = u.mulberry(20241006);
        const R = (a, b) => a + rnd() * (b - a);
        const small = W < 700;

        /* name metrics */
        const letters = C.name.toUpperCase().split('');
        const mc = document.createElement('canvas').getContext('2d');
        mc.font = '800 100px Jost, "Segoe UI", Arial, sans-serif';
        const widths = letters.map(ch => mc.measureText(ch).width);
        const track = 14;
        const totalW = widths.reduce((a, b) => a + b, 0) + track * (letters.length - 1);
        const nw = Math.min(W * 0.82, 980);
        const fs = Math.min(100 * nw / totalW, H * 0.22);
        const k = fs / 100;
        const capH = fs * 0.7;
        const nameW = totalW * k;
        const nameCx = W / 2, nameY = H * 0.7;

        /* mask of the name */
        const pad = 6;
        const mw = Math.ceil(nameW) + pad * 2, mh = Math.ceil(fs * 1.1);
        const mk = document.createElement('canvas'); mk.width = mw; mk.height = mh;
        const m = mk.getContext('2d');
        m.font = '800 ' + fs + 'px Jost, "Segoe UI", Arial, sans-serif';
        m.fillStyle = '#fff'; m.textBaseline = 'alphabetic';
        const baseY = Math.round(fs * 0.9);
        let cx = pad;
        letters.forEach(function (ch, i) { m.fillText(ch, cx, baseY); cx += (widths[i] + track) * k; });
        const md = m.getImageData(0, 0, mw, mh).data;
        const ox = nameCx - mw / 2, oy = nameY - (baseY - capH / 2);
        const inText = (x, y) => {
          const ix = Math.round(x - ox), iy = Math.round(y - oy);
          return ix >= 0 && iy >= 0 && ix < mw && iy < mh && md[(iy * mw + ix) * 4 + 3] > 100;
        };
        const nearText = (x, y, r) => {
          if (inText(x, y)) return true;
          for (let a = 0; a < 8; a++) if (inText(x + Math.cos(a * TAU / 8) * r, y + Math.sin(a * TAU / 8) * r)) return true;
          return false;
        };

        const step = clamp(fs / 11, 4, 13);   // ~2 seeds across each stroke
        const nameTop = nameY - capH / 2, nameBot = nameY + capH / 2;
        const nameL = nameCx - nameW / 2, nameR = nameCx + nameW / 2;

        L = {
          W: W, H: H, horizon: H * 0.36, nameCx: nameCx, nameY: nameY, capH: capH, nameW: nameW,
          nameTop: nameTop, nameBot: nameBot, nameL: nameL, nameR: nameR, step: step,
          bed: { cx: nameCx, cy: nameY + capH * 0.04, rx: nameW * 0.56 + step * 3, ry: capH * 0.95 + step * 2 },
          ph: Math.min(H * 0.27, 260), unit: clamp(W / 42, 10, 26)
        };
        L.footY = L.bed.cy - L.bed.ry * 0.9;

        /* seeds: every letter is made of them */
        seeds = [];
        for (let gy = nameTop; gy < nameBot; gy += step * 0.9) {
          const row = Math.round((gy - nameTop) / (step * 0.9));
          for (let gx = nameL; gx < nameR; gx += step) {
            const x = gx + (row % 2 ? step * 0.5 : 0) + R(-step * .22, step * .22);
            const y = gy + R(-step * .22, step * .22);
            if (!inText(x, y)) continue;
            const xn = (x - nameL) / nameW;
            const delay = T.seedStart + xn * T.seedSpread * 0.85 + R(0, T.seedSpread * 0.18);
            seeds.push({
              x: x, y: y, rot: R(0, TAU), a: step * R(.38, .5), b: step * R(.22, .3),
              col: u.pick(SEED_COLS), delay: delay, dur: R(1.5, T.seedFly),
              ox: 0, oy: 0,
              wet: 0, landed: false, sp0: T.growStart + 0.4 + xn * 3.2 + R(0, 3.4),
              sh: step * R(1.0, 1.9), gc: u.pick(GREENS), ph: R(0, TAU), lean: R(-.5, .5)
            });
          }
        }
        seeds.forEach(s => { s.landT = s.delay + s.dur; });

        /* flowers: they bloom ONLY from the seeds of the name, so the letters turn into flowers */
        flowers = [];
        const topY = L.horizon + H * 0.03;
        const want = Math.round(clamp(W / 6.5, 90, 220));
        seeds.forEach(function (sd) {
          
          sd.bloom = true;
          const pal = u.pick(PALETTES);
          const r = step * R(.66, .82);
          flowers.push({
            type: rnd() < 0.28 ? 'tulip' : 'daisy', letter: true, x: sd.x, y: sd.y + step * .3, r: r, h: step * R(.9, 1.7), pal: pal,
            start: sd.sp0 + R(0, 2.5), dur: R(5.2, 6.8), ph: R(0, TAU), sw: R(1, 2.6) * sc, bend: R(-1, 1) * step * .5,
            rot: R(0, TAU), tilt: R(.7, .88), n: small ? 8 : (R(0, 1) < .5 ? 10 : 12), sw0: Math.max(1, r * 0.1),
            leaves: [{ u: .32, s: -1, len: r * R(1.0, 1.5) }, { u: .55, s: 1, len: r * R(1.0, 1.5) }],
            col: u.pick(GREENS)
          });
        });
        const tufts = want * 2;
        for (let i = 0, n = 0; i < 4000 && n < tufts; i++) {
          const x = R(-10, W + 10), y = R(topY, H - 2);
          if (nearText(x, y, step)) continue;
          n++;
          const depth = clamp((y - L.horizon) / (H - L.horizon), .08, 1);
          flowers.push({ type: 'grass', x: x, y: y, r: L.unit * R(.5, .9) * lerp(.4, 1, depth), h: L.unit * R(.9, 1.8) * lerp(.4, 1, depth), start: T.growStart + R(0, 9), dur: R(4, 6), ph: R(0, TAU), col: u.pick(GREENS), pal: PALETTES[0] });
        }
        flowers.sort((a, b) => a.y - b.y);

        motes = [];
        const nm = App.reduced ? 12 : small ? 22 : 40;
        for (let i = 0; i < nm; i++) motes.push({ x: R(0, W), y: R(H * .2, H), r: R(2, 6) * sc, v: R(4, 14) * sc, ph: R(0, TAU), a: R(.25, .8) });

        /* ---- pre-rendered grass field ---- */
        const gh = Math.ceil(H * 1.5 - L.horizon);
        groundCv = document.createElement('canvas'); groundCv.width = W; groundCv.height = gh;
        const gg = groundCv.getContext('2d');
        const grad = gg.createLinearGradient(0, 0, 0, gh);
        grad.addColorStop(0, '#86a266'); grad.addColorStop(.18, '#5f8a48'); grad.addColorStop(.6, '#3f6c35'); grad.addColorStop(1, '#274a25');
        gg.fillStyle = grad; gg.fillRect(0, 0, W, gh);
        for (let i = 0; i < 40; i++) {
          const x = R(0, W), y = R(0, gh), r = R(W * .06, W * .24);
          const rg = gg.createRadialGradient(x, y, 0, x, y, r);
          const gcol = u.pick(['120,160,70', '40,90,40', '150,170,80', '30,70,40']);
          rg.addColorStop(0, 'rgba(' + gcol + ',.24)'); rg.addColorStop(1, 'rgba(' + gcol + ',0)');
          gg.fillStyle = rg; gg.fillRect(x - r, y - r, r * 2, r * 2);
        }
        const nblades = Math.round(W * gh / 90);
        gg.lineCap = 'round';
        for (let i = 0; i < nblades; i++) {
          const y = R(0, gh), depth = y / gh, x = R(0, W);
          const len = (2 + depth * 11) * R(.6, 1.2), lean = R(-1, 1) * (1 + depth * 3);
          gg.strokeStyle = rnd() < .55 ? 'rgba(20,50,20,' + R(.25, .5) + ')' : 'rgba(170,205,110,' + R(.18, .4) + ')';
          gg.lineWidth = .6 + depth * 1.1;
          gg.beginPath(); gg.moveTo(x, y); gg.lineTo(x + lean, y - len); gg.stroke();
        }

        /* ---- the tilled soil strip where the name is planted ---- */
        bedCv = document.createElement('canvas'); bedCv.width = Math.round(W); bedCv.height = Math.round(H);
        const bg = bedCv.getContext('2d');
        const B = L.bed;
        bg.save(); bg.translate(B.cx, B.cy); bg.scale(1, B.ry / B.rx);
        const sg = bg.createRadialGradient(0, 0, 0, 0, 0, B.rx);
        sg.addColorStop(0, 'rgba(46,29,18,1)'); sg.addColorStop(.72, 'rgba(58,38,24,.97)'); sg.addColorStop(.92, 'rgba(70,48,30,.6)'); sg.addColorStop(1, 'rgba(78,56,36,0)');
        bg.fillStyle = sg; bg.beginPath(); bg.arc(0, 0, B.rx, 0, TAU); bg.fill();
        bg.restore();
        const nsoil = Math.round(B.rx * B.ry / 36);
        for (let i = 0; i < nsoil; i++) {
          const a = R(0, TAU), r = Math.sqrt(rnd()) * 0.96;
          const x = B.cx + Math.cos(a) * B.rx * r, y = B.cy + Math.sin(a) * B.ry * r;
          const edge = r > .8 ? .5 : 1;
          bg.fillStyle = rnd() < .5 ? 'rgba(18,10,5,' + R(.2, .5) * edge + ')' : 'rgba(140,108,72,' + R(.12, .34) * edge + ')';
          const s = R(.8, 2.4) * sc + 0.4;
          bg.fillRect(x, y, s, s * R(.6, 1.1));
        }
        for (let i = 0; i < 50; i++) {
          const a = R(0, TAU), r = Math.sqrt(rnd()) * .9;
          const x = B.cx + Math.cos(a) * B.rx * r, y = B.cy + Math.sin(a) * B.ry * r, cr = R(4, 10) * sc;
          const cg = bg.createRadialGradient(x, y, 0, x, y, cr);
          cg.addColorStop(0, 'rgba(20,12,6,.35)'); cg.addColorStop(1, 'rgba(20,12,6,0)');
          bg.fillStyle = cg; bg.fillRect(x - cr, y - cr, cr * 2, cr * 2);
        }

        disturbCv = document.createElement('canvas'); disturbCv.width = W; disturbCv.height = H; dg = disturbCv.getContext('2d');
        wetCv = document.createElement('canvas'); wetCv.width = W; wetCv.height = H; wg = wetCv.getContext('2d');
        parts = [];
        seeds.forEach(s => { if (t > s.landT) { s.landed = true; disturb(s); } });
      }

      function disturb(s) {
        dg.save();
        dg.translate(s.x, s.y + 1);
        dg.scale(1, .55);
        const r = s.a * 2.2;
        const rg = dg.createRadialGradient(0, 0, r * .3, 0, 0, r);
        rg.addColorStop(0, 'rgba(14,8,4,.42)'); rg.addColorStop(.7, 'rgba(14,8,4,.18)'); rg.addColorStop(1, 'rgba(14,8,4,0)');
        dg.fillStyle = rg; dg.beginPath(); dg.arc(0, 0, r, 0, TAU); dg.fill();
        dg.strokeStyle = 'rgba(150,115,78,.28)'; dg.lineWidth = 1;
        dg.beginPath(); dg.arc(0, -s.b * .3, r * .75, Math.PI * 1.1, Math.PI * 1.9); dg.stroke();
        dg.restore();
      }

      /* ---------------- simulation ---------------- */
      function personAt(tt) {
        if (tt < T.walkIn || tt > T.gone) return null;
        const x0 = -W * 0.1, x1 = W * 0.2, x2 = W * 0.8, x3 = W * 1.12;
        const wi = seg(tt, T.walkIn, T.waterStart - 0.7);
        if (tt < T.waterStart - 0.7) return lerp(x0, x1, wi * (2 - wi));
        if (tt < T.waterStart + 0.8) return x1;
        if (tt < T.waterEnd) { const k = seg(tt, T.waterStart + 0.8, T.waterEnd); return lerp(x1, x2, smooth(k) * .35 + k * .65); }
        if (tt < T.walkOut) return x2;
        const k = seg(tt, T.walkOut, T.gone);
        return lerp(x2, x3, k * k);
      }
      const tiltAt = tt => easeInOut(seg(tt, T.waterStart - 0.4, T.waterStart + 0.9)) * (1 - easeInOut(seg(tt, T.waterEnd - 0.2, T.waterEnd + 0.8)));

      let pose = null;
      let dropAcc = 0;

      function computePose() {
        const x = personAt(t);
        if (x == null) { pose = null; return; }
        const ph = L.ph, s = ph / 180;
        const tilt = tiltAt(t);
        const phase = x / (ph * 0.34) * Math.PI;
        const stopped = (t >= T.waterStart - 0.7 && t < T.waterStart + 0.8) || (t >= T.waterEnd && t < T.walkOut);
        pose = { x: x, y: L.footY, s: s, tilt: tilt, phase: phase, moving: !stopped };
        const hand = { x: x + 34 * s, y: pose.y - 100 * s - tilt * 6 * s };
        const ang = tilt * 0.62;
        const sx = 30 * s, sy = -14 * s;
        pose.hand = hand; pose.ang = ang;
        pose.tip = { x: hand.x + sx * Math.cos(ang) - sy * Math.sin(ang), y: hand.y + sx * Math.sin(ang) + sy * Math.cos(ang) };
      }

      function spawnDust(x, y, n) {
        for (let i = 0; i < n; i++) parts.push({ k: 'dust', x: x, y: y, vx: u.rand(-14, 14) * sc, vy: -u.rand(8, 30) * sc, life: 0, max: u.rand(.7, 1.4), r: u.rand(.7, 1.8) * sc });
      }

      function hitSoil(x, y) {
        wg.save();
        wg.translate(x, y); wg.scale(1.6, 1);
        const r = L.step * 1.5;
        const rg = wg.createRadialGradient(0, 0, 0, 0, 0, r);
        rg.addColorStop(0, 'rgba(16,9,4,.18)'); rg.addColorStop(1, 'rgba(16,9,4,0)');
        wg.fillStyle = rg; wg.beginPath(); wg.arc(0, 0, r, 0, TAU); wg.fill();
        wg.restore();
        parts.push({ k: 'ring', x: x, y: y, life: 0, max: .9, r: 2 * sc });
        for (let i = 0; i < 3; i++) parts.push({ k: 'splash', x: x, y: y, vx: u.rand(-40, 40) * sc, vy: -u.rand(40, 90) * sc, life: 0, max: u.rand(.3, .5), r: u.rand(.7, 1.3) * sc });
        const rr = L.step * 2.3;
        for (let i = 0; i < seeds.length; i++) {
          const s = seeds[i];
          if (!s.landed) continue;
          const dx = s.x - x, dy = (s.y - y) * 1.6;
          if (dx * dx + dy * dy < rr * rr) s.wet = Math.min(1, s.wet + .12);
        }
      }

      function advance(dt) {
        t += dt;
        computePose();

        for (let i = 0; i < seeds.length; i++) {
          const s = seeds[i];
          if (!s.landed && t >= s.landT) { s.landed = true; disturb(s); spawnDust(s.x, s.y, 2); }
        }

        if (pose && pose.tilt > 0.55 && t < T.waterEnd) {
          dropAcc += dt * 85;
          while (dropAcc >= 1) {
            dropAcc--;
            const tip = pose.tip, G = H * 1.3, tau = u.rand(.5, .8);
            const tx = pose.x + (30 + u.rand(-48, 48)) * pose.s * 1.4 + u.rand(-10, 10);
            const ty = clamp(L.nameY + u.rand(-L.capH * .55, L.capH * .6), L.nameTop - 6, L.nameBot + 8);
            const vx = (tx - tip.x) / tau, vy = (ty - tip.y - .5 * G * tau * tau) / tau;
            parts.push({ k: 'drop', x: tip.x, y: tip.y, x0: tip.x, y0: tip.y, vx: vx, vy: vy, G: G, life: 0, max: tau, tx: tx, ty: ty, px: tip.x, py: tip.y });
          }
        }

        for (let i = parts.length - 1; i >= 0; i--) {
          const p = parts[i];
          p.life += dt;
          if (p.k === 'drop') {
            p.px = p.x; p.py = p.y;
            p.x = p.x0 + p.vx * p.life; p.y = p.y0 + p.vy * p.life + .5 * p.G * p.life * p.life;
            if (p.life >= p.max) { hitSoil(p.tx, p.ty); parts.splice(i, 1); }
          } else if (p.k === 'dust' || p.k === 'splash') {
            p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 260 * sc * dt;
            if (p.life > p.max) parts.splice(i, 1);
          } else if (p.k === 'ring') {
            if (p.life > p.max) parts.splice(i, 1);
          }
        }

        if (!lineOn && t >= T.line) { lineOn = true; textBox.classList.add('line-on'); }
        if (!btnOn && t >= T.button) { btnOn = true; textBox.classList.add('btn-on'); skipBtn.classList.add('gone'); }
        if (t >= T.camStart) light.style.opacity = String(easeInOut(seg(t, T.camEnd - 1, T.camEnd + 2.5)));
      }

      /* ---------------- rendering ---------------- */
      function mix(c1, c2, k) {
        return 'rgb(' + Math.round(lerp(c1[0], c2[0], k)) + ',' + Math.round(lerp(c1[1], c2[1], k)) + ',' + Math.round(lerp(c1[2], c2[2], k)) + ')';
      }
      function mixHex(a, b, k) {
        const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
        return 'rgb(' + (lerp(pa >> 16, pb >> 16, k) | 0) + ',' + (lerp((pa >> 8) & 255, (pb >> 8) & 255, k) | 0) + ',' + (lerp(pa & 255, pb & 255, k) | 0) + ')';
      }

      function drawSky(light01) {
        const hz = L.horizon;
        const g1 = g.createLinearGradient(0, -H * .4, 0, hz);
        g1.addColorStop(0, mix([34, 52, 92], [96, 142, 200], light01));
        g1.addColorStop(.65, mix([84, 96, 128], [186, 206, 222], light01));
        g1.addColorStop(1, mix([150, 140, 150], [248, 226, 196], light01));
        g.fillStyle = g1; g.fillRect(-W * .2, -H * .5, W * 1.4, hz + H * .5 + 2);

        const sx = W * .2, sy = hz - H * .02;
        const sg = g.createRadialGradient(sx, sy, 0, sx, sy, W * .6);
        sg.addColorStop(0, 'rgba(255,222,170,' + (.18 + .5 * light01) + ')'); sg.addColorStop(1, 'rgba(255,200,150,0)');
        g.fillStyle = sg; g.fillRect(-W * .2, -H * .2, W * 1.4, hz + H * .25);

        const hills = [[.09, '#5a7a8a', '#9bb0a8', .016], [.05, '#3f6a48', '#7fa26a', .02]];
        hills.forEach(function (h, i) {
          g.fillStyle = mix(i ? [44, 76, 52] : [70, 92, 106], i ? [100, 140, 84] : [140, 164, 170], light01);
          g.beginPath(); g.moveTo(-W * .2, hz + 2);
          for (let x = -W * .2; x <= W * 1.2; x += 24) {
            g.lineTo(x, hz - H * h[0] * (.45 + .55 * Math.sin(x * h[3] + i * 2) * Math.sin(x * h[3] * .43 + 1.3)) - H * .01);
          }
          g.lineTo(W * 1.2, hz + 2); g.closePath(); g.fill();
        });
      }

      function drawGround(light01) {
        g.drawImage(groundCv, 0, L.horizon);
        const hg = g.createLinearGradient(0, L.horizon - 4, 0, L.horizon + H * .14);
        hg.addColorStop(0, 'rgba(235,225,200,' + (.2 + .22 * light01) + ')'); hg.addColorStop(1, 'rgba(235,225,200,0)');
        g.fillStyle = hg; g.fillRect(-W * .2, L.horizon - 4, W * 1.4, H * .14 + 4);
        g.fillStyle = 'rgba(255,200,130,' + (.1 * light01) + ')'; g.fillRect(-W * .2, L.horizon, W * 1.4, H * 1.2);
        g.drawImage(bedCv, 0, 0);
        g.drawImage(disturbCv, 0, 0);
        g.drawImage(wetCv, 0, 0);
      }

      function drawSeeds() {
        for (let i = 0; i < seeds.length; i++) {
          const s = seeds[i];
          if (t < s.delay) continue;
          const p = easeOut(seg(t, s.delay, s.landT));
          const x = s.x + s.ox * (1 - p), y = s.y + s.oy * (1 - p);
          const al = Math.min(1, p * 3.2);
          const sp = easeOut(seg(t, s.sp0, s.sp0 + 3.6));
          const swell = 1 + s.wet * .16 + sp * .1;
          const rot = s.rot + (1 - p) * 1.4;

          g.globalAlpha = al * .55; g.fillStyle = '#0d0703';
          g.beginPath(); g.ellipse(x + 1, y + s.b * .8 + 1, s.a * 1.05 * swell, s.b * .8, rot, 0, TAU); g.fill();

          if (s.landed) {
            const gl = seg(t, s.landT, s.landT + .5) * (1 - seg(t, s.landT + .5, s.landT + 2.4));
            if (gl > .01) { g.globalAlpha = gl * .55; const gr = s.a * 3.4; g.drawImage(glowSprite, x - gr, y - gr, gr * 2, gr * 2); }
          }

          g.globalAlpha = al * (1 - .55 * sp);
          g.fillStyle = s.wet > .05 ? mixHex(s.col, '#3a2514', s.wet * .6) : s.col;
          g.beginPath(); g.ellipse(x, y, s.a * swell, s.b * swell, rot, 0, TAU); g.fill();
          g.globalAlpha = al * (1 - .55 * sp) * (.5 - s.wet * .25);
          g.fillStyle = '#fff6df';
          g.beginPath(); g.ellipse(x - s.a * .22, y - s.b * .3, s.a * .45, s.b * .28, rot, 0, TAU); g.fill();
          g.globalAlpha = 1;

          if (sp > .01 && !s.bloom) drawSprout(s, x, y, sp);
        }
      }

      function drawSprout(s, x, y, sp) {
        const wind = Math.sin(t * .9 + s.ph + x * .01) * 1.4 * sc;
        const h = s.sh * sp, tx = x + (s.lean * 2 + wind) * sp, ty = y - h;
        g.strokeStyle = s.gc; g.lineWidth = Math.max(1, L.step * .16); g.lineCap = 'round';
        g.beginPath(); g.moveTo(x, y - 1); g.quadraticCurveTo(x + s.lean * 2, y - h * .6, tx, ty); g.stroke();
        const lp = easeOut(seg(sp, .3, 1)), ll = L.step * .75 * lp;
        if (ll > .5) {
          g.fillStyle = s.gc;
          for (let d = -1; d <= 1; d += 2) {
            g.save(); g.translate(tx, ty + 1); g.rotate(-Math.PI / 2 + d * lerp(.2, 1.0, lp));
            g.beginPath(); g.ellipse(ll * .55, 0, ll * .6, ll * .24, 0, 0, TAU); g.fill();
            g.restore();
          }
        }
      }

      function qpt(p0, c, p1, k) {
        const a = (1 - k) * (1 - k), b = 2 * (1 - k) * k, d = k * k;
        return { x: a * p0.x + b * c.x + d * p1.x, y: a * p0.y + b * c.y + d * p1.y };
      }

      function drawFlower(f) {
        const p = seg(t, f.start, f.start + f.dur);
        if (p <= 0) return;
        const wind = .6 + .4 * Math.sin(t * .3 + f.x * .004);

        if (f.type === 'grass') {
          const gp = easeOut(p), hh = f.h * gp;
          g.strokeStyle = f.col; g.lineCap = 'round'; g.lineWidth = Math.max(1, f.r * .1);
          for (let b = -2; b <= 2; b++) {
            const sw = Math.sin(t * 1.1 + f.ph + b) * 2.2 * wind * sc;
            g.beginPath(); g.moveTo(f.x + b * f.r * .14, f.y);
            g.quadraticCurveTo(f.x + b * f.r * .3, f.y - hh * .6, f.x + b * f.r * .5 + sw * gp, f.y - hh * (b % 2 ? .7 : 1));
            g.stroke();
          }
          return;
        }

        const stemP = easeOut(seg(p, 0, .55)), leafP = easeOut(seg(p, .25, .72)), openP = easeInOut(seg(p, .55, 1));
        const sway = Math.sin(t * .8 + f.ph) * f.sw * wind;
        const base = { x: f.x, y: f.y };
        const top = { x: f.x + sway * stemP + f.bend * .25 * stemP, y: f.y - f.h * stemP };
        const ctl = { x: f.x + f.bend * stemP + sway * .3, y: f.y - f.h * stemP * .55 };

        g.globalAlpha = .28 * Math.min(1, stemP * 3); g.fillStyle = '#0b0703';
        g.beginPath(); g.ellipse(f.x + f.r * .2, f.y + 1, f.r * .7, f.r * .16, 0, 0, TAU); g.fill();
        g.globalAlpha = 1;

        g.strokeStyle = f.col; g.lineWidth = f.sw0; g.lineCap = 'round';
        g.beginPath(); g.moveTo(base.x, base.y); g.quadraticCurveTo(ctl.x, ctl.y, top.x, top.y); g.stroke();

        if (leafP > .02) {
          g.fillStyle = f.col;
          f.leaves.forEach(function (lf) {
            const pt = qpt(base, ctl, top, lf.u * Math.max(stemP, .05));
            const len = lf.len * leafP, wd = len * .3;
            const open = lerp(.12, .95, leafP);
            g.save(); g.translate(pt.x, pt.y); g.rotate(-Math.PI / 2 + lf.s * open + Math.sin(t * 1.2 + f.ph) * .05 * wind);
            g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(len * .5, -wd, len, 0); g.quadraticCurveTo(len * .5, wd * .7, 0, 0); g.fill();
            g.globalAlpha = .25; g.strokeStyle = '#e6f2d0'; g.lineWidth = 1;
            g.beginPath(); g.moveTo(0, 0); g.lineTo(len * .85, 0); g.stroke(); g.globalAlpha = 1;
            g.restore();
          });
        }

        const pal = f.pal;
        if (stemP < .6) return;
        const hs = easeOut(seg(stemP, .6, 1));
        if (openP < .04) {
          g.fillStyle = pal.b;
          g.beginPath(); g.ellipse(top.x, top.y - f.r * .18 * hs, f.r * .22 * hs, f.r * .36 * hs, 0, 0, TAU); g.fill();
          g.fillStyle = f.col;
          g.beginPath(); g.ellipse(top.x, top.y + f.r * .02, f.r * .2 * hs, f.r * .12 * hs, 0, 0, TAU); g.fill();
          return;
        }
        if (f.type === 'tulip') {
          const h = f.r * 1.5 * (.35 + .65 * openP), w = f.r * .55 * (.5 + .5 * openP), spread = openP * .5;
          [-1, 1, 0].forEach(function (sd) {
            g.save(); g.translate(top.x, top.y); g.rotate(sd * spread + sway * .01);
            g.fillStyle = sd === 0 ? pal.b : pal.d;
            g.beginPath(); g.moveTo(0, 0);
            g.bezierCurveTo(-w, -h * .25, -w * .7, -h * .85, 0, -h);
            g.bezierCurveTo(w * .7, -h * .85, w, -h * .25, 0, 0); g.fill();
            if (sd === 0) {
              g.globalAlpha = .45; g.strokeStyle = pal.l; g.lineWidth = Math.max(1, f.r * .06);
              g.beginPath(); g.moveTo(-w * .15, -h * .15); g.quadraticCurveTo(-w * .35, -h * .55, -w * .08, -h * .85); g.stroke(); g.globalAlpha = 1;
            }
            g.restore();
          });
          return;
        }
        const n = f.n, len = f.r * (.25 + .75 * openP), wd = f.r * .21 * (.55 + .45 * openP);
        g.save(); g.translate(top.x, top.y - f.r * .12); g.scale(1, f.tilt); g.rotate(f.rot + sway * .01);
        for (let ring = 0; ring < 2; ring++) {
          const l = len * (ring ? .82 : 1), w = wd * (ring ? .9 : 1);
          g.fillStyle = ring ? pal.b : pal.d;
          g.save(); if (ring) g.rotate(Math.PI / n);
          for (let i = 0; i < n; i++) { g.beginPath(); g.ellipse(l * .56, 0, l * .46, w, 0, 0, TAU); g.fill(); g.rotate(TAU / n); }
          if (ring) {
            g.globalAlpha = .42; g.strokeStyle = pal.l; g.lineWidth = Math.max(1, f.r * .05);
            for (let i = 0; i < n; i++) { g.beginPath(); g.moveTo(l * .22, 0); g.lineTo(l * .86, 0); g.stroke(); g.rotate(TAU / n); }
            g.globalAlpha = 1;
          }
          g.restore();
        }
        const cr = f.r * .2 * (.4 + .6 * openP);
        const cg = g.createRadialGradient(-cr * .2, -cr * .25, 0, 0, 0, cr);
        cg.addColorStop(0, pal.c); cg.addColorStop(1, '#8a6420');
        g.fillStyle = cg; g.beginPath(); g.arc(0, 0, cr, 0, TAU); g.fill();
        g.restore();
      }

      /* A young woman in a long dress, side-on, lit from the left. Soft gradients and rim light – no outlines. */
      function drawPerson() {
        if (!pose) return;
        const { x, y, s, tilt, phase, moving } = pose;

        g.save();
        g.translate(x, y); g.scale(1, .2);
        const shg = g.createRadialGradient(46 * s, 0, 0, 46 * s, 0, 80 * s);
        shg.addColorStop(0, 'rgba(8,16,4,.5)'); shg.addColorStop(1, 'rgba(8,16,4,0)');
        g.fillStyle = shg; g.beginPath(); g.ellipse(46 * s, 0, 90 * s, 80 * s, 0, 0, TAU); g.fill();
        g.restore();

        g.save();
        g.translate(x, y); g.scale(s, s);
        const stride = moving ? 1 : 0;
        const bob = moving ? Math.abs(Math.sin(phase)) * -2.2 : 0;
        const skin = '#d3a283', skinSh = '#a97656', hair = '#150e0d', rim = 'rgba(255,224,180,.6)';

        function foot(ph0, col) {
          const a = Math.sin(ph0) * .5 * stride, bend = Math.max(0, -Math.cos(ph0)) * .55 * stride;
          const hip = { x: 0, y: -88 + bob };
          const knee = { x: hip.x + Math.sin(a) * 44, y: hip.y + Math.cos(a) * 44 };
          const ft = { x: knee.x + Math.sin(a - bend) * 44, y: Math.min(0, knee.y + Math.cos(a - bend) * 44) };
          g.strokeStyle = col; g.lineCap = 'round'; g.lineWidth = 7;
          g.beginPath(); g.moveTo(knee.x, knee.y); g.lineTo(ft.x, ft.y); g.stroke();
          g.fillStyle = '#2a1d1a'; g.beginPath(); g.ellipse(ft.x + 5, ft.y - 1, 9, 3.4, 0, 0, TAU); g.fill();
        }
        foot(phase + Math.PI, skinSh);

        // back arm
        const swing = Math.sin(phase) * .5 * stride;
        g.strokeStyle = '#6b3d4b'; g.lineWidth = 6.5; g.lineCap = 'round';
        g.beginPath(); g.moveTo(-1, -138 + bob); g.quadraticCurveTo(-8 - swing * 12, -118, -6 - swing * 30, -96 + bob); g.stroke();
        g.strokeStyle = skinSh; g.lineWidth = 5; g.beginPath(); g.moveTo(-6 - swing * 30, -96 + bob); g.lineTo(-7 - swing * 34, -84 + bob); g.stroke();

        // dress: fitted bodice, flowing skirt
        const hem = Math.sin(phase + .6) * 4 * stride + Math.sin(t * 1.4) * 1.2;
        const dg2 = g.createLinearGradient(-20, -140, 24, -16);
        dg2.addColorStop(0, '#a85a74'); dg2.addColorStop(.5, '#86465d'); dg2.addColorStop(1, '#4e2636');
        g.fillStyle = dg2;
        g.beginPath();
        g.moveTo(-8, -141 + bob);
        g.quadraticCurveTo(-13, -118, -9, -100 + bob);          // back
        g.quadraticCurveTo(-26 - hem, -56, -25 - hem, -14);      // skirt back
        g.quadraticCurveTo(0, -7, 26 + hem, -14);                // hem
        g.quadraticCurveTo(14 + hem, -58, 8, -102 + bob);        // skirt front
        g.quadraticCurveTo(11, -122, 8, -141 + bob);             // chest
        g.closePath(); g.fill();
        // skirt folds
        g.globalAlpha = .22; g.strokeStyle = '#2a0f1b'; g.lineWidth = 1.4;
        for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(-2 + i * 5, -98 + bob); g.quadraticCurveTo(-8 + i * 7 - hem, -56, -12 + i * 12 - hem, -16); g.stroke(); }
        g.globalAlpha = 1;
        g.strokeStyle = rim; g.lineWidth = 1.3;
        g.beginPath(); g.moveTo(8, -139 + bob); g.quadraticCurveTo(11, -120, 8, -102 + bob); g.quadraticCurveTo(14 + hem, -58, 26 + hem, -15); g.stroke();
        g.fillStyle = '#d9b8a0'; g.beginPath(); g.ellipse(0, -101 + bob, 9.5, 2.2, 0, 0, TAU); g.globalAlpha = .35; g.fill(); g.globalAlpha = 1;   // waist sash

        foot(phase, skin);

        // neck, hair, head
        g.fillStyle = skin; g.fillRect(-2.8, -151 + bob, 5.6, 14);
        const hs = Math.sin(phase * 2) * 2.4 * stride + Math.sin(t * 1.3) * 1;
        g.fillStyle = hair;
        g.beginPath(); g.moveTo(-6, -167 + bob); g.bezierCurveTo(-30 - hs, -146, -20 - hs * 1.6, -112, -12 - hs * 2, -96 + bob); g.quadraticCurveTo(-3, -128, 3, -152 + bob); g.closePath(); g.fill();
        const hg = g.createLinearGradient(-8, -176, 12, -150);
        hg.addColorStop(0, skin); hg.addColorStop(1, skinSh);
        g.fillStyle = hg; g.beginPath(); g.ellipse(2.5, -161 + bob, 9.5, 12, 0, 0, TAU); g.fill();
        g.fillStyle = hair; g.beginPath(); g.ellipse(-1, -165 + bob, 11.2, 11.8, 0, Math.PI * .9, Math.PI * 2.12); g.fill();
        g.strokeStyle = rim; g.lineWidth = 1; g.beginPath(); g.arc(2.5, -161 + bob, 12, -.6, .55); g.stroke();
        g.fillStyle = skinSh; g.beginPath(); g.moveTo(12, -161 + bob); g.lineTo(14.5, -157 + bob); g.lineTo(11.5, -156 + bob); g.closePath(); g.fill();   // nose hint

        // front arm holding the can
        const handX = 34, handY = -100 + bob - tilt * 6;
        const elbowX = 14 + tilt * 4, elbowY = -118 + bob + 10;
        const wx = moving && tilt < .2 ? Math.sin(phase + Math.PI) * 10 : 0;
        g.strokeStyle = '#8d4a62'; g.lineWidth = 6.5; g.lineJoin = 'round';
        g.beginPath(); g.moveTo(5, -138 + bob); g.lineTo(elbowX + wx * .3, elbowY); g.stroke();
        g.strokeStyle = skin; g.lineWidth = 5;
        g.beginPath(); g.moveTo(elbowX + wx * .3, elbowY); g.lineTo(handX + wx * .2, handY); g.stroke();
        g.fillStyle = skin; g.beginPath(); g.arc(handX + wx * .2, handY, 3.6, 0, TAU); g.fill();

        // watering can
        g.save(); g.translate(handX + wx * .2, handY); g.rotate(pose.ang);
        const cg = g.createLinearGradient(-14, 0, 14, 0);
        cg.addColorStop(0, '#c9ccb8'); cg.addColorStop(.5, '#9fa28d'); cg.addColorStop(1, '#5f624f');
        g.fillStyle = cg;
        g.beginPath(); g.moveTo(-14, -8); g.lineTo(12, -8); g.lineTo(14, 18); g.lineTo(-16, 18); g.closePath(); g.fill();
        g.strokeStyle = '#8c8e7a'; g.lineWidth = 3; g.lineCap = 'round';
        g.beginPath(); g.moveTo(-14, -6); g.quadraticCurveTo(-30, -2, -15, 16); g.stroke();
        g.beginPath(); g.moveTo(10, 8); g.quadraticCurveTo(26, 2, 30, -14); g.stroke();
        g.fillStyle = '#b3b5a1'; g.beginPath(); g.ellipse(30, -14, 5.5, 2.4, -.5, 0, TAU); g.fill();
        g.restore();
        g.restore();
      }

      function drawParts() {
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i];
          if (p.k === 'drop') {
            g.strokeStyle = 'rgba(215,236,250,.85)'; g.lineWidth = Math.max(1, 1.6 * sc); g.lineCap = 'round';
            g.beginPath(); g.moveTo(p.px - (p.x - p.px) * 1.2, p.py - (p.y - p.py) * 1.2); g.lineTo(p.x, p.y); g.stroke();
            g.fillStyle = 'rgba(255,255,255,.9)'; g.fillRect(p.x - .5, p.y - .5, 1.2, 1.2);
          } else if (p.k === 'splash') {
            g.globalAlpha = 1 - p.life / p.max; g.fillStyle = '#dcecf6';
            g.beginPath(); g.arc(p.x, p.y, p.r, 0, TAU); g.fill(); g.globalAlpha = 1;
          } else if (p.k === 'dust') {
            g.globalAlpha = (1 - p.life / p.max) * .7; g.fillStyle = '#9b7a52';
            g.beginPath(); g.arc(p.x, p.y, p.r, 0, TAU); g.fill(); g.globalAlpha = 1;
          } else if (p.k === 'ring') {
            const k = p.life / p.max, rr = p.r + k * 11 * sc;
            g.globalAlpha = (1 - k) * .45; g.strokeStyle = '#e4f1fa'; g.lineWidth = 1;
            g.beginPath(); g.ellipse(p.x, p.y, rr, rr * .38, 0, 0, TAU); g.stroke(); g.globalAlpha = 1;
          }
        }
      }

      function drawLightAndMotes(light01) {
        if (light01 > .02) {
          g.save(); g.globalCompositeOperation = 'lighter';
          const ox2 = W * .2, oy2 = L.horizon - H * .02;
          for (let i = 0; i < 5; i++) {
            const a0 = .15 + i * .22 + Math.sin(t * .15 + i) * .02, w2 = .05 + (i % 2) * .03;
            const rg = g.createLinearGradient(ox2, oy2, ox2 + Math.cos(a0) * W, oy2 + Math.sin(a0) * W);
            rg.addColorStop(0, 'rgba(255,225,170,' + (.09 * light01) + ')'); rg.addColorStop(1, 'rgba(255,225,170,0)');
            g.fillStyle = rg; g.beginPath(); g.moveTo(ox2, oy2);
            g.lineTo(ox2 + Math.cos(a0 - w2) * W * 1.4, oy2 + Math.sin(a0 - w2) * W * 1.4);
            g.lineTo(ox2 + Math.cos(a0 + w2) * W * 1.4, oy2 + Math.sin(a0 + w2) * W * 1.4); g.closePath(); g.fill();
          }
          g.restore();
        }
        const planted = seg(t, T.seedStart + T.seedSpread, T.seedStart + T.seedSpread + 3);
        if (planted > 0) {
          const rg = g.createRadialGradient(L.nameCx, L.nameY, 0, L.nameCx, L.nameY, L.nameW * .62);
          rg.addColorStop(0, 'rgba(255,214,150,' + (.1 * planted * (.8 + .2 * Math.sin(t * 1.3))) + ')'); rg.addColorStop(1, 'rgba(255,214,150,0)');
          g.fillStyle = rg; g.fillRect(L.nameCx - L.nameW, L.nameY - L.capH * 3, L.nameW * 2, L.capH * 6);
        }
        const mAlpha = .35 + .65 * light01;
        for (let i = 0; i < motes.length; i++) {
          const m = motes[i];
          const x = m.x + Math.sin(t * .4 + m.ph) * 22 * sc, y = ((m.y - t * m.v) % (H * 1.1) + H * 1.1) % (H * 1.1) - H * .05;
          g.globalAlpha = m.a * mAlpha * (.55 + .45 * Math.sin(t * .9 + m.ph));
          g.drawImage(glowSprite, x - m.r * 2, y - m.r * 2, m.r * 4, m.r * 4);
        }
        g.globalAlpha = 1;
      }

      function render() {
        const light01 = easeInOut(seg(t, 18, 42));
        const camK = easeInOut(seg(t, T.camStart, T.camEnd));
        const push = seg(t, 0, T.camStart);

        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        g.clearRect(0, 0, W, H);
        g.save();
        const zoom = 1 + .04 * push + .07 * camK;
        const fx0 = W / 2, fy0 = H * .64;
        g.translate(fx0, fy0); g.scale(zoom, zoom); g.translate(-fx0, -fy0 + H * .04 * camK);

        drawSky(light01);
        drawGround(light01);

        const back = [], mid = [], front = [];
        for (let i = 0; i < flowers.length; i++) {
          const f = flowers[i];
          (f.letter ? front : f.y < L.footY ? back : f.y < L.nameY ? mid : front).push(f);
        }
        back.forEach(drawFlower);
        drawPerson();
        mid.forEach(drawFlower);
        drawSeeds();
        front.forEach(drawFlower);
        drawParts();
        drawLightAndMotes(light01);
        g.restore();

        // gentle vignette; deeper for the closing text
        const dark = camK * .58;
        const vg = g.createRadialGradient(W / 2, H * .5, Math.min(W, H) * .3, W / 2, H * .5, Math.max(W, H) * .78);
        vg.addColorStop(0, 'rgba(4,5,10,' + (dark * .55) + ')'); vg.addColorStop(1, 'rgba(4,5,10,' + (.3 + dark * .5) + ')');
        g.fillStyle = vg; g.fillRect(0, 0, W, H);
        g.fillStyle = 'rgba(5,6,12,' + (dark * .5) + ')'; g.fillRect(0, 0, W, H);

        const fade = 1 - easeOut(seg(t, 0, 3));
        if (fade > .002) { g.fillStyle = 'rgba(0,0,0,' + fade + ')'; g.fillRect(0, 0, W, H); }
      }

      /* ---------------- main loop ---------------- */
      function frame(now) {
        if (!alive) return;
        raf = requestAnimationFrame(frame);
        const real = Math.min(.1, (now - last) / 1000);
        last = now;
        if (skipping && t >= T.camStart - .5) skipping = false;
        const total = real * (skipping ? 10 : speed);
        const n = Math.max(1, Math.ceil(total / .04));
        for (let i = 0; i < n; i++) advance(total / n);
        render();
      }

      /* ---------------- interaction ---------------- */
      function begin() {
        if (begun || !btnOn) return;
        begun = true;
        btn.disabled = true;
        App.audio.unlock();
        App.state.started = true;
        document.body.classList.add('started');
        App.SceneManager.go('celebration', { mode: 'black', duration: 1600, hold: 900 });
      }
      ctx.on(btn, 'click', function (e) { e.stopPropagation(); begin(); });
      ctx.on(sec, 'click', begin);
      ctx.on(skipBtn, 'click', function (e) { e.stopPropagation(); if (t < T.camStart - .5) skipping = true; });
      ctx.on(window, 'resize', function () { build(); });

      const ready = (document.fonts && document.fonts.load)
        ? Promise.race([document.fonts.load('800 100px Jost'), new Promise(function (r) { setTimeout(r, 1200); })]).catch(function () {})
        : Promise.resolve();
      ready.then(function () {
        if (!alive) return;
        build();
        last = performance.now();
        raf = requestAnimationFrame(frame);
      });

      ctx.add(function () { alive = false; cancelAnimationFrame(raf); });
    }
  });
})(window.App);
