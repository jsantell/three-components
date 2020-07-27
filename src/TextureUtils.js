/**
 * @license MIT
 * @copyright Copyright © 2020 Jordan Santell
 * @see https://github.com/jsantell/three-components
 */

import { FloatType, HalfFloatType, RGBAFormat, UnsignedByteType, WebGLUtils } from 'three';

/**
 * @module TextureUtils
 */

/**
 * Flips data on the Y-axis of an array
 * containing pixel RGBA values.
 *
 * @private
 * @param {Uint8Array} buffer
 * @param {Number} width
 * @param {Number} height
 */
function flipBufferY (buffer, width, height) {
  // Manually flip the buffer if needed to avoid
  // creating a second canvas element
  for (let y = 0; y < height / 2; y++) {
    for (let x = 0; x < width; x++) {
      const top = x * 4 + y * width * 4;
      const bottom = x * 4 + (height - y) * width * 4;
      for (let i = 0; i < 4; i++) {
	const t = buffer[top + i];
	const b = buffer[bottom + i];
	buffer[top + i] = b;
	buffer[bottom + i] = t;
      }
    }
  }
}


let _canvas2D;
/**
 * Generates a data URL from a Uint8Array
 * of pixel data.
 * Internally creates and uses a canvas element.
 *
 * @param {Uint8Array} buffer
 * @param {Number} width
 * @param {Number} height
 * @return {String}
 */
export function pixelBufferToDataURL (buffer, width, height) {
  const data = new Uint8ClampedArray(buffer, width, height);
  const image = new ImageData(data, width, height);

  if (!_canvas2D) {
    _canvas2D = document.createElement('canvas');
  }

  _canvas2D.width = width;
  _canvas2D.height = height;
  _canvas2D.getContext('2d').putImageData(image, 0, 0);
  return _canvas2D.toDataURL();
};

/**
 * Generates a data URL of a THREE.WebGLRenderTarget's
 * current buffer.
 * Internally creates and uses a canvas element.
 *
 * @param {THREE.WebGLRenderer} renderer
 * @param {THREE.Texture} texture
 * @return {String}
 */
export function renderTargetToDataURL (renderer, target) {
  const { width, height } = target;
  const buffer = new Uint8Array(width * height * 4);
  renderer.readRenderTargetPixels(target, 0, 0, width, height, buffer);

  if (target.texture.flipY) {
    flipBufferY(buffer, width, height);
  }

  return pixelBufferToDataURL(buffer, width, height);
};

/**
 * Generates a data URL of a THREE.Texture bound
 * by a THREE.WebGLRenderTarget.
 *
 * If you already have access to the corresponding render
 * target, use `renderTargetToDataURL()` instead.
 *
 * Internally creates and uses a canvas element.
 *
 * @param {THREE.WebGLRenderer} renderer
 * @param {THREE.Texture} texture
 * @return {String}
 * @TODO Handle CubeTextures
 */
export function textureToDataURL (renderer, texture) {
  let dataURL;
  const { extensions, capabilities } = renderer;
  const gl = renderer.getContext();
  const glTexture = renderer.properties.get(texture).__webglTexture;
  const utils = new WebGLUtils(gl, extensions, capabilities);
  const { flipY, format, type } = texture;
  const { width, height } = texture.image;

  const currentFb = gl.getParameter(gl.FRAMEBUFFER_BINDING);
  const fb = gl.createFramebuffer();

  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

  try {
    if (format !== RGBAFormat &&
	utils.convert(format) !== gl.getParameter(gl.IMPLEMENTATION_COLOR_READ_FORMAT)) {
      //throw new Error('Texture is not in RGBA or implementation defined format.');
    }
    if (type !== UnsignedByteType &&
        utils.convert(type) !== gl.getParameter(gl.IMPLEMENTATION_COLOR_READ_TYPE) &&
        !(type === FloatType &&
	  (capabilities.isWebGL2 ||
	   extensions.get('OES_texture_float') ||
	   extensions.get('WEBGL_color_buffer_float'))) &&
        !(type === HalfFloatType &&
          (capabilities.isWebGL2 ?
	    extensions.get('EXT_color_buffer_float') :
	    extensions.get('EXT_color_buffer_half_float')))) {
      throw new Error('Texture is not UnsignedByteType or implementation defined type.');
    }

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, glTexture, 0);

    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE) {

      const buffer = new Uint8Array(width * height * 4);
      gl.readPixels(0, 0, width, height, utils.convert(format), utils.convert(type), buffer);

      if (flipY) {
        flipBufferY(buffer, width, height);
      }

      dataURL = pixelBufferToDataURL(buffer, width, height);
    } else {
      throw new Error('Framebuffer not complete');
    }
  } finally {
    gl.bindFramebuffer(gl.FRAMEBUFFER, currentFb);
    gl.deleteFramebuffer(fb);
  }

  return dataURL;
};
