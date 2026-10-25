/* Final scene — a quiet, handwritten birthday letter. */
(function (App) {
  App.SceneManager.register('letter', {
    init(sec, ctx) {
      sec.innerHTML =
        '<div class="letter-stars" aria-hidden="true"></div><div class="letter-glow" aria-hidden="true"></div><div class="letter-botanicals" aria-hidden="true"></div>' +
        '<div class="letter-intro">A little letter, written just for you…</div>' +
        '<button class="envelope" type="button" aria-expanded="false" aria-label="Open your birthday letter"><span class="env-ribbon" aria-hidden="true"></span><span class="env-flap"></span><span class="env-seal" aria-hidden="true">✦</span><span class="env-label">Open your letter</span></button>' +
        '<div class="letter-frame" aria-hidden="true"></div>' +
        '<article class="letter-paper" tabindex="-1" aria-live="polite"><span class="paper-sprig sprig-one" aria-hidden="true"></span><span class="paper-sprig sprig-two" aria-hidden="true"></span><p class="letter-kicker">a little note for you</p><h1>Dearest Pratima,</h1><p>May every new day bring you soft reasons to smile, warm people to hold close, and beautiful little moments that feel like magic.</p><p>You deserve a world that blooms gently around you. Happy Birthday, Pratima. ❤️</p><p class="letter-signoff">With all my love,</p><button class="replay-letter" type="button">Relive the magic ✦</button></article>';
      const envelope = sec.querySelector('.envelope');
      const paper = sec.querySelector('.letter-paper');
      const intro = sec.querySelector('.letter-intro');
      // Show the finished letter directly on the table.
      ctx.later(function () {
        sec.classList.add('ready', 'opened');
        envelope.setAttribute('aria-expanded', 'true');
        paper.focus({ preventScroll: true });
      }, 300);
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
