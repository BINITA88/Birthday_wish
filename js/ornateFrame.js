/* A gold arched frame in the style of a modern cast-gold mirror: a slim, flat, bright-gold border and a broad, symmetrical
   acanthus-scroll crest on the arch. Drawn in code. App.ornateFrame() returns an <svg> whose viewBox is 600x800 with the
   300x400 photo window at x 150-450, y 200-600, so it is placed at left/top -50% and 200% wide/high over a box the size
   of the window. */
(function (App) {
  const f = function (n) { return (Math.round(n * 10) / 10).toString(); };

  const WIN = 'M150 580L150 350A150 150 0 0 1 450 350L450 580Q450 600 430 600L170 600Q150 600 150 580Z';
  const T = 10;                                            // how far the border reaches out from the window edge

  function leafD(len, wid) {
    return 'M0 0C' + f(len * 0.2) + ' ' + f(-wid) + ' ' + f(len * 0.68) + ' ' + f(-wid * 0.92) + ' ' + f(len) + ' 0C' +
      f(len * 0.68) + ' ' + f(wid * 0.92) + ' ' + f(len * 0.2) + ' ' + f(wid) + ' 0 0Z';
  }
  function leaf(x, y, len, wid, ang) {
    return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(ang) + ')">' +
      '<path d="' + leafD(len, wid) + '" fill="url(#of-gold)" stroke="#9a6a12" stroke-width=".7" stroke-linejoin="round"/>' +
      '<path d="M2 0L' + f(len * 0.86) + ' 0" stroke="#fff0b0" stroke-opacity=".75" stroke-width=".9" stroke-linecap="round"/>' +
      '<path d="M' + f(len * 0.14) + ' ' + f(-wid * 0.55) + 'Q' + f(len * 0.5) + ' ' + f(-wid * 0.95) + ' ' + f(len * 0.84) + ' ' + f(-wid * 0.12) + '" fill="none" stroke="#fff6cc" stroke-opacity=".45" stroke-width="1"/></g>';
  }
  function scroll(d, w) {
    return '<path d="' + d + '" fill="none" stroke="#9a6a12" stroke-width="' + f(w + 1.6) + '" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="' + d + '" fill="none" stroke="url(#of-gold)" stroke-width="' + f(w) + '" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="' + d + '" fill="none" stroke="#fff3bd" stroke-opacity=".6" stroke-width="' + f(Math.max(0.8, w * 0.2)) + '" stroke-linecap="round" transform="translate(-.5 -.9)"/>';
  }
  function bead(x, y, r) {
    return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="url(#of-gold)" stroke="#9a6a12" stroke-width=".7"/><circle cx="' + f(x - r * 0.3) + '" cy="' + f(y - r * 0.3) + '" r="' + f(r * 0.32) + '" fill="#fff6cc" fill-opacity=".85"/>';
  }

  /** The right-hand half of the crest; the left half is this, mirrored. */
  function crestHalf() {
    let s = '';
    s += scroll('M306 194C328 177 358 170 386 180C406 187 422 183 430 170C436 160 428 150 419 154C412 158 415 169 423 167', 6.6);
    s += scroll('M314 199C338 198 360 204 374 220C382 230 395 230 399 221C402 214 395 208 389 212', 4.6);
    s += scroll('M322 188C336 178 350 178 360 186', 3);
    s += leaf(331, 181, 30, 8, -64) + leaf(354, 175, 28, 7.5, -42) + leaf(380, 180, 25, 6.5, -22) + leaf(405, 185, 20, 5, -4);
    s += leaf(344, 201, 24, 6.2, 52) + leaf(364, 208, 20, 5.2, 66);
    s += bead(423, 166, 3.6) + bead(392, 214, 3.2);
    return s;
  }

  function crest() {
    let s = '<g>' + crestHalf() + '</g><g transform="translate(600 0) scale(-1 1)">' + crestHalf() + '</g>';
    // centre palmette: a fan of leaves rising from a small base
    [-52, -34, -17, 0, 17, 34, 52].forEach(function (a) {
      const len = 46 - Math.abs(a) * 0.32;
      s += leaf(300, 196, len, 9.5 - Math.abs(a) * 0.04, -90 + a);
    });
    s += '<path d="M276 200Q300 190 324 200L318 207Q300 200 282 207Z" fill="url(#of-gold)" stroke="#9a6a12" stroke-width=".8"/>' + bead(300, 190, 4.4);
    return s;
  }

  App.ornateFrame = function () {
    const defs =
      '<defs>' +
        '<linearGradient id="of-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbe58a"/><stop offset=".3" stop-color="#e8b92f"/><stop offset=".55" stop-color="#d49e1c"/><stop offset=".8" stop-color="#f0cb55"/><stop offset="1" stop-color="#bf8913"/></linearGradient>' +
        '<filter id="of-shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="2" dy="4" stdDeviation="4" flood-color="#000" flood-opacity=".5"/></filter>' +
      '</defs>';
    const band = function (stroke, k, extra) { return '<path d="' + WIN + '" fill="none" stroke="' + stroke + '" stroke-width="' + f(2 * T * k) + '" stroke-linejoin="round"' + (extra || '') + '/>'; };
    const border =
      band('#9a6a12', 1) +                              // thin darker edge
      band('url(#of-gold)', 0.9) +                      // flat gold body
      band('#fff1b0', 0.42, ' stroke-opacity=".55"') +  // soft highlight along the middle
      band('#b98a1c', 0.12);                            // fine line where the photo meets the gold
    return '<svg class="photo-ornate" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" aria-hidden="true">' + defs +
      '<g filter="url(#of-shadow)">' + border + '</g></svg>';
  };
})(window.App = window.App || {});
