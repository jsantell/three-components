/**
 * @license MIT
 * @copyright Copyright © 2020 Jordan Santell
 * @see https://github.com/jsantell/three-components
 */

/**
 * @module utils 
 */

/**
 * Computes the center of an array of points,
 * setting `target` to the computed center.
 *
 * @param {Array<THREE.Vector3>} points
 * @param {THREE.Vector3} target
 */
export function getCenterPointOfPoints (points, target) {
  target.set(0, 0, 0);
  for (let point of points) {
    target.add(point);
  }
  target.divideScalar(points.length);
  return target;
};
