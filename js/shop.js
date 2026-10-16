/* SCENE 3b – The little rose shop (only after choosing the rose).
   An evening street, a florist's stall with bouquets on display; a girl walks up, asks for roses,
   the shopkeeper hands her a bouquet, and she leaves happy. Everything is drawn as inline SVG. */
(function (App) {
  const { CONFIG: C, u, FX } = App;

  const ROSES = ['#d84a65', '#f08aa3', '#fff1e6', '#f2a07b', '#c2223a'];
  const SKIN = '#f1c7a4', SKIN_SHADE = '#e0a983';

  /* ---------- reusable pieces ---------- */
  const ROSE_IMG = 'assets/images/rose.png';
  /* rose.png is a 500px photo; its stem ends at about (232,500) and the bloom sits ~53 units above that at bouquet scale */
  function roseImg(x, y, rot, w) {
    const k = w / 500;
    return '<image href="' + ROSE_IMG + '" width="500" height="500" style="filter:var(--rf,none)" transform="translate(' + x + ' ' + y + ') rotate(' + rot + ') scale(' + k.toFixed(4) + ') translate(-232 -500)"/>';
  }
  const ROSE_FAN = [[-36, 0.95], [-18, 1.05], [0, 1.1], [18, 1.05], [36, 0.95], [-8, 0.9], [10, 0.88]]
    .map(function (a, i) { return roseImg(0, -26 + (i > 4 ? 6 : 0), a[0], 78 * a[1]); }).join('');
  const BREATH = (function () {
    const r = u.mulberry(21); let o = '';
    for (let i = 0; i < 26; i++) {
      const a = (r() - 0.5) * 2.6, d = 40 + r() * 20, x = Math.sin(a) * d, y = -26 - Math.cos(a) * d;
      o += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + (0.9 + r() * 1.3).toFixed(1) + '" fill="#fff" opacity="' + (0.75 + r() * 0.25).toFixed(2) + '"/>';
    }
    return o;
  })();
  /* the photo is a red rose, so the other colours are gentle shifts of it (a hard recolour looks muddy) */
  const TINT = {
    '#d84a65': 'none',
    '#f08aa3': 'hue-rotate(-8deg) saturate(.8) brightness(1.18)',
    '#fff1e6': 'hue-rotate(-12deg) saturate(.55) brightness(1.3)',
    '#f2a07b': 'hue-rotate(10deg) saturate(.95) brightness(1.1)',
    '#c2223a': 'brightness(.9)'
  };
  const tint = function (col) { return TINT[col] || 'none'; };

  const DEFS =
    '<defs>' +
      '<linearGradient id="sh-sky" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#1c1738"/><stop offset=".55" stop-color="#6a3b6e"/><stop offset="1" stop-color="#f1a37e"/>' +
      '</linearGradient>' +
      '<linearGradient id="sh-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9a4e55"/><stop offset="1" stop-color="#6d3641"/></linearGradient>' +
      '<linearGradient id="sh-in" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a3040"/><stop offset=".6" stop-color="#3c202b"/><stop offset="1" stop-color="#27141d"/></linearGradient>' +
      '<radialGradient id="sh-warm" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#ffd89a" stop-opacity=".55"/><stop offset="1" stop-color="#ffd89a" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="sh-wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9a06a"/><stop offset="1" stop-color="#b57a47"/></linearGradient>' +
      '<linearGradient id="sh-front" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9a5b37"/><stop offset="1" stop-color="#6e3d24"/></linearGradient>' +
      '<linearGradient id="sh-metal" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6b7480"/><stop offset=".35" stop-color="#c3cad2"/><stop offset="1" stop-color="#59626d"/></linearGradient>' +
      '<linearGradient id="sh-paper" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f4bfcb"/><stop offset=".5" stop-color="#fbdce3"/><stop offset="1" stop-color="#eaa9b9"/></linearGradient>' +
      '<linearGradient id="sh-dress" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b9a6f0"/><stop offset="1" stop-color="#8c76d6"/></linearGradient>' +
      '<linearGradient id="sh-street" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5b4251"/><stop offset="1" stop-color="#281c26"/></linearGradient>' +
      '<radialGradient id="sh-rshade" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".38"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".32"/></radialGradient>' +
      '<pattern id="sh-brick" width="40" height="20" patternUnits="userSpaceOnUse">' +
        '<path d="M0 .5H40M0 10.5H40M0 .5V10M20 10.5V20" stroke="rgba(0,0,0,.14)" stroke-width="1" fill="none"/>' +
      '</pattern>' +
      '<filter id="sh-blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9"/></filter>' +

      /* a single rose; colour comes from `color` on the <use> */
      '<g id="sh-rose">' +
        '<circle r="14" fill="currentColor"/><circle r="14" fill="url(#sh-rshade)"/>' +
        '<path d="M-9-2Q-9-10 0-10Q9-10 9-1Q9 7 0 7Q-6 7-6 1Q-6-4 0-4Q4-4 4 0" fill="none" stroke="rgba(0,0,0,.27)" stroke-width="1.6" stroke-linecap="round"/>' +
        '<path d="M-12-6Q-6-14 4-13" fill="none" stroke="rgba(255,255,255,.4)" stroke-width="1.8" stroke-linecap="round"/>' +
      '</g>' +

      /* a wrapped bouquet built from the real rose photo: handle at (0,0), flowers on top.
         --rf (set on a parent) tints the roses, e.g. pink or white */
      '<g id="sh-bq">' +
        '<ellipse cx="-17" cy="-66" rx="15" ry="6" fill="#3f8a4c" transform="rotate(-30 -17 -66)"/>' +
        '<ellipse cx="17" cy="-66" rx="15" ry="6" fill="#357a43" transform="rotate(30 17 -66)"/>' +
        ROSE_FAN +
        BREATH +
        '<path d="M-31-58 L31-58 L7-3 Q0 1 -7-3 Z" fill="url(#sh-paper)"/>' +
        '<path d="M-31-58 L0-30 L31-58" fill="none" stroke="rgba(255,255,255,.7)" stroke-width="1.6" stroke-linejoin="round"/>' +
        '<path d="M-17-42 L-5-8M17-42 L5-8" stroke="rgba(180,90,110,.28)" stroke-width="1.2"/>' +
        '<path d="M-31-58 Q-26-62 -20-57 M31-58 Q26-62 20-57" fill="none" stroke="rgba(120,60,70,.25)" stroke-width="1.4"/>' +
        '<path d="M-9-24 Q-24-35 -20-19 Q-16-11 -2-21 Z M9-24 Q24-35 20-19 Q16-11 2-21 Z" fill="#fff3e0" stroke="rgba(0,0,0,.12)" stroke-width=".8"/>' +
        '<circle cx="0" cy="-23" r="4.2" fill="#f4c76b"/>' +
      '</g>' +

      /* a bunch of long-stemmed roses for the buckets */
      '<g id="sh-bucket">' +
        '<path d="M-23-36L23-36L18 0L-18 0Z" fill="url(#sh-metal)"/>' +
        '<ellipse cx="0" cy="-36" rx="23" ry="5" fill="#8f98a3"/>' +
        '<path d="M-21-26L21-26M-19.5-14L19.5-14" stroke="rgba(0,0,0,.18)" stroke-width="1.4"/>' +
        '<ellipse cx="0" cy="0" rx="18" ry="3" fill="rgba(0,0,0,.25)"/>' +
      '</g>' +
    '</defs>';

  function bucket(x, y, cols, seed) {
    const r = u.mulberry(seed);
    let s = '';
    const n = 7;
    for (let i = 0; i < n; i++) {
      const dx = (i - (n - 1) / 2) * 6.5 + (r() - 0.5) * 3, rot = (i - (n - 1) / 2) * 7.5 + (r() - 0.5) * 5, w = 74 + r() * 26;
      s += '<g style="--rf:' + tint(cols[i % cols.length]) + '">' + roseImg((x + dx).toFixed(1), y - 32, rot.toFixed(1), w) + '</g>';
    }
    return s + '<g transform="translate(' + x + ' ' + y + ')"><use href="#sh-bucket"/></g>';
  }

  function bouquet(x, y, col, k, rot) {
    return '<g style="--rf:' + tint(col) + '"><use href="#sh-bq" transform="translate(' + x + ' ' + y + ') rotate(' + (rot || 0) + ') scale(' + k + ')"/></g>';
  }

  function jar(x, y, col) {
    return '<g transform="translate(' + x + ' ' + y + ')">' + bouquet(0, -6, col, 0.46, 0) +
      '<path d="M-9-24L9-24L11 0L-11 0Z" fill="rgba(210,235,245,.28)" stroke="rgba(255,255,255,.35)" stroke-width="1"/></g>';
  }

  function lights() {
    let s = '<path d="M118 198Q220 226 330 200T545 202T682 198" fill="none" stroke="#2b1a14" stroke-width="1.6"/>';
    const pts = [[150, 212], [195, 219], [240, 218], [285, 211], [335, 202], [385, 205], [435, 212], [485, 214], [535, 207], [585, 205], [635, 210], [672, 205]];
    pts.forEach(function (p, i) {
      s += '<circle class="sh-bulb" style="animation-delay:-' + ((i * 0.37) % 2.4).toFixed(2) + 's" cx="' + p[0] + '" cy="' + (p[1] + 4) + '" r="4.2" fill="#ffe3a0"/>' +
        '<circle cx="' + p[0] + '" cy="' + (p[1] + 4) + '" r="12" fill="url(#sh-warm)" opacity=".8"/>';
    });
    return s;
  }

  function awning() {
    let s = '', n = 10, w = 580 / n;
    for (let i = 0; i < n; i++) {
      const x = 110 + i * w, col = i % 2 ? '#fff3e0' : '#d84a65';
      s += '<path d="M' + (x + 0.5) + ' 128L' + (x + w - 0.5) + ' 128L' + (x + w + 3) + ' 184L' + (x - 3) + ' 184Z" fill="' + col + '"/>' +
        '<path d="M' + (x - 3) + ' 184Q' + (x + w / 2) + ' 204 ' + (x + w + 3) + ' 184Z" fill="' + col + '"/>';
    }
    return '<rect x="106" y="214" width="588" height="12" fill="rgba(0,0,0,.22)" filter="url(#sh-blur)"/>' + s +
      '<path d="M104 124H696L704 134H96Z" fill="#3a2230"/>' +
      '<rect x="110" y="128" width="580" height="18" fill="rgba(0,0,0,.18)"/>';
  }

  /* ---------- the characters ---------- */
  function girl() {
    return '<g class="sh-girl"><g class="sh-gbody">' +
      '<ellipse cx="0" cy="2" rx="34" ry="6" fill="rgba(0,0,0,.38)"/>' +
      '<g class="sh-leg a" style="transform-origin:-3px -62px"><rect x="-10" y="-62" width="9" height="56" rx="4.5" fill="' + SKIN + '"/><ellipse cx="-2" cy="-4" rx="12" ry="5.5" fill="#5a2c3a"/></g>' +
      '<g class="sh-leg b" style="transform-origin:6px -62px"><rect x="2" y="-62" width="9" height="56" rx="4.5" fill="' + SKIN_SHADE + '"/><ellipse cx="10" cy="-4" rx="12" ry="5.5" fill="#5a2c3a"/></g>' +
      '<path d="M-23-150C-37-130-35-96-26-76L26-76C35-96 37-130 23-150Z" fill="#2b1a20"/>' +
      '<g class="sh-arm l" style="transform-origin:-19px -114px"><path d="M-19-114L-24-66" stroke="' + SKIN_SHADE + '" stroke-width="8" stroke-linecap="round"/><circle cx="-24" cy="-64" r="5.2" fill="' + SKIN_SHADE + '"/></g>' +
      '<path d="M-22-120L22-120L42-50Q0-40-42-50Z" fill="url(#sh-dress)"/>' +
      '<path d="M-21-100Q0-92 21-100L24-92Q0-84-24-92Z" fill="#f4c76b" opacity=".9"/>' +
      '<path d="M-42-50Q0-40 42-50" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="2"/>' +
      '<rect x="-4.5" y="-130" width="9" height="13" fill="' + SKIN + '"/>' +
      '<g class="sh-arm r" style="transform-origin:19px -114px"><path d="M19-114L24-64" stroke="' + SKIN + '" stroke-width="8" stroke-linecap="round"/><circle cx="24" cy="-62" r="5.2" fill="' + SKIN + '"/>' +
        '<g class="sh-gbq" transform="translate(24 -62) rotate(82) translate(0 8)"><g style="--rf:' + tint(ROSES[0]) + '"><use href="#sh-bq" transform="scale(.78)"/></g></g></g>' +
      '<circle cx="0" cy="-139" r="19.5" fill="' + SKIN + '"/>' +
      '<path d="M-21-141Q-22-166 0-165Q22-166 21-141Q9-154-5-152Q-15-150-21-141Z" fill="#2b1a20"/>' +
      '<g class="sh-blink"><ellipse cx="-7" cy="-137" rx="2" ry="2.6" fill="#2b1a20"/><ellipse cx="7" cy="-137" rx="2" ry="2.6" fill="#2b1a20"/></g>' +
      '<circle cx="-12.5" cy="-131" r="3.6" fill="rgba(240,110,135,.4)"/><circle cx="12.5" cy="-131" r="3.6" fill="rgba(240,110,135,.4)"/>' +
      '<path d="M-6-129Q0-123 6-129" fill="none" stroke="#b0525a" stroke-width="1.7" stroke-linecap="round"/>' +
      '<g style="color:#f08aa3"><use href="#sh-rose" transform="translate(15 -155) scale(.36)"/></g>' +
      '</g></g>';
  }

  function shopkeeperBody() {
    return '<g class="sh-keeper" transform="translate(560 332)"><g class="sh-kbob">' +
      '<path d="M-44-86Q0-102 44-86L48 14L-48 14Z" fill="#f3ead9"/>' +
      '<path d="M-32-80L32-80L36 14L-36 14Z" fill="#2f6b45"/>' +
      '<path d="M-32-80Q0-72 32-80L26-100M-32-80L-26-100" stroke="#2f6b45" stroke-width="5" fill="none"/>' +
      '<rect x="-16" y="-38" width="32" height="22" rx="3" fill="#25583a" stroke="rgba(255,255,255,.2)"/>' +
      '<g style="color:#d84a65"><use href="#sh-rose" transform="translate(0 -44) scale(.42)"/></g>' +
      '<path d="M36-82Q54-50 41-4" stroke="#f3ead9" stroke-width="14" fill="none" stroke-linecap="round"/><circle cx="40" cy="-3" r="7" fill="#e3ae8b"/>' +
      '<rect x="-6.5" y="-100" width="13" height="14" fill="#dca37f"/>' +
      '<circle cx="-22" cy="-119" r="5" fill="#e3ae8b"/><circle cx="22" cy="-119" r="5" fill="#e3ae8b"/>' +
      '<circle cx="0" cy="-120" r="23" fill="#ebbb99"/>' +
      '<path d="M-24-124Q-24-150 0-150Q24-150 24-124Q16-136 0-136Q-16-136-24-124Z" fill="#8a6b4a"/>' +
      '<path d="M-27-136Q0-160 27-136L27-132Q0-146-27-132Z" fill="#355f43"/><ellipse cx="0" cy="-141" rx="12" ry="4" fill="#355f43"/>' +
      '<g fill="none" stroke="#5a4330" stroke-width="1.6"><circle cx="-9" cy="-121" r="6.4"/><circle cx="9" cy="-121" r="6.4"/><path d="M-2.6-121H2.6"/></g>' +
      '<g class="sh-blink"><circle cx="-9" cy="-121" r="1.9" fill="#3a2a22"/><circle cx="9" cy="-121" r="1.9" fill="#3a2a22"/></g>' +
      '<path d="M-10-110Q-5-114 0-111Q5-114 10-110Q4-108 0-109Q-4-108-10-110Z" fill="#b9b2a6"/>' +
      '<path d="M-6-106Q0-101 6-106" fill="none" stroke="#a55b55" stroke-width="1.6" stroke-linecap="round"/>' +
      '<circle cx="-14" cy="-111" r="3.4" fill="rgba(240,110,135,.3)"/><circle cx="14" cy="-111" r="3.4" fill="rgba(240,110,135,.3)"/>' +
      '</g></g>';
  }

  function keeperArm() {     // drawn in front of the counter; swings out to hand over the bouquet
    return '<g transform="translate(526 250)"><g class="sh-karm">' +
      '<path d="M0 0L0 80" stroke="#f3ead9" stroke-width="14" stroke-linecap="round"/>' +
      '<g class="sh-kbq" transform="translate(0 84)"><g class="sh-kbq-in"><g style="--rf:' + tint(ROSES[0]) + '"><use href="#sh-bq" transform="scale(.82)"/></g></g></g>' +
      '<circle cx="0" cy="83" r="7.4" fill="#e3ae8b"/>' +
      '</g></g>';
  }

  /* ---------- the whole picture ---------- */
  function sceneSVG() {
    let s = '<svg class="sh-svg" viewBox="0 0 800 480" preserveAspectRatio="xMidYMid meet" aria-hidden="true">' + DEFS;
    // sky + distant roofs
    s += '<rect width="800" height="480" fill="url(#sh-sky)"/>';
    const r = u.mulberry(9);
    for (let i = 0; i < 40; i++) s += '<circle cx="' + (r() * 800).toFixed(0) + '" cy="' + (r() * 120).toFixed(0) + '" r="' + (0.5 + r() * 1.1).toFixed(1) + '" fill="#fff" opacity="' + (0.3 + r() * 0.6).toFixed(2) + '"/>';
    s += '<circle cx="766" cy="64" r="17" fill="#fff4d6"/>' +
      '<path d="M0 330V250H40V270H70V230H110V400H0Z M690 400V240H730V262H760V220H800V400Z" fill="#33223f"/>';
    // the shop front
    s += '<rect x="70" y="30" width="660" height="376" rx="4" fill="url(#sh-wall)"/><rect x="70" y="30" width="660" height="376" fill="url(#sh-brick)"/>' +
      '<rect x="64" y="22" width="672" height="20" rx="3" fill="#f3e3cf"/><rect x="64" y="40" width="672" height="5" fill="rgba(0,0,0,.25)"/>' +
      '<rect x="70" y="44" width="50" height="362" fill="#ecd9c1"/><rect x="680" y="44" width="50" height="362" fill="#ecd9c1"/>' +
      '<rect x="112" y="44" width="8" height="362" fill="rgba(0,0,0,.14)"/><rect x="680" y="44" width="8" height="362" fill="rgba(0,0,0,.14)"/>';
    // sign
    s += '<g><rect x="236" y="54" width="328" height="66" rx="10" fill="#1f3d2e"/><rect x="242" y="60" width="316" height="54" rx="7" fill="none" stroke="#f4c76b" stroke-width="2"/>' +
      '<text x="400" y="97" text-anchor="middle" font-family="\'Great Vibes\',\'Segoe Script\',cursive" font-size="46" fill="#f4c76b">Rose &amp; Petal</text>' +
      '<text x="400" y="110" text-anchor="middle" font-family="Jost,sans-serif" font-size="8.5" letter-spacing="3.2" fill="#fff3e0" opacity=".85">FRESH BOUQUETS DAILY</text></g>' +
      '<path d="M236 62L120 60M564 62L680 60" stroke="#2b1a14" stroke-width="2"/>';
    // inside
    s += '<rect x="135" y="190" width="530" height="216" fill="url(#sh-in)"/>' +
      '<ellipse cx="400" cy="300" rx="280" ry="110" fill="url(#sh-warm)"/>' +
      '<rect x="135" y="190" width="530" height="216" fill="none" stroke="#2b1a14" stroke-width="3"/>';
    // shelves with bouquets in jars
    s += '<rect x="148" y="252" width="350" height="7" fill="url(#sh-wood)"/><rect x="148" y="259" width="350" height="4" fill="rgba(0,0,0,.3)"/>' +
      '<rect x="296" y="312" width="202" height="7" fill="url(#sh-wood)"/><rect x="296" y="319" width="202" height="4" fill="rgba(0,0,0,.3)"/>';
    const jc = ['#d84a65', '#f08aa3', '#fff1e6', '#f2a07b', '#c2223a', '#f08aa3', '#d84a65'];
    for (let i = 0; i < 7; i++) s += jar(176 + i * 50, 252, jc[i]);
    for (let i = 0; i < 4; i++) s += jar(326 + i * 50, 312, jc[(i + 3) % 7]);
    // chalkboard
    s += '<g transform="rotate(-2 215 300)"><rect x="150" y="272" width="100" height="62" rx="4" fill="#26302b" stroke="#a8754a" stroke-width="4"/>' +
      '<text x="200" y="298" text-anchor="middle" font-family="\'Great Vibes\',cursive" font-size="22" fill="#fff3e0">Roses</text>' +
      '<text x="200" y="318" text-anchor="middle" font-family="Jost,sans-serif" font-size="9.5" letter-spacing="1.5" fill="#f4b6c2">PICKED THIS MORNING</text></g>';
    // the display stand on the left inside
    s += '<g>' +
      '<rect x="146" y="344" width="132" height="6" fill="url(#sh-wood)"/><rect x="146" y="376" width="132" height="6" fill="url(#sh-wood)"/>' +
      '<rect x="150" y="344" width="5" height="62" fill="#8a5232"/><rect x="270" y="344" width="5" height="62" fill="#8a5232"/>' +
      bouquet(172, 344, ROSES[1], 0.4, -4) + bouquet(212, 344, ROSES[0], 0.4, 3) + bouquet(252, 344, ROSES[2], 0.4, -2) +
      bouquet(172, 376, ROSES[3], 0.4, 3) + bouquet(212, 376, ROSES[4], 0.4, -3) + bouquet(252, 376, ROSES[1], 0.4, 4) +
      '</g>';
    s += lights();
    s += shopkeeperBody();
    // counter
    s += '<g><rect x="286" y="332" width="384" height="15" rx="3" fill="url(#sh-wood)"/><rect x="286" y="346" width="384" height="60" fill="url(#sh-front)"/>' +
      '<path d="M300 356H656V398H300Z" fill="none" stroke="rgba(0,0,0,.22)" stroke-width="2"/><path d="M478 356V398" stroke="rgba(0,0,0,.2)" stroke-width="2"/>' +
      '<rect x="286" y="346" width="384" height="3" fill="rgba(0,0,0,.25)"/>' +
      // things on the counter: paper roll, ribbon, little vase, bell
      '<rect x="318" y="316" width="46" height="16" rx="8" fill="#f3d3b8"/><ellipse cx="320" cy="324" rx="5" ry="8" fill="#e6bd9d"/>' +
      '<ellipse cx="390" cy="326" rx="9" ry="6" fill="#d84a65"/><rect x="381" y="319" width="18" height="12" fill="#d84a65"/><ellipse cx="390" cy="319" rx="9" ry="4" fill="#f08aa3"/>' +
      '<path d="M606 332L610 306L626 306L630 332Z" fill="rgba(210,235,245,.35)" stroke="rgba(255,255,255,.4)"/>' +
      '<g style="color:#f08aa3"><use href="#sh-rose" transform="translate(618 296) scale(.62)"/></g><g style="color:#d84a65"><use href="#sh-rose" transform="translate(610 302) scale(.5)"/></g>' +
      '<path d="M612 306L618 280" stroke="#3b7a45" stroke-width="2"/>' +
      '<text x="478" y="383" text-anchor="middle" font-family="\'Great Vibes\',cursive" font-size="25" fill="#f4c76b" opacity=".92">with love</text></g>';
    s += '<g id="sh-keeper-arm">' + keeperArm() + '</g>';
    // sidewalk and street
    s += '<rect x="0" y="404" width="800" height="76" fill="url(#sh-street)"/><rect x="0" y="404" width="800" height="5" fill="rgba(255,255,255,.12)"/>';
    const q = u.mulberry(3);
    for (let i = 0; i < 70; i++) s += '<ellipse cx="' + (q() * 800).toFixed(0) + '" cy="' + (412 + q() * 66).toFixed(0) + '" rx="' + (7 + q() * 9).toFixed(0) + '" ry="2.4" fill="rgba(0,0,0,.14)"/>';
    s += '<ellipse cx="400" cy="440" rx="330" ry="26" fill="url(#sh-warm)" opacity=".7"/>';
    // lanterns on the pillars
    s += '<g><circle cx="96" cy="170" r="30" fill="url(#sh-warm)"/><rect x="90" y="160" width="12" height="20" rx="3" fill="#ffe3a0"/><rect x="88" y="156" width="16" height="4" fill="#2b1a14"/><rect x="88" y="180" width="16" height="4" fill="#2b1a14"/>' +
      '<circle cx="704" cy="170" r="30" fill="url(#sh-warm)"/><rect x="698" y="160" width="12" height="20" rx="3" fill="#ffe3a0"/><rect x="696" y="156" width="16" height="4" fill="#2b1a14"/><rect x="696" y="180" width="16" height="4" fill="#2b1a14"/></g>';
    // buckets of roses out on the pavement
    s += bucket(100, 414, [ROSES[0], ROSES[1]], 11) + bucket(172, 418, [ROSES[2], ROSES[1]], 12) + bucket(244, 414, [ROSES[3], ROSES[0], ROSES[4]], 13) +
      bucket(706, 416, [ROSES[1], ROSES[0], ROSES[2]], 14);
    // the girl (feet on the pavement)
    s += '<g class="sh-girl-pos" id="sh-girl-pos">' + girl() + '</g>';
    return s + '</svg>';
  }

  /* ---------- the scene ---------- */
  App.SceneManager.register('shop', {
    init(sec, ctx) {
      const T = C.text;
      sec.innerHTML =
        '<div class="shop-caption"><p class="shop-cap c1 fade-up">' + u.esc(T.shopCaption1) + '</p><p class="shop-cap c2 fade-up">' + u.esc(T.shopCaption2) + '</p></div>' +
        '<div class="shop-stage">' + sceneSVG() +
          '<div class="shop-bubble girl-b"><span></span></div><div class="shop-bubble keeper-b"><span></span></div>' +
          '<div class="shop-hearts"></div>' +
        '</div>' +
        '<button class="btn shop-skip fade-up" type="button">' + u.esc(T.shopSkip) + '</button>';

      const fx = FX.field(sec, { motes: 18, rgb: '255,214,150', size: 0.8 });
      ctx.add(fx.destroy);

      const girlEl = sec.querySelector('#sh-girl-pos');
      const girlG = girlEl.querySelector('.sh-girl');
      const c1 = sec.querySelector('.c1'), c2 = sec.querySelector('.c2');
      const bG = sec.querySelector('.girl-b'), bK = sec.querySelector('.keeper-b');
      const skip = sec.querySelector('.shop-skip');
      const hearts = sec.querySelector('.shop-hearts');
      const kArm = sec.querySelector('.sh-karm'), kBq = sec.querySelector('.sh-kbq');
      const quick = App.reduced ? 0.45 : 1;

      let leaving = false;
      function leave() {
        if (leaving) return;
        leaving = true;
        App.SceneManager.go('cake', { mode: 'black', duration: 1600, hold: 500 });   // the rose story carries on to the cake
      }
      ctx.on(skip, 'click', leave);
      ctx.show(skip, 2500);

      function say(bubble, text, ms) {
        bubble.firstChild.textContent = text;
        bubble.classList.add('on');
        return ctx.sleep(ms * quick).then(function () { bubble.classList.remove('on'); });
      }
      function loveBurst() {
        for (let i = 0; i < 9; i++) {
          const h = document.createElement('i');
          h.textContent = '♥';
          h.style.setProperty('--dx', u.rand(-60, 60).toFixed(0) + 'px');
          h.style.setProperty('--dy', u.rand(-130, -70).toFixed(0) + 'px');
          h.style.animationDelay = (i * 120) + 'ms';
          h.style.fontSize = u.rand(0.9, 1.7).toFixed(2) + 'rem';
          h.addEventListener('animationend', function () { h.remove(); });
          hearts.appendChild(h);
        }
      }

      const WALK_IN = 4600 * quick, WALK_OUT = 4200 * quick;
      function walk(to, ms) {
        girlEl.style.transition = 'transform ' + ms + 'ms linear';
        girlG.classList.add('walking');
        void girlEl.getBoundingClientRect();
        girlEl.style.transform = 'translate(' + to + 'px, 430px)';
        return ctx.sleep(ms).then(function () { girlG.classList.remove('walking'); });
      }

      girlEl.style.transform = 'translate(-90px, 430px)';

      (async function () {
        await ctx.sleep(700);
        c1.classList.add('in');                          // a quiet evening at the florist
        await ctx.sleep(1800 * quick);
        await walk(396, WALK_IN);                        // she walks up to the counter
        await ctx.sleep(350);
        await say(bG, T.shopGirl1, 3200);
        await say(bK, T.shopKeeper1, 3000);
        kArm.classList.add('give');                      // the shopkeeper holds out the bouquet
        await ctx.sleep(1500 * quick);
        girlG.classList.add('receive');                  // she reaches out for it
        await ctx.sleep(1100 * quick);
        kBq.classList.add('gone');                       // …and it is in her hands
        girlG.classList.add('has');
        kArm.classList.remove('give');
        loveBurst();
        c1.classList.remove('in');
        await ctx.sleep(500);
        c2.classList.add('in');
        await ctx.sleep(1000 * quick);
        await say(bG, T.shopGirl2, 3000);
        await say(bK, T.shopKeeper2, 2600);
        await walk(930, WALK_OUT);                       // off she goes with her roses
        leave();
      })();
    }
  });
})(window.App);
