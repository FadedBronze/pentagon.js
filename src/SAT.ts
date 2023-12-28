import { Vec2 } from "./Vec2";

export default function SAT(r1: Vec2[], r2: Vec2[]): [Vec2, number] {
  let depth = Number.POSITIVE_INFINITY;
  let normal = Vec2.zero();

  let p1 = r1;
  let p2 = r2;

  for (let shape = 0; shape < 2; shape++) {
    if (shape == 1) {
      p1 = r2;
      p2 = r1;
    }

    for (let i = 0; i < p1.length; i++) {
      const edge = p1[(i + 1) % p1.length].subtract(p1[i]);
      const axis = new Vec2(-edge.y, edge.x).normalize();

      let [p1min, p1max] = [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];
      let [p2min, p2max] = [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];

      for (let j = 0; j < p1.length; j++) {
        const v = p1[j];
        const d = v.dot(axis);

        p1min = Math.min(d, p1min);
        p1max = Math.max(d, p1max);
      }

      for (let j = 0; j < p2.length; j++) {
        const v = p2[j];
        const d = v.dot(axis);

        p2min = Math.min(d, p2min);
        p2max = Math.max(d, p2max);
      }

      if (p1max < p2min || p1min > p2max) {
        return [axis, 0];
      }

      let axisDepth = Math.min(p2max - p1min, p1max - p2min);

      if (axisDepth < depth) {
        normal = axis;
        depth = axisDepth;
      }
    }
  }

  return [normal, depth];
}
