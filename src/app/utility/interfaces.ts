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

export interface TransitionBall {
  startR: number,
  startC: number,
  currX: number,
  currY: number,
  dir: string,
  endX: number,
  endY: number,
  endR: number,
  endC: number,
  radius: number
}