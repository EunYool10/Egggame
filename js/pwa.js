// 계란이의 모험 — 앱으로 설치 (홈 화면에 추가)와 오프라인 준비
// 설치할 수 있는 브라우저에서는 타이틀 아래 '앱으로 설치'가 보이고, 아이폰·아이패드에서는 방법을 알려 준다.
(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const btn = $('btnInstall');
  const standalone = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  let prompt = null;

  // 서비스 워커: 설치와 오프라인 플레이에 필요하다. 쓸 수 없는 환경이면 조용히 넘어간다.
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', () => {
      try { navigator.serviceWorker.register('sw.js').catch(() => {}); } catch (e) { /* 무시 */ }
    });
  }

  const show = (on) => { btn.hidden = !on || standalone(); };
  show(ios && !standalone());

  window.addEventListener('beforeinstallprompt', (ev) => {
    ev.preventDefault();
    prompt = ev;
    show(true);
  });
  window.addEventListener('appinstalled', () => {
    prompt = null;
    show(false);
    window.UI.toast('홈 화면에 계란이의 모험을 설치했어요!');
  });

  btn.addEventListener('click', async () => {
    window.Sound.play('tap');
    if (prompt) {
      prompt.prompt();
      const { outcome } = await prompt.userChoice.catch(() => ({ outcome: 'dismissed' }));
      if (outcome === 'accepted') show(false);
      prompt = null;
      return;
    }
    window.UI.modal({
      title: '앱으로 설치하기',
      body: '<ol class="install-steps"><li>Safari 아래쪽의 <b>공유</b> 버튼(네모에서 화살표가 나온 모양)을 눌러요.</li>' +
        '<li><b>홈 화면에 추가</b>를 골라요.</li><li>오른쪽 위 <b>추가</b>를 누르면 홈 화면에 계란이가 생겨요.</li></ol>' +
        '<p class="hint">한 번 열어 둔 뒤에는 인터넷이 끊겨도 플레이할 수 있어요. 계정 저장은 다시 연결되면 이어서 해요.</p>',
    });
  });
})();
