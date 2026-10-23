/* Final scene — a quiet, handwritten birthday letter. */
(function (App) {
  App.SceneManager.register('letter', {
    init(sec, ctx) {
      sec.innerHTML =
        '<div class="letter-stars" aria-hidden="true"></div><div class="letter-glow" aria-hidden="true"></div>' +
        '<div class="letter-intro">A little letter, written just for you…</div>' +
        '<button class="envelope" type="button" aria-expanded="false" aria-label="Open your birthday letter"><span class="env-flap"></span><span class="env-heart">♥</span><span class="env-label">Open your letter ♡</span></button>' +
        '<article class="letter-paper" tabindex="-1" aria-live="polite"><p class="letter-kicker">for my good luck 🍀</p><h1>A letter just for you</h1><p>May every new day bring you soft reasons to smile, warm people to hold close, and beautiful little moments that feel like magic.</p><p>You deserve a world that blooms gently around you. Happy Birthday, Pratima. ❤️</p><button class="replay-letter" type="button">Relive the magic ✨</button></article>';
      const envelope = sec.querySelector('.envelope');
      const paper = sec.querySelector('.letter-paper');
      const intro = sec.querySelector('.letter-intro');
      ctx.later(function () { sec.classList.add('ready'); }, 300);
      ctx.on(envelope, 'click', function () {
        if (sec.classList.contains('opened')) return;
        sec.classList.add('opened');
        envelope.setAttribute('aria-expanded', 'true');
        intro.textContent = 'For the loveliest person…';
        ctx.later(function () { paper.focus({ preventScroll: true }); }, 850);
      });
      ctx.on(sec.querySelector('.replay-letter'), 'click', function () { App.SceneManager.replay(); });
    }
  });
})(window.App = window.App || {});
