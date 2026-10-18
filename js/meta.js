// 계란이의 모험 v3 — 아이템, 친구, 계란 스킨, 제작 크레딧
window.META = {
  version: '3.1',

  // 가방에 들어가는 아이템. shield: 금이 갈 충격을 한 번 막는다 (short는 상단 표시, block은 막았을 때 문장)
  items: {
    butter: {
      name: '버터 조각', desc: '금이 갈 충격을 한 번 대신 막아 줘요. 막으면 사라져요.',
      shield: true, short: '버터', block: '그 순간 버터가 미끄덩, 충격을 흡수해 줬어요! 껍질은 멀쩡해요.',
    },
    anchovy: { name: '멸치 한 마리', desc: '배고픈 동물에게 건네면 좋은 일이 생길지도 몰라요.' },
    straw: { name: '허수아비의 밀짚', desc: '덮으면 아주 따뜻해요. 추운 밤을 위해 아껴 두세요.' },
    goldthread: { name: '금실 한 가닥', desc: '하늘 보자기에서 풀린 금실. 두르면 황금알처럼 반짝여요.' },
    armor: {
      name: '쇠비늘 갑옷', desc: '가야 대장장이가 두드려 만든 작은 갑옷. 금이 갈 충격을 한 번 막아 줘요.',
      shield: true, short: '갑옷', block: '그 순간 쇠비늘 갑옷이 쨍! 충격을 막아 줬어요. 갑옷은 찌그러졌지만 껍질은 멀쩡해요.',
    },
    silk: { name: '비단 조각', desc: '먼 나라 배에서 온 보드라운 비단. 추운 밤에 덮으면 아주 따뜻해요.' },
    patch: {
      name: '수리 테이프', desc: '우주선용 수리 테이프. 금이 갈 충격을 한 번 막아 줘요.',
      shield: true, short: '테이프', block: '그 순간 수리 테이프가 쫀득, 충격을 붙잡아 줬어요! 껍질은 멀쩡해요.',
    },
    foil: { name: '은박 담요', desc: '우주복 주머니에서 나온 비상용 담요. 추운 밤에 덮으면 아주 따뜻해요.' },
  },

  // 모험 중 사귄 친구 (한 모험에서 셋 이상이면 특별한 일이 생겨요)
  friends: {
    elder: { name: '노른자 할아버지', desc: '냉장고에서 가장 오래된 계란. 모르는 게 없어요.' },
    white: { name: '흰둥이', desc: '노른자가 두 개인 쌍란. 화를 잘 내지만 정이 많아요.' },
    dongle: { name: '동글이', desc: '거실의 로봇청소기. 매일 새벽 여섯 시에 출근해요.' },
    nabi: { name: '나비', desc: '부엌의 고양이. 털이 보들보들 따뜻해요.' },
    gugu: { name: '구구', desc: '처마 끝에 사는 비둘기. 졸려 보여도 날개는 튼튼해요.' },
    baekgu: { name: '백구', desc: '마당을 지키는 진돗개. 동그란 걸 좋아해요.' },
    scarecrow: { name: '허수아비', desc: '논두렁의 길잡이. 밀짚을 아낌없이 나눠 줘요.' },
    rooster: { name: '장닭 대장', desc: '행복 농장의 우두머리 수탉. 목청이 동네에서 제일 커요.' },
    weasel: { name: '족제비', desc: '멸치 한 마리에 마음을 연 들판의 사냥꾼.' },
    suro: { name: '맏형 황금알', desc: '하늘에서 함께 내려온 황금알 여섯 형제의 맏이.' },
    turtle: { name: '거북 할배', desc: '노래만 들리면 머리를 집어넣는 수줍은 거북.' },
    gull: { name: '끼룩이', desc: '포구의 갈매기. 길을 잘 알아요.' },
    magpie: { name: '까치', desc: '은혜 갚는 게 자랑인 고갯마루 까치.' },
    fox: { name: '여우', desc: '반짝이는 금실에 반한 닭의 숲 여우.' },
    nae: { name: '냉이', desc: '우주선 냉장 보관함의 인공지능. 문 여는 게 특기예요.' },
    ppo: { name: '삐뽀', desc: '엔진실의 작은 수리 드론. 나사 하나에도 진심이에요.' },
    haram: { name: '하람이', desc: '화성행 우주선의 열 살 꼬마 승객.' },
    guard: { name: '지킴이', desc: '붉은 온실의 경비 로봇. 알고 보면 다정해요.' },
  },

  // 계란 옷장: shell 껍질 색, pattern 무늬, hat 모자, unlock 해금 조건
  // unlock: null(처음부터) · { ending: 엔딩 id } · { count: 발견한 엔딩 수 또는 'all' }
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
    { id: 'stamp', name: '1등급 계란', desc: '빨간 1등급 도장이 쾅!', shell: '#fff6e6', pattern: 'stamp', unlock: { ending: 'e_factory' } },
    { id: 'vlog', name: '브이로거', desc: '거꾸로 쓴 모자가 트레이드마크.', shell: '#fff6e6', hat: 'cap', unlock: { ending: 'e_vlog' } },
    { id: 'crispy', name: '바삭 치킨', desc: '황금빛 튀김옷을 입었어요. 겉은 바삭, 속은 촉촉.', shell: '#e3a04c', pattern: 'crispy', unlock: { ending: 'e_chicken' } },
    { id: 'gold', name: '황금알', desc: '현대 이야기의 진엔딩을 본 계란에게 주어지는 반짝이는 껍질.', shell: '#ffd34d', pattern: 'shine', unlock: { ending: 'e_hatch' } },
    { id: 'jade', name: '비취알', desc: '닭의 숲에서 깨어난 계란의 푸른 껍질.', shell: '#9fd3b5', pattern: 'shine', unlock: { ending: 'e_g_hatch' } },
    { id: 'gaya', name: '금관', desc: '일곱째 가야의 왕이 쓰던 작은 금관.', shell: '#fff6e6', hat: 'goldcrown', unlock: { ending: 'e_g_king' } },
    { id: 'clay', name: '가야 토기 알', desc: '물결무늬가 새겨진 이천 년 된 알.', shell: '#b8a593', pattern: 'wave', unlock: { ending: 'e_g_museum' } },
    { id: 'pearl', name: '여의주', desc: '용이 아끼는 무지갯빛 구슬.', shell: '#eef4ff', pattern: 'pearl', unlock: { ending: 'e_g_dragon' } },
    { id: 'mars', name: '화성 흙 알', desc: '붉은 모래가 묻은 화성 태생 껍질.', shell: '#e08a5f', pattern: 'spots', unlock: { ending: 'e_f_hatch' } },
    { id: 'moon', name: '계란별', desc: '지구를 도는 작은 달. 분화구가 송송.', shell: '#dcdde2', pattern: 'crater', unlock: { ending: 'e_f_moon' } },
    { id: 'alien', name: '타원별 대사', desc: '외계 행성에서 받은 은하수 무늬.', shell: '#cdbdf5', pattern: 'galaxy', unlock: { ending: 'e_f_alien' } },
    { id: 'robot', name: 'E-99', desc: '안테나를 단 화성 탐사 계란.', shell: '#dfe6ea', hat: 'antenna', unlock: { ending: 'e_f_robot' } },
    { id: 'dino', name: '공룡알', desc: '엔딩 15개를 본 전설의 알.', shell: '#bcd99c', pattern: 'dino', unlock: { count: 15 } },
    { id: 'rainbow', name: '무지개 알', desc: '세 시대의 엔딩을 모두 본 계란에게만.', shell: '#fff6e6', pattern: 'rainbow', unlock: { count: 'all' } },
  ],

  byline: '은율 · 지우 · 윤아',// 타이틀 화면 아래에 보이는 한 줄

  // 관리자(운영진) 계정: 'egggame:' + 소문자 이메일의 SHA-256 해시 (공개 저장소에 이메일을 그대로 두지 않으려고 해시만 둔다).
  // Google 로그인으로 인증된 이메일만 비교한다. 추가 방법은 README '관리자' 참고.
  admins: [
    '45c42b6afd97b67c396817dedfbfb5a2409b06a98b95c4e68101b627f28a0cf7',
    '157fb2db64ea03c6354a5af3febcc7d48be75a73863385b8f5c9de9c09212806',
    '0fb796c775ff6016ae8ab23da77dcf7ac12ef11389717e7dd20e3a491e80f6cb',
    '899be75ddd7505b1852e53a9a64121e0169f49938f7a9611ce44a9efdd1afd4f',
    'c0ac4e48f1b66bee8c22e87f8d851320711571d9cbb09ccab64f40a322c43442',
  ],

  // 크레딧. names: 한 줄씩 크게, specs: [항목, 내용] 표로 작게 (specsTitle이 표 제목)
  credits: [
    { role: '메인개발', names: ['은율'] },
    { role: 'QATEST', names: ['은율', '지우', "윤아"] },
    { role: '아이디어', names: ['지우'] },
    { role: '디자인', names: ['YDS','지우'] },
    { role: '공동투자', names: ['YDS', 'TDS', 'TDSHQ', 'TDSNT'] },
    {
      role: '출연 · 현대',
      names: ['계란이', '노른자 할아버지', '쌍란 흰둥이', '로봇청소기 동글이', '고양이 나비', '비둘기 구구', '진돗개 백구', '허수아비', '장닭 대장 · 꼬순이', '족제비', '꼬꼬엄마', '도윤이', '할머니 · 할아버지', '가재 왕국 시민 서른 마리'],
    },
    {
      role: '출연 · 고대',
      names: ['황금알 여섯 형제', '촌장 아도간', '도공 할아버지', '대장장이 쇠돌이', '아유타국 공주님', '갈매기 끼룩이', '거북 할배', '고갯마루 호랑이', '까치', '여우', '흰 닭 할머니'],
    },
    { 
      role: '출연 · 미래',
      names: ['요리 로봇 쿡봇', '인공지능 냉이', '수리 드론 삐뽀', '하람이', '경비 로봇 지킴이', '꼬꼬 9세', '타원별 외계인들'],
    },
    { role: '특별히 고마운 분', names: ['끝까지 함께해 준 당신'] },
    { role: '특별히 고마운 분', names: ['이번 작품을 준비한 은율입니다. 플레이 해주셔서 감사합니다.'] },
  ],
  copyright: '© 2026 계란이의 모험 · v3.1',
};
