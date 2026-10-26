/* SCENE 5 – Pratima in her magical garden. */
(function (App) {
  const { CONFIG: C, u, FX, Garden } = App;
  const photoCache = {};

  /** Tries each candidate path once; resolves with an <img> or null. Cached across replays. */
  function loadPhoto(flower) {
    if (photoCache[flower]) return photoCache[flower];
    photoCache[flower] = new Promise(function (resolve) {
      const list = ((C.photoByFlower && C.photoByFlower[flower]) || []).concat(C.photoCandidates);
      (function next() {
        if (!list.length) { console.info('[birthday] No photo found – add assets/pratima.jpg'); return resolve(null); }
        const img = new Image();
        img.onload = function () { resolve(img); };
        img.onerror = next;
        img.src = list.shift();
      })();
    });
    return photoCache[flower];
  }

  /** Resolves with a ready <video> for this flower (config.videoByFlower) or null if none/failed. */
  function loadVideo(flower) {
    const list = (C.videoByFlower && C.videoByFlower[flower]) || [];
    return new Promise(function (resolve) {
      (function next() {
        if (!list.length) return resolve(null);
        const v = document.createElement('video');
        let done = false;
        const fin = function (ok) { if (done) return; done = true; clearTimeout(t); if (ok) resolve(v); else next(); };
        const t = setTimeout(function () { fin(false); }, 5000);
        v.preload = 'auto'; v.playsInline = true; v.setAttribute('playsinline', ''); v.loop = true; v.disablePictureInPicture = true;
        v.addEventListener('loadeddata', function () { fin(true); });
        v.addEventListener('error', function () { fin(false); });
        v.src = list.shift();
      })();
    });
  }

  /** True if the image has transparent corners (a cut-out PNG). Fails safe to false. */
  function hasAlpha(img) {
    try {
      const c = document.createElement('canvas');
      c.width = c.height = 16;
      const g = c.getContext('2d');
      g.drawImage(img, 0, 0, 16, 16);
      const px = [[0, 0], [15, 0], [0, 15], [15, 15]];
      return px.some(function (p) { return g.getImageData(p[0], p[1], 1, 1).data[3] < 200; });
    } catch (e) { return false; }
  }

  App.SceneManager.register('photo', {
    init(sec, ctx) {
      const T = C.text;
      // The old sunflower-garden backdrop is switched off (Garden stays in garden.js): the photo now sits on vintage floral stationery.
      // const g = Garden.build(sec, { flower: App.state.flower || 'sunflower', animate: false, seed: App.state.gardenSeed });
      sec.insertAdjacentHTML('afterbegin', '<div class="photo-floral" aria-hidden="true"></div>');
      const floral = sec.querySelector('.photo-floral');
      const g = { root: floral };                 // the intro below softens this backdrop exactly as it used to soften the garden
      function paintFloral() { floral.innerHTML = App.floralBackground(sec.clientWidth, sec.clientHeight, { dark: true }); }
      paintFloral();
      let floralRaf = 0;
      ctx.on(window, 'resize', function () { cancelAnimationFrame(floralRaf); floralRaf = requestAnimationFrame(paintFloral); });
      ctx.add(function () { cancelAnimationFrame(floralRaf); });

      sec.insertAdjacentHTML('beforeend',
        '<div class="vig"></div><div class="spot"></div>' +
        '<div class="photo-wrap"><div class="photo-rays"></div>' + App.ornateFrame() + '<div class="photo-frame"></div></div>' +
        '<div class="photo-name"></div>' +
        '<div class="photo-text">' +
          '<button class="btn primary fade-up" type="button">' + u.esc(T.photoButton) + '</button>' +
        '</div>');

      const fx = FX.field(sec, { motes: 44, rgb: '255,220,140', size: 1.0 });
      ctx.add(fx.destroy);

      const wrap = sec.querySelector('.photo-wrap');
      const frame = sec.querySelector('.photo-frame');
      const spot = sec.querySelector('.spot');
      const nameBox = sec.querySelector('.photo-name'), btn = sec.querySelector('.btn');
      const flower = App.state.flower || 'sunflower';
      // Frame content: her photo, or an elegant monogram if the file is missing.
      let video = null;
      loadVideo(flower).then(function (v) {
        if (v) return v;
        return null;
      }).then(function (v) {
        if (ctx.dead) return;
        if (v) {
          video = v;
          v.muted = App.audio.isMuted();
          v.style.objectPosition = C.photoObjectPosition;
          frame.appendChild(v);
          ctx.add(function () { v.pause(); v.removeAttribute('src'); v.load(); });
          if (wrap.classList.contains('in')) v.play().catch(function () {});
          return;
        }
        return loadPhoto(flower).then(showPhoto);
      });

      function showPhoto(img) {
        if (ctx.dead) return;
        if (img) {
          const el = new Image();
          el.src = img.src;
          el.alt = C.name;
          el.decoding = 'async';
          el.draggable = false;
          el.style.objectPosition = C.photoObjectPosition;
          if (hasAlpha(img)) wrap.classList.add('cutout');
          frame.appendChild(el);
        } else {
          wrap.classList.add('fallback');
          frame.innerHTML = '<div class="monogram"><span>' + u.esc(C.name.charAt(0)) + '</span><small>' + u.esc(C.name) + '</small></div>';
        }
      }

      ctx.on(btn, 'click', function () {
        if (btn.disabled) return;
        btn.disabled = true;
        App.SceneManager.go('heart', { mode: 'black', duration: 1100, hold: 250 });   // straight to the heart: the old empty 'celebration' step flashed a blank pink screen
      });

      (async function () {
        await ctx.sleep(500);
        g.root.classList.add('hold', 'defocus');   // 1. garden blurs (sway paused while blurred – cheaper)
        await ctx.sleep(1000);
        spot.classList.add('on');                  // 2. warm spotlight
        await ctx.sleep(900);
        wrap.classList.add('in');                  // 3 + 4. she arrives, glides into place
        if (video) video.play().catch(function () { video.muted = true; video.play().catch(function () {}); });
        await ctx.sleep(2700);
        g.root.classList.remove('defocus');        // 5. garden returns to focus
        await ctx.sleep(900);
        g.root.classList.remove('hold');
        sec.classList.add('rays-on');                 // 6. rays + particles
        await ctx.sleep(1800);
        // 7. her name blooms from little flowers underneath the framed photo (the old two text lines are gone)
        const bloom = FX.flowerName(nameBox, C.name, { maxWidth: 1150, finAt: (window.innerHeight < 500 && window.innerWidth > window.innerHeight) ? 0.5 : 0.68 });
        ctx.add(bloom.destroy);
        await bloom.done;
        // put the button a small, fixed distance under the lowest flower of the name, whatever the window size
        const cv = nameBox.querySelector('canvas'), photoText = sec.querySelector('.photo-text');
        if (cv && photoText) {
          try {
            const w = cv.width, h = cv.height, px = cv.getContext('2d').getImageData(0, 0, w, h).data;
            let last = -1;
            for (let y = h - 1; y >= 0 && last < 0; y--) { for (let x = 0; x < w; x += 3) { if (px[(y * w + x) * 4 + 3] > 40) { last = y; break; } } }
            if (last >= 0) {
              const r = cv.getBoundingClientRect(), sr = sec.getBoundingClientRect();
              photoText.style.bottom = 'auto';
              photoText.style.top = Math.round(r.top - sr.top + last * r.height / h + 30) + 'px';
            }
          } catch (e) { /* keep the default position */ }
        }
        await ctx.sleep(700);
        btn.classList.add('in');
      })();
    }
  });
})(window.App);
