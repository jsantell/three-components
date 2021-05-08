/**
 * @license MIT
 * @copyright Copyright © 2020 Jordan Santell
 * @see https://github.com/jsantell/three-components
 */

import { LineSegments, EdgesGeometry } from 'three';

// via https://stackoverflow.com/questions/31539130/display-wireframe-and-solid-color/31541369#31541369

/**
 * A THREE.LineSegments object that constructs lines from the provided mesh.
 *
 * @extends THREE.LineSegments
 * @param {THREE.Mesh} mesh - Mesh that the WireframeHelper wireframes.
 * @param {THREE.Material} material - WireframeHelper's material.
 */
export class WireframeHelper extends LineSegments {
  constructor(mesh, material) {
    const geometry = new EdgesGeometry(mesh.geometry);
    super(geometry, material);

    this.matrixAutoUpdate = false;
    this.matrix = mesh.matrixWorld;
    this.mesh = mesh;
  }

  /**
   * Updates the WireframeHelper's geometry to the bound mesh's geometry.
   */
  updateGeometry() {
    this.geometry = new EdgesGeometry(this.mesh.geometry);
  }
}
