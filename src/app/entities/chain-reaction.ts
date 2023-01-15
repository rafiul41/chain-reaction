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
  ballCnt: number,
  balls: Ball[]
}

export interface Ball {
  startX: number,
  startY: number,
  currX: number,
  currY: number,
  radius: number,
  wallDistFromCenter: number,
  color: string
  isMoving: boolean,
  motionSpeed: number,
  isVibrating: boolean,
  vibrationSpeed: number
}