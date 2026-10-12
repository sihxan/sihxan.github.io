const pauseButton = document.getElementById('toggle-motion');
let pageLanguage = new URL(location.href).searchParams.get('lang') === 'en' ? 'en' : 'ko';

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

function applyLanguage() {
  document.documentElement.lang = pageLanguage;
  document.querySelectorAll('body [data-ko]').forEach(element => {
    element.innerHTML = element.dataset[pageLanguage];
  });
  const languageButton = document.querySelector('.language');
  languageButton.innerHTML = pageLanguage === 'ko'
    ? '<strong>KO</strong> / EN' : 'KO / <strong>EN</strong>';
  languageButton.setAttribute('aria-label', pageLanguage === 'ko' ? 'Switch to English' : '한국어로 전환');
  const title = document.querySelector('title');
  document.title = title.dataset[pageLanguage] || (pageLanguage === 'ko'
    ? '김시환 — AI Research & Engineering' : 'Sihwan Kim — AI Research & Engineering');
  const description = document.querySelector('meta[name="description"]');
  description.content = description.dataset[pageLanguage];
  document.getElementById('restart-motion').setAttribute('aria-label', pageLanguage === 'ko'
    ? '애니메이션 처음부터 다시 보기' : 'Replay animation');
  document.getElementById('loss-landscape').setAttribute('aria-label', pageLanguage === 'ko'
    ? '페이지 전체를 이어가는 등고선과 스크롤을 뒤따라 굴러오는 구슬'
    : 'A continuous contour background with a rolling bead that follows scrolling');
  document.querySelector('header nav').setAttribute('aria-label', pageLanguage === 'ko' ? '주 메뉴' : 'Main navigation');
  document.querySelector('.contact').setAttribute('aria-label', 'Contact');
  const sections = document.querySelector('.detail-sections');
  if (sections) sections.setAttribute('aria-label', pageLanguage === 'ko' ? '프로젝트 상세 목차' : 'Project sections');
  const projectNavigation = document.querySelector('.detail-pagination');
  if (projectNavigation) projectNavigation.setAttribute('aria-label', pageLanguage === 'ko' ? '다른 프로젝트' : 'Other projects');
  document.querySelectorAll('[data-project-link], [data-home-link], [data-project-nav]').forEach(link => {
    const target = new URL(link.getAttribute('href'), location.href);
    if (pageLanguage === 'en') target.searchParams.set('lang', 'en');
    else target.searchParams.delete('lang');
    link.setAttribute('href', target.pathname + target.search + target.hash);
  });
  syncMotion(window.lossLandscape.getState());
}

document.querySelector('.language').addEventListener('click', () => {
  pageLanguage = pageLanguage === 'ko' ? 'en' : 'ko';
  const current = new URL(location.href);
  if (pageLanguage === 'en') current.searchParams.set('lang', 'en');
  else current.searchParams.delete('lang');
  history.replaceState(null, '', current.pathname + current.search + current.hash);
  applyLanguage();
});
applyLanguage();

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
