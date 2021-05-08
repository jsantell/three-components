/**
 * @license
 * WireframeHelper from @jsantell/three-components
 * Source <https://github.com/jsantell/three-components>
 * @version 1.0.1
 * Released under MIT License <https://github.com/jsantell/three-components/blob/master/LICENSE>
 * Copyright © 2019 Jordan Santell
 */

import { LineSegments, EdgesGeometry } from 'three';

// via https://stackoverflow.com/questions/31539130/display-wireframe-and-solid-color/31541369#31541369

export class WireframeHelper extends LineSegments {
  constructor(mesh, material) {
    const geometry = new EdgesGeometry(mesh.geometry);
    super(geometry, material);

    this.matrixAutoUpdate = false;
    this.matrix = mesh.matrixWorld;
    this.mesh = mesh;
  }

  updateGeometry() {
    this.geometry = new EdgesGeometry(this.mesh.geometry);
  }
}
