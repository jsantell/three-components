/**
 * @license MIT
 * @copyright Copyright © 2020 Jordan Santell
 * @see https://github.com/jsantell/three-components
 */

import { Quaternion, Matrix4, Vector3, BoxBufferGeometry, BufferAttribute } from 'three';

const $vertices = Symbol('vertices');
const m = new Matrix4();
const v = new Vector3();

/**
 * Geometry for a camera's frustum.
 */
export class FrustumGeometry extends BoxBufferGeometry {
  /**
   * @param {number} [widthSegments=1] - Number of width segments
   * @param {number} [heightSegments=1] - Number of height segments
   * @param {number} [depthSegments=1] - Number of depth segments
   */
  constructor(widthSegments=1, heightSegments=1, depthSegments=1) {
    super(2, 2, 2, widthSegments, heightSegments=1, depthSegments=1);
    this.dynamic = true;

    const position = this.attributes.position;
    const { itemSize, count } = position;
    this[$vertices] = new BufferAttribute(new Float32Array(itemSize * count), itemSize);
    this[$vertices].copy(position);
  }

  /**
   * Updates this geometry's vertices to reflect the
   * frustum defined by the projection matrix.
   * @param {THREE.Matrix4} projectionMatrix
   */
  setFromMatrix(projectionMatrix) {
    if (!projectionMatrix) {
      return;
    }

    m.getInverse(projectionMatrix);
    const length = this[$vertices].itemSize * this[$vertices].count;
    const unprojected = this[$vertices].array;

    for (let i = 0; i < length; i += 3) {
      v.set(unprojected[i], unprojected[i + 1], -unprojected[i + 2]);
      v.applyMatrix4(m);
      this.attributes.position.setXYZ(i / 3, v.x, v.y, v.z);
    }
    this.attributes.position.needsUpdate = true;
    this.computeVertexNormals();
  }
}
