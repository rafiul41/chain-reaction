import { Server, Socket } from 'socket.io';
import { RoomManager } from './room-manager';
import { WireCreateRoom, WireJoinRoom, WireMovePayload } from './types';

export function registerSocketHandlers(
  io: Server,
  socket: Socket,
  roomManager: RoomManager,
): void {
  socket.on('room:create', (payload: WireCreateRoom) => {
    const room = roomManager.createRoom(
      socket.id,
      payload.playerName,
      payload.rowCnt,
      payload.colCnt,
      payload.maxPlayers,
    );
    socket.join(room.id);
    socket.emit('room:created', roomManager.getRoomState(room));
  });

  socket.on('room:join', (payload: WireJoinRoom) => {
    const room = roomManager.joinRoom(payload.code, socket.id, payload.playerName);
    if (!room) {
      socket.emit('room:error', { message: 'Room not found, full, or already started.' });
      return;
    }
    socket.join(room.id);
    socket.emit('room:joined', roomManager.getRoomState(room));
    io.to(room.id).emit('room:updated', roomManager.getRoomState(room));
  });

  socket.on('room:start', ({ roomId }: { roomId: string }) => {
    const started = roomManager.startRoom(roomId, socket.id);
    if (!started) {
      socket.emit('room:error', {
        message: 'Cannot start: need at least 2 players or you are not the host.',
      });
      return;
    }
    const room = roomManager.getRoom(roomId)!;
    io.to(room.id).emit('room:started', roomManager.getRoomState(room));
  });

  socket.on('game:move', (payload: WireMovePayload) => {
    const room = roomManager.getRoom(payload.roomId);
    if (!room || !room.started) return;
    const player = room.players.find((p) => p.socketId === socket.id);
    if (!player) return;
    // Relay to everyone else — sender already applied the move locally
    socket.to(room.id).emit('game:move_broadcast', {
      row: payload.row,
      col: payload.col,
      playerInd: player.playerInd,
    });
  });

  socket.on('disconnect', () => {
    const result = roomManager.removePlayer(socket.id);
    if (!result) return;
    const { room, playerInd } = result;
    if (room.players.length === 0) return;
    io.to(room.id).emit('room:player_disconnected', { playerInd });
  });
}
