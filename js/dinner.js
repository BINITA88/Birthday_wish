/* SCENE 7 – The dinner invitation + replay. */
(function (App) {
  const { CONFIG: C, u, FX, Flowers } = App;

  function vaseFlowers(kind) {
    const rng = u.mulberry(App.state.gardenSeed + 3);
    const bunch = [[-19, kind], [0, kind], [19, kind], [-34, 'daisy'], [34, 'lavender']];
    return bunch.map(function (b) {
      const big = b[1] === kind;
      const w = big ? 74 : 54, h = w * 2;
      return '<g transform="rotate(' + b[0] + ' 400 198)"><svg x="' + (400 - w / 2) + '" y="' + (198 - h) + '" width="' + w + '" height="' + h + '" viewBox="0 0 100 200" overflow="visible">' + Flowers.inner(b[1], rng) + '</svg></g>';
    }).join('');
  }

  function plate(x) {
    return '<ellipse cx="' + x + '" cy="286" rx="92" ry="22" fill="rgba(0,0,0,.28)"/>' +
      '<ellipse cx="' + x + '" cy="278" rx="88" ry="21" fill="url(#dPlate)"/>' +
      '<ellipse cx="' + x + '" cy="278" rx="60" ry="13" fill="none" stroke="#F4C76B" stroke-width="1.3" opacity=".75"/>' +
      '<ellipse cx="' + x + '" cy="277" rx="46" ry="10" fill="#fff" opacity=".55"/>';
  }
  function cutlery(x) {
    // fork on the left, knife + spoon on the right
    return '<g fill="#e9e3d6" stroke="#b9b09c" stroke-width=".7">' +
      '<rect x="' + (x - 122) + '" y="258" width="5" height="42" rx="2.5" transform="rotate(-4 ' + (x - 120) + ' 280)"/>' +
      '<path d="M' + (x - 126) + ' 254h13v14h-13z" opacity=".0"/>' +
      '<rect x="' + (x + 112) + '" y="256" width="5" height="46" rx="2.5" transform="rotate(4 ' + (x + 114) + ' 280)"/>' +
      '<ellipse cx="' + (x + 128) + '" cy="262" rx="5" ry="8"/>' +
      '<rect x="' + (x + 126) + '" y="266" width="4" height="34" rx="2"/></g>';
  }
  function glass(x) {
    return '<g opacity=".92"><path d="M' + (x - 15) + ' 200c0 22 8 30 15 30s15-8 15-30z" fill="rgba(255,255,255,.14)" stroke="rgba(255,243,224,.55)" stroke-width="1"/>' +
      '<path d="M' + (x - 13.5) + ' 212c4 3 9 3 13.5 0s9-3 13.5 0c-1 14-7 18-13.5 18s-12.5-4-13.5-18z" fill="#8c1f3a" opacity=".85"/>' +
      '<path d="M' + x + ' 230v26" stroke="rgba(255,243,224,.55)" stroke-width="2"/><ellipse cx="' + x + '" cy="257" rx="13" ry="3.4" fill="rgba(255,255,255,.2)" stroke="rgba(255,243,224,.5)" stroke-width=".8"/></g>';
  }
  function taper(x, i) {
    return '<g class="d-candle" style="--fd:' + (0.17 + i * 0.03) + 's">' +
      '<ellipse cx="' + x + '" cy="226" rx="20" ry="5" fill="#9b7a3f"/><path d="M' + (x - 3) + ' 224h6l4 -12h-14z" fill="#c9a24e"/>' +
      '<rect x="' + (x - 6) + '" y="116" width="12" height="98" rx="3" fill="url(#dWax)"/>' +
      '<path d="M' + x + ' 116v-5" stroke="#4a3220" stroke-width="1.6" stroke-linecap="round"/>' +
      '<circle class="d-glow" cx="' + x + '" cy="98" r="62" fill="url(#dGlow)"/>' +
      '<g class="d-flame"><path d="M' + x + ' 82c9 11 10 22 0 31c-10-9-9-20 0-31z" fill="url(#dFlame)"/>' +
      '<path d="M' + x + ' 99c4 4 4 9 0 12c-4-3-4-8 0-12z" fill="#fff6c8" opacity=".9"/></g></g>';
  }

  function artSVG() {
    return '<svg class="dinner-art" viewBox="0 0 800 340" aria-hidden="true">' +
      '<defs>' +
        '<linearGradient id="dCloth" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1e3c9"/><stop offset=".5" stop-color="#d9c29c"/><stop offset="1" stop-color="#9e8460"/></linearGradient>' +
        '<radialGradient id="dPlate" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#fffdf7"/><stop offset="1" stop-color="#e6dac1"/></radialGradient>' +
        '<linearGradient id="dWax" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e9dcc2"/><stop offset=".5" stop-color="#fffaf0"/><stop offset="1" stop-color="#dccdae"/></linearGradient>' +
        '<radialGradient id="dFlame" cx=".5" cy=".8" r=".8"><stop offset="0" stop-color="#fff6c8"/><stop offset=".45" stop-color="#ffd24a"/><stop offset=".85" stop-color="#ff8a24"/><stop offset="1" stop-color="#ff5a1f" stop-opacity=".9"/></radialGradient>' +
        '<radialGradient id="dGlow"><stop offset="0" stop-color="#ffd37a" stop-opacity=".55"/><stop offset=".5" stop-color="#ffb04a" stop-opacity=".18"/><stop offset="1" stop-color="#ff9a3a" stop-opacity="0"/></radialGradient>' +
        '<radialGradient id="dPool" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffd890" stop-opacity=".55"/><stop offset="1" stop-color="#ffd890" stop-opacity="0"/></radialGradient>' +
        '<linearGradient id="dVase" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c7dde8" stop-opacity=".55"/><stop offset=".4" stop-color="#ffffff" stop-opacity=".55"/><stop offset="1" stop-color="#9dbccb" stop-opacity=".5"/></linearGradient>' +
      '</defs>' +
      '<path d="M40 176H760L800 340H0Z" fill="url(#dCloth)"/>' +
      '<path d="M40 176H760" stroke="#fff8e6" stroke-width="2" opacity=".6"/>' +
      '<ellipse cx="400" cy="262" rx="360" ry="70" fill="url(#dPool)"/>' +
      glass(205) + glass(595) +
      plate(262) + plate(538) + cutlery(262) + cutlery(538) +
      vaseFlowers(App.state.flower || 'sunflower') +
      '<g><path d="M381 196h38c4 14 5 22-2 30c-4 4-8 6-17 6s-13-2-17-6c-7-8-6-16-2-30z" fill="url(#dVase)" stroke="rgba(255,255,255,.6)" stroke-width="1"/>' +
      '<ellipse cx="400" cy="196" rx="19" ry="4" fill="#cfe3ec" opacity=".7"/><ellipse cx="400" cy="233" rx="14" ry="3.2" fill="rgba(0,0,0,.25)"/></g>' +
      taper(318, 0) + taper(482, 1) +
      '</svg>';
  }

  App.SceneManager.register('dinner', {
    init(sec, ctx) {
      const T = C.text, I = C.invite;
      sec.classList.add('scroll');
      sec.innerHTML =
        '<div class="d-bg"></div><div class="d-bokeh"></div>' +
        artSVG() +
        '<div class="d-content">' +
          '<div class="d-seq">' +
            '<p class="d1 fade-up">' + u.esc(T.dinner1) + '</p>' +
            '<p class="d2 fade-up">' + u.esc(T.dinner2) + '</p>' +
          '</div>' +
          '<div class="d-main" hidden>' +
            '<h2 class="d3 fade-up">' + u.esc(T.dinnerMain) + '</h2>' +
            '<p class="d4 fade-up">' + u.esc(T.dinnerSub) + '</p>' +
            '<div class="d-btns fade-up">' +
              '<button class="btn primary" type="button" data-yes>' + u.esc(T.dinnerYes) + '</button>' +
              '<button class="btn" type="button" data-more>' + u.esc(T.dinnerMore) + '</button>' +
            '</div>' +
            '<p class="d-reply" aria-live="polite"></p>' +
            '<div class="invite" hidden>' +
              '<h3>' + u.esc(I.title) + '</h3>' +
              '<div class="inv-row"><span>Date</span><b contenteditable="true" spellcheck="false">' + u.esc(I.date) + '</b></div>' +
              '<div class="inv-row"><span>Place</span><b contenteditable="true" spellcheck="false">' + u.esc(I.place) + '</b></div>' +
              '<div class="inv-row"><span>Time</span><b contenteditable="true" spellcheck="false">' + u.esc(I.time) + '</b></div>' +
            '</div>' +
            '<div class="d-final" hidden>' +
              '<p class="f1">' + u.esc(T.finalLine1) + '</p>' +
              '<p class="f2">' + u.esc(T.finalLine2) + '</p>' +
              '<button class="btn" type="button" data-replay>' + u.esc(T.replay) + '</button>' +
            '</div>' +
          '</div>' +
        '</div>';

      // decorative bokeh lights
      const bokeh = sec.querySelector('.d-bokeh');
      let b = '';
      for (let i = 0; i < (App.isSmall() ? 10 : 16); i++) {
        const s = u.rand(14, 46);
        b += '<i style="left:' + u.rand(0, 100).toFixed(1) + '%;top:' + u.rand(2, 55).toFixed(1) + '%;width:' + s.toFixed(0) + 'px;height:' + s.toFixed(0) +
          'px;animation-delay:-' + u.rand(0, 6).toFixed(1) + 's;animation-duration:' + u.rand(4, 8).toFixed(1) + 's"></i>';
      }
      bokeh.innerHTML = b;

      const fx = FX.field(sec, { motes: 36, rgb: '255,210,140', size: 0.9 });
      ctx.add(fx.destroy);

      const q = s => sec.querySelector(s);
      const seq = q('.d-seq'), d1 = q('.d1'), d2 = q('.d2'), main = q('.d-main');
      const d3 = q('.d3'), d4 = q('.d4'), btns = q('.d-btns'), reply = q('.d-reply');
      const invite = q('.invite'), fin = q('.d-final');

      function hearts() {
        const wrap = document.createElement('div');
        wrap.className = 'hearts';
        for (let i = 0; i < (App.reduced ? 6 : 16); i++) {
          const h = document.createElement('i');
          h.textContent = u.pick(['❤', '💛', '🌸', '❤']);
          h.style.left = u.rand(8, 92).toFixed(0) + '%';
          h.style.fontSize = u.rand(16, 34).toFixed(0) + 'px';
          h.style.animationDelay = (i * 0.12).toFixed(2) + 's';
          h.style.setProperty('--dx', u.rand(-40, 40).toFixed(0) + 'px');
          wrap.appendChild(h);
        }
        sec.appendChild(wrap);
        ctx.later(function () { wrap.remove(); }, 4200);
      }

      function say(text) {
        sec.classList.add('after');       // table art recedes so the longer text stays readable
        reply.classList.remove('in');
        void reply.offsetWidth;
        reply.textContent = text;
        reply.classList.add('in');
      }
      function revealFinal() {
        if (!fin.hidden) return;
        fin.hidden = false;
        ctx.later(function () {
          fin.classList.add('in');
          fin.scrollIntoView({ behavior: App.reduced ? 'auto' : 'smooth', block: 'nearest' });
        }, 900);
      }

      ctx.on(q('[data-yes]'), 'click', function () {
        say(T.dinnerYesReply);
        hearts();
        fx.burst(sec.clientWidth / 2, sec.clientHeight * 0.45, 36, true);
        revealFinal();
      });
      ctx.on(q('[data-more]'), 'click', function () {
        say(T.dinnerMoreReply);
        invite.hidden = false;
        void invite.offsetWidth;
        invite.classList.add('in');
        revealFinal();
      });
      ctx.on(q('[data-replay]'), 'click', function (e) {
        e.currentTarget.disabled = true;
        App.SceneManager.replay();
      });

      (async function () {
        await ctx.sleep(1200);
        d1.classList.add('in');
        await ctx.sleep(3000);
        d1.classList.remove('in');
        await ctx.sleep(1200);
        d2.classList.add('in');
        await ctx.sleep(3400);
        d2.classList.remove('in');
        await ctx.sleep(1300);
        seq.hidden = true;
        main.hidden = false;
        void main.offsetWidth;
        d3.classList.add('in');
        await ctx.sleep(1800);
        d4.classList.add('in');
        await ctx.sleep(1500);
        btns.classList.add('in');
      })();
    }
  });
})(window.App);
