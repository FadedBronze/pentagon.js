import { renderDebugPoints } from "../main";
import { AABB } from "./AABB";
import { CircleCollider } from "./Colliders/CircleCollider";
import { resolveCollisionWithRotationAndFriction } from "./Colliders/Collision";
import { handleCollision } from "./Colliders/Table";
import { GameObject } from "./GameObject";

export class World {
  objects: GameObject[] = [];

  broadPhase() {
    const pairs = [];

    for (let i = 0; i < this.objects.length; i++) {
      const a = this.objects[i];

      for (let j = i + 1; j < this.objects.length; j++) {
        const b = this.objects[j];

        if (a.rigidBody.bodyType === "static" && b.rigidBody.bodyType === "static") continue;

        if (!AABB.overlap(a.collider.getAABB(a), b.collider.getAABB(b))) continue;

        pairs.push([a, b]);
      }
    }

    return pairs as [GameObject, GameObject][];
  }

  max() {
    let maxValue = 0;
    return (value: number) => {
      maxValue = Math.max(maxValue, value);
      return maxValue;
    };
  }

  maxValue = this.max();

  narrowPhase(pairs: [GameObject, GameObject][]) {
    for (let i = 0; i < pairs.length; i++) {
      const [a, b] = pairs[i];

      const collision = handleCollision(a, b);

      if (collision.depth === 0) {
        continue;
      }

      if (a.collider instanceof CircleCollider) {
        // console.log(this.maxValue(a.rigidBody.rotationalVelocity));
      }

      renderDebugPoints.push(collision.contactPoint1, collision.contactPoint2);

      if (a.rigidBody.bodyType === "static")
        b.rigidBody.transform.position.plusEquals(collision.normal.neg().scale(collision.depth));
      else if (b.rigidBody.bodyType === "static")
        a.rigidBody.transform.position.plusEquals(collision.normal.neg().scale(collision.depth));
      else {
        a.rigidBody.transform.position.plusEquals(collision.normal.scale(collision.depth / 2));
        b.rigidBody.transform.position.plusEquals(
          collision.normal.neg().scale(collision.depth / 2)
        );
      }

      resolveCollisionWithRotationAndFriction(collision);
    }
  }

  update(deltaTime: number) {
    const its = 32;

    for (let i = 0; i < its; i++) {
      for (let i = 0; i < this.objects.length; i++) {
        const gameObject = this.objects[i];

        gameObject.rigidBody.applyStep(deltaTime / its);
      }

      const pairs = this.broadPhase();
      this.narrowPhase(pairs);
    }
  }

  constructor() {}

  addObjects(...gameObjects: GameObject[]) {
    this.objects.push(...gameObjects);
    return gameObjects;
  }
}
