// 계란이의 모험 v2 — 그림: 계란이(스킨·무늬·모자·표정), 병아리, 장소 배경
// 모든 그림은 SVG 문자열로 만든다. 선 색은 CSS(.ink, .ln, .face)에서 테마에 맞춰 칠한다.
window.Art = (() => {
  'use strict';

  let uid = 0;
  const VIEW = '-12 -28 144 172';
  const EGG = 'M60 6 C90 6 112 56 112 88 C112 118 89 136 60 136 C31 136 8 118 8 88 C8 56 30 6 60 6 Z';
  const HALF_SHELL = 'M12 92 L24 82 L36 95 L48 82 L60 95 L72 82 L84 95 L96 82 L108 92 C110 120 88 136 60 136 C32 136 10 120 12 92 Z';
  const CRACKS = [
    'M31 46 L39 56 L33 63 L41 73',
    'M91 54 L83 63 L90 70 L82 82',
    'M60 8 L55 21 L63 27 L57 39',
  ];
  const FACES = {
    calm: '<circle cx="45" cy="84" r="4"/><circle cx="75" cy="84" r="4"/><path class="ln" d="M52 98 Q60 104 68 98"/>',
    happy: '<path class="ln" d="M39 86 Q45 78 51 86 M69 86 Q75 78 81 86 M50 97 Q60 108 70 97"/>',
    worried: '<circle cx="45" cy="86" r="4"/><circle cx="75" cy="86" r="4"/><path class="ln" d="M38 76 L50 72 M82 76 L70 72 M52 102 Q56 98 60 102 Q64 106 68 102"/>',
    scared: '<circle class="eye-w" cx="45" cy="84" r="7"/><circle class="eye-w" cx="75" cy="84" r="7"/><circle cx="45" cy="85" r="3"/><circle cx="75" cy="85" r="3"/><ellipse cx="60" cy="103" rx="4" ry="5"/>',
    brave: '<circle cx="45" cy="86" r="4"/><circle cx="75" cy="86" r="4"/><path class="ln" d="M37 74 L51 79 M83 74 L69 79 M51 99 Q60 104 69 99"/>',
    sleepy: '<path class="ln" d="M39 86 Q45 90 51 86 M69 86 Q75 90 81 86"/><circle cx="60" cy="102" r="3"/>',
    broken: '<path class="ln" d="M40 80 L50 90 M50 80 L40 90 M70 80 L80 90 M80 80 L70 90 M52 104 Q60 98 68 104"/>',
  };
  const BLUSH = '<ellipse cx="33" cy="96" rx="7" ry="4" fill="#f4a19b" opacity=".75"/><ellipse cx="87" cy="96" rx="7" ry="4" fill="#f4a19b" opacity=".75"/>';
  const SHADE =
    '<ellipse cx="40" cy="42" rx="12" ry="22" fill="#fff" opacity=".45" transform="rotate(24 40 42)"/>' +
    '<path d="M112 70 C116 112 92 140 52 138 C88 128 106 104 104 66 Z" fill="#000" opacity=".07"/>';

  const dots = (list, color, op) =>
    list.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" opacity="${op}"/>`).join('');
  const PATTERNS = {
    speckle: () => dots([[30, 40, 3], [48, 26, 2.5], [74, 30, 3], [92, 48, 2.5], [22, 70, 2.5], [97, 76, 3], [38, 116, 3], [82, 118, 2.5], [62, 126, 2], [102, 100, 2], [18, 98, 2], [64, 16, 2], [56, 58, 2]], '#8c6a40', 0.6),
    spots: () => dots([[34, 40, 7], [82, 36, 5], [96, 92, 8], [24, 100, 6], [62, 126, 5]], '#7a4520', 0.35),
    dino: () => dots([[36, 36, 8], [80, 28, 6], [98, 80, 9], [22, 84, 7], [56, 122, 8], [92, 120, 5], [62, 60, 4]], '#5d8a3d', 0.75),
    easter:
      () => '<path d="M-4 62 L12 54 L28 62 L44 54 L60 62 L76 54 L92 62 L108 54 L124 62" stroke="#e76f9a" stroke-width="5" fill="none"/>' +
        '<path d="M-4 116 L12 108 L28 116 L44 108 L60 116 L76 108 L92 116 L108 108 L124 116" stroke="#6fa8e0" stroke-width="5" fill="none"/>' +
        dots([[30, 34, 4], [60, 26, 4], [90, 36, 4]], '#ffffff', 0.95) + dots([[30, 34, 1.6], [60, 26, 1.6], [90, 36, 1.6]], '#f2a900', 1),
    sauce:
      () => '<path d="M0 0 H120 V44 C104 52 96 40 84 46 C74 52 66 62 62 48 C56 40 44 52 34 44 C22 36 14 50 0 42 Z" fill="#d8402c" opacity=".85"/>' +
        '<path d="M66 50 C68 60 64 64 62 58 Z M28 44 C30 54 26 58 24 52 Z" fill="#d8402c" opacity=".85"/>',
    bandage:
      () => '<g transform="rotate(-32 78 52)"><rect x="56" y="45" width="44" height="15" rx="7" fill="#f2c79a" stroke="#3b2f2a" stroke-width="2"/>' +
        '<rect x="71" y="45" width="14" height="15" fill="#e9b886"/>' + dots([[75, 50, 1.2], [81, 50, 1.2], [75, 55, 1.2], [81, 55, 1.2]], '#3b2f2a', 0.7) + '</g>',
    shine:
      () => '<path d="M88 26 l3 9 l9 3 l-9 3 l-3 9 l-3 -9 l-9 -3 l9 -3 z" fill="#fff" opacity=".95"/>' +
        '<path d="M28 100 l2 6 l6 2 l-6 2 l-2 6 l-2 -6 l-6 -2 l6 -2 z" fill="#fff" opacity=".85"/>' +
        '<ellipse cx="78" cy="110" rx="18" ry="8" fill="#e0a800" opacity=".35"/>',
  };

  // 모자는 계란 꼭대기(y=6)에 맞춰 그렸다. 병아리 머리에는 아래로 옮겨 씌운다.
  const HATS = {
    crown:
      '<path class="ink" d="M34 16 C30 -18 90 -18 86 16 Z" fill="#f7b9a1"/>' +
      '<path class="ln thin" d="M60 15 L60 -10 M60 15 L45 -6 M60 15 L75 -6 M60 15 L38 4 M60 15 L82 4"/>' +
      '<circle class="ink" cx="60" cy="-14" r="5" fill="#fff4d6"/>',
    beret:
      '<ellipse class="ink" cx="58" cy="8" rx="36" ry="11" fill="#c8413a" transform="rotate(-8 58 8)"/>' +
      '<path class="ln" d="M58 -3 L61 -11"/>',
    party:
      '<path class="ink" d="M60 -24 L80 12 L40 12 Z" fill="#7b55b8"/>' +
      '<path d="M50 -6 H70 M45 4 H75" stroke="#ffd34d" stroke-width="4"/>' +
      '<circle class="ink" cx="60" cy="-26" r="5" fill="#ffd34d"/>',
    shell:
      '<path class="ink" d="M28 18 C30 -12 90 -12 92 18 L84 10 L76 18 L68 10 L60 18 L52 10 L44 18 L36 10 Z" fill="#fff6e6"/>',
  };

  const TUFT = '<path class="ln" d="M54 38 Q56 24 62 32 Q66 22 70 36"/>';

  function shellLayer(skin, path) {
    const id = 'egg-clip-' + (uid += 1);
    const pattern = skin.pattern && PATTERNS[skin.pattern] ? PATTERNS[skin.pattern]() : '';
    return `<defs><clipPath id="${id}"><path d="${path}"/></clipPath></defs>` +
      `<path d="${path}" fill="${skin.shell}"/>` +
      `<g clip-path="url(#${id})">${pattern}${SHADE}</g>` +
      `<path class="ink" d="${path}" fill="none"/>`;
  }

  // 계란이: mood 표정, cracks 금 개수, hat 모자(없으면 스킨 모자), label 대체 텍스트
  function egg(skin, o = {}) {
    const mood = FACES[o.mood] ? o.mood : 'calm';
    const n = mood === 'broken' ? CRACKS.length : Math.min(o.cracks || 0, CRACKS.length);
    const hat = o.hat || skin.hat;
    return `<svg viewBox="${VIEW}" role="img" aria-label="${o.label || '계란이'}">` +
      shellLayer(skin, EGG) +
      CRACKS.slice(0, n).map((d) => `<path class="ln crack" d="${d}"/>`).join('') +
      `<g class="face">${FACES[mood]}</g>${BLUSH}` +
      (hat && HATS[hat] ? HATS[hat] : '') +
      '</svg>';
  }

  // 껍질을 깨고 나온 병아리. 아래 껍질 조각은 스킨 색과 무늬를 따른다.
  function chick(skin, o = {}) {
    const hat = o.hat || skin.hat;
    return `<svg viewBox="${VIEW}" role="img" aria-label="${o.label || '병아리가 된 계란이'}">` +
      (hat && HATS[hat] ? '' : TUFT) +
      '<circle class="ink" cx="60" cy="72" r="36" fill="#ffd84d"/>' +
      '<g class="face"><circle cx="48" cy="66" r="4"/><circle cx="72" cy="66" r="4"/></g>' +
      '<path class="ink" d="M53 76 L67 76 L60 86 Z" fill="#f08a24"/>' +
      '<ellipse cx="36" cy="80" rx="6" ry="3.5" fill="#f4a19b" opacity=".8"/><ellipse cx="84" cy="80" rx="6" ry="3.5" fill="#f4a19b" opacity=".8"/>' +
      shellLayer(skin, HALF_SHELL) +
      (hat && HATS[hat] ? `<g transform="translate(0 30)">${HATS[hat]}</g>` : '') +
      '</svg>';
  }

  // ---------- 장소 배경 (400×220, 가운데 아래는 계란이 자리라 비워 둔다) ----------
  const R = (x, y, w, h, f, more = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}" ${more}/>`;
  const C = (x, y, r, f, more = '') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" ${more}/>`;
  const E = (x, y, rx, ry, f, more = '') => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${f}" ${more}/>`;
  const P = (d, f, more = '') => `<path d="${d}" fill="${f}" ${more}/>`;
  const L = (d, s, w = 2, more = '') => `<path d="${d}" fill="none" stroke="${s}" stroke-width="${w}" stroke-linecap="round" ${more}/>`;
  const each = (n, f) => Array.from({ length: n }, (_, i) => f(i)).join('');
  const SKY = (f) => R(0, 0, 400, 220, f);
  const SUN = C(338, 46, 24, '#ffd34d') + E(90, 40, 34, 12, '#fff', 'opacity=".8"') + E(130, 32, 24, 10, '#fff', 'opacity=".8"');

  const SCENES = {
    fridge: () => SKY('#d7edf5') + E(200, -10, 260, 90, '#fff', 'opacity=".75"') +
      R(40, 26, 36, 52, '#ffffff') + P('M40 26 L58 12 L76 26 Z', '#e9f2f6') + R(46, 44, 24, 10, '#6fa8e0') +
      R(300, 40, 22, 38, '#e05a47', 'rx="6"') + R(304, 32, 14, 10, '#f2f2f2', 'rx="2"') + R(338, 46, 38, 32, '#f6c85f', 'rx="8" opacity=".9"') +
      R(0, 78, 400, 8, '#b5d8e5') + R(0, 78, 400, 2, '#fff') +
      R(26, 112, 78, 8, '#7cc4a0', 'rx="3"') + R(30, 120, 70, 30, '#c9e7d8', 'rx="6"') + R(318, 124, 62, 26, '#fdfdfd', 'rx="4"') +
      R(0, 150, 400, 8, '#b5d8e5') + R(0, 150, 400, 2, '#fff') +
      R(0, 196, 400, 24, '#ece2cf') +
      [20, 60, 100, 140, 260, 300, 340, 380].map((x) => E(x, 192, 15, 18, '#fff6e6', 'stroke="#d9cdb6" stroke-width="2"')).join(''),

    kitchen: () => SKY('#f3ece0') +
      each(15, (i) => L(`M${i * 28} 0 V165`, '#e3d7c4', 1.5)) + each(6, (i) => L(`M0 ${i * 28} H400`, '#e3d7c4', 1.5)) +
      R(330, 66, 62, 100, '#b98a5e', 'rx="4"') + R(342, 78, 38, 34, '#fff3c4', 'rx="3"') + C(380, 120, 3, '#5b3b22') +
      R(0, 165, 400, 55, '#d8c2a2') + each(8, (i) => L(`M${i * 56 - 20} 220 L${i * 56 + 10} 165`, '#c9b08d', 1.5)) +
      R(10, 96, 150, 10, '#9a6b47', 'rx="3"') + R(24, 106, 10, 64, '#8a5c3b') + R(136, 106, 10, 64, '#8a5c3b'),

    room: () => SKY('#f3e4c4') +
      R(40, 28, 96, 72, '#fffaf0', 'stroke="#c9b28a" stroke-width="4"') + L('M88 28 V100 M40 52 H136 M40 76 H136', '#d9c6a0', 2) +
      R(296, 46, 76, 54, '#3c3c3c', 'rx="6"') + R(304, 54, 60, 38, '#6d8fae', 'rx="3"') + R(318, 100, 32, 8, '#3c3c3c') +
      R(0, 150, 400, 70, '#e2b25c') + each(5, (i) => L(`M0 ${160 + i * 14} H400`, '#d29f48', 1.5)) +
      P('M236 132 Q240 118 262 118 H400 V188 H250 Q236 188 236 172 Z', '#e86e6e') +
      each(6, (i) => C(262 + i * 24, 140 + (i % 2) * 22, 6, '#f7b0a8')),

    basket: () => SKY('#c99757') +
      each(14, (i) => R(0, i * 16, 400, 8, '#b7843f', 'opacity=".6"')) + each(20, (i) => L(`M${i * 20 + 10} 0 V220`, '#a87536', 2, 'opacity=".5"')) +
      [24, 54, 84, 318, 348].map((x) => R(x, -10, 16, 170, '#6fbf5a', 'rx="8"') + R(x, 150, 16, 70, '#f4f4ea', 'rx="6"')).join('') +
      R(250, 120, 64, 70, '#e6eef2', 'rx="10" opacity=".92"') + L('M262 150 Q282 140 302 150 M262 166 Q282 156 302 166', '#8fa6b4', 3),

    market: () => SKY('#cfe8f5') + SUN +
      [0, 140, 280].map((x, k) =>
        each(6, (i) => P(`M${x + i * 20} 60 h20 l-10 22 Z`, i % 2 ? '#fff8ef' : ['#e8584a', '#3f8fd0', '#2f9a62'][k])) +
        R(x + 6, 82, 108, 70, '#b07b4f') + R(x + 12, 90, 96, 40, '#d79a63') +
        each(4, (i) => C(x + 26 + i * 22, 102, 9, k === 1 ? '#9fd27f' : '#f4a23a'))).join('') +
      R(0, 168, 400, 52, '#d9cdb8'),

    yard: () => SKY('#bfe3f5') + SUN +
      R(0, 100, 400, 12, '#6f7b86') + R(0, 112, 400, 40, '#d8c9ad') + each(10, (i) => L(`M${i * 40} 112 V152`, '#c7b693', 2)) +
      R(0, 150, 400, 70, '#e9d6ae') +
      [[44, 150, 22], [86, 156, 18], [124, 160, 14]].map(([x, y, r]) => E(x, y, r, r * 1.1, '#7a4b2a') + E(x, y - r, r * 0.8, 5, '#5c3720')).join('') +
      R(318, 118, 66, 50, '#c98a52') + P('M308 120 L351 88 L394 120 Z', '#8b4f2a') + P('M338 168 V146 A13 13 0 0 1 364 146 V168 Z', '#3b2f2a'),

    alley: () => SKY('#d4ecf7') +
      R(0, 56, 124, 130, '#e7ded0') + R(276, 56, 124, 130, '#e2d7c6') + R(0, 50, 124, 8, '#9aa5ad') + R(276, 50, 124, 8, '#9aa5ad') +
      each(7, (i) => C(16 + i * 16, 74 + (i % 3) * 12, 5, '#8b6fd1') + C(288 + i * 15, 80 + (i % 2) * 14, 5, '#8b6fd1')) +
      L('M8 70 Q60 96 120 76 M282 84 Q330 104 396 82', '#7cb86a', 3) +
      L('M168 104 V150 M152 116 H184', '#8b5a3c', 4) + E(168, 100, 16, 5, '#e2bd5a') + C(168, 92, 8, '#f2e2c4') +
      R(0, 186, 400, 34, '#cfc6b6') + R(334, 76, 6, 110, '#6b7780') + C(337, 70, 16, '#2f6f9a') + R(329, 66, 16, 8, '#fff', 'rx="2"'),

    stream: () => SKY('#cfe9f6') + SUN + R(0, 92, 400, 38, '#a6d67c') +
      R(0, 126, 400, 58, '#79c0e3') + each(6, (i) => L(`M${i * 70 - 10} ${140 + (i % 2) * 18} q15 -8 30 0 t30 0`, '#fff', 2.5, 'opacity=".6"')) +
      [[70, 150], [140, 164], [262, 158], [330, 146]].map(([x, y]) => E(x, y, 22, 9, '#b3b8bc') + E(x - 4, y - 3, 12, 4, '#cfd3d6')).join('') +
      R(0, 182, 400, 38, '#9bcf74') + P('M30 196 C40 176 70 178 74 192 C60 206 40 206 30 196 Z', '#7fb24f') + L('M30 196 L74 192', '#5f8f37', 2),

    field: () => SKY('#cdeaf7') + SUN + E(120, 150, 240, 70, '#a6d67c') + E(330, 170, 200, 60, '#8cc765') +
      R(60, 60, 8, 110, '#8b5a3c') + E(64, 64, 22, 50, '#6aa84f') +
      R(282, 94, 98, 76, '#f2e2c4') + P('M272 96 L331 54 L390 96 Z', '#c8413a') + R(316, 124, 28, 46, '#8b5a3c') +
      E(30, 196, 46, 26, '#5e9c46') + C(20, 190, 3, '#ffd34d') + C(32, 190, 3, '#ffd34d') + R(0, 200, 400, 20, '#7fb85c'),

    storm: () => SKY('#26344a') + E(80, 20, 120, 34, '#3a4a62') + E(300, 14, 140, 36, '#344458') +
      P('M232 0 L214 46 L230 46 L210 92 L250 38 L232 38 L246 0 Z', '#ffe27a', 'opacity=".9"') +
      each(28, (i) => L(`M${(i * 53) % 400} ${(i * 37) % 120} l-8 22`, '#9fb6d1', 2, 'opacity=".55"')) +
      E(262, 120, 84, 56, '#f3efe6') + C(332, 80, 24, '#f3efe6') + P('M322 58 q6 -14 12 -2 q6 -12 10 4 Z', '#d9442f') +
      P('M354 80 L368 86 L354 92 Z', '#f2a900') + C(338, 76, 3, '#26344a') +
      R(0, 172, 400, 48, '#5b4630') + E(200, 186, 150, 26, '#c99a4f') +
      each(12, (i) => L(`M${70 + i * 22} ${178 + (i % 3) * 6} l18 ${i % 2 ? 6 : -6}`, '#e2bd73', 3)),
  };

  function scene(bg) {
    const draw = SCENES[bg] || SCENES.fridge;
    return `<svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${draw()}</svg>`;
  }

  return { egg, chick, scene };
})();
