import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Ball, Cell, Grid, Point } from '../../entities/chain-reaction';

@Component({
  selector: 'app-chain-reaction',
  templateUrl: './chain-reaction.component.html',
  styleUrls: ['./chain-reaction.component.scss'],
})
export class ChainReactionComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: true })
  canvas: ElementRef<HTMLCanvasElement>;

  ctx: CanvasRenderingContext2D | null;

  animationId: any;

  grid: Grid;
  cells: [[Cell]];

  constructor() {}

  ngOnInit(): void {
    this.initializeGridAndCanvas();
    this.animate();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationId);
  }

  initializeGridAndCanvas() {
    this.grid = {
      rowCnt: 5,
      colCnt: 5,
      cellWidth: 100,
      width: 0,
      height: 0,
      padding: 5,
    };
    let canvasWidth =
      this.grid.cellWidth * this.grid.colCnt + 2 * this.grid.padding;
    let canvasHeight =
      this.grid.cellWidth * this.grid.rowCnt + 2 * this.grid.padding;
    this.canvas.nativeElement.width = canvasWidth;
    this.canvas.nativeElement.height = canvasHeight;
    this.grid.width = canvasWidth;
    this.grid.height = canvasHeight;
    this.ctx = this.canvas.nativeElement.getContext('2d');

    let initialBallConfig: any = [];
    for (let i = 0; i < this.grid.rowCnt; i++) {
      initialBallConfig.push([]);
      for (let j = 0; j < this.grid.colCnt; j++) {
        initialBallConfig[i].push({
          maxBallCnt: this.getMaxBallCnt(i, j),
          ballCnt: 0,
          balls: [],
        });
      }
    }
    this.cells = initialBallConfig;
  }

  getMaxBallCnt(row: number, col: number) {
    return this.isCornerCell(row, col) ? 1 : this.isEdgeCell(row, col) ? 2 : 3;
  }

  drawGrid() {
    if (this.ctx) {
      this.ctx.fillStyle = 'black';
      this.ctx.fillRect(0, 0, this.grid.width, this.grid.height);
    }
    // vertical Lines
    for (let i = 0; i < this.grid.colCnt + 1; i++) {
      let startX = i * this.grid.cellWidth + this.grid.padding;
      let startY = this.grid.padding;
      let endX = i * this.grid.cellWidth + this.grid.padding;
      let endY = this.grid.height - this.grid.padding;
      this.drawLine({ x: startX, y: startY }, { x: endX, y: endY }, 'white');
    }

    // horizontal Lines
    for (let i = 0; i < this.grid.rowCnt + 1; i++) {
      let startX = this.grid.padding;
      let startY = i * this.grid.cellWidth + this.grid.padding;
      let endX = this.grid.width - this.grid.padding;
      let endY = i * this.grid.cellWidth + this.grid.padding;
      this.drawLine({ x: startX, y: startY }, { x: endX, y: endY }, 'white');
    }
  }

  drawLine(start: Point, end: Point, color: string) {
    if (this.ctx) {
      this.ctx.beginPath();
      this.ctx.moveTo(start.x, start.y);
      this.ctx.lineTo(end.x, end.y);
      this.ctx.strokeStyle = color;
      this.ctx.stroke();
    }
  }

  animate() {
    this.ctx?.clearRect(0, 0, this.grid.width, this.grid.height);
    this.drawGrid();
    this.updateBalls();
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  updateBalls() {
    for (let i = 0; i < this.cells.length; i++) {
      for (let j = 0; j < this.cells[i].length; j++) {
        for (let k = 0; k < this.cells[i][j].balls.length; k++) {
          let ball = this.cells[i][j].balls[k];
          if (ball.isVibrating) {
            ball.vibrationSpeed++;
            ball.vibrationSpeed %= 5;
            if (ball.vibrationSpeed === 0) {
              ball.currX = ball.startX + (Math.random() * 10 - 5);
              ball.currY = ball.startY + (Math.random() * 10 - 5);
            }
          }
          this.drawBall(ball);
        }
      }
    }
  }

  drawBall(ball: Ball) {
    if (!this.ctx) return;
    this.ctx.beginPath();
    this.ctx.arc(ball.currX, ball.currY, ball.radius, 0, 2 * Math.PI, false);
    this.ctx.fillStyle = ball.color;
    this.ctx.fill();
  }

  isRowColValid(row: number, col: number) {
    return (
      row >= 0 && row < this.grid.rowCnt && col >= 0 && col < this.grid.colCnt
    );
  }

  isCornerCell(row: number, col: number) {
    return (
      (row === 0 && col === 0) ||
      (row === 0 && col === this.grid.colCnt - 1) ||
      (row === this.grid.rowCnt - 1 && col === 0) ||
      (row === this.grid.rowCnt - 1 && col === this.grid.colCnt - 1)
    );
  }

  isEdgeCell(row: number, col: number) {
    return (
      (!this.isCornerCell(row, col) && row === 0) ||
      col === 0 ||
      row === this.grid.rowCnt - 1 ||
      col === this.grid.colCnt - 1
    );
  }

  isMiddleCell(row: number, col: number) {
    return !this.isCornerCell(row, col) && !this.isEdgeCell(row, col);
  }

  updateCellBallPositions(row: number, col: number) {
    let cell = this.cells[row][col];
    let denominator = 6;
    if(cell.ballCnt === 2) {
      cell.balls[0].startX += this.grid.cellWidth / denominator;
      cell.balls[1].startX -= this.grid.cellWidth / denominator;
      
      cell.balls[0].currX += this.grid.cellWidth / denominator;
      cell.balls[1].currX -= this.grid.cellWidth / denominator;
    } else if(cell.ballCnt === 3) {
      cell.balls[0].startX += this.grid.cellWidth / (denominator * 10);
      cell.balls[0].startY -= this.grid.cellWidth / denominator;
      cell.balls[1].startX -= this.grid.cellWidth / (denominator * 10);
      cell.balls[1].startY -= this.grid.cellWidth / denominator;
      cell.balls[2].startY += this.grid.cellWidth / denominator;

      cell.balls[0].currX += this.grid.cellWidth / (denominator * 10);
      cell.balls[0].currY -= this.grid.cellWidth / denominator;
      cell.balls[1].currX -= this.grid.cellWidth / (denominator * 10);
      cell.balls[1].currY -= this.grid.cellWidth / denominator;
      cell.balls[2].currY += this.grid.cellWidth / denominator;
    }
  }

  getBallCoordinates(row: number, col: number): Point {
    return {
      x: col * this.grid.cellWidth + this.grid.cellWidth / 2 + this.grid.padding,
      y: row * this.grid.cellWidth + this.grid.cellWidth / 2 + this.grid.padding
    }
  }

  createBall(row: number, col: number): Ball {
    let initialBallPos = this.getBallCoordinates(row, col);
    return {
      color: 'red',
      isMoving: false,
      motionSpeed: 1,
      radius: this.grid.cellWidth / 4,
      startX: initialBallPos.x,
      startY: initialBallPos.y,
      currX: initialBallPos.x,
      currY: initialBallPos.y,
      wallDistFromCenter: this.grid.cellWidth / 3,
      isVibrating: this.cells[row][col].maxBallCnt === this.cells[row][col].ballCnt,
      vibrationSpeed: 1,
    };
  }

  vibrateAllBallsInCell(row: number, col: number) {
    for(let i = 0; i < this.cells[row][col].balls.length; i++) {
      this.cells[row][col].balls[i].isVibrating = true;
    }
  }

  onCellClick(e: any) {
    const gridCoordinate = {
      x: e.offsetX - this.grid.padding,
      y: e.offsetY - this.grid.padding,
    };
    let cellRow = Math.floor(gridCoordinate.y / this.grid.cellWidth);
    let cellCol = Math.floor(gridCoordinate.x / this.grid.cellWidth);
    if (!this.isRowColValid(cellRow, cellCol)) {
      console.log('PLEASE CLICK ON A CELL!');
      return;
    }

    this.cells[cellRow][cellCol].ballCnt++;
    const ball: Ball = this.createBall(cellRow, cellCol);
    if(ball.isVibrating) this.vibrateAllBallsInCell(cellRow, cellCol);
    this.cells[cellRow][cellCol].balls.push(ball);
    this.updateCellBallPositions(cellRow, cellCol);
  }
}
