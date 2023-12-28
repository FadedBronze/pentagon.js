import { Vec2 } from "./Vec2";

export class Transform {
  position: Vec2;
  scale: Vec2;
  rotationDegrees: number;

  constructor(position: Vec2, scale: Vec2, rotation: number) {
    this.position = position;
    this.scale = scale;
    this.rotationDegrees = rotation;
  }

  inverseTransformPoints(data: Vec2[]) {
    const result = [];

    for (let i = 0; i < data.length; i++) {
      let x = data[i].x - this.position.x;
      let y = data[i].y - this.position.y;

      const radians = -(this.rotationDegrees * Math.PI) / 180;

      const cx = x * Math.cos(radians) - y * Math.sin(radians);
      const cy = x * Math.sin(radians) + y * Math.cos(radians);

      x = cx / this.scale.x;
      y = cy / this.scale.y;

      result.push(new Vec2(x, y));
    }

    return result;
  }

  transformPoints(data: Vec2[]) {
    const result = [];

    for (let i = 0; i < data.length; i++) {
      let x = data[i].x;
      let y = data[i].y;

      x *= this.scale.x;
      y *= this.scale.y;

      const cx = x;
      const cy = y;

      const radians = (this.rotationDegrees * Math.PI) / 180;

      x = cx * Math.cos(radians) - cy * Math.sin(radians);
      y = cx * Math.sin(radians) + cy * Math.cos(radians);

      x += this.position.x;
      y += this.position.y;

      result.push(new Vec2(x, y));
    }

    return result;
  }
}
