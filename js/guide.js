// 계란이의 모험 v3.4 — 플레이 가이드: 한 장씩 넘겨 보는 간단한 안내 카드
// (처음 모험을 시작할 때, 타이틀의 '플레이 가이드', 진행 중 ☰ 메뉴에서 연다)
window.Guide = (() => {
  'use strict';

  const S = window.STORY;
  const M = window.META;
  const UI = window.UI;
  const Art = window.Art;
  const Sound = window.Sound;
  const Store = window.Store;

  const skin = (id) => M.skins.find((k) => k.id === id) || M.skins[0];
  const egg = (id, o = {}) => `<span class="egg">${Art.egg(skin(id), { mood: 'happy', ...o })}</span>`;
  const hatch = S.stories[0].hatchTemp;

  // art: 큰 그림 한 장, head: 굵은 한 줄, text: 짧은 설명
  const STEPS = [
    {
      art: () => egg('white') + '<span class="gs-keys"><b>A</b><b>B</b><b>C</b></span>',
      head: '글을 읽고 A·B·C 고르기',
      text: '초록 표시가 붙은 선택은 가진 아이템이나 친구 덕분에 결과가 좋아져요.',
    },
    {
      art: () => egg('white', { mood: 'calm' }) + '<span class="gs-arrow">→</span>' + egg('gold') + `<span class="gs-temp">${hatch}℃</span>`,
      head: `따뜻하게, ${hatch}℃ 넘게`,
      text: `차가운 곳에서 출발해요. 마지막 밤을 보낸 뒤 ${hatch}℃ 이상이면 엄마 품에서 깨어나요.`,
    },
    {
      art: () => egg('white', { mood: 'worried', cracks: 1 }) + egg('white', { mood: 'scared', cracks: 2 }) + egg('white', { mood: 'broken' }),
      head: '금 3개면 와장창!',
      text: '떨어지거나 부딪히면 금이 가요. 버터·갑옷·테이프가 충격을 한 번 막아 줘요.',
    },
    {
      art: () => egg('white', { mood: 'brave' }) + '<span class="gs-bar"><i></i><em></em></span>',
      head: '게임 표시는 미니게임',
      text: '"타이밍 게임"처럼 표시된 선택은 미니게임 결과로 갈려요. 어려우면 설정에서 쉬움으로!',
    },
    {
      art: () => egg('gold') + egg('tiger') + egg('rainbow'),
      head: '엔딩을 모아 새 계란을',
      text: `엔딩 ${UI.endIds.length}개가 도감에 모이고, 엔딩을 볼수록 계란 옷장이 열려요.`,
    },
  ];

  // after가 있으면 마지막 장의 '시작할게요'를 누를 때 이어서 부른다 (처음 모험 시작)
  function open(after) {
    let i = 0;
    const body = UI.modal({
      title: '계란이의 모험 하는 법',
      body: '<p class="gs-count"></p><div class="gs-art"></div><h3 class="gs-head"></h3><p class="gs-text"></p>' +
        '<div class="gs-dots" aria-hidden="true"></div>' +
        '<div class="gs-nav"><button type="button" class="btn gs-prev" aria-label="이전">←</button><button type="button" class="btn primary gs-next"></button></div>',
      actions: [],
      onClose: () => Store.set('seenHelp', true),
    });
    const q = (sel) => body.querySelector(sel);
    const draw = () => {
      const st = STEPS[i];
      const last = i === STEPS.length - 1;
      q('.gs-count').textContent = `${i + 1} / ${STEPS.length}`;
      q('.gs-art').innerHTML = st.art();
      q('.gs-head').textContent = st.head;
      q('.gs-text').textContent = st.text;
      q('.gs-dots').innerHTML = STEPS.map((_, k) => `<i${k === i ? ' class="on"' : ''}></i>`).join('');
      q('.gs-prev').disabled = i === 0;
      q('.gs-next').textContent = last ? (after ? '시작할게요' : '다 봤어요') : '다음 →';
      q('.gs-next').focus({ preventScroll: true });
    };
    q('.gs-prev').addEventListener('click', () => {
      if (i === 0) return;
      i -= 1;
      Sound.play('tap');
      draw();
    });
    q('.gs-next').addEventListener('click', () => {
      if (i < STEPS.length - 1) {
        i += 1;
        Sound.play('tap');
        draw();
        return;
      }
      UI.closeModal();
      if (after) after();
    });
    draw();
  }

  return { open };
})();
