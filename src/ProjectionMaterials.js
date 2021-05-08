/**
 * @license
 * ProjectionMaterials from @jsantell/three-components
 * Source <https://github.com/jsantell/three-components>
 * Released under MIT License <https://github.com/jsantell/three-components/blob/master/LICENSE>
 * Copyright © 2020 Jordan Santell
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
