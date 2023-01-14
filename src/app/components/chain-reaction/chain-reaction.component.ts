import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Ball, Grid, Point } from '../../entities/chain-reaction';

@Component({
  selector: 'app-chain-reaction',
  templateUrl: './chain-reaction.component.html',
  styleUrls: ['./chain-reaction.component.scss']
})
export class ChainReactionComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: true })
  canvas: ElementRef<HTMLCanvasElement>;
  
  ctx: CanvasRenderingContext2D | null;

  animationId: any;

  grid: Grid;
  balls: Ball[];

  constructor() {}

  ngOnInit(): void {
    this.initializeGridAndCanvas();
    this.drawGrid();
  }

  initializeGridAndCanvas() {
    this.grid = {
      rowCnt: 5,
      colCnt: 5,
      cellWidth: 100,
      width: 0,
      height: 0,
      padding: 5
    }
    let canvasWidth = this.grid.cellWidth * this.grid.colCnt + (2 * this.grid.padding);
    let canvasHeight = this.grid.cellWidth * this.grid.rowCnt + (2 * this.grid.padding);
    this.canvas.nativeElement.width = canvasWidth;
    this.canvas.nativeElement.height = canvasHeight;
    this.grid.width = canvasWidth;
    this.grid.height = canvasHeight;
    this.ctx = this.canvas.nativeElement.getContext('2d');
  }

  drawGrid() {
    if(this.ctx) {
      this.ctx.fillStyle = 'black';
      this.ctx.fillRect(0, 0, this.grid.width, this.grid.height);
    }
    // vertical Lines
    for(let i = 0; i < this.grid.colCnt + 1; i++) {
      let startX = (i * this.grid.cellWidth) + this.grid.padding;
      let startY = this.grid.padding;
      let endX = (i * this.grid.cellWidth) + this.grid.padding;
      let endY = this.grid.height + this.grid.padding;
      this.drawLine({x: startX, y: startY}, {x: endX, y: endY}, 'white')
    }

    // horizontal Lines
    for(let i = 0; i < this.grid.rowCnt + 1; i++) {
      let startX = this.grid.padding;
      let startY = (i * this.grid.cellWidth) + this.grid.padding;
      let endX = this.grid.width + this.grid.padding;
      let endY = (i * this.grid.cellWidth) + this.grid.padding;
      this.drawLine({x: startX, y: startY}, {x: endX, y: endY}, 'white')
    }
  }

  drawLine(start: Point, end: Point, color: string) {
    if(this.ctx) {
      this.ctx.beginPath();
      this.ctx.moveTo(start.x, start.y);
      this.ctx.lineTo(end.x, end.y);
      this.ctx.strokeStyle = color;
      this.ctx.stroke();
    }
  }

  animate() {
    this.ctx?.clearRect(0, 0, this.grid.width, this.grid.height);
    this.animationId = requestAnimationFrame(() => this.animate);
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationId);
  }
}
