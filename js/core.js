// 계란이의 모험 v2 — 저장(설정·진행·도감), 소리(Web Audio 합성), 진동
// 저장은 이 브라우저의 localStorage에만 한다. 막혀 있으면 이번 방문 동안만 기억한다.
window.Store = (() => {
  'use strict';

  const KEY = { settings: 'egg2:settings', run: 'egg2:run', book: 'egg2:book', v1: 'egg-adventure:endings' };
  const DEFAULTS = {
    speed: 'normal', // slow · normal · fast · instant
    size: 'm', // s · m · l
    theme: 'system', // system · light · dark
    sfx: true,
    bgm: false,
    volume: 0.7,
    haptics: true,
    difficulty: 'normal', // easy · normal · hard
    motion: 'system', // system · reduce
    skin: 'white',
  };

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw == null ? fallback : JSON.parse(raw);
    } catch (e) { return fallback; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (e) { return false; }
  }
  function remove(key) {
    try { localStorage.removeItem(key); } catch (e) { /* 무시 */ }
  }

  function emptyBook() {
    return { endings: {}, scenes: {}, stats: { plays: 0, finished: 0, crashes: 0, choices: 0, bestTrue: null } };
  }
  function loadBook() {
    const saved = read(KEY.book, null);
    const base = emptyBook();
    const book = saved && typeof saved === 'object'
      ? { ...base, ...saved, stats: { ...base.stats, ...(saved.stats || {}) } }
      : base;
    // v1에서 본 엔딩은 도감으로 이어받는다.
    const old = read(KEY.v1, null);
    if (Array.isArray(old)) old.forEach((id) => { if (!book.endings[id]) book.endings[id] = { n: 1, first: Date.now() }; });
    return book;
  }

  const settings = { ...DEFAULTS, ...read(KEY.settings, {}) };
  let book = loadBook();

  return {
    settings,
    get book() { return book; },
    set(key, value) {
      settings[key] = value;
      write(KEY.settings, settings);
    },
    saveBook() { write(KEY.book, book); },
    // 엔딩 기록. 처음 본 엔딩이면 true
    markEnding(id, steps, kind) {
      const fresh = !book.endings[id];
      const rec = book.endings[id] || { n: 0, first: Date.now() };
      rec.n += 1;
      book.endings[id] = rec;
      book.stats.finished += 1;
      if (id === 'e_crash') book.stats.crashes += 1;
      if (kind === 'true' && (book.stats.bestTrue == null || steps < book.stats.bestTrue)) book.stats.bestTrue = steps;
      write(KEY.book, book);
      return fresh;
    },
    markScene(id) {
      if (book.scenes[id]) return;
      book.scenes[id] = 1;
      write(KEY.book, book);
    },
    countPlay() { book.stats.plays += 1; write(KEY.book, book); },
    countChoice() { book.stats.choices += 1; write(KEY.book, book); },
    loadRun() { return read(KEY.run, null); },
    saveRun(run) { return write(KEY.run, run); },
    clearRun() { remove(KEY.run); },
    resetAll() {
      [KEY.run, KEY.book, KEY.v1].forEach(remove);
      book = emptyBook();
    },
  };
})();

window.Sound = (() => {
  'use strict';

  const S = () => window.Store.settings;
  let ctx = null;
  let master = null;

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    master.gain.value = S().volume;
    return ctx;
  }

  function tone(freq, dur, o = {}) {
    const t0 = ctx.currentTime + (o.when || 0);
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    if (o.slide) osc.frequency.exponentialRampToValueAtTime(freq * o.slide, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(o.vol || 0.2, t0 + (o.attack || 0.005));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  function noise(dur, vol, freq) {
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2;
    const src = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const g = ctx.createGain();
    src.buffer = buf;
    filter.type = 'bandpass';
    filter.frequency.value = freq;
    g.gain.value = vol;
    src.connect(filter);
    filter.connect(g);
    g.connect(master);
    src.start();
  }

  const arp = (notes, gap, o) => notes.forEach((f, i) => tone(f, o.dur || 0.2, { ...o, when: i * gap }));
  const FX = {
    tap: () => tone(660, 0.08, { type: 'triangle', vol: 0.12, slide: 1.5 }),
    pick: () => arp([520, 780], 0.07, { type: 'triangle', vol: 0.16, dur: 0.14 }),
    type: () => tone(1150 + Math.random() * 250, 0.02, { type: 'square', vol: 0.018 }),
    crack: () => { noise(0.28, 0.6, 2400); tone(190, 0.22, { type: 'sawtooth', vol: 0.1, slide: 0.5 }); },
    shield: () => arp([440, 880, 1320], 0.06, { type: 'sine', vol: 0.15, dur: 0.22 }),
    warm: () => arp([523, 659, 784], 0.06, { type: 'sine', vol: 0.1, dur: 0.28 }),
    cold: () => tone(520, 0.32, { type: 'sine', vol: 0.1, slide: 0.6 }),
    item: () => arp([784, 988, 1175, 1568], 0.07, { type: 'triangle', vol: 0.1, dur: 0.2 }),
    friend: () => arp([523, 784, 659, 1047], 0.09, { type: 'sine', vol: 0.12, dur: 0.24 }),
    good: () => arp([523, 659, 784, 1047, 784, 1047], 0.12, { type: 'triangle', vol: 0.13, dur: 0.32 }),
    bad: () => arp([392, 370, 349, 262], 0.18, { type: 'triangle', vol: 0.13, dur: 0.38 }),
    win: () => arp([659, 880, 1319], 0.06, { type: 'square', vol: 0.06, dur: 0.16 }),
    lose: () => tone(300, 0.36, { type: 'square', vol: 0.07, slide: 0.5 }),
  };

  function play(name) {
    if (!S().sfx || !FX[name] || !ensure()) return;
    try { FX[name](); } catch (e) { /* 소리 실패는 게임 진행에 영향 없음 */ }
  }

  // 배경 음악: 오르골 느낌의 짧은 선율을 반복한다.
  const NOTE = { F2: 87.31, G2: 98, A2: 110, C3: 130.81, C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880, C6: 1046.5 };
  const MELODY = ['E5', 'G5', 'A5', 'G5', 'E5', 'D5', 'C5', 'D5', 'E5', 'G5', 'C6', 'A5', 'G5', '-', '-', '-',
    'A5', 'G5', 'E5', 'D5', 'C5', 'D5', 'E5', 'G5', 'D5', 'E5', 'D5', 'C5', 'C5', '-', '-', '-'];
  const BASS = ['C3', 'A2', 'F2', 'G2', 'C3', 'A2', 'G2', 'C3'];
  const BEAT = 0.34;
  let timer = null;
  let step = 0;
  let next = 0;

  function schedule() {
    while (next < ctx.currentTime + 0.4) {
      const when = next - ctx.currentTime;
      const note = MELODY[step % MELODY.length];
      if (note !== '-') tone(NOTE[note], 0.6, { type: 'sine', vol: 0.045, when, attack: 0.01 });
      if (step % 4 === 0) tone(NOTE[BASS[(step / 4) % BASS.length]], 1.2, { type: 'triangle', vol: 0.035, when, attack: 0.03 });
      next += BEAT;
      step += 1;
    }
  }

  function music(on) {
    if (!on || !S().bgm) {
      clearInterval(timer);
      timer = null;
      return;
    }
    if (timer || !ensure()) return;
    next = ctx.currentTime + 0.1;
    timer = setInterval(schedule, 120);
  }

  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend();
    else ctx.resume();
  });

  return {
    play,
    music,
    setVolume(v) { if (master) master.gain.value = v; },
    buzz(pattern) {
      if (!S().haptics || !navigator.vibrate) return;
      try { navigator.vibrate(pattern); } catch (e) { /* 진동 미지원 */ }
    },
  };
})();
