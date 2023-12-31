import { Camera } from "./Camera";
import { RigidBody2D } from "./Physics/RigidBody2D";
import "./style.css";
import { Transform } from "./Transform";
import { Vec2 } from "./Vec2";
import { World } from "./Physics/World";
import { GameObject } from "./Physics/GameObject";
import genGetDeltaMilis from "./utils/getDeltaTimeMilliseconds";
import { Input } from "./Input";
import { Canvas } from "./Canvas";
import { ConvexPolygonCollider } from "./Physics/Colliders/ConvexPolygonCollider";
import { CircleCollider } from "./Physics/Colliders/CircleCollider";

const canvasElement: HTMLCanvasElement = document.getElementById("canvas") as HTMLCanvasElement;

const PPU = 24;
const camera = new Camera(1, new Vec2(0, 0), 0);
const canvas = new Canvas(camera, canvasElement, PPU);
let world = new World();

const platform = new GameObject(
  new ConvexPolygonCollider([
    new Vec2(-10, -10),
    new Vec2(-10, 10),
    new Vec2(10, 10),
    new Vec2(10, -10),
  ]),
  new RigidBody2D(0, 1, "static", 0, 0.6, 0.4, new Transform(new Vec2(-7, -6), new Vec2(9, 0.5), 0))
);

const platform2 = new GameObject(
  new ConvexPolygonCollider([
    new Vec2(-10, -10),
    new Vec2(-10, 10),
    new Vec2(10, 10),
    new Vec2(10, -10),
  ]),
  new RigidBody2D(0, 1, "static", 0, 0.6, 0.4, new Transform(new Vec2(7, -6), new Vec2(9, 0.5), 0))
);

const slope = new GameObject(
  new ConvexPolygonCollider([
    new Vec2(-10, -10),
    new Vec2(-10, 10),
    new Vec2(10, 10),
    new Vec2(10, -10),
  ]),
  new RigidBody2D(0, 1, "static", 0, 0.6, 0.4, new Transform(new Vec2(13, 0), new Vec2(7, 0.5), 90))
);

const slope2 = new GameObject(
  new ConvexPolygonCollider([
    new Vec2(-10, -10),
    new Vec2(-10, 10),
    new Vec2(10, 10),
    new Vec2(10, -10),
  ]),
  new RigidBody2D(
    0,
    1,
    "static",
    0,
    0.6,
    0.4,
    new Transform(new Vec2(-13, 0), new Vec2(7, 0.5), 90)
  )
);

const square = new GameObject(
  new ConvexPolygonCollider([
    new Vec2(-10, -10),
    new Vec2(-10, 10),
    new Vec2(10, 10),
    new Vec2(10, -10),
  ]),

  new RigidBody2D(
    10,
    0.2,
    "static",
    6 / 12,
    0.6,
    0.4,
    new Transform(new Vec2(0, 10), new Vec2(1, 1), 0)
  )
);

function tick() {
  canvas.resize();
  // canvas.renderDebugGrid(2, 2);
  canvas.render(world.objects);
  canvas.renderDebugPoints();
  canvas.renderDebugGrid(1, 1, world.bounds);

  requestAnimationFrame(tick);
}

let lastSpawned = 0;

const input = new Input(canvasElement);

const physicsDeltaMilis = genGetDeltaMilis();

function update() {
  const deltaTime = physicsDeltaMilis() / 1000;

  const mouse = input.getMousePosition();

  const mouseWorldPos = canvas.frameToWorldSpace(mouse);

  lastSpawned += deltaTime;

  if (input.getMouseRightButton() && lastSpawned > 0.1) {
    // world.addObjects(
    //   new GameObject(
    //     new ConvexPolygonCollider([
    //       new Vec2(-10, -10),
    //       new Vec2(-10, 10),
    //       new Vec2(10, 10),
    //       new Vec2(10, -10),
    //     ]),

    //     new RigidBody2D(
    //       10,
    //       0.2,
    //       "dynamic",
    //       6 / 12,
    //       0.6,
    //       0.4,
    //       new Transform(new Vec2(mouseWorldPos.x, mouseWorldPos.y), new Vec2(width, 1), 0)
    //     )
    //   )
    // );

    world.addObjects(
      new GameObject(
        new CircleCollider(1),
        new RigidBody2D(
          10,
          0.6,
          "dynamic",
          6,
          0.6,
          0.4,
          new Transform(new Vec2(mouseWorldPos.x, mouseWorldPos.y), new Vec2(1, 1), 0)
        )
      )
    );

    lastSpawned = 0;
  }

  if (input.getMouseLeftButton() && lastSpawned > 0.1) {
    world.addObjects(
      new GameObject(
        new ConvexPolygonCollider([
          new Vec2(-1.0, 0.0),
          new Vec2(-0.309016994375, 0.951056516295),
          new Vec2(0.809016994375, 0.587785252292),
          new Vec2(0.809016994375, -0.587785252292),
          new Vec2(-0.309016994375, -0.951056516295),
        ]),

        new RigidBody2D(
          100,
          0.2,
          "dynamic",
          12,
          0.6,
          0.4,
          new Transform(new Vec2(mouseWorldPos.x, mouseWorldPos.y), new Vec2(1, 1), 18.2)
        )
      )
    );

    // world.addObjects(
    //   new GameObject(
    //     new CircleCollider(1),
    //     new RigidBody2D(
    //       0,
    //       0.001,
    //       "static",
    //       0,
    //       0.6,
    //       0.4,
    //       new Transform(new Vec2(mouseWorldPos.x, mouseWorldPos.y), new Vec2(1, 1), 0)
    //     )
    //   )
    // );

    lastSpawned = 0;
  }

  if (input.getKey("r")) {
    world = new World();

    world.addObjects(platform, square, platform2, slope, slope2);
  }

  if (input.getKey("w")) {
    square.rigidBody.transform.position.y += 0.05;
  }

  if (input.getKey("a")) {
    square.rigidBody.transform.position.x -= 0.05;
  }

  if (input.getKey("s")) {
    square.rigidBody.transform.position.y -= 0.05;
  }

  if (input.getKey("d")) {
    square.rigidBody.transform.position.x += 0.05;
  }

  camera.zoom += -input.getScrollOffset() / 1000;

  console.time("update");
  world.update(deltaTime, 64);
  console.timeEnd("update");
}

setInterval(update, 1 / 60);

tick();
