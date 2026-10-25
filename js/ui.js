// 계란이의 모험 v3 — 화면 전환, 창·알림, 타이틀, 이야기 고르기, 엔딩 도감, 계란 옷장, 설정, 크레딧, 플레이 방법
window.App = window.App || {};
window.UI = (() => {
  'use strict';

  const S = window.STORY;
  const M = window.META;
  const Store = window.Store;
  const Sound = window.Sound;
  const Art = window.Art;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);
  const pad = (n) => String(n).padStart(2, '0');
  // 받침이 있으면 withB, 없으면 without: particle('토종란', '을', '를') → '을'
  const particle = (word, withB, without) => {
    const w = String(word);
    const code = w.charCodeAt(w.length - 1) - 0xac00;
    return code >= 0 && code < 11172 && code % 28 ? withB : without;
  };
  const KIND = { true: '진엔딩', happy: '해피 엔딩', normal: '노멀 엔딩', hidden: '히든 엔딩', bad: '배드 엔딩' };
  const endIds = Object.keys(S.endings);
  const SCREENS = ['title', 'stories', 'play', 'end', 'book', 'closet', 'settings', 'credits', 'admin'];
  const PAGES = ['stories', 'book', 'closet', 'settings', 'credits', 'admin'];
  const root = document.documentElement;
  const hostTheme = root.dataset.theme; // 뷰어가 정해 둔 테마는 '기기 설정'일 때 되돌린다
  let current = 'title';
  let backTo = 'title';
  let bookTab = S.stories[0].id;

  const reduceMotion = () => Store.settings.motion === 'reduce' || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const seenCount = () => endIds.filter((id) => Store.book.endings[id]).length;
  const stat = (dt, dd) => `<div><dt>${dt}</dt><dd>${dd}</dd></div>`;

  // ---------- 이야기 ----------
  const storyOf = (id) => S.byId[id] || S.stories[0];
  const storyLabel = (s) => `이야기 ${s.no} · ${s.era}`;
  const storyEnds = (s) => endIds.filter((id) => S.endings[id].story === s.id);
  const storySeen = (s) => storyEnds(s).filter((id) => Store.book.endings[id]).length;
  // 엔딩 번호는 이야기마다 따로 센다.
  function endingNo(id) {
    const e = S.endings[id];
    const list = storyEnds(storyOf(e && e.story));
    return { story: storyOf(e && e.story), n: list.indexOf(id) + 1, total: list.length };
  }
  const runStory = (run) => (run && (run.story || (S.scenes[run.node] && S.scenes[run.node].story))) || S.stories[0].id;

  // ---------- 화면 ----------
  const RENDER = {
    title: renderTitle, stories: renderStories, book: renderBook, closet: renderCloset, settings: renderSettings, credits: renderCredits,
    admin: () => { if (window.Admin) window.Admin.render(); },
  };

  function show(id) {
    if (PAGES.includes(id) && !PAGES.includes(current)) backTo = current;
    SCREENS.forEach((s) => { $(s).hidden = s !== id; });
    current = id;
    if (RENDER[id]) RENDER[id]();
    window.scrollTo(0, 0);
    const head = $(id).querySelector('h1, h2');
    if (head && id !== 'play') {
      head.setAttribute('tabindex', '-1');
      head.focus({ preventScroll: true });
    }
    if (window.App.onScreen) window.App.onScreen(id);
  }
  const back = () => show(backTo === 'play' || backTo === 'end' ? backTo : 'title');

  function applySettings() {
    const st = Store.settings;
    if (st.theme === 'light' || st.theme === 'dark') root.dataset.theme = st.theme;
    else if (hostTheme) root.dataset.theme = hostTheme;
    else delete root.dataset.theme;
    root.dataset.size = st.size;
    if (st.motion === 'reduce') root.dataset.motion = 'reduce';
    else delete root.dataset.motion;
  }

  // ---------- 알림, 창 ----------
  function toast(html, ms = 3400) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = html;
    $('toasts').appendChild(el);
    setTimeout(() => el.remove(), ms);
  }

  let onModalClose = null;
  let lastFocus = null;
  function modal({ title, body, actions = [{ label: '닫기' }], onClose = null, wide = false }) {
    lastFocus = document.activeElement;
    $('modalTitle').textContent = title;
    $('modalBody').innerHTML = body;
    $('modal').querySelector('.sheet').classList.toggle('wide', wide);
    const box = $('modalActions');
    box.innerHTML = '';
    actions.forEach((a) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn' + (a.primary ? ' primary' : '') + (a.danger ? ' danger' : '');
      b.textContent = a.label;
      b.addEventListener('click', () => { closeModal(); if (a.run) a.run(); });
      box.appendChild(b);
    });
    onModalClose = onClose;
    $('modal').hidden = false;
    $('modal').querySelector('.sheet').scrollTop = 0; // 창은 늘 맨 위부터 보여 준다 (아래 버튼에 포커스가 가도)
    const first = $('modalBody').querySelector('button') || box.querySelector('.primary, .danger') || box.querySelector('button');
    if (first) first.focus({ preventScroll: true });
    return $('modalBody');
  }
  function closeModal() {
    if ($('modal').hidden) return;
    $('modal').hidden = true;
    const after = onModalClose;
    onModalClose = null;
    if (lastFocus && lastFocus.focus && document.contains(lastFocus)) lastFocus.focus();
    if (after) after();
  }
  const confirmBox = ({ title, text, ok, danger, run }) => modal({
    title,
    body: `<p>${text}</p>`,
    actions: [{ label: '취소' }, { label: ok, danger, primary: !danger, run }],
  });
  $('modal').addEventListener('click', (ev) => { if (ev.target === $('modal')) closeModal(); });

  // 창이 열려 있을 때 Tab 키가 창 밖으로 나가지 않게 한다.
  function trapFocus(ev, box) {
    const items = [...box.querySelectorAll('button, [href], input, select, summary, [tabindex]:not([tabindex="-1"])')].filter((el) => !el.disabled && el.offsetParent);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (ev.shiftKey && document.activeElement === first) { ev.preventDefault(); last.focus(); }
    else if (!ev.shiftKey && document.activeElement === last) { ev.preventDefault(); first.focus(); }
  }

  // ---------- 플레이 가이드 (넘겨 보는 안내 카드, js/guide.js) ----------
  const help = (after) => window.Guide.open(after);

  // ---------- 스킨 ----------
  const kindSeen = (kind) => endIds.filter((id) => S.endings[id].kind === kind && Store.book.endings[id]).length;
  // 가 본 장면 수 (선택지가 있는 장면만 센다)
  const placeIds = Object.keys(S.scenes).filter((id) => !S.scenes[id].branch);
  const placesSeen = () => placeIds.filter((id) => Store.book.scenes[id]).length;
  const STAT_TEXT = { plays: (n) => `모험 ${n}번 떠나기`, finished: (n) => `엔딩 ${n}번 보기`, crashes: (n) => `와장창 ${n}번 겪기`, choices: (n) => `선택 ${n}번 하기` };
  // 해금 조건까지 [지금, 목표]
  function progress(u) {
    if (u.ending) return [Store.book.endings[u.ending] ? 1 : 0, 1];
    if (u.story) {
      const s = storyOf(u.story);
      return [storySeen(s), u.n || storyEnds(s).length];
    }
    if (u.kind) return [kindSeen(u.kind), u.n];
    if (u.scenes) return [placesSeen(), u.scenes === 'all' ? placeIds.length : u.scenes];
    if (u.stat) return [Store.book.stats[u.stat] || 0, u.n];
    if (u.count) return [seenCount(), u.count === 'all' ? endIds.length : u.count];
    return [0, 1];
  }
  function isUnlocked(skin) {
    const u = skin.unlock;
    if (!u) return true;
    if (u.admin) return Boolean(window.App.admin); // 운영진 전용 계란
    if (window.App.admin) return true; // 관리자는 모든 스킨을 쓸 수 있다
    const [have, need] = progress(u);
    return have >= need;
  }
  // 운영진 전용 계란은 관리자 계정(관리자 권한을 켠 상태)에만 보이고, 일반 플레이어의 개수 세기에서도 빠진다.
  const staffOnly = (skin) => Boolean(skin.unlock && skin.unlock.admin);
  const visibleSkins = () => M.skins.filter((k) => !staffOnly(k) || window.App.admin);
  const unlockedSkins = () => visibleSkins().filter(isUnlocked);
  function currentSkin() {
    const skin = M.skins.find((k) => k.id === Store.settings.skin);
    return skin && isUnlocked(skin) ? skin : M.skins[0];
  }
  function condText(skin) {
    const u = skin.unlock;
    if (!u) return '처음부터 있어요';
    if (u.admin) return '운영진 계정 전용';
    if (u.ending) {
      const no = endingNo(u.ending);
      return `${no.story.era} 엔딩 ${pad(no.n)} 발견하기`;
    }
    const [have, need] = progress(u);
    const of = ` (${Math.min(have, need)}/${need})`;
    if (u.story) return `${storyOf(u.story).era} 엔딩 ${u.n ? `${u.n}개 보기` : '모두 모으기'}${of}`;
    if (u.kind) return `${KIND[u.kind]} ${u.n}개 보기${of}`;
    if (u.scenes) return `${u.scenes === 'all' ? '모든 장면' : `장면 ${u.scenes}개`} 가 보기${of}`;
    if (u.stat) return STAT_TEXT[u.stat](u.n) + of;
    return `${u.count === 'all' ? '모든 엔딩' : `엔딩 ${u.count}개`} 발견하기${of}`;
  }
  // 옷장 묶음: 운영진 전용 · 처음부터 · 이야기별 엔딩 · 엔딩 모으기 · 엔딩 종류 · 이야기 · 탐험과 기록
  const SKIN_GROUPS = [['staff', '운영진 전용', '운영진'], ['base', '처음부터 있는 계란', '기본'],
    ...S.stories.map((s) => [s.id, `${s.era} 엔딩 계란`, s.era]),
    ['count', '엔딩 모으기 보상', '모으기'], ['kind', '엔딩 종류 보상', '종류'], ['story', '이야기 보상', '이야기'], ['record', '탐험과 기록 보상', '기록']];
  function skinGroup(skin) {
    const u = skin.unlock;
    if (!u) return 'base';
    if (u.admin) return 'staff';
    if (u.ending && S.endings[u.ending]) return S.endings[u.ending].story;
    if (u.count) return 'count';
    if (u.kind) return 'kind';
    if (u.story) return 'story';
    return 'record';
  }
  // 보상 묶음 안에서는 같은 종류끼리 모아 쉬운 것부터 (처음부터·엔딩·운영진 계란은 적어 둔 순서 그대로)
  const STAT_ORDER = ['plays', 'finished', 'crashes', 'choices'];
  function skinRank(skin) {
    const u = skin.unlock;
    if (!u || u.admin || u.ending) return 0;
    const need = progress(u)[1];
    if (u.kind) return Object.keys(KIND).indexOf(u.kind) * 1e4 + need;
    if (u.story) return S.stories.findIndex((s) => s.id === u.story) * 1e4 + need;
    if (u.stat) return (STAT_ORDER.indexOf(u.stat) + 1) * 1e5 + need;
    return need;
  }
  const endingArt = (e, label) => Art.ending(e.look, label || e.title);

  // 도감에서 다시 읽는 엔딩 글: 그때의 상태를 모르니 기본 문단(조건 없는 것과 '이럴 땐 빼고' 문단)만 보여 준다.
  const plainLines = (list, s) => (list || [])
    .filter((p) => typeof p === 'string' || p.not)
    .map((p) => (typeof p === 'string' ? p : p.text).replace('{friends}', '함께한 친구들').replace(/\{mom\}/g, s.mom));
  function endingDetail(id) {
    const e = S.endings[id];
    if (!e) return;
    const s = storyOf(e.story);
    const no = endingNo(id);
    const rec = Store.book.endings[id];
    modal({
      title: e.title,
      wide: true,
      body: `<div class="intro-art" data-era="${s.id}"><span class="backdrop" aria-hidden="true">${Art.scene(e.bg || s.bg)}</span>` +
        `<span class="egg">${endingArt(e)}</span><span class="era-pill">${esc(storyLabel(s))} · 엔딩 ${pad(no.n)}</span></div>` +
        `<p class="detail-kind" data-kind="${e.kind}"><span class="kd">${KIND[e.kind]}</span>${rec ? ` · ${rec.n}번 봤어요` : ' · 관리자 열람'}</p>` +
        `<div class="intro-text">${plainLines(e.text, s).map((p) => `<p>${esc(p)}</p>`).join('')}</div>`,
    });
  }

  // ---------- 타이틀 ----------
  const ICONS = {
    book: '<path d="M4 6 C8 4 12 4 16 6 V26 C12 24 8 24 4 26 Z M16 6 C20 4 24 4 28 6 V26 C24 24 20 24 16 26"/>',
    closet: '<path d="M16 6 a3 3 0 1 1 3 3 c-2 0 -3 1 -3 3 L4 22 H28 L16 12"/><path d="M6 22 V26 H26 V22"/>',
    help: '<circle cx="16" cy="16" r="12"/><path d="M12 12 a4 4 0 1 1 6 3.5 c-1.5 1 -2 2 -2 3.5"/><circle cx="16" cy="23" r="0.8"/>',
    credits: '<path d="M16 4 l3.5 7.5 8 1 -6 5.5 1.6 8 -7.1 -4 -7.1 4 1.6 -8 -6 -5.5 8 -1 Z"/>',
    apps: '<rect x="5" y="5" width="9" height="9" rx="2.5"/><rect x="18" y="5" width="9" height="9" rx="2.5"/><rect x="5" y="18" width="9" height="9" rx="2.5"/><rect x="18" y="18" width="9" height="9" rx="2.5"/>',
  };
  const icon = (k) => `<svg viewBox="0 0 32 32" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round">${ICONS[k]}</svg>`;
  $('btnBook').insertAdjacentHTML('afterbegin', icon('book'));
  $('btnCloset').insertAdjacentHTML('afterbegin', icon('closet'));
  $('btnHelp').insertAdjacentHTML('afterbegin', icon('help'));
  $('btnCredits').insertAdjacentHTML('afterbegin', icon('credits'));
  $('btnApps').insertAdjacentHTML('afterbegin', icon('apps'));

  function renderTitle() {
    const skin = currentSkin();
    $('titleBackdrop').innerHTML = S.stories.map((s, i) => `<div class="backdrop era-${s.id}" style="--i:${i}">${Art.scene(s.bg)}</div>`).join('');
    $('titleBackdrop').style.setProperty('--n', S.stories.length);
    $('titleEgg').innerHTML = Art.egg(skin, { mood: 'happy', label: `${skin.name}${particle(skin.name, '을', '를')} 입은 계란이` });
    const run = Store.loadRun();
    const scene = run && S.scenes[run.node];
    $('btnContinue').hidden = !scene;
    $('btnAdmin').hidden = !window.App.adminAccount;
    if (scene) {
      const s = storyOf(runStory(run));
      $('continueInfo').textContent = `${storyLabel(s)} · ${scene.ch}장 ${scene.place}`;
    }
    $('btnNew').classList.toggle('soft', Boolean(scene));
    $('bookTile').textContent = `${seenCount()} / ${endIds.length}`;
    $('closetTile').textContent = `${unlockedSkins().length} / ${visibleSkins().length}`;
    $('titleFoot').textContent = `${M.byline} · v${M.version}`;
    $('newsDot').hidden = Store.settings.seenNews === M.version;
  }

  // ---------- 새 소식 ----------
  // 최근 세 버전은 펼쳐 보이고, 그 전 소식은 '지난 소식'에 접어 둔다.
  function showNews() {
    const list = window.NEWS || [];
    const item = (n) => `<section class="news-item"><h3>v${esc(n.v)} <small>${esc(n.date)}</small></h3>` +
      `<ul>${n.items.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></section>`;
    modal({
      title: '새 소식',
      wide: true,
      body: list.slice(0, 3).map(item).join('') +
        (list.length > 3 ? `<details class="news-old"><summary>지난 소식</summary>${list.slice(3).map(item).join('')}</details>` : ''),
    });
    Store.set('seenNews', M.version);
    $('newsDot').hidden = true;
  }
  $('btnNews').addEventListener('click', () => { Sound.play('tap'); showNews(); });

  // ---------- 은율이의 다른 앱 ----------
  function showApps() {
    modal({
      title: '은율이의 다른 앱',
      body: '<p class="hint">누르면 새 탭에서 열려요.</p>' +
        `<ul class="app-list">${(M.apps || []).map((a) => `<li><a class="app-link" href="${esc(a.url)}" target="_blank" rel="noopener" style="--app: ${esc(a.color)}">` +
          `<img class="app-icon" src="${esc(a.icon)}" width="52" height="52" alt="">` +
          `<span><b>${esc(a.name)}</b><small>${esc(a.desc)}</small>${a.slow ? '<small class="slow">무료 서버라 처음 열 때 30초쯤 걸릴 수 있어요.</small>' : ''}</span>` +
          '<span class="go" aria-hidden="true">↗</span></a></li>').join('')}</ul>`,
    });
  }
  $('btnApps').addEventListener('click', () => { Sound.play('tap'); showApps(); });

  // ---------- 이야기 고르기 ----------
  function renderStories() {
    const skin = currentSkin();
    const run = Store.loadRun();
    const runId = run && S.scenes[run.node] ? runStory(run) : null;
    const first = seenCount() === 0; // 처음 하는 사람에게는 이야기 1을 권한다
    $('storyList').innerHTML = S.stories.map((s, i) => {
      const seen = storySeen(s);
      const total = storyEnds(s).length;
      const done = Boolean(Store.book.endings[Object.keys(s.endings).find((id) => s.endings[id].kind === 'true')]);
      return `<li><button type="button" class="story-card" data-story="${s.id}" data-era="${s.id}">` +
        `<span class="story-art" aria-hidden="true"><span class="backdrop">${Art.scene(s.bg)}</span><span class="egg">${Art.egg(skin, { mood: 'brave' })}</span></span>` +
        '<span class="story-info">' +
        `<span class="row"><span class="era-pill">${esc(storyLabel(s))}</span>${first && i === 0 ? '<span class="flag rec">처음이라면 여기부터</span>' : ''}` +
        `${runId === s.id ? '<span class="flag">이어하는 중</span>' : ''}${done ? '<span class="flag done">진엔딩 달성</span>' : ''}</span>` +
        `<span class="story-title">${esc(s.title)}</span>` +
        `<span class="story-blurb">${esc(s.blurb)}</span>` +
        `<span class="story-meta"><span class="mini-bar"><i style="width:${(seen / total) * 100}%"></i></span>엔딩 ${seen} / ${total}</span>` +
        '</span></button></li>';
    }).join('');
  }
  $('storyList').addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-story]');
    if (b && window.App.pickStory) window.App.pickStory(b.dataset.story);
  });

  // 이야기 시작 카드. 바깥을 누르거나 Esc로 닫으면 시작하지 않고 이야기 고르기로 돌아간다.
  function storyCard(s, start) {
    const skin = currentSkin();
    modal({
      title: s.title,
      wide: true,
      body: `<div class="intro-art" data-era="${s.id}"><span class="backdrop" aria-hidden="true">${Art.scene(s.bg)}</span>` +
        `<span class="egg" aria-hidden="true">${Art.egg(skin, { mood: 'brave' })}</span>` +
        `<span class="era-pill">${esc(storyLabel(s))}</span></div>` +
        `<div class="intro-text">${s.intro.map((p) => `<p>${esc(p)}</p>`).join('')}</div>` +
        `<p class="intro-goal"><b>목표</b> ${esc(s.goal)}</p>`,
      actions: [{ label: '다른 이야기' }, { label: '모험 시작!', primary: true, run: start }],
    });
  }

  // ---------- 엔딩 도감 ----------
  function renderBook() {
    const book = Store.book;
    const s = storyOf(bookTab);
    const ids = storyEnds(s);
    const got = storySeen(s);
    $('bookTabs').innerHTML = S.stories.map((t) =>
      `<button type="button" class="tab" role="tab" data-tab="${t.id}" data-era="${t.id}" aria-selected="${t.id === s.id}">` +
      `<b>${esc(t.era)}</b><small>${storySeen(t)} / ${storyEnds(t).length}</small></button>`).join('');
    $('book').dataset.era = s.id;
    $('bookFill').style.width = (got / ids.length) * 100 + '%';
    $('bookCount').textContent = `${got} / ${ids.length}`;
    $('bookTitle').textContent = `${storyLabel(s)} 「${s.title}」`;
    const sceneIds = Object.keys(S.scenes).filter((id) => !S.scenes[id].branch && S.scenes[id].story === s.id);
    const st = book.stats;
    $('bookStats').innerHTML =
      stat('전체 엔딩', `${seenCount()}/${endIds.length}`) +
      stat('이 이야기 장면', `${sceneIds.filter((id) => book.scenes[id]).length}/${sceneIds.length}`) +
      stat('플레이', `${st.plays}번`) +
      stat('와장창', `${st.crashes}번`) +
      stat('최단 진엔딩', st.bestTrue == null ? '-' : `선택 ${st.bestTrue}번`);
    $('bookGrid').innerHTML = ids.map((id, i) => {
      const e = S.endings[id];
      const rec = book.endings[id];
      if (!rec && window.App.admin) {
        return `<li class="book-card peek" data-kind="${e.kind}"><span class="thumb egg">${endingArt(e)}</span>` +
          `<span class="meta"><span class="no">엔딩 ${pad(i + 1)} · 아직 안 봄</span><span class="nm">${esc(e.title)}</span>` +
          `<span class="kd">${KIND[e.kind]} · 관리자 열람</span><button type="button" class="hint-btn" data-detail="${id}">글 읽기</button></span></li>`;
      }
      if (!rec) {
        return `<li class="book-card"><span class="thumb egg">${Art.mystery()}</span>` +
          `<span class="meta"><span class="no">엔딩 ${pad(i + 1)}</span><span class="nm">???</span>` +
          `<button type="button" class="hint-btn" data-hint="${id}">힌트 보기</button></span></li>`;
      }
      return `<li class="book-card got" data-kind="${e.kind}"><span class="thumb egg">${endingArt(e)}</span>` +
        `<span class="meta"><span class="no">엔딩 ${pad(i + 1)} · ${rec.n}번 봄</span><span class="nm">${esc(e.title)}</span>` +
        `<span class="kd">${KIND[e.kind]}</span><button type="button" class="hint-btn" data-detail="${id}">다시 읽기</button></span></li>`;
    }).join('');
    renderHistory(s);
  }
  // 지난 모험 (이 기기에 남은 최근 기록 가운데 이 이야기 것)
  const when = (at) => {
    const d = new Date(at);
    return `${d.getMonth() + 1}월 ${d.getDate()}일 ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };
  function renderHistory(s) {
    const list = Store.history().filter((h) => h.story === s.id && S.endings[h.ending]);
    const route = (places) => (places.length > 6 ? [...places.slice(0, 3), '…', ...places.slice(-2)] : places).map(esc).join(' → ');
    $('bookHistory').innerHTML = '<h3>지난 모험 <small>이 기기에 남은 최근 기록</small></h3>' + (list.length
      ? `<ol class="history-list">${list.map((h) => {
        const e = S.endings[h.ending];
        return `<li data-kind="${e.kind}"><span class="when">${when(h.at)}</span><b>${esc(e.title)}</b><span class="kd">${KIND[e.kind]}</span>` +
          `<span class="h-route">${route(h.places || [])}</span>` +
          `<span class="facts">선택 ${h.steps}번 · 온기 ${h.t}℃ · 금 ${h.c}개 · 친구 ${h.friends}명</span></li>`;
      }).join('')}</ol>`
      : '<p class="hint">아직 이 이야기를 끝까지 간 기록이 없어요. 엔딩을 보면 여기에 지나온 길이 남아요.</p>');
  }
  $('bookTabs').addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-tab]');
    if (!b || b.dataset.tab === bookTab) return;
    bookTab = b.dataset.tab;
    Sound.play('tap');
    renderBook();
    const again = $('bookTabs').querySelector(`[data-tab="${bookTab}"]`);
    if (again) again.focus();
  });
  $('bookGrid').addEventListener('click', (ev) => {
    const d = ev.target.closest('[data-detail]');
    if (d) { Sound.play('tap'); endingDetail(d.dataset.detail); return; }
    const b = ev.target.closest('[data-hint]');
    if (!b) return;
    Sound.play('tap');
    const p = document.createElement('span');
    p.className = 'hint-text';
    p.textContent = '힌트: ' + S.endings[b.dataset.hint].hint;
    b.replaceWith(p);
  });

  // ---------- 계란 옷장 ----------
  function renderClosetTop(cur) {
    $('closetEgg').innerHTML = Art.egg(cur, { mood: 'happy', label: cur.name });
    $('closetName').textContent = cur.name;
    $('closetDesc').textContent = cur.desc;
  }
  function renderCloset() {
    const cur = currentSkin();
    renderClosetTop(cur);
    const visible = visibleSkins();
    $('closetCount').textContent = `${visible.filter(isUnlocked).length} / ${visible.length}개 모음 · 엔딩을 볼수록 늘어나요`;
    // 일반 플레이어도 운영진 계란을 구경할 수 있다 (입을 수는 없고, 옷장 맨 아래에 따로 둔다)
    const viewOnly = (sk) => staffOnly(sk) && !window.App.admin;
    const cell = (sk) => {
      const open = isUnlocked(sk);
      const look = open || viewOnly(sk);
      const on = sk.id === cur.id;
      return `<li><button type="button" class="skin${open ? '' : ' locked'}${viewOnly(sk) ? ' view-only' : ''}${on ? ' on' : ''}" data-skin="${sk.id}" aria-pressed="${on}">` +
        `<span class="egg">${look ? Art.egg(sk, { mood: 'calm', label: sk.name }) : Art.mystery('잠긴 스킨')}</span>` +
        `<span>${look ? esc(sk.name) : '???'}</span>` +
        `<span class="cond">${open ? (on ? '입는 중' : '입어 보기') : viewOnly(sk) ? '구경만 할 수 있어요' : esc(condText(sk))}</span></button></li>`;
    };
    const groups = SKIN_GROUPS.map(([g, name, short]) => ({ g, name, short, list: visible.filter((sk) => skinGroup(sk) === g).sort((a, b) => skinRank(a) - skinRank(b)) }))
      .filter((x) => x.list.length);
    if (!window.App.admin) groups.push({ g: 'staff', name: '운영진 전용', short: '운영진', list: M.skins.filter(staffOnly) });
    $('skinJump').innerHTML = groups.map((x) =>
      `<button type="button" class="jump-chip" data-jump="${x.g}" data-era="${x.g}">${esc(x.short)}</button>`).join('');
    $('skinGrid').innerHTML = groups.map(({ g, name, list }) =>
      `<section class="skin-group" data-era="${g}" id="skins-${g}"><h3>${name} <small>${list.some(viewOnly) ? `${list.length}종` : `${list.filter(isUnlocked).length} / ${list.length}`}</small></h3>` +
      `<ul class="skin-grid">${list.map(cell).join('')}</ul></section>`).join('');
  }
  // 계란을 바꿔 입을 때는 옷장 전체를 다시 그리지 않고, 위쪽 미리 보기와 바뀐 두 칸만 고친다.
  function wearSkin(sk) {
    Store.set('skin', sk.id);
    renderClosetTop(sk);
    $('skinGrid').querySelectorAll('.skin.on').forEach((b) => {
      b.classList.remove('on');
      b.setAttribute('aria-pressed', 'false');
      b.querySelector('.cond').textContent = '입어 보기';
    });
    const b = $('skinGrid').querySelector(`[data-skin="${sk.id}"]`);
    if (!b) return;
    b.classList.add('on');
    b.setAttribute('aria-pressed', 'true');
    b.querySelector('.cond').textContent = '입는 중';
  }
  $('skinGrid').addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-skin]');
    if (!b) return;
    const sk = M.skins.find((k) => k.id === b.dataset.skin);
    if (staffOnly(sk) && !window.App.admin) {
      Sound.play('tap');
      toast(`<b>${esc(sk.name)}</b>: 운영진 전용 계란이라 구경만 할 수 있어요.`);
      return;
    }
    if (!isUnlocked(sk)) {
      Sound.play('lose');
      toast(`아직 잠겨 있어요. <b>${esc(condText(sk))}</b>`);
      return;
    }
    Sound.play('pick');
    wearSkin(sk);
    if (window.App.onSkin) window.App.onSkin();
  });
  $('skinJump').addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-jump]');
    const sec = b && $(`skins-${b.dataset.jump}`);
    if (!sec) return;
    Sound.play('tap');
    sec.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
  });

  // ---------- 설정 ----------
  // group이 바뀌는 곳에 묶음 제목을 단다.
  const SETTINGS = [
    { group: '화면', key: 'speed', name: '글자 속도', type: 'seg', opts: [['slow', '느리게'], ['normal', '보통'], ['fast', '빠르게'], ['instant', '한 번에']] },
    { group: '화면', key: 'size', name: '글자 크기', type: 'seg', opts: [['s', '작게'], ['m', '보통'], ['l', '크게']] },
    { group: '화면', key: 'theme', name: '화면 테마', type: 'seg', opts: [['system', '기기 설정'], ['light', '밝게'], ['dark', '어둡게']] },
    { group: '화면', key: 'motion', name: '움직임', type: 'seg', opts: [['system', '기기 설정'], ['reduce', '줄이기']], desc: '흔들림, 글자 애니메이션, 크레딧 스크롤을 줄여요.' },
    { group: '소리와 진동', key: 'sfx', name: '효과음', type: 'toggle', desc: '고를 때, 금이 갈 때, 엔딩에서 소리가 나요.' },
    { group: '소리와 진동', key: 'bgm', name: '배경 음악', type: 'toggle', desc: '잔잔한 오르골 선율이 흘러요.' },
    { group: '소리와 진동', key: 'volume', name: '음량', type: 'range' },
    { group: '소리와 진동', key: 'haptics', name: '진동', type: 'toggle', desc: '금이 갈 때 휴대폰이 짧게 떨려요. 지원하는 기기에서만 동작해요.' },
    {
      group: '게임', key: 'difficulty', name: '미니게임 난이도', type: 'seg', opts: [['easy', '쉬움'], ['normal', '보통'], ['hard', '어려움']],
      desc: '쉬움은 칸이 넓고, 시간이 넉넉하고, 피하기 게임에서 한 번 더 부딪혀도 괜찮아요.',
    },
    { group: '게임', key: 'skipSeen', name: '읽은 글 바로 보기', type: 'toggle', desc: '전에 본 장면은 글이 한 글자씩 나오지 않고 한 번에 보여요. 여러 번 플레이할 때 편해요.' },
  ];

  function renderSettings() {
    const st = Store.settings;
    const desc = (d) => (d ? `<p class="set-desc">${d}</p>` : '');
    const row = (s) => {
      if (s.type === 'seg') {
        return `<fieldset class="set-row"><legend>${s.name}</legend><div class="seg">` +
          s.opts.map(([v, l]) => `<label><input type="radio" name="${s.key}" value="${v}" id="set-${s.key}-${v}"${st[s.key] === v ? ' checked' : ''}><span>${l}</span></label>`).join('') +
          `</div>${desc(s.desc)}</fieldset>`;
      }
      if (s.type === 'toggle') {
        return `<div class="set-row"><label class="toggle" for="set-${s.key}"><span class="set-name">${s.name}</span>` +
          `<input type="checkbox" id="set-${s.key}" name="${s.key}"${st[s.key] ? ' checked' : ''}></label>${desc(s.desc)}</div>`;
      }
      return `<div class="set-row"><label class="set-name" for="set-${s.key}">${s.name} <output id="volOut">${Math.round(st.volume * 100)}%</output></label>` +
        `<input type="range" id="set-${s.key}" name="${s.key}" min="0" max="1" step="0.05" value="${st.volume}"></div>`;
    };
    $('settingsForm').innerHTML = SETTINGS.map((s, i) =>
      (i === 0 || SETTINGS[i - 1].group !== s.group ? `<h3 class="set-group">${s.group}</h3>` : '') + row(s)).join('');
  }

  function onSetting(ev) {
    const el = ev.target;
    const key = el.name;
    if (!key) return;
    const value = el.type === 'checkbox' ? el.checked : el.type === 'range' ? parseFloat(el.value) : el.value;
    Store.set(key, value);
    applySettings();
    if (key === 'volume') { $('volOut').textContent = Math.round(value * 100) + '%'; Sound.setVolume(value); }
    if (key === 'bgm') Sound.music(value);
    if (ev.type === 'change') Sound.play('tap');
    if (window.App.onSettings) window.App.onSettings(key);
  }
  $('settingsForm').addEventListener('change', onSetting);
  $('settingsForm').addEventListener('input', (ev) => { if (ev.target.type === 'range') onSetting(ev); });
  $('settingsForm').addEventListener('submit', (ev) => ev.preventDefault());

  $('btnReset').addEventListener('click', () => confirmBox({
    title: '모든 기록을 지울까요?',
    text: '엔딩 도감, 계란 옷장, 플레이 기록, 지난 모험, 이어하기 저장이 모두 사라져요. 되돌릴 수 없어요.',
    ok: '모두 지우기',
    danger: true,
    run: () => {
      Store.resetAll();
      Store.set('skin', 'white');
      backTo = 'title'; // 진행 중이던 장면으로 돌아가지 않게 한다
      if (window.App.onReset) window.App.onReset();
      toast('모든 기록을 지웠어요. 처음부터 다시 모험을 떠나 보세요.');
    },
  }));

  // ---------- 크레딧 ----------
  function renderCredits() {
    const skin = currentSkin();
    $('creditsRoll').innerHTML =
      '<img class="credits-mascot" src="img/mascot.png" width="480" height="277" alt="계란이의 모험 대표 캐릭터"><h2 class="credits-title">계란이의 모험</h2>' +
      M.credits.map((c) => `<div class="credit-block${c.specs ? ' specs' : ''}"><h3>${esc(c.role)}</h3>` +
        (c.names || []).map((n) => `<p>${esc(n)}</p>`).join('') +
        (c.specsTitle ? `<h4>${esc(c.specsTitle)}</h4>` : '') +
        (c.specs ? `<dl>${c.specs.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>` : '') +
        '</div>').join('') +
      `<div class="egg">${Art.chick(skin, {})}</div>` +
      `<p class="credits-end">플레이해 주셔서 고마워요. 삐약!</p><p class="hint">${esc(M.copyright)}</p>`;
    $('creditsWindow').classList.toggle('still', reduceMotion());
    const roll = $('creditsRoll');
    roll.style.animation = 'none';
    void roll.offsetWidth; // 애니메이션을 처음부터 다시 튼다
    roll.style.animation = '';
  }
  $('btnCreditsReplay').addEventListener('click', renderCredits);

  document.querySelectorAll('[data-back]').forEach((b) => b.addEventListener('click', () => { Sound.play('tap'); back(); }));

  return {
    KIND, esc, pad, particle, endIds,
    get current() { return current; },
    get modalOpen() { return !$('modal').hidden; },
    set bookTab(id) { if (S.byId[id]) bookTab = id; },
    show, back, toast, modal, closeModal, confirmBox, trapFocus, applySettings, reduceMotion, help, storyCard,
    isUnlocked, unlockedSkins, visibleSkins, staffOnly, currentSkin, endingArt, seenCount, storyOf, storyLabel, endingNo, runStory,
    condText, endingDetail,
  };
})();
