import { AABB } from "./AABB";
import { Collision, resolveCollisionWithRotation } from "./Collision";
import { GameObject } from "./GameObject";
import SAT from "./SAT";

export class World {
  objects: GameObject[] = [];

  broadPhase() {
    const pairs = [];

    for (let i = 0; i < this.objects.length; i++) {
      const a = this.objects[i];

      for (let j = i + 1; j < this.objects.length; j++) {
        const b = this.objects[j];

        const p1 = a.getTransformedPoints();
        const p2 = b.getTransformedPoints();

        const p1aabb = new AABB(p1);
        const p2aabb = new AABB(p2);

        if (AABB.overlap(p1aabb, p2aabb)) {
          pairs.push([a, b]);
        }
      }
    }

    return pairs as [GameObject, GameObject][];
  }

  narrowPhase(pairs: [GameObject, GameObject][]) {
    for (let i = 0; i < pairs.length; i++) {
      const [a, b] = pairs[i];

      const p1 = a.getTransformedPoints();
      const p2 = b.getTransformedPoints();

      const [n, depth] = SAT(p1, p2);

      if (depth > 0) {
        const dir = a.transform.position.subtract(b.transform.position);

        const normal = dir.dot(n) > 0 ? n : n.neg();

        if (a.rigidBody.bodyType === "static" && b.rigidBody.bodyType === "static") {
          continue;
        }

        const contact = new Collision(a, b, depth, normal);

        if (a.rigidBody.bodyType === "static") {
          b.transform.position = b.transform.position.add(normal.neg().scale(depth));
        } else if (b.rigidBody.bodyType === "static") {
          a.transform.position = a.transform.position.add(normal.neg().scale(depth));
        } else {
          a.transform.position = a.transform.position.add(normal.scale(depth / 2));
          b.transform.position = b.transform.position.add(normal.neg().scale(depth / 2));
        }

        resolveCollisionWithRotation(contact);
      }
    }
  }

  update(deltaTime: number) {
    const its = 16;

    for (let i = 0; i < its; i++) {
      for (let i = 0; i < this.objects.length; i++) {
        const gameObject = this.objects[i];

        gameObject.rigidBody.applyStep(gameObject.transform, deltaTime / its);
      }

      const pairs = this.broadPhase();
      this.narrowPhase(pairs);
    }
  }

  constructor() {}

  addObjects(...gameObjects: GameObject[]) {
    this.objects.push(...gameObjects);
  }
}
