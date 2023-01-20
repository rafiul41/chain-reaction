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

export enum SPEED {
  VIBRATION_MOD = 10,
  TRANSITION_BALL_SPEED = 1
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
  balls: Ball[]
}

export interface Ball {
  startX: number,
  startY: number,
  currX: number,
  currY: number,
  radius: number,
  color: string,
  isVibrating: boolean,
  vibrationSpeed: number
}

export interface TransitionBall {
  startX: number,
  startY: number,
  currX: number,
  currY: number,
  dir: string,
  endX: number,
  endY: number,
  radius: number,
  color: string
}