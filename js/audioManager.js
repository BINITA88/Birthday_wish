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

  /** The long songs are fetched whole and played from memory, so a slow connection cannot make them stutter. */
  const MEMORY_TRACKS = ['evergreen', 'music'];

  /** Back to the start, but only if it is not already there: a needless seek makes a phone stall and re-buffer. */
  function rewind(a) { try { if (a.currentTime > 0.05) a.currentTime = 0; } catch (e) {} }
  /** iPhones keep volume at 100% whatever the page says, so a song cannot be faded there. */
  const volumeWorks = (function () { try { const a = new Audio(); a.volume = 0.5; return a.volume === 0.5; } catch (e) { return true; } })();

  /* Phones (and in-app browsers such as WhatsApp's) sometimes refuse a play() that is not directly inside a tap. A refused
     track is not forgotten: the next tap anywhere on the page, or on the speaker button, starts everything that should be playing. */
  const TAP_EVENTS = ['pointerdown', 'touchend', 'click', 'keydown'];
  let retryArmed = false;
  function onTap() {
    TAP_EVENTS.forEach(function (ev) { document.removeEventListener(ev, onTap, true); });
    retryArmed = false;
    A.retry();
  }
  function armRetry() {
    if (retryArmed) return;
    retryArmed = true;
    TAP_EVENTS.forEach(function (ev) { document.addEventListener(ev, onTap, true); });
  }
  /** play() that never fails silently: if the browser says no, the track waits for the next tap. */
  function startEl(t) {
    const p = t.el.play();
    if (p && p.catch) p.catch(armRetry);
    return p;
  }
  /** Brings a playing track from silence up to its volume over ms. */
  function ramp(t, ms) {
    const a = t.el, v1 = eff(t), t0 = performance.now();
    clearInterval(t.fade);
    a.volume = 0;
    t.fade = setInterval(function () {
      const k = (performance.now() - t0) / (ms || 1500);
      if (k >= 1) { a.volume = v1; clearInterval(t.fade); } else a.volume = v1 * k;
    }, 50);
  }

  const A = {
    init() {
      Object.keys(C.tracks).forEach(function (id) {
        const cfg = C.tracks[id];
        const t = { id: id, src: cfg.src, volume: cfg.volume == null ? 1 : cfg.volume, loop: !!cfg.loop, ok: true, el: null, played: false, fade: null, want: false };
        try {
          const a = new Audio();
          a.preload = 'metadata';   // music is big: nothing is downloaded up front, a track streams when it is first played
          a.loop = t.loop;
          a.addEventListener('error', function () { t.ok = false; t.failed = true; });
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
        if (!t.ok || skip.indexOf(id) > -1 || !t.el.paused) return;   // leave anything already playing alone
        const a = t.el;
        a.muted = true;
        const p = a.play();
        if (p && p.then) {
          p.then(function () {
            if (!t.played) { a.pause(); rewind(a); }
            a.muted = muted;
          }).catch(function () { a.muted = muted; });
        }
      });
    },

    /** false on an iPhone/iPad: its browser ignores volume, so nothing can be faded and sound must start inside a tap. */
    canFade: volumeWorks,

    has(id) { const t = tracks[id]; return !!(t && t.ok); },

    /** Starts downloading a track in the background (call it when the network is quiet), so it is ready when it is first played. */
    warm(id, reload) {
      const t = tracks[id];
      if (!t || !t.ok || !t.el.paused) return;
      if (MEMORY_TRACKS.indexOf(id) > -1 && window.fetch && window.URL && window.URL.createObjectURL) {
        if (t.fetching) return;
        t.fetching = true;
        fetch(t.src).then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.blob(); }).then(function (blob) {
          if (t.played || !t.el.paused || !blob.size) return;        // already started by streaming: leave it alone
          t.el.src = URL.createObjectURL(blob);                      // from now on it plays from memory
          t.inMemory = true;
        }).catch(function () { t.fetching = false; t.el.preload = 'auto'; });   // fall back to ordinary streaming
        return;
      }
      t.el.preload = 'auto';
      if (reload) { try { t.el.load(); } catch (e) {} }
    },

    play(id) {
      const t = tracks[id];
      if (t && !t.ok && t.failed && !t.retried) { t.retried = true; t.ok = true; try { t.el.load(); } catch (e) {} }   // one more try after a failed download
      if (!t || !t.ok) return null;
      const a = t.el;
      clearInterval(t.fade);
      if (t.loop && !a.paused) { a.volume = eff(t); return a; }   // never restart background music
      rewind(a);
      t.played = true;
      a.volume = eff(t);
      a.muted = muted;
      t.want = true;
      startEl(t);
      return a;
    },

    /**
     * Starts a looping track straight away; if the browser refuses (no tap yet) it starts on the first tap or key
     * press instead. opts.ignore is a selector – taps on matching elements don't count (e.g. the "begin" button).
     */
    playWhenAllowed(id, opts) {
      const t = tracks[id];
      if (!t || !t.ok) return;
      t.want = true;
      const a = t.el;
      if (!a.paused) return;
      clearInterval(t.fade);
      rewind(a);
      a.volume = eff(t);
      a.muted = muted;
      const events = ['pointerdown', 'pointerup', 'keydown', 'touchend'];
      const off = function () { events.forEach(function (ev) { document.removeEventListener(ev, retry, true); }); };
      const attempt = function () {
        const p = a.play();
        if (p && p.then) p.then(function () { t.played = true; off(); }).catch(function () {});
        else off();
      };
      function retry(e) {
        if (!t.want) return off();
        if (!a.paused) return off();
        if (opts && opts.ignore && e.target && e.target.closest && e.target.closest(opts.ignore)) return;
        attempt();
      }
      const first = a.play();
      if (first && first.then) first.then(function () { t.played = true; }).catch(function () { events.forEach(function (ev) { document.addEventListener(ev, retry, true); }); });
    },

    /**
     * One short hit of a track: plays it from the start at the given pitch/speed, then fades it out after ms so the
     * rest of the file never plays. Used for the countdown: tik · tik · tok.
     */
    tick(id, rate, ms) {
      const t = tracks[id];
      if (!t || !t.ok) return;
      const a = t.el;
      clearInterval(t.fade); clearTimeout(t.cut);
      a.pause(); rewind(a);
      a.preservesPitch = false; a.mozPreservesPitch = false; a.webkitPreservesPitch = false;   // slower = lower, like a deeper "tok"
      a.playbackRate = rate || 1;
      a.volume = eff(t);
      a.muted = muted;
      t.played = true;
      const p = a.play();
      if (p && p.catch) p.catch(function () {});
      ms = ms || 1000;
      t.cut = setTimeout(function () { A.fadeOut(id, 150); }, Math.max(0, ms - 150));
    },

    /** Plays the first ms of a track, fading it out over the last fadeMs, then stops it (the file may be much longer). */
    clip(id, ms, fadeMs) {
      const t = tracks[id];
      if (!t || !t.ok) return;
      const a = A.play(id);
      if (!a) return;
      fadeMs = fadeMs || 800;
      clearTimeout(t.cut);
      t.cut = setTimeout(function () { A.fadeOut(id, fadeMs); }, Math.max(0, ms - fadeMs));
    },

    /**
     * Hands over from one track to another without the two playing together: the first fades out (or, on a phone that cannot
     * fade, stops at once) and the second comes in as it ends.
     */
    swap(fromId, toId) {
      const f = tracks[fromId], t = tracks[toId];
      if (f && f.ok && !f.el.paused) {
        if (volumeWorks) A.fadeOut(fromId, 700); else A.stop(fromId);
      }
      if (!t) return;
      clearTimeout(t.cut);
      if (!t.ok) return;
      if (!volumeWorks) { A.fadeIn(toId, 0); return; }              // iPhone: straight away, still inside the tap that called us
      t.cut = setTimeout(function () { A.fadeIn(toId, 700); }, 760);      // after the song's 700 ms fade has finished
    },

    /** Starts a track silently, right now (call it inside a tap). fadeIn() then brings it up later, whenever the story reaches it. */
    arm(id) {
      const t = tracks[id];
      if (!t || !t.ok || !t.el.paused) return;
      clearInterval(t.fade);
      rewind(t.el);
      t.el.muted = true;                 // muted rather than volume 0: some phones ignore volume
      t.el.volume = 0;
      t.armed = true; t.played = true; t.want = true;
      startEl(t);
    },

    /** Starts every track that should be playing but is not (after a refused play, or a return to the page). */
    retry() {
      Object.keys(tracks).forEach(function (id) {
        const t = tracks[id];
        if (!t.ok || !t.want || !t.el.paused) return;
        t.el.muted = t.armed ? true : muted;
        startEl(t);
      });
    },

    /** Starts a track silently and brings it up to full volume over ms. */
    fadeIn(id, ms) {
      const t = tracks[id];
      if (!t || !t.ok) return;
      if (t.armed && !t.el.paused) {       // already running silently (started inside a tap): bring it up
        t.armed = false;
        t.el.muted = muted;
        ramp(t, ms);
        return;
      }
      if (t.loop && !t.el.paused) return;
      const a = A.play(id);
      if (!a) return;
      t.want = true;
      ramp(t, ms);
    },

    stop(id) {
      const t = tracks[id];
      if (!t || !t.ok) return;
      t.want = false; t.armed = false;
      clearInterval(t.fade); clearTimeout(t.cut);
      t.el.pause();
      rewind(t.el);
      t.el.volume = eff(t);
    },

    fadeOut(id, ms) {
      const t = tracks[id];
      if (t) t.want = false;
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
      Object.keys(tracks).forEach(function (id) { if (tracks[id].el) tracks[id].el.muted = muted || !!tracks[id].armed; });
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
      wasPlaying.splice(0).forEach(function (id) { startEl(tracks[id]); });
    }
  };

  App.audio = A;
})(window.App = window.App || {});
