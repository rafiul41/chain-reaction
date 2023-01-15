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
  cells: [[Cell]]
  balls: [[Ball[]]];

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
    for(let i = 0; i < this.grid.rowCnt; i++) {
      initialBallConfig.push([]);
      for(let j = 0; j < this.grid.colCnt; j++) {
        initialBallConfig[i].push([]);
      }
    }
    this.balls = initialBallConfig;
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
    for (let i = 0; i < this.balls.length; i++) {
      for (let j = 0; j < this.balls[i].length; j++) {
        for (let k = 0; k < this.balls[i][j].length; k++) {
          let ball = this.balls[i][j][k];
          if(ball.isVibrating) {
            ball.vibrationSpeed++;
            ball.vibrationSpeed %= 5;
            if(ball.vibrationSpeed === 0) {
              ball.currX = ball.startX + (Math.random() * 10 - 2.5);
              ball.currY = ball.startY + (Math.random() * 10 - 2.5);
            }
          }
          this.drawBall(ball);
        }
      }
    }
  }

  drawBall(ball: Ball) {
    if(!this.ctx) return;
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
    return (row === 0 && col === 0) 
      || (row === 0 && col === this.grid.colCnt - 1) 
      || (row === this.grid.rowCnt - 1 && col === 0) 
      || (row === this.grid.rowCnt - 1 && col === this.grid.colCnt - 1);
  }

  isEdgeCell(row: number, col: number) {
    return !this.isCornerCell(row, col) && row === 0 || col === 0 || row === this.grid.rowCnt - 1 || col === this.grid.colCnt - 1;
  }

  isMiddleCell(row: number, col: number) {
    return !this.isCornerCell(row, col) && !this.isEdgeCell(row, col);
  }

  getVibrationVal(row: number, col: number) {
    if(this.isCornerCell(row, col)) {

    }
  }

  createBall(row: number, col: number): Ball {
    let x = (col * this.grid.cellWidth) + (this.grid.cellWidth / 2) + this.grid.padding;
    let y = (row * this.grid.cellWidth) + (this.grid.cellWidth / 2) + this.grid.padding;
    return {
      color: 'red',
      isMoving: false,
      motionSpeed: 1,
      radius: this.grid.cellWidth / 4,
      startX: x,
      startY: y,
      currX: x,
      currY: y,
      wallDistFromCenter: this.grid.cellWidth / 3,
      isVibrating: false,
      vibrationSpeed: 1
    };
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
    
    const ball: Ball = this.createBall(cellRow, cellCol);
    this.balls[cellRow][cellCol].push(ball);
  }
}
