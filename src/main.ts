import { Camera } from "./Camera";
import { Polygon } from "./Polygon";
import { RigidBody2D } from "./RigidBody2D";
import "./style.css";
import { Transform } from "./Transform";
import { Vec2 } from "./Vec2";
import { World } from "./World";
import { GameObject } from "./GameObject";
import { getDeltaMilis } from "./utils/getDeltaTimeMilliseconds";
import { Input } from "./Input";
import { Canvas } from "./Canvas";

const canvasElement: HTMLCanvasElement = document.getElementById("canvas") as HTMLCanvasElement;

const camera = new Camera(1, new Vec2(0, 0), 0);
const canvas = new Canvas(camera, canvasElement, 24);
const world = new World();

const platform = new GameObject(
  new Polygon([new Vec2(-10, -10), new Vec2(-10, 10), new Vec2(10, 10), new Vec2(10, -10)]),
  new Transform(new Vec2(0, -6), new Vec2(20, 0.5), 0),
  new RigidBody2D(0, 1, "static", 0)
);

const slope = new GameObject(
  new Polygon([new Vec2(-10, -10), new Vec2(-10, 10), new Vec2(10, 10), new Vec2(10, -10)]),
  new Transform(new Vec2(7, 0), new Vec2(8, 0.5), 90),
  new RigidBody2D(0, 1, "static", 0)
);

const slope2 = new GameObject(
  new Polygon([new Vec2(-10, -10), new Vec2(-10, 10), new Vec2(10, 10), new Vec2(10, -10)]),
  new Transform(new Vec2(-7, 0), new Vec2(8, 0.5), -30),
  new RigidBody2D(0, 1, "static", 0)
);

world.addObjects(platform, slope, slope2);

// function main() {}

function tick() {
  requestAnimationFrame(tick);
}

let lastSpawned = 0;

const input = new Input(canvasElement);

function update() {
  const deltaTime = getDeltaMilis() / 1000;

  const mouseCamPos = canvas.frameToWorldSpace(input.getMousePosition());

  lastSpawned += deltaTime;

  if (input.getMouseRightButton() && lastSpawned > 0.1) {
    const width = Math.random() + 1;

    world.addObjects(
      new GameObject(
        new Polygon([new Vec2(-10, -10), new Vec2(-10, 10), new Vec2(10, 10), new Vec2(10, -10)]),
        new Transform(new Vec2(mouseCamPos.x, mouseCamPos.y), new Vec2(width, 1), 0),
        new RigidBody2D(10, 0.2, "dynamic", 6 / 12)
      )
    );

    lastSpawned = 0;
  }

  if (input.getMouseLeftButton() && lastSpawned > 0.1) {
    world.addObjects(
      new GameObject(
        new Polygon([
          new Vec2(-1.0, 0.0),
          new Vec2(-0.309016994375, 0.951056516295),
          new Vec2(0.809016994375, 0.587785252292),
          new Vec2(0.809016994375, -0.587785252292),
          new Vec2(-0.309016994375, -0.951056516295),
        ]),
        new Transform(new Vec2(mouseCamPos.x, mouseCamPos.y), new Vec2(1, 1), 18.2),
        new RigidBody2D(10, 0.2, "dynamic", 6 / 12)
      )
    );

    lastSpawned = 0;
  }

  if (input.getKey("r")) {
    world.objects = [];
    world.addObjects(platform, slope, slope2);
  }

  if (input.getKey("w")) {
    camera.position.y += 0.05;
  }

  if (input.getKey("a")) {
    camera.position.x += 0.05;
  }

  if (input.getKey("s")) {
    camera.position.y -= 0.05;
  }

  if (input.getKey("d")) {
    camera.position.x -= 0.05;
  }

  camera.zoom = Math.max((input.scrollOffset / 1000) ** 3, 0.1);

  world.update(deltaTime);
  canvas.render(world.objects);
}

setInterval(update, 1 / 60);
tick();
