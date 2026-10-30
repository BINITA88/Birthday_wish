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

    App.SceneManager.go('name', { mode: 'none' });

    // once the opening screen's images have arrived, the first song downloads quietly while she watches the letters gather
    const warmSong = function () { setTimeout(function () { App.audio.warm('evergreen', true); }, 600); };
    if (document.readyState === 'complete') warmSong(); else window.addEventListener('load', warmSong);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})(window.App);
