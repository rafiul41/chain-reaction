export enum COLOR {
  RED = 'red',
  GREEN = 'green',
  BLUE = 'blue',
  WHITE = 'white',
  PINK = 'pink',
  BROWN = 'brown',
  CYAN = 'cyan',
  BLACK = 'black'
}

export enum GRID {
  ROW_CNT = 2,
  COL_CNT = 2,
  CELL_WIDTH = 100,
  PADDING = 5
}

export enum SPEED {
  VIBRATION_MOD = 10,
  TRANSITION_BALL_SPEED = 5
}

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