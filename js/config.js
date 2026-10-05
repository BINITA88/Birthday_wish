/* ==========================================================================
   CONFIG – everything you may want to personalise lives here.
   Edit the wording / paths below; no other file needs to change.
   ========================================================================== */
(function (App) {
  App.CONFIG = {

    /* ---- Who is this for? ---- */
    name: 'Pratima',
    greeting: 'Happy Birthday, Pratima!',          // split at the first comma into two lines

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

    /* ---- The two flowers (scene 3) ---- */
    flowers: {
      sunflower: {
        title: 'Sunflower', emoji: '🌻',
        description: 'Like sunshine, warmth, and the little things that make life beautiful.',
        button: 'Choose Sunflower'
      },
      rose: {
        title: 'Rose', emoji: '🌹',
        description: 'Elegant, timeless, and beautiful in its own way.',
        button: 'Choose Rose'
      }
    },

    /* ---- All on-screen wording ---- */
    text: {
      introLine: 'Something special is waiting for you...',
      introButton: 'Click to begin ✨',

      flowerHeading1: 'Every beautiful soul has a favorite flower...',
      flowerHeading2: 'Which flower would you choose, Pratima?',

      gardenMessage: 'Look what your little choice created...',

      photoLine1: 'Some people make the world a little more beautiful just by being in it.',
      photoLine2: 'And today, this little garden is all yours, Pratima. 🌷',
      photoButton: "Let's Go to the Cake 🎂",

      cakeWish: 'Make a wish, Pratima... ✨',
      cakeHint: 'Tap the candles to blow them out.',
      cakeNext: "Let's Have Dinner Together 🍽️",

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
        cinematic:   { src: 'assets/audio/cinematic.mp3',                volume: 0.5 },
        music:       { src: 'assets/audio/birthday-music.mp3',           volume: 0.55, loop: true },
        celebration: { src: 'assets/audio/celebration.mp3',              volume: 0.6 },
        blow:        { src: 'assets/audio/candle-blow.mp3',              volume: 0.6 },
        voice:       { src: 'assets/audio/happy-birthday-pratima.mp3',   volume: 0.85 }
      }
    },

    /* ---- Pacing (milliseconds) ---- */
    timing: {
      celebrationHold: 3000   // how long the birthday celebration stays on screen after the reveal
    }
  };
})(window.App = window.App || {});
