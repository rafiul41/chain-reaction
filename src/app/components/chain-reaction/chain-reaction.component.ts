import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { TransitionBall } from '../../utility/interfaces';
import { COLOR, SPEED } from '../../utility/enums';
import {
  createTransitionBall,
  drawBall,
  drawGrid,
  getRowColFromCoordinate,
  isRowColValid,
} from '../../utility/functions';
import { Router } from '@angular/router';
import { GameEngineService } from '../../services/game-engine.service';

@Component({
  standalone: false,
  selector: 'app-chain-reaction',
  templateUrl: './chain-reaction.component.html',
  styleUrls: ['./chain-reaction.component.scss'],
})
export class ChainReactionComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @ViewChild('canvas', { static: true })
  canvas: ElementRef<HTMLCanvasElement>;

  ctx: CanvasRenderingContext2D | null;
  animationId: any;

  isTransitioning = false;
  transitionBalls: TransitionBall[] = [];
  hasWentToNextPlayer = true;

  isMoveTextToVibrate = false;

  confirmationModal: any;
  isModalShowing = false;
  modalAction: 'restart' | 'go back';

  private readonly allPlayers = [
    { color: COLOR.RED,   name: 'unknown', cellCnt: 0 },
    { color: COLOR.GREEN, name: 'unknown', cellCnt: 0 },
    { color: COLOR.BLUE,  name: 'unknown', cellCnt: 0 },
    { color: COLOR.WHITE, name: 'unknown', cellCnt: 0 },
    { color: COLOR.PINK,  name: 'unknown', cellCnt: 0 },
    { color: COLOR.BROWN, name: 'unknown', cellCnt: 0 },
    { color: COLOR.CYAN,  name: 'unknown', cellCnt: 0 },
  ];

  // Template-facing getters — delegate to engine so templates need no change.
  get players() { return this.engine.players; }
  get playerInd() { return this.engine.playerInd; }
  get turnCnt() { return this.engine.turnCnt; }
  get isGameOver() { return this.engine.isGameOver; }
  get currentColor() { return this.engine.currentColor; }

  constructor(private router: Router, public engine: GameEngineService) {}

  @HostListener('window:resize')
  onResize() {
    this.updateCellWidth();
  }

  ngAfterViewInit(): void {
    this.confirmationModal = document.getElementById('confirmation-modal');
  }

  ngOnInit(): void {
    this.engine.initGame(
      this.engine.rowCnt,
      this.engine.colCnt,
      this.allPlayers.slice(0, this.engine.playerCnt)
    );
    this.updateCellWidth();
    this.ctx = this.canvas.nativeElement.getContext('2d');
    this.transitionBalls = [];
    this.animate();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationId);
  }

  updateCellWidth() {
    const grid = this.engine.grid;
    if (window.innerWidth < 511) {
      grid.cellWidth = window.innerWidth / grid.colCnt;
    }
    const canvasWidth = grid.cellWidth * grid.colCnt + 2 * grid.padding;
    const canvasHeight = grid.cellWidth * grid.rowCnt + 2 * grid.padding;
    this.canvas.nativeElement.width = canvasWidth;
    this.canvas.nativeElement.height = canvasHeight;
    grid.width = canvasWidth;
    grid.height = canvasHeight;
  }

  animate() {
    if (this.engine.isGameOver) return;
    const { grid } = this.engine;
    this.ctx?.clearRect(0, 0, grid.width, grid.height);
    drawGrid(grid, this.ctx);
    this.updateBalls();
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  updateBalls() {
    const { cells } = this.engine;

    for (let i = 0; i < cells.length; i++) {
      for (let j = 0; j < cells[i].length; j++) {
        for (let k = 0; k < cells[i][j].balls.length; k++) {
          const ball = cells[i][j].balls[k];
          if (ball.isVibrating) {
            ball.vibrationSpeed++;
            ball.vibrationSpeed %= SPEED.VIBRATION_MOD;
            if (ball.vibrationSpeed === 0) {
              ball.currX = ball.startX + (Math.random() * 10 - SPEED.VIBRATION_MOD);
              ball.currY = ball.startY + (Math.random() * 10 - SPEED.VIBRATION_MOD);
            }
          }
          drawBall(ball, cells[i][j].color, this.ctx);
        }
      }
    }

    if (this.transitionBalls.length === 0) {
      this.isTransitioning = false;
      if (this.engine.hasAllPlayersClicked) {
        const colorsOnBoard = new Set<string>();
        for (let i = 0; i < cells.length; i++) {
          for (let j = 0; j < cells[i].length; j++) {
            if (cells[i][j].color !== '') colorsOnBoard.add(cells[i][j].color);
          }
        }
        if (colorsOnBoard.size === 1) {
          this.engine.isGameOver = true;
        }
      }
      if (!this.hasWentToNextPlayer && !this.engine.isGameOver) {
        this.engine.goToNextPlayer();
        this.hasWentToNextPlayer = true;
      }
      return;
    }

    for (let i = 0; i < this.transitionBalls.length; i++) {
      const ball = this.transitionBalls[i];
      let arrived = false;
      if (ball.dir === 'U') {
        ball.currY -= SPEED.TRANSITION_BALL_SPEED;
        if (ball.currY < ball.endY) arrived = true;
      } else if (ball.dir === 'D') {
        ball.currY += SPEED.TRANSITION_BALL_SPEED;
        if (ball.currY > ball.endY) arrived = true;
      } else if (ball.dir === 'R') {
        ball.currX += SPEED.TRANSITION_BALL_SPEED;
        if (ball.currX > ball.endX) arrived = true;
      } else {
        ball.currX -= SPEED.TRANSITION_BALL_SPEED;
        if (ball.currX < ball.endX) arrived = true;
      }

      if (arrived) {
        this.transitionBalls = [
          ...this.transitionBalls.slice(0, i),
          ...this.transitionBalls.slice(i + 1),
        ];
        this.engine.cells[ball.endR][ball.endC].color = this.engine.currentColor;
        this.applyMoveWithAnimation(ball.endR, ball.endC);
        i--;
      } else {
        drawBall(ball, this.engine.currentColor, this.ctx);
      }
    }
  }

  // Delegates move logic to engine and spawns TransitionBalls for any burst.
  private applyMoveWithAnimation(row: number, col: number): void {
    const result = this.engine.addBallToCell(row, col);
    if (result) {
      this.isTransitioning = true;
      for (const { r, c, dir } of result.neighbors) {
        this.transitionBalls.push(
          createTransitionBall(row, col, r, c, dir, this.engine.grid)
        );
      }
    }
  }

  onCellClick(e: any) {
    if (this.isTransitioning) return;
    const gridCoordinate = {
      x: e.offsetX - this.engine.grid.padding,
      y: e.offsetY - this.engine.grid.padding,
    };
    const { row, col } = getRowColFromCoordinate(
      gridCoordinate.x,
      gridCoordinate.y,
      this.engine.grid
    );
    if (!isRowColValid(row, col, this.engine.grid)) {
      console.log('PLEASE CLICK ON A CELL!');
      return;
    }
    if (!this.engine.isValidMove(row, col)) {
      this.vibrateMoveText();
      return;
    }

    this.engine.turnCnt++;
    this.hasWentToNextPlayer = false;
    this.engine.currentColor = this.engine.players[this.engine.playerInd].color;
    this.applyMoveWithAnimation(row, col);

    // Non-burst: advance turn immediately (mirrors original synchronous behaviour).
    if (!this.hasWentToNextPlayer && !this.isTransitioning) {
      this.engine.goToNextPlayer();
      this.hasWentToNextPlayer = true;
    }
  }

  vibrateMoveText() {
    this.isMoveTextToVibrate = true;
    setTimeout(() => {
      this.isMoveTextToVibrate = false;
    }, 500);
  }

  restart() {
    if (!this.engine.isGameOver && this.engine.turnCnt > 0 && !this.isModalShowing) {
      this.modalAction = 'restart';
      this.showModal();
    } else {
      location.reload();
    }
  }

  goHome() {
    if (!this.engine.isGameOver && this.engine.turnCnt > 0 && !this.isModalShowing) {
      this.modalAction = 'go back';
      this.showModal();
    } else {
      this.router.navigate(['/home']);
    }
  }

  showModal() {
    this.isModalShowing = true;
    this.confirmationModal.showModal();
  }

  closeModal() {
    this.isModalShowing = false;
    this.confirmationModal.close();
  }

  doModalAction() {
    if (this.modalAction === 'go back') {
      this.goHome();
    } else {
      this.restart();
    }
  }
}
