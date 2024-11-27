const tileWidth = 30;
const tileWidth2 = tileWidth / 2;

class Tile {
  constructor(pos) {
    this.pos = pos;
    this.bomb = false;
    this.bombNeighbours = 0;
    this.clicked = false;
  }

  equals(other) {
    if (!other || !(other instanceof Tile)) return false;
    return this.pos.equals(other.pos);
  }

  draw(ctx, forceShow, hovered, mouseDown) {
    if (this.clicked) {
      if (this.bomb) {
        this.drawBackground(ctx, 'red');
        this.#drawBomb(ctx);
      } else {
        this.drawBackground(ctx, 'lightgray', true);
        if (this.bombNeighbours > 0) {
          ctx.font = "20px sans-serif";
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = 'green';
          ctx.fillText(`${this.bombNeighbours}`, this.pos.x * tileWidth + tileWidth2, this.pos.y * tileWidth + tileWidth2 + 2);
        }
      }
    } else {
      if (hovered) {
        this.drawBackground(ctx, '#c0c0c0');
        if (mouseDown) {
          this.drawBottomRightBorder(ctx, 'white');
          this.drawTopLeftBorder(ctx, 'darkgray');
        } else {
          this.drawBottomRightBorder(ctx, 'darkgray');
          this.drawTopLeftBorder(ctx, 'white');
        }
      } else {
        this.drawBackground(ctx, 'lightgray');
        this.drawBottomRightBorder(ctx, 'darkgray');
        this.drawTopLeftBorder(ctx, 'white');
      }
    }
  }

  #drawBomb(ctx) {
    ctx.fillStyle = 'black';
    ctx.strokeStyle = 'black';

    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(this.pos.x * tileWidth + tileWidth2, this.pos.y * tileWidth + 3);
    ctx.lineTo(this.pos.x * tileWidth + tileWidth2, this.pos.y * tileWidth + tileWidth - 3);
    ctx.moveTo(this.pos.x * tileWidth + 3, this.pos.y * tileWidth + tileWidth2);
    ctx.lineTo(this.pos.x * tileWidth + tileWidth - 3, this.pos.y * tileWidth + tileWidth2);
    ctx.moveTo(this.pos.x * tileWidth + 6, this.pos.y * tileWidth + 6);
    ctx.lineTo(this.pos.x * tileWidth + tileWidth - 6, this.pos.y * tileWidth + tileWidth - 6);
    ctx.moveTo(this.pos.x * tileWidth + 6, this.pos.y * tileWidth + tileWidth - 6);
    ctx.lineTo(this.pos.x * tileWidth + tileWidth - 6, this.pos.y * tileWidth + 6);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(this.pos.x * tileWidth + tileWidth2, this.pos.y * tileWidth + tileWidth2, tileWidth / 2.8, 0, Math.PI * 2);
    ctx.fill();

    // shimmer
    const factor = 3 / 8;
    const grad = ctx.createRadialGradient(this.pos.x * tileWidth + tileWidth * factor, this.pos.y * tileWidth + tileWidth * factor, 0, this.pos.x * tileWidth + tileWidth * factor, this.pos.y * tileWidth + tileWidth * factor, tileWidth / 5);

    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 1)');

    ctx.fillStyle = grad;
    ctx.arc(this.pos.x * tileWidth + tileWidth * factor, this.pos.y * tileWidth + tileWidth * factor, tileWidth / 5, 0, Math.PI * 2);
    ctx.fill();
  }

  drawBackground(ctx, color, ext) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.rect(this.pos.x * tileWidth + (ext ? -1 : 0), this.pos.y * tileWidth + (ext ? -1 : 0), tileWidth + +(ext ? 2 : 1), tileWidth + +(ext ? 2 : 1));
    ctx.fill();
  }

  drawTopLeftBorder(ctx, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.pos.x * tileWidth, (this.pos.y + 1) * tileWidth - 1);
    ctx.lineTo(this.pos.x * tileWidth, this.pos.y * tileWidth);
    ctx.lineTo((this.pos.x + 1) * tileWidth - 1, this.pos.y * tileWidth);
    ctx.stroke();
  }

  drawBottomRightBorder(ctx, color) {
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