import { Transform } from "../../Transform";
import { Vec2 } from "../../Vec2";
import { AABB, GetAABB } from "../AABB";
import { GameObject } from "../GameObject";
import { Collision } from "./Collision";

export function CircleCircleCollision(a: GameObject, b: GameObject) {
  const [normal, depth] = CircleCollider.CollideCircleCircle(a as any, b as any);

  if (depth === 0) {
    return new Collision(a, b, 0, Vec2.zero(), Vec2.zero(), Vec2.zero(), 0);
  }

  const contactPoint = CircleCollider.getCircleCircleContactPoints(b as any, normal);

  return new Collision(a, b, depth, normal, contactPoint, Vec2.zero(), 1);
}

export class CircleCollider implements GetAABB {
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

  static CollideCircleCircle(
    a: GameObject & { collider: CircleCollider },
    b: GameObject & { collider: CircleCollider }
  ): [Vec2, number] {
    const [aRadius, aPosition] = a.collider.transformRadius(a.rigidBody.transform);
    const [bRadius, bPosition] = b.collider.transformRadius(b.rigidBody.transform);

    const [normal, magnitude] = aPosition.subtract(bPosition).normalMagnitude();

    const depth = aRadius + bRadius - magnitude;

    if (depth <= 0) {
      return [Vec2.zero(), 0];
    }

    return [normal, depth];
  }

  static getCircleCircleContactPoints(
    b: GameObject & { collider: CircleCollider },
    collisionNormal: Vec2
  ): Vec2 {
    const contact = b.rigidBody.transform.position.plus(collisionNormal.scale(b.collider.radius));

    return contact;
  }

  getAABB(gameObject: GameObject) {
    const [radius, position] = this.transformRadius(gameObject.rigidBody.transform);

    const maxY = radius + position.y;
    const minY = -radius + position.y;
    const maxX = radius + position.x;
    const minX = -radius + position.x;

    return new AABB(maxX, maxY, minX, minY);
  }
}
