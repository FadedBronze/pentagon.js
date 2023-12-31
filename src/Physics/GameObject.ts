import { Collider } from "./Colliders/Table";
import { RigidBody2D } from "./RigidBody2D";

export class GameObject {
  collider: Collider;
  rigidBody: RigidBody2D;

  constructor(collider: Collider, rigidBody: RigidBody2D) {
    this.rigidBody = rigidBody;
    this.collider = collider;
  }
}
