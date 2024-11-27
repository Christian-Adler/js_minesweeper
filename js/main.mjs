import {tileWidth} from "./tile.mjs";
import World from "./world.mjs";
import {Vector} from "./util/vector.mjs";

const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext('2d');

const world = new World();

let windowWidth = canvas.width;
let windowHeight = canvas.height;
let worldWidth = canvas.width;
let worldHeight = canvas.height;
let worldWidth2 = worldWidth / 2;
let worldHeight2 = worldHeight / 2;
let canvasBoundingClientRect = canvas.getBoundingClientRect();
let worldUpdated = true;

const updateWorldSettings = () => {
  if (windowHeight !== window.innerHeight || windowWidth !== window.innerWidth) {
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;
    const worldWidthWouldBe = windowWidth - windowWidth % tileWidth;
    const worldHeightWouldBe = windowHeight - windowHeight % tileWidth;
    if (worldHeightWouldBe !== worldHeight || worldWidthWouldBe !== worldWidth) {
      worldWidth = worldWidthWouldBe;
      worldHeight = worldHeightWouldBe;
      worldWidth2 = worldWidth / 2;
      worldHeight2 = worldHeight / 2;
      canvas.width = worldWidth;
      canvas.height = worldHeight;
      worldUpdated = true;
      world.setWorldDimension(worldWidth, worldHeight);
    }
    canvasBoundingClientRect = canvas.getBoundingClientRect();
  }
};

updateWorldSettings();
document.addEventListener("load", () => updateWorldSettings());

let canvasMousePos = new Vector(-1, -1);
let mouseDown = false;

const calcCanvasMousePos = (evt) => {
  const x = evt.clientX - canvasBoundingClientRect.left;
  const y = evt.clientY - canvasBoundingClientRect.top;
  // console.log("Coordinate x: " + x,      "Coordinate y: " + y);
  canvasMousePos.set(x, y);
}

canvas.addEventListener("mousemove", (e) => calcCanvasMousePos(e));
canvas.addEventListener("mouseout", () => {
  canvasMousePos.set(-1, -1);
  mouseDown = false;
});
canvas.addEventListener("mousedown", (evt) => {
  if (evt.button === 2)
    return;
  mouseDown = true;
});
canvas.addEventListener("mouseup", () => {
  if (!mouseDown)
    return;
  mouseDown = false;
  world.clickTile();
});
canvas.addEventListener("contextmenu", (evt) => {
  evt.preventDefault();
  mouseDown = false;
  world.flagTile();
  return false;
});

const update = () => {

  if (worldUpdated)
    worldUpdated = false;

  world.update(canvasMousePos, mouseDown);

  ctx.clearRect(0, 0, worldWidth, worldHeight);

  ctx.save();
  ctx.translate(0.5, 0.5);

  world.draw(ctx);

  ctx.restore();

  updateWorldSettings();

  requestAnimationFrame(update);
}

update();