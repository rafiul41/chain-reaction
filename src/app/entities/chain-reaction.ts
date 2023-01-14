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
  padding: number // padding from all sides
}

export interface Ball {
  startX: number,
  startY: number,
  isMoving: boolean,
  radius: number,
  wallDistFromCenter: number,
  motionSpeed: number,
  color: string,
}