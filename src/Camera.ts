import { Transform } from "./Transform";
import { Vec2 } from "./Vec2";
import { GameObject } from "./GameObject";

export class Camera {
  zoom: number;
  rotation: number;
  position: Vec2;
  ppu: number;

  private debugArrows: [Vec2, Vec2][] = [];
  private debugPoints: Vec2[] = [];

  addDebugArrows(...arrows: [Vec2, Vec2][]) {
    this.debugArrows.push(...arrows);
  }

  addDebugPoints(...points: Vec2[]) {
    this.debugPoints.push(...points);
  }

  constructor(zoom: number, position: Vec2, rotationDegrees: number) {
    this.zoom = zoom;
    this.position = position;
    this.rotation = rotationDegrees;

    //constant or scaled ppu
    this.ppu = 20;
  }

  private get transform() {
    if (this.zoom < 0) {
      throw new Error("Camera zoom must be a positive number");
    }
    return new Transform(this.position, new Vec2(this.zoom, -this.zoom), this.rotation);
  }

  screenToCameraSpace(v: Vec2, ctx: CanvasRenderingContext2D) {
    const screenTransform = new Transform(
      new Vec2(ctx.canvas.width / 2, ctx.canvas.height / 2),
      new Vec2(this.ppu, this.ppu),
      0
    );

    return this.transform.inverseTransformPoints([
      screenTransform.inverseTransformPoints([v])[0],
    ])[0];
  }

  render(ctx: CanvasRenderingContext2D, objects: GameObject[]) {
    const screenTransform = new Transform(
      new Vec2(ctx.canvas.width / 2, ctx.canvas.height / 2),
      new Vec2(this.ppu, this.ppu),
      0
    );

    const cameraTransform = this.transform;

    for (let i = 0; i < objects.length; i++) {
      const polygon = objects[i].polygon;
      const objectTransform = objects[i].transform;

      polygon.render(ctx, [objectTransform, cameraTransform, screenTransform], "black", false);
    }
  }

  renderDebugPoints(ctx: CanvasRenderingContext2D) {
    const screenTransform = new Transform(
      new Vec2(ctx.canvas.width / 2, ctx.canvas.height / 2),
      new Vec2(this.ppu, this.ppu),
      0
    );

    const transformedPoints = screenTransform.transformPoints(
      this.transform.transformPoints(this.debugPoints)
    );

    for (let i = 0; i < transformedPoints.length; i++) {
      const p = transformedPoints[i];

      ctx.fillStyle = "red";

      ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
    }

    this.debugPoints = [];
  }

  renderDebugArrows(ctx: CanvasRenderingContext2D) {
    const screenTransform = new Transform(
      new Vec2(ctx.canvas.width / 2, ctx.canvas.height / 2),
      new Vec2(this.ppu, this.ppu),
      0
    );

    for (let i = 0; i < this.debugArrows.length; i++) {
      const [pa, pb] = this.debugArrows[i];

      const [a, b] = screenTransform.transformPoints(this.transform.transformPoints([pa, pb]));

      ctx.strokeStyle = "yellow";

      ctx.lineWidth = 1;

      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }

    this.debugArrows = [];
  }
}
