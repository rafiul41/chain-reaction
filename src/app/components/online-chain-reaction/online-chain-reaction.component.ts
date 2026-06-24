import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, timer } from 'rxjs';
import { TransitionBall } from '../../utility/interfaces';
import { SPEED } from '../../utility/enums';
import {
  createTransitionBall,
  drawBall,
  drawGrid,
  getRowColFromCoordinate,
  isRowColValid,
} from '../../utility/functions';
import { GameEngineService } from '../../services/game-engine.service';
import { OnlineGameService } from '../../services/online-game.service';

@Component({
  standalone: false,
  selector: 'app-online-chain-reaction',
  templateUrl: './online-chain-reaction.component.html',
  styleUrls: ['./online-chain-reaction.component.scss'],
})
export class OnlineChainReactionComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('canvas', { static: true })
  canvas: ElementRef<HTMLCanvasElement>;

  ctx: CanvasRenderingContext2D | null = null;
  animationId: any;

  isTransitioning = false;
  transitionBalls: TransitionBall[] = [];
  hasWentToNextPlayer = true;
  private gameOverTimer?: Subscription;

  isMoveTextToVibrate = false;
  disconnectedPlayerInd: number | null = null;

  confirmationModal: any;
  isModalShowing = false;

  myPlayerInd = -1;

  private subs: Subscription[] = [];

  get players() { return this.engine.players; }
  get playerInd() { return this.engine.playerInd; }
  get turnCnt() { return this.engine.turnCnt; }
  get isGameOver() { return this.engine.isGameOver; }
  get currentColor() { return this.engine.currentColor; }
  get isMyTurn() { return this.engine.playerInd === this.myPlayerInd; }

  constructor(
    private router: Router,
    public engine: GameEngineService,
    private online: OnlineGameService,
    private cdr: ChangeDetectorRef,
  ) {}

  @HostListener('window:resize')
  onResize() {
    this.updateCellWidth();
  }

  ngAfterViewInit(): void {
    this.confirmationModal = document.getElementById('online-confirmation-modal');
  }

  ngOnInit(): void {
    const room = this.online.currentRoom;
    if (!room) {
      this.router.navigate(['/online']);
      return;
    }

    this.myPlayerInd = this.online.myPlayerInd;
    const players = room.players
      .sort((a, b) => a.playerInd - b.playerInd)
      .map((p) => ({ color: p.color, name: p.name, cellCnt: 0 }));

    this.engine.initGame(room.rowCnt, room.colCnt, players);
    this.updateCellWidth();
    this.ctx = this.canvas.nativeElement.getContext('2d');
    this.transitionBalls = [];
    this.animate();

    this.subs.push(
      this.online.moveBroadcast$.subscribe(({ row, col }) => {
        this.engine.turnCnt++;
        this.hasWentToNextPlayer = false;
        this.engine.currentColor = this.engine.players[this.engine.playerInd].color;
        this.applyMoveWithAnimation(row, col);
        if (!this.hasWentToNextPlayer && !this.isTransitioning) {
          this.engine.goToNextPlayer();
          this.hasWentToNextPlayer = true;
        }
      }),
      this.online.playerDisconnected$.subscribe(({ playerInd }) => {
        this.disconnectedPlayerInd = playerInd;
        this.engine.isGameOver = true;
        this.cdr.detectChanges();
      }),
    );
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationId);
    this.gameOverTimer?.unsubscribe();
    this.subs.forEach((s) => s.unsubscribe());
  }

  updateCellWidth() {
    const grid = this.engine.grid;
    if (!grid) return;
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

    const { colorsOnBoard, currentColor } = this.engine;
    const noOpponentCells =
      colorsOnBoard.size === 0 ||
      (colorsOnBoard.size === 1 && colorsOnBoard.has(currentColor));
    if (this.engine.hasAllPlayersClicked && noOpponentCells && !this.gameOverTimer) {
      this.gameOverTimer = timer(700).subscribe(() => {
        this.engine.isGameOver = true;
        this.cdr.detectChanges();
      });
    }

    if (this.transitionBalls.length === 0) {
      this.isTransitioning = false;
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
        this.applyMoveWithAnimation(ball.endR, ball.endC);
        i--;
      } else {
        drawBall(ball, this.engine.currentColor, this.ctx);
      }
    }
  }

  private applyMoveWithAnimation(row: number, col: number): void {
    const result = this.engine.addBallToCell(row, col);
    if (result) {
      this.isTransitioning = true;
      for (const { r, c, dir } of result.neighbors) {
        this.transitionBalls.push(createTransitionBall(row, col, r, c, dir, this.engine.grid));
      }
    }
  }

  onCellClick(e: any) {
    if (this.isTransitioning || this.engine.isGameOver) return;
    if (!this.isMyTurn) {
      this.vibrateMoveText();
      return;
    }

    const gridCoordinate = {
      x: e.offsetX - this.engine.grid.padding,
      y: e.offsetY - this.engine.grid.padding,
    };
    const { row, col } = getRowColFromCoordinate(
      gridCoordinate.x,
      gridCoordinate.y,
      this.engine.grid,
    );
    if (!isRowColValid(row, col, this.engine.grid)) return;
    if (!this.engine.isValidMove(row, col)) {
      this.vibrateMoveText();
      return;
    }

    this.engine.turnCnt++;
    this.hasWentToNextPlayer = false;
    this.engine.currentColor = this.engine.players[this.engine.playerInd].color;
    this.applyMoveWithAnimation(row, col);

    // Relay to server (others only)
    this.online.makeMove(this.online.currentRoom!.roomId, row, col);

    if (!this.hasWentToNextPlayer && !this.isTransitioning) {
      this.engine.goToNextPlayer();
      this.hasWentToNextPlayer = true;
    }
  }

  vibrateMoveText() {
    this.isMoveTextToVibrate = true;
    setTimeout(() => { this.isMoveTextToVibrate = false; }, 500);
  }

  goHome() {
    if (!this.engine.isGameOver && this.engine.turnCnt > 0 && !this.isModalShowing) {
      this.isModalShowing = true;
      this.confirmationModal?.showModal();
    } else {
      this.leaveGame();
    }
  }

  closeModal() {
    this.isModalShowing = false;
    this.confirmationModal?.close();
  }

  leaveGame() {
    this.online.disconnect();
    this.router.navigate(['/home']);
  }
}
