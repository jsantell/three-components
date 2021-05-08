/**
 * @license MIT
 * @copyright Copyright © 2020 Jordan Santell
 * @see https://github.com/jsantell/three-components
 */

import { ShaderMaterial, ShaderLib, UniformsUtils, Matrix4, Color } from 'three';

const prefixVS = `
uniform float projectionBlend;
uniform mat4 altProjectionMatrix;
uniform mat4 altViewMatrix;
`;

const projectVertex = `
vec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 );
gl_Position = projectionMatrix * mvPosition;

vec4 altMVP = altProjectionMatrix * altViewMatrix * modelMatrix * vec4(position, 1.0);
altMVP.z *= -1.0;
vec4 projPosition = projectionMatrix * viewMatrix * altMVP;

gl_Position = mix(gl_Position, projPosition, projectionBlend);
`;

/**
 * A THREE.MeshPhongMaterial based material that can blend the standard projection/view matrices by alternative matrices.
 *
 * @extends THREE.ShaderMaterial
 * @param {Object} config
 * @param {THREE.Matrix4} config.altProjectionMatrix - Alternate projection matrix.
 * @param {THREE.Matrix4} config.altViewMatrix - Alternate view matrix.
 * @param {Number} config.projectionBlend - Normalized value indicating the interpolation between the standard projection and view matrices, and the alternates.
 * @param {THREE.Color} config.color - Diffuse material color.
 */
export class ProjectionPhongMaterial extends ShaderMaterial {
  constructor({ altProjectionMatrix, altViewMatrix, projectionBlend, color }) {
    let vertexShader = ShaderLib.phong.vertexShader;
    vertexShader = prefixVS + vertexShader.replace(/\s#include <project_vertex>\s*/g, projectVertex);
    super({
      lights: true,
      vertexShader,
      fragmentShader: ShaderLib.phong.fragmentShader,
      uniforms: UniformsUtils.merge([
        ShaderLib.phong.uniforms,
        {
          altProjectionMatrix: { value: altProjectionMatrix || new Matrix4() },
          altViewMatrix: { value: altViewMatrix || new Matrix4() },
          projectionBlend: { value: projectionBlend || 0 },
          diffuse: { value: new Color(color) },
        }
      ])
    });
  }
};

/**
 * A THREE.MeshBasicMaterial based material that can blend the standard projection/view matrices by alternative matrices.
 *
 * @extends THREE.ShaderMaterial
 * @param {Object} config
 * @param {THREE.Matrix4} config.altProjectionMatrix - Alternate projection matrix.
 * @param {THREE.Matrix4} config.altViewMatrix - Alternate view matrix.
 * @param {Number} config.projectionBlend - Normalized value indicating the interpolation between the standard projection and view matrices, and the alternates.
 * @param {THREE.Color} config.color - Diffuse material color.
 * @param {Boolean} config.wireframe - THREE.BasicMaterial wireframe.
 * @param {Boolean} config.transparent - THREE.BasicMaterial transparent.
 * @param {Number} config.opacity - THREE.BasicMaterial opacity.
 */
export class ProjectionBasicMaterial extends ShaderMaterial {
  constructor({ wireframe, transparent, opacity, color, altProjectionMatrix, altViewMatrix, projectionBlend }) {
    let vertexShader = ShaderLib.basic.vertexShader;
    vertexShader = prefixVS + vertexShader.replace(/\s#include <project_vertex>\s*/g, projectVertex);
    super({
      transparent,
      vertexShader,
      fragmentShader: ShaderLib.basic.fragmentShader,
      uniforms: UniformsUtils.merge([
        ShaderLib.basic.uniforms,
        {
          altProjectionMatrix: { value: altProjectionMatrix || new Matrix4() },
          altViewMatrix: { value: altViewMatrix || new Matrix4() },
          projectionBlend: { value: projectionBlend || 0 },
          diffuse: { value: new Color(color) },
          opacity: { value: opacity !== void 0 ? opacity : 1 },
        }
      ])
    });
    this.transparent = transparent;
    this.wireframe = wireframe;
  }
};

/**
 * A THREE.LineBasicMaterial based material that can blend the standard projection/view matrices by alternative matrices.
 *
 * @param {Object} config
 * @param {THREE.Matrix4} config.altProjectionMatrix - Alternate projection matrix.
 * @param {THREE.Matrix4} config.altViewMatrix - Alternate view matrix.
 * @param {Number} config.projectionBlend - Normalized value indicating the interpolation between the standard projection and view matrices, and the alternates.
 * @param {THREE.Color} config.color - Diffuse material color.
 */
export class ProjectionLineMaterial extends ShaderMaterial {
  constructor({ color, altProjectionMatrix, altViewMatrix, projectionBlend }) {
    let vertexShader = ShaderLib.basic.vertexShader;
    vertexShader = prefixVS + vertexShader.replace(/\s#include <project_vertex>\s*/g, projectVertex);
    super({
      vertexShader,
      fragmentShader: ShaderLib.basic.fragmentShader,
      uniforms: UniformsUtils.merge([
        ShaderLib.basic.uniforms,
        {
          altProjectionMatrix: { value: altProjectionMatrix || new Matrix4() },
          altViewMatrix: { value: altViewMatrix || new Matrix4() },
          projectionBlend: { value: projectionBlend || 0 },
          diffuse: { value: new Color(color) },
        }
      ])
    });
  }
};
