import { Vec2 } from "../../Vec2";
import { almostEqual } from "../../utils/almostEqual";
import { pointToSegmentDistance } from "../../utils/math/pointsToSegmentDistance";
import { BoundingBox, GetBoundingBox } from "../AABB";
import { GameObject } from "../GameObject";
import polygonPolygonCollisionNormalDepth from "../SAT";
import { Collision } from "./Collision";

export function PolygonPolygonCollision(a: GameObject, b: GameObject) {
  if (!("vertices" in a.collider) || !("vertices" in b.collider)) {
    throw new Error("GameObject a and b should have a ConvexPolygonCollider");
  }

  const aVertices = a.rigidBody.transform.transformPoints(a.collider.vertices);
  const bVertices = b.rigidBody.transform.transformPoints(b.collider.vertices);

  const [normal, depth] = polygonPolygonCollisionNormalDepth(
    aVertices,
    bVertices,
    a.rigidBody.transform.position,
    b.rigidBody.transform.position
  );

  if (depth === 0) {
    return new Collision(a, b, 0, Vec2.zero(), Vec2.zero(), Vec2.zero(), 0);
  }

  let contactPoint1 = Vec2.zero();
  let contactPoint2 = Vec2.zero();
  let contactCount = 0;

  let minDistanceSq = Number.POSITIVE_INFINITY;

  for (let i = 0; i < aVertices.length; i++) {
    const p = aVertices[i];

    for (let j = 0; j < bVertices.length; j++) {
      const a = bVertices[j];
      const b = bVertices[(j + 1) % bVertices.length];

      const [cp, distSq] = pointToSegmentDistance(p, a, b);

      if (almostEqual(distSq, minDistanceSq) && !cp.almostEquals(contactPoint1)) {
        contactPoint2 = cp;
        contactCount = 2;
      } else if (distSq < minDistanceSq) {
        minDistanceSq = distSq;
        contactPoint1 = cp;
        contactCount = 1;
      }
    }
  }

  for (let i = 0; i < bVertices.length; i++) {
    const p = bVertices[i];

    for (let j = 0; j < aVertices.length; j++) {
      const a = aVertices[j];
      const b = aVertices[(j + 1) % aVertices.length];

      const [cp, distSq] = pointToSegmentDistance(p, a, b);

      if (almostEqual(distSq, minDistanceSq) && !cp.almostEquals(contactPoint1)) {
        contactPoint2 = cp;
        contactCount = 2;
      } else if (distSq < minDistanceSq) {
        minDistanceSq = distSq;
        contactPoint1 = cp;
        contactCount = 1;
      }
    }
  }

  return new Collision(a, b, depth, normal, contactPoint1, contactPoint2, contactCount);
}

export class ConvexPolygonCollider implements GetBoundingBox {
  vertices: Vec2[];

  constructor(vertices: Vec2[]) {
    for (let i = 0; i < vertices.length; i++) {
      vertices[i] = vertices[i].normalize();
    }

    this.vertices = vertices;
  }

  bounds(gameObject: GameObject) {
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;

    const vertices = gameObject.rigidBody.transform.transformPoints(this.vertices);

    for (let i = 0; i < vertices.length; i++) {
      maxX = Math.max(vertices[i].x, maxX);
      maxY = Math.max(vertices[i].y, maxY);

      minX = Math.min(vertices[i].x, minX);
      minY = Math.min(vertices[i].y, minY);
    }

    return new BoundingBox(maxX, maxY, minX, minY);
  }
}
