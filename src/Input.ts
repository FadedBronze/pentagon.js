import { Vec2 } from "./Vec2";

export class Input {
  private mouseLeftDown: boolean = false;
  private mouseRightDown: boolean = false;
  private mousePosition: Vec2 = Vec2.zero();
  private keys: Set<string> = new Set();
  scrollOffset = 0;

  constructor(canvas: HTMLCanvasElement) {
    canvas.setAttribute("tabindex", "0");

    canvas.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();

      this.mousePosition.x = e.clientX - rect.left;
      this.mousePosition.y = e.clientY - rect.top;
    });

    canvas.addEventListener("mousedown", (e) => {
      if (e.button === 2) this.mouseRightDown = true;
      if (e.button === 0) this.mouseLeftDown = true;
    });

    canvas.addEventListener("mouseup", (e) => {
      if (e.button === 2) this.mouseRightDown = false;
      if (e.button === 0) this.mouseLeftDown = false;
    });

    canvas.addEventListener("keydown", (e) => {
      this.keys.add(e.key);
    });

    canvas.addEventListener("keyup", (e) => {
      this.keys.delete(e.key);
    });

    window.addEventListener("wheel", (e) => {
      this.scrollOffset += e.deltaY;
    });
  }

  getScrollOffset() {
    return this.scrollOffset;
  }

  getMousePosition() {
    return this.mousePosition;
  }

  getMouseLeftButton() {
    return this.mouseLeftDown;
  }

  getMouseRightButton() {
    return this.mouseRightDown;
  }

  getKey(key: string) {
    return this.keys.has(key);
  }
}
