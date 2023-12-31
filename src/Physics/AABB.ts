import { GameObject } from "./GameObject";

export class AABB {
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

  static overlap(a: AABB, b: AABB) {
    return a.maxX > b.minX && a.minX < b.maxX && a.maxY > b.minY && a.minY < b.maxY;
  }
}

export interface GetAABB {
  getAABB: (gameObject: GameObject) => AABB;
}
