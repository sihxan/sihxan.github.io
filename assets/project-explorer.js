// These objects illustrate published project descriptions, not live ML runs.
const root = document.querySelector('[data-project-explorer]');
if (root) {
  const config = JSON.parse(root.querySelector('[data-explorer-content]').textContent);
  const ids = config.parts.map(part => part.id);
  const parts = new Map(config.parts.map(part => [part.id, part]));
  const svg = root.querySelector('.project-apparatus');
  const groups = Array.from(svg.querySelectorAll('[data-part]'));
  const controls = Array.from(root.querySelectorAll('[data-stage]'));
  const panel = root.querySelector('.explorer-panel');
  const motionButton = root.querySelector('[data-explorer-motion]');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const lang = () => document.documentElement.lang === 'en' ? 'en' : 'ko';
  let selected = config.defaultPart || ids[0];
  let paused = reduce.matches;
  let visible = false;
  let frame = 0;
  let previous = 0;
  let elapsed = 0;

  function render() {
    const language = lang();
    const part = parts.get(selected);
    panel.querySelector('[data-part-number]').textContent = String(ids.indexOf(selected) + 1).padStart(2, '0');
    panel.querySelector('[data-part-title]').textContent = part.label[language];
    panel.querySelector('[data-part-work]').textContent = part.work[language];
    panel.querySelector('[data-part-result]').textContent = part.result[language];
    controls.forEach(button => {
      const active = button.dataset.stage === selected;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    groups.forEach(group => {
      const active = group.dataset.part === selected;
      group.classList.toggle('is-active', active);
      group.setAttribute('aria-pressed', String(active));
      group.setAttribute('aria-label', parts.get(group.dataset.part).label[language]);
    });
    svg.setAttribute('aria-label', config.diagram[language]);
    svg.removeAttribute('aria-labelledby');
    root.querySelector('.explorer-stages').setAttribute('aria-label', language === 'ko' ? '프로젝트 구성 선택' : 'Explore the project');
    motionButton.setAttribute('aria-label', language === 'ko'
      ? (paused ? '모형 움직임 재생' : '모형 움직임 멈추기')
      : (paused ? 'Play apparatus motion' : 'Pause apparatus motion'));
    motionButton.setAttribute('aria-pressed', String(paused));
    motionButton.classList.toggle('is-paused', paused);
  }

  function select(id) {
    if (!parts.has(id)) return;
    selected = id;
    render();
  }
  controls.forEach(button => button.addEventListener('click', () => select(button.dataset.stage)));
  groups.forEach(group => {
    group.setAttribute('role', 'button');
    group.setAttribute('tabindex', '0');
    group.setAttribute('aria-controls', 'project-part-panel');
    group.addEventListener('click', () => select(group.dataset.part));
    group.addEventListener('pointerenter', () => group.classList.add('is-hovered'));
    group.addEventListener('pointerleave', () => group.classList.remove('is-hovered'));
    group.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        select(group.dataset.part);
      }
    });
  });

  const routes = Array.from(svg.querySelectorAll('.flow-track[data-flow-route]'));
  const pulses = routes.map((path, index) => {
    const pulse = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    pulse.classList.add('explorer-signal');
    pulse.setAttribute('r', '3.2');
    pulse.setAttribute('aria-hidden', 'true');
    path.parentNode.appendChild(pulse);
    const start = Number(path.dataset.flowStart ?? index / (routes.length + 1));
    const end = Number(path.dataset.flowEnd ?? Math.min(1, start + .45));
    return { path, pulse, start, end, length: path.getTotalLength() };
  });
  const moving = Array.from(svg.querySelectorAll('[data-motion]')).map(element => ({
    element, kind: element.dataset.motion,
    range: (element.dataset.motionRange || '0 0').split(/[ ,]+/).map(Number),
    center: (element.dataset.motionCenter || '0 0').split(/[ ,]+/).map(Number),
    base: element.getAttribute('transform') || '',
  }));
  function draw(phase, still = false) {
    pulses.forEach(({ path, pulse, length, start, end }) => {
      const t = (phase - start) / Math.max(.01, end - start);
      pulse.style.opacity = !still && t >= 0 && t <= 1 ? String(Math.min(1, t * 15, (1 - t) * 15)) : '0';
      const p = path.getPointAtLength(Math.max(0, Math.min(1, t)) * length);
      pulse.setAttribute('cx', p.x.toFixed(2));
      pulse.setAttribute('cy', p.y.toFixed(2));
    });
    const ease = (1 - Math.cos(phase * 2 * Math.PI)) / 2;
    moving.forEach(({ element, kind, range, center, base }) => {
      if (kind === 'scan') element.setAttribute('transform', `${base} translate(${(range[0] * ease).toFixed(2)} ${(range[1] * ease).toFixed(2)})`);
      if (kind === 'rotate') element.setAttribute('transform', `${base} rotate(${((range[0] || 12) * Math.sin(phase * 2 * Math.PI)).toFixed(2)} ${center.join(' ')})`);
      if (kind === 'pulse') element.style.opacity = String(still ? 1 : .65 + .35 * ease);
    });
  }
  function tick(time) {
    frame = 0;
    if (!visible || paused || document.hidden) { previous = 0; return; }
    if (previous) elapsed += Math.min(time - previous, 1000 / 30);
    previous = time;
    draw((elapsed % 8000) / 8000);
    frame = requestAnimationFrame(tick);
  }
  function syncAnimation() {
    cancelAnimationFrame(frame);
    frame = 0;
    previous = 0;
    const still = paused || !visible || document.hidden;
    root.classList.toggle('motion-still', still);
    if (still) draw((elapsed % 8000) / 8000, true);
    else frame = requestAnimationFrame(tick);
  }
  motionButton.addEventListener('click', () => { paused = !paused; render(); syncAnimation(); });
  reduce.addEventListener('change', () => { paused = reduce.matches; render(); syncAnimation(); });
  document.addEventListener('visibilitychange', syncAnimation);
  document.getElementById('toggle-motion').addEventListener('click', () => {
    paused = !window.lossLandscape.getState().playing;
    render(); syncAnimation();
  });
  document.getElementById('restart-motion').addEventListener('click', () => {
    elapsed = 0;
    paused = !window.lossLandscape.getState().playing;
    draw(0, paused); render(); syncAnimation();
  });
  new IntersectionObserver(entries => {
    visible = entries[entries.length - 1].isIntersecting;
    syncAnimation();
  }, { threshold: .05 }).observe(root.querySelector('.explorer-stage'));
  new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  render();
}
