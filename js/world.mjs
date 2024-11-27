import {Tile, tileWidth} from "./tile.mjs";
import {Vector} from "./util/vector.mjs";

class World {
  constructor() {
    this.xTilesCount = 0;
    this.yTilesCount = 0;
    this.width = 0;
    this.height = 0;

    this.tiles = [];
    this.tileHovered = null;
    this.mouseDown = false;
  }

  setWorldDimension(worldWidth, worldHeight) {
    const reset = (this.width !== worldWidth || this.height !== worldHeight);
    this.width = worldWidth;
    this.height = worldHeight;
    this.xTilesCount = worldWidth / tileWidth;
    this.yTilesCount = worldHeight / tileWidth;

    if (reset) {
      // TODO reset
      console.log('reset');
      this.reset();
    }
  }

  reset() {
    if (!this.tiles.length > 0) {
      console.log('clear old game');
      this.tiles = [];
    }
    for (let y = 0; y < this.yTilesCount; y++) {
      for (let x = 0; x < this.xTilesCount; x++) {
        const vec = new Vector(x, y);
        this.tiles.push(new Tile(vec));
      }
    }
  }

  update(mousePos, mouseDown) {
    this.mouseDown = mouseDown;

    this.tileHovered = null;
    if (mousePos.x < 0 || mousePos.y < 0)
      return;

    const tileIdx = Math.floor(mousePos.y / tileWidth) * this.xTilesCount + Math.floor(mousePos.x / tileWidth);
    if (tileIdx >= 0 && tileIdx < this.tiles.length)
      this.tileHovered = this.tiles[tileIdx];
  }

  clickTile() {
    const tile = this.tileHovered;
    if (tile) {
      tile.clicked = true;
      if (tile.bomb)
        console.log('FAIL'); // TODO
    }
  }

  draw(ctx) {
    // ctx.strokeStyle = 'red';
    // ctx.lineWidth = 3;
    // ctx.beginPath();
    // ctx.rect(0, 0, this.width, this.height);
    // ctx.stroke();

    const forceShow = false;
    for (const tile of this.tiles) {
      tile.draw(ctx, forceShow, tile.equals(this.tileHovered), this.mouseDown);
    }
  }
}

export default World;