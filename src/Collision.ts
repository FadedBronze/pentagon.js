import { Vec2 } from "./Vec2";
import { GameObject } from "./GameObject";

export const verySmallValue = 0.0005;

function almostEqual(a: number, b: number) {
  return Math.abs(a - b) < verySmallValue;
}

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
    cp = ab.scale(d).add(a);
  }

  return [cp, cp.distanceSq(p)];
}

function getContactPoints(bodyA: GameObject, bodyB: GameObject): [Vec2, Vec2, number] {
  let contactPoint1 = Vec2.zero();
  let contactPoint2 = Vec2.zero();
  let contactCount = 0;

  let minDistanceSq = Number.POSITIVE_INFINITY;

  const verticesA = bodyA.getTransformedPoints();
  const verticesB = bodyB.getTransformedPoints();

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

export function resolveCollisionBasic(collision: Collision) {
  const relativeVelocity = collision.bodyA.rigidBody.linearVelocity.subtract(
    collision.bodyB.rigidBody.linearVelocity
  );

  const e = Math.min(collision.bodyA.rigidBody.restitution, collision.bodyB.rigidBody.restitution);

  const j =
    (-(1 + e) * relativeVelocity.dot(collision.normal)) /
    (collision.bodyA.rigidBody.invMass + collision.bodyB.rigidBody.invMass);

  collision.bodyA.rigidBody.linearVelocity = collision.normal
    .scale(j * collision.bodyA.rigidBody.invMass)
    .add(collision.bodyA.rigidBody.linearVelocity);

  collision.bodyB.rigidBody.linearVelocity = collision.normal
    .scale(j * -collision.bodyB.rigidBody.invMass)
    .add(collision.bodyB.rigidBody.linearVelocity);
}

export function resolveCollisionWithRotation(collision: Collision) {
  const e = Math.min(collision.bodyA.rigidBody.restitution, collision.bodyB.rigidBody.restitution);
  const contactList = [collision.contactPoint1, collision.contactPoint2];

  const impulseList = [Vec2.zero(), Vec2.zero()];
  const raList = [Vec2.zero(), Vec2.zero()];
  const rbList = [Vec2.zero(), Vec2.zero()];

  for (let i = 0; i < collision.contactCount; i++) {
    const ra = contactList[i].subtract(collision.bodyA.transform.position);
    const rb = contactList[i].subtract(collision.bodyB.transform.position);

    raList[i] = ra;
    rbList[i] = rb;

    const raPerpendicular = new Vec2(-ra.y, ra.x);
    const rbPerpendicular = new Vec2(-rb.y, rb.x);

    const angularLinearVelocityA = raPerpendicular.scale(
      collision.bodyA.rigidBody.rotationalVelocity
    );
    const angularLinearVelocityB = rbPerpendicular.scale(
      collision.bodyB.rigidBody.rotationalVelocity
    );

    const relativeVelocity = collision.bodyA.rigidBody.linearVelocity
      .add(angularLinearVelocityA)
      .subtract(collision.bodyB.rigidBody.linearVelocity.add(angularLinearVelocityB));

    const contactVelocityMag = relativeVelocity.dot(collision.normal);

    // if (contactVelocityMag > 0) {
    //   continue;
    // }

    const raPerpendicularDotNormal = raPerpendicular.dot(collision.normal);
    const rbPerpendicularDotNormal = rbPerpendicular.dot(collision.normal);

    const denominator =
      collision.bodyA.rigidBody.invMass +
      collision.bodyB.rigidBody.invMass +
      raPerpendicularDotNormal ** 2 * collision.bodyA.rigidBody.invInertia +
      rbPerpendicularDotNormal ** 2 * collision.bodyB.rigidBody.invInertia;

    let j = -(1 + e) * contactVelocityMag;
    j /= denominator;
    j /= collision.contactCount;

    const impulse = collision.normal.scale(j);
    impulseList[i] = impulse;
  }

  for (let i = 0; i < collision.contactCount; i++) {
    const impulse = impulseList[i];

    collision.bodyA.rigidBody.linearVelocity = collision.bodyA.rigidBody.linearVelocity.add(
      impulse.scale(collision.bodyA.rigidBody.invMass)
    );

    collision.bodyA.rigidBody.rotationalVelocity +=
      raList[i].cross(impulse) * collision.bodyA.rigidBody.invInertia;

    collision.bodyB.rigidBody.linearVelocity = collision.bodyB.rigidBody.linearVelocity.add(
      impulse.scale(-collision.bodyB.rigidBody.invMass)
    );

    collision.bodyB.rigidBody.rotationalVelocity -=
      rbList[i].cross(impulse) * collision.bodyB.rigidBody.invInertia;
  }
}
export class Collision {
  bodyA: GameObject;
  bodyB: GameObject;
  contactPoint1: Vec2;
  contactPoint2: Vec2;
  depth: number;
  normal: Vec2;
  contactCount: number;

  constructor(bodyA: GameObject, bodyB: GameObject, depth: number, normal: Vec2) {
    this.depth = depth;
    this.normal = normal;
    this.bodyA = bodyA;
    this.bodyB = bodyB;

    const [contactPoint1, contactPoint2, contactCount] = getContactPoints(bodyA, bodyB);

    this.contactCount = contactCount;
    this.contactPoint1 = contactPoint1;
    this.contactPoint2 = contactPoint2;
  }
}
