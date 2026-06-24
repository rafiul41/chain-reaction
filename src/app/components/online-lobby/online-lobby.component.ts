import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { OnlineGameService } from '../../services/online-game.service';
import { RoomState } from '../../utility/interfaces';

type LobbyView = 'select' | 'create' | 'join' | 'waiting';

@Component({
  standalone: false,
  selector: 'app-online-lobby',
  templateUrl: './online-lobby.component.html',
  styleUrls: ['./online-lobby.component.scss'],
})
export class OnlineLobbyComponent implements OnInit, OnDestroy {
  view: LobbyView = 'select';
  errorMsg = '';

  // Create form
  createName = '';
  createPlayerCnt = 2;
  createRowCnt = 5;
  createColCnt = 5;

  // Join form
  joinName = '';
  joinCode = '';

  currentRoom: RoomState | null = null;

  private subs: Subscription[] = [];

  get isHost(): boolean {
    return this.currentRoom?.hostSocketId === this.online.mySocketId;
  }

  get canStart(): boolean {
    return (this.currentRoom?.players.length ?? 0) >= 2;
  }

  constructor(
    public online: OnlineGameService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.online.connect();
    this.subs.push(
      this.online.roomCreated$.subscribe((r) => {
        this.currentRoom = r;
        this.view = 'waiting';
        this.errorMsg = '';
      }),
      this.online.roomJoined$.subscribe((r) => {
        this.currentRoom = r;
        this.view = 'waiting';
        this.errorMsg = '';
      }),
      this.online.roomUpdated$.subscribe((r) => {
        console.log('IN ROOM UPDATED', r);
        this.currentRoom = r;
        this.cdr.detectChanges();
      }),
      this.online.roomStarted$.subscribe(() => {
        this.router.navigate(['/online/game']);
      }),
      this.online.roomError$.subscribe((e) => {
        this.errorMsg = e.message;
      }),
    );
  }

  selectCreate(): void {
    this.view = 'create';
    this.errorMsg = '';
  }

  selectJoin(): void {
    this.view = 'join';
    this.errorMsg = '';
  }

  createRoom(): void {
    if (!this.createName.trim()) {
      this.errorMsg = 'Please enter your name.';
      return;
    }
    this.online.createRoom(
      this.createName.trim(),
      this.createRowCnt,
      this.createColCnt,
      this.createPlayerCnt,
    );
  }

  joinRoom(): void {
    if (!this.joinName.trim()) {
      this.errorMsg = 'Please enter your name.';
      return;
    }
    if (!this.joinCode.trim()) {
      this.errorMsg = 'Please enter the room code.';
      return;
    }
    this.online.joinRoom(this.joinCode.trim(), this.joinName.trim());
  }

  startGame(): void {
    if (this.currentRoom) {
      this.online.startRoom(this.currentRoom.roomId);
    }
  }

  goBack(): void {
    if (this.view === 'waiting' || this.view === 'select') {
      this.online.disconnect();
      this.router.navigate(['/home']);
    } else {
      this.view = 'select';
      this.errorMsg = '';
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }
}
