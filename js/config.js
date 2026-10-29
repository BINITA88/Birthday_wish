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
    posterImage: 'assets/images/lastposterimage.jpg',                  // the last scene's puzzle poster
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
        cardSubline: 'A little surprise, a little happiness, and lots of beautiful wishes. 🌻',
        button: 'Continue ✨'
      },
      rose: {
        image: 'assets/images/rose-moonlit-hero.png',
        title: 'Rose', emoji: '🌹',
        description: 'Elegant, timeless, and beautiful in its own way.',
        cardLine: 'Like a rose, you make life beautiful.',
        cardSubline: 'A little surprise, a little happiness, and lots of beautiful wishes. 🌹',
        button: 'Continue ✨'
      }
    },

    /* ---- All on-screen wording ---- */
    text: {
      // waitLine: 'Some people just feel like\na little bit of magic.\nAnd you are one of them,',
      waitGreeting: 'Hey beautiful,',
      waitButton: 'Tap for music & begin ♡',
      introLine: 'Something special is waiting for you...',
      introButton: 'Click to begin ✨',

      flowerHeading1: 'A Little Garden for You',
      flowerHeading2: 'Every flower has its own beauty, just like you. ❤️ Choose a flower and see what blooms for you…',

      shopCaption1: 'A little rose shop on the corner...',
      shopCaption2: 'Every rose is a small piece of love. 🌹',
      shopGirl1: 'Good evening! A bouquet of your finest roses, please?',
      shopKeeper1: 'Of course, dear. The loveliest ones, just for you.',
      shopGirl2: 'Thank you, they are beautiful! 🌹',
      shopKeeper2: 'Enjoy them. Come again soon!',
      shopSkip: 'Skip ›',

      gardenMessage: 'A little garden, made with love for you…',
      bouquetTitle: 'Happy Birthday, Pratima',

      photoLine1: 'A garden of little memories.',
      photoLine2: 'Pratima, this little world was made just for you. ❤️🌺',
      photoButton: 'Open your surprise 🎈',

      cakeNext: 'Message for You ✉️',
      birthdayLine: 'Every little detail,\nI created just for you. 💗',

      flowerCaps: [
        { main: 'Sunflowers for Your Sunshine', sub: 'Because you light up every room ☀️' },
        { main: 'Roses for Your Grace', sub: 'Because you make life more beautiful 🌹' },
        { main: 'Daisies for Your Smile', sub: 'Because your joy is pure and bright 🌼' }
      ],

      wishTitle: 'A Birthday Wish for You',
      wishCta: 'Click for Magic ✨',

      msgOpen: 'OPEN',
      /* THE letter: this message and nothing else. It starts typing the moment OPEN is pressed. */
      msgWelcome: {
        title: 'Happy Birthday, Pratima! ❤️🎂',
        paras: [
          'May this beautiful new chapter of your life bring you endless happiness, genuine love, peaceful moments, and countless reasons to smile. May every dream you carry in your heart slowly turn into reality, and may your hard work lead you to all the success you truly deserve.',
          'I hope life brings you more beautiful moments than you expect, more reasons to smile than to worry, and people who appreciate you for who you truly are. I hope you always remember how much potential you have and never stop believing in yourself, even when life gets difficult.',
          'May you always find the courage to follow your dreams, the strength to overcome every challenge, and the confidence to keep moving forward. No matter how much life changes, I hope you never lose that sweet smile of yours.',
          "Some people make ordinary moments feel a little more special just by being themselves, and I'm genuinely glad I got the chance to know you. Today, I simply wish to see you happy, smiling, and getting closer to everything your heart wishes for.",
          "I hope your birthday is filled with love, laughter, lovely surprises, and little moments you'll remember with a smile.",
          'Have the most beautiful birthday, Pratima! ❤️🌻',
          'Keep smiling, keep growing, and keep being you. May life always give you reasons to smile, and may your smile shine as brightly as the sunshine.'
        ],
        sign: 'Happy Birthday, my good luck P. 🤍🌻'
      },
      msgContinue: 'Make a wish ✨',
      /* The full letter, shown on two turning pages after the first page. */
      finalWish: 'MANY MANY HAPPY RETURNS OF THE DAY, MY DEAR BOSS ❤️🌹',

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
        suraj:       { src: 'assets/audio/suraj-hua-madham.mp4', volume: 0.55, loop: true },   // from Begin until the cake (a 15 s guitar loop)
        alfaz:       { src: 'assets/audio/alfaz.mp4', volume: 0.5, loop: true },   // from the letter on; fades out when the Happy Birthday tune arrives
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
