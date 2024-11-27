import {Tile, tileWidth} from "./tile.mjs";
import {Vector} from "./util/vector.mjs";
import {getRandomIntInclusive, sanitize, toMinutesSecondsString} from "./util/utils.mjs";
import {addToHighScore, hideHighScore, showHighScore} from "./highscore.mjs";
import {difficulties, registerDifficultyListener} from "./difficulty.mjs";

const displayNumMines = document.querySelector("#numMinesId");
const displayNumFlags = document.querySelector("#numFlagsId");
const overlay = document.querySelector("#overlay");
const timer = document.querySelector("#timerId");


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
    this.difficultyFactor = difficulties.MIN;

    this.failed = false;
    this.finished = false;

    this.startTime = -1;
    this.endTime = -1;

    registerDifficultyListener(this.setDifficulty.bind(this));
  }

  setDifficulty(difficulty) {
    this.difficultyFactor = difficulty.val;
    this.reSet();
  }

  setWorldDimension(worldWidth, worldHeight) {
    const reset = (this.width !== worldWidth || this.height !== worldHeight);
    this.width = worldWidth;
    this.height = worldHeight;
    this.xTilesCount = worldWidth / tileWidth;
    this.yTilesCount = worldHeight / tileWidth;

    if (reset)
      this.reSet();
  }

  reSet() {
    hideHighScore();
    if (this.tiles.length > 0) {
      this.startTime = -1;
      this.endTime = -1;
      displayNumFlags.innerText = '0';
      timer.innerText = '0:00';
      overlay.classList.remove('looser', 'winner');
      this.tiles = [];
      this.failed = false;
      this.finished = false;
    }
    for (let y = 0; y < this.yTilesCount; y++) {
      for (let x = 0; x < this.xTilesCount; x++) {
        const vec = new Vector(x, y);
        this.tiles.push(new Tile(vec));
      }
    }

    this.numBombs = Math.floor(this.tiles.length * this.difficultyFactor);
    displayNumMines.innerText = this.numBombs;
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

  #countClickedTiles() {
    return this.tiles.filter(t => t.clicked).length
  }

  #countFlaggedTiles() {
    return this.tiles.filter(t => t.flagged).length
  }

  #startTimer() {
    if (this.startTime < 0)
      this.startTime = new Date().getTime();
  }

  clickTile() {
    if (this.finished || this.failed)
      return;
    this.#startTimer();
    const tile = this.tileHovered;
    if (tile) {
      if (!tile.bomb && tile.bombNeighbours === 0)
        this.#openAllNeighbors(tile);

      tile.clicked = true;
      if (tile.bomb) {
        this.endTime = new Date().getTime();
        this.failed = true;
        overlay.classList.add('looser');
      } else if (this.tiles.length - this.#countClickedTiles() === this.numBombs) {
        this.endTime = new Date().getTime();
        this.finished = true;
        overlay.classList.add('winner');

        let user = null;
        while (typeof user !== 'string' || user.length === 0) {
          user = sanitize(prompt("Please enter your name", localStorage.getItem('user') || "User"));
        }
        localStorage.setItem('user', user);

        const newHighScore = addToHighScore(this.numBombs, user, this.endTime - this.startTime);
        if (newHighScore)
          showHighScore(this.numBombs);
      }
    }
  }

  flagTile() {
    if (this.finished || this.failed)
      return;
    
    this.#startTimer();
    const tile = this.tileHovered;
    if (tile)
      tile.flagged = !tile.flagged;

    displayNumFlags.innerText = this.#countFlaggedTiles();
  }

  #openAllNeighbors(tile) {
    let tileIdx = tile.pos.x + tile.pos.y * this.xTilesCount;
    const workList = [tileIdx];

    while (workList.length > 0) {
      tileIdx = workList.pop();
      const t = this.tiles[tileIdx];

      if (t.bombNeighbours === 0) {
        const neighborIdxS = this.#getNeighbors(tileIdx);
        for (const neighborIdx of neighborIdxS) {
          const n = this.tiles[neighborIdx];
          if (!n.clicked)
            workList.push(neighborIdx);
        }
      }
      t.clicked = true;
    }
  }

  draw(ctx) {
    const forceShow = this.failed || this.finished;
    for (const tile of this.tiles) {
      tile.draw(ctx, forceShow, tile.equals(this.tileHovered), this.mouseDown);
    }

    if (this.startTime > 0) {
      const time = (this.endTime > 0 ? (this.endTime - this.startTime) : (new Date().getTime() - this.startTime)) / 1000;
      timer.innerText = toMinutesSecondsString(time);
    }
  }
}

export default World;