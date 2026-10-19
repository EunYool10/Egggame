// 계란이의 모험 v3.4 — 옷장에 더한 계란들의 무늬와 모자 (art.js 다음에 읽는다)
// 무늬는 껍질 모양으로 잘려 그려진다. 얼굴(눈 y≈84, 입 y≈100, 볼 x≈33·87) 둘레는 되도록 비워 둔다.
// 스킨 값: pc 무늬 색, pt 무늬 글자, hc 모자 색 (없으면 기본 색)
(() => {
  'use strict';

  const { dots, spark, esc } = window.Art.kit;
  const each = (list, f) => list.map(f).join('');
  const heart = (x, y, s, color, op = 1) =>
    `<path d="M${x} ${y + 7 * s} C${x - 11 * s} ${y - s} ${x - 6 * s} ${y - 9 * s} ${x} ${y - 4 * s} C${x + 6 * s} ${y - 9 * s} ${x + 11 * s} ${y - s} ${x} ${y + 7 * s} Z" fill="${color}" opacity="${op}"/>`;
  const star = (x, y, r, color, op = 1) => {
    const pts = Array.from({ length: 10 }, (_, i) => {
      const a = (Math.PI / 5) * i - Math.PI / 2;
      const d = i % 2 ? r * 0.45 : r;
      return `${(x + d * Math.cos(a)).toFixed(1)} ${(y + d * Math.sin(a)).toFixed(1)}`;
    });
    return `<path d="M${pts.join(' L')} Z" fill="${color}" opacity="${op}"/>`;
  };
  // 영어·숫자 글자 (굵은 고딕), 한글 글자 (제목 글꼴)
  const word = (x, y, text, size, color, more = '') =>
    `<text x="${x}" y="${y}" text-anchor="middle" font-size="${size}" font-weight="700" font-family="sans-serif" fill="${color}" ${more}>${esc(text)}</text>`;
  const hangul = (x, y, text, size, color) =>
    `<text x="${x}" y="${y}" text-anchor="middle" font-size="${size}" fill="${color}" style="font-family: var(--f-display)">${esc(text)}</text>`;
  const line = (d, color, w = 2.5, op = 1, more = '') =>
    `<path d="${d}" stroke="${color}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="${op}" ${more}/>`;
  const blob = (x, y, r, color, op, turn = 0) =>
    `<path d="M${x - r} ${y} C${x - r} ${y - r} ${x + r * 0.4} ${y - r * 1.1} ${x + r} ${y - r * 0.2} C${x + r * 1.2} ${y + r * 0.6} ${x + r * 0.2} ${y + r} ${x - r * 0.4} ${y + r * 0.8} C${x - r * 0.9} ${y + r * 0.6} ${x - r} ${y + r * 0.3} ${x - r} ${y} Z" fill="${color}" opacity="${op}" transform="rotate(${turn} ${x} ${y})"/>`;
  // 사방에 흩어 놓는 자리 (얼굴을 피한다)
  const AROUND = [[28, 40], [86, 32], [98, 100], [22, 106], [60, 126]];

  const patterns = {
    // ── 처음부터 있는 계란 ──
    polka: (k) => dots([[26, 38, 6], [60, 20, 5.5], [94, 38, 6], [42, 58, 4.5], [78, 58, 4.5], [14, 82, 5], [106, 82, 5], [26, 118, 6], [60, 128, 6], [94, 118, 6]], k.pc || '#6fa8e0', 0.6),
    stripes: (k) => each([20, 42, 114, 130], (y) => `<rect x="-4" y="${y}" width="128" height="9" fill="${k.pc || '#f7a8c4'}" opacity=".7"/>`),
    hearts: (k) => each([[28, 40, 1], [86, 30, 0.8], [98, 98, 0.9], [22, 106, 0.8], [60, 126, 1], [60, 50, 0.55]], ([x, y, s]) => heart(x, y, s, k.pc || '#f06b8f', 0.8)),
    starry: (k) => each([[28, 40, 8], [84, 30, 7], [100, 96, 8], [20, 104, 6], [62, 126, 8], [58, 50, 4.5]], ([x, y, r]) => star(x, y, r, k.pc || '#ffc233', 0.9)),

    // ── 엔딩 모으기 보상 ──
    clover: () => each(AROUND, ([x, y]) =>
      each([[0, -4.6], [4.6, 0], [0, 4.6], [-4.6, 0]], ([dx, dy]) => `<circle cx="${x + dx}" cy="${y + dy}" r="4.4" fill="#4f9a5a" opacity=".85"/>`) +
      line(`M${x} ${y} q3 7 6 9`, '#3f7a3a', 1.8, 0.9)),
    bee: () => each([30, 52, 112, 128], (y) => `<rect x="-4" y="${y}" width="128" height="10" fill="#3b2f2a" opacity=".85"/>`),
    gingham: (k) => each([-4, 24, 52, 80, 108], (x) => `<rect x="${x}" y="-4" width="14" height="150" fill="${k.pc || '#e05a47'}" opacity=".28"/>`) +
      each([-4, 24, 52, 80, 108, 136], (y) => `<rect x="-4" y="${y}" width="128" height="14" fill="${k.pc || '#e05a47'}" opacity=".28"/>`),
    ladybug: () => '<path d="M-4 -4 H124 V24 Q60 38 -4 24 Z" fill="#2b2b2b"/>' + line('M60 30 V64', '#2b2b2b', 3) +
      dots([[34, 46, 7], [86, 46, 7], [16, 78, 5], [104, 78, 5], [30, 120, 6.5], [90, 120, 6.5], [60, 130, 5]], '#2b2b2b', 1),
    melon: () => each([16, 33, 87, 104], (x) => line(`M${x} -6 q5 12 0 24 t0 24 t0 24 t0 24 t0 24 t0 24 t0 24`, '#3f8a3a', 5, 0.7)) +
      line('M60 -6 q5 12 0 24 t0 24 t0 18', '#3f8a3a', 5, 0.7),
    peel: () => dots([[30, 40, 1.8], [48, 24, 1.5], [74, 28, 1.8], [92, 46, 1.5], [22, 68, 1.5], [98, 72, 1.8], [38, 116, 1.8], [82, 120, 1.5], [62, 128, 1.4], [104, 100, 1.4], [16, 98, 1.4], [60, 54, 1.4]], '#ffd59a', 0.9) +
      '<ellipse cx="60" cy="18" rx="9" ry="5" fill="#e08a1c" opacity=".35"/>',
    pandaeyes: () => '<ellipse cx="45" cy="85" rx="11" ry="9" fill="#3b2f2a" opacity=".22" transform="rotate(-20 45 85)"/>' +
      '<ellipse cx="75" cy="85" rx="11" ry="9" fill="#3b2f2a" opacity=".22" transform="rotate(20 75 85)"/>',
    penguin: () => '<ellipse cx="60" cy="100" rx="39" ry="44" fill="#fffdf6"/>' +
      '<path d="M44 140 l6 -8 l6 8 Z M64 140 l6 -8 l6 8 Z" fill="#f2a900"/>',
    muzzle: () => '<ellipse cx="60" cy="101" rx="17" ry="12" fill="#f6e3cc"/><ellipse cx="60" cy="93" rx="4.5" ry="3.2" fill="#3b2f2a"/>' +
      dots([[34, 40, 2], [86, 40, 2], [60, 128, 2]], '#8a5a36', 0.35),
    whiskers: () => line('M8 90 L27 93 M8 100 L27 99 M112 90 L93 93 M112 100 L93 99', '#3b2f2a', 1.8, 0.7) +
      '<path d="M56 91 H64 L60 95.5 Z" fill="#f08aa0"/>' + line('M24 40 l8 4 M20 52 l9 2 M96 40 l-8 4 M100 52 l-9 2', '#d9884a', 2.4, 0.6),

    // ── 엔딩 종류 보상 ──
    sunrays: () => each([0, 45, 90, 135, 180, 225, 270, 315], (a) => {
      const r = (a * Math.PI) / 180;
      const p = (d) => `${(60 + d * Math.cos(r)).toFixed(1)} ${(32 + d * Math.sin(r)).toFixed(1)}`;
      return line(`M${p(17)} L${p(25)}`, '#f2a900', 4, 0.85);
    }) + '<circle cx="60" cy="32" r="12" fill="#ffc233"/>' + dots([[24, 110, 3], [96, 112, 3], [60, 130, 2.5]], '#ffc233', 0.7),
    medal: () => '<path d="M50 104 L57 117 L63 117 L56 104 Z" fill="#d8402c"/><path d="M70 104 L63 117 L57 117 L64 104 Z" fill="#3f6fc0"/>' +
      '<circle cx="60" cy="125" r="10" fill="#ffc233" stroke="#c88a00" stroke-width="2"/>' + star(60, 125, 5.5, '#fff6d6') +
      spark(30, 40, 6, '#ffffff', 0.9) + spark(90, 34, 5, '#ffffff', 0.9),
    rainbowarc: () => each([['#ff8a8a', 52], ['#ffd27a', 46], ['#9be08a', 40], ['#86c5ff', 34]], ([c, r]) =>
      `<path d="M${60 - r} 70 A${r} ${r} 0 0 1 ${60 + r} 70" stroke="${c}" stroke-width="6" fill="none"/>`) +
      '<ellipse cx="18" cy="72" rx="12" ry="6" fill="#fff" opacity=".9"/><ellipse cx="102" cy="72" rx="12" ry="6" fill="#fff" opacity=".9"/>',
    plaid: (k) => each([10, 50, 90], (x) => `<rect x="${x}" y="-4" width="16" height="150" fill="${k.pc || '#c8413a'}" opacity=".25"/>`) +
      each([14, 54, 118], (y) => `<rect x="-4" y="${y}" width="128" height="16" fill="${k.pc || '#c8413a'}" opacity=".25"/>`) +
      line('M38 -4 V146 M78 -4 V146 M-4 42 H124 M-4 108 H124', '#2f5a3a', 1.4, 0.45),
    stamps: () => each([[30, 40, '현대', -12, '#d8402c'], [88, 34, '고대', 10, '#2f8f6b'], [98, 108, '미래', -8, '#6a5acd'], [24, 112, 'OK', 12, '#c88a00']], ([x, y, t, r, c]) =>
      `<g transform="rotate(${r} ${x} ${y})" opacity=".8"><circle cx="${x}" cy="${y}" r="12" fill="none" stroke="${c}" stroke-width="2.4"/>` +
      `<circle cx="${x}" cy="${y}" r="8.5" fill="none" stroke="${c}" stroke-width="1"/>${t === 'OK' ? word(x, y + 3.5, t, 9, c) : hangul(x, y + 3.5, t, 9, c)}</g>`),
    map: () => line('M16 44 C30 22 52 46 70 30 C84 18 104 30 102 50 C100 70 110 92 98 110', '#8a5a36', 2.6, 0.75, 'stroke-dasharray="5 5"') +
      line('M80 114 L94 128 M94 114 L80 128', '#d8402c', 4) +
      '<path d="M18 112 L26 98 L34 112 Z M28 112 L36 102 L44 112 Z" fill="#8a7a5a" opacity=".55"/>' +
      line('M8 128 q6 -4 12 0 t12 0 t12 0', '#4f9fd0', 2, 0.7),
    keyhole: () => '<circle cx="60" cy="40" r="18" fill="#f2c230"/><circle cx="60" cy="40" r="14" fill="none" stroke="#c89a1a" stroke-width="1.5"/>' +
      '<circle cx="60" cy="35" r="5.5" fill="#3b2f2a"/><path d="M57 37 L54 50 H66 L63 37 Z" fill="#3b2f2a"/>' +
      spark(92, 30, 5, '#ffffff', 0.95) + spark(26, 110, 4, '#ffffff', 0.9),
    raincloud: () => '<g fill="#a9b7c6"><circle cx="47" cy="34" r="10"/><circle cx="60" cy="27" r="13"/><circle cx="73" cy="34" r="10"/><rect x="47" y="30" width="26" height="14"/></g>' +
      each([[44, 56], [60, 60], [76, 56], [20, 110], [100, 106], [60, 128]], ([x, y]) => `<path d="M${x} ${y - 6} Q${x + 4.5} ${y + 1} ${x} ${y + 3.5} Q${x - 4.5} ${y + 1} ${x} ${y - 6} Z" fill="#6fa8e0" opacity=".85"/>`),
    stitches: () => `<g transform="rotate(-10 30 40)"><rect x="16" y="28" width="30" height="24" rx="3" fill="#f2c79a"/>` +
      '<rect x="16" y="28" width="30" height="24" rx="3" fill="none" stroke="#8a5a36" stroke-width="1.6" stroke-dasharray="4 3"/></g>' +
      '<g transform="rotate(12 92 118)"><rect x="78" y="106" width="28" height="24" rx="3" fill="#bfe1ff"/>' +
      '<rect x="78" y="106" width="28" height="24" rx="3" fill="none" stroke="#3f6fc0" stroke-width="1.6" stroke-dasharray="4 3"/></g>' +
      line('M82 32 L98 52', '#8a5a36', 2) + line('M84 40 l6 -4 M88 46 l6 -4 M92 52 l6 -4', '#8a5a36', 1.6) +
      line('M16 104 L30 122', '#8a5a36', 2) + line('M16 110 l7 -3 M20 116 l7 -3', '#8a5a36', 1.6),
    sprinkles: () => '<path d="M-4 -4 H124 V34 q-8 10 -16 0 q-8 14 -16 0 q-8 10 -16 0 q-8 14 -16 0 q-8 10 -16 0 q-8 14 -16 0 q-8 10 -16 0 q-6 10 -12 0 Z" fill="#ffb3cf"/>' +
      each([[30, 18, '#6fa8e0', 20], [46, 10, '#ffd34d', -30], [62, 22, '#7cc46a', 60], [76, 12, '#fff', -10], [88, 24, '#c3a2ff', 40], [52, 30, '#fff', 80], [40, 24, '#e05a47', 10],
        [24, 112, '#6fa8e0', 30], [96, 108, '#e76f9a', -20], [60, 128, '#ffd34d', 50], [80, 124, '#7cc46a', -40], [38, 126, '#c3a2ff', 70]], ([x, y, c, r]) =>
        `<rect x="${x}" y="${y}" width="8" height="3" rx="1.5" fill="${c}" transform="rotate(${r} ${x + 4} ${y + 1.5})"/>`),

    // ── 이야기 보상 ──
    scales: () => each([16, 28, 40, 52, 116, 128, 140], (y, i) =>
      line(Array.from({ length: 9 }, (_, j) => `M${-4 + j * 16 + (i % 2) * 8} ${y} a8 8 0 0 0 16 0`).join(' '), '#7d8590', 2, 0.7)),
    neon: () => line('M-4 34 L18 22 L40 34 L62 22 L84 34 L106 22 L128 34', '#2fe0ff', 8, 0.25) + line('M-4 34 L18 22 L40 34 L62 22 L84 34 L106 22 L128 34', '#19b8e0', 3) +
      line('M-4 122 L18 112 L40 122 L62 112 L84 122 L106 112 L128 122', '#ff4fd8', 8, 0.25) + line('M-4 122 L18 112 L40 122 L62 112 L84 122 L106 112 L128 122', '#e03cc0', 3) +
      dots([[30, 52, 2.5], [90, 52, 2.5], [60, 132, 2.5]], '#19b8e0', 0.8),

    // ── 탐험과 기록 보상 ──
    moonlit: () => '<path d="M80 18 a17 17 0 1 0 16 26 a13 13 0 1 1 -16 -26 Z" fill="#ffe27a"/>' +
      each([[30, 36, 4], [46, 22, 3], [24, 112, 3.5], [98, 110, 4], [62, 128, 3], [40, 56, 2.5]], ([x, y, r]) => spark(x, y, r, '#ffffff', 0.95)),
    footprints: () => each([[24, 46, -25], [40, 32, -10], [82, 30, 12], [98, 44, 28], [20, 114, -35], [38, 126, -15], [84, 126, 15], [100, 112, 32]], ([x, y, r]) =>
      `<g transform="rotate(${r} ${x} ${y})">${line(`M${x} ${y} l-4 -7 M${x} ${y} l0 -8 M${x} ${y} l4 -7 M${x} ${y} l0 4`, '#8a6a40', 2.4, 0.65)}</g>`),
    compass: () => '<circle cx="60" cy="38" r="17" fill="#fff6e6" stroke="#8a5a36" stroke-width="2.5"/>' +
      '<path d="M46 38 L60 35 L74 38 L60 41 Z" fill="#b8a593"/><path d="M60 23 L64.5 38 H55.5 Z" fill="#d8402c"/><path d="M60 53 L64.5 38 H55.5 Z" fill="#5e554d"/>' +
      '<circle cx="60" cy="38" r="2" fill="#fff6e6"/>' + line('M14 112 C30 104 40 126 56 120 S84 104 106 118', '#8a5a36', 2, 0.6, 'stroke-dasharray="4 4"'),
    globe: () => blob(30, 40, 13, '#6fbf5f', 0.85, 20) + blob(94, 58, 11, '#6fbf5f', 0.85, -40) + blob(36, 120, 12, '#6fbf5f', 0.85, 60) + blob(96, 116, 9, '#6fbf5f', 0.85, 10) +
      '<ellipse cx="60" cy="72" rx="28" ry="72" fill="none" stroke="#fff" stroke-width="2" opacity=".45"/>' +
      line('M-4 46 H124 M-4 116 H124', '#ffffff', 2, 0.45),
    notes: () => each([[28, 46, '#7b55b8'], [90, 36, '#3f8fd0'], [100, 112, '#e76f9a'], [22, 116, '#3f8fd0'], [64, 130, '#7b55b8']], ([x, y, c]) =>
      `<ellipse cx="${x}" cy="${y}" rx="5" ry="3.8" fill="${c}" transform="rotate(-20 ${x} ${y})"/>` + line(`M${x + 4.4} ${y - 1} V${y - 18} q6 3 8 9`, c, 2)),
    bubbles: () => each([[28, 40, 9], [84, 30, 7], [98, 100, 10], [22, 108, 7], [60, 126, 8], [50, 56, 5], [104, 64, 5]], ([x, y, r]) =>
      `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffffff" opacity=".35"/><circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#86c5ff" stroke-width="1.8"/>` +
      line(`M${x - r * 0.55} ${y - r * 0.2} a${r * 0.6} ${r * 0.6} 0 0 1 ${r * 0.45} ${-r * 0.4}`, '#ffffff', 1.6, 0.9)),
    thought: () => dots([[58, 58, 2.5], [64, 50, 3.5]], '#9aa5ad', 0.8) +
      '<ellipse cx="74" cy="30" rx="18" ry="12" fill="#ffffff" stroke="#9aa5ad" stroke-width="2"/>' + dots([[66, 30, 2.2], [74, 30, 2.2], [82, 30, 2.2]], '#7d8590', 1) +
      word(28, 120, '?', 16, '#9aa5ad', 'opacity=".8"') + word(96, 118, '!', 15, '#9aa5ad', 'opacity=".8"'),
    abc: () => each([[30, 42, 'A', '#e05a47', 10], [88, 36, 'B', '#3f8fd0', 9], [62, 126, 'C', '#2f9a62', 10], [100, 104, 'A', '#e05a47', 6], [20, 108, 'B', '#3f8fd0', 6]], ([x, y, t, c, r]) =>
      `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" opacity=".9"/>` + word(x, y + r * 0.42, t, r * 1.25, '#ffffff')),
    film: () => '<g transform="rotate(-8 60 36)"><rect x="-10" y="22" width="140" height="28" fill="#3b2f2a"/>' +
      each([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], (i) => `<rect x="${-8 + i * 11}" y="24.5" width="5" height="4" rx="1" fill="#fff6e6"/><rect x="${-8 + i * 11}" y="43.5" width="5" height="4" rx="1" fill="#fff6e6"/>`) +
      each([0, 1, 2, 3, 4, 5], (i) => `<rect x="${-2 + i * 22}" y="31" width="17" height="10" rx="1.5" fill="${['#9fd3f5', '#ffd27a', '#f7a8c4'][i % 3]}"/>`) + '</g>' +
      star(26, 116, 6, '#ffc233', 0.9) + star(96, 112, 5, '#ffc233', 0.9),
    puzzle: (k) => `<path d="M60 -4 H124 V60 H96 a6 6 0 0 0 -12 0 H60 V36 a6 6 0 0 1 0 -12 Z" fill="${k.pc || '#86c5ff'}" opacity=".35"/>` +
      `<path d="M-4 112 H24 a6 6 0 0 0 12 0 H60 V140 H-4 Z" fill="${k.pc || '#86c5ff'}" opacity=".35"/>` +
      line('M-4 60 H24 a6 6 0 0 1 12 0 H84 a6 6 0 0 0 12 0 H124 M60 -4 V24 a6 6 0 0 0 0 12 V60 M-4 112 H24 a6 6 0 0 0 12 0 H84 a6 6 0 0 1 12 0 H124 M60 112 V140', '#8a7a6a', 2, 0.55),
    kintsugi: () => line('M12 34 L26 46 L22 60 L36 68 M26 46 L44 40 L52 24 M80 16 L84 32 L100 38 L104 56 M84 32 L72 44 M14 104 L28 116 L24 132 M28 116 L46 120 L58 136 M90 104 L100 118 L96 134 M100 118 L112 116', '#c89a1a', 3.2) +
      line('M12 34 L26 46 L22 60 L36 68 M80 16 L84 32 L100 38 L104 56 M14 104 L28 116 L24 132 M90 104 L100 118 L96 134', '#ffe9a0', 1.2, 0.9),

    // ── 운영진 전용 ──
    // 명찰: pt 글자, pc 색
    badge: (k) => `<rect x="32" y="110" width="56" height="21" rx="6" fill="${k.pc || '#6f4bb0'}"/><rect x="54" y="105" width="12" height="7" rx="2" fill="#9aa5ad"/>` +
      word(60, 125.5, k.pt || 'STAFF', 13, '#ffffff') + spark(88, 32, 7, k.pc || '#6f4bb0', 0.85) + spark(30, 44, 4, k.pc || '#6f4bb0', 0.6),
    headband: (k) => `<rect x="-4" y="40" width="128" height="17" fill="${k.pc || '#d8402c'}"/>` + hangul(60, 53.5, k.pt || '운영', 13, '#ffffff') +
      line('M-4 42.5 H124 M-4 54.5 H124', '#ffffff', 1, 0.5),
    notice: () => '<g transform="rotate(8 74 40)"><rect x="58" y="24" width="32" height="30" rx="2" fill="#fff8c4" stroke="#e0b84a" stroke-width="1.5"/>' +
      hangul(74, 43, '공지', 10, '#5e554d') + line('M63 49 H85', '#c9b26a', 1.5) + '<circle cx="74" cy="27" r="3" fill="#d8402c"/></g>' +
      line('M22 110 h20 M22 118 h14 M84 112 h16 M84 120 h12', '#9aa5ad', 2.2, 0.6),
    check: () => '<circle cx="78" cy="40" r="15" fill="#2f9a62"/>' + line('M71 40 l5 5 l10 -11', '#ffffff', 3.5) +
      line('M22 108 l3 3 l6 -6 M86 116 l3 3 l6 -6', '#2f9a62', 2.4, 0.7),
    tape: (k) => '<g transform="rotate(-18 60 40)"><rect x="-30" y="30" width="180" height="18" fill="#ffd34d"/>' + line('M-30 31.5 H150 M-30 46.5 H150', '#3b2f2a', 2) +
      word(60, 43.5, `${k.pt || 'TEST'} · ${k.pt || 'TEST'} · ${k.pt || 'TEST'}`, 10, '#3b2f2a', 'letter-spacing="1.5"') + '</g>',
    bug: () => {
      const bug = (x, y, r, c) => `<g transform="rotate(${r} ${x} ${y})">` + line(`M${x - 7} ${y - 3} h14 M${x - 7} ${y + 2} h14 M${x - 6} ${y + 7} h12`, '#3b2f2a', 1.6) +
        `<ellipse cx="${x}" cy="${y + 1}" rx="5" ry="7" fill="${c}"/><circle cx="${x}" cy="${y - 7}" r="3" fill="#3b2f2a"/>` + line(`M${x} ${y - 5} V${y + 8}`, '#3b2f2a', 1, 0.6) + '</g>';
      return bug(26, 46, -20, '#5d8a3d') + bug(98, 104, -30, '#5d8a3d') + bug(22, 114, 15, '#5d8a3d') +
        bug(60, 30, 0, '#5d8a3d') + '<circle cx="60" cy="30" r="13" fill="none" stroke="#d8402c" stroke-width="3.5"/>' + line('M51 21 L69 39', '#d8402c', 3.5);
    },
    progress: () => '<rect x="30" y="34" width="60" height="14" rx="7" fill="#ffffff" stroke="#2f9a62" stroke-width="2.5"/><rect x="33" y="37" width="54" height="8" rx="4" fill="#2f9a62"/>' +
      word(60, 28, '100%', 10, '#2f9a62') + line('M30 118 l3 3 l6 -6 M54 124 l3 3 l6 -6 M78 118 l3 3 l6 -6', '#2f9a62', 2.4, 0.8),
    rocket: () => '<path d="M60 12 C68 20 68 38 64 46 H56 C52 38 52 20 60 12 Z" fill="#ffffff" stroke="#3b2f2a" stroke-width="2"/>' +
      '<circle cx="60" cy="28" r="4" fill="#6fa8e0" stroke="#3b2f2a" stroke-width="1.5"/><path d="M56 40 L48 50 L56 46 Z M64 40 L72 50 L64 46 Z" fill="#e05a47"/>' +
      '<path d="M57 47 Q60 60 63 47 Z" fill="#ffc233"/>' + dots([[18, 122, 9], [30, 128, 7], [102, 122, 9], [90, 128, 7]], '#ffffff', 0.85) + spark(92, 40, 4, '#ffffff', 0.9),
    bolt: () => each([[80, 38, 1], [26, 106, 0.7], [98, 112, 0.6]], ([x, y, s]) =>
      `<path d="M${x - 4 * s} ${y - 14 * s} L${x + 7 * s} ${y - 14 * s} L${x + 1 * s} ${y - 3 * s} L${x + 8 * s} ${y - 3 * s} L${x - 7 * s} ${y + 16 * s} L${x - 2 * s} ${y + 2 * s} L${x - 9 * s} ${y + 2 * s} Z" fill="#ffc233" stroke="#c88a00" stroke-width="1.5" stroke-linejoin="round"/>`) +
      '<circle cx="34" cy="40" r="9" fill="#d8402c"/>' + word(34, 45, '!', 13, '#ffffff'),
    server: () => '<rect x="38" y="28" width="44" height="34" rx="4" fill="#5e6b78"/>' +
      each([31, 42, 53], (y) => `<rect x="41" y="${y}" width="38" height="8" rx="2" fill="#7d8a97"/>` + line(`M45 ${y + 4} h14`, '#4a5560', 1.6) +
        `<circle cx="70" cy="${y + 4}" r="1.8" fill="#7ee08a"/><circle cx="75" cy="${y + 4}" r="1.8" fill="${y === 42 ? '#ffd34d' : '#7ee08a'}"/>`) +
      line('M26 116 H50 M70 116 H94', '#5e6b78', 2.4, 0.5) + dots([[60, 116, 3]], '#7ee08a', 0.8),
    database: () => '<path d="M42 26 V54 A18 6 0 0 0 78 54 V26 Z" fill="#6fa8e0"/>' + line('M42 35 A18 6 0 0 0 78 35 M42 44 A18 6 0 0 0 78 44', '#ffffff', 2, 0.8) +
      '<ellipse cx="60" cy="26" rx="18" ry="6" fill="#a9cdf2"/>' +
      word(24, 116, '01', 9, '#6fa8e0', 'opacity=".6"') + word(96, 112, '10', 9, '#6fa8e0', 'opacity=".6"') + word(60, 130, '011', 9, '#6fa8e0', 'opacity=".6"'),
    branch: () => line('M12 50 H108', '#3f6fc0', 3) + line('M36 50 C44 50 46 30 58 30 H96', '#e0822f', 3) +
      each([[24, 50, '#3f6fc0'], [36, 50, '#3f6fc0'], [72, 50, '#3f6fc0'], [98, 50, '#3f6fc0'], [64, 30, '#e0822f'], [86, 30, '#e0822f']], ([x, y, c]) =>
        `<circle cx="${x}" cy="${y}" r="4.5" fill="#ffffff" stroke="${c}" stroke-width="2.5"/>`) +
      line('M20 120 H100', '#3f6fc0', 2.4, 0.5) + line('M44 120 C50 120 52 110 60 110 H80', '#e0822f', 2.4, 0.5),
    merge: () => line('M14 24 H40 C56 24 58 40 72 40 H108', '#7b55b8', 3) + line('M14 58 H40 C56 58 58 40 72 40', '#2f9a62', 3) +
      each([[24, 24, '#7b55b8'], [24, 58, '#2f9a62'], [72, 40, '#7b55b8'], [96, 40, '#7b55b8']], ([x, y, c]) =>
        `<circle cx="${x}" cy="${y}" r="4.5" fill="#ffffff" stroke="${c}" stroke-width="2.5"/>`) +
      line('M22 118 l8 8 l8 -8', '#2f9a62', 2.4, 0.6) + line('M82 118 l8 8 l8 -8', '#7b55b8', 2.4, 0.6),
    logs: () => '<rect x="30" y="24" width="60" height="38" rx="5" fill="#26313b"/><rect x="30" y="24" width="60" height="8" rx="4" fill="#3d4a57"/>' +
      dots([[36, 28, 1.6], [41, 28, 1.6], [46, 28, 1.6]], '#ff8a8a', 0.9) +
      each([[38, '#7ee08a', 30], [45, '#ffffff', 22], [52, '#7ee08a', 34], [57, '#ffd34d', 16]], ([y, c, w]) =>
        word(36, y + 2.5, '>', 6, c) + `<rect x="40" y="${y}" width="${w}" height="2.6" rx="1.3" fill="${c}" opacity=".85"/>`),
    circuit: () => line('M-4 30 H24 L34 20 H56 M-4 50 H18 L28 60 H44 M124 28 H96 L86 40 H66 M124 52 H100 L92 62 H80 M-4 118 H30 L40 128 H58 M124 116 H92 L84 126 H70', '#c89a1a', 2.4, 0.85) +
      each([[56, 20], [44, 60], [66, 40], [80, 62], [58, 128], [70, 126]], ([x, y]) => `<circle cx="${x}" cy="${y}" r="3.5" fill="#fff6e6" stroke="#c89a1a" stroke-width="2"/>`) +
      '<rect x="50" y="30" width="20" height="14" rx="2" fill="#3d4a57"/>' + line('M53 30 v-4 M60 30 v-4 M67 30 v-4 M53 44 v4 M60 44 v4 M67 44 v4', '#c89a1a', 1.6),
    pixel: () => {
      const HEART = ['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'];
      const px = (rows, x0, y0, s, c) => rows.map((row, j) => [...row].map((ch, i) => (ch === 'X' ? `<rect x="${x0 + i * s}" y="${y0 + j * s}" width="${s}" height="${s}" fill="${c}"/>` : '')).join('')).join('');
      return px(HEART, 62, 22, 4, '#e0455a') + px(['X.', '.X'], 30, 36, 4, '#3f8fd0') + px(['.X', 'X.'], 24, 52, 4, '#ffc233') +
        each([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], (i) => `<rect x="${-4 + i * 8}" y="${128 - (i % 3) * 4}" width="8" height="20" fill="${i % 2 ? '#5fae6a' : '#7cc46a'}"/>`);
    },
    keyboard: () => '<rect x="20" y="108" width="80" height="28" rx="5" fill="#8e99a4"/>' +
      each([0, 1, 2], (r) => each(Array.from({ length: 8 - r }, (_, i) => i), (i) =>
        `<rect x="${24 + r * 4 + i * 9}" y="${111 + r * 8}" width="7" height="6" rx="1.5" fill="#ffffff"/>`)) +
      '<rect x="42" y="135" width="36" height="5" rx="2" fill="#ffffff"/>',
    approve: () => '<g transform="rotate(-12 70 40)"><rect x="48" y="27" width="44" height="26" rx="4" fill="none" stroke="#d8402c" stroke-width="3" opacity=".9"/>' +
      hangul(70, 46, '승인', 15, '#d8402c') + '</g>',
    nightsky: () => '<path d="M-4 -4 H124 V44 Q60 60 -4 44 Z" fill="#2c3566"/>' +
      '<path d="M84 14 a10 10 0 1 0 10 14 a8 8 0 1 1 -10 -14 Z" fill="#ffe27a"/>' +
      each([[34, 24, 3], [48, 36, 2.2], [62, 18, 2.6], [24, 38, 2]], ([x, y, r]) => spark(x, y, r, '#ffffff', 0.95)) +
      '<rect x="88" y="108" width="14" height="16" rx="2" fill="#ffffff" stroke="#8a5a36" stroke-width="1.6"/>' + line('M102 112 q5 0 5 4 q0 4 -5 4', '#8a5a36', 1.6) +
      line('M92 104 q-2 -3 0 -6 M98 104 q-2 -3 0 -6', '#9aa5ad', 1.4, 0.8),
    coffee: () => heart(60, 34, 1.3, '#fff6e6', 0.95) + line('M60 52 V44', '#fff6e6', 1.6, 0.7) +
      each([[24, 110, 30], [98, 104, -20], [40, 126, 70], [84, 126, -60], [30, 64, 10], [92, 62, -30]], ([x, y, r]) =>
        `<g transform="rotate(${r} ${x} ${y})"><ellipse cx="${x}" cy="${y}" rx="4.5" ry="6.5" fill="#6b4a32"/>${line(`M${x} ${y - 5} q-2 5 0 10`, '#3b2f2a', 1.2)}</g>`),
    key: () => '<g transform="rotate(15 60 40)"><circle cx="36" cy="38" r="10" fill="none" stroke="#e0b030" stroke-width="5"/>' +
      '<rect x="45" y="35.5" width="44" height="5" rx="2" fill="#e0b030"/><rect x="76" y="40" width="5" height="8" fill="#e0b030"/><rect x="84" y="40" width="5" height="6" fill="#e0b030"/></g>' +
      spark(26, 112, 4, '#e0b030', 0.8) + spark(96, 110, 5, '#e0b030', 0.8),
    shield: () => '<path d="M60 20 L80 27 V42 C80 54 71 61 60 65 C49 61 40 54 40 42 V27 Z" fill="#3f6fc0" stroke="#2a4f8f" stroke-width="2"/>' +
      line('M51 42 l6 6 l12 -12', '#ffffff', 3.5) + line('M20 112 h10 M90 112 h10 M25 107 v10 M95 107 v10', '#3f6fc0', 2, 0.4),
    megaphone: () => '<path d="M30 34 L50 25 V51 L30 42 Z" fill="#e05a47" stroke="#a83a2c" stroke-width="1.6" stroke-linejoin="round"/><rect x="24" y="33" width="7" height="10" rx="2" fill="#e05a47"/>' +
      line('M56 30 q5 8 0 16 M62 25 q9 13 0 26', '#e05a47', 2.6, 0.8) + line('M28 44 l4 10', '#a83a2c', 3),
    hazard: () => '<rect x="-4" y="118" width="128" height="24" fill="#ffd34d"/>' +
      each([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], (i) => `<path d="M${-10 + i * 16} 142 L${-2 + i * 16} 118 H${6 + i * 16} L${-2 + i * 16} 142 Z" fill="#3b2f2a"/>`),
    blessing: () => each([[34, 0.14], [24, 0.2], [14, 0.3]], ([r, op]) => `<circle cx="60" cy="16" r="${r}" fill="#ffd34d" opacity="${op}"/>`) +
      spark(28, 48, 4, '#ffd34d', 0.8) + spark(94, 52, 4, '#ffd34d', 0.8),
    tuxedo: () => '<path d="M-4 104 H40 L56 140 H-4 Z M124 104 H80 L64 140 H124 Z" fill="#2f3640"/>' + dots([[60, 128, 1.8], [60, 136, 1.8]], '#2f3640', 1),
  };

  const hats = {
    // ── 일반 계란 ──
    sprout: '<path class="ln" d="M60 8 V-6"/>' +
      '<path class="ink" d="M60 -4 C52 -14 40 -10 40 -4 C46 2 56 0 60 -4 Z" fill="#7cc46a"/><path class="ink" d="M60 -6 C66 -18 80 -16 80 -8 C74 -2 64 -2 60 -6 Z" fill="#8fd16e"/>',
    feelers: '<path class="ln" d="M52 9 C48 -4 42 -10 36 -12 M68 9 C72 -4 78 -10 84 -12"/>' +
      '<circle class="ink" cx="35" cy="-12" r="4.5" fill="#3b2f2a"/><circle class="ink" cx="85" cy="-12" r="4.5" fill="#3b2f2a"/>',
    tangleaf: '<path class="ln" d="M60 8 L61 -2"/><path class="ink" d="M61 -2 C64 -14 80 -14 84 -8 C78 -2 68 0 61 -2 Z" fill="#4f9a5a"/>',
    pandaears: '<circle class="ink" cx="31" cy="16" r="10" fill="#3b2f2a"/><circle class="ink" cx="89" cy="16" r="10" fill="#3b2f2a"/>',
    bearears: (k) => `<circle class="ink" cx="31" cy="16" r="10" fill="${k.hc || '#c8925e'}"/><circle cx="31" cy="16" r="5" fill="#f6d5b0"/>` +
      `<circle class="ink" cx="89" cy="16" r="10" fill="${k.hc || '#c8925e'}"/><circle cx="89" cy="16" r="5" fill="#f6d5b0"/>`,
    catears: (k) => `<path class="ink" d="M30 30 L28 -2 L52 12 Z" fill="${k.hc || '#f0a860'}"/><path d="M33 24 L32 6 L46 14 Z" fill="#f7b9c8"/>` +
      `<path class="ink" d="M90 30 L92 -2 L68 12 Z" fill="${k.hc || '#f0a860'}"/><path d="M87 24 L88 6 L74 14 Z" fill="#f7b9c8"/>`,
    bunnyears: '<ellipse class="ink" cx="46" cy="-4" rx="8" ry="21" fill="#fffdf6" transform="rotate(-12 46 -4)"/><ellipse cx="46" cy="-3" rx="3.8" ry="14" fill="#f7b9c8" transform="rotate(-12 46 -3)"/>' +
      '<ellipse class="ink" cx="74" cy="-4" rx="8" ry="21" fill="#fffdf6" transform="rotate(12 74 -4)"/><ellipse cx="74" cy="-3" rx="3.8" ry="14" fill="#f7b9c8" transform="rotate(12 74 -3)"/>',
    halo: '<ellipse cx="60" cy="-12" rx="22" ry="6" fill="none" stroke="#fff3b0" stroke-width="10" opacity=".6"/>' +
      '<ellipse cx="60" cy="-12" rx="22" ry="6" fill="none" stroke="#ffc233" stroke-width="4.5"/>',
    balloons: '<path class="ln thin" d="M60 6 C58 -2 50 -4 45 -6 M60 6 C62 -2 70 -6 76 -8"/>' +
      '<ellipse class="ink" cx="44" cy="-16" rx="8" ry="10" fill="#e76f9a"/><path class="ink" d="M42 -5 h4 l-2 -2 Z" fill="#e76f9a"/>' +
      '<ellipse class="ink" cx="77" cy="-18" rx="8" ry="10" fill="#6fa8e0"/><path class="ink" d="M75 -7 h4 l-2 -2 Z" fill="#6fa8e0"/>' +
      '<ellipse cx="41" cy="-20" rx="2.2" ry="3" fill="#fff" opacity=".7"/><ellipse cx="74" cy="-22" rx="2.2" ry="3" fill="#fff" opacity=".7"/>',
    cherry: '<circle class="ink" cx="60" cy="0" r="7" fill="#e0392b"/><path class="ln thin" d="M60 -6 C60 -12 64 -18 70 -20"/>' +
      '<ellipse cx="57" cy="-2" rx="2" ry="1.4" fill="#fff" opacity=".8"/>',
    chef: '<path class="ink" d="M38 14 C24 12 24 -8 38 -8 C38 -24 60 -26 64 -14 C72 -26 96 -18 86 -4 C98 0 94 16 82 14 Z" fill="#ffffff"/>' +
      '<rect class="ink" x="38" y="8" width="44" height="12" rx="3" fill="#ffffff"/>' + '<path class="ln thin" d="M50 -2 V8 M60 -4 V8 M70 -2 V8"/>',
    strawhat: '<ellipse class="ink" cx="60" cy="15" rx="40" ry="8" fill="#e9c46a"/>' +
      '<path class="ink" d="M40 15 C40 -10 80 -10 80 15 Z" fill="#e9c46a"/>' +
      '<path d="M41 6 Q60 10 79 6 L80 12 Q60 16 40 12 Z" fill="#d8402c"/>' +
      '<path d="M24 15 h6 M32 19 h6 M82 19 h6 M90 15 h6" stroke="#c99a4f" stroke-width="2" stroke-linecap="round"/>',
    plume: (k) => '<path class="ink" d="M40 14 Q60 4 80 14 L80 20 Q60 10 40 20 Z" fill="#c8413a"/>' +
      `<path class="ink" d="M62 10 C52 -8 58 -26 76 -26 C80 -12 74 0 62 10 Z" fill="${k.hc || '#3f5f9a'}"/>` +
      '<path d="M62 10 C66 -4 70 -14 76 -26" stroke="#ffffff" stroke-width="1.6" fill="none" opacity=".8"/>' +
      '<path d="M66 -12 L58 -16 M68 -4 L60 -7 M64 -20 L72 -18" stroke="#ffffff" stroke-width="1.2" opacity=".5"/>',
    dish: '<ellipse class="ink" cx="60" cy="9" rx="10" ry="4" fill="#9aa5ad"/><path class="ln" d="M60 8 L60 -2"/>' +
      '<g transform="rotate(-25 60 -6)"><path class="ink" d="M38 -6 A22 12 0 0 0 82 -6 Z" fill="#dfe6ea"/>' +
      '<path class="ln thin" d="M60 -6 L60 -24"/><circle class="ink" cx="60" cy="-26" r="3" fill="#e05a47"/></g>',
    explorer: '<path class="ink" d="M34 14 C34 -16 86 -16 86 14 Z" fill="#e3cc94"/><path d="M35 7 H85" stroke="#8a5a36" stroke-width="4"/>' +
      '<path class="ink" d="M22 16 Q60 4 98 16 Q98 22 60 20 Q22 22 22 16 Z" fill="#d9c08a"/>',
    beanie: (k) => `<path class="ink" d="M30 20 C28 -14 92 -14 90 20 Z" fill="${k.hc || '#e05a47'}"/>` +
      '<circle class="ink" cx="60" cy="-12" r="8" fill="#fff6e6"/>' +
      `<rect class="ink" x="27" y="12" width="66" height="12" rx="5" fill="${k.hc || '#e05a47'}"/>` +
      '<path d="M35 14 V22 M43 14 V22 M51 14 V22 M59 14 V22 M67 14 V22 M75 14 V22 M83 14 V22" stroke="#000" stroke-width="1.6" opacity=".18"/>',
    tophat: '<rect class="ink" x="40" y="-24" width="40" height="38" rx="3" fill="#2f3640"/><rect x="41" y="2" width="38" height="7" fill="#c8413a"/>' +
      '<ellipse class="ink" cx="60" cy="14" rx="34" ry="6" fill="#2f3640"/>' + spark(88, -18, 5, '#ffd34d'),
    graduation: '<path class="ink" d="M40 2 V14 C52 20 68 20 80 14 V2 L60 8 Z" fill="#2f3640"/>' +
      '<path class="ink" d="M60 -16 L100 -4 L60 8 L20 -4 Z" fill="#2f3640"/>' +
      '<path d="M60 -4 L90 0 V14" stroke="#ffd34d" stroke-width="2" fill="none"/><path d="M87 14 h6 l-1 8 h-4 Z" fill="#ffd34d"/>',

    // ── 운영진 전용 ──
    hardhat: '<path class="ink" d="M30 20 C30 -12 90 -12 90 20 Z" fill="#ffc233"/><path d="M60 -4 V20" stroke="#e0a000" stroke-width="5"/>' +
      '<rect class="ink" x="24" y="16" width="72" height="8" rx="4" fill="#ffc233"/>',
    wizard: (k) => `<path class="ink" d="M38 14 L64 -24 L84 14 Z" fill="${k.hc || '#5b3fa0'}"/>` +
      `<ellipse class="ink" cx="60" cy="14" rx="32" ry="6" fill="${k.hc || '#5b3fa0'}"/>` +
      spark(58, -2, 4.5, '#ffd34d') + spark(70, -12, 3.5, '#ffd34d') + spark(52, 8, 3, '#ffffff'),
    horns: '<path class="ink" d="M40 16 C34 4 34 -6 38 -12 C42 -2 48 6 50 12 Z" fill="#e05a47"/>' +
      '<path class="ink" d="M80 16 C86 4 86 -6 82 -12 C78 -2 72 6 70 12 Z" fill="#e05a47"/>',
    tiara: (k) => '<path class="ink" d="M38 14 L42 2 L50 10 L60 -6 L70 10 L78 2 L82 14 Z" fill="#eef0f6"/>' +
      `<circle class="ink" cx="60" cy="4" r="4.5" fill="${k.hc || '#e0455a'}"/>` + dots([[42, 2, 2], [78, 2, 2]], k.hc || '#e0455a', 1),
    // 아래는 얼굴·몸통 높이에 그리는 것 (faceHats)
    bowtie: '<path class="ink" d="M60 116 L44 108 V126 Z" fill="#d8402c"/><path class="ink" d="M60 116 L76 108 V126 Z" fill="#d8402c"/>' +
      '<circle class="ink" cx="60" cy="116" r="4" fill="#b8302a"/>',
    wings: '<path class="ink" d="M10 78 C-6 64 -12 86 -6 96 C-10 106 -2 114 10 104 Z" fill="#ffffff"/>' +
      '<path class="ink" d="M110 78 C126 64 132 86 126 96 C130 106 122 114 110 104 Z" fill="#ffffff"/>' +
      '<path class="ln thin" d="M8 86 L-2 88 M8 94 L-4 98 M112 86 L122 88 M112 94 L124 98"/>',
    sunglasses: '<path class="ink" d="M33 78 H57 V85 C57 91 52 94 45 94 C38 94 33 91 33 85 Z" fill="#26313b"/>' +
      '<path class="ink" d="M63 78 H87 V85 C87 91 82 94 75 94 C68 94 63 91 63 85 Z" fill="#26313b"/>' +
      '<path class="ln" d="M57 81 H63 M33 80 L24 76 M87 80 L96 76"/>' +
      '<path d="M37 83 L43 80 M67 83 L73 80" stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity=".7"/>',
    headset: (k) => `<path d="M12 80 C6 -30 114 -30 108 80" stroke="${k.hc || '#3b2f2a'}" stroke-width="5" fill="none"/>` +
      `<rect class="ink" x="2" y="70" width="14" height="24" rx="5" fill="${k.hc || '#3b2f2a'}"/><rect class="ink" x="104" y="70" width="14" height="24" rx="5" fill="${k.hc || '#3b2f2a'}"/>` +
      `<path d="M10 92 C14 110 30 112 42 106" stroke="${k.hc || '#3b2f2a'}" stroke-width="3" fill="none" stroke-linecap="round"/>` +
      '<circle class="ink" cx="44" cy="105" r="4" fill="#e05a47"/>',
  };

  window.Art.extend({
    patterns,
    hats,
    faceHats: ['bowtie', 'wings', 'sunglasses', 'headset'],
    // 병아리에게 씌울 때: 숫자는 위아래로만 옮기고, 글자는 그대로 쓰는 변형(작게 줄여 몸에 맞춘다)
    hatDy: { bowtie: -16, sunglasses: -18, wings: 'translate(15 8) scale(.75)', headset: 'translate(18 35) scale(.69)' },
  });
})();

// ── v3.5에 더한 무늬와 모자 ──
(() => {
  'use strict';

  const { dots, spark, flake } = window.Art.kit;
  const each = (list, f) => list.map(f).join('');
  const line = (d, color, w = 2.5, op = 1) =>
    `<path d="${d}" stroke="${color}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="${op}"/>`;
  const AROUND = [[28, 40], [86, 32], [98, 100], [22, 106], [60, 126]];
  const star5 = (x, y, r, color, op = 1) => {
    const pts = Array.from({ length: 10 }, (_, i) => {
      const a = (Math.PI / 5) * i - Math.PI / 2;
      const d = i % 2 ? r * 0.5 : r;
      return `${(x + d * Math.cos(a)).toFixed(1)} ${(y + d * Math.sin(a)).toFixed(1)}`;
    });
    return `<path d="M${pts.join(' L')} Z" fill="${color}" opacity="${op}"/>`;
  };

  const patterns = {
    // 체크판
    checker: (k) => each(Array.from({ length: 99 }, (_, n) => [n % 9, Math.floor(n / 9)]).filter(([x, y]) => (x + y) % 2), ([x, y]) =>
      `<rect x="${-4 + x * 14}" y="${-4 + y * 14}" width="14" height="14" fill="${k.pc || '#6fa8e0'}" opacity=".25"/>`),
    // 지그재그 띠
    zigzag: (k) => each([24, 48, 118], (y) => line(`M-4 ${y} ${Array.from({ length: 7 }, (_, i) => `l9 -8 l9 8`).join(' ')}`, k.pc || '#f2a900', 4, 0.75)),
    // 벚꽃
    petals: () => each(AROUND, ([x, y]) => each([0, 72, 144, 216, 288], (a) =>
      `<circle cx="${(x + 5.5 * Math.cos((a * Math.PI) / 180)).toFixed(1)}" cy="${(y + 5.5 * Math.sin((a * Math.PI) / 180)).toFixed(1)}" r="4.2" fill="#f7a8c4" opacity=".9"/>`) +
      `<circle cx="${x}" cy="${y}" r="2.2" fill="#fff2a8"/>`) +
      each([[52, 54, 30], [70, 22, -20], [104, 70, 50], [14, 76, -40], [80, 128, 10]], ([x, y, r]) =>
        `<ellipse cx="${x}" cy="${y}" rx="4" ry="2.4" fill="#f7a8c4" opacity=".75" transform="rotate(${r} ${x} ${y})"/>`),
    // 단풍
    maple: () => each(AROUND.map(([x, y], i) => [x, y, ['#e2702f', '#d8402c', '#f2a900', '#c8413a', '#e2952f'][i]]), ([x, y, c]) =>
      star5(x, y, 9, c, 0.85) + line(`M${x} ${y + 3} l2 8`, '#8a5a36', 1.6, 0.8)),
    // 눈송이
    snow: () => each([[28, 38, 7], [86, 30, 6], [100, 96, 7], [20, 104, 6], [62, 126, 6], [56, 56, 4]], ([x, y, r]) => flake(x, y, r, '#ffffff')) +
      dots([[44, 24, 2], [74, 52, 1.8], [12, 70, 2], [106, 66, 1.8], [40, 122, 2], [88, 118, 2]], '#ffffff', 0.9),
    // 딸기 씨
    seeds: () => each([[30, 34], [52, 22], [74, 28], [94, 44], [22, 60], [100, 72], [18, 92], [104, 98], [30, 118], [50, 128], [72, 128], [92, 118], [60, 48], [40, 46], [82, 50]], ([x, y]) =>
      `<path d="M${x} ${y - 3} Q${x + 2.4} ${y} ${x} ${y + 3} Q${x - 2.4} ${y} ${x} ${y - 3} Z" fill="#ffe27a"/>`),
    // 치즈 구멍
    cheese: () => each([[30, 40, 7], [84, 30, 5], [98, 92, 8], [20, 100, 6], [60, 126, 7], [58, 52, 4], [104, 60, 4], [38, 120, 3.5]], ([x, y, r]) =>
      `<circle cx="${x}" cy="${y}" r="${r}" fill="#e0a812" opacity=".55"/><circle cx="${x + r * 0.25}" cy="${y + r * 0.25}" r="${r * 0.7}" fill="#c98f0a" opacity=".35"/>`),
    // 노을
    sunset: () => '<rect x="-4" y="-4" width="128" height="34" fill="#ff9a5a" opacity=".55"/><rect x="-4" y="30" width="128" height="22" fill="#ff7aa2" opacity=".35"/>' +
      '<rect x="-4" y="112" width="128" height="32" fill="#7b55b8" opacity=".25"/><circle cx="60" cy="30" r="12" fill="#ffd34d" opacity=".9"/>',
    // 빗줄기
    rain: () => each([[24, 30], [44, 18], [70, 26], [92, 40], [16, 64], [104, 70], [22, 110], [44, 122], [78, 124], [100, 108], [60, 54]], ([x, y]) =>
      line(`M${x} ${y} l-4 9`, '#6fa8e0', 2.4, 0.8)),
    // 고양이 발자국
    paw: (k) => each([[28, 42, -20], [88, 34, 15], [98, 104, 25], [22, 110, -30], [60, 128, 0]], ([x, y, r]) =>
      `<g transform="rotate(${r} ${x} ${y})" fill="${k.pc || '#8a5a36'}" opacity=".55"><ellipse cx="${x}" cy="${y + 2}" rx="5" ry="4"/>` +
      `<circle cx="${x - 5}" cy="${y - 4}" r="2"/><circle cx="${x}" cy="${y - 6}" r="2"/><circle cx="${x + 5}" cy="${y - 4}" r="2"/></g>`),
    // 바다
    ocean: () => '<path d="M-4 110 q10 -8 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 V144 H-4 Z" fill="#4f9fd0" opacity=".55"/>' +
      '<path d="M-4 124 q10 -8 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 V144 H-4 Z" fill="#2f6f9a" opacity=".55"/>' +
      `<circle cx="30" cy="40" r="3" fill="none" stroke="#4f9fd0" stroke-width="1.6"/><circle cx="36" cy="30" r="2" fill="none" stroke="#4f9fd0" stroke-width="1.4"/>` +
      '<path d="M84 36 q8 -6 14 0 q-6 6 -14 0 Z M98 36 l5 -4 v8 Z" fill="#f08a24" opacity=".85"/>',
    // 궤도
    orbit: () => '<ellipse cx="60" cy="72" rx="58" ry="16" fill="none" stroke="#7b55b8" stroke-width="1.8" opacity=".5" transform="rotate(-20 60 72)"/>' +
      '<ellipse cx="60" cy="72" rx="58" ry="16" fill="none" stroke="#3f8fd0" stroke-width="1.8" opacity=".5" transform="rotate(25 60 72)"/>' +
      dots([[10, 92, 4], [108, 50, 3.5], [26, 30, 3], [100, 112, 3]], '#7b55b8', 0.8) + spark(80, 24, 5, '#ffd34d', 1),
    // 산
    mountains: () => '<path d="M-4 144 L20 104 L40 126 L62 96 L86 124 L104 106 L128 144 Z" fill="#6f8f6a" opacity=".6"/>' +
      '<path d="M56 105 L62 96 L68 105 Z M16 111 L20 104 L24 111 Z" fill="#ffffff" opacity=".9"/>' + line('M-4 30 q15 -6 30 0 t30 0', '#9aa5ad', 2, 0.5),
    // 반창고 투성이
    bandaids: () => each([[30, 40, -30], [88, 34, 25], [98, 106, -15], [24, 112, 35]], ([x, y, r]) =>
      `<g transform="rotate(${r} ${x} ${y})"><rect x="${x - 15}" y="${y - 5}" width="30" height="10" rx="5" fill="#f2c79a" stroke="#3b2f2a" stroke-width="1.5"/>` +
      `<rect x="${x - 5}" y="${y - 5}" width="10" height="10" fill="#e9b886"/></g>`),
  };

  const hats = {
    pirate: '<path class="ink" d="M22 16 C28 -8 92 -8 98 16 Q60 6 22 16 Z" fill="#2f3640"/>' +
      '<circle cx="60" cy="2" r="4.5" fill="#fff6e6"/><path d="M53 9 L67 14 M67 9 L53 14" stroke="#fff6e6" stroke-width="2" stroke-linecap="round"/>',
    santa: '<path class="ink" d="M32 16 C34 -6 62 -20 88 -10 C80 -4 82 6 88 16 Z" fill="#d8402c"/>' +
      '<rect class="ink" x="28" y="11" width="64" height="11" rx="5.5" fill="#ffffff"/><circle class="ink" cx="89" cy="-11" r="6" fill="#ffffff"/>',
    flowerpin: (k) => each([0, 72, 144, 216, 288], (a) =>
      `<circle class="ink" cx="${(82 + 6 * Math.cos((a * Math.PI) / 180)).toFixed(1)}" cy="${(14 + 6 * Math.sin((a * Math.PI) / 180)).toFixed(1)}" r="4.6" fill="${k.hc || '#f58cb4'}"/>`) +
      '<circle class="ink" cx="82" cy="14" r="3" fill="#ffd34d"/>',
    laurel: (k) => each([[36, 18, -60], [40, 10, -40], [46, 4, -25], [53, 0, -10], [84, 18, 60], [80, 10, 40], [74, 4, 25], [67, 0, 10]], ([x, y, r]) =>
      `<ellipse class="ink" cx="${x}" cy="${y}" rx="6" ry="3" fill="${k.hc || '#6aa84f'}" transform="rotate(${r} ${x} ${y})"/>`),
  };

  window.Art.extend({ patterns, hats });
})();
