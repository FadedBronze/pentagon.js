import { Transform } from "../../Transform";
import { Vec2 } from "../../Vec2";
import { pointToSegmentDistance } from "../../utils/math/pointsToSegmentDistance";
import { BoundingBox, GetBoundingBox } from "../AABB";
import { GameObject } from "../GameObject";
import { polygonCircleCollisionNormalDepth } from "../SAT";
import { Collision } from "./Collision";

export function CircleCircleCollision(a: GameObject, b: GameObject) {
  if (!("radius" in a.collider) || !("radius" in b.collider)) {
    throw new Error("Provided GameObject should have a CircleCollider component");
  }

  const [aRadius, aPosition] = a.collider.transformRadius(a.rigidBody.transform);
  const [bRadius, bPosition] = b.collider.transformRadius(b.rigidBody.transform);

  const [normal, magnitude] = aPosition.subtract(bPosition).normalMagnitude();

  const depth = aRadius + bRadius - magnitude;

  if (depth <= 0) {
    return new Collision(a, b, 0, Vec2.zero(), Vec2.zero(), Vec2.zero(), 0);
  }

  const contactPoint = b.rigidBody.transform.position.plus(normal.scale(b.collider.radius));

  return new Collision(a, b, depth, normal, contactPoint, Vec2.zero(), 1);
}

export function PolygonCircleCollision(a: GameObject, b: GameObject) {
  if (!("vertices" in a.collider && "radius" in b.collider))
    throw new Error(
      "GameObject a and b should have a ConvexPolygonCollider and CircleCollider respectively"
    );

  const [radius, position] = b.collider.transformRadius(b.rigidBody.transform);
  const transformedPoints = a.rigidBody.transform.transformPoints(a.collider.vertices);

  const [normal, depth] = polygonCircleCollisionNormalDepth(
    transformedPoints,
    radius,
    position,
    a.rigidBody.transform.position
  );

  if (depth === 0) {
    return new Collision(a, b, 0, Vec2.zero(), Vec2.zero(), Vec2.zero(), 0);
  }

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

  return new Collision(a, b, depth, normal, contactPoint, Vec2.zero(), 1);
}

export class CircleCollider implements GetBoundingBox {
  radius: number;

  constructor(radius: number) {
    this.radius = radius;
  }

  transformRadius(transform: Transform): [number, Vec2] {
    let radiusAsVector = [new Vec2(0, 0), new Vec2(this.radius, 0)];

    radiusAsVector = transform.transformPoints(radiusAsVector);

    const center = radiusAsVector[0];
    const edge = radiusAsVector[1];

    const transformedRadius = edge.subtract(center).magnitude();

    return [transformedRadius, center];
  }

  bounds(gameObject: GameObject) {
    const [radius, position] = this.transformRadius(gameObject.rigidBody.transform);

    const maxY = radius + position.y;
    const minY = -radius + position.y;
    const maxX = radius + position.x;
    const minX = -radius + position.x;

    return new BoundingBox(maxX, maxY, minX, minY);
  }
}
