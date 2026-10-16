# A Birthday Experience for Pratima 🎂

A cinematic, 7-scene interactive birthday story. Pure HTML / CSS / vanilla JavaScript – no build step, no backend, no dependencies (Google Fonts are optional; fallback fonts are built in).

## Run it

**Easiest:** double-click `index.html`. It works from `file://` (the scripts are plain `<script>` tags, not ES modules).

**Recommended (VS Code):** install the *Live Server* extension → right-click `index.html` → *Open with Live Server*. Open the URL on a phone on the same Wi-Fi to test mobile.

Any static server also works, e.g. `npx serve .` or `python -m http.server`.

## The story

1. **Mysterious beginning** – near-black screen → "Click to begin ✨" → cinematic 3 · 2 · 1
2. **Celebration** – "HAPPY BIRTHDAY, PRATIMA!" reveal, balloons, golden motes, confetti, music
3. **Choose a flower** – Sunflower or Rose (hover on desktop, tap on mobile)
4. **Magical garden** – darkness → first light → sunrise → grass → flowers grow, unfold and bloom (the chosen flower dominates)
5. **Pratima in her garden** – garden blurs, spotlight, her photo glides in, garden refocuses, text reveal
6. **The cake** – table, cake descends, candles light; tap every candle; only then the celebration + next button
7. **Dinner invitation** – candle-lit table, "I'd Love That ❤️" / "Tell Me More ✨" (editable invitation card), **Relive the Magic ✨**

## Asset checklist

Nothing below is required for the site to run – missing files are handled gracefully (a monogram frame replaces the photo; missing audio is simply silent). Nothing was invented or bundled for you.

| File | Purpose | If missing |
|---|---|---|
| `assets/pratima.jpg` | **Her photo** (scene 5). Also tried: `.png`, `.jpeg`, `.webp` | Elegant "P · PRATIMA" monogram frame |
| `assets/audio/freesound_community-calm_game_music_1-49209.mp3` | Calm background music: plays from the start (or from the first tap if the browser blocks autoplay), pauses for the countdown and the birthday tune, then returns after the flower is chosen and plays to the end (set in `js/config.js`) | Silent |
| `assets/audio/freesound_community-firework-candle-76282.mp3` | The cake's sparkler: only its first seconds play while the sparkler burns (`timing.sparklerBurn` in `js/config.js`) | Silent |
| `assets/audio/satokin-happy-birthday-ukulele-600716.mp3` | Birthday tune: starts by itself during the scene 2 reveal, loops through the flower choice, fades out once a flower is chosen (set in `js/config.js`) | Silent |
| `assets/audio/freesound_community-3min-bell-sound-count-61773.mp3` | Countdown: only its first bell is used – one hit per number, 3 · 2 · 1 = tik · tik · tok (the last one pitched lower), then it stops | Silent |
| `assets/audio/celebration.mp3` | Cheer / jingle when the last candle goes out | Silent |
| `assets/audio/candle-blow.mp3` | Short puff of breath for each candle (< 1 s) | Silent |
| `assets/audio/happy-birthday-pratima.mp3` | Optional voice message, plays after the celebration sound | Skipped |

Use music / sounds you own or that are royalty-free / CC0 (e.g. Pixabay, Freesound CC0, or record your own voice). "Happy Birthday to You" itself is public domain in most places, so a simple self-played or CC0 instrumental is fine.

`assets/flowers/` and `assets/cake/` are intentionally empty: every flower and the cake are drawn in code (SVG/CSS). Drop in your own artwork there if you later want to swap anything.

### Replace the photograph

1. Copy her picture to `assets/pratima.jpg` (overwrite the name exactly).
2. Portrait photos (≈ 3:4) look best. It is cropped, never stretched. If faces sit too high/low, adjust `photoObjectPosition` in `js/config.js` (e.g. `'center 15%'`).
3. A **transparent PNG** named `assets/pratima.png` is detected automatically and shown as a glowing cut-out instead of in the arched gold frame. Backgrounds are never removed automatically.

### Add audio

Drop MP3 files with the exact names above into `assets/audio/`. Overall loudness is `audio.master` in `js/config.js` (0–1); each track has its own relative `volume`. The speaker button (top-right) mutes/unmutes at any time and remembers the choice.

## Personalise

Everything editable lives in **`js/config.js`**: name, greeting, every line of text, flower descriptions, invitation placeholders, audio paths/volumes, photo paths and timing. The invitation card's Date / Place / Time are placeholders – on screen they can be tapped and edited directly.

## Project structure

```
index.html
css/   style.css (design system + scenes) · animations.css (keyframes) · responsive.css (breakpoints, reduced-motion)
js/
  config.js         all wording / paths / volumes
  utils.js          helpers + global state (selected flower, candle counts, …)
  audioManager.js   music, sfx, voice, mute, volume, autoplay unlock, cleanup
  fx.js             canvas golden motes + confetti, DOM balloons
  flowers.js        procedural SVG flowers (sunflower, rose, daisy, tulip, lavender)
  sceneManager.js   scene registry, transitions (black / cross-fade), transition lock, tracked cleanup, replay
  intro.js · celebration.js · flowerSelection.js · garden.js · photoReveal.js · cake.js · dinner.js   (one per scene)
  main.js           boot
assets/ pratima.jpg · audio/ · flowers/ · cake/
```

Each scene registers `init(section, ctx)` and an optional `cleanup()`. `ctx` hands out timers, listeners and disposables that are all released automatically when the scene ends, so **Relive the Magic** resets cleanly (no duplicate listeners, no stray animations) and clears flower choice, candle counts and audio.

## Notes on behaviour

- **Autoplay:** browsers block sound until a gesture; the first "Click to begin" press unlocks audio.
- **Reduced motion:** with the OS "reduce motion" setting, particle counts drop, looping sway/float animations stop and transitions shorten.
- **Performance:** ≤ ~60 canvas particles on phones, transform/opacity animations, DPR capped at 1.5, particles pause when the tab is hidden.

## Known limitations

- Not tested on real iOS/Android hardware here; verified in desktop Chrome (desktop, phone portrait and phone landscape viewports) with the full flow, including candles and replay.
- No audio is bundled, so the experience is silent until you add the MP3s.
- Garden and dinner scenes use many animated SVG elements; very old phones may drop frames in the garden (mobile uses fewer plants).
- The photo arch crop is fixed; unusual photo aspect ratios are centre-cropped via `object-fit: cover`.
- Fonts load from Google Fonts when online; offline, system serif/sans/cursive fallbacks are used (script text looks different).
- "I'd Love That" is a playful message only – nothing is stored or sent anywhere.
