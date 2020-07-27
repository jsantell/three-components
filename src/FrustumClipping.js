/**
 * @license MIT
 * @copyright Copyright © 2020 Jordan Santell
 * @see https://github.com/jsantell/three-components
 */

import { Object3D, PlaneGeometry, Plane, Vector3, MeshNormalMaterial, Mesh } from 'three';

// Enum for planes
const NEAR = 0;
const FAR = 1;
const LEFT = 2;
const RIGHT = 3;
const TOP = 4;
const BOTTOM = 5;

// Enum for points in clipping space
const TOP_LEFT_FRONT = 0;
const TOP_RIGHT_FRONT = 1;
const BOTTOM_LEFT_FRONT = 2;
const BOTTOM_RIGHT_FRONT = 3;
const TOP_LEFT_BACK = 4;
const TOP_RIGHT_BACK = 5;
const BOTTOM_LEFT_BACK = 6;
const BOTTOM_RIGHT_BACK = 7;

// Points in clipping space
const POINT_COORDS = [
  [-1, 1, -1],
  [1, 1, -1],
  [-1, -1, -1],
  [1, -1, -1],
  [-1, 1, 1],
  [1, 1, 1],
  [-1, -1, 1],
  [1, -1, 1]
];

// An array for each plane containing 4 indicies referencing
// the clipping space point array in CCW winding order for the
// PlaneGeometry, like a backwards Z if facing the normal.
const PLANE_POINTS = [
  [BOTTOM_RIGHT_FRONT, BOTTOM_LEFT_FRONT, TOP_RIGHT_FRONT, TOP_LEFT_FRONT], // near
  [BOTTOM_LEFT_BACK, BOTTOM_RIGHT_BACK, TOP_LEFT_BACK, TOP_RIGHT_BACK], // far
  [BOTTOM_LEFT_FRONT, BOTTOM_LEFT_BACK, TOP_LEFT_FRONT, TOP_LEFT_BACK], // left
  [BOTTOM_RIGHT_BACK, BOTTOM_RIGHT_FRONT, TOP_RIGHT_BACK, TOP_RIGHT_FRONT], // right
  [TOP_RIGHT_BACK, TOP_RIGHT_FRONT, TOP_LEFT_BACK, TOP_LEFT_FRONT], // top
  [BOTTOM_RIGHT_FRONT, BOTTOM_RIGHT_BACK, BOTTOM_LEFT_FRONT, BOTTOM_LEFT_BACK] // bottom
]

const getPointsForPlane = (points, planeType) =>
  PLANE_POINTS[planeType].map(ptIndex => points[ptIndex]);

/**
 * Sets clipping planes of a renderer based on a camera's frustum.
 * @see https://threejs.org/docs/#api/en/renderers/WebGLRenderer.clippingPlanes
 */
export class FrustumClipping {
  /**
   * @param {THREE.WebGLRenderer} renderer - Renderer that will have its clipping planes set.
   * @param {THREE.Camera} camera - Camera's frustum to clip to.
   */
  constructor(renderer, camera) {
    this.renderer = renderer;
    this.camera = camera;
    this.planes = [...new Array(6)].map(() => new Plane());
    this.enabled = true;

    this._points = [...new Array(8)].map((_, i) => new Vector3(POINT_COORDS[i]));

    this.update();
  }

  /**
   * Updates the renderer's clipping planes to the camera's current frustum.
   * Call everytime the camera's frustum changes.
   */
  update() {
    for (let i = 0; i < POINT_COORDS.length; i++) {
      // Convert from clip space to view space
      let point = this._points[i];
      point.fromArray(POINT_COORDS[i]);
      point.unproject(this.camera);
    }

    // Set the clipping planes based on the new world space frustum
    for (let plane of [NEAR, FAR, LEFT, RIGHT, TOP, BOTTOM]) {
      this.planes[plane].setFromCoplanarPoints(...getPointsForPlane(this._points, plane));
    }

    this.renderer.clippingPlanes = [...this.planes];
  }
}
