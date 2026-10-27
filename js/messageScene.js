/* SCENE – "Message for You". A sealed envelope lies on a wooden table with an OPEN button under it. Only after OPEN is pressed
   does the flap lift and the letter appear, writing itself out letter by letter. When it is written, the final birthday wish
   arrives with balloons and confetti. (The older 'letter' scene is kept in letterScene.js but is no longer used.) */
(function (App) {
  const { CONFIG: C, u, FX } = App;

  App.SceneManager.register('message', {
    init(sec, ctx) {
      const T = C.text;
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
        '<article class="msg-paper" tabindex="-1" aria-live="off">' +
          '<h1 class="mp-h"></h1><p class="mp-p1"></p><p class="mp-p2"></p><p class="mp-sign"></p>' +
        '</article>' +
        '<div class="msg-finale" aria-live="polite">' +
          '<p class="mf-text"></p>' +
          '<button class="btn primary mf-replay fade-up" type="button">' + u.esc(T.replay) + '</button>' +
        '</div>';

      const env = sec.querySelector('.env');
      const openBtn = sec.querySelector('.msg-open');
      const paper = sec.querySelector('.msg-paper');
      const finale = sec.querySelector('.msg-finale');
      const replay = sec.querySelector('.mf-replay');
      u.hint(openBtn);
      u.hint(replay);

      const fx0 = FX.field(sec, { motes: 14, rgb: '255,205,130', size: 0.6 });
      ctx.add(fx0.destroy);

      // the sealed envelope settles on the table, then the OPEN button appears below it
      ctx.later(function () { sec.classList.add('settled'); }, 150);
      ctx.show(openBtn, 1500);

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

        await ctx.sleep(2600);                        // a moment to read it before the party starts
        party();
      }

      function party() {
        finale.querySelector('.mf-text').textContent = T.finalWish.replace(/,\s*/, ',\n');   // a line break after the comma
        sec.classList.add('party');
        FX.balloons(finale, { count: App.isSmall() ? 3 : 5, prefill: true });                    // the rose-and-heart-balloon bundles drift upward in the background
        FX.balloons(finale, { count: App.isSmall() ? 12 : 18, prefill: true, party: true });      // and the single party balloons rise in front of them
        const fx = FX.field(finale, { motes: 0, rgb: '255,205,120', rate: 26, max: 120, confetti: true });
        ctx.add(fx.destroy);
        const W = sec.clientWidth, H = sec.clientHeight;
        fx.burst(W / 2, H * 0.42, 80, true);
        ctx.later(function () { fx.burst(W * 0.22, H * 0.5, 50, true); }, 450);
        ctx.later(function () { fx.burst(W * 0.78, H * 0.5, 50, true); }, 800);
        App.audio.fadeOut('calm', 1200);                  // the calm music gives way to the Happy Birthday tune
        App.audio.play('music');
        if (App.audio.has('celebration')) App.audio.play('celebration');
        ctx.later(function () { replay.classList.add('in'); }, 3500);
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
