// 계란이의 모험 — 서비스 워커 (앱으로 설치, 오프라인 플레이)
// 같은 사이트의 파일은 '인터넷 먼저': 연결되어 있으면 늘 새 파일을 받고, 받은 것을 저장해 둔다.
// 연결이 끊기면 저장해 둔 파일로 연다. 다른 사이트(로그인, 글꼴)는 건드리지 않는다.
const CACHE = 'egggame-v1';
const SHELL = [
  './', './index.html', './manifest.webmanifest',
  './css/base.css', './css/game.css', './css/admin.css',
  './js/stories/modern.js', './js/stories/ancient.js', './js/stories/future.js', './js/story.js', './js/events.js',
  './js/meta.js', './js/news.js', './js/eggs.js', './js/art.js', './js/art-eggs.js', './js/core.js', './js/ui.js',
  './js/account.js', './js/minigames.js', './js/guide.js', './js/game.js', './js/admin.js', './js/pwa.js',
  './icons/favicon-32.png', './icons/apple-touch-icon.png', './icons/icon-192.png', './icons/icon-512.png', './img/mascot.png',
];

self.addEventListener('install', (event) => {
  // 파일 하나가 없어도 설치는 끝나게, 하나씩 담는다.
  event.waitUntil(caches.open(CACHE)
    .then((cache) => Promise.all(SHELL.map((url) => cache.add(url).catch(() => null))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(fetch(req)
    .then((res) => {
      // 정상 응답만 저장한다 (없는 주소의 404를 오프라인 화면으로 쓰지 않게)
      if (res.ok && res.type === 'basic') {
        const copy = res.clone();
        caches.open(CACHE).then((cache) => cache.put(req.mode === 'navigate' ? './' : req, copy));
      }
      return res;
    })
    .catch(() => caches.match(req.mode === 'navigate' ? './' : req, { ignoreSearch: true })
      .then((hit) => hit || (req.mode === 'navigate' ? caches.match('./index.html') : undefined))
      .then((hit) => hit || Response.error())));
});
