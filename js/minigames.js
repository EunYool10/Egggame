// 계란이의 모험 — 미니게임 6종: 타이밍 · 연타 · 균형 · 피하기 · 순서 기억 · 수수께끼
// 선택지의 game: { type, title, hint, speed, hazard(피하기 장애물), quiz(수수께끼) } 하나를 받아 성공/실패를 알려 준다.
// 난이도(설정)와 speed(장면마다 주는 배율)에 따라 칸 넓이, 속도, 시간, 길이가 바뀐다.
window.Minigames = (() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const Store = window.Store;
  const Sound = window.Sound;
  const Art = window.Art;
  const esc = (s) => String(s).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);

  const TYPES = {
    timing: { name: '타이밍', desc: '왔다 갔다 하는 계란이를 노란 칸에서 멈춰요.', keys: '스페이스바나 엔터로도 누를 수 있어요.' },
    mash: { name: '연타', desc: '시간 안에 버튼을 빠르게 눌러 게이지를 채워요.', keys: '스페이스바나 엔터를 빠르게 눌러도 돼요.' },
    balance: { name: '균형', desc: '◀ ▶로 몸을 기울여 끝까지 떨어지지 않게 버텨요.', keys: '← → 방향키를 누르고 있어도 돼요.' },
    dodge: { name: '피하기', desc: '세 줄 가운데 한 곳으로 움직여 떨어지는 것을 피해요.', keys: '← → 방향키로도 움직일 수 있어요.' },
    memory: { name: '순서 기억', desc: '반짝이는 순서를 기억했다가 그대로 눌러요.', keys: '1·2·3·4 키로도 누를 수 있어요.' },
    quiz: { name: '수수께끼', desc: '시간 안에 알맞은 답을 골라요.', keys: '1·2·3 키로도 고를 수 있어요.' },
  };
  const LEVEL = { easy: '쉬움', normal: '보통', hard: '어려움' };
  const level = () => (LEVEL[Store.settings.difficulty] ? Store.settings.difficulty : 'normal');
  const reduce = () => Boolean(window.UI && window.UI.reduceMotion());
  const typeOf = (game) => (TYPES[game && game.type] ? game.type : 'timing');

  // 관리자 화면의 연습용 게임
  const SAMPLES = {
    timing: { type: 'timing', title: '타이밍 연습', hint: '노란 칸에 왔을 때 멈추세요!' },
    mash: { type: 'mash', title: '연타 연습', hint: '버튼을 빠르게 눌러 게이지를 채우세요!' },
    balance: { type: 'balance', title: '균형 연습', hint: '◀ ▶로 몸을 기울여 가운데를 지키세요!' },
    dodge: { type: 'dodge', hazard: 'rock', title: '피하기 연습', hint: '◀ ▶로 떨어지는 돌을 피하세요!' },
    memory: { type: 'memory', title: '순서 기억 연습', hint: '반짝이는 순서를 기억했다가 그대로 누르세요!' },
    quiz: {
      type: 'quiz', title: '수수께끼 연습', hint: '알맞은 답을 고르세요!',
      quiz: { q: '닭이 먼저일까, 달걀이 먼저일까? 계란이의 대답은?', options: ['치킨이 마지막!', '달걀이 먼저!', '닭이 먼저!'], answer: 0 },
    },
  };

  // 피하기 게임에서 떨어지는 것들 (40×40)
  const HAZARD = {
    rock: '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M6 28 C2 18 10 6 22 7 C34 8 39 20 34 30 C30 37 12 38 6 28 Z" fill="#9aa5ad" stroke="#3b2f2a" stroke-width="2.5"/><path d="M14 16 l6 4 M24 26 l5 -3" stroke="#6b7780" stroke-width="2" stroke-linecap="round"/></svg>',
    light: '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M13 6 H27 L38 38 H2 Z" fill="#ffe27a" opacity=".9"/><rect x="12" y="1" width="16" height="7" rx="2" fill="#6b7780" stroke="#3b2f2a" stroke-width="2"/></svg>',
    paw: '<svg viewBox="0 0 40 40" aria-hidden="true"><ellipse cx="20" cy="26" rx="13" ry="11" fill="#f08a24" stroke="#3b2f2a" stroke-width="2.5"/>' +
      '<circle cx="9" cy="12" r="5" fill="#f08a24" stroke="#3b2f2a" stroke-width="2"/><circle cx="20" cy="8" r="5" fill="#f08a24" stroke="#3b2f2a" stroke-width="2"/><circle cx="31" cy="12" r="5" fill="#f08a24" stroke="#3b2f2a" stroke-width="2"/>' +
      '<path d="M14 24 l5 3 M22 22 l5 3" stroke="#3b2f2a" stroke-width="2.4" stroke-linecap="round"/></svg>',
    claw: '<svg viewBox="0 0 40 40" aria-hidden="true"><rect x="17" y="0" width="6" height="15" fill="#8c99a6" stroke="#3b2f2a" stroke-width="2"/>' +
      '<path d="M20 14 L7 30 L12 35 L20 23 L28 35 L33 30 Z" fill="#b8c2cb" stroke="#3b2f2a" stroke-width="2.4" stroke-linejoin="round"/></svg>',
  };
  const PADS = [
    { color: '#e05a47', mark: '●', tone: 'pad0' },
    { color: '#e09a00', mark: '▲', tone: 'pad1' },
    { color: '#3f8fd0', mark: '■', tone: 'pad2' },
    { color: '#2f9a62', mark: '◆', tone: 'pad3' },
  ];

  let cur = null; // 진행 중인 게임 { key(ev), keyup(ev), stop() }

  // "준비… 시작!"을 잠깐 보여 준 뒤 start를 부른다. 그동안 누른 것은 무시한다.
  function ready(result, start) {
    result.textContent = '준비…';
    result.className = 'game-result ready';
    const a = setTimeout(() => {
      result.textContent = '시작!';
      result.className = 'game-result go';
      start();
    }, reduce() ? 350 : 750);
    const b = setTimeout(() => { if (result.textContent === '시작!') result.textContent = ''; }, reduce() ? 900 : 1300);
    return () => { clearTimeout(a); clearTimeout(b); };
  }
  // 남은 시간 막대. 0이 되면 onEnd를 부른다. 멈출 때는 돌려준 함수를 부른다.
  function countdown(bar, seconds, onEnd) {
    let t0 = 0;
    let raf = 0;
    const frame = (now) => {
      if (!t0) t0 = now;
      const left = Math.max(0, 1 - (now - t0) / 1000 / seconds);
      bar.style.width = left * 100 + '%';
      bar.classList.toggle('low', left < 0.3);
      if (left <= 0) { onEnd(); return; }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }
  const isPress = (ev) => ev.key === ' ' || ev.key === 'Enter';
  const pads2 = () => '<div class="g-pads"><button type="button" class="btn big" data-dir="-1" aria-label="왼쪽">◀</button>' +
    '<button type="button" class="btn big" data-dir="1" aria-label="오른쪽">▶</button></div>';

  const BUILD = {
    // ---------- 타이밍: 노란 칸에서 멈추기 ----------
    timing({ body, lv, speed, finish, result }) {
      const d = { easy: { zone: 0.3, v: 0.75 }, normal: { zone: 0.2, v: 1 }, hard: { zone: 0.13, v: 1.35 } }[lv];
      body.innerHTML = '<div class="track"><div class="zone"></div><div class="marker"></div></div>' +
        '<button type="button" class="btn primary big" data-g="go">지금!</button>';
      const marker = body.querySelector('.marker');
      const zone = body.querySelector('.zone');
      const left = 0.12 + Math.random() * (0.76 - d.zone);
      // 계란이 몸통(26px)이 막대 밖으로 잘리지 않게, 양 끝 13px 안쪽을 0~1로 쓴다.
      const at = (f) => `calc(13px + ${f} * (100% - 26px))`;
      zone.style.left = at(left);
      zone.style.width = `calc(${d.zone} * (100% - 26px))`;
      const vel = 0.85 * d.v * speed * (reduce() ? 0.7 : 1); // 1초에 트랙 몇 바퀴
      let pos = 0;
      let dir = 1;
      let last = 0;
      let raf = 0;
      let live = false;
      const frame = (now) => {
        const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
        last = now;
        pos += dir * vel * dt;
        if (pos > 1) { pos = 2 - pos; dir = -1; }
        if (pos < 0) { pos = -pos; dir = 1; }
        marker.style.left = at(pos);
        raf = requestAnimationFrame(frame);
      };
      const press = () => {
        if (!live) return;
        live = false;
        cancelAnimationFrame(raf);
        finish(pos >= left - 0.02 && pos <= left + d.zone + 0.02); // 계란 몸통만큼 살짝 봐준다
      };
      body.querySelector('[data-g="go"]').addEventListener('click', press);
      body.querySelector('.track').addEventListener('pointerdown', press);
      body.querySelector('[data-g="go"]').focus();
      const cancel = ready(result, () => { live = true; raf = requestAnimationFrame(frame); });
      return {
        key(ev) { if (isPress(ev)) { ev.preventDefault(); if (!ev.repeat) press(); } },
        stop() { cancel(); cancelAnimationFrame(raf); live = false; },
      };
    },

    // ---------- 연타: 시간 안에 게이지 채우기 ----------
    mash({ body, lv, speed, finish, result }) {
      const need = Math.round({ easy: 10, normal: 14, hard: 18 }[lv] * speed);
      const seconds = 4;
      body.innerHTML = `<div class="g-gauge"><i></i><span>0 / ${need}</span></div><div class="g-timer"><i></i></div>` +
        '<button type="button" class="btn primary big g-mash" data-g="go">누르기!</button>';
      const fill = body.querySelector('.g-gauge i');
      const label = body.querySelector('.g-gauge span');
      const btn = body.querySelector('[data-g="go"]');
      let count = 0;
      let live = false;
      let stopTimer = () => {};
      const tap = () => {
        if (!live) return;
        count += 1;
        fill.style.width = Math.min(1, count / need) * 100 + '%';
        label.textContent = `${count} / ${need}`;
        Sound.play('mash');
        btn.classList.remove('pop');
        void btn.offsetWidth;
        btn.classList.add('pop');
        if (count >= need) { live = false; stopTimer(); finish(true); }
      };
      btn.addEventListener('pointerdown', (ev) => { ev.preventDefault(); tap(); });
      btn.addEventListener('click', (ev) => { if (ev.detail === 0) tap(); }); // 키보드·보조기기로 누른 클릭 (마우스는 pointerdown에서 셌다)
      btn.focus();
      const cancel = ready(result, () => {
        live = true;
        stopTimer = countdown(body.querySelector('.g-timer i'), seconds, () => { live = false; finish(false, `${count} / ${need}번`); });
      });
      return {
        key(ev) { if (isPress(ev)) { ev.preventDefault(); if (!ev.repeat) tap(); } },
        stop() { cancel(); stopTimer(); live = false; },
      };
    },

    // ---------- 균형: 떨어지지 않게 버티기 ----------
    balance({ body, lv, speed, finish, result }) {
      const p = { easy: { drift: 0.9, time: 3.5 }, normal: { drift: 1.3, time: 4.5 }, hard: { drift: 1.8, time: 5.5 } }[lv];
      body.innerHTML = '<div class="g-beam"><div class="g-egg"></div></div><div class="g-timer"><i></i></div>' + pads2();
      const eggEl = body.querySelector('.g-egg');
      eggEl.innerHTML = Art.egg(window.UI.currentSkin(), { mood: 'scared', label: '균형 잡는 계란이' });
      const timer = body.querySelector('.g-timer i');
      let pos = 0;
      let vel = 0;
      let push = 0;
      let drift = Math.random() < 0.5 ? -1 : 1;
      let flip = 0.6;
      let t0 = 0;
      let last = 0;
      let raf = 0;
      let live = false;
      const frame = (now) => {
        if (!t0) { t0 = now; last = now; }
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        flip -= dt;
        if (flip <= 0) { drift = Math.random() * 2 - 1; flip = 0.5 + Math.random() * 0.7; }
        // 바람(drift) + 내가 기울이는 힘(push) + 많이 기울수록 더 기우는 힘
        const acc = drift * p.drift * speed + push * 3.4 + pos * 0.6 * p.drift;
        vel = (vel + acc * dt) * (1 - 1.1 * dt);
        pos += vel * dt;
        eggEl.style.left = ((pos + 1) / 2) * 100 + '%';
        eggEl.style.transform = `translateX(-50%) rotate(${Math.max(-1, Math.min(1, pos)) * 35}deg)`;
        const left = Math.max(0, 1 - (now - t0) / 1000 / p.time);
        timer.style.width = left * 100 + '%';
        if (Math.abs(pos) >= 1) { live = false; finish(false, '떨어졌어요'); return; }
        if (left <= 0) { live = false; finish(true); return; }
        raf = requestAnimationFrame(frame);
      };
      const hold = (ev) => {
        const b = ev.target.closest('[data-dir]');
        if (!b) return;
        ev.preventDefault();
        push = Number(b.dataset.dir);
      };
      const release = () => { push = 0; };
      const pads = body.querySelector('.g-pads');
      pads.addEventListener('pointerdown', hold);
      ['pointerup', 'pointerleave', 'pointercancel'].forEach((t) => pads.addEventListener(t, release));
      const cancel = ready(result, () => { live = true; raf = requestAnimationFrame(frame); });
      return {
        key(ev) {
          if (ev.key === 'ArrowLeft' || ev.key === 'a') { ev.preventDefault(); push = -1; }
          if (ev.key === 'ArrowRight' || ev.key === 'd') { ev.preventDefault(); push = 1; }
        },
        keyup(ev) { if (['ArrowLeft', 'ArrowRight', 'a', 'd'].includes(ev.key)) push = 0; },
        stop() { cancel(); cancelAnimationFrame(raf); live = false; },
      };
    },

    // ---------- 피하기: 세 줄에서 떨어지는 것 피하기 ----------
    dodge({ body, lv, speed, game, finish, result }) {
      const p = {
        easy: { time: 4, every: 0.95, fall: 1.2, lives: 2 },
        normal: { time: 5, every: 0.75, fall: 0.95, lives: 1 },
        hard: { time: 6, every: 0.6, fall: 0.8, lives: 1 },
      }[lv];
      body.innerHTML = '<div class="g-field"><span class="lane"></span><span class="lane"></span><span class="lane"></span><div class="g-me"></div></div>' +
        '<div class="g-timer"><i></i></div><p class="g-lives"></p>' + pads2();
      const field = body.querySelector('.g-field');
      const me = body.querySelector('.g-me');
      const livesEl = body.querySelector('.g-lives');
      me.innerHTML = Art.egg(window.UI.currentSkin(), { mood: 'brave', label: '피하는 계란이' });
      const icon = HAZARD[game.hazard] || HAZARD.rock;
      let lane = 1;
      let hazards = [];
      let spawnIn = 0.35;
      let lives = p.lives;
      let cool = 0;
      let last = 0;
      let raf = 0;
      let live = false;
      let stopTimer = () => {};
      const showLives = () => { livesEl.textContent = p.lives > 1 ? `남은 기회 ${lives}번` : '한 번 부딪히면 끝!'; };
      const place = () => { me.style.left = lane * 33.333 + 16.667 + '%'; };
      const move = (to) => { if (live) { lane = Math.max(0, Math.min(2, to)); place(); } };
      const spawn = () => {
        const lanes = [Math.floor(Math.random() * 3)];
        if (lv === 'hard' && Math.random() < 0.3) lanes.push((lanes[0] + 1 + Math.floor(Math.random() * 2)) % 3); // 두 줄까지만, 늘 한 줄은 비운다
        lanes.forEach((l) => {
          const el = document.createElement('span');
          el.className = 'g-haz';
          el.innerHTML = icon;
          el.style.left = l * 33.333 + 16.667 + '%';
          field.appendChild(el);
          hazards.push({ lane: l, y: -0.12, el, hit: false });
        });
      };
      const frame = (now) => {
        const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
        last = now;
        spawnIn -= dt;
        if (spawnIn <= 0) { spawn(); spawnIn = p.every / speed; }
        cool = Math.max(0, cool - dt);
        hazards.forEach((h) => {
          h.y += dt / (p.fall / speed);
          h.el.style.top = h.y * 100 + '%';
          if (!h.hit && cool <= 0 && h.lane === lane && h.y > 0.72 && h.y < 0.92) {
            h.hit = true;
            lives -= 1;
            cool = 0.6;
            Sound.play('crack');
            field.classList.remove('hit');
            void field.offsetWidth;
            field.classList.add('hit');
            showLives();
          }
        });
        hazards = hazards.filter((h) => (h.y > 1.15 ? (h.el.remove(), false) : true));
        if (lives <= 0) { live = false; stopTimer(); finish(false, '부딪혔어요'); return; }
        raf = requestAnimationFrame(frame);
      };
      body.querySelector('.g-pads').addEventListener('pointerdown', (ev) => {
        const b = ev.target.closest('[data-dir]');
        if (!b) return;
        ev.preventDefault();
        move(lane + Number(b.dataset.dir));
      });
      field.addEventListener('pointerdown', (ev) => {
        const r = field.getBoundingClientRect();
        move(Math.floor(((ev.clientX - r.left) / r.width) * 3));
      });
      place();
      showLives();
      const cancel = ready(result, () => {
        live = true;
        raf = requestAnimationFrame(frame);
        stopTimer = countdown(body.querySelector('.g-timer i'), p.time, () => { live = false; cancelAnimationFrame(raf); finish(true); });
      });
      return {
        key(ev) {
          if (ev.key === 'ArrowLeft' || ev.key === 'a') { ev.preventDefault(); move(lane - 1); }
          if (ev.key === 'ArrowRight' || ev.key === 'd') { ev.preventDefault(); move(lane + 1); }
        },
        stop() { cancel(); stopTimer(); cancelAnimationFrame(raf); live = false; },
      };
    },

    // ---------- 순서 기억: 반짝인 순서대로 누르기 ----------
    memory({ body, lv, speed, finish }) {
      const len = { easy: 3, normal: 4, hard: 5 }[lv];
      const seq = Array.from({ length: len }, () => Math.floor(Math.random() * 4));
      body.innerHTML = '<div class="g-pads4">' + PADS.map((pd, i) =>
        `<button type="button" class="pad" data-pad="${i}" style="--pad:${pd.color}" aria-label="${i + 1}번 ${pd.mark}" disabled><span aria-hidden="true">${pd.mark}</span><small>${i + 1}</small></button>`).join('') +
        '</div><div class="g-timer"><i></i></div><p class="g-step">잘 보세요…</p>';
      const pads = [...body.querySelectorAll('.pad')];
      const step = body.querySelector('.g-step');
      const timers = [];
      let phase = 'show';
      let idx = 0;
      let stopTimer = () => {};
      const flash = (i, ms) => {
        pads[i].classList.add('lit');
        Sound.play(PADS[i].tone);
        timers.push(setTimeout(() => pads[i].classList.remove('lit'), ms));
      };
      const on = (reduce() ? 560 : 480) / speed;
      const gap = 220 / speed;
      seq.forEach((v, k) => timers.push(setTimeout(() => flash(v, on), 700 + k * (on + gap))));
      timers.push(setTimeout(() => {
        phase = 'input';
        step.textContent = `이제 순서대로 눌러 보세요 (0 / ${len})`;
        pads.forEach((b) => { b.disabled = false; });
        pads[0].focus();
        // 누르는 시간에도 끝이 있다 (한 칸에 2초쯤)
        stopTimer = countdown(body.querySelector('.g-timer i'), len * 2 + 3, () => {
          if (phase !== 'input') return;
          phase = 'done';
          finish(false, '시간이 다 됐어요');
        });
      }, 700 + len * (on + gap)));
      const press = (i) => {
        if (phase !== 'input') return;
        flash(i, 200);
        if (i !== seq[idx]) { phase = 'done'; stopTimer(); finish(false, '순서가 달라요'); return; }
        idx += 1;
        step.textContent = `이제 순서대로 눌러 보세요 (${idx} / ${len})`;
        if (idx >= len) { phase = 'done'; stopTimer(); finish(true); }
      };
      body.querySelector('.g-pads4').addEventListener('click', (ev) => {
        const b = ev.target.closest('[data-pad]');
        if (b) press(Number(b.dataset.pad));
      });
      return {
        key(ev) {
          const k = { 1: 0, 2: 1, 3: 2, 4: 3 }[ev.key];
          if (k !== undefined) { ev.preventDefault(); press(k); }
        },
        stop() { timers.forEach(clearTimeout); stopTimer(); phase = 'done'; },
      };
    },

    // ---------- 수수께끼: 알맞은 답 고르기 ----------
    quiz({ body, lv, game, finish }) {
      const q = game.quiz || SAMPLES.quiz.quiz;
      const seconds = { easy: 15, normal: 11, hard: 8 }[lv];
      const order = q.options.map((_, i) => i).sort(() => Math.random() - 0.5);
      body.innerHTML = `<p class="g-q">${esc(q.q)}</p><div class="g-timer"><i></i></div><div class="g-opts">` +
        order.map((oi, n) => `<button type="button" class="btn g-opt" data-opt="${oi}"><b>${n + 1}</b><span>${esc(q.options[oi])}</span></button>`).join('') + '</div>';
      let live = true;
      const pick = (oi) => {
        if (!live) return;
        live = false;
        stopTimer();
        body.querySelectorAll('.g-opt').forEach((b) => {
          b.disabled = true;
          const v = Number(b.dataset.opt);
          if (v === q.answer) b.classList.add('right');
          else if (v === oi) b.classList.add('wrong');
        });
        finish(oi === q.answer, oi === q.answer ? '' : `정답은 "${q.options[q.answer]}"`);
      };
      const stopTimer = countdown(body.querySelector('.g-timer i'), seconds, () => pick(-1));
      body.querySelector('.g-opts').addEventListener('click', (ev) => {
        const b = ev.target.closest('[data-opt]');
        if (b) pick(Number(b.dataset.opt));
      });
      body.querySelector('.g-opt').focus();
      return {
        key(ev) {
          const n = { 1: 0, 2: 1, 3: 2, a: 0, b: 1, c: 2 }[ev.key.toLowerCase()];
          if (n !== undefined && order[n] !== undefined) { ev.preventDefault(); pick(order[n]); }
        },
        stop() { stopTimer(); live = false; },
      };
    },
  };

  // 게임 하나를 띄운다. done(win)은 결과를 1초 보여 준 뒤 부른다.
  function run(game, done) {
    const type = typeOf(game);
    const lv = level();
    const result = $('gameResult');
    const body = $('gameBody');
    $('gameType').textContent = `${TYPES[type].name} 미니게임`;
    $('gameLevel').textContent = LEVEL[lv];
    $('gameTitle').textContent = game.title;
    $('gameHint').textContent = game.hint || TYPES[type].desc;
    $('gameKeys').textContent = TYPES[type].keys;
    result.textContent = '';
    result.className = 'game-result';
    body.className = `game-body g-${type}`;
    body.innerHTML = '';
    $('minigame').hidden = false;
    let over = false;
    const finish = (win, note) => {
      if (over) return;
      over = true;
      if (cur) cur.stop();
      cur = null;
      result.textContent = (win ? '성공!' : '아깝다!') + (note ? ` · ${note}` : '');
      result.className = `game-result ${win ? 'win' : 'lose'}`;
      Sound.play(win ? 'win' : 'lose');
      setTimeout(() => {
        $('minigame').hidden = true;
        body.innerHTML = '';
        done(win);
      }, 1100);
    };
    cur = BUILD[type]({ body, game, lv, speed: game.speed || 1, finish, result });
  }

  // 게임 화면이 떠 있는 동안의 키 입력 (game.js의 키 처리에서 넘겨받는다)
  function key(ev) {
    if (cur && cur.key) cur.key(ev);
    else if (ev.key === ' ') ev.preventDefault(); // 결과를 보여 주는 동안 화면이 내려가지 않게
  }
  document.addEventListener('keyup', (ev) => { if (cur && cur.keyup) cur.keyup(ev); });

  return {
    TYPES, SAMPLES,
    run, key,
    get active() { return !$('minigame').hidden; },
    label: (game) => TYPES[typeOf(game)].name,
  };
})();
