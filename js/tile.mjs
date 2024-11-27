import {imgFlag, imgMine} from "./mine.mjs";

const tileWidth = 30;
const tileWidth2 = tileWidth / 2;

class Tile {
  constructor(pos) {
    this.pos = pos;
    this.bomb = false;
    this.bombNeighbours = 0;
    this.clicked = false;
    this.flagged = false;
  }

  equals(other) {
    if (!other || !(other instanceof Tile)) return false;
    return this.pos.equals(other.pos);
  }

  draw(ctx, forceShow, hovered, mouseDown) {
    if (forceShow) {
      if (this.bomb)
        this.#drawBomb(ctx);
      else
        this.#drawTile(ctx);

      if (this.flagged)
        this.#drawFlag(ctx);
      return;
    }

    if (this.clicked) {
      if (this.bomb)
        this.#drawBomb(ctx);
      else
        this.#drawTile(ctx);
      return;
    }

    if (hovered) {
      // this.#drawBackground(ctx, '#c0c0c0');
      this.#drawBackground(ctx, 'rgba(0,0,0,0.3)');
      if (mouseDown) {
        this.#drawBackground(ctx, '#c0c0c0');
        this.#drawBottomRightBorder(ctx, 'white');
        this.#drawTopLeftBorder(ctx, 'darkgray');
      } else {
        this.#drawBottomRightBorder(ctx, 'darkgray');
        this.#drawTopLeftBorder(ctx, 'white');
      }
    } else {
      // this.#drawBackground(ctx, 'lightgray');
      this.#drawBottomRightBorder(ctx, 'darkgray');
      this.#drawTopLeftBorder(ctx, 'white');
    }

    if (this.flagged)
      this.#drawFlag(ctx);
  }

  #drawTile(ctx, forceShow) {
    this.#drawBackground(ctx, 'lightgray', this.clicked || forceShow);
    if (this.bombNeighbours > 0) {
      ctx.font = "20px sans-serif";
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'green';
      ctx.fillText(`${this.bombNeighbours}`, this.pos.x * tileWidth + tileWidth2, this.pos.y * tileWidth + tileWidth2 + 2);
    }
  }

  #drawBomb(ctx) {
    if (this.clicked)
      this.#drawBackground(ctx, 'red');
    else
      this.#drawBackground(ctx, 'lightgray', true);
    ctx.drawImage(imgMine, this.pos.x * tileWidth, this.pos.y * tileWidth, tileWidth, tileWidth);
  }

  #drawFlag(ctx) {
    const padding = 5;
    ctx.drawImage(imgFlag, this.pos.x * tileWidth + padding, this.pos.y * tileWidth + padding, tileWidth - padding * 2, tileWidth - padding * 2);
  }

  #drawBackground(ctx, color, ext) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.rect(this.pos.x * tileWidth + (ext ? -1 : 0), this.pos.y * tileWidth + (ext ? -1 : 0), tileWidth + +(ext ? 2 : 1), tileWidth + +(ext ? 2 : 1));
    ctx.fill();
  }

  #drawTopLeftBorder(ctx, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.pos.x * tileWidth, (this.pos.y + 1) * tileWidth - 1);
    ctx.lineTo(this.pos.x * tileWidth, this.pos.y * tileWidth);
    ctx.lineTo((this.pos.x + 1) * tileWidth - 1, this.pos.y * tileWidth);
    ctx.stroke();
  }

  #drawBottomRightBorder(ctx, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo((this.pos.x + 1) * tileWidth - 1, this.pos.y * tileWidth);
    ctx.lineTo((this.pos.x + 1) * tileWidth - 1, (this.pos.y + 1) * tileWidth - 1);
    ctx.lineTo(this.pos.x * tileWidth, (this.pos.y + 1) * tileWidth - 1);
    ctx.stroke();
  }

}

export {tileWidth, Tile};