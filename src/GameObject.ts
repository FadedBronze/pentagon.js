import { Polygon } from "./Polygon";
import { RigidBody2D } from "./RigidBody2D";
import { Transform } from "./Transform";

export class GameObject {
  polygon: Polygon;
  transform: Transform;
  rigidBody: RigidBody2D;

  constructor(polygon: Polygon, transform: Transform, rigidBody: RigidBody2D) {
    this.polygon = polygon;
    this.transform = transform;
    this.rigidBody = rigidBody;
  }

  getTransformedPoints() {
    return this.transform.transformPoints(this.polygon.data);
  }
}
