/**
 * @license
 * LineGeometry from @jsantell/three-components
 * Source <https://github.com/jsantell/three-components>
 * Released under MIT License <https://github.com/jsantell/three-components/blob/master/LICENSE>
 * Copyright © 2020 Jordan Santell
 */

import { BufferGeometry, Color, Float32BufferAttribute, Quaternion, Uint16BufferAttribute, Vector3 } from 'three';

const τ = Math.PI * 2;
const DEFAULTS = {
  radialSegments: 4,
  width: 0.1,
  color: new Color(0x000000),
};

export class LineGeometry extends BufferGeometry {
  constructor(root, config={}) {
    super();
    config = Object.assign({}, DEFAULTS, config);

    const { bones, vertices, indices, colors, skinWeights, skinIndices, uvs } = this._createGeometry(root, config);

    this.setIndex(indices);
    this.setAttribute('position', new Float32BufferAttribute(vertices, 3));
    this.setAttribute('color', new Float32BufferAttribute(colors, 3));
    this.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
    this.setAttribute('skinIndex', new Uint16BufferAttribute(skinIndices, 4));
    this.setAttribute('skinWeight', new Float32BufferAttribute(skinWeights, 4));
    this.computeVertexNormals();
    this.bones = bones;
  }

  _createGeometry(root, config) {
    const { radialSegments, color: defaultColor, width: defaultWidth } = config;

    // A Map from node to an array of `config.radialSegments` length
    // containing indices to the corresponding vertices for that node
    const nodeToVertexIndices = new Map();
    // Map<Bone, number>
    const nodeToBoneIndex = new Map();

    let vertexCount = 0;
    const nodes = [root];
    const indices = [];
    const vertices = [];
    const colors = [];
    const uvs = [];
    const bones = [];
    const skinIndices = [];
    const skinWeights = [];
    const position = new Vector3();
    const quaternion = new Quaternion();
    const vPosition = new Vector3();

    // For each segment node
    while (nodes.length) {
      const node = nodes.shift();
      let isTerminator = true;

      // Queue up children
      for (let child of node.children) {
        if (child.isBone) {
          nodes.push(child);
          isTerminator = false;
        } 
      }

      const id = node.id;
      const radius = ('width' in node) ? node.width / 2 : defaultWidth / 2;
      const color = ('color' in node) ? node.color : defaultColor;

      // If the last node, don't orient the vertices
      // according to its rotation (for possible object/planes
      // children), but to its parent as to not smush
      // the vertices.
      if (!root && isTerminator) {
        node.parent.getWorldQuaternion(quaternion);
      } else {
        node.getWorldQuaternion(quaternion);
      }
      node.getWorldPosition(position);

      const nodeIndices = new Array(radialSegments);
 
      bones.push(node);
      const boneIndex = bones.length - 1;

      nodeToVertexIndices.set(node, nodeIndices);
      nodeToBoneIndex.set(node, boneIndex);

      for (let i = 0; i < radialSegments; i++) {
        const index = vertexCount++;
        const θ = (i / radialSegments) * τ;
        const x = Math.sin(θ) * radius;
        const y = Math.cos(θ) * radius;
        const u = x / radialSegments;
        const v = 1;

        vPosition.set(x, y, 0);
        vPosition.applyQuaternion(quaternion);
        vPosition.add(position);

        vertices.push(vPosition.x, vPosition.y, vPosition.z);
        colors.push(color.r, color.g, color.b);

        uvs.push(u, v);
        nodeIndices[i] = index;

        const parentBoneIndex = nodeToBoneIndex.get(node.parent);
        // @TODO add more weights 
        skinIndices.push(boneIndex, 0, 0, 0);
        skinWeights.push(1, 0, 0, 0);
      }

      if (node !== root) {
        const parentIndices = nodeToVertexIndices.get(node.parent);

        for (let x = 0; x < radialSegments; x++) {
          const next = (x + 1) % radialSegments;
          let a = nodeIndices[x];
          let b = parentIndices[x];
          let c = parentIndices[next]
          let d = nodeIndices[next];

          indices.push(a, d, b);
          indices.push(d, c, b);
        }
      }
    }

    return {
      colors,
      indices,
      vertices,
      skinWeights,
      skinIndices,
      bones,
      uvs,
    }
  }
}
