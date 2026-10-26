/* A vintage floral stationery background, drawn in code so it stays sharp at any screen size:
   aged cream paper, a double hairline border with curled corner ornaments, and shaded pink flowers,
   leaves and buds growing in from the top-left and bottom-right corners.
   App.floralBackground(width, height) returns an <svg> string that fills exactly that size. */
(function (App) {
  const f = function (n) { return (Math.round(n * 10) / 10).toString(); };

  // a small seeded random generator so the arrangement is the same on every visit
  function rng(seed) {
    let s = seed >>> 0;
    return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }
  function quad(p0, c, p2, t) {
    const m = 1 - t;
    return { x: m * m * p0.x + 2 * m * t * c.x + t * t * p2.x, y: m * m * p0.y + 2 * m * t * c.y + t * t * p2.y };
  }
  function quadAngle(p0, c, p2, t) {
    const dx = 2 * (1 - t) * (c.x - p0.x) + 2 * t * (p2.x - c.x), dy = 2 * (1 - t) * (c.y - p0.y) + 2 * t * (p2.y - c.y);
    return Math.atan2(dy, dx) * 180 / Math.PI;
  }

  /* ---------- the pieces ---------- */
  function petal(len, wid) {
    return 'M0 0C' + f(-wid) + ' ' + f(-len * 0.22) + ' ' + f(-wid * 1.1) + ' ' + f(-len * 0.82) + ' ' + f(-wid * 0.4) + ' ' + f(-len * 0.97) +
      'Q0 ' + f(-len * 1.08) + ' ' + f(wid * 0.4) + ' ' + f(-len * 0.97) + 'C' + f(wid * 1.1) + ' ' + f(-len * 0.82) + ' ' + f(wid) + ' ' + f(-len * 0.22) + ' 0 0Z';
  }

  /** A poppy-like pink flower: three layers of shaded petals, a stamen ring and a dark heart. */
  function flower(x, y, r, rot, R) {
    let s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(rot) + ')" filter="url(#fl-shadow)">';
    const layers = [
      { n: 7, len: r, wid: r * 0.5, fill: 'url(#pet-back)', off: 0 },
      { n: 6, len: r * 0.8, wid: r * 0.46, fill: 'url(#pet-mid)', off: 360 / 12 },
      { n: 5, len: r * 0.58, wid: r * 0.4, fill: 'url(#pet-front)', off: 360 / 7 }
    ];
    layers.forEach(function (L) {
      for (let i = 0; i < L.n; i++) {
        const a = (i / L.n) * 360 + L.off + (R() - 0.5) * 14;
        const k = 0.9 + R() * 0.2;
        s += '<g transform="rotate(' + f(a) + ')"><path d="' + petal(L.len * k, L.wid) + '" fill="' + L.fill + '"/>' +
          '<path d="M0 ' + f(-L.len * 0.06) + 'L' + f(-L.wid * 0.18) + ' ' + f(-L.len * 0.7 * k) + 'M0 ' + f(-L.len * 0.06) + 'L' + f(L.wid * 0.22) + ' ' + f(-L.len * 0.74 * k) +
          'M0 ' + f(-L.len * 0.06) + 'L0 ' + f(-L.len * 0.82 * k) + '" stroke="#c4466f" stroke-opacity=".22" stroke-width="' + f(Math.max(0.6, r * 0.012)) + '" fill="none"/>' +
          '<path d="M' + f(-L.wid * 0.62) + ' ' + f(-L.len * 0.62) + 'Q' + f(-L.wid * 0.42) + ' ' + f(-L.len * 0.9 * k) + ' ' + f(-L.wid * 0.05) + ' ' + f(-L.len * 0.96 * k) +
          '" stroke="#fff" stroke-opacity=".4" stroke-width="' + f(Math.max(0.8, r * 0.022)) + '" fill="none" stroke-linecap="round"/></g>';
      }
    });
    // soft shading at the base of the petals, then the stamens
    s += '<circle r="' + f(r * 0.36) + '" fill="url(#fl-hollow)"/>';
    for (let i = 0; i < 26; i++) {
      const a = (i / 26) * Math.PI * 2 + R() * 0.2, l = r * (0.13 + R() * 0.1);
      s += '<line x1="' + f(Math.cos(a) * r * 0.05) + '" y1="' + f(Math.sin(a) * r * 0.05) + '" x2="' + f(Math.cos(a) * l) + '" y2="' + f(Math.sin(a) * l) + '" stroke="#e08a2c" stroke-width="' + f(Math.max(0.6, r * 0.012)) + '"/>' +
        '<circle cx="' + f(Math.cos(a) * l) + '" cy="' + f(Math.sin(a) * l) + '" r="' + f(Math.max(0.9, r * 0.022)) + '" fill="#f6b13c"/>';
    }
    s += '<circle r="' + f(r * 0.07) + '" fill="#6e2b2b"/><circle r="' + f(r * 0.07) + '" fill="none" stroke="#3b1414" stroke-opacity=".4" stroke-width=".8"/></g>';
    return s;
  }

  function leaf(x, y, len, ang, tone) {
    const w = len * 0.32;
    const d = 'M0 0C' + f(len * 0.2) + ' ' + f(-w * 0.95) + ' ' + f(len * 0.7) + ' ' + f(-w) + ' ' + f(len) + ' 0C' + f(len * 0.7) + ' ' + f(w) + ' ' + f(len * 0.2) + ' ' + f(w * 0.95) + ' 0 0Z';
    let veins = '';
    for (let i = 1; i <= 4; i++) {
      const px = len * (0.16 + i * 0.17);
      veins += 'M' + f(px) + ' 0L' + f(px + len * 0.12) + ' ' + f(-w * 0.55) + 'M' + f(px) + ' 0L' + f(px + len * 0.12) + ' ' + f(w * 0.55);
    }
    return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(ang) + ')" filter="url(#lf-shadow)"><path d="' + d + '" fill="url(#' + (tone ? 'leaf-b' : 'leaf-a') + ')"/>' +
      '<path d="M0 0L' + f(len * 0.96) + ' 0" stroke="#e8f2d6" stroke-opacity=".55" stroke-width="' + f(Math.max(0.8, len * 0.02)) + '" stroke-linecap="round"/>' +
      '<path d="' + veins + '" stroke="#e8f2d6" stroke-opacity=".28" stroke-width="' + f(Math.max(0.5, len * 0.012)) + '" fill="none"/>' +
      '<path d="M' + f(len * 0.12) + ' ' + f(-w * 0.5) + 'Q' + f(len * 0.5) + ' ' + f(-w * 0.95) + ' ' + f(len * 0.9) + ' ' + f(-w * 0.12) + '" stroke="#fff" stroke-opacity=".18" stroke-width="' + f(len * 0.03) + '" fill="none"/></g>';
  }

  function bud(x, y, len, ang) {
    const w = len * 0.3;
    return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(ang) + ')" filter="url(#lf-shadow)">' +
      '<path d="M0 0C' + f(-w) + ' ' + f(-len * 0.3) + ' ' + f(-w * 0.7) + ' ' + f(-len * 0.85) + ' 0 ' + f(-len) + 'C' + f(w * 0.7) + ' ' + f(-len * 0.85) + ' ' + f(w) + ' ' + f(-len * 0.3) + ' 0 0Z" fill="url(#bud-g)"/>' +
      '<path d="M' + f(-w * 0.3) + ' ' + f(-len * 0.2) + 'Q' + f(-w * 0.4) + ' ' + f(-len * 0.6) + ' ' + f(-w * 0.05) + ' ' + f(-len * 0.9) + '" stroke="#fff" stroke-opacity=".35" stroke-width="' + f(len * 0.05) + '" fill="none" stroke-linecap="round"/>' +
      '<path d="M0 0C' + f(-w * 0.75) + ' ' + f(-len * 0.06) + ' ' + f(-w * 0.62) + ' ' + f(-len * 0.26) + ' ' + f(-w * 0.08) + ' ' + f(-len * 0.3) + 'C' + f(w * 0.62) + ' ' + f(-len * 0.26) + ' ' + f(w * 0.75) + ' ' + f(-len * 0.06) + ' 0 0Z" fill="#6c9a58"/></g>';
  }

  /** A curved branch with leaves along it; returns { svg, point(t) }. */
  function branch(p0, c, p2, leaves, size, R, w) {
    let s = '<path d="M' + f(p0.x) + ' ' + f(p0.y) + 'Q' + f(c.x) + ' ' + f(c.y) + ' ' + f(p2.x) + ' ' + f(p2.y) + '" fill="none" stroke="#6b5b3a" stroke-opacity=".9" stroke-width="' + f(w) + '" stroke-linecap="round"/>' +
      '<path d="M' + f(p0.x) + ' ' + f(p0.y) + 'Q' + f(c.x) + ' ' + f(c.y) + ' ' + f(p2.x) + ' ' + f(p2.y) + '" fill="none" stroke="#7fa361" stroke-width="' + f(w * 0.45) + '" stroke-linecap="round"/>';
    for (let i = 1; i <= leaves; i++) {
      const t = i / (leaves + 1), p = quad(p0, c, p2, t), a = quadAngle(p0, c, p2, t);
      const side = i % 2 ? 1 : -1, len = size * (0.85 + R() * 0.5) * (1 - t * 0.3);
      s += leaf(p.x, p.y, len, a + side * (46 + R() * 22), i % 3 === 0);
      const q = quad(p0, c, p2, Math.min(0.98, t + 0.035));
      s += leaf(q.x, q.y, len * (0.7 + R() * 0.25), a - side * (52 + R() * 24), i % 2 === 0);
    }
    return s;
  }

  /** Faded feathery sprigs in the background, for depth. */
  function fern(x, y, len, ang, R) {
    let s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(ang) + ')" opacity=".34" filter="url(#fl-blur)"><path d="M0 0L' + f(len) + ' 0" stroke="#7fa06c" stroke-width="' + f(len * 0.012) + '"/>';
    const n = 11;
    for (let i = 1; i < n; i++) {
      const px = len * i / n, l = len * 0.15 * (1 - i / n * 0.6);
      s += '<ellipse cx="' + f(px + l * 0.4) + '" cy="' + f(-l * 0.55) + '" rx="' + f(l * 0.5) + '" ry="' + f(l * 0.17) + '" transform="rotate(-35 ' + f(px) + ' 0)" fill="#8fb27c"/>' +
        '<ellipse cx="' + f(px + l * 0.4) + '" cy="' + f(l * 0.55) + '" rx="' + f(l * 0.5) + '" ry="' + f(l * 0.17) + '" transform="rotate(35 ' + f(px) + ' 0)" fill="#8fb27c"/>';
    }
    return s + '</g>';
  }

  function scroll(x, y, s, rot) {
    return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + rot + ') scale(' + f(s) + ')" fill="none" stroke="#a9874c" stroke-width="1.5" stroke-linecap="round">' +
      '<path d="M0 0C20 0 30 10 30 22C30 32 22 38 14 36C7 34 6 26 12 23"/><path d="M0 7C14 7 21 14 21 22"/><path d="M22 4C32 2 40 8 40 16"/><circle cx="13" cy="25" r="1.6" fill="#a9874c"/></g>';
  }

  /* ---------- the whole background ---------- */
  App.floralBackground = function (W, H, opt) {
    const dark = !!(opt && opt.dark);                      // dark: the same flowers and border on a black ground instead of aged paper
    const u = W < H ? Math.min(H * 0.55, W * 1.1) : Math.min(H, W * 0.66);                       // the size every flower and branch is measured in
    const R = rng(7);
    const TL = function (dx, dy) { return { x: dx * u, y: dy * u }; };
    const BR = function (dx, dy) { return { x: W - dx * u, y: H - dy * u }; };

    const defs =
      '<defs>' +
        '<radialGradient id="night" cx=".5" cy=".46" r=".75"><stop offset="0" stop-color="#0c0806"/><stop offset="1" stop-color="#000"/></radialGradient>' +
        '<radialGradient id="paper" cx=".5" cy=".46" r=".78"><stop offset="0" stop-color="#fcf7e0"/><stop offset=".55" stop-color="#f4eacb"/><stop offset="1" stop-color="#e3cf9c"/></radialGradient>' +
        '<radialGradient id="vig" cx=".5" cy=".5" r=".75"><stop offset=".6" stop-color="#9b7634" stop-opacity="0"/><stop offset="1" stop-color="#8a6429" stop-opacity=".38"/></radialGradient>' +
        '<linearGradient id="pet-back" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbd0dc"/><stop offset=".5" stop-color="#f09bb6"/><stop offset="1" stop-color="#d4547d"/></linearGradient>' +
        '<linearGradient id="pet-mid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffdce6"/><stop offset=".5" stop-color="#f7aec3"/><stop offset="1" stop-color="#e0668c"/></linearGradient>' +
        '<linearGradient id="pet-front" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe7ee"/><stop offset=".5" stop-color="#fcc1d1"/><stop offset="1" stop-color="#ee7d9e"/></linearGradient>' +
        '<radialGradient id="fl-hollow"><stop offset="0" stop-color="#b8365f" stop-opacity=".65"/><stop offset="1" stop-color="#d4547d" stop-opacity="0"/></radialGradient>' +
        '<linearGradient id="leaf-a" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3f7a47"/><stop offset=".55" stop-color="#6aa05e"/><stop offset="1" stop-color="#8fbb78"/></linearGradient>' +
        '<linearGradient id="leaf-b" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4c8a52"/><stop offset=".55" stop-color="#78a965"/><stop offset="1" stop-color="#a3c885"/></linearGradient>' +
        '<linearGradient id="bud-g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#e26b92"/><stop offset="1" stop-color="#f9c3d3"/></linearGradient>' +
        '<filter id="fl-shadow" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="' + f(u * 0.006) + '" dy="' + f(u * 0.012) + '" stdDeviation="' + f(u * 0.011) + '" flood-color="#5a2a1c" flood-opacity=".38"/></filter>' +
        '<filter id="lf-shadow" x="-20%" y="-30%" width="150%" height="170%"><feDropShadow dx="' + f(u * 0.003) + '" dy="' + f(u * 0.006) + '" stdDeviation="' + f(u * 0.005) + '" flood-color="#2d3a1d" flood-opacity=".32"/></filter>' +
        '<filter id="fl-blur"><feGaussianBlur stdDeviation="' + f(u * 0.0035) + '"/></filter>' +
        '<filter id="fibre" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" seed="4"/><feColorMatrix values="0 0 0 0 .42  0 0 0 0 .31  0 0 0 0 .14  0 0 0 .55 -.12"/></filter>' +
        '<filter id="stain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".006 .008" numOctaves="4" seed="11"/><feColorMatrix values="0 0 0 0 .58  0 0 0 0 .42  0 0 0 0 .16  0 0 0 1.5 -.62"/></filter>' +
      '</defs>';

    // paper, fibres, age stains and the darkened edges
    let s = dark ? '<rect width="' + W + '" height="' + H + '" fill="url(#night)"/>' : ('<rect width="' + W + '" height="' + H + '" fill="url(#paper)"/>' +
      '<rect width="' + W + '" height="' + H + '" filter="url(#stain)" opacity=".26"/>' +
      '<rect width="' + W + '" height="' + H + '" filter="url(#fibre)" opacity=".35"/>' +
      '<rect width="' + W + '" height="' + H + '" fill="url(#vig)"/>');

    // double hairline border with little corner studs, and curled ornaments in two corners
    const m1 = u * 0.03, m2 = u * 0.05;
    s += '<rect x="' + f(m1) + '" y="' + f(m1) + '" width="' + f(W - m1 * 2) + '" height="' + f(H - m1 * 2) + '" rx="' + f(u * 0.006) + '" fill="none" stroke="#b99a5f" stroke-opacity=".75" stroke-width="' + f(Math.max(1.2, u * 0.0022)) + '"/>' +
      '<rect x="' + f(m2) + '" y="' + f(m2) + '" width="' + f(W - m2 * 2) + '" height="' + f(H - m2 * 2) + '" fill="none" stroke="#c4a76c" stroke-opacity=".7" stroke-width="' + f(Math.max(0.8, u * 0.0011)) + '"/>';
    [[m2, m2], [W - m2, m2], [m2, H - m2], [W - m2, H - m2]].forEach(function (c) {
      s += '<circle cx="' + f(c[0]) + '" cy="' + f(c[1]) + '" r="' + f(u * 0.006) + '" fill="#b99a5f" fill-opacity=".8"/>';
    });
    s += scroll(W - m1 * 0.5, m1 * 0.5, u * 0.0035, 90) + scroll(m1 * 0.5, H - m1 * 0.5, u * 0.0035, -90);

    // ---- top-left cluster (back to front) ----
    let tl = fern(u * 0.04, u * 0.62, u * 0.42, -60, R) + fern(u * 0.5, u * 0.1, u * 0.36, 8, R);
    const tA = [TL(-0.03, 0.17), TL(0.2, -0.05), TL(0.86, 0.15)], tB = [TL(0.03, -0.03), TL(-0.07, 0.36), TL(0.13, 0.78)];
    tl += branch(tA[0], tA[1], tA[2], 8, u * 0.115, R, u * 0.011) + branch(tB[0], tB[1], tB[2], 8, u * 0.11, R, u * 0.01);
    const tb = [TL(0.86, 0.15), TL(0.66, 0.26), TL(0.34, 0.44), TL(0.14, 0.78)];
    tl += bud(tb[0].x, tb[0].y, u * 0.095, 118) + bud(tb[1].x, tb[1].y, u * 0.08, 150) + bud(tb[2].x, tb[2].y, u * 0.085, 160) + bud(tb[3].x, tb[3].y, u * 0.09, 168);
    tl += flower(u * 0.72, u * 0.12, u * 0.078, 12, R) + flower(u * 0.44, u * 0.052, u * 0.125, -8, R) +
      flower(u * 0.087, u * 0.5, u * 0.07, 30, R) + flower(u * 0.205, u * 0.185, u * 0.155, 4, R);
    s += '<g class="fl-sway fl-tl">' + tl + '</g>';

    // ---- bottom-right cluster ----
    let br = fern(W - u * 0.1, H - u * 0.18, u * 0.46, -128, R) + fern(W - u * 0.36, H - u * 0.04, u * 0.3, -172, R);
    const bA = [BR(0.0, 0.2), BR(0.05, 0.45), BR(0.1, 0.72)], bB = [BR(0.04, 0.0), BR(0.34, 0.06), BR(0.84, 0.12)];
    br += branch(bA[0], bA[1], bA[2], 8, u * 0.115, R, u * 0.01) + branch(bB[0], bB[1], bB[2], 8, u * 0.11, R, u * 0.01);
    const bb = [BR(0.1, 0.72), BR(0.1, 0.5), BR(0.84, 0.12), BR(0.58, 0.1)];
    br += bud(bb[0].x, bb[0].y, u * 0.1, -8) + bud(bb[1].x, bb[1].y, u * 0.07, 14) + bud(bb[2].x, bb[2].y, u * 0.09, -80) + bud(bb[3].x, bb[3].y, u * 0.07, -88);
    br += flower(W - u * 0.1, H - u * 0.5, u * 0.085, -20, R) + flower(W - u * 0.5, H - u * 0.055, u * 0.1, 18, R) +
      flower(W - u * 0.64, H - u * 0.075, u * 0.055, -4, R) + flower(W - u * 0.15, H - u * 0.16, u * 0.16, -10, R);
    s += '<g class="fl-sway fl-br">' + br + '</g>';

    return '<svg class="floral-svg" xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true">' + defs + s + '</svg>';
  };
})(window.App = window.App || {});
