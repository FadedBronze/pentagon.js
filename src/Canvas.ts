import { Camera } from "./Camera";
import { CircleCollider } from "./Physics/Colliders/CircleCollider";
import { ConvexPolygonCollider } from "./Physics/Colliders/ConvexPolygonCollider";
import { GameObject } from "./Physics/GameObject";
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
      const object = objects[i];
      const objectTransform = objects[i].rigidBody.transform;

      if (object.collider instanceof CircleCollider) {
        renderCircle(
          object.collider.radius,
          this.ctx,
          [objectTransform, this.camera.transform, this.transform],
          "black",
          false
        );
      } else if (object.collider instanceof ConvexPolygonCollider) {
        renderPolygon(
          object.collider.vertices,
          this.ctx,
          [objectTransform, this.camera.transform, this.transform],
          "black",
          false
        );
      }
    }
  }

  renderDebugPoints(points: Vec2[]) {
    const transformedPoints = this.transform.transformPoints(
      this.camera.transform.transformPoints(points)
    );

    for (let i = 0; i < transformedPoints.length; i++) {
      const pos = transformedPoints[i];
      this.ctx.fillStyle = "yellow";
      this.ctx.fillRect(pos.x - 8, pos.y - 8, 16, 16);
    }
  }
}

function renderCircle(
  radius: number,
  ctx: CanvasRenderingContext2D,
  transforms: Transform[],
  color: string,
  outline: boolean
) {
  ctx.fillStyle = color;
  ctx.strokeStyle = color;

  let radiusAsVector = [new Vec2(0, 0), new Vec2(radius, 0)];

  for (let i = 0; i < transforms.length; i++) {
    const transform = transforms[i];
    radiusAsVector = transform.transformPoints(radiusAsVector);
  }

  const center = radiusAsVector[0];
  const edge = radiusAsVector[1];

  const transformedRadius = edge.subtract(center).magnitude();

  ctx.beginPath();
  ctx.arc(center.x, center.y, transformedRadius, 0, 2 * Math.PI);

  if (outline) {
    ctx.stroke();
  } else {
    ctx.fill();
  }

  ctx.strokeStyle = "rgb(255, 255, 255)";
  ctx.lineWidth = 10;
  ctx.moveTo(center.x, center.y);
  ctx.lineTo(edge.x, edge.y);
  ctx.stroke();
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
