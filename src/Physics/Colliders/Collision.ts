import { Vec2 } from "../../Vec2";
import { GameObject } from "../GameObject";

export function resolveCollisionWithRotationAndFriction(collision: Collision) {
  const e = Math.min(collision.bodyA.rigidBody.restitution, collision.bodyB.rigidBody.restitution);
  const contactList = [collision.contactPoint1, collision.contactPoint2];

  const impulseList = [Vec2.zero(), Vec2.zero()];
  const frictionImpulseList = [Vec2.zero(), Vec2.zero()];
  const jList = [0, 0];
  const raList = [Vec2.zero(), Vec2.zero()];
  const rbList = [Vec2.zero(), Vec2.zero()];

  const staticFriction =
    (collision.bodyA.rigidBody.staticFriction + collision.bodyB.rigidBody.staticFriction) * 0.5;

  const dynamicFriction =
    (collision.bodyA.rigidBody.dynamicFriction + collision.bodyB.rigidBody.dynamicFriction) * 0.5;

  for (let i = 0; i < collision.contactCount; i++) {
    const ra = contactList[i].subtract(collision.bodyA.rigidBody.transform.position);
    const rb = contactList[i].subtract(collision.bodyB.rigidBody.transform.position);

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
      .plus(angularLinearVelocityA)
      .subtract(collision.bodyB.rigidBody.linearVelocity.plus(angularLinearVelocityB));

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

    jList[i] = j;

    const impulse = collision.normal.scale(j);
    impulseList[i] = impulse;
  }

  for (let i = 0; i < collision.contactCount; i++) {
    const impulse = impulseList[i];

    collision.bodyA.rigidBody.linearVelocity = collision.bodyA.rigidBody.linearVelocity.plus(
      impulse.scale(collision.bodyA.rigidBody.invMass)
    );

    collision.bodyA.rigidBody.rotationalVelocity +=
      raList[i].cross(impulse) * collision.bodyA.rigidBody.invInertia;

    collision.bodyB.rigidBody.linearVelocity = collision.bodyB.rigidBody.linearVelocity.plus(
      impulse.scale(-collision.bodyB.rigidBody.invMass)
    );

    collision.bodyB.rigidBody.rotationalVelocity -=
      rbList[i].cross(impulse) * collision.bodyB.rigidBody.invInertia;
  }

  for (let i = 0; i < collision.contactCount; i++) {
    const ra = contactList[i].subtract(collision.bodyA.rigidBody.transform.position);
    const rb = contactList[i].subtract(collision.bodyB.rigidBody.transform.position);

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
      .plus(angularLinearVelocityA)
      .subtract(collision.bodyB.rigidBody.linearVelocity.plus(angularLinearVelocityB));

    let tangent = relativeVelocity.subtract(
      collision.normal.scale(collision.normal.dot(relativeVelocity))
    );

    if (tangent.almostEquals(Vec2.zero())) {
      continue;
    } else {
      tangent = tangent.normalize();
    }

    const raPerpendicularDotTangent = raPerpendicular.dot(tangent);
    const rbPerpendicularDotTangent = rbPerpendicular.dot(tangent);

    const denominator =
      collision.bodyA.rigidBody.invMass +
      collision.bodyB.rigidBody.invMass +
      raPerpendicularDotTangent ** 2 * collision.bodyA.rigidBody.invInertia +
      rbPerpendicularDotTangent ** 2 * collision.bodyB.rigidBody.invInertia;

    let jt = -relativeVelocity.dot(tangent);
    jt /= denominator;
    jt /= collision.contactCount;

    const j = jList[i];

    if (Math.abs(jt) <= j * staticFriction) {
      frictionImpulseList[i] = tangent.scale(jt);
    } else {
      frictionImpulseList[i] = tangent.scale(-j * dynamicFriction);
    }
  }

  for (let i = 0; i < collision.contactCount; i++) {
    const friction = frictionImpulseList[i];

    collision.bodyA.rigidBody.linearVelocity = collision.bodyA.rigidBody.linearVelocity.plus(
      friction.scale(collision.bodyA.rigidBody.invMass)
    );

    collision.bodyA.rigidBody.rotationalVelocity +=
      raList[i].cross(friction) * collision.bodyA.rigidBody.invInertia;

    collision.bodyB.rigidBody.linearVelocity = collision.bodyB.rigidBody.linearVelocity.plus(
      friction.scale(-collision.bodyB.rigidBody.invMass)
    );

    collision.bodyB.rigidBody.rotationalVelocity -=
      rbList[i].cross(friction) * collision.bodyB.rigidBody.invInertia;
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

  constructor(
    bodyA: GameObject,
    bodyB: GameObject,
    depth: number,
    normal: Vec2,
    contactPoint1: Vec2,
    contactPoint2: Vec2,
    contactCount: number
  ) {
    this.depth = depth;
    this.normal = normal;
    this.bodyA = bodyA;
    this.bodyB = bodyB;

    this.contactPoint1 = contactPoint1;
    this.contactPoint2 = contactPoint2;

    this.contactCount = contactCount;
    this.contactPoint1 = contactPoint1;
    this.contactPoint2 = contactPoint2;
  }
}
