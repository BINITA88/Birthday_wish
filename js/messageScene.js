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
          '<div class="mf-copy"><p class="mf-text"></p></div>' +
        '</div>';

      const env = sec.querySelector('.env');
      const openBtn = sec.querySelector('.msg-open');
      const paper = sec.querySelector('.msg-paper');                 // page 1 (the one that writes itself)
      const sheets = Array.from(sec.querySelectorAll('.mb-sheet'));
      const firstNext = paper.querySelector('.mb-next');
      const finale = sec.querySelector('.msg-finale');
      u.hint(openBtn);

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
        if (n > 0 && !letter[n].started) ctx.later(function () { writePage(n); }, 950);   // once the page has finished turning, the letter writes itself
      }

      /* ---- pages 2 and 3 write themselves out letter by letter, like the first page ---- */
      // Every line keeps its full text in place (the not-yet-written part is invisible), so the layout never jumps and the fitted font size stays right.
      const letter = sheets.map(function (sh) {
        const items = Array.from(sh.querySelectorAll('.mb-text > *')).map(function (el) {
          const chars = Array.from(el.textContent);
          el.innerHTML = '<span class="ty-a"></span><span class="ty-b"></span>';
          el.lastChild.textContent = chars.join('');
          return { el: el, a: el.firstChild, b: el.lastChild, chars: chars };
        });
        return { sh: sh, items: items, started: false, skip: false, num: sh.querySelector('.mb-num') };
      });
      letter.forEach(function (pg) {
        if (!pg.items.length) return;
        pg.numText = pg.num.textContent;
        ctx.on(pg.sh, 'click', function (e) { if (!e.target.closest('.mb-btn')) pg.skip = true; });   // a tap writes the rest at once
      });
      async function writePage(n) {
        const pg = letter[n];
        pg.started = true;
        pg.num.textContent = 'tap the page to read it all';
        const step = App.reduced ? 2 : 11;
        for (const it of pg.items) {
          it.el.classList.add('typing');
          for (let k = 0; k < it.chars.length; k++) {
            if (pg.skip) break;
            it.a.textContent = it.chars.slice(0, k + 1).join('');
            it.b.textContent = it.chars.slice(k + 1).join('');
            const ch = it.chars[k];
            await ctx.sleep(/[.!?]/.test(ch) ? step * 7 : /[,;—]/.test(ch) ? step * 3 : step);
          }
          it.a.textContent = it.chars.join('');
          it.b.textContent = '';
          it.el.classList.remove('typing');
          if (!pg.skip) await ctx.sleep(step * 12);
        }
        pg.num.textContent = pg.numText;
        pg.sh.classList.add('typed');
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
        });
      }
    }
  });
})(window.App = window.App || {});
