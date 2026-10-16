/* Cartoon party animals for the cake scene: they sing, dance and play the drum, guitar and tambourine,
   every one of them in a birthday cap. Drawn as inline SVG; the motion is in CSS (.crit …). */
(function (App) {
  const u = App.u;
  let uid = 0;

  /* species: fur colour, belly colour, ear style */
  const KINDS = {
    bear:  { fur: '#c98a5b', belly: '#ecc9a2', ear: 'round', inner: '#e8a87c' },
    bunny: { fur: '#f6e9f0', belly: '#ffffff', ear: 'long', inner: '#f6a6c0' },
    cat:   { fur: '#f2a64e', belly: '#ffe2b8', ear: 'point', inner: '#f7a1a8' },
    panda: { fur: '#fbfbfb', belly: '#ffffff', ear: 'round', inner: '#2b2b30', dark: '#2b2b30' }
  };

  function ears(k) {
    if (k.ear === 'long') {
      return '<g class="ear-l" style="transform-origin:54px 40px"><ellipse cx="52" cy="14" rx="9" ry="25" transform="rotate(-10 52 14)" fill="' + k.fur + '"/><ellipse cx="52" cy="16" rx="4.6" ry="18" transform="rotate(-10 52 16)" fill="' + k.inner + '"/></g>' +
             '<g class="ear-r" style="transform-origin:88px 40px"><ellipse cx="90" cy="14" rx="9" ry="25" transform="rotate(10 90 14)" fill="' + k.fur + '"/><ellipse cx="90" cy="16" rx="4.6" ry="18" transform="rotate(10 90 16)" fill="' + k.inner + '"/></g>';
    }
    if (k.ear === 'point') {
      return '<path d="M40 44L41 14L62 32Z" fill="' + k.fur + '" stroke="' + k.fur + '" stroke-width="4" stroke-linejoin="round"/><path d="M46 38L46 22L56 31Z" fill="' + k.inner + '"/>' +
             '<path d="M100 44L99 14L78 32Z" fill="' + k.fur + '" stroke="' + k.fur + '" stroke-width="4" stroke-linejoin="round"/><path d="M94 38L94 22L84 31Z" fill="' + k.inner + '"/>';
    }
    const c = k.dark || k.fur;
    return '<circle cx="42" cy="34" r="12" fill="' + c + '"/><circle cx="98" cy="34" r="12" fill="' + c + '"/>' +
           (k.dark ? '' : '<circle cx="42" cy="34" r="6.5" fill="' + k.inner + '"/><circle cx="98" cy="34" r="6.5" fill="' + k.inner + '"/>');
  }

  /** The striped party cap with a pom-pom, tilted a little. */
  function hat(id, c1, c2) {
    return '<g class="hat" style="transform-origin:70px 34px"><g transform="rotate(-9 70 34)">' +
      '<clipPath id="' + id + '"><path d="M50 36L90 36L70 -8Z"/></clipPath>' +
      '<path d="M50 36L90 36L70 -8Z" fill="' + c1 + '"/>' +
      '<g clip-path="url(#' + id + ')" fill="' + c2 + '"><path d="M44 30L96 16L96 24L44 38Z"/><path d="M44 12L96 -2L96 6L44 20Z"/></g>' +
      '<ellipse cx="70" cy="36" rx="23" ry="4.4" fill="' + c2 + '"/>' +
      '<circle cx="70" cy="-9" r="6" fill="#fff7d6"/><circle cx="68.5" cy="-10.5" r="2.2" fill="#fff"/></g></g>';
  }

  function face(k, kind, mouth) {
    let s = '';
    if (kind === 'panda') s += '<ellipse cx="57" cy="60" rx="9.5" ry="11" transform="rotate(-18 57 60)" fill="#2b2b30"/><ellipse cx="83" cy="60" rx="9.5" ry="11" transform="rotate(18 83 60)" fill="#2b2b30"/>';
    s += '<ellipse cx="70" cy="76" rx="14" ry="10.5" fill="' + (kind === 'panda' || kind === 'bunny' ? '#ffffff' : k.belly) + '"/>';
    s += '<g class="eyes" style="transform-origin:70px 60px"><ellipse cx="57" cy="60" rx="4.4" ry="5.4" fill="#1d1a22"/><ellipse cx="83" cy="60" rx="4.4" ry="5.4" fill="#1d1a22"/>' +
         '<circle cx="58.6" cy="58" r="1.7" fill="#fff"/><circle cx="84.6" cy="58" r="1.7" fill="#fff"/></g>';
    s += '<ellipse cx="46" cy="72" rx="6.5" ry="4.2" fill="#ff8aa6" opacity=".5"/><ellipse cx="94" cy="72" rx="6.5" ry="4.2" fill="#ff8aa6" opacity=".5"/>';
    s += kind === 'bunny' ? '<ellipse cx="70" cy="69" rx="3.6" ry="2.6" fill="#f08aa4"/>' : '<ellipse cx="70" cy="69" rx="4.2" ry="3" fill="#3a2a2a"/>';
    if (kind === 'cat') s += '<path d="M30 66l-14-3M30 71l-14 1M110 66l14-3M110 71l14 1" stroke="#7a5030" stroke-width="1.4" stroke-linecap="round"/>';
    s += mouth === 'sing'
      ? '<g class="mouth-sing" style="transform-origin:70px 76px"><ellipse cx="70" cy="79" rx="7" ry="6.5" fill="#5a1d2b"/><ellipse cx="70" cy="82.5" rx="4.4" ry="2.6" fill="#ff7d8e"/></g>'
      : '<path d="M62 74Q70 83 78 74" fill="none" stroke="#3a2a2a" stroke-width="2.2" stroke-linecap="round"/>';
    return s;
  }

  function note(x, y, col, delay) {
    return '<g class="note" style="--nd:' + delay + 's;transform-origin:' + x + 'px ' + y + 'px"><ellipse cx="' + x + '" cy="' + y + '" rx="4.4" ry="3.4" transform="rotate(-20 ' + x + ' ' + y + ')" fill="' + col + '"/>' +
      '<path d="M' + (x + 3.8) + ' ' + (y - 1) + 'V' + (y - 15) + 'q6 1 6 7" fill="none" stroke="' + col + '" stroke-width="2" stroke-linecap="round"/></g>';
  }

  /** Arm: a rounded limb from the shoulder to the hand, swinging about the shoulder. */
  function arm(side, hand, cls, extra, fur, shirt) {
    const sx = side === 'l' ? 48 : 92, sy = 108;
    return '<g class="arm ' + cls + '" style="transform-origin:' + sx + 'px ' + sy + 'px">' +
      '<path d="M' + sx + ' ' + sy + 'L' + hand[0] + ' ' + hand[1] + '" stroke="' + shirt + '" stroke-width="12" stroke-linecap="round"/>' +
      '<circle cx="' + hand[0] + '" cy="' + hand[1] + '" r="6.2" fill="' + fur + '"/>' + (extra || '') + '</g>';
  }

  /**
   * role: singer | drummer | guitar | tambourine | dance.  kind: bear | bunny | cat | panda.
   */
  function critter(o) {
    const k = KINDS[o.kind], id = 'hc' + (uid++);
    const fur = k.fur, shirt = o.shirt, dark = '#2b2b30';
    let behind = '', front = '', arms = '', mouth = 'smile';

    if (o.role === 'singer') {
      mouth = 'sing';
      arms = arm('l', [24, 84], 'wave', '', fur, shirt) +
        arm('r', [86, 82], 'micArm', '<rect x="83" y="68" width="5" height="16" rx="2.4" transform="rotate(8 85 76)" fill="#444"/><circle cx="87" cy="67" r="6" fill="#9aa3ad"/><circle cx="85.5" cy="65.5" r="2" fill="#e9eef2"/>', fur, shirt);
      front = note(112, 56, '#ff6b9a', 0) + note(122, 34, '#ffd24a', 0.9) + note(18, 46, '#7fd6ff', 1.7);
    } else if (o.role === 'drummer') {
      front =
        '<g class="drum"><path d="M42 128h56v22q-28 9-56 0Z" fill="#d9453a"/><path d="M42 134l7 10 7-10 7 10 7-10 7 10 7-10 7 10 7-10" fill="none" stroke="#fff4d6" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<ellipse cx="70" cy="128" rx="28" ry="7" fill="#f7e7c4" stroke="#b9822a" stroke-width="1.6"/></g>';
      arms = arm('l', [56, 120], 'hitL', '<path d="M56 120L46 100" stroke="#8a5a2b" stroke-width="3.4" stroke-linecap="round"/><circle cx="45.5" cy="99" r="3" fill="#f5d9a0"/>', fur, shirt) +
        arm('r', [84, 120], 'hitR', '<path d="M84 120L94 100" stroke="#8a5a2b" stroke-width="3.4" stroke-linecap="round"/><circle cx="94.5" cy="99" r="3" fill="#f5d9a0"/>', fur, shirt);
      front += note(16, 70, '#ff6b9a', 0.3) + note(124, 62, '#7fd6ff', 1.2);
    } else if (o.role === 'guitar') {
      front = '<g class="guitar"><path d="M70 126L30 92" stroke="#6b4423" stroke-width="5.4" stroke-linecap="round"/><rect x="22" y="84" width="9" height="12" rx="2" transform="rotate(-38 26 90)" fill="#4a2e16"/>' +
        '<ellipse cx="76" cy="134" rx="21" ry="17" transform="rotate(-22 76 134)" fill="#d18a46"/><ellipse cx="76" cy="134" rx="21" ry="17" transform="rotate(-22 76 134)" fill="none" stroke="#8a5a2b" stroke-width="2.2"/>' +
        '<circle cx="76" cy="134" r="5.4" fill="#2b1a0e"/><path d="M50 118L82 140" stroke="#f3e6c8" stroke-width="1" opacity=".8"/></g>';
      arms = arm('l', [38, 100], 'fret', '', fur, shirt) + arm('r', [82, 134], 'strum', '', fur, shirt);
      front += note(114, 70, '#ffd24a', 0) + note(124, 46, '#ff6b9a', 1);
    } else if (o.role === 'tambourine') {
      arms = arm('l', [26, 80], 'wave', '', fur, shirt) +
        arm('r', [112, 78], 'shake', '<g class="tamb"><circle cx="112" cy="70" r="13" fill="#ffd24a" stroke="#c98a1a" stroke-width="2"/><circle cx="112" cy="70" r="6" fill="#ffefb0" stroke="#c98a1a" stroke-width="1.2"/>' +
          '<circle cx="112" cy="57" r="2.4" fill="#fff"/><circle cx="124" cy="70" r="2.4" fill="#fff"/><circle cx="100" cy="70" r="2.4" fill="#fff"/><circle cx="112" cy="83" r="2.4" fill="#fff"/></g>', fur, shirt);
      front = note(20, 44, '#7fd6ff', 0.5);
    } else {   // dance
      arms = arm('l', [26, 76], 'flapL', '', fur, shirt) + arm('r', [114, 76], 'flapR', '', fur, shirt);
      front = note(122, 36, '#ff6b9a', 0.4) + note(16, 40, '#ffd24a', 1.3);
    }

    const legs = '<g class="legs"><ellipse cx="55" cy="154" rx="12" ry="7.5" fill="' + (k.dark || '#6b4423') + '"/><ellipse cx="85" cy="154" rx="12" ry="7.5" fill="' + (k.dark || '#6b4423') + '"/></g>';
    const tail = o.kind === 'cat' ? '<path d="M96 134Q124 128 118 100" fill="none" stroke="' + fur + '" stroke-width="9" stroke-linecap="round"/>' :
                 o.kind === 'bunny' ? '<circle cx="100" cy="140" r="8" fill="#ffffff"/>' : '';
    const torso = '<ellipse cx="70" cy="122" rx="28" ry="32" fill="' + shirt + '"/><ellipse cx="70" cy="138" rx="20" ry="14" fill="rgba(255,255,255,.22)"/>' +
      '<path d="M58 100Q70 108 82 100" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="2.4" stroke-linecap="round"/>' +
      '<circle cx="70" cy="118" r="4.4" fill="' + o.hat[1] + '"/><circle cx="70" cy="130" r="3.4" fill="' + o.hat[1] + '"/>';
    const head = '<g class="head" style="transform-origin:70px 92px">' + ears(k) +
      '<circle cx="70" cy="62" r="35" fill="' + fur + '"/>' + face(k, o.kind, mouth) + hat(id, o.hat[0], o.hat[1]) + '</g>';

    return '<div class="crit crit-' + o.role + '" style="--ci:' + o.delay + 's;--bt:' + o.tempo + 's">' +
      '<svg viewBox="-4 -22 148 192" role="img" aria-label="A cartoon ' + o.kind + ' in a birthday cap, ' + ({ singer: 'singing', drummer: 'playing the drum', guitar: 'playing the guitar', tambourine: 'shaking a tambourine', dance: 'dancing' })[o.role] + '">' +
      '<ellipse cx="70" cy="160" rx="38" ry="6" fill="rgba(0,0,0,.35)"/>' +
      tail + legs + behind + torso + head + front + arms +
      '</svg></div>';
  }

  /** The two groups of performers: left and right of the cake. */
  function cheer(side) {
    const L = [
      { role: 'singer',     kind: 'cat',   shirt: '#e0558a', hat: ['#ff6fa5', '#fff1a8'], delay: 0.2, tempo: 0.62 },
      { role: 'drummer',    kind: 'bear',  shirt: '#3d8fd1', hat: ['#ffd24a', '#ff5f8a'], delay: 0.5, tempo: 0.5 },
      { role: 'dance',      kind: 'bunny', shirt: '#7a5bd0', hat: ['#5fd3c8', '#fff1a8'], delay: 0.8, tempo: 0.46 }
    ];
    const R = [
      { role: 'dance',      kind: 'panda', shirt: '#e8704a', hat: ['#8f74d6', '#ffd24a'], delay: 0.35, tempo: 0.52 },
      { role: 'guitar',     kind: 'cat',   shirt: '#2fa675', hat: ['#ff8a5f', '#fff1a8'], delay: 0.65, tempo: 0.7 },
      { role: 'tambourine', kind: 'bunny', shirt: '#d9b13a', hat: ['#ff6fa5', '#7fd6ff'], delay: 0.95, tempo: 0.48 }
    ];
    return '<div class="cheer ' + side + '" aria-hidden="false">' + (side === 'left' ? L : R).map(critter).join('') + '</div>';
  }

  App.Critters = { cheer: cheer };
})(window.App = window.App || {});
