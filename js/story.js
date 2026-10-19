// 계란이의 모험 v3 — 이야기 모음
// js/stories/*.js가 window.STORIES에 이야기를 하나씩 넣고, 여기서 장면과 엔딩을 한 사전으로 합친다.
//
// 이야기(story)
//   id, era(시대), title, blurb(한 줄 소개), intro(시작 카드 문단들), goal(목표), bg(대표 그림)
//   mom: 엔딩 본문의 {mom} 자리에 들어갈 이름, first: 첫 장면, startTemp: 처음 온기
//   hatchTemp: 둥지에서 이 온기 이상 + 금 0개면 진엔딩, crash: 금이 3개가 되면 가는 엔딩
//   route: 무작위 길 { tiers: [[장면 id…], …] 구역들, pick: [[최소, 최대], …] 구역마다 고를 수, end: 구역을 다 지나면 가는 장면 }
//          모험을 시작할 때 구역마다 무작위로 골라 섞은 순서가 그 모험의 길이 된다 (앞 구역 → 뒤 구역 순서는 지킨다).
// 장면(scene)
//   ch: 장 번호, place: 장소 이름, bg: 배경 그림 키(art.js), mood: 계란이 표정
//   text: 문단들. 문자열이거나 { if: 조건, text } · { not: 조건, text } (조건이 맞을 때만 보인다)
//   choices: A·B·C 선택지 3개
//   branch(st, story): 선택지 없이 상태로 다음 장면/엔딩을 고르는 장면. outs는 갈 수 있는 곳 목록
// 선택지(choice)
//   label: 버튼 글, to: 다음 장면/엔딩 또는 '>'(이번 모험의 길에서 다음 정거장), say: 고른 직후 보여 줄 결과 한 줄
//   fx: { t: 온기(℃) 변화, c: 껍질 금 변화 }
//   gain: 얻는 아이템·친구 id 목록 (meta.js 참고), use: 써 버리는 아이템 id 목록
//   flag: 이번 모험에 남길 표시, set: { mom: '이름' } 처럼 본문 자리 채움 값 바꾸기
//   game: 타이밍 미니게임 { title, hint, speed, win: {...결과}, lose: {...결과} }
//   alt: 조건을 채우면 결과가 바뀐다 { need: 조건, tag: 버튼에 붙는 표시, ...결과 }
//   결과 필드(to, fx, gain, use, say)는 choice → game.win/lose → alt 순서로 덮어쓴다.
// 조건
//   '아이템/친구 id' · [조건, 조건](모두) · { friends: n } · { from: 장면 id 또는 목록 } (바로 전 장면)
//   { flag: '표시' } · { cracked: true } (금이 있음)
// 엔딩(ending)
//   kind: true(진엔딩) · happy · normal · hidden · bad, title, hint: 도감에서 잠긴 엔딩에 보여 줄 힌트
//   bg: 엔딩 그림 배경(없으면 마지막 장소), look: 엔딩 그림 { art, mood, shell, pattern, hat, prop } (art.js 참고)
//   text: 장면과 같은 문단들. {friends}는 함께한 친구 이름, {mom}은 이야기의 mom 값으로 바뀐다.
window.STORY = (() => {
  'use strict';

  const stories = window.STORIES || [];
  const byId = {};
  const scenes = {};
  const endings = {};
  stories.forEach((s, i) => {
    s.no = i + 1;
    byId[s.id] = s;
    Object.entries(s.scenes).forEach(([id, sc]) => {
      if (scenes[id] || endings[id]) console.warn('겹치는 장면 id', id);
      sc.story = s.id;
      scenes[id] = sc;
    });
    Object.entries(s.endings).forEach(([id, e]) => {
      if (scenes[id] || endings[id]) console.warn('겹치는 엔딩 id', id);
      e.story = s.id;
      endings[id] = e;
    });
  });

  return { version: 3, stories, byId, scenes, endings, first: stories[0].first };
})();
