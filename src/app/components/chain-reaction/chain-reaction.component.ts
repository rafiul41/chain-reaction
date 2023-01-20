import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Ball, Cell, COLOR, Grid, Point, SPEED, TransitionBall } from '../../entities/chain-reaction';

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
  cells: Cell[][];

  isTransitioning = false;

  transitionBalls: TransitionBall[];

  constructor() {}

  ngOnInit(): void {
    this.initializeGridAndCanvas();
    this.animate();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationId);
  }

  animate() {
    this.ctx?.clearRect(0, 0, this.grid.width, this.grid.height);
    this.drawGrid();
    this.updateBalls();
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  getMaxBallCntInCell(row: number, col: number) {
    return this.isCornerCell(row, col) ? 1 : this.isEdgeCell(row, col) ? 2 : 3;
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
          maxBallCnt: this.getMaxBallCntInCell(i, j),
          balls: [],
        });
      }
    }
    this.cells = initialBallConfig;
    this.transitionBalls = [];
  }

  drawGrid() {
    if (this.ctx) {
      this.ctx.fillStyle = COLOR.BLACK;
      this.ctx.fillRect(0, 0, this.grid.width, this.grid.height);
    }
    // vertical Lines
    for (let i = 0; i < this.grid.colCnt + 1; i++) {
      let startX = i * this.grid.cellWidth + this.grid.padding;
      let startY = this.grid.padding;
      let endX = i * this.grid.cellWidth + this.grid.padding;
      let endY = this.grid.height - this.grid.padding;
      this.drawLine({ x: startX, y: startY }, { x: endX, y: endY }, COLOR.WHITE);
    }

    // horizontal Lines
    for (let i = 0; i < this.grid.rowCnt + 1; i++) {
      let startX = this.grid.padding;
      let startY = i * this.grid.cellWidth + this.grid.padding;
      let endX = this.grid.width - this.grid.padding;
      let endY = i * this.grid.cellWidth + this.grid.padding;
      this.drawLine({ x: startX, y: startY }, { x: endX, y: endY }, COLOR.WHITE);
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
    if(this.transitionBalls.length === 0) {
      this.isTransitioning = false;
      return;
    }
    for(let i = 0; i < this.transitionBalls.length; i++) {
      let ball = this.transitionBalls[i];
      let toRemove = false;
      if(ball.dir === 'U') {
        ball.currY -= SPEED.TRANSITION_BALL_SPEED;
        if(ball.currY < ball.endY) toRemove = true;
      } else if(ball.dir === 'D') {
        ball.currY += SPEED.TRANSITION_BALL_SPEED;
        if(ball.currY > ball.endY) toRemove = true;
      } else if(ball.dir === 'R') {
        ball.currX += SPEED.TRANSITION_BALL_SPEED;
        if(ball.currX > ball.endX) toRemove = true;
      } else {
        ball.currX -= SPEED.TRANSITION_BALL_SPEED;
        if(ball.currX < ball.endX) toRemove = true;
      }
      if(toRemove) {
        this.transitionBalls = [...this.transitionBalls.slice(0, i), ...this.transitionBalls.slice(i + 1)];
      } else {
        this.drawBall(ball);
      }
    }
  }

  drawBall(ball: Ball | TransitionBall) {
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

  getBallCoordinates(row: number, col: number): Point {
    return {
      x: col * this.grid.cellWidth + this.grid.cellWidth / 2 + this.grid.padding,
      y: row * this.grid.cellWidth + this.grid.cellWidth / 2 + this.grid.padding
    }
  }

  createBall(row: number, col: number): Ball {
    let initialBallPos = this.getBallCoordinates(row, col);
    return {
      color: COLOR.RED,
      radius: this.grid.cellWidth / 4,
      startX: initialBallPos.x,
      startY: initialBallPos.y,
      currX: initialBallPos.x,
      currY: initialBallPos.y,
      isVibrating: this.cells[row][col].maxBallCnt === this.cells[row][col].balls.length + 1,
      vibrationSpeed: 1,
    };
  }

  vibrateAllBallsInCell(row: number, col: number) {
    for(let i = 0; i < this.cells[row][col].balls.length; i++) {
      this.cells[row][col].balls[i].isVibrating = true;
    }
  }

  updateCellBallPositions(row: number, col: number) {
    let cell = this.cells[row][col];
    let denominator = 6;
    if(cell.balls.length === 2) {
      cell.balls[0].startX += this.grid.cellWidth / denominator;
      cell.balls[1].startX -= this.grid.cellWidth / denominator;
      
      cell.balls[0].currX += this.grid.cellWidth / denominator;
      cell.balls[1].currX -= this.grid.cellWidth / denominator;
    } else if(cell.balls.length === 3) {
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

  createTransitionBall(startR: number, startC: number, endR: number, endC: number, dir: string): TransitionBall {
    let coordinates = this.getBallCoordinates(endR, endC);
    let startCoordinates = this.getBallCoordinates(startR, startC);
    return {
      color: COLOR.RED,
      endX: coordinates.x,
      endY: coordinates.y,
      radius: this.grid.cellWidth / 4,
      startX: startCoordinates.x,
      startY: startCoordinates.y, 
      currX: startCoordinates.x,
      currY: startCoordinates.y,
      dir
    };
  }

  burstCell(row: number, col: number) {
    this.isTransitioning = true;
    this.cells[row][col].balls = [];
    let fr = [1, -1, 0, 0];
    let fc = [0, 0, 1, -1];
    let dir = ['D', 'U', 'R', 'L'];
    for(let i = 0; i < 4; i++) {
      let vr = row + fr[i];
      let vc = col + fc[i];
      if(vr >= 0 && vc >= 0 && vr < this.grid.rowCnt && vc < this.grid.colCnt) {
        this.transitionBalls.push(this.createTransitionBall(row, col, vr, vc, dir[i]));
      }
    }
  }

  addBallOnCell(row: number, col: number) {
    if(this.cells[row][col].balls.length === this.cells[row][col].maxBallCnt) {
      this.burstCell(row, col);
      return; 
    }
    
    const ball: Ball = this.createBall(row, col);
    if(ball.isVibrating) this.vibrateAllBallsInCell(row, col);
    this.cells[row][col].balls.push(ball);
    if(this.cells[row][col].balls.length > 0) {
      this.updateCellBallPositions(row, col);
    }
  }

  getRowColFromCoordinate(x: number, y: number) {
    return {
      row: Math.floor(y / this.grid.cellWidth),
      col: Math.floor(x / this.grid.cellWidth)
    };
  }

  onCellClick(e: any) {
    if(this.isTransitioning) return;
    const gridCoordinate = {
      x: e.offsetX - this.grid.padding,
      y: e.offsetY - this.grid.padding,
    };
    let rowCol = this.getRowColFromCoordinate(gridCoordinate.x, gridCoordinate.y);
    let row = rowCol.row;
    let col = rowCol.col;
    if (!this.isRowColValid(row, col)) {
      console.log('PLEASE CLICK ON A CELL!');
      return;
    }

    this.addBallOnCell(row, col);
  }
}
