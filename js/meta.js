// 계란이의 모험 v2 — 아이템, 친구, 계란 스킨, 제작 크레딧
window.META = {
  version: '2.5',

  // 가방에 들어가는 아이템
  items: {
    butter: { name: '버터 조각', desc: '금이 갈 충격을 한 번 대신 막아 줘요. 막으면 사라져요.' },
    anchovy: { name: '멸치 한 마리', desc: '배고픈 동물에게 건네면 좋은 일이 생길지도 몰라요.' },
    straw: { name: '허수아비의 밀짚', desc: '덮으면 아주 따뜻해요. 추운 밤을 위해 아껴 두세요.' },
  },

  // 모험 중 사귄 친구 (셋 이상이면 특별한 일이 생겨요)
  friends: {
    elder: { name: '노른자 할아버지', desc: '냉장고에서 가장 오래된 계란. 모르는 게 없어요.' },
    white: { name: '흰둥이', desc: '노른자가 두 개인 쌍란. 화를 잘 내지만 정이 많아요.' },
    nabi: { name: '나비', desc: '부엌의 고양이. 털이 보들보들 따뜻해요.' },
    baekgu: { name: '백구', desc: '마당을 지키는 진돗개. 동그란 걸 좋아해요.' },
    scarecrow: { name: '허수아비', desc: '논두렁의 길잡이. 밀짚을 아낌없이 나눠 줘요.' },
    weasel: { name: '족제비', desc: '멸치 한 마리에 마음을 연 들판의 사냥꾼.' },
  },

  // 계란 옷장: shell 껍질 색, pattern 무늬, hat 모자, unlock 해금 조건
  // unlock: null(처음부터) · { ending: 엔딩 id } · { count: 발견한 엔딩 수 }
  skins: [
    { id: 'white', name: '기본 계란', desc: '냉장고 출신의 평범한 흰 계란.', shell: '#fff6e6', unlock: null },
    { id: 'brown', name: '토종란', desc: '갈색 껍질이 단단해 보이는 시골 계란.', shell: '#e3b484', unlock: null },
    { id: 'quail', name: '메추리알', desc: '작고 귀여운 점박이 무늬.', shell: '#efe3cb', pattern: 'speckle', unlock: { count: 3 } },
    { id: 'blue', name: '청란', desc: '푸른빛이 도는 귀한 계란.', shell: '#c3e3de', unlock: { count: 6 } },
    { id: 'easter', name: '부활절 달걀', desc: '아이들이 그려 준 분홍 꽃무늬.', shell: '#ffd9e4', pattern: 'easter', unlock: { ending: 'e_easter' } },
    { id: 'jangjorim', name: '장조림', desc: '간장에 짭조름하게 조려졌어요.', shell: '#b07436', unlock: { ending: 'e_jangjorim' } },
    { id: 'baked', name: '맥반석 계란', desc: '불가마에서 노릇노릇 구워졌어요.', shell: '#cf9258', pattern: 'spots', unlock: { ending: 'e_baked' } },
    { id: 'tteok', name: '떡볶이 계란', desc: '빨간 양념이 살짝 묻었어요.', shell: '#fff1e0', pattern: 'sauce', unlock: { ending: 'e_tteok' } },
    { id: 'bandage', name: '반창고 계란', desc: '와장창 이후 반창고를 붙였어요.', shell: '#fff6e6', pattern: 'bandage', unlock: { ending: 'e_crash' } },
    { id: 'helmet', name: '껍질 모자', desc: '깨진 껍질 반쪽을 모자처럼 썼어요.', shell: '#fff6e6', hat: 'shell', unlock: { ending: 'e_helmet' } },
    { id: 'crown', name: '가재 왕', desc: '조개껍데기 왕관을 쓴 개울의 왕.', shell: '#fff6e6', hat: 'crown', unlock: { ending: 'e_crayfish' } },
    { id: 'beret', name: '서울 관광객', desc: '베레모를 쓴 멋쟁이 계란.', shell: '#e3b484', hat: 'beret', unlock: { ending: 'e_seoul' } },
    { id: 'party', name: '생일 고깔', desc: '친구들과의 생일잔치를 기념해요.', shell: '#fff6e6', hat: 'party', unlock: { ending: 'e_party' } },
    { id: 'gold', name: '황금알', desc: '진엔딩을 본 계란에게만 주어지는 반짝이는 껍질.', shell: '#ffd34d', pattern: 'shine', unlock: { ending: 'e_hatch' } },
    { id: 'dino', name: '공룡알', desc: '모든 엔딩을 본 전설의 알.', shell: '#bcd99c', pattern: 'dino', unlock: { count: 15 } },
  ],

  byline: '개발 은율 · 아이디어 지우', // 타이틀 화면 아래에 보이는 한 줄

  // 관리자 계정: 'egggame:' + 소문자 이메일의 SHA-256 해시 (공개 저장소에 이메일을 그대로 두지 않으려고 해시만 둔다).
  // Google 로그인으로 인증된 이메일만 비교한다. 추가 방법은 README '관리자' 참고.
  admins: [
    '45c42b6afd97b67c396817dedfbfb5a2409b06a98b95c4e68101b627f28a0cf7',
    '157fb2db64ea03c6354a5af3febcc7d48be75a73863385b8f5c9de9c09212806',
  ],

  // 크레딧. names: 한 줄씩 크게, specs: [항목, 내용] 표로 작게 (specsTitle이 표 제목)
  credits: [
    { role: '개발', names: ['은율'] },
    { role: '전체 테스트', names: ['은율', '지우'] },
    { role: '아이디어', names: ['지우'] },
    { role: '공동투자', names: ['YDS', 'TDS', 'TDSHQ', 'TDSNT'] },
    {
      role: '출연',
      names: ['계란이', '노른자 할아버지', '쌍란 흰둥이', '고양이 나비', '진돗개 백구', '허수아비', '족제비', '꼬꼬엄마', '도윤이', '할머니 · 할아버지', '가재 왕국 시민 서른 마리'],
    },
    { role: '특별히 고마운 분', names: ['끝까지 함께해 준 당신'] },
  ],
  copyright: '© 2026 계란이의 모험 · v2.5',
};
