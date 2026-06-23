import { Injectable } from '@angular/core';
import { Ball, BurstResult, Cell, Direction, Grid, Player } from '../utility/interfaces';
import { COLOR, GRID } from '../utility/enums';
import { createBall, getBallCoordinates, isCornerCell, isEdgeCell, isRowColValid } from '../utility/functions';

@Injectable({ providedIn: 'root' })
export class GameEngineService {
  readonly allPlayers: Player[] = [
    { color: COLOR.RED,   name: 'unknown', cellCnt: 0 },
    { color: COLOR.GREEN, name: 'unknown', cellCnt: 0 },
    { color: COLOR.BLUE,  name: 'unknown', cellCnt: 0 },
    { color: COLOR.WHITE, name: 'unknown', cellCnt: 0 },
    { color: COLOR.PINK,  name: 'unknown', cellCnt: 0 },
    { color: COLOR.BROWN, name: 'unknown', cellCnt: 0 },
    { color: COLOR.CYAN,  name: 'unknown', cellCnt: 0 },
  ];

  cells: Cell[][] = [];
  grid!: Grid;
  players: Player[] = [];
  playerInd = 0;
  playerCnt = 2;
  rowCnt = 5;
  colCnt = 5;
  turnCnt = 0;
  hasAllPlayersClicked = false;
  isGameOver = false;
  currentColor = '';

  initGame(rowCnt: number, colCnt: number, players: Player[]): void {
    this.players = players;
    this.playerCnt = players.length;
    this.playerInd = 0;
    this.turnCnt = 0;
    this.hasAllPlayersClicked = false;
    this.isGameOver = false;
    this.currentColor = '';
    this.grid = {
      rowCnt,
      colCnt,
      cellWidth: GRID.DEFAULT_CELL_WIDTH,
      width: 0,
      height: 0,
      padding: GRID.PADDING,
    };
    this.cells = [];
    for (let i = 0; i < rowCnt; i++) {
      this.cells.push([]);
      for (let j = 0; j < colCnt; j++) {
        this.cells[i].push({
          maxBallCnt: this.getMaxBallCntInCell(i, j),
          color: '',
          balls: [],
        });
      }
    }
  }

  getMaxBallCntInCell(row: number, col: number): number {
    return isCornerCell(row, col, this.grid)
      ? 1
      : isEdgeCell(row, col, this.grid)
      ? 2
      : 3;
  }

  isValidMove(row: number, col: number): boolean {
    const cell = this.cells[row][col];
    return (
      cell.balls.length === 0 ||
      cell.color === this.players[this.playerInd].color
    );
  }

  // Adds a ball to the cell. Returns BurstResult if the cell burst, null otherwise.
  addBallToCell(row: number, col: number): BurstResult | null {
    const cell = this.cells[row][col];
    if (cell.balls.length === cell.maxBallCnt) {
      return this.burstCell(row, col);
    }

    cell.color = this.currentColor;
    const ball: Ball = createBall(row, col, this.grid, this.cells);
    if (ball.isVibrating) this.vibrateAllBallsInCell(row, col);
    cell.balls.push(ball);
    this.updateCellBallPositions(row, col);
    return null;
  }

  // Clears the cell and returns the valid neighbors for burst propagation.
  burstCell(row: number, col: number): BurstResult {
    this.cells[row][col].color = '';
    this.cells[row][col].balls = [];
    const fr = [1, -1, 0, 0];
    const fc = [0, 0, 1, -1];
    const dirs: Direction[] = ['D', 'U', 'R', 'L'];
    const neighbors: Array<{ r: number; c: number; dir: Direction }> = [];
    for (let i = 0; i < 4; i++) {
      const vr = row + fr[i];
      const vc = col + fc[i];
      if (isRowColValid(vr, vc, this.grid)) {
        neighbors.push({ r: vr, c: vc, dir: dirs[i] });
      }
    }
    return { neighbors };
  }

  goToNextPlayer(): void {
    this.playerInd++;
    if (this.playerInd >= this.playerCnt) {
      this.hasAllPlayersClicked = true;
    }
    this.playerInd %= this.playerCnt;
  }

  vibrateAllBallsInCell(row: number, col: number): void {
    for (const ball of this.cells[row][col].balls) {
      ball.isVibrating = true;
    }
  }

  updateCellBallPositions(row: number, col: number): void {
    const cell = this.cells[row][col];
    const center = getBallCoordinates(row, col, this.grid);
    const d = 6;

    // Reset all balls to center before applying the layout for the new count,
    // preventing cumulative drift when the cell grows from 2 to 3 balls.
    for (const ball of cell.balls) {
      ball.startX = center.x;
      ball.startY = center.y;
      ball.currX = center.x;
      ball.currY = center.y;
    }

    if (cell.balls.length === 2) {
      cell.balls[0].startX += this.grid.cellWidth / d;
      cell.balls[1].startX -= this.grid.cellWidth / d;
      cell.balls[0].currX += this.grid.cellWidth / d;
      cell.balls[1].currX -= this.grid.cellWidth / d;
    } else if (cell.balls.length === 3) {
      cell.balls[0].startX += this.grid.cellWidth / d;
      cell.balls[0].startY -= this.grid.cellWidth / d;
      cell.balls[1].startX -= this.grid.cellWidth / d;
      cell.balls[1].startY -= this.grid.cellWidth / d;
      cell.balls[2].startY += this.grid.cellWidth / d;
      cell.balls[0].currX += this.grid.cellWidth / d;
      cell.balls[0].currY -= this.grid.cellWidth / d;
      cell.balls[1].currX -= this.grid.cellWidth / d;
      cell.balls[1].currY -= this.grid.cellWidth / d;
      cell.balls[2].currY += this.grid.cellWidth / d;
    }
  }
}
