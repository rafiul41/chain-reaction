import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Ball, Cell, Direction, Grid, TransitionBall } from '../../utility/interfaces';
import { COLOR, GRID, SPEED } from '../../utility/enums';
import { drawBall, drawGrid, getBallCoordinates, isCornerCell, isEdgeCell, isRowColValid } from '../../utility/functions';

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

  rowCnt = 5;
  colCnt = 5;
  grid: Grid;
  cells: Cell[][];

  isTransitioning = false;

  transitionBalls: TransitionBall[];

  isGameOver = false;

  hasAllPlayersClicked = false;

  playerCnt = 2;
  playerInd = 0;

  ballColors = [COLOR.RED, COLOR.GREEN, COLOR.BLUE, COLOR.WHITE, COLOR.PINK, COLOR.BROWN, COLOR.CYAN];
  currentColor: string;

  constructor() {}

  ngOnInit(): void {
    this.ballColors = this.ballColors.slice(0, this.playerCnt);
    this.initializeGridAndCanvas();
    this.animate();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationId);
  }

  animate() {
    this.ctx?.clearRect(0, 0, this.grid.width, this.grid.height);
    drawGrid(this.grid, this.ctx);
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
            ball.vibrationSpeed %= SPEED.VIBRATION_MOD;
            if (ball.vibrationSpeed === 0) {
              ball.currX = ball.startX + (Math.random() * 10 - SPEED.VIBRATION_MOD);
              ball.currY = ball.startY + (Math.random() * 10 - SPEED.VIBRATION_MOD);
            }
          }
          drawBall(ball, this.cells[i][j].color, this.ctx);
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
        this.addBallOnCell(ball.endR, ball.endC);
        this.cells[ball.endR][ball.endC].color = this.currentColor;
        this.transitionBalls = [...this.transitionBalls.slice(0, i), ...this.transitionBalls.slice(i + 1)];
      } else {
        drawBall(ball, this.currentColor, this.ctx);
      }
    }
  }

  getMaxBallCntInCell(row: number, col: number) {
    return isCornerCell(row, col, this.grid) ? 1 : isEdgeCell(row, col, this.grid) ? 2 : 3;
  }

  initializeGridAndCanvas() {
    this.grid = {
      rowCnt: this.rowCnt,
      colCnt: this.colCnt,
      cellWidth: GRID.CELL_WIDTH,
      width: 0,
      height: 0,
      padding: GRID.PADDING,
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
          color: '',
          balls: [],
        });
      }
    }
    this.cells = initialBallConfig;
    this.transitionBalls = [];
  }

  

  createBall(row: number, col: number): Ball {
    let initialBallPos = getBallCoordinates(row, col, this.grid);
    return {
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

  createTransitionBall(startR: number, startC: number, endR: number, endC: number, dir: Direction): TransitionBall {
    let coordinates = getBallCoordinates(endR, endC, this.grid);
    let startCoordinates = getBallCoordinates(startR, startC, this.grid);
    return {
      startR,
      startC,
      endX: coordinates.x,
      endY: coordinates.y,
      radius: this.grid.cellWidth / 4,
      currX: startCoordinates.x,
      currY: startCoordinates.y,
      dir,
      endR,
      endC
    };
  }

  burstCell(row: number, col: number) {
    this.isTransitioning = true;
    this.cells[row][col].color = '';
    this.cells[row][col].balls = [];
    let fr = [1, -1, 0, 0];
    let fc = [0, 0, 1, -1];
    let dir: Direction[] = ['D', 'U', 'R', 'L'];
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
    
    this.cells[row][col].color = this.currentColor;

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
    if (!isRowColValid(row, col, this.grid)) {
      console.log('PLEASE CLICK ON A CELL!');
      return;
    }

    if(this.cells[row][col].balls.length > 0 && this.cells[row][col].color !== this.ballColors[this.playerInd]) {
      return;
    }

    this.currentColor = this.ballColors[this.playerInd];
    this.addBallOnCell(row, col);
    this.goToNextPlayer();
  }

  goToNextPlayer() {
    this.playerInd++;
    this.playerInd %= this.playerCnt;
  }
}
