const pauseButton = document.getElementById('toggle-motion');
let pageLanguage = 'ko';

function syncMotion(state) {
  const paused = !state.playing;
  pauseButton.classList.toggle('paused', paused);
  pauseButton.setAttribute('aria-label', pageLanguage === 'ko'
    ? (paused ? '애니메이션 재생' : '애니메이션 일시 정지')
    : (paused ? 'Play animation' : 'Pause animation'));
}

window.lossLandscape = window.createLossLandscape(
  document.getElementById('loss-landscape'), { onState: syncMotion },
);
pauseButton.addEventListener('click', () => {
  const state = window.lossLandscape.getState();
  state.playing ? window.lossLandscape.pause() : window.lossLandscape.play();
});
document.getElementById('restart-motion').addEventListener('click', () => window.lossLandscape.restart());

document.querySelector('.language').addEventListener('click', event => {
  pageLanguage = pageLanguage === 'ko' ? 'en' : 'ko';
  document.documentElement.lang = pageLanguage;
  document.querySelectorAll('body [data-ko]').forEach(element => {
    element.innerHTML = element.dataset[pageLanguage];
  });
  event.currentTarget.innerHTML = pageLanguage === 'ko'
    ? '<strong>KO</strong> / EN' : 'KO / <strong>EN</strong>';
  event.currentTarget.setAttribute('aria-label', pageLanguage === 'ko' ? 'Switch to English' : '한국어로 전환');
  document.title = pageLanguage === 'ko'
    ? '김시환 — AI Research & Engineering' : 'Sihwan Kim — AI Research & Engineering';
  const description = document.querySelector('meta[name="description"]');
  description.content = description.dataset[pageLanguage];
  document.getElementById('restart-motion').setAttribute('aria-label', pageLanguage === 'ko'
    ? '애니메이션 처음부터 다시 보기' : 'Replay animation');
  document.getElementById('loss-landscape').setAttribute('aria-label', pageLanguage === 'ko'
    ? '페이지 전체를 이어가는 등고선과 스크롤을 뒤따라 굴러오는 구슬'
    : 'A continuous contour background with a rolling bead that follows scrolling');
  document.querySelector('nav').setAttribute('aria-label', pageLanguage === 'ko' ? '주 메뉴' : 'Main navigation');
  document.querySelector('.contact').setAttribute('aria-label', 'Contact');
  syncMotion(window.lossLandscape.getState());
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: .1 });
document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
window.__ready = true;
