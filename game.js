// 계란이의 모험 — 게임 엔진
(() => {
  'use strict';

  const S = window.STORY;
  const START_TEMP = 4;     // 냉장고 안 온도
  const READY_TEMP = 20;    // 꼬꼬엄마가 반기는 온기
  const HATCH_TEMP = 37.5;  // 부화 온도 (온기 막대의 끝)
  const MAX_CRACK = 3;      // 금이 이만큼 가면 와장창
  const SEEN_KEY = 'egg-adventure:endings';
  const LETTERS = ['A', 'B', 'C'];
  const KIND = { true: '진엔딩', happy: '해피 엔딩', normal: '노멀 엔딩', hidden: '히든 엔딩', bad: '배드 엔딩' };
  const endIds = Object.keys(S.endings);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);
  const pad = (n) => String(n).padStart(2, '0');

  let st = fresh();
  let typing = null;
  let skip = () => {};

  function fresh() {
    return { screen: 'title', node: S.first, t: START_TEMP, c: 0, steps: 0, say: null, fx: null, hist: [] };
  }

  // 엔딩 도감은 이 브라우저에만 저장된다.
  function loadSeen() {
    try { return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || '[]')); } catch (e) { return new Set(); }
  }
  function saveSeen() {
    try { localStorage.setItem(SEEN_KEY, JSON.stringify([...seen])); } catch (e) { /* 저장 불가: 이번 방문 동안만 기억 */ }
  }
  const seen = loadSeen();

  // ---------- 계란이 그림 ----------
  const EGG = 'M60 6 C90 6 112 56 112 88 C112 118 89 136 60 136 C31 136 8 118 8 88 C8 56 30 6 60 6 Z';
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
  const BLUSH = '<ellipse class="blush" cx="33" cy="96" rx="7" ry="4"/><ellipse class="blush" cx="87" cy="96" rx="7" ry="4"/>';
  const CHICK =
    '<path class="tuft" d="M54 38 Q56 24 62 32 Q66 22 70 36"/>' +
    '<circle class="chick" cx="60" cy="72" r="36"/>' +
    '<circle cx="48" cy="66" r="4"/><circle cx="72" cy="66" r="4"/>' +
    '<path class="beak" d="M53 76 L67 76 L60 86 Z"/>' +
    '<path class="shell" d="M12 92 L24 82 L36 95 L48 82 L60 95 L72 82 L84 95 L96 82 L108 92 C110 120 88 136 60 136 C32 136 10 120 12 92 Z"/>';

  function eggSVG(mood, cracks) {
    if (mood === 'chick') {
      return `<svg viewBox="0 0 120 140" role="img" aria-label="껍질을 깨고 나온 병아리">${CHICK}</svg>`;
    }
    const n = mood === 'broken' ? MAX_CRACK : cracks;
    const lines = CRACKS.slice(0, n).map((d) => `<path class="crack" d="${d}"/>`).join('');
    return `<svg viewBox="0 0 120 140" role="img" aria-label="계란이"><path class="shell" d="${EGG}"/>${lines}` +
      `<g class="face">${FACES[mood] || FACES.calm}</g>${BLUSH}</svg>`;
  }

  // ---------- 화면 ----------
  function show(screen) {
    for (const id of ['title', 'play', 'end']) $(id).hidden = id !== screen;
    $('dex').hidden = screen === 'play';
    $('hud').hidden = screen === 'title';
    st.screen = screen;
  }

  function hud() {
    $('tempFill').style.width = Math.min(st.t / HATCH_TEMP, 1) * 100 + '%';
    $('tempVal').textContent = st.t.toFixed(1) + '℃';
    $('hud').classList.toggle('warm', st.t >= READY_TEMP);
    const cracks = $('cracks');
    cracks.innerHTML = Array.from({ length: MAX_CRACK }, (_, i) => `<i class="${i < st.c ? 'on' : ''}"></i>`).join('');
    cracks.setAttribute('aria-label', `껍질의 금 ${st.c}개, 최대 ${MAX_CRACK}개`);
  }

  function fxChips(fx) {
    if (!fx) return '';
    let out = '';
    if (fx.t) out += `<span class="chip warm">온기 ${fx.t > 0 ? '+' : ''}${fx.t}℃</span>`;
    if (fx.c) out += `<span class="chip crack">금 +${fx.c}</span>`;
    return out;
  }

  function setSay(el) {
    el.hidden = !st.say;
    el.innerHTML = st.say ? `<span>${esc(st.say)}</span>${fxChips(st.fx)}` : '';
  }

  function hitEgg(el) {
    if (!st.fx || !st.fx.c || reduce) return;
    el.classList.remove('hit');
    void el.offsetWidth; // 애니메이션 다시 시작
    el.classList.add('hit');
  }

  function renderScene() {
    const sc = S.scenes[st.node];
    show('play');
    hud();
    $('chap').textContent = `${sc.ch}장`;
    $('place').textContent = sc.place;
    const egg = $('egg');
    egg.innerHTML = eggSVG(sc.mood, st.c);
    hitEgg(egg);
    setSay($('say'));
    $('undo').disabled = !st.hist.length;
    $('steps').textContent = `지금까지 고른 선택지 ${st.steps}개`;
    typeText($('text'), sc.text, () => renderChoices(sc));
  }

  // 글자가 한 자씩 나타난다. 나머지 글자는 투명하게 미리 깔아 두어 줄바꿈이 흔들리지 않는다.
  function typeText(el, paras, done) {
    clearInterval(typing);
    typing = null;
    $('choices').innerHTML = '';
    el.innerHTML = paras.map((p) => `<p><span class="shown"></span><span class="ghost">${esc(p)}</span></p>`).join('');
    const rows = [...el.querySelectorAll('p')].map((p) => [p.firstChild, p.lastChild]);
    const finish = () => {
      clearInterval(typing);
      typing = null;
      rows.forEach(([shown, ghost], k) => { shown.textContent = paras[k]; ghost.textContent = ''; });
      done();
    };
    skip = finish;
    if (reduce) return finish();
    let i = 0;
    let j = 0;
    typing = setInterval(() => {
      if (i >= paras.length) return finish();
      j += 2;
      rows[i][0].textContent = paras[i].slice(0, j);
      rows[i][1].textContent = paras[i].slice(j);
      if (j >= paras[i].length) { i += 1; j = 0; }
    }, 22);
  }

  function renderChoices(sc) {
    const box = $('choices');
    box.innerHTML = sc.choices.map((ch, i) =>
      `<button type="button" class="choice" data-i="${i}"><span class="key">${LETTERS[i]}</span><span class="lbl">${esc(ch.label)}</span></button>`
    ).join('');
  }

  function renderEnding() {
    const e = S.endings[st.node];
    const isNew = !seen.has(st.node);
    seen.add(st.node);
    saveSeen();
    show('end');
    hud();
    $('end').dataset.kind = e.kind;
    $('endKind').textContent = KIND[e.kind];
    $('endNo').textContent = `엔딩 ${pad(endIds.indexOf(st.node) + 1)} / ${pad(endIds.length)}`;
    $('endNew').hidden = !isNew;
    $('endTitle').textContent = e.title;
    const egg = $('endEgg');
    egg.innerHTML = eggSVG(e.mood, st.c);
    hitEgg(egg);
    setSay($('endSay'));
    $('endText').innerHTML = e.text.map((p) => `<p>${esc(p)}</p>`).join('');
    $('endStats').innerHTML =
      `<div><dt>최종 온기</dt><dd>${st.t.toFixed(1)}℃</dd></div>` +
      `<div><dt>껍질의 금</dt><dd>${st.c} / ${MAX_CRACK}</dd></div>` +
      `<div><dt>고른 선택지</dt><dd>${st.steps}개</dd></div>`;
    $('endUndo').disabled = !st.hist.length;
    renderDex();
  }

  function renderDex() {
    const got = endIds.filter((id) => seen.has(id)).length;
    $('dexCount').textContent = `${got} / ${endIds.length}`;
    $('dexGrid').innerHTML = endIds.map((id, i) => {
      const e = S.endings[id];
      if (!seen.has(id)) return `<li><span class="no">${pad(i + 1)}</span><span class="nm">???</span></li>`;
      return `<li class="got" data-kind="${e.kind}"><span class="no">${pad(i + 1)}</span>` +
        `<span class="nm">${esc(e.title)}</span><span class="kd">${KIND[e.kind]}</span></li>`;
    }).join('');
  }

  // ---------- 진행 ----------
  function snapshot() {
    const { hist, ...rest } = st;
    return JSON.parse(JSON.stringify(rest));
  }

  function go(id) {
    st.node = id;
    if (S.endings[id]) renderEnding();
    else renderScene();
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  }

  function choose(i) {
    const ch = st.screen === 'play' && S.scenes[st.node].choices[i];
    if (!ch || typing) return;
    st.hist.push(snapshot());
    const fx = ch.fx || {};
    st.t = Math.max(0, st.t + (fx.t || 0));
    st.c = Math.min(MAX_CRACK, st.c + (fx.c || 0));
    st.steps += 1;
    st.say = ch.say || null;
    st.fx = ch.fx || null;
    let next = st.c >= MAX_CRACK ? 'e_crash' : ch.to;
    while (S.scenes[next] && S.scenes[next].branch) next = S.scenes[next].branch(st);
    go(next);
  }

  function undo() {
    const prev = st.hist.pop();
    if (!prev) return;
    st = { ...prev, hist: st.hist };
    go(st.node);
  }

  function start() {
    st = fresh();
    go(S.first);
  }

  function toTitle() {
    st = fresh();
    show('title');
    hud();
    renderDex();
  }

  // ---------- 입력 ----------
  $('titleEgg').innerHTML = eggSVG('happy', 0);
  $('startBtn').addEventListener('click', start);
  $('undo').addEventListener('click', undo);
  $('restart').addEventListener('click', toTitle);
  $('endUndo').addEventListener('click', undo);
  $('endRestart').addEventListener('click', start);
  $('text').addEventListener('click', () => { if (typing) skip(); });
  $('choices').addEventListener('click', (ev) => {
    const b = ev.target.closest('.choice');
    if (b) choose(Number(b.dataset.i));
  });
  document.addEventListener('keydown', (ev) => {
    if (st.screen !== 'play' || ev.altKey || ev.ctrlKey || ev.metaKey) return;
    const k = ev.key.toLowerCase();
    if (typing && (k === ' ' || k === 'enter')) { ev.preventDefault(); skip(); return; }
    const idx = { a: 0, b: 1, c: 2, 1: 0, 2: 1, 3: 2 }[k];
    if (idx === undefined) return;
    if (typing) skip();
    else choose(idx);
  });

  // 페이지가 새 버전으로 바뀌어도 진행 상황을 이어 간다 (Claude 아티팩트 뷰어에서만 동작).
  const hot = window.claude && window.claude.hot;
  if (hot && hot.snapshot) hot.snapshot(() => ({ st }));
  const boot = (data) => {
    const saved = data && data.st;
    if (saved && saved.screen !== 'title' && (S.scenes[saved.node] || S.endings[saved.node])) {
      st = saved;
      go(st.node);
    } else {
      toTitle();
    }
  };
  if (hot && hot.ready) hot.ready(boot);
  else boot((hot && hot.data) || {});
})();
