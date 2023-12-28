import { Camera } from "./Camera";
import { Polygon } from "./Polygon";
import { RigidBody2D } from "./RigidBody2D";
import "./style.css";
import { Transform } from "./Transform";
import { Vec2 } from "./Vec2";
import { GameObject } from "./GameObject";
import { World } from "./World";

const canvas: HTMLCanvasElement = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

function genGetMouse() {
  const mousePos = Vec2.zero();
  let mouseLeftDown = false;
  let mouseRightDown = false;

  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();

    mousePos.x = e.clientX - rect.left;
    mousePos.y = e.clientY - rect.top;
  });

  canvas.addEventListener("mousedown", (e) => {
    if (e.button === 2) mouseRightDown = true;
    if (e.button === 0) mouseLeftDown = true;
  });

  canvas.addEventListener("mouseup", (e) => {
    if (e.button === 2) mouseRightDown = false;
    if (e.button === 0) mouseLeftDown = false;
  });

  return () => [mouseRightDown, mouseLeftDown, mousePos] as [boolean, boolean, Vec2];
}

function genGetScreenSize() {
  let windowX = window.innerWidth;
  let windowY = window.innerHeight;

  window.addEventListener("resize", () => {
    windowX = window.innerWidth;
    windowY = window.innerHeight;
  });

  return () => [windowX, windowY] as [number, number];
}

function genGetDeltaMilis() {
  let lastUpdate = Date.now();

  return () => {
    const now = Date.now();
    const dt = now - lastUpdate;
    lastUpdate = now;

    return dt;
  };
}

export const getMousePos = genGetMouse();
export const getScreenSize = genGetScreenSize();
export const getDeltaMilis = genGetDeltaMilis();

export const camera = new Camera(1, new Vec2(0, 0), 0);
const world = new World(camera);

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

function tick() {
  const [width, height] = getScreenSize();
  canvas.width = width;
  canvas.height = height;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  world.render(ctx);
  requestAnimationFrame(tick);
}

function update() {
  world.update(getDeltaMilis() / 1000, ctx);
}

setInterval(update, 1 / 60);
tick();
