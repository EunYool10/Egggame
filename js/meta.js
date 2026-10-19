// 계란이의 모험 v3 — 아이템, 친구, 계란 스킨, 제작 크레딧
window.META = {
  version: '3.4',

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
  //         { story: 이야기 id } (그 이야기 엔딩 모두) · { kind: 엔딩 종류, n: 개수 } (예: 배드 엔딩 10개) · { admin: true } (운영진 계정만)
  //         v3.4에 더한 계란 95종과 새 조건(가 본 장면 수, 플레이 기록 등)은 eggs.js에 있다.
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
    { id: 'twin', name: '쌍란', desc: '노른자가 둘! 흰둥이를 꼭 닮았어요.', shell: '#fffaf0', pattern: 'twin', unlock: { ending: 'e_twins' } },
    { id: 'icy', name: '꽁꽁 계란', desc: '얼음장처럼 차가웠던 늦둥이의 서리 낀 껍질.', shell: '#dcefff', pattern: 'frost', unlock: { ending: 'e_late' } },
    { id: 'glasses', name: '과학실 안경', desc: '관찰 일지를 쓰던 도윤이네 반의 동그란 안경.', shell: '#fff6e6', hat: 'glasses', unlock: { ending: 'e_school' } },
    { id: 'mud', name: '흙 묻은 보물', desc: '백구가 소중히 묻어 두었던 흔적이 남았어요.', shell: '#efd9b8', pattern: 'mud', unlock: { ending: 'e_treasure' } },
    { id: 'bow', name: '복덩이 리본', desc: '할아버지가 달아 준 빨간 복 리본.', shell: '#fff6e6', hat: 'bow', unlock: { ending: 'e_lucky' } },
    { id: 'leafy', name: '숲속 나뭇잎', desc: '깊은 숲에서 묻어 온 나뭇잎 무늬.', shell: '#e6f0d8', pattern: 'leaf', unlock: { ending: 'e_forest' } },
    { id: 'sale', name: '특가 계란', desc: '마트 진열대에서 다시 만난 특가 스티커.', shell: '#fff6e6', pattern: 'sticker', unlock: { ending: 'e_again' } },
    { id: 'rolled', name: '돌돌 계란말이', desc: '할머니표 계란말이처럼 돌돌 감긴 무늬.', shell: '#ffd84d', pattern: 'rolled', unlock: { ending: 'e_omelet' } },
    { id: 'sunny', name: '지붕 위 프라이', desc: '햇볕에 노릇노릇, 노른자가 비쳐 보여요.', shell: '#fffdf6', pattern: 'yolk', unlock: { ending: 'e_sunfry' } },
    { id: 'gold', name: '황금알', desc: '현대 이야기의 진엔딩을 본 계란에게 주어지는 반짝이는 껍질.', shell: '#ffd34d', pattern: 'shine', unlock: { ending: 'e_hatch' } },
    { id: 'jade', name: '비취알', desc: '닭의 숲에서 깨어난 계란의 푸른 껍질.', shell: '#9fd3b5', pattern: 'shine', unlock: { ending: 'e_g_hatch' } },
    { id: 'gaya', name: '금관', desc: '일곱째 가야의 왕이 쓰던 작은 금관.', shell: '#fff6e6', hat: 'goldcrown', unlock: { ending: 'e_g_king' } },
    { id: 'clay', name: '가야 토기 알', desc: '물결무늬가 새겨진 이천 년 된 알.', shell: '#b8a593', pattern: 'wave', unlock: { ending: 'e_g_museum' } },
    { id: 'pearl', name: '여의주', desc: '용이 아끼는 무지갯빛 구슬.', shell: '#eef4ff', pattern: 'pearl', unlock: { ending: 'e_g_dragon' } },
    { id: 'flowercrown', name: '꽃 화관', desc: '달빛 잔치에서 친구들이 엮어 준 화관.', shell: '#fff6e6', hat: 'flower', unlock: { ending: 'e_g_party' } },
    { id: 'warrior', name: '투구 장군', desc: '뾰족한 껍질 투구를 쓴 숲속의 장군.', shell: '#fff6e6', hat: 'spike', unlock: { ending: 'e_g_crack' } },
    { id: 'azalea', name: '진달래 알', desc: '봄과 함께 깨어난 날 핀 진달래꽃.', shell: '#fdeef4', pattern: 'blossom', unlock: { ending: 'e_g_late' } },
    { id: 'tiger', name: '호랑이 무늬', desc: '어흥! 호랑이 굴에서 묻어 온 줄무늬.', shell: '#f0a24a', pattern: 'tiger', unlock: { ending: 'e_g_tiger' } },
    { id: 'crackle', name: '잔금 토기', desc: '가야 토기에 새겨진 계란 껍질 잔금.', shell: '#e8dcc8', pattern: 'crackle', unlock: { ending: 'e_g_crash' } },
    { id: 'silk', name: '비단 포대기', desc: '알지와 함께 덮었던 보드라운 비단.', shell: '#f7e3ef', pattern: 'silk', unlock: { ending: 'e_g_alji' } },
    { id: 'sea', name: '남쪽 바다', desc: '아유타국으로 가는 붉은 돛배와 파도.', shell: '#e3f3fb', pattern: 'sea', unlock: { ending: 'e_g_ayuta' } },
    { id: 'grill', name: '모닥불 구이', desc: '구지봉 잔치의 석쇠 자국이 남았어요.', shell: '#d9a066', pattern: 'grill', unlock: { ending: 'e_g_song' } },
    { id: 'pottery', name: '단단한 토기 알', desc: '천 도 불길에 구워진 빗살무늬 껍질.', shell: '#a8a097', pattern: 'hatch', unlock: { ending: 'e_g_baked' } },
    { id: 'fox', name: '붉은 여우', desc: '여우 꼬리처럼 붉고 보드라운 털빛.', shell: '#e98a4a', pattern: 'fur', unlock: { ending: 'e_g_fox' } },
    { id: 'mars', name: '화성 흙 알', desc: '붉은 모래가 묻은 화성 태생 껍질.', shell: '#e08a5f', pattern: 'spots', unlock: { ending: 'e_f_hatch' } },
    { id: 'moon', name: '계란별', desc: '지구를 도는 작은 달. 분화구가 송송.', shell: '#dcdde2', pattern: 'crater', unlock: { ending: 'e_f_moon' } },
    { id: 'alien', name: '타원별 대사', desc: '외계 행성에서 받은 은하수 무늬.', shell: '#cdbdf5', pattern: 'galaxy', unlock: { ending: 'e_f_alien' } },
    { id: 'robot', name: 'E-99', desc: '안테나를 단 화성 탐사 계란.', shell: '#dfe6ea', hat: 'antenna', unlock: { ending: 'e_f_robot' } },
    { id: 'astro', name: '우주 헬멧', desc: '화성 기지 마스코트의 껍질 헬멧.', shell: '#fff6e6', hat: 'astro', unlock: { ending: 'e_f_helmet' } },
    { id: 'saturn', name: '토성 고리', desc: '태양계에서 가장 긴 미끄럼틀을 두른 계란.', shell: '#f3dca8', hat: 'ring', unlock: { ending: 'e_f_saturn' } },
    { id: 'lettuce', name: '상추 모자', desc: '수경 온실에서 갓 딴 상추 한 장.', shell: '#fff6e6', hat: 'lettuce', unlock: { ending: 'e_f_salad' } },
    { id: 'omelet', name: '무중력 오믈렛', desc: '공처럼 동그란 오믈렛 빛깔. 허브가 송송.', shell: '#ffd84d', pattern: 'herbs', unlock: { ending: 'e_f_omelet' } },
    { id: 'stardust', name: '별가루 계란', desc: '우주에 흩어졌던 껍질이 별가루가 되었어요.', shell: '#c9d6ff', pattern: 'stardust', unlock: { ending: 'e_f_crash' } },
    { id: 'spaceparty', name: '태양계 파티', desc: '화성 기지 생일 파티의 색종이 조각.', shell: '#ece8ff', pattern: 'confetti', unlock: { ending: 'e_f_party' } },
    { id: 'sleepy', name: '쿨쿨 우주잠', desc: '냉동 수면에서 막 깨어난 졸린 껍질.', shell: '#d6e4f7', pattern: 'zzz', unlock: { ending: 'e_f_late' } },
    { id: 'fusion', name: '핵융합 반숙', desc: '0.3초 만에 익은 따끈한 빛이 번져요.', shell: '#ffe3b8', pattern: 'glow', unlock: { ending: 'e_f_engine' } },
    { id: 'recycle', name: '분리수거 계란', desc: '화성 온실의 거름이 되어 딸기를 키웠어요.', shell: '#d6efd2', pattern: 'recycle', unlock: { ending: 'e_f_trash' } },
    { id: 'dino', name: '공룡알', desc: '엔딩 15개를 본 전설의 알.', shell: '#bcd99c', pattern: 'dino', unlock: { count: 15 } },
    { id: 'kkokko', name: '꼬꼬 볏', desc: '현대 이야기의 엔딩을 모두 모은 계란에게.', shell: '#fff6e6', hat: 'comb', unlock: { story: 'modern' } },
    { id: 'cloud', name: '구름무늬 알', desc: '고대 이야기의 엔딩을 모두 모은 계란에게.', shell: '#a9d6c6', pattern: 'cloud', unlock: { story: 'ancient' } },
    { id: 'holo', name: '홀로그램 알', desc: '미래 이야기의 엔딩을 모두 모은 계란에게.', shell: '#eef6ff', pattern: 'holo', unlock: { story: 'future' } },
    { id: 'phoenix', name: '불사조 알', desc: '배드 엔딩 10개를 견뎌 낸 불굴의 껍질.', shell: '#ff9a5a', pattern: 'flame', unlock: { kind: 'bad', n: 10 } },
    { id: 'riddle', name: '수수께끼 알', desc: '히든 엔딩 5개를 찾아낸 탐정 계란.', shell: '#b9a8f0', pattern: 'question', unlock: { kind: 'hidden', n: 5 } },
    { id: 'silver', name: '은빛 알', desc: '엔딩 25개를 본 계란의 은빛 껍질.', shell: '#d8dde3', pattern: 'shine', unlock: { count: 25 } },
    { id: 'gem', name: '보석 알', desc: '엔딩 35개를 본 계란이 반짝반짝 깎은 보석 껍질.', shell: '#b5e3f5', pattern: 'gem', unlock: { count: 35 } },
    { id: 'rainbow', name: '무지개 알', desc: '세 시대의 엔딩을 모두 본 계란에게만.', shell: '#fff6e6', pattern: 'rainbow', unlock: { count: 'all' } },
    // 운영진 전용: 관리자 계정에만 보이고, 일반 플레이어 옷장에는 나오지 않는다.
    { id: 'staff', name: '운영진 계란', desc: '운영진만 입을 수 있는 보랏빛 계란. 어깨띠의 금별이 반짝여요.', shell: '#e3d6fc', pattern: 'sash', unlock: { admin: true } },
    { id: 'gm', name: '운영진 왕관', desc: '계란이의 모험을 지키는 운영진의 황금 왕관.', shell: '#fff6e6', hat: 'gmcrown', unlock: { admin: true } },
    { id: 'dev', name: '개발자 계란', desc: '버그를 잡는 운영진의 계란. 0과 1이 흘러요.', shell: '#d8f5e6', pattern: 'code', unlock: { admin: true } },
  ],

  byline: '은율 · 지우 · 윤아',// 타이틀 화면 아래에 보이는 한 줄

  // 타이틀의 '은율이의 다른 앱 보기'에 나오는 앱 (새 탭에서 열린다). icon: 그 앱의 파비콘(img/apps에 복사해 둠), color: 파비콘에서 딴 색, slow: 무료 서버라 처음 열 때 느림
  apps: [
    { name: '상큼 과일 아케이드 존', url: 'https://eunyool10.github.io/FruitArcade/', icon: 'img/apps/fruitarcade.png', color: '#f2456f', desc: '과일 메모리, 수박 게임, 과일 자르기… 오늘의 미션에 도전하는 과일 미니게임 모음.' },
    { name: '논리 미궁: 대우의 열쇠', url: 'https://eunyool10.github.io/LogicMaze/', icon: 'img/apps/logicmaze.svg', color: '#b8924a', desc: '원래 명제의 대우를 골라 다섯 개의 방을 탈출하는 논리 퀴즈 게임.' },
    { name: 'SchoolFix', url: 'https://schoolfix.onrender.com/', icon: 'img/apps/schoolfix.png', color: '#1d4ed8', slow: true, desc: '학교의 불편한 점과 시설 안전 문제를 신고하고 함께 고쳐 가는 서비스.' },
  ],

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
  copyright: '© 2026 계란이의 모험 · v3.4',
};
