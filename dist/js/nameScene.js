/* Opening — a moonlit note, then flower letters gather into PRATIMA. */
(function (App) {
  const { CONFIG: C, FX, u } = App;

  App.SceneManager.register('name', {
    init(sec, ctx) {
      sec.innerHTML =
        '<div class="moon-stars" aria-hidden="true"></div><div class="moon-haze" aria-hidden="true"></div>' +
        '<div class="photo-moon"><img class="moon-composite" src="assets/images/moon-pratima-composite.png" alt="Pratima in the moon"></div>' +
        '<div class="sky-name" aria-label="PRATIMA"></div>' +
        '<div class="moon-note"><p></p><button class="moon-begin" type="button">' + u.esc(C.text.waitButton) + '</button></div>';
      const fx = FX.field(sec, { motes: 36, rgb: '255,233,185', size: 0.75 });
      ctx.add(fx.destroy);
      const skyName = sec.querySelector('.sky-name');
      const letters = Array.from(C.name);
      const starts = [[30, 22], [70, 19], [85, 42], [22, 52], [78, 67], [38, 72], [57, 28]];
      const shuffledStarts = starts.slice().sort(function () { return Math.random() - .5; });
      const revealOrder = letters.map(function (_, index) { return index; }).sort(function () { return Math.random() - .5; });
      const nodes = letters.map(function (letter, index) {
        const point = shuffledStarts[index];
        const node = document.createElement('span');
        const finalLeft = 50 + (index - (letters.length - 1) / 2) * 9.4;
        node.className = 'sky-name-letter';
        node.style.left = point[0] + '%';
        node.style.top = point[1] + '%';
        node.dataset.finalLeft = finalLeft + '%';
        node.innerHTML = '<i aria-hidden="true">✦</i><b>' + u.esc(letter) + '</b>';
        skyName.appendChild(node);
        return node;
      });
      const note = sec.querySelector('.moon-note p');
      const noteWrap = sec.querySelector('.moon-note');
      const btn = sec.querySelector('.moon-begin');

      // Big stars appear across the sky one at a time, reveal their letters, then gather into PRATIMA.
      revealOrder.forEach(function (letterIndex, sequence) {
        ctx.later(function () { nodes[letterIndex].classList.add('appeared'); }, 300 + sequence * 470);
        ctx.later(function () { nodes[letterIndex].classList.add('letter-visible'); }, 540 + sequence * 470);
      });
      const gatherAt = 300 + letters.length * 470 + 360;
      ctx.later(function () {
        nodes.forEach(function (node) {
          node.style.left = node.dataset.finalLeft;
          node.style.top = '42%';
          node.classList.add('gathered');
        });
      }, gatherAt);
      ctx.later(function () {
        noteWrap.classList.add('in');
        const typing = u.letters(note, C.text.waitLine, 115);
        note.classList.add('reveal');
        ctx.show(btn, typing + 400);
      }, gatherAt + 1750);
      ctx.on(btn, 'click', function () {
        if (btn.disabled) return;
        btn.disabled = true;
        App.audio.unlock();
        App.state.started = true;
        document.body.classList.add('started');
        App.audio.fadeIn('calm', 1200);
        App.SceneManager.go('blossom', { mode: 'black', duration: 900, hold: 200 });
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
