import { Camera } from "./Camera";
import { BoundingBox } from "./Physics/AABB";
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
  public static debugRenderPoints: Vec2[] = [];

  constructor(camera: Camera, canvas: HTMLCanvasElement, ppu: number) {
    this.camera = camera;
    this.canvasElement = canvas;
    this.ctx = canvas.getContext("2d")!;

    //constant or scaled ppu?
    this.ppu = ppu;

    this.resize();
  }

  frameToWorldSpace(v: Vec2) {
    return this.camera.transform.inverseTransformPoints([
      this.transform.inverseTransformPoints([v])[0],
    ])[0];
  }

  resize() {
    const [width, height] = getScreenSize();
    this.canvasElement.width = width;
    this.canvasElement.height = height;

    this.transform = new Transform(
      new Vec2(this.canvasElement.width / 2, this.canvasElement.height / 2),
      new Vec2(this.ppu, -this.ppu),
      0
    );
  }

  render(objects: GameObject[]) {
    this.resize();

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

  renderDebugPoints() {
    const transformedPoints = this.transform.transformPoints(
      this.camera.transform.transformPoints(Canvas.debugRenderPoints)
    );

    for (let i = 0; i < transformedPoints.length; i++) {
      const pos = transformedPoints[i];
      this.ctx.fillStyle = "yellow";
      this.ctx.fillRect(pos.x - 8, pos.y - 8, 16, 16);
    }

    Canvas.debugRenderPoints = [];
  }

  renderDebugGrid(cellSizeX: number, cellSizeY: number, worldAABB: BoundingBox) {
    console.time("grid");

    this.ctx.imageSmoothingEnabled = false;
    this.ctx.translate(0.5, 0.5);

    const cellVector = new Vec2(cellSizeX, cellSizeY);

    const transformedCellVector = this.camera.transform.transformPoints([cellVector])[0];

    let cellX = Math.floor(transformedCellVector.x * this.ppu);
    let cellY = Math.floor(transformedCellVector.y * this.ppu);

    this.ctx.strokeStyle = "rgba(255, 0, 0, 1)";

    this.ctx.lineWidth = 4;

    this.ctx.beginPath();

    const aabb = worldAABB.transform(this.camera.transform).transform(this.transform);

    for (
      let i = Math.floor(this.canvasElement.width / 2);
      i < aabb.maxX && i < this.canvasElement.width;
      i += cellX
    ) {
      this.ctx.moveTo(i, Math.max(0, aabb.minY));
      this.ctx.lineTo(i, Math.min(this.canvasElement.height, aabb.maxY));
    }

    for (let i = Math.floor(this.canvasElement.width / 2); i >= aabb.minX && i >= 0; i -= cellX) {
      this.ctx.moveTo(i, Math.max(0, aabb.minY));
      this.ctx.lineTo(i, Math.min(this.canvasElement.height, aabb.maxY));
    }

    let its = 400;

    for (
      let i = Math.floor(this.canvasElement.height / 2);
      i < aabb.maxY && i < this.canvasElement.height;
      i += cellY
    ) {
      this.ctx.moveTo(Math.max(0, aabb.minX), i);
      this.ctx.lineTo(Math.min(this.canvasElement.width, aabb.maxX), i);

      its--;

      if (its <= 0) {
        console.log(i);
        break;
      }
    }

    for (let i = Math.floor(this.canvasElement.height / 2); i >= aabb.minY && i >= 0; i -= cellY) {
      its--;

      if (its <= 0) {
        break;
      }
      this.ctx.moveTo(Math.max(0, aabb.minX), i);
      this.ctx.lineTo(Math.min(this.canvasElement.width, aabb.maxX), i);
    }

    this.ctx.stroke();

    this.ctx.translate(0, 0);
    this.ctx.imageSmoothingEnabled = true;

    console.timeEnd("grid");
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
