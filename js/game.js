// 계란이의 모험 v3 — 게임 진행 (이야기 고르기, 장면, 선택, 아이템·친구, 미니게임, 엔딩, 저장, 입력)
(() => {
  'use strict';

  const S = window.STORY;
  const M = window.META;
  const Art = window.Art;
  const Store = window.Store;
  const Sound = window.Sound;
  const UI = window.UI;
  const $ = (id) => document.getElementById(id);
  const { esc, pad, KIND } = UI;

  const READY_TEMP = 20; // 둥지 도착 전 목표 (온기 막대의 눈금)
  const MAX_TEMP = 37.5; // 부화 온도 (온기 막대의 끝)
  const MAX_CRACK = 3; // 금이 이만큼 가면 와장창
  const LETTERS = ['A', 'B', 'C'];
  const SPEED = { slow: [1, 45], normal: [2, 24], fast: [4, 16] }; // [한 번에 찍는 글자 수, 간격 ms]

  let st = fresh();
  let typing = null;
  let skip = () => {};
  let shownBg = null;
  let busy = false; // 미니게임이나 화면 전환 중에는 선택을 막는다

  function fresh(storyId) {
    const s = UI.storyOf(storyId);
    return {
      story: s.id, node: s.first, from: null, t: s.startTemp, c: 0, steps: 0, bag: [], friends: [], flags: [], vars: {},
      say: null, notes: [], log: [], bg: s.bg, hist: [],
    };
  }
  const story = () => UI.storyOf(st.story);
  const nameOf = (id) => (M.items[id] || M.friends[id] || { name: id }).name;
  const skin = () => UI.currentSkin();
  const shieldId = () => st.bag.find((id) => M.items[id] && M.items[id].shield);
  // 받침이 있으면 '이', 없으면 '가'
  const iga = (word) => {
    const code = word.charCodeAt(word.length - 1) - 0xac00;
    return word + (code >= 0 && code < 11172 && code % 28 ? '이' : '가');
  };

  // ---------- 조건과 본문 ----------
  function meets(need) {
    if (!need) return false;
    if (Array.isArray(need)) return need.every(meets);
    if (typeof need === 'string') return st.bag.includes(need) || st.friends.includes(need);
    if (need.friends) return st.friends.length >= need.friends;
    if (need.from) return [].concat(need.from).includes(st.from);
    if (need.flag) return st.flags.includes(need.flag);
    if (need.cracked) return st.c > 0;
    return false;
  }
  function fill(text) {
    const friends = st.friends.map(nameOf).join(', ') || '없음';
    return text.replace('{friends}', '함께한 친구: ' + friends).replace(/\{mom\}/g, st.vars.mom || story().mom);
  }
  // 조건 문단은 조건이 맞을 때만 남긴다.
  const lines = (list) => (list || [])
    .filter((p) => typeof p === 'string' || ((!p.if || meets(p.if)) && (!p.not || !meets(p.not))))
    .map((p) => fill(typeof p === 'string' ? p : p.text));

  // ---------- 상단 상태 ----------
  function hud() {
    $('tempFill').style.width = Math.min(st.t / MAX_TEMP, 1) * 100 + '%';
    $('tempVal').textContent = st.t.toFixed(1) + '℃';
    document.querySelector('.hud').classList.toggle('warm', st.t >= READY_TEMP);
    $('cracks').innerHTML = Array.from({ length: MAX_CRACK }, (_, i) => `<i class="${i < st.c ? 'on' : ''}"></i>`).join('');
    $('cracks').setAttribute('aria-label', `껍질의 금 ${st.c}개, 최대 ${MAX_CRACK}개`);
    const shield = shieldId();
    $('shield').hidden = !shield;
    if (shield) {
      $('shield').textContent = M.items[shield].short;
      $('shield').title = `${iga(M.items[shield].name)} 다음 충격을 막아 줘요`;
    }
    $('bagCount').textContent = st.bag.length + st.friends.length;
  }

  function chipsHTML(notes) {
    return (notes || []).map((n) => `<span class="chip ${n.cls}">${esc(n.text)}</span>`).join('');
  }
  function setSay(el) {
    el.hidden = !st.say && !st.notes.length;
    el.innerHTML = (st.say ? `<span>${esc(st.say)}</span>` : '') + chipsHTML(st.notes);
  }

  function floaters() {
    const box = $('floaters');
    box.innerHTML = '';
    if (UI.reduceMotion()) return;
    st.notes.filter((n) => n.float).forEach((n, i) => {
      const el = document.createElement('span');
      el.className = 'floater ' + n.cls;
      el.textContent = n.float;
      el.style.animationDelay = i * 0.35 + 's';
      box.appendChild(el);
    });
  }

  function animateEgg(el, hit) {
    el.classList.remove('hit', 'enter');
    if (UI.reduceMotion()) return;
    void el.offsetWidth; // 애니메이션을 다시 시작
    el.classList.add(hit ? 'hit' : 'enter');
  }

  // ---------- 장면 ----------
  function renderScene() {
    const sc = S.scenes[st.node];
    const s = story();
    if (UI.current !== 'play') UI.show('play');
    $('play').dataset.era = s.id;
    hud();
    $('chap').textContent = `${sc.ch}장`;
    $('stageTag').textContent = `${s.era} · ${s.title}`;
    $('place').textContent = sc.place;
    if (shownBg !== sc.bg) {
      $('backdrop').innerHTML = Art.scene(sc.bg);
      shownBg = sc.bg;
    }
    const egg = $('egg');
    egg.innerHTML = Art.egg(skin(), { mood: sc.mood, cracks: st.c, label: `계란이 (${sc.place})` });
    animateEgg(egg, st.notes.some((n) => n.cls === 'crack'));
    setSay($('say'));
    floaters();
    $('btnUndo').disabled = !st.hist.length;
    typeText(lines(sc.text), (typed) => renderChoices(sc, typed));
  }

  // 글자가 한 자씩 나타난다. 남은 글자는 투명하게 미리 깔아 두어 줄바꿈이 흔들리지 않는다.
  // done(typed): typed는 글자가 실제로 찍히는 동안 읽었는지 (한 번에 보이기면 false)
  function typeText(paras, done) {
    clearInterval(typing);
    typing = null;
    const el = $('text');
    const dialog = $('dialog');
    $('choices').innerHTML = '';
    el.innerHTML = paras.map((p) => `<p><span class="shown"></span><span class="ghost">${esc(p)}</span></p>`).join('');
    const rows = [...el.querySelectorAll('p')].map((p) => [p.firstChild, p.lastChild]);
    const finish = (typed = true) => {
      clearInterval(typing);
      typing = null;
      rows.forEach(([shown, ghost], k) => { shown.textContent = paras[k]; ghost.textContent = ''; });
      dialog.classList.remove('typing');
      done(typed);
    };
    skip = () => finish(true);
    const speed = SPEED[Store.settings.speed];
    if (!speed || UI.reduceMotion()) return finish(false);
    const [step, gap] = speed;
    let i = 0;
    let j = 0;
    let tick = 0;
    dialog.classList.add('typing');
    typing = setInterval(() => {
      if (i >= paras.length) return finish();
      j += step;
      rows[i][0].textContent = paras[i].slice(0, j);
      rows[i][1].textContent = paras[i].slice(j);
      tick += 1;
      if (tick % 4 === 0) Sound.play('type');
      if (j >= paras[i].length) { i += 1; j = 0; }
    }, gap);
  }

  function renderChoices(sc, reveal = false) {
    $('choices').innerHTML = sc.choices.map((ch, i) => {
      const tags = [];
      if (ch.game) tags.push(`<span class="tag game">미니게임 · ${esc(ch.game.title)}</span>`);
      if (ch.alt && meets(ch.alt.need)) tags.push(`<span class="tag alt">${esc(ch.alt.tag)}</span>`);
      return `<button type="button" class="choice" data-i="${i}"><span class="key">${LETTERS[i]}</span>` +
        `<span class="lbl">${esc(ch.label)}</span>${tags.length ? `<span class="tags">${tags.join('')}</span>` : ''}</button>`;
    }).join('');
    // 휴대폰처럼 화면이 작으면, 글을 다 읽었을 때 선택지가 화면 아래로 숨지 않게 살짝 올려 준다.
    const box = $('choices');
    if (reveal && box.getBoundingClientRect().top > window.innerHeight - 80) {
      box.scrollIntoView({ block: 'nearest', behavior: UI.reduceMotion() ? 'auto' : 'smooth' });
    }
  }

  // ---------- 선택 ----------
  function snapshot() {
    const { hist, ...rest } = st;
    return JSON.parse(JSON.stringify(rest));
  }

  function choose(i) {
    if (busy || UI.current !== 'play' || UI.modalOpen) return;
    if (typing) { skip(); return; }
    const ch = S.scenes[st.node].choices[i];
    if (!ch) return;
    Sound.play('pick');
    if (!ch.game) { apply(ch, i, null); return; }
    busy = true;
    minigame(ch.game, (win) => {
      busy = false;
      apply(ch, i, ch.game[win ? 'win' : 'lose']);
    });
  }

  // 보호 아이템이 충격을 막으면, 결과 문장에서 금이 갔다는 마지막 문장을 아이템 이야기로 바꾼다.
  function shieldSay(say, item) {
    const text = say || '';
    const cut = Math.max(text.lastIndexOf('. '), text.lastIndexOf('! '), text.lastIndexOf('? '));
    return (cut > 0 ? text.slice(0, cut + 1) + ' ' : '') + item.block;
  }

  function apply(ch, i, gameResult) {
    const sc = S.scenes[st.node];
    const o = { to: ch.to, fx: ch.fx, gain: ch.gain, use: ch.use, say: ch.say };
    if (gameResult) Object.assign(o, gameResult);
    if (ch.alt && meets(ch.alt.need)) {
      const { need, tag, ...rest } = ch.alt;
      Object.assign(o, rest);
    }
    st.hist.push(snapshot());
    if (st.hist.length > 40) st.hist.shift();
    st.log.push({ place: sc.place, text: lines(sc.text), pick: `${LETTERS[i]}. ${ch.label}` });
    st.steps += 1;
    st.bg = sc.bg;
    st.from = st.node;
    if (ch.flag && !st.flags.includes(ch.flag)) st.flags.push(ch.flag);
    if (ch.set) Object.assign(st.vars, ch.set);
    Store.countChoice();

    const notes = [];
    let sound = null;
    let say = o.say || null;
    const fx = o.fx || {};
    if (fx.t) {
      const sign = fx.t > 0 ? '+' : '';
      st.t = Math.max(0, Math.min(40, st.t + fx.t));
      notes.push({ cls: fx.t > 0 ? 'warm' : 'cold', text: `온기 ${sign}${fx.t}℃`, float: `${sign}${fx.t}℃` });
      sound = fx.t > 0 ? 'warm' : 'cold';
    }
    (o.use || []).forEach((id) => {
      if (!st.bag.includes(id)) return;
      st.bag = st.bag.filter((x) => x !== id);
      notes.push({ cls: 'use', text: `${nameOf(id)} 사용` });
    });
    (o.gain || []).forEach((id) => {
      if (M.items[id] && !st.bag.includes(id)) {
        st.bag.push(id);
        notes.push({ cls: 'gain', text: `가방에 ${nameOf(id)}`, float: nameOf(id) });
        sound = 'item';
      } else if (M.friends[id] && !st.friends.includes(id)) {
        st.friends.push(id);
        notes.push({ cls: 'gain', text: `친구 ${nameOf(id)}`, float: `친구 ${nameOf(id)}` });
        sound = 'friend';
      }
    });
    if (fx.c > 0) {
      const shield = shieldId();
      if (shield) {
        st.bag = st.bag.filter((x) => x !== shield);
        say = shieldSay(say, M.items[shield]);
        notes.push({ cls: 'shield', text: `${iga(M.items[shield].short)} 충격을 막았어요`, float: `${M.items[shield].short} 방어!` });
        sound = 'shield';
      } else {
        st.c = Math.min(MAX_CRACK, st.c + fx.c);
        notes.push({ cls: 'crack', text: `금 +${fx.c}`, float: '쩍!' });
        sound = 'crack';
        Sound.buzz([60, 40, 90]);
      }
    }
    if (notes.some((n) => n.cls === 'gain')) {
      const bag = $('btnBag');
      bag.classList.remove('bump');
      void bag.offsetWidth;
      bag.classList.add('bump');
    }
    st.say = say;
    st.notes = notes;
    if (sound) Sound.play(sound);

    let next = st.c >= MAX_CRACK ? story().crash : o.to;
    while (S.scenes[next] && S.scenes[next].branch) next = S.scenes[next].branch(st, story());
    go(next);
  }

  function go(id) {
    st.node = id;
    if (S.endings[id]) {
      renderEnding();
    } else {
      Store.markScene(id);
      renderScene();
      save();
    }
    window.scrollTo({ top: 0, behavior: UI.reduceMotion() ? 'auto' : 'smooth' });
  }

  let savedTimer = 0;
  function save() {
    if (!Store.saveRun(st)) return;
    const el = $('saved');
    el.classList.add('on');
    clearTimeout(savedTimer);
    savedTimer = setTimeout(() => el.classList.remove('on'), 1400);
  }

  function undo() {
    if (busy || !st.hist.length) return;
    const prev = st.hist.pop();
    Sound.play('tap');
    st = { ...fresh(prev.story), ...prev, hist: st.hist };
    shownBg = null;
    go(st.node);
  }

  // 이야기 시작. intro가 참이면 시작 카드를 먼저 보여 준다.
  function newGame(storyId = st.story, intro = false) {
    const begin = () => {
      st = fresh(storyId);
      shownBg = null;
      Store.countPlay();
      Sound.play('pick');
      go(st.node);
    };
    if (intro) UI.storyCard(UI.storyOf(storyId), begin);
    else begin();
  }

  // 이야기 고르기 화면에서 하나를 골랐을 때
  function pickStory(id) {
    Sound.play('tap');
    const run = Store.loadRun();
    if (!run || !S.scenes[run.node]) { newGame(id, true); return; }
    const runId = UI.runStory(run);
    const runScene = S.scenes[run.node];
    if (runId === id) {
      UI.modal({
        title: '이어서 할까요?',
        body: `<p>이 이야기를 하던 중이에요. <b>${runScene.ch}장 ${esc(runScene.place)}</b>에서 이어 할 수 있어요.</p>`,
        actions: [{ label: '처음부터', run: () => newGame(id, true) }, { label: '이어하기', primary: true, run: continueGame }],
      });
      return;
    }
    const runOf = UI.storyOf(runId);
    UI.confirmBox({
      title: '새 이야기를 시작할까요?',
      text: `하던 모험이 있어요: <b>${esc(runOf.era)} 「${esc(runOf.title)}」 ${runScene.ch}장</b>. 새로 시작하면 그 이어하기 저장은 지워져요.`,
      ok: '새로 시작',
      run: () => newGame(id, true),
    });
  }
  window.App.pickStory = pickStory;

  function continueGame() {
    const run = Store.loadRun();
    if (!run || !S.scenes[run.node]) { UI.show('stories'); return; }
    st = { ...fresh(UI.runStory(run)), ...run, story: UI.runStory(run), hist: Array.isArray(run.hist) ? run.hist : [] };
    shownBg = null;
    Sound.play('pick');
    go(st.node);
  }

  // ---------- 미니게임: 왔다 갔다 하는 계란이를 노란 칸에서 멈추기 ----------
  const DIFF = { easy: { zone: 0.3, speed: 0.75 }, normal: { zone: 0.2, speed: 1 }, hard: { zone: 0.13, speed: 1.35 } };
  let press = null;

  function minigame(game, done) {
    if (window.App.admin && window.App.autoWin) {
      UI.toast(`관리자: <b>${esc(game.title)}</b> 자동 성공`);
      Sound.play('win');
      done(true);
      return;
    }
    const level = DIFF[Store.settings.difficulty] ? Store.settings.difficulty : 'normal';
    const d = DIFF[level];
    const left = 0.12 + Math.random() * (0.76 - d.zone);
    const vel = 0.85 * d.speed * (game.speed || 1) * (UI.reduceMotion() ? 0.7 : 1); // 1초에 트랙 몇 바퀴
    const marker = $('gameMarker');
    const btn = $('gameGo');
    const result = $('gameResult');
    $('gameLevel').textContent = { easy: '쉬움', normal: '보통', hard: '어려움' }[level];
    $('gameTitle').textContent = game.title;
    $('gameHint').textContent = game.hint;
    $('gameZone').style.left = left * 100 + '%';
    $('gameZone').style.width = d.zone * 100 + '%';
    marker.style.left = '0%';
    result.textContent = '';
    result.className = 'game-result';
    btn.disabled = false;
    $('minigame').hidden = false;
    btn.focus();

    let pos = 0;
    let dir = 1;
    let last = performance.now();
    let raf = 0;
    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      pos += dir * vel * dt;
      if (pos > 1) { pos = 2 - pos; dir = -1; }
      if (pos < 0) { pos = -pos; dir = 1; }
      marker.style.left = pos * 100 + '%';
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    press = () => {
      press = null;
      cancelAnimationFrame(raf);
      btn.disabled = true;
      const win = pos >= left - 0.02 && pos <= left + d.zone + 0.02; // 계란 몸통만큼 살짝 봐준다
      result.textContent = win ? '성공!' : '아깝다!';
      result.classList.add(win ? 'win' : 'lose');
      Sound.play(win ? 'win' : 'lose');
      setTimeout(() => {
        $('minigame').hidden = true;
        done(win);
      }, 900);
    };
  }
  $('gameGo').addEventListener('click', () => { if (press) press(); });
  $('gameTrack').addEventListener('pointerdown', () => { if (press) press(); });

  // ---------- 엔딩 ----------
  function renderEnding() {
    const e = S.endings[st.node];
    const no = UI.endingNo(st.node);
    const before = new Set(UI.unlockedSkins().map((k) => k.id));
    const isNew = Store.markEnding(st.node, st.steps, e.kind);
    Store.clearRun();
    const unlocked = UI.unlockedSkins().filter((k) => !before.has(k.id));
    UI.show('end');

    $('end').dataset.kind = e.kind;
    $('end').dataset.era = no.story.id;
    $('endKind').textContent = KIND[e.kind];
    $('endNo').textContent = `${UI.storyLabel(no.story)} · 엔딩 ${pad(no.n)} / ${pad(no.total)}`;
    $('endNew').hidden = !isNew;
    $('endTitle').textContent = e.title;
    $('endBackdrop').innerHTML = Art.scene(e.bg || st.bg);
    const art = $('endArt');
    art.innerHTML = UI.endingArt(e);
    animateEgg(art, e.kind === 'bad');
    setSay($('endSay'));
    $('endText').innerHTML = lines(e.text).map((p) => `<p>${esc(p)}</p>`).join('');

    const box = $('endUnlocks');
    box.hidden = !unlocked.length;
    box.innerHTML = unlocked.length
      ? '<h3>계란 옷장에 새 스킨이 들어왔어요</h3><div class="unlock-list">' +
        unlocked.map((k) => `<span class="unlock"><span class="egg">${Art.egg(k, { mood: 'happy', label: k.name })}</span>${esc(k.name)}</span>`).join('') +
        '</div>'
      : '';
    $('endStats').innerHTML =
      `<div><dt>최종 온기</dt><dd>${st.t.toFixed(1)}℃</dd></div>` +
      `<div><dt>껍질의 금</dt><dd>${st.c} / ${MAX_CRACK}</dd></div>` +
      `<div><dt>고른 선택지</dt><dd>${st.steps}개</dd></div>` +
      `<div><dt>사귄 친구</dt><dd>${st.friends.length}명</dd></div>`;
    $('endRoute').innerHTML = st.log.map((l) => `<li><b>${esc(l.place)}</b> <span class="pick">${esc(l.pick)}</span></li>`).join('');
    $('btnEndUndo').disabled = !st.hist.length;
    $('btnRetry').textContent = `${no.story.era} 이야기 다시`;

    Sound.play(e.kind === 'bad' ? 'bad' : 'good');
    if (st.node === story().crash) Sound.buzz([120, 60, 200]);
    unlocked.forEach((k, n) => setTimeout(() => UI.toast(`새 스킨 해금: <b>${esc(k.name)}</b>`), 700 + n * 450));
  }

  function share() {
    const e = S.endings[st.node];
    if (!e) return;
    const no = UI.endingNo(st.node);
    const text = `계란이의 모험 · ${UI.storyLabel(no.story)} 「${no.story.title}」\n` +
      `${KIND[e.kind]} "${e.title}" (엔딩 ${pad(no.n)}/${no.total})\n` +
      `선택 ${st.steps}번 · 온기 ${st.t.toFixed(1)}℃ · 금 ${st.c}개 · 친구 ${st.friends.length}명\n` +
      `엔딩 도감 ${UI.seenCount()}/${UI.endIds.length} 달성!`;
    const fallback = () => {
      const body = UI.modal({
        title: '결과 복사',
        body: `<p>아래 글을 선택해서 복사하세요.</p><textarea class="share-text" id="shareText" rows="5" readonly>${esc(text)}</textarea>`,
      });
      const ta = body.querySelector('textarea');
      ta.focus();
      ta.select();
    };
    try {
      navigator.clipboard.writeText(text).then(() => UI.toast('결과를 복사했어요. 친구에게 붙여 넣어 자랑해 보세요!'), fallback);
    } catch (err) {
      fallback();
    }
  }

  // ---------- 창: 일시정지 메뉴, 가방, 지난 이야기 ----------
  function pauseMenu() {
    const acts = [['resume', '이어서 하기'], ['log', '지난 이야기'], ['bag', '가방과 친구'], ['help', '플레이 방법'], ['settings', '설정'], ['restart', '이 이야기 처음부터'], ['stories', '다른 이야기 고르기'], ['title', '타이틀로 (자동 저장됨)']];
    if (window.App.admin) acts.splice(4, 0, ['admin', '관리자 메뉴']);
    const s = story();
    const body = UI.modal({
      title: '잠깐 멈춤',
      body: `<p class="hint">${esc(UI.storyLabel(s))} 「${esc(s.title)}」 · 목표: ${esc(s.goal)}</p>` +
        `<div class="menu-list">${acts.map(([a, l]) => `<button type="button" class="btn" data-act="${a}">${l}</button>`).join('')}</div>`,
      actions: [],
    });
    body.querySelector('.menu-list').addEventListener('click', (ev) => {
      const b = ev.target.closest('[data-act]');
      if (!b) return;
      const act = b.dataset.act;
      UI.closeModal();
      Sound.play('tap');
      if (act === 'log') showLog();
      else if (act === 'bag') showBag();
      else if (act === 'help') UI.help();
      else if (act === 'settings') UI.show('settings');
      else if (act === 'admin') adminMenu();
      else if (act === 'title') UI.show('title');
      else if (act === 'stories') UI.show('stories');
      else if (act === 'restart') {
        UI.confirmBox({ title: '처음부터 다시 할까요?', text: '지금 모험은 사라지고 이 이야기의 처음으로 돌아가요.', ok: '다시 시작', run: () => newGame(st.story) });
      }
    });
  }

  function showBag() {
    const list = (ids, table) => ids.map((id) => `<li><b>${esc(table[id].name)}</b><span>${esc(table[id].desc)}</span></li>`).join('');
    const items = list(st.bag, M.items);
    const friends = list(st.friends, M.friends);
    UI.modal({
      title: '가방과 친구',
      body: `<h3 class="sub">가방</h3>${items ? `<ul class="bag-list">${items}</ul>` : '<p class="bag-empty">아직 아무것도 없어요.</p>'}` +
        `<h3 class="sub">친구 ${st.friends.length}명</h3>${friends ? `<ul class="bag-list">${friends}</ul>` : '<p class="bag-empty">아직 사귄 친구가 없어요.</p>'}`,
    });
  }

  function showLog() {
    const items = st.log.map((l) => `<li><h3>${esc(l.place)}</h3>${[].concat(l.text).map((p) => `<p>${esc(typeof p === 'string' ? p : p.text)}</p>`).join('')}<p class="pick">→ ${esc(l.pick)}</p></li>`).join('');
    UI.modal({ title: '지난 이야기', body: items ? `<ol class="log-list">${items}</ol>` : '<p class="bag-empty">아직 지나온 장면이 없어요.</p>' });
  }

  // ---------- 관리자 메뉴 (관리자 계정에만 보인다) ----------
  function adminMenu() {
    if (!window.App.admin) return;
    const inPlay = UI.current === 'play';
    const group = (fn) => S.stories.map((s) => `<optgroup label="${esc(UI.storyLabel(s))}">${fn(s)}</optgroup>`).join('');
    const sceneOpts = group((s) => Object.entries(s.scenes).filter(([, sc]) => !sc.branch)
      .map(([id, sc]) => `<option value="${id}">${sc.ch}장 · ${esc(sc.place)} (${id})</option>`).join(''));
    const endOpts = group((s) => Object.keys(s.endings)
      .map((id, i) => `<option value="${id}">${pad(i + 1)} · ${esc(s.endings[id].title)}</option>`).join(''));
    const body = UI.modal({
      title: '관리자 메뉴',
      body: '<p class="hint">관리자 계정에만 보여요. 계란 옷장의 모든 스킨이 열려 있어요.</p>' +
        `<div class="admin-row"><label for="admScene">장면 바로 가기</label><select id="admScene">${sceneOpts}</select>` +
        '<button type="button" class="btn small" data-adm="scene">이동</button></div>' +
        `<div class="admin-row"><label for="admEnding">엔딩 바로 보기</label><select id="admEnding">${endOpts}</select>` +
        '<button type="button" class="btn small" data-adm="ending">보기</button></div>' +
        (inPlay
          ? '<div class="row"><button type="button" class="btn small" data-adm="warm">온기 +10℃</button>' +
            '<button type="button" class="btn small" data-adm="cold">온기 -10℃</button>' +
            '<button type="button" class="btn small" data-adm="heal">금 없애기</button>' +
            '<button type="button" class="btn small" data-adm="all">이 이야기 아이템·친구 모두 받기</button></div>'
          : '') +
        `<label class="toggle" for="admAutoWin"><span>미니게임 항상 성공</span><input type="checkbox" id="admAutoWin"${window.App.autoWin ? ' checked' : ''}></label>`,
    });
    if (inPlay) {
      const cur = body.querySelector(`#admScene option[value="${st.node}"]`);
      if (cur) cur.selected = true;
    }
    body.querySelector('#admAutoWin').addEventListener('change', (ev) => {
      window.App.autoWin = ev.target.checked;
      UI.toast(ev.target.checked ? '미니게임을 항상 성공해요.' : '미니게임을 원래대로 해요.');
    });
    body.addEventListener('click', (ev) => {
      const b = ev.target.closest('[data-adm]');
      if (!b) return;
      const act = b.dataset.adm;
      const target = body.querySelector(act === 'ending' ? '#admEnding' : '#admScene').value;
      UI.closeModal();
      Sound.play('pick');
      if (act === 'scene' || act === 'ending') {
        const sid = (S.scenes[target] || S.endings[target]).story;
        if (UI.current === 'play' && sid === st.story) st.hist.push(snapshot());
        else { st = fresh(sid); shownBg = null; }
        st.say = null;
        st.notes = [];
        go(target);
        return;
      }
      if (act === 'warm') st.t = Math.min(40, st.t + 10);
      if (act === 'cold') st.t = Math.max(0, st.t - 10);
      if (act === 'heal') st.c = 0;
      if (act === 'all') {
        // 이 이야기에 나오는 아이템·친구만 받는다.
        const own = new Set();
        Object.values(story().scenes).forEach((sc) => (sc.choices || []).forEach((ch) => [ch, ch.alt || {}].forEach((x) => (x.gain || []).forEach((id) => own.add(id)))));
        st.bag = [...own].filter((id) => M.items[id]);
        st.friends = [...own].filter((id) => M.friends[id]);
      }
      hud();
      $('egg').innerHTML = Art.egg(skin(), { mood: S.scenes[st.node].mood, cracks: st.c });
      renderChoices(S.scenes[st.node]);
      save();
      UI.toast('관리자: 상태를 바꿨어요.');
    });
  }
  window.App.adminMenu = adminMenu;

  // ---------- 입력 ----------
  $('btnAdmin').addEventListener('click', () => { Sound.play('tap'); adminMenu(); });
  $('btnNew').addEventListener('click', () => {
    Sound.play('tap');
    if (!Store.settings.seenHelp) UI.help(() => UI.show('stories'));
    else UI.show('stories');
  });
  $('btnContinue').addEventListener('click', continueGame);
  $('btnHelp').addEventListener('click', () => { Sound.play('tap'); UI.help(); });
  [['btnBook', 'book'], ['btnCloset', 'closet'], ['btnSettings', 'settings'], ['btnCredits', 'credits'],
    ['btnEndCredits', 'credits'], ['btnEndTitle', 'title'], ['btnEndStories', 'stories']].forEach(([id, screen]) => {
    $(id).addEventListener('click', () => { Sound.play('tap'); UI.show(screen); });
  });
  $('btnEndBook').addEventListener('click', () => { Sound.play('tap'); UI.bookTab = st.story; UI.show('book'); });
  $('btnRetry').addEventListener('click', () => newGame(st.story));
  $('btnUndo').addEventListener('click', undo);
  $('btnEndUndo').addEventListener('click', undo);
  $('btnShare').addEventListener('click', share);
  $('btnPause').addEventListener('click', () => { Sound.play('tap'); pauseMenu(); });
  $('btnBag').addEventListener('click', () => { Sound.play('tap'); showBag(); });
  $('btnLog').addEventListener('click', () => { Sound.play('tap'); showLog(); });
  $('dialog').addEventListener('click', () => { if (typing) skip(); });
  $('choices').addEventListener('click', (ev) => {
    const b = ev.target.closest('.choice');
    if (b) choose(Number(b.dataset.i));
  });

  document.addEventListener('keydown', (ev) => {
    if (ev.altKey || ev.ctrlKey || ev.metaKey) return;
    const k = ev.key;
    if (!$('minigame').hidden) {
      if ((k === ' ' || k === 'Enter') && document.activeElement !== $('gameGo')) {
        ev.preventDefault();
        if (press) press();
      }
      return;
    }
    if (UI.modalOpen) {
      if (k === 'Escape') UI.closeModal();
      else if (k === 'Tab') UI.trapFocus(ev, document.querySelector('#modal .sheet'));
      return;
    }
    if (UI.current === 'play') {
      if (k === 'Escape') { pauseMenu(); return; }
      const onButton = document.activeElement && document.activeElement.tagName === 'BUTTON';
      if (typing && (k === ' ' || k === 'Enter') && !onButton) { ev.preventDefault(); skip(); return; }
      const idx = { a: 0, b: 1, c: 2, 1: 0, 2: 1, 3: 2 }[k.toLowerCase()];
      if (idx !== undefined) choose(idx);
    } else if (['stories', 'book', 'closet', 'settings', 'credits'].includes(UI.current) && k === 'Escape') {
      UI.back();
    }
  });

  // 소리는 첫 터치 이후에만 낼 수 있어서, 배경 음악도 그때 켠다.
  const firstGesture = () => {
    Sound.music(true);
    window.removeEventListener('pointerdown', firstGesture);
    window.removeEventListener('keydown', firstGesture);
  };
  window.addEventListener('pointerdown', firstGesture);
  window.addEventListener('keydown', firstGesture);

  window.App.onReset = () => {
    st = fresh();
    shownBg = null;
  };

  // ---------- 시작 ----------
  // 페이지가 새 버전으로 바뀌어도 진행 중인 장면을 이어 간다 (Claude 아티팩트 뷰어에서만 동작).
  UI.applySettings();
  const hot = window.claude && window.claude.hot;
  if (hot && hot.snapshot) hot.snapshot(() => ({ st, screen: UI.current }));
  const boot = (data) => {
    const saved = data && data.st;
    if (saved && data.screen === 'play' && S.scenes[saved.node]) {
      st = { ...fresh(UI.runStory(saved)), ...saved, story: UI.runStory(saved) };
      go(st.node);
    } else {
      UI.show('title');
    }
  };
  if (hot && hot.ready) hot.ready(boot);
  else boot((hot && hot.data) || {});
})();
