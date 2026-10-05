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

    App.SceneManager.go('intro', { mode: 'none' });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})(window.App);
