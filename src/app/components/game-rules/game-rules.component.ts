import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-game-rules',
  templateUrl: './game-rules.component.html',
  styleUrls: ['./game-rules.component.scss'],
})
export class GameRulesComponent {
  rules = [
    `The game takes place in a n * m board, where n and m is configured by the host`,
    `For each cell in the board, we define a critical mass. The critical mass is equal to the number of adjacent cells. That would be 4 for usual cells, 3 for cells in the edge and 2 for cells in the corner`,
    `Every cell starts empty. Players take turns placing orbs of their own color, and a player can only place an orb in a cell that's either empty or already holds orbs of their color. Placing several orbs in the same cell makes them stack up.`,
    `The orbs for a specific cell start to vibrate when the count of orbs in that cell equals to (critical mass - 1). Which means the cell is at it's max capacity`,
    `When a cell is loaded with a number of orbs equal to its critical mass, the stack immediately explodes. As a result of the explosion, to each of the orthogonally adjacent ells, an orb is added and the initial cell looses as many orbs as its critical mass. The explosions might result in overloading of an adjacent cell and the chain reaction of explosion continues until every cell is stable.`,
    `When a cell explodes, any neighboring cells it spreads into are converted to the exploding cell's color, with all the usual explosion rules still applying as the chain continues.`,
    `The winner is the one who eliminates every other player's orbs.`,
  ];

  constructor(private router: Router) {}

  goBack() { this.router.navigate(['/home']); }
}
