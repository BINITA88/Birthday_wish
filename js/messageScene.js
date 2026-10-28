/* SCENE – "Message for You". A sealed envelope lies on a wooden table with an OPEN button under it. Only after OPEN is pressed
   does the flap lift and the letter appear, writing itself out letter by letter. When it is written, the final birthday wish
   arrives with balloons and confetti. (The older 'letter' scene is kept in letterScene.js but is no longer used.) */
(function (App) {
  const { CONFIG: C, u, FX } = App;

  App.SceneManager.register('message', {
    init(sec, ctx) {
      const T = C.text, L = T.msgLetter;
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
            '<h1 class="mp-h"></h1><p class="mp-p1"></p><p class="mp-p2"></p><p class="mp-sign"></p>' +
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
          '<div class="mf-copy"><p class="mf-text"></p>' +
          '<button class="btn primary mf-replay fade-up" type="button">' + u.esc(T.replay) + '</button></div>' +
        '</div>';

      const env = sec.querySelector('.env');
      const openBtn = sec.querySelector('.msg-open');
      const paper = sec.querySelector('.msg-paper');                 // page 1 (the one that writes itself)
      const sheets = Array.from(sec.querySelectorAll('.mb-sheet'));
      const firstNext = paper.querySelector('.mb-next');
      const finale = sec.querySelector('.msg-finale');
      const replay = sec.querySelector('.mf-replay');
      u.hint(openBtn);
      u.hint(replay);

      const puzzle = App.puzzle(finale, ctx, C.posterImage);        // her photo, as a puzzle that gathers across the whole finale screen
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

      /** Types `text` into `el` with a blinking caret; resolves when done (or at once if the reader tapped to skip). */
      async function type(el, text, step) {
        el.classList.add('typing');
        let out = '';
        for (const ch of Array.from(text)) {
          out += ch;
          el.textContent = out;
          paper.scrollTop = paper.scrollHeight;
          if (!skip) await ctx.sleep(/[.,!?]/.test(ch) ? step * 5 : step);
        }
        el.classList.remove('typing');
      }

      async function run() {
        sec.classList.add('opening');                 // the seal breaks and the flap lifts …
        await ctx.sleep(1300);
        sec.classList.add('rising');                  // … the letter slides out and opens up on the table
        await ctx.sleep(1100);
        sec.classList.add('written');                 // the envelope sinks away, the paper takes the stage
        fit();
        paper.focus({ preventScroll: true });
        await ctx.sleep(700);

        const step = App.reduced ? 12 : 42;
        await type(sec.querySelector('.mp-h'), T.msgGreeting, step * 1.6);
        if (!skip) await ctx.sleep(350);
        await type(sec.querySelector('.mp-p1'), T.msgP1, step);
        if (!skip) await ctx.sleep(350);
        await type(sec.querySelector('.mp-p2'), T.msgP2, step);
        if (!skip) await ctx.sleep(350);
        await type(sec.querySelector('.mp-sign'), T.msgSign, step * 1.5);

        await ctx.sleep(900);
        firstNext.classList.add('in');                // the reader turns the page when ready; the last page leads to the party
      }

      function party() {
        finale.querySelector('.mf-text').textContent = T.finalWish.replace(/,\s*/, ',\n');   // a line break after the comma
        sec.classList.add('party');
        App.audio.fadeOut('calm', 1200);                  // the music gives way to the Happy Birthday tune
        App.audio.fadeOut('love', 1200);
        App.audio.play('music');
        // first the puzzle gathers into her photo; only then do the words and all the decoration arrive
        puzzle.start(function () {
          sec.classList.add('titled');
          FX.balloons(finale, { count: App.isSmall() ? 12 : 18, prefill: true, party: true });      // the party balloons rise over the photo
          const fx = FX.field(finale, { motes: 0, rgb: '255,205,120', rate: 26, max: 120, confetti: true });
          ctx.add(fx.destroy);
          const W = sec.clientWidth, H = sec.clientHeight;
          fx.burst(W / 2, H * 0.35, 80, true);
          ctx.later(function () { fx.burst(W * 0.22, H * 0.5, 50, true); }, 450);
          ctx.later(function () { fx.burst(W * 0.78, H * 0.5, 50, true); }, 800);
          if (App.audio.has('celebration')) App.audio.play('celebration');
          ctx.later(function () { replay.classList.add('in'); }, 3000);
        });
      }

      ctx.on(replay, 'click', function () {
        if (replay.disabled) return;
        replay.disabled = true;
        App.audio.stop('celebration');
        App.audio.stop('music');
        App.SceneManager.replay();
      });
    }
  });
})(window.App = window.App || {});
