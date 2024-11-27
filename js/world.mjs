import {Tile, tileWidth} from "./tile.mjs";
import {Vector} from "./util/vector.mjs";
import {getRandomIntInclusive} from "./util/utils.mjs";

const LITTLE = 0.1;
const MEDIUM = 0.2;
const A_LOT = 0.3;

class World {
  constructor() {
    this.xTilesCount = 0;
    this.yTilesCount = 0;
    this.width = 0;
    this.height = 0;

    this.tiles = [];
    this.tileHovered = null;
    this.mouseDown = false;

    this.numBombs = 0;
    this.amountBombs = LITTLE;
  }

  setWorldDimension(worldWidth, worldHeight) {
    const reset = (this.width !== worldWidth || this.height !== worldHeight);
    this.width = worldWidth;
    this.height = worldHeight;
    this.xTilesCount = worldWidth / tileWidth;
    this.yTilesCount = worldHeight / tileWidth;

    if (reset)
      this.#reSet();
  }

  #reSet() {
    if (this.tiles.length > 0) {
      console.log('clear old game');
      this.tiles = [];
    }
    for (let y = 0; y < this.yTilesCount; y++) {
      for (let x = 0; x < this.xTilesCount; x++) {
        const vec = new Vector(x, y);
        this.tiles.push(new Tile(vec));
      }
    }

    this.numBombs = this.tiles.length * this.amountBombs;
    for (let i = 0; i < this.numBombs; i++) {
      this.#placeRandomBomb();
    }

    for (let i = 0; i < this.tiles.length; i++) {
      const tile = this.tiles[i];
      tile.bombNeighbours = this.#countBombNeighbors(i, false);
    }
  }

  #placeRandomBomb() {
    let foundBombPos = false;
    while (!foundBombPos) {
      const idx = getRandomIntInclusive(0, this.tiles.length - 1);
      const tile = this.tiles[idx];
      if (!tile.bomb) {
        const bombNeighbors = this.#countBombNeighbors(idx, true);
        if (bombNeighbors < 8) {
          tile.bomb = true;
          foundBombPos = true;
        }
      }
    }
  }

  #countBombNeighbors(idx, countWall) {
    const neighborsIdxS = this.#getNeighbors(idx);
    let bombCount = countWall ? (8 - neighborsIdxS.length) : 0; // if outside of world it also counts as bomb neighbor
    for (const neighborsIdx of neighborsIdxS) {
      if (this.tiles[neighborsIdx].bomb)
        bombCount++;
    }
    return bombCount;
  }

  #getNeighbors(idx) {
    const neighborsIdxS = [];

    const isOnLeftBorder = idx % this.xTilesCount === 0;
    const isOnRightBorder = idx % this.xTilesCount === this.xTilesCount - 1;
    const isOnTopBorder = idx < this.xTilesCount;
    const isOnBottomBorder = idx >= this.tiles.length - this.xTilesCount;

    // const neighborsIdxS = [
    //   // idx - this.xTilesCount - 1, idx - this.xTilesCount, idx - this.xTilesCount + 1,
    //   // idx - 1, idx + 1,
    //   // idx + this.xTilesCount - 1, idx + this.xTilesCount, idx + this.xTilesCount + 1
    // ];
    if (!isOnTopBorder) {
      if (!isOnLeftBorder)
        neighborsIdxS.push(idx - this.xTilesCount - 1);
      neighborsIdxS.push(idx - this.xTilesCount);
      if (!isOnRightBorder)
        neighborsIdxS.push(idx - this.xTilesCount + 1);
    }
    if (!isOnLeftBorder)
      neighborsIdxS.push(idx - 1);
    if (!isOnRightBorder)
      neighborsIdxS.push(idx + 1);
    if (!isOnBottomBorder) {
      if (!isOnLeftBorder)
        neighborsIdxS.push(idx + this.xTilesCount - 1);
      neighborsIdxS.push(idx + this.xTilesCount);
      if (!isOnRightBorder)
        neighborsIdxS.push(idx + this.xTilesCount + 1);
    }

    return neighborsIdxS;
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