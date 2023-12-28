import { Transform } from "./Transform";
import { Vec2 } from "./Vec2";

export class Polygon {
  data: Vec2[];

  render(ctx: CanvasRenderingContext2D, transforms: Transform[], color: string, outline: boolean) {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;

    let vertices = this.data;

    for (let i = 0; i < transforms.length; i++) {
      const transform = transforms[i];
      vertices = transform.transformPoints(vertices);
    }

    ctx.beginPath();
    ctx.moveTo(vertices[0].x, vertices[0].y);

    for (let i = 1; i < vertices.length; i++) {
      ctx.lineTo(vertices[i].x, vertices[i].y);
    }

    ctx.closePath();

    if (outline) {
      ctx.stroke();
    } else {
      ctx.fill();
    }
  }

  constructor(data: Vec2[]) {
    for (let i = 0; i < data.length; i++) {
      data[i] = data[i].normalize();
    }

    this.data = data;
  }
}
