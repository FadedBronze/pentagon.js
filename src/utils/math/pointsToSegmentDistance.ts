import { Vec2 } from "../../Vec2";

export function pointToSegmentDistance(p: Vec2, a: Vec2, b: Vec2): [Vec2, number] {
  const ab = b.subtract(a);
  const ap = p.subtract(a);

  const abMagSq = ab.magnitude() ** 2;

  const proj = ab.dot(ap);

  const d = proj / abMagSq;

  let cp = Vec2.zero();

  if (d >= 1) {
    cp = b;
  } else if (d <= 0) {
    cp = a;
  } else {
    cp = ab.scale(d).plus(a);
  }

  return [cp, cp.distanceSq(p)];
}
