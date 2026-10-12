/* Constant-speed downhill travel, with an independent scroll camera. */
(function (global) {
  'use strict';
  const SPEED = 48;

  class ScrollingContourModel {
    constructor({ width = 1440, scroll = 0, anchor = 400 } = {}) {
      this.time = 0;
      this.width = width;
      this.terrain = global.ContourTerrain.create(width);
      this.scrollScale = width <= 760 ? .36 : .42;
      this.scroll = scroll;
      this.anchor = anchor;
      this.initialDistance = this.terrain.path.atY(scroll * this.scrollScale + anchor);
      this.distance = this.initialDistance;
      const point = this.terrain.path.sample(this.distance);
      this.cameraBase = point.y - anchor - scroll * this.scrollScale;
    }
    setView(scroll, anchor, width = this.width) {
      if (width !== this.width) {
        const oldPoint = this.terrain.path.sample(this.distance);
        const oldCamera = this.cameraBase + this.scroll * this.scrollScale;
        this.width = width;
        this.terrain = global.ContourTerrain.create(width);
        this.scrollScale = width <= 760 ? .36 : .42;
        this.distance = this.terrain.path.atY(oldPoint.y);
        this.initialDistance = this.distance - this.time * SPEED;
        this.cameraBase = oldCamera - scroll * this.scrollScale;
      }
      // Scrolling changes only the camera. It never changes ball speed or position.
      this.scroll = Math.max(0, scroll);
      this.anchor = anchor;
    }
    step(seconds, settleImmediately = false) {
      const total = Math.max(0, seconds);
      if (settleImmediately) {
        const point = this.terrain.path.sample(this.distance);
        this.cameraBase = point.y - this.anchor - this.scroll * this.scrollScale;
        return this.state();
      }
      const steps = Math.max(1, Math.ceil(total * 60));
      const dt = total / steps;
      for (let index = 0; index < steps; index++) {
        this.time += dt;
        this.distance += SPEED * dt;
        const point = this.terrain.path.sample(this.distance);
        const desiredCamera = point.y - this.anchor - this.scroll * this.scrollScale;
        // When the view is ahead, wait for the ball instead of accelerating it.
        // If scrolling upward leaves the ball ahead, the camera reframes gently.
        if (desiredCamera > this.cameraBase) {
          this.cameraBase += Math.min(desiredCamera - this.cameraBase, SPEED * 1.5 * dt);
        }
      }
      return this.state();
    }
    seek(time) {
      this.time = Math.max(0, time);
      this.distance = this.initialDistance + this.time * SPEED;
      const point = this.terrain.path.sample(this.distance);
      this.cameraBase = point.y - this.anchor - this.scroll * this.scrollScale;
      return this.state();
    }
    state() {
      const point = this.terrain.path.sample(this.distance);
      const cameraY = this.cameraBase + this.scroll * this.scrollScale;
      const gradient = this.terrain.gradient(point.x, point.y);
      const duration = this.terrain.path.length / SPEED;
      return {
        time: this.time, duration, period: this.terrain.period,
        scroll: this.scroll, anchor: this.anchor,
        cameraY, scrollScale: this.scrollScale,
        ballWorldX: point.x, ballWorldY: point.y,
        ballScreenY: point.y - cameraY,
        lag: this.anchor - (point.y - cameraY),
        distance: this.distance, worldSpeed: SPEED,
        worldVelocity: { x: SPEED * point.tx, y: SPEED * point.ty },
        height: this.terrain.height(point.x, point.y), gradient,
        pathAlignment: -(point.tx * gradient.x + point.ty * gradient.y) / Math.hypot(gradient.x, gradient.y),
        automaticTravel: this.time * SPEED,
      };
    }
  }
  global.ScrollingContourModel = ScrollingContourModel;
})(typeof window === 'undefined' ? globalThis : window);
