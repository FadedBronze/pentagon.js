import { Vec2 } from "./Vec2";

export class AABB {
  readonly maxX: number;
  readonly maxY: number;
  readonly minX: number;
  readonly minY: number;

  constructor(points: Vec2[]) {
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;

    for (let i = 0; i < points.length; i++) {
      maxX = Math.max(points[i].x, maxX);
      maxY = Math.max(points[i].y, maxY);

      minX = Math.min(points[i].x, minX);
      minY = Math.min(points[i].y, minY);
    }

    this.maxX = maxX;
    this.maxY = maxY;
    this.minX = minX;
    this.minY = minY;
  }

  static overlap(a: AABB, b: AABB) {
    return a.maxX > b.minX && a.minX < b.maxX && a.maxY > b.minY && a.minY < b.maxY;
  }
}
