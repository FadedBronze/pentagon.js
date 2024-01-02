import { Transform } from "../Transform";
import { Vec2 } from "../Vec2";
import { GameObject } from "./GameObject";

export class BoundingBox {
  readonly maxX: number;
  readonly maxY: number;
  readonly minX: number;
  readonly minY: number;

  constructor(maxX: number, maxY: number, minX: number, minY: number) {
    this.maxX = maxX;
    this.maxY = maxY;
    this.minX = minX;
    this.minY = minY;
  }

  static overlap(a: BoundingBox, b: BoundingBox) {
    return a.maxX > b.minX && a.minX < b.maxX && a.maxY > b.minY && a.minY < b.maxY;
  }

  transform(t: Transform) {
    const [newMax, newMin] = t.transformPoints([
      new Vec2(this.maxX, this.maxY),
      new Vec2(this.minX, this.minY),
    ]);

    return new BoundingBox(
      Math.max(newMax.x, newMin.x),
      Math.max(newMax.y, newMin.y),
      Math.min(newMax.x, newMin.x),
      Math.min(newMax.y, newMin.y)
    );
  }
}

export interface GetBoundingBox {
  bounds: (gameObject: GameObject) => BoundingBox;
}
