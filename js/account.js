// 계란이의 모험 — Google 로그인, 계정 기록 동기화(Firestore), 관리자 확인
// Firebase 프로젝트 egggame-eunyool. 아래 웹 설정값은 원래 공개되는 값이고, 데이터 보호는 firestore.rules가 맡는다.
// Firebase SDK는 로그인할 때(또는 전에 로그인했던 기기에서)만 내려받는다.
window.Account = (() => {
  'use strict';

  const S = window.STORY;
  const M = window.META;
  const Store = window.Store;
  const UI = window.UI;
  const Sound = window.Sound;
  const $ = (id) => document.getElementById(id);
  const esc = UI.esc;

  const SDK = 'https://www.gstatic.com/firebasejs/10.12.2';
  const CONFIG = {
    apiKey: 'AIzaSyBimoVJqLWAE8o_QkvV-vmI0_ns17qwq5A',
    authDomain: 'egggame-eunyool.firebaseapp.com',
    projectId: 'egggame-eunyool',
    storageBucket: 'egggame-eunyool.firebasestorage.app',
    messagingSenderId: '116251064951',
    appId: '1:116251064951:web:d6c689bc33d9e85015e472',
  };
  const LAST_UID = 'egg2:uid'; // 이 기기에서 마지막으로 로그인한 계정 (다음 방문에 바로 그 기록을 보여 준다)
  const RUN_LIMIT = 40000; // firestore.rules의 run 길이 제한과 같다
  const SYNC_TEXT = { saving: '저장 중…', saved: '계정에 저장됨', error: '저장 실패 · 잠시 뒤 다시 시도해요' };

  let fb = null;
  let loading = null;
  let user = null;
  let state = 'guest'; // guest · loading · user · unavailable
  let sync = '';
  let ready = false; // 계정 기록을 한 번 받아 온 뒤에만 올린다
  let greet = false; // 직접 로그인 버튼을 눌렀을 때만 인사한다
  let timer = 0;

  const lastUid = {
    get() { try { return localStorage.getItem(LAST_UID); } catch (e) { return null; } },
    set(uid) { try { if (uid) localStorage.setItem(LAST_UID, uid); else localStorage.removeItem(LAST_UID); } catch (e) { /* 저장 불가 */ } },
  };
  const nameOf = (u) => u.displayName || (u.email ? u.email.split('@')[0] : '플레이어');

  // ---------- Firebase 불러오기 ----------
  function load() {
    if (fb) return Promise.resolve(fb);
    if (!loading) {
      loading = Promise.all([import(`${SDK}/firebase-app.js`), import(`${SDK}/firebase-auth.js`), import(`${SDK}/firebase-firestore.js`)])
        .then(([appMod, A, F]) => {
          const app = appMod.initializeApp(CONFIG);
          fb = { auth: A.getAuth(app), db: F.getFirestore(app), A, F };
          A.onAuthStateChanged(fb.auth, onUser);
          A.getRedirectResult(fb.auth).catch(showError);
          return fb;
        })
        .catch((err) => {
          loading = null;
          throw err;
        });
    }
    return loading;
  }

  const MESSAGES = {
    'auth/popup-closed-by-user': null,
    'auth/cancelled-popup-request': null,
    'auth/user-cancelled': null,
    'auth/unauthorized-domain': '이 주소에서는 아직 로그인을 쓸 수 없어요. egggame.onrender.com에서 로그인해 주세요.',
    'auth/operation-not-allowed': 'Google 로그인이 아직 켜져 있지 않아요. 관리자에게 알려 주세요.',
    'auth/configuration-not-found': 'Google 로그인이 아직 켜져 있지 않아요. 관리자에게 알려 주세요.',
    'auth/network-request-failed': '인터넷 연결이 불안정해요. 잠시 뒤 다시 시도해 주세요.',
  };
  function showError(err) {
    if (!err || !err.code) return;
    const msg = err.code in MESSAGES ? MESSAGES[err.code] : `로그인하지 못했어요. 잠시 뒤 다시 시도해 주세요. (${err.code})`;
    if (msg) UI.toast(esc(msg));
  }

  async function login() {
    Sound.play('tap');
    try {
      await load();
    } catch (err) {
      setState('unavailable');
      UI.toast('로그인 기능을 불러오지 못했어요. 인터넷 연결을 확인하거나 egggame.onrender.com에서 열어 주세요.');
      return;
    }
    const provider = new fb.A.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    greet = true;
    setState('loading');
    try {
      await fb.A.signInWithPopup(fb.auth, provider);
    } catch (err) {
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/operation-not-supported-in-this-environment') {
        await fb.A.signInWithRedirect(fb.auth, provider);
        return;
      }
      greet = false;
      setState(user ? 'user' : 'guest');
      showError(err);
    }
  }

  function logout() {
    UI.confirmBox({
      title: '로그아웃할까요?',
      text: '기록은 계정에 저장돼 있어요. 로그아웃하면 이 기기에서는 게스트로 플레이해요.',
      ok: '로그아웃',
      run: async () => {
        await push();
        await fb.A.signOut(fb.auth);
        UI.toast('로그아웃했어요.');
      },
    });
  }

  // ---------- 관리자 ----------
  async function isAdmin(u) {
    if (!u.email || !u.emailVerified || !window.crypto || !window.crypto.subtle) return false;
    const bytes = new TextEncoder().encode('egggame:' + u.email.trim().toLowerCase());
    const digest = await window.crypto.subtle.digest('SHA-256', bytes);
    const hex = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
    return (M.admins || []).includes(hex);
  }

  // ---------- 로그인 상태 ----------
  async function onUser(u) {
    user = u;
    window.App.admin = false;
    ready = false;
    if (!u) {
      lastUid.set(null);
      Store.useProfile('guest');
      setState('guest');
      refresh();
      return;
    }
    lastUid.set(u.uid);
    Store.useProfile(u.uid);
    setState('user');
    window.App.admin = await isAdmin(u);
    await pull();
    refresh();
    if (greet) {
      greet = false;
      Sound.play('friend');
      UI.toast(`<b>${esc(nameOf(u))}</b>님, 반가워요!${window.App.admin ? ' 관리자 권한이 켜졌어요.' : ''}`);
    }
  }

  // ---------- 계정 기록 ↔ 이 기기 ----------
  const clampInt = (v, lo, hi) => Math.min(hi, Math.max(lo, Math.round(Number(v) || 0)));

  function toCloud(book) {
    const endings = {};
    Object.entries(book.endings).forEach(([id, r]) => { if (S.endings[id]) endings[id] = clampInt(r && r.n, 1, 100000); });
    const scenes = Object.keys(book.scenes).filter((id) => S.scenes[id] && !S.scenes[id].branch).slice(0, 14);
    const s = book.stats;
    return {
      endings,
      scenes,
      stats: {
        plays: clampInt(s.plays, 0, 1e7),
        finished: clampInt(s.finished, 0, 1e7),
        crashes: clampInt(s.crashes, 0, 1e7),
        choices: clampInt(s.choices, 0, 1e7),
        bestTrue: s.bestTrue == null ? null : clampInt(s.bestTrue, 1, 1000),
      },
    };
  }
  function fromCloud(cb) {
    if (!cb) return null;
    const endings = {};
    Object.entries(cb.endings || {}).forEach(([id, n]) => { endings[id] = { n, first: Date.now() }; });
    const scenes = {};
    (cb.scenes || []).forEach((id) => { scenes[id] = 1; });
    return { endings, scenes, stats: cb.stats || {} };
  }
  function runJson(run) {
    if (!run || !S.scenes[run.node]) return null;
    const { hist, ...rest } = run; // 되돌리기 기록은 이 기기에만 둔다
    const text = JSON.stringify(rest);
    return text.length <= RUN_LIMIT ? text : null;
  }
  function parseRun(text) {
    try {
      const run = JSON.parse(text);
      return run && S.scenes[run.node] ? { ...run, hist: [] } : null;
    } catch (e) { return null; }
  }
  const newest = (a, b) => (!a ? b : !b ? a : (a.savedAt || 0) > (b.savedAt || 0) ? a : b);
  const hasData = (g) => Object.keys(g.book.endings).length || Object.keys(g.book.scenes).length || g.book.stats.plays || g.run;

  async function pull() {
    setSync('saving');
    try {
      const snap = await fb.F.getDoc(fb.F.doc(fb.db, 'players', user.uid));
      const cloud = snap.exists() ? snap.data() : null;
      let book = Store.merge(fromCloud(cloud && cloud.book), Store.book, 'max');
      let run = newest(Store.loadRun(), parseRun(cloud && cloud.run));
      const guest = Store.guestData();
      if (hasData(guest)) {
        book = Store.merge(book, guest.book, 'sum');
        run = run || guest.run;
        Store.clearGuest();
        UI.toast('이 기기의 게스트 기록을 계정으로 옮겼어요.');
      }
      Store.replaceBook(book);
      Store.replaceRun(run);
      if (cloud && cloud.skin && M.skins.some((k) => k.id === cloud.skin)) Store.settings.skin = cloud.skin;
      ready = true;
      await push();
    } catch (err) {
      setSync('error');
      console.warn('계정 기록을 불러오지 못했어요', err);
      clearTimeout(timer);
      timer = setTimeout(() => { if (user && !ready) pull(); }, 15000);
    }
  }

  async function push() {
    if (!fb || !user || !ready) return;
    clearTimeout(timer);
    setSync('saving');
    const data = { book: toCloud(Store.book), run: runJson(Store.loadRun()), updatedAt: fb.F.serverTimestamp() };
    if (M.skins.some((k) => k.id === Store.settings.skin)) data.skin = Store.settings.skin;
    try {
      await fb.F.setDoc(fb.F.doc(fb.db, 'players', user.uid), data);
      setSync('saved');
    } catch (err) {
      setSync('error');
      console.warn('계정에 저장하지 못했어요', err);
      timer = setTimeout(push, 15000);
    }
  }
  Store.onChange(() => {
    if (!user || !ready) return;
    clearTimeout(timer);
    setSync('saving');
    timer = setTimeout(push, 1500);
  });
  window.addEventListener('pagehide', () => { if (user && ready && sync === 'saving') push(); });

  // ---------- 화면 ----------
  function setState(next) {
    state = next;
    render();
  }
  function setSync(next) {
    sync = next;
    render();
  }
  function render() {
    const box = $('account');
    if (!box) return;
    if (state === 'unavailable') {
      box.innerHTML = '<span class="who">이 화면에서는 로그인을 쓸 수 없어요<small>egggame.onrender.com에서 로그인할 수 있어요</small></span>';
    } else if (state === 'loading') {
      box.innerHTML = '<span class="who">로그인 확인 중…</span>';
    } else if (state === 'user' && user) {
      const name = nameOf(user);
      box.innerHTML = `<span class="avatar" aria-hidden="true">${esc(name.slice(0, 1))}</span>` +
        `<span class="who"><b>${esc(name)}</b>${window.App.admin ? '<span class="admin-badge">관리자</span>' : ''}` +
        `<small>${SYNC_TEXT[sync] || '로그인됨'}</small></span>` +
        '<button type="button" class="btn small" data-acc="logout">로그아웃</button>';
    } else {
      box.innerHTML = '<span class="who">게스트로 플레이 중<small>로그인하면 기록이 계정에 저장돼 다른 기기에서도 이어 할 수 있어요</small></span>' +
        '<button type="button" class="btn small" data-acc="login">Google로 로그인</button>';
    }
  }
  // 로그인 상태가 바뀌면 지금 보고 있는 화면(타이틀·도감·옷장)을 다시 그린다.
  function refresh() {
    render();
    if (['title', 'book', 'closet'].includes(UI.current)) UI.show(UI.current);
  }
  $('account').addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-acc]');
    if (!b) return;
    if (b.dataset.acc === 'login') login();
    else logout();
  });

  // 전에 로그인했던 기기라면, Firebase를 불러오는 동안에도 그 계정의 기록을 먼저 보여 준다.
  const last = lastUid.get();
  if (last) {
    Store.useProfile(last);
    setState('loading');
    load().catch(() => setState('guest'));
  } else {
    render();
  }

  return {
    get user() { return user; },
    get signedIn() { return Boolean(user); },
    login,
    push,
    // 점검용: Firebase 불러오기, 계정에 올릴 데이터 미리 보기
    _load: load,
    _payload: () => ({ book: toCloud(Store.book), run: runJson(Store.loadRun()), skin: Store.settings.skin }),
  };
})();
