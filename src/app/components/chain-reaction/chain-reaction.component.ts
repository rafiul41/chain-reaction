import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  Ball,
  Cell,
  Direction,
  Grid,
  TransitionBall,
} from '../../utility/interfaces';
import { COLOR, GRID, SPEED } from '../../utility/enums';
import {
  createBall,
  createTransitionBall,
  drawBall,
  drawGrid,
  getRowColFromCoordinate,
  isCornerCell,
  isEdgeCell,
  isRowColValid,
} from '../../utility/functions';

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
  hasWentToNextPlayer = true;

  playerCnt = 2;
  playerInd = 0;

  players = [
    {
      color: COLOR.RED,
      name: 'unknown',
      cellCnt: 0,
    },
    {
      color: COLOR.GREEN,
      name: 'unknown',
      cellCnt: 0,
    },
    {
      color: COLOR.BLUE,
      name: 'unknown',
      cellCnt: 0,
    },
    {
      color: COLOR.WHITE,
      name: 'unknown',
      cellCnt: 0,
    },
    {
      color: COLOR.PINK,
      name: 'unknown',
      cellCnt: 0,
    },
    {
      color: COLOR.BROWN,
      name: 'unknown',
      cellCnt: 0,
    },
    {
      color: COLOR.CYAN,
      name: 'unknown',
      cellCnt: 0,
    },
  ];

  currentColor: string;

  constructor() {}

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.updateCellWidth();
  }

  updateCellWidth() {
    if(window.innerWidth < 511) {
      let gridWidth = window.innerWidth;
      this.grid.cellWidth = gridWidth / this.grid.colCnt;
    }
    let canvasWidth =
      this.grid.cellWidth * this.grid.colCnt + 2 * this.grid.padding;
    let canvasHeight =
      this.grid.cellWidth * this.grid.rowCnt + 2 * this.grid.padding;
    this.canvas.nativeElement.width = canvasWidth;
    this.canvas.nativeElement.height = canvasHeight;
    this.grid.width = canvasWidth;
    this.grid.height = canvasHeight;
  }

  ngOnInit(): void {
    this.players = this.players.slice(0, this.playerCnt);
    this.initializeGridAndCanvas();
    this.animate();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationId);
  }

  animate() {
    if (this.isGameOver) return;
    this.ctx?.clearRect(0, 0, this.grid.width, this.grid.height);
    drawGrid(this.grid, this.ctx);
    this.updateBalls();
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  updateBalls() {
    let set = new Set();
    for (let i = 0; i < this.cells.length; i++) {
      for (let j = 0; j < this.cells[i].length; j++) {
        if (this.cells[i][j].color !== '') set.add(this.cells[i][j].color);
        for (let k = 0; k < this.cells[i][j].balls.length; k++) {
          let ball = this.cells[i][j].balls[k];
          if (ball.isVibrating) {
            ball.vibrationSpeed++;
            ball.vibrationSpeed %= SPEED.VIBRATION_MOD;
            if (ball.vibrationSpeed === 0) {
              ball.currX =
                ball.startX + (Math.random() * 10 - SPEED.VIBRATION_MOD);
              ball.currY =
                ball.startY + (Math.random() * 10 - SPEED.VIBRATION_MOD);
            }
          }
          drawBall(ball, this.cells[i][j].color, this.ctx);
        }
      }
    }

    if (set.size === 1 && this.hasAllPlayersClicked) {
      this.isGameOver = true;
    }

    if (this.transitionBalls.length === 0) {
      this.isTransitioning = false;
      if (!this.hasWentToNextPlayer) {
        this.goToNextPlayer();
        this.hasWentToNextPlayer = true;
      }
      return;
    }
    for (let i = 0; i < this.transitionBalls.length; i++) {
      let ball = this.transitionBalls[i];
      let toRemove = false;
      if (ball.dir === 'U') {
        ball.currY -= SPEED.TRANSITION_BALL_SPEED;
        if (ball.currY < ball.endY) toRemove = true;
      } else if (ball.dir === 'D') {
        ball.currY += SPEED.TRANSITION_BALL_SPEED;
        if (ball.currY > ball.endY) toRemove = true;
      } else if (ball.dir === 'R') {
        ball.currX += SPEED.TRANSITION_BALL_SPEED;
        if (ball.currX > ball.endX) toRemove = true;
      } else {
        ball.currX -= SPEED.TRANSITION_BALL_SPEED;
        if (ball.currX < ball.endX) toRemove = true;
      }
      if (toRemove) {
        this.addBallOnCell(ball.endR, ball.endC);
        this.cells[ball.endR][ball.endC].color = this.currentColor;
        this.transitionBalls = [
          ...this.transitionBalls.slice(0, i),
          ...this.transitionBalls.slice(i + 1),
        ];
      } else {
        drawBall(ball, this.currentColor, this.ctx);
      }
    }
  }

  getMaxBallCntInCell(row: number, col: number) {
    return isCornerCell(row, col, this.grid)
      ? 1
      : isEdgeCell(row, col, this.grid)
      ? 2
      : 3;
  }

  initializeGridAndCanvas() {
    this.grid = {
      rowCnt: this.rowCnt,
      colCnt: this.colCnt,
      cellWidth: GRID.DEFAULT_CELL_WIDTH,
      width: 0,
      height: 0,
      padding: GRID.PADDING,
    };
    this.updateCellWidth();
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

  vibrateAllBallsInCell(row: number, col: number) {
    for (let i = 0; i < this.cells[row][col].balls.length; i++) {
      this.cells[row][col].balls[i].isVibrating = true;
    }
  }

  updateCellBallPositions(row: number, col: number) {
    let cell = this.cells[row][col];
    let denominator = 6;
    if (cell.balls.length === 2) {
      cell.balls[0].startX += this.grid.cellWidth / denominator;
      cell.balls[1].startX -= this.grid.cellWidth / denominator;

      cell.balls[0].currX += this.grid.cellWidth / denominator;
      cell.balls[1].currX -= this.grid.cellWidth / denominator;
    } else if (cell.balls.length === 3) {
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

  burstCell(row: number, col: number) {
    this.isTransitioning = true;
    this.cells[row][col].color = '';
    this.cells[row][col].balls = [];
    let fr = [1, -1, 0, 0];
    let fc = [0, 0, 1, -1];
    let dir: Direction[] = ['D', 'U', 'R', 'L'];
    for (let i = 0; i < 4; i++) {
      let vr = row + fr[i];
      let vc = col + fc[i];
      if (
        vr >= 0 &&
        vc >= 0 &&
        vr < this.grid.rowCnt &&
        vc < this.grid.colCnt
      ) {
        this.transitionBalls.push(
          createTransitionBall(row, col, vr, vc, dir[i], this.grid)
        );
      }
    }
  }

  addBallOnCell(row: number, col: number) {
    if (this.cells[row][col].balls.length === this.cells[row][col].maxBallCnt) {
      this.burstCell(row, col);
      return;
    }

    this.cells[row][col].color = this.currentColor;

    const ball: Ball = createBall(row, col, this.grid, this.cells);
    if (ball.isVibrating) this.vibrateAllBallsInCell(row, col);
    this.cells[row][col].balls.push(ball);
    if (this.cells[row][col].balls.length > 0) {
      this.updateCellBallPositions(row, col);
    }

    if (!this.hasWentToNextPlayer && !this.isTransitioning) {
      this.goToNextPlayer();
      this.hasWentToNextPlayer = true;
    }
  }

  onCellClick(e: any) {
    if (this.isTransitioning) return;
    const gridCoordinate = {
      x: e.offsetX - this.grid.padding,
      y: e.offsetY - this.grid.padding,
    };
    let rowCol = getRowColFromCoordinate(
      gridCoordinate.x,
      gridCoordinate.y,
      this.grid
    );
    let row = rowCol.row;
    let col = rowCol.col;
    if (!isRowColValid(row, col, this.grid)) {
      console.log('PLEASE CLICK ON A CELL!');
      return;
    }

    if (
      this.cells[row][col].balls.length > 0 &&
      this.cells[row][col].color !== this.players[this.playerInd].color
    ) {
      return;
    }

    this.hasWentToNextPlayer = false;
    this.currentColor = this.players[this.playerInd].color;
    this.addBallOnCell(row, col);
  }

  goToNextPlayer() {
    this.playerInd++;
    if (this.playerInd >= this.playerCnt) {
      this.hasAllPlayersClicked = true;
    }
    this.playerInd %= this.playerCnt;
  }

  restart() {
    location.reload();
  }
}
