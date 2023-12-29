function genGetScreenSize() {
  let windowX = window.innerWidth;
  let windowY = window.innerHeight;

  window.addEventListener("resize", () => {
    windowX = window.innerWidth;
    windowY = window.innerHeight;
  });

  return () => [windowX, windowY] as [number, number];
}

export const getScreenSize = genGetScreenSize();
