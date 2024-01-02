import { Vec2 } from "../Vec2";
import { getClosestPointToPoint } from "../utils/math/getClosestPointToPoint";

export default function polygonPolygonCollisionNormalDepth(
  r1: Vec2[],
  r2: Vec2[],
  center1: Vec2,
  center2: Vec2
): [Vec2, number] {
  let depth = Number.POSITIVE_INFINITY;
  let normal = Vec2.zero();

  let p1 = r1;
  let p2 = r2;

  for (let shape = 0; shape < 2; shape++) {
    if (shape == 1) {
      p1 = r2;
      p2 = r1;
    }

    for (let i = 0; i < p1.length; i++) {
      const edge = p1[(i + 1) % p1.length].subtract(p1[i]);
      const axis = edge.perpendicular().normalize();

      let [p1min, p1max] = projectVertices(p1, axis);
      let [p2min, p2max] = projectVertices(p2, axis);

      if (p1max < p2min || p2max < p1min) {
        return [Vec2.zero(), 0];
      }

      const axisDepth = Math.min(p2max, p1max) - Math.max(p1min, p2min);

      if (Math.abs(axisDepth) < depth) {
        normal = axis;
        depth = axisDepth;
      }
    }
  }

  if (center1.subtract(center2).normalize().dot(normal) < 0) {
    normal = normal.neg();
  }

  return [normal, depth];
}

function projectVertices(vertices: Vec2[], axis: Vec2) {
  let [min, max] = [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];

  for (let j = 0; j < vertices.length; j++) {
    const v = vertices[j];
    const d = v.dot(axis);

    min = Math.min(d, min);
    max = Math.max(d, max);
  }

  if (min > max) return [max, min];
  return [min, max];
}

function projectCircle(center: Vec2, radius: number, axis: Vec2) {
  const directionRadius = axis.scale(radius);

  const p1 = center.plus(directionRadius);
  const p2 = center.subtract(directionRadius);

  const min = axis.dot(p1);
  const max = axis.dot(p2);

  if (min < max) {
    return [min, max];
  } else {
    return [max, min];
  }
}

export function polygonCircleCollisionNormalDepth(
  vertices: Vec2[],
  radius: number,
  circleCenter: Vec2,
  polygonCenter: Vec2
): [Vec2, number] {
  let depth = Number.POSITIVE_INFINITY;
  let normal = Vec2.zero();

  for (let i = 0; i < vertices.length; i++) {
    const edge = vertices[(i + 1) % vertices.length].subtract(vertices[i]);
    const axis = edge.perpendicular().normalize();

    const [polygonMin, polygonMax] = projectVertices(vertices, axis);
    const [circleMin, circleMax] = projectCircle(circleCenter, radius, axis);

    if (polygonMax < circleMin || polygonMin > circleMax) {
      return [Vec2.zero(), 0];
    }

    const axisDepth = Math.min(circleMax - polygonMin, polygonMax - circleMin);

    if (axisDepth < depth) {
      normal = axis;
      depth = axisDepth;
    }
  }

  const closestPoint = getClosestPointToPoint(vertices, circleCenter);
  const axis = circleCenter.subtract(closestPoint).normalize();

  const [polygonMin, polygonMax] = projectVertices(vertices, axis);
  const [circleMin, circleMax] = projectCircle(circleCenter, radius, axis);

  if (polygonMax < circleMin || polygonMin > circleMax) {
    return [axis, 0];
  }

  const axisDepth = Math.min(circleMax - polygonMin, polygonMax - circleMin);

  if (axisDepth < depth) {
    normal = axis;
    depth = axisDepth;
  }

  if (polygonCenter.subtract(circleCenter).normalize().dot(normal) < 0) {
    normal = normal.neg();
  }

  return [normal, depth];
}
