/* Bootstraps the experience. */
(function (App) {
  function start() {
    App.audio.init();

    // Sound control
    const btn = document.getElementById('sound-btn');
    function paint() {
      const m = App.audio.isMuted();
      btn.classList.toggle('muted', m);
      btn.setAttribute('aria-pressed', String(m));
      btn.setAttribute('aria-label', m ? 'Unmute sound' : 'Mute sound');
    }
    btn.addEventListener('click', function () {
      App.audio.unlock();               // harmless if already unlocked
      App.audio.toggleMute();
      paint();
    });
    paint();

    // Don't play music into the void while the tab is hidden
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) App.audio.suspend(); else App.audio.resume();
    });

    // Browsers keep the page silent until the visitor taps once, so the very first screen asks for that tap:
    // it unlocks the sound, and the opening twinkle can then play from the moment the story starts.
    const gate = document.createElement('div');
    gate.className = 'gate';
    gate.innerHTML = '<p class="gate-text">A little surprise for you…</p><button class="btn primary gate-btn" type="button">Tap to open ✨</button>';
    document.body.appendChild(gate);
    const gateBtn = gate.querySelector('.gate-btn');
    App.u.hint(gateBtn);
    gateBtn.focus({ preventScroll: true });
    gateBtn.addEventListener('click', function () {
      if (gateBtn.disabled) return;
      gateBtn.disabled = true;
      App.audio.unlock(['twinkle']);                     // every track is primed except the twinkle, which simply starts below
      App.SceneManager.go('name', { mode: 'none' });     // the twinkle starts as this scene opens
      gate.classList.add('leaving');
      setTimeout(function () { gate.remove(); }, 1000);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})(window.App);
