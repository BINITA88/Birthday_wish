/* Small shared helpers + the global experience state. */
(function (App) {
  const u = {};

  u.rand = (a, b) => a + Math.random() * (b - a);
  u.pick = arr => arr[Math.floor(Math.random() * arr.length)];

  /** Deterministic PRNG – lets the garden look identical in scene 4 and scene 5. */
  u.mulberry = function (seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  /** Splits text into per-letter spans for the cinematic reveal (add class "reveal" to run it). */
  u.letters = function (el, text, stepMs) {
    stepMs = stepMs || 55;
    el.textContent = '';
    let i = 0;
    const lines = text.split('\n');
    lines.forEach(function (line, lineIndex) {
      const words = line.split(' ');
      words.forEach(function (w, wi) {
        const word = document.createElement('span');
        word.className = 'word';
        for (const chr of w) {
          const s = document.createElement('span');
          s.className = 'ch';
          s.textContent = chr;
          s.style.setProperty('--i', i++);
          word.appendChild(s);
        }
        el.appendChild(word);
        if (wi < words.length - 1) el.appendChild(document.createTextNode(' '));
      });
      if (lineIndex < lines.length - 1) el.appendChild(document.createElement('br'));
    });
    el.style.setProperty('--step', stepMs + 'ms');
    el.setAttribute('aria-label', text);
    return i * stepMs + 1100;
  };

  /** Escape text for safe HTML injection (config text is trusted, but be tidy). */
  u.esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  App.u = u;
  App.reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  App.isSmall = () => window.innerWidth < 700;

  /* ---------- Global state ---------- */
  App.state = {
    scene: null,
    flower: null,          // 'sunflower' | 'rose'
    started: false,
    candlesTotal: 0,
    candlesOut: 0,
    gardenSeed: 1,
    muted: false
  };

  /** Resets everything that belongs to one run-through (audio preferences are kept). */
  App.resetState = function () {
    const s = App.state;
    s.scene = null; s.flower = null; s.started = false;
    s.candlesTotal = 0; s.candlesOut = 0;
    s.gardenSeed = Math.floor(Math.random() * 1e9) + 1;
  };
  App.resetState();
})(window.App = window.App || {});
