import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';
import { OnlineMoveBroadcast, RoomState } from '../utility/interfaces';

@Injectable({ providedIn: 'root' })
export class OnlineGameService implements OnDestroy {
  private socket: Socket | null = null;

  readonly roomCreated$ = new Subject<RoomState>();
  readonly roomJoined$ = new Subject<RoomState>();
  readonly roomUpdated$ = new Subject<RoomState>();
  readonly roomStarted$ = new Subject<RoomState>();
  readonly roomError$ = new Subject<{ message: string }>();
  readonly moveBroadcast$ = new Subject<OnlineMoveBroadcast>();
  readonly playerDisconnected$ = new Subject<{ playerInd: number }>();

  mySocketId = '';
  myPlayerInd = -1;
  currentRoom: RoomState | null = null;

  constructor(private ngZone: NgZone) {}

  connect(): void {
    if (this.socket?.connected) return;
    this.socket = io(environment.serverUrl);
    this.socket.on('connect', () => {
      this.ngZone.run(() => { this.mySocketId = this.socket!.id!; });
    });
    this.socket.on('room:created', (d: RoomState) => {
      this.ngZone.run(() => {
        this.currentRoom = d;
        this.myPlayerInd = 0;
        this.roomCreated$.next(d);
      });
    });
    this.socket.on('room:joined', (d: RoomState) => {
      this.ngZone.run(() => {
        this.currentRoom = d;
        this.myPlayerInd = d.players.find((p) => p.socketId === this.mySocketId)?.playerInd ?? -1;
        this.roomJoined$.next(d);
      });
    });
    this.socket.on('room:updated', (d: RoomState) => {
      this.ngZone.run(() => {
        this.currentRoom = d;
        this.roomUpdated$.next(d);
      });
    });
    this.socket.on('room:started', (d: RoomState) => {
      this.ngZone.run(() => {
        this.currentRoom = d;
        this.roomStarted$.next(d);
      });
    });
    this.socket.on('room:error', (d: { message: string }) => {
      this.ngZone.run(() => this.roomError$.next(d));
    });
    this.socket.on('game:move_broadcast', (d: OnlineMoveBroadcast) => {
      this.ngZone.run(() => this.moveBroadcast$.next(d));
    });
    this.socket.on('room:player_disconnected', (d: { playerInd: number }) => {
      this.ngZone.run(() => this.playerDisconnected$.next(d));
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
    this.mySocketId = '';
    this.myPlayerInd = -1;
    this.currentRoom = null;
  }

  createRoom(playerName: string, rowCnt: number, colCnt: number, maxPlayers: number): void {
    this.socket?.emit('room:create', { playerName, rowCnt, colCnt, maxPlayers });
  }

  joinRoom(code: string, playerName: string): void {
    this.socket?.emit('room:join', { code: code.toUpperCase(), playerName });
  }

  startRoom(roomId: string): void {
    this.socket?.emit('room:start', { roomId });
  }

  makeMove(roomId: string, row: number, col: number): void {
    this.socket?.emit('game:move', { roomId, row, col });
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
