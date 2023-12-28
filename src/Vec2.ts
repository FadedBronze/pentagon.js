const verySmallValue = 0.0005;

export class Vec2 {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  static zero() {
    return new Vec2(0, 0);
  }

  dot(v: Vec2) {
    return this.x * v.x + this.y * v.y;
  }

  almostEquals(a: Vec2) {
    return Math.abs(a.x - this.x) < verySmallValue && Math.abs(a.y - this.y) < verySmallValue;
  }

  distance(v: Vec2) {
    return Math.abs(this.subtract(v).magnitude());
  }

  distanceSq(v: Vec2) {
    const av = this.subtract(v);
    return av.x * av.x + av.y * av.y;
  }

  subtract(v: Vec2) {
    return new Vec2(this.x - v.x, this.y - v.y);
  }

  add(v: Vec2) {
    return new Vec2(this.x + v.x, this.y + v.y);
  }

  scale(s: number) {
    return new Vec2(this.x * s, this.y * s);
  }

  neg() {
    return new Vec2(-this.x, -this.y);
  }

  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  
  cross(other: Vec2): number {
    return this.x * other.y - this.y * other.x;
  }

  normalize() {
    const magnitude = Math.sqrt(this.x * this.x + this.y * this.y);
    if (magnitude === 0) {
      return new Vec2(0, 0);
    }
    return new Vec2(this.x / magnitude, this.y / magnitude);
  }
}
