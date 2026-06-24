import { v4 as uuidv4 } from 'uuid';
import { PLAYER_COLORS, ServerPlayer, ServerRoom, WireRoomState } from './types';

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export class RoomManager {
  private rooms = new Map<string, ServerRoom>();
  private codeToId = new Map<string, string>();

  createRoom(
    hostSocketId: string,
    hostName: string,
    rowCnt: number,
    colCnt: number,
    maxPlayers: number,
  ): ServerRoom {
    const id = uuidv4();
    const code = this.generateUniqueCode();
    const hostPlayer: ServerPlayer = {
      socketId: hostSocketId,
      playerInd: 0,
      color: PLAYER_COLORS[0],
      name: hostName || 'Player 1',
    };
    const room: ServerRoom = {
      id,
      code,
      hostSocketId,
      players: [hostPlayer],
      rowCnt: Math.min(8, Math.max(5, rowCnt)),
      colCnt: Math.min(8, Math.max(5, colCnt)),
      maxPlayers: Math.min(7, Math.max(2, maxPlayers)),
      started: false,
    };
    this.rooms.set(id, room);
    this.codeToId.set(code, id);
    return room;
  }

  joinRoom(code: string, socketId: string, playerName: string): ServerRoom | null {
    const id = this.codeToId.get(code.toUpperCase());
    if (!id) return null;
    const room = this.rooms.get(id);
    if (!room || room.started || room.players.length >= room.maxPlayers) return null;
    const playerInd = room.players.length;
    room.players.push({
      socketId,
      playerInd,
      color: PLAYER_COLORS[playerInd],
      name: playerName || `Player ${playerInd + 1}`,
    });
    return room;
  }

  startRoom(roomId: string, hostSocketId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room || room.started || room.hostSocketId !== hostSocketId || room.players.length < 2) {
      return false;
    }
    room.started = true;
    return true;
  }

  getRoom(roomId: string): ServerRoom | undefined {
    return this.rooms.get(roomId);
  }

  getRoomBySocketId(socketId: string): ServerRoom | undefined {
    for (const room of this.rooms.values()) {
      if (room.players.some((p) => p.socketId === socketId)) return room;
    }
    return undefined;
  }

  removePlayer(socketId: string): { room: ServerRoom; playerInd: number } | null {
    const room = this.getRoomBySocketId(socketId);
    if (!room) return null;
    const player = room.players.find((p) => p.socketId === socketId);
    if (!player) return null;
    room.players = room.players.filter((p) => p.socketId !== socketId);
    if (room.players.length === 0) {
      this.rooms.delete(room.id);
      this.codeToId.delete(room.code);
    } else if (room.hostSocketId === socketId) {
      room.hostSocketId = room.players[0].socketId;
    }
    return { room, playerInd: player.playerInd };
  }

  getRoomState(room: ServerRoom): WireRoomState {
    return {
      roomId: room.id,
      code: room.code,
      hostSocketId: room.hostSocketId,
      players: room.players.map((p) => ({ ...p })),
      rowCnt: room.rowCnt,
      colCnt: room.colCnt,
      maxPlayers: room.maxPlayers,
      started: room.started,
    };
  }

  private generateUniqueCode(): string {
    let code: string;
    do {
      code = Array.from(
        { length: 4 },
        () => CHARS[Math.floor(Math.random() * CHARS.length)],
      ).join('');
    } while (this.codeToId.has(code));
    return code;
  }
}
