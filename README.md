# 계란이의 모험

현대·고대·미래, 세 시대의 계란이가 엄마 품을 찾아 떠나는 선택형 텍스트 어드벤처입니다. 이야기를 하나 고르고, 상황 설명을 읽고 A·B·C 중 하나를 고르면 고른 길에 따라 엔딩에 도착합니다. 이야기 3편, 엔딩 48가지가 있습니다.

| 이야기 | 시대 | 줄거리 | 엔딩 |
| --- | --- | --- | --- |
| 이야기 1 「냉장고 대탈출」 | 현대 | 할머니 댁 냉장고 맨 끝자리에서 들판 끝 꼬꼬엄마 품까지 | 21 |
| 이야기 2 「구지봉의 일곱째 알」 | 고대 | 하늘에서 내려온 황금알 여섯 개 사이에 끼어 버린 하얀 알이 신라 "닭의 숲"까지 | 14 |
| 이야기 3 「화성으로 간 마지막 계란」 | 미래 | 2126년 화성행 우주선의 마지막 지구산 계란이 화성 붉은 온실까지 | 13 |

## 크레딧

| 역할 | 이름 |
| --- | --- |
| 개발 | 은율 |
| QATEST | 은율 · 지우 · 윤아 |
| 아이디어 | 지우 |
| 캐릭터/배경 디자인 | YDS · 지우 |
| 공동투자 | YDS · TDS · TDSHQ · TDSNT |

## 실행

빌드 과정이 없습니다. `index.html`을 브라우저로 열면 바로 플레이할 수 있습니다.
Node.js가 있다면 `npm start`로 http://localhost:3000 에서 띄울 수도 있습니다.

## 개발에 사용된 기술

개발: 은율

| 분야 | 기술 |
| --- | --- |
| 언어 | HTML5 · CSS3 · JavaScript (ES2020) |
| 화면 | CSS Grid · Flexbox · CSS 변수로 만든 라이트 · 다크 테마 |
| 그래픽 | SVG, 계란이와 배경을 코드로 직접 그림 |
| 애니메이션 | CSS Animation · requestAnimationFrame (미니게임) |
| 사운드 | Web Audio API, 효과음과 배경 음악 실시간 합성 |
| 저장 | Web Storage API (localStorage) |
| 웹 API | Clipboard API (결과 복사) · Vibration API (진동) |
| 글꼴 | Google Fonts (Jua · Gowun Batang · Gowun Dodum, SIL Open Font License) |
| 서버 | Node.js 내장 http 모듈, 외부 패키지 없음 |
| 배포 | GitHub · Render |
| 개발 도구 | Visual Studio Code · Git · Claude Code |

프레임워크, 라이브러리, 빌드 도구 없이 만든 정적 웹앱입니다. 이미지와 음원 파일 없이 그림은 SVG로, 소리는 Web Audio로 코드에서 만듭니다.

## 로그인과 계정 저장

- Firebase 프로젝트 `egggame-eunyool`의 Authentication(Google)과 Firestore(`(default)`, 서울 리전 asia-northeast3)를 씁니다.
- 계정마다 `players/{uid}` 문서 하나에 엔딩별 횟수, 다녀간 장면, 플레이 기록, 이어하기(JSON), 입은 스킨을 저장합니다. 이름이나 이메일은 저장하지 않습니다.
- 처음 로그인하면 그 기기의 게스트 기록이 계정으로 옮겨집니다. 같은 계정의 기기끼리는 더 많이 진행한 쪽 기록으로 합쳐집니다.
- 보안 규칙은 `firestore.rules`에 있습니다. 본인 문서만 읽고 쓸 수 있고, 필드 구성과 엔딩·장면·스킨 이름, 기록 숫자, 크기를 검사합니다. 배포: `firebase deploy --only firestore:rules`
- 엔딩별 횟수 값은 규칙에서 하나하나 검사하지 않습니다(엔딩이 48개라 Firestore의 요청당 식 1000개 한도를 넘기 때문). 대신 게임이 계정 기록을 읽을 때 1~100000으로 바로잡습니다.
- 엔딩, 장면, 스킨을 추가하면 `firestore.rules`의 `endingIds` · `sceneIds` · `skinIds` 목록도 함께 고쳐야 저장됩니다.
- Firebase SDK는 로그인할 때(또는 전에 로그인했던 기기에서)만 내려받습니다.

## 관리자

관리자(운영진)로 등록된 Google 계정으로 로그인하면 아래 권한이 생깁니다.

- 계란 옷장의 모든 스킨 사용
- 엔딩 도감에서 아직 못 본 엔딩까지 전부 열람
- 관리자 메뉴 (타이틀 화면, 진행 중 ☰ 메뉴): 세 이야기의 장면 바로 가기, 엔딩 바로 보기, 온기·금 조절, 그 이야기의 아이템·친구 모두 받기, 미니게임 항상 성공

관리자는 `js/meta.js`의 `admins`에 이메일의 해시로 등록합니다. 공개 저장소에 이메일이 그대로 드러나지 않게 하려는 것입니다. 해시는 아래 명령으로 만듭니다.

```
node -e "console.log(require('crypto').createHash('sha256').update('egggame:' + process.argv[1].toLowerCase()).digest('hex'))" 이메일주소
```

관리자 기능은 게임 화면 안에서만 동작하고, 다른 사람의 기록에는 접근할 수 없습니다.

## Render 배포

main 브랜치에 푸시하면 Render가 자동으로 다시 배포합니다. 서비스는 아래 두 방식 중 하나로 만듭니다.

**Static Site (추천)**: 무료 플랜에서도 잠들지 않아 바로 열립니다.
Render 대시보드 → New + → Blueprint → `EunYool10/Egggame` → Apply. `render.yaml` 설정이 그대로 적용됩니다.
직접 만들 때는 New + → Static Site에서 아래처럼 입력합니다.

| 설정 | 값 |
| --- | --- |
| Build Command | `mkdir -p dist && cp -r index.html css js icons img dist/` |
| Publish Directory | `dist` |

**Web Service**: 무료 플랜은 15분 동안 접속이 없으면 잠들고, 깨어나는 데 50초쯤 걸립니다.

| 설정 | 값 |
| --- | --- |
| Language | Node |
| Build Command | `npm install` |
| Start Command | `npm start` |

`server.mjs`는 의존성 없는 정적 파일 서버로, 게임 파일(`index.html`, `css/`, `js/`, `icons/`, `img/`)만 내보냅니다. 상태 확인 주소는 `/healthz`입니다.

## 게임 방법

- **이야기 고르기**: 타이틀의 '모험 시작'을 누르면 세 이야기 중 하나를 고릅니다. 이야기마다 시작 카드에서 줄거리와 목표를 알려 줍니다.
- **4장 구성**: 이야기마다 4장, 장면 8~19개. 같은 장소라도 어떤 길로 왔는지, 누구와 함께인지에 따라 글이 달라집니다.
- **온기**: 차가운 곳에서 시작합니다. 둥지까지 20℃ 넘게 데워 오고 마지막 밤(폭풍우 · 첫서리 · 모래폭풍)을 잘 버티면 진엔딩 조건을 채웁니다.
- **껍질**: 떨어지거나 부딪히면 금이 갑니다. 금이 3개가 되면 그 자리에서 그 이야기의 '와장창' 엔딩입니다.
- **가방**: 버터·쇠비늘 갑옷·수리 테이프는 금 1번을 막아 주고, 밀짚·비단·은박 담요는 추운 밤을 따뜻하게 해 줍니다. 멸치·금실은 동물의 마음을 엽니다.
- **친구**: 현대 9명, 고대 5명, 미래 4명. 한 모험에서 셋 이상 사귀면 마지막 밤에 숨은 엔딩이 열립니다.
- **미니게임**: 왔다 갔다 하는 계란이를 노란 칸에서 멈추세요. 현대 9개, 고대 5개, 미래 3개가 있습니다.
- **엔딩 종류**: 진엔딩 3 · 히든 8 · 해피 8 · 노멀 11 · 배드 18

## 기능

- 이야기 3편(현대·고대·미래)과 엔딩 48가지, 이야기 시작 카드, 플레이 방법 안내
- Google 로그인: 기록(엔딩 도감, 플레이 기록, 이어하기, 입은 스킨)이 계정에 저장돼 다른 기기에서도 이어집니다. 로그인하지 않아도 게스트로 그대로 플레이할 수 있습니다.
- 관리자 계정: 모든 스킨, 엔딩 도감 전체 열람, 관리자 메뉴 (위 '관리자' 참고)
- 자동 저장과 이어하기, 한 걸음 되돌리기, 지난 이야기 다시 보기
- 엔딩 도감: 이야기별 탭, 엔딩마다 다른 그림, 잠긴 엔딩 힌트, 플레이 기록, 최단 진엔딩 기록
- 계란 옷장: 엔딩을 볼수록 해금되는 스킨 26종 (껍질 색, 무늬, 모자)
- 설정: 글자 속도·크기, 테마, 효과음·배경 음악·음량, 진동, 미니게임 난이도, 움직임 줄이기, 데이터 초기화
- 제작 크레딧 화면, 결과 복사
- 키보드: `A`·`B`·`C` 또는 `1`·`2`·`3`으로 선택, `Space`·`Enter`로 글 넘기기, `Esc`로 메뉴
- 소리는 모두 Web Audio로 합성하고, 그림은 모두 코드(SVG)로 그려서 외부 파일이 없습니다.
- 기록은 브라우저 localStorage에 저장됩니다. v1·v2에서 본 엔딩과 이어하기는 그대로 이어집니다.

## 파일 구성

| 파일 | 역할 |
| --- | --- |
| `js/stories/modern.js` | 이야기 1 · 현대의 장면, 선택지, 엔딩 |
| `js/stories/ancient.js` | 이야기 2 · 고대의 장면, 선택지, 엔딩 |
| `js/stories/future.js` | 이야기 3 · 미래의 장면, 선택지, 엔딩 |
| `js/story.js` | 세 이야기를 하나로 합치기. 이야기 데이터 형식 설명이 맨 위에 있습니다. |
| `js/meta.js` | 아이템, 친구, 계란 스킨, 관리자, 제작 크레딧 |
| `js/art.js` | 계란이·병아리·모자·엔딩 소품·장소 배경 그림 (SVG) |
| `js/core.js` | 저장(설정, 이어하기, 도감), 효과음과 배경 음악, 진동 |
| `js/ui.js` | 화면 전환, 창과 알림, 타이틀, 이야기 고르기, 도감, 옷장, 설정, 크레딧, 플레이 방법 |
| `js/game.js` | 진행 엔진 (선택 처리, 조건 문단, 미니게임, 엔딩, 관리자 메뉴, 입력) |
| `js/account.js` | Google 로그인, 계정 기록 동기화, 관리자 확인 |
| `firestore.rules`, `firebase.json`, `.firebaserc` | Firestore 보안 규칙과 Firebase 프로젝트 설정 |
| `css/base.css`, `css/game.css` | 화면 디자인 (라이트/다크 테마, 시대별 색) |
| `render.yaml` | Render Static Site 배포 설정 (Blueprint) |
| `server.mjs`, `package.json` | Render Web Service용 · 로컬 확인용 정적 파일 서버 |

## 장면 추가하기

이야기 파일(`js/stories/*.js`)의 `scenes`에 장면을 추가하고, 같은 이야기의 다른 장면 선택지 `to`에서 그 장면 이름을 가리키면 됩니다. 장면 이름과 엔딩 이름은 세 이야기를 통틀어 겹치면 안 됩니다.

```js
bakery: {
  ch: 3, place: '동네 빵집', bg: 'market', mood: 'happy', // bg는 js/art.js의 SCENES 이름
  text: [
    '상황 설명 문단 1',
    { if: 'white', text: '흰둥이와 함께일 때만 보이는 문단' }, // 조건: 아이템·친구 id, { from: '바로 전 장면' }, { flag: '표시' }, { cracked: true }
    { not: { from: 'yard' }, text: '마당에서 오지 않았을 때만 보이는 문단' },
  ],
  choices: [
    { label: 'A 선택지', to: 'yard', fx: { t: 5 }, say: '고른 직후 보여 줄 한 줄' }, // t: 온기 변화(℃), c: 금 개수 변화
    { label: 'B 선택지', to: 'field', gain: ['butter'], flag: 'bakery' }, // gain/use: meta.js의 아이템·친구 id
    {
      label: 'C 선택지', to: 'e_easter',
      alt: { need: 'anchovy', tag: '멸치를 건넬 수 있어요', use: ['anchovy'], to: 'field' }, // 조건을 채우면 결과가 바뀜
    },
  ],
},
```

엔딩은 `endings`에 `kind`(`true`·`happy`·`normal`·`hidden`·`bad`), `title`, `bg`, `look`(엔딩 그림), `hint`, `text`로 추가합니다. `look`은 `{ art: 'chick', shell: '#ffd34d', hat: 'party', prop: ['nest', 'sparkle'] }`처럼 쓰고, 쓸 수 있는 그림·모자·무늬·소품 이름은 `js/art.js`에 있습니다. 도감 번호는 이야기마다 `endings`에 적힌 순서대로 매겨집니다. 크레딧 이름은 `js/meta.js`의 `credits`에서 바꿀 수 있습니다.
