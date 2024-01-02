import { Transform } from "./Transform";
import { Vec2 } from "./Vec2";

export class Camera {
  transform: Transform;
  static readonly MIN_ZOOM = 0.2;

  get zoom() {
    return this.transform.scale.x;
  }
  set zoom(value) {
    this.transform.scale.x = Math.max(value, Camera.MIN_ZOOM);
    this.transform.scale.y = Math.max(value, Camera.MIN_ZOOM);
  }

  get rotation() {
    return this.transform.rotationDegrees;
  }
  set rotation(value) {
    this.transform.rotationDegrees = value;
  }

  get position() {
    return this.transform.position;
  }
  set position(value) {
    this.transform.position = value;
  }

  constructor(zoom: number, position: Vec2, rotationDegrees: number) {
    if (zoom < 0) {
      throw new Error("Camera zoom must be a positive number");
    }

    this.transform = new Transform(position, new Vec2(zoom, -zoom), rotationDegrees);
  }
}
