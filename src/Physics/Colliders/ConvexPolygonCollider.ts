import { Vec2 } from "../../Vec2";
import { almostEqual } from "../../utils/almostEqual";
import { AABB, GetAABB } from "../AABB";
import { GameObject } from "../GameObject";
import SAT, { SATWithCircle } from "../SAT";
import { CircleCollider } from "./CircleCollider";
import { Collision } from "./Collision";

function pointToSegmentDistance(p: Vec2, a: Vec2, b: Vec2): [Vec2, number] {
  const ab = b.subtract(a);
  const ap = p.subtract(a);

  const abMagSq = ab.magnitude() ** 2;

  const proj = ab.dot(ap);

  const d = proj / abMagSq;

  let cp = Vec2.zero();

  if (d >= 1) {
    cp = b;
  } else if (d <= 0) {
    cp = a;
  } else {
    cp = ab.scale(d).plus(a);
  }

  return [cp, cp.distanceSq(p)];
}

export function PolygonPolygonCollision(a: GameObject, b: GameObject) {
  const [normal, depth] = ConvexPolygonCollider.CollidePolygonPolygon(a as any, b as any);

  if (depth === 0) {
    return new Collision(a, b, 0, Vec2.zero(), Vec2.zero(), Vec2.zero(), 0);
  }

  const [contactPoint1, contactPoint2, contactCount] =
    ConvexPolygonCollider.getPolygonPolygonContactPoints(a as any, b as any);

  return new Collision(a, b, depth, normal, contactPoint1, contactPoint2, contactCount);
}

export function PolygonCircleCollision(a: GameObject, b: GameObject) {
  const [normal, depth] = ConvexPolygonCollider.CollidePolygonCircle(a as any, b as any);

  if (depth === 0) {
    return new Collision(a, b, 0, Vec2.zero(), Vec2.zero(), Vec2.zero(), 0);
  }

  const contactPoint = ConvexPolygonCollider.getPolygonCircleContactPoints(a as any, b as any);

  return new Collision(a, b, depth, normal, contactPoint, Vec2.zero(), 1);
}

export class ConvexPolygonCollider implements GetAABB {
  vertices: Vec2[];

  constructor(vertices: Vec2[]) {
    for (let i = 0; i < vertices.length; i++) {
      vertices[i] = vertices[i].normalize();
    }

    this.vertices = vertices;
  }

  static CollidePolygonPolygon(
    a: GameObject & { collider: ConvexPolygonCollider },
    b: GameObject & { collider: ConvexPolygonCollider }
  ): [Vec2, number] {
    const p1 = a.rigidBody.transform.transformPoints(a.collider.vertices);
    const p2 = b.rigidBody.transform.transformPoints(b.collider.vertices);

    return SAT(p1, p2, a.rigidBody.transform.position, b.rigidBody.transform.position);
  }

  static getPolygonPolygonContactPoints(
    a: GameObject & { collider: ConvexPolygonCollider },
    b: GameObject & { collider: ConvexPolygonCollider }
  ): [Vec2, Vec2, number] {
    let contactPoint1 = Vec2.zero();
    let contactPoint2 = Vec2.zero();
    let contactCount = 0;

    let minDistanceSq = Number.POSITIVE_INFINITY;

    const verticesA = a.rigidBody.transform.transformPoints(a.collider.vertices);
    const verticesB = b.rigidBody.transform.transformPoints(b.collider.vertices);

    for (let i = 0; i < verticesA.length; i++) {
      const p = verticesA[i];

      for (let j = 0; j < verticesB.length; j++) {
        const a = verticesB[j];
        const b = verticesB[(j + 1) % verticesB.length];

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

    for (let i = 0; i < verticesB.length; i++) {
      const p = verticesB[i];

      for (let j = 0; j < verticesA.length; j++) {
        const a = verticesA[j];
        const b = verticesA[(j + 1) % verticesA.length];

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

    return [contactPoint1, contactPoint2, contactCount];
  }

  static CollidePolygonCircle(
    a: GameObject & { collider: ConvexPolygonCollider },
    b: GameObject & { collider: CircleCollider }
  ): [Vec2, number] {
    const [radius, position] = b.collider.transformRadius(b.rigidBody.transform);
    const transformedPoints = a.rigidBody.transform.transformPoints(a.collider.vertices);

    return SATWithCircle(transformedPoints, radius, position, a.rigidBody.transform.position);
  }

  static getPolygonCircleContactPoints(
    a: GameObject & { collider: ConvexPolygonCollider },
    b: GameObject & { collider: CircleCollider }
  ): Vec2 {
    let minDistanceSq = Number.POSITIVE_INFINITY;
    let contactPoint = Vec2.zero();

    const verticesB = a.rigidBody.transform.transformPoints(a.collider.vertices);

    const p = b.rigidBody.transform.position;

    for (let j = 0; j < verticesB.length; j++) {
      const a = verticesB[j];
      const b = verticesB[(j + 1) % verticesB.length];

      const [cp, distSq] = pointToSegmentDistance(p, a, b);

      if (distSq < minDistanceSq) {
        minDistanceSq = distSq;
        contactPoint = cp;
      }
    }

    return contactPoint;
  }

  getAABB(gameObject: GameObject) {
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

    return new AABB(maxX, maxY, minX, minY);
  }
}
