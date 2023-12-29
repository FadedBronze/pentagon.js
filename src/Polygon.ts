import { Vec2 } from "./Vec2";

export class Polygon {
  data: Vec2[];

  constructor(data: Vec2[]) {
    for (let i = 0; i < data.length; i++) {
      data[i] = data[i].normalize();
    }

    this.data = data;
  }
}
