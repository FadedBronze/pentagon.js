import { Vec2 } from "../../Vec2";

export function getClosestPointToPoint(vertices: Vec2[], position: Vec2) {
  let closestDistance = Number.POSITIVE_INFINITY;
  let closestPoint = Vec2.zero();

  for (let i = 0; i < vertices.length; i++) {
    const vertex = vertices[i];
    const distance = vertex.distance(position);

    if (distance < closestDistance) {
      closestPoint = vertex;
      closestDistance = distance;
    }
  }

  return closestPoint;
}
