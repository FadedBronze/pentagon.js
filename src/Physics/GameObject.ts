import { BoundingBox } from "./AABB";
import { Collider } from "./Colliders/Table";
import { RigidBody2D } from "./RigidBody2D";

export class GameObject {
  collider: Collider;
  rigidBody: RigidBody2D;
  bounds: BoundingBox;

  constructor(collider: Collider, rigidBody: RigidBody2D) {
    this.rigidBody = rigidBody;
    this.collider = collider;
    this.bounds = this.collider.bounds(this);
  }
}
