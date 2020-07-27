/**
 * @license MIT
 * @copyright Copyright © 2020 Jordan Santell
 * @see https://github.com/jsantell/three-components
 */

import { WebGLRenderer, PerspectiveCamera, Scene } from 'three';

/**
 * Boilerplate application for a fullscreen three.js app.
 */
export class App {
  constructor(config={}) {
    this.renderer = new WebGLRenderer(config);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.scene = new Scene();

    this.camera = new PerspectiveCamera(60, this.getAspect(), 0.1, 1000);

    this.onResize = this.onResize.bind(this);
    window.addEventListener('resize', this.onResize);

    this.init();

    this.lastTick = 0;
    this.onTick = this.onTick.bind(this);
    requestAnimationFrame(this.onTick);
  }

  onTick() {
    const t = performance.now();
    const delta = performance.now() - this.lastTick;
    if (this.update) {
      this.update(t, delta);
    }
    if (this.render) {
      this.render(t, delta);
    }
    this.lastTick = t;
    requestAnimationFrame(this.onTick);
  }

  init() {

  }

  update() {

  }

  render(time, delta) {
    this.renderer.render(this.scene, this.camera);
  }

  getAspect() {
    return window.innerWidth / window.innerHeight;
  }

  onResize() {
    this.camera.aspect = this.getAspect();
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
