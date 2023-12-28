import { AABB } from "./AABB";
import { Camera } from "./Camera";
import { Collision, resolveCollisionBasic, resolveCollisionWithRotation } from "./Collision";
import { GameObject } from "./GameObject";
import { Polygon } from "./Polygon";
import { RigidBody2D } from "./RigidBody2D";
import SAT from "./SAT";
import { Transform } from "./Transform";
import { Vec2 } from "./Vec2";
import { getMousePos } from "./main";

export class World {
  objects: GameObject[] = [];
  camera: Camera;
  lastSpawned: number = 0;

  physics(deltaTime: number, iterations: number) {
    // console.time("step");

    for (let it = 0; it < iterations; it++) {
      for (let i = 0; i < this.objects.length; i++) {
        const obj = this.objects[i];

        obj.rigidBody.applyStep(obj.transform, deltaTime / iterations);
      }

      for (let i = 0; i < this.objects.length; i++) {
        const a = this.objects[i];

        for (let j = i + 1; j < this.objects.length; j++) {
          const b = this.objects[j];

          const p1 = a.getTransformedPoints();
          const p2 = b.getTransformedPoints();

          const p1aabb = new AABB(p1);
          const p2aabb = new AABB(p2);

          if (!AABB.compare(p1aabb, p2aabb)) {
            continue;
          }

          const [n, depth] = SAT(p1, p2);

          if (depth > 0) {
            const dir = a.transform.position.subtract(b.transform.position);

            const normal = dir.dot(n) > 0 ? n : n.neg();

            if (a.rigidBody.bodyType === "static" && b.rigidBody.bodyType === "static") {
              continue;
            }

            const contact = new Collision(a, b, depth, normal);

            // this.camera.addDebugPoints(contact.contactPoint1);

            // if (contact.contactCount > 1) {
            //   this.camera.addDebugPoints(contact.contactPoint2);
            // }

            if (a.rigidBody.bodyType === "static") {
              b.transform.position = b.transform.position.add(normal.neg().scale(depth));
            } else if (b.rigidBody.bodyType === "static") {
              a.transform.position = a.transform.position.add(normal.neg().scale(depth));
            } else {
              a.transform.position = a.transform.position.add(normal.scale(depth / 2));
              b.transform.position = b.transform.position.add(normal.neg().scale(depth / 2));
            }

            // this.camera.addDebugArrows([
            //   b.transform.position,
            //   b.transform.position.add(normal.neg().scale(1)),
            // ]);

            // this.camera.addDebugArrows([
            //   a.transform.position,
            //   a.transform.position.add(normal.scale(2)),
            // ]);

            this.camera.addDebugPoints(...p1, ...p2);

            resolveCollisionWithRotation(contact);
          }
        }
      }
    }

    // console.log(objects.length);
    // console.timeEnd("step");
  }

  render(ctx: CanvasRenderingContext2D) {
    this.camera.render(ctx, this.objects);
    this.camera.renderDebugPoints(ctx);
    this.camera.renderDebugArrows(ctx);
  }

  update(deltaTime: number, ctx: CanvasRenderingContext2D) {
    const [mouseRightDown, mouseLeftDown, mousePos] = getMousePos();

    this.lastSpawned += deltaTime;

    if (mouseRightDown && this.lastSpawned > 0.1) {
      const mouseCamPos = this.camera.screenToCameraSpace(mousePos, ctx);

      const width = Math.random() + 1;

      this.addObjects(
        new GameObject(
          new Polygon([new Vec2(-10, -10), new Vec2(-10, 10), new Vec2(10, 10), new Vec2(10, -10)]),
          new Transform(new Vec2(mouseCamPos.x, mouseCamPos.y), new Vec2(width, 1), 0),
          new RigidBody2D(0.1, 0.2, "dynamic", 0.01)
        )
      );

      this.lastSpawned = 0;
    }

    if (mouseLeftDown && this.lastSpawned > 0.1) {
      const mouseCamPos = this.camera.screenToCameraSpace(mousePos, ctx);

      this.addObjects(
        new GameObject(
          new Polygon([
            new Vec2(-1.0, 0.0),
            new Vec2(-0.309016994375, 0.951056516295),
            new Vec2(0.809016994375, 0.587785252292),
            new Vec2(0.809016994375, -0.587785252292),
            new Vec2(-0.309016994375, -0.951056516295),
          ]),
          new Transform(new Vec2(mouseCamPos.x, mouseCamPos.y), new Vec2(1, 1), 18.2),
          new RigidBody2D(0.1, 0.2, "dynamic", 0.01)
        )
      );

      this.lastSpawned = 0;
    }

    this.physics(deltaTime, 16);
  }

  constructor(camera: Camera) {
    this.camera = camera;
  }

  addObjects(...gameObjects: GameObject[]) {
    this.objects.push(...gameObjects);
  }
}
