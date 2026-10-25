/* ==========================================================================
   CONFIG – everything you may want to personalise lives here.
   Edit the wording / paths below; no other file needs to change.
   ========================================================================== */
(function (App) {
  App.CONFIG = {

    /* ---- Who is this for? ---- */
    name: 'Pratima',
    greeting: 'Happy Birthday, Pratima!',
    cakeMessage: 'Happy Birthday, Pratima!',

    /* ---- Photograph (scene 5) ----
       The first file that exists is used. Put her photo at assets/pratima.jpg.
       A transparent PNG (assets/pratima.png) is detected automatically and shown
       as a soft cut-out; any normal photo is shown in an elegant arched frame. */
    // Optional photo used only when that flower was chosen (falls back to photoCandidates below).
    photoByFlower: {
      sunflower: ['assets/pratima-sunflower.png']
    },
    // Optional looping video shown in the frame instead of a photo, per flower (mp4 / webm). Plays with sound unless muted.
    videoByFlower: {
      rose: ['assets/pratima-rose.mp4', 'assets/pratima-rose.webm']
    },
    photoCandidates: [
      'assets/pratima.jpg',
      'assets/pratima.png',
      'assets/pratima.jpeg',
      'assets/pratima.webp'
    ],
    photoObjectPosition: 'center 22%',             // keeps faces in frame when the photo is cropped

    /* ---- Floating balloons (celebration + cake scenes) ---- */
    balloonImage: 'assets/images/heart-balloon-bouquet-small.png',    // 372 px, shadow baked in (the big original is kept alongside)

    /* ---- The garden (scenes 4 + 5) ----
       Photos that make up the field; `weights` is how often each appears (they add up to 1).
       ar = image height / width, wk = how much wider to draw it (for photos with airy margins). */
    gardenFlowers: {
      sunflower: {
        images: ['assets/images/sunflower-clean.png', 'assets/images/sunflower-gold.png', 'assets/images/sunflower-red.png'],
        weights: [0.54, 0.2, 0.26], ar: 1.5, wk: 1
      },
      rose: { images: ['assets/images/rose.png'], weights: [1], ar: 1, wk: 1.35 }
    },

    /* ---- The two flowers (scene 3) ---- */
    flowers: {
      sunflower: {
        image: 'assets/images/sunflower-moonlit-hero.png',
        title: 'Sunflower', emoji: '🌻',
        description: 'Like sunshine, warmth, and the little things that make life beautiful.',
        cardLine: 'This little world was made just for you.',
        button: 'Continue ✨'
      },
      rose: {
        image: 'assets/images/rose-moonlit-hero.png',
        title: 'Rose', emoji: '🌹',
        description: 'Elegant, timeless, and beautiful in its own way.',
        cardLine: 'Like a rose, you make life beautiful.',
        button: 'Continue ✨'
      }
    },

    /* ---- All on-screen wording ---- */
    text: {
      waitLine: 'Some people just feel like\na little bit of magic.\nAnd you are one of them,',
      waitGreeting: 'Hey beautiful,',
      waitButton: 'Tap for music & begin ♡',
      introLine: 'Something special is waiting for you...',
      introButton: 'Click to begin ✨',

      flowerHeading1: 'A Little Garden for You',
      flowerHeading2: 'Every flower has its own beauty, just like you. ❤️ Choose a flower and see what blooms for you…',

      gardenMessage: 'A little garden, made with love for you…',

      photoLine1: 'A garden of little memories.',
      photoLine2: 'Pratima, this little world was made just for you. ❤️🌺',
      photoButton: 'A birthday wish for you ♡',

      cakeNext: 'Open your letter ♡',

      dinner1: 'One last little surprise...',
      dinner2: 'Because birthdays deserve more than just cake...',
      dinnerMain: "Let's have a dinner together, Pratima. ❤️",
      dinnerSub: 'A little food, a lot of laughter, and a beautiful memory to keep.',
      dinnerYes: "I'd Love That ❤️",
      dinnerMore: 'Tell Me More ✨',
      dinnerYesReply: "Then it's a date with delicious food and beautiful memories! ❤️",
      dinnerMoreReply: "Let's choose a day, pick a place, and make this birthday memory happen. ✨",

      finalLine1: 'Happy Birthday once again, Pratima. 🌻🌹',
      finalLine2: 'May your days bloom as beautifully as this little garden.',
      replay: 'Relive the Magic ✨'
    },

    /* ---- Invitation card placeholders (deliberately NOT hard-coded) ---- */
    invite: {
      title: 'An Invitation',
      date: '[Choose a date together]',
      place: '[Choose a restaurant together]',
      time: '[Decide together]'
    },

    /* ---- Audio ----
       Every file is OPTIONAL. If one is missing the experience simply carries on silently.
       `master` is the overall volume (0 – 1); each track has its own relative `volume`.
       Keep values moderate – the listener's device volume is always respected. */
    audio: {
      master: 0.7,
      tracks: {
        countdown:   { src: 'assets/audio/freesound_community-3min-bell-sound-count-61773.mp3', volume: 0.7 },   // only its first bell is used: tik · tik · tok
        sparkler:    { src: 'assets/audio/freesound_community-firework-candle-76282.mp3', volume: 0.8 },   // the cake's sparkler: only its first seconds are played
        calm:        { src: 'assets/audio/freesound_community-calm_game_music_1-49209.mp3', volume: 0.45, loop: true },   // everywhere except the countdown and the birthday tune
        music:       { src: 'assets/audio/satokin-happy-birthday-ukulele-600716.mp3', volume: 0.55, loop: true },   // plays from the birthday scene until a flower is chosen
        celebration: { src: 'assets/audio/celebration.mp3',              volume: 0.6 },
        blow:        { src: 'assets/audio/candle-blow.mp3',              volume: 0.6 },
        voice:       { src: 'assets/audio/happy-birthday-pratima.mp3',   volume: 0.85 }
      }
    },

    /* ---- Pacing (milliseconds) ---- */
    timing: {
      sparklerBurn: 6500,     // how long the cake's sparkler fountain burns (and its sound plays), in ms
      celebrationHold: 3000   // how long the birthday celebration stays on screen after the reveal
    }
  };
})(window.App = window.App || {});
