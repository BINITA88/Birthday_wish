/* Central audio manager. Every track is optional – missing files never throw. */
(function (App) {
  const C = App.CONFIG.audio;
  const tracks = {};
  let muted = false;
  let master = C.master;
  let unlocked = false;
  const wasPlaying = [];

  try { muted = localStorage.getItem('pratima-muted') === '1'; } catch (e) { /* storage blocked */ }

  const eff = t => Math.max(0, Math.min(1, t.volume * master));

  const A = {
    init() {
      Object.keys(C.tracks).forEach(function (id) {
        const cfg = C.tracks[id];
        const t = { id: id, volume: cfg.volume == null ? 1 : cfg.volume, loop: !!cfg.loop, ok: true, el: null, played: false, fade: null };
        try {
          const a = new Audio();
          a.preload = 'auto';
          a.loop = t.loop;
          a.addEventListener('error', function () { t.ok = false; });
          a.src = cfg.src;
          a.volume = eff(t);
          a.muted = muted;
          t.el = a;
        } catch (e) { t.ok = false; }
        tracks[id] = t;
      });
      App.state.muted = muted;
    },

    /** Must run inside the first user gesture. Primes every element so later play() calls are allowed (iOS/Safari). */
    unlock(skip) {
      if (unlocked) return;
      unlocked = true;
      skip = skip || [];
      Object.keys(tracks).forEach(function (id) {
        const t = tracks[id];
        if (!t.ok || skip.indexOf(id) > -1) return;
        const a = t.el;
        a.muted = true;
        const p = a.play();
        if (p && p.then) {
          p.then(function () {
            if (!t.played) { a.pause(); try { a.currentTime = 0; } catch (e) {} }
            a.muted = muted;
          }).catch(function () { a.muted = muted; });
        }
      });
    },

    has(id) { const t = tracks[id]; return !!(t && t.ok); },

    play(id) {
      const t = tracks[id];
      if (!t || !t.ok) return null;
      const a = t.el;
      clearInterval(t.fade);
      if (t.loop && !a.paused) { a.volume = eff(t); return a; }   // never restart background music
      try { a.currentTime = 0; } catch (e) {}
      t.played = true;
      a.volume = eff(t);
      a.muted = muted;
      const p = a.play();
      if (p && p.catch) p.catch(function () {});
      return a;
    },

    stop(id) {
      const t = tracks[id];
      if (!t || !t.ok) return;
      clearInterval(t.fade);
      t.el.pause();
      try { t.el.currentTime = 0; } catch (e) {}
      t.el.volume = eff(t);
    },

    fadeOut(id, ms) {
      const t = tracks[id];
      if (!t || !t.ok || t.el.paused) return;
      clearInterval(t.fade);
      const a = t.el, v0 = a.volume, t0 = performance.now();
      ms = ms || 1500;
      t.fade = setInterval(function () {
        const k = (performance.now() - t0) / ms;
        if (k >= 1) A.stop(id); else a.volume = Math.max(0, v0 * (1 - k));
      }, 50);
    },

    stopAll() { Object.keys(tracks).forEach(A.stop); },

    setMuted(m) {
      muted = !!m;
      App.state.muted = muted;
      Object.keys(tracks).forEach(function (id) { if (tracks[id].el) tracks[id].el.muted = muted; });
      try { localStorage.setItem('pratima-muted', muted ? '1' : '0'); } catch (e) {}
    },
    toggleMute() { A.setMuted(!muted); return muted; },
    isMuted() { return muted; },

    setMaster(v) {
      master = Math.max(0, Math.min(1, v));
      Object.keys(tracks).forEach(function (id) {
        const t = tracks[id];
        if (t.el && !t.el.paused) t.el.volume = eff(t);
      });
    },

    /** Pause while the tab is hidden, resume afterwards. */
    suspend() {
      wasPlaying.length = 0;
      Object.keys(tracks).forEach(function (id) {
        const t = tracks[id];
        if (t.ok && t.el && !t.el.paused) { wasPlaying.push(id); t.el.pause(); }
      });
    },
    resume() {
      wasPlaying.splice(0).forEach(function (id) {
        const p = tracks[id].el.play();
        if (p && p.catch) p.catch(function () {});
      });
    }
  };

  App.audio = A;
})(window.App = window.App || {});
