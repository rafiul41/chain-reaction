import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { OnlineGameService } from '../../services/online-game.service';

type LobbyView = 'select' | 'create' | 'join' | 'waiting';

@Component({
  standalone: true,
  imports: [FormsModule],
  selector: 'app-online-lobby',
  templateUrl: './online-lobby.component.html',
  styleUrls: ['./online-lobby.component.scss'],
})
export class OnlineLobbyComponent implements OnInit, OnDestroy {
  readonly view = signal<LobbyView>('select');
  readonly errorMsg = signal('');

  // Form fields — updated only by ngModel, which calls markForCheck internally.
  createName = '';
  createPlayerCnt = 2;
  createRowCnt = 5;
  createColCnt = 5;
  joinName = '';
  joinCode = '';

  // Derived from the service signal — auto-updates when service state changes.
  readonly currentRoom = computed(() => this.online.currentRoom());
  readonly isHost = computed(
    () => this.currentRoom()?.hostSocketId === this.online.mySocketId(),
  );
  readonly canStart = computed(() => (this.currentRoom()?.players.length ?? 0) >= 2);

  private subs: Subscription[] = [];

  constructor(public online: OnlineGameService, private router: Router) {}

  ngOnInit(): void {
    this.online.connect();
    this.subs.push(
      this.online.roomCreated$.subscribe(() => {
        this.view.set('waiting');
        this.errorMsg.set('');
      }),
      this.online.roomJoined$.subscribe(() => {
        this.view.set('waiting');
        this.errorMsg.set('');
      }),
      this.online.roomStarted$.subscribe(() => {
        this.router.navigate(['/online/game']);
      }),
      this.online.roomError$.subscribe((e) => {
        this.errorMsg.set(e.message);
      }),
    );
  }

  selectCreate(): void { this.view.set('create'); this.errorMsg.set(''); }
  selectJoin(): void { this.view.set('join'); this.errorMsg.set(''); }

  createRoom(): void {
    if (!this.createName.trim()) { this.errorMsg.set('Please enter your name.'); return; }
    this.online.createRoom(this.createName.trim(), this.createRowCnt, this.createColCnt, this.createPlayerCnt);
  }

  joinRoom(): void {
    if (!this.joinName.trim()) { this.errorMsg.set('Please enter your name.'); return; }
    if (!this.joinCode.trim()) { this.errorMsg.set('Please enter the room code.'); return; }
    this.online.joinRoom(this.joinCode.trim(), this.joinName.trim());
  }

  startGame(): void {
    const room = this.currentRoom();
    if (room) this.online.startRoom(room.roomId);
  }

  goBack(): void {
    if (this.view() === 'waiting' || this.view() === 'select') {
      this.online.disconnect();
      this.router.navigate(['/home']);
    } else {
      this.view.set('select');
      this.errorMsg.set('');
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }
}
