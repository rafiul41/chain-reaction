import { COLOR } from './enums';
import { Ball, Grid, Point, TransitionBall } from './interfaces';

export function drawLine(start: Point, end: Point, color: string, ctx: CanvasRenderingContext2D | null) {
  if (ctx) {
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = color;
    ctx.stroke();
  }
}

export function drawBall(ball: Ball | TransitionBall, color: string, ctx: CanvasRenderingContext2D | null) {
  if (!ctx) return;
  ctx.beginPath();
  ctx.arc(ball.currX, ball.currY, ball.radius, 0, 2 * Math.PI, false);
  ctx.fillStyle = color;
  ctx.fill();
}

export function isRowColValid(row: number, col: number, grid: Grid) {
  return (
    row >= 0 && row < grid.rowCnt && col >= 0 && col < grid.colCnt
  );
}

export function isCornerCell(row: number, col: number, grid: Grid) {
  return (
    (row === 0 && col === 0) ||
    (row === 0 && col === grid.colCnt - 1) ||
    (row === grid.rowCnt - 1 && col === 0) ||
    (row === grid.rowCnt - 1 && col === grid.colCnt - 1)
  );
}

export function isEdgeCell(row: number, col: number, grid: Grid) {
  return (
    (!isCornerCell(row, col, grid) && row === 0) ||
    col === 0 ||
    row === grid.rowCnt - 1 ||
    col === grid.colCnt - 1
  );
}

export function isMiddleCell(row: number, col: number, grid: Grid) {
  return !isCornerCell(row, col, grid) && !isEdgeCell(row, col, grid);
}

export function getBallCoordinates(row: number, col: number, grid: Grid): Point {
  return {
    x: col * grid.cellWidth + grid.cellWidth / 2 + grid.padding,
    y: row * grid.cellWidth + grid.cellWidth / 2 + grid.padding
  }
}

export function drawGrid(grid: Grid , ctx: CanvasRenderingContext2D | null) {
  if (ctx) {
    ctx.fillStyle = COLOR.BLACK;
    ctx.fillRect(0, 0, grid.width, grid.height);
  }
  // vertical Lines
  for (let i = 0; i < grid.colCnt + 1; i++) {
    let startX = i * grid.cellWidth + grid.padding;
    let startY = grid.padding;
    let endX = i * grid.cellWidth + grid.padding;
    let endY = grid.height - grid.padding;
    drawLine({ x: startX, y: startY }, { x: endX, y: endY }, COLOR.WHITE, ctx);
  }

  // horizontal Lines
  for (let i = 0; i < grid.rowCnt + 1; i++) {
    let startX = grid.padding;
    let startY = i * grid.cellWidth + grid.padding;
    let endX = grid.width - grid.padding;
    let endY = i * grid.cellWidth + grid.padding;
    drawLine({ x: startX, y: startY }, { x: endX, y: endY }, COLOR.WHITE, ctx);
  }
}