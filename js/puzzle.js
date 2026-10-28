/* Full-screen photo puzzle. App.puzzle(parent, ctx, imageUrl) adds a layer to `parent` (which must fill the screen) that
   shows her photo dimly in the background; start() then makes pieces fly in from all over the screen and click together
   into the photo, covering the whole screen (cropped, never stretched). */
(function (App) {
  const u = App.u;
  const IMG_W = 828, IMG_H = 1004;          // size of assets/images/lastposterimage.png
  const FOCUS_X = 0.68, FOCUS_Y = 0.5;      // which part of the photo stays in view when the screen crops it (she sits right of centre)
  const SPREAD = 2.6, FLIGHT = 1.7;         // seconds: pieces leave one after another over SPREAD, each flies for FLIGHT

  /** Returns { el, start(onJoined) }. The layer carries .gather while the pieces fly and .joined once they have clicked together. */
  App.puzzle = function (parent, ctx, imageUrl) {
    const img = u.esc(imageUrl);
    const W0 = window.innerWidth, H0 = window.innerHeight;
    const COLS = Math.max(4, Math.round(W0 / 105)), ROWS = Math.max(6, Math.round(H0 / 105));   // pieces of roughly 105 px
    let tiles = '';
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        tiles += '<i class="pz-tile" data-c="' + c + '" data-r="' + r + '" style="background-image:url(&quot;' + img + '&quot;);left:' +
          (c / COLS * 100).toFixed(3) + '%;top:' + (r / ROWS * 100).toFixed(3) + '%;width:' + (100 / COLS + 0.05).toFixed(3) + '%;height:' + (100 / ROWS + 0.05).toFixed(3) + '%"></i>';
      }
    }
    const el = document.createElement('div');
    el.className = 'pz';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = '<div class="pz-bg" style="background-image:url(&quot;' + img + '&quot;)"></div><div class="pz-tiles">' + tiles + '</div>';
    parent.insertBefore(el, parent.firstChild);

    const bg = el.querySelector('.pz-bg');
    const tileEls = Array.from(el.querySelectorAll('.pz-tile'));

    function layout() {
      const W = el.clientWidth, H = el.clientHeight;
      if (!W || !H) return;
      const s = Math.max(W / IMG_W, H / IMG_H), iw = IMG_W * s, ih = IMG_H * s;
      const ox = (W - iw) * FOCUS_X, oy = (H - ih) * FOCUS_Y;
      const tw = W / COLS, th = H / ROWS;
      bg.style.backgroundPosition = (FOCUS_X * 100) + '% ' + (FOCUS_Y * 100) + '%';
      tileEls.forEach(function (t) {
        t.style.backgroundSize = iw.toFixed(1) + 'px ' + ih.toFixed(1) + 'px';
        t.style.backgroundPosition = (ox - t.dataset.c * tw).toFixed(1) + 'px ' + (oy - t.dataset.r * th).toFixed(1) + 'px';
      });
    }
    layout();
    ctx.on(window, 'resize', layout);

    // every piece starts somewhere else on the screen, turned and shrunk or enlarged, and flies home in a random order
    const total = ROWS * COLS;
    const order = Array.from({ length: total }, function (_, i) { return i; }).sort(function () { return Math.random() - 0.5; });
    const fly = App.reduced ? 0.25 : 1;
    tileEls.forEach(function (t, i) {
      t.style.setProperty('--tx', Math.round(u.rand(-0.6, 0.6) * W0) + 'px');
      t.style.setProperty('--ty', Math.round(u.rand(-0.7, 0.7) * H0) + 'px');
      t.style.setProperty('--r', Math.round(u.rand(-70, 70)) + 'deg');
      t.style.setProperty('--s', u.rand(0.5, 1.5).toFixed(2));
      t.style.setProperty('--d', (order[i] / total * SPREAD * fly).toFixed(2) + 's');
      t.style.setProperty('--dur', (FLIGHT * fly).toFixed(2) + 's');
    });

    return {
      el: el,
      start(onJoined) {
        layout();
        ctx.later(function () { el.classList.add('gather'); }, 150);                               // the pieces fly in …
        const settled = 150 + (SPREAD + FLIGHT) * 1000 * fly;
        ctx.later(function () { el.classList.add('joined'); if (onJoined) onJoined(); }, settled + 150);   // … click together, seams fade
      }
    };
  };
})(window.App = window.App || {});
