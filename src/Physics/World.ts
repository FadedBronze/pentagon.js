import { Canvas } from "../Canvas";
import { BoundingBox } from "./AABB";
import { resolveCollisionWithRotationAndFriction } from "./Colliders/Collision";
import { handleCollision } from "./Colliders/Table";
import { GameObject } from "./GameObject";

export class World {
  objects: GameObject[] = [];
  bounds: BoundingBox = new BoundingBox(30, 30, -30, -30);

  resolveCollision(a: GameObject, b: GameObject) {
    const collision = handleCollision(a, b);

    if (collision.depth === 0) {
      return;
    }

    Canvas.debugRenderPoints.push(collision.contactPoint1, collision.contactPoint2);

    if (a.rigidBody.bodyType === "static")
      b.rigidBody.transform.position.plusEquals(collision.normal.neg().scale(collision.depth));
    else if (b.rigidBody.bodyType === "static")
      a.rigidBody.transform.position.plusEquals(collision.normal.neg().scale(collision.depth));
    else {
      a.rigidBody.transform.position.plusEquals(collision.normal.scale(collision.depth / 2));
      b.rigidBody.transform.position.plusEquals(collision.normal.neg().scale(collision.depth / 2));
    }

    resolveCollisionWithRotationAndFriction(collision);
  }

  collisions() {
    for (let i = 0; i < this.objects.length; i++) {
      const a = this.objects[i];

      for (let j = i + 1; j < this.objects.length; j++) {
        const b = this.objects[j];

        if (a.rigidBody.bodyType === "static" && b.rigidBody.bodyType === "static") continue;

        if (!BoundingBox.overlap(a.bounds, b.bounds)) continue;

        this.resolveCollision(a, b);
      }
    }
  }

  narrowPhase(pairs: [GameObject, GameObject][]) {
    for (let i = 0; i < pairs.length; i++) {
      this.resolveCollision(...pairs[i]);
    }
  }

  update(deltaTime: number, subSteps: number) {
    for (let it = 0; it < subSteps; it++) {
      for (let i = 0; i < this.objects.length; i++) {
        const gameObject = this.objects[i];

        gameObject.rigidBody.applyStep(deltaTime / subSteps);
        gameObject.bounds = gameObject.collider.bounds(gameObject);
      }

      this.deleteFarawayObjects();
      this.collisions();
    }
  }

  deleteFarawayObjects() {
    this.objects = this.objects.filter((obj) => BoundingBox.overlap(obj.bounds, this.bounds));
  }

  constructor() {}

  addObjects(...gameObjects: GameObject[]) {
    for (const object of gameObjects) {
      this.objects.push(object);
    }
  }
}
