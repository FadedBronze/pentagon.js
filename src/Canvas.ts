import { Camera } from "./Camera";
import { GameObject } from "./GameObject";
import { Transform } from "./Transform";
import { Vec2 } from "./Vec2";
import { getScreenSize } from "./utils/getScreenSize";

export class Canvas {
  private camera: Camera;
  private canvasElement: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private ppu: number;
  private transform!: Transform;

  constructor(camera: Camera, canvas: HTMLCanvasElement, ppu: number) {
    this.camera = camera;
    this.canvasElement = canvas;
    this.ctx = canvas.getContext("2d")!;

    //constant or scaled ppu?
    this.ppu = ppu;

    this.resize();
  }

  frameToWorldSpace(v: Vec2) {
    const screenTransform = new Transform(
      new Vec2(this.ctx.canvas.width / 2, this.ctx.canvas.height / 2),
      new Vec2(this.ppu, this.ppu),
      0
    );

    return this.camera.transform.inverseTransformPoints([
      screenTransform.inverseTransformPoints([v])[0],
    ])[0];
  }

  resize() {
    const [width, height] = getScreenSize();
    this.canvasElement.width = width;
    this.canvasElement.height = height;

    this.transform = new Transform(
      new Vec2(this.canvasElement.width / 2, this.canvasElement.height / 2),
      new Vec2(this.ppu, this.ppu),
      0
    );
  }

  render(objects: GameObject[]) {
    this.resize();

    this.transform = new Transform(
      new Vec2(this.ctx.canvas.width / 2, this.ctx.canvas.height / 2),
      new Vec2(this.ppu, this.ppu),
      0
    );

    for (let i = 0; i < objects.length; i++) {
      const polygon = objects[i].polygon;
      const objectTransform = objects[i].transform;

      renderPolygon(
        polygon.data,
        this.ctx,
        [objectTransform, this.camera.transform, this.transform],
        "black",
        false
      );
    }
  }
}

function renderPolygon(
  vertices: Vec2[],
  ctx: CanvasRenderingContext2D,
  transforms: Transform[],
  color: string,
  outline: boolean
) {
  ctx.fillStyle = color;
  ctx.strokeStyle = color;

  let newVertices = vertices;

  for (let i = 0; i < transforms.length; i++) {
    const transform = transforms[i];
    newVertices = transform.transformPoints(newVertices);
  }

  ctx.beginPath();
  ctx.moveTo(newVertices[0].x, newVertices[0].y);

  for (let i = 1; i < newVertices.length; i++) {
    ctx.lineTo(newVertices[i].x, newVertices[i].y);
  }

  ctx.closePath();

  if (outline) {
    ctx.stroke();
  } else {
    ctx.fill();
  }
}
