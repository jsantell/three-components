/**
 * @license MIT
 * @copyright Copyright © 2020 Jordan Santell
 * @see https://github.com/jsantell/three-components
 */

import { LinearToneMapping, Mesh, OrthographicCamera, Scene, PlaneBufferGeometry, ShaderMaterial, WebGLRenderTarget } from 'three';

/**
 * @module HeightToNormalMapGenerator 
 */

const fragmentShader = `
  varying vec2 vUv;
  varying vec2 vStep;
  uniform sampler2D uSource;
  uniform float uStrength;

  float getIntensity(vec2 offset) {
    vec2 coords = vUv + offset * vStep;
    /*
    // TODO this makes hard edges, not sure why
    // Wrap values > 1
    coords -= step(1.0, coords);
    // Wrap values < 0
    coords += (1.0 - step(0.0, coords));
    */
    return texture2D(uSource, coords).r;
  }

  void main() {
    float nw = getIntensity(vec2(-1.0, 1.0));
    float n  = getIntensity(vec2(0.0, 1.0));
    float ne = getIntensity(vec2(1.0, 1.0));
    float e  = getIntensity(vec2(1.0, 0.0));
    float se = getIntensity(vec2(1.0, -1.0));
    float s  = getIntensity(vec2(0.0, -1.0));
    float sw = getIntensity(vec2(-1.0, -1.0));
    float w  = getIntensity(vec2(-1.0, 0.0));

    // Horizontal Sobel filter
    // -1 0 1 
    // -2 0 2
    // -1 0 1
    float dX = nw + 2.0 * w + sw - (ne + 2.0 * e + se);

    // Vertical Sobel filter
    // -1 -2 -1 
    // 0  0  0
    // 1  2  1
    float dY = nw + 2.0 * n + ne - (sw + 2.0 * s + se);
    // Flip Y so that +Y is up
    dY *= -1.0;

    float z = 1.0 / (1.0 + uStrength);
    
    vec3 normal = normalize(vec3(dX, dY, z));
    gl_FragColor = vec4(normal * 0.5 + 0.5, 1.0);
  }
`;
const vertexShader = `
  varying vec2 vUv;
  varying vec2 vStep;
  uniform float uWidth;
  uniform float uHeight;
  
  void main() {
    vUv = uv;
    vStep = vec2(1.0 / uWidth, 1.0 / uHeight);
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }
`;
const shader = new ShaderMaterial({
  uniforms: {
    uStrength: { value: 1.0 },
    uSource: { value: null },
    uWidth: { value: 0 },
    uHeight: { value: 0 },
  },
  vertexShader,
  fragmentShader,
});

const saveRendererState = renderer => {
  return {
    outputEncoding: renderer.outputEncoding,
    toneMapping: renderer.toneMapping,
    toneMappingExposure: renderer.toneMappingExposure,
    currentRenderTarget: renderer.getRenderTarget(),
  };
};

const clearRendererState = renderer => {
  renderer.toneMapping = LinearToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.outputEncoding = false;
};

const restoreRendererState = (renderer, state) => {
  renderer.outputEncoding = state.outputEncoding;
  renderer.toneMapping = state.toneMapping;
  renderer.toneMappingExposure = state.toneMappingExposure;
  renderer.setRenderTarget(state.currentRenderTarget);
};

const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1000);
const scene = new Scene();
const plane = new Mesh(new PlaneBufferGeometry(2, 2, 0), shader);
camera.position.z = 1;
scene.add(plane);

/**
 * Takes a height map and generates a normal map
 * using a Sobel filter as a THREE.WebGLRenderTarget.
 *
 * @param {THREE.WebGLRenderer} renderer
 * @param {THREE.Texture} source Height map.
 * @param {Object} config
 * @param {number} [config.strength=1] Strength of the normals.
 * @param {number} [config.width=256] Width of the output.
 * @param {number} [config.height=256] Height of the output.
 * @return {THREE.WebGLRenderTarget}
 */
export function HeightToNormalMapGenerator(renderer, source, config = {}) {
  const { width, height, strength } = Object.assign({
    width: 256,
    height: 256,
    strength: 1,
  }, config);
  const output = new WebGLRenderTarget(width, height);

  const rendererState = saveRendererState(renderer);
  clearRendererState(renderer);

  renderer.setRenderTarget(output);
  plane.material.uniforms.uSource.value = source;
  plane.material.uniforms.uWidth.value = width;
  plane.material.uniforms.uHeight.value = height;
  plane.material.uniforms.uStrength.value = strength;
  renderer.render(scene, camera);

  restoreRendererState(renderer, rendererState);

  return output;
}
