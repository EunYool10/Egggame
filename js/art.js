// 계란이의 모험 v3 — 그림: 계란이(스킨·무늬·모자·표정), 병아리, 엔딩 그림(소품), 잠긴 엔딩, 장소 배경
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
  const esc = (s) => String(s).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);

  const dots = (list, color, op) =>
    list.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" opacity="${op}"/>`).join('');
  const spark = (x, y, r, color, op = 1) =>
    `<path d="M${x} ${y - r} L${x + r * 0.3} ${y - r * 0.3} L${x + r} ${y} L${x + r * 0.3} ${y + r * 0.3} L${x} ${y + r} L${x - r * 0.3} ${y + r * 0.3} L${x - r} ${y} L${x - r * 0.3} ${y - r * 0.3} Z" fill="${color}" opacity="${op}"/>`;

  // 껍질 무늬 (껍질 모양으로 잘라서 그린다)
  const PATTERNS = {
    speckle: () => dots([[30, 40, 3], [48, 26, 2.5], [74, 30, 3], [92, 48, 2.5], [22, 70, 2.5], [97, 76, 3], [38, 116, 3], [82, 118, 2.5], [62, 126, 2], [102, 100, 2], [18, 98, 2], [64, 16, 2], [56, 58, 2]], '#8c6a40', 0.6),
    spots: () => dots([[34, 40, 7], [82, 36, 5], [96, 92, 8], [24, 100, 6], [62, 126, 5]], '#7a4520', 0.35),
    dino: () => dots([[36, 36, 8], [80, 28, 6], [98, 80, 9], [22, 84, 7], [56, 122, 8], [92, 120, 5], [62, 60, 4]], '#5d8a3d', 0.75),
    easter:
      () => '<path d="M-4 62 L12 54 L28 62 L44 54 L60 62 L76 54 L92 62 L108 54 L124 62" stroke="#e76f9a" stroke-width="5" fill="none"/>' +
        '<path d="M-4 116 L12 108 L28 116 L44 108 L60 116 L76 108 L92 116 L108 108 L124 116" stroke="#6fa8e0" stroke-width="5" fill="none"/>' +
        dots([[30, 34, 4], [60, 26, 4], [90, 36, 4]], '#ffffff', 0.95) + dots([[30, 34, 1.6], [60, 26, 1.6], [90, 36, 1.6]], '#f2a900', 1),
    // 양념 자국: 껍질을 반으로 가르지 않게, 군데군데 묻고 흘러내린 모양
    sauce:
      () => '<path d="M14 52 C20 38 40 34 48 44 C54 52 46 58 48 66 C50 74 42 76 41 68 C40 60 32 62 26 60 C18 58 11 60 14 52 Z" fill="#d8402c" opacity=".85"/>' +
        '<path d="M74 22 C84 16 98 26 96 38 C95 46 92 52 91 58 C90 64 85 63 85 57 C85 50 76 46 74 38 C72 32 70 26 74 22 Z" fill="#d8402c" opacity=".85"/>' +
        dots([[56, 30, 3], [32, 76, 2.5], [100, 66, 2.5], [88, 122, 3.5], [24, 118, 2]], '#d8402c', 0.8),
    bandage:
      () => '<g transform="rotate(-32 78 52)"><rect x="56" y="45" width="44" height="15" rx="7" fill="#f2c79a" stroke="#3b2f2a" stroke-width="2"/>' +
        '<rect x="71" y="45" width="14" height="15" fill="#e9b886"/>' + dots([[75, 50, 1.2], [81, 50, 1.2], [75, 55, 1.2], [81, 55, 1.2]], '#3b2f2a', 0.7) + '</g>',
    shine:
      () => spark(88, 36, 10, '#fff', 0.95) + spark(28, 108, 7, '#fff', 0.85) +
        '<ellipse cx="78" cy="110" rx="18" ry="8" fill="#000" opacity=".08"/>',
    stamp:
      () => '<g transform="rotate(-14 84 44)"><circle cx="84" cy="44" r="15" fill="none" stroke="#d8402c" stroke-width="3" opacity=".85"/>' +
        '<text x="84" y="50" text-anchor="middle" font-size="16" font-weight="700" font-family="sans-serif" fill="#d8402c" opacity=".85">1+</text></g>',
    wave:
      () => [30, 46, 122].map((y) => `<path d="M-4 ${y} q8 -6 16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0" stroke="#5e554d" stroke-width="2.5" fill="none" opacity=".55"/>`).join('') +
        '<path d="M8 60 H112 M8 110 H112" stroke="#5e554d" stroke-width="2" opacity=".4"/>',
    pearl:
      () => '<ellipse cx="82" cy="46" rx="30" ry="38" fill="#ffc9ec" opacity=".45"/><ellipse cx="32" cy="98" rx="28" ry="30" fill="#bfe1ff" opacity=".55"/>' +
        '<ellipse cx="72" cy="122" rx="32" ry="14" fill="#fff1a8" opacity=".5"/>' + spark(86, 30, 8, '#fff', 0.95),
    crater: () => [[34, 40, 8], [84, 34, 6], [96, 92, 9], [24, 104, 6], [62, 124, 7], [58, 58, 4]].map(([x, y, r]) =>
      `<circle cx="${x}" cy="${y}" r="${r}" fill="#a9acb5" opacity=".55"/><circle cx="${x - r * 0.25}" cy="${y - r * 0.25}" r="${r * 0.7}" fill="#c6c9d0" opacity=".7"/>`).join(''),
    galaxy:
      () => '<path d="M-6 120 C30 80 70 110 126 34 L126 64 C80 120 40 104 -6 146 Z" fill="#6d55c9" opacity=".45"/>' +
        dots([[22, 40, 1.8], [44, 24, 1.4], [94, 54, 1.6], [30, 70, 1.2], [100, 100, 1.8], [70, 122, 1.4], [16, 92, 1.4]], '#fff', 0.95) +
        spark(80, 30, 7, '#ffe27a', 1),
    rainbow: () => ['#ff8a8a', '#ffb86b', '#ffe27a', '#9be08a', '#86c5ff', '#c3a2ff'].map((c, i) =>
      `<rect x="-4" y="${i * 23}" width="128" height="23" fill="${c}" opacity=".7"/>`).join(''),
    // 튀김옷: 울퉁불퉁한 바삭 무늬
    crispy: () => dots([[24, 40, 5], [46, 26, 4], [70, 34, 5], [92, 52, 4.5], [30, 66, 4], [56, 58, 5], [84, 78, 5], [18, 92, 4.5], [44, 88, 4], [66, 104, 5], [96, 104, 4], [32, 118, 4.5], [58, 126, 4], [84, 124, 4.5]], '#b8691c', 0.5) +
      dots([[34, 46, 3], [60, 40, 2.5], [80, 64, 3], [22, 80, 2.5], [50, 74, 3], [74, 92, 2.5], [40, 104, 3], [92, 90, 2.5], [68, 118, 2.5]], '#f6c66a', 0.9),
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
    cap:
      '<path class="ink" d="M84 14 L112 8 L114 17 L86 22 Z" fill="#2f6fa8"/>' +
      '<path class="ink" d="M30 22 C30 -6 90 -6 90 22 Z" fill="#3f8fd0"/>' +
      '<path class="ln thin" d="M60 -2 V22"/><circle class="ink" cx="60" cy="-2" r="3" fill="#2f6fa8"/>',
    goldcrown:
      '<path class="ink" d="M37 8 V-12 H43 V8 Z M57 8 V-20 H63 V8 Z M77 8 V-12 H83 V8 Z" fill="#f2c230"/>' +
      '<path class="ln thin" d="M37 -2 H31 V-8 M43 -6 H49 V-12 M57 -8 H51 V-14 M63 -12 H69 V-18 M77 -2 H71 V-8 M83 -6 H89 V-12"/>' +
      '<path class="ink" d="M28 21 L92 21 L90 7 L30 7 Z" fill="#f2c230"/>' +
      dots([[36, 14, 2], [48, 14, 2], [60, 14, 2], [72, 14, 2], [84, 14, 2]], '#a87100', 0.9) +
      '<path class="ink" d="M33 21 c-4 4 -4 10 2 10 M87 21 c4 4 4 10 -2 10" fill="#3fae7a"/>',
    antenna:
      '<path class="ln" d="M46 12 L36 -14 M74 12 L84 -14"/>' +
      '<circle class="ink" cx="35" cy="-16" r="5" fill="#e05a47"/><circle class="ink" cx="85" cy="-16" r="5" fill="#6fa8e0"/>' +
      '<rect class="ink" x="44" y="6" width="32" height="8" rx="4" fill="#9aa5ad"/>',
    flower:
      [[28, 22], [40, 9], [60, 4], [80, 9], [92, 22]].map(([x, y], i) =>
        `<circle class="ink" cx="${x}" cy="${y}" r="7" fill="${['#f7a8c4', '#ffd34d', '#f7a8c4', '#b9a2f0', '#f7a8c4'][i]}"/><circle cx="${x}" cy="${y}" r="2.4" fill="#e0822f"/>`).join(''),
    spike:
      '<path class="ink" d="M26 20 C28 0 44 -14 60 -26 C76 -14 92 0 94 20 L86 12 L78 20 L70 12 L62 20 L54 12 L46 20 L38 12 L30 20 Z" fill="#fff6e6"/>' +
      '<path class="ln thin" d="M60 -26 V-34"/><circle class="ink" cx="60" cy="-35" r="3" fill="#d9442f"/>',
    astro:
      '<path class="ink" d="M24 22 C24 -18 96 -18 96 22 L88 14 L80 22 L72 14 L64 22 L56 14 L48 22 L40 14 L32 22 Z" fill="#fff6e6"/>' +
      '<path d="M38 2 C42 -6 50 -10 58 -11" stroke="#fff" stroke-width="4" fill="none" opacity=".8"/>' +
      '<path class="ln thin" d="M74 -10 L80 -24"/><circle class="ink" cx="81" cy="-26" r="4" fill="#ffd34d"/>',
  };

  // 엔딩 그림 소품: back은 몸 뒤에, front는 몸 앞에 그린다.
  const smallChick = (x, y) =>
    `<circle class="ink" cx="${x}" cy="${y}" r="15" fill="#ffd84d"/>` +
    `<g class="face"><circle cx="${x - 5}" cy="${y - 3}" r="2"/><circle cx="${x + 5}" cy="${y - 3}" r="2"/></g>` +
    `<path class="ink" d="M${x - 4} ${y + 2} L${x + 4} ${y + 2} L${x} ${y + 7} Z" fill="#f08a24"/>`;
  const NEST = '<path class="ink" d="M2 116 C8 148 112 148 118 116 C96 128 24 128 2 116 Z" fill="#c99a4f"/>' +
    '<path d="M12 124 L28 132 M38 132 L56 126 M64 134 L82 127 M90 131 L108 122" stroke="#8a6a2e" stroke-width="2.4" stroke-linecap="round"/>';
  const PROPS = {
    nest: { front: NEST },
    twins: { front: NEST + smallChick(-2, 118) + smallChick(122, 118) },
    confetti: {
      front: [[-4, 10, '#e76f9a'], [8, 50, '#6fa8e0'], [122, 20, '#ffd34d'], [114, 60, '#9be08a'], [-6, 90, '#ffd34d'], [126, 96, '#e76f9a'], [20, -8, '#9be08a'], [100, -12, '#6fa8e0']]
        .map(([x, y, c], i) => `<rect x="${x}" y="${y}" width="9" height="5" rx="1.5" fill="${c}" transform="rotate(${i * 37} ${x + 4} ${y + 2})"/>`).join(''),
    },
    case: {
      front: '<rect x="-6" y="-20" width="132" height="152" rx="8" fill="#bfe3f5" opacity=".2" stroke="#8fb6c9" stroke-width="2.5"/>' +
        '<path d="M6 -6 L22 -14 M6 8 L34 -12" stroke="#fff" stroke-width="3" opacity=".7"/>' +
        '<rect class="ink" x="-10" y="130" width="140" height="13" rx="3" fill="#8b5a3c"/>',
    },
    cushion: {
      back: '<path class="ink" d="M-6 128 C-6 110 126 110 126 128 C126 146 -6 146 -6 128 Z" fill="#c8413a"/>',
      front: '<circle class="ink" cx="-6" cy="128" r="4" fill="#ffd34d"/><circle class="ink" cx="126" cy="128" r="4" fill="#ffd34d"/>',
    },
    pot: {
      front: '<path class="ink" d="M2 98 H118 L112 136 C110 142 104 144 98 144 H22 C16 144 10 142 8 136 Z" fill="#6b4a32"/>' +
        '<rect class="ink" x="-6" y="90" width="132" height="12" rx="6" fill="#7d5a3e"/>' +
        '<path class="ink" d="M-6 108 C-16 108 -16 120 -4 120 M126 108 C136 108 136 120 124 120" fill="none"/>',
    },
    plate: { back: '<ellipse class="ink" cx="60" cy="132" rx="70" ry="12" fill="#f4f4f0"/><ellipse cx="60" cy="131" rx="52" ry="7" fill="none" stroke="#d9d9d2" stroke-width="2"/>' },
    sauce: {
      back: '<ellipse class="ink" cx="60" cy="133" rx="70" ry="12" fill="#d8402c"/>',
      front: '<rect class="ink" x="-8" y="118" width="30" height="12" rx="6" fill="#f6efe2" transform="rotate(-18 7 124)"/>' +
        '<rect class="ink" x="96" y="120" width="30" height="12" rx="6" fill="#f6efe2" transform="rotate(14 111 126)"/>' +
        '<path d="M30 140 l6 -4 M88 141 l5 -5" stroke="#4f9a5a" stroke-width="4" stroke-linecap="round"/>',
    },
    water: {
      front: '<path d="M-12 112 q12 -8 24 0 t24 0 t24 0 t24 0 t24 0 t24 0 V144 H-12 Z" fill="#79c0e3" opacity=".8"/>' +
        '<circle cx="-2" cy="88" r="5" fill="none" stroke="#fff" stroke-width="2"/><circle cx="118" cy="70" r="4" fill="none" stroke="#fff" stroke-width="2"/><circle cx="124" cy="96" r="3" fill="none" stroke="#fff" stroke-width="2"/>',
    },
    dirt: {
      front: '<path class="ink" d="M-10 144 C0 112 30 106 60 108 C90 106 120 112 130 144 Z" fill="#8a5a36"/>' +
        dots([[20, 132, 3], [94, 128, 2.5], [64, 138, 2]], '#5c3720', 0.8) +
        '<path d="M80 124 h16" stroke="#f5efe2" stroke-width="5" stroke-linecap="round"/>' + dots([[79, 121, 3], [79, 127, 3], [97, 121, 3], [97, 127, 3]], '#f5efe2', 1),
    },
    leaves: {
      front: [[-2, 128, '#6aa84f', -30], [16, 136, '#e2952f', 20], [96, 134, '#6aa84f', 40], [116, 126, '#c8413a', -10]]
        .map(([x, y, c, r]) => `<path class="ink" d="M${x - 10} ${y} Q${x} ${y - 10} ${x + 10} ${y} Q${x} ${y + 10} ${x - 10} ${y} Z" fill="${c}" transform="rotate(${r} ${x} ${y})"/>`).join(''),
    },
    fire: {
      back: '<path d="M2 142 C-4 120 12 110 10 92 C24 106 28 118 26 128 C30 114 38 104 36 88 C52 104 54 124 50 142 Z" fill="#f08a24"/>' +
        '<path d="M118 142 C124 120 108 110 110 92 C96 106 92 118 94 128 C90 114 82 104 84 88 C68 104 66 124 70 142 Z" fill="#f08a24"/>' +
        '<path d="M14 142 C10 128 20 120 20 110 C30 122 32 132 30 142 Z M106 142 C110 128 100 120 100 110 C90 122 88 132 90 142 Z" fill="#ffd34d"/>',
      front: '<rect class="ink" x="-6" y="134" width="132" height="10" rx="5" fill="#7a4b2a"/>',
    },
    shards: {
      back: '<ellipse cx="60" cy="138" rx="46" ry="7" fill="#ffc233" opacity=".9"/>',
      front: '<path class="ink" d="M-6 140 L6 126 L14 140 Z" fill="#fff6e6"/><path class="ink" d="M108 140 L118 122 L128 138 Z" fill="#fff6e6"/>' +
        '<path class="ink" d="M18 128 L26 120 L30 132 Z" fill="#fff6e6"/><path class="ink" d="M94 130 L102 124 L104 136 Z" fill="#fff6e6"/>',
    },
    tray: {
      front: '<path class="ink" d="M-10 144 V118 Q2 108 14 118 Q26 108 38 118 L38 124 H82 L82 118 Q94 108 106 118 Q118 108 130 118 V144 Z" fill="#d9d3c7"/>' +
        '<path d="M14 120 V144 M106 120 V144" stroke="#b8b0a2" stroke-width="2"/>',
    },
    clouds: {
      back: '<path d="M88 30 a14 14 0 0 1 26 -6 a12 12 0 0 1 18 14 H88 Z" fill="#fff" opacity=".9"/>',
      front: '<path d="M-12 144 V126 a16 16 0 0 1 28 -10 a20 20 0 0 1 36 4 a18 18 0 0 1 34 -2 a16 16 0 0 1 28 6 a14 14 0 0 1 18 8 V144 Z" fill="#fff" stroke="#c9dbe6" stroke-width="2"/>',
    },
    goldbox: {
      front: '<rect class="ink" x="2" y="104" width="116" height="40" rx="4" fill="#f2c230"/>' +
        '<path d="M2 116 H118" stroke="#a87100" stroke-width="2.5"/>' + dots([[20, 130, 4], [60, 130, 4], [100, 130, 4]], '#c8413a', 0.9),
    },
    waves: {
      front: '<path d="M-12 118 q12 -10 24 0 t24 0 t24 0 t24 0 t24 0 t24 0 V144 H-12 Z" fill="#3f8fd0"/>' +
        '<path d="M-12 118 q12 -10 24 0 t24 0 t24 0 t24 0 t24 0 t24 0" fill="none" stroke="#fff" stroke-width="3"/>',
    },
    stars: { front: spark(-2, 14, 9, '#ffe27a') + spark(122, 30, 7, '#ffffff') + spark(116, 112, 8, '#ffe27a') + spark(2, 100, 6, '#ffffff') },
    sparkle: { front: spark(4, 22, 9, '#ffc233') + spark(118, 40, 7, '#ffc233') + spark(112, 6, 5, '#ffc233') },
    zzz: { front: '<path d="M92 18 h12 l-12 12 h12 M110 -6 h9 l-9 9 h9" fill="none" stroke="#6fa8e0" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>' },
    snow: {
      front: [[2, 20], [118, 34], [-2, 72], [124, 84]].map(([x, y]) =>
        `<path d="M${x - 7} ${y} H${x + 7} M${x - 3.5} ${y - 6} L${x + 3.5} ${y + 6} M${x + 3.5} ${y - 6} L${x - 3.5} ${y + 6}" stroke="#86c5ff" stroke-width="2.4" stroke-linecap="round"/>`).join(''),
    },
    flowers: {
      front: [[2, 112], [118, 108], [10, 30]].map(([x, y]) =>
        [0, 72, 144, 216, 288].map((a) => `<circle cx="${x + 6 * Math.cos((a * Math.PI) / 180)}" cy="${y + 6 * Math.sin((a * Math.PI) / 180)}" r="4.5" fill="#f58cb4"/>`).join('') +
        `<circle cx="${x}" cy="${y}" r="3" fill="#ffd34d"/>`).join(''),
    },
    foxtail: {
      front: '<path class="ink" d="M-10 126 C-14 94 18 90 28 110 C38 128 82 134 100 120 C112 110 126 118 124 132 C112 148 20 150 -10 126 Z" fill="#e2702f"/>' +
        '<path d="M-10 126 C-13 110 -4 100 8 102 C2 112 0 120 -10 126 Z" fill="#fff6e6"/>',
    },
    paws: {
      front: [[-2, 1], [122, -1]].map(([x, dir]) => `<ellipse class="ink" cx="${x}" cy="112" rx="15" ry="22" fill="#f08a24"/>` +
        `<path d="M${x - 9 * dir} 100 l10 ${4} M${x - 10 * dir} 112 l11 2" stroke="#3b2f2a" stroke-width="3" stroke-linecap="round"/>` +
        dots([[x + 4 * dir, 92, 4], [x + 10 * dir, 100, 3.5]], '#fff4e6', 1)).join(''),
    },
    ring: {
      back: '<path d="M-10 84 A72 18 0 0 1 130 84" fill="none" stroke="#e9c46a" stroke-width="9" transform="rotate(-12 60 84)"/>',
      front: '<path d="M-10 84 A72 18 0 0 0 130 84" fill="none" stroke="#e9c46a" stroke-width="9" transform="rotate(-12 60 84)"/>' +
        '<path d="M-10 84 A72 18 0 0 0 130 84" fill="none" stroke="#b8923f" stroke-width="2" transform="rotate(-12 60 84)"/>',
    },
    legs: {
      back: '<path d="M30 118 L18 142 M48 130 L44 144 M72 130 L76 144 M90 118 L102 142" stroke="#6b7780" stroke-width="6" stroke-linecap="round"/>',
      front: '<rect class="ink" x="10" y="138" width="16" height="6" rx="3" fill="#9aa5ad"/><rect class="ink" x="94" y="138" width="16" height="6" rx="3" fill="#9aa5ad"/>',
    },
    salad: {
      front: '<path class="ink" d="M-12 144 C-10 120 6 112 14 124 C18 108 36 108 40 124 C46 110 62 112 64 126 C70 110 88 110 90 124 C96 110 116 112 118 124 C126 118 134 126 132 144 Z" fill="#7cc46a"/>' +
        '<circle class="ink" cx="104" cy="134" r="8" fill="#e05a47"/><circle class="ink" cx="16" cy="136" r="6" fill="#e05a47"/>',
    },
    bin: {
      front: '<path class="ink" d="M4 100 H116 L108 144 H12 Z" fill="#4f9a5a"/><rect class="ink" x="-2" y="92" width="124" height="12" rx="4" fill="#5fae6a"/>' +
        '<path d="M50 126 l10 -16 l10 16 Z" fill="none" stroke="#e7f5e9" stroke-width="3" stroke-linejoin="round"/>',
    },
    // 치킨 상자 (줄무늬 종이 상자)
    chickenbox: {
      front: '<path class="ink" d="M-8 108 H128 L118 144 H2 Z" fill="#d8402c"/>' +
        '<path d="M14 110 L18 144 M38 110 L40 144 M82 110 L80 144 M106 110 L102 144" stroke="#fff" stroke-width="6" opacity=".85"/>' +
        '<rect class="ink" x="-10" y="104" width="140" height="9" rx="3" fill="#fff6e6"/>' +
        '<ellipse class="ink" cx="60" cy="128" rx="25" ry="11" fill="#fff6e6"/>' +
        '<text x="60" y="133" text-anchor="middle" font-size="14" font-weight="700" font-family="sans-serif" fill="#d8402c">B*C</text>',
    },
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
  const hatOf = (hat, dy = 0) => (hat && HATS[hat] ? (dy ? `<g transform="translate(0 ${dy})">${HATS[hat]}</g>` : HATS[hat]) : '');
  const svg = (label, body) => `<svg viewBox="${VIEW}" role="img" aria-label="${esc(label)}">${body}</svg>`;

  function eggBody(skin, o = {}) {
    const mood = FACES[o.mood] ? o.mood : 'calm';
    const n = mood === 'broken' ? CRACKS.length : Math.min(o.cracks || 0, CRACKS.length);
    return shellLayer(skin, EGG) +
      CRACKS.slice(0, n).map((d) => `<path class="ln crack" d="${d}"/>`).join('') +
      `<g class="face">${FACES[mood]}</g>${BLUSH}` + hatOf(o.hat || skin.hat);
  }

  // 껍질을 깨고 나온 병아리. 아래 껍질 조각은 스킨 색과 무늬를 따른다.
  function chickBody(skin, hat) {
    return (hat && HATS[hat] ? '' : TUFT) +
      '<circle class="ink" cx="60" cy="72" r="36" fill="#ffd84d"/>' +
      '<g class="face"><circle cx="48" cy="66" r="4"/><circle cx="72" cy="66" r="4"/></g>' +
      '<path class="ink" d="M53 76 L67 76 L60 86 Z" fill="#f08a24"/>' +
      '<ellipse cx="36" cy="80" rx="6" ry="3.5" fill="#f4a19b" opacity=".8"/><ellipse cx="84" cy="80" rx="6" ry="3.5" fill="#f4a19b" opacity=".8"/>' +
      shellLayer(skin, HALF_SHELL) + hatOf(hat, 30);
  }

  // 요리가 된 계란이들
  const FOODS = {
    roll: () => '<rect class="ink" x="0" y="70" width="120" height="62" rx="28" fill="#ffd84d"/>' +
      '<path d="M28 74 C26 92 26 110 28 128 M48 72 C46 92 46 110 48 130" stroke="#f0b92a" stroke-width="3" fill="none"/>' +
      '<circle class="ink" cx="90" cy="101" r="29" fill="#ffe27a"/>' +
      '<path d="M90 101 m-4 0 a4 4 0 1 1 8 0 a9 9 0 1 1 -18 0 a14 14 0 1 1 28 0 a19 19 0 1 1 -38 0" stroke="#e8a91f" stroke-width="3" fill="none"/>' +
      '<g class="face"><circle cx="20" cy="96" r="3.5"/><circle cx="44" cy="96" r="3.5"/></g><path class="ln" d="M26 108 Q32 113 38 108"/>' +
      '<rect x="56" y="80" width="6" height="3" rx="1.5" fill="#4f9a5a"/><rect x="12" y="116" width="6" height="3" rx="1.5" fill="#4f9a5a"/>',
    fried: () => '<path d="M30 54 q4 -6 0 -12 M60 46 q4 -6 0 -12 M90 54 q4 -6 0 -12" stroke="#9aa5ad" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '<path class="ink" d="M10 112 C0 92 20 72 40 78 C52 62 82 64 92 80 C114 80 124 104 110 120 C104 138 70 140 56 134 C36 142 14 132 10 112 Z" fill="#fffdf6"/>' +
      '<circle class="ink" cx="60" cy="104" r="25" fill="#ffc233"/><ellipse cx="52" cy="94" rx="6" ry="4" fill="#fff" opacity=".6"/>' +
      '<g class="face"><circle cx="52" cy="104" r="3"/><circle cx="68" cy="104" r="3"/></g><path class="ln" d="M55 114 Q60 110 65 114"/>',
    ball: () => '<path d="M-6 40 H10 M-8 64 H6 M114 48 H128 M116 72 H130" stroke="#9aa5ad" stroke-width="3" stroke-linecap="round"/>' +
      '<circle class="ink" cx="60" cy="80" r="52" fill="#ffd84d"/><ellipse cx="40" cy="54" rx="14" ry="9" fill="#fff" opacity=".45"/>' +
      '<rect x="78" y="50" width="8" height="4" rx="2" fill="#4f9a5a"/><rect x="30" y="112" width="8" height="4" rx="2" fill="#e05a47"/><rect x="88" y="106" width="7" height="4" rx="2" fill="#4f9a5a"/>' +
      '<g class="face"><circle cx="46" cy="84" r="4"/><circle cx="74" cy="84" r="4"/></g><path class="ln" d="M52 96 Q60 104 68 96"/>' + BLUSH,
    halved: () => '<path class="ink" d="M8 100 C8 60 30 40 60 40 C90 40 112 60 112 100 C112 126 90 140 60 140 C30 140 8 126 8 100 Z" fill="#fffdf6"/>' +
      '<path class="ink" d="M60 66 C80 66 90 80 90 96 C90 104 86 110 84 118 C82 126 76 126 76 118 C76 112 70 116 60 116 C42 116 30 104 30 92 C30 78 42 66 60 66 Z" fill="#ffb21f"/>' +
      '<g class="face"><circle cx="50" cy="90" r="3.5"/><circle cx="70" cy="90" r="3.5"/></g><path class="ln" d="M54 102 Q60 97 66 102"/>',
    // 닭다리 튀김 (뼈가 오른쪽 위로)
    chicken: () => '<path d="M64 62 L98 26" stroke="#3b2f2a" stroke-width="27" stroke-linecap="round"/>' +
      '<path d="M94 30 L112 10" stroke="#3b2f2a" stroke-width="13" stroke-linecap="round"/><path d="M94 30 L112 10" stroke="#fff6e6" stroke-width="8" stroke-linecap="round"/>' +
      '<circle class="ink" cx="108" cy="3" r="6.5" fill="#fff6e6"/><circle class="ink" cx="119" cy="14" r="6.5" fill="#fff6e6"/>' +
      '<ellipse class="ink" cx="48" cy="88" rx="44" ry="52" fill="#d98a2b" transform="rotate(38 48 88)"/>' +
      '<path d="M66 60 L96 28" stroke="#d98a2b" stroke-width="21" stroke-linecap="round"/>' +
      dots([[30, 64, 4], [46, 56, 3.5], [62, 70, 3.5], [22, 78, 3], [70, 84, 3], [40, 108, 3.5], [60, 100, 3], [18, 100, 3], [74, 58, 2.5], [84, 44, 2.5]], '#b8691c', 0.55) +
      dots([[36, 70, 2.5], [54, 62, 2.5], [26, 92, 2.5], [64, 92, 2.5], [48, 112, 2.5], [78, 70, 2]], '#f3b456', 0.85) +
      '<g class="face"><path class="ln" d="M28 84 Q33 77 38 84 M52 78 Q57 71 62 78"/></g><path class="ln" d="M38 96 Q47 104 56 94"/>' +
      '<ellipse cx="24" cy="96" rx="6" ry="3.5" fill="#f4a19b" opacity=".75"/><ellipse cx="66" cy="88" rx="6" ry="3.5" fill="#f4a19b" opacity=".75"/>' +
      spark(8, 26, 7, '#ffe27a') + spark(-2, 54, 4, '#ffe27a'),
  };

  // 계란이: mood 표정, cracks 금 개수, hat 모자(없으면 스킨 모자), label 대체 텍스트
  const egg = (skin, o = {}) => svg(o.label || '계란이', eggBody(skin, o));
  const chick = (skin, o = {}) => svg(o.label || '병아리가 된 계란이', chickBody(skin, o.hat || skin.hat));

  // 엔딩 그림: 플레이어 스킨과 상관없이 엔딩마다 정해진 모습으로 그린다.
  // prop은 소품 이름 하나이거나 여러 개의 목록이다.
  function ending(look = {}, label = '엔딩 그림') {
    const skin = { shell: look.shell || '#fff6e6', pattern: look.pattern };
    const props = [].concat(look.prop || []).map((p) => PROPS[p] || {});
    let body;
    if (look.art === 'chick') body = chickBody(skin, look.hat);
    else if (FOODS[look.art]) body = FOODS[look.art]();
    else body = eggBody(skin, { mood: look.mood || 'calm', hat: look.hat });
    return svg(label, props.map((p) => p.back || '').join('') + body + props.map((p) => p.front || '').join(''));
  }

  // 아직 못 본 엔딩: 무늬 없는 물음표 계란
  const mystery = (label = '아직 못 본 엔딩') => svg(label,
    `<path class="mys" d="${EGG}"/><text class="mys-q" x="60" y="98" text-anchor="middle" font-size="52">?</text>`);

  // ---------- 장소 배경 (400×220, 가운데 아래는 계란이 자리라 비워 둔다) ----------
  const R = (x, y, w, h, f, more = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}" ${more}/>`;
  const C = (x, y, r, f, more = '') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" ${more}/>`;
  const E = (x, y, rx, ry, f, more = '') => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${f}" ${more}/>`;
  const P = (d, f, more = '') => `<path d="${d}" fill="${f}" ${more}/>`;
  const L = (d, s, w = 2, more = '') => `<path d="${d}" fill="none" stroke="${s}" stroke-width="${w}" stroke-linecap="round" ${more}/>`;
  const T = (x, y, text, size, f) => `<text x="${x}" y="${y}" text-anchor="middle" font-size="${size}" fill="${f}" style="font-family: var(--f-display)">${text}</text>`;
  const each = (n, f) => Array.from({ length: n }, (_, i) => f(i)).join('');
  const SKY = (f) => R(0, 0, 400, 220, f);
  const SUN = C(338, 46, 24, '#ffd34d') + E(90, 40, 34, 12, '#fff', 'opacity=".8"') + E(130, 32, 24, 10, '#fff', 'opacity=".8"');
  const STARS = (n, seed = 1, h = 220) => each(n, (i) => C((i * 97 + seed * 31) % 400, (i * 57 + seed * 13) % h, (i % 3) * 0.5 + 0.8, '#fff', 'opacity=".85"'));
  const HEN = (x, y, s = 1, body = '#fdfaf2') =>
    `<g transform="translate(${x} ${y}) scale(${s})">` + E(0, 0, 18, 13, body) + C(13, -10, 8, body) +
    P('M9 -18 q3 -6 6 0 q3 -6 6 1 Z', '#d9442f') + P('M20 -10 L27 -8 L20 -6 Z', '#f2a900') + C(15, -11, 1.4, '#26344a') +
    L('M-8 -2 q6 6 14 2', '#d9cdb6', 2) + '</g>';
  const PINE = (x, y, s = 1) =>
    `<g transform="translate(${x} ${y}) scale(${s})">` + R(-4, 0, 8, 26, '#6b4a32') +
    P('M0 -60 L-22 -24 H22 Z', '#2f6b4a') + P('M0 -40 L-28 4 H28 Z', '#2f6b4a') + '</g>';
  const NESTBG = E(200, 198, 130, 18, '#8a6a3a') + each(9, (i) => L(`M${90 + i * 26} ${192 + (i % 2) * 8} l18 ${i % 2 ? -6 : 6}`, '#c99a4f', 3));

  const SCENES = {
    // ── 현대 ──
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

    living: () => SKY('#f4e9d8') + R(0, 0, 400, 12, '#e8d8bf') +
      R(30, 30, 90, 68, '#cfe8f5', 'stroke="#c9b28a" stroke-width="4"') + L('M75 30 V98 M30 64 H120', '#d9c6a0', 2) +
      P('M20 22 H44 C40 58 46 90 36 108 H20 Z', '#e7a6a0') + P('M130 22 H106 C110 58 104 90 114 108 H130 Z', '#e7a6a0') +
      C(214, 40, 16, '#fffaf0', 'stroke="#8b5a3c" stroke-width="3"') + L('M214 40 V30 M214 40 L222 44', '#3b2f2a', 2) +
      P('M262 96 Q262 82 278 82 H384 Q400 82 400 96 V150 H262 Z', '#6d8fc4') + R(250, 116, 160, 40, '#7d9fd2', 'rx="12"') +
      R(262, 154, 10, 12, '#5b3b22') + R(386, 154, 10, 12, '#5b3b22') +
      R(0, 166, 400, 54, '#d9b48a') + each(6, (i) => L(`M0 ${172 + i * 9} H400`, '#c99f72', 1.5)) +
      R(52, 146, 22, 22, '#4a5560', 'rx="4"') + C(63, 152, 3, '#6fd39a') + E(96, 178, 30, 10, '#5d6974') + E(96, 173, 30, 10, '#7c8a96') + C(110, 171, 3, '#6fd39a'),

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

    roof: () => SKY('#bfe3f5') + SUN +
      E(90, 134, 150, 30, '#a6d67c') + R(46, 104, 34, 24, '#f2e2c4') + P('M40 106 L63 90 L86 106 Z', '#c8413a') +
      R(318, 92, 22, 46, '#b07436') + R(314, 88, 30, 8, '#8b5a3c') +
      P('M0 152 Q200 118 400 152 V220 H0 Z', '#5d6f80') +
      each(8, (i) => L(`M0 ${162 + i * 8} Q200 ${128 + i * 8} 400 ${162 + i * 8}`, '#4c5d6d', 2)) +
      L('M0 152 Q200 118 400 152', '#3d4a57', 7) + R(376, 150, 12, 70, '#9aa5ad') +
      E(118, 134, 15, 10, '#8f97a3') + C(129, 125, 7, '#8f97a3') + P('M135 124 L142 126 L135 128 Z', '#f2a900') + C(131, 123, 1.5, '#26344a'),

    truck: () => SKY('#cdeaf7') + SUN + R(0, 96, 400, 36, '#c9d97a') +
      each(7, (i) => E(30 + i * 58, 108, 16, 10, '#e2bd5a') + L(`M${18 + i * 58} 108 H${42 + i * 58}`, '#c99a4f', 2)) +
      each(5, (i) => L(`M${40 + i * 80} 84 H${80 + i * 80}`, '#fff', 2, 'opacity=".7"')) +
      R(0, 150, 400, 70, '#8b5a3c') + each(10, (i) => L(`M${i * 40} 150 V220`, '#7a4b2a', 2)) +
      R(0, 128, 400, 9, '#6b7780') + each(9, (i) => R(i * 48 + 4, 128, 6, 24, '#6b7780')) +
      [10, 286].map((x) => each(4, (k) => R(x, 140 - k * 12, 104, 10, '#d9d3c7', 'stroke="#b8b0a2" stroke-width="1.5"') +
        each(5, (j) => C(x + 12 + j * 20, 140 - k * 12, 4, '#cfc7b8')))).join(''),

    farm: () => SKY('#efdcb4') + each(10, (i) => L(`M${i * 42} 0 V160`, '#dcc79e', 2)) +
      P('M150 0 L190 0 L262 160 L206 160 Z', '#fff7d6', 'opacity=".55"') +
      R(0, 74, 130, 8, '#8b5a3c') + R(270, 74, 130, 8, '#8b5a3c') +
      [22, 64, 106].map((x) => HEN(x, 62)).join('') + [292, 334, 376].map((x) => HEN(x, 62)).join('') +
      E(340, 150, 44, 12, '#c99a4f') + HEN(340, 136, 1.4, '#f4e7d0') +
      R(0, 186, 400, 34, '#c9b48a') + R(0, 172, 400, 14, '#4a5560') + each(20, (i) => C(i * 20 + 10, 179, 4, '#2f3842')) +
      [30, 80, 118].map((x) => E(x, 164, 8, 10, '#fff6e6', 'stroke="#d9cdb6" stroke-width="1.5"')).join(''),

    coop: () => SKY('#1f2a3d') + each(10, (i) => L(`M${i * 42} 0 V170`, '#2a3850', 2)) +
      R(300, 24, 60, 44, '#2f4a6b', 'stroke="#46556b" stroke-width="4"') + C(330, 46, 10, '#fff4d6') +
      P('M0 30 L0 120 L250 210 L320 160 Z', '#fff2a8', 'opacity=".2"') +
      R(0, 170, 400, 50, '#5e4a2c') + NESTBG + HEN(320, 160, 2.2, '#f4e7d0'),

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

    museum: () => SKY('#2f3a44') + each(5, (i) => L(`M${i * 90 + 20} 0 V186`, '#38454f', 3)) +
      P('M176 0 L224 0 L320 200 L80 200 Z', '#fff8e1', 'opacity=".12"') +
      R(24, 60, 70, 80, '#3a4752', 'stroke="#8c99a6" stroke-width="3"') + P('M50 128 C38 110 46 92 52 86 V76 H66 V86 C72 92 80 110 68 128 Z', '#8d867c') +
      R(306, 60, 70, 80, '#3a4752', 'stroke="#8c99a6" stroke-width="3"') + P('M320 128 H362 L356 104 H326 Z', '#8d867c') + R(334, 92, 14, 12, '#8d867c') +
      R(260, 150, 64, 24, '#d9cdb6', 'rx="3"') + L('M268 158 H316 M268 166 H300', '#8c7a5c', 2) + R(0, 186, 400, 34, '#4f4033'),

    // ── 고대 ──
    guji: () => SKY('#d8ecf6') + SUN +
      P('M0 124 L60 74 L120 112 L190 62 L260 110 L330 68 L400 114 V220 H0 Z', '#a9c9b0') +
      P('M0 174 Q200 104 400 174 V220 H0 Z', '#7fb85c') +
      L('M200 0 V118', '#8b55b8', 4) + E(200, 202, 74, 10, '#c8413a') +
      E(68, 172, 34, 16, '#8a9a8f') + C(100, 166, 8, '#8a9a8f') + L('M50 164 l10 -4 M68 162 l10 -2', '#6f7f74', 2) +
      [[18, 196], [34, 192], [50, 198], [300, 194], [318, 190], [336, 196], [354, 192], [372, 198]]
        .map(([x, y]) => R(x - 6, y, 12, 18, '#f2ede2', 'rx="4"') + C(x, y - 4, 6, '#3b2f2a')).join(''),

    pine: () => SKY('#d6ecf2') +
      each(4, (i) => R(46 + i * 30, 118, 24, 12, '#e9dcc3') + E(58 + i * 30, 118, 15, 9, '#c9a25f')) +
      L('M70 108 q-6 -10 0 -20 q6 -10 0 -20 M130 108 q6 -10 0 -20 q-6 -10 0 -20', '#fff', 3, 'opacity=".85"') +
      P('M0 150 Q200 128 400 162 V220 H0 Z', '#7a9a5a') +
      PINE(28, 150, 1.2) + PINE(92, 166, 0.9) + PINE(320, 160, 1) + PINE(376, 150, 1.25) +
      E(200, 204, 96, 14, '#b9874a') + each(10, (i) => L(`M${120 + i * 16} ${200 + (i % 2) * 6} l12 ${i % 2 ? -4 : 4}`, '#8f6532', 2)),

    kiln: () => SKY('#f2dcc0') + P('M0 120 Q200 84 400 132 V220 H0 Z', '#b98b62') +
      P('M10 176 Q60 108 172 102 Q184 102 184 118 Q72 128 32 182 Z', '#8d6e5a') +
      C(56, 152, 6, '#ff9a3c') + C(92, 130, 6, '#ff9a3c') + C(130, 116, 6, '#ff9a3c') +
      L('M174 96 q-8 -14 2 -26 q10 -12 0 -26', '#fff', 4, 'opacity=".8"') +
      P('M300 186 C284 166 292 140 304 132 V114 H322 V132 C334 140 342 166 326 186 Z', '#8d867c') +
      P('M346 186 H392 L386 160 H352 Z', '#9a948c') + R(360, 150, 18, 10, '#9a948c') +
      R(0, 188, 400, 32, '#a8835e'),

    smithy: () => SKY('#3d3029') + each(6, (i) => L(`M0 ${20 + i * 26} H400`, '#4a3b32', 2)) +
      R(18, 108, 96, 72, '#5b4a3f', 'rx="8"') + C(66, 120, 32, '#ff7a2f', 'opacity=".85"') + C(66, 120, 16, '#ffd34d') +
      P('M120 150 L160 136 L160 164 Z', '#8b5a3c') +
      P('M286 152 H372 L362 138 H300 Z', '#26262a') + R(312, 152, 38, 26, '#26262a') + R(298, 176, 66, 8, '#26262a') +
      each(4, (i) => R(380 - i * 4, 186 - i * 8, 18, 6, '#6b7780')) +
      each(8, (i) => C(80 + (i * 37) % 80, 70 + (i * 23) % 40, 2, '#ffd34d')) + R(0, 186, 400, 34, '#4a3a30'),

    port: () => SKY('#cfe9f6') + SUN + R(0, 110, 400, 74, '#4f9fd0') +
      each(6, (i) => L(`M${i * 70} ${126 + (i % 2) * 22} q12 -6 24 0 t24 0`, '#fff', 2, 'opacity=".6"')) +
      P('M258 142 H398 L382 170 H274 Z', '#7a4b2a') + L('M330 142 V34', '#5b3b22', 4) +
      P('M326 40 L326 132 L274 132 Z', '#d9442f') + P('M334 48 L334 132 L388 132 Z', '#c8413a') +
      P('M30 158 H100 L92 170 H38 Z', '#8b5a3c') + L('M64 158 V120', '#5b3b22', 3) + P('M66 122 L66 154 L92 154 Z', '#f2ede2') +
      L('M120 40 q8 -8 16 0 q8 -8 16 0 M180 60 q6 -6 12 0 q6 -6 12 0', '#fff', 2.5) +
      R(0, 184, 400, 36, '#a87a4f') + each(10, (i) => L(`M${i * 40} 184 V220`, '#8b6340', 2)),

    river: () => SKY('#d6ecf6') + P('M0 104 L80 66 L170 98 L260 60 L340 96 L400 80 V112 H0 Z', '#9cc29a') +
      R(0, 104, 400, 10, '#7fb85c') + R(0, 112, 400, 78, '#6fb6dc') +
      each(6, (i) => L(`M${i * 70 + 10} ${130 + (i % 3) * 16} q12 -6 24 0 t24 0`, '#fff', 2, 'opacity=".6"')) +
      E(70, 160, 34, 10, '#9aa5ad') + E(70, 146, 28, 15, '#5f8f6a') + C(100, 146, 7, '#7fae7a') +
      L('M56 140 l8 6 l-8 6 M74 138 l8 8 l-8 8', '#476b50', 2) +
      P('M300 160 H390 L376 176 H314 Z', '#8b5a3c') + L('M340 160 L372 130', '#6b4a32', 3) +
      R(0, 188, 400, 32, '#9bcf74'),

    pass: () => SKY('#cfe3ee') + P('M0 120 L90 50 L180 110 L280 40 L400 120 V220 H0 Z', '#8fb1a8') +
      P('M0 160 L120 100 L220 150 L320 96 L400 140 V220 H0 Z', '#6f957f') +
      P('M150 220 Q186 170 236 150 Q268 138 310 140 L316 148 Q276 150 252 162 Q216 182 236 220 Z', '#d9c39a') +
      PINE(320, 150, 1.1) + PINE(372, 168, 1.3) + PINE(118, 180, 0.9) +
      E(48, 190, 46, 22, '#4f8a3d') + C(66, 162, 22, '#f08a24') + P('M48 146 l6 -12 l8 10 Z M76 144 l8 -10 l4 12 Z', '#f08a24') +
      L('M52 158 h8 M72 156 h8 M60 146 v8', '#26262a', 3) + C(58, 160, 3.5, '#ffe27a') + C(74, 160, 3.5, '#ffe27a') + E(66, 172, 9, 6, '#fff4e6') +
      E(352, 74, 11, 6, '#26344a') + E(350, 77, 6, 4, '#fff') + L('M362 72 l14 -4', '#26344a', 3),

    gyerim: () => SKY('#e4efe2') + E(200, 120, 240, 60, '#fff', 'opacity=".5"') +
      [18, 64, 116, 288, 336, 384].map((x, i) => R(x - 8, 0, 16 + (i % 2) * 6, 196, '#6b5240') + E(x, 10 + (i % 3) * 8, 40, 28, '#5e9c46')).join('') +
      P('M160 0 L186 0 L240 196 L190 196 Z', '#fffbe6', 'opacity=".5"') +
      L('M262 52 H350', '#6b5240', 6) + L('M318 52 V68', '#c8a24a', 2) + R(304, 68, 28, 20, '#f2c230', 'rx="3" stroke="#a87100" stroke-width="2"') +
      R(0, 190, 400, 30, '#8fbf6a') + E(344, 186, 38, 9, '#c99a4f') + HEN(340, 168, 1.6, '#fdfdf8') +
      E(46, 182, 34, 16, '#4f8a3d') + P('M62 186 C84 170 96 186 86 196 C80 186 72 190 62 186 Z', '#d9622b'),

    frost: () => SKY('#16213a') + C(322, 40, 18, '#fff4d6') + STARS(30, 3, 140) +
      [20, 70, 350, 392].map((x, i) => R(x - 7, 40, 14, 160, '#0f1828') + E(x, 50 + (i % 2) * 10, 34, 30, '#0f1828')).join('') +
      each(14, (i) => spark((i * 61) % 400, 150 + (i * 13) % 40, 3, '#dff1ff', 0.8)) +
      R(0, 186, 400, 34, '#2b3a50') + NESTBG + HEN(312, 162, 2, '#eef2f5'),

    sky: () => SKY('#bfe3f5') + E(80, 60, 70, 20, '#fff') + E(300, 40, 90, 22, '#fff') + E(220, 120, 120, 26, '#fff', 'opacity=".9"') +
      L('M-10 92 C50 40 110 124 190 72 S290 30 326 52', '#3fae7a', 14) + L('M-10 92 C50 40 110 124 190 72 S290 30 326 52', '#8fd9b0', 4, 'stroke-dasharray="6 10"') +
      L('M330 40 l-6 -16 M342 38 l4 -16', '#f2c230', 4) + E(340, 54, 20, 15, '#3fae7a') + C(346, 48, 4, '#fff') + C(347, 48, 2, '#26344a') +
      L('M358 58 q14 -2 22 8 M356 62 q12 4 18 14', '#3fae7a', 2.5) +
      E(60, 200, 120, 30, '#fff') + E(340, 206, 120, 30, '#fff'),

    // ── 미래 ──
    pantry: () => SKY('#dfe9f2') + R(0, 18, 400, 4, '#6fd3ff') +
      each(4, (i) => R(14 + i * 100, 40, 74, 58, '#eef4f8', 'rx="8" stroke="#c3d2d8" stroke-width="2"')) +
      R(24, 50, 54, 32, '#23313d', 'rx="5"') + L('M32 60 H66 M32 70 H58', '#6fd39a', 2) +
      each(3, (i) => R(14 + i * 140, 116, 110, 50, '#eef4f8', 'rx="8" stroke="#c3d2d8" stroke-width="2"')) +
      R(0, 192, 400, 28, '#b9c7d1') + L('M400 24 L338 66 L360 108', '#8c99a6', 10) + L('M350 108 l-8 10 M366 108 l8 10', '#8c99a6', 5) +
      each(8, (i) => spark(30 + i * 48, 106 + (i % 2) * 6, 3, '#ffffff', 0.9)),

    corridor: () => SKY('#2b3546') + R(50, 24, 300, 180, '#3a475b', 'rx="40"') + R(100, 56, 200, 128, '#46556b', 'rx="30"') +
      R(144, 82, 112, 82, '#53637a', 'rx="22"') + L('M60 196 L150 162 M340 196 L250 162', '#6fd3ff', 3, 'opacity=".7"') +
      [30, 370].map((x) => C(x, 92, 18, '#0d1330', 'stroke="#8c99a6" stroke-width="4"') + C(x - 6, 86, 1.5, '#fff') + C(x + 5, 98, 1.2, '#fff')).join('') +
      R(0, 200, 400, 20, '#2f3a4a'),

    engine: () => SKY('#1c2230') + L('M0 36 H400', '#4a5560', 10) + L('M0 60 H120 V220', '#4a5560', 8) + L('M400 150 H330 V220', '#4a5560', 8) +
      C(300, 92, 60, '#ff9a3c', 'opacity=".3"') + C(300, 92, 40, '#ffb84d', 'opacity=".7"') + C(300, 92, 20, '#fff2c4') +
      C(300, 92, 48, 'none', 'stroke="#8c99a6" stroke-width="3"') +
      E(70, 118, 16, 7, '#cfd8dc') + L('M54 110 H86', '#9aa5ad', 2) + C(76, 118, 2.5, '#6fd3ff') +
      R(0, 198, 400, 22, '#2a2a2e') + each(20, (i) => P(`M${i * 20} 220 L${i * 20 + 10} 198 L${i * 20 + 18} 198 L${i * 20 + 8} 220 Z`, '#f5b000')),

    garden: () => SKY('#f3e9ff') + each(5, (i) => R(16 + i * 80, 8, 64, 6, '#ff8fd0', 'rx="3"')) +
      P('M0 14 H400 L360 120 H40 Z', '#ffd9f1', 'opacity=".35"') +
      [30, 92, 308, 370].map((x) => R(x - 5, 36, 10, 156, '#cfd8dc') +
        each(5, (k) => C(x - 12, 52 + k * 28, 12, '#6fbf5a') + C(x + 12, 64 + k * 28, 12, '#7cc46a') + C(x + 14, 60 + k * 28, 3, '#e05a47'))).join('') +
      R(0, 190, 400, 30, '#d6cde6') + L('M0 190 H400', '#a99cc4', 3) + L('M400 20 L332 58 L352 98', '#8c99a6', 8),

    window: () => SKY('#2b3546') + C(200, 98, 94, '#0d1330', 'stroke="#8c99a6" stroke-width="10"') +
      each(18, (i) => C(130 + (i * 37) % 140, 30 + (i * 23) % 130, (i % 3) * 0.5 + 0.8, '#fff', 'opacity=".85"')) +
      C(236, 74, 30, '#d9643a') + E(228, 66, 10, 5, '#b3502f') + E(246, 86, 8, 4, '#b3502f') + C(150, 56, 9, '#4f9fd0') +
      each(12, (i) => C(200 + 94 * Math.cos((i * Math.PI) / 6), 98 + 94 * Math.sin((i * Math.PI) / 6), 3, '#cfd8dc')) +
      R(334, 58, 54, 132, '#5b6b80', 'rx="10"') + C(361, 50, 5, '#ff5a5a') + R(0, 196, 400, 24, '#46556b'),

    hangar: () => SKY('#3a4556') + each(4, (i) => R(30 + i * 100, 10, 50, 6, '#cfe8f5', 'rx="3"')) +
      R(0, 170, 400, 50, '#5b6573') + each(20, (i) => P(`M${i * 20} 176 L${i * 20 + 10} 170 L${i * 20 + 18} 170 L${i * 20 + 8} 176 Z`, '#f5b000')) +
      [20, 96, 290].map((x) => P(`M${x} 170 V110 Q${x} 70 ${x + 30} 58 Q${x + 60} 70 ${x + 60} 110 V170 Z`, '#eef2f5') +
        R(x, 128, 60, 7, '#c8413a') + C(x + 30, 100, 11, '#9aa5ad') + C(x + 30, 100, 8, '#26344a') + C(x + 27, 97, 2.5, '#cfe8f5') +
        P(`M${x} 170 L${x - 10} 176 V150 Z M${x + 60} 170 L${x + 70} 176 V150 Z`, '#c8413a')).join('') +
      R(354, 150, 40, 18, '#cfd8dc', 'rx="4"') + C(360, 170, 6, '#26344a') + C(388, 170, 6, '#26344a'),

    mars: () => SKY('#f2c4a0') + C(80, 40, 10, '#fff4d6') +
      P('M0 140 Q100 108 200 140 T400 128 V220 H0 Z', '#c9603a') + P('M0 182 Q120 152 240 182 T400 176 V220 H0 Z', '#b3502f') +
      P('M262 172 A70 70 0 0 1 402 172 Z', '#d8f3ff', 'opacity=".55" stroke="#ffffff" stroke-width="3"') +
      E(332, 168, 60, 7, '#6fbf5a') + R(344, 144, 22, 20, '#f2e2c4') + P('M340 146 L355 134 L370 146 Z', '#c8413a') +
      R(36, 156, 32, 20, '#6b7780', 'rx="3"') + L('M42 162 H62 M42 168 H62', '#3b4650', 2) +
      E(130, 196, 12, 6, '#8a3c22') + E(250, 204, 16, 7, '#8a3c22'),

    dust: () => SKY('#4a241b') + each(10, (i) => L(`M${-40 + i * 50} ${26 + (i % 3) * 30} q40 -20 80 0 t80 0`, '#a8553a', 6, 'opacity=".5"')) +
      P('M-20 190 A220 170 0 0 1 420 190', 'none', 'stroke="#d8f3ff" stroke-width="3" opacity=".35"') +
      C(56, 34, 6, '#ff5a5a') + C(56, 34, 16, '#ff5a5a', 'opacity=".25"') +
      P('M10 160 L90 140 L100 160 L20 180 Z', '#2f4a6b') + P('M10 160 Q50 140 100 160', '#a8553a') +
      R(0, 186, 400, 34, '#3a2a24') + NESTBG + HEN(316, 162, 2, '#f3efe6'),

    space: () => SKY('#0b1230') + STARS(46, 5) + C(80, 196, 80, '#3f8fd0') +
      P('M30 150 C50 136 70 150 64 166 C56 180 34 176 30 150 Z M100 140 C120 130 136 146 126 160 C116 170 104 160 100 140 Z', '#5fae6a') +
      L('M20 180 q30 -10 60 0', '#fff', 3, 'opacity=".6"') + C(332, 50, 16, '#e9c46a') + E(332, 50, 28, 7, 'none', 'stroke="#d9b45a" stroke-width="3"'),

    // ── 현대 · 치킨 엔딩 ──
    hatchery: () => SKY('#f6e3d3') + R(0, 0, 400, 10, '#e8cdb6') +
      [12, 268].map((x) => R(x, 36, 120, 150, '#cfd8dc', 'rx="8"') + R(x + 8, 18, 104, 22, '#26344a', 'rx="4"') +
        T(x + 60, 35, '37.5℃', 14, '#ff6b5a') +
        each(4, (k) => R(x + 8, 46 + k * 34, 104, 28, '#eef2f5', 'rx="4" stroke="#9aa5ad" stroke-width="2"') +
          each(5, (j) => E(x + 20 + j * 20, 60 + k * 34, 6, 8, '#fff6e6', 'stroke="#d9cdb6" stroke-width="1.5"')))).join('') +
      P('M150 0 H250 L300 186 H100 Z', '#ffb38a', 'opacity=".18"') +
      R(150, 28, 100, 66, '#fff6e6', 'rx="4" stroke="#d8402c" stroke-width="3"') +
      T(200, 58, 'B*C치킨', 20, '#d8402c') + T(200, 80, '공식 납품 농장', 11, '#3b2f2a') +
      R(0, 186, 400, 34, '#c9b48a'),

    chickenshop: () => SKY('#2a2f45') + STARS(14, 9, 40) +
      R(26, 44, 348, 158, '#f6e9d8') +
      each(10, (i) => P(`M${30 + i * 34} 64 h34 v12 q-17 12 -34 0 Z`, i % 2 ? '#fff6e6' : '#d8402c')) +
      R(104, 8, 192, 40, '#d8402c', 'rx="8" stroke="#3b2f2a" stroke-width="3"') + T(200, 37, 'B*C치킨', 24, '#fff6e6') +
      R(42, 96, 100, 74, '#3b2f2a', 'rx="6"') + T(92, 118, '후라이드', 14, '#fff6e6') + T(92, 138, '양념', 14, '#ffb38a') + T(92, 158, '반반', 14, '#ffe27a') +
      R(262, 104, 96, 60, '#9aa5ad', 'rx="6"') + R(270, 112, 80, 30, '#ffb84d', 'opacity=".85"') +
      L('M284 104 V86 M336 104 V86', '#6b7780', 4) + L('M296 108 q4 -8 0 -16 M318 108 q4 -8 0 -16', '#fff', 2, 'opacity=".7"') +
      R(26, 178, 348, 24, '#8b5a3c') + R(0, 202, 400, 18, '#3a3f55'),
  };

  function scene(bg) {
    const draw = SCENES[bg] || SCENES.fridge;
    return `<svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${draw()}</svg>`;
  }

  return { egg, chick, ending, mystery, scene, has: (bg) => Boolean(SCENES[bg]), sceneKeys: () => Object.keys(SCENES) };
})();
