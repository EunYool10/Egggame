// 계란이의 모험 v2 — 화면 전환, 창·알림, 타이틀, 엔딩 도감, 계란 옷장, 설정, 크레딧
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
  const KIND = { true: '진엔딩', happy: '해피 엔딩', normal: '노멀 엔딩', hidden: '히든 엔딩', bad: '배드 엔딩' };
  const endIds = Object.keys(S.endings);
  const SCREENS = ['title', 'play', 'end', 'book', 'closet', 'settings', 'credits'];
  const PAGES = ['book', 'closet', 'settings', 'credits'];
  const root = document.documentElement;
  const hostTheme = root.dataset.theme; // 뷰어가 정해 둔 테마는 '기기 설정'일 때 되돌린다
  let current = 'title';
  let backTo = 'title';

  const reduceMotion = () => Store.settings.motion === 'reduce' || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const seenCount = () => endIds.filter((id) => Store.book.endings[id]).length;
  const stat = (dt, dd) => `<div><dt>${dt}</dt><dd>${dd}</dd></div>`;

  // ---------- 화면 ----------
  const RENDER = { title: renderTitle, book: renderBook, closet: renderCloset, settings: renderSettings, credits: renderCredits };

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
  function modal({ title, body, actions = [{ label: '닫기' }], onClose = null }) {
    lastFocus = document.activeElement;
    $('modalTitle').textContent = title;
    $('modalBody').innerHTML = body;
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
    const first = $('modalBody').querySelector('button') || box.querySelector('.primary, .danger') || box.querySelector('button');
    if (first) first.focus();
    return $('modalBody');
  }
  function closeModal() {
    if ($('modal').hidden) return;
    $('modal').hidden = true;
    const after = onModalClose;
    onModalClose = null;
    if (after) after();
    if (lastFocus && lastFocus.focus && document.contains(lastFocus)) lastFocus.focus();
  }
  const confirmBox = ({ title, text, ok, danger, run }) => modal({
    title,
    body: `<p>${text}</p>`,
    actions: [{ label: '취소' }, { label: ok, danger, primary: !danger, run }],
  });
  $('modal').addEventListener('click', (ev) => { if (ev.target === $('modal')) closeModal(); });

  // 창이 열려 있을 때 Tab 키가 창 밖으로 나가지 않게 한다.
  function trapFocus(ev, box) {
    const items = [...box.querySelectorAll('button, [href], input, summary, [tabindex]:not([tabindex="-1"])')].filter((el) => !el.disabled && el.offsetParent);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (ev.shiftKey && document.activeElement === first) { ev.preventDefault(); last.focus(); }
    else if (!ev.shiftKey && document.activeElement === last) { ev.preventDefault(); first.focus(); }
  }

  // ---------- 스킨 ----------
  function isUnlocked(skin) {
    const u = skin.unlock;
    if (!u) return true;
    if (u.ending) return Boolean(Store.book.endings[u.ending]);
    if (u.count) return seenCount() >= u.count;
    return false;
  }
  const unlockedSkins = () => M.skins.filter(isUnlocked);
  function currentSkin() {
    const skin = M.skins.find((k) => k.id === Store.settings.skin);
    return skin && isUnlocked(skin) ? skin : M.skins[0];
  }
  function condText(skin) {
    const u = skin.unlock;
    if (!u) return '처음부터 있어요';
    if (u.ending) return `엔딩 ${pad(endIds.indexOf(u.ending) + 1)} 발견하기`;
    return `엔딩 ${u.count}개 발견하기`;
  }
  function endingArt(e, skin, label) {
    if (e.art === 'chick') return Art.chick(skin, { hat: e.hat, label });
    return Art.egg(skin, { mood: e.art, hat: e.hat, label });
  }

  // ---------- 타이틀 ----------
  function renderTitle() {
    const skin = currentSkin();
    $('titleBackdrop').innerHTML = Art.scene('fridge');
    $('titleEgg').innerHTML = Art.egg(skin, { mood: 'happy', label: `${skin.name}를 입은 계란이` });
    const run = Store.loadRun();
    const scene = run && S.scenes[run.node];
    $('btnContinue').hidden = !scene;
    if (scene) $('continueInfo').textContent = `${scene.ch}장 · ${scene.place} · 선택 ${run.steps}번째`;
    $('titleFoot').textContent = `엔딩 ${seenCount()} / ${endIds.length} · 옷장 ${unlockedSkins().length} / ${M.skins.length} · v${M.version}`;
  }

  // ---------- 엔딩 도감 ----------
  function renderBook() {
    const book = Store.book;
    const got = seenCount();
    const sceneIds = Object.keys(S.scenes).filter((id) => !S.scenes[id].branch);
    const st = book.stats;
    $('bookFill').style.width = (got / endIds.length) * 100 + '%';
    $('bookCount').textContent = `${got} / ${endIds.length}`;
    $('bookStats').innerHTML =
      stat('플레이', `${st.plays}번`) +
      stat('엔딩 본 횟수', `${st.finished}번`) +
      stat('와장창', `${st.crashes}번`) +
      stat('발견한 장면', `${sceneIds.filter((id) => book.scenes[id]).length}/${sceneIds.length}`) +
      stat('최단 진엔딩', st.bestTrue == null ? '-' : `선택 ${st.bestTrue}번`);
    const skin = currentSkin();
    $('bookGrid').innerHTML = endIds.map((id, i) => {
      const e = S.endings[id];
      const rec = book.endings[id];
      const thumb = `<span class="thumb egg">${endingArt(e, skin, rec ? e.title : '아직 못 본 엔딩')}</span>`;
      if (!rec) {
        return `<li class="book-card">${thumb}<span><span class="no">엔딩 ${pad(i + 1)}</span><span class="nm">???</span></span>` +
          `<button type="button" class="hint-btn" data-hint="${id}">힌트 보기</button></li>`;
      }
      return `<li class="book-card got" data-kind="${e.kind}">${thumb}` +
        `<span><span class="no">엔딩 ${pad(i + 1)} · ${rec.n}번 봄</span><span class="nm">${esc(e.title)}</span></span>` +
        `<span class="kd">${KIND[e.kind]}</span></li>`;
    }).join('');
  }
  $('bookGrid').addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-hint]');
    if (!b) return;
    Sound.play('tap');
    const p = document.createElement('p');
    p.className = 'hint-text';
    p.textContent = '힌트: ' + S.endings[b.dataset.hint].hint;
    b.replaceWith(p);
  });

  // ---------- 계란 옷장 ----------
  function renderCloset() {
    const cur = currentSkin();
    $('closetEgg').innerHTML = Art.egg(cur, { mood: 'happy', label: cur.name });
    $('closetName').textContent = cur.name;
    $('closetDesc').textContent = cur.desc;
    $('closetCount').textContent = `${unlockedSkins().length} / ${M.skins.length}개 모음 · 엔딩을 볼수록 늘어나요`;
    $('skinGrid').innerHTML = M.skins.map((sk) => {
      const open = isUnlocked(sk);
      const on = sk.id === cur.id;
      return `<li><button type="button" class="skin${open ? '' : ' locked'}${on ? ' on' : ''}" data-skin="${sk.id}" aria-pressed="${on}">` +
        `<span class="egg">${Art.egg(sk, { mood: open ? 'calm' : 'sleepy', label: open ? sk.name : '잠긴 스킨' })}</span>` +
        `<span>${open ? esc(sk.name) : '???'}</span>` +
        `<span class="cond">${open ? (on ? '입는 중' : '입어 보기') : esc(condText(sk))}</span></button></li>`;
    }).join('');
  }
  $('skinGrid').addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-skin]');
    if (!b) return;
    const sk = M.skins.find((k) => k.id === b.dataset.skin);
    if (!isUnlocked(sk)) {
      Sound.play('lose');
      toast(`아직 잠겨 있어요. <b>${esc(condText(sk))}</b>`);
      return;
    }
    Store.set('skin', sk.id);
    Sound.play('pick');
    renderCloset();
    const again = $('skinGrid').querySelector(`[data-skin="${sk.id}"]`);
    if (again) again.focus();
    if (window.App.onSkin) window.App.onSkin();
  });

  // ---------- 설정 ----------
  const SETTINGS = [
    { key: 'speed', name: '글자 속도', type: 'seg', opts: [['slow', '느리게'], ['normal', '보통'], ['fast', '빠르게'], ['instant', '한 번에']] },
    { key: 'size', name: '글자 크기', type: 'seg', opts: [['s', '작게'], ['m', '보통'], ['l', '크게']] },
    { key: 'theme', name: '화면 테마', type: 'seg', opts: [['system', '기기 설정'], ['light', '밝게'], ['dark', '어둡게']] },
    { key: 'sfx', name: '효과음', type: 'toggle', desc: '고를 때, 금이 갈 때, 엔딩에서 소리가 나요.' },
    { key: 'bgm', name: '배경 음악', type: 'toggle', desc: '잔잔한 오르골 선율이 흘러요.' },
    { key: 'volume', name: '음량', type: 'range' },
    { key: 'haptics', name: '진동', type: 'toggle', desc: '금이 갈 때 휴대폰이 짧게 떨려요. 지원하는 기기에서만 동작해요.' },
    { key: 'difficulty', name: '미니게임 난이도', type: 'seg', opts: [['easy', '쉬움'], ['normal', '보통'], ['hard', '어려움']], desc: '쉬움은 노란 칸이 넓고 계란이가 천천히 움직여요.' },
    { key: 'motion', name: '움직임', type: 'seg', opts: [['system', '기기 설정'], ['reduce', '줄이기']], desc: '흔들림, 글자 애니메이션, 크레딧 스크롤을 줄여요.' },
  ];

  function renderSettings() {
    const st = Store.settings;
    const desc = (d) => (d ? `<p class="set-desc">${d}</p>` : '');
    $('settingsForm').innerHTML = SETTINGS.map((s) => {
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
    }).join('');
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
    text: '엔딩 도감, 계란 옷장, 플레이 기록, 이어하기 저장이 모두 사라져요. 되돌릴 수 없어요.',
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
      `<div class="egg">${Art.egg(skin, { mood: 'happy' })}</div><h2 class="credits-title">계란이의 모험</h2>` +
      M.credits.map((c) => `<div class="credit-block"><h3>${esc(c.role)}</h3>${c.names.map((n) => `<p>${esc(n)}</p>`).join('')}</div>`).join('') +
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
    KIND, esc, pad, endIds,
    get current() { return current; },
    get modalOpen() { return !$('modal').hidden; },
    show, back, toast, modal, closeModal, confirmBox, trapFocus, applySettings, reduceMotion,
    isUnlocked, unlockedSkins, currentSkin, endingArt, seenCount,
  };
})();
