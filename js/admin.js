// 계란이의 모험 — 관리자 뷰어 (관리자 계정에만 보이는 화면)
// 탭: 진행 상태 · 장면 지도 · 엔딩 · 기록 · 그림 · 미니게임 · 옵션
// 관리자 확인은 화면에서만 하는 것이라(account.js), 여기서 바꾸는 것은 모두 이 기기와 이 계정의 기록뿐이다.
window.Admin = (() => {
  'use strict';

  const S = window.STORY;
  const M = window.META;
  const Art = window.Art;
  const Store = window.Store;
  const Sound = window.Sound;
  const UI = window.UI;
  const Minigames = window.Minigames;
  const $ = (id) => document.getElementById(id);
  const { esc, pad, KIND } = UI;
  const G = () => window.App.game;

  // ---------- 옵션 (이 기기에만 저장) ----------
  const OPT_KEY = 'egg2:admin';
  const OPTS = [
    ['autoWin', '미니게임 항상 성공', '미니게임을 하지 않고 바로 성공으로 넘어가요.'],
    ['peek', '선택지 결과 미리 보기', '선택지마다 어디로 가는지, 온기·금·아이템이 어떻게 바뀌는지 작은 글씨로 보여 줘요.'],
    ['ids', '장면 이름(id) 보기', '진행 화면 위쪽 장소 이름 옆에 장면 id를 보여 줘요.'],
    ['instant', '글자 바로 보이기', '설정과 상관없이 장면 글이 한 번에 나와요.'],
    ['player', '일반 플레이어로 보기', '모든 스킨, 도감 전체 열람 같은 관리자 권한을 잠시 끄고 일반 플레이어 화면으로 봐요. 관리자 뷰어는 계속 열 수 있어요.'],
  ];
  const opts = (() => {
    try { return { ...JSON.parse(localStorage.getItem(OPT_KEY) || '{}') }; } catch (e) { return {}; }
  })();
  window.App.adminOpts = opts;
  const saveOpts = () => {
    try { localStorage.setItem(OPT_KEY, JSON.stringify(opts)); } catch (e) { /* 저장 불가 */ }
  };

  const TABS = [['run', '진행 상태'], ['map', '장면 지도'], ['ends', '엔딩'], ['records', '기록'], ['gallery', '그림'], ['games', '미니게임'], ['options', '옵션']];
  let tab = 'run';
  let storyTab = S.stories[0].id;
  let galleryTab = 'bg';

  // ---------- 도우미 ----------
  const placeOf = (id) => (S.scenes[id] && S.scenes[id].place) || (S.endings[id] && S.endings[id].title) || id;
  const targetName = (id) => (S.endings[id] ? `엔딩 「${S.endings[id].title}」 (${KIND[S.endings[id].kind]})` : S.scenes[id] ? `${S.scenes[id].ch || ''}장 ${S.scenes[id].place}` : id);
  // 이야기 안에서 얻을 수 있는 아이템·친구
  function gainsOf(s) {
    const own = new Set();
    Object.values(s.scenes).forEach((sc) => (sc.choices || []).forEach((ch) =>
      [ch, ch.alt || {}, (ch.game || {}).win || {}, (ch.game || {}).lose || {}].forEach((x) => (x.gain || []).forEach((id) => own.add(id)))));
    return own;
  }
  function condText(need) {
    if (!need) return '';
    if (Array.isArray(need)) return need.map(condText).join(' + ');
    if (typeof need === 'string') return G().nameOf(need);
    if (need.friends) return `친구 ${need.friends}명 이상`;
    if (need.from) return `바로 전 장면이 ${[].concat(need.from).map(placeOf).join(' 또는 ')}`;
    if (need.flag) return `표시 '${need.flag}'`;
    if (need.cracked) return '금이 있음';
    return JSON.stringify(need);
  }
  const storyTabs = () => `<div class="tabs adm-story-tabs" role="tablist" aria-label="이야기">${S.stories.map((s) =>
    `<button type="button" class="tab" role="tab" data-a="stab" data-id="${s.id}" data-era="${s.id}" aria-selected="${s.id === storyTab}"><b>${esc(s.era)}</b><small>${esc(s.title)}</small></button>`).join('')}</div>`;
  const card = (title, inner) => `<section class="adm-card">${title ? `<h3>${title}</h3>` : ''}${inner}</section>`;
  const kv = (rows) => `<dl class="adm-kv">${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>`;
  const segBtns = (list, curVal, act) => `<div class="seg-btns">${list.map(([v, name]) =>
    `<button type="button" class="btn small${String(curVal) === String(v) ? ' on' : ''}" data-a="${act}" data-v="${v}" aria-pressed="${String(curVal) === String(v)}">${name}</button>`).join('')}</div>`;

  // ---------- 탭: 진행 상태 ----------
  function panelRun() {
    if (!G().running) {
      const run = Store.loadRun();
      const has = run && S.scenes[run.node];
      return card('진행 중인 모험이 없어요',
        (has ? `<p>이어하기 저장: <b>${esc(UI.storyLabel(UI.storyOf(UI.runStory(run))))}</b> · ${esc(S.scenes[run.node].place)}</p>` +
          '<div class="row"><button type="button" class="btn small primary" data-a="resume">이어하기 불러오기</button></div>' : '') +
        '<p class="hint">이야기를 바로 시작한 뒤 이 탭에서 온기, 금, 가방, 친구를 바꿀 수 있어요.</p>' +
        `<div class="row">${S.stories.map((s) => `<button type="button" class="btn small" data-a="start" data-id="${s.id}">${esc(UI.storyLabel(s))} 시작</button>`).join('')}</div>`);
    }
    const st = G().state;
    const s = UI.storyOf(st.story);
    const sc = S.scenes[st.node];
    const own = gainsOf(s);
    const chip = (kind, id, on) => `<button type="button" class="adm-chip${on ? ' on' : ''}${own.has(id) ? '' : ' other'}" data-a="toggle" data-kind="${kind}" data-id="${id}" aria-pressed="${on}">${esc(G().nameOf(id))}</button>`;
    return card(`${esc(UI.storyLabel(s))} 「${esc(s.title)}」`,
      kv([
        ['장면', `${sc.ch}장 ${esc(sc.place)} <code>${esc(st.node)}</code>`],
        ['바로 전', st.from ? esc(placeOf(st.from)) : '-'],
        ['고른 선택지', `${st.steps}개`],
        ['표시', st.flags.length ? st.flags.map(esc).join(', ') : '-'],
        ['엄마 이름', esc(st.vars.mom || s.mom)],
      ]) +
      '<div class="row"><button type="button" class="btn small primary" data-a="toPlay">진행 화면으로</button>' +
      '<button type="button" class="btn small" data-a="toScene">이 장면 처음부터 다시</button></div>') +
      card(`온기 <output id="admT">${st.t.toFixed(1)}℃</output>`,
        `<input type="range" class="adm-range" min="0" max="40" step="0.5" value="${st.t}" data-a="temp" aria-label="온기">` +
        segBtns([[4, '4℃'], [20, '20℃'], [s.hatchTemp, `${s.hatchTemp}℃ (진엔딩 기준)`], [37.5, '37.5℃']], st.t, 'setT') +
        '<h3>껍질의 금</h3>' + segBtns([[0, '0개'], [1, '1개'], [2, '2개']], st.c, 'setC')) +
      card(`가방 ${st.bag.length}개`, `<div class="adm-chips">${Object.keys(M.items).map((id) => chip('item', id, st.bag.includes(id))).join('')}</div>` +
        `<h3>친구 ${st.friends.length}명</h3><div class="adm-chips">${Object.keys(M.friends).map((id) => chip('friend', id, st.friends.includes(id))).join('')}</div>` +
        '<p class="hint">흐린 것은 다른 이야기에 나오는 것이에요.</p>' +
        '<div class="row"><button type="button" class="btn small" data-a="giveAll">이 이야기 것 모두 받기</button>' +
        '<button type="button" class="btn small" data-a="clearBag">가방·친구 비우기</button></div>');
  }

  // ---------- 탭: 장면 지도 ----------
  function sceneItem(s, id) {
    const sc = s.scenes[id];
    if (sc.branch) {
      return `<details class="adm-item"><summary><span class="adm-tag">자동으로 갈림</span> <code>${esc(id)}</code></summary>` +
        '<p class="hint">선택지 없이 지금 상태(금, 온기, 친구)로 바로 엔딩을 정해요.</p>' +
        `<ul class="adm-outs">${(sc.outs || []).map((o) => `<li>${esc(targetName(o))} <button type="button" class="btn small" data-a="jump" data-id="${o}">보기</button></li>`).join('')}</ul></details>`;
    }
    const text = sc.text.map((p) => (typeof p === 'string'
      ? `<p>${esc(p)}</p>`
      : `<p class="cond"><span class="adm-tag">${p.if ? '이럴 때만' : '이럴 땐 빼고'}: ${esc(condText(p.if || p.not))}</span> ${esc(p.text)}</p>`)).join('');
    const choices = sc.choices.map((ch, i) => `<li><b>${'ABC'[i]}.</b> ${esc(ch.label)}` +
      (ch.game ? ` <span class="adm-tag">${esc(Minigames.label(ch.game))} 게임 · ${esc(ch.game.title)}</span>` : '') +
      (ch.alt ? ` <span class="adm-tag">조건: ${esc(condText(ch.alt.need))}</span>` : '') +
      `<span class="peek">${esc(G().peekLine(ch))}</span></li>`).join('');
    return `<details class="adm-item"><summary><span class="adm-ch">${sc.ch}장</span> ${esc(sc.place)} <code>${esc(id)}</code>` +
      `${Store.book.scenes[id] ? ' <span class="adm-ok">가 봄</span>' : ''}</summary>` +
      `<div class="adm-text">${text}</div><ol class="adm-choices">${choices}</ol>` +
      `<button type="button" class="btn small primary" data-a="jump" data-id="${id}">이 장면으로 이동</button></details>`;
  }
  function panelMap() {
    const s = UI.storyOf(storyTab);
    const ids = Object.keys(s.scenes).filter((id) => !s.scenes[id].branch);
    const visited = ids.filter((id) => Store.book.scenes[id]).length;
    return storyTabs() + `<p class="hint">장면 ${ids.length}개 가운데 ${visited}곳을 가 봤어요. 장면을 펼치면 글, 조건 문단, 선택지가 어디로 가는지 보여요.</p>` +
      `<div class="adm-list">${Object.keys(s.scenes).map((id) => sceneItem(s, id)).join('')}</div>`;
  }

  // ---------- 탭: 엔딩 ----------
  function panelEnds() {
    const s = UI.storyOf(storyTab);
    const ids = Object.keys(s.endings);
    const book = Store.book;
    return storyTabs() +
      `<div class="row"><button type="button" class="btn small" data-a="markStory">이 이야기 엔딩 모두 기록</button>` +
      '<button type="button" class="btn small danger" data-a="clearStory">이 이야기 엔딩 기록 지우기</button></div>' +
      '<p class="hint">보기는 도감에 기록하지 않는 미리 보기예요. 기록하기를 누르면 도감과 옷장 해금에 바로 반영돼요.</p>' +
      `<ul class="book-grid adm-ends">${ids.map((id, i) => {
        const e = s.endings[id];
        const rec = book.endings[id];
        return `<li class="book-card${rec ? ' got' : ''}" data-kind="${e.kind}"><span class="thumb egg">${UI.endingArt(e)}</span>` +
          `<span class="meta"><span class="no">엔딩 ${pad(i + 1)} · ${rec ? `${rec.n}번 봄` : '아직 안 봄'}</span><span class="nm">${esc(e.title)}</span>` +
          `<span class="kd">${KIND[e.kind]} · <code>${esc(id)}</code></span>` +
          `<span class="row adm-row"><button type="button" class="btn small" data-a="jump" data-id="${id}">보기</button>` +
          `<button type="button" class="btn small" data-a="read" data-id="${id}">글 읽기</button>` +
          `<button type="button" class="btn small" data-a="mark" data-id="${id}">${rec ? '기록 지우기' : '기록하기'}</button></span></span></li>`;
      }).join('')}</ul>`;
  }

  // ---------- 탭: 기록 ----------
  function panelRecords() {
    const book = Store.book;
    const st = book.stats;
    const per = S.stories.map((s) => {
      const ends = Object.keys(s.endings);
      const scenes = Object.keys(s.scenes).filter((id) => !s.scenes[id].branch);
      return [esc(s.era), `엔딩 ${ends.filter((id) => book.endings[id]).length}/${ends.length} · 장면 ${scenes.filter((id) => book.scenes[id]).length}/${scenes.length}`];
    });
    const signedIn = window.Account && window.Account.signedIn;
    return card('플레이 기록', kv([
      ['플레이', `${st.plays}번`], ['엔딩 본 횟수', `${st.finished}번`], ['와장창', `${st.crashes}번`],
      ['고른 선택지', `${st.choices}개`], ['최단 진엔딩', st.bestTrue == null ? '-' : `선택 ${st.bestTrue}번`],
      ['스킨', `${UI.unlockedSkins().length}/${UI.visibleSkins().length}`], ...per,
    ])) +
      card('한 번에 바꾸기', '<div class="row">' +
        '<button type="button" class="btn small" data-a="markAll">모든 엔딩 기록</button>' +
        '<button type="button" class="btn small" data-a="scenesAll">모든 장면 기록</button>' +
        '<button type="button" class="btn small danger" data-a="clearBook">도감 비우기</button>' +
        '<button type="button" class="btn small danger" data-a="clearStats">플레이 기록 0으로</button>' +
        '<button type="button" class="btn small danger" data-a="clearRun">이어하기 저장 지우기</button></div>' +
        '<p class="hint">도감을 바꾸면 계란 옷장의 해금도 바로 따라 바뀌어요.</p>') +
      card('기록 내보내기 · 가져오기',
        '<p class="hint">이 기기의 도감, 플레이 기록, 이어하기를 글자(JSON)로 옮겨요. 다른 기기의 가져오기에 붙여 넣으면 그대로 옮겨져요.</p>' +
        '<textarea class="share-text adm-json" id="admJson" rows="6" spellcheck="false" aria-label="기록 JSON"></textarea>' +
        '<div class="row"><button type="button" class="btn small" data-a="export">내보내기</button>' +
        '<button type="button" class="btn small" data-a="copy">복사</button>' +
        '<button type="button" class="btn small primary" data-a="import">가져오기</button></div>') +
      (signedIn ? card('계정', '<p class="hint">로그인한 계정에 지금 바로 저장해요. 평소에는 바뀔 때마다 자동으로 저장돼요.</p>' +
        '<button type="button" class="btn small" data-a="push">지금 계정에 저장</button>') : '');
  }

  // ---------- 탭: 그림 ----------
  function usedIn(bg) {
    const scenes = Object.values(S.scenes).filter((sc) => sc.bg === bg).length;
    const ends = Object.values(S.endings).filter((e) => e.bg === bg).length;
    return [scenes ? `장면 ${scenes}곳` : '', ends ? `엔딩 ${ends}개` : ''].filter(Boolean).join(' · ') || '타이틀·이야기 카드';
  }
  function panelGallery() {
    const head = segBtns([['bg', `배경 ${Art.sceneKeys().length}`], ['skins', `스킨 ${M.skins.length}`], ['ends', `엔딩 그림 ${UI.endIds.length}`]], galleryTab, 'gtab');
    if (galleryTab === 'bg') {
      return head + `<ul class="adm-gallery bgs">${Art.sceneKeys().map((k) =>
        `<li><span class="adm-bg"><span class="backdrop">${Art.scene(k)}</span></span><code>${k}</code><small>${usedIn(k)}</small></li>`).join('')}</ul>`;
    }
    if (galleryTab === 'skins') {
      const cur = UI.currentSkin().id;
      return head + `<ul class="adm-gallery">${M.skins.map((k) =>
        `<li><span class="egg">${Art.egg(k, { mood: 'happy', label: k.name })}</span><b>${esc(k.name)}</b><small>${esc(UI.condText(k))}</small>` +
        `<button type="button" class="btn small${k.id === cur ? ' on' : ''}" data-a="wear" data-id="${k.id}">${k.id === cur ? '입는 중' : '입기'}</button></li>`).join('')}</ul>`;
    }
    return head + `<ul class="adm-gallery">${UI.endIds.map((id) => {
      const e = S.endings[id];
      return `<li><span class="egg">${UI.endingArt(e)}</span><b>${esc(e.title)}</b><small>${esc(UI.storyOf(e.story).era)} · ${KIND[e.kind]}</small></li>`;
    }).join('')}</ul>`;
  }

  // ---------- 탭: 미니게임 ----------
  function allGames() {
    const out = [];
    S.stories.forEach((s) => Object.entries(s.scenes).forEach(([id, sc]) => (sc.choices || []).forEach((ch, i) => {
      if (ch.game) out.push({ s, id, sc, ch, i });
    })));
    return out;
  }
  function panelGames() {
    const types = Object.entries(Minigames.TYPES);
    const list = allGames();
    return card('난이도', segBtns([['easy', '쉬움'], ['normal', '보통'], ['hard', '어려움']], Store.settings.difficulty, 'level') +
      '<p class="hint">설정의 미니게임 난이도와 같은 값이에요.</p>') +
      card(`미니게임 종류 ${types.length}가지`, `<ul class="adm-games">${types.map(([k, t]) =>
        `<li><b>${esc(t.name)}</b><span>${esc(t.desc)}</span><button type="button" class="btn small" data-a="practice" data-id="${k}">연습하기</button></li>`).join('')}</ul>`) +
      card(`이야기 속 미니게임 ${list.length}개`, `<ul class="adm-games">${list.map((g, n) =>
        `<li><b>${esc(g.ch.game.title)}</b><span>${esc(g.s.era)} · ${esc(g.sc.place)} · ${'ABC'[g.i]} · ${esc(Minigames.label(g.ch.game))}</span>` +
        `<button type="button" class="btn small" data-a="tryGame" data-n="${n}">해 보기</button></li>`).join('')}</ul>`);
  }

  // ---------- 탭: 옵션 ----------
  function panelOptions() {
    return card('', OPTS.map(([k, name, desc]) => `<div class="set-row adm-opt"><label class="toggle" for="adm-${k}"><span class="set-name">${name}</span>` +
      `<input type="checkbox" id="adm-${k}" data-opt="${k}"${opts[k] ? ' checked' : ''}></label><p class="set-desc">${desc}</p></div>`).join('')) +
      card('관리자 계정', `<p class="hint">관리자는 ${M.admins.length}개 계정이에요. 공개 저장소에는 이메일 대신 해시만 있어요(js/meta.js). ` +
        'Google 로그인으로 인증된 이메일만 비교해요.</p>');
  }

  const PANELS = { run: panelRun, map: panelMap, ends: panelEnds, records: panelRecords, gallery: panelGallery, games: panelGames, options: panelOptions };

  function render() {
    if (!window.App.adminAccount) {
      $('adminTabs').innerHTML = '';
      $('adminPanel').innerHTML = card('관리자 계정이 아니에요', '<p class="hint">관리자로 등록된 Google 계정으로 로그인하면 볼 수 있어요.</p>');
      return;
    }
    $('adminTabs').innerHTML = TABS.map(([id, name]) =>
      `<button type="button" class="tab" role="tab" data-atab="${id}" aria-selected="${id === tab}">${name}</button>`).join('');
    $('adminPanel').innerHTML = PANELS[tab]();
    $('adminPanel').dataset.tab = tab;
  }

  // ---------- 입력 ----------
  $('adminTabs').addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-atab]');
    if (!b) return;
    tab = b.dataset.atab;
    Sound.play('tap');
    render();
    const again = $('adminTabs').querySelector(`[data-atab="${tab}"]`);
    if (again) again.focus();
  });

  const confirmThen = (title, text, ok, fn) => UI.confirmBox({ title, text, ok, danger: true, run: () => { fn(); render(); } });
  const exportJson = () => JSON.stringify({ game: 'egggame', version: M.version, book: Store.book, run: Store.loadRun() }, null, 1);

  function importJson() {
    let data;
    try { data = JSON.parse($('admJson').value); } catch (e) { UI.toast('JSON 형식이 아니에요. 내보내기로 만든 글을 그대로 붙여 넣어 주세요.'); return; }
    if (!data || typeof data !== 'object' || !data.book || typeof data.book !== 'object') { UI.toast('도감(book)이 들어 있지 않아요.'); return; }
    UI.confirmBox({
      title: '기록을 가져올까요?',
      text: '지금 이 기기의 도감, 플레이 기록, 이어하기가 붙여 넣은 내용으로 바뀌어요.',
      ok: '가져오기',
      run: () => {
        Store.replaceBook(data.book);
        Store.replaceRun(data.run && S.scenes[data.run.node] ? data.run : null);
        Store.editBook(() => {}); // 계정에도 올린다
        UI.toast('기록을 가져왔어요.');
        render();
      },
    });
  }

  $('adminPanel').addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-a]');
    if (!b) return;
    const a = b.dataset.a;
    const id = b.dataset.id;
    const v = b.dataset.v;
    switch (a) {
      // 진행 상태
      case 'start': G().start(id); return;
      case 'resume': G().resume(); return;
      case 'toPlay': UI.show('play'); return;
      case 'toScene': G().jump(G().state.node); return;
      case 'setT': G().update((st) => { st.t = Number(v); }); break;
      case 'setC': G().update((st) => { st.c = Number(v); }); break;
      case 'toggle':
        G().update((st) => {
          const key = b.dataset.kind === 'item' ? 'bag' : 'friends';
          st[key] = st[key].includes(id) ? st[key].filter((x) => x !== id) : [...st[key], id];
        });
        break;
      case 'giveAll':
        G().update((st) => {
          const own = [...gainsOf(UI.storyOf(st.story))];
          st.bag = [...new Set([...st.bag, ...own.filter((x) => M.items[x])])];
          st.friends = [...new Set([...st.friends, ...own.filter((x) => M.friends[x])])];
        });
        break;
      case 'clearBag': G().update((st) => { st.bag = []; st.friends = []; }); break;
      // 장면 지도 · 엔딩
      case 'stab': storyTab = id; break;
      case 'jump': G().jump(id); return;
      case 'read': UI.endingDetail(id); return;
      case 'mark':
        Store.editBook((book) => { if (book.endings[id]) delete book.endings[id]; else book.endings[id] = { n: 1, first: Date.now() }; });
        break;
      case 'markStory':
        Store.editBook((book) => Object.keys(UI.storyOf(storyTab).endings).forEach((e) => { if (!book.endings[e]) book.endings[e] = { n: 1, first: Date.now() }; }));
        break;
      case 'clearStory':
        confirmThen('이 이야기 엔딩 기록을 지울까요?', `${esc(UI.storyOf(storyTab).era)} 이야기의 엔딩 기록이 도감에서 사라져요.`, '지우기',
          () => Store.editBook((book) => Object.keys(UI.storyOf(storyTab).endings).forEach((e) => { delete book.endings[e]; })));
        return;
      // 기록
      case 'markAll':
        Store.editBook((book) => UI.endIds.forEach((e) => { if (!book.endings[e]) book.endings[e] = { n: 1, first: Date.now() }; }));
        break;
      case 'scenesAll':
        Store.editBook((book) => Object.keys(S.scenes).forEach((sid) => { if (!S.scenes[sid].branch) book.scenes[sid] = 1; }));
        break;
      case 'clearBook':
        confirmThen('도감을 비울까요?', '본 엔딩과 가 본 장면 기록이 모두 사라져요. 플레이 기록 숫자는 남아요.', '비우기',
          () => Store.editBook((book) => { book.endings = {}; book.scenes = {}; }));
        return;
      case 'clearStats':
        confirmThen('플레이 기록을 0으로 할까요?', '플레이, 엔딩 본 횟수, 와장창, 고른 선택지, 최단 진엔딩이 처음으로 돌아가요.', '0으로',
          () => Store.editBook((book) => { book.stats = { plays: 0, finished: 0, crashes: 0, choices: 0, bestTrue: null }; }));
        return;
      case 'clearRun':
        confirmThen('이어하기 저장을 지울까요?', '타이틀의 이어하기가 사라져요.', '지우기', () => Store.clearRun());
        return;
      case 'export': $('admJson').value = exportJson(); Sound.play('tap'); return;
      case 'copy': {
        const ta = $('admJson');
        if (!ta.value) ta.value = exportJson();
        ta.select();
        try { navigator.clipboard.writeText(ta.value).then(() => UI.toast('기록 JSON을 복사했어요.'), () => UI.toast('선택된 글을 직접 복사해 주세요.')); } catch (e) { UI.toast('선택된 글을 직접 복사해 주세요.'); }
        return;
      }
      case 'import': importJson(); return;
      case 'push':
        window.Account.push().then(() => UI.toast('계정에 저장했어요.'));
        return;
      // 그림
      case 'gtab': galleryTab = v; break;
      case 'wear': Store.set('skin', id); UI.toast(`<b>${esc(M.skins.find((k) => k.id === id).name)}</b>를 입었어요.`); break;
      // 미니게임
      case 'level': Store.set('difficulty', v); break;
      case 'practice': Minigames.run(Minigames.SAMPLES[id], (win) => UI.toast(`${esc(Minigames.TYPES[id].name)} 연습: <b>${win ? '성공' : '실패'}</b>`)); return;
      case 'tryGame': {
        const g = allGames()[Number(b.dataset.n)];
        if (g) Minigames.run(g.ch.game, (win) => UI.toast(`${esc(g.ch.game.title)}: <b>${win ? '성공' : '실패'}</b>`));
        return;
      }
      default: return;
    }
    Sound.play('tap');
    render();
  });

  $('adminPanel').addEventListener('input', (ev) => {
    if (ev.target.dataset.a !== 'temp') return;
    const t = Number(ev.target.value);
    G().update((st) => { st.t = t; });
    $('admT').textContent = t.toFixed(1) + '℃';
  });

  $('adminPanel').addEventListener('change', (ev) => {
    const k = ev.target.dataset.opt;
    if (!k) return;
    opts[k] = ev.target.checked;
    saveOpts();
    if (k === 'player') {
      window.App.admin = Boolean(window.App.adminAccount && !opts.player);
      UI.toast(opts.player ? '일반 플레이어 화면으로 봐요.' : '관리자 권한을 다시 켰어요.');
    }
    G().update(() => {}); // 진행 화면에 바로 반영
    Sound.play('tap');
  });

  return { render, get opts() { return opts; } };
})();
