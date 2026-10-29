/* SCENE – "Message for You". A sealed envelope lies on a wooden table with an OPEN button under it. Only after OPEN is pressed
   does the flap lift and the letter appear, writing itself out letter by letter. When it is written, the final birthday wish
   arrives with balloons and confetti. Only the first page is typed out; the two long letter pages show their text at once. (The older 'letter' scene is kept in letterScene.js but is no longer used.) */
(function (App) {
  const { CONFIG: C, u, FX } = App;

  App.SceneManager.register('message', {
    init(sec, ctx) {
      const T = C.text, L = T.msgLetter, W = T.msgWelcome;
      sec.innerHTML =
        '<div class="msg-vignette" aria-hidden="true"></div>' +
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
          '<article class="mb-sheet msg-paper cur" tabindex="-1" aria-live="off">' +
            '<div class="mb-text mb-welcome"><h1 class="mp-h">' + u.esc(W.title) + '</h1>' +
              W.paras.map(function (t) { return '<p>' + u.esc(t) + '</p>'; }).join('') +
              '<p class="mp-sign">' + u.esc(W.sign) + '</p></div>' +
            '<nav class="mb-nav mb-nav-first"><button class="mb-btn mb-next" type="button">' + u.esc(T.msgTurn) + ' <i aria-hidden="true">›</i></button></nav>' +
          '</article>' +
          '<article class="mb-sheet mb-letter" tabindex="-1" aria-label="The letter, page 1 of 2">' +
            '<div class="mb-text">' +
              '<p class="lt-kicker">' + u.esc(L.title) + '</p><p class="lt-sub">' + u.esc(L.sub) + '</p><h2 class="lt-dear">' + u.esc(L.dear) + '</h2>' +
              L.page1.map(function (t) { return '<p>' + u.esc(t) + '</p>'; }).join('') +
            '</div>' +
            '<nav class="mb-nav"><button class="mb-btn mb-back" type="button"><i aria-hidden="true">‹</i> ' + u.esc(T.msgBack) + '</button><span class="mb-num">1 / 2</span><button class="mb-btn mb-next" type="button">' + u.esc(T.msgTurn) + ' <i aria-hidden="true">›</i></button></nav>' +
          '</article>' +
          '<article class="mb-sheet mb-letter" tabindex="-1" aria-label="The letter, page 2 of 2">' +
            '<div class="mb-text">' +
              L.page2.map(function (t, i) { return '<p' + (i === 5 ? ' class="lt-hb"' : '') + '>' + u.esc(t) + '</p>'; }).join('') +
              '<p class="lt-close">' + u.esc(L.close) + '</p><p class="lt-from">' + u.esc(L.from) + '</p>' +
            '</div>' +
            '<nav class="mb-nav"><button class="mb-btn mb-back" type="button"><i aria-hidden="true">‹</i> ' + u.esc(T.msgBack) + '</button><span class="mb-num">2 / 2</span><button class="mb-btn mb-wish" type="button">' + u.esc(T.msgContinue) + '</button></nav>' +
          '</article>' +
        '</div>' +
        '<div class="msg-finale" aria-live="polite">' +
          '<div class="mf-scrim" aria-hidden="true"></div>' +
          '<div class="mf-copy"><p class="mf-text"></p></div>' +
        '</div>';

      const env = sec.querySelector('.env');
      const openBtn = sec.querySelector('.msg-open');
      const paper = sec.querySelector('.msg-paper');                 // page 1 (the one that writes itself)
      const sheets = Array.from(sec.querySelectorAll('.mb-sheet'));
      const firstNext = paper.querySelector('.mb-next');
      const finale = sec.querySelector('.msg-finale');
      u.hint(openBtn);

      App.audio.warm('music');                                      // the Happy Birthday tune downloads quietly while she reads
      const fx0 = FX.field(sec, { motes: 14, rgb: '255,205,130', size: 0.6 });
      ctx.add(fx0.destroy);

      // the sealed envelope settles on the table, then the OPEN button appears below it
      ctx.later(function () { sec.classList.add('settled'); }, 150);
      ctx.show(openBtn, 1500);

      /* ---- the letter: page 1 turns over to reveal the two pages of text ---- */
      function showPage(n) {
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
      ctx.on(sec.querySelector('.mb-wish'), 'click', function (e) {
        e.currentTarget.disabled = true;
        party();
      });

      /** Shrinks each letter page's text until all of it sits on the page (it scrolls only on a really tiny screen). */
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
        sec.classList.add('opening');                 // the seal breaks and the flap lifts …
        await ctx.sleep(700);
        sec.classList.add('rising');                  // … the letter slides out and opens up on the table
        await ctx.sleep(700);
        sec.classList.add('written');                 // the envelope sinks away, the paper takes the stage
        fit();
        paper.focus({ preventScroll: true });
        await ctx.sleep(100);

        const total = welcome.reduce(function (sum, it) { return sum + it.chars.length; }, 0);
        const cps = App.reduced ? 1000 : Math.max(45, total / 24);       // the whole page takes about 24 s
        try {
          for (const it of welcome) {
            await typeLine(it, it.el.classList.contains('mp-h') ? cps * 0.5 : cps);
            if (!skip) await ctx.sleep(it.el.classList.contains('mp-h') ? 500 : 220);
          }
          await ctx.sleep(600);
        } finally {                                   // however it ends, all of page 1 is on screen and the way on is open
          welcome.forEach(function (it) { showTyped(it, it.chars.length); it.el.classList.remove('typing'); });
          firstNext.classList.add('in');              // the reader turns the page when ready; the last page leads to the party
        }
      }

      function party() {
        finale.querySelector('.mf-text').textContent = T.finalWish.replace(/,\s*/, ',\n');   // a line break after the comma
        sec.classList.add('party');
        const puzzle = App.puzzle(finale, ctx, C.posterImage);   // her photo as a puzzle across the whole screen; built only now, so it costs the letter no graphics memory
        // first the puzzle gathers into her photo; only then do the words and all the decoration arrive
        puzzle.start(function () {
          sec.classList.add('titled');
          App.audio.fadeOut('love', 1500);                // the love song, which carried the puzzle, gives way to the Happy Birthday tune …
          App.audio.fadeIn('music', 900);                 // … as the wish, the balloons and the confetti arrive
          FX.balloons(finale, { count: App.isSmall() ? 12 : 18, prefill: true, party: true });      // the party balloons rise over the photo
          const fx = FX.field(finale, { motes: 0, rgb: '255,205,120', rate: 26, max: 120, confetti: true });
          ctx.add(fx.destroy);
          const W = sec.clientWidth, H = sec.clientHeight;
          fx.burst(W / 2, H * 0.35, 80, true);
          ctx.later(function () { fx.burst(W * 0.22, H * 0.5, 50, true); }, 450);
          ctx.later(function () { fx.burst(W * 0.78, H * 0.5, 50, true); }, 800);
          if (App.audio.has('celebration')) App.audio.play('celebration');
        });
      }
    }
  });
})(window.App = window.App || {});
