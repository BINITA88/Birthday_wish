/* SCENE – "Message for You". A sealed envelope lies on a wooden table with an OPEN button under it. Only after OPEN is pressed
   does the flap lift and the letter appear, typing itself out letter by letter. The letter is the one birthday message
   (config.js, text.msgPages) on three pages that turn; on the last one "Make a wish" starts the final birthday finale
   with balloons and confetti. (The older 'letter' scene is kept in letterScene.js but is no longer used.) */
(function (App) {
  const { CONFIG: C, u, FX } = App;

  App.SceneManager.register('message', {
    init(sec, ctx) {
      const T = C.text, PAGES = T.msgPages, NP = PAGES.length;
      const CURL = '<svg viewBox="0 0 44 44" aria-hidden="true"><path d="M3 41 C3 20 20 3 41 3" fill="none" stroke="#b9873f" stroke-width="1.4" stroke-linecap="round"/><path d="M3 41 C11 34 13 29 12.5 21" fill="none" stroke="#b9873f" stroke-width="1.1" stroke-linecap="round"/><circle cx="41" cy="3" r="2.3" fill="#b9873f"/><circle cx="3" cy="41" r="1.8" fill="#b9873f"/><path d="M14 14 q3 -6 8 -2 q-3 6 -8 2z" fill="#d9a85b" opacity=".8"/></svg>';
      const ORN = '<span class="orn orn-l" aria-hidden="true">' + CURL + '</span><span class="orn orn-r" aria-hidden="true">' + CURL + '</span>';
      sec.innerHTML =
        '<div class="msg-vignette" aria-hidden="true"></div>' +
        '<div class="msg-candle" aria-hidden="true"><i class="cf-glow"></i><i class="cf-bend"><i class="cf-flame"><i class="cf-core"></i></i></i></div>' +
        '<div class="msg-stage">' +
          '<div class="env" role="img" aria-label="A sealed envelope">' +
            '<div class="env-back"></div>' +
            '<div class="env-sheet"></div>' +
            '<div class="env-front"></div>' +
            '<div class="env-flap"></div>' +
            '<div class="env-to">To: <b>' + u.esc(C.name) + '</b></div>' +
            '<div class="env-seal" aria-hidden="true"><span>♥</span></div>' +
          '</div>' +
          '<button class="btn primary msg-open fade-up" type="button">' + u.esc(T.msgOpen) + '</button>' +
        '</div>' +
        '<div class="msg-book">' +
          PAGES.map(function (items, i) {
            const last = i === NP - 1;
            const nav = i === 0
              ? '<nav class="mb-nav mb-nav-first"><button class="mb-btn mb-next" type="button">' + u.esc(T.msgTurn) + ' <i aria-hidden="true">›</i></button></nav>'
              : '<nav class="mb-nav"><button class="mb-btn mb-back" type="button"><i aria-hidden="true">‹</i> ' + u.esc(T.msgBack) + '</button><span class="mb-num">' + (i + 1) + ' / ' + NP + '</span>' +
                (last ? '<button class="mb-btn mb-wish" type="button">' + u.esc(T.msgContinue) + '</button>' : '<button class="mb-btn mb-next" type="button">' + u.esc(T.msgTurn) + ' <i aria-hidden="true">›</i></button>') + '</nav>';
            return '<article class="mb-sheet ' + (i === 0 ? 'msg-paper cur' : 'mb-letter') + '" tabindex="-1" aria-label="The letter, page ' + (i + 1) + ' of ' + NP + '">' + ORN +
              '<div class="mb-text' + (i === 0 ? ' mb-welcome' : '') + '">' +
              items.map(function (it, k) { return '<p class="lt-' + it[0] + '" style="--i:' + k + '">' + u.esc(it[1]) + '</p>'; }).join('') + '</div>' + nav + '</article>';
          }).join('') +
          ['tw1', 'tw2', 'tw3', 'tw4', 'tw5', 'tw6'].map(function (c) { return '<i class="tw ' + c + '" aria-hidden="true">✦</i>'; }).join('') +
        '</div>' +
        '<div class="msg-finale" aria-live="polite">' +
          '<div class="mf-scrim" aria-hidden="true"></div>' +
          '<div class="mf-copy"><p class="mf-text"></p>' +
            '<button class="btn primary mf-balloons fade-up" type="button">' + u.esc(T.finalBalloons) + '</button></div>' +
        '</div>';

      const env = sec.querySelector('.env');
      const openBtn = sec.querySelector('.msg-open');
      const paper = sec.querySelector('.msg-paper');                 // the letter, which writes itself
      const wishBtn = sec.querySelector('.mb-wish');
      const sheets = Array.from(sec.querySelectorAll('.mb-sheet'));
      const firstNext = paper.querySelector('.mb-next');
      const finale = sec.querySelector('.msg-finale');
      const balloonBtn = sec.querySelector('.mf-balloons');
      u.hint(openBtn);
      u.hint(balloonBtn);

      App.audio.warm('music');                                      // the Happy Birthday tune downloads quietly while she reads
      const fx0 = FX.field(sec, { motes: 14, rgb: '255,205,130', size: 0.6 });
      ctx.add(fx0.destroy);

      // the sealed envelope settles on the table, then the OPEN button appears below it
      ctx.later(function () { sec.classList.add('settled'); }, 150);
      ctx.show(openBtn, 1500);

      // The last button goes nowhere: each tap sends a few of the heart-balloon bouquets floating up from the bottom of the photo.
      ctx.on(balloonBtn, 'click', function () { FX.release(finale, { count: 3 }); });

      /* ---- the pages turn over, one after another ---- */
      const candle = sec.querySelector('.msg-candle');
      /** A breath of air: the candle flame bends away and its light dips, then it steadies. */
      function gust() { candle.classList.remove('gust'); void candle.offsetWidth; candle.classList.add('gust'); }
      function showPage(n) {
        gust();
        const bookRect = sec.querySelector('.msg-book').getBoundingClientRect();
        FX.flutter(sec, { rect: bookRect });      // butterflies fly up out of the letter as the page turns …
        FX.petals(sec, { rect: bookRect });       // … and rose petals burst out of it and drift away
        sheets.forEach(function (sh, i) {
          sh.classList.toggle('turned', i < n);
          sh.classList.toggle('cur', i === n);
          sh.inert = i !== n;
        });
        ctx.later(function () { sheets[n].focus({ preventScroll: true }); }, 60);
      }
      sheets.forEach(function (sh, i) {
        sh.inert = i !== 0;
        const next = sh.querySelector('.mb-next'), back = sh.querySelector('.mb-back');
        if (next) ctx.on(next, 'click', function () { showPage(i + 1); });
        if (back) ctx.on(back, 'click', function () { showPage(i - 1); });
      });

      ctx.on(wishBtn, 'click', function () {
        wishBtn.disabled = true;
        App.audio.swap('evergreen', 'music');   // the moment the puzzle starts, the song crossfades straight into the Happy Birthday tune (no gap, never a pause)
        party();
      });

      /** Shrinks the letter's text until all of it sits on the paper (it scrolls only on a really tiny screen). */
      function fit() {
        sec.querySelectorAll('.mb-text').forEach(function (t) {
          let fs = Math.max(14, Math.min(22, t.clientWidth / 25));
          t.style.overflowY = 'hidden';
          t.style.fontSize = fs + 'px';
          while (fs > 11 && t.scrollHeight > t.clientHeight + 1) { fs -= 0.5; t.style.fontSize = fs + 'px'; }
          if (t.scrollHeight > t.clientHeight + 1) t.style.overflowY = 'auto';
        });
      }
      fit();
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
      ctx.on(window, 'resize', fit);

      let opened = false, skip = false;
      ctx.on(openBtn, 'click', function () {
        if (opened) return;
        opened = true;
        openBtn.disabled = true;
        openBtn.classList.remove('in');
        run();
      });
      ctx.on(paper, 'click', function () { skip = true; });          // a tap on the paper writes the rest at once

      /* ---- page 1 types itself out the moment OPEN is pressed ---- */
      // Every line keeps its full text in place (the not-yet-typed part is invisible), so the layout never jumps and the fitted font size stays right.
      const welcome = Array.from(paper.querySelectorAll('.mb-welcome > *')).map(function (el) {
        const chars = Array.from(el.textContent);
        el.innerHTML = '<span class="ty-a"></span><span class="ty-b"></span>';
        el.lastChild.textContent = chars.join('');
        return { el: el, a: el.firstChild, b: el.lastChild, chars: chars };
      });
      const showTyped = function (it, k) {
        it.a.textContent = it.chars.slice(0, k).join('');
        it.b.textContent = it.chars.slice(k).join('');
      };
      /** Types one line by the clock (one screen update per frame, so a slow phone just shows fewer steps); resolves when done or tapped. */
      function typeLine(it, cps) {
        it.el.classList.add('typing');
        return new Promise(function (done) {
          const len = it.chars.length, t0 = performance.now();
          let shown = -1;
          (function frame(now) {
            if (ctx.dead) return;
            const k = skip ? len : Math.min(len, Math.floor((now - t0) / 1000 * cps) + 1);
            if (k !== shown) { shown = k; showTyped(it, k); }
            if (k >= len) { it.el.classList.remove('typing'); done(); } else requestAnimationFrame(frame);
          })(t0);
        });
      }

      async function run() {
        const envRect = env.getBoundingClientRect();
        sec.classList.add('opening');                 // the seal breaks and the flap lifts …
        FX.glitter(sec, { rect: envRect, count: App.isSmall() ? 10 : 16 });          // … a first sprinkle of sparkles escapes from the envelope
        await ctx.sleep(1000);
        sec.classList.add('rising');                  // … and the letter slowly slides up out of the envelope, above it
        // while it rises, butterflies and sparkles keep drifting up with it
        const rise = [0, 500, 1000, 1500, 2000];
        rise.forEach(function (ms, i) {
          ctx.later(function () {
            FX.glitter(sec, { rect: envRect, count: App.isSmall() ? 12 : 18 });
            if (i % 2 === 0) FX.flutter(sec, { rect: envRect, count: App.isSmall() ? 5 : 7 });
          }, ms);
        });
        await ctx.sleep(2900);
        sec.classList.add('written');                 // the envelope sinks away, the paper takes the stage
        const bookRect = sec.querySelector('.msg-book').getBoundingClientRect();
        FX.flutter(sec, { rect: bookRect, count: App.isSmall() ? 6 : 9 });           // a last wave rises from the letter itself
        FX.glitter(sec, { rect: bookRect, count: App.isSmall() ? 14 : 22 });
        gust();
        fit();
        paper.focus({ preventScroll: true });
        await ctx.sleep(100);

        const total = welcome.reduce(function (sum, it) { return sum + it.chars.length; }, 0);
        const cps = App.reduced ? 1000 : Math.max(45, total / 24);       // the whole page takes about 24 s
        try {
          for (const it of welcome) {
            await typeLine(it, /lt-(kicker|dear)/.test(it.el.className) ? cps * 0.5 : cps);
            if (!skip) await ctx.sleep(/lt-(kicker|dear)/.test(it.el.className) ? 400 : 220);
          }
          await ctx.sleep(600);
        } finally {                                   // however it ends, all of page 1 is on screen and the way on is open
          welcome.forEach(function (it) { showTyped(it, it.chars.length); it.el.classList.remove('typing'); });
          firstNext.classList.add('in');              // once page 1 is written, the reader turns the page when ready; the last page leads to the finale
        }
      }

      function party() {
        finale.querySelector('.mf-text').textContent = T.finalWish.replace(/,\s*/, ',\n');   // a line break after the comma
        sec.classList.add('party');
        const puzzle = App.puzzle(finale, ctx, C.posterImage);   // her photo as a puzzle across the whole screen; built only now, so it costs the letter no graphics memory
        // first the puzzle gathers into her photo; only then do the words and all the decoration arrive
        puzzle.start(function () {
          sec.classList.add('titled');
          ctx.later(function () { balloonBtn.classList.add('in'); }, 2500);          // then a button that sends a few more balloons floating up
          FX.balloons(finale, { count: App.isSmall() ? 12 : 18, prefill: true, party: true });      // the party balloons rise over the photo
          const fx = FX.field(finale, { motes: 0, rgb: '255,205,120', rate: 26, max: 120, confetti: true });
          ctx.add(fx.destroy);
          const W = sec.clientWidth, H = sec.clientHeight;
          fx.burst(W / 2, H * 0.35, 80, true);
          ctx.later(function () { fx.burst(W * 0.22, H * 0.5, 50, true); }, 450);
          ctx.later(function () { fx.burst(W * 0.78, H * 0.5, 50, true); }, 800);
        });
      }
    }
  });
})(window.App = window.App || {});
