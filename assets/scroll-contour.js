/* One continuous contour landscape shared by all sections of the page. */
(function () {
  'use strict';
  const TAU = Math.PI * 2;
  const modulo = (value, period) => ((value % period) + period) % period;

  function createLossLandscape(canvas, options = {}) {
    const ctx = canvas.getContext('2d', { alpha: true });
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let width = innerWidth, height = innerHeight, lastTime = null, frame = null;
    let destroyed = false, explicitMotion = false, lastReport = '';
    let playing = !reduced.matches && options.autoplay !== false && !window.__recording;
    const anchor = () => height * (width <= 760 ? .61 : .56);
    const model = new window.ScrollingContourModel({ width, scroll: scrollY, anchor: anchor() });
    let textMasks = [];
    const tile = document.createElement('canvas');
    let tileWidth = 0, tileDpr = 0;
    canvas.dataset.renderMode = 'canvas';

    function buildTerrainTile(dpr) {
      if (tileWidth === width && tileDpr === dpr) return;
      tileWidth = width; tileDpr = dpr;
      const terrain = model.terrain, period = terrain.period;
      tile.width = Math.round(width * dpr); tile.height = Math.round(period * dpr);
      const pen = tile.getContext('2d'); pen.setTransform(dpr, 0, 0, dpr, 0, 0);
      const step = width <= 760 ? 6 : 8;
      const columns = Math.ceil(width / step), rows = Math.ceil(period / step);
      const dx = width / columns, dy = period / rows, spacing = 24;
      const values = new Float64Array((columns + 1) * (rows + 1));
      for (let row = 0; row <= rows; row++) {
        for (let column = 0; column <= columns; column++) {
          values[row * (columns + 1) + column] = terrain.height(column * dx, row * dy);
        }
      }
      const paths = new Map();
      function segment(level, first, second) {
        let path = paths.get(level);
        if (!path) { path = new Path2D(); paths.set(level, path); }
        path.moveTo(first.x, first.y); path.lineTo(second.x, second.y);
      }
      // Marching squares extracts true isoheight curves from the shared height field.
      for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
          const offset = row * (columns + 1) + column;
          const heights = [values[offset], values[offset + 1],
            values[offset + columns + 2], values[offset + columns + 1]];
          const points = [
            { x: column * dx, y: row * dy }, { x: (column + 1) * dx, y: row * dy },
            { x: (column + 1) * dx, y: (row + 1) * dy }, { x: column * dx, y: (row + 1) * dy },
          ];
          const lower = Math.ceil(Math.min(...heights) / spacing);
          const upper = Math.floor(Math.max(...heights) / spacing);
          for (let level = lower; level <= upper; level++) {
            const threshold = level * spacing, crossings = [];
            for (let edge = 0; edge < 4; edge++) {
              const next = (edge + 1) % 4;
              if ((heights[edge] >= threshold) === (heights[next] >= threshold)) continue;
              const ratio = (threshold - heights[edge]) / (heights[next] - heights[edge]);
              crossings.push({ x: points[edge].x + ratio * (points[next].x - points[edge].x),
                y: points[edge].y + ratio * (points[next].y - points[edge].y) });
            }
            if (crossings.length === 2) segment(level, crossings[0], crossings[1]);
            if (crossings.length === 4) {
              const centerAbove = heights.reduce((sum, value) => sum + value, 0) / 4 >= threshold;
              if ((heights[0] >= threshold) === centerAbove) {
                segment(level, crossings[0], crossings[1]); segment(level, crossings[2], crossings[3]);
              } else {
                segment(level, crossings[0], crossings[3]); segment(level, crossings[1], crossings[2]);
              }
            }
          }
        }
      }
      for (const [level, path] of paths) {
        const major = modulo(level, 8) === 0;
        const ink = pen.createLinearGradient(0, 0, width, 0), alpha = major ? .30 : .19;
        for (const [stop, strength] of [[0,.13],[.2,.24],[.45,.4],[.68,.67],[.86,1],[1,.8]]) {
          ink.addColorStop(stop, 'rgba(67,76,79,' + alpha * strength + ')');
        }
        pen.strokeStyle = ink; pen.lineWidth = major ? .95 : .7; pen.stroke(path);
      }
    }
    function drawField(state) {
      const start = -modulo(state.cameraY, state.period);
      for (let y = start; y < height; y += state.period) {
        ctx.drawImage(tile, 0, y, width, state.period);
      }
    }
    function drawBall(state) {
      const targetRadius = width <= 760 ? 8.8 : 10.5;
      const turns = Math.max(1, Math.round(model.terrain.path.length / (TAU * targetRadius)));
      const radius = model.terrain.path.length / (TAU * turns);
      const x = state.ballWorldX, y = state.ballScreenY - radius * .85;
      if (y < -170 || y > height + 170) return;
      let previous = null;
      for (let step = 34; step >= 0; step--) {
        const behind = step / 34 * 145;
        const past = model.terrain.path.sample(state.distance - behind);
        const point = { x: past.x, y: past.y - state.cameraY };
        if (previous) {
          ctx.beginPath(); ctx.moveTo(previous.x, previous.y); ctx.lineTo(point.x, point.y);
          ctx.strokeStyle = 'rgba(43,53,58,' + .20 * Math.pow(1 - step / 34, 1.5) + ')';
          ctx.lineWidth = .85; ctx.stroke();
        }
        previous = point;
      }
      const shadow = ctx.createRadialGradient(x, y + radius, 0, x, y + radius, radius * 2);
      shadow.addColorStop(0, 'rgba(31,40,46,.17)'); shadow.addColorStop(1, 'rgba(31,40,46,0)');
      ctx.fillStyle = shadow; ctx.beginPath();
      ctx.ellipse(x, y + radius * .93, radius * 1.8, radius * .5, 0, 0, TAU); ctx.fill();
      const pearl = ctx.createRadialGradient(x - radius * .4, y - radius * .5, radius * .05,
        x + radius * .18, y + radius * .16, radius * 1.2);
      pearl.addColorStop(0, '#bec5c6'); pearl.addColorStop(.28, '#7b878b');
      pearl.addColorStop(.68, '#3e4b51'); pearl.addColorStop(1, '#202d34');
      ctx.fillStyle = pearl; ctx.beginPath(); ctx.arc(x, y, radius, 0, TAU); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.arc(x, y, radius - .4, 0, TAU); ctx.clip();
      ctx.translate(x, y);
      ctx.rotate(Math.atan2(state.worldVelocity.y, state.worldVelocity.x) - Math.PI / 2);
      const spin = TAU * modulo(state.distance, model.terrain.path.length) / model.terrain.path.length * turns;
      ctx.beginPath();
      ctx.ellipse(Math.sin(spin) * radius * .2, 0,
        Math.max(.4, Math.abs(Math.cos(spin)) * radius * .88), radius * .97, 0, 0, TAU);
      ctx.strokeStyle = 'rgba(226,231,231,.36)'; ctx.lineWidth = .7; ctx.stroke(); ctx.restore();
    }
    function collectMasks() {
      textMasks = [...document.querySelectorAll('.reading-zone, .detail-prose, .detail-lead, .detail-facts')].map(element => {
        const box = element.getBoundingClientRect();
        return { x: box.x, y: box.y + scrollY, width: box.width, height: box.height };
      });
      render();
    }
    function softenTextAreas() {
      ctx.save(); ctx.globalCompositeOperation = 'destination-out';
      for (const box of textMasks) {
        const y = box.y - scrollY;
        if (y > height + 100 || y + box.height < -100) continue;
        ctx.save();
        ctx.translate(box.x + box.width / 2, y + box.height / 2);
        ctx.scale(box.width * .62 + 16, box.height * .78 + 18);
        const wash = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
        wash.addColorStop(0, 'rgba(0,0,0,.7)');
        wash.addColorStop(.55, 'rgba(0,0,0,.55)');
        wash.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = wash; ctx.beginPath(); ctx.arc(0, 0, 1, 0, TAU); ctx.fill();
        ctx.restore();
      }
      ctx.restore();
    }
    function render() {
      if (destroyed) return;
      ctx.clearRect(0, 0, width, height);
      const state = model.state(); drawField(state); drawBall(state); softenTextAreas();
      window.__ready = true;
    }
    function getState() {
      const state = model.state(), suspended = document.hidden ? 'document-hidden' : null;
      return { ...state, elapsed: modulo(state.time, state.duration),
        playing, running: playing && !suspended && !destroyed,
        suspended, reducedMotion: reduced.matches,
        renderer: 'canvas', renderMode: 'canvas', illustrative: true,
        loop: true, cycles: Math.floor(state.time / state.duration),
        ballScreenPosition: { x: state.ballWorldX, y: state.ballScreenY },
        worldPosition: { x: state.ballWorldX, y: state.ballWorldY },
        phase: state.lag > 2 ? 'descending' : state.lag < -2 ? 'reframing' : 'rolling',
      };
    }
    function report(force = false) {
      if (!options.onState) return;
      const state = getState(), key = [state.playing, state.suspended, state.reducedMotion].join('|');
      if (force || key !== lastReport) { lastReport = key; options.onState(state); }
    }
    function tick(now) {
      frame = null;
      if (destroyed || !playing || document.hidden) { lastTime = null; return; }
      if (lastTime !== null) model.step(Math.min((now - lastTime) / 1000, .05));
      lastTime = now; render(); report(); frame = requestAnimationFrame(tick);
    }
    function sync() {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null; lastTime = null; report(true);
      if (!destroyed && playing && !document.hidden) frame = requestAnimationFrame(tick);
    }
    function play() { explicitMotion = true; playing = true; sync(); }
    function pause() { playing = false; sync(); }
    function restart() { model.seek(0); explicitMotion = true; playing = true; render(); sync(); }
    function seek(time) { model.seek(Number(time) || 0); lastTime = null; render(); report(true); }
    function advance(seconds) { model.step(seconds); lastTime = null; render(); report(true); }
    function onScroll() {
      model.setView(scrollY, anchor());
      if (reduced.matches && !explicitMotion) model.step(0, true);
      render();
    }
    function resize() {
      const box = canvas.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
      width = Math.max(1, box.width); height = Math.max(1, box.height);
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); model.setView(scrollY, anchor(), width);
      buildTerrainTile(dpr);
      if (reduced.matches && !explicitMotion) model.step(0, true);
      render();
    }
    function onMotion() {
      if (reduced.matches && !explicitMotion) {
        playing = false; model.step(0, true); render(); sync();
      }
    }
    const observer = new ResizeObserver(resize); observer.observe(canvas);
    const contentObserver = new ResizeObserver(collectMasks);
    contentObserver.observe(document.querySelector('.wrap'));
    document.fonts.ready.then(collectMasks);
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', sync); reduced.addEventListener('change', onMotion);
    resize(); sync();
    function destroy() {
      destroyed = true; playing = false;
      if (frame !== null) cancelAnimationFrame(frame);
      observer.disconnect(); contentObserver.disconnect(); window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', sync); reduced.removeEventListener('change', onMotion);
    }
    return { play, pause, restart, seek, advance, getState, destroy };
  }
  window.createLossLandscape = createLossLandscape;
})();
