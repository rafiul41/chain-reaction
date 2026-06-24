export const PLAYER_COLORS = [
  'red', 'green', 'blue', 'white', 'deeppink', 'maroon', 'cyan'
];

export interface ServerPlayer {
  socketId: string;
  playerInd: number;
  color: string;
  name: string;
}

export interface ServerRoom {
  id: string;
  code: string;
  hostSocketId: string;
  players: ServerPlayer[];
  rowCnt: number;
  colCnt: number;
  maxPlayers: number;
  started: boolean;
}

// Wire format — defined independently of Angular interfaces.ts
export interface WirePlayer {
  socketId: string;
  playerInd: number;
  color: string;
  name: string;
}

export interface WireRoomState {
  roomId: string;
  code: string;
  hostSocketId: string;
  players: WirePlayer[];
  rowCnt: number;
  colCnt: number;
  maxPlayers: number;
  started: boolean;
}

export interface WireCreateRoom {
  playerName: string;
  rowCnt: number;
  colCnt: number;
  maxPlayers: number;
}

export interface WireJoinRoom {
  code: string;
  playerName: string;
}

export interface WireMovePayload {
  roomId: string;
  row: number;
  col: number;
}

export interface WireMoveBroadcast {
  row: number;
  col: number;
  playerInd: number;
}
