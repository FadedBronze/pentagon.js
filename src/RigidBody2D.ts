import { Transform } from "./Transform";
import { Vec2 } from "./Vec2";

type BodyType = "static" | "dynamic";
const GRAVITY = new Vec2(0, -9.81);

export class RigidBody2D {
  rotationalVelocity: number;
  linearVelocity: Vec2;
  invMass: number;
  force: Vec2;
  restitution: number;
  bodyType: BodyType;
  invInertia: number;

  //modifies given transform
  applyStep(transform: Transform, time: number) {
    if (this.bodyType === "static") {
      return;
    }

    const acceleration: Vec2 = this.force.scale(this.invMass);

    this.linearVelocity = acceleration.scale(time).add(this.linearVelocity);

    this.linearVelocity = GRAVITY.scale(time).add(this.linearVelocity);

    transform.position = this.linearVelocity.scale(time).add(transform.position);

    transform.rotationDegrees += ((this.rotationalVelocity * 180) / Math.PI) * time;

    this.force = Vec2.zero();
  }

  constructor(
    mass: number = 1,
    restitution: number = 1,
    bodyType: BodyType = "dynamic",
    inertia: number
  ) {
    this.bodyType = bodyType;

    this.invMass = mass === 0 ? 0 : 1 / mass;
    this.invInertia = inertia === 0 ? 0 : 1 / inertia;

    if (this.bodyType === "static") {
      this.invMass = 0;
      this.invInertia = 0;
    }

    this.rotationalVelocity = 0;
    this.linearVelocity = Vec2.zero();
    this.force = Vec2.zero();
    this.restitution = restitution;
  }
}
