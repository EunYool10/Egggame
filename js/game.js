// 계란이의 모험 v3 — 게임 진행 (이야기 고르기, 장면, 선택, 아이템·친구, 미니게임 연결, 엔딩, 저장, 입력)
(() => {
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
  let running = false; // 이번 방문에서 모험을 진행 중인지 (엔딩을 보면 끝난다)
  let dirty = false; // 진행 화면 밖(관리자 화면)에서 상태가 바뀌었는지

  function fresh(storyId) {
    const s = UI.storyOf(storyId);
    return {
      story: s.id, node: s.first, from: null, t: s.startTemp, c: 0, steps: 0, bag: [], friends: [], flags: [], vars: {},
      say: null, notes: [], log: [], bg: s.bg, hist: [],
      seed: Math.floor(Math.random() * 2147483646) + 1, used: [], event: null,
      route: makeRoute(s), path: [],
    };
  }
  const story = () => UI.storyOf(st.story);

  // ---------- 무작위 길 ----------
  // 이야기의 route.tiers에서 구역마다 몇 곳을 무작위로 골라 섞는다. 앞 구역 → 뒤 구역 순서는 지킨다.
  const NEXT = '>';
  function makeRoute(s) {
    const r = s.route;
    if (!r) return [];
    return r.tiers.flatMap((tier, k) => {
      const [lo, hi] = (r.pick && r.pick[k]) || [1, 1];
      const list = [...tier];
      for (let i = list.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
      }
      return list.slice(0, lo + Math.floor(Math.random() * (hi - lo + 1)));
    });
  }
  const tierOf = (id) => { const r = story().route; return r ? r.tiers.findIndex((t) => t.includes(id)) : -1; };
  // 다음 정거장: 길 위의 장면이면 그다음 곳, 길 밖(출발 장면, 고정된 선택으로 온 곳)이면 같거나 뒤 구역의 첫 곳.
  // 이번 모험에서 이미 지나온 곳은 건너뛰고, 다 지나면 route.end로 간다.
  function nextStop(node = st.node) {
    const r = story().route;
    if (!r) return null;
    const route = st.route || [];
    const i = route.indexOf(node);
    const ahead = i >= 0 ? route.slice(i + 1) : route.filter((id) => tierOf(id) >= tierOf(node));
    return ahead.find((id) => id !== node && !(st.path || []).includes(id)) || r.end;
  }
  const resolve = (to) => (to === NEXT ? nextStop() : to);

  // 모험마다 선택지 순서를 섞는다. 같은 모험 안에서는 늘 같은 순서 (이어하기·되돌리기에도 그대로).
  function orderOf(node) {
    const sc = S.scenes[node];
    const idx = [...Array(sc && sc.choices ? sc.choices.length : 0).keys()];
    if (!st.seed) return idx;
    let h = st.seed >>> 0;
    for (const ch of node) h = Math.imul(h ^ ch.charCodeAt(0), 2654435761) >>> 0;
    for (let i = idx.length - 1; i > 0; i -= 1) {
      h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0;
      const j = h % (i + 1);
      [idx[i], idx[j]] = [idx[j], idx[i]];
    }
    return idx;
  }

  // 길 위의 일 (js/events.js): kind는 'open'(출발) 또는 'road'(장면 사이). 한 모험에서 같은 일은 한 번만.
  const ROAD_CHANCE = 0.45;
  function rollEvent(kind) {
    const list = ((window.EVENTS || {})[st.story] || {})[kind] || [];
    const used = st.used || (st.used = []);
    const pool = list.map((e, k) => ({ ...e, id: kind + k })).filter((e) => !used.includes(e.id));
    if (!pool.length) return null;
    const e = pool[Math.floor(Math.random() * pool.length)];
    used.push(e.id);
    if (e.t) st.t = Math.max(0, Math.min(40, st.t + e.t));
    return { kind, text: e.text, t: e.t || 0 };
  }
  const nameOf = (id) => (M.items[id] || M.friends[id] || { name: id }).name;
  const skin = () => UI.currentSkin();
  const shieldId = () => st.bag.find((id) => M.items[id] && M.items[id].shield);
  // 관리자 옵션 (관리자 화면 → 옵션 탭)
  const opt = (k) => Boolean(window.App.admin && window.App.adminOpts && window.App.adminOpts[k]);
  // 받침이 있으면 '이', 없으면 '가'
  const iga = (word) => {
    const code = word.charCodeAt(word.length - 1) - 0xac00;
    return word + (code >= 0 && code < 11172 && code % 28 ? '이' : '가');
  };

  // ---------- 조건과 본문 ----------
  function meets(need, state = st) {
    if (!need) return false;
    if (Array.isArray(need)) return need.every((n) => meets(n, state));
    if (typeof need === 'string') return state.bag.includes(need) || state.friends.includes(need);
    if (need.friends) return state.friends.length >= need.friends;
    if (need.from) return [].concat(need.from).includes(state.from);
    if (need.flag) return state.flags.includes(need.flag);
    if (need.cracked) return state.c > 0;
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
    const sc = S.scenes[st.node];
    if (sc && !sc.branch) {
      // 장 진행 표시: 이 이야기의 마지막 장까지 몇 장째인지
      const last = Math.max(...Object.values(story().scenes).map((x) => x.ch || 0));
      $('pips').innerHTML = Array.from({ length: last }, (_, i) => `<i class="${i < sc.ch ? 'on' : ''}"></i>`).join('');
      $('pips').setAttribute('aria-label', `${last}장 가운데 ${sc.ch}장`);
      $('place').innerHTML = esc(sc.place) + (opt('ids') ? ` <small class="sid">${esc(st.node)}</small>` : '');
    }
  }

  function chipsHTML(notes) {
    return (notes || []).map((n) => `<span class="chip ${n.cls}">${esc(n.text)}</span>`).join('');
  }
  function setSay(el) {
    const ev = st.event;
    el.hidden = !st.say && !st.notes.length && !ev;
    el.innerHTML = (st.say ? `<span>${esc(st.say)}</span>` : '') + chipsHTML(st.notes) +
      (ev ? `<span class="event"><b>${ev.kind === 'open' ? '오늘은' : '길 위에서'}</b> ${esc(ev.text)}${ev.t ? ` <span class="chip ${ev.t > 0 ? 'warm' : 'cold'}">온기 ${ev.t > 0 ? '+' : ''}${ev.t}℃</span>` : ''}</span>` : '');
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
  function fadeIn(el) {
    el.classList.remove('fade-in');
    if (UI.reduceMotion()) return;
    void el.offsetWidth;
    el.classList.add('fade-in');
  }

  // ---------- 장면 ----------
  function renderScene() {
    const sc = S.scenes[st.node];
    const s = story();
    if (UI.current !== 'play') UI.show('play');
    $('play').dataset.era = s.id;
    $('chap').textContent = `${sc.ch}장`;
    $('stageTag').textContent = `${s.era} · ${s.title}`;
    hud();
    if (shownBg !== sc.bg) {
      $('backdrop').innerHTML = Art.scene(sc.bg);
      shownBg = sc.bg;
    }
    const egg = $('egg');
    egg.innerHTML = Art.egg(skin(), { mood: sc.mood, cracks: st.c, label: `계란이 (${sc.place})` });
    animateEgg(egg, st.notes.some((n) => n.cls === 'crack'));
    setSay($('say'));
    floaters();
    fadeIn($('dialog'));
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
    if (!speed || UI.reduceMotion() || opt('instant')) return finish(false);
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

  // 선택지가 실제로 가는 곳 (조건을 채우면 alt의 to)
  const targetOf = (ch) => resolve((ch.alt && meets(ch.alt.need) && ch.alt.to) || ch.to);
  const seen = (id) => (S.endings[id] ? Boolean(Store.book.endings[id]) : Boolean(S.scenes[id] && !S.scenes[id].branch && Store.book.scenes[id]));

  // 관리자 '선택지 결과 미리 보기': 어디로 가고 무엇이 바뀌는지 한 줄로
  function peekLine(ch) {
    const where = (to) => { const id = resolve(to); return (to === NEXT ? '다음 정거장 · ' : '') + (S.endings[id] ? `엔딩 「${S.endings[id].title}」` : S.scenes[id] && S.scenes[id].branch ? '둥지(상태로 결정)' : S.scenes[id] ? S.scenes[id].place : id); };
    const fxText = (r) => {
      const out = [];
      const fx = r.fx || {};
      if (fx.t) out.push(`온기 ${fx.t > 0 ? '+' : ''}${fx.t}`);
      if (fx.c) out.push(`금 +${fx.c}`);
      (r.gain || []).forEach((id) => out.push(`+${nameOf(id)}`));
      (r.use || []).forEach((id) => out.push(`-${nameOf(id)}`));
      return out.join(' · ');
    };
    const parts = [`→ ${where(ch.to)}`, fxText(ch)].filter(Boolean);
    if (ch.game) {
      const w = ch.game.win || {};
      const l = ch.game.lose || {};
      parts.push(`성공: ${[w.to ? where(w.to) : '', fxText(w)].filter(Boolean).join(' · ') || '그대로'}`);
      parts.push(`실패: ${[l.to ? where(l.to) : '', fxText(l)].filter(Boolean).join(' · ') || '그대로'}`);
    }
    if (ch.alt) parts.push(`${meets(ch.alt.need) ? '조건 충족' : '조건 미충족'}: ${[ch.alt.to ? where(ch.alt.to) : '', fxText(ch.alt)].filter(Boolean).join(' · ') || '문장만 바뀜'}`);
    return parts.join('  |  ');
  }

  function renderChoices(sc, reveal = false) {
    $('choices').innerHTML = orderOf(st.node).map((i, pos) => {
      const ch = sc.choices[i];
      const tags = [];
      if (ch.game) tags.push(`<span class="tag game">${esc(Minigames.label(ch.game))} 게임 · ${esc(ch.game.title)}</span>`);
      if (ch.alt && meets(ch.alt.need)) tags.push(`<span class="tag alt">${esc(ch.alt.tag)}</span>`);
      if (seen(targetOf(ch))) tags.push('<span class="tag seen">가 본 길</span>');
      const peek = opt('peek') ? `<span class="peek">${esc(peekLine(ch))}</span>` : '';
      return `<button type="button" class="choice" data-i="${i}"><span class="key">${LETTERS[pos]}</span>` +
        `<span class="lbl">${esc(ch.label)}</span>${tags.length ? `<span class="tags">${tags.join('')}</span>` : ''}${peek}</button>`;
    }).join('');
    // 휴대폰처럼 화면이 작으면, 글을 다 읽었을 때 선택지가 화면 아래로 숨지 않게 살짝 올려 준다.
    const box = $('choices');
    if (reveal && box.getBoundingClientRect().top > window.innerHeight - 80) {
      box.scrollIntoView({ block: 'nearest', behavior: UI.reduceMotion() ? 'auto' : 'smooth' });
    }
  }

  // 진행 화면 밖에서 상태를 바꾼 뒤 글은 그대로 두고 상단, 계란, 선택지만 다시 그린다.
  function refresh() {
    const sc = S.scenes[st.node];
    if (!sc || sc.branch || UI.current !== 'play') return;
    hud();
    $('egg').innerHTML = Art.egg(skin(), { mood: sc.mood, cracks: st.c, label: `계란이 (${sc.place})` });
    $('btnUndo').disabled = !st.hist.length;
    if (!typing) renderChoices(sc);
  }

  // ---------- 선택 ----------
  function snapshot() {
    const { hist, ...rest } = st;
    return JSON.parse(JSON.stringify(rest));
  }

  function play(game, done) {
    if (opt('autoWin')) {
      UI.toast(`관리자: <b>${esc(game.title)}</b> 자동 성공`);
      Sound.play('win');
      done(true);
      return;
    }
    Minigames.run(game, done);
  }

  function choose(i) {
    if (busy || UI.current !== 'play' || UI.modalOpen) return;
    if (typing) { skip(); return; }
    const ch = S.scenes[st.node].choices[i];
    if (!ch) return;
    Sound.play('pick');
    if (!ch.game) { apply(ch, i, null); return; }
    busy = true;
    play(ch.game, (win) => {
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
    st.log.push({ place: sc.place, text: lines(sc.text), pick: `${LETTERS[orderOf(st.node).indexOf(i)]}. ${ch.label}` });
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

    let next = st.c >= MAX_CRACK ? story().crash : resolve(o.to);
    while (S.scenes[next] && S.scenes[next].branch) next = S.scenes[next].branch(st, story());
    st.event = null;
    const nextScene = S.scenes[next];
    if (nextScene && nextScene.ch < 4 && Math.random() < ROAD_CHANCE) st.event = rollEvent('road');
    go(next);
  }

  // record가 거짓이면 엔딩을 도감에 기록하지 않는다 (관리자 미리 보기)
  function go(id, record = true) {
    st.node = id;
    if (S.endings[id]) {
      running = false;
      renderEnding(record);
    } else {
      running = true;
      if (!st.path) st.path = [];
      if (!st.path.includes(id)) st.path.push(id);
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
      st.event = rollEvent('open');
      shownBg = null;
      skinsBefore = openSkins();
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

  // 이번 모험을 시작할 때 열려 있던 스킨. 모험 도중에 (선택·장면·플레이 횟수로) 열린 스킨도 엔딩에서 함께 알려 준다.
  let skinsBefore = null;
  const openSkins = () => new Set(UI.unlockedSkins().map((k) => k.id));

  function continueGame() {
    const run = Store.loadRun();
    if (!run || !S.scenes[run.node]) { UI.show('stories'); return; }
    skinsBefore = openSkins();
    st = { ...fresh(UI.runStory(run)), ...run, story: UI.runStory(run), hist: Array.isArray(run.hist) ? run.hist : [] };
    st.notes = (st.notes || []).map(({ float, ...n }) => n);
    if (!Array.isArray(st.route)) st.route = makeRoute(story());
    if (!Array.isArray(st.path)) st.path = [st.node];
    shownBg = null;
    Sound.play('pick');
    go(st.node);
  }

  // ---------- 엔딩 ----------
  function renderEnding(record = true) {
    const e = S.endings[st.node];
    const no = UI.endingNo(st.node);
    const before = record && skinsBefore ? skinsBefore : openSkins();
    const isNew = record ? Store.markEnding(st.node, st.steps, e.kind) : false;
    if (record) Store.clearRun();
    const unlocked = UI.unlockedSkins().filter((k) => !before.has(k.id));
    if (record) skinsBefore = openSkins(); // 되돌리기로 다른 엔딩을 보면 그 뒤에 열린 것만 알린다
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
    renderNext(no.story);
    $('endRoute').innerHTML = st.log.map((l) => `<li><b>${esc(l.place)}</b> <span class="pick">${esc(l.pick)}</span></li>`).join('');
    $('btnEndUndo').disabled = !st.hist.length;
    $('btnRetry').textContent = `${no.story.era} 이야기 다시`;

    Sound.play(e.kind === 'bad' ? 'bad' : 'good');
    if (st.node === story().crash) Sound.buzz([120, 60, 200]);
    if (!record) UI.toast('관리자 미리 보기예요. 도감에는 기록하지 않았어요.');
    unlocked.forEach((k, n) => setTimeout(() => UI.toast(`새 스킨 해금: <b>${esc(k.name)}</b>`), 700 + n * 450));
  }

  // 엔딩 화면: 이 이야기에서 아직 못 본 엔딩 수와 힌트 하나
  function renderNext(s) {
    const left = Object.keys(s.endings).filter((id) => !Store.book.endings[id]);
    const box = $('endNext');
    if (!left.length) {
      box.innerHTML = `<p><b>${esc(s.era)} 이야기의 엔딩을 모두 모았어요!</b> 다른 시대의 계란이도 만나 보세요.</p>`;
      return;
    }
    box.innerHTML = `<p>${esc(s.era)} 이야기에서 아직 못 본 엔딩 <b>${left.length}개</b></p>` +
      '<button type="button" class="btn small" data-next="hint">힌트 하나 보기</button>';
    box.querySelector('[data-next="hint"]').addEventListener('click', (ev) => {
      Sound.play('tap');
      const id = left[Math.floor(Math.random() * left.length)];
      const p = document.createElement('p');
      p.className = 'hint-text';
      p.textContent = `힌트: ${S.endings[id].hint}`;
      ev.currentTarget.replaceWith(p);
    });
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
  // 잠깐 멈춤: 지금 상태 요약 → 크게 '이어서 하기' → 자주 쓰는 것 4칸 → 나머지는 작게
  const PAUSE_ICONS = {
    log: '<path d="M8 5 H22 L26 9 V27 H8 Z"/><path d="M12 13 H22 M12 18 H22 M12 23 H18"/>',
    bag: '<path d="M7 11 H25 L23 27 H9 Z"/><path d="M12 11 V9 a4 4 0 0 1 8 0 V11"/>',
    help: '<circle cx="16" cy="16" r="11"/><path d="M12.5 12.5 a3.5 3.5 0 1 1 5 3.2 c-1.2 0.7 -1.5 1.5 -1.5 2.8"/><circle cx="16" cy="22.5" r="0.8"/>',
    settings: '<circle cx="16" cy="16" r="4"/><path d="M16 4 v4 M16 24 v4 M4 16 h4 M24 16 h4 M7.5 7.5 l2.8 2.8 M21.7 21.7 l2.8 2.8 M7.5 24.5 l2.8 -2.8 M21.7 10.3 l2.8 -2.8"/>',
  };
  const pauseIcon = (k) => `<svg viewBox="0 0 32 32" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${PAUSE_ICONS[k]}</svg>`;

  function pauseMenu() {
    const s = story();
    const sc = S.scenes[st.node] || {};
    const tiles = [['log', '지난 이야기'], ['bag', `가방·친구 <small>${st.bag.length + st.friends.length}</small>`], ['help', '플레이 가이드'], ['settings', '설정']];
    const body = UI.modal({
      title: '잠깐 멈춤',
      body: `<div class="pause-head" data-era="${s.id}"><span class="era-pill">${esc(UI.storyLabel(s))}</span>` +
        `<b>「${esc(s.title)}」</b><small>${sc.ch || 1}장 · ${esc(sc.place || '')}</small></div>` +
        `<dl class="pause-stats"><div><dt>온기</dt><dd class="${st.t >= READY_TEMP ? 'hot' : ''}">${st.t.toFixed(1)}℃</dd></div>` +
        `<div><dt>껍질의 금</dt><dd class="${st.c ? 'bad' : ''}">${st.c} / ${MAX_CRACK}</dd></div>` +
        `<div><dt>고른 선택</dt><dd>${st.steps}번</dd></div></dl>` +
        `<p class="pause-goal"><b>목표</b> ${esc(s.goal)}</p>` +
        '<button type="button" class="btn primary big pause-resume" data-act="resume">▶ 이어서 하기</button>' +
        `<div class="pause-tiles">${tiles.map(([a, l]) => `<button type="button" class="pause-tile" data-act="${a}">${pauseIcon(a)}<span>${l}</span></button>`).join('')}</div>` +
        (window.App.adminAccount ? '<button type="button" class="btn small admin-btn pause-admin" data-act="admin">관리자 뷰어</button>' : '') +
        '<div class="pause-more"><button type="button" class="link-btn" data-act="restart">처음부터 다시</button>' +
        '<button type="button" class="link-btn" data-act="stories">다른 이야기</button>' +
        '<button type="button" class="link-btn" data-act="title">타이틀로</button></div>' +
        '<p class="hint pause-saved">지금까지의 모험은 자동으로 저장돼요.</p>',
      actions: [],
    });
    body.querySelector('.pause-resume').focus({ preventScroll: true });
    body.addEventListener('click', (ev) => {
      const b = ev.target.closest('[data-act]');
      if (!b) return;
      const act = b.dataset.act;
      UI.closeModal();
      Sound.play('tap');
      if (act === 'log') showLog();
      else if (act === 'bag') showBag();
      else if (act === 'help') UI.help();
      else if (act === 'settings') UI.show('settings');
      else if (act === 'admin') UI.show('admin');
      else if (act === 'title') UI.show('title');
      else if (act === 'stories') UI.show('stories');
      else if (act === 'restart') {
        UI.confirmBox({ title: '처음부터 다시 할까요?', text: '지금 모험은 사라지고 이 이야기의 처음으로 돌아가요.', ok: '다시 시작', danger: true, run: () => newGame(st.story) });
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

  // ---------- 관리자 화면이 쓰는 진행 API ----------
  window.App.game = {
    get state() { return st; },
    get running() { return running; },
    nameOf, meets, fresh, peekLine,
    // 상태 바꾸기: fn(st) 뒤에 저장하고 화면을 맞춘다.
    update(fn) {
      fn(st);
      st.t = Math.max(0, Math.min(40, Number(st.t) || 0));
      st.c = Math.max(0, Math.min(MAX_CRACK - 1, Math.round(st.c) || 0));
      if (running) save();
      if (UI.current === 'play') refresh();
      else dirty = true;
    },
    // 장면이나 엔딩으로 바로 가기 (엔딩은 도감에 기록하지 않는 미리 보기)
    jump(id) {
      const target = S.scenes[id] || S.endings[id];
      if (!target) return;
      if (running && target.story === st.story) st.hist.push(snapshot());
      else { st = fresh(target.story); shownBg = null; }
      st.say = null;
      st.notes = [];
      go(id, false);
    },
    start(storyId) { newGame(storyId); },
    resume: continueGame,
    refresh,
  };
  window.App.onScreen = (id) => {
    if (id === 'play' && dirty) { dirty = false; refresh(); }
  };

  // ---------- 입력 ----------
  $('btnAdmin').addEventListener('click', () => { Sound.play('tap'); UI.show('admin'); });
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
    if (Minigames.active) {
      if (k === 'Tab') UI.trapFocus(ev, document.querySelector('#minigame .sheet'));
      else Minigames.key(ev);
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
      if (idx !== undefined) choose(orderOf(st.node)[idx]);
    } else if (['stories', 'book', 'closet', 'settings', 'credits', 'admin'].includes(UI.current) && k === 'Escape') {
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
    running = false;
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
