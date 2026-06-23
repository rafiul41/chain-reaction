export interface Point {
  x: number,
  y: number
}

export interface Grid {
  cellWidth: number, // Square cell
  rowCnt: number,
  colCnt: number,
  width: number,
  height: number,
  padding: number
}

export interface Cell {
  maxBallCnt: number,
  color: string,
  balls: Ball[]
}

export interface Ball {
  startX: number,
  startY: number,
  currX: number,
  currY: number,
  radius: number,
  isVibrating: boolean,
  vibrationSpeed: number
}

export type Direction = 'U' | 'D' | 'R' | 'L';
export interface TransitionBall {
  startR: number,
  startC: number,
  currX: number,
  currY: number,
  dir: Direction,
  endX: number,
  endY: number,
  endR: number,
  endC: number,
  radius: number
}

export interface Player {
  color: string;
  name: string;
  cellCnt: number;
}

// Returned by GameEngineService.addBallToCell when a burst occurs.
// The component uses this to spawn TransitionBalls for animation.
export interface BurstResult {
  neighbors: Array<{ r: number; c: number; dir: Direction }>;
}

// Represents a player's move — the unit that will travel over WebSocket.
export interface PlayerMove {
  playerInd: number;
  row: number;
  col: number;
}