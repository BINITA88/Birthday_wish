/* Opening — a natural, twinkling night sky. The letters of PRATIMA appear as blinking stars, rising from the bottom and the top of the sky,
   and gather into her name; then the greeting and the question are written out, and the button appears. */
(function (App) {
  const { CONFIG: C, FX, u } = App;

  App.SceneManager.register('name', {
    init(sec, ctx) {
      sec.innerHTML =
        '<div class="moon-stars" aria-hidden="true"></div><canvas class="sky-twinkle" aria-hidden="true"></canvas><div class="sky-calm" aria-hidden="true"></div><div class="moon-haze" aria-hidden="true"></div>' +
        '<div class="photo-moon"><img class="moon-composite" src="assets/images/moon-pratima-composite.webp" alt="Pratima in the moon"></div>' +
        '<div class="sky-name" aria-label="PRATIMA"></div>' +
        '<p class="moon-greeting"></p>' +
        '<div class="moon-ask"><p class="ask-1"></p><p class="ask-2"></p></div>' +
        '<button class="moon-begin" type="button">' + u.esc(C.text.waitButton) + '</button>';
      const fx = FX.field(sec, { motes: 12, rgb: '255,233,185', size: 0.6 });
      ctx.add(fx.destroy);
      /* ---- the sky: many small stars that blink on and off at their own pace, a few brighter ones with fine spikes, and now and then a shooting star ---- */
      const skyCanvas = sec.querySelector('.sky-twinkle');
      const sg = skyCanvas.getContext('2d');
      let SW = 0, SH = 0, stars = [], shoot = null, nextShoot = 6000 + Math.random() * 5000;
      const STAR_COLORS = ['255,255,255', '255,255,255', '214,228,255', '190,212,255', '255,240,214', '255,226,190'];
      function buildSky() {
        const d = Math.min(2, window.devicePixelRatio || 1);
        SW = sec.clientWidth; SH = sec.clientHeight;
        skyCanvas.width = Math.round(SW * d); skyCanvas.height = Math.round(SH * d);
        sg.setTransform(d, 0, 0, d, 0, 0);
        const n = Math.round(SW * SH / (App.isSmall() ? 4300 : 6200));
        stars = [];
        for (let i = 0; i < n; i++) {
          const big = Math.random() < 0.07;
          stars.push({ x: Math.random() * SW, y: Math.random() * SH, r: big ? 1.3 + Math.random() * 0.9 : 0.35 + Math.random() * 0.85,
            a: big ? 0.8 + Math.random() * 0.2 : 0.3 + Math.random() * 0.6, per: 2.2 + Math.random() * 5.5, ph: Math.random() * 6.283,
            col: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)], big: big });
        }
      }
      function drawSky(now) {
        sg.clearRect(0, 0, SW, SH);
        const t = now / 1000;
        for (let i = 0; i < stars.length; i++) {
          const st = stars[i];
          const tw = Math.pow(0.5 + 0.5 * Math.sin(t * 6.283 / st.per + st.ph), 2.2);       // blinks on and off, mostly dim, now and then bright
          const al = st.a * (0.1 + 0.9 * tw);
          if (al < 0.03) continue;
          sg.fillStyle = 'rgba(' + st.col + ',' + al.toFixed(3) + ')';
          if (st.big) {
            const g2 = sg.createRadialGradient(st.x, st.y, 0, st.x, st.y, st.r * 5);
            g2.addColorStop(0, 'rgba(' + st.col + ',' + (al * 0.55).toFixed(3) + ')'); g2.addColorStop(1, 'rgba(' + st.col + ',0)');
            sg.fillStyle = g2; sg.fillRect(st.x - st.r * 5, st.y - st.r * 5, st.r * 10, st.r * 10);
            sg.fillStyle = 'rgba(' + st.col + ',' + al.toFixed(3) + ')';
            sg.fillRect(st.x - st.r * 3.2, st.y - 0.4, st.r * 6.4, 0.8); sg.fillRect(st.x - 0.4, st.y - st.r * 3.2, 0.8, st.r * 6.4);     // fine spikes
          }
          sg.beginPath(); sg.arc(st.x, st.y, st.r, 0, 6.283); sg.fill();
        }
        if (!App.reduced) {
          if (!shoot && now > nextShoot) { shoot = { x: SW * (0.45 + Math.random() * 0.5), y: SH * Math.random() * 0.35, born: now, life: 900, len: 90 + Math.random() * 90 }; }
          if (shoot) {
            const k = (now - shoot.born) / shoot.life;
            if (k >= 1) { shoot = null; nextShoot = now + 8000 + Math.random() * 9000; }
            else {
              const hx = shoot.x - k * SW * 0.32, hy = shoot.y + k * SH * 0.18, a = Math.sin(Math.PI * k);
              const tx = hx + shoot.len * 0.87, ty = hy - shoot.len * 0.49;
              const lg = sg.createLinearGradient(hx, hy, tx, ty); lg.addColorStop(0, 'rgba(255,255,255,' + (0.85 * a).toFixed(3) + ')'); lg.addColorStop(1, 'rgba(255,255,255,0)');
              sg.strokeStyle = lg; sg.lineWidth = 1.4; sg.beginPath(); sg.moveTo(hx, hy); sg.lineTo(tx, ty); sg.stroke();
            }
          }
        }
      }
      buildSky();
      ctx.on(window, 'resize', function () { buildSky(); if (App.reduced) drawSky(0); });
      if (App.reduced) drawSky(0);
      else {
        let skyRaf = 0;
        (function skyFrame(now) { skyRaf = requestAnimationFrame(skyFrame); drawSky(now); })(performance.now());
        ctx.add(function () { cancelAnimationFrame(skyRaf); });
      }

      const skyName = sec.querySelector('.sky-name');
      const nameY = function (h) { return h < 500 ? 0.31 : h < 720 ? 0.34 : 0.38; };       // the name sits a little higher on short screens, so the lines below have room
      const letters = Array.from(C.name);
      // every letter is first a star in its own, different place in the sky (spread high and low, left and right); it becomes its letter right there
      const SPOTS = [[14, 68], [76, 16], [36, 86], [62, 34], [88, 60], [46, 14], [22, 42], [70, 80]];
      const spots = SPOTS.slice().sort(function () { return Math.random() - .5; });
      const nodes = letters.map(function (letter, index) {
        const node = document.createElement('span');
        const step = sec.clientWidth < 600 ? 11.4 : 7;                                   // how far apart the letters of the name finally are
        const finalLeft = 50 + (index - (letters.length - 1) / 2) * step;
        const spot = spots[index % spots.length];
        node.className = 'sky-name-letter';
        node.style.left = spot[0] + '%';
        node.style.top = spot[1] + '%';
        node.dataset.finalLeft = finalLeft + '%';
        node.style.setProperty('--gd', (-Math.random() * 3.2).toFixed(2) + 's');       // each letter's glow goes on and off at its own moment
        node.innerHTML = '<i aria-hidden="true">✦</i><b>' + u.esc(letter) + '</b>';
        skyName.appendChild(node);
        return node;
      });
      const greeting = sec.querySelector('.moon-greeting');
      const btn = sec.querySelector('.moon-begin');
      u.hint(btn);

      // P first, then r, a, t, i, m, a: each star twinkles slowly where it is, its letter slowly shows in the same place (the star turns into it),
      // and then the letter glides into its place in the name
      const STAR_GAP = 800, TWINKLE_MS = 1800, GLIDE_AFTER = 1500, GLIDE_MS = 2200;
      nodes.forEach(function (node, i) {
        const t = 700 + i * STAR_GAP;
        ctx.later(function () { node.classList.add('appeared'); }, t);
        ctx.later(function () { node.classList.add('letter-visible'); }, t + TWINKLE_MS);
        ctx.later(function () { node.style.left = node.dataset.finalLeft; node.style.top = (nameY(sec.clientHeight || window.innerHeight) * 100) + '%'; node.classList.add('gathered'); }, t + TWINKLE_MS + GLIDE_AFTER);
      });
      const gatherAt = 700 + (nodes.length - 1) * STAR_GAP + TWINKLE_MS + GLIDE_AFTER + GLIDE_MS;       // the last letter has reached its place

      // the greeting is written out, then the question below it, then the button appears
      const ask1 = sec.querySelector('.ask-1'), ask2 = sec.querySelector('.ask-2');
      const count = function (t) { return Array.from(t).filter(function (ch) { return ch !== ' '; }).length; };
      // once every letter has gathered, the gaps between them close up slowly, so the name reads as one word;
      // then every letter is set on a whole pixel, so the finished name is sharp and clear
      const closeAt = gatherAt + 500, CLOSE_MS = 2000;
      function tightCenters() {                                    // where each letter's middle goes: a small, even gap between letters, the whole word centred
        const W = sec.clientWidth || window.innerWidth;
        const widths = nodes.map(function (n) { return n.querySelector('b').offsetWidth; });
        const gap = parseFloat(getComputedStyle(nodes[0].querySelector('b')).fontSize) * 0.1;
        const total = widths.reduce(function (acc, w) { return acc + w; }, 0) + gap * (nodes.length - 1);
        let x = W / 2 - total / 2;
        const cx = widths.map(function (w) { const c = x + w / 2; x += w + gap; return c; });
        return { cx: cx, W: W, H: sec.clientHeight || window.innerHeight };
      }
      let crisp = false;
      function snapName() {
        const t = tightCenters();
        nodes.forEach(function (n, i) {
          const w = n.offsetWidth, h = n.offsetHeight;
          n.style.transition = 'none';
          n.style.transform = 'none';                              // no scaling or half-pixel centring left on the letters
          n.style.left = Math.round(t.cx[i] - w / 2) + 'px';
          n.style.top = Math.round(t.H * nameY(t.H) - h / 2) + 'px';
          n.classList.add('crisp');
        });
        crisp = true;
      }
      ctx.on(window, 'resize', function () { if (crisp) snapName(); });
      ctx.later(function () {
        const t = tightCenters();
        nodes.forEach(function (n, i) {
          n.style.transition = 'left ' + CLOSE_MS + 'ms cubic-bezier(.45,.05,.25,1)';
          n.style.left = (t.cx[i] / t.W * 100) + '%';
        });
      }, closeAt);
      ctx.later(snapName, closeAt + CLOSE_MS + 120);
      const greetingAt = closeAt + CLOSE_MS - 400;
      const ask1At = greetingAt + count(C.text.waitGreeting) * 120 + 700;
      const ask2At = ask1At + count(C.text.waitAsk1) * 85 + 500;
      const btnAt = ask2At + count(C.text.waitAsk2) * 85 + 600;
      ctx.later(function () {
        u.letters(greeting, C.text.waitGreeting, 120);
        greeting.classList.add('reveal', 'in');
      }, greetingAt);
      ctx.later(function () { u.letters(ask1, C.text.waitAsk1, 85); ask1.classList.add('reveal', 'in'); }, ask1At);
      ctx.later(function () { u.letters(ask2, C.text.waitAsk2, 85); ask2.classList.add('reveal', 'in'); }, ask2At);
      ctx.show(btn, btnAt);
      ctx.on(btn, 'click', function () {
        if (btn.disabled) return;
        btn.disabled = true;
        App.audio.unlock(['evergreen', 'music']);          // every track is primed for this browser except the opening song, which simply starts below
        App.state.started = true;
        document.body.classList.add('started');
        new Image().src = C.posterImage;     // her last photo is fetched now, ahead of the music
        App.audio.fadeIn('evergreen', 1500);  // the Evergreen medley starts when the story begins and plays until the Happy Birthday tune
        // The flower-letter 'blossom' screen is switched off (its scene stays below): go straight to the bouquet (sunflowers, then roses in the same scene).
        // App.SceneManager.go('blossom', { mode: 'black', duration: 900, hold: 200 });
        App.SceneManager.go('bouquet', { mode: 'black', duration: 900, hold: 200 });
      });
    }
  });

  App.SceneManager.register('blossom', {
    init(sec, ctx) {
      sec.innerHTML = '<div class="name-glow"></div><div class="name-wrap"></div><div class="name-message"><p>Pratima, this little world was made just for you.</p><button class="btn primary" type="button">Enter your garden ♡</button></div>';
      const glow = sec.querySelector('.name-glow');
      const fx = FX.field(sec, { motes: 24, rgb: '255,207,143', size: 0.8 });
      ctx.add(fx.destroy);
      const bloom = FX.flowerName(sec.querySelector('.name-wrap'), C.name, {
        maxWidth: 1400,
        onConverge: function () { glow.classList.add('on'); sec.classList.add('converging'); }
      });
      ctx.add(bloom.destroy);
      bloom.done.then(function () {
        if (!ctx.dead) ctx.later(function () { sec.classList.add('complete'); }, 650);
      });
      ctx.on(sec.querySelector('.btn'), 'click', function () {
        App.SceneManager.go('flower', { mode: 'black', duration: 900, hold: 150 });
      });
    }
  });
})(window.App = window.App || {});
